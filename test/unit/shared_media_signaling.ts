import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import AmznRtcSharedMediaSignaling, { 
    PendingInviteState, 
    PendingAnswerState, 
    PendingAcceptState, 
    TalkingState,
    PendingRemoteHangupState,
    PendingLocalHangupState,
    DisconnectedState,
    FailedState,
    PendingConnectState
} from '../../src/shared_media_signaling';
import { INVITE_METHOD_NAME, ACCEPT_METHOD_NAME, BYE_METHOD_NAME } from '../../src/rtc_const';
import { 
    AccessDeniedException, 
    BusyException, 
    CallNotFoundException,
    BadRequestException,
    RequestTimeoutException,
    IdempotencyException,
    InternalServerException,
    UnknownSignalingError,
    Timeout,
    SignalingChannelDownError
} from '../../src/exceptions';

const expect = chai.expect;

describe('SharedMediaSignaling', () => {
    let mockLogger: any;
    let mockSignalingChannelManager: any;
    let signaling: AmznRtcSharedMediaSignaling;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() })
        };

        mockSignalingChannelManager = {
            send: sinon.spy(),
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
            _initializeWebSocketEventListeners: sinon.spy()
        };

        signaling = new AmznRtcSharedMediaSignaling(
            'test-call-id',
            'test-contact-token',
            mockLogger,
            5000,
            'test-connection-id',
            mockSignalingChannelManager,
            false,
            true,
            'test-peer-connection-id',
            'test-peer-connection-token',
            'test-browser-id',
            true
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Constructor and Properties', () => {
        it('should create an instance with correct properties', () => {
            expect(signaling.callId).to.equal('test-call-id');
            expect(signaling.isPersistentConnectionEnabled).to.be.true;
            expect(signaling.iceRestart).to.be.false;
        });

        it('should initialize with default values when optional params are missing', () => {
            const minimalSignaling = new AmznRtcSharedMediaSignaling(
                'call-id',
                'token',
                mockLogger,
                undefined,
                'connection-id',
                mockSignalingChannelManager
            );

            expect(minimalSignaling.callId).to.equal('call-id');
            expect(minimalSignaling.isPersistentConnectionEnabled).to.be.undefined;
            expect(minimalSignaling.iceRestart).to.be.false;
        });

        it('should default _allowExtendedPersistentConnection to false when not provided', () => {
            const minimalSignaling = new AmznRtcSharedMediaSignaling(
                'call-id',
                'token',
                mockLogger,
                undefined,
                'connection-id',
                mockSignalingChannelManager
            );
            expect(minimalSignaling._allowExtendedPersistentConnection).to.be.false;
        });

        it('should store _allowExtendedPersistentConnection when provided', () => {
            expect(signaling._allowExtendedPersistentConnection).to.be.true;
        });

        it('should coerce _allowExtendedPersistentConnection to boolean', () => {
            const coerced: any = new AmznRtcSharedMediaSignaling(
                'call-id',
                'token',
                mockLogger,
                undefined,
                'connection-id',
                mockSignalingChannelManager,
                false,
                false,
                null,
                null,
                'browser-id',
                undefined as any
            );
            expect(coerced._allowExtendedPersistentConnection).to.be.false;
        });
    });

    describe('Event Handler Setters', () => {
        it('should set onConnected handler', () => {
            const handler = sinon.spy();
            signaling.onConnected = handler;
            expect(signaling._connectedHandler).to.equal(handler);
        });

        it('should set onAnswered handler', () => {
            const handler = sinon.spy();
            signaling.onAnswered = handler;
            expect(signaling._answeredHandler).to.equal(handler);
        });

        it('should set onHandshaked handler', () => {
            const handler = sinon.spy();
            signaling.onHandshaked = handler;
            expect(signaling._handshakedHandler).to.equal(handler);
        });

        it('should set onReconnected handler', () => {
            const handler = sinon.spy();
            signaling.onReconnected = handler;
            expect(signaling._reconnectedHandler).to.equal(handler);
        });

        it('should set onRemoteHungup handler', () => {
            const handler = sinon.spy();
            signaling.onRemoteHungup = handler;
            expect(signaling._remoteHungupHandler).to.equal(handler);
        });

        it('should set onDisconnected handler', () => {
            const handler = sinon.spy();
            signaling.onDisconnected = handler;
            expect(signaling._disconnectedHandler).to.equal(handler);
        });

        it('should set onFailed handler', () => {
            const handler = sinon.spy();
            signaling.onFailed = handler;
            expect(signaling._failedHandler).to.equal(handler);
        });
    });

    describe('Connection and State Management', () => {
        it('should connect and setup WebSocket handlers', () => {
            signaling.connect();
            
            // PendingConnectState immediately transitions to PendingInviteState on enter
            expect(signaling.state).to.be.instanceOf(PendingInviteState);
            expect(mockSignalingChannelManager.onmessage).to.be.a('function');
            expect(mockSignalingChannelManager.onerror).to.be.a('function');
            expect(mockSignalingChannelManager.onclose).to.be.a('function');
            expect(mockSignalingChannelManager._initializeWebSocketEventListeners).to.have.been.called;
        });

        it('should log state transitions with wrapped logger format', () => {
            const newState = new PendingInviteState(signaling);
            signaling.transit(newState);
            
            expect(mockLogger.info).to.have.been.called;
            expect(signaling.state).to.equal(newState);
        });

        it('should call onExit and onEnter during transitions', () => {
            const oldState = { onExit: sinon.spy(), name: 'OldState' };
            const newState = { onEnter: sinon.spy(), name: 'NewState' };
            
            signaling._state = oldState as any;
            signaling.transit(newState as any);
            
            expect(oldState.onExit).to.have.been.called;
            expect(newState.onEnter).to.have.been.called;
        });
    });

    describe('WebSocket Event Handlers', () => {
        beforeEach(() => {
            signaling.connect();
        });

        it('should handle _onMessage events', () => {
            const mockState = { onRpcMsg: sinon.spy() };
            signaling._state = mockState as any;
            
            const messageData = { method: 'test', id: '123' };
            const event = { data: JSON.stringify(messageData) };
            
            signaling._onMessage(event);
            
            expect(mockLogger.log).to.have.been.called;
            expect(mockState.onRpcMsg).to.have.been.calledWith(messageData);
        });

        it('should handle _onOpen events', () => {
            const mockState = { onOpen: sinon.spy() };
            signaling._state = mockState as any;
            
            const event = { type: 'open' };
            signaling._onOpen(event);
            
            expect(mockState.onOpen).to.have.been.calledWith(event);
        });

        it('should handle _onError events', () => {
            const mockState = { onError: sinon.spy() };
            signaling._state = mockState as any;
            
            const event = { type: 'error' };
            signaling._onError(event);
            
            expect(mockState.onError).to.have.been.calledWith(event);
        });

        it('should handle _onClose events with logging', () => {
            const mockState = { onClose: sinon.spy() };
            signaling._state = mockState as any;
            
            const event = { code: 1000, reason: 'Normal closure' };
            signaling._onClose(event);
            
            expect(mockLogger.log).to.have.been.called;
            expect(mockState.onClose).to.have.been.calledWith(event);
        });
    });

    describe('Wrapper Methods', () => {
        let mockState: any;

        beforeEach(() => {
            mockState = {
                invite: sinon.spy(),
                inviteForIceRestart: sinon.spy(),
                accept: sinon.spy(),
                hangup: sinon.spy(),
                bye: sinon.spy(),
                connectContact: sinon.spy()
            };
            signaling._state = mockState;
        });

        it('should delegate invite to state', () => {
            const sdp = 'test-sdp';
            const iceCandidates = [{ candidate: 'candidate1' }];
            
            signaling.invite(sdp, iceCandidates);
            
            expect(mockState.invite).to.have.been.calledWith(sdp, iceCandidates);
        });

        it('should delegate inviteForIceRestart to state', () => {
            const sdp = 'test-sdp';
            const iceCandidates = [{ candidate: 'candidate1' }];
            
            signaling.inviteForIceRestart(sdp, iceCandidates);
            
            expect(mockState.inviteForIceRestart).to.have.been.calledWith(sdp, iceCandidates);
        });

        it('should delegate accept to state', () => {
            signaling.accept();
            expect(mockState.accept).to.have.been.called;
        });

        it('should delegate hangup to state', () => {
            signaling.hangup(true);
            expect(mockState.hangup).to.have.been.calledWith(true);
        });

        it('should delegate bye to state', () => {
            signaling.bye();
            expect(mockState.bye).to.have.been.called;
        });

        it('should delegate connectContact to state', () => {
            signaling.connectContact();
            expect(mockState.connectContact).to.have.been.called;
        });
    });

    describe('PendingInviteState', () => {
        let state: PendingInviteState;

        beforeEach(() => {
            state = new PendingInviteState(signaling);
            signaling._state = state;
        });

        it('should call connected handler on enter', () => {
            const connectedHandler = sinon.spy();
            signaling._connectedHandler = connectedHandler;
            
            state.onEnter();
            
            expect(connectedHandler).to.have.been.called;
        });

        it('should send regular invite with all parameters', () => {
            const sdp = 'test-sdp';
            const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0 }];
            
            state.invite(sdp, iceCandidates);
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.method).to.equal(INVITE_METHOD_NAME);
            expect(sentMessage.params.sdp).to.equal(sdp);
            expect(sentMessage.params.candidates).to.deep.equal(iceCandidates);
            expect(sentMessage.params.callContextToken).to.equal('test-contact-token');
            expect(sentMessage.params.contactId).to.equal('test-call-id');
            expect(sentMessage.params.browserId).to.equal('test-browser-id');
            expect(sentMessage.params.persistentConnection).to.be.true;
            expect(sentMessage.params.peerConnectionToken).to.equal('test-peer-connection-token');
            expect(sentMessage.params.peerConnectionId).to.equal('test-peer-connection-id');
            expect(sentMessage.params.iceRestart).to.be.false;
            expect(sentMessage.params.allowExtendedPersistentConnection).to.be.true;
        });

        it('should send ICE restart invite without callContextToken and contactId', () => {
            const sdp = 'test-sdp';
            const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0 }];
            
            state.inviteForIceRestart(sdp, iceCandidates);
            
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.params).to.not.have.property('callContextToken');
            expect(sentMessage.params).to.not.have.property('contactId');
            expect(sentMessage.params.iceRestart).to.be.true;
            expect(sentMessage.params.allowExtendedPersistentConnection).to.be.true;
        });

        it('should transit to PendingAnswerState after invite', () => {
            state.invite('sdp', []);
            expect(signaling.state).to.be.instanceOf(PendingAnswerState);
        });

        it('should transit to FailedState on channel down', () => {
            state.channelDown();
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('SignalingChannelDownError');
        });
    });

    describe('PendingAnswerState', () => {
        let state: PendingAnswerState;
        const inviteId = 'test-invite-id';

        beforeEach(() => {
            state = new PendingAnswerState(signaling, inviteId, 0);
            signaling._state = state;
        });

        it('should handle successful invite response', () => {
            const answeredHandler = sinon.spy();
            signaling._answeredHandler = answeredHandler;
            
            const response = {
                id: inviteId,
                result: {
                    sdp: 'response-sdp',
                    candidates: [{ candidate: 'response-candidate' }],
                    inactivityDuration: 600000,
                    peerConnectionId: 'new-pc-id',
                    peerConnectionToken: 'new-pc-token'
                }
            };
            
            state.onRpcMsg(response);
            
            // Promise resolves synchronously in test environment
            expect(answeredHandler).to.have.been.called;
            expect(signaling._peerConnectionId).to.equal('new-pc-id');
            expect(signaling._peerConnectionToken).to.equal('new-pc-token');
            expect(signaling.state).to.satisfy((state: any) => 
                state instanceof PendingAcceptState || state instanceof TalkingState
            );
        });

        it('should handle error responses and translate errors', () => {
            const errorResponse = {
                id: inviteId,
                error: { code: 403, message: 'Access denied' }
            };
            
            state.onRpcMsg(errorResponse);
            
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('AccessDeniedException');
        });

        it('should translate different error codes correctly', () => {
            const testCases = [
                { code: 403, expectedError: 'AccessDeniedException' },
                { code: 486, expectedError: 'BusyException' },
                { code: 404, expectedError: 'CallNotFoundException' },
                { code: 400, expectedError: 'BadRequestException' },
                { code: 408, expectedError: 'RequestTimeoutException' },
                { code: 409, expectedError: 'IdempotencyException' },
                { code: 500, expectedError: 'InternalServerException' },
                { code: 999, expectedError: 'UnknownSignalingError' }
            ];

            testCases.forEach(testCase => {
                const freshState = new PendingAnswerState(signaling, 'test-id', 0);
                signaling._state = freshState;
                
                freshState.onRpcMsg({
                    id: 'test-id',
                    error: { code: testCase.code, message: 'Test error' }
                });
                
                expect(signaling.state).to.be.instanceOf(FailedState);
                expect((signaling.state as FailedState).exception.name).to.equal(testCase.expectedError);
            });
        });

        it('should ignore messages with different IDs', () => {
            const response = {
                id: 'different-id',
                result: { sdp: 'sdp', candidates: [] }
            };
            
            state.onRpcMsg(response);
            
            expect(signaling.state).to.equal(state); // Should remain in same state
        });

        it('should transit to FailedState on hangup', () => {
            state.hangup();
            expect(signaling.state).to.be.instanceOf(FailedState);
        });

        it('should timeout and transit to FailedState', (done) => {
            // Test timeout behavior by triggering the timeout manually
            state._onTimeoutChecked();
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('Timeout');
            done();
        });
    });

    describe('PendingAcceptState', () => {
        let state: PendingAcceptState;

        beforeEach(() => {
            state = new PendingAcceptState(signaling, true, 0); // autoAnswer enabled
            signaling._state = state;
        });

        it('should auto-accept on enter when autoAnswer is true', () => {
            const acceptSpy = sinon.spy(state, 'accept');
            state.onEnter();
            expect(acceptSpy).to.have.been.called;
        });

        it('should not auto-accept when autoAnswer is false', () => {
            const nonAutoState = new PendingAcceptState(signaling, false, 0);
            const acceptSpy = sinon.spy(nonAutoState, 'accept');
            nonAutoState.onEnter();
            expect(acceptSpy).to.not.have.been.called;
        });

        it('should send accept request with correct parameters', () => {
            state.accept();
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.method).to.equal(ACCEPT_METHOD_NAME);
            expect(sentMessage.params.contactId).to.equal('test-call-id');
            expect(sentMessage.params.persistentConnection).to.be.true;
            expect(sentMessage.params.peerConnectionId).to.equal('test-peer-connection-id');
            expect(sentMessage.params.peerConnectionToken).to.equal('test-peer-connection-token');
            expect(signaling.state).to.be.instanceOf(TalkingState);
        });

        it('should transit to FailedState on channel down', () => {
            state.channelDown();
            expect(signaling.state).to.be.instanceOf(FailedState);
        });
    });

    describe('TalkingState', () => {
        let state: TalkingState;
        const methodId = 'test-method-id';

        beforeEach(() => {
            state = new TalkingState(signaling, methodId, 0, 'ACCEPT');
            signaling._state = state;
        });

        it('should call handshaked handler on enter', () => {
            const handshakedHandler = sinon.spy();
            signaling._handshakedHandler = handshakedHandler;
            
            state.onEnter();
            
            expect(handshakedHandler).to.have.been.called;
            expect((signaling as any)._isFirstTimeSetup).to.be.false;
        });

        it('should handle client-initiated hangup by sending BYE', () => {
            state.hangup(false);
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.method).to.equal(BYE_METHOD_NAME);
            expect(sentMessage.params.contactId).to.equal('test-call-id');
            expect(signaling.state).to.be.instanceOf(PendingRemoteHangupState);
        });

        it('should handle server-initiated hangup without sending BYE', () => {
            state.hangup(true);
            
            expect(mockSignalingChannelManager.send).to.not.have.been.called;
            expect(signaling.state).to.be.instanceOf(DisconnectedState);
        });

        it('should handle BYE message from server', () => {
            const byeMessage = {
                method: BYE_METHOD_NAME,
                id: 'bye-id'
            };
            
            state.onRpcMsg(byeMessage);
            
            expect(signaling.state).to.be.instanceOf(PendingLocalHangupState);
        });

        it('should handle error responses', () => {
            const errorMessage = {
                id: methodId,
                error: { code: 403, message: 'Access denied' }
            };
            
            state.onRpcMsg(errorMessage);
            
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('AccessDeniedException');
        });
    });

    describe('PendingRemoteHangupState', () => {
        let state: PendingRemoteHangupState;
        const byeId = 'test-bye-id';

        beforeEach(() => {
            state = new PendingRemoteHangupState(signaling, byeId);
            signaling._state = state;
        });

        it('should handle BYE response and transition to DisconnectedState', () => {
            const response = { id: byeId };
            
            state.onRpcMsg(response);
            
            expect(signaling.state).to.be.instanceOf(DisconnectedState);
        });

        it('should handle BYE method and transition to DisconnectedState', () => {
            const byeMessage = { method: BYE_METHOD_NAME };
            
            state.onRpcMsg(byeMessage);
            
            expect(signaling.state).to.be.instanceOf(DisconnectedState);
        });

        it('should timeout and transition to FailedState', (done) => {
            // Test timeout behavior by triggering the timeout manually
            state._onTimeoutChecked();
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('Timeout');
            done();
        });
    });

    describe('PendingLocalHangupState', () => {
        let state: PendingLocalHangupState;
        const byeId = 'test-bye-id';

        beforeEach(() => {
            state = new PendingLocalHangupState(signaling, byeId);
            signaling._state = state;
        });

        it('should call remote hangup handler on enter', () => {
            const remoteHungupHandler = sinon.spy();
            signaling._remoteHungupHandler = remoteHungupHandler;
            
            state.onEnter();
            
            expect(remoteHungupHandler).to.have.been.called;
        });

        it('should send BYE response and transition to DisconnectedState', () => {
            state.hangup();
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.result).to.deep.equal({});
            expect(sentMessage.id).to.equal(byeId);
            expect(signaling.state).to.be.instanceOf(DisconnectedState);
        });

        it('should ignore RPC messages', () => {
            expect(() => {
                state.onRpcMsg();
            }).to.not.throw();
            
            expect(signaling.state).to.equal(state); // Should remain in same state
        });

        it('should transition to DisconnectedState on channel down', () => {
            state.channelDown();
            expect(signaling.state).to.be.instanceOf(DisconnectedState);
        });
    });

    describe('DisconnectedState', () => {
        let state: DisconnectedState;

        beforeEach(() => {
            state = new DisconnectedState(signaling);
            signaling._state = state;
        });

        it('should call disconnected handler on enter', () => {
            const disconnectedHandler = sinon.spy();
            signaling._disconnectedHandler = disconnectedHandler;
            
            state.onEnter();
            
            expect(disconnectedHandler).to.have.been.called;
        });

        it('should ignore channel down events', () => {
            expect(() => {
                state.channelDown();
            }).to.not.throw();
        });

        it('should ignore RPC messages', () => {
            expect(() => {
                state.onRpcMsg();
            }).to.not.throw();
        });
    });

    describe('FailedState', () => {
        let state: FailedState;
        const exception = new Error('Test error');

        beforeEach(() => {
            state = new FailedState(signaling, exception);
            signaling._state = state;
        });

        it('should call failed handler on enter', () => {
            const failedHandler = sinon.spy();
            signaling._failedHandler = failedHandler;
            
            state.onEnter();
            
            expect(failedHandler).to.have.been.called;
        });

        it('should expose exception property', () => {
            expect(state.exception).to.equal(exception);
        });

        it('should send BYE on hangup', () => {
            state.hangup();
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.method).to.equal(BYE_METHOD_NAME);
            expect(sentMessage.params.contactId).to.equal('test-call-id');
        });

        it('should send BYE on bye call', () => {
            state.bye();
            
            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            
            expect(sentMessage.method).to.equal(BYE_METHOD_NAME);
        });

        it('should ignore RPC messages', () => {
            expect(() => {
                state.onRpcMsg();
            }).to.not.throw();
        });

        it('should ignore channel down events', () => {
            expect(() => {
                state.channelDown();
            }).to.not.throw();
        });
    });

    describe('PendingConnectState', () => {
        let state: PendingConnectState;

        beforeEach(() => {
            state = new PendingConnectState(signaling, 5000, Date.now(), 0);
            signaling._state = state;
        });

        it('should transition to PendingInviteState on enter', () => {
            state.onEnter();
            expect(signaling.state).to.be.instanceOf(PendingInviteState);
        });

        it('should transition to FailedState on channel down', () => {
            state.channelDown();
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('SignalingChannelDownError');
        });

        it('should timeout and transition to FailedState', (done) => {
            // Test timeout behavior by triggering the timeout manually
            state._onTimeoutChecked();
            expect(signaling.state).to.be.instanceOf(FailedState);
            expect((signaling.state as FailedState).exception.name).to.equal('Timeout');
            done();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle undefined call ID in invite parameters', () => {
            const signalingWithUndefinedCallId = new AmznRtcSharedMediaSignaling(
                undefined as any,
                'token',
                mockLogger,
                5000,
                'connection-id',
                mockSignalingChannelManager
            );

            const state = new PendingInviteState(signalingWithUndefinedCallId);
            state.invite('sdp', []);

            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            expect(sentMessage.params.contactId).to.equal('');
        });

        it('should handle null contact token', () => {
            const signalingWithNullToken = new AmznRtcSharedMediaSignaling(
                'call-id',
                null,
                mockLogger,
                5000,
                'connection-id',
                mockSignalingChannelManager
            );

            const state = new PendingInviteState(signalingWithNullToken);
            state.invite('sdp', []);

            expect(mockSignalingChannelManager.send).to.have.been.called;
            const sentMessage = JSON.parse(mockSignalingChannelManager.send.firstCall.args[0]);
            expect(sentMessage.params.callContextToken).to.be.null;
        });

        it('should handle media cluster path detection', () => {
            const state = new PendingAnswerState(signaling, 'test-id', 0);
            signaling._state = state;

            const response = {
                id: 'test-id',
                result: {
                    sdp: 'test sdp from media cluster path',
                    candidates: []
                }
            };

            state.onRpcMsg(response);

            expect((signaling as any)._isMediaClusterPath).to.be.true;
        });

        it('should set RTPS allowlisted flag correctly', () => {
            const state = new PendingAnswerState(signaling, 'test-id', 0);
            signaling._state = state;

            const response = {
                id: 'test-id',
                result: {
                    sdp: 'test-sdp',
                    candidates: [],
                    peerConnectionId: 'test-pc-id'
                }
            };

            state.onRpcMsg(response);

            expect((signaling as any).isRTPSAllowlisted).to.be.true;
        });
    });
});
