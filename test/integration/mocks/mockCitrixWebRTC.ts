type wrtcTypes = typeof import('@roamhq/wrtc');

export class MockCitrixWebRTC {
    public static hookup(wrtc: wrtcTypes) {
        console.log("Wiring up mock Citrix VDI API");
        (global.window as any).CitrixWebRTC = new MockCitrixWebRTC(wrtc);
    }

    private _eventCallback?: (event: any) => void = undefined;
    private _wrtc: wrtcTypes;

    public CitrixPeerConnection: RTCPeerConnection;
    public getUserMedia: NavigatorGetUserMedia;

    constructor(wrtc: wrtcTypes) {
        this.CitrixPeerConnection = wrtc.RTCPeerConnection as any;
        this.getUserMedia = wrtc.getUserMedia;
        this._wrtc = wrtc;
    }

    setVMEventCallback(callback: (event: any) => void): void {
        this._eventCallback = callback;
    }

    isFeatureOn(_feature: string): boolean {
        return true;
    }

    initUCSDK(agent: string): void {
        this._eventCallback!({
            event: 'vdiClientConnected',
            version: {
                receiver: '0.0.0.0'
            }
        });
    }

    public createMediaStream(tracks: any): any {
        return new this._wrtc.MediaStream(tracks);
    }
}