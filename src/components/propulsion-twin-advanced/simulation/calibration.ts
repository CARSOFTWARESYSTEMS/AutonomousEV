// Making the model a model of this particular system, and teaching the learned
// models from simulated data.
//
//   1. The physical system is "as built": every parameter a little off its
//      design value, as hardware always is.
//   2. Parameter identification fits the twin's model to (simulated) test
//      measurements of that system.
//   3. The anomaly detector and the fault classifier are trained on simulated
//      runs, and scored on separate runs they never saw.
//
// All data here is SIMULATED. The evidence it produces is evidence about the
// method, not about any engine.
import { CH, CHANNELS, N_CH, type Rng } from "./channels";
import { type Severities, applyPhysicalFaults, driftBias } from "./faults";
import { PHYSICAL_DIAGNOSES, type PhysicalDiagnosis, SYMPTOM_IDS, type SymptomId, grade } from "./isolation";
import { type PcaModel, type SoftmaxModel, accuracy, confusionMatrix, trainPca, trainSoftmax } from "./ml";
import { DESIGN, type PlantParams, W_FU, W_OX, cStarFactor, scheduleSpeed, steadyState } from "./plant";
import { healthDeviations, npshRatio, symptomArray, symptomDeviations, virtualChamberPressure } from "./symptoms";

/** The physical system: design values with the scatter of real hardware. Fixed, so every visit sees the same system. */
export const AS_BUILT: PlantParams = {
  ...DESIGN,
  kFeedFu: DESIGN.kFeedFu * 1.04,
  kFeedOx: DESIGN.kFeedOx * 0.97,
  headFu: 0.988,
  headOx: 1.008,
  kValveFu: DESIGN.kValveFu * 1.05,
  kValveOx: DESIGN.kValveOx * 0.975,
  kCool: DESIGN.kCool * 1.035,
  kLineFu: DESIGN.kLineFu * 0.96,
  kInjFu: DESIGN.kInjFu * 1.02,
  kInjOx: DESIGN.kInjOx * 0.985,
  etaC: 0.99,
  tauC: DESIGN.tauC * 1.15,
  tauN: DESIGN.tauN * 1.08,
};

/** Parameters that wander slightly in the physical system and are not in the model: the source of model-form error. */
export const WANDERING: readonly (keyof PlantParams)[] = ["headFu", "headOx", "kCool", "etaC", "kInjOx", "kInjFu", "kValveFu"];
export const WANDER_SIGMA = 0.003;

/** The system's parameters with one draw of that unmodelled scatter. */
export function withScatter(base: PlantParams, rng: Rng, sigma = WANDER_SIGMA): PlantParams {
  const p = { ...base };
  for (const key of WANDERING) p[key] = base[key] * (1 + sigma * rng.gauss());
  return p;
}

/** One noisy measurement of every channel at a steady operating point. */
export function measure(values: readonly number[], rng: Rng, noiseScale = 1): number[] {
  return values.map((value, i) => value + noiseScale * CHANNELS[i].sigma * rng.gauss());
}

/** Least-squares slope through the origin. */
const slope = (x: readonly number[], y: readonly number[]) => x.reduce((sum, value, i) => sum + value * y[i], 0) / Math.max(1e-12, x.reduce((sum, value) => sum + value * value, 0));

/**
 * Parameter identification. Each loss coefficient is the least-squares slope of
 * a measured pressure drop against flow squared; each pump's head scale is
 * fitted against its design curve; combustion efficiency against the measured
 * flows. Time constants are not identified here and keep their design values.
 */
export function identify(samples: readonly (readonly number[])[], design: PlantParams = DESIGN): PlantParams {
  const col = (i: number) => samples.map((s) => s[i]);
  const fu2 = samples.map((s) => (s[CH.mFu] / 100) ** 2);
  const ox2 = samples.map((s) => (s[CH.mOx] / 100) ** 2);
  const n2 = samples.map((s) => (s[CH.speed] / 100) ** 2);
  const drop = (a: number, b: number) => samples.map((s) => s[a] - s[b]);
  const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  const pc = samples.map((s) => (s[CH.pcA] + s[CH.pcB]) / 2);
  const ideal = samples.map((s) => {
    const fu = s[CH.mFu] / 100;
    const ox = s[CH.mOx] / 100;
    return 100 * cStarFactor(ox / Math.max(fu, 1e-3)) * (W_OX * ox + W_FU * fu);
  });
  return {
    ...design,
    pTankFu: mean(col(CH.pTankFu)),
    pTankOx: mean(col(CH.pTankOx)),
    kFeedFu: slope(fu2, drop(CH.pTankFu, CH.pInFu)),
    kFeedOx: slope(ox2, drop(CH.pTankOx, CH.pInOx)),
    headFu: 1,
    headOx: 1,
    // The curve's shape comes from the pump's own component test; the engine test scales it.
    aFu: design.aFu * slope(n2.map((x, i) => design.aFu * x - design.bFu * fu2[i]), drop(CH.pOutFu, CH.pInFu)),
    bFu: design.bFu * slope(n2.map((x, i) => design.aFu * x - design.bFu * fu2[i]), drop(CH.pOutFu, CH.pInFu)),
    aOx: design.aOx * slope(n2.map((x, i) => design.aOx * x - design.bOx * ox2[i]), drop(CH.pOutOx, CH.pInOx)),
    bOx: design.bOx * slope(n2.map((x, i) => design.aOx * x - design.bOx * ox2[i]), drop(CH.pOutOx, CH.pInOx)),
    kValveFu: slope(fu2, drop(CH.pOutFu, CH.pCoolIn)),
    kValveOx: slope(ox2, drop(CH.pOutOx, CH.pInjOx)),
    valveFu: 1,
    kCool: slope(fu2, drop(CH.pCoolIn, CH.pCoolOut)),
    kLineFu: slope(fu2, drop(CH.pCoolOut, CH.pInjFu)),
    kInjFu: slope(fu2, samples.map((s, i) => s[CH.pInjFu] - pc[i])),
    kInjOx: slope(ox2, samples.map((s, i) => s[CH.pInjOx] - pc[i])),
    etaC: slope(ideal, pc),
  };
}

/** Simulated test evidence for identification: steady points at several throttle settings. */
export function identificationData(system: PlantParams, rng: Rng, perLevel = 80): number[][] {
  const samples: number[][] = [];
  for (const throttle of [1, 0.9, 0.8, 0.7, 0.6]) {
    const speed = scheduleSpeed(throttle);
    for (let i = 0; i < perLevel; i++) samples.push(measure(steadyState(withScatter(system, rng), speed).values, rng));
  }
  return samples;
}

/** Root-mean-square difference between a model's steady prediction and measurements, per channel, across throttle settings. */
export function modelError(model: PlantParams, samples: readonly (readonly number[])[]): number[] {
  const sums = new Array<number>(N_CH).fill(0);
  for (const sample of samples) {
    const predicted = steadyState(model, sample[CH.speed] / 100).values;
    for (let i = 0; i < N_CH; i++) sums[i] += (sample[i] - predicted[i]) ** 2;
  }
  return sums.map((sum) => Math.sqrt(sum / samples.length));
}

// ── Training data for the learned models ────────────────────────────────────

export interface FeatureContext {
  system: PlantParams;
  model: PlantParams;
  /** Healthy baseline and scatter of each symptom's deviation: where a deviation is measured from, and in what unit. */
  symptomSigma: Record<SymptomId, number>;
  symptomBase: Record<SymptomId, number>;
  /** Healthy offset of chamber sensors A and B from the virtual sensor. */
  offBase: readonly [number, number];
  /** Disagreement, in % of reference chamber pressure, at which a chamber sensor is voted out. */
  voteGate: number;
}

export const FAULT_OF: Record<PhysicalDiagnosis, Severities | null> = {
  nominal: null,
  pump_degradation: { pump_degradation: 1 },
  valve_restriction: { valve_restriction: 1 },
  cooling_restriction: { cooling_restriction: 1 },
  feed_pressure_reduction: { feed_pressure_reduction: 1 },
  injector_restriction: { injector_restriction: 1 },
  combustion_loss: { combustion_loss: 1 },
  pc_sensor_drift: { pc_sensor_drift: 1 },
};

/** How much noise is left on a measurement after the state estimator, relative to the raw sensor. */
const ESTIMATE_NOISE = 0.3;

/** Graded symptoms for one simulated steady condition: a class of fault at a severity and a throttle setting. */
export function sampleSymptoms(rng: Rng, cls: PhysicalDiagnosis, severity: number, throttle: number, ctx: FeatureContext): number[] {
  const severities: Severities = {};
  if (cls !== "nominal") severities[cls] = severity;
  const speed = scheduleSpeed(throttle);
  const est = measure(steadyState(applyPhysicalFaults(withScatter(ctx.system, rng), severities), speed).values, rng, ESTIMATE_NOISE);
  est[CH.pcA] += driftBias(severities);
  const exp = steadyState(ctx.model, speed).values;
  // The same sensor vote the live twin applies: a chamber sensor far from the virtual one is left out.
  const virtual = virtualChamberPressure(est, ctx.model);
  const okA = Math.abs(est[CH.pcA] - virtual - ctx.offBase[0]) < ctx.voteGate;
  const okB = Math.abs(est[CH.pcB] - virtual - ctx.offBase[1]) < ctx.voteGate;
  const pc = okA && okB ? (est[CH.pcA] + est[CH.pcB]) / 2 : okA ? est[CH.pcA] : okB ? est[CH.pcB] : virtual;
  const deviations = symptomDeviations(est, exp, pc, healthDeviations(est, pc, ctx.model, npshRatio(exp)));
  return SYMPTOM_IDS.map((id) => grade((deviations[id] - ctx.symptomBase[id]) / ctx.symptomSigma[id]));
}

export interface LabelledSet {
  x: number[][];
  y: number[];
}

/** A labelled set of simulated conditions. Training and validation sets come from different generators and different severity ranges. */
export function labelledSet(rng: Rng, perClass: number, minSeverity: number, ctx: FeatureContext): LabelledSet {
  const x: number[][] = [];
  const y: number[] = [];
  PHYSICAL_DIAGNOSES.forEach((cls, label) => {
    for (let i = 0; i < perClass; i++) {
      x.push(sampleSymptoms(rng, cls, minSeverity + (1 - minSeverity) * rng.next(), 0.6 + 0.42 * rng.next(), ctx));
      y.push(label);
    }
  });
  return { x, y };
}

export interface ClassifierReport {
  model: SoftmaxModel;
  trainingSamples: number;
  validationSamples: number;
  trainingAccuracy: number;
  validationAccuracy: number;
  /** Rows are the true class, columns the predicted class, on the validation set. */
  confusion: number[][];
}

export function trainClassifier(ctx: FeatureContext, trainRng: Rng, validationRng: Rng): ClassifierReport {
  const training = labelledSet(trainRng, 70, 0.25, ctx);
  const validation = labelledSet(validationRng, 40, 0.15, ctx);
  const classes = PHYSICAL_DIAGNOSES.length;
  const model = trainSoftmax(training.x, training.y, classes, trainRng, { epochs: 120, decay: 2e-5 });
  const confusion = confusionMatrix(model, validation.x, validation.y, classes);
  return { model, trainingSamples: training.x.length, validationSamples: validation.x.length, trainingAccuracy: accuracy(confusionMatrix(model, training.x, training.y, classes)), validationAccuracy: accuracy(confusion), confusion };
}

/** The anomaly detector: principal components of healthy telemetry across the throttle range. It is given no physics. */
export function trainAnomalyModel(system: PlantParams, rng: Rng, samples = 280): PcaModel {
  const data: number[][] = [];
  for (let i = 0; i < samples; i++) data.push(measure(steadyState(withScatter(system, rng), scheduleSpeed(0.58 + 0.44 * rng.next())).values, rng));
  return trainPca(data, 6);
}

export { npshRatio, symptomArray };
