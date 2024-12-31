import { FeaturitUserContextProvider } from "./featurit-user-context-provider";
import { FeaturitStorage } from "./featurit-storage";
import { DefaultFeaturitUserContextProvider } from "./default-featurit-user-context-provider";
import { LocalStorageFeaturitStorage } from "./local-storage-featurit-storage";
import { FeaturitUserContext } from "./featurit-user-context";
import { FeaturitAnalyticsService } from "./featurit-analytics-service";
import { EventEmitter } from "events";
import {FeaturitTrackingService} from "./featurit-tracking-service";

const DEFAULT_REFRESH_INTERVAL_MINUTES = 5;
const DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES = 1;
const DEFAULT_VERSION = "default";

export const STORAGE_KEY = {
  FEATURE_FLAGS: "featureFlags",
  ANALYTICS: "analytics",
  EVENTS: "events",
  PEOPLE: "people",
};

export const FEATURIT_EVENTS = {
  CHANGED: "changed",
};

export interface FeaturitSetup {
  tenantIdentifier: string;
  frontendApiKey: string;
  enableAnalytics?: boolean;
  enableTracking?: boolean;
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

function resolveFetch() {
  try {
    if (typeof window !== "undefined" && "fetch" in window) {
      return fetch.bind(window);
    } else if ("fetch" in globalThis) {
      return fetch.bind(globalThis);
    }
  } catch (e) {
    console.error("Can't resolve fetch.", e);
  }

  return undefined;
}

export class Featurit extends EventEmitter {
  private readonly tenantIdentifier: string;
  private readonly frontendApiKey: string;
  private readonly isAnalyticsEnabled: boolean;
  private readonly isTrackingEnabled: boolean;

  private featuritUserContextProvider: FeaturitUserContextProvider =
    new DefaultFeaturitUserContextProvider();

  private readonly storage: FeaturitStorage;

  private readonly apiClient: any;
  private readonly apiBaseUrl: string;

  private readonly refreshIntervalMinutes: number;
  private readonly sendAnalyticsIntervalMinutes: number;
  private analyticsService: FeaturitAnalyticsService;

  private readonly sendTrackingIntervalMinutes: number;
  private trackingService: FeaturitTrackingService;

  private featureFlags: Map<string, FeatureFlagValue> = new Map<
    string,
    FeatureFlagValue
  >();

  private timer: any;

  constructor({
    tenantIdentifier,
    frontendApiKey,
    enableAnalytics = false,
    enableTracking = false,
    refreshIntervalMinutes = DEFAULT_REFRESH_INTERVAL_MINUTES,
    sendAnalyticsIntervalMinutes = DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES,
    featuritUserContext,
    featuritUserContextProvider = new DefaultFeaturitUserContextProvider(),
    storage = new LocalStorageFeaturitStorage(),
    apiClient = resolveFetch(),
  }: FeaturitSetup) {
    super();

    this.tenantIdentifier = tenantIdentifier;
    this.frontendApiKey = frontendApiKey;

    this.storage = storage ?? new LocalStorageFeaturitStorage();

    this.setFeaturitUserContextProvider(
      featuritUserContext,
      featuritUserContextProvider,
    );

    this.refreshIntervalMinutes =
      refreshIntervalMinutes ?? DEFAULT_REFRESH_INTERVAL_MINUTES;

    this.apiClient = apiClient;
    this.apiBaseUrl = `https://${this.tenantIdentifier}.featurit.com/api/v1/${this.frontendApiKey}`;

    this.isAnalyticsEnabled = enableAnalytics ?? false;
    this.sendAnalyticsIntervalMinutes =
      sendAnalyticsIntervalMinutes ?? DEFAULT_SEND_ANALYTICS_INTERVAL_MINUTES;

    this.analyticsService = new FeaturitAnalyticsService(
      this.storage,
      this.apiClient,
      this.sendAnalyticsIntervalMinutes,
      this.apiBaseUrl,
    );

    this.isTrackingEnabled = enableTracking ?? false;
    this.sendTrackingIntervalMinutes = 1;

    this.trackingService = new FeaturitTrackingService(
      this.storage,
      this.apiClient,
      this.sendTrackingIntervalMinutes,
      this.apiBaseUrl
    );

    if (this.isTrackingEnabled) {
      if (window.navigator.sendBeacon != undefined && window.addEventListener != undefined) {
        window.addEventListener("pagehide", async (event: PageTransitionEvent) => {
          if (event.persisted) {
            await this.trackingService.sendTrackingInformationToAPI(true);
          }
        });

        window.addEventListener("visibilitychange", async () => {
          if (document.visibilityState == "hidden") {
            await this.trackingService.sendTrackingInformationToAPI(true);
          }
        });
      }
    }

    this.getFeatureFlagsFromStorage();
  }

  public async init(): Promise<void> {
    if (!!this.timer) {
      return;
    }

    this.timer = setInterval(
      () => {
        this.getFeatureFlagsFromAPI();
      },
      this.refreshIntervalMinutes * 1000 * 60,
    );

    await this.getFeatureFlagsFromAPI();

    if (this.isAnalyticsEnabled) {
      this.analyticsService.init();
    }

    if (this.isTrackingEnabled) {
      this.trackingService.init();
    }
  }

  public async refresh(): Promise<void> {
    await this.getFeatureFlagsFromAPI();
  }

  public isActive(featureName: string): boolean {
    const featureFlagValue: FeatureFlagValue | undefined =
      this.featureFlags.get(featureName);

    if (featureFlagValue === undefined) {
      return false;
    }

    if (this.isAnalyticsEnabled) {
      this.analyticsService.registerFeatureFlagRequest(
        featureName,
        featureFlagValue,
        new Date(),
      );
    }

    return featureFlagValue?.active ?? false;
  }

  public version(featureName: string): string {
    return this.featureFlags.get(featureName)?.version ?? DEFAULT_VERSION;
  }

  public track(eventName: string, properties: Record<string, string | number> = {}): void {
    if (!this.isTrackingEnabled) {
      return;
    }

    this.trackingService.track(eventName, properties);
  }

  public trackPerson(): void {
    if (!this.isTrackingEnabled) {
      return;
    }

    this.trackingService.addPerson(this.getUserContext());
  }

  public register(propertyName: string, propertyValue: any): void {
    if (!this.isTrackingEnabled) {
      return;
    }

    this.trackingService.register(propertyName, propertyValue);
  }

  public async flush(): Promise<void> {
    if (!this.isTrackingEnabled) {
      return;
    }

    await this.trackingService.sendTrackingInformationToAPI();
  }

  public getUserContext(): FeaturitUserContext {
    return this.featuritUserContextProvider.getUserContext();
  }

  public setUserContext(featuritUserContext: FeaturitUserContext): void {
    this.setFeaturitUserContextProvider(featuritUserContext);
  }

  private async getFeatureFlagsFromAPI(): Promise<void> {
    const contextAsQueryParams: string = this.contextAsQueryParams();
    const apiUrl = `${this.apiBaseUrl}/feature-flags/segmented?${contextAsQueryParams}`;

    try {
      const response = await this.apiClient(apiUrl, {
        method: "GET",
        cache: "no-cache",
        headers: {
          "User-Agent": "FeaturIT",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Server Error");
      }

      const data = await response.json();

      if (
        JSON.stringify(Object.fromEntries(this.featureFlags)) ==
        JSON.stringify(data.data)
      ) {
        return;
      }

      const featureFlags: FeatureFlagList = data.data;

      if (featureFlags === undefined) {
        return;
      }

      this.storage.set(STORAGE_KEY.FEATURE_FLAGS, featureFlags);

      this.featureFlags = new Map<string, FeatureFlagValue>();
      for (let featureName in featureFlags) {
        this.featureFlags.set(featureName, featureFlags[featureName]);
      }

      this.emit(FEATURIT_EVENTS.CHANGED, featureFlags);
    } catch (error: any) {
      console.error(
        "There has been a problem requesting Feature Flags from the FeaturIT API.",
      );
    }
  }

  private getFeatureFlagsFromStorage() {
    const featureFlags: FeatureFlagList = this.storage.get(
      STORAGE_KEY.FEATURE_FLAGS,
    );

    if (!featureFlags) {
      return;
    }

    this.featureFlags = new Map<string, FeatureFlagValue>();
    for (let featureName in featureFlags) {
      this.featureFlags.set(featureName, featureFlags[featureName]);
    }
  }

  private setFeaturitUserContextProvider(
    featuritUserContext?: FeaturitUserContext,
    featuritUserContextProvider?: FeaturitUserContextProvider,
  ) {
    if (featuritUserContext !== undefined) {
      this.featuritUserContextProvider = new DefaultFeaturitUserContextProvider(
        featuritUserContext,
      );
      return;
    }

    this.featuritUserContextProvider =
      featuritUserContextProvider ?? new DefaultFeaturitUserContextProvider();
  }

  private contextAsQueryParams(): string {
    const context: FeaturitUserContext =
      this.featuritUserContextProvider.getUserContext();

    const userId = context.getUserId();
    const sessionId = context.getSessionId();
    const ipAddress = context.getIpAddress();

    const urlSearchParams = new URLSearchParams();
    for (const [propertyName, propertyValue] of context.getCustomAttributes().entries()) {
      if (
        propertyValue == "" ||
        propertyValue == null ||
        propertyName == "" ||
        propertyName == null
      ) {
        continue;
      }

      urlSearchParams.append(`userCtx[${propertyName}]`, propertyValue);
    }

    if (userId != null && userId != "") {
      urlSearchParams.append("userCtx[userId]", userId);
    }
    if (sessionId != null && sessionId != "") {
      urlSearchParams.append("userCtx[sessionId]", sessionId);
    }
    if (ipAddress != null && ipAddress != "") {
      urlSearchParams.append("userCtx[ipAddress]", ipAddress);
    }

    return urlSearchParams.toString();
  }
}
