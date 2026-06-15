/**
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { StubbedType, stubInterface } from "@salesforce/ts-sinon";
chai.use(sinonChai);

declare var global: GlobalMocker;

import RtcPeerConnectionFactory from '../../src/rtc_peer_connection_factory';

import { RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS } from "../../src/rtc_const";
import StandardStrategy from "../../src/strategies/StandardStrategy";
import { GlobalMocker } from './globalMock';

describe('RTC Peer Connection Factory', () => {
    var requestAccessStub: any;
    var wssMock: any;
    var createPeerConnectionStub: sinon.SinonStub;
    var peerConnectionMock: StubbedType<RTCPeerConnection>;

    var strategy: sinon.SinonStubbedInstance<StandardStrategy>;

    beforeEach(() => {
        requestAccessStub = sinon.stub().resolves('iceServer');
        wssMock = {
            subscribeTopics: sinon.stub(),
            onMessage: sinon.stub()
        };

        peerConnectionMock = stubInterface<RTCPeerConnection>(sinon);

        strategy = sinon.createStubInstance(StandardStrategy);
        createPeerConnectionStub = strategy._createRtcPeerConnection.returns(peerConnectionMock);

        sinon.stub(RtcPeerConnectionFactory.prototype, '_initializeWebSocketEventListeners').returns();
        sinon.stub(RtcPeerConnectionFactory.prototype, '_networkConnectivityChecker').returns();
        sinon.stub(RtcPeerConnectionFactory.prototype, '_isEarlyMediaConnectionSupported').returns(true);
    });

    describe('StandardStrategy', () => {
        var pcFactory: RtcPeerConnectionFactory;

        beforeEach(async () => {
            pcFactory = new RtcPeerConnectionFactory(console, wssMock, null, requestAccessStub, sinon.stub(), strategy);

            // This forces the micro task queue to run which allows requestAccessStub to resolve before the end of this function.
            await Promise.resolve();
        });

        afterEach(() => {
            pcFactory.close();
        });

        it('check _idleRtcPeerConnectionTimerId is set and _refreshRtcPeerConnection is set to invoke in 1 minute', async () => {
            chai.assert.isNotNull(pcFactory._idleRtcPeerConnectionTimerId);
            const setTimeoutCalls = global.timeoutSpy.getCalls();
            const refreshCall = setTimeoutCalls.find(call => call.args[1] === 60000);
            chai.assert.isNotNull(refreshCall, 'setTimeout should be called with 60000ms timeout');
            chai.assert.isFunction(refreshCall!.args[0], 'First argument should be a function');
        });

        it('check _refreshPeerConnection will close idle peer connection and request a new one', async () => {
            pcFactory._refreshRtcPeerConnection();
            chai.assert(peerConnectionMock.close.calledOnce);
            chai.assert(requestAccessStub.calledTwice);

            await Promise.resolve();
            console.log('count ' + createPeerConnectionStub.callCount);
            chai.assert(createPeerConnectionStub.callCount);
            console.log('count ' + createPeerConnectionStub.callCount);

        });



        it('check clearIdleRtcPeerConnectionTimerId clears timer id', () => {
            // We need to clear the timer that's already there otherwise it'll keep running in the background.
            pcFactory.clearIdleRtcPeerConnectionTimerId();
            
            pcFactory._idleRtcPeerConnectionTimerId = setTimeout(() => { console.log('clearIdleRtcPeerConnectionTimerIdTest'); }, RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
            chai.assert.isNotNull(pcFactory._idleRtcPeerConnectionTimerId);
            pcFactory.clearIdleRtcPeerConnectionTimerId();
            chai.assert.isNull(pcFactory._idleRtcPeerConnectionTimerId);
        });

        it('check close clears _idleRtcPeerConnectionTimerId and closes idle peer connection', () => {
            // We need to clear the timer that's already there otherwise it'll keep running in the background.
            pcFactory.clearIdleRtcPeerConnectionTimerId();
            
            pcFactory._idleRtcPeerConnectionTimerId = setTimeout(() => { console.log('clearIdleRtcPeerConnectionTimerIdTest'); }, 0);
            chai.assert.isNotNull(pcFactory._idleRtcPeerConnectionTimerId);
            pcFactory.close();
            chai.assert.isNull(pcFactory._idleRtcPeerConnectionTimerId);
            chai.assert(peerConnectionMock.close.calledOnce);
            chai.assert.isNull(pcFactory._idlePc);
        });
    });
});