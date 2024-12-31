import {BASE_ATTRIBUTE, FeaturitUserContext} from "./featurit-user-context";

export class DefaultFeaturitUserContext implements FeaturitUserContext {
  constructor(
    private userId: string | null = null,
    private sessionId: string | null = null,
    private ipAddress: string | null = null,
    private customAttributes: Map<string, any> = new Map(),
  ) {
  }

  getUserId(): string | null {
    return this.userId;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getIpAddress(): string | null {
    return this.ipAddress;
  }

  getCustomAttributes(): Map<string, any> {
    return this.customAttributes;
  }

  hasCustomAttribute(attributeName: string): boolean {
    return this.customAttributes.has(attributeName);
  }

  getCustomAttribute(attributeName: string): any | null {
    return this.customAttributes.get(attributeName);
  }

  getAttribute(attributeName: string): any | null {
    switch (attributeName) {
      case BASE_ATTRIBUTE.USER_ID:
        return this.userId;
      case BASE_ATTRIBUTE.SESSION_ID:
        return this.sessionId;
      case BASE_ATTRIBUTE.IP_ADDRESS:
        return this.ipAddress;
      default:
        return this.customAttributes.get(attributeName);
    }
  }

  toJson(): Record<string, any> {
    const userContextJSON = {
      [BASE_ATTRIBUTE.USER_ID]: this.userId,
      [BASE_ATTRIBUTE.SESSION_ID]: this.sessionId,
      [BASE_ATTRIBUTE.IP_ADDRESS]: this.ipAddress,
    };

    for (const [propertyName, propertyValue] of this.getCustomAttributes().entries()) {
      userContextJSON[propertyName] = propertyValue;
    }

    return userContextJSON;
  }
}
