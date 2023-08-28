import { FeaturitStorage } from "./featurit-storage";

export class LocalStorageFeaturitStorage implements FeaturitStorage {
  private prefix: string = "featurit";

  public get(key: string, defaultValue?: string): any | null {
    try {
      const value = window.localStorage.getItem(this.prepareKey(key));
      if (value == null) {
        return defaultValue ?? null;
      }

      return JSON.parse(value);
    } catch (exception) {
      console.error(exception);
    }
  }

  public set(key: string, value: any): void {
    try {
      window.localStorage.setItem(this.prepareKey(key), JSON.stringify(value));
    } catch (exception) {
      console.error(exception);
    }
  }

  public remove(key: string): void {
    try {
      window.localStorage.removeItem(this.prepareKey(key));
    } catch (exception) {
      console.error(exception);
    }
  }

  private prepareKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}
