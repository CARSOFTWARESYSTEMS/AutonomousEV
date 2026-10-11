// Prognostics, readiness, and the 12-week assignment that turns the tutorial
// into something the learner has built.
import type { ModuleId } from "../types";

// ── Prognostics ─────────────────────────────────────────────────────────────

export const PROGNOSTICS_DEFINITION = "Prognostics is the estimation of how a system's condition will evolve: how fast it is degrading, how much margin remains and how probable it is that a limit will be reached within a given time. It moves the question from \"something is wrong\" to \"how is it evolving?\"";

export const PROGNOSTIC_TERMS: readonly { id: string; term: string; text: string }[] = [
  { id: "trend", term: "Degradation trend", text: "The direction and rate at which a health indicator is moving, fitted to its recent history." },
  { id: "index", term: "Health index", text: "One number from 100 (as calibrated) to 0 (at the action limit), taken from the worst inferred parameter." },
  { id: "rate", term: "Rate of change", text: "How fast the driving parameter is changing, with the standard error of that rate." },
  { id: "probability", term: "Probability of threshold crossing", text: "The chance that the quantity of concern is beyond its limit at the end of the prediction horizon." },
  { id: "margin", term: "Remaining margin", text: "How much of the distance between the healthy value and the limit is left." },
  { id: "interval", term: "Confidence interval", text: "The range within which the projection is expected to lie. It widens the further ahead it looks." },
  { id: "maintenance", term: "Maintenance recommendation concept", text: "What an engineer should consider doing, and by when, given the outlook and its uncertainty." },
];

export const PROGNOSTICS_LIMIT = "The projections on this page come from an educational model with illustrative limits. They demonstrate the method. They cannot certify that hardware is safe to fly or to run, and nothing here should be read as doing so.";

// ── Readiness ───────────────────────────────────────────────────────────────

export const READINESS_INTRO = "A Digital Twin readiness score is an educational indicator of how complete a twin's foundations are. A twin is only as ready as its weakest foundation: an excellent model fed by unvalidated data is not a ready twin.";
export const READINESS_CAVEAT = "This score is a learning aid. It is not a certification, a qualification or an assessment of any real programme.";

export const READINESS_LEVELS = ["Not started", "Conceptual", "Simulated", "Calibrated on the asset", "Validated on independent data"] as const;

export interface ReadinessCategory {
  id: string;
  name: string;
  asks: string;
  /** Where this page's own educational twin stands, 0–4, and why. */
  here: number;
  why: string;
}

export const READINESS_CATEGORIES: readonly ReadinessCategory[] = [
  { id: "physical", name: "Physical model", asks: "Is the asset's boundary, structure and set of operating modes defined?", here: 2, why: "A generic reference architecture, defined completely, with no physical asset behind it." },
  { id: "instrumentation", name: "Instrumentation", asks: "Is every needed quantity measured, with known accuracy and redundancy?", here: 2, why: "A full simulated sensor set with noise models." },
  { id: "data_quality", name: "Data quality", asks: "Are timing, calibration and integrity checked and recorded for every sample?", here: 2, why: "Latency, clock skew, sequence and noise checks run on simulated telemetry." },
  { id: "physics", name: "Physics fidelity", asks: "Does the model capture the behaviour its purpose needs?", here: 2, why: "Reduced order. Adequate for mainstage pressure monitoring in simulation; no line dynamics." },
  { id: "identification", name: "Parameter identification", asks: "Are parameters identified from this asset's own test data?", here: 2, why: "Identified from simulated test points of the simulated asset." },
  { id: "sync", name: "Synchronisation", asks: "Is the model driven by the asset's commands on the asset's clock?", here: 2, why: "Synchronised step for step, by construction." },
  { id: "estimation", name: "State estimation", asks: "Are states and hidden parameters estimated with stated uncertainty?", here: 2, why: "Per-channel filters, a fused chamber pressure and eight inferred parameters." },
  { id: "fault_coverage", name: "Fault coverage", asks: "Which credible faults can be detected and isolated, and which cannot?", here: 2, why: "Eleven injectable faults out of a library of more than sixty classes." },
  { id: "ml", name: "ML maturity", asks: "Are learned models versioned, validated on independent data and monitored?", here: 2, why: "Two small models, validated on separately generated simulated data." },
  { id: "uncertainty", name: "Uncertainty", asks: "Does every estimate and prediction carry an uncertainty that has been checked?", here: 2, why: "Bands are shown throughout; their calibration is not verified against outcomes." },
  { id: "validation", name: "Validation", asks: "Is there independent evidence that the twin is accurate enough for its use?", here: 1, why: "None against a physical system. This is the limiting category." },
  { id: "cybersecurity", name: "Cybersecurity", asks: "Are data, models and configuration protected and their integrity verifiable?", here: 1, why: "Described, and one attack is simulated. No controls are implemented." },
  { id: "operations", name: "Operational integration", asks: "Does the twin's output reach the people and processes that act on it?", here: 1, why: "Recommendations are produced for a learner, not for an operating organisation." },
];

// ── The 12-week assignment ──────────────────────────────────────────────────

export const COURSE_INTRO = "The 12-week Digital Twin assignment is a structured project in which the learner builds a propulsion pressure-monitoring twin of their own, phase by phase, with a review at the end of each phase. It can be done against simulated telemetry, as this page does, or against experimental data where it is available.";

export interface CourseWeek {
  week: number;
  title: string;
  deliver: readonly string[];
  review?: string;
  /** The module of this tutorial that teaches the week's material. */
  module: ModuleId;
}

export interface CoursePhase {
  id: string;
  name: string;
  weeks: readonly CourseWeek[];
}

export const COURSE_PHASES: readonly CoursePhase[] = [
  {
    id: "phase_1",
    name: "Phase I — Understand & Architect",
    weeks: [
      { week: 1, title: "Propulsion Fundamentals", deliver: ["Propulsion-system boundary", "Component architecture", "Operating states", "Terminology"], review: "Mission / System Concept Review", module: "system" },
      { week: 2, title: "Pressure System", deliver: ["Complete pressure map", "Pressure measurement points", "Pressure-state definitions", "Pressure-related requirements"], module: "pressure" },
      { week: 3, title: "Instrumentation & Telemetry", deliver: ["Sensor architecture", "DAQ architecture", "Telemetry schema", "Timing architecture", "Calibration concept"], review: "Instrumentation Architecture Review", module: "data" },
    ],
  },
  {
    id: "phase_2",
    name: "Phase II — Model the Physics",
    weeks: [
      { week: 4, title: "First-Principles Model", deliver: ["Mass balance", "Pressure-flow relationships", "Pump representation", "Chamber representation", "Pressure-loss models"], module: "physics" },
      { week: 5, title: "Dynamic Model", deliver: ["Transient model", "Start, steady, throttle and shutdown state logic", "Initial validation tests"], module: "physics" },
      { week: 6, title: "Reduced-Order Twin Model", deliver: ["Real-time-capable simplified model", "Assumptions", "Sensitivity analysis", "Uncertainty model"], review: "Physics Model Review", module: "physics" },
    ],
  },
  {
    id: "phase_3",
    name: "Phase III — Synchronise & Learn",
    weeks: [
      { week: 7, title: "Telemetry Integration", deliver: ["Simulated sensor streams", "Preprocessing", "Timestamp synchronisation", "Signal-quality indicators"], module: "data" },
      { week: 8, title: "State Estimation", deliver: ["Filtering", "State estimator", "Virtual sensors", "Residual generator"], module: "twin" },
      { week: 9, title: "AI/ML", deliver: ["Anomaly detector", "Fault classifier", "Hybrid physics/ML architecture", "ML validation evidence"], review: "Digital Twin Intelligence Review", module: "ai" },
    ],
  },
  {
    id: "phase_4",
    name: "Phase IV — Diagnose & Validate",
    weeks: [
      { week: 10, title: "Fault Library + FDIR", deliver: ["FMEA/FMECA-style fault catalogue", "Fault signatures", "Detection logic", "Isolation logic"], module: "fdir" },
      { week: 11, title: "Prognostics & Health", deliver: ["Degradation indicators", "Trends", "Confidence", "Predictive state", "Remaining-margin concept"], module: "health" },
      { week: 12, title: "Integrated Digital Twin", deliver: ["Complete architecture", "Interactive dashboard", "Fault injection", "Root-cause analysis", "Physics + data + AI integration", "Validation evidence", "Limitations", "Final technical demonstration"], review: "DIGITAL TWIN READINESS REVIEW", module: "lab" },
    ],
  },
];

export const COURSE_WEEKS = COURSE_PHASES.flatMap((phase) => phase.weeks);

/** What the learner must be able to demonstrate at the end, in order. */
export const FINAL_DELIVERABLE = [
  "Physical System",
  "Physics Model",
  "Synthetic / Experimental Telemetry",
  "State Estimation",
  "Digital Twin Synchronisation",
  "Pressure Monitoring",
  "Fault Injection",
  "Anomaly Detection",
  "Fault Isolation",
  "AI/ML Analysis",
  "Prognostics",
  "Engineering Decision Support",
] as const;

/** What an initial Digital Twin should demonstrate, and where this page demonstrates it. */
export const ACCEPTANCE: readonly { item: string; module: ModuleId }[] = [
  { item: "End-to-end propulsion-system architecture", module: "system" },
  { item: "Pressure-map visualisation", module: "pressure" },
  { item: "Dynamic engine operating modes", module: "lab" },
  { item: "Telemetry generation or import", module: "data" },
  { item: "Physics-based expected-state generation", module: "physics" },
  { item: "Observed state", module: "twin" },
  { item: "Estimated state", module: "twin" },
  { item: "Expected state", module: "twin" },
  { item: "Predicted state", module: "health" },
  { item: "Residual generation", module: "twin" },
  { item: "Sensor-fault simulation", module: "lab" },
  { item: "Physical-fault simulation", module: "lab" },
  { item: "Fault detection", module: "fdir" },
  { item: "Fault isolation", module: "fdir" },
  { item: "Pressure trend analysis", module: "health" },
  { item: "Uncertainty", module: "twin" },
  { item: "AI anomaly detection", module: "ai" },
  { item: "AI fault classification", module: "ai" },
  { item: "Hybrid physics/ML reasoning", module: "ai" },
  { item: "Explainability", module: "ai" },
  { item: "Fault history", module: "lab" },
  { item: "Model credibility", module: "twin" },
  { item: "V&V evidence", module: "twin" },
  { item: "Mobile experience", module: "overview" },
  { item: "Desktop advanced experience", module: "system" },
];
