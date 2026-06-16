/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { getRedactedSdp, hitch, wrapLogger } from './utils';
import {
    ACCEPT_METHOD_NAME,
    BYE_METHOD_NAME,
    DEFAULT_CONNECT_TIMEOUT_MS,
    INVITE_METHOD_NAME,
    MAX_ACCEPT_BYE_DELAY_MS,
    MAX_INVITE_DELAY_MS
} from './rtc_const';
import {
    AccessDeniedException,
    BadRequestException,
    BusyException,
    CallNotFoundException,
    IdempotencyException,
    InternalServerException,
    RequestTimeoutException,
    SignalingChannelDownError,
    Timeout,
    UnknownSignalingError,
    UnsupportedOperation
} from './exceptions';
import {v4 as uuid} from 'uuid';

const INVITE_MAX_RETRIES = 0;

/**
 * Abstract signaling state class for SharedMediaSession.
 * This is closely modeled after the original SignalingState class in signaling.js.
 */
export class SharedMediaSignalingState {
    /**
     * @param {SharedMediaSignaling} signaling SharedMediaSignaling object.
     */
    constructor(signaling) {
        this._signaling = signaling;
        this._createTime = new Date().getTime();
    }

    setStateTimeout(timeoutMs) {
        setTimeout(hitch(this, this._onTimeoutChecked), timeoutMs);
    }

    get isCurrentState() {
        return this === this._signaling.state;
    }

    onEnter() {
    }

    _onTimeoutChecked() {
        if (this.isCurrentState) {
            this.onTimeout();
        }
    }

    onTimeout() {
        throw new UnsupportedOperation();
    }

    transit(newState) {
        this._signaling.transit(newState);
    }

    onExit() {
    }

    onOpen() {
        throw new UnsupportedOperation('onOpen not supported by ' + this.name);
    }

    onError() {
        this.channelDown();
    }

    onClose() {
        this.channelDown();
    }

    channelDown() {
        throw new UnsupportedOperation('channelDown not supported by ' + this.name);
    }

    onRpcMsg(rpcMsg) { // eslint-disable-line no-unused-vars
        throw new UnsupportedOperation('onRpcMsg not supported by ' + this.name);
    }

    invite(sdp, iceCandidates) { // eslint-disable-line no-unused-vars
        throw new UnsupportedOperation('invite not supported by ' + this.name);
    }

    inviteForIceRestart(sdp, iceCandidates) { // eslint-disable-line no-unused-vars
        throw new UnsupportedOperation('inviteForIceRestart not supported by ' + this.name);
    }

    accept() {
        throw new UnsupportedOperation('accept not supported by ' + this.name);
    }

    connectContact() {
        throw new UnsupportedOperation('connectContact not supported by ' + this.name);
    }

    hangup() {
        // do nothing
    }

    bye() {
        // do nothing
    }

    get name() {
        return "SharedMediaSignalingState";
    }

    get logger() {
        return this._signaling._logger;
    }
}

export class FailOnTimeoutState extends SharedMediaSignalingState {
    constructor(signaling, timeoutMs) {
        super(signaling);
        this._timeoutMs = timeoutMs;
    }

    onEnter() {
        this.setStateTimeout(this._timeoutMs);
    }

    onTimeout() {
        this.transit(new FailedState(this._signaling, new Timeout()));
    }

    get name() {
        return "FailOnTimeoutState";
    }
}

export class PendingConnectState extends FailOnTimeoutState {
    constructor(signaling, timeoutMs, initialStartTimeIn, retriesIn) {
        super(signaling, timeoutMs);
        this._initialStartTime = initialStartTimeIn || new Date().getTime();
        this._retries = retriesIn || 0;
    }

    // onOpen would not happen when the signaling channel manager is created by pcm
    onEnter() {
        this.transit(new PendingInviteState(this._signaling));
    }

    channelDown() {
        this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
    }

    get name() {
        return "PendingConnectState";
    }
}


export class PendingInviteState extends SharedMediaSignalingState {
    constructor(signaling, retriesIn) {
        super(signaling);
        this._retries = retriesIn;
    }

    onEnter() {
        var self = this;
        new Promise(function notifyConnected(resolve) {
            self._signaling._connectedHandler();
            resolve();
        });
    }

    /**
     * Send RTC invite to backend service
     *
     * @param sdp
     * @param iceCandidates
     */
    invite(sdp, iceCandidates) {
        var self = this;
        var inviteId = uuid();

        var inviteParams = {
            sdp: sdp,
            candidates: iceCandidates,
            callContextToken: self._signaling._contactToken, // could be null
            contactId: typeof self._signaling._callId === "undefined" ? "" : self._signaling._callId, // could be null
            browserId: self._signaling._browserId,
            persistentConnection: self._signaling._isPersistentConnectionEnabled,
            peerConnectionToken: self._signaling._peerConnectionToken,
            peerConnectionId: self._signaling._peerConnectionId,
            iceRestart: self._signaling._iceRestart || false,
            allowExtendedPersistentConnection: self._signaling._allowExtendedPersistentConnection,
        };

        self.logger.log('Sending SDP', getRedactedSdp(sdp));
        self._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0', method: INVITE_METHOD_NAME, params: inviteParams, id: inviteId,
        }), self._signaling._connectionId);
        self.transit(new PendingAnswerState(self._signaling, inviteId, this._retries));
    }

    /**
     * Send RTC invite for ICE restart to backend service
     * Excludes callContextToken and contactId as they are not needed for ICE restart
     *
     * @param sdp
     * @param iceCandidates
     */
    inviteForIceRestart(sdp, iceCandidates) {
        var self = this;
        var inviteId = uuid();

        var inviteParams = {
            sdp: sdp,
            candidates: iceCandidates,
            browserId: self._signaling._browserId,
            persistentConnection: self._signaling._isPersistentConnectionEnabled,
            peerConnectionToken: self._signaling._peerConnectionToken,
            peerConnectionId: self._signaling._peerConnectionId,
            iceRestart: true,
            allowExtendedPersistentConnection: self._signaling._allowExtendedPersistentConnection,
        };

        self.logger.log('Sending SDP for ICE restart', getRedactedSdp(sdp));

        self._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0', method: INVITE_METHOD_NAME, params: inviteParams, id: inviteId,
        }), self._signaling._connectionId);
        self.transit(new PendingAnswerState(self._signaling, inviteId, this._retries));
    }

    channelDown() {
        this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
    }

    get name() {
        return "PendingInviteState";
    }
}

export class PendingAnswerState extends FailOnTimeoutState {

    /**
     * Creates PendingAnswerState which resolves the answer of invite request
     *
     * @param signaling
     * @param inviteId
     */
    constructor(signaling, inviteId, retriesIn) {
        super(signaling, MAX_INVITE_DELAY_MS);
        this._inviteId = inviteId;
        this._retries = retriesIn || 0;
    }

    /**
     * RPC message event handler
     *
     * @param msg response of invite request sent by backend service
     * "result": {
     *                 "candidates": ["List of ICE candidates"]
     *                 "sdp": "SDP Object",
     *                 "inactivityDuration": 600000 or 0,
     *                 "peerConnectionId": "Peer Connection ID",
     *                 "peerConnectionToken": "Peer Connection Token from RTPS"
     *             }
     */
    onRpcMsg(msg) {
        var self = this;
        if (msg.id === this._inviteId) { // TODO: check peer connection id here
            if (msg.error || !msg.result) {
                // Retry logic for invite error, currently is disabled
                if (++this._retries < INVITE_MAX_RETRIES) {
                    this.transit(new PendingInviteState(this._signaling, this._retries));
                } else {
                    this.transit(new FailedState(this._signaling, this.translateInviteError(msg)));
                }
            } else {
                new Promise(function notifyAnswered(resolve) {
                    self.logger.log('Received SDP', getRedactedSdp(msg.result.sdp));
                    if (self._signaling) {
                        self._signaling._peerConnectionToken = msg.result.peerConnectionToken;
                        self._signaling._peerConnectionId = msg.result.peerConnectionId;
                        const isRTPSAllowlisted = !!msg.result.peerConnectionId;// if peerConnectionId is defined, isRTPSAllowlisted will be set to true, otherwise, it will remain false
                        self._signaling.isRTPSAllowlisted = isRTPSAllowlisted;
                        self._signaling._answeredHandler(msg.result.sdp, msg.result.candidates, msg.result.inactivityDuration, msg.result.peerConnectionId, msg.result.peerConnectionToken);
                    } else {
                        self._signaling._answeredHandler(msg.result.sdp, msg.result.candidates);
                    }
                    self._signaling._isMediaClusterPath = !(msg.result.sdp.includes('AmazonConnect') && msg.result.sdp.includes('silenceSupp'));
                    resolve();
                });
                this.transit(new PendingAcceptState(this._signaling, this._signaling._autoAnswer));
            }
        }
    }

    translateInviteError(msg) {
        if (msg.error && msg.error.code == 403) {
            return new AccessDeniedException(msg.error.message);
        } else if (msg.error && msg.error.code == 486) {
            return new BusyException(msg.error.message);
        } else if (msg.error && msg.error.code == 404) {
            return new CallNotFoundException(msg.error.message); // ResourceNotFoundException
        } else if (msg.error && msg.error.code == 400) {
            return new BadRequestException(msg.error.message); // BadRequestException
        } else if (msg.error && msg.error.code == 408) {
            return new RequestTimeoutException(msg.error.message); // RequestTimeoutException
        } else if (msg.error && msg.error.code == 409) {
            return new IdempotencyException(msg.error.message); // IdempotencyException
        } else if (msg.error && msg.error.code == 500) {
            return new InternalServerException(msg.error.message); // InternalServerException
        } else {
            return new UnknownSignalingError();
        }
    }

    hangup() {
        this.transit(new FailedState(this._signaling, "Hangs up in PendingAnswerState"));
    }

    get name() {
        return "PendingAnswerState";
    }
}

export class PendingAcceptState extends SharedMediaSignalingState {

    /**
     * Creates PendingAcceptState which sends accpet request to backend server
     *
     * @param signaling - signaling Object
     * @param autoAnswer - boolean object
     * @param retriesIn - the number of retry times
     */
    constructor(signaling, autoAnswer, retriesIn) {
        super(signaling);
        this._autoAnswer = autoAnswer;
        this._retries = retriesIn;
    }

    onEnter() {
        if (this._autoAnswer) {
            this.accept();
        }
    }

    accept() {
        this.sendAcceptRequest();
        this.transit(new TalkingState(this._signaling, this._acceptId, this._retries, ACCEPT_METHOD_NAME));
    }

    channelDown() {
        this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
    }

    get name() {
        return "PendingAcceptState";
    }

    async sendAcceptRequest() {
        this._acceptId = uuid();
        var acceptParams = {};
        acceptParams = {
            contactId: typeof this._signaling.callId === "undefined" ? null : this._signaling.callId,
            persistentConnection: this._signaling._isPersistentConnectionEnabled,
            peerConnectionId: this._signaling._peerConnectionId,
            peerConnectionToken: this._signaling._peerConnectionToken
        };

        this._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0', method: ACCEPT_METHOD_NAME, params: acceptParams, id: this._acceptId
        }));
    }
}

export class TalkingState extends SharedMediaSignalingState {
    /**
     *
     * @param signaling - signaling channel
     * @param methodId - the id for the accept request
     * @param retriesIn - the number of retry times
     * @param retryMethod - the method we want to retry
     */
    constructor(signaling, methodId, retriesIn, retryMethod) {
        super(signaling);
        this._methodId = methodId;
        this._retries = retriesIn || 0;
        this._retryMethod = retryMethod;
    }

    onEnter() {
        var self = this;
        new Promise(function notifyHandshaked(resolve) {
            self._signaling._handshakedHandler();
            resolve();
        });
        self._signaling._isFirstTimeSetup = false;
    }

    hangup(serverInitiated = false) {
        if (serverInitiated) {
            // Server already sent PC_BYE, just transition to disconnected without sending BYE back
            this.logger.log("Server-initiated hangup, skipping BYE message");
            this.transit(new DisconnectedState(this._signaling));
        } else {
            // Client-initiated hangup, send BYE to server
            this.bye();
        }
    }

    bye() {
        this._byeId = uuid();
        var byeParams = {};
        byeParams = {
            contactId: this._signaling._callId,
            persistentConnection: this._signaling._isPersistentConnectionEnabled,
            peerConnectionId: this._signaling._peerConnectionId,
            peerConnectionToken: this._signaling._peerConnectionToken,
            callContextToken: this._signaling._contactToken,
        }
        this._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0', method: BYE_METHOD_NAME, params: byeParams, id: this._byeId
        }));

        this.transit(new PendingRemoteHangupState(this._signaling, this._byeId));
    }

    onRpcMsg(msg) {
        if (msg.method === BYE_METHOD_NAME) {
            this.transit(new PendingLocalHangupState(this._signaling, msg.id));
        } else if (this._signaling && msg.error && msg.id === this._methodId) {
            // Todo: review this error handling. List possible errors
            this.transit(new FailedState(this._signaling, this.translateResponseError(msg)));
        }
        // Note: PC_BYE_METHOD_NAME is now handled exclusively by RtcPeerConnectionManagerV2
    }

    translateResponseError(msg) {
        if (msg.error && msg.error.code == 403) { // AccessDeniedException
            return new AccessDeniedException(msg.error.message);
        } else if (msg.error.code == 404) {
            return new CallNotFoundException(msg.error.message); // ResourceNotFoundException
        } else if (msg.error.code == 400) {
            return new BadRequestException(msg.error.message); // BadRequestException
        } else if (msg.error.code == 408) {
            return new RequestTimeoutException(msg.error.message); // RequestTimeoutException
        } else if (msg.error.code == 500) {
            return new InternalServerException(msg.error.message); // InternalServerException
        } else {
            return new UnknownSignalingError();
        }
    }


    get name() {
        return "TalkingState";
    }
}


export class PendingRemoteHangupState extends FailOnTimeoutState {
    constructor(signaling, byeId) {
        super(signaling, MAX_ACCEPT_BYE_DELAY_MS);
        this._byeId = byeId;
    }

    // response
    onRpcMsg(msg) {
        if (msg.id === this._byeId || msg.method === BYE_METHOD_NAME) {
            this.transit(new DisconnectedState(this._signaling));
        }
    }

    get name() {
        return "PendingRemoteHangupState";
    }
}

export class PendingLocalHangupState extends SharedMediaSignalingState {
    constructor(signaling, byeId) {
        super(signaling);
        this._byeId = byeId;
    }
    onEnter() {
        var self = this;
        new Promise(function notifyRemoteHungup(resolve) {
            self._signaling._remoteHungupHandler();
            resolve();
        });
    }
    hangup() {
        var self = this;
        self._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0',
            result: {},
            id: self._byeId
        }));
        self.transit(new DisconnectedState(self._signaling));
    }
    onRpcMsg() {
        //Do nothing
    }
    channelDown() {
        this.transit(new DisconnectedState(this._signaling));
    }
    get name() {
        return "PendingLocalHangupState";
    }
}

export class DisconnectedState extends SharedMediaSignalingState {
    onEnter() {
        var self = this;
        new Promise(function notifyDisconnected(resolve) {
            self._signaling._disconnectedHandler();
            resolve();
        });
    }

    channelDown() {
        //Do nothing
    }

    onRpcMsg() {
        //Do nothing
    }

    get name() {
        return "DisconnectedState";
    }
}

export class FailedState extends SharedMediaSignalingState {
    constructor(signaling, exception) {
        super(signaling);
        this._exception = exception;
    }

    onEnter() {
        var self = this;
        new Promise(function notifyFailed(resolve) {
            // Todo: will we face AccessDeniedExceptionName?
            self._signaling._failedHandler(self._exception);
            resolve();
        });
    }

    bye() {
        this._byeId = uuid();
        this._signaling._signalingChannelManager.send(JSON.stringify({
            jsonrpc: '2.0', method: BYE_METHOD_NAME, params: {
                contactId: typeof this._signaling._callId === "undefined" ? null : this._signaling._callId,
                persistentConnection: this._signaling.isPPCEnabled,
                peerConnectionId: this._signaling.peerConnectionId,
                peerConnectionToken: this._signaling.peerConnectionToken,
                callContextToken: this._signaling.contactToken,
            }, id: this._byeId
        }));
    }

    hangup() {
        this.bye();
    }

    onRpcMsg() {
        // Do nothing
    }

    channelDown() {
        //Do nothing
    }

    get name() {
        return "FailedState";
    }

    get exception() {
        return this._exception;
    }
}

export default class AmznRtcSharedMediaSignaling {
    // TODO: add javaScript doc here
    constructor(callId, contactToken, logger, connectTimeoutMs, connectionId, signalingChannelManager, iceRestart = false, isPersistentConnectionEnabled, peerConnectionId, peerConnectionToken, browserId, allowExtendedPersistentConnection = false) {
        this._callId = callId;
        this._contactToken = contactToken;
        this._logger = wrapLogger(logger, callId, 'SharedMediaSIGNALING');
        this._connectTimeoutMs = connectTimeoutMs || DEFAULT_CONNECT_TIMEOUT_MS;
        this._autoAnswer = true;
        this._connectionId = connectionId;
        this._signalingChannelManager = signalingChannelManager;
        this._iceRestart = iceRestart;
        this._isPersistentConnectionEnabled = isPersistentConnectionEnabled;
        this._peerConnectionId = peerConnectionId;
        this._peerConnectionToken = peerConnectionToken;
        this._browserId = browserId;
        this._allowExtendedPersistentConnection = !!allowExtendedPersistentConnection;

        //empty event handlers
        this._connectedHandler = this._answeredHandler = this._handshakedHandler = this._reconnectedHandler = this._remoteHungupHandler = this._disconnectedHandler = this._failedHandler = function noOp() {
        };
    }

    get callId() {
        return this._callId;
    }

    get isPersistentConnectionEnabled() {
        return this._isPersistentConnectionEnabled;
    }

    get iceRestart() {
        return this._iceRestart;
    }

    set onConnected(connectedHandler) {
        this._connectedHandler = connectedHandler;
    }

    set onAnswered(answeredHandler) {
        this._answeredHandler = answeredHandler;
    }

    set onHandshaked(handshakedHandler) {
        this._handshakedHandler = handshakedHandler;
    }

    set onReconnected(reconnectedHandler) {
        this._reconnectedHandler = reconnectedHandler;
    }

    set onRemoteHungup(remoteHungupHandler) {
        this._remoteHungupHandler = remoteHungupHandler;
    }

    set onDisconnected(disconnectedHandler) {
        this._disconnectedHandler = disconnectedHandler;
    }

    set onFailed(failedHandler) {
        this._failedHandler = failedHandler;
    }

    get state() {
        return this._state;
    }

    connect() {
        this._connect();
        this.transit(new PendingConnectState(this, this._connectTimeoutMs));
    }

    _connect() {
        this._signalingChannelManager = this._connectWebSocket();
    }

    transit(nextState) {
        try {
            this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
            if (this.state && this.state.onExit) {
                this.state.onExit();
            }
        } finally {
            this._state = nextState;
            if (this._state.onEnter) {
                this._state.onEnter();
            }
        }
    }

    _connectWebSocket() {
        let wsConnection;
        // Note: onOpen will be missing as we are not creating wssConnection again
        wsConnection = this._signalingChannelManager;
        
        // For Amazon Connect Global Resiliency (ACGR) failover: when failover occurs, the underlying
        // websocket changes to another region's websocket connection where the subscription is not setup yet.
        // Re-initialize WebSocket event listeners to re-subscribe to SOFTPHONE_ROUTE_KEY.
        wsConnection._initializeWebSocketEventListeners();
        
        wsConnection.onmessage = hitch(this, this._onMessage);
        wsConnection.onerror = hitch(this, this._onError);
        wsConnection.onclose = hitch(this, this._onClose);
        return wsConnection;
    }


    _onMessage(evt) {
        this._logger.log("Received Message: ", JSON.stringify(evt));
        this.state.onRpcMsg(JSON.parse(evt.data));
    }

    _onOpen(evt) {
        this.state.onOpen(evt);
    }

    _onError(evt) {
        this.state.onError(evt);
    }

    _onClose(evt) {
        this._logger.log('WebSocket onclose code=' + evt.code + ', reason=' + evt.reason);
        this.state.onClose(evt);
    }

    invite(sdp, iceCandidates) {
        this.state.invite(sdp, iceCandidates);
    }

    inviteForIceRestart(sdp, iceCandidates) {
        this.state.inviteForIceRestart(sdp, iceCandidates);
    }

    connectContact() {
        this.state.connectContact();
    }

    accept() {
        this.state.accept();
    }

    hangup(serverInitiated = false) {
        this.state.hangup(serverInitiated);
    }

    bye() {
        this.state.bye();
    }
}
