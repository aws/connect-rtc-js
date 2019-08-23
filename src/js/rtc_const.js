/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
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
 * Timeout waiting for ice reconnection in case of ice state change to failed or disconnected state
 */
export const MAX_ICE_RECONNECT_MS = 300*1000;

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
