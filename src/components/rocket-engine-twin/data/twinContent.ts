// What the immersive application says. Kept short on purpose: in the 3D view a
// component gets a name, one sentence, a handful of states and one or two
// actions. The long-form explanations live in the page below it.
import type { ArchitectureLayer, Atmosphere, BearingStage, CameraPresetId, ComponentId, HealthState, PartId, SensorType, SystemId } from "../types";

/** Short name shown on hover and at the head of the information panel. */
export const COMPONENT_LABEL: Record<ComponentId, string> = {
  oxidiser_inlet: "OXIDISER FEED",
  fuel_inlet: "FUEL FEED",
  oxidiser_turbopump: "OXIDISER TURBOPUMP",
  fuel_turbopump: "FUEL TURBOPUMP",
  preburner: "PREBURNER",
  bearing_region: "BEARING REGION",
  injector: "INJECTOR",
  combustion_chamber: "COMBUSTION CHAMBER",
  igniter: "IGNITER",
  coolant_manifold: "COOLANT MANIFOLD",
  cooling_channels: "COOLING JACKET",
  throat: "THROAT",
  nozzle_extension: "NOZZLE",
  main_valves: "MAIN VALVE",
  throttle_valve: "THROTTLE VALVE",
  gimbal_actuator: "GIMBAL",
  pressure_sensors: "PRESSURE SENSOR",
  temperature_sensors: "TEMPERATURE SENSOR",
  speed_vibration_sensors: "SPEED AND VIBRATION SENSOR",
  engine_controller: "ENGINE CONTROLLER",
};

/** One line for Learn mode, where the panel shows nothing else. */
export const COMPONENT_LINE: Record<ComponentId, string> = {
  oxidiser_inlet: "Carries liquid oxidiser to the pump.",
  fuel_inlet: "Carries liquid fuel to the pump.",
  oxidiser_turbopump: "Raises oxidiser pressure before combustion.",
  fuel_turbopump: "Raises fuel pressure before cooling and combustion.",
  preburner: "Makes the hot gas that drives the turbines.",
  bearing_region: "Holds the spinning shaft. Wear shows up as vibration.",
  injector: "Mixes fuel and oxidiser so they burn evenly.",
  combustion_chamber: "Burns the propellants at high pressure.",
  igniter: "Lights the engine at every start.",
  coolant_manifold: "Shares coolant evenly around the wall.",
  cooling_channels: "Fuel cools the wall before it is burned.",
  throat: "The narrowest point: the gas reaches the speed of sound.",
  nozzle_extension: "Expands the gas and turns pressure into thrust.",
  main_valves: "Opens to start the engine and closes to stop it.",
  throttle_valve: "Changes turbine power, and with it thrust.",
  gimbal_actuator: "Tilts the engine to steer the vehicle.",
  pressure_sensors: "Measures pressure in the chamber and pumps.",
  temperature_sensors: "Measures gas, coolant and bearing temperature.",
  speed_vibration_sensors: "Measures shaft speed and vibration.",
  engine_controller: "Reads the sensors and commands the valves.",
};

/** Engineer-mode rows by system: what is a state, and what is a simulated quantity. */
export const SYSTEM_ROWS: Record<SystemId, readonly { label: string; kind: "state" | "simulated" }[]> = {
  propellant_feed: [
    { label: "STATE", kind: "state" },
    { label: "INLET CONDITION", kind: "simulated" },
    { label: "FLOW", kind: "simulated" },
  ],
  turbomachinery: [
    { label: "STATE", kind: "state" },
    { label: "ROTATIONAL STATE", kind: "simulated" },
    { label: "PRESSURE RISE", kind: "simulated" },
    { label: "THERMAL", kind: "state" },
    { label: "VIBRATION", kind: "state" },
  ],
  combustion: [
    { label: "STATE", kind: "state" },
    { label: "CHAMBER STATE", kind: "simulated" },
    { label: "MIXTURE RATIO", kind: "simulated" },
    { label: "THERMAL", kind: "state" },
  ],
  regenerative_cooling: [
    { label: "STATE", kind: "state" },
    { label: "COOLANT FLOW", kind: "simulated" },
    { label: "WALL THERMAL", kind: "state" },
    { label: "PRESSURE DROP", kind: "simulated" },
  ],
  nozzle: [
    { label: "STATE", kind: "state" },
    { label: "EXPANSION", kind: "simulated" },
    { label: "THERMAL", kind: "state" },
  ],
  valves_actuation: [
    { label: "STATE", kind: "state" },
    { label: "POSITION", kind: "simulated" },
    { label: "COMMAND", kind: "simulated" },
  ],
  instrumentation: [
    { label: "STATE", kind: "state" },
    { label: "SIGNAL", kind: "simulated" },
  ],
  engine_control: [
    { label: "STATE", kind: "state" },
    { label: "CONTROL LOOP", kind: "simulated" },
    { label: "LIMIT MONITOR", kind: "state" },
  ],
};

/** The camera view a system and a component are looked at from. */
export const SYSTEM_VIEW: Record<SystemId, CameraPresetId> = {
  propellant_feed: "feed_overview",
  turbomachinery: "turbomachinery",
  combustion: "chamber",
  regenerative_cooling: "cooling_channel",
  nozzle: "nozzle",
  valves_actuation: "feed_overview",
  instrumentation: "sensor_network",
  engine_control: "controller",
};

export const COMPONENT_VIEW: Partial<Record<ComponentId, CameraPresetId>> = {
  fuel_turbopump: "pump_close",
  oxidiser_turbopump: "turbomachinery",
  bearing_region: "bearing_close",
  preburner: "feed_overview",
  injector: "injector_region",
  combustion_chamber: "chamber_cutaway",
  cooling_channels: "cooling_channel",
  throat: "cooling_channel",
  nozzle_extension: "nozzle",
  engine_controller: "controller",
};

// ── Flow ────────────────────────────────────────────────────────────────────

/** The stages a propellant passes through, shown as the path's caption. */
export const FLOW_STAGES: Record<"propellant" | "cooling" | "hot_gas" | "data", readonly string[]> = {
  propellant: ["INLET", "PRESSURIZATION", "CONTROL", "COMBUSTION SYSTEM"],
  cooling: ["HOT GAS", "CHAMBER WALL", "COOLING PATH"],
  hot_gas: ["PREBURNER", "TURBINE", "CHAMBER", "THROAT", "EXPANSION", "EXHAUST"],
  data: ["SENSOR", "ACQUISITION", "CONTROL", "COMMAND"],
};

export const ENERGY_STEPS = ["HOT-GAS ENERGY", "TURBINE", "SHAFT", "PUMP", "PROPELLANT PRESSURE"] as const;
export const PUMP_STEPS = ["INLET", "PUMP", "HIGHER PRESSURE"] as const;
export const NOZZLE_STEPS = ["CHAMBER", "THROAT", "EXPANSION", "EXHAUST"] as const;

export const ATMOSPHERES: readonly { id: Atmosphere; label: string; text: string }[] = [
  { id: "sea_level", label: "SEA-LEVEL REFERENCE", text: "Ambient pressure squeezes the plume: it stays narrow." },
  { id: "high_altitude", label: "HIGH-ALTITUDE REFERENCE", text: "Less ambient pressure: the plume spreads." },
  { id: "vacuum", label: "VACUUM REFERENCE", text: "No ambient pressure: the plume expands widely." },
];

export const SCALE_NOTES = {
  flow: "FLOW VISUALIZATION SCALED",
  rotation: "ROTATION VISUALLY SCALED",
  cooling: "CONCEPTUAL COOLING GEOMETRY",
  combustion: "CONCEPTUAL COMBUSTION VISUALIZATION",
  comparison: "SIMULATED COMPARISON",
  signal: "SIMULATED SIGNAL",
  test: "SIMULATED ENGINE TEST",
} as const;

/** Pressure along the fluid network, as a fraction of the highest pressure in the reference model. */
export const PRESSURE_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

// ── Health ──────────────────────────────────────────────────────────────────

export const HEALTH_LABEL: Record<HealthState, string> = {
  nominal: "NOMINAL",
  monitor: "MONITOR",
  degraded: "DEGRADED",
  limited: "LIMITED",
  shutdown: "SHUTDOWN RECOMMENDED",
};

/** Used only while Health or Twin is showing state: the engine is never painted permanently. */
export const HEALTH_COLOR: Record<HealthState, string> = {
  nominal: "#6fbf8f",
  monitor: "#9db9d8",
  degraded: "#f5b041",
  limited: "#f0893c",
  shutdown: "#e5484d",
};

/** The six top-level health groups, and the engine systems each one rolls up. */
export const HEALTH_GROUPS: readonly { id: string; label: string; systems: readonly SystemId[] }[] = [
  { id: "feed", label: "FEED", systems: ["propellant_feed"] },
  { id: "turbomachinery", label: "TURBOMACHINERY", systems: ["turbomachinery"] },
  { id: "combustion", label: "COMBUSTION", systems: ["combustion", "nozzle"] },
  { id: "cooling", label: "COOLING", systems: ["regenerative_cooling"] },
  { id: "control", label: "CONTROL", systems: ["engine_control", "valves_actuation"] },
  { id: "instrumentation", label: "INSTRUMENTATION", systems: ["instrumentation"] },
];

export const HEALTH_LEVELS = ["ENGINE", "SYSTEM", "ASSEMBLY", "COMPONENT", "SENSOR", "HEALTH FEATURE", "STATE"] as const;

/** The health feature each kind of sensor contributes. */
export const FEATURE_BY_SENSOR: Record<SensorType, string> = {
  pressure: "Pressure against the reference model",
  temperature: "Temperature trend across runs",
  speed: "Shaft speed against command",
  vibration: "Vibration at multiples of shaft speed",
  position: "Position against command",
  strain: "Load against the reference envelope",
};

export const SENSOR_FILTERS: readonly { id: SensorType; label: string }[] = [
  { id: "pressure", label: "PRESSURE" },
  { id: "temperature", label: "TEMPERATURE" },
  { id: "vibration", label: "VIBRATION" },
  { id: "speed", label: "SPEED" },
  { id: "position", label: "POSITION" },
  { id: "strain", label: "STRAIN" },
];

export const TRACE_STEPS = ["SENSOR", "ACQUISITION", "SIGNAL PROCESSING", "HEALTH MODEL", "DIGITAL TWIN", "DIAGNOSIS", "DECISION"] as const;

export const BEARING_STAGES: readonly { id: BearingStage; label: string; learn: string; engineerOnly?: boolean }[] = [
  { id: "healthy", label: "NOMINAL", learn: "The bearing runs smoothly. The vibration signal is small and steady." },
  { id: "early", label: "DEVIATION EMERGING", learn: "The signal has begun to change. Nothing is wrong yet.", engineerOnly: true },
  { id: "anomaly", label: "ANOMALY DETECTED", learn: "The health model has noticed the change. The engine keeps running." },
  { id: "diagnosis", label: "POSSIBLE BEARING DEGRADATION", learn: "The evidence points to the bearing. Inspection is recommended." },
];

// ── Digital twin ────────────────────────────────────────────────────────────

export const TWIN_SUBJECT = "TURBOMACHINERY · BEARING REGION";

export const RESIDUAL_TEXT = {
  formula: "OBSERVED − EXPECTED = RESIDUAL",
  learn: "Difference between what the model expects and what the simulated sensor reports.",
} as const;

export const TWIN_TIMELINE = ["PAST", "NOW", "FUTURE"] as const;

export interface ModelCard {
  model: string;
  /** Fidelity class: see MODEL_LEVELS. */
  level: "L1" | "L2" | "REFERENCE";
  fidelity: string;
  data: string;
  correlation: string;
  uncertainty: "Low" | "Medium" | "High";
  status: string;
  assumptions: readonly string[];
}

export const MODEL_LEVELS: readonly { level: string; text: string }[] = [
  { level: "L1", text: "Steady state, normalised to a reference point" },
  { level: "L2", text: "Prescribed transient or profile, not solved" },
  { level: "REFERENCE", text: "Scripted behaviour for teaching" },
];

/** Model credibility differs by model: no single level applies to the whole twin. */
export const MODEL_CARDS: Record<"cycle" | "transient" | "thermal" | "health" | "prognosis", ModelCard> = {
  cycle: {
    model: "Engine Cycle and Performance Model",
    level: "L1",
    fidelity: "Reduced order, steady state",
    data: "Simulated",
    correlation: "Not Test-Correlated",
    uncertainty: "Medium",
    status: "Reference Model",
    assumptions: ["Normalised to one reference operating point.", "No two-phase flow or combustion dynamics."],
  },
  transient: {
    model: "Start and Shutdown Transient Model",
    level: "L2",
    fidelity: "Prescribed sequence",
    data: "Simulated",
    correlation: "Not Test-Correlated",
    uncertainty: "High",
    status: "Reference Model",
    assumptions: ["The order of events is representative.", "Timings are compressed for teaching and are not operating data."],
  },
  thermal: {
    model: "Chamber Wall Thermal Model",
    level: "L2",
    fidelity: "Prescribed heat-load profile",
    data: "Simulated",
    correlation: "Not Test-Correlated",
    uncertainty: "High",
    status: "Reference Model",
    assumptions: ["Heat load peaks at the throat.", "Cooling geometry is conceptual and carries no dimensions."],
  },
  health: {
    model: "Turbomachinery Health Model",
    level: "REFERENCE",
    fidelity: "Reduced Order",
    data: "Simulated",
    correlation: "Not Test-Correlated",
    uncertainty: "Medium",
    status: "Reference Model",
    assumptions: ["One fault at a time.", "The vibration signal is synthesised from a single severity value."],
  },
  prognosis: {
    model: "Bearing Degradation Prognosis",
    level: "REFERENCE",
    fidelity: "Reduced Order",
    data: "Simulated",
    correlation: "Not Test-Correlated",
    uncertainty: "High",
    status: "Reference Model",
    assumptions: ["Degradation continues along its present trend.", "The uncertainty band is illustrative and widens with the horizon."],
  },
};

export const MODEL_BY_SYSTEM: Record<SystemId, keyof typeof MODEL_CARDS> = {
  propellant_feed: "cycle",
  turbomachinery: "health",
  combustion: "cycle",
  regenerative_cooling: "thermal",
  nozzle: "cycle",
  valves_actuation: "transient",
  instrumentation: "health",
  engine_control: "transient",
};

// ── Architecture ────────────────────────────────────────────────────────────

export interface ArchitectureLayerDef {
  id: ArchitectureLayer;
  name: string;
  text: string;
  /** Physical parts that light up with the layer; "all" is the whole engine. */
  parts: readonly PartId[] | "all";
  /** Where the layer's node sits around the engine, for the layers that are not hardware. */
  node?: readonly [number, number, number];
}

export const ARCHITECTURE_LAYERS: readonly ArchitectureLayerDef[] = [
  { id: "hardware", name: "ENGINE HARDWARE", text: "The physical engine: what everything else observes and commands.", parts: "all" },
  { id: "sensors", name: "SENSORS", text: "Pressure, temperature, speed, vibration, position and strain.", parts: ["sensor_bodies"] },
  { id: "acquisition", name: "DATA ACQUISITION", text: "Conditions and digitises every sensor signal.", parts: ["harness", "sensor_bodies"], node: [-1.55, 1.05, 0.5] },
  { id: "control", name: "ENGINE CONTROL", text: "Sequences the engine and commands the valves and actuators.", parts: ["engine_controller", "valve_main_oxidiser", "valve_main_fuel", "valve_throttle", "gimbal_actuators"], node: [-1.75, 0.35, 0.5] },
  { id: "models", name: "PHYSICS MODELS", text: "Say what the engine should be doing for the same commands.", parts: ["chamber_liner", "cooling_jacket", "turbopump_fuel", "turbopump_oxidiser"], node: [1.6, 1.0, 0.5] },
  { id: "fdir", name: "FDIR / HEALTH LOGIC", text: "Detects a fault, isolates it and recommends a response.", parts: ["bearing_fuel", "turbopump_fuel"], node: [1.85, 0.3, 0.5] },
  { id: "twin", name: "DIGITAL TWIN", text: "Holds observed, estimated, expected and predicted state together.", parts: "all", node: [1.85, -0.45, 0.5] },
  { id: "evidence", name: "TEST EVIDENCE", text: "What a simulated test shows about each requirement.", parts: [], node: [1.6, -1.15, 0.5] },
];

/** One reference requirement traced to its evidence. Educational only: not an engine specification. */
export const TRACEABILITY: readonly { level: string; text: string }[] = [
  { level: "REQUIREMENT", text: "Maintain chamber state within the simulated reference envelope" },
  { level: "MODEL", text: "Reduced-order chamber model" },
  { level: "SENSOR", text: "Chamber pressure" },
  { level: "TEST", text: "Simulated Mainstage Test" },
  { level: "EVIDENCE", text: "Pass" },
];

// ── Guided tour ─────────────────────────────────────────────────────────────

export const TOUR_STAGES: readonly { id: string; title: string; caption: string; seconds: number }[] = [
  { id: "meet", title: "Meet the Engine", caption: "A reusable liquid rocket engine, as a reference architecture.", seconds: 16 },
  { id: "open", title: "Open the Engine", caption: "Its systems come apart along the lines they are built on.", seconds: 22 },
  { id: "propellant", title: "Follow Propellant", caption: "Fuel and oxidiser travel separately until they burn.", seconds: 24 },
  { id: "turbomachinery", title: "Understand Turbomachinery", caption: "Hot gas spins a turbine. The turbine drives the pump.", seconds: 26 },
  { id: "chamber", title: "Enter the Combustion Chamber", caption: "The propellants meet, mix and burn at high pressure.", seconds: 24 },
  { id: "cooling", title: "See Regenerative Cooling", caption: "Fuel carries the heat out of the wall before it is burned.", seconds: 26 },
  { id: "nozzle", title: "Understand the Nozzle", caption: "The gas expands, speeds up and becomes thrust.", seconds: 22 },
  { id: "start", title: "Start the Engine", caption: "Valves, flow, rotation, combustion, plume: in that order.", seconds: 28 },
  { id: "sensors", title: "Monitor Sensors", caption: "Sensors report what the engine is doing.", seconds: 22 },
  { id: "anomaly", title: "Detect an Anomaly", caption: "A bearing begins to wear. The vibration signal changes first.", seconds: 30 },
  { id: "twin", title: "Compare the Digital Twin", caption: "What was expected, what was observed, and the difference.", seconds: 28 },
  { id: "review", title: "Review the Test", caption: "Hardware, sensors, models and evidence form one system.", seconds: 22 },
];

export const DESKTOP_NOTE = "Desktop / Laptop Experience";
