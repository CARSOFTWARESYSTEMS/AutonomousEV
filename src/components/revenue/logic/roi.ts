// The ROI estimate: ranges from customer-supplied inputs, never a promise.
// Time reduction applies to preparation hours and, if the user sets it, to
// rework; review stays, because a person still reviews every record.

export interface RoiInputs {
  faisPerMonth: number;
  drawingsPerFai: number;
  /** Preparation hours per drawing: ballooning, characteristic table, Form 3. */
  prepHours: number;
  /** Review hours per FAI. */
  reviewHours: number;
  /** Rework hours per FAI (returned or corrected packages). */
  reworkHours: number;
  /** Loaded engineering cost per hour, in rupees. */
  hourlyCost: number;
  /** Product cost per year, in rupees. */
  annualCost: number;
  /** One-off pilot cost, in rupees. */
  pilotCost: number;
}

export interface Scenario {
  id: "conservative" | "expected" | "optimistic";
  label: string;
  /** Percentage of preparation time saved. */
  prepReduction: number;
  /** Percentage of rework time avoided. */
  reworkReduction: number;
}

export interface ScenarioResult {
  scenario: Scenario;
  hoursSaved: number;
  annualValue: number;
  /** Value less first-year costs (product and pilot). */
  netFirstYear: number;
  /** Months to recover first-year costs; Infinity when there is no value. */
  paybackMonths: number;
  /** (value − cost) / cost, as a percentage; null when nothing is spent. */
  roiPercent: number | null;
}

export interface RoiResult {
  annualFais: number;
  currentHours: number;
  currentCost: number;
  scenarios: ScenarioResult[];
  /** The expected scenario's annual value at half and one-and-a-half times the FAI volume. */
  sensitivity: { label: string; annualValue: number }[];
}

/**
 * Placeholder reductions, deliberately modest. They are there to be replaced
 * with the customer's estimate and then with pilot measurements.
 */
export const DEFAULT_SCENARIOS: readonly Scenario[] = [
  { id: "conservative", label: "Conservative", prepReduction: 10, reworkReduction: 0 },
  { id: "expected", label: "Expected", prepReduction: 20, reworkReduction: 10 },
  { id: "optimistic", label: "Optimistic", prepReduction: 35, reworkReduction: 20 },
];

/** Example inputs for a fictional MSME, to be replaced with the customer's numbers. */
export const EXAMPLE_INPUTS: RoiInputs = {
  faisPerMonth: 6,
  drawingsPerFai: 1,
  prepHours: 6,
  reviewHours: 1.5,
  reworkHours: 1,
  hourlyCost: 650,
  annualCost: 50000,
  pilotCost: 0,
};

const nonNegative = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const pct = (value: number) => Math.min(100, nonNegative(value)) / 100;

export function calculateRoi(raw: RoiInputs, scenarios: readonly Scenario[] = DEFAULT_SCENARIOS): RoiResult {
  const input = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, nonNegative(value)])) as unknown as RoiInputs;
  const annualFais = input.faisPerMonth * 12;
  const prepPerYear = annualFais * input.drawingsPerFai * input.prepHours;
  const reworkPerYear = annualFais * input.reworkHours;
  const currentHours = prepPerYear + annualFais * input.reviewHours + reworkPerYear;
  const firstYearCost = input.annualCost + input.pilotCost;

  const valueFor = (scenario: Scenario, volume = 1) => (prepPerYear * pct(scenario.prepReduction) + reworkPerYear * pct(scenario.reworkReduction)) * volume;

  const results = scenarios.map((scenario): ScenarioResult => {
    const hoursSaved = valueFor(scenario);
    const annualValue = hoursSaved * input.hourlyCost;
    const monthlyValue = annualValue / 12;
    return {
      scenario,
      hoursSaved,
      annualValue,
      netFirstYear: annualValue - firstYearCost,
      paybackMonths: monthlyValue > 0 ? firstYearCost / monthlyValue : Infinity,
      roiPercent: firstYearCost > 0 ? ((annualValue - firstYearCost) / firstYearCost) * 100 : null,
    };
  });

  const expected = scenarios.find((scenario) => scenario.id === "expected") ?? scenarios[0];
  return {
    annualFais,
    currentHours,
    currentCost: currentHours * input.hourlyCost,
    scenarios: results,
    sensitivity: [
      { label: "Half the FAI volume", annualValue: valueFor(expected, 0.5) * input.hourlyCost },
      { label: "As entered", annualValue: valueFor(expected) * input.hourlyCost },
      { label: "1.5× the FAI volume", annualValue: valueFor(expected, 1.5) * input.hourlyCost },
    ],
  };
}

export const ROI_DISCLAIMER =
  "Estimates depend on customer-provided inputs and measured workflow performance. They are not guaranteed savings.";
