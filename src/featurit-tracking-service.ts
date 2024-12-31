import {FeaturitStorage} from "./featurit-storage";
import {STORAGE_KEY} from "./featurit";
import {FeaturitUserContext} from "./featurit-user-context";

export interface TrackingEvent {
  event: string;
  properties: Record<string, any>;
}

export interface Person extends Record<string, any> {

}

export class FeaturitTrackingService {
  private timer: any;
  private isSendingDataToAPI: boolean = false;
  private globalProperties: Record<string, any> = {};

  constructor(
    private storage: FeaturitStorage,
    private apiClient: any,
    private sendTrackingIntervalMinutes: number,
    private apiBaseUrl: string,
  ) {
  }

  public init(): void {
    if (!!this.timer) {
      return;
    }

    this.timer = setInterval(
      async () => {
        await this.sendTrackingInformationToAPI();
      },
      this.sendTrackingIntervalMinutes * 1000 * 60,
    );
  }

  public track(eventName: string, properties: Record<string, any> = {}): void {
    const events: TrackingEvent[] = this.storage.get(STORAGE_KEY.EVENTS) ?? [];

    if (properties["time"] == undefined) {
      properties["time"] = Date.now() / 1000;
    }

    events.push({
      event: eventName,
      properties: {
        ...{ time: Date.now() / 1000 },
        ...this.globalProperties,
        ...properties,
      },
    });

    this.storage.set(STORAGE_KEY.EVENTS, events);
  }

  public register(propertyName: string, propertyValue: any): void {
    if (propertyName == "") {
      return;
    }

    this.globalProperties[propertyName] = propertyValue;
  }

  public addPerson(featuritUserContext: FeaturitUserContext): void {
    const people: Record<string, Person> = this.storage.get(STORAGE_KEY.PEOPLE) ?? {};

    if (featuritUserContext.getUserId() != null) {
      this.register("distinct_id", featuritUserContext.getUserId());

      people[featuritUserContext.getUserId()!] = {
        ...{ time: Date.now() / 1000 },
        ...this.globalProperties,
        ...featuritUserContext.toJson(),
      };
    } else if (featuritUserContext.getSessionId() != null) {
      this.register("distinct_id", featuritUserContext.getSessionId());

      people[featuritUserContext.getSessionId()!] = {
        ...{ time: Date.now() / 1000 },
        ...this.globalProperties,
        ...featuritUserContext.toJson(),
      };
    }

    this.storage.set(STORAGE_KEY.PEOPLE, people);
  }

  public async sendTrackingInformationToAPI(beaconMode: boolean = false): Promise<void> {
    if (this.isSendingDataToAPI) {
      return;
    }

    try {
      this.isSendingDataToAPI = true;

      const events = this.storage.get(STORAGE_KEY.EVENTS);

      if (events && events.length > 0) {
        await this.sendEventsToAPI(events, beaconMode);
        this.storage.remove(STORAGE_KEY.EVENTS);
      }

      const people = this.storage.get(STORAGE_KEY.PEOPLE);

      if (people && Object.keys(people).length > 0) {
        await this.sendPeopleToAPI(people, beaconMode);
        this.storage.remove(STORAGE_KEY.PEOPLE);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      this.isSendingDataToAPI = false;
    }
  }

  private async sendEventsToAPI(events: TrackingEvent[], beaconMode: boolean = false): Promise<void> {
    const apiUrl = `${this.apiBaseUrl}/track`;

    if (beaconMode) {
      const success: boolean = window.navigator.sendBeacon(apiUrl, JSON.stringify({events: events}));

      if (!success) {
        throw new Error("Something failed beaconing the Tracking Events to the FeaturIT API")
      }

      return;
    }

    const response = await this.apiClient(apiUrl, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "User-Agent": "FeaturIT",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({events: events}),
    });

    if (response.status != 200) {
      throw new Error(
        "Something failed sending the Tracking Events to the FeaturIT API",
      );
    }
  }

  private async sendPeopleToAPI(people: Person[], beaconMode: boolean = false) {
    const apiUrl = `${this.apiBaseUrl}/people`;

    if (beaconMode) {
      const success: boolean = window.navigator.sendBeacon(apiUrl, JSON.stringify({people: people}));

      if (!success) {
        throw new Error("Something failed beaconing the People to the FeaturIT API")
      }

      return;
    }

    const response = await this.apiClient(apiUrl, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "User-Agent": "FeaturIT",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({people: people}),
    });

    if (response.status != 200) {
      throw new Error(
        "Something failed sending the People to the FeaturIT API",
      );
    }
  }
}
