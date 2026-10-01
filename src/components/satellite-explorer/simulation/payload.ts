// Optical payload model: field of view, ground footprint and the
// acquire → capture → process → store sequence. Reference values only.
import { DEG, clamp01, smoothstep } from "../lib/math";
import { ORBIT_REFERENCE } from "./orbit";

export const PAYLOAD_REFERENCE = {
  /** Full across-track field of view. */
  fieldOfViewDeg: 7.6,
  storedBeforeCaptureMb: 243,
  captureSizeMb: 75,
  storageCapacityMb: 16000,
} as const;

/** Width of the imaged strip on the ground for a nadir view. */
export const swathKm = (altitudeKm: number = ORBIT_REFERENCE.altitudeKm) =>
  2 * altitudeKm * Math.tan((PAYLOAD_REFERENCE.fieldOfViewDeg / 2) * DEG);

export type PayloadPhase = "IDLE" | "TARGET_ACQUIRED" | "CAPTURING" | "PROCESSING" | "STORED";

/** Durations of the capture sequence, in sequence seconds. */
export const CAPTURE_TIMING = {
  acquireS: 2.4,
  exposeS: 1.6,
  processS: 3.6,
} as const;

export const CAPTURE_SEQUENCE_S = CAPTURE_TIMING.acquireS + CAPTURE_TIMING.exposeS + CAPTURE_TIMING.processS;

export interface CaptureSample {
  phase: PayloadPhase;
  /** 0–1 visibility of the field-of-view cone and footprint. */
  footprint: number;
  /** 0–1 exposure flash. */
  exposure: number;
  /** 0–1 progress of the data moving from the payload into storage. */
  transfer: number;
  storedMb: number;
}

/** State of the capture sequence `elapsedS` after target acquisition began (negative = not started). */
export function captureSequenceAt(elapsedS: number): CaptureSample {
  const { acquireS, exposeS, processS } = CAPTURE_TIMING;
  const base = PAYLOAD_REFERENCE.storedBeforeCaptureMb;
  if (elapsedS < 0) return { phase: "IDLE", footprint: 0, exposure: 0, transfer: 0, storedMb: base };
  const footprint = smoothstep(0, 0.8, elapsedS);
  if (elapsedS < acquireS) return { phase: "TARGET_ACQUIRED", footprint, exposure: 0, transfer: 0, storedMb: base };
  const sinceExpose = elapsedS - acquireS;
  if (sinceExpose < exposeS) {
    const x = sinceExpose / exposeS;
    return { phase: "CAPTURING", footprint, exposure: Math.sin(Math.PI * x), transfer: 0, storedMb: base };
  }
  const transfer = clamp01((sinceExpose - exposeS) / processS);
  const storedMb = Math.round(base + PAYLOAD_REFERENCE.captureSizeMb * transfer);
  return { phase: transfer < 1 ? "PROCESSING" : "STORED", footprint: 1 - smoothstep(0.75, 1, transfer) * 0.6, exposure: 0, transfer, storedMb };
}

export const PAYLOAD_PHASE_LABEL: Record<PayloadPhase, string> = {
  IDLE: "STANDBY",
  TARGET_ACQUIRED: "TARGET ACQUIRED",
  CAPTURING: "CAPTURE",
  PROCESSING: "PROCESSING",
  STORED: "STORED",
};

/** Megabytes received on the ground for a downlink progress fraction. */
export const downlinkedMb = (progress: number) => Math.round(PAYLOAD_REFERENCE.captureSizeMb * clamp01(progress));
