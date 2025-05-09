import {
    RTC_PEER_CONNECTION_CONFIG,
    ICE_CONNECTION_STATE,
    DEFAULT_ICE_CANDIDATE_POOL_SIZE
} from './rtc_const';
import { SdpOptions, transformSdp } from './utils';
import {
    BusyExceptionName,
    CallNotFoundExceptionName,
    BadRequestExceptionName
} from './exceptions';
import { parseCandidate } from 'sdp';
import { PendingInviteState } from './signaling';

/**
 * ConnectedSubstate is the default substate of the rtcSession talking state
 * It monitors the peer connection ICE connection state and attempts to reconnect if disconnected.
 * If the ICE connection state changes to 'DISCONNECTED' more than 3 seconds, it triggers an ICE restart.
 */

export class ConnectedSubstate {
    get logger() {
        return this._rtcSession._logger;
    }
    constructor(rtcSession) {
        this._rtcSession = rtcSession;
        this.retryInterval = 3000; // Retry interval set to 3 seconds
    }
    onEnter() {
    }
    // onIceStateChange will be invoked when peer connection Ice Connection state change
    onIceStateChange(evt) {
        const iceState = this._rtcSession._strategy.onIceStateChange(evt, this._rtcSession._pc);
        this.logger.info('ICE Connection State: ', iceState);

        if (iceState == ICE_CONNECTION_STATE.DISCONNECTED) {
            // Check if the rtcSession supports ICE restart
            if (this._rtcSession._pcm && this._rtcSession._pcm._peerConnectionToken) {
                this.logger.info('Detected Lost ICE connection, pending IceRestart');
                this.IceRestartTimeoutId = setTimeout(() => {
                    if (this._rtcSession._pc.iceConnectionState === ICE_CONNECTION_STATE.DISCONNECTED) {
                        this.logger.info('Trying to restart ICE connection');
                        this._rtcSession._sessionReport.iceRestartAttempts += 1;
                        this._rtcSession._state.setSubState(new IceRestartSubstate(this._rtcSession));
                    } else {
                        this.logger.info('The network recovered, IceRestart cancelled');
                    }
                }, this.retryInterval)
            } else {
                this.logger.info('Detected Lost ICE connection, IceRestart not supported');
            }
        }
    }

    onSignalingFailed(e) {
        if (this._rtcSession._pcm && this._rtcSession._pcm._peerConnectionToken) {
            if (e.name === BadRequestExceptionName && e.message.includes("Stale Peer Connection")) {
                this.logger.error('Server detect peer connection being unhealthy, performing IceRestart', e);
                this._rtcSession._sessionReport.iceRestartAttempts += 1;
                this._rtcSession._state.setSubState(new IceRestartSubstate(this._rtcSession));
            }
        } else {
            this.logger.info('Server detect peer connection being unhealthy, IceRestart not supported');
        }
    }

    onExit() {
        if (this.IceRestartTimeoutId) {
            this.logger.info('Exiting, cleaning up IceRestart timeout');
            clearTimeout(this.IceRestartTimeoutId);
        }
    }
    get name() {
        return "ConnectedSubstate";
    }
}

/**
 * IceRestartSubstate manages the process of requesting ICE access and initiating an ICE restart.
 * It attempts to restart the ICE connection without retrying on failure.
 *
 * Possible failures include:
 *
 * 1. The `_requestIceAccess` API call fails due to the network not recovering within approximately 13 seconds.
 *    This is calculated based on the time from network loss to ICE connection failure (around 10 seconds),
 *    plus the 3-second `retryInterval` in the `ConnectedSubState`.
 *
 * 2. The `_requestIceAccess` API call is throttled.
 *
 * In case of failure, the ICE restart process is not retried, and the state transitions back to connected sub state
 */
export class IceRestartSubstate {
    get logger() {
        return this._rtcSession._logger;
    }
    constructor(rtcSession) {
        this._rtcSession = rtcSession;
    }
    onEnter() {
        this.performIceRestart();
    }

    performIceRestart() {
        this._rtcSession._pcm._iceRestart = true
        this._rtcSession._pcm._requestIceAccess().then((response) => {
            var rtcPeerConnectionConfig = JSON.parse(JSON.stringify(RTC_PEER_CONNECTION_CONFIG));
            rtcPeerConnectionConfig.iceServers = response;
            rtcPeerConnectionConfig.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
            this._rtcSession._pc.setConfiguration(rtcPeerConnectionConfig);
            return this._rtcSession._pc.createOffer({ iceRestart: true });
        }).then((rtcSessionDescription) => {
            this._rtcSession._localSessionDescription = rtcSessionDescription;
            this.logger.info("ICE restart offer created and set as local description");
            this._rtcSession._state.setSubState(new SetLocalSessionDescriptionSubstate(this._rtcSession));
        }).catch((error) => {
            this.logger.error("ICE restart failed", error);
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession));
        });
    }


    onExit() {
    }
    get name() {
        return "IceRestartSubstate";
    }
}

export class SetLocalSessionDescriptionSubstate {
    get logger() {
        return this._rtcSession._logger;
    }
    constructor(rtcSession) {
        this._rtcSession = rtcSession;
    }
    onEnter() {
        const localDescription = this._rtcSession._localSessionDescription;
        const sdpOptions = new SdpOptions();
        sdpOptions.enableOpusDtx = this._rtcSession._enableOpusDtx;

        var transformedSdp = transformSdp(localDescription.sdp, sdpOptions);
        localDescription.sdp = transformedSdp.sdp;
        localDescription.sdp += 'a=ptime:20\r\n';
        localDescription.sdp += 'a=maxptime:20\r\n';
        localDescription.sdp = localDescription.sdp.replace("minptime=10", "minptime=20");

        this.logger.info('LocalSD', this._rtcSession._localSessionDescription);

        this._rtcSession._pc.setLocalDescription(this._rtcSession._localSessionDescription).then(() => {
            this.logger.info("Local description set successfully");
            this._rtcSession._state.setSubState(new ConnectSignalingAndIceCollectionSubstate(this._rtcSession, transformedSdp.mLines));

        }).catch(error => {
            this.logger.error("Failed to set local description", error);
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
        });

    }

    onExit() {
    }
    get name() {
        return "SetLocalSessionDescriptionSubstate";
    }
}

/**
 * ConnectSignalingAndIceCollectionSubstate manages the signaling connection and ICE candidate collection.
 * It performs the following tasks:
 *
 * 1. Binds the RTCSession's signaling channel to the peer connection manager's signaling channel,
 *
 * 2. Collects ICE candidates and monitors for sufficient candidates to proceed with the ICE restart.
 *
 * 3. Transitions to the next state (InviteAnswerSubstate) upon successful ICE candidate collection.
 *    If no ICE candidates are collected, it transitions to the ConnectedSubstate and reports an ICE
 *    collection failure.
 *
 * 4. Sets a timeout for ICE collection to handle cases where the ICE gathering process gets stuck.
 */
export class ConnectSignalingAndIceCollectionSubstate {
    get logger() {
        return this._rtcSession._logger;
    }
    constructor(rtcSession, mLines) {
        this._rtcSession = rtcSession;
        this._iceCandidates = [];
        this._iceCandidateFoundationsMap = {};
        this._mLines = mLines;
        this._iceCompletedForIceRestart = false;

        // As the peer connection manager is enabled, the RTCSession is created without a signaling channel.
        // To utilize the existing signaling state machine for SDP exchange, the RTCSession's signaling channel
        // is bound to the peer connection manager's signaling channel.
        this._rtcSession._bindSignalingChannel();
    }
    onEnter() {
        setTimeout(() => {
            if (this._isCurrentState() && !this._iceCompletedForIceRestart) {
                this.logger.warn('ICE collection timed out');
                this._reportIceCompleted(true);
            }
        }, this._rtcSession._iceTimeoutMillis);
    }

    _isCurrentState() {
        return this._rtcSession._state._subState === this;
    }

    _createLocalCandidate(initDict) {
        return new RTCIceCandidate(initDict);
    }

    onIceCandidate(evt) {
        const candidate = evt.candidate;
        this.logger.log('onicecandidate ' + JSON.stringify(candidate));
        if (candidate) {
            if (candidate.candidate) {
                this._iceCandidates.push(this._createLocalCandidate(candidate));
                if (!this._iceCompletedForIceRestart) {
                    this._checkCandidatesSufficient(candidate);
                }
            }

        } else {
            this._reportIceCompleted(false);
        }
    }

    _checkCandidatesSufficient(candidate) {
        //check if we collected sufficient candidates from single media server to restart the call
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
        this._iceCompletedForIceRestart = true;
        this._rtcSession._onIceCollectionComplete(this._rtcSession, isTimeout, this._iceCandidates.length);
        if (this._iceCandidates.length > 0) {
            this._checkAndTransit();
        } else {
            this.logger.error('No ICE candidate');
            this._rtcSession._sessionReport.iceCollectionFailure = true;
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
        }
    }

    _checkAndTransit() {
        if (this._iceCompletedForIceRestart) {
            this._rtcSession._state.setSubState(new InviteAnswerSubstate(this._rtcSession, this._iceCandidates))
        } else if (!this._iceCompletedForIceRestart) {
            this.logger.log('Pending ICE collection');
        }
    }

    onExit() {
    }

    get name() {
        return "ConnectSignalingAndIceCollectionSubstate";
    }
}

/**
 * InviteAnswerSubstate handles the invitation and response during signaling.
 * It retries the invite process if it fails due to certain errors.
 */

export class InviteAnswerSubstate {
    get logger() {
        return this._rtcSession._logger;
    }

    constructor(rtcSession, iceCandidates) {
        this._rtcSession = rtcSession;
        this._iceCandidates = iceCandidates;
        this.retryCount = 0;
        this.maxRetries = 3; // Maximum number of retries for the invite process
        // The retry interval is set to 1 second. The actual interval between each invite attempt
        // will be the sum of the MAX_INVITE_DELAY_MS (5 seconds) and the retry interval (1 second).
        // For example, the timing for the three invite attempts would be:
        // 1. First invite: 0 seconds
        // 2. Second invite (after the first invite timeout): 6 seconds
        // 3. Third invite (after the second invite timeout): 12 seconds
        this.retryInterval = 1000; 
    }

    onEnter() {
        this.attemptInvite()
    }

    attemptInvite() {
        // Attempt to send an invite, as we do not know if the signaling (websocket connection) is down or not
        this._rtcSession._createSignalingChannel().connect();
        this._rtcSession._pcm._signalingChannel.transit(new PendingInviteState(this._rtcSession._pcm._signalingChannel));
        this._rtcSession._pcm._signalingChannel.invite(
            this._rtcSession._localSessionDescription.sdp,
            this._iceCandidates);
    }

    retryInvite() {
        // Retry logic for invite attempts
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.logger.info(`Retrying invite in ${this.retryInterval / 1000} seconds. Attempt ${this.retryCount}`);
            this.signalingRetryTimeoutId = setTimeout(() => this.attemptInvite(), this.retryInterval);
        } else {
            this.logger.error("Max invite attempts reached. Returning to ConnectedSubstate.");
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession));
        }
    }

    onSignalingFailed(e) {
        // Handle signaling failures
        if (e.name === BusyExceptionName) {
            this.logger.error('User Busy, possibly multiple CCP windows open', e);
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession));
        } else if (e.name === CallNotFoundExceptionName) {
            this.logger.error('Call not found. One of the participant probably hung up.', e);
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession));
        } else {
            this.logger.error('Failed handshaking with signaling server', e);
            this.retryInvite();
        }
    }

    onSignalingAnswered(sdp, candidates) {
        this._rtcSession._state.setSubState(new AcceptSubstate(this._rtcSession, sdp, candidates));
    }

    onExit() {
        if (this.signalingRetryTimeoutId) {
            this.logger.info('Exiting, cleaning up invite retry timeout');
            clearTimeout(this.signalingRetryTimeoutId);
        }
    }

    get name() {
        return "InviteAnswerSubstate";
    }
}

/**
 * AcceptSubstate handles the remote SDP and remote ICE candidates.
 * It verifies the remote SDP and ICE candidates before proceeding.
 */
export class AcceptSubstate {

    get logger() {
        return this._rtcSession._logger;
    }

    constructor(rtcSession, sdp, candidates) {
        this._rtcSession = rtcSession;
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
        if (!this._sdp) {
            this.logger.error('Invalid remote SDP');
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
        } else if (!this._candidates || this._candidates.length < 1) {
            this.logger.error('No remote ICE candidate');
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
        }
        this._rtcSession._strategy.setRemoteDescriptionForIceRestart(this, this._rtcSession);
    }

    onSignalingHandshaked() {
        this._signalingHandshakedForIceRestart = true;
        this._checkAndTransit();
    }

    onIceRestartFailure() {
        this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
    }

    _checkAndTransit() {
        if (this._signalingHandshakedForIceRestart && this._remoteDescriptionSetForIceRestart) {
            this._rtcSession._state.setSubState(new ConnectedSubstate(this._rtcSession))
        } else if (!this._signalingHandshakedForIceRestart) {
            this.logger.log('Pending handshaking');
        } else { //implies _remoteDescriptionSet == false
            this.logger.log('Pending setting remote description');
        }
    }
    onExit() {
    }
    get name() {
        return "AcceptSubstate";
    }
}
