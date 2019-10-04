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

    constructor(logger, wssManager, connectionId, transportHandle, publishError) {
        assertTrue(isFunction(transportHandle), 'transportHandle must be a function');
        var self = this;
        self._logger = logger;
        self._connectionId = connectionId;
        self._wssManager = wssManager;
        self._requestIceAccess = transportHandle;
        self._publishError = publishError;
        self._isPcUsed = false;
        self._isConnectionIdle = false;
        self._isQuotaBreached = false;
        self._browserSupported = self._isBrowserSupported();
        self._initializeWebSocketEventListeners();
        self._requestPeerConnections();
    }

    _isBrowserSupported() {
        global.connect = global.connect || {};
        return global.connect.isChromeBrowser() && global.connect.getChromeBrowserVersion() >= CHROME_SUPPORTED_VERSION
    }

    //This will help us to manage the idleConnection and quota limts notification from the server
    _webSocketManagerOnMessage(event) {
        var self = this;
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (content && self._connectionId === content.connectionId && (content.jsonRpcMsg.method === "idleConnection" || content.jsonRpcMsg.method === "quotaBreached")) {
            if (content.jsonRpcMsg.method === "idleConnection") {
                self._clearIdleRtcPeerConnections();
            } else if (content.jsonRpcMsg.method === "quotaBreached") {
                self._logger.log("Number of CCP windows open are more then allowed limit for the client " + self._connectionId);
                self._isQuotaBreached = true;
                self._closeRTCPeerConnections();
                self._publishError("multiple_ccp_windows", "Number of CCP windows open are more then allowed limit.", "");
            }
        }
    }

    _initializeWebSocketEventListeners() {
        var self = this;
        self._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        self._unSubscribe = self._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(self, self._webSocketManagerOnMessage));
    }

    // This method will create and return new peer connection if browser is not supporting early ice collection.
    // It will create pc and backup pc in case of pc and backup pc is closed because of idle.
    // Method will return pc and backup alternatively for the calls.
    get(iceServers) {
        var self = this;
        var pc;
        self._isConnectionIdle = false;
        self._isQuotaBreached = false;
        if (!self._browserSupported) {
            pc = self._createRtcPeerConnection(iceServers);
        } else if (self._pc && !self._isPcUsed) {
            self._isPcUsed = true;
            pc = self._pc;
        } else if (self._backupPc) {
            self._isPcUsed = false;
            pc = self._backupPc;
        } else {
            self._initializeRtcPeerConnections(iceServers);
            self._isPcUsed = true;
            pc = self._pc;
        }
        if (self._idleRtcPeerConnectionsTimerId) {
            clearTimeout(self._idleRtcPeerConnectionsTimerId);
        }
        return pc;
    }

    //This method will listen the signaling state change of pc and refresh the pc except connection was idle or user has breached the quota limit
    _pcOnsignalingstatechangeEventHandler(event) {// eslint-disable-line no-unused-vars
        var self = this;
        //Chrome supported connectionState in RtcPeerConnection from version 72. Before that signalingState was used to determine the status of the RtcPeerConnection
        if (self._pc.connectionState === "closed" || self._pc.signalingState === "closed") {
            self._pc = null;
            if (!self._isConnectionIdle && !self._isQuotaBreached) {
                self._requestPeerConnections();
            }
        }
    }

    //This method will listen the signaling state change of backup pc and refresh the backup pc except connection was idle or user has breached the quota limit
    _backupPcOnsignalingstatechangeEventHandler(event) {// eslint-disable-line no-unused-vars
        var self = this;
        //Chrome supported connectionState in RtcPeerConnection from version 72. Before that signalingState was used to determine the status of the RtcPeerConnection
        if (self._backupPc.connectionState === "closed" || self._pc.signalingState === "closed") {
            self._backupPc = null;
            if (!self._isConnectionIdle && !self._isQuotaBreached) {
                self._requestPeerConnections();
            }
        }
    }

    _requestPeerConnections() {
        var self = this;
        if (self._browserSupported) {
            self._requestIceAccess().then(function (response) {
                    self._initializeRtcPeerConnections(response.softphoneTransport.softphoneMediaConnections);
                },
                // eslint-disable-next-line no-unused-vars
                function (reason) {
                });
        }
    }

    //This method will initialize the pc and backup. This method will also set the timeout for managing idle connections
    _initializeRtcPeerConnections(iceServers) {
        var self = this;
        if (self._pc == null) {
            self._pc = self._createRtcPeerConnection(iceServers, self._pcOnsignalingstatechangeEventHandler);
        }
        if (self._backupPc == null) {
            self._backupPc = self._createRtcPeerConnection(iceServers, self._backupPcOnsignalingstatechangeEventHandler);
        }
        self._idleRtcPeerConnectionsTimerId = setTimeout(hitch(self, self._clearIdleRtcPeerConnections), RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
    }

    _createRtcPeerConnection(iceServers, signalingstatechangeEventHandler) {
        var self = this;
        RTC_PEER_CONNECTION_CONFIG.iceServers = iceServers;
        RTC_PEER_CONNECTION_CONFIG.iceCandidatePoolSize = DEFAULT_ICE_CANDIDATE_POOL_SIZE;
        var pc = new RTCPeerConnection(RTC_PEER_CONNECTION_CONFIG, RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
        if (signalingstatechangeEventHandler) {
            pc.onsignalingstatechange = hitch(self, signalingstatechangeEventHandler);
        }
        return pc;
    }

    _clearIdleRtcPeerConnections() {
        var self = this;
        self._logger.log("session is idle from long time. closing the peer connections for client " + self._connectionId);
        self._isConnectionIdle = true;
        self._closeRTCPeerConnections();
    }

    _closeRTCPeerConnections() {
        var self = this;
        if (self._pc) {
            self._pc.close();
        }
        if (self._backupPc) {
            self._backupPc.close();
        }
    }
}