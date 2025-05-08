/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import RtcSignaling from '../../src/js/signaling';
import { SignalingState, FailOnTimeoutState, PendingConnectState, PendingInviteState, PendingAnswerState, PendingAcceptState, PendingAcceptAckState, TalkingState, PendingReconnectState, PendingRemoteHangupState, PendingLocalHangupState, DisconnectedState, FailedState, IdleState, PendingConnectContactState } from '../../src/js/signaling'; // eslint-disable-line no-unused-vars
import { TimeoutExceptionName, UnknownSignalingErrorName } from '../../src/js/exceptions';
import {BYE_METHOD_NAME, CONNECT_CONTACT_METHOD_NAME} from '../../src/js/rtc_const';
import chai from 'chai';
import sinon from 'sinon';

describe('signalingTest', () => {
    describe('signalingObject', () => {
        var signaling = new RtcSignaling('call Id', 'https://myserver.com/rtc', 'co{n"t=a:c,t&T"ok}en', console, 4000);
        it('can be created and initialized', () => {
            chai.expect(signaling.callId).to.equal('call Id');
        });

        it('builds correct WSS URL with escaping', () => {
            chai.expect(signaling._buildInviteUri()).to.equal('https://myserver.com/rtc?callId=call%20Id&contactCtx=co%7Bn%22t%3Da%3Ac%2Ct%26T%22ok%7Den');
        });

        it('throws exit exception after calling enter on state transition', () => {
            var initStateExit = sinon.stub().throws(1);
            signaling.transit({
                onExit: initStateExit
            });
            var nextStateEnter = sinon.stub.throws(2);
            chai.expect(() => signaling.transit({
                onEnter: nextStateEnter
            })).to.throw(1);
        });
    });

    describe('SignalingState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {SignalingState}
         */
        var signalingState;

        beforeEach(() => {
            signaling = {};
            signalingState = new SignalingState(signaling);
        });

        it('could tell it\'s not current state', () => {
            signaling.state = null;
            chai.expect(signalingState.isCurrentState).to.equal(false);
        });

        it('could tell it\'s current state', () => {
            signaling.state = signalingState;
            chai.expect(signalingState.isCurrentState).to.equal(true);
        });

        it('calls timeout handler if it\'s current state', () => {
            signaling.state = signalingState;
            signalingState.onTimeout = sinon.spy();
            signalingState._onTimeoutChecked();
            chai.assert(signalingState.onTimeout.called, 'onTimeout should have been called');
        });

        it('skips calling timeout handler if it\'s not current state', () => {
            signaling.state = null;
            signalingState.onTimeout = sinon.spy();
            signalingState._onTimeoutChecked();
            chai.assert(!signalingState.onTimeout.called, 'onTimeout should have not been called');
        });

        it('could schedule timeout', (done) => {
            signaling.state = signalingState;
            signalingState.onTimeout = done;
            signalingState.setStateTimeout(1);
            done();
        });
    });

    describe('FailOnTimeoutState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {FailOnTimeoutState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new FailOnTimeoutState(signaling, 1);
        });

        it('transit to Failed state with Timeout exception', (done) => {
            signaling.transit = (nextState) => {
                chai.assert(nextState instanceof FailedState, 'next state should be FailedState');
                chai.expect(nextState.exception.name).to.equal(TimeoutExceptionName);
                done();
            };
            signaling.state = state;
            state.onEnter();
            done();
        });
    });

    describe('PendingConnectState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingConnectState}
         */
        var state;

        beforeEach(() => {
            signaling = {
                transit:        sinon.spy(),
                _connect:       sinon.spy()
            };
            state = new PendingConnectState(signaling, 500);
        });

        it('transit to pending invite once WSS is open', () => {
            state.onOpen();
            chai.expect(signaling.transit.calledOnce).to.be.true;
            chai.expect(signaling.transit.args[0][0]).to.be.instanceof(PendingInviteState);
        });

        it('retries three times if channelDown occurs before timeout', () => {
            state.channelDown();
            state.channelDown();
            state.channelDown();

            chai.expect(signaling.transit.calledThrice).to.be.true;
            chai.expect(signaling._connect.calledTwice).to.be.true;
            chai.expect(signaling.transit.args[0][0]).to.be.instanceof(PendingConnectState);
            chai.expect(signaling.transit.args[1][0]).to.be.instanceof(PendingConnectState);
            chai.expect(signaling.transit.args[2][0]).to.be.instanceof(FailedState);
        });

        it('doesn\'t attempt to retry if the timeout has elapsed', (done) => {
            state.channelDown();

            setTimeout(function() {
                state.channelDown();

                chai.expect(signaling.transit.calledTwice).to.be.true;
                chai.expect(signaling._connect.calledOnce).to.be.true;
                chai.expect(signaling.transit.args[0][0]).to.be.instanceof(PendingConnectState);
                chai.expect(signaling.transit.args[1][0]).to.be.instanceof(FailedState);
                done();
            }, 1000);
            done();
        });
    });

    describe('PendingInviteState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingInviteState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingInviteState(signaling);
        });

        it('sends connected event to signaling object on enter', (done) => {
            signaling._connectedHandler = done;
            state.onEnter();
        });

        it('implements invite action', () => {
            signaling._logger = {
                log: sinon.spy()
            };
            signaling._wss = {
                send: sinon.spy()
            };
            signaling.transit = sinon.spy();
            state.invite('sdp', ['cand1']);
            var inviteRequest = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', inviteRequest.jsonrpc);
            chai.assert.equal('invite', inviteRequest.method);
            chai.assert.equal('sdp', inviteRequest.params.sdp);
            chai.assert.equal(1, inviteRequest.params.candidates.length);
            chai.assert.equal('cand1', inviteRequest.params.candidates[0]);
            chai.assert.isNotNull(inviteRequest.id);
            chai.assert(signaling.transit.args[0][0] instanceof PendingAnswerState);
        });
    });

    describe('PendingAnswerState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingAnswerState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingAnswerState(signaling, 9);
        });

        it('does not respond to wrong request id', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 8
            });
            chai.assert(!signaling.transit.called);
        });

        it('goes to fail state upon receiving failure response', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 9,
                error: 'Oops'
            });
            chai.assert(signaling.transit.calledOnce);
            var nextState = signaling.transit.args[0][0];
            chai.assert(nextState instanceof FailedState);
            chai.expect(nextState.exception.name).to.eq(UnknownSignalingErrorName);
        });

        it('notifies and goes to pending accept state upon receiving success response', (done) => {
            signaling._logger = {
                log: sinon.spy()
            };
            signaling._answeredHandler = (sdp, candidates) => {
                chai.assert.equal('sdp', sdp);
                chai.assert.equal(1, candidates.length);
                chai.assert.equal('cand1', candidates[0]);
                done();
            };
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 9,
                result: {
                    sdp: 'sdp',
                    candidates: ['cand1']
                }
            });
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingAcceptState);
        });
    });

    describe('PendingAcceptState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingAcceptState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingAcceptState(signaling, true);
        });

        it('should accept the call on enter', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling.transit = sinon.spy();
            state.onEnter();
            chai.assert(signaling._wss.send.calledOnce);
            var acceptReq = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', acceptReq.jsonrpc);
            chai.assert.equal('accept', acceptReq.method);
            chai.assert.isNotNull(acceptReq.params);
            chai.assert.isNotNull(acceptReq.id);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof TalkingState);
        });

        it('should transit to IdleState when PPC is enabled and contactToken is null', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling._pcm = {
                isPPCEnabled: true,
                contactToken: null,
                callId: 'example-id',
                peerConnectionId: 'example-id',
                peerConnectionToken: 'example-token',
                isPersistentConnectionEnabled: sinon.stub().returns(true),
            }
            signaling._isFirstTimeSetup = true;
            signaling.transit = sinon.spy();
            state.accept();
            chai.assert(signaling._wss.send.calledOnce);
            var acceptReq = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', acceptReq.jsonrpc);
            chai.assert.equal('accept', acceptReq.method);
            chai.assert.isNotNull(acceptReq.params);
            chai.assert.isNotNull(acceptReq.params.contactId);
            chai.assert.isNotNull(acceptReq.params.persistentConnection);
            chai.assert.isNotNull(acceptReq.params.peerConnectionId);
            chai.assert.isNotNull(acceptReq.params.peerConnectionToken);
            chai.assert.isNotNull(acceptReq.id);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling._wss.send.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof IdleState);
        });
    });

    describe('PendingConnectContactState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingAcceptState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingConnectContactState(signaling);
        });

        it('should send connectContact when on enter and move to talking state', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling._pcm = {
                isPPCEnabled: true,
                contactToken: 'example-token',
                callId: 'example-id',
                peerConnectionId: 'example-id',
                peerConnectionToken: 'example-token',
            }
            signaling.transit = sinon.spy();
            state.onEnter();
            var connectContactReq = JSON.parse(signaling._wss.send.args[0][0]);

            chai.assert(signaling._wss.send.calledOnce);
            chai.assert.equal('2.0', connectContactReq.jsonrpc);
            chai.assert.equal(CONNECT_CONTACT_METHOD_NAME, connectContactReq.method);
            chai.assert.isNotNull(connectContactReq.params);
            chai.assert.isNotNull(connectContactReq.params.contactId);
            chai.assert.isNotNull(connectContactReq.params.contactToken);
            chai.assert.isNotNull(connectContactReq.params.persistentConnection);
            chai.assert.isNotNull(connectContactReq.params.peerConnectionId);
            chai.assert.isNotNull(connectContactReq.params.peerConnectionToken);
            chai.assert.isNotNull(connectContactReq.id);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling._wss.send.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof TalkingState);
        });
    });


    describe('PendingAcceptAckState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingAcceptAckState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingAcceptAckState(signaling, 9);
        });

        it('ignores irrelevant message', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 8
            });
            chai.assert(!signaling.transit.called);
        });

        it('goes to fail state upon receiving failure response', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 9,
                error: 'Oops'
            });
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof FailedState);
        });

        it('goes to talking state upon receiving success response', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                id: 9,
                result: {
                    clientToken: 'token'
                }
            });
            chai.assert.equal('token', signaling._clientToken);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof TalkingState);
        });
    });

    describe('TalkingState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {TalkingState}
         */
        var state;

        beforeEach(() => {
            signaling = {
                _pcm: {
                    isPPCEnabled: false,
                    isPersistentConnectionEnabled: sinon.stub().returns(false),
                }
            };
            state = new TalkingState(signaling);
        });

        it('notify handshake completion on enter', (done) => {
            signaling._handshakedHandler = done;
            state.onEnter();
        });

        it('implements hangup method', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling.transit = sinon.spy();
            state.hangup();
            chai.assert(signaling._wss.send.calledOnce);
            var hangupReq = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', hangupReq.jsonrpc);
            chai.assert.equal('bye', hangupReq.method);
            chai.assert.isNotNull(hangupReq.params);
            chai.assert.isNotNull(hangupReq.id);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingRemoteHangupState);
        });

        it('responds to server hangup', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                method: 'bye',
                params: {},
                id: 10
            });
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingLocalHangupState);
        });

        it('responds to token renewal', () => {
            state.onRpcMsg({
                jsonrpc: '2.0',
                method: 'renewClientToken',
                params: {
                    clientToken: 'newToken'
                },
                id: 10
            });
            chai.assert.equal('newToken', signaling._clientToken);
        });

        it('reconnects when connection is lost', () => {
            signaling._reconnect = sinon.spy();
            signaling.transit = sinon.spy();
            state.channelDown();
            chai.assert(signaling._reconnect.calledOnce);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingReconnectState);
        });

        it('moves to FailedState when receives an error response for accept/connectContact request', () => {
            const methodId = 'example-id'
            state = new TalkingState(signaling, methodId);
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                error: {
                    code: '400',
                    message: 'example-error-message'
                },
                id: methodId
            });
            chai.assert(signaling.transit.args[0][0] instanceof FailedState);
        });

    });

    describe('IdleState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {TalkingState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            signaling._pcm = {
                isPPCEnabled: true,
                contactToken: 'example-token',
                callId: 'example-id',
                peerConnectionId: 'example-id',
                peerConnectionToken: 'example-token',
                destroy: sinon.spy(),
            }
            signaling._logger = {
                log: sinon.spy()
            };
            state = new IdleState(signaling);
        });

        it('notify handshake completion on enter', (done) => {
            signaling._handshakedHandler = done;
            state.onEnter();
        });

        it('implements hangup method', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling.transit = sinon.spy();
            state.hangup();
            chai.assert(signaling._wss.send.calledOnce);
            var hangupReq = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', hangupReq.jsonrpc);
            chai.assert.equal(BYE_METHOD_NAME, hangupReq.method);
            chai.assert.isNotNull(hangupReq.params);
            chai.assert.isNotNull(hangupReq.params.contactId);
            chai.assert.isNotNull(hangupReq.params.contactToken);
            chai.assert.isNotNull(hangupReq.params.persistentConnection);
            chai.assert.isNotNull(hangupReq.params.peerConnectionId);
            chai.assert.isNotNull(hangupReq.params.peerConnectionToken);
            chai.assert.isNotNull(hangupReq.id);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingRemoteHangupState);
        });

        it('responds to server hangup', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                method: 'bye',
                params: {},
                id: 10
            });
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingLocalHangupState);
        });

        it('responds to token renewal', () => {
            state.onRpcMsg({
                jsonrpc: '2.0',
                method: 'renewClientToken',
                params: {
                    clientToken: 'newToken'
                },
                id: 10
            });
            chai.assert.equal('newToken', signaling._clientToken);
        });

        it('reconnects when connection is lost', () => {
            signaling._reconnect = sinon.spy();
            signaling.transit = sinon.spy();
            state.channelDown();
            chai.assert(signaling._reconnect.calledOnce);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof PendingReconnectState);
        });

        it('moves to FailedState when receives an error response for accept/connectContact request', () => {
            const methodId = 'example-id'
            state = new IdleState(signaling, methodId);
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                error: {
                    code: '400',
                    message: 'example-error-message'
                },
                id: methodId
            });
            chai.assert(signaling.transit.args[0][0] instanceof FailedState);
        });

        it('should tear down the existing peer connection when receive a PC bye from the server', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                method: 'PCBye',
                peerConnectionId: 'example-id',
                id: 10
            });
            chai.assert(signaling._pcm.destroy.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof DisconnectedState);
        });

    });

    describe('PendingReconnectState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingReconnectState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingReconnectState(signaling, 1);
        });

        it('goes back to talking state when it gets connected', () => {
            signaling.transit = sinon.spy();
            state.onOpen();
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof TalkingState);
        });
    });

    describe('PendingRemoteHangupState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingRemoteHangupState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingRemoteHangupState(signaling, 8);
        });

        it('goes to disconnected state upon receiving hang up ack', () => {
            signaling.transit = sinon.spy();
            state.onRpcMsg({
                jsonrpc: '2.0',
                id: 8,
                result: {}
            });
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof DisconnectedState);
        });
    });

    describe('PendingLocalHangupState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {PendingLocalHangupState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new PendingLocalHangupState(signaling, 8);
        });

        it('notifies remote hangup on enter', (done) => {
            signaling._remoteHungupHandler = done;
            state.onEnter();
        });

        it('acks remote hangup when hangup is called', () => {
            signaling._wss = {
                send: sinon.spy()
            };
            signaling.transit = sinon.spy();
            state.hangup();
            chai.assert(signaling._wss.send.calledOnce);
            var hangupResp = JSON.parse(signaling._wss.send.args[0][0]);
            chai.assert.equal('2.0', hangupResp.jsonrpc);
            chai.assert.equal(8, hangupResp.id);
            chai.assert.isNotNull(hangupResp.result);
            chai.assert(signaling.transit.calledOnce);
            chai.assert(signaling.transit.args[0][0] instanceof DisconnectedState);
        });
    });


    describe('DisconnectedState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {DisconnectedState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new DisconnectedState(signaling);
        });

        it('notifies disconnected on enter', (done) => {
            signaling._wss = {
                close: sinon.spy()
            };
            signaling._disconnectedHandler = done;
            state.onEnter();
            chai.assert(signaling._wss.close.calledOnce);
        });
    });

    describe('FailedState', () => {
        /**
         * @type {RtcSignaling}
         */
        var signaling;
        /**
         * @type {FailedState}
         */
        var state;

        beforeEach(() => {
            signaling = {};
            state = new FailedState(signaling);
        });

        it('notifies failure on enter', (done) => {
            signaling._wss = {
                close: sinon.spy()
            };
            signaling._failedHandler = done;
            state.onEnter();
            chai.assert(signaling._wss.close.calledOnce);
        });
    });
});
