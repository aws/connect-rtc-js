/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class SessionReport {
    /**
     * @class Prototype for tracking various RTC session report
     * @constructs
     */
    constructor() {
        this._sessionStartTime = null;
        this._sessionEndTime = null;
        this._gumTimeMillis = null;
        this._initializationTimeMillis = null;
        this._iceCollectionTimeMillis = null;
        this._signallingConnectTimeMillis = null;
        this._handshakingTimeMillis = null;
        this._preTalkingTimeMillis = null;
        this._talkingTimeMillis = null;
        this._iceConnectionsLost = 0;
        this._cleanupTimeMillis = null;
        this._iceCollectionFailure = null;
        this._signallingConnectionFailure = null;
        this._handshakingFailure = null;
        this._gumOtherFailure = null;
        this._gumTimeoutFailure = null;
        this._createOfferFailure = null;
        this._setLocalDescriptionFailure = null;
        this._userBusyFailure = null;
        this._invalidRemoteSDPFailure = null;
        this._noRemoteIceCandidateFailure = null;
        this._setRemoteDescriptionFailure = null;
        this._streamStats = [];
    }
    /**
     *Timestamp when RTCSession started.
     */
    get sessionStartTime() {
        return this._sessionStartTime;
    }
    /**
     * Timestamp when RTCSession ended.
     */
    get sessionEndTime() {
        return this._sessionEndTime;
    }
    /**
     * Time taken for grabbing user microphone at the time of connecting RTCSession.
     */
    get gumTimeMillis() {
        return this._gumTimeMillis;
    }
    /**
     * Time taken for session initialization in millis. Includes time spent in GrabLocalMedia, SetLocalSDP states.
     */
    get initializationTimeMillis() {
        return this._initializationTimeMillis;
    }
    /**
     * Time spent on ICECollection in millis.
     */
    get iceCollectionTimeMillis() {
        return this._iceCollectionTimeMillis;
    }
    /**
     * Time taken for connecting the signalling in millis.
     */
    get signallingConnectTimeMillis() {
        return this._signallingConnectTimeMillis;
    }
    /**
     * Times spent from RTCSession connection until entering Talking state in millis.
     */
    get preTalkingTimeMillis() {
        return this._preTalkingTimeMillis;
    }
    /**
     *  Times spent in completing handshaking process of the RTCSession in millis.
     */
    get handshakingTimeMillis() {
        return this._handshakingTimeMillis;
    }
    /**
     *  Times spent in Talking state in millis.
     */
    get talkingTimeMillis() {
        return this._talkingTimeMillis;
    }
    /**
     * How many times the RTCSession has lost ICE connection in talking state.
     */
    get iceConnectionsLost() {
        return this._iceConnectionsLost;
    }
    /**
     * Times spent in Cleanup state in millis
     */
    get cleanupTimeMillis() {
        return this._cleanupTimeMillis;
    }
    /**
     * Tells if the RTCSession fails in ICECollection.
     */
    get iceCollectionFailure() {
        return this._iceCollectionFailure;
    }
    /**
     * Tells if the RTCSession failed in signalling connect stage.
     */
    get signallingConnectionFailure() {
        return this._signallingConnectionFailure;
    }
    /**
     * Handshaking failure of the RTCSession
     */
    get handshakingFailure() {
        return this._handshakingFailure;
    }
    /**
     * Gum failed due to timeout at the time of new RTCSession connection
     */
    get gumTimeoutFailure() {
        return this._gumTimeoutFailure;
    }
    /**
     * Gum failed due to other reasons (other than Timeout)
     */
    get gumOtherFailure() {
        return this._gumOtherFailure;
    }
    /**
     * RTC Session failed in create Offer state.
     */
    get createOfferFailure() {
        return this._createOfferFailure;
    }
    /**
     * Tells if setLocalDescription failed for the RTC Session.
     */
    get setLocalDescriptionFailure() {
        return this._setLocalDescriptionFailure;
    }
    /**
     * Tells if handshaking failed due to user busy case,
     * happens when multiple softphone calls are initiated at same time.
     */
    get userBusyFailure() {
        return this._userBusyFailure;
    }
    /**
     * Tells it remote SDP is invalid.
     */
    get invalidRemoteSDPFailure() {
        return this._invalidRemoteSDPFailure;
    }
    /**
     * Tells if the setRemoteDescription failed for the RTC Session.
     */
    get setRemoteDescriptionFailure() {
        return this._setRemoteDescriptionFailure;
    }
    /**
     * A failure case when there is no RemoteIceCandidate.
     */
    get noRemoteIceCandidateFailure() {
        return this._noRemoteIceCandidateFailure;
    }
    /**
     * Statistics for each stream(audio-in, audio-out, video-in, video-out) of the RTCSession.
     */
    get streamStats() {
        return this._streamStats;
    }

    set sessionStartTime(value) {
        this._sessionStartTime = value;
    }
    set sessionEndTime(value) {
        this._sessionEndTime = value;
    }
    set gumTimeMillis(value) {
        this._gumTimeMillis = value;
    }
    set initializationTimeMillis(value) {
        this._initializationTimeMillis = value;
    }
    set iceCollectionTimeMillis(value) {
        this._iceCollectionTimeMillis = value;
    }
    set signallingConnectTimeMillis(value) {
        this._signallingConnectTimeMillis = value;
    }
    set preTalkingTimeMillis(value) {
        this._preTalkingTimeMillis = value;
    }
    set handshakingTimeMillis(value) {
        this._handshakingTimeMillis = value;
    }
    set talkingTimeMillis(value) {
        this._talkingTimeMillis = value;
    }
    set iceConnectionsLost(value) {
        this._iceConnectionsLost = value;
    }
    set cleanupTimeMillis(value) {
        this._cleanupTimeMillis = value;
    }
    set iceCollectionFailure(value) {
        this._iceCollectionFailure = value;
    }
    set signallingConnectionFailure(value) {
        this._signallingConnectionFailure = value;
    }
    set handshakingFailure(value) {
        this._handshakingFailure = value;
    }
    set gumTimeoutFailure(value) {
        this._gumTimeoutFailure = value;
    }
    set gumOtherFailure(value) {
        this._gumOtherFailure = value;
    }
    set createOfferFailure(value) {
        this._createOfferFailure = value;
    }
    set setLocalDescriptionFailure(value) {
        this._setLocalDescriptionFailure = value;
    }
    set userBusyFailure(value) {
        this._userBusyFailure = value;
    }
    set invalidRemoteSDPFailure(value) {
        this._invalidRemoteSDPFailure = value;
    }
    set noRemoteIceCandidateFailure(value) {
        this._noRemoteIceCandidateFailure = value;
    }
    set setRemoteDescriptionFailure(value) {
        this._setRemoteDescriptionFailure = value;
    }
    set streamStats(value) {
        this._streamStats = value;
    }
}
