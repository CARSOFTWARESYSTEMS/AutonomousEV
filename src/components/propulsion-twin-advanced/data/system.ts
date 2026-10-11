// The propulsion system the tutorial is built on: a generic, educational,
// pump-fed liquid rocket propulsion reference architecture. It is described at
// the level a Digital Twin needs: what each part does, what state it carries
// and what is measured there. It does not reproduce any flight engine.
import type { SubsystemId } from "../types";

export const ARCHITECTURE_STATEMENT =
  "The reference architecture is a pump-fed, regeneratively cooled liquid propulsion system with a closed cycle: a preburner makes the gas that drives the turbine, and that gas is then burned in the main chamber. It is a generic teaching layout. It claims no dimension, material, rating or performance figure of any proprietary or flight engine.";

export interface Subsystem {
  id: SubsystemId;
  name: string;
  role: string;
  /** What is in it. */
  elements: readonly string[];
  /** The states the twin carries for it: measured, and hidden. */
  measured: readonly string[];
  hidden: readonly string[];
  /** Why the twin cares. */
  twin: string;
}

export const SUBSYSTEMS: readonly Subsystem[] = [
  {
    id: "storage",
    name: "Propellant Storage",
    role: "Holds oxidiser and fuel at low pressure and feeds them to the engine. The pressurisation boundary is where the propulsion system meets the vehicle.",
    elements: ["Oxidiser tank", "Fuel tank", "Pressurisation boundary", "Tank pressure", "Propellant temperature", "Liquid level (concept)"],
    measured: ["Tank pressure, each tank", "Propellant temperature", "Liquid level"],
    hidden: ["Ullage gas mass", "Propellant mass remaining"],
    twin: "Tank pressure and temperature are the boundary conditions of the feed model. Everything the twin expects downstream starts here.",
  },
  {
    id: "feed",
    name: "Feed System",
    role: "Carries each propellant from its tank to its pump inlet without losing the pressure margin the pump needs.",
    elements: ["Feed lines", "Isolation valves", "Control valves", "Filters", "Flexible connections", "Check valves"],
    measured: ["Pump inlet pressure", "Propellant flow", "Valve position"],
    hidden: ["Line and filter loss coefficient", "Suction margin (net positive suction head)"],
    twin: "A filter loading up or a valve short of fully open appears as a loss coefficient that rises, long before the pump cavitates.",
  },
  {
    id: "turbomachinery",
    name: "Turbomachinery",
    role: "Raises propellant pressure from tank level to well above chamber pressure, using shaft power from a turbine.",
    elements: ["Fuel pump", "Oxidiser pump", "Turbine", "Shaft", "Bearings", "Seals", "Pump inlet", "Pump discharge"],
    measured: ["Pump inlet and discharge pressure", "Shaft speed", "Vibration", "Bearing temperature"],
    hidden: ["Pump head coefficient", "Pump efficiency", "Turbine efficiency", "Bearing and seal condition"],
    twin: "The reduced-order model lumps the rotating machinery into one shaft-speed state. Pump head coefficient, inferred from pressure rise, speed and flow, is the main turbomachinery health state.",
  },
  {
    id: "hot_gas",
    name: "Hot-Gas Generation",
    role: "Burns a small share of the propellants to make the gas that drives the turbine.",
    elements: ["Preburner or gas-generation device (generic)", "Turbine inlet", "Turbine outlet"],
    measured: ["Preburner pressure", "Turbine inlet pressure", "Turbine outlet pressure", "Turbine inlet temperature"],
    hidden: ["Turbine pressure ratio", "Turbine power", "Preburner mixture ratio"],
    twin: "Turbine power must balance pump power. A pressure ratio that no longer matches shaft speed is a turbine performance change.",
  },
  {
    id: "cooling",
    name: "Regenerative Cooling",
    role: "Routes fuel through channels in the chamber and nozzle wall before it is burned, carrying heat away from the wall.",
    elements: ["Cooling inlet", "Cooling channels", "Cooling outlet", "Pressure drop", "Thermal state"],
    measured: ["Cooling inlet and outlet pressure", "Coolant outlet temperature"],
    hidden: ["Cooling loss coefficient", "Heat picked up by the coolant", "Wall temperature"],
    twin: "Wall temperature cannot be measured where it matters most. The twin infers the wall's margin from cooling pressure drop, coolant temperature rise and chamber pressure together.",
  },
  {
    id: "injector",
    name: "Injector",
    role: "Meters, atomises and mixes the propellants as they enter the chamber, and isolates the feed system from chamber pressure oscillation.",
    elements: ["Oxidiser manifold", "Fuel manifold", "Injector pressure differential"],
    measured: ["Manifold pressure, each side"],
    hidden: ["Injector loss coefficient, each side", "Mixture ratio at the face"],
    twin: "Injector pressure drop over flow squared is a constant of the hardware. The twin tracks it as a health state and uses it to compute chamber pressure without a chamber sensor.",
  },
  {
    id: "chamber",
    name: "Combustion Chamber",
    role: "Burns the propellants at high pressure, turning chemical energy into hot, high-pressure gas.",
    elements: ["Chamber pressure", "Transient pressure", "Pressure stability (concept)", "Mixture behaviour", "Thermal behaviour"],
    measured: ["Chamber pressure, two sensors", "High-frequency pressure, where fitted"],
    hidden: ["Combustion efficiency", "Mixture ratio", "Gas temperature"],
    twin: "The estimated chamber pressure is the centre of the twin: fused from two sensors and a model-based virtual sensor, and compared with what the measured flows should produce.",
  },
  {
    id: "nozzle",
    name: "Nozzle",
    role: "Accelerates the gas through a throat to supersonic speed, converting pressure into exhaust momentum.",
    elements: ["Throat", "Expansion region", "Exit", "Pressure converted into exhaust momentum"],
    measured: ["Thrust proxy (mount strain)", "Wall pressure, on some test articles"],
    hidden: ["Throat area", "Thrust coefficient", "Exit pressure"],
    twin: "The throat is choked, so chamber pressure and mass flow are tied together there. The thrust proxy is an independent check on chamber pressure.",
  },
  {
    id: "controls",
    name: "Controls",
    role: "Sequences start and shutdown, holds the commanded operating point and stops the engine safely when a limit is confirmed.",
    elements: ["Valves", "Actuators", "Controller", "Safety interlocks", "Shutdown logic"],
    measured: ["Valve command and position", "Actuator current or pressure", "Controller state"],
    hidden: ["Actuator friction and response", "Loop margins"],
    twin: "Commands are the model's inputs. A valve that does not reach its commanded position is both a fault to detect and an error in what the model is told.",
  },
  {
    id: "instrumentation",
    name: "Instrumentation",
    role: "Turns physical behaviour into data, for control, for protection and for understanding the engine's condition.",
    elements: ["Pressure", "Temperature", "Flow", "Speed", "Vibration", "Valve position", "Strain", "Acoustic measurements, where applicable"],
    measured: ["Every channel, plus each channel's own health"],
    hidden: ["Sensor bias and drift", "Clock offset between acquisition nodes"],
    twin: "Sensors are part of the system and fail like any other part. The twin models each sensor's noise, checks its plausibility, and can tell a sensor fault from an engine fault.",
  },
];

export const SUBSYSTEM_BY_ID = Object.fromEntries(SUBSYSTEMS.map((s) => [s.id, s])) as Record<SubsystemId, Subsystem>;

/** Operating modes of the reference engine, and what the twin does differently in each. */
export const OPERATING_MODES: readonly { id: string; name: string; text: string; twin: string }[] = [
  { id: "ready", name: "Ready", text: "Systems checked, lines conditioned, valves closed.", twin: "Sensors are checked against their at-rest values. Health checks that need flow are held." },
  { id: "start", name: "Start", text: "Valves open in sequence, the turbopump spins up, the chamber ignites and pressure rises.", twin: "The model follows the sequence. Limits are those of the start transient, and uncertainty is widened." },
  { id: "mainstage", name: "Mainstage", text: "Steady operation at the commanded thrust and mixture ratio.", twin: "The twin is synchronised and residuals are at their tightest. This is where slow degradation is found." },
  { id: "throttle", name: "Throttle", text: "The command changes and the engine moves to a new operating point.", twin: "Expected values move with the command. Residual thresholds are widened for as long as the model is in a transient." },
  { id: "shutdown", name: "Shutdown", text: "Valves close in sequence, the pumps spin down and the lines are purged.", twin: "Monitoring returns to sequence checks: did each valve close, did pressure decay as it should." },
];

export const DESKTOP_3D = {
  heading: "Advanced 3D Engineering Mode",
  intro: "On a laptop or desktop the same reference engine opens in 3D, with every pressure sensor placed on it. Select a sensor to follow its signal from the transducer to a statement about health.",
  enter: "Enter 3D Engineering Mode",
  views: ["Assembled", "Exploded assemblies", "Cutaway"],
  overlays: ["Pressure sensors", "Pressure pathways", "Signal pathways", "Fault highlights"],
  fallback: "The schematic below shows the same system and the same sensors.",
} as const;
