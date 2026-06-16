import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { StubbedType, stubInterface } from "@salesforce/ts-sinon";
chai.use(sinonChai);

import {
    ConnectedSubstate,
    IceRestartSubstate,
    SetLocalSessionDescriptionSubstate,
    ConnectSignalingAndIceCollectionSubstate,
    InviteAnswerSubstate,
    AcceptSubstate
} from '../../src/rtc_session_talking_substates';
import { ICE_CONNECTION_STATE } from '../../src/rtc_const';
import {
    BusyExceptionName,
    CallNotFoundExceptionName
} from '../../src/exceptions';
import CCPInitiationStrategyInterface from '../../src/strategies/CCPInitiationStrategyInterface';
import { GlobalMocker } from './globalMock';

const expect = chai.expect;

declare var global: GlobalMocker;

interface Logger {
    log(log: String): void;
    info(log: String): void;
    error(log: String): void;
    warn(log: String): void;
}

describe('Substates', () => {
    let loggerMock: StubbedType<Logger>;
    let rtcSessionMock: any;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        loggerMock = stubInterface<Logger>(sinon);

        rtcSessionMock = {
            _logger: loggerMock,
            _iceTimeoutMillis: 5000,
            _onIceCollectionComplete: sinon.spy(),
            _pcm: {
                setLocalDescription: sinon.stub(),
                _peerConnectionToken: 'token',
                _iceRestart: false,
                _requestIceAccess: sinon.stub(),
                _signalingChannel: {
                    invite: sinon.spy(),
                    transit: sinon.spy(),
                },
            },
            _localSessionDescription: {
                sdp: 'fake-sdp'
            },
            _pc: {
                iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED,
                setLocalDescription: sinon.stub(),
                setConfiguration: sinon.spy(),
                createOffer: sinon.stub(),
            },
            _enableOpusDtx: true,
            _strategy: stubInterface<CCPInitiationStrategyInterface>(sinon),
            _state: {
                setSubState: sinon.spy(),
            },
            _sessionReport: {
                iceCollectionFailure: false,
            },
            _createSignalingChannel: sinon.stub().returns({
                connect: sinon.spy(),
            }),
            _bindSignalingChannel: sinon.stub(),
            _onSignalingConnected: sinon.spy(),
        };
    });

    describe('ConnectedSubstate', () => {
        let connectedSubstate: ConnectedSubstate;

        beforeEach(() => {
            connectedSubstate = new ConnectedSubstate(rtcSessionMock);

            rtcSessionMock._strategy.onIceStateChange.returns(ICE_CONNECTION_STATE.DISCONNECTED);
        });

        it('should trigger ICE restart if ICE state is DISCONNECTED for more than 3 seconds', () => {
            connectedSubstate.onIceStateChange({ currentTarget: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } });
            sinon.assert.calledWith(loggerMock.info, 'Detected Lost ICE connection, pending IceRestart');
            global.clock.tick(3000);

            sinon.assert.calledWith(loggerMock.info, 'Trying to restart ICE connection');
            sinon.assert.calledOnce(rtcSessionMock._state.setSubState);
            sinon.assert.calledWith(rtcSessionMock._state.setSubState, sinon.match.instanceOf(IceRestartSubstate));
        });

        it('should handle unsupported ICE restart', () => {
            rtcSessionMock._pcm._peerConnectionToken = null;
            connectedSubstate.onIceStateChange({ currentTarget: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } });

            expect(loggerMock.info.calledWith('Detected Lost ICE connection, IceRestart not supported')).to.be.true;
            expect(rtcSessionMock._state.setSubState.called).to.be.false;
        });

        it('should clean up on exit', () => {
            connectedSubstate.IceRestartTimeoutId = setTimeout(() => { }, 3000);
            connectedSubstate.onExit();

            sinon.assert.calledWith(loggerMock.info, 'Exiting, cleaning up IceRestart timeout');
            sinon.assert.calledOnce(global.clearTimeoutSpy);
        });

        it('should not clear timeout if there is no pending timeout on exit', () => {
            (connectedSubstate as any).IceRestartTimeoutId = null;
            connectedSubstate.onExit();

            expect(loggerMock.info.calledWith('Exiting, cleaning up IceRestart timeout')).to.be.false;
            expect(global.clearTimeoutSpy.called).to.be.false;
        });
    });

    describe('IceRestartSubstate', () => {
        let iceRestartSubstate: IceRestartSubstate;

        beforeEach(() => {
            iceRestartSubstate = new IceRestartSubstate(rtcSessionMock);
        });

        it('should perform ICE restart and transition to SetLocalSessionDescriptionSubstate on success', (done) => {
            rtcSessionMock._pcm._requestIceAccess.returns(Promise.resolve([{ urls: '' }]));
            rtcSessionMock._pc.createOffer.returns(Promise.resolve({ type: 'offer', sdp: 'fake-sdp' }));

            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.info.calledWith("ICE restart offer created and set as local description")).to.be.true;
                expect(nextState).to.be.instanceOf(SetLocalSessionDescriptionSubstate);
                done();
            };

            iceRestartSubstate.onEnter();
        });

        it('should log an error and transition to ConnectedSubstate on ICE restart failure', (done) => {
            rtcSessionMock._pcm._requestIceAccess.returns(Promise.reject(new Error('Network error')));

            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.error.calledWith("ICE restart failed")).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            iceRestartSubstate.onEnter();
        });

        it('should log an error and transition to ConnectedSubstate on createOffer failure', (done) => {
            rtcSessionMock._pcm._requestIceAccess.returns(Promise.resolve([{ urls: '' }]));
            rtcSessionMock._pc.createOffer.returns(Promise.reject(new Error('Create offer failed')));

            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.error.calledWith("ICE restart failed")).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            iceRestartSubstate.onEnter();
        });
    });

    describe('SetLocalSessionDescriptionSubstate', () => {
        let setLocalSessionDescriptionSubstate: SetLocalSessionDescriptionSubstate;
        let sdp;

        beforeEach(() => {
            sdp = "v=0\r\n" +
                "o=- 6968650397182970779 2 IN IP4 127.0.0.1\r\n" +
                "s=-\r\n" +
                "t=0 0\r\n" +
                "a=group:BUNDLE audio\r\n" +
                "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104\r\n" +
                "a=rtcp-mux\r\n" +
                "a=rtpmap:111 opus/48000/2\r\n";

            rtcSessionMock._localSessionDescription.sdp = sdp;

            setLocalSessionDescriptionSubstate = new SetLocalSessionDescriptionSubstate(rtcSessionMock);
        });

        it('should set local description and transition to ConnectSignalingAndIceCollectionSubstate on success', (done) => {
            rtcSessionMock._pc.setLocalDescription.returns(Promise.resolve());

            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.info.calledWith("Local description set successfully")).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectSignalingAndIceCollectionSubstate);
                done();
            };

            setLocalSessionDescriptionSubstate.onEnter();
        });

        it('should log an error and transition to ConnectedSubstate on failure', (done) => {
            rtcSessionMock._pc.setLocalDescription.returns(Promise.reject(new Error('SetLocalDescription failed')));

            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.error.calledWith("Failed to set local description")).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            setLocalSessionDescriptionSubstate.onEnter();
        });
    });

    describe('ConnectSignalingAndIceCollectionSubstate', () => {
        let connectSignalingAndIceCollectionSubstate: ConnectSignalingAndIceCollectionSubstate;

        beforeEach(() => {

            connectSignalingAndIceCollectionSubstate = new ConnectSignalingAndIceCollectionSubstate(rtcSessionMock, 2);
            connectSignalingAndIceCollectionSubstate._createLocalCandidate = (initDict: any) => initDict;
            connectSignalingAndIceCollectionSubstate._isCurrentState = () => { return true; }
        });

        it('transits to ConnectedSubstate when ICE collection times out', (done) => {
            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.warn.calledWith('ICE collection timed out')).to.be.true;
                expect(rtcSessionMock._onIceCollectionComplete.calledOnce).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            connectSignalingAndIceCollectionSubstate.onEnter();
            global.clock.tick(6000);
        });

        it('transits to ConnectedSubstate when no ICE candidates are collected', () => {
            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(loggerMock.error.calledWith('No ICE candidate')).to.be.true;
                expect(rtcSessionMock._onIceCollectionComplete.calledOnce).to.be.true;
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
            };

            connectSignalingAndIceCollectionSubstate._reportIceCompleted(false);
        });

        it('keeps waiting for ICE collection when signaling gets connected', () => {
            rtcSessionMock._state.setSubState = sinon.spy();

            connectSignalingAndIceCollectionSubstate._iceCompletedForIceRestart = false;
            connectSignalingAndIceCollectionSubstate._checkAndTransit();

            expect(rtcSessionMock._state.setSubState.called).to.be.false;
        });

        it('transits to InviteAnswerSubstate when ICE collection completes', () => {
            rtcSessionMock._state.setSubState = (nextState: any) => {
                expect(rtcSessionMock._onIceCollectionComplete.calledOnce).to.be.true;
                expect(nextState).to.be.instanceOf(InviteAnswerSubstate);
            };

            const fakeCandidate = {
                candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                sdpMLineIndex: 0,
                sdpMid: 'audio',
            };

            connectSignalingAndIceCollectionSubstate.onIceCandidate({ candidate: fakeCandidate });
            connectSignalingAndIceCollectionSubstate.onIceCandidate({});
            connectSignalingAndIceCollectionSubstate._iceCompletedForIceRestart = true;
            connectSignalingAndIceCollectionSubstate._checkAndTransit();
        });
    });

    describe('InviteAnswerSubstate', () => {
        let inviteAnswerSubstate: InviteAnswerSubstate;

        beforeEach(() => {
            const iceCandidatesMock = [{ candidate: 'candidate:1 1 UDP 12345 192.168.0.1 3478 typ host' }];

            inviteAnswerSubstate = new InviteAnswerSubstate(rtcSessionMock, iceCandidatesMock);
        });

        it('should send an invite on enter', () => {
            inviteAnswerSubstate.onEnter();

            expect(rtcSessionMock._createSignalingChannel().connect.calledOnce).to.be.true;
            expect(rtcSessionMock._pcm._signalingChannel.transit.calledOnce).to.be.true;
            expect(rtcSessionMock._pcm._signalingChannel.invite.calledOnce).to.be.true;
        });

        it('should retry the invite process if it fails', () => {
            inviteAnswerSubstate.retryInvite();

            expect(loggerMock.info.calledWith('Retrying invite in 1 seconds. Attempt 1')).to.be.true;

            global.clock.tick(1000);

            expect(rtcSessionMock._pcm._signalingChannel.invite.calledOnce).to.be.true;
            expect(inviteAnswerSubstate.retryCount).to.equal(1);
        });

        it('should transition to ConnectedSubstate after max retries', () => {
            inviteAnswerSubstate.retryCount = inviteAnswerSubstate.maxRetries;

            inviteAnswerSubstate.retryInvite();

            expect(loggerMock.error.calledWith('Max invite attempts reached. Returning to ConnectedSubstate.')).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should handle BusyExceptionName and transition to ConnectedSubstate', () => {
            inviteAnswerSubstate.onSignalingFailed({ name: BusyExceptionName });

            expect(loggerMock.error.calledWith('User Busy, possibly multiple CCP windows open')).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should handle CallNotFoundExceptionName and transition to ConnectedSubstate', () => {
            inviteAnswerSubstate.onSignalingFailed({ name: CallNotFoundExceptionName });

            expect(loggerMock.error.calledWith('Call not found. One of the participant probably hung up.')).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should handle generic signaling failure and retry invite', () => {
            inviteAnswerSubstate.onSignalingFailed({ name: 'WebsocketConnectionDown' });

            expect(loggerMock.error.calledWith('Failed handshaking with signaling server')).to.be.true;
            expect(inviteAnswerSubstate.retryCount).to.equal(1);

            global.clock.tick(1000);

            expect(rtcSessionMock._pcm._signalingChannel.invite.calledOnce).to.be.true;
        });

        it('should transition to AcceptSubstate on signaling answered', () => {
            const sdp = 'fake-remote-sdp';
            const candidates = ['remoteCand1'];

            inviteAnswerSubstate.onSignalingAnswered(sdp, candidates);

            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(AcceptSubstate))).to.be.true;
        });

        it('should clear timeout on exit', () => {
            inviteAnswerSubstate.signalingRetryTimeoutId = setTimeout(() => { }, 1000);

            inviteAnswerSubstate.onExit();

            expect(loggerMock.info.calledWith('Exiting, cleaning up invite retry timeout')).to.be.true;
            expect(global.clearTimeoutSpy.calledOnce).to.be.true;
        });

        it('should not clear timeout if there is no pending timeout on exit', () => {
            (inviteAnswerSubstate as any).SignalingRetryTimeoutId = null;

            inviteAnswerSubstate.onExit();

            expect(loggerMock.info.calledWith('Exiting, cleaning up invite retry timeout')).to.be.false;
            expect(global.clearTimeoutSpy.called).to.be.false;
        });
    });


    describe('AcceptSubstate', () => {
        let acceptSubstate: AcceptSubstate;

        beforeEach(() => {
            acceptSubstate = new AcceptSubstate(rtcSessionMock, 'fake-sdp', [{ candidate: 'fake-candidate' }]);
        });

        it('should log an error and transition to ConnectedSubstate if the remote SDP is invalid', () => {
            acceptSubstate = new AcceptSubstate(rtcSessionMock, null, [{ candidate: 'fake-candidate' }]);
            acceptSubstate.onEnter();

            expect(loggerMock.error.calledWith('Invalid remote SDP')).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should log an error and transition to ConnectedSubstate if no ICE candidates are provided', () => {
            acceptSubstate = new AcceptSubstate(rtcSessionMock, 'fake-sdp', []);
            acceptSubstate.onEnter();

            expect(loggerMock.error.calledWith('No remote ICE candidate')).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should call setRemoteDescriptionForIceRestart with the correct parameters on valid SDP and ICE candidates', () => {
            acceptSubstate.onEnter();

            expect(rtcSessionMock._strategy.setRemoteDescriptionForIceRestart.calledOnce).to.be.true;
            expect(rtcSessionMock._strategy.setRemoteDescriptionForIceRestart.calledWith(acceptSubstate, rtcSessionMock)).to.be.true;
        });

        it('should transition to ConnectedSubstate if ICE restart fails', () => {
            acceptSubstate.onIceRestartFailure();

            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });

        it('should log and not transition if handshaking is pending', () => {
            acceptSubstate._signalingHandshakedForIceRestart = false;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = true;
            acceptSubstate._checkAndTransit();

            expect(loggerMock.log.calledWith('Pending handshaking')).to.be.true;
            expect(rtcSessionMock._state.setSubState.called).to.be.false;
        });

        it('should log and not transition if setting remote description is pending', () => {
            acceptSubstate._signalingHandshakedForIceRestart = true;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = false;
            acceptSubstate._checkAndTransit();

            expect(loggerMock.log.calledWith('Pending setting remote description')).to.be.true;
            expect(rtcSessionMock._state.setSubState.called).to.be.false;
        });

        it('should transition to ConnectedSubstate if both handshaking and remote description are set', () => {
            acceptSubstate._signalingHandshakedForIceRestart = true;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = true;
            acceptSubstate._checkAndTransit();

            expect(rtcSessionMock._state.setSubState.calledOnce).to.be.true;
            expect(rtcSessionMock._state.setSubState.calledWith(sinon.match.instanceOf(ConnectedSubstate))).to.be.true;
        });
    });
});
