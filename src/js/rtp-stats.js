/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/

import { is_defined, when_defined } from './utils';
export function extractMediaStatsFromStats(timestamp, stats, streamType) {
    var extractedStats = null;
    var reportType = null;
    var packetsSent = null;

    stats.forEach(statsReport => {
        if (statsReport) {
            if (statsReport.type === 'ssrc') {
                reportType = statsReport.type;
                // Legacy report. Legacy report names stats with google specific names.
                if (parseInt(statsReport.stat('packetsSent')) && statsReport.stat('mediaType') == 'audio' && streamType === 'audio_output') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       parseInt(statsReport.stat('packetsSent')),
                        bytesSent:          parseInt(statsReport.stat('bytesSent')),
                        audioLevel:         when_defined(parseInt(statsReport.stat('audioInputLevel'))),
                        packetsLost:        is_defined(statsReport.stat('packetsLost')) ? Math.max(0, statsReport.stat('packetsLost')) : 0,
                        procMilliseconds:   is_defined(parseInt(statsReport.stat('googCurrentDelayMs'))),
                        rttMilliseconds:    when_defined(parseInt(statsReport.stat('googRtt'))),
                        jbMilliseconds:     when_defined(parseInt(statsReport.stat('googJitterReceived')))
                    };

                } else if (parseInt(statsReport.stat('packetsReceived')) && statsReport.stat('mediaType') == 'audio' && streamType === 'audio_input') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       parseInt(statsReport.stat('packetsReceived')),
                        bytesReceived:      parseInt(statsReport.stat('bytesReceived')),
                        audioLevel:         when_defined(parseInt(statsReport.stat('audioOutputLevel'))),
                        packetsLost:        is_defined(parseInt(statsReport.stat('packetsLost'))) ? Math.max(0, statsReport.stat('packetsLost')) : 0,
                        procMilliseconds:   is_defined(parseInt(statsReport.stat('googCurrentDelayMs'))),
                        jbMilliseconds:     when_defined(parseInt(statsReport.stat('googJitterReceived')))
                    };

                } else if (is_defined(statsReport.packetsSent) && statsReport.mediaType == 'video' && streamType === 'video_input') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       parseInt(statsReport.stat('packetsSent')),
                        bytesSent:          parseInt(statsReport.stat('bytesSent')),
                        audioLevel:         when_defined(parseInt(statsReport.stat('audioInputLevel'))),
                        packetsLost:        is_defined(statsReport.stat('packetsLost')) ? Math.max(0, statsReport.stat('packetsLost')) : 0,
                        procMilliseconds:   is_defined(parseInt(statsReport.stat('googCurrentDelayMs'))),
                        frameRateSent:      when_defined(parseFloat(statsReport.stat('googFrameRateSent')))
                    };

                } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_output') {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsCount:       parseInt(statsReport.stat('packetsSent')),
                        bytesReceived:      parseInt(statsReport.stat('bytesReceived')),
                        packetsLost:        is_defined(parseInt(statsReport.stat('packetsLost'))) ? Math.max(0, statsReport.stat('packetsLost')) : 0,
                        frameRateReceived:  when_defined(parseFloat(stat('statsReport.googFrameRateReceived'))),
                        procMilliseconds:   is_defined(parseInt(statsReport.stat('googCurrentDelayMs'))),
                        jbMilliseconds:     when_defined(parseInt(statsReport.stat('googJitterReceived')))
                    };

                }
            // Standardized report. Standardized report reports audio_input stream stats using inboud-rtp and audio_output
            // stream stats from remote-inbound-rtp and packetsSent from outbound-rtp.
            } else if (statsReport.type === 'outbound-rtp') {
                packetsSent = statsReport.packetsSent;

            } else if (statsReport.type === 'inbound-rtp' || statsReport.type === 'remote-inbound-rtp') {
                reportType = statsReport.type;
                if (is_defined(statsReport.packetsLost) && is_defined(statsReport.packetsReceived)) {
                    extractedStats = {
                        timestamp:          timestamp,
                        packetsLost:        statsReport.packetsLost,
                        packetsCount:       streamType === 'audio_output' || streamType === 'video_output' ? packetsSent : statsReport.packetsReceived,
                        rttMilliseconds:    streamType === 'audio_output' || streamType === 'video_output' ? when_defined(statsReport.roundTripTime) * 1000 : null,
                        jbMilliseconds:     when_defined(statsReport.jitter, 0) * 1000
                    };
                }
            }
        }
    });

    return extractedStats ? new MediaRtpStats(extractedStats, reportType, streamType) : null;
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
