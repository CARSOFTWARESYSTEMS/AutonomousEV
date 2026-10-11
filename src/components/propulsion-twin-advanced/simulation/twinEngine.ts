// The Digital Twin, end to end, as one loop:
//
//   physical system → sensors → telemetry transport → data quality
//     → physics model (expected) → state estimation (estimated)
//     → residuals and inferred parameters → detection → isolation
//     → prognosis (predicted) → decision support
//
// The "physical system" is itself simulated: the same network model with
// as-built parameters, unmodelled scatter and whatever faults are injected.
// The twin never reads that truth. It sees only what arrives as telemetry.
import { CH, CHANNELS, CHANNEL_IDS, type ChannelId, N_CH, clamp, clamp01, createRng, type Rng } from "./channels";
import { AS_BUILT, type ClassifierReport, type FeatureContext, WANDERING, WANDER_SIGMA, identificationData, identify, modelError, trainAnomalyModel, trainClassifier } from "./calibration";
import { FAULT_DEFS, SKEWED_NODE, type Severities, applyPhysicalFaults, clockSkewSteps, driftBias, noiseMultiplier, replayActive, transportDelaySteps } from "./faults";
import { DATA_DIAGNOSES, DIAGNOSIS_BY_ID, type DataDiagnosis, type DiagnosisId, type EvidenceLine, type FaultId, PHYSICAL_DIAGNOSES, type PhysicalDiagnosis, type RankedDiagnosis, SYMPTOM_IDS, type SymptomId, type Symptoms, explain, fuseEvidence, grade, physicsProbabilities, zeroSymptoms } from "./isolation";
import { type PcaModel, predictProbabilities, reconstructionError } from "./ml";
import { DESIGN, type PlantParams, type PlantState, coldState, scheduleSpeed, steadyState, stepPlant, writeOutputs } from "./plant";
import { type ProjectionPoint, fitTrend, thresholdOutlook } from "./prognostics";
import { HEALTH_PARAMS, HEALTH_PARAM_IDS, type HealthParamId, healthDeviations, npshRatio, symptomArray, symptomDeviations, virtualChamberPressure } from "./symptoms";
import type { ActiveFault, ChainStage, ChannelReading, Confidence, DataQuality, DetectorId, DetectorReading, EngineMode, HealthReading, Level, ModelEvidence, Prognosis, SeriesKind, TwinEngineApi, TwinEvent, TwinSnapshot } from "./twinTypes";

export const DT = 0.05;
const HISTORY = 300;
const HISTORY_EVERY = 2;
const BUFFER = 128;
const REPLAY_STEPS = 60;
const DEBOUNCE = 4;
const WANDER_TAU = 5;
const SMOOTH = 0.1;
const CUSUM_SLACK = 2.5;
const CUSUM_LIMIT = 25;
const CUSUM_ON: readonly SymptomId[] = ["pc", "head_ox", "k_valve", "k_cool", "k_inj_ox", "eta_c", "pc_ab", "p_tank_ox"];
const DETECTORS: readonly DetectorId[] = ["redline", "rate", "residual", "cusum", "multivariate", "ml", "hybrid"];
const VOTERS: readonly DetectorId[] = ["residual", "cusum", "multivariate", "ml"];
const HORIZONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
/** Lowest chamber pressure and highest coolant temperature rise allowed in mainstage, as fractions of expectation. */
const PC_LIMIT = 0.95;
const TCOOL_LIMIT = 1.08;
/** Smallest scatter a low-pressure residual is judged against, so a change of a few hundredths of a percent is not called a symptom. */
const SYMPTOM_FLOOR: Partial<Record<SymptomId, number>> = { p_tank_ox: 0.05, p_in_ox: 0.06 };
/** Throttle range the model was calibrated over. */
const ENVELOPE: readonly [number, number] = [0.58, 1.02];

/** Which model parameter each inferred parameter corresponds to, and the quantity its trend threatens. */
const DRIVES: Record<HealthParamId, { param: keyof PlantParams | null; concern: "pc" | "tCool" | "npsh" }> = {
  head_ox: { param: "headOx", concern: "pc" },
  head_fu: { param: "headFu", concern: "pc" },
  k_valve: { param: "kValveFu", concern: "tCool" },
  k_cool: { param: "kCool", concern: "tCool" },
  k_inj_ox: { param: "kInjOx", concern: "pc" },
  k_inj_fu: { param: "kInjFu", concern: "tCool" },
  eta_c: { param: "etaC", concern: "pc" },
  npsh_ox: { param: null, concern: "npsh" },
};

interface Detector {
  score: number;
  run: number;
  active: boolean;
  first: number | null;
  note?: string;
}

const percentile = (values: number[], p: number) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(p * values.length))];
const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
const std = (values: readonly number[]) => {
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / Math.max(1, values.length - 1));
};

export class TwinEngine implements TwinEngineApi {
  readonly historyStep = DT * HISTORY_EVERY;
  readonly historyLength = HISTORY;
  readonly evidence: ModelEvidence;
  /** The twin's model: identified from simulated test data, never copied from the physical system. */
  readonly model: PlantParams;
  exercise = false;

  private rng: Rng;
  private readonly seed: number;
  private k = 0;
  private mode: Exclude<EngineMode, "throttle"> = "mainstage";
  private u = 1;
  private target = 1;
  private base = 1;
  private exerciseClock = 0;
  private ignited = true;
  private truth: PlantState = coldState();
  private twin: PlantState = coldState();
  private wander = new Map<keyof PlantParams, number>();
  private faults = new Map<FaultId, ActiveFault>();
  private firstFaultAt: number | null = null;

  private truthValues = new Float64Array(N_CH);
  private obs = new Float64Array(N_CH);
  private obsPrev = new Float64Array(N_CH);
  private exp = new Float64Array(N_CH);
  private expPrev = new Float64Array(N_CH);
  private est = new Float64Array(N_CH);
  private variance = new Float64Array(N_CH);
  private noiseRatio = new Float64Array(N_CH).fill(1);
  private buffer = CHANNEL_IDS.map(() => new Float64Array(BUFFER));
  private replayData: Float64Array[] | null = null;
  private replayStart = 0;

  private pc = 100;
  private pcVariance = 0.01;
  private virtual = 100;
  private offA = 0;
  private offB = 0;
  private outA = false;
  private outB = false;
  private residualTrail: number[] = [];

  private activity = 0;
  private inflate = 1;
  private monitoring = true;
  private dev = zeroSymptoms();
  private z = zeroSymptoms();
  private g = zeroSymptoms();
  private healthDev = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0])) as Record<HealthParamId, number>;
  private cusum = new Map<SymptomId, [number, number]>();
  private det = Object.fromEntries(DETECTORS.map((id) => [id, { score: 0, run: 0, active: false, first: null }])) as Record<DetectorId, Detector>;
  private ranking: RankedDiagnosis[] = [];
  private evidenceLines: EvidenceLine[] = [];
  private explained: PhysicalDiagnosis = "nominal";
  private mlScore = 0;
  private outOfDistribution = false;
  private quality: TwinSnapshot["quality"] = { status: "GOOD", nodes: [], noisy: [], notes: [] };
  private prognosis!: Prognosis;
  private healthTrail = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, [] as number[]])) as Record<HealthParamId, number[]>;
  private trailTimes: number[] = [];
  private events: TwinEvent[] = [];
  private wasAnomaly = false;
  private isolated: DiagnosisId | null = null;
  private isolatingFor = 0;
  private lastQuality: DataQuality = "GOOD";

  private hist = { observed: CHANNEL_IDS.map(() => new Float32Array(HISTORY)), estimated: CHANNEL_IDS.map(() => new Float32Array(HISTORY)), expected: CHANNEL_IDS.map(() => new Float32Array(HISTORY)) };
  private histPc = new Float32Array(HISTORY);
  private histSigma = new Float32Array(HISTORY);
  private head = 0;

  // What a healthy run looks like: the baseline and scatter of every piece of evidence.
  private symptomSigma = Object.fromEntries(SYMPTOM_IDS.map((id) => [id, 1])) as Record<SymptomId, number>;
  private symptomBase = zeroSymptoms();
  private healthSigma = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0.01])) as Record<HealthParamId, number>;
  private healthBase = Object.fromEntries(HEALTH_PARAM_IDS.map((id) => [id, 0])) as Record<HealthParamId, number>;
  private channelSigma = new Float64Array(N_CH).fill(1);
  private channelBase = new Float64Array(N_CH);
  private offBaseA = 0;
  private offBaseB = 0;
  private voteGate = 1;
  private t2Limit = 60;
  private pca: PcaModel;
  private classifier: ClassifierReport;
  private collecting: { dev: number[][]; health: number[][]; residual: number[][]; offA: number[]; offB: number[]; spe: number[] } | null = null;

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
    this.classifier = { model: { weights: [] }, trainingSamples: 0, validationSamples: 0, trainingAccuracy: 0, validationAccuracy: 0, confusion: [] };
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
    this.rng = createRng(this.seed + 7);
    this.k = 0;
    this.mode = "mainstage";
    this.u = this.target = this.base = 1;
    this.exercise = false;
    this.exerciseClock = 0;
    this.ignited = true;
    this.faults.clear();
    this.firstFaultAt = null;
    this.wander.clear();
    const speed = scheduleSpeed(1);
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
    this.wasAnomaly = false;
    this.isolated = null;
    this.isolatingFor = 0;
    this.lastQuality = "GOOD";
    this.quality = { status: "GOOD", nodes: [], noisy: [], notes: [] };
    this.isolate();
    this.prognose();
  }

  inject(id: FaultId, severity = 0.8): void {
    const target = clamp(severity, 0.1, 1);
    const ramp = FAULT_DEFS[id].rampSeconds;
    this.faults.set(id, { id, target, severity: ramp === 0 ? target : (this.faults.get(id)?.severity ?? 0), since: this.t });
    this.firstFaultAt ??= this.t;
    this.log("injected", `Fault injected: ${DIAGNOSIS_BY_ID[id].name}`, id);
  }

  clear(id?: FaultId): void {
    const ids = id ? [id] : [...this.faults.keys()];
    for (const fault of ids) if (this.faults.delete(fault)) this.log("cleared", `Fault removed: ${DIAGNOSIS_BY_ID[fault].name}`, fault);
    if (this.faults.size === 0) {
      this.firstFaultAt = null;
      this.cusum.clear();
      for (const d of DETECTORS) this.det[d].first = null;
    }
  }

  setThrottle(level: number): void {
    this.base = this.target = clamp(level, 0.6, 1);
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
    for (let i = 0; i < count; i++) this.advance();
  }

  // ── One step ──────────────────────────────────────────────────────────────

  private severities(): Severities {
    const s: Severities = {};
    for (const fault of this.faults.values()) s[fault.id] = fault.severity;
    return s;
  }

  private command(): void {
    switch (this.mode) {
      case "ready":
        this.u = 0;
        this.ignited = false;
        break;
      case "start":
        this.u = Math.min(this.target, this.u + DT * 0.35);
        if (this.u > 0.12) this.ignited = true;
        if (this.u >= this.target) this.mode = "mainstage";
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

  private advance(): void {
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
    const actual = applyPhysicalFaults(system, sev);
    writeOutputs(actual, this.truth, stepPlant(actual, this.truth, speed, this.ignited, DT), this.truthValues);

    // Sensors, then the path the samples travel before the twin sees them.
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
    this.obsPrev.set(this.obs);
    for (let i = 0; i < N_CH; i++) {
      const late = delay + (CHANNELS[i].node === SKEWED_NODE ? skew : 0);
      this.obs[i] = this.replayData ? this.replayData[i][(k - this.replayStart) % REPLAY_STEPS] : this.buffer[i][(k - late + BUFFER * 2) % BUFFER];
    }

    // Expected: the model, driven by the same commands.
    this.expPrev.set(this.exp);
    writeOutputs(this.model, this.twin, stepPlant(this.model, this.twin, speed, this.ignited, DT), this.exp);
    const moved = Math.abs(this.exp[CH.pcA] - this.expPrev[CH.pcA]) / DT;
    this.activity = Math.max(moved, this.activity * Math.exp(-DT / 0.5));
    this.inflate = 1 + 0.5 * this.activity;
    const steady = this.activity < 0.5;
    this.monitoring = this.mode === "mainstage" && this.ignited && this.exp[CH.mOx] > 35;

    // Estimated: each measurement is predicted by the model's own change, then corrected by what arrived.
    for (let i = 0; i < N_CH; i++) {
      const sigma = CHANNELS[i].sigma;
      const step = this.exp[i] - this.expPrev[i];
      if (steady) {
        const jump = this.obs[i] - this.obsPrev[i] - step;
        this.noiseRatio[i] += 0.04 * ((jump * jump) / (2 * sigma * sigma) - this.noiseRatio[i]);
      }
      const predicted = this.est[i] + step;
      const p = this.variance[i] + (0.12 * sigma) ** 2;
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
    if (k % 10 === 0) this.prognose();
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

  /** A channel's residual against its healthy baseline, in standard deviations, with the transient allowance applied. */
  private residualZ(i: number): number {
    return (this.est[i] - this.exp[i] - this.channelBase[i]) / (this.channelSigma[i] * this.inflate);
  }

  /** An inferred parameter's departure from its healthy baseline, as a fraction. */
  private health(id: HealthParamId): number {
    return this.healthDev[id] - this.healthBase[id];
  }

  /** Share of an inferred parameter's action limit that is used up, 0–1. Scatter inside three standard deviations counts as none. */
  private used(id: HealthParamId): number {
    const limit = HEALTH_PARAMS.find((h) => h.id === id)!.limit;
    const noise = 3 * this.healthSigma[id];
    const toward = this.health(id) * Math.sign(limit);
    return clamp01((toward - noise) / Math.max(1e-6, Math.abs(limit) - noise));
  }

  /** Chamber pressure from two sensors and a virtual one, with a vote on which sensors to believe. */
  private fuseChamber(): void {
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
    if (!this.outA) update(this.obs[CH.pcA], r);
    if (!this.outB) update(this.obs[CH.pcB], r);
    if (this.outA && this.outB) update(this.virtual, 0.25);
    this.pc = x;
    this.pcVariance = p;
  }

  private assessQuality(sev: Severities, steady: boolean): void {
    const latency = 18 + transportDelaySteps(sev) * DT * 1000;
    const skew = clockSkewSteps(sev) * DT * 1000;
    const nodes = (["feed", "turbo", "chamber"] as const).map((node) => ({ node, latencyMs: latency, skewMs: node === SKEWED_NODE ? skew : 0, sequenceOk: !this.replayData }));
    const noisy = CHANNEL_IDS.filter((_, i) => this.noiseRatio[i] > 5);
    const notes: string[] = [];
    if (this.replayData) notes.push("Sequence counters are repeating: the stream is a replay of earlier data.");
    if (latency > 120) notes.push(`Telemetry is arriving ${Math.round(latency)} ms after it was sampled.`);
    if (skew > 40) notes.push(`The turbomachinery node's clock is ${Math.round(skew)} ms off the reference.`);
    for (const id of noisy) notes.push(`${CHANNELS[CH[id]].label}: noise is ${Math.sqrt(this.noiseRatio[CH[id]]).toFixed(1)}× its calibrated level.`);
    const status: DataQuality = this.replayData ? "BAD" : notes.length ? "DEGRADED" : "GOOD";
    this.quality = { status, nodes, noisy, notes };
    if (status !== this.lastQuality) {
      if (status !== "GOOD") this.log("data", `Data quality ${status}: ${notes[0]}`);
      this.lastQuality = status;
    }
    void steady;
  }

  private detect(steady: boolean): void {
    const set = (id: DetectorId, score: number, counted = true, note?: string) => {
      const d = this.det[id];
      d.score = Math.max(0, score);
      d.run = counted && score >= 1 ? d.run + 1 : 0;
      d.active = d.run >= DEBOUNCE;
      d.note = note;
      if (d.active && d.first === null && this.firstFaultAt !== null) d.first = this.t - this.firstFaultAt;
    };
    if (!this.monitoring) {
      for (const id of DETECTORS) set(id, 0, false, "Held: the engine is not in mainstage");
      this.mlScore = 0;
      this.outOfDistribution = false;
      return;
    }
    let worst = 0;
    for (let i = 0; i < N_CH; i++) worst = Math.max(worst, Math.abs(this.residualZ(i)));
    set("residual", worst / 5);

    let sum = 0;
    for (const id of CUSUM_ON) {
      const c = this.cusum.get(id) ?? [0, 0];
      c[0] = clamp(c[0] + this.z[id] - CUSUM_SLACK, 0, 3 * CUSUM_LIMIT);
      c[1] = clamp(c[1] - this.z[id] - CUSUM_SLACK, 0, 3 * CUSUM_LIMIT);
      this.cusum.set(id, c);
      sum = Math.max(sum, c[0], c[1]);
    }
    set("cusum", sum / CUSUM_LIMIT);

    let t2 = 0;
    for (const id of SYMPTOM_IDS) t2 += this.z[id] * this.z[id];
    set("multivariate", t2 / this.t2Limit);

    // The learned detector saw only steady running, so a transient is outside what it knows.
    this.outOfDistribution = !steady || this.u < ENVELOPE[0] || this.u > ENVELOPE[1];
    this.mlScore = this.pca.components.length ? reconstructionError(this.pca, this.obs) / this.pca.threshold : 0;
    set("ml", this.mlScore, !this.outOfDistribution, this.outOfDistribution ? "Outside its training conditions: not counted" : undefined);

    const expPc = this.exp[CH.pcA];
    const npsh = npshRatio(this.est);
    const expNpsh = npshRatio(this.exp);
    set(
      "redline",
      Math.max(
        (expPc - this.pc) / ((1 - PC_LIMIT) * expPc),
        (this.pc - expPc) / (0.08 * expPc),
        (this.est[CH.tCool] - this.exp[CH.tCool]) / ((TCOOL_LIMIT - 1) * this.exp[CH.tCool]),
        (expNpsh - npsh) / (expNpsh - 1),
        (this.est[CH.vib] - this.exp[CH.vib]) / (0.8 * this.exp[CH.vib]),
      ),
    );

    this.residualTrail.push(this.pc - expPc);
    if (this.residualTrail.length > 6) this.residualTrail.shift();
    const rate = this.residualTrail.length > 5 ? (this.residualTrail[5] - this.residualTrail[0]) / (5 * DT) : 0;
    set("rate", Math.abs(rate) / (5 * this.inflate));

    const votes = VOTERS.filter((id) => this.det[id].active).length;
    const scores = VOTERS.map((id) => this.det[id].score).sort((a, b) => b - a);
    const hybrid = this.det.hybrid;
    hybrid.score = Math.max(scores[1], this.det.redline.score);
    hybrid.active = votes >= 2 || this.det.redline.active || this.quality.status === "BAD";
    if (hybrid.active && hybrid.first === null && this.firstFaultAt !== null) hybrid.first = this.t - this.firstFaultAt;
  }

  private isolate(): void {
    const physics = physicsProbabilities(this.g);
    const learned = predictProbabilities(this.classifier.model, symptomArray(this.g));
    const ml = Object.fromEntries(PHYSICAL_DIAGNOSES.map((d, i) => [d, learned[i]])) as Record<PhysicalDiagnosis, number>;
    const node = this.quality.nodes[0];
    const data: Partial<Record<DataDiagnosis, number>> = {
      telemetry_replay: this.replayData ? 0.97 : 0,
      packet_delay: node ? clamp01((node.latencyMs - 100) / 200) * 0.95 : 0,
      timestamp_error: clamp01(((this.quality.nodes.find((n) => n.node === SKEWED_NODE)?.skewMs ?? 0) - 40) / 120) * 0.95,
      sensor_noise: clamp01((this.noiseRatio[CH.pOutOx] - 4) / 12) * 0.9,
    };
    this.ranking = fuseEvidence(physics, ml, data);
    this.explained = (this.ranking.find((r) => r.physics !== null)?.id ?? "nominal") as PhysicalDiagnosis;
    this.evidenceLines = explain(this.explained, this.g);
  }

  private prognose(): void {
    const t = this.t;
    this.trailTimes.push(t);
    if (this.trailTimes.length > 40) this.trailTimes.shift();
    let driver: HealthParamId | null = null;
    let worst = 0;
    const used = (id: HealthParamId) => this.used(id);
    for (const id of HEALTH_PARAM_IDS) {
      this.healthTrail[id].push(this.health(id));
      if (this.healthTrail[id].length > 40) this.healthTrail[id].shift();
      if (used(id) > worst && Math.abs(this.health(id)) > 4 * this.healthSigma[id]) {
        worst = used(id);
        driver = id;
      }
    }
    const trend = driver ? fitTrend(this.trailTimes, this.healthTrail[driver]) : { slope: 0, level: 0, slopeError: 0, scatter: 0 };
    const speed = scheduleSpeed(this.u);
    // How much chamber pressure and coolant temperature move per unit change of the driving parameter, from the model.
    let sPc = 0;
    let sT = 0;
    const param = driver ? DRIVES[driver].param : null;
    if (param) {
      const base = steadyState(this.model, speed);
      const bumped = steadyState({ ...this.model, [param]: this.model[param] * 1.02 }, speed);
      sPc = (bumped.state.pc - base.state.pc) / 0.02;
      sT = (bumped.state.tCool - base.state.tCool) / 0.02;
    }
    const project = (now: number, sensitivity: number, floor: number): ProjectionPoint[] =>
      HORIZONS.map((h) => ({ horizon: h, mean: now + sensitivity * trend.slope * h, sigma: Math.sqrt(floor * floor + (sensitivity * trend.scatter) ** 2 + (sensitivity * trend.slopeError * h) ** 2 + (0.06 * floor) ** 2 * h * h) }));
    const chamber = project(this.pc, sPc, 0.3);
    const concern = driver ? DRIVES[driver].concern : "pc";
    const expPc = this.exp[CH.pcA];
    const expT = this.exp[CH.tCool];
    const view =
      concern === "tCool"
        ? { quantity: "Coolant temperature rise", unit: "% ref", now: this.est[CH.tCool], limit: TCOOL_LIMIT * expT, below: false, points: project(this.est[CH.tCool], sT, 0.8), healthy: expT }
        : concern === "npsh"
          ? { quantity: "Oxidiser pump suction margin", unit: "× required", now: npshRatio(this.est), limit: 1, below: true, points: project(npshRatio(this.est), npshRatio(this.exp), 0.03), healthy: npshRatio(this.exp) }
          : { quantity: "Chamber pressure", unit: "% Pc,ref", now: this.pc, limit: PC_LIMIT * expPc, below: true, points: chamber, healthy: expPc };
    const outlook = thresholdOutlook(view.points, view.limit, view.below);
    const top = this.ranking[0]?.id ?? "nominal";
    const urgency = outlook.timeToLimit === null ? "No limit is projected to be reached within the next minute." : outlook.timeToLimit <= 0 ? "The limit has been reached." : `The central projection reaches the limit in about ${Math.round(outlook.timeToLimit)} s.`;
    this.prognosis = {
      driver,
      quantity: view.quantity,
      unit: view.unit,
      now: view.now,
      limit: view.limit,
      below: view.below,
      points: view.points,
      outlook,
      chamber,
      margin: 100 * clamp01((view.below ? view.now - view.limit : view.limit - view.now) / Math.abs(view.healthy - view.limit)),
      healthIndex: 100 * (1 - Math.max(...HEALTH_PARAM_IDS.map(used))),
      rate: trend.slope,
      rateError: trend.slopeError,
      recommendation: this.monitoring ? `${DIAGNOSIS_BY_ID[top].investigation} ${top === "nominal" ? "" : urgency}`.trim() : "Health assessment is held until the engine is in mainstage.",
    };
  }

  private track(): void {
    const anomaly = this.det.hybrid.active;
    if (anomaly && !this.wasAnomaly) {
      const by = DETECTORS.filter((id) => id !== "hybrid" && this.det[id].active);
      this.log("detected", `Anomaly detected${by.length ? ` by ${by.join(", ")}` : ": data integrity check"}`);
    }
    this.wasAnomaly = anomaly;
    const top = this.ranking[0];
    if (top && top.id !== "nominal" && top.p >= 0.6) {
      this.isolatingFor = this.isolated === top.id ? 0 : this.isolatingFor + 1;
      if (this.isolated !== top.id && this.isolatingFor >= 20) {
        this.isolated = top.id;
        this.isolatingFor = 0;
        this.log("isolated", `Probable cause: ${DIAGNOSIS_BY_ID[top.id].name} (${Math.round(top.p * 100)} %)`, top.id);
      }
    } else {
      this.isolatingFor = 0;
      if (top?.id === "nominal" && top.p > 0.8) this.isolated = null;
    }
  }

  private log(kind: TwinEvent["kind"], text: string, id?: DiagnosisId): void {
    if (this.collecting) return;
    this.events.push({ t: this.t, kind, text, id });
    if (this.events.length > 40) this.events.shift();
  }

  /** Runs a healthy mainstage with throttle changes and measures the nominal scatter of every piece of evidence. */
  private calibrate(): void {
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

  // ── Read-out ──────────────────────────────────────────────────────────────

  series(kind: SeriesKind, channel: ChannelId): number[] {
    const source = this.hist[kind][CH[channel]];
    return Array.from({ length: HISTORY }, (_, i) => source[(this.head + 1 + i) % HISTORY]);
  }

  chamberSeries(): { estimated: number[]; sigma: number[] } {
    const order = (source: Float32Array) => Array.from({ length: HISTORY }, (_, i) => source[(this.head + 1 + i) % HISTORY]);
    return { estimated: order(this.histPc), sigma: order(this.histSigma) };
  }

  snapshot(): TwinSnapshot {
    const channels = {} as Record<ChannelId, ChannelReading>;
    CHANNEL_IDS.forEach((id, i) => {
      const residual = this.est[i] - this.exp[i];
      channels[id] = { observed: this.obs[i], estimated: this.est[i], expected: this.exp[i], residual, z: this.monitoring ? this.residualZ(i) : 0, sigma: Math.sqrt(this.variance[i]) };
    });
    const health: HealthReading[] = HEALTH_PARAMS.map((h) => ({ id: h.id, deviation: this.health(h.id), z: this.health(h.id) / this.healthSigma[h.id], used: this.used(h.id) }));
    const detectors: DetectorReading[] = DETECTORS.map((id) => ({ id, score: this.det[id].score, active: this.det[id].active, latency: this.det[id].first, note: this.det[id].note }));
    const top = this.ranking[0];
    const confidence: Confidence = top.p >= 0.8 ? "HIGH" : top.p >= 0.55 ? "MEDIUM" : "LOW";
    const anomaly = this.det.hybrid.active;
    const index = this.prognosis.healthIndex;
    const level: Level = !this.monitoring ? "NOMINAL" : this.det.redline.active || index < 40 ? "ACTION" : index < 70 ? "DEGRADED" : anomaly || index < 90 ? "MONITOR" : "NOMINAL";
    const inEnvelope = this.u >= ENVELOPE[0] && this.u <= ENVELOPE[1];
    const modelConfidence: Confidence = !this.monitoring || this.quality.status === "BAD" ? "LOW" : this.inflate > 1.5 || this.quality.status === "DEGRADED" || !inEnvelope ? "MEDIUM" : "HIGH";
    const mode: EngineMode = this.mode === "mainstage" && (Math.abs(this.u - 1) > 0.02 || this.inflate > 1.5) ? "throttle" : this.mode;
    return {
      t: this.t,
      mode,
      throttle: this.u,
      monitoring: this.monitoring,
      transientFactor: this.inflate,
      channels,
      chamber: { estimated: this.pc, sigma: Math.sqrt(this.pcVariance) * this.inflate, expected: this.exp[CH.pcA], virtual: this.virtual, sensorA: this.outA ? "voted out" : "in use", sensorB: this.outB ? "voted out" : "in use" },
      symptoms: { ...this.g } as Symptoms,
      symptomZ: { ...this.z },
      health,
      detectors,
      anomaly,
      ranking: this.ranking,
      confidence,
      evidence: this.evidenceLines,
      explained: this.explained,
      quality: this.quality,
      anomalyScore: { ml: this.mlScore, physics: this.det.multivariate.score, outOfDistribution: this.outOfDistribution },
      prognosis: this.prognosis,
      status: {
        engine: mode.toUpperCase(),
        twin: !this.monitoring ? "HOLDING" : this.quality.status !== "GOOD" ? "DATA SUSPECT" : this.inflate > 1.5 ? "TRACKING TRANSIENT" : "SYNCHRONISED",
        dataQuality: this.quality.status,
        modelConfidence,
        health: level,
        anomalies: detectors.filter((d) => d.active && d.id !== "hybrid").length,
      },
      faults: [...this.faults.values()].map((f) => ({ ...f })),
      events: [...this.events],
      chain: this.chain(confidence),
    };
  }

  /** The causal chain of the leading fault, from what physically changed to what an engineer should go and check. */
  private chain(confidence: Confidence): ChainStage[] {
    const fault = [...this.faults.values()].sort((a, b) => a.since - b.since)[0];
    const top = this.ranking[0];
    const worst = CHANNEL_IDS.map((id, i) => ({ id, z: this.residualZ(i) })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0];
    const flagged = this.det.hybrid.active || this.quality.status !== "GOOD";
    const active = DETECTORS.filter((id) => id !== "hybrid" && this.det[id].active);
    const found = top.id !== "nominal" && top.p >= 0.5;
    const o = this.prognosis.outlook;
    return [
      { id: "effect", label: "Physical effect", reached: Boolean(fault && fault.severity > 0.01), text: fault ? DIAGNOSIS_BY_ID[fault.id].effect : "No fault is active. Inject one to follow it through the twin." },
      { id: "sensor", label: "Sensor response", reached: Boolean(fault) && Math.abs(worst.z) > 2, text: `Largest departure: ${CHANNELS[CH[worst.id]].label.toLowerCase()}, ${worst.z >= 0 ? "+" : "−"}${Math.abs(worst.z).toFixed(1)} σ from expectation.` },
      { id: "residual", label: "Residual", reached: this.det.residual.score >= 0.6 || this.det.multivariate.score >= 0.6, text: `Residual statistic at ${Math.round(100 * Math.max(this.det.residual.score, this.det.multivariate.score))} % of its alarm threshold.` },
      { id: "detection", label: "Detection", reached: flagged, text: flagged ? (active.length ? `Declared by: ${active.join(", ")}.` : `Flagged by the data-quality layer. ${this.quality.notes[0] ?? ""}`.trim()) : "No anomaly declared. Two independent detectors, or one redline, are required." },
      { id: "isolation", label: "Isolation", reached: found, text: found ? `${DIAGNOSIS_BY_ID[top.id].name}, at ${DIAGNOSIS_BY_ID[top.id].location.toLowerCase()}.` : "No cause isolated yet." },
      { id: "confidence", label: "Confidence", reached: found, text: found ? `${Math.round(top.p * 100)} % (${confidence}). Physics-based and learned evidence ${top.physics !== null && top.ml !== null && Math.abs(top.physics - top.ml) < 0.35 ? "agree" : "are reconciled by direct checks"}.` : "Not applicable until a cause is isolated." },
      { id: "prediction", label: "Prediction", reached: found && this.prognosis.driver !== null, text: `${this.prognosis.quantity}: ${Math.round(o.probability * 100)} % probability of being beyond its limit in 60 s.` },
      { id: "investigation", label: "Recommended engineering investigation", reached: found, text: found ? DIAGNOSIS_BY_ID[top.id].investigation : "None." },
    ];
  }
}

export const createTwinEngine = (seed?: number): TwinEngineApi => new TwinEngine(seed);
export { DATA_DIAGNOSES };
