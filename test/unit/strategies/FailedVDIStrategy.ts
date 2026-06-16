import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const { expect } = chai;

import FailedVDIStrategy from '../../../src/strategies/FailedVDIStrategy';
import CCPInitiationStrategyInterface from '../../../src/strategies/CCPInitiationStrategyInterface';

describe('FailedVDIStrategy', () => {
    const vdiPlatform = 'AZURE';
    const errorMessage = 'Azure VDI Call Redirection is not active';
    let strategy: FailedVDIStrategy;

    beforeEach(() => {
        strategy = new FailedVDIStrategy(vdiPlatform, errorMessage);
    });

    it('extends CCPInitiationStrategyInterface', () => {
        expect(strategy).to.be.instanceOf(CCPInitiationStrategyInterface);
    });

    it('stores vdiPlatform and errorMessage on construction', async () => {
        // Indirectly verified via rejected error from _gUM
        try {
            await (strategy as any)._gUM();
            expect.fail('expected _gUM to reject');
        } catch (e: any) {
            expect(e.message).to.equal(`VDI strategy failed to initialize for ${vdiPlatform}: ${errorMessage}`);
        }
    });

    it('getStrategyName returns "FailedVDIStrategy"', () => {
        expect(strategy.getStrategyName()).to.equal('FailedVDIStrategy');
    });

    it('_isEarlyMediaConnectionSupported returns false', () => {
        expect((strategy as any)._isEarlyMediaConnectionSupported()).to.equal(false);
    });

    it('_gUM returns a rejected Promise with descriptive error', async () => {
        const result = (strategy as any)._gUM();
        expect(result).to.be.an.instanceof(Promise);
        try {
            await result;
            expect.fail('expected _gUM to reject');
        } catch (e: any) {
            expect(e.message).to.equal(`VDI strategy failed to initialize for ${vdiPlatform}: ${errorMessage}`);
        }
    });

    it('_createRtcPeerConnection throws with descriptive error', () => {
        expect(() => (strategy as any)._createRtcPeerConnection())
            .to.throw(`VDI strategy failed to initialize for ${vdiPlatform}: ${errorMessage}`);
    });

    it('_createPeerConnection throws with descriptive error', () => {
        expect(() => (strategy as any)._createPeerConnection())
            .to.throw(`VDI strategy failed to initialize for ${vdiPlatform}: ${errorMessage}`);
    });

    it('onConnectionNeedingCleanup accepts handler without throwing', () => {
        const handler = () => {};
        expect(() => strategy.onConnectionNeedingCleanup(handler)).to.not.throw();
    });

    it('close no-ops without throwing', () => {
        expect(() => (strategy as any).close({ close: () => {} })).to.not.throw();
    });

    it('error message includes platform and original error for different platforms', async () => {
        const citrixStrategy = new FailedVDIStrategy('CITRIX', 'some citrix error');
        try {
            await (citrixStrategy as any)._gUM();
            expect.fail('expected _gUM to reject');
        } catch (e: any) {
            expect(e.message).to.equal('VDI strategy failed to initialize for CITRIX: some citrix error');
        }
    });
});
