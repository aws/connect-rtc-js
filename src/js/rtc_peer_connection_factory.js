import {assertTrue, hitch, isFunction} from './utils';
import {
    CHROME_SUPPORTED_VERSION,
    DEFAULT_ICE_CANDIDATE_POOL_SIZE,
    RTC_PEER_CONNECTION_CONFIG,
    RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS,
    RTC_PEER_CONNECTION_OPTIONAL_CONFIG,
    SOFTPHONE_ROUTE_KEY
} from './rtc_const'

export default class RtcPeerConnectionFactory {

    constructor(logger, wssManager, clientId, transportHandle, publishError) {
        assertTrue(isFunction(transportHandle), 'transportHandle must be a function');
        var self = this;
        self._logger = logger;
        self._clientId = clientId;
        self._wssManager = wssManager;
        self._requestIceAccess = transportHandle;
        self._publishError = publishError;
        self._browserSupported = self._isBrowserSupported();
        self._initializeWebSocketEventListeners();
        self._requestPeerConnection();
    }

    _isBrowserSupported() {
        global.connect = global.connect || {};
        return global.connect.isChromeBrowser() && global.connect.getChromeBrowserVersion() >= CHROME_SUPPORTED_VERSION
    }

    //This will handle the idleConnection and quota limits notification from the server
    _webSocketManagerOnMessage(event) {
        var self = this;
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (content && self._clientId === content.clientId) {
            if (content.jsonRpcMsg.method === "idleConnection") {
                self._clearIdleRtcPeerConnection();
            } else if (content.jsonRpcMsg.method === "quotaBreached") {
                self._logger.log("Number of active sessions are more then allowed limit for the client " + self._clientId);
                self._closeRTCPeerConnection();
                self._publishError("multiple_softphone_active_sessions", "Number of active sessions are more then allowed limit.", "");
            }
        }
    }

    _initializeWebSocketEventListeners() {
        var self = this;
        self._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        self._unSubscribe = self._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(self, self._webSocketManagerOnMessage));
    }

    // This method will create and return new peer connection if browser is not supporting early ice collection.
    // For the supported browser, this method will request for new peerConnection after returning the existing peerConnection
    get(iceServers) {
        var self = this;
        var pc = self._pc;
        if (!self._browserSupported || self._pc == null) {
            pc = self._createRtcPeerConnection(iceServers);
        }
        setTimeout(() => {
            self._pc = null;
            self._requestPeerConnection();
        }, 0);
        if (self._idleRtcPeerConnectionTimerId) {
            clearTimeout(self._idleRtcPeerConnectionTimerId);
        }
        return pc;
    }


    _requestPeerConnection() {
        var self = this;
        if (self._browserSupported) {
            self._requestIceAccess().then(function (response) {
                    self._pc = self._createRtcPeerConnection(response.softphoneTransport.softphoneMediaConnections);
                    self._idleRtcPeerConnectionTimerId = setTimeout(hitch(self, self._clearIdleRtcPeerConnection), RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
                },
                // eslint-disable-next-line no-unused-vars
                function (reason) {
                });
        }
    }

    _createRtcPeerConnection(iceServers) {
        RTC_PEER_CONNECTION_CONFIG.iceServers = iceServers;
        RTC_PEER_CONNECTION_CONFIG.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
        return new RTCPeerConnection(RTC_PEER_CONNECTION_CONFIG, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
    }

    _clearIdleRtcPeerConnection() {
        var self = this;
        self._logger.log("session is idle from long time. closing the peer connection for client " + self._clientId);
        self._isConnectionIdle = true;
        self._closeRTCPeerConnection();
    }

    _closeRTCPeerConnection() {
        var self = this;
        if (self._pc) {
            self._pc.close();
            self._pc = null;
        }
    }
}