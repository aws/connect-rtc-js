/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {extractMediaStatsFromStats} from '../../src/js/rtp-stats';
import chai from 'chai';

describe('extractMediaStatsFromStats', () => {
    describe('standardized get stats', () => {
        var stats = [
            // Stats for audio from server to CCP, captured when server send it
            {
                "id": "ROA4171501808",
                "timestamp": 1687299157770,
                "type": "remote-outbound-rtp",
                "codecId": "CIT01_111_minptime=20;usedtx=0;useinbandfec=1",
                "kind": "audio",
                "ssrc": 4171501808,
                "transportId": "T01",
                "bytesSent": 41507,
                "packetsSent": 419,
                "localId": "IT01A4171501808",
                "remoteTimestamp": 1687299157818,
                "reportsSent": 8,
                "roundTripTimeMeasurements": 0,
                "totalRoundTripTime": 0
            },
            // Stats for audio from server to CCP, captured when CCP received it
            {
                "id": "IT01A4171501808",
                "timestamp": 1687299158258.1821,
                "type": "inbound-rtp",
                "codecId": "CIT01_111_minptime=20;usedtx=0;useinbandfec=1",
                "kind": "audio",
                "mediaType": "audio",
                "ssrc": 4171501808,
                "transportId": "T01",
                "jitter": 0.008,
                "packetsLost": 0,
                "packetsReceived": 443,
                "audioLevel": 0.000640888698995941,
                "bytesReceived": 39492,
                "concealedSamples": 636767,
                "concealmentEvents": 10,
                "fecPacketsDiscarded": 47,
                "fecPacketsReceived": 48,
                "headerBytesReceived": 5316,
                "insertedSamplesForDeceleration": 6197,
                "jitterBufferDelay": 28723.2,
                "jitterBufferEmittedCount": 419520,
                "jitterBufferMinimumDelay": 29472,
                "jitterBufferTargetDelay": 29702.4,
                "lastPacketReceivedTimestamp": 1687299158239,
                "mid": "0",
                "packetsDiscarded": 0,
                "playoutId": "AP",
                "remoteId": "ROA4171501808",
                "removedSamplesForAcceleration": 2652,
                "silentConcealedSamples": 620302,
                "totalAudioEnergy": 0.4464213113958445,
                "totalSamplesDuration": 22.06000000000065,
                "totalSamplesReceived": 1058880,
                "trackIdentifier": "b0494352-1a3c-4487-9fda-d0cd2b2c3856"
            },
            // Stats for audio from CCP to server, captured when CCP send it
            {
                "id": "OT01A4095073787",
                "timestamp": 1687299158258.1821,
                "type": "outbound-rtp",
                "codecId": "COT01_111_minptime=20;useinbandfec=1",
                "kind": "audio",
                "mediaType": "audio",
                "ssrc": 4095073787,
                "transportId": "T01",
                "bytesSent": 74222,
                "packetsSent": 1094,
                "active": true,
                "headerBytesSent": 13128,
                "mediaSourceId": "SA2",
                "mid": "0",
                "nackCount": 0,
                "remoteId": "RIA4095073787",
                "retransmittedBytesSent": 0,
                "retransmittedPacketsSent": 0,
                "targetBitrate": 32000,
                "totalPacketSendDelay": 0
            },
            {
                "id": "SA2",
                "timestamp": 1687299158258.1821,
                "type": "media-source",
                "kind": "audio",
                "trackIdentifier": "f71ea6b5-9c62-49c5-9bff-3640df9ba4da",
                "audioLevel": 0.0026551103244117557,
                "echoReturnLoss": -28.169708251953125,
                "echoReturnLossEnhancement": 0.17551203072071075,
                "totalAudioEnergy": 0.0023679653318673887,
                "totalSamplesDuration": 22.090000000000654
            },
            // Stats for audio from CCP to server, captured when server receive it
            {
                "id": "RIA4095073787",
                "timestamp": 1687299157770,
                "type": "remote-inbound-rtp",
                "codecId": "COT01_111_minptime=20;useinbandfec=1",
                "kind": "audio",
                "ssrc": 4095073787,
                "transportId": "T01",
                "jitter": 0.006020833333333334,
                "packetsLost": 7,
                "fractionLost": 0,
                "localId": "OT01A4095073787",
                "roundTripTime": 0.089935,
                "roundTripTimeMeasurements": 15,
                "totalRoundTripTime": 1.397446
            }
        ];

        it('is able to get audio_output stats', () => {
            var digestedStats = extractMediaStatsFromStats(0, stats, "audio_output");
            chai.expect(digestedStats.audioLevel).to.eq(87);
            chai.expect(digestedStats.packetsLost).to.eq(7);
            chai.expect(digestedStats.packetsCount).to.eq(1094);
            chai.expect(digestedStats.rttMilliseconds).to.eq(89);
            chai.expect(digestedStats.jbMilliseconds).to.eq(6);
            chai.expect(digestedStats.streamType).to.eq('audio_output');
        });

        it('is able to get audio_input stats', () => {
            var digestedStats = extractMediaStatsFromStats(0, stats, "audio_input");
            chai.expect(digestedStats.audioLevel).to.eq(21);
            chai.expect(digestedStats.packetsLost).to.eq(0);
            chai.expect(digestedStats.packetsCount).to.eq(443);
            chai.expect(digestedStats.rttMilliseconds).to.eq(null);
            chai.expect(digestedStats.jbMilliseconds).to.eq(8);
            chai.expect(digestedStats.streamType).to.eq('audio_input');
        });
    });
});
