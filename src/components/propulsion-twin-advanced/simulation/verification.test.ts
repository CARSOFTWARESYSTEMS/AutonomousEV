// Verification of the twin beyond its happy path: numerical behaviour, what it
// does with input it should not trust, each detector against cases built to
// trigger it and cases built not to, and the envelope of faults it can and
// cannot name. With ADV_TWIN_MATRIX_OUT set, the fault-coverage matrix is also
// written to that path as JSON.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CH, CHANNEL_IDS, type ChannelId, N_CH } from "./channels";
import { runEstimatorDemo } from "./estimators";
import { FAULT_DEFS, type Severities } from "./faults";
import { DATA_DIAGNOSES, DIAGNOSIS_BY_ID, FAULT_IDS, type FaultId, PHYSICAL_DIAGNOSES } from "./isolation";
import { acceptsFeatures } from "./ml";
import { AS_BUILT } from "./calibration";
import { DESIGN, type PlantParams, type PlantState, lagFraction, scheduleSpeed, solveFlows, steadyState, stepPlant, writeOutputs } from "./plant";
import { DT, FLAT_LINE, MAX_STEPS, SETTLE_TIME_CONSTANTS, THROTTLE_RANGE, UNRECOGNISED_AFTER } from "./twinCore";
import { TwinEngine } from "./twinEngine";
import type { DetectorId, FaultOnset, TwinSnapshot } from "./twinTypes";

const PHYSICAL_FAULTS = FAULT_IDS.filter((f) => !(DATA_DIAGNOSES as readonly string[]).includes(f));
const DATA_FAULTS = FAULT_IDS.filter((f) => (DATA_DIAGNOSES as readonly string[]).includes(f));
const seconds = (s: number) => Math.round(s / DT);
const detector = (s: TwinSnapshot, id: DetectorId) => s.detectors.find((d) => d.id === id)!;

/** A twin whose physical system and telemetry can be tampered with, to stand in for faults and failures it has no model of. */
class Rig extends TwinEngine {
  unmodelled: ((p: PlantParams, t: number) => PlantParams) | null = null;
  tamper: ((obs: Float64Array, t: number) => void) | null = null;
  protected physicalSystem(system: PlantParams, sev: Severities): PlantParams {
    const p = super.physicalSystem(system, sev);
    return this.unmodelled ? this.unmodelled(p, this.t) : p;
  }
  protected acquire(k: number, sev: Severities): void {
    super.acquire(k, sev);
    this.tamper?.(this.obs, this.t);
  }
  breakClassifier(): void {
    this.classifier = { ...this.classifier, model: { weights: this.classifier.model.weights.map((w) => w.slice(0, 5)) } };
  }
}

/** Every number in a snapshot, with the path to it. */
function numbers(value: unknown, path = "", found: [string, number][] = []): [string, number][] {
  if (typeof value === "number") found.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => numbers(v, `${path}[${i}]`, found));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) numbers(v, path ? `${path}.${k}` : k, found);
  return found;
}

let twin: Rig;
beforeAll(() => {
  twin = new Rig();
});
const fresh = () => {
  twin.unmodelled = null;
  twin.tamper = null;
  twin.reset();
  return twin;
};

describe("numerical behaviour of the pressure network", () => {
  it("moves a first-order lag by the exact fraction, never more than all the way", () => {
    expect(lagFraction(0.55, 0.55)).toBeCloseTo(1 - Math.exp(-1), 12);
    expect(lagFraction(0, 0.5)).toBe(0);
    expect(lagFraction(-1, 0.5)).toBe(0);
    expect(lagFraction(1e9, 0.5)).toBe(1);
    for (const dt of [0.001, 0.05, 0.5, 5, 500]) expect(lagFraction(dt, 0.08)).toBeLessThanOrEqual(1);
  });

  it.each([0.01, 0.05, 0.11, 0.55])("gives the shaft its stated time constant whatever the step size: dt = %s s", (dt) => {
    const s: PlantState = { ...steadyState(DESIGN, 0.8).state };
    const steps = Math.round(DESIGN.tauN / dt);
    for (let i = 0; i < steps; i++) stepPlant(DESIGN, s, 1, true, dt);
    expect((s.speed - 0.8) / 0.2).toBeCloseTo(1 - Math.exp(-(steps * dt) / DESIGN.tauN), 9);
  });

  it("stays bounded and settles at the same operating point for any step size, where the explicit update diverged above about 1 s", () => {
    const settled = steadyState(DESIGN, scheduleSpeed(1)).state;
    for (const dt of [0.005, 0.05, 0.5, 1.2, 3, 10, 60]) {
      const s: PlantState = { ...steadyState(DESIGN, scheduleSpeed(0.6)).state };
      let peak = 0;
      for (let t = 0; t < Math.max(30, dt * 12); t += dt) {
        stepPlant(DESIGN, s, scheduleSpeed(1), true, dt);
        peak = Math.max(peak, s.pc, s.speed * 100);
      }
      // Up to half a second there is no overshoot at all. A longer step holds the flows still for longer than the chamber
      // takes to respond, so the first step overshoots (by 13 % at worst here) and then settles: bounded, where it used to reach 1e25.
      expect(peak, `dt ${dt}`).toBeLessThan(dt <= 0.5 ? 101 : 115);
      expect(s.pc, `dt ${dt}`).toBeCloseTo(settled.pc, 3);
      expect(s.speed, `dt ${dt}`).toBeCloseTo(settled.speed, 6);
      expect(s.tCool, `dt ${dt}`).toBeCloseTo(settled.tCool, 2);
    }
  });

  it("converges as the step shrinks: the run at the simulation's step differs from one ten times finer by a small, stated amount", () => {
    const run = (dt: number) => {
      const s: PlantState = { ...steadyState(AS_BUILT, scheduleSpeed(1)).state };
      const samples: number[] = [];
      for (let k = 1; k <= Math.round(3 / dt); k++) {
        stepPlant(AS_BUILT, s, scheduleSpeed(0.7), true, dt);
        if (k % Math.round(0.25 / dt) === 0) samples.push(s.pc);
      }
      return samples;
    };
    const coarse = run(DT);
    const fine = run(DT / 10);
    const worst = Math.max(...coarse.map((value, i) => Math.abs(value - fine[i])));
    // Discretisation error of the 50 ms step through a 100 → 70 % throttle step: under 1 % of reference chamber pressure.
    expect(worst).toBeLessThan(1);
    expect(coarse.at(-1)).toBeCloseTo(fine.at(-1)!, 1);
  });

  it("closes the pressure budget of both branches at every step of a transient, not only at rest", () => {
    const s: PlantState = { ...steadyState(AS_BUILT, scheduleSpeed(1)).state };
    const v = new Array<number>(N_CH).fill(0);
    let worst = 0;
    for (let k = 0; k < seconds(4); k++) {
      const flows = stepPlant(AS_BUILT, s, scheduleSpeed(k < seconds(2) ? 0.65 : 1), true, DT);
      writeOutputs(AS_BUILT, s, flows, v);
      const ox = v[CH.pInjOx] - AS_BUILT.kInjOx * flows.mOx ** 2 - s.pc;
      const fu = v[CH.pInjFu] - AS_BUILT.kInjFu * flows.mFu ** 2 - s.pc;
      worst = Math.max(worst, Math.abs(ox), Math.abs(fu));
      // One flow per branch, so mass is conserved along it by construction; what must be checked is that it is the flow the pressures support.
      expect(solveFlows(AS_BUILT, s.speed, s.pc).mOx).toBeCloseTo(flows.mOx, 12);
    }
    // % of reference chamber pressure: the residual of the eight-pass flow solution.
    expect(worst).toBeLessThan(0.05);
  });

  it("keeps every output finite, and every pressure above zero, with all seven physical faults at full severity across the throttle range", () => {
    const e = fresh();
    for (const f of PHYSICAL_FAULTS) e.inject(f, 1, "abrupt");
    for (const throttle of [1, 0.6, 0.8, 1]) {
      e.setThrottle(throttle);
      e.step(seconds(6));
      const s = e.snapshot();
      for (const [path, value] of numbers(s)) expect(Number.isFinite(value), `${path} at throttle ${throttle}`).toBe(true);
      for (const id of CHANNEL_IDS) if (id.startsWith("p")) expect(s.channels[id].expected, id).toBeGreaterThan(0);
    }
  });
});

describe("input the engine should not trust", () => {
  it("ignores a throttle command that is not a number, and clamps one that is out of range", () => {
    const e = fresh();
    e.setThrottle(0.8);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined as unknown as number, "0.7" as unknown as number]) e.setThrottle(bad);
    e.step(seconds(6));
    expect(e.snapshot().throttle).toBeCloseTo(0.8, 6);
    e.setThrottle(5);
    e.step(seconds(4));
    expect(e.snapshot().throttle).toBeCloseTo(THROTTLE_RANGE[1], 6);
    e.setThrottle(-3);
    e.step(seconds(4));
    expect(e.snapshot().throttle).toBeCloseTo(THROTTLE_RANGE[0], 6);
    for (const [path, value] of numbers(e.snapshot())) expect(Number.isFinite(value), path).toBe(true);
  });

  it("drops a fault request that names no fault or carries no real severity, and clamps the rest", () => {
    const e = fresh();
    e.inject("pump_degradation", Number.NaN);
    e.inject("not_a_fault" as FaultId, 0.8);
    e.inject("constructor" as FaultId, 0.8);
    e.scenario("__proto__" as FaultId, 0.8);
    e.scenario("valve_restriction", Number.POSITIVE_INFINITY);
    expect(e.snapshot().faults).toEqual([]);
    expect(e.snapshot().events).toEqual([]);
    e.inject("pump_degradation", 7);
    e.inject("valve_restriction", -2);
    expect(e.snapshot().faults.map((f) => [f.id, f.target])).toEqual([["pump_degradation", 1], ["valve_restriction", 0.1]]);
  });

  it("does not hang or run away on a step count that is not a sane number", () => {
    const e = fresh();
    for (const bad of [Number.NaN, -5, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) e.step(bad);
    expect(e.snapshot().t).toBe(0);
    e.step(2.9);
    expect(e.snapshot().t).toBeCloseTo(2 * DT, 9);
    e.reset();
    e.step(1e12);
    expect(e.snapshot().t).toBeCloseTo(MAX_STEPS * DT, 6);
  });

  it("scores with the classifier only a vector of the shape it was trained on", () => {
    const model = { weights: [[1, 2, 0.5], [0, 1, 0.1]] };
    expect(acceptsFeatures(model, [0.2, 0.4], 2)).toBe(true);
    expect(acceptsFeatures(model, [0.2, 0.4, 0.1], 2), "wrong width").toBe(false);
    expect(acceptsFeatures(model, [0.2, Number.NaN], 2), "not a number").toBe(false);
    expect(acceptsFeatures(model, [0.2, 0.4], 3), "wrong number of classes").toBe(false);
    expect(acceptsFeatures({ weights: [[1, Number.NaN, 0.5], [0, 1, 0.1]] }, [0.2, 0.4], 2), "corrupt weights").toBe(false);
  });

  it("falls back to physics-based reasoning alone when the classifier cannot score, and still names the fault", () => {
    const e = new Rig();
    e.breakClassifier();
    e.inject("cooling_restriction", 0.8);
    e.step(seconds(40));
    const s = e.snapshot();
    expect(s.ranking[0].id).toBe("cooling_restriction");
    expect(s.ranking[0].ml).toBeNull();
    for (const [path, value] of numbers(s)) expect(Number.isFinite(value), path).toBe(true);
  });
});

describe("missing and frozen telemetry", () => {
  const finiteExcept = (s: TwinSnapshot, missing: readonly ChannelId[]) => {
    for (const [path, value] of numbers(s)) {
      const raw = missing.some((id) => path === `channels.${id}.observed` || path === `channels.${id}.rawResidual`);
      expect(Number.isFinite(value), path).toBe(!raw);
    }
  };

  it("coasts on the model when a sample does not arrive: the estimate stays finite, its uncertainty grows, and the gap is reported", () => {
    const e = fresh();
    e.step(seconds(5));
    const before = e.snapshot().channels.pOutOx;
    e.tamper = (obs) => {
      obs[CH.pOutOx] = Number.NaN;
    };
    e.step(seconds(10));
    const s = e.snapshot();
    finiteExcept(s, ["pOutOx"]);
    expect(s.channels.pOutOx.sigma).toBeGreaterThan(before.sigma * 3);
    expect(Math.abs(s.channels.pOutOx.estimated - before.estimated)).toBeLessThan(1);
    expect(s.quality.missing).toEqual(["pOutOx"]);
    expect(s.quality.status).toBe("DEGRADED");
    expect(s.quality.notes.join(" ")).toMatch(/no usable sample arrived/);
    expect(detector(s, "ml").active).toBe(false);
    expect(detector(s, "ml").note).toMatch(/sample is missing/);
    // A missing sample is a data problem: it must not be turned into an engine fault.
    expect(s.ranking.filter((r) => r.physics !== null)[0].id).toBe("nominal");
  });

  it("falls back to the virtual sensor when both chamber pressure sensors go silent", () => {
    const e = fresh();
    e.step(seconds(5));
    e.tamper = (obs) => {
      obs[CH.pcA] = obs[CH.pcB] = Number.NaN;
    };
    e.step(seconds(8));
    const s = e.snapshot();
    finiteExcept(s, ["pcA", "pcB"]);
    expect(Math.abs(s.chamber.estimated - s.chamber.virtual)).toBeLessThan(1.5);
    expect(Math.abs(s.chamber.estimated - 100)).toBeLessThan(3);
  });

  it("recovers when the samples return: good data, nominal diagnosis, no alarm left behind", () => {
    const e = fresh();
    e.tamper = (obs, t) => {
      if (t > 3 && t < 9) obs[CH.pInjOx] = Number.NaN;
    };
    e.step(seconds(20));
    const s = e.snapshot();
    expect(s.quality.status).toBe("GOOD");
    expect(s.quality.missing).toEqual([]);
    expect(s.anomaly).toBe(false);
    expect(s.ranking[0].id).toBe("nominal");
    finiteExcept(s, []);
  });

  it("notices a sensor that has stopped responding, which steady running would otherwise hide", () => {
    const e = fresh();
    e.step(seconds(5));
    expect(e.snapshot().quality.frozen).toEqual([]);
    let stuck: number | null = null;
    e.tamper = (obs) => {
      stuck ??= obs[CH.pCoolOut];
      obs[CH.pCoolOut] = stuck;
    };
    e.step(seconds(8));
    const s = e.snapshot();
    expect(s.quality.frozen).toEqual(["pCoolOut"]);
    expect(s.quality.status).toBe("DEGRADED");
    expect(s.quality.notes.join(" ")).toMatch(/stopped changing/);
    expect(FLAT_LINE).toBeLessThan(0.2);
  });

  it("does not call a healthy sensor frozen, over two minutes of running and a throttle change", () => {
    const e = fresh();
    for (let k = 0; k < seconds(120); k++) {
      if (k === seconds(40)) e.setThrottle(0.7);
      if (k === seconds(80)) e.setThrottle(1);
      e.step(1);
      if (k % 10 === 0) expect(e.snapshot().quality.frozen, `t ${e.snapshot().t}`).toEqual([]);
    }
  });
});

describe("residual convention", () => {
  it("judges the filtered residual (estimated − expected) and also reports the raw one (observed − expected)", () => {
    const e = fresh();
    e.inject("pump_degradation", 1, "abrupt");
    e.step(seconds(10));
    const s = e.snapshot();
    for (const id of CHANNEL_IDS) {
      const c = s.channels[id];
      expect(c.residual).toBeCloseTo(c.estimated - c.expected, 12);
      expect(c.rawResidual).toBeCloseTo(c.observed - c.expected, 12);
    }
    // Sign: a pump that delivers less than the model expects gives a negative residual.
    expect(s.channels.pOutOx.residual).toBeLessThan(-1);
  });
});

describe("detectors: built to fire, and built not to", () => {
  const quiet = (label: string, drive: (e: Rig, k: number) => void, duration: number) => {
    const e = fresh();
    const fired = new Set<DetectorId>();
    for (let k = 0; k < seconds(duration); k++) {
      drive(e, k);
      e.step(1);
      for (const d of e.snapshot().detectors) if (d.active) fired.add(d.id);
    }
    expect([...fired], label).toEqual([]);
  };

  it("true negative: no detector fires in two minutes of healthy running at full throttle", () => {
    quiet("steady", () => {}, 120);
  });

  it("true negative: no detector fires through throttle steps across the whole range", () => {
    quiet("throttle steps", (e, k) => {
      if (k === seconds(10)) e.setThrottle(0.6);
      if (k === seconds(25)) e.setThrottle(0.85);
      if (k === seconds(40)) e.setThrottle(1);
    }, 60);
  });

  it("true negative: no detector fires through shutdown and restart", () => {
    quiet("mode change", (e, k) => {
      if (k === seconds(8)) e.shutdown();
      if (k === seconds(20)) e.start();
    }, 50);
  });

  it("rate of change: silent on a fault that grows slowly, and among the first to fire on one that arrives at once", () => {
    const e = fresh();
    e.step(seconds(5));
    e.inject("pump_degradation", 1);
    let peak = 0;
    for (let k = 0; k < seconds(40); k++) {
      e.step(1);
      peak = Math.max(peak, detector(e.snapshot(), "rate").score);
    }
    // A 24 s ramp moves the residual at a fraction of the alarm rate: the slower detectors are the ones that catch it.
    expect(peak).toBeLessThan(0.6);
    expect(detector(e.snapshot(), "rate").latency).toBeNull();
    expect(detector(e.snapshot(), "cusum").latency).not.toBeNull();

    e.reset();
    e.step(seconds(5));
    e.inject("pump_degradation", 1, "abrupt");
    e.step(seconds(5));
    const s = e.snapshot();
    const rate = detector(s, "rate").latency;
    expect(rate).not.toBeNull();
    expect(rate!).toBeLessThanOrEqual(0.5);
    for (const id of ["cusum", "multivariate", "redline"] as const) expect(detector(s, id).latency ?? Infinity, id).toBeGreaterThanOrEqual(rate!);
  });

  it("rate of change: does not mistake a commanded throttle step for a fault", () => {
    const e = fresh();
    let peak = 0;
    for (let k = 0; k < seconds(30); k++) {
      if (k === seconds(5)) e.setThrottle(0.6);
      if (k === seconds(15)) e.setThrottle(1);
      e.step(1);
      peak = Math.max(peak, detector(e.snapshot(), "rate").score);
    }
    expect(peak).toBeLessThan(0.6);
  });

  it("hybrid: one statistical detector alone does not declare an anomaly; two, or a redline, do", () => {
    const e = fresh();
    e.inject("combustion_loss", 1);
    let alone = 0;
    for (let k = 0; k < seconds(30); k++) {
      e.step(1);
      const s = e.snapshot();
      const voters = (["residual", "cusum", "multivariate", "ml"] as const).filter((id) => detector(s, id).active).length;
      if (voters < 2 && !detector(s, "redline").active) {
        expect(s.anomaly, `t ${s.t}`).toBe(false);
        if (voters === 1) alone++;
      } else expect(s.anomaly, `t ${s.t}`).toBe(true);
    }
    expect(alone).toBeGreaterThan(0);
  });

  it("learned detector: not counted while the engine is outside the steady conditions it was trained on", () => {
    const e = fresh();
    e.step(seconds(3));
    e.setThrottle(0.6);
    e.step(seconds(0.4));
    const s = e.snapshot();
    expect(s.anomalyScore.outOfDistribution).toBe(true);
    expect(detector(s, "ml").active).toBe(false);
    expect(detector(s, "ml").note).toMatch(/Outside its training conditions/);
  });
});

/** What the hold after a start costs a real fault: seconds from health checks resuming to detection and to isolation. */
const afterHold: { fault: string; holdSeconds: number; detectedAfterHold: number; isolatedAfterHold: number }[] = [];

describe("start, restart and the hold on health checks that follows a start", () => {
  /** Stops the engine and starts it again. Returns the time mainstage was reached. */
  const restart = (e: Rig): number => {
    e.shutdown();
    while (e.snapshot().mode !== "ready") e.step(1);
    e.step(seconds(2));
    e.start();
    while (e.snapshot().mode === "start") e.step(1);
    return e.snapshot().t;
  };
  /** Steps until health checks resume, and returns that time. */
  const untilMonitoring = (e: Rig): number => {
    for (let k = 0; k < seconds(20) && !e.snapshot().monitoring; k++) e.step(1);
    return e.snapshot().t;
  };

  it("holds health checks for five model shaft time constants after mainstage is reached, and no longer", () => {
    const e = fresh();
    e.step(seconds(3));
    const mainstage = restart(e);
    expect(e.snapshot().monitoring).toBe(false);
    expect(e.snapshot().status.twin).toBe("HOLDING");
    const resumed = untilMonitoring(e);
    const hold = SETTLE_TIME_CONSTANTS * e.model.tauN;
    expect(hold).toBeCloseTo(2.75, 6);
    expect(resumed - mainstage).toBeGreaterThanOrEqual(hold - DT);
    expect(resumed - mainstage).toBeLessThanOrEqual(hold + 2 * DT);
  });

  it("raises nothing on a healthy engine through the start and for a minute after it", () => {
    const e = fresh();
    e.step(seconds(3));
    restart(e);
    for (let k = 0; k < seconds(60); k++) {
      e.step(1);
      const s = e.snapshot();
      expect(s.detectors.filter((d) => d.active).map((d) => d.id), `t ${s.t.toFixed(2)}`).toEqual([]);
    }
    expect(e.snapshot().events.filter((ev) => ev.kind === "detected")).toEqual([]);
    expect(e.snapshot().ranking[0].id).toBe("nominal");
  });

  it.each(["pump_degradation", "valve_restriction", "cooling_restriction", "feed_pressure_reduction", "injector_restriction", "combustion_loss", "pc_sensor_drift"] as const)(
    "does not hide a real fault behind the hold: %s, present before the start, is declared and isolated once the hold ends",
    (fault) => {
      const e = fresh();
      e.step(seconds(3));
      e.shutdown();
      while (e.snapshot().mode !== "ready") e.step(1);
      e.inject(fault, 0.8, "abrupt");
      e.step(seconds(2));
      e.start();
      while (e.snapshot().mode === "start") e.step(1);
      // Held: no health verdict while the start transient settles.
      while (!e.snapshot().monitoring) {
        expect(e.snapshot().anomaly, `${fault}: anomaly declared during the hold`).toBe(false);
        e.step(1);
      }
      const resumed = e.snapshot().t;
      let detected: number | null = null;
      let isolated: number | null = null;
      for (let k = 0; k < seconds(20) && isolated === null; k++) {
        e.step(1);
        const s = e.snapshot();
        if (detected === null && s.anomaly) detected = s.t - resumed;
        if (s.events.some((ev) => ev.kind === "isolated" && ev.id === fault)) isolated = s.t - resumed;
      }
      // The fault costs the hold and no more: declared within two seconds of health checks resuming, and named within ten.
      expect(detected, `${fault}: detection after the hold`).not.toBeNull();
      expect(detected!).toBeLessThanOrEqual(2);
      expect(isolated, `${fault}: isolation after the hold`).not.toBeNull();
      expect(isolated!).toBeLessThanOrEqual(10);
      expect(e.snapshot().ranking[0].id).toBe(fault);
      afterHold.push({ fault, holdSeconds: SETTLE_TIME_CONSTANTS * e.model.tauN, detectedAfterHold: Number(detected!.toFixed(2)), isolatedAfterHold: Number(isolated!.toFixed(2)) });
    },
  );

  it("detects a fault that arrives during the hold as soon as the hold ends", () => {
    const e = fresh();
    e.step(seconds(3));
    restart(e);
    e.step(seconds(0.5));
    expect(e.snapshot().monitoring).toBe(false);
    e.inject("injector_restriction", 1, "abrupt");
    const resumed = untilMonitoring(e);
    expect(e.snapshot().anomaly).toBe(false);
    e.step(seconds(2));
    expect(e.snapshot().anomaly).toBe(true);
    e.step(seconds(8));
    expect(e.snapshot().ranking[0].id).toBe("injector_restriction");
    expect(e.snapshot().t - resumed).toBeLessThanOrEqual(10.1);
  });

  it("holds through shutdown as well: a commanded shutdown is not reported as a fault", () => {
    const e = fresh();
    e.step(seconds(3));
    e.shutdown();
    for (let k = 0; k < seconds(6); k++) {
      e.step(1);
      expect(e.snapshot().anomaly).toBe(false);
    }
    expect(e.snapshot().mode).toBe("ready");
    expect(e.snapshot().status.twin).toBe("HOLDING");
  });
});

describe("running a fault as a scenario", () => {
  it("replaces the active fault and restarts from the healthy baseline, so nothing is carried over", () => {
    const e = fresh();
    e.setThrottle(0.8);
    e.step(seconds(8));
    e.scenario("valve_restriction");
    e.step(seconds(30));
    expect(e.snapshot().anomaly).toBe(true);
    e.scenario("pc_sensor_drift");
    const s = e.snapshot();
    expect(s.faults.map((f) => f.id)).toEqual(["pc_sensor_drift"]);
    expect(s.t).toBe(0);
    expect(s.anomaly).toBe(false);
    expect(s.ranking[0].id).toBe("nominal");
    expect(s.detectors.every((d) => !d.active && d.latency === null)).toBe(true);
    expect(s.events.map((ev) => ev.kind)).toEqual(["injected"]);
    expect(s.throttle).toBeCloseTo(0.8, 6);
    e.step(seconds(2));
    // Two seconds in, nothing can have been detected yet: the latencies reported before this fix (0.05 s) were the previous fault's.
    expect(e.snapshot().detectors.every((d) => d.latency === null)).toBe(true);
    e.step(seconds(40));
    const later = e.snapshot();
    expect(later.ranking[0].id).toBe("pc_sensor_drift");
    expect(later.events.filter((ev) => ev.kind === "detected")).toHaveLength(1);
    for (const d of later.detectors) if (d.latency !== null) expect(d.latency, d.id).toBeGreaterThan(1);
  });

  it("gives the same run whatever came before it", () => {
    const run = (prepare: (e: Rig) => void) => {
      const e = fresh();
      e.setThrottle(0.9);
      prepare(e);
      e.scenario("injector_restriction", 0.7);
      e.step(seconds(25));
      return e.snapshot();
    };
    const direct = run((e) => {
      e.scenario("cooling_restriction");
      e.step(1);
    });
    const afterOthers = run((e) => {
      e.scenario("pump_degradation");
      e.step(seconds(30));
      e.scenario("telemetry_replay");
      e.step(seconds(12));
    });
    expect(afterOthers).toEqual(direct);
  });

  it("injects in place on a twin that is already at its healthy baseline, keeping the history on screen", () => {
    const e = fresh();
    e.step(seconds(12));
    e.scenario("combustion_loss");
    expect(e.snapshot().t).toBeCloseTo(12, 6);
    expect(e.snapshot().faults.map((f) => f.id)).toEqual(["combustion_loss"]);
  });

  it("leaves a stopped engine stopped: the fault is swapped without restarting the run", () => {
    const e = fresh();
    e.inject("pump_degradation");
    e.shutdown();
    e.step(seconds(6));
    expect(e.snapshot().mode).toBe("ready");
    const t = e.snapshot().t;
    e.scenario("valve_restriction");
    expect(e.snapshot().mode).toBe("ready");
    expect(e.snapshot().t).toBe(t);
    expect(e.snapshot().faults.map((f) => f.id)).toEqual(["valve_restriction"]);
  });

  it("marks how a fault arrived, and treats a fault with no ramp as abrupt", () => {
    const e = fresh();
    e.inject("pump_degradation", 0.8, "abrupt");
    e.inject("cooling_restriction", 0.8);
    e.inject("packet_delay", 0.8);
    expect(e.snapshot().faults.map((f) => [f.id, f.onset, f.severity])).toEqual([["pump_degradation", "abrupt", 0.8], ["cooling_restriction", "gradual", 0], ["packet_delay", "abrupt", 0.8]]);
  });
});

// ── Fault coverage ──────────────────────────────────────────────────────────

interface Row {
  fault: string;
  kind: "physical" | "data" | "unmodelled";
  onset: FaultOnset;
  severity: number;
  detected: boolean;
  detectionSeconds: number | null;
  firstDetector: string | null;
  /** Seconds from injection to each detector's first alarm; null if it never fired in the run. */
  detectorSeconds: Record<string, number | null>;
  isolatedAs: string | null;
  isolationSeconds: number | null;
  /** Stages of the chain from physical effect to recommended investigation that were reached by the end of the run. */
  chainReached: string[];
  recommendation: string;
  wronglyIsolatedAs: string[];
  finalLeading: string;
  finalProbability: number;
  finalConfidence: string;
  recognition: string;
  fittedSeverity: number | null;
}

const RUN_SECONDS = 60;

function observe(e: Rig, fault: string, kind: Row["kind"], onset: FaultOnset, severity: number, duration = RUN_SECONDS): Row {
  const start = e.snapshot().t;
  let detectionSeconds: number | null = null;
  let firstDetector: string | null = null;
  for (let k = 0; k < seconds(duration); k++) {
    e.step(1);
    if (detectionSeconds !== null || k % 2) continue;
    const s = e.snapshot();
    if (s.anomaly) {
      detectionSeconds = s.t - start;
      firstDetector = s.detectors.filter((d) => d.active && d.id !== "hybrid").map((d) => d.id).join("+") || "data-quality";
    }
  }
  const s = e.snapshot();
  const declared = s.events.filter((ev) => ev.kind === "isolated");
  const named = declared.filter((ev) => ev.id);
  const right = named.find((ev) => ev.id === fault);
  return {
    fault,
    kind,
    onset,
    severity,
    detected: detectionSeconds !== null,
    detectionSeconds: detectionSeconds === null ? null : Number(detectionSeconds.toFixed(2)),
    firstDetector,
    detectorSeconds: Object.fromEntries(s.detectors.map((d) => [d.id, d.latency === null ? null : Number(d.latency.toFixed(2))])),
    // The standing conclusion: the last thing declared. A declaration with no cause is "not recognised".
    isolatedAs: declared.at(-1)?.id ?? null,
    isolationSeconds: right ? Number((right.t - start).toFixed(2)) : null,
    chainReached: s.chain.filter((stage) => stage.reached).map((stage) => stage.id),
    recommendation: s.prognosis.recommendation,
    wronglyIsolatedAs: [...new Set(named.filter((ev) => ev.id !== fault).map((ev) => ev.id!))],
    finalLeading: s.ranking[0].id,
    finalProbability: Number(s.ranking[0].p.toFixed(3)),
    finalConfidence: s.confidence,
    recognition: s.recognition.status,
    fittedSeverity: s.recognition.fault ? Number(s.recognition.severity.toFixed(2)) : null,
  };
}

/** Faults the twin has no pattern, no class and no signature for. Each grows over 20 s. */
const UNMODELLED: { name: string; change: (p: PlantParams, s: number) => PlantParams }[] = [
  { name: "fuel pump head −15 %", change: (p, s) => ({ ...p, headFu: p.headFu * (1 - 0.15 * s) }) },
  { name: "fuel pump head −30 %", change: (p, s) => ({ ...p, headFu: p.headFu * (1 - 0.3 * s) }) },
  { name: "oxidiser main valve restriction ×1.6", change: (p, s) => ({ ...p, kValveOx: p.kValveOx * (1 + 0.6 * s) }) },
  { name: "fuel injector restriction ×2", change: (p, s) => ({ ...p, kInjFu: p.kInjFu * (1 + s) }) },
  { name: "fuel tank pressure −2", change: (p, s) => ({ ...p, pTankFu: p.pTankFu - 2 * s }) },
  { name: "fuel line restriction ×3", change: (p, s) => ({ ...p, kLineFu: p.kLineFu * (1 + 2 * s) }) },
  { name: "oxidiser feed line restriction ×4", change: (p, s) => ({ ...p, kFeedOx: p.kFeedOx * (1 + 3 * s) }) },
];
const DOUBLE: [FaultId, FaultId][] = [["pump_degradation", "cooling_restriction"], ["valve_restriction", "combustion_loss"]];

describe("fault coverage: the envelope the twin was tested over", () => {
  const rows: Row[] = [];

  beforeAll(() => {
    for (const fault of PHYSICAL_FAULTS) {
      for (const onset of ["gradual", "abrupt"] as const) {
        for (const severity of [0.3, 0.6, 1]) {
          const e = fresh();
          e.step(seconds(5));
          e.inject(fault, severity, onset);
          rows.push(observe(e, fault, "physical", onset, severity));
        }
      }
    }
    for (const fault of DATA_FAULTS) {
      for (const severity of [0.3, 0.6, 1]) {
        const e = fresh();
        e.step(seconds(5));
        e.inject(fault, severity);
        // The lab does the same: a delay or a skew only shows while the engine is changing state.
        if (FAULT_DEFS[fault].needsTransient) e.setExercise(true);
        rows.push(observe(e, fault, "data", "abrupt", severity));
      }
    }
    for (const { name, change } of UNMODELLED) {
      const e = fresh();
      e.step(seconds(5));
      const from = e.snapshot().t;
      e.unmodelled = (p, t) => change(p, Math.min(1, (t - from) / 20));
      rows.push(observe(e, name, "unmodelled", "gradual", 1));
    }
    for (const [a, b] of DOUBLE) {
      const e = fresh();
      e.step(seconds(5));
      e.inject(a, 0.8);
      e.inject(b, 0.8);
      rows.push(observe(e, `${a} + ${b}`, "unmodelled", "gradual", 0.8));
    }
  }, 120_000);

  afterAll(() => {
    const out = process.env.ADV_TWIN_MATRIX_OUT;
    if (!out) return;
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify({ note: "SIMULATED. One seeded run per row, 60 s after injection at 100 % throttle. Not failure data from any engine.", runSeconds: RUN_SECONDS, rows, startHold: { note: "A fault at 80 % severity present before a restart. Health checks are held for five model shaft time constants after mainstage is reached; these are the seconds from the end of that hold.", rows: afterHold } }, null, 2)}\n`);
  });

  const select = (kind: Row["kind"], minSeverity = 0) => rows.filter((r) => r.kind === kind && r.severity >= minSeverity);

  it("covers every injectable fault", () => {
    expect(new Set(rows.filter((r) => r.kind !== "unmodelled").map((r) => r.fault))).toEqual(new Set(FAULT_IDS));
  });

  it("detects and correctly isolates every modelled physical fault from 60 % severity up, gradual or abrupt", () => {
    for (const r of select("physical", 0.6)) {
      const label = `${r.fault} ${r.onset} @${r.severity}`;
      expect(r.detected, label).toBe(true);
      expect(r.isolatedAs, label).toBe(r.fault);
      expect(r.finalLeading, label).toBe(r.fault);
      expect(r.recognition, label).toBe("explained");
      expect(Math.abs(r.fittedSeverity! - r.severity), `${label}: fitted severity`).toBeLessThan(0.12);
    }
  });

  it("never names the wrong fault for a modelled one, at any tested severity and either onset", () => {
    // Before the noise estimate was made robust to a single step, an abrupt pump or feed-pressure fault was first reported as a noisy sensor.
    for (const r of select("physical")) expect(r.wronglyIsolatedAs, `${r.fault} ${r.onset} @${r.severity}`).toEqual([]);
  });

  it("rate of change never fires on a fault that grows gradually, anywhere in the envelope, and fires on abrupt ones that move chamber pressure enough", () => {
    for (const r of rows.filter((x) => x.kind !== "data" && x.onset === "gradual")) expect(r.detectorSeconds.rate, `${r.fault} @${r.severity}`).toBeNull();
    const abrupt = select("physical").filter((r) => r.onset === "abrupt" && r.detectorSeconds.rate !== null);
    // It watches the chamber pressure residual. Faults that step it by more than its alarm rate trip it; a sensor drift on one of two voted sensors does not.
    expect(abrupt.map((r) => r.fault)).toEqual(expect.arrayContaining(["pump_degradation", "feed_pressure_reduction", "injector_restriction", "combustion_loss"]));
    for (const r of abrupt) expect(r.detectorSeconds.rate!, `${r.fault} @${r.severity}`).toBeLessThanOrEqual(0.5);
    // Where it fires it is ahead of the cumulative detector, which has to accumulate. It is not ahead of the model residual,
    // which watches every channel at its source and sees a step a sample or two before chamber pressure has moved.
    for (const r of abrupt) expect(r.detectorSeconds.cusum ?? Infinity, `${r.fault} @${r.severity}: cusum`).toBeGreaterThanOrEqual(r.detectorSeconds.rate!);
    // Too small a step, or one that barely moves chamber pressure, is left to the other detectors: that is its stated blind spot.
    for (const r of select("physical").filter((x) => x.onset === "abrupt" && (x.severity === 0.3 || x.fault === "valve_restriction"))) expect(r.detectorSeconds.rate, `${r.fault} @${r.severity}`).toBeNull();
  });

  it("carries every modelled fault the whole way: effect, sensor response, residual, detection, isolation, confidence, recommended investigation", () => {
    for (const r of select("physical")) {
      const label = `${r.fault} ${r.onset} @${r.severity}`;
      expect(r.chainReached, label).toEqual(expect.arrayContaining(["effect", "sensor", "residual", "detection", "isolation", "confidence", "investigation"]));
      // The recommendation is the investigation written for that fault, not a generic one.
      expect(r.recommendation.startsWith(DIAGNOSIS_BY_ID[r.fault as FaultId].investigation), label).toBe(true);
    }
    // An unrecognised pattern stops before isolation, and is told not to act on the ranking.
    for (const r of select("unmodelled")) {
      // (The first two stages describe an injected fault by name; these conditions are applied behind the twin's back, so it has none to describe.)
      expect(r.chainReached, r.fault).toEqual(expect.arrayContaining(["residual", "detection"]));
      expect(r.chainReached, r.fault).not.toContain("isolation");
      expect(r.recommendation, r.fault).toMatch(/^No modelled fault explains this pattern/);
    }
  });

  it("at 30 % severity, leads with the right fault even where it is too small to raise an alarm", () => {
    for (const r of select("physical").filter((x) => x.severity === 0.3)) expect(r.finalLeading, `${r.fault} ${r.onset}`).toBe(r.fault);
  });

  it("attributes every data-path fault to the data path at 60 % severity and above, and never to the engine", () => {
    for (const r of select("data")) expect(r.wronglyIsolatedAs.filter((id) => (PHYSICAL_DIAGNOSES as readonly string[]).includes(id)), `${r.fault} @${r.severity}`).toEqual([]);
    for (const r of select("data", 0.6)) {
      expect(r.isolatedAs, `${r.fault} @${r.severity}`).toBe(r.fault);
      expect(r.finalLeading, `${r.fault} @${r.severity}`).toBe(r.fault);
    }
  });

  it("detects a fault it has no model of, and says it does not recognise it instead of naming a look-alike", () => {
    for (const r of select("unmodelled")) {
      expect(r.detected, r.fault).toBe(true);
      expect(r.recognition, r.fault).toBe("unrecognised");
      expect(r.finalConfidence, r.fault).toBe("LOW");
      expect(r.isolatedAs, `${r.fault}: standing isolation`).toBeNull();
    }
    expect(UNRECOGNISED_AFTER).toBeGreaterThanOrEqual(5);
  });

  it("stays idle on a healthy engine: nothing to recognise, nothing unexplained", () => {
    const e = fresh();
    for (let k = 0; k < seconds(90); k++) {
      e.step(1);
      if (k % 10 === 0) expect(e.snapshot().recognition.status).toBe("idle");
    }
  });

  it("shows why the check is needed: on a fault outside its classes the classifier still answers, and with confidence", () => {
    const e = fresh();
    e.step(seconds(5));
    e.unmodelled = (p, t) => ({ ...p, kValveOx: p.kValveOx * (1 + 0.6 * Math.min(1, (t - 5) / 20)) });
    e.step(seconds(50));
    const s = e.snapshot();
    const learned = s.ranking.filter((r) => r.ml !== null).sort((a, b) => b.ml! - a.ml!)[0];
    expect(learned.id).not.toBe("nominal");
    expect(learned.ml!).toBeGreaterThan(0.6);
    expect(s.recognition.status).toBe("unrecognised");
    expect(s.chain.find((c) => c.id === "isolation")!.reached).toBe(false);
    expect(s.prognosis.recommendation).toMatch(/No modelled fault explains this pattern/);
  });
});

describe("classifier: what its percentages are worth", () => {
  it("reports calibration on the simulated validation set, alongside accuracy", () => {
    const { classifier } = twin.evidence;
    const { calibration } = classifier;
    expect(calibration.bins.reduce((sum, b) => sum + b.count, 0)).toBe(classifier.validationSamples);
    expect(calibration.ece).toBeGreaterThanOrEqual(0);
    expect(calibration.ece).toBeLessThan(0.1);
    expect(calibration.brier).toBeLessThan(0.3);
    for (const b of calibration.bins) {
      if (!b.count) continue;
      expect(b.confidence).toBeGreaterThan(b.from - 1e-9);
      expect(b.confidence).toBeLessThanOrEqual(b.to + 1e-9);
    }
  });
});

describe("estimators: equal results must be equal for a reason", () => {
  it("runs the EKF and the UKF as different computations that agree because this model is nearly linear over the estimate's uncertainty", () => {
    const options = { noise: 1.2, spikes: false, mismatch: false } as const;
    const ekf = runEstimatorDemo({ ...options, estimator: "ekf" });
    const ukf = runEstimatorDemo({ ...options, estimator: "ukf" });
    const gap = Math.max(...ekf.estimate.map((value, i) => Math.abs(value - ukf.estimate[i])));
    expect(gap).toBeGreaterThan(0);
    expect(gap).toBeLessThan(0.01);
    expect(runEstimatorDemo({ ...options, estimator: "kalman" }).rmse.estimate).not.toBeCloseTo(ekf.rmse.estimate, 3);
  });
});
