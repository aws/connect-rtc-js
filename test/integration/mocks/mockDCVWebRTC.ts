type wrtcTypes = typeof import('@roamhq/wrtc');

export class MockDCVWebRTC {
    public static hookup(wrtc: wrtcTypes) {
        console.log("Wiring up mock DCV VDI API");
        (global as any).DCVWebRTCPeerConnectionProxyV2 = {
            setInitCallback: (handler: any) => {
                handler({
                    success: true,
                    proxy: new MockDCVWebRTC(wrtc)
                })
            }
        };
    }

    private _wrtc: wrtcTypes;

    public MediaStream: any;
    public getUserMedia: NavigatorGetUserMedia;
    public clientInfo = {
        platform: 'windows' as const,
        version: '2.0.0',
        userAgent: 'test-agent',
        browserDetails: { browser: 'chrome', version: '80' }
    };

    constructor(wrtc: wrtcTypes) {
        this._wrtc = wrtc;
        this.getUserMedia = wrtc.getUserMedia;
    }

    getVersion(): string {
        return '2.0.0';
    }

    overrideWebRTC() {
    }

    resetHeartbeat(_config: any) {
    }

    addStatusChangeEventListener(_callback: any) {
    }

    makeMediaDevicesProxy(): any {
        return {
            enumerateDevices: () => navigator.mediaDevices.enumerateDevices(),
            addEventListener: (_event: string, _listener: any) => {},
            removeEventListener: (_event: string, _listener: any) => {},
        };
    }

    createPeerConnection(configuration: RTCConfiguration, options: any): RTCPeerConnection {
        return new this._wrtc.RTCPeerConnection(configuration);
    }
}