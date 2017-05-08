/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {IllegalParameters} from './exceptions';

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

    if (! scope) {
        throw new IllegalParameters('utils.hitch(): scope is required!');
    }

    if (! method) {
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
    logMethods.forEach(function(logMethod) {
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
        for (var i=0; i<tracks.length; i++) {
            var track = tracks[i];
            try {
                track.stop();
            } catch (e) {
                // eat exception
            }
        }
    }
}