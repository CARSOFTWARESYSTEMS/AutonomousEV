// Revenue math, worked backwards from a target: how many customers,
// proposals, qualified opportunities, meetings and outreach it takes.
// Every rate is the user's own assumption; none is hard-coded as truth.

export interface RevenueMathInputs {
  /** Annual revenue target, in rupees. */
  target: number;
  /** Average contract value, in rupees. */
  acv: number;
  /** Qualified opportunity → won, %. */
  winRate: number;
  /** Proposal → won, %. */
  proposalWinRate: number;
  /** Meeting → qualified opportunity, %. */
  meetingToQualified: number;
  /** Outreach → meeting, %. */
  outreachToMeeting: number;
}

export interface RevenueMathResult {
  customers: number;
  proposals: number;
  qualified: number;
  meetings: number;
  outreach: number;
  /** Required Pipeline = Revenue Target / Expected Win Rate. */
  requiredPipeline: number;
  /** How many times the target the qualified pipeline has to be. */
  coverage: number;
  /** Problems with the inputs, in plain words. Results are still shown. */
  warnings: string[];
}

/** Example inputs, to be replaced with your own measured rates. */
export const EXAMPLE_REVENUE_INPUTS: RevenueMathInputs = {
  target: 3000000,
  acv: 150000,
  winRate: 20,
  proposalWinRate: 40,
  meetingToQualified: 30,
  outreachToMeeting: 8,
};

const rate = (value: number) => (Number.isFinite(value) && value > 0 ? Math.min(value, 100) / 100 : 0);
const need = (count: number, conversion: number) => (conversion > 0 ? Math.ceil(count / conversion - 1e-9) : Infinity);

export function calculateRevenueMath(input: RevenueMathInputs): RevenueMathResult {
  const warnings: string[] = [];
  const target = Math.max(0, input.target || 0);
  const acv = Math.max(0, input.acv || 0);
  const win = rate(input.winRate);
  const proposalWin = rate(input.proposalWinRate);
  const meetingToQualified = rate(input.meetingToQualified);
  const outreachToMeeting = rate(input.outreachToMeeting);

  if (acv <= 0) warnings.push("Enter an average contract value above zero.");
  if ([win, proposalWin, meetingToQualified, outreachToMeeting].some((r) => r === 0)) warnings.push("Every conversion rate must be above 0%.");
  if (win > proposalWin && proposalWin > 0) warnings.push("The win rate from qualified opportunities cannot be higher than the proposal-to-win rate: every win passes through a proposal.");

  const customers = acv > 0 ? need(target, acv) : Infinity;
  const proposals = need(customers, proposalWin);
  const qualified = need(customers, win);
  const meetings = need(qualified, meetingToQualified);
  const outreach = need(meetings, outreachToMeeting);

  return {
    customers,
    proposals,
    qualified,
    meetings,
    outreach,
    requiredPipeline: win > 0 ? target / win : Infinity,
    coverage: win > 0 ? 1 / win : Infinity,
    warnings,
  };
}
