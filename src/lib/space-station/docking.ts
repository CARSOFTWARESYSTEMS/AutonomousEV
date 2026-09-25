// Simplified rendezvous-and-docking state machine.
// Ranges, rates and capture limits are illustrative teaching values — they
// are not taken from any docking-system specification.

export type DockingStageId =
  | "far-field"
  | "approach"
  | "hold-point"
  | "final-approach"
  | "soft-capture"
  | "hard-capture"
  | "leak-check"
  | "hatch-open";

export interface DockingStage {
  id: DockingStageId;
  label: string;
  explanation: string;
}

export const DOCKING_STAGES: DockingStage[] = [
  { id: "far-field", label: "Far-field rendezvous", explanation: "Phasing burns bring the visiting vehicle into the station's orbit plane and close the along-track gap, navigating with ground tracking and satellite navigation." },
  { id: "approach", label: "Approach", explanation: "Relative navigation sensors (for example radio ranging, lidar or cameras) take over. Closing rate is reduced as range falls." },
  { id: "hold-point", label: "Hold point", explanation: "The vehicle stops at a pre-agreed distance. Crew and ground confirm systems, alignment and go/no-go before continuing." },
  { id: "final-approach", label: "Final approach", explanation: "The vehicle follows a narrow approach corridor along the docking axis, keeping lateral and angular errors inside tight limits." },
  { id: "soft-capture", label: "Soft capture", explanation: "Mechanisms make first contact and latch, absorbing residual relative motion." },
  { id: "hard-capture", label: "Hard capture", explanation: "Structural hooks or latches pull the interfaces together and form a rigid, pressure-tight seal." },
  { id: "leak-check", label: "Leak check", explanation: "The small volume between hatches is pressurised and monitored to confirm the seal holds before anyone opens a hatch." },
  { id: "hatch-open", label: "Hatch opening", explanation: "Pressures are equalised, the atmosphere is checked, and the crew opens the hatches." },
];

export const DOCKING_LIMITS = {
  farFieldRangeM: 2000,
  holdPointRangeM: 200,
  finalApproachStartM: 30,
  /** Corridor: allowed closing rate ≈ range × k, bounded. */
  corridorGainPerS: 0.001,
  corridorMinMs: 0.05,
  corridorMaxMs: 1.5,
  captureMinMs: 0.02,
  captureMaxMs: 0.1,
  captureLateralM: 0.1,
  captureAngleDeg: 4,
  /** Lateral/angular limits relax linearly with range beyond final approach. */
  corridorLateralPerM: 0.05,
} as const;

export interface RelativeState {
  rangeM: number;
  closingRateMs: number;
  lateralOffsetM: number;
  angleDeg: number;
}

export function stageForRange(rangeM: number, heldAtHoldPoint: boolean): DockingStageId {
  const L = DOCKING_LIMITS;
  if (rangeM > L.farFieldRangeM) return "far-field";
  if (rangeM > L.holdPointRangeM) return "approach";
  if (rangeM > L.finalApproachStartM && !heldAtHoldPoint) return "hold-point";
  if (rangeM > 0) return "final-approach";
  return "soft-capture";
}

/** Allowed closing rate at a given range: v_max = clamp(k·r, v_min, v_cap). */
export function allowedClosingRate(rangeM: number): number {
  const L = DOCKING_LIMITS;
  return Math.min(L.corridorMaxMs, Math.max(L.corridorMinMs, rangeM * L.corridorGainPerS));
}

/** Lateral tolerance inside the approach corridor at a given range. */
export function allowedLateral(rangeM: number): number {
  return DOCKING_LIMITS.captureLateralM + rangeM * DOCKING_LIMITS.corridorLateralPerM;
}

export interface CorridorCheck {
  ok: boolean;
  reasons: string[];
}

export function checkCorridor(s: RelativeState): CorridorCheck {
  const reasons: string[] = [];
  const vMax = allowedClosingRate(s.rangeM);
  if (s.closingRateMs > vMax) reasons.push(`Closing rate ${s.closingRateMs.toFixed(2)} m/s exceeds the ${vMax.toFixed(2)} m/s allowed at ${Math.round(s.rangeM)} m.`);
  if (s.closingRateMs <= 0) reasons.push("The vehicle is not closing on the station.");
  const lat = allowedLateral(s.rangeM);
  if (Math.abs(s.lateralOffsetM) > lat) reasons.push(`Lateral offset ${Math.abs(s.lateralOffsetM).toFixed(2)} m is outside the ${lat.toFixed(2)} m corridor.`);
  return { ok: reasons.length === 0, reasons };
}

export function checkCapture(s: RelativeState): CorridorCheck {
  const L = DOCKING_LIMITS;
  const reasons: string[] = [];
  if (s.closingRateMs < L.captureMinMs) reasons.push(`Contact at ${s.closingRateMs.toFixed(3)} m/s is too slow to engage the capture latches (≥ ${L.captureMinMs} m/s).`);
  if (s.closingRateMs > L.captureMaxMs) reasons.push(`Contact at ${s.closingRateMs.toFixed(3)} m/s exceeds the ${L.captureMaxMs} m/s the mechanism can absorb.`);
  if (Math.abs(s.lateralOffsetM) > L.captureLateralM) reasons.push(`Lateral misalignment ${Math.abs(s.lateralOffsetM).toFixed(2)} m exceeds ${L.captureLateralM} m.`);
  if (Math.abs(s.angleDeg) > L.captureAngleDeg) reasons.push(`Angular misalignment ${Math.abs(s.angleDeg).toFixed(1)}° exceeds ${L.captureAngleDeg}°.`);
  return { ok: reasons.length === 0, reasons };
}

/** Advance range by one step; never overshoots zero. */
export function advanceRange(rangeM: number, closingRateMs: number, dtS: number): number {
  return Math.max(0, rangeM - Math.max(0, closingRateMs) * dtS);
}

/** Time to cover a range at constant closing rate. */
export function timeToContactS(rangeM: number, closingRateMs: number): number {
  return closingRateMs > 0 ? rangeM / closingRateMs : Infinity;
}

// ── Time-stepped approach used by the docking simulator ──

export type DockPhase = "ready" | "approach" | "hold" | "final" | "mating" | "complete" | "abort";

export interface DockSim {
  phase: DockPhase;
  stage: DockingStageId;
  rangeM: number;
  elapsedS: number;
  matingIndex: number;
  matingElapsedS: number;
  message: string;
  reasons: string[];
}

export interface DockControls {
  closingRateMs: number;
  lateralOffsetM: number;
  angleDeg: number;
}

export const DOCK_START_RANGE_M = 3000;
/** Simulated seconds spent in each post-contact step (illustrative). */
export const MATING_DURATIONS_S = [60, 120, 300, 120] as const;
const MATING_STAGES: DockingStageId[] = ["soft-capture", "hard-capture", "leak-check", "hatch-open"];

export function initialDock(): DockSim {
  return { phase: "ready", stage: "far-field", rangeM: DOCK_START_RANGE_M, elapsedS: 0, matingIndex: 0, matingElapsedS: 0, message: "Ready. Start the approach.", reasons: [] };
}

/** Speed-up factor so each phase is watchable in a few seconds. */
export function timeWarp(s: DockSim, c: DockControls): number {
  // Final approach: on-screen range halves roughly every 1.4 s, slowing to ×10 for contact (~12 s total).
  if (s.phase === "final") return Math.min(400, Math.max(10, s.rangeM / (2 * Math.max(c.closingRateMs, 0.01))));
  // The automatic approach slows as range shrinks (≈47 min simulated), so it is sped up most.
  if (s.phase === "approach") return 400;
  return 120;
}

/** Guidance closing rate used automatically before the hold point. */
export const autoClosingRate = (rangeM: number) => 0.8 * allowedClosingRate(rangeM);

export function tickDock(s: DockSim, dtS: number, c: DockControls): DockSim {
  const L = DOCKING_LIMITS;
  if (s.phase === "approach") {
    const rangeM = Math.max(L.holdPointRangeM, advanceRange(s.rangeM, autoClosingRate(s.rangeM), dtS));
    if (rangeM <= L.holdPointRangeM) {
      return { ...s, rangeM, elapsedS: s.elapsedS + dtS, phase: "hold", stage: "hold-point", message: `Holding at ${L.holdPointRangeM} m. Check alignment, then give "go" for final approach.` };
    }
    return { ...s, rangeM, elapsedS: s.elapsedS + dtS, stage: stageForRange(rangeM, false) };
  }
  if (s.phase === "final") {
    const state = { rangeM: s.rangeM, closingRateMs: c.closingRateMs, lateralOffsetM: c.lateralOffsetM, angleDeg: c.angleDeg };
    const corridor = checkCorridor(state);
    if (!corridor.ok) {
      return { ...s, phase: "abort", message: "Abort: vehicle left the approach corridor and retreats to the hold point.", reasons: corridor.reasons };
    }
    const rangeM = advanceRange(s.rangeM, c.closingRateMs, dtS);
    if (rangeM > 0) return { ...s, rangeM, elapsedS: s.elapsedS + dtS, stage: "final-approach" };
    const capture = checkCapture({ ...state, rangeM: 0 });
    if (!capture.ok) return { ...s, rangeM: 0, phase: "abort", stage: "soft-capture", message: "Capture failed: the vehicle backs away for another attempt.", reasons: capture.reasons };
    return { ...s, rangeM: 0, elapsedS: s.elapsedS + dtS, phase: "mating", stage: "soft-capture", matingIndex: 0, matingElapsedS: 0, message: "Contact. Soft capture latches engaged.", reasons: [] };
  }
  if (s.phase === "mating") {
    let { matingIndex, matingElapsedS } = s;
    matingElapsedS += dtS;
    if (matingElapsedS >= MATING_DURATIONS_S[matingIndex]) {
      matingElapsedS = 0;
      matingIndex += 1;
      if (matingIndex >= MATING_STAGES.length) {
        return { ...s, elapsedS: s.elapsedS + dtS, phase: "complete", stage: "hatch-open", matingIndex: MATING_STAGES.length - 1, message: "Hatches open. Crew can enter the visiting vehicle.", reasons: [] };
      }
    }
    const msg = ["Soft capture: residual motion damped.", "Hard capture: hooks pull the interfaces into a rigid, sealed joint.", "Leak check: vestibule pressurised and monitored.", "Pressures equalised; opening hatches."][matingIndex];
    return { ...s, elapsedS: s.elapsedS + dtS, matingIndex, matingElapsedS, stage: MATING_STAGES[matingIndex], message: msg };
  }
  return s;
}
