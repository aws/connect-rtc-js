import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import { FailedState } from "../rtc_session";
import { RTC_ERRORS } from "../rtc_const";
import { ANSWER, AUDIO, CHROME, DCV_STRATEGY } from "../config/constants";
const CHROME_SUPPORTED_VERSION = 59;
const DCV_READY_TIMEOUT_MS = 10000;
const HEARTBEAT_CONFIG = Object.freeze({
    heartbeatTimeoutMs: 5000,
    heartbeatIntervalPeriodMs: 500
});

export default class DCVWebRTCStrategy extends CCPInitiationStrategyInterface {
    constructor() {
        super();
        this._isV2 = false;
        // Connection-readiness state: resolved in V1/V2 init callback, reset on 'unavailable'.
        this._resetConnectedPromise();

        if (globalThis.DCVWebRTCPeerConnectionProxyV2) {
            this._initV2();
        } else if (window.DCVWebRTCPeerConnectionProxy) {
            this._initV1();
        } else {
            throw new Error('DCV WebRTC redirection feature is NOT supported!');
        }
    }

    _initV2() {
        globalThis.DCVWebRTCPeerConnectionProxyV2.setInitCallback((result) => {
            if (result.success) {
                this.proxy = result.proxy;
                this.proxy.overrideWebRTC();
                console.log('DCVStrategy initialized (V2), version:', this.proxy.getVersion());
                this._setupReconnectionHandling();
                this._isV2 = true;
                this._connectedResolve();
            } else {
                const err = new Error('DCV WebRTC redirection feature is NOT supported!');
                this._connectedReject(err);
                throw err;
            }
        }, 5000);
    }

    _initV1() {
        window.DCVWebRTCPeerConnectionProxy.setInitCallback((result) => {
            if (result.success) {
                this.proxy = window.DCVWebRTCRedirProxy;
                this.proxy.overrideWebRTC();
                console.log('DCVStrategy initialized (V1)');
                this._connectedResolve();
            } else {
                const err = new Error('DCV WebRTC redirection feature is NOT supported!');
                this._connectedReject(err);
                throw err;
            }
        }, 5000);
    }

    _setupReconnectionHandling() {
        this.proxy.resetHeartbeat(HEARTBEAT_CONFIG);

        this.proxy.addStatusChangeEventListener((event) => {
            if (event.status === 'unavailable') {
                console.error('DCV redirection unavailable. Last heartbeat:',
                    Date.now() - event.lastHeartbeat, 'ms ago');
                this._resetConnectedPromise();
                this._handleRedirectionLost();
            } else if (event.status === 'available') {
                console.info('DCV redirection restored');
                this._handleRedirectionRestored();
                this._connectedResolve();
            }
        });

        this._mediaDevicesProxy = this.proxy.makeMediaDevicesProxy();
    }

    _handleRedirectionLost() {
        if (this._onConnectionNeedingCleanupHandler) {
            try {
                this._onConnectionNeedingCleanupHandler();
            } catch (e) {
                console.error('Error during connection cleanup:', e);
            }
        }
    }

    _handleRedirectionRestored() {
        this.proxy.overrideWebRTC();
        this.proxy.resetHeartbeat(HEARTBEAT_CONFIG);
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
        super._createRtcPeerConnection();
        return this.proxy.createPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    _gUM(constraints) {
        return this.proxy.getUserMedia(constraints);
    }

    _enumerateDevices() {
        if (this._isV2) {
            return this._mediaDevicesProxy.enumerateDevices();
        }
        return this.proxy.enumerateDevices();
    }

    _addDeviceChangeListener(listener) {
        if (this._isV2) {
            this._mediaDevicesProxy.addEventListener("devicechange", listener);
        } else {
            this.proxy.addEventListener("devicechange", listener);
        }
    }

    _removeDeviceChangeListener(listener) {
        if (this._isV2) {
            this._mediaDevicesProxy.removeEventListener("devicechange", listener);
        } else {
            this.proxy.removeEventListener("devicechange", listener);
        }
    }

    _createMediaStream(track) {
        return new MediaStream([track])
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        super._createRtcPeerConnection();
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

    setRemoteDescriptionForIceRestart(self, rtcSession) {
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
            self._remoteDescriptionSetForIceRestart = true;
            self._checkAndTransit();
        }).catch(() => {
            self.onIceRestartFailure();
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

    /**
     * Register a handler for connection cleanup events
     * @param {Function} handler - The handler function to be called when connection needs cleanup
     */
    onConnectionNeedingCleanup(handler) {
        if (typeof handler === 'function') {
            this._onConnectionNeedingCleanupHandler = handler;
        }
    }

    /**
     * Resolves when the DCV proxy init callback fires successfully.
     * Rejects if it does not complete within DCV_READY_TIMEOUT_MS.
     */
    whenConnected() {
        return Promise.race([
            this._connectedPromise,
            new Promise((_, reject) => setTimeout(
                () => reject(new Error(`${this.getStrategyName()} did not connect within ${DCV_READY_TIMEOUT_MS}ms`)),
                DCV_READY_TIMEOUT_MS
            ))
        ]);
    }

    _resetConnectedPromise() {
        this._connectedPromise = new Promise((resolve, reject) => {
            this._connectedResolve = resolve;
            this._connectedReject = reject;
        });
    }

    getStrategyName() {
        return DCV_STRATEGY;
    }
}
