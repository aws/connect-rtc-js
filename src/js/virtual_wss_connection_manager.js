import {hitch} from './utils';

export default class VirtualWssConnectionManager {

    constructor(logger, connectionId, wssManager) {
        this._softphoeRouteKey = "aws/softphone";
        this._logger = logger;
        this._connectionId = connectionId;
        this._wssManager = wssManager
        this.initializeWebSocketEventListeners();
    }

    initializeWebSocketEventListeners() {
        this._wssManager.subscribeTopics([this._softphoeRouteKey]);
        this._unSubscribe = this._wssManager.onMessage(this._softphoeRouteKey, hitch(this, this.webSocketManagerOnMessage));
    }

    webSocketManagerOnMessage(event) {
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        if (this._onMessage && content && this._connectionId === content.connectionId) {
            this._onMessage({data: JSON.stringify(content.jsonRpcMsg)});
        }
    }

    onMessage(messageCallback) {
        this._onMessage = messageCallback;
    }

    send(webSocketPayload) {
        const payload = {};
        try {
            payload.topic = this._softphoeRouteKey;
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