// Vehicle identification (SP-AI-001): the camera pipeline, its confidence,
// and the decision rule that combines plate recognition with RFID and QR.
//
// SIMULATED RECOGNITION. No image is captured and no inference model runs in
// this web application. Each stage of the pipeline is represented by its
// processing latency on an edge-class computer and by a declared error model:
// the probability that the plate is read correctly falls with low light,
// rain, plate obstruction and camera faults, and the reported confidence is
// drawn from different distributions for correct and incorrect reads, which
// overlap — so a confidence threshold trades false accepts against manual
// verifications, as it does in real systems. The numbers are assumptions to
// be replaced by an evaluation on labelled POC images.
import type { Rng } from "../math";
import { validPlate } from "./vehicles";
import type { AiDeployment, Region, VehicleProfile } from "./types";

export interface PipelineStage {
  id: "capture" | "preprocess" | "vehicle" | "plate-region" | "ocr" | "format" | "confidence" | "lookup";
  label: string;
  /** Processing time, s (edge computer, declared). */
  latency: number;
}

export const PIPELINE: readonly PipelineStage[] = [
  { id: "capture", label: "Camera frame", latency: 0.08 },
  { id: "preprocess", label: "Pre-processing (exposure, de-skew)", latency: 0.05 },
  { id: "vehicle", label: "Vehicle detection", latency: 0.32 },
  { id: "plate-region", label: "Plate region detection", latency: 0.18 },
  { id: "ocr", label: "Character recognition (OCR)", latency: 0.36 },
  { id: "format", label: "Regional format validation", latency: 0.01 },
  { id: "confidence", label: "Confidence estimation", latency: 0.01 },
  { id: "lookup", label: "Authorisation lookup (local database)", latency: 0.06 },
];

export const PIPELINE_LATENCY = PIPELINE.reduce((a, s) => a + s.latency, 0);

export interface Conditions {
  /** Illuminance at the gate, lux (daylight 10 000+, dusk 50, lit night 30). */
  lux: number;
  rain: boolean;
  cameraFault: boolean;
}

export interface RecognitionParams {
  /** Correct-read probability in good light with a clean plate. */
  baseAccuracy: number;
  /** Accept automatically at or above this confidence. */
  acceptThreshold: number;
  /** Below this the read is treated as unrecognised. */
  rejectThreshold: number;
  deployment: AiDeployment;
  /** Extra round trip when recognition runs in the cloud, s. */
  cloudLatency: number;
}

export const DEFAULT_RECOGNITION: RecognitionParams = { baseAccuracy: 0.97, acceptThreshold: 0.9, rejectThreshold: 0.6, deployment: "edge", cloudLatency: 0.45 };

export type ReadOutcome = "recognised" | "low-confidence" | "unrecognised" | "camera-fault";

export interface Recognition {
  outcome: ReadOutcome;
  /** What the OCR returned (synthetic), or null. */
  read: string | null;
  correct: boolean;
  confidence: number;
  formatValid: boolean;
  /** Total time from trigger to result, s. */
  latency: number;
  factors: string[];
  mode: "SIMULATED";
}

/** Probability of a correct read under the conditions (declared error model). */
export function readProbability(v: Pick<VehicleProfile, "plateObstructed">, c: Conditions, p: RecognitionParams = DEFAULT_RECOGNITION): { p: number; factors: string[] } {
  let q = p.baseAccuracy;
  const factors: string[] = [];
  if (c.lux < 80) {
    q *= c.lux < 20 ? 0.82 : 0.92;
    factors.push(c.lux < 20 ? "very low light" : "low light");
  }
  if (c.rain) {
    q *= 0.95;
    factors.push("rain on the lens");
  }
  if (v.plateObstructed) {
    q *= 0.45;
    factors.push("partial obstruction");
  }
  return { p: q, factors };
}

/** One recognition attempt. Deterministic for a given generator state. */
export function recognise(v: VehicleProfile, region: Region, c: Conditions, r: Rng, p: RecognitionParams = DEFAULT_RECOGNITION): Recognition {
  const extra = p.deployment === "cloud" ? p.cloudLatency : 0;
  if (c.cameraFault) return { outcome: "camera-fault", read: null, correct: false, confidence: 0, formatValid: false, latency: PIPELINE[0].latency + 0.5, factors: ["camera not responding"], mode: "SIMULATED" };
  if (v.plateCovered) {
    // Most of the plate is hidden: whatever OCR returns is never confident.
    const correct = r.next() < 0.5;
    const read = correct ? v.plate : corrupt(v.plate, r);
    const confidence = 0.62 + 0.2 * r.next();
    return { outcome: "low-confidence", read, correct, confidence, formatValid: validPlate(region, read), latency: PIPELINE_LATENCY + extra, factors: ["plate largely covered (mud and grime)"], mode: "SIMULATED" };
  }
  const { p: q, factors } = readProbability(v, c, p);
  const correct = r.next() < q;
  // Confidence: correct reads cluster high; wrong reads lower but overlapping.
  const u = r.next();
  const confidence = correct ? 0.86 + 0.13 * Math.sqrt(u) - (v.plateObstructed ? 0.12 * r.next() : 0) : 0.45 + 0.42 * u;
  const read = correct ? v.plate : corrupt(v.plate, r);
  const formatValid = validPlate(region, read);
  const conf = formatValid ? confidence : Math.min(confidence, 0.5);
  const outcome: ReadOutcome = conf >= p.acceptThreshold ? "recognised" : conf >= p.rejectThreshold ? "low-confidence" : "unrecognised";
  return { outcome, read, correct, confidence: conf, formatValid, latency: PIPELINE_LATENCY + extra, factors, mode: "SIMULATED" };
}

/** A plausible OCR error: one or two confusable characters substituted. */
function corrupt(plate: string, r: Rng): string {
  const swaps: Record<string, string> = { "0": "D", D: "0", "8": "B", B: "8", "5": "S", S: "5", "1": "I", "2": "Z", Z: "2", "6": "G", E: "F", M: "N" };
  const chars = [...plate];
  const n = 1 + Math.floor(r.next() * 2);
  for (let k = 0; k < n; k++) {
    const i = Math.floor(r.next() * chars.length);
    chars[i] = swaps[chars[i]] ?? chars[i];
  }
  const out = chars.join("");
  return out === plate ? plate.slice(0, -1) : out;
}

export type Credential = "plate" | "rfid" | "qr" | "visitor-ticket" | "operator";

export interface AccessDecision {
  identified: boolean;
  credential: Credential | null;
  /** Identity the system will use (plate as read, tag or token). */
  identity: string | null;
  authorised: boolean;
  role: "member" | "reservation" | "visitor" | "none";
  reason: string;
}

/**
 * The access rule. An uncertain plate is never authorised on its own: below
 * the accept threshold the driver must present RFID or QR, or an operator
 * verifies; a wrong read can only grant access if it happens to match the
 * access list, which is why the threshold is high.
 */
export function decideAccess(v: VehicleProfile, rec: Recognition, credential: { rfid: boolean; qr: boolean; visitorTicket: boolean; operatorApproved: boolean }, access: { plates: Set<string>; tags: Set<string>; tokens: Set<string> }): AccessDecision {
  if (rec.outcome === "recognised" && rec.read && access.plates.has(rec.read)) return { identified: true, credential: "plate", identity: rec.read, authorised: !v.denied, role: v.qr ? "reservation" : "member", reason: v.denied ? "Plate on the deny list" : "Plate recognised with high confidence and on the access list" };
  if (credential.rfid && v.rfid && access.tags.has(v.rfid)) return { identified: true, credential: "rfid", identity: v.rfid, authorised: !v.denied, role: "member", reason: "RFID tag verified" };
  if (credential.qr && v.qr && access.tokens.has(v.qr)) return { identified: true, credential: "qr", identity: v.qr, authorised: !v.denied, role: "reservation", reason: "Reservation QR code verified" };
  if (credential.operatorApproved) return { identified: true, credential: "operator", identity: rec.read ?? v.id, authorised: true, role: "visitor", reason: "Verified by an operator" };
  if (credential.visitorTicket) return { identified: true, credential: "visitor-ticket", identity: rec.read ?? `TICKET-${v.id}`, authorised: !v.denied, role: "visitor", reason: v.denied ? "Vehicle refused" : "Visitor ticket issued at the reader" };
  if (rec.outcome === "recognised" && rec.read) return { identified: true, credential: "plate", identity: rec.read, authorised: false, role: "none", reason: "Plate read but not on the access list" };
  return { identified: false, credential: null, identity: null, authorised: false, role: "none", reason: rec.outcome === "camera-fault" ? "Camera unavailable" : rec.outcome === "low-confidence" ? "Plate read with low confidence: not authorised automatically" : "Plate not recognised" };
}
