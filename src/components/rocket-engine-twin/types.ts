// Shared ids for the Next-Generation Rocket Engine Digital Twin (no React).
// Ids are lower_snake_case because they are also sent as analytics parameters.

export type SystemId =
  | "propellant_feed"
  | "turbomachinery"
  | "combustion"
  | "regenerative_cooling"
  | "nozzle"
  | "valves_actuation"
  | "instrumentation"
  | "engine_control";

export type ComponentId =
  | "oxidiser_inlet"
  | "fuel_inlet"
  | "oxidiser_turbopump"
  | "fuel_turbopump"
  | "preburner"
  | "injector"
  | "combustion_chamber"
  | "igniter"
  | "coolant_manifold"
  | "cooling_channels"
  | "throat"
  | "nozzle_extension"
  | "main_valves"
  | "throttle_valve"
  | "gimbal_actuator"
  | "pressure_sensors"
  | "temperature_sensors"
  | "speed_vibration_sensors"
  | "engine_controller";

export type ModeId = "build" | "systems" | "flow" | "control" | "test" | "health" | "twin";
export type AudienceMode = "learn" | "engineer";
export type ExplodedLevel = "assembled" | "assemblies" | "components";
/** Systems that have a cutaway view. */
export type CutawaySystem = Extract<SystemId, "combustion" | "turbomachinery" | "nozzle">;
export type FlowId = "propellant" | "cooling" | "hot_gas" | "data";

export type SensorId = "chamber_pressure" | "turbine_inlet_temperature" | "shaft_speed" | "pump_vibration" | "coolant_outlet_temperature" | "valve_position";
export type SensorType = "pressure" | "temperature" | "speed" | "vibration" | "position";

export type TestPhaseId = "system_check" | "conditioning" | "ready" | "start" | "mainstage" | "throttle" | "shutdown" | "review";
export type TestStatus = "idle" | "running" | "completed" | "aborted";

export type FaultId = "turbopump_bearing_wear" | "cooling_channel_restriction" | "chamber_pressure_sensor_drift";
export type FaultStage = "symptom" | "diagnosis" | "complete";

export type TwinStateId = "observed" | "estimated" | "expected" | "predicted";
export type TwinView = "compare" | "prediction";

export type RelatedDestination = "space" | "model_rocketry" | "satellite_engineering";
