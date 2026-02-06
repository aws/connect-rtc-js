import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";
import { FailedState } from "../rtc_session";
import { RTC_ERRORS, ACITVE_SOFTPHONE_TAB } from "../rtc_const";

export default class OmnissaVDIStrategy extends CCPInitiationStrategyInterface {
    constructor() {

        super();

        const self = this;
        self.topWindowName = "UNKNOWN";
        self.hasRequestedTitle = false;

        // Initialize Omnissa SDK dependencies
        const HorizonWebRTCExtension = require('@euc-releases/horizon-webrtc-redir-sdk/HorizonWebRTCExtension');
        const HorizonWebRtcRedirectionAPI = require('@euc-releases/horizon-webrtc-redir-sdk/HorizonSDKforWebRTCRedir');

        // Attach SDK instances to window for global access
        window.HorizonWebRTCExtension = HorizonWebRTCExtension;
        window.HorizonWebRtcRedirectionAPI = HorizonWebRtcRedirectionAPI;

        this.globalWindowReference = null;

        window.getHorizonClientID = async function () {
            return new Promise((resolve, reject) => {
                window.HorizonWebRTCExtension.getHorizonClientID()
                    .then((clientID) => {
                        console.log("getHorizonClientID resolved with:", clientID);
                        resolve(clientID);
                    })
                    .catch((error) => {
                        console.error(`Failed to get client ID: ${error}`);
                        reject(`Failed to get client ID: ${error}`);
                    });
            });
        };

        window.getHorizonWSSPort = async function () {
            return new Promise((resolve, reject) => {
                window.HorizonWebRTCExtension.getHorizonWSSPort()
                    .then((wssPort) => {
                        console.log("getHorizonWSSPort resolved with:", wssPort);
                        resolve(wssPort);
                    })
                    .catch((error) => {
                        console.error(`Failed to get WSS port: ${error}`);
                        reject(`Failed to get WSS port: ${error}`);
                    });
            });
        };


        window.getHorizonWindowTitle = function () {
            if (self.topWindowName.endsWith(ACITVE_SOFTPHONE_TAB)) {
                return self.topWindowName;
            }

            const currentTime = self.getCurrentTimeString();
            try {
                return self.setTopWindowName(top.document.title + currentTime + ACITVE_SOFTPHONE_TAB);
            } catch (error) {
                self.setupMessageListener();
                return self.topWindowName;
            }
        };

        // Initialize SDK with logging and event handling
        const prefix = "OmnissaVDI";
        const appLogger = {
            error: (msg) => global.connect.getLog().error(prefix + ": " + msg),
            info: (msg) => global.connect.getLog().info(prefix + ": " + msg),
            warn: (msg) => global.connect.getLog().warn(prefix + ": " + msg)
        };
        const appName = "AmazonConnect";
        const initResult = window.HorizonWebRtcRedirectionAPI.initSDK(appLogger, appName, this.vmEventHandler);
        if (!initResult) {
            throw new Error('Omnissa WebRTC Redirection API failed to initialize');
        }
    }


    vmEventHandler(event) {
        let eventType = event.event;
        console.log("Horizon WebRTCRedirSDK Event:", JSON.stringify(event));
        switch (eventType) {
            case "vdiClientConnected":
                console.log("Got event from WebRTCRedirSDK: vdiClientConnected")
                break;
            case "vdiClientDisconnected":
                console.log("Got event from WebRTCRedirSDK: vdiClientDisconnected")
                break;
            default:
                console.log("Got an unknown event from WebRTCRedirSDK: " + JSON.stringify(event));
        }
    }


    /**
     * Checks if early/standby media connection is supported
     * @returns {boolean} Always returns false as early media connection is not supported in Omnissa VDI
     *
     * Note: Set to false based on testing - when set to true, calls go to missed state.
     * This indicates Omnissa SDK does not support early media connections.
     * Any changes to this value should be coordinated with Omnissa team and thoroughly tested.
     */
    _isEarlyMediaConnectionSupported() {
        return false;
    }

    _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
        super._createRtcPeerConnection();
        return window.HorizonWebRtcRedirectionAPI.newPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig)
    }

    _gUM(constraints) {
        return window.HorizonWebRtcRedirectionAPI.getUserMedia(constraints);
    }

    _enumerateDevices() {
        return window.HorizonWebRtcRedirectionAPI.enumerateDevices();
    }

    _addDeviceChangeListener(listener) {
        // Omnissa fires the event on the navigator.mediaDevices event listener.
        window.navigator.mediaDevices.addEventListener("devicechange", listener);
    }

    _removeDeviceChangeListener(listener) {
        // Omnissa fires the event on the navigator.mediaDevices event listener.
        window.navigator.mediaDevices.removeEventListener("devicechange", listener);
    }

    _createMediaStream(track) {
        return window.HorizonWebRtcRedirectionAPI.newMediaStream([track]);
    }

    _createPeerConnection(configuration, optionalConfiguration) {
        super._createRtcPeerConnection();
        return window.HorizonWebRtcRedirectionAPI.newPeerConnection(configuration, optionalConfiguration);
    }

    onIceStateChange(evt, _pc) {
        return _pc.iceConnectionState;
    }

    onPeerConnectionStateChange(_pc) {
        return _pc.connectionState;
    }

    addStream(_pc, stream) {
        stream.getTracks().forEach(function (track) {
            _pc.addTrack(track, stream);
        });
    }

    setRemoteDescription(self, rtcSession) {
        const setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
            type: 'answer',
            sdp: self._sdp
        }));
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
            self.logger.error('Stopping session due to setRemoteDescription failure');
            rtcSession._stopSession();
            rtcSession._sessionReport.setRemoteDescriptionFailure = true;
            self.transit(new FailedState(rtcSession, RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
        });
    }

    setRemoteDescriptionForIceRestart(self, rtcSession) {
        /**
         * Check for Horizon client version compatibility
         *
         * Background:
         * - Omnissa creates setConfiguration() method only in newer Horizon clients
         * - Older clients won't have this method on the peerConnection object
         *
         * Why this check:
         * 1. Different Horizon client versions have different capabilities
         * 2. ICE restart feature is only available in newer versions (2503 and above)
         * 3. Attempting ICE restart on older clients could cause errors
         *
         * Behavior:
         * - If setConfiguration exists: Client supports ICE restart (proceed)
         * - If not: Older client version (skip ICE restart)
         */
        if (rtcSession._pc.setConfiguration) {
            self.logger.info('Modern Horizon client detected, proceeding with ICE restart');

            const setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
                type: 'answer',
                sdp: self._sdp
            }));
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
            }).catch((error) => {
                self.logger.error('ICE restart failed', {
                    error: error,
                    peerConnectionState: rtcSession._pc.connectionState,
                    iceConnectionState: rtcSession._pc.iceConnectionState,
                    signalingState: rtcSession._pc.signalingState
                });
                self.onIceRestartFailure();
            });
        }
        else {
            self.logger.error('Legacy Horizon client detected, skipping ICE restart');
            self.onIceRestartFailure();
        }
    }
    _ontrack(self, evt) {
        // Check for empty streams
        if (evt.streams.length === 0) {
            self._logger.warn('No streams found in the event');
            return;
        }
        // Check for multiple streams
        if (evt.streams.length > 1) {
            self._logger.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' +
                evt.streams.map(stream => stream.id).join(','));
        }
        let stream = evt.streams[0];
        let audioTrack = stream.getAudioTracks()[0];

        console.log("Audio Track:", audioTrack);
        console.log("Checking value of stream: ", JSON.stringify(stream, null, 2));

        // Set up remote audio element
        if (stream.track[0].kind === 'audio' && self._remoteAudioElement) {
            try {
                // TODO: Optimize audio element creation. Either use the same audio element or implement a cleanup mechanism
                // Currently creating a new element for each call.

                let remoteAudio = document.createElement('audio');
                remoteAudio.id = "remoteAudioElement" + 0;
                window.HorizonWebRtcRedirectionAPI.onAudioCreated(remoteAudio, this.globalWindowReference);
                remoteAudio.srcObject = stream;
                self._remoteAudioElement = remoteAudio;
                self._remoteAudioStream = stream;
            } catch (e) {
                console.error("Failed to set srcObject on _remoteAudioElement:", e);
                return;  // Return after error since we can't proceed
            }
        }

        self._remoteAudioElement.autoplay = true;
        self._remoteAudioElement.playsInline = true;
    }

    getStrategyName() {
        return 'OmnissaVDIStrategy';
    }

    getCurrentTimeString() {
        const currentTime = new Date();
        return ` ${currentTime.getHours()}${currentTime.getMinutes()}${currentTime.getSeconds()} `;
    }

    setTopWindowName(title) {
        const self = this;
        top.document.title = title;
        self.topWindowName = title;
        return self.topWindowName;
    }

    setupMessageListener() {
        const self = this;
        window.addEventListener('message', this.handleMessage.bind(this));

        if (!self.hasRequestedTitle) {
            self.hasRequestedTitle = true;
            window.parent.postMessage({ type: 'get_horizon_window_title' }, '*');
        }
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

    handleMessage(event) {
        const self = this;
        if (event.data.type === 'horizon_window_title_response') {
            self.topWindowName = event.data.title;
        }
    }
}