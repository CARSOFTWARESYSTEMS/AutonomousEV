import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRocketTwinTracking } from "../analytics";
import { COMPONENT_SYSTEM, FAULTS, MODES, SENSORS, SYSTEMS, TEST_PHASES } from "../data/engineReference";
import { TOUR_STAGES } from "../data/twinContent";
import { stageCaption } from "./caption";
import { INITIAL_STATE, explodedLevel, resetRocketTwinStore, stageView, useRocketTwinStore } from "./twinStore";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

const state = () => useRocketTwinStore.getState();
/** Calls made for one event, ignoring the journey milestones reported alongside. */
const calls = (event: string) => trackEvent.mock.calls.filter(([name]) => name === event);
const events = () => trackEvent.mock.calls.map(([name]) => name).filter((name) => name !== "rocket_twin_journey_milestone");
const phaseIndex = (id: string) => TEST_PHASES.findIndex((p) => p.id === id);
/** Runs the test up to the start of a phase. */
function runTo(id: string) {
  state().startTest();
  while (TEST_PHASES[state().test.phase].id !== id) state().advanceTest();
}

beforeEach(() => {
  resetRocketTwinStore();
  resetRocketTwinTracking();
  trackEvent.mockReset();
});

describe("entering and the demo", () => {
  it("opens on the hero: Engine mode, Learn mode, nothing selected, running or open", () => {
    expect(state()).toMatchObject({ entered: false, mode: "engine", audience: "learn", component: null, flow: null, fault: null, bearing: null, twinView: null, cutaway: null, explodedAmount: 0, tour: null, cameraPreset: "hero" });
    expect(state().test.status).toBe("idle");
  });

  it("reports Enter Digital Twin once, however often it is chosen, and moves the camera in", () => {
    state().enter();
    state().enter();
    state().enter();
    expect(calls("rocket_twin_enter")).toEqual([["rocket_twin_enter"]]);
    expect(state()).toMatchObject({ entered: true, cameraPreset: "engine_overview" });
  });

  it("Run Engine Demo reports once, opens Test mode and starts the simulated test", () => {
    state().runDemo();
    expect(calls("rocket_twin_demo_start")).toHaveLength(1);
    expect(state().mode).toBe("test");
    expect(state().test).toMatchObject({ status: "running", phase: 0 });
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
  it("offers the eight modes of the brief, in order", () => {
    expect(MODES.map((m) => m.label.toUpperCase())).toEqual(["ENGINE", "BUILD", "FLOW", "CONTROL", "TEST", "HEALTH", "TWIN", "ARCHITECTURE"]);
  });

  it("reports each mode's own event when it opens, and nothing when it is already open", () => {
    for (const mode of MODES) state().setMode(mode.id);
    state().setMode("architecture");
    // Engine is the opening mode, so choosing it first changes nothing.
    expect(events()).toEqual(["rocket_twin_build_open", "rocket_twin_flow_open", "rocket_twin_control_open", "rocket_twin_test_open", "rocket_twin_health_open", "rocket_twin_twin_open", "rocket_twin_architecture_open"]);
    state().setMode("engine");
    expect(events().at(-1)).toBe("rocket_twin_systems_open");
  });

  it("gives every mode a view of its own and puts the engine back together on the way in", () => {
    state().setMode("build");
    state().toggleEngineOpen();
    state().setMode("flow");
    expect(state()).toMatchObject({ engineOpen: false, explodedAmount: 0, cutaway: null, cameraPreset: "feed_overview" });
    state().selectFlow("cooling");
    state().setMode("test");
    expect(state()).toMatchObject({ flow: null, cutaway: null, cameraPreset: "test_stand" });
  });

  it("reports a change of audience mode with the mode chosen, without touching the scene", () => {
    state().setMode("flow");
    state().selectFlow("hot_gas");
    const before = { ...state() };
    state().setAudience("engineer");
    state().setAudience("engineer");
    state().setAudience("learn");
    expect(calls("rocket_twin_audience_mode")).toEqual([
      ["rocket_twin_audience_mode", { mode: "engineer" }],
      ["rocket_twin_audience_mode", { mode: "learn" }],
    ]);
    expect(state()).toMatchObject({ mode: before.mode, flow: before.flow, cutaway: before.cutaway, cameraNonce: before.cameraNonce });
  });
});

describe("selection and camera", () => {
  it("reports a component selection with its semantic id, system, mode and audience mode", () => {
    state().setAudience("engineer");
    state().selectComponent("fuel_turbopump");
    expect(calls("rocket_twin_component_select")).toEqual([["rocket_twin_component_select", { component_id: "fuel_turbopump", system: "turbomachinery", mode: "engine", audience_mode: "engineer" }]]);
    expect(state()).toMatchObject({ system: "turbomachinery", component: "fuel_turbopump", systemFocus: true, focused: false });
  });

  it("does not report the same component twice in a row", () => {
    state().selectComponent("injector");
    state().selectComponent("injector");
    expect(calls("rocket_twin_component_select")).toHaveLength(1);
  });

  it("selecting shows the system; focusing moves in; and both ways back are offered", () => {
    state().enter();
    state().selectComponent("bearing_region");
    expect(state().cameraPreset).toBe("turbomachinery");
    state().focusComponent("bearing_region");
    expect(state()).toMatchObject({ focused: true, cameraPreset: "bearing_close" });
    state().backToSystem();
    expect(state()).toMatchObject({ focused: false, cameraPreset: "turbomachinery", component: "bearing_region" });
    state().backToEngine();
    expect(state()).toMatchObject({ component: null, systemFocus: false, cameraPreset: "engine_overview" });
  });

  it("sends the camera to its preset again when asked twice", () => {
    state().setCamera("nozzle");
    const nonce = state().cameraNonce;
    state().setCamera("nozzle");
    expect(state().cameraNonce).toBe(nonce + 1);
  });

  it("knows the system of every component", () => {
    for (const system of SYSTEMS) for (const component of system.components) expect(COMPONENT_SYSTEM[component.id]).toBe(system.id);
  });

  it("opens a system from its summary on the page, entering the twin", () => {
    state().setMode("flow");
    trackEvent.mockClear();
    state().exploreSystem("nozzle");
    expect(state()).toMatchObject({ entered: true, mode: "engine", system: "nozzle", component: null, systemFocus: true, cameraPreset: "nozzle" });
    expect(events()).toEqual(["rocket_twin_systems_open"]);
  });
});

describe("open engine, exploded view and cutaway", () => {
  it("Open Engine separates the assemblies and cuts them open, and closes again", () => {
    state().toggleEngineOpen();
    expect(state()).toMatchObject({ engineOpen: true, explodedAmount: 0.5, cutaway: "all", cameraPreset: "open_engine" });
    expect(calls("rocket_twin_open_engine")).toHaveLength(1);
    state().toggleEngineOpen();
    expect(state()).toMatchObject({ engineOpen: false, explodedAmount: 0, cutaway: null });
    expect(calls("rocket_twin_open_engine")).toHaveLength(1);
  });

  it("explodes proportionally, and reports the level only when the slider crosses into another", () => {
    for (let v = 0; v <= 100; v += 2) state().setExplodedAmount(v / 100);
    expect(state().explodedAmount).toBe(1);
    expect(calls("rocket_twin_exploded_view")).toEqual([
      ["rocket_twin_exploded_view", { level: "assemblies" }],
      ["rocket_twin_exploded_view", { level: "components" }],
    ]);
    expect([0, 0.1, 0.5, 1].map(explodedLevel)).toEqual(["assembled", "assembled", "assemblies", "components"]);
    // The camera steps back as the engine comes apart, and returns when it is whole again.
    expect(state().cameraPreset).toBe("open_engine");
    state().setExplodedAmount(0);
    expect(state().cameraPreset).toBe("engine_overview");
    state().setExplodedAmount(1);
    state().setExplodedAmount(7);
    expect(state().explodedAmount).toBe(1);
  });

  it("keeps cutaway separate from the exploded view", () => {
    state().toggleCutaway("turbomachinery");
    expect(state()).toMatchObject({ cutaway: "turbomachinery", explodedAmount: 0 });
    state().setExplodedAmount(0.6);
    expect(state().cutaway).toBe("turbomachinery");
  });

  it("reports a cutaway when it opens, not when it closes", () => {
    state().toggleCutaway("combustion");
    state().toggleCutaway("combustion");
    state().toggleCutaway("regenerative_cooling");
    expect(calls("rocket_twin_cutaway")).toEqual([
      ["rocket_twin_cutaway", { system: "combustion" }],
      ["rocket_twin_cutaway", { system: "regenerative_cooling" }],
    ]);
    expect(state().cutaway).toBe("regenerative_cooling");
  });
});

describe("flow", () => {
  it("reports the flow chosen", () => {
    state().selectFlow("hot_gas");
    state().selectFlow("hot_gas");
    state().selectFlow("cooling");
    expect(calls("rocket_twin_flow_select")).toEqual([
      ["rocket_twin_flow_select", { flow_type: "hot_gas" }],
      ["rocket_twin_flow_select", { flow_type: "cooling" }],
    ]);
  });

  it("opens the wall for cooling and the chamber for hot gas, and moves the camera to them", () => {
    state().selectFlow("cooling");
    expect(state()).toMatchObject({ cutaway: "regenerative_cooling", cameraPreset: "cooling_channel" });
    state().selectFlow("hot_gas");
    expect(state()).toMatchObject({ cutaway: "combustion", cameraPreset: "chamber_cutaway" });
    state().selectFlow("propellant");
    expect(state()).toMatchObject({ cutaway: null, cameraPreset: "feed_overview" });
  });

  it("shows pressure on the fluid network only", () => {
    state().selectFlow("propellant");
    state().togglePressure();
    expect(state().pressure).toBe(true);
    state().selectFlow("data");
    expect(state().pressure).toBe(false);
  });

  it("runs the cooling comparison as a state that can always be restored", () => {
    state().selectFlow("cooling");
    state().runCoolingComparison();
    expect(state().cooled).toBe(false);
    state().restoreCooling();
    expect(state().cooled).toBe(true);
    state().runCoolingComparison();
    state().selectFlow("propellant");
    expect(state().cooled).toBe(true);
  });

  it("opens the turbopump to show energy transfer", () => {
    state().selectComponent("fuel_turbopump");
    state().toggleEnergyFlow();
    expect(state()).toMatchObject({ energyFlow: true, cutaway: "turbomachinery", cameraPreset: "pump_close" });
    state().toggleEnergyFlow();
    expect(state().energyFlow).toBe(false);
  });
});

describe("sensors", () => {
  it("filters by sensor type, one at a time", () => {
    state().setSensorFilter("vibration");
    expect(state().sensorFilter).toBe("vibration");
    state().setSensorFilter("vibration");
    expect(state().sensorFilter).toBeNull();
  });

  it("covers the six sensor types of the brief", () => {
    expect([...new Set(SENSORS.map((s) => s.type))].sort()).toEqual(["position", "pressure", "speed", "strain", "temperature", "vibration"]);
  });

  it("reports a sensor trace by sensor type and system, not by name, and once", () => {
    state().traceSensor("pump_vibration");
    state().traceSensor("pump_vibration");
    expect(calls("rocket_twin_sensor_trace")).toEqual([["rocket_twin_sensor_trace", { sensor_type: "vibration", system: "turbomachinery" }]]);
    expect(state()).toMatchObject({ sensor: "pump_vibration", tracing: true });
    state().selectSensor("chamber_pressure");
    expect(state().tracing).toBe(false);
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
    expect(state().test).toMatchObject({ status: "aborted", phase: 1 });
  });

  it("can be run again, which is a new start", () => {
    state().startTest();
    state().stopTest();
    state().startTest();
    expect(calls("rocket_twin_test_start")).toHaveLength(2);
    expect(state().test).toMatchObject({ status: "running", phase: 0 });
  });

  it("only accepts a throttle level while the engine is at mainstage or throttling", () => {
    state().setThrottle(60);
    runTo("start");
    state().setThrottle(60);
    expect(state().throttle).toBeNull();
    expect(calls("rocket_twin_throttle")).toHaveLength(0);
  });

  it("a chosen throttle level holds the test at the throttle phase until it is continued", () => {
    runTo("mainstage");
    state().setThrottle(60);
    expect(state()).toMatchObject({ throttle: 60, test: { status: "running", phase: phaseIndex("throttle"), hold: true } });
    state().advanceTest();
    expect(state().test.phase).toBe(phaseIndex("throttle"));
    state().setThrottle(60);
    state().setThrottle(40);
    expect(calls("rocket_twin_throttle")).toEqual([
      ["rocket_twin_throttle", { level: "60" }],
      ["rocket_twin_throttle", { level: "40" }],
    ]);
    state().continueTest();
    expect(state()).toMatchObject({ throttle: null, test: { status: "running", phase: phaseIndex("shutdown"), hold: false } });
    // Each phase was still reported once.
    expect(calls("rocket_twin_test_phase").map(([, p]) => p.phase)).toEqual(["system_check", "conditioning", "ready", "start", "mainstage", "throttle", "shutdown"]);
  });
});

describe("fault scenarios", () => {
  it("reports the fault type and its system when a console scenario starts", () => {
    state().startFault("cooling_channel_restriction");
    expect(calls("rocket_twin_fault_start")).toEqual([["rocket_twin_fault_start", { fault_type: "cooling_channel_restriction", system: "regenerative_cooling" }]]);
  });

  it("follows a console scenario from symptom to diagnosis to completion, reporting each step once", () => {
    state().startFault("turbopump_bearing_wear");
    state().startFault("turbopump_bearing_wear");
    state().completeFault(); // Not yet: the diagnosis has not been viewed.
    state().viewDiagnosis();
    state().viewDiagnosis();
    state().completeFault();
    state().completeFault();
    expect(events()).toEqual(["rocket_twin_fault_start", "rocket_twin_fault_diagnosis_view", "rocket_twin_fault_complete"]);
    expect(state().fault).toEqual({ id: "turbopump_bearing_wear", stage: "complete" });
  });

  it("names a real system for every scenario", () => {
    const systems = SYSTEMS.map((s) => s.id);
    for (const fault of FAULTS) expect(systems).toContain(fault.system);
  });

  it("introduces bearing degradation on the component itself: opened, in view, starting healthy", () => {
    state().setMode("health");
    trackEvent.mockClear();
    state().introduceBearingFault();
    state().introduceBearingFault();
    expect(state()).toMatchObject({ bearing: "healthy", system: "turbomachinery", component: "bearing_region", cutaway: "turbomachinery", cameraPreset: "bearing_close", healthSystem: "turbomachinery" });
    expect(calls("rocket_twin_fault_start")).toEqual([["rocket_twin_fault_start", { fault_type: "turbopump_bearing_wear", system: "turbomachinery" }]]);
  });

  it("reports the diagnosis when the scenario reaches it, once, and completion when it is cleared", () => {
    state().introduceBearingFault();
    trackEvent.mockClear();
    state().setBearingStage("early");
    state().setBearingStage("anomaly");
    state().setBearingStage("diagnosis");
    state().setBearingStage("diagnosis");
    expect(events()).toEqual(["rocket_twin_fault_diagnosis_view"]);
    state().clearBearingFault();
    state().clearBearingFault();
    expect(calls("rocket_twin_fault_complete")).toEqual([["rocket_twin_fault_complete", { fault_type: "turbopump_bearing_wear" }]]);
    expect(state().bearing).toBeNull();
  });

  it("ignores a stage change when no scenario is running", () => {
    state().setBearingStage("anomaly");
    expect(state().bearing).toBeNull();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});

describe("digital twin", () => {
  it("carries the faulted component into the twin, still selected and opened, with its residual shown", () => {
    state().setMode("health");
    state().introduceBearingFault();
    state().setBearingStage("anomaly");
    trackEvent.mockClear();
    state().viewInTwin();
    expect(state()).toMatchObject({ mode: "twin", component: "bearing_region", cutaway: "turbomachinery", residual: true, twinView: "compare", bearing: "anomaly", twinTime: 0 });
    expect(events()).toEqual(["rocket_twin_twin_open", "rocket_twin_compare_open"]);
  });

  it("reports the comparison, the prediction and Model Credibility", () => {
    state().openCompare();
    state().openCompare();
    state().openPrediction();
    state().openModelCredibility();
    expect(events()).toEqual(["rocket_twin_compare_open", "rocket_twin_prediction_open", "rocket_twin_model_credibility_open"]);
    expect(calls("rocket_twin_prediction_open")[0][1]).toEqual({ model_type: "reduced_order" });
  });

  it("scrubbing into the future is the prediction; back to now or the past is the comparison", () => {
    state().setTwinTime(-0.6);
    expect(state()).toMatchObject({ twinTime: -0.6, twinView: "compare" });
    for (let t = 0.1; t <= 1; t += 0.1) state().setTwinTime(t);
    expect(state().twinView).toBe("prediction");
    state().setTwinTime(0);
    expect(state().twinView).toBe("compare");
    state().setTwinTime(9);
    expect(state().twinTime).toBe(1);
    // A scrub is reported when it changes what is being looked at, not on every movement.
    expect(calls("rocket_twin_prediction_open")).toHaveLength(2);
    expect(calls("rocket_twin_compare_open")).toHaveLength(2);
  });

  it("reports the residual and model credibility when they are opened", () => {
    state().toggleResidual();
    state().toggleResidual();
    state().toggleCredibility();
    state().toggleCredibility();
    expect(events()).toEqual(["rocket_twin_residual_open", "rocket_twin_model_credibility_open"]);
  });
});

describe("architecture", () => {
  it("selects one layer at a time and reports it", () => {
    state().setMode("architecture");
    trackEvent.mockClear();
    state().selectLayer("sensors");
    state().selectLayer("control");
    state().selectLayer("control");
    expect(state().layer).toBeNull();
    expect(events()).toEqual(["rocket_twin_layer_select", "rocket_twin_layer_select"]);
    expect(calls("rocket_twin_layer_select")[0][1]).toEqual({ layer: "sensors" });
    state().toggleTraceability();
    expect(state().traceability).toBe(true);
  });
});

describe("guided engine tour", () => {
  /** Everything a stage sets, so two visits to the same stage can be compared. */
  const scene = () => {
    const { mode, system, component, cutaway, explodedAmount, engineOpen, flow, energyFlow, cameraPreset, layer, traceability, bearing, residual, twinView } = state();
    return { mode, system, component, cutaway, explodedAmount, engineOpen, flow, energyFlow, cameraPreset, layer, traceability, bearing: bearing !== null, residual, twinView, test: state().test.status };
  };
  const show = (stage: number) => {
    state().setTourStage(stage);
    state().applyTourStage(stage);
    return scene();
  };

  it("starts from the hero, entering the twin, and reports once", () => {
    state().startTour();
    state().startTour();
    expect(state()).toMatchObject({ entered: true, tour: { stage: 0, paused: false } });
    expect(calls("rocket_twin_tour_start")).toHaveLength(1);
    expect(calls("rocket_twin_enter")).toHaveLength(0);
  });

  it("shows the right thing at every one of its twelve stages", () => {
    state().startTour();
    const seen = TOUR_STAGES.map((_, i) => show(i));
    expect(seen.map((s) => s.mode)).toEqual(["engine", "build", "flow", "engine", "flow", "flow", "flow", "test", "control", "health", "twin", "architecture"]);
    expect(seen[1]).toMatchObject({ engineOpen: true, cutaway: "all" });
    expect(seen[2].flow).toBe("propellant");
    expect(seen[3]).toMatchObject({ component: "fuel_turbopump", cutaway: "turbomachinery", energyFlow: true });
    expect(seen[4]).toMatchObject({ flow: "hot_gas", cutaway: "combustion" });
    expect(seen[5]).toMatchObject({ flow: "cooling", cutaway: "regenerative_cooling" });
    expect(seen[6]).toMatchObject({ flow: "hot_gas", cutaway: "nozzle", cameraPreset: "nozzle" });
    expect(seen[7].test).toBe("running");
    expect(seen[9]).toMatchObject({ bearing: true, component: "bearing_region" });
    expect(seen[10]).toMatchObject({ bearing: true, residual: true, twinView: "compare" });
    expect(seen[11]).toMatchObject({ layer: "evidence", traceability: true });
  });

  it("is deterministic: a stage looks the same however it is reached", () => {
    state().startTour();
    const forward = TOUR_STAGES.map((_, i) => show(i));
    const backward = TOUR_STAGES.map((_, i) => show(TOUR_STAGES.length - 1 - i)).reverse();
    // Going back before the fault and the test undoes them, so the early stages match exactly.
    for (let i = 0; i < 7; i++) expect(backward[i], TOUR_STAGES[i].title).toEqual(forward[i]);
    expect(backward[4].bearing).toBe(false);
    expect(backward[2].test).toBe("idle");
  });

  it("pauses and resumes without moving", () => {
    state().startTour();
    state().setTourStage(3);
    state().toggleTourPause();
    expect(state().tour).toEqual({ stage: 3, paused: true });
    state().toggleTourPause();
    expect(state().tour).toEqual({ stage: 3, paused: false });
  });

  it("exits from any stage to a whole, quiet engine", () => {
    for (const stage of [1, 5, 7, 9, 10, 11]) {
      resetRocketTwinStore();
      state().startTour();
      show(stage);
      state().exitTour();
      expect(state(), TOUR_STAGES[stage].title).toMatchObject({ tour: null, entered: true, mode: "engine", component: null, cutaway: null, explodedAmount: 0, engineOpen: false, flow: null, energyFlow: false, bearing: null, residual: false, layer: null, cameraPreset: "engine_overview" });
      expect(state().test.status).not.toBe("running");
    }
  });

  it("reports whether the tour was finished or left", () => {
    state().startTour();
    state().setTourStage(4);
    state().exitTour();
    state().exitTour();
    state().startTour();
    state().setTourStage(TOUR_STAGES.length);
    expect(calls("rocket_twin_tour_complete")).toEqual([
      ["rocket_twin_tour_complete", { completion_status: "exited" }],
      ["rocket_twin_tour_complete", { completion_status: "completed" }],
    ]);
    expect(state().tour).toBeNull();
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
    s.introduceBearingFault();
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
    for (let i = 0; i < 4; i++) state().advanceTest();
    state().setThrottle(80);
    state().continueTest();
    for (let i = 0; i < 4; i++) state().advanceTest();
    for (const mode of MODES) state().setMode(mode.id);
    state().setAudience("engineer");
    for (const system of SYSTEMS) for (const component of system.components) state().selectComponent(component.id);
    state().toggleEngineOpen();
    state().toggleCutaway("turbomachinery");
    state().setExplodedAmount(1);
    state().selectFlow("propellant");
    for (const sensor of SENSORS) state().traceSensor(sensor.id);
    for (const fault of FAULTS) {
      state().startFault(fault.id);
      state().viewDiagnosis();
      state().completeFault();
    }
    state().introduceBearingFault();
    state().setBearingStage("diagnosis");
    state().viewInTwin();
    state().setTwinTime(0.7);
    state().toggleResidual();
    state().toggleCredibility();
    state().selectLayer("fdir");
    state().startTour();
    state().exitTour();

    expect(trackEvent.mock.calls.length).toBeGreaterThan(60);
    for (const [event, params] of trackEvent.mock.calls) {
      expect(event).toMatch(/^rocket_twin_[a-z_]+$/);
      for (const [key, value] of Object.entries(params ?? {})) {
        expect(key, event).toMatch(/^[a-z_]+$/);
        expect(value, `${event}.${key}`).toMatch(/^[a-z0-9_]{1,64}$/);
      }
    }
  });
});

describe("what the lightweight schematic shows", () => {
  it("highlights the selected system in Engine mode", () => {
    expect(stageView({ ...INITIAL_STATE, system: "nozzle" })).toMatchObject({ highlight: "nozzle", flow: null, sensors: false, firing: false });
  });

  it("keeps the exploded view and cutaway to Build mode", () => {
    const built = { ...INITIAL_STATE, explodedAmount: 1, cutaway: "combustion" as const };
    expect(stageView({ ...built, mode: "build" })).toMatchObject({ exploded: "components", cutaway: "combustion" });
    expect(stageView({ ...built, mode: "flow" })).toMatchObject({ exploded: "assembled", cutaway: null });
  });

  it("burns only in the firing phases of a running test", () => {
    const at = (name: string, status: "running" | "aborted" = "running") => stageView({ ...INITIAL_STATE, mode: "test", test: { status, phase: phaseIndex(name), hold: false } }).firing;
    expect(["system_check", "conditioning", "ready", "start", "mainstage", "throttle", "shutdown", "review"].map((p) => at(p))).toEqual([false, false, false, true, true, true, false, false]);
    expect(at("mainstage", "aborted")).toBe(false);
  });

  it("marks the faulted system until the scenario is complete", () => {
    const health = { ...INITIAL_STATE, mode: "health" as const };
    expect(stageView({ ...health, fault: { id: "cooling_channel_restriction", stage: "diagnosis" } }).alert).toBe("regenerative_cooling");
    expect(stageView({ ...health, fault: { id: "cooling_channel_restriction", stage: "complete" } }).alert).toBeNull();
  });

  it("says in one line what every mode is showing", () => {
    for (const mode of MODES) expect(stageCaption({ ...INITIAL_STATE, mode: mode.id }).length).toBeGreaterThan(8);
    expect(stageCaption({ ...INITIAL_STATE, mode: "engine", system: "nozzle" })).toBe("Engine · Rocket Nozzle");
    expect(stageCaption({ ...INITIAL_STATE, mode: "health", bearing: "anomaly" })).toBe("Engine Health Monitoring · bearing region · ANOMALY DETECTED");
  });
});
