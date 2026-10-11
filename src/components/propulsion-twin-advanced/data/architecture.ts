// The platform view: what a CTO or architect builds, where each part runs, how
// it is secured, and how the twin fits into digital engineering as a whole.

// ── CTO / Architect view ────────────────────────────────────────────────────

export const CTO_HEADING = "CTO / Architect View";
export const CTO_INTRO = "The questions an organisation has to answer before it funds a propulsion Digital Twin, and the short version of each answer.";

export const CTO_QUESTIONS: readonly { id: string; q: string; a: string; points: readonly string[] }[] = [
  { id: "build", q: "What do we build?", a: "A platform, not a dashboard: a telemetry pipeline, a set of versioned models, a state store that holds the estimated condition of each asset, and services that turn it into detection, diagnosis and prediction.", points: ["Telemetry ingestion and quality layer", "Physics, estimation, diagnostic and prognostic services", "A Digital Twin state store per asset", "APIs, an engineering interface and a model registry"] },
  { id: "data", q: "What data do we need?", a: "Time-synchronised measurements with their calibration and quality, the commands that were sent, the configuration of the hardware that was run, and a record of every fault and finding.", points: ["Raw and processed telemetry", "Commands and controller state", "As-built configuration and calibration history", "Test, inspection and failure evidence"] },
  { id: "models", q: "What models do we need?", a: "A real-time physics model for the expected state, an estimator, detectors and a diagnostic model, and a prognostic model, with higher-fidelity models behind them to supply coefficients and fault signatures.", points: ["Reduced-order physics model", "State estimator and virtual sensors", "Detection and isolation models", "Prognostic model", "High-fidelity models, off line"] },
  { id: "realtime", q: "What can run in real time?", a: "Reduced-order physics, filtering, residuals, threshold and statistical detection, and inference of small learned models. Anything that resolves spatial detail cannot.", points: ["Microseconds: lumped models, filters, residuals, thresholds", "Milliseconds: small classifier and anomaly-model inference", "Not real time: CFD, FEA, model training, uncertainty sweeps"] },
  { id: "edge", q: "What belongs at the edge?", a: "Whatever must keep working if the link fails, and whatever must respond faster than the link allows: acquisition, timestamping, quality checks, redlines and first-line detection.", points: ["Signal conditioning, sampling, timestamping", "Unit conversion and quality flags", "Redline and rate checks", "Buffering through link outages"] },
  { id: "central", q: "What belongs in cloud or on-premises engineering infrastructure?", a: "Everything that needs history, heavy compute or many assets at once. Where it is hosted is decided by export-control and data-classification rules before it is decided by cost.", points: ["Long-term telemetry and evidence store", "Model training, calibration and validation", "Fleet-level comparison", "Model registry and governance"] },
  { id: "gates", q: "What are the validation gates?", a: "A model moves from one status to the next only on evidence, and each gate is a review with named approvers.", points: ["Conceptual → Reference: verified implementation", "Reference → Calibrated: parameters identified from this asset", "Calibrated → Test-correlated: agreement with test quantified", "Test-correlated → Validated: independent data, stated use, stated envelope"] },
  { id: "ai_trust", q: "Where can AI be trusted?", a: "As a screen and a second opinion: finding the unfamiliar across many channels, ranking candidate causes, and making expensive physics fast. Always inside its training envelope, and always corroborated.", points: ["Anomaly screening", "Candidate ranking, with physics-based evidence alongside", "Surrogates of high-fidelity models"] },
  { id: "physics", q: "Where is physics mandatory?", a: "Wherever the answer must hold in conditions nobody has data for, and wherever it protects hardware or people: redlines, shutdown logic and the expected state used for protection.", points: ["Limits and shutdown logic", "Expected state for protection", "Any extrapolation beyond tested conditions"] },
  { id: "evidence", q: "What evidence is required before operational use?", a: "Validation against independent test data for the declared use and envelope, a quantified false-alarm and missed-detection rate, demonstrated behaviour with bad data, and a named owner for every model.", points: ["Independent validation report per model", "Detection performance on seeded and historical faults", "Data-fault and cyber-fault test results", "Configuration control of data, features and models"] },
  { id: "cyber", q: "What are the cybersecurity risks?", a: "Beyond ordinary platform risks, a twin can be deceived: by telemetry that is falsified or replayed, by tampered configuration, or by a model or training set that has been substituted or poisoned.", points: ["Telemetry integrity and replay", "Model and data supply chain", "Configuration tampering", "Separation of test and production"] },
  { id: "fleet", q: "How do we scale from one test engine to a fleet?", a: "Keep one model definition and many parameter sets. Each asset has its own calibrated parameters and state; the fleet shares the model, the fault library and the learning.", points: ["Model as a versioned template; parameters per serial number", "A state store keyed by asset", "Fleet baselines that make one asset's deviation visible", "Transfer of fault signatures across assets, with re-validation"] },
];

// ── Data architecture ───────────────────────────────────────────────────────

export const DATA_ARCHITECTURE: readonly { id: string; layer: string; role: string; items: readonly string[] }[] = [
  { id: "edge", layer: "Edge", role: "Next to the hardware. Turns signals into trustworthy samples.", items: ["Sensors", "DAQ", "Timestamping", "Preprocessing"] },
  { id: "streaming", layer: "Streaming", role: "Moves samples reliably and in order, and knows when it has not.", items: ["Telemetry transport", "Buffering", "Ordering", "Health checks"] },
  { id: "storage", layer: "Storage", role: "Keeps what happened, what was concluded, and what the hardware and models were at the time.", items: ["Raw telemetry", "Processed telemetry", "Events", "Model outputs", "Metadata", "Configuration", "Calibration history"] },
  { id: "models", layer: "Model Services", role: "Stateless, versioned services that turn telemetry into conclusions.", items: ["Physics simulation", "State estimation", "ML inference", "Diagnostics", "Prognostics"] },
  { id: "state", layer: "Digital Twin State Store", role: "Maintains the current estimated physical state of each asset: the twin itself, as data.", items: ["Estimated states and parameters", "Their uncertainties", "Health state and active findings", "The model and data versions that produced them"] },
  { id: "apis", layer: "APIs", role: "The only way anything reads or changes the twin.", items: ["Telemetry API", "Model API", "Health API", "Anomaly API", "Event API", "Asset configuration API"] },
  { id: "ui", layer: "UI", role: "An interactive engineering dashboard that shows states, evidence and reasoning.", items: ["Twin states and residuals", "Fault history", "Diagnostic reasoning", "Model credibility"] },
];

/** Conceptual interfaces. Paths and fields illustrate the shape of each API; they are not a published specification. */
export const APIS: readonly { id: string; name: string; purpose: string; example: string; returns: string }[] = [
  { id: "telemetry", name: "Telemetry API", purpose: "Time-ranged measurements with units, timestamps and quality flags.", example: "GET /assets/{id}/telemetry?channels=pc_a,pc_b&from=…&to=…", returns: "Samples, each with value, time, quality and calibration reference." },
  { id: "model", name: "Model API", purpose: "Run or query a versioned model: expected state for a command, or a model's card.", example: "POST /models/pressure-network@1.0.0/expected", returns: "Expected value per channel, with model version and envelope status." },
  { id: "health", name: "Health API", purpose: "The current health state of an asset and of each component.", example: "GET /assets/{id}/health", returns: "State, confidence, inferred parameters, remaining margin." },
  { id: "anomaly", name: "Anomaly API", purpose: "Active and historical anomalies with the detectors that raised them.", example: "GET /assets/{id}/anomalies?active=true", returns: "Anomalies with detector, score, time and linked evidence." },
  { id: "event", name: "Event API", purpose: "An append-only history of commands, detections, diagnoses and engineering dispositions.", example: "GET /assets/{id}/events?kind=isolated", returns: "Immutable events, each traceable to data and model versions." },
  { id: "config", name: "Asset Configuration API", purpose: "What hardware, sensors, calibrations and model parameters an asset has, at any date.", example: "GET /assets/{id}/configuration?at=…", returns: "As-built configuration, sensor map, calibration set, parameter set." },
];

// ── Digital thread ──────────────────────────────────────────────────────────

export const DIGITAL_THREAD_INTRO = "The digital thread is the connected record of a product through its life: requirements, design, analysis, manufacturing, test, operation and maintenance, each traceable to the others. A Digital Twin is one stage of that thread and draws on all of it. It is part of digital engineering, not an isolated dashboard.";

export const DIGITAL_THREAD: readonly { id: string; stage: string; gives: string }[] = [
  { id: "requirements", stage: "Requirements", gives: "The limits, margins and detection requirements the twin monitors against." },
  { id: "architecture", stage: "System Architecture", gives: "Components, interfaces and operating modes: the structure of the model." },
  { id: "cad", stage: "CAD", gives: "Geometry: volumes, areas and lengths the physics models need." },
  { id: "analysis", stage: "Analysis", gives: "High-fidelity results that supply coefficients, maps and fault signatures." },
  { id: "manufacturing", stage: "Manufacturing", gives: "As-built dimensions and deviations: why one serial number differs from another." },
  { id: "instrumentation", stage: "Instrumentation", gives: "The sensor map, calibrations and acquisition configuration." },
  { id: "test", stage: "Test", gives: "The evidence parameters are identified from and models are validated against." },
  { id: "telemetry", stage: "Telemetry", gives: "The live link between the asset and its model." },
  { id: "twin", stage: "Digital Twin", gives: "The estimated state, health and outlook of this asset." },
  { id: "operations", stage: "Operations", gives: "Decisions informed by the twin; operating history returned to it." },
  { id: "maintenance", stage: "Maintenance", gives: "Inspection findings: the ground truth diagnoses are scored against." },
  { id: "failure", stage: "Failure Evidence", gives: "Confirmed causes that enter the fault library with their signatures." },
  { id: "improvement", stage: "Design Improvement", gives: "Changes to requirements and design, which start the thread again." },
];

// ── Cybersecurity ───────────────────────────────────────────────────────────

export const CYBER_HEADING = "Digital Twin Cybersecurity";
export const CYBER_INTRO = "A propulsion Digital Twin consumes sensitive engineering telemetry and its conclusions influence decisions about hardware. It has to be protected as a system, and it has a further exposure of its own: anything that can alter what the twin is told can alter what it concludes.";

export const CYBER_CONTROLS: readonly { id: string; name: string; text: string }[] = [
  { id: "identity", name: "Identity", text: "Every person, service and device has its own identity. Nothing is shared." },
  { id: "authn", name: "Authentication", text: "Strong authentication for people; certificate- or key-based authentication for devices and services." },
  { id: "authz", name: "Authorisation", text: "Access decided per asset and per action: reading telemetry is not permission to change a model parameter." },
  { id: "least", name: "Least privilege", text: "Each role and service holds only the rights its job needs, for only as long as it needs them." },
  { id: "s2s", name: "Service-to-service trust", text: "Services authenticate to each other. Network location is never proof of identity." },
  { id: "transit", name: "Encryption in transit", text: "Telemetry, commands and model traffic are encrypted between every hop." },
  { id: "rest", name: "Encryption at rest", text: "Stored telemetry, models and configuration are encrypted, with keys managed separately." },
  { id: "integrity", name: "Telemetry integrity", text: "Message authentication and sequence counters, so altered, injected or replayed data is detectable." },
  { id: "signatures", name: "Digital signatures where justified", text: "Signed frames or batches where telemetry is evidence, weighed against the processing cost at the edge." },
  { id: "audit", name: "Audit trails", text: "Who read, changed, approved or deployed what, and when." },
  { id: "immutable", name: "Immutable event history", text: "Detections, diagnoses and dispositions are appended, never edited." },
  { id: "api", name: "API security", text: "Authenticated, authorised, rate-limited and input-validated interfaces; no direct database access." },
  { id: "artifact", name: "Model-artifact integrity", text: "Models are signed and their hashes recorded; a service runs only a model it can verify." },
  { id: "supply", name: "Supply-chain security", text: "Provenance and scanning of libraries, containers, firmware and third-party models." },
  { id: "deploy", name: "Secure model deployment", text: "Promotion through reviewed, automated pipelines with approval gates; no hand-copied models." },
  { id: "separation", name: "Separation of engineering, test and production environments", text: "Experimental models and data cannot reach the environment that informs operational decisions." },
];

export const CYBER_ATTACKS: readonly { id: string; name: string; effect: string; defence: string }[] = [
  { id: "falsified", name: "Falsified telemetry", effect: "The twin tracks a state the engine is not in, and may hide a real fault or invent one.", defence: "Message authentication at the source; physics consistency checks across channels." },
  { id: "spoofing", name: "Sensor spoofing", effect: "A sensor is driven, electrically or physically, to report a chosen value.", defence: "Redundant and dissimilar sensors; virtual sensors from the model." },
  { id: "replay", name: "Replay attacks", effect: "Recorded healthy data is repeated while the engine does something else.", defence: "Sequence counters and timestamps under authentication; a check that data responds to commands." },
  { id: "timestamp", name: "Timestamp manipulation", effect: "Channels are misaligned, creating false residuals or masking real ones in transients.", defence: "Authenticated time synchronisation; monitoring of each node's clock against a reference." },
  { id: "model_poison", name: "Model poisoning", effect: "A model's parameters are altered so that it expects, and so excuses, abnormal behaviour.", defence: "Signed model artefacts; configuration control; verification of the running model's hash." },
  { id: "data_poison", name: "Training-data poisoning", effect: "Faulty data labelled healthy teaches a learned model to ignore the fault.", defence: "Controlled, versioned training sets with provenance; validation on independently held data." },
  { id: "config", name: "Configuration tampering", effect: "A changed calibration, limit or channel map makes correct data mean something else.", defence: "Signed configuration, change approval and audit; limits owned by engineering, not by operations tooling." },
  { id: "substitution", name: "Model substitution", effect: "A different model is run in place of the approved one.", defence: "A registry of approved versions; deployment only through the pipeline; runtime attestation." },
  { id: "firmware", name: "Malicious firmware or data-source compromise", effect: "The source itself is hostile, so everything downstream is authentic and wrong.", defence: "Secure boot and signed firmware; independent measurement paths that cannot all be compromised together." },
];

export const CYBER_CHALLENGE = {
  question: "Is this an engine anomaly or a cyber-induced data anomaly?",
  text: "The two can look alike on a chart. They are told apart by questions a physical fault cannot answer the same way.",
  tests: [
    { check: "Does the data respond to commands?", engine: "Yes. A faulty engine still follows the throttle.", cyber: "No. Replayed or fabricated data does not know what was commanded." },
    { check: "Are sequence counters and message authentication intact?", engine: "Yes.", cyber: "Counters repeat or authentication fails." },
    { check: "Do independent measurement paths agree?", engine: "They move together, as physics requires.", cyber: "A path the attacker did not reach disagrees with the rest." },
    { check: "Is the pattern physically possible?", engine: "It matches a fault signature.", cyber: "It may break conservation: pressure without flow, flow without pressure drop." },
  ],
  lab: "Inject Replayed telemetry in the Lab and step the throttle: the charts keep showing a healthy engine at the old setting.",
} as const;

// ── Knowledge graph ─────────────────────────────────────────────────────────

export type GraphKind = "Component" | "Sensor" | "Measurement" | "Failure Mode" | "Physics Model" | "AI Model" | "Requirement" | "Test Evidence";

export const GRAPH_KINDS: readonly GraphKind[] = ["Component", "Sensor", "Measurement", "Failure Mode", "Physics Model", "AI Model", "Requirement", "Test Evidence"];

export interface GraphNode {
  id: string;
  kind: GraphKind;
  name: string;
  note: string;
}

export const GRAPH_NODES: readonly GraphNode[] = [
  { id: "c_chamber", kind: "Component", name: "Combustion chamber", note: "Where chamber pressure is produced." },
  { id: "c_injector", kind: "Component", name: "Injector", note: "Sets the pressure drop into the chamber." },
  { id: "c_ox_pump", kind: "Component", name: "Oxidiser pump", note: "Raises oxidiser pressure." },
  { id: "c_cooling", kind: "Component", name: "Cooling circuit", note: "Carries heat out of the chamber wall." },
  { id: "s_pc_a", kind: "Sensor", name: "Chamber pressure sensor A", note: "PT-CH-01A. Primary chamber pressure transducer." },
  { id: "s_pc_b", kind: "Sensor", name: "Chamber pressure sensor B", note: "PT-CH-01B. Independent second transducer." },
  { id: "s_inj_ox", kind: "Sensor", name: "Injector oxidiser manifold sensor", note: "PT-OX-04." },
  { id: "s_pout_ox", kind: "Sensor", name: "Oxidiser pump discharge sensor", note: "PT-OX-03." },
  { id: "s_cool", kind: "Sensor", name: "Cooling inlet and outlet sensors", note: "PT-FU-04 and PT-FU-05." },
  { id: "m_pc", kind: "Measurement", name: "Chamber pressure", note: "Fused from A, B and a virtual sensor." },
  { id: "m_dp_inj", kind: "Measurement", name: "Injector ΔP", note: "Manifold pressure minus chamber pressure." },
  { id: "m_dp_pump", kind: "Measurement", name: "Pump ΔP", note: "Discharge minus inlet pressure." },
  { id: "m_dp_cool", kind: "Measurement", name: "Cooling ΔP", note: "Cooling inlet minus outlet pressure." },
  { id: "f_drift", kind: "Failure Mode", name: "Chamber pressure sensor drift", note: "The reading moves; the engine does not." },
  { id: "f_low_pc", kind: "Failure Mode", name: "Low chamber pressure", note: "A symptom with several possible causes." },
  { id: "f_inj", kind: "Failure Mode", name: "Injector restriction", note: "More drop for less flow." },
  { id: "f_pump", kind: "Failure Mode", name: "Pump degradation", note: "Less head at the same speed and flow." },
  { id: "f_cool", kind: "Failure Mode", name: "Cooling-channel restriction", note: "More ΔP and a hotter coolant." },
  { id: "p_chamber", kind: "Physics Model", name: "Chamber mass balance", note: "p_c = η · c* · ṁ / A_t." },
  { id: "p_injector", kind: "Physics Model", name: "Injector loss model", note: "Δp = K · ṁ²." },
  { id: "p_pump", kind: "Physics Model", name: "Pump head curve", note: "Δp = a·N² − b·ṁ²." },
  { id: "p_virtual", kind: "Physics Model", name: "Virtual chamber pressure", note: "Three routes that use no chamber sensor." },
  { id: "a_classifier", kind: "AI Model", name: "Fault classifier", note: "Logistic regression on physics symptoms." },
  { id: "a_anomaly", kind: "AI Model", name: "Anomaly detector", note: "PCA on healthy telemetry." },
  { id: "r_pc_limit", kind: "Requirement", name: "Chamber pressure within limits in mainstage", note: "An illustrative limit-monitoring requirement." },
  { id: "r_redundancy", kind: "Requirement", name: "No single sensor fault shall cause a false shutdown", note: "An illustrative fault-tolerance requirement." },
  { id: "r_detect", kind: "Requirement", name: "Degradation detected before a redline", note: "An illustrative health-monitoring requirement." },
  { id: "e_calibration", kind: "Test Evidence", name: "Sensor calibration record", note: "Pre-campaign calibration of each transducer. Conceptual." },
  { id: "e_identification", kind: "Test Evidence", name: "Parameter identification run", note: "400 simulated steady points. SIMULATED." },
  { id: "e_seeded", kind: "Test Evidence", name: "Seeded-fault runs", note: "Injected faults used to score detection and isolation. SIMULATED." },
  { id: "e_validation", kind: "Test Evidence", name: "Classifier validation set", note: "320 simulated conditions held apart from training. SIMULATED." },
];

/** Undirected relations between nodes. */
export const GRAPH_EDGES: readonly (readonly [string, string])[] = [
  ["c_chamber", "s_pc_a"], ["c_chamber", "s_pc_b"], ["c_injector", "s_inj_ox"], ["c_ox_pump", "s_pout_ox"], ["c_cooling", "s_cool"],
  ["s_pc_a", "m_pc"], ["s_pc_b", "m_pc"], ["s_pc_a", "m_dp_inj"], ["s_inj_ox", "m_dp_inj"], ["s_pout_ox", "m_dp_pump"], ["s_cool", "m_dp_cool"],
  ["s_pc_a", "f_drift"], ["m_pc", "f_low_pc"], ["m_dp_inj", "f_inj"], ["m_dp_pump", "f_pump"], ["m_dp_cool", "f_cool"], ["f_pump", "f_low_pc"], ["f_inj", "f_low_pc"],
  ["m_pc", "p_chamber"], ["m_dp_inj", "p_injector"], ["m_dp_pump", "p_pump"], ["s_pc_a", "p_virtual"], ["s_pc_b", "p_virtual"], ["p_injector", "p_virtual"],
  ["f_drift", "a_classifier"], ["f_pump", "a_classifier"], ["f_inj", "a_classifier"], ["f_cool", "a_classifier"], ["s_pc_a", "a_anomaly"], ["m_pc", "a_anomaly"],
  ["m_pc", "r_pc_limit"], ["s_pc_a", "r_redundancy"], ["s_pc_b", "r_redundancy"], ["f_pump", "r_detect"], ["f_cool", "r_detect"],
  ["s_pc_a", "e_calibration"], ["s_pc_b", "e_calibration"], ["p_injector", "e_identification"], ["p_pump", "e_identification"], ["p_chamber", "e_identification"],
  ["f_drift", "e_seeded"], ["f_pump", "e_seeded"], ["a_classifier", "e_validation"], ["r_redundancy", "e_seeded"], ["r_detect", "e_seeded"],
];

export const GRAPH_START = "s_pc_a";

// ── North-star architecture ─────────────────────────────────────────────────

/** The complete flow, top to bottom. An array is a row of parallel elements. */
export const NORTH_STAR: readonly (string | readonly string[])[] = [
  "PHYSICAL PROPULSION SYSTEM",
  ["Pressure Sensors", "Temperature Sensors", "Other Sensors"],
  "DATA ACQUISITION",
  "TIME SYNCHRONISATION",
  "DATA QUALITY",
  "TELEMETRY BUS",
  ["PHYSICS MODEL", "STATE ESTIMATOR", "AI / ML"],
  "RESIDUAL ENGINE",
  "ANOMALY / FAULT DETECTION",
  "FAULT ISOLATION",
  "PROGNOSTICS",
  "UNCERTAINTY MODEL",
  "DIGITAL TWIN STATE",
  "ENGINEERING DECISION SUPPORT",
  "VALIDATION",
];
