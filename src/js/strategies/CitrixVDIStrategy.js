/**
 * By using the Citrix ucsdk (https://www.npmjs.com/package/@citrix/ucsdk), you are accepting the Citrix Developer Terms of Use  located here: https://www.cloud.com/terms-of-use.
 */

import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import { FailedState } from "../rtc_session";
import { RTC_ERRORS } from "../rtc_const";
import {CITRIX_413, CITRIX_SDK_310, CITRIX_SDK_413, CITRIX_VDI_STRATEGY, ONE_SEC_IN_MILLIS, CITRIX} from "../config/constants";
import { wrapLogger } from "../utils";

/**
 * Custom error class for timeout scenarios
 */
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
        this.isTimeout = false;
    }
}

export default class CitrixVDIStrategy extends CCPInitiationStrategyInterface {

    /**
     * @param {boolean} useRealCitrix - Whether to use real Citrix SDK or a mock
     * @param {string} vdiPlatform - The VDI platform type, e.g. "CITRIX", "CITRIX_413".
     *                              Defaults to "CITRIX" which uses the 3.1 SDK.
     */
    constructor(vdiPlatform = CITRIX, useRealCitrix = true) {
        super();

        this._logger = global.connect && global.connect.getLog
            ? wrapLogger(global.connect.getLog(), 'CitrixVDI', 'CitrixVDIStrategy')
            : null;

        this._loadedSdkVersion = null;

        if (useRealCitrix) {
            // SDK Version Selection Logic:
            // - Use 3.1 as default
            // - Use 4.1 opt in with CITRIX_413 VDIPlatform parameter

            try {
                // Only use CITRIX_413 if explicitly specified via parameter, otherwise default to CITRIX 310
                if (vdiPlatform === CITRIX_413) {
                    require("@citrix/ucsdk_4.1/CitrixWebRTC");
                    require("@citrix/ucsdk_4.1/CitrixBootstrap");
                    console.log("CitrixVDIStrategy initializing with SDK version: citrix 4.1");
                    this._loadedSDKVersion = CITRIX_SDK_413;
                    if (this._logger && this._logger.info) {
                        this._logger.info(`Initializing CitrixVDIStrategy with SDK version 4.1 (${CITRIX_SDK_413})`).sendInternalLogToServer();
                    }
                } else {
                    require("@citrix/ucsdk/CitrixWebRTC");
                    console.log("CitrixVDIStrategy initializing with SDK version: citrix 3.1");
                    this._loadedSDKVersion = CITRIX_SDK_310;
                    if (this._logger && this._logger.info) {
                        this._logger.info(`Initializing CitrixVDIStrategy with SDK version 3.1 (${CITRIX_SDK_310})`).sendInternalLogToServer();
                    }
                }
            } catch (error) {
                require("@citrix/ucsdk/CitrixWebRTC");
                this._loadedSDKVersion = CITRIX_SDK_310;
                console.error("Fallback to citrix 3.1 SDK due to error : ", error);
            }
        }

        this._onConnectionNeedingCleanupHandler = () => {};
        this.initializeCitrix();

        // version is an Citrix object in following format
        // "version": {
        //     "type_script": "3.1.0",
        //         "webrpc": "1.7.0.0",
        //         "webrtc_codecs": "0.0.0.0",
        //         "receiver": "24.11.0.51",
        //         "vda": "0.0.0.0",
        //         "endpoint": "0.0.0.0",
        //         "osinfo": {
        //         "family": "Browser",
        //             "version": "15.3.1",
        //             "architecture": "",
        //             "distro": "",
        //             "edition": "Mac-Chrome(version:133.0.0.0, userAgent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36)"
        //     },
        //     "clientPlatform": "Browser"
        // }
        this.version = "UNKNOWN";
    }

    /**
     * Helper function to wrap getRedirectionState with a timeout
     * @param {number} timeoutMs - Timeout in milliseconds
     * @returns {Promise} Promise that resolves with redirection state or rejects on timeout
     */
    async getRedirectionStateWithTimeout(timeoutMs = ONE_SEC_IN_MILLIS) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const timeoutError = new TimeoutError(`getRedirectionState timed out after ${timeoutMs}ms`);
                timeoutError.isTimeout = true;
                reject(timeoutError);
            }, timeoutMs);

            window.CitrixBootstrap.getRedirectionState()
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    async initializeCitrix() {
        console.log("CitrixVDIStrategy: Starting initialization process with SDK :", this._loadedSDKVersion);
        if(this._loadedSDKVersion === CITRIX_SDK_413) {
            try {
                if (window.CitrixBootstrap && typeof window.CitrixBootstrap.getRedirectionState === 'function') {
                    console.log("CitrixVDIStrategy: Bootstrap available, initializing...");
                    // Initialize Bootstrap - it will handle automatic session reconnection
                    window.CitrixBootstrap.initBootstrap("AmazonConnect");
                    window.CitrixBootstrap.initLog(global.connect.getLog(), true);
                    console.log("CitrixVDIStrategy: Bootstrap initialized, checking redirection state...");

                    const redirectionState = await this.getRedirectionStateWithTimeout(ONE_SEC_IN_MILLIS);
                    console.log("Bootstrap redirection state:", redirectionState);

                    // RedirectionState -2 denotes unsupported VDA for bootstrap
                    if (redirectionState !== -2) {
                        console.log("Initializing citrix bootstrap");
                        this.initCitrixWebRTC();
                        this.initLog();
                        return;
                    }
                    // If we reach here, either Bootstrap isn't available or getRedirectionState returned unsupported state
                    console.log("Citrix VDA incompatible for bootstrap, falling back to standard initialization");
                    if (this._logger && this._logger.info) {
                        this._logger.info("Citrix VDA incompatible for bootstrap, falling back to standard initialization").sendInternalLogToServer();
                    }
                }
                console.log("Initializing Citrix SDK without bootstrap support");
                this.initializeWithoutBootstrap();

            } catch (error) {
                if (error instanceof TimeoutError || error.isTimeout) {
                    console.log("Bootstrap redirection state check timed out, falling back to standard initialization");
                    if (this._logger && this._logger.info) {
                        this._logger.info("Bootstrap redirection state check timed out, falling back to standard initialization").sendInternalLogToServer();
                    }
                } else {
                    console.error("Error during citrix bootstrap initialization, falling back to standard initialization:", error);
                }
                console.log("Initializing without bootstrap support");
                this.initializeWithoutBootstrap();
            }
        }
        else {
            console.log("Initializing default Citrix 3.1 SDK");
            this.initializeWithoutBootstrap();
        }
        console.log("CitrixVDIStrategy: Initialization process completed");
    }

    initializeWithoutBootstrap() {
        this.deInitializeBootstrap();
        this.initCitrixWebRTC();
        this.initGetCitrixWebrtcRedir();
        this.initLog();
    }

    deInitializeBootstrap(){
        if (window.CitrixBootstrap) {
            window.CitrixBootstrap.deinitBootstrap("AmazonConnect");
        }
    }

    initCitrixWebRTC() {
        window.CitrixWebRTC.setVMEventCallback((event) => {
            if (event.event === 'vdiClientConnected') {
                console.log("vdiClientConnected Event received");
                if (!window.CitrixWebRTC.isFeatureOn("webrtc1.0")) {
                    const errorMsg = 'Citrix WebRTC redirection feature is NOT supported!';
                    if (this._logger && this._logger.error) {
                        this._logger.error(errorMsg).sendInternalLogToServer();
                    }
                    throw new Error(errorMsg);
                }
                console.log("CitrixVDIStrategy initialized");
                this.version = event.version;
            } else if (event.event === 'vdiClientDisconnected') {
                console.log("vdiClientDisconnected Event received");
                try {
                    this._onConnectionNeedingCleanupHandler(this);
                    console.log("VDI disconnection event triggered");
                } catch (error) {
                    console.error("Error triggering VDI disconnection event for cleanup:", error);
                }

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

    /**
     * Handler for connection cleanup event.
     * @param {Function} handler - The handler function to be called when connection needs cleanup
     */
    onConnectionNeedingCleanup(handler) {
        console.log("CitrixVDIStrategy: Setting VDI disconnection handler");
        if (typeof handler === 'function') {
            this._onConnectionNeedingCleanupHandler = handler;
            console.log("CitrixVDIStrategy: Handler set successfully");
        } else {
            console.error("CitrixVDIStrategy: Invalid handler provided");
        }
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isEarlyMediaConnectionSupported() {
        // Citrix WebRTC SDK doesn't support early media connection
        return false;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        super._createRtcPeerConnection();
        return new window.CitrixWebRTC.CitrixPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
    }

    // the following functions are rtc_session related functions
    _gUM(constraints) {
        return window.CitrixWebRTC.getUserMedia(constraints);
    }

    _enumerateDevices() {
        return window.CitrixWebRTC.enumerateDevices();
    }

    _addDeviceChangeListener(listener) {
        // Citrix fires the event on the navigator.mediaDevices event listener.
        window.navigator.mediaDevices.addEventListener("devicechange", listener);
    }

    _removeDeviceChangeListener(listener) {
        // Citrix fires the event on the navigator.mediaDevices event listener.
        window.navigator.mediaDevices.removeEventListener("devicechange", listener);
    }

    _createMediaStream(track) {
        return window.CitrixWebRTC.createMediaStream([track]);
    }

    addStream(_pc, stream) {
        stream.getTracks().forEach(track => {
            _pc.addTransceiver(track, {});
        });
    }

    setRemoteDescription(self, rtcSession) {
        if (this.version && this.version.clientPlatform === "Browser") {
            // ChromeOS does not support addIceCandidate yet.
            self._candidates.forEach(candidate => {
                if (candidate && typeof candidate.candidate === 'string' && candidate.candidate.trim() !== '') {
                    self._sdp += `a=${candidate.candidate}\n`;
                    self.logger.info('Updated SDP for ChromeOS', `a=${candidate.candidate}\n`);
                }
            });
        }

        const answerSessionDescription = self._createSessionDescription({ type: 'answer', sdp: self._sdp });

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

    // Todo: modify the sdp for ChromeOS here by adding a=candidate line, once pc.setConfiguration is supported for IceRestart
    setRemoteDescriptionForIceRestart(self, rtcSession) {
        const answerSessionDescription = self._createSessionDescription({ type: 'answer', sdp: self._sdp });

        rtcSession._pc.setRemoteDescription(answerSessionDescription, () => {
            var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                var remoteCandidate = self._createRemoteCandidate(candidate);
                self.logger.info('Adding remote candidate', remoteCandidate);
                return rtcSession._pc.addIceCandidate(remoteCandidate);
            }));
            remoteCandidatePromises.catch(reason => {
                self.logger.warn('Error adding remote candidate', reason);
            });
            self._remoteDescriptionSetForIceRestart = true;
            self._checkAndTransit();
        }, () => {
            if (self.logger && self.logger.error) {
                self.logger.error('Ice restart failed').sendInternalLogToServer();
            }
            self.onIceRestartFailure();
        });
    }

    onIceStateChange(evt, _pc) {
        return _pc.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState_;
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        super._createRtcPeerConnection();
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

    getStrategyName() {
        return CITRIX_VDI_STRATEGY;
    }
}