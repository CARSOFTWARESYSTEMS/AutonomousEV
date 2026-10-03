// Interaction state for the Next-Generation Rocket Engine Digital Twin. Every
// control, and a 3D scene if one is mounted later, goes through these actions;
// an action reports its analytics event only when it actually changes
// something, so nothing is reported twice.
import { create } from "zustand";
import { MODE_OPEN_EVENT, type JourneyMilestone, trackRocketTwinEvent, trackRocketTwinOnce } from "../analytics";
import { COMPONENT_SYSTEM, FAULT_BY_ID, FIRING_PHASES, SENSORS, TEST_PHASES } from "../data/engineReference";
import type { AudienceMode, ComponentId, CutawaySystem, ExplodedLevel, FaultId, FaultStage, FlowId, ModeId, SensorId, SystemId, TestStatus, TwinView } from "../types";

export interface TwinState {
  entered: boolean;
  mode: ModeId;
  audience: AudienceMode;
  system: SystemId;
  component: ComponentId | null;
  cutaway: CutawaySystem | null;
  exploded: ExplodedLevel;
  flow: FlowId | null;
  sensor: SensorId | null;
  test: { status: TestStatus; phase: number };
  fault: { id: FaultId; stage: FaultStage } | null;
  twinView: TwinView | null;
}

export interface TwinActions {
  enter: () => void;
  runDemo: () => void;
  setMode: (mode: ModeId) => void;
  setAudience: (audience: AudienceMode) => void;
  selectSystem: (system: SystemId) => void;
  /** Opens Systems mode on one system: used by the system summaries further down the page. */
  exploreSystem: (system: SystemId) => void;
  selectComponent: (component: ComponentId) => void;
  toggleCutaway: (system: CutawaySystem) => void;
  setExploded: (level: ExplodedLevel) => void;
  selectFlow: (flow: FlowId) => void;
  traceSensor: (sensor: SensorId) => void;
  startTest: () => void;
  advanceTest: () => void;
  stopTest: () => void;
  startFault: (fault: FaultId) => void;
  viewDiagnosis: () => void;
  completeFault: () => void;
  openCompare: () => void;
  openPrediction: () => void;
  openModelCredibility: () => void;
}

export const INITIAL_STATE: TwinState = {
  entered: false,
  mode: "systems",
  audience: "learn",
  system: "turbomachinery",
  component: null,
  cutaway: null,
  exploded: "assembled",
  flow: null,
  sensor: null,
  test: { status: "idle", phase: 0 },
  fault: null,
  twinView: null,
};

const milestone = (name: JourneyMilestone) => trackRocketTwinOnce("rocket_twin_journey_milestone", { milestone: name });

export const useRocketTwinStore = create<TwinState & TwinActions>((set, get) => ({
  ...INITIAL_STATE,

  enter: () => {
    if (get().entered) return;
    set({ entered: true });
    trackRocketTwinEvent("rocket_twin_enter");
    milestone("entered");
  },

  runDemo: () => {
    const running = get().test.status === "running";
    if (!running) trackRocketTwinEvent("rocket_twin_demo_start");
    get().setMode("test");
    get().startTest();
  },

  setMode: (mode) => {
    if (get().mode === mode) return;
    set({ mode });
    trackRocketTwinEvent(MODE_OPEN_EVENT[mode]);
  },

  setAudience: (audience) => {
    if (get().audience === audience) return;
    set({ audience });
    trackRocketTwinEvent("rocket_twin_audience_mode", { mode: audience });
  },

  selectSystem: (system) => {
    if (get().system === system) return;
    set({ system, component: null });
  },

  exploreSystem: (system) => {
    get().selectSystem(system);
    get().setMode("systems");
  },

  selectComponent: (component) => {
    const s = get();
    if (s.component === component) return;
    const system = COMPONENT_SYSTEM[component];
    set({ system, component });
    trackRocketTwinEvent("rocket_twin_component_select", { component_id: component, system, mode: s.mode, audience_mode: s.audience });
    milestone("first_component");
  },

  toggleCutaway: (system) => {
    if (get().cutaway === system) {
      set({ cutaway: null });
      return;
    }
    set({ cutaway: system });
    trackRocketTwinEvent("rocket_twin_cutaway", { system });
  },

  setExploded: (level) => {
    if (get().exploded === level) return;
    set({ exploded: level });
    trackRocketTwinEvent("rocket_twin_exploded_view", { level });
  },

  selectFlow: (flow) => {
    if (get().flow === flow) return;
    set({ flow });
    trackRocketTwinEvent("rocket_twin_flow_select", { flow_type: flow });
    milestone("first_flow");
  },

  traceSensor: (sensor) => {
    if (get().sensor === sensor) return;
    const definition = SENSORS.find((s) => s.id === sensor);
    if (!definition) return;
    set({ sensor });
    trackRocketTwinEvent("rocket_twin_sensor_trace", { sensor_type: definition.type, system: definition.system });
  },

  startTest: () => {
    if (get().test.status === "running") return;
    set({ test: { status: "running", phase: 0 } });
    trackRocketTwinEvent("rocket_twin_test_start");
    trackRocketTwinEvent("rocket_twin_test_phase", { phase: TEST_PHASES[0].id });
    milestone("first_test");
  },

  advanceTest: () => {
    const { test } = get();
    if (test.status !== "running") return;
    const next = test.phase + 1;
    if (next < TEST_PHASES.length) {
      set({ test: { status: "running", phase: next } });
      trackRocketTwinEvent("rocket_twin_test_phase", { phase: TEST_PHASES[next].id });
      return;
    }
    set({ test: { status: "completed", phase: test.phase } });
    trackRocketTwinEvent("rocket_twin_test_complete", { completion_status: "completed" });
    milestone("test_complete");
  },

  stopTest: () => {
    const { test } = get();
    if (test.status !== "running") return;
    set({ test: { status: "aborted", phase: test.phase } });
    trackRocketTwinEvent("rocket_twin_test_complete", { completion_status: "aborted" });
  },

  startFault: (fault) => {
    const current = get().fault;
    if (current?.id === fault && current.stage === "symptom") return;
    set({ fault: { id: fault, stage: "symptom" } });
    trackRocketTwinEvent("rocket_twin_fault_start", { fault_type: fault, system: FAULT_BY_ID[fault].system });
    milestone("first_fault");
  },

  viewDiagnosis: () => {
    const fault = get().fault;
    if (fault?.stage !== "symptom") return;
    set({ fault: { id: fault.id, stage: "diagnosis" } });
    trackRocketTwinEvent("rocket_twin_fault_diagnosis_view", { fault_type: fault.id });
  },

  completeFault: () => {
    const fault = get().fault;
    if (fault?.stage !== "diagnosis") return;
    set({ fault: { id: fault.id, stage: "complete" } });
    trackRocketTwinEvent("rocket_twin_fault_complete", { fault_type: fault.id });
  },

  openCompare: () => {
    if (get().twinView === "compare") return;
    set({ twinView: "compare" });
    trackRocketTwinEvent("rocket_twin_compare_open");
    milestone("first_twin_comparison");
  },

  openPrediction: () => {
    if (get().twinView === "prediction") return;
    set({ twinView: "prediction" });
    trackRocketTwinEvent("rocket_twin_prediction_open", { model_type: "reduced_order" });
  },

  // A link to the Model Credibility section of the page: nothing to change here.
  openModelCredibility: () => trackRocketTwinEvent("rocket_twin_model_credibility_open"),
}));

/** Back to the opening state. For tests. */
export function resetRocketTwinStore(): void {
  useRocketTwinStore.setState(INITIAL_STATE);
}

// ── What the schematic shows for a given state ──────────────────────────────

export interface StageView {
  /** System drawn at full strength while the rest recede. */
  highlight: SystemId | null;
  /** System drawn in the caution colour (an active fault scenario). */
  alert: SystemId | null;
  flow: FlowId | null;
  cutaway: CutawaySystem | null;
  exploded: ExplodedLevel;
  sensors: boolean;
  sensor: SensorId | null;
  firing: boolean;
}

export function stageView(s: TwinState): StageView {
  const view: StageView = { highlight: null, alert: null, flow: null, cutaway: null, exploded: "assembled", sensors: false, sensor: null, firing: false };
  switch (s.mode) {
    case "build":
      return { ...view, cutaway: s.cutaway, exploded: s.exploded, highlight: s.cutaway };
    case "systems":
      return { ...view, highlight: s.system };
    case "flow":
      return { ...view, flow: s.flow, sensors: s.flow === "data" };
    case "control":
      return { ...view, sensors: true, sensor: s.sensor };
    case "test":
      return { ...view, firing: s.test.status === "running" && FIRING_PHASES.includes(TEST_PHASES[s.test.phase].id) };
    case "health":
      return { ...view, alert: s.fault && s.fault.stage !== "complete" ? FAULT_BY_ID[s.fault.id].system : null, sensors: true };
    case "twin":
      return view;
  }
}
