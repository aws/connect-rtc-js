/** Indicates whether ICE credentials were fetched from the API or provided by the contact. */
export type CredentialSource = 'api-fetched' | 'contact-provided';

/** Result of the full ICE credential resolution flow for a call. */
export interface IceCredentialsForCallResult {
    iceServers: RTCIceServer[] | null;
    credentialSource: CredentialSource | null;
    isDifferentRegion: boolean;
}

/**
 * Credential Resolver — detects when contact-provided ICE credentials come
 * from a different AWS region than the agent's CCP and falls back to API-fetched same-region
 * credentials to prevent TURN connection failures.
 *
 * Caches the agent's region ICE URL on first fetch and compares subsequent contact credentials
 * against it. Also records credential source for telemetry.
 */
export class CredentialResolver {
    private _cachedIceURL: string | null = null;
    private _hasTriedInitialFetch = false;
    private readonly _requestIceAccess: () => Promise<any[]>;
    private readonly _logger: any;

    constructor(requestIceAccess: () => Promise<any[]>, logger: any) {
        this._requestIceAccess = requestIceAccess;
        this._logger = logger;
    }

    recordCredentialSource(sessionReport: any, source: CredentialSource, isDifferentRegion: boolean = false): void {
        if (sessionReport) {
            sessionReport.iceCredentialSource = source;
            sessionReport.isContactCredentialsDifferentRegion = isDifferentRegion;
            this._logger.info(`Recorded ICE credential source: ${source}, different region: ${isDifferentRegion}`).sendInternalLogToServer();
        }
    }

    /**
     * Single entry point for ICE credential resolution:
     * Cross-region check if contact credentials provided, API fetch as fallback,
     * and credential source tracking.
     */
    async getIceCredentialsForCall(contactIceServers?: RTCIceServer[] | null): Promise<IceCredentialsForCallResult> {
        let iceServers: RTCIceServer[] | null = null;
        let credentialSource: CredentialSource | null = null;
        let isDifferentRegion = false;

        if (contactIceServers) {
            isDifferentRegion = await this._isContactCrossRegion(contactIceServers);
            if (!isDifferentRegion) {
                iceServers = contactIceServers;
                credentialSource = 'contact-provided';
            }
        }

        if (!iceServers) {
            this._logger.info("Fetching ICE credentials from API").sendInternalLogToServer();
            iceServers = await this._fetchIceCredentials();
            if (iceServers) {
                credentialSource = 'api-fetched';
            }
        }

        if (!iceServers) {
            this._logger.warn("No ICE credentials available, cannot create peer connection").sendInternalLogToServer();
        }

        return { iceServers, credentialSource, isDifferentRegion };
    }

    /**
     * Get the cached ICE URL for the agent's region. On first call, performs a one-time
     * fetch with a 1-second timeout. Returns null if the fetch fails or was already attempted.
     */
    private async _getCachedIceURL(): Promise<string | null> {
        if (this._cachedIceURL) {
            this._logger.info('Using cached ICE URL for region comparison').sendInternalLogToServer();
            return this._cachedIceURL;
        }

        if (this._hasTriedInitialFetch) {
            this._logger.info('Already attempted initial ICE URL fetch, returning null').sendInternalLogToServer();
            return null;
        }

        this._logger.info('Attempting one-time ICE URL fetch').sendInternalLogToServer();
        this._hasTriedInitialFetch = true;

        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('ICE URL fetch timeout')), 1000);
            });
            const iceServers = await Promise.race([
                this._requestIceAccess(),
                timeoutPromise
            ]);

            this._cachedIceURL = iceServers && iceServers.length > 0 && iceServers[0].urls && iceServers[0].urls.length > 0
                ? iceServers[0].urls[0] : null;
            this._logger.info(`Successfully fetched and cached ICE URL: ${this._cachedIceURL}`).sendInternalLogToServer();
            return this._cachedIceURL;

        } catch (error: any) {
            this._logger.warn(`Failed to fetch ICE URL for caching`).withObject(error).sendInternalLogToServer();
            return null;
        }
    }

    /**
     * Pure predicate: returns true if the contact-provided ICE credentials come from
     * a different AWS region than the cached agent-region URL.
     */
    private async _isContactCrossRegion(contactIceServers: RTCIceServer[]): Promise<boolean> {
        const cachedURL = await this._getCachedIceURL();
        if (!cachedURL) return false;

        const contactURL = contactIceServers?.[0]?.urls?.[0] ?? null;
        if (!contactURL) return false;

        return cachedURL !== contactURL;
    }

    private async _fetchIceCredentials(): Promise<RTCIceServer[] | null> {
        try {
            const iceServers = await this._requestIceAccess();
            if (iceServers) {
                this._updateCachedURL(iceServers);
            }
            return iceServers || null;
        } catch (error: any) {
            this._logger.warn("ICE access request failed").withObject(error).sendInternalLogToServer();
            return null;
        }
    }

    private _updateCachedURL(iceServers: RTCIceServer[]): void {
        this._cachedIceURL = iceServers && iceServers.length > 0 && iceServers[0].urls && iceServers[0].urls.length > 0
            ? iceServers[0].urls[0] : null;
    }

}
