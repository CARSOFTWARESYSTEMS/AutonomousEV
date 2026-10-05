// Single source of truth for the reference spacecraft. Educational data lives
// here and in componentDefinitions.ts — never inside rendering code — so a
// different spacecraft (3U, 12U, a comms satellite) is a data change.
import type { SubsystemId } from "../types";
import { ORBIT_PERIOD_S, ORBIT_REFERENCE } from "../simulation/orbit";

export type FlowKind = "power" | "data" | "rf";

/** Restrained accents; everything else in the interface stays monochrome. */
export const ACCENT = {
  power: "#f2b544",
  data: "#5ed3e6",
  rf: "#6f9bf5",
  adcs: "#a78bfa",
  thermal: "#f07a4a",
  structure: "#9aa6b5",
  payload: "#6fd6c4",
} as const;

export const FLOW_COLOR: Record<FlowKind, string> = {
  power: ACCENT.power,
  data: ACCENT.data,
  rf: ACCENT.rf,
};

export interface SubsystemDefinition {
  id: SubsystemId;
  /** Tab label. */
  label: string;
  name: string;
  /** One short sentence. */
  purpose: string;
  /** The functional chain the visualisation animates. */
  flow: readonly string[];
  accent: string;
}

export const SUBSYSTEMS: Record<SubsystemId, SubsystemDefinition> = {
  power: {
    id: "power",
    label: "POWER",
    name: "Electrical Power System",
    purpose: "Turns sunlight into electricity, stores it and feeds every load.",
    flow: ["Sun", "Solar arrays", "PCDU", "Battery", "Loads"],
    accent: ACCENT.power,
  },
  adcs: {
    id: "adcs",
    label: "ADCS",
    name: "Attitude Determination & Control",
    purpose: "Knows where the spacecraft points and turns it where it needs to point.",
    flow: ["Sensors", "Attitude estimate", "OBC / ADCS", "Reaction wheels", "Rotation"],
    accent: ACCENT.adcs,
  },
  payload: {
    id: "payload",
    label: "PAYLOAD",
    name: "Optical Payload",
    purpose: "Images the Earth and turns light into mission data.",
    flow: ["Earth", "Optical payload", "Processor", "Storage"],
    accent: ACCENT.payload,
  },
  communications: {
    id: "communications",
    label: "COMMS",
    name: "Communications",
    purpose: "Receives commands and returns telemetry and payload data.",
    flow: ["Ground", "S-band TT&C", "OBC", "X-band downlink", "Ground"],
    accent: ACCENT.rf,
  },
  thermal: {
    id: "thermal",
    label: "THERMAL",
    name: "Thermal Control",
    purpose: "Keeps every unit inside its temperature limits in sunlight and eclipse.",
    flow: ["Heat sources", "Conduction", "Radiator", "Space"],
    accent: ACCENT.thermal,
  },
  avionics: {
    id: "avionics",
    label: "AVIONICS",
    name: "Avionics & Data Handling",
    purpose: "The flight computer reads sensors, runs flight software and commands every subsystem.",
    flow: ["Sensors", "OBC", "Commands"],
    accent: ACCENT.data,
  },
  structure: {
    id: "structure",
    label: "STRUCTURE",
    name: "Structure",
    purpose: "Carries launch loads and holds every unit in alignment.",
    flow: ["Deployer rails", "Primary frame", "Decks", "Units"],
    accent: ACCENT.structure,
  },
};

/** Order of the Systems sub-tabs. */
export const SUBSYSTEM_ORDER: readonly SubsystemId[] = ["power", "adcs", "payload", "communications", "thermal", "avionics", "structure"];

export const SATELLITE_REFERENCE = {
  name: "6U Earth Observation Reference Satellite",
  shortName: "6U EO Reference Satellite",
  mission: "Earth Observation",
  missionLine: "6U Earth Observation Reference Mission",
  formFactor: "6U",
  /** Envelope of a 6U CubeSat (1U × 2U × 3U), millimetres. */
  envelopeMm: [226.3, 366, 100] as const,
  subsystems: SUBSYSTEM_ORDER,
  orbit: {
    description: "Sun-synchronous-like low Earth orbit",
    altitudeKm: ORBIT_REFERENCE.altitudeKm,
    altitudeRange: "500–550 km",
    inclinationDeg: ORBIT_REFERENCE.inclinationDeg,
    periodMin: Math.round(ORBIT_PERIOD_S / 60),
  },
  links: {
    ttc: "S-band",
    payloadDownlink: "X-band",
  },
  provenance: {
    spacecraft: "REFERENCE SPACECRAFT",
    values: "REFERENCE & SIMULATED VALUES",
    visualization: "ENGINEERING VISUALIZATION",
    scale: "NOT TO SCALE",
  },
  disclaimer:
    "Educational reference spacecraft. Figures are reference or simulated values for learning, not specifications of flight hardware or of any real mission.",
} as const;

/** Who prepared the experience, and when its information was last reviewed. */
export const PREPARED_BY = {
  notes: ["Satellite Explorer 3D is an EV.ENGINEER™ interactive engineering learning experience within the EV Society™ Space initiative."],
  reviewed: "2026-10-01",
  reviewedLabel: "1 October 2026",
} as const;

/** This page's line in the "Inspiration & Acknowledgement" card that follows "Prepared by". */
export const INSPIRATION_CONTEXT = "Her early interactive design work helped inspire our approach to visualising spacecraft systems and developing interactive Satellite Engineering and Digital Twin learning experiences.";

export const PRODUCT = {
  name: "SATELLITE EXPLORER 3D",
  subtitle: "Build · Explore · Operate a Satellite",
  tagline: "Interactive engineering learning experience",
  route: "/space/satellite-engineering/interactive-3d",
  satelliteEngineeringRoute: "/space/satellite-engineering",
  cubeTwinRoute: "/space/cubesat",
} as const;
