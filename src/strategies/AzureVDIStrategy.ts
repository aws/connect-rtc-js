import StandardStrategy from "./StandardStrategy";
import { AZURE_VDI_STRATEGY } from "../config/constants";
import { wrapLogger, isChromeBrowser, isEdgeBrowser } from "../utils";

interface AzureMetadata {
    azureMmrHostVersion: string | null;
    azureMmrExtensionVersion: string | null;
    azureActivityId: string | null;
    azureConnectionId: string | null;
}

interface RdpStateChangeEvent extends Event {
    detail?: { state?: string };
}

export default class AzureVDIStrategy extends StandardStrategy {
    private static readonly AZURE_READY_TIMEOUT_MS = 10000;

    _logger: any;
    private _metadata: AzureMetadata;
    private _mmrClientVersion: string | null;
    _onConnectionNeedingCleanupHandler: (strategy: AzureVDIStrategy) => void;
    private _connectedPromise: Promise<void>;
    private _connectedResolve: (() => void) | null;

    static isRedirectionAvailable(): boolean {
        return !!(navigator.mediaDevices &&
            (navigator.mediaDevices as any).isCallRedirectionEnabled === true &&
            (navigator.mediaDevices as any).mmrExtensionVersion !== undefined);
    }

    constructor() {
        super();
        this._validateBrowser();
        this._validateRedirectionActive();
        this._onConnectionNeedingCleanupHandler = () => {};

        // Azure validates redirection is active at construction; start already-connected.
        this._connectedPromise = Promise.resolve();
        this._connectedResolve = null;

        this._logger = global.connect && global.connect.getLog
            ? wrapLogger(global.connect.getLog(), 'softphone', '[AzureVDIStrategy] %s')
            : null;

        this._metadata = this._collectMetadata();
        this._mmrClientVersion = this._sanitize((navigator.mediaDevices as any).mmrClientVersion);
        this._registerReconnectionListener();
    }

    whenConnected(): Promise<void> {
        return Promise.race([
            this._connectedPromise,
            new Promise<void>((_, reject) => setTimeout(
                () => reject(new Error(`${this.getStrategyName()} did not connect within ${AzureVDIStrategy.AZURE_READY_TIMEOUT_MS}ms`)),
                AzureVDIStrategy.AZURE_READY_TIMEOUT_MS
            ))
        ]);
    }

    private _validateBrowser(): void {
        if (!isChromeBrowser() && !isEdgeBrowser()) {
            throw new Error('Azure VDI Call Redirection is not supported on browser: Edge or Chrome required');
        }
    }

    private _validateRedirectionActive(): void {
        if (!navigator.mediaDevices || (navigator.mediaDevices as any).isCallRedirectionEnabled !== true) {
            throw new Error('Azure VDI Call Redirection is not active');
        }
    }

    // Strips characters not in the allowlist (alphanumeric, '.', '-', '_', '(', ')', space).
    // Accepts strings and numbers; rejects objects, booleans, null, undefined.
    // Without filtering, curly braces in GUIDs like "{52416FB9-BA17}" cause a JSON parsing
    // error in the telemetry service's event publisher.
    // e.g. "{52416FB9-BA17}" -> "52416FB9-BA17", "1.0.2601<script>" -> "1.0.2601script"
    private _sanitize(value: unknown): string | null {
        if (typeof value !== 'string' && typeof value !== 'number') return null;
        return String(value).replace(/[^a-zA-Z0-9.\-_() ]/g, '').substring(0, 256) || null;
    }

    private _collectMetadata(): AzureMetadata {
        const md = navigator.mediaDevices as any;
        return {
            azureMmrHostVersion: this._sanitize(md.mmrHostVersion),
            azureMmrExtensionVersion: this._sanitize(md.mmrExtensionVersion),
            azureActivityId: this._sanitize(md.activityId),
            azureConnectionId: this._sanitize(md.connectionId)
        };
    }

    getMetadata(): AzureMetadata {
        const md = navigator.mediaDevices as any;
        this._metadata.azureActivityId = this._sanitize(md.activityId);
        this._metadata.azureConnectionId = this._sanitize(md.connectionId);
        return { ...this._metadata };
    }

    getVdiClientVersion(): string | null {
        return this._mmrClientVersion;
    }

    private _registerReconnectionListener(): void {
        navigator.mediaDevices.addEventListener(
            'rdpClientConnectionStateChanged',
            (event: Event) => this._handleRdpStateChange(event as RdpStateChangeEvent)
        );
    }

    private _handleRdpStateChange(event: RdpStateChangeEvent): void {
        const state = event.detail && event.detail.state;
        if (state === 'disconnected') {
            if (this._logger) {
                this._logger.warn('AzureVDIStrategy: RDP client disconnected').sendInternalLogToServer();
            }
            this._resetConnectedPromise();
            this._onConnectionNeedingCleanupHandler(this);
        } else if (state === 'connected') {
            if (this._logger) {
                this._logger.info('AzureVDIStrategy: RDP client reconnected').sendInternalLogToServer();
            }
            this._metadata = this._collectMetadata();
            this._mmrClientVersion = this._sanitize((navigator.mediaDevices as any).mmrClientVersion);
            if (this._connectedResolve) {
                this._connectedResolve();
                this._connectedResolve = null;
            }
        }
    }

    private _resetConnectedPromise(): void {
        this._connectedPromise = new Promise<void>((resolve) => {
            this._connectedResolve = resolve;
        });
    }

    onConnectionNeedingCleanup(handler: (strategy: AzureVDIStrategy) => void): void {
        if (typeof handler === 'function') {
            this._onConnectionNeedingCleanupHandler = handler;
        }
    }

    getStrategyName(): string {
        return AZURE_VDI_STRATEGY;
    }

    _isEarlyMediaConnectionSupported(): boolean {
        return true;
    }
}
