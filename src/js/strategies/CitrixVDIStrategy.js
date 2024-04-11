/**
 * By using the Citrix ucsdk (https://www.npmjs.com/package/@citrix/ucsdk), you are accepting the Citrix Developer Terms of Use  located here: https://www.cloud.com/terms-of-use.
 */

import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import {FailedState} from "../rtc_session";
import {RTC_ERRORS} from "../rtc_const";

export default class CitrixVDIStrategy extends CCPInitiationStrategyInterface {

    constructor(useRealCitrix = true) {
        super();
        if(useRealCitrix){
            require("@citrix/ucsdk/CitrixWebRTC");
        }
        console.log("CitrixVDIStrategy initializing");
        this.initCitrixWebRTC();
        this.initGetCitrixWebrtcRedir();
        this.initLog();
    }

    initCitrixWebRTC() {
        window.CitrixWebRTC.setVMEventCallback((event) => {
            if (event.event === 'vdiClientConnected') {
                if (!window.CitrixWebRTC.isFeatureOn("webrtc1.0")) {
                    throw new Error('Citrix WebRTC redirection feature is NOT supported!');
                }
                console.log("CitrixVDIStrategy initialized");
            } else if (event.event === 'vdiClientDisconnected') {
                console.log("vdiClientDisconnected");
            }
        });
        window.CitrixWebRTC.initUCSDK("AmazonConnect");
    }
    initGetCitrixWebrtcRedir() {
        window.getCitrixWebrtcRedir = () => Promise.resolve(1);
    }

    initLog() {
        window.CitrixWebRTC.initLog(global.connect.getLog());
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isEarlyMediaConnectionSupported() {
        // Citrix WebRTC SDK doesn't support early media connection
        return false;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        return new window.CitrixWebRTC.CitrixPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    // the following functions are rtc_session related functions
    _gUM(constraints) {
        return window.CitrixWebRTC.getUserMedia(constraints);
    }

    addStream(_pc, stream) {
        stream.getTracks().forEach(track => {
            _pc.addTransceiver(track, {});
        });
    }

    setRemoteDescription(self, rtcSession) {
        const answerSessionDescription = self._createSessionDescription({type: 'answer', sdp: self._sdp});

        rtcSession._pc.setRemoteDescription(answerSessionDescription, () => {
            var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                var remoteCandidate = self._createRemoteCandidate(candidate);
                self.logger.info('Adding remote candidate', remoteCandidate);
                return rtcSession._pc.addIceCandidate(remoteCandidate);
            }));
            remoteCandidatePromises.catch(reason => {
                self.logger.warn('Error adding remote candidate', reason);
            });
            rtcSession._sessionReport.setRemoteDescriptionFailure = false;
            self._remoteDescriptionSet = true;
            self._checkAndTransit();
        }, () => {
            rtcSession._stopSession();
            rtcSession._sessionReport.setRemoteDescriptionFailure = true;
            self.transit(new FailedState(rtcSession, RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
        });
    }

    onIceStateChange(evt, _pc) {
        return _pc.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState_;
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        return new window.CitrixWebRTC.CitrixPeerConnection(configuration, optionalConfiguration);
    }

    _ontrack(self, evt) {
        window.CitrixWebRTC.mapAudioElement(self._remoteAudioElement);
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
        self._remoteAudioElement.play();
    }

    _buildMediaConstraints(self, mediaConstraints) {
        if (self._enableAudio) {
            var audioConstraints = {};
            if (typeof self._echoCancellation !== 'undefined') {
                audioConstraints.echoCancellation = !!self._echoCancellation;
            }
            if (window.audio_input) {
                audioConstraints.deviceId = window.audio_input;
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
        return 'CitrixVDIStrategy';
    }
}