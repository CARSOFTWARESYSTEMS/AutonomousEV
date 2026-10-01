// Formats simulated quantities for the interface. Pure, so every figure the
// panels show can be checked in tests.
import type { LinkState } from "../types";
import type { LiveKey, ValueRow } from "../data/componentDefinitions";
import { LINK_STATE_LABEL } from "../simulation/communications";
import { PAYLOAD_PHASE_LABEL } from "../simulation/payload";
import type { Telemetry } from "../state/explorerStore";

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");

export const formatWatts = (w: number) => `${w.toFixed(1)} W`;
export const formatPercent = (p: number) => `${Math.round(p)}%`;

export function formatRpm(rpm: number): string {
  const rounded = Math.round(rpm / 10) * 10;
  if (rounded === 0) return "0 rpm";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toLocaleString("en-US")} rpm`;
}

export function formatAmps(a: number): string {
  if (Math.abs(a) < 0.05) return "0.0 A";
  return `${a > 0 ? "+" : "−"}${Math.abs(a).toFixed(1)} A`;
}

export const POWER_STATE_LABEL = { CHARGING: "Charging", DISCHARGING: "Discharging", BALANCED: "Balanced" } as const;

const ATTITUDE_LABEL: Record<string, string> = {
  NADIR: "Nadir pointing",
  SUN_POINTING: "Sun pointing",
  TARGET_TRACK: "Target tracking",
  STATION_TRACK: "Station tracking",
  DRIFT: "Not acquired",
};

export const attitudeLabel = (mode: string) => ATTITUDE_LABEL[mode] ?? titleCase(mode);
export const linkLabel = (link: LinkState) => LINK_STATE_LABEL[link];

export function formatLive(key: LiveKey, t: Telemetry): string {
  switch (key) {
    case "batterySoc":
      return formatPercent(t.batterySoc);
    case "busVoltage":
      return `${t.busVoltage.toFixed(1)} V`;
    case "batteryCurrent":
      return formatAmps(t.batteryCurrentA);
    case "batteryState":
      return POWER_STATE_LABEL[t.batteryState];
    case "generation":
      return formatWatts(t.generationW);
    case "generationPerWing":
      return formatWatts(t.generationW / 2);
    case "load":
      return formatWatts(t.loadW);
    case "sunlight":
      return t.sunlit ? "Sunlight" : "Eclipse";
    case "spacecraftMode":
      return titleCase(t.spacecraftMode);
    case "attitudeMode":
      return attitudeLabel(t.attitudeMode);
    case "wheelX":
      return formatRpm(t.wheelRpm[0]);
    case "wheelY":
      return formatRpm(t.wheelRpm[1]);
    case "wheelZ":
      return formatRpm(t.wheelRpm[2]);
    case "wheelR":
      return formatRpm(t.wheelRpm[3]);
    case "storage":
      return `${Math.round(t.storageMb)} MB`;
    case "payloadPhase":
      return titleCase(PAYLOAD_PHASE_LABEL[t.payloadPhase]);
    case "linkState":
      return titleCase(LINK_STATE_LABEL[t.link]);
    case "elevation":
      return `${Math.round(t.elevationDeg)}°`;
    case "downlink":
      return formatPercent(t.downlinkProgress * 100);
  }
}

/** Display value of a panel row: the simulated quantity when the row is live, its reference value otherwise. */
export const rowValue = (row: ValueRow, t: Telemetry) => (row.live ? formatLive(row.live, t) : row.value);

/** Latitude / longitude for the orbit readout. */
export function formatGeo(latDeg: number, lonDeg: number): string {
  const lat = `${Math.abs(latDeg).toFixed(1)}°${latDeg >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(lonDeg).toFixed(1)}°${lonDeg >= 0 ? "E" : "W"}`;
  return `${lat} ${lon}`;
}
