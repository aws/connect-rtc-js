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
 * Remove all codecs except the specified one from specified media type, return the new SDP.
 * WARNING: This may return a bad SDP without any usable codec.
 */
export function forceCodec(sdp, mediaType, targetCodec) {
    var sections = splitSections(sdp);
    for (var i = 1; i < sections.length; i++) {
        if (getKind(sections[i]) === mediaType) {
            var rtpParams = parseRtpParameters(sections[i]);
            var targetCodecMap = rtpParams.codecs.filter(codec => codec.name.toUpperCase() === targetCodec.toUpperCase() || codec.name.toUpperCase() == 'TELEPHONE-EVENT')
                .reduce((map, codec) => {
                    map['' + codec.payloadType] = codec;
                    return map;
                }, {});
            sections[i] = splitLines(sections[i]).map(line => {
                if (line.startsWith('m=')) {
                    return line.substring(0, line.indexOf('UDP/TLS/RTP/SAVPF ') + 'UDP/TLS/RTP/SAVPF '.length) + Object.keys(targetCodecMap).join(' ');
                } else if (line.startsWith('a=rtpmap')) {
                    var pt = parseRtpMap(line).payloadType;
                    if (targetCodecMap[pt]) {
                        return line;
                    } else {
                        return null;
                    }
                } else if (line.startsWith('a=fmtp:') || line.startsWith('a=rtcp-fb:')) {
                    var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' '));// eslint-disable-line no-redeclare
                    if (targetCodecMap[pt]) {
                        return line;
                    } else {
                        return null;
                    }
                } else {
                    return line;
                }
            }).filter(line => line !== null).join('\r\n');
        }
    }
    return sections.map(section => section.trim()).join('\r\n') + '\r\n';
}

/**
 * Modify OPUS DTX parameter of SDP and return a new SDP.
 * This disables DTX by default and
 */
export function modifyOpusDtxParam(sdp, enableDtx) {
    var sections = splitSections(sdp);
    for (var i = 1; i < sections.length; i++) {
        if (getKind(sections[i]) === 'audio') {
            var rtpParams = parseRtpParameters(sections[i]);
            // a map from payload type to codec object, all OPUS
            var opusCodecMap = rtpParams.codecs.filter(codec => codec.name.toUpperCase() === 'OPUS').reduce((map, codec) => {
                map['' + codec.payloadType] = codec;
                return map;
            }, {});
            sections[i] = splitLines(sections[i]).map(line => {
                if (line.startsWith('a=rtpmap:')) {
                    var rtpMap = parseRtpMap(line);
                    var opusCodec = opusCodecMap[rtpMap.payloadType];
                    if (opusCodec) {
                        // modify opus parameter
                        opusCodec.parameters.usedtx = enableDtx ? 1 : 0;
                        // generate fmtp line immediately, we will remove original fmtp line once we see it
                        return (line + "\r\n" + writeFmtp(opusCodec)).trim();
                    } else {
                        return line;
                    }
                } else if (line.startsWith('a=fmtp:')) {
                    var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                    if (opusCodecMap[pt]) {
                        // this is a line for OPUS, remove it because we already generated FMTP line for it when we process the rtpmap line
                        return null;
                    } else {
                        return line;
                    }
                } else {
                    return line;
                }
            }).filter(line => line !== null).join('\r\n');
        }
    }
    return sections.map(section => section.trim()).join('\r\n') + '\r\n';
}
