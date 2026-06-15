import { hitch } from './utils';
import { SOFTPHONE_ROUTE_KEY, PC_BYE_METHOD_NAME } from './rtc_const';

export default class SignalingChannelManager {
    constructor(logger, connectionId, wssManager) {
        this._logger = logger;
        this._connectionId = connectionId;
        this._wssManager = wssManager;
        this._sessionCallbacks = new Map(); // Maps connectionId -> callbacks
        this._pcByeHandler = null; // Handler for PC_BYE messages
        this._initializeWebSocketEventListeners();
    }

    _initializeWebSocketEventListeners() {
        // Cleanup existing subscription if any to prevent duplicate message handlers
        if (this._unSubscribe) {
            this._unSubscribe();
        }
        
        this._wssManager.subscribeTopics([SOFTPHONE_ROUTE_KEY]);
        this._unSubscribe = this._wssManager.onMessage(SOFTPHONE_ROUTE_KEY, hitch(this, this._webSocketManagerOnMessage));
    }

    _webSocketManagerOnMessage(event) {
        let content;
        if (event.content) {
            content = JSON.parse(event.content);
        }
        this._logger.log("Signaling Channel Manager Received Message: ", JSON.stringify(content));

        // Check if this is a PC_BYE message and handle it specially
        if (content && content.jsonRpcMsg && content.jsonRpcMsg.method === PC_BYE_METHOD_NAME) {
            this._logger.log("Signaling Channel Manager received PC_BYE message");
            if (this._pcByeHandler) {
                this._pcByeHandler(content.jsonRpcMsg);
            }
        }

        // Original behavior: notify main handler if connectionId matches
        if (this._onMessage && content) {
            this._logger.log("Signaling Channel Manager Invoking OnMessage: ", JSON.stringify(content.jsonRpcMsg));

            this._onMessage({ data: JSON.stringify(content.jsonRpcMsg) });
        }

        // Added behavior: route to specific session callback
        if (content) {
            const connectionId = content.connectionId;
            const jsonRpcMsg = content.jsonRpcMsg;

            if (connectionId && this._sessionCallbacks.has(connectionId)) {
                const callbacks = this._sessionCallbacks.get(connectionId);
                if (callbacks.onMessage) {
                    callbacks.onMessage(jsonRpcMsg);
                }
            }
        }
    }

    set onmessage(callBack) {
        this._onMessage = callBack;
    }

    set onopen(callBack) {
        this._onOpen = callBack;
    }

    set onerror(callBack) {
        this._onError = callBack;
    }

    set onclose(callBack) {
        this._onClose = callBack;
    }

    // Updated to use the payload's connectionId as is
    send(webSocketPayload, connectionId = this._connectionId) {
        const payload = {};
        try {
            payload.topic = SOFTPHONE_ROUTE_KEY;
            payload.connectionId = connectionId;
            payload.jsonRpcMsg = JSON.parse(webSocketPayload);
            this._logger.log("Signaling Channel Manager sending payload: ", JSON.stringify(payload));
            this._wssManager.sendMessage(payload);
        } catch (error) {
            this._logger.error("Error in sendMessage ", error);
        }
    }

    close() {
        this._logger.info("closing virtual connection");
        this._unSubscribe();
    }

    // Added methods for session management
    registerCallSession(connectionId, callbacks) {
        this._sessionCallbacks.set(connectionId, callbacks);
    }

    unregisterCallSession(connectionId) {
        this._sessionCallbacks.delete(connectionId);
    }

    clearCallSessionCallbacks() {
        this._sessionCallbacks.clear()
    }

    /**
     * Register a handler for PC_BYE messages
     * PC_BYE messages are sent by the server to tear down the peer connection
     * @param {Function} handler - The handler function to call when PC_BYE is received
     */
    registerPCByeHandler(handler) {
        this._pcByeHandler = handler;
    }

    /**
     * Unregister the PC_BYE handler
     */
    unregisterPCByeHandler() {
        this._pcByeHandler = null;
    }
}
