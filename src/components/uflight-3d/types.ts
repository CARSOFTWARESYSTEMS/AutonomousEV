// Shared types for UFlight™ 3D. Nothing here depends on three.js or React, so
// data, simulation and tests can import it freely.

export type Vec3 = readonly [number, number, number];

export type UFlightMode = "hero" | "aircraft" | "systems" | "health" | "mission" | "fault-lab" | "twin" | "architecture";

/** How much signal-level detail the interface shows. */
export type AudienceMode = "executive" | "engineer";

export type SystemId = "propulsion" | "energy" | "avionics" | "flightControl" | "navigation" | "structures" | "thermal" | "communications" | "hums";

/** Systems that carry a health state at vehicle level. */
export type MonitoredSystemId = Exclude<SystemId, "communications" | "hums">;

export type EnvironmentId = "studio" | "vertiport" | "flight" | "twin";

/** What X-ray keeps at full strength. `all` shows every internal system. */
export type XrayFilter = "all" | "power" | "propulsion" | "avionics" | "flightControl" | "thermal" | "structure" | "data" | "health";

export type ViewPreset = "overview" | "cabin" | "structure";

/** Operating point shown when no mission is running. `ground` is parked with everything stopped. */
export type FlightConfig = "ground" | "hover" | "transition" | "cruise";

export type ExplodedLevel = 1 | 2 | 3;

// ── Health vocabulary ──

export type HealthState = "NOMINAL" | "DEGRADED" | "LIMITED" | "MAINTENANCE_REQUIRED" | "UNAVAILABLE";

export type VehicleState = "MISSION_CAPABLE" | "MISSION_CAPABLE_WITH_LIMITATION" | "NOT_RELEASED";

export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export type Trend = "STABLE" | "INCREASING" | "DECREASING";

export type HumsStatus = "MONITORING" | "BACKGROUND_MONITORING" | "ANOMALY_DETECTED" | "DIAGNOSED" | "PROGNOSIS_AVAILABLE";

// ── State machines ──

export type MissionPhase =
  | "IDLE"
  | "PREFLIGHT"
  | "TAKEOFF"
  | "TRANSITION"
  | "CRUISE"
  | "HEALTH_EVENT"
  | "DIAGNOSIS"
  | "PROGNOSIS"
  | "APPROACH"
  | "LANDING"
  | "POSTFLIGHT"
  | "COMPLETE";

export type MissionProfile = "executive" | "engineering";

export type FaultStage = "HEALTHY" | "EARLY_CHANGE" | "ANOMALOUS" | "DIAGNOSED" | "DEGRADING" | "ACTION_REQUIRED" | "MAINTENANCE";

export type FaultScenarioId =
  | "bearing-degradation"
  | "battery-imbalance"
  | "rotor-imbalance"
  | "inverter-overtemperature"
  | "coolant-flow-reduction"
  | "actuator-degradation"
  | "compute-channel-loss"
  | "structural-fatigue";

/** Scenarios that are simulated in this release. */
export type ActiveFaultScenarioId = "bearing-degradation" | "battery-imbalance";

export type FaultCategory = "propulsion" | "energy" | "structures" | "flightControl" | "thermal" | "avionics";

// ── Sensing ──

export type SensorKind = "vibration" | "temperature" | "voltage" | "current" | "strain" | "pressure" | "position" | "rpm" | "insulation" | "navigation";

export type SensorCategory = "vibration" | "thermal" | "electrical" | "structural" | "position" | "navigation";

export type SignalDomain = "time" | "frequency" | "order";

export type HealthView = "overview" | "sensors" | "hums";

export type NetworkFilter = "all" | "flight-critical" | "health" | "maintenance" | "ground";

export type FlowKind = "power" | "data" | "control" | "thermal" | "health";

// ── Components ──

export type UnitNo = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08";
export type ModuleNo = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08";

export type PropulsionUnitId = `propulsion-unit-${UnitNo}`;

/** Sub-assemblies inside one propulsion unit. */
export type PropulsionPart =
  | "nacelle"
  | "rotor"
  | "shaft"
  | "bearing-front"
  | "bearing-rear"
  | "motor"
  | "resolver"
  | "inverter"
  | "motor-controller"
  | "tilt-actuator"
  | "cooling-interface"
  | "sensors";

export type PropulsionPartId = `pu${UnitNo}-${PropulsionPart}`;

export type BatteryModuleId = `battery-module-${ModuleNo}`;

/**
 * Semantic component ids. Interaction, data, camera and health logic use only
 * these — never mesh names — so the procedural model can be replaced later.
 */
export type ComponentId =
  // Structures
  | "fuselage-shell"
  | "glazing"
  | "door-left"
  | "door-right"
  | "fuselage-frames"
  | "floor-structure"
  | "wing-skin-left"
  | "wing-skin-right"
  | "wing-structure-left"
  | "wing-structure-right"
  | "boom-left"
  | "boom-right"
  | "horizontal-tail"
  | "vertical-tail-left"
  | "vertical-tail-right"
  | "nose-gear"
  | "main-gear-left"
  | "main-gear-right"
  | "cabin-seats"
  | "cabin-interior"
  // Propulsion
  | PropulsionUnitId
  | PropulsionPartId
  // Energy
  | "battery-pack-left"
  | "battery-pack-right"
  | BatteryModuleId
  | "bms-primary"
  | "bms-secondary"
  | "hv-contactors"
  | "hvdc-bus"
  | "lvdc-bus"
  | "dcdc-converter"
  | "charging-interface"
  // Flight controls
  | "fcc-a"
  | "fcc-b"
  | "fcc-c"
  | "actuator-controllers"
  | "wing-actuators"
  | "tail-actuators"
  | "flaperon-left"
  | "flaperon-right"
  | "elevator"
  | "rudder-left"
  | "rudder-right"
  | "pilot-controls"
  // Navigation
  | "gnss"
  | "imu-a"
  | "imu-b"
  | "magnetometer"
  | "radar-altimeter"
  | "air-data"
  | "vision-sensors"
  | "nav-processor"
  // Communications
  | "ground-link"
  | "maintenance-link"
  | "antennas"
  | "secure-gateway"
  // Avionics
  | "network-switch-a"
  | "network-switch-b"
  | "flight-displays"
  | "avionics-rack"
  | "data-harness"
  // Thermal
  | "battery-cooling"
  | "avionics-cooling"
  | "heat-exchanger"
  | "coolant-pumps"
  | "cooling-manifold"
  // HUMS
  | "hums-computer"
  | "edge-processor"
  | "acquisition-node-wing-left"
  | "acquisition-node-wing-right"
  | "acquisition-node-fuselage"
  | "acquisition-node-tail"
  | "sensor-gateway"
  | "maintenance-gateway";

/** Which values a figure is: none describe flight hardware. */
export type ValueProvenance = "REFERENCE" | "SIMULATED" | "ILLUSTRATIVE";

// ── Digital twin state ──

export interface SystemHealth {
  state: HealthState;
  /** One-line reason, shown beside the state. */
  summary: string;
  /** Components driving the state, worst first. */
  contributors: ComponentId[];
}

export interface ComponentHealth {
  state: HealthState;
  /** Function still provided, whatever the health state. */
  available: boolean;
  summary: string;
}

export interface ExpectedRange {
  min: number;
  max: number;
}

export interface PredictionState {
  /** Flight cycles from now; negative values are history. */
  offsetCycles: number;
  /** Health index, 1 = as new, 0 = at the maintenance limit. */
  mean: number;
  low: number;
  high: number;
  trend: Trend;
  /** Cycles until the maintenance threshold is expected to be reached, as a range. */
  maintenanceWindow: { fromCycles: number; toCycles: number } | null;
  recommendation: string;
}

export interface UFlightTwinState {
  /** Mission time in seconds (0 when no mission is running). */
  timestamp: number;
  aircraftMode: FlightConfig;
  missionPhase: MissionPhase;
  vehicle: VehicleState;
  hums: HumsStatus;
  systems: Record<MonitoredSystemId, SystemHealth>;
  components: Partial<Record<ComponentId, ComponentHealth>>;
  /** What the sensors report. */
  observations: Record<string, number>;
  /** Internal state inferred from models. */
  estimates: Record<string, number>;
  /** Healthy reference behaviour. */
  expected: Record<string, ExpectedRange>;
  /** Observation minus the centre of the expected range. */
  residuals: Record<string, number>;
  /** Future health trajectory. */
  predictions: Record<string, PredictionState>;
}
