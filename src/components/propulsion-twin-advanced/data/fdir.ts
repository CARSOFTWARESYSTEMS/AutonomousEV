// Fault detection, isolation and recovery for the propulsion Digital Twin: a
// library of credible fault classes, the ways a fault can be detected, how a
// cause is isolated, and the reasoning an engineer should be shown.
//
// The library is organised by where a fault lives. It is a teaching catalogue
// of credible classes, not an enumeration of every possible failure.
import type { FaultId, PhysicalDiagnosis, SymptomId } from "../simulation/isolation";
import type { DetectorId } from "../simulation/twinTypes";

export const FDIR_DEFINITION = "FDIR stands for fault detection, isolation and recovery: noticing that behaviour is no longer nominal, determining where and why, and acting to remain safe. In a Digital Twin the first two are evidence problems; the third is a decision that the twin informs and people and control logic take.";

export const FAULT_LIBRARY_HEADING = "Propulsion Digital Twin FMEA / Fault Library";

export interface FaultEntry {
  name: string;
  /** What the twin would see. */
  signature: string;
  /** The injectable scenario that demonstrates it, where there is one. */
  lab?: FaultId;
}

export interface FaultGroup {
  id: string;
  name: string;
  faults: readonly FaultEntry[];
}

export const FAULT_LIBRARY: readonly FaultGroup[] = [
  {
    id: "feed",
    name: "Propellant Storage / Feed",
    faults: [
      { name: "Abnormal tank pressure", signature: "Tank pressure outside its band for the operating mode." },
      { name: "Pressure decay", signature: "Tank pressure falling while outflow continues; suction margin shrinking.", lab: "feed_pressure_reduction" },
      { name: "Feed restriction", signature: "Feed-line pressure drop high for the flow; pump inlet pressure low with tank pressure normal." },
      { name: "Line blockage", signature: "A step in line ΔP with a matching step down in flow." },
      { name: "Leakage signature", signature: "Flow measured upstream exceeds flow accounted for downstream." },
      { name: "Unexpected pressure drop", signature: "A node pressure below expectation with its neighbours nominal." },
      { name: "Valve malfunction", signature: "Valve position does not follow its command.", lab: "valve_restriction" },
      { name: "Valve leakage", signature: "Flow or downstream pressure with the valve commanded closed." },
      { name: "Valve-position disagreement", signature: "Position feedback and the pressure drop across the valve imply different openings." },
      { name: "Filter restriction", signature: "Filter ΔP rising run over run at a matched flow." },
    ],
  },
  {
    id: "turbomachinery",
    name: "Pump / Turbomachinery",
    faults: [
      { name: "Insufficient pressure rise", signature: "Pump ΔP low for the measured speed and flow.", lab: "pump_degradation" },
      { name: "Abnormal discharge pressure", signature: "Discharge pressure outside expectation for the command." },
      { name: "Pump degradation", signature: "Head coefficient trending down across runs with inlet conditions nominal.", lab: "pump_degradation" },
      { name: "Inlet starvation", signature: "Pump inlet pressure falling toward vapour pressure.", lab: "feed_pressure_reduction" },
      { name: "Cavitation signature", signature: "Loss of head with low inlet pressure and broadband vibration.", lab: "feed_pressure_reduction" },
      { name: "Shaft-speed anomaly", signature: "Speed off its schedule for the turbine drive commanded." },
      { name: "Bearing degradation", signature: "Vibration at bearing defect frequencies; bearing temperature following later." },
      { name: "Seal degradation", signature: "Seal-drain flow or cavity pressure rising; pump efficiency falling." },
      { name: "Rotor imbalance", signature: "Vibration at once-per-revolution growing with speed squared." },
      { name: "Vibration anomaly", signature: "Vibration level or spectrum outside its healthy envelope." },
      { name: "Overspeed", signature: "Shaft speed above its limit, typically after a sudden loss of pump load." },
    ],
  },
  {
    id: "cooling",
    name: "Cooling",
    faults: [
      { name: "Cooling restriction", signature: "Cooling loss coefficient above its calibrated value.", lab: "cooling_restriction" },
      { name: "Increasing cooling ΔP", signature: "Cooling ΔP rising at constant flow.", lab: "cooling_restriction" },
      { name: "Reduced cooling flow", signature: "Fuel flow below expectation with coolant temperature rise above it.", lab: "valve_restriction" },
      { name: "Thermal excursion", signature: "Coolant outlet or wall temperature approaching its limit." },
      { name: "Local blockage signature", signature: "Small ΔP change with a disproportionate local temperature rise." },
      { name: "Leakage signature", signature: "Cooling ΔP low for the inlet flow; outlet flow short of inlet flow." },
    ],
  },
  {
    id: "injector",
    name: "Injector",
    faults: [
      { name: "Injector restriction", signature: "Injector loss coefficient above its cold-flow calibration.", lab: "injector_restriction" },
      { name: "Abnormal injector ΔP", signature: "Injector ΔP outside its band as a fraction of chamber pressure.", lab: "injector_restriction" },
      { name: "Flow imbalance", signature: "Mixture ratio off its command; one propellant flow low." },
      { name: "Manifold-pressure anomaly", signature: "Manifold pressure inconsistent with flow and chamber pressure." },
    ],
  },
  {
    id: "chamber",
    name: "Combustion Chamber",
    faults: [
      { name: "Low chamber pressure", signature: "Estimated chamber pressure below expectation, confirmed by the thrust proxy.", lab: "pump_degradation" },
      { name: "High chamber pressure", signature: "Estimated chamber pressure above expectation; flows above command." },
      { name: "Unexpected chamber-pressure transient", signature: "A chamber pressure change with no command behind it." },
      { name: "Pressure oscillation", signature: "Organised content in high-frequency chamber pressure." },
      { name: "Combustion instability indication", signature: "Oscillation at an acoustic mode of the chamber, growing in amplitude." },
      { name: "Ignition anomaly", signature: "Chamber pressure rise late, early or too steep in the start sequence." },
      { name: "Performance degradation", signature: "Combustion efficiency down: less pressure than the measured flows should produce.", lab: "combustion_loss" },
    ],
  },
  {
    id: "hot_gas",
    name: "Hot-Gas / Turbine Circuit",
    faults: [
      { name: "Abnormal turbine inlet condition", signature: "Turbine inlet pressure or temperature outside its band." },
      { name: "Turbine pressure-ratio anomaly", signature: "Pressure ratio inconsistent with shaft speed and pump power." },
      { name: "Turbine performance degradation", signature: "More pressure ratio needed for the same shaft power, run over run." },
    ],
  },
  {
    id: "control",
    name: "Control",
    faults: [
      { name: "Valve command/response mismatch", signature: "Position lags or stops short of its command.", lab: "valve_restriction" },
      { name: "Actuator degradation", signature: "Actuator effort rising for the same movement; response slowing." },
      { name: "Control-loop oscillation", signature: "Sustained oscillation in a controlled variable and its actuator." },
      { name: "Sequence timing anomaly", signature: "A start or shutdown event outside its timing window." },
      { name: "Redline exceedance", signature: "A limit-monitored quantity confirmed beyond its limit." },
    ],
  },
  {
    id: "instrumentation",
    name: "Instrumentation",
    faults: [
      { name: "Pressure sensor bias", signature: "A constant offset from redundant and virtual sensors at every operating point." },
      { name: "Pressure sensor drift", signature: "A growing offset from redundant and virtual sensors, with the engine unchanged.", lab: "pc_sensor_drift" },
      { name: "Stuck sensor", signature: "Less variation than the channel's noise floor while the engine changes state." },
      { name: "Noisy sensor", signature: "Scatter several times calibrated noise with an unchanged average.", lab: "sensor_noise" },
      { name: "Intermittent sensor", signature: "Dropouts or spikes that no physical process could produce." },
      { name: "Saturation", signature: "A reading pinned at the end of its range." },
      { name: "Calibration error", signature: "A scale error: the offset grows in proportion to the reading." },
      { name: "Timing error", signature: "Channels from one node lead or lag the others in a transient.", lab: "timestamp_error" },
      { name: "Packet loss", signature: "Gaps in the sequence counter." },
      { name: "Duplicated telemetry", signature: "Repeated sequence counters and identical frames.", lab: "telemetry_replay" },
      { name: "Timestamp misalignment", signature: "A node's time-sync pulse offset from the reference clock.", lab: "timestamp_error" },
    ],
  },
  {
    id: "digital",
    name: "Digital / Software",
    faults: [
      { name: "Model divergence", signature: "Residuals grow on many channels at once with no physical pattern." },
      { name: "Data-pipeline latency", signature: "Arrival time minus sample time above its budget.", lab: "packet_delay" },
      { name: "Corrupted data", signature: "Checksum failures; values that violate range and rate checks together." },
      { name: "Incorrect engineering-unit conversion", signature: "A channel wrong by a constant factor from the first sample." },
      { name: "Stale model parameters", signature: "A residual offset that appears after a hardware change and never clears." },
      { name: "Model version mismatch", signature: "Features and model disagree on channel list or scaling." },
      { name: "ML concept drift", signature: "A learned model's error rising gradually while the physics residual stays flat." },
      { name: "False-positive detection", signature: "An alarm with no corroboration from any independent detector." },
      { name: "False-negative detection", signature: "A fault found later by inspection that no detector flagged." },
    ],
  },
];

// ── Detection methods ───────────────────────────────────────────────────────

export interface DetectionMethod {
  id: string;
  /** The live detector that implements it. */
  detector: DetectorId;
  name: string;
  how: string;
  strengths: string;
  limitations: string;
  falseAlarms: string;
  /** How the twin on this page implements it. */
  here: string;
}

export const DETECTION_METHODS: readonly DetectionMethod[] = [
  { id: "threshold", detector: "redline", name: "Threshold / Redline", how: "Compare a value with a fixed limit.", strengths: "Simple and deterministic. Easy to verify, easy to explain, fast.", limitations: "Blind until the limit is reached. A limit wide enough for every operating mode is too wide for any one of them.", falseAlarms: "Rare if limits are set wide, which is the same reason it detects late.", here: "Limits on chamber pressure, coolant temperature rise, suction margin and vibration, as fractions of the expected value in mainstage." },
  { id: "rate", detector: "rate", name: "Rate-of-Change", how: "Compare how fast a value is changing with a limit.", strengths: "Catches an abrupt change well before the value reaches a redline.", limitations: "Cannot see slow degradation at all. Sensitive to noise, so the signal is filtered first, which costs time.", falseAlarms: "Commanded transients look like faults unless the command is taken into account.", here: "Rate of the chamber pressure residual over a quarter of a second. It stays quiet for the gradual faults in the lab, which is the lesson." },
  { id: "residual", detector: "residual", name: "Model Residual", how: "Observed minus expected, compared with its healthy scatter.", strengths: "Works at every operating point, because the model already accounts for the command. Detects small departures.", limitations: "Only as good as the model. Model error looks exactly like a fault.", falseAlarms: "Appear wherever the model is weakest: transients, and the edges of its envelope.", here: "The largest residual across 22 channels, each against a baseline and scatter learned on a healthy run, widened in transients." },
  { id: "spc", detector: "cusum", name: "Statistical Process Monitoring", how: "Accumulate small, persistent deviations until they add up to significance.", strengths: "Detects gradual drift that never trips a threshold on any one sample.", limitations: "Slower for large sudden changes. Needs a stable baseline.", falseAlarms: "Slowly varying but harmless effects, such as thermal soak, accumulate too.", here: "A two-sided cumulative sum on eight key symptoms, ignoring anything inside 2.5 standard deviations." },
  { id: "ml", detector: "ml", name: "ML Anomaly Detection", how: "Learn what healthy data looks like and measure distance from it.", strengths: "Needs no model and no failure data. Recognises complex patterns across many channels.", limitations: "Anything it was not trained on is anomalous, including healthy conditions. It says that something is unfamiliar, not what.", falseAlarms: "New but healthy operating conditions. It must know when it is outside its training envelope.", here: "Principal component analysis on raw telemetry. It typically fires several seconds after the physics-based detectors, and declares itself out of distribution in a transient." },
  { id: "multivariate", detector: "multivariate", name: "Multivariate Detection", how: "Test many signals together, so that a pattern counts even when no single signal is remarkable.", strengths: "Sensitive to faults that move several channels a little, in a direction healthy data never takes.", limitations: "Hard to explain on its own: the statistic says how far, not which way.", falseAlarms: "Correlated healthy variation, if the relationships between signals were not captured.", here: "The sum of squared symptom deviations, against a limit set from a healthy run." },
  { id: "hybrid", detector: "hybrid", name: "Hybrid Detection", how: "Require agreement between detectors that fail in different ways.", strengths: "Each method covers another's blind spot. Corroboration cuts false alarms sharply.", limitations: "More to build, verify and maintain. The voting rule is itself a design decision with safety consequences.", falseAlarms: "Only when two independent methods are wrong together.", here: "An anomaly is declared when two of residual, statistical, multivariate and learned detectors agree, or one redline is crossed, or data integrity fails." },
];

// ── Sensor fault or engine fault ────────────────────────────────────────────

export const SENSOR_VS_ENGINE = {
  heading: "Sensor Fault vs Real Engine Fault",
  scenario: "The chamber pressure measurement falls unexpectedly.",
  question: "Is the engine failing or is the sensor failing?",
  definition: "Sensor drift and real engine degradation are told apart by what else changes. A real change in the engine moves every measurement that physics ties to it; a sensor fault changes one reading and nothing else.",
} as const;

export interface ChallengeCase {
  id: "sensor" | "engine";
  answer: "sensor" | "engine";
  fault: FaultId;
  verdict: string;
  reasoning: string;
}

export const CHALLENGE_CASES: readonly ChallengeCase[] = [
  {
    id: "sensor",
    answer: "sensor",
    fault: "pc_sensor_drift",
    verdict: "The sensor is failing. The engine is healthy.",
    reasoning: "Only sensor A has moved. Sensor B, on its own port, reads as expected: hardware redundancy. Pump discharge pressure, flow, shaft speed and valve position are unchanged, and the thrust proxy has not fallen: cross-sensor consistency. The model's virtual chamber pressure agrees with sensor B: analytical redundancy. Three independent lines of evidence say the chamber has not changed.",
  },
  {
    id: "engine",
    answer: "engine",
    fault: "pump_degradation",
    verdict: "The engine is failing. The sensors agree with each other.",
    reasoning: "Sensors A and B have fallen together, and the thrust proxy with them, so chamber pressure really is low. Oxidiser pump discharge pressure and oxidiser flow are down while shaft speed and valve position are unchanged: the pump is producing less head than its curve at the same speed. The physics prediction, which assumes a healthy pump, is the one thing that has not moved.",
  },
];

/** The evidence compared in the challenge, in the order it is shown. */
export const CHALLENGE_EVIDENCE = [
  { id: "pcA", label: "Chamber pressure sensor A" },
  { id: "pcB", label: "Chamber pressure sensor B" },
  { id: "pOutOx", label: "Pump discharge pressure" },
  { id: "mOx", label: "Propellant flow" },
  { id: "speed", label: "Shaft speed" },
  { id: "valvePos", label: "Valve position" },
  { id: "thrust", label: "Thrust proxy" },
] as const;

// ── Fault isolation tree ────────────────────────────────────────────────────

export const FAULT_TREE = {
  top: "LOW CHAMBER PRESSURE",
  intro: "Fault isolation is the step from knowing that something is wrong to knowing what. A fault tree lays out the causes that could produce a symptom; evidence then raises or lowers confidence in each branch.",
} as const;

export interface TreeBranch {
  id: string;
  cause: string;
  /** The diagnosis whose evidence pattern the branch uses. */
  diagnosis: Exclude<PhysicalDiagnosis, "nominal">;
  mechanism: string;
  /** Evidence that makes the branch less likely, in words. */
  lowers: string;
}

export const TREE_BRANCHES: readonly TreeBranch[] = [
  { id: "feed", cause: "Low feed pressure", diagnosis: "feed_pressure_reduction", mechanism: "Tank pressure falls, the pump inlet loses suction margin, and the pump cavitates.", lowers: "Tank and inlet pressure nominal." },
  { id: "pump", cause: "Degraded pump performance", diagnosis: "pump_degradation", mechanism: "The pump adds less pressure at the same speed and flow.", lowers: "Pump pressure rise on its curve; or inlet pressure low, which makes cavitation the better explanation." },
  { id: "valve", cause: "Valve restriction", diagnosis: "valve_restriction", mechanism: "A valve opens less than commanded and takes more pressure than it should.", lowers: "Valve position on its command and valve pressure drop normal for the flow." },
  { id: "flow", cause: "Flow reduction", diagnosis: "cooling_restriction", mechanism: "A restriction elsewhere on the path, here in the cooling channels, reduces propellant flow.", lowers: "Every loss coefficient on the path at its calibrated value." },
  { id: "injector", cause: "Injector restriction", diagnosis: "injector_restriction", mechanism: "Injector passages are partly blocked: more drop, less flow.", lowers: "Injector pressure drop normal for the flow." },
  { id: "combustion", cause: "Combustion-performance issue", diagnosis: "combustion_loss", mechanism: "The flows are right but the chamber makes less pressure from them.", lowers: "Chamber pressure consistent with the measured flows." },
  { id: "sensor", cause: "Sensor bias / drift", diagnosis: "pc_sensor_drift", mechanism: "Chamber pressure has not changed; one reading of it has.", lowers: "Both chamber sensors and the thrust proxy falling together." },
];

// ── Root-cause analysis ─────────────────────────────────────────────────────

export const RCA_INTRO = "Root-cause analysis in a Digital Twin is a chain of reasoning that can be read and challenged, from a symptom to a recommended verification. The twin should show its reasoning, not merely a red alarm.";

export const RCA_STEPS: readonly { id: string; label: string; text: string }[] = [
  { id: "symptom", label: "Symptom", text: "What departed from expectation, and by how much." },
  { id: "evidence", label: "Evidence", text: "Every measurement and inferred parameter, graded against its healthy scatter." },
  { id: "candidates", label: "Candidate causes", text: "The faults that could produce the symptom." },
  { id: "physics", label: "Physics consistency", text: "How well each candidate's expected pattern matches the evidence." },
  { id: "cross", label: "Cross-sensor consistency", text: "Whether redundant and related sensors agree with the leading candidate." },
  { id: "ml", label: "ML probability", text: "What the learned classifier makes of the same evidence, independently." },
  { id: "confidence", label: "Diagnostic confidence", text: "The fused probability, and whether the methods agree." },
  { id: "verification", label: "Recommended verification", text: "What an engineer should check before acting on the diagnosis." },
];

/** Symptoms offered in the hand-driven diagnostic panel, with a plain label for each setting. */
export const PANEL_EVIDENCE: readonly { symptom: SymptomId; label: string; low?: string; high?: string }[] = [
  { symptom: "pc", label: "Chamber pressure", low: "Low" },
  { symptom: "pc_ab", label: "Sensors A and B", low: "Disagree" },
  { symptom: "thrust", label: "Thrust proxy", low: "Low" },
  { symptom: "p_out_ox", label: "Pump discharge pressure", low: "Low", high: "High" },
  { symptom: "head_ox", label: "Pump head for its speed and flow", low: "Low" },
  { symptom: "p_in_ox", label: "Pump inlet pressure", low: "Low" },
  { symptom: "vib", label: "Vibration", high: "High" },
  { symptom: "valve_pos", label: "Valve position", low: "Abnormal" },
  { symptom: "m_ox", label: "Oxidiser flow", low: "Reduced" },
  { symptom: "m_fu", label: "Fuel flow", low: "Reduced" },
  { symptom: "k_inj_ox", label: "Injector ΔP for the flow", high: "High" },
  { symptom: "k_cool", label: "Cooling ΔP for the flow", high: "High" },
  { symptom: "t_cool", label: "Coolant temperature", high: "High" },
  { symptom: "eta_c", label: "Pressure made per unit of flow", low: "Low" },
];
