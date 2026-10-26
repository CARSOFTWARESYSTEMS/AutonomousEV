// A unit-economics sandbox. It compares, for one customer, what winning them
// costs with the gross profit they bring. No benchmark values are built in.

export interface UnitInputs {
  /** Customer acquisition cost, in rupees: everything spent to win one customer. */
  cac: number;
  /** Average contract value per year, in rupees. */
  acv: number;
  /** Gross margin, %. */
  grossMargin: number;
  /** Customers who renew each year, %. */
  renewal: number;
  /** Yearly growth in what a renewing customer spends, %. */
  expansion: number;
  /** Months from first contact to signed contract. */
  salesCycle: number;
}

export interface UnitResult {
  grossProfitPerYear: number;
  /** Months of gross profit to recover the acquisition cost. */
  paybackMonths: number;
  /** Gross profit over the expected life, capped at ten years. */
  lifetimeValue: number;
  /** Expected customer years, capped at ten. */
  expectedYears: number;
  ratio: number;
  verdict: "loses" | "covers" | "unknown";
}

export const EXAMPLE_UNIT_INPUTS: UnitInputs = { cac: 60000, acv: 150000, grossMargin: 70, renewal: 75, expansion: 5, salesCycle: 4 };

const HORIZON = 10;

export function calculateUnitEconomics(input: UnitInputs): UnitResult {
  const cac = Math.max(0, input.cac || 0);
  const grossProfitPerYear = Math.max(0, input.acv || 0) * Math.min(100, Math.max(0, input.grossMargin || 0)) / 100;
  const renewal = Math.min(100, Math.max(0, input.renewal || 0)) / 100;
  const growth = Math.max(0, input.expansion || 0) / 100;

  // Year 1 is always paid; each later year is paid with the probability of
  // having renewed every year so far, and grows with expansion.
  let lifetimeValue = 0;
  let expectedYears = 0;
  for (let year = 0; year < HORIZON; year++) {
    const stillCustomer = renewal ** year;
    expectedYears += stillCustomer;
    lifetimeValue += grossProfitPerYear * (1 + growth) ** year * stillCustomer;
  }

  const ratio = cac > 0 ? lifetimeValue / cac : Infinity;
  return {
    grossProfitPerYear,
    paybackMonths: grossProfitPerYear > 0 ? cac / (grossProfitPerYear / 12) : Infinity,
    lifetimeValue,
    expectedYears,
    ratio,
    verdict: grossProfitPerYear <= 0 ? "unknown" : lifetimeValue < cac ? "loses" : "covers",
  };
}
