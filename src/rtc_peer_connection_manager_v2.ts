const uuid = require("uuid/v4");
import StandardStrategy from "./strategies/StandardStrategy";
import CCPInitiationStrategyInterface from "./strategies/CCPInitiationStrategyInterface";
import SharedMediaSession from './shared_media_session';
import CallSession from './call_session';
import SignalingChannelManager from './signaling_channel_manager';
import { IllegalParameters } from "./exceptions";
import { getUserAgentData, isFirefoxBrowser, isFunction, wrapLogger } from "./utils";
import {
    DEFAULT_ICE_CANDIDATE_POOL_SIZE,
    RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_OPTIONAL_CONFIG
} from './rtc_const';
import { CITRIX_VDI_STRATEGY } from './config/constants';
import { CredentialResolver } from './credential_resolver';
import { StandbyPeerConnectionManager } from './standby_peer_connection_manager';

export default class RtcPeerConnectionManagerV2 {

    static instance: RtcPeerConnectionManagerV2 | null;

    _callId: string = '';
    _connectionId: string = '';
    _strategy: CCPInitiationStrategyInterface;
    _wssManager: any = null;
    _signalingUri: string | null = null;
    _contactToken: string | null = null;
    private _currentContactIceCredentials: RTCIceServer[] | null = null;
    _iceServers: RTCIceServer[] | null = null;
    private _originalLogger: any = null; // Logger from connect (JS, no type defs)
    _logger: any = null; // Wrapped logger from utils.wrapLogger (JS)
    _isPPCEnabled: boolean = false;
    _isRTPSAllowlisted: boolean = false;
    _peerConnectionId: string | null = null;
    _browserId: string = '';
    private _clientId: string = '';
    _isPersistentConnectionOnPageLoadEnabled: boolean = false;
    _allowExtendedPersistentConnection: boolean = false;
    _requestIceAccess: (() => Promise<RTCIceServer[]>) | null = null;
    _publishError: ((error: Error) => void) | null = null;
    private _pcmCreatedTimestamp: number = 0;
    _callSessions: Map<string, any> = new Map(); // Map<connectionId, CallSession (JS)>
    _sharedMediaSession: any = null; // SharedMediaSession (JS)
    _signalingChannelManager: any = null; // SignalingChannelManager (JS)
    _credentialResolver: CredentialResolver;
    _standbyPcManager: StandbyPeerConnectionManager;
    _pc: RTCPeerConnection | null = null;
    _mediaStream: MediaStream | null = null;
    _peerConnectionToken: string | null = null;
    _inactivityDuration: number = 0;
    _inactivityTimer: ReturnType<typeof setTimeout> | null = null;
    _userAgentData: any = null; // UserAgentData from getUserAgentData() (JS)
    private _errorHandler: ((error: Error) => void) | null = null;
    private _closed: boolean = false;
    private _lastCallEndTimestamp: number | null = null;
    _hasEverCreatedSharedMediaSession: boolean = false;

    /**
     * Constructor for RtcPeerConnectionManagerV2
     * @param {Object} config - Configuration object for RtcPeerConnectionManagerV2
     */
    constructor(config: any) {
        if (!RtcPeerConnectionManagerV2.instance) {
            // Validate config is provided
            if (!config) {
                throw new IllegalParameters('config is required');
            }

            // Validate required config properties
            if (!isFunction(config.transportHandle)) {
                throw new IllegalParameters('transportHandle must be a function');
            }

            if (!isFunction(config.publishError)) {
                throw new IllegalParameters('publishError must be a function');
            }

            if (!config.logger || typeof config.logger !== 'object') {
                throw new IllegalParameters('logger required');
            }

            // Set properties from config with defaults
            this._callId = config.contactId || uuid();
            this._connectionId = config.connectionId || uuid();
            this._strategy = config.rtcJsStrategy;
            this._wssManager = config.webSocketManager;
            this._signalingUri = config.signalingUri;
            this._contactToken = config.callContextToken;
            
            this._currentContactIceCredentials = config.iceServers;
            this._iceServers = config.iceServers; // Backward compatibility for tests
            this._originalLogger = config.logger;
            this._logger = wrapLogger(config.logger, this._callId || '', 'RtcPeerConnectionManagerV2');
            this._isPPCEnabled = config.isPersistentConnectionEnabled;
            this._isRTPSAllowlisted = false; // RTPSAllowlisted flag is false by default
            this._peerConnectionId = null;
            this._browserId = config.browserId;
            this._clientId = config.clientId;
            this._isPersistentConnectionOnPageLoadEnabled = config.isPersistentConnectionOnPageLoadEnabled || false;
            this._allowExtendedPersistentConnection = !!config.allowExtendedPersistentConnection;
            this._requestIceAccess = config.transportHandle;
            this._publishError = config.publishError;

            // Validate strategy type
            if (!(this._strategy instanceof CCPInitiationStrategyInterface)) {
                throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
            }

            // Record PCM creation time for page-load-to-first-call latency measurement
            this._pcmCreatedTimestamp = Date.now();

            // Initialize singleton instance
            RtcPeerConnectionManagerV2.instance = this;
            this._logger.info("Initializing RtcPeerConnectionManagerV2, strategy: " + (this._strategy as any).getStrategyName()).sendInternalLogToServer();

            // Initialize component structures
            this._callSessions = new Map(); // Map of connectionId -> CallSession
            this._sharedMediaSession = null; // Will be lazily initialized when needed

            // Initialize SignalingChannelManager
            this._signalingChannelManager = new SignalingChannelManager(
                this._originalLogger,
                this._connectionId,
                this._wssManager
            );

            // Initialize extracted utility managers
            this._credentialResolver = new CredentialResolver(this._requestIceAccess as () => Promise<any[]>, this._logger);
            this._standbyPcManager = new StandbyPeerConnectionManager({
                logger: this._logger,
                strategy: this._strategy,
                clientId: this._clientId,
                createPeerConnection: () => this._createPeerConnection(),
                isStandbyConnectionSupported: ((this._strategy as any)._isEarlyMediaConnectionSupported() as unknown) as boolean,
                isPersistentConnectionAllowlistedAndEnabled: () => this.isPersistentConnectionAllowlistedAndEnabled(),
                isPeerConnectionManagerClosed: () => this._closed
            });

            // Initialize standby or persistent peer connection on page load
            this._initializePageLoadConnection().catch((error: any) => {
                this._logger.error("Failed to initialize page load connection").withException(error).sendInternalLogToServer();
            });
        } else {
            config.logger.info("RtcPeerConnectionManagerV2 singleton already exists, new config values ignored (callId, connectionId, iceServers, etc.)");
        }

        this.browserTabCloseEventListener();
        return RtcPeerConnectionManagerV2.instance;
    }

    /** Check if current browser supports standby/early peer connection or not.
     * If persistent peer connection is enabled, standby peer will be disabled.
     * @returns {*|boolean}
     * @private
     */
    _isStandbyConnectionSupported() {
        if (!this.isPersistentConnectionAllowlistedAndEnabled()) {
            return (this._strategy as any)._isEarlyMediaConnectionSupported();
        }
        return false;
    }

    /**
     * Get the current persistent peer connection object.
     * @returns {RTCPeerConnection|null} The current peer connection, or null if none exists
     */
    getPeerConnection() {
        return this._pc || null;
    }

    /**
     * Resolve ICE credentials (with cross-region handling) and create a new RTCPeerConnection.
     * Handles credential resolution via _credentialResolver, then delegates to strategy for
     * the actual WebRTC RTCPeerConnection creation. Used by standby PC manager for standby
     * connections and as the fallback in _getIdleOrCreatePeerConnection.
     *
     * @param {any[]|null} contactIceServers - Contact-provided ICE servers for cross-region detection
     * @returns {Promise<RTCPeerConnection|null>} The created peer connection, or null on failure
     * @private
     */
    async _createPeerConnection(contactIceServers: any[] | null = null): Promise<any> {
        const { iceServers, credentialSource, isDifferentRegion } = await this._credentialResolver.getIceCredentialsForCall(contactIceServers);
        if (!iceServers) {
            return null;
        }

        const rtcPeerConnectionConfig = JSON.parse(JSON.stringify(RTC_PEER_CONNECTION_CONFIG));
        rtcPeerConnectionConfig.iceServers = iceServers;
        rtcPeerConnectionConfig.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
        const pc = (this._strategy as any)._createRtcPeerConnection(rtcPeerConnectionConfig, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);

        if (credentialSource) {
            this._credentialResolver.recordCredentialSource(
                this._sharedMediaSession && this._sharedMediaSession._sessionReport,
                credentialSource, isDifferentRegion);
        }
        return pc;
    }

    /**
     * Get a standby peer connection if available, otherwise create a new one via _createPeerConnection.
     * This is the main entry point called during call setup and page-load connection init.
     *
     * @param {any[]|null} contactIceServers - Contact-provided ICE servers for cross-region detection
     * @returns {Promise<RTCPeerConnection|null>} The peer connection, or null on failure
     * @private
     */
    async _getIdleOrCreatePeerConnection(contactIceServers: any[] | null = null): Promise<any> {
        if (this._standbyPcManager.hasStandbyPc()) {
            this._logger.info("Using pre-fetched standby peer connection").sendInternalLogToServer();
            return this._standbyPcManager.consumeStandbyPc();
        }

        return this._createPeerConnection(contactIceServers);
    }

    /**
     * Close standby peer connection. Delegates to standby PC manager.
     */
    closeStandbyConnection() {
        this._standbyPcManager.closeStandbyConnection();
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
        this._currentContactIceCredentials = iceServers;
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
     * @return {CallSession} callSession
     */
    createSession(callId: any, iceServers: any, contactToken: any, connectionId: any, wssManager: any, rtcJsStrategy = new StandardStrategy(), deviceId: any) {
        this._logger.info(`Creating call session for contact: ${callId}, agent media leg: ${connectionId}`).sendInternalLogToServer();

        if (this._sharedMediaSession && !this._sharedMediaSession.isSharedMediaSessionHealthy()) {
            this._logger.warn("SharedMediaSession exists but is unhealthy on session creation, cleaning up").sendInternalLogToServer();
            this.destroy();
        } 
        else if (this._sharedMediaSession && this._callSessions.size === 0) {
            this._logger.info("SharedMediaSession is idle, refreshing media stream for new call").sendInternalLogToServer();
            // Non-blocking call - getUserMedia runs in background while call setup proceeds
            this._sharedMediaSession.refreshMediaStreamBetweenCalls();
        }
        
        // Store contact-provided credentials (only used during real call, not standby PC)
        this._currentContactIceCredentials = iceServers ? iceServers : this._currentContactIceCredentials;
        this._strategy = rtcJsStrategy ? rtcJsStrategy : this._strategy;
        this._logger = wrapLogger(this._originalLogger, callId, 'RtcPeerConnectionManagerV2');

        const callSession = new CallSession({
            logger: this._logger,
            callId: callId,
            contactToken: contactToken,
            connectionId: connectionId,
            signalingChannelManager: this._signalingChannelManager,
            iceServers: iceServers
        } as any);

        this._callSessions.set(connectionId, callSession);

        this.registerCallSession(callSession);
        if (!this._sharedMediaSession) {
            this._logger.info(`Creating new shared media session for contact: ${callId}, agent media leg: ${connectionId}`).sendInternalLogToServer();
            this._initializeSharedMediaSession({
                iceServers: iceServers,
                contactToken: contactToken,
                strategy: rtcJsStrategy,
                deviceId: deviceId,
                connectionId: connectionId,
                callId: callId
            });
            // skip connectContact for the first callSession
            callSession.shouldSkipConnectContact(true);
        }

        this._collectAgentSetupMetrics(callSession._sessionReport);

        this._addStatsMethodsToCallSession(callSession);

        this._recordTimeSinceLastCall(callSession,
            this._lastCallEndTimestamp,
            this._pcmCreatedTimestamp
        );

        return callSession;
    }

    /**
     * get rtcSession object
     *
     * @return {CallSession} callSession manages by the peer connection manager
     */
    getSession(connectionId: any) {
        return this._callSessions && this._callSessions.has(connectionId) ? this._callSessions.get(connectionId) : null;
    }

    /**
     * This method aims to create a new peer connection or connect to the existing peer connection
     * which will start the signaling process
     *
     * @param {RTCPeerConnection} pc - An existing peer connection, it could be persistent peer connection
     * or a standby peer connection (optional)
     * Todo: make sure we wait for the persistent connection creation before we connect the contact.
     */
    async connect(agentMediaLegId?: any) {
        this._logger.info(`Connecting call session for agent media leg: ${agentMediaLegId}`).sendInternalLogToServer();

        let resolvedAgentMediaLegId = agentMediaLegId;
        let callSession;

        // Backward compatibility: if no agentMediaLegId provided, use the only session if there's exactly one
        if (!agentMediaLegId) {
            if (this._callSessions.size === 1) {
                // Directly get the first (and only) session value
                callSession = this._callSessions.values().next().value;
                // Set the resolvedAgentMediaLegId for logging
                resolvedAgentMediaLegId = this._callSessions.keys().next().value;
                this._logger.info(`No agent media leg ID provided, using the only available session: ${resolvedAgentMediaLegId}`).sendInternalLogToServer();
            } else {
                const errorMsg = `Cannot connect: No agent media leg ID provided and ${this._callSessions.size} call sessions exist`;
                this._logger.error(errorMsg).sendInternalLogToServer();
                if (this._errorHandler) {
                    this._errorHandler(new Error(errorMsg));
                }
                return;
            }
        } else {
            // Find the call session for the specified agent media leg ID
            callSession = this._callSessions.get(resolvedAgentMediaLegId);
        }

        if (!callSession) {
            const errorMsg = `No call session found for agent media leg: ${agentMediaLegId}`;
            this._logger.error(errorMsg).sendInternalLogToServer();
            if (this._errorHandler) {
                this._errorHandler(new Error(errorMsg));
            }
            return;
        }
        if (this._inactivityTimer) {
            this.clearInactivityTimer();
        }
        if (!this._userAgentData) {
            this._userAgentData = await getUserAgentData().catch((error: any) => {
                this._logger.error("Peer connection manager failed to get user agent data", error);
            });
        }
        callSession._sessionReport.userAgentData = JSON.stringify(this._userAgentData);

        if (this.isSharedMediaSessionEstablished()) {
            callSession.onSharedMediaSessionEvent('isPersistentConnectionAllowlistedAndEnabled', this.isPersistentConnectionAllowlistedAndEnabled());
            callSession.onSharedMediaSessionEvent("peerConnectionId", this._peerConnectionId);
            callSession.onSharedMediaSessionEvent("peerConnectionToken", this._peerConnectionToken);
            callSession.onSharedMediaSessionEvent("sessionConnected", this._sharedMediaSession.getPeerConnection());
            callSession.onSharedMediaSessionEvent("localStreamAdded", this._sharedMediaSession.mediaStream);
        } else {
            // Precondition: _sharedMediaSession must exist here — createSession() guarantees it
            // (either creates new SharedMediaSession or reuses existing one). Guard defensively.
            if (!this._sharedMediaSession) {
                this._logger.error("Cannot connect: _sharedMediaSession is null. createSession() must be called before connect()").sendInternalLogToServer();
                return;
            }

            // Get PC (handles cross-region internally) → connect SharedMediaSession
            this._pc = await this._getIdleOrCreatePeerConnection(this._currentContactIceCredentials);
            this._sharedMediaSession.connect(this._pc);
        }

    }

    /**
     * Start an inactivity timer for persistent connection
     *
     */
    startInactivityTimer() {
        this._logger.info("PeerConnectionManager start inactivity timer").sendInternalLogToServer();
        this._inactivityTimer = setTimeout(() => {
            this._logger.info('Inactivity timer breached, teardown peer connection ').sendInternalLogToServer();
            this.destroy();
        }, this._inactivityDuration);
    }

    /**
     * Reset inactivity timer for persistent connection
     */
    clearInactivityTimer() {
        this._logger.info("PeerConnectionManager clear inactivity timer").sendInternalLogToServer();
        if (this._inactivityTimer) {
            clearTimeout(this._inactivityTimer);
        }
        this._inactivityTimer = null;
    }

    /**
     * Hang up the RtcSession
     */
    hangup(connectionId?: any) {
        this._logger.info(`PeerConnectionManager hangs up ${connectionId ? ' agent media leg: ' + connectionId : ' all calls'}`);

        if (connectionId) {
            // Disconnect specific call session
            const callSession = this._callSessions.get(connectionId);
            if (callSession) {
                // Clean up resources for this session
                this._callSessions.delete(connectionId);
                this._signalingChannelManager.unregisterCallSession(connectionId);
                callSession.hangup();
                if (this._callSessions.size === 0) {
                    this._lastCallEndTimestamp = Date.now();
                }
            } else {
                this._logger.warn(`No call session found for agent media leg: ${connectionId}`).sendInternalLogToServer();
            }
        } else {
            // Disconnect all call sessions
            for (const [id, callSession] of this._callSessions.entries()) {
                this._logger.info(`Disconnecting call session for agent media leg: ${id}`).sendInternalLogToServer();
                try {

                    callSession.hangup()
                } catch (e) {
                    this._logger.warn("Error hangup all call sessions", e);
                }

            }
            // Record when the last call ended — capture size before clear()
            const hadActiveCalls = this._callSessions.size > 0;

            // Clean up all resources
            this._callSessions.clear();
            this._signalingChannelManager.clearCallSessionCallbacks();

            if (hadActiveCalls) {
                this._lastCallEndTimestamp = Date.now();
            }
        }

        if (this._callSessions.size === 0 && this._sharedMediaSession) {
            
            // Check health first
            if (!this._sharedMediaSession.isSharedMediaSessionHealthy()) {
                this._logger.warn("SharedMediaSession unhealthy on call end, cleaning up").sendInternalLogToServer();
                this.destroy();
                
            } else if (!this.isPersistentConnectionAllowlistedAndEnabled()) {
                // Healthy but not using persistent connection - disconnect
                this._logger.info("No more active call sessions, disconnecting shared media session").sendInternalLogToServer();
                this.destroy();
                
            } else {
                // Healthy and using persistent connection - pause and start timer
                this._sharedMediaSession.pauseLocalAudio();
                this.startInactivityTimer();
            }
        }
    }

    /**
     * Destroys the existing persistent peer connection by hangup the sharedMediaSession.
     *
     * @param {boolean} serverInitiated - Whether this destroy was initiated by the server (e.g., PC_BYE).
     *        If true, will not send a BYE message back to the server.
     *        Default is false (client-initiated, will send BYE).
     *
     * This method is crucial for both RTPS allowlisted and not allowlisted paths.
     * It ensures proper cleanup of the signaling channel, which is essential because pcm.hangup is not guaranteed to be invoked.
     *
     * Usage:
     * - Call with no arguments or false for client-initiated destruction (will send BYE to server).
     * - Call with true for server-initiated destruction (will not send BYE).
     */
    destroy(serverInitiated = false) {
        try {
            // todo: re-evaluate this condition, might need to check call session state instead
            if (this._callSessions.size > 0) {
                this._logger.info("Peer connection is in use, PeerConnectionManager can NOT destroy persistent peer connection").sendInternalLogToServer();
            } else if (this._sharedMediaSession) {   // if peer connection exists, destroy the persistent peer connection
                this._logger.info(`PeerConnectionManager destroy persistent peer connection (serverInitiated: ${serverInitiated})`);
                this._sharedMediaSession.hangup(serverInitiated);
                this._sharedMediaSession = null;
                // the actual peer connection and media stream will be cleaned up by sharedMediaSession Hangup
                this._pc = null;
                this._peerConnectionId = null;
                this._peerConnectionToken = null;
                this._mediaStream = null;
                this.clearInactivityTimer();
            }
        } catch (error) {
            this._logger.error("Error occurred in PeerConnectionManager destroy method:").withException(error).sendInternalLogToServer();
        }
    }

    /**
     * Handle persistent peer connection toggle
     */
    handlePersistentPeerConnectionToggle(isPPCEnabled: any) {
        if (this._callSessions.size === 0 && this.isPPCEnabled !== isPPCEnabled && this.isRTPSAllowlisted) {
            this.isPPCEnabled = isPPCEnabled;
            // if softphonePersistentConnection changed to true, use rtcPeerConnectionManager to initiate a new persistent peer connection
            if (this.isPPCEnabled) {
                this._logger.info("softphonePersistentConnection changed to true, initiate a persistent peer connection").sendInternalLogToServer();
                this.activatePersistentPeerConnectionMode();
            } else {
                // if softphonePersistentConnection changed to false, use rtcPeerConnectionManager to tear down the currentpersistent peer connection
                this._logger.info("softphonePersistentConnection changed to false, destroy the existing persistent peer connection").sendInternalLogToServer();
                this.deactivatePersistentPeerConnectionMode();
            }
        }
    }

    /**
     * Activate persistent connection mode by closing standby peer connection and setting up shared media session.
     *
     * Note: This method is called from handlePersistentPeerConnectionToggle, which already checks
     * isRTPSAllowlisted. However, page-load methods (_initializePageLoadConnection,
     * handleFACUpdate) intentionally skip the RTPS check because
     * isRTPSAllowlisted is always false on page load — it only becomes true after the first
     * RTPS signaling handshake response.
     */
    activatePersistentPeerConnectionMode() {
        this._logger.info("Activating persistent peer connection mode").sendInternalLogToServer();

        this.closeStandbyConnection();

        if (this._isPersistentConnectionOnPageLoadEnabled) {
            this._logger.info("Page-load FAC enabled, setting up shared media session during activation").sendInternalLogToServer();
            this._setupPageLoadPersistentConnection();
        }
    }

    /**
     * Set up a page-load persistent connection: wait for the strategy to be connected,
     * then fetch a PC and hand it to SharedMediaSession. Used by _initializePageLoadConnection,
     * activatePersistentPeerConnectionMode, and handleFACUpdate. For non-VDI strategies
     * whenConnected() resolves immediately; for VDI strategies it waits on the client handshake.
     * @private
     */
    async _setupPageLoadPersistentConnection() {
        let ownedPc: any = null;
        try {
            await (this._strategy as any).whenConnected();

            if (this._closed || this._sharedMediaSession) {
                this._logger.info("Skipping page-load PC setup (closed or SharedMediaSession exists)").sendInternalLogToServer();
                return;
            }
            this._logger.info("Strategy is connected, proceeding with page-load persistent connection setup").sendInternalLogToServer();

            const pc = await this._getIdleOrCreatePeerConnection();

            if (this._closed || this._sharedMediaSession) {
                this._logger.info("Abandoning page-load PC (closed or SharedMediaSession appeared during ICE fetch)").sendInternalLogToServer();
                (this._strategy as any).close(pc);
                return;
            }

            this._pc = pc;
            ownedPc = pc;
            // PC already has ICE credentials from _getIdleOrCreatePeerConnection; SharedMediaSession only needs
            // iceServers for session reporting, so pass empty.
            this._initializeSharedMediaSession({ contactToken: null, iceServers: [] });
            this._sharedMediaSession.connect(this._pc);
        } catch (error) {
            this._logger.error("Failed to setup page-load persistent connection").withException(error).sendInternalLogToServer();
            if (ownedPc) {
                if (this._pc === ownedPc) {
                    (this._strategy as any).close(ownedPc);
                    this._pc = null;
                    this._sharedMediaSession = null;
                } else {
                    this._logger.warn("Page-load PC (ownedPc) differs from current _pc during error cleanup — skipping close to avoid disrupting concurrent path").sendInternalLogToServer();
                }
            }
        }
    }

    /**
     * Initialize a SharedMediaSession, register its callbacks, and attach the remote audio element.
     * Used by both createSession (call-time) and _setupPageLoadPersistentConnection (page-load).
     *
     * @param {Object} config - SharedMediaSession configuration
     * @param {Array} config.iceServers - ICE server credentials
     * @param {string|null} config.contactToken - Contact token (null for page-load)
     * @param {Object} config.strategy - WebRTC strategy
     * @param {string} [config.deviceId] - Microphone device ID
     * @param {string} config.connectionId - Connection/agent media leg ID
     * @param {string} config.callId - Contact/call ID
     * @private
     */
    _initializeSharedMediaSession(config: any) {
        this._hasEverCreatedSharedMediaSession = true;
        this._sharedMediaSession = new SharedMediaSession({
            logger: this._logger,
            iceServers: config.iceServers,
            contactToken: config.contactToken || null,
            strategy: config.strategy || this._strategy,
            deviceId: config.deviceId,
            signalingChannelManager: this._signalingChannelManager,
            connectionId: config.connectionId || this._connectionId,
            callId: config.callId || this._callId,
            browserId: this._browserId,
            isPersistentConnectionEnabled: this.isPPCEnabled,
            allowExtendedPersistentConnection: this._allowExtendedPersistentConnection,
            requestIceAccess: this._requestIceAccess
        });

        this.registerSharedMediaSessionCallbacks();
        this._sharedMediaSession.remoteAudioElement = document.getElementById('remote-audio') || window.parent.parent.document.getElementById('remote-audio');
    }

    /**
     * Initialize the page-load connection — either a standby peer connection or a full persistent
     * connection with SharedMediaSession, depending on agent config and FAC state.
     *
     * - PPC disabled: StandbyPeerConnectionManager auto-creates a standby peer connection on construction
     * - PPC enabled + page-load FAC disabled: creates standby peer connection only
     * - PPC enabled + page-load FAC enabled: creates peer connection AND establishes persistent
     *   connection with SharedMediaSession + RTPS signaling
     *
     * Note: isRTPSAllowlisted is NOT checked here because it is always false on page load —
     * it only becomes true after the first RTPS signaling handshake response.
     *
     * @returns {Promise<void>}
     * @private
     */
    async _initializePageLoadConnection() {
        if (this._isPersistentConnectionEnabledForBrowser() && this._isPersistentConnectionOnPageLoadEnabled) {
            // PPC + page-load FAC enabled + supported browser: set up the full shared media session (ICE + PC + SharedMediaSession + signaling)
            this._logger.info("PPC + page-load FAC enabled, setting up page-load persistent connection").sendInternalLogToServer();
            this._setupPageLoadPersistentConnection();
        } else {
            // PPC disabled, page-load FAC not enabled, or Firefox browser: standby PC manager already auto-requested
            // a standby PC on creation, no additional action needed.
            this._logger.info("Standby peer connection manager initialized, standby peer connection auto-requested").sendInternalLogToServer();
        }
    }

    /**
     * Generic FAC update handler. Accepts a flags map from SoftphoneManager and
     * dispatches to specific feature handlers.
     *
     * @param {Object} flags - Map of FAC flag names to boolean values
     *   e.g. { enablePersistentConnectionOnPageLoad: true, enableSoftphoneBulletRouting: true }
     */
    handleFACUpdate(flags: Record<string, boolean>) {
        if (!flags || typeof flags !== 'object') {
            return;
        }

        if ('enablePersistentConnectionOnPageLoad' in flags) {
            this._handlePageLoadPersistentConnectionFACUpdate(flags.enablePersistentConnectionOnPageLoad);
        }
    }

    /**
     * Handle page-load persistent connection FAC flag update.
     * Only triggers setup when:
     * - Flag changed from false to true (one-time activation)
     * - Persistent connection is enabled
     * - No active call sessions
     * - No SharedMediaSession already exists
     *
     * @param {boolean} isEnabled - The current FAC value for page-load persistent connection
     * @private
     */
    _handlePageLoadPersistentConnectionFACUpdate(isEnabled: boolean) {
        const wasEnabled = this._isPersistentConnectionOnPageLoadEnabled;
        this._isPersistentConnectionOnPageLoadEnabled = isEnabled;

        // Only act on false→true transition (late FAC arrival)
        if (!wasEnabled && isEnabled) {
            this._logger.info("Page-load persistent connection FAC arrived late, checking if setup is needed").sendInternalLogToServer();

            // Use _isPPCEnabled instead of isPersistentConnectionAllowlistedAndEnabled() because
            // isRTPSAllowlisted may still be false if no call has been made yet.
            // Guard: do not attempt setup if SharedMediaSession was already created (or attempted) previously.
            // This prevents retrying after a failed/destroyed SharedMediaSession or after a call already happened.
            if (this._isPersistentConnectionEnabledForBrowser() && this._callSessions.size === 0 && !this._sharedMediaSession && !this._hasEverCreatedSharedMediaSession) {
                this._logger.info("Conditions met for late page-load setup, setting up shared media session").sendInternalLogToServer();
                this._setupPageLoadPersistentConnection();
            } else {
                this._logger.info("Conditions not met for late page-load setup (isPPCEnabled=" + this._isPPCEnabled +
                    ", activeSessions=" + this._callSessions.size + ", hasSharedMediaSession=" + !!this._sharedMediaSession +
                    ", alreadyAttempted=" + this._hasEverCreatedSharedMediaSession + ")").sendInternalLogToServer();
            }
        }
    }

    /**
     * Deactivate persistent connection mode by destroying the existing persistent peer connection and request for standby peer connection
     */
    deactivatePersistentPeerConnectionMode() {
        this._logger.info("Deactivating persistent peer connection mode").sendInternalLogToServer();
        this.destroy();
        // PPC was on so standby manager skipped auto-request at construction; trigger it now
        this._standbyPcManager.requestStandbyPc();
    }

    /**
     * Check if persistent connection is enabled and the browser supports it.
     * Used on page-load paths where isRTPSAllowlisted is not yet known.
     */
    _isPersistentConnectionEnabledForBrowser() {
        return this._isPPCEnabled && !isFirefoxBrowser(this._userAgentData);
    }

    // Todo: Update following
    isPersistentConnectionAllowlistedAndEnabled() {
        return this._isPersistentConnectionEnabledForBrowser() && this._isRTPSAllowlisted;
    }

    /**
     * Closes the early-media connection and the persistent peer connection, then clears the
     * singleton so the next `new RtcPeerConnectionManagerV2(...)` runs the full init path again, 
     * including page-load persistent connection setup.
     */
    close() {
        this._logger.info("Closing RtcPeerConnectionManagerV2").sendInternalLogToServer();
        this._closed = true;
        if (this.isPersistentConnectionAllowlistedAndEnabled()) {
            this.destroy();
        } else {
            this.closeStandbyConnection();
        }
        RtcPeerConnectionManagerV2.instance = null;
    }

    /** This function is to listen beforeunload event. When we receive beforeunload
     * we will send a bye from CCP to Amazon Connect, but this is very unstable, we cannot
     * guarantee send bye every time when agent close the browser tab
     *
     */
    browserTabCloseEventListener() {
        window.addEventListener('beforeunload', () => {
            this._logger.info('User leaves the page, destroy RtcPeerConnectionManagerV2');
            this.destroy();
        });
    }

    /**
     * Set the microphone device on the current peer connection by acquiring a new media stream
     * and replacing the audio track in the peer connection sender. Returns early if no active
     * shared media session exists.
     *
     * This method routes through the strategy layer's getUserMedia, preserving mute state
     * across the track replacement. On failure, the error is logged and the existing
     * audio track remains active.
     * If the requested deviceId matches the current device, resolves immediately (no-op).
     *
     * @param {string} deviceId - The device ID of the microphone to switch to
     * @returns {Promise<void>} Resolves when the device change is complete
     */
    setMicrophoneDevice(deviceId: any) {
        if (!this._sharedMediaSession) {
            this._logger.warn("[setMicrophoneDevice] No active shared media session available").sendInternalLogToServer();
            return;
        }
        return this._sharedMediaSession.setMicrophoneDevice(deviceId);
    }

    /**
     * Register callbacks from shared media session to RtcPeerConnectionManagerV2
     * These callbacks will be forwarded to all registered call sessions
     */
    registerSharedMediaSessionCallbacks() {
        if (!this._sharedMediaSession) {
            this._logger.error("Cannot register callbacks for null shared media session").sendInternalLogToServer();
            return;
        }

        this._logger.info("Registering shared media session callbacks").sendInternalLogToServer();

        this._signalingChannelManager.registerPCByeHandler((msg: any) => {
            this._handlePCBye(msg);
        });

        this._sharedMediaSession.registerCallbacks({
            // Local media related callbacks
            onGumError: (error: any) => {
                this._logger.error("Local media initialization failed").withException(error).sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('gumError', error);
            },
            onGumSuccess: () => {
                this._logger.info("Local media initialized successfully").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('gumSuccess');
            },
            onLocalPeerConnectionAvailable: (session: any, pc: any) => {
                this._logger.info("Local Peer Connection available").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('localPeerConnectionAvailable', pc);
            },
            onLocalStreamAdded: (session: any, stream: any) => {
                this._logger.info("Local stream added to shared media session").sendInternalLogToServer();
                this._mediaStream = stream;
                this._notifyAllCallSessionsOfEvent('localStreamAdded', stream);
            },
            replaceStreamCallback: (session: any, stream: any) => {
                return this._notifyAllCallSessionsOfEvent('replaceStreamCallback', stream);
            },
            onSharedMediaSessionFailed: (session: any, error: any) => {
                this._logger.error(`Shared media session failed: ${error}`).withException(error).sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('sessionFailed', error);
                this.handleSharedMediaSessionFailed(error);
            },
            onSharedMediaSessionInitialized: (session: any, initializationTime: any) => {
                this._logger.info(`Shared media session initialized in ${initializationTime}ms`).sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('sessionInitialized', initializationTime);
            }, // Signaling related callbacks
            onSignalingConnected: () => {
                this._logger.info("Signaling connected for shared media session").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('signalingConnected');
            },
            onIceCollectionComplete: () => {
                this._logger.info("ICE collection complete").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('iceCollectionComplete');
            },
            onSignalingStarted: () => {
                this._logger.info("Signaling started for shared media session").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('signalingStarted');
            },

            // Session state callbacks
            onSharedMediaSessionConnected: () => {
                this._logger.info("Shared media session established").sendInternalLogToServer();
                // Update peer connection in all call sessions
                const pc = this._sharedMediaSession.getPeerConnection();
                this._pc = pc;
                // Notify call sessions of the event with the peer connection
                this._notifyAllCallSessionsOfEvent('sessionConnected', pc);

                // Page-load persistent connection: if SharedMediaSession connected with no active calls,
                // pause the microphone (don't stream silence to the server) and start
                // the inactivity timer so the connection auto-tears-down if no call arrives.
                if (this._callSessions.size === 0) {
                    this._logger.info("Page-load SharedMediaSession connected with no active calls, pausing audio").sendInternalLogToServer();
                    this._sharedMediaSession.pauseLocalAudio();
                    if (this._inactivityDuration > 0) {
                        this.startInactivityTimer();
                    }
                }
            },
            onSharedMediaSessionSetupLatencyMetricReady: (sessionReport: any) => {
                this._logger.info("onSessionSetupLatencyMetricReady Received").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('sessionSetupLatencyMetricReady', sessionReport);
            },
            // Remote stream callbacks
            onRemoteStreamAdded: (session: any, stream: any) => {
                this._logger.info("Remote stream added to shared media session").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('remoteStreamAdded', stream);
            },
            onSharedMediaSessionCompleted: () => {
                this._logger.info("Shared media session completed").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('sessionCompleted');
                this.handleSharedMediaSessionCompleted();
            },
            onSharedMediaSessionDestroyed: () => {
                this._logger.info("Shared media session destroyed").sendInternalLogToServer();
                this._notifyAllCallSessionsOfEvent('sessionDestroyed');
            },

            // Utility callbacks
            isPersistentConnectionAllowlistedAndEnabledCallback: () => this.isPersistentConnectionAllowlistedAndEnabled(),
            isPersistentConnectionAllowlistedCallback: (isPersistentConnectionAllowlisted: any) => {
                this._logger.info("isPersistentConnectionAllowlisted Received").sendInternalLogToServer();
                this.isRTPSAllowlisted = isPersistentConnectionAllowlisted;
                this._notifyAllCallSessionsOfEvent('isPersistentConnectionAllowlistedAndEnabled', this.isPersistentConnectionAllowlistedAndEnabled());
            },
            setInactivityDurationCallback: (inactivityDuration: any) => {
                this._logger.info("inactivityDuration Received");
                this._inactivityDuration = inactivityDuration;
            },
            setPeerConnectionIdCallback: (peerConnectionId: any) => {
                this._logger.info("Peer Connection Id Received");
                this._peerConnectionId = peerConnectionId;
                this._notifyAllCallSessionsOfEvent('peerConnectionId', peerConnectionId);
            },
            setPeerConnectionTokenCallback: (peerConnectionToken: any) => {
                this._logger.info("Peer Connection Token Received");
                this._peerConnectionToken = peerConnectionToken;
                this._notifyAllCallSessionsOfEvent('peerConnectionToken', peerConnectionToken);
            },
            onIceConnectionStateChange: (iceState: any) => {
                this._logger.info(`ICE Connection State changed: ${iceState}`);
                this._notifyAllCallSessionsOfEvent('iceConnectionStateChange', iceState);
            },
            onPeerConnectionStateChange: (peerConnectionState: any) => {
                this._logger.info(`Peer Connection State changed: ${peerConnectionState}`);
                this._notifyAllCallSessionsOfEvent('peerConnectionStateChange', peerConnectionState);
            },
            onIceRestartComplete: (metrics: any) => {
                this._logger.info(`ICE restart completed. Success: ${metrics.iceRestartSuccesses > 0}`);
                this._notifyAllCallSessionsOfEvent('iceRestartComplete', metrics);
            }
        });
    }

    /**
     * Handle PC_BYE message from server
     * This is called when the server sends a PC_BYE to tear down the peer connection
     * @param {Object} msg - The PC_BYE message containing peerConnectionId
     * @private
     */
    _handlePCBye(msg: any) {
        this._logger.info("Received PC_BYE from server").sendInternalLogToServer();
        
        if (!msg || !msg.peerConnectionId) {
            this._logger.warn("PC_BYE message missing peerConnectionId").sendInternalLogToServer();
            return;
        }

        if (msg.peerConnectionId !== this._peerConnectionId) {
            this._logger.warn(`PC_BYE peerConnectionId mismatch. Expected: ${this._peerConnectionId}, Received: ${msg.peerConnectionId}`).sendInternalLogToServer();
            return;
        }

        if (this._callSessions.size === 0) {
            this._logger.info("No active call sessions, destroying shared media session due to PC_BYE").sendInternalLogToServer();
            // Pass true to indicate this is server-initiated, so don't send BYE back
            this.destroy(true);
        } else {
            this._logger.info(`PC_BYE received but ${this._callSessions.size} call session(s) still active, not destroying shared media session`).sendInternalLogToServer();
        }
    }

    /**
     * Notify all registered call sessions about an event from the shared media session
     * @param {String} eventName - Name of the event to notify about
     * @param {*} eventData - Optional event data to pass to the call sessions
     * @private
     */
    _notifyAllCallSessionsOfEvent(eventName: any, eventData?: any) {
        for (const [agentMediaLegId, callSession] of this._callSessions.entries()) {
            try {
                // Use a structured event handler method instead of direct method calls
                if (typeof callSession.onSharedMediaSessionEvent === 'function') {
                    callSession.onSharedMediaSessionEvent(eventName, eventData);
                } else {
                    this._logger.warn(`Call session ${agentMediaLegId} does not implement onSharedMediaSessionEvent`).sendInternalLogToServer();
                }
            } catch (e) {
                this._logger.error(`Error notifying call session ${agentMediaLegId} about event ${eventName}`, e).sendInternalLogToServer();
            }
        }
    }

    /**
     * Register a session with the PCManager
     */
    registerCallSession(session: any) {
        if (!session || !session._agentMediaLegId) {
            this._logger.error("Cannot register invalid session").sendInternalLogToServer();
            return;
        }

        this._logger.info(`Registering session for contact: ${session._contactId}, agent media leg: ${session._agentMediaLegId}`).sendInternalLogToServer();

        this._signalingChannelManager.registerCallSession(session._agentMediaLegId, {
            onMessage: (msg: any) => session.handleMessage(msg)
        });
        session.registerAttributeChangeCallback((agentMediaLegId: any, attributeName: any, attributeValue: any) => {
            this._handleCallSessionAttributeChange(agentMediaLegId, attributeName, attributeValue);
        });
    }

    /**
     * Check if shared media session is established
     */
    isSharedMediaSessionEstablished() {
        return this._sharedMediaSession && this._sharedMediaSession.isInTalkingState();
    }

    _handleCallSessionAttributeChange(agentMediaLegId: any, attributeName: any, attributeValue: any) {
        this._logger.info(`Handling attribute change for ${attributeName} from call session ${agentMediaLegId}`).sendInternalLogToServer();

        if (!this._sharedMediaSession) {
            this._logger.warn(`Cannot apply attribute ${attributeName}: no shared media session exists`).sendInternalLogToServer();
            return;
        }

        try {
            // Apply the attribute to the shared media session
            switch (attributeName) {
                case 'mediaStream':
                    // Handle user-provided media stream
                    this._sharedMediaSession.mediaStream = attributeValue;
                    break;

                case 'echoCancellation':
                    this._sharedMediaSession.echoCancellation = attributeValue;
                    break;

                case 'remoteAudioElement':
                    this._sharedMediaSession.remoteAudioElement = attributeValue;
                    break;

                case 'disableMediaStreamRefresh':
                    // Call disableMediaStreamRefresh on SharedMediaSession
                    this._sharedMediaSession.disableMediaStreamRefresh();
                    break;

                default:
                    this._logger.info(`Unhandled attribute change: ${attributeName}`).sendInternalLogToServer();
            }

        } catch (error) {
            this._logger.error(`Failed to apply attribute ${attributeName}`, error).sendInternalLogToServer();
        }
    }

    /**
     * Handle when SharedMediaSession completes successfully
     * This method is called when the shared media session naturally completes
     * (e.g., after all calls are done)
     */
    handleSharedMediaSessionCompleted() {
        this._logger.info("Handling shared media session completion").sendInternalLogToServer();
        this._cleanupSharedMediaSessionState();
    }

    /**
     * Handle when SharedMediaSession fails
     *
     * @param {Error} error - The error that caused the failure
     */
    handleSharedMediaSessionFailed(error: any) {
        this._logger.error(`Shared media session failed: ${error}`).withException(error).sendInternalLogToServer();
        this._cleanupSharedMediaSessionState();

        if (this._publishError && typeof this._publishError === 'function') {
            this._publishError(error);
        }
    }

    /**
     * Shared cleanup for both completed and failed SharedMediaSession paths.
     * Ensures consistent nulling of all SharedMediaSession-related fields (same set as destroy()).
     * @private
     */
    private _cleanupSharedMediaSessionState() {
        this._callSessions.clear();
        this._signalingChannelManager.clearCallSessionCallbacks();
        this._sharedMediaSession = null;
        this._pc = null;
        this._peerConnectionId = null;
        this._peerConnectionToken = null;
        this._mediaStream = null;
        this.clearInactivityTimer();
    }

    /**
     * Add stats methods to a call session
     * @param {CallSession} callSession - The call session to add stats methods to
     * @private
     */
    _addStatsMethodsToCallSession(callSession: any) {
        callSession.getUserAudioStats = async () => {
            return this._sharedMediaSession.getUserAudioStats();
        };

        callSession.getRemoteAudioStats = async () => {
            return this._sharedMediaSession.getRemoteAudioStats();
        };

    }

    /**
     * Collect Agent Setup metrics that don't require a media stream
     * @param {SessionReport} sessionReport - The session report to populate
     * @private
     */
    _collectAgentSetupMetrics(sessionReport: any) {
        var self = this;

        // Microphone permission
        try {
            if (navigator.permissions && navigator.permissions.query) {
                navigator.permissions.query({ name: 'microphone' }).then(function(permissionStatus) {
                    sessionReport.microphonePermission = permissionStatus.state;
                }).catch(function(error) {
                    self._logger.warn("Failed to query microphone permission", error);
                });
            }
        } catch (error) {
            this._logger.warn("Failed to query microphone permission", error);
        }

        // Device memory
        try {
            sessionReport.deviceMemory = (navigator as any).deviceMemory !== undefined ? (navigator as any).deviceMemory : null;
        } catch (error) {
            this._logger.warn("Failed to get device memory", error);
        }

        // Network metrics
        try {
            var connection = (navigator as any).connection;
            if (connection) {
                sessionReport.networkEffectiveType = connection.effectiveType;
                sessionReport.networkRtt = connection.rtt;
            }
        } catch (error) {
            this._logger.warn("Failed to get network metrics", error);
        }

        // Collect VDI metadata
        try {
            if (this._strategy && typeof (this._strategy as any).getMetadata === 'function') {
                sessionReport.vdiMetadata = (this._strategy as any).getMetadata();
            }
        } catch (error) {
            this._logger.warn("Failed to collect VDI metadata", error);
        }
        try {
            if (this._strategy && typeof (this._strategy as any).getVdiClientVersion === 'function') {
                sessionReport.vdiClientVersion = (this._strategy as any).getVdiClientVersion();
            }
        } catch (error) {
            this._logger.warn("Failed to collect VDI client version", error);
        }
        try {
            if (this._strategy && typeof (this._strategy as any).getStrategyName === 'function' && (this._strategy as any).getStrategyName() === CITRIX_VDI_STRATEGY && (this._strategy as any).version) {
                sessionReport.citrixVersion = (this._strategy as any).version;
            }
        } catch (error) {
            this._logger.warn("Failed to collect Citrix version", error);
        }

        // Enumerate audio devices
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices().then(function(devices) {
                    var audioInputDevices = [];
                    var audioOutputDevices = [];
                    devices.forEach(function(device) {
                        if (device.kind === 'audioinput') {
                            audioInputDevices.push(device.label);
                        } else if (device.kind === 'audiooutput') {
                            audioOutputDevices.push(device.label);
                        }
                    });
                    sessionReport.audioInputDevices = audioInputDevices;
                    sessionReport.audioOutputDevices = audioOutputDevices;
                }).catch(function(error) {
                    self._logger.warn("Failed to enumerate devices", error);
                });
            }
        } catch (error) {
            this._logger.warn("Failed to enumerate devices", error);
        }
    }

    private _recordTimeSinceLastCall(callSession: any, lastCallEndTimestamp: number | null, pcmCreatedTimestamp: number): void {
        if (!callSession._sessionReport) return;
        if (lastCallEndTimestamp) {
            callSession._sessionReport.timeSinceLastCallSeconds = Math.round((Date.now() - lastCallEndTimestamp) / 1000);
            this._logger.info(`Time since last call: ${callSession._sessionReport.timeSinceLastCallSeconds}s`).sendInternalLogToServer();
        } else if (pcmCreatedTimestamp) {
            callSession._sessionReport.pcmCreationToFirstCallSeconds = Math.round((Date.now() - pcmCreatedTimestamp) / 1000);
            this._logger.info(`PCM creation to first call: ${callSession._sessionReport.pcmCreationToFirstCallSeconds}s`).sendInternalLogToServer();
        }
    }
}
