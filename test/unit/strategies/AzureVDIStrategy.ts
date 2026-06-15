import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const { expect } = chai;

import { GlobalMocker } from '../globalMock';
declare var global: GlobalMocker;

import AzureVDIStrategy from '../../../src/strategies/AzureVDIStrategy';
import StandardStrategy from '../../../src/strategies/StandardStrategy';

describe('AzureVDIStrategy', () => {

    let originalUserAgent: string;
    let originalMediaDevices: any;
    let originalConnect: any;

    beforeEach(() => {
        originalUserAgent = globalThis.navigator.userAgent;
        originalMediaDevices = globalThis.navigator.mediaDevices;
        originalConnect = (globalThis as any).connect;
    });

    afterEach(() => {
        sinon.restore();
        Object.defineProperty(globalThis.navigator, 'userAgent', {
            value: originalUserAgent, writable: true, configurable: true
        });
        Object.defineProperty(globalThis.navigator, 'mediaDevices', {
            value: originalMediaDevices, writable: true, configurable: true
        });
        (globalThis as any).connect = originalConnect;
    });

    function setUserAgent(ua: string) {
        Object.defineProperty(globalThis.navigator, 'userAgent', {
            value: ua,
            writable: true,
            configurable: true
        });
    }

    function setMediaDevices(props: Record<string, any> = {}) {
        const base = {
            getUserMedia: sinon.stub(),
            enumerateDevices: sinon.stub(),
            addEventListener: sinon.stub(),
            removeEventListener: sinon.stub(),
            ...props
        };
        Object.defineProperty(globalThis.navigator, 'mediaDevices', {
            value: base,
            writable: true,
            configurable: true
        });
    }

    function setupValidEnv() {
        setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
        setMediaDevices({ isCallRedirectionEnabled: true });
    }

    describe('constructor validation', () => {
        it('throws on unsupported browser (Firefox)', () => {
            setUserAgent('Mozilla/5.0 Firefox/120.0');
            setMediaDevices({ isCallRedirectionEnabled: true });
            expect(() => new AzureVDIStrategy()).to.throw('Azure VDI Call Redirection is not supported on browser: Edge or Chrome required');
        });

        it('throws when isCallRedirectionEnabled is false', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({ isCallRedirectionEnabled: false });
            expect(() => new AzureVDIStrategy()).to.throw('Azure VDI Call Redirection is not active');
        });

        it('throws when isCallRedirectionEnabled is undefined', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({});
            expect(() => new AzureVDIStrategy()).to.throw('Azure VDI Call Redirection is not active');
        });

        it('throws when navigator.mediaDevices is undefined', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            Object.defineProperty(globalThis.navigator, 'mediaDevices', {
                value: undefined,
                writable: true,
                configurable: true
            });
            expect(() => new AzureVDIStrategy()).to.throw('Azure VDI Call Redirection is not active');
        });

        it('succeeds on Chrome with isCallRedirectionEnabled true', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            expect(strategy).to.be.instanceOf(AzureVDIStrategy);
        });

        it('succeeds on Edge (Edg token) with isCallRedirectionEnabled true', () => {
            setUserAgent('Mozilla/5.0 Edg/120.0.0.0');
            setMediaDevices({ isCallRedirectionEnabled: true });
            const strategy = new AzureVDIStrategy();
            expect(strategy).to.be.instanceOf(AzureVDIStrategy);
        });
    });

    describe('getStrategyName', () => {
        it('returns AzureVDIStrategy', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            expect(strategy.getStrategyName()).to.equal('AzureVDIStrategy');
        });
    });

    describe('_isEarlyMediaConnectionSupported', () => {
        it('returns true', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            expect(strategy._isEarlyMediaConnectionSupported()).to.be.true;
        });
    });

    describe('isRedirectionAvailable', () => {
        it('returns true when isCallRedirectionEnabled and mmrExtensionVersion are present', () => {
            setMediaDevices({ isCallRedirectionEnabled: true, mmrExtensionVersion: '1.0' });
            expect(AzureVDIStrategy.isRedirectionAvailable()).to.be.true;
        });

        it('returns false when isCallRedirectionEnabled is false', () => {
            setMediaDevices({ isCallRedirectionEnabled: false, mmrExtensionVersion: '1.0' });
            expect(AzureVDIStrategy.isRedirectionAvailable()).to.be.false;
        });

        it('returns false when mmrExtensionVersion is undefined', () => {
            setMediaDevices({ isCallRedirectionEnabled: true });
            expect(AzureVDIStrategy.isRedirectionAvailable()).to.be.false;
        });

        it('returns false when navigator.mediaDevices is undefined', () => {
            Object.defineProperty(globalThis.navigator, 'mediaDevices', {
                value: undefined, writable: true, configurable: true
            });
            expect(AzureVDIStrategy.isRedirectionAvailable()).to.be.false;
        });
    });

    describe('logger initialization', () => {
        it('initializes logger when global.connect.getLog is available', () => {
            setupValidEnv();
            const mockLogger = {
                info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
                warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
                error: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
                log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
                trace: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
                debug: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }),
            };
            (globalThis as any).connect = { getLog: () => mockLogger };
            const strategy = new AzureVDIStrategy();
            expect((strategy as any)._logger).to.not.be.null;
        });

        it('sets logger to null when global.connect is unavailable', () => {
            setupValidEnv();
            (global as any).connect = undefined;
            const strategy = new AzureVDIStrategy();
            expect((strategy as any)._logger).to.be.null;
        });
    });

    describe('_collectMetadata', () => {
        it('reads properties with azure-prefixed keys and strips GUIDs', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: '1.2.3',
                mmrHostVersion: '4.5.6',
                mmrExtensionVersion: '7.8.9',
                activityId: '{ACT-123-456}',
                connectionId: '{CONN-789-012}'
            });
            const strategy = new AzureVDIStrategy();
            const diag = (strategy as any)._metadata;
            expect(diag.azureMmrHostVersion).to.equal('4.5.6');
            expect(diag.azureMmrExtensionVersion).to.equal('7.8.9');
            expect(diag.azureActivityId).to.equal('ACT-123-456');
            expect(diag.azureConnectionId).to.equal('CONN-789-012');
            expect(diag).to.not.have.property('vdiClientVersion');
            expect(strategy.getVdiClientVersion()).to.equal('1.2.3');
        });

        it('returns nulls when properties are missing', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            const diag = (strategy as any)._metadata;
            expect(diag.azureMmrHostVersion).to.be.null;
            expect(diag.azureMmrExtensionVersion).to.be.null;
            expect(diag.azureActivityId).to.be.null;
            expect(diag.azureConnectionId).to.be.null;
            expect(strategy.getVdiClientVersion()).to.be.null;
        });

        it('sanitizes values with disallowed characters', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: '1.0#special!chars',
                mmrHostVersion: '2.0;extra,stuff',
                mmrExtensionVersion: '3.0\n\rnewlines',
                activityId: 'act-123',
                connectionId: 'conn-456'
            });
            const strategy = new AzureVDIStrategy();
            const diag = (strategy as any)._metadata;
            expect(strategy.getVdiClientVersion()).to.not.include('#');
            expect(strategy.getVdiClientVersion()).to.not.include('!');
            expect(diag.azureMmrHostVersion).to.not.include(';');
            expect(diag.azureMmrHostVersion).to.not.include(',');
            expect(diag.azureMmrExtensionVersion).to.not.include('\n');
        });

        it('truncates values exceeding 256 characters', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: 'a'.repeat(300),
            });
            const strategy = new AzureVDIStrategy();
            expect(strategy.getVdiClientVersion()).to.have.lengthOf(256);
        });

        it('coerces numbers to strings and rejects objects', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: 12345,
                mmrHostVersion: { nested: 'object' },
                activityId: true,
            });
            const strategy = new AzureVDIStrategy();
            expect(strategy.getVdiClientVersion()).to.equal('12345');
            expect((strategy as any)._metadata.azureMmrHostVersion).to.be.null;
            expect((strategy as any)._metadata.azureActivityId).to.be.null;
        });
    });

    describe('getMetadata', () => {
        it('returns azure-prefixed keys and refreshes GUIDs', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: '1.0',
                mmrHostVersion: '2.0',
                mmrExtensionVersion: '3.0',
                activityId: '{OLD-ACT}',
                connectionId: '{OLD-CONN}'
            });
            const strategy = new AzureVDIStrategy();
            (navigator.mediaDevices as any).activityId = '{NEW-ACT}';
            (navigator.mediaDevices as any).connectionId = '{NEW-CONN}';
            const diag = strategy.getMetadata();
            expect(diag.azureActivityId).to.equal('NEW-ACT');
            expect(diag.azureConnectionId).to.equal('NEW-CONN');
            expect(diag.azureMmrHostVersion).to.equal('2.0');
            expect(diag.azureMmrExtensionVersion).to.equal('3.0');
            expect(diag).to.not.have.property('vdiClientVersion');
        });
    });

    describe('getVdiClientVersion', () => {
        it('returns mmrClientVersion', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                mmrClientVersion: '1.0.2601.09002',
            });
            const strategy = new AzureVDIStrategy();
            expect(strategy.getVdiClientVersion()).to.equal('1.0.2601.09002');
        });
    });

    describe('_registerReconnectionListener', () => {
        it('calls addEventListener with correct event name', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            expect(navigator.mediaDevices.addEventListener).to.have.been.calledWith(
                'rdpClientConnectionStateChanged',
                sinon.match.func
            );
        });
    });

    describe('_handleRdpStateChange', () => {
        it('calls _onConnectionNeedingCleanupHandler on disconnected', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            const handler = sinon.stub();
            strategy.onConnectionNeedingCleanup(handler);
            (strategy as any)._handleRdpStateChange({ detail: { state: 'disconnected' } });
            expect(handler).to.have.been.calledOnce;
            expect(handler).to.have.been.calledWith(strategy);
        });

        it('refreshes diagnostics on connected', () => {
            setUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
            setMediaDevices({
                isCallRedirectionEnabled: true,
                activityId: '{OLD-ACT}',
                connectionId: '{OLD-CONN}'
            });
            const strategy = new AzureVDIStrategy();
            (navigator.mediaDevices as any).activityId = '{NEW-ACT}';
            (navigator.mediaDevices as any).connectionId = '{NEW-CONN}';
            (strategy as any)._handleRdpStateChange({ detail: { state: 'connected' } });
            const diag = (strategy as any)._metadata;
            expect(diag.azureActivityId).to.equal('NEW-ACT');
            expect(diag.azureConnectionId).to.equal('NEW-CONN');
        });
    });

    describe('onConnectionNeedingCleanup', () => {
        it('stores handler and it is called on disconnect', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            const handler = sinon.stub();
            strategy.onConnectionNeedingCleanup(handler);
            // Simulate disconnect
            (strategy as any)._handleRdpStateChange({ detail: { state: 'disconnected' } });
            expect(handler).to.have.been.calledOnce;
            expect(handler).to.have.been.calledWith(strategy);
        });
    });

    describe('inherited StandardStrategy methods', () => {
        it('inherits from StandardStrategy', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            expect(strategy).to.be.instanceOf(StandardStrategy);
        });

        it('has inherited WebRTC methods without overriding them', () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            const inherited = ['_gUM', '_createRtcPeerConnection', 'setRemoteDescription',
                '_createMediaStream', 'addStream', 'onIceStateChange',
                'onPeerConnectionStateChange', '_createPeerConnection', '_ontrack',
                '_enumerateDevices'];
            for (const method of inherited) {
                expect(strategy[method]).to.be.a('function');
                expect(strategy[method]).to.equal(StandardStrategy.prototype[method],
                    `${method} should not be overridden`);
            }
        });
    });

    describe('whenConnected', () => {
        it('resolves immediately when RDP is already connected at construction', async () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            let resolved = false;
            await strategy.whenConnected().then(() => { resolved = true; });
            expect(resolved).to.be.true;
        });

        it('rejects after 10s if RDP does not reconnect after a disconnect', async () => {
            setupValidEnv();
            const strategy = new AzureVDIStrategy();
            const listener = (navigator.mediaDevices.addEventListener as sinon.SinonStub).getCall(0).args[1];

            // Simulate disconnect → whenConnected() now blocks
            listener({ detail: { state: 'disconnected' } } as any);

            let rejection: any = null;
            strategy.whenConnected().catch((err: any) => { rejection = err; });

            (global as any).clock.tick(10001);
            await Promise.resolve(); await Promise.resolve();
            expect(rejection).to.be.instanceOf(Error);
            expect(rejection.message).to.include('did not connect within 10000ms');
        });
    });
});
