/*
 * Copyright 2014-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

/*
 * connect-rtc.js attaches the RtcJS class references onto global.connect as a
 * synchronous module-body side effect. It is the SAME file whether loaded as
 * the bundled lily-rtc.js <script> at page load or executed later as the
 * Module-Federation runtime chunk (exposed as ./init). This suite exercises the
 * guard that prevents the runtime chunk from OVERWRITING globals after Streams
 * has committed a live softphone session to the currently-attached RtcJS
 * (Streams sets connect._rtcJsCommitted when it builds a PCM or a legacy
 * RTCSession). Overwriting then would split a live session's RtcJS instance
 * from its strategy/PCM.
 *
 * The module cannot simply be `import`ed twice (ESM caches it and the strategy
 * classes drag in heavy VDI-SDK deps), so we execute ONLY the guarded attach
 * block against a supplied `global`, with the imported symbols stubbed. The
 * block under test is read at runtime from the real source file, so the test
 * fails if the guard is removed or its shape changes.
 */

const SOURCE_PATH = path.resolve(__dirname, '../../src/connect-rtc.js');

function makeSentinels(tag: string) {
  const mk = (name: string) => {
    const fn = function () {};
    (fn as any).__buildTag = tag;
    (fn as any).__className = name;
    return fn;
  };
  return {
    RtcSession: mk('RtcSession'),
    MediaDevices: mk('MediaDevices'),
    RTC_ERRORS: { __buildTag: tag },
    RtcPeerConnectionFactory: mk('RtcPeerConnectionFactory'),
    RtcPeerConnectionManager: mk('RtcPeerConnectionManager'),
    RtcPeerConnectionManagerV2: mk('RtcPeerConnectionManagerV2'),
    uuid: () => 'uuid',
    StandardStrategy: mk('StandardStrategy'),
    CitrixVDIStrategy: mk('CitrixVDIStrategy'),
    DCVWebRTCStrategy: mk('DCVWebRTCStrategy'),
    OmnissaVDIStrategy: mk('OmnissaVDIStrategy'),
    AzureVDIStrategy: mk('AzureVDIStrategy'),
    FailedVDIStrategy: mk('FailedVDIStrategy'),
  };
}

function runAttachBlock(targetGlobal: any, s: ReturnType<typeof makeSentinels>): void {
  let source = fs.readFileSync(SOURCE_PATH, 'utf8');
  source = source.replace(/^\s*import .*$/gm, '');
  const fn = new Function(
    'global',
    'RtcSession', 'MediaDevices', 'RTC_ERRORS', 'RtcPeerConnectionFactory',
    'uuid', 'StandardStrategy', 'CitrixVDIStrategy', 'RtcPeerConnectionManager',
    'RtcPeerConnectionManagerV2', 'DCVWebRTCStrategy', 'OmnissaVDIStrategy',
    'AzureVDIStrategy', 'FailedVDIStrategy',
    source
  );
  fn(
    targetGlobal,
    s.RtcSession, s.MediaDevices, s.RTC_ERRORS, s.RtcPeerConnectionFactory,
    s.uuid, s.StandardStrategy, s.CitrixVDIStrategy, s.RtcPeerConnectionManager,
    s.RtcPeerConnectionManagerV2, s.DCVWebRTCStrategy, s.OmnissaVDIStrategy,
    s.AzureVDIStrategy, s.FailedVDIStrategy
  );
}

describe('connect-rtc global attach guard (_rtcJsCommitted)', () => {
  it('attaches globals on first load when nothing is committed', () => {
    const g: any = { connect: {} };
    const bundled = makeSentinels('bundled');

    runAttachBlock(g, bundled);

    expect(g.connect.RTCSession).to.equal(bundled.RtcSession);
    expect(g.connect.RtcPeerConnectionManager).to.equal(bundled.RtcPeerConnectionManager);
    expect(g.connect.CitrixVDIStrategy).to.equal(bundled.CitrixVDIStrategy);
    expect(g.lily.RTCSession).to.equal(bundled.RtcSession);
    expect(g.connect._rtcRuntimeArrivedLate).to.not.equal(true);
  });

  it('runtime chunk OVERWRITES when no session committed yet (rollout promotes to runtime)', () => {
    const bundled = makeSentinels('bundled');
    const g: any = { connect: {} };
    runAttachBlock(g, bundled); // bundled loaded at page load, no call yet

    const runtime = makeSentinels('runtime');
    runAttachBlock(g, runtime); // runtime chunk lands before any call

    expect((g.connect.RTCSession as any).__buildTag).to.equal('runtime');
    expect((g.connect.RtcPeerConnectionManager as any).__buildTag).to.equal('runtime');
    expect(g.connect._rtcRuntimeArrivedLate).to.not.equal(true);
  });

  it('runtime chunk does NOT overwrite once _rtcJsCommitted is set (live session)', () => {
    const bundled = makeSentinels('bundled');
    const g: any = { connect: {} };
    runAttachBlock(g, bundled);
    // Streams committed a session to the bundled instance.
    g.connect._rtcJsCommitted = true;

    const runtime = makeSentinels('runtime');
    runAttachBlock(g, runtime);

    expect((g.connect.RTCSession as any).__buildTag).to.equal('bundled');
    expect((g.connect.RtcPeerConnectionManager as any).__buildTag).to.equal('bundled');
    expect((g.connect.CitrixVDIStrategy as any).__buildTag).to.equal('bundled');
    expect(g.connect._rtcRuntimeArrivedLate).to.equal(true);
  });

  it('is order-independent: whichever instance is committed first is preserved', () => {
    const runtime = makeSentinels('runtime');
    const g: any = { connect: {} };
    runAttachBlock(g, runtime);
    g.connect._rtcJsCommitted = true; // committed on runtime

    const bundled = makeSentinels('bundled');
    runAttachBlock(g, bundled); // a later load must not overwrite

    expect((g.connect.RTCSession as any).__buildTag).to.equal('runtime');
    expect(g.connect._rtcRuntimeArrivedLate).to.equal(true);
  });
});
