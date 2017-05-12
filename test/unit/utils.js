/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import { transformSdp, SdpOptions } from '../../src/js/utils';
import chai from 'chai';


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
        "a=rtpmap:110 telephone-event/48000\r\n" +
        "a=rtpmap:112 telephone-event/32000\r\n" +
        "a=rtpmap:113 telephone-event/16000\r\n" +
        "a=rtpmap:126 telephone-event/8000\r\n" +
        "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
        "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
        "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
        "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n";
    it('Override audio codec to opus', () => {
        var sdpOptions = new SdpOptions();
        sdpOptions.forceCodec['audio'] = 'opus';
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(expectedSdpWithOnlyOpus);
        sdpOptions.forceCodec['audio'] = 'OPUS';
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(expectedSdpWithOnlyOpus);
    });

    it('Removes nothing without matching media type', () => {
        var sdpOptions = new SdpOptions();
        sdpOptions.forceCodec['video'] = 'opus';
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(defaultOutput);
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
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(expectedPcmuSdp);
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
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(expectedSdpWithDtx);
    });

    it('Adds usedtx=0 if enableDtx is false', () => {
        var sdpOptions = new SdpOptions();
        sdpOptions.enableOpusDtx = false;
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(defaultOutput);
    });

    it('Adds usedtx=0 if enableDtx is not set', () => {
        var sdpOptions = new SdpOptions();
        chai.expect(transformSdp(inputSdp, sdpOptions)).to.eq(defaultOutput);
    });
});
