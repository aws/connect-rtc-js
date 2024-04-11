import sinon, { sandbox } from 'sinon';
import chai from 'chai';
import CitrixVDIStrategy from '../../../src/js/strategies/CitrixVDIStrategy.js';

describe('CitrixVDIStrategy', () => {
    beforeEach(() => {
        global.window = {
            CitrixWebRTC: {
                setVMEventCallback: sandbox.stub(),
                isFeatureOn: sandbox.stub(),
                initUCSDK: sandbox.stub(),
                initLog: sandbox.stub(),
            },
            getCitrixWebrtcRedir: null,
        };
        global.connect = { getLog: sandbox.stub() };
    });

    afterEach(() => {
        sandbox.restore();
        delete global.window;
        delete global.connect;
    });

    it('should initialize CitrixWebRTC, getCitrixWebrtcRedir, and logging successfully', () => {
        const instance = new CitrixVDIStrategy(false);
        global.window.CitrixWebRTC.isFeatureOn= sandbox.stub().returns(true);
        chai.expect(global.window.CitrixWebRTC.setVMEventCallback).to.have.been.calledOnce;
        chai.expect(global.window.getCitrixWebrtcRedir).to.be.a('function');
        chai.expect(global.window.CitrixWebRTC.initLog).to.have.been.calledOnce;

        const callback = global.window.CitrixWebRTC.setVMEventCallback.getCall(0).args[0];
        callback({ event: 'vdiClientConnected' });
        chai.assert(console.log.calledWith('CitrixVDIStrategy initialized'));

        callback({ event: 'vdiClientDisconnected' });
        chai.assert(console.log.calledWith('vdiClientDisconnected'));

        chai.expect(global.window.getCitrixWebrtcRedir).to.be.a('function');
        global.window.getCitrixWebrtcRedir().then((result) => {
            chai.expect(result).to.equal(1);
        });

        chai.assert(global.window.CitrixWebRTC.initLog.calledWith(global.connect.getLog()));
    });

    it('should throw an error if WebRTC redirection feature is not supported', () => {
        const instance = new CitrixVDIStrategy(false);
        global.window.CitrixWebRTC.isFeatureOn= sandbox.stub().returns(false);
        const callback = global.window.CitrixWebRTC.setVMEventCallback.getCall(0).args[0];
        chai.expect(() => callback({ event: 'vdiClientConnected' })).to.throw(
            'Citrix WebRTC redirection feature is NOT supported!'
        );
    });

});