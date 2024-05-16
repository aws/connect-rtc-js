import { sandbox } from 'sinon';
import chai from 'chai';
import DCVWebRTCStrategy from '../../../src/js/strategies/DCVWebRTCStrategy';

describe('DCVWebRTCStrategy', () => {
    beforeEach(() => {
        global.window = {
            DCVWebRTCPeerConnectionProxy: {
                setInitCallback: sandbox.stub(),
            },
            DCVWebRTCRedirProxy : {
                overrideWebRTC : sandbox.stub(),
            },
        };
        global.connect = { getLog: sandbox.stub() };
    });

    afterEach(() => {
        sandbox.restore();
        delete global.window;
    });

    it('should initialize DCVWebRTCPeerConnectionProxy successfully', () => {

        global.window.DCVWebRTCPeerConnectionProxy= sandbox.stub().returns(true);

        global.window.DCVWebRTCPeerConnectionProxy.setInitCallback = sandbox.stub().returns({success:true});
        global.window.DCVWebRTCRedirProxy = sandbox.stub().returns({version: 1.0});
        global.window.DCVWebRTCRedirProxy.overrideWebRTC = sandbox.stub().returns(true);
        const instance = new DCVWebRTCStrategy();
        chai.expect(global.window.DCVWebRTCPeerConnectionProxy.setInitCallback).to.have.been.calledOnce;
        chai.expect(global.window.DCVWebRTCPeerConnectionProxy.setInitCallback).to.be.a('function');

        const callback = global.window.DCVWebRTCPeerConnectionProxy.setInitCallback.getCall(0).args[0];
        callback({success:true, proxy : {version: 1.0}});
        chai.assert(console.log.calledWith('DCVStrategy initialized'));
    });

    it('should throw an error if WebRTC redirection feature is not supported', () => {
        global.window.DCVWebRTCPeerConnectionProxy= sandbox.stub().returns(true);
        global.window.DCVWebRTCPeerConnectionProxy.setInitCallback = sandbox.stub().returns({success:false});
        const instance = new DCVWebRTCStrategy();


        chai.expect(global.window.DCVWebRTCPeerConnectionProxy.setInitCallback).to.have.been.calledOnce;
        chai.expect(global.window.DCVWebRTCPeerConnectionProxy.setInitCallback).to.be.a('function');
        const callback = global.window.DCVWebRTCPeerConnectionProxy.setInitCallback.getCall(0).args[0];
        chai.expect(() => callback({success:false})).to.throw(
            'DCV WebRTC redirection feature is NOT supported!'
        );
    });

});