// The Digital Twin, end to end. TwinCore runs the loop that turns telemetry
// into evidence; this class interprets the evidence and reports it:
//
//   residuals and inferred parameters → detection → isolation
//     → prognosis (predicted) → decision support
import { CH, CHANNELS, CHANNEL_IDS, type ChannelId, N_CH, clamp, clamp01 } from "./channels";
import { SKEWED_NODE } from "./faults";
import { DIAGNOSIS_BY_ID, type DataDiagnosis, PHYSICAL_DIAGNOSES, type PhysicalDiagnosis, SYMPTOM_IDS, type Symptoms, explain, fuseEvidence, physicsProbabilities } from "./isolation";
import { predictProbabilities, reconstructionError } from "./ml";
import { scheduleSpeed, steadyState } from "./plant";
import { type ProjectionPoint, fitTrend, thresholdOutlook } from "./prognostics";
import { HEALTH_PARAMS, HEALTH_PARAM_IDS, type HealthParamId, npshRatio, symptomArray } from "./symptoms";
import type { ChainStage, ChannelReading, Confidence, DetectorId, DetectorReading, EngineMode, HealthReading, Level, SeriesKind, TwinEngineApi, TwinSnapshot } from "./twinTypes";

import { CUSUM_LIMIT, CUSUM_ON, CUSUM_SLACK, DEBOUNCE, DETECTORS, DRIVES, DT, ENVELOPE, HISTORY, HORIZONS, PC_LIMIT, TCOOL_LIMIT, TwinCore, VOTERS } from "./twinCore";

export class TwinEngine extends TwinCore implements TwinEngineApi {
  protected detect(steady: boolean): void {
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

  protected isolate(): void {
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

  protected prognose(): void {
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

  protected track(): void {
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
  protected chain(confidence: Confidence): ChainStage[] {
    const fault = [...this.faults.values()].sort((a, b) => a.since - b.since)[0];
    const top = this.ranking[0];
    const worst = CHANNEL_IDS.map((id, i) => ({ id, z: this.residualZ(i) })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0];
    const flagged = this.det.hybrid.active || this.quality.status !== "GOOD";
    const residualScore = Math.max(this.det.residual.score, this.det.multivariate.score);
    const active = DETECTORS.filter((id) => id !== "hybrid" && this.det[id].active);
    const found = top.id !== "nominal" && top.p >= 0.5;
    const o = this.prognosis.outlook;
    return [
      { id: "effect", label: "Physical effect", reached: Boolean(fault && fault.severity > 0.01), text: fault ? DIAGNOSIS_BY_ID[fault.id].effect : "No fault is active. Inject one to follow it through the twin." },
      { id: "sensor", label: "Sensor response", reached: Boolean(fault) && Math.abs(worst.z) > 2, text: `Largest departure: ${CHANNELS[CH[worst.id]].label.toLowerCase()}, ${worst.z >= 0 ? "+" : "−"}${Math.abs(worst.z).toFixed(1)} σ from expectation.` },
      { id: "residual", label: "Residual", reached: this.det.residual.score >= 0.6 || this.det.multivariate.score >= 0.6, text: residualScore >= 10 ? "Residual statistic more than ten times its alarm threshold." : `Residual statistic at ${Math.round(100 * residualScore)} % of its alarm threshold.` },
      { id: "detection", label: "Detection", reached: flagged, text: flagged ? (active.length ? `Declared by: ${active.join(", ")}.` : `Flagged by the data-quality layer. ${this.quality.notes[0] ?? ""}`.trim()) : "No anomaly declared. Two independent detectors, or one redline, are required." },
      { id: "isolation", label: "Isolation", reached: found, text: found ? `${DIAGNOSIS_BY_ID[top.id].name}, at ${DIAGNOSIS_BY_ID[top.id].location.toLowerCase()}.` : "No cause isolated yet." },
      { id: "confidence", label: "Confidence", reached: found, text: found ? `${Math.round(top.p * 100)} % (${confidence}). Physics-based and learned evidence ${top.physics !== null && top.ml !== null && Math.abs(top.physics - top.ml) < 0.35 ? "agree" : "are reconciled by direct checks"}.` : "Not applicable until a cause is isolated." },
      { id: "prediction", label: "Prediction", reached: found && this.prognosis.driver !== null, text: `${this.prognosis.quantity}: ${Math.round(o.probability * 100)} % probability of being beyond its limit in 60 s.` },
      { id: "investigation", label: "Recommended engineering investigation", reached: found, text: found ? DIAGNOSIS_BY_ID[top.id].investigation : "None." },
    ];
  }
}

export const createTwinEngine = (seed?: number): TwinEngineApi => new TwinEngine(seed);
