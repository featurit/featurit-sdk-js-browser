import { FeaturitUserContextProvider } from "./featurit-user-context-provider";
import { FeaturitUserContext } from "./featurit-user-context";
import { DefaultFeaturitUserContext } from "./default-featurit-user-context";

export class DefaultFeaturitUserContextProvider
  implements FeaturitUserContextProvider
{
  constructor(
    private readonly featuritUserContext: FeaturitUserContext = new DefaultFeaturitUserContext(),
  ) {
    this.featuritUserContext = featuritUserContext;
  }

  getUserContext(): FeaturitUserContext {
    return this.featuritUserContext;
  }
}
