import type { FlightPhase } from "../types";

export const FLIGHT_PHASES: FlightPhase[] = [
  {
    id: "ground-charging",
    name: "Ground / Charging",
    description: "Aircraft is on the ground, powered down or charging, with ground equipment and diagnostic tools connected.",
    consequenceWeight: 1,
  },
  {
    id: "pre-flight",
    name: "Pre-Flight",
    description: "Pre-flight checks and energy-readiness verification before dispatch.",
    consequenceWeight: 2,
  },
  {
    id: "taxi-takeoff",
    name: "Taxi / Takeoff",
    description: "High instantaneous power demand during takeoff or vertical lift, with limited time to react to a fault.",
    consequenceWeight: 5,
  },
  {
    id: "climb",
    name: "Climb",
    description: "Sustained high-power climb phase where available power margin directly affects obstacle and terrain clearance.",
    consequenceWeight: 5,
  },
  {
    id: "cruise",
    name: "Cruise",
    description: "Lower, steady power demand; more time available to detect and respond to an anomaly before it becomes safety-critical.",
    consequenceWeight: 3,
  },
  {
    id: "descent-landing",
    name: "Descent / Landing",
    description: "Approach and landing, including vertical-landing power demand, with reduced altitude margin for recovery.",
    consequenceWeight: 4,
  },
];
