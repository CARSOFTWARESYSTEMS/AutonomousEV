// The sensor catalogue: what is measured, where, and which acquisition node
// collects it. Positions are in aircraft coordinates; sensors on a propulsion
// unit are given in the unit's own frame because tilt units move.
import type { ComponentId, ModuleNo, SensorCategory, SensorKind, SystemId, UnitNo, Vec3 } from "../types";
import {
  BOOM,
  EQUIPMENT,
  FRAME_STATIONS,
  GEAR,
  MODULE_NUMBERS,
  TAIL,
  TILT_Z,
  UNIT_MOUNTS,
  UNIT_STATIONS,
  WING,
  moduleCentre,
  unitMount,
  unitPoint,
  wingPoint,
  wingY,
  type UnitMount,
} from "../aircraft/layout";

export type AcquisitionNodeId = "acquisition-node-wing-left" | "acquisition-node-wing-right" | "acquisition-node-fuselage" | "acquisition-node-tail";

export interface SensorDefinition {
  /** Tag as it would appear on a drawing, e.g. VIB-M04-A. */
  id: string;
  name: string;
  kind: SensorKind;
  category: SensorCategory;
  system: SystemId;
  /** The component it is mounted on. */
  component: ComponentId;
  /** Position in aircraft coordinates (for unit-mounted sensors, at the hover tilt). */
  position: Vec3;
  /** Set for sensors that move with a propulsion unit. */
  unit?: { no: UnitNo; local: Vec3 };
  node: AcquisitionNodeId;
  /** Key of the observation this sensor produces in the twin state. */
  signal: string;
  unitOfMeasure: string;
  /** What the feature extraction looks for in this signal. */
  feature: string;
  /** Flight-critical data is also delivered directly to the flight computers. */
  flightCritical: boolean;
}

const KIND_CATEGORY: Record<SensorKind, SensorCategory> = {
  vibration: "vibration",
  temperature: "thermal",
  pressure: "thermal",
  voltage: "electrical",
  current: "electrical",
  insulation: "electrical",
  strain: "structural",
  position: "position",
  rpm: "position",
  navigation: "navigation",
};

const FEATURE: Record<SensorKind, string> = {
  vibration: "RMS level, bearing-frequency amplitude and shaft-order amplitudes",
  temperature: "Level, rate of rise and spread against neighbours",
  pressure: "Level against pump speed",
  voltage: "Spread between groups and ripple",
  current: "Phase balance and level against commanded torque",
  insulation: "Resistance to airframe",
  strain: "Load cycles and peak level by flight phase",
  position: "Measured position against command",
  rpm: "Speed against command, used to normalise vibration by shaft order",
  navigation: "Agreement with the other navigation sources",
};

const UNIT_OF_MEASURE: Record<SensorKind, string> = {
  vibration: "g RMS",
  temperature: "°C",
  pressure: "kPa",
  voltage: "V",
  current: "A",
  insulation: "kΩ",
  strain: "µε",
  position: "°",
  rpm: "rpm",
  navigation: "—",
};

function nodeForUnit(mount: UnitMount): AcquisitionNodeId {
  if (mount.pivot[0] < -1) return "acquisition-node-tail";
  return mount.side < 0 ? "acquisition-node-wing-left" : "acquisition-node-wing-right";
}

interface Spec {
  id: string;
  name: string;
  kind: SensorKind;
  system: SystemId;
  component: ComponentId;
  position: Vec3;
  node: AcquisitionNodeId;
  signal: string;
  unit?: { no: UnitNo; local: Vec3 };
  flightCritical?: boolean;
}

const sensor = (s: Spec): SensorDefinition => ({
  ...s,
  category: KIND_CATEGORY[s.kind],
  unitOfMeasure: UNIT_OF_MEASURE[s.kind],
  feature: FEATURE[s.kind],
  flightCritical: s.flightCritical ?? false,
});

function unitSensors(mount: UnitMount): SensorDefinition[] {
  const s = UNIT_STATIONS[mount.kind];
  const no = mount.no;
  const node = nodeForUnit(mount);
  const key = `pu${no}`;
  const r = s.shellRadius - 0.09;
  const at = (id: string, name: string, kind: SensorKind, component: ComponentId, local: Vec3, signal: string, flightCritical = false): SensorDefinition =>
    sensor({ id, name, kind, system: "propulsion", component, position: unitPoint(mount, local), unit: { no, local }, node, signal: `${key}.${signal}`, flightCritical });

  const list = [
    at(`VIB-M${no}-A`, `Vibration Sensor A, Unit ${no}`, "vibration", `pu${no}-bearing-front`, [s.bearingFront, r, 0], "vibration"),
    at(`VIB-M${no}-B`, `Vibration Sensor B, Unit ${no}`, "vibration", `pu${no}-bearing-rear`, [s.bearingRear, r, 0], "vibrationB"),
    at(`TMP-M${no}-W`, `Winding Temperature, Unit ${no}`, "temperature", `pu${no}-motor`, [s.motor, s.motorRadius * 0.86, s.motorRadius * 0.5], "windingTemp"),
    at(`TMP-M${no}-B`, `Bearing Temperature, Unit ${no}`, "temperature", `pu${no}-bearing-front`, [s.bearingFront, 0.07, -0.07], "bearingTemp"),
    at(`TMP-I${no}`, `Inverter Temperature, Unit ${no}`, "temperature", `pu${no}-inverter`, [s.inverter[0], s.inverter[1] + s.inverterSize[1] / 2, s.inverter[2] + 0.06], "inverterTemp"),
    at(`CUR-M${no}`, `Phase Current, Unit ${no}`, "current", `pu${no}-inverter`, [(s.inverter[0] + s.bearingRear) / 2, (s.inverter[1] + 0.02) / 2, 0.07], "current", true),
    at(`RPM-M${no}`, `Speed Feedback, Unit ${no}`, "rpm", `pu${no}-resolver`, [s.resolver, 0.06, 0], "rpm", true),
  ];
  if (mount.kind === "tilt") {
    list.push(at(`POS-T${no}`, `Tilt Position, Unit ${no}`, "position", `pu${no}-tilt-actuator`, [0, 0, -mount.side * 0.2], "tilt", true));
  }
  return list;
}

function moduleSensors(no: ModuleNo): SensorDefinition[] {
  const c = moduleCentre(no);
  const component: ComponentId = `battery-module-${no}`;
  const key = `battery.m${no}`;
  return [
    sensor({ id: `VLT-B${no}`, name: `Cell-Group Voltage, Module ${no}`, kind: "voltage", system: "energy", component, position: [c[0] + 0.18, c[1] + 0.1, c[2]], node: "acquisition-node-fuselage", signal: `${key}.voltageSpread` }),
    sensor({ id: `TMP-B${no}`, name: `Module Temperature, Module ${no}`, kind: "temperature", system: "energy", component, position: [c[0] - 0.18, c[1] + 0.1, c[2]], node: "acquisition-node-fuselage", signal: `${key}.temp` }),
  ];
}

const wingStrain = (tag: string, name: string, z: number, fraction: number, component: ComponentId): SensorDefinition =>
  sensor({
    id: tag,
    name,
    kind: "strain",
    system: "structures",
    component,
    position: [wingPoint(z, fraction)[0], wingY(z) + 0.02, z],
    node: z < 0 ? "acquisition-node-wing-left" : "acquisition-node-wing-right",
    signal: Math.abs(z) < 1.5 ? "structures.wingRootStrain" : "structures.rotorMountStrain",
  });

const FIXED: SensorDefinition[] = [
  // Energy
  sensor({ id: "CUR-PK-L", name: "Pack Current, Port", kind: "current", system: "energy", component: "hv-contactors", position: [EQUIPMENT["hv-contactors"][0], 0.62, -0.14], node: "acquisition-node-fuselage", signal: "battery.packCurrent" }),
  sensor({ id: "CUR-PK-R", name: "Pack Current, Starboard", kind: "current", system: "energy", component: "hv-contactors", position: [EQUIPMENT["hv-contactors"][0], 0.62, 0.14], node: "acquisition-node-fuselage", signal: "battery.packCurrent" }),
  sensor({ id: "VLT-HV", name: "HV Bus Voltage", kind: "voltage", system: "energy", component: "hv-contactors", position: [EQUIPMENT["hv-contactors"][0] - 0.1, 0.7, 0], node: "acquisition-node-fuselage", signal: "battery.packVoltage" }),
  sensor({ id: "ISO-HV", name: "Insulation Monitor", kind: "insulation", system: "energy", component: "hv-contactors", position: [EQUIPMENT["hv-contactors"][0] + 0.1, 0.7, 0], node: "acquisition-node-fuselage", signal: "battery.insulation" }),

  // Structures: strain
  wingStrain("STR-WL-1", "Spar Root Strain, Port", -0.9, WING.mainSparFraction, "wing-structure-left"),
  wingStrain("STR-WL-2", "Rotor-Mount Strain, Port Inboard", -TILT_Z.inboard, WING.mainSparFraction, "wing-structure-left"),
  wingStrain("STR-WL-3", "Rotor-Mount Strain, Port Outboard", -6.6, WING.mainSparFraction, "wing-structure-left"),
  wingStrain("STR-WR-1", "Spar Root Strain, Starboard", 0.9, WING.mainSparFraction, "wing-structure-right"),
  wingStrain("STR-WR-2", "Rotor-Mount Strain, Starboard Inboard", TILT_Z.inboard, WING.mainSparFraction, "wing-structure-right"),
  wingStrain("STR-WR-3", "Rotor-Mount Strain, Starboard Outboard", 6.6, WING.mainSparFraction, "wing-structure-right"),
  sensor({ id: "STR-BL", name: "Boom Attachment Strain, Port", kind: "strain", system: "structures", component: "boom-left", position: [WING.sparX, BOOM.y + 0.1, -BOOM.z], node: "acquisition-node-wing-left", signal: "structures.boomStrain" }),
  sensor({ id: "STR-BR", name: "Boom Attachment Strain, Starboard", kind: "strain", system: "structures", component: "boom-right", position: [WING.sparX, BOOM.y + 0.1, BOOM.z], node: "acquisition-node-wing-right", signal: "structures.boomStrain" }),
  sensor({ id: "STR-F1", name: "Wing Frame Strain, Forward", kind: "strain", system: "structures", component: "fuselage-frames", position: [FRAME_STATIONS[2] + 0.04, 1.86, 0.6], node: "acquisition-node-fuselage", signal: "structures.wingRootStrain" }),
  sensor({ id: "STR-F2", name: "Wing Frame Strain, Rear", kind: "strain", system: "structures", component: "fuselage-frames", position: [FRAME_STATIONS[3] + 0.04, 1.86, -0.6], node: "acquisition-node-fuselage", signal: "structures.wingRootStrain" }),
  sensor({ id: "STR-NG", name: "Nose Gear Load", kind: "strain", system: "structures", component: "nose-gear", position: [GEAR.nose.mount[0], 0.44, 0.04], node: "acquisition-node-fuselage", signal: "structures.gearLoad" }),
  sensor({ id: "STR-ML", name: "Main Gear Load, Port", kind: "strain", system: "structures", component: "main-gear-left", position: [GEAR.main.mountX, 0.5, -GEAR.main.mountZ - 0.12], node: "acquisition-node-fuselage", signal: "structures.gearLoad" }),
  sensor({ id: "STR-MR", name: "Main Gear Load, Starboard", kind: "strain", system: "structures", component: "main-gear-right", position: [GEAR.main.mountX, 0.5, GEAR.main.mountZ + 0.12], node: "acquisition-node-fuselage", signal: "structures.gearLoad" }),

  // Structures: airframe vibration
  sensor({ id: "VIB-AF-1", name: "Airframe Vibration, Port Wing Tip", kind: "vibration", system: "structures", component: "wing-structure-left", position: [wingPoint(-6.3, 0.4)[0], wingY(-6.3) + 0.03, -6.3], node: "acquisition-node-wing-left", signal: "structures.airframeVibration" }),
  sensor({ id: "VIB-AF-2", name: "Airframe Vibration, Starboard Wing Tip", kind: "vibration", system: "structures", component: "wing-structure-right", position: [wingPoint(6.3, 0.4)[0], wingY(6.3) + 0.03, 6.3], node: "acquisition-node-wing-right", signal: "structures.airframeVibration" }),
  sensor({ id: "VIB-AF-3", name: "Airframe Vibration, Cabin Floor", kind: "vibration", system: "structures", component: "floor-structure", position: [0.5, 0.76, 0], node: "acquisition-node-fuselage", signal: "structures.airframeVibration" }),
  sensor({ id: "VIB-AF-4", name: "Airframe Vibration, Tail", kind: "vibration", system: "structures", component: "boom-right", position: [-5.2, BOOM.y + 0.12, BOOM.z], node: "acquisition-node-tail", signal: "structures.airframeVibration" }),

  // Thermal loop
  sensor({ id: "TMP-CL-IN", name: "Coolant Temperature, Exchanger Inlet", kind: "temperature", system: "thermal", component: "heat-exchanger", position: [EQUIPMENT["heat-exchanger"][0] + 0.26, 0.66, 0.12], node: "acquisition-node-fuselage", signal: "thermal.coolantIn" }),
  sensor({ id: "TMP-CL-OUT", name: "Coolant Temperature, Exchanger Outlet", kind: "temperature", system: "thermal", component: "heat-exchanger", position: [EQUIPMENT["heat-exchanger"][0] - 0.26, 0.66, -0.12], node: "acquisition-node-fuselage", signal: "thermal.coolantOut" }),
  sensor({ id: "PRS-CL-1", name: "Coolant Pressure, Pump Outlet", kind: "pressure", system: "thermal", component: "coolant-pumps", position: [EQUIPMENT["coolant-pumps"][0] + 0.14, 0.7, 0.24], node: "acquisition-node-fuselage", signal: "thermal.pressure" }),
  sensor({ id: "PRS-CL-2", name: "Coolant Pressure, Manifold", kind: "pressure", system: "thermal", component: "cooling-manifold", position: [EQUIPMENT["cooling-manifold"][0], 0.56, 0.3], node: "acquisition-node-fuselage", signal: "thermal.pressure" }),
  sensor({ id: "TMP-AV", name: "Equipment Bay Temperature", kind: "temperature", system: "thermal", component: "avionics-cooling", position: [EQUIPMENT["avionics-cooling"][0], 0.88, 0.2], node: "acquisition-node-fuselage", signal: "thermal.avionicsTemp" }),

  // Control-surface position
  sensor({ id: "POS-FL-L", name: "Flaperon Position, Port", kind: "position", system: "flightControl", component: "flaperon-left", position: [wingPoint(-3.6, WING.hingeFraction)[0], wingY(-3.6), -3.6], node: "acquisition-node-wing-left", signal: "surfaces.flaperonLeft", flightCritical: true }),
  sensor({ id: "POS-FL-R", name: "Flaperon Position, Starboard", kind: "position", system: "flightControl", component: "flaperon-right", position: [wingPoint(3.6, WING.hingeFraction)[0], wingY(3.6), 3.6], node: "acquisition-node-wing-right", signal: "surfaces.flaperonRight", flightCritical: true }),
  sensor({ id: "POS-EL", name: "Elevator Position", kind: "position", system: "flightControl", component: "elevator", position: [TAIL.horizontal.leX - TAIL.horizontal.chord * TAIL.elevator.hingeFraction, TAIL.horizontal.y, 0.4], node: "acquisition-node-tail", signal: "surfaces.elevator", flightCritical: true }),
  sensor({ id: "POS-RD-L", name: "Rudder Position, Port", kind: "position", system: "flightControl", component: "rudder-left", position: [-5.62, 2.7, -BOOM.z], node: "acquisition-node-tail", signal: "surfaces.rudder", flightCritical: true }),
  sensor({ id: "POS-RD-R", name: "Rudder Position, Starboard", kind: "position", system: "flightControl", component: "rudder-right", position: [-5.62, 2.7, BOOM.z], node: "acquisition-node-tail", signal: "surfaces.rudder", flightCritical: true }),

  // Navigation
  sensor({ id: "NAV-GNSS", name: "GNSS Receiver", kind: "navigation", system: "navigation", component: "gnss", position: EQUIPMENT.gnss, node: "acquisition-node-fuselage", signal: "nav.gnss", flightCritical: true }),
  sensor({ id: "NAV-IMU-A", name: "Inertial Unit A", kind: "navigation", system: "navigation", component: "imu-a", position: EQUIPMENT["imu-a"], node: "acquisition-node-fuselage", signal: "nav.imuA", flightCritical: true }),
  sensor({ id: "NAV-IMU-B", name: "Inertial Unit B", kind: "navigation", system: "navigation", component: "imu-b", position: EQUIPMENT["imu-b"], node: "acquisition-node-fuselage", signal: "nav.imuB", flightCritical: true }),
  sensor({ id: "NAV-MAG", name: "Magnetometer", kind: "navigation", system: "navigation", component: "magnetometer", position: EQUIPMENT.magnetometer, node: "acquisition-node-fuselage", signal: "nav.magnetometer", flightCritical: true }),
  sensor({ id: "NAV-RALT", name: "Radar Altimeter", kind: "navigation", system: "navigation", component: "radar-altimeter", position: EQUIPMENT["radar-altimeter"], node: "acquisition-node-fuselage", signal: "nav.radarAltimeter", flightCritical: true }),
  sensor({ id: "NAV-ADS-L", name: "Air Data Probe, Port", kind: "navigation", system: "navigation", component: "air-data", position: [EQUIPMENT["air-data"][0], EQUIPMENT["air-data"][1], -0.5], node: "acquisition-node-fuselage", signal: "nav.airData", flightCritical: true }),
  sensor({ id: "NAV-ADS-R", name: "Air Data Probe, Starboard", kind: "navigation", system: "navigation", component: "air-data", position: [EQUIPMENT["air-data"][0], EQUIPMENT["air-data"][1], 0.5], node: "acquisition-node-fuselage", signal: "nav.airData", flightCritical: true }),
  sensor({ id: "NAV-VIS-F", name: "Vision Sensor, Forward", kind: "navigation", system: "navigation", component: "vision-sensors", position: [EQUIPMENT["vision-sensors"][0] + 0.08, EQUIPMENT["vision-sensors"][1] + 0.06, 0], node: "acquisition-node-fuselage", signal: "nav.vision", flightCritical: true }),
  sensor({ id: "NAV-VIS-D", name: "Vision Sensor, Downward", kind: "navigation", system: "navigation", component: "vision-sensors", position: [EQUIPMENT["vision-sensors"][0] - 0.1, EQUIPMENT["vision-sensors"][1] - 0.2, 0], node: "acquisition-node-fuselage", signal: "nav.vision", flightCritical: true }),
];

export const SENSORS: readonly SensorDefinition[] = [...UNIT_MOUNTS.flatMap(unitSensors), ...MODULE_NUMBERS.flatMap(moduleSensors), ...FIXED];

const BY_ID = new Map(SENSORS.map((s) => [s.id, s]));

export const getSensor = (id: string): SensorDefinition | undefined => BY_ID.get(id);

export const sensorsOfCategory = (category: SensorCategory): SensorDefinition[] => SENSORS.filter((s) => s.category === category);

/** Sensors mounted on a component, or on any part of it when it is an assembly. */
export function sensorsOn(component: ComponentId): SensorDefinition[] {
  const unit = /^propulsion-unit-(0[1-8])$/.exec(component)?.[1];
  if (unit) return SENSORS.filter((s) => s.unit?.no === unit);
  if (component === "battery-pack-left") return SENSORS.filter((s) => /^battery-module-0[1-4]$/.test(s.component));
  if (component === "battery-pack-right") return SENSORS.filter((s) => /^battery-module-0[5-8]$/.test(s.component));
  return SENSORS.filter((s) => s.component === component);
}

/** Where a sensor is for a given tilt angle of its unit (degrees, 90 = hover). */
export function sensorPosition(sensor: SensorDefinition, tiltDeg: number): Vec3 {
  return sensor.unit ? unitPoint(unitMount(sensor.unit.no), sensor.unit.local, tiltDeg) : sensor.position;
}

export const SENSOR_CATEGORIES: readonly { id: SensorCategory; label: string; description: string }[] = [
  { id: "vibration", label: "VIBRATION", description: "Accelerometers on bearings and airframe" },
  { id: "thermal", label: "THERMAL", description: "Temperature and coolant pressure" },
  { id: "electrical", label: "ELECTRICAL", description: "Voltage, current and insulation" },
  { id: "structural", label: "STRUCTURAL", description: "Strain at spar roots, mounts and gear" },
  { id: "position", label: "POSITION", description: "Surface, tilt and rotor position" },
  { id: "navigation", label: "NAVIGATION", description: "Position, attitude and air-data sources" },
];

/** The flagship sensor: front-bearing vibration on propulsion unit 04. */
export const FLAGSHIP_SENSOR_ID = "VIB-M04-A";
