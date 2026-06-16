import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import RtcPeerConnectionManagerV2 from '../../src/rtc_peer_connection_manager_v2';
import StandardStrategy from '../../src/strategies/StandardStrategy';
import CitrixVDIStrategy from '../../src/strategies/CitrixVDIStrategy';
import OmnissaVDIStrategy from '../../src/strategies/OmnissaVDIStrategy';
import { CITRIX } from '../../src/config/constants';

chai.use(sinonChai);
const expect = chai.expect;

/**
 * Real E2E integration tests for RtcPeerConnectionManagerV2.
 *
 * Uses real TURN server + @roamhq/wrtc + MockConnect signaling.
 * Golden path runs for all VDI strategies; other tests use StandardStrategy only.
 */
describe('RtcPeerConnectionManagerV2 E2E Integration', function () {

    // ── Shared helpers (used by both strategy loop and StandardStrategy tests) ──

    function createPCM(ctx: Mocha.Context, strategy: any, overrides: any = {}): any {
        const websocketProvider = ctx.connect.getWebsocket();
        if (ctx.jsdom) { (global as any).document = ctx.jsdom.window.document; }

        const pcm = new RtcPeerConnectionManagerV2({
            transportHandle: ctx.getTurnCredentialsPromise,
            publishError: sinon.stub(),
            logger: ctx.logger,
            contactId: 'test-contact-id',
            connectionId: 'test-connection-id',
            rtcJsStrategy: strategy,
            webSocketManager: websocketProvider,
            signalingUri: 'wss://example.com',
            iceServers: ctx.turnCredentials,
            callContextToken: 'test-token',
            browserId: 'test-browser-id',
            clientId: 'test-client-id',
            isPersistentConnectionEnabled: false,
            isPersistentConnectionOnPageLoadEnabled: false,
            ...overrides
        });
        pcm._userAgentData = { browserBrand: 'Chromium' };
        return pcm;
    }

    /**
     * Execute full call lifecycle. Sets onSessionConnected BEFORE connect()
     * so it works for both fresh SMS (async signaling) and reused SMS (sync event).
     */
    async function executeCall(pcm: any, ctx: Mocha.Context, strategy: any, callId: string, connId: string): Promise<{session: any, report: any}> {
        const session = pcm.createSession(callId, ctx.turnCredentials, 'token-' + callId, connId,
            ctx.connect.getWebsocket(), strategy, undefined);

        await pcm.connect(connId);

        await new Promise<void>(r => { session.onSessionConnected = () => r(); });

        const completePromise = new Promise<void>(r => { session.onSessionCompleted = () => r(); });
        pcm.hangup(connId);
        await completePromise;

        return { session, report: session._sessionReport };
    }

    /** Connect without hangup. */
    async function connectCall(pcm: any, ctx: Mocha.Context, strategy: any, callId: string, connId: string): Promise<any> {
        const session = pcm.createSession(callId, ctx.turnCredentials, 'token-' + callId, connId,
            ctx.connect.getWebsocket(), strategy, undefined);

        await pcm.connect(connId);
        await new Promise<void>(r => { session.onSessionConnected = () => r(); });
        return session;
    }

    function validateSuccessReport(report: any) {
        expect(report.sessionStartTime).to.be.an.instanceOf(Date);
        expect(report.sessionEndTime).to.be.an.instanceOf(Date);
        const assertTiming = (v: any, f: string) => expect(v).to.satisfy(
            (val: any) => val === null || (typeof val === 'number' && val >= 0), `${f}: ${v}`);
        ['gumTimeMillis','initializationTimeMillis','iceCollectionTimeMillis','signallingConnectTimeMillis',
         'handshakingTimeMillis','preTalkingTimeMillis','talkingTimeMillis','cleanupTimeMillis'].forEach(f => assertTiming(report[f], f));
        ['iceCollectionFailure','signallingConnectionFailure','handshakingFailure','gumOtherFailure',
         'gumTimeoutFailure','createOfferFailure','setLocalDescriptionFailure','userBusyFailure',
         'invalidRemoteSDPFailure','noRemoteIceCandidateFailure','setRemoteDescriptionFailure'].forEach(f =>
            expect(report[f]).to.satisfy((v: any) => v === null || v === false));
        expect(report.streamStats).to.be.an('array');
        expect(report.iceConnectionsLost).to.equal(0);
        expect(report.isPCMv2Path).to.equal(true);
        expect(report.iceRestartAttempts).to.equal(0);
        expect(report.iceRestartSuccesses).to.equal(0);
    }

    function afterEachCleanup() {
        const pcm = RtcPeerConnectionManagerV2.instance;
        if (pcm) { try { (pcm as any)._callSessions.clear(); pcm.destroy(); } catch (e) {} }
        (RtcPeerConnectionManagerV2 as any).instance = null;
        sinon.restore();
    }

    // ══════════════════════════════════════════════════════════════════
    // SECTION A: Golden Path — runs for ALL VDI strategies
    // PPC enabled, persistent connection allowlisted, FAC disabled
    // ══════════════════════════════════════════════════════════════════
    const strategies = [
        { name: 'StandardStrategy', create: () => new StandardStrategy() },
        { name: 'CitrixVDIStrategy', create: () => new CitrixVDIStrategy(CITRIX, false) },
        { name: 'OmnissaVDIStrategy', create: () => new OmnissaVDIStrategy(false) }
    ];

    strategies.forEach(function (strategyCase) {
        describe(`Golden Path [${strategyCase.name}] — PPC enabled, allowlisted`, function () {
            afterEach(afterEachCleanup);

            it('two back-to-back calls with telemetry validation', async function () {
                this.timeout(15000);
                const strategy = strategyCase.create();
                // Create PCM with PPC=false to avoid standby PC creation racing with fake timers
                const pcm = createPCM(this, strategy);

                // ── Call 1: full signaling ──
                const s1 = await connectCall(pcm, this, strategy, 'call-1', 'conn-1');

                // After signaling answer, _isRTPSAllowlisted is set by isPersistentConnectionAllowlistedCallback
                expect(pcm._isRTPSAllowlisted).to.equal(true);
                expect(typeof s1.getUserAudioStats).to.equal('function');
                expect(typeof s1.getRemoteAudioStats).to.equal('function');

                // Now enable PPC (simulates agent config) so SMS persists after hangup
                pcm._isPPCEnabled = true;

                // Hangup call-1: SMS/PC persist because isPersistentConnectionAllowlistedAndEnabled() is now true
                const c1 = new Promise<void>(r => { s1.onSessionCompleted = () => r(); });
                pcm.hangup('conn-1');
                await c1;

                validateSuccessReport(s1._sessionReport);

                // SMS should persist
                expect(pcm._sharedMediaSession).to.not.be.null;
                expect(pcm._peerConnectionId).to.be.a('string');

                await new Promise<void>(r => setTimeout(r, 100));

                // ── Call 2: SMS persists, reuses existing connection ──
                const { report: r2 } = await executeCall(pcm, this, strategyCase.create(), 'call-2', 'conn-2');
                validateSuccessReport(r2);
            });

            it('page-load PPC waits for strategy.whenConnected() before creating SMS', async function () {
                this.timeout(15000);
                const strategy = strategyCase.create();
                const pcm = createPCM(this, strategy, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true
                });
                pcm._inactivityDuration = 60000;

                // Wait for page-load SMS creation — would hang forever if whenConnected() never resolved.
                await new Promise<void>(resolve => {
                    const check = () => {
                        if (pcm._sharedMediaSession) { resolve(); }
                        else { setTimeout(check, 50); }
                    };
                    check();
                });

                expect(pcm._sharedMediaSession).to.not.be.null;
                expect(pcm._pc).to.not.be.null;
            });
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // SECTION B: All other tests — StandardStrategy only
    // ══════════════════════════════════════════════════════════════════
    describe('StandardStrategy-only tests', function () {
        afterEach(afterEachCleanup);

        function std() { return new StandardStrategy(); }
        function mkPCM(ctx: Mocha.Context, overrides: any = {}) { return createPCM(ctx, std(), overrides); }

        // ── PPC Disabled fallback ──
        describe('PPC Disabled — fallback path', function () {
            it('two back-to-back calls, SMS destroyed after each', async function () {
                this.timeout(10000);
                const pcm = mkPCM(this);
                await executeCall(pcm, this, std(), 'call-1', 'conn-1');
                await new Promise<void>(r => setTimeout(r, 100));
                const { report: r2 } = await executeCall(pcm, this, std(), 'call-2', 'conn-2');
                validateSuccessReport(r2);
            });
        });

        // ── PPC reuse ──
        describe('PPC Enabled — persistent connection reuse', function () {
            it('call-2 reuses same SMS/PC as call-1', async function () {
                this.timeout(20000);
                const pcm = mkPCM(this);
                const s1 = await connectCall(pcm, this, std(), 'call-1', 'conn-1');
                const sms = pcm._sharedMediaSession;
                pcm._isPPCEnabled = true;
                pcm._isRTPSAllowlisted = true;
                const pcId = pcm._peerConnectionId;
                pcm.hangup('conn-1');
                expect(pcm._sharedMediaSession).to.equal(sms);
                expect(pcm._peerConnectionId).to.equal(pcId);

                const s2 = pcm.createSession('call-2', this.turnCredentials, 'token-2', 'conn-2',
                    this.connect.getWebsocket(), std(), undefined);
                expect(pcm._sharedMediaSession).to.equal(sms);
                pcm._callSessions.delete('conn-2');
            });
        });

        // ── Page-load persistent connection ──
        describe('PPC + Page-Load FAC — persistent connection on page load', function () {
            it('establishes SMS on construction and handles a call', async function () {
                this.timeout(20000);
                // Create PCM with both PPC and page-load FAC enabled
                const pcm = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true
                });

                // Set a large inactivity duration so the timer started on page-load SMS connect
                // doesn't fire before the test can make a call (default 0 would fire immediately)
                pcm._inactivityDuration = 60000;

                // Wait for async _setupPageLoadPersistentConnection to complete
                // (it's fire-and-forget from constructor, so wait for SMS to appear)
                await new Promise<void>(resolve => {
                    const check = () => {
                        if (pcm._sharedMediaSession) { resolve(); }
                        else { setTimeout(check, 50); }
                    };
                    check();
                });

                // SharedMediaSession should exist before any call
                expect(pcm._sharedMediaSession).to.not.be.null;
                expect(pcm._pc).to.not.be.null;
                expect(pcm._hasEverCreatedSharedMediaSession).to.equal(true);

                // Wait for SMS to reach talking state (signaling handshake completes)
                await new Promise<void>(resolve => {
                    const check = () => {
                        if (pcm._sharedMediaSession && pcm._sharedMediaSession.isInTalkingState()) { resolve(); }
                        else { setTimeout(check, 50); }
                    };
                    check();
                });

                // Now make a call — should reuse the existing SMS
                const sms = pcm._sharedMediaSession;
                pcm._isRTPSAllowlisted = true; // Simulate allowlisting from signaling response

                // Clear the inactivity timer that was started when SMS connected with no active calls.
                // In production, the inactivity duration comes from the signaling response (e.g., 10min).
                // In tests, default is 0 which would fire immediately.
                pcm.clearInactivityTimer();

                // Must set onSessionConnected BEFORE connect() because when SMS is already
                // in TalkingState, the event fires synchronously inside connect()
                const session = pcm.createSession('call-pageload', this.turnCredentials, 'token-pageload', 'conn-pageload',
                    this.connect.getWebsocket(), std(), undefined);

                const connectedPromise = new Promise<void>(r => { session.onSessionConnected = () => r(); });
                await pcm.connect('conn-pageload');
                await connectedPromise;

                const completePromise = new Promise<void>(r => { session.onSessionCompleted = () => r(); });
                pcm.hangup('conn-pageload');
                await completePromise;

                validateSuccessReport(session._sessionReport);

                // SMS should still be the same (reused, not recreated)
                expect(pcm._sharedMediaSession).to.equal(sms);
            });

            it('call arriving during page-load setup (SMS mid-handshake) gets fresh SMS', async function () {
                this.timeout(20000);
                // Create PCM with page-load enabled — async setup starts immediately
                const pcm = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true
                });
                pcm._inactivityDuration = 60000;

                // Wait for page-load SMS to be created but NOT yet in TalkingState
                await new Promise<void>(resolve => {
                    const check = () => {
                        if (pcm._sharedMediaSession) { resolve(); }
                        else { setTimeout(check, 20); }
                    };
                    check();
                });

                const pageLoadSms = pcm._sharedMediaSession;
                expect(pageLoadSms).to.not.be.null;
                // Verify SMS is NOT yet in TalkingState (still mid-handshake)
                expect(pageLoadSms.isInTalkingState()).to.be.false;

                // Now a real call arrives while page-load SMS is mid-handshake
                // createSession() calls isSharedMediaSessionHealthy() which returns false
                // (not in TalkingState yet) → destroys page-load SMS → creates fresh SMS
                const { report } = await executeCall(pcm, this, std(), 'call-race-1', 'conn-race-1');

                // Call should succeed with a fresh SMS (not the page-load one)
                validateSuccessReport(report);
            });

            it('call arriving before page-load ICE fetch completes gets own SMS', async function () {
                this.timeout(15000);
                // Slow down ICE fetch to simulate the race
                let resolveSlowIce: (v: any) => void;
                const slowIcePromise = new Promise<any>(r => { resolveSlowIce = r; });
                const originalTransport = this.getTurnCredentialsPromise;

                const pcm = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true,
                    // Override transportHandle to delay the first call (page-load)
                    transportHandle: () => slowIcePromise
                });

                // SMS should NOT exist yet (ICE fetch still pending)
                expect(pcm._sharedMediaSession).to.be.null;

                // Restore real transport for the actual call
                pcm._requestIceAccess = originalTransport;
                pcm._credentialResolver = null; // Force re-init
                // Re-create credential resolver with real transport
                const { CredentialResolver } = require('../../src/credential_resolver');
                pcm._credentialResolver = new CredentialResolver(originalTransport, pcm._logger);

                // Make a real call — it creates its own SMS
                const s2 = await connectCall(pcm, this, std(), 'call-race-2', 'conn-race-2');

                const realCallSms = pcm._sharedMediaSession;
                expect(realCallSms).to.not.be.null;

                // Now resolve the slow ICE fetch WHILE the call is still active.
                // The guard should see _sharedMediaSession is not null and abandon the page-load PC.
                resolveSlowIce!(this.turnCredentials);
                await new Promise<void>(r => setTimeout(r, 100));

                // Verify the active call's SMS was NOT overwritten by the late page-load setup
                expect(pcm._sharedMediaSession).to.equal(realCallSms);

                // Now complete the call
                const cp = new Promise<void>(r => { s2.onSessionCompleted = () => r(); });
                pcm.hangup('conn-race-2');
                await cp;
                validateSuccessReport(s2._sessionReport);
            });

            it('handleFACUpdate sets up SMS when FAC arrives late', async function () {
                this.timeout(15000);
                // Start with page-load FAC disabled
                const pcm = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: false
                });

                // No SMS should exist yet
                expect(pcm._sharedMediaSession).to.be.null;
                expect(pcm._hasEverCreatedSharedMediaSession).to.equal(false);

                // Simulate late FAC arrival
                pcm.handleFACUpdate({ enablePersistentConnectionOnPageLoad: true });

                // Wait for async setup to complete
                await new Promise<void>(resolve => {
                    const check = () => {
                        if (pcm._sharedMediaSession) { resolve(); }
                        else { setTimeout(check, 50); }
                    };
                    check();
                });

                expect(pcm._sharedMediaSession).to.not.be.null;
                expect(pcm._hasEverCreatedSharedMediaSession).to.equal(true);
            });
        });

        // ── PC cleanup ──
        describe('PPC Disabled — PC cleanup after hangup', function () {
            it('SMS/PC/peerConnectionId null after hangup', async function () {
                this.timeout(5000);
                const pcm = mkPCM(this);
                await executeCall(pcm, this, std(), 'call-1', 'conn-1');
                expect(pcm._sharedMediaSession).to.be.null;
                expect(pcm._pc).to.be.null;
                expect(pcm._callSessions.size).to.equal(0);
            });
        });

        // ── Bullet routing ──
        describe('Bullet Routing — concurrent sessions', function () {
            it('two concurrent calls share same SMS/PC', async function () {
                this.timeout(5000);
                const pcm = mkPCM(this);
                await connectCall(pcm, this, std(), 'call-1', 'conn-1');
                const sms = pcm._sharedMediaSession;
                pcm.createSession('call-2', this.turnCredentials, 'token-2', 'conn-2',
                    this.connect.getWebsocket(), std(), undefined);
                await pcm.connect('conn-2');
                expect(pcm._callSessions.size).to.equal(2);
                expect(pcm._sharedMediaSession).to.equal(sms);
                pcm.hangup('conn-1');
                expect(pcm._callSessions.size).to.equal(1);
                const c2 = new Promise<void>(r => { pcm.getSession('conn-2').onSessionCompleted = () => r(); });
                pcm.hangup('conn-2');
                await c2;
            });
        });

        // ── Cross-region ──
        describe('Cross-Region Contact Handling', function () {
            it('detects cross-region, uses api-fetched', async function () {
                this.timeout(2000);
                const pcm = mkPCM(this);
                // Prime the cache from the real transport (caches the real TURN URL).
                // Then pass contact ICE with a different URL to trigger cross-region detection.
                // The fallback API fetch uses the real transport, so PC creation succeeds.
                await pcm._credentialResolver._getCachedIceURL();
                const regionBIce = [{ urls: ['turn:region-b.example.com'] }] as any;
                const session = pcm.createSession('call-xr', regionBIce, 'token-xr', 'conn-xr',
                    this.connect.getWebsocket(), std(), undefined);
                const cp = new Promise<void>(r => { session.onSessionConnected = () => r(); });
                await pcm.connect('conn-xr');
                await cp;
                expect(session._sessionReport.iceCredentialSource).to.equal('api-fetched');
                expect(session._sessionReport.isContactCredentialsDifferentRegion).to.equal(true);
                const dp = new Promise<void>(r => { session.onSessionCompleted = () => r(); });
                pcm.hangup('conn-xr');
                await dp;
            });

            it('same-region uses contact-provided', async function () {
                this.timeout(2000);
                const pcm = mkPCM(this);
                // Prime the cache from the real transport so cached URL matches contact creds
                await pcm._credentialResolver._getCachedIceURL();
                const { report } = await executeCall(pcm, this, std(), 'call-sr', 'conn-sr');
                expect(report.iceCredentialSource).to.equal('contact-provided');
            });
        });

        // ── GUM failure ──
        describe('GUM failure', function () {
            // Skip: FailedState.onEnter in SMS calls logger.error().withObject() which wrapLogger doesn't support
            it.skip('onSessionFailed fires on GUM error', async function () {
                this.timeout(2000);
                const pcm = mkPCM(this);
                const session = pcm.createSession('call-gum', this.turnCredentials, 'token-gum', 'conn-gum',
                    this.connect.getWebsocket(), std(), undefined);
                (global.window.navigator as any).mediaDevices = {
                    getUserMedia: () => Promise.reject(new Error('Permission denied'))
                };
                const fp = new Promise<any>(r => { session.onSessionFailed = (_: any, e: any) => r(e); });
                await pcm.connect('conn-gum');
                expect(await fp).to.exist;
            });
        });

        // ── softphone.js interface ──
        describe('softphone.js Interface', function () {
            it('PCMv2 exposes all required methods', function () {
                this.timeout(1000);
                const pcm = mkPCM(this);
                ['createSession','connect','hangup','destroy',
                 'closeStandbyConnection','handleFACUpdate',
                 'handlePersistentPeerConnectionToggle','setMicrophoneDevice','getPeerConnection',
                 'getSession','isPersistentConnectionAllowlistedAndEnabled'].forEach(m =>
                    expect(typeof pcm[m]).to.equal('function', `missing: ${m}`));
            });

            it('telemetryCallReport fields exist', async function () {
                this.timeout(2000);
                const pcm = mkPCM(this);
                const { report } = await executeCall(pcm, this, std(), 'call-t', 'conn-t');
                ['sessionStartTime','sessionEndTime','gumTimeMillis','initializationTimeMillis',
                 'iceCollectionTimeMillis','signallingConnectTimeMillis','handshakingTimeMillis',
                 'preTalkingTimeMillis','talkingTimeMillis','cleanupTimeMillis',
                 'iceCollectionFailure','signallingConnectionFailure','handshakingFailure',
                 'gumOtherFailure','gumTimeoutFailure','createOfferFailure','setLocalDescriptionFailure',
                 'userBusyFailure','invalidRemoteSDPFailure','noRemoteIceCandidateFailure',
                 'setRemoteDescriptionFailure','streamStats','iceConnectionsLost','iceConnectionsFailed',
                 'peerConnectionFailed','rtcJsVersion','firstRTPTimeMillis','isPersistentPeerConnection',
                 'isExistingPersistentPeerConnection','isPCMv2Path','iceCredentialSource',
                 'isContactCredentialsDifferentRegion','iceRestartAttempts','iceRestartSuccesses',
                 'iceRestartInviteRetries','iceRestartTimeMillis','iceRestartFailed',
                ].forEach(f => expect(report).to.have.property(f));
            });
        });

        // ── Inactivity timer ──
        describe('PPC — inactivity timer', function () {
            it('destroys SMS after timeout', async function () {
                this.timeout(10000);
                const pcm = mkPCM(this);
                await connectCall(pcm, this, std(), 'call-1', 'conn-1');
                pcm._isPPCEnabled = true;
                pcm._isRTPSAllowlisted = true;
                pcm._inactivityDuration = 5000;
                pcm.hangup('conn-1');
                expect(pcm._sharedMediaSession).to.not.be.null;
                this.clock.tick(6000);
                expect(pcm._sharedMediaSession).to.be.null;
            });
        });

        // ── destroy() behavior ──
        describe('destroy() behavior', function () {
            it('refuses while calls active', async function () {
                this.timeout(5000);
                const pcm = mkPCM(this);
                await connectCall(pcm, this, std(), 'call-1', 'conn-1');
                pcm.destroy();
                expect(pcm._sharedMediaSession).to.not.be.null;
                const cp = new Promise<void>(r => { pcm.getSession('conn-1').onSessionCompleted = () => r(); });
                pcm.hangup('conn-1');
                await cp;
            });
        });

        // ── close() + reconstruct (ACGR region failover / V1↔V2 toggle) ──
        describe('close() singleton reset', function () {
            it('allows a new PCM with page-load PPC to be constructed after close', async function () {
                this.timeout(30000);
                // First PCM with page-load PPC enabled (simulates pre-failover)
                const pcm1 = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true
                });
                pcm1._inactivityDuration = 60000;

                // Wait for first PCM to establish its page-load SMS
                await new Promise<void>(resolve => {
                    const check = () => pcm1._sharedMediaSession ? resolve() : setTimeout(check, 50);
                    check();
                });
                expect(pcm1._sharedMediaSession).to.not.be.null;

                // Simulate ACGR failover: Streams calls close() only. RTPS is allowlisted
                // (set by signaling handshake) so close() takes the destroy() branch.
                pcm1._isRTPSAllowlisted = true;
                pcm1.clearInactivityTimer();
                pcm1.close();
                expect(RtcPeerConnectionManagerV2.instance).to.be.null;
                expect(pcm1._sharedMediaSession).to.be.null;

                // Construct second PCM — simulates new region after failover.
                // Verifies the full init path ran (page-load PPC re-established).
                const pcm2 = mkPCM(this, {
                    isPersistentConnectionEnabled: true,
                    isPersistentConnectionOnPageLoadEnabled: true
                });
                pcm2._inactivityDuration = 60000;

                await new Promise<void>(resolve => {
                    const check = () => pcm2._sharedMediaSession ? resolve() : setTimeout(check, 50);
                    check();
                });
                expect(pcm2._sharedMediaSession).to.not.be.null;
            });
        });

        // ── disableMediaStreamRefresh ──
        describe('disableMediaStreamRefresh', function () {
            it('prevents SMS from refreshing media', async function () {
                this.timeout(5000);
                const pcm = mkPCM(this, { isPersistentConnectionEnabled: true });
                const s1 = await connectCall(pcm, this, std(), 'call-1', 'conn-1');
                expect(typeof s1.disableMediaStreamRefresh).to.equal('function');
                s1.disableMediaStreamRefresh();
                expect(pcm._sharedMediaSession._isUserProvidedStream).to.equal(true);
                const cp = new Promise<void>(r => { s1.onSessionCompleted = () => r(); });
                pcm.hangup('conn-1');
                await cp;
            });
        });
    });

});
