import * as jsdom from 'jsdom';
import * as sinon from 'sinon';
import { MockCitrixWebRTC } from './mocks/mockCitrixWebRTC';
import { MockDCVWebRTC } from './mocks/mockDCVWebRTC';
import { MockOmnissaVDI } from './mocks/mockOmnissaVDI';

const Turn: typeof import('node-turn') = require('node-turn');

type wrtcTypes = typeof import('@roamhq/wrtc');
type mockConnectTypes = typeof import('./mocks/mockConnect');

let wrtc: wrtcTypes;
let mc: mockConnectTypes;

export const mochaHooks = {
    beforeAll: async function (this: Mocha.Context) {
        try {
            // On linux systems, wrtc has a dependency on GLIBC_2.34. 
            // Amazon AL2 systems use an older version, so if the wrtc library cannot be loaded
            // we should skip all these tests otherwise they'd fail.
            wrtc = await import('@roamhq/wrtc');
            mc = await import('./mocks/mockConnect');
        } catch (e) {
            // Skill all tests because we cannot load the wrtc module.
            console.log('Skipping integration tests due to ' + e);
            this.skip();
        }

        // Mock the browser's webrtc API.
        (global as any).RTCPeerConnection = wrtc.RTCPeerConnection;
        (global as any).MediaStream = wrtc.MediaStream;
        (global as any).RTCIceCandidate = wrtc.RTCIceCandidate;
        (global as any).RTCSessionDescription = wrtc.RTCSessionDescription;
    },
    beforeEach: async function (this: Mocha.Context) {
        this.server = new Turn({
            listeningIps: ['127.0.0.1'],
            relayIps: ['127.0.0.1'],
            authMech: 'long-term',
            credentials: {
                username: "password"
            },
            debugLevel: "OFF"
        });

        this.server.start();

        const turnCredentials = [{
            urls: 'turn:localhost:' + this.server.listeningPort,
            username: "username",
            credential: "password"
        }];

        this.turnCredentials = turnCredentials;

        this.getTurnCredentialsPromise = function () {
            return Promise.resolve(turnCredentials);
        }

        this.jsdom = new jsdom.JSDOM(``, { runScripts: "dangerously" });

        global.window = this.jsdom.window;

        // Mock the VDI APIs. These require global.window to be set.
        MockCitrixWebRTC.hookup(wrtc);
        MockDCVWebRTC.hookup(wrtc);
        MockOmnissaVDI.hookup(wrtc);

        (global as any).connect = {
            activePeerConnectionCount: 0
        };

        // Use Object.defineProperty to override read-only navigator in Node.js 20+
        try {
            Object.defineProperty(global, 'navigator', {
                value: this.jsdom.window.navigator,
                writable: true,
                configurable: true
            });
        } catch (e) {
            // Fallback if defineProperty fails
            (global as any).navigator = this.jsdom.window.navigator;
        }

        (global.window.navigator as any).mediaDevices = {
            getUserMedia: wrtc.getUserMedia
        };

        this.connect = new mc.MockConnect();

        // Chainable log entry mock — supports .withObject(), .withException(), .sendInternalLogToServer()
        const logEntry = () => ({
            sendInternalLogToServer: sinon.stub(),
            withObject: function() { return this; },
            withException: function() { return this; }
        });
        this.logger = {
            log: (...args: string[]) => { console.log.apply(null, args); return logEntry(); },
            info: (...args: string[]) => { console.info.apply(null, args); return logEntry(); },
            warn: (...args: string[]) => { console.warn.apply(null, args); return logEntry(); },
            error: (...args: string[]) => { console.error.apply(null, args); return logEntry(); }
        };

        this.clock = sinon.useFakeTimers({
            shouldAdvanceTime: true
        });
    },
    afterEach: function (this: Mocha.Context) {
        // If server has previously been stopped, receiving will be false.
        if (this.server && this.server.network.sockets[0].receiving) {
            this.server.stop();
        }

        (global as any).window = null;
        (global as any).connect = null;

        this.clock.restore();
    }
};
