// Bearing degradation: one severity value (0 healthy – 1 worn) drives the
// vibration level, the synthesised signal in its three views, the diagnosis and
// the digital twin, so a chart, a state and a colour can never disagree.
// Everything here is a SIMULATED signal from a reference model.
import type { BearingStage, Confidence, HealthState } from "../types";

/** Severity at which each stage of the scenario begins. */
export const STAGE_AT: Record<BearingStage, number> = { healthy: 0, early: 0.14, anomaly: 0.45, diagnosis: 0.74 };
/** Where the scenario stops: clearly degraded, still running. */
export const SEVERITY_LIMIT = 0.82;
/** Seconds for the scenario to run from healthy to its limit. */
export const SCENARIO_SECONDS = 18;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function stageAt(severity: number): BearingStage {
  if (severity >= STAGE_AT.diagnosis) return "diagnosis";
  if (severity >= STAGE_AT.anomaly) return "anomaly";
  if (severity >= STAGE_AT.early) return "early";
  return "healthy";
}

/** Vibration level as a multiple of the healthy baseline. */
export const vibrationLevel = (severity: number) => 1 + 1.7 * Math.pow(clamp01(severity), 1.4);
/** Bearing temperature as a multiple of the healthy baseline: it follows vibration, later and more weakly. */
export const bearingTemperature = (severity: number) => 1 + 0.14 * Math.pow(clamp01(severity), 2.2);

export function healthState(severity: number): HealthState {
  if (severity >= STAGE_AT.diagnosis) return "degraded";
  if (severity >= STAGE_AT.anomaly) return "monitor";
  return "nominal";
}

/** Deterministic pseudo-noise in [-1, 1], so a signal is the same every time it is drawn. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** Bearing defect frequency, in multiples of shaft speed. Not a whole number, which is what marks it out. */
export const DEFECT_ORDER = 3.6;

/**
 * Time view: `count` samples over four shaft revolutions. The shaft-speed
 * component stays put; short bursts at the defect frequency grow with severity.
 */
export function waveform(severity: number, count = 180, phase = 0): number[] {
  const s = clamp01(severity);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const rev = (i / count) * 4 + phase;
    const shaft = 0.32 * Math.sin(rev * Math.PI * 2) + 0.1 * Math.sin(rev * Math.PI * 4 + 0.6);
    const burstPhase = (rev * DEFECT_ORDER) % 1;
    const burst = Math.exp(-burstPhase * 9) * Math.sin(burstPhase * Math.PI * 14);
    out.push(shaft + 1.25 * s * burst + (0.05 + 0.06 * s) * noise(i + Math.floor(phase * 97)));
  }
  return out;
}

export interface SpectrumLine {
  /** Frequency in multiples of shaft speed. */
  order: number;
  amplitude: number;
  defect: boolean;
}

/** Frequency view: the shaft harmonics, and the defect tone with its sidebands rising out of the floor. */
export function spectrum(severity: number): SpectrumLine[] {
  const s = clamp01(severity);
  const lines: SpectrumLine[] = [];
  for (let k = 1; k <= 32; k++) {
    const order = k * 0.25;
    let amplitude = 0.035 + 0.02 * Math.abs(noise(k));
    if (order === 1) amplitude = 0.62;
    else if (order === 2) amplitude = 0.24;
    else if (order === 3) amplitude = 0.1;
    let defect = false;
    for (const [at, gain] of [
      [DEFECT_ORDER, 0.78],
      [DEFECT_ORDER - 1, 0.3],
      [DEFECT_ORDER + 1, 0.3],
      [DEFECT_ORDER * 2, 0.36],
    ] as const) {
      if (Math.abs(order - at) < 0.13) {
        amplitude += gain * Math.pow(s, 1.2);
        defect = s > 0.05;
      }
    }
    lines.push({ order, amplitude, defect });
  }
  return lines;
}

/** Trend view: vibration level over the last `runs` simulated runs, ending at the present level. */
export function trend(severity: number, runs = 14): number[] {
  const s = clamp01(severity);
  return Array.from({ length: runs }, (_, i) => vibrationLevel(s * Math.pow(i / (runs - 1), 2.1)) + 0.025 * noise(i * 3 + 1));
}

export interface Diagnosis {
  finding: string;
  confidence: Confidence;
  evidence: readonly { label: string; present: boolean }[];
}

/** What the health logic concludes, and how sure it is. Confidence is a band, never a number. */
export function diagnose(severity: number): Diagnosis {
  const s = clamp01(severity);
  const trendUp = s >= STAGE_AT.early;
  const spectral = s >= STAGE_AT.anomaly;
  const thermalUp = s >= STAGE_AT.diagnosis;
  const count = [trendUp, spectral, thermalUp].filter(Boolean).length;
  return {
    finding: count === 0 ? "No deviation" : spectral ? "Possible bearing degradation" : "Deviation emerging",
    confidence: count >= 3 ? "HIGH" : count === 2 ? "MEDIUM" : "LOW",
    evidence: [
      { label: "Vibration trend", present: trendUp },
      { label: "Spectral feature", present: spectral },
      { label: "Thermal trend", present: thermalUp },
    ],
  };
}

// ── Digital twin: the same fault seen along a timeline ───────────────────────

/** Health index (1 healthy – 0 worn) at which maintenance is due. */
export const MAINTENANCE_THRESHOLD = 0.35;

/** Severity at twin time `tau`: -1 the healthy past, 0 now, +1 the predicted future. */
export function severityAt(tau: number, now: number): number {
  const t = Math.min(1, Math.max(-1, tau));
  if (t <= 0) return now * Math.pow(1 + t, 1.6);
  return now > 0 ? clamp01(now + (1 - now) * 0.85 * Math.pow(t, 1.25)) : 0;
}

/** Half-width of the prediction's uncertainty band in health index: nothing in the past, wider the further ahead. */
export const uncertaintyAt = (tau: number, now: number) => (tau <= 0 || now <= 0 ? 0 : 0.04 + 0.26 * tau);

export function uncertaintyLabel(tau: number, now: number): Confidence {
  const u = uncertaintyAt(tau, now);
  return u < 0.1 ? "LOW" : u < 0.22 ? "MEDIUM" : "HIGH";
}

export interface TwinReading {
  /** What the simulated sensor reports, × baseline. Unknown in the future. */
  observed: number | null;
  /** What the reference model expects, × baseline. */
  expected: number;
  /** Observed minus expected. */
  residual: number | null;
  /** Health the model infers (1 healthy – 0 worn). Unknown in the future. */
  estimated: number | null;
  /** Health the model projects, for the future only. */
  predicted: number | null;
  uncertainty: number;
}

export function twinReading(tau: number, now: number): TwinReading {
  const severity = severityAt(tau, now);
  const future = tau > 0.001;
  const observed = future ? null : vibrationLevel(severity);
  return {
    observed,
    expected: 1,
    residual: observed === null ? null : observed - 1,
    estimated: future ? null : 1 - severity,
    predicted: future ? 1 - severity : null,
    uncertainty: uncertaintyAt(tau, now),
  };
}

export interface TrendPoint {
  tau: number;
  health: number;
  low: number;
  high: number;
}

/** Health across the whole timeline, with the band that opens up after "now". */
export function healthTrend(now: number, points = 41): TrendPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const tau = -1 + (2 * i) / (points - 1);
    const health = 1 - severityAt(tau, now);
    const u = uncertaintyAt(tau, now);
    // The lower edge is left unclamped: a band that narrowed where it met zero would say the opposite of what it means.
    return { tau, health, low: health - u, high: Math.min(1, health + u) };
  });
}

/** Twin time at which the projected health reaches the maintenance threshold, or null if it never does. */
export function maintenanceWindow(now: number): { earliest: number; expected: number } | null {
  const points = healthTrend(now, 201).filter((p) => p.tau > 0);
  const expected = points.find((p) => p.health <= MAINTENANCE_THRESHOLD);
  const earliest = points.find((p) => p.low <= MAINTENANCE_THRESHOLD);
  return expected && earliest ? { earliest: earliest.tau, expected: expected.tau } : earliest ? { earliest: earliest.tau, expected: 1 } : null;
}
