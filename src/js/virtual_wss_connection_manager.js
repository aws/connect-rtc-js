import {hitch} from './utils';
import {SOFTPHONE_ROUTE_KEY} from './rtc_const'

export default class VirtualWssConnectionManager {
    constructor(logger, connectionId, wssManager) {
        this._logger = logger;
        this._connectionId = connectionId;
        this._wssManager = wssManager
        this._initializeWebSocketEventListeners();
    }

    _initializeWebSocketEventListeners() {
        this._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        this._unSubscribe = this._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(this, this._webSocketManagerOnMessage));
        setTimeout(() => {
            this._onOpen();
        }, 0);
    }

    _webSocketManagerOnMessage(event) {
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (this._onMessage && content && this._connectionId === content.connectionId) {
            this._onMessage({data: JSON.stringify(content.jsonRpcMsg)});
        }
    }

    set onmessage(callBack) {
        this._onMessage = callBack;
    }

    set onopen(callBack) {
        this._onOpen = callBack;
    }

    send(webSocketPayload) {
        const payload = {};
        try {
            payload.topic = SOFTPHONE_ROUTE_KEY;
            payload.connectionId = this._connectionId;
            payload.jsonRpcMsg = JSON.parse(webSocketPayload);
            this._wssManager.sendMessage(payload);
        } catch (error) {
            this._logger.error("Error in sendMessage ", error);
        }
    }

    close() {
        this._logger.info("closing virtual connection");
        this._unSubscribe();
    }
}