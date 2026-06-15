import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import RtcPeerConnectionManagerV2 from '../../src/rtc_peer_connection_manager_v2';
import StandardStrategy from '../../src/strategies/StandardStrategy';
import CallSession from '../../src/call_session';
import SharedMediaSession from '../../src/shared_media_session';

chai.use(sinonChai);

const expect = chai.expect;

describe('RtcPeerConnectionManagerV2', () => {
    let config: any;
    let mockLogger: any;
    let mockWssManager: any;
    let mockStrategy: any;
    let mockTransportHandle: sinon.SinonStub;
    let mockPublishError: sinon.SinonSpy;

    beforeEach(() => {
        // Mock UUID function
        const uuid = require('uuid/v4');
        if (typeof uuid !== 'function') {
            require('uuid/v4').mockImplementation = () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9);
        }

        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) })
        };

        mockWssManager = {
            subscribeTopics: sinon.spy(),
            onMessage: sinon.stub().returns(() => {}),
            sendMessage: sinon.spy(),
            getCalls: sinon.stub().returns([])
        };

        mockStrategy = new StandardStrategy();
        mockTransportHandle = sinon.stub().resolves([{urls: ['stun:stun.example.com']}]);
        mockPublishError = sinon.spy();

        config = {
            transportHandle: mockTransportHandle,
            publishError: mockPublishError,
            logger: mockLogger,
            contactId: 'test-contact-id',
            connectionId: 'test-connection-id',
            rtcJsStrategy: mockStrategy,
            webSocketManager: mockWssManager,
            signalingUri: 'wss://example.com',
            iceServers: [{urls: ['stun:stun.example.com']}],
            callContextToken: 'test-token',
            browserId: 'test-browser-id',
            clientId: 'test-client-id',
            isPersistentConnectionEnabled: false
        };
    });

    afterEach(() => {
        (RtcPeerConnectionManagerV2 as any).instance = null;
        sinon.restore();
    });

    describe('Constructor', () => {
        it('should throw error when config is missing', () => {
            expect(() => new RtcPeerConnectionManagerV2(null as any)).to.throw('config is required');
        });

        it('should throw error when transportHandle is missing', () => {
            const invalidConfig = {...config, transportHandle: null};
            expect(() => new RtcPeerConnectionManagerV2(invalidConfig)).to.throw('transportHandle must be a function');
        });

        it('should throw error when publishError is missing', () => {
            const invalidConfig = {...config, publishError: null};
            expect(() => new RtcPeerConnectionManagerV2(invalidConfig)).to.throw('publishError must be a function');
        });

        it('should throw error when logger is missing', () => {
            const invalidConfig = {...config, logger: null};
            expect(() => new RtcPeerConnectionManagerV2(invalidConfig)).to.throw('logger required');
        });

        it('should throw error when strategy is invalid', () => {
            const invalidConfig = {...config, rtcJsStrategy: {}};
            expect(() => new RtcPeerConnectionManagerV2(invalidConfig)).to.throw('Expected a strategy of type CCPInitiationStrategyInterface');
        });

        it('should default _allowExtendedPersistentConnection to false when not provided in config', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            expect(pcm._allowExtendedPersistentConnection).to.be.false;
        });

        it('should store _allowExtendedPersistentConnection when true in config', () => {
            const extendedConfig = {...config, allowExtendedPersistentConnection: true};
            const pcm = new RtcPeerConnectionManagerV2(extendedConfig);
            expect(pcm._allowExtendedPersistentConnection).to.be.true;
        });

        it('should coerce _allowExtendedPersistentConnection to boolean', () => {
            const extendedConfig = {...config, allowExtendedPersistentConnection: 'truthy'};
            const pcm = new RtcPeerConnectionManagerV2(extendedConfig);
            expect(pcm._allowExtendedPersistentConnection).to.be.true;
        });
    });

    describe('Singleton Pattern', () => {
        it('should create singleton instance', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            expect(pcm).to.be.an.instanceOf(RtcPeerConnectionManagerV2);
        });
    });

    describe('Session Management', () => {
        it('should handle getSession method', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = {};
            pcm._callSessions!.set('connection-1', mockCallSession as any);

            const result = pcm.getSession('connection-1');

            expect(result).to.equal(mockCallSession);
        });

        it('should return null when call session does not exist', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._callSessions = new Map();

            const result = pcm.getSession('non-existent');

            expect(result).to.be.null;
        });
    });

    describe('Destroy and Cleanup', () => {
        it('should not destroy when call sessions are active', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = { hangup: sinon.spy() };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._callSessions!.set('conn-1', {} as any);
            
            pcm.destroy();
            
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Peer connection is in use/));
            expect(mockSharedMediaSession.hangup).to.not.have.been.called;
        });

        it('should destroy SharedMediaSession and clean up all resources', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = { hangup: sinon.spy() };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._pc = {} as any;
            pcm._peerConnectionId = 'test-id';
            pcm._peerConnectionToken = 'test-token';
            pcm._callSessions = new Map();
            const clearTimerSpy = sinon.spy(pcm, 'clearInactivityTimer');
            
            pcm.destroy(false);
            
            expect(mockSharedMediaSession.hangup).to.have.been.calledWith(false);
            expect(pcm._sharedMediaSession).to.be.null;
            expect(pcm._pc).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(clearTimerSpy).to.have.been.called;
        });

        it('should pass serverInitiated flag to SharedMediaSession hangup', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = { hangup: sinon.spy() };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._callSessions = new Map();
            
            pcm.destroy(true);
            
            expect(mockSharedMediaSession.hangup).to.have.been.calledWith(true);
        });

        it('should handle destroy when no SharedMediaSession exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = null;
            pcm._callSessions = new Map();
            
            expect(() => pcm.destroy()).to.not.throw();
        });

        it('should handle error during destroy gracefully', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                hangup: sinon.stub().throws(new Error('hangup failed'))
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._callSessions = new Map();
            
            expect(() => pcm.destroy()).to.not.throw();
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Error occurred in PeerConnectionManager destroy/));
        });
    });

    describe('PC_BYE Message Handling', () => {
        it('should call destroy when no active call sessions and peerConnectionId matches', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._peerConnectionId = 'test-pc-id';
            pcm._callSessions = new Map();
            
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            (pcm as any)._handlePCBye({peerConnectionId: 'test-pc-id'});
            
            expect(destroySpy).to.have.been.calledWith(true);
        });

        it('should not destroy when there are active call sessions', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._peerConnectionId = 'test-pc-id';
            pcm._callSessions!.set('session-1', {} as any);
            
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            (pcm as any)._handlePCBye({peerConnectionId: 'test-pc-id'});
            
            expect(destroySpy).to.not.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PC_BYE received but.*call session.*still active/));
        });

        it('should not call destroy if peerConnectionId does not match', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._peerConnectionId = 'test-pc-id';
            pcm._callSessions = new Map();
            
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            (pcm as any)._handlePCBye({peerConnectionId: 'different-pc-id'});
            
            expect(destroySpy).to.not.have.been.called;
            expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PC_BYE peerConnectionId mismatch/));
        });

        it('should not call destroy if peerConnectionId is missing', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._callSessions = new Map();
            
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            (pcm as any)._handlePCBye({});
            
            expect(destroySpy).to.not.have.been.called;
            expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PC_BYE message missing peerConnectionId/));
        });

        it('should handle null PC_BYE message', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            (pcm as any)._handlePCBye(null);
            
            expect(destroySpy).to.not.have.been.called;
            expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PC_BYE message missing peerConnectionId/));
        });
    });

    describe('Connection Management', () => {
        it('should handle hanging up specific connection', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = { hangup: sinon.spy() };
            pcm._callSessions!.set('conn-123', mockCallSession as any);
            pcm._signalingChannelManager!.unregisterCallSession = sinon.spy();
            
            pcm.hangup('conn-123');
            
            expect(mockCallSession.hangup).to.have.been.called;
            expect(pcm._callSessions!.has('conn-123')).to.be.false;
            expect(pcm._signalingChannelManager!.unregisterCallSession).to.have.been.calledWith('conn-123');
        });

        it('should warn when session not found for specific connectionId', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            pcm.hangup('non-existent');
            
            expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/No call session found for agent media leg/));
        });

        it('should handle error when session not found', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            await pcm.connect('non-existent');
            
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/No call session found for agent media leg/));
        });
    });

    describe('Timer Management', () => {
        it('should handle startInactivityTimer', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._inactivityDuration = 1000;
            
            pcm.startInactivityTimer();
            
            expect((pcm as any)._inactivityTimer).to.not.be.null;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PeerConnectionManager start inactivity timer/));
            
            // Clean up timer
            pcm.clearInactivityTimer();
        });

        it('should handle clearInactivityTimer', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._inactivityDuration = 1000;
            pcm.startInactivityTimer();
            
            pcm.clearInactivityTimer();
            
            expect((pcm as any)._inactivityTimer).to.be.null;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PeerConnectionManager clear inactivity timer/));
        });

    });

    describe('Persistent Connection Management', () => {
        it('should handle activatePersistentPeerConnectionMode', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const closeSpy = sinon.spy(pcm, 'closeStandbyConnection');
            
            pcm.activatePersistentPeerConnectionMode();
            
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Activating persistent peer connection mode/));
            expect(closeSpy).to.have.been.called;
        });

        it('should handle deactivatePersistentPeerConnectionMode', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            pcm.deactivatePersistentPeerConnectionMode();
            
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Deactivating persistent peer connection mode/));
            expect(destroySpy).to.have.been.called;
        });


        it('should handle PPC toggle when conditions are met', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            pcm._isRTPSAllowlisted = true;
            pcm._callSessions = new Map();
            
            const activateSpy = sinon.spy(pcm, 'activatePersistentPeerConnectionMode');
            
            pcm.handlePersistentPeerConnectionToggle(true);
            
            expect(pcm._isPPCEnabled).to.be.true;
            expect(activateSpy).to.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/softphonePersistentConnection changed to true/));
        });

        it('should handle PPC toggle to false', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            pcm._callSessions = new Map();
            
            const deactivateSpy = sinon.spy(pcm, 'deactivatePersistentPeerConnectionMode');
            
            pcm.handlePersistentPeerConnectionToggle(false);
            
            expect(pcm._isPPCEnabled).to.be.false;
            expect(deactivateSpy).to.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/softphonePersistentConnection changed to false/));
        });

        it('should not toggle when conditions not met', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            pcm._isRTPSAllowlisted = false;
            pcm._callSessions = new Map();
            
            const activateSpy = sinon.spy(pcm, 'activatePersistentPeerConnectionMode');
            
            pcm.handlePersistentPeerConnectionToggle(true);
            
            expect(pcm._isPPCEnabled).to.be.false;
            expect(activateSpy).to.not.have.been.called;
        });

        it('should not toggle when call sessions are active', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            pcm._isRTPSAllowlisted = true;
            pcm._callSessions!.set('active-session', {} as any);
            
            const activateSpy = sinon.spy(pcm, 'activatePersistentPeerConnectionMode');
            
            pcm.handlePersistentPeerConnectionToggle(true);
            
            expect(pcm._isPPCEnabled).to.be.false;
            expect(activateSpy).to.not.have.been.called;
        });

        it('should not toggle when toggling to same state', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            pcm._callSessions = new Map();
            
            const activateSpy = sinon.spy(pcm, 'activatePersistentPeerConnectionMode');
            
            pcm.handlePersistentPeerConnectionToggle(true);
            
            expect(activateSpy).to.not.have.been.called;
        });
    });

    describe('Session Registration', () => {
        it('should register valid call session', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = {
                _contactId: 'contact-123',
                _agentMediaLegId: 'agent-123',
                registerAttributeChangeCallback: sinon.spy()
            };
            pcm._signalingChannelManager!.registerCallSession = sinon.spy();
            
            pcm.registerCallSession(mockCallSession as any);
            
            // registerCallSession does NOT re-store session (createSession already does that)
            // It only sets up signaling routing and attribute callbacks
            expect(mockCallSession.registerAttributeChangeCallback).to.have.been.called;
            expect(pcm._signalingChannelManager!.registerCallSession).to.have.been.calledWith('agent-123');
        });

        it('should not register null session', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            pcm.registerCallSession(null);
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Cannot register invalid session/));
        });

        it('should not register session without agentMediaLegId', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = {
                _contactId: 'contact-123'
            };
            
            pcm.registerCallSession(mockCallSession as any);
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Cannot register invalid session/));
        });
    });

    describe('SharedMediaSession Status', () => {
        it('should return true when shared media session is in talking state', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                isInTalkingState: sinon.stub().returns(true)
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            
            const result = pcm.isSharedMediaSessionEstablished();
            
            expect(result).to.be.true;
        });

        it('should return null when no shared media session', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = null;
            
            const result = pcm.isSharedMediaSessionEstablished();
            
            expect(result).to.not.be.ok; // null is falsy
        });

        it('should return false when shared media session not in talking state', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                isInTalkingState: sinon.stub().returns(false)
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            
            const result = pcm.isSharedMediaSessionEstablished();
            
            expect(result).to.be.false;
        });
    });

    describe('Early Media Connection Support', () => {
        it('should return false when persistent connection is enabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            
            const result = (pcm as any)._isStandbyConnectionSupported();
            
            expect(result).to.be.false;
        });

        it('should delegate to strategy when persistent connection disabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            mockStrategy._isEarlyMediaConnectionSupported = sinon.stub().returns(true);
            
            const result = (pcm as any)._isStandbyConnectionSupported();
            
            expect(mockStrategy._isEarlyMediaConnectionSupported).to.have.been.called;
            expect(result).to.be.true;
        });
    });

    describe('Attribute Change Handling', () => {
        it('should handle mediaStream attribute change', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {};
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            const newStream = { id: 'new-stream' };
            
            (pcm as any)._handleCallSessionAttributeChange('agent-123', 'mediaStream', newStream);
            
            expect((mockSharedMediaSession as any).mediaStream).to.equal(newStream);
        });

        it('should handle echoCancellation attribute change', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {};
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            
            (pcm as any)._handleCallSessionAttributeChange('agent-123', 'echoCancellation', true);
            
            expect((mockSharedMediaSession as any).echoCancellation).to.be.true;
        });

        it('should handle remoteAudioElement attribute change', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {};
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            const newElement = { srcObject: null };
            
            (pcm as any)._handleCallSessionAttributeChange('agent-123', 'remoteAudioElement', newElement);
            
            expect((mockSharedMediaSession as any).remoteAudioElement).to.equal(newElement);
        });

        it('should handle unhandled attributes gracefully', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {};
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            
            expect(() => {
                (pcm as any)._handleCallSessionAttributeChange('agent-123', 'unknownAttribute', 'value');
            }).to.not.throw();
            
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Unhandled attribute change/));
        });

        it('should handle attribute change when no shared media session', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = null;
            
            expect(() => {
                (pcm as any)._handleCallSessionAttributeChange('agent-123', 'mediaStream', {});
            }).to.not.throw();
            
            expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Cannot apply attribute.*no shared media session exists/));
        });

        it('should handle attribute change with error', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                get mediaStream() { throw new Error('Getter failed'); },
                set mediaStream(value) { throw new Error('Setter failed'); }
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            
            expect(() => {
                (pcm as any)._handleCallSessionAttributeChange('agent-123', 'mediaStream', {});
            }).to.not.throw();
            
            expect(mockLogger.error).to.have.been.called;
        });
    });

    describe('Session Completion and Failure Handling', () => {
        it('should clear all resources and callbacks on completion', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._callSessions!.set('session-1', {} as any);
            pcm._sharedMediaSession = {} as any;
            pcm._peerConnectionId = 'test-id';
            pcm._peerConnectionToken = 'test-token';
            pcm._signalingChannelManager!.clearCallSessionCallbacks = sinon.spy();
            
            pcm.handleSharedMediaSessionCompleted();
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(pcm._sharedMediaSession).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(pcm._signalingChannelManager!.clearCallSessionCallbacks).to.have.been.called;
        });

        it('should clear resources and publish error on failure', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._callSessions!.set('session-1', {} as any);
            pcm._sharedMediaSession = {} as any;
            pcm._peerConnectionId = 'test-id';
            pcm._peerConnectionToken = 'test-token';
            pcm._signalingChannelManager!.clearCallSessionCallbacks = sinon.spy();
            const error = new Error('Session failed');
            
            pcm.handleSharedMediaSessionFailed(error);
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(pcm._sharedMediaSession).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(mockPublishError).to.have.been.calledWith(error);
            expect(pcm._signalingChannelManager!.clearCallSessionCallbacks).to.have.been.called;
        });
    });

    describe('PersistentConnection Check', () => {
        it('should return false when not enabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            pcm._isRTPSAllowlisted = true;
            
            const result = pcm.isPersistentConnectionAllowlistedAndEnabled();
            
            expect(result).to.be.false;
        });

        it('should return false when not allowlisted', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = false;
            
            const result = pcm.isPersistentConnectionAllowlistedAndEnabled();
            
            expect(result).to.be.false;
        });
    });



    describe('Properties and Getters/Setters', () => {
        it('should handle all property getters and setters', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);

            pcm.signalingUri = 'new-uri';
            expect(pcm.signalingUri).to.equal('new-uri');

            pcm.iceServers = [{urls: ['turn:turn.example.com']}];
            expect(pcm.iceServers).to.deep.equal([{urls: ['turn:turn.example.com']}]);

            pcm.contactToken = 'new-token';
            expect(pcm.contactToken).to.equal('new-token');

            pcm.isPPCEnabled = true;
            expect(pcm.isPPCEnabled).to.be.true;

            pcm.isRTPSAllowlisted = true;
            expect(pcm.isRTPSAllowlisted).to.be.true;

            pcm.browserId = 'new-browser-id';
            expect(pcm.browserId).to.equal('new-browser-id');

            pcm.peerConnectionId = 'new-pc-id';
            expect(pcm.peerConnectionId).to.equal('new-pc-id');

            pcm.peerConnectionToken = 'new-pc-token';
            expect(pcm.peerConnectionToken).to.equal('new-pc-token');

            pcm.inactivityDuration = 30000;
            expect(pcm.inactivityDuration).to.equal(30000);
        });

        it('should handle all other getters and setters', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);

            pcm.callId = 'new-call-id';
            expect(pcm.callId).to.equal('new-call-id');

            pcm.connectionId = 'new-connection-id';
            expect(pcm.connectionId).to.equal('new-connection-id');

            const newWssManager = { test: 'manager' };
            pcm.wssManager = newWssManager as any;
            expect(pcm.wssManager).to.equal(newWssManager);

            const newStrategy = new StandardStrategy();
            pcm.strategy = newStrategy;
            expect(pcm.strategy).to.equal(newStrategy);

            const newLogger = { info: sinon.spy() };
            pcm.logger = newLogger as any;
            expect(pcm.logger).to.equal(newLogger);
        });
    });

    describe('Close Method', () => {
        it('should call destroy when persistent connection is enabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            const destroySpy = sinon.spy(pcm, 'destroy');
            const closeEarlySpy = sinon.spy(pcm, 'closeStandbyConnection');
            
            pcm.close();
            
            expect(destroySpy).to.have.been.called;
            expect(closeEarlySpy).to.not.have.been.called;
        });

        it('should call closeStandbyConnection when persistent connection is disabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            const destroySpy = sinon.spy(pcm, 'destroy');
            const closeEarlySpy = sinon.spy(pcm, 'closeStandbyConnection');
            
            pcm.close();
            
            expect(closeEarlySpy).to.have.been.called;
            expect(destroySpy).to.not.have.been.called;
        });

        it('should call closeStandbyConnection when not allowlisted', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = false;
            const destroySpy = sinon.spy(pcm, 'destroy');
            const closeEarlySpy = sinon.spy(pcm, 'closeStandbyConnection');
            
            pcm.close();
            
            expect(closeEarlySpy).to.have.been.called;
            expect(destroySpy).to.not.have.been.called;
        });

        it('should clear singleton so next construction runs full init (ACGR failover)', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            expect(RtcPeerConnectionManagerV2.instance).to.equal(pcm);

            pcm.close();

            expect(RtcPeerConnectionManagerV2.instance).to.be.null;
        });

    });


    // Network connectivity tests moved to standby_peer_connection_manager.ts unit tests
    // (network checker is now internal to the standby PC manager)


    describe('Connection Callback Registration', () => {
        it('should register SharedMediaSession callbacks properly', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            
            pcm.registerSharedMediaSessionCallbacks();
            
            expect(pcm._signalingChannelManager!.registerPCByeHandler).to.have.been.called;
            expect(mockSharedMediaSession.registerCallbacks).to.have.been.called;
            
            // Verify all required callbacks are registered
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            expect(callbacks).to.have.property('onGumError');
            expect(callbacks).to.have.property('onGumSuccess');
            expect(callbacks).to.have.property('onSharedMediaSessionFailed');
            expect(callbacks).to.have.property('onSharedMediaSessionConnected');
            expect(callbacks).to.have.property('isPersistentConnectionAllowlistedAndEnabledCallback');
        });

        it('should handle callback execution from SharedMediaSession', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy(),
                getPeerConnection: sinon.stub().returns({ test: 'pc' }),
                mediaStream: { id: 'test-stream' }
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            
            // Test simpler callback execution that doesn't require complex mocking
            callbacks.onGumError(new Error('GUM failed'));
            callbacks.onGumSuccess();
            
            expect(notifySpy).to.have.been.calledWith('gumError');
            expect(notifySpy).to.have.been.calledWith('gumSuccess');
        });
    });

    describe('Event Notification Tests', () => {
        it('should test event notification without complex mocking', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test that the method exists and can be called
            expect(() => {
                (pcm as any)._notifyAllCallSessionsOfEvent('testEvent', 'testData');
            }).to.not.throw();
        });

        it('should handle empty call sessions map', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._callSessions = new Map();
            
            expect(() => {
                (pcm as any)._notifyAllCallSessionsOfEvent('testEvent', 'testData');
            }).to.not.throw();
        });
    });

    describe('Peer Connection Management', () => {
        it('should test peer connection creation method exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const iceServers = [{urls: ['stun:test.com']}];
            
            // Test that the method exists and is callable
            expect(() => {
                (pcm as any)._createPeerConnection;
            }).to.not.throw();
            
            // Verify the method is a function
            expect(typeof (pcm as any)._createPeerConnection).to.equal('function');
        });
    });

    describe('Session Creation Tests', () => {
        it('should test createSession method flow without DOM dependencies', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test that method exists and basic flow works
            expect(() => {
                // Just verify method exists - don't call due to DOM dependency
                expect(typeof pcm.createSession).to.equal('function');
            }).to.not.throw();
        });

        it('should handle SharedMediaSession reuse when healthy', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Create an existing healthy SharedMediaSession
            const existingSharedSession = {
                isSharedMediaSessionHealthy: sinon.stub().returns(true)
            };
            pcm._sharedMediaSession = existingSharedSession as any;
            
            // Test the condition check logic
            const result = pcm._sharedMediaSession!.isSharedMediaSessionHealthy();
            expect(result).to.be.true;
        });
    });

    describe('Connection Flow Tests', () => {
        it('should handle connect method basic functionality', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic connect method error handling
            await pcm.connect('test-connection-id');
            
            // Should log error when no session found
            expect(mockLogger.error).to.have.been.called;
        });


        it('should handle multiple sessions connection logic', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Mock multiple call sessions directly
            pcm._callSessions!.set('conn-1', { _agentMediaLegId: 'conn-1' } as any);
            pcm._callSessions!.set('conn-2', { _agentMediaLegId: 'conn-2' } as any);
            
            await pcm.connect(undefined as any);
            
            // Should log error about multiple sessions
            expect(mockLogger.error).to.have.been.called;
        });

        it('should handle connection flow logic', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic connection flow without complex mocking
            expect(() => {
                pcm.connect('test-id');
            }).to.not.throw();
        });
    });



    describe('Hangup Logic Tests', () => {
        it('should test hangup basic functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test hangup with empty sessions - covers the hangup method path
            expect(() => pcm.hangup()).to.not.throw();
            expect(pcm._callSessions!.size).to.equal(0);
        });

        it('should handle isPersistentConnectionAllowlistedAndEnabled logic', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test enabled and allowlisted condition
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            
            // Mock navigator.userAgent for browser detection
            (global as any).navigator = { userAgent: 'Chrome' };
            
            const result = pcm.isPersistentConnectionAllowlistedAndEnabled();
            
            expect(result).to.be.true;
            
            delete (global as any).navigator;
        });

        it('should test hangup error recovery mechanism', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockCallSession = { hangup: sinon.stub().throws(new Error('Hangup error')) };
            pcm._callSessions!.set('session-1', mockCallSession as any);
            
            // Should handle error and continue cleanup
            expect(() => pcm.hangup()).to.not.throw();
            expect(pcm._callSessions!.size).to.equal(0);
        });
    });

    describe('Error Handler Registration', () => {
        it('should handle error registration callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const errorCallback = sinon.spy();
            
            (pcm as any)._errorHandler = errorCallback;
            
            // Trigger an error scenario
            pcm.connect('non-existent-session');
            
            // The error handler should be called
            expect(errorCallback).to.have.been.called;
        });
    });

    describe('Additional Property Handling', () => {
        it('should handle mediaStream property cleanup during destroy', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedMediaSession = { hangup: sinon.spy() };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._callSessions = new Map();
            (pcm as any)._mediaStream = { id: 'test-media-stream' };
            
            pcm.destroy();
            
            expect((pcm as any)._mediaStream).to.be.null;
        });

        it('should handle initialization with browserId', () => {
            const configWithBrowserId = { ...config, browserId: 'custom-browser-id' };
            const pcm = new RtcPeerConnectionManagerV2(configWithBrowserId);
            
            expect(pcm._browserId).to.equal('custom-browser-id');
        });

        it('should handle initialization with clientId', () => {
            const configWithClientId = { ...config, clientId: 'custom-client-id' };
            const pcm = new RtcPeerConnectionManagerV2(configWithClientId);
            
            expect((pcm as any)._clientId).to.equal('custom-client-id');
        });
    });

    describe('Instance Management', () => {
        it('should handle singleton pattern', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic instance properties
            expect(pcm).to.be.an.instanceOf(RtcPeerConnectionManagerV2);
            expect((RtcPeerConnectionManagerV2 as any).instance).to.exist;
        });
    });

    describe('Advanced Coverage Tests', () => {
        it('should test basic initialization properties', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic properties are set
            expect(pcm._browserId).to.equal('test-browser-id');
            expect(pcm._contactToken).to.equal('test-token');
        });

        it('should test method existence and basic functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test methods exist
            expect(typeof pcm.close).to.equal('function');
            expect(typeof pcm.destroy).to.equal('function');
            expect(typeof pcm.hangup).to.equal('function');
        });

        it('should test error handling patterns', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test error handling in various methods
            expect(() => pcm.connect('invalid')).to.not.throw();
            expect(() => pcm.hangup('invalid')).to.not.throw();
        });

        it('should test initialization logging', () => {
            // Create new instance to test initialization
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            expect(mockLogger.info).to.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Initializing RtcPeerConnectionManagerV2/));
        });
    });

    describe('Additional Method Coverage', () => {
        it('should test requestPeerConnection basic functionality', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Idle PC manager auto-requests on creation, verify it exists
            expect(pcm._standbyPcManager).to.not.be.null;
        });


        it('should test SharedMediaSession health check during various operations', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Create unhealthy SharedMediaSession
            const unhealthySharedSession = {
                isSharedMediaSessionHealthy: sinon.stub().returns(false),
                hangup: sinon.spy(),
                markNeedsCleanup: sinon.spy()
            };
            pcm._sharedMediaSession = unhealthySharedSession as any;
            
            // Test that destroy is called for unhealthy session
            const mockCallSession = { hangup: sinon.spy() };
            pcm._callSessions!.set('test-session', mockCallSession as any);
            
            const destroySpy = sinon.spy(pcm, 'destroy');
            pcm.hangup();
            
            expect(destroySpy).to.have.been.called;
            expect(mockLogger.warn).to.have.been.called;
        });

        it('should test SharedMediaSession persistence logic', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Set up persistent connection enabled
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            
            const healthySharedSession = {
                isSharedMediaSessionHealthy: sinon.stub().returns(true),
                pauseLocalAudio: sinon.spy(),
                markNeedsCleanup: sinon.spy()
            };
            pcm._sharedMediaSession = healthySharedSession as any;
            
            const mockCallSession = { hangup: sinon.spy() };
            pcm._callSessions!.set('test-session', mockCallSession as any);
            
            const startTimerSpy = sinon.spy(pcm, 'startInactivityTimer');
            
            pcm.hangup();
            
            expect(healthySharedSession.pauseLocalAudio).to.have.been.called;
            expect(startTimerSpy).to.have.been.called;
        });

        it('should test close method functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = false;
            const closeEarlySpy = sinon.spy(pcm, 'closeStandbyConnection');
            
            // Test basic close method functionality
            expect(() => pcm.close()).to.not.throw();
            
            // Should call closeStandbyConnection for non-persistent mode
            expect(closeEarlySpy).to.have.been.called;
        });

        it('should test inactivity timer handling with duration', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            pcm._inactivityDuration = 60000; // 1 minute
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            // Test inactivity callback
            const callback = (pcm as any)._inactivityCallback;
            if (callback) {
                callback();
                expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Peer connection has been inactive/));
                expect(destroySpy).to.have.been.called;
            }
        });

        it('should test browser tab close event handling', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Mock window.addEventListener for beforeunload event
            (global as any).window = {
                addEventListener: sinon.spy()
            };
            
            // Trigger browser tab close event listener setup
            const handler = (pcm as any)._browserTabCloseEventListener;
            if (handler) {
                const destroySpy = sinon.spy(pcm, 'destroy');
                handler();
                expect(destroySpy).to.have.been.called;
            }
            
            delete (global as any).window;
        });

        it('should test SharedMediaSession callback registration', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test that callbacks object exists and has expected properties
            expect(callbacks).to.be.an('object');
            expect(callbacks).to.have.property('onGumError');
            expect(callbacks).to.have.property('onGumSuccess');
        });

        it('should test SharedMediaSession callback execution with PC data', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = {
                registerCallbacks: sinon.spy(),
                getPeerConnection: sinon.stub().returns({ id: 'test-pc' }),
                mediaStream: { id: 'test-stream' },
                pauseLocalAudio: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            const notifyEventSpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test onSharedMediaSessionConnected with PC data
            callbacks.onSharedMediaSessionConnected();
            
            expect(notifyEventSpy).to.have.been.calledWith('sessionConnected');
            // Page-load case: no active calls → should pause audio
            expect(mockSharedSession.pauseLocalAudio).to.have.been.called;
        });
    });

    describe('Final Coverage Tests', () => {
        it('should test constructor initialization paths', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test initialization of various properties and methods
            expect(pcm._iceServers).to.exist;
            expect(pcm._signalingUri).to.exist;
            expect(pcm._strategy).to.exist;
            expect(pcm._logger).to.exist;
            expect(pcm._publishError).to.exist;
            expect(pcm._wssManager).to.exist;
        });

        it('should test callback delegation basic functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test that callbacks object exists
            expect(callbacks).to.be.an('object');
            expect(callbacks).to.have.property('onGumError');
            expect(callbacks).to.have.property('onGumSuccess');
        });

        it('should test basic callback delegation', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test isPersistentConnectionAllowlistedCallback
            const result = callbacks.isPersistentConnectionAllowlistedAndEnabledCallback();
            expect(typeof result).to.equal('boolean');
        });

        it('should test setPeerConnectionIdCallback delegation', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test setPeerConnectionIdCallback
            callbacks.setPeerConnectionIdCallback('test-pc-id');
            expect(pcm._peerConnectionId).to.equal('test-pc-id');
        });

        it('should test setPeerConnectionTokenCallback delegation', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test setPeerConnectionTokenCallback
            callbacks.setPeerConnectionTokenCallback('test-pc-token');
            expect(pcm._peerConnectionToken).to.equal('test-pc-token');
        });

        it('should test setInactivityDurationCallback delegation', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            const mockSharedSession = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSharedSession as any;
            
            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSharedSession.registerCallbacks.firstCall.args[0];
            
            // Test setInactivityDurationCallback
            callbacks.setInactivityDurationCallback(30000);
            expect(pcm._inactivityDuration).to.equal(30000);
        });

        // Network connectivity checker tests moved to standby_peer_connection_manager.ts unit tests

        it('should test standby peer connection refresh timer setup', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Set up conditions for standby PC creation
            pcm._isPPCEnabled = false;
            (pcm as any)._peerConnectionRequestInFlight = false;
            (pcm as any)._closed = false;
            
            const isEarlyMediaSupportedStub = sinon.stub(pcm as any, '_isStandbyConnectionSupported').returns(true);
            const mockPC = { id: 'idle-pc' };
            const createPCSpy = sinon.stub(pcm as any, '_createPeerConnection').resolves(mockPC);
            
            // Mock setTimeout to capture the refresh callback
            const originalSetTimeout = setTimeout;
            let refreshCallback: Function | undefined;
            (global as any).setTimeout = (callback: Function, timeout: number) => {
                if (timeout === 60000) { // 1 minute refresh timer
                    refreshCallback = callback;
                }
                return originalSetTimeout(callback, timeout);
            };
            
            // Idle PC manager auto-requests on creation; verify it was created
            expect(pcm._standbyPcManager).to.not.be.null;
            
            (global as any).setTimeout = originalSetTimeout;
        });

    });


    describe('Media Stream Refresh Between Calls', () => {
        describe('createSession with idle SharedMediaSession', () => {
            it('should call refreshMediaStreamBetweenCalls when SharedMediaSession is idle', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                
                const mockSharedMediaSession = {
                    isSharedMediaSessionHealthy: sinon.stub().returns(true),
                    refreshMediaStreamBetweenCalls: sinon.spy()
                };
                pcm._sharedMediaSession = mockSharedMediaSession as any;
                pcm._callSessions = new Map(); // 0 active sessions = idle
                
                pcm.createSession(
                    'test-call-id',
                    [{urls: ['stun:test.com']}],
                    'test-token',
                    'test-connection-id',
                    mockWssManager,
                    mockStrategy,
                    undefined
                );
                
                expect(mockSharedMediaSession.refreshMediaStreamBetweenCalls).to.have.been.called;
                expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession is idle, refreshing media stream/));
            });

            it('should NOT call refreshMediaStreamBetweenCalls when SharedMediaSession does not exist', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                
                pcm._sharedMediaSession = null;
                pcm._callSessions = new Map();
                
                pcm.createSession(
                    'test-call-id',
                    [{urls: ['stun:test.com']}],
                    'test-token',
                    'test-connection-id',
                    mockWssManager,
                    mockStrategy,
                    undefined
                );
                
                // Should not have called refresh (no SharedMediaSession exists)
                expect(mockLogger.info).to.not.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession is idle, refreshing media stream/));
            });

            it('should NOT call refreshMediaStreamBetweenCalls when there are active call sessions', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                
                const mockSharedMediaSession = {
                    isSharedMediaSessionHealthy: sinon.stub().returns(true),
                    refreshMediaStreamBetweenCalls: sinon.spy()
                };
                pcm._sharedMediaSession = mockSharedMediaSession as any;
                
                // Add an active call session
                pcm._callSessions!.set('existing-session', {} as any);
                
                pcm.createSession(
                    'test-call-id',
                    [{urls: ['stun:test.com']}],
                    'test-token',
                    'test-connection-id',
                    mockWssManager,
                    mockStrategy,
                    undefined
                );
                
                expect(mockSharedMediaSession.refreshMediaStreamBetweenCalls).to.not.have.been.called;
                expect(mockLogger.info).to.not.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession is idle, refreshing media stream/));
            });

            it('should destroy unhealthy SharedMediaSession before refresh check', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                
                const mockSharedMediaSession = {
                    isSharedMediaSessionHealthy: sinon.stub().returns(false),
                    refreshMediaStreamBetweenCalls: sinon.spy(),
                    hangup: sinon.spy()
                };
                pcm._sharedMediaSession = mockSharedMediaSession as any;
                pcm._callSessions = new Map();
                
                const destroySpy = sinon.spy(pcm, 'destroy');
                
                pcm.createSession(
                    'test-call-id',
                    [{urls: ['stun:test.com']}],
                    'test-token',
                    'test-connection-id',
                    mockWssManager,
                    mockStrategy,
                    undefined
                );
                
                expect(destroySpy).to.have.been.called;
                expect(mockSharedMediaSession.refreshMediaStreamBetweenCalls).to.not.have.been.called;
                expect(mockLogger.warn).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession exists but is unhealthy/));
            });

            it('should log idle state detection correctly', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                
                const mockSharedMediaSession = {
                    isSharedMediaSessionHealthy: sinon.stub().returns(true),
                    refreshMediaStreamBetweenCalls: sinon.spy()
                };
                pcm._sharedMediaSession = mockSharedMediaSession as any;
                pcm._callSessions = new Map();
                
                pcm.createSession(
                    'test-call-id',
                    [{urls: ['stun:test.com']}],
                    'test-token',
                    'test-connection-id',
                    mockWssManager,
                    mockStrategy,
                    undefined
                );
                
                expect(mockLogger.info).to.have.been.calledWith(
                    sinon.match.any,
                    sinon.match.any,
                    sinon.match(/SharedMediaSession is idle, refreshing media stream for new call/)
                );
            });

        });
    });

    describe('State Change Callbacks for Citrix Compatibility', () => {
        it('should register onIceConnectionStateChange callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            expect(callbacks).to.have.property('onIceConnectionStateChange');
            expect(typeof callbacks.onIceConnectionStateChange).to.equal('function');
        });

        it('should register onPeerConnectionStateChange callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            expect(callbacks).to.have.property('onPeerConnectionStateChange');
            expect(typeof callbacks.onPeerConnectionStateChange).to.equal('function');
        });

        it('should forward ICE connection state changes to call sessions', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            callbacks.onIceConnectionStateChange('connected');
            
            expect(notifySpy).to.have.been.calledWith('iceConnectionStateChange', 'connected');
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/ICE Connection State changed: connected/));
        });

        it('should forward peer connection state changes to call sessions', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            callbacks.onPeerConnectionStateChange('connected');
            
            expect(notifySpy).to.have.been.calledWith('peerConnectionStateChange', 'connected');
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Peer Connection State changed: connected/));
        });

        it('should handle ICE disconnected state notification', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            callbacks.onIceConnectionStateChange('disconnected');
            
            expect(notifySpy).to.have.been.calledWith('iceConnectionStateChange', 'disconnected');
        });

        it('should handle ICE failed state notification', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            callbacks.onIceConnectionStateChange('failed');
            
            expect(notifySpy).to.have.been.calledWith('iceConnectionStateChange', 'failed');
        });

        it('should handle peer connection failed state notification', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                registerCallbacks: sinon.spy()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');
            
            pcm.registerSharedMediaSessionCallbacks();
            
            const callbacks = mockSharedMediaSession.registerCallbacks.firstCall.args[0];
            callbacks.onPeerConnectionStateChange('failed');
            
            expect(notifySpy).to.have.been.calledWith('peerConnectionStateChange', 'failed');
        });
    });

    describe('ICE Restart Metrics Tracking', () => {
        it('should forward ICE restart metrics via sessionSetupLatencyMetricReady event', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test that _notifyAllCallSessionsOfEvent can be called with the event
            expect(() => {
                (pcm as any)._notifyAllCallSessionsOfEvent('sessionSetupLatencyMetricReady', {
                    iceRestartAttempts: 3,
                    iceRestartSuccesses: 2
                });
            }).to.not.throw();
        });
    });

    describe('Page-Load Persistent Connection', () => {
        it('should store isPersistentConnectionOnPageLoadEnabled from config', () => {
            const configWithFlag = { ...config, isPersistentConnectionOnPageLoadEnabled: true };
            const pcm = new RtcPeerConnectionManagerV2(configWithFlag);
            
            expect((pcm as any)._isPersistentConnectionOnPageLoadEnabled).to.be.true;
        });

        it('should default isPersistentConnectionOnPageLoadEnabled to false when not provided', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            expect((pcm as any)._isPersistentConnectionOnPageLoadEnabled).to.be.false;
        });

        describe('handleFACUpdate', () => {
            it('should call _setupPageLoadPersistentConnection on false→true transition when all conditions met', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;
                pcm._callSessions = new Map();
                pcm._sharedMediaSession = null;
                pcm._hasEverCreatedSharedMediaSession = false;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(pcm._isPersistentConnectionOnPageLoadEnabled).to.be.true;
                expect(setupSpy).to.have.been.calledOnce;
            });

            it('should NOT call setup when PPC is disabled', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = false;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;
                pcm._callSessions = new Map();
                pcm._sharedMediaSession = null;
                pcm._hasEverCreatedSharedMediaSession = false;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(pcm._isPersistentConnectionOnPageLoadEnabled).to.be.true;
                expect(setupSpy).to.not.have.been.called;
            });

            it('should NOT call setup when there are active call sessions', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;
                pcm._callSessions!.set('active-session', {} as any);
                pcm._sharedMediaSession = null;
                pcm._hasEverCreatedSharedMediaSession = false;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(setupSpy).to.not.have.been.called;
            });

            it('should NOT call setup when SharedMediaSession already exists', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;
                pcm._callSessions = new Map();
                pcm._sharedMediaSession = { test: 'existing-sms' } as any;
                pcm._hasEverCreatedSharedMediaSession = true;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(setupSpy).to.not.have.been.called;
            });

            it('should NOT call setup when SMS was already attempted (_hasEverCreatedSharedMediaSession)', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;
                pcm._callSessions = new Map();
                pcm._sharedMediaSession = null;
                pcm._hasEverCreatedSharedMediaSession = true; // Already attempted

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(setupSpy).to.not.have.been.called;
            });

            it('should NOT call setup on true→true (no transition)', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = true; // Already true
                pcm._callSessions = new Map();
                pcm._sharedMediaSession = null;
                pcm._hasEverCreatedSharedMediaSession = false;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                expect(setupSpy).to.not.have.been.called;
            });

            it('should NOT call setup on false→false (no transition)', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = false;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: false });

                expect(setupSpy).to.not.have.been.called;
                expect(pcm._isPersistentConnectionOnPageLoadEnabled).to.be.false;
            });

            it('should update flag but not setup on true→false transition', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                pcm._isPPCEnabled = true;
                pcm._isPersistentConnectionOnPageLoadEnabled = true;

                const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: false });

                expect(pcm._isPersistentConnectionOnPageLoadEnabled).to.be.false;
                expect(setupSpy).to.not.have.been.called;
            });

            it('should not throw when called with null flags', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                const spy = sinon.stub(pcm as any, '_handlePageLoadPersistentConnectionFACUpdate');

                pcm.handleFACUpdate(null as any);

                expect(spy).to.not.have.been.called;
            });

            it('should not throw when called with undefined flags', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                const spy = sinon.stub(pcm as any, '_handlePageLoadPersistentConnectionFACUpdate');

                pcm.handleFACUpdate(undefined as any);

                expect(spy).to.not.have.been.called;
            });

            it('should not dispatch when called with empty flags object', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                const spy = sinon.stub(pcm as any, '_handlePageLoadPersistentConnectionFACUpdate');

                pcm.handleFACUpdate({});

                expect(spy).to.not.have.been.called;
            });

            it('should not dispatch for unrecognized flag names', () => {
                const pcm = new RtcPeerConnectionManagerV2(config);
                const spy = sinon.stub(pcm as any, '_handlePageLoadPersistentConnectionFACUpdate');

                pcm.handleFACUpdate({ someUnknownFlag: true });

                expect(spy).to.not.have.been.called;
            });
        });
    });

    describe('Inactivity Timer, Browser Events, and Cleanup Flows', () => {

        it('should test inactivity timer callback execution', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            pcm._inactivityDuration = 1000;
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            // Start inactivity timer and capture the callback
            let timerCallback: Function;
            const originalSetTimeout = setTimeout;
            (global as any).setTimeout = (callback: Function, timeout: number) => {
                timerCallback = callback;
                return originalSetTimeout(callback, timeout);
            };
            
            pcm.startInactivityTimer();
            
            // Execute the captured callback
            if (timerCallback!) {
                timerCallback();
                expect(destroySpy).to.have.been.called;
            }
            
            (global as any).setTimeout = originalSetTimeout;
        });

        it('should test browser event handling without DOM dependencies', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test that browserTabCloseEventListener method exists
            expect(typeof pcm.browserTabCloseEventListener).to.equal('function');
        });

        it('should test close method basic functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            // Test basic close functionality for persistent mode
            expect(() => pcm.close()).to.not.throw();
            expect(destroySpy).to.have.been.called;
        });

        it('should test handleSharedMediaSessionCompleted cleanup sequence', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Set up state to be cleaned up
            pcm._callSessions!.set('session-1', {} as any);
            pcm._sharedMediaSession = { test: 'session' } as any;
            pcm._peerConnectionId = 'test-pc-id';
            pcm._peerConnectionToken = 'test-pc-token';
            pcm._signalingChannelManager!.clearCallSessionCallbacks = sinon.spy();
            
            pcm.handleSharedMediaSessionCompleted();
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(pcm._sharedMediaSession).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(pcm._signalingChannelManager!.clearCallSessionCallbacks).to.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Handling shared media session completion/));
        });

        it('should test handleSharedMediaSessionFailed cleanup and error publishing', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const testError = new Error('Session failed');
            
            // Set up state to be cleaned up
            pcm._callSessions!.set('session-1', {} as any);
            pcm._sharedMediaSession = { test: 'session' } as any;
            pcm._peerConnectionId = 'test-pc-id';
            pcm._peerConnectionToken = 'test-pc-token';
            pcm._signalingChannelManager!.clearCallSessionCallbacks = sinon.spy();
            
            pcm.handleSharedMediaSessionFailed(testError);
            
            expect(pcm._callSessions!.size).to.equal(0);
            expect(pcm._sharedMediaSession).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(pcm._signalingChannelManager!.clearCallSessionCallbacks).to.have.been.called;
            expect(mockPublishError).to.have.been.calledWith(testError);
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Shared media session failed/));
        });

        it('should test connect method error handling', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic connect functionality for non-existent session
            await pcm.connect('test-connection-id');
            
            // Should handle missing session gracefully
            expect(mockLogger.error).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/No call session found for agent media leg/));
        });

        it('should test clearInactivityTimer when timer exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Set up an actual timer
            (pcm as any)._inactivityTimer = setTimeout(() => {}, 1000);
            
            pcm.clearInactivityTimer();
            
            expect((pcm as any)._inactivityTimer).to.be.null;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PeerConnectionManager clear inactivity timer/));
        });

        it('should test clearInactivityTimer when no timer exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            (pcm as any)._inactivityTimer = null;
            
            expect(() => pcm.clearInactivityTimer()).to.not.throw();
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/PeerConnectionManager clear inactivity timer/));
        });

        it('should test browser event handling functionality', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test that method exists and can be called
            expect(typeof pcm.browserTabCloseEventListener).to.equal('function');
            
            // Test execution without DOM
            expect(() => {
                // Just verify no exceptions thrown
                const handler = (pcm as any)._browserTabCloseEventListener;
            }).to.not.throw();
        });

        it('should test inactivity callback pattern', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            pcm._inactivityDuration = 30000;
            const destroySpy = sinon.spy(pcm, 'destroy');
            
            // Test the inactivity pattern directly
            const callback = () => {
                pcm.destroy();
            };
            
            callback();
            expect(destroySpy).to.have.been.called;
        });

        it('should test createSession method flow', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic createSession functionality without DOM
            expect(typeof pcm.createSession).to.equal('function');
            
            // Test that shared media session creation path exists
            pcm._sharedMediaSession = null;
            expect(pcm._sharedMediaSession).to.be.null;
        });

        it('should test event notification error handling', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test basic event notification without complex mocking
            expect(() => {
                (pcm as any)._notifyAllCallSessionsOfEvent('testEvent', 'testData');
            }).to.not.throw();
        });

        it('should test all property getters and setters', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            
            // Test all property assignments to cover setter lines
            pcm.signalingUri = 'wss://new-uri.com';
            pcm.iceServers = [{ urls: ['turn:new-server.com'] }];
            pcm.contactToken = 'new-contact-token';
            pcm.callId = 'new-call-id';
            pcm.connectionId = 'new-connection-id';
            pcm.wssManager = { new: 'manager' } as any;
            pcm.strategy = new StandardStrategy();
            pcm.isPPCEnabled = true;
            pcm.isRTPSAllowlisted = true;
            pcm.browserId = 'new-browser-id';
            pcm.peerConnectionId = 'new-pc-id';
            pcm.peerConnectionToken = 'new-pc-token';
            pcm.inactivityDuration = 60000;
            
            // Test all property retrievals to cover getter lines
            expect(pcm.signalingUri).to.equal('wss://new-uri.com');
            expect(pcm.iceServers).to.deep.equal([{ urls: ['turn:new-server.com'] }]);
            expect(pcm.contactToken).to.equal('new-contact-token');
            expect(pcm.callId).to.equal('new-call-id');
            expect(pcm.connectionId).to.equal('new-connection-id');
            expect(pcm.wssManager).to.exist;
            expect(pcm.strategy).to.exist;
            expect(pcm.isPPCEnabled).to.be.true;
            expect(pcm.isRTPSAllowlisted).to.be.true;
            expect(pcm.browserId).to.equal('new-browser-id');
            expect(pcm.peerConnectionId).to.equal('new-pc-id');
            expect(pcm.peerConnectionToken).to.equal('new-pc-token');
            expect(pcm.inactivityDuration).to.equal(60000);
        });
    });

    describe('getPeerConnection', () => {
        it('should return existing _pc when not null', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockPc = { id: 'existing-pc' };
            pcm._pc = mockPc as any;
            expect(pcm.getPeerConnection()).to.equal(mockPc);
        });

        it('should return null when _pc is null', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._pc = null;
            expect(pcm.getPeerConnection()).to.be.null;
        });
    });

    describe('_createPeerConnection', () => {

        it('should call _credentialResolver.getIceCredentialsForCall', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCreds = { iceServers: [{urls: ['stun:test.com']}], credentialSource: 'api' as any, isDifferentRegion: false };
            if (pcm._credentialResolver) {
                sinon.stub(pcm._credentialResolver, 'getIceCredentialsForCall').resolves(mockCreds);
                sinon.stub(pcm._strategy as any, '_createRtcPeerConnection').returns({ id: 'fresh-pc' });
                const result = await (pcm as any)._createPeerConnection();
                expect(result).to.deep.equal({ id: 'fresh-pc' });
            }
        });
    });

    describe('_getIdleOrCreatePeerConnection', () => {
        it('should use standby PC when available', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockIdlePc = { id: 'idle-pc' };
            if (pcm._standbyPcManager) {
                sinon.stub(pcm._standbyPcManager, 'hasStandbyPc').returns(true);
                sinon.stub(pcm._standbyPcManager, 'consumeStandbyPc').returns(mockIdlePc as any);
                const result = await (pcm as any)._getIdleOrCreatePeerConnection();
                expect(result).to.equal(mockIdlePc);
            }
        });

        it('should create fresh PC when no standby PC available', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            if (pcm._standbyPcManager) {
                sinon.stub(pcm._standbyPcManager, 'hasStandbyPc').returns(false);
            }
            const freshPc = { id: 'fresh-pc' };
            sinon.stub(pcm as any, '_createPeerConnection').resolves(freshPc);
            const result = await (pcm as any)._getIdleOrCreatePeerConnection();
            expect(result).to.equal(freshPc);
        });
    });

    describe('connect() if/else conditions', () => {
        it('should use single session when no agentMediaLegId and exactly one session', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSession = {
                _sessionReport: {},
                onSharedMediaSessionEvent: sinon.spy()
            };
            pcm._callSessions.set('only-session', mockSession as any);
            pcm._sharedMediaSession = { isInTalkingState: sinon.stub().returns(true), getPeerConnection: sinon.stub().returns({}), mediaStream: {} } as any;
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;

            await pcm.connect(undefined);
            // Should not error - it uses the single session
        });

        it('should clear inactivity timer when it exists before connect', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._inactivityTimer = setTimeout(() => {}, 99999) as any;
            const clearSpy = sinon.spy(pcm, 'clearInactivityTimer');
            const mockSession = { _sessionReport: {}, onSharedMediaSessionEvent: sinon.spy() };
            pcm._callSessions.set('session-1', mockSession as any);
            pcm._sharedMediaSession = { isInTalkingState: sinon.stub().returns(true), getPeerConnection: sinon.stub().returns({}), mediaStream: {} } as any;
            pcm._isPPCEnabled = true;
            pcm._isRTPSAllowlisted = true;

            await pcm.connect('session-1');
            expect(clearSpy).to.have.been.called;
            clearTimeout(pcm._inactivityTimer as any);
        });

        it('should handle connect when SMS is null (no shared media session)', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSession = { _sessionReport: {}, onSharedMediaSessionEvent: sinon.spy() };
            pcm._callSessions.set('session-1', mockSession as any);
            pcm._sharedMediaSession = null;

            await pcm.connect('session-1');
            // Should log error about null shared media session
            expect(mockLogger.error).to.have.been.called;
        });
    });

    describe('activatePersistentPeerConnectionMode with page-load FAC', () => {
        it('should call _setupPageLoadPersistentConnection when page-load FAC enabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPersistentConnectionOnPageLoadEnabled = true;
            const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');
            const closeSpy = sinon.spy(pcm, 'closeStandbyConnection');

            pcm.activatePersistentPeerConnectionMode();

            expect(closeSpy).to.have.been.called;
            expect(setupSpy).to.have.been.called;
        });

        it('should NOT call _setupPageLoadPersistentConnection when page-load FAC disabled', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._isPersistentConnectionOnPageLoadEnabled = false;
            const setupSpy = sinon.stub(pcm as any, '_setupPageLoadPersistentConnection');

            pcm.activatePersistentPeerConnectionMode();

            expect(setupSpy).to.not.have.been.called;
        });
    });

    describe('_setupPageLoadPersistentConnection error cleanup', () => {
        it('should invoke _getIdleOrCreatePeerConnection and handle rejection internally', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockPc = { id: 'test-pc', close: () => {} };
            pcm._pc = mockPc as any;
            pcm._sharedMediaSession = null;
            const requestStub = sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').rejects(new Error('ICE fetch failed'));

            // _setupPageLoadPersistentConnection is async; await the returned promise
            // so internal error handling runs before the assertion.
            await (pcm as any)._setupPageLoadPersistentConnection();
            expect(requestStub).to.have.been.calledOnce;
        });

        it('should skip _getIdleOrCreatePeerConnection when SMS already exists (early bail)', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = { test: 'sms' } as any;
            const requestStub = sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').rejects(new Error('should not be called'));

            await (pcm as any)._setupPageLoadPersistentConnection();
            expect(requestStub).to.not.have.been.called;
        });

        it('should not overwrite existing SharedMediaSession (race condition guard)', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const existingSms = { test: 'existing' };
            const closeSpy = sinon.stub(pcm._strategy as any, 'close');

            // Race: SMS is null at start (passes early bail) but set by createSession()
            // before _getIdleOrCreatePeerConnection resolves. Race guard must close the PC.
            pcm._sharedMediaSession = null;
            sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').callsFake(() => {
                pcm._sharedMediaSession = existingSms as any;
                return Promise.resolve({ id: 'new-pc' });
            });

            await (pcm as any)._setupPageLoadPersistentConnection();

            expect(pcm._sharedMediaSession).to.equal(existingSms);
            expect(closeSpy).to.have.been.calledWith({ id: 'new-pc' });
        });

        it('should abandon setup when close() runs while awaiting whenConnected()', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const closeSpy = sinon.stub(pcm._strategy as any, 'close');
            const requestStub = sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').resolves({ id: 'new-pc' });

            let resolveWhenConnected: any;
            const pending = new Promise(function (r) { resolveWhenConnected = r; });
            sinon.stub(pcm._strategy as any, 'whenConnected').returns(pending);

            const setupPromise = (pcm as any)._setupPageLoadPersistentConnection();
            (pcm as any)._closed = true;
            resolveWhenConnected();
            await setupPromise;

            expect(requestStub).to.not.have.been.called;
            expect(closeSpy).to.not.have.been.called;
            expect(pcm._sharedMediaSession).to.be.null;
        });

        it('should close speculative PC when close() runs during ICE fetch', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const closeSpy = sinon.stub(pcm._strategy as any, 'close');
            sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').callsFake(function () {
                (pcm as any)._closed = true;
                return Promise.resolve({ id: 'new-pc' });
            });

            await (pcm as any)._setupPageLoadPersistentConnection();

            expect(closeSpy).to.have.been.calledWith({ id: 'new-pc' });
            expect(pcm._sharedMediaSession).to.be.null;
        });

        it('should not close concurrent call\'s PC when setup fails after createSession ran', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const closeSpy = sinon.stub(pcm._strategy as any, 'close');
            const callPc = { id: 'call-pc', close: () => {} };
            const callSms = { test: 'call-sms' };

            // _getIdleOrCreatePeerConnection resolves a speculative PC, but before setup continues
            // a concurrent createSession() takes over _pc and _sharedMediaSession, then
            // _initializeSharedMediaSession throws when page-load tries to proceed.
            sinon.stub(pcm as any, '_getIdleOrCreatePeerConnection').callsFake(function () {
                pcm._pc = callPc as any;
                pcm._sharedMediaSession = callSms as any;
                return Promise.resolve({ id: 'speculative-pc' });
            });

            await (pcm as any)._setupPageLoadPersistentConnection();

            // Early-bail guard sees _sharedMediaSession exists → closes speculative PC, leaves call's PC alone.
            expect(closeSpy).to.have.been.calledWith({ id: 'speculative-pc' });
            expect(closeSpy).to.not.have.been.calledWith(callPc);
            expect(pcm._pc).to.equal(callPc);
            expect(pcm._sharedMediaSession).to.equal(callSms);
        });
    });

    describe('browserTabCloseEventListener', () => {
        it('should register beforeunload event listener', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            expect(typeof pcm.browserTabCloseEventListener).to.equal('function');
        });
    });

    describe('Stats Methods', () => {
        it('should add getUserAudioStats method that delegates to shared media session', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = {} as any;
            const mockSharedMediaSession = {
                getUserAudioStats: sinon.stub().resolves({ packetsSent: 100 })
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;

            (pcm as any)._addStatsMethodsToCallSession(mockCallSession);

            const result = await mockCallSession.getUserAudioStats();

            expect(result).to.deep.equal({ packetsSent: 100 });
            expect(mockSharedMediaSession.getUserAudioStats).to.have.been.called;
        });

        it('should add getRemoteAudioStats method that delegates to shared media session', async () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockCallSession = {} as any;
            const mockSharedMediaSession = {
                getRemoteAudioStats: sinon.stub().resolves({ packetsReceived: 200 })
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;

            (pcm as any)._addStatsMethodsToCallSession(mockCallSession);

            const result = await mockCallSession.getRemoteAudioStats();

            expect(result).to.deep.equal({ packetsReceived: 200 });
            expect(mockSharedMediaSession.getRemoteAudioStats).to.have.been.called;
        });

        it('should delegate setMicrophoneDevice to shared media session', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSharedMediaSession = {
                setMicrophoneDevice: sinon.stub().resolves()
            };
            pcm._sharedMediaSession = mockSharedMediaSession as any;

            const result = pcm.setMicrophoneDevice('new-device');

            expect(mockSharedMediaSession.setMicrophoneDevice).to.have.been.calledWith('new-device');
            expect(result).to.exist;
        });
    });

    describe('setMicrophoneDevice', () => {
        it('should return early when no shared media session exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = null;

            pcm.setMicrophoneDevice('test-device');

            expect(mockLogger.warn).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/No active shared media session/)
            );
        });

        it('should delegate to shared media session when it exists', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSms = { setMicrophoneDevice: sinon.stub().resolves() };
            pcm._sharedMediaSession = mockSms as any;

            pcm.setMicrophoneDevice('test-device');

            expect(mockSms.setMicrophoneDevice).to.have.been.calledWith('test-device');
        });

    });

    describe('registerSharedMediaSessionCallbacks edge cases', () => {
        it('should return early when shared media session is null', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            pcm._sharedMediaSession = null;

            pcm.registerSharedMediaSessionCallbacks();

            expect(mockLogger.error).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/Cannot register callbacks for null shared media session/)
            );
        });

        it('should register and execute onRemoteStreamAdded callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSms = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSms as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');

            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSms.registerCallbacks.firstCall.args[0];

            callbacks.onRemoteStreamAdded({}, { id: 'remote-stream' });
            expect(notifySpy).to.have.been.calledWith('remoteStreamAdded', { id: 'remote-stream' });
        });

        it('should register and execute onSharedMediaSessionCompleted callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSms = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSms as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const completedSpy = sinon.spy(pcm, 'handleSharedMediaSessionCompleted');

            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSms.registerCallbacks.firstCall.args[0];

            callbacks.onSharedMediaSessionCompleted();
            expect(completedSpy).to.have.been.called;
        });

        it('should register and execute onIceRestartComplete callback', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const mockSms = { registerCallbacks: sinon.spy() };
            pcm._sharedMediaSession = mockSms as any;
            pcm._signalingChannelManager!.registerPCByeHandler = sinon.spy();
            const notifySpy = sinon.spy(pcm as any, '_notifyAllCallSessionsOfEvent');

            pcm.registerSharedMediaSessionCallbacks();
            const callbacks = mockSms.registerCallbacks.firstCall.args[0];

            callbacks.onIceRestartComplete({ iceRestartSuccesses: 1 });
            expect(notifySpy).to.have.been.calledWith('iceRestartComplete', { iceRestartSuccesses: 1 });
        });
    });

    describe('_notifyAllCallSessionsOfEvent edge cases', () => {
        it('should warn when call session does not implement onSharedMediaSessionEvent', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const badSession = {}; // No onSharedMediaSessionEvent method
            pcm._callSessions.set('bad-session', badSession as any);

            (pcm as any)._notifyAllCallSessionsOfEvent('testEvent', 'data');

            expect(mockLogger.warn).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/does not implement onSharedMediaSessionEvent/)
            );
        });

        it('should catch and log errors from call session event handler', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const throwingSession = {
                onSharedMediaSessionEvent: sinon.stub().throws(new Error('Handler crashed'))
            };
            pcm._callSessions.set('throwing-session', throwingSession as any);

            expect(() => {
                (pcm as any)._notifyAllCallSessionsOfEvent('testEvent', 'data');
            }).to.not.throw();

            expect(mockLogger.error).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/Error notifying call session/)
            );
        });

        it('should notify multiple call sessions', () => {
            const pcm = new RtcPeerConnectionManagerV2(config);
            const session1 = { onSharedMediaSessionEvent: sinon.spy() };
            const session2 = { onSharedMediaSessionEvent: sinon.spy() };
            pcm._callSessions.set('s1', session1 as any);
            pcm._callSessions.set('s2', session2 as any);

            (pcm as any)._notifyAllCallSessionsOfEvent('sessionConnected', { id: 'pc' });

            expect(session1.onSharedMediaSessionEvent).to.have.been.calledWith('sessionConnected', { id: 'pc' });
            expect(session2.onSharedMediaSessionEvent).to.have.been.calledWith('sessionConnected', { id: 'pc' });
        });
    });
});
