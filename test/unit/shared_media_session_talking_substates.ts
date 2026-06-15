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
} from '../../src/shared_media_session_talking_substates';
import { PendingInviteState } from '../../src/shared_media_signaling';
import { ICE_CONNECTION_STATE } from '../../src/rtc_const';
import { BusyExceptionName, CallNotFoundExceptionName, BadRequestExceptionName } from '../../src/exceptions';
import CCPInitiationStrategyInterface from '../../src/strategies/CCPInitiationStrategyInterface';

const expect = chai.expect;

interface Logger {
    log(log: String): void;
    info(log: String): void;
    error(log: String): void;
    warn(log: String): void;
}

describe('SharedMediaSessionTalkingSubstates', () => {
    let mockSharedMediaSession: any;
    let mockSignalingChannel: any;
    let mockLogger: StubbedType<Logger>;

    beforeEach(() => {
        mockLogger = stubInterface<Logger>(sinon);
        // Mock logger methods to return objects with sendInternalLogToServer
        mockLogger.error.returns({ sendInternalLogToServer: sinon.stub() } as any);
        mockLogger.info.returns({ sendInternalLogToServer: sinon.stub() } as any);
        mockLogger.warn.returns({ sendInternalLogToServer: sinon.stub() } as any);
        mockLogger.log.returns({ sendInternalLogToServer: sinon.stub() } as any);

        mockSignalingChannel = {
            transit: sinon.spy(),
            inviteForIceRestart: sinon.spy(),
            _state: null
        };

        mockSharedMediaSession = {
            _logger: mockLogger,
            _createSignalingChannel: sinon.stub().returns({ connect: sinon.stub() }),
            _signalingChannel: mockSignalingChannel,
            _localSessionDescription: {
                sdp: 'test-sdp'
            },
            _state: {
                setSubState: sinon.spy(),
                _subState: null
            },
            _iceTimeoutMillis: 5000,
            _requestIceAccess: sinon.stub(),
            _pc: {
                iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED,
                setConfiguration: sinon.spy(),
                createOffer: sinon.stub(),
                setLocalDescription: sinon.stub()
            },
            _enableOpusDtx: true,
            _strategy: stubInterface<CCPInitiationStrategyInterface>(sinon),
            _sessionReport: {
                iceRestartAttempts: 0,
                iceRestartSuccesses: 0,
                iceRestartInviteRetries: 0,
                iceRestartTimeMillis: null,
                iceRestartFailed: null,
                iceCollectionFailure: false
            },
            _onIceCollectionComplete: sinon.spy(),
            _onIceRestartComplete: sinon.spy(),
            peerConnectionToken: 'test-token',
            _iceRestart: false
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('ConnectedSubstate', () => {
        let connectedSubstate: ConnectedSubstate;

        beforeEach(() => {
            connectedSubstate = new ConnectedSubstate(mockSharedMediaSession);
            mockSharedMediaSession._strategy.onIceStateChange.returns(ICE_CONNECTION_STATE.DISCONNECTED);
        });

        it('should trigger ICE restart if ICE state is DISCONNECTED for more than 3 seconds', () => {
            connectedSubstate.onIceStateChange({ currentTarget: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } });
            
            expect(mockLogger.info).to.have.been.calledWith('Detected Lost ICE connection, pending IceRestart');
            
            sinon.clock.tick(3000);
            
            expect(mockLogger.info).to.have.been.calledWith('Trying to restart ICE connection');
            expect(mockSharedMediaSession._sessionReport.iceRestartAttempts).to.equal(1);
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(IceRestartSubstate));
        });

        it('should cancel ICE restart if network recovers', () => {
            connectedSubstate.onIceStateChange({ currentTarget: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } });
            mockSharedMediaSession._pc.iceConnectionState = ICE_CONNECTION_STATE.CONNECTED;
            
            sinon.clock.tick(3000);
            
            expect(mockLogger.info).to.have.been.calledWith('The network recovered, IceRestart cancelled');
            expect(mockSharedMediaSession._state.setSubState).to.not.have.been.called;
        });

        it('should handle unsupported ICE restart when no peerConnectionToken', () => {
            mockSharedMediaSession.peerConnectionToken = null;
            
            connectedSubstate.onIceStateChange({ currentTarget: { iceConnectionState: ICE_CONNECTION_STATE.DISCONNECTED } });
            
            expect(mockLogger.info).to.have.been.calledWith('Detected Lost ICE connection, IceRestart not supported');
            expect(mockSharedMediaSession._state.setSubState).to.not.have.been.called;
        });

        it('should handle signaling failed with stale peer connection', () => {
            const error = { name: BadRequestExceptionName, message: 'Stale Peer Connection detected' };
            
            connectedSubstate.onSignalingFailed(error);
            
            expect(mockLogger.error).to.have.been.calledWith('Server detect peer connection being unhealthy, performing IceRestart', error);
            expect(mockSharedMediaSession._sessionReport.iceRestartAttempts).to.equal(1);
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(IceRestartSubstate));
        });

        it('should handle signaling failed without peerConnectionToken', () => {
            mockSharedMediaSession.peerConnectionToken = null;
            const error = { name: BadRequestExceptionName, message: 'Stale Peer Connection detected' };
            
            connectedSubstate.onSignalingFailed(error);
            
            expect(mockLogger.info).to.have.been.calledWith('Server detect peer connection being unhealthy, IceRestart not supported');
            expect(mockSharedMediaSession._state.setSubState).to.not.have.been.called;
        });

        it('should clean up timeout on exit', () => {
            connectedSubstate.IceRestartTimeoutId = sinon.clock.setTimeout(() => {}, 1000) as any;
            
            connectedSubstate.onExit();
            
            expect(mockLogger.info).to.have.been.calledWith('Exiting, cleaning up IceRestart timeout');
        });

        it('should not clear timeout if no timeout exists on exit', () => {
            connectedSubstate.onExit();
            
            expect(mockLogger.info).to.not.have.been.calledWith('Exiting, cleaning up IceRestart timeout');
        });
    });

    describe('IceRestartSubstate', () => {
        let iceRestartSubstate: IceRestartSubstate;

        beforeEach(() => {
            iceRestartSubstate = new IceRestartSubstate(mockSharedMediaSession);
        });

        it('should perform ICE restart and transition on success', (done) => {
            mockSharedMediaSession._requestIceAccess.resolves([{ urls: 'stun:example.com' }]);
            mockSharedMediaSession._pc.createOffer.resolves({ type: 'offer', sdp: 'restart-sdp' });

            mockSharedMediaSession._state.setSubState = (nextState: any) => {
                expect(mockLogger.info).to.have.been.calledWith("ICE restart offer created and set as local description");
                expect(nextState).to.be.instanceOf(SetLocalSessionDescriptionSubstate);
                expect(mockSharedMediaSession._iceRestart).to.be.true;
                done();
            };

            iceRestartSubstate.onEnter();
        });

        it('should handle ICE restart failure', (done) => {
            mockSharedMediaSession._requestIceAccess.rejects(new Error('Network error'));

            mockSharedMediaSession._state.setSubState = (nextState: any) => {
                // Check log was called (message now includes timing)
                expect(mockLogger.error).to.have.been.called;
                expect(mockSharedMediaSession._onIceRestartComplete).to.have.been.calledWith(false, sinon.match.number);
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            iceRestartSubstate.onEnter();
        });

        it('should handle createOffer failure', (done) => {
            mockSharedMediaSession._requestIceAccess.resolves([{ urls: 'stun:example.com' }]);
            mockSharedMediaSession._pc.createOffer.rejects(new Error('Create offer failed'));

            mockSharedMediaSession._state.setSubState = (nextState: any) => {
                // Check log was called (message now includes timing)
                expect(mockLogger.error).to.have.been.called;
                expect(mockSharedMediaSession._onIceRestartComplete).to.have.been.calledWith(false, sinon.match.number);
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            iceRestartSubstate.onEnter();
        });
    });

    describe('SetLocalSessionDescriptionSubstate', () => {
        let setLocalSubstate: SetLocalSessionDescriptionSubstate;

        beforeEach(() => {
            setLocalSubstate = new SetLocalSessionDescriptionSubstate(mockSharedMediaSession);
        });

        it('should set local description and transition on success', (done) => {
            mockSharedMediaSession._pc.setLocalDescription.resolves();

            mockSharedMediaSession._state.setSubState = (nextState: any) => {
                expect(mockLogger.info).to.have.been.calledWith("Local description set successfully");
                expect(nextState).to.be.instanceOf(ConnectSignalingAndIceCollectionSubstate);
                done();
            };

            setLocalSubstate.onEnter();
        });

        it('should handle setLocalDescription failure', (done) => {
            mockSharedMediaSession._pc.setLocalDescription.rejects(new Error('Set local failed'));

            mockSharedMediaSession._state.setSubState = (nextState: any) => {
                expect(mockLogger.error).to.have.been.calledWith("Failed to set local description");
                expect(nextState).to.be.instanceOf(ConnectedSubstate);
                done();
            };

            setLocalSubstate.onEnter();
        });

        it('should transform SDP with OPUS DTX settings', () => {
            mockSharedMediaSession._pc.setLocalDescription.resolves();
            mockSharedMediaSession._localSessionDescription.sdp = 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n';

            setLocalSubstate.onEnter();

            const transformedSdp = mockSharedMediaSession._localSessionDescription.sdp;
            expect(transformedSdp).to.include('a=ptime:20');
            expect(transformedSdp).to.include('a=maxptime:20');
        });
    });

    describe('ConnectSignalingAndIceCollectionSubstate', () => {
        let connectSignalingSubstate: ConnectSignalingAndIceCollectionSubstate;

        beforeEach(() => {
            connectSignalingSubstate = new ConnectSignalingAndIceCollectionSubstate(mockSharedMediaSession, 2);
            connectSignalingSubstate._isCurrentState = () => true;
        });

        it('should timeout ICE collection after specified time', () => {
            connectSignalingSubstate.onEnter();
            
            sinon.clock.tick(5000);
            
            expect(mockLogger.warn).to.have.been.calledWith('ICE collection timed out');
            expect(mockSharedMediaSession._onIceCollectionComplete).to.have.been.called;
        });

        it('should not timeout if ICE collection completes', () => {
            connectSignalingSubstate._iceCompletedForIceRestart = true;
            connectSignalingSubstate.onEnter();
            
            sinon.clock.tick(5000);
            
            expect(mockLogger.warn).to.not.have.been.calledWith('ICE collection timed out');
        });

        it('should handle ICE candidate collection', () => {
            const candidate = {
                candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                sdpMLineIndex: 0,
                sdpMid: 'audio'
            };

            connectSignalingSubstate.onIceCandidate({ candidate });
            
            expect(mockLogger.log).to.have.been.calledWith('onicecandidate ' + JSON.stringify(candidate));
            expect(connectSignalingSubstate._iceCandidates.length).to.equal(1);
        });

        it('should complete ICE collection when candidate is null', () => {
            const reportSpy = sinon.spy(connectSignalingSubstate, '_reportIceCompleted');
            
            connectSignalingSubstate.onIceCandidate({ candidate: null });
            
            expect(reportSpy).to.have.been.calledWith(false);
        });

        it('should transition to InviteAnswerSubstate when ICE collection succeeds', () => {
            connectSignalingSubstate._iceCandidates = [{ candidate: 'test' }];
            
            connectSignalingSubstate._reportIceCompleted(false);
            
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(InviteAnswerSubstate));
        });

        it('should transition to ConnectedSubstate when no ICE candidates collected', () => {
            connectSignalingSubstate._iceCandidates = [];
            
            connectSignalingSubstate._reportIceCompleted(false);
            
            expect(mockLogger.error).to.have.been.calledWith('No ICE candidate');
            expect(mockSharedMediaSession._sessionReport.iceCollectionFailure).to.be.true;
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(ConnectedSubstate));
        });

        it('should check for sufficient candidates', () => {
            const candidate = {
                candidate: 'candidate:3517520453 1 udp 41885695 172.22.116.70 59345 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag dRi5 network-id 3 network-cost 50',
                sdpMLineIndex: 0,
                sdpMid: 'audio'
            };
            const reportSpy = sinon.spy(connectSignalingSubstate, '_reportIceCompleted');
            
            connectSignalingSubstate._checkCandidatesSufficient(candidate);
            connectSignalingSubstate._checkCandidatesSufficient({...candidate, sdpMLineIndex: 1});
            
            expect(reportSpy).to.have.been.called;
        });
    });

    describe('AcceptSubstate', () => {
        let acceptSubstate: AcceptSubstate;

        beforeEach(() => {
            acceptSubstate = new AcceptSubstate(mockSharedMediaSession, 'fake-sdp', [{ candidate: 'fake-candidate' }]);
        });

        it('should transition to ConnectedSubstate if remote SDP is invalid', () => {
            const invalidSubstate = new AcceptSubstate(mockSharedMediaSession, null, [{ candidate: 'fake-candidate' }]);
            
            invalidSubstate.onEnter();
            
            expect(mockLogger.error).to.have.been.calledWith('Invalid remote SDP');
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(ConnectedSubstate));
        });

        it('should transition to ConnectedSubstate if no ICE candidates', () => {
            const invalidSubstate = new AcceptSubstate(mockSharedMediaSession, 'fake-sdp', []);
            
            invalidSubstate.onEnter();
            
            expect(mockLogger.error).to.have.been.calledWith('No remote ICE candidate');
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(ConnectedSubstate));
        });

        it('should call strategy setRemoteDescriptionForIceRestart', () => {
            acceptSubstate.onEnter();
            
            expect(mockSharedMediaSession._strategy.setRemoteDescriptionForIceRestart).to.have.been.calledWith(acceptSubstate, mockSharedMediaSession);
        });

        it('should transition to ConnectedSubstate on ICE restart failure', () => {
            acceptSubstate.onIceRestartFailure();
            
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(ConnectedSubstate));
        });

        it('should transition when both handshaking and remote description complete', () => {
            (acceptSubstate as any)._signalingHandshakedForIceRestart = true;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = true;
            
            acceptSubstate._checkAndTransit();
            
            expect(mockSharedMediaSession._state.setSubState).to.have.been.calledWith(sinon.match.instanceOf(ConnectedSubstate));
        });

        it('should wait for handshaking completion', () => {
            (acceptSubstate as any)._signalingHandshakedForIceRestart = false;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = true;
            
            acceptSubstate._checkAndTransit();
            
            expect(mockLogger.log).to.have.been.calledWith('Pending handshaking');
            expect(mockSharedMediaSession._state.setSubState).to.not.have.been.called;
        });

        it('should wait for remote description setting', () => {
            (acceptSubstate as any)._signalingHandshakedForIceRestart = true;
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = false;
            
            acceptSubstate._checkAndTransit();
            
            expect(mockLogger.log).to.have.been.calledWith('Pending setting remote description');
            expect(mockSharedMediaSession._state.setSubState).to.not.have.been.called;
        });

        it('should handle onSignalingHandshaked', () => {
            (acceptSubstate as any)._remoteDescriptionSetForIceRestart = true;
            
            acceptSubstate.onSignalingHandshaked();
            
            expect((acceptSubstate as any)._signalingHandshakedForIceRestart).to.be.true;
            expect(mockSharedMediaSession._state.setSubState).to.have.been.called;
        });
    });

    describe('InviteAnswerSubstate', () => {
        describe('attemptInvite', () => {
            it('should call inviteForIceRestart on signaling channel', () => {
                const iceCandidates = [
                    { candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }
                ];
                
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                
                substate.attemptInvite();

                expect(mockSharedMediaSession._createSignalingChannel).to.have.been.called;
                expect(mockSignalingChannel.transit).to.have.been.calledWith(sinon.match.instanceOf(PendingInviteState));
                expect(mockSignalingChannel.inviteForIceRestart).to.have.been.calledWith(
                    'test-sdp',
                    iceCandidates
                );
            });

            it('should use inviteForIceRestart instead of invite', () => {
                const iceCandidates = [
                    { candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }
                ];
                
                mockSignalingChannel.invite = sinon.spy();
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                
                substate.attemptInvite();

                expect(mockSignalingChannel.inviteForIceRestart).to.have.been.called;
                expect(mockSignalingChannel.invite).to.not.have.been.called;
            });

            it('should pass correct parameters to inviteForIceRestart', () => {
                const iceCandidates = [
                    { candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' },
                    { candidate: 'candidate2', sdpMLineIndex: 1, sdpMid: 'video' }
                ];
                
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                
                substate.attemptInvite();

                expect(mockSignalingChannel.inviteForIceRestart).to.have.been.calledWith(
                    mockSharedMediaSession._localSessionDescription.sdp,
                    iceCandidates
                );
            });
        });

        describe('onEnter', () => {
            it('should call attemptInvite', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                const attemptSpy = sinon.spy(substate, 'attemptInvite');
                
                substate.onEnter();
                
                expect(attemptSpy).to.have.been.called;
            });
        });

        describe('retryInvite', () => {
            it('should transition to ConnectedSubstate after max retries', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                substate.retryCount = 3;
                substate.maxRetries = 3;
                
                substate.retryInvite();
                
                expect(mockSharedMediaSession._state.setSubState).to.have.been.called;
            });

            it('should increment retry count and schedule retry', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                substate.retryCount = 0;
                
                substate.retryInvite();
                
                expect(substate.retryCount).to.equal(1);
                expect(mockLogger.info).to.have.been.called;
            });
        });

        describe('onExit', () => {
            it('should clear retry timeout', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                substate.signalingRetryTimeoutId = setTimeout(() => {}, 1000) as any;
                
                substate.onExit();
                
                expect(mockLogger.info).to.have.been.called;
            });

            it('should do nothing when no retry timeout exists', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                
                expect(() => substate.onExit()).to.not.throw();
            });
        });

        describe('onSignalingFailed', () => {
            it('should retry on generic signaling failure', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                const retrySpy = sinon.spy(substate, 'retryInvite');
                const error = { name: 'GenericError' };
                
                substate.onSignalingFailed(error as any);
                
                expect(retrySpy).to.have.been.called;
                expect(mockLogger.error).to.have.been.called;
            });
        });

        describe('onSignalingAnswered', () => {
            it('should transition to AcceptSubstate with sdp and candidates', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                const sdp = 'test-answer-sdp';
                const candidates = [{ candidate: 'answer-candidate' }];
                
                substate.onSignalingAnswered(sdp, candidates);
                
                expect(mockSharedMediaSession._state.setSubState).to.have.been.called;
            });
        });

        describe('Constructor', () => {
            it('should initialize with correct properties', () => {
                const iceCandidates = [{ candidate: 'candidate1', sdpMLineIndex: 0, sdpMid: 'audio' }];
                const substate = new InviteAnswerSubstate(mockSharedMediaSession, iceCandidates);
                
                expect(substate.retryCount).to.equal(0);
                expect(substate.maxRetries).to.equal(3);
                expect(substate.retryInterval).to.equal(1000);
            });
        });
    });
});
