/**
 * Extract rtp stats of specified stream from RTCStatsReport
 * Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
 * StreamType is passed only to pull right stream stats audio_input or audio_output.
 */

import { is_defined, when_defined } from './utils';
export function extractMediaStatsFromStats(timestamp, stats, streamType) {
    var extractedStats = null;
    var reportType = null;

    stats.forEach(statsReport => {
        if (statsReport) {
            if (statsReport.type === 'inbound-rtp' && streamType === 'audio_input') {
                // inbound-rtp: Stats for stream from Server to CCP, as seen on the browser
                reportType = statsReport.type;
                extractedStats = {
                    timestamp: timestamp,
                    packetsLost: statsReport.packetsLost,
                    // packetsCount: number of packet received by CCP, as seen on the browser
                    packetsCount: statsReport.packetsReceived,
                    jbMilliseconds: Math.floor(when_defined(statsReport.jitter, 0) * 1000),
                    // Multiplying audioLevel by 32768 aligns its value with the legacy getStats API.
                    audioLevel: is_defined(statsReport.audioLevel) ? Math.floor(statsReport.audioLevel * 32768) : null
                };
            } else if (statsReport.type === 'outbound-rtp' && streamType === 'audio_output') {
                // outbound-rtp: Stats for stream from CCP to Server, as seen on the browser
                extractedStats = extractedStats || {};
                // packetsCount: number of packet sent by CCP, as seen on the browser
                extractedStats.packetsCount = statsReport.packetsSent;
            } else if (statsReport.type === 'media-source' && streamType === 'audio_output') {
                extractedStats = extractedStats || {};
                // Multiplying audioLevel by 32768 aligns its value with the legacy getStats API.
                extractedStats.audioLevel = is_defined(statsReport.audioLevel) ? Math.floor(statsReport.audioLevel * 32768) : null;
            } else if (statsReport.type === 'remote-inbound-rtp' && streamType === 'audio_output') {
                // remote-inbound-rtp: Stats for stream from CCP to Server, as seen on Server side
                reportType = statsReport.type;
                extractedStats = extractedStats || {};
                extractedStats.timestamp = timestamp;
                extractedStats.packetsLost = statsReport.packetsLost;
                extractedStats.rttMilliseconds = is_defined(statsReport.roundTripTime) ? Math.floor(statsReport.roundTripTime * 1000) : null;
                extractedStats.jbMilliseconds = Math.floor(when_defined(statsReport.jitter, 0) * 1000);
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
        this._procMilliseconds  = when_defined(params.procMilliseconds);
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
    /** {number} Processing delay calculated by time to process packet header */
    get procMilliseconds() {
        return this._procMilliseconds
    }
    /** {number} Round trip time calculated with RTCP reports */
    get rttMilliseconds() {
        return this._rttMilliseconds;
    }
    /** {number} Statistical variance of RTP data packet inter-arrival time */
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
