import sinon from 'sinon';

global.document = {
    getElementById: sinon.stub().returns({}),
    createElement: sinon.stub().returns({})
}

global.window = {
    addEventListener: sinon.spy(),
    document: global.document,
    atob: sinon.stub().returns({}),
    getComputedStyle: sinon.stub().returns({})
};

global.self = global.window;
global.MutationObserver = class {};

var log = console.log;
sinon.stub(console, 'log', function() {
    return log.apply(log, arguments);
});