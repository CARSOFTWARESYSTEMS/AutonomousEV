import { beforeAll, describe, expect, it } from "vitest";
import { CH, CHANNELS, CHANNEL_IDS, createRng, normalCdf } from "./channels";
import { AS_BUILT, identificationData, identify, modelError } from "./calibration";
import { runEstimatorDemo } from "./estimators";
import { FAULT_DEFS, applyPhysicalFaults } from "./faults";
import { DIAGNOSES, FAULT_IDS, type FaultId, PATTERNS, PHYSICAL_DIAGNOSES, SYMPTOM_IDS, type Symptoms, explain, fuseEvidence, grade, physicsProbabilities, zeroSymptoms } from "./isolation";
import { accuracy, confusionMatrix, predictProbabilities, reconstructionError, symmetricEigen, trainPca, trainSoftmax } from "./ml";
import { DESIGN, THROAT_PRESSURE_RATIO, scheduleSpeed, steadyState } from "./plant";
import { fitTrend, thresholdOutlook } from "./prognostics";
import { TwinEngine } from "./twinEngine";

const at = (values: readonly number[], id: (typeof CHANNEL_IDS)[number]) => values[CH[id]];

describe("physics model: the reference pressure network", () => {
  const ref = steadyState(DESIGN, scheduleSpeed(1));

  it("settles at the reference point: 100 % chamber pressure at unit speed and unit flows", () => {
    expect(ref.state.pc).toBeCloseTo(100, 3);
    expect(ref.flows.mFu).toBeCloseTo(1, 4);
    expect(ref.flows.mOx).toBeCloseTo(1, 4);
    expect(scheduleSpeed(1)).toBeCloseTo(1, 3);
  });

  it("orders pressure along each path the way the hardware does", () => {
    const v = ref.values;
    // Tank → pump inlet (a small loss) → pump discharge (the large rise) → valve → cooling → injector → chamber.
    for (const path of [["pTankFu", "pInFu"], ["pOutFu", "pCoolIn", "pCoolOut", "pInjFu", "pcA"], ["pTankOx", "pInOx"], ["pOutOx", "pInjOx", "pcA"], ["pPb", "pTi", "pTo", "pcA"]] as const) {
      for (let i = 1; i < path.length; i++) expect(at(v, path[i - 1]), `${path[i - 1]} > ${path[i]}`).toBeGreaterThan(at(v, path[i]));
    }
    expect(at(v, "pOutFu")).toBeGreaterThan(at(v, "pInFu") * 20);
    // Both propellants reach the preburner, so both pumps discharge above it.
    expect(Math.min(at(v, "pOutFu"), at(v, "pOutOx"))).toBeGreaterThan(at(v, "pPb"));
    expect(THROAT_PRESSURE_RATIO).toBeGreaterThan(0.5);
  });

  it("conserves pressure around each branch: tank + pump rise − losses = chamber pressure", () => {
    for (const throttle of [0.6, 0.8, 1]) {
      const p = steadyState(AS_BUILT, scheduleSpeed(throttle));
      const fu2 = p.flows.mFu ** 2;
      expect(at(p.values, "pInjFu") - AS_BUILT.kInjFu * fu2).toBeCloseTo(p.state.pc, 4);
      expect(at(p.values, "pInjOx") - AS_BUILT.kInjOx * p.flows.mOx ** 2).toBeCloseTo(p.state.pc, 4);
    }
  });

  it("throttles: the controller's schedule gives the commanded chamber pressure on the design model", () => {
    for (const throttle of [0.6, 0.7, 0.85]) expect(steadyState(DESIGN, scheduleSpeed(throttle)).state.pc).toBeCloseTo(100 * throttle, 1);
    expect(scheduleSpeed(0.6)).toBeLessThan(scheduleSpeed(0.8));
  });

  it("lowers chamber pressure for every physical fault, and heats the coolant when fuel flow is restricted", () => {
    const healthy = steadyState(AS_BUILT, scheduleSpeed(1));
    for (const fault of ["pump_degradation", "valve_restriction", "cooling_restriction", "feed_pressure_reduction", "injector_restriction", "combustion_loss"] as const) {
      const faulty = steadyState(applyPhysicalFaults(AS_BUILT, { [fault]: 1 }), scheduleSpeed(1));
      expect(faulty.state.pc, fault).toBeLessThan(healthy.state.pc - 1);
    }
    for (const fault of ["valve_restriction", "cooling_restriction"] as const) {
      const faulty = steadyState(applyPhysicalFaults(AS_BUILT, { [fault]: 1 }), scheduleSpeed(1));
      expect(faulty.state.tCool, fault).toBeGreaterThan(healthy.state.tCool + 5);
      expect(faulty.flows.mFu).toBeLessThan(healthy.flows.mFu);
    }
  });

  it("cavitates only once the suction margin is used up", () => {
    const some = steadyState(applyPhysicalFaults(AS_BUILT, { feed_pressure_reduction: 0.3 }), scheduleSpeed(1));
    const more = steadyState(applyPhysicalFaults(AS_BUILT, { feed_pressure_reduction: 0.8 }), scheduleSpeed(1));
    expect(some.flows.cavOx).toBe(0);
    expect(more.flows.cavOx).toBeGreaterThan(0.3);
    expect(at(more.values, "vib")).toBeGreaterThan(at(some.values, "vib") * 1.3);
  });
});

describe("parameter identification", () => {
  it("fits the model to the as-built system better than the design values do", () => {
    const tests = identificationData(AS_BUILT, createRng(11));
    const model = identify(tests);
    const mean = (e: number[]) => e.reduce((a, b) => a + b, 0) / e.length;
    expect(mean(modelError(model, tests))).toBeLessThan(mean(modelError(DESIGN, tests)));
    for (const key of ["kCool", "kInjOx", "kValveFu", "etaC"] as const) expect(Math.abs(model[key] / AS_BUILT[key] - 1), key).toBeLessThan(0.01);
    // The pump curve keeps its shape; only its scale is identified.
    expect(model.aOx / model.bOx).toBeCloseTo(DESIGN.aOx / DESIGN.bOx, 6);
    expect(model.aOx / DESIGN.aOx).toBeCloseTo(AS_BUILT.headOx, 2);
  });
});

describe("learned models", () => {
  it("decomposes a symmetric matrix", () => {
    const { values, vectors } = symmetricEigen([[4, 1, 0], [1, 3, 1], [0, 1, 2]]);
    expect(values[0]).toBeGreaterThan(values[1]);
    for (let k = 0; k < 3; k++) {
      const av = [4 * vectors[k][0] + vectors[k][1], vectors[k][0] + 3 * vectors[k][1] + vectors[k][2], vectors[k][1] + 2 * vectors[k][2]];
      av.forEach((value, i) => expect(value).toBeCloseTo(values[k] * vectors[k][i], 6));
    }
  });

  it("PCA rebuilds data on its learned direction and rejects data off it", () => {
    const rng = createRng(3);
    const data = Array.from({ length: 200 }, () => {
      const t = rng.gauss();
      return [t + 0.02 * rng.gauss(), 2 * t + 0.02 * rng.gauss(), -t + 0.02 * rng.gauss()];
    });
    const model = trainPca(data, 1);
    expect(model.explained[0]).toBeGreaterThan(0.99);
    expect(reconstructionError(model, [1, 2, -1])).toBeLessThan(model.threshold * 2);
    expect(reconstructionError(model, [1, -2, 1])).toBeGreaterThan(model.threshold * 50);
  });

  it("logistic regression separates three clusters and is repeatable", () => {
    const make = (seed: number) => {
      const rng = createRng(seed);
      const x: number[][] = [];
      const y: number[] = [];
      [[0, 0], [1, 0], [0, 1]].forEach(([cx, cy], label) => {
        for (let i = 0; i < 60; i++) {
          x.push([cx + 0.12 * rng.gauss(), cy + 0.12 * rng.gauss()]);
          y.push(label);
        }
      });
      return { x, y };
    };
    const train = make(1);
    const held = make(2);
    const model = trainSoftmax(train.x, train.y, 3, createRng(5), { epochs: 80 });
    expect(accuracy(confusionMatrix(model, held.x, held.y, 3))).toBeGreaterThan(0.97);
    const p = predictProbabilities(model, [1, 0]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    expect(trainSoftmax(train.x, train.y, 3, createRng(5), { epochs: 80 }).weights).toEqual(model.weights);
  });
});

describe("fault isolation by evidence", () => {
  const withSymptoms = (changes: Partial<Symptoms>): Symptoms => ({ ...zeroSymptoms(), ...changes });

  it("treats small deviations as noise", () => {
    expect(grade(2.9)).toBe(0);
    expect(grade(-8)).toBeLessThan(-0.7);
    expect(grade(40)).toBeCloseTo(1, 3);
  });

  it("calls a clean set of symptoms nominal", () => {
    const p = physicsProbabilities(zeroSymptoms());
    expect(p.nominal).toBeGreaterThan(0.9);
  });

  it("gives every fault a pattern over known symptoms, with at least one symptom that must be present", () => {
    for (const [fault, pattern] of Object.entries(PATTERNS)) {
      for (const id of Object.keys(pattern)) expect(SYMPTOM_IDS, `${fault}.${id}`).toContain(id);
      expect(Object.values(pattern).some(([expect_]) => expect_ !== 0), fault).toBe(true);
    }
    expect(DIAGNOSES.map((d) => d.id).sort()).toEqual([...PHYSICAL_DIAGNOSES, "sensor_noise", "packet_delay", "timestamp_error", "telemetry_replay"].sort());
  });

  it("changes the diagnosis when supporting measurements change: low chamber pressure alone does not identify the fault", () => {
    const alone = physicsProbabilities(withSymptoms({ pc: -0.8, thrust: -0.8 }));
    expect(Math.max(...Object.values(alone))).toBeLessThan(0.9);
    const valve = physicsProbabilities(withSymptoms({ pc: -0.5, thrust: -0.5, valve_pos: -0.9, k_valve: 0.9, m_fu: -0.8 }));
    expect(valve.valve_restriction).toBeGreaterThan(0.9);
    const pump = physicsProbabilities(withSymptoms({ pc: -0.8, thrust: -0.8, head_ox: -0.9, p_out_ox: -0.9, m_ox: -0.8 }));
    expect(pump.pump_degradation).toBeGreaterThan(0.9);
    const sensor = physicsProbabilities(withSymptoms({ pc_ab: -0.9 }));
    expect(sensor.pc_sensor_drift).toBeGreaterThan(0.9);
  });

  it("explains a diagnosis with the evidence for it first, and lists what it cannot explain", () => {
    const lines = explain("pump_degradation", withSymptoms({ pc: -0.8, head_ox: -0.9, p_out_ox: -0.9, m_ox: -0.8, vib: 0.7 }));
    expect(lines[0].effect).toBe("supports");
    expect(lines.find((l) => l.symptom === "head_ox")?.text).toMatch(/less pressure rise/);
    expect(lines.find((l) => l.symptom === "speed")).toMatchObject({ effect: "supports", text: "Shaft speed unchanged" });
    expect(lines.find((l) => l.symptom === "vib")?.effect).toBe("unexplained");
  });

  it("lets a direct data check take precedence over physical candidates", () => {
    const physics = physicsProbabilities(withSymptoms({ pc: -0.8, head_ox: -0.9, p_out_ox: -0.9 }));
    const ranked = fuseEvidence(physics, null, { telemetry_replay: 0.97 });
    expect(ranked[0].id).toBe("telemetry_replay");
    expect(ranked.reduce((sum, r) => sum + r.p, 0)).toBeCloseTo(1, 6);
  });
});

describe("prognostics", () => {
  it("fits a trend with its uncertainty", () => {
    const t = Array.from({ length: 20 }, (_, i) => i * 0.5);
    const trend = fitTrend(t, t.map((x) => 1 - 0.01 * x));
    expect(trend.slope).toBeCloseTo(-0.01, 8);
    expect(trend.level).toBeCloseTo(1 - 0.01 * 9.5, 8);
    expect(trend.slopeError).toBeLessThan(1e-9);
  });

  it("turns a projection into a probability and a time to the limit, earlier on the pessimistic edge", () => {
    const points = [0, 10, 20, 30].map((h) => ({ horizon: h, mean: 100 - 0.3 * h, sigma: 0.5 + 0.05 * h }));
    const outlook = thresholdOutlook(points, 94);
    expect(outlook.timeToLimit).toBeCloseTo(20, 6);
    expect(outlook.earliest!).toBeLessThan(outlook.timeToLimit!);
    expect(outlook.latest!).toBeGreaterThan(outlook.timeToLimit!);
    expect(outlook.probability).toBeGreaterThan(0.9);
    expect(thresholdOutlook(points, 80).timeToLimit).toBeNull();
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
  });
});

describe("state estimation, worked on chamber pressure", () => {
  it.each(["kalman", "ekf", "ukf", "particle"] as const)("%s beats the raw sensor, and is repeatable", (estimator) => {
    const options = { estimator, noise: 1.5, spikes: false, mismatch: false };
    const run = runEstimatorDemo(options);
    expect(run.t).toHaveLength(400);
    expect(run.rmse.estimate).toBeLessThan(run.rmse.raw * 0.6);
    expect(runEstimatorDemo(options).estimate).toEqual(run.estimate);
  });

  it("shows why a moving average is not enough: it lags the throttle step", () => {
    const run = runEstimatorDemo({ estimator: "ekf", noise: 1.5, spikes: false, mismatch: false });
    const step = run.t.findIndex((t) => t >= 5.6);
    expect(Math.abs(run.filtered[step] - run.truth[step])).toBeGreaterThan(Math.abs(run.estimate[step] - run.truth[step]) * 2);
  });

  it("lets a model that is off be corrected by the sensor, where the open-loop model cannot correct itself", () => {
    const run = runEstimatorDemo({ estimator: "ekf", noise: 1.5, spikes: false, mismatch: true });
    expect(run.rmse.physics).toBeGreaterThan(2);
    expect(run.rmse.estimate).toBeLessThan(run.rmse.physics * 0.5);
  });

  it("copes with noise that is not Gaussian better with a particle filter than with a Kalman filter", () => {
    const spikes = { noise: 1.5, spikes: true, mismatch: false };
    expect(runEstimatorDemo({ ...spikes, estimator: "particle" }).rmse.estimate).toBeLessThan(runEstimatorDemo({ ...spikes, estimator: "kalman" }).rmse.estimate);
  });
});

describe("the Digital Twin loop", () => {
  let engine: TwinEngine;
  beforeAll(() => {
    engine = new TwinEngine();
  });

  const run = (seconds: number) => engine.step(Math.round(seconds / 0.05));
  const scenario = (fault: FaultId, seconds: number, severity = 0.8) => {
    engine.reset();
    run(4);
    engine.inject(fault, severity);
    if (FAULT_DEFS[fault].needsTransient) engine.setExercise(true);
    run(seconds);
    return engine.snapshot();
  };

  it("is built from simulated evidence it can show: identification, and a classifier scored on data it never saw", () => {
    const { evidence } = engine;
    expect(evidence.errorAfter).toBeLessThan(evidence.errorBefore);
    expect(evidence.classifier.validationSamples).toBeGreaterThan(200);
    expect(evidence.classifier.validationAccuracy).toBeGreaterThan(0.95);
    expect(evidence.classifier.confusion).toHaveLength(PHYSICAL_DIAGNOSES.length);
    expect(evidence.anomaly.explained).toBeGreaterThan(0.9);
  });

  it("never copies the physical system's parameters into its model", () => {
    expect(engine.model.kCool).not.toBe(AS_BUILT.kCool);
    expect(engine.model.headOx).toBe(1);
  });

  it("stays quiet on a healthy engine: no anomaly, nominal diagnosis, small residuals, good data", () => {
    engine.reset();
    let anomalies = 0;
    let wrong = 0;
    for (let i = 0; i < 1200; i++) {
      engine.step();
      const s = engine.snapshot();
      if (s.anomaly) anomalies++;
      if (s.ranking[0].id !== "nominal") wrong++;
    }
    const s = engine.snapshot();
    expect(anomalies).toBe(0);
    expect(wrong).toBe(0);
    expect(s.status).toMatchObject({ engine: "MAINSTAGE", twin: "SYNCHRONISED", dataQuality: "GOOD", modelConfidence: "HIGH", health: "NOMINAL", anomalies: 0 });
    expect(s.ranking[0].p).toBeGreaterThan(0.8);
    for (const id of CHANNEL_IDS) expect(Math.abs(s.channels[id].z), id).toBeLessThan(4);
    expect(s.prognosis.healthIndex).toBeGreaterThan(95);
    expect(s.chain[0].reached).toBe(false);
  });

  it("smooths the sensor: the estimate scatters less about the expectation than the observation does", () => {
    engine.reset();
    run(10);
    const observed = engine.series("observed", "pOutOx");
    const estimated = engine.series("estimated", "pOutOx");
    const spread = (v: number[]) => Math.sqrt(v.reduce((sum, x) => sum + (x - v.reduce((a, b) => a + b, 0) / v.length) ** 2, 0) / v.length);
    expect(spread(estimated)).toBeLessThan(spread(observed) * 0.7);
    expect(observed).toHaveLength(engine.historyLength);
  });

  it("follows a throttle step without raising an alarm, widening its uncertainty while it does", () => {
    engine.reset();
    engine.setThrottle(0.8);
    let widened = 1;
    let anomalies = 0;
    for (let i = 0; i < 200; i++) {
      engine.step();
      const s = engine.snapshot();
      widened = Math.max(widened, s.transientFactor);
      if (s.anomaly) anomalies++;
    }
    const s = engine.snapshot();
    expect(widened).toBeGreaterThan(3);
    expect(anomalies).toBe(0);
    expect(s.chamber.estimated).toBeGreaterThan(77);
    expect(s.chamber.estimated).toBeLessThan(83);
    expect(s.transientFactor).toBeLessThan(1.2);
  });

  it.each(["pump_degradation", "valve_restriction", "cooling_restriction", "feed_pressure_reduction", "injector_restriction", "combustion_loss"] as const)("detects and isolates a physical fault: %s", (fault) => {
    const s = scenario(fault, 34);
    expect(s.anomaly).toBe(true);
    expect(s.ranking[0].id).toBe(fault);
    expect(s.ranking[0].p).toBeGreaterThan(0.8);
    expect(s.confidence).toBe("HIGH");
    // Physics-based and learned reasoning reach the same answer on their own.
    expect(s.ranking[0].physics!).toBeGreaterThan(0.7);
    expect(s.ranking[0].ml!).toBeGreaterThan(0.7);
    expect(s.explained).toBe(fault);
    expect(s.evidence.filter((e) => e.effect === "supports").length).toBeGreaterThanOrEqual(3);
    expect(s.chamber.estimated).toBeLessThan(s.chamber.expected - 0.5);
    expect(["DEGRADED", "ACTION"]).toContain(s.status.health);
    expect(s.prognosis.driver).not.toBeNull();
    expect(s.chain.filter((stage) => stage.reached).map((stage) => stage.id)).toEqual(["effect", "sensor", "residual", "detection", "isolation", "confidence", "prediction", "investigation"]);
    expect(s.events.map((e) => e.kind)).toEqual(expect.arrayContaining(["injected", "detected", "isolated"]));
    expect(s.detectors.find((d) => d.id === "hybrid")!.latency!).toBeLessThan(12);
  });

  it("tells a drifting sensor from a failing engine: the sensor is voted out and the engine stays healthy", () => {
    const s = scenario("pc_sensor_drift", 30);
    expect(s.ranking[0].id).toBe("pc_sensor_drift");
    expect(s.ranking[0].p).toBeGreaterThan(0.8);
    expect(s.chamber.sensorA).toBe("voted out");
    expect(s.chamber.sensorB).toBe("in use");
    // The reading has fallen by several percent, the estimated chamber pressure has not.
    expect(s.channels.pcA.observed).toBeLessThan(s.chamber.expected - 5);
    expect(Math.abs(s.chamber.estimated - s.chamber.expected)).toBeLessThan(1);
    expect(Math.abs(s.channels.thrust.z)).toBeLessThan(4);
    expect(s.prognosis.healthIndex).toBeGreaterThan(90);
    expect(s.status.health).not.toBe("ACTION");
    expect(s.events.some((e) => e.kind === "sensor")).toBe(true);
  });

  it("separates the same symptom by cause: pump degradation and loss of feed pressure both lower pump head", () => {
    const pump = scenario("pump_degradation", 34);
    const feed = scenario("feed_pressure_reduction", 34);
    expect(pump.symptoms.head_ox).toBeLessThan(-0.5);
    expect(feed.symptoms.head_ox).toBeLessThan(-0.5);
    expect(pump.symptoms.p_tank_ox).toBe(0);
    expect(pump.symptoms.vib).toBe(0);
    expect(feed.symptoms.p_tank_ox).toBeLessThan(-0.5);
    expect(feed.symptoms.vib).toBeGreaterThan(0.5);
  });

  it("predicts while a fault is still growing: a limit ahead, with a band that widens", () => {
    const s = scenario("pump_degradation", 12, 1);
    const { prognosis } = s;
    expect(prognosis.driver).toBe("head_ox");
    expect(prognosis.quantity).toBe("Chamber pressure");
    expect(prognosis.rate).toBeLessThan(0);
    expect(prognosis.points.at(-1)!.sigma).toBeGreaterThan(prognosis.points[0].sigma * 1.5);
    expect(prognosis.points.at(-1)!.mean).toBeLessThan(prognosis.points[0].mean);
    expect(prognosis.outlook.probability).toBeGreaterThan(0.5);
    expect(prognosis.outlook.timeToLimit).not.toBeNull();
    expect(s.chamber.estimated).toBeGreaterThan(prognosis.limit);
    expect(prognosis.margin).toBeGreaterThan(0);
    expect(prognosis.margin).toBeLessThan(100);
  });

  it("warns of cavitation before it happens: the suction margin is the quantity that is projected", () => {
    const s = scenario("feed_pressure_reduction", 6, 1);
    expect(s.prognosis.driver).toBe("npsh_ox");
    expect(s.prognosis.quantity).toBe("Oxidiser pump suction margin");
    expect(s.prognosis.now).toBeGreaterThan(1);
    expect(s.prognosis.outlook.timeToLimit).not.toBeNull();
    expect(s.symptoms.vib).toBe(0);
  });

  it("finds a noisy sensor by its noise, without calling it an engine fault", () => {
    const s = scenario("sensor_noise", 12);
    expect(s.ranking[0].id).toBe("sensor_noise");
    expect(s.quality.status).toBe("DEGRADED");
    expect(s.quality.noisy).toContain("pOutOx");
    expect(s.status.health).toBe("NOMINAL");
    expect(s.chain.find((stage) => stage.id === "detection")).toMatchObject({ reached: true });
  });

  it.each([["packet_delay", "DEGRADED"], ["timestamp_error", "DEGRADED"], ["telemetry_replay", "BAD"]] as const)("attributes a data-path fault to the data path: %s", (fault, quality) => {
    const s = scenario(fault, 20);
    expect(s.ranking[0].id).toBe(fault);
    expect(s.quality.status).toBe(quality);
    expect(s.quality.notes.length).toBeGreaterThan(0);
    expect(s.status.twin).toBe("DATA SUSPECT");
    expect(s.status.modelConfidence).not.toBe("HIGH");
    // No physical candidate is promoted on the strength of data that cannot be trusted.
    expect(s.ranking.find((r) => r.physics !== null && r.id !== "nominal")!.p).toBeLessThan(0.2);
  });

  it("shows a delay only when the engine is changing: steady running hides it from the residuals", () => {
    engine.reset();
    run(4);
    engine.inject("packet_delay", 1);
    run(10);
    const steady = engine.snapshot();
    expect(Math.max(...CHANNEL_IDS.map((id) => Math.abs(steady.channels[id].z)))).toBeLessThan(4);
    expect(steady.quality.nodes[0].latencyMs).toBeGreaterThan(500);
    engine.setThrottle(0.8);
    let worst = 0;
    for (let i = 0; i < 30; i++) {
      engine.step();
      worst = Math.max(worst, Math.abs(engine.snapshot().channels.pcA.residual));
    }
    expect(worst).toBeGreaterThan(3);
  });

  it("holds its health checks through shutdown and start, and resumes in mainstage", () => {
    engine.reset();
    engine.shutdown();
    run(4);
    let s = engine.snapshot();
    expect(s.mode).toBe("ready");
    expect(s.monitoring).toBe(false);
    expect(s.anomaly).toBe(false);
    expect(s.chamber.estimated).toBeLessThan(10);
    expect(s.status.twin).toBe("HOLDING");
    engine.start();
    run(1);
    expect(engine.snapshot().mode).toBe("start");
    run(9);
    s = engine.snapshot();
    expect(s.mode).toBe("mainstage");
    expect(s.monitoring).toBe(true);
    expect(s.chamber.estimated).toBeGreaterThan(97);
    expect(s.anomaly).toBe(false);
  });

  it("clears a fault and returns to nominal, and resets to exactly the same run", () => {
    scenario("injector_restriction", 30);
    engine.clear();
    run(12);
    const cleared = engine.snapshot();
    expect(cleared.faults).toHaveLength(0);
    expect(cleared.ranking[0].id).toBe("nominal");
    expect(cleared.anomaly).toBe(false);
    engine.reset();
    run(3);
    const first = engine.snapshot().channels.pcA.observed;
    engine.reset();
    run(3);
    expect(engine.snapshot().channels.pcA.observed).toBe(first);
  });

  it("covers every injectable fault and every channel", () => {
    expect(Object.keys(FAULT_DEFS).sort()).toEqual([...FAULT_IDS].sort());
    expect(CHANNELS.map((c) => c.id)).toEqual([...CHANNEL_IDS]);
    expect(CHANNELS.filter((c) => c.kind === "pressure")).toHaveLength(15);
  });
});
