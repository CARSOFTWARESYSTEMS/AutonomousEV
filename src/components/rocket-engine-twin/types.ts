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
  | "engine_controller"
  | "bearing_region";

export type ModeId = "engine" | "build" | "flow" | "control" | "test" | "health" | "twin" | "architecture";
export type AudienceMode = "learn" | "engineer";
export type ExplodedLevel = "assembled" | "assemblies" | "components";
/** Systems that have a cutaway view. */
export type CutawaySystem = Extract<SystemId, "combustion" | "turbomachinery" | "nozzle" | "regenerative_cooling">;
/** What is cut open: nothing, one system, or every system that can be. */
export type CutawayTarget = CutawaySystem | "all" | null;
export type FlowId = "propellant" | "cooling" | "hot_gas" | "data";

export type SensorId =
  | "chamber_pressure"
  | "pump_discharge_pressure"
  | "turbine_inlet_temperature"
  | "shaft_speed"
  | "pump_vibration"
  | "bearing_temperature"
  | "coolant_outlet_temperature"
  | "valve_position"
  | "thrust_mount_strain";
export type SensorType = "pressure" | "temperature" | "speed" | "vibration" | "position" | "strain";

export type TestPhaseId = "system_check" | "conditioning" | "ready" | "start" | "mainstage" | "throttle" | "shutdown" | "review";
export type TestStatus = "idle" | "running" | "completed" | "aborted";
export type Throttle = 40 | 60 | 80 | 100;
export type Atmosphere = "sea_level" | "high_altitude" | "vacuum";

export type FaultId = "turbopump_bearing_wear" | "cooling_channel_restriction" | "chamber_pressure_sensor_drift";
export type FaultStage = "symptom" | "diagnosis" | "complete";

export type TwinStateId = "observed" | "estimated" | "expected" | "predicted";
export type TwinView = "compare" | "prediction";

/** Where the bearing degradation scenario has got to. */
export type BearingStage = "healthy" | "early" | "anomaly" | "diagnosis";
export type SignalView = "time" | "frequency" | "trend";
export type HealthState = "nominal" | "monitor" | "degraded" | "limited" | "shutdown";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export type ArchitectureLayer = "hardware" | "sensors" | "acquisition" | "control" | "models" | "fdir" | "twin" | "evidence";

export type CameraPresetId =
  | "hero"
  | "engine_overview"
  | "open_engine"
  | "feed_overview"
  | "turbomachinery"
  | "pump_close"
  | "shaft_close"
  | "bearing_close"
  | "chamber"
  | "chamber_cutaway"
  | "cooling_channel"
  | "injector_region"
  | "nozzle"
  | "controller"
  | "sensor_network"
  | "test_stand"
  | "health"
  | "digital_twin"
  | "architecture";

/** One physical piece of the 3D engine. Everything that reacts to state addresses parts by these ids, never by mesh names. */
export type PartId =
  | "feed_oxidiser"
  | "feed_fuel"
  | "line_oxidiser_discharge"
  | "line_fuel_discharge"
  | "line_fuel_preburner"
  | "line_oxidiser_preburner"
  | "turbopump_oxidiser"
  | "rotor_oxidiser"
  | "bearing_oxidiser"
  | "turbopump_fuel"
  | "rotor_fuel"
  | "bearing_fuel"
  | "preburner"
  | "hot_gas_oxidiser"
  | "hot_gas_fuel"
  | "exhaust_oxidiser"
  | "exhaust_fuel"
  | "injector_head"
  | "chamber_liner"
  | "igniter"
  | "cooling_channels"
  | "cooling_jacket"
  | "manifold_inlet"
  | "manifold_outlet"
  | "throat_ring"
  | "nozzle_extension"
  | "valve_main_oxidiser"
  | "valve_main_fuel"
  | "valve_throttle"
  | "gimbal_mount"
  | "gimbal_actuators"
  | "engine_controller"
  | "harness"
  | "sensor_bodies"
  | "structure";

export type RelatedDestination = "space" | "model_rocketry" | "satellite_engineering";
