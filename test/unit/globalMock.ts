import * as sinon from 'sinon';
import { StubbedType, stubInterface } from "@salesforce/ts-sinon";

export interface MockUserAgentData {
    getHighEntropyValues(keys: string[]): any;
}

export interface MockNavigator {
    readonly userAgent: String;
    readonly userAgentData: StubbedType<MockUserAgentData>;
    readonly mediaDevices: StubbedType<MediaDevices>;
    readonly permissions: StubbedType<Permissions>;
}

export interface MockCitrixWebRTC {
    readonly setVMEventCallback: sinon.SinonStub;
    readonly isFeatureOn: sinon.SinonStub;
    readonly initUCSDK: sinon.SinonStub;
    readonly initLog: sinon.SinonStub;
    readonly enumerateDevices: sinon.SinonStub;
    readonly CitrixPeerConnection: sinon.SinonStub;
}

export interface MockCitrixBootstrap {
    getRedirectionState(): Promise<number>;
    initBootstrap(agent: string): void;
    initLog(): void;
    deinitBootstrap(agent: string): void;
}

export interface MockDCVWebRTCPeerConnectionProxy {
    readonly setInitCallback: sinon.SinonStub;
}

export interface MockHorizonWebRTCExtension {
    readonly getHorizonClientID: sinon.SinonStub;
    readonly getHorizonWSSPort: sinon.SinonStub;
}

export interface MockHorizonWebRtcRedirectionAPI {
    readonly initSDK: sinon.SinonStub;
    readonly newPeerConnection: sinon.SinonStub;
    readonly getUserMedia: sinon.SinonStub;
    readonly enumerateDevices: sinon.SinonStub;
}

export interface MockDocument {
    getElementById(id: string): any;
}

export interface MockWindow {
    readonly navigator: MockNavigator;
    readonly CitrixWebRTC: MockCitrixWebRTC;
    readonly getCitrixWebrtcRedir: sinon.SinonStub;
    readonly CitrixBootstrap: StubbedType<MockCitrixBootstrap>;
    readonly HorizonWebRTCExtension: MockHorizonWebRTCExtension;
    readonly HorizonWebRtcRedirectionAPI: MockHorizonWebRtcRedirectionAPI;
    getHorizonClientID?(): string;
    getHorizonWSSPort?(): number;
    addEventListener(): void;
    readonly document: MockDocument;
    readonly parent: { parent: { document: MockDocument } };
}

export interface MockLog {
    sendInternalLogToServer: void;
}

export interface MockConnectLogger {
    log(): MockLog;
    info(): MockLog;
    warn(): MockLog;
    error(): MockLog;
}

export interface MockConnect {
    getLog(): MockConnectLogger;
}

export interface MockGlobal {
    readonly window: MockWindow;
    readonly connect: MockConnect;
    readonly DCVWebRTCPeerConnectionProxyV2: MockDCVWebRTCPeerConnectionProxy;
    readonly timeoutSpy: sinon.SinonSpy;
    readonly clearTimeoutSpy: sinon.SinonSpy;
    readonly document: MockDocument;
};

export class GlobalMocker implements MockGlobal {
    readonly savedGlobal: any;

    public readonly window: MockWindow;
    public readonly connect: MockConnect;
    public readonly document: MockDocument;

    public readonly timeoutSpy: sinon.SinonSpy;
    public readonly clearTimeoutSpy: sinon.SinonSpy;

    public readonly DCVWebRTCPeerConnectionProxyV2: MockDCVWebRTCPeerConnectionProxy;

    public readonly clock: sinon.SinonFakeTimers;

    constructor() {
        this.savedGlobal = global;

        this.DCVWebRTCPeerConnectionProxyV2 = {
            setInitCallback: sinon.stub()
        };

        const mockDocument: MockDocument = {
            getElementById: sinon.stub().returns(null)
        };

        const MockConnectLogger: MockConnectLogger = {
            log: sinon.stub().returns({
                sendInternalLogToServer: sinon.stub()
            }),
            info: sinon.stub().returns({
                sendInternalLogToServer: sinon.stub()
            }),
            warn: sinon.stub().returns({
                sendInternalLogToServer: sinon.stub()
            }),
            error: sinon.stub().returns({
                sendInternalLogToServer: sinon.stub()
            })
        };

        this.window = {
            navigator: {
                userAgent: 'unit-test',
                userAgentData: stubInterface<MockUserAgentData>(sinon),
                mediaDevices: stubInterface<MediaDevices>(sinon),
                permissions: stubInterface<Permissions>(sinon)
            },
            document: mockDocument,
            parent: {
                parent: {
                    document: mockDocument
                }
            },
            CitrixWebRTC: {
                setVMEventCallback: sinon.stub(),
                isFeatureOn: sinon.stub(),
                initUCSDK: sinon.stub(),
                initLog: sinon.stub(),
                enumerateDevices: sinon.stub(),
                CitrixPeerConnection: sinon.stub()
            },
            getCitrixWebrtcRedir: sinon.stub(),
            CitrixBootstrap: stubInterface<MockCitrixBootstrap>(sinon),
            HorizonWebRTCExtension: {
                getHorizonClientID: sinon.stub(),
                getHorizonWSSPort: sinon.stub()
            },
            HorizonWebRtcRedirectionAPI: {
                initSDK: sinon.stub(),
                newPeerConnection: sinon.stub(),
                getUserMedia: sinon.stub(),
                enumerateDevices: sinon.stub()
            },
            addEventListener: sinon.stub()
        };

        this.document = mockDocument;

        this.connect = {
            getLog: sinon.stub().returns(MockConnectLogger)
        };

        this.clock = sinon.useFakeTimers();

        this.timeoutSpy = sinon.spy(this.clock, 'setTimeout');
        this.clearTimeoutSpy = sinon.spy(this.clock, 'clearTimeout');

        (global as any) = this;
        (globalThis.window as any) = this.window;
        (globalThis as any).document = this.document;
        
        // Use Object.defineProperty to override read-only navigator in Node.js 20+
        try {
            Object.defineProperty(globalThis, 'navigator', {
                value: this.window.navigator,
                writable: true,
                configurable: true
            });
        } catch (e) {
            // Fallback if defineProperty fails
            (globalThis.navigator as any) = this.window.navigator;
        }
        
        // Mock WebRTC APIs
        (globalThis as any).RTCIceCandidate = class RTCIceCandidate {
            candidate: string;
            sdpMLineIndex: number;
            sdpMid: string;
            
            constructor(initDict: any) {
                this.candidate = initDict.candidate;
                this.sdpMLineIndex = initDict.sdpMLineIndex;
                this.sdpMid = initDict.sdpMid;
            }
        };
        
        (globalThis as any).RTCSessionDescription = class RTCSessionDescription {
            type: string;
            sdp: string;
            
            constructor(initDict: any) {
                this.type = initDict.type;
                this.sdp = initDict.sdp;
            }
        };
    }

    static save(): GlobalMocker {
        return new GlobalMocker();
    }

    restore(): void {
        global = this.savedGlobal;
        (globalThis.window as any) = global.window;
        (globalThis.navigator as any) = global.window.navigator;
        delete (globalThis as any).document;
        this.timeoutSpy.restore();
        this.clearTimeoutSpy.restore();
        this.clock.restore();
    }
}
