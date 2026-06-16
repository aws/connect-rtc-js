import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import { GlobalMocker } from '../globalMock';
declare var global: GlobalMocker;

import OmnissaVDIStrategy from '../../../src/strategies/OmnissaVDIStrategy';

describe('OmnissaVDIStrategy', () => {
    beforeEach(() => {
        // Mock HorizonWebRTCExtension
        global.window.HorizonWebRTCExtension.getHorizonClientID.resolves('mockClientID');
        global.window.HorizonWebRTCExtension.getHorizonWSSPort.resolves(8443);

        // Mock HorizonWebRtcRedirectionAPI
        global.window.HorizonWebRtcRedirectionAPI.initSDK.returns(true);
        global.window.HorizonWebRtcRedirectionAPI.newPeerConnection.returns({});
        global.window.HorizonWebRtcRedirectionAPI.getUserMedia.resolves('mockMediaStream');
        global.window.HorizonWebRtcRedirectionAPI.enumerateDevices.resolves(['mockDevice']);
    });

    it('should initialize Omnissa SDK and event handlers successfully', () => {

        const instance = new OmnissaVDIStrategy(false);

        sinon.assert.calledOnce(global.window.HorizonWebRtcRedirectionAPI.initSDK);
        sinon.assert.calledWith(
            global.window.HorizonWebRtcRedirectionAPI.initSDK,
            sinon.match.object,
            'AmazonConnect',
            sinon.match.func
        );

        const eventHandler = global.window.HorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];
        chai.expect(eventHandler).to.be.a('function');

        // Simulate events
        eventHandler.call(instance, { event: 'vdiClientConnected' });
        sinon.assert.calledWith((console.log as sinon.SinonStub), 'Got event from WebRTCRedirSDK: vdiClientConnected');

        eventHandler.call(instance, { event: 'vdiClientDisconnected' });
        sinon.assert.calledWith((console.log as sinon.SinonStub), 'Got event from WebRTCRedirSDK: vdiClientDisconnected');

    });

    it('should throw an error if Omnissa SDK initialization fails', () => {
        global.window.HorizonWebRtcRedirectionAPI.initSDK.returns(false);

        chai.expect(() => new OmnissaVDIStrategy(false)).to.throw(
            Error,
            'Omnissa WebRTC Redirection API failed to initialize'
        );

        chai.expect(global.window.HorizonWebRtcRedirectionAPI.initSDK).to.have.been.calledOnce;
    });

    it('should correctly handle unknown events in vmEventHandler', () => {

        const instance = new OmnissaVDIStrategy(false);

        const eventHandler = global.window.HorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];
        eventHandler({ event: 'unknownEvent' });

        sinon.assert.calledWith((console.log as sinon.SinonStub), 'Got an unknown event from WebRTCRedirSDK: {"event":"unknownEvent"}');

    });

    it('should handle empty streams in ontrack', () => {
        const instance = new OmnissaVDIStrategy(false);
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
    });

    it('should get client ID successfully', async () => {
        const _ = new OmnissaVDIStrategy(false);

        global.window.HorizonWebRTCExtension.getHorizonClientID.resolves('test-client-id');

        chai.expect(global.window.getHorizonClientID).to.exist;
        const clientId = await global.window.getHorizonClientID!();
        chai.expect(clientId).to.equal('test-client-id');
    });

    it('should get WSS port successfully', async () => {
        const _ = new OmnissaVDIStrategy(false);

        chai.expect(global.window.getHorizonWSSPort).to.exist;

        const wssPort = await global.window.getHorizonWSSPort!();
        chai.expect(wssPort).to.equal(8443);
    });

    it('should handle client ID error', async () => {
        const instance = new OmnissaVDIStrategy(false);

        global.window.HorizonWebRTCExtension.getHorizonClientID.rejects(new Error('test error'));

        try {
            await global.window.getHorizonClientID!();
            chai.assert.fail('Should have thrown an error');
        } catch (error) {
            chai.expect(error).to.include('Failed to get client ID');
        }
    });

    it('should handle WSS port error', async () => {
        const instance = new OmnissaVDIStrategy(false);

        global.window.HorizonWebRTCExtension.getHorizonWSSPort.rejects(new Error('test error'));

        try {
            await global.window.getHorizonWSSPort!();
            chai.assert.fail('Should have thrown an error');
        } catch (error) {
            chai.expect(error).to.include('Failed to get WSS port');
        }
    });

    it('should get user media successfully', async () => {
        const instance = new OmnissaVDIStrategy(false);
        const constraints = { audio: true };

        // Set up the mock to resolve with a mock media stream
        global.window.HorizonWebRtcRedirectionAPI.getUserMedia.resolves('mock-media-stream');

        // Calling our class method _gUM
        const mediaStream = await instance._gUM(constraints);

        // Verify the result
        chai.expect(mediaStream).to.equal('mock-media-stream');
        // Verify that getUserMedia was called with correct constraints
        sinon.assert.calledWith(global.window.HorizonWebRtcRedirectionAPI.getUserMedia, constraints);
    });


    it('should handle getUserMedia failure', async () => {
        const instance = new OmnissaVDIStrategy(false);
        const constraints = { audio: true };
        const error = new Error('getUserMedia failed');

        global.window.HorizonWebRtcRedirectionAPI.getUserMedia.rejects(error);

        try {
            await instance._gUM(constraints);
            chai.assert.fail('Should have thrown an error');
        } catch (err) {
            chai.expect(err).to.equal(error);
        }
    });

    it('should call enumerate devices successfully', async () => {
        const instance = new OmnissaVDIStrategy(false);

        // Calling our class method _enumerateDevices
        const devices = await instance._enumerateDevices();

        // Verify that enumerateDevices was called
        sinon.assert.calledWith(global.window.HorizonWebRtcRedirectionAPI.enumerateDevices);
    });

    it('should call add and remove device listener successfully', async () => {
        const instance = new OmnissaVDIStrategy(false);

        const func = () => { };

        instance._addDeviceChangeListener(func);
        instance._removeDeviceChangeListener(func);

        global.window.navigator.mediaDevices.addEventListener.calledWith('devicechange', func);
        global.window.navigator.mediaDevices.removeEventListener.calledWith('devicechange', func);
    });

    it('should create RTC peer connection', () => {
        const instance = new OmnissaVDIStrategy(false);
        const config = { iceServers: [] };
        const optionalConfig = { optional: [] };

        instance._createRtcPeerConnection(config, optionalConfig);

        sinon.assert.calledWith(
            global.window.HorizonWebRtcRedirectionAPI.newPeerConnection,
            config,
            optionalConfig
        );
    });

    describe('whenConnected', () => {
        it('resolves when vdiClientConnected event fires', async () => {
            const instance = new OmnissaVDIStrategy(false);
            const eventHandler = global.window.HorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];

            let resolved = false;
            instance.whenConnected().then(() => { resolved = true; });
            await Promise.resolve();
            chai.expect(resolved).to.be.false;

            eventHandler({ event: 'vdiClientConnected' });
            await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
            chai.expect(resolved).to.be.true;
        });

        it('rejects after 10s if vdiClientConnected never fires', async () => {
            const instance = new OmnissaVDIStrategy(false);

            let rejection: any = null;
            instance.whenConnected().catch((err: any) => { rejection = err; });

            (global as any).clock.tick(10001);
            await Promise.resolve(); await Promise.resolve();
            chai.expect(rejection).to.be.instanceOf(Error);
            chai.expect(rejection.message).to.include('did not connect within 10000ms');
        });

        it('blocks again after vdiClientDisconnected', async () => {
            const instance = new OmnissaVDIStrategy(false);
            const eventHandler = global.window.HorizonWebRtcRedirectionAPI.initSDK.getCall(0).args[2];

            eventHandler({ event: 'vdiClientConnected' });
            await instance.whenConnected();

            eventHandler({ event: 'vdiClientDisconnected' });
            let resolvedAgain = false;
            instance.whenConnected().then(() => { resolvedAgain = true; }).catch(() => {});
            await Promise.resolve();
            chai.expect(resolvedAgain).to.be.false;
        });
    });
});