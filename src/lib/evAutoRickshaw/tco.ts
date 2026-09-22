import type { CostPerKmBreakdown, EmiResult, LifetimeTco, LifetimeTcoByYear, TcoInputs, TcoResult } from "./types";

/** Standard amortizing-loan EMI calculation. */
export function computeEmi(
  loanAmountInr: number,
  annualInterestRatePct: number,
  tenureMonths: number,
): EmiResult {
  const monthlyRate = annualInterestRatePct / 100 / 12;
  let monthlyEmiInr: number;

  if (monthlyRate === 0) {
    monthlyEmiInr = loanAmountInr / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEmiInr = (loanAmountInr * monthlyRate * factor) / (factor - 1);
  }

  const totalPayableInr = monthlyEmiInr * tenureMonths;
  const totalInterestInr = totalPayableInr - loanAmountInr;

  return { loanAmountInr, monthlyEmiInr, totalInterestInr, totalPayableInr };
}

/**
 * Same three ₹/km scopes used for EV, CNG and petrol (see CostPerKmBreakdown)
 * so none of them are ever compared on inconsistent bases.
 */
export function buildCostPerKmBreakdown(
  energyFuelPerMonthInr: number,
  maintenancePerMonthInr: number,
  tyresPerMonthInr: number,
  insurancePerMonthInr: number,
  emiPerMonthInr: number,
  monthlyKm: number,
): CostPerKmBreakdown {
  const energyFuelPerKm = monthlyKm > 0 ? energyFuelPerMonthInr / monthlyKm : 0;
  const runningPerMonthInr = energyFuelPerMonthInr + maintenancePerMonthInr + tyresPerMonthInr;
  const runningPerKm = monthlyKm > 0 ? runningPerMonthInr / monthlyKm : 0;
  const ownershipPerMonthInr = runningPerMonthInr + insurancePerMonthInr + emiPerMonthInr;
  const ownershipPerKm = monthlyKm > 0 ? ownershipPerMonthInr / monthlyKm : 0;
  return { energyFuelPerKm, runningPerKm, ownershipPerKm };
}

/**
 * Lifetime TCO ₹/km uses the full purchase price (financing-neutral — EMI is
 * just a cash-flow timing mechanism for the same price, so adding both would
 * double-count) plus running + insurance costs over the selected horizon.
 */
export function buildLifetimeTco(
  purchasePriceInr: number,
  nonFinanceMonthlyCostInr: number,
  monthlyKm: number,
  years: number,
): LifetimeTco {
  const totalCostInr = purchasePriceInr + nonFinanceMonthlyCostInr * 12 * years;
  const totalKm = monthlyKm * 12 * years;
  return { totalCostInr, totalKm, perKm: totalKm > 0 ? totalCostInr / totalKm : 0 };
}

function buildLifetimeTcoByYear(
  purchasePriceInr: number,
  nonFinanceMonthlyCostInr: number,
  monthlyKm: number,
): LifetimeTcoByYear {
  return {
    year3: buildLifetimeTco(purchasePriceInr, nonFinanceMonthlyCostInr, monthlyKm, 3),
    year5: buildLifetimeTco(purchasePriceInr, nonFinanceMonthlyCostInr, monthlyKm, 5),
    year10: buildLifetimeTco(purchasePriceInr, nonFinanceMonthlyCostInr, monthlyKm, 10),
  };
}

export function computeTco(inputs: TcoInputs, whPerKm: number, chargerEfficiency: number): TcoResult {
  const loanAmountInr = Math.max(0, inputs.purchasePriceInr - inputs.downPaymentInr);
  const emi = computeEmi(loanAmountInr, inputs.loanInterestRatePct, inputs.loanTenureMonths);

  const dailyEnergyKWh = (inputs.dailyDistanceKm * whPerKm) / 1000 / chargerEfficiency;
  const dailyElectricityCostInr = dailyEnergyKWh * inputs.electricityTariffInrPerKWh;
  const monthlyElectricityCostInr = dailyElectricityCostInr * inputs.workingDaysPerMonth;

  const monthlyMaintenanceInr = inputs.annualMaintenanceInr / 12;
  const monthlyInsuranceInr = inputs.annualInsuranceInr / 12;

  const monthlyKm = inputs.dailyDistanceKm * inputs.workingDaysPerMonth;
  const monthlyTyreProvisionInr =
    inputs.tyreLifeKm > 0 ? (inputs.tyreSetCostInr / inputs.tyreLifeKm) * monthlyKm : 0;

  const nonFinanceMonthlyCostInr =
    monthlyElectricityCostInr + monthlyMaintenanceInr + monthlyInsuranceInr + monthlyTyreProvisionInr;
  const monthlyOperatingCostInr = emi.monthlyEmiInr + nonFinanceMonthlyCostInr;

  const monthlyRevenueInr =
    inputs.avgPassengersPerTrip * inputs.avgFarePerPassengerInr * inputs.tripsPerDay * inputs.workingDaysPerMonth;

  const monthlyOperatingSurplusInr = monthlyRevenueInr - monthlyOperatingCostInr;

  const costPerKm = buildCostPerKmBreakdown(
    monthlyElectricityCostInr,
    monthlyMaintenanceInr,
    monthlyTyreProvisionInr,
    monthlyInsuranceInr,
    emi.monthlyEmiInr,
    monthlyKm,
  );
  const ownershipCostPerPassengerKmInr =
    inputs.avgPassengersPerTrip > 0 ? costPerKm.ownershipPerKm / inputs.avgPassengersPerTrip : costPerKm.ownershipPerKm;

  const lifetimeTco = buildLifetimeTcoByYear(inputs.purchasePriceInr, nonFinanceMonthlyCostInr, monthlyKm);

  const downPaymentRecoveryMonths =
    monthlyOperatingSurplusInr > 0 ? inputs.downPaymentInr / monthlyOperatingSurplusInr : null;

  return {
    emi,
    dailyElectricityCostInr,
    monthlyElectricityCostInr,
    monthlyMaintenanceInr,
    monthlyInsuranceInr,
    monthlyTyreProvisionInr,
    monthlyOperatingCostInr,
    monthlyRevenueInr,
    monthlyOperatingSurplusInr,
    costPerKm,
    ownershipCostPerPassengerKmInr,
    lifetimeTco,
    downPaymentRecoveryMonths,
  };
}

export interface FuelComparisonInputs {
  purchasePriceInr: number;
  dailyDistanceKm: number;
  workingDaysPerMonth: number;
  fuelEconomyKmPerUnit: number;
  fuelPriceInrPerUnit: number;
  annualMaintenanceInr: number;
  annualInsuranceInr: number;
  tyreSetCostInr: number;
  tyreLifeKm: number;
}

export interface FuelComparisonResult {
  dailyFuelCostInr: number;
  monthlyFuelCostInr: number;
  /** Non-finance monthly cost (fuel + maintenance + insurance + tyres) — no EMI is modelled for these cash-purchase comparison vehicles. */
  monthlyOperatingCostInr: number;
  costPerKm: CostPerKmBreakdown;
  lifetimeTco: LifetimeTcoByYear;
}

export function computeFuelComparison(inputs: FuelComparisonInputs): FuelComparisonResult {
  const dailyFuelCostInr = (inputs.dailyDistanceKm / inputs.fuelEconomyKmPerUnit) * inputs.fuelPriceInrPerUnit;
  const monthlyFuelCostInr = dailyFuelCostInr * inputs.workingDaysPerMonth;
  const monthlyMaintenanceInr = inputs.annualMaintenanceInr / 12;
  const monthlyInsuranceInr = inputs.annualInsuranceInr / 12;

  const monthlyKm = inputs.dailyDistanceKm * inputs.workingDaysPerMonth;
  const monthlyTyreProvisionInr =
    inputs.tyreLifeKm > 0 ? (inputs.tyreSetCostInr / inputs.tyreLifeKm) * monthlyKm : 0;

  const monthlyOperatingCostInr = monthlyFuelCostInr + monthlyMaintenanceInr + monthlyInsuranceInr + monthlyTyreProvisionInr;

  const costPerKm = buildCostPerKmBreakdown(
    monthlyFuelCostInr,
    monthlyMaintenanceInr,
    monthlyTyreProvisionInr,
    monthlyInsuranceInr,
    0, // no financing modelled for the comparison fuel vehicles (assumed cash purchase)
    monthlyKm,
  );

  const lifetimeTco = buildLifetimeTcoByYear(inputs.purchasePriceInr, monthlyOperatingCostInr, monthlyKm);

  return {
    dailyFuelCostInr,
    monthlyFuelCostInr,
    monthlyOperatingCostInr,
    costPerKm,
    lifetimeTco,
  };
}

/**
 * Incremental EV Payback vs an alternative (e.g. CNG): how long the EV's
 * higher acquisition price takes to recover from lower monthly running
 * costs. Uses "running" cost (energy/fuel + maintenance + tyres) on both
 * sides — the direct operating costs a driver actually feels — not
 * ownership cost, so it isn't distorted by different financing structures.
 * Returns null when there is no acquisition premium to recover, or when the
 * EV does not actually run cheaper (no payback occurs).
 */
export function computeIncrementalPaybackMonths(
  evPriceInr: number,
  alternativePriceInr: number,
  evMonthlyRunningInr: number,
  alternativeMonthlyRunningInr: number,
): number | null {
  const acquisitionPremiumInr = evPriceInr - alternativePriceInr;
  if (acquisitionPremiumInr <= 0) return 0;
  const monthlySavingsInr = alternativeMonthlyRunningInr - evMonthlyRunningInr;
  if (monthlySavingsInr <= 0) return null;
  return acquisitionPremiumInr / monthlySavingsInr;
}
