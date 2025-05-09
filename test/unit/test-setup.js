import sinon from 'sinon';
let jsdom = require('mocha-jsdom');

global.jsdom = jsdom;
global.navigator = {
    userAgent: {match: sinon.stub().returns({}),
        indexOf: sinon.stub().returns({})},
};


global.document = {
    getElementById: sinon.stub().returns({}),
    createElement: sinon.stub().returns({})
}

global.window = {
    addEventListener: () => {},
    document: global.document,
    atob: sinon.stub().returns({}),
    getComputedStyle: sinon.stub().returns({}),
    navigator: {
        mediaDevices: {getUserMedia : sinon.stub().returns({})},
        userAgent: {match: sinon.stub().returns({}),
            indexOf: sinon.stub().returns({})},
    },
    parent :{
        postMessage:sinon.stub().returns({}),
    }

};


global.self = global.window;
global.MutationObserver = class {};

var log = console.log;
sinon.stub(console, 'log', function() {
    return log.apply(log, arguments);
});
