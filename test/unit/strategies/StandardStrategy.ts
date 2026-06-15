import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from "@salesforce/ts-sinon";
chai.use(sinonChai);

import { GlobalMocker } from '../globalMock';
declare var global: GlobalMocker;

import StandardStrategy from '../../../src/strategies/StandardStrategy';

describe('StandardStrategy', () => {

    var strategy = new StandardStrategy();

    it('uses StandardStrategy', () => {
        (console.log as sinon.SinonStub).calledWith('StandardStrategy initialized');
    });

});