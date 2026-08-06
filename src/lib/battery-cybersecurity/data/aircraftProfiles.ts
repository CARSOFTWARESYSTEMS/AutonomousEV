import type { AircraftProfile } from "../types";

const ALL_COMPONENT_IDS = [
  "battery-cells",
  "battery-pack",
  "bms",
  "sensors",
  "contactors",
  "thermal-management",
  "ems",
  "vcu",
  "pdu",
  "inverter-motor-controller",
  "propulsion",
  "charger-gse",
  "maintenance-laptop",
  "ota-system",
  "fleet-platform",
];

export const AIRCRAFT_PROFILES: AircraftProfile[] = [
  {
    id: "passenger-evtol",
    name: "Passenger eVTOL",
    description: "Multi-rotor or lift-plus-cruise electric vertical takeoff and landing aircraft carrying passengers on short urban or regional routes.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "climb",
  },
  {
    id: "cargo-evtol",
    name: "Cargo eVTOL",
    description: "Uncrewed or minimally crewed electric VTOL aircraft carrying freight, typically with higher duty-cycle and vertiport turnaround frequency than passenger operations.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "taxi-takeoff",
  },
  {
    id: "electric-stol",
    name: "Electric Short Take-Off and Landing (eSTOL)",
    description: "Fixed-wing electric aircraft using short runways instead of vertical lift, with a different power profile across takeoff, climb, and cruise.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "cruise",
  },
  {
    id: "hybrid-electric",
    name: "Hybrid-Electric Aircraft",
    description: "Aircraft combining a combustion or turbine power source with an electric battery/motor system, where battery trust still governs the electric portion of the power budget.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "cruise",
  },
  {
    id: "defense-uav",
    name: "Defense UAV / Autonomous Aircraft",
    description: "Uncrewed autonomous or remotely piloted electric aircraft used in defense or mission-critical roles, where energy-system compromise directly affects mission assurance.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "cruise",
  },
  {
    id: "autonomous-aircraft",
    name: "Autonomous Aircraft",
    description: "Civilian uncrewed electric aircraft operating with a high degree of autonomy (e.g. autonomous cargo delivery or logistics), where energy-trust decisions are made without a human pilot in the loop.",
    componentIds: ALL_COMPONENT_IDS,
    defaultFlightPhaseId: "cruise",
  },
];
