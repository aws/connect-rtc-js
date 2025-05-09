import uuid from "uuid/v4";
import StandardStrategy from "./strategies/StandardStrategy";
import CCPInitiationStrategyInterface from "./strategies/CCPInitiationStrategyInterface";
import RtcSession from "./rtc_session";
import {IllegalParameters} from "./exceptions";
import {assertTrue, getUserAgentData, hitch, isFunction, isFirefoxBrowser, wrapLogger} from "./utils";
import {
    DEFAULT_ICE_CANDIDATE_POOL_SIZE,
    NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS, RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS, RTC_PEER_CONNECTION_OPTIONAL_CONFIG,
    RTC_SESSION_STATE,
    SOFTPHONE_ROUTE_KEY,
    ICE_CONNECTION_STATE
} from "./rtc_const";

export default class RtcPeerConnectionManager {

    /**
     * Create a PeerConnectionManager which manages the life cycle of RTCSession and peer connection
     * It will be initialized when agent logs into the CCP and be responsible for creating and closing peer connection and RTCSession
     *
     * @constructor
     * @param {string} signalingUri - signalingUri get from call config. (optional, param for CCPv1)
     * @param {*} iceServers - ice server credentials
     * @param {*} transportHandle - a callback function which returns a promise which is going to return the iceServers.
     * @param {*} publishError - a function which publishs errors on CCP.
     * @param {string} clientId - uuid for softphone client
     * @param {string} contactToken - contactoken sent from service side  (optional)
     * @param {object} logger - An object provides logging functions, such as console
     * @param {string} contactId - ContactId which uniquely identifies the session. (optional)
     * @param {string} connectionId - Represents media connection id (optional)
     * @param {string} wssManager - websocket manager
     * @param {object} strategy - VDI strategy indicates which WebRTC SDK to use: standard, Citrix, WorkSpace (optional, default to be standardStrategy)
     * @param {boolean} isPPCEnabled - flag indicates if persistent connection is enabled in agent configuration
     * @param {string} browserId - browser identifier read from local storage and is used for browser refresh and ICE restart
     */
    constructor(signalingUri, iceServers, transportHandle, publishError, clientId, contactToken, logger, contactId, connectionId, wssManager, strategy = new StandardStrategy(), isPPCEnabled, browserId) {
        // Check if a peer connection manager has already existed
        if (!RtcPeerConnectionManager.instance) {
            // check if transportHandle is function
            assertTrue(isFunction(transportHandle), 'transportHandle must be a function');
            // check if publishError is function
            assertTrue(isFunction(publishError), 'publishError must be a function');
            // check if logger is provided
            if (!logger || typeof logger !== 'object') {
                throw new IllegalParameters('logger required');
            }
            // check if contactId is provided
            if (!contactId) {
                // if not provided will create an uuid
                this._callId = uuid();
            } else {
                this._callId = contactId;
            }

            if (!connectionId) {
                // if not provided will create an uuid
                this._connectionId = uuid();
            } else {
                this._connectionId = connectionId;
            }

            if (!(strategy instanceof CCPInitiationStrategyInterface)) {
                throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
            }

            this._strategy = strategy;
            this._wssManager = wssManager;
            this._signalingUri = signalingUri;
            this._iceServers = iceServers;
            this._contactToken = contactToken;
            this._originalLogger = logger;
            this._logger = wrapLogger(this._originalLogger, '', 'RtcPeerConnectionManager');
            this._isPPCEnabled = isPPCEnabled;
            this._isRTPSAllowlisted = false; // RTPSAllowlisted flag is false by default
            this._peerConnectionId = null;
            this._browserId = browserId;
            this._clientId = clientId;

            this._requestIceAccess = transportHandle;
            this._publishError = publishError;
            this._initializeWebSocketEventListeners();
            this.requestPeerConnection().then(() => { // request peer connection when initializing RtcPeerConnectionManager
                if (this.isPersistentConnectionEnabled() && !this._contactToken) {
                    this.createSession();
                    this._rtcSessionConnectPromise = this.connect();
                }
            });
            this._networkConnectivityChecker();
            RtcPeerConnectionManager.instance = this;
            this._logger.info("Initializing Peer Connection Manager...");
            this._logger.log("RTC.js is using " + strategy.getStrategyName());
        } else {
            logger.info("Peer Connection Manager has already been initialized");
        }
        this.browserTabCloseEventListener();
        return RtcPeerConnectionManager.instance;
    }

    /** Check if current browser supports standby/early peer connection or not.
     * If persistent peer connection is enabled, standby peer will be disabled.
     * @returns {*|boolean}
     * @private
     */
    _isEarlyMediaConnectionSupported() {
        if (!this.isPersistentConnectionEnabled()) {
            return this._strategy._isEarlyMediaConnectionSupported();
        }
        return false;
    }

    /** This function handles the idleConnection and quota limits notification from the server
     *
     * @param event
     * @private
     */
    _webSocketManagerOnMessage(event) {
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (content && this._clientId === content.clientId) {
            if (content.jsonRpcMsg.method === "idleConnection") {
                this._clearIdleRtcPeerConnection();
            } else if (content.jsonRpcMsg.method === "quotaBreached") {
                this._logger.log("Number of active sessions are more then allowed limit for the client " + this._clientId);
                this._closeIdleRTCPeerConnection();
                this._publishError("multiple_softphone_active_sessions", "Number of active sessions are more then allowed limit.");
            }
        }
    }

    /**
     * This monitors the Softphone webSocket events
     * @private
     */
    _initializeWebSocketEventListeners() {
        this._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        this._unSubscribe = this._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(this, this._webSocketManagerOnMessage));
    }

    /**
     * Function to get RTCPeerConnection.
     * When persistent connection is enabled. If no RTCPeerConnection exists, it will create a new RTCPeerConnection
     *
     * @returns {RTCPeerConnection}
     */
    getPeerConnection() {
        var self = this;
        var pc;
        if (self.isPersistentConnectionEnabled()) {
            pc = self._pc;
            if (pc === null || pc === undefined) {
                pc = self._createRtcPeerConnection(this._iceServers);
            }
        } else {
            pc = self._idlePc;
            self._idlePc = null;
            if (pc === null || pc === undefined) {
                pc = self._createRtcPeerConnection(this._iceServers);
            }
            self.clearIdleRtcPeerConnectionTimerId();
            self.requestPeerConnection();
        }
        self._pc = pc;
        return pc;
    }

    /**
     * Clear standby/idle peer connection refresh timer
     */
    clearIdleRtcPeerConnectionTimerId() {
        var self = this;
        if (self._idleRtcPeerConnectionTimerId) {
            clearTimeout(self._idleRtcPeerConnectionTimerId);
            self._idleRtcPeerConnectionTimerId = null;
        }
    }

    /**
     * When persistent connection is enabled, it creates the persistent peer connection
     * When persistent connection is disabled and early media connection is supported,
     * it creates a standby/ideal peer connection which can be used when a call arrives
     */
    async requestPeerConnection() {
        var self = this;
        self._earlyMediaConnectionSupported = self._isEarlyMediaConnectionSupported();
        if (self.isPersistentConnectionEnabled() && !self._contactToken) {
            // When requesting a peer connection with persistent connection enabled, it only creates new pc if no contact exist.
            self._logger.info("RtcPeerConnectionManager initiates persistent peer connection");
            const response = await self._requestIceAccess().catch((error) => {
                self._logger.info("RtcPeerConnectionManager request ICE access failed for persistent peer connection creation. ", error);
            });
            self._iceServers = response;
            self._pc = self._createRtcPeerConnection(response);
        } else if ((!self.isPersistentConnectionEnabled()) && !self._peerConnectionRequestInFlight && self._earlyMediaConnectionSupported) {
            self._logger.info("RtcPeerConnectionManager initiates idle peer connection for non-persistent connection");
            self._peerConnectionRequestInFlight = true;
            self._requestIceAccess().then(function (response) {
                self._idlePc = self._createRtcPeerConnection(response);
                self._peerConnectionRequestInFlight = false;
                self._idleRtcPeerConnectionTimerId = setTimeout(hitch(self, self._refreshRtcPeerConnection), RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
            },
            // eslint-disable-next-line no-unused-vars
            function (reason) {
                self._peerConnectionRequestInFlight = false;
            }).catch((error) => {
                self._logger.info("RtcPeerConnectionManager request ICE access failed for idle peer connection creation. ", error);
            });
        }
    }

    /**
     * Check network connectivity in every 250 ms
     * @private
     */
    _networkConnectivityChecker() {
        var self = this;
        setInterval(function () {
            if (!navigator.onLine && self._idlePc) {
                self._logger.log("Network offline. Cleaning up early connection");
                self._idlePc.close();
                self._idlePc = null;
            }
        }, NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS);
    }

    /**
     * Create RTCPeerConnection via WebRTC API or VDI WebRTC redirection SDK
     * @param iceServers
     * @returns {RTCPeerConnection}
     * @private
     */
    _createRtcPeerConnection(iceServers) {
        var rtcPeerConnectionConfig = JSON.parse(JSON.stringify(RTC_PEER_CONNECTION_CONFIG));
        rtcPeerConnectionConfig.iceServers = iceServers;
        rtcPeerConnectionConfig.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
        return this._strategy._createRtcPeerConnection(rtcPeerConnectionConfig, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
    }

    /**
     * Clear the standby/Idle peer connection
     * @private
     */
    _clearIdleRtcPeerConnection() {
        this._logger.log("session is idle from long time. closing the peer connection for client " + this._clientId);
        this._closeIdleRTCPeerConnection();
    }

    /**
     * Refresh standby/ideal peer connection
     * @private
     */
    _refreshRtcPeerConnection() {
        this._idleRtcPeerConnectionTimerId = null;
        this._clearIdleRtcPeerConnection();
        this._logger.log("RtcPeerConnectionManager is refreshing peer connection for client " + this._clientId);
        this.requestPeerConnection();
    }


    _closeIdleRTCPeerConnection() {
        if (this._idlePc) {
            this._idlePc.close();
            this._idlePc = null;
        }
    }

    // Clear idle peer connection timer first and then close the idle peer connection.
    closeEarlyMediaConnection() {
        this._logger.log("close method invoked. Clear timer and close idle peer connection " + this._clientId);
        this.clearIdleRtcPeerConnectionTimerId();
        this._closeIdleRTCPeerConnection();
    }

    get signalingUri() {
        return this._signalingUri;
    }
    set signalingUri(signalingUri) {
        this._signalingUri = signalingUri;
    }

    get iceServers() {
        return this._iceServers;
    }
    set iceServers(iceServers) {
        this._iceServers = iceServers;
    }

    get contactToken() {
        return this._contactToken;
    }
    set contactToken(contactToken) {
        this._contactToken = contactToken;
    }

    get logger() {
        return this._logger;
    }
    set logger(logger) {
        this._logger = logger;
    }

    get callId() {
        return this._callId;
    }
    set callId(callId) {
        this._callId = callId;
    }

    get connectionId() {
        return this._connectionId;
    }
    set connectionId(connectionId) {
        this._connectionId = connectionId;
    }

    get wssManager() {
        return this._wssManager;
    }
    set wssManager(wssManager) {
        this._wssManager = wssManager;
    }

    get strategy() {
        return this._strategy;
    }
    set strategy(strategy) {
        this._strategy = strategy;
    }

    get isPPCEnabled() {
        return this._isPPCEnabled;
    }
    set isPPCEnabled(isPPCEnabled) {
        this._isPPCEnabled = isPPCEnabled;
    }

    get isRTPSAllowlisted() {
        return this._isRTPSAllowlisted;
    }
    set isRTPSAllowlisted(isRTPSAllowlisted) {
        this._isRTPSAllowlisted = isRTPSAllowlisted;
    }


    get browserId() {
        return this._browserId;
    }
    set browserId(browserId) {
        this._browserId = browserId;
    }

    get peerConnectionId() {
        return this._peerConnectionId;
    }

    set peerConnectionId(peerConnectionId) {
        this._peerConnectionId = peerConnectionId;
    }

    get peerConnectionToken() {
        return this._peerConnectionToken;
    }

    set peerConnectionToken(peerConnectionToken) {
        this._peerConnectionToken = peerConnectionToken;
    }

    get inactivityDuration() {
        return this._inactivityDuration;
    }

    set inactivityDuration(inactivityDuration) {
        this._inactivityDuration = inactivityDuration;
    }


    /**
     * create a rtcSession object if none exists
     *
     * @return {RtcSession} rtcSession
     */
    createSession(callId, iceServers, contactToken, connectionId, wssManager, rtcJsStrategy = new StandardStrategy()) {
        this._callId = callId ? callId : this._callId;
        this._iceServers = iceServers ? iceServers : this._iceServers;
        this._contactToken = contactToken ? contactToken : this._contactToken;
        this._connectionId = connectionId ? connectionId : this._connectionId;
        this._wssManager = wssManager ? wssManager : this._wssManager;
        this._strategy = rtcJsStrategy ? rtcJsStrategy : this._strategy;

        this._logger.info("PeerConnectionManager creates RtcSession");
        this._logger = wrapLogger(this._originalLogger, this._callId, 'RtcPeerConnectionManager');
        this._rtcSession = new RtcSession(
            this._signalingUri,
            this._iceServers,
            this._contactToken,
            this._logger,
            this._callId,
            this._connectionId,
            this._wssManager,
            this._strategy,
            this
        );

        // ontrack event will only be triggered once during the process of establishing the persistent connection.
        // This event won't be trigger when a call arrives at CCP with persistent connection enabled
        // So we need to attach remoteAudioElement when we initiate the persistent connection. TODO: We can move this to StreamsJS as a followup CR
        if (this.isPersistentConnectionEnabled()) {
            this._rtcSession.remoteAudioElement = document.getElementById('remote-audio') || window.parent.parent.document.getElementById('remote-audio');
            this._remoteAudioElement = this._rtcSession.remoteAudioElement;
        }
        return this._rtcSession;
    }

    /**
     * get rtcSession object
     *
     * @return {RtcSession} rtcSession manages by the peer connection manager
     */
    getSession() {
        return this._rtcSession;
    }

    /**
     * This method aims to create a new peer connection or connect to the existing peer connection
     * which will start the signaling process
     *
     * @param {RTCPeerConnection} pc - An existing peer connection, it could be persistent peer connection
     * or a standby peer connection (optional)
     */
    async connect() {
        var self = this;
        // check if the previous rtcSession.connect promise is fulfilled or not
        if (self._rtcSessionConnectPromise) {
            try {
                await self._rtcSessionConnectPromise;
            } catch(e) {
                // notify softphoneManger the current rtcSession is failed to trigger the retry strategy on SoftphoneManager side
                this._rtcSession._onSessionFailed(this._rtcSession, e.name);
                self._rtcSession = null;
                self.destroy();
                self._contactToken = null;
                self._iceServers = null;
                self._callId = null;
                return;
            } finally {
                self._rtcSessionConnectPromise = null;
            }
        }

        // reset inactivity timer before RTCSession state transition
        if (self._inactivityTimer) {
            self.clearInactivityTimer();
        }

        // add session failed event handler
        const onSessionFailedHandler = self._rtcSession._onSessionFailed;
        self._rtcSession.onSessionFailed = function (rtcSession, reason) {
            self.logger.error("Peer connection manager detects RtcSession failure: " + reason);
            // wrap the existing handler which is created in softphone manager
            if (onSessionFailedHandler) {
                onSessionFailedHandler(rtcSession, reason);
            }
            // clear local RtcSession
            self._rtcSession = null;
            self._iceServers = null;
            // close signaling channel and peer connection
            self.destroy(); // call destroy method before clean contactToken and callId
            self._contactToken = null;
            self._callId = null;
        };

        // add session completed event handler
        const onSessionCompletedHandler = self._rtcSession._onSessionCompleted;
        self._rtcSession.onSessionCompleted = function (rtcSession) {
            self.logger.info("Peer connection manager detects RtcSession completed. Performing health check to decide if we want to keep the peer connection");
            // wrap the existing handler which is created in softphone manager
            if (onSessionCompletedHandler) {
                onSessionCompletedHandler(rtcSession);
            }
            if (self._signalingChannel._state.name === "FailedState"
                || self._pc.iceConnectionState === ICE_CONNECTION_STATE.FAILED
                || self._pc.iceConnectionState === ICE_CONNECTION_STATE.DISCONNECTED
                || self._pc.iceConnectionState === ICE_CONNECTION_STATE.CLOSED
            ) {
                self.logger.error("Peer connection manager detected unhealthy connection at call ends, tearing down the connection");
                // clear local RtcSession
                self._rtcSession = null;
                self._iceServers = null;
                // close signaling channel and peer connection
                self.destroy();
                self._contactToken = null;
                self._callId = null;
            }
        };

        // add signaling remote hangup listener
        self._rtcSession._signalingRemoteHungup = function () {
            self.hangup();
        }

        if (!this._userAgentData) {
            this._userAgentData = await getUserAgentData().catch(error => {
                self.logger.error("Peer connection manager failed to get user agent data", error);
              });
        }
        // Add useragent to rtcSession report
        this._rtcSession._sessionReport.userAgentData = JSON.stringify(this._userAgentData);


        const pc = this.getPeerConnection();
        this._rtcSession.connect(pc);

        return new Promise((resolve, reject) => {
            // resolve the Promise when signaling handshake is completed
            const signalingHandshaked = hitch(self._rtcSession, self._rtcSession._signalingHandshaked);
            self._rtcSession._signalingHandshaked = async () => {
                signalingHandshaked();
                resolve();
            };

            // reject the Promise when signaling handshake is failed
            const signalingFailed = hitch(self._rtcSession, self._rtcSession._signalingFailed);
            self._rtcSession._signalingFailed = async (exception) => {
                signalingFailed(exception);
                reject();
            };
        });
    }

    /**
     * Start an inactivity timer for persistent connection
     *
     */
    startInactivityTimer() {
        this._logger.info("PeerConnectionManager start inactivity timer");
        this._inactivityTimer = setTimeout(() => {
            this._logger.info('Inactivity timer breached, teardown peer connection ');
            this.destroy();
        }, this._inactivityDuration);
    }

    /**
     * Reset inactivity timer for persistent connection
     */
    clearInactivityTimer() {
        this._logger.info("PeerConnectionManager clear inactivity timer");
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = null;
    }

    /**
     * Hang up the RtcSession
     */
    hangup() {
        this._logger.info("PeerConnectionManager hangs up RtcSession");
        if (this._rtcSession) {
            try {
                this._rtcSession.hangup();
            } catch (error) {
                this._logger.error("Error occurred while hanging up RtcSession:", error);
            }
        }
        this._contactToken = null;
        this._callId = null;
        this._rtcSession = null;
        if (!this.isPersistentConnectionEnabled()) {
            this._signalingChannel = null;
            this._iceServers = null;
            this._pc = null;
            this._peerConnectionId = null;
            this._peerConnectionToken = null;
            this._iceRestart = false;
        }
    }

    /**
     * Destroys the existing persistent peer connection.
     *
     * @param {string|undefined} peerConnectionId - The ID of the peer connection to destroy. 
     *        If provided, indicates that the method is triggered by a server-side PCBye.
     * 
     * This method is crucial for both RTPS allowlisted and not allowlisted paths.
     * It ensures proper cleanup of the signaling channel, which is essential because pcm.hangup is not guaranteed to be invoked.
     * TODO: refactor destroy(peerConnectionId) to destroy(shouldSendByeToServerBool=true),
     * 
     * Usage:
     * - Call with no arguments for client-initiated destruction (will send BYE to server).
     * - Call with a peerConnectionId for server-initiated destruction (will not send BYE).
     * 
     * Note: The presence of peerConnectionId is used to infer if the destroy method 
     * is triggered by a server-side event, in which case we do not send a BYE signal.
     * 
     * TODO: Refactor peerConnectionId parameter to be a boolean 'shouldSendByeToServer' with a default value of true.
     *       This should be set to false for AZ evacuation and server-side draining scenarios.
     *       In these cases, we receive a PCBYE from the server, so we don't want to send another BYE.
     */
    destroy(peerConnectionId) {
        try {
            if (this._rtcSession && (this._rtcSession._state.name === RTC_SESSION_STATE.TALKING_STATE || this._rtcSession._state.name === RTC_SESSION_STATE.CONNECT_CONTACT_STATE)) {
                this._logger.info("Peer connection is in use, PeerConnectionManager can NOT destroy persistent peer connection");
            } else if (this._pc) {   // if peer connection exists, destroy the persistent peer connection
                this._logger.info("PeerConnectionManager destroy persistent peer connection");
                if (!peerConnectionId && this._signalingChannel) {
                    // If peerConnectionId doesn't exist, we need to send a bye to the server. Otherwise, it doesn't need to send a bye since it receives the PCBye from server
                    try {
                        this._signalingChannel.bye();
                    } catch (byeError) {
                        this._logger.error("Error occurred while sending bye:", byeError);
                    }
                }
                this._signalingChannel = null;
                this._pc.close();
                this._pc = null;
                this._peerConnectionId = null;
                this._peerConnectionToken = null;
                this._iceRestart = false;
                // release media stream when existing persistent peer connection is destroyed
                if (this._mediaStream) {
                    this._mediaStream.getTracks().forEach((track) => track.stop());
                    this._mediaStream = null;
                }
                // detach remote audio stream
                if (this._remoteAudioElement) {
                    this._remoteAudioElement.srcObject = null;
                    this._remoteAudioStream = null;
                }
                this.clearInactivityTimer();
            }
        } catch (error) {
            this._logger.error("Error occurred in PeerConnectionManager destroy method:", error);
        }
    }


    handlePersistentPeerConnectionToggle(isPPCEnabled) {
        // change PPCEnabled only when agent is not in a call
        if (this._rtcSession === null && this.isPPCEnabled !== isPPCEnabled && this.isRTPSAllowlisted) {
            this.isPPCEnabled = isPPCEnabled;
            // if softphonePersistentConnection changed to true, use rtcPeerConnectionManager to initiate a new persistent peer connection
            if (this.isPPCEnabled) {
                this._logger.info("softphonePersistentConnection changed to ture, initiate a persistent peer connection").sendInternalLogToServer();
                this.activatePersistentPeerConnectionMode();
            } else {
                // if softphonePersistentConnection changed to false, use rtcPeerConnectionManager to tear down the currentpersistent peer connection
                this._logger.info("softphonePersistentConnection changed to false, destroy the existing persistent peer connection").sendInternalLogToServer();
                this.deactivatePersistentPeerConnectionMode();
            }
        }
    }

    // activate persistent connection mode by creating the persistent connection and close standby peer connection
    activatePersistentPeerConnectionMode() {
        // this.rtcJsStrategy = this.rtcJsStrategy;
        this.closeEarlyMediaConnection(); // close standby peer connection
        this.requestPeerConnection().then(() => { // request a new persistent peer connection
            this.createSession();
            this._rtcSessionConnectPromise = this.connect();
        });
    }

    // deactivate persistent connection mode by destroying the existing persistent peer connection and request for standby peer connection
    deactivatePersistentPeerConnectionMode() {
        this.destroy();
        this.requestPeerConnection();
    }


    // function which checks if persistent connection feature is enabled and allowlisted, and browser is NOT Firefox
    isPersistentConnectionEnabled() {
        return this._isPPCEnabled && this._isRTPSAllowlisted && !isFirefoxBrowser(this._userAgentData);
    }

    // This function closes the Early media connection and persistent peer connection
    close() {
        if (this.isPersistentConnectionEnabled()) {
            this.destroy();
        } else {
            this.closeEarlyMediaConnection();
        }
    }

    /** This function is to listen beforeunload event. When we receive beforeunload
     * we will send a bye from CCP to Amazon Connect, but this is very unstable, we cannot
     * guarantee send bye every time when agent close the browser tab
     *
     */
    browserTabCloseEventListener() {
        window.addEventListener('beforeunload', () => {
            this._logger.info('User leaves the page, destroy peer connection manager');
            this.destroy();
        });
    }
}
