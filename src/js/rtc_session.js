/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {closeStream, hitch, SdpOptions, transformSdp, wrapLogger} from './utils';
import {SessionReport} from './session_report';
import {
    DEFAULT_GUM_TIMEOUT_MS,
    DEFAULT_ICE_TIMEOUT_MS,
    RTC_ERRORS,
    RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_OPTIONAL_CONFIG,
    ICE_CONNECTION_STATE,
    PEER_CONNECTION_STATE,
    DEFAULT_ICE_CANDIDATE_POOL_SIZE
} from './rtc_const';
import {
    BusyExceptionName,
    CallNotFoundExceptionName,
    GumTimeout,
    IllegalParameters,
    IllegalState,
    UnsupportedOperation,
    AccessDeniedExceptionName
} from './exceptions';
import RtcSignaling from './signaling';
import uuid from 'uuid/v4';
import {extractMediaStatsFromStats} from './rtp-stats';
import {parseCandidate} from 'sdp';
import CCPInitiationStrategyInterface from "./strategies/CCPInitiationStrategyInterface";
import StandardStrategy from "./strategies/StandardStrategy";
import {
    ConnectedSubstate
} from './rtc_session_talking_substates';

export class RTCSessionState {
    /**
     *
     * @param {RtcSession} rtcSession
     */
    constructor(rtcSession) {
        this._rtcSession = rtcSession;
    }
    onEnter() {
    }
    onExit() {
    }
    _isCurrentState() {
        return this._rtcSession._state === this;
    }
    transit(nextState) {
        if (this._isCurrentState()) {
            this._rtcSession.transit(nextState);
        }
    }
    get logger() {
        return this._rtcSession._logger;
    }
    hangup() {
        this.transit(new FailedState(this._rtcSession));
    }
    onIceCandidate(evt) {// eslint-disable-line no-unused-vars
        //ignore candidate by default, ConnectSignalingAndIceCollectionState will override to collect candidates, but collecting process could last much longer than ConnectSignalingAndIceCollectionState
        //we don't want to spam the console log
    }
    onRemoteHungup() {
        throw new UnsupportedOperation('onRemoteHungup not implemented by ' + this.name);
    }
    get name() {
        return "RTCSessionState";
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
export class GrabLocalMediaState extends RTCSessionState {
    onEnter() {
        var self = this;
        var startTime = Date.now();
        if (self._rtcSession._isUserProvidedStream) {
            self.transit(new CreateOfferState(self._rtcSession));
        } else {
            var gumTimeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new GumTimeout('Local media has not been initialized yet.'));
                }, self._rtcSession._gumTimeoutMillis);
            });
            var sessionGumPromise = self._gUM(self._rtcSession._buildMediaConstraints());

            Promise.race([sessionGumPromise, gumTimeoutPromise])
                .then(stream => {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    self._rtcSession._onGumSuccess(self._rtcSession);
                    self._rtcSession._localStream = stream;
                    if (self._rtcSession._pcm) {
                        self._rtcSession._pcm._mediaStream = stream;
                    }
                    self._rtcSession._sessionReport.gumOtherFailure = false;
                    self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    self.transit(new CreateOfferState(self._rtcSession));
                }).catch(e => {
                self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                var errorReason;
                if (e instanceof GumTimeout) {
                    errorReason = RTC_ERRORS.GUM_TIMEOUT_FAILURE;
                    self._rtcSession._sessionReport.gumTimeoutFailure = true;
                    self._rtcSession._sessionReport.gumOtherFailure = false;
                } else {
                    errorReason = RTC_ERRORS.GUM_OTHER_FAILURE;
                    self._rtcSession._sessionReport.gumOtherFailure = true;
                    self._rtcSession._sessionReport.gumTimeoutFailure = false;
                }
                self.logger.error('Local media initialization failed', e);
                self._rtcSession._onGumError(self._rtcSession);
                self.transit(new FailedState(self._rtcSession, errorReason));
            });
        }
    }
    get name() {
        return "GrabLocalMediaState";
    }
    _gUM(constraints) {
        return this._rtcSession._strategy._gUM(constraints);
    }
}
export class CreateOfferState extends RTCSessionState {
    onEnter() {
        var self = this;
        var stream = self._rtcSession._localStream;
        self._rtcSession._strategy.addStream(self._rtcSession._pc, stream);
        self._rtcSession._onLocalStreamAdded(self._rtcSession, stream);
        self._rtcSession._pc.createOffer().then(rtcSessionDescription => {
            self._rtcSession._localSessionDescription = rtcSessionDescription;
            self._rtcSession._sessionReport.createOfferFailure = false;
            self.transit(new SetLocalSessionDescriptionState(self._rtcSession));
        }).catch(e => {
            self.logger.error('CreateOffer failed', e);
            self._rtcSession._sessionReport.createOfferFailure = true;
            self.transit(new FailedState(self._rtcSession, RTC_ERRORS.CREATE_OFFER_FAILURE));
        });
    }
    get name() {
        return "CreateOfferState";
    }
}
export class SetLocalSessionDescriptionState extends RTCSessionState {
    onEnter() {
        var self = this;

        // fix/modify SDP as needed here, before setLocalDescription
        var localDescription = self._rtcSession._localSessionDescription;
        var sdpOptions = new SdpOptions();
        // Set audio codec.
        if (self._rtcSession._forceAudioCodec) {
            sdpOptions.forceCodec['audio'] = self._rtcSession._forceAudioCodec;
        }
        // Set video codec.
        if (self._rtcSession._forceVideoCodec) {
            sdpOptions.forceCodec['video'] = self._rtcSession._forceVideoCodec;
        }
        sdpOptions.enableOpusDtx = self._rtcSession._enableOpusDtx;

        var transformedSdp = transformSdp(localDescription.sdp, sdpOptions);
        localDescription.sdp = transformedSdp.sdp;
        localDescription.sdp += 'a=ptime:20\r\n';
        localDescription.sdp += 'a=maxptime:20\r\n';
        localDescription.sdp = localDescription.sdp.replace("minptime=10", "minptime=20");

        self.logger.info('LocalSD', self._rtcSession._localSessionDescription);
        self._rtcSession._pc.setLocalDescription(self._rtcSession._localSessionDescription).then(() => {
            var initializationTime = Date.now() - self._rtcSession._connectTimeStamp;
            self._rtcSession._sessionReport.initializationTimeMillis = initializationTime;
            self._rtcSession._onSessionInitialized(self._rtcSession, initializationTime);
            self._rtcSession._sessionReport.setLocalDescriptionFailure = false;
            self.transit(new ConnectSignalingAndIceCollectionState(self._rtcSession, transformedSdp.mLines));
        }).catch(e => {
            self.logger.error('SetLocalDescription failed', e);
            self._rtcSession._sessionReport.setLocalDescriptionFailure = true;
            self.transit(new FailedState(self._rtcSession, RTC_ERRORS.SET_LOCAL_DESCRIPTION_FAILURE));
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
export class ConnectSignalingAndIceCollectionState extends RTCSessionState {
    /**
     * Create ConnectSignalingAndIceCollectionState object.
     * @param {RtcSession} rtcSession
     * @param {number} mLines Number of m lines in SDP
     */
    constructor(rtcSession, mLines) {
        super(rtcSession);
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
        }, self._rtcSession._iceTimeoutMillis);

        //if peer connection manager or signalingChannel doesn't exist, create a new signaling channel
        if (!self._rtcSession._pcm || !self._rtcSession._pcm._signalingChannel) {
            self._rtcSession._createSignalingChannel().connect();
        } else { // if signalingChannel exists, reset the contact id, connectionid and contact token
            self._rtcSession._bindSignalingChannel(); // binding the existing signaling channel
            self._rtcSession._pcm._signalingChannel._wss._connnectionId = self._rtcSession._connectionId;
            self._rtcSession._pcm._signalingChannel._contactToken = self._rtcSession._contactToken;
            self._rtcSession._pcm._signalingChannel._callId = self._rtcSession._callId;
        }
    }
    onSignalingConnected() {
        this._rtcSession._signallingConnectTimestamp = Date.now();
        this._rtcSession._sessionReport.signallingConnectTimeMillis = this._rtcSession._signallingConnectTimestamp - this._startTime;
        this._signalingConnected = true;
        this._rtcSession._onSignalingConnected(this._rtcSession);
        this._rtcSession._sessionReport.signallingConnectionFailure = false;
        this._checkAndTransit();
    }
    onSignalingFailed(e) {
        this._rtcSession._sessionReport.signallingConnectTimeMillis = Date.now() - this._startTime;
        this.logger.error('Failed connecting to signaling server', e);
        this._rtcSession._sessionReport.signallingConnectionFailure = true;
        this.transit(new FailedState(this._rtcSession, RTC_ERRORS.SIGNALLING_CONNECTION_FAILURE));
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
        this._rtcSession._sessionReport.iceCollectionTimeMillis = Date.now() - this._startTime;
        this._iceCompleted = true;
        this._rtcSession._onIceCollectionComplete(this._rtcSession, isTimeout, this._iceCandidates.length);
        if (this._iceCandidates.length > 0) {
            this._rtcSession._sessionReport.iceCollectionFailure = false;
            this._checkAndTransit();
        } else {
            this.logger.error('No ICE candidate');
            this._rtcSession._sessionReport.iceCollectionFailure = true;
            this.transit(new FailedState(this._rtcSession, RTC_ERRORS.ICE_COLLECTION_TIMEOUT));
        }
    }
    _checkAndTransit() {
        if (this._iceCompleted && this._signalingConnected) {
            this.transit(new InviteAnswerState(this._rtcSession, this._iceCandidates));
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

export class InviteAnswerState extends RTCSessionState {
    constructor(rtcSession, iceCandidates) {
        super(rtcSession);
        this._iceCandidates = iceCandidates;
    }
    onEnter() {
        var rtcSession = this._rtcSession;
        rtcSession._onSignalingStarted(rtcSession);

        rtcSession._signalingChannel.invite(rtcSession._localSessionDescription.sdp,
            this._iceCandidates);
    }
    onSignalingAnswered(sdp, candidates, inactivityDuration, peerConnectionId, peerConnectionToken) {
        this._rtcSession._sessionReport.userBusyFailure = false;
        this._rtcSession._sessionReport.handshakingFailure = false;

        // signaling answered, set the inactivityDuration, peerConnectionId and peerConnectionToken
        if (this._rtcSession._pcm) {
            this._rtcSession._pcm.inactivityDuration = inactivityDuration;
            this._rtcSession._pcm.peerConnectionId = peerConnectionId;
            this._rtcSession._pcm.peerConnectionToken = peerConnectionToken;
        }

        this.transit(new AcceptState(this._rtcSession, sdp, candidates));
    }
    onSignalingFailed(e) {
        var reason;
        if (e.name == BusyExceptionName) {
            this.logger.error('User Busy, possibly multiple CCP windows open', e);
            this._rtcSession._sessionReport.userBusyFailure = true;
            this._rtcSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.USER_BUSY;
        } else if (e.name == CallNotFoundExceptionName) {
            this.logger.error('Call not found. One of the participant probably hungup.', e);
            reason = RTC_ERRORS.CALL_NOT_FOUND;
            this._rtcSession._sessionReport.handshakingFailure = true;
        } else {
            this.logger.error('Failed handshaking with signaling server', e);
            this._rtcSession._sessionReport.userBusyFailure = false;
            this._rtcSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
        }
        this.transit(new FailedState(this._rtcSession, reason));
    }
    hangup() {
        if (this._rtcSession._pcm) {
            this.transit(new FailedState(this._rtcSession, "Agent clicks hangs up"))
        }
    }
    get name() {
        return "InviteAnswerState";
    }
}
export class AcceptState extends RTCSessionState {
    constructor(rtcSession, sdp, candidates) {
        super(rtcSession);
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
        var rtcSession = self._rtcSession;

        if (!self._sdp) {
            self.logger.error('Invalid remote SDP');
            rtcSession._stopSession();
            rtcSession._sessionReport.invalidRemoteSDPFailure = true;
            self.transit(new FailedState(rtcSession, RTC_ERRORS.INVALID_REMOTE_SDP));
            return;
        } else if (!self._candidates || self._candidates.length < 1) {
            self.logger.error('No remote ICE candidate');
            rtcSession._stopSession();
            rtcSession._sessionReport.noRemoteIceCandidateFailure = true;
            self.transit(new FailedState(rtcSession, RTC_ERRORS.NO_REMOTE_ICE_CANDIDATE));
            return;
        }

        rtcSession._sessionReport.invalidRemoteSDPFailure = false;
        rtcSession._sessionReport.noRemoteIceCandidateFailure = false;
        self._rtcSession._strategy.setRemoteDescription(self, rtcSession);
    }
    onSignalingHandshaked() {
        this._rtcSession._sessionReport.handshakingTimeMillis = Date.now() - this._rtcSession._signallingConnectTimestamp;
        this._signalingHandshaked = true;
        this._checkAndTransit();
    }
    _checkAndTransit() {
        if (this._signalingHandshaked && this._remoteDescriptionSet) {
            // when peerConnectionManager initialized and contactToken doesn't exist, rtcSession will move to DisconnectedState
            if (this._rtcSession._pcm && !this._rtcSession._contactToken) {
                this._rtcSession._pcm._rtcSession = null;
                this.transit(new DisconnectedState(this._rtcSession));
            } else {
                this.transit(new TalkingState(this._rtcSession));
            }
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
 * ConnectContactState
 * when persistent peer connection is enabled for the agent, CCP reuses the existing signaling channel to send
 * ConnectContact request to AmazonConnect and connects the call.
 *
 */
export class ConnectContactState extends RTCSessionState {

    constructor(rtcSession) {
        super(rtcSession);
    }

    onEnter(){
        var rtcSession = this._rtcSession;
        var logger = this.logger;
        var self = this;
        rtcSession._sessionReport.isExistingPersistentPeerConnection = true;
        rtcSession._pcm._signalingChannel.connectContact();
        try {
            rtcSession._pcm._mediaStream = self._createMediaStream(rtcSession._pc.getSenders()[0].track) ;
            rtcSession._onLocalStreamAdded(rtcSession, rtcSession._pcm._mediaStream);
        } catch (error) {
            logger.error("[connectContact] Failed to get audio track from existing peer connection").withException(error);
        }
        this.transit(new TalkingState(this._rtcSession));

        // if the rtcSession is using UserProvidedStream, we do not override it
        if (rtcSession._isUserProvidedStream) {
            logger.log("Not resetting media stream as user provided stream is being used");
        } else {
            var sessionGumPromise = this._gUM(rtcSession._buildMediaConstraints());
            sessionGumPromise.then(function (newMicrophoneStream) {
                try {
                    var newMicrophoneTrack = newMicrophoneStream.getAudioTracks()[0];
                    // Replace the audio track in the RtcPeerConnection
                    if (rtcSession._isUserProvidedStream) {
                        logger.log("Not resetting media stream as user provided stream was set after rtcJs GUM");
                    } else {
                        rtcSession._pc.getSenders()[0].replaceTrack(newMicrophoneTrack).then(function () {
                            rtcSession._pcm._mediaStream = self._createMediaStream(rtcSession._pc.getSenders()[0].track);
                            rtcSession._onLocalStreamAdded(rtcSession, rtcSession._pcm._mediaStream);
                            logger.log("[connectContact] Audio device set successfully and _onLocalStreamAdded triggered");
                        });
                    }
                } catch (e) {
                    logger.error("[connectContact] Failed to update audio track for the peer connection").withException(e);
                    return;
                }
            }).catch(function (e) {
                logger.error("[connectContact] Failed to get microphone stream from getUserMedia").withException(e);
                return;
            });
        }
    }


    _gUM(constraints) {
        return this._rtcSession._strategy._gUM(constraints);
    }

    _createMediaStream(track) {
        return this._rtcSession._strategy._createMediaStream(track);
    }

    onSignalingHandshaked() {
        // do nothing
    }

    get name() {
        return "ConnectContactState";
    }
}

export class TalkingState extends RTCSessionState {

    onEnter() {
        this._startTime = Date.now();
        this._rtcSession._sessionReport.preTalkingTimeMillis = this._startTime - this._rtcSession._connectTimeStamp;
        this._rtcSession._sessionReport.isMediaClusterPath = this._rtcSession._signalingChannel._isMediaClusterPath;
        this._rtcSession._sessionReport.isPersistentPeerConnection = !!(this._rtcSession._pcm && this._rtcSession._pcm.isPersistentConnectionEnabled());

        if (this._rtcSession._pcm) {
            // For persistnet connection, resume the local audio which was paused when the previous RtcSession was destroyed
            this._rtcSession.resumeLocalAudio();
        }
        this._rtcSession._onSessionConnected(this._rtcSession);

        // Calculate time taken to receive the first RTP packet
        let interval;
        let timeout;
        const getSynchronizationSourcesAndProcess = async() => {
            if (this._rtcSession && this._rtcSession._pc && this._rtcSession._pc.getReceivers().length !== 0) {
                const rtcRtpReceiver = this._rtcSession._pc.getReceivers()[0];
                if(rtcRtpReceiver instanceof RTCRtpReceiver){
                    const synchronizationSources = rtcRtpReceiver.getSynchronizationSources();
                    synchronizationSources.forEach((source) => {
                        const firstRTPTimeMillis = source.timestamp - this._rtcSession._connectTimeStamp;
                        if(firstRTPTimeMillis > 0){
                            this._rtcSession._sessionReport.firstRTPTimeMillis = firstRTPTimeMillis;
                        }
                        // We break out and stop checking for RTP packets as soon as we receive the first packet.
                        clearInterval(interval);
                        clearTimeout(timeout);
                    });
                }
            }
        }
        // Set up timeout to stop the interval after 1 seconds
        timeout = setTimeout(() => {
            clearInterval(interval);
            console.log('Timeout reached, stopping the interval');
        }, 1000);

        interval = setInterval(getSynchronizationSourcesAndProcess, 20);
        this.setSubState(new ConnectedSubstate(this._rtcSession));
    }
    onSignalingReconnected() {
    }

    /**
     * TODO: after upgrading eslint, use optional chaining
     *  const signalingChannel = this._rtcSession._pcm?._signalingChannel || this._rtcSession._signalingChannel;
     *         signalingChannel.hangup();
     */
    onRemoteHungup() {
        if (this._rtcSession._pcm) {
            //Unreachable code.
            this._rtcSession._pcm._signalingChannel.hangup();
        } else {
            this._rtcSession._signalingChannel.hangup();
        }
        this.transit(new DisconnectedState(this._rtcSession));
    }

    /**
     * TODO: after upgrading eslint, use optional chaining
     *  const signalingChannel = this._rtcSession._pcm?._signalingChannel || this._rtcSession._signalingChannel;
     *         signalingChannel.hangup();
     */
    hangup() {
        if (this._rtcSession._pcm) {
            this._rtcSession._pcm._signalingChannel.hangup();
        } else {
            this._rtcSession._signalingChannel.hangup();
        }
        this.transit(new DisconnectedState(this._rtcSession));
    }
    onIceStateChange(evt) {
        var iceState = this._rtcSession._strategy.onIceStateChange(evt, this._rtcSession._pc);
        this.logger.info('ICE Connection State: ', iceState);

        if (this._subState && typeof this._subState.onIceStateChange === 'function') {
            this._subState.onIceStateChange(evt);
        }

        if (iceState == ICE_CONNECTION_STATE.DISCONNECTED) {
            this.logger.info('Lost ICE connection');
            this._rtcSession._sessionReport.iceConnectionsLost += 1;
        }

        if (iceState == ICE_CONNECTION_STATE.FAILED) {
            this._rtcSession._sessionReport.iceConnectionsFailed = true;
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
            this._rtcSession._sessionReport.handshakingFailure = true;
            reason = RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
            this.transit(new FailedState(this._rtcSession, reason));
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
        var peerConnectionState = this._rtcSession._strategy.onPeerConnectionStateChange(this._rtcSession._pc);
        this.logger.info('Peer Connection State: ', peerConnectionState);

        if (peerConnectionState == PEER_CONNECTION_STATE.FAILED) {
            this._rtcSession._sessionReport.peerConnectionFailed = true;
        }
    }

    onExit() {
        this._rtcSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
        if (!this._rtcSession._pcm || !this._rtcSession._pcm.isPersistentConnectionEnabled()) {
            this._rtcSession._detachMedia();
        }
        this._rtcSession._sessionReport.sessionEndTime = new Date();
        this._rtcSession._onSessionCompleted(this._rtcSession);
        if (this._subState) {
            this._subState.onExit();
        }
    }

    get name() {
        return "TalkingState";
    }
}

export class CleanUpState extends RTCSessionState {
    onEnter() {
        if (this._rtcSession._pcm) {
            try {
                // rtcSession._pcm._mediaStream would be out of sync if the audio device changed during the call
                this._rtcSession._pcm._mediaStream = this._rtcSession._strategy._createMediaStream(this._rtcSession._pc.getSenders()[0].track);
            } catch(error) {
                this.logger.error("Creating MediaStream error: ", error);
            }
            // For persistent connection, pause the local audio when we destroy the RtcSession, because we don't want to transmit any audio when agent is idle
            this._rtcSession.pauseLocalAudio();
        }
        this._startTime = Date.now();
        this._rtcSession._stopSession();
        this._rtcSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
        this._rtcSession._onSessionDestroyed(this._rtcSession, this._rtcSession._sessionReport);
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

    onPeerConnectionStateChange() {
        // do nothing
    }

    get name() {
        return "DisconnectedState";
    }
}
export class FailedState extends CleanUpState {
    constructor(rtcSession, failureReason) {
        super(rtcSession);
        this._failureReason = failureReason;
    }
    onEnter() {
        this._rtcSession._sessionReport.sessionEndTime = new Date();
        this._rtcSession._onSessionFailed(this._rtcSession, this._failureReason);
        if (this._rtcSession._pcm) {
            this._rtcSession._pcm.destroy();
        }
        super.onEnter();
    }
    get name() {
        return "FailedState";
    }
}

export default class RtcSession {
    /**
     * Build an AmazonConnect RTC session.
     * @param {string} signalingUri (optional, applies to CCPv1)
     * @param {*} iceServers Array of ice servers
     * @param {string} contactToken A string representing the contact token (optional)
     * @param {object} logger An object provides logging functions, such as console
     * @param {string} contactId Must be UUID, uniquely identifies the session.
     * @param {string} connectionId Refers to media leg id
     * @param {string} wssManager - websocket manager
     * @param {object} strategy - VDI strategy indicates which WebRTC SDK to use: standard, Citrix, WorkSpace
     * @param {Object} peerConnectionManager - refers to the peerConnectionManager object which manages rtcSession and peer connection
     */
    constructor(signalingUri, iceServers, contactToken, logger, contactId, connectionId, wssManager, strategy = new StandardStrategy(), peerConnectionManager = null) {
        if (!(strategy instanceof CCPInitiationStrategyInterface)) {
            throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
        }
        // throw IllegalParameters error when signalingUri is missing and peer connection manager is not defined
        if (!peerConnectionManager && typeof signalingUri !== 'string' || (signalingUri && signalingUri.trim().length === 0)) {
            throw new IllegalParameters('signalingUri required');
        }
        if (!iceServers) {
            throw new IllegalParameters('iceServers required');
        }
        if (typeof logger !== 'object') {
            throw new IllegalParameters('logger required');
        }
        if (!contactId) {
            this._callId = uuid();
        } else {
            this._callId = contactId;
        }
        this._strategy = strategy;
        this._connectionId = connectionId;
        this._wssManager = wssManager;
        this._sessionReport = new SessionReport();
        this._signalingUri = signalingUri;
        this._iceServers = iceServers;
        this._contactToken = contactToken;
        this._originalLogger = logger;
        this._logger = wrapLogger(this._originalLogger, this._callId, 'SESSION');
        this._pcm = peerConnectionManager;
        this._iceTimeoutMillis = DEFAULT_ICE_TIMEOUT_MS;
        this._gumTimeoutMillis = DEFAULT_GUM_TIMEOUT_MS;

        this._enableAudio = true;
        this._enableVideo = false;
        this._facingMode = 'user';
        this._legacyStatsReportSupport = false;
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
                this._onLocalStreamAdded =
                    this._onSessionFailed =
                        this._onSessionInitialized =
                            this._onSignalingConnected =
                                this._onIceCollectionComplete =
                                    this._onSignalingStarted =
                                        this._onSessionConnected =
                                            this._onRemoteStreamAdded =
                                                this._onSessionCompleted =
                                                    this._onSessionDestroyed = () => {
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
    get remoteVideoStream() {
        return this._remoteVideoStream;
    }
    pauseLocalVideo() {
        if(this._localStream) {
            var videoTrack = this._localStream.getVideoTracks()[0];
            if(videoTrack) {
                videoTrack.enabled = false;
            }
        }
    }
    resumeLocalVideo() {
        if(this._localStream) {
            var videoTrack = this._localStream.getVideoTracks()[0];
            if(videoTrack) {
                videoTrack.enabled = true;
            }
        }
    }
    pauseRemoteVideo() {
        if (this._remoteVideoStream) {
            var videoTrack = this._remoteVideoStream.getTracks()[1];
            if(videoTrack) {
                videoTrack.enabled = false;
            }
        }
    }
    resumeRemoteVideo() {
        if (this._remoteVideoStream) {
            var videoTrack = this._remoteVideoStream.getTracks()[1];
            if(videoTrack) {
                videoTrack.enabled = true;
            }
        }
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
        if (this._pcm) {
            if(this._pcm._mediaStream) {
                audioTrack = this._pcm._mediaStream.getAudioTracks()[0];
                if(audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        } else {
            if (this._localStream) {
                audioTrack = this._localStream.getAudioTracks()[0];
                if(audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }

    /**
     * TODO: fix eslint version to use optional chaining
     * const audioTrack = this._pcm?._mediaStream?.getAudioTracks()[0] || this._localStream?.getAudioTracks()[0];
     *     if (audioTrack) {
     *         audioTrack.enabled = true;
     *     }
     */
    resumeLocalAudio() {
        var audioTrack;
        if(this._pcm){
            if(this._pcm._mediaStream) {
                audioTrack = this._pcm._mediaStream.getAudioTracks()[0];
                if(audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        } else {
            if (this._localStream) {
                audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
    }
    pauseRemoteAudio() {
        if (this._remoteAudioStream) {
            var audioTrack = this._remoteAudioStream.getTracks()[0];
            if(audioTrack) {
                audioTrack.enabled = false;
            }
        }
    }
    resumeRemoteAudio() {
        if (this._remoteAudioStream) {
            var audioTrack = this._remoteAudioStream.getTracks()[0];
            if(audioTrack) {
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
    set enableAudio(flag) {
        this._enableAudio = flag;
    }
    set echoCancellation(flag) {
        this._echoCancellation = flag;
    }
    set enableVideo(flag) {
        this._enableVideo = flag;
    }
    set maxVideoFrameRate(frameRate) {
        this._maxVideoFrameRate = frameRate;
    }
    set minVideoFrameRate(frameRate) {
        this._minVideoFrameRate = frameRate;
    }
    set videoFrameRate(frameRate) {
        this._videoFrameRate = frameRate;
    }
    set maxVideoWidth(width) {
        this._maxVideoWidth = width;
    }
    set minVideoWidth(width) {
        this._minVideoWidth = width;
    }
    set idealVideoWidth(width) {
        this._idealVideoWidth = width;
    }
    set maxVideoHeight(height) {
        this._maxVideoHeight = height;
    }
    set minVideoHeight(height) {
        this._minVideoHeight = height;
    }
    set idealVideoHeight(height) {
        this._idealVideoHeight = height;
    }
    set facingMode(mode) {
        this._facingMode = mode;
    }
    /**
     * Optional. RtcSession will grab input device if this is not specified.
     * Please note: this RtcSession class only support single audio track and/or single video track.
     */
    set mediaStream(input) {
        this._localStream = input;
        if (this._pcm) {
            this._pcm._mediaStream = input;
        }
        this._isUserProvidedStream = true;
    }
    /**
     * Needed, expect an audio element that can be used to play remote audio stream.
     */
    set remoteAudioElement(element) {
        this._remoteAudioElement = element;
    }
    set remoteVideoElement(element) {
        this._remoteVideoElement = element;
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
     * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
     * Setting this attribute will force connect-rtc-js to only use specified codec.
     * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
     * Supported video codecs: VP8, VP9, H264.
     */
    set forceVideoCodec(videoCodec) {
        this._forceVideoCodec = videoCodec;
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
        var signalingChannel = new RtcSignaling(this._callId, this._signalingUri, this._contactToken, this._originalLogger, this._signalingConnectTimeout, this._connectionId, this._wssManager, this._iceRestart, this._pcm);
        signalingChannel.onConnected = hitch(this, this._signalingConnected);
        signalingChannel.onAnswered = hitch(this, this._signalingAnswered);
        signalingChannel.onHandshaked = hitch(this, this._signalingHandshaked);
        signalingChannel.onRemoteHungup = hitch(this, this._signalingRemoteHungup);
        signalingChannel.onFailed = hitch(this, this._signalingFailed);
        signalingChannel.onDisconnected = hitch(this, this._signalingDisconnected);

        this._signalingChannel = signalingChannel;
        if (this._pcm){
            this._pcm._signalingChannel = signalingChannel;
        }
        return signalingChannel;
    }

    _bindSignalingChannel() {
        var signalingChannel = this._pcm._signalingChannel;
        signalingChannel.onConnected = hitch(this, this._signalingConnected);
        signalingChannel.onAnswered = hitch(this, this._signalingAnswered);
        signalingChannel.onHandshaked = hitch(this, this._signalingHandshaked);
        signalingChannel.onRemoteHungup = hitch(this, this._signalingRemoteHungup);
        signalingChannel.onFailed = hitch(this, this._signalingFailed);
        signalingChannel.onDisconnected = hitch(this, this._signalingDisconnected);

        this._signalingChannel = signalingChannel;
        return signalingChannel;
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
                pc.close();
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

        // PersistentConnection enabled transit to ConnectContactState
        if (self._pcm && self._pcm.isPersistentConnectionEnabled() && self._pcm._signalingChannel) {
            self._bindSignalingChannel(); // binding the existing signaling channel
            self.transit(new ConnectContactState(self));
        } else {
            self.transit(new GrabLocalMediaState(self));
        }
    }
    accept() {
        throw new UnsupportedOperation('accept does not go through signaling channel at this moment');
    }
    hangup() {
        this._state.hangup();
    }

    /**
     * Get a promise containing an object with two named lists of audio stats, one for each channel on each
     * media type of 'video' and 'audio'.
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

            // For consistency's sake, coalesce rttMilliseconds into the output for audio
            if (audioInputStats && audioInputStats.rttMilliseconds !== null) {
                audioOutputStats._rttMilliseconds = audioInputStats.rttMilliseconds;
            }

            return {
                audioInputStats,
                audioOutputStats,
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
        this._state.onPeerConnectionStateChange();
    }

    _onIceStateChange(evt) {
        this._state.onIceStateChange(evt);
    }

    /**
     * Attach remote media stream to web element.
     */
    _ontrack(evt) {
        this._strategy._ontrack(this, evt);
        this._onRemoteStreamAdded(this, evt.streams[0]);
    }
    _detachMedia() {
        if (this._remoteVideoElement) {
            this._remoteVideoElement.srcObject = null;
        }
        if (this._remoteAudioElement) {
            this._remoteAudioElement.srcObject = null;
            this._remoteAudioStream = null;
        }
    }
    _stopSession() {
        // When peerConnectionManager does not exist or PersistentConnection flag if false, we will close local  media stream
        if (!this._pcm || !this._pcm.isPersistentConnectionEnabled()) {
            try {
                if (this._localStream && !this._isUserProvidedStream) {
                    closeStream(this._localStream);
                    this._localStream = null;
                    this._isUserProvidedStream = false;
                }
            } finally {
                try {
                    if (this._pc) {
                        this._pc.close();
                    }
                } catch(e) {
                    // eat exception
                }
                finally {
                    this._pc = null;
                }
            }
        }
    }

    _buildMediaConstraints() {
        var self = this;
        var mediaConstraints = {};

        self._strategy._buildMediaConstraints(self, mediaConstraints);

        if (self._enableVideo) {
            var videoConstraints = {};
            var widthConstraints = {};
            var heightConstraints = {};
            var frameRateConstraints = {};

            //build video width constraints
            if (typeof self._idealVideoWidth !== 'undefined') {
                widthConstraints.ideal = self._idealVideoWidth;
            }
            if (typeof self._maxVideoWidth !== 'undefined') {
                widthConstraints.max = self._maxVideoWidth;
            }
            if (typeof self._minVideoWidth !== 'undefined') {
                widthConstraints.min = self._minVideoWidth;
            }
            // build video height constraints
            if (typeof self._idealVideoHeight !== 'undefined') {
                heightConstraints.ideal = self._idealVideoHeight;
            }
            if (typeof self._maxVideoHeight !== 'undefined') {
                heightConstraints.max = self._maxVideoHeight;
            }
            if (typeof self._minVideoHeight !== 'undefined') {
                heightConstraints.min = self._minVideoHeight;
            }
            if(Object.keys(widthConstraints).length > 0 && Object.keys(heightConstraints).length > 0) {
                videoConstraints.width = widthConstraints;
                videoConstraints.height = heightConstraints;
            }
            // build frame rate constraints
            if (typeof self._videoFrameRate !== 'undefined') {
                frameRateConstraints.ideal = self._videoFrameRate;
            }
            if (typeof self._minVideoFrameRate !== 'undefined') {
                frameRateConstraints.min = self._minVideoFrameRate;
            }
            if (typeof self._maxVideoFrameRate !== 'undefined') {
                frameRateConstraints.max = self._maxVideoFrameRate;
            }
            if(Object.keys(frameRateConstraints).length > 0) {
                videoConstraints.frameRate = frameRateConstraints;
            }

            // build facing mode constraints
            if(self._facingMode !== 'user' && self._facingMode !== "environment") {
                self._facingMode = 'user';
            }
            videoConstraints.facingMode = self._facingMode;

            // set video constraints
            if (Object.keys(videoConstraints).length > 0) {
                mediaConstraints.video = videoConstraints;
            } else {
                mediaConstraints.video = true;
            }
        }

        return mediaConstraints;
    }
}
