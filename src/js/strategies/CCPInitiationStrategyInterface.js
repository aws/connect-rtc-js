
export default class CCPInitiationStrategyInterface {
    constructor() {
        console.log("CCPInitiationStrategyInterface initialized");
    }

    getStrategyName(){
        console.error("getStrategyName needs to be overridden");
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isEarlyMediaConnectionSupported(){
        console.error("_isEarlyMediaConnectionSupported needs to be overridden");
    }

    _createRtcPeerConnection() {
        console.error("_createRtcPeerConnection needs to be overridden");
    }

    // the following functions are rtc_session related functions
    _gUM() {
        console.error("_gUM needs to be overridden");
    }

    // the following functions are rtc_session related functions
    _createMediaStream() {
        console.error("_createMediaStream needs to be overridden");
    }

    addStream() {
        console.error("addStream needs to be overridden");
    }

    setRemoteDescription() {
        console.error("setRemoteDescription needs to be overridden");
    }

    setRemoteDescriptionForIceRestart() {
        console.error("setRemoteDescriptionForIceRestart needs to be overridden");
    }

    onIceStateChange() {
        console.error("onIceStateChange needs to be overridden");
    }

    onPeerConnectionStateChange() {
        console.error("onPeerConnectionStateChange needs to be overridden");
    }

    _createPeerConnection() {
        console.error("_createPeerConnection needs to be overridden");
    }

    connect() {
        console.error("connect needs to be overridden");
    }

    _ontrack() {
        console.error("_ontrack needs to be overridden");
    }

    _buildMediaConstraints() {
        console.error("_buildMediaConstraints needs to be overridden");
    }
}
