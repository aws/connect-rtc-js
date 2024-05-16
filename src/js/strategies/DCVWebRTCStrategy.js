import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import {FailedState} from "../rtc_session";
import {RTC_ERRORS} from "../rtc_const";
import {ANSWER, AUDIO, CHROME, DCV_STRATEGY, UNDEFINED} from "../config/constants";
const CHROME_SUPPORTED_VERSION = 59;

export default class DCVWebRTCStrategy extends CCPInitiationStrategyInterface {
    constructor() {
        super();

        if (window.DCVWebRTCPeerConnectionProxy) {
            window.DCVWebRTCPeerConnectionProxy.setInitCallback((result) => {
                if(result.success) {
                    // This is only created when:
                    // 1) the dcv webrtc chrome extension is installed and enabled and
                    // 2) this browser is running within a DCV server environment and
                    // 3) the dcv server is connected from a WebRTC redirection-enabled client
                    this.proxy = window.DCVWebRTCRedirProxy;
                    this.proxy.overrideWebRTC();
                    console.log('DCVStrategy initialized');
                } else {
                    throw new Error('DCV WebRTC redirection feature is NOT supported!');
                }

            }, 5000);

        } else {
            throw new Error('DCV WebRTC redirection feature is NOT supported!');
        }
    }

    isChromeBrowser() {
        return this.proxy.clientInfo.browserDetails.browser === CHROME;
    }

    getChromeBrowserVersion() {
        return this.proxy.clientInfo.browserDetails.version;
    }

    _isEarlyMediaConnectionSupported() {
        return this.isChromeBrowser() && this.getChromeBrowserVersion() >= CHROME_SUPPORTED_VERSION;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        return this.proxy.createPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    _buildMediaConstraints(self, mediaConstraints) {
        if (self._enableAudio) {
            var audioConstraints = {};
            if (typeof self._echoCancellation !== UNDEFINED) {
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

    _gUM(constraints) {
        return this.proxy.getUserMedia(constraints);
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        return this.proxy.createPeerConnection(configuration, optionalConfiguration);
    }

    addStream(_pc, stream) {
        stream.getTracks().forEach(track => {
            let transceiver = _pc.addTransceiver(track.kind, {
                streams: [stream]
            });
            transceiver.sender.replaceTrack(track);
        });
    }

    setRemoteDescription(self, rtcSession) {
        var setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
            type: ANSWER,
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

    onIceStateChange(evt, _pc) {
        return _pc.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState;
    }

    _ontrack(self, evt) {
        if (evt.streams.length > 1) {
            console.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' +
                evt.streams.map(stream => stream.id).join(','));
        }
        let stream = evt.streams[0];
        self._remoteAudioElement = this.createMediaElement(stream);
        self._remoteAudioStream = stream;
        self._remoteAudioElement.srcObject = stream;
    }

    createMediaElement(stream) {
        let props = {
            kind: AUDIO,
            autoplay: true,
        };
        let element = stream.createMediaElement(props);
        console.log("Creating proxied media element.");
        return element;
    }

    getStrategyName() {
        return DCV_STRATEGY;
    }
}
