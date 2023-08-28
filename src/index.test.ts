import { Featurit } from "./index";
import fetchMock from "jest-fetch-mock";
import * as mockResponseWithContext from "../test/mockApiResponseWithContext.json";
import * as mockResponseWithoutContext from "../test/mockApiResponseWithoutContext.json";
import { DefaultFeaturitUserContext } from "./default-featurit-user-context";
import { DefaultFeaturitUserContextProvider } from "./default-featurit-user-context-provider";

jest.useFakeTimers();

afterEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
  jest.clearAllTimers();
});

test("Can create an instance of FeaturIT client with only tenantIdentifier and frontendApiKey arguments.", () => {
  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
  });

  expect(featurit).toBeInstanceOf(Featurit);
});

test("It calls the frontend API when calling the init method.", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithoutContext));

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    apiClient: fetchMock,
  });

  await featurit.init();

  const isActive = featurit.isActive("TEST_A");

  expect(isActive).toBe(true);
});

test("Method isActive returns false when the feature flag doesn't exist.", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithoutContext));

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    apiClient: fetchMock,
  });

  await featurit.init();

  const isActive = featurit.isActive("NON_EXISTING_FEATURE");

  expect(isActive).toBe(false);
});

test("Method version returns default when no context is sent.", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithoutContext));

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    apiClient: fetchMock,
  });

  await featurit.init();

  const version = featurit.version("TEST_B");

  expect(version).toBe("default");
});

test("Method version returns default when the feature flag doesn't exist.", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithoutContext));

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    apiClient: fetchMock,
  });

  await featurit.init();

  const version = featurit.version("NON_EXISTING_FEATURE");

  expect(version).toBe("default");
});

test("Method version returns the proper value when context is sent.", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithContext));

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    featuritUserContext: new DefaultFeaturitUserContext(
      "1234",
      "1357",
      "192.168.1.1",
    ),
    apiClient: fetchMock,
  });

  await featurit.init();

  const version = featurit.version("TEST_B");

  expect(version).toBe("v1");
});

test("It works properly even if the API is failing.", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    apiClient: fetchMock,
  });

  await featurit.init();

  const version = featurit.version("TEST_B");

  expect(version).toBe("default");
});

test("Passing a user context in the constructor overrides the user context provider.", async () => {
  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    featuritUserContext: new DefaultFeaturitUserContext(
      "1234",
      "1357",
      "192.168.1.1",
    ),
    featuritUserContextProvider: new DefaultFeaturitUserContextProvider(
      new DefaultFeaturitUserContext("9876", null, "127.0.0.1"),
    ),
  });

  const userContext = featurit.getUserContext();

  expect(userContext.getUserId()).toBe("1234");
});

test("Passing a user context in the setter overrides the user context provider.", async () => {
  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    featuritUserContextProvider: new DefaultFeaturitUserContextProvider(
      new DefaultFeaturitUserContext("9876", null, "127.0.0.1"),
    ),
  });

  featurit.setUserContext(
    new DefaultFeaturitUserContext("1234", "1357", "192.168.1.1"),
  );

  const userContext = featurit.getUserContext();

  expect(userContext.getUserId()).toBe("1234");
});

test("Passing a user context in the setter overrides the user context from the constructor.", async () => {
  const featurit = new Featurit({
    tenantIdentifier: "test",
    frontendApiKey: "test",
    featuritUserContext: new DefaultFeaturitUserContext(
      "1234",
      "1357",
      "192.168.1.1",
    ),
  });

  featurit.setUserContext(
    new DefaultFeaturitUserContext("9876", null, "127.0.0.1"),
  );

  const userContext = featurit.getUserContext();

  expect(userContext.getUserId()).toBe("9876");
});
