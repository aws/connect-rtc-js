type wrtcTypes = typeof import('@roamhq/wrtc');

export class MockOmnissaVDI {
    public static hookup(wrtc: wrtcTypes) {
        console.log("Wiring up mock Omnissa API");
        (global.window as any).HorizonWebRtcRedirectionAPI = new MockOmnissaVDI(wrtc);
    }

    private _wrtc: wrtcTypes;

    public getUserMedia: NavigatorGetUserMedia;

    constructor(wrtc: wrtcTypes) {
        this._wrtc = wrtc;

        this.getUserMedia = wrtc.getUserMedia;
    }

    initSDK(_appLogger: any, _appName: string, eventHandler: (event: any) => void): boolean {
        // Simulate VDI client connecting immediately so whenConnected() resolves.
        if (typeof eventHandler === 'function') {
            eventHandler({ event: 'vdiClientConnected' });
        }
        return true;
    }

    newPeerConnection(configuration: RTCConfiguration, options: any): RTCPeerConnection {
        return new this._wrtc.RTCPeerConnection(configuration);
    }

    newMediaStream(tracks: any): any {
        return new this._wrtc.MediaStream(tracks);
    }
}