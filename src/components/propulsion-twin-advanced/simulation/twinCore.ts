// The Digital Twin's loop, up to the point where it has something to interpret:
//
//   physical system → sensors → telemetry transport → data quality
//     → physics model (expected) → state estimation (estimated)
//     → residuals and inferred parameters
//
// The "physical system" is itself simulated: the same network model with
// as-built parameters, unmodelled scatter and whatever faults are injected.
// The twin never reads that truth. It sees only what arrives as telemetry.
// What it concludes from the evidence is in twinEngine.ts.
import { CH, CHANNELS, CHANNEL_IDS, N_CH, clamp, clamp01, createRng, type Rng } from "./channels";
import { AS_BUILT, type ClassifierReport, type FeatureContext, WANDERING, WANDER_SIGMA, identificationData, identify, modelError, trainAnomalyModel, trainClassifier } from "./calibration";
import { FAULT_DEFS, SKEWED_NODE, type Severities, applyPhysicalFaults, clockSkewSteps, driftBias, noiseMultiplier, replayActive, transportDelaySteps } from "./faults";
import { DIAGNOSIS_BY_ID, type DiagnosisId, type EvidenceLine, type FaultId, PHYSICAL_DIAGNOSES, type PhysicalDiagnosis, type RankedDiagnosis, SYMPTOM_IDS, type SymptomId, grade, zeroSymptoms } from "./isolation";
import { type PcaModel, reconstructionError } from "./ml";
import { DESIGN, type PlantParams, type PlantState, coldState, scheduleSpeed, steadyState, stepPlant, writeOutputs } from "./plant";
import { HEALTH_PARAMS, HEALTH_PARAM_IDS, type HealthParamId, healthDeviations, npshRatio, symptomArray, symptomDeviations, virtualChamberPressure } from "./symptoms";
import type { ActiveFault, DataQuality, DetectorId, EngineMode, FaultOnset, ModelEvidence, Prognosis, Recognition, TwinEvent, TwinSnapshot } from "./twinTypes";

export const DT = 0.05;
export const HISTORY = 300;
export const HISTORY_EVERY = 2;
const BUFFER = 128;
const REPLAY_STEPS = 60;
export const DEBOUNCE = 4;
const WANDER_TAU = 5;
const SMOOTH = 0.1;
export const CUSUM_SLACK = 2.5;
export const CUSUM_LIMIT = 25;
export const CUSUM_ON: readonly SymptomId[] = ["pc", "head_ox", "k_valve", "k_cool", "k_inj_ox", "eta_c", "pc_ab", "p_tank_ox"];
export const DETECTORS: readonly DetectorId[] = ["redline", "rate", "residual", "cusum", "multivariate", "ml", "hybrid"];
export const VOTERS: readonly DetectorId[] = ["residual", "cusum", "multivariate", "ml"];
export const HORIZONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
/** Lowest chamber pressure and highest coolant temperature rise allowed in mainstage, as fractions of expectation. */
export const PC_LIMIT = 0.95;
export const TCOOL_LIMIT = 1.08;
/** Smallest scatter a low-pressure residual is judged against, so a change of a few hundredths of a percent is not called a symptom. */
export const SYMPTOM_FLOOR: Partial<Record<SymptomId, number>> = { p_tank_ox: 0.05, p_in_ox: 0.06 };
/** Throttle range the model was calibrated over. */
export const ENVELOPE: readonly [number, number] = [0.58, 1.02];
/** Throttle settings the controls accept. */
export const THROTTLE_RANGE: readonly [number, number] = [0.6, 1];
/** Most one sample may add to a sensor's noise estimate, as a multiple of the present estimate: a 5 σ jump, squared. */
export const NOISE_SAMPLE_CAP = 25;
/** Share of its calibrated sample-to-sample scatter below which a sensor is judged to have stopped responding. */
export const FLAT_LINE = 0.05;
/** Most steps one call may advance: five minutes of simulated time. */
export const MAX_STEPS = 6000;
/** Steps between runs of the consistency check and of the prognosis. */
export const SLOW_EVERY = 10;
/**
 * Seconds the residuals must stay unexplained before the cause is called unrecognised. Longer than the
 * estimate takes to settle after a full-severity fault arrives in one step, which is the slowest
 * legitimate reason for a modelled fault to look unexplained.
 */
export const UNRECOGNISED_AFTER = 10;
/**
 * Shaft time constants the engine must hold mainstage for after a start before its health is judged. Five
 * time constants is the usual measure of "settled": the start transient is the largest the engine sees, and the
 * system's dynamics are not exactly the model's, so judging it earlier raises an alarm on a healthy engine.
 */
export const SETTLE_TIME_CONSTANTS = 5;
export const NO_RECOGNITION: Recognition = { status: "idle", score: 0, fault: null, severity: 0, channel: null };

/** Which model parameter each inferred parameter corresponds to, and the quantity its trend threatens. */
export const DRIVES: Record<HealthParamId, { param: keyof PlantParams | null; concern: "pc" | "tCool" | "npsh" }> = {
  head_ox: { param: "headOx", concern: "pc" },
  head_fu: { param: "headFu", concern: "pc" },
  k_valve: { param: "kValveFu", concern: "tCool" },
  k_cool: { param: "kCool", concern: "tCool" },
  k_inj_ox: { param: "kInjOx", concern: "pc" },
  k_inj_fu: { param: "kInjFu", concern: "tCool" },
  eta_c: { param: "etaC", concern: "pc" },
  npsh_ox: { param: null, concern: "npsh" },
};

export interface Detector {
  score: number;
  run: number;
  active: boolean;
  first: number | null;
  note?: string;
}

export const percentile = (values: number[], p: number) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(p * values.length))];
export const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
export const std = (values: readonly number[]) => {
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / Math.max(1, values.length - 1));
};

export abstract class TwinCore {
  readonly historyStep = DT * HISTORY_EVERY;
  readonly historyLength = HISTORY;
  readonly evidence: ModelEvidence;
  /** The twin's model: identified from simulated test data, never copied from the physical system. */
  readonly model: PlantParams;
  exercise = false;

  protected rng: Rng;
  protected readonly seed: number;
  protected k = 0;
  protected mode: Exclude<EngineMode, "throttle"> = "mainstage";
  protected u = 1;
  protected target = 1;
  protected base = 1;
  protected exerciseClock = 0;
  protected ignited = true;
  /** Simulated time at which a start is counted as settled. */
  protected settledAt = 0;
  protected truth: PlantState = coldState();
  protected twin: PlantState = coldState();
  protected wander = new Map<keyof PlantParams, number>();
  protected faults = new Map<FaultId, ActiveFault>();
  protected firstFaultAt: number | null = null;

  protected truthValues = new Float64Array(N_CH);
  protected obs = new Float64Array(N_CH);
  protected obsPrev = new Float64Array(N_CH);
  protected exp = new Float64Array(N_CH);
  protected expPrev = new Float64Array(N_CH);
  protected est = new Float64Array(N_CH);
  protected variance = new Float64Array(N_CH);
  protected noiseRatio = new Float64Array(N_CH).fill(1);
  /** 1 where this step's sample is a usable number. */
  protected valid = new Uint8Array(N_CH).fill(1);
  protected buffer = CHANNEL_IDS.map(() => new Float64Array(BUFFER));
  protected replayData: Float64Array[] | null = null;
  protected replayStart = 0;

  protected pc = 100;
  protected pcVariance = 0.01;
  protected virtual = 100;
  protected offA = 0;
  protected offB = 0;
  protected outA = false;
  protected outB = false;
  protected residualTrail: number[] = [];

  protected activity = 0;
  protected inflate = 1;
  protected monitoring = true;
  protected dev = zeroSymptoms();
  protected z = zeroSymptoms();
  protected g = zeroSymptoms();
  protected healthDev = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0])) as Record<HealthParamId, number>;
  protected cusum = new Map<SymptomId, [number, number]>();
  protected det = Object.fromEntries(DETECTORS.map((id) => [id, { score: 0, run: 0, active: false, first: null }])) as Record<DetectorId, Detector>;
  protected ranking: RankedDiagnosis[] = [];
  protected evidenceLines: EvidenceLine[] = [];
  protected explained: PhysicalDiagnosis = "nominal";
  protected mlScore = 0;
  protected outOfDistribution = false;
  protected recognition: Recognition = NO_RECOGNITION;
  protected unexplainedFor = 0;
  protected quality: TwinSnapshot["quality"] = { status: "GOOD", nodes: [], noisy: [], missing: [], frozen: [], notes: [] };
  protected prognosis!: Prognosis;
  protected healthTrail = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, [] as number[]])) as Record<HealthParamId, number[]>;
  protected trailTimes: number[] = [];
  protected events: TwinEvent[] = [];
  protected wasAnomaly = false;
  protected isolated: DiagnosisId | null = null;
  protected isolatingFor = 0;
  protected lastQuality: DataQuality = "GOOD";

  protected hist = { observed: CHANNEL_IDS.map(() => new Float32Array(HISTORY)), estimated: CHANNEL_IDS.map(() => new Float32Array(HISTORY)), expected: CHANNEL_IDS.map(() => new Float32Array(HISTORY)) };
  protected histPc = new Float32Array(HISTORY);
  protected histSigma = new Float32Array(HISTORY);
  protected head = 0;

  // What a healthy run looks like: the baseline and scatter of every piece of evidence.
  protected symptomSigma = Object.fromEntries(SYMPTOM_IDS.map((id) => [id, 1])) as Record<SymptomId, number>;
  protected symptomBase = zeroSymptoms();
  protected healthSigma = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0.01])) as Record<HealthParamId, number>;
  protected healthBase = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0])) as Record<HealthParamId, number>;
  protected channelSigma = new Float64Array(N_CH).fill(1);
  protected channelBase = new Float64Array(N_CH);
  protected offBaseA = 0;
  protected offBaseB = 0;
  protected voteGate = 1;
  protected t2Limit = 60;
  protected pca: PcaModel;
  protected classifier: ClassifierReport;
  protected collecting: { dev: number[][]; health: number[][]; residual: number[][]; offA: number[]; offB: number[]; spe: number[] } | null = null;

  constructor(seed = 20261011) {
    this.seed = seed;
    this.rng = createRng(seed);

    // 1. Parameter identification from simulated test evidence.
    const tests = identificationData(AS_BUILT, createRng(seed + 1));
    this.model = identify(tests);
    const pressures = CHANNELS.map((c, i) => (c.kind === "pressure" ? i : -1)).filter((i) => i >= 0);
    const meanError = (errors: number[]) => pressures.reduce((sum, i) => sum + errors[i], 0) / pressures.length;
    const errorBefore = meanError(modelError(DESIGN, tests));
    const errorAfter = meanError(modelError(this.model, tests));

    // 2. The anomaly detector learns healthy telemetry. Then a separate healthy run measures the baseline and
    //    scatter of every piece of evidence, and sets the detector's alarm threshold on data it was not trained on.
    this.pca = trainAnomalyModel(AS_BUILT, createRng(seed + 2));
    this.classifier = { model: { weights: [] }, trainingSamples: 0, validationSamples: 0, trainingAccuracy: 0, validationAccuracy: 0, confusion: [], calibration: { ece: 0, brier: 0, bins: [] } };
    this.calibrate();

    // 3. The fault classifier, trained and validated on separate simulated sets.
    const ctx: FeatureContext = { system: AS_BUILT, model: this.model, symptomSigma: this.symptomSigma, symptomBase: this.symptomBase, voteGate: this.voteGate, offBase: [this.offBaseA, this.offBaseB] };
    this.classifier = trainClassifier(ctx, createRng(seed + 3), createRng(seed + 4));
    this.evidence = {
      identificationSamples: tests.length,
      errorBefore,
      errorAfter,
      classifier: { ...this.classifier, classes: PHYSICAL_DIAGNOSES },
      anomaly: { trainingSamples: 280, components: this.pca.components.length, explained: this.pca.explained.reduce((a, b) => a + b, 0) },
    };
    this.reset();
  }

  // ── Control ───────────────────────────────────────────────────────────────

  reset(): void {
    this.restart(1);
  }

  /** Returns to the healthy, settled engine at a throttle setting. The same setting always gives the same run. */
  protected restart(throttle: number): void {
    this.rng = createRng(this.seed + 7);
    this.k = 0;
    this.mode = "mainstage";
    this.u = this.target = this.base = clamp(throttle, THROTTLE_RANGE[0], THROTTLE_RANGE[1]);
    this.exercise = false;
    this.exerciseClock = 0;
    this.ignited = true;
    this.settledAt = 0;
    this.faults.clear();
    this.firstFaultAt = null;
    this.wander.clear();
    const speed = scheduleSpeed(this.u);
    const truth = steadyState(AS_BUILT, speed);
    const twin = steadyState(this.model, speed);
    this.truth = { ...truth.state };
    this.twin = { ...twin.state };
    for (let i = 0; i < N_CH; i++) {
      this.obs[i] = this.obsPrev[i] = this.est[i] = truth.values[i];
      this.exp[i] = this.expPrev[i] = twin.values[i];
      this.variance[i] = (CHANNELS[i].sigma * 0.3) ** 2;
      this.buffer[i].fill(truth.values[i]);
      this.hist.observed[i].fill(truth.values[i]);
      this.hist.estimated[i].fill(truth.values[i]);
      this.hist.expected[i].fill(twin.values[i]);
    }
    this.noiseRatio.fill(1);
    this.valid.fill(1);
    this.replayData = null;
    this.pc = this.virtual = truth.state.pc;
    this.pcVariance = 0.01;
    this.histPc.fill(this.pc);
    this.histSigma.fill(0.1);
    this.head = 0;
    this.offA = this.offB = 0;
    this.outA = this.outB = false;
    this.residualTrail = [];
    this.activity = 0;
    this.inflate = 1;
    this.monitoring = true;
    this.dev = zeroSymptoms();
    this.z = zeroSymptoms();
    this.g = zeroSymptoms();
    for (const id of HEALTH_PARAM_IDS) {
      this.healthDev[id] = 0;
      this.healthTrail[id] = [];
    }
    this.trailTimes = [];
    this.cusum.clear();
    for (const id of DETECTORS) this.det[id] = { score: 0, run: 0, active: false, first: null };
    this.events = [];
    this.recognition = NO_RECOGNITION;
    this.unexplainedFor = 0;
    this.wasAnomaly = false;
    this.isolated = null;
    this.isolatingFor = 0;
    this.lastQuality = "GOOD";
    this.quality = { status: "GOOD", nodes: [], noisy: [], missing: [], frozen: [], notes: [] };
    this.isolate();
    this.prognose();
  }

  inject(id: FaultId, severity = 0.8, onset: FaultOnset = "gradual"): void {
    // Requests arrive from the interface and from the address bar: anything that is not a known fault at a real severity is dropped.
    if (!Object.hasOwn(FAULT_DEFS, id) || !Number.isFinite(severity)) return;
    const target = clamp(severity, 0.1, 1);
    const sudden = onset === "abrupt" || FAULT_DEFS[id].rampSeconds === 0;
    this.faults.set(id, { id, target, severity: sudden ? target : (this.faults.get(id)?.severity ?? 0), since: this.t, onset: sudden ? "abrupt" : "gradual" });
    this.firstFaultAt ??= this.t;
    this.log("injected", `Fault injected: ${DIAGNOSIS_BY_ID[id].name}${sudden && FAULT_DEFS[id].rampSeconds > 0 ? " (abrupt onset)" : ""}`, id);
  }

  scenario(id: FaultId, severity = 0.8, onset: FaultOnset = "gradual"): void {
    if (!Object.hasOwn(FAULT_DEFS, id) || !Number.isFinite(severity)) return;
    // Evidence left over from an earlier fault would be credited to this one, so a scenario starts from the healthy baseline.
    // An engine that is not in mainstage is left in its mode: monitoring is held there, and nothing carries over.
    const clean = this.faults.size === 0 && !this.det.hybrid.active && this.isolated === null && this.quality.status === "GOOD" && this.ranking[0]?.id === "nominal";
    if (!clean) {
      if (this.mode === "mainstage") this.restart(this.base);
      else this.clear();
    }
    this.inject(id, severity, onset);
  }

  clear(id?: FaultId): void {
    const ids = id ? [id] : [...this.faults.keys()];
    for (const fault of ids) if (this.faults.delete(fault)) this.log("cleared", `Fault removed: ${DIAGNOSIS_BY_ID[fault].name}`, fault);
    if (this.faults.size === 0) {
      this.firstFaultAt = null;
      this.cusum.clear();
      this.unexplainedFor = 0;
      for (const d of DETECTORS) this.det[d].first = null;
    }
  }

  setThrottle(level: number): void {
    if (!Number.isFinite(level)) return;
    this.base = this.target = clamp(level, THROTTLE_RANGE[0], THROTTLE_RANGE[1]);
  }

  setExercise(on: boolean): void {
    this.exercise = on;
    this.exerciseClock = 0;
    if (!on) this.target = this.base;
  }

  start(): void {
    if (this.mode !== "ready") return;
    this.mode = "start";
    this.log("mode", "Start sequence commanded");
  }

  shutdown(): void {
    if (this.mode === "ready" || this.mode === "shutdown") return;
    this.mode = "shutdown";
    this.log("mode", "Shutdown commanded");
  }

  get t(): number {
    return this.k * DT;
  }

  step(count = 1): void {
    const steps = Number.isFinite(count) ? Math.min(MAX_STEPS, Math.floor(count)) : 0;
    for (let i = 0; i < steps; i++) this.advance();
  }

  // ── One step ──────────────────────────────────────────────────────────────

  protected severities(): Severities {
    const s: Severities = {};
    for (const fault of this.faults.values()) s[fault.id] = fault.severity;
    return s;
  }

  protected command(): void {
    switch (this.mode) {
      case "ready":
        this.u = 0;
        this.ignited = false;
        break;
      case "start":
        this.u = Math.min(this.target, this.u + DT * 0.35);
        if (this.u > 0.12) this.ignited = true;
        if (this.u >= this.target) {
          this.mode = "mainstage";
          this.settledAt = this.t + SETTLE_TIME_CONSTANTS * this.model.tauN;
        }
        break;
      case "mainstage":
        if (this.exercise) {
          this.exerciseClock += DT;
          this.target = this.base - (Math.floor(this.exerciseClock / 6) % 2 === 1 ? 0.15 : 0);
        }
        this.u += clamp(this.target - this.u, -0.8 * DT, 0.8 * DT);
        break;
      case "shutdown":
        this.u = Math.max(0, this.u - DT * 0.6);
        if (this.u < 0.08) this.ignited = false;
        if (this.u === 0) this.mode = "ready";
        break;
    }
  }

  protected advance(): void {
    const k = ++this.k;
    this.command();
    const speed = scheduleSpeed(this.u);
    for (const fault of this.faults.values()) {
      const ramp = FAULT_DEFS[fault.id].rampSeconds;
      if (fault.severity < fault.target) fault.severity = ramp === 0 ? fault.target : Math.min(fault.target, fault.severity + DT / ramp);
    }
    const sev = this.severities();

    // The physical system, with scatter the model does not have.
    const system = { ...AS_BUILT };
    for (const key of WANDERING) {
      const w = (this.wander.get(key) ?? 0) * (1 - DT / WANDER_TAU) + WANDER_SIGMA * Math.sqrt((2 * DT) / WANDER_TAU) * this.rng.gauss();
      this.wander.set(key, w);
      system[key] = AS_BUILT[key] * (1 + w);
    }
    const actual = this.physicalSystem(system, sev);
    writeOutputs(actual, this.truth, stepPlant(actual, this.truth, speed, this.ignited, DT), this.truthValues);
    this.obsPrev.set(this.obs);
    this.acquire(k, sev);

    // Expected: the model, driven by the same commands.
    this.expPrev.set(this.exp);
    writeOutputs(this.model, this.twin, stepPlant(this.model, this.twin, speed, this.ignited, DT), this.exp);
    const moved = Math.abs(this.exp[CH.pcA] - this.expPrev[CH.pcA]) / DT;
    this.activity = Math.max(moved, this.activity * Math.exp(-DT / 0.5));
    this.inflate = 1 + 0.5 * this.activity;
    const steady = this.activity < 0.5;
    this.monitoring = this.mode === "mainstage" && this.ignited && this.exp[CH.mOx] > 35 && this.t >= this.settledAt;

    // Estimated: each measurement is predicted by the model's own change, then corrected by what arrived.
    // A sample that did not arrive, or is not a number, corrects nothing: the estimate coasts on the model and its uncertainty grows.
    for (let i = 0; i < N_CH; i++) {
      const sigma = CHANNELS[i].sigma;
      const step = this.exp[i] - this.expPrev[i];
      const predicted = this.est[i] + step;
      const p = this.variance[i] + (0.12 * sigma) ** 2;
      this.valid[i] = Number.isFinite(this.obs[i]) ? 1 : 0;
      if (!this.valid[i]) {
        this.est[i] = predicted;
        this.variance[i] = Math.min(p, (20 * sigma) ** 2);
        continue;
      }
      if (steady && Number.isFinite(this.obsPrev[i])) {
        // Noise is scatter that persists. One sample is allowed to count for no more than a 5 σ jump at the present
        // noise level, so a single step in the signal (a fault arriving at once) is not read as a noisy sensor.
        const jump = this.obs[i] - this.obsPrev[i] - step;
        const sample = Math.min((jump * jump) / (2 * sigma * sigma), NOISE_SAMPLE_CAP * Math.max(1, this.noiseRatio[i]));
        this.noiseRatio[i] += 0.04 * (sample - this.noiseRatio[i]);
      }
      const gain = p / (p + sigma * sigma * Math.max(1, this.noiseRatio[i]));
      this.est[i] = predicted + gain * (this.obs[i] - predicted);
      this.variance[i] = (1 - gain) * p;
    }
    this.fuseChamber();

    if (this.monitoring) {
      const health = healthDeviations(this.est, this.pc, this.model, npshRatio(this.exp));
      for (const id of HEALTH_PARAM_IDS) this.healthDev[id] += SMOOTH * (health[id] - this.healthDev[id]);
      const raw = symptomDeviations(this.est, this.exp, this.pc, health);
      for (const id of SYMPTOM_IDS) {
        this.dev[id] += SMOOTH * (raw[id] - this.dev[id]);
        this.z[id] = (this.dev[id] - this.symptomBase[id]) / (this.symptomSigma[id] * this.inflate);
        this.g[id] = grade(this.z[id]);
      }
      if (this.collecting && steady && k > 80) {
        this.collecting.dev.push(symptomArray(this.dev));
        this.collecting.health.push(HEALTH_PARAM_IDS.map((id) => this.healthDev[id]));
        this.collecting.residual.push(Array.from(this.est, (value, i) => value - this.exp[i]));
        this.collecting.offA.push(this.offA);
        this.collecting.offB.push(this.offB);
        this.collecting.spe.push(reconstructionError(this.pca, this.obs));
      }
    } else {
      for (const id of SYMPTOM_IDS) {
        this.dev[id] *= 0.9;
        this.z[id] = this.g[id] = 0;
      }
    }

    this.assessQuality(sev, steady);
    this.detect(steady);
    if (k % 2 === 0) this.isolate();
    if (k % SLOW_EVERY === 0) {
      this.recognise(steady);
      this.prognose();
    }
    this.track();
    if (k % HISTORY_EVERY === 0) {
      this.head = (this.head + 1) % HISTORY;
      for (let i = 0; i < N_CH; i++) {
        this.hist.observed[i][this.head] = this.obs[i];
        this.hist.estimated[i][this.head] = this.est[i];
        this.hist.expected[i][this.head] = this.exp[i];
      }
      this.histPc[this.head] = this.pc;
      this.histSigma[this.head] = Math.sqrt(this.pcVariance) * this.inflate;
    }
  }

  /** The physical system this step: its parameters with the injected faults applied. */
  protected physicalSystem(system: PlantParams, sev: Severities): PlantParams {
    return applyPhysicalFaults(system, sev);
  }

  /** Sensors, then the path the samples travel before the twin sees them. Fills `obs`. */
  protected acquire(k: number, sev: Severities): void {
    const slot = k % BUFFER;
    for (let i = 0; i < N_CH; i++) {
      const noise = CHANNELS[i].sigma * (i === CH.pOutOx ? noiseMultiplier(sev) : 1) * this.rng.gauss();
      this.buffer[i][slot] = this.truthValues[i] + noise + (i === CH.pcA ? driftBias(sev) : 0);
    }
    if (replayActive(sev) && !this.replayData) {
      this.replayData = this.buffer.map((channel) => Float64Array.from({ length: REPLAY_STEPS }, (_, j) => channel[(k - REPLAY_STEPS + j + BUFFER * 2) % BUFFER]));
      this.replayStart = k;
    } else if (!replayActive(sev)) {
      this.replayData = null;
    }
    const delay = transportDelaySteps(sev);
    const skew = clockSkewSteps(sev);
    for (let i = 0; i < N_CH; i++) {
      const late = delay + (CHANNELS[i].node === SKEWED_NODE ? skew : 0);
      this.obs[i] = this.replayData ? this.replayData[i][(k - this.replayStart) % REPLAY_STEPS] : this.buffer[i][(k - late + BUFFER * 2) % BUFFER];
    }
  }

  /** A channel's residual against its healthy baseline, in standard deviations, with the transient allowance applied. */
  protected residualZ(i: number): number {
    return (this.est[i] - this.exp[i] - this.channelBase[i]) / (this.channelSigma[i] * this.inflate);
  }

  /** An inferred parameter's departure from its healthy baseline, as a fraction. */
  protected health(id: HealthParamId): number {
    return this.healthDev[id] - this.healthBase[id];
  }

  /** Share of an inferred parameter's action limit that is used up, 0–1. Scatter inside three standard deviations counts as none. */
  protected used(id: HealthParamId): number {
    const limit = HEALTH_PARAMS.find((h) => h.id === id)!.limit;
    const noise = 3 * this.healthSigma[id];
    const toward = this.health(id) * Math.sign(limit);
    return clamp01((toward - noise) / Math.max(1e-6, Math.abs(limit) - noise));
  }

  /** Chamber pressure from two sensors and a virtual one, with a vote on which sensors to believe. */
  protected fuseChamber(): void {
    this.virtual = virtualChamberPressure(this.est, this.model);
    this.offA += 0.08 * (this.est[CH.pcA] - this.virtual - this.offA);
    this.offB += 0.08 * (this.est[CH.pcB] - this.virtual - this.offB);
    const gate = this.voteGate * this.inflate;
    const vote = (out: boolean, own: number, other: number) => (out ? Math.abs(own) > gate / 2 : Math.abs(own) > gate && Math.abs(own) > 2 * Math.abs(other));
    const wasA = this.outA;
    const wasB = this.outB;
    const a = this.offA - this.offBaseA;
    const b = this.offB - this.offBaseB;
    this.outA = this.monitoring && vote(this.outA, a, b);
    this.outB = this.monitoring && vote(this.outB, b, a);
    if (this.outA && !wasA) this.log("sensor", "Chamber pressure sensor A voted out: it disagrees with sensor B and with the virtual sensor", "pc_sensor_drift");
    if (this.outB && !wasB) this.log("sensor", "Chamber pressure sensor B voted out: it disagrees with sensor A and with the virtual sensor");

    let x = this.pc + (this.exp[CH.pcA] - this.expPrev[CH.pcA]);
    let p = this.pcVariance + 0.03 ** 2;
    const update = (measurement: number, r: number) => {
      const gain = p / (p + r);
      x += gain * (measurement - x);
      p *= 1 - gain;
    };
    const r = CHANNELS[CH.pcA].sigma ** 2;
    const useA = !this.outA && this.valid[CH.pcA] === 1;
    const useB = !this.outB && this.valid[CH.pcB] === 1;
    if (useA) update(this.obs[CH.pcA], r);
    if (useB) update(this.obs[CH.pcB], r);
    if (!useA && !useB) update(this.virtual, 0.25);
    this.pc = x;
    this.pcVariance = p;
  }

  protected assessQuality(sev: Severities, steady: boolean): void {
    const latency = 18 + transportDelaySteps(sev) * DT * 1000;
    const skew = clockSkewSteps(sev) * DT * 1000;
    const nodes = (["feed", "turbo", "chamber"] as const).map((node) => ({ node, latencyMs: latency, skewMs: node === SKEWED_NODE ? skew : 0, sequenceOk: !this.replayData }));
    const noisy = CHANNEL_IDS.filter((_, i) => this.noiseRatio[i] > 5);
    const missing = CHANNEL_IDS.filter((_, i) => this.valid[i] === 0);
    // A healthy sensor is never perfectly still: one whose sample-to-sample scatter has all but vanished has stopped responding.
    const frozen = CHANNEL_IDS.filter((_, i) => this.valid[i] === 1 && this.noiseRatio[i] < FLAT_LINE);
    const notes: string[] = [];
    for (const id of frozen) notes.push(`${CHANNELS[CH[id]].label}: the reading has stopped changing (flat-line).`);
    if (missing.length) notes.push(`${missing.length === 1 ? CHANNELS[CH[missing[0]]].label : `${missing.length} channels`}: no usable sample arrived. The estimate is coasting on the model.`);
    if (this.replayData) notes.push("Sequence counters are repeating: the stream is a replay of earlier data.");
    if (latency > 120) notes.push(`Telemetry is arriving ${Math.round(latency)} ms after it was sampled.`);
    if (skew > 40) notes.push(`The turbomachinery node's clock is ${Math.round(skew)} ms off the reference.`);
    for (const id of noisy) notes.push(`${CHANNELS[CH[id]].label}: noise is ${Math.sqrt(this.noiseRatio[CH[id]]).toFixed(1)}× its calibrated level.`);
    const status: DataQuality = this.replayData ? "BAD" : notes.length ? "DEGRADED" : "GOOD";
    this.quality = { status, nodes, noisy, missing, frozen, notes };
    if (status !== this.lastQuality) {
      if (status !== "GOOD") this.log("data", `Data quality ${status}: ${notes[0]}`);
      this.lastQuality = status;
    }
    void steady;
  }

  protected log(kind: TwinEvent["kind"], text: string, id?: DiagnosisId): void {
    if (this.collecting) return;
    this.events.push({ t: this.t, kind, text, id });
    if (this.events.length > 40) this.events.shift();
  }

  /** Runs a healthy mainstage with throttle changes and measures the nominal scatter of every piece of evidence. */
  protected calibrate(): void {
    this.reset();
    this.collecting = { dev: [], health: [], residual: [], offA: [], offB: [], spe: [] };
    for (let k = 0; k < 1400; k++) {
      if (k === 500) this.setThrottle(0.8);
      if (k === 900) this.setThrottle(1);
      this.advance();
    }
    const { dev, health, residual, offA, offB, spe } = this.collecting;
    this.collecting = null;
    SYMPTOM_IDS.forEach((id, j) => {
      const column = dev.map((row) => row[j]);
      this.symptomBase[id] = mean(column);
      this.symptomSigma[id] = Math.max(1.25 * std(column), SYMPTOM_FLOOR[id] ?? 1e-4);
    });
    HEALTH_PARAM_IDS.forEach((id, j) => {
      const column = health.map((row) => row[j]);
      this.healthBase[id] = mean(column);
      this.healthSigma[id] = Math.max(1.25 * std(column), 5e-4);
    });
    for (let i = 0; i < N_CH; i++) {
      const column = residual.map((row) => row[i]);
      this.channelBase[i] = mean(column);
      this.channelSigma[i] = Math.max(1.25 * std(column), 0.2 * CHANNELS[i].sigma);
    }
    this.offBaseA = mean(offA);
    this.offBaseB = mean(offB);
    this.voteGate = Math.max(0.5, 6 * Math.max(std(offA), std(offB)));
    this.t2Limit = 1.5 * percentile(dev.map((row) => row.reduce((sum, value, j) => sum + ((value - this.symptomBase[SYMPTOM_IDS[j]]) / this.symptomSigma[SYMPTOM_IDS[j]]) ** 2, 0)), 0.999);
    // The learned detector's threshold comes from this run, which it was not trained on.
    this.pca.threshold = 1.5 * percentile(spe, 0.999);
  }

  // Interpretation of the evidence: see TwinEngine.
  protected abstract detect(steady: boolean): void;
  protected abstract isolate(): void;
  protected abstract recognise(steady: boolean): void;
  protected abstract prognose(): void;
  protected abstract track(): void;
}
