import { describe, expect, it } from "vitest";
import { computeEmi, computeFuelComparison, computeTco } from "./tco";
import type { TcoInputs } from "./types";

describe("computeEmi", () => {
  it("fully amortizes the loan to zero over the tenure at the computed EMI", () => {
    const loanAmountInr = 300000;
    const annualInterestRatePct = 13;
    const tenureMonths = 36;
    const { monthlyEmiInr } = computeEmi(loanAmountInr, annualInterestRatePct, tenureMonths);

    const monthlyRate = annualInterestRatePct / 100 / 12;
    let balance = loanAmountInr;
    for (let month = 0; month < tenureMonths; month++) {
      balance = balance * (1 + monthlyRate) - monthlyEmiInr;
    }
    expect(Math.abs(balance)).toBeLessThan(1); // amortizes to ~0 within a rupee
  });

  it("reduces to a simple even split when interest is zero", () => {
    const { monthlyEmiInr } = computeEmi(120000, 0, 24);
    expect(monthlyEmiInr).toBeCloseTo(5000, 6);
  });

  it("computes total interest as total payable minus principal", () => {
    const result = computeEmi(300000, 13, 36);
    expect(result.totalInterestInr).toBeCloseTo(result.totalPayableInr - result.loanAmountInr, 6);
  });
});

const baseTcoInputs: TcoInputs = {
  purchasePriceInr: 425000,
  downPaymentInr: 60000,
  loanInterestRatePct: 13,
  loanTenureMonths: 36,
  dailyDistanceKm: 120,
  workingDaysPerMonth: 26,
  electricityTariffInrPerKWh: 8,
  avgPassengersPerTrip: 2.5,
  avgFarePerPassengerInr: 20,
  tripsPerDay: 18,
  annualMaintenanceInr: 12000,
  annualInsuranceInr: 9000,
  tyreSetCostInr: 6000,
  tyreLifeKm: 18000,
};

describe("computeTco", () => {
  it("propagates a higher electricity tariff into monthly electricity cost", () => {
    const cheap = computeTco(baseTcoInputs, 60, 0.9);
    const expensive = computeTco({ ...baseTcoInputs, electricityTariffInrPerKWh: 12 }, 60, 0.9);
    expect(expensive.monthlyElectricityCostInr).toBeGreaterThan(cheap.monthlyElectricityCostInr);
  });

  it("propagates higher annual maintenance into monthly operating cost", () => {
    const low = computeTco(baseTcoInputs, 60, 0.9);
    const high = computeTco({ ...baseTcoInputs, annualMaintenanceInr: 40000 }, 60, 0.9);
    expect(high.monthlyOperatingCostInr).toBeGreaterThan(low.monthlyOperatingCostInr);
  });

  it("computes revenue from passengers x fare x trips x working days", () => {
    const result = computeTco(baseTcoInputs, 60, 0.9);
    expect(result.monthlyRevenueInr).toBeCloseTo(2.5 * 20 * 18 * 26, 6);
  });
});

describe("computeFuelComparison", () => {
  it("scales 3/5/10-year TCO consistently with monthly operating cost", () => {
    const result = computeFuelComparison({
      purchasePriceInr: 250000,
      dailyDistanceKm: 120,
      workingDaysPerMonth: 26,
      fuelEconomyKmPerUnit: 25,
      fuelPriceInrPerUnit: 90,
      annualMaintenanceInr: 15000,
      annualInsuranceInr: 8000,
    });
    expect(result.tcoYear5Inr).toBeGreaterThan(result.tcoYear3Inr);
    expect(result.tcoYear10Inr).toBeGreaterThan(result.tcoYear5Inr);
  });
});
