// The component catalogue. Each entry maps a semantic id to what it is, which
// system it belongs to, the model nodes that draw it and where its health comes
// from. Business logic refers to these ids only, so the procedural aircraft can
// be replaced by an authored model by changing `meshNames` alone.
import type { ComponentId, ModuleNo, PropulsionPart, PropulsionUnitId, SystemId, UnitNo, XrayFilter } from "../types";
import { MODULE_NUMBERS, PROPULSION_PARTS, UNIT_MOUNTS, type UnitMount } from "../aircraft/layout";

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  /** Short description of what kind of thing it is. */
  type: string;
  system: SystemId;
  /** Kind of component, independent of the model that draws it. */
  semanticType: string;
  /** The assembly this part belongs to, if any. */
  parent?: ComponentId;
  /** Node names in the aircraft model hierarchy. */
  meshNames: readonly string[];
  /** Key into the twin state's component health; null for parts that carry no health state of their own. */
  healthSource: ComponentId | null;
  /** One sentence for the executive view. */
  purpose: string;
  /** Engineering role. */
  role: string;
  /** What health monitoring observes here. */
  monitors: readonly string[];
  /** Outer skin: faded by X-ray. */
  shell: boolean;
  /** X-ray filters that keep this part at full strength. */
  xray: readonly XrayFilter[];
}

type Entry = Omit<ComponentDefinition, "id" | "shell" | "xray" | "healthSource" | "semanticType" | "monitors"> &
  Partial<Pick<ComponentDefinition, "shell" | "xray" | "healthSource" | "semanticType" | "monitors">>;

const SYSTEM_XRAY: Record<SystemId, readonly XrayFilter[]> = {
  propulsion: ["propulsion"],
  energy: ["power"],
  avionics: ["avionics", "data"],
  flightControl: ["flightControl"],
  navigation: ["avionics", "data"],
  structures: ["structure"],
  thermal: ["thermal"],
  communications: ["avionics", "data"],
  hums: ["health", "data"],
};

const FIXED: Partial<Record<ComponentId, Entry>> = {
  // ── Structures ──
  "fuselage-shell": {
    name: "Fuselage Shell",
    type: "Composite fuselage",
    system: "structures",
    meshNames: ["NoseStructure", "CabinShell", "RearFuselage"],
    purpose: "The composite body that encloses the cabin and the equipment bays.",
    role: "Monocoque composite shell: nose structure, cabin shell and rear fuselage, carried on ring frames and a keel.",
    shell: true,
    healthSource: null,
  },
  glazing: {
    name: "Panoramic Glazing",
    type: "Windscreen and cabin windows",
    system: "structures",
    meshNames: ["Windows"],
    purpose: "Wrap-around windscreen and cabin windows.",
    role: "Dark neutral glazing: one-piece windscreen and three cabin panes per side.",
    shell: true,
    healthSource: null,
  },
  "door-left": {
    name: "Cabin Door, Port",
    type: "Cabin door",
    system: "structures",
    meshNames: ["Doors/DoorLeft"],
    purpose: "Wide cabin door serving the first two seat rows.",
    role: "Door within the forward and wing frames; also the emergency exit for the port side.",
    shell: true,
    healthSource: null,
  },
  "door-right": {
    name: "Cabin Door, Starboard",
    type: "Cabin door",
    system: "structures",
    meshNames: ["Doors/DoorRight"],
    purpose: "Wide cabin door serving the first two seat rows.",
    role: "Door within the forward and wing frames; also the emergency exit for the starboard side.",
    shell: true,
    healthSource: null,
  },
  "fuselage-frames": {
    name: "Fuselage Frames",
    type: "Primary fuselage structure",
    system: "structures",
    meshNames: ["Fuselage/Frames", "Fuselage/Keel"],
    purpose: "Ring frames and keel that carry wing, landing-gear and cabin loads.",
    role: "Six ring frames on a keel beam. The two wing frames carry the spar loads; the keel frames take the landing gear.",
    monitors: ["Frame strain", "Airframe vibration"],
  },
  "floor-structure": {
    name: "Structural Floor",
    type: "Cabin floor and seat rails",
    system: "structures",
    meshNames: ["FloorStructure"],
    purpose: "The cabin floor, which also separates the occupants from the battery below.",
    role: "Sandwich floor with seat rails. Forms the upper barrier of the battery bay.",
  },
  "wing-skin-left": {
    name: "Wing Skin, Port",
    type: "Wing skin and pylons",
    system: "structures",
    meshNames: ["LeftWing/LeftWingSkin"],
    purpose: "Aerodynamic surface of the port wing.",
    role: "Composite skins over the wing box, with the propulsion pylons.",
    shell: true,
    healthSource: null,
  },
  "wing-skin-right": {
    name: "Wing Skin, Starboard",
    type: "Wing skin and pylons",
    system: "structures",
    meshNames: ["RightWing/RightWingSkin"],
    purpose: "Aerodynamic surface of the starboard wing.",
    role: "Composite skins over the wing box, with the propulsion pylons.",
    shell: true,
    healthSource: null,
  },
  "wing-structure-left": {
    name: "Wing Structure, Port",
    type: "Main spar, rear spar and ribs",
    system: "structures",
    meshNames: ["LeftWing/LeftMainSpar", "LeftWing/LeftRearSpar"],
    purpose: "The spars and ribs that carry wing and propulsion loads to the fuselage.",
    role: "Main spar at 30% chord and rear spar at 68% chord, with ribs at each propulsion and boom station.",
    monitors: ["Spar root strain", "Rotor-mount strain", "Wing vibration"],
  },
  "wing-structure-right": {
    name: "Wing Structure, Starboard",
    type: "Main spar, rear spar and ribs",
    system: "structures",
    meshNames: ["RightWing/RightMainSpar", "RightWing/RightRearSpar"],
    purpose: "The spars and ribs that carry wing and propulsion loads to the fuselage.",
    role: "Main spar at 30% chord and rear spar at 68% chord, with ribs at each propulsion and boom station.",
    monitors: ["Spar root strain", "Rotor-mount strain", "Wing vibration"],
  },
  "boom-left": {
    name: "Boom, Port",
    type: "Lift-unit and tail boom",
    system: "structures",
    meshNames: ["Booms/BoomLeft"],
    purpose: "Carries two lift units and the port fin.",
    role: "Composite boom under the wing box, carrying lift-unit and tail loads.",
    shell: true,
    monitors: ["Boom attachment strain"],
  },
  "boom-right": {
    name: "Boom, Starboard",
    type: "Lift-unit and tail boom",
    system: "structures",
    meshNames: ["Booms/BoomRight"],
    purpose: "Carries two lift units and the starboard fin.",
    role: "Composite boom under the wing box, carrying lift-unit and tail loads.",
    shell: true,
    monitors: ["Boom attachment strain"],
  },
  "horizontal-tail": {
    name: "Horizontal Tail",
    type: "Tailplane",
    system: "structures",
    meshNames: ["Tail/HorizontalTail"],
    purpose: "Pitch stability, set high between the two fins.",
    role: "Tailplane joining the fin tips, clear of the wing and rotor wake.",
    shell: true,
    healthSource: null,
  },
  "vertical-tail-left": {
    name: "Vertical Tail, Port",
    type: "Fin",
    system: "structures",
    meshNames: ["Tail/VerticalTailLeft"],
    purpose: "Directional stability.",
    role: "Port fin on the boom end, carrying one end of the tailplane.",
    shell: true,
    healthSource: null,
  },
  "vertical-tail-right": {
    name: "Vertical Tail, Starboard",
    type: "Fin",
    system: "structures",
    meshNames: ["Tail/VerticalTailRight"],
    purpose: "Directional stability.",
    role: "Starboard fin on the boom end, carrying one end of the tailplane.",
    shell: true,
    healthSource: null,
  },
  "nose-gear": {
    name: "Nose Gear",
    type: "Landing gear",
    system: "structures",
    meshNames: ["LandingGear/NoseGear"],
    purpose: "Forward landing gear.",
    role: "Fixed nose gear into the forward keel frame.",
    monitors: ["Gear load (strain)"],
  },
  "main-gear-left": {
    name: "Main Gear, Port",
    type: "Landing gear",
    system: "structures",
    meshNames: ["LandingGear/LeftMainGear"],
    purpose: "Port main landing gear.",
    role: "Fixed main gear into the rear keel frame.",
    monitors: ["Gear load (strain)"],
  },
  "main-gear-right": {
    name: "Main Gear, Starboard",
    type: "Landing gear",
    system: "structures",
    meshNames: ["LandingGear/RightMainGear"],
    purpose: "Starboard main landing gear.",
    role: "Fixed main gear into the rear keel frame.",
    monitors: ["Gear load (strain)"],
  },
  "cabin-seats": {
    name: "Cabin Seats",
    type: "1 pilot + 5 passengers",
    system: "structures",
    semanticType: "cabin",
    meshNames: ["Cabin/Seats"],
    purpose: "Six seats in three rows: the pilot and five passengers.",
    role: "Lightweight seats on floor rails. Future architecture: the pilot seat becomes a sixth passenger seat.",
    healthSource: null,
  },
  "cabin-interior": {
    name: "Flight Deck",
    type: "Instrument panel and cabin fittings",
    system: "structures",
    semanticType: "cabin",
    meshNames: ["Cabin/Interior"],
    purpose: "The pilot's station and cabin fittings.",
    role: "Instrument panel, glareshield and the rear cabin bulkhead.",
    healthSource: null,
  },

  // ── Energy ──
  "battery-pack-left": {
    name: "Battery Pack, Port",
    type: "Battery enclosure",
    system: "energy",
    meshNames: ["Energy/BatteryPackLeft"],
    purpose: "Stores energy under the cabin floor, isolated from the occupants.",
    role: "Structural enclosure for modules 01–04, with vent path and cold plate below.",
    monitors: ["Pack voltage and current", "Insulation resistance", "Enclosure temperature"],
  },
  "battery-pack-right": {
    name: "Battery Pack, Starboard",
    type: "Battery enclosure",
    system: "energy",
    meshNames: ["Energy/BatteryPackRight"],
    purpose: "Stores energy under the cabin floor, isolated from the occupants.",
    role: "Structural enclosure for modules 05–08, with vent path and cold plate below.",
    monitors: ["Pack voltage and current", "Insulation resistance", "Enclosure temperature"],
  },
  "bms-primary": {
    name: "BMS Primary",
    type: "Battery management",
    system: "energy",
    meshNames: ["Energy/BMSPrimary"],
    purpose: "Measures and protects the battery.",
    role: "Primary battery management: cell-group voltages, temperatures, state estimation and contactor control.",
    monitors: ["Cell-group voltage", "Module temperature", "State of charge, state of health"],
  },
  "bms-secondary": {
    name: "BMS Secondary",
    type: "Battery management",
    system: "energy",
    meshNames: ["Energy/BMSSecondary"],
    purpose: "Independent second battery monitor.",
    role: "Secondary battery management, cross-checking the primary.",
    monitors: ["Cell-group voltage", "Module temperature"],
  },
  "hv-contactors": {
    name: "HV Contactor Assembly",
    type: "High-voltage switching",
    system: "energy",
    meshNames: ["Energy/HVContactorAssembly"],
    purpose: "Connects or isolates the battery from the high-voltage bus.",
    role: "Main contactors, pre-charge and protection; the single point where both packs meet the HV DC bus.",
    monitors: ["Pack current", "Contactor state", "Insulation monitoring"],
  },
  "hvdc-bus": {
    name: "HV DC Bus",
    type: "High-voltage distribution",
    system: "energy",
    meshNames: ["Energy/HVDCBus"],
    purpose: "Carries battery power to every propulsion unit.",
    role: "HV distribution up the wing frame, along the main spar to the tilt units and along the booms to the lift units.",
    monitors: ["Bus voltage", "Voltage ripple"],
  },
  "lvdc-bus": {
    name: "LV DC Bus",
    type: "Low-voltage distribution",
    system: "energy",
    meshNames: ["Energy/LVDCBus"],
    purpose: "Feeds avionics, flight controls and health computing.",
    role: "Low-voltage distribution from the DC/DC converter to both equipment bays.",
    monitors: ["Bus voltage", "Load current"],
  },
  "dcdc-converter": {
    name: "DC/DC Converter",
    type: "Power conversion",
    system: "energy",
    meshNames: ["Energy/DCDCConverter"],
    purpose: "Steps high voltage down for the electronics.",
    role: "Isolated HV-to-LV conversion for the LV DC bus.",
    monitors: ["Output voltage", "Converter temperature"],
  },
  "charging-interface": {
    name: "Charging Interface",
    type: "Ground charging port",
    system: "energy",
    meshNames: ["Energy/ChargingInterface"],
    purpose: "Where the aircraft is charged at the vertiport.",
    role: "Ground charging port with coolant connection, on the port rear fuselage.",
    monitors: ["Charge current", "Connector temperature"],
  },

  // ── Flight controls ──
  "fcc-a": {
    name: "Flight Computer A",
    type: "Flight-compute channel",
    system: "flightControl",
    meshNames: ["FlightControls/FlightComputerA"],
    purpose: "One of three flight-compute channels, in the forward bay.",
    role: "FCC-A. Receives every critical input; its command is compared with channels B and C.",
    monitors: ["Channel agreement", "Processor state", "Supply voltage"],
    xray: ["flightControl", "data"],
  },
  "fcc-b": {
    name: "Flight Computer B",
    type: "Flight-compute channel",
    system: "flightControl",
    meshNames: ["FlightControls/FlightComputerB"],
    purpose: "One of three flight-compute channels, in the rear bay.",
    role: "FCC-B. Receives every critical input; its command is compared with channels A and C.",
    monitors: ["Channel agreement", "Processor state", "Supply voltage"],
    xray: ["flightControl", "data"],
  },
  "fcc-c": {
    name: "Flight Computer C",
    type: "Flight-compute channel",
    system: "flightControl",
    meshNames: ["FlightControls/FlightComputerC"],
    purpose: "One of three flight-compute channels, in the rear bay.",
    role: "FCC-C. Receives every critical input; its command is compared with channels A and B.",
    monitors: ["Channel agreement", "Processor state", "Supply voltage"],
    xray: ["flightControl", "data"],
  },
  "actuator-controllers": {
    name: "Actuator Controllers",
    type: "Actuator control electronics",
    system: "flightControl",
    meshNames: ["FlightControls/ActuatorControllers"],
    purpose: "Drive the control-surface actuators.",
    role: "Actuator control electronics: close position loops for the wing and tail actuators.",
    monitors: ["Actuator current", "Position error"],
  },
  "wing-actuators": {
    name: "Wing Actuators",
    type: "Electromechanical actuators",
    system: "flightControl",
    meshNames: ["FlightControls/WingActuators"],
    purpose: "Move the flaperons.",
    role: "Two electromechanical actuators per flaperon.",
    monitors: ["Position against command", "Motor current", "Actuator temperature"],
  },
  "tail-actuators": {
    name: "Tail Actuators",
    type: "Electromechanical actuators",
    system: "flightControl",
    meshNames: ["Tail/TailActuators", "FlightControls/TailActuators"],
    purpose: "Move the elevator and rudders.",
    role: "Electromechanical actuators for the elevator and each rudder.",
    monitors: ["Position against command", "Motor current", "Actuator temperature"],
  },
  "flaperon-left": {
    name: "Flaperon, Port",
    type: "Control surface",
    system: "flightControl",
    meshNames: ["LeftWing/LeftControlSurface"],
    purpose: "Roll control and high lift on the port wing.",
    role: "Trailing-edge surface outboard of the boom, on the rear spar.",
    shell: true,
    monitors: ["Surface position"],
  },
  "flaperon-right": {
    name: "Flaperon, Starboard",
    type: "Control surface",
    system: "flightControl",
    meshNames: ["RightWing/RightControlSurface"],
    purpose: "Roll control and high lift on the starboard wing.",
    role: "Trailing-edge surface outboard of the boom, on the rear spar.",
    shell: true,
    monitors: ["Surface position"],
  },
  elevator: {
    name: "Elevator",
    type: "Control surface",
    system: "flightControl",
    meshNames: ["Tail/Elevator"],
    purpose: "Pitch control in wing-borne flight.",
    role: "Trailing-edge surface of the horizontal tail.",
    shell: true,
    monitors: ["Surface position"],
  },
  "rudder-left": {
    name: "Rudder, Port",
    type: "Control surface",
    system: "flightControl",
    meshNames: ["Tail/RudderLeft"],
    purpose: "Yaw control.",
    role: "Trailing-edge surface of the port fin.",
    shell: true,
    monitors: ["Surface position"],
  },
  "rudder-right": {
    name: "Rudder, Starboard",
    type: "Control surface",
    system: "flightControl",
    meshNames: ["Tail/RudderRight"],
    purpose: "Yaw control.",
    role: "Trailing-edge surface of the starboard fin.",
    shell: true,
    monitors: ["Surface position"],
  },
  "pilot-controls": {
    name: "Pilot Controls",
    type: "Inceptors",
    system: "flightControl",
    meshNames: ["FlightControls/PilotControls"],
    purpose: "The pilot's hand controls.",
    role: "Side inceptors; their signals go to all three flight-compute channels.",
    monitors: ["Inceptor position sensors"],
  },

  // ── Navigation ──
  gnss: {
    name: "GNSS",
    type: "Satellite navigation receiver",
    system: "navigation",
    meshNames: ["Navigation/GNSS"],
    purpose: "Position from satellite navigation.",
    role: "GNSS antenna and receiver on the fuselage crown.",
    monitors: ["Signal availability", "Position quality"],
  },
  "imu-a": {
    name: "IMU-A",
    type: "Inertial measurement unit",
    system: "navigation",
    meshNames: ["Navigation/IMU_A"],
    purpose: "Measures the aircraft's motion.",
    role: "Inertial unit A, forward bay.",
    monitors: ["Agreement with IMU-B", "Sensor temperature"],
  },
  "imu-b": {
    name: "IMU-B",
    type: "Inertial measurement unit",
    system: "navigation",
    meshNames: ["Navigation/IMU_B"],
    purpose: "Second, independent motion measurement.",
    role: "Inertial unit B, rear bay.",
    monitors: ["Agreement with IMU-A", "Sensor temperature"],
  },
  magnetometer: {
    name: "Magnetometer",
    type: "Heading reference",
    system: "navigation",
    meshNames: ["Navigation/Magnetometer"],
    purpose: "Heading reference.",
    role: "Magnetometer in the tail cone, away from high-current wiring.",
    monitors: ["Heading agreement"],
  },
  "radar-altimeter": {
    name: "Radar Altimeter",
    type: "Height above ground",
    system: "navigation",
    meshNames: ["Navigation/RadarAltimeter"],
    purpose: "Height above the ground for takeoff and landing.",
    role: "Radar altimeter on the belly.",
    monitors: ["Height validity"],
  },
  "air-data": {
    name: "Air Data",
    type: "Air data probes",
    system: "navigation",
    meshNames: ["Navigation/AirData"],
    purpose: "Airspeed and pressure altitude.",
    role: "Two air-data probes either side of the nose.",
    monitors: ["Probe agreement", "Probe heating"],
  },
  "vision-sensors": {
    name: "Vision / Perception Sensors",
    type: "Cameras",
    system: "navigation",
    meshNames: ["Navigation/VisionSensors"],
    purpose: "See the landing area and surroundings.",
    role: "Forward and downward cameras in the nose.",
    monitors: ["Image validity"],
  },
  "nav-processor": {
    name: "Navigation Processor",
    type: "Sensor fusion",
    system: "navigation",
    meshNames: ["Navigation/NavigationProcessor"],
    purpose: "Combines all navigation sources into one position solution.",
    role: "Fuses GNSS, inertial, air data, radar altimeter, magnetometer and vision.",
    monitors: ["Source residuals", "Position uncertainty"],
  },

  // ── Communications ──
  "ground-link": {
    name: "Ground Link",
    type: "Operational data link",
    system: "communications",
    meshNames: ["Communications/GroundLink"],
    purpose: "Operational data link to the ground.",
    role: "Radio for operational data.",
    monitors: ["Link state"],
  },
  "maintenance-link": {
    name: "Maintenance Link",
    type: "Maintenance data link",
    system: "communications",
    meshNames: ["Communications/MaintenanceLink"],
    purpose: "Sends health and maintenance data to the ground.",
    role: "Radio for health and maintenance data, used in flight and on the pad.",
    monitors: ["Link state", "Data backlog"],
    xray: ["avionics", "data", "health"],
  },
  antennas: {
    name: "Antennas",
    type: "Communication antennas",
    system: "communications",
    meshNames: ["Communications/Antennas"],
    purpose: "Antennas for the data links.",
    role: "Blade antennas on the fuselage crown.",
    healthSource: null,
  },
  "secure-gateway": {
    name: "Secure Gateway",
    type: "Network boundary",
    system: "communications",
    meshNames: ["Communications/SecureGateway"],
    purpose: "Protects aircraft networks from external links.",
    role: "Boundary between the aircraft data network and the external links.",
    monitors: ["Gateway state"],
  },

  // ── Avionics ──
  "network-switch-a": {
    name: "Network Switch A",
    type: "Aircraft data network",
    system: "avionics",
    meshNames: ["Avionics/NetworkSwitchA"],
    purpose: "One of two independent data networks.",
    role: "Aircraft data network, side A.",
    monitors: ["Link state", "Switch temperature"],
  },
  "network-switch-b": {
    name: "Network Switch B",
    type: "Aircraft data network",
    system: "avionics",
    meshNames: ["Avionics/NetworkSwitchB"],
    purpose: "One of two independent data networks.",
    role: "Aircraft data network, side B.",
    monitors: ["Link state", "Switch temperature"],
  },
  "flight-displays": {
    name: "Flight Displays",
    type: "Pilot displays",
    system: "avionics",
    meshNames: ["Avionics/FlightDisplays"],
    purpose: "Show flight and system information to the pilot.",
    role: "Two wide displays on the instrument panel.",
    monitors: ["Display state"],
  },
  "avionics-rack": {
    name: "Equipment Bay",
    type: "Avionics rack",
    system: "avionics",
    meshNames: ["Fuselage/EquipmentBay"],
    purpose: "Holds the electronics behind the cabin.",
    role: "Equipment rack in the rear fuselage with its cooling plate.",
    healthSource: null,
  },
  "data-harness": {
    name: "Data Harness",
    type: "Network wiring",
    system: "avionics",
    meshNames: ["Avionics/DataHarness"],
    purpose: "The wiring that joins the two equipment bays.",
    role: "Network harness along the keel between the forward and rear bays.",
    healthSource: null,
  },

  // ── Thermal ──
  "battery-cooling": {
    name: "Battery Cooling",
    type: "Cold plates",
    system: "thermal",
    meshNames: ["Thermal/BatteryCooling"],
    purpose: "Keeps the battery modules at an even temperature.",
    role: "Cold plates under both packs.",
    monitors: ["Coolant inlet and outlet temperature", "Module temperature spread"],
    xray: ["thermal", "power"],
  },
  "avionics-cooling": {
    name: "Avionics Cooling",
    type: "Cold plate",
    system: "thermal",
    meshNames: ["Thermal/AvionicsCooling"],
    purpose: "Removes heat from the equipment bay.",
    role: "Cold plate under the equipment rack.",
    monitors: ["Plate temperature"],
  },
  "heat-exchanger": {
    name: "Heat Exchanger",
    type: "Ram-air heat exchanger",
    system: "thermal",
    meshNames: ["Thermal/HeatExchanger"],
    purpose: "Rejects heat to the outside air.",
    role: "Belly heat exchanger with a ram-air inlet and a fan for hover and ground operation.",
    monitors: ["Coolant temperature drop", "Fan state"],
  },
  "coolant-pumps": {
    name: "Coolant Pumps",
    type: "Pumps",
    system: "thermal",
    meshNames: ["Thermal/Pumps"],
    purpose: "Circulate the coolant.",
    role: "Two pumps.",
    monitors: ["Coolant pressure", "Pump current"],
  },
  "cooling-manifold": {
    name: "Cooling Manifold",
    type: "Flow distribution",
    system: "thermal",
    meshNames: ["Thermal/CoolingManifold"],
    purpose: "Shares coolant between the branches.",
    role: "Manifold balancing the battery and avionics branches.",
    monitors: ["Branch flow", "Coolant pressure"],
  },

  // ── HUMS ──
  "hums-computer": {
    name: "Health Computer",
    type: "Health reasoning",
    system: "hums",
    meshNames: ["HUMS/HealthComputer"],
    purpose: "Decides what the signals mean for the health of the aircraft.",
    role: "Fault detection, isolation and classification; health states; prognostics.",
    monitors: ["Model residuals", "Data completeness"],
  },
  "edge-processor": {
    name: "Edge Processor",
    type: "Edge analytics",
    system: "hums",
    meshNames: ["HUMS/EdgeProcessor"],
    purpose: "Turns raw signals into features on board.",
    role: "Feature extraction, FFT, order analysis, sensor fusion and anomaly detection.",
    monitors: ["Processing load"],
  },
  "acquisition-node-wing-left": {
    name: "Acquisition Node, Port Wing",
    type: "Remote acquisition",
    system: "hums",
    meshNames: ["HUMS/AcquisitionNodes/WingLeft"],
    purpose: "Collects sensor signals from the port wing.",
    role: "Signal conditioning, sampling and timestamping for the port wing and its propulsion units.",
    monitors: ["Node state", "Sensor validity"],
  },
  "acquisition-node-wing-right": {
    name: "Acquisition Node, Starboard Wing",
    type: "Remote acquisition",
    system: "hums",
    meshNames: ["HUMS/AcquisitionNodes/WingRight"],
    purpose: "Collects sensor signals from the starboard wing.",
    role: "Signal conditioning, sampling and timestamping for the starboard wing and its propulsion units.",
    monitors: ["Node state", "Sensor validity"],
  },
  "acquisition-node-fuselage": {
    name: "Acquisition Node, Fuselage",
    type: "Remote acquisition",
    system: "hums",
    meshNames: ["HUMS/AcquisitionNodes/Fuselage"],
    purpose: "Collects sensor signals from the fuselage and battery bay.",
    role: "Signal conditioning, sampling and timestamping for fuselage, battery and landing-gear sensors.",
    monitors: ["Node state", "Sensor validity"],
  },
  "acquisition-node-tail": {
    name: "Acquisition Node, Tail",
    type: "Remote acquisition",
    system: "hums",
    meshNames: ["HUMS/AcquisitionNodes/Tail"],
    purpose: "Collects sensor signals from the booms and tail.",
    role: "Signal conditioning, sampling and timestamping for the booms, aft lift units and tail.",
    monitors: ["Node state", "Sensor validity"],
  },
  "sensor-gateway": {
    name: "Sensor Gateway",
    type: "Health network gateway",
    system: "hums",
    meshNames: ["HUMS/SensorGateways"],
    purpose: "Brings sensor data onto the health network.",
    role: "Gateway from the acquisition nodes to the health network.",
    monitors: ["Gateway state"],
  },
  "maintenance-gateway": {
    name: "Maintenance Gateway",
    type: "Maintenance data gateway",
    system: "hums",
    meshNames: ["HUMS/MaintenanceGateway"],
    purpose: "Hands health results to the maintenance link.",
    role: "Packages health states, diagnoses and predictions for the ground health platform.",
    monitors: ["Gateway state", "Data backlog"],
  },
};

// ── Propulsion: eight units, each with the same sub-assemblies ──

const PART_INFO: Record<PropulsionPart, { name: string; node: string; type: string; purpose: string; role: string; monitors: readonly string[]; xray?: readonly XrayFilter[]; health?: boolean; shell?: boolean }> = {
  nacelle: {
    name: "Nacelle",
    node: "Nacelle",
    type: "Housing",
    purpose: "The aerodynamic housing of the unit.",
    role: "Composite nacelle and its mounting structure.",
    monitors: [],
    health: false,
    shell: true,
  },
  rotor: {
    name: "Rotor",
    node: "Rotor",
    type: "Blades and hub",
    purpose: "Turns motor torque into thrust.",
    role: "Composite blades on a hub. Imbalance and blade tracking show up as vibration at shaft speed.",
    monitors: ["Rotor imbalance", "Blade tracking"],
  },
  shaft: {
    name: "Shaft",
    node: "Shaft",
    type: "Drive shaft",
    purpose: "Connects the motor to the rotor.",
    role: "Direct-drive shaft carried on the front and rear bearings.",
    monitors: ["Shaft vibration"],
  },
  "bearing-front": {
    name: "Front Bearing",
    node: "BearingFront",
    type: "Rolling-element bearing",
    purpose: "Supports the shaft at the rotor end.",
    role: "Front bearing: carries rotor thrust and radial load. Wear appears as a growing frequency feature in the vibration signal.",
    monitors: ["Bearing vibration", "Bearing temperature"],
  },
  "bearing-rear": {
    name: "Rear Bearing",
    node: "BearingRear",
    type: "Rolling-element bearing",
    purpose: "Supports the shaft at the motor end.",
    role: "Rear bearing: radial support behind the motor.",
    monitors: ["Bearing vibration", "Bearing temperature"],
  },
  motor: {
    name: "Electric Motor",
    node: "ElectricMotor",
    type: "Rotor, stator and windings",
    purpose: "Produces the torque.",
    role: "Permanent-magnet motor: rotor, stator and windings, cooled through the stator jacket.",
    monitors: ["Winding temperature", "Phase current", "Estimated torque"],
  },
  resolver: {
    name: "Resolver",
    node: "ResolverOrPositionSensor",
    type: "Rotor position sensor",
    purpose: "Tells the controller where the rotor is and how fast it turns.",
    role: "Resolver on the rear of the shaft: rotor position and speed feedback.",
    monitors: ["Speed", "Position"],
    xray: ["propulsion", "health"],
  },
  inverter: {
    name: "Inverter",
    node: "Inverter",
    type: "Power electronics",
    purpose: "Converts battery DC into the motor's three-phase AC.",
    role: "Inverter: HV DC bus in, three motor phases out.",
    monitors: ["DC voltage and ripple", "Phase imbalance", "Inverter temperature"],
    xray: ["propulsion", "power"],
  },
  "motor-controller": {
    name: "Motor Controller",
    node: "MotorController",
    type: "Propulsion control unit",
    purpose: "Follows the torque commanded by the flight computers.",
    role: "Propulsion control unit: closes the torque and speed loops and reports state to the flight computers.",
    monitors: ["Commanded torque against measured response", "Synchronization"],
    xray: ["propulsion", "flightControl"],
  },
  "tilt-actuator": {
    name: "Tilt Actuator",
    node: "TiltActuator",
    type: "Tilt drive and position sensor",
    purpose: "Rotates the unit between lift and cruise.",
    role: "Rotary tilt actuator at the pivot, with its tilt position sensor.",
    monitors: ["Tilt position against command", "Actuator current"],
    xray: ["propulsion", "flightControl"],
  },
  "cooling-interface": {
    name: "Cooling Interface",
    node: "CoolingInterface",
    type: "Stator jacket and heat exchanger",
    purpose: "Carries motor and inverter heat away.",
    role: "Stator cooling jacket, inverter cold plate and the unit's own heat exchanger.",
    monitors: ["Coolant temperature", "Cooling performance"],
    xray: ["propulsion", "thermal"],
  },
  sensors: {
    name: "Sensor Set",
    node: "Sensors",
    type: "Vibration, temperature and current sensors",
    purpose: "What the unit reports about its own health.",
    role: "Vibration sensors A and B, motor, bearing and inverter temperature sensors, current sensor.",
    monitors: ["Vibration", "Temperature", "Phase current"],
    xray: ["propulsion", "health"],
  },
};

function unitEntries(mount: UnitMount): [ComponentId, Entry][] {
  const tilt = mount.kind === "tilt";
  const node = `Propulsion/PropulsionUnit${mount.no}`;
  const out: [ComponentId, Entry][] = [
    [
      mount.id,
      {
        name: `Propulsion Unit ${mount.no}`,
        type: "Electric propulsion module",
        system: "propulsion",
        meshNames: [node],
        purpose: tilt ? "Provides lift in hover and thrust in cruise." : "Provides lift in hover and transition; stopped in cruise.",
        role: `${mount.label} unit. ${tilt ? "Tilts between lift and cruise." : "Fixed on the boom, rotor aligned with the boom in cruise."} Independent motor, inverter, controller, cooling and sensors.`,
        monitors: ["Vibration", "Temperatures", "Phase current and DC voltage", "Speed and torque response"],
      },
    ],
  ];
  for (const part of PROPULSION_PARTS) {
    if (part === "tilt-actuator" && !tilt) continue;
    const info = PART_INFO[part];
    out.push([
      `pu${mount.no}-${part}`,
      {
        name: `${info.name}, Unit ${mount.no}`,
        type: info.type,
        system: "propulsion",
        parent: mount.id,
        meshNames: [`${node}/${info.node}`],
        purpose: info.purpose,
        role: info.role,
        monitors: info.monitors,
        xray: info.xray,
        shell: info.shell,
        healthSource: info.health === false ? null : undefined,
      },
    ]);
  }
  return out;
}

function moduleEntry(no: ModuleNo): [ComponentId, Entry] {
  const port = Number(no) <= 4;
  return [
    `battery-module-${no}`,
    {
      name: `Battery Module ${no}`,
      type: "Module of cell groups",
      system: "energy",
      parent: port ? "battery-pack-left" : "battery-pack-right",
      meshNames: [`Energy/BatteryModuleGroups/Module${no}`],
      purpose: "One of eight battery modules.",
      role: `Module ${no} in the ${port ? "port" : "starboard"} pack: representative cell groups with voltage and temperature sensing.`,
      monitors: ["Cell-group voltage spread", "Module temperature", "Internal resistance estimate"],
    },
  ];
}

const GENERATED: [ComponentId, Entry][] = [...UNIT_MOUNTS.flatMap(unitEntries), ...MODULE_NUMBERS.map(moduleEntry)];

function build(): Record<ComponentId, ComponentDefinition> {
  const all = [...(Object.entries(FIXED) as [ComponentId, Entry][]), ...GENERATED];
  const out = {} as Record<ComponentId, ComponentDefinition>;
  for (const [id, entry] of all) {
    out[id] = {
      id,
      ...entry,
      semanticType: entry.semanticType ?? entry.system,
      healthSource: entry.healthSource === undefined ? id : entry.healthSource,
      monitors: entry.monitors ?? [],
      shell: entry.shell ?? false,
      xray: entry.xray ?? SYSTEM_XRAY[entry.system],
    };
  }
  return out;
}

export const COMPONENTS: Record<ComponentId, ComponentDefinition> = build();

export const COMPONENT_IDS = Object.keys(COMPONENTS) as ComponentId[];

export const isComponentId = (id: string): id is ComponentId => id in COMPONENTS;

export function getComponent(id: ComponentId): ComponentDefinition {
  return COMPONENTS[id];
}

/** Components of one system, in catalogue order. */
export const componentsOf = (system: SystemId): ComponentId[] => COMPONENT_IDS.filter((id) => COMPONENTS[id].system === system);

/** Direct children of an assembly. */
export const childrenOf = (parent: ComponentId): ComponentId[] => COMPONENT_IDS.filter((id) => COMPONENTS[id].parent === parent);

/** The assembly a part belongs to, or the part itself when it stands alone. */
export const assemblyOf = (id: ComponentId): ComponentId => COMPONENTS[id].parent ?? id;

export const OUTER_SHELL: readonly ComponentId[] = COMPONENT_IDS.filter((id) => COMPONENTS[id].shell);

/** Sub-assemblies of a propulsion unit that sit wholly inside its housing. */
const ENCLOSED_UNIT_PARTS: readonly PropulsionPart[] = ["shaft", "bearing-front", "bearing-rear", "motor", "resolver", "inverter", "motor-controller", "cooling-interface", "sensors"];

/**
 * Components wholly inside the airframe: under the floor, in the rear bay,
 * inside the wing or inside a propulsion unit. They cannot be seen while the
 * skin is opaque, so the model need not draw them then.
 */
export const ENCLOSED: ReadonlySet<ComponentId> = new Set<ComponentId>([
  ...UNIT_MOUNTS.flatMap((mount) => ENCLOSED_UNIT_PARTS.map((part): ComponentId => `pu${mount.no}-${part}`)),
  ...MODULE_NUMBERS.map((no): ComponentId => `battery-module-${no}`),
  "battery-pack-left",
  "battery-pack-right",
  "bms-primary",
  "bms-secondary",
  "hv-contactors",
  "hvdc-bus",
  "lvdc-bus",
  "dcdc-converter",
  "wing-structure-left",
  "wing-structure-right",
  "wing-actuators",
  "fcc-b",
  "fcc-c",
  "actuator-controllers",
  "imu-b",
  "nav-processor",
  "ground-link",
  "maintenance-link",
  "secure-gateway",
  "network-switch-a",
  "network-switch-b",
  "avionics-rack",
  "data-harness",
  "battery-cooling",
  "avionics-cooling",
  "coolant-pumps",
  "cooling-manifold",
  "hums-computer",
  "edge-processor",
  "acquisition-node-wing-left",
  "acquisition-node-wing-right",
  "acquisition-node-fuselage",
  "acquisition-node-tail",
  "sensor-gateway",
  "maintenance-gateway",
]);

export const PROPULSION_UNIT_IDS: readonly PropulsionUnitId[] = UNIT_MOUNTS.map((u) => u.id);

/** Unit number of a propulsion unit or one of its parts; null for anything else. */
export function unitNumberOf(id: ComponentId): UnitNo | null {
  const match = /^(?:propulsion-unit-|pu)(0[1-8])/.exec(id);
  return match ? (match[1] as UnitNo) : null;
}

/** Hierarchy path from the aircraft down to the component, for breadcrumbs. */
export function hierarchyOf(id: ComponentId): string[] {
  const component = COMPONENTS[id];
  const path = ["AIRCRAFT", component.system];
  if (component.parent) path.push(COMPONENTS[component.parent].name);
  path.push(component.name);
  return path;
}

/** Components whose model node list includes `meshName`. */
export function componentForMesh(meshName: string): ComponentId | null {
  return COMPONENT_IDS.find((id) => COMPONENTS[id].meshNames.some((name) => name === meshName || meshName.endsWith(`/${name}`) || name.endsWith(`/${meshName}`))) ?? null;
}
