/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import './test-setup'
import {RTCSession, RTCErrors} from '../../src/js/connect-rtc';
import chai from 'chai';

describe('Bundled JS', () => {
    it('exports valid session class and error definition', () => {
        chai.expect(RTCSession).to.be.not.null;
        chai.expect(RTCErrors).to.be.not.null;
    });
});
