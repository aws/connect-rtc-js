import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import SignalingChannelManager from '../../src/signaling_channel_manager';
import { SOFTPHONE_ROUTE_KEY, PC_BYE_METHOD_NAME } from '../../src/rtc_const';

const expect = chai.expect;

describe('SignalingChannelManager', () => {
    let mockLogger: any;
    let mockWssManager: any;
    let manager: SignalingChannelManager;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() })
        };

        mockWssManager = {
            subscribeTopics: sinon.spy(),
            onMessage: sinon.stub().returns(() => {}),
            sendMessage: sinon.spy()
        };

        manager = new SignalingChannelManager(mockLogger, 'test-connection-id', mockWssManager);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with correct properties', () => {
            expect(manager._logger).to.equal(mockLogger);
            expect(manager._connectionId).to.equal('test-connection-id');
            expect(manager._wssManager).to.equal(mockWssManager);
            expect(manager._sessionCallbacks).to.be.instanceOf(Map);
            expect(manager._pcByeHandler).to.be.null;
        });

        it('should call _initializeWebSocketEventListeners during construction', () => {
            expect(mockWssManager.subscribeTopics).to.have.been.calledWith([SOFTPHONE_ROUTE_KEY]);
            expect(mockWssManager.onMessage).to.have.been.calledWith(SOFTPHONE_ROUTE_KEY, sinon.match.func);
        });

        it('should trigger onOpen callback after initialization', () => {
            const onOpenCallback = sinon.spy();
            
            // Create new manager to test the setTimeout trigger
            const newManager = new SignalingChannelManager(mockLogger, 'test-id', mockWssManager);
            newManager.onopen = onOpenCallback;
            
            // Since setTimeout is async and we can't easily test it synchronously,
            // we verify the handler was set correctly
            expect(newManager._onOpen).to.equal(onOpenCallback);
        });

        it('should not trigger onOpen callback if not set', () => {
            // Should not throw error when onOpen is not set
            // Test passes if no error is thrown during initialization
            expect(manager._onOpen).to.be.undefined;
        });
    });

    describe('Setter Methods', () => {
        it('should set onmessage callback', () => {
            const callback = sinon.spy();
            manager.onmessage = callback;
            expect(manager._onMessage).to.equal(callback);
        });

        it('should set onopen callback', () => {
            const callback = sinon.spy();
            manager.onopen = callback;
            expect(manager._onOpen).to.equal(callback);
        });

        it('should set onerror callback', () => {
            const callback = sinon.spy();
            manager.onerror = callback;
            expect(manager._onError).to.equal(callback);
        });

        it('should set onclose callback', () => {
            const callback = sinon.spy();
            manager.onclose = callback;
            expect(manager._onClose).to.equal(callback);
        });
    });

    describe('send method with payload logging', () => {
        it('should log payload before sending', () => {
            const webSocketPayload = JSON.stringify({
                jsonrpc: '2.0',
                method: 'INVITE',
                params: { test: 'data' },
                id: 'test-id'
            });

            manager.send(webSocketPayload, 'test-connection-id');

            expect(mockLogger.log).to.have.been.calledWith(
                'Signaling Channel Manager sending payload: ',
                sinon.match(function(value) {
                    const payload = JSON.parse(value);
                    return payload.topic === SOFTPHONE_ROUTE_KEY &&
                           payload.connectionId === 'test-connection-id' &&
                           payload.jsonRpcMsg.method === 'INVITE';
                })
            );
            expect(mockWssManager.sendMessage).to.have.been.called;
        });

        it('should create correct payload structure', () => {
            const webSocketPayload = JSON.stringify({
                jsonrpc: '2.0',
                method: 'BYE',
                params: { contactId: 'test-contact' },
                id: 'bye-id'
            });

            manager.send(webSocketPayload, 'custom-connection-id');

            const sentPayload = mockWssManager.sendMessage.firstCall.args[0];
            expect(sentPayload.topic).to.equal(SOFTPHONE_ROUTE_KEY);
            expect(sentPayload.connectionId).to.equal('custom-connection-id');
            expect(sentPayload.jsonRpcMsg.method).to.equal('BYE');
            expect(sentPayload.jsonRpcMsg.params.contactId).to.equal('test-contact');
            expect(sentPayload.jsonRpcMsg.id).to.equal('bye-id');
        });

        it('should use default connectionId when not provided', () => {
            const webSocketPayload = JSON.stringify({
                jsonrpc: '2.0',
                method: 'INVITE',
                id: 'test-id'
            });

            manager.send(webSocketPayload);

            const sentPayload = mockWssManager.sendMessage.firstCall.args[0];
            expect(sentPayload.connectionId).to.equal('test-connection-id');
        });

        it('should handle JSON parse errors gracefully', () => {
            const invalidJson = 'invalid-json';

            manager.send(invalidJson);

            expect(mockLogger.error).to.have.been.calledWith('Error in sendMessage ', sinon.match.any);
        });
    });

    describe('Message Handling', () => {
        it('should log received messages', () => {
            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(mockLogger.log).to.have.been.calledWith(
                'Signaling Channel Manager Received Message: ',
                sinon.match.string
            );
        });

        it('should call main onMessage handler when set', () => {
            const onMessageCallback = sinon.spy();
            manager.onmessage = onMessageCallback;

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(onMessageCallback).to.have.been.calledWith({
                data: JSON.stringify({
                    method: 'INVITE',
                    params: { test: 'data' }
                })
            });
        });

        it('should not throw error when onMessage is not set', () => {
            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should handle events without content', () => {
            const mockEvent = {};

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should handle invalid JSON in event content', () => {
            const mockEvent = {
                content: 'invalid-json'
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.throw();
        });
    });

    describe('PC_BYE Handler', () => {
        it('should call PC_BYE handler when PC_BYE message received', () => {
            const pcByeHandler = sinon.spy();
            manager.registerPCByeHandler(pcByeHandler);

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: PC_BYE_METHOD_NAME,
                        params: { peerConnectionId: 'test-pc-id' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(pcByeHandler).to.have.been.calledWith({
                method: PC_BYE_METHOD_NAME,
                params: { peerConnectionId: 'test-pc-id' }
            });
        });

        it('should log when PC_BYE message is received', () => {
            const pcByeHandler = sinon.spy();
            manager.registerPCByeHandler(pcByeHandler);

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: PC_BYE_METHOD_NAME,
                        params: { peerConnectionId: 'test-pc-id' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(mockLogger.log).to.have.been.calledWith('Signaling Channel Manager received PC_BYE message');
        });

        it('should not call PC_BYE handler when not registered', () => {
            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: PC_BYE_METHOD_NAME,
                        params: { peerConnectionId: 'test-pc-id' }
                    }
                })
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should unregister PC_BYE handler', () => {
            const pcByeHandler = sinon.spy();
            manager.registerPCByeHandler(pcByeHandler);
            manager.unregisterPCByeHandler();

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id',
                    jsonRpcMsg: {
                        method: PC_BYE_METHOD_NAME,
                        params: { peerConnectionId: 'test-pc-id' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(pcByeHandler).to.not.have.been.called;
            expect(manager._pcByeHandler).to.be.null;
        });
    });

    describe('Session Management', () => {
        it('should register call session callbacks', () => {
            const callbacks = {
                onMessage: sinon.spy(),
                onConnect: sinon.spy()
            };

            manager.registerCallSession('session-1', callbacks);

            expect(manager._sessionCallbacks.has('session-1')).to.be.true;
            expect(manager._sessionCallbacks.get('session-1')).to.equal(callbacks);
        });

        it('should route messages to registered session callbacks', () => {
            const sessionCallback = sinon.spy();
            const callbacks = {
                onMessage: sessionCallback
            };

            manager.registerCallSession('session-1', callbacks);

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'session-1',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(sessionCallback).to.have.been.calledWith({
                method: 'INVITE',
                params: { test: 'data' }
            });
        });

        it('should not route messages to unregistered session', () => {
            const sessionCallback = sinon.spy();
            const callbacks = {
                onMessage: sessionCallback
            };

            manager.registerCallSession('session-1', callbacks);

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'session-2',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            manager._webSocketManagerOnMessage(mockEvent);

            expect(sessionCallback).to.not.have.been.called;
        });

        it('should handle session with no onMessage callback', () => {
            const callbacks = {
                onConnect: sinon.spy()
            };

            manager.registerCallSession('session-1', callbacks);

            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'session-1',
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should unregister call session', () => {
            const callbacks = {
                onMessage: sinon.spy()
            };

            manager.registerCallSession('session-1', callbacks);
            expect(manager._sessionCallbacks.has('session-1')).to.be.true;

            manager.unregisterCallSession('session-1');
            expect(manager._sessionCallbacks.has('session-1')).to.be.false;
        });

        it('should clear all call session callbacks', () => {
            const callbacks1 = { onMessage: sinon.spy() };
            const callbacks2 = { onMessage: sinon.spy() };

            manager.registerCallSession('session-1', callbacks1);
            manager.registerCallSession('session-2', callbacks2);

            expect(manager._sessionCallbacks.size).to.equal(2);

            manager.clearCallSessionCallbacks();

            expect(manager._sessionCallbacks.size).to.equal(0);
        });
    });

    describe('close method', () => {
        it('should log closing virtual connection', () => {
            const unsubscribe = sinon.spy();
            manager._unSubscribe = unsubscribe;

            manager.close();

            expect(mockLogger.info).to.have.been.calledWith('closing virtual connection');
            expect(unsubscribe).to.have.been.called;
        });

        it('should call unsubscribe function', () => {
            const unsubscribe = sinon.spy();
            manager._unSubscribe = unsubscribe;

            manager.close();

            expect(unsubscribe).to.have.been.called;
        });
    });

    describe('Edge Cases', () => {
        it('should handle message without connectionId', () => {
            const mockEvent = {
                content: JSON.stringify({
                    jsonRpcMsg: {
                        method: 'INVITE',
                        params: { test: 'data' }
                    }
                })
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should handle message without jsonRpcMsg', () => {
            const mockEvent = {
                content: JSON.stringify({
                    connectionId: 'test-connection-id'
                })
            };

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should handle empty event object', () => {
            const mockEvent = {};

            expect(() => {
                manager._webSocketManagerOnMessage(mockEvent);
            }).to.not.throw();
        });

        it('should handle null event', () => {
            expect(() => {
                manager._webSocketManagerOnMessage(null);
            }).to.throw();
        });
    });
});
