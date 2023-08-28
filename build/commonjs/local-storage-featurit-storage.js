"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageFeaturitStorage = void 0;
var LocalStorageFeaturitStorage = /** @class */ (function () {
    function LocalStorageFeaturitStorage() {
        this.prefix = 'featurit';
    }
    LocalStorageFeaturitStorage.prototype.get = function (key, defaultValue) {
        try {
            var value = window.localStorage.getItem(this.prepareKey(key));
            if (value == null) {
                return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
            }
            return JSON.parse(value);
        }
        catch (exception) {
            console.error(exception);
        }
    };
    LocalStorageFeaturitStorage.prototype.set = function (key, value) {
        try {
            window.localStorage.setItem(this.prepareKey(key), JSON.stringify(value));
        }
        catch (exception) {
            console.error(exception);
        }
    };
    LocalStorageFeaturitStorage.prototype.remove = function (key) {
        try {
            window.localStorage.removeItem(this.prepareKey(key));
        }
        catch (exception) {
            console.error(exception);
        }
    };
    LocalStorageFeaturitStorage.prototype.prepareKey = function (key) {
        return "".concat(this.prefix, ":").concat(key);
    };
    return LocalStorageFeaturitStorage;
}());
exports.LocalStorageFeaturitStorage = LocalStorageFeaturitStorage;
//# sourceMappingURL=local-storage-featurit-storage.js.map