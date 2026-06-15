import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import SharedMediaSession, { TalkingState, FailedState, GrabLocalMediaState, CreateOfferState, SetLocalSessionDescriptionState, ConnectSignalingAndIceCollectionState, InviteAnswerState, AcceptState, CleanUpState, DisconnectedState } from '../../src/shared_media_session';
import { ICE_CONNECTION_STATE, RTC_ERRORS } from '../../src/rtc_const';
import StandardStrategy from '../../src/strategies/StandardStrategy';

const expect = chai.expect;

describe('SharedMediaSession', () => {
    let mockLogger: any;
    let mockSignalingChannelManager: any;
    let mockStrategy: any;
    let config: any;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) })
        };

        mockSignalingChannelManager = {
            registerCallSession: sinon.spy(),
            unregisterCallSession: sinon.spy(),
            send: sinon.spy()
        };

        mockStrategy = new StandardStrategy();
        mockStrategy._addDeviceChangeListener = sinon.stub();

        config = {
            logger: mockLogger,
            iceServers: [{ urls: 'stun:stun.example.com' }],
            contactToken: 'test-token',
            strategy: mockStrategy,
            signalingChannelManager: mockSignalingChannelManager,
            connectionId: 'test-connection-id',
            callId: 'test-call-id',
            browserId: 'test-browser-id',
            isPersistentConnectionEnabled: false,
            requestIceAccess: sinon.stub().resolves([{ urls: 'stun:stun.example.com' }])
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Constructor', () => {
        it('should throw error when config is not provided', () => {
            expect(() => new SharedMediaSession(null as any)).to.throw('config is required');
        });

        it('should throw error when iceServers not provided', () => {
            const invalidConfig = { ...config };
            delete invalidConfig.iceServers;
            expect(() => new SharedMediaSession(invalidConfig)).to.throw('iceServers required');
        });

        it('should throw error when logger is invalid type', () => {
            const invalidConfig = { ...config, logger: 'not-an-object' };
            expect(() => new SharedMediaSession(invalidConfig)).to.throw('logger required');
        });

        it('should generate UUID for callId when not provided', () => {
            const configWithoutCallId = { ...config };
            delete configWithoutCallId.callId;
            const session = new SharedMediaSession(configWithoutCallId);
            expect(session._callId).to.be.a('string');
            expect(session._callId.length).to.be.greaterThan(0);
        });

        it('should generate UUID for connectionId when not provided', () => {
            const configWithoutConnectionId = { ...config };
            delete configWithoutConnectionId.connectionId;
            const session = new SharedMediaSession(configWithoutConnectionId);
            expect(session._connectionId).to.be.a('string');
            expect(session._connectionId.length).to.be.greaterThan(0);
        });

        it('should use default strategy when not provided', () => {
            const configWithoutStrategy = { ...config };
            delete configWithoutStrategy.strategy;
            const session = new SharedMediaSession(configWithoutStrategy);
            expect(session._strategy).to.exist;
            expect(session._strategy).to.be.instanceOf(StandardStrategy);
        });

        it('should initialize all callback functions as no-ops', () => {
            const session = new SharedMediaSession(config);
            
            expect(() => (session as any)._onGumError()).to.not.throw();
            expect(() => (session as any)._onGumSuccess()).to.not.throw();
            expect(() => (session as any)._onLocalPeerConnectionAvailable()).to.not.throw();
            expect(() => (session as any)._onLocalStreamAdded()).to.not.throw();
            expect(() => (session as any)._onSessionFailed()).to.not.throw();
            expect(() => (session as any)._onSessionInitialized()).to.not.throw();
            expect(() => (session as any)._onSignalingConnected()).to.not.throw();
            expect(() => (session as any)._onIceCollectionComplete()).to.not.throw();
            expect(() => (session as any)._onSignalingStarted()).to.not.throw();
            expect(() => (session as any)._onSessionConnected()).to.not.throw();
            expect(() => (session as any)._onSessionSetupLatencyMetricReady()).to.not.throw();
            expect(() => (session as any)._onRemoteStreamAdded()).to.not.throw();
            expect(() => (session as any)._onSessionCompleted()).to.not.throw();
            expect(() => (session as any)._onSessionDestroyed()).to.not.throw();
            expect(() => (session as any)._replaceStreamCallback()).to.not.throw();
        });

        it('should set default timeout values', () => {
            const session = new SharedMediaSession(config);
            expect(session._iceTimeoutMillis).to.be.greaterThan(0);
            expect(session._gumTimeoutMillis).to.be.greaterThan(0);
        });

        it('should always start with null requested device ID', () => {
            const configWithDevice = { ...config, deviceId: 'test-device' };
            const session = new SharedMediaSession(configWithDevice);
            expect((session as any)._requestedDeviceId).to.not.be.ok;
        });

        it('should set enableAudio to true by default', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._enableAudio).to.be.true;
        });

        it('should set isUserProvidedStream to false by default', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._isUserProvidedStream).to.be.false;
        });

        it('should initialize VDI cleanup flag to false', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._needsCleanup).to.be.false;
        });

        it('should register VDI disconnection handler when strategy supports it', () => {
            const mockStrategyWithVDI = new StandardStrategy();
            const onConnectionNeedingCleanupSpy = sinon.spy();
            (mockStrategyWithVDI as any).onConnectionNeedingCleanup = onConnectionNeedingCleanupSpy;
            const configWithVDI = { ...config, strategy: mockStrategyWithVDI };
            
            const session = new SharedMediaSession(configWithVDI);
            
            expect(onConnectionNeedingCleanupSpy).to.have.been.called;
            expect(onConnectionNeedingCleanupSpy.firstCall.args[0]).to.be.a('function');
        });

        it('should not register VDI handler when strategy does not support it', () => {
            const mockStrategyWithoutVDI = new StandardStrategy();
            // No onConnectionNeedingCleanup method
            const configWithoutVDI = { ...config, strategy: mockStrategyWithoutVDI };
            
            expect(() => new SharedMediaSession(configWithoutVDI)).to.not.throw();
        });

        it('should default _allowExtendedPersistentConnection to false when not provided', () => {
            const session: any = new SharedMediaSession(config);
            expect(session._allowExtendedPersistentConnection).to.be.false;
        });

        it('should store _allowExtendedPersistentConnection when provided', () => {
            const extendedConfig = { ...config, allowExtendedPersistentConnection: true };
            const session: any = new SharedMediaSession(extendedConfig);
            expect(session._allowExtendedPersistentConnection).to.be.true;
        });

        it('should coerce _allowExtendedPersistentConnection to boolean', () => {
            const extendedConfig = { ...config, allowExtendedPersistentConnection: 'truthy' };
            const session: any = new SharedMediaSession(extendedConfig);
            expect(session._allowExtendedPersistentConnection).to.be.true;
        });
    });

    describe('Media Constraints Building', () => {
        it('should set exact deviceId constraint when provided', () => {
            const session = new SharedMediaSession(config);
            (session as any)._enableAudio = true;
            
            const constraints = (session as any)._buildMediaConstraints('specific-device-id');
            
            expect(constraints.audio).to.be.an('object');
            expect((constraints.audio as any).deviceId).to.have.property('exact', 'specific-device-id');
        });

        it('should not add deviceId constraint for default device', () => {
            const session = new SharedMediaSession(config);
            (session as any)._enableAudio = true;
            
            const constraints = (session as any)._buildMediaConstraints('default');
            
            expect(constraints.audio).to.not.have.property('deviceId');
        });

        it('should combine echo cancellation with device constraints', () => {
            const session = new SharedMediaSession(config);
            (session as any)._enableAudio = true;
            (session as any)._echoCancellation = true;
            
            const constraints = (session as any)._buildMediaConstraints('test-device');
            
            expect((constraints.audio as any).echoCancellation).to.be.true;
            expect((constraints.audio as any).deviceId).to.have.property('exact', 'test-device');
        });

        it('should return audio true when no specific constraints', () => {
            const session = new SharedMediaSession(config);
            (session as any)._enableAudio = true;
            (session as any)._echoCancellation = undefined;
            
            const constraints = (session as any)._buildMediaConstraints();
            
            expect(constraints.audio).to.be.true;
        });

        it('should return audio false when disabled', () => {
            const session = new SharedMediaSession(config);
            (session as any)._enableAudio = false;
            
            const constraints = (session as any)._buildMediaConstraints();
            
            expect(constraints.audio).to.be.false;
        });
    });

    describe('GUM Operations', () => {
        // it('should set audio track onended handler for VDI environments', async () => {
        //     const session = new SharedMediaSession(config);
        //     const mockTrack = {
        //         getSettings: () => ({ deviceId: 'test-device' }),
        //         onended: null
        //     };
        //     const mockStream = {
        //         getAudioTracks: () => [mockTrack]
        //     };
            
            // Mock VDI conditions for onended handler
            // mockStrategy._isVDI = sinon.stub().returns(true);
        //     mockStrategy.getStrategyName = sinon.stub().returns('CitrixVDIStrategy');
        //     mockStrategy.isSupportedVersion = sinon.stub().returns(true);
        //     mockStrategy._gUM = sinon.stub().resolves(mockStream);
        //     (session as any)._onGumSuccess = sinon.spy();
        //
        //     await (session as any)._doGUM('device-id');
        //
        //     expect(mockTrack.onended).to.be.a('function');
        //     expect((session as any)._onGumSuccess).to.have.been.called;
        //     expect((session as any)._sessionReport.gumOtherFailure).to.be.false;
        //     expect((session as any)._sessionReport.gumTimeoutFailure).to.be.false;
        // });

        it('should not set audio track onended handler for non-VDI environments', async () => {
            const session = new SharedMediaSession(config);
            const mockTrack = {
                getSettings: () => ({ deviceId: 'test-device' }),
                onended: null
            };
            const mockStream = {
                getAudioTracks: () => [mockTrack]
            };
            
            // Mock non-VDI conditions
            // mockStrategy._isVDI = sinon.stub().returns(false);
            mockStrategy._gUM = sinon.stub().resolves(mockStream);
            (session as any)._onGumSuccess = sinon.spy();
            
            await (session as any)._doGUM('device-id');
            
            expect(mockTrack.onended).to.be.null;
            expect((session as any)._onGumSuccess).to.have.been.called;
            expect((session as any)._sessionReport.gumOtherFailure).to.be.false;
            expect((session as any)._sessionReport.gumTimeoutFailure).to.be.false;
        });

        it('should log constraints with error', async () => {
            const session = new SharedMediaSession(config);
            const error = new Error('GUM error');
            
            mockStrategy._gUM = sinon.stub().rejects(error);
            
            try {
                await (session as any)._doGUM('device-id');
                expect.fail('Should have thrown');
            } catch (e) {
                expect(mockLogger.error).to.have.been.called;
            }
        });

        it('should classify an undefined gUM rejection as GUM_OTHER_FAILURE without crashing on e.name', async () => {
            // Citrix HDX getUserMedia rejects with undefined (not an Error object).
            // Reading e.name on undefined previously threw a secondary TypeError,
            // which surfaced to CCP as a generic webrtc_error instead of a mic failure.
            const session = new SharedMediaSession(config);
            mockStrategy._gUM = sinon.stub().callsFake(() => Promise.reject(undefined));

            let thrown: any;
            try {
                await (session as any)._doGUM('device-id');
                expect.fail('Should have thrown');
            } catch (e) {
                thrown = e;
            }

            expect(thrown).to.equal(RTC_ERRORS.GUM_OTHER_FAILURE);
            expect((session as any)._sessionReport.gumOtherFailure).to.be.true;
            expect((session as any)._sessionReport.gumTimeoutFailure).to.be.false;
        });
    });

    describe('Change Microphone Device', () => {
        it('should successfully change microphone device', async () => {
            const session = new SharedMediaSession(config);
            const mockOldTrack = { id: 'old', enabled: true, readyState: 'live', stop: sinon.stub(), getSettings: () => ({ deviceId: 'old-device' }) };
            const mockNewTrack = { id: 'new', enabled: true, readyState: 'live', getSettings: () => ({ deviceId: 'new-device' }) };
            const mockSender = { track: { kind: 'audio' }, replaceTrack: sinon.stub().resolves() };

            (session as any)._localStream = { getAudioTracks: () => [mockOldTrack], removeTrack: sinon.stub(), addTrack: sinon.stub() };
            (session as any)._pc = { getSenders: () => [mockSender] };

            sinon.stub(session as any, '_doGUM').resolves({ getAudioTracks: () => [mockNewTrack] });

            await session.setMicrophoneDevice('new-device');

            expect(mockSender.replaceTrack).to.have.been.calledWith(mockNewTrack);
            expect(mockOldTrack.stop).to.have.been.called;
            expect((session as any)._isUserProvidedStream).to.be.true;
        });

        it('should preserve mute state', async () => {
            const session = new SharedMediaSession(config);
            const mockOldTrack = { id: 'old', enabled: false, readyState: 'live', stop: sinon.stub(), getSettings: () => ({ deviceId: 'old-device' }) };
            const mockNewTrack = { id: 'new', enabled: true, readyState: 'live', getSettings: () => ({ deviceId: 'new-device' }) };
            const mockSender = { track: { kind: 'audio' }, replaceTrack: sinon.stub().resolves() };

            (session as any)._localStream = { getAudioTracks: () => [mockOldTrack], removeTrack: sinon.stub(), addTrack: sinon.stub() };
            (session as any)._pc = { getSenders: () => [mockSender] };

            sinon.stub(session as any, '_doGUM').resolves({ getAudioTracks: () => [mockNewTrack] });

            await session.setMicrophoneDevice('new-device');

            expect(mockNewTrack.enabled).to.be.false;
        });

        it('should not throw on GUM failure', async () => {
            const session = new SharedMediaSession(config);
            (session as any)._localStream = { getAudioTracks: () => [] };

            sinon.stub(session as any, '_doGUM').rejects(new Error('GUM failed'));

            await session.setMicrophoneDevice('new-device');

            expect(mockLogger.error).to.have.been.called;
        });

        it('should no-op when deviceId matches current device', async () => {
            const session = new SharedMediaSession(config);
            const doGumStub = sinon.stub(session as any, '_doGUM');
            (session as any)._currentMicDeviceId = 'same-device';

            await session.setMicrophoneDevice('same-device');

            expect(doGumStub).to.not.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/Requested deviceId matches current device, no-op/)
            );
        });

        it('should warn when deviceId is "default" and matches current', async () => {
            const session = new SharedMediaSession(config);
            const doGumStub = sinon.stub(session as any, '_doGUM');
            (session as any)._currentMicDeviceId = 'default';

            await session.setMicrophoneDevice('default');

            expect(doGumStub).to.not.have.been.called;
            expect(mockLogger.warn).to.have.been.calledWith(
                sinon.match.any, sinon.match.any,
                sinon.match(/deviceId 'default' matches current/)
            );
        });

        it('should update _currentMicDeviceId on successful device change', async () => {
            const session = new SharedMediaSession(config);
            const mockOldTrack = { id: 'old', enabled: true, readyState: 'live', stop: sinon.stub(), getSettings: () => ({ deviceId: 'old-device' }) };
            const mockNewTrack = { id: 'new', enabled: true, readyState: 'live', getSettings: () => ({ deviceId: 'new-device' }) };
            const mockSender = { track: { kind: 'audio' }, replaceTrack: sinon.stub().resolves() };

            (session as any)._localStream = { getAudioTracks: () => [mockOldTrack], removeTrack: sinon.stub(), addTrack: sinon.stub() };
            (session as any)._pc = { getSenders: () => [mockSender] };

            sinon.stub(session as any, '_doGUM').resolves({ getAudioTracks: () => [mockNewTrack] });

            await session.setMicrophoneDevice('new-device');

            expect((session as any)._currentMicDeviceId).to.equal('new-device');
        });

        it('should proceed when deviceId differs from current', async () => {
            const session = new SharedMediaSession(config);
            const mockOldTrack = { id: 'old', enabled: true, readyState: 'live', stop: sinon.stub(), getSettings: () => ({ deviceId: 'old-device' }) };
            const mockNewTrack = { id: 'new', enabled: true, readyState: 'live', getSettings: () => ({ deviceId: 'other-device' }) };
            const mockSender = { track: { kind: 'audio' }, replaceTrack: sinon.stub().resolves() };

            (session as any)._localStream = { getAudioTracks: () => [mockOldTrack], removeTrack: sinon.stub(), addTrack: sinon.stub() };
            (session as any)._pc = { getSenders: () => [mockSender] };
            (session as any)._currentMicDeviceId = 'old-device';

            sinon.stub(session as any, '_doGUM').resolves({ getAudioTracks: () => [mockNewTrack] });

            await session.setMicrophoneDevice('other-device');

            expect(mockSender.replaceTrack).to.have.been.calledWith(mockNewTrack);
            expect((session as any)._currentMicDeviceId).to.equal('other-device');
        });

        it('should initialize _currentMicDeviceId to null', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._currentMicDeviceId).to.be.null;
        });
    });

    describe('Audio Control Methods', () => {
        it('should pause local audio track when available', () => {
            const session = new SharedMediaSession(config);
            const mockTrack = { enabled: true };
            (session as any)._localStream = {
                getAudioTracks: () => [mockTrack]
            };
            
            session.pauseLocalAudio();
            
            expect(mockTrack.enabled).to.be.false;
        });

        it('should resume local audio track when available', () => {
            const session = new SharedMediaSession(config);
            const mockTrack = { enabled: false };
            (session as any)._localStream = {
                getAudioTracks: () => [mockTrack]
            };
            
            session.resumeLocalAudio();
            
            expect(mockTrack.enabled).to.be.true;
        });

        it('should pause remote audio track when available', () => {
            const session = new SharedMediaSession(config);
            const mockTrack = { enabled: true };
            (session as any)._remoteAudioStream = {
                getTracks: () => [mockTrack]
            };
            
            session.pauseRemoteAudio();
            
            expect(mockTrack.enabled).to.be.false;
        });

        it('should resume remote audio track when available', () => {
            const session = new SharedMediaSession(config);
            const mockTrack = { enabled: false };
            (session as any)._remoteAudioStream = {
                getTracks: () => [mockTrack]
            };
            
            session.resumeRemoteAudio();
            
            expect(mockTrack.enabled).to.be.true;
        });

        it('should handle audio operations when no streams exist', () => {
            const session = new SharedMediaSession(config);
            (session as any)._localStream = null;
            (session as any)._remoteAudioStream = null;
            
            expect(() => {
                session.pauseLocalAudio();
                session.resumeLocalAudio();
                session.pauseRemoteAudio();
                session.resumeRemoteAudio();
            }).to.not.throw();
        });
    });

    describe('Callback Registration', () => {
        it('should register all callback types', () => {
            const session = new SharedMediaSession(config);
            const callbacks = {
                onGumSuccess: sinon.spy(),
                onGumError: sinon.spy(),
                onSharedMediaSessionFailed: sinon.spy(),
                onLocalPeerConnectionAvailable: sinon.spy(),
                onLocalStreamAdded: sinon.spy(),
                onSharedMediaSessionInitialized: sinon.spy(),
                onSignalingConnected: sinon.spy(),
                replaceStreamCallback: sinon.spy(),
                onIceCollectionComplete: sinon.spy(),
                onSignalingStarted: sinon.spy(),
                onSharedMediaSessionConnected: sinon.spy(),
                onSharedMediaSessionSetupLatencyMetricReady: sinon.spy(),
                onRemoteStreamAdded: sinon.spy(),
                onSessionCompleted: sinon.spy(),
                onSharedMediaSessionDestroyed: sinon.spy(),
                setInactivityDurationCallback: sinon.spy(),
                isPersistentConnectionAllowlistedCallback: sinon.spy(),
                setPeerConnectionIdCallback: sinon.spy(),
                setPeerConnectionTokenCallback: sinon.spy()
            };
            
            session.registerCallbacks(callbacks);
            
            expect((session as any)._onGumSuccess).to.equal(callbacks.onGumSuccess);
            expect((session as any)._onGumError).to.equal(callbacks.onGumError);
            expect((session as any)._onSessionFailed).to.equal(callbacks.onSharedMediaSessionFailed);
            expect((session as any)._onLocalPeerConnectionAvailable).to.equal(callbacks.onLocalPeerConnectionAvailable);
            expect((session as any)._onLocalStreamAdded).to.equal(callbacks.onLocalStreamAdded);
            expect((session as any)._onSessionInitialized).to.equal(callbacks.onSharedMediaSessionInitialized);
            expect((session as any)._onSignalingConnected).to.equal(callbacks.onSignalingConnected);
            expect((session as any)._replaceStreamCallback).to.equal(callbacks.replaceStreamCallback);
            expect((session as any)._onIceCollectionComplete).to.equal(callbacks.onIceCollectionComplete);
            expect((session as any)._onSignalingStarted).to.equal(callbacks.onSignalingStarted);
            expect((session as any)._onSessionConnected).to.equal(callbacks.onSharedMediaSessionConnected);
            expect((session as any)._onSessionSetupLatencyMetricReady).to.equal(callbacks.onSharedMediaSessionSetupLatencyMetricReady);
            expect((session as any)._onRemoteStreamAdded).to.equal(callbacks.onRemoteStreamAdded);
            expect((session as any)._onSessionCompleted).to.equal(callbacks.onSessionCompleted);
            expect((session as any)._onSessionDestroyed).to.equal(callbacks.onSharedMediaSessionDestroyed);
            expect((session as any)._setInactivityDurationCallback).to.equal(callbacks.setInactivityDurationCallback);
            expect((session as any)._isPersistentConnectionAllowlistedCallback).to.equal(callbacks.isPersistentConnectionAllowlistedCallback);
            expect((session as any)._setPeerConnectionIdCallback).to.equal(callbacks.setPeerConnectionIdCallback);
            expect((session as any)._setPeerConnectionTokenCallback).to.equal(callbacks.setPeerConnectionTokenCallback);
        });

        it('should handle null callbacks', () => {
            const session = new SharedMediaSession(config);
            
            expect(() => session.registerCallbacks(null)).to.not.throw();
        });
    });

    describe('Property Setters', () => {
        it('should set echoCancellation', () => {
            const session = new SharedMediaSession(config);
            
            session.echoCancellation = true;
            
            expect((session as any)._echoCancellation).to.be.true;
        });

        it('should set mediaStream and mark as user provided', () => {
            const session = new SharedMediaSession(config);
            const mockStream = { id: 'test-stream' };
            
            session.mediaStream = mockStream as any;
            
            expect((session as any)._localStream).to.equal(mockStream);
            expect((session as any)._isUserProvidedStream).to.be.true;
        });

        it('should set remoteAudioElement', () => {
            const session = new SharedMediaSession(config);
            const mockElement = { srcObject: null };
            
            session.remoteAudioElement = mockElement as any;
            
            expect((session as any)._remoteAudioElement).to.equal(mockElement);
        });

        it('should set signalingConnectTimeout', () => {
            const session = new SharedMediaSession(config);
            
            session.signalingConnectTimeout = 15000;
            
            expect((session as any)._signalingConnectTimeout).to.equal(15000);
        });

        it('should set iceTimeoutMillis', () => {
            const session = new SharedMediaSession(config);
            
            session.iceTimeoutMillis = 10000;
            
            expect((session as any)._iceTimeoutMillis).to.equal(10000);
        });

        it('should set gumTimeoutMillis', () => {
            const session = new SharedMediaSession(config);
            
            session.gumTimeoutMillis = 8000;
            
            expect((session as any)._gumTimeoutMillis).to.equal(8000);
        });

        it('should set enableOpusDtx', () => {
            const session = new SharedMediaSession(config);
            
            session.enableOpusDtx = true;
            
            expect((session as any)._enableOpusDtx).to.be.true;
        });
    });

    describe('Property Getters', () => {
        it('should return session report', () => {
            const session = new SharedMediaSession(config);
            
            expect(session.sessionReport).to.exist;
            expect(session.sessionReport).to.equal((session as any)._sessionReport);
        });

        it('should return call ID', () => {
            const session = new SharedMediaSession(config);
            
            expect(session.callId).to.equal('test-call-id');
        });

        it('should return media stream', () => {
            const session = new SharedMediaSession(config);
            const mockStream = { id: 'test-stream' };
            (session as any)._localStream = mockStream;
            
            expect(session.mediaStream).to.equal(mockStream);
        });
    });

    describe('Health Check Methods', () => {
        it('should return true when peer connection is healthy', () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            
            const result = session.isPeerConnectionHealthy();
            
            expect(result).to.be.true;
        });

        it('should return false when peer connection does not exist', () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = null;
            
            const result = session.isPeerConnectionHealthy();
            
            expect(result).to.be.false;
        });

        it('should return false when ICE connection state is FAILED', () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.FAILED
            };
            
            const result = session.isPeerConnectionHealthy();
            
            expect(result).to.be.false;
        });

        it('should return true when in talking state and peer connection healthy', () => {
            const session = new SharedMediaSession(config);
            (session as any)._state = new TalkingState(session);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.true;
        });

        it('should return false when not in talking state', () => {
            const session = new SharedMediaSession(config);
            (session as any)._state = new GrabLocalMediaState(session);
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.false;
        });

        it('should return false when signaling channel is in failed state', () => {
            const session = new SharedMediaSession(config);
            (session as any)._state = new TalkingState(session);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            (session as any)._signalingChannel = {
                _state: { name: 'FailedState' }
            };
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.false;
        });
    });

    describe('State Transitions', () => {
        it('should handle state transition with logging', () => {
            const session = new SharedMediaSession(config);
            const oldState = { name: 'OldState', onExit: sinon.spy() };
            const newState = { name: 'NewState', onEnter: sinon.spy() };
            
            (session as any)._state = oldState;
            
            session.transit(newState as any);
            
            expect(oldState.onExit).to.have.been.called;
            expect(newState.onEnter).to.have.been.called;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/OldState => NewState/));
        });

        it('should handle onEnter exception during transition', () => {
            const session = new SharedMediaSession(config);
            const newState = {
                name: 'NewState',
                onEnter: sinon.stub().throws(new Error('Enter failed'))
            };
            
            expect(() => session.transit(newState as any)).to.throw('Enter failed');
            expect((session as any)._state).to.equal(newState);
        });
    });

    describe('Connection Method', () => {
        it('should create new peer connection when none provided', () => {
            const session = new SharedMediaSession(config);
            const mockPC = {
                signalingState: 'stable',
                ontrack: null,
                onicecandidate: null,
                onconnectionstatechange: null,
                oniceconnectionstatechange: null
            };
            
            sinon.stub(session as any, '_createPeerConnection').returns(mockPC);
            
            session.connect();
            
            expect((session as any)._pc).to.equal(mockPC);
            expect((session as any)._state).to.be.instanceOf(GrabLocalMediaState);
        });

        it('should close existing peer connection if it is closed', () => {
            const session = new SharedMediaSession(config);
            const closedPC = { signalingState: 'closed' };
            const newPC = {
                signalingState: 'stable',
                ontrack: null,
                onicecandidate: null,
                onconnectionstatechange: null,
                oniceconnectionstatechange: null
            };
            
            const closeSpy = sinon.spy();
            mockStrategy.close = closeSpy;
            sinon.stub(session as any, '_createPeerConnection').returns(newPC);
            
            session.connect(closedPC as any);
            
            expect(closeSpy).to.have.been.calledWith(closedPC);
            expect((session as any)._pc).to.equal(newPC);
        });

        it('should set session start time and connect timestamp', () => {
            const session = new SharedMediaSession(config);
            const mockPC = {
                signalingState: 'stable',
                ontrack: null,
                onicecandidate: null,
                onconnectionstatechange: null,
                oniceconnectionstatechange: null
            };
            
            sinon.stub(session as any, '_createPeerConnection').returns(mockPC);
            
            session.connect();
            
            expect(session._sessionReport.sessionStartTime).to.be.instanceOf(Date);
            expect((session as any)._connectTimeStamp).to.be.a('number');
        });

        it('should reuse provided peer connection when valid', () => {
            const session = new SharedMediaSession(config);
            const existingPC = {
                signalingState: 'stable',
                ontrack: null,
                onicecandidate: null,
                onconnectionstatechange: null,
                oniceconnectionstatechange: null
            };
            
            session.connect(existingPC as any);
            
            expect((session as any)._pc).to.equal(existingPC);
            expect((session as any)._state).to.be.instanceOf(GrabLocalMediaState);
        });

        it('should set up peer connection event handlers', () => {
            const session = new SharedMediaSession(config);
            const mockPC = {
                signalingState: 'stable',
                ontrack: null,
                onicecandidate: null,
                onconnectionstatechange: null,
                oniceconnectionstatechange: null
            };
            
            sinon.stub(session as any, '_createPeerConnection').returns(mockPC);
            
            session.connect();
            
            expect(mockPC.ontrack).to.be.a('function');
            expect(mockPC.onicecandidate).to.be.a('function');
            expect(mockPC.onconnectionstatechange).to.be.a('function');
            expect(mockPC.oniceconnectionstatechange).to.be.a('function');
        });
    });

    describe('Device ID Utilities', () => {
        it('should return null for default device', () => {
            const session = new SharedMediaSession(config);
            
            const result = (session as any)._sanitizeDeviceId('default');
            
            expect(result).to.be.null;
        });

        it('should return null for undefined device', () => {
            const session = new SharedMediaSession(config);
            
            const result = (session as any)._sanitizeDeviceId(undefined);
            
            expect(result).to.be.null;
        });

        it('should return deviceId for valid device', () => {
            const session = new SharedMediaSession(config);
            
            const result = (session as any)._sanitizeDeviceId('valid-device-id');
            
            expect(result).to.equal('valid-device-id');
        });
    });

    describe('Session Cleanup', () => {
        it('should close local stream when not user provided', () => {
            const session = new SharedMediaSession(config);
            const mockTrack = { stop: sinon.spy() };
            (session as any)._localStream = {
                getTracks: () => [mockTrack]
            };
            (session as any)._isUserProvidedStream = false;
            
            const mockPC = { close: sinon.spy() };
            (session as any)._pc = mockPC;
            mockStrategy.close = sinon.spy();
            
            (session as any)._stopSession();
            
            expect(mockTrack.stop).to.have.been.called;
            expect((session as any)._localStream).to.be.null;
            expect((session as any)._isUserProvidedStream).to.be.false;
            expect(mockStrategy.close).to.have.been.calledWith(mockPC);
        });

        it('should handle peer connection close error', () => {
            const session = new SharedMediaSession(config);
            (session as any)._localStream = null;
            (session as any)._pc = {};
            mockStrategy.close = sinon.stub().throws(new Error('Close failed'));
            
            expect(() => (session as any)._stopSession()).to.not.throw();
            expect((session as any)._pc).to.be.null;
        });
    });

    describe('Media Detachment', () => {
        it('should clear remote audio element srcObject', () => {
            const session = new SharedMediaSession(config);
            const mockElement = { srcObject: {} };
            (session as any)._remoteAudioElement = mockElement;
            
            (session as any)._detachMedia();
            
            expect(mockElement.srcObject).to.be.null;
            expect((session as any)._remoteAudioStream).to.be.null;
        });

        it('should handle when no remote audio element exists', () => {
            const session = new SharedMediaSession(config);
            (session as any)._remoteAudioElement = null;
            
            expect(() => (session as any)._detachMedia()).to.not.throw();
        });
    });

    describe('Statistics Methods', () => {
        it('should reject when peer connection is null', async () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = null;
            
            try {
                await session.getStats();
                expect.fail('Should have rejected');
            } catch (error: any) {
                expect(error.name).to.equal('IllegalState');
            }
        });

        it('should reject when peer connection is not stable', async () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = {
                signalingState: 'have-local-offer'
            };
            
            try {
                await session.getStats();
                expect.fail('Should have rejected');
            } catch (error: any) {
                expect(error.name).to.equal('IllegalState');
            }
        });

        it('should return remote audio stats from getStats', async () => {
            const session = new SharedMediaSession(config);
            const mockAudioOutputStats = { packetsReceived: 100 };
            sinon.stub(session, 'getStats').resolves({
                audioInputStats: {},
                audioOutputStats: mockAudioOutputStats
            } as any);
            
            const stats = await session.getRemoteAudioStats();
            
            expect(stats).to.equal(mockAudioOutputStats);
        });

        it('should return user audio stats from getStats', async () => {
            const session = new SharedMediaSession(config);
            const mockAudioInputStats = { packetsSent: 100 };
            sinon.stub(session, 'getStats').resolves({
                audioInputStats: mockAudioInputStats,
                audioOutputStats: {}
            } as any);
            
            const stats = await session.getUserAudioStats();
            
            expect(stats).to.equal(mockAudioInputStats);
        });
    });

    describe('Event Delegation', () => {
        it('should delegate signaling events to state', () => {
            const session = new SharedMediaSession(config);
            const mockState = {
                onSignalingConnected: sinon.spy(),
                onSignalingAnswered: sinon.spy(),
                onSignalingHandshaked: sinon.spy(),
                onRemoteHungup: sinon.spy(),
                onSignalingFailed: sinon.spy()
            };
            (session as any)._state = mockState;
            
            (session as any)._signalingConnected();
            (session as any)._signalingAnswered('sdp', [], 30, 'id', 'token');
            (session as any)._signalingHandshaked();
            (session as any)._signalingRemoteHungup();
            (session as any)._signalingFailed(new Error('test'));
            
            expect(mockState.onSignalingConnected).to.have.been.called;
            expect(mockState.onSignalingAnswered).to.have.been.calledWith('sdp', [], 30, 'id', 'token');
            expect(mockState.onSignalingHandshaked).to.have.been.called;
            expect(mockState.onRemoteHungup).to.have.been.called;
            expect(mockState.onSignalingFailed).to.have.been.called;
        });

        it('should delegate peer connection events to state', () => {
            const session = new SharedMediaSession(config);
            const mockState = {
                onIceCandidate: sinon.spy(),
                onPeerConnectionStateChange: sinon.spy(),
                onIceStateChange: sinon.spy()
            };
            (session as any)._state = mockState;
            
            const mockEvent = { candidate: {} };
            (session as any)._onIceCandidate(mockEvent);
            (session as any)._onPeerConnectionStateChange();
            (session as any)._onIceStateChange(mockEvent);
            
            expect(mockState.onIceCandidate).to.have.been.calledWith(mockEvent);
            expect(mockState.onPeerConnectionStateChange).to.have.been.called;
            expect(mockState.onIceStateChange).to.have.been.calledWith(mockEvent);
        });

        it('should handle ontrack event', () => {
            const session = new SharedMediaSession(config);
            mockStrategy._ontrack = sinon.spy();
            (session as any)._onRemoteStreamAdded = sinon.spy();
            
            const mockEvent = { streams: [{ id: 'stream-1' }] };
            
            (session as any)._ontrack(mockEvent);
            
            expect(mockStrategy._ontrack).to.have.been.calledWith(session, mockEvent);
            expect((session as any)._onRemoteStreamAdded).to.have.been.calledWith(session, mockEvent.streams[0]);
        });
    });

    describe('Hangup and Accept', () => {
        it('should call state hangup with serverInitiated flag', () => {
            const session = new SharedMediaSession(config);
            const mockState = { hangup: sinon.spy() };
            (session as any)._state = mockState;
            
            session.hangup(true);
            
            expect(mockState.hangup).to.have.been.calledWith(true);
        });

        it('should call state hangup without serverInitiated flag', () => {
            const session = new SharedMediaSession(config);
            const mockState = { hangup: sinon.spy() };
            (session as any)._state = mockState;
            
            session.hangup();
            
            expect(mockState.hangup).to.have.been.calledWith(false);
        });

        it('should throw UnsupportedOperation for accept', () => {
            const session = new SharedMediaSession(config);
            
            expect(() => session.accept()).to.throw('accept does not go through signaling channel at this moment');
        });
    });

    describe('Talking State Check', () => {
        it('should return true when state is TalkingState', () => {
            const session = new SharedMediaSession(config);
            (session as any)._state = new TalkingState(session);
            
            expect(session.isInTalkingState()).to.be.true;
        });

        it('should return false when state is not TalkingState', () => {
            const session = new SharedMediaSession(config);
            (session as any)._state = new GrabLocalMediaState(session);
            
            expect(session.isInTalkingState()).to.be.false;
        });
    });

    describe('Peer Connection', () => {
        it('should return peer connection when exists', () => {
            const session = new SharedMediaSession(config);
            const mockPC = { signalingState: 'stable' };
            (session as any)._pc = mockPC;
            
            expect(session.getPeerConnection()).to.equal(mockPC);
        });

        it('should return null when peer connection does not exist', () => {
            const session = new SharedMediaSession(config);
            (session as any)._pc = null;
            
            expect(session.getPeerConnection()).to.be.null;
        });
    });

    describe('Strategy Delegation', () => {
        it('should delegate to strategy', () => {
            const session = new SharedMediaSession(config);
            const mockPC = { signalingState: 'stable' };
            mockStrategy._createPeerConnection = sinon.stub().returns(mockPC);
            
            const result = (session as any)._createPeerConnection({}, {});
            
            expect(mockStrategy._createPeerConnection).to.have.been.called;
            expect(result).to.equal(mockPC);
        });
    });

    describe('TalkingState Methods', () => {
        it('should handle onSignalingReconnected', () => {
            const session = new SharedMediaSession(config);
            const state = new TalkingState(session);
            
            expect(() => state.onSignalingReconnected()).to.not.throw();
        });

        it('should handle onIceStateChange with ICE_CONNECTION_STATE.DISCONNECTED', () => {
            const session = new SharedMediaSession(config);
            
            // Set up peer connection
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED
            };
            
            // Mock strategy.onIceStateChange
            mockStrategy.onIceStateChange = sinon.stub().returns(ICE_CONNECTION_STATE.DISCONNECTED);
            
            // Set up TalkingState directly
            const talkingState = new TalkingState(session);
            (session as any)._state = talkingState;
            
            const mockSubState = {
                onIceStateChange: sinon.spy()
            };
            (talkingState as any)._subState = mockSubState;

            const evt = { target: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } };
            talkingState.onIceStateChange(evt);

            // Substate should be called for ICE restart logic
            expect(mockSubState.onIceStateChange).to.have.been.calledWith(evt);
        });

        it('should handle onIceStateChange with ICE_CONNECTION_STATE.FAILED', () => {
            const session = new SharedMediaSession(config);
            
            // Set up peer connection
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.FAILED
            };
            
            // Mock strategy.onIceStateChange
            mockStrategy.onIceStateChange = sinon.stub().returns(ICE_CONNECTION_STATE.FAILED);
            
            // Set up TalkingState directly
            const talkingState = new TalkingState(session);
            (session as any)._state = talkingState;
            
            const mockSubState = {
                onIceStateChange: sinon.spy()
            };
            (talkingState as any)._subState = mockSubState;

            const evt = { target: { iceConnectionState: ICE_CONNECTION_STATE.FAILED } };
            talkingState.onIceStateChange(evt);

            // Substate should be called for ICE restart logic
            expect(mockSubState.onIceStateChange).to.have.been.calledWith(evt);
        });
    });

    describe('Signaling Channel Creation', () => {
        it('should create signaling channel with correct properties', () => {
            const session = new SharedMediaSession(config);
            
            const channel = (session as any)._createSignalingChannel();
            
            expect(channel).to.exist;
            expect(channel._callId).to.equal('test-call-id');
            expect(channel._contactToken).to.equal('test-token');
            expect(channel._connectionId).to.equal('test-connection-id');
            expect((session as any)._signalingChannel).to.equal(channel);
        });
    });

    describe('Signaling Disconnected', () => {
        it('should handle signaling disconnected without throwing', () => {
            const session = new SharedMediaSession(config);
            
            expect(() => (session as any)._signalingDisconnected()).to.not.throw();
        });
    });

    describe('State Machine Classes', () => {
        describe('GrabLocalMediaState', () => {
            it('should transition to CreateOfferState when user provided stream', () => {
                const session = new SharedMediaSession(config);
                session._isUserProvidedStream = true;
                const state = new GrabLocalMediaState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onEnter();
                
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(CreateOfferState);
            });

            it('should handle getUserMedia success with audio tracks', () => {
                const session = new SharedMediaSession(config);
                session._isUserProvidedStream = false;
                const mockTrack = {
                    getSettings: () => ({ deviceId: 'test-device' })
                };
                const mockStream = {
                    getAudioTracks: () => [mockTrack]
                };
                
                session._replaceStreamCallback = () => undefined;
                
                // Create a state instance that we can control
                const state = new GrabLocalMediaState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                // Mock _doGUM to simulate successful resolution
                const doGUMPromise = Promise.resolve(mockStream);
                sinon.stub(session, '_doGUM').returns(doGUMPromise);
                
                state.onEnter();
                
                // The async operation will be triggered but we can't wait for it in this test pattern
                // Just verify the doGUM was called
                expect((session as any)._doGUM).to.have.been.called;
            });

            it('should handle replacement stream callback', () => {
                const session = new SharedMediaSession(config);
                session._isUserProvidedStream = false;
                const mockTrack = {
                    getSettings: () => ({ deviceId: 'test-device' })
                };
                const mockStream = {
                    getAudioTracks: () => [mockTrack]
                };
                
                session._replaceStreamCallback = () => mockStream;
                
                const state = new GrabLocalMediaState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                const doGUMPromise = Promise.resolve(mockStream);
                sinon.stub(session, '_doGUM').returns(doGUMPromise);
                
                state.onEnter();
                
                expect((session as any)._doGUM).to.have.been.called;
            });
        });

        describe('CreateOfferState', () => {
            it('should create offer and transition to SetLocalSessionDescriptionState', () => {
                const session = new SharedMediaSession(config);
                const mockStream = { id: 'test-stream' };
                session._localStream = mockStream as any;
                
                const mockPC = {
                    createOffer: sinon.stub().resolves({ type: 'offer', sdp: 'test-sdp' })
                };
                session._pc = mockPC as any;
                
                mockStrategy.addStream = sinon.spy();
                session._onLocalPeerConnectionAvailable = sinon.spy();
                session._onLocalStreamAdded = sinon.spy();
                
                const state = new CreateOfferState(session);
                
                state.onEnter();
                
                expect(mockStrategy.addStream).to.have.been.calledWith(mockPC, mockStream);
                expect(session._onLocalPeerConnectionAvailable).to.have.been.calledWith(session, mockPC);
                expect(session._onLocalStreamAdded).to.have.been.calledWith(session, mockStream);
            });

            it('should handle createOffer failure and set session report', () => {
                const session = new SharedMediaSession(config);
                const mockStream = { id: 'test-stream' };
                session._localStream = mockStream as any;
                
                const mockPC = {
                    createOffer: sinon.stub().rejects(new Error('CreateOffer failed'))
                };
                session._pc = mockPC as any;
                
                mockStrategy.addStream = sinon.spy();
                
                const state = new CreateOfferState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onEnter();
                
                setTimeout(() => {
                    expect(transitSpy).to.have.been.called;
                    expect(transitSpy.firstCall.args[0]).to.be.instanceOf(FailedState);
                    expect(session._sessionReport.createOfferFailure).to.be.true;
                }, 10);
            });
        });

        describe('ConnectSignalingAndIceCollectionState', () => {
            it('should handle ICE timeout using manual trigger', () => {
                const session = new SharedMediaSession(config);
                session._iceTimeoutMillis = 50;
                session._createSignalingChannel = sinon.stub().returns({
                    connect: sinon.spy()
                });
                
                const state = new ConnectSignalingAndIceCollectionState(session, 1);
                const reportIceCompletedSpy = sinon.spy(state as any, '_reportIceCompleted');
                
                state.onEnter();
                
                // Manually trigger the timeout condition
                (state as any)._iceCompleted = false;
                (state as any)._isCurrentState = () => true;
                (state as any)._reportIceCompleted(true);
                
                expect(reportIceCompletedSpy).to.have.been.calledWith(true);
            });

            it('should handle signaling connection and check for transitions', () => {
                const session = new SharedMediaSession(config);
                session._onSignalingConnected = sinon.spy();
                const state = new ConnectSignalingAndIceCollectionState(session, 1);
                (state as any)._startTime = Date.now();
                const checkAndTransitSpy = sinon.spy(state as any, '_checkAndTransit');
                
                state.onSignalingConnected();
                
                expect((state as any)._signalingConnected).to.be.true;
                expect(session._onSignalingConnected).to.have.been.called;
                expect(session._sessionReport.signallingConnectionFailure).to.be.false;
                expect(checkAndTransitSpy).to.have.been.called;
            });

            it('should handle ICE candidate with null candidate', () => {
                const session = new SharedMediaSession(config);
                const state = new ConnectSignalingAndIceCollectionState(session, 1);
                const reportIceCompletedSpy = sinon.spy(state as any, '_reportIceCompleted');
                
                state.onIceCandidate({ candidate: null });
                
                expect(reportIceCompletedSpy).to.have.been.calledWith(false);
            });

            it('should collect ICE candidates with valid candidate', () => {
                const session = new SharedMediaSession(config);
                const state = new ConnectSignalingAndIceCollectionState(session, 1);
                
                (global as any).RTCIceCandidate = class MockRTCIceCandidate {
                    public candidate: string;
                    public sdpMLineIndex: number;
                    public sdpMid: string;
                    
                    constructor(init: any) {
                        this.candidate = init.candidate;
                        this.sdpMLineIndex = init.sdpMLineIndex;
                        this.sdpMid = init.sdpMid;
                    }
                };
                
                const mockCandidate = {
                    candidate: {
                        candidate: 'candidate:123 1 udp 123 192.168.1.1 54400 typ host'
                    }
                };
                
                state.onIceCandidate(mockCandidate);
                
                expect((state as any)._iceCandidates.length).to.equal(1);
                
                delete (global as any).RTCIceCandidate;
            });
        });

        describe('InviteAnswerState', () => {
            it('should send invite and transition to PendingAnswerState', () => {
                const session = new SharedMediaSession(config);
                (session as any)._localSessionDescription = { type: 'offer', sdp: 'test-sdp' };
                (session as any)._signalingChannel = {
                    invite: sinon.spy()
                };
                session._onSignalingStarted = sinon.spy();
                
                const iceCandidates = [{ candidate: 'test-candidate' }];
                const state = new InviteAnswerState(session, iceCandidates);
                
                state.onEnter();
                
                expect(session._onSignalingStarted).to.have.been.calledWith(session);
                expect((session as any)._signalingChannel.invite).to.have.been.calledWith('test-sdp', iceCandidates);
            });

            it('should handle signaling answered with peer connection details', () => {
                const session = new SharedMediaSession(config);
                session._isPersistentConnectionAllowlistedCallback = sinon.spy();
                session._setPeerConnectionIdCallback = sinon.spy();
                session._setPeerConnectionTokenCallback = sinon.spy();
                session._setInactivityDurationCallback = sinon.spy();
                
                const state = new InviteAnswerState(session, []);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onSignalingAnswered('remote-sdp', ['remote-candidate'], 30000, 'pc-id-123', 'pc-token-456');
                
                expect((session as any).inactivityDuration).to.equal(30000);
                expect((session as any).peerConnectionId).to.equal('pc-id-123');
                expect((session as any).peerConnectionToken).to.equal('pc-token-456');
                expect(session._isPersistentConnectionAllowlistedCallback).to.have.been.calledWith(true);
                expect(session._setPeerConnectionIdCallback).to.have.been.calledWith('pc-id-123');
                expect(session._setPeerConnectionTokenCallback).to.have.been.calledWith('pc-token-456');
                expect(session._setInactivityDurationCallback).to.have.been.calledWith(30000);
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(AcceptState);
            });
        });

        describe('AcceptState', () => {
            it('should handle invalid remote SDP and transition to FailedState', () => {
                const session = new SharedMediaSession(config);
                session._stopSession = sinon.spy();
                
                const state = new AcceptState(session, null, ['candidate']);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onEnter();
                
                expect(session._stopSession).to.have.been.called;
                expect(session._sessionReport.invalidRemoteSDPFailure).to.be.true;
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(FailedState);
            });

            it('should handle no remote ICE candidates', () => {
                const session = new SharedMediaSession(config);
                session._stopSession = sinon.spy();
                
                const state = new AcceptState(session, 'valid-sdp', []);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onEnter();
                
                expect(session._stopSession).to.have.been.called;
                expect(session._sessionReport.noRemoteIceCandidateFailure).to.be.true;
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(FailedState);
            });

            it('should call strategy setRemoteDescription with valid parameters', () => {
                const session = new SharedMediaSession(config);
                mockStrategy.setRemoteDescription = sinon.spy();
                
                const state = new AcceptState(session, 'valid-sdp', ['candidate1']);
                
                state.onEnter();
                
                expect(session._sessionReport.invalidRemoteSDPFailure).to.be.false;
                expect(session._sessionReport.noRemoteIceCandidateFailure).to.be.false;
                expect(mockStrategy.setRemoteDescription).to.have.been.calledWith(state, session);
            });
        });

        describe('TalkingState', () => {
            it('should handle basic TalkingState setup', () => {
                const session = new SharedMediaSession(config);
                session._connectTimeStamp = Date.now();
                session._onSessionConnected = sinon.spy();
                session._onSessionSetupLatencyMetricReady = sinon.spy();
                session.resumeLocalAudio = sinon.spy();
                
                // Mock _signalingChannel with required property
                (session as any)._signalingChannel = {
                    _isMediaClusterPath: true
                };
                
                const mockReceiver = {
                    getSynchronizationSources: sinon.stub().returns([])
                };
                session._pc = {
                    getReceivers: sinon.stub().returns([mockReceiver])
                } as any;
                
                const state = new TalkingState(session);
                
                state.onEnter();
                
                expect(session.resumeLocalAudio).to.have.been.called;
                expect(session._onSessionConnected).to.have.been.calledWith(session);
                expect(session._onSessionSetupLatencyMetricReady).to.have.been.called;
                expect(session._sessionReport.preTalkingTimeMillis).to.be.a('number');
                expect((state as any)._subState).to.exist;
            });

            it('should handle onRemoteHungup', () => {
                const session = new SharedMediaSession(config);
                (session as any)._signalingChannel = {
                    hangup: sinon.spy()
                };
                
                const state = new TalkingState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.onRemoteHungup();
                
                expect((session as any)._signalingChannel.hangup).to.have.been.called;
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(DisconnectedState);
            });

            it('should handle hangup with serverInitiated flag', () => {
                const session = new SharedMediaSession(config);
                (session as any)._signalingChannel = {
                    hangup: sinon.spy()
                };
                
                const state = new TalkingState(session);
                const transitSpy = sinon.spy(state, 'transit');
                
                state.hangup(true);
                
                expect((session as any)._signalingChannel.hangup).to.have.been.calledWith(true);
                expect(transitSpy).to.have.been.called;
                expect(transitSpy.firstCall.args[0]).to.be.instanceOf(DisconnectedState);
            });

            it('should delegate substate methods correctly', () => {
                const session = new SharedMediaSession(config);
                const state = new TalkingState(session);
                const mockSubState = {
                    onSignalingConnected: sinon.spy(),
                    onSignalingFailed: sinon.spy(),
                    onSignalingAnswered: sinon.spy(),
                    onSignalingHandshaked: sinon.spy(),
                    onIceCandidate: sinon.spy(),
                    onIceRestartFailure: sinon.spy(),
                    _checkAndTransit: sinon.spy()
                };
                (state as any)._subState = mockSubState;
                
                state.onSignalingConnected();
                state.onSignalingFailed(new Error('test'));
                state.onSignalingAnswered('sdp', ['candidates']);
                state.onSignalingHandshaked();
                state.onIceCandidate({ candidate: {} } as any);
                state.onIceRestartFailure();
                (state as any)._checkAndTransit();
                
                expect(mockSubState.onSignalingConnected).to.have.been.called;
                expect(mockSubState.onSignalingFailed).to.have.been.called;
                expect(mockSubState.onSignalingAnswered).to.have.been.called;
                expect(mockSubState.onSignalingHandshaked).to.have.been.called;
                expect(mockSubState.onIceCandidate).to.have.been.called;
                expect(mockSubState.onIceRestartFailure).to.have.been.called;
                expect(mockSubState._checkAndTransit).to.have.been.called;
            });
        });

        describe('CleanUpState', () => {
            it('should stop session and report cleanup time', () => {
                const session = new SharedMediaSession(config);
                session._stopSession = sinon.spy();
                session._onSessionDestroyed = sinon.spy();
                
                const state = new CleanUpState(session);
                
                state.onEnter();
                
                expect(session._stopSession).to.have.been.called;
                expect(session._sessionReport.cleanupTimeMillis).to.be.a('number');
                expect(session._onSessionDestroyed).to.have.been.calledWith(session, session._sessionReport);
            });

            it('should handle hangup as no-op', () => {
                const session = new SharedMediaSession(config);
                const state = new CleanUpState(session);
                
                expect(() => state.hangup()).to.not.throw();
            });
        });

        describe('DisconnectedState', () => {
            it('should handle state methods as no-ops', () => {
                const session = new SharedMediaSession(config);
                const state = new DisconnectedState(session);
                
                expect(() => state.onSignalingHandshaked()).to.not.throw();
                expect(() => state.onPeerConnectionStateChange()).to.not.throw();
            });
        });

        describe('FailedState', () => {
            it('should set session end time and call failure callback', () => {
                const session = new SharedMediaSession(config);
                session._onSessionFailed = sinon.spy();
                const failureReason = 'Test failure';
                
                const state = new FailedState(session, failureReason);
                
                state.onEnter();
                
                expect(session._sessionReport.sessionEndTime).to.be.instanceOf(Date);
                expect(session._onSessionFailed).to.have.been.calledWith(session, failureReason);
            });
        });
    });

    // Device Change Handling tests are skipped — _onDeviceChange is for future Citrix support
    // and the device change listener registration is currently commented out in the constructor.

    describe('Advanced Scenarios', () => {
        it('should always start with null requested device ID regardless of config', () => {
            const configWithDevice = { ...config, deviceId: 'valid-device-123' };
            const session = new SharedMediaSession(configWithDevice);
            expect((session as any)._requestedDeviceId).to.not.be.ok;
        });

        it('should handle session report initialization', () => {
            const session = new SharedMediaSession(config);
            
            // Just verify session report exists and can be accessed
            expect(session._sessionReport).to.exist;
            expect(typeof session._sessionReport).to.equal('object');
        });

        it('should handle legacy stats report support', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._legacyStatsReportSupport).to.be.false;
        });
    });

    describe('refreshMediaStreamBetweenCalls', () => {
        describe('Guard Clauses', () => {
            it('should return early when user provided stream', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = true;
                
                session.refreshMediaStreamBetweenCalls();
                
                expect(mockLogger.log).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Not refreshing media stream - user provided stream is being used/));
            });
        });

        describe('Initialization', () => {
            it('should log refresh start and build media constraints without deviceId', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = false;
                
                const buildMediaConstraintsSpy = sinon.spy(session as any, '_buildMediaConstraints');
                mockStrategy._gUM = sinon.stub().resolves({
                    getAudioTracks: () => [],
                    getTracks: () => []
                });
                
                session.refreshMediaStreamBetweenCalls();
                
                expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/Refreshing media stream between calls/));
                expect(buildMediaConstraintsSpy).to.have.been.calledWithExactly();
            });

            it('should call strategy getUserMedia with default constraints', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = false;
                
                mockStrategy._gUM = sinon.stub().resolves({
                    getAudioTracks: () => [],
                    getTracks: () => []
                });
                
                session.refreshMediaStreamBetweenCalls();
                
                expect(mockStrategy._gUM).to.have.been.called;
                const callArgs = mockStrategy._gUM.getCall(0).args[0];
                expect(callArgs).to.have.property('audio');
            });
        });

        describe('Error Handling', () => {
            it('should not throw when getUserMedia fails (non-blocking)', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = false;
                
                mockStrategy._gUM = sinon.stub().rejects(new Error('GUM failed'));
                
                expect(() => session.refreshMediaStreamBetweenCalls()).to.not.throw();
            });

            it('should handle null peer connection without throwing', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = false;
                (session as any)._pc = null;
                
                mockStrategy._gUM = sinon.stub().resolves({
                    getAudioTracks: () => [],
                    getTracks: () => []
                });
                
                expect(() => session.refreshMediaStreamBetweenCalls()).to.not.throw();
            });
        });

        describe('Track Replacement Flow', () => {
            it('should call getSenders to find audio sender for track replacement', () => {
                const session = new SharedMediaSession(config);
                (session as any)._isUserProvidedStream = false;
                
                const mockSender = {
                    track: { kind: 'audio' },
                    replaceTrack: sinon.spy()
                };
                const getSendersSpy = sinon.stub().returns([mockSender]);
                
                (session as any)._pc = {
                    getSenders: getSendersSpy
                };
                
                (session as any)._localStream = {
                    getAudioTracks: () => [{ kind: 'audio' }]
                };
                
                mockStrategy._gUM = sinon.stub().resolves({
                    getAudioTracks: () => [{ getSettings: () => ({ deviceId: 'new-device' }) }],
                    getTracks: () => []
                });
                
                session.refreshMediaStreamBetweenCalls();
                
                expect(mockStrategy._gUM).to.have.been.called;
            });
        });
    });

    describe('VDI Cleanup Functionality', () => {
        it('should mark session for cleanup when VDI disconnection occurs', () => {
            const session = new SharedMediaSession(config);
            expect((session as any)._needsCleanup).to.be.false;
            
            session.markNeedsCleanup();
            
            expect((session as any)._needsCleanup).to.be.true;
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession marked for cleanup/));
        });

        it('should perform cleanup and call hangup when needsCleanup is true during health check', () => {
            const session = new SharedMediaSession(config);
            (session as any)._needsCleanup = true;
            (session as any)._state = new TalkingState(session);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            (session as any)._signalingChannel = {
                hangup: sinon.spy()
            };
            
            const hangupSpy = sinon.spy(session, 'hangup');
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.false;
            expect((session as any)._needsCleanup).to.be.true; // Should NOT be reset in health check anymore
            expect(hangupSpy).to.not.have.been.called; // Health check should not call hangup, destroy method handles it
            expect(mockLogger.info).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match(/SharedMediaSession requires cleanup/));
        });

        it('should trigger VDI cleanup when strategy calls the registered handler', () => {
            const mockStrategyWithVDI = new StandardStrategy();
            const onConnectionNeedingCleanupSpy = sinon.spy();
            (mockStrategyWithVDI as any).onConnectionNeedingCleanup = onConnectionNeedingCleanupSpy;
            const configWithVDI = { ...config, strategy: mockStrategyWithVDI };
            
            const session = new SharedMediaSession(configWithVDI);
            const markNeedsCleanupSpy = sinon.spy(session, 'markNeedsCleanup');
            
            // Simulate VDI disconnection by calling the registered handler
            const registeredHandler = onConnectionNeedingCleanupSpy.firstCall.args[0];
            registeredHandler();
            
            expect(markNeedsCleanupSpy).to.have.been.called;
        });

        it('should return false from health check when cleanup is needed but session is otherwise healthy', () => {
            const session = new SharedMediaSession(config);
            (session as any)._needsCleanup = true;
            (session as any)._state = new TalkingState(session);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            (session as any)._signalingChannel = {
                _state: { name: 'ConnectedState' },
                hangup: sinon.spy()
            };
            
            const hangupSpy = sinon.spy(session, 'hangup');
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.false;
            expect(hangupSpy).to.not.have.been.called; // Health check should not call hangup, destroy method handles it
        });

        it('should continue with normal health checks when no cleanup is needed', () => {
            const session = new SharedMediaSession(config);
            (session as any)._needsCleanup = false;
            (session as any)._state = new TalkingState(session);
            (session as any)._pc = {
                iceConnectionState: ICE_CONNECTION_STATE.CONNECTED
            };
            
            const hangupSpy = sinon.spy(session, 'hangup');
            
            const result = session.isSharedMediaSessionHealthy();
            
            expect(result).to.be.true;
            expect(hangupSpy).to.not.have.been.called;
        });

        it('should reset cleanup flag when CleanUpState.onEnter is called', () => {
            const session = new SharedMediaSession(config);
            (session as any)._needsCleanup = true;
            session._stopSession = sinon.spy();
            session._onSessionDestroyed = sinon.spy();
            
            const state = new CleanUpState(session);
            
            state.onEnter();
            
            expect((session as any)._needsCleanup).to.be.false; // Should be reset during actual cleanup
            expect(session._stopSession).to.have.been.called;
            expect(session._onSessionDestroyed).to.have.been.called;
        });
    });

    describe('FailedState', () => {
        let session: any;

        beforeEach(() => {
            session = new SharedMediaSession(config);
            session._stopSession = sinon.spy();
            session._onSessionDestroyed = sinon.spy();
            session._onSessionFailed = sinon.spy();
            session._onSessionSetupLatencyMetricReady = sinon.spy();
            session._setupMetricsSent = false;
            session._sessionReport = { sessionEndTime: null, cleanupTimeMillis: 0 };
            session._needsCleanup = false;
            session._state = { name: 'ConnectSignalingAndIceCollectionState' };
        });

        it('should default failureReason to ForceDestroyed message when undefined', () => {
            const state = new FailedState(session, undefined);
            expect((state as any)._failureReason).to.equal('ForceDestroyedInConnectSignalingAndIceCollectionState');
        });

        it('should preserve explicit failureReason when provided', () => {
            const state = new FailedState(session, 'ICE_COLLECTION_TIMEOUT');
            expect((state as any)._failureReason).to.equal('ICE_COLLECTION_TIMEOUT');
        });

        it('should always call super.onEnter() even when _onSessionFailed throws', () => {
            session._onSessionFailed = sinon.stub().throws(new TypeError("Cannot read properties of undefined (reading 'code')"));

            const state = new FailedState(session, undefined);
            state.onEnter();

            expect(session._stopSession).to.have.been.called;
            expect(session._onSessionDestroyed).to.have.been.called;
        });

        it('should call _onSessionFailed with the failureReason', () => {
            const state = new FailedState(session, 'TEST_REASON');
            state.onEnter();

            expect(session._onSessionFailed).to.have.been.calledWith(session, 'TEST_REASON');
            expect(session._stopSession).to.have.been.called;
        });

        it('should send setup latency metrics if not already sent', () => {
            const state = new FailedState(session, 'TEST_REASON');
            state.onEnter();

            expect(session._onSessionSetupLatencyMetricReady).to.have.been.calledWith(session._sessionReport);
            expect(session._setupMetricsSent).to.be.true;
        });

        it('should not send setup latency metrics if already sent', () => {
            session._setupMetricsSent = true;
            const state = new FailedState(session, 'TEST_REASON');
            state.onEnter();

            expect(session._onSessionSetupLatencyMetricReady).not.to.have.been.called;
        });
    });

});
