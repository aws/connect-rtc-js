import CCPInitiationStrategyInterface from "./CCPInitiationStrategyInterface";

/**
 * Marks a VDI strategy as "initialization failed". Streams assigns this in place of null after a
 * VDI strategy constructor throws, so the softphone does not quietly fall back to StandardStrategy
 * (which would place calls without the expected VDI audio redirection and degrade call quality).
 *
 * Call-time methods (_gUM, _createRtcPeerConnection, _createPeerConnection) throw. The session
 * moves to FailedState and the call is missed, which is the desired behavior when VDI audio
 * redirection is required but not available.
 */
export default class FailedVDIStrategy extends CCPInitiationStrategyInterface {
    private readonly _vdiPlatform: string;
    private readonly _originalError: string;

    constructor(vdiPlatform: string, errorMessage: string) {
        super();
        this._vdiPlatform = vdiPlatform;
        this._originalError = errorMessage;
    }

    getStrategyName(): string {
        return "FailedVDIStrategy";
    }

    _isEarlyMediaConnectionSupported(): boolean {
        return false;
    }

    _gUM(): Promise<never> {
        return Promise.reject(this._buildError());
    }

    _createRtcPeerConnection(): never {
        throw this._buildError();
    }

    _createPeerConnection(): never {
        throw this._buildError();
    }

    // eslint-disable-next-line no-unused-vars
    onConnectionNeedingCleanup(_handler: (strategy: FailedVDIStrategy) => void): void {
        // no-op: PCM registers this during init, we silently accept
    }

    // eslint-disable-next-line no-unused-vars
    close(_pc: any): void {
        // no-op: cleanup path, should be defensive (no PC was ever created)
    }

    private _buildError(): Error {
        return new Error(`VDI strategy failed to initialize for ${this._vdiPlatform}: ${this._originalError}`);
    }
}
