/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/

import { is_defined, when_defined } from './utils';
export function extractMediaStatsFromStats(timestamp, stats, streamType) {
    var extractedStats = null;

    for (var key in stats) {
        var statsReport = stats[key];
        if (statsReport) {
            if (statsReport.type === 'ssrc') {
                //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                if (is_defined(statsReport.packetsSent) && statsReport.mediaType == 'audio' && streamType === 'audio_input') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsSent,
                        bytesSent:          statsReport.bytesSent,
                        audioLevel:         when_defined(statsReport.audioInputLevel),
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        rttMilliseconds:    when_defined(statsReport.googRtt)
                    };

                } else if (is_defined(statsReport.packetsReceived) && statsReport.mediaType == 'audio' && streamType === 'audio_output') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsReceived,
                        bytesReceived:      statsReport.bytesReceived,
                        audioLevel:         when_defined(statsReport.audioOutputLevel),
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        jbMilliseconds:     when_defined(statsReport.googJitterBufferMs)
                    };

                } else if (is_defined(statsReport.packetsSent) && statsReport.mediaType == 'video' && streamType === 'video_input') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       statsReport.packetsSent,
                        bytesSent:          statsReport.bytesSent,
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        rttMilliseconds:    when_defined(statsReport.googRtt),
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        frameRateSent:      when_defined(statsReport.googFrameRateSent),
                    };

                } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_output') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:        statsReport.packetsSent,
                        bytesSent:          statsReport.bytesSent,
                        packetsLost:        is_defined(statsReport.packetsLost) ? Math.max(0, statsReport.packetsLost) : 0,
                        frameRateReceived:  when_defined(statsReport.googFrameRateReceived),
                        procMilliseconds:   is_defined(statsReport.googCurrentDelayMs),
                        jbMilliseconds:     when_defined(statsReport.googJitterBufferMs)
                    };

                }
            } else if (statsReport.type === 'inboundrtp') {
                // Firefox case. Firefox reports packetsLost parameter only in inboundrtp type, and doesn't report in outboundrtp type.
                // So we only pull from inboundrtp. Firefox reports only stats for the stream passed in.
                if (is_defined(statsReport.packetsLost) && is_defined(statsReport.packetsReceived)) {
                    extractedStats = {
                        packetsLost:        statsReport.packetsLost,
                        packetsCount:       statsReport.packetsReceived,
                        audioLevel:         when_defined(statsReport.audioInputLevel),
                        rttMilliseconds:    streamType === 'audio_ouptut' || streamType === 'video_output' ? when_defined(statsReport.roundTripTime) : null,
                        jbMilliseconds:     streamType === 'audio_output' || streamType === 'video_output' ? when_defined(statsReport.jitter, 0) * 1000 : null
                    };
                }
            }
        }
    }

    return extractedStats ? new MediaRtpStats(extractedStats, statsReport.type, streamType) : null;
}

/**
* Basic RTP statistics object, represents statistics of an audio or video stream.
*/
class MediaRtpStats {
    constructor(paramsIn, statsReportType, streamType) {
        var params = paramsIn || {};

        this._timestamp         = params.timestamp || new Date().getTime();
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
        this._statsReportType   = statsReportType || params._statsReportType || "unknown";
        this._streamType        = streamType || params.streamType || "unknown";
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
    /** Timestamp when stats are collected. */
    get timestamp() {
        return this._timestamp;
    }
    /** {number} Round trip time calculated with RTCP reports */
    get rttMilliseconds() {
        return this._rttMilliseconds;
    }
    set rttMilliseconds(ms) {
        this._rttMilliseconds = ms;
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
    /** {string} the type of the stats report */
    get statsReportType() {
        return this._statsReportType;
    }
    /** {string} the type of the stream */
    get streamType() {
        return this._streamType;
    }
}
