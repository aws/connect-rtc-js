/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import './test-setup';
import RtcSession from '../../src/js/rtc_session';
import { RTCSessionState, GrabLocalMediaState, CreateOfferState, SetLocalSessionDescriptionState, ConnectSignalingAndIceCollectionState, InviteAnswerState, AcceptState, TalkingState, CleanUpState, DisconnectedState, FailedState } from '../../src/js/rtc_session';
import { RTC_ERRORS } from '../../src/js/rtc_const';
import { BusyException, CallNotFoundException } from '../../src/js/exceptions';
import chai from 'chai';
import sinon from 'sinon';
import StandardStrategy from "../../src/js/strategies/StandardStrategy";

describe('RTC session', () => {
    describe('session object', () => {
        describe('StandardStrategy', () => {
            var session = new RtcSession('wss://amazon-connect-rtc-server.amazonaws.com/', [], 'contactToken', console, null, null, null, new StandardStrategy());

            it('uses StandardStrategy', () => {
                chai.assert(console.log.calledWith('StandardStrategy initialized'));
            });

            it('builds audio constraints by default', () => {
                var constraints = session._buildMediaConstraints();
                chai.expect(!!constraints.audio).to.be.true;
            });

            it('generates contact ID when it\'s not provided through constructor', () => {
                chai.expect(session.callId).to.match(/^[-A-Fa-f0-9]{36}$/);
            });
        });
    });

    describe('RTCSessionState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {RTCSessionState}
         */
        var state;

        beforeEach(() => {
            session = {};
            state = new RTCSessionState(session);
        });

        it('executs transit only if it\'s current state', () => {
            session._state = state;
            session.transit = sinon.spy();
            var nextState = {};
            state.transit(nextState);
            chai.assert(session.transit.calledOnce);
            chai.assert(session.transit.calledWith(nextState));
        });

        it('skips transit if it\'s not current state', () => {
            session._state = null;
            session.transit = sinon.spy();
            var nextState = {};
            state.transit(nextState);
            chai.assert(!session.transit.calledOnce);
        });
    });

    describe('GrabLocalMediaState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {GrabLocalMediaState}
         */
        var state;

        beforeEach(() => {
            session = {};
            state = new GrabLocalMediaState(session);
        });

        it('skips gUM call if user media stream is already provided', () => {
            session._state = state;
            session._isUserProvidedStream = true;
            session.transit = sinon.spy();
            session._gUM = sinon.spy();
            state.onEnter();
            chai.assert(session.transit.calledOnce);
            chai.assert(session._gUM.notCalled);
            chai.assert(session.transit.args[0][0] instanceof CreateOfferState);
        });

        it('notifies gum error and go to failed state if gUM times out', (done) => {
            session._logger = console;
            session._gumTimeoutMillis = 0;
            session._sessionReport = {};
            session._state = state;
            session._buildMediaConstraints = () => { };
            session._onGumError = sinon.spy();
            session.transit = (nextState) => {
                chai.assert(session._onGumError.calledOnce);
                chai.assert(session._onGumError.calledWith(session));
                chai.assert(nextState instanceof FailedState);
                done();
            };
            state._gUM = sinon.stub();
            state._gUM.returns(new Promise(() => { }));
            state.onEnter();
        });

        it('notifies gum error and go to failed state if gUM fast fails', (done) => {
            session._logger = console;
            session._gumTimeoutMillis = 2000;
            session._sessionReport = {};
            session._state = state;
            session._buildMediaConstraints = () => { };
            session._onGumError = sinon.spy();
            session.transit = (nextState) => {
                chai.assert(session._onGumError.calledOnce);
                chai.assert(session._onGumError.calledWith(session));
                chai.assert(nextState instanceof FailedState);
                chai.assert.equal(RTC_ERRORS.GUM_OTHER_FAILURE, nextState._failureReason);
                done();
            };
            state._gUM = sinon.stub();
            state._gUM.returns(Promise.reject('testFailure'));
            state.onEnter();
        });

        it('notifies gum success and go to create offer state if gUM succeeds within time limit', (done) => {
            session._logger = console;
            session._gumTimeoutMillis = 2000;
            session._sessionReport = {};
            session._state = state;
            session._buildMediaConstraints = () => { };
            session._onGumSuccess = sinon.spy();
            session.transit = (nextState) => {
                chai.assert(session._onGumSuccess.calledOnce);
                chai.assert(session._onGumSuccess.calledWith(session));
                chai.assert(nextState instanceof CreateOfferState);
                done();
            };
            state._gUM = sinon.stub();
            state._gUM.returns(Promise.resolve({}));
            state.onEnter();
        });
    });

    describe('CreateOfferState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {CreateOfferState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _strategy: new StandardStrategy(),
                _onLocalStreamAdded: sinon.spy(),
                _pc: {
                    addStream: sinon.spy(),
                    createOffer: sinon.stub()
                },
                _sessionReport: {}
            };
            state = new CreateOfferState(session);
            session._state = state;
        });

        it('transits to set local description state when offer created', (done) => {
            session._pc.createOffer.returns(Promise.resolve('desc'));
            session.transit = (nextState) => {
                chai.assert(nextState instanceof SetLocalSessionDescriptionState);
                chai.assert.equal('desc', session._localSessionDescription);
                done();
            };
            state.onEnter();
            chai.assert(session._onLocalStreamAdded.calledOnce);
            chai.assert(session._pc.addStream.calledOnce);
        });

        it('transits to failed state when offer creation failed', (done) => {
            session._pc.createOffer.returns(Promise.reject('testFailure'));
            session.transit = (nextState) => {
                chai.expect(nextState).to.be.instanceof(FailedState);
                chai.expect(session._localSessionDescription).to.be.undefined;
                done();
            };
            state.onEnter();
            chai.expect(session._onLocalStreamAdded.calledOnce).to.be.true;
            chai.expect(session._pc.addStream.calledOnce).to.be.true;
        });
    });

    describe('SetLocalSessionDescriptionState', () => {
        var sdp = "v=0\r\n" +
            "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
            "s=-\r\n" +
            "t=0 0\r\n" +
            "a=group:BUNDLE audio\r\n" +
            "a=msid-semantic: WMS idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n" +
            "c=IN IP4 0.0.0.0\r\n" +
            "a=rtcp:9 IN IP4 0.0.0.0\r\n" +
            "a=ice-ufrag:E4/X\r\n" +
            "a=ice-pwd:34ijxBABGSaclsOpfc9E042R\r\n" +
            "a=fingerprint:sha-256 26:40:A1:3C:7E:67:75:2F:1B:21:B9:54:68:07:E8:CE:E5:9C:28:2A:E8:D4:36:26:04:C5:5B:0C:04:43:37:CF\r\n" +
            "a=setup:actpass\r\n" +
            "a=mid:audio\r\n" +
            "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
            "a=sendrecv\r\n" +
            "a=rtcp-mux\r\n" +
            "a=rtpmap:111 opus/48000/2\r\n" +
            "a=rtcp-fb:111 transport-cc\r\n" +
            "a=fmtp:111 minptime=10;useinbandfec=1\r\n" +
            "a=rtpmap:103 ISAC/16000\r\n" +
            "a=rtpmap:104 ISAC/32000\r\n" +
            "a=rtpmap:9 G722/8000\r\n" +
            "a=rtpmap:0 PCMU/8000\r\n" +
            "a=rtpmap:8 PCMA/8000\r\n" +
            "a=rtpmap:106 CN/32000\r\n" +
            "a=rtpmap:105 CN/16000\r\n" +
            "a=rtpmap:13 CN/8000\r\n" +
            "a=rtpmap:110 telephone-event/48000\r\n" +
            "a=rtpmap:112 telephone-event/32000\r\n" +
            "a=rtpmap:113 telephone-event/16000\r\n" +
            "a=rtpmap:126 telephone-event/8000\r\n" +
            "a=ssrc:2534193841 cname:NsEUa3X+NJbQmyyN\r\n" +
            "a=ssrc:2534193841 msid:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt d26be488-17a9-4f63-85b4-bdcf9754bb9b\r\n" +
            "a=ssrc:2534193841 mslabel:idv6kIIdFJ9x3alklN0n3uNGmI8xgFecIJkt\r\n" +
            "a=ssrc:2534193841 label:d26be488-17a9-4f63-85b4-bdcf9754bb9b";

        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {SetLocalSessionDescriptionState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _onSessionInitialized: sinon.spy(),
                _pc: {
                    setLocalDescription: sinon.stub()
                },
                _sessionReport: {},
                _localSessionDescription: {
                    sdp: sdp
                }
            };
            state = new SetLocalSessionDescriptionState(session);
            session._state = state;
        });

        it('transits to signaling state when local description is set', (done) => {
            session._pc.setLocalDescription.returns(Promise.resolve());
            session.transit = (nextState) => {
                chai.expect(session._onSessionInitialized.calledOnce).to.be.true;
                chai.expect(nextState).to.be.instanceof(ConnectSignalingAndIceCollectionState);
                done();
            };
            state.onEnter();
        });

        it('transits to failed state when set local description failed', (done) => {
            session._pc.setLocalDescription.returns(Promise.reject('testFailure'));
            session.transit = (nextState) => {
                chai.expect(session._onSessionInitialized.calledOnce).to.be.false;
                chai.expect(nextState).to.be.instanceof(FailedState);
                done();
            };
            state.onEnter();
        });
    });

    describe('ConnectSignalingAndIceCollectionState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {ConnectSignalingAndIceCollectionState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _createSignalingChannel: sinon.stub(),
                _onIceCollectionComplete: sinon.spy(),
                _onSignalingConnected: sinon.spy(),
                _pc: {
                },
                _sessionReport: {}
            };
            state = new ConnectSignalingAndIceCollectionState(session, 2);//2 m lines
            state._createLocalCandidate = (initDict) => initDict;
            session._state = state;
        });

        it('transits to failed state when signaling connection fails', () => {
            session.transit = sinon.spy();

            state.onSignalingFailed();

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
        });

        it('transits to failed state when ICE collection times out', (done) => {
            var sig = { connect: sinon.spy() };
            session._createSignalingChannel.returns(sig);
            session._iceTimeoutMillis = 1;
            session.transit = (nextState) => {
                chai.expect(sig.connect.calledOnce).to.be.true;
                chai.expect(session._onIceCollectionComplete.calledOnce).to.be.true;
                chai.expect(session._onIceCollectionComplete.args[0][1]).to.be.true;
                chai.expect(session._onIceCollectionComplete.args[0][2]).to.eq(0);
                chai.expect(nextState).to.be.instanceof(FailedState);
                done();
            };
            state.onEnter();
        });

        it('transits to failed state when ICE collection completes without candidate', () => {
            session.transit = sinon.spy();

            state.onIceCandidate({});

            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.true;
            chai.expect(session._onIceCollectionComplete.args[0][1]).to.be.false;
            chai.expect(session._onIceCollectionComplete.args[0][2]).to.eq(0);
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
        });

        it('keeps waiting for ICE collection when signaling gets connected', () => {
            session.transit = sinon.spy();

            state.onSignalingConnected();

            chai.expect(session._onSignalingConnected.calledOnce).to.be.true;
            chai.expect(session.transit.called).to.be.false;
        });

        it('keeps waiting for signaling when ICE collection completes', () => {
            session.transit = sinon.spy();

            state.onIceCandidate({
                candidate: {
                    candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                    sdpMLineIndex: 0,
                    sdpMid: 'audio'
                }
            });
            state.onIceCandidate({});

            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.true;
            chai.expect(session._onIceCollectionComplete.args[0][1]).to.be.false;
            chai.expect(session._onIceCollectionComplete.args[0][2]).to.eq(1);
            chai.expect(session.transit.called).to.be.false;
        });

        it('stops ICE collection earlier when RTP candidates of all m lines are collected for one candidate foudation', () => {
            session.transit = sinon.spy();

            state.onIceCandidate({
                candidate: {
                    candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                    sdpMLineIndex: 0,
                    sdpMid: 'audio'
                }
            });

            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.false;

            state.onIceCandidate({
                candidate: {
                    candidate: 'candidate:3517520453 2 udp 41885694 172.22.116.70 56719 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                    sdpMLineIndex: 0,
                    sdpMid: 'audio'
                }
            });

            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.false;

            state.onIceCandidate({
                candidate: {
                    candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59377 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                    sdpMLineIndex: 1,
                    sdpMid: 'video'
                }
            });

            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.true;
            chai.expect(session._onIceCollectionComplete.args[0][1]).to.be.false;
            chai.expect(session._onIceCollectionComplete.args[0][2]).to.eq(3);
            chai.expect(session.transit.called).to.be.false;
        });

        it('transits to InviteAnswerState when ICE collections completes and signaling get connected', () => {
            session.transit = sinon.spy();

            state.onIceCandidate({
                candidate: {
                    candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                    sdpMLineIndex: 0,
                    sdpMid: 'audio'
                }
            });
            state.onIceCandidate({});
            state.onSignalingConnected();

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session._onSignalingConnected.calledOnce).to.be.true;
            chai.expect(session._onIceCollectionComplete.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(InviteAnswerState);
        });
    });

    describe('InviteAnswerState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {InviteAnswerState}
         */
        var state;

        var candidates;

        beforeEach(() => {
            candidates = [
                'cand1'
            ];
            session = {
                _logger: console,
                _localSessionDescription: {
                    sdp: 'sdp'
                },
                _onSignalingStarted: sinon.spy(),
                _signalingChannel: {
                    invite: sinon.spy()
                },
                _sessionReport: {}
            };
            state = new InviteAnswerState(session, candidates);
            session._state = state;
        });

        it('notifies signaling started and invites on enter', () => {
            state.onEnter();

            chai.expect(session._onSignalingStarted.calledOnce, 'should have sent session event').to.be.true;
            chai.expect(session._signalingChannel.invite.calledOnce).to.be.true;
            chai.expect(session._signalingChannel.invite.args[0][0]).to.be.eq('sdp');
            chai.expect(session._signalingChannel.invite.args[0][1]).to.be.eql(candidates);
        });

        it('transits to AcceptState when signaling answer is received', () => {
            session.transit = sinon.spy();
            var remoteCandidates = ['remoteCand1'];

            state.onSignalingAnswered('remoteSdp', remoteCandidates);

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(AcceptState);
            chai.expect(session.transit.args[0][0]._sdp).to.be.eq('remoteSdp');
            chai.expect(session.transit.args[0][0]._candidates).to.be.eql(remoteCandidates);
        });

        it('transits to FailedState when handshaking fails', () => {
            session.transit = sinon.spy();

            state.onSignalingFailed('unknown');

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
            chai.expect(session.transit.args[0][0]._failureReason).to.be.eql(RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE);
        });

        it('transits to FailedState with USER_BUSY error code when handshaking fails with BusyException', () => {
            session.transit = sinon.spy();

            state.onSignalingFailed(new BusyException('Agent already connected'));

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
            chai.expect(session.transit.args[0][0]._failureReason).to.be.eql(RTC_ERRORS.USER_BUSY);
        });

        it('transits to FailedState with CALL_NOT_FOUND error code when handshaking fails with CallNotFoundException', () => {
            session.transit = sinon.spy();

            state.onSignalingFailed(new CallNotFoundException('No such call'));

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
            chai.expect(session.transit.args[0][0]._failureReason).to.be.eql(RTC_ERRORS.CALL_NOT_FOUND);
        });
    });

    describe('AcceptState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {AcceptState}
         */
        var state;

        var candidates;

        beforeEach(() => {
            candidates = [
                'cand1'
            ];
            session = {
                _strategy: new StandardStrategy(),
                _logger: console,
                _stopSession: sinon.spy(),
                _sessionReport: {},
                _pc: {
                    setRemoteDescription: sinon.stub(),
                    addIceCandidate: sinon.stub()
                }
            };
            state = new AcceptState(session, 'remoteSdp', candidates);
            session._state = state;

            state._createSessionDescription = (initDict) => initDict;
            state._createRemoteCandidate = (initDict) => initDict;
        });

        it('transits to FailedState if invalid remote SDP is received', () => {
            state = new AcceptState(session, null, ['cand1']);
            session._state = state;
            session.transit = sinon.spy();

            state.onEnter();

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
        });

        it('transits to FailedState if no valid candidate is received', () => {
            state = new AcceptState(session, 'remoteSdp', []);
            session._state = state;
            session.transit = sinon.spy();

            state.onEnter();

            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(FailedState);
        });

        it('transits to FailedState if setRemoteDescription fails', (done) => {
            session.transit = (nextState) => {
                chai.expect(session._stopSession.calledOnce).to.be.true;
                chai.expect(nextState).to.be.instanceof(FailedState);
                done();
            };
            session._pc.setRemoteDescription.returns(Promise.reject('Oops'));

            state.onEnter();
        });

        it('transits to FailedState if addIceCandidate fails', (done) => {
            session.transit = (nextState) => {
                chai.expect(session._stopSession.calledOnce).to.be.true;
                chai.expect(nextState).to.be.instanceof(FailedState);
                done();
            };
            session._pc.setRemoteDescription.returns(Promise.resolve('Good'));
            session._pc.addIceCandidate.returns(Promise.reject('Oops'));

            state.onEnter();
        });

        it('waits for handshake to complete after remote info is consumed', () => {
            session.transit = sinon.spy();
            session._pc.setRemoteDescription.returns(Promise.resolve('Good'));
            session._pc.addIceCandidate.returns(Promise.resolve('Good'));

            state.onEnter();

            chai.expect(session.transit.called).to.be.false;
        });

        it('waits for setting remote info after handshake completes', (done) => {
            session.transit = sinon.spy();
            session._pc.setRemoteDescription.returns(Promise.resolve('Good'));
            session._pc.addIceCandidate.returns(Promise.resolve('Good'));

            state.onSignalingHandshaked();

            chai.expect(session.transit.called).to.be.false;

            session.transit = (nextState) => {
                chai.expect(nextState).to.be.instanceof(TalkingState);
                done();
            };

            state.onEnter();
        });
    });

    describe('TalkingState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {TalkingState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                transit: sinon.spy(),
                _onSessionConnected: sinon.spy(),
                _detachMedia: sinon.spy(),
                _onSessionCompleted: sinon.spy(),
                _sessionReport: {},
                _signalingChannel: {
                    hangup: sinon.spy()
                }
            };
            state = new TalkingState(session);
            session._state = state;
        });

        it('reports session connected on enter', () => {
            state.onEnter();

            chai.expect(session._onSessionConnected.calledOnce).to.be.true;
        });

        it('acks remote hangup and transits to DisconnectedState', () => {
            state.onRemoteHungup();

            chai.expect(session._signalingChannel.hangup.calledOnce).to.be.true;
            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(DisconnectedState);
        });

        it('hangs up signaling when hangup is requested by client', () => {
            state.hangup();

            chai.expect(session._signalingChannel.hangup.calledOnce).to.be.true;
            chai.expect(session.transit.calledOnce).to.be.true;
            chai.expect(session.transit.args[0][0]).to.be.instanceof(DisconnectedState);
        });

        it('detachs media and reports session end on exit', () => {
            state.onExit();

            chai.expect(session._detachMedia.calledOnce).to.be.true;
            chai.expect(session._onSessionCompleted.calledOnce).to.be.true;
        });
    });

    describe('CleanUpState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {CleanUpState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _stopSession: sinon.spy(),
                _sessionReport: {},
                _onSessionDestroyed: sinon.spy()
            };
            state = new CleanUpState(session);
            session._state = state;
        });

        it('stops session on enter', () => {
            state.onEnter();

            chai.expect(session._stopSession.calledOnce).to.be.true;
            chai.expect(session._onSessionDestroyed.calledOnce).to.be.true;
        });
    });

    describe('DisconnectedState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {DisconnectedState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _stopSession: sinon.spy(),
                _sessionReport: {},
                _onSessionDestroyed: sinon.spy()
            };
            state = new DisconnectedState(session);
            session._state = state;
        });

        it('stops session on enter', () => {
            state.onEnter();

            chai.expect(session._stopSession.calledOnce).to.be.true;
            chai.expect(session._onSessionDestroyed.calledOnce).to.be.true;
        });
    });

    describe('FailedState', () => {
        /**
         * @type {RtcSession}
         */
        var session;

        /**
         * @type {FailedState}
         */
        var state;

        beforeEach(() => {
            session = {
                _logger: console,
                _stopSession: sinon.spy(),
                _onSessionFailed: sinon.spy(),
                _sessionReport: {},
                _onSessionDestroyed: sinon.spy()
            };
            state = new FailedState(session);
            session._state = state;
        });

        it('stops session on enter', () => {
            state.onEnter();

            chai.expect(session._stopSession.calledOnce).to.be.true;
            chai.expect(session._onSessionFailed.calledOnce).to.be.true;
            chai.expect(session._onSessionDestroyed.calledOnce).to.be.true;
        });
    });
});