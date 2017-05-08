/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/
export function extractAudioStatsFromStats(timestamp, stats, streamType) {
    var callStats = null;
    if (!stats) {
        return callStats;
    }
    var statsReports = Object.keys(stats);
    if (statsReports) {
        for (var i = 0; i < statsReports.length; i++) {
            var statsReport = stats[statsReports[i]];
            if (statsReport) {
                var packetsLost = 0;
                var audioLevel = null;
                if (statsReport.type === 'ssrc') {
                    //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                    if (typeof statsReport.packetsSent !== 'undefined' && streamType === 'audio_input') {
                        if (typeof statsReport.audioInputLevel !== 'undefined') {
                            audioLevel = statsReport.audioInputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsSent, audioLevel);
                    } else if (typeof statsReport.packetsReceived !== 'undefined' && streamType === 'audio_output') {
                        if (typeof statsReport.audioOutputLevel !== 'undefined') {
                            audioLevel = statsReport.audioOutputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel);
                    }
                } else if (statsReport.type === 'inboundrtp') {
                    //Firefox case. Firefox reports packetsLost parameter only in inboundrtp type, and doesn't report in outboundrtp type.
                    //So we only pull from inboundrtp. Firefox reports only stats for the stream passed in.
                    if (typeof statsReport.packetsLost !== 'undefined' && typeof statsReport.packetsReceived !== 'undefined') {
                        //no audio level in firefox
                        if (typeof statsReport.audioInputLevel !== 'undefined') {
                            audioLevel = statsReport.audioInputLevel;
                        }
                        if (statsReport.packetsLost > 0) {
                            packetsLost = statsReport.packetsLost;
                        }
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel);
                    }
                }
            }
        }
    }
    return callStats;
}

/**
* Basic RTP statistics object, represents statistics of an audio or video stream.
*/
class AudioRtpStats {
    constructor(timestamp, packetsLost, packetsCount, audioLevel) {
        this._timestamp = timestamp;
        this._packetsLost = packetsLost;
        this._packetsCount = packetsCount;
        this._audioLevel = audioLevel;
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
}