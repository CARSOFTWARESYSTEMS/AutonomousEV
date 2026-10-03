// Interaction state for the Next-Generation Rocket Engine Digital Twin: what is
// selected, opened, flowing, running or compared. The 3D scene, the interface
// laid over it and the lightweight console all go through these actions, and an
// action reports its analytics event only when it actually changes something.
//
// Per-frame values (rotation, flow intensity, fault severity) do not live here:
// they are in scene/frameState.ts, written by the simulation driver.
import { create } from "zustand";
import { MODE_OPEN_EVENT, type JourneyMilestone, trackRocketTwinEvent, trackRocketTwinOnce } from "../analytics";
import { COMPONENT_SYSTEM, FAULT_BY_ID, FIRING_PHASES, SENSORS, TEST_PHASES } from "../data/engineReference";
import { COMPONENT_VIEW, SYSTEM_VIEW, TOUR_STAGES } from "../data/twinContent";
import type {
  ArchitectureLayer,
  Atmosphere,
  AudienceMode,
  BearingStage,
  CameraPresetId,
  ComponentId,
  CutawaySystem,
  CutawayTarget,
  ExplodedLevel,
  FaultId,
  FaultStage,
  FlowId,
  ModeId,
  SensorId,
  SensorType,
  SignalView,
  SystemId,
  TestStatus,
  Throttle,
  TwinView,
} from "../types";

export interface TwinState {
  entered: boolean;
  mode: ModeId;
  audience: AudienceMode;
  system: SystemId;
  component: ComponentId | null;
  /** A whole system has been chosen, so the rest of the engine recedes. */
  systemFocus: boolean;
  hovered: ComponentId | null;
  /** The camera has gone in close on the selected component. */
  focused: boolean;
  cameraPreset: CameraPresetId;
  /** Bumped to send the camera to its preset again. */
  cameraNonce: number;
  cutaway: CutawayTarget;
  /** 0 assembled – 1 exploded. The first half separates assemblies, the second their components. */
  explodedAmount: number;
  engineOpen: boolean;
  flow: FlowId | null;
  pressure: boolean;
  /** Cooling comparison: the wall with and, briefly, without its coolant. */
  cooled: boolean;
  energyFlow: boolean;
  atmosphere: Atmosphere;
  sensor: SensorId | null;
  sensorFilter: SensorType | null;
  tracing: boolean;
  test: { status: TestStatus; phase: number; hold: boolean };
  /** A throttle level the user chose; null while the demonstration steps through its own. */
  throttle: Throttle | null;
  fault: { id: FaultId; stage: FaultStage } | null;
  /** The bearing degradation scenario, once introduced. Its severity is a per-frame value. */
  bearing: BearingStage | null;
  signalView: SignalView;
  healthSystem: SystemId | null;
  twinView: TwinView | null;
  /** -1 the past, 0 now, +1 the predicted future. */
  twinTime: number;
  residual: boolean;
  credibility: boolean;
  layer: ArchitectureLayer | null;
  traceability: boolean;
  tour: { stage: number; paused: boolean } | null;
  sceneReady: boolean;
  reducedMotion: boolean;
}

export interface TwinActions {
  enter: () => void;
  runDemo: () => void;
  setMode: (mode: ModeId) => void;
  setAudience: (audience: AudienceMode) => void;
  selectSystem: (system: SystemId) => void;
  /** Opens Engine mode on one system: used by the system summaries further down the page. */
  exploreSystem: (system: SystemId) => void;
  selectComponent: (component: ComponentId | null) => void;
  focusComponent: (component: ComponentId) => void;
  setHovered: (component: ComponentId | null) => void;
  backToSystem: () => void;
  backToEngine: () => void;
  setCamera: (preset: CameraPresetId) => void;
  toggleCutaway: (target: CutawaySystem | "all") => void;
  setExplodedAmount: (amount: number) => void;
  /** The three steps of the lightweight console. */
  setExploded: (level: ExplodedLevel) => void;
  toggleEngineOpen: () => void;
  selectFlow: (flow: FlowId | null) => void;
  togglePressure: () => void;
  runCoolingComparison: () => void;
  restoreCooling: () => void;
  toggleEnergyFlow: () => void;
  setAtmosphere: (atmosphere: Atmosphere) => void;
  setSensorFilter: (type: SensorType | null) => void;
  selectSensor: (sensor: SensorId | null) => void;
  traceSensor: (sensor: SensorId) => void;
  startTest: () => void;
  advanceTest: () => void;
  stopTest: () => void;
  setThrottle: (level: Throttle) => void;
  continueTest: () => void;
  startFault: (fault: FaultId) => void;
  viewDiagnosis: () => void;
  completeFault: () => void;
  introduceBearingFault: () => void;
  setBearingStage: (stage: BearingStage) => void;
  clearBearingFault: () => void;
  setSignalView: (view: SignalView) => void;
  setHealthSystem: (system: SystemId | null) => void;
  viewInTwin: () => void;
  openCompare: () => void;
  openPrediction: () => void;
  openModelCredibility: () => void;
  setTwinTime: (tau: number) => void;
  toggleResidual: () => void;
  toggleCredibility: () => void;
  selectLayer: (layer: ArchitectureLayer | null) => void;
  toggleTraceability: () => void;
  startTour: () => void;
  setTourStage: (stage: number) => void;
  /** Puts the scene in the state a tour stage shows. The same stage always gives the same scene. */
  applyTourStage: (stage: number) => void;
  toggleTourPause: () => void;
  exitTour: (completed?: boolean) => void;
  setSceneReady: (ready: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const INITIAL_STATE: TwinState = {
  entered: false,
  mode: "engine",
  audience: "learn",
  system: "turbomachinery",
  component: null,
  systemFocus: false,
  hovered: null,
  focused: false,
  cameraPreset: "hero",
  cameraNonce: 0,
  cutaway: null,
  explodedAmount: 0,
  engineOpen: false,
  flow: null,
  pressure: false,
  cooled: true,
  energyFlow: false,
  atmosphere: "sea_level",
  sensor: null,
  sensorFilter: null,
  tracing: false,
  test: { status: "idle", phase: 0, hold: false },
  throttle: null,
  fault: null,
  bearing: null,
  signalView: "time",
  healthSystem: null,
  twinView: null,
  twinTime: 0,
  residual: false,
  credibility: false,
  layer: null,
  traceability: false,
  tour: null,
  sceneReady: false,
  reducedMotion: false,
};

/** What each stage of the Guided Engine Tour shows, in the order of TOUR_STAGES. */
const TOUR_SCRIPT: readonly { set: Partial<TwinState>; camera: CameraPresetId; run?: "test" | "fault" | "twin" }[] = [
  { set: { mode: "engine" }, camera: "engine_overview" },
  { set: { mode: "build", engineOpen: true, explodedAmount: 0.5, cutaway: "all" }, camera: "open_engine" },
  { set: { mode: "flow", flow: "propellant" }, camera: "feed_overview" },
  { set: { mode: "engine", system: "turbomachinery", component: "fuel_turbopump", systemFocus: true, cutaway: "turbomachinery", energyFlow: true }, camera: "pump_close" },
  { set: { mode: "flow", flow: "hot_gas", cutaway: "combustion" }, camera: "chamber_cutaway" },
  { set: { mode: "flow", flow: "cooling", cutaway: "regenerative_cooling" }, camera: "cooling_channel" },
  { set: { mode: "flow", flow: "hot_gas", cutaway: "nozzle" }, camera: "nozzle" },
  { set: { mode: "test" }, camera: "test_stand", run: "test" },
  { set: { mode: "control" }, camera: "sensor_network" },
  { set: { mode: "health", healthSystem: "turbomachinery" }, camera: "bearing_close", run: "fault" },
  { set: { mode: "twin" }, camera: "digital_twin", run: "twin" },
  { set: { mode: "architecture", layer: "evidence", traceability: true }, camera: "architecture" },
];
const TEST_STAGE = 7;
const FAULT_STAGE = 9;

/** The view each mode opens on. */
const MODE_VIEW: Record<ModeId, CameraPresetId> = {
  engine: "engine_overview",
  build: "engine_overview",
  flow: "feed_overview",
  control: "sensor_network",
  test: "test_stand",
  health: "health",
  twin: "digital_twin",
  architecture: "architecture",
};

export const explodedLevel = (amount: number): ExplodedLevel => (amount < 0.2 ? "assembled" : amount < 0.75 ? "assemblies" : "components");
const LEVEL_AMOUNT: Record<ExplodedLevel, number> = { assembled: 0, assemblies: 0.5, components: 1 };

/** A mode owns its overlays: changing mode puts the engine back together. */
const CLEAN = {
  component: null,
  systemFocus: false,
  focused: false,
  hovered: null,
  sensor: null,
  tracing: false,
  energyFlow: false,
  cooled: true,
  engineOpen: false,
  explodedAmount: 0,
  cutaway: null,
  flow: null,
  pressure: false,
  layer: null,
  credibility: false,
} satisfies Partial<TwinState>;

const milestone = (name: JourneyMilestone) => trackRocketTwinOnce("rocket_twin_journey_milestone", { milestone: name });

export const useRocketTwinStore = create<TwinState & TwinActions>((set, get) => {
  const camera = (preset: CameraPresetId) => set((s) => ({ cameraPreset: preset, cameraNonce: s.cameraNonce + 1 }));

  return {
    ...INITIAL_STATE,

    enter: () => {
      if (get().entered) return;
      set({ entered: true });
      camera("engine_overview");
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
      const s = get();
      if (s.mode === mode) return;
      set({ ...CLEAN, mode });
      if (mode === "twin") set({ residual: get().bearing !== null, twinTime: 0 });
      camera(MODE_VIEW[mode]);
      trackRocketTwinEvent(MODE_OPEN_EVENT[mode]);
    },

    setAudience: (audience) => {
      if (get().audience === audience) return;
      set({ audience });
      trackRocketTwinEvent("rocket_twin_audience_mode", { mode: audience });
    },

    selectSystem: (system) => {
      if (get().system === system && get().component === null && get().systemFocus) return;
      set({ system, component: null, focused: false, systemFocus: true });
      camera(SYSTEM_VIEW[system]);
    },

    exploreSystem: (system) => {
      set({ entered: true });
      get().setMode("engine");
      get().selectSystem(system);
    },

    selectComponent: (component) => {
      const s = get();
      if (component === null) {
        if (s.component === null) return;
        set({ component: null, focused: false });
        return;
      }
      if (s.component === component) return;
      const system = COMPONENT_SYSTEM[component];
      set({ system, component, systemFocus: true, focused: false, sensor: null, tracing: false });
      camera(SYSTEM_VIEW[system]);
      trackRocketTwinEvent("rocket_twin_component_select", { component_id: component, system, mode: s.mode, audience_mode: s.audience });
      milestone("first_component");
    },

    focusComponent: (component) => {
      get().selectComponent(component);
      set({ focused: true });
      camera(COMPONENT_VIEW[component] ?? SYSTEM_VIEW[COMPONENT_SYSTEM[component]]);
    },

    setHovered: (component) => {
      if (get().hovered !== component) set({ hovered: component });
    },

    backToSystem: () => {
      set({ focused: false });
      camera(SYSTEM_VIEW[get().system]);
    },

    backToEngine: () => {
      const s = get();
      set({ component: null, systemFocus: false, focused: false, sensor: null, tracing: false, energyFlow: false, healthSystem: null });
      camera(MODE_VIEW[s.mode]);
    },

    setCamera: camera,

    toggleCutaway: (target) => {
      if (get().cutaway === target) {
        set({ cutaway: null });
        return;
      }
      set({ cutaway: target });
      if (target !== "all") trackRocketTwinEvent("rocket_twin_cutaway", { system: target });
    },

    setExplodedAmount: (amount) => {
      const next = Math.min(1, Math.max(0, amount));
      const before = explodedLevel(get().explodedAmount);
      set({ explodedAmount: next });
      // A slider is reported when it crosses into another level, not on every movement.
      const level = explodedLevel(next);
      if (level === before) return;
      // Taken apart, the engine is larger than it was: the camera steps back to keep all of it in view.
      camera(level === "assembled" ? "engine_overview" : "open_engine");
      trackRocketTwinEvent("rocket_twin_exploded_view", { level });
    },

    setExploded: (level) => get().setExplodedAmount(LEVEL_AMOUNT[level]),

    toggleEngineOpen: () => {
      const open = !get().engineOpen;
      set({ engineOpen: open, explodedAmount: open ? 0.5 : 0, cutaway: open ? "all" : null, component: null, focused: false });
      camera(open ? "open_engine" : "engine_overview");
      if (open) trackRocketTwinEvent("rocket_twin_open_engine");
    },

    selectFlow: (flow) => {
      const s = get();
      if (s.flow === flow) return;
      // Cooling is taught through the wall, so it opens the chamber; hot gas shows the gas side of it.
      set({ flow, cooled: true, cutaway: flow === "cooling" ? "regenerative_cooling" : flow === "hot_gas" ? "combustion" : null, pressure: flow === "propellant" || flow === "cooling" ? s.pressure : false });
      camera(flow === "cooling" ? "cooling_channel" : flow === "hot_gas" ? "chamber_cutaway" : flow === "data" ? "sensor_network" : "feed_overview");
      if (!flow) return;
      trackRocketTwinEvent("rocket_twin_flow_select", { flow_type: flow });
      milestone("first_flow");
    },

    togglePressure: () => set((s) => ({ pressure: !s.pressure })),

    runCoolingComparison: () => {
      if (get().cooled) set({ cooled: false });
    },

    restoreCooling: () => {
      if (!get().cooled) set({ cooled: true });
    },

    toggleEnergyFlow: () => {
      const on = !get().energyFlow;
      set({ energyFlow: on, cutaway: on ? "turbomachinery" : get().cutaway });
      if (on) camera("pump_close");
    },

    setAtmosphere: (atmosphere) => set({ atmosphere }),

    setSensorFilter: (type) => set((s) => ({ sensorFilter: s.sensorFilter === type ? null : type, sensor: null, tracing: false })),

    selectSensor: (sensor) => {
      if (get().sensor === sensor) return;
      set({ sensor, tracing: false });
    },

    traceSensor: (sensor) => {
      const s = get();
      if (s.sensor === sensor && s.tracing) return;
      const definition = SENSORS.find((x) => x.id === sensor);
      if (!definition) return;
      set({ sensor, tracing: true });
      camera("sensor_network");
      trackRocketTwinEvent("rocket_twin_sensor_trace", { sensor_type: definition.type, system: definition.system });
    },

    startTest: () => {
      if (get().test.status === "running") return;
      set({ test: { status: "running", phase: 0, hold: false }, throttle: null });
      trackRocketTwinEvent("rocket_twin_test_start");
      trackRocketTwinEvent("rocket_twin_test_phase", { phase: TEST_PHASES[0].id });
      milestone("first_test");
    },

    advanceTest: () => {
      const { test } = get();
      if (test.status !== "running" || test.hold) return;
      const next = test.phase + 1;
      if (next < TEST_PHASES.length) {
        set({ test: { status: "running", phase: next, hold: false }, throttle: null });
        trackRocketTwinEvent("rocket_twin_test_phase", { phase: TEST_PHASES[next].id });
        return;
      }
      set({ test: { status: "completed", phase: test.phase, hold: false } });
      trackRocketTwinEvent("rocket_twin_test_complete", { completion_status: "completed" });
      milestone("test_complete");
    },

    stopTest: () => {
      const { test } = get();
      if (test.status !== "running") return;
      set({ test: { status: "aborted", phase: test.phase, hold: false }, throttle: null });
      trackRocketTwinEvent("rocket_twin_test_complete", { completion_status: "aborted" });
    },

    setThrottle: (level) => {
      const { test, throttle } = get();
      if (test.status !== "running" || !FIRING_PHASES.includes(TEST_PHASES[test.phase].id) || TEST_PHASES[test.phase].id === "start") return;
      if (throttle === level) return;
      // Choosing a level takes over from the demonstration and holds the test at the throttle phase.
      const phase = TEST_PHASES.findIndex((p) => p.id === "throttle");
      if (test.phase !== phase) trackRocketTwinEvent("rocket_twin_test_phase", { phase: "throttle" });
      set({ throttle: level, test: { status: "running", phase, hold: true } });
      trackRocketTwinEvent("rocket_twin_throttle", { level: String(level) as "40" | "60" | "80" | "100" });
    },

    continueTest: () => {
      const { test } = get();
      if (!test.hold) return;
      set({ test: { ...test, hold: false } });
      get().advanceTest();
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

    introduceBearingFault: () => {
      if (get().bearing !== null) return;
      // The fault is shown where it happens: inside the fuel turbopump, opened.
      set({ bearing: "healthy", system: "turbomachinery", component: "bearing_region", focused: true, cutaway: "turbomachinery", healthSystem: "turbomachinery", sensor: null, tracing: false });
      camera("bearing_close");
      trackRocketTwinEvent("rocket_twin_fault_start", { fault_type: "turbopump_bearing_wear", system: "turbomachinery" });
      milestone("first_fault");
    },

    setBearingStage: (stage) => {
      const current = get().bearing;
      if (current === null || current === stage) return;
      set({ bearing: stage });
      if (stage === "diagnosis") trackRocketTwinEvent("rocket_twin_fault_diagnosis_view", { fault_type: "turbopump_bearing_wear" });
    },

    clearBearingFault: () => {
      if (get().bearing === null) return;
      set({ bearing: null, residual: false });
      trackRocketTwinEvent("rocket_twin_fault_complete", { fault_type: "turbopump_bearing_wear" });
    },

    setSignalView: (view) => set({ signalView: view }),

    setHealthSystem: (system) => {
      set({ healthSystem: system, component: null, focused: false, sensor: null, tracing: false });
      camera(system ? SYSTEM_VIEW[system] : "health");
    },

    viewInTwin: () => {
      get().setMode("twin");
      // The same component stays selected, opened, in the twin.
      set({ system: "turbomachinery", component: "bearing_region", cutaway: "turbomachinery", residual: true });
      get().openCompare();
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

    // In the lightweight console this is a link to the Model Credibility section of the page.
    openModelCredibility: () => trackRocketTwinEvent("rocket_twin_model_credibility_open"),

    setTwinTime: (tau) => {
      const next = Math.min(1, Math.max(-1, tau));
      const s = get();
      set({ twinTime: next });
      // Looking ahead is the prediction; looking back or at now is the comparison.
      if (next > 0.02 && s.twinView !== "prediction") get().openPrediction();
      else if (next <= 0.02 && s.twinView !== "compare") get().openCompare();
    },

    toggleResidual: () => {
      const on = !get().residual;
      set({ residual: on });
      if (on) trackRocketTwinEvent("rocket_twin_residual_open");
    },

    toggleCredibility: () => {
      const on = !get().credibility;
      set({ credibility: on });
      if (on) trackRocketTwinEvent("rocket_twin_model_credibility_open");
    },

    selectLayer: (layer) => {
      if (get().layer === layer) {
        set({ layer: null });
        return;
      }
      set({ layer });
      if (layer) trackRocketTwinEvent("rocket_twin_layer_select", { layer });
    },

    toggleTraceability: () => set((s) => ({ traceability: !s.traceability })),

    startTour: () => {
      if (get().tour) return;
      set({ entered: true, tour: { stage: 0, paused: false } });
      trackRocketTwinEvent("rocket_twin_tour_start");
    },

    setTourStage: (stage) => {
      const tour = get().tour;
      if (!tour) return;
      if (stage >= TOUR_STAGES.length) {
        get().exitTour(true);
        return;
      }
      set({ tour: { stage: Math.max(0, stage), paused: tour.paused } });
    },

    toggleTourPause: () => {
      const tour = get().tour;
      if (tour) set({ tour: { ...tour, paused: !tour.paused } });
    },

    exitTour: (completed = false) => {
      if (!get().tour) return;
      // Leaving the tour leaves a whole, quiet engine behind: nothing half-open or half-run.
      const test = get().test;
      set({ ...CLEAN, mode: "engine", tour: null, bearing: null, residual: false, twinTime: 0, test: test.status === "running" ? { status: "aborted", phase: test.phase, hold: false } : test, throttle: null });
      camera("engine_overview");
      trackRocketTwinEvent("rocket_twin_tour_complete", { completion_status: completed ? "completed" : "exited" });
    },

    applyTourStage: (stage) => {
      const script = TOUR_SCRIPT[stage];
      if (!script || !get().tour) return;
      const test = get().test;
      set({
        ...CLEAN,
        // A stage is the same scene however it is reached, so nothing is carried over from another stage.
        system: INITIAL_STATE.system,
        healthSystem: null,
        sensorFilter: null,
        twinView: null,
        atmosphere: "sea_level",
        signalView: "time",
        traceability: false,
        twinTime: 0,
        // Earlier stages come before the fault and the test, so going back undoes them.
        bearing: stage < FAULT_STAGE ? null : get().bearing,
        residual: false,
        test: stage < TEST_STAGE ? { status: "idle", phase: 0, hold: false } : test,
        throttle: null,
        ...script.set,
      });
      camera(script.camera);
      if (script.run === "test" && get().test.status !== "running") {
        // The tour joins the test at the start command: the checks before it are shown in Test mode.
        const phase = TEST_PHASES.findIndex((p) => p.id === "start");
        set({ test: { status: "running", phase, hold: false } });
        trackRocketTwinEvent("rocket_twin_test_start");
        trackRocketTwinEvent("rocket_twin_test_phase", { phase: "start" });
        milestone("first_test");
      }
      if (script.run === "fault") get().introduceBearingFault();
      if (script.run === "twin") {
        if (get().bearing === null) get().introduceBearingFault();
        set({ system: "turbomachinery", component: "bearing_region", cutaway: "turbomachinery", residual: true, focused: false });
        camera("digital_twin");
        get().openCompare();
      }
    },

    setSceneReady: (ready) => set({ sceneReady: ready }),
    setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  };
});

/** Back to the opening state. For tests, and when the application is left. */
export function resetRocketTwinStore(): void {
  useRocketTwinStore.setState(INITIAL_STATE);
}

// ── What the lightweight schematic shows for a given state ──────────────────

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
  const cutaway = s.cutaway === "all" ? null : s.cutaway;
  switch (s.mode) {
    case "build":
      return { ...view, cutaway, exploded: explodedLevel(s.explodedAmount), highlight: cutaway };
    case "engine":
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
    case "architecture":
      return { ...view, sensors: true, flow: "data" };
  }
}
