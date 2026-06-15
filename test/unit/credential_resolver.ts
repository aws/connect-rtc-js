import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { CredentialResolver } from '../../src/credential_resolver';

chai.use(sinonChai);
const expect = chai.expect;

describe('CredentialResolver', () => {
    let mockLogger: any;
    let mockTransportHandle: sinon.SinonStub;

    beforeEach(() => {
        mockLogger = {
            info: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
            warn: sinon.stub().returns({ sendInternalLogToServer: sinon.stub(), withObject: sinon.stub().returns({ sendInternalLogToServer: sinon.stub() }) }),
        };
        mockTransportHandle = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getCachedIceURL', () => {
        it('should fetch on first call and return cache on second call without re-fetching', async () => {
            mockTransportHandle.resolves([{ urls: ['turn:server.example.com'] }]);
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            const first = await mgr._getCachedIceURL();
            const second = await mgr._getCachedIceURL();

            expect(first).to.equal('turn:server.example.com');
            expect(second).to.equal('turn:server.example.com');
            expect(mockTransportHandle).to.have.been.calledOnce;
        });

        it('should return null and not retry after failed fetch', async () => {
            mockTransportHandle.rejects(new Error('Fetch failed'));
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            const result1 = await mgr._getCachedIceURL();
            const result2 = await mgr._getCachedIceURL();

            expect(result1).to.be.null;
            expect(result2).to.be.null;
            expect(mockTransportHandle).to.have.been.calledOnce;
        });

        it('should return null for empty ICE servers', async () => {
            mockTransportHandle.resolves([]);
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            const result = await mgr._getCachedIceURL();

            expect(result).to.be.null;
        });
    });

    describe('_isContactCrossRegion', () => {
        it('should return false when no cached URL (cannot compare)', async () => {
            mockTransportHandle.rejects(new Error('timeout'));
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            const contactIce = [{ urls: ['turn:contact.example.com'] }];
            const result = await mgr._isContactCrossRegion(contactIce);

            expect(result).to.be.false;
        });

        it('should return false when same region', async () => {
            mockTransportHandle.resolves([{ urls: ['turn:same-region.com'] }]);
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            // Prime the cache
            await mgr._getCachedIceURL();

            const contactIce = [{ urls: ['turn:same-region.com'] }];
            const result = await mgr._isContactCrossRegion(contactIce);

            expect(result).to.be.false;
        });

        it('should return true for cross-region', async () => {
            mockTransportHandle.resolves([{ urls: ['turn:region-a.com'] }]);
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            // Prime the cache
            await mgr._getCachedIceURL();

            const contactIce = [{ urls: ['turn:region-b.com'] }];
            const result = await mgr._isContactCrossRegion(contactIce);

            expect(result).to.be.true;
        });
    });

    describe('recordCredentialSource', () => {
        it('should record source on session report', () => {
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);
            const report: any = {};

            mgr.recordCredentialSource(report, 'api-fetched', true);

            expect(report.iceCredentialSource).to.equal('api-fetched');
            expect(report.isContactCredentialsDifferentRegion).to.be.true;
        });

        it('should not throw for null session report', () => {
            const mgr: any = new CredentialResolver(mockTransportHandle, mockLogger);

            expect(() => mgr.recordCredentialSource(null, 'api-fetched')).to.not.throw();
        });
    });

});
