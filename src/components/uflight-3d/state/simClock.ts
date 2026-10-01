// Per-frame simulation clocks. These change every animation frame, so they
// live outside React state: the render loop advances them and the store only
// mirrors what the interface needs, at a throttled rate.
import { INITIAL_FAULT, type FaultMachine } from "../simulation/faultModels";
import { INITIAL_MISSION, type MissionMachine } from "../simulation/mission";

export const simClock = {
  mission: INITIAL_MISSION as MissionMachine,
  fault: INITIAL_FAULT as FaultMachine,
  /** Severity of the active fault scenario, eased toward its stage's level. */
  faultSeverity: 0,
};

export const nowS = () => (typeof performance === "undefined" ? 0 : performance.now() / 1000);

export function resetSimClock() {
  simClock.mission = INITIAL_MISSION;
  simClock.fault = INITIAL_FAULT;
  simClock.faultSeverity = 0;
}
