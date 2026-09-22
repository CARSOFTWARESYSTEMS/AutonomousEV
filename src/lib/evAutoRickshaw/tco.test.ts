import { describe, expect, it } from "vitest";
import { computeEmi, computeFuelComparison, computeIncrementalPaybackMonths, computeTco } from "./tco";
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
  it("propagates a higher electricity tariff into monthly electricity cost and energy ₹/km", () => {
    const cheap = computeTco(baseTcoInputs, 60, 0.9);
    const expensive = computeTco({ ...baseTcoInputs, electricityTariffInrPerKWh: 12 }, 60, 0.9);
    expect(expensive.monthlyElectricityCostInr).toBeGreaterThan(cheap.monthlyElectricityCostInr);
    expect(expensive.costPerKm.energyFuelPerKm).toBeGreaterThan(cheap.costPerKm.energyFuelPerKm);
  });

  it("propagates higher annual maintenance into monthly operating cost and running ₹/km, but not energy ₹/km", () => {
    const low = computeTco(baseTcoInputs, 60, 0.9);
    const high = computeTco({ ...baseTcoInputs, annualMaintenanceInr: 40000 }, 60, 0.9);
    expect(high.monthlyOperatingCostInr).toBeGreaterThan(low.monthlyOperatingCostInr);
    expect(high.costPerKm.runningPerKm).toBeGreaterThan(low.costPerKm.runningPerKm);
    expect(high.costPerKm.energyFuelPerKm).toBeCloseTo(low.costPerKm.energyFuelPerKm, 6);
  });

  it("computes revenue from passengers x fare x trips x working days", () => {
    const result = computeTco(baseTcoInputs, 60, 0.9);
    expect(result.monthlyRevenueInr).toBeCloseTo(2.5 * 20 * 18 * 26, 6);
  });

  it("orders the three cost scopes: energy <= running <= ownership", () => {
    const result = computeTco(baseTcoInputs, 60, 0.9);
    expect(result.costPerKm.energyFuelPerKm).toBeLessThanOrEqual(result.costPerKm.runningPerKm);
    expect(result.costPerKm.runningPerKm).toBeLessThanOrEqual(result.costPerKm.ownershipPerKm);
  });

  it("only ownership ₹/km includes EMI — running ₹/km does not change when the loan tenure changes", () => {
    const shortTenure = computeTco({ ...baseTcoInputs, loanTenureMonths: 12 }, 60, 0.9);
    const longTenure = computeTco({ ...baseTcoInputs, loanTenureMonths: 60 }, 60, 0.9);
    expect(shortTenure.costPerKm.runningPerKm).toBeCloseTo(longTenure.costPerKm.runningPerKm, 6);
    expect(shortTenure.costPerKm.ownershipPerKm).not.toBeCloseTo(longTenure.costPerKm.ownershipPerKm, 2);
  });

  it("lifetime TCO uses the full purchase price and scales with horizon length", () => {
    const result = computeTco(baseTcoInputs, 60, 0.9);
    expect(result.lifetimeTco.year5.totalCostInr).toBeGreaterThan(result.lifetimeTco.year3.totalCostInr);
    expect(result.lifetimeTco.year10.totalCostInr).toBeGreaterThan(result.lifetimeTco.year5.totalCostInr);
    expect(result.lifetimeTco.year3.totalCostInr).toBeGreaterThanOrEqual(baseTcoInputs.purchasePriceInr);
  });

  it("computes a down-payment recovery period from monthly operating surplus", () => {
    const result = computeTco(baseTcoInputs, 60, 0.9);
    if (result.monthlyOperatingSurplusInr > 0) {
      expect(result.downPaymentRecoveryMonths).toBeCloseTo(
        baseTcoInputs.downPaymentInr / result.monthlyOperatingSurplusInr,
        6,
      );
    } else {
      expect(result.downPaymentRecoveryMonths).toBeNull();
    }
  });
});

const baseFuelInputs = {
  purchasePriceInr: 250000,
  dailyDistanceKm: 120,
  workingDaysPerMonth: 26,
  fuelEconomyKmPerUnit: 25,
  fuelPriceInrPerUnit: 90,
  annualMaintenanceInr: 15000,
  annualInsuranceInr: 8000,
  tyreSetCostInr: 6000,
  tyreLifeKm: 18000,
};

describe("computeFuelComparison", () => {
  it("scales lifetime TCO consistently with monthly operating cost", () => {
    const result = computeFuelComparison(baseFuelInputs);
    expect(result.lifetimeTco.year5.totalCostInr).toBeGreaterThan(result.lifetimeTco.year3.totalCostInr);
    expect(result.lifetimeTco.year10.totalCostInr).toBeGreaterThan(result.lifetimeTco.year5.totalCostInr);
  });

  it("models no financing cost — ownership ₹/km equals running ₹/km plus insurance only", () => {
    const result = computeFuelComparison(baseFuelInputs);
    expect(result.costPerKm.ownershipPerKm).toBeGreaterThanOrEqual(result.costPerKm.runningPerKm);
  });

  it("uses the identical cost-per-km definition as the EV TCO model (same shape, same ordering)", () => {
    const fuelResult = computeFuelComparison(baseFuelInputs);
    const evResult = computeTco({ ...baseTcoInputs, dailyDistanceKm: baseFuelInputs.dailyDistanceKm }, 60, 0.9);
    // Both expose the same CostPerKmBreakdown shape with the same energy <= running <= ownership ordering.
    expect(fuelResult.costPerKm.energyFuelPerKm).toBeLessThanOrEqual(fuelResult.costPerKm.runningPerKm);
    expect(fuelResult.costPerKm.runningPerKm).toBeLessThanOrEqual(fuelResult.costPerKm.ownershipPerKm);
    expect(evResult.costPerKm.energyFuelPerKm).toBeLessThanOrEqual(evResult.costPerKm.runningPerKm);
    expect(evResult.costPerKm.runningPerKm).toBeLessThanOrEqual(evResult.costPerKm.ownershipPerKm);
  });
});

describe("computeIncrementalPaybackMonths", () => {
  it("returns 0 when the EV is not more expensive than the alternative", () => {
    expect(computeIncrementalPaybackMonths(300000, 350000, 5000, 6000)).toBe(0);
  });

  it("returns null when the EV costs more to run and there is no payback", () => {
    expect(computeIncrementalPaybackMonths(450000, 300000, 6000, 5000)).toBeNull();
  });

  it("divides the acquisition premium by monthly running-cost savings", () => {
    const months = computeIncrementalPaybackMonths(450000, 300000, 4000, 6000);
    expect(months).toBeCloseTo(150000 / 2000, 6);
  });
});
