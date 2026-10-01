// Runs once per frame, before anything draws. Advances the clocks, asks the
// simulation modules for the aircraft and health state, and writes the result
// to `frame` for the scene to visualise. No physics or fault logic lives here:
// this component only orchestrates and smooths.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ActiveFaultScenarioId, ComponentId, EnvironmentId, FaultStage, HealthState, MissionPhase } from "../types";
import { COMPONENT_IDS, OUTER_SHELL } from "../data/componentDefinitions";
import { EXPLODED_LIFT, UNIT_MOUNTS } from "../aircraft/layout";
import { FLOW_IDS } from "../aircraft/routes";
import { DEG, damp } from "../lib/math";
import { STAGE_SEVERITY, faultReducer } from "../simulation/faultModels";
import { type HealthInputs, buildHealthSnapshot } from "../simulation/hums";
import { type FlightState, awaitingAuthorization, flightStateAt, missionDurationS, missionFaultAt, missionReducer, routeLengthM, stageAt, steadyState } from "../simulation/mission";
import { componentOpen, flowActivation, operatingPoint, presentationMap, sensorVisibility, subAssemblyOpen, viewFlags, viewKey } from "../state/selectors";
import { nowS, simClock } from "../state/simClock";
import { useUFlightStore } from "../state/uflightStore";
import { frame } from "./frameState";

/** Seconds between health snapshots and store updates. */
const SYNC_INTERVAL_S = 0.125;
/** Visual rotor speed at hover rpm, rad/s: slow enough to read the blades, with a blur disc for the rest. */
const VISUAL_SPIN = 13;
const ENVIRONMENTS: readonly EnvironmentId[] = ["studio", "vertiport", "flight", "twin"];

const approach = (current: number, target: number, rate: number, dt: number, instant: boolean) => {
  if (instant) return target;
  const next = damp(current, target, rate, dt);
  return Math.abs(next - target) < 0.0005 ? target : next;
};

export default function SimulationDriver() {
  const local = useRef({ viewKey: "", lastSync: -1, flowTargets: {} as Record<string, number>, height: 0, seeThrough: false, concealAt: 0 });

  // Leaving the scene stops nothing in the store, but stale per-frame state must not survive a remount.
  useEffect(
    () => () => {
      frame.presentation.clear();
      frame.deep.clear();
      frame.opacity.clear();
    },
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const l = local.current;
    const s = useUFlightStore.getState();
    const instant = s.reducedMotion;
    frame.now = nowS();
    frame.dt = dt;

    // ── Clocks ──
    if (s.mode === "mission") simClock.mission = missionReducer(simClock.mission, { type: "TICK", dt });
    if (s.mode === "fault-lab") simClock.fault = faultReducer(simClock.fault, { type: "TICK", dt });
    const mission = simClock.mission;
    const stageChanged = mission.stage !== s.missionStage || simClock.fault.stage !== s.faultStage || simClock.fault.scenario !== s.faultScenario;

    // ── Operating point: the mission's flight state, or a steady condition ──
    const point = operatingPoint(s);
    let flight: FlightState;
    let missionPhase: MissionPhase = "IDLE";
    let missionTimeS = 0;
    let stageProgress = 0;
    let scenario: ActiveFaultScenarioId | null;
    let faultStage: FaultStage;

    if (point.kind === "mission" && mission.stage !== "IDLE") {
      const complete = mission.stage === "COMPLETE";
      missionTimeS = complete ? missionDurationS(mission.profile) - 0.001 : mission.timeS;
      flight = flightStateAt(missionTimeS, mission.profile);
      missionPhase = mission.stage;
      stageProgress = complete ? 1 : stageAt(missionTimeS, mission.profile).progress;
      const event = missionFaultAt(mission.stage, stageProgress);
      scenario = event.stage === "HEALTHY" ? null : "bearing-degradation";
      faultStage = event.stage;
      simClock.faultSeverity = event.severity;
      frame.routeLength = routeLengthM(mission.profile);
    } else {
      const config = point.kind === "steady" ? point.config : "ground";
      flight = steadyState(config, s.environment);
      scenario = simClock.fault.scenario;
      faultStage = simClock.fault.stage;
      // Severity settles toward the level of the scenario's current stage.
      simClock.faultSeverity = approach(simClock.faultSeverity, scenario ? STAGE_SEVERITY[faultStage] : 0, 0.9, dt, instant);
    }
    frame.flight = flight;
    frame.severity = scenario === "bearing-degradation" ? simClock.faultSeverity : 0;

    // ── Pose ──
    const inMission = point.kind === "mission";
    const targetHeight = inMission ? flight.sceneY : point.height;
    l.height = inMission ? targetHeight : approach(l.height, targetHeight, 2.2, dt, instant);
    frame.exploded = approach(frame.exploded, s.explodedAmount, 6, dt, instant);
    frame.lift = EXPLODED_LIFT * frame.exploded;
    frame.position.set(inMission ? flight.sceneX : 0, l.height, 0);
    frame.pitch = inMission ? flight.pitchDeg * DEG : approach(frame.pitch, flight.pitchDeg * DEG, 2, dt, instant);
    frame.tiltDeg = inMission ? flight.tiltDeg : approach(frame.tiltDeg, flight.tiltDeg, 1.8, dt, instant);

    UNIT_MOUNTS.forEach((mount, i) => {
      const target = mount.kind === "tilt" ? flight.tiltRpm : flight.liftRpm;
      frame.rpm[i] = inMission ? target : approach(frame.rpm[i], target, 1.4, dt, instant);
      const speed = frame.rpm[i] / 1250;
      if (speed > 0.012) {
        frame.rotorAngle[i] += mount.spin * speed * VISUAL_SPIN * dt * (instant ? 0.25 : 1);
      } else if (mount.kind === "lift") {
        // A stopped lift rotor is aligned with the boom, where its drag in cruise is lowest.
        const aligned = Math.round(frame.rotorAngle[i] / Math.PI) * Math.PI;
        frame.rotorAngle[i] = approach(frame.rotorAngle[i], aligned, 3, dt, instant);
      }
    });

    // ── Control surfaces ──
    const surfaces = frame.surfaces;
    const exercising = !instant && ((s.mode === "systems" && s.selectedSystem === "flightControl") || (s.mode === "architecture" && s.architectureView === "redundancy"));
    let flap = 0;
    let elevator = 0;
    let rudder = 0;
    let roll = 0;
    if (inMission && (flight.phase === "TRANSITION" || flight.phase === "APPROACH")) {
      flap = 0.26 * Math.sin(Math.PI * flight.progress);
      elevator = -0.5 * flight.pitchDeg * DEG;
    } else if (exercising) {
      roll = 0.2 * Math.sin(frame.now * 0.9);
      elevator = 0.16 * Math.sin(frame.now * 0.7 + 1);
      rudder = 0.2 * Math.sin(frame.now * 0.6 + 2);
    }
    surfaces.flaperonLeft = approach(surfaces.flaperonLeft, flap + roll, 5, dt, instant);
    surfaces.flaperonRight = approach(surfaces.flaperonRight, flap - roll, 5, dt, instant);
    surfaces.elevator = approach(surfaces.elevator, elevator, 5, dt, instant);
    surfaces.rudder = approach(surfaces.rudder, rudder, 5, dt, instant);

    // ── Smoothed interaction state ──
    frame.power = approach(frame.power, s.started ? 1 : 0, 0.9, dt, instant);
    for (const env of ENVIRONMENTS) frame.environment[env] = approach(frame.environment[env], s.environment === env ? 1 : 0, 2.4, dt, instant);

    // ── View-dependent state, recomputed only when the view changes ──
    const key = viewKey(s);
    if (key !== l.viewKey) {
      l.viewKey = key;
      frame.presentation = presentationMap(s);
      for (const id of COMPONENT_IDS) {
        frame.subOpen.set(id, subAssemblyOpen(s, id));
        frame.deepOpen.set(id, componentOpen(s, id));
      }
      frame.flags = viewFlags(s);
      frame.sensors = sensorVisibility(s);
      l.flowTargets = flowActivation(s);
      const seeThrough = OUTER_SHELL.some((id) => (frame.presentation.get(id)?.opacity ?? 1) < 0.999);
      // When the skin closes again, what is inside stays drawn until the skin has finished fading back.
      if (l.seeThrough && !seeThrough) l.concealAt = frame.now + 0.9;
      l.seeThrough = seeThrough;
    }
    frame.revealed = l.seeThrough || frame.exploded > 0.001 || frame.now < l.concealAt;
    for (const id of FLOW_IDS) frame.flows[id] = approach(frame.flows[id], l.flowTargets[id] ?? 0, 5, dt, instant);

    frame.ghost = approach(frame.ghost, frame.flags.ghost ? 1 : 0, 1.6, dt, instant);
    frame.ghostAlign = frame.ghost < 0.01 ? 0 : approach(frame.ghostAlign, 1, 1.1, dt, instant);

    // ── Health snapshot and interface update, a few times a second ──
    if (stageChanged || frame.now - l.lastSync >= SYNC_INTERVAL_S) {
      l.lastSync = frame.now;
      const inputs: HealthInputs = {
        missionTimeS,
        missionPhase,
        config: point.kind === "steady" ? point.config : flight.onGround ? "ground" : flight.tiltDeg > 60 ? "hover" : flight.tiltDeg > 8 ? "transition" : "cruise",
        flight,
        faults: { scenario, stage: faultStage, severity: simClock.faultSeverity, fccBFailed: s.fccBFailed, gnssUnavailable: s.gnssUnavailable },
      };
      const snapshot = buildHealthSnapshot(inputs);
      frame.snapshot = snapshot;
      const health: Partial<Record<ComponentId, HealthState>> = {};
      for (const [id, component] of Object.entries(snapshot.twin.components)) if (component && component.state !== "NOMINAL") health[id as ComponentId] = component.state;
      frame.health = health;
      frame.thermal = snapshot.thermal.levels;
      frame.loads = snapshot.structures.loads;
      frame.wingBend = snapshot.structures.wingBend;
      s.syncSimulation({ flight, inputs, snapshot, missionTimeS, stageProgress, awaitingAuthorization: awaitingAuthorization(mission) });
    }
  }, -100);

  return null;
}
