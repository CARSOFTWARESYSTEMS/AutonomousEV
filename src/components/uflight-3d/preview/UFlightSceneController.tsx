// Drives the shared UFlight™ store from the preview's stage clock, using the
// application's own actions: the same modes, X-ray, system focus, fault
// scenario and digital twin the full experience offers. Each stage is a short
// list of steps; a step sets the whole state it needs, so jumping straight to
// any stage gives the same picture as arriving in sequence.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { FaultStage, SystemId } from "../types";
import { CAMERA_PRESETS, type CameraPreset } from "../scene/cameraPresets";
import { STAGE_SEVERITY } from "../simulation/faultModels";
import { simClock } from "../state/simClock";
import { type UFlightState, useUFlightStore } from "../state/uflightStore";
import { STAGES, type PreviewStageId, type StageClock } from "./stages";

const S = () => useUFlightStore.getState();

/** Discover: the assembled aircraft on the studio floor, systems off, the camera re-composed. */
function toAircraft() {
  if (simClock.fault.scenario) S().clearFault();
  if (!S().started) S().start();
  else if (S().mode !== "aircraft") S().setMode("aircraft");
  if (S().flightConfig !== "ground") S().setFlightConfig("ground");
  S().setPredictionTime(0);
  S().setViewPreset("overview");
}

/** Systems: the application's SYSTEMS mode (skin in X-ray, the system in focus, its flows running). */
function toSystem(id: SystemId) {
  if (simClock.fault.scenario) S().clearFault();
  if (S().flightConfig !== "ground") S().setFlightConfig("ground");
  if (S().mode !== "systems") S().setMode("systems");
  S().selectSystem(id);
}

/** Health: the application's motor-bearing scenario, stepped through its own stages. */
function toFault(stage: FaultStage, restart: boolean) {
  if (restart || simClock.fault.scenario !== "bearing-degradation" || S().mode !== "fault-lab") S().startFault("bearing-degradation", false);
  if (simClock.fault.stage !== stage) S().faultDispatch({ type: "GOTO", stage });
}

/** Digital twin: the same scenario compared against the healthy reference. */
function toTwin(stage: FaultStage) {
  if (simClock.fault.scenario !== "bearing-degradation") S().startFault("bearing-degradation", false);
  if (simClock.fault.stage !== stage) S().faultDispatch({ type: "GOTO", stage });
  // Arriving here directly, the anomaly is already established (as it is when Health has just played).
  if (simClock.faultSeverity < STAGE_SEVERITY.ANOMALOUS) simClock.faultSeverity = STAGE_SEVERITY.DIAGNOSED;
  if (S().mode !== "twin") S().setMode("twin");
  S().setTwinSystem("propulsion");
}

interface Step {
  at: number;
  key: string;
  apply: (entering: boolean) => void;
}

const SYSTEM_ORDER: SystemId[] = ["propulsion", "energy", "avionics", "flightControl"];

export const STEPS: Record<PreviewStageId, Step[]> = {
  discover: [{ at: 0, key: "aircraft", apply: toAircraft }],
  systems: SYSTEM_ORDER.map((id, i) => ({ at: i * 1.75, key: id, apply: () => toSystem(id) })),
  health: [
    { at: 0, key: "HEALTHY", apply: () => toFault("HEALTHY", true) },
    { at: 1.4, key: "EARLY_CHANGE", apply: (entering) => toFault("EARLY_CHANGE", entering) },
    { at: 3, key: "ANOMALOUS", apply: (entering) => toFault("ANOMALOUS", entering) },
    { at: 5, key: "DIAGNOSED", apply: (entering) => toFault("DIAGNOSED", entering) },
  ],
  twin: [
    { at: 0, key: "compare", apply: () => toTwin("DIAGNOSED") },
    { at: 3.2, key: "prognosis", apply: () => toTwin("DEGRADING") },
  ],
};

/** The step a stage is on, `local` seconds in. */
export function stepAt(stage: PreviewStageId, local: number): Step {
  const steps = STEPS[stage];
  let step = steps[0];
  for (const s of steps) if (local >= s.at) step = s;
  return step;
}

// ── Camera: one composed view per stage, from the application's own presets where they fit ──

const VIEWS = {
  discover: { ...CAMERA_PRESETS["aircraft-overview"], screenOffset: [0, 0.02] as const },
  // The whole aircraft from ahead and above, so every system can be seen through the skin without the camera moving between them.
  systems: { target: [-0.3, 1.5, 0], azimuthDeg: 50, polarDeg: 62, distance: 17.5, minDistance: 2.2, maxDistance: 60, screenOffset: [0, 0.04] },
  // Motor 04 in the left half, the rest of the wing and fuselage behind it, the readout clear on the right.
  health: { ...CAMERA_PRESETS["mission-event"], azimuthDeg: 26, polarDeg: 73, distance: 13, screenOffset: [-0.15, 0.04] },
  twin: { ...CAMERA_PRESETS["digital-twin"], polarDeg: 68, distance: 20, screenOffset: [-0.13, 0.05] },
} satisfies Record<PreviewStageId, CameraPreset>;

export function previewPreset(state: UFlightState): CameraPreset {
  switch (state.mode) {
    case "systems":
      return VIEWS.systems;
    case "fault-lab":
      return VIEWS.health;
    case "twin":
      return VIEWS.twin;
    default:
      return VIEWS.discover;
  }
}

/** Stand far enough back that the whole aircraft fits the canvas, wide or tall. */
export const previewFit = (width: number, height: number) => Math.min(1.9, Math.max(0.8, (1.42 * height) / Math.max(1, width)));

/** The preview stays in a dark setting: the studio, or the twin's measured workspace (never the bright flight sky). */
export const previewEnvironment = (state: UFlightState) => (state.mode === "twin" ? "twin" : "studio");

export function UFlightSceneController({ clock, onReady }: { clock: StageClock; onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  const applied = useRef({ key: "", generation: -1, frames: 0 });

  useEffect(() => clock.setFrameRequester(invalidate), [clock, invalidate]);

  useEffect(() => {
    const lock = (state: UFlightState) => {
      const want = previewEnvironment(state);
      if (state.environment !== want) useUFlightStore.setState({ environment: want });
    };
    lock(useUFlightStore.getState());
    return useUFlightStore.subscribe(lock);
  }, []);

  // Before the simulation (−100) and the camera (−50), so a step's state is drawn in the same frame.
  useFrame((_, delta) => {
    clock.advance(Math.min(delta, 0.1));
    const stage = STAGES[clock.stage].id;
    const step = stepAt(stage, clock.local);
    const key = `${stage}:${step.key}`;
    const a = applied.current;
    if (key !== a.key || clock.generation !== a.generation) {
      const entering = clock.generation !== a.generation || !a.key.startsWith(`${stage}:`);
      a.key = key;
      a.generation = clock.generation;
      step.apply(entering);
    }
    if (a.frames < 6) {
      a.frames += 1;
      if (a.frames === 6) onReady();
    }
  }, -150);

  return null;
}
