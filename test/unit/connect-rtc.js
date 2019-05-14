/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import { RTCSession, RTCErrors } from '../../src/js/connect-rtc';
import chai from 'chai';

describe('Bundled JS', () => {
    it('exports valid session class and error definition', () => {
        chai.expect(RTCSession).to.be.not.null;
        chai.expect(RTCErrors).to.be.not.null;
    });
});
