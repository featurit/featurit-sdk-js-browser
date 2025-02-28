import {Featurit, STORAGE_KEY} from "./featurit";
import fetchMock from "jest-fetch-mock";
// @ts-ignore
import * as mockResponseWithContext from "../test/mockApiResponseWithContext.json";
// @ts-ignore
import * as mockResponseWithoutContext from "../test/mockApiResponseWithoutContext.json";
import {DefaultFeaturitUserContext} from "./default-featurit-user-context";
import {DefaultFeaturitUserContextProvider} from "./default-featurit-user-context-provider";
import {Person, TrackingEvent} from "./featurit-tracking-service";

describe("Featurit", () => {
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
    localStorage.setItem(
      "featurit:featureFlags",
      '{"TEST_B":{"active":true,"version":"v1"}}',
    );

    fetchMock.mockResponseOnce("{}", {status: 500});

    const featurit = new Featurit({
      tenantIdentifier: "test2",
      frontendApiKey: "test",
      apiClient: fetchMock,
    });

    await featurit.init();

    const isActive = featurit.isActive("TEST_B");
    const version = featurit.version("TEST_B");

    expect(isActive).toBe(true);
    expect(version).toBe("v1");
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
      new DefaultFeaturitUserContext(
        "9876",
        null,
        "127.0.0.1",
        new Map<string, any>([
          ["role", "admin"],
          ["city", "Barcelona"],
        ]),
      ),
    );

    const userContext = featurit.getUserContext();

    expect(userContext.getCustomAttribute("city")).toBe("Barcelona");
  });

  test("It tracks an event adding timestamp to it", async () => {
    const featurit = new Featurit({
      tenantIdentifier: "test",
      frontendApiKey: "test",
      enableTracking: true,
    });

    featurit.track("TEST_EVENT", {
      foo: "baz",
    });

    const events: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(events.length).toBe(1);

    expect(events[0].properties.foo).toBe("baz");
    expect(events[0].properties.time).toBeGreaterThan(0);
  });

  test("It tracks a person adding timestamp to it", async () => {
    const featurit = new Featurit({
      tenantIdentifier: "test",
      frontendApiKey: "test",
      enableTracking: true,
      featuritUserContext: new DefaultFeaturitUserContext(
        "1234",
        "1357",
        "192.168.1.1",
        new Map([["lorem", "ipsum"], ["dolor", "sit"]])
      ),
    });

    featurit.trackPerson();

    const people: Person[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.PEOPLE) ?? "{}");

    expect(Object.keys(people).length).toBe(1);

    expect(people["1234"]).toBeDefined();

    expect(people["1234"].distinct_id).toBe("1234");
    expect(people["1234"].ipAddress).toBe("192.168.1.1");
    expect(people["1234"].lorem).toBe("ipsum");
    expect(people["1234"].dolor).toBe("sit");
    expect(people["1234"].time).toBeGreaterThan(0);
  });

  test("It adds registered properties to the subsequent events and people", async () => {
    const featurit = new Featurit({
      tenantIdentifier: "test",
      frontendApiKey: "test",
      enableTracking: true,
      featuritUserContext: new DefaultFeaturitUserContext(
        "1234",
        "1357",
        "192.168.1.1",
        new Map([["lorem", "ipsum"], ["dolor", "sit"]])
      ),
    });

    featurit.register("john", "doe");

    featurit.trackPerson();

    featurit.track("CHECKOUT", {
      "amount": 1_000,
      "currency": "EUR",
    });

    const people: Person[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.PEOPLE) ?? "{}");
    const events: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(Object.keys(people).length).toBe(1);
    expect(events.length).toBe(1);

    expect(people["1234"].john).toBe("doe");
    expect(events[0].properties.john).toBe("doe");

    expect(people["1234"].distinct_id).toBe("1234");
    expect(events[0].properties.distinct_id).toBe("1234");
  });

  test("Flush sends the events and people to the server immediately", async () => {
    fetchMock.mockResponses(
      JSON.stringify(mockResponseWithContext),
      JSON.stringify(mockResponseWithContext)
    );

    const featurit = new Featurit({
      tenantIdentifier: "test",
      frontendApiKey: "test",
      enableTracking: true,
      featuritUserContext: new DefaultFeaturitUserContext(
        "1111",
        "2222",
        "192.168.1.10"
      ),
      apiClient: fetchMock
    });

    featurit.trackPerson();

    featurit.track("CHECKOUT", {
      "amount": 1_000,
      "currency": "EUR",
    });

    const peopleBeforeFlush: Person[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.PEOPLE) ?? "{}");
    const eventsBeforeFlush: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(Object.keys(peopleBeforeFlush).length).toBe(1);
    expect(eventsBeforeFlush.length).toBe(1);

    await featurit.flush();

    const peopleAfterFlush: Person[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.PEOPLE) ?? "{}");
    const eventsAfterFlush: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(Object.keys(peopleAfterFlush).length).toBe(0);
    expect(eventsAfterFlush.length).toBe(0);
  });

  test("It reacts on page unload events if tracking is enabled", async () => {
    window.navigator.sendBeacon = jest.fn(() => {
      return true
    });

    fetchMock.mockResponses(
      JSON.stringify(mockResponseWithContext),
      JSON.stringify(mockResponseWithContext)
    );

    const featurit = new Featurit({
      tenantIdentifier: "test",
      frontendApiKey: "test",
      enableTracking: true,
      apiClient: fetchMock
    });

    await featurit.init();

    featurit.track("TEST_EVENT");

    const eventsBeforeFlush: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(eventsBeforeFlush.length).toBe(1);

    window.dispatchEvent(new PageTransitionEvent("pagehide", {persisted: true}));

    jest.useRealTimers();

    await timeout(1);

    jest.useFakeTimers();

    const eventsAfterFlush: TrackingEvent[] = JSON.parse(localStorage.getItem("featurit:" + STORAGE_KEY.EVENTS) ?? "[]");

    expect(eventsAfterFlush.length).toBe(0);
  });
});

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}