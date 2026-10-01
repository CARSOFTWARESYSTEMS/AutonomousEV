// The digital twin as four states of one quantity — OBSERVED (what the sensor
// reports), ESTIMATED (what the model infers), EXPECTED (healthy reference) and
// PREDICTED (where it is heading) — at any point on the time control.
// History and future are evaluated by moving the fault severity along its
// trajectory while holding the operating condition fixed. Simulated values.
import type { ComponentId, ExpectedRange, HealthState, MonitoredSystemId, Trend } from "../types";
import { round } from "../lib/math";
import { type HealthInputs, type HealthSnapshot, buildHealthSnapshot, residualLabel } from "./hums";
import { GROWTH_PER_CYCLE, describeWindow, maintenanceWindow, severityAt, trajectoryAt, trendOf, type TrajectoryPoint } from "./prognostics";

export interface TwinSubject {
  system: MonitoredSystemId;
  /** The component the twin is looking at. */
  component: ComponentId;
  title: string;
  /** The quantity compared between the physical aircraft and its reference. */
  quantity: string;
  signal: string;
  unit: string;
  places: number;
  /** Signal holding the inferred internal state, and its label. */
  estimate?: { signal: string; label: string; unit: string; places: number };
}

export const TWIN_SUBJECTS: Record<MonitoredSystemId, TwinSubject> = {
  propulsion: {
    system: "propulsion",
    component: "propulsion-unit-04",
    title: "MOTOR 04",
    quantity: "vibration",
    signal: "pu04.vibration",
    unit: "simulated units",
    places: 2,
    estimate: { signal: "pu04.bearingHealth", label: "Bearing health index", unit: "", places: 2 },
  },
  energy: {
    system: "energy",
    component: "battery-module-03",
    title: "BATTERY MODULE 03",
    quantity: "cell-group voltage spread",
    signal: "battery.m03.voltageSpread",
    unit: "mV",
    places: 0,
    estimate: { signal: "battery.m03.resistance", label: "Internal resistance estimate", unit: "mΩ", places: 1 },
  },
  flightControl: {
    system: "flightControl",
    component: "fcc-b",
    title: "FLIGHT COMPUTE",
    quantity: "channels in agreement",
    signal: "fcc.channels",
    unit: "of 3",
    places: 0,
  },
  structures: {
    system: "structures",
    component: "wing-structure-right",
    title: "WING ROOT",
    quantity: "spar root strain",
    signal: "structures.wingRootStrain",
    unit: "µε",
    places: 0,
    estimate: { signal: "structures.fatigueIndex", label: "Fatigue exposure", unit: "of reference life", places: 2 },
  },
  avionics: {
    system: "avionics",
    component: "network-switch-a",
    title: "DATA NETWORK",
    quantity: "networks available",
    signal: "avionics.networks",
    unit: "of 2",
    places: 0,
  },
  thermal: {
    system: "thermal",
    component: "heat-exchanger",
    title: "COOLING LOOP",
    quantity: "coolant temperature at the exchanger inlet",
    signal: "thermal.coolantIn",
    unit: "°C",
    places: 1,
  },
  navigation: {
    system: "navigation",
    component: "nav-processor",
    title: "POSITION SOLUTION",
    quantity: "position uncertainty",
    signal: "nav.positionUncertainty",
    unit: "m",
    places: 1,
  },
};

export type TwinEpoch = "past" | "now" | "future";

export const epochOf = (cycles: number): TwinEpoch => (cycles < 0 ? "past" : cycles > 0 ? "future" : "now");

export interface TwinReadout {
  subject: TwinSubject;
  epoch: TwinEpoch;
  cycles: number;
  /** Heading of the first value: what kind of number it is at this point in time. */
  valueLabel: "OBSERVED" | "RECORDED" | "PREDICTED";
  value: number;
  /** Set for the future: the range the prediction spans. */
  valueBand: { low: number; high: number } | null;
  expected: ExpectedRange | null;
  residual: string;
  state: HealthState;
  trend: Trend;
  projection: string;
  /** Maintenance window as text, or the absence of one. */
  window: string;
  estimate: { label: string; value: number; unit: string; places: number } | null;
  /** Health index trajectory across the whole horizon, for the timeline chart. */
  trajectory: TrajectoryPoint | null;
}

/** Severity of the active scenario moved `cycles` along a growth rate. */
const shifted = (inputs: HealthInputs, cycles: number, rate: number): HealthInputs => ({
  ...inputs,
  predictionCycles: cycles,
  faults: { ...inputs.faults, severity: Math.min(1, severityAt(inputs.faults.severity, cycles, rate)) },
});

const read = (snapshot: HealthSnapshot, signal: string) => snapshot.twin.observations[signal] ?? snapshot.twin.estimates[signal] ?? 0;

/** Does the active scenario bear on this subject? Only then does time move its value. */
function scenarioApplies(inputs: HealthInputs, subject: TwinSubject): boolean {
  if (inputs.faults.scenario === "bearing-degradation") return subject.system === "propulsion";
  if (inputs.faults.scenario === "battery-imbalance") return subject.system === "energy";
  return false;
}

/**
 * What the twin shows for one system at one point on the time control.
 * `now` is the live snapshot; past and future re-evaluate the same models.
 */
export function twinReadout(inputs: HealthInputs, now: HealthSnapshot, system: MonitoredSystemId, cycles: number): TwinReadout {
  const subject = TWIN_SUBJECTS[system];
  const epoch = epochOf(cycles);
  const applies = scenarioApplies(inputs, subject);
  const severity = applies ? inputs.faults.severity : 0;

  const at = epoch === "now" || !applies ? now : buildHealthSnapshot(shifted(inputs, cycles, GROWTH_PER_CYCLE.mean));
  const value = read(at, subject.signal);
  const expected = at.twin.expected[subject.signal] ?? null;

  let valueBand: TwinReadout["valueBand"] = null;
  if (epoch === "future" && applies) {
    const low = read(buildHealthSnapshot(shifted(inputs, cycles, GROWTH_PER_CYCLE.low)), subject.signal);
    const high = read(buildHealthSnapshot(shifted(inputs, cycles, GROWTH_PER_CYCLE.high)), subject.signal);
    valueBand = { low: Math.min(low, high), high: Math.max(low, high) };
  }

  const established = applies && (now.bearing.anomaly || now.battery.fault.anomaly);
  const window = established ? maintenanceWindow(severity) : null;
  const state = at.twin.systems[system].state === "NOMINAL" ? "NOMINAL" : (at.twin.components[subject.component]?.state ?? at.twin.systems[system].state);

  return {
    subject,
    epoch,
    cycles,
    valueLabel: epoch === "past" ? "RECORDED" : epoch === "future" ? "PREDICTED" : "OBSERVED",
    value,
    valueBand,
    expected,
    residual: expected ? residualLabel(value, expected) : "within baseline",
    state,
    trend: applies ? trendOf(severity) : "STABLE",
    projection: window ? "MAINTENANCE ACTION RECOMMENDED" : state === "NOMINAL" ? "NO ACTION PREDICTED" : "CONTINUE MONITORING",
    window: describeWindow(window),
    estimate: subject.estimate ? { label: subject.estimate.label, value: read(at, subject.estimate.signal), unit: subject.estimate.unit, places: subject.estimate.places } : null,
    trajectory: applies ? trajectoryAt(severity, cycles) : null,
  };
}

export const formatValue = (value: number, places: number) => round(value, places).toFixed(places);

export const formatRange = (range: ExpectedRange, places: number) => `${formatValue(range.min, places)}–${formatValue(range.max, places)}`;
