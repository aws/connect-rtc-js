import * as sinon from 'sinon';
import { GlobalMocker } from './globalMock';

let gMock: GlobalMocker;

beforeEach(() => {
    var log = console.log;
    sinon.stub(console, 'log')
        .callsFake((message) => {
            return log.apply(log, [message]);
        });

    var error = console.error;
    sinon.stub(console, 'error')
        .callsFake((message) => {
            return error.apply(error, [message]);
        });

    var warn = console.warn;
    sinon.stub(console, 'warn')
        .callsFake((message) => {
            return warn.apply(warn, [message]);
        });

    gMock = GlobalMocker.save();
});

afterEach(() => {
    sinon.restore();
    gMock.restore();
});