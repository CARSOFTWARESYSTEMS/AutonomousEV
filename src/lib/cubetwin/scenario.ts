export const SCHEMA_VERSION = "1.0" as const;
export const FAULT_TYPES = [
  "solar-degradation",
  "panel-loss",
  "extended-eclipse",
  "payload-overrun",
  "load-spike",
  "capacity-fade",
  "resistance-rise",
  "heater-stuck",
  "soc-bias",
  "telemetry-dropout",
  "charge-loss",
] as const;
export type FaultType = (typeof FAULT_TYPES)[number];
export type MissionMode =
  | "off"
  | "boot"
  | "detumble"
  | "nominal"
  | "payload"
  | "downlink"
  | "recovery"
  | "safe";
export interface Fault {
  id: string;
  type: FaultType;
  startSecond: number;
  durationSeconds: number;
  severity: number;
}
export interface Activity {
  id: string;
  mode: MissionMode;
  startSecond: number;
  durationSeconds: number;
  critical: boolean;
}
export interface Scenario {
  schemaVersion: typeof SCHEMA_VERSION;
  name: string;
  seed: number;
  durationSeconds: number;
  timeStepSeconds: number;
  orbit: {
    altitudeKm: number;
    inclinationDeg: number;
    eclipseMode: "duration";
    eclipseDurationMinutes: number;
  };
  solar: {
    mode: "peak-power" | "engineering";
    peakPowerW: number;
    pmadEfficiency: number;
    degradationFactor: number;
    areaM2: number;
    cellEfficiency: number;
    incidenceDeg: number;
    irradianceWm2: number;
  };
  battery: {
    nominalEnergyWh: number;
    initialSocPercent: number;
    minimumReserveSocPercent: number;
    safeModeSocPercent: number;
    recoverySocPercent: number;
    maximumSocPercent: number;
    chargeEfficiency: number;
    dischargeEfficiency: number;
    internalResistanceOhm: number;
    recoveryDwellSeconds: number;
    undervoltageV: number;
    ocvCurve: { socPercent: number; voltageV: number }[];
  };
  thermal: {
    enabled: boolean;
    initialC: number;
    busC: number;
    capacitanceJPerK: number;
    resistanceKPerW: number;
    externalHeatW: number;
  };
  loads: { id: string; label: string; powerW: number; alwaysOn: boolean }[];
  activities: Activity[];
  faults: Fault[];
}
export const DEFAULT_SCENARIO: Scenario = {
  schemaVersion: SCHEMA_VERSION,
  name: "3U LEO Beginner Mission",
  seed: 20260930,
  durationSeconds: 86400,
  timeStepSeconds: 10,
  orbit: {
    altitudeKm: 500,
    inclinationDeg: 51.6,
    eclipseMode: "duration",
    eclipseDurationMinutes: 35,
  },
  solar: {
    mode: "peak-power",
    peakPowerW: 20,
    pmadEfficiency: 0.9,
    degradationFactor: 1,
    areaM2: 0.065,
    cellEfficiency: 0.28,
    incidenceDeg: 0,
    irradianceWm2: 1361,
  },
  battery: {
    nominalEnergyWh: 40,
    initialSocPercent: 80,
    minimumReserveSocPercent: 30,
    safeModeSocPercent: 20,
    recoverySocPercent: 40,
    maximumSocPercent: 95,
    chargeEfficiency: 0.95,
    dischargeEfficiency: 0.95,
    internalResistanceOhm: 0.12,
    recoveryDwellSeconds: 120,
    undervoltageV: 6.4,
    ocvCurve: [
      { socPercent: 0, voltageV: 6 },
      { socPercent: 20, voltageV: 7 },
      { socPercent: 50, voltageV: 7.4 },
      { socPercent: 100, voltageV: 8.4 },
    ],
  },
  thermal: {
    enabled: true,
    initialC: 20,
    busC: 20,
    capacitanceJPerK: 500,
    resistanceKPerW: 8,
    externalHeatW: 0.2,
  },
  loads: [
    {
      id: "essential",
      label: "EPS + essential OBC",
      powerW: 3,
      alwaysOn: true,
    },
    { id: "adcs", label: "ADCS", powerW: 2, alwaysOn: true },
    {
      id: "sensors",
      label: "GNSS + thermal + housekeeping",
      powerW: 3,
      alwaysOn: true,
    },
    { id: "payload", label: "Payload instrument", powerW: 10, alwaysOn: false },
    { id: "radio", label: "Downlink radio", powerW: 6, alwaysOn: false },
  ],
  activities: [
    {
      id: "boot",
      mode: "boot",
      startSecond: 0,
      durationSeconds: 60,
      critical: true,
    },
    {
      id: "detumble",
      mode: "detumble",
      startSecond: 60,
      durationSeconds: 240,
      critical: true,
    },
    {
      id: "image-1",
      mode: "payload",
      startSecond: 14400,
      durationSeconds: 600,
      critical: false,
    },
    {
      id: "downlink-1",
      mode: "downlink",
      startSecond: 18000,
      durationSeconds: 480,
      critical: false,
    },
  ],
  faults: [],
};
export const FAULT_INFO: Record<
  FaultType,
  {
    name: string;
    description: string;
    effect: string;
    unit: string;
    defaultSeverity: number;
    max: number;
  }
> = {
  "solar-degradation": {
    name: "Solar degradation",
    description: "The array produces less power throughout the fault window.",
    effect: "Compare charging slopes and daily energy margin.",
    unit: "fraction lost",
    defaultSeverity: 0.35,
    max: 0.95,
  },
  "panel-loss": {
    name: "Partial panel loss",
    description: "A panel or string becomes unavailable.",
    effect: "Observe a step reduction in delivered solar power.",
    unit: "fraction lost",
    defaultSeverity: 0.5,
    max: 0.95,
  },
  "extended-eclipse": {
    name: "Extended eclipse",
    description: "Earth’s shadow lasts longer in this duration model.",
    effect: "Measure the additional battery discharge.",
    unit: "additional min",
    defaultSeverity: 15,
    max: 30,
  },
  "payload-overrun": {
    name: "Payload overrun",
    description:
      "The instrument draws additional power during the fault window.",
    effect: "Represent unplanned payload operation as an extra load.",
    unit: "extra W",
    defaultSeverity: 10,
    max: 50,
  },
  "load-spike": {
    name: "Load spike",
    description: "A subsystem briefly draws extra power.",
    effect: "Compare voltage sag and minimum SOC.",
    unit: "extra W",
    defaultSeverity: 20,
    max: 50,
  },
  "capacity-fade": {
    name: "Battery capacity fade",
    description: "Less usable battery capacity is available.",
    effect: "Observe deeper SOC swings; capacity recovery never adds energy.",
    unit: "fraction lost",
    defaultSeverity: 0.3,
    max: 0.8,
  },
  "resistance-rise": {
    name: "Resistance rise",
    description: "An aged cell has greater internal resistance.",
    effect: "Observe estimated voltage sag and resistive heating.",
    unit: "fraction added",
    defaultSeverity: 2,
    max: 5,
  },
  "heater-stuck": {
    name: "Heater stuck on",
    description: "A heater creates a continuous unexpected load.",
    effect: "Watch the energy reserve and safe-mode entries.",
    unit: "extra W",
    defaultSeverity: 6,
    max: 50,
  },
  "soc-bias": {
    name: "SOC sensor bias",
    description:
      "Reported SOC differs from physical truth. Control uses the biased reading.",
    effect: "Compare truth, observation and threshold decisions.",
    unit: "percentage points",
    defaultSeverity: 15,
    max: 50,
  },
  "telemetry-dropout": {
    name: "Telemetry dropout",
    description:
      "The ground observer loses measurements; onboard control continues.",
    effect: "Missing observations remain gaps, never zero-valued measurements.",
    unit: "enabled (1)",
    defaultSeverity: 1,
    max: 1,
  },
  "charge-loss": {
    name: "Charge-path loss",
    description: "The charging path stores less surplus energy.",
    effect: "Compare conversion losses and reserve margin.",
    unit: "fraction lost",
    defaultSeverity: 0.3,
    max: 0.9,
  },
};
export function cloneScenario(s = DEFAULT_SCENARIO): Scenario {
  return JSON.parse(JSON.stringify(s));
}
export const PRESETS = [
  "Baseline",
  "Extended Eclipse",
  "Degraded Solar Array",
  "Aged Battery",
  "Heater Stuck On",
] as const;
export function presetScenario(name: string): Scenario {
  const s = cloneScenario();
  s.name = name === "Baseline" ? DEFAULT_SCENARIO.name : name;
  const types: Record<string, FaultType[]> = {
    "Extended Eclipse": ["extended-eclipse"],
    "Degraded Solar Array": ["solar-degradation"],
    "Aged Battery": ["capacity-fade", "resistance-rise"],
    "Heater Stuck On": ["heater-stuck"],
  };
  s.faults = (types[name] ?? []).map((type, i) => ({
    id: `preset-${i}`,
    type,
    startSecond: 0,
    durationSeconds: s.durationSeconds,
    severity: FAULT_INFO[type].defaultSeverity,
  }));
  return s;
}
export class ScenarioError extends Error {
  constructor(public errors: Record<string, string>) {
    super(
      Object.entries(errors)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; "),
    );
  }
}
export function validateScenario(input: unknown): Scenario {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new ScenarioError({ scenario: "Expected a scenario object." });
  const s = input as Scenario;
  const num = (path: string, value: unknown, min: number, max: number) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      errors[path] = `Enter a finite number from ${min} to ${max}.`;
  };
  if (s.schemaVersion !== SCHEMA_VERSION)
    errors.schemaVersion = "Only schema 1.0 is supported.";
  if (typeof s.name !== "string" || !s.name.trim() || s.name.length > 100)
    errors.name = "Use a name of 1–100 characters.";
  num("durationSeconds", s.durationSeconds, 60, 172800);
  num("timeStepSeconds", s.timeStepSeconds, 1, 60);
  num("seed", s.seed, 0, 4294967295);
  if (!Number.isInteger(s.seed)) errors.seed = "Use a whole-number seed.";
  if (s.durationSeconds / s.timeStepSeconds > 20000)
    errors.timeStepSeconds = "Limit the simulation to 20,000 steps.";
  num("orbit.altitudeKm", s.orbit?.altitudeKm, 160, 2000);
  num("orbit.inclinationDeg", s.orbit?.inclinationDeg, 0, 180);
  num("orbit.eclipseDurationMinutes", s.orbit?.eclipseDurationMinutes, 0, 100);
  if (s.orbit?.eclipseMode !== "duration")
    errors["orbit.eclipseMode"] = "Use duration mode.";
  const periodMin =
    (2 *
      Math.PI *
      Math.sqrt((6371 + (s.orbit?.altitudeKm ?? 0)) ** 3 / 398600.4418)) /
    60;
  if (s.orbit?.eclipseDurationMinutes >= periodMin)
    errors["orbit.eclipseDurationMinutes"] =
      "Eclipse must be shorter than the orbit.";
  if (!["peak-power", "engineering"].includes(s.solar?.mode))
    errors["solar.mode"] = "Choose peak-power or engineering.";
  for (const [key, min, max] of [
    ["peakPowerW", 0, 200],
    ["pmadEfficiency", 0.01, 1],
    ["degradationFactor", 0, 1],
    ["areaM2", 0.001, 0.5],
    ["cellEfficiency", 0.01, 0.5],
    ["incidenceDeg", 0, 180],
    ["irradianceWm2", 1000, 1500],
  ] as const)
    num(`solar.${key}`, s.solar?.[key], min, max);
  for (const [key, min, max] of [
    ["nominalEnergyWh", 1, 500],
    ["initialSocPercent", 0, 100],
    ["minimumReserveSocPercent", 0, 100],
    ["safeModeSocPercent", 0, 100],
    ["recoverySocPercent", 0, 100],
    ["maximumSocPercent", 1, 100],
    ["chargeEfficiency", 0.1, 1],
    ["dischargeEfficiency", 0.1, 1],
    ["internalResistanceOhm", 0, 1],
    ["recoveryDwellSeconds", 0, 3600],
    ["undervoltageV", 0, 12],
  ] as const)
    num(`battery.${key}`, s.battery?.[key], min, max);
  const b = s.battery;
  if (
    b &&
    !(
      b.safeModeSocPercent < b.minimumReserveSocPercent &&
      b.minimumReserveSocPercent <= b.recoverySocPercent &&
      b.recoverySocPercent <= b.maximumSocPercent
    )
  )
    errors["battery.recoverySocPercent"] =
      "Require safe < reserve ≤ recovery ≤ maximum SOC.";
  if (b?.initialSocPercent > b?.maximumSocPercent)
    errors["battery.initialSocPercent"] =
      "Starting SOC must not exceed maximum SOC.";
  if (
    !Array.isArray(b?.ocvCurve) ||
    b.ocvCurve.length < 2 ||
    b.ocvCurve.length > 20
  )
    errors["battery.ocvCurve"] = "Provide 2–20 SOC / voltage points.";
  else {
    b.ocvCurve.forEach((p, i) => {
      if (!p || typeof p !== "object") { errors["battery.ocvCurve"] = "Expected SOC / voltage point objects."; return; }
      num(`ocv.${i}.soc`, p?.socPercent, 0, 100);
      num(`ocv.${i}.voltage`, p?.voltageV, 3, 12);
      if (
        i &&
        (p.socPercent <= b.ocvCurve[i - 1]?.socPercent ||
          p.voltageV < b.ocvCurve[i - 1]?.voltageV)
      )
        errors["battery.ocvCurve"] =
          "SOC points must increase; voltage must not decrease.";
    });
    if (
      b.ocvCurve[0]?.socPercent !== 0 ||
      b.ocvCurve.at(-1)?.socPercent !== 100
    )
      errors["battery.ocvCurve"] = "Cover SOC from 0 to 100%.";
  }
  if (typeof s.thermal?.enabled !== "boolean")
    errors["thermal.enabled"] = "Use true or false.";
  for (const [key, min, max] of [
    ["initialC", -20, 60],
    ["busC", -20, 60],
    ["capacitanceJPerK", 100, 5000],
    ["resistanceKPerW", 1, 50],
    ["externalHeatW", 0, 5],
  ] as const)
    num(`thermal.${key}`, s.thermal?.[key], min, max);
  for (const key of ["loads", "activities", "faults"] as const) {
    const list = s[key];
    if (!Array.isArray(list) || list.length > (key === "loads" ? 20 : 30)) {
      errors[key] = "Expected a bounded list (20 loads or 30 events).";
      continue;
    }
    const ids = new Set<string>();
    list.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        errors[`${key}.${i}`] = "Expected an object.";
        return;
      }
      if (
        typeof item.id !== "string" ||
        !item.id ||
        item.id.length > 60 ||
        ids.has(item.id)
      )
        errors[`${key}.${i}.id`] = "Use a unique ID (1–60 characters).";
      ids.add(item.id);
    });
  }
  if (Array.isArray(s.loads))
    s.loads.forEach((l, i) => {
      num(`loads.${i}.powerW`, l?.powerW, 0, 100);
      if (
        typeof l?.alwaysOn !== "boolean" ||
        typeof l?.label !== "string" ||
        l.label.length > 100
      )
        errors[`loads.${i}`] = "Provide a label and alwaysOn boolean.";
    });
  if (Array.isArray(s.activities))
    s.activities.forEach((a, i) => {
      num(`activities.${i}.startSecond`, a?.startSecond, 0, s.durationSeconds);
      num(
        `activities.${i}.durationSeconds`,
        a?.durationSeconds,
        1,
        s.durationSeconds,
      );
      if (
        ![
          "off",
          "boot",
          "detumble",
          "nominal",
          "payload",
          "downlink",
          "recovery",
          "safe",
        ].includes(a?.mode) ||
        typeof a?.critical !== "boolean"
      )
        errors[`activities.${i}`] =
          "Provide a supported mode and critical boolean.";
      if (a?.startSecond + a?.durationSeconds > s.durationSeconds)
        errors[`activities.${i}`] = "Activity must end within the mission.";
    });
  if (
    Array.isArray(s.activities) &&
    s.activities.every((a) => a && typeof a === "object")
  ) {
    const ordered = [...s.activities].sort(
      (a, b) => a.startSecond - b.startSecond,
    );
    ordered.forEach((a, i) => {
      if (
        i &&
        a.startSecond <
          ordered[i - 1].startSecond + ordered[i - 1].durationSeconds
      )
        errors.activities = "Activities may not overlap.";
    });
  }
  if (Array.isArray(s.faults))
    s.faults.forEach((f, i) => {
      const info = FAULT_INFO[f?.type];
      if (!FAULT_TYPES.includes(f?.type)) errors[`faults.${i}.type`] = "Unknown fault type.";
      num(`faults.${i}.startSecond`, f?.startSecond, 0, s.durationSeconds);
      num(
        `faults.${i}.durationSeconds`,
        f?.durationSeconds,
        1,
        s.durationSeconds,
      );
      num(
        `faults.${i}.severity`,
        f?.severity,
        f?.type === "soc-bias" ? -50 : 0,
        info?.max ?? 1,
      );
      if (f?.startSecond + f?.durationSeconds > s.durationSeconds)
        errors[`faults.${i}`] = "Fault must end within the mission.";
    });
  if (Object.keys(errors).length) throw new ScenarioError(errors);
  return cloneScenario(s);
}
export function parseScenario(text: string): Scenario {
  if (text.length > 100000)
    throw new ScenarioError({
      file: "Scenario files must be smaller than 100 KB.",
    });
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ScenarioError({ file: "This file is not valid JSON." });
  }
  return validateScenario(value);
}
