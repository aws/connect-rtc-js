import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from "@salesforce/ts-sinon";
chai.use(sinonChai);

import RtcPeerConnectionManager from '../../src/rtc_peer_connection_manager';
import StandardStrategy from '../../src/strategies/StandardStrategy';
import RtcSession from "../../src/rtc_session";

import * as utils from '../../src/utils';
import { SessionReport } from '../../src/session_report';

const expect = chai.expect;

describe('RtcPeerConnectionManager', () => {
    let signalingUri, iceServers, transportHandle, publishError, contactToken, logger, contactId, connectionId, wssManager, browserId;
    signalingUri = 'signalingUri';
    iceServers = [{ urls: 'stun:stun.example.com' }];
    transportHandle = sinon.stub().resolves('iceServer');
    publishError = sinon.spy();
    contactToken = 'example-contact-token';
    logger = console;
    contactId = 'example-contact-id';
    connectionId = 'example-connection-id';
    wssManager = {
        subscribeTopics: sinon.spy(),
        onMessage: sinon.spy(),
    };
    browserId = "example-browser-id";

    const strategy = new StandardStrategy();
    strategy._addDeviceChangeListener = sinon.stub().resolves([]);

    sinon.stub(RtcPeerConnectionManager.prototype as any, '_initializeWebSocketEventListeners').returns({});
    sinon.stub(RtcPeerConnectionManager.prototype as any, '_networkConnectivityChecker').returns({});
    sinon.stub(RtcPeerConnectionManager.prototype as any, '_isEarlyMediaConnectionSupported').returns(false);

    beforeEach(() => {
    });

    afterEach(() => {
        if ((RtcPeerConnectionManager as any).instance) {
            clearInterval((RtcPeerConnectionManager as any).instance._networkCheckerIntervalId);
        }
        (RtcPeerConnectionManager as any).instance = null;
    });

    describe('RtcPeerConnectionManager constructor', () => {
        beforeEach(() => {
            sinon.stub(utils, "isFirefoxBrowser").returns(false);
        });


        it('should create an instance of RtcPeerConnectionManager', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            expect(pcm).to.be.an.instanceOf(RtcPeerConnectionManager);
        });

        it('should throw an error if transportHandle is missing', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                null,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            )).to.throw('transportHandle must be a function');
        });

        it('should throw an error if logger is missing', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                null as any,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            )).to.throw('logger required');
        });

        it('should throw an error if strategy is not an instance of CCPInitiationStrategyInterface', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                {},
                false,
                browserId
            )).to.throw(Error);
        });

        it('should generate an uuid if contactId is not provided', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                null as any,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            expect(pcm._callId).to.be.a('string');
        });

        it('should generate an uuid if connectionId is not provided', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                null as any,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            expect(pcm._connectionId).to.be.a('string');
        });

        it('should not initialize a RtcPeerConnectionManager if RtcPeerConnectionManager has been created', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            expect(pcm._connectionId).to.be.a('string');
        });
    });

    describe('createRtcSession', () => {
        it('should create a RtcSession if RtcSession not exists', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            pcm.createSession();

            expect(pcm.getSession()).to.be.an.instanceOf(RtcSession);
        });

    });

    describe('connect', () => {
        it('should get peer connection and call rtcSession connect', async () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                false,
                browserId
            );

            const pc = stubInterface<RTCPeerConnection>(sinon);
            const getPeerConnectionSpy = sinon.stub(pcm, 'getPeerConnection').returns(pc);
            const sessionReport = new SessionReport();
            sessionReport.userAgentData = () => null

            const rtcSession = sinon.createStubInstance(RtcSession);
            rtcSession._sessionReport = sessionReport;

            pcm._rtcSession = rtcSession;
            (pcm as any)._userAgentData = "example-ua";
            pcm._rtcSessionConnectPromise = Promise.resolve();
            sinon.stub(utils as any, 'hitch').returns({});

            pcm.connect();
            await Promise.resolve();
            await Promise.resolve();

            sinon.assert.calledOnce(getPeerConnectionSpy);
            sinon.assert.calledWith(rtcSession.connect, pc);
        });
    });

    describe('hangup', () => {
        it('should reset ICERestart flag and clean up pc, peerConnectionToken and peerConnectionId for non-persistent peer connection', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                true,
                browserId
            );
            const rtcSession = pcm.createSession();
            sinon.stub(rtcSession, 'hangup');
            (pcm as any)._persistentConnection = false;

            pcm.hangup();
            expect(pcm._iceRestart).to.equal(false);
            expect(pcm._signalingChannel).to.be.null;
            expect(pcm._pc).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
        });
    });

    describe('destroy', () => {
        it('should close the peer connection if it exists', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                "mockId",
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                strategy,
                true,
                browserId
            );
            const peerConnection = {
                close: sinon.spy()
            };
            pcm._pc = peerConnection;
            (pcm as any).destroy();
            expect(peerConnection.close).to.have.been.called;
        });
    });

    describe('Connection cleanup handling', () => {
        it('should mark connection as unhealthy when VDI disconnects', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                '',
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            pcm._handleConnectionCleanup();
            expect(pcm._isUnhealthyPersistentPeerConnection).to.be.true;
        });

        it('should clean up and create new session when previous connection was unhealthy', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                '',
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            // Set up the unhealthy state
            pcm._isUnhealthyPersistentPeerConnection = true;
            (pcm as any)._rtcSession = {};
            pcm._contactToken = 'test';
            pcm._callId = 'test';

            const newSession = pcm.createSession(null, [{ urls: 'stun:stun.example.com' }]);

            // Verify cleanup occurred
            expect(pcm._isUnhealthyPersistentPeerConnection).to.be.false;
            expect(newSession).to.be.an.instanceOf(RtcSession);
        });

        it('should handle VDI disconnection with strategy callback', () => {
            const strategy = new StandardStrategy();
            strategy.onConnectionNeedingCleanup = sinon.spy();

            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                '',
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                strategy,
                false,
                browserId
            );

            pcm._handleConnectionCleanup();
            expect(strategy.onConnectionNeedingCleanup).to.have.been.called;
        });
    });

    describe('_collectAgentSetupMetrics', () => {
        let pcm: any;

        beforeEach(() => {
            pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null as any,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );
        });

        it('should set deviceMemory from navigator.deviceMemory', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = { deviceMemory: 8 };

            pcm._collectAgentSetupMetrics(sessionReport);

            expect(sessionReport.deviceMemory).to.equal(8);
        });

        it('should set deviceMemory to null when navigator.deviceMemory is undefined', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {};

            pcm._collectAgentSetupMetrics(sessionReport);

            expect(sessionReport.deviceMemory).to.be.null;
        });

        it('should set network metrics from navigator.connection', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {
                connection: {
                    effectiveType: '4g',
                    rtt: 50
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);

            expect(sessionReport.networkEffectiveType).to.equal('4g');
            expect(sessionReport.networkRtt).to.equal(50);
        });

        it('should handle missing navigator.connection gracefully', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {};

            pcm._collectAgentSetupMetrics(sessionReport);

            expect(sessionReport.networkEffectiveType).to.be.undefined;
            expect(sessionReport.networkRtt).to.be.undefined;
        });

        it('should query microphone permission when permissions API is available', () => {
            const sessionReport: any = {};
            const permissionQueryStub = sinon.stub().resolves({ state: 'granted' });
            
            (globalThis as any).navigator = {
                permissions: {
                    query: permissionQueryStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);

            expect(permissionQueryStub.calledOnce).to.be.true;
            expect(permissionQueryStub.calledWith({ name: 'microphone' })).to.be.true;
        });

        it('should handle microphone permission query failure gracefully', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {
                permissions: {
                    query: sinon.stub().rejects(new Error('Permission query failed'))
                }
            };

            expect(() => pcm._collectAgentSetupMetrics(sessionReport)).to.not.throw();
        });

        it('should handle missing permissions API gracefully', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {};

            expect(() => pcm._collectAgentSetupMetrics(sessionReport)).to.not.throw();
        });

        it('should enumerate audio input devices when mediaDevices API is available', () => {
            const sessionReport: any = {};
            const mockDevices = [
                { kind: 'audioinput', label: 'Built-in Microphone' },
                { kind: 'audioinput', label: 'External USB Microphone' },
                { kind: 'videoinput', label: 'Webcam' }
            ];
            
            let capturedCallback: any;
            const enumerateDevicesStub = sinon.stub().returns({
                then: (callback: any) => {
                    capturedCallback = callback;
                    return { catch: () => {} };
                }
            });

            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: enumerateDevicesStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);
            capturedCallback(mockDevices);

            expect(enumerateDevicesStub.calledOnce).to.be.true;
            expect(sessionReport.audioInputDevices).to.deep.equal(['Built-in Microphone', 'External USB Microphone']);
        });

        it('should enumerate audio output devices when mediaDevices API is available', () => {
            const sessionReport: any = {};
            const mockDevices = [
                { kind: 'audiooutput', label: 'Built-in Speakers' },
                { kind: 'audiooutput', label: 'Headphones' },
                { kind: 'videoinput', label: 'Webcam' }
            ];
            
            let capturedCallback: any;
            const enumerateDevicesStub = sinon.stub().returns({
                then: (callback: any) => {
                    capturedCallback = callback;
                    return { catch: () => {} };
                }
            });

            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: enumerateDevicesStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);
            capturedCallback(mockDevices);

            expect(enumerateDevicesStub.calledOnce).to.be.true;
            expect(sessionReport.audioOutputDevices).to.deep.equal(['Built-in Speakers', 'Headphones']);
        });

        it('should enumerate both audio input and output devices correctly', () => {
            const sessionReport: any = {};
            const mockDevices = [
                { kind: 'audioinput', label: 'Microphone 1' },
                { kind: 'audiooutput', label: 'Speaker 1' },
                { kind: 'audioinput', label: 'Microphone 2' },
                { kind: 'audiooutput', label: 'Speaker 2' },
                { kind: 'videoinput', label: 'Camera' }
            ];
            
            let capturedCallback: any;
            const enumerateDevicesStub = sinon.stub().returns({
                then: (callback: any) => {
                    capturedCallback = callback;
                    return { catch: () => {} };
                }
            });

            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: enumerateDevicesStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);
            capturedCallback(mockDevices);

            expect(sessionReport.audioInputDevices).to.deep.equal(['Microphone 1', 'Microphone 2']);
            expect(sessionReport.audioOutputDevices).to.deep.equal(['Speaker 1', 'Speaker 2']);
        });

        it('should handle empty device list gracefully', () => {
            const sessionReport: any = {};
            
            let capturedCallback: any;
            const enumerateDevicesStub = sinon.stub().returns({
                then: (callback: any) => {
                    capturedCallback = callback;
                    return { catch: () => {} };
                }
            });

            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: enumerateDevicesStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);
            capturedCallback([]);

            expect(sessionReport.audioInputDevices).to.deep.equal([]);
            expect(sessionReport.audioOutputDevices).to.deep.equal([]);
        });

        it('should handle enumerateDevices failure gracefully', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: sinon.stub().returns({
                        then: () => ({ catch: () => {} })
                    })
                }
            };

            expect(() => pcm._collectAgentSetupMetrics(sessionReport)).to.not.throw();
        });

        it('should handle missing mediaDevices API gracefully', () => {
            const sessionReport: any = {};
            (globalThis as any).navigator = {};

            expect(() => pcm._collectAgentSetupMetrics(sessionReport)).to.not.throw();
            expect(sessionReport.audioInputDevices).to.be.undefined;
            expect(sessionReport.audioOutputDevices).to.be.undefined;
        });

        it('should handle devices with empty labels', () => {
            const sessionReport: any = {};
            const mockDevices = [
                { kind: 'audioinput', label: '' },
                { kind: 'audiooutput', label: '' }
            ];
            
            let capturedCallback: any;
            const enumerateDevicesStub = sinon.stub().returns({
                then: (callback: any) => {
                    capturedCallback = callback;
                    return { catch: () => {} };
                }
            });

            (globalThis as any).navigator = {
                mediaDevices: {
                    enumerateDevices: enumerateDevicesStub
                }
            };

            pcm._collectAgentSetupMetrics(sessionReport);
            capturedCallback(mockDevices);

            expect(sessionReport.audioInputDevices).to.deep.equal(['']);
            expect(sessionReport.audioOutputDevices).to.deep.equal(['']);
        });
    });

    describe('setMicrophoneDevice', () => {
        let pcm: any;
        let mockOldTrack: any;
        let mockNewTrack: any;
        let mockNewStream: any;
        let mockSender: any;
        let mockPc: any;
        let mockMediaStream: any;
        let mockStrategy: any;

        const logChain = { sendInternalLogToServer: sinon.stub() };
        const mockLogger = {
            info: sinon.stub().returns(logChain),
            log: sinon.stub().returns(logChain),
            warn: sinon.stub().returns(logChain),
            error: sinon.stub().returns({ withException: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }), sendInternalLogToServer: sinon.stub() }),
        };

        beforeEach(() => {
            mockOldTrack = {
                id: 'old-track-id',
                enabled: true,
                readyState: 'live',
                stop: sinon.stub(),
                getSettings: sinon.stub().returns({ deviceId: 'old-device' })
            };

            mockNewTrack = {
                id: 'new-track-id',
                enabled: true,
                readyState: 'live',
                stop: sinon.stub(),
                getSettings: sinon.stub().returns({ deviceId: 'new-device' })
            };

            mockNewStream = {
                getAudioTracks: sinon.stub().returns([mockNewTrack])
            };

            mockSender = {
                replaceTrack: sinon.stub().resolves()
            };

            mockPc = {
                getSenders: sinon.stub().returns([mockSender]),
                iceConnectionState: 'connected'
            };

            mockMediaStream = {
                getAudioTracks: sinon.stub().returns([mockOldTrack]),
                removeTrack: sinon.stub(),
                addTrack: sinon.stub()
            };

            mockStrategy = new StandardStrategy();
            mockStrategy._gUM = sinon.stub().resolves(mockNewStream);

            pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                'mockId',
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager as any,
                mockStrategy,
                false,
                browserId
            );

            pcm._pc = mockPc;
            pcm._mediaStream = mockMediaStream;
            pcm._strategy = mockStrategy;
            pcm._logger = mockLogger;
        });

        it('should successfully change microphone device', async () => {
            await pcm.setMicrophoneDevice('new-device');

            // Verify getUserMedia was called with correct constraints
            expect(mockStrategy._gUM).to.have.been.calledWith({
                audio: { deviceId: { exact: 'new-device' } }
            });

            // Verify replaceTrack was called with the new track
            expect(mockSender.replaceTrack).to.have.been.calledWith(mockNewTrack);

            // Verify old track was removed and new track was added to media stream
            expect(mockMediaStream.removeTrack).to.have.been.calledWith(mockOldTrack);
            expect(mockMediaStream.addTrack).to.have.been.calledWith(mockNewTrack);

            // Verify old track was stopped
            expect(mockOldTrack.stop).to.have.been.called;
        });

        it('should preserve mute state when track was muted', async () => {
            // Set old track as muted (enabled = false)
            mockOldTrack.enabled = false;

            await pcm.setMicrophoneDevice('new-device');

            // New track should inherit old track's enabled state (muted)
            expect(mockNewTrack.enabled).to.be.false;
            // Old track should be disabled
            expect(mockOldTrack.enabled).to.be.false;
        });

        it('should preserve unmuted state when track was unmuted', async () => {
            // Set old track as unmuted (enabled = true)
            mockOldTrack.enabled = true;

            await pcm.setMicrophoneDevice('new-device');

            // New track should inherit old track's enabled state (unmuted)
            expect(mockNewTrack.enabled).to.be.true;
            // Old track should be disabled after swap
            expect(mockOldTrack.enabled).to.be.false;
        });

        it('should return early when no peer connection exists', async () => {
            pcm._pc = null;

            await pcm.setMicrophoneDevice('new-device');

            // Should not attempt getUserMedia
            expect(mockStrategy._gUM).to.not.have.been.called;
        });

        it('should return early when no media stream exists', async () => {
            pcm._mediaStream = null;

            await pcm.setMicrophoneDevice('new-device');

            // Should not attempt getUserMedia
            expect(mockStrategy._gUM).to.not.have.been.called;
        });

        it('should not throw when getUserMedia fails', async () => {
            mockStrategy._gUM = sinon.stub().rejects(new Error('getUserMedia failed'));

            await pcm.setMicrophoneDevice('new-device');

            // Verify old track was NOT stopped since getUserMedia failed
            expect(mockOldTrack.stop).to.not.have.been.called;
        });

        it('should not throw when no sender found in peer connection', async () => {
            mockPc.getSenders = sinon.stub().returns([]);

            await pcm.setMicrophoneDevice('new-device');

            // Verify old track was NOT stopped
            expect(mockOldTrack.stop).to.not.have.been.called;
        });

        it('should reset _currentMicDeviceId when hangup() is called (non-persistent)', () => {
            pcm._currentMicDeviceId = 'some-device';
            pcm._isPPCEnabled = false;
            pcm._isRTPSAllowlisted = false;

            pcm.hangup();

            expect(pcm._currentMicDeviceId).to.be.null;
        });

        it('should reset _currentMicDeviceId when destroy() is called', () => {
            pcm._currentMicDeviceId = 'some-device';
            pcm._rtcSession = null;
            // mock close() so strategy.close(pc) doesn't throw
            pcm._strategy.close = sinon.stub();

            pcm.destroy();

            expect(pcm._currentMicDeviceId).to.be.null;
        });

        it('should always stop old track after replacement', async () => {
            await pcm.setMicrophoneDevice('new-device');

            expect(mockOldTrack.stop).to.have.been.called;
            expect(mockOldTrack.enabled).to.be.false;
        });

        it('should handle case when no old track exists in media stream', async () => {
            mockMediaStream.getAudioTracks = sinon.stub().returns([]);

            await pcm.setMicrophoneDevice('new-device');

            // Should still add the new track
            expect(mockMediaStream.addTrack).to.have.been.calledWith(mockNewTrack);
            // removeTrack should not be called since there was no old track
            expect(mockMediaStream.removeTrack).to.not.have.been.called;
        });
    });

    describe('vdiMetadata wiring in createSession', () => {
        it('should set vdiMetadata when strategy has getMetadata', () => {
            const diagnostics = { mmrExtensionVersion: '1.0' };
            const diagStrategy = new StandardStrategy();
            diagStrategy._addDeviceChangeListener = sinon.stub().resolves([]);
            (diagStrategy as any).getMetadata = sinon.stub().returns(diagnostics);

            const pcm = new RtcPeerConnectionManager(
                signalingUri, iceServers, transportHandle, publishError,
                "mockId", contactToken, logger, contactId, connectionId,
                wssManager as any, diagStrategy, false, browserId
            );
            const session = pcm.createSession(null, null, null, null, null, diagStrategy);
            expect(session._sessionReport.vdiMetadata).to.deep.equal(diagnostics);
        });

        it('should not set vdiMetadata when strategy lacks getMetadata', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri, iceServers, transportHandle, publishError,
                "mockId", contactToken, logger, contactId, connectionId,
                wssManager as any, strategy, false, browserId
            );
            const session = pcm.createSession();
            expect(session._sessionReport.vdiMetadata).to.be.null;
        });
    });

    describe('vdiClientVersion wiring in createSession', () => {
        it('should set vdiClientVersion when strategy has getVdiClientVersion', () => {
            const versionStrategy = new StandardStrategy();
            versionStrategy._addDeviceChangeListener = sinon.stub().resolves([]);
            (versionStrategy as any).getVdiClientVersion = sinon.stub().returns('1.2.3');

            const pcm = new RtcPeerConnectionManager(
                signalingUri, iceServers, transportHandle, publishError,
                "mockId", contactToken, logger, contactId, connectionId,
                wssManager as any, versionStrategy, false, browserId
            );
            const session = pcm.createSession(null, null, null, null, null, versionStrategy);
            expect(session._sessionReport.vdiClientVersion).to.equal('1.2.3');
        });

        it('should not set vdiClientVersion when strategy lacks getVdiClientVersion', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri, iceServers, transportHandle, publishError,
                "mockId", contactToken, logger, contactId, connectionId,
                wssManager as any, strategy, false, browserId
            );
            const session = pcm.createSession();
            expect(session._sessionReport.vdiClientVersion).to.be.null;
        });
    });
});
