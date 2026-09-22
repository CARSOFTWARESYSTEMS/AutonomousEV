import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "./defaults";
import { runSimulation } from "./engine";

/**
 * Hero "Concept Engineering Target" chips must never be hand-typed numbers —
 * that drifts the moment the sizing model changes (this happened once
 * already: a hardcoded "10-11.5 kWh" chip survived a reserve-margin tuning
 * pass that moved the actual default to 13 kWh). Instead, derive a display
 * band directly from the same runSimulation() every other consumer calls,
 * so the hero can never fall out of sync with the engine again.
 */
export interface HeroTargets {
  batteryKWhLow: number;
  batteryKWhHigh: number;
  rangeKmLow: number;
  rangeKmHigh: number;
  priceInrLow: number;
  priceInrHigh: number;
}

function band(value: number, fraction: number): [number, number] {
  return [value * (1 - fraction), value * (1 + fraction)];
}

export function computeHeroTargets(): HeroTargets {
  const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);

  const [batteryKWhLow, batteryKWhHigh] = band(result.battery.capacityKWh, 0.1);
  const [rangeKmLow, rangeKmHigh] = band(result.range.typicalKm, 0.08);
  const [priceInrLow, priceInrHigh] = band(result.cost.sellingPriceInr, 0.08);

  return { batteryKWhLow, batteryKWhHigh, rangeKmLow, rangeKmHigh, priceInrLow, priceInrHigh };
}
