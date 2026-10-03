import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRocketTwinTracking } from "../analytics";
import { COMPONENT_SYSTEM, FAULTS, MODES, SENSORS, SYSTEMS, TEST_PHASES } from "../data/engineReference";
import { INITIAL_STATE, resetRocketTwinStore, stageView, useRocketTwinStore } from "./twinStore";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

const state = () => useRocketTwinStore.getState();
/** Calls made for one event, ignoring the journey milestones reported alongside. */
const calls = (event: string) => trackEvent.mock.calls.filter(([name]) => name === event);
const events = () => trackEvent.mock.calls.map(([name]) => name).filter((name) => name !== "rocket_twin_journey_milestone");

beforeEach(() => {
  resetRocketTwinStore();
  resetRocketTwinTracking();
  trackEvent.mockReset();
});

describe("entering and the demo", () => {
  it("opens in Systems mode, in Learn mode, with nothing running", () => {
    expect(state()).toMatchObject({ entered: false, mode: "systems", audience: "learn", component: null, flow: null, fault: null, twinView: null });
    expect(state().test.status).toBe("idle");
  });

  it("reports Enter Digital Twin once, however often it is chosen", () => {
    state().enter();
    state().enter();
    state().enter();
    expect(calls("rocket_twin_enter")).toEqual([["rocket_twin_enter"]]);
    expect(state().entered).toBe(true);
  });

  it("Run Engine Demo reports once, opens Test mode and starts the simulated test", () => {
    state().runDemo();
    expect(calls("rocket_twin_demo_start")).toHaveLength(1);
    expect(state().mode).toBe("test");
    expect(state().test).toEqual({ status: "running", phase: 0 });
    expect(events()).toEqual(["rocket_twin_demo_start", "rocket_twin_test_open", "rocket_twin_test_start", "rocket_twin_test_phase"]);
  });

  it("choosing the demo again while the test runs starts nothing new", () => {
    state().runDemo();
    state().runDemo();
    expect(calls("rocket_twin_demo_start")).toHaveLength(1);
    expect(calls("rocket_twin_test_start")).toHaveLength(1);
  });
});

describe("modes and audience", () => {
  it("reports each mode's own event when it opens, and nothing when it is already open", () => {
    for (const mode of MODES) state().setMode(mode.id);
    state().setMode("twin");
    expect(events()).toEqual(["rocket_twin_build_open", "rocket_twin_systems_open", "rocket_twin_flow_open", "rocket_twin_control_open", "rocket_twin_test_open", "rocket_twin_health_open", "rocket_twin_twin_open"]);
  });

  it("reports a change of audience mode with the mode chosen", () => {
    state().setAudience("engineer");
    state().setAudience("engineer");
    state().setAudience("learn");
    expect(calls("rocket_twin_audience_mode")).toEqual([
      ["rocket_twin_audience_mode", { mode: "engineer" }],
      ["rocket_twin_audience_mode", { mode: "learn" }],
    ]);
  });
});

describe("component and engineering interactions", () => {
  it("reports a component selection with its semantic id, system, mode and audience mode", () => {
    state().setAudience("engineer");
    state().selectComponent("fuel_turbopump");
    expect(calls("rocket_twin_component_select")).toEqual([["rocket_twin_component_select", { component_id: "fuel_turbopump", system: "turbomachinery", mode: "systems", audience_mode: "engineer" }]]);
    expect(state()).toMatchObject({ system: "turbomachinery", component: "fuel_turbopump" });
  });

  it("does not report the same component twice in a row", () => {
    state().selectComponent("injector");
    state().selectComponent("injector");
    expect(calls("rocket_twin_component_select")).toHaveLength(1);
  });

  it("knows the system of every component", () => {
    for (const system of SYSTEMS) for (const component of system.components) expect(COMPONENT_SYSTEM[component.id]).toBe(system.id);
  });

  it("opens a system from its summary without reporting a component", () => {
    state().setMode("flow");
    trackEvent.mockClear();
    state().exploreSystem("nozzle");
    expect(state()).toMatchObject({ mode: "systems", system: "nozzle", component: null });
    expect(events()).toEqual(["rocket_twin_systems_open"]);
  });

  it("reports a cutaway when it opens, not when it closes", () => {
    state().toggleCutaway("combustion");
    state().toggleCutaway("combustion");
    state().toggleCutaway("nozzle");
    expect(calls("rocket_twin_cutaway")).toEqual([
      ["rocket_twin_cutaway", { system: "combustion" }],
      ["rocket_twin_cutaway", { system: "nozzle" }],
    ]);
  });

  it("reports the exploded view level when it changes", () => {
    state().setExploded("assembled");
    state().setExploded("components");
    expect(calls("rocket_twin_exploded_view")).toEqual([["rocket_twin_exploded_view", { level: "components" }]]);
  });

  it("reports the flow chosen", () => {
    state().selectFlow("hot_gas");
    state().selectFlow("hot_gas");
    state().selectFlow("cooling");
    expect(calls("rocket_twin_flow_select")).toEqual([
      ["rocket_twin_flow_select", { flow_type: "hot_gas" }],
      ["rocket_twin_flow_select", { flow_type: "cooling" }],
    ]);
  });

  it("reports a sensor trace by sensor type and system, not by name", () => {
    state().traceSensor("pump_vibration");
    expect(calls("rocket_twin_sensor_trace")).toEqual([["rocket_twin_sensor_trace", { sensor_type: "vibration", system: "turbomachinery" }]]);
    expect(SENSORS.map((s) => s.type)).toEqual(expect.arrayContaining(["pressure", "temperature", "speed", "vibration", "position"]));
  });
});

describe("simulated engine test", () => {
  it("reports the start once, even if start is asked for again while running", () => {
    state().startTest();
    state().startTest();
    state().startTest();
    expect(calls("rocket_twin_test_start")).toHaveLength(1);
  });

  it("reports every phase in order and then completion", () => {
    state().startTest();
    for (let i = 0; i < TEST_PHASES.length; i++) state().advanceTest();
    expect(calls("rocket_twin_test_phase").map(([, params]) => params.phase)).toEqual(["system_check", "conditioning", "ready", "start", "mainstage", "throttle", "shutdown", "review"]);
    expect(calls("rocket_twin_test_complete")).toEqual([["rocket_twin_test_complete", { completion_status: "completed" }]]);
    expect(state().test.status).toBe("completed");
  });

  it("does nothing more once the test is over", () => {
    state().startTest();
    for (let i = 0; i < TEST_PHASES.length + 5; i++) state().advanceTest();
    state().stopTest();
    expect(calls("rocket_twin_test_complete")).toHaveLength(1);
    expect(calls("rocket_twin_test_phase")).toHaveLength(TEST_PHASES.length);
  });

  it("reports a stopped test as aborted", () => {
    state().startTest();
    state().advanceTest();
    state().stopTest();
    expect(calls("rocket_twin_test_complete")).toEqual([["rocket_twin_test_complete", { completion_status: "aborted" }]]);
    expect(state().test).toEqual({ status: "aborted", phase: 1 });
  });

  it("can be run again, which is a new start", () => {
    state().startTest();
    state().stopTest();
    state().startTest();
    expect(calls("rocket_twin_test_start")).toHaveLength(2);
    expect(state().test).toEqual({ status: "running", phase: 0 });
  });
});

describe("fault scenarios", () => {
  it("reports the fault type and its system when a scenario starts", () => {
    state().startFault("cooling_channel_restriction");
    expect(calls("rocket_twin_fault_start")).toEqual([["rocket_twin_fault_start", { fault_type: "cooling_channel_restriction", system: "regenerative_cooling" }]]);
  });

  it("follows a scenario from symptom to diagnosis to completion, reporting each step once", () => {
    state().startFault("turbopump_bearing_wear");
    state().startFault("turbopump_bearing_wear");
    state().completeFault(); // Not yet: the diagnosis has not been viewed.
    state().viewDiagnosis();
    state().viewDiagnosis();
    state().completeFault();
    state().completeFault();
    expect(events()).toEqual(["rocket_twin_fault_start", "rocket_twin_fault_diagnosis_view", "rocket_twin_fault_complete"]);
    expect(calls("rocket_twin_fault_diagnosis_view")[0][1]).toEqual({ fault_type: "turbopump_bearing_wear" });
    expect(calls("rocket_twin_fault_complete")[0][1]).toEqual({ fault_type: "turbopump_bearing_wear" });
    expect(state().fault).toEqual({ id: "turbopump_bearing_wear", stage: "complete" });
  });

  it("names a real system for every scenario", () => {
    const systems = SYSTEMS.map((s) => s.id);
    for (const fault of FAULTS) expect(systems).toContain(fault.system);
  });
});

describe("digital twin views", () => {
  it("reports the comparison, the prediction and Model Credibility", () => {
    state().openCompare();
    state().openCompare();
    state().openPrediction();
    state().openModelCredibility();
    expect(events()).toEqual(["rocket_twin_compare_open", "rocket_twin_prediction_open", "rocket_twin_model_credibility_open"]);
    expect(calls("rocket_twin_prediction_open")[0][1]).toEqual({ model_type: "reduced_order" });
  });
});

describe("journey milestones", () => {
  it("reports each milestone once across a whole visit", () => {
    const s = state();
    s.enter();
    s.selectComponent("injector");
    s.selectComponent("throat");
    s.selectFlow("cooling");
    s.selectFlow("data");
    s.startFault("turbopump_bearing_wear");
    s.startFault("chamber_pressure_sensor_drift");
    s.openCompare();
    s.startTest();
    for (let i = 0; i < TEST_PHASES.length; i++) state().advanceTest();
    state().startTest();
    expect(calls("rocket_twin_journey_milestone").map(([, params]) => params.milestone)).toEqual(["entered", "first_component", "first_flow", "first_fault", "first_twin_comparison", "first_test", "test_complete"]);
  });
});

describe("privacy", () => {
  it("only ever sends fixed lower_snake_case ids as parameters", () => {
    const s = state();
    s.enter();
    s.runDemo();
    for (let i = 0; i < TEST_PHASES.length; i++) state().advanceTest();
    for (const mode of MODES) state().setMode(mode.id);
    state().setAudience("engineer");
    for (const system of SYSTEMS) for (const component of system.components) state().selectComponent(component.id);
    state().toggleCutaway("turbomachinery");
    state().setExploded("assemblies");
    state().selectFlow("propellant");
    for (const sensor of SENSORS) state().traceSensor(sensor.id);
    for (const fault of FAULTS) {
      state().startFault(fault.id);
      state().viewDiagnosis();
      state().completeFault();
    }
    state().openCompare();
    state().openPrediction();
    state().openModelCredibility();

    expect(trackEvent.mock.calls.length).toBeGreaterThan(40);
    for (const [event, params] of trackEvent.mock.calls) {
      expect(event).toMatch(/^rocket_twin_[a-z_]+$/);
      for (const [key, value] of Object.entries(params ?? {})) {
        expect(key, event).toMatch(/^[a-z_]+$/);
        expect(value, `${event}.${key}`).toMatch(/^[a-z0-9_]{1,64}$/);
      }
    }
  });
});

describe("what the schematic shows", () => {
  it("highlights the selected system in Systems mode", () => {
    expect(stageView({ ...INITIAL_STATE, system: "nozzle" })).toMatchObject({ highlight: "nozzle", flow: null, sensors: false, firing: false });
  });

  it("keeps the exploded view and cutaway to Build mode", () => {
    const built = { ...INITIAL_STATE, exploded: "components" as const, cutaway: "combustion" as const };
    expect(stageView({ ...built, mode: "build" })).toMatchObject({ exploded: "components", cutaway: "combustion" });
    expect(stageView({ ...built, mode: "flow" })).toMatchObject({ exploded: "assembled", cutaway: null });
  });

  it("burns only in the firing phases of a running test", () => {
    const at = (name: string, status: "running" | "aborted" = "running") => stageView({ ...INITIAL_STATE, mode: "test", test: { status, phase: TEST_PHASES.findIndex((p) => p.id === name) } }).firing;
    expect(["system_check", "conditioning", "ready", "start", "mainstage", "throttle", "shutdown", "review"].map((p) => at(p))).toEqual([false, false, false, true, true, true, false, false]);
    expect(at("mainstage", "aborted")).toBe(false);
  });

  it("marks the faulted system until the scenario is complete", () => {
    const health = { ...INITIAL_STATE, mode: "health" as const };
    expect(stageView({ ...health, fault: { id: "cooling_channel_restriction", stage: "diagnosis" } }).alert).toBe("regenerative_cooling");
    expect(stageView({ ...health, fault: { id: "cooling_channel_restriction", stage: "complete" } }).alert).toBeNull();
  });

  it("shows one sensor's path when it is traced", () => {
    expect(stageView({ ...INITIAL_STATE, mode: "control", sensor: "shaft_speed" })).toMatchObject({ sensors: true, sensor: "shaft_speed", flow: null });
  });
});
