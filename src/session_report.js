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
        this._firstRTPTimeMillis = null;
        this._isPCMv2Path = null;
        this._isExistingPersistentPeerConnection = null;
        this._iceCredentialSource = null;
        this._isContactCredentialsDifferentRegion = null;
        this._isPersistentPeerConnection = null;
        this._iceConnectionsLost = 0;
        this._iceConnectionsFailed = null;
        this._peerConnectionFailed = null;
        this._iceRestartAttempts = 0;
        this._iceRestartSuccesses = 0;
        this._iceRestartInviteRetries = 0;
        this._iceRestartTimeMillis = null;
        this._iceRestartFailed = null;
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
        this._rtcJsVersion = "@@RTC_JS_VERSION";
        this._userAgentData = null;
        // Device metrics
        this._microphonePermission = null;
        this._deviceMemory = null;
        // Audio track settings
        this._noiseSuppression = null;
        this._autoGainControl = null;
        this._echoCancellation = null;
        this._voiceIsolation = null;
        // Network metrics
        this._networkEffectiveType = null;
        this._networkRtt = null;
        // Browser info
        this._browserBrand = null;
        this._browserVersion = null;
        this._platform = null;
        this._platformVersion = null;
        // Audio devices
        this._audioInputDevices = null;
        this._audioOutputDevices = null;
        this._timeSinceLastCallSeconds = null;
        this._pcmCreationToFirstCallSeconds = null;
        this._vdiMetadata = null;
        this._vdiClientVersion = null;
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
     * Time taken to receive the first RTP packet from call session connect in millis.
     */
    get firstRTPTimeMillis() {
        return this._firstRTPTimeMillis;
    }
    /**
     * Indicates if this session is using the PCMv2 (call session) path.
     */
    get isPCMv2Path() {
        return this._isPCMv2Path;
    }
    /**
     * Indicates if this session is using an existing persistent peer connection.
     */
    get isExistingPersistentPeerConnection() {
        return this._isExistingPersistentPeerConnection;
    }
    /**
     * Source of ICE credentials used - 'api-fetched' or 'contact-provided'.
     */
    get iceCredentialSource() {
        return this._iceCredentialSource;
    }
    /**
     * Boolean flag indicating whether contact credentials were from a different region.
     */
    get isContactCredentialsDifferentRegion() {
        return this._isContactCredentialsDifferentRegion;
    }
    /**
     * Indicates if persistent peer connection was enabled for this session.
     */
    get isPersistentPeerConnection() {
        return this._isPersistentPeerConnection;
    }
    /**
     * How many times the RTCSession has lost ICE connection in talking state.
     */
    get iceConnectionsLost() {
        return this._iceConnectionsLost;
    }
    /**
     * Tells if the RTCSession has failed RTCPeerConnection.iceConnectionState
     */
    get iceConnectionsFailed() {
        return this._iceConnectionsFailed;
    }
    /**
     * Tells if the RTCSession has failed RTCPeerConnection.connectionState
     */
    get peerConnectionFailed() {
        return this._peerConnectionFailed;
    }
    /**
     * Number of times ICE restart was attempted during this session
     */
    get iceRestartAttempts() {
        return this._iceRestartAttempts;
    }
    /**
     * Number of times ICE restart succeeded during this session
     */
    get iceRestartSuccesses() {
        return this._iceRestartSuccesses;
    }
    /**
     * Number of invite retries for the last ICE restart
     */
    get iceRestartInviteRetries() {
        return this._iceRestartInviteRetries;
    }
    /**
     * Time taken for the last ICE restart in milliseconds
     */
    get iceRestartTimeMillis() {
        return this._iceRestartTimeMillis;
    }
    /**
     * Whether the last ICE restart failed (true) or succeeded (false)
     */
    get iceRestartFailed() {
        return this._iceRestartFailed;
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
    /**
     * get current connect-rtc-js version
     */
    get rtcJsVersion() {
        return this._rtcJsVersion;
    }

    /**
     * userAgent data
     */
    get userAgentData() {
        return this._userAgentData;
    }
    /**
     * Microphone permission state (granted/denied/prompt)
     */
    get microphonePermission() {
        return this._microphonePermission;
    }
    /**
     * Device memory in GB (navigator.deviceMemory)
     */
    get deviceMemory() {
        return this._deviceMemory;
    }
    /**
     * Whether noise suppression is enabled on the audio track
     */
    get noiseSuppression() {
        return this._noiseSuppression;
    }
    /**
     * Whether auto gain control is enabled on the audio track
     */
    get autoGainControl() {
        return this._autoGainControl;
    }
    /**
     * Whether echo cancellation is enabled on the audio track
     */
    get echoCancellation() {
        return this._echoCancellation;
    }
    /**
     * Whether Voice Isolation is enabled on the audio track
     */
    get voiceIsolation() {
        return this._voiceIsolation;
    }
    /**
     * Network effective type (2g/3g/4g)
     */
    get networkEffectiveType() {
        return this._networkEffectiveType;
    }
    /**
     * Network RTT baseline in ms
     */
    get networkRtt() {
        return this._networkRtt;
    }
    /**
     * Browser brand name
     */
    get browserBrand() {
        return this._browserBrand;
    }
    /**
     * Browser version
     */
    get browserVersion() {
        return this._browserVersion;
    }
    /**
     * Platform/OS name
     */
    get platform() {
        return this._platform;
    }
    /**
     * Platform/OS version
     */
    get platformVersion() {
        return this._platformVersion;
    }
    /**
     * List of available audio input devices
     */
    get audioInputDevices() {
        return this._audioInputDevices;
    }
    /**
     * List of available audio output devices
     */
    get audioOutputDevices() {
        return this._audioOutputDevices;
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
    set firstRTPTimeMillis(value) {
        this._firstRTPTimeMillis = value;
    }
    set isPCMv2Path(value) {
        this._isPCMv2Path = value;
    }
    set isExistingPersistentPeerConnection(value) {
        this._isExistingPersistentPeerConnection = value;
    }
    set iceCredentialSource(value) {
        this._iceCredentialSource = value;
    }
    set isContactCredentialsDifferentRegion(value) {
        this._isContactCredentialsDifferentRegion = value;
    }
    set isPersistentPeerConnection(value) {
        this._isPersistentPeerConnection = value;
    }
    set iceConnectionsLost(value) {
        this._iceConnectionsLost = value;
    }
    set iceConnectionsFailed(value) {
        this._iceConnectionsFailed = value;
    }
    set peerConnectionFailed(value) {
        this._peerConnectionFailed = value;
    }
    set iceRestartAttempts(value) {
        this._iceRestartAttempts = value;
    }
    set iceRestartSuccesses(value) {
        this._iceRestartSuccesses = value;
    }
    set iceRestartInviteRetries(value) {
        this._iceRestartInviteRetries = value;
    }
    set iceRestartTimeMillis(value) {
        this._iceRestartTimeMillis = value;
    }
    set iceRestartFailed(value) {
        this._iceRestartFailed = value;
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
    set rtcJsVersion(value) {
        this._rtcJsVersion = value;
    }
    set userAgentData(value) {
        this._userAgentData = value;
    }
    set microphonePermission(value) {
        this._microphonePermission = value;
    }
    set deviceMemory(value) {
        this._deviceMemory = value;
    }
    set noiseSuppression(value) {
        this._noiseSuppression = value;
    }
    set autoGainControl(value) {
        this._autoGainControl = value;
    }
    set echoCancellation(value) {
        this._echoCancellation = value;
    }
    set voiceIsolation(value) {
        this._voiceIsolation = value;
    }
    set networkEffectiveType(value) {
        this._networkEffectiveType = value;
    }
    set networkRtt(value) {
        this._networkRtt = value;
    }
    set browserBrand(value) {
        this._browserBrand = value;
    }
    set browserVersion(value) {
        this._browserVersion = value;
    }
    set platform(value) {
        this._platform = value;
    }
    set platformVersion(value) {
        this._platformVersion = value;
    }
    set audioInputDevices(value) {
        this._audioInputDevices = value;
    }
    set audioOutputDevices(value) {
        this._audioOutputDevices = value;
    }

    /**
     * Time in seconds since the last call ended (2nd+ calls only).
     * Helps understand agent call frequency and optimize persistent connection timeout.
     */
    get timeSinceLastCallSeconds() {
        return this._timeSinceLastCallSeconds;
    }
    set timeSinceLastCallSeconds(value) {
        this._timeSinceLastCallSeconds = value;
    }

    /**
     * Time in seconds from PCM creation to the first call (1st call only).
     * Measures page-load-to-first-call latency.
     */
    get pcmCreationToFirstCallSeconds() {
        return this._pcmCreationToFirstCallSeconds;
    }
    set pcmCreationToFirstCallSeconds(value) {
        this._pcmCreationToFirstCallSeconds = value;
    }

    get vdiMetadata() {
        return this._vdiMetadata;
    }
    set vdiMetadata(value) {
        this._vdiMetadata = value;
    }

    get vdiClientVersion() {
        return this._vdiClientVersion;
    }
    set vdiClientVersion(value) {
        this._vdiClientVersion = value;
    }
}
