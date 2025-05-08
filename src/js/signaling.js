/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { getRedactedSdp, hitch, wrapLogger} from './utils';
import {
    MAX_INVITE_DELAY_MS,
    MAX_ACCEPT_BYE_DELAY_MS,
    DEFAULT_CONNECT_TIMEOUT_MS,
    INVITE_METHOD_NAME,
    ACCEPT_METHOD_NAME,
    BYE_METHOD_NAME,
    CONNECT_CONTACT_METHOD_NAME,
    DISCONNECT_CONTACT_METHOD_NAME,
    PC_BYE_METHOD_NAME
} from './rtc_const';
import {
    UnsupportedOperation,
    Timeout,
    BusyException,
    CallNotFoundException,
    UnknownSignalingError,
    InternalServerException,
    BadRequestException,
    RequestTimeoutException,
    IdempotencyException,
    AccessDeniedException,
    AccessDeniedExceptionName,
    SignalingChannelDownError
} from './exceptions';
import uuid from 'uuid/v4';
import VirtualWssConnectionManager from "./virtual_wss_connection_manager";

const CONNECT_MAX_RETRIES = 3;
// TODO: Need to discuss with team the retry strategy for invite/accept/connectContact errors
const INVITE_MAX_RETRIES = 0;
const ACCEPT_MAX_RETRIES = 0;
const CONNECT_CONTACT_MAX_RETRIES = 0;

/**
 * Abstract signaling state class.
 */
export class SignalingState {
    /**
     * @param {AmznRtcSignaling} signaling Signaling object.
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
    onEnter() {}
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
    onExit() {}
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
        return "SignalingState";
    }
    get logger() {
        return this._signaling._logger;
    }
}

export class FailOnTimeoutState extends SignalingState {
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
    onOpen() {
        if (this._signaling._pcm && this._signaling._pcm.contactToken && this._signaling._pcm.isPersistentConnectionEnabled() && !this._signaling._isFirstTimeSetup) {
            this.transit(new PendingConnectContactState(this._signaling));
        } else {
            this.transit(new PendingInviteState(this._signaling));
        }
    }

    channelDown() {
        var now = new Date().getTime();
        var untilTimeoutMs = (this._initialStartTime + this._timeoutMs) - now;
        if (untilTimeoutMs > 0 && ++this._retries < CONNECT_MAX_RETRIES) {
            this._signaling._connect();
            this.transit(new PendingConnectState(this._signaling, untilTimeoutMs, this._initialStartTime, this._retries));
        } else {
            this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
        }
    }
    get name() {
        return "PendingConnectState";
    }
}

export class PendingInviteState extends SignalingState {

    constructor(signaling, retiresIn) {
        super(signaling);
        this._retries = retiresIn;
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

        var inviteParams;

        if (self._signaling._pcm) {
            inviteParams = {
                sdp: sdp,
                candidates: iceCandidates,
                callContextToken: self._signaling._contactToken, // could be null
                contactId: typeof self._signaling.callId === "undefined" ? "" : self._signaling.callId, // could be null
                browserId: self._signaling._pcm.browserId, // identical id for browser
                persistentConnection: self._signaling._pcm.isPPCEnabled, // flag which indicates if persistent connection is enabled in agent configuration
                peerConnectionId: self._signaling._pcm.peerConnectionId, // generate by peerconnection factory
                iceRestart: self._signaling._pcm._iceRestart, // will be true, if ice connection failed
                peerConnectionToken: self._signaling._pcm.peerConnectionToken
            };
        } else {
            inviteParams = {
                sdp: sdp,
                candidates: iceCandidates,
                callContextToken : self._signaling._contactToken
            };
        }

        self.logger.log('Sending SDP', getRedactedSdp(sdp));

        self._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: INVITE_METHOD_NAME,
            params: inviteParams,
            id: inviteId,
        }));
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
                    if (self._signaling._pcm) {
                        self._signaling._pcm.peerConnectionToken = msg.result.peerConnectionToken;
                        self._signaling._pcm.peerConnectionId = msg.result.peerConnectionId;
                        const isRTPSAllowlisted = !!msg.result.peerConnectionId;// if peerConnectionId is defined, isRTPSAllowlisted will be set to true, otherwise, it will remain false
                        // when isRTPSAllowlisted flip from false to true, we need to close standby/early media connection
                        if (isRTPSAllowlisted !== self._signaling._pcm.isRTPSAllowlisted && isRTPSAllowlisted) {
                            self._signaling._pcm.closeEarlyMediaConnection();
                        }
                        self._signaling._pcm.isRTPSAllowlisted = isRTPSAllowlisted;
                        self._signaling._answeredHandler(
                            msg.result.sdp,
                            msg.result.candidates,
                            msg.result.inactivityDuration,
                            msg.result.peerConnectionId,
                            msg.result.peerConnectionToken
                        );
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

export class PendingAcceptState extends SignalingState {

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
        // if contactToken exists, signaling move to talking state. Otherwise, move to Idle state
        if (this._signaling._pcm && this._signaling._pcm.isPersistentConnectionEnabled() && this._signaling._pcm.contactToken === null && this._signaling._isFirstTimeSetup) {
            this.transit(new IdleState(this._signaling, this._acceptId, this._retries, ACCEPT_METHOD_NAME));
        } else {
            this.transit(new TalkingState(this._signaling, this._acceptId, this._retries, ACCEPT_METHOD_NAME));
        }
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
        if (this._signaling._pcm) {
            acceptParams = {
                contactId: typeof this._signaling._pcm.callId === "undefined" ? null : this._signaling._pcm.callId,
                persistentConnection: this._signaling._pcm.isPPCEnabled,
                peerConnectionId: this._signaling._pcm.peerConnectionId,
                peerConnectionToken: this._signaling._pcm.peerConnectionToken
            };
        }

        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: ACCEPT_METHOD_NAME,
            params: acceptParams,
            id: this._acceptId
        }));
    }
}

/**
 * PendingConnectContactState sends connectContact request to backend service
 * when the peer connection has already established instead of sending a new invite request.
 *
 */
export class PendingConnectContactState extends SignalingState {

    constructor(signaling, retriesIn) {
        super(signaling);
        this._retries = retriesIn;
    }

    onEnter() {
        super.onEnter();
        var self = this;
        self.connectContact();
    }

    connectContact() {
        this._connectContactId = uuid();
        var connectContactParams = {
            contactId: this._signaling._pcm.callId,
            persistentConnection: this._signaling._pcm.isPPCEnabled,
            peerConnectionId: this._signaling._pcm.peerConnectionId,
            peerConnectionToken: this._signaling._pcm.peerConnectionToken,
            callContextToken: this._signaling._pcm.contactToken,
        }
        this._signaling._wss._connectionId = this._signaling._pcm.connectionId;
        this._signaling._connectionId = this._signaling._pcm.connectionId;
        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: CONNECT_CONTACT_METHOD_NAME,
            params: connectContactParams,
            id: this._connectContactId
        }));
        this.transit(new TalkingState(this._signaling, this._connectContactId, this._retries, CONNECT_CONTACT_METHOD_NAME));
    }

    get name() {
        return "PendingConnectContactState";
    }
}

// This State has never been initialized. (Can be deleted)
export class PendingAcceptAckState extends FailOnTimeoutState {
    constructor(signaling, acceptId) {
        super(signaling, MAX_ACCEPT_BYE_DELAY_MS);
        this._acceptId = acceptId;
    }
    onRpcMsg(msg) {
        if (msg.id === this._acceptId) {
            if (msg.error) {
                this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
            } else {
                this._signaling._clientToken = msg.result.clientToken;
                this.transit(new TalkingState(this._signaling));
            }
        }
    }
    get name() {
        return "PendingAcceptAckState";
    }
}

/**
 * After signaling handshake completes, if persistent connection is enabled, signaling channel moves to Idle state
 *
 */
export class IdleState extends SignalingState {

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
        self._signaling._pcm.startInactivityTimer();
    }

    connectContact() {
        this.transit(new PendingConnectContactState(this._signaling));
    }

    hangup() {
        this.bye();
    }

    bye() {
        this._byeId = uuid();
        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: BYE_METHOD_NAME,
            params: {
                contactId: typeof this._signaling._pcm.callId === "undefined" ? null : this._signaling._pcm.callId,
                persistentConnection: this._signaling._pcm.isPPCEnabled,
                peerConnectionId: this._signaling._pcm.peerConnectionId,
                peerConnectionToken: this._signaling._pcm.peerConnectionToken,
                callContextToken: this._signaling._pcm.contactToken,
            },
            id: this._byeId
        }));

        this.transit(new PendingRemoteHangupState(this._signaling, this._byeId));
    }

    onRpcMsg(msg) {
        if (msg.method === PC_BYE_METHOD_NAME) {
            this.logger.log("Received PC bye from server, tear down the peer connection");
            this.tearDownPeerConnection(msg.peerConnectionId);
        } else if (msg.method === BYE_METHOD_NAME) {
            this.transit(new PendingLocalHangupState(this._signaling, msg.id));
        } else if (msg.method === 'renewClientToken') {
            this._signaling._clientToken = msg.params.clientToken;
        } else if (this._signaling._pcm && msg.error && msg.id === this._methodId) {
            if ( this._retryMethod === ACCEPT_METHOD_NAME && ++this._retries < ACCEPT_MAX_RETRIES) {
                this.transit(new PendingAcceptState(this._signaling, this._retries));
            } else if (this._signaling._pcm._rtcSession) { // destroy signaling channel and peer connection when receives DisconnectContact error
                this._signaling._pcm.destroy();
            } else {
                this.transit(new FailedState(this._signaling, this.translateResponseError(msg)));
            }
        }
    }

    tearDownPeerConnection(peerConnectionId) {
        if (peerConnectionId === this._signaling._pcm.peerConnectionId) {
            this._signaling._pcm.destroy(peerConnectionId);
            this.transit(new DisconnectedState(this._signaling));
        } else {
            this.logger.log("peerConnectionId in the PCBye request does NOT match the peerConnectionId of the existing peer connection, failed to tear down peer connection");
        }
    }

    translateResponseError(msg) {
        if (msg.error && msg.error.code == 403) {
            return new AccessDeniedException(msg.error.message);
        } else if (msg.error && msg.error.code == 404) {
            return new CallNotFoundException(msg.error.message); // ResourceNotFoundException
        } else if (msg.error && msg.error.code == 400) {
            return new BadRequestException(msg.error.message); // BadRequestException
        } else if (msg.error && msg.error.code == 408) {
            return new RequestTimeoutException(msg.error.message); // RequestTimeoutException
        }else if (msg.error && msg.error.code == 500) {
            return new InternalServerException(msg.error.message); // InternalServerException
        } else {
            return new UnknownSignalingError();
        }
    }

    channelDown() {
        this._signaling._reconnect();
        this._signaling.transit(new PendingReconnectState(this._signaling));
    }

    get name() {
        return "IdleState";
    }

}

export class TalkingState extends SignalingState {

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
        if (!self._signaling._pcm || !self._signaling._pcm.isPersistentConnectionEnabled() || self._signaling._isFirstTimeSetup) {
            new Promise(function notifyHandshaked(resolve) {
                self._signaling._handshakedHandler();
                resolve();
            });
        }
        self._signaling._isFirstTimeSetup = false;
    }

    hangup() {
        if (this._signaling._pcm && this._signaling._pcm.isPersistentConnectionEnabled()) {
            this.disconnectContact();
        } else {
            this.bye();
        }
    }

    bye() {
        this._byeId = uuid();
        var byeParams = {};
        if (this._signaling._pcm) {
            byeParams = {
                contactId: typeof this._signaling._pcm.callId === "undefined" ? null : this._signaling._pcm.callId,
                persistentConnection: this._signaling._pcm.isPPCEnabled,
                peerConnectionId: this._signaling._pcm.peerConnectionId,
                peerConnectionToken: this._signaling._pcm.peerConnectionToken,
                callContextToken: this._signaling._pcm.contactToken,
            }
        } else {
            byeParams = {callContextToken: this._signaling._contactToken}
        }

        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: BYE_METHOD_NAME,
            params: byeParams,
            id: this._byeId
        }));

        this.transit(new PendingRemoteHangupState(this._signaling, this._byeId));
    }

    disconnectContact() {
        this._disconnectContactId = uuid();
        var self = this;
        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: DISCONNECT_CONTACT_METHOD_NAME,
            params: {
                contactId: self._signaling._pcm.callId,
                peerConnectionId: self._signaling._pcm.peerConnectionId,
                peerConnectionToken: self._signaling._pcm.peerConnectionToken,
            },
            id: this._disconnectContactId
        }));
        this.transit(new IdleState(this._signaling, this._disconnectContactId));
    }

    onRpcMsg(msg) {
        if (msg.method === BYE_METHOD_NAME) {
            this.transit(new PendingLocalHangupState(this._signaling, msg.id));
        } else if (msg.method === 'renewClientToken') {
            this._signaling._clientToken = msg.params.clientToken;
        } else if (this._signaling._pcm && msg.error && msg.id === this._methodId) {
            if ( this._retryMethod === CONNECT_CONTACT_METHOD_NAME && ++this._retries < CONNECT_CONTACT_MAX_RETRIES) {
                this.transit(new PendingConnectContactState(this._signaling, this._retries));
            } else if ( this._retryMethod === ACCEPT_METHOD_NAME && ++this._retries < ACCEPT_MAX_RETRIES) {
                this.transit(new PendingAcceptState(this._signaling,this._retries));
            } else {
                this.transit(new FailedState(this._signaling, this.translateResponseError(msg)));
            }
        }
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
        }else if (msg.error.code == 500) {
            return new InternalServerException(msg.error.message); // InternalServerException
        } else {
            return new UnknownSignalingError();
        }
    }

    channelDown() {
        this._signaling._reconnect();
        this._signaling.transit(new PendingReconnectState(this._signaling));
    }
    get name() {
        return "TalkingState";
    }
}

export class PendingReconnectState extends FailOnTimeoutState {
    constructor(signaling) {
        super(signaling, DEFAULT_CONNECT_TIMEOUT_MS);
    }
    onOpen() {
        this.transit(new TalkingState(this._signaling));
    }
    channelDown() {
        this.transit(new FailedState(this._signaling, new SignalingChannelDownError()));
    }
    get name() {
        return "PendingReconnectState";
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

export class PendingLocalHangupState extends SignalingState {
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
        self._signaling._wss.send(JSON.stringify({
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

export class DisconnectedState extends SignalingState {
    onEnter() {
        var self = this;
        new Promise(function notifyDisconnected(resolve) {
            self._signaling._disconnectedHandler();
            resolve();
        });
        this._signaling._wss.close();
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

export class FailedState extends SignalingState {
    constructor(signaling, exception) {
        super(signaling);
        this._exception = exception;
    }
    onEnter() {
        var self = this;
        new Promise(function notifyFailed(resolve) {
            if (self._signaling._pcm && self._exception.name === AccessDeniedExceptionName) {
                self._signaling._pcm.isRTPSAllowlisted = false;
                self._signaling._pcm.closeEarlyMediaConnection();
            }
            self._signaling._failedHandler(self._exception);
            resolve();
        });
        if (!self._signaling._pcm) {
            self._signaling._wss.close();
        }
    }
    bye() {
        this._byeId = uuid();
        this._signaling._wss.send(JSON.stringify({
            jsonrpc: '2.0',
            method: BYE_METHOD_NAME,
            params: {
                contactId: typeof this._signaling._pcm.callId === "undefined" ? null : this._signaling._pcm.callId,
                persistentConnection: this._signaling._pcm.isPPCEnabled,
                peerConnectionId: this._signaling._pcm.peerConnectionId,
                peerConnectionToken: this._signaling._pcm.peerConnectionToken,
                callContextToken: this._signaling._pcm.contactToken,
            },
            id: this._byeId
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

export default class AmznRtcSignaling {
    // TODO: add javaScript doc here
    constructor(callId, signalingUri, contactToken, logger, connectTimeoutMs, connectionId, wssManager, iceRestart = false, persistentConnectionManager = null) {
        this._callId = callId;
        this._connectTimeoutMs = connectTimeoutMs || DEFAULT_CONNECT_TIMEOUT_MS;
        this._autoAnswer = true;
        this._signalingUri = signalingUri;
        this._contactToken = contactToken;
        this._logger = wrapLogger(logger, callId, 'SIGNALING');
        this._connectionId = connectionId;
        this._wssManager = wssManager;
        this._iceRestart = iceRestart;
        this._pcm = persistentConnectionManager;
        this._isFirstTimeSetup = true;

        //empty event handlers
        this._connectedHandler =
            this._answeredHandler =
                this._handshakedHandler =
                    this._reconnectedHandler =
                        this._remoteHungupHandler =
                            this._disconnectedHandler =
                                this._failedHandler = function noOp() {};
    }
    get callId() {
        return this._callId;
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
        this._wss = this._connectWebSocket(this._buildInviteUri());
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
    _connectWebSocket(uri) {
        let wsConnection;
        if (this._wssManager) {
            wsConnection = new VirtualWssConnectionManager(this._logger, this._connectionId, this._wssManager);
        } else {
            wsConnection = new WebSocket(uri);
        }
        wsConnection.onopen = hitch(this, this._onOpen);
        wsConnection.onmessage = hitch(this, this._onMessage);
        wsConnection.onerror = hitch(this, this._onError);
        wsConnection.onclose = hitch(this, this._onClose);
        return wsConnection;
    }
    _buildInviteUri() {
        if (this._contactToken) {
            return this._buildUriBase() + '&contactCtx=' + encodeURIComponent(this._contactToken);
        } else {
            return this._buildUriBase();
        }
    }
    _buildReconnectUri() {
        return this._buildUriBase() + '&clientToken=' + encodeURIComponent(this._clientToken);
    }
    _buildUriBase() {
        var separator = '?';
        if (!this._pcm && this._signalingUri.indexOf(separator) > -1) {
            separator = '&';
        }
        return this._signalingUri + separator + 'callId=' + encodeURIComponent(this._callId);
    }
    _onMessage(evt) {
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
    _reconnect() {
        this._wss = this._connectWebSocket(this._buildReconnectUri());
    }
    invite(sdp, iceCandidates) {
        this.state.invite(sdp, iceCandidates);
    }

    connectContact() {
        this.state.connectContact();
    }

    accept() {
        this.state.accept();
    }
    hangup() {
        this.state.hangup();
    }

    bye() {
        this.state.bye();
    }
}