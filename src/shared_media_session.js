/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { closeStream, hitch, promiseWithTimeout, SdpOptions, transformSdp, wrapLogger } from './utils';
import { SessionReport } from './session_report';
import {
    DEFAULT_CONNECT_TIMEOUT_MS,
    DEFAULT_GUM_TIMEOUT_MS,
    DEFAULT_ICE_CANDIDATE_POOL_SIZE,
    DEFAULT_ICE_TIMEOUT_MS,
    ICE_CONNECTION_STATE,
    PEER_CONNECTION_STATE,
    RTC_ERRORS,
    RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_OPTIONAL_CONFIG
} from './rtc_const';
import {
    AccessDeniedExceptionName,
    BusyExceptionName,
    CallNotFoundExceptionName,
    Timeout,
    GumTimeout,
    IllegalParameters,
    IllegalState,
    UnsupportedOperation,
    GumTimeoutExceptionName
} from './exceptions';
import AmznRtcSharedMediaSignaling from './shared_media_signaling';
import {v4 as uuid} from 'uuid';
import { parseCandidate } from 'sdp';
import StandardStrategy from "./strategies/StandardStrategy";
import { extractMediaStatsFromStats } from "./rtp-stats";
import { ConnectedSubstate } from './shared_media_session_talking_substates';

/**
 * SharedMediaSessionState is the base class for all states in the SharedMediaSession state machine
 */
export class SharedMediaSessionState {
    /**
     * @param {SharedMediaSession} sharedMediaSession
     */
    constructor(sharedMediaSession) {
        this._sharedMediaSession = sharedMediaSession;
    }

    onEnter() {
    }

    onExit() {
    }

    _isCurrentState() {
        return this._sharedMediaSession._state === this;
    }

    transit(nextState) {
        if (this._isCurrentState()) {
            this._sharedMediaSession.transit(nextState);
        }
    }

    get logger() {
        return this._sharedMediaSession._logger;
    }

    hangup() {
        this.transit(new FailedState(this._sharedMediaSession));
    }

    onIceCandidate(evt) {// eslint-disable-line no-unused-vars
        //ignore candidate by default, ConnectSignalingAndIceCollectionState will override to collect candidates, but collecting process could last much longer than ConnectSignalingAndIceCollectionState
        //we don't want to spam the console log
    }

    onRemoteHungup() {
        throw new UnsupportedOperation('onRemoteHungup not implemented by ' + this.name);
    }

    get name() {
        return "SharedMediaSessionState";
    }

    onSignalingConnected() {
        throw new UnsupportedOperation('onSignalingConnected not implemented by ' + this.name);
    }

    onSignalingHandshaked() {
        throw new UnsupportedOperation('onSignalingHandshaked not implemented by ' + this.name);
    }

    onSignalingFailed(e) {// eslint-disable-line no-unused-vars
        throw new UnsupportedOperation('onSignalingFailed not implemented by ' + this.name);
    }

    onIceStateChange(evt) {// eslint-disable-line no-unused-vars
    }
}

/**
 * GrabLocalMediaState acquires the local media stream from the microphone
 */
export class GrabLocalMediaState extends SharedMediaSessionState {
    onEnter() {
        var self = this;
        if (self._sharedMediaSession._isUserProvidedStream) {
            self.transit(new CreateOfferState(self._sharedMediaSession));
        } else {

            // Use the device requested from the constructor.
            self._sharedMediaSession._doGUM()
                .then((stream) => {
                    const audioTracks = stream.getAudioTracks();
                    if (audioTracks.length > 0) {
                        self._sharedMediaSession._selectedMicrophoneDeviceId = audioTracks[0].getSettings().deviceId;

                        var replacementStream = self._sharedMediaSession._replaceStreamCallback(self, stream);

                        // Promisify it if it's not a promise.
                        if (replacementStream == undefined) {
                            replacementStream = Promise.resolve(stream);
                        } else if (!(replacementStream instanceof Promise)) {
                            replacementStream = Promise.resolve(replacementStream);
                        }

                        promiseWithTimeout(replacementStream, self._sharedMediaSession._gumTimeoutMillis, new Timeout('Timed out waiting for replacement stream'))
                            .then(stream => {
                                const audioTracks = stream.getAudioTracks();

                                if (audioTracks.length > 0) {
                                    const track = audioTracks[0];

                                    if (track.getSettings().deviceId != self._sharedMediaSession._selectedMicrophoneDeviceId) {
                                        self._sharedMediaSession._logger.info(`[GrabLocalMediaState] Audio stream was replaced with track: ${JSON.stringify(track.getSettings())}`).sendInternalLogToServer();
                                    }

                                    self._sharedMediaSession._localStream = stream;
                                    self.transit(new CreateOfferState(self._sharedMediaSession));
                                } else {
                                    self.transit(new FailedState(self._sharedMediaSession, "A audio track is required."));
                                }
                            }, e => {
                                self.transit(new FailedState(self._sharedMediaSession, e));
                            });
                    } else {
                        self.transit(new FailedState(self._sharedMediaSession, "A audio track is required."));
                    }
                }, e => {
                    self.transit(new FailedState(self._sharedMediaSession, e));
                });
        }
    }

    get name() {
        return "GrabLocalMediaState";
    }
}

/**
 * CreateOfferState creates an SDP offer for the peer connection
 */
export class CreateOfferState extends SharedMediaSessionState {
    onEnter() {
        var self = this;
        var stream = self._sharedMediaSession._localStream;
        self._sharedMediaSession._strategy.addStream(self._sharedMediaSession._pc, stream);
        self._sharedMediaSession._onLocalPeerConnectionAvailable(self._sharedMediaSession, self._sharedMediaSession._pc);
        self._sharedMediaSession._onLocalStreamAdded(self._sharedMediaSession, stream);
        self._sharedMediaSession._pc.createOffer().then(rtcSessionDescription => {
            self._sharedMediaSession._localSessionDescription = rtcSessionDescription;
            self._sharedMediaSession._sessionReport.createOfferFailure = false;
            self.transit(new SetLocalSessionDescriptionState(self._sharedMediaSession));
        }).catch(e => {
            self.logger.error('CreateOffer failed', e);
            self._sharedMediaSession._sessionReport.createOfferFailure = true;
            self.transit(new FailedState(self._sharedMediaSession, RTC_ERRORS.CREATE_OFFER_FAILURE));
        });
    }

    get name() {
        return "CreateOfferState";
    }
}

/**
 * SetLocalSessionDescriptionState sets the SDP offer as the local description for the peer connection
 */
export class SetLocalSessionDescriptionState extends SharedMediaSessionState {
    onEnter() {
        var self = this;

        // fix/modify SDP as needed here, before setLocalDescription
        var localDescription = self._sharedMediaSession._localSessionDescription;
        var sdpOptions = new SdpOptions();
        // Set audio codec.
        if (self._sharedMediaSession._forceAudioCodec) {
            sdpOptions.forceCodec['audio'] = self._sharedMediaSession._forceAudioCodec;
        }
        sdpOptions.enableOpusDtx = self._sharedMediaSession._enableOpusDtx;

        var transformedSdp = transformSdp(localDescription.sdp, sdpOptions);
        localDescription.sdp = transformedSdp.sdp;
        localDescription.sdp += 'a=ptime:20\r\n';
        localDescription.sdp += 'a=maxptime:20\r\n';
        localDescription.sdp = localDescription.sdp.replace("minptime=10", "minptime=20");

        self.logger.info('LocalSD', self._sharedMediaSession._localSessionDescription);
        self._sharedMediaSession._pc.setLocalDescription(self._sharedMediaSession._localSessionDescription).then(() => {
            var initializationTime = Date.now() - self._sharedMediaSession._connectTimeStamp;
            self._sharedMediaSession._sessionReport.initializationTimeMillis = initializationTime;
            self._sharedMediaSession._onSessionInitialized(self._sharedMediaSession, initializationTime);
            self._sharedMediaSession._sessionReport.setLocalDescriptionFailure = false;
            self.transit(new ConnectSignalingAndIceCollectionState(self._sharedMediaSession, transformedSdp.mLines));
        }).catch(e => {
            self.logger.error('SetLocalDescription failed', e);
            self._sharedMediaSession._sessionReport.setLocalDescriptionFailure = true;
            self.transit(new FailedState(self._sharedMediaSession, RTC_ERRORS.SET_LOCAL_DESCRIPTION_FAILURE));
        });
    }

    get name() {
        return "SetLocalSessionDescriptionState";
    }
}

/**
 * Kick off signaling connection. Wait until signaling connects and ICE collection (which already started in previous state) completes.
 * ICE collection times out after user specified amount of time (default to DEFAULT_ICE_TIMEOUT_MS) in case user has complex network environment that blackholes STUN/TURN requests. In this case at least one candidate is required to move forward.
 * ICE collection could also wrap up before timeout if it's determined that RTP candidates from same TURN server have been collected for all m lines.
 */
export class ConnectSignalingAndIceCollectionState extends SharedMediaSessionState {
    /**
     * Create ConnectSignalingAndIceCollectionState object.
     * @param {SharedMediaSession} sharedMediaSession
     * @param {number} mLines Number of m lines in SDP
     */
    constructor(sharedMediaSession, mLines) {
        super(sharedMediaSession);
        this._iceCandidates = [];
        this._iceCandidateFoundationsMap = {};
        this._mLines = mLines;
    }

    onEnter() {
        var self = this;
        self._startTime = Date.now();
        setTimeout(() => {
            if (self._isCurrentState() && !self._iceCompleted) {
                self.logger.warn('ICE collection timed out');
                self._reportIceCompleted(true);
            }
        }, self._sharedMediaSession._iceTimeoutMillis);
        self._sharedMediaSession._createSignalingChannel().connect();
    }

    onSignalingConnected() {
        this._sharedMediaSession._signallingConnectTimestamp = Date.now();
        this._sharedMediaSession._sessionReport.signallingConnectTimeMillis = this._sharedMediaSession._signallingConnectTimestamp - this._startTime;
        this._signalingConnected = true;
        this._sharedMediaSession._onSignalingConnected(this._sharedMediaSession);
        this._sharedMediaSession._sessionReport.signallingConnectionFailure = false;
        this._checkAndTransit();
    }

    onSignalingFailed(e) {
        this._sharedMediaSession._sessionReport.signallingConnectTimeMillis = Date.now() - this._startTime;
        this.logger.error('Failed connecting to signaling server', e);
        this._sharedMediaSession._sessionReport.signallingConnectionFailure = true;
        this.transit(new FailedState(this._sharedMediaSession, RTC_ERRORS.SIGNALLING_CONNECTION_FAILURE));
    }

    _createLocalCandidate(initDict) {
        return new RTCIceCandidate(initDict);
    }

    onIceCandidate(evt) {
        var candidate = evt.candidate;
        this.logger.log('onicecandidate ' + JSON.stringify(candidate));
        if (candidate) {
            if (candidate.candidate) {
                this._iceCandidates.push(this._createLocalCandidate(candidate));
                if (!this._iceCompleted) {
                    this._checkCandidatesSufficient(candidate);
                }
            }

        } else {
            this._reportIceCompleted(false);
        }
    }

    _checkCandidatesSufficient(candidate) {
        //check if we collected sufficient candidates from single media server to start the call
        var candidateObj = parseCandidate(candidate.candidate);
        if (candidateObj.component != 1) {
            return;
        }
        var candidateFoundation = candidateObj.foundation;
        var candidateMLineIndex = candidate.sdpMLineIndex;
        if (candidateFoundation && candidateMLineIndex >= 0 && candidateMLineIndex < this._mLines) {
            var mIndexList = this._iceCandidateFoundationsMap[candidateFoundation] || [];
            if (!mIndexList.includes(candidateMLineIndex)) {
                mIndexList.push(candidateMLineIndex);
            }
            this._iceCandidateFoundationsMap[candidateFoundation] = mIndexList;

            if (this._mLines == mIndexList.length) {
                this._reportIceCompleted(false);
            }
        }
    }

    _reportIceCompleted(isTimeout) {
        this._sharedMediaSession._sessionReport.iceCollectionTimeMillis = Date.now() - this._startTime;
        this._iceCompleted = true;
        this._sharedMediaSession._onIceCollectionComplete(this._sharedMediaSession, isTimeout, this._iceCandidates.length);

        if (this._iceCandidates.length > 0) {
            this._sharedMediaSession._sessionReport.iceCollectionFailure = false;
            this._checkAndTransit();
        } else {
            this.logger.error('No ICE candidate');
            this._sharedMediaSession._sessionReport.iceCollectionFailure = true;
            this.transit(new FailedState(this._sharedMediaSession, RTC_ERRORS.ICE_COLLECTION_TIMEOUT));
        }
    }

    _checkAndTransit() {
        if (this._iceCompleted && this._signalingConnected) {
            this.transit(new InviteAnswerState(this._sharedMediaSession, this._iceCandidates));
        } else if (!this._iceCompleted) {
            this.logger.log('Pending ICE collection');
        } else {//implies _signalingConnected == false
            this.logger.log('Pending signaling connection');
        }
    }

    get name() {
        return "ConnectSignalingAndIceCollectionState";
    }
}

/**
 * InviteAnswerState sends the SDP offer and ICE candidates to the signaling server
 */
export class InviteAnswerState extends SharedMediaSessionState {
    constructor(sharedMediaSession, iceCandidates) {
        super(sharedMediaSession);
        this._iceCandidates = iceCandidates;
    }

    onEnter() {
        var sharedMediaSession = this._sharedMediaSession;
        sharedMediaSession._onSignalingStarted(sharedMediaSession);

        sharedMediaSession._signalingChannel.invite(sharedMediaSession._localSessionDescription.sdp, this._iceCandidates);
    }

    onSignalingAnswered(sdp, candidates, inactivityDuration, peerConnectionId, peerConnectionToken) {
        this._sharedMediaSession._sessionReport.userBusyFailure = false;
        this._sharedMediaSession._sessionReport.handshakingFailure = false;

        // signaling answered, set the inactivityDuration, peerConnectionId and peerConnectionToken
        // Todo: inactivityDuration should be owned by PCM only, reset for every call.
        this._sharedMediaSession.inactivityDuration = inactivityDuration;
        this._sharedMediaSession.peerConnectionId = peerConnectionId;
        this._sharedMediaSession.peerConnectionToken = peerConnectionToken;

        this._sharedMediaSession._isPersistentConnectionAllowlistedCallback(!!peerConnectionId);
        this._sharedMediaSession._setPeerConnectionIdCallback(peerConnectionId);
        this._sharedMediaSession._setPeerConnectionTokenCallback(peerConnectionToken);
        this._sharedMediaSession._setInactivityDurationCallback(inactivityDuration);

        this.transit(new AcceptState(this._sharedMediaSession, sdp, candidates));
    }

    onSignalingFailed(e) {
        var reason;
        if (e.name == BusyExceptionName) {
            this.logger.error('User Busy, possibly multiple CCP windows open', e);
            this._sharedMediaSession._sessionReport.userBusyFailure = true;
            this._sharedMediaSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.USER_BUSY;
        } else if (e.name == CallNotFoundExceptionName) {
            this.logger.error('Call not found. One of the participant probably hungup.', e);
            reason = RTC_ERRORS.CALL_NOT_FOUND;
            this._sharedMediaSession._sessionReport.handshakingFailure = true;
        } else {
            this.logger.error('Failed handshaking with signaling server', e);
            this._sharedMediaSession._sessionReport.userBusyFailure = false;
            this._sharedMediaSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
        }
        this.transit(new FailedState(this._sharedMediaSession, reason));
    }

    hangup() {
        this.transit(new FailedState(this._sharedMediaSession, "Agent clicks hangs up"));
    }

    get name() {
        return "InviteAnswerState";
    }
}

/**
 * AcceptState processes the SDP answer and ICE candidates from the signaling server
 */
export class AcceptState extends SharedMediaSessionState {
    constructor(sharedMediaSession, sdp, candidates) {
        super(sharedMediaSession);
        this._sdp = sdp;
        this._candidates = candidates;
    }

    _createSessionDescription(initDict) {
        return new RTCSessionDescription(initDict);
    }

    _createRemoteCandidate(initDict) {
        return new RTCIceCandidate(initDict);
    }

    onEnter() {
        var self = this;
        var sharedMediaSession = self._sharedMediaSession;

        if (!self._sdp) {
            self.logger.error('Invalid remote SDP');
            sharedMediaSession._stopSession();
            sharedMediaSession._sessionReport.invalidRemoteSDPFailure = true;
            self.transit(new FailedState(sharedMediaSession, RTC_ERRORS.INVALID_REMOTE_SDP));
            return;
        } else if (!self._candidates || self._candidates.length < 1) {
            self.logger.error('No remote ICE candidate');
            sharedMediaSession._stopSession();
            sharedMediaSession._sessionReport.noRemoteIceCandidateFailure = true;
            self.transit(new FailedState(sharedMediaSession, RTC_ERRORS.NO_REMOTE_ICE_CANDIDATE));
            return;
        }

        sharedMediaSession._sessionReport.invalidRemoteSDPFailure = false;
        sharedMediaSession._sessionReport.noRemoteIceCandidateFailure = false;
        self._sharedMediaSession._strategy.setRemoteDescription(self, sharedMediaSession);
    }

    onSignalingHandshaked() {
        this._sharedMediaSession._sessionReport.handshakingTimeMillis = Date.now() - this._sharedMediaSession._signallingConnectTimestamp;
        this._signalingHandshaked = true;
        this._checkAndTransit();
    }

    _checkAndTransit() {
        if (this._signalingHandshaked && this._remoteDescriptionSet) {
            this.transit(new TalkingState(this._sharedMediaSession));
        } else if (!this._signalingHandshaked) {
            this.logger.log('Pending handshaking');
        } else { //implies _remoteDescriptionSet == false
            this.logger.log('Pending setting remote description');
        }
    }

    onPeerConnectionStateChange() {
        // do nothing
    }

    get name() {
        return "AcceptState";
    }
}

/**
 * TalkingState represents an active media session
 */
export class TalkingState extends SharedMediaSessionState {

    onEnter() {
        this._startTime = Date.now();
        this._sharedMediaSession._sessionReport.preTalkingTimeMillis = this._startTime - this._sharedMediaSession._connectTimeStamp;
        this._sharedMediaSession._sessionReport.isMediaClusterPath = this._sharedMediaSession._signalingChannel._isMediaClusterPath;

        //Todo: verify how to mute/resume local audio for new call session
        this._sharedMediaSession.resumeLocalAudio();

        this._sharedMediaSession._onSessionConnected(this._sharedMediaSession);
        this._sharedMediaSession._onSessionSetupLatencyMetricReady(this._sharedMediaSession._sessionReport);
        this._sharedMediaSession._setupMetricsSent = true;

        this.setSubState(new ConnectedSubstate(this._sharedMediaSession));
    }

    onSignalingReconnected() {
    }

    onRemoteHungup() {
        this._sharedMediaSession._signalingChannel.hangup();
        this.transit(new DisconnectedState(this._sharedMediaSession));
    }

    hangup(serverInitiated = false) {
        // hangup for sharedMediaSession always destory the peer connection
        this._sharedMediaSession._signalingChannel.hangup(serverInitiated);
        this.transit(new DisconnectedState(this._sharedMediaSession));
    }

    onIceStateChange(evt) {
        var iceState = this._sharedMediaSession._strategy.onIceStateChange(evt, this._sharedMediaSession._pc);
        this.logger.info('ICE Connection State: ', iceState);

        if (this._subState && typeof this._subState.onIceStateChange === 'function') {
            this._subState.onIceStateChange(evt);
        }
    }

    onSignalingConnected() {
        if (this._subState && typeof this._subState.onSignalingConnected === 'function') {
            this._subState.onSignalingConnected();
        }
    }
    onSignalingFailed(e) {
        if (this._subState && typeof this._subState.onSignalingFailed === 'function') {
            this._subState.onSignalingFailed(e);
        }
        var reason;
        if (e.name == AccessDeniedExceptionName) {
            this.logger.error('[TalkingState] Access Denied by server', e);
            this._sharedMediaSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
            this.transit(new FailedState(this._sharedMediaSession, reason));
        } else {
            this.logger.error('[TalkingState] Failed handshaking with signaling server', e);
        }
    }
    onSignalingAnswered(sdp, candidates) {
        if (this._subState && typeof this._subState.onSignalingAnswered === 'function') {
            this._subState.onSignalingAnswered(sdp, candidates);
        }
    }
    onSignalingHandshaked() {
        if (this._subState && typeof this._subState.onSignalingHandshaked === 'function') {
            this._subState.onSignalingHandshaked();
        }
    }
    onIceCandidate(evt) {
        if (this._subState && typeof this._subState.onIceCandidate === 'function') {
            this._subState.onIceCandidate(evt);
        }
    }

    onIceRestartFailure() {
        if (this._subState && typeof this._subState.onIceRestartFailure === 'function') {
            this._subState.onIceRestartFailure();
        }
    }

    _checkAndTransit() {
        if (this._subState && typeof this._subState._checkAndTransit === 'function') {
            this._subState._checkAndTransit();
        }
    }

    setSubState(nextState) {
        this.logger.info('Substate: ' + (this._subState ? this._subState.name : 'null') + ' => ' + nextState.name);
        if (this._subState) {
            this._subState.onExit();
        }
        this._subState = nextState;
        this._subState.onEnter();
    }

    onPeerConnectionStateChange() {
        var peerConnectionState = this._sharedMediaSession._strategy.onPeerConnectionStateChange(this._sharedMediaSession._pc);
        this.logger.info('Peer Connection State: ', peerConnectionState);

        if (peerConnectionState == PEER_CONNECTION_STATE.FAILED) {
            this._sharedMediaSession._sessionReport.peerConnectionFailed = true;
        }

        // Notify via callback for Citrix compatibility
        if (typeof this._sharedMediaSession._onPeerConnectionStateChangeCallback === 'function') {
            this._sharedMediaSession._onPeerConnectionStateChangeCallback(peerConnectionState);
        }
    }

    onExit() {
        this._sharedMediaSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
        this._sharedMediaSession._detachMedia();
        this._sharedMediaSession._sessionReport.sessionEndTime = new Date();
        this._sharedMediaSession._onSessionCompleted(this._sharedMediaSession);
        if (this._subState) {
            this._subState.onExit();
        }
    }

    get name() {
        return "TalkingState";
    }
}

export class CleanUpState extends SharedMediaSessionState {
    onEnter() {
        // Todo: Re-evaluatino the media stream handling: mute at the end of the callSession end
        this._startTime = Date.now();
        
        // Reset cleanup flag since we're performing cleanup now
        this._sharedMediaSession._needsCleanup = false;
        
        this._sharedMediaSession._stopSession();
        this._sharedMediaSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
        this._sharedMediaSession._onSessionDestroyed(this._sharedMediaSession, this._sharedMediaSession._sessionReport);
    }

    get name() {
        return "CleanUpState";
    }

    hangup() {
        //do nothing, already at the end of lifecycle
    }
}

export class DisconnectedState extends CleanUpState {
    onSignalingHandshaked() {
        // do nothing
    }

    onSignalingFailed(e) {
        // do nothing - session already disconnected
        this._sharedMediaSession._logger.info('Ignoring signaling failure in DisconnectedState', e);
    }

    onPeerConnectionStateChange() {
        // do nothing
    }

    get name() {
        return "DisconnectedState";
    }
}

export class FailedState extends CleanUpState {
    constructor(sharedMediaSession, failureReason) {
        super(sharedMediaSession);
        this._failureReason = failureReason || `ForceDestroyedIn${sharedMediaSession._state ? sharedMediaSession._state.name : 'UnknownState'}`;
    }

    onEnter() {
        this._sharedMediaSession._sessionReport.sessionEndTime = new Date();
        
        try {
            // If we failed before reaching TalkingState, send setup metrics now
            // TalkingState sets this flag when it calls the callback
            if (!this._sharedMediaSession._setupMetricsSent) {
                this._sharedMediaSession._onSessionSetupLatencyMetricReady(this._sharedMediaSession._sessionReport);
                this._sharedMediaSession._setupMetricsSent = true;
            }
            
            this._sharedMediaSession._onSessionFailed(this._sharedMediaSession, this._failureReason);
        } catch (e) {
            this.logger.warn(`FailedState#onEnter failed ${e}`);
        }
        super.onEnter();
    }

    get name() {
        return "FailedState";
    }
}

export default class SharedMediaSession {
    /**
     * Constructor for SharedMediaSession
     * @param {Object} config Configuration options
     */
    constructor(config) {
        if (!config) {
            throw new IllegalParameters('config is required');
        }
        if (!config.iceServers) {
            throw new IllegalParameters('iceServers required');
        }

        if (typeof config.logger !== 'object') {
            throw new IllegalParameters('logger required');
        }
        this._callId = config.callId || uuid();
        this._strategy = config.strategy || new StandardStrategy();
        this._connectionId = config.connectionId || uuid();
        this._signalingChannelManager = config.signalingChannelManager;
        this._isPersistentConnectionEnabled = config.isPersistentConnectionEnabled
        this._allowExtendedPersistentConnection = !!config.allowExtendedPersistentConnection;
        this._sessionReport = new SessionReport();
        this._iceServers = config.iceServers;
        this._contactToken = config.contactToken;
        this._originalLogger = config.logger;
        this._logger = wrapLogger(config.logger, this._callId, 'SharedMediaSession');
        this._iceTimeoutMillis = DEFAULT_ICE_TIMEOUT_MS;
        this._gumTimeoutMillis = DEFAULT_GUM_TIMEOUT_MS;
        this._requestIceAccess = config.requestIceAccess;
        this._browserId = config.browserId;
        this._enableAudio = true;
        this._legacyStatsReportSupport = false;
        this._setupMetricsSent = false;
        /**
         * user may provide the stream to the RtcSession directly to connect to the other end.
         * user may also acquire the stream from the local device.
         * This flag is used to track where the stream is acquired.
         * If it's acquired from local devices, then we must close the stream when the session ends.
         * If it's provided by user (rather than local camera/microphone), then we should leave it open when the
         * session ends.
         */
        this._isUserProvidedStream = false;

        this._onGumError =
            this._onGumSuccess =
            this._onLocalPeerConnectionAvailable =
            this._onLocalStreamAdded =
            this._onSessionFailed =
            this._onSessionInitialized =
            this._onSignalingConnected =
            this._onIceCollectionComplete =
            this._onSignalingStarted =
            this._onSessionConnected =
            this._onSessionSetupLatencyMetricReady =
            this._onRemoteStreamAdded =
            this._onSessionCompleted =
            this._onSessionDestroyed =
            this._setInactivityDurationCallback =
            this._isPersistentConnectionAllowlistedCallback =
            this._setPeerConnectionIdCallback =
            this._setPeerConnectionTokenCallback =
            this._onIceConnectionStateChangeCallback =
            this._onPeerConnectionStateChangeCallback =
            this._onIceRestartCompleteCallback =
            this._replaceStreamCallback = () => {
            };

        // VDI cleanup flag
        this._needsCleanup = false;

        // Track current microphone device ID for idempotent setMicrophoneDevice calls
        this._currentMicDeviceId = null;

        // Register VDI disconnection handler if strategy supports it
        if (this._strategy.onConnectionNeedingCleanup && typeof this._strategy.onConnectionNeedingCleanup === 'function') {
            this._strategy.onConnectionNeedingCleanup(() => this.markNeedsCleanup());
        }
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

    async setMicrophoneDevice(newAudioDeviceId) {
        var self = this;
        var logger = this._logger;

        // Idempotent: skip if deviceId matches current.
        // TODO: If deviceId is "default" and the underlying physical device changed, this no-op
        // may incorrectly block the switch. Need to address it before this API is more publicly used
        if (self._currentMicDeviceId === newAudioDeviceId) {
            if (newAudioDeviceId === 'default') {
                logger.warn("[setMicrophoneDevice] Skipping — deviceId 'default' matches current. " +
                    "If the underlying physical device changed, this may incorrectly block the switch. " +
                    "Please use the exact device ID if this is causing a problem.").sendInternalLogToServer();
            } else {
                logger.info("[setMicrophoneDevice] Requested deviceId matches current device, no-op. deviceId=" + newAudioDeviceId).sendInternalLogToServer();
            }
            return;
        }

        logger.info("[setMicrophoneDevice] Starting mic device change to deviceId: " + newAudioDeviceId).sendInternalLogToServer();

        // Mark as user-provided stream immediately to prevent automatic refreshes during the async operation
        self._isUserProvidedStream = true;

        // Get old track reference
        var oldTrack = self._localStream ? self._localStream.getAudioTracks()[0] : null;
        logger.info(
            "[setMicrophoneDevice] Old track state: " +
            (oldTrack ? "id=" + oldTrack.id + ", readyState=" + oldTrack.readyState + ", enabled=" + oldTrack.enabled : "no old track")
        );

        try {
            // Acquire new media stream with GUM timeout
            logger.info("[setMicrophoneDevice] Acquiring new media stream...").sendInternalLogToServer();
            var newStream = await this._doGUM(newAudioDeviceId);
            var newTrack = newStream.getAudioTracks()[0];
            logger.info(
                "[setMicrophoneDevice] New media stream acquired, track id=" + newTrack.id +
                ", settings=" + JSON.stringify(newTrack.getSettings())
            ).sendInternalLogToServer();

            // Preserve mute state: apply old track's enabled state to new track immediately
            var wasEnabled = oldTrack ? oldTrack.enabled : true;
            newTrack.enabled = wasEnabled;
            logger.info("[setMicrophoneDevice] Mute state preserved: wasEnabled=" + wasEnabled).sendInternalLogToServer();

            // Replace audio track in peer connection sender
            var audioSender = self._pc.getSenders().find(function(sender) { return sender.track && sender.track.kind === 'audio'; });
            if (!audioSender) {
                logger.error("[setMicrophoneDevice] No audio sender found in peer connection").sendInternalLogToServer();
                return;
            }

            logger.info("[setMicrophoneDevice] Replacing track in peer connection sender...").sendInternalLogToServer();
            await audioSender.replaceTrack(newTrack);
            logger.info("[setMicrophoneDevice] Track replaced in peer connection sender successfully").sendInternalLogToServer();

            // Replace track in _localStream in-place (same object reference StreamsJS holds)
            if (oldTrack) {
                oldTrack.enabled = false;
                self._localStream.removeTrack(oldTrack);
                oldTrack.stop();
                logger.info("[setMicrophoneDevice] Old track disabled, removed, and stopped").sendInternalLogToServer();
            }
            self._localStream.addTrack(newTrack);

            // Update selected device ID
            self._selectedMicrophoneDeviceId = newTrack.getSettings().deviceId;

            // Note: For VDI environments, the enabled property may take time to propagate
            logger.info("[setMicrophoneDevice] New track added to local media stream, id=" + newTrack.id + ", enabled=" + newTrack.enabled + ", readyState=" + newTrack.readyState);

            self._currentMicDeviceId = newAudioDeviceId;
            logger.info("[setMicrophoneDevice] Mic device change completed successfully").sendInternalLogToServer();
        } catch (error) {
            logger.error("[setMicrophoneDevice] Failed to change microphone device").withException(error).sendInternalLogToServer();
        }
    }

    /**
     * TODO: fix eslint version to use optional chaining
     * const audioTrack = this._localStream?.getAudioTracks()[0];
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
     * const audioTrack = this._localStream?.getAudioTracks()[0];
     *     if (audioTrack) {
     *         audioTrack.enabled = true;
     *     }
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
     * Shared Media Session callbacks, should be registered by PCM only
     */
    registerCallbacks(callbacks) {
        if (!callbacks) {
            return;
        }
        /**
         * Callback when gUM succeeds.
         * First param is RtcSession object.
         */
        if (callbacks.onGumSuccess) {
            this._onGumSuccess = callbacks.onGumSuccess;
        }
        /**
         * Callback when gUM fails.
         * First param is RtcSession object.
         * Second param is the error.
         */
        if (callbacks.onGumError) {
            this._onGumError = callbacks.onGumError;
        }
        /**
         * Callback if failed initializing local resources
         * First param is RtcSession object.
         */
        if (callbacks.onSharedMediaSessionFailed) {
            this._onSessionFailed = callbacks.onSharedMediaSessionFailed;
        }

        /**
         * Callback before local user media stream is added to the pc.
         * First param is RtcSession object.
         * Second param is peer connection
         */
        if (callbacks.onLocalPeerConnectionAvailable) {
            this._onLocalPeerConnectionAvailable = callbacks.onLocalPeerConnectionAvailable;
        }

        /**
         * Callback after local user media stream is added to the session.
         * First param is RtcSession object.
         * Second param is media stream
         */
        if (callbacks.onLocalStreamAdded) {
            this._onLocalStreamAdded = callbacks.onLocalStreamAdded;
        }


        /**
         * Callback when all local resources are ready. Establishing signaling chanel and ICE collection happens at the same time after this.
         * First param is RtcSession object.
         */
        if (callbacks.onSharedMediaSessionInitialized) {
            this._onSessionInitialized = callbacks.onSharedMediaSessionInitialized;
        }
        /**
         * Callback when signaling channel is established.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         */
        if (callbacks.onSignalingConnected) {
            this._onSignalingConnected = callbacks.onSignalingConnected;
        }

        /**
         * Called to give consumers a chance to replace a media stream before it is added to a peer connection.
         */
        if (callbacks.replaceStreamCallback) {
            this._replaceStreamCallback = callbacks.replaceStreamCallback;
        }

        /**
         * Callback when ICE collection completes either because there is no more candidate or collection timed out.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         * Second param is boolean, TRUE - ICE collection timed out.
         * Third param is number of candidates collected.
         */
        if (callbacks.onIceCollectionComplete) {
            this._onIceCollectionComplete = callbacks.onIceCollectionComplete;
        }
        /**
         * Callback when signaling channel is established and ICE collection completed with at least one candidate.
         * First param is RtcSession object.
         */
        if (callbacks.onSignalingStarted) {
            this._onSignalingStarted = callbacks.onSignalingStarted;
        }
        /**
         * Callback when the call is established (handshaked and media stream should be flowing)
         * First param is RtcSession object.
         */
        if (callbacks.onSharedMediaSessionConnected) {
            this._onSessionConnected = callbacks.onSharedMediaSessionConnected;
        }

        if (callbacks.onSharedMediaSessionSetupLatencyMetricReady) {
            this._onSessionSetupLatencyMetricReady = callbacks.onSharedMediaSessionSetupLatencyMetricReady;
        }

        /**
         * Callback after remote media stream is added to the session.
         * This could be called multiple times with the same stream if multiple tracks are included in the same stream.
         *
         * First param is RtcSession object.
         * Second param is media stream track.
         */
        if (callbacks.onRemoteStreamAdded) {
            this._onRemoteStreamAdded = callbacks.onRemoteStreamAdded;
        }
        /**
         * Callback when the hangup is initiated (implies the call was successfully established).
         * First param is RtcSession object.
         */
        if (callbacks.onSessionCompleted) {
            this._onSessionCompleted = callbacks.onSessionCompleted;
        }
        /**
         * Callback after session is cleaned up, no matter if the call was successfully established or not.
         * First param is RtcSession object.
         * Second param is SessionReport object.
         */
        if (callbacks.onSharedMediaSessionDestroyed) {
            this._onSessionDestroyed = callbacks.onSharedMediaSessionDestroyed;
        }

        if (callbacks.setInactivityDurationCallback) {
            this._setInactivityDurationCallback = callbacks.setInactivityDurationCallback;
        }

        if (callbacks.isPersistentConnectionAllowlistedCallback) {
            this._isPersistentConnectionAllowlistedCallback = callbacks.isPersistentConnectionAllowlistedCallback;
        }

        if (callbacks.setPeerConnectionIdCallback) {
            this._setPeerConnectionIdCallback = callbacks.setPeerConnectionIdCallback;
        }

        if (callbacks.setPeerConnectionTokenCallback) {
            this._setPeerConnectionTokenCallback = callbacks.setPeerConnectionTokenCallback;
        }

        /**
         * Callback when ICE connection state changes
         * First param is ICE connection state string
         */
        if (callbacks.onIceConnectionStateChange) {
            this._onIceConnectionStateChangeCallback = callbacks.onIceConnectionStateChange;
        }

        /**
         * Callback when peer connection state changes
         * First param is peer connection state string
         */
        if (callbacks.onPeerConnectionStateChange) {
            this._onPeerConnectionStateChangeCallback = callbacks.onPeerConnectionStateChange;
        }

        /**
         * Callback when ICE restart completes (success or failure)
         * Params: success (boolean), timeMillis (number or null), inviteRetries (number)
         */
        if (callbacks.onIceRestartComplete) {
            this._onIceRestartCompleteCallback = callbacks.onIceRestartComplete;
        }
    }

    /**
     * Called when ICE restart completes (success or failure)
     * Sends discrete event to call sessions for CloudWatch metrics
     * Resets all metrics after sending
     * @param {boolean} success - Whether ICE restart succeeded
     * @param {number} iceRestartStartTime - Start time of ICE restart (null if not an ICE restart)
     */
    _onIceRestartComplete(success, iceRestartStartTime) {
        // Only process if this is an ICE restart (has start time)
        if (!iceRestartStartTime) {
            this._logger.info('_onIceRestartComplete called without iceRestartStartTime').sendInternalLogToServer();
            return;
        }
        
        // Calculate timing
        const timeMillis = Date.now() - iceRestartStartTime;
        
        const inviteRetries = this._sessionReport.iceRestartInviteRetries;
        
        // Notify call sessions with discrete ICE restart event
        if (typeof this._onIceRestartCompleteCallback === 'function') {
            this._onIceRestartCompleteCallback({
                success: success,
                timeMillis: timeMillis,
                inviteRetries: inviteRetries
            });
        }
        
        // Reset all metrics for next ICE restart
        this._sessionReport.iceRestartAttempts = 0;
        this._sessionReport.iceRestartSuccesses = 0;
        this._sessionReport.iceRestartInviteRetries = 0;
        this._sessionReport.iceRestartTimeMillis = null;
        this._sessionReport.iceRestartFailed = null;
        
        this._logger.info(`ICE restart event sent to call sessions (success: ${success}, time: ${timeMillis}ms, retries: ${inviteRetries}). Metrics reset.`).sendInternalLogToServer();
    }

    set echoCancellation(flag) {
        this._echoCancellation = flag;
    }

    /**
     * Optional. RtcSession will grab input device if this is not specified.
     * Please note: this RtcSession class only supports single audio track.
     */
    set mediaStream(input) {
        this._localStream = input;
        this._isUserProvidedStream = true;
    }

    /**
     * Needed, expect an audio element that can be used to play remote audio stream.
     */
    set remoteAudioElement(element) {
        this._remoteAudioElement = element;
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
     * connect-rtc-js disables OPUS DTX by default because it harms audio quality.
     * @param flag boolean
     */
    set enableOpusDtx(flag) {
        this._enableOpusDtx = flag;
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

    _createSignalingChannel() {
        // Create the signaling channel using the existing SignalingChannelManager
        // Todo: create a MediaSignalingConfig object instead
        var signalingChannel = new AmznRtcSharedMediaSignaling(this._callId, this._contactToken, this._originalLogger, DEFAULT_CONNECT_TIMEOUT_MS, this._connectionId, this._signalingChannelManager, this._iceRestart || false, this._isPersistentConnectionEnabled, this.peerConnectionId, this.peerConnectionToken, this._browserId, this._allowExtendedPersistentConnection);


        signalingChannel.onConnected = hitch(this, this._signalingConnected);
        signalingChannel.onAnswered = hitch(this, this._signalingAnswered);
        signalingChannel.onHandshaked = hitch(this, this._signalingHandshaked);
        signalingChannel.onRemoteHungup = hitch(this, this._signalingRemoteHungup);
        signalingChannel.onFailed = hitch(this, this._signalingFailed);
        signalingChannel.onDisconnected = hitch(this, this._signalingDisconnected);

        this._signalingChannel = signalingChannel;
        return signalingChannel;
    }

    _sanitizeDeviceId(deviceId) {
        if (deviceId === 'default' || deviceId == undefined) {
            return null;
        }
        return deviceId;
    }

    _doGUM(newDeviceId) {
        var self = this;
        const logger = this._logger;
        var startTime = Date.now();

        const constraints = this._buildMediaConstraints(newDeviceId);
        var sessionGumPromise = this._strategy._gUM(constraints);

        return promiseWithTimeout(sessionGumPromise, self._gumTimeoutMillis, new GumTimeout('Local media has not been initialized yet.'))
            .then(stream => {
                const audioTracks = stream.getAudioTracks();

                if (audioTracks.length > 0) {
                    const audioTrack = audioTracks[0];
                    logger.info(`[_doGUM] Got audio stream: ${JSON.stringify(audioTrack.getSettings())}`).sendInternalLogToServer();
                }

                self._sessionReport.gumTimeMillis = Date.now() - startTime;
                self._onGumSuccess(self);
                self._sessionReport.gumOtherFailure = false;
                self._sessionReport.gumTimeoutFailure = false;

                return stream;
            }).catch(e => {
                self._sessionReport.gumTimeMillis = Date.now() - startTime;
                var errorReason;
                if (e && e.name == GumTimeoutExceptionName) {
                    errorReason = RTC_ERRORS.GUM_TIMEOUT_FAILURE;
                    self._sessionReport.gumTimeoutFailure = true;
                    self._sessionReport.gumOtherFailure = false;
                } else {
                    errorReason = RTC_ERRORS.GUM_OTHER_FAILURE;
                    self._sessionReport.gumOtherFailure = true;
                    self._sessionReport.gumTimeoutFailure = false;
                }

                const errorLog = self._logger.error('Local media initialization failed', e);
                if (errorLog && errorLog.sendInternalLogToServer) {
                    errorLog.withObject({ constraints }).sendInternalLogToServer();
                }
                self._onGumError(self);

                throw errorReason;
            });
    }

    _signalingConnected() {
        this._state.onSignalingConnected();
    }

    _signalingAnswered(sdp, candidates, inactivityDuration, peerConnectionId, peerConnectionToken) {
        this._state.onSignalingAnswered(sdp, candidates, inactivityDuration, peerConnectionId, peerConnectionToken);
    }

    _signalingHandshaked() {
        this._state.onSignalingHandshaked();
    }

    _signalingRemoteHungup() {
        this._state.onRemoteHungup();
    }

    _signalingFailed(e) {
        this._state.onSignalingFailed(e);
    }

    _signalingDisconnected() {
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        return this._strategy._createPeerConnection(configuration, optionalConfiguration);
    }

    connect(pc) {
        var self = this;
        var now = new Date();
        self._sessionReport.sessionStartTime = now;
        self._connectTimeStamp = now.getTime();
        if (pc && pc.signalingState != 'closed') {
            self._pc = pc;
        } else {
            if (pc) {
                self._strategy.close(pc);
                pc = null;
            }
            RTC_PEER_CONNECTION_CONFIG.iceServers = self._iceServers;
            RTC_PEER_CONNECTION_CONFIG.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
            self._pc = self._createPeerConnection(RTC_PEER_CONNECTION_CONFIG, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
        }
        self._pc.ontrack = hitch(self, self._ontrack);
        self._pc.onicecandidate = hitch(self, self._onIceCandidate);
        self._pc.onconnectionstatechange = hitch(self, self._onPeerConnectionStateChange);
        self._pc.oniceconnectionstatechange = hitch(self, self._onIceStateChange);

        this.transit(new GrabLocalMediaState(this));
    }

    accept() {
        throw new UnsupportedOperation('accept does not go through signaling channel at this moment');
    }

    hangup(serverInitiated = false) {
        this._state.hangup(serverInitiated);
    }

    /**
     * Get a promise containing an object with two named lists of audio stats, one for each channel on each
     * media type of 'audio'.
     * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
     */
    async getStats() {
        const timestamp = new Date();

        const getStatsForType = async (streamType) => {
            const rawStats = await this._pc.getStats();
            return extractMediaStatsFromStats(timestamp, rawStats, streamType);
        };

        if (this._pc && this._pc.signalingState === 'stable') {
            const audioInputStats = await getStatsForType('audio_input');
            const audioOutputStats = await getStatsForType('audio_output');
            // For consistency's sake, coalesce One-Way Metrics into both Audio Streams
            if (audioInputStats && audioInputStats.jitterBufferEmittedCount !== null) {
                audioOutputStats._jitterBufferEmittedCount = audioInputStats.jitterBufferEmittedCount;
            }
            if (audioInputStats && audioInputStats.jbMilliseconds !== null) {
                audioOutputStats._jbMilliseconds = audioInputStats.jbMilliseconds;
            }
            if (audioOutputStats && audioOutputStats.rttMilliseconds !== null) {
                audioInputStats._rttMilliseconds = audioOutputStats.rttMilliseconds;
            }
            if (audioOutputStats && audioOutputStats.echoReturnLoss !== null) {
                audioInputStats._echoReturnLoss = audioOutputStats.echoReturnLoss;
            }
            if (audioOutputStats && audioOutputStats.echoReturnLossEnhancement !== null) {
                audioInputStats._echoReturnLossEnhancement = audioOutputStats.echoReturnLossEnhancement;
            }

            return {
                audioInputStats, audioOutputStats,
            };
        } else {
            return Promise.reject(new IllegalState());
        }
    }


    /**
     * Get a promise of MediaRtpStats object for remote audio (from Amazon Connect to client).
     * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
     * @deprecated in favor of getStats()
     */
    getRemoteAudioStats() {
        return this.getStats().then((stats) => {
            if (stats.audioOutputStats) {
                return stats.audioOutputStats;
            } else {
                return Promise.reject(new IllegalState());
            }
        });
    }


    /**
     * Get a promise of MediaRtpStats object for user audio (from client to Amazon Connect).
     * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
     * @deprecated in favor of getStats()
     */
    getUserAudioStats() {
        return this.getStats().then((stats) => {
            if (stats.audioInputStats) {
                return stats.audioInputStats;
            } else {
                return Promise.reject(new IllegalState());
            }
        });
    }


    _onIceCandidate(evt) {
        this._state.onIceCandidate(evt);
    }

    _onPeerConnectionStateChange() {
        if (this._state && typeof this._state.onPeerConnectionStateChange === 'function') {
            this._state.onPeerConnectionStateChange();
        }
        
        // Notify via callback for VDI compatibility (Citrix doesn't support addEventListener)
        if (this._pc && typeof this._onPeerConnectionStateChangeCallback === 'function') {
            const peerConnectionState = this._pc.connectionState;
            this._onPeerConnectionStateChangeCallback(peerConnectionState);
        }
    }

    _onIceStateChange(evt) {
        this._state.onIceStateChange(evt);
        
        // Notify via callback for VDI compatibility (Citrix doesn't support addEventListener)
        if (this._pc && typeof this._onIceConnectionStateChangeCallback === 'function') {
            const iceState = this._pc.iceConnectionState;
            this._onIceConnectionStateChangeCallback(iceState);
        }
    }

    /**
     * Attach remote media stream to web element.
     */
    _ontrack(evt) {
        this._strategy._ontrack(this, evt);
        this._onRemoteStreamAdded(this, evt.streams[0]);
    }

    _detachMedia() {
        if (this._remoteAudioElement) {
            this._remoteAudioElement.srcObject = null;
            this._remoteAudioStream = null;
        }
    }

    _stopSession() {
        try {
            if (this._localStream) {
                closeStream(this._localStream);
                this._localStream = null;
                this._isUserProvidedStream = false;
            }
        } finally {
            try {
                if (this._pc) {
                    this._strategy.close(this._pc);
                }
            } catch (e) {
                // eat exception
            }
            finally {
                this._pc = null;
            }
        }
    }

    _buildMediaConstraints(newDeviceId) {
        var self = this;
        var mediaConstraints = {};

        if (self._enableAudio) {
            var audioConstraints = {};
            if (typeof self._echoCancellation !== 'undefined') {
                audioConstraints.echoCancellation = !!self._echoCancellation;
            }
            if (newDeviceId != undefined && newDeviceId != 'default') {
                audioConstraints.deviceId = { exact: newDeviceId };
            }

            // This is required to handle behaviour in published sample code.
            if (window && window.audio_input) {
                audioConstraints.deviceId = window.audio_input;

                if (newDeviceId != window.audio_input) {
                    this._logger.warn('window.audio_input does not match requested device id');
                }
            }

            if (Object.keys(audioConstraints).length > 0) {
                mediaConstraints.audio = audioConstraints;
            } else {
                mediaConstraints.audio = true;
            }
        } else {
            mediaConstraints.audio = false;
        }

        return mediaConstraints;
    }

    isInTalkingState() {
        return this._state instanceof TalkingState;
    }

    /**
     * Check if peer connection is healthy by validating ICE connection state
     * @returns {boolean} true if peer connection exists and ICE state is valid
     */
    isPeerConnectionHealthy() {
        if (!this._pc) {
            return false;
        }
        
        const iceState = this._pc.iceConnectionState;
        return !(iceState === ICE_CONNECTION_STATE.FAILED ||
                 iceState === ICE_CONNECTION_STATE.DISCONNECTED ||
                 iceState === ICE_CONNECTION_STATE.CLOSED);
    }

    /**
     * Check if SharedMediaSession is healthy and ready to use
     * Validates: talking state, peer connection health, signaling channel state, and cleanup flag
     * @returns {boolean} true if all health checks pass
     */
    isSharedMediaSessionHealthy() {
        // Check cleanup flag first
        if (this._needsCleanup) {
            this._logger.info("SharedMediaSession requires cleanup");
            return false; // Unhealthy - cleanup needed
        }
        
        // Check if in talking state
        if (!this.isInTalkingState()) {
            return false;
        }
        
        // Check peer connection health
        if (!this.isPeerConnectionHealthy()) {
            return false;
        }
        
        // Check signaling channel state
        if (this._signalingChannel && 
            this._signalingChannel._state && 
            this._signalingChannel._state.name === "FailedState") {
            return false;
        }
        
        return true;
    }

    /**
     * Mark that cleanup is needed
     */
    markNeedsCleanup() {
        this._logger.info("SharedMediaSession marked for cleanup");
        this._needsCleanup = true;
    }

    getPeerConnection() {
        return this._pc;
    }

    /**
     * Disable media stream refresh
     * Called when a user-provided stream is being used (e.g., after voice enhancement)
     * Prevents RTC.js from changing the media stream
     */
    disableMediaStreamRefresh() {
        this._isUserProvidedStream = true;
        this._logger.info("Media stream refresh disabled - user-provided stream").sendInternalLogToServer();
    }

    /**
     * Reset ICE restart metrics for a new call
     * Called when SharedMediaSession is reused for a new call with persistent connection
     */
    resetIceRestartMetrics() {
        this._sessionReport.iceRestartAttempts = 0;
        this._sessionReport.iceRestartSuccesses = 0;
        this._sessionReport.iceRestartInviteRetries = 0;
        this._sessionReport.iceRestartTimeMillis = null;
        this._sessionReport.iceRestartFailed = null;
        this._logger.info("Reset ICE restart metrics for new call").sendInternalLogToServer();
    }

    /**
     * Refresh media stream between calls (non-blocking)
     * Called when a new call arrives after previous calls have ended
     * Handles audio device changes that occurred between calls
     * This is particularly important for:
     * - VDI users who may have device changes between calls
     * - Non-VDI users with audio permission disabled who face device issues
     */
    refreshMediaStreamBetweenCalls() {
        // Check if we should skip refresh
        if (this._isUserProvidedStream) {
            this._logger.log("Not refreshing media stream - user provided stream is being used");
            return;
        }
        
        this._logger.info("Refreshing media stream between calls").sendInternalLogToServer();
        
        // Use default device constraints (no specific deviceId) - matches ConnectContact behavior
        const constraints = this._buildMediaConstraints();
        const gumPromise = this._strategy._gUM(constraints);
        
        gumPromise.then((newStream) => {
            // Double-check in case user set stream during async gUM
            if (this._isUserProvidedStream) {
                this._logger.log("User provided stream set during gUM, aborting refresh");
                // NOTE: Do NOT stop tracks to be consistent with ConnectContact behavior.
                // Previous attempts to stop old tracks also stopped new tracks on Linux + Citrix for unknown reasons.
                return;
            }
            
            const newAudioTrack = newStream.getAudioTracks()[0];
            if (!newAudioTrack) {
                throw new Error('No audio track in refreshed stream');
            }
            
            // Replace track in peer connection
            const audioSender = this._pc.getSenders().find(sender => sender.track && sender.track.kind === 'audio');
            if (audioSender) {
                return audioSender.replaceTrack(newAudioTrack).then(() => {
                    // Update the existing MediaStream object (don't create a new one)
                    const oldTrack = this._localStream.getAudioTracks()[0];
                    if (oldTrack) {
                        this._localStream.removeTrack(oldTrack);
                        // NOTE: Do NOT stop the old track to be consistent with ConnectContact behavior.
                        // Previous attempts to stop old tracks also stopped new tracks on Linux + Citrix for unknown reasons.
                    }
                    this._localStream.addTrack(newAudioTrack);
                    
                    // Update selected device ID
                    this._selectedMicrophoneDeviceId = newAudioTrack.getSettings().deviceId;
                    
                    this._logger.info("Media stream refreshed successfully between calls").sendInternalLogToServer();
                    this._logger.info(`Audio track settings: ${JSON.stringify(newAudioTrack.getSettings())}`).sendInternalLogToServer();
                });
            } else {
                this._logger.warn("No audio sender found to replace track").sendInternalLogToServer();
                // NOTE: Do NOT stop tracks to be consistent with ConnectContact behavior.
            }
        }).catch((error) => {
            this._logger.error("Failed to refresh media stream between calls", error).sendInternalLogToServer();
            // Don't throw - allow call to continue with existing stream
        });
    }
}
