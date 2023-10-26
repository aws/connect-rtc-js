import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import {hitch, isCitrixWebRTCSupported} from "../utils";
import {FailedState} from "../rtc_session";
import {RTC_ERRORS} from "../rtc_const";
import "@citrix/ucsdk/CitrixWebRTC";

export default class CitrixVDIStrategy extends CCPInitiationStrategyInterface {
    constructor() {
        super();
        if (!isCitrixWebRTCSupported()) {
            throw new Error('Citrix WebRTC redirection feature is NOT supported!');
        }
        window.getCitrixWebrtcRedir = function() {
            const registryValue = Promise.resolve(1);
            return new Promise(function(resolve, reject) {
                //retrieve registry value internally
                registryValue.then((v) => {
                    resolve(v); }).catch(() => {
                    reject(); })
            })
        }
        window.CitrixWebRTC.initLog(global.connect.getLog());
        console.log("CitrixVDIStrategy initialized");
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isBrowserSupported(){
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

    createOfferStateOnEnter(_pc, stream) {
        stream.getTracks().forEach(track => {
            _pc.addTransceiver(track, {});
        });
    }

    acceptStateOnEnter(self, rtcSession) {
        console.log(`ConnectRTC - rtc_session - AcceptState - rtcSession._pc.setRemoteDescription`);

        const answerSessionDescription = self._createSessionDescription({ type: 'answer', sdp: self._sdp });
        console.log(`ConnectRTC - rtc_session - AcceptState - answerSessionDescription: `, answerSessionDescription);

        rtcSession._pc.setRemoteDescription(answerSessionDescription, () => {
            console.log(`ConnectRTC - rtc_session - AcceptState - rtcSession._pc.setRemoteDescription - success`);
            var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                var remoteCandidate = self._createRemoteCandidate(candidate);
                self.logger.info('Adding remote candidate', remoteCandidate);
                console.log(`ConnectRTC - rtc_session - AcceptState - rtcSession._pc.setRemoteDescription - Adding remote candidate - remoteCandidate`, remoteCandidate);
                return rtcSession._pc.addIceCandidate(remoteCandidate);
            }));
            remoteCandidatePromises.catch(reason => {
                console.log(`ConnectRTC - rtc_session - AcceptState - rtcSession._pc.setRemoteDescription - Adding remote candidate - failed`, reason);
                self.logger.warn('Error adding remote candidate', reason);
            });
            rtcSession._sessionReport.setRemoteDescriptionFailure = false;
            self._remoteDescriptionSet = true;
            self._checkAndTransit();
        }, (error) => {
            console.error(`ConnectRTC - rtc_session - AcceptState - setRemoteDescription - error:`, error);
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
        console.log('ConnectRTC - rtc_session - RtcSession - _onaddstream:', evt);

        const remoteStream = evt.stream.clone();

        const audioTracks = evt.stream.getAudioTracks();
        console.log('ConnectRTC - rtc_session - RtcSession - _onaddstream - audioTracks:', audioTracks);

        if (audioTracks !== undefined && audioTracks.length > 0) {
            console.log("ConnectRTC - rtc_session - RtcSession - _onaddstream - remoteStream " + remoteStream);
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
            console.log("ConnectRTC - GUM - buildMediaConstraints - window.audio_input: " + window.audio_input);
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

    getName() {
        return 'CitrixVDIStrategy';
    }
}