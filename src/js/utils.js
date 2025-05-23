/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {IllegalParameters} from './exceptions';
import {getKind, parseRtpMap, parseRtpParameters, splitLines, splitSections, writeFmtp} from 'sdp';
import {UserAgentData} from "./user_agent_data";
import {BROWSER_LIST, FIREFOX} from "./rtc_const";
import UAParser from 'ua-parser-js';

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
 * @param sdp original SDP
 * @param sdpOptions defines changes to be applied to SDP
 * @returns a map with 'sdp' containing the transformed SDP and 'mLines' containing the number of m lines in SDP
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
                    return /.*RTP\/S?AVPF? /.exec(line) + targetCodecPts.join(' ');
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtpmap:')) {
                var rtpMap = parseRtpMap(line);
                var currentCodec = codecMap[rtpMap.payloadType];

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                // append a=fmtp line immediately if current codec is OPUS (to explicitly specify OPUS parameters)
                if (is_defined(currentCodec) && currentCodec.name.toUpperCase() === 'OPUS') {
                    currentCodec.parameters.usedtx = sdpOptions.enableOpusDtx ? "1" : "0";
                    // generate fmtp line immediately after rtpmap line, and remove original fmtp line once we see it
                    return (line + "\r\n" + writeFmtp(currentCodec)).trim();
                } else {
                    return line;
                }
            } else if (line.startsWith('a=fmtp:')) {
                var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                var currentCodec = codecMap[pt];// eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                if (is_defined(currentCodec) && currentCodec.name.toUpperCase() === 'OPUS') {
                    // this is a line for OPUS, remove it because FMTP line is already generated when rtpmap line is processed
                    return null;
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtcp-fb:')) {
                var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' '));// eslint-disable-line no-redeclare
                if (pt === '*') { //always allow wildcard in rtc-fb
                    return line;
                } else {
                    var currentCodec = codecMap[pt];// eslint-disable-line no-redeclare

                    // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                    if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                        return null;
                    } else {
                        return line;
                    }
                }
            } else {
                return line;
            }
        }).filter(line => line !== null).join('\r\n');

    }
    return {
        sdp: sections.map(section => section.trim()).join('\r\n') + '\r\n',
        mLines: sections.length - 1 // first section is session description, the rest are media descriptions
    };
}

export function is_defined(v) {
    return typeof v !== 'undefined';
}

export function when_defined(v, alternativeIn) {
    var alternative = is_defined(alternativeIn) ? alternativeIn : null;
    return is_defined(v) ? v : alternative;
}

/**
 * Determine if the given value is a callable function type.
 * Borrowed from Underscore.js.
 */
export function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

/**
 * Asserts that a premise is true.
 */
export function assertTrue(premise, message) {
    if (!premise) {
        throw new Error(message);
    }
}

export function isChromeBrowser(){
    return navigator.userAgent.indexOf("Chrome") !== -1;
}

export function getChromeBrowserVersion(){
    var userAgent = navigator.userAgent;
    var chromeVersion = userAgent.substring(userAgent.indexOf("Chrome")+7);
    if (chromeVersion) {
        return parseFloat(chromeVersion);
    } else {
        return -1;
    }
}

export function getRedactedSdp(sdp) {
    // pattern to find and redact the value after 'a=ice-pwd:'
    var pattern = /a=ice-pwd:[^\r\n]*/;

    // Use the replace method to redact the value with '[redacted]'
    return sdp.replace(pattern, 'a=ice-pwd:[redacted]');
}

/**
 * Method to get userAgent data
 */

export async function getUserAgentData() {
    const userAgentData = new UserAgentData();

    if (navigator.userAgentData) {
        // use User-Agent Client Hints API
        const result = await navigator.userAgentData.getHighEntropyValues([
            'platform',
            'platformVersion',
            'architecture',
            'bitness',
            'mobile',
            'model',
            'fullVersionList',
        ]);

        userAgentData.platform = result.platform;
        userAgentData.platformVersion = result.platformVersion;
        userAgentData.architecture = result.architecture;
        userAgentData.bitness = result.bitness;
        userAgentData.mobile = result.mobile;
        userAgentData.model = result.model;

        const browser = result.fullVersionList.find(entry =>
            BROWSER_LIST.includes(entry.brand)
        );

        if (browser) {
            userAgentData.browserBrand = browser.brand;
            userAgentData.browserVersion = browser.version;
        } else {
            // Fallback to the first available browser brand
            const fallbackBrowser = result.fullVersionList.find(entry => entry.brand !== 'Not A Brand');
            userAgentData.browserBrand = fallbackBrowser ? fallbackBrowser.brand : 'Unknown';
            userAgentData.browserVersion = fallbackBrowser ? fallbackBrowser.version : 'Unknown';
        }
    } else {
        // Fallback to user-agent string parsing
        const userAgent = navigator.userAgent;
        const parser = new UAParser(userAgent);
        const parserResult = parser.getResult();

        userAgentData.browserBrand = parserResult.browser.name || 'Unknown';
        userAgentData.browserVersion = parserResult.browser.version || 'Unknown';
        userAgentData.platform = parserResult.os.name || 'Unknown';
        userAgentData.platformVersion = parserResult.os.version || 'Unknown';
        userAgentData.architecture = parserResult.cpu.architecture || 'Unknown';
    }

    return userAgentData;
}

export function isFirefoxBrowser(userAgentData) {
    if (userAgentData) {
        return userAgentData.browserBrand.toUpperCase() === FIREFOX.toUpperCase();
    } else {
        return navigator.userAgent.indexOf(FIREFOX) !== -1;
    }
}