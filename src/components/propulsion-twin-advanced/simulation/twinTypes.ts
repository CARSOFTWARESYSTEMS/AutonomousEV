// What the Digital Twin reports, as plain data. Only types: importing this
// file never pulls the simulation into a bundle.
import type { ChannelId, DaqNode } from "./channels";
import type { DiagnosisId, EvidenceLine, FaultId, PhysicalDiagnosis, RankedDiagnosis, SymptomId } from "./isolation";
import type { CalibrationReport } from "./ml";
import type { ProjectionPoint, ThresholdOutlook } from "./prognostics";
import type { HealthParamId } from "./symptoms";

export type EngineMode = "ready" | "start" | "mainstage" | "throttle" | "shutdown";
export type Level = "NOMINAL" | "MONITOR" | "DEGRADED" | "ACTION";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type DataQuality = "GOOD" | "DEGRADED" | "BAD";
export type SensorVote = "in use" | "voted out";

export interface ChannelReading {
  observed: number;
  estimated: number;
  expected: number;
  /** The residual the twin judges: estimated minus expected, so sensor noise is already filtered out of it. */
  residual: number;
  /** The unfiltered residual: observed minus expected. */
  rawResidual: number;
  /** The residual in standard deviations of its nominal scatter. */
  z: number;
  /** One standard deviation of the estimate. */
  sigma: number;
}

export type DetectorId = "redline" | "rate" | "residual" | "cusum" | "multivariate" | "ml" | "hybrid";

export interface DetectorReading {
  id: DetectorId;
  /** Statistic over its threshold: 1 or more is an alarm. */
  score: number;
  active: boolean;
  /** Seconds from the first fault injection to this detector's first alarm; null until it fires. */
  latency: number | null;
  note?: string;
}

export interface HealthReading {
  id: HealthParamId;
  /** Fractional departure from the calibrated value. */
  deviation: number;
  z: number;
  /** Share of the action limit used, 0–1. */
  used: number;
}

export interface NodeQuality {
  node: DaqNode;
  latencyMs: number;
  skewMs: number;
  sequenceOk: boolean;
}

export interface Prognosis {
  driver: HealthParamId | null;
  /** The quantity the outlook is about, its unit, its value now and its limit. */
  quantity: string;
  unit: string;
  now: number;
  limit: number;
  below: boolean;
  points: ProjectionPoint[];
  outlook: ThresholdOutlook;
  /** Chamber pressure projected over the same horizon, for the chamber pressure chart. */
  chamber: ProjectionPoint[];
  /** Margin to the limit that is left, 0–100 % of the healthy margin. */
  margin: number;
  /** 100 healthy – 0 at the action limit, from the worst inferred parameter. */
  healthIndex: number;
  /** Change of the driving parameter per second, with its standard error. */
  rate: number;
  rateError: number;
  recommendation: string;
}

export interface TwinEvent {
  t: number;
  kind: "injected" | "cleared" | "detected" | "isolated" | "sensor" | "data" | "mode";
  text: string;
  id?: DiagnosisId;
}

/**
 * The consistency check behind a named cause: is there a modelled fault which,
 * at some severity, accounts for the residuals? A classifier always answers
 * with one of the classes it knows. This check is what says "none of them".
 */
export interface Recognition {
  /**
   * idle: nothing to explain. held: cannot be judged now (data suspect, or the engine is not in steady mainstage).
   * explained: a modelled fault accounts for the residuals. unexplained: none does at this moment.
   * unrecognised: none has for long enough to say the cause is outside the modelled set.
   */
  status: "idle" | "held" | "explained" | "unexplained" | "unrecognised";
  /** Largest residual left once the best-fitting modelled fault is taken out, over the residual alarm threshold. Below 1 is explained. */
  score: number;
  /** The modelled fault that fits best, and the severity at which it fits, 0–1. */
  fault: Exclude<PhysicalDiagnosis, "nominal"> | null;
  severity: number;
  /** The channel with the largest leftover residual. */
  channel: ChannelId | null;
}

export type ChainStageId = "effect" | "sensor" | "residual" | "detection" | "isolation" | "confidence" | "prediction" | "investigation";

export interface ChainStage {
  id: ChainStageId;
  label: string;
  reached: boolean;
  text: string;
}

/** How a fault arrives: growing over its ramp time, or present at full severity from one sample to the next. */
export type FaultOnset = "gradual" | "abrupt";

export interface ActiveFault {
  id: FaultId;
  severity: number;
  target: number;
  since: number;
  onset: FaultOnset;
}

export interface TwinSnapshot {
  t: number;
  mode: EngineMode;
  /** Commanded throttle, 0–1. */
  throttle: number;
  /** False while the engine is starting, stopping or stopped: health checks are held. */
  monitoring: boolean;
  /** How much the residual uncertainty is widened right now because the engine is in a transient (1 = steady). */
  transientFactor: number;
  channels: Record<ChannelId, ChannelReading>;
  chamber: { estimated: number; sigma: number; expected: number; virtual: number; sensorA: SensorVote; sensorB: SensorVote };
  /** Graded symptoms (−1 to 1) and the standard deviations behind them. */
  symptoms: Record<SymptomId, number>;
  symptomZ: Record<SymptomId, number>;
  health: HealthReading[];
  detectors: DetectorReading[];
  anomaly: boolean;
  ranking: RankedDiagnosis[];
  confidence: Confidence;
  /** Why the leading diagnosis: evidence for and against it. */
  evidence: EvidenceLine[];
  /** The physical candidate the evidence lines refer to. */
  explained: PhysicalDiagnosis;
  /** Whether the residuals are accounted for by a fault the twin has a model of. */
  recognition: Recognition;
  quality: { status: DataQuality; nodes: NodeQuality[]; noisy: ChannelId[]; /** Channels that delivered no usable sample this step. */ missing: ChannelId[]; /** Channels whose reading has stopped changing. */ frozen: ChannelId[]; notes: string[] };
  anomalyScore: { ml: number; physics: number; outOfDistribution: boolean };
  prognosis: Prognosis;
  status: { engine: string; twin: string; dataQuality: DataQuality; modelConfidence: Confidence; health: Level; anomalies: number };
  faults: ActiveFault[];
  events: TwinEvent[];
  chain: ChainStage[];
}

export interface ModelEvidence {
  /** Samples of simulated test data used to identify parameters. */
  identificationSamples: number;
  /** Mean model error across pressure channels before and after identification, % of reference chamber pressure. */
  errorBefore: number;
  errorAfter: number;
  classifier: { trainingSamples: number; validationSamples: number; trainingAccuracy: number; validationAccuracy: number; confusion: number[][]; calibration: CalibrationReport; classes: readonly PhysicalDiagnosis[] };
  anomaly: { trainingSamples: number; components: number; explained: number };
}

export type SeriesKind = "observed" | "estimated" | "expected";

/** The part of the engine the interface uses. */
export interface TwinEngineApi {
  readonly evidence: ModelEvidence;
  step(count?: number): void;
  snapshot(): TwinSnapshot;
  /** The last few seconds of one channel, oldest first. */
  series(kind: SeriesKind, channel: ChannelId): number[];
  /** Fused chamber pressure and its one-sigma, oldest first. */
  chamberSeries(): { estimated: number[]; sigma: number[] };
  /** Seconds between history samples, and how many are kept. */
  readonly historyStep: number;
  readonly historyLength: number;
  /** Adds a fault to whatever is already active. Severity outside 0.1–1 is clamped; a value that is not a number is ignored. */
  inject(id: FaultId, severity?: number, onset?: FaultOnset): void;
  /** Runs one fault as a scenario: if the twin is not at its healthy baseline, the run restarts from it (keeping the throttle setting) before the fault is injected. */
  scenario(id: FaultId, severity?: number, onset?: FaultOnset): void;
  clear(id?: FaultId): void;
  setThrottle(level: number): void;
  setExercise(on: boolean): void;
  readonly exercise: boolean;
  start(): void;
  shutdown(): void;
  reset(): void;
}
