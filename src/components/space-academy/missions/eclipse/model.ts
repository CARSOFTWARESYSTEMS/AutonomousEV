// Survive the Eclipse: a 1U CubeSat's electrical power system over three
// orbits. Orbital period and battery bookkeeping reuse the CubeTwin engine
// (src/lib/cubetwin/engine.ts); the eclipse geometry, loads and mode logic
// are this lesson's own, deliberately simple, model:
//  - circular orbit, Sun in the orbit plane (beta angle 0), cylindrical
//    Earth shadow, so the eclipse is the longest it can be at that altitude;
//  - each orbit starts in sunlight and ends in eclipse;
//  - illustrative cell, panel and load values for a generic 1U CubeSat.
// Simulated data for learning; not a mission analysis tool.
import { batteryStep, orbitalPeriodSeconds } from "@/lib/cubetwin/engine";
import type { Level } from "@/app/space/academy/data/curriculum";

export const EARTH_RADIUS_KM = 6371;

/** Fraction of each orbit in Earth's shadow: α/π with sin α = R ÷ (R + h). */
export function eclipseFraction(altitudeKm: number): number {
  const ratio = EARTH_RADIUS_KM / (EARTH_RADIUS_KM + altitudeKm);
  return Math.asin(ratio) / Math.PI;
}

export function orbitSummary(altitudeKm: number) {
  const periodS = orbitalPeriodSeconds(altitudeKm);
  const fraction = eclipseFraction(altitudeKm);
  return { periodS, periodMin: periodS / 60, eclipseFraction: fraction, eclipseMin: (periodS * fraction) / 60, sunlitMin: (periodS * (1 - fraction)) / 60 };
}

export type SolarConfig = "body" | "wings";
export type FaultId = "string" | "ageing" | "heater";

export const SOLAR_SUNLIT_W: Record<SolarConfig, number> = {
  // 1361 W/m² × sun-facing area × 28% efficiency, averaged over a slowly rotating 1U (illustrative).
  body: 1.9,
  wings: 5.6,
};

/** One battery pack, illustrative: 3.6 V × 1.5 Ah. */
export const CELL_WH = 5.4;
/** Packs the frame has room for. */
export const MAX_CELLS = 4;
/** At the Advanced level the mass budget allows at most this many packs. */
export const ADVANCED_MAX_CELLS = 2;

export const LOADS = {
  /** Computer, power board, attitude control and receiver, always on. */
  baseW: 1.0,
  /** Camera, when imaging. */
  payloadW: 2.5,
  /** Transmitter, averaged over an orbit. */
  radioW: 0.4,
  /** Safe mode keeps only the computer, power board and a beacon. */
  safeW: 0.6,
  /** Battery heater, thermostat-controlled: on in eclipse. */
  heaterW: 0.8,
};

export const FAULTS: Record<FaultId, { name: string; effect: string; detail: string }> = {
  string: { name: "Solar string failure", effect: "−30% solar power", detail: "One string of cells on the panels stops producing power, for example after a broken connection." },
  ageing: { name: "Battery ageing", effect: "−35% battery capacity", detail: "An older battery stores less energy than when new." },
  heater: { name: "Heater stuck on", effect: "+0.8 W in sunlight", detail: "The battery heater's switch fails closed, so it also draws power in sunlight, when it should be off." },
};

export interface EpsConfig {
  altitudeKm: number;
  solar: SolarConfig;
  cells: number;
  /** "sunlit": image only in sunlight; "always": image all orbit. */
  imaging: "sunlit" | "always";
  safeMode: boolean;
  /** Enter safe mode below this state of charge, %. */
  safeEnterPct: number;
  /** Leave safe mode only above this state of charge, %. */
  safeExitPct: number;
  faults: FaultId[];
}

export const DEFAULT_EPS: EpsConfig = {
  altitudeKm: 500,
  solar: "body",
  cells: 1,
  imaging: "always",
  safeMode: false,
  safeEnterPct: 30,
  safeExitPct: 60,
  faults: [],
};

export interface EpsSample {
  tMin: number;
  sunlit: boolean;
  safe: boolean;
  socPct: number;
  solarW: number;
  loadW: number;
}

export interface EpsResult {
  samples: EpsSample[];
  orbit: ReturnType<typeof orbitSummary>;
  capacityWh: number;
  minSocPct: number;
  /** State of charge never reached zero and no load went unpowered. */
  powerLost: boolean;
  /** Share of the planned imaging time actually delivered. */
  imagingDelivered: number;
  safeEntries: number;
  /** Worst depth of discharge across the eclipses, % of capacity. */
  maxDodPct: number;
}

const ORBITS = 3;
const DT_S = 20;
/** Every run starts with this state of charge. */
export const START_SOC_PCT = 90;

export function simulateEps(config: EpsConfig): EpsResult {
  const orbit = orbitSummary(config.altitudeKm);
  const capacityWh = config.cells * CELL_WH * (config.faults.includes("ageing") ? 0.65 : 1);
  const solarScale = config.faults.includes("string") ? 0.7 : 1;
  const total = orbit.periodS * ORBITS;
  const eclipseStart = orbit.periodS * (1 - orbit.eclipseFraction);

  let energy = (capacityWh * START_SOC_PCT) / 100;
  let safe = false;
  let minSoc = START_SOC_PCT;
  let powerLost = false;
  let planned = 0;
  let delivered = 0;
  let safeEntries = 0;
  let maxDod = 0;
  let eclipseStartEnergy = energy;
  let wasSunlit = true;
  const samples: EpsSample[] = [];

  for (let t = 0; t <= total; t += DT_S) {
    const phase = t % orbit.periodS;
    const sunlit = phase < eclipseStart;
    if (wasSunlit && !sunlit) eclipseStartEnergy = energy;
    if (!wasSunlit && sunlit) maxDod = Math.max(maxDod, ((eclipseStartEnergy - energy) / capacityWh) * 100);
    wasSunlit = sunlit;

    const soc = (energy / capacityWh) * 100;
    if (config.safeMode) {
      if (!safe && soc < config.safeEnterPct) {
        safe = true;
        safeEntries += 1;
      } else if (safe && soc >= config.safeExitPct) {
        safe = false;
      }
    }

    const wantsImaging = config.imaging === "always" || sunlit;
    const imaging = wantsImaging && !safe;
    if (wantsImaging) planned += DT_S;
    const solarW = sunlit ? SOLAR_SUNLIT_W[config.solar] * solarScale : 0;
    const heaterW = !sunlit || config.faults.includes("heater") ? LOADS.heaterW : 0;
    const loadW = (safe ? LOADS.safeW : LOADS.baseW + LOADS.radioW + (imaging ? LOADS.payloadW : 0)) + heaterW;

    samples.push({ tMin: t / 60, sunlit, safe, socPct: soc, solarW, loadW });
    minSoc = Math.min(minSoc, soc);

    // Battery efficiencies are illustrative (95% each way), as in CubeTwin's defaults.
    const step = batteryStep(energy, capacityWh, solarW - loadW, DT_S, 0.95, 0.95);
    if (step.unmetWh > 1e-9) powerLost = true;
    energy = step.energyWh;
    if (imaging && step.unmetWh <= 1e-9) delivered += DT_S;
  }
  // An eclipse that runs to the end of the run still counts.
  if (!wasSunlit) maxDod = Math.max(maxDod, ((eclipseStartEnergy - energy) / capacityWh) * 100);

  return {
    samples,
    orbit,
    capacityWh,
    minSocPct: minSoc,
    powerLost,
    imagingDelivered: planned > 0 ? delivered / planned : 1,
    safeEntries,
    maxDodPct: maxDod,
  };
}

export const SOC_FLOOR: Record<Level, number> = { foundation: 20, advanced: 30 };
export const REQUIRED_IMAGING: Record<Level, number> = { foundation: 0, advanced: 0.8 };
/** Faults each level's fault challenge must survive: any one for Foundation, these two together for Advanced. */
export const ADVANCED_FAULTS: FaultId[] = ["ageing", "string"];

/** Energy in and out over one orbit, before battery losses, Wh. Positive net means the design is sustainable. */
export function orbitEnergyBalance(config: EpsConfig) {
  const orbit = orbitSummary(config.altitudeKm);
  const sunH = orbit.sunlitMin / 60;
  const eclipseH = orbit.eclipseMin / 60;
  const solarScale = config.faults.includes("string") ? 0.7 : 1;
  const sunlitLoad = LOADS.baseW + LOADS.radioW + LOADS.payloadW + (config.faults.includes("heater") ? LOADS.heaterW : 0);
  const eclipseLoad = LOADS.baseW + LOADS.radioW + (config.imaging === "always" ? LOADS.payloadW : 0) + LOADS.heaterW;
  const inWh = SOLAR_SUNLIT_W[config.solar] * solarScale * sunH;
  const outWh = sunlitLoad * sunH + eclipseLoad * eclipseH;
  return { inWh, outWh, netWh: inWh - outWh, sunlitLoadW: sunlitLoad, eclipseLoadW: eclipseLoad, sunH, eclipseH };
}

export interface SurvivalCheck {
  pass: boolean;
  messages: { pass: boolean; text: string }[];
}

/**
 * Did the run survive at this level? With `faultChallenge`, the run must also
 * have the level's faults switched on (and, for Advanced, safe mode set with
 * a sensible hysteresis band and no more than two battery packs).
 */
export function checkSurvival(result: EpsResult, level: Level, opts: { faultChallenge?: boolean; config?: EpsConfig } = {}): SurvivalCheck {
  const floor = SOC_FLOOR[level];
  // Compared as displayed (whole percent), so "20%" never fails a 20% floor by a rounding hair.
  const lowest = Math.round(result.minSocPct);
  const messages: SurvivalCheck["messages"] = [];
  messages.push({
    pass: !result.powerLost && lowest >= floor,
    text: result.powerLost
      ? "The battery ran flat: some loads lost power. On a real spacecraft that could reset the computer or worse."
      : lowest >= floor
        ? `Lowest state of charge ${lowest}%, at or above the ${floor}% floor.`
        : `Lowest state of charge ${lowest}% fell below the ${floor}% floor.`,
  });
  if (REQUIRED_IMAGING[level] > 0) {
    const delivered = Math.round(result.imagingDelivered * 100);
    const ok = delivered >= REQUIRED_IMAGING[level] * 100;
    messages.push({
      pass: ok,
      text: `${delivered}% of the planned imaging time delivered${ok ? "" : `; at least ${Math.round(REQUIRED_IMAGING[level] * 100)}% is needed`}.`,
    });
  }
  if (opts.faultChallenge && opts.config) {
    const c = opts.config;
    if (level === "advanced") {
      const missing = ADVANCED_FAULTS.filter((f) => !c.faults.includes(f));
      messages.push({
        pass: missing.length === 0,
        text: missing.length === 0
          ? `Tested with ${ADVANCED_FAULTS.map((f) => FAULTS[f].name.toLowerCase()).join(" and ")} switched on together.`
          : `Switch on ${missing.map((f) => `"${FAULTS[f].name}"`).join(" and ")}: the Advanced challenge needs both faults at once.`,
      });
      messages.push({
        pass: c.cells <= ADVANCED_MAX_CELLS,
        text: c.cells <= ADVANCED_MAX_CELLS
          ? `${c.cells} battery pack${c.cells === 1 ? "" : "s"}, within the mass budget of ${ADVANCED_MAX_CELLS}.`
          : `The mass budget allows at most ${ADVANCED_MAX_CELLS} battery packs.`,
      });
      const bandOk = c.safeMode && c.safeExitPct > c.safeEnterPct;
      messages.push({
        pass: bandOk,
        text: !c.safeMode
          ? "Switch safe mode on and set its thresholds: the Advanced challenge is about mode logic as well as battery size."
          : bandOk
            ? `Safe mode enters below ${c.safeEnterPct}% and exits above ${c.safeExitPct}%: a ${c.safeExitPct - c.safeEnterPct}-point hysteresis band.`
            : "The exit threshold must be above the entry threshold, or the spacecraft will switch modes back and forth.",
      });
    } else {
      const ok = c.faults.length > 0;
      messages.push({
        pass: ok,
        text: ok
          ? `Tested with ${c.faults.map((f) => FAULTS[f].name.toLowerCase()).join(" and ")} switched on.`
          : "Switch on at least one fault and show the design still survives.",
      });
    }
  }
  return { pass: messages.every((m) => m.pass), messages };
}
