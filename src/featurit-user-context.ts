export const BASE_ATTRIBUTE = {
  USER_ID: "userId",
  SESSION_ID: "sessionId",
  IP_ADDRESS: "ipAddress",
};

export interface FeaturitUserContext {
  getUserId: () => string | null;
  getSessionId: () => string | null;
  getIpAddress: () => string | null;
  getCustomAttributes: () => Map<string, any>;
  hasCustomAttribute: (attributeName: string) => boolean;
  getCustomAttribute: (attributeName: string) => any | null;
  getAttribute: (attributeName: string) => any | null;

  toJson: () => Record<string, any>;
}
