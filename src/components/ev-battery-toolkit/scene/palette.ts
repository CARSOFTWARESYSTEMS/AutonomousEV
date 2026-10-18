// Colours shared by the 3D scene and the 2D schematic, so both read the same.
// Red is used only for a fault or danger, amber for warning, green for healthy.

export const COLOR = {
  background: "#060914",
  enclosure: "#34446c",
  cover: "#3a4b78",
  gasket: "#0b0f1a",
  cellNMC: "#5079c2",
  cellLFP: "#6f7c98",
  holder: "#1c2433",
  busbar: "#aab4c8",
  bms: "#11384a",
  chip: "#0b1220",
  fuse: "#dfe3ea",
  shunt: "#b87333",
  harness: "#93c5fd",
  sensor: "#67e8f9",
  fault: "#ef4444",
  charge: "#2563eb",
  discharge: "#d9661f",
  insulation: "#94a3b8",
  tim: "#46536a",
  vent: "#6b778c",
  selected: "#60a5fa",
  highlight: "#bfdbfe",
  dim: "#3a4560",
  scooter: "#44527a",
  scooterTrim: "#1a2135",
  tyre: "#0f131d",
  ok: "#6ee7b7",
  warning: "#fbbf24",
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  const to = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return `#${to(r1, r2)}${to(g1, g2)}${to(b1, b2)}`;
}

function ramp(stops: [number, string][], value: number): string {
  if (!Number.isFinite(value)) return COLOR.dim;
  if (value <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i];
    const [v0, c0] = stops[i - 1];
    if (value <= v1) return mix(c0, c1, (value - v0) / (v1 - v0));
  }
  return stops[stops.length - 1][1];
}

/** Temperature to colour: cool blue → cyan → amber → red. */
export const thermalColor = (celsius: number) =>
  ramp(
    [
      [24, "#3b6fd8"],
      [33, "#38bdf8"],
      [42, "#e2d24a"],
      [50, "#f59e0b"],
      [58, "#f97316"],
      [66, "#ef4444"],
    ],
    celsius,
  );

/** Deviation of a group from the pack average, in mV, to colour: green → amber → red. */
export const voltageColor = (deviationMv: number) =>
  ramp(
    [
      [0, "#34d399"],
      [12, "#34d399"],
      [40, "#fbbf24"],
      [90, "#ef4444"],
    ],
    Math.abs(deviationMv),
  );

export const THERMAL_LEGEND = [24, 33, 42, 50, 58, 66].map((t) => ({ label: `${t} °C`, color: thermalColor(t) }));
export const VOLTAGE_LEGEND = [
  { label: "< 12 mV", color: voltageColor(0) },
  { label: "40 mV", color: voltageColor(40) },
  { label: "≥ 90 mV", color: voltageColor(90) },
];
