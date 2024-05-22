import {assertTrue, hitch, isFunction} from './utils';
import {
    DEFAULT_ICE_CANDIDATE_POOL_SIZE,
    NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS,
    RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS,
    RTC_PEER_CONNECTION_OPTIONAL_CONFIG,
    SOFTPHONE_ROUTE_KEY
} from './rtc_const'
import CCPInitiationStrategyInterface from "./strategies/CCPInitiationStrategyInterface";
import StandardStrategy from "./strategies/StandardStrategy";

export default class RtcPeerConnectionFactory {

    //transportHandle must be a callback function which should return a promise which is going to return the iceServers. Please refer https://www.w3.org/TR/webrtc/#rtciceserver-dictionary for iceServer example
    //publishError(errorType, errorMessage) must be a callback function which will publish the passed error message to client browser
    constructor(logger, wssManager, clientId, transportHandle, publishError, strategy = new StandardStrategy()) {
        if (!(strategy instanceof CCPInitiationStrategyInterface)) {
            throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
        }
        assertTrue(isFunction(transportHandle), 'transportHandle must be a function');
        assertTrue(isFunction(publishError), 'publishError must be a function');
        this._strategy = strategy;
        this._logger = logger;
        this._clientId = clientId;
        this._wssManager = wssManager;
        this._requestIceAccess = transportHandle;
        this._publishError = publishError;
        this._earlyMediaConnectionSupported = this._isEarlyMediaConnectionSupported();
        this._initializeWebSocketEventListeners();
        this._requestPeerConnection();
        this._networkConnectivityChecker();

        this._logger.log("RTC.js is using " + strategy.getStrategyName());
    }

    _isEarlyMediaConnectionSupported() {
        return this._strategy._isEarlyMediaConnectionSupported();
    }

    //This will handle the idleConnection and quota limits notification from the server
    _webSocketManagerOnMessage(event) {
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (content && this._clientId === content.clientId) {
            if (content.jsonRpcMsg.method === "idleConnection") {
                this._clearIdleRtcPeerConnection();
            } else if (content.jsonRpcMsg.method === "quotaBreached") {
                this._logger.log("Number of active sessions are more then allowed limit for the client " + this._clientId);
                this._closeRTCPeerConnection();
                this._publishError("multiple_softphone_active_sessions", "Number of active sessions are more then allowed limit.");
            }
        }
    }

    _initializeWebSocketEventListeners() {
        this._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        this._unSubscribe = this._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(this, this._webSocketManagerOnMessage));
    }

    // This method will create and return new peer connection if browser is not supporting early ice collection.
    // For the supported browser, this method will request for new peerConnection after returning the existing peerConnection
    get(iceServers) {
        var self = this;
        var pc = self._idlePc;
        self._idlePc = null;
        if (pc == null) {
            pc = self._createRtcPeerConnection(iceServers);
        }
        self.clearIdleRtcPeerConnectionTimerId();
        self._requestPeerConnection();
        return pc;
    }

    clearIdleRtcPeerConnectionTimerId() {
        var self = this;
        if (self._idleRtcPeerConnectionTimerId) {
            clearTimeout(self._idleRtcPeerConnectionTimerId);
            self._idleRtcPeerConnectionTimerId = null;
        }
    }

    _requestPeerConnection() {
        var self = this;
        if (!self._peerConnectionRequestInFlight && self._earlyMediaConnectionSupported) {
            self._peerConnectionRequestInFlight = true;
            self._requestIceAccess().then(function (response) {
                    self._idlePc = self._createRtcPeerConnection(response);
                    self._peerConnectionRequestInFlight = false;
                    self._idleRtcPeerConnectionTimerId = setTimeout(hitch(self, self._refreshRtcPeerConnection), RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
                },
                // eslint-disable-next-line no-unused-vars
                function (reason) {
                    self._peerConnectionRequestInFlight = false;
                });
        }
    }

    _networkConnectivityChecker() {
        var self = this;
        setInterval(function () {
            if (!navigator.onLine && self._idlePc) {
                self._logger.log("Network offline. Cleaning up early connection");
                self._idlePc.close();
                self._idlePc = null;
            }
        }, NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS);
    }

    _createRtcPeerConnection(iceServers) {
        var rtcPeerConnectionConfig = JSON.parse(JSON.stringify(RTC_PEER_CONNECTION_CONFIG));
        rtcPeerConnectionConfig.iceServers = iceServers;
        rtcPeerConnectionConfig.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
        return this._strategy._createRtcPeerConnection(rtcPeerConnectionConfig, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
    }

    _clearIdleRtcPeerConnection() {
        this._logger.log("session is idle from long time. closing the peer connection for client " + this._clientId);
        this._closeRTCPeerConnection();
    }

    _refreshRtcPeerConnection() {
        this._idleRtcPeerConnectionTimerId = null;
        this._clearIdleRtcPeerConnection();
        this._logger.log("refreshing peer connection for client " + this._clientId);
        this._requestPeerConnection();
    }

    _closeRTCPeerConnection() {
        if (this._idlePc) {
            this._idlePc.close();
            this._idlePc = null;
        }
    }

    // Clear idle peer connection timer first and then close the idle peer connection.
    close() {
        this._logger.log("close method invoked. Clear timer and close idle peer connection " + this._clientId);
        this.clearIdleRtcPeerConnectionTimerId();
        this._closeRTCPeerConnection();
    }
}