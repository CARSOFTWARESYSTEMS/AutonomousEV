// UFlight™ 3D state. Interaction state lives here; per-frame simulation values
// live in simClock and the render loop, and are mirrored into `telemetry` at a
// throttled rate so React never re-renders once per frame.
import { create } from "zustand";
import type {
  ActiveFaultScenarioId,
  AudienceMode,
  ComponentId,
  EnvironmentId,
  ExplodedLevel,
  FaultStage,
  FlightConfig,
  HealthState,
  HealthView,
  MissionPhase,
  MissionProfile,
  MonitoredSystemId,
  NetworkFilter,
  SensorCategory,
  SignalDomain,
  SystemId,
  UFlightMode,
  UFlightTwinState,
  VehicleState,
  ViewPreset,
  XrayFilter,
} from "../types";
import { type QualitySettings, selectQuality } from "../../satellite-explorer/lib/capabilities";
import { COMPONENTS } from "../data/componentDefinitions";
import { getSensor } from "../data/sensorDefinitions";
import { MONITORED_SYSTEMS } from "../data/uflightReferenceAircraft";
import { trackEvent } from "@/utils/analytics";
import { type FaultEvent, STAGE_SEVERITY, faultReducer } from "../simulation/faultModels";
import { type HealthInputs, type HealthSnapshot, NO_FAULTS, buildHealthSnapshot } from "../simulation/hums";
import { type FlightState, type MissionEvent, awaitingAuthorization, groundState, missionFaultAt, missionReducer, stageAt } from "../simulation/mission";
import { HORIZON_CYCLES } from "../simulation/prognostics";
import type { CameraPresetId } from "../scene/cameraPresets";
import { cameraPresetFor, environmentFor } from "./selectors";
import { nowS, resetSimClock, simClock } from "./simClock";

export type ArchitectureView = "data" | "redundancy" | "navigation";

/** Throttled mirror of simulation output for the interface. All values are SIMULATED. */
export interface Telemetry {
  flight: FlightState;
  /** What the health snapshot was computed from; the twin re-evaluates it at other times. */
  inputs: HealthInputs;
  snapshot: HealthSnapshot;
  missionTimeS: number;
  /** Progress through the current mission stage, 0–1. */
  stageProgress: number;
  awaitingAuthorization: boolean;
}

const INITIAL_FLIGHT = groundState("IDLE", "studio");
const INITIAL_INPUTS: HealthInputs = { missionTimeS: 0, missionPhase: "IDLE", config: "ground", flight: INITIAL_FLIGHT, faults: NO_FAULTS };

/** Health of the aircraft as released: the pre-flight side of the post-flight comparison. */
export const PREFLIGHT_SNAPSHOT: HealthSnapshot = buildHealthSnapshot(INITIAL_INPUTS);

export const INITIAL_TELEMETRY: Telemetry = {
  flight: INITIAL_FLIGHT,
  inputs: INITIAL_INPUTS,
  snapshot: PREFLIGHT_SNAPSHOT,
  missionTimeS: 0,
  stageProgress: 0,
  awaitingAuthorization: false,
};

const healthStatesOf = (twin: UFlightTwinState) => Object.fromEntries(MONITORED_SYSTEMS.map((id) => [id, twin.systems[id].state])) as Record<MonitoredSystemId, HealthState>;

export interface UFlightState {
  /** False while the opening screen is shown. */
  started: boolean;
  mode: UFlightMode;
  audienceMode: AudienceMode;
  selectedSystem: SystemId | null;
  selectedComponent: ComponentId | null;
  hoveredComponent: ComponentId | null;
  isolatedComponent: ComponentId | null;
  xrayEnabled: boolean;
  xrayFilter: XrayFilter;
  explodedLevel: ExplodedLevel;
  /** 0 = assembled, 1 = fully exploded. */
  explodedAmount: number;
  viewPreset: ViewPreset;
  flightConfig: FlightConfig;
  showDependencies: boolean;

  healthView: HealthView;
  sensorCategory: SensorCategory;
  selectedSensor: string | null;
  hoveredSensor: string | null;
  /** HUMS layer highlighted in the architecture view, 1–6. */
  humsLayer: number | null;
  /** A sensor whose signal is being followed through the health pipeline. */
  trace: { sensorId: string; startedAt: number } | null;

  architectureView: ArchitectureView;
  networkFilter: NetworkFilter;
  fccBFailed: boolean;
  gnssUnavailable: boolean;

  missionProfile: MissionProfile;
  missionStage: MissionPhase;
  missionPlaying: boolean;
  missionAuthorized: boolean;
  /** Seconds since the mission started. */
  missionTime: number;

  faultScenario: ActiveFaultScenarioId | null;
  faultStage: FaultStage;
  faultPlaying: boolean;
  /** Severity of the active fault, 0–1. Simulated. */
  faultSeverity: number;
  signalDomain: SignalDomain;

  twinSystem: MonitoredSystemId;
  /** Flight cycles from now on the twin's time control: negative is history, positive is prediction. */
  predictionTime: number;

  environment: EnvironmentId;
  cameraPreset: CameraPresetId;
  /** Incremented to re-run a camera move to the same preset. */
  cameraNonce: number;

  healthStates: Record<MonitoredSystemId, HealthState>;
  vehicleState: VehicleState;
  sensorValues: Record<string, number>;
  digitalTwinState: UFlightTwinState;
  telemetry: Telemetry;

  helpOpen: boolean;
  /** The "Prepared by" panel. */
  aboutOpen: boolean;
  reducedMotion: boolean;
  quality: QualitySettings;
  /** Set once the scene has drawn its first frames. */
  sceneReady: boolean;

  start: () => void;
  runHealthDemo: () => void;
  setMode: (mode: Exclude<UFlightMode, "hero">) => void;
  setAudienceMode: (mode: AudienceMode) => void;
  selectSystem: (system: SystemId | null) => void;
  selectComponent: (id: ComponentId | null) => void;
  isolateComponent: (id: ComponentId | null) => void;
  setHovered: (id: ComponentId | null) => void;
  toggleXray: () => void;
  setXrayFilter: (filter: XrayFilter) => void;
  setExplodedAmount: (amount: number) => void;
  setExplodedLevel: (level: ExplodedLevel) => void;
  setViewPreset: (preset: ViewPreset) => void;
  setFlightConfig: (config: FlightConfig) => void;
  toggleDependencies: () => void;

  setHealthView: (view: HealthView) => void;
  setSensorCategory: (category: SensorCategory) => void;
  selectSensor: (id: string | null) => void;
  setHoveredSensor: (id: string | null) => void;
  setHumsLayer: (layer: number | null) => void;
  startTrace: (sensorId: string) => void;
  stopTrace: () => void;

  setArchitectureView: (view: ArchitectureView) => void;
  setNetworkFilter: (filter: NetworkFilter) => void;
  toggleChannelFailure: () => void;
  toggleGnss: () => void;

  runMission: (profile: MissionProfile) => void;
  missionDispatch: (event: MissionEvent) => void;
  startFault: (scenario: ActiveFaultScenarioId, autoplay?: boolean) => void;
  faultDispatch: (event: FaultEvent) => void;
  clearFault: () => void;
  setSignalDomain: (domain: SignalDomain) => void;
  viewTwin: (system: MonitoredSystemId) => void;
  setTwinSystem: (system: MonitoredSystemId) => void;
  setPredictionTime: (cycles: number) => void;

  goBack: () => void;
  reset: () => void;
  setHelpOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  setEnvironment: (patch: Partial<Pick<UFlightState, "quality" | "reducedMotion">>) => void;
  setSceneReady: (ready: boolean) => void;
  /** Called by the render loop: mirrors the clocks and the latest simulation output. */
  syncSimulation: (telemetry: Telemetry) => void;
}

const DEFAULT_QUALITY = selectQuality({ devicePixelRatio: 1, webgl2: true, softwareRenderer: false });

type Data = Omit<
  UFlightState,
  | "start"
  | "runHealthDemo"
  | "setMode"
  | "setAudienceMode"
  | "selectSystem"
  | "selectComponent"
  | "isolateComponent"
  | "setHovered"
  | "toggleXray"
  | "setXrayFilter"
  | "setExplodedAmount"
  | "setExplodedLevel"
  | "setViewPreset"
  | "setFlightConfig"
  | "toggleDependencies"
  | "setHealthView"
  | "setSensorCategory"
  | "selectSensor"
  | "setHoveredSensor"
  | "setHumsLayer"
  | "startTrace"
  | "stopTrace"
  | "setArchitectureView"
  | "setNetworkFilter"
  | "toggleChannelFailure"
  | "toggleGnss"
  | "runMission"
  | "missionDispatch"
  | "startFault"
  | "faultDispatch"
  | "clearFault"
  | "setSignalDomain"
  | "viewTwin"
  | "setTwinSystem"
  | "setPredictionTime"
  | "goBack"
  | "reset"
  | "setHelpOpen"
  | "setAboutOpen"
  | "setEnvironment"
  | "setSceneReady"
  | "syncSimulation"
>;

const INITIAL: Data = {
  started: false,
  mode: "hero",
  audienceMode: "executive",
  selectedSystem: null,
  selectedComponent: null,
  hoveredComponent: null,
  isolatedComponent: null,
  xrayEnabled: false,
  xrayFilter: "all",
  explodedLevel: 1,
  explodedAmount: 0,
  viewPreset: "overview",
  flightConfig: "ground",
  showDependencies: false,

  healthView: "overview",
  sensorCategory: "vibration",
  selectedSensor: null,
  hoveredSensor: null,
  humsLayer: null,
  trace: null,

  architectureView: "data",
  networkFilter: "all",
  fccBFailed: false,
  gnssUnavailable: false,

  missionProfile: "executive",
  missionStage: "IDLE",
  missionPlaying: false,
  missionAuthorized: false,
  missionTime: 0,

  faultScenario: null,
  faultStage: "HEALTHY",
  faultPlaying: false,
  faultSeverity: 0,
  signalDomain: "time",

  twinSystem: "propulsion",
  predictionTime: 0,

  environment: "studio",
  cameraPreset: "hero",
  cameraNonce: 0,

  healthStates: healthStatesOf(PREFLIGHT_SNAPSHOT.twin),
  vehicleState: PREFLIGHT_SNAPSHOT.twin.vehicle,
  sensorValues: PREFLIGHT_SNAPSHOT.twin.observations,
  digitalTwinState: PREFLIGHT_SNAPSHOT.twin,
  telemetry: INITIAL_TELEMETRY,

  helpOpen: false,
  aboutOpen: false,
  reducedMotion: false,
  quality: DEFAULT_QUALITY,
  sceneReady: false,
};

/** Fields of the mission machine the interface reads. */
const missionFields = () => {
  const m = simClock.mission;
  return { missionProfile: m.profile, missionStage: m.stage, missionPlaying: m.playing, missionAuthorized: m.authorized, missionTime: m.timeS };
};

const faultFields = () => {
  const f = simClock.fault;
  return { faultScenario: f.scenario, faultStage: f.stage, faultPlaying: f.playing };
};

/** Re-derive the environment and the camera for a state, and ask the rig to move. */
const withView = (state: UFlightState, patch: Partial<Data>): Partial<Data> => {
  const next = { ...state, ...patch };
  return { ...patch, environment: environmentFor(next), cameraPreset: cameraPresetFor(next), cameraNonce: state.cameraNonce + 1 };
};

const CLEAR_FOCUS: Partial<Data> = { selectedComponent: null, isolatedComponent: null, hoveredComponent: null, selectedSensor: null, hoveredSensor: null, trace: null };

export const useUFlightStore = create<UFlightState>()((set, get) => ({
  ...INITIAL,

  start: () => set((s) => withView(s, { started: true, mode: "aircraft" })),

  runHealthDemo: () => {
    simClock.fault = faultReducer(simClock.fault, { type: "START", scenario: "bearing-degradation", autoplay: true });
    simClock.faultSeverity = 0;
    set((s) => withView(s, { ...CLEAR_FOCUS, started: true, mode: "fault-lab", explodedAmount: 0, signalDomain: "time", ...faultFields() }));
  },

  setMode: (mode) => {
    const state = get();
    if (state.mode === mode) return;
    // Leaving a mission that has told its health event hands the finding to the rest of the experience.
    if (state.mode === "mission") {
      const { stage } = missionFaultAt(simClock.mission.stage, stageProgress());
      if (stage !== "HEALTHY") {
        simClock.fault = { scenario: "bearing-degradation", stage, playing: false, stageTimeS: 0 };
        simClock.faultSeverity = STAGE_SEVERITY[stage];
      }
      simClock.mission = missionReducer(simClock.mission, { type: "RESET" });
    }
    if (simClock.fault.playing && mode !== "fault-lab") simClock.fault = faultReducer(simClock.fault, { type: "PAUSE" });

    // X-ray and the exploded view belong to the view they were switched on in.
    const patch: Partial<Data> = { ...CLEAR_FOCUS, mode, started: true, explodedAmount: 0, xrayEnabled: false, predictionTime: 0, ...missionFields(), ...faultFields() };
    if (mode === "systems") patch.selectedSystem = state.selectedSystem ?? "propulsion";
    if (mode === "health") Object.assign(patch, { selectedSystem: null, healthView: "overview" satisfies HealthView });
    if (mode === "twin") {
      patch.twinSystem = simClock.fault.scenario === "battery-imbalance" ? "energy" : "propulsion";
      // The twin compares the aircraft at an operating condition; parked, there is nothing to observe.
      if (state.flightConfig === "ground") patch.flightConfig = "cruise";
    }
    if (mode === "architecture") patch.architectureView = "data";
    set((s) => withView(s, patch));
  },

  setAudienceMode: (audienceMode) => set({ audienceMode }),

  selectSystem: (selectedSystem) => set((s) => withView(s, { ...CLEAR_FOCUS, selectedSystem })),

  selectComponent: (id) =>
    set((s) => {
      if (id === s.selectedComponent) return s;
      return withView(s, { selectedComponent: id, isolatedComponent: null, selectedSensor: null, trace: null });
    }),

  isolateComponent: (id) => set((s) => withView(s, { isolatedComponent: id, selectedComponent: id ?? s.selectedComponent })),

  setHovered: (hoveredComponent) => set((s) => (s.hoveredComponent === hoveredComponent ? s : { hoveredComponent })),

  toggleXray: () => set((s) => withView(s, { xrayEnabled: !s.xrayEnabled })),

  setXrayFilter: (xrayFilter) => set((s) => withView(s, { xrayFilter, xrayEnabled: true })),

  setExplodedAmount: (amount) =>
    set((s) => {
      const explodedAmount = Math.min(1, Math.max(0, amount));
      // The camera only needs to move when the view crosses between assembled and exploded.
      const crossed = explodedAmount > 0.35 !== s.explodedAmount > 0.35;
      return crossed ? withView(s, { explodedAmount }) : { explodedAmount };
    }),

  setExplodedLevel: (explodedLevel) => set({ explodedLevel }),

  setViewPreset: (viewPreset) => set((s) => withView(s, { ...CLEAR_FOCUS, viewPreset, explodedAmount: 0 })),

  setFlightConfig: (flightConfig) => set({ flightConfig }),

  toggleDependencies: () => set((s) => ({ showDependencies: !s.showDependencies })),

  setHealthView: (healthView) => set((s) => withView(s, { ...CLEAR_FOCUS, healthView, selectedSystem: null })),

  setSensorCategory: (sensorCategory) => set({ sensorCategory, selectedSensor: null, trace: null }),

  selectSensor: (id) =>
    set((s) => {
      if (!id) return { selectedSensor: null, trace: null };
      if (!getSensor(id)) return s;
      return { selectedSensor: id, selectedComponent: null, isolatedComponent: null, trace: s.trace?.sensorId === id ? s.trace : null };
    }),

  setHoveredSensor: (hoveredSensor) => set((s) => (s.hoveredSensor === hoveredSensor ? s : { hoveredSensor })),

  setHumsLayer: (humsLayer) => set({ humsLayer }),

  startTrace: (sensorId) => {
    if (!getSensor(sensorId)) return;
    set({ selectedSensor: sensorId, selectedComponent: null, isolatedComponent: null, trace: { sensorId, startedAt: nowS() } });
  },

  stopTrace: () => set({ trace: null }),

  setArchitectureView: (architectureView) => set((s) => withView(s, { ...CLEAR_FOCUS, architectureView })),

  setNetworkFilter: (networkFilter) => set({ networkFilter }),

  toggleChannelFailure: () => set((s) => ({ fccBFailed: !s.fccBFailed })),

  toggleGnss: () => set((s) => ({ gnssUnavailable: !s.gnssUnavailable })),

  runMission: (profile) => {
    // The mission tells its own health story from a healthy aircraft.
    simClock.fault = faultReducer(simClock.fault, { type: "CLEAR" });
    simClock.faultSeverity = 0;
    simClock.mission = missionReducer(simClock.mission, { type: "RUN", profile });
    set((s) => withView(s, { ...CLEAR_FOCUS, mode: "mission", started: true, explodedAmount: 0, ...missionFields(), ...faultFields(), faultSeverity: 0 }));
  },

  missionDispatch: (event) => {
    const before = simClock.mission;
    simClock.mission = missionReducer(before, event);
    if (simClock.mission === before) return;
    const stageChanged = simClock.mission.stage !== before.stage;
    set((s) => (stageChanged ? withView(s, missionFields()) : missionFields()));
  },

  startFault: (scenario, autoplay = false) => {
    simClock.fault = faultReducer(simClock.fault, { type: "START", scenario, autoplay });
    simClock.faultSeverity = 0;
    set((s) => withView(s, { ...CLEAR_FOCUS, mode: "fault-lab", started: true, explodedAmount: 0, faultSeverity: 0, ...faultFields() }));
  },

  faultDispatch: (event) => {
    const before = simClock.fault;
    simClock.fault = faultReducer(before, event);
    if (simClock.fault === before) return;
    const changed = simClock.fault.stage !== before.stage || simClock.fault.scenario !== before.scenario;
    set((s) => (changed ? withView(s, faultFields()) : faultFields()));
  },

  clearFault: () => {
    simClock.fault = faultReducer(simClock.fault, { type: "CLEAR" });
    simClock.faultSeverity = 0;
    set((s) => withView(s, { ...CLEAR_FOCUS, faultSeverity: 0, ...faultFields() }));
  },

  setSignalDomain: (signalDomain) => set({ signalDomain }),

  viewTwin: (twinSystem) => {
    get().setMode("twin");
    set((s) => withView(s, { twinSystem }));
  },

  setTwinSystem: (twinSystem) => set((s) => withView(s, { twinSystem, selectedComponent: null, isolatedComponent: null })),

  setPredictionTime: (cycles) => set({ predictionTime: Math.round(Math.min(HORIZON_CYCLES, Math.max(-HORIZON_CYCLES, cycles))) }),

  goBack: () => {
    const s = get();
    if (s.helpOpen || s.aboutOpen) return set({ helpOpen: false, aboutOpen: false });
    if (s.trace) return set({ trace: null });
    if (s.isolatedComponent) return set((state) => withView(state, { isolatedComponent: null }));
    if (s.selectedSensor) return set({ selectedSensor: null });
    if (s.selectedComponent) {
      // Step up the hierarchy: from a part to its assembly, then out.
      const parent = COMPONENTS[s.selectedComponent].parent ?? null;
      return set((state) => withView(state, { selectedComponent: parent }));
    }
    if (s.explodedAmount > 0) return set((state) => withView(state, { explodedAmount: 0 }));
    if (s.mode === "health" && s.selectedSystem) return set((state) => withView(state, { selectedSystem: null }));
  },

  reset: () => {
    resetSimClock();
    set((s) =>
      withView(s, {
        ...INITIAL,
        started: true,
        mode: "aircraft",
        audienceMode: s.audienceMode,
        reducedMotion: s.reducedMotion,
        quality: s.quality,
        sceneReady: s.sceneReady,
      }),
    );
  },

  setHelpOpen: (helpOpen) => set({ helpOpen, aboutOpen: false }),

  setAboutOpen: (aboutOpen) => set({ aboutOpen, helpOpen: false }),

  setEnvironment: (patch) => set(patch),

  setSceneReady: (sceneReady) => set({ sceneReady }),

  syncSimulation: (telemetry) =>
    set((s) => {
      const twin = telemetry.snapshot.twin;
      const patch: Partial<Data> = {
        telemetry,
        missionTime: telemetry.missionTimeS,
        faultSeverity: simClock.faultSeverity,
        healthStates: healthStatesOf(twin),
        vehicleState: twin.vehicle,
        sensorValues: twin.observations,
        digitalTwinState: twin,
      };
      // The clocks advance in the render loop; pick up any stage they reached.
      const mission = missionFields();
      const fault = faultFields();
      const stageChanged = mission.missionStage !== s.missionStage || fault.faultStage !== s.faultStage || fault.faultScenario !== s.faultScenario;
      if (mission.missionStage === "COMPLETE" && s.missionStage !== "COMPLETE") trackEvent("uflight_3d_mission_complete", { profile: mission.missionProfile });
      Object.assign(patch, mission, fault);
      return stageChanged ? withView(s, patch) : patch;
    }),
}));

/** Progress through the mission stage the clock is in, 0–1. */
function stageProgress(): number {
  const m = simClock.mission;
  if (m.stage === "IDLE") return 0;
  if (m.stage === "COMPLETE") return 1;
  return stageAt(m.timeS, m.profile).progress;
}

export const missionStageProgress = stageProgress;
export const missionAwaitingAuthorization = () => awaitingAuthorization(simClock.mission);

/** Back to the opening screen, as on a fresh visit. */
export function resetUFlightSession() {
  resetSimClock();
  const { quality, reducedMotion } = useUFlightStore.getState();
  useUFlightStore.setState({ ...INITIAL, quality, reducedMotion });
}
