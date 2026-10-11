// What the Digital Twin reports, as plain data. Only types: importing this
// file never pulls the simulation into a bundle.
import type { ChannelId, DaqNode } from "./channels";
import type { DiagnosisId, EvidenceLine, FaultId, PhysicalDiagnosis, RankedDiagnosis, SymptomId } from "./isolation";
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
  /** Estimated minus expected. */
  residual: number;
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

export type ChainStageId = "effect" | "sensor" | "residual" | "detection" | "isolation" | "confidence" | "prediction" | "investigation";

export interface ChainStage {
  id: ChainStageId;
  label: string;
  reached: boolean;
  text: string;
}

export interface ActiveFault {
  id: FaultId;
  severity: number;
  target: number;
  since: number;
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
  quality: { status: DataQuality; nodes: NodeQuality[]; noisy: ChannelId[]; notes: string[] };
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
  classifier: { trainingSamples: number; validationSamples: number; trainingAccuracy: number; validationAccuracy: number; confusion: number[][]; classes: readonly PhysicalDiagnosis[] };
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
  inject(id: FaultId, severity?: number): void;
  clear(id?: FaultId): void;
  setThrottle(level: number): void;
  setExercise(on: boolean): void;
  readonly exercise: boolean;
  start(): void;
  shutdown(): void;
  reset(): void;
}
