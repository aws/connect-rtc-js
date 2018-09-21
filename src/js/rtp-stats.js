/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/

import { is_defined, when_defined } from './utils';

export function extractMediaStatsFromStats(timestamp, stats, streamType) {
    let extractedStats = null;

    for (let key in stats) {
        var statsReport = stats[key];
        if (statsReport) {
            if (statsReport.type === 'ssrc') {
                //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                if (is_defined(statsReport.packetsSent) && statsReport.mediaType == 'audio' && streamType === 'audio_input') {
                    extractedStats = new MediaRtpStats({
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsSent,
                        bytesSent:          statsReport.bytesSent,
                        audioLevel:         when_defined(statsReport.audioInputLevel),
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        rttMilliseconds:    when_defined(statsReport.googRtt)
                    }, statsReport.type, streamType);

                } else if (is_defined(statsReport.packetsReceived) && statsReport.mediaType == 'audio' && streamType === 'audio_output') {
                    extractedStats = new MediaRtpStats({
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsReceived,
                        bytesReceived:      statsReport.bytesReceived,
                        audioLevel:         when_defined(statsReport.audioOutputLevel),
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        jbMilliseconds:     when_defined(statsReport.googJitterBufferMs)
                    }, statsReport.type, streamType);

                } else if (is_defined(statsReport.packetsSent) && statsReport.mediaType == 'video' && streamType === 'video_input') {
                    extractedStats = new MediaRtpStats({
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsSent,
                        bytesSent:          statsReport.bytesSent,
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        rttMilliseconds:    when_defined(statsReport.googRtt),
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        frameRateSent:      when_defined(statsReport.googFrameRateSent),
                    }, statsReport.type, streamType);

                } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_output') {
                    extractedStats = new MediaRtpStats({
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsSent,
                        bytesReceived:      statsReport.bytesReceived,
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        frameRateReceived:  when_defined(statsReport.googFrameRateReceived),
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        jbMilliseconds:     when_defined(statsReport.googJitterBufferMs)
                    }, statsReport.type, streamType);

                }
            } else if (statsReport.type === 'inboundrtp') {
                // Firefox case. Firefox reports packetsLost parameter only in inboundrtp type, and doesn't report in outboundrtp type.
                // So we only pull from inboundrtp. Firefox reports only stats for the stream passed in.
                if (is_defined(statsReport.packetsLost) && is_defined(statsReport.packetsReceived)) {
                    extractedStats = new MediaRtpStats({
                        packetsLost:        statsReport.packetsLost,
                        packetsCount:       statsReport.packetsReceived,
                        audioLevel:         when_defined(statsReport.audioInputLevel),
                        rttMilliseconds:    streamType === 'audio_output' || streamType === 'video_output' ? when_defined(statsReport.roundTripTime) : null,
                        jbMilliseconds:     streamType === 'audio_output' || streamType === 'video_output' ? when_defined(statsReport.jitter, 0) * 1000 : null
                    }, statsReport.type, streamType);
                }
            } else if (statsReport.type === 'VideoBwe') {
                if (streamType === 'video_bandwidth') {
                    extractedStats = new MediaBWEForVideoStats({
                        timestamp:              timestamp,
                        encBitrate:             statsReport.googActualEncBitrate,
                        availReceiveBW:         statsReport.googAvailableReceiveBandwidth,
                        availSendBW:            statsReport.googAvailableSendBandwidth,
                        bucketDelay:            statsReport.googBucketDelay,
                        retransmitBitrate:      statsReport.googRetransmitBitrate,
                        targetEncBitrate:       statsReport.googTargetEncBitrate,
                        transmitBitrate:        statsReport.googTransmitBitrate
                    }, statsReport.type, streamType);
                }
            }
        }
    }
    return extractedStats ? extractedStats : null;
}

/**
* Basic statistics object, represents core properties of any statistic
*/
class BaseStats {
    constructor(params = {}, statsReportType, streamType) {
        this._timestamp         = params.timestamp || new Date().getTime();
        this._statsReportType   = statsReportType || params._statsReportType || "unknown";
        this._streamType        = streamType || params.streamType || "unknown";
    }
    /** Timestamp when stats are collected. */
    get timestamp() {
        return this._timestamp;
    }
    /** {string} the type of the stats report */
    get statsReportType() {
        return this._statsReportType;
    }
    /** {string} the type of the stream */
    get streamType() {
        return this._streamType;
    }
}

/**
* Basic RTP statistics object, represents statistics of an audio or video stream.
*/
class MediaRtpStats extends BaseStats {
    constructor(params = {}, statsReportType, streamType) {
        super(params, statsReportType, streamType);

        this._packetsLost       = when_defined(params.packetsLost);
        this._packetsCount      = when_defined(params.packetsCount);
        this._audioLevel        = when_defined(params.audioLevel);
        this._rttMilliseconds   = when_defined(params.rttMilliseconds);
        this._jbMilliseconds    = when_defined(params.jbMilliseconds);
        this._bytesSent         = when_defined(params.bytesSent);
        this._bytesReceived     = when_defined(params.bytesReceived);
        this._framesEncoded     = when_defined(params.framesEncoded);
        this._framesDecoded     = when_defined(params.framesDecoded);
        this._frameRateSent     = when_defined(params.frameRateSent);
        this._frameRateReceived = when_defined(params.frameRateReceived);
    }

    /** {number} number of packets sent to the channel */
    get packetsCount() {
        return this._packetsCount;
    }
    /** {number} number of packets lost after travelling through the channel */
    get packetsLost() {
        return this._packetsLost;
    }
    /** {number} number of packets lost after travelling through the channel */
    get packetLossPercentage() {
        return this._packetsCount > 0 ? this._packetsLost / this._packetsCount : 0;
    }
    /** Audio volume level
    * Currently firefox doesn't provide audio level in rtp stats.
    */
    get audioLevel() {
        return this._audioLevel;
    }
    /** {number} Round trip time calculated with RTCP reports */
    get rttMilliseconds() {
        return this._rttMilliseconds;
    }
    /** {number} Browser/client side jitter buffer length */
    get jbMilliseconds() {
        return this._jbMilliseconds;
    }
    /** {number} number of bytes sent to the channel*/
    get bytesSent() {
        return this._bytesSent;
    }
    /** {number} number of bytes received from the channel*/
    get bytesReceived() {
        return this._bytesReceived;
    }
    /** {number} number of video frames encoded*/
    get framesEncoded() {
        return this._framesEncoded;
    }
    /** {number} number of video frames decoded*/
    get framesDecoded() {
        return this._framesDecoded;
    }
    /** {number} frames per second sent to the channel*/
    get frameRateSent() {
        return this._frameRateSent;
    }
    /** {number} frames per second received from the channel*/
    get frameRateReceived() {
        return this._frameRateReceived;
    }
}

/**
* Basic BWEForVideo statistics object, represents statistics of an audio or video stream.
*/
class MediaBWEForVideoStats extends BaseStats {
    constructor(params = {}, statsReportType, streamType) {
        super(params, statsReportType, streamType);

        this._encBitrate        = when_defined(params.encBitrate);
        this._availReceiveBW    = when_defined(params.availReceiveBW);
        this._availSendBW       = when_defined(params.availSendBW);
        this._bucketDelay       = when_defined(params.bucketDelay);
        this._retransmitBitrate = when_defined(params.retransmitBitrate);
        this._targetEncBitrate  = when_defined(params.targetEncBitrate);
        this._transmitBitrate   = when_defined(params.transmitBitrate);
    }
    get encBitrate() {
        return this._encBitrate;
    }
    get availReceiveBW() {
        return this._availReceiveBW;
    }
    get availSendBW() {
        return this._availSendBW;
    }
    get bucketDelay() {
        return this._bucketDelay;
    }
    get retransmitBitrate() {
        return this._retransmitBitrate;
    }
    get targetEncBitrate() {
        return this._targetEncBitrate;
    }
    get transmitBitrate() {
        return this._transmitBitrate;
    }
}
