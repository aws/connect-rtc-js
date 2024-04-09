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

    describe('constructor', () => {
        it('should initialize CitrixWebRTC, getCitrixWebrtcRedir, and logging', () => {
            const instance = new CitrixVDIStrategy(false);

            chai.expect(global.window.CitrixWebRTC.setVMEventCallback).to.have.been.calledOnce;
            chai.expect(global.window.getCitrixWebrtcRedir).to.be.a('function');
            chai.expect(global.window.CitrixWebRTC.initLog).to.have.been.calledOnce;
        });
    });

    describe('initCitrixWebRTC', () => {
        it('should throw an error if WebRTC redirection feature is not supported', () => {
            const instance = new CitrixVDIStrategy(false);
            global.window.CitrixWebRTC.isFeatureOn.returns(false);

            const callback = global.window.CitrixWebRTC.setVMEventCallback.getCall(0).args[0];
            chai.expect(() => callback({ event: 'vdiClientConnected' })).to.throw(
                'Citrix WebRTC redirection feature is NOT supported!'
            );
        });

        it('should log "CitrixVDIStrategy initialized" if WebRTC redirection feature is supported', () => {
            const instance = new CitrixVDIStrategy(false);
            global.window.CitrixWebRTC.isFeatureOn.returns(true);

            const callback = global.window.CitrixWebRTC.setVMEventCallback.getCall(0).args[0];
            callback({ event: 'vdiClientConnected' });
            chai.assert(console.log.calledWith('CitrixVDIStrategy initialized'));
        });

        it('should log "vdiClientDisconnected" on vdiClientDisconnected event', () => {
            const instance = new CitrixVDIStrategy(false);

            const callback = global.window.CitrixWebRTC.setVMEventCallback.getCall(0).args[0];
            callback({ event: 'vdiClientDisconnected' });
            chai.assert(console.log.calledWith('vdiClientDisconnected'));
        });
    });

    describe('initGetCitrixWebrtcRedir', () => {
        it('should set window.getCitrixWebrtcRedir to a function that resolves with 1', () => {
            const instance = new CitrixVDIStrategy(false);

            chai.expect(global.window.getCitrixWebrtcRedir).to.be.a('function');
            return global.window.getCitrixWebrtcRedir().then((result) => {
                chai.expect(result).to.equal(1);
            });
        });
    });

    describe('initLog', () => {
        it('should initialize logging with connect.getLog()', () => {
            const instance = new CitrixVDIStrategy(false);
            chai.assert(global.window.CitrixWebRTC.initLog.calledWith(global.connect.getLog()));
        });
    });
});