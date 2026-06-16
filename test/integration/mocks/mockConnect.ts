import * as wrtc from '@roamhq/wrtc'
import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'node:events';

export interface AnswerResponse {
    readonly answer: string;
    readonly candidate: string;
}

class WebSocket {
    readonly _callback: WebSocketCallback;
    readonly _eventEmitter: EventEmitter;

    constructor(callback: WebSocketCallback, eventEmitter: EventEmitter) {
        this._callback = callback;
        this._eventEmitter = eventEmitter;
    }

    subscribeTopics() {
    }

    onMessage(topic: string, handler: () => void) {
        console.log('onMessage: ' + topic);
        this._eventEmitter.on(topic, handler);
    }

    sendMessage(payload: any) {
        // Run asyncronously.
        process.nextTick(() => {
            switch (payload.jsonRpcMsg.method) {
                case 'invite':
                    console.log('invite: ' + JSON.stringify(payload.jsonRpcMsg));
                    this._callback.onInvite(payload.connectionId, payload.jsonRpcMsg);
                    break;
                case 'accept':
                    // PPC connectContact: agent joins existing SMS with an 'accept' message.
                    // In production, the server processes this and sends back a success response.
                    // MockConnect acknowledges it so the test doesn't hang.
                    console.log('accept: ' + JSON.stringify(payload.jsonRpcMsg));
                    this._eventEmitter.emit('aws/softphone', {
                        content: JSON.stringify({
                            connectionId: payload.connectionId,
                            jsonRpcMsg: {
                                method: 'accept',
                                id: payload.jsonRpcMsg.id,
                                result: {
                                    peerConnectionId: payload.jsonRpcMsg.params?.peerConnectionId,
                                    peerConnectionToken: payload.jsonRpcMsg.params?.peerConnectionToken
                                }
                            }
                        })
                    });
                    break;
                case 'bye':
                    console.log('bye: ' + JSON.stringify(payload.jsonRpcMsg));
                    this._callback.onBye(payload.connectionId, payload.jsonRpcMsg)
                    break;
                default:
                    console.log('unknown: ' + JSON.stringify(payload.jsonRpcMsg));
                    break;
            }
        });
    }
}

interface WebSocketCallback {
    onInvite(connectionId: string, jsonRpcMsg: any): void;
    onBye(byeId: string, jsonRpcMsg: any): void;
}

export class MockConnect implements WebSocketCallback {
    private _eventEmitter = new EventEmitter();
    private _ws: WebSocket = new WebSocket(this, this._eventEmitter);

    private _connections: Map<string, wrtc.RTCPeerConnection> = new Map();

    getWebsocket() {
        return this._ws;
    }

    onInvite(connectionId: string, jsonRpcMsg: any): void {
        this.invite(connectionId, jsonRpcMsg);
    }

    async invite(connectionId: string, jsonRpcMsg: any): Promise<void> {
        const pc = new wrtc.RTCPeerConnection();
        pc.addTransceiver('audio', { direction: 'sendrecv' });

        const candidatePromise: Promise<wrtc.RTCIceCandidate> = new Promise(function (resolve) {
            pc.onicecandidate = function (event) {
                if (event.candidate && event.candidate.type == 'host' &&
                    event.candidate.address == '127.0.0.1' &&
                    event.candidate.protocol == 'udp') {

                    resolve(event.candidate);
                }
            };
        });

        const offer = jsonRpcMsg.params.sdp;
        console.log("MockConnect - Setting remote description.");
        await pc.setRemoteDescription(new wrtc.RTCSessionDescription({
            sdp: offer,
            type: 'offer'
        }));

        console.log("MockConnect - Creating answer.");
        const answer = await pc.createAnswer();

        console.log("MockConnect - Setting local description.");
        await pc.setLocalDescription(answer);

        const candidates = jsonRpcMsg.params.candidates;
        console.log("MockConnect - Adding ice candidate: " + candidates);
        candidates.forEach((candidate: any) => {
            pc.addIceCandidate(candidate);
        });

        console.log("MockConnect - Waiting for candidate.");
        const thisCandidate = await candidatePromise;
        console.log("MockConnect - Found candidate");

        console.log('MockConnect - Returning sdp and candidate.');
        const peerConnectionId = uuid();
        this._connections.set(peerConnectionId, pc);
        this._eventEmitter.emit('aws/softphone', {
            content: JSON.stringify({
                connectionId: connectionId,
                jsonRpcMsg: {
                    method: 'answer',
                    id: jsonRpcMsg.id,
                    result: {
                        sdp: answer.sdp, candidate: thisCandidate.toJSON(),
                        candidates: [
                            thisCandidate
                        ],
                        peerConnectionToken: 'fake-token',
                        peerConnectionId: peerConnectionId
                    }
                }
            })
        });
    }

    forceDisconnect() {
        this._connections.forEach((pc: wrtc.RTCPeerConnection, key: string) => {
            console.log('MockConnect - Closing peer connection: ' + key);
            pc.close();
        });
    }

    onBye(connectionId: string, jsonRpcMsg: any): void {
        const peerConnectionId = jsonRpcMsg.params.peerConnectionId;
        const pc = this._connections.get(peerConnectionId);
        if (pc) {
            console.log('MockConnect - Closing peer connection: ' + peerConnectionId);
            pc.close();
            this._connections.delete(peerConnectionId);

            this._eventEmitter.emit('aws/softphone', {
                content: JSON.stringify({
                    connectionId: connectionId,
                    jsonRpcMsg: {
                        method: 'bye',
                        id: jsonRpcMsg.id,
                    }
                })
            });
        } else {
            console.log('MockConnect - Peer connection not found: ' + peerConnectionId);
        }
    }
}