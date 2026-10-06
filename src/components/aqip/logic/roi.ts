// The arithmetic behind the ROI calculator. Pure, so it can be tested without a browser.

export interface RoiInputs {
  faisPerMonth: number;
  characteristicsPerFai: number;
  hoursPerFai: number;
  costPerHour: number;
  /** Expected reduction in FAI effort, as a percentage from 0 to 100. */
  timeReductionPct: number;
  reworkCostPerYear: number;
  softwareCostPerYear: number;
}

/** Illustrative assumptions only: not benchmarks, and not results from any customer. */
export const ROI_DEFAULTS: RoiInputs = {
  faisPerMonth: 8,
  characteristicsPerFai: 150,
  hoursPerFai: 16,
  costPerHour: 900,
  timeReductionPct: 40,
  reworkCostPerYear: 300000,
  softwareCostPerYear: 500000,
};

export interface RoiResult {
  annualFais: number;
  annualCharacteristics: number;
  annualHours: number;
  annualCost: number;
  hoursSaved: number;
  costSaved: number;
  /** Months for the saving to cover the annual software cost; null when it never does. */
  paybackMonths: number | null;
}

const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export function computeRoi(inputs: RoiInputs): RoiResult {
  const fais = positive(inputs.faisPerMonth) * 12;
  const reduction = Math.min(positive(inputs.timeReductionPct), 100) / 100;
  const annualHours = fais * positive(inputs.hoursPerFai);
  const annualCost = annualHours * positive(inputs.costPerHour);
  const hoursSaved = annualHours * reduction;
  // The same expected reduction is applied to rework and rejection cost: a stated simplification.
  const costSaved = hoursSaved * positive(inputs.costPerHour) + positive(inputs.reworkCostPerYear) * reduction;
  const software = positive(inputs.softwareCostPerYear);
  return {
    annualFais: fais,
    annualCharacteristics: fais * positive(inputs.characteristicsPerFai),
    annualHours,
    annualCost,
    hoursSaved,
    costSaved,
    paybackMonths: costSaved > 0 ? software / (costSaved / 12) : null,
  };
}
