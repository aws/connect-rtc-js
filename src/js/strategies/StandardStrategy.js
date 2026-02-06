import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import { CHROME_SUPPORTED_VERSION, RTC_ERRORS } from "../rtc_const";
import { getChromeBrowserVersion, isChromeBrowser } from "../utils";
import { FailedState } from "../rtc_session";

export default class StandardStrategy extends CCPInitiationStrategyInterface {
    constructor() {
        super();
        console.log("StandardStrategy initialized");
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isEarlyMediaConnectionSupported() {
        return isChromeBrowser() && getChromeBrowserVersion() >= CHROME_SUPPORTED_VERSION;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        super._createRtcPeerConnection();
        return new RTCPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    // the following functions are rtc_session related functions
    _gUM(constraints) {
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    _createMediaStream(track) {
        return new MediaStream([track])
    }

    addStream(_pc, stream) {
        stream.getTracks().forEach(track => {
            _pc.addTrack(track, stream);
        });
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

    setRemoteDescriptionForIceRestart(self, rtcSession) {
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
            self._remoteDescriptionSetForIceRestart = true;
            self._checkAndTransit();
        }).catch(() => {
            self.onIceRestartFailure();
        });
    }

    onIceStateChange(evt, _pc) { // eslint-disable-line no-unused-vars
        return evt.currentTarget.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState;
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        super._createPeerConnection();
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
            if (self._pcm) {
                self._pcm._remoteAudioStream = self._remoteAudioStream;
            }
        }
    }

    _enumerateDevices() {
        if (navigator && navigator.mediaDevices) {
            return navigator.mediaDevices.enumerateDevices();
        } else {
            return Promise.reject('mediaDevices not accessible');
        }
    }

    _addDeviceChangeListener(listener) {
        navigator.mediaDevices.addEventListener("devicechange", listener);
    }

    _removeDeviceChangeListener(listener) {
        navigator.mediaDevices.removeEventListener("devicechange", listener);
    }

    /**
     * Register a handler for connection cleanup events
     * @param {Function} handler - The handler function to be called when connection needs cleanup
     */
    onConnectionNeedingCleanup(handler) {
        if (typeof handler === 'function') {
            this._onConnectionNeedingCleanupHandler = handler;
        }
    }

    getStrategyName() {
        return 'StandardStrategy';
    }
}