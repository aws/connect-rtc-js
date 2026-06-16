import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import CallSession from '../../src/call_session';
import { CALL_SESSION_STATE, CONNECT_CONTACT_METHOD_NAME } from '../../src/rtc_const';

const expect = chai.expect;

describe('CallSession', () => {
    let mockLogger: any;
    let mockSignalingChannelManager: any;
    let config: any;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() })
        };

        mockSignalingChannelManager = {
            send: sinon.spy(),
            registerCallSession: sinon.spy(),
            unregisterCallSession: sinon.spy()
        };

        config = {
            logger: mockLogger,
            callId: 'test-call-id',
            contactId: 'test-contact-id',
            contactToken: 'test-contact-token',
            connectionId: 'test-connection-id',
            signalingChannelManager: mockSignalingChannelManager
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Constructor', () => {
        it('should create CallSession with valid config', () => {
            const callSession = new CallSession(config);

            expect(callSession._callId).to.equal('test-call-id');
            expect(callSession._contactId).to.equal('test-call-id');
            expect(callSession._contactToken).to.equal('test-contact-token');
            expect(callSession._connectionId).to.equal('test-connection-id');
            expect(callSession._agentMediaLegId).to.equal('test-connection-id');
            expect(callSession._signalingChannelManager).to.equal(mockSignalingChannelManager);
        });

        it('should create CallSession with empty config', () => {
            const emptyConfig = {
                logger: mockLogger
            };
            const callSession = new CallSession(emptyConfig);

            expect(callSession._sessionReport).to.exist;
            expect(callSession._state).to.exist;
        });

        it('should initialize session report with start time', () => {
            const callSession = new CallSession(config);

            expect(callSession._sessionReport.sessionStartTime).to.be.instanceOf(Date);
            expect(callSession._connectTimeStamp).to.be.a('number');
        });

        it('should enter InitialState on creation', () => {
            const callSession = new CallSession(config);

            expect(callSession._state.name).to.equal(CALL_SESSION_STATE.INITIAL_STATE);
        });
    });

    describe('Getters', () => {
        it('should return session report', () => {
            const callSession = new CallSession(config);

            expect(callSession.sessionReport).to.equal(callSession._sessionReport);
        });

        it('should return call ID', () => {
            const callSession = new CallSession(config);

            expect(callSession.callId).to.equal('test-call-id');
        });

        it('should return media stream', () => {
            const callSession = new CallSession(config);
            const mockStream = {};
            callSession._localStream = mockStream as any;

            expect(callSession.mediaStream).to.equal(mockStream);
        });

    });

    describe('Audio Control Methods', () => {
        describe('pauseLocalAudio', () => {
            it('should disable local audio track', () => {
                const callSession = new CallSession(config);
                const mockTrack = { enabled: true };
                callSession._localStream = {
                    getAudioTracks: () => [mockTrack]
                } as any;

                callSession.pauseLocalAudio();

                expect(mockTrack.enabled).to.be.false;
            });

            it('should do nothing when no local stream', () => {
                const callSession = new CallSession(config);
                callSession._localStream = null;

                expect(() => callSession.pauseLocalAudio()).to.not.throw();
            });

            it('should do nothing when no audio tracks', () => {
                const callSession = new CallSession(config);
                callSession._localStream = {
                    getAudioTracks: () => []
                } as any;

                expect(() => callSession.pauseLocalAudio()).to.not.throw();
            });
        });

        describe('resumeLocalAudio', () => {
            it('should enable local audio track', () => {
                const callSession = new CallSession(config);
                const mockTrack = { enabled: false };
                callSession._localStream = {
                    getAudioTracks: () => [mockTrack]
                } as any;

                callSession.resumeLocalAudio();

                expect(mockTrack.enabled).to.be.true;
            });

            it('should do nothing when no local stream', () => {
                const callSession = new CallSession(config);
                callSession._localStream = null;

                expect(() => callSession.resumeLocalAudio()).to.not.throw();
            });
        });

        describe('pauseRemoteAudio', () => {
            it('should disable remote audio track', () => {
                const callSession = new CallSession(config);
                const mockTrack = { enabled: true };
                (callSession as any)._remoteAudioStream = {
                    getTracks: () => [mockTrack]
                };

                callSession.pauseRemoteAudio();

                expect(mockTrack.enabled).to.be.false;
            });

            it('should do nothing when no remote stream', () => {
                const callSession = new CallSession(config);
                (callSession as any)._remoteAudioStream = null;

                expect(() => callSession.pauseRemoteAudio()).to.not.throw();
            });
        });

        describe('resumeRemoteAudio', () => {
            it('should enable remote audio track', () => {
                const callSession = new CallSession(config);
                const mockTrack = { enabled: false };
                (callSession as any)._remoteAudioStream = {
                    getTracks: () => [mockTrack]
                };

                callSession.resumeRemoteAudio();

                expect(mockTrack.enabled).to.be.true;
            });

            it('should do nothing when no remote stream', () => {
                const callSession = new CallSession(config);
                (callSession as any)._remoteAudioStream = null;

                expect(() => callSession.resumeRemoteAudio()).to.not.throw();
            });
        });
    });


    describe('Callback Setters', () => {
        it('should set onGumSuccess callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onGumSuccess = callback;

            expect(callSession._onGumSuccess).to.equal(callback);
        });

        it('should set onGumError callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onGumError = callback;

            expect(callSession._onGumError).to.equal(callback);
        });

        it('should set onSessionFailed callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSessionFailed = callback;

            expect(callSession._onSessionFailed).to.equal(callback);
        });

        it('should set onLocalStreamAdded callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onLocalStreamAdded = callback;

            expect(callSession._onLocalStreamAdded).to.equal(callback);
        });

        it('should set onSessionInitialized callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSessionInitialized = callback;

            expect(callSession._onSessionInitialized).to.equal(callback);
        });

        it('should set onSignalingConnected callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSignalingConnected = callback;

            expect(callSession._onSignalingConnected).to.equal(callback);
        });

        it('should set onIceCollectionComplete callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onIceCollectionComplete = callback;

            expect(callSession._onIceCollectionComplete).to.equal(callback);
        });

        it('should set onSignalingStarted callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSignalingStarted = callback;

            expect(callSession._onSignalingStarted).to.equal(callback);
        });

        it('should set onSessionConnected callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSessionConnected = callback;

            expect(callSession._onSessionConnected).to.equal(callback);
        });

        it('should set onRemoteStreamAdded callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onRemoteStreamAdded = callback;

            expect(callSession._onRemoteStreamAdded).to.equal(callback);
        });

        it('should set onSessionCompleted callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSessionCompleted = callback;

            expect(callSession._onSessionCompleted).to.equal(callback);
        });

        it('should set onSessionDestroyed callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.onSessionDestroyed = callback;

            expect(callSession._onSessionDestroyed).to.equal(callback);
        });

        it('should set replaceStreamCallback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.replaceStreamCallback = callback;

            expect(callSession._replaceStreamCallback).to.equal(callback);
        });
    });

    describe('Property Setters', () => {
        it('should set enableAudio', () => {
            const callSession = new CallSession(config);
            
            callSession.enableAudio = true;
            
            expect(callSession._enableAudio).to.be.true;
        });

        it('should set echoCancellation and notify attribute change', () => {
            const callSession = new CallSession(config);
            const notifySpy = sinon.spy(callSession as any, '_notifyAttributeChange');
            
            callSession.echoCancellation = true;
            
            expect(callSession._echoCancellation).to.be.true;
            expect(notifySpy).to.have.been.calledWith('echoCancellation', true);
        });


        it('should set mediaStream and notify attribute change', () => {
            const callSession = new CallSession(config);
            const mockStream = {};
            const notifySpy = sinon.spy(callSession as any, '_notifyAttributeChange');
            
            callSession.mediaStream = mockStream as any;
            
            expect(callSession._localStream).to.equal(mockStream);
            expect(callSession._isUserProvidedStream).to.be.true;
            expect(notifySpy).to.have.been.calledWith('mediaStream', mockStream);
        });

        it('should set remoteAudioElement and notify attribute change', () => {
            const callSession = new CallSession(config);
            const mockElement = {};
            const notifySpy = sinon.spy(callSession as any, '_notifyAttributeChange');
            
            callSession.remoteAudioElement = mockElement as any;
            
            expect(callSession._remoteAudioElement).to.equal(mockElement);
            expect(notifySpy).to.have.been.calledWith('remoteAudioElement', mockElement);
        });

        it('should set timeout properties', () => {
            const callSession = new CallSession(config);
            
            callSession.signalingConnectTimeout = 15000;
            callSession.iceTimeoutMillis = 10000;
            callSession.gumTimeoutMillis = 5000;
            
            expect(callSession._signalingConnectTimeout).to.equal(15000);
            expect(callSession._iceTimeoutMillis).to.equal(10000);
            expect(callSession._gumTimeoutMillis).to.equal(5000);
        });

        it('should set codec properties', () => {
            const callSession = new CallSession(config);
            
            callSession.forceAudioCodec = 'opus';
            
            expect(callSession._forceAudioCodec).to.equal('opus');
        });

        it('should set enableOpusDtx', () => {
            const callSession = new CallSession(config);
            
            callSession.enableOpusDtx = true;
            
            expect(callSession._enableOpusDtx).to.be.true;
        });
    });

    describe('State Machine', () => {
        describe('transit', () => {
            it('should transition from one state to another', () => {
                const callSession = new CallSession(config);
                const initialState = callSession._state;
                const nextState = {
                    name: 'TestState',
                    onEnter: sinon.spy(),
                    onExit: sinon.spy()
                };
                
                const onExitSpy = sinon.spy(initialState, 'onExit');

                callSession.transit(nextState as any);

                expect(onExitSpy).to.have.been.called;
                expect(callSession._state).to.equal(nextState);
                expect(nextState.onEnter).to.have.been.called;
            });

            it('should handle onEnter exceptions', () => {
                const callSession = new CallSession(config);
                const nextState = {
                    name: 'TestState',
                    onEnter: sinon.stub().throws(new Error('Test error')),
                    onExit: sinon.spy()
                };

                expect(() => callSession.transit(nextState as any)).to.throw('Test error');
                expect(callSession._state).to.equal(nextState);
            });

            it('should handle states with no onExit method', () => {
                const callSession = new CallSession(config);
                callSession._state.onExit = null;
                const nextState = {
                    name: 'TestState',
                    onEnter: sinon.spy(),
                    onExit: null
                };

                expect(() => callSession.transit(nextState as any)).to.not.throw();
            });
        });
    });

    describe('Public Methods', () => {
        describe('handleMessage', () => {
            it('should delegate to state handleMessage method', () => {
                const callSession = new CallSession(config);
                const handleMessageSpy = sinon.spy(callSession._state, 'handleMessage');
                const message = { method: 'test' };

                callSession.handleMessage(message);

                expect(handleMessageSpy).to.have.been.calledWith(message);
            });
        });

        describe('onSharedMediaSessionConnected', () => {
            it('should delegate to state method', () => {
                const callSession = new CallSession(config);
                const stateSpy = sinon.spy(callSession._state, 'onSharedMediaSessionConnected');

                callSession.onSharedMediaSessionConnected();

                expect(stateSpy).to.have.been.called;
            });
        });

        describe('onSharedMediaSessionError', () => {
            it('should delegate to state method', () => {
                const callSession = new CallSession(config);
                const stateSpy = sinon.spy(callSession._state, 'onSharedMediaSessionError');
                const error = new Error('test');

                callSession.onSharedMediaSessionError(error);

                expect(stateSpy).to.have.been.calledWith(error);
            });
        });

        describe('connect', () => {
        it('should log deprecation warning', () => {
            const callSession = new CallSession(config);

            callSession.connect();

            // The logger wraps messages, so check that info was called
            expect(mockLogger.info).to.have.been.called;
        });
        });

        describe('connectContact', () => {
            it('should delegate to state connectContact method', () => {
                const callSession = new CallSession(config);
                const connectSpy = sinon.spy(callSession._state, 'connectContact');

                callSession.connectContact();

                expect(connectSpy).to.have.been.called;
            });
        });

        describe('hangup', () => {
            it('should disconnect contact and return resolved promise', async () => {
                const callSession = new CallSession(config);
                const disconnectSpy = sinon.spy(callSession._state, 'disconnectContact');

                const result = await callSession.hangup();

                expect(disconnectSpy).to.have.been.called;
                expect(result).to.be.undefined;
            });
        });


        describe('shouldSkipConnectContact', () => {
            it('should set and return _shouldSkipConnectContact flag', () => {
                const callSession = new CallSession(config);

                const result = callSession.shouldSkipConnectContact(true);

                expect(result).to.be.true;
                expect(callSession._shouldSkipConnectContact).to.be.true;
            });
        });
    });

    describe('onSharedMediaSessionEvent', () => {
        let callSession: CallSession;

        beforeEach(() => {
            callSession = new CallSession(config);
        });

        it('should handle gumError event', () => {
            const errorData = new Error('GUM failed');
            const callback = sinon.spy();
            callSession._onGumError = callback;

            callSession.onSharedMediaSessionEvent('gumError', errorData);

            expect(callback).to.have.been.calledWith(callSession, errorData);
        });

        it('should handle gumSuccess event', () => {
            const callback = sinon.spy();
            callSession._onGumSuccess = callback;

            callSession.onSharedMediaSessionEvent('gumSuccess', null);

            expect(callback).to.have.been.calledWith(callSession);
        });

        it('should handle localPeerConnectionAvailable event', () => {
            const mockPC = {};

            callSession.onSharedMediaSessionEvent('localPeerConnectionAvailable', mockPC);

            expect(callSession._pc).to.equal(mockPC);
        });

        it('should handle localStreamAdded event', () => {
            const mockStream = {};
            const callback = sinon.spy();
            callSession._onLocalStreamAdded = callback;

            callSession.onSharedMediaSessionEvent('localStreamAdded', mockStream);

            expect(callback).to.have.been.calledWith(callSession, mockStream);
        });

        it('should handle replaceStreamCallback event', () => {
            const mockStream = {};
            const expectedResult = {};
            const callback = sinon.stub().returns(expectedResult);
            callSession._replaceStreamCallback = callback;

            const result = callSession.onSharedMediaSessionEvent('replaceStreamCallback', mockStream);

            expect(callback).to.have.been.calledWith(callSession, mockStream);
            expect(result).to.equal(expectedResult);
        });

        it('should handle sessionInitialized event', () => {
            const callback = sinon.spy();
            callSession._onSessionInitialized = callback;
            const eventData = {};

            callSession.onSharedMediaSessionEvent('sessionInitialized', eventData);

            expect(callback).to.have.been.calledWith(eventData);
        });

        it('should handle sessionFailed event', () => {
            const error = new Error('test');
            const mockState = {
                onSharedMediaSessionError: sinon.spy()
            };
            callSession._state = mockState as any;

            callSession.onSharedMediaSessionEvent('sessionFailed', error);

            expect(mockState.onSharedMediaSessionError).to.have.been.calledWith(error);
        });

        it('should handle signalingConnected event', () => {
            expect(() => callSession.onSharedMediaSessionEvent('signalingConnected', null)).to.not.throw();
        });

        it('should handle iceCollectionComplete event', () => {
            expect(() => callSession.onSharedMediaSessionEvent('iceCollectionComplete', null)).to.not.throw();
        });

        it('should handle signalingStarted event', () => {
            expect(() => callSession.onSharedMediaSessionEvent('signalingStarted', null)).to.not.throw();
        });

        it('should handle sessionConnected event with PC data', () => {
            const mockPC = {};
            const mockState = {
                onSharedMediaSessionConnected: sinon.spy()
            };
            callSession._state = mockState as any;

            callSession.onSharedMediaSessionEvent('sessionConnected', mockPC);

            expect(callSession._pc).to.equal(mockPC);
            expect(mockState.onSharedMediaSessionConnected).to.have.been.called;
        });

        it('should handle sessionConnected event without PC data', () => {
            const mockState = {
                onSharedMediaSessionConnected: sinon.spy()
            };
            callSession._state = mockState as any;

            expect(() => callSession.onSharedMediaSessionEvent('sessionConnected', null)).to.not.throw();
            expect(mockState.onSharedMediaSessionConnected).to.have.been.called;
        });

        it('should handle peerConnectionId event', () => {
            const pcId = 'test-pc-id';

            callSession.onSharedMediaSessionEvent('peerConnectionId', pcId);

            expect(callSession._peerConnectionId).to.equal(pcId);
        });

        it('should handle peerConnectionToken event', () => {
            const pcToken = 'test-pc-token';

            callSession.onSharedMediaSessionEvent('peerConnectionToken', pcToken);

            expect(callSession._peerConnectionToken).to.equal(pcToken);
        });

        it('should handle remoteStreamAdded event', () => {
            const mockStream = {};
            const callback = sinon.spy();
            callSession._onRemoteStreamAdded = callback;

            callSession.onSharedMediaSessionEvent('remoteStreamAdded', mockStream);

            expect(callback).to.have.been.calledWith(mockStream);
        });

        it('should handle sessionCompleted event when not in final states', () => {
            const transitSpy = sinon.spy(callSession, 'transit');

            expect(() => callSession.onSharedMediaSessionEvent('sessionCompleted', null)).to.not.throw();
            expect(transitSpy).to.have.been.called;
        });

        it('should not transition on sessionCompleted when already in DisconnectedState', () => {
            // Get to TalkingState first, then disconnect
            callSession._state.onSharedMediaSessionConnected();
            callSession._state.disconnectContact();
            const disconnectedState = callSession._state;

            // Now trigger sessionCompleted and verify no transition
            expect(() => callSession.onSharedMediaSessionEvent('sessionCompleted', null)).to.not.throw();
            expect(callSession._state).to.equal(disconnectedState);
            expect(callSession._state.name).to.equal(CALL_SESSION_STATE.DISCONNECTED_STATE);
        });

        it('should not transition on sessionCompleted when already in FailedState', () => {
            // Transition to FailedState first
            const error = new Error('test error');
            callSession._state.onSharedMediaSessionError(error);
            const failedState = callSession._state;

            // Now trigger sessionCompleted and verify no transition
            expect(() => callSession.onSharedMediaSessionEvent('sessionCompleted', null)).to.not.throw();
            expect(callSession._state).to.equal(failedState);
            expect(callSession._state.name).to.equal(CALL_SESSION_STATE.FAILED_STATE);
        });

        it('should handle sessionDestroyed event', () => {
            expect(() => callSession.onSharedMediaSessionEvent('sessionDestroyed', null)).to.not.throw();

            expect(callSession._sessionReport.sessionEndTime).to.be.instanceOf(Date);
        });

        it('should handle isPersistentConnectionAllowlistedAndEnabled event', () => {
            callSession.onSharedMediaSessionEvent('isPersistentConnectionAllowlistedAndEnabled', true);

            expect(callSession._isPersistentConnectionAllowlistedAndEnabled).to.be.true;
        });

        it('should handle sessionSetupLatencyMetricReady event', () => {
            const mockReport = {
                gumTimeMillis: 100,
                initializationTimeMillis: 200,
                iceCollectionTimeMillis: 300
            };

            callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', mockReport);

            // Verify specific properties were copied from shared media session
            expect(callSession._sessionReport.gumTimeMillis).to.equal(100);
            expect(callSession._sessionReport.initializationTimeMillis).to.equal(200);
            expect(callSession._sessionReport.iceCollectionTimeMillis).to.equal(300);
            
            // Verify call session specific properties are preserved
            expect(callSession._sessionReport).to.have.property('firstRTPTimeMillis');
            expect(callSession._sessionReport.sessionStartTime).to.be.instanceOf(Date);
        });

        it('should handle unknown event', () => {
            expect(() => callSession.onSharedMediaSessionEvent('unknownEvent', null)).to.not.throw();
        });
    });

    describe('_notifyAttributeChange', () => {
        it('should call attribute change callback', () => {
            const callSession = new CallSession(config) as any;
            const callback = sinon.spy();
            callSession._attributeChangeCallback = callback;

            callSession._notifyAttributeChange('testAttribute', 'testValue');

            expect(callback).to.have.been.calledWith('test-connection-id', 'testAttribute', 'testValue');
        });

        it('should handle callback exception', () => {
            const callSession = new CallSession(config) as any;
            const callback = sinon.stub().throws(new Error('Callback error'));
            callSession._attributeChangeCallback = callback;

            expect(() => callSession._notifyAttributeChange('testAttribute', 'testValue')).to.not.throw();
            
            // Verify error logger was called
            expect(mockLogger.error).to.have.been.called;
        });
    });

    describe('registerAttributeChangeCallback', () => {
        it('should register attribute change callback', () => {
            const callSession = new CallSession(config);
            const callback = sinon.spy();

            callSession.registerAttributeChangeCallback(callback);

            expect(callSession._attributeChangeCallback).to.equal(callback);
        });
    });

    describe('State Classes', () => {
        describe('InitialState', () => {
            it('should transition to ConnectContactState on shared media session connected', () => {
                const callSession = new CallSession(config);
                const transitSpy = sinon.spy(callSession, 'transit');

                callSession._state.onSharedMediaSessionConnected();

                expect(transitSpy).to.have.been.called;
                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.TALKING_STATE);
            });

            it('should transition to FailedState on shared media session error', () => {
                const callSession = new CallSession(config);
                const error = new Error('test error');
                const transitSpy = sinon.spy(callSession, 'transit');

                callSession._state.onSharedMediaSessionError(error);

                expect(transitSpy).to.have.been.called;
                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.FAILED_STATE);
            });
        });

        describe('ConnectContactState', () => {
            it('should send connectContact message and transition to TalkingState', () => {
                const callSession = new CallSession(config);
                // Transition to ConnectContactState
                callSession._state.onSharedMediaSessionConnected();
                
                expect(mockSignalingChannelManager.send).to.have.been.called;
                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.TALKING_STATE);
            });

            it('should skip connectContact when _shouldSkipConnectContact is true', () => {
                const callSession = new CallSession(config);
                callSession._shouldSkipConnectContact = true;
                
                // Transition to ConnectContactState
                callSession._state.onSharedMediaSessionConnected();
                
                expect(mockSignalingChannelManager.send).to.not.have.been.called;
                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.TALKING_STATE);
            });
        });

        describe('TalkingState', () => {
            beforeEach(() => {
                const callSession = new CallSession(config);
                // Get to TalkingState
                callSession._state.onSharedMediaSessionConnected();
            });

            it('should call onSessionConnected callback on enter', () => {
                const callSession = new CallSession(config);
                const callback = sinon.spy();
                callSession._onSessionConnected = callback;
                
                // Transition to TalkingState
                callSession._state.onSharedMediaSessionConnected();

                expect(callback).to.have.been.calledWith(callSession);
            });

            it('should set session end time and call onSessionCompleted on exit', () => {
                const callSession = new CallSession(config);
                const callback = sinon.spy();
                callSession._onSessionCompleted = callback;
                
                // Get to TalkingState then exit
                callSession._state.onSharedMediaSessionConnected();
                callSession._state.onExit();

                expect(callSession._sessionReport.talkingTimeMillis).to.be.a('number');
                expect(callSession._sessionReport.sessionEndTime).to.be.instanceOf(Date);
                expect(callback).to.have.been.calledWith(callSession);
            });

            it('should send disconnectContact for persistent connection and transition on disconnect', () => {
                const callSession = new CallSession(config);
                callSession._isPersistentConnectionAllowlistedAndEnabled = true;
                callSession._peerConnectionId = 'test-pc-id';
                callSession._peerConnectionToken = 'test-pc-token';
                
                // Get to TalkingState
                callSession._state.onSharedMediaSessionConnected();
                const transitSpy = sinon.spy(callSession, 'transit');
                
                callSession._state.disconnectContact();

                expect(mockSignalingChannelManager.send).to.have.been.called;
                expect(transitSpy).to.have.been.called;
                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.DISCONNECTED_STATE);
            });

            it('should skip sending disconnectContact when not persistent and transition', () => {
                const callSession = new CallSession(config);
                callSession._isPersistentConnectionAllowlistedAndEnabled = false;
                
                // Get to TalkingState
                callSession._state.onSharedMediaSessionConnected();
                
                callSession._state.disconnectContact();

                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.DISCONNECTED_STATE);
            });

            it('should transition to FailedState on shared media session error', () => {
                const callSession = new CallSession(config);
                const error = new Error('test error');
                
                // Get to TalkingState
                callSession._state.onSharedMediaSessionConnected();
                
                callSession._state.onSharedMediaSessionError(error);

                expect(callSession._state.name).to.equal(CALL_SESSION_STATE.FAILED_STATE);
            });

            describe('RTP Tracking Logic', () => {
                let callSession: CallSession;

                beforeEach(() => {
                    callSession = new CallSession(config);
                    callSession._connectTimeStamp = 1000; // Set a known connect timestamp
                });

                it('should initialize RTP tracking logic without errors', () => {
                    // Verify RTP tracking is initialized when entering TalkingState
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                    
                    // Verify we're in talking state
                    expect(callSession._state.name).to.equal(CALL_SESSION_STATE.TALKING_STATE);
                });

                it('should handle peer connection setup for RTP tracking', () => {
                    // Setup mock peer connection
                    const mockReceiver = {
                        getSynchronizationSources: sinon.stub().returns([])
                    };
                    const mockPC = {
                        getReceivers: sinon.stub().returns([mockReceiver])
                    };
                    callSession._pc = mockPC as any;

                    // Get to TalkingState
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                    
                    // Verify peer connection is accessible
                    expect(callSession._pc).to.exist;
                });

                it('should have firstRTPTimeMillis property available in session report', () => {
                    // Verify the session report has the new property
                    expect(callSession._sessionReport).to.have.property('firstRTPTimeMillis');
                    expect(callSession._sessionReport.firstRTPTimeMillis).to.be.null;
                });

                it('should preserve firstRTPTimeMillis when session report is replaced', () => {
                    // Set firstRTPTimeMillis in the current session report
                    callSession._sessionReport.firstRTPTimeMillis = 150;
                    
                    // Create a new session report (simulating what shared media session sends)
                    const newSessionReport = {
                        gumTimeMillis: 50,
                        initializationTimeMillis: 200,
                        // Note: no firstRTPTimeMillis property
                    };
                    
                    // Trigger sessionSetupLatencyMetricReady event
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', newSessionReport);
                    
                    // Verify that firstRTPTimeMillis was preserved
                    expect(callSession._sessionReport.firstRTPTimeMillis).to.equal(150);
                    expect(callSession._sessionReport.gumTimeMillis).to.equal(50);
                    expect(callSession._sessionReport.initializationTimeMillis).to.equal(200);
                });

                it('should not overwrite null firstRTPTimeMillis when session report is replaced', () => {
                    // Keep firstRTPTimeMillis as null
                    expect(callSession._sessionReport.firstRTPTimeMillis).to.be.null;
                    
                    // Create a new session report
                    const newSessionReport = {
                        gumTimeMillis: 75,
                    };
                    
                    // Trigger sessionSetupLatencyMetricReady event
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', newSessionReport);
                    
                    // Verify that firstRTPTimeMillis remains accessible (not overwritten with undefined)
                    expect(callSession._sessionReport).to.have.property('firstRTPTimeMillis');
                    expect(callSession._sessionReport.gumTimeMillis).to.equal(75);
                });
            });

            describe('Persistent Connection Flag Tests', () => {
                it('should set isExistingPersistentPeerConnection to true when connectContact is sent', () => {
                    const callSession = new CallSession(config);
                    
                    // Verify flag is initially undefined/false
                    expect(callSession._sessionReport.isExistingPersistentPeerConnection).to.not.be.true;
                    
                    // Transition to ConnectContactState by calling onSharedMediaSessionConnected
                    callSession._state.onSharedMediaSessionConnected();
                    
                    // Verify flag is now set to true (set in ConnectContactState.onEntry)
                    expect(callSession._sessionReport.isExistingPersistentPeerConnection).to.be.true;
                });

                it('should set isPCMv2Path to true on CallSession initialization', () => {
                    const callSession = new CallSession(config);
                    
                    // Verify flag is set during initialization
                    expect(callSession._sessionReport.isPCMv2Path).to.be.true;
                });
            });

            describe('State Change Event Handling (Citrix Compatibility)', () => {
                it('should handle iceConnectionStateChange event with disconnected state', () => {
                    const callSession = new CallSession(config);
                    callSession._sessionReport.iceConnectionsLost = 0;

                    callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'disconnected');

                    expect(callSession._sessionReport.iceConnectionsLost).to.equal(1);
                    expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/ICE connection lost/));
                });

                it('should handle iceConnectionStateChange event with failed state', () => {
                    const callSession = new CallSession(config);
                    callSession._sessionReport.iceConnectionsFailed = null;

                    callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'failed');

                    expect(callSession._sessionReport.iceConnectionsFailed).to.be.true;
                    expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/ICE connection failed/));
                });

                it('should handle iceConnectionStateChange event with connected state', () => {
                    const callSession = new CallSession(config);

                    expect(() => callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'connected')).to.not.throw();
                    expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/CallSession ICE Connection State: connected/));
                });

                it('should handle peerConnectionStateChange event with failed state', () => {
                    const callSession = new CallSession(config);
                    callSession._sessionReport.peerConnectionFailed = null;

                    callSession.onSharedMediaSessionEvent('peerConnectionStateChange', 'failed');

                    expect(callSession._sessionReport.peerConnectionFailed).to.be.true;
                    expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Peer connection failed/));
                });

                it('should handle peerConnectionStateChange event with connected state', () => {
                    const callSession = new CallSession(config);

                    expect(() => callSession.onSharedMediaSessionEvent('peerConnectionStateChange', 'connected')).to.not.throw();
                    expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/CallSession Peer Connection State: connected/));
                });

                it('should increment iceConnectionsLost multiple times', () => {
                    const callSession = new CallSession(config);
                    callSession._sessionReport.iceConnectionsLost = 0;

                    callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'disconnected');
                    callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'disconnected');
                    callSession.onSharedMediaSessionEvent('iceConnectionStateChange', 'disconnected');

                    expect(callSession._sessionReport.iceConnectionsLost).to.equal(3);
                });
            });

            describe('ICE Restart Metrics Tests', () => {
                it('should handle successful ICE restart event', () => {
                    const callSession = new CallSession(config);
                    
                    const iceRestartEvent = {
                        success: true,
                        timeMillis: 1500,
                        inviteRetries: 2
                    };
                    
                    callSession.onSharedMediaSessionEvent('iceRestartComplete', iceRestartEvent);
                    
                    expect(callSession._sessionReport.iceRestartAttempts).to.equal(1);
                    expect(callSession._sessionReport.iceRestartSuccesses).to.equal(1);
                    expect(callSession._sessionReport.iceRestartInviteRetries).to.equal(2);
                    expect(callSession._sessionReport.iceRestartTimeMillis).to.equal(1500);
                    expect(callSession._sessionReport.iceRestartFailed).to.be.false;
                });

                it('should handle failed ICE restart event with timing', () => {
                    const callSession = new CallSession(config);
                    
                    const iceRestartEvent = {
                        success: false,
                        timeMillis: 2500,
                        inviteRetries: 3
                    };
                    
                    callSession.onSharedMediaSessionEvent('iceRestartComplete', iceRestartEvent);
                    
                    expect(callSession._sessionReport.iceRestartAttempts).to.equal(1);
                    expect(callSession._sessionReport.iceRestartSuccesses).to.equal(0);
                    expect(callSession._sessionReport.iceRestartInviteRetries).to.equal(3);
                    expect(callSession._sessionReport.iceRestartTimeMillis).to.equal(2500);
                    expect(callSession._sessionReport.iceRestartFailed).to.be.true;
                });

                it('should accumulate multiple ICE restart events', () => {
                    const callSession = new CallSession(config);
                    
                    // First ICE restart - success
                    callSession.onSharedMediaSessionEvent('iceRestartComplete', {
                        success: true,
                        timeMillis: 1000,
                        inviteRetries: 0
                    });
                    
                    expect(callSession._sessionReport.iceRestartAttempts).to.equal(1);
                    expect(callSession._sessionReport.iceRestartSuccesses).to.equal(1);
                    
                    // Second ICE restart - failure
                    callSession.onSharedMediaSessionEvent('iceRestartComplete', {
                        success: false,
                        timeMillis: 3000,
                        inviteRetries: 3
                    });
                    
                    expect(callSession._sessionReport.iceRestartAttempts).to.equal(2);
                    expect(callSession._sessionReport.iceRestartSuccesses).to.equal(1);
                    expect(callSession._sessionReport.iceRestartTimeMillis).to.equal(3000); // Last event
                    expect(callSession._sessionReport.iceRestartFailed).to.be.true; // Last event
                });

                it('should initialize ICE restart metrics to 0 or null', () => {
                    const callSession = new CallSession(config);
                    
                    expect(callSession._sessionReport.iceRestartAttempts).to.equal(0);
                    expect(callSession._sessionReport.iceRestartSuccesses).to.equal(0);
                    expect(callSession._sessionReport.iceRestartInviteRetries).to.equal(0);
                    expect(callSession._sessionReport.iceRestartTimeMillis).to.be.null;
                    expect(callSession._sessionReport.iceRestartFailed).to.be.null;
                });
            });

            describe('Enhanced RTP Tracking Tests', () => {
                let callSession: CallSession;
                let mockPC: any;
                let mockReceiver: any;

                beforeEach(() => {
                    callSession = new CallSession(config);
                    callSession._connectTimeStamp = 1000;
                    
                    mockReceiver = {
                        getSynchronizationSources: sinon.stub().returns([])
                    };
                    
                    mockPC = {
                        getReceivers: sinon.stub().returns([mockReceiver])
                    };
                    
                    callSession._pc = mockPC;
                });

                it('should handle null peer connection during RTP tracking', () => {
                    callSession._pc = null;
                    
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                });

                it('should handle empty receivers array', () => {
                    mockPC.getReceivers = sinon.stub().returns([]);
                    
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                });

                it('should handle empty synchronization sources', () => {
                    mockReceiver.getSynchronizationSources = sinon.stub().returns([]);
                    
                    callSession._state.onSharedMediaSessionConnected();
                    
                    // Should not set firstRTPTimeMillis
                    expect(callSession._sessionReport.firstRTPTimeMillis).to.be.null;
                });

                it('should calculate firstRTPTimeMillis when RTP packet is received', () => {
                    const mockSource = {
                        timestamp: 1150 // 150ms after connect
                    };
                    
                    mockReceiver.getSynchronizationSources = sinon.stub().returns([mockSource]);
                    
                    // Mock setInterval and setTimeout to control timing
                    const originalSetInterval = setInterval;
                    const originalSetTimeout = setTimeout;
                    const originalClearInterval = clearInterval;
                    const originalClearTimeout = clearTimeout;
                    
                    let intervalCallback: Function | undefined;
                    (global as any).setInterval = (callback: Function, ms: number) => {
                        intervalCallback = callback;
                        return 'mock-interval-id';
                    };
                    (global as any).setTimeout = (callback: Function, ms: number) => {
                        return 'mock-timeout-id';
                    };
                    (global as any).clearInterval = sinon.spy();
                    (global as any).clearTimeout = sinon.spy();
                    
                    callSession._state.onSharedMediaSessionConnected();
                    
                    // Execute the interval callback manually
                    if (intervalCallback) {
                        intervalCallback();
                        expect(callSession._sessionReport.firstRTPTimeMillis).to.equal(150);
                    }
                    
                    // Restore original functions
                    (global as any).setInterval = originalSetInterval;
                    (global as any).setTimeout = originalSetTimeout;
                    (global as any).clearInterval = originalClearInterval;
                    (global as any).clearTimeout = originalClearTimeout;
                });

                it('should stop tracking after first RTP packet', () => {
                    const mockSource = {
                        timestamp: 1100
                    };
                    
                    mockReceiver.getSynchronizationSources = sinon.stub().returns([mockSource]);
                    
                    // Mock timer functions
                    const originalSetInterval = setInterval;
                    const originalSetTimeout = setTimeout;
                    const originalClearInterval = clearInterval;
                    const originalClearTimeout = clearTimeout;
                    
                    let intervalCallback: Function | undefined;
                    const clearIntervalSpy = sinon.spy();
                    const clearTimeoutSpy = sinon.spy();
                    
                    (global as any).setInterval = (callback: Function, ms: number) => {
                        intervalCallback = callback;
                        return 'mock-interval-id';
                    };
                    (global as any).setTimeout = (callback: Function, ms: number) => {
                        return 'mock-timeout-id';
                    };
                    (global as any).clearInterval = clearIntervalSpy;
                    (global as any).clearTimeout = clearTimeoutSpy;
                    
                    callSession._state.onSharedMediaSessionConnected();
                    
                    // Execute the interval callback manually
                    if (intervalCallback) {
                        intervalCallback();
                        // Verify that clearInterval and clearTimeout were called
                        expect(clearIntervalSpy).to.have.been.called;
                        expect(clearTimeoutSpy).to.have.been.called;
                    }
                    
                    // Restore original functions
                    (global as any).setInterval = originalSetInterval;
                    (global as any).setTimeout = originalSetTimeout;
                    (global as any).clearInterval = originalClearInterval;
                    (global as any).clearTimeout = originalClearTimeout;
                });

                it('should handle invalid receiver type', () => {
                    mockPC.getReceivers = sinon.stub().returns([{ notAReceiver: true }]);
                    
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                });

                it('should handle error in getSynchronizationSources', () => {
                    mockReceiver.getSynchronizationSources = sinon.stub().throws(new Error('getSynchronizationSources failed'));
                    
                    expect(() => callSession._state.onSharedMediaSessionConnected()).to.not.throw();
                });
            });

            describe('Session Report Property Preservation Tests', () => {
                it('should preserve all timing properties from shared media session', () => {
                    const callSession = new CallSession(config);
                    
                    const sharedSessionReport = {
                        gumTimeMillis: 50,
                        initializationTimeMillis: 100,
                        iceCollectionTimeMillis: 200,
                        signallingConnectTimeMillis: 150,
                        handshakingTimeMillis: 300,
                        preTalkingTimeMillis: 800
                    };
                    
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', sharedSessionReport);
                    
                    expect(callSession._sessionReport.gumTimeMillis).to.equal(50);
                    expect(callSession._sessionReport.initializationTimeMillis).to.equal(100);
                    expect(callSession._sessionReport.iceCollectionTimeMillis).to.equal(200);
                    expect(callSession._sessionReport.signallingConnectTimeMillis).to.equal(150);
                    expect(callSession._sessionReport.handshakingTimeMillis).to.equal(300);
                    expect(callSession._sessionReport.preTalkingTimeMillis).to.equal(800);
                });

                it('should preserve all failure flags from shared media session', () => {
                    const callSession = new CallSession(config);
                    
                    const sharedSessionReport = {
                        iceCollectionFailure: true,
                        signallingConnectionFailure: true,
                        handshakingFailure: true,
                        gumOtherFailure: true,
                        gumTimeoutFailure: true,
                        createOfferFailure: true,
                        setLocalDescriptionFailure: true,
                        userBusyFailure: true,
                        invalidRemoteSDPFailure: true,
                        noRemoteIceCandidateFailure: true,
                        setRemoteDescriptionFailure: true
                    };
                    
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', sharedSessionReport);
                    
                    expect(callSession._sessionReport.iceCollectionFailure).to.be.true;
                    expect(callSession._sessionReport.signallingConnectionFailure).to.be.true;
                    expect(callSession._sessionReport.handshakingFailure).to.be.true;
                    expect(callSession._sessionReport.gumOtherFailure).to.be.true;
                    expect(callSession._sessionReport.gumTimeoutFailure).to.be.true;
                    expect(callSession._sessionReport.createOfferFailure).to.be.true;
                    expect(callSession._sessionReport.setLocalDescriptionFailure).to.be.true;
                    expect(callSession._sessionReport.userBusyFailure).to.be.true;
                    expect(callSession._sessionReport.invalidRemoteSDPFailure).to.be.true;
                    expect(callSession._sessionReport.noRemoteIceCandidateFailure).to.be.true;
                    expect(callSession._sessionReport.setRemoteDescriptionFailure).to.be.true;
                });

                it('should preserve path and platform properties from shared media session', () => {
                    const callSession = new CallSession(config);
                    
                    const sharedSessionReport = {
                        iceCredentialSource: 'api-fetched',
                        isContactCredentialsDifferentRegion: false
                    };
                    
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', sharedSessionReport);
                    
                    expect(callSession._sessionReport.iceCredentialSource).to.equal('api-fetched');
                    expect(callSession._sessionReport.isContactCredentialsDifferentRegion).to.be.false;
                });

                it('should preserve call session specific properties after merge', () => {
                    const callSession = new CallSession(config);
                    
                    // Set call session specific properties
                    callSession._sessionReport.firstRTPTimeMillis = 125;
                    callSession._sessionReport.isPCMv2Path = true;
                    callSession._sessionReport.isExistingPersistentPeerConnection = true;
                    
                    const sharedSessionReport = {
                        gumTimeMillis: 50,
                        initializationTimeMillis: 100
                    };
                    
                    callSession.onSharedMediaSessionEvent('sessionSetupLatencyMetricReady', sharedSessionReport);
                    
                    // Verify call session properties are preserved
                    expect(callSession._sessionReport.firstRTPTimeMillis).to.equal(125);
                    expect(callSession._sessionReport.isPCMv2Path).to.be.true;
                    expect(callSession._sessionReport.isExistingPersistentPeerConnection).to.be.true;
                    
                    // Verify shared session properties are copied
                    expect(callSession._sessionReport.gumTimeMillis).to.equal(50);
                    expect(callSession._sessionReport.initializationTimeMillis).to.equal(100);
                });
            });
        });

        describe('DisconnectedState', () => {
            it('should set session end time on enter', () => {
                const callSession = new CallSession(config);
                
                // Get to TalkingState first, then trigger disconnect
                callSession._state.onSharedMediaSessionConnected();
                callSession._state.disconnectContact();

                expect(callSession._sessionReport.sessionEndTime).to.be.instanceOf(Date);
            });
        });

        describe('FailedState', () => {
            it('should call onSessionFailed callback and set end time on enter', () => {
                const callSession = new CallSession(config);
                const callback = sinon.spy();
                const error = new Error('test error');
                callSession._onSessionFailed = callback;

                callSession._state.onSharedMediaSessionError(error);

                expect(callback).to.have.been.calledWith(callSession, error);
                expect(callSession._sessionReport.sessionEndTime).to.be.instanceOf(Date);
            });
        });
    });
});
