// Product identity, reference-aircraft facts and the system catalogue.
// Everything here describes a digital engineering demonstrator: figures are
// reference or simulated values, never flight hardware.
import type { AudienceMode, FlowKind, HealthState, SystemId, MonitoredSystemId, VehicleState, XrayFilter, FlightConfig } from "../types";

export const PRODUCT = {
  name: "UFlight™ 3D",
  wordmark: "UFLIGHT™ 3D",
  headline: "Advanced Health Monitoring Systems for Next-Generation Air Mobility",
  headlineLines: ["Advanced Health Monitoring Systems for", "Next-Generation Air Mobility"],
  tagline: "THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE.",
  platform: "6-Seat eVTOL Reference Platform",
  route: "/aerospace/uflight-3d",
  homeRoute: "/aerospace",
  homeLabel: "Aerospace",
  enterLabel: "ENTER DIGITAL TWIN",
  demoLabel: "RUN HEALTH DEMO",
} as const;

export const AIRCRAFT = {
  name: "UFlight™ Reference eVTOL",
  code: "UFlight™ UX-6",
  tail: "UX6-001",
  seats: "1 pilot + 5 passengers",
  configuration: "High wing · 8 distributed electric propulsion units · wing-borne cruise",
  /** Reference figures used for labels. They size the picture; they are not performance claims. */
  reference: {
    spanM: 14.5,
    lengthM: 9.7,
    rotorDiameterM: 2.1,
    propulsionUnits: 8,
    tiltUnits: 4,
    liftUnits: 4,
    batteryModules: 8,
    flightComputeChannels: 3,
  },
} as const;

export const DISCLAIMER =
  "UFlight™ Reference eVTOL is a digital engineering demonstrator. Aircraft configuration, telemetry, health states, faults and predictions shown in this experience are illustrative/simulated unless explicitly identified otherwise.";

/** Who prepared the experience, and when its information was last reviewed. */
export const PREPARED_BY = {
  notes: [
    "UFlight™ 3D is an EV.ENGINEER™ digital engineering demonstrator focused on Advanced Health Monitoring Systems for Aerospace & Autonomous Platforms, with a next-generation air mobility reference platform.",
    "Commercial arrangements, where applicable, are handled by iTelematics Software Private Limited.",
  ],
  reviewed: "2026-10-01",
  reviewedLabel: "1 October 2026",
} as const;

export const PROVENANCE = {
  platform: "REFERENCE PLATFORM · DIGITAL ENGINEERING DEMONSTRATOR",
  data: "SIMULATED HEALTH DATA",
  signal: "SIMULATED SIGNAL",
  architecture: "REFERENCE ARCHITECTURE",
  conceptual: "CONCEPTUAL ARCHITECTURE",
  visualization: "ENGINEERING VISUALIZATION",
  scenario: "REFERENCE / SIMULATED",
} as const;

/** Colours of the things that move through the aircraft. Used sparingly: the airframe is never tinted permanently. */
export const FLOW_COLOR: Record<FlowKind, string> = {
  power: "#f2b544",
  data: "#5ed3e6",
  control: "#a9cdf7",
  thermal: "#f07a4a",
  health: "#e3f6fa",
};

export const STATE_COLOR: Record<HealthState, string> = {
  NOMINAL: "#b9e6ec",
  DEGRADED: "#f5b041",
  LIMITED: "#f0893c",
  MAINTENANCE_REQUIRED: "#ec6a4c",
  UNAVAILABLE: "#e5484d",
};

export const STATE_LABEL: Record<HealthState, string> = {
  NOMINAL: "NOMINAL",
  DEGRADED: "DEGRADED",
  LIMITED: "LIMITED",
  MAINTENANCE_REQUIRED: "MAINTENANCE REQUIRED",
  UNAVAILABLE: "UNAVAILABLE",
};

/** A shape per state, so state never rests on colour alone. */
export const STATE_GLYPH: Record<HealthState, string> = {
  NOMINAL: "●",
  DEGRADED: "◐",
  LIMITED: "▲",
  MAINTENANCE_REQUIRED: "■",
  UNAVAILABLE: "✕",
};

/** Worst last. */
export const STATE_ORDER: readonly HealthState[] = ["NOMINAL", "DEGRADED", "LIMITED", "MAINTENANCE_REQUIRED", "UNAVAILABLE"];
export const stateRank = (state: HealthState) => STATE_ORDER.indexOf(state);

export const VEHICLE_LABEL: Record<VehicleState, string> = {
  MISSION_CAPABLE: "MISSION CAPABLE",
  MISSION_CAPABLE_WITH_LIMITATION: "MISSION CAPABLE WITH LIMITATION",
  NOT_RELEASED: "NOT RELEASED",
};

export const VEHICLE_SEVERITY: Record<VehicleState, HealthState> = {
  MISSION_CAPABLE: "NOMINAL",
  MISSION_CAPABLE_WITH_LIMITATION: "LIMITED",
  NOT_RELEASED: "MAINTENANCE_REQUIRED",
};

export interface SystemInfo {
  id: SystemId;
  name: string;
  /** One sentence for the executive view. */
  purpose: string;
  /** Architecture, as short statements. */
  architecture: readonly string[];
  /** What health monitoring watches in this system. */
  monitored: readonly string[];
  flow: FlowKind;
  /** The chain the flow overlay draws. */
  chain: readonly string[];
  xray: XrayFilter;
}

export const SYSTEMS: Record<SystemId, SystemInfo> = {
  propulsion: {
    id: "propulsion",
    name: "PROPULSION",
    purpose: "Eight independent electric propulsion units provide lift, transition and cruise thrust.",
    architecture: [
      "4 tilting units ahead of the wing: lift in hover, thrust in cruise",
      "4 lift units on the booms: lift in hover and transition, stopped in cruise",
      "Each unit has its own motor, inverter, controller, cooling and sensors",
      "A unit can be isolated without removing its neighbours",
    ],
    monitored: ["Phase current and DC voltage", "Winding, bearing and inverter temperature", "Bearing and shaft vibration", "Speed, torque response and tilt position"],
    flow: "power",
    chain: ["Battery", "HV bus", "Inverter", "Motor"],
    xray: "propulsion",
  },
  energy: {
    id: "energy",
    name: "ENERGY",
    purpose: "Two battery packs under the cabin floor store the energy and deliver power to every system.",
    architecture: [
      "2 packs of 4 modules, either side of the keel, isolated from the cabin by the structural floor",
      "Primary and secondary battery management",
      "HV contactor assembly feeds the HV DC bus to every propulsion unit",
      "DC/DC converter feeds the LV DC bus for avionics and flight controls",
    ],
    monitored: ["State of charge and state of health", "Module temperature and temperature spread", "Cell-group voltage spread", "Internal resistance estimate and insulation resistance"],
    flow: "power",
    chain: ["Battery", "DC/DC", "LV bus", "Avionics"],
    xray: "power",
  },
  avionics: {
    id: "avionics",
    name: "AVIONICS",
    purpose: "The aircraft data network connects flight computers, displays, sensors and health computing.",
    architecture: [
      "Two independent network switches (A and B)",
      "Equipment bay behind the cabin, forward bay under the flight deck",
      "Flight displays for the pilot",
      "Separate routes for flight-critical, health and maintenance data",
    ],
    monitored: ["Network link state", "Equipment temperature", "Supply voltage", "Processor load"],
    flow: "data",
    chain: ["Sensors", "Remote I/O", "Aircraft data network", "Flight compute", "Health compute"],
    xray: "avionics",
  },
  flightControl: {
    id: "flightControl",
    name: "FLIGHT CONTROL",
    purpose: "Three flight-compute channels turn pilot and navigation inputs into surface and propulsion commands.",
    architecture: [
      "3 flight-compute channels (FCC-A, FCC-B, FCC-C) in separate locations",
      "A voting / agreement layer produces the command output",
      "Actuator controllers drive flaperons, elevator, rudders and tilt",
      "Propulsion control units close the loop at each motor",
    ],
    monitored: ["Channel agreement", "Actuator position against command", "Actuator current and temperature", "Control availability"],
    flow: "control",
    chain: ["Navigation / sensor state", "Flight computer", "Control law", "Actuator / motor controller", "Aircraft response"],
    xray: "flightControl",
  },
  navigation: {
    id: "navigation",
    name: "NAVIGATION",
    purpose: "Several independent sources are fused so the position solution survives the loss of any one of them.",
    architecture: [
      "GNSS, two inertial units, magnetometer",
      "Air data, radar altimeter, vision / perception sensors",
      "Navigation processor fuses the sources",
      "Sources are cross-checked against each other",
    ],
    monitored: ["Source availability", "Sensor agreement", "Position uncertainty", "Sensor drift"],
    flow: "data",
    chain: ["Navigation sensors", "Navigation processor", "Flight computer"],
    xray: "avionics",
  },
  structures: {
    id: "structures",
    name: "STRUCTURES",
    purpose: "Wing spars, fuselage frames, booms and landing gear carry the flight and ground loads.",
    architecture: [
      "Main and rear wing spars through a centre box on the fuselage frames",
      "Booms carry lift-unit and tail loads into the wing box",
      "Battery enclosure is a structural member under the floor",
      "Landing gear loads enter at the keel frames",
    ],
    monitored: ["Strain at spar roots, boom attachments and landing gear", "Airframe vibration", "Load-path usage", "Fatigue exposure"],
    flow: "health",
    chain: ["Rotor mount", "Boom / pylon", "Main spar", "Wing root", "Fuselage frame"],
    xray: "structure",
  },
  thermal: {
    id: "thermal",
    name: "THERMAL",
    purpose: "Heat from the battery, electronics and motors is carried to heat exchangers and rejected to the air.",
    architecture: [
      "Liquid loop: battery cold plates and avionics, through pumps to a belly heat exchanger",
      "Each propulsion unit has its own cooling interface for motor and inverter",
      "Manifold balances flow between branches",
      "Temperatures and coolant pressure are monitored",
    ],
    monitored: ["Motor, inverter and bearing temperature", "Battery module temperature", "Coolant temperature and pressure", "Cooling performance"],
    flow: "thermal",
    chain: ["Heat source", "Cooling interface", "Fluid loop", "Heat exchanger"],
    xray: "thermal",
  },
  communications: {
    id: "communications",
    name: "COMMUNICATIONS",
    purpose: "Secure links carry operational and maintenance data between the aircraft and the ground.",
    architecture: [
      "Ground link for operational data",
      "Maintenance link for health and maintenance data",
      "A secure gateway separates aircraft networks from external links",
      "Antennas on the fuselage crown",
    ],
    monitored: ["Link state", "Gateway state", "Data backlog"],
    flow: "data",
    chain: ["Health compute", "Secure communication", "Ground health platform"],
    xray: "data",
  },
  hums: {
    id: "hums",
    name: "HUMS",
    purpose: "Health and usage monitoring turns sensor signals into health states, diagnoses and maintenance advice.",
    architecture: [
      "Acquisition nodes near the sensors condition, sample and timestamp signals",
      "Sensor gateways bring the data to the health network",
      "Edge processor extracts features; health computer reasons about state",
      "Maintenance gateway passes results to the ground",
    ],
    monitored: ["Sensor validity", "Acquisition node state", "Data completeness", "Model residuals"],
    flow: "health",
    chain: ["Sensor", "Acquisition", "Health compute", "Edge analytics", "Diagnostic model", "Prognostic model", "Ground maintenance"],
    xray: "health",
  },
};

export const SYSTEM_ORDER: readonly SystemId[] = ["propulsion", "energy", "avionics", "flightControl", "navigation", "structures", "thermal", "communications", "hums"];

/** Order of the vehicle-level health table. */
export const MONITORED_SYSTEMS: readonly MonitoredSystemId[] = ["propulsion", "energy", "flightControl", "structures", "avionics", "thermal", "navigation"];

export const HEALTH_TABLE_LABEL: Record<MonitoredSystemId, string> = {
  propulsion: "PROPULSION",
  energy: "ENERGY",
  flightControl: "FLIGHT CONTROL",
  structures: "STRUCTURE",
  avionics: "AVIONICS",
  thermal: "THERMAL",
  navigation: "NAVIGATION",
};

export const XRAY_FILTERS: readonly { id: XrayFilter; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "power", label: "POWER" },
  { id: "propulsion", label: "PROPULSION" },
  { id: "avionics", label: "AVIONICS" },
  { id: "flightControl", label: "FLIGHT CONTROL" },
  { id: "thermal", label: "THERMAL" },
  { id: "structure", label: "STRUCTURE" },
  { id: "data", label: "DATA" },
  { id: "health", label: "HEALTH" },
];

export const FLIGHT_CONFIGS: readonly { id: FlightConfig; label: string; loadCase: string; caption: string }[] = [
  { id: "ground", label: "GROUND", loadCase: "LANDING", caption: "Ground loads enter through the landing gear into the keel frames." },
  { id: "hover", label: "HOVER", loadCase: "HOVER", caption: "All eight units lift. Loads enter at the rotor mounts and gather at the wing root." },
  { id: "transition", label: "TRANSITION", loadCase: "TRANSITION", caption: "Tilt units rotate forward as the wing takes over lift." },
  { id: "cruise", label: "CRUISE", loadCase: "CRUISE", caption: "The wing carries the aircraft. Lift units are stopped and aligned with the booms." },
];

/** System-of-systems dependencies: what each system needs from the others. */
export interface Dependency {
  on: SystemId;
  /** What is provided. */
  provides: string;
}

export const DEPENDENTS_OF_BATTERY: readonly SystemId[] = ["propulsion", "flightControl", "avionics", "thermal", "communications", "hums"];

export const SYSTEM_DEPENDENCIES: Record<SystemId, readonly Dependency[]> = {
  propulsion: [
    { on: "energy", provides: "Power" },
    { on: "thermal", provides: "Cooling" },
    { on: "flightControl", provides: "Control" },
    { on: "hums", provides: "Health" },
    { on: "structures", provides: "Structure" },
  ],
  energy: [
    { on: "thermal", provides: "Cooling" },
    { on: "structures", provides: "Enclosure and isolation" },
    { on: "hums", provides: "Health" },
  ],
  avionics: [
    { on: "energy", provides: "LV power" },
    { on: "thermal", provides: "Cooling" },
  ],
  flightControl: [
    { on: "energy", provides: "LV power" },
    { on: "navigation", provides: "State estimate" },
    { on: "avionics", provides: "Data network" },
    { on: "propulsion", provides: "Thrust response" },
  ],
  navigation: [
    { on: "energy", provides: "LV power" },
    { on: "avionics", provides: "Data network" },
  ],
  structures: [{ on: "hums", provides: "Usage and load monitoring" }],
  thermal: [
    { on: "energy", provides: "Pump power" },
    { on: "avionics", provides: "Control" },
  ],
  communications: [
    { on: "energy", provides: "LV power" },
    { on: "avionics", provides: "Data network" },
  ],
  hums: [
    { on: "energy", provides: "LV power" },
    { on: "avionics", provides: "Data network" },
    { on: "communications", provides: "Ground link" },
  ],
};

/** Systems that depend on `id`, with what they receive from it. */
export function dependentsOf(id: SystemId): { system: SystemId; provides: string }[] {
  return SYSTEM_ORDER.flatMap((system) => SYSTEM_DEPENDENCIES[system].filter((d) => d.on === id).map((d) => ({ system, provides: d.provides })));
}

/** What a propulsion unit depends on, by kind of dependency. */
export const PROPULSION_UNIT_DEPENDENCIES: readonly { kind: string; from: string; system: SystemId }[] = [
  { kind: "Power", from: "HV DC bus from the battery contactor assembly", system: "energy" },
  { kind: "Cooling", from: "Unit cooling interface", system: "thermal" },
  { kind: "Control", from: "Flight-compute command through the motor controller", system: "flightControl" },
  { kind: "Sensor", from: "Vibration, temperature, current and speed sensors", system: "hums" },
  { kind: "Health", from: "Acquisition node, edge processor and health computer", system: "hums" },
  { kind: "Structure", from: "Pylon or boom into the main spar", system: "structures" },
];

export const AUDIENCE_MODES: readonly { id: AudienceMode; label: string }[] = [
  { id: "executive", label: "EXECUTIVE" },
  { id: "engineer", label: "ENGINEER" },
];

/** The conceptual chain every sequence in the experience maps to. */
export const CONCEPT_CHAIN = ["AIRCRAFT", "SYSTEM", "COMPONENT", "SENSOR", "SIGNAL", "HEALTH MODEL", "DIAGNOSIS", "PROGNOSIS", "MISSION CONSEQUENCE", "MAINTENANCE DECISION"] as const;

/** Mobile overview cards and flow. */
export const OVERVIEW_CARDS: readonly { id: SystemId; title: string; text: string }[] = [
  { id: "propulsion", title: "PROPULSION", text: "Monitor motor, inverter, rotor and bearing health." },
  { id: "energy", title: "ENERGY", text: "Monitor battery state, thermal condition and power capability." },
  { id: "avionics", title: "AVIONICS", text: "Track flight computers, networks and electronic-system health." },
  { id: "flightControl", title: "FLIGHT CONTROL", text: "Monitor sensors, actuators and control availability." },
  { id: "structures", title: "STRUCTURE", text: "Monitor vibration, strain and fatigue exposure." },
  { id: "hums", title: "HUMS", text: "Detect anomalies, diagnose degradation and support predictive maintenance." },
];

export const OVERVIEW_FLOW = ["AIRCRAFT", "SENSORS", "HEALTH MONITORING", "DIAGNOSIS", "PROGNOSIS", "MAINTENANCE"] as const;

export const DESKTOP_RECOMMENDATION = {
  badge: "DESKTOP EXPERIENCE RECOMMENDED",
  body: "For the complete interactive experience — including the 3D aircraft, X-ray systems, HUMS architecture, fault injection, digital twin, mission simulation and health analytics — open UFlight™ 3D on a laptop or desktop computer.",
} as const;

export const FALLBACK_MESSAGE = {
  badge: "HEALTH-SYSTEM OVERVIEW",
  body: "This browser is showing the overview edition of UFlight™ 3D. For the interactive 3D aircraft, open this page in a current desktop browser with hardware acceleration enabled.",
} as const;

export const POSTER = {
  src: "/aerospace/uflight-3d/poster.jpg",
  alt: "UFlight™ Reference eVTOL: a six-seat high-wing electric aircraft with eight propulsion units, in a dark engineering studio",
  width: 1600,
  height: 1000,
} as const;
