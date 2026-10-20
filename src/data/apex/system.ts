/**
 * The rocket as a system of systems, and the engine as a functional model.
 *
 * Statuses here are the visitor-facing maturity labels. Only propulsion has
 * built hardware behind it; everything else is shown as what it is.
 */
import type { DisplayStatus } from "./evidence";

/** Six groups, so the eighteen domains are never shown as eighteen equal cards at once. */
export type SystemLayer = "propulsion" | "vehicle" | "avionics-control" | "software-digital" | "ground-test" | "quality-assurance";

export const SYSTEM_LAYER_LABEL: Record<SystemLayer, string> = {
  propulsion: "Propulsion",
  vehicle: "Vehicle",
  "avionics-control": "Avionics & Control",
  "software-digital": "Software & Digital",
  "ground-test": "Ground & Test",
  "quality-assurance": "Quality & Assurance",
};

export const SYSTEM_LAYER_LINE: Record<SystemLayer, string> = {
  propulsion: "Thrust from stored propellants, under control. Where APEX started.",
  vehicle: "The structure, power and radio hardware that carry everything else.",
  "avionics-control": "The electronics, firmware and sensing that fly the vehicle.",
  "software-digital": "Flight software, telemetry and the digital engineering that connects the evidence.",
  "ground-test": "The test stands, ground systems and instrumentation that produce evidence.",
  "quality-assurance": "Proof that every part and every release is what it should be.",
};

export const SYSTEM_LAYERS: readonly SystemLayer[] = ["propulsion", "vehicle", "avionics-control", "software-digital", "ground-test", "quality-assurance"];

export interface SystemDomain {
  id: string;
  name: string;
  layer: SystemLayer;
  purpose: string;
  /** Other domain ids this one exchanges loads, signals, data or commands with. */
  interfaces: string[];
  evidence: string[];
  /** Capability ids; the partners come from the capability model. */
  capabilityIds: string[];
  status: DisplayStatus;
  statusNote: string;
  dependencies: string[];
}

export const SYSTEM_DOMAINS: readonly SystemDomain[] = [
  {
    id: "propulsion",
    name: "Propulsion",
    layer: "propulsion",
    purpose: "Produces thrust from stored propellants, under control.",
    interfaces: ["structures", "sensors", "instrumentation", "embedded", "ground-hardware", "testing"],
    evidence: ["5 kN-class demonstrator hardware built", "Engine test records — owner confirmation required", "Correlation with engine models — concept"],
    capabilityIds: ["propulsion", "engine-control", "propulsion-test-infrastructure", "materials", "welding-brazing"],
    status: "BUILT",
    statusNote: "5 kN-class gas-generator-cycle liquid-engine demonstrator built.",
    dependencies: ["Test infrastructure", "Instrumentation", "Engine control", "Materials and joining"],
  },
  {
    id: "structures",
    name: "Structures",
    layer: "vehicle",
    purpose: "Carries flight loads and holds every subsystem in place.",
    interfaces: ["propulsion", "power", "avionics", "testing"],
    evidence: ["Load analysis", "Structural test results", "Correlated structural model"],
    capabilityIds: ["structures", "mechanical-systems", "structural-test-labs", "materials"],
    status: "PARTNER_REQUIRED",
    statusNote: "Vehicle structure partners not yet identified.",
    dependencies: ["Vehicle architecture", "Materials", "Structural test labs"],
  },
  {
    id: "power",
    name: "Power",
    layer: "vehicle",
    purpose: "Stores and distributes electrical energy to every system.",
    interfaces: ["avionics", "embedded", "sensors", "ground-hardware", "structures"],
    evidence: ["Power budget", "Electrical interface tests", "Battery acceptance tests"],
    capabilityIds: ["power-electrical", "emi-emc"],
    status: "PARTNER_REQUIRED",
    statusNote: "Power and electrical partners not yet identified.",
    dependencies: ["Avionics architecture", "EMC design", "Ground power"],
  },
  {
    id: "avionics",
    name: "Avionics",
    layer: "avionics-control",
    purpose: "Computes, routes data and distributes commands on board.",
    interfaces: ["flight-software", "gnc", "telemetry", "power", "sensors", "embedded"],
    evidence: ["Board-level tests", "Environmental and EMC tests", "HIL results"],
    capabilityIds: ["avionics", "emi-emc", "environmental-testing"],
    status: "PARTNER_REQUIRED",
    statusNote: "Avionics and flight-electronics partners required.",
    dependencies: ["Power", "Embedded systems", "EMC testing"],
  },
  {
    id: "embedded",
    name: "Embedded Systems",
    layer: "avionics-control",
    purpose: "Controllers that read sensors and drive actuators in real time.",
    interfaces: ["firmware", "sensors", "propulsion", "power", "avionics"],
    evidence: ["Controller hardware records", "Interface tests", "HIL results"],
    capabilityIds: ["embedded-firmware", "engine-control"],
    status: "CONCEPT",
    statusNote: "Integrated ECU published as the demonstrator's control approach; embedded partner proposed.",
    dependencies: ["Sensor interfaces", "Actuators", "Power", "Firmware"],
  },
  {
    id: "firmware",
    name: "Firmware",
    layer: "avionics-control",
    purpose: "The control logic, drivers and diagnostics running on embedded hardware.",
    interfaces: ["embedded", "cybersecurity", "flight-software", "testing"],
    evidence: ["Firmware baseline", "Unit and integration tests", "HIL results", "Signed release records"],
    capabilityIds: ["embedded-firmware", "cybersecurity", "software-engineering"],
    status: "CONCEPT",
    statusNote: "Proposed embedded and security partners.",
    dependencies: ["Embedded hardware", "Interface definitions", "Release process"],
  },
  {
    id: "sensors",
    name: "Sensors",
    layer: "avionics-control",
    purpose: "Measure pressure, temperature, force, vibration and other physical quantities.",
    interfaces: ["instrumentation", "embedded", "propulsion", "gnc"],
    evidence: ["Sensor list and ranges", "Calibration certificates", "Channel checkouts"],
    capabilityIds: ["sensors-instrumentation"],
    status: "PARTNER_REQUIRED",
    statusNote: "Interface firmware partner proposed; sensor and calibration partners required.",
    dependencies: ["Measurement requirements", "Calibration", "Signal conditioning"],
  },
  {
    id: "instrumentation",
    name: "Instrumentation",
    layer: "ground-test",
    purpose: "Conditions, digitises and time-stamps measurements into test data.",
    interfaces: ["sensors", "ground-software", "digital-engineering", "testing"],
    evidence: ["Instrumentation plan", "DAQ configuration", "Time-sync verification"],
    capabilityIds: ["sensors-instrumentation", "test-data", "ground-software"],
    status: "PARTNER_REQUIRED",
    statusNote: "DAQ and signal-conditioning partners required.",
    dependencies: ["Sensors", "DAQ", "Time synchronisation", "Ground software"],
  },
  {
    id: "gnc",
    name: "GNC",
    layer: "avionics-control",
    purpose: "Guides, navigates and controls the vehicle along its trajectory.",
    interfaces: ["avionics", "flight-software", "sensors", "propulsion", "digital-engineering"],
    evidence: ["Trajectory analysis", "Monte Carlo campaigns", "HIL results"],
    capabilityIds: ["gnc", "simulation"],
    status: "PARTNER_REQUIRED",
    statusNote: "GNC specialists required.",
    dependencies: ["Vehicle model", "Navigation sensors", "Flight software"],
  },
  {
    id: "telemetry",
    name: "Telemetry",
    layer: "software-digital",
    purpose: "Packages vehicle data for transmission and recording.",
    interfaces: ["avionics", "rf", "ground-software", "cybersecurity"],
    evidence: ["Telemetry format definition", "End-to-end data checks"],
    capabilityIds: ["rf-telemetry", "test-data"],
    status: "PARTNER_REQUIRED",
    statusNote: "Telemetry partners required.",
    dependencies: ["Avionics", "RF link", "Ground software"],
  },
  {
    id: "rf",
    name: "RF Communications",
    layer: "vehicle",
    purpose: "Carries telemetry, tracking and command between vehicle and ground.",
    interfaces: ["telemetry", "avionics", "ground-hardware", "cybersecurity"],
    evidence: ["Link budget", "Link tests", "Range compatibility tests"],
    capabilityIds: ["rf-telemetry", "emi-emc"],
    status: "PARTNER_REQUIRED",
    statusNote: "RF partners required.",
    dependencies: ["Telemetry format", "Ground station", "EMC"],
  },
  {
    id: "flight-software",
    name: "Flight Software",
    layer: "software-digital",
    purpose: "Runs the mission sequence, GNC and fault management on board.",
    interfaces: ["avionics", "gnc", "firmware", "telemetry", "cybersecurity"],
    evidence: ["Software requirements", "SIL/PIL/HIL results", "Release records"],
    capabilityIds: ["software-engineering", "cybersecurity", "gnc"],
    status: "PARTNER_REQUIRED",
    statusNote: "Flight-software partners required.",
    dependencies: ["Avionics", "GNC", "Verification process"],
  },
  {
    id: "ground-software",
    name: "Ground Software",
    layer: "ground-test",
    purpose: "Controls tests, acquires data and shows engineers what is happening.",
    interfaces: ["instrumentation", "ground-hardware", "telemetry", "digital-engineering", "cybersecurity"],
    evidence: ["Software verification", "Dry-run records", "Test-day logs"],
    capabilityIds: ["ground-software", "software-engineering", "test-data"],
    status: "CONCEPT",
    statusNote: "Ground and test software through the engineering collaboration with Gamyaa AeroSystems.",
    dependencies: ["DAQ", "Test procedures", "Data platform"],
  },
  {
    id: "ground-hardware",
    name: "Ground Hardware",
    layer: "ground-test",
    purpose: "Test stands, servicing equipment, handling and ground power.",
    interfaces: ["propulsion", "ground-software", "power", "rf", "testing"],
    evidence: ["Proof and leak tests", "Facility readiness records"],
    capabilityIds: ["gse", "propulsion-test-infrastructure"],
    status: "PARTNER_REQUIRED",
    statusNote: "GSE and test-facility partners required.",
    dependencies: ["Safety analysis", "Interface definitions", "Facilities"],
  },
  {
    id: "quality",
    name: "Quality",
    layer: "quality-assurance",
    purpose: "Proves every part matches its design and every process ran as specified.",
    interfaces: ["digital-engineering", "testing", "propulsion", "structures"],
    evidence: ["FAI packages", "Inspection records", "Non-conformance dispositions"],
    capabilityIds: ["manufacturing-quality", "quality-intelligence", "digital-quality-thread", "ndt"],
    status: "CONCEPT",
    statusNote: "Digital quality thread in concept, through the engineering collaboration with Gamyaa AeroSystems.",
    dependencies: ["Drawings", "Inspection", "Traceability"],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    layer: "quality-assurance",
    purpose: "Protects firmware, commands, telemetry and engineering data.",
    interfaces: ["firmware", "flight-software", "ground-software", "telemetry", "rf", "digital-engineering"],
    evidence: ["Threat model", "Secure boot and signing records", "Security test results"],
    capabilityIds: ["cybersecurity"],
    status: "CONCEPT",
    statusNote: "Proposed cybersecurity partner.",
    dependencies: ["Software architecture", "Release process", "Access control"],
  },
  {
    id: "digital-engineering",
    name: "Digital Engineering",
    layer: "software-digital",
    purpose: "Models, simulation, Digital Twin, test data and the digital thread that connect the evidence.",
    interfaces: ["testing", "instrumentation", "quality", "gnc", "ground-software", "propulsion"],
    evidence: ["Model revisions tied to configuration", "Correlation reports", "Traceability coverage"],
    capabilityIds: ["digital-twin", "simulation", "test-data", "systems-engineering", "engineering-ai"],
    status: "CONCEPT",
    statusNote: "Digital engineering through the engineering collaboration with Gamyaa AeroSystems.",
    dependencies: ["Instrumentation", "Configuration control", "Test data"],
  },
  {
    id: "testing",
    name: "Testing",
    layer: "ground-test",
    purpose: "Builds confidence step by step, from material coupons to integrated systems.",
    interfaces: ["propulsion", "ground-hardware", "instrumentation", "digital-engineering", "quality", "firmware"],
    evidence: ["Test plans", "Test readiness records", "Test reports and dispositions"],
    capabilityIds: ["integration-test-authority", "propulsion-test-infrastructure", "environmental-testing", "structural-test-labs", "emi-emc"],
    status: "EVIDENCE_REQUIRED",
    statusNote: "Test records to be published only when APEX confirms them.",
    dependencies: ["Facilities", "Instrumentation", "Test authority"],
  },
];

export function systemDomain(id: string): SystemDomain {
  const found = SYSTEM_DOMAINS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown APEX system domain: ${id}`);
  return found;
}

/** Undirected interface pairs, for the N² matrix. */
export function interfacePairs(): [string, string][] {
  const pairs = new Map<string, [string, string]>();
  for (const domain of SYSTEM_DOMAINS) {
    for (const other of domain.interfaces) {
      const key = [domain.id, other].sort().join("|");
      if (!pairs.has(key)) pairs.set(key, [domain.id, other]);
    }
  }
  return [...pairs.values()];
}

export function hasInterface(a: string, b: string): boolean {
  if (a === b) return false;
  return Boolean(SYSTEM_DOMAINS.find((d) => d.id === a)?.interfaces.includes(b) || SYSTEM_DOMAINS.find((d) => d.id === b)?.interfaces.includes(a));
}

/** What APEX holds at the centre of the system. */
export const APEX_RESPONSIBILITIES: readonly { id: string; label: string; detail: string }[] = [
  { id: "propulsion", label: "Propulsion", detail: "Engine architecture, requirements and hardware." },
  { id: "mission", label: "Mission requirements", detail: "What the vehicle must do, and for whom." },
  { id: "architecture", label: "System architecture", detail: "How the subsystems fit together." },
  { id: "integration", label: "Integration", detail: "Integration authority across partners." },
  { id: "test-objectives", label: "Test objectives", detail: "What each test must prove." },
  { id: "configuration", label: "Configuration", detail: "The hardware, firmware and software baselines." },
  { id: "decisions", label: "Engineering decisions", detail: "Design choices and trade-offs." },
  { id: "acceptance", label: "Acceptance", detail: "Whether evidence is good enough." },
];

/** The engine as functional blocks: no parameters, no construction detail. */
export interface EngineBlock {
  id: string;
  name: string;
  kind: "flow" | "cross-cutting";
  does: string;
  interfaces: string[];
  capability: string;
  verifiedBy: string[];
  capabilityIds: string[];
}

export const ENGINE_BLOCKS: readonly EngineBlock[] = [
  {
    id: "propellant-management",
    name: "Propellant Management",
    kind: "flow",
    does: "Stores, conditions and supplies propellants to the engine at the right state.",
    interfaces: ["Flow / feed system", "Ground support equipment", "Sensors & instrumentation"],
    capability: "Fluid-system design, tank and line hardware, servicing.",
    verifiedBy: ["Proof and leak checks", "Servicing rehearsals", "Instrumented fill and drain"],
    capabilityIds: ["propulsion", "gse", "mechanical-systems"],
  },
  {
    id: "flow-feed",
    name: "Flow / Feed System",
    kind: "flow",
    does: "Delivers propellants to combustion in the quantities the engine needs.",
    interfaces: ["Propellant management", "Combustion system", "Engine control"],
    capability: "Feed-system and fluid-component engineering under APEX direction.",
    verifiedBy: ["Component tests", "Flow characterisation", "Engine test data"],
    capabilityIds: ["propulsion", "precision-machining", "propulsion-test-infrastructure"],
  },
  {
    id: "combustion",
    name: "Combustion System",
    kind: "flow",
    does: "Mixes and burns propellants to produce hot, high-pressure gas.",
    interfaces: ["Flow / feed system", "Thrust generation", "Thermal management", "Engine control"],
    capability: "Combustion engineering, joining and materials.",
    verifiedBy: ["Component tests", "Engine tests", "Post-test inspection"],
    capabilityIds: ["propulsion", "welding-brazing", "materials", "ndt"],
  },
  {
    id: "thrust",
    name: "Thrust Generation",
    kind: "flow",
    does: "Expands combustion gas to produce thrust.",
    interfaces: ["Combustion system", "Mechanical / structural system", "Thermal management"],
    capability: "Nozzle design, analysis and fabrication.",
    verifiedBy: ["Thrust measurement on a test stand", "Post-test inspection", "Correlation with prediction"],
    capabilityIds: ["propulsion", "simulation", "propulsion-test-infrastructure"],
  },
  {
    id: "engine-control",
    name: "Engine Control",
    kind: "cross-cutting",
    does: "Sequences start-up, steady operation and shutdown, and safes the engine on a fault.",
    interfaces: ["Flow / feed system", "Combustion system", "Sensors & instrumentation", "Ground software"],
    capability: "Embedded control hardware, firmware and control logic.",
    verifiedBy: ["Firmware unit tests", "Hardware-in-the-loop", "Dry runs", "Engine test logs"],
    capabilityIds: ["engine-control", "embedded-firmware", "cybersecurity"],
  },
  {
    id: "sensors-instrumentation",
    name: "Sensors & Instrumentation",
    kind: "cross-cutting",
    does: "Measures what the engine is doing, for control and for evidence.",
    interfaces: ["Every functional block", "DAQ", "Digital Twin"],
    capability: "Sensors, signal conditioning, DAQ, calibration and time synchronisation.",
    verifiedBy: ["Calibration", "Channel checkouts", "Time-sync verification"],
    capabilityIds: ["sensors-instrumentation", "test-data"],
  },
  {
    id: "thermal",
    name: "Thermal Management",
    kind: "cross-cutting",
    does: "Keeps hardware within its temperature limits.",
    interfaces: ["Combustion system", "Thrust generation", "Sensors & instrumentation"],
    capability: "Thermal analysis, cooling design and thermal instrumentation.",
    verifiedBy: ["Thermal analysis", "Instrumented engine tests", "Post-test inspection"],
    capabilityIds: ["propulsion", "simulation", "digital-twin"],
  },
  {
    id: "mechanical",
    name: "Mechanical / Structural System",
    kind: "cross-cutting",
    does: "Holds the engine together and carries its loads into the vehicle or test stand.",
    interfaces: ["Thrust generation", "Vehicle structure", "Test stand"],
    capability: "Mechanical design, structural analysis, machining and joining.",
    verifiedBy: ["Analysis", "Fit checks", "Proof and load tests", "Inspection"],
    capabilityIds: ["mechanical-systems", "structures", "precision-machining", "welding-brazing"],
  },
];

/** Engineering governance gates. Process concepts; none is claimed complete. */
export const REVIEW_GATES: readonly { id: string; acronym: string; name: string; question: string }[] = [
  { id: "mcr", acronym: "MCR", name: "Mission Concept Review", question: "Is the mission worth doing, and is the concept feasible?" },
  { id: "srr", acronym: "SRR", name: "System Requirements Review", question: "Are the requirements complete, consistent and verifiable?" },
  { id: "pdr", acronym: "PDR", name: "Preliminary Design Review", question: "Does the preliminary design meet the requirements with acceptable risk?" },
  { id: "cdr", acronym: "CDR", name: "Critical Design Review", question: "Is the detailed design mature enough to build and test?" },
  { id: "trr", acronym: "TRR", name: "Test Readiness Review", question: "Are hardware, procedures, facilities and people ready to test safely?" },
  { id: "frr", acronym: "FRR", name: "Flight Readiness Review", question: "Is the evidence sufficient to fly?" },
];

/** The six executive domains the homepage shows. The full eighteen live on /system. */
export const HOME_DOMAINS: readonly { id: string; name: string; line: string }[] = [
  { id: "propulsion", name: "Propulsion", line: "Where APEX started: the 5 kN-class liquid-engine demonstrator." },
  { id: "structures", name: "Structures", line: "Tanks and load paths that carry every other system." },
  { id: "avionics", name: "Avionics", line: "Flight computers, power and data handling on board." },
  { id: "gnc", name: "Guidance & Control", line: "Where the vehicle goes, and how it knows where it is." },
  { id: "software", name: "Software", line: "Flight, ground and test software under one release discipline." },
  { id: "ground-test", name: "Ground & Test", line: "Test stands, ground equipment and the facilities that produce evidence." },
];
