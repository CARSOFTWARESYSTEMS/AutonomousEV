export type DailyDutyScenarioLabel = "Favourable" | "Typical" | "Severe";

export interface DailyDutyScenario {
  label: DailyDutyScenarioLabel;
  whPerKm: number;
  startSocPct: number;
  consumedSocPct: number;
  endOfDaySocPct: number;
  /** Additional km still drivable at end-of-day SOC before hitting the operating floor. */
  remainingRangeKm: number;
  /** dailyDistance vs. achievable range in this scenario — negative means the day's distance cannot be completed. */
  rangeMarginKm: number;
}

const DEFAULT_START_SOC_PCT = 100;
const DEFAULT_MIN_OPERATING_SOC_PCT = 10;
/** Additional conservative derating applied only to the Severe scenario, on top of full physical load — represents cold weather, aggressive driving and accessory cycling not otherwise modelled. */
const SEVERE_EXTRA_DERATE_FRACTION = 0.1;

/**
 * Daily Energy Journey: Start SOC -> today's driving -> End-of-Day SOC and
 * remaining range reserve, evaluated across Favourable / Typical / Severe
 * duty scenarios. This is a planning illustration built from the same
 * energy-consumption figures the rest of the simulator already computes
 * (light/typical/full-load Wh/km) — it does not claim statistical
 * confidence from field data.
 */
export function computeDailyDutyScenarios(
  dailyDistanceKm: number,
  capacityKWh: number,
  favourableWhPerKm: number,
  typicalWhPerKm: number,
  severeBaseWhPerKm: number,
  startSocPct: number = DEFAULT_START_SOC_PCT,
  minOperatingSocPct: number = DEFAULT_MIN_OPERATING_SOC_PCT,
): DailyDutyScenario[] {
  const nameplateWh = capacityKWh * 1000;

  const build = (label: DailyDutyScenarioLabel, whPerKm: number): DailyDutyScenario => {
    const consumedWh = dailyDistanceKm * whPerKm;
    const consumedSocPct = nameplateWh > 0 ? (consumedWh / nameplateWh) * 100 : 0;
    const endOfDaySocPct = startSocPct - consumedSocPct;

    const usableSocAboveFloorPct = Math.max(0, endOfDaySocPct - minOperatingSocPct);
    const remainingRangeKm = whPerKm > 0 ? (usableSocAboveFloorPct / 100) * nameplateWh / whPerKm : 0;

    const achievableRangeKm = whPerKm > 0 ? ((startSocPct - minOperatingSocPct) / 100) * nameplateWh / whPerKm : 0;
    const rangeMarginKm = achievableRangeKm - dailyDistanceKm;

    return { label, whPerKm, startSocPct, consumedSocPct, endOfDaySocPct, remainingRangeKm, rangeMarginKm };
  };

  return [
    build("Favourable", favourableWhPerKm),
    build("Typical", typicalWhPerKm),
    build("Severe", severeBaseWhPerKm * (1 + SEVERE_EXTRA_DERATE_FRACTION)),
  ];
}

export function classifyRangeMargin(rangeMarginKm: number, tightThresholdKm: number = 15): "shortfall" | "tight" | "comfortable" {
  if (rangeMarginKm < 0) return "shortfall";
  if (rangeMarginKm < tightThresholdKm) return "tight";
  return "comfortable";
}
