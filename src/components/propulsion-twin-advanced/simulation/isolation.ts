// Fault isolation by evidence: which symptoms a fault should produce, how well
// the observed symptoms match each candidate, and why. Pure functions with no
// simulation state, so the same reasoning serves the live twin, the fault tree
// and the hand-driven diagnostic panel.
//
// A symptom is graded from −1 (clearly low) through 0 (as expected) to +1
// (clearly high). A fault's pattern says what each symptom should be.

export const SYMPTOM_IDS = [
  "pc",
  "pc_ab",
  "thrust",
  "head_ox",
  "p_tank_ox",
  "p_in_ox",
  "p_out_ox",
  "k_valve",
  "valve_pos",
  "p_out_fu",
  "k_cool",
  "t_cool",
  "k_inj_ox",
  "m_ox",
  "m_fu",
  "speed",
  "vib",
  "eta_c",
] as const;

export type SymptomId = (typeof SYMPTOM_IDS)[number];
export type Symptoms = Record<SymptomId, number>;

export interface SymptomDef {
  id: SymptomId;
  /** What is being compared with its expectation. */
  label: string;
  low: string;
  high: string;
  normal: string;
  /** Whether the evidence is a direct measurement, a redundancy check or a parameter the twin estimates. */
  source: "measurement" | "redundancy" | "estimated parameter";
}

export const SYMPTOMS: readonly SymptomDef[] = [
  { id: "pc", label: "Chamber pressure (fused estimate)", low: "Chamber pressure below expectation", high: "Chamber pressure above expectation", normal: "Chamber pressure as expected", source: "measurement" },
  { id: "pc_ab", label: "Chamber sensors A and B", low: "Sensor A reads below sensor B", high: "Sensor A reads above sensor B", normal: "Sensors A and B agree", source: "redundancy" },
  { id: "thrust", label: "Thrust proxy", low: "Thrust proxy below expectation", high: "Thrust proxy above expectation", normal: "Thrust proxy as expected", source: "measurement" },
  { id: "head_ox", label: "Oxidiser pump head coefficient", low: "Pump delivers less pressure rise than its speed and flow predict", high: "Pump delivers more pressure rise than predicted", normal: "Pump pressure rise matches its speed and flow", source: "estimated parameter" },
  { id: "p_tank_ox", label: "Oxidiser tank pressure", low: "Tank pressure below expectation", high: "Tank pressure above expectation", normal: "Tank pressure nominal", source: "measurement" },
  { id: "p_in_ox", label: "Oxidiser pump inlet pressure", low: "Pump inlet pressure below expectation", high: "Pump inlet pressure above expectation", normal: "Pump inlet pressure nominal", source: "measurement" },
  { id: "p_out_ox", label: "Oxidiser pump discharge pressure", low: "Pump discharge pressure below expectation", high: "Pump discharge pressure above expectation", normal: "Pump discharge pressure nominal", source: "measurement" },
  { id: "k_valve", label: "Main fuel valve loss coefficient", low: "Valve passes flow more easily than calibrated", high: "Valve pressure drop is high for the flow passing", normal: "Valve pressure drop matches the flow", source: "estimated parameter" },
  { id: "valve_pos", label: "Main fuel valve position", low: "Valve position below its command", high: "Valve position above its command", normal: "Valve position follows its command", source: "measurement" },
  { id: "p_out_fu", label: "Fuel pump discharge pressure", low: "Fuel pump discharge pressure below expectation", high: "Fuel pump discharge pressure above expectation", normal: "Fuel pump discharge pressure nominal", source: "measurement" },
  { id: "k_cool", label: "Cooling circuit loss coefficient", low: "Cooling circuit pressure drop is low for the flow", high: "Cooling circuit pressure drop is high for the flow passing", normal: "Cooling pressure drop matches the flow", source: "estimated parameter" },
  { id: "t_cool", label: "Coolant temperature rise", low: "Coolant runs cooler than expected", high: "Coolant runs hotter than expected", normal: "Coolant temperature rise as expected", source: "measurement" },
  { id: "k_inj_ox", label: "Oxidiser injector loss coefficient", low: "Injector pressure drop is low for the flow", high: "Injector pressure drop is high for the flow passing", normal: "Injector pressure drop matches the flow", source: "estimated parameter" },
  { id: "m_ox", label: "Oxidiser flow", low: "Oxidiser flow reduced", high: "Oxidiser flow above expectation", normal: "Oxidiser flow as expected", source: "measurement" },
  { id: "m_fu", label: "Fuel flow", low: "Fuel flow reduced", high: "Fuel flow above expectation", normal: "Fuel flow as expected", source: "measurement" },
  { id: "speed", label: "Shaft speed", low: "Shaft speed below its schedule", high: "Shaft speed above its schedule", normal: "Shaft speed unchanged", source: "measurement" },
  { id: "vib", label: "Turbopump vibration", low: "Vibration below expectation", high: "Vibration above expectation", normal: "Vibration nominal", source: "measurement" },
  { id: "eta_c", label: "Combustion efficiency", low: "Chamber makes less pressure than the measured flows should produce", high: "Chamber makes more pressure than the flows should produce", normal: "Chamber pressure consistent with the measured flows", source: "estimated parameter" },
];

export const SYMPTOM_BY_ID = Object.fromEntries(SYMPTOMS.map((s) => [s.id, s])) as Record<SymptomId, SymptomDef>;

export const zeroSymptoms = (): Symptoms => Object.fromEntries(SYMPTOM_IDS.map((id) => [id, 0])) as Symptoms;

/** Standard deviations inside which a deviation is treated as noise. */
export const DEAD_ZONE = 3;

/** Turns a deviation in standard deviations into a grade: 0 inside the dead zone, saturating toward ±1. */
export function grade(z: number): number {
  const beyond = Math.abs(z) - DEAD_ZONE;
  return beyond <= 0 ? 0 : Math.sign(z) * Math.tanh(beyond / 5);
}

export const PHYSICAL_DIAGNOSES = ["nominal", "pump_degradation", "valve_restriction", "cooling_restriction", "feed_pressure_reduction", "injector_restriction", "combustion_loss", "pc_sensor_drift"] as const;
export const DATA_DIAGNOSES = ["sensor_noise", "packet_delay", "timestamp_error", "telemetry_replay"] as const;

export type PhysicalDiagnosis = (typeof PHYSICAL_DIAGNOSES)[number];
export type DataDiagnosis = (typeof DATA_DIAGNOSES)[number];
export type DiagnosisId = PhysicalDiagnosis | DataDiagnosis;
export type FaultId = Exclude<DiagnosisId, "nominal">;

export const FAULT_IDS: readonly FaultId[] = [...PHYSICAL_DIAGNOSES.filter((d): d is Exclude<PhysicalDiagnosis, "nominal"> => d !== "nominal"), ...DATA_DIAGNOSES];

export type FaultClass = "physical" | "sensor" | "data" | "cyber";

export interface DiagnosisDef {
  id: DiagnosisId;
  name: string;
  cls: FaultClass | "none";
  /** The component or function the diagnosis points at. */
  location: string;
  /** What actually changes in the physical system or the data path. */
  effect: string;
  /** What an engineer would check before accepting the diagnosis. */
  investigation: string;
}

export const DIAGNOSES: readonly DiagnosisDef[] = [
  { id: "nominal", name: "Nominal", cls: "none", location: "System", effect: "Observed behaviour matches the model within its uncertainty.", investigation: "No action. Keep recording so that later trends have a baseline." },
  {
    id: "pump_degradation",
    name: "Oxidiser pump degradation",
    cls: "physical",
    location: "Oxidiser pump",
    effect: "The pump adds less pressure for the same shaft speed and flow, so discharge pressure, oxidiser flow and chamber pressure all fall.",
    investigation: "Compare the pump's head-versus-flow points with its acceptance curve, review vibration spectra and seal-drain data, and inspect the impeller and inducer before the next run.",
  },
  {
    id: "valve_restriction",
    name: "Main fuel valve restriction",
    cls: "physical",
    location: "Main fuel valve",
    effect: "The valve opens less than commanded. Its pressure drop rises, fuel flow falls and the coolant runs hotter.",
    investigation: "Compare commanded and measured position, review actuator current and supply pressure, and check the valve for contamination or icing before cycling it again.",
  },
  {
    id: "cooling_restriction",
    name: "Cooling-channel restriction",
    cls: "physical",
    location: "Regenerative cooling circuit",
    effect: "Flow area in the cooling channels is reduced. Pressure drop across the jacket rises while the fuel flow through it falls, so the coolant leaves hotter.",
    investigation: "Trend cooling ΔP against flow across previous runs, review wall-temperature evidence, and plan a borescope or flow check of the channels before the next run.",
  },
  {
    id: "feed_pressure_reduction",
    name: "Oxidiser feed pressure reduction",
    cls: "physical",
    location: "Oxidiser tank and pressurisation",
    effect: "Tank pressure decays, so the pump inlet loses suction margin. Once the margin is gone the pump cavitates: head falls and vibration rises.",
    investigation: "Check the pressurisation regulator, pressurant supply and tank ullage data, then the feed line for restriction, before looking for a fault in the pump itself.",
  },
  {
    id: "injector_restriction",
    name: "Oxidiser injector restriction",
    cls: "physical",
    location: "Injector oxidiser manifold",
    effect: "Injector passages are partly blocked. The pressure drop across the injector rises for less flow, and chamber pressure falls.",
    investigation: "Compare injector ΔP against flow with the cold-flow calibration, review filter ΔP upstream, and inspect the injector face and manifold for contamination.",
  },
  {
    id: "combustion_loss",
    name: "Combustion performance loss",
    cls: "physical",
    location: "Combustion chamber",
    effect: "The chamber makes less pressure than the measured propellant flows should produce: characteristic velocity is down.",
    investigation: "Review mixture ratio, injector pattern evidence and high-frequency chamber pressure for instability, and compare characteristic velocity with earlier runs.",
  },
  {
    id: "pc_sensor_drift",
    name: "Chamber pressure sensor A drift",
    cls: "sensor",
    location: "Chamber pressure sensor A",
    effect: "One transducer's reading drifts. The engine itself is unchanged: the second sensor, the thrust proxy and the model still agree with each other.",
    investigation: "Vote sensor A out of the estimate, check its sense line, excitation and zero, and recalibrate or replace it before the next run.",
  },
  {
    id: "sensor_noise",
    name: "Noisy pressure sensor",
    cls: "sensor",
    location: "Oxidiser pump discharge pressure sensor",
    effect: "The reading scatters far more than its calibrated noise while its average is unchanged.",
    investigation: "Check connector, shielding and grounding of the channel, and compare its spectrum with a healthy channel on the same acquisition node.",
  },
  {
    id: "packet_delay",
    name: "Telemetry packet delay",
    cls: "data",
    location: "Telemetry transport",
    effect: "Every measurement arrives late. In steady operation nothing looks wrong; in a transient the engine appears to lag its commands.",
    investigation: "Read latency from the timestamps, check buffering and link load, and hold fast detection logic until latency is back inside its budget.",
  },
  {
    id: "timestamp_error",
    name: "Timestamp misalignment",
    cls: "data",
    location: "Turbomachinery acquisition node clock",
    effect: "One acquisition node stamps its samples with the wrong time, so its channels are aligned against the others at the wrong instant.",
    investigation: "Compare the node's time-sync pulse with the reference clock, re-synchronise it, and re-align the recorded data before trusting transient residuals.",
  },
  {
    id: "telemetry_replay",
    name: "Replayed telemetry",
    cls: "cyber",
    location: "Telemetry source or link",
    effect: "A recorded stretch of healthy-looking telemetry is being repeated. The data no longer responds to commands and its sequence counters repeat.",
    investigation: "Treat as a data-integrity event: verify message authentication and sequence counters, isolate the source, and fall back to independent measurements.",
  },
];

export const DIAGNOSIS_BY_ID = Object.fromEntries(DIAGNOSES.map((d) => [d.id, d])) as Record<DiagnosisId, DiagnosisDef>;

/**
 * What each symptom should be for a fault: −1 low, +1 high, 0 as expected, and
 * 2 for "departs in either direction". The second number is the weight of the
 * evidence. A symptom that is not listed carries no weight for that fault.
 */
type Pattern = Partial<Record<SymptomId, readonly [expect: -1 | 0 | 1 | 2, weight: number]>>;

export const PATTERNS: Record<Exclude<PhysicalDiagnosis, "nominal">, Pattern> = {
  pump_degradation: {
    head_ox: [-1, 3],
    p_out_ox: [-1, 2],
    m_ox: [-1, 1],
    pc: [-1, 1],
    thrust: [-1, 1],
    speed: [0, 1],
    p_in_ox: [0, 1],
    p_tank_ox: [0, 2],
    valve_pos: [0, 1],
    vib: [0, 2],
    k_inj_ox: [0, 2],
    eta_c: [0, 2],
    pc_ab: [0, 2],
    k_valve: [0, 1],
    k_cool: [0, 1],
  },
  feed_pressure_reduction: {
    p_tank_ox: [-1, 3],
    p_in_ox: [-1, 3],
    vib: [1, 1.5],
    head_ox: [-1, 1],
    p_out_ox: [-1, 1],
    m_ox: [-1, 1],
    pc: [-1, 1],
    speed: [0, 1],
    k_inj_ox: [0, 1],
    eta_c: [0, 1],
    pc_ab: [0, 2],
    valve_pos: [0, 1],
    k_valve: [0, 1],
    k_cool: [0, 1],
  },
  valve_restriction: {
    k_valve: [1, 3],
    valve_pos: [-1, 3],
    m_fu: [-1, 2],
    p_out_fu: [1, 1],
    t_cool: [1, 1],
    head_ox: [0, 2],
    k_cool: [0, 2],
    p_tank_ox: [0, 1],
    vib: [0, 1],
    speed: [0, 1],
    pc_ab: [0, 2],
    k_inj_ox: [0, 1],
    eta_c: [0, 1],
  },
  cooling_restriction: {
    k_cool: [1, 3],
    t_cool: [1, 2],
    m_fu: [-1, 2],
    p_out_fu: [1, 1],
    k_valve: [0, 2],
    valve_pos: [0, 2],
    head_ox: [0, 2],
    p_tank_ox: [0, 1],
    vib: [0, 1],
    speed: [0, 1],
    pc_ab: [0, 2],
    k_inj_ox: [0, 1],
    eta_c: [0, 1],
  },
  injector_restriction: {
    k_inj_ox: [1, 3],
    m_ox: [-1, 2],
    p_out_ox: [1, 1],
    pc: [-1, 1],
    thrust: [-1, 1],
    head_ox: [0, 2],
    p_tank_ox: [0, 1],
    k_valve: [0, 1],
    k_cool: [0, 1],
    valve_pos: [0, 1],
    vib: [0, 1],
    eta_c: [0, 2],
    pc_ab: [0, 2],
    speed: [0, 1],
  },
  combustion_loss: {
    eta_c: [-1, 3],
    pc: [-1, 2],
    thrust: [-1, 2],
    head_ox: [0, 2],
    k_inj_ox: [0, 2],
    k_valve: [0, 1],
    k_cool: [0, 1],
    p_tank_ox: [0, 1],
    pc_ab: [0, 2],
    vib: [0, 1],
    speed: [0, 1],
    valve_pos: [0, 1],
  },
  pc_sensor_drift: {
    pc_ab: [2, 4],
    thrust: [0, 2],
    head_ox: [0, 2],
    k_inj_ox: [0, 1],
    eta_c: [0, 1],
    m_ox: [0, 1],
    m_fu: [0, 1],
    p_out_ox: [0, 1],
    k_valve: [0, 1],
    k_cool: [0, 1],
    vib: [0, 1],
    speed: [0, 1],
  },
};

/**
 * How strongly each candidate is supported by a set of graded symptoms, roughly −1 to 1.
 * With `known`, only those symptoms count: one that has not been checked is neither for nor against anything.
 */
export function physicsScores(g: Symptoms, known?: ReadonlySet<SymptomId>): Record<PhysicalDiagnosis, number> {
  let worst = 0;
  for (const id of SYMPTOM_IDS) if (!known || known.has(id)) worst = Math.max(worst, Math.abs(g[id]));
  const scores = { nominal: 0.5 - 1.3 * worst } as Record<PhysicalDiagnosis, number>;
  for (const [fault, pattern] of Object.entries(PATTERNS) as [Exclude<PhysicalDiagnosis, "nominal">, Pattern][]) {
    let support = 0;
    let against = 0;
    let weight = 0;
    for (const [id, [expect, w]] of Object.entries(pattern) as [SymptomId, readonly [number, number]][]) {
      if (known && !known.has(id)) continue;
      const value = g[id];
      if (expect === 0) {
        against += w * Math.abs(value);
      } else {
        weight += w;
        const aligned = expect === 2 ? Math.abs(value) : expect * value;
        if (aligned >= 0) support += w * aligned;
        else against += 1.5 * w * -aligned;
      }
    }
    scores[fault] = weight > 0 ? (support - against) / weight : -against;
  }
  return scores;
}

/** Scores to probabilities. */
export function softmax(scores: readonly number[], sharpness = 1): number[] {
  const top = Math.max(...scores);
  const e = scores.map((s) => Math.exp((s - top) * sharpness));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

const SHARPNESS = 9;

export function physicsProbabilities(g: Symptoms, known?: ReadonlySet<SymptomId>): Record<PhysicalDiagnosis, number> {
  const scores = physicsScores(g, known);
  const p = softmax(PHYSICAL_DIAGNOSES.map((d) => scores[d]), SHARPNESS);
  return Object.fromEntries(PHYSICAL_DIAGNOSES.map((d, i) => [d, p[i]])) as Record<PhysicalDiagnosis, number>;
}

export interface RankedDiagnosis {
  id: DiagnosisId;
  /** Fused probability. */
  p: number;
  /** What physics-based reasoning alone says, and what the learned classifier alone says. Null for data faults, which are found by direct checks. */
  physics: number | null;
  ml: number | null;
}

/**
 * Fuses the evidence. Data-path faults are established by direct checks (a
 * latency is measured, a repeated sequence counter is a fact), so they take
 * their share first; the physical candidates share what is left, as the
 * geometric mean of the physics-based and the learned probabilities.
 */
export function fuseEvidence(physics: Record<PhysicalDiagnosis, number>, ml: Record<PhysicalDiagnosis, number> | null, data: Partial<Record<DataDiagnosis, number>> = {}): RankedDiagnosis[] {
  const combined = PHYSICAL_DIAGNOSES.map((d) => (ml ? Math.sqrt(Math.max(physics[d], 1e-9) * Math.max(ml[d], 1e-9)) : physics[d]));
  const total = combined.reduce((a, b) => a + b, 0);
  let claimed = 0;
  const ranked: RankedDiagnosis[] = [];
  for (const d of DATA_DIAGNOSES) {
    const strength = Math.min(0.97, Math.max(0, data[d] ?? 0));
    const p = strength * (1 - claimed);
    claimed += p;
    ranked.push({ id: d, p, physics: null, ml: null });
  }
  PHYSICAL_DIAGNOSES.forEach((d, i) => ranked.push({ id: d, p: (combined[i] / total) * (1 - claimed), physics: physics[d], ml: ml ? ml[d] : null }));
  return ranked.sort((a, b) => b.p - a.p);
}

export interface EvidenceLine {
  symptom: SymptomId;
  text: string;
  /** Whether the symptom is what the diagnosis predicts, the opposite, or something the diagnosis does not predict. */
  effect: "supports" | "contradicts" | "unexplained";
  grade: number;
  weight: number;
}

const describe = (id: SymptomId, value: number) => (Math.abs(value) < 0.05 ? SYMPTOM_BY_ID[id].normal : value < 0 ? SYMPTOM_BY_ID[id].low : SYMPTOM_BY_ID[id].high);

/** Why a diagnosis: each piece of evidence that bears on it, strongest first. With `known`, only symptoms that have been checked. */
export function explain(id: PhysicalDiagnosis, g: Symptoms, known?: ReadonlySet<SymptomId>): EvidenceLine[] {
  if (id === "nominal") {
    return SYMPTOM_IDS.filter((s) => Math.abs(g[s]) >= 0.05).map((s) => ({ symptom: s, text: describe(s, g[s]), effect: "contradicts" as const, grade: g[s], weight: 1 }));
  }
  const lines: EvidenceLine[] = [];
  for (const [symptom, [expect, weight]] of Object.entries(PATTERNS[id]) as [SymptomId, readonly [number, number]][]) {
    if (known && !known.has(symptom)) continue;
    const value = g[symptom];
    const present = Math.abs(value) >= 0.05;
    if (expect === 0) {
      lines.push({ symptom, text: describe(symptom, value), effect: present ? "unexplained" : "supports", grade: value, weight: present ? weight : weight * 0.5 });
    } else if (present) {
      const aligned = expect === 2 || expect * value > 0;
      lines.push({ symptom, text: describe(symptom, value), effect: aligned ? "supports" : "contradicts", grade: value, weight: weight * (1 + Math.abs(value)) });
    }
  }
  const order = { supports: 0, contradicts: 1, unexplained: 2 } as const;
  return lines.sort((a, b) => order[a.effect] - order[b.effect] || b.weight - a.weight);
}

/** What a fault's pattern predicts for each symptom, for showing the evidence an engineer should go and look for. */
export function expectedEvidence(id: Exclude<PhysicalDiagnosis, "nominal">): { symptom: SymptomId; text: string; expect: -1 | 0 | 1 | 2; weight: number }[] {
  return (Object.entries(PATTERNS[id]) as [SymptomId, readonly [-1 | 0 | 1 | 2, number]][])
    .map(([symptom, [expect, weight]]) => ({
      symptom,
      expect,
      weight,
      text: expect === 0 ? SYMPTOM_BY_ID[symptom].normal : expect === -1 ? SYMPTOM_BY_ID[symptom].low : expect === 1 ? SYMPTOM_BY_ID[symptom].high : `${SYMPTOM_BY_ID[symptom].label} disagree`,
    }))
    .sort((a, b) => Number(a.expect === 0) - Number(b.expect === 0) || b.weight - a.weight);
}
