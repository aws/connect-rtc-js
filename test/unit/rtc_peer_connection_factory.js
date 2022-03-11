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
    var requestAccessStub = sinon.stub().resolves('iceServer');
    var createPeerConnectionStub = sinon.stub(RtcPeerConnectionFactory.prototype, '_createRtcPeerConnection').returns({});
    var pcFactory = new RtcPeerConnectionFactory(console, null, null, requestAccessStub, sinon.stub());

    it('check _peerConnectionRequestInFlight eventually resolves to false', async() => {
        await chai.assert(requestAccessStub.calledOnce);
        chai.assert(createPeerConnectionStub.calledOnce);
        chai.assert(createPeerConnectionStub.calledWith('iceServer'));
        chai.assert.isFalse(pcFactory._peerConnectionRequestInFlight);
    });

    it('check create peer connection is not called when _peerConnectionRequestInFlight is true', async() => {
        pcFactory._peerConnectionRequestInFlight = true;
        pcFactory._requestPeerConnection();
        chai.assert(requestAccessStub.calledOnce);
        chai.assert(createPeerConnectionStub.calledOnce);
    });

    it('check create peer connection is called when _peerConnectionRequestInFlight is false', async() => {
        pcFactory._peerConnectionRequestInFlight = false;
        pcFactory._requestPeerConnection();
        chai.assert.isTrue(pcFactory._peerConnectionRequestInFlight);
        await chai.assert(requestAccessStub.calledTwice);
        chai.assert(createPeerConnectionStub.calledTwice);
        chai.assert(createPeerConnectionStub.calledWith('iceServer'));
        chai.assert.isFalse(pcFactory._peerConnectionRequestInFlight);
    });

    it('check create peer connection is not called when _peerConnectionRequestInFlight is false and request ICE access promise is not fulfilled', async() => {
        pcFactory._peerConnectionRequestInFlight = false;
        requestAccessStub.rejects('error');
        pcFactory._requestPeerConnection();
        chai.assert.isTrue(pcFactory._peerConnectionRequestInFlight);
        await chai.assert(requestAccessStub.calledThrice);
        chai.assert(createPeerConnectionStub.calledTwice);
        chai.assert.isFalse(pcFactory._peerConnectionRequestInFlight);
    });
});
