// What the Next-Generation Rocket Engine Digital Twin says. The page's semantic
// HTML, the interactive console, the metadata and the JSON-LD all read from
// here, so a name is only ever written once.
//
// The engine is a reference architecture for teaching. Nothing here is a
// dimension, a material, a tolerance or a figure from a real engine.
import type {
  AudienceMode,
  ComponentId,
  CutawaySystem,
  ExplodedLevel,
  FaultId,
  FlowId,
  ModeId,
  RelatedDestination,
  SensorId,
  SensorType,
  SystemId,
  TestPhaseId,
  TwinStateId,
} from "../types";

export const PRODUCT = {
  name: "Next-Generation Rocket Engine Digital Twin",
  tagline: "Design · Simulate · Test · Diagnose",
  platform: "Reusable Liquid Rocket Engine · Reference Architecture",
  description: "Interactive digital-engineering learning environment for understanding propulsion systems, control, instrumentation, health monitoring and digital-twin behaviour.",
  route: "/space/rocket-engine-digital-twin",
  homeRoute: "/space",
  homeLabel: "Space",
  enterLabel: "Enter Digital Twin",
  demoLabel: "Run Engine Demo",
  tourLabel: "Guided Engine Tour",
  /** In-page anchor of the interactive console. */
  consoleId: "digital-twin",
} as const;

/** Who prepared the experience, and when its information was last reviewed. */
export const PREPARED_BY = {
  notes: ["Next-Generation Rocket Engine Digital Twin is an EV.ENGINEER™ interactive engineering experience for rocket propulsion, simulation, health monitoring and digital-twin learning."],
  reviewed: "2026-10-03",
  reviewedLabel: "3 October 2026",
  imageAlt: "Sudarshana Karkala — EV.ENGINEER",
} as const;

/** Stills rendered from the 3D scene itself: re-render them after a visible change to the engine. */
export const POSTER = {
  src: "/space/rocket-engine-twin/poster.jpg",
  alt: "The reusable liquid rocket engine reference architecture in a dark engineering studio: a bell nozzle under a cooled combustion chamber, with a turbopump on either side, their ducting, and the gimbal mount above",
  width: 1200,
  height: 1000,
} as const;

export const DISCLAIMER = "Educational digital-engineering demonstrator. Engine architecture, telemetry, operating states, faults and test scenarios are reference or simulated representations.";

export const SCHEMATIC_ALT =
  "Schematic of the reusable liquid rocket engine reference architecture: oxidiser and fuel inlet ducts, two turbopumps driven by a preburner, the injector and combustion chamber, a regeneratively cooled bell nozzle with its coolant manifold, the main valves and the engine controller. Not to scale.";

// ── Overview ────────────────────────────────────────────────────────────────

export const OVERVIEW = {
  heading: "Understand a Rocket Engine as a Complete System",
  paragraphs: [
    "A liquid rocket engine is not one component but a set of systems that have to work together within tight margins. The Next-Generation Rocket Engine Digital Twin presents a reusable liquid rocket engine reference architecture as a complete system, so you can see how each part depends on the others.",
    "The propellant feed system supplies the turbomachinery; the turbopumps deliver high-pressure propellants to the combustion chamber; regenerative cooling protects the chamber and nozzle; and the engine controller uses instrumentation to sequence, regulate and protect the engine. The same measurements feed engine health monitoring, fault diagnosis and the digital twin.",
  ],
  coversLabel: "What the experience covers",
  covers: [
    "Propellant feed architecture",
    "Turbomachinery",
    "Combustion",
    "Regenerative cooling",
    "Nozzle operation",
    "Valves and actuation",
    "Instrumentation",
    "Engine control",
    "Simulated test sequences",
    "Health monitoring",
    "Fault diagnosis",
    "Digital-twin comparison",
  ],
} as const;

export const ARCHITECTURE = {
  heading: "Rocket Engine Architecture",
  text: "The reference architecture is a pump-fed, regeneratively cooled, throttleable and restartable liquid rocket engine with a closed cycle: the gas that drives the turbines is burned again in the main chamber. It is a teaching layout, not a design.",
} as const;

// ── Systems and components ──────────────────────────────────────────────────

export interface EngineComponent {
  id: ComponentId;
  name: string;
  /** Plain-language explanation (Learn). */
  learn: string;
  /** Engineering detail (Engineer). */
  engineer: string;
}

export interface EngineSystem {
  id: SystemId;
  /** Heading used everywhere the system is named. */
  name: string;
  /** Lower-case form for control labels: "Explore turbomachinery". */
  label: string;
  summary: string;
  components: readonly EngineComponent[];
}

export const SYSTEMS: readonly EngineSystem[] = [
  {
    id: "propellant_feed",
    name: "Propellant Feed System",
    label: "the propellant feed system",
    summary: "Carries liquid oxidiser and fuel from the vehicle tanks to the turbopump inlets at the pressure and temperature the pumps need to run without cavitating.",
    components: [
      {
        id: "oxidiser_inlet",
        name: "Oxidiser inlet duct",
        learn: "Brings cold liquid oxidiser from the tank to the oxidiser pump.",
        engineer: "Inlet pressure and temperature set the net positive suction head available to the pump. With too little margin the liquid vaporises at the pump inlet, which is cavitation.",
      },
      {
        id: "fuel_inlet",
        name: "Fuel inlet duct",
        learn: "Brings liquid fuel from the tank to the fuel pump.",
        engineer: "Before start the duct and pump are chilled to propellant temperature so that liquid, not vapour, reaches the pump inlet.",
      },
    ],
  },
  {
    id: "turbomachinery",
    name: "Turbomachinery",
    label: "turbomachinery",
    summary: "Turbopumps raise propellant pressure far above tank pressure; a turbine driven by hot gas supplies the shaft power.",
    components: [
      {
        id: "oxidiser_turbopump",
        name: "Oxidiser turbopump",
        learn: "A pump and a turbine on one shaft. The turbine spins the pump, which pushes oxidiser toward the injector at high pressure.",
        engineer: "Pump pressure rise scales roughly with the square of shaft speed and power with its cube, so shaft speed is a primary control and health quantity. Bearings and seals are the classic life-limiting items for reuse.",
      },
      {
        id: "fuel_turbopump",
        name: "Fuel turbopump",
        learn: "Raises fuel pressure high enough to pass through the cooling channels and still enter the chamber.",
        engineer: "Fuel discharge pressure has to cover the cooling-jacket and injector pressure drops as well as chamber pressure, which usually makes it the highest pressure in the engine.",
      },
      {
        id: "preburner",
        name: "Preburner",
        learn: "A small combustor that makes the hot gas that drives the turbines.",
        engineer: "Burns a small share of the propellants away from the main mixture ratio to keep turbine inlet temperature within material limits. In this closed-cycle reference architecture the turbine exhaust goes to the main injector instead of overboard.",
      },
      {
        id: "bearing_region",
        name: "Bearing region",
        learn: "Bearings hold the spinning shaft in place. Their condition shows up as vibration.",
        engineer: "Vibration and temperature sensors sit beside the bearings. A change at a frequency tied to shaft speed is the usual first sign of wear.",
      },
    ],
  },
  {
    id: "combustion",
    name: "Combustion Chamber",
    label: "the combustion chamber",
    summary: "The injector mixes the propellants and the chamber burns them at high pressure, turning chemical energy into hot gas.",
    components: [
      {
        id: "injector",
        name: "Injector",
        learn: "Sprays and mixes fuel and oxidiser so they burn evenly.",
        engineer: "Sets atomisation, mixing and the pressure drop that isolates the feed system from chamber pressure oscillations. Injector design strongly influences combustion stability and efficiency.",
      },
      {
        id: "combustion_chamber",
        name: "Combustion chamber",
        learn: "Where the propellants burn. The pressure here is the engine's headline operating number.",
        engineer: "Chamber pressure and mixture ratio fix the temperature and composition of the gas entering the nozzle. Characteristic velocity (c*) measures how well the chamber turns propellant into high-pressure gas.",
      },
      {
        id: "igniter",
        name: "Igniter",
        learn: "Lights the engine at start, and again on every restart.",
        engineer: "A reusable engine needs a repeatable ignition source and a start sequence that establishes flow, ignition and pressure in a controlled order.",
      },
    ],
  },
  {
    id: "regenerative_cooling",
    name: "Regenerative Cooling",
    label: "regenerative cooling",
    summary: "Fuel flows through channels in the chamber and nozzle wall before it is burned, carrying heat away and keeping the wall within its temperature limit.",
    components: [
      {
        id: "coolant_manifold",
        name: "Coolant manifold",
        learn: "A ring that shares the fuel evenly between the cooling channels.",
        engineer: "Even distribution matters: a starved channel shows up as a local hot spot on the wall.",
      },
      {
        id: "cooling_channels",
        name: "Cooling channels",
        learn: "Narrow passages inside the wall. Fuel passing through them picks up heat before it is burned.",
        engineer: "Heat flux peaks near the throat, so coolant velocity and channel geometry are most critical there. The heat picked up returns to the cycle with the propellant, which is why the cooling is called regenerative.",
      },
    ],
  },
  {
    id: "nozzle",
    name: "Rocket Nozzle",
    label: "the rocket nozzle",
    summary: "A converging–diverging nozzle accelerates the hot gas to supersonic speed, converting pressure and temperature into thrust.",
    components: [
      {
        id: "throat",
        name: "Throat",
        learn: "The narrowest point. The gas reaches the speed of sound here.",
        engineer: "The flow is choked at the throat, so throat area and chamber conditions set the mass flow rate.",
      },
      {
        id: "nozzle_extension",
        name: "Nozzle extension",
        learn: "The bell-shaped section where the gas expands and speeds up.",
        engineer: "Expansion ratio, exit area over throat area, sets the exit pressure. A nozzle matched to one ambient pressure is over- or under-expanded at others, which matters for an engine that runs from sea level to vacuum.",
      },
    ],
  },
  {
    id: "valves_actuation",
    name: "Valves and Actuation",
    label: "valves and actuation",
    summary: "Valves start, throttle and stop the propellant flows; actuators position the valves and steer the engine.",
    components: [
      {
        id: "main_valves",
        name: "Main propellant valves",
        learn: "Open to start the engine and close to shut it down.",
        engineer: "Their opening and closing order and timing shape the start and shutdown transients, including which propellant reaches the chamber first.",
      },
      {
        id: "throttle_valve",
        name: "Throttle control valve",
        learn: "Adjusts how much propellant reaches the preburner, which changes thrust.",
        engineer: "Modulates turbine power, and through it pump speed, chamber pressure and thrust. Valve position feedback closes the control loop.",
      },
      {
        id: "gimbal_actuator",
        name: "Gimbal actuators",
        learn: "Tilt the whole engine a few degrees to steer the vehicle.",
        engineer: "Thrust vector commands come from the vehicle's flight computer; the engine reports actuator position and load.",
      },
    ],
  },
  {
    id: "instrumentation",
    name: "Rocket Engine Instrumentation",
    label: "rocket engine instrumentation",
    summary: "Pressure, temperature, speed, vibration, flow and position sensors measure what the engine is doing.",
    components: [
      {
        id: "pressure_sensors",
        name: "Pressure transducers",
        learn: "Measure pressure in the chamber, the pumps and the lines.",
        engineer: "Chamber pressure is the primary thrust indicator; pump inlet and discharge pressures show pump condition and margin to cavitation.",
      },
      {
        id: "temperature_sensors",
        name: "Temperature sensors",
        learn: "Measure how hot or cold the propellants, the gas and the walls are.",
        engineer: "Turbine inlet temperature and coolant outlet temperature are typical limit-monitored quantities.",
      },
      {
        id: "speed_vibration_sensors",
        name: "Speed and vibration sensors",
        learn: "Measure how fast the turbopumps spin and how much they vibrate.",
        engineer: "Shaft speed and vibration spectra are the main inputs for detecting bearing wear, rotor imbalance and cavitation.",
      },
    ],
  },
  {
    id: "engine_control",
    name: "Engine Control System",
    label: "the engine control system",
    summary: "The engine controller sequences start and shutdown, holds thrust and mixture ratio at their commanded values, and shuts the engine down safely if a limit is exceeded.",
    components: [
      {
        id: "engine_controller",
        name: "Engine controller",
        learn: "The engine's computer. It reads the sensors, commands the valves and decides when something is wrong.",
        engineer: "Runs closed-loop control of chamber pressure and mixture ratio, enforces limits using redundant sensors, and reports status and health data to the vehicle.",
      },
    ],
  },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((s) => [s.id, s])) as Record<SystemId, EngineSystem>;

export const COMPONENT_SYSTEM = Object.fromEntries(SYSTEMS.flatMap((s) => s.components.map((c) => [c.id, s.id]))) as Record<ComponentId, SystemId>;

// ── Interactive console ─────────────────────────────────────────────────────

export const MODES: readonly { id: ModeId; label: string; ariaLabel: string }[] = [
  { id: "engine", label: "Engine", ariaLabel: "Explore engine systems" },
  { id: "build", label: "Build", ariaLabel: "Open engine build view" },
  { id: "flow", label: "Flow", ariaLabel: "Show engine flow paths" },
  { id: "control", label: "Control", ariaLabel: "Open engine control and instrumentation" },
  { id: "test", label: "Test", ariaLabel: "Open simulated engine test" },
  { id: "health", label: "Health", ariaLabel: "Open engine health monitoring" },
  { id: "twin", label: "Twin", ariaLabel: "Compare digital twin states" },
  { id: "architecture", label: "Architecture", ariaLabel: "Open system architecture" },
];

export const AUDIENCE_MODES: readonly { id: AudienceMode; label: string; ariaLabel: string }[] = [
  { id: "learn", label: "Learn", ariaLabel: "Learn mode: plain-language explanations" },
  { id: "engineer", label: "Engineer", ariaLabel: "Engineer mode: engineering detail" },
];

export const EXPLODED_LEVELS: readonly { id: ExplodedLevel; label: string }[] = [
  { id: "assembled", label: "Assembled" },
  { id: "assemblies", label: "Major assemblies" },
  { id: "components", label: "Components" },
];

export const CUTAWAYS: readonly { system: CutawaySystem; label: string; ariaLabel: string; text: string }[] = [
  { system: "combustion", label: "Combustion chamber", ariaLabel: "View combustion chamber cutaway", text: "Inside the chamber: the injector face at the top and the combustion zone beneath it." },
  { system: "turbomachinery", label: "Turbopump", ariaLabel: "View turbopump cutaway", text: "Inside each turbopump: a turbine wheel and a pump impeller on a single shaft." },
  { system: "regenerative_cooling", label: "Cooling jacket", ariaLabel: "View cooling jacket cutaway", text: "Inside the wall: the liner on the gas side, the cooling passages, and the jacket that holds the pressure." },
  { system: "nozzle", label: "Nozzle throat", ariaLabel: "View nozzle cutaway", text: "Inside the nozzle: the gas expands and accelerates from the throat to the exit." },
];

export interface EngineFlow {
  id: FlowId;
  name: string;
  ariaLabel: string;
  steps: readonly string[];
  note: string;
}

export const FLOWS: readonly EngineFlow[] = [
  {
    id: "propellant",
    name: "Propellant",
    ariaLabel: "Show propellant flow",
    steps: ["Tank outlets and inlet ducts", "Turbopumps raise the pressure", "Main valves meter the flow", "Injector", "Combustion chamber"],
    note: "Oxidiser and fuel stay separate until the injector.",
  },
  {
    id: "cooling",
    name: "Cooling",
    ariaLabel: "Show regenerative cooling flow",
    steps: ["Fuel turbopump discharge", "Coolant manifold", "Cooling channels in the nozzle and chamber wall", "Warmed fuel returns to the cycle", "Burned in the engine"],
    note: "The fuel cools the wall first and is burned afterwards, so no propellant is spent on cooling alone.",
  },
  {
    id: "hot_gas",
    name: "Hot gas",
    ariaLabel: "Show hot-gas flow",
    steps: ["Preburner", "Turbines", "Main injector", "Combustion chamber", "Throat", "Nozzle exit"],
    note: "In this closed-cycle reference architecture the gas that drives the turbines is burned again in the main chamber.",
  },
  {
    id: "data",
    name: "Data",
    ariaLabel: "Show data and control flow",
    steps: ["Sensors", "Signal conditioning", "Engine controller", "Valve and actuator commands", "Telemetry to health monitoring and the digital twin"],
    note: "The same measurements serve control, protection and health monitoring.",
  },
];

export interface EngineSensor {
  id: SensorId;
  type: SensorType;
  system: SystemId;
  name: string;
  use: string;
}

export const SENSORS: readonly EngineSensor[] = [
  { id: "chamber_pressure", type: "pressure", system: "combustion", name: "Chamber pressure", use: "Primary thrust feedback for the control loop." },
  { id: "pump_discharge_pressure", type: "pressure", system: "turbomachinery", name: "Pump discharge pressure", use: "Shows the pressure the turbopump adds." },
  { id: "turbine_inlet_temperature", type: "temperature", system: "turbomachinery", name: "Turbine inlet temperature", use: "Limit-monitored to protect the turbine." },
  { id: "shaft_speed", type: "speed", system: "turbomachinery", name: "Turbopump shaft speed", use: "Overspeed protection and pump power estimate." },
  { id: "pump_vibration", type: "vibration", system: "turbomachinery", name: "Turbopump vibration", use: "Bearing and rotor condition." },
  { id: "bearing_temperature", type: "temperature", system: "turbomachinery", name: "Bearing temperature", use: "Follows bearing wear, later than vibration." },
  { id: "coolant_outlet_temperature", type: "temperature", system: "regenerative_cooling", name: "Coolant outlet temperature", use: "Shows the heat picked up from the wall." },
  { id: "valve_position", type: "position", system: "valves_actuation", name: "Valve position", use: "Confirms that each valve followed its command." },
  { id: "thrust_mount_strain", type: "strain", system: "valves_actuation", name: "Thrust mount strain", use: "Load carried from the engine into the vehicle." },
];

/** Where a measurement goes after it leaves the sensor. */
export const TRACE_PATH = ["Sensor", "Signal conditioning", "Engine controller", "Engine health monitoring", "Digital twin"] as const;

export const TEST_PHASES: readonly { id: TestPhaseId; name: string; text: string }[] = [
  { id: "system_check", name: "System check", text: "Controller self-test, sensor checks and confirmation of every valve position." },
  { id: "conditioning", name: "Conditioning", text: "Lines and pumps are chilled to propellant temperature so that liquid reaches the pump inlets." },
  { id: "ready", name: "Ready", text: "All start conditions are met and the sequence waits for the start command." },
  { id: "start", name: "Start", text: "Valves open in sequence, the igniter fires, the turbopumps spin up and chamber pressure rises." },
  { id: "mainstage", name: "Mainstage", text: "Steady operation at the commanded thrust and mixture ratio." },
  { id: "throttle", name: "Throttle", text: "Thrust is stepped down and back up to exercise the control loop." },
  { id: "shutdown", name: "Shutdown", text: "Valves close in sequence, the pumps spin down and the lines are purged." },
  { id: "review", name: "Review", text: "Recorded data is compared with expected behaviour and the health indicators are updated." },
];

/** Phases in which the engine is burning. */
export const FIRING_PHASES: readonly TestPhaseId[] = ["start", "mainstage", "throttle"];


export interface FaultScenario {
  id: FaultId;
  name: string;
  system: SystemId;
  symptom: string;
  diagnosis: string;
  response: string;
}

export const FAULTS: readonly FaultScenario[] = [
  {
    id: "turbopump_bearing_wear",
    name: "Turbopump bearing wear",
    system: "turbomachinery",
    symptom: "Vibration at multiples of shaft speed rises over successive runs while pump performance stays normal.",
    diagnosis: "The signature points to a bearing, not to cavitation or imbalance: it tracks shaft speed and grows with accumulated run time.",
    response: "The engine completes the test within limits. Engine health monitoring flags the turbopump for inspection before the next run.",
  },
  {
    id: "cooling_channel_restriction",
    name: "Cooling channel restriction",
    system: "regenerative_cooling",
    symptom: "Coolant pressure drop rises and coolant outlet temperature climbs at constant thrust.",
    diagnosis: "More pressure loss together with more heat picked up per unit of flow indicates reduced flow area in the cooling channels.",
    response: "The controller holds a lower thrust level to keep the wall within its temperature limit, and shuts the engine down if the limit is reached.",
  },
  {
    id: "chamber_pressure_sensor_drift",
    name: "Chamber pressure sensor drift",
    system: "instrumentation",
    symptom: "One chamber pressure reading drifts away from the others and from the value the model estimates from pump speed and flow.",
    diagnosis: "The engine is behaving as expected and the disagreement is confined to one sensor, so the fault is isolated to the measurement.",
    response: "The controller votes the sensor out and continues on the remaining measurements. The sensor is replaced before the next run.",
  },
];

export const FAULT_BY_ID = Object.fromEntries(FAULTS.map((f) => [f.id, f])) as Record<FaultId, FaultScenario>;

// ── Health and digital twin ─────────────────────────────────────────────────

export const SENSORS_TO_TWIN = {
  heading: "From Sensors to Digital Twin",
  intro: "Instrumentation turns engine behaviour into data. That data serves three purposes: control, protection and understanding the engine's condition.",
  testing: {
    heading: "Simulated Engine Testing",
    text: "A Simulated Engine Test steps the reference engine through eight phases, showing what the controller does and what the sensors would report in each.",
  },
  health: {
    heading: "Engine Health Monitoring",
    text: "Engine Health Monitoring watches for departures from expected behaviour. Each fault scenario in the experience shows a symptom, how it is diagnosed and how the engine responds.",
  },
  twin: {
    heading: "Digital Twin",
    text: "The Digital Twin keeps four views of the engine side by side:",
  },
} as const;

export const TWIN_STATES: readonly { id: TwinStateId; label: string; text: string }[] = [
  { id: "observed", label: "OBSERVED", text: "Synthetic or imported telemetry: what the sensors report." },
  { id: "estimated", label: "ESTIMATED", text: "States inferred by the model, including quantities that no sensor measures directly." },
  { id: "expected", label: "EXPECTED", text: "Reference-model behaviour for the same commands and conditions." },
  { id: "predicted", label: "PREDICTED", text: "Projected future behaviour, with uncertainty that widens with the prediction horizon." },
];

/**
 * One illustrative mainstage snapshot for the comparison view. Values are a
 * percentage of the reference model's value: SIMULATED, not engine data.
 */
export const TWIN_SNAPSHOT = {
  caption: "Illustrative mainstage snapshot, as a percentage of the reference value",
  rows: [
    { parameter: "Chamber pressure", system: "combustion", observed: 98.4, estimated: 98.6, expected: 100, predicted: 98.1, uncertainty: 0.6 },
    { parameter: "Turbopump shaft speed", system: "turbomachinery", observed: 101.2, estimated: 101.0, expected: 100, predicted: 101.6, uncertainty: 0.8 },
    { parameter: "Coolant outlet temperature", system: "regenerative_cooling", observed: 103.5, estimated: 103.1, expected: 100, predicted: 104.2, uncertainty: 1.1 },
  ],
  predictionNote: "Predicted values are for the next run. The band is the model's uncertainty, and it widens the further ahead the model looks.",
} as const satisfies { caption: string; rows: readonly { parameter: string; system: SystemId; observed: number; estimated: number; expected: number; predicted: number; uncertainty: number }[]; predictionNote: string };

// ── Model credibility ───────────────────────────────────────────────────────

export const MODEL_STATUS = ["REFERENCE MODEL", "SIMULATED", "REDUCED ORDER", "NOT TEST-CORRELATED"] as const;
export type ModelStatus = (typeof MODEL_STATUS)[number];

export const MODEL_CREDIBILITY = {
  heading: "Model Credibility",
  text: "The experience uses reference and reduced-order models for interactive learning. Each model below identifies its fidelity, its main assumptions, its validation status and whether its data is simulated or correlated with external evidence. None of the models here is correlated with test data.",
  id: "model-credibility",
} as const;

export const MODELS: readonly { name: string; status: ModelStatus; fidelity: string; assumptions: string; data: "SIMULATED" | "REFERENCE MODEL"; validation: ModelStatus }[] = [
  { name: "Engine geometry", status: "REFERENCE MODEL", fidelity: "Illustrative layout, not to scale", assumptions: "Shows how the systems connect. Carries no dimensions, materials or tolerances.", data: "REFERENCE MODEL", validation: "NOT TEST-CORRELATED" },
  { name: "Engine cycle and performance", status: "REDUCED ORDER", fidelity: "Steady state, lumped parameter", assumptions: "Normalised to a reference operating point. No transient combustion or two-phase flow.", data: "SIMULATED", validation: "NOT TEST-CORRELATED" },
  { name: "Simulated Engine Test", status: "SIMULATED", fidelity: "Scripted phase sequence", assumptions: "Phase order and intent are representative; timings are illustrative.", data: "SIMULATED", validation: "NOT TEST-CORRELATED" },
  { name: "Fault scenarios", status: "SIMULATED", fidelity: "Scripted symptom, diagnosis and response", assumptions: "Each scenario shows one fault in isolation.", data: "SIMULATED", validation: "NOT TEST-CORRELATED" },
  { name: "Digital Twin comparison", status: "REDUCED ORDER", fidelity: "Single illustrative snapshot", assumptions: "Observed values are synthetic. Predicted values carry an illustrative uncertainty band.", data: "SIMULATED", validation: "NOT TEST-CORRELATED" },
];

// ── Questions and key terms ─────────────────────────────────────────────────

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is a rocket engine digital twin?",
    a: "A rocket engine digital twin is a digital representation that combines an engine architecture, physics-based or data-driven models, simulated or measured telemetry, operating state and health information. It can be used to compare expected and observed behaviour, investigate anomalies and study how engine systems interact. The digital twin on this page is educational: its models are reference and reduced-order models, and its telemetry is simulated.",
  },
  {
    q: "What can I explore in this 3D rocket engine?",
    a: "You can explore a reusable liquid rocket engine reference architecture system by system: the propellant feed system, turbomachinery, combustion chamber, regenerative cooling, nozzle, valves and actuation, instrumentation and engine control. You can follow propellant, cooling, hot-gas and data flows, run a simulated engine test from system check to review, work through fault scenarios, and compare observed, estimated, expected and predicted digital twin states.",
  },
  {
    q: "What is turbomachinery in a liquid rocket engine?",
    a: "Turbomachinery is the rotating equipment that pressurises the propellants. A turbopump combines a pump and a turbine on one shaft: hot gas spins the turbine, and the turbine drives the pump. Pump-fed engines use turbopumps because raising propellant pressure at the engine lets the vehicle's tanks stay light and at low pressure while the combustion chamber runs at high pressure.",
  },
  {
    q: "How does regenerative cooling work?",
    a: "In regenerative cooling, one propellant, usually the fuel, flows through channels built into the wall of the combustion chamber and nozzle before it is burned. The propellant absorbs heat from the wall, which keeps the wall within its temperature limit, and carries that heat back into the engine cycle. Heat flux is highest near the throat, so cooling there is the most demanding.",
  },
  {
    q: "What does the engine controller monitor?",
    a: "The engine controller reads pressures, temperatures, turbopump shaft speeds, vibration, flow rates and valve positions. It uses them to sequence start and shutdown, to hold thrust and mixture ratio at their commanded values, and to check limits. If a critical measurement crosses its limit and redundant sensors confirm the reading, the controller reduces power or shuts the engine down.",
  },
  {
    q: "How is engine health monitored?",
    a: "Engine health monitoring compares what the sensors report with what a model expects for the same operating conditions. The differences, together with trends across runs and features such as vibration signatures, are used to detect a fault, isolate it to a component and estimate how it will progress. For a reusable engine, the result informs inspection and maintenance between flights.",
  },
  {
    q: "What is the difference between a simulation and a digital twin?",
    a: "A simulation runs a model of a system under chosen conditions. A digital twin is tied to a particular system: it takes that system's telemetry, estimates its current state and compares observed with expected behaviour over time. A simulation answers what would happen; a digital twin also answers what is happening and what is likely to happen next. Here, the telemetry is itself simulated.",
  },
  {
    q: "Are the engine values shown here from a real flight engine?",
    a: "No. The engine shown here is a reusable liquid rocket engine reference architecture created for digital-engineering education and simulation. Geometry, telemetry, operating states, faults and predictions are illustrative or simulated unless explicitly identified otherwise. It does not represent any production or flight engine, and the experience is not test-correlated.",
  },
];

/** Terms the page uses but does not define anywhere else. */
export const GLOSSARY: readonly { term: string; definition: string }[] = [
  { term: "Telemetry", definition: "Measurements sent from the engine's sensors and controller for monitoring and recording." },
  { term: "FDIR", definition: "Fault detection, isolation and recovery: noticing that something is wrong, finding where, and acting to stay safe." },
  { term: "Reduced-order model", definition: "A simplified model that keeps the dominant physics so that it runs fast enough for interactive use." },
  { term: "Model residual", definition: "The difference between an observed value and the value a model expects for the same conditions." },
  { term: "Mixture ratio", definition: "The mass flow of oxidiser divided by the mass flow of fuel." },
  { term: "Redline", definition: "A limit on a measured quantity that, once exceeded and confirmed, triggers a protective action." },
];

// ── Navigation ──────────────────────────────────────────────────────────────

export const RELATED: readonly { destination: RelatedDestination; href: string; title: string; text: string }[] = [
  { destination: "space", href: "/space", title: "Space", text: "Spacecraft health management, telemetry and safe recovery" },
  { destination: "model_rocketry", href: "/space/model-rocketry", title: "Model Rocketry", text: "Propulsion, stability and flight analysis from first principles" },
  { destination: "satellite_engineering", href: "/space/satellite-engineering", title: "Satellite Engineering", text: "Spacecraft systems architecture and digital twins" },
];

export const LARGER_SCREEN_NOTE = {
  badge: "DESKTOP EXPERIENCE RECOMMENDED",
  body: "The interactive 3D engine, with its cut-aways, flows, simulated test, fault diagnosis and digital twin comparison, opens on a laptop or desktop. Here you can explore the same systems, test and health views on a schematic.",
} as const;
