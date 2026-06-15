import { wrapLogger } from './utils';
import { SessionReport } from './session_report';
import { CALL_SESSION_STATE, CONNECT_CONTACT_METHOD_NAME, } from './rtc_const';
import {v4 as uuid} from 'uuid';

/**
 * CallSessionState - class for all call session states
 */
class CallSessionState {
    constructor(callSession) {
        this._callSession = callSession;
    }

    onEnter() {
    }

    onExit() {
    }

    //Todo: Throw UnsupportedOperation
    connectContact() {
    }

    //Todo: Throw UnsupportedOperation
    disconnectContact() {
    }

    handleMessage(/* message */) {
    }

    onSharedMediaSessionConnected() {
    }

    onSharedMediaSessionError(/* error */) {
    }

    onSharedMediaSessionEvent() {
    }

    get logger() {
        return this._callSession._logger;
    }

    get name() {
        return "CallSessionState";
    }

    _isCurrentState() {
        return this._callSession._state === this;
    }

    transit(nextState) {
        if (this._isCurrentState()) {
            this._callSession.transit(nextState);
        }
    }
}

/**
 * InitialState - Starting state for call sessions
 */
class InitialState extends CallSessionState {
    onEnter() {
        this.logger.info("Entering Initial state").sendInternalLogToServer();
    }

    onSharedMediaSessionConnected() {
        this.logger.info("Shared media session connected, transitioning to ConnectContactState").sendInternalLogToServer();
        this.transit(new ConnectContactState(this._callSession));
    }

    onSharedMediaSessionError(error) {
        this.logger.error("Shared media session error in InitialState", error).sendInternalLogToServer();
        this.transit(new FailedState(this._callSession, error));
    }
    // Todo: need to properly handle call disconnection while setup in progress

    get name() {
        return CALL_SESSION_STATE.INITIAL_STATE;
    }
}

/**
 * ConnectContactState - State for connecting to a contact
 */
class ConnectContactState extends CallSessionState {
    onEnter() {
        this.logger.info("Entering ConnectContact state").sendInternalLogToServer();
        if (!this._callSession._shouldSkipConnectContact) {
            this.logger.info("Sending ConnectContact").sendInternalLogToServer();
            // Send connect contact request through SignalingChannelManager
            this._callSession._signalingChannelManager.send(JSON.stringify({
                jsonrpc: '2.0', method: CONNECT_CONTACT_METHOD_NAME, params: {
                    contactId: this._callSession._contactId,
                    persistentConnection: this._callSession._persistentConnection,
                    peerConnectionId: this._callSession._peerConnectionId,
                    peerConnectionToken: this._callSession._peerConnectionToken,
                    callContextToken: this._callSession._contactToken,
                }, id: uuid()
            }), this._callSession._agentMediaLegId);
            
            // Mark as using existing persistent peer connection when connectContact is sent
            this._callSession._sessionReport.isExistingPersistentPeerConnection = true;
        }


        // Immediately transition to TalkingState - don't wait for response
        this.transit(new TalkingState(this._callSession));

    }

    get name() {
        return CALL_SESSION_STATE.CONNECT_CONTACT_STATE;
    }
}

/**
 * TalkingState - State when the call is active
 */
class TalkingState extends CallSessionState {
    onEnter() {
        this.logger.info("Entering Talking state").sendInternalLogToServer();
        this._startTime = Date.now();
        this._callSession._onSessionConnected(this._callSession);

        // Calculate time taken to receive the first RTP packet
        // This measures the time from call session connect() to first RTP packet receipt
        let interval;
        let timeout;
        const getSynchronizationSourcesAndProcess = async () => {
            try {
                // Null checks for call session and peer connection
                if (!this._callSession || !this._callSession._pc) {
                    this.logger.warn('Peer connection not available for RTP tracking');
                    return;
                }
                
                const receivers = this._callSession._pc.getReceivers();
                if (!receivers || receivers.length === 0) {
                    // No receivers yet, continue polling
                    return;
                }
                
                const rtcRtpReceiver = receivers[0];
                if (!(rtcRtpReceiver instanceof RTCRtpReceiver)) {
                    this.logger.warn('Invalid RTP receiver type');
                    return;
                }
                
                const synchronizationSources = rtcRtpReceiver.getSynchronizationSources();
                if (!synchronizationSources || synchronizationSources.length === 0) {
                    // No packets yet, continue polling
                    return;
                }
                
                synchronizationSources.forEach((source) => {
                    if (source.timestamp && this._callSession._connectTimeStamp) {
                        const firstRTPTimeMillis = source.timestamp - this._callSession._connectTimeStamp;
                        if (firstRTPTimeMillis > 0) {
                            this._callSession._sessionReport.firstRTPTimeMillis = firstRTPTimeMillis;
                            this.logger.info(`First RTP packet received after ${firstRTPTimeMillis}ms`).sendInternalLogToServer();
                            // Clear interval and timeout once we get the first packet
                            clearInterval(interval);
                            clearTimeout(timeout);
                        }
                    }
                });
            } catch (error) {
                this.logger.error('Error getting synchronization sources for RTP tracking', error).sendInternalLogToServer();
            }
        };

        try {
            // Set up timeout to stop the interval after 1 second
            timeout = setTimeout(() => {
                if (interval) {
                    clearInterval(interval);
                }
                this.logger.info('RTP tracking timeout reached, stopping the interval').sendInternalLogToServer();
            }, 1000);

            // Start polling for RTP packets every 20ms
            interval = setInterval(getSynchronizationSourcesAndProcess, 20);
        } catch (error) {
            this.logger.error('Failed to set up RTP packet tracking', error).sendInternalLogToServer();
        }
    }

    onExit() {
        this._callSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
        this._callSession._sessionReport.sessionEndTime = new Date();
        this._callSession._onSessionCompleted(this._callSession);
    }

    disconnectContact() {
        this.logger.info("Disconnecting contact from Talking state").sendInternalLogToServer();
        if (this._callSession._isPersistentConnectionAllowlistedAndEnabled) {
            this.logger.info("Sending DisconnectContact for Persistent Connection Enabled path").sendInternalLogToServer();
            this._callSession._signalingChannelManager.send(JSON.stringify({
                jsonrpc: '2.0', method: 'disconnectContact', params: {
                    contactId: this._callSession._contactId,
                    peerConnectionId: this._callSession._peerConnectionId,
                    peerConnectionToken: this._callSession._peerConnectionToken,
                }, id: uuid()
            }), this._callSession._agentMediaLegId);
        } else {
            this.logger.info("Skipping DisconnectContact for Persistent Connection Disabled and Not Allowlisted path").sendInternalLogToServer();
        }



        this.transit(new DisconnectedState(this._callSession));
    }

    handleMessage(/*msg*/) {
        //     no remote (voice to CCP) bye for SIP path
    }

    onSharedMediaSessionError(error) {
        this.logger.error("Shared media session error in TalkingState", error).sendInternalLogToServer();
        this.transit(new FailedState(this._callSession, error));
    }

    get name() {
        return CALL_SESSION_STATE.TALKING_STATE;
    }
}

/**
 * DisconnectedState - State after call ends normally
 */
class DisconnectedState extends CallSessionState {
    onEnter() {
        this.logger.info("Entering Disconnected state").sendInternalLogToServer();
        this._callSession._sessionReport.sessionEndTime = new Date();
    }

    get name() {
        return CALL_SESSION_STATE.DISCONNECTED_STATE;
    }
}

/**
 * FailedState - State when call fails
 */
class FailedState extends CallSessionState {
    constructor(callSession, error) {
        super(callSession);
        this._error = error;
    }

    onEnter() {
        this.logger.error(`Entering Failed state: ${this._error}`).sendInternalLogToServer();
        this._callSession._sessionReport.sessionEndTime = new Date();

        this._callSession._onSessionFailed(this._callSession, this._error);

    }

    get name() {
        return CALL_SESSION_STATE.FAILED_STATE;
    }
}

/**
 * CallSession Class
 *
 * This class manages an individual call session that uses a shared media session for WebRTC connections.
 * It is designed to work with multiple concurrent calls (bullet routing).
 */
export default class CallSession {
    /**
     * @param {Object} config - Configuration object
     * @param {Object} [config.logger] - Logger instance
     * @param {String} [config.callId] - contactId
     * @param {String} [config.contactId] - contactId
     * @param {String} [config.contactToken] - Contact token
     * @param {String} [config.connectionId] - Agent media leg identifier
     * @param {Object} [config.signalingChannelManager] - SignalingChannelManager instance
     */
    constructor(config = {}) {
        this._logger = wrapLogger(config.logger, config.callId || 'unknown', 'CallSession');
        this._logger.info("Creating CallSession").sendInternalLogToServer();

        this._callId = config.callId;
        this._contactId = config.callId;
        this._contactToken = config.contactToken;
        this._connectionId = config.connectionId;
        this._agentMediaLegId = config.connectionId;
        this._iceServers = config.iceServers; // For error handling in softphone.js

        this._sessionReport = new SessionReport();
        this._sessionReport.sessionStartTime = new Date();
        this._sessionReport.isPCMv2Path = true; // Mark calls handled by call sessions as PCMv2 path
        this._connectTimeStamp = Date.now();

        this._signalingChannelManager = config.signalingChannelManager;

        // Initialize state machine
        this._setupStateMachine();

        this._isConnected = false;
        this._isTalking = false;

        this._onGumError =
            this._onGumSuccess =
            this._onLocalStreamAdded =
            this._onSessionFailed =
            this._onSessionInitialized =
            this._onSignalingConnected =
            this._onIceCollectionComplete =
            this._onSignalingStarted =
            this._onSessionConnected =
            this._onRemoteStreamAdded =
            this._onSessionCompleted =
            this._onSessionDestroyed = 
            this._replaceStreamCallback = () => {
            };
    }

    get sessionReport() {
        return this._sessionReport;
    }

    get callId() {
        return this._callId;
    }

    /**
     * getMediaStream returns the local stream, which may be acquired from local device or from user provided stream.
     * Rather than getting a stream by calling getUserMedia (which gets a stream from local device such as camera),
     * user could also provide the stream to the RtcSession directly to connect to the other end.
     */
    get mediaStream() {
        return this._localStream;
    }


    /**
     * TODO: fix eslint version to use optional chaining
     * const audioTrack = this._pcm?._mediaStream?.getAudioTracks()[0] || this._localStream?.getAudioTracks()[0];
     *     if (audioTrack) {
     *         audioTrack.enabled = false;
     *     }
     */
    pauseLocalAudio() {
        var audioTrack;
        if (this._localStream) {
            audioTrack = this._localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = false;
            }
        }
    }

    /**
     * TODO: fix eslint version to use optional chaining
     * const audioTrack = this._pcm?._mediaStream?.getAudioTracks()[0] || this._localStream?.getAudioTracks()[0];
     *     if (audioTrack) {
     *         audioTrack.enabled = true;
     *     }
     * Todo: fix mute/unmute
     */
    resumeLocalAudio() {
        var audioTrack;
        if (this._localStream) {
            audioTrack = this._localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
            }
        }
    }

    pauseRemoteAudio() {
        if (this._remoteAudioStream) {
            var audioTrack = this._remoteAudioStream.getTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = false;
            }
        }
    }

    resumeRemoteAudio() {
        if (this._remoteAudioStream) {
            var audioTrack = this._remoteAudioStream.getTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
            }
        }
    }

    /**
     * Callback when gUM succeeds.
     * First param is RtcSession object.
     */
    set onGumSuccess(handler) {
        this._onGumSuccess = handler;
    }

    /**
     * Callback when gUM fails.
     * First param is RtcSession object.
     * Second param is the error.
     */
    set onGumError(handler) {
        this._onGumError = handler;
    }

    /**
     * Callback if failed initializing local resources
     * First param is RtcSession object.
     */
    set onSessionFailed(handler) {
        this._onSessionFailed = handler;
    }

    /**
     * Callback after local user media stream is added to the session.
     * First param is RtcSession object.
     * Second param is media stream
     */
    set onLocalStreamAdded(handler) {
        this._onLocalStreamAdded = handler;
    }

    /**
     * Callback when all local resources are ready. Establishing signaling chanel and ICE collection happens at the same time after this.
     * First param is RtcSession object.
     */
    set onSessionInitialized(handler) {
        this._onSessionInitialized = handler;
    }

    /**
     * Callback when signaling channel is established.
     * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
     *
     * First param is RtcSession object.
     */
    set onSignalingConnected(handler) {
        this._onSignalingConnected = handler;
    }

    /**
     * Callback when ICE collection completes either because there is no more candidate or collection timed out.
     * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
     *
     * First param is RtcSession object.
     * Second param is boolean, TRUE - ICE collection timed out.
     * Third param is number of candidates collected.
     */
    set onIceCollectionComplete(handler) {
        this._onIceCollectionComplete = handler;
    }

    /**
     * Callback when signaling channel is established and ICE collection completed with at least one candidate.
     * First param is RtcSession object.
     */
    set onSignalingStarted(handler) {
        this._onSignalingStarted = handler;
    }

    /**
     * Callback when the call is established (handshaked and media stream should be flowing)
     * First param is RtcSession object.
     */
    set onSessionConnected(handler) {
        this._onSessionConnected = handler;
    }

    /**
     * Callback after remote media stream is added to the session.
     * This could be called multiple times with the same stream if multiple tracks are included in the same stream.
     *
     * First param is RtcSession object.
     * Second param is media stream track.
     */
    set onRemoteStreamAdded(handler) {
        this._onRemoteStreamAdded = handler;
    }

    /**
     * Callback when the hangup is initiated (implies the call was successfully established).
     * First param is RtcSession object.
     */
    set onSessionCompleted(handler) {
        this._onSessionCompleted = handler;
    }

    /**
     * Callback after session is cleaned up, no matter if the call was successfully established or not.
     * First param is RtcSession object.
     * Second param is SessionReport object.
     */
    set onSessionDestroyed(handler) {
        this._onSessionDestroyed = handler;
    }

    /**
     * Called to give consumers a chance to replace a media stream before it is added to a peer connection.
     */
    set replaceStreamCallback(handler) {
        this._replaceStreamCallback = handler;
    }

    set enableAudio(flag) {
        this._enableAudio = flag;
    }

    set echoCancellation(flag) {
        this._echoCancellation = flag;
        this._notifyAttributeChange('echoCancellation', flag)
    }

    /**
     * Optional. RtcSession will grab input device if this is not specified.
     * Please note: this RtcSession class only supports single audio track.
     */
    set mediaStream(input) {
        this._localStream = input;
        this._isUserProvidedStream = true;
        this._notifyAttributeChange('mediaStream', input)
    }

    /**
     * Needed, expect an audio element that can be used to play remote audio stream.
     */
    set remoteAudioElement(element) {
        this._remoteAudioElement = element;
        this._notifyAttributeChange('remoteAudioElement', element)
    }

    /**
     * Override the default signaling connect time out.
     */
    set signalingConnectTimeout(ms) {
        this._signalingConnectTimeout = ms;
    }

    /**
     * Override the default ICE collection time limit.
     */
    set iceTimeoutMillis(timeoutMillis) {
        this._iceTimeoutMillis = timeoutMillis;
    }

    /**
     * Override the default GUM timeout time limit.
     */
    set gumTimeoutMillis(timeoutMillis) {
        this._gumTimeoutMillis = timeoutMillis;
    }

    /**
     * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
     * Setting this attribute will force connect-rtc-js to only use specified codec.
     * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
     * Supported audio codecs: opus.
     */
    set forceAudioCodec(audioCodec) {
        this._forceAudioCodec = audioCodec;
    }

    /**
     * connect-rtc-js disables OPUS DTX by default because it harms audio quality.
     * @param flag boolean
     */
    set enableOpusDtx(flag) {
        this._enableOpusDtx = flag;
    }

    /**
     * Disable media stream refresh
     * Called when a user-provided stream is being used (e.g., after voice enhancement)
     * Prevents RTC.js from changing the media stream
     * Notifies SharedMediaSession through attribute change mechanism
     */
    disableMediaStreamRefresh() {
        this._isUserProvidedStream = true;
        this._notifyAttributeChange('disableMediaStreamRefresh', true);
    }

    /**
     * Set up the state machine
     * @private
     */
    _setupStateMachine() {
        this._state = new InitialState(this);
        this._state.onEnter();
    }

    transit(nextState) {
        try {
            this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
            if (this._state && this._state.onExit) {
                this._state.onExit();
            }
        } finally {
            this._state = nextState;
            if (nextState.onEnter) {
                try {
                    nextState.onEnter();
                } catch (e) {
                    this._logger.warn(nextState.name + '#onEnter failed', e);
                    throw e; // eslint-disable-line no-unsafe-finally
                }
            }
        }
    }

    /**
     * Handle message from SignalingChannelManager
     * @param {Object} message - The message to handle
     */
    handleMessage(message) {
        this._logger.info(`Received message: ${message.method || message.type}`).sendInternalLogToServer();
        this._state.handleMessage(message);
    }

    /**
     * Called when shared media session is connected
     */
    onSharedMediaSessionConnected() {
        this._logger.info("Shared media session connected").sendInternalLogToServer();
        this._state.onSharedMediaSessionConnected();
    }

    /**
     * Called when shared media session encounters an error
     * @param {Error} error - The error that occurred
     */
    onSharedMediaSessionError(error) {
        this._logger.error("Shared media session error", error).sendInternalLogToServer();
        this._state.onSharedMediaSessionError(error);
    }

    /**
     * Connect the call session
     * Will be called when shared media session is ready
     */
    connect() {
        this._logger.info("Call session connect is not supported. Use Peer Connectio Manager Connect instead").sendInternalLogToServer();
    }

    /**
     * Connect to a contact
     */
    connectContact() {
        this._logger.info("Connecting contact").sendInternalLogToServer();
        this._state.connectContact();
    }

    hangup() {
        this._logger.info("Disconnecting call session").sendInternalLogToServer();
        this._state.disconnectContact();
    }

    shouldSkipConnectContact(shouldSkipConnectContact) {
        return this._shouldSkipConnectContact = shouldSkipConnectContact;
    }

    /**
     * Handle events from the shared media session
     * This method creates a bridge between the shared WebRTC connection and the individual call session
     *
     * @param {String} eventName - Name of the event from shared media session
     * @param {*} eventData - Optional event data passed from the shared media session
     */
    onSharedMediaSessionEvent(eventName, eventData) {
        this._logger.info(`Received shared media session event: ${eventName}`).sendInternalLogToServer();

        switch (eventName) {
            // Local media related events
            case 'gumError':
                this._onGumError(this, eventData);
                break;

            case 'gumSuccess':
                this._onGumSuccess(this);
                break;

            case 'localPeerConnectionAvailable':
                if (eventData) {
                    this._pc = eventData;
                }
                break;

            case 'localStreamAdded':
                this._onLocalStreamAdded(this, eventData);
                break;

            case 'replaceStreamCallback':
                return this._replaceStreamCallback(this, eventData);

            // Session state events
            case 'sessionInitialized':
                this._onSessionInitialized(eventData)
                break;

            case 'sessionFailed':
                if (this._state && typeof this._state.onSharedMediaSessionError === 'function') {
                    this._state.onSharedMediaSessionError(eventData);
                }
                break;
            // Signaling related events
            case 'signalingConnected':
                // Signaling is handled at the shared media session level
                // No specific action needed for individual call sessions
                break;
            case 'iceCollectionComplete':
                // ICE collection is complete, no specific action needed at call session level
                break;

            case 'signalingStarted':
                // Signaling has started, which means ICE collection is done
                // and an offer has been sent
                break;

            case 'sessionConnected':
                // Store the peer connection reference if provided
                if (eventData) {
                    this._pc = eventData;
                }

                // Notify state machine
                if (this._state && typeof this._state.onSharedMediaSessionConnected === 'function') {
                    this._state.onSharedMediaSessionConnected();
                }
                break;

            case 'peerConnectionId':
                // Store the peer connection reference if provided
                if (eventData) {
                    this._peerConnectionId = eventData;
                }

                break;
            case 'peerConnectionToken':
                // Store the peer connection reference if provided
                if (eventData) {
                    this._peerConnectionToken = eventData;
                }

                break;

            // Remote stream events
            case 'remoteStreamAdded':
                this._onRemoteStreamAdded(eventData);
                break;

            case 'sessionCompleted':
                // Session completed normally
                if (!(this._state instanceof DisconnectedState) && !(this._state instanceof FailedState)) {
                    this._logger.info(`Disconnecting the call session as the shared media session is over. Should only happen for Persistent Connection Not Allowlisted code path`);
                    this.transit(new DisconnectedState(this));
                }
                break;
            case 'sessionDestroyed':
                // Final cleanup after session is destroyed
                this._sessionReport.sessionEndTime = new Date();
                break;

            case 'isPersistentConnectionAllowlistedAndEnabled':
                this._isPersistentConnectionAllowlistedAndEnabled = eventData;
                this._sessionReport.isPersistentPeerConnection = eventData;
                break;

            case 'sessionSetupLatencyMetricReady': {
                // Explicitly copy shared media session properties while preserving call session specific ones
                if (eventData) {
                    // Copy shared media session timing properties
                    this._sessionReport.gumTimeMillis = eventData.gumTimeMillis;
                    this._sessionReport.initializationTimeMillis = eventData.initializationTimeMillis;
                    this._sessionReport.iceCollectionTimeMillis = eventData.iceCollectionTimeMillis;
                    this._sessionReport.signallingConnectTimeMillis = eventData.signallingConnectTimeMillis;
                    this._sessionReport.handshakingTimeMillis = eventData.handshakingTimeMillis;
                    this._sessionReport.preTalkingTimeMillis = eventData.preTalkingTimeMillis;
                    
                    // Copy shared media session failure flags
                    this._sessionReport.iceCollectionFailure = eventData.iceCollectionFailure;
                    this._sessionReport.signallingConnectionFailure = eventData.signallingConnectionFailure;
                    this._sessionReport.handshakingFailure = eventData.handshakingFailure;
                    this._sessionReport.gumOtherFailure = eventData.gumOtherFailure;
                    this._sessionReport.gumTimeoutFailure = eventData.gumTimeoutFailure;
                    this._sessionReport.createOfferFailure = eventData.createOfferFailure;
                    this._sessionReport.setLocalDescriptionFailure = eventData.setLocalDescriptionFailure;
                    this._sessionReport.userBusyFailure = eventData.userBusyFailure;
                    this._sessionReport.invalidRemoteSDPFailure = eventData.invalidRemoteSDPFailure;
                    this._sessionReport.noRemoteIceCandidateFailure = eventData.noRemoteIceCandidateFailure;
                    this._sessionReport.setRemoteDescriptionFailure = eventData.setRemoteDescriptionFailure;
                    
                    // Copy shared media session path and platform properties
                    this._sessionReport.isMediaClusterPath = eventData.isMediaClusterPath;
                    this._sessionReport.vdiPlatform = eventData.vdiPlatform;
                    this._sessionReport.vdiInitializationFailed = eventData.vdiInitializationFailed;
                    this._sessionReport.vdiClientVersion = eventData.vdiClientVersion;
                    this._sessionReport.vdiClientPlatform = eventData.vdiClientPlatform;
                    this._sessionReport.iceCredentialSource = eventData.iceCredentialSource;
                    this._sessionReport.isContactCredentialsDifferentRegion = eventData.isContactCredentialsDifferentRegion;
                }
                break;
            }

            // Peer connection state change events (for VDI compatibility - Citrix doesn't support addEventListener)
            case 'iceConnectionStateChange':
                this._logger.info(`CallSession ICE Connection State: ${eventData}`).sendInternalLogToServer();
                if (eventData === 'disconnected') {
                    this._logger.info('ICE connection lost - incrementing iceConnectionsLost counter').sendInternalLogToServer();
                    this._sessionReport.iceConnectionsLost += 1;
                } else if (eventData === 'failed') {
                    this._logger.info('ICE connection failed - marking iceConnectionsFailed').sendInternalLogToServer();
                    this._sessionReport.iceConnectionsFailed = true;
                }
                break;

            case 'peerConnectionStateChange':
                this._logger.info(`CallSession Peer Connection State: ${eventData}`).sendInternalLogToServer();
                if (eventData === 'failed') {
                    this._logger.info('Peer connection failed - marking peerConnectionFailed').sendInternalLogToServer();
                    this._sessionReport.peerConnectionFailed = true;
                }
                break;

            case 'iceRestartComplete':
                // Record discrete ICE restart event for CloudWatch metrics
                if (eventData) {
                    this._logger.info(`ICE restart event: success=${eventData.success}, time=${eventData.timeMillis}ms, retries=${eventData.inviteRetries}`).sendInternalLogToServer();
                    
                    // Accumulate metrics for this call session
                    if (eventData.success) {
                        this._sessionReport.iceRestartSuccesses += 1;
                    }
                    this._sessionReport.iceRestartAttempts += 1;
                    this._sessionReport.iceRestartInviteRetries = eventData.inviteRetries;
                    this._sessionReport.iceRestartTimeMillis = eventData.timeMillis;
                    this._sessionReport.iceRestartFailed = !eventData.success;
                }
                break;

            default:
                this._logger.info(`Unhandled shared media session event: ${eventName}`);
        }
    }

    /**
     * Notify all registered callbacks about an attribute change
     * @param {String} attributeName - The name of the attribute that changed
     * @param {Any} attributeValue - The new value of the attribute
     * @private
     */
    _notifyAttributeChange(attributeName, attributeValue) {
        this._logger.info(`Notifying attribute change for ${attributeName}`).sendInternalLogToServer();

        try {
            this._attributeChangeCallback(this._agentMediaLegId, attributeName, attributeValue);
        } catch (e) {
            this._logger.error(`Error in attribute change callback for ${attributeName}`, e).sendInternalLogToServer();
        }
    }

    /**
     * Register a callback to PCM
     * @param {Function} callback - Function to call when attributes change
     */
    registerAttributeChangeCallback(callback) {
        this._attributeChangeCallback = callback
    }
}
