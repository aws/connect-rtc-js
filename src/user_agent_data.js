export class UserAgentData {

    constructor() {
        this._platform = null;
        this._platformVersion = null;
        this._architecture = null;
        this._bitness = null;
        this._browserBrand = null;
        this._browserVersion = null;
        this._mobile = false;
        this._model = null;
    }

    /**
     * Returns a string describing the platform the user agent is running on, like "Windows"
     * @returns {string}
     */
    get platform() {
        return this._platform;
    }

    /**
     * A string containing the platform version. For example, "10.0".
     * @returns {string}
     */
    get platformVersion() {
        return this._platformVersion;
    }

    /**
     * A string containing the platform architecture. For example, "x86"
     * @returns {string}
     */
    get architecture() {
        return this._architecture;
    }

    /**
     * A string containing the architecture bitness. For example, "32" or "64".
     * @returns {string}
     */
    get bitness() {
        return this._bitness;
    }

    /**
     * Returns browser brand
     * @returns {string}
     */
    get browserBrand() {
        return this._browserBrand;
    }

    /**
     * Returns browser version
     * @returns {string}
     */
    get browserVersion() {
        return this._browserVersion;
    }

    /**
     * Returns true if the user agent is running on a mobile device
     * @returns {string}
     */
    get mobile() {
        return this._mobile;
    }

    /**
     * A string containing the model of mobile device.
     * @returns {string}
     */
    get model() {
        return this._model;
    }


    set platform(value) {
        this._platform = value;
    }

    set platformVersion(value) {
        this._platformVersion = value;
    }

    set architecture(value) {
        this._architecture = value;
    }

    set bitness(value) {
        this._bitness = value;
    }

    set browserBrand(value) {
        this._browserBrand = value;
    }

    set browserVersion(value) {
        this._browserVersion = value;
    }

    set mobile(value) {
        this._mobile = value;
    }

    set model(value) {
        this._model = value;
    }
}