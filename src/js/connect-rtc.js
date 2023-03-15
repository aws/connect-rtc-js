/**
 * @license
 * License info for uuid module assembled into js bundle:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2016 Robert Kieffer and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import RtcSession from './rtc_session';
import {RTC_ERRORS} from './rtc_const';
import RtcPeerConnectionFactory from './rtc_peer_connection_factory'
import uuid from 'uuid/v4';

global.connect = global.connect || {};
global.connect.RTCSession = RtcSession;
global.connect.RTCErrors = RTC_ERRORS;
global.connect.RtcPeerConnectionFactory = RtcPeerConnectionFactory;
global.connect.uuid = uuid;

global.lily = global.lily || {};
global.lily.RTCSession = RtcSession;
global.lily.RTCErrors = RTC_ERRORS;
