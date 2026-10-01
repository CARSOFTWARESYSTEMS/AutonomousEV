// Runs the simulation once per frame and publishes the result: it advances
// the clocks, samples the domain models in ../simulation, writes the shared
// frame state the scene reads, and mirrors a throttled summary into the store.
// No physics lives here — only orchestration.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import { trackEvent } from "@/utils/analytics";
import type { AttitudeMode, Quat, Vec3 } from "../types";
import { AUTO_BUILD_STEP_S, TOUR_STEPS } from "../data/missionSequence";
import { DEG, clamp, cross, damp, easeInOutCubic, quatFromBasis, quatMultiply, quatRotate, quatSlerp, smoothstep } from "../lib/math";
import { ADCS_REFERENCE, SLEW_DEMO, attitudeFor, bodyRate, sunIncidenceCos, wheelSpeedsRpm } from "../simulation/adcs";
import { linkAt } from "../simulation/communications";
import { type CommandPhase, isActiveStage, missionReducer, missionSnapshotAt, orbitTimeAt } from "../simulation/mission";
import {
  GROUND_STATION,
  OBSERVATION_TARGET,
  ORBIT_EVENTS,
  ORBIT_PERIOD_S,
  SUN_DIRECTION,
  earthRotationAt,
  intersectEarth,
  orbitStateAt,
  subSatellitePoint,
  sunFractionAt,
  surfacePointAt,
} from "../simulation/orbit";
import { CAPTURE_SEQUENCE_S, captureSequenceAt } from "../simulation/payload";
import { batteryCurrentA, busVoltageV, generationW, loadsW, stepBattery, totalLoadW } from "../simulation/power";
import { type ExplorerState, type Telemetry, useExplorerStore } from "../state/explorerStore";
import { isXrayActive, viewFlags } from "../state/selectors";
import { HERO_ORBIT_TIME_S, ORBIT_BOOKMARKS, nowS, seekOrbit, simClock } from "../state/simClock";
import { selectFlows } from "../overlays/flowSelection";
import { UNITS_PER_KM, frame } from "./frameState";

const TELEMETRY_INTERVAL_S = 0.125;
/** Visual wheel speed: a fraction of the true speed, so the spin is readable rather than a blur. */
const WHEEL_VISUAL_RAD_PER_RPM_S = (2 * Math.PI) / 60 / 12;

/** Timeline of the Signals command demonstration, seconds. */
export const COMMAND_DEMO = { uplinkS: 2.6, routingS: 2.4, executingS: 4.2, verifiedS: 3.4 } as const;
const COMMAND_DEMO_TOTAL_S = COMMAND_DEMO.uplinkS + COMMAND_DEMO.routingS + COMMAND_DEMO.executingS + COMMAND_DEMO.verifiedS;

export function commandDemoAt(elapsedS: number): { phase: CommandPhase; progress: number } {
  const { uplinkS, routingS, executingS } = COMMAND_DEMO;
  if (elapsedS < 0 || elapsedS > COMMAND_DEMO_TOTAL_S) return { phase: "NONE", progress: 0 };
  if (elapsedS < uplinkS) return { phase: "UPLINK", progress: elapsedS / uplinkS };
  if (elapsedS < uplinkS + routingS) return { phase: "ROUTING", progress: (elapsedS - uplinkS) / routingS };
  if (elapsedS < uplinkS + routingS + executingS) return { phase: "EXECUTING", progress: (elapsedS - uplinkS - routingS) / executingS };
  return { phase: "VERIFIED", progress: 1 };
}

const { pass, eclipseExitS, eclipseEntryS } = ORBIT_EVENTS;

/** Orbit seconds advanced per real second for the current view. */
function orbitRate(s: ExplorerState): number {
  switch (s.mode) {
    case "orbit":
      return s.orbitPlaying ? s.orbitSpeed : 0;
    case "build":
      return 0;
    case "systems":
      if (s.subsystem === "power") return s.powerScenario === "auto" ? 45 : 2;
      return s.subsystem === "payload" || s.subsystem === "communications" ? 1 : 2;
    case "signals":
      return 1;
    default:
      return s.reducedMotion ? 0.5 : 2;
  }
}

/** Keep the orbit clock inside the stretch of orbit a view is about; glide back when it drifts out. */
function constrainOrbit(s: ExplorerState, t: number) {
  if (simClock.seek) return;
  const inWindow = (from: number, to: number) => {
    const phase = ((t - from) % ORBIT_PERIOD_S + ORBIT_PERIOD_S) % ORBIT_PERIOD_S;
    return phase <= to - from;
  };
  if (s.mode === "orbit") return;
  if (s.mode === "signals" || (s.mode === "systems" && s.subsystem === "communications")) {
    if (t < pass.aosS + 30 || t > pass.losS - 45) seekOrbit(ORBIT_BOOKMARKS.passMid);
    return;
  }
  if (s.mode === "systems" && s.subsystem === "payload") {
    if (t < -70 || t > 40) seekOrbit(ORBIT_BOOKMARKS.target);
    return;
  }
  if (s.mode === "systems" && s.subsystem === "power") {
    if (s.powerScenario === "eclipse" && !inWindow(eclipseEntryS + 150, eclipseExitS + ORBIT_PERIOD_S - 150)) seekOrbit(ORBIT_BOOKMARKS.eclipse);
    if (s.powerScenario === "sunlight" && !inWindow(eclipseExitS + 200, eclipseEntryS - 200)) seekOrbit(ORBIT_BOOKMARKS.sunlight);
    return;
  }
  // Everything else is shown in daylight, up-track of the target.
  if (t < eclipseExitS + 300 || t > eclipseEntryS - 300) seekOrbit(HERO_ORBIT_TIME_S);
}

const AXIS_INDEX = { X: 0, Y: 1, Z: 2 } as const;
const AXIS_VECTOR: Record<"X" | "Y" | "Z", Vec3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };

const axisAngle = (axis: Vec3, angleRad: number): Quat => {
  const s = Math.sin(angleRad / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angleRad / 2)];
};

const scratch = new Vector3();
const up = new Vector3();
const north = new Vector3();
const east = new Vector3();
const stationBasis = new Quaternion();

function setVector(out: Vector3, v: Vec3, k = 1) {
  out.set(v[0] * k, v[1] * k, v[2] * k);
}

export default function SimulationDriver() {
  const live = useRef({
    soc: 0.78,
    attitude: null as Quat | null,
    prevNominal: null as Quat | null,
    prevOrbitT: 0,
    lastTelemetry: -1,
    slewHold: [0, 0, 0] as [number, number, number],
    slewFrom: 0,
    slewTo: 0,
    slewStartedAt: -1,
    completeSent: false,
    wasSeeking: false,
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useExplorerStore.getState();
    const l = live.current;
    const now = nowS();
    frame.now = now;
    frame.dt = dt;

    // ── Clocks ──
    const missionActive = s.mode === "mission" && isActiveStage(simClock.mission.stage);
    if (simClock.mission.playing) {
      simClock.mission = missionReducer(simClock.mission, { type: "TICK", dtS: dt });
    }
    if (simClock.mission.stage !== s.missionStage || simClock.mission.playing !== s.missionPlaying) s.syncMission();

    let seeking = false;
    if (missionActive) {
      simClock.seek = null;
      simClock.orbitTimeS = orbitTimeAt(simClock.mission.timeS);
    } else if (simClock.seek) {
      const { from, to, startedAt, durationS } = simClock.seek;
      const p = s.reducedMotion ? 1 : clamp((now - startedAt) / durationS, 0, 1);
      simClock.orbitTimeS = from + (to - from) * easeInOutCubic(p);
      seeking = p < 1;
      if (!seeking) simClock.seek = null;
    } else {
      simClock.orbitTimeS += orbitRate(s) * dt;
      constrainOrbit(s, simClock.orbitTimeS);
    }
    const t = simClock.orbitTimeS;
    const orbitDt = t - l.prevOrbitT;
    const steady = !seeking && !l.wasSeeking && orbitDt > 0 && orbitDt < 200;
    l.prevOrbitT = t;
    l.wasSeeking = seeking;
    frame.orbitTimeS = t;

    // ── Orbit geometry ──
    const orbit = orbitStateAt(t);
    const sunFraction = sunFractionAt(t);
    const link = linkAt(t);
    const stationKm = surfacePointAt(GROUND_STATION, t);
    const targetKm = surfacePointAt(OBSERVATION_TARGET, t);

    // ── Spacecraft state ──
    const mission = missionActive ? missionSnapshotAt(simClock.mission.timeS) : null;
    let nominal: Quat;
    let attitudeMode: string;
    let capture = captureSequenceAt(-1);
    let command: { phase: CommandPhase; progress: number } = { phase: "NONE", progress: 0 };
    let slewing = false;

    if (mission) {
      nominal = mission.attitude;
      attitudeMode = mission.attitudeMode;
      capture = mission.capture;
      command = mission.command;
      slewing = mission.slewing;
      l.attitude = nominal;
    } else {
      let desired: AttitudeMode = "NADIR";
      let aimPoint: Vec3 | undefined;
      if (s.mode === "systems" && s.subsystem === "payload" && s.captureDemo) {
        const elapsed = now - s.captureDemo.startedAt;
        capture = captureSequenceAt(elapsed);
        if (elapsed > -1.2 && elapsed < CAPTURE_SEQUENCE_S + 1.5) {
          desired = "TARGET_TRACK";
          aimPoint = targetKm;
        }
      }
      if (s.mode === "signals" || (s.mode === "systems" && s.subsystem === "communications")) {
        if (link.visible) {
          desired = "STATION_TRACK";
          aimPoint = stationKm;
        }
        if (s.mode === "signals" && s.signalView === "command" && s.commandDemo) {
          command = commandDemoAt(now - s.commandDemo.startedAt);
          if (command.phase === "EXECUTING" || command.phase === "VERIFIED") {
            desired = "TARGET_TRACK";
            aimPoint = targetKm;
          }
        }
      }
      attitudeMode = desired;
      const ideal = attitudeFor(desired, { position: orbit.position, velocityDir: orbit.velocityDir, sunDir: SUN_DIRECTION, aimPoint });
      // Ease toward the commanded attitude so mode changes read as slews, not jumps.
      l.attitude = l.attitude && !s.reducedMotion ? quatSlerp(l.attitude, ideal, 1 - Math.exp(-(seeking ? 9 : 1.6) * dt)) : ideal;
      nominal = l.attitude;
    }

    // Wheel speeds from the body rate (momentum exchange).
    let wheelTarget: [number, number, number, number];
    if (mission) wheelTarget = mission.wheelRpm;
    else if (steady && l.prevNominal) wheelTarget = wheelSpeedsRpm(bodyRate(l.prevNominal, nominal, orbitDt));
    else wheelTarget = [...ADCS_REFERENCE.biasRpm];
    l.prevNominal = nominal;

    // Interactive slew demonstration: an extra rotation about one body axis.
    let attitude = nominal;
    const adcsView = s.mode === "systems" && s.subsystem === "adcs";
    if (adcsView && s.slewDemo) {
      const index = AXIS_INDEX[s.slewDemo.axis];
      if (s.slewDemo.startedAt !== l.slewStartedAt) {
        l.slewStartedAt = s.slewDemo.startedAt;
        l.slewFrom = l.slewHold[index];
        l.slewTo = l.slewFrom > SLEW_DEMO.angleDeg / 2 ? 0 : SLEW_DEMO.angleDeg;
      }
      const p = s.reducedMotion ? 1 : clamp((now - s.slewDemo.startedAt) / SLEW_DEMO.durationS, 0, 1);
      const eased = easeInOutCubic(p);
      const previous = l.slewHold[index];
      l.slewHold[index] = l.slewFrom + (l.slewTo - l.slewFrom) * eased;
      const rateDegS = dt > 0 ? (l.slewHold[index] - previous) / dt : 0;
      wheelTarget[index] += -rateDegS * SLEW_DEMO.rpmPerDegPerS;
      slewing = p > 0 && p < 1;
    } else if (!adcsView) {
      for (let i = 0; i < 3; i++) l.slewHold[i] = damp(l.slewHold[i], 0, 4, dt);
    }
    if (l.slewHold[0] || l.slewHold[1] || l.slewHold[2]) {
      attitude = quatMultiply(attitude, axisAngle(AXIS_VECTOR.X, l.slewHold[0] * DEG));
      attitude = quatMultiply(attitude, axisAngle(AXIS_VECTOR.Y, l.slewHold[1] * DEG));
      attitude = quatMultiply(attitude, axisAngle(AXIS_VECTOR.Z, l.slewHold[2] * DEG));
    }

    for (let i = 0; i < 4; i++) {
      const target = clamp(wheelTarget[i], -ADCS_REFERENCE.maxRpm, ADCS_REFERENCE.maxRpm);
      frame.wheelRpm[i] = mission ? target : damp(frame.wheelRpm[i], target, 7, dt);
      frame.wheelAngle[i] = (frame.wheelAngle[i] + frame.wheelRpm[i] * WHEEL_VISUAL_RAD_PER_RPM_S * dt) % (Math.PI * 2);
    }
    // Component ANIMATE: spin a selected wheel up and back down.
    const animation = s.componentAnimation;
    if (animation && animation.id.startsWith("reaction-wheel")) {
      const index = { x: 0, y: 1, z: 2, r: 3 }[animation.id.slice(-1) as "x" | "y" | "z" | "r"];
      const p = (now - animation.startedAt) / 4;
      if (p >= 0 && p < 1) frame.wheelAngle[index] += Math.sin(Math.PI * p) * 14 * dt;
    }

    // ── Power ──
    let generation: number;
    let loads: ReturnType<typeof loadsW>;
    let batteryW: number;
    let batteryState: Telemetry["batteryState"];
    if (mission) {
      generation = mission.powerGenerationW;
      loads = mission.loads;
      batteryW = mission.batteryW;
      batteryState = mission.powerState;
      l.soc = mission.batterySOC / 100;
    } else {
      generation = generationW(sunFraction, sunIncidenceCos(attitude, SUN_DIRECTION));
      loads = loadsW({
        sunlit: sunFraction > 0.5,
        imaging: capture.phase === "CAPTURING",
        processing: capture.phase === "PROCESSING",
        slewing,
        sbandTransmit: link.visible && (s.mode === "signals" ? s.signalView !== "payload-data" : s.mode === "systems" && s.subsystem === "communications"),
        xbandTransmit: link.visible && s.mode === "signals" && s.signalView === "payload-data",
      });
      const step = stepBattery(l.soc, generation, totalLoadW(loads), steady ? orbitDt : 0);
      // The standing views are illustrations, not endurance tests: keep the battery in a healthy band.
      l.soc = clamp(step.socFraction, 0.45, 1);
      batteryW = step.batteryW;
      batteryState = step.state;
    }
    const loadW = totalLoadW(loads);

    // ── Publish frame state ──
    setVector(frame.satPos, orbit.position, UNITS_PER_KM);
    setVector(frame.velocityDir, orbit.velocityDir);
    setVector(frame.zenith, orbit.zenith);
    const lvlh = quatFromBasis(orbit.velocityDir, orbit.zenith, cross(orbit.velocityDir, orbit.zenith));
    frame.lvlhQuat.set(lvlh[0], lvlh[1], lvlh[2], lvlh[3]);
    frame.attitude.set(attitude[0], attitude[1], attitude[2], attitude[3]);
    const nadir = attitudeFor("NADIR", { position: orbit.position, velocityDir: orbit.velocityDir, sunDir: SUN_DIRECTION });
    frame.nadirQuat.set(nadir[0], nadir[1], nadir[2], nadir[3]);
    setVector(frame.sunDir, SUN_DIRECTION);
    frame.sunFraction = sunFraction;
    frame.dayBelow = smoothstep(-0.12, 0.3, orbit.zenith[0] * SUN_DIRECTION[0] + orbit.zenith[1] * SUN_DIRECTION[1] + orbit.zenith[2] * SUN_DIRECTION[2]);
    frame.earthRotation = earthRotationAt(t);

    setVector(frame.stationPos, stationKm, UNITS_PER_KM);
    up.copy(frame.stationPos).normalize();
    north.set(0, 1, 0).addScaledVector(up, -up.y).normalize();
    east.crossVectors(north, up);
    // Station frame: X east, Y up, Z south (right-handed).
    scratch.copy(north).negate();
    const sq = quatFromBasis([east.x, east.y, east.z], [up.x, up.y, up.z], [scratch.x, scratch.y, scratch.z]);
    frame.stationQuat.copy(stationBasis.set(sq[0], sq[1], sq[2], sq[3]));
    setVector(frame.targetPos, targetKm, UNITS_PER_KM);

    const hit = intersectEarth(orbit.position, quatRotate(attitude, [0, -1, 0]));
    frame.footprintValid = hit !== null;
    if (hit) setVector(frame.footprintPos, hit, UNITS_PER_KM);

    frame.link = link;
    frame.linkStrength = damp(frame.linkStrength, link.visible ? 1 : 0, 3, dt);
    frame.generationW = generation;
    frame.loadW = loadW;
    frame.batterySoc = l.soc * 100;
    frame.batteryW = batteryW;
    frame.capture = capture;
    frame.command = command;
    frame.bootProgress = mission ? mission.bootProgress : 1;
    frame.downlinkProgress = mission ? mission.downlink : 0;

    frame.flags = viewFlags(s);
    const xray = isXrayActive(s);
    frame.exploded = s.reducedMotion ? s.explodedAmount : damp(frame.exploded, s.explodedAmount, 6, dt);
    if (Math.abs(frame.exploded - s.explodedAmount) < 0.0008) frame.exploded = s.explodedAmount;
    frame.studio = s.reducedMotion ? Number(frame.flags.studio) : damp(frame.studio, frame.flags.studio ? 1 : 0, 3.2, dt);
    frame.xray = damp(frame.xray, xray ? 1 : 0, 8, dt);

    const external = selectFlows(frame.flows, {
      mode: s.mode,
      subsystem: s.subsystem,
      signalView: s.signalView,
      missionStage: s.missionStage,
      buildStep: s.buildStep,
      buildStepAge: now - s.buildStepChangedAt,
      xray,
      showMagnetorquer: s.showMagnetorquer,
      generationW: s.mode === "build" ? 18 : generation,
      batteryW: s.mode === "build" ? 6 : batteryW,
      bootProgress: frame.bootProgress,
      payloadPhase: capture.phase,
      commandPhase: command.phase,
      linkVisible: link.visible,
      telemetry: mission ? mission.telemetry : 1,
      downlink: mission ? mission.downlink : 0.5,
    });
    frame.sunRays = damp(frame.sunRays, external.sunRays, 4, dt);
    frame.uplink = damp(frame.uplink, external.uplink, 6, dt);
    frame.telemetry = damp(frame.telemetry, external.telemetry, 6, dt);
    frame.payloadDownlink = damp(frame.payloadDownlink, external.payloadDownlink, 6, dt);

    // Build Mode: advance automatically while AUTO BUILD is on.
    if (s.mode === "build" && s.buildAuto && now - s.buildStepChangedAt > AUTO_BUILD_STEP_S) s.nextBuildStep();

    // Guided tour: advance when a step has had its time.
    if (s.tourActive && s.tourPlaying) {
      const step = TOUR_STEPS[s.tourStep];
      if (step && now - s.tourStepStartedAt > step.durationS) s.tourNext();
    }

    // ── Throttled mirror for the interface ──
    if (now - l.lastTelemetry >= TELEMETRY_INTERVAL_S) {
      l.lastTelemetry = now;
      const sub = subSatellitePoint(t);
      s.setTelemetry({
        orbitTimeS: t,
        missionTimeS: simClock.mission.timeS,
        batterySoc: l.soc * 100,
        busVoltage: busVoltageV(l.soc),
        batteryCurrentA: batteryCurrentA(batteryW, l.soc),
        batteryState,
        generationW: generation,
        loadW,
        loads,
        sunlit: sunFraction > 0.5,
        spacecraftMode: mission ? mission.mode : capture.phase === "CAPTURING" ? "IMAGING" : "NOMINAL",
        attitudeMode,
        attitudeLocked: mission ? mission.attitudeLocked : true,
        wheelRpm: [frame.wheelRpm[0], frame.wheelRpm[1], frame.wheelRpm[2], frame.wheelRpm[3]],
        storageMb: mission ? mission.payloadDataMb : capture.storedMb,
        payloadPhase: capture.phase,
        link: link.state,
        elevationDeg: link.elevationDeg,
        rangeKm: link.rangeKm,
        commandPhase: command.phase,
        telemetryProgress: mission ? mission.telemetry : 0,
        downlinkProgress: mission ? mission.downlink : 0,
        callout: mission ? mission.callout : null,
        latDeg: sub.latDeg,
        lonDeg: sub.lonDeg,
      });
    }

    // Analytics: one event when a mission run plays through to the end.
    if (s.missionCompleted && !l.completeSent) trackEvent("mission_complete", { page_path: window.location.pathname });
    l.completeSent = s.missionCompleted;
  }, -100);

  return null;
}
