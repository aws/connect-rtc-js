import {
    NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS,
    RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS
} from './rtc_const';
import CCPInitiationStrategyInterface from './strategies/CCPInitiationStrategyInterface';

export interface StandbyPeerConnectionManagerConfig {
    logger: any;
    strategy: CCPInitiationStrategyInterface;
    clientId: string;
    createPeerConnection: () => Promise<RTCPeerConnection | null>;
    /** Static — determined once at construction time by the VDI strategy capabilities. */
    isStandbyConnectionSupported: boolean;
    /** Evaluated at each request because RTPS allowlisting and PPC toggle can change mid-session. */
    isPersistentConnectionAllowlistedAndEnabled: () => boolean;
    /** Whether the parent RtcPeerConnectionManagerV2 has been closed/destroyed. */
    isPeerConnectionManagerClosed: () => boolean;
}


/**
 * Manages pre-fetched standby RTCPeerConnection lifecycle for non-persistent connection mode.
 *
 * Pre-creates a standby RTCPeerConnection so call setup is faster. Handles periodic refresh
 * (to prevent stale TURN credentials), network-offline cleanup, and consumption when a real
 * call needs the connection. Auto-requests on construction and after each consumption.
 */
export class StandbyPeerConnectionManager {
    private _standbyPc: RTCPeerConnection | null = null;
    private _refreshTimerId: ReturnType<typeof setTimeout> | null = null;
    private _networkConnectivityCheckerId: ReturnType<typeof setInterval> | null = null;
    private _pendingRequest: Promise<void> | null = null;
    private readonly _config: StandbyPeerConnectionManagerConfig;
    private readonly _logger: any;
    private readonly _strategy: CCPInitiationStrategyInterface;
    private readonly _clientId: string;

    constructor(config: StandbyPeerConnectionManagerConfig) {
        this._config = config;
        this._logger = config.logger;
        this._strategy = config.strategy;
        this._clientId = config.clientId;

        this._requestStandbyPeerConnection();
        this._startNetworkConnectivityChecker();
    }

    private _requestStandbyPeerConnection(): void {
        if (this._pendingRequest || !this._config.isStandbyConnectionSupported || this._config.isPersistentConnectionAllowlistedAndEnabled()) {
            return;
        }

        this._logger.info("RtcPeerConnectionManagerV2 initiates standby peer connection").sendInternalLogToServer();
        this._pendingRequest = this._config.createPeerConnection().then((pc: any) => {
            if (this._config.isPeerConnectionManagerClosed()) {
                this._logger.log("RtcPeerConnectionManagerV2 is already closed, skips storing standby peer connection for " + this._clientId).sendInternalLogToServer();
                if (pc) {
                    this._strategy.close(pc);
                }
            } else if (!pc) {
                this._logger.warn("Failed to create standby peer connection").sendInternalLogToServer();
            } else if (this._config.isPersistentConnectionAllowlistedAndEnabled()) {
                this._logger.log("Persistent connection enabled during API call, skipping standby peer connection storage for " + this._clientId).sendInternalLogToServer();
                this._strategy.close(pc);
            } else {
                this._standbyPc = pc;
                this._refreshTimerId = setTimeout(() => this._refreshStandbyPeerConnection(), RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
            }
        }).catch((error: any) => {
            this._logger.info("Failed to create standby peer connection").withObject(error).sendInternalLogToServer();
        }).finally(() => {
            this._pendingRequest = null;
        });
    }

    private _refreshStandbyPeerConnection(): void {
        this._refreshTimerId = null;
        this._closeStandbyPc();
        if (!this._config.isPeerConnectionManagerClosed()) {
            this._logger.log("Refreshing standby peer connection for client " + this._clientId).sendInternalLogToServer();
            this._requestStandbyPeerConnection();
        }
    }

    private _closeStandbyPc(): void {
        if (this._standbyPc) {
            this._strategy.close(this._standbyPc);
            this._standbyPc = null;
        }
    }

    private _stopNetworkConnectivityChecker(): void {
        if (this._networkConnectivityCheckerId) {
            clearInterval(this._networkConnectivityCheckerId);
            this._networkConnectivityCheckerId = null;
        }
    }

    /** Polls browser online status and closes the standby PC when offline to prevent stale connections. */
    private _startNetworkConnectivityChecker(): void {
        this._stopNetworkConnectivityChecker();
        this._networkConnectivityCheckerId = setInterval(() => {
            if (!navigator.onLine && this._standbyPc) {
                this._logger.log("Network offline. Cleaning up early connection").sendInternalLogToServer();
                this._strategy.close(this._standbyPc);
                this._standbyPc = null;
            }
        }, NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS);
    }

    clearRefreshTimer(): void {
        if (this._refreshTimerId) {
            clearTimeout(this._refreshTimerId);
            this._refreshTimerId = null;
        }
    }

    /**
     * Tear down the standby PC lifecycle: clear the refresh timer, stop the network checker,
     * and close the standby peer connection if one exists.
     */
    closeStandbyConnection(): void {
        this._logger.log("close method invoked. Clear timer and close standby peer connection " + this._clientId).sendInternalLogToServer();
        this.clearRefreshTimer();
        this._stopNetworkConnectivityChecker();
        this._closeStandbyPc();
    }

    consumeStandbyPc(): RTCPeerConnection | null {
        const pc = this._standbyPc;
        this._standbyPc = null;
        this.clearRefreshTimer();
        this._requestStandbyPeerConnection();
        return pc;
    }

    hasStandbyPc(): boolean {
        return !!this._standbyPc;
    }

    requestStandbyPc(): void {
        this._requestStandbyPeerConnection();
    }
}
