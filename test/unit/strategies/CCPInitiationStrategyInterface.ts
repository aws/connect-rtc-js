import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import CCPInitiationStrategyInterface from '../../../src/strategies/CCPInitiationStrategyInterface';

describe('CCPInitiationStrategyInterface.whenConnected', () => {
    it('resolves immediately by default', async () => {
        const strategy = new CCPInitiationStrategyInterface();
        let resolved = false;
        await strategy.whenConnected().then(() => { resolved = true; });
        chai.expect(resolved).to.be.true;
    });
});
