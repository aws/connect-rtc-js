/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Timeout waiting for server response to accept/hangup request.
 */
export const MAX_ACCEPT_BYE_DELAY_MS = 2000;
/**
 * Timeout waiting for server response to invite.
 */
export const MAX_INVITE_DELAY_MS = 5000;
/**
 *  Default timeout on opening WebSocket connection.
 */
export const DEFAULT_CONNECT_TIMEOUT_MS = 10000;
/**
 * Default ice collection timeout in milliseconds.
 */
export const DEFAULT_ICE_TIMEOUT_MS = 8000;
/**
 * Default gum timeout in milliseconds to be enforced during start of a call.
 */
export const DEFAULT_GUM_TIMEOUT_MS = 10000;

/**
 * RTC error names.
 */
export const RTC_ERRORS = {
     ICE_COLLECTION_TIMEOUT : 'Ice Collection Timeout',
     USER_BUSY : 'User Busy',
     SIGNALLING_CONNECTION_FAILURE : 'Signalling Connection Failure',
     SIGNALLING_HANDSHAKE_FAILURE : 'Signalling Handshake Failure',
     SET_REMOTE_DESCRIPTION_FAILURE : 'Set Remote Description Failure',
     CREATE_OFFER_FAILURE : 'Create Offer Failure',
     SET_LOCAL_DESCRIPTION_FAILURE : 'Set Local Description Failure',
     INVALID_REMOTE_SDP : 'Invalid Remote SDP',
     NO_REMOTE_ICE_CANDIDATE : 'No Remote ICE Candidate',
     GUM_TIMEOUT_FAILURE : 'GUM Timeout Failure',
     GUM_OTHER_FAILURE : 'GUM Other Failure',
     CALL_NOT_FOUND: 'Call Not Found'
};