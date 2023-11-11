import { FeaturitStorage } from "./featurit-storage";
import { FeatureFlagValue, STORAGE_KEY } from "./featurit";

interface AnalyticsBucket {
  start: Date;
  end: Date | null;
  reqs: {
    [hour: string]: {
      [featureName: string]: {
        [featureVersion: string]: {
          t?: number;
          f?: number;
        };
      };
    };
  };
}

export class FeaturitAnalyticsService {
  private timer: any;

  constructor(
    private storage: FeaturitStorage,
    private apiClient: any,
    private sendAnalyticsIntervalMinutes: number,
    private apiBaseUrl: string,
  ) {}

  public init(): void {
    if (!!this.timer) {
      return;
    }

    this.timer = setInterval(
      async () => {
        try {
          const analyticsBucket = this.storage.get(STORAGE_KEY.ANALYTICS);

          if (!analyticsBucket) {
            return;
          }

          analyticsBucket.end = new Date();

          await this.sendAnalyticsToAPI(analyticsBucket);

          this.storage.remove(STORAGE_KEY.ANALYTICS);
        } catch (error: any) {
          console.error(error);
        }
      },
      this.sendAnalyticsIntervalMinutes * 1000 * 60,
    );
  }

  public registerFeatureFlagRequest(
    featureName: string,
    featureFlagValue: FeatureFlagValue,
    currentTime?: Date,
  ): void {
    if (typeof currentTime == "undefined") {
      currentTime = new Date();
    }

    const analyticsBucket =
      this.storage.get(STORAGE_KEY.ANALYTICS) ??
      this.createAnalyticsBucket(currentTime);

    if (analyticsBucket.end != null) {
      return;
    }

    const copyTime = new Date(currentTime);
    copyTime.setMinutes(0, 0, 0);
    const hourKey = copyTime.toISOString();
    const flagNameKey = featureName;
    const flagVersionKey = featureFlagValue.version;
    const isActiveKey = featureFlagValue.active ? "t" : "f";

    if (typeof analyticsBucket["reqs"][hourKey] == "undefined") {
      analyticsBucket["reqs"][hourKey] = {};
    }

    if (typeof analyticsBucket["reqs"][hourKey][flagNameKey] == "undefined") {
      analyticsBucket["reqs"][hourKey][flagNameKey] = {};
    }

    if (
      typeof analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey] ==
      "undefined"
    ) {
      analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey] = {};
    }

    if (
      typeof analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][
        isActiveKey
      ] == "undefined"
    ) {
      analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][
        isActiveKey
      ] = 0;
    }

    analyticsBucket["reqs"][hourKey][flagNameKey][flagVersionKey][
      isActiveKey
    ]++;

    this.storage.set(STORAGE_KEY.ANALYTICS, analyticsBucket);
  }

  private createAnalyticsBucket(currentTime: Date): AnalyticsBucket {
    return {
      start: currentTime,
      end: null,
      reqs: {},
    };
  }

  private async sendAnalyticsToAPI(analyticsBucket: AnalyticsBucket) {
    const apiUrl = `${this.apiBaseUrl}/analytics`;

    try {
      const response = await this.apiClient(apiUrl, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "User-Agent": "FeaturIT",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(analyticsBucket),
      });

      if (response.status != 200) {
        throw new Error(
          "Something failed sending the Analytics to the FeaturIT API",
        );
      }
    } catch (error: any) {
      console.error(
        "There has been some problem sending Analytics to the FeaturIT API.",
      );
    }
  }
}
