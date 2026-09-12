import { type SimulationResult } from "./engine";
export const TELEMETRY_UNITS = {
  timeSeconds: "s",
  orbitNumber: "count",
  orbitPhase: "fraction",
  sunlight: "boolean",
  mode: "state",
  solarW: "W delivered after PMAD",
  loadW: "W requested",
  batteryW: "W positive discharge",
  currentA: "A positive discharge",
  socPercent: "%",
  observedSocPercent: "% (blank = dropout)",
  dodPercent: "%",
  voltageV: "V estimated",
  temperatureC: "°C estimated (blank = disabled)",
  detector: "status",
  activeFaultIds: "IDs",
  energyWh: "Wh",
};
const cell = (value: unknown) => {
  let text = String(value ?? "");
  // Quotes alone do not prevent spreadsheet formula interpretation of imported IDs.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
};
export function exportJson(r: SimulationResult) {
  return JSON.stringify({ ...r, units: TELEMETRY_UNITS }, null, 2);
}
export function exportCsv(r: SimulationResult) {
  const keys = Object.keys(TELEMETRY_UNITS) as (keyof typeof TELEMETRY_UNITS)[];
  return [
    ["schemaVersion", r.schemaVersion].map(cell).join(","),
    ["scenario", JSON.stringify(r.scenario)].map(cell).join(","),
    ["assumptions", r.assumptions.join(" | ")].map(cell).join(","),
    keys.map((k) => cell(`${k} [${TELEMETRY_UNITS[k]}]`)).join(","),
    ...r.samples.map((s) =>
      keys
        .map((k) =>
          cell(Array.isArray(s[k]) ? (s[k] as string[]).join(";") : s[k]),
        )
        .join(","),
    ),
  ].join("\r\n");
}
