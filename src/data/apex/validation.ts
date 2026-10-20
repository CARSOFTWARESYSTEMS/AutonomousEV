/**
 * Physical and digital validation: testing, instrumentation, the Digital Twin
 * and the digital quality thread. Process and architecture level only. Every
 * record format shown is an illustration of structure, not APEX data.
 */

/** The confidence ladder: confidence is accumulated, not assumed at the top. */
export const CONFIDENCE_LADDER: readonly { id: string; label: string; detail: string }[] = [
  { id: "material", label: "Material", detail: "Specified, characterised and traceable to its certificate." },
  { id: "part", label: "Part", detail: "Matches its drawing, with inspection evidence." },
  { id: "component", label: "Component", detail: "Performs its function on its own." },
  { id: "subsystem", label: "Subsystem", detail: "Works with its neighbours across real interfaces." },
  { id: "engine", label: "Engine", detail: "Operates as an integrated engine to a written objective." },
  { id: "propulsion-system", label: "Propulsion system", detail: "Engine, feed system and control work together." },
  { id: "vehicle-system", label: "Vehicle system", detail: "The integrated vehicle passes system-level tests." },
  { id: "flight", label: "Flight", detail: "The final, most expensive evidence." },
];

export const TEST_CATEGORIES: readonly { id: string; label: string; detail: string }[] = [
  { id: "component", label: "Component Testing", detail: "Individual parts and assemblies against their own requirements." },
  { id: "subsystem", label: "Subsystem Testing", detail: "Assemblies working together across real interfaces." },
  { id: "propulsion", label: "Propulsion Testing", detail: "Engine and propulsion-system tests on a qualified stand." },
  { id: "hil", label: "Hardware-in-the-Loop", detail: "Real controllers and firmware against simulated hardware." },
  { id: "integrated", label: "Integrated System Testing", detail: "The vehicle tested as one system." },
  { id: "ground", label: "Ground-System Testing", detail: "GSE, ground software and communications end to end." },
  { id: "mission-sim", label: "Mission Simulation", detail: "The full mission rehearsed with people and software." },
  { id: "flight-readiness", label: "Flight Readiness", detail: "Evidence reviewed against flight criteria." },
];

/** Hardware-in-the-loop, at system level. */
export const HIL_CHAIN: readonly { id: string; label: string; real: boolean }[] = [
  { id: "twin", label: "Digital Twin / simulator", real: false },
  { id: "vehicle", label: "Simulated vehicle", real: false },
  { id: "environment", label: "Sensor / environment simulation", real: false },
  { id: "controller", label: "Real controller hardware", real: true },
  { id: "firmware", label: "Real firmware", real: true },
  { id: "commands", label: "Command outputs", real: true },
  { id: "response", label: "Simulated / physical response", real: false },
];

/** Virtual to physical. Not every step is implemented today. */
export const VIRTUAL_TO_PHYSICAL: readonly { id: string; label: string; detail: string }[] = [
  { id: "sim", label: "100% simulation", detail: "Everything is a model." },
  { id: "sil", label: "Software-in-the-loop", detail: "Real flight or control software against models." },
  { id: "pil", label: "Processor-in-the-loop", detail: "Software on the target processor." },
  { id: "hil", label: "Hardware-in-the-loop", detail: "Real controller hardware and firmware." },
  { id: "subsystem", label: "Subsystem hardware", detail: "Real subsystems on the bench." },
  { id: "propulsion", label: "Integrated propulsion system", detail: "Engine, feed and control together." },
  { id: "vehicle", label: "Integrated vehicle", detail: "The vehicle as one system." },
  { id: "flight", label: "Flight", detail: "Everything is real." },
];

export const DIGITAL_TWIN_RESPONSIBILITIES: readonly { id: string; label: string }[] = [
  { id: "pre-test", label: "Pre-test prediction" },
  { id: "simulation", label: "Simulation" },
  { id: "expected", label: "Expected response" },
  { id: "scenarios", label: "Scenario exploration" },
  { id: "test-planning", label: "Test planning" },
  { id: "comparison", label: "Predicted vs measured comparison" },
  { id: "anomaly", label: "Anomaly investigation" },
  { id: "model-update", label: "Model updating" },
  { id: "design-feedback", label: "Design feedback" },
];

/** The twin loop. The review can send the program to either update. */
export const TWIN_LOOP: readonly { id: string; label: string; branch?: boolean }[] = [
  { id: "model", label: "Engineering model" },
  { id: "prediction", label: "Prediction" },
  { id: "physical-test", label: "Physical test" },
  { id: "measured", label: "Measured data" },
  { id: "compare", label: "Predicted vs measured" },
  { id: "review", label: "Engineering review" },
  { id: "update", label: "Model update or hardware update", branch: true },
  { id: "retest", label: "Retest" },
];

/** Potential maturity levels. APEX's current level is not claimed. */
export const TWIN_MATURITY: readonly { id: string; level: number; label: string; detail: string }[] = [
  { id: "model", level: 1, label: "Model", detail: "An engineering representation of the hardware." },
  { id: "simulated-system", level: 2, label: "Simulated system", detail: "Subsystem interactions represented." },
  { id: "correlated", level: 3, label: "Correlated model", detail: "Compared with test measurements." },
  { id: "validated-region", level: 4, label: "Validated operating region", detail: "Useful agreement demonstrated within defined limits." },
  { id: "operational-twin", level: 5, label: "Operational engineering twin", detail: "Continuously updated where appropriate." },
];

/** An illustration of what a configuration-aware record holds. Not an APEX record. */
export const CONFIGURATION_RECORD = {
  physical: {
    title: "Engine configuration",
    id: "APEX-ENG-001",
    revision: "Revision C",
    items: ["Hardware baseline", "Firmware baseline", "Software baseline", "Sensor package", "Calibration set", "Test configuration"],
  },
  digital: {
    title: "Twin model",
    id: "DT-ENG-001",
    revision: "Revision 08",
    items: ["Model geometry baseline", "Controller model version", "Sensor model map", "Calibration import", "Prediction set", "Correlation report"],
  },
} as const;

export const MEASUREMENT_CLASSES: readonly string[] = [
  "Pressure",
  "Temperature",
  "Force / thrust",
  "Vibration",
  "Strain",
  "Acceleration",
  "Rotational speed",
  "Position",
  "Timing",
  "Flow-related measurements",
  "Controller states",
  "Electrical measurements",
];

/** Sensor to correlation. Capability ids say who can contribute at each stage. */
export const INSTRUMENTATION_CHAIN: readonly { id: string; label: string; capabilityIds: string[] }[] = [
  { id: "sensor", label: "Sensor", capabilityIds: ["sensors-instrumentation"] },
  { id: "conditioning", label: "Signal conditioning", capabilityIds: ["sensors-instrumentation", "embedded-firmware"] },
  { id: "daq", label: "DAQ", capabilityIds: ["sensors-instrumentation", "ground-software"] },
  { id: "time-sync", label: "Time synchronisation", capabilityIds: ["sensors-instrumentation", "ground-software"] },
  { id: "test-data", label: "Test data", capabilityIds: ["test-data", "cybersecurity"] },
  { id: "analysis", label: "Engineering analysis", capabilityIds: ["test-data", "engineering-ai"] },
  { id: "correlation", label: "Digital Twin correlation", capabilityIds: ["digital-twin"] },
];

/** The fields of a traceable test record. Structure only. */
export const TEST_RECORD_FIELDS: readonly { group: string; fields: string[] }[] = [
  { group: "Identity", fields: ["Test ID", "Test objective", "Procedure"] },
  { group: "Configuration", fields: ["Hardware configuration", "Serial numbers", "Software version", "Firmware version", "Sensor configuration", "Calibration references", "Model revision"] },
  { group: "Results", fields: ["Recorded data", "Events", "Observations", "Anomalies"] },
  { group: "Decision", fields: ["Analysis", "Disposition", "Approval"] },
];

/** Every part needs evidence. */
export const QUALITY_THREAD: readonly string[] = [
  "Requirement",
  "Design",
  "Drawing",
  "BOM",
  "Material",
  "Part",
  "Serial number",
  "Manufacturing",
  "Inspection",
  "Assembly",
  "Software / firmware",
  "Test configuration",
  "Test result",
  "Acceptance",
];

/** The twin, in four words: the primary sequence on the Digital Twin page. */
export const TWIN_CYCLE: readonly { id: string; label: string; detail: string }[] = [
  { id: "predict", label: "Predict", detail: "Before a test, the model says what the hardware should do in this configuration." },
  { id: "test", label: "Test", detail: "The instrumented hardware is tested to a written objective." },
  { id: "compare", label: "Compare", detail: "Measured data is set against the prediction, and every deviation is investigated." },
  { id: "learn", label: "Learn", detail: "The model, the hardware or both are updated — and the next test starts better informed." },
];

/**
 * The two Gamyaa AeroSystems Digital Twin experiences linked from the Digital
 * Twin page. They live on aerospace.gamyaa.in: same-tab paths while the
 * microsite is hosted there, absolute new-tab links once it moves.
 */
export const GAMYAA_TWIN_HOST = "https://aerospace.gamyaa.in";

export const GAMYAA_TWIN_EXPERIENCES: readonly { id: string; path: string; title: string; description: string; cta: string }[] = [
  {
    id: "rocket_engine_digital_twin",
    path: "/space/rocket-engine-digital-twin",
    title: "Rocket Engine Digital Twin",
    description:
      "Explore an interactive rocket-engine Digital Twin experience focused on understanding propulsion-system architecture, operating relationships, engineering behaviour, and system-level interaction.",
    cta: "Explore Rocket Engine Digital Twin",
  },
  {
    id: "rocket_propulsion_digital_twin_advanced",
    path: "/space/rocket-engine-digital-twin-advanced",
    title: "Advanced Rocket Engine Digital Twin",
    description:
      "Explore the advanced Digital Twin experience covering deeper system interaction, physics-driven analysis, test-data correlation concepts, engineering intelligence, and advanced propulsion-system understanding.",
    cta: "Explore Advanced Digital Twin",
  },
];
