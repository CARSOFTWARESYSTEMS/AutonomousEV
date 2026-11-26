// How a guided stage brings the simulation to the state it needs. Stages
// never fake a state: they issue the same commands a visitor could and, when
// a stage is opened out of order, fast-forward the deterministic fixed-step
// simulation until the state machine reaches the required phase.
import { DEFAULT_ROAD_INPUTS, type RoadInputs } from "@/lib/wireless-charging/dynamic";
import { sequenceIndex, stationCommand, stepStation } from "@/lib/wireless-charging/station";
import type { PhaseId } from "@/lib/wireless-charging/stateMachine";
import { resetEnvironment, runtime, stationStep } from "../state/runtime";
import { useTwin } from "../state/store";

const phase = () => runtime.station.state.phase;
const index = (p: PhaseId) => sequenceIndex(p);

/** True when the station's normal sequence has reached `target` (abnormal states count as not reached). */
export function reached(target: PhaseId): boolean {
  const i = index(phase());
  return i >= 0 && i >= index(target);
}

/** An empty bay with the station available. Resets only if a vehicle is present. */
export function ensureEmptyBay() {
  const st = runtime.station.state;
  if (st.vehicle.present || st.phase !== "available") resetEnvironment("station");
  // A new station starts with a vehicle arriving (the model's default session): hold it back here.
  runtime.station.commands.splice(0);
}

/** A vehicle arriving (or already further along). */
export function ensureArrival() {
  const st = runtime.station.state;
  if (st.phase === "departure" || st.phase === "completed") resetEnvironment("station");
  if (runtime.station.state.phase === "available") stationCommand(runtime.station, "arrive");
}

/**
 * Brings the station to at least `target` in its normal sequence. If it is
 * already past it, it stays where it is; if it is in an abnormal state, the
 * station is restarted. The fast-forward runs the same model, step by step.
 */
export function ensurePhase(target: PhaseId, maxSimSeconds = 90) {
  const st = runtime.station.state;
  if (index(st.phase) < 0 || st.phase === "departure" || st.phase === "completed") resetEnvironment("station");
  if (reached(target)) return;
  ensureArrival();
  const s = useTwin.getState();
  const h = stationStep(1);
  const steps = Math.ceil(maxSimSeconds / h);
  for (let i = 0; i < steps && !reached(target); i++) stepStation(runtime.station, s.faults, h);
}

export function depart() {
  stationCommand(runtime.station, "depart");
}

/** Sets a fault without counting as a visitor's interaction (the stage undoes it on exit). */
export function setStageFault(patch: Partial<ReturnType<typeof useTwin.getState>["faults"]>) {
  useTwin.setState((s) => ({ faults: { ...s.faults, ...patch } }));
}

/** Sets the simulation speed for a stage (labelled in the timeline when it is not real time). */
export function setStageSpeed(speed: number) {
  useTwin.setState({ speed });
}

/**
 * Sets the road inputs a stage needs (visible in the inputs drawer, not counted
 * as the visitor's interaction) and restarts the drive from the beginning of
 * the route, so the stage's outcome comes from a clean run of the model.
 */
export function applyRoadPreset(patch: Partial<RoadInputs>, restart = true) {
  const next = { ...DEFAULT_ROAD_INPUTS, ...patch };
  const same = JSON.stringify(next) === JSON.stringify(useTwin.getState().road);
  useTwin.setState({ road: next });
  if (restart || !same) resetEnvironment("dynamic");
}

/** The index of the first road pad at least `ahead` metres in front of the vehicle (for a failure demonstration). */
export function padAhead(ahead: number): number {
  const st = runtime.road.state;
  const seg = st.segments.find((g) => g.x - st.x >= ahead);
  return seg ? seg.index : -1;
}
