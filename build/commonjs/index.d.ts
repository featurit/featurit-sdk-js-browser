/// <reference types="node" />
import { FeaturitUserContextProvider } from "./featurit-user-context-provider";
import { FeaturitStorage } from "./featurit-storage";
import { FeaturitUserContext } from "./featurit-user-context";
import { EventEmitter } from "events";
export declare const STORAGE_KEY: {
    FEATURE_FLAGS: string;
    ANALYTICS: string;
};
export declare const FEATURIT_EVENTS: {
    CHANGED: string;
};
interface FeaturitSetup {
    tenantIdentifier: string;
    frontendApiKey: string;
    enableAnalytics?: boolean;
    refreshIntervalMinutes?: number;
    sendAnalyticsIntervalMinutes?: number;
    featuritUserContext?: FeaturitUserContext;
    featuritUserContextProvider?: FeaturitUserContextProvider;
    storage?: FeaturitStorage;
    apiClient?: unknown;
}
export interface FeatureFlag extends FeatureFlagValue {
    name: string;
}
export interface FeatureFlagValue {
    active: boolean;
    version: string;
}
export interface FeatureFlagList {
    [featureName: string]: FeatureFlagValue;
}
export declare class Featurit extends EventEmitter {
    private readonly tenantIdentifier;
    private readonly frontendApiKey;
    private readonly isAnalyticsEnabled;
    private featuritUserContextProvider;
    private readonly storage;
    private readonly apiClient;
    private readonly apiBaseUrl;
    private readonly refreshIntervalMinutes;
    private readonly sendAnalyticsIntervalMinutes;
    private analyticsService;
    private featureFlags;
    private timer;
    constructor({ tenantIdentifier, frontendApiKey, enableAnalytics, refreshIntervalMinutes, sendAnalyticsIntervalMinutes, featuritUserContext, featuritUserContextProvider, storage, apiClient, }: FeaturitSetup);
    init(): Promise<void>;
    refresh(): Promise<void>;
    isActive(featureName: string): boolean;
    version(featureName: string): string;
    getUserContext(): FeaturitUserContext;
    setUserContext(featuritUserContext: FeaturitUserContext): void;
    private getFeatureFlagsFromAPI;
    private getFeatureFlagsFromStorage;
    private setFeaturitUserContextProvider;
    private contextAsQueryParams;
}
export {};
//# sourceMappingURL=index.d.ts.map