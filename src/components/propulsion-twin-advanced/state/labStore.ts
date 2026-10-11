// Interaction state for the Advanced Rocket Propulsion System Digital Twin:
// which module and depth are open, what is selected, and the one simulated
// twin every module shares. Actions own the state changes and the analytics.
//
// The simulation is not imported here. It is fetched the first time a module
// that needs it is opened, so the page's text and diagrams never wait for it.
import { create } from "zustand";
import { trackAdvancedTwin, trackAdvancedTwinOnce } from "../analytics";
import type { ChannelId } from "../simulation/channels";
import type { FaultId } from "../simulation/isolation";
import type { TwinEngineApi, TwinSnapshot } from "../simulation/twinTypes";
import { LEVEL_IDS, type LevelId, MODULE_IDS, type ModuleId } from "../types";

export const WEEKS_STORAGE_KEY = "advanced-propulsion-twin:weeks";
/** In-page anchor of the module area. */
export const MODULES_ANCHOR = "modules";
/** Faults that only show in a transient: injecting one starts the throttle exercise. */
const NEEDS_TRANSIENT: readonly FaultId[] = ["packet_delay", "timestamp_error", "telemetry_replay"];

export interface LabState {
  module: ModuleId;
  level: LevelId;
  sensor: ChannelId | null;
  engine: TwinEngineApi | null;
  booting: boolean;
  snapshot: TwinSnapshot | null;
  /** Bumped every time the simulation advances, so charts know to redraw. */
  tick: number;
  running: boolean;
  speed: 1 | 4;
  compare: boolean;
  /** How many mounted views are showing live values. The simulation only runs while there is one. */
  viewers: number;
  weeksDone: number[];
}

export interface LabActions {
  setModule: (module: ModuleId, options?: { scroll?: boolean }) => void;
  setLevel: (level: LevelId) => void;
  openCto: () => void;
  selectSensor: (sensor: ChannelId | null) => void;
  boot: () => Promise<void>;
  watch: () => () => void;
  setRunning: (running: boolean) => void;
  setSpeed: (speed: 1 | 4) => void;
  toggleCompare: () => void;
  step: () => void;
  inject: (fault: FaultId, severity?: number) => void;
  clearFaults: () => void;
  resetSimulation: () => void;
  setThrottle: (level: number) => void;
  setExercise: (on: boolean) => void;
  startEngine: () => void;
  shutdownEngine: () => void;
  loadWeeks: () => void;
  toggleWeek: (week: number) => void;
}

export const INITIAL_STATE: LabState = {
  module: "overview",
  level: "learn",
  sensor: null,
  engine: null,
  booting: false,
  snapshot: null,
  tick: 0,
  running: true,
  speed: 1,
  compare: false,
  viewers: 0,
  weeksDone: [],
};

export const isModuleId = (value: string): value is ModuleId => (MODULE_IDS as readonly string[]).includes(value);
export const isLevelId = (value: string): value is LevelId => (LEVEL_IDS as readonly string[]).includes(value);

let timer: ReturnType<typeof setInterval> | null = null;
let detected: FaultId | null = null;

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export const useLabStore = create<LabState & LabActions>((set, get) => {
  /** Advances the simulation and publishes what the twin now reports. */
  const advance = (steps: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.step(steps);
    const snapshot = engine.snapshot();
    const first = snapshot.faults[0]?.id;
    if (snapshot.anomaly && first && detected !== first) {
      detected = first;
      trackAdvancedTwin("fault_detected", { fault: first });
    }
    if (!first) detected = null;
    set((s) => ({ snapshot, tick: s.tick + 1 }));
  };

  /** Starts or stops the clock to match the state: it runs only while something is watching a running simulation in a visible tab. */
  const sync = () => {
    const { engine, running, viewers } = get();
    const wanted = Boolean(engine) && running && viewers > 0 && (typeof document === "undefined" || !document.hidden);
    if (wanted && !timer) {
      // Phones redraw half as often; simulated time passes at the same rate.
      const slow = narrow();
      timer = setInterval(() => advance((slow ? 4 : 2) * get().speed), slow ? 200 : 100);
    } else if (!wanted && timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (typeof document !== "undefined") document.addEventListener("visibilitychange", sync);

  const refresh = () => {
    const { engine } = get();
    if (engine) set((s) => ({ snapshot: engine.snapshot(), tick: s.tick + 1 }));
  };

  return {
    ...INITIAL_STATE,

    setModule: (module, options) => {
      if (get().module !== module) {
        set({ module });
        trackAdvancedTwin("module_open", { module });
      }
      if (typeof window === "undefined") return;
      if (window.location.hash !== `#${module}`) window.history.replaceState(null, "", `#${module}`);
      if (options?.scroll !== false) document.getElementById(MODULES_ANCHOR)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    },

    setLevel: (level) => {
      if (get().level !== level) set({ level });
    },

    openCto: () => {
      set({ level: "architect" });
      trackAdvancedTwin("cto_mode_opened");
      get().setModule("architecture");
    },

    selectSensor: (sensor) => {
      if (get().sensor === sensor) return;
      set({ sensor });
      if (sensor) trackAdvancedTwin("pressure_sensor_selected", { sensor: sensor.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) });
    },

    boot: async () => {
      if (get().engine || get().booting) return;
      set({ booting: true });
      const { createTwinEngine } = await import("../simulation/twinEngine");
      const engine = createTwinEngine();
      // A learner who asked for less motion starts with the simulation paused, and steps it by hand.
      set({ engine, booting: false, snapshot: engine.snapshot(), running: !prefersReducedMotion() });
      sync();
    },

    watch: () => {
      set((s) => ({ viewers: s.viewers + 1 }));
      void get().boot();
      sync();
      return () => {
        set((s) => ({ viewers: Math.max(0, s.viewers - 1) }));
        sync();
      };
    },

    setRunning: (running) => {
      set({ running });
      sync();
    },

    setSpeed: (speed) => set({ speed }),
    toggleCompare: () => set((s) => ({ compare: !s.compare })),
    step: () => advance(10),

    inject: (fault, severity = 0.8) => {
      const { engine } = get();
      if (!engine) return;
      engine.inject(fault, severity);
      if (NEEDS_TRANSIENT.includes(fault)) engine.setExercise(true);
      trackAdvancedTwin("fault_injected", { fault });
      refresh();
    },

    clearFaults: () => {
      get().engine?.clear();
      get().engine?.setExercise(false);
      refresh();
    },

    resetSimulation: () => {
      get().engine?.reset();
      detected = null;
      refresh();
    },

    setThrottle: (level) => {
      get().engine?.setThrottle(level);
      refresh();
    },

    setExercise: (on) => {
      get().engine?.setExercise(on);
      refresh();
    },

    startEngine: () => {
      get().engine?.start();
      refresh();
    },

    shutdownEngine: () => {
      get().engine?.shutdown();
      refresh();
    },

    loadWeeks: () => {
      try {
        const stored: unknown = JSON.parse(window.localStorage.getItem(WEEKS_STORAGE_KEY) ?? "[]");
        if (Array.isArray(stored)) set({ weeksDone: stored.filter((w): w is number => Number.isInteger(w) && w >= 1 && w <= 12) });
      } catch {
        // Progress is a convenience: without storage the tracker simply starts empty.
      }
    },

    toggleWeek: (week) => {
      const done = get().weeksDone.includes(week);
      const weeksDone = done ? get().weeksDone.filter((w) => w !== week) : [...get().weeksDone, week].sort((a, b) => a - b);
      set({ weeksDone });
      if (!done) trackAdvancedTwinOnce("week_module_completed", { week: `week_${week}` });
      try {
        window.localStorage.setItem(WEEKS_STORAGE_KEY, JSON.stringify(weeksDone));
      } catch {
        // See loadWeeks.
      }
    },
  };
});

/** Returns the store to its opening state. For tests, and for leaving the page. */
export function resetLabStore(): void {
  if (timer) clearInterval(timer);
  timer = null;
  detected = null;
  useLabStore.setState({ ...INITIAL_STATE });
}
