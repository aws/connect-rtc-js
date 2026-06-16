import { DEFAULT_ICE_CANDIDATE_POOL_SIZE, ICE_CONNECTION_STATE, RTC_PEER_CONNECTION_CONFIG } from './rtc_const';
import { SdpOptions, transformSdp } from './utils';
import { BadRequestExceptionName, BusyExceptionName, CallNotFoundExceptionName } from './exceptions';
import { parseCandidate } from 'sdp';
import { PendingInviteState } from "./shared_media_signaling";

/**
 * ConnectedSubstate is the default substate of the shared media session talking state
 * It monitors the peer connection ICE connection state and attempts to reconnect if disconnected.
 * If the ICE connection state changes to 'DISCONNECTED' more than 3 seconds, it triggers an ICE restart.
 */

export class ConnectedSubstate {
    get logger() {
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession) {
        this._sharedMediaSession = sharedMediaSession;
        this.retryInterval = 3000; // Retry interval set to 3 seconds
    }

    onEnter() {
    }

    // onIceStateChange will be invoked when peer connection Ice Connection state change
    onIceStateChange(evt) {
        const iceState = this._sharedMediaSession._strategy.onIceStateChange(evt, this._sharedMediaSession._pc);
        this.logger.info('ICE Connection State: ', iceState);

        if (iceState == ICE_CONNECTION_STATE.DISCONNECTED) {
            // Check if the shared media session supports ICE restart
            if (this._sharedMediaSession.peerConnectionToken) {
                this.logger.info('Detected Lost ICE connection, pending IceRestart');
                this.IceRestartTimeoutId = setTimeout(() => {
                    if (this._sharedMediaSession._pc.iceConnectionState === ICE_CONNECTION_STATE.DISCONNECTED) {
                        this.logger.info('Trying to restart ICE connection');
                        this._sharedMediaSession._sessionReport.iceRestartAttempts += 1;
                        this._sharedMediaSession._state.setSubState(new IceRestartSubstate(this._sharedMediaSession));
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
        if (this._sharedMediaSession.peerConnectionToken) {
            if (e.name === BadRequestExceptionName && e.message.includes("Stale Peer Connection")) {
                this.logger.error('Server detect peer connection being unhealthy, performing IceRestart', e);
                this._sharedMediaSession._sessionReport.iceRestartAttempts += 1;
                this._sharedMediaSession._state.setSubState(new IceRestartSubstate(this._sharedMediaSession));
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
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession) {
        this._sharedMediaSession = sharedMediaSession;
        this._iceRestartStartTime = Date.now();
    }

    onEnter() {
        this.performIceRestart();
    }

    performIceRestart() {
        // For shared media session, we need to request new ICE servers through the signaling channel
        this._sharedMediaSession._iceRestart = true;

        // Request ICE access through signaling channel
        this._sharedMediaSession._requestIceAccess().then((response) => {
            var rtcPeerConnectionConfig = JSON.parse(JSON.stringify(RTC_PEER_CONNECTION_CONFIG));
            rtcPeerConnectionConfig.iceServers = response;
            rtcPeerConnectionConfig.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
            this._sharedMediaSession._pc.setConfiguration(rtcPeerConnectionConfig);
            return this._sharedMediaSession._pc.createOffer({ iceRestart: true });
        }).then((rtcSessionDescription) => {
            this._sharedMediaSession._localSessionDescription = rtcSessionDescription;
            this.logger.info("ICE restart offer created and set as local description");
            this._sharedMediaSession._state.setSubState(new SetLocalSessionDescriptionSubstate(this._sharedMediaSession, this._iceRestartStartTime));
        }).catch((error) => {
            this.logger.error('ICE restart failed', error);
            
            // Send failure notification to call sessions with timing and reset
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession));
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
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession, iceRestartStartTime) {
        this._sharedMediaSession = sharedMediaSession;
        this._iceRestartStartTime = iceRestartStartTime;
    }

    onEnter() {
        const localDescription = this._sharedMediaSession._localSessionDescription;
        const sdpOptions = new SdpOptions();
        sdpOptions.enableOpusDtx = this._sharedMediaSession._enableOpusDtx;

        var transformedSdp = transformSdp(localDescription.sdp, sdpOptions);
        localDescription.sdp = transformedSdp.sdp;
        localDescription.sdp += 'a=ptime:20\r\n';
        localDescription.sdp += 'a=maxptime:20\r\n';
        localDescription.sdp = localDescription.sdp.replace("minptime=10", "minptime=20");

        this.logger.info('LocalSD', this._sharedMediaSession._localSessionDescription);

        this._sharedMediaSession._pc.setLocalDescription(this._sharedMediaSession._localSessionDescription).then(() => {
            this.logger.info("Local description set successfully");
            this._sharedMediaSession._state.setSubState(new ConnectSignalingAndIceCollectionSubstate(this._sharedMediaSession, transformedSdp.mLines, this._iceRestartStartTime));

        }).catch(error => {
            this.logger.error('Failed to set local description', error);
            
            // Send failure notification if this is an ICE restart
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
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
 * 1. Establishes or reuses the signaling channel for the shared media session,
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
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession, mLines, iceRestartStartTime) {
        this._sharedMediaSession = sharedMediaSession;
        this._iceCandidates = [];
        this._iceCandidateFoundationsMap = {};
        this._mLines = mLines;
        this._iceCompletedForIceRestart = false;
        this._iceRestartStartTime = iceRestartStartTime;
    }

    onEnter() {
        setTimeout(() => {
            if (this._isCurrentState() && !this._iceCompletedForIceRestart) {
                this.logger.warn('ICE collection timed out');
                this._reportIceCompleted(true);
            }
        }, this._sharedMediaSession._iceTimeoutMillis);
    }

    _isCurrentState() {
        return this._sharedMediaSession._state._subState === this;
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
        this._sharedMediaSession._onIceCollectionComplete(this._sharedMediaSession, isTimeout, this._iceCandidates.length);
        if (this._iceCandidates.length > 0) {
            this._checkAndTransit();
        } else {
            this.logger.error('No ICE candidate');
            this._sharedMediaSession._sessionReport.iceCollectionFailure = true;
            
            // Send failure notification if this is an ICE restart
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
        }
    }

    _checkAndTransit() {
        if (this._iceCompletedForIceRestart) {
            this._sharedMediaSession._state.setSubState(new InviteAnswerSubstate(this._sharedMediaSession, this._iceCandidates, this._iceRestartStartTime))
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
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession, iceCandidates, iceRestartStartTime) {
        this._sharedMediaSession = sharedMediaSession;
        this._iceCandidates = iceCandidates;
        this._iceRestartStartTime = iceRestartStartTime;
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
        // Attempt to send an invite for ICE restart
        this._sharedMediaSession._createSignalingChannel().connect();

        this._sharedMediaSession._signalingChannel.transit(new PendingInviteState(this._sharedMediaSession._signalingChannel));
        // Use inviteForIceRestart to exclude callContextToken and contactId
        this._sharedMediaSession._signalingChannel.inviteForIceRestart(
            this._sharedMediaSession._localSessionDescription.sdp,
            this._iceCandidates);
    }

    retryInvite() {
        // Retry logic for invite attempts
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this._sharedMediaSession._sessionReport.iceRestartInviteRetries += 1;
            this.logger.info(`Retrying invite in ${this.retryInterval / 1000} seconds. Attempt ${this.retryCount}`);
            this.signalingRetryTimeoutId = setTimeout(() => this.attemptInvite(), this.retryInterval);
        } else {
            this.logger.error(`Max invite attempts reached (${this.maxRetries}). ICE restart failed.`).sendInternalLogToServer();
            
            // Send failure notification to call sessions with timing and reset
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession));
        }
    }

    onSignalingFailed(e) {
        // Handle signaling failures
        if (e.name === BusyExceptionName) {
            this.logger.error('User Busy, possibly multiple CCP windows open. ICE restart failed.', e).sendInternalLogToServer();
            
            // Send failure notification to call sessions with timing and reset
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession));
        } else if (e.name === CallNotFoundExceptionName) {
            this.logger.error('Call not found. One of the participant probably hung up. ICE restart failed.', e).sendInternalLogToServer();
            
            // Send failure notification to call sessions with timing and reset
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession));
        } else {
            this.logger.error('Failed handshaking with signaling server', e);
            this.retryInvite();
        }
    }

    onSignalingAnswered(sdp, candidates) {
        this._sharedMediaSession._state.setSubState(new AcceptSubstate(this._sharedMediaSession, sdp, candidates, this._iceRestartStartTime, this.retryCount));
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
        return this._sharedMediaSession._logger;
    }

    constructor(sharedMediaSession, sdp, candidates, iceRestartStartTime, inviteRetryCount) {
        this._sharedMediaSession = sharedMediaSession;
        this._sdp = sdp;
        this._candidates = candidates;
        this._iceRestartStartTime = iceRestartStartTime;
        this._inviteRetryCount = inviteRetryCount || 0;
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
            
            // Send failure notification if this is an ICE restart
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
        } else if (!this._candidates || this._candidates.length < 1) {
            this.logger.error('No remote ICE candidate');
            
            // Send failure notification if this is an ICE restart
            this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
        } else {
            this._sharedMediaSession._strategy.setRemoteDescriptionForIceRestart(this, this._sharedMediaSession);
        }
    }

    onSignalingHandshaked() {
        this._signalingHandshakedForIceRestart = true;
        this._checkAndTransit();
    }

    onIceRestartFailure() {
        this.logger.error('ICE restart failed during setRemoteDescription').sendInternalLogToServer();
        
        // Send failure notification to call sessions with timing and reset
        this._sharedMediaSession._onIceRestartComplete(false, this._iceRestartStartTime);
        
        this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
    }

    _checkAndTransit() {
        if (this._signalingHandshakedForIceRestart && this._remoteDescriptionSetForIceRestart) {
            this.logger.info(`ICE restart completed successfully after ${this._inviteRetryCount} retries`);
            
            // Send metrics to call sessions and reset
            this._sharedMediaSession._onIceRestartComplete(true, this._iceRestartStartTime);
            
            this._sharedMediaSession._state.setSubState(new ConnectedSubstate(this._sharedMediaSession))
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
