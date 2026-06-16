import StandardStrategy from "./strategies/StandardStrategy";

export class MediaDevices {
    static enumerateDevices(strategy = new StandardStrategy()) {
        return strategy._enumerateDevices();
    }

    static addOnDeviceChange(listener, strategy = new StandardStrategy()) {
        return strategy._addDeviceChangeListener(listener);
    }

    static removeOnDeviceChange(listener, strategy = new StandardStrategy()) {
        return strategy._removeDeviceChangeListener(listener);
    }
}