import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import {CHROME_SUPPORTED_VERSION, RTC_ERRORS} from "../rtc_const";
import {getChromeBrowserVersion, isChromeBrowser} from "../utils";
import {FailedState} from "../rtc_session";

export default class StandardStrategy extends CCPInitiationStrategyInterface {
    constructor() {
        super();
        console.log("StandardStrategy initialized");
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isEarlyMediaConnectionSupported(){
        return isChromeBrowser() && getChromeBrowserVersion() >= CHROME_SUPPORTED_VERSION;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        return new RTCPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    // the following functions are rtc_session related functions
    _gUM(constraints) {
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    addStream(_pc, stream) {
        _pc.addStream(stream);
    }

    setRemoteDescription(self, rtcSession) {
        var setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
            type: 'answer',
            sdp: self._sdp
        }));
        setRemoteDescriptionPromise.catch(e => {
            self.logger.error('SetRemoteDescription failed', e);
        });
        setRemoteDescriptionPromise.then(() => {
            var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                var remoteCandidate = self._createRemoteCandidate(candidate);
                self.logger.info('Adding remote candidate', remoteCandidate);
                return rtcSession._pc.addIceCandidate(remoteCandidate);
            }));
            remoteCandidatePromises.catch(reason => {
                self.logger.warn('Error adding remote candidate', reason);
            });
            return remoteCandidatePromises;
        }).then(() => {
            rtcSession._sessionReport.setRemoteDescriptionFailure = false;
            self._remoteDescriptionSet = true;
            self._checkAndTransit();
        }).catch(() => {
            rtcSession._stopSession();
            rtcSession._sessionReport.setRemoteDescriptionFailure = true;
            self.transit(new FailedState(rtcSession, RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
        });
    }

    onIceStateChange(evt, _pc) { // eslint-disable-line no-unused-vars
        return evt.currentTarget.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState;
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        return new RTCPeerConnection(configuration, optionalConfiguration);
    }

    _ontrack(self, evt) {
        if (evt.streams.length > 1) {
            self._logger.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' +
                evt.streams.map(stream => stream.id).join(','));
        }
        if (evt.track.kind === 'video' && self._remoteVideoElement) {
            self._remoteVideoElement.srcObject = evt.streams[0];
            self._remoteVideoStream = evt.streams[0];
        } else if (evt.track.kind === 'audio' && self._remoteAudioElement) {
            self._remoteAudioElement.srcObject = evt.streams[0];
            self._remoteAudioStream = evt.streams[0];
        }
    }

    _buildMediaConstraints(self, mediaConstraints) {
        if (self._enableAudio) {
            var audioConstraints = {};
            if (typeof self._echoCancellation !== 'undefined') {
                audioConstraints.echoCancellation = !!self._echoCancellation;
            }
            if (Object.keys(audioConstraints).length > 0) {
                mediaConstraints.audio = audioConstraints;
            } else {
                mediaConstraints.audio = true;
            }
        } else {
            mediaConstraints.audio = false;
        }
    }

    getStrategyName() {
        return 'StandardStrategy';
    }
}