import { FeaturitStorage } from "./featurit-storage";
import { FeatureFlagValue } from "./index";
export declare class FeaturitAnalyticsService {
    private storage;
    private apiClient;
    private sendAnalyticsIntervalMinutes;
    private apiBaseUrl;
    private timer;
    constructor(storage: FeaturitStorage, apiClient: any, sendAnalyticsIntervalMinutes: number, apiBaseUrl: string);
    init(): void;
    registerFeatureFlagRequest(featureName: string, featureFlagValue: FeatureFlagValue, currentTime?: Date): void;
    private createAnalyticsBucket;
    private sendAnalyticsToAPI;
}
//# sourceMappingURL=featurit-analytics-service.d.ts.map