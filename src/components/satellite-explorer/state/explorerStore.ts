// Explorer state. Interaction state lives here; per-frame simulation values
// live in simClock / the render loop and are mirrored into `telemetry` at a
// throttled rate so React never re-renders once per frame.
import { create } from "zustand";
import type { ComponentId, DetailLevel, ExplorerMode, LinkState, MissionStage, PowerState, SignalView, SpacecraftMode, SubsystemId } from "../types";
import type { QualitySettings } from "../lib/capabilities";
import { selectQuality } from "../lib/capabilities";
import { COMPONENTS } from "../data/componentDefinitions";
import { BUILD_STEP_COUNT, MISSION_STAGE_INFO, TOUR_STEPS } from "../data/missionSequence";
import { MISSION_DURATION_S, type MissionEvent, isActiveStage, missionReducer } from "../simulation/mission";
import { NOMINAL_LOADS_W, type LoadId } from "../simulation/power";
import type { PayloadPhase } from "../simulation/payload";
import type { CommandPhase } from "../simulation/mission";
import type { WheelAxis } from "../simulation/adcs";
import type { CameraPresetId } from "../scene/cameraPresets";
import { ORBIT_BOOKMARKS, nowS, resetSimClock, seekOrbit, simClock } from "./simClock";

export type PowerScenario = "auto" | "sunlight" | "eclipse";

/** Throttled mirror of simulation output for the interface. All values are SIMULATED. */
export interface Telemetry {
  orbitTimeS: number;
  missionTimeS: number;
  batterySoc: number;
  busVoltage: number;
  batteryCurrentA: number;
  batteryState: PowerState;
  generationW: number;
  loadW: number;
  loads: Record<LoadId, number>;
  sunlit: boolean;
  spacecraftMode: SpacecraftMode;
  attitudeMode: string;
  attitudeLocked: boolean;
  wheelRpm: [number, number, number, number];
  storageMb: number;
  payloadPhase: PayloadPhase;
  link: LinkState;
  elevationDeg: number;
  rangeKm: number;
  commandPhase: CommandPhase;
  telemetryProgress: number;
  downlinkProgress: number;
  callout: string | null;
  latDeg: number;
  lonDeg: number;
}

export const INITIAL_TELEMETRY: Telemetry = {
  orbitTimeS: 0,
  missionTimeS: 0,
  batterySoc: 78,
  busVoltage: 8.1,
  batteryCurrentA: 0.7,
  batteryState: "CHARGING",
  generationW: 18.4,
  loadW: 12.1,
  loads: NOMINAL_LOADS_W,
  sunlit: true,
  spacecraftMode: "NOMINAL",
  attitudeMode: "NADIR",
  attitudeLocked: true,
  wheelRpm: [1200, -900, 1500, 0],
  storageMb: 243,
  payloadPhase: "IDLE",
  link: "NO_LINK",
  elevationDeg: 0,
  rangeKm: 0,
  commandPhase: "NONE",
  telemetryProgress: 0,
  downlinkProgress: 0,
  callout: null,
  latDeg: 0,
  lonDeg: 0,
};

export interface TimedDemo {
  /** Seconds (performance clock) when the demonstration started. */
  startedAt: number;
}

export interface ExplorerState {
  /** False while the hero screen is shown. */
  started: boolean;
  mode: ExplorerMode;
  subsystem: SubsystemId;
  signalView: SignalView;
  selectedComponent: ComponentId | null;
  hoveredComponent: ComponentId | null;
  isolatedComponent: ComponentId | null;
  /** 0 = assembled, 1 = fully exploded. */
  explodedAmount: number;
  xrayEnabled: boolean;
  learnMode: DetailLevel;
  /** Current Build Mode step, 1–8. */
  buildStep: number;
  buildAuto: boolean;
  buildStepChangedAt: number;
  missionStage: MissionStage;
  missionPlaying: boolean;
  missionCompleted: boolean;
  orbitPlaying: boolean;
  /** Orbit seconds per real second in Orbit Mode. */
  orbitSpeed: number;
  powerScenario: PowerScenario;
  showMagnetorquer: boolean;
  slewDemo: (TimedDemo & { axis: Exclude<WheelAxis, "R"> }) | null;
  captureDemo: TimedDemo | null;
  commandDemo: TimedDemo | null;
  componentAnimation: (TimedDemo & { id: ComponentId }) | null;
  cameraPreset: CameraPresetId;
  /** Incremented to re-run a camera move to the same preset. */
  cameraNonce: number;
  tourActive: boolean;
  tourStep: number;
  tourPlaying: boolean;
  tourStepStartedAt: number;
  helpOpen: boolean;
  indexOpen: boolean;
  reducedMotion: boolean;
  quality: QualitySettings;
  /** Set once the scene has drawn its first frame. */
  sceneReady: boolean;
  telemetry: Telemetry;

  // Mirrors of telemetry fields named in the scene-state contract.
  orbitTime: number;
  powerState: PowerState;
  batterySOC: number;
  groundLink: LinkState;
  payloadData: number;

  start: () => void;
  setMode: (mode: ExplorerMode) => void;
  setSubsystem: (subsystem: SubsystemId) => void;
  setSignalView: (view: SignalView) => void;
  selectComponent: (id: ComponentId | null) => void;
  isolateComponent: (id: ComponentId | null) => void;
  setHovered: (id: ComponentId | null) => void;
  setExploded: (amount: number) => void;
  toggleExploded: () => void;
  toggleXray: () => void;
  setLearnMode: (level: DetailLevel) => void;
  setBuildStep: (step: number) => void;
  nextBuildStep: () => void;
  previousBuildStep: () => void;
  setBuildAuto: (auto: boolean) => void;
  resetBuild: () => void;
  dispatchMission: (event: MissionEvent) => void;
  /** Called by the render loop when the mission clock crosses a stage boundary or stops. */
  syncMission: () => void;
  runMission: () => void;
  setOrbitPlaying: (playing: boolean) => void;
  setOrbitSpeed: (speed: number) => void;
  jumpOrbit: (bookmark: keyof typeof ORBIT_BOOKMARKS) => void;
  setPowerScenario: (scenario: PowerScenario) => void;
  setShowMagnetorquer: (show: boolean) => void;
  startSlewDemo: (axis: Exclude<WheelAxis, "R">) => void;
  startCaptureDemo: () => void;
  startCommandDemo: () => void;
  animateComponent: (id: ComponentId) => void;
  showFlowFor: (id: ComponentId) => void;
  setCamera: (preset: CameraPresetId) => void;
  startTour: () => void;
  tourGoTo: (step: number) => void;
  tourNext: () => void;
  tourBack: () => void;
  setTourPlaying: (playing: boolean) => void;
  exitTour: () => void;
  setHelpOpen: (open: boolean) => void;
  setIndexOpen: (open: boolean) => void;
  goBack: () => void;
  setEnvironment: (env: { reducedMotion?: boolean; quality?: QualitySettings }) => void;
  setSceneReady: (ready: boolean) => void;
  setTelemetry: (telemetry: Telemetry) => void;
  reset: () => void;
}

const DEFAULT_QUALITY = selectQuality({ devicePixelRatio: 1, webgl2: true, softwareRenderer: false });

/** Camera preset each Systems tab frames. */
export const SUBSYSTEM_CAMERA: Record<SubsystemId, CameraPresetId> = {
  power: "power",
  adcs: "adcs",
  payload: "payload",
  communications: "communications",
  thermal: "thermal",
  avionics: "avionics",
  structure: "structure",
};

/** Camera a mode opens with, given the rest of the state. */
export function cameraForMode(mode: ExplorerMode, state: Pick<ExplorerState, "subsystem" | "missionStage" | "explodedAmount">): CameraPresetId {
  switch (mode) {
    case "hero":
      return "hero";
    case "build":
      return "build";
    case "explore":
      return state.explodedAmount > 0.5 ? "exploded" : "overview";
    case "systems":
      return SUBSYSTEM_CAMERA[state.subsystem];
    case "mission":
      return isActiveStage(state.missionStage) ? MISSION_STAGE_INFO[state.missionStage].camera : "overview";
    case "orbit":
      return "orbit";
    case "signals":
      return "signals";
  }
}

type Persistent = Pick<ExplorerState, "reducedMotion" | "quality" | "sceneReady" | "learnMode">;

const baseState = (): Omit<ExplorerState, keyof Persistent | Actions> => ({
  started: false,
  mode: "hero",
  subsystem: "power",
  signalView: "command",
  selectedComponent: null,
  hoveredComponent: null,
  isolatedComponent: null,
  explodedAmount: 0,
  xrayEnabled: false,
  buildStep: 1,
  buildAuto: false,
  buildStepChangedAt: 0,
  missionStage: "IDLE",
  missionPlaying: false,
  missionCompleted: false,
  orbitPlaying: true,
  orbitSpeed: 60,
  powerScenario: "auto",
  showMagnetorquer: false,
  slewDemo: null,
  captureDemo: null,
  commandDemo: null,
  componentAnimation: null,
  cameraPreset: "hero",
  cameraNonce: 0,
  tourActive: false,
  tourStep: 0,
  tourPlaying: false,
  tourStepStartedAt: 0,
  helpOpen: false,
  indexOpen: false,
  telemetry: INITIAL_TELEMETRY,
  orbitTime: 0,
  powerState: INITIAL_TELEMETRY.batteryState,
  batterySOC: INITIAL_TELEMETRY.batterySoc,
  groundLink: INITIAL_TELEMETRY.link,
  payloadData: INITIAL_TELEMETRY.storageMb,
});

type Actions = {
  [K in keyof ExplorerState]: ExplorerState[K] extends (...args: never[]) => unknown ? K : never;
}[keyof ExplorerState];

const clampStep = (step: number) => Math.min(BUILD_STEP_COUNT, Math.max(1, Math.round(step)));

/** Where the orbit clock should sit when a view opens, or null to leave it running. */
function orbitBookmarkFor(mode: ExplorerMode, subsystem: SubsystemId): keyof typeof ORBIT_BOOKMARKS | null {
  if (mode === "signals") return "passMid";
  if (mode === "orbit") return "target";
  if (mode === "systems") {
    if (subsystem === "communications") return "passMid";
    if (subsystem === "payload") return "target";
  }
  return null;
}

export const useExplorerStore = create<ExplorerState>()((set, get) => {
  const missionMirror = () => ({
    missionStage: simClock.mission.stage,
    missionPlaying: simClock.mission.playing,
  });

  const enter = (mode: ExplorerMode, patch: Partial<ExplorerState> = {}) => {
    const next = { ...get(), ...patch, mode };
    const bookmark = orbitBookmarkFor(mode, next.subsystem);
    if (bookmark) seekOrbit(ORBIT_BOOKMARKS[bookmark]);
    // The mission only runs while it is on screen; it resumes from the same point.
    if (mode !== "mission" && simClock.mission.playing) simClock.mission = missionReducer(simClock.mission, { type: "PAUSE" });
    set({
      ...patch,
      ...missionMirror(),
      mode,
      started: mode !== "hero",
      selectedComponent: null,
      isolatedComponent: null,
      hoveredComponent: null,
      slewDemo: null,
      captureDemo: null,
      commandDemo: null,
      componentAnimation: null,
      indexOpen: false,
      cameraPreset: cameraForMode(mode, next),
      cameraNonce: get().cameraNonce + 1,
    });
  };

  /** Navigating by hand ends the guided tour, so it never pulls the view away later. */
  const leaveTour = () => {
    if (get().tourActive) set({ tourActive: false, tourPlaying: false });
  };

  const startMission = () => {
    if (get().mode !== "mission") enter("mission", { explodedAmount: 0, xrayEnabled: false });
    get().dispatchMission({ type: "RUN" });
  };

  const applyTourStep = (index: number) => {
    const step = TOUR_STEPS[index];
    if (!step) return;
    const patch: Partial<ExplorerState> = {
      tourStep: index,
      tourStepStartedAt: nowS(),
      powerScenario: "auto",
    };
    if (step.subsystem) patch.subsystem = step.subsystem;
    if (step.signal) patch.signalView = step.signal;
    if (step.exploded !== undefined) patch.explodedAmount = step.exploded;
    if (step.xray !== undefined) patch.xrayEnabled = step.xray;
    enter(step.mode, patch);
    if (step.camera) set({ cameraPreset: step.camera, cameraNonce: get().cameraNonce + 1 });
    if (step.runMission) startMission();
    else if (simClock.mission.playing) get().dispatchMission({ type: "PAUSE" });
    if (step.mode === "signals") get().startCommandDemo();
  };

  return {
    ...baseState(),
    learnMode: "learn",
    reducedMotion: false,
    quality: DEFAULT_QUALITY,
    sceneReady: false,

    start: () => enter("explore"),

    setMode: (mode) => {
      leaveTour();
      if (mode === "build") {
        enter("build", { explodedAmount: 0, xrayEnabled: false, buildStepChangedAt: nowS(), buildAuto: false });
        return;
      }
      if (mode === "systems" || mode === "signals" || mode === "orbit" || mode === "mission") {
        enter(mode, { explodedAmount: 0, xrayEnabled: mode === "signals" });
        return;
      }
      enter(mode, { xrayEnabled: false });
    },

    setSubsystem: (subsystem) => {
      leaveTour();
      enter("systems", { subsystem, explodedAmount: 0, xrayEnabled: false, powerScenario: "auto", showMagnetorquer: false });
    },

    setSignalView: (signalView) => {
      set({ signalView, commandDemo: null, selectedComponent: null, isolatedComponent: null });
    },

    selectComponent: (id) => {
      const state = get();
      if (id === null) {
        set({
          selectedComponent: null,
          isolatedComponent: null,
          cameraPreset: cameraForMode(state.mode, state),
          cameraNonce: state.cameraNonce + 1,
        });
        return;
      }
      set({
        selectedComponent: id,
        isolatedComponent: state.isolatedComponent === id ? id : null,
        indexOpen: false,
        cameraNonce: state.cameraNonce + 1,
      });
    },

    isolateComponent: (id) => {
      const state = get();
      set({
        isolatedComponent: id,
        selectedComponent: id ?? state.selectedComponent,
        indexOpen: false,
        cameraNonce: state.cameraNonce + 1,
      });
    },

    setHovered: (id) => {
      if (get().hoveredComponent !== id) set({ hoveredComponent: id });
    },

    setExploded: (amount) => set({ explodedAmount: Math.min(1, Math.max(0, amount)) }),

    toggleExploded: () => {
      const state = get();
      const explodedAmount = state.explodedAmount > 0.5 ? 0 : 1;
      set({
        explodedAmount,
        cameraPreset: state.selectedComponent ? state.cameraPreset : explodedAmount > 0.5 ? "exploded" : "overview",
        cameraNonce: state.cameraNonce + 1,
      });
    },

    toggleXray: () => set({ xrayEnabled: !get().xrayEnabled }),

    setLearnMode: (learnMode) => set({ learnMode }),

    setBuildStep: (step) => {
      const buildStep = clampStep(step);
      if (buildStep !== get().buildStep) set({ buildStep, buildStepChangedAt: nowS(), selectedComponent: null, isolatedComponent: null });
    },
    nextBuildStep: () => {
      const state = get();
      if (state.buildStep >= BUILD_STEP_COUNT) set({ buildAuto: false });
      else state.setBuildStep(state.buildStep + 1);
    },
    previousBuildStep: () => get().setBuildStep(get().buildStep - 1),
    setBuildAuto: (buildAuto) => {
      const state = get();
      // Starting AUTO BUILD from the finished spacecraft restarts the sequence.
      if (buildAuto && state.buildStep >= BUILD_STEP_COUNT) set({ buildStep: 1, buildStepChangedAt: nowS() });
      set({ buildAuto, buildStepChangedAt: buildAuto ? nowS() : get().buildStepChangedAt });
    },
    resetBuild: () => set({ buildStep: 1, buildAuto: false, buildStepChangedAt: nowS(), selectedComponent: null, isolatedComponent: null }),

    dispatchMission: (event) => {
      const before = simClock.mission.stage;
      simClock.mission = missionReducer(simClock.mission, event);
      const stage = simClock.mission.stage;
      // The clock in the interface follows a command at once, not at the next telemetry sample.
      const patch: Partial<ExplorerState> = { ...missionMirror(), telemetry: { ...get().telemetry, missionTimeS: simClock.mission.timeS } };
      // "Completed" means played through to the end; moving the clock back clears it.
      if (simClock.mission.timeS < MISSION_DURATION_S) patch.missionCompleted = false;
      if (stage !== before && isActiveStage(stage) && get().mode === "mission") {
        patch.cameraPreset = MISSION_STAGE_INFO[stage].camera;
        patch.cameraNonce = get().cameraNonce + 1;
        patch.selectedComponent = null;
        patch.isolatedComponent = null;
      }
      set(patch);
    },

    syncMission: () => {
      const state = get();
      const { stage, playing, timeS } = simClock.mission;
      if (stage === state.missionStage && playing === state.missionPlaying) return;
      const patch: Partial<ExplorerState> = { missionStage: stage, missionPlaying: playing };
      if (stage !== state.missionStage && isActiveStage(stage) && state.mode === "mission") {
        patch.cameraPreset = MISSION_STAGE_INFO[stage].camera;
        patch.cameraNonce = state.cameraNonce + 1;
      }
      if (stage === "COMPLETE" && !playing && timeS > 0 && state.missionPlaying) patch.missionCompleted = true;
      set(patch);
    },

    runMission: () => {
      leaveTour();
      startMission();
    },

    setOrbitPlaying: (orbitPlaying) => set({ orbitPlaying }),
    setOrbitSpeed: (orbitSpeed) => set({ orbitSpeed }),
    jumpOrbit: (bookmark) => seekOrbit(ORBIT_BOOKMARKS[bookmark]),

    setPowerScenario: (powerScenario) => {
      if (powerScenario === "sunlight") seekOrbit(ORBIT_BOOKMARKS.sunlight);
      if (powerScenario === "eclipse") seekOrbit(ORBIT_BOOKMARKS.eclipse);
      set({ powerScenario });
    },

    setShowMagnetorquer: (showMagnetorquer) => set({ showMagnetorquer }),

    startSlewDemo: (axis) => set({ slewDemo: { axis, startedAt: nowS() } }),

    startCaptureDemo: () => {
      seekOrbit(ORBIT_BOOKMARKS.target, 1.2);
      set({ captureDemo: { startedAt: nowS() + 1.3 } });
    },

    startCommandDemo: () => set({ commandDemo: { startedAt: nowS() } }),

    animateComponent: (id) => set({ componentAnimation: { id, startedAt: nowS() } }),

    showFlowFor: (id) => {
      const { subsystem } = COMPONENTS[id];
      leaveTour();
      if (subsystem === "communications") enter("signals", { signalView: id.startsWith("xband") ? "payload-data" : "command", explodedAmount: 0, xrayEnabled: true });
      else enter("systems", { subsystem, explodedAmount: 0, xrayEnabled: subsystem === "power" || subsystem === "avionics" });
    },

    setCamera: (cameraPreset) => set({ cameraPreset, cameraNonce: get().cameraNonce + 1 }),

    startTour: () => {
      set({ tourActive: true, tourPlaying: true, helpOpen: false });
      applyTourStep(0);
    },
    tourGoTo: (step) => {
      if (step >= TOUR_STEPS.length) {
        get().exitTour();
        return;
      }
      applyTourStep(Math.max(0, step));
    },
    tourNext: () => get().tourGoTo(get().tourStep + 1),
    tourBack: () => get().tourGoTo(get().tourStep - 1),
    setTourPlaying: (tourPlaying) => set({ tourPlaying, tourStepStartedAt: nowS() }),
    exitTour: () => {
      if (simClock.mission.playing) get().dispatchMission({ type: "PAUSE" });
      set({ tourActive: false, tourPlaying: false });
    },

    setHelpOpen: (helpOpen) => set({ helpOpen, indexOpen: helpOpen ? false : get().indexOpen }),
    setIndexOpen: (indexOpen) => set({ indexOpen, helpOpen: indexOpen ? false : get().helpOpen }),

    goBack: () => {
      const state = get();
      if (state.helpOpen) set({ helpOpen: false });
      else if (state.indexOpen) set({ indexOpen: false });
      else if (state.isolatedComponent) set({ isolatedComponent: null, cameraNonce: state.cameraNonce + 1 });
      else if (state.selectedComponent) state.selectComponent(null);
      else if (state.tourActive) state.exitTour();
      else if (state.explodedAmount > 0 && state.mode === "explore") state.toggleExploded();
      else if (state.xrayEnabled) set({ xrayEnabled: false });
    },

    setEnvironment: (env) => set(env),
    setSceneReady: (sceneReady) => set({ sceneReady }),

    setTelemetry: (telemetry) =>
      set({
        telemetry,
        orbitTime: telemetry.orbitTimeS,
        powerState: telemetry.batteryState,
        batterySOC: telemetry.batterySoc,
        groundLink: telemetry.link,
        payloadData: telemetry.storageMb,
      }),

    reset: () => {
      resetSimClock();
      const state = get();
      set({ ...baseState(), started: state.started, mode: state.started ? "explore" : "hero", cameraPreset: state.started ? "overview" : "hero", cameraNonce: state.cameraNonce + 1 });
    },
  };
});

/** End a visit: the next one starts from the opening view, keeping what was measured about the device. */
export function resetExplorerSession() {
  resetSimClock();
  useExplorerStore.setState({ ...baseState(), sceneReady: false });
}

/** Test helper: return the store and clocks to their initial state. */
export function resetExplorerStore() {
  resetSimClock();
  useExplorerStore.setState({ ...baseState(), learnMode: "learn", reducedMotion: false, quality: DEFAULT_QUALITY, sceneReady: false });
}
