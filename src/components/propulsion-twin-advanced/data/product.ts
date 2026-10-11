// What the Advanced Rocket Propulsion System Digital Twin says about itself.
// The page, its metadata, its social image and its JSON-LD all read from here.
//
// The propulsion system is a generic educational reference architecture.
// Nothing here is a dimension, a rating or a figure from a real engine.
import type { LevelId, ModuleId } from "../types";

export const PRODUCT = {
  name: "Advanced Rocket Propulsion System Digital Twin",
  shortName: "Advanced Rocket Propulsion Digital Twin",
  subtitle: "From Physical Propulsion System to a Physics-Based, Data-Driven, AI-Assisted Digital Twin",
  supporting: "Model · Instrument · Synchronise · Detect · Diagnose · Predict · Validate",
  focus: "Rocket Propulsion Pressure Monitoring, Fault Detection, Diagnosis and Prognostics",
  description:
    "An interactive engineering tutorial on turning an operating liquid propulsion system into a Digital Twin: instrument it, model its physics, synchronise the model with telemetry, estimate what cannot be measured, and use residuals, physics and machine learning to detect, diagnose and predict faults, with uncertainty and evidence stated throughout.",
  route: "/space/rocket-engine-digital-twin-advanced",
  homeRoute: "/space",
  homeLabel: "Space",
  fundamentalsRoute: "/space/rocket-engine-digital-twin",
  fundamentalsName: "Rocket Engine Digital Twin Fundamentals",
  fundamentalsCta: "Start with Rocket Engine Digital Twin Fundamentals",
  startLabel: "Start the Tutorial",
  labLabel: "Open the Fault Injection Lab",
  ctoLabel: "CTO / Architect View",
} as const;

export const PREPARED_BY = {
  notes: ["Advanced Rocket Propulsion System Digital Twin is an EV.ENGINEER™ interactive engineering tutorial. It is an independent educational and research-oriented work, and is not affiliated with or endorsed by NASA, SpaceX, ISRO or any other agency or launch provider."],
  reviewed: "2026-10-11",
  reviewedLabel: "11 October 2026",
  imageAlt: "Sudarshana Karkala — EV.ENGINEER",
} as const;

/** Shown on the page, in full, near the top and again at the foot. */
export const CREDIBILITY_NOTICE =
  "This experience is an educational and research-oriented Digital Twin engineering environment. Generic propulsion architecture, simulated telemetry, reference models and illustrative failure scenarios are used unless explicitly identified otherwise. It does not reproduce a proprietary flight engine and is not a flight-certification or flight-safety authority.";

export const VALUE_NOTE = "Every number on this page is SIMULATED or a REFERENCE VALUE, normalised to a reference operating point. None is a value from a flight engine.";

/** The principle the page keeps returning to, one line per source of evidence. */
export const PRINCIPLE = [
  { source: "Physics", says: "tells us what should happen." },
  { source: "Sensors", says: "tell us what appears to be happening." },
  { source: "State estimation", says: "determines what is most likely happening." },
  { source: "AI/ML", says: "finds patterns and deviations that are difficult to encode manually." },
  { source: "The Digital Twin", says: "brings this evidence together to understand, diagnose and predict the state of the physical propulsion system." },
] as const;

export const MODULES: readonly { id: ModuleId; label: string; title: string; summary: string }[] = [
  { id: "overview", label: "Overview", title: "What a Propulsion Digital Twin Is", summary: "The engineering chain from hardware to decision support, and why a 3D model is not a Digital Twin." },
  { id: "system", label: "System", title: "The Propulsion System", summary: "A generic pump-fed liquid propulsion reference architecture, end to end." },
  { id: "pressure", label: "Pressure", title: "Pressure, from Tank to Nozzle", summary: "The pressure network, where it is measured, and what each pressure difference says about health." },
  { id: "physics", label: "Physics", title: "Physics Engine", summary: "The conservation laws and component models behind the expected state, at several fidelities." },
  { id: "data", label: "Data", title: "From Physical System to Digital Twin", summary: "Instrumentation, acquisition, timing, telemetry quality and the twelve steps that connect model and hardware." },
  { id: "twin", label: "Twin", title: "Observed, Estimated, Expected, Predicted", summary: "State estimation, sensor fusion, residuals, uncertainty and model credibility." },
  { id: "ai", label: "AI/ML", title: "When Physics Meets AI", summary: "Where learned models help, where physics is mandatory, and how the two are combined and governed." },
  { id: "fdir", label: "FDIR", title: "Fault Detection, Isolation and Recovery", summary: "A fault library, detection methods, sensor fault versus engine fault, and root-cause reasoning." },
  { id: "health", label: "Health", title: "Prognostics and Health", summary: "Degradation trends, remaining margin, probability of crossing a limit, and readiness." },
  { id: "lab", label: "Lab", title: "Digital Twin Control Room", summary: "Run the simulated twin, inject faults and follow each from physical effect to recommended investigation." },
  { id: "architecture", label: "Architecture", title: "Platform Architecture", summary: "Data architecture, APIs, cybersecurity, the digital thread and the CTO view." },
  { id: "weeks", label: "12 Weeks", title: "12-Week Digital Twin Assignment", summary: "Four phases, twelve weekly deliverables and four reviews, ending in a readiness review." },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, (typeof MODULES)[number]>;

export const LEVELS: readonly { id: LevelId; label: string; ariaLabel: string; text: string }[] = [
  { id: "learn", label: "Learn", ariaLabel: "Learn mode: plain-language teaching", text: "Plain language first: what it is and why it matters." },
  { id: "engineer", label: "Engineer", ariaLabel: "Engineer mode: variables, equations, assumptions and logic", text: "Variables, equations, assumptions, sensor locations, residuals, estimators and FDIR logic." },
  { id: "architect", label: "Architect", ariaLabel: "Architect mode: services, interfaces, governance and deployment", text: "Services, data interfaces, model governance, V&V, deployment and lifecycle." },
];

/** The complete engineering chain the tutorial teaches, in order. */
export const ENGINEERING_CHAIN = [
  "Physical Propulsion System",
  "Sensors",
  "Signal Conditioning",
  "Data Acquisition",
  "Time Synchronisation",
  "Telemetry",
  "Physics Models",
  "State Estimation",
  "Residual Generation",
  "AI/ML Models",
  "Fault Detection",
  "Fault Isolation",
  "Prognostics",
  "Decision Support",
  "Model Validation",
  "Digital Twin",
] as const;

export const AUDIENCE = {
  persona: "A technically experienced CTO who understands software and systems engineering but has never designed a rocket propulsion system or an aerospace Digital Twin.",
  roles: ["CTO and chief architects", "Propulsion systems architects", "Digital Twin architects", "Space-agency and launch-industry engineers", "Aerospace R&D scientists", "Propulsion health-monitoring engineers", "AI/ML engineers entering aerospace", "Systems engineers", "Reliability, IVHM and PHM engineers", "Researchers and PhD scholars", "Senior engineering students"],
  depth: ["Simple explanation", "Engineering explanation", "Mathematical and physical relation", "Digital Twin implementation", "Failure use case"],
} as const;

export const OBJECTIVES: readonly { group: string; items: readonly string[] }[] = [
  { group: "Understand the system", items: ["Read an end-to-end liquid propulsion system", "Identify the physical processes that govern it", "Identify pressure-critical locations", "Select a sensing architecture", "Build a propulsion telemetry architecture"] },
  { group: "Model it", items: ["Build first-principles physics models", "Build reduced-order models that run in real time", "Develop system-identification models", "Develop data-driven models", "Combine physics and machine learning"] },
  { group: "Synchronise and estimate", items: ["Synchronise a virtual system with physical telemetry", "Estimate internal states that are not measured", "Generate model residuals", "Estimate uncertainty"] },
  { group: "Detect, diagnose, predict", items: ["Detect anomalies", "Isolate probable faults", "Distinguish sensor faults from physical-system faults", "Detect degradation", "Forecast future behaviour", "Design FDIR logic"] },
  { group: "Build and prove the platform", items: ["Build Digital Twin APIs and data architecture", "Validate model credibility", "Test the twin against nominal and faulty conditions", "Design a production Digital Twin platform"] },
];

/** The sequence the learner lives through, in their own words. */
export const LEARNING_STORY = [
  "I have a working propulsion system.",
  "I instrument it.",
  "I understand its physics.",
  "I acquire trustworthy telemetry.",
  "I create a mathematical representation.",
  "I calibrate its parameters.",
  "I synchronise model and physical data.",
  "I estimate states I cannot directly measure.",
  "I compare observed and expected behaviour.",
  "I calculate residuals.",
  "I detect abnormal behaviour.",
  "I use physics and AI/ML to determine probable causes.",
  "I distinguish sensor failure from physical failure.",
  "I predict future behaviour with uncertainty.",
  "I validate the model against independent evidence.",
] as const;

export const LEARNING_STORY_END = "I now have a Digital Twin appropriate to its declared fidelity and evidence level.";

/** What the page asks the reader to keep apart. */
export const DISTINCTIONS: readonly { term: string; text: string }[] = [
  { term: "Simulation", text: "A model run under inputs someone chose. It answers what would happen." },
  { term: "Model", text: "A mathematical representation of a system. It has a fidelity, assumptions and an envelope in which it can be trusted." },
  { term: "Digital Shadow", text: "A digital representation that measurements from one physical asset update, one way: asset to model." },
  { term: "Digital Twin", text: "A representation of one specific asset whose model states are continuously updated from that asset's telemetry, and which is used to understand and predict it." },
  { term: "AI model", text: "A model whose behaviour is learned from data instead of written from physical law. It is one component of a twin, never the twin." },
  { term: "Validation evidence", text: "A comparison of model output against independent measurements, with its conditions and its limits stated." },
  { term: "Real physical telemetry", text: "Measurements from hardware. There is none on this page: every signal here is simulated and labelled so." },
];

export const RELATED: readonly { destination: string; href: string; title: string; text: string }[] = [
  { destination: "rocket_twin_fundamentals", href: "/space/rocket-engine-digital-twin", title: "Rocket Engine Digital Twin Fundamentals", text: "Understand the engine: explore the 3D engine, its flows, a simulated test and a first fault" },
  { destination: "satellite_engineering", href: "/space/satellite-engineering", title: "Satellite Engineering", text: "Spacecraft systems architecture and digital twins" },
  { destination: "space", href: "/space", title: "Space", text: "Spacecraft health management, telemetry and safe recovery" },
];

export const MOBILE_NOTE = {
  badge: "USE DESKTOP / LAPTOP FOR ADVANCED 3D ENGINEERING MODE",
  body: "The 3D engineering view of the engine, with its sensors and pressure paths, opens on a laptop or desktop. Everything the tutorial teaches, including the live simulation, the fault lab and every diagram, is available here on your phone.",
} as const;
