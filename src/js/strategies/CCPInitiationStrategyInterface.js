
export default class CCPInitiationStrategyInterface {
    constructor() {
        console.log("CCPInitiationStrategyInterface initialized");
    }

    getName(){}

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection
    _isBrowserSupported(){}

    _createRtcPeerConnection() {}

    // the following functions are rtc_session related functions
    _guM() {}

    createOfferStateOnEnter() {

    }

    acceptStateOnEnter() {}

    onIceStateChange() {}

    onPeerConnectionStateChange() {}

    _createPeerConnection() {}

    connect() {}

    _ontrack() {}

    _buildMediaConstraints() {}
}
