import './test-setup';
import RtcPeerConnectionManager from '../../src/js/rtc_peer_connection_manager';
import StandardStrategy from '../../src/js/strategies/StandardStrategy';
import RtcSession from "../../src/js/rtc_session";
import chai from 'chai';
import sinon, {sandbox} from 'sinon';
import * as utils from '../../src/js/utils';
const mochaJsdom = require("mocha-jsdom");

const expect = chai.expect;

describe('RtcPeerConnectionManager', () => {
    let signalingUri, iceServers, transportHandle, publishError, contactToken, logger, contactId, connectionId, wssManager, browserId;
    signalingUri = 'signalingUri';
    iceServers = [{ urls: 'stun:stun.example.com' }];
    transportHandle = sinon.stub().resolves('iceServer');
    publishError = sinon.spy();
    contactToken = 'example-contact-token';
    logger = console;
    contactId = 'example-contact-id';
    connectionId = 'example-connection-id';
    wssManager = {
        subscribeTopics: sinon.spy(),
        onMessage: sinon.spy(),
    };
    browserId = "example-browser-id";
    mochaJsdom({ url: "https://example.awsapps.com/connect/ccp-v2" });
    sinon.stub(RtcPeerConnectionManager.prototype, '_initializeWebSocketEventListeners').returns({});
    sinon.stub(RtcPeerConnectionManager.prototype, '_networkConnectivityChecker').returns({});
    sinon.stub(RtcPeerConnectionManager.prototype, '_isEarlyMediaConnectionSupported').returns(false);

    beforeEach(() => {
    });

    afterEach(() => {
        RtcPeerConnectionManager.instance = null;
    });

    describe('RtcPeerConnectionManager constructor', () => {
        beforeEach(() => {
            sandbox.stub(utils, "isFirefoxBrowser").returns(false);
        });

        afterEach(() => {
            sandbox.restore();
        });


        it('should create an instance of RtcPeerConnectionManager', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            expect(pcm).to.be.an.instanceOf(RtcPeerConnectionManager);
        });

        it('should throw an error if transportHandle is missing', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                null,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            )).to.throw('transportHandle must be a function');
        });

        it('should throw an error if logger is missing', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                null,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            )).to.throw('logger required');
        });

        it('should throw an error if strategy is not an instance of CCPInitiationStrategyInterface', () => {
            expect(() => new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                {},
                false,
                browserId
            )).to.throw(Error);
        });

        it('should generate an uuid if contactId is not provided', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                null,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            expect(pcm._callId).to.be.a('string');
        });

        it('should generate an uuid if connectionId is not provided', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                null,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            expect(pcm._connectionId).to.be.a('string');
        });

        it('should not initialize a RtcPeerConnectionManager if RtcPeerConnectionManager has been created', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            expect(pcm._connectionId).to.be.a('string');
        });
    });

    describe('createRtcSession', () => {
        it('should create a RtcSession if RtcSession not exists', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            pcm.createSession();

            expect(pcm.getSession()).to.be.an.instanceOf(RtcSession);
        });
    });

    describe('connect', () => {
        it('should get peer connection and call rtcSession connect', async () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                false,
                browserId
            );

            const pc = sinon.mock();
            const getPeerConnectionSpy = sinon.stub(pcm, 'getPeerConnection').returns(pc);
            const connectSpy = sinon.spy();
            pcm._rtcSession = {
                connect: connectSpy,
                _sessionReport: {userAgentData: null},
            }
            pcm._userAgentData = "example-ua";
            sinon.stub(pcm, '_rtcSessionConnectPromise').resolves();
            sinon.stub(utils, 'hitch').returns({});

            pcm.connect();
            await sinon.useFakeTimers().tick(10);

            expect(getPeerConnectionSpy.calledOnce).to.equal(true);
            expect(connectSpy.calledWith(pc)).to.equal(true);
        });
    });

    describe('hangup', () => {
        it('should start the inactivity timer for persistent peer connection', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                true,
                browserId
            );
            const rtcSession = pcm.createSession();
            sandbox.stub(rtcSession, 'hangup');
            const startTimerSpy = sandbox.spy(pcm, 'startInactivityTimer');

            pcm.hangup();

            expect(startTimerSpy).to.have.been.called;
        });

        it('should reset ICERestart flag and clean up pc, peerConnectionToken and peerConnectionId for non-persistent peer connection', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                true,
                browserId
            );
            const rtcSession = pcm.createSession();
            sandbox.stub(rtcSession, 'hangup');
            pcm._persistentConnection = false;

            pcm.hangup();
            expect(pcm._iceRestart).to.equal(false);
            expect(pcm._signalingChannel).to.be.null;
            expect(pcm._iceServers).to.be.null;
            expect(pcm._pc).to.be.null;
            expect(pcm._peerConnectionToken).to.be.null;
            expect(pcm._peerConnectionId).to.be.null;
        });
    });

    describe('destroy', () => {
        it('should close the peer connection if it exists', () => {
            const pcm = new RtcPeerConnectionManager(
                signalingUri,
                iceServers,
                transportHandle,
                publishError,
                null,
                contactToken,
                logger,
                contactId,
                connectionId,
                wssManager,
                new StandardStrategy(),
                true,
                browserId
            );
            const peerConnection = {
                close: sinon.spy()
            };
            pcm._pc = peerConnection;
            pcm.destroy();
            expect(peerConnection.close).to.have.been.called;
        });
    });
});