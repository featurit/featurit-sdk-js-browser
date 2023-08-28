"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Featurit = exports.FEATURIT_EVENTS = exports.STORAGE_KEY = void 0;
var default_featurit_user_context_provider_1 = require("./default-featurit-user-context-provider");
var local_storage_featurit_storage_1 = require("./local-storage-featurit-storage");
var featurit_analytics_service_1 = require("./featurit-analytics-service");
var events_1 = require("events");
var DEFAULT_REFRESH_INTERVAL_MINUTES = 5;
var DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES = 1;
var DEFAULT_VERSION = 'default';
exports.STORAGE_KEY = {
    FEATURE_FLAGS: 'featureFlags',
    ANALYTICS: 'analytics',
};
exports.FEATURIT_EVENTS = {
    CHANGED: 'changed',
};
function resolveFetch() {
    try {
        if (typeof window !== 'undefined' && 'fetch' in window) {
            return fetch.bind(window);
        }
        else if ('fetch' in globalThis) {
            return fetch.bind(globalThis);
        }
    }
    catch (e) {
        console.error("Can't resolve fetch.", e);
    }
    return undefined;
}
var Featurit = /** @class */ (function (_super) {
    __extends(Featurit, _super);
    function Featurit(_a) {
        var tenantIdentifier = _a.tenantIdentifier, frontendApiKey = _a.frontendApiKey, _b = _a.enableAnalytics, enableAnalytics = _b === void 0 ? false : _b, _c = _a.refreshIntervalMinutes, refreshIntervalMinutes = _c === void 0 ? DEFAULT_REFRESH_INTERVAL_MINUTES : _c, _d = _a.sendAnalyticsIntervalMinutes, sendAnalyticsIntervalMinutes = _d === void 0 ? DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES : _d, featuritUserContext = _a.featuritUserContext, _e = _a.featuritUserContextProvider, featuritUserContextProvider = _e === void 0 ? new default_featurit_user_context_provider_1.DefaultFeaturitUserContextProvider() : _e, _f = _a.storage, storage = _f === void 0 ? new local_storage_featurit_storage_1.LocalStorageFeaturitStorage() : _f, _g = _a.apiClient, apiClient = _g === void 0 ? resolveFetch() : _g;
        var _this = _super.call(this) || this;
        _this.featuritUserContextProvider = new default_featurit_user_context_provider_1.DefaultFeaturitUserContextProvider();
        _this.featureFlags = new Map();
        _this.tenantIdentifier = tenantIdentifier;
        _this.frontendApiKey = frontendApiKey;
        _this.storage = storage !== null && storage !== void 0 ? storage : new local_storage_featurit_storage_1.LocalStorageFeaturitStorage();
        _this.setFeaturitUserContextProvider(featuritUserContext, featuritUserContextProvider);
        _this.refreshIntervalMinutes = refreshIntervalMinutes !== null && refreshIntervalMinutes !== void 0 ? refreshIntervalMinutes : DEFAULT_REFRESH_INTERVAL_MINUTES;
        _this.apiClient = apiClient;
        _this.apiBaseUrl = "http://".concat(_this.tenantIdentifier, ".localhost/api/v1/").concat(_this.frontendApiKey);
        _this.isAnalyticsEnabled = enableAnalytics !== null && enableAnalytics !== void 0 ? enableAnalytics : false;
        _this.sendAnalyticsIntervalMinutes = sendAnalyticsIntervalMinutes !== null && sendAnalyticsIntervalMinutes !== void 0 ? sendAnalyticsIntervalMinutes : DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES;
        _this.analyticsService = new featurit_analytics_service_1.FeaturitAnalyticsService(_this.storage, _this.apiClient, _this.sendAnalyticsIntervalMinutes, _this.apiBaseUrl);
        _this.getFeatureFlagsFromStorage();
        return _this;
    }
    Featurit.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.timer) {
                            console.log('Featurit init', 'Timer already set, skipping...');
                            return [2 /*return*/];
                        }
                        console.log('Featurit init', 'Starting the timer');
                        this.timer = setInterval(function () {
                            _this.getFeatureFlagsFromAPI();
                        }, this.refreshIntervalMinutes * 1000 * 60);
                        return [4 /*yield*/, this.getFeatureFlagsFromAPI()];
                    case 1:
                        _a.sent();
                        if (this.isAnalyticsEnabled) {
                            this.analyticsService.init();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Featurit.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFeatureFlagsFromAPI()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Featurit.prototype.isActive = function (featureName) {
        var _a;
        var featureFlagValue = this.featureFlags.get(featureName);
        if (typeof featureFlagValue == "undefined") {
            // TODO: Should we send analytics here?
            return false;
        }
        if (this.isAnalyticsEnabled) {
            console.log("Registering Feature Flag Request to Analytics...");
            this.analyticsService.registerFeatureFlagRequest(featureName, featureFlagValue, new Date());
        }
        else {
            console.log("Analytics is disabled, skipping...");
        }
        return (_a = featureFlagValue === null || featureFlagValue === void 0 ? void 0 : featureFlagValue.active) !== null && _a !== void 0 ? _a : false;
    };
    Featurit.prototype.version = function (featureName) {
        var _a, _b;
        return (_b = (_a = this.featureFlags.get(featureName)) === null || _a === void 0 ? void 0 : _a.version) !== null && _b !== void 0 ? _b : DEFAULT_VERSION;
    };
    Featurit.prototype.getUserContext = function () {
        return this.featuritUserContextProvider.getUserContext();
    };
    Featurit.prototype.setUserContext = function (featuritUserContext) {
        this.setFeaturitUserContextProvider(featuritUserContext);
    };
    Featurit.prototype.getFeatureFlagsFromAPI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contextAsQueryParams, apiUrl, response, data, featureFlags, featureName, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Featurit', "Asking for feature changes to the API");
                        contextAsQueryParams = this.contextAsQueryParams();
                        apiUrl = "".concat(this.apiBaseUrl, "/feature-flags/segmented?").concat(contextAsQueryParams);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.apiClient(apiUrl, {
                                method: 'GET',
                                cache: 'no-cache',
                                headers: {
                                    'User-Agent': 'FeaturIT',
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (JSON.stringify(Object.fromEntries(this.featureFlags)) == JSON.stringify(data.data)) {
                            console.log('Nothing has changed, not refreshing localStorage');
                            return [2 /*return*/];
                        }
                        featureFlags = data.data;
                        this.storage.set(exports.STORAGE_KEY.FEATURE_FLAGS, featureFlags);
                        this.featureFlags = new Map();
                        for (featureName in featureFlags) {
                            this.featureFlags.set(featureName, featureFlags[featureName]);
                        }
                        console.log('Refreshing localStorage');
                        console.log('Emitting CHANGED event');
                        this.emit(exports.FEATURIT_EVENTS.CHANGED, featureFlags);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('There has been a problem requesting Feature Flags from the FeaturIT API.');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Featurit.prototype.getFeatureFlagsFromStorage = function () {
        var featureFlags = this.storage.get(exports.STORAGE_KEY.FEATURE_FLAGS);
        if (!featureFlags) {
            return;
        }
        this.featureFlags = new Map();
        for (var featureName in featureFlags) {
            this.featureFlags.set(featureName, featureFlags[featureName]);
        }
    };
    Featurit.prototype.setFeaturitUserContextProvider = function (featuritUserContext, featuritUserContextProvider) {
        if (featuritUserContext !== undefined) {
            this.featuritUserContextProvider = new default_featurit_user_context_provider_1.DefaultFeaturitUserContextProvider(featuritUserContext);
            return;
        }
        this.featuritUserContextProvider = featuritUserContextProvider !== null && featuritUserContextProvider !== void 0 ? featuritUserContextProvider : new default_featurit_user_context_provider_1.DefaultFeaturitUserContextProvider();
    };
    Featurit.prototype.contextAsQueryParams = function () {
        var e_1, _a;
        var context = this.featuritUserContextProvider.getUserContext();
        var userId = context.getUserId();
        var sessionId = context.getSessionId();
        var ipAddress = context.getIpAddress();
        var urlSearchParams = new URLSearchParams();
        try {
            for (var _b = __values(context.getCustomAttributes().entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), propertyName = _d[0], propertyValue = _d[1];
                if (propertyValue == ""
                    || propertyValue == null
                    || propertyName == ""
                    || propertyName == null) {
                    continue;
                }
                urlSearchParams.append("userCtx[".concat(propertyName, "]"), propertyValue);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (userId != null && userId != "") {
            urlSearchParams.append('userCtx[userId]', userId);
        }
        if (sessionId != null && sessionId != "") {
            urlSearchParams.append('userCtx[sessionId]', sessionId);
        }
        if (ipAddress != null && ipAddress != "") {
            urlSearchParams.append('userCtx[ipAddress]', ipAddress);
        }
        return urlSearchParams.toString();
    };
    return Featurit;
}(events_1.EventEmitter));
exports.Featurit = Featurit;
//# sourceMappingURL=index.js.map