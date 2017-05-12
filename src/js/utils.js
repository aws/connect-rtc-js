/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import { IllegalParameters } from './exceptions';
import { splitSections, splitLines, parseRtpMap, getKind, parseRtpParameters, writeFmtp } from 'sdp';

/**
 * All logging methods used by connect-rtc.
 */
var logMethods = ['log', 'info', 'warn', 'error'];

/**
* Binds the given instance object as the context for
* the method provided.
*
* @param scope The instance object to be set as the scope
*    of the function.
* @param method The method to be encapsulated.
*
* All other arguments, if any, are bound to the method
* invocation inside the closure.
*
* @return A closure encapsulating the invocation of the
*    method provided in context of the given instance.
*/
export function hitch() {
    var args = Array.prototype.slice.call(arguments);
    var scope = args.shift();
    var method = args.shift();

    if (!scope) {
        throw new IllegalParameters('utils.hitch(): scope is required!');
    }

    if (!method) {
        throw new IllegalParameters('utils.hitch(): method is required!');
    }

    if (typeof method !== 'function') {
        throw new IllegalParameters('utils.hitch(): method is not a function!');
    }

    return function _hitchedFunction() {
        var closureArgs = Array.prototype.slice.call(arguments);
        return method.apply(scope, args.concat(closureArgs));
    };
}

export function wrapLogger(logger, callId, logCategory) {
    var _logger = {};
    logMethods.forEach(function (logMethod) {
        if (!logger[logMethod]) {
            throw new Error('Logging method ' + logMethod + ' required');
        }
        _logger[logMethod] = hitch(logger, logger[logMethod], callId, logCategory);
    });
    return _logger;
}

export function closeStream(stream) {
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            try {
                track.stop();
            } catch (e) {
                // eat exception
            }
        }
    }
}

/**
 * A parameter of transformSdp.
 * This defines all the SDP options connect-rtc-js supports.
 */
export class SdpOptions {
    constructor() {
        this._forceCodec = {};
    }

    get enableOpusDtx() {
        return this._enableOpusDtx;
    }

    /**
     * By default transformSdp disables dtx for OPUS codec.
     * Setting this to true would force it to turn on DTX.
     */
    set enableOpusDtx(flag) {
        this._enableOpusDtx = flag;
    }

    /**
     * A map from media type (audio/video) to codec (case insensitive).
     * Add entry for force connect-rtc-js to use specified codec for certain media type.
     * For example: sdpOptions.forceCodec['audio'] = 'opus';
     */
    get forceCodec() {
        return this._forceCodec;
    }

    /**
     * Test if given codec should be removed from SDP.
     * @param mediaType audio|video
     * @param codecName case insensitive
     * @return TRUE - should remove
     */
    _shouldDeleteCodec(mediaType, codecName) {
        var upperCaseCodecName = codecName.toUpperCase();
        return this._forceCodec[mediaType] && upperCaseCodecName !== this._forceCodec[mediaType].toUpperCase() && upperCaseCodecName !== 'TELEPHONE-EVENT';
    }
}

/**
 * Modifies input SDP according to sdpOptions.
 * See SdpOptions for available options.
 */
export function transformSdp(sdp, sdpOptions) {
    var sections = splitSections(sdp);
    for (var i = 1; i < sections.length; i++) {
        var mediaType = getKind(sections[i]);
        var rtpParams = parseRtpParameters(sections[i]);
        // a map from payload type (string) to codec object
        var codecMap = rtpParams.codecs.reduce((map, codec) => {
            map['' + codec.payloadType] = codec;
            return map;
        }, {});
        sections[i] = splitLines(sections[i]).map(line => {
            if (line.startsWith('m=')) {
                // modify m= line if SdpOptions#forceCodec specifies codec for current media type
                if (sdpOptions.forceCodec[mediaType]) {
                    var targetCodecPts = Object.keys(codecMap).filter(pt => !sdpOptions._shouldDeleteCodec(mediaType, codecMap[pt].name));
                    return line.substring(0, line.indexOf('UDP/TLS/RTP/SAVPF ') + 'UDP/TLS/RTP/SAVPF '.length) + targetCodecPts.join(' ');
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtpmap:')) {
                var rtpMap = parseRtpMap(line);
                var currentCodec = codecMap[rtpMap.payloadType];

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }
                
                // append a=fmtp line immediately if current codec is OPUS (to explicitly specify OPUS parameters)
                if (currentCodec.name.toUpperCase() === 'OPUS') { 
                    currentCodec.parameters.usedtx = sdpOptions.enableOpusDtx ? 1 : 0;
                    // generate fmtp line immediately after rtpmap line, and remove original fmtp line once we see it
                    return (line + "\r\n" + writeFmtp(currentCodec)).trim();
                } else {
                    return line;
                }
            } else if (line.startsWith('a=fmtp:')) {
                var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                var currentCodec = codecMap[pt];// eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                if (currentCodec.name.toUpperCase() === 'OPUS') {
                    // this is a line for OPUS, remove it because FMTP line is already generated when rtpmap line is processed
                    return null;
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtcp-fb:')) {
                var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' '));// eslint-disable-line no-redeclare
                var currentCodec = codecMap[pt];// eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                } else {
                    return line;
                }
            } else {
                return line;
            }
        }).filter(line => line !== null).join('\r\n');

    }
    return sections.map(section => section.trim()).join('\r\n') + '\r\n';
}