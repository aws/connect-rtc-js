/**
 * By using the Citrix ucsdk (https://www.npmjs.com/package/@citrix/ucsdk), you are accepting the Citrix Developer Terms of Use  located here: https://www.cloud.com/terms-of-use.
 */

import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import {hitch} from "../utils";
import {FailedState} from "../rtc_session";
import {RTC_ERRORS} from "../rtc_const";
import "@citrix/ucsdk/CitrixWebRTC";

export default class CitrixVDIStrategy extends CCPInitiationStrategyInterface {

    constructor() {
        super();
        if (!window.CitrixWebRTC.isFeatureOn("webrtc1.0")) {
            throw new Error('Citrix WebRTC redirection feature is NOT supported!');
        }
        window.getCitrixWebrtcRedir = function () {
            const registryValue = Promise.resolve(1);
            return new Promise(function (resolve, reject) {
                //retrieve registry value internally
                registryValue.then((v) => {
                    resolve(v);
                }).catch(() => {
                    reject();
                })
            })
        }
        window.CitrixWebRTC.initLog(global.connect.getLog());
        console.log("CitrixVDIStrategy initialized");
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

    connect(self) {
        self._pc.onaddstream = hitch(self, self._ontrack);
    }

    _ontrack(self, evt) {
        const remoteStream = evt.stream.clone();

        const audioTracks = evt.stream.getAudioTracks();
        if (audioTracks !== undefined && audioTracks.length > 0) {
            self._remoteAudioStream = remoteStream;
            self._remoteAudioElement.srcObject = remoteStream;
        }
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