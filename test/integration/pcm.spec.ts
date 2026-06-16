import * as sinon from 'sinon';

import RtcPeerConnectionManager from '../../src/rtc_peer_connection_manager';
import StandardStrategy from '../../src/strategies/StandardStrategy';
import CitrixVDIStrategy from "../../src/strategies/CitrixVDIStrategy";
import DCVWebRTCStrategy from "../../src/strategies/DCVWebRTCStrategy";
import OmnissaVDIStrategy from "../../src/strategies/OmnissaVDIStrategy";

import CCPInitiationStrategyInterface from '../../src/strategies/CCPInitiationStrategyInterface';
import { CITRIX } from '../../src/config/constants';

describe('RtcPeerConnectionManager', function () {
    let strategy: any;

    const strategies = [
        { name: 'StandardStrategy', func: () => new StandardStrategy() },
        { name: 'CitrixVDIStrategy', func: () => new CitrixVDIStrategy(CITRIX, false) },
        { name: 'DCVWebRTCStrategy', func: () => new DCVWebRTCStrategy() },
        { name: 'OmnissaVDIStrategy', func: () => new OmnissaVDIStrategy(false) }
    ];

    strategies.forEach(function (strategyCase) {
        describe(strategyCase.name, function () {
            let pcm: any;

            afterEach(function () {
                // Destroy PCM to prevent lingering async operations
                if (pcm) {
                    try { pcm.destroy(); } catch (e) { /* ignore */ }
                    pcm = undefined;
                }
                // Clear the singleton so subsequent tests can run.
                (RtcPeerConnectionManager as any).instance = undefined;
            });

            it('golden path', async function () {
                // This test speed depends on the machine
                // make sure local udp port is not blocked
                this.timeout(5000);
                strategy = strategyCase.func();

                const websocketProvider = this.connect.getWebsocket();

                pcm = new RtcPeerConnectionManager(
                    null as any,
                    null,
                    this.getTurnCredentialsPromise,
                    sinon.stub(),
                    "mockId",
                    null as any,
                    this.logger,
                    null as any,
                    null as any,
                    websocketProvider,
                    strategy,
                    false,
                    "example-browser-id"
                );

                const session = pcm.createSession(
                    'example-contact-id',
                    this.turnCredentials,
                    'example-context-token',
                    'example-connection-id',
                    websocketProvider,
                    strategy
                );

                await session.connect();

                // Wait until we're connected.
                await new Promise((resolve) => {
                    session.onSessionConnected = function () {
                        resolve(null);
                    };
                });

                const completePromise = new Promise((resolve) => {
                    session.onSessionCompleted = function () {
                        resolve(null);
                    };
                });

                session.hangup();

                await completePromise;
            });
        });
    });
});
