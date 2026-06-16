import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { StandbyPeerConnectionManager } from '../../src/standby_peer_connection_manager';

chai.use(sinonChai);
const expect = chai.expect;

/**
 * Flush the microtask queue so resolved promises execute their .then() callbacks.
 * Chains two Promise.resolve() because the code under test has a .then() after an
 * already-resolved promise — we need two microtask ticks for the callback to fire.
 */
const flushMicrotasks = () => Promise.resolve().then(() => Promise.resolve());

describe('StandbyPeerConnectionManager', () => {
    let mockLogger: any;
    let mockStrategy: any;
    let mockCreatePC: sinon.SinonStub;
    let config: any;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            log: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
        };
        mockStrategy = { close: sinon.spy() };
        mockCreatePC = sinon.stub();

        config = {
            logger: mockLogger,
            strategy: mockStrategy,
            clientId: 'test-client',
            createPeerConnection: mockCreatePC,
            isStandbyConnectionSupported: true,
            isPersistentConnectionAllowlistedAndEnabled: sinon.stub().returns(false),
            isPeerConnectionManagerClosed: sinon.stub().returns(false)
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('auto-request on creation', () => {
        it('should automatically request an standby PC on creation', async () => {
            const mockPC = { id: 'idle-pc' };
            mockCreatePC.resolves(mockPC);

            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            expect(mockCreatePC).to.have.been.calledOnce;
            expect(mgr.hasStandbyPc()).to.be.true;
        });

        it('should not request when early media not supported', async () => {
            config.isStandbyConnectionSupported = false;
            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            expect(mockCreatePC).to.not.have.been.called;
            expect(mgr.hasStandbyPc()).to.be.false;
        });
    });

    describe('hasStandbyPc / consumeStandbyPc', () => {
        it('should return false when no standby PC exists (early media not supported)', () => {
            config.isStandbyConnectionSupported = false;
            const mgr = new StandbyPeerConnectionManager(config);
            expect(mgr.hasStandbyPc()).to.be.false;
        });

        it('should return null when consuming empty standby PC', () => {
            config.isStandbyConnectionSupported = false;
            const mgr = new StandbyPeerConnectionManager(config);
            expect(mgr.consumeStandbyPc()).to.be.null;
        });
    });

    describe('auto-request on consumption', () => {
        it('should auto-request a replacement standby PC after consumption', async () => {
            const mockPC1 = { id: 'idle-pc-1' };
            const mockPC2 = { id: 'idle-pc-2' };
            mockCreatePC.onFirstCall().resolves(mockPC1);
            mockCreatePC.onSecondCall().resolves(mockPC2);

            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            expect(mgr.hasStandbyPc()).to.be.true;
            const consumed = mgr.consumeStandbyPc();
            expect(consumed).to.equal(mockPC1);
            expect(mgr.hasStandbyPc()).to.be.false;

            // Second call was triggered by consumeStandbyPc
            expect(mockCreatePC).to.have.been.calledTwice;

            await flushMicrotasks();
            expect(mgr.hasStandbyPc()).to.be.true;
        });
    });

    describe('standby PC storage conditions', () => {
        it('should close the created PC when PCM is closed', async () => {
            const mockPC = { id: 'idle-pc' };
            mockCreatePC.resolves(mockPC);
            config.isPeerConnectionManagerClosed.returns(true);
            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            expect(mgr.hasStandbyPc()).to.be.false;
            expect(mockStrategy.close).to.have.been.calledWith(mockPC);
        });

        it('should handle request failure gracefully', async () => {
            mockCreatePC.rejects(new Error('Failed'));
            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            expect(mgr.hasStandbyPc()).to.be.false;
        });
    });

    describe('closeStandbyConnection', () => {
        it('should clear timer and close PC', async () => {
            const mockPC = { id: 'idle-pc' };
            mockCreatePC.resolves(mockPC);
            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            mgr.closeStandbyConnection();
            expect(mgr.hasStandbyPc()).to.be.false;
            expect(mockStrategy.close).to.have.been.calledWith(mockPC);
        });

        it('should not throw when no standby PC exists', () => {
            config.isStandbyConnectionSupported = false;
            const mgr = new StandbyPeerConnectionManager(config);
            expect(() => mgr.closeStandbyConnection()).to.not.throw();
        });
    });

    describe('clearRefreshTimer', () => {
        it('should not throw when no timer exists', () => {
            config.isStandbyConnectionSupported = false;
            const mgr = new StandbyPeerConnectionManager(config);
            expect(() => mgr.clearRefreshTimer()).to.not.throw();
        });
    });

    describe('consumeStandbyPc', () => {
        it('should return the PC, null the reference, and auto-request a replacement', async () => {
            const mockPC1 = { id: 'standby-pc-1' };
            const mockPC2 = { id: 'standby-pc-2' };
            mockCreatePC.onFirstCall().resolves(mockPC1);
            mockCreatePC.onSecondCall().resolves(mockPC2);
            const mgr = new StandbyPeerConnectionManager(config);
            await flushMicrotasks();

            const consumed = mgr.consumeStandbyPc();
            expect(consumed).to.equal(mockPC1);
            expect(mgr.hasStandbyPc()).to.be.false;
            // consumeStandbyPc should trigger a new request
            expect(mockCreatePC).to.have.been.calledTwice;

            await flushMicrotasks();
            expect(mgr.hasStandbyPc()).to.be.true;
        });
    });
});
