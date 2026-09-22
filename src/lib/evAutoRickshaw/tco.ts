import type { EmiResult, TcoInputs, TcoResult } from "./types";

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

  const monthlyOperatingCostInr =
    emi.monthlyEmiInr +
    monthlyElectricityCostInr +
    monthlyMaintenanceInr +
    monthlyInsuranceInr +
    monthlyTyreProvisionInr;

  const monthlyRevenueInr =
    inputs.avgPassengersPerTrip * inputs.avgFarePerPassengerInr * inputs.tripsPerDay * inputs.workingDaysPerMonth;

  const monthlyOperatingSurplusInr = monthlyRevenueInr - monthlyOperatingCostInr;

  const costPerKmInr = monthlyKm > 0 ? monthlyOperatingCostInr / monthlyKm : 0;
  const costPerPassengerKmInr =
    inputs.avgPassengersPerTrip > 0 ? costPerKmInr / inputs.avgPassengersPerTrip : costPerKmInr;

  const paybackMonths =
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
    costPerKmInr,
    costPerPassengerKmInr,
    paybackMonths,
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
}

export interface FuelComparisonResult {
  dailyFuelCostInr: number;
  monthlyFuelCostInr: number;
  monthlyOperatingCostInr: number;
  costPerKmInr: number;
  tcoYear3Inr: number;
  tcoYear5Inr: number;
  tcoYear10Inr: number;
}

export function computeFuelComparison(inputs: FuelComparisonInputs): FuelComparisonResult {
  const dailyFuelCostInr = (inputs.dailyDistanceKm / inputs.fuelEconomyKmPerUnit) * inputs.fuelPriceInrPerUnit;
  const monthlyFuelCostInr = dailyFuelCostInr * inputs.workingDaysPerMonth;
  const monthlyMaintenanceInr = inputs.annualMaintenanceInr / 12;
  const monthlyInsuranceInr = inputs.annualInsuranceInr / 12;
  const monthlyOperatingCostInr = monthlyFuelCostInr + monthlyMaintenanceInr + monthlyInsuranceInr;

  const monthlyKm = inputs.dailyDistanceKm * inputs.workingDaysPerMonth;
  const costPerKmInr = monthlyKm > 0 ? monthlyOperatingCostInr / monthlyKm : 0;

  const tco = (years: number) => inputs.purchasePriceInr + monthlyOperatingCostInr * 12 * years;

  return {
    dailyFuelCostInr,
    monthlyFuelCostInr,
    monthlyOperatingCostInr,
    costPerKmInr,
    tcoYear3Inr: tco(3),
    tcoYear5Inr: tco(5),
    tcoYear10Inr: tco(10),
  };
}

export function computeEvTco(
  purchasePriceInr: number,
  monthlyOperatingCostExEmiInr: number,
  years: number,
): number {
  return purchasePriceInr + monthlyOperatingCostExEmiInr * 12 * years;
}
