"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturitAnalyticsService = void 0;
var index_1 = require("./index");
var FeaturitAnalyticsService = /** @class */ (function () {
    function FeaturitAnalyticsService(storage, apiClient, sendAnalyticsIntervalMinutes, apiBaseUrl) {
        this.storage = storage;
        this.apiClient = apiClient;
        this.sendAnalyticsIntervalMinutes = sendAnalyticsIntervalMinutes;
        this.apiBaseUrl = apiBaseUrl;
    }
    FeaturitAnalyticsService.prototype.init = function () {
        var _this = this;
        if (!!this.timer) {
            console.log('AnalyticsService init', 'Timer already set, skipping...');
            return;
        }
        console.log('AnalyticsService init', 'Setting the timer');
        this.timer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var analyticsBucket, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        analyticsBucket = this.storage.get(index_1.STORAGE_KEY.ANALYTICS);
                        if (!analyticsBucket) {
                            console.log('AnalyticsService timer', 'No bucket, skipping tick');
                            return [2 /*return*/];
                        }
                        analyticsBucket.end = new Date();
                        console.log('AnalyticsService timer', "Sending analytics to the API...");
                        return [4 /*yield*/, this.sendAnalyticsToAPI(analyticsBucket)];
                    case 1:
                        _a.sent();
                        this.storage.remove(index_1.STORAGE_KEY.ANALYTICS);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.sendAnalyticsIntervalMinutes * 1000 * 60);
    };
    FeaturitAnalyticsService.prototype.registerFeatureFlagRequest = function (featureName, featureFlagValue, currentTime) {
        var _a;
        if (typeof currentTime == "undefined") {
            currentTime = new Date();
        }
        var analyticsBucket = (_a = this.storage.get(index_1.STORAGE_KEY.ANALYTICS)) !== null && _a !== void 0 ? _a : this.createAnalyticsBucket(currentTime);
        if (analyticsBucket.end != null) {
            console.log('AnalyticsService register', "Bucket is closed, skipping register...");
            return;
        }
        var copyTime = new Date(currentTime);
        copyTime.setMinutes(0, 0, 0);
        var hourKey = copyTime.toISOString();
        var flagNameKey = featureName;
        var flagVersionKey = featureFlagValue.version;
        var isActiveKey = featureFlagValue.active ? 't' : 'f';
        if (typeof analyticsBucket["reqs"][hourKey] == "undefined") {
            analyticsBucket["reqs"][hourKey] = {};
        }
        if (typeof analyticsBucket["reqs"][hourKey][flagNameKey] == "undefined") {
            analyticsBucket["reqs"][hourKey][flagNameKey] = {};
        }
        if (typeof analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey] == "undefined") {
            analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey] = {};
        }
        if (typeof analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][isActiveKey] == "undefined") {
            analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][isActiveKey] = 0;
        }
        analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][isActiveKey]++;
        console.log('AnalyticsService register', "Storing bucket to localstorage");
        this.storage.set(index_1.STORAGE_KEY.ANALYTICS, analyticsBucket);
    };
    FeaturitAnalyticsService.prototype.createAnalyticsBucket = function (currentTime) {
        return {
            start: currentTime,
            end: null,
            reqs: {},
        };
    };
    FeaturitAnalyticsService.prototype.sendAnalyticsToAPI = function (analyticsBucket) {
        return __awaiter(this, void 0, void 0, function () {
            var apiUrl, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('AnalyticsService', "Sending analytics to the API.");
                        apiUrl = "".concat(this.apiBaseUrl, "/analytics");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.apiClient(apiUrl, {
                                method: 'POST',
                                cache: 'no-cache',
                                headers: {
                                    'User-Agent': 'FeaturIT',
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                },
                                body: JSON.stringify(analyticsBucket),
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.status != 200) {
                            throw new Error("Something failed sending the Analytics to the FeaturIT API");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('There has been some problem sending Analytics to the FeaturIT API.');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return FeaturitAnalyticsService;
}());
exports.FeaturitAnalyticsService = FeaturitAnalyticsService;
//# sourceMappingURL=featurit-analytics-service.js.map