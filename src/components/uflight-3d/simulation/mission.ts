// The mission: an explicit state machine over mission time, and a
// deterministic flight model. `flightStateAt(time, profile)` always returns
// the same aircraft state for the same time, so scrubbing and replaying agree.
// An educational, time-compressed profile — not aircraft performance data.
import type { EnvironmentId, FaultStage, FlightConfig, MissionPhase, MissionProfile } from "../types";
import { MISSION_SEQUENCE, STAGE_DURATION_S, STAGE_INFO, type ActivePhase } from "../data/missionDefinition";
import { clamp, clamp01, ease, easeIntegral, lerp } from "../lib/math";

export interface MissionMachine {
  profile: MissionProfile;
  stage: MissionPhase;
  /** Seconds since the mission started. */
  timeS: number;
  playing: boolean;
  /** The flight has been authorized; until then the clock holds at the end of preflight. */
  authorized: boolean;
}

export const INITIAL_MISSION: MissionMachine = { profile: "executive", stage: "IDLE", timeS: 0, playing: false, authorized: false };

export type MissionEvent =
  | { type: "RUN"; profile?: MissionProfile }
  | { type: "AUTHORIZE" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SEEK"; timeS: number }
  | { type: "TICK"; dt: number }
  | { type: "RESTART" }
  | { type: "RESET" };

export const isActivePhase = (phase: MissionPhase): phase is ActivePhase => phase !== "IDLE" && phase !== "COMPLETE";

export function stageStartS(profile: MissionProfile, phase: ActivePhase): number {
  let t = 0;
  for (const p of MISSION_SEQUENCE) {
    if (p === phase) return t;
    t += STAGE_DURATION_S[profile][p];
  }
  return t;
}

export const stageDurationS = (profile: MissionProfile, phase: ActivePhase) => STAGE_DURATION_S[profile][phase];

export const missionDurationS = (profile: MissionProfile) => MISSION_SEQUENCE.reduce((t, p) => t + STAGE_DURATION_S[profile][p], 0);

/** The stage in progress at a mission time, and how far through it (0–1). */
export function stageAt(timeS: number, profile: MissionProfile): { phase: ActivePhase; progress: number } {
  let start = 0;
  for (const phase of MISSION_SEQUENCE) {
    const duration = STAGE_DURATION_S[profile][phase];
    if (timeS < start + duration) return { phase, progress: clamp01((timeS - start) / duration) };
    start += duration;
  }
  return { phase: "POSTFLIGHT", progress: 1 };
}

/** The clock stops just short of takeoff until the flight is authorized. */
const holdS = (profile: MissionProfile) => STAGE_DURATION_S[profile].PREFLIGHT - 0.001;

const at = (machine: MissionMachine, timeS: number, patch: Partial<MissionMachine> = {}): MissionMachine => ({
  ...machine,
  ...patch,
  timeS,
  stage: stageAt(timeS, machine.profile).phase,
});

export function missionReducer(machine: MissionMachine, event: MissionEvent): MissionMachine {
  const { profile } = machine;
  switch (event.type) {
    case "RUN":
    case "RESTART": {
      const next = event.type === "RUN" && event.profile ? event.profile : profile;
      return { profile: next, stage: "PREFLIGHT", timeS: 0, playing: true, authorized: false };
    }
    case "RESET":
      return { ...INITIAL_MISSION, profile };
    case "AUTHORIZE":
      if (machine.stage !== "PREFLIGHT") return machine;
      return at(machine, stageStartS(profile, "TAKEOFF"), { authorized: true, playing: true });
    case "PLAY":
      if (machine.stage === "IDLE" || machine.stage === "COMPLETE") return machine;
      return { ...machine, playing: true };
    case "PAUSE":
      return { ...machine, playing: false };
    case "NEXT": {
      if (!isActivePhase(machine.stage)) return machine;
      const index = MISSION_SEQUENCE.indexOf(machine.stage);
      if (index === MISSION_SEQUENCE.length - 1) return { ...machine, stage: "COMPLETE", timeS: missionDurationS(profile), playing: false };
      // Stepping past preflight is an authorization.
      return at(machine, stageStartS(profile, MISSION_SEQUENCE[index + 1]), { authorized: true });
    }
    case "PREVIOUS": {
      if (machine.stage === "IDLE") return machine;
      if (machine.stage === "COMPLETE") return at(machine, stageStartS(profile, "POSTFLIGHT"));
      const index = MISSION_SEQUENCE.indexOf(machine.stage);
      const start = stageStartS(profile, machine.stage);
      // Early in a stage, go to the one before; otherwise back to the start of this one.
      const target = machine.timeS - start < 1.5 && index > 0 ? MISSION_SEQUENCE[index - 1] : machine.stage;
      return at(machine, stageStartS(profile, target), { authorized: target !== "PREFLIGHT" });
    }
    case "SEEK": {
      if (machine.stage === "IDLE") return machine;
      const timeS = clamp(event.timeS, 0, missionDurationS(profile) - 0.001);
      return at(machine, timeS, { authorized: timeS > holdS(profile) });
    }
    case "TICK": {
      if (!machine.playing || !isActivePhase(machine.stage)) return machine;
      let timeS = machine.timeS + Math.max(0, event.dt);
      if (!machine.authorized) timeS = Math.min(timeS, holdS(profile));
      if (timeS >= missionDurationS(profile)) return { ...machine, stage: "COMPLETE", timeS: missionDurationS(profile), playing: false };
      return at(machine, timeS);
    }
  }
}

/** True while preflight has finished its checks and is waiting for the flight to be authorized. */
export const awaitingAuthorization = (machine: MissionMachine) =>
  machine.stage === "PREFLIGHT" && !machine.authorized && machine.timeS >= holdS(machine.profile) - 0.01;

// ── Flight model ──

/** Reference speeds, in rpm, used for labels and for normalising vibration by shaft order. */
export const RPM = { hover: 1250, cruise: 800, idle: 320 } as const;

/** Scene metres per second in cruise. The picture is compressed; the displayed speed is the reference figure below. */
const SCENE_CRUISE_SPEED = 36;
const DISPLAY_CRUISE_SPEED_MS = 60;
const HOVER_HEIGHT = 12;
const CRUISE_HEIGHT = 40;
/** Fraction of the takeoff stage spent spooling up on the pad, and of the landing stage spent descending. */
const LIFT_OFF_AT = 0.3;
const TOUCHDOWN_AT = 0.78;

export interface FlightState {
  phase: MissionPhase;
  /** Progress through the current stage, 0–1. */
  progress: number;
  onGround: boolean;
  /** Scene position: metres along track and above the pad. */
  sceneX: number;
  sceneY: number;
  /** Reference figures for display. */
  altitudeM: number;
  speedMs: number;
  pitchDeg: number;
  /** Tilt-unit angle: 90 = thrust up (hover), 0 = thrust forward (cruise). */
  tiltDeg: number;
  tiltRpm: number;
  liftRpm: number;
  /** Fraction of maximum continuous load on a tilt unit and on a lift unit, 0–1. */
  tiltLoad: number;
  liftLoad: number;
  /** Share of lift carried by rotors and by the wing; they sum to 1. */
  rotorLiftShare: number;
  wingLiftShare: number;
  batteryPowerKw: number;
  /** Phase current of one tilt-unit motor, A. */
  motorCurrentA: number;
  motorTempC: number;
  socPercent: number;
  environment: EnvironmentId;
  /** True once the aircraft is nearer the destination pad than the departure pad. */
  atDestination: boolean;
}

/** Scene distance flown by the end of each stage; the destination pad sits at the last value. */
function distanceAt(profile: MissionProfile, phase: ActivePhase, progress: number): number {
  const d = STAGE_DURATION_S[profile];
  const cruiseStages: ActivePhase[] = ["CRUISE", "HEALTH_EVENT", "DIAGNOSIS", "PROGNOSIS"];
  let x = 0;
  for (const p of MISSION_SEQUENCE) {
    const current = p === phase;
    const f = current ? progress : 1;
    if (p === "TRANSITION") x += SCENE_CRUISE_SPEED * d.TRANSITION * easeIntegral(f);
    else if (cruiseStages.includes(p)) x += SCENE_CRUISE_SPEED * d[p] * f;
    else if (p === "APPROACH") x += SCENE_CRUISE_SPEED * d.APPROACH * (f - easeIntegral(f));
    if (current) return x;
  }
  return x;
}

export const routeLengthM = (profile: MissionProfile) => distanceAt(profile, "POSTFLIGHT", 1);

const displayAltitude = (sceneY: number) => (sceneY <= HOVER_HEIGHT ? sceneY * 2.5 : 30 + (sceneY - HOVER_HEIGHT) * 15);

/** Cumulative share of the mission's energy used by the end of each stage. */
const ENERGY_USED: Record<ActivePhase, readonly [number, number]> = {
  PREFLIGHT: [0, 0],
  TAKEOFF: [0, 0.14],
  TRANSITION: [0.14, 0.3],
  CRUISE: [0.3, 0.44],
  HEALTH_EVENT: [0.44, 0.55],
  DIAGNOSIS: [0.55, 0.66],
  PROGNOSIS: [0.66, 0.77],
  APPROACH: [0.77, 0.87],
  LANDING: [0.87, 1],
  POSTFLIGHT: [1, 1],
};
const SOC_START = 92;
const SOC_USED = 31;

/** Aircraft state on the pad with everything stopped. */
export function groundState(phase: MissionPhase = "IDLE", environment: EnvironmentId = "studio"): FlightState {
  return {
    phase,
    progress: 0,
    onGround: true,
    sceneX: 0,
    sceneY: 0,
    altitudeM: 0,
    speedMs: 0,
    pitchDeg: 0,
    tiltDeg: 90,
    tiltRpm: 0,
    liftRpm: 0,
    tiltLoad: 0,
    liftLoad: 0,
    rotorLiftShare: 1,
    wingLiftShare: 0,
    batteryPowerKw: 4,
    motorCurrentA: 0,
    motorTempC: 32,
    socPercent: SOC_START,
    environment,
    atDestination: false,
  };
}

/** A steady operating point, for views that are not running the mission. */
export function steadyState(config: FlightConfig, environment: EnvironmentId = "studio"): FlightState {
  const base = groundState("IDLE", environment);
  switch (config) {
    case "ground":
      return base;
    case "hover":
      return { ...base, onGround: false, sceneY: HOVER_HEIGHT, altitudeM: 30, tiltRpm: RPM.hover, liftRpm: RPM.hover, tiltLoad: 0.9, liftLoad: 0.9, batteryPowerKw: 560, motorCurrentA: 320, motorTempC: 86 };
    case "transition":
      return {
        ...base,
        onGround: false,
        sceneY: 26,
        altitudeM: displayAltitude(26),
        speedMs: 32,
        pitchDeg: -2,
        tiltDeg: 42,
        tiltRpm: 1050,
        liftRpm: 760,
        tiltLoad: 0.74,
        liftLoad: 0.46,
        rotorLiftShare: 0.52,
        wingLiftShare: 0.48,
        batteryPowerKw: 380,
        motorCurrentA: 262,
        motorTempC: 80,
        socPercent: 86,
      };
    case "cruise":
      return {
        ...base,
        onGround: false,
        sceneY: CRUISE_HEIGHT,
        altitudeM: displayAltitude(CRUISE_HEIGHT),
        speedMs: DISPLAY_CRUISE_SPEED_MS,
        tiltDeg: 0,
        tiltRpm: RPM.cruise,
        liftRpm: 0,
        tiltLoad: 0.45,
        liftLoad: 0,
        rotorLiftShare: 0,
        wingLiftShare: 1,
        batteryPowerKw: 150,
        motorCurrentA: 160,
        motorTempC: 71,
        socPercent: 74,
      };
  }
}

export function flightStateAt(timeS: number, profile: MissionProfile): FlightState {
  const { phase, progress: p } = stageAt(timeS, profile);
  const sceneX = distanceAt(profile, phase, p);
  const route = routeLengthM(profile);

  let sceneY = CRUISE_HEIGHT;
  let speedFraction = 1;
  let tiltDeg = 0;
  let tiltRpm: number = RPM.cruise;
  let liftRpm = 0;
  let pitchDeg = 0;
  let onGround = false;
  let motorTempC = 71;

  switch (phase) {
    case "PREFLIGHT":
      onGround = true;
      sceneY = 0;
      speedFraction = 0;
      tiltDeg = 90;
      tiltRpm = 0;
      motorTempC = 32;
      break;
    case "TAKEOFF": {
      const spool = clamp01(p / LIFT_OFF_AT);
      const climb = ease((p - LIFT_OFF_AT) / (1 - LIFT_OFF_AT));
      onGround = p < LIFT_OFF_AT;
      sceneY = HOVER_HEIGHT * climb;
      speedFraction = 0;
      tiltDeg = 90;
      tiltRpm = RPM.hover * ease(spool);
      liftRpm = tiltRpm;
      motorTempC = 32 + 56 * (1 - Math.exp(-3.2 * p));
      break;
    }
    case "TRANSITION": {
      speedFraction = ease(p);
      sceneY = lerp(HOVER_HEIGHT, CRUISE_HEIGHT, ease(p));
      // The tilt leads the speed a little: thrust is turned forward to build it.
      tiltDeg = 90 * (1 - ease(clamp01(p * 1.12)));
      tiltRpm = lerp(RPM.hover, RPM.cruise, ease(p));
      liftRpm = RPM.hover * (1 - ease(clamp01(p / 0.86)));
      pitchDeg = -4 * Math.sin(Math.PI * p);
      motorTempC = lerp(85.7, 74, ease(p));
      break;
    }
    case "CRUISE":
    case "HEALTH_EVENT":
    case "DIAGNOSIS":
    case "PROGNOSIS":
      motorTempC = phase === "CRUISE" ? lerp(74, 71, p) : 71;
      break;
    case "APPROACH": {
      speedFraction = 1 - ease(p);
      sceneY = lerp(CRUISE_HEIGHT, HOVER_HEIGHT, ease(p));
      tiltDeg = 90 * ease(clamp01((p - 0.12) / 0.88));
      tiltRpm = lerp(RPM.cruise, RPM.hover, ease(p));
      liftRpm = RPM.hover * ease(clamp01((p - 0.14) / 0.86));
      pitchDeg = 3.5 * Math.sin(Math.PI * p);
      motorTempC = lerp(71, 84, ease(p));
      break;
    }
    case "LANDING": {
      const descent = ease(clamp01(p / TOUCHDOWN_AT));
      const spoolDown = ease(clamp01((p - TOUCHDOWN_AT) / (1 - TOUCHDOWN_AT)));
      onGround = p >= TOUCHDOWN_AT;
      sceneY = HOVER_HEIGHT * (1 - descent);
      speedFraction = 0;
      tiltDeg = 90;
      tiltRpm = lerp(RPM.hover, RPM.idle, spoolDown);
      liftRpm = tiltRpm;
      motorTempC = lerp(84, 78, p);
      break;
    }
    case "POSTFLIGHT":
      onGround = true;
      sceneY = 0;
      speedFraction = 0;
      tiltDeg = 90;
      tiltRpm = RPM.idle * (1 - ease(clamp01(p / 0.25)));
      liftRpm = tiltRpm;
      motorTempC = lerp(78, 58, p);
      break;
  }

  // The wing's share of lift grows with the square of airspeed.
  const wingLiftShare = clamp01(speedFraction * speedFraction);
  const rotorLiftShare = 1 - wingLiftShare;
  const airborne = !onGround;
  const hoverFraction = airborne ? rotorLiftShare : 0;
  const tiltLoad = onGround ? clamp01(tiltRpm / RPM.hover) * 0.35 : lerp(0.45, 0.9, hoverFraction);
  const liftLoad = onGround ? clamp01(liftRpm / RPM.hover) * 0.35 : 0.9 * clamp01(liftRpm / RPM.hover);
  const batteryPowerKw = onGround ? 4 + 110 * clamp01(tiltRpm / RPM.hover) : lerp(150, 560, hoverFraction) + (phase === "TRANSITION" ? 60 * Math.sin(Math.PI * p) : 0);
  const [used0, used1] = ENERGY_USED[phase];

  return {
    phase,
    progress: p,
    onGround,
    sceneX,
    sceneY,
    altitudeM: displayAltitude(sceneY),
    speedMs: DISPLAY_CRUISE_SPEED_MS * speedFraction,
    pitchDeg,
    tiltDeg,
    tiltRpm,
    liftRpm,
    tiltLoad,
    liftLoad,
    rotorLiftShare,
    wingLiftShare,
    batteryPowerKw,
    motorCurrentA: 355 * tiltLoad,
    motorTempC,
    socPercent: SOC_START - SOC_USED * lerp(used0, used1, p),
    environment: STAGE_INFO[phase].environment,
    atDestination: sceneX > route / 2,
  };
}

// ── The health event carried by the mission ──

/** Severity above which the bearing feature leaves the baseline model. Shared with the fault model. */
export const ANOMALY_SEVERITY = 0.3;

/**
 * Bearing degradation as the mission tells it: nothing until the health-event
 * stage, then a steady rise. The fault stage follows from the mission phase
 * and from whether the rise has crossed the detection threshold yet.
 */
export function missionFaultAt(phase: MissionPhase, progress: number): { stage: FaultStage; severity: number } {
  switch (phase) {
    case "HEALTH_EVENT": {
      const severity = lerp(0.02, 0.44, ease(progress));
      return { stage: severity > ANOMALY_SEVERITY ? "ANOMALOUS" : "EARLY_CHANGE", severity };
    }
    case "DIAGNOSIS":
      return { stage: "DIAGNOSED", severity: lerp(0.44, 0.5, progress) };
    case "PROGNOSIS":
      return { stage: progress < 0.55 ? "DEGRADING" : "ACTION_REQUIRED", severity: lerp(0.5, 0.54, progress) };
    case "APPROACH":
      return { stage: "ACTION_REQUIRED", severity: lerp(0.54, 0.56, progress) };
    case "LANDING":
      return { stage: "ACTION_REQUIRED", severity: lerp(0.56, 0.58, progress) };
    case "POSTFLIGHT":
    case "COMPLETE":
      return { stage: "MAINTENANCE", severity: 0.58 };
    default:
      return { stage: "HEALTHY", severity: 0 };
  }
}
