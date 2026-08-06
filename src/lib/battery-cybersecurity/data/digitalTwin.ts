import type { DigitalTwinLayer } from "../types";

export const DIGITAL_TWIN_LAYERS: DigitalTwinLayer[] = [
  {
    id: "physical-battery",
    order: 1,
    name: "Physical Battery",
    description: "The real cells, modules, pack, sensors, and BMS hardware in the aircraft — the ground truth every other layer ultimately represents.",
    inputs: ["Cell/pack sensor readings", "Manufacturing and lifecycle records"],
    evidenceStatus: "available-capability",
  },
  {
    id: "digital-twin",
    order: 2,
    name: "Digital Twin",
    description: "A model of the battery's physical and electrical behavior — thermal response, degradation curve, expected voltage/current relationships — used to predict expected state under a given load.",
    inputs: ["Physical Battery telemetry", "Known chemistry and thermal-mass parameters"],
    evidenceStatus: "research-in-progress",
  },
  {
    id: "cyber-twin",
    order: 3,
    name: "Cyber Twin",
    description: "The digital twin extended with cybersecurity context — which data points are authenticated, which entry points can reach them, and which have been flagged by detection controls.",
    inputs: ["Digital Twin model", "Detection-control outputs", "Entry-point and trust-boundary map"],
    evidenceStatus: "research-in-progress",
  },
  {
    id: "trust-twin",
    order: 4,
    name: "Trust Twin",
    description: "The synthesized view used for a flight-safety decision: for each component, a current trust state (trusted/degraded/unverified/compromised) combining physical plausibility, cyber integrity, and evidence status.",
    inputs: ["Cyber Twin state", "Threat-Modelling Studio propagation results"],
    evidenceStatus: "future-roadmap",
  },
];
