/**
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import RtcPeerConnectionFactory from '../../src/js/rtc_peer_connection_factory';
import chai from 'chai';
import sinon from 'sinon';

describe('RTC Peer Connection Factory', () => {
    sinon.stub(RtcPeerConnectionFactory.prototype, '_initializeWebSocketEventListeners').returns({});
    sinon.stub(RtcPeerConnectionFactory.prototype, '_networkConnectivityChecker').returns({});
    sinon.stub(RtcPeerConnectionFactory.prototype, '_isBrowserSupported').returns(true);
    sinon.stub(RtcPeerConnectionFactory.prototype, '_createRtcPeerConnection').returns({});
    var requestPeerConnectionStub = sinon.stub(RtcPeerConnectionFactory.prototype, '_requestPeerConnection').returns({});

    var pcFactory = new RtcPeerConnectionFactory(console, null, null, sinon.stub(), sinon.stub());

    it('check _peerConnectionRequestInFlight initializes to true', () => {
        chai.assert.isTrue(pcFactory._peerConnectionRequestInFlight);
        chai.assert(requestPeerConnectionStub.calledOnce);
    });

    it('check request peer connection is not called when _peerConnectionRequestInFlight is true', () => {
        pcFactory._peerConnectionRequestInFlight = true;
        pcFactory._refreshRtcPeerConnection();
        chai.assert(requestPeerConnectionStub.calledOnce);
    });

    it('check request peer connection is called when _peerConnectionRequestInFlight is false', () => {
        pcFactory._peerConnectionRequestInFlight = false;
        pcFactory._refreshRtcPeerConnection();
        chai.assert(requestPeerConnectionStub.calledTwice);
    });
});
