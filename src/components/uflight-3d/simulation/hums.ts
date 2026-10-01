// Health and usage monitoring: turns the outputs of the system models into
// component, system and vehicle health, and assembles the digital-twin state.
// This is where "what is the aircraft telling us about its health?" is answered.
// Reference logic for an educational demonstrator; all values are simulated.
import type {
  ActiveFaultScenarioId,
  ComponentHealth,
  ComponentId,
  ExpectedRange,
  FaultStage,
  FlightConfig,
  HealthState,
  HumsStatus,
  MissionPhase,
  MonitoredSystemId,
  PredictionState,
  SystemHealth,
  UFlightTwinState,
  VehicleState,
} from "../types";
import { COMPONENTS, COMPONENT_IDS } from "../data/componentDefinitions";
import { type NavSourceId, NAV_SOURCES, TRACE_STEPS } from "../data/healthDefinitions";
import { getSensor, type SensorDefinition } from "../data/sensorDefinitions";
import { MONITORED_SYSTEMS, stateRank } from "../data/uflightReferenceAircraft";
import { batteryState, type BatteryState } from "./battery";
import { DERATE_LIMIT, bearingDegradation, reached, type BearingOutputs } from "./faultModels";
import type { FlightState } from "./mission";
import { predictionAt } from "./prognostics";
import { unitState, unitStates, type UnitState } from "./propulsion";
import { structuralState, type StructuralState } from "./structures";
import { thermalState, type ThermalState } from "./thermal";

// ── Redundancy references ──

export type FccId = "fcc-a" | "fcc-b" | "fcc-c";
export type Availability = "AVAILABLE" | "UNAVAILABLE";

export interface VotingState {
  channels: Record<FccId, Availability>;
  availableChannels: number;
  /** Agreement between channels can still be established. */
  voting: Availability;
  flightControl: Availability;
  /** A channel has failed and the remaining channels carry on. */
  faultContained: boolean;
  state: HealthState;
}

const FCC_IDS: readonly FccId[] = ["fcc-a", "fcc-b", "fcc-c"];

/**
 * Reference voting rule for three channels: agreement needs two. One failed
 * channel is contained; with a single channel left there is nothing to compare
 * it with. A reference architecture, not a certification statement.
 */
export function votingState(failed: readonly FccId[]): VotingState {
  const channels = Object.fromEntries(FCC_IDS.map((id) => [id, failed.includes(id) ? "UNAVAILABLE" : "AVAILABLE"])) as Record<FccId, Availability>;
  const availableChannels = FCC_IDS.filter((id) => channels[id] === "AVAILABLE").length;
  const voting: Availability = availableChannels >= 2 ? "AVAILABLE" : "UNAVAILABLE";
  const flightControl: Availability = availableChannels >= 1 ? "AVAILABLE" : "UNAVAILABLE";
  const state: HealthState = availableChannels === 3 ? "NOMINAL" : availableChannels === 2 ? "LIMITED" : availableChannels === 1 ? "MAINTENANCE_REQUIRED" : "UNAVAILABLE";
  return { channels, availableChannels, voting, flightControl, faultContained: availableChannels === 2, state };
}

export interface NavigationState {
  sources: Record<NavSourceId, Availability>;
  availableSources: number;
  state: HealthState;
  positionSolution: Availability;
  /** Estimated position uncertainty, metres. */
  uncertaintyM: number;
}

/**
 * Reference fusion rule: a position solution needs an inertial unit and at
 * least one source that bounds its drift. Without GNSS the solution remains,
 * with a larger uncertainty.
 */
export function navigationState(unavailable: readonly NavSourceId[]): NavigationState {
  const sources = Object.fromEntries(NAV_SOURCES.map((s) => [s.id, unavailable.includes(s.id) ? "UNAVAILABLE" : "AVAILABLE"])) as Record<NavSourceId, Availability>;
  const up = (id: NavSourceId) => sources[id] === "AVAILABLE";
  const inertial = up("imu-a") || up("imu-b");
  const aiding = up("gnss") || up("vision-sensors") || (up("air-data") && up("magnetometer")) || up("radar-altimeter");
  const positionSolution: Availability = inertial && aiding ? "AVAILABLE" : "UNAVAILABLE";
  const availableSources = NAV_SOURCES.filter((s) => up(s.id)).length;
  const state: HealthState = positionSolution === "UNAVAILABLE" ? "UNAVAILABLE" : availableSources === NAV_SOURCES.length ? "NOMINAL" : "DEGRADED";
  let uncertaintyM = 1.5;
  if (!up("gnss")) uncertaintyM = up("vision-sensors") ? 6 : 14;
  if (!(up("imu-a") && up("imu-b"))) uncertaintyM += 1;
  return { sources, availableSources, state, positionSolution, uncertaintyM };
}

// ── Roll-up ──

export function worstState(states: readonly HealthState[]): HealthState {
  return states.reduce<HealthState>((worst, s) => (stateRank(s) > stateRank(worst) ? s : worst), "NOMINAL");
}

/**
 * Vehicle state from system states. Degradation alone does not limit the
 * mission; a limited system does; anything needing maintenance, or
 * unavailable, withholds release.
 */
export function vehicleState(systems: Record<MonitoredSystemId, SystemHealth>): VehicleState {
  const states = MONITORED_SYSTEMS.map((id) => systems[id].state);
  if (states.some((s) => s === "UNAVAILABLE" || s === "MAINTENANCE_REQUIRED")) return "NOT_RELEASED";
  if (states.some((s) => s === "LIMITED")) return "MISSION_CAPABLE_WITH_LIMITATION";
  return "MISSION_CAPABLE";
}

// ── Inputs and snapshot ──

export interface FaultInputs {
  scenario: ActiveFaultScenarioId | null;
  stage: FaultStage;
  /** Current severity of the active scenario, 0–1. */
  severity: number;
  fccBFailed: boolean;
  gnssUnavailable: boolean;
}

export const NO_FAULTS: FaultInputs = { scenario: null, stage: "HEALTHY", severity: 0, fccBFailed: false, gnssUnavailable: false };

export interface HealthInputs {
  missionTimeS: number;
  missionPhase: MissionPhase;
  config: FlightConfig;
  flight: FlightState;
  faults: FaultInputs;
  /** Flight cycles from now for the prediction (negative = history). */
  predictionCycles?: number;
}

export interface HealthSnapshot {
  twin: UFlightTwinState;
  units: UnitState[];
  battery: BatteryState;
  bearing: BearingOutputs;
  thermal: ThermalState;
  structures: StructuralState;
  voting: VotingState;
  navigation: NavigationState;
}

const HUMS_LABEL: Record<HumsStatus, string> = {
  MONITORING: "MONITORING",
  BACKGROUND_MONITORING: "BACKGROUND MONITORING",
  ANOMALY_DETECTED: "ANOMALY DETECTED",
  DIAGNOSED: "DIAGNOSIS AVAILABLE",
  PROGNOSIS_AVAILABLE: "PROGNOSIS AVAILABLE",
};
export const humsLabel = (status: HumsStatus) => HUMS_LABEL[status];

const nominal = (summary = "Within expected range"): ComponentHealth => ({ state: "NOMINAL", available: true, summary });
const system = (state: HealthState, summary: string, contributors: ComponentId[] = []): SystemHealth => ({ state, summary, contributors });

const residual = (observed: number, range: ExpectedRange) => observed - (range.min + range.max) / 2;

/** The centre of an expected range, as a symmetric band of ±`fraction`. */
const around = (value: number, fraction: number): ExpectedRange => ({ min: value * (1 - fraction), max: value * (1 + fraction) });

export function buildHealthSnapshot(inputs: HealthInputs): HealthSnapshot {
  const { flight, faults, missionTimeS } = inputs;
  const bearingSeverity = faults.scenario === "bearing-degradation" ? faults.severity : 0;
  const batterySeverity = faults.scenario === "battery-imbalance" ? faults.severity : 0;
  // On the ground at the end of a scenario the finding is handed to maintenance.
  const maintenance = faults.scenario !== null && faults.stage === "MAINTENANCE";

  const battery = batteryState(flight, batterySeverity);
  const units = unitStates(flight, battery.packVoltage);
  const unit04 = unitState(units, "04");
  const bearing = bearingDegradation({ missionTime: missionTimeS, rpm: unit04.rpm, load: unit04.load, faultSeverity: bearingSeverity });
  const thermal = thermalState(units, battery, bearing.bearingTemp);
  const structures = structuralState(flight);
  const voting = votingState(faults.fccBFailed ? ["fcc-b"] : []);
  const navigation = navigationState(faults.gnssUnavailable ? ["gnss"] : []);

  // ── Component health ──
  const components: Partial<Record<ComponentId, ComponentHealth>> = {};
  for (const id of COMPONENT_IDS) if (COMPONENTS[id].healthSource === id) components[id] = nominal();

  if (bearing.anomaly) {
    const state: HealthState = maintenance ? "MAINTENANCE_REQUIRED" : "DEGRADED";
    components["pu04-bearing-front"] = { state, available: true, summary: "Vibration above baseline" };
    components["propulsion-unit-04"] = { state, available: true, summary: maintenance ? "Inspection required" : "Bearing degradation detected" };
  }
  if (battery.fault.anomaly) {
    const state: HealthState = maintenance ? "MAINTENANCE_REQUIRED" : "DEGRADED";
    components["battery-module-03"] = { state, available: true, summary: "Cell-group imbalance" };
    components["battery-pack-left"] = { state: maintenance ? "MAINTENANCE_REQUIRED" : battery.fault.derated ? "LIMITED" : "DEGRADED", available: true, summary: battery.fault.derated ? "Power capability derated" : "Module 03 degraded" };
  }
  for (const id of FCC_IDS) if (voting.channels[id] === "UNAVAILABLE") components[id] = { state: "UNAVAILABLE", available: false, summary: "Channel unavailable" };
  for (const source of NAV_SOURCES) if (navigation.sources[source.id] === "UNAVAILABLE") components[source.id] = { state: "UNAVAILABLE", available: false, summary: "Source unavailable" };

  // ── System health ──
  const propulsionState = worstState(units.map((u) => components[`propulsion-unit-${u.no}`]?.state ?? "NOMINAL"));
  const derate = 1 - battery.fault.powerFactor;
  const energyState: HealthState = !battery.fault.anomaly ? "NOMINAL" : maintenance ? "MAINTENANCE_REQUIRED" : derate > DERATE_LIMIT ? "LIMITED" : "DEGRADED";

  const systems: Record<MonitoredSystemId, SystemHealth> = {
    propulsion:
      propulsionState === "NOMINAL"
        ? system("NOMINAL", "8 of 8 units nominal")
        : system(propulsionState, maintenance ? "Unit 04: inspection required" : "Unit 04 degraded · all units available", ["propulsion-unit-04", "pu04-bearing-front"]),
    energy:
      energyState === "NOMINAL"
        ? system("NOMINAL", "Packs balanced")
        : system(energyState, battery.fault.derated ? "Power capability derated" : "Module 03 degraded", ["battery-module-03", "battery-pack-left"]),
    flightControl:
      voting.state === "NOMINAL" ? system("NOMINAL", "3 of 3 channels agree") : system(voting.state, voting.faultContained ? "FCC-B unavailable · fault contained" : "Channel loss", ["fcc-b"]),
    structures: system("NOMINAL", "Loads within reference envelope"),
    avionics: system("NOMINAL", "Networks A and B available"),
    thermal: system("NOMINAL", "Cooling keeping up"),
    navigation:
      navigation.state === "NOMINAL" ? system("NOMINAL", "All sources available") : system(navigation.state, `GNSS unavailable · position solution ${navigation.positionSolution.toLowerCase()}`, ["gnss"]),
  };

  // ── HUMS status ──
  const anomaly = bearing.anomaly || battery.fault.anomaly;
  let hums: HumsStatus = inputs.missionPhase === "CRUISE" ? "BACKGROUND_MONITORING" : "MONITORING";
  if (anomaly) hums = reached(faults.stage, "DEGRADING") ? "PROGNOSIS_AVAILABLE" : reached(faults.stage, "DIAGNOSED") ? "DIAGNOSED" : "ANOMALY_DETECTED";

  // ── Observed, estimated, expected ──
  const observations: Record<string, number> = {};
  const estimates: Record<string, number> = {};
  const expected: Record<string, ExpectedRange> = {};

  for (const unit of units) {
    const key = `pu${unit.no}`;
    const faulted = unit.no === "04";
    observations[`${key}.rpm`] = unit.rpm;
    observations[`${key}.current`] = unit.currentA;
    observations[`${key}.dcVoltage`] = unit.dcVoltage;
    observations[`${key}.windingTemp`] = unit.windingTempC;
    observations[`${key}.inverterTemp`] = unit.inverterTempC;
    observations[`${key}.bearingTemp`] = faulted ? bearing.bearingTemp : unit.bearingTempC;
    observations[`${key}.vibration`] = faulted ? bearing.vibrationRms : unit.vibration;
    observations[`${key}.vibrationB`] = unit.vibration * 0.82;
    observations[`${key}.tilt`] = unit.tiltDeg;
    estimates[`${key}.torque`] = unit.torqueNm;
    estimates[`${key}.power`] = unit.powerKw;
    expected[`${key}.vibration`] = faulted ? bearing.expectedVibration : around(unit.vibration, 0.11);
    expected[`${key}.bearingTemp`] = faulted ? bearing.expectedBearingTemp : { min: unit.bearingTempC - 4, max: unit.bearingTempC + 4 };
    expected[`${key}.windingTemp`] = { min: unit.windingTempC - 6, max: unit.windingTempC + 6 };
  }
  observations["pu04.feature"] = bearing.spectralFeature;
  expected["pu04.feature"] = { min: 0, max: bearing.featureLimit };
  estimates["pu04.bearingHealth"] = bearing.healthIndex;

  observations["battery.soc"] = battery.socPercent;
  observations["battery.packVoltage"] = battery.packVoltage;
  observations["battery.packCurrent"] = battery.packCurrentA;
  observations["battery.tempMax"] = battery.tempMaxC;
  observations["battery.tempSpread"] = battery.tempSpreadC;
  observations["battery.voltageSpread"] = battery.voltageSpreadMv;
  observations["battery.insulation"] = battery.insulationKohm;
  for (const pack of battery.modules) {
    observations[`battery.m${pack.no}.voltageSpread`] = pack.voltageSpreadMv;
    observations[`battery.m${pack.no}.temp`] = pack.tempC;
    estimates[`battery.m${pack.no}.resistance`] = pack.resistanceMohm;
  }
  estimates["battery.soh"] = battery.sohPercent;
  estimates["battery.resistance"] = battery.resistanceMohm;
  estimates["battery.availableEnergy"] = battery.availableEnergyKwh;
  estimates["battery.availablePower"] = battery.availablePowerKw;
  estimates["battery.moduleHealth"] = battery.fault.healthIndex;
  expected["battery.voltageSpread"] = battery.fault.expectedVoltageSpreadMv;
  expected["battery.tempSpread"] = { min: 0, max: Math.max(battery.fault.expectedTemperatureSpreadC.max, 3.5) };
  expected["battery.m03.voltageSpread"] = battery.fault.expectedVoltageSpreadMv;

  observations["thermal.coolantIn"] = thermal.coolantInC;
  observations["thermal.coolantOut"] = thermal.coolantOutC;
  observations["thermal.pressure"] = thermal.coolantPressureKpa;
  observations["thermal.avionicsTemp"] = thermal.avionicsTempC;
  expected["thermal.coolantIn"] = { min: thermal.coolantInC - 3, max: thermal.coolantInC + 3 };

  observations["structures.wingRootStrain"] = structures.wingRootStrain;
  observations["structures.rotorMountStrain"] = structures.rotorMountStrain;
  observations["structures.boomStrain"] = structures.boomStrain;
  observations["structures.gearLoad"] = structures.gearLoad;
  observations["structures.airframeVibration"] = structures.airframeVibration;
  estimates["structures.fatigueIndex"] = structures.fatigueIndex;
  expected["structures.wingRootStrain"] = around(structures.wingRootStrain, 0.12);

  observations["fcc.channels"] = voting.availableChannels;
  expected["fcc.channels"] = { min: 3, max: 3 };
  observations["nav.sources"] = navigation.availableSources;
  expected["nav.sources"] = { min: NAV_SOURCES.length, max: NAV_SOURCES.length };
  estimates["nav.positionUncertainty"] = navigation.uncertaintyM;
  expected["nav.positionUncertainty"] = { min: 0.5, max: 2.5 };
  observations["avionics.networks"] = 2;
  expected["avionics.networks"] = { min: 2, max: 2 };

  const residuals: Record<string, number> = {};
  for (const key of Object.keys(expected)) {
    const value = observations[key] ?? estimates[key];
    if (value !== undefined) residuals[key] = residual(value, expected[key]);
  }

  const cycles = inputs.predictionCycles ?? 0;
  const predictions: Record<string, PredictionState> = {
    "propulsion-unit-04": predictionAt(bearingSeverity, cycles, bearing.anomaly),
    "battery-module-03": predictionAt(batterySeverity, cycles, battery.fault.anomaly),
  };

  const twin: UFlightTwinState = {
    timestamp: missionTimeS,
    aircraftMode: inputs.config,
    missionPhase: inputs.missionPhase,
    vehicle: vehicleState(systems),
    hums,
    systems,
    components,
    observations,
    estimates,
    expected,
    residuals,
    predictions,
  };

  return { twin, units, battery, bearing, thermal, structures, voting, navigation };
}

/** Health of a component, following its health source and falling back to its assembly. */
export function componentHealth(twin: UFlightTwinState, id: ComponentId): ComponentHealth {
  const definition = COMPONENTS[id];
  const own = definition.healthSource ? twin.components[definition.healthSource] : undefined;
  if (own && own.state !== "NOMINAL") return own;
  // A part of a propulsion unit inherits nothing from a degraded sibling; only its own finding counts.
  return own ?? { state: "NOMINAL", available: true, summary: "Not individually monitored" };
}

// ── Sensor trace ──

export interface TraceStop {
  step: (typeof TRACE_STEPS)[number]["id"];
  /** Component where this step happens. */
  component: ComponentId;
}

/** Where each step of the health pipeline happens for a given sensor. */
export function tracePath(sensor: SensorDefinition): TraceStop[] {
  return TRACE_STEPS.map((step) => {
    if (step.id === "sensor") return { step: step.id, component: sensor.component };
    if (step.id === "acquisition") return { step: step.id, component: sensor.node };
    return { step: step.id, component: step.component! };
  });
}

/** Residual wording for a signal: where the observation sits against its expected range. */
export function residualLabel(value: number, range: ExpectedRange): "within baseline" | "above baseline" | "below baseline" {
  if (value > range.max) return "above baseline";
  if (value < range.min) return "below baseline";
  return "within baseline";
}

/** What a sensor is reading now, or null when the snapshot has no such signal. */
export function sensorReading(twin: UFlightTwinState, sensorId: string): { value: number; expected: ExpectedRange | null } | null {
  const sensor = getSensor(sensorId);
  if (!sensor) return null;
  const value = twin.observations[sensor.signal] ?? twin.estimates[sensor.signal];
  if (value === undefined) return null;
  return { value, expected: twin.expected[sensor.signal] ?? null };
}
