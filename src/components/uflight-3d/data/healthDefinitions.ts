// How health monitoring is organised: the six HUMS layers, the path a signal
// takes from sensor to maintenance action, the data architecture and its
// networks, and the redundancy references. Descriptive data only.
import type { ComponentId, NetworkFilter, SensorKind } from "../types";

export interface HumsLayer {
  layer: number;
  name: string;
  items: readonly string[];
  /** Where in the aircraft this layer lives. */
  components: readonly ComponentId[];
  summary: string;
}

export const HUMS_LAYERS: readonly HumsLayer[] = [
  {
    layer: 1,
    name: "PHYSICAL SYSTEM",
    items: ["Motor", "Battery", "Structure", "Actuator", "Avionics"],
    components: ["propulsion-unit-04", "battery-pack-left", "battery-pack-right", "wing-structure-right", "wing-actuators", "avionics-rack"],
    summary: "The hardware whose condition matters.",
  },
  {
    layer: 2,
    name: "SENSING",
    items: ["Vibration", "Temperature", "Current", "Voltage", "Strain", "Position", "Pressure", "RPM", "Insulation"],
    components: ["pu04-sensors", "pu03-sensors", "pu02-sensors", "pu01-sensors"],
    summary: "Sensors turn physical behaviour into signals.",
  },
  {
    layer: 3,
    name: "ACQUISITION",
    items: ["Signal conditioning", "Sampling", "Timestamping", "Remote I/O"],
    components: ["acquisition-node-wing-left", "acquisition-node-wing-right", "acquisition-node-fuselage", "acquisition-node-tail", "sensor-gateway"],
    summary: "Nodes near the sensors condition, sample and timestamp the signals.",
  },
  {
    layer: 4,
    name: "EDGE ANALYTICS",
    items: ["Feature extraction", "FFT", "Order analysis", "Sensor fusion", "Anomaly detection"],
    components: ["edge-processor"],
    summary: "Raw signals become features, compared with a healthy baseline.",
  },
  {
    layer: 5,
    name: "HEALTH REASONING",
    items: ["Fault detection", "Fault isolation", "Fault classification", "Health index"],
    components: ["hums-computer"],
    summary: "Features become a health state for a specific component.",
  },
  {
    layer: 6,
    name: "PROGNOSTICS",
    items: ["Degradation trend", "Remaining useful life", "Maintenance recommendation", "Mission impact"],
    components: ["hums-computer", "maintenance-gateway", "maintenance-link"],
    summary: "The trend becomes a maintenance window and a mission consequence.",
  },
];

export interface TraceStep {
  id: "sensor" | "acquisition" | "edge" | "feature" | "health-model" | "diagnostic" | "prognostic" | "maintenance";
  label: string;
  /** Where this step happens; the trace pulse travels to it. `null` means the sensor itself. */
  component: ComponentId | null;
  /** Executive description. */
  text: string;
  /** Engineering detail. `{feature}` is replaced by the sensor's feature description. */
  detail: string;
}

export const TRACE_STEPS: readonly TraceStep[] = [
  { id: "sensor", label: "Sensor", component: null, text: "The sensor measures the component.", detail: "Analogue signal at the measurement point." },
  { id: "acquisition", label: "Acquisition Node", component: null, text: "A nearby node conditions, samples and timestamps the signal.", detail: "Anti-alias filtering, synchronous sampling, time stamp, validity flag." },
  { id: "edge", label: "Edge Processing", component: "edge-processor", text: "The signal reaches the edge processor through the sensor gateway.", detail: "Framed and windowed; synchronised with speed and flight-phase data." },
  { id: "feature", label: "Feature Extraction", component: "edge-processor", text: "The signal is reduced to a few meaningful features.", detail: "{feature}." },
  { id: "health-model", label: "Health Model", component: "hums-computer", text: "Features are compared with what a healthy component would show.", detail: "Residual = observed feature − expected range for this speed, load and flight phase." },
  { id: "diagnostic", label: "Diagnostic State", component: "hums-computer", text: "A persistent residual becomes a diagnosis with a confidence level.", detail: "Detection, isolation to a component, classification; confidence from independent evidence." },
  { id: "prognostic", label: "Prognostic Model", component: "hums-computer", text: "The trend is projected forward with its uncertainty.", detail: "Degradation trend, uncertainty band, maintenance threshold, maintenance window." },
  { id: "maintenance", label: "Maintenance Action", component: "maintenance-gateway", text: "The result is sent to the ground as a maintenance recommendation.", detail: "Health state, evidence and recommended action through the maintenance gateway and link." },
];

/** Seconds the trace dwells on each step. */
export const TRACE_STEP_S = 1.9;

export const traceDetail = (step: TraceStep, feature: string) => step.detail.replace("{feature}", feature);

/** What a sensor of each kind contributes to diagnosis. */
export const SIGNAL_NOTE: Record<SensorKind, string> = {
  vibration: "Bearing and rotor condition",
  temperature: "Thermal state and friction",
  pressure: "Cooling-loop condition",
  voltage: "Cell-group balance and bus condition",
  current: "Electrical loading and phase balance",
  insulation: "High-voltage isolation",
  strain: "Structural load and fatigue exposure",
  position: "Control response",
  rpm: "Shaft speed for order analysis",
  navigation: "Navigation source validity",
};

// ── Data architecture ──

export interface ArchitectureStage {
  id: string;
  label: string;
  components: readonly ComponentId[];
  text: string;
}

export const DATA_ARCHITECTURE: readonly ArchitectureStage[] = [
  { id: "sensors", label: "SENSORS", components: ["pu04-sensors", "pu01-sensors", "pu02-sensors", "pu03-sensors"], text: "Measurements across propulsion, energy, structure, controls and navigation." },
  { id: "remote-io", label: "REMOTE I/O", components: ["acquisition-node-wing-left", "acquisition-node-wing-right", "acquisition-node-fuselage", "acquisition-node-tail"], text: "Acquisition nodes close to the sensors." },
  { id: "network", label: "AIRCRAFT DATA NETWORK", components: ["network-switch-a", "network-switch-b", "data-harness"], text: "Two independent networks, A and B." },
  { id: "flight-compute", label: "FLIGHT COMPUTE", components: ["fcc-a", "fcc-b", "fcc-c"], text: "Three flight-compute channels." },
  { id: "health-compute", label: "HEALTH COMPUTE", components: ["hums-computer"], text: "Health reasoning, kept separate from flight control." },
  { id: "edge-analytics", label: "EDGE ANALYTICS", components: ["edge-processor"], text: "Feature extraction and anomaly detection on board." },
  { id: "secure-comms", label: "SECURE COMMUNICATION", components: ["secure-gateway", "maintenance-gateway", "ground-link", "maintenance-link", "antennas"], text: "A gateway separates aircraft networks from external links." },
  { id: "ground", label: "GROUND HEALTH PLATFORM", components: [], text: "Fleet health, maintenance planning and model updates. Outside the aircraft." },
];

export const NETWORK_FILTERS: readonly { id: NetworkFilter; label: string; text: string }[] = [
  { id: "all", label: "ALL", text: "Every data route in the aircraft." },
  { id: "flight-critical", label: "FLIGHT CRITICAL", text: "Flight-control and navigation networks: sensors to the three flight computers, commands to actuators and motor controllers." },
  { id: "health", label: "HEALTH", text: "HUMS data routes: sensors to acquisition nodes, edge processor and health computer." },
  { id: "maintenance", label: "MAINTENANCE", text: "Health results from the health computer to the maintenance gateway." },
  { id: "ground", label: "GROUND", text: "External links through the secure gateway to the ground." },
];

// ── Redundancy references ──

export const FLIGHT_COMPUTE_CHANNELS: readonly { id: "fcc-a" | "fcc-b" | "fcc-c"; label: string; location: string }[] = [
  { id: "fcc-a", label: "FCC-A", location: "Forward bay" },
  { id: "fcc-b", label: "FCC-B", location: "Rear bay, port" },
  { id: "fcc-c", label: "FCC-C", location: "Rear bay, starboard" },
];

export type NavSourceId = "gnss" | "imu-a" | "imu-b" | "air-data" | "radar-altimeter" | "magnetometer" | "vision-sensors";

export const NAV_SOURCES: readonly { id: NavSourceId; label: string; contributes: string }[] = [
  { id: "gnss", label: "GNSS", contributes: "Absolute position" },
  { id: "imu-a", label: "IMU-A", contributes: "Motion, attitude" },
  { id: "imu-b", label: "IMU-B", contributes: "Motion, attitude" },
  { id: "air-data", label: "Air Data", contributes: "Airspeed, pressure altitude" },
  { id: "radar-altimeter", label: "Radar Altimeter", contributes: "Height above ground" },
  { id: "magnetometer", label: "Magnetometer", contributes: "Heading" },
  { id: "vision-sensors", label: "Vision / Perception Sensors", contributes: "Relative position near the pad" },
];

/** Health drill-down levels, top to bottom. */
export const HEALTH_HIERARCHY = ["AIRCRAFT", "SYSTEM", "ASSEMBLY", "COMPONENT", "SENSOR", "FEATURE", "HEALTH STATE"] as const;
