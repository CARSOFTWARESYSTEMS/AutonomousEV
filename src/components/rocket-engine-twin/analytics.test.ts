import { beforeEach, describe, expect, it, vi } from "vitest";
import { MODE_OPEN_EVENT, resetRocketTwinTracking, rocketTwinLinkTracking, trackRocketTwinEvent, trackRocketTwinOnce } from "./analytics";
import { MODES } from "./data/engineReference";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

beforeEach(() => {
  trackEvent.mockReset();
  resetRocketTwinTracking();
});

describe("trackRocketTwinEvent", () => {
  it("sends the event through the site's existing trackEvent", () => {
    trackRocketTwinEvent("rocket_twin_enter");
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("rocket_twin_enter");
  });

  it("passes the event's parameters as given", () => {
    trackRocketTwinEvent("rocket_twin_component_select", { component_id: "fuel_turbopump", system: "turbomachinery", mode: "engine", audience_mode: "engineer" });
    expect(trackEvent).toHaveBeenCalledWith("rocket_twin_component_select", { component_id: "fuel_turbopump", system: "turbomachinery", mode: "engine", audience_mode: "engineer" });
  });

  it("drops any value that is not a short id, so free text can never be sent", () => {
    const loose = trackRocketTwinEvent as unknown as (event: string, params: Record<string, unknown>) => void;
    loose("rocket_twin_flow_select", { flow_type: "hot_gas", note: "typed by a user", email: "someone@example.com", name: "Jane Doe", count: 3, long: "a".repeat(65) });
    expect(trackEvent).toHaveBeenCalledWith("rocket_twin_flow_select", { flow_type: "hot_gas" });
  });

  it("never lets an analytics failure reach the experience", () => {
    trackEvent.mockImplementation(() => {
      throw new Error("analytics unavailable");
    });
    expect(() => trackRocketTwinEvent("rocket_twin_test_start")).not.toThrow();
  });

  it("has one open event for each mode", () => {
    // Engine mode is the systems view, and keeps the event name it was first given.
    expect(MODES.map((m) => MODE_OPEN_EVENT[m.id])).toEqual([
      "rocket_twin_systems_open",
      "rocket_twin_build_open",
      "rocket_twin_flow_open",
      "rocket_twin_control_open",
      "rocket_twin_test_open",
      "rocket_twin_health_open",
      "rocket_twin_twin_open",
      "rocket_twin_architecture_open",
    ]);
  });
});

describe("trackRocketTwinOnce", () => {
  it("sends an event once however often it is asked for", () => {
    trackRocketTwinOnce("rocket_twin_mobile_view");
    trackRocketTwinOnce("rocket_twin_mobile_view");
    trackRocketTwinOnce("rocket_twin_mobile_view");
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it("treats different parameters as different events", () => {
    trackRocketTwinOnce("rocket_twin_journey_milestone", { milestone: "first_flow" });
    trackRocketTwinOnce("rocket_twin_journey_milestone", { milestone: "first_test" });
    trackRocketTwinOnce("rocket_twin_journey_milestone", { milestone: "first_flow" });
    expect(trackEvent.mock.calls).toEqual([
      ["rocket_twin_journey_milestone", { milestone: "first_flow" }],
      ["rocket_twin_journey_milestone", { milestone: "first_test" }],
    ]);
  });
});

describe("rocketTwinLinkTracking", () => {
  it("builds the data attributes the site-wide click listener reads", () => {
    expect(rocketTwinLinkTracking("rocket_twin_profile_click", { placement: "prepared_by" })).toEqual({
      "data-track-event": "rocket_twin_profile_click",
      "data-track-placement": "prepared_by",
    });
    expect(rocketTwinLinkTracking("rocket_twin_related_click", { destination: "model_rocketry" })).toEqual({
      "data-track-event": "rocket_twin_related_click",
      "data-track-destination": "model_rocketry",
    });
  });
});
