/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {transformSdp, SdpOptions, getUserAgentData} from '../../src/js/utils';
import chai, {expect} from 'chai';
import {sandbox} from 'sinon';

describe('Utils tests', () => {
    describe('transformSdp', () => {
        var inputSdp = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtcp-fb:* transport-cc\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1\r\n" +
            "a=rtpmap:103 ISAC/16000\r\n" +
            "a=rtpmap:104 ISAC/32000\r\n" +
            "a=rtpmap:9 G722/8000\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:8 PCMA/8000\r\n" +
            "a=rtpmap:106 CN/32000\r\n" +
            "a=rtpmap:105 CN/16000\r\n" +
            "a=rtpmap:13 CN/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";


        // transformed with default SdpOptions
        var defaultOutput = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1;usedtx=0\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtcp-fb:* transport-cc\r\n" +
            "a=rtpmap:103 ISAC/16000\r\n" +
            "a=rtpmap:104 ISAC/32000\r\n" +
            "a=rtpmap:9 G722/8000\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:8 PCMA/8000\r\n" +
            "a=rtpmap:106 CN/32000\r\n" +
            "a=rtpmap:105 CN/16000\r\n" +
            "a=rtpmap:13 CN/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";

        var expectedSdpWithOnlyOpus = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 110 111 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1;usedtx=0\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtcp-fb:* transport-cc\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";

        it('Override audio codec to                                                                                                                                                                                                          opus', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.forceCodec['audio'] = 'opus';
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(expectedSdpWithOnlyOpus);
            sdpOptions.forceCodec['audio'] = 'OPUS';
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(expectedSdpWithOnlyOpus);
        });

        it('Removes nothing without matching media type', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.forceCodec['video'] = 'opus';
            var result = transformSdp(inputSdp, sdpOptions);
            chai.expect(result.sdp).to.eq(defaultOutput);
            chai.expect(result.mLines).to.eq(1);
        });

        var expectedPcmuSdp = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 0 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtcp-fb:* transport-cc\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";

        it('Override audio codec to pcmu', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.forceCodec['audio'] = 'pcmu';
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(expectedPcmuSdp);
        });

        var expectedSdpWithDtx = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1;usedtx=1\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtcp-fb:* transport-cc\r\n" +
            "a=rtpmap:103 ISAC/16000\r\n" +
            "a=rtpmap:104 ISAC/32000\r\n" +
            "a=rtpmap:9 G722/8000\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:8 PCMA/8000\r\n" +
            "a=rtpmap:106 CN/32000\r\n" +
            "a=rtpmap:105 CN/16000\r\n" +
            "a=rtpmap:13 CN/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";


        it('Adds usedtx=1 if enableDtx is true', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.enableOpusDtx = true;
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(expectedSdpWithDtx);
        });

        it('Adds usedtx=0 if enableDtx is false', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.enableOpusDtx = false;
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(defaultOutput);
        });

        it('Adds usedtx=0 if enableDtx is not set', () => {
            var sdpOptions = new SdpOptions();
            chai.expect(transformSdp(inputSdp, sdpOptions).sdp).to.eq(defaultOutput);
        });

        var audioVideoSdp = "v=0\n" +
            "o=mozilla...THIS_IS_SDPARTA-59.0.2 204502799607324848 0 IN IP4 0.0.0.0\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=fingerprint:sha-256 18:78:9C:01:6D:89:69:06:84:AE:1F:D1:B9:10:96:54:97:4C:FA:8D:40:9F:A1:B1:99:4D:70:2B:88:A4:8A:20\r\n" +
            "a=group:BUNDLE sdparta_0 sdparta_1\r\n" +
            "a=ice-options:trickle\r\n" +
            "a=msid-semantic:WMS *\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 101 109\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=sendrecv\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid\r\n" +
            "a=fmtp:101 0-15\r\n" +
            "a=ice-pwd:24e9d315b24ee847d5844c5f7313c42b\r\n" +
            "a=ice-ufrag:25047267\r\n" +
            "a=mid:sdparta_0\r\n" +
            "a=msid:{910b0af4-424f-41c3-8d46-c61f5d21516b} {ed11b922-7eea-4551-ad47-24270c902094}\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:109 opus/48000/2\r\n" +
            "a=fmtp:109 maxplaybackrate=48000;stereo=1;useinbandfec=1;usedtx=0\r\n" +
            "a=rtpmap:101 telephone-event/8000/1\r\n" +
            "a=setup:actpass\r\n" +
            "a=ssrc:3604426642 cname:{2fe325fe-1578-41b9-b8c1-d92e46b5d514}\r\n" +
            "m=video 9 UDP/TLS/RTP/SAVPF 120 121 126 97\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=sendrecv\r\n" +
            "a=extmap:1 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\n" +
            "a=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\n" +
            "a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\n" +
            "a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1\r\n" +
            "a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\r\n" +
            "a=fmtp:120 max-fs=12288;max-fr=60\r\n" +
            "a=fmtp:121 max-fs=12288;max-fr=60\r\n" +
            "a=ice-pwd:24e9d315b24ee847d5844c5f7313c42b\r\n" +
            "a=ice-ufrag:25047267\r\n" +
            "a=mid:sdparta_1\r\n" +
            "a=msid:{910b0af4-424f-41c3-8d46-c61f5d21516b} {5d086e46-9b16-4870-810d-0059a015528a}\r\n" +
            "a=rtcp-fb:120 nack\r\n" +
            "a=rtcp-fb:120 nack pli\r\n" +
            "a=rtcp-fb:120 ccm fir\r\n" +
            "a=rtcp-fb:120 goog-remb\r\n" +
            "a=rtcp-fb:121 nack\r\n" +
            "a=rtcp-fb:121 nack pli\r\n" +
            "a=rtcp-fb:121 ccm fir\r\n" +
            "a=rtcp-fb:121 goog-remb\r\n" +
            "a=rtcp-fb:126 nack\r\n" +
            "a=rtcp-fb:126 nack pli\r\n" +
            "a=rtcp-fb:126 ccm fir\r\n" +
            "a=rtcp-fb:126 goog-remb\r\n" +
            "a=rtcp-fb:97 nack\r\n" +
            "a=rtcp-fb:97 nack pli\r\n" +
            "a=rtcp-fb:97 ccm fir\r\n" +
            "a=rtcp-fb:97 goog-remb\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:120 VP8/90000\r\n" +
            "a=rtpmap:121 VP9/90000\r\n" +
            "a=rtpmap:126 H264/90000\r\n" +
            "a=rtpmap:97 H264/90000\r\n" +
            "a=setup:actpass\r\n" +
            "a=ssrc:2521847393 cname:{2fe325fe-1578-41b9-b8c1-d92e46b5d514}\r\n";

        it('Discovers 2 M lines of audio and video', () => {
            var sdpOptions = new SdpOptions();
            var result = transformSdp(audioVideoSdp, sdpOptions);
            chai.expect(result.mLines).to.eq(2);
        });


        var inputSdpUnencrypted = "v=0\r\n" +
            "o=- 6620764343933944878 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu\r\n" +
            "m=audio 9 RTP/AVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:Y3ri\r\n" +
            "a=ice-pwd:G95asCJENMnUeWx2dMhpi/ht\r\n" +
            "a=ice-options:trickle\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1;usedtx=0\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtpmap:103 ISAC/16000\r\n" +
            "a=rtpmap:104 ISAC/32000\r\n" +
            "a=rtpmap:9 G722/8000\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:8 PCMA/8000\r\n" +
            "a=rtpmap:106 CN/32000\r\n" +
            "a=rtpmap:105 CN/16000\r\n" +
            "a=rtpmap:13 CN/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2494980608 cname:5kX24X9Mu/D2Pcca\r\n" +
            "a=ssrc:2494980608 msid:epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu b8c6be2c-1869-4fb6-b05e-ceefefcb6d2c\r\n" +
            "a=ssrc:2494980608 mslabel:epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu\r\n" +
            "a=ssrc:2494980608 label:b8c6be2c-1869-4fb6-b05e-ceefefcb6d2c\r\n";

        var outputSdpUnencryptedOpusOnly = "v=0\r\n" +
            "o=- 6620764343933944878 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu\r\n" +
            "m=audio 9 RTP/AVPF 110 111 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:Y3ri\r\n" +
            "a=ice-pwd:G95asCJENMnUeWx2dMhpi/ht\r\n" +
            "a=ice-options:trickle\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1;usedtx=0\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2494980608 cname:5kX24X9Mu/D2Pcca\r\n" +
            "a=ssrc:2494980608 msid:epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu b8c6be2c-1869-4fb6-b05e-ceefefcb6d2c\r\n" +
            "a=ssrc:2494980608 mslabel:epPgfieKqbbeLwL2l9ulykxiVs3EMcKcvtnu\r\n" +
            "a=ssrc:2494980608 label:b8c6be2c-1869-4fb6-b05e-ceefefcb6d2c\r\n";

        it('Properly handles SDP with unencrypted RTP', () => {
            var sdpOptions = new SdpOptions();
            sdpOptions.forceCodec['audio'] = 'opus';
            var result = transformSdp(inputSdpUnencrypted, sdpOptions);
            chai.expect(result.sdp).to.eq(outputSdpUnencryptedOpusOnly);
        });
    });

    describe('getUserAgentData', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should use new userAgentData API when available', async () => {
            const mockResult = {
                platform: 'Windows',
                platformVersion: '10.0',
                architecture: 'x86',
                bitness: '64',
                mobile: false,
                model: '',
                fullVersionList: [
                    { brand: 'Chrome', version: '114.0.0' },
                    { brand: 'Not A Brand', version: '0.0.0' },
                ],
            };

            // Stub navigator.userAgentData and its method
            const getHighEntropyValuesStub = sandbox.stub().returns(mockResult);
            sandbox.stub(navigator, 'userAgentData').value({
                getHighEntropyValues: getHighEntropyValuesStub,
            });

            const result = await getUserAgentData();

            // Verify the results
            expect(result.platform).to.equal('Windows');
            expect(result.platformVersion).to.equal('10.0');
            expect(result.browserBrand).to.equal('Chrome');
            expect(result.browserVersion).to.equal('114.0.0');
        });

        it('should fall back to user-agent string when userAgentData is not available', async () => {
            // Stub navigator.userAgent with a sample user-agent string
            sandbox.stub(navigator, 'userAgent').value(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            );

            // Mock the UAParser and its result
            const mockParserResult = {
                browser: {name: 'Chrome', version: '114.0.0.0'},
                os: {name: 'Windows', version: '10'}
            };
            const getResultStub = sandbox.stub().returns(mockParserResult);
            const UAParserStub = sandbox.stub().returns({getResult: getResultStub});

            // Use the mocked UAParser class
            global.UAParser = UAParserStub;

            const result = await getUserAgentData();

            // Verify the fallback values
            expect(result.browserBrand).to.equal('Chrome');
            expect(result.browserVersion).to.equal('114.0.0.0');
            expect(result.platform).to.equal('Windows');
            expect(result.platformVersion).to.equal('10');
        });
    });
});
