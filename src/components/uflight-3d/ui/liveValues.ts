// What the panels say about a component: the executive consequences of its
// health state, and the engineering telemetry behind it. Reads the health
// snapshot; computes nothing of its own. All values are simulated.
import type { ComponentId, HealthState } from "../types";
import { COMPONENTS, unitNumberOf } from "../data/componentDefinitions";
import { sensorsOn } from "../data/sensorDefinitions";
import { type HealthSnapshot, residualLabel } from "../simulation/hums";
import { describeWindow, trendOf } from "../simulation/prognostics";
import { unitState } from "../simulation/propulsion";
import { thermalClass } from "../simulation/thermal";
import type { ValueRow } from "./common";

export const MISSION_IMPACT: Record<HealthState, string> = {
  NOMINAL: "NONE",
  DEGRADED: "LOW",
  LIMITED: "MISSION LIMITED",
  MAINTENANCE_REQUIRED: "RELEASE WITHHELD",
  UNAVAILABLE: "FUNCTION LOST",
};

export const MAINTENANCE_NEED: Record<HealthState, string> = {
  NOMINAL: "NONE REQUIRED",
  DEGRADED: "INSPECTION REQUIRED",
  LIMITED: "INSPECTION REQUIRED",
  MAINTENANCE_REQUIRED: "INSPECTION REQUIRED",
  UNAVAILABLE: "TROUBLESHOOTING REQUIRED",
};

const number = (value: number, places = 0) => value.toFixed(places);

/** Engineering telemetry for a component. */
export function componentTelemetry(id: ComponentId, snapshot: HealthSnapshot, faultSeverity: number): ValueRow[] {
  const { twin } = snapshot;
  const unitNo = unitNumberOf(id);
  const rows: ValueRow[] = [];

  if (unitNo) {
    const unit = unitState(snapshot.units, unitNo);
    const key = `pu${unitNo}`;
    const faulted = unitNo === "04";
    const vibration = twin.observations[`${key}.vibration`];
    const expected = twin.expected[`${key}.vibration`];
    const part = id.startsWith("propulsion-unit") ? "unit" : id.slice(5);
    const all = part === "unit";
    const running = unit.rpm > 1;

    if (all || part === "rotor" || part === "shaft" || part === "resolver" || part === "motor") rows.push({ label: "RPM", value: number(unit.rpm), unit: "rpm", simulated: true });
    if (all || part === "motor" || part === "inverter" || part === "motor-controller") rows.push({ label: "Phase current", value: number(unit.currentA), unit: "A", simulated: true });
    if (all || part === "inverter") rows.push({ label: "DC voltage", value: number(unit.dcVoltage), unit: "V", simulated: true });
    if (all || part === "motor" || part === "cooling-interface") rows.push({ label: "Winding temp", value: number(unit.windingTempC), unit: "°C", simulated: true });
    if (all || part === "inverter" || part === "cooling-interface") rows.push({ label: "Inverter temp", value: number(unit.inverterTempC), unit: "°C", simulated: true });
    if (all || part.startsWith("bearing")) rows.push({ label: "Bearing temp", value: number(twin.observations[`${key}.bearingTemp`]), unit: "°C", simulated: true });
    if (part === "motor" || part === "motor-controller") rows.push({ label: "Estimated torque", value: number(unit.torqueNm), unit: "N·m", simulated: true });
    if (part === "tilt-actuator" || part === "motor-controller") rows.push({ label: "Tilt position", value: number(unit.tiltDeg), unit: "°", simulated: true });
    if (all || part.startsWith("bearing") || part === "shaft" || part === "rotor" || part === "sensors") {
      rows.push({ label: "Vibration", value: running ? number(vibration, 2) : "—", unit: running ? "sim. units" : "rotor stopped", simulated: true });
      if (running && expected) rows.push({ label: "Expected range", value: `${number(expected.min, 2)}–${number(expected.max, 2)}` });
      if (faulted) rows.push({ label: "Vibration feature", value: running ? number(twin.observations["pu04.feature"], 2) : "—", unit: "× baseline", simulated: true });
      rows.push({ label: "Residual", value: running && expected ? residualLabel(vibration, expected).toUpperCase() : "—" });
    }
    if (all || part === "bearing-front") {
      rows.push({ label: "Health model state", value: faulted && snapshot.bearing.anomaly ? "ANOMALY" : "WITHIN BASELINE" });
      rows.push({ label: "Trend", value: faulted ? trendOf(faultSeverity) : "STABLE" });
      rows.push({ label: "Predicted band", value: faulted ? describeWindow(snapshot.bearing.prognosisBand) : "No maintenance action predicted" });
    }
  } else if (id.startsWith("battery-module-")) {
    const no = id.slice(-2);
    const batteryModule = snapshot.battery.modules[Number(no) - 1];
    rows.push(
      { label: "Voltage spread", value: number(batteryModule.voltageSpreadMv), unit: "mV", simulated: true },
      { label: "Module temp", value: number(batteryModule.tempC, 1), unit: "°C", simulated: true },
      { label: "Resistance estimate", value: number(batteryModule.resistanceMohm, 1), unit: "mΩ", simulated: true },
    );
  } else if (id === "battery-pack-left" || id === "battery-pack-right" || id === "bms-primary" || id === "bms-secondary" || id === "hv-contactors" || id === "hvdc-bus") {
    const b = snapshot.battery;
    rows.push(
      { label: "State of charge", value: number(b.socPercent), unit: "%", simulated: true },
      { label: "State of health", value: number(b.sohPercent), unit: "%", simulated: true },
      { label: "Pack voltage", value: number(b.packVoltage), unit: "V", simulated: true },
      { label: "Pack current", value: number(b.packCurrentA), unit: "A", simulated: true },
      { label: "Temp spread", value: number(b.tempSpreadC, 1), unit: "°C", simulated: true },
      { label: "Voltage spread", value: number(b.voltageSpreadMv), unit: "mV", simulated: true },
      { label: "Insulation", value: number(b.insulationKohm), unit: "kΩ", simulated: true },
      { label: "Available energy", value: number(b.availableEnergyKwh), unit: "kWh", simulated: true },
      { label: "Available power", value: number(b.availablePowerKw), unit: "kW", simulated: true },
      { label: "Charge cycles", value: number(b.chargeCycles) },
    );
  } else if (COMPONENTS[id].system === "thermal") {
    const t = snapshot.thermal;
    rows.push(
      { label: "Coolant in", value: number(t.coolantInC, 1), unit: "°C", simulated: true },
      { label: "Coolant out", value: number(t.coolantOutC, 1), unit: "°C", simulated: true },
      { label: "Coolant pressure", value: number(t.coolantPressureKpa), unit: "kPa", simulated: true },
      { label: "Heat rejected", value: number(t.heatRejectedKw, 1), unit: "kW", simulated: true },
    );
  } else if (COMPONENTS[id].system === "structures" && COMPONENTS[id].monitors.length > 0) {
    const s = snapshot.structures;
    rows.push(
      { label: "Spar root strain", value: number(s.wingRootStrain), unit: "µε", simulated: true },
      { label: "Rotor-mount strain", value: number(s.rotorMountStrain), unit: "µε", simulated: true },
      { label: "Gear load", value: number(s.gearLoad), unit: "µε", simulated: true },
      { label: "Fatigue exposure", value: number(s.fatigueIndex, 2), unit: "of ref. life", simulated: true },
    );
  } else if (id === "fcc-a" || id === "fcc-b" || id === "fcc-c" || id === "actuator-controllers") {
    rows.push({ label: "Channels available", value: `${snapshot.voting.availableChannels} of 3` }, { label: "Voting", value: snapshot.voting.voting }, { label: "Flight control", value: snapshot.voting.flightControl });
  } else if (COMPONENTS[id].system === "navigation") {
    rows.push(
      { label: "Sources available", value: `${snapshot.navigation.availableSources} of 7` },
      { label: "Position solution", value: snapshot.navigation.positionSolution },
      { label: "Position uncertainty", value: number(snapshot.navigation.uncertaintyM, 1), unit: "m", simulated: true },
    );
  }

  const heat = snapshot.thermal.levels[id];
  if (heat !== undefined) rows.push({ label: "Thermal state", value: thermalClass(heat) });

  const sensors = sensorsOn(id);
  if (sensors.length > 0) rows.push({ label: "Sensor IDs", value: sensors.length > 4 ? `${sensors.slice(0, 4).map((s) => s.id).join(" · ")} +${sensors.length - 4}` : sensors.map((s) => s.id).join(" · ") });
  return rows;
}
