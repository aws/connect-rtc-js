import '../test-setup';
import sinon, { sandbox } from 'sinon';
import chai from 'chai';

import OmnissaVDIStrategy from '../../../src/js/strategies/OmnissaVDIStrategy';

describe('OmnissaVDIStrategy', () => {
    let sandboxInstance;
    let mockHorizonWebRTCExtension;
    let mockHorizonWebRtcRedirectionAPI;

    beforeEach(() => {
        sandboxInstance = sandbox.create();

        // Mock HorizonWebRTCExtension
        mockHorizonWebRTCExtension = {
            getHorizonClientID: sandboxInstance.stub().resolves('mockClientID'),
            getHorizonWSSPort: sandboxInstance.stub().resolves(8443),
        };

        // Mock HorizonWebRtcRedirectionAPI
        mockHorizonWebRtcRedirectionAPI = {
            initSDK: sandboxInstance.stub().returns(true),
            newPeerConnection: sandboxInstance.stub().returns({}),
            getUserMedia: sandboxInstance.stub().resolves('mockMediaStream'),
        };

        // Set up require cache mock
        const mockModules = {
            '@euc-releases/horizon-webrtc-redir-sdk/HorizonWebRTCExtension': mockHorizonWebRTCExtension,
            '@euc-releases/horizon-webrtc-redir-sdk/HorizonSDKforWebRTCRedir': mockHorizonWebRtcRedirectionAPI
        };

        // Clear require cache
        Object.keys(require.cache).forEach(key => {
            delete require.cache[key];
        });

        // Mock require
        require.cache[require.resolve('@euc-releases/horizon-webrtc-redir-sdk/HorizonWebRTCExtension')] = {
            exports: mockHorizonWebRTCExtension
        };
        require.cache[require.resolve('@euc-releases/horizon-webrtc-redir-sdk/HorizonSDKforWebRTCRedir')] = {
            exports: mockHorizonWebRtcRedirectionAPI
        };

        // Set global.window to include mocks
        global.window = {
            HorizonWebRTCExtension: mockHorizonWebRTCExtension,
            HorizonWebRtcRedirectionAPI: mockHorizonWebRtcRedirectionAPI,
            addEventListener: sandboxInstance.stub(),
            removeEventListener: sandboxInstance.stub(),
            console: {
                log: sandboxInstance.stub(),
                error: sandboxInstance.stub(),
                warn: sandboxInstance.stub(),
            },
            navigator: {
                mediaDevices: {getUserMedia : sinon.stub().returns({})},
                userAgent: {match: sinon.stub().returns({}),
                    indexOf: sinon.stub().returns({})},
            },
        };

    });

    afterEach(() => {
        sandboxInstance.restore();
        delete global.window;
        delete global.self;
    });

    it('should initialize Omnissa SDK and event handlers successfully', () => {

        const instance = new OmnissaVDIStrategy();

        sinon.assert.calledOnce(mockHorizonWebRtcRedirectionAPI.initSDK);
        sinon.assert.calledWith(
            mockHorizonWebRtcRedirectionAPI.initSDK,
            sinon.match.object,
            'AmazonConnect',
            sinon.match.func
        );

        const eventHandler = mockHorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];
        chai.expect(eventHandler).to.be.a('function');

        // Simulate events
        eventHandler.call(instance, { event: 'vdiClientConnected' });
        sinon.assert.calledWith(console.log, 'Got event from WebRTCRedirSDK: vdiClientConnected');

        eventHandler.call(instance, { event: 'vdiClientDisconnected' });
        sinon.assert.calledWith(console.log, 'Got event from WebRTCRedirSDK: vdiClientDisconnected');

    });


    it('should throw an error if Omnissa SDK initialization fails', () => {
        mockHorizonWebRtcRedirectionAPI.initSDK.returns(false);

        chai.expect(() => new OmnissaVDIStrategy()).to.throw(
            Error,
            'Omnissa WebRTC Redirection API failed to initialize'
        );

        chai.expect(mockHorizonWebRtcRedirectionAPI.initSDK).to.have.been.calledOnce;
    });

    it('should correctly handle unknown events in vmEventHandler', () => {

        const instance = new OmnissaVDIStrategy();
        const stringfyStub = sandbox.stub(JSON, 'stringify');
        stringfyStub.returns('{ "event": "unknownEvent" }')


        // Log the stub for debugging
        console.log('Console warn stub:', global.window.console.warn);

        const eventHandler = mockHorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];
        eventHandler({ event: 'unknownEvent' });

        // More verbose logging
        console.log('Console warn call count:', global.window.console.warn.callCount);
        console.log('Console warn first call:', global.window.console.warn.firstCall);

        sinon.assert.calledWith(console.log, 'Got an unknown event from WebRTCRedirSDK: { "event": "unknownEvent" }');

    });

    it('should handle empty streams in ontrack', () => {
        const warnStub = sinon.stub(console, 'warn');
        const instance = new OmnissaVDIStrategy();
        const evt = { streams: [] };
        const self = {
            _logger: {
                warn: sinon.stub()
            }
        };

        instance._ontrack(self, evt);

        // Check if warn was called
        chai.expect(self._logger.warn.called).to.be.true;
        // Check the arguments
        chai.expect(self._logger.warn.firstCall.args[0]).to.equal('No streams found in the event');

        warnStub.restore();  // Clean up the stub
    });

    it('should get client ID successfully', async () => {
        const instance = new OmnissaVDIStrategy();

        mockHorizonWebRTCExtension.getHorizonClientID.resolves('test-client-id');

        const clientId = await window.getHorizonClientID();
        chai.expect(clientId).to.equal('test-client-id');
    });

    it('should get WSS port successfully', async () => {
        const instance = new OmnissaVDIStrategy();

        mockHorizonWebRTCExtension.getHorizonWSSPort.resolves(8443);

        const wssPort = await window.getHorizonWSSPort();
        chai.expect(wssPort).to.equal(8443);
    });

    it('should handle client ID error', async () => {
        const instance = new OmnissaVDIStrategy();

        mockHorizonWebRTCExtension.getHorizonClientID.rejects(new Error('test error'));

        try {
            await window.getHorizonClientID();
            chai.assert.fail('Should have thrown an error');
        } catch (error) {
            chai.expect(error).to.include('Failed to get client ID');
        }
    });

    it('should handle WSS port error', async () => {
        const instance = new OmnissaVDIStrategy();

        mockHorizonWebRTCExtension.getHorizonWSSPort.rejects(new Error('test error'));

        try {
            await window.getHorizonWSSPort();
            chai.assert.fail('Should have thrown an error');
        } catch (error) {
            chai.expect(error).to.include('Failed to get WSS port');
        }
    });

    it('should get user media successfully', async () => {
        const instance = new OmnissaVDIStrategy();
        const constraints = { audio: true };

        // Set up the mock to resolve with a mock media stream
        mockHorizonWebRtcRedirectionAPI.getUserMedia.resolves('mock-media-stream');

        // Calling our class method _gUM
        const mediaStream = await instance._gUM(constraints);

        // Verify the result
        chai.expect(mediaStream).to.equal('mock-media-stream');
        // Verify that getUserMedia was called with correct constraints
        sinon.assert.calledWith(mockHorizonWebRtcRedirectionAPI.getUserMedia, constraints);
    });


    it('should handle getUserMedia failure', async () => {
        const instance = new OmnissaVDIStrategy();
        const constraints = { audio: true };
        const error = new Error('getUserMedia failed');

        mockHorizonWebRtcRedirectionAPI.getUserMedia.rejects(error);

        try {
            await instance._gUM(constraints);
            chai.assert.fail('Should have thrown an error');
        } catch (err) {
            chai.expect(err).to.equal(error);
        }
    });

    it('should create RTC peer connection', () => {
        const instance = new OmnissaVDIStrategy();
        const config = { iceServers: [] };
        const optionalConfig = { optional: [] };

        instance._createRtcPeerConnection(config, optionalConfig);

        sinon.assert.calledWith(
            mockHorizonWebRtcRedirectionAPI.newPeerConnection,
            config,
            optionalConfig
        );
    });

    it('should build media constraints with audio enabled', () => {
        const instance = new OmnissaVDIStrategy();
        const self = { _enableAudio: true };
        const mediaConstraints = {};

        instance._buildMediaConstraints(self, mediaConstraints);
        chai.expect(mediaConstraints.audio).to.be.true;
    });

    it('should build media constraints with audio device', () => {
        const instance = new OmnissaVDIStrategy();
        const self = { _enableAudio: true };
        const mediaConstraints = {};
        global.window.audio_input = 'device-id-123';

        instance._buildMediaConstraints(self, mediaConstraints);

        chai.expect(mediaConstraints.audio).to.deep.equal({
            deviceId: 'device-id-123'
        });
    });

});
