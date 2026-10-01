// The mission as it is told: ten stages from preflight to post-flight
// maintenance, in two lengths. Timing lives here; the state machine and the
// flight model that use it are in simulation/mission.ts.
import type { EnvironmentId, MissionPhase, MissionProfile, MonitoredSystemId } from "../types";

/** Stages that take time, in order. IDLE and COMPLETE bracket them. */
export const MISSION_SEQUENCE = ["PREFLIGHT", "TAKEOFF", "TRANSITION", "CRUISE", "HEALTH_EVENT", "DIAGNOSIS", "PROGNOSIS", "APPROACH", "LANDING", "POSTFLIGHT"] as const satisfies readonly MissionPhase[];

export type ActivePhase = (typeof MISSION_SEQUENCE)[number];

/** Seconds per stage in the executive demo (about two minutes in all). */
const EXECUTIVE_S: Record<ActivePhase, number> = {
  PREFLIGHT: 9,
  TAKEOFF: 12,
  TRANSITION: 14,
  CRUISE: 14,
  HEALTH_EVENT: 11,
  DIAGNOSIS: 12,
  PROGNOSIS: 12,
  APPROACH: 14,
  LANDING: 12,
  POSTFLIGHT: 10,
};

/** The engineering mission runs each stage longer, for time to read the signals (about seven minutes). */
const ENGINEERING_FACTOR = 3.5;

export const STAGE_DURATION_S: Record<MissionProfile, Record<ActivePhase, number>> = {
  executive: EXECUTIVE_S,
  engineering: Object.fromEntries(MISSION_SEQUENCE.map((p) => [p, EXECUTIVE_S[p] * ENGINEERING_FACTOR])) as Record<ActivePhase, number>,
};

export const MISSION_PROFILES: readonly { id: MissionProfile; label: string; duration: string; text: string }[] = [
  { id: "executive", label: "EXECUTIVE DEMO", duration: "≈ 2 min", text: "The whole story, compressed: release, flight, a health event, the decision and the maintenance outcome." },
  { id: "engineering", label: "ENGINEERING MISSION", duration: "≈ 7 min", text: "The same mission with time to read the signals, the evidence and the prediction at each stage." },
];

export interface StageInfo {
  number: string;
  label: string;
  /** Screen-reader and caption text. */
  caption: string;
  environment: EnvironmentId;
  /** Health monitoring wording for the stage. */
  hums: string;
}

export const STAGE_INFO: Record<ActivePhase, StageInfo> = {
  PREFLIGHT: {
    number: "01",
    label: "PREFLIGHT",
    caption: "On the vertiport pad. Every system reports its health before the aircraft is released.",
    environment: "vertiport",
    hums: "HUMS READY",
  },
  TAKEOFF: {
    number: "02",
    label: "VERTICAL TAKEOFF",
    caption: "All eight propulsion units spool up and the aircraft rises. Battery power, motor current, rotor speed and motor temperature climb.",
    environment: "vertiport",
    hums: "HEALTH MONITORING ACTIVE",
  },
  TRANSITION: {
    number: "03",
    label: "TRANSITION",
    caption: "The tilt units rotate forward. As speed builds the wing takes over lift and the lift units slow and stop.",
    environment: "flight",
    hums: "HEALTH MONITORING ACTIVE",
  },
  CRUISE: {
    number: "04",
    label: "CRUISE",
    caption: "Efficient wing-borne flight on the four tilt units. A healthy aircraft is quiet: nothing needs attention.",
    environment: "flight",
    hums: "HUMS · BACKGROUND MONITORING",
  },
  HEALTH_EVENT: {
    number: "05",
    label: "HEALTH EVENT",
    caption: "Vibration on motor 04 begins to change. When the feature leaves the baseline model an anomaly is announced. The aircraft remains stable.",
    environment: "flight",
    hums: "ANOMALY DETECTED",
  },
  DIAGNOSIS: {
    number: "06",
    label: "DIAGNOSIS",
    caption: "The evidence is isolated to the front bearing of propulsion unit 04.",
    environment: "flight",
    hums: "POSSIBLE BEARING DEGRADATION",
  },
  PROGNOSIS: {
    number: "07",
    label: "PROGNOSIS",
    caption: "The degradation trend is projected forward to a maintenance window, and the mission consequence is decided.",
    environment: "flight",
    hums: "CONTINUE TO DESTINATION",
  },
  APPROACH: {
    number: "08",
    label: "APPROACH",
    caption: "The aircraft slows toward the destination vertiport and the tilt units rotate back up.",
    environment: "flight",
    hums: "POST-FLIGHT INSPECTION REQUIRED",
  },
  LANDING: {
    number: "09",
    label: "LANDING",
    caption: "Vertical descent to the pad on all eight units, and touchdown.",
    environment: "vertiport",
    hums: "POST-FLIGHT INSPECTION REQUIRED",
  },
  POSTFLIGHT: {
    number: "10",
    label: "POST-FLIGHT MAINTENANCE",
    caption: "Pre-flight and post-flight health are compared. Motor 04 has changed from nominal to degraded: maintenance is required.",
    environment: "vertiport",
    hums: "MAINTENANCE REQUIRED",
  },
};

/** Rows of the aircraft release assessment, in the order shown. */
export const RELEASE_ROWS: readonly { system: MonitoredSystemId | "hums"; label: string }[] = [
  { system: "energy", label: "ENERGY" },
  { system: "propulsion", label: "PROPULSION" },
  { system: "flightControl", label: "FLIGHT CONTROL" },
  { system: "navigation", label: "NAVIGATION" },
  { system: "structures", label: "STRUCTURE" },
  { system: "thermal", label: "THERMAL" },
  { system: "avionics", label: "AVIONICS" },
  { system: "hums", label: "HUMS" },
];

export const MISSION_DECISION = {
  subject: "MOTOR 04",
  finding: "Degradation detected",
  rows: [
    { label: "Immediate safety impact", value: "NONE" },
    { label: "Mission impact", value: "LOW" },
    { label: "Operational recommendation", value: "CONTINUE TO DESTINATION" },
    { label: "Post-flight", value: "INSPECTION REQUIRED" },
  ],
} as const;

export const MISSION_IMPACT_ROWS = [
  { label: "Immediate safety impact", value: "NONE" },
  { label: "Flight-control effect", value: "NONE" },
  { label: "Propulsion availability", value: "AVAILABLE" },
  { label: "Dispatch impact", value: "POST-FLIGHT INSPECTION REQUIRED" },
] as const;

export const LIFT_SHARE_NOTE = "Educational representation, not measured aerodynamics.";
