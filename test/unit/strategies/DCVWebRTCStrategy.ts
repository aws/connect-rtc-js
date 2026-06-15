import * as sinon  from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import DCVWebRTCStrategy from '../../../src/strategies/DCVWebRTCStrategy';

chai.use(sinonChai);

describe('DCVWebRTCStrategy', () => {
    let sandbox = sinon.createSandbox();
    let mockProxy: any;
    let mockMediaDevicesProxy: any;
    let statusChangeListener: any;

    function createMockProxy() {
        statusChangeListener = null;
        mockMediaDevicesProxy = {
            enumerateDevices: sandbox.stub().resolves(['mockDevice']),
            addEventListener: sandbox.stub(),
            removeEventListener: sandbox.stub(),
        };
        mockProxy = {
            overrideWebRTC: sandbox.stub(),
            getVersion: sandbox.stub().returns('2.0.0'),
            clientInfo: {
                platform: 'windows',
                version: '2.0.0',
                userAgent: 'test-agent',
                browserDetails: { browser: 'chrome', version: 80 }
            },
            enumerateDevices: sandbox.stub().resolves(['mockDevice']),
            addEventListener: sandbox.stub(),
            removeEventListener: sandbox.stub(),
            resetHeartbeat: sandbox.stub(),
            addStatusChangeEventListener: sandbox.stub().callsFake((cb) => {
                statusChangeListener = cb;
            }),
            makeMediaDevicesProxy: sandbox.stub().returns(mockMediaDevicesProxy),
        };
        return mockProxy;
    }

    afterEach(() => {
        delete (globalThis as any).DCVWebRTCPeerConnectionProxyV2;
        sandbox.restore();
    });

    describe('V2 API (preferred)', () => {
        beforeEach(() => {
            createMockProxy();
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub().callsFake((cb) => {
                    cb({ success: true, proxy: mockProxy });
                }),
            };
            (window as any) = {};
            global.connect = { getLog: sandbox.stub() };
        });

        it('should initialize with V2 API and use result.proxy', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect((globalThis as any).DCVWebRTCPeerConnectionProxyV2.setInitCallback).to.have.been.calledOnce;
            chai.expect(mockProxy.overrideWebRTC).to.have.been.calledOnce;
            sinon.assert.calledWith((console.log as sinon.SinonStub), 'DCVStrategy initialized (V2), version:', '2.0.0');
        });

        it('should configure heartbeat on init', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect(mockProxy.resetHeartbeat).to.have.been.calledOnceWith({
                heartbeatTimeoutMs: 5000,
                heartbeatIntervalPeriodMs: 500
            });
        });

        it('should register status change listener on init', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect(mockProxy.addStatusChangeEventListener).to.have.been.calledOnce;
            chai.expect(statusChangeListener).to.be.a('function');
        });

        it('should create mediaDevicesProxy on init', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect(mockProxy.makeMediaDevicesProxy).to.have.been.calledOnce;
        });

        it('should call cleanup handler on unavailable status', () => {
            const instance = new DCVWebRTCStrategy();
            const cleanupHandler = sandbox.stub();
            instance.onConnectionNeedingCleanup(cleanupHandler);

            statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });

            chai.expect(cleanupHandler).to.have.been.calledOnce;
        });

        it('should not throw if no cleanup handler registered on unavailable', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect(() => {
                statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
            }).to.not.throw();
        });

        it('should call overrideWebRTC and resetHeartbeat on available status', () => {
            const instance = new DCVWebRTCStrategy();
            mockProxy.overrideWebRTC.resetHistory();
            mockProxy.resetHeartbeat.resetHistory();

            statusChangeListener({ status: 'available' });

            chai.expect(mockProxy.overrideWebRTC).to.have.been.calledOnce;
            chai.expect(mockProxy.resetHeartbeat).to.have.been.calledOnceWith({
                heartbeatTimeoutMs: 5000,
                heartbeatIntervalPeriodMs: 500
            });
        });

        it('should handle full unavailable -> available reconnection cycle', () => {
            const instance = new DCVWebRTCStrategy();
            const cleanupHandler = sandbox.stub();
            instance.onConnectionNeedingCleanup(cleanupHandler);
            mockProxy.overrideWebRTC.resetHistory();

            statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
            chai.expect(cleanupHandler).to.have.been.calledOnce;

            statusChangeListener({ status: 'available' });
            chai.expect(mockProxy.overrideWebRTC).to.have.been.calledOnce;
        });

        it('should enumerate devices via mediaDevicesProxy', async () => {
            const instance = new DCVWebRTCStrategy();
            const devices = await instance._enumerateDevices();
            chai.expect(devices).to.include('mockDevice');
            chai.expect(mockMediaDevicesProxy.enumerateDevices).to.have.been.calledOnce;
        });

        it('should add and remove device listener via mediaDevicesProxy', () => {
            const instance = new DCVWebRTCStrategy();
            const func = () => {};

            instance._addDeviceChangeListener(func);
            instance._removeDeviceChangeListener(func);

            sinon.assert.calledWith(mockMediaDevicesProxy.addEventListener, 'devicechange', func);
            sinon.assert.calledWith(mockMediaDevicesProxy.removeEventListener, 'devicechange', func);
        });

        it('should still route proxy calls after reconnection', async () => {
            const instance = new DCVWebRTCStrategy();
            statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
            statusChangeListener({ status: 'available' });

            const devices = await instance._enumerateDevices();
            chai.expect(devices).to.include('mockDevice');
        });

        it('should survive multiple reconnection cycles', () => {
            const instance = new DCVWebRTCStrategy();
            const cleanupHandler = sandbox.stub();
            instance.onConnectionNeedingCleanup(cleanupHandler);
            mockProxy.overrideWebRTC.resetHistory();

            for (let i = 0; i < 3; i++) {
                statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
                statusChangeListener({ status: 'available' });
            }

            chai.expect(cleanupHandler).to.have.been.calledThrice;
            chai.expect(mockProxy.overrideWebRTC.callCount).to.equal(3);
        });

        it('should not crash if cleanup handler throws on unavailable', () => {
            const instance = new DCVWebRTCStrategy();
            const throwingHandler = sandbox.stub().throws(new Error('stale proxy'));
            instance.onConnectionNeedingCleanup(throwingHandler);

            chai.expect(() => {
                statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
            }).to.not.throw();
            sinon.assert.calledWith((console.error as sinon.SinonStub), 'Error during connection cleanup:', sinon.match.instanceOf(Error));
        });

        it('should ignore unknown status events', () => {
            const instance = new DCVWebRTCStrategy();
            const cleanupHandler = sandbox.stub();
            instance.onConnectionNeedingCleanup(cleanupHandler);
            mockProxy.overrideWebRTC.resetHistory();

            statusChangeListener({ status: 'something_else' });

            chai.expect(cleanupHandler).to.not.have.been.called;
            chai.expect(mockProxy.overrideWebRTC).to.not.have.been.called;
        });

        it('should throw on V2 init failure', () => {
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub().callsFake((cb) => {
                    cb({ success: false, error: 'not supported' });
                }),
            };
            chai.expect(() => new DCVWebRTCStrategy()).to.throw(
                'DCV WebRTC redirection feature is NOT supported!'
            );
        });
    });

    describe('V1 API (fallback)', () => {
        beforeEach(() => {
            createMockProxy();
            delete (globalThis as any).DCVWebRTCPeerConnectionProxyV2;
            (window as any) = {
                DCVWebRTCPeerConnectionProxy: {
                    setInitCallback: sandbox.stub().callsFake((cb) => {
                        cb({ success: true });
                    }),
                },
                DCVWebRTCRedirProxy: mockProxy,
            };
            global.connect = { getLog: sandbox.stub() };
        });

        it('should fall back to V1 API when V2 is not available', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect((window as any).DCVWebRTCPeerConnectionProxy.setInitCallback).to.have.been.calledOnce;
            chai.expect(mockProxy.overrideWebRTC).to.have.been.calledOnce;
            sinon.assert.calledWith((console.log as sinon.SinonStub), 'DCVStrategy initialized (V1)');
        });

        it('should not call reconnection APIs on V1', () => {
            const instance = new DCVWebRTCStrategy();
            chai.expect(mockProxy.resetHeartbeat).to.not.have.been.called;
            chai.expect(mockProxy.addStatusChangeEventListener).to.not.have.been.called;
            chai.expect(mockProxy.makeMediaDevicesProxy).to.not.have.been.called;
        });

        it('should enumerate devices via proxy directly on V1', async () => {
            const instance = new DCVWebRTCStrategy();
            const devices = await instance._enumerateDevices();
            chai.expect(devices).to.include('mockDevice');
            chai.expect(mockProxy.enumerateDevices).to.have.been.calledOnce;
            chai.expect(mockMediaDevicesProxy.enumerateDevices).to.not.have.been.called;
        });

        it('should add and remove device listener via proxy directly on V1', () => {
            const instance = new DCVWebRTCStrategy();
            const func = () => {};

            instance._addDeviceChangeListener(func);
            instance._removeDeviceChangeListener(func);

            sinon.assert.calledWith(mockProxy.addEventListener, 'devicechange', func);
            sinon.assert.calledWith(mockProxy.removeEventListener, 'devicechange', func);
            chai.expect(mockMediaDevicesProxy.addEventListener).to.not.have.been.called;
        });

        it('should throw on V1 init failure', () => {
            (window as any).DCVWebRTCPeerConnectionProxy = {
                setInitCallback: sandbox.stub().callsFake((cb) => {
                    cb({ success: false });
                }),
            };
            chai.expect(() => new DCVWebRTCStrategy()).to.throw(
                'DCV WebRTC redirection feature is NOT supported!'
            );
        });
    });

    describe('V2 preferred over V1', () => {
        it('should use V2 when both are available', () => {
            createMockProxy();
            const v2Stub = sandbox.stub().callsFake((cb) => {
                cb({ success: true, proxy: mockProxy });
            });
            const v1Stub = sandbox.stub();
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = { setInitCallback: v2Stub };
            (window as any) = {
                DCVWebRTCPeerConnectionProxy: { setInitCallback: v1Stub },
                DCVWebRTCRedirProxy: mockProxy,
            };
            global.connect = { getLog: sandbox.stub() };

            const instance = new DCVWebRTCStrategy();
            chai.expect(v2Stub).to.have.been.calledOnce;
            chai.expect(v1Stub).to.not.have.been.called;
        });
    });

    describe('no API available', () => {
        it('should throw if neither V2 nor V1 is available', () => {
            delete (globalThis as any).DCVWebRTCPeerConnectionProxyV2;
            (window as any) = {};
            global.connect = { getLog: sandbox.stub() };
            chai.expect(() => new DCVWebRTCStrategy()).to.throw(
                'DCV WebRTC redirection feature is NOT supported!'
            );
        });
    });

    describe('whenConnected', () => {
        beforeEach(() => {
            createMockProxy();
            global.connect = { getLog: sandbox.stub() };
        });

        it('resolves once init callback fires successfully (V2)', async () => {
            let initCallback: any;
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub().callsFake((cb) => { initCallback = cb; })
            };
            const instance = new DCVWebRTCStrategy();

            let resolved = false;
            instance.whenConnected().then(() => { resolved = true; });
            await Promise.resolve();
            chai.expect(resolved).to.be.false;

            initCallback({ success: true, proxy: mockProxy });
            await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
            chai.expect(resolved).to.be.true;
        });

        it('blocks on disconnect and resolves on reconnect', async () => {
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub().callsFake((cb) => {
                    cb({ success: true, proxy: mockProxy });
                })
            };
            const instance = new DCVWebRTCStrategy();
            await instance.whenConnected();

            statusChangeListener({ status: 'unavailable', lastHeartbeat: Date.now() - 6000 });
            let resolvedAgain = false;
            instance.whenConnected().then(() => { resolvedAgain = true; }).catch(() => {});
            await Promise.resolve();
            chai.expect(resolvedAgain).to.be.false;

            statusChangeListener({ status: 'available' });
            await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
            chai.expect(resolvedAgain).to.be.true;
        });

        it('rejects after 10s if init callback never fires', async () => {
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub()
            };
            const instance = new DCVWebRTCStrategy();

            let rejection: any = null;
            instance.whenConnected().catch((err: any) => { rejection = err; });

            (global as any).clock.tick(10001);
            await Promise.resolve(); await Promise.resolve();
            chai.expect(rejection).to.be.instanceOf(Error);
            chai.expect(rejection.message).to.include('did not connect within 10000ms');
        });

        it('rejects immediately when init callback reports failure', async () => {
            (globalThis as any).DCVWebRTCPeerConnectionProxyV2 = {
                setInitCallback: sandbox.stub().callsFake((cb) => {
                    try { cb({ success: false }); } catch (_) { /* rethrown */ }
                })
            };

            let rejection: any = null;
            try {
                const instance = new DCVWebRTCStrategy();
                instance.whenConnected().catch((err: any) => { rejection = err; });
            } catch (_) { /* constructor may rethrow */ }

            await Promise.resolve(); await Promise.resolve();
            chai.expect(rejection).to.be.instanceOf(Error);
            chai.expect(rejection.message).to.include('NOT supported');
        });
    });
});
