// Mission model: an explicit stage machine plus a deterministic function from
// mission time to spacecraft state. The mission clock is a compressed
// educational timeline (12:00 total); each stage maps to a real span of the
// reference orbit, so sunrise, target overflight and the ground pass happen
// where the orbit model says they do.
import type { AttitudeMode, MissionStage, PowerState, Quat, SatelliteState, SpacecraftMode, Vec3 } from "../types";
import { DEG, clamp01, easeInOutCubic, lerp, normalize, quatMultiply, quatSlerp, smoothstep } from "../lib/math";
import { ADCS_REFERENCE, attitudeFor, bodyRate, sunIncidenceCos, wheelSpeedsRpm } from "./adcs";
import { type LinkSample, linkAt } from "./communications";
import { GROUND_STATION, OBSERVATION_TARGET, ORBIT_EVENTS, SUN_DIRECTION, orbitStateAt, sunFractionAt, surfacePointAt } from "./orbit";
import { type CaptureSample, PAYLOAD_REFERENCE, captureSequenceAt } from "./payload";
import { type LoadContext, type LoadId, generationW, loadsW, stepBattery, totalLoadW } from "./power";

/** Stages in running order. IDLE is the state before a mission is started. */
export const MISSION_STAGE_ORDER = [
  "BOOT",
  "POWER",
  "ATTITUDE",
  "TARGET",
  "CAPTURE",
  "STORE",
  "GROUND_PASS",
  "UPLINK",
  "TELEMETRY",
  "PAYLOAD_DOWNLINK",
  "COMPLETE",
] as const satisfies readonly MissionStage[];

export type ActiveMissionStage = (typeof MISSION_STAGE_ORDER)[number];

/** Mission-clock seconds advanced per real second during playback. */
export const MISSION_PLAYBACK_RATE = 6;

const { eclipseExitS, pass } = ORBIT_EVENTS;

/** [mission-clock duration, orbit start, orbit end] per stage. */
const STAGE_TIMING: Record<ActiveMissionStage, readonly [number, number, number]> = {
  BOOT: [45, eclipseExitS - 150, eclipseExitS - 40],
  POWER: [60, eclipseExitS - 40, eclipseExitS + 110],
  ATTITUDE: [70, eclipseExitS + 110, eclipseExitS + 260],
  TARGET: [70, eclipseExitS + 260, -45],
  CAPTURE: [70, -45, 18],
  STORE: [45, 18, 44],
  GROUND_PASS: [60, 44, pass.aosS + 22],
  UPLINK: [80, pass.aosS + 22, pass.aosS + 114],
  TELEMETRY: [60, pass.aosS + 114, pass.aosS + 184],
  PAYLOAD_DOWNLINK: [100, pass.aosS + 184, pass.losS - 35],
  COMPLETE: [60, pass.losS - 35, pass.losS + 75],
};

export interface StagePlan {
  stage: ActiveMissionStage;
  /** 1-based position in the mission. */
  index: number;
  startS: number;
  endS: number;
  orbitStartS: number;
  orbitEndS: number;
}

export const MISSION_PLAN: readonly StagePlan[] = (() => {
  let cursor = 0;
  return MISSION_STAGE_ORDER.map((stage, i) => {
    const [duration, orbitStartS, orbitEndS] = STAGE_TIMING[stage];
    const plan: StagePlan = { stage, index: i + 1, startS: cursor, endS: cursor + duration, orbitStartS, orbitEndS };
    cursor += duration;
    return plan;
  });
})();

export const MISSION_DURATION_S = MISSION_PLAN[MISSION_PLAN.length - 1].endS;

const PLAN_BY_STAGE = Object.fromEntries(MISSION_PLAN.map((p) => [p.stage, p])) as Record<ActiveMissionStage, StagePlan>;

export const stagePlan = (stage: ActiveMissionStage) => PLAN_BY_STAGE[stage];

export const isActiveStage = (stage: MissionStage): stage is ActiveMissionStage => stage !== "IDLE";

export function planAt(missionTimeS: number): StagePlan {
  const t = Math.min(Math.max(missionTimeS, 0), MISSION_DURATION_S);
  return MISSION_PLAN.find((p) => t < p.endS) ?? MISSION_PLAN[MISSION_PLAN.length - 1];
}

export const stageAt = (missionTimeS: number): ActiveMissionStage => planAt(missionTimeS).stage;

export function nextStage(stage: MissionStage): ActiveMissionStage {
  if (stage === "IDLE") return MISSION_STAGE_ORDER[0];
  const i = MISSION_STAGE_ORDER.indexOf(stage);
  return MISSION_STAGE_ORDER[Math.min(i + 1, MISSION_STAGE_ORDER.length - 1)];
}

export function previousStage(stage: MissionStage): ActiveMissionStage {
  if (stage === "IDLE") return MISSION_STAGE_ORDER[0];
  const i = MISSION_STAGE_ORDER.indexOf(stage);
  return MISSION_STAGE_ORDER[Math.max(i - 1, 0)];
}

/** Orbit time shown at a mission time (monotonic, piecewise linear). */
export function orbitTimeAt(missionTimeS: number): number {
  const p = planAt(missionTimeS);
  const f = clamp01((missionTimeS - p.startS) / (p.endS - p.startS));
  return lerp(p.orbitStartS, p.orbitEndS, f);
}

// ── Stage machine ─────────────────────────────────────────────────────────
export interface MissionMachine {
  stage: MissionStage;
  timeS: number;
  playing: boolean;
}

export type MissionEvent =
  | { type: "RUN" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "RESTART" }
  | { type: "RESET" }
  | { type: "SEEK"; timeS: number }
  | { type: "TICK"; dtS: number };

export const INITIAL_MISSION: MissionMachine = { stage: "IDLE", timeS: 0, playing: false };

const atTime = (timeS: number, playing: boolean): MissionMachine => {
  const t = Math.min(Math.max(timeS, 0), MISSION_DURATION_S);
  return { stage: stageAt(t), timeS: t, playing: playing && t < MISSION_DURATION_S };
};

/** Pure transition function: every mission control maps to one event. */
export function missionReducer(state: MissionMachine, event: MissionEvent): MissionMachine {
  switch (event.type) {
    case "RUN":
    case "RESTART":
      return atTime(0, true);
    case "RESET":
      return INITIAL_MISSION;
    case "PLAY":
      if (state.stage === "IDLE" || state.timeS >= MISSION_DURATION_S) return atTime(0, true);
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };
    case "NEXT": {
      if (state.stage === "IDLE") return atTime(0, false);
      if (state.stage === "COMPLETE") return atTime(MISSION_DURATION_S, false);
      return atTime(stagePlan(nextStage(state.stage)).startS, state.playing);
    }
    case "PREVIOUS": {
      if (state.stage === "IDLE") return state;
      return atTime(stagePlan(previousStage(state.stage)).startS, state.playing);
    }
    case "SEEK":
      return atTime(event.timeS, state.playing);
    case "TICK": {
      if (!state.playing || state.stage === "IDLE") return state;
      return atTime(state.timeS + event.dtS * MISSION_PLAYBACK_RATE, true);
    }
  }
}

export const isMissionComplete = (state: MissionMachine) => state.stage === "COMPLETE" && state.timeS >= MISSION_DURATION_S;

// ── Attitude schedule ─────────────────────────────────────────────────────
/** DRIFT is the uncontrolled attitude before the ADCS has acquired. */
type ScheduledAttitude = AttitudeMode | "DRIFT";

interface Slew {
  stage: ActiveMissionStage;
  /** Stage-progress window in which the slew happens. */
  from: number;
  to: number;
  target: ScheduledAttitude;
}

const INITIAL_ATTITUDE: ScheduledAttitude = "DRIFT";

const SLEWS: readonly Slew[] = [
  { stage: "ATTITUDE", from: 0.15, to: 0.75, target: "NADIR" },
  { stage: "CAPTURE", from: 0.04, to: 0.3, target: "TARGET_TRACK" },
  { stage: "STORE", from: 0.05, to: 0.9, target: "NADIR" },
  { stage: "UPLINK", from: 0.5, to: 0.85, target: "STATION_TRACK" },
  { stage: "COMPLETE", from: 0.1, to: 0.5, target: "NADIR" },
];

const DRIFT_AXIS: Vec3 = normalize([0.5, 0.3, 0.8]);

function scheduledAttitude(mode: ScheduledAttitude, orbitT: number): Quat {
  const orbit = orbitStateAt(orbitT);
  const ctx = { position: orbit.position, velocityDir: orbit.velocityDir, sunDir: SUN_DIRECTION };
  if (mode === "DRIFT") {
    // A slow tumble away from nadir: plausible for a spacecraft that has just booted.
    const half = ((42 + 0.12 * (orbitT - MISSION_PLAN[0].orbitStartS)) * DEG) / 2;
    const s = Math.sin(half);
    return quatMultiply(attitudeFor("NADIR", ctx), [DRIFT_AXIS[0] * s, DRIFT_AXIS[1] * s, DRIFT_AXIS[2] * s, Math.cos(half)]);
  }
  if (mode === "TARGET_TRACK") return attitudeFor(mode, { ...ctx, aimPoint: surfacePointAt(OBSERVATION_TARGET, orbitT) });
  if (mode === "STATION_TRACK") return attitudeFor(mode, { ...ctx, aimPoint: surfacePointAt(GROUND_STATION, orbitT) });
  return attitudeFor(mode, ctx);
}

interface AttitudeSample {
  attitude: Quat;
  /** Mode being held, or slewed toward. */
  mode: ScheduledAttitude;
  slewing: boolean;
}

function attitudeSampleAt(missionTimeS: number): AttitudeSample {
  const t = Math.min(Math.max(missionTimeS, 0), MISSION_DURATION_S);
  const orbitT = orbitTimeAt(t);
  let held: ScheduledAttitude = INITIAL_ATTITUDE;
  for (const slew of SLEWS) {
    const p = stagePlan(slew.stage);
    const start = lerp(p.startS, p.endS, slew.from);
    const end = lerp(p.startS, p.endS, slew.to);
    if (t >= end) {
      held = slew.target;
      continue;
    }
    if (t > start) {
      const blend = easeInOutCubic((t - start) / (end - start));
      return {
        attitude: quatSlerp(scheduledAttitude(held, orbitT), scheduledAttitude(slew.target, orbitT), blend),
        mode: slew.target,
        slewing: true,
      };
    }
    break;
  }
  return { attitude: scheduledAttitude(held, orbitT), mode: held, slewing: false };
}

// ── Snapshot ──────────────────────────────────────────────────────────────
export type CommandPhase = "NONE" | "UPLINK" | "ROUTING" | "EXECUTING" | "VERIFIED";

export interface MissionSnapshot extends SatelliteState {
  stage: ActiveMissionStage;
  stageIndex: number;
  /** 0–1 progress through the current stage. */
  stageProgress: number;
  missionTimeS: number;
  attitudeMode: AttitudeMode | "DRIFT";
  slewing: boolean;
  attitudeLocked: boolean;
  /** 0–1: flight computer start-up. */
  bootProgress: number;
  sunFraction: number;
  powerState: PowerState;
  batteryW: number;
  loads: Record<LoadId, number>;
  wheelRpm: [number, number, number, number];
  link: LinkSample;
  capture: CaptureSample;
  command: { phase: CommandPhase; progress: number };
  /** 0–1 once telemetry frames are flowing to the ground. */
  telemetry: number;
  /** 0–1 payload downlink progress. */
  downlink: number;
  /** Short status line for the current moment, or null. */
  callout: string | null;
}

const CAPTURE_SEQUENCE_START = 0.35;

function captureAt(t: number): CaptureSample {
  const capture = stagePlan("CAPTURE");
  if (t < capture.startS) return captureSequenceAt(-1);
  const startS = lerp(capture.startS, capture.endS, CAPTURE_SEQUENCE_START);
  const sample = captureSequenceAt((t - startS) / MISSION_PLAYBACK_RATE);
  if (t < capture.endS) return sample;
  // After the stage the footprint is gone and the data is safely stored.
  return { ...sample, phase: "STORED", footprint: 0, transfer: 1, storedMb: PAYLOAD_REFERENCE.storedBeforeCaptureMb + PAYLOAD_REFERENCE.captureSizeMb };
}

function commandAt(stage: ActiveMissionStage, p: number, index: number): { phase: CommandPhase; progress: number } {
  if (index > stagePlan("UPLINK").index) return { phase: "VERIFIED", progress: 1 };
  if (stage !== "UPLINK" || p < 0.05) return { phase: "NONE", progress: 0 };
  if (p < 0.3) return { phase: "UPLINK", progress: (p - 0.05) / 0.25 };
  if (p < 0.5) return { phase: "ROUTING", progress: (p - 0.3) / 0.2 };
  if (p < 0.88) return { phase: "EXECUTING", progress: (p - 0.5) / 0.38 };
  return { phase: "VERIFIED", progress: 1 };
}

const SPACECRAFT_MODE: Record<ActiveMissionStage, SpacecraftMode> = {
  BOOT: "INITIALIZATION",
  POWER: "INITIALIZATION",
  ATTITUDE: "INITIALIZATION",
  TARGET: "NOMINAL",
  CAPTURE: "IMAGING",
  STORE: "NOMINAL",
  GROUND_PASS: "NOMINAL",
  UPLINK: "NOMINAL",
  TELEMETRY: "NOMINAL",
  PAYLOAD_DOWNLINK: "DOWNLINK",
  COMPLETE: "NOMINAL",
};

interface Activity {
  plan: StagePlan;
  progress: number;
  orbitT: number;
  attitude: AttitudeSample;
  capture: CaptureSample;
  command: { phase: CommandPhase; progress: number };
  telemetry: number;
  downlink: number;
  sunFraction: number;
  generatedW: number;
  loads: Record<LoadId, number>;
  attitudeLocked: boolean;
}

function activityAt(missionTimeS: number): Activity {
  const t = Math.min(Math.max(missionTimeS, 0), MISSION_DURATION_S);
  const plan = planAt(t);
  const progress = clamp01((t - plan.startS) / (plan.endS - plan.startS));
  const orbitT = orbitTimeAt(t);
  const attitude = attitudeSampleAt(t);
  const capture = captureAt(t);
  const command = commandAt(plan.stage, progress, plan.index);
  const telemetry =
    plan.stage === "TELEMETRY" ? smoothstep(0.08, 0.45, progress) : plan.index > stagePlan("TELEMETRY").index ? 1 : 0;
  const downlink =
    plan.stage === "PAYLOAD_DOWNLINK" ? clamp01((progress - 0.06) / 0.86) : plan.index > stagePlan("PAYLOAD_DOWNLINK").index ? 1 : 0;
  const sunFraction = sunFractionAt(orbitT);
  const attitudeLocked = plan.index > stagePlan("ATTITUDE").index || (plan.stage === "ATTITUDE" && progress >= 0.78);
  const ctx: LoadContext = {
    sunlit: sunFraction > 0.5,
    booting: !attitudeLocked && plan.stage !== "ATTITUDE",
    imaging: capture.phase === "CAPTURING",
    processing: capture.phase === "PROCESSING",
    slewing: attitude.slewing,
    sbandTransmit: command.phase === "VERIFIED" && plan.stage === "UPLINK" ? true : plan.stage === "TELEMETRY",
    xbandTransmit: plan.stage === "PAYLOAD_DOWNLINK" && downlink > 0 && downlink < 1,
  };
  return {
    plan,
    progress,
    orbitT,
    attitude,
    capture,
    command,
    telemetry,
    downlink,
    sunFraction,
    generatedW: generationW(sunFraction, sunIncidenceCos(attitude.attitude, SUN_DIRECTION)),
    loads: loadsW(ctx),
    attitudeLocked,
  };
}

// Battery history is integrated once so any mission time can be looked up or scrubbed to.
const BATTERY_STEP_S = 0.5;
const INITIAL_SOC = 0.605;

interface BatteryRow {
  soc: number;
  batteryW: number;
  state: PowerState;
}

const BATTERY_TABLE: readonly BatteryRow[] = (() => {
  const rows: BatteryRow[] = [];
  let soc = INITIAL_SOC;
  for (let t = 0; t <= MISSION_DURATION_S + BATTERY_STEP_S; t += BATTERY_STEP_S) {
    const a = activityAt(t);
    const orbitDt = orbitTimeAt(t + BATTERY_STEP_S) - a.orbitT;
    const step = stepBattery(soc, a.generatedW, totalLoadW(a.loads), Math.max(orbitDt, 0));
    rows.push({ soc, batteryW: step.batteryW, state: step.state });
    soc = step.socFraction;
  }
  return rows;
})();

function calloutFor(a: Activity, link: LinkSample): string | null {
  const { stage } = a.plan;
  const p = a.progress;
  switch (stage) {
    case "BOOT":
      return p >= 0.7 ? "BOOT COMPLETE" : null;
    case "POWER":
      return a.sunFraction > 0.5 ? "SUNLIGHT · BATTERY CHARGING" : null;
    case "ATTITUDE":
      return a.attitudeLocked ? "ATTITUDE ACQUIRED" : null;
    case "TARGET":
      return p >= 0.55 ? "TARGET AHEAD" : null;
    case "CAPTURE":
      if (a.capture.phase === "TARGET_ACQUIRED") return "TARGET ACQUIRED";
      if (a.capture.phase === "CAPTURING") return "CAPTURE";
      return null;
    case "STORE":
      return "PAYLOAD DATA · 75 MB STORED ONBOARD";
    case "GROUND_PASS":
      return link.visible ? "AOS" : null;
    case "UPLINK":
      if (a.command.phase === "VERIFIED") return "COMMAND VERIFIED";
      if (a.command.phase === "EXECUTING") return "EXECUTING COMMAND";
      if (a.command.phase === "ROUTING") return "COMMAND RECEIVED";
      return a.command.phase === "UPLINK" ? "COMMAND UPLINK" : null;
    case "TELEMETRY":
      return a.telemetry >= 1 ? "SPACECRAFT NOMINAL" : null;
    case "PAYLOAD_DOWNLINK":
      return a.downlink >= 1 ? "EARTH OBSERVATION DATA RECEIVED" : null;
    case "COMPLETE":
      return link.visible ? null : "LOS";
  }
}

/** Complete, deterministic spacecraft state for a mission time. */
export function missionSnapshotAt(missionTimeS: number): MissionSnapshot {
  const a = activityAt(missionTimeS);
  const t = Math.min(Math.max(missionTimeS, 0), MISSION_DURATION_S);
  const row = BATTERY_TABLE[Math.min(BATTERY_TABLE.length - 1, Math.round(t / BATTERY_STEP_S))];
  const link = linkAt(a.orbitT);

  // Wheel speeds follow from how fast the body is being turned at this instant.
  const dm = 0.25;
  const ahead = attitudeSampleAt(Math.min(t + dm, MISSION_DURATION_S));
  const orbitDt = orbitTimeAt(Math.min(t + dm, MISSION_DURATION_S)) - a.orbitT;
  const wheelRpm = a.attitudeLocked || a.attitude.slewing ? wheelSpeedsRpm(bodyRate(a.attitude.attitude, ahead.attitude, orbitDt)) : spinUp(a);

  const boot = stagePlan("BOOT");
  const bootProgress = a.plan.stage === "BOOT" ? smoothstep(0.2, 0.7, a.progress) : t >= boot.endS ? 1 : 0;

  return {
    time: a.orbitT,
    batterySOC: row.soc * 100,
    powerGenerationW: a.generatedW,
    loadW: totalLoadW(a.loads),
    mode: SPACECRAFT_MODE[a.plan.stage] === "INITIALIZATION" && a.attitudeLocked ? "NOMINAL" : SPACECRAFT_MODE[a.plan.stage],
    attitude: a.attitude.attitude,
    groundContact: link.visible,
    payloadDataMb: a.capture.storedMb,
    stage: a.plan.stage,
    stageIndex: a.plan.index,
    stageProgress: a.progress,
    missionTimeS: t,
    attitudeMode: a.attitude.mode,
    slewing: a.attitude.slewing,
    attitudeLocked: a.attitudeLocked,
    bootProgress,
    sunFraction: a.sunFraction,
    powerState: row.state,
    batteryW: row.batteryW,
    loads: a.loads,
    wheelRpm,
    link,
    capture: a.capture,
    command: a.command,
    telemetry: a.telemetry,
    downlink: a.downlink,
    callout: calloutFor(a, link),
  };
}

/** Before attitude acquisition the wheels are idle, then spin up to their bias speed. */
function spinUp(a: Activity): [number, number, number, number] {
  const f = a.plan.stage === "ATTITUDE" ? smoothstep(0, 0.15, a.progress) : 0;
  if (f === 0) return [0, 0, 0, 0];
  const bias = ADCS_REFERENCE.biasRpm;
  return [bias[0] * f, bias[1] * f, bias[2] * f, 0];
}

/** Format a mission time as MM:SS on the compressed mission clock. */
export function formatMissionClock(missionTimeS: number): string {
  const t = Math.max(0, Math.round(missionTimeS));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
