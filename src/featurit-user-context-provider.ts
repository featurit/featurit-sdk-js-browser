import { FeaturitUserContext } from "./featurit-user-context";

export interface FeaturitUserContextProvider {
  getUserContext: () => FeaturitUserContext;
}
