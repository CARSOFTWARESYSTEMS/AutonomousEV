import { describe, expect, it } from "vitest";
import { FAULT_STAGES } from "../data/faultScenarios";
import { MISSION_SEQUENCE } from "../data/missionDefinition";
import { getSensor } from "../data/sensorDefinitions";
import { MONITORED_SYSTEMS } from "../data/uflightReferenceAircraft";
import { batteryState } from "./battery";
import { BEARING_ORDER, INITIAL_FAULT, STAGE_DWELL_S, STAGE_SEVERITY, batteryImbalance, bearingDegradation, faultReducer, type FaultMachine } from "./faultModels";
import { NO_FAULTS, buildHealthSnapshot, navigationState, tracePath, vehicleState, votingState, type FaultInputs, type HealthInputs } from "./hums";
import {
  ANOMALY_SEVERITY,
  INITIAL_MISSION,
  awaitingAuthorization,
  flightStateAt,
  groundState,
  missionDurationS,
  missionFaultAt,
  missionReducer,
  routeLengthM,
  stageAt,
  stageStartS,
  steadyState,
  type MissionMachine,
} from "./mission";
import { describeWindow, healthTrajectory, maintenanceWindow, predictionAt } from "./prognostics";
import { unitStates } from "./propulsion";
import { BLADE_PASS_ORDER, amplitudeNear, vibrationSignal } from "./signals";
import { structuralState } from "./structures";
import { TWIN_SUBJECTS, twinReadout } from "./twin";

const cruise = steadyState("cruise");

const inputs = (faults: Partial<FaultInputs> = {}, flight = cruise): HealthInputs => ({
  missionTimeS: 0,
  missionPhase: "IDLE",
  config: "cruise",
  flight,
  faults: { ...NO_FAULTS, ...faults },
});

const bearingAt = (stage: (typeof FAULT_STAGES)[number]) => inputs({ scenario: "bearing-degradation", stage, severity: STAGE_SEVERITY[stage] });

describe("mission state machine", () => {
  const run = (machine: MissionMachine, ...events: Parameters<typeof missionReducer>[1][]) => events.reduce(missionReducer, machine);

  it("starts idle and enters preflight when run", () => {
    expect(INITIAL_MISSION.stage).toBe("IDLE");
    const m = run(INITIAL_MISSION, { type: "RUN", profile: "executive" });
    expect(m).toMatchObject({ stage: "PREFLIGHT", timeS: 0, playing: true, authorized: false });
  });

  it("holds at the end of preflight until the flight is authorized", () => {
    let m = run(INITIAL_MISSION, { type: "RUN" });
    for (let i = 0; i < 40; i++) m = missionReducer(m, { type: "TICK", dt: 1 });
    expect(m.stage).toBe("PREFLIGHT");
    expect(awaitingAuthorization(m)).toBe(true);
    m = missionReducer(m, { type: "AUTHORIZE" });
    expect(m).toMatchObject({ stage: "TAKEOFF", authorized: true, playing: true });
    expect(m.timeS).toBe(stageStartS("executive", "TAKEOFF"));
  });

  it("visits every stage in order and completes", () => {
    let m = run(INITIAL_MISSION, { type: "RUN" }, { type: "AUTHORIZE" });
    const seen = [m.stage];
    for (let i = 0; i < 2000 && m.stage !== "COMPLETE"; i++) {
      m = missionReducer(m, { type: "TICK", dt: 0.25 });
      if (seen[seen.length - 1] !== m.stage) seen.push(m.stage);
    }
    expect(seen).toEqual([...MISSION_SEQUENCE.slice(1), "COMPLETE"]);
    expect(m.playing).toBe(false);
    expect(m.timeS).toBe(missionDurationS("executive"));
  });

  it("steps with NEXT and PREVIOUS, treating a step past preflight as authorization", () => {
    let m = run(INITIAL_MISSION, { type: "RUN" }, { type: "PAUSE" }, { type: "NEXT" });
    expect(m).toMatchObject({ stage: "TAKEOFF", authorized: true });
    m = run(m, { type: "NEXT" }, { type: "NEXT" });
    expect(m.stage).toBe("CRUISE");
    m = missionReducer(m, { type: "PREVIOUS" });
    expect(m.stage).toBe("TRANSITION");
    for (let i = 0; i < MISSION_SEQUENCE.length; i++) m = missionReducer(m, { type: "NEXT" });
    expect(m.stage).toBe("COMPLETE");
  });

  it("does not tick while paused, idle or complete, and resets to idle", () => {
    const paused = run(INITIAL_MISSION, { type: "RUN" }, { type: "PAUSE" });
    expect(missionReducer(paused, { type: "TICK", dt: 5 })).toBe(paused);
    expect(missionReducer(INITIAL_MISSION, { type: "TICK", dt: 5 })).toBe(INITIAL_MISSION);
    expect(missionReducer(paused, { type: "RESET" })).toMatchObject({ stage: "IDLE", timeS: 0, playing: false });
  });

  it("runs about two minutes as the executive demo and six to ten as the engineering mission", () => {
    expect(missionDurationS("executive")).toBeGreaterThanOrEqual(100);
    expect(missionDurationS("executive")).toBeLessThanOrEqual(140);
    expect(missionDurationS("engineering")).toBeGreaterThanOrEqual(360);
    expect(missionDurationS("engineering")).toBeLessThanOrEqual(600);
  });

  it("maps mission time to a stage and a progress", () => {
    expect(stageAt(0, "executive")).toEqual({ phase: "PREFLIGHT", progress: 0 });
    const start = stageStartS("executive", "CRUISE");
    expect(stageAt(start + 7, "executive")).toEqual({ phase: "CRUISE", progress: 0.5 });
    expect(stageAt(1e6, "executive").phase).toBe("POSTFLIGHT");
  });
});

describe("flight model", () => {
  const at = (phase: (typeof MISSION_SEQUENCE)[number], progress: number, profile: "executive" | "engineering" = "executive") => {
    const start = stageStartS(profile, phase);
    const next = MISSION_SEQUENCE[MISSION_SEQUENCE.indexOf(phase) + 1];
    const end = next ? stageStartS(profile, next) : missionDurationS(profile);
    return flightStateAt(start + (end - start) * progress, profile);
  };

  it("is deterministic", () => {
    expect(flightStateAt(47.3, "executive")).toEqual(flightStateAt(47.3, "executive"));
  });

  it("sits on the pad in preflight and lifts vertically in takeoff", () => {
    expect(at("PREFLIGHT", 0.5)).toMatchObject({ onGround: true, sceneY: 0, tiltDeg: 90, tiltRpm: 0 });
    const climbing = at("TAKEOFF", 0.8);
    expect(climbing.onGround).toBe(false);
    expect(climbing.sceneY).toBeGreaterThan(0);
    expect(climbing.sceneX).toBe(0);
    expect(climbing.tiltDeg).toBe(90);
    expect(climbing.rotorLiftShare).toBe(1);
  });

  it("hands lift from the rotors to the wing through transition", () => {
    const shares = [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => at("TRANSITION", p));
    for (let i = 1; i < shares.length; i++) {
      expect(shares[i].wingLiftShare).toBeGreaterThan(shares[i - 1].wingLiftShare);
      expect(shares[i].tiltDeg).toBeLessThan(shares[i - 1].tiltDeg);
      expect(shares[i].liftRpm).toBeLessThanOrEqual(shares[i - 1].liftRpm);
    }
    shares.forEach((s) => expect(s.rotorLiftShare + s.wingLiftShare).toBeCloseTo(1));
    expect(at("TRANSITION", 0.2).rotorLiftShare).toBeGreaterThan(0.7);
    expect(at("TRANSITION", 0.85).wingLiftShare).toBeGreaterThan(0.7);
  });

  it("cruises on the wing with the lift units stopped", () => {
    const c = at("CRUISE", 0.5);
    expect(c).toMatchObject({ tiltDeg: 0, liftRpm: 0, wingLiftShare: 1, rotorLiftShare: 0 });
    expect(c.batteryPowerKw).toBeLessThan(at("TAKEOFF", 0.9).batteryPowerKw);
  });

  it("returns to vertical flight and lands at the destination", () => {
    expect(at("APPROACH", 0.95).tiltDeg).toBeGreaterThan(80);
    const down = at("LANDING", 0.95);
    expect(down).toMatchObject({ onGround: true, sceneY: 0, atDestination: true });
    expect(down.sceneX).toBeCloseTo(routeLengthM("executive"));
    expect(at("POSTFLIGHT", 0.9).tiltRpm).toBe(0);
  });

  it("uses energy monotonically", () => {
    let soc = Infinity;
    for (let t = 0; t < missionDurationS("executive"); t += 2) {
      const next = flightStateAt(t, "executive").socPercent;
      expect(next).toBeLessThanOrEqual(soc + 1e-9);
      soc = next;
    }
    expect(soc).toBeGreaterThan(40);
  });

  it("flies the same shape in both profiles", () => {
    expect(at("TRANSITION", 0.4, "engineering").tiltDeg).toBeCloseTo(at("TRANSITION", 0.4, "executive").tiltDeg);
    expect(routeLengthM("engineering")).toBeGreaterThan(routeLengthM("executive") * 3);
  });
});

describe("the health event carried by the mission", () => {
  it("is absent before the health-event stage", () => {
    for (const phase of ["PREFLIGHT", "TAKEOFF", "TRANSITION", "CRUISE"] as const) expect(missionFaultAt(phase, 0.9)).toEqual({ stage: "HEALTHY", severity: 0 });
  });

  it("changes subtly first, then crosses the detection threshold", () => {
    expect(missionFaultAt("HEALTH_EVENT", 0.2).stage).toBe("EARLY_CHANGE");
    expect(missionFaultAt("HEALTH_EVENT", 0.2).severity).toBeLessThan(ANOMALY_SEVERITY);
    expect(missionFaultAt("HEALTH_EVENT", 0.95)).toMatchObject({ stage: "ANOMALOUS" });
  });

  it("never decreases, and ends with maintenance", () => {
    let last = 0;
    for (const phase of MISSION_SEQUENCE) {
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        const { severity } = missionFaultAt(phase, p);
        expect(severity).toBeGreaterThanOrEqual(last - 1e-9);
        last = severity;
      }
    }
    expect(missionFaultAt("DIAGNOSIS", 0.5).stage).toBe("DIAGNOSED");
    expect(missionFaultAt("LANDING", 0.5).stage).toBe("ACTION_REQUIRED");
    expect(missionFaultAt("POSTFLIGHT", 0.5).stage).toBe("MAINTENANCE");
  });
});

describe("fault state machine", () => {
  it("does nothing until a scenario is started", () => {
    expect(faultReducer(INITIAL_FAULT, { type: "NEXT" })).toMatchObject({ scenario: null, stage: "HEALTHY" });
    expect(faultReducer(INITIAL_FAULT, { type: "TICK", dt: 100 })).toBe(INITIAL_FAULT);
  });

  it("walks the seven stages in order, forward and back", () => {
    let m: FaultMachine = faultReducer(INITIAL_FAULT, { type: "START", scenario: "bearing-degradation" });
    const seen = [m.stage];
    for (let i = 0; i < 10; i++) {
      m = faultReducer(m, { type: "NEXT" });
      if (seen[seen.length - 1] !== m.stage) seen.push(m.stage);
    }
    expect(seen).toEqual(["HEALTHY", "EARLY_CHANGE", "ANOMALOUS", "DIAGNOSED", "DEGRADING", "ACTION_REQUIRED", "MAINTENANCE"]);
    expect(faultReducer(m, { type: "PREVIOUS" }).stage).toBe("ACTION_REQUIRED");
    expect(faultReducer(m, { type: "GOTO", stage: "ANOMALOUS" }).stage).toBe("ANOMALOUS");
  });

  it("advances on its own while playing and stops at the last stage", () => {
    let m: FaultMachine = faultReducer(INITIAL_FAULT, { type: "START", scenario: "bearing-degradation", autoplay: true });
    m = faultReducer(m, { type: "TICK", dt: STAGE_DWELL_S - 0.1 });
    expect(m.stage).toBe("HEALTHY");
    m = faultReducer(m, { type: "TICK", dt: 0.2 });
    expect(m).toMatchObject({ stage: "EARLY_CHANGE", stageTimeS: 0 });
    for (let i = 0; i < 20; i++) m = faultReducer(m, { type: "TICK", dt: STAGE_DWELL_S });
    expect(m).toMatchObject({ stage: "MAINTENANCE", playing: false });
    expect(faultReducer(m, { type: "PLAY" })).toMatchObject({ stage: "HEALTHY", playing: true });
    expect(faultReducer(m, { type: "CLEAR" })).toEqual(INITIAL_FAULT);
  });

  it("puts the detection threshold between early change and anomaly", () => {
    expect(STAGE_SEVERITY.EARLY_CHANGE).toBeLessThan(ANOMALY_SEVERITY);
    expect(STAGE_SEVERITY.ANOMALOUS).toBeGreaterThan(ANOMALY_SEVERITY);
    FAULT_STAGES.reduce((previous, stage) => {
      expect(STAGE_SEVERITY[stage]).toBeGreaterThanOrEqual(STAGE_SEVERITY[previous]);
      return stage;
    });
  });
});

describe("bearing degradation model", () => {
  const at = (faultSeverity: number) => bearingDegradation({ missionTime: 0, rpm: cruise.tiltRpm, load: cruise.tiltLoad, faultSeverity });

  it("is deterministic", () => {
    expect(at(0.37)).toEqual(at(0.37));
  });

  it("reads inside its expected range when healthy, with no alarm", () => {
    const healthy = at(0);
    expect(healthy.vibrationRms).toBeGreaterThan(healthy.expectedVibration.min);
    expect(healthy.vibrationRms).toBeLessThan(healthy.expectedVibration.max);
    expect(healthy).toMatchObject({ anomaly: false, healthState: "NOMINAL", diagnosis: null, confidence: null, prognosisBand: null });
    expect(healthy.expectedVibration.min).toBeCloseTo(0.72, 1);
    expect(healthy.expectedVibration.max).toBeCloseTo(0.9, 1);
  });

  it("changes subtly before it is detected", () => {
    const early = at(STAGE_SEVERITY.EARLY_CHANGE);
    expect(early.spectralFeature).toBeGreaterThan(at(0).spectralFeature);
    expect(early.spectralFeature).toBeLessThan(early.featureLimit);
    expect(early).toMatchObject({ anomaly: false, healthState: "NOMINAL" });
  });

  it("detects the anomaly once the feature leaves the baseline model", () => {
    const anomalous = at(STAGE_SEVERITY.ANOMALOUS);
    expect(anomalous.spectralFeature).toBeGreaterThan(anomalous.featureLimit);
    expect(anomalous).toMatchObject({ anomaly: true, healthState: "DEGRADED" });
    expect(anomalous.vibrationRms).toBeGreaterThan(anomalous.expectedVibration.max);
  });

  it("diagnoses with evidence and a confidence level, never a decimal percentage", () => {
    const diagnosed = at(STAGE_SEVERITY.DIAGNOSED);
    expect(diagnosed.diagnosis).toBe("POSSIBLE BEARING DEGRADATION");
    expect(diagnosed.evidence.map((e) => e.label)).toEqual(["Vibration trend", "Frequency feature", "Temperature trend"]);
    expect(diagnosed.evidence.every((e) => e.present)).toBe(true);
    expect(diagnosed.confidence).toBe("HIGH");
    expect(diagnosed.vibrationRms).toBeCloseTo(1.42, 1);
  });

  it("rises monotonically with severity", () => {
    let previous = at(0);
    for (let s = 0.05; s <= 1; s += 0.05) {
      const next = at(s);
      expect(next.vibrationRms).toBeGreaterThan(previous.vibrationRms);
      expect(next.spectralFeature).toBeGreaterThan(previous.spectralFeature);
      expect(next.bearingTemp).toBeGreaterThan(previous.bearingTemp);
      expect(next.healthIndex).toBeLessThanOrEqual(previous.healthIndex);
      previous = next;
    }
  });

  it("gives a maintenance window as a range of whole flight cycles", () => {
    const degrading = at(STAGE_SEVERITY.DEGRADING);
    expect(degrading.prognosisBand).not.toBeNull();
    const { fromCycles, toCycles } = degrading.prognosisBand!;
    expect(fromCycles % 5).toBe(0);
    expect(toCycles % 5).toBe(0);
    expect(toCycles).toBeGreaterThan(fromCycles);
    expect(degrading.maintenanceRecommendation).toMatch(/Within next \d+–\d+ flight cycles/);
  });

  it("keeps its conclusion when the rotor has stopped", () => {
    const stopped = bearingDegradation({ missionTime: 0, rpm: 0, load: 0, faultSeverity: STAGE_SEVERITY.MAINTENANCE });
    expect(stopped).toMatchObject({ anomaly: true, healthState: "DEGRADED", confidence: "HIGH" });
  });
});

describe("battery imbalance model", () => {
  it("is quiet when healthy and raises three kinds of evidence when faulted", () => {
    const healthy = batteryImbalance({ load: 0.8, faultSeverity: 0 });
    expect(healthy).toMatchObject({ anomaly: false, powerFactor: 1, derated: false });
    const faulted = batteryImbalance({ load: 0.8, faultSeverity: STAGE_SEVERITY.DIAGNOSED });
    expect(faulted.voltageSpreadMv).toBeGreaterThan(healthy.voltageSpreadMv);
    expect(faulted.temperatureSpreadC).toBeGreaterThan(healthy.temperatureSpreadC);
    expect(faulted.resistanceRatio).toBeGreaterThan(healthy.resistanceRatio);
    expect(faulted).toMatchObject({ anomaly: true, healthState: "DEGRADED", derated: true });
    expect(faulted.powerFactor).toBeLessThan(1);
  });

  it("degrades module 03 only", () => {
    const state = batteryState(steadyState("hover"), STAGE_SEVERITY.DIAGNOSED);
    const worst = [...state.modules].sort((a, b) => b.voltageSpreadMv - a.voltageSpreadMv)[0];
    expect(worst.no).toBe("03");
    expect(state.availablePowerKw).toBeLessThan(batteryState(steadyState("hover"), 0).availablePowerKw);
    expect(state.modules).toHaveLength(8);
  });
});

describe("health-state logic", () => {
  it("reports every system nominal and the aircraft mission capable when healthy", () => {
    const { twin } = buildHealthSnapshot(inputs());
    MONITORED_SYSTEMS.forEach((id) => expect(twin.systems[id].state).toBe("NOMINAL"));
    expect(twin.vehicle).toBe("MISSION_CAPABLE");
    expect(twin.hums).toBe("MONITORING");
  });

  it("monitors quietly in cruise", () => {
    expect(buildHealthSnapshot({ ...inputs(), missionPhase: "CRUISE" }).twin.hums).toBe("BACKGROUND_MONITORING");
  });

  it("stays nominal through an early change", () => {
    const { twin } = buildHealthSnapshot(bearingAt("EARLY_CHANGE"));
    expect(twin.systems.propulsion.state).toBe("NOMINAL");
    expect(twin.hums).toBe("MONITORING");
    expect(twin.vehicle).toBe("MISSION_CAPABLE");
  });

  it("degrades unit 04 and propulsion on an anomaly, with the unit still available and the mission still capable", () => {
    const { twin } = buildHealthSnapshot(bearingAt("ANOMALOUS"));
    expect(twin.components["propulsion-unit-04"]).toMatchObject({ state: "DEGRADED", available: true });
    expect(twin.components["pu04-bearing-front"]?.state).toBe("DEGRADED");
    expect(twin.components["propulsion-unit-03"]?.state).toBe("NOMINAL");
    expect(twin.systems.propulsion).toMatchObject({ state: "DEGRADED", contributors: ["propulsion-unit-04", "pu04-bearing-front"] });
    expect(twin.systems.energy.state).toBe("NOMINAL");
    expect(twin.hums).toBe("ANOMALY_DETECTED");
    expect(twin.vehicle).toBe("MISSION_CAPABLE");
  });

  it("moves HUMS through diagnosis to prognosis", () => {
    expect(buildHealthSnapshot(bearingAt("DIAGNOSED")).twin.hums).toBe("DIAGNOSED");
    expect(buildHealthSnapshot(bearingAt("DEGRADING")).twin.hums).toBe("PROGNOSIS_AVAILABLE");
  });

  it("requires maintenance and withholds release after the flight", () => {
    const { twin } = buildHealthSnapshot({ ...bearingAt("MAINTENANCE"), flight: groundState("POSTFLIGHT", "vertiport"), config: "ground" });
    expect(twin.components["propulsion-unit-04"]?.state).toBe("MAINTENANCE_REQUIRED");
    expect(twin.systems.propulsion.state).toBe("MAINTENANCE_REQUIRED");
    expect(twin.vehicle).toBe("NOT_RELEASED");
  });

  it("limits the mission when battery power is derated", () => {
    const { twin } = buildHealthSnapshot(inputs({ scenario: "battery-imbalance", stage: "ACTION_REQUIRED", severity: STAGE_SEVERITY.ACTION_REQUIRED }, steadyState("hover")));
    expect(twin.components["battery-module-03"]?.state).toBe("DEGRADED");
    expect(twin.systems.energy.state).toBe("LIMITED");
    expect(twin.vehicle).toBe("MISSION_CAPABLE_WITH_LIMITATION");
    expect(twin.systems.propulsion.state).toBe("NOMINAL");
  });

  it("derives vehicle state from system states", () => {
    const base = buildHealthSnapshot(inputs()).twin.systems;
    const withState = (state: "DEGRADED" | "LIMITED" | "MAINTENANCE_REQUIRED" | "UNAVAILABLE") => ({ ...base, thermal: { ...base.thermal, state } });
    expect(vehicleState(withState("DEGRADED"))).toBe("MISSION_CAPABLE");
    expect(vehicleState(withState("LIMITED"))).toBe("MISSION_CAPABLE_WITH_LIMITATION");
    expect(vehicleState(withState("MAINTENANCE_REQUIRED"))).toBe("NOT_RELEASED");
    expect(vehicleState(withState("UNAVAILABLE"))).toBe("NOT_RELEASED");
  });

  it("uses only the approved state vocabulary", () => {
    const { twin } = buildHealthSnapshot(bearingAt("DIAGNOSED"));
    const allowed = ["NOMINAL", "DEGRADED", "LIMITED", "MAINTENANCE_REQUIRED", "UNAVAILABLE"];
    Object.values(twin.systems).forEach((s) => expect(allowed).toContain(s.state));
    Object.values(twin.components).forEach((c) => expect(allowed).toContain(c!.state));
    expect(JSON.stringify(twin)).not.toMatch(/"(GOOD|BAD|DANGER)"/);
  });
});

describe("redundancy references", () => {
  it("contains the loss of FCC-B", () => {
    const voting = votingState(["fcc-b"]);
    expect(voting.channels).toEqual({ "fcc-a": "AVAILABLE", "fcc-b": "UNAVAILABLE", "fcc-c": "AVAILABLE" });
    expect(voting).toMatchObject({ voting: "AVAILABLE", flightControl: "AVAILABLE", faultContained: true });
    const { twin } = buildHealthSnapshot(inputs({ fccBFailed: true }));
    expect(twin.components["fcc-b"]).toMatchObject({ state: "UNAVAILABLE", available: false });
    expect(twin.systems.flightControl.state).toBe("LIMITED");
    expect(twin.vehicle).toBe("MISSION_CAPABLE_WITH_LIMITATION");
  });

  it("loses voting, but not control, with a single channel", () => {
    expect(votingState([])).toMatchObject({ voting: "AVAILABLE", faultContained: false, state: "NOMINAL" });
    expect(votingState(["fcc-a", "fcc-b"])).toMatchObject({ voting: "UNAVAILABLE", flightControl: "AVAILABLE" });
    expect(votingState(["fcc-a", "fcc-b", "fcc-c"])).toMatchObject({ flightControl: "UNAVAILABLE", state: "UNAVAILABLE" });
  });

  it("keeps a position solution without GNSS, with navigation degraded", () => {
    const nav = navigationState(["gnss"]);
    expect(nav).toMatchObject({ state: "DEGRADED", positionSolution: "AVAILABLE" });
    expect(nav.uncertaintyM).toBeGreaterThan(navigationState([]).uncertaintyM);
    const { twin } = buildHealthSnapshot(inputs({ gnssUnavailable: true }));
    expect(twin.systems.navigation.state).toBe("DEGRADED");
    expect(twin.components.gnss?.state).toBe("UNAVAILABLE");
    expect(navigationState(["imu-a", "imu-b"]).positionSolution).toBe("UNAVAILABLE");
  });
});

describe("prognostics", () => {
  it("projects nothing for a healthy component", () => {
    expect(maintenanceWindow(0)).toBeNull();
    expect(describeWindow(null)).toBe("No maintenance action predicted within the horizon");
    healthTrajectory(0).forEach((p) => expect(p.mean).toBe(1));
  });

  it("widens with distance into the future and stays narrow in the past", () => {
    const points = healthTrajectory(0.54);
    const width = (cycles: number) => {
      const p = points.find((q) => q.cycles === cycles)!;
      return p.high - p.low;
    };
    expect(width(20)).toBeGreaterThan(width(-20));
    expect(width(60)).toBeGreaterThan(width(20));
    points.forEach((p) => {
      expect(p.low).toBeLessThanOrEqual(p.mean);
      expect(p.high).toBeGreaterThanOrEqual(p.mean);
    });
    expect(points[0].mean).toBeGreaterThan(points[points.length - 1].mean);
  });

  it("brings the window closer as the fault grows", () => {
    expect(maintenanceWindow(0.58)!.toCycles).toBeLessThan(maintenanceWindow(0.44)!.toCycles);
    expect(describeWindow(maintenanceWindow(0.54))).toBe("Within next 20–35 flight cycles");
  });

  it("recommends action only once a trend is established", () => {
    expect(predictionAt(0.54, 0, true)).toMatchObject({ trend: "INCREASING", recommendation: "MAINTENANCE ACTION RECOMMENDED" });
    expect(predictionAt(0.2, 0, false)).toMatchObject({ maintenanceWindow: null, recommendation: "CONTINUE MONITORING" });
    expect(predictionAt(0, 40, false).trend).toBe("STABLE");
  });
});

describe("digital twin: observed, expected, residual, predicted", () => {
  const degraded = bearingAt("DIAGNOSED");
  const now = buildHealthSnapshot(degraded);

  it("shows motor 04 above baseline, degraded and increasing, with maintenance recommended", () => {
    const readout = twinReadout(degraded, now, "propulsion", 0);
    expect(readout.subject).toBe(TWIN_SUBJECTS.propulsion);
    expect(readout.valueLabel).toBe("OBSERVED");
    expect(readout.value).toBeCloseTo(1.42, 1);
    expect(readout.expected!.min).toBeCloseTo(0.72, 1);
    expect(readout.expected!.max).toBeCloseTo(0.9, 1);
    expect(readout).toMatchObject({ residual: "above baseline", state: "DEGRADED", trend: "INCREASING", projection: "MAINTENANCE ACTION RECOMMENDED", valueBand: null });
  });

  it("looks back to a healthy history and forward to a prediction with a band", () => {
    const past = twinReadout(degraded, now, "propulsion", -100);
    expect(past).toMatchObject({ epoch: "past", valueLabel: "RECORDED", state: "NOMINAL", residual: "within baseline", valueBand: null });
    const future = twinReadout(degraded, now, "propulsion", 60);
    expect(future).toMatchObject({ epoch: "future", valueLabel: "PREDICTED", state: "DEGRADED" });
    expect(future.value).toBeGreaterThan(now.twin.observations["pu04.vibration"]);
    expect(future.valueBand!.low).toBeLessThan(future.value);
    expect(future.valueBand!.high).toBeGreaterThan(future.value);
    const nearer = twinReadout(degraded, now, "propulsion", 20);
    expect(future.valueBand!.high - future.valueBand!.low).toBeGreaterThan(nearer.valueBand!.high - nearer.valueBand!.low);
  });

  it("leaves systems the fault does not touch stable at every time", () => {
    for (const cycles of [-100, 0, 100]) {
      const thermal = twinReadout(degraded, now, "thermal", cycles);
      expect(thermal).toMatchObject({ state: "NOMINAL", trend: "STABLE", residual: "within baseline", projection: "NO ACTION PREDICTED" });
    }
  });

  it("carries the four views of state: observations, estimates, expected ranges and predictions", () => {
    expect(now.twin.observations["pu04.vibration"]).toBeGreaterThan(0);
    expect(now.twin.estimates["pu04.bearingHealth"]).toBeLessThan(1);
    expect(now.twin.expected["pu04.vibration"]).toBeDefined();
    expect(now.twin.residuals["pu04.vibration"]).toBeGreaterThan(0);
    expect(now.twin.predictions["propulsion-unit-04"].maintenanceWindow).not.toBeNull();
    expect(now.twin.residuals["pu03.vibration"]).toBeCloseTo(0, 5);
  });
});

describe("propulsion and structures", () => {
  it("runs eight units, with the lift units stopped in cruise", () => {
    const units = unitStates(cruise, 700);
    expect(units).toHaveLength(8);
    units.filter((u) => u.kind === "tilt").forEach((u) => expect(u.rpm).toBeGreaterThan(700));
    units.filter((u) => u.kind === "lift").forEach((u) => expect(u.rpm).toBe(0));
    unitStates(steadyState("hover"), 700).forEach((u) => expect(u.rpm).toBeGreaterThan(1200));
  });

  it("moves the load path with the flight condition", () => {
    const hover = structuralState(steadyState("hover")).loads;
    const cruising = structuralState(cruise).loads;
    const ground = structuralState(groundState()).loads;
    expect(hover["rotor-mount-lift"]).toBeGreaterThan(cruising["rotor-mount-lift"]);
    expect(hover["rotor-mount-tilt"]).toBeGreaterThan(cruising["rotor-mount-tilt"]);
    expect(ground["landing-gear"]).toBeGreaterThan(0.8);
    expect(hover["landing-gear"]).toBe(0);
    expect(cruising["wing-root"]).toBeGreaterThan(0.4);
  });
});

describe("vibration signal", () => {
  const healthy = vibrationSignal({ rpm: 800, load: 0.45, severity: 0 });
  const faulted = vibrationSignal({ rpm: 800, load: 0.45, severity: 0.5 });

  it("is deterministic for a seed", () => {
    expect(vibrationSignal({ rpm: 800, load: 0.45, severity: 0.5, seed: 3 })).toEqual(vibrationSignal({ rpm: 800, load: 0.45, severity: 0.5, seed: 3 }));
  });

  it("provides time, frequency and order views", () => {
    expect(healthy.time.x.length).toBe(healthy.time.y.length);
    expect(healthy.frequency.x.length).toBeGreaterThan(100);
    expect(healthy.order.x[healthy.order.x.length - 1]).toBeGreaterThan(11);
    expect(healthy.shaftHz).toBeCloseTo(800 / 60);
  });

  it("matches the baseline level when healthy and grows with the fault", () => {
    expect(healthy.rms).toBeGreaterThan(0.7);
    expect(healthy.rms).toBeLessThan(0.95);
    expect(faulted.rms).toBeGreaterThan(healthy.rms * 1.3);
  });

  it("shows the bearing feature in the order domain only when the bearing is degraded", () => {
    expect(amplitudeNear(healthy.order, BLADE_PASS_ORDER)).toBeGreaterThan(amplitudeNear(healthy.order, BEARING_ORDER) * 3);
    expect(amplitudeNear(faulted.order, BEARING_ORDER)).toBeGreaterThan(amplitudeNear(healthy.order, BEARING_ORDER) * 4);
  });

  it("keeps the feature at the same order when speed changes, but not at the same frequency", () => {
    const slow = vibrationSignal({ rpm: 800, load: 0.45, severity: 0.5 });
    const fast = vibrationSignal({ rpm: 1250, load: 0.9, severity: 0.5 });
    const marker = (s: typeof slow) => s.orderMarkers.find((m) => m.fault)!.x;
    expect(marker(slow)).toBe(marker(fast));
    expect(fast.frequencyMarkers.find((m) => m.fault)!.x).toBeGreaterThan(slow.frequencyMarkers.find((m) => m.fault)!.x);
  });

  it("is flat with the rotor stopped", () => {
    expect(vibrationSignal({ rpm: 0, load: 0, severity: 0.5 }).rms).toBeLessThan(0.05);
  });
});

describe("sensor trace", () => {
  it("follows the flagship sensor from the bearing to the maintenance gateway", () => {
    const path = tracePath(getSensor("VIB-M04-A")!);
    expect(path.map((p) => p.step)).toEqual(["sensor", "acquisition", "edge", "feature", "health-model", "diagnostic", "prognostic", "maintenance"]);
    expect(path[0].component).toBe("pu04-bearing-front");
    expect(path[1].component).toBe("acquisition-node-wing-right");
    expect(path[2].component).toBe("edge-processor");
    expect(path[4].component).toBe("hums-computer");
    expect(path[7].component).toBe("maintenance-gateway");
  });
});
