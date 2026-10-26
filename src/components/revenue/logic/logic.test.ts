import { describe, expect, it, vi } from "vitest";
import { BAR_NAV, BAR_OF, HEADER_NAV, PHASES, ROUTES, TOOL_LINKS, TOTAL_DAYS, UNLOCKS, WEEKS, isReviewDay, isUnlocked, phaseOf, weekOf } from "../data/framework";
import { CUSTOMER_TO_REVENUE, STEPS, STEP_PAGE_ORDER, daysOfStep, firstDayOfStep, stepOfDay, stepsOnPage } from "../data/steps";
import { MISSIONS } from "../data/missions";
import { CLAIMS } from "../data/product";
import { ACCOUNT_CRITERIA, OPPORTUNITY_CRITERIA } from "../data/scoring";
import { SYNTHETIC_ACCOUNTS, SYNTHETIC_OPPORTUNITIES } from "../data/synthetic";
import { checkClaims, CLAIM_RULES } from "./claims";
import { formatDate, formatINR, formatINRShort, parseAmount } from "./format";
import { nextOpenDay, searchMissions } from "./missions";
import { pilotCanPass } from "./pilot";
import { calculateRevenueMath, EXAMPLE_REVENUE_INPUTS } from "./revenueMath";
import { calculateRoi, DEFAULT_SCENARIOS, EXAMPLE_INPUTS } from "./roi";
import { accountFit, confidenceFor, isFullyQualified, missingQualification, opportunityScore, weightedScore, withWeights } from "./scoring";
import { calculateUnitEconomics, EXAMPLE_UNIT_INPUTS } from "./unitEconomics";

const ratingsOf = (criteria: readonly { id: string }[], value: number) => Object.fromEntries(criteria.map((c) => [c.id, value]));

describe("Indian number formatting", () => {
  it("groups rupees in lakhs and crores", () => {
    expect(formatINR(1234567)).toBe("₹12,34,567");
    expect(formatINR(-50000)).toBe("−₹50,000");
    expect(formatINRShort(450000)).toBe("₹4.5 lakh");
    expect(formatINRShort(12000000)).toBe("₹1.2 crore");
    expect(formatINRShort(60000)).toBe("₹60,000");
    expect(formatINR(Infinity)).toBe("—");
  });

  it("reads Indian-grouped input and writes Indian dates", () => {
    expect(parseAmount("₹1,20,000")).toBe(120000);
    expect(parseAmount("abc")).toBe(0);
    expect(formatDate("2026-11-04")).toBe("4 Nov 2026");
  });
});

describe("Account Fit Score", () => {
  it("shows score + confidence + evidence count, as the brief's example reads", () => {
    const ratings = { fai: 5, ad: 4, frequency: 4, pain: 4, access: 3, technical: 4, security: 3, pilot: 3, commercial: 3, reference: 3 };
    const fit = accountFit(ratings, 5);
    expect(fit.score).toBe(78);
    expect(fit.summary).toBe("78 / 100 · Medium Confidence · 5 Evidence Items");
    expect(fit.suggestedTier).toBe("A");
  });

  it("uses the suggested weights, which total 100", () => {
    expect(ACCOUNT_CRITERIA.reduce((sum, c) => sum + c.weight, 0)).toBe(100);
    expect(accountFit(ratingsOf(ACCOUNT_CRITERIA, 5), 0).score).toBe(100);
    expect(accountFit({}, 0).score).toBe(0);
  });

  it("takes confidence from evidence, not from the score", () => {
    expect(confidenceFor(0)).toBe("Low");
    expect(confidenceFor(2)).toBe("Low");
    expect(confidenceFor(3)).toBe("Medium");
    expect(confidenceFor(6)).toBe("High");
    expect(accountFit(ratingsOf(ACCOUNT_CRITERIA, 5), 1).summary).toBe("100 / 100 · Low Confidence · 1 Evidence Item");
  });

  it("is configurable: changed weights are scaled so the score stays out of 100", () => {
    const criteria = withWeights(ACCOUNT_CRITERIA, { fai: 0 });
    expect(criteria.find((c) => c.id === "fai")?.weight).toBe(0);
    // Only FAI relevance is rated, and it now carries no weight.
    expect(weightedScore(criteria, { fai: 5 })).toBe(0);
    expect(weightedScore(criteria, ratingsOf(ACCOUNT_CRITERIA, 5))).toBe(100);
    expect(accountFit({ fai: 5 }, 0, { fai: 0 }).score).toBe(0);
  });

  it("clamps ratings to 0–5", () => {
    expect(weightedScore(ACCOUNT_CRITERIA, ratingsOf(ACCOUNT_CRITERIA, 9))).toBe(100);
    expect(weightedScore(ACCOUNT_CRITERIA, ratingsOf(ACCOUNT_CRITERIA, -3))).toBe(0);
  });
});

describe("Opportunity Score", () => {
  it("classifies 80–100 High Priority, 60–79 Develop, 40–59 Nurture, below 40 Do Not Chase Yet", () => {
    expect(opportunityScore(ratingsOf(OPPORTUNITY_CRITERIA, 4)).band.label).toBe("High Priority"); // 80
    expect(opportunityScore(ratingsOf(OPPORTUNITY_CRITERIA, 3)).band.label).toBe("Develop"); // 60
    expect(opportunityScore(ratingsOf(OPPORTUNITY_CRITERIA, 2)).band.label).toBe("Nurture"); // 40
    expect(opportunityScore(ratingsOf(OPPORTUNITY_CRITERIA, 1)).band.label).toBe("Do Not Chase Yet"); // 20
  });

  it("always says why: the strongest and weakest criteria", () => {
    const score = opportunityScore({ severity: 5, frequency: 1, impact: 5, urgency: 1, access: 3, technical: 3, pilot: 3, commercial: 3 });
    expect(score.strongest).toEqual(["Problem Severity", "Economic Impact"]);
    expect(score.weakest).toContain("Frequency");
  });

  it("counts an opportunity as qualified pipeline only when all six criteria hold", () => {
    const all = { account: true, problem: true, stakeholder: true, technical: true, commercial: true, next: true };
    expect(isFullyQualified(all)).toBe(true);
    expect(missingQualification({ ...all, problem: false })).toEqual(["Validated problem"]);
    expect(isFullyQualified({})).toBe(false);
  });
});

describe("ROI calculator", () => {
  it("estimates current labour and a value range from the example inputs", () => {
    const result = calculateRoi(EXAMPLE_INPUTS);
    expect(result.annualFais).toBe(72);
    expect(result.currentHours).toBeCloseTo(612); // 432 preparation + 108 review + 72 rework
    expect(result.currentCost).toBeCloseTo(397800);
    const [conservative, expected, optimistic] = result.scenarios;
    expect(expected.hoursSaved).toBeCloseTo(93.6);
    expect(expected.annualValue).toBeCloseTo(60840);
    expect(expected.paybackMonths).toBeCloseTo(9.86, 1);
    expect(expected.roiPercent).toBeCloseTo(21.68, 1);
    expect(conservative.annualValue).toBeLessThan(expected.annualValue);
    expect(optimistic.annualValue).toBeGreaterThan(expected.annualValue);
    expect(conservative.netFirstYear).toBeLessThan(0);
  });

  it("never reduces review time, and keeps placeholder reductions modest", () => {
    const noPrep = calculateRoi({ ...EXAMPLE_INPUTS, prepHours: 0, reworkHours: 0 });
    expect(noPrep.scenarios.every((s) => s.hoursSaved === 0)).toBe(true);
    expect(Math.max(...DEFAULT_SCENARIOS.map((s) => s.prepReduction))).toBeLessThanOrEqual(35);
  });

  it("handles empty, negative and out-of-range inputs without false precision", () => {
    const empty = calculateRoi({ faisPerMonth: 0, drawingsPerFai: 0, prepHours: 0, reviewHours: 0, reworkHours: 0, hourlyCost: 0, annualCost: 0, pilotCost: 0 });
    expect(empty.scenarios[0].paybackMonths).toBe(Infinity);
    expect(empty.scenarios[0].roiPercent).toBeNull();
    const negative = calculateRoi({ ...EXAMPLE_INPUTS, faisPerMonth: -5 });
    expect(negative.currentHours).toBe(0);
    const capped = calculateRoi(EXAMPLE_INPUTS, [{ id: "expected", label: "Expected", prepReduction: 250, reworkReduction: 0 }]);
    expect(capped.scenarios[0].hoursSaved).toBeCloseTo(432);
  });

  it("includes the pilot cost in first-year cost", () => {
    const withPilot = calculateRoi({ ...EXAMPLE_INPUTS, pilotCost: 25000 });
    const without = calculateRoi(EXAMPLE_INPUTS);
    expect(withPilot.scenarios[1].netFirstYear).toBeCloseTo(without.scenarios[1].netFirstYear - 25000);
  });
});

describe("Revenue math engine", () => {
  it("works backwards from the target to outreach", () => {
    const result = calculateRevenueMath(EXAMPLE_REVENUE_INPUTS);
    expect(result.customers).toBe(20); // ₹30 lakh ÷ ₹1.5 lakh
    expect(result.proposals).toBe(50); // 20 ÷ 40%
    expect(result.qualified).toBe(100); // 20 ÷ 20%
    expect(result.meetings).toBe(334); // 100 ÷ 30%, rounded up
    expect(result.outreach).toBe(4175); // 334 ÷ 8%
    expect(result.requiredPipeline).toBe(15000000); // Required Pipeline = Revenue Target / Expected Win Rate
    expect(result.coverage).toBe(5);
    expect(result.warnings).toEqual([]);
  });

  it("warns about impossible or missing rates instead of hiding them", () => {
    expect(calculateRevenueMath({ ...EXAMPLE_REVENUE_INPUTS, winRate: 50, proposalWinRate: 40 }).warnings.join(" ")).toMatch(/cannot be higher/);
    const zero = calculateRevenueMath({ ...EXAMPLE_REVENUE_INPUTS, outreachToMeeting: 0 });
    expect(zero.outreach).toBe(Infinity);
    expect(zero.warnings.join(" ")).toMatch(/above 0%/);
    expect(calculateRevenueMath({ ...EXAMPLE_REVENUE_INPUTS, acv: 0 }).customers).toBe(Infinity);
  });
});

describe("Unit economics sandbox", () => {
  it("compares lifetime gross profit with the cost of winning a customer", () => {
    const result = calculateUnitEconomics(EXAMPLE_UNIT_INPUTS);
    expect(result.grossProfitPerYear).toBe(105000);
    expect(result.paybackMonths).toBeCloseTo(6.86, 1);
    expect(result.verdict).toBe("covers");
    const losing = calculateUnitEconomics({ ...EXAMPLE_UNIT_INPUTS, cac: 500000, renewal: 0 });
    expect(losing.expectedYears).toBe(1);
    expect(losing.lifetimeValue).toBe(105000);
    expect(losing.verdict).toBe("loses");
  });
});

describe("Claim checker", () => {
  it("flags restricted claims", () => {
    const ids = (text: string) => checkClaims(text).map((finding) => finding.rule.id);
    expect(ids("Our tool guarantees AS9102 compliance.")).toEqual(["compliance"]);
    expect(ids("We will get you certified fast.")).toContain("certification");
    expect(ids("It saves 80% of ballooning time.")).toContain("savings");
    expect(ids("AI automatically generates complete FAI reports.")).toContain("ai-everything");
    expect(ids("It recognises GD&T symbols.")).toContain("gdt");
    expect(ids("Exports in AS9102C format.")).toContain("rev-c");
    expect(ids("Only ₹2,499 per user, with a discount.")).toContain("price");
    expect(ids("Error-free reports.")).toContain("zero-error");
  });

  it("passes every verified claim and every suggested replacement", () => {
    for (const claim of CLAIMS.filter((c) => c.status === "verified")) expect(checkClaims(claim.text)).toEqual([]);
    for (const rule of CLAIM_RULES) expect(checkClaims(rule.instead)).toEqual([]);
    for (const claim of CLAIMS) if (claim.instead) expect(checkClaims(claim.instead)).toEqual([]);
  });

  it("flags every restricted and hypothesis claim in the registry", () => {
    for (const claim of CLAIMS.filter((c) => c.status === "restricted" || c.id === "rev-c" || c.id === "eighty")) expect(checkClaims(claim.text).length).toBeGreaterThan(0);
  });
});

describe("Pilot discipline", () => {
  it("cannot pass without success criteria and a baseline", () => {
    expect(pilotCanPass({ criteria: "", baseline: "" })).toBe(false);
    expect(pilotCanPass({ criteria: "Prep time per drawing down by an agreed amount", baseline: "" })).toBe(false);
    expect(pilotCanPass({ criteria: "Prep time per drawing down by an agreed amount", baseline: "6 h per drawing" })).toBe(true);
  });
});

describe("Sixty daily missions", () => {
  it("covers Day 1 to Day 60 in order, three phases of four five-day weeks", () => {
    expect(MISSIONS).toHaveLength(TOTAL_DAYS);
    expect(MISSIONS.map((m) => m.day)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1));
    expect([weekOf(5), weekOf(6), weekOf(60)]).toEqual([1, 2, 12]);
    expect([phaseOf(20).n, phaseOf(21).n, phaseOf(41).n, phaseOf(60).n]).toEqual([1, 2, 3, 3]);
  });

  it("fills the mandatory template on every day", () => {
    for (const m of MISSIONS) {
      for (const field of ["title", "key", "mission", "why", "learn", "applyFai", "next", "output"] as const) expect(m[field].trim(), `Day ${m.day} ${field}`).not.toBe("");
      expect(m.doToday.length, `Day ${m.day} do`).toBeGreaterThanOrEqual(2);
      for (const list of [m.ask, m.dont, m.evidence, m.submit, m.selfReview]) expect(list.length, `Day ${m.day}`).toBeGreaterThan(0);
      for (const tool of m.tools ?? []) expect(Object.keys(TOOL_LINKS)).toContain(tool);
    }
  });

  it("starts with the customer, their workflow and their pain; marketing comes on Day 4", () => {
    expect(MISSIONS.slice(0, 5).map((m) => m.title)).toEqual([
      "Understand the Customer",
      "Understand the FAI Workflow",
      "Find Customer Pain",
      "What Is B2B Marketing?",
      "Design the Problem Validation Plan",
    ]);
    // The brief's Day 1: five researched companies, no customer contact.
    expect(MISSIONS[0].mission).toBe("Understand what type of Bengaluru aerospace / defence company may need FAI software.");
    expect(MISSIONS[0].why).toBe("You cannot market a product effectively if you do not know who the customer is.");
    expect(MISSIONS[0].doToday[0]).toBe("Research 5 Bengaluru aerospace / defence manufacturing companies, from public sources.");
    expect(MISSIONS[0].askNote).toBe("No customer contact today. Answer these from research.");
    expect(MISSIONS[0].dont).toEqual(["Don't contact companies before basic research.", "Don't assume they need our software.", "Don't call every aerospace company a target customer."]);
    expect(MISSIONS[0].output).toBe("5 researched companies");
    // Day 2: one workflow map, no selling. Day 3: 3–5 pain hypotheses.
    expect(MISSIONS[1].mission).toBe("Understand the customer's workflow before discussing our product.");
    expect(MISSIONS[1].dont[0]).toBe("Don't start selling yet.");
    expect(MISSIONS[1].output).toBe("One clear workflow map");
    expect(MISSIONS[2].ask).toEqual(["Which part takes the most time?", "Where do corrections happen?", "What causes rework?", "What happens when an FAI is delayed?", "What is hardest when a drawing changes?"]);
    expect(MISSIONS[2].output).toBe("3–5 pain hypotheses");
    // Later days no longer assume a 20-company map or six hypotheses.
    expect(JSON.stringify(MISSIONS)).not.toMatch(/20 Market Map|six hypotheses/);
    expect(MISSIONS[3].key).toBe("Find the right customer. Understand the right problem. Create a reason to start a conversation.");
    expect(MISSIONS[20].key).toBe("Marketing creates relevance. Sales converts validated value into a business decision.");
  });

  it("follows the brief's daily sequence at its milestones", () => {
    const title = (day: number) => MISSIONS[day - 1].title;
    expect(title(15)).toBe("Business Model Canvas");
    expect(title(20)).toBe("Market Validation Gate");
    expect(title(33)).toBe("ROI & Business Value");
    expect(title(40)).toBe("Sales Validation Gate");
    expect(title(59)).toBe("Boardroom Pitch");
    expect(title(60)).toBe("Final Revenue Review");
  });

  it("schedules the weekly review every Friday and gates customer contact behind Gate C", () => {
    for (let day = 5; day <= 55; day += 5) {
      expect(isReviewDay(day)).toBe(true);
      expect(MISSIONS[day - 1].submit.join(" "), `Day ${day}`).toMatch(/CEO \/ CMO \/ CSO review/);
    }
    // No Month 1 day before Day 10 is customer-facing, and every research day says so.
    for (const m of MISSIONS.slice(0, 9)) {
      expect(m.customerFacing).toBeFalsy();
      expect(m.askNote).toMatch(/Gate C|No customer contact/);
    }
    expect(MISSIONS[9].gate).toMatch(/Gate C/);
  });

  it("is searchable by the brief's terms, best match first", () => {
    expect(searchMissions("ROI")[0].day).toBe(33);
    expect(searchMissions("ICP").map((m) => m.day)).toContain(7);
    expect(searchMissions("objection").map((m) => m.day)).toContain(36);
    expect(searchMissions("security").length).toBeGreaterThan(0);
    expect(searchMissions("pilot").map((m) => m.day)).toContain(37);
    expect(searchMissions("AS9102").length).toBeGreaterThan(0);
    expect(searchMissions("   ")).toEqual([]);
  });

  it("resumes at the next open day", () => {
    expect(nextOpenDay({})).toBe(1);
    expect(nextOpenDay({ 1: "x", 2: "x" })).toBe(3);
    expect(nextOpenDay({ 1: "x", 5: "x" })).toBe(6);
    expect(nextOpenDay(Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, "x"])))).toBe(60);
  });
});

describe("Synthetic demonstration data", () => {
  it("is flagged and fictional", () => {
    for (const record of [...SYNTHETIC_ACCOUNTS, ...SYNTHETIC_OPPORTUNITIES]) expect(record.synthetic).toBe(true);
    expect(SYNTHETIC_ACCOUNTS.map((a) => a.name)).toEqual(["Orion Precision Aero Pvt Ltd", "Vega Aerospace Components", "Akash Defence Machining"]);
    for (const account of SYNTHETIC_ACCOUNTS) expect(account.location).toMatch(/fictional/);
  });

  it("shows tools when the work needs them", () => {
    expect(UNLOCKS.map((unlock) => [unlock.tool, unlock.day])).toEqual(
      expect.arrayContaining([["outreach", 26], ["demo", 32], ["roi", 33], ["pilot", 37], ["pipeline", 39], ["proposal", 54]]),
    );
    expect(isUnlocked("roi", 32)).toBe(false);
    expect(isUnlocked("roi", 33)).toBe(true);
    // Every unlock a tool link names exists.
    for (const link of Object.values(TOOL_LINKS)) if (link.unlock) expect(UNLOCKS.map((unlock) => unlock.tool)).toContain(link.unlock);
  });

  it("organises the platform into step pages, Today, the case study and two personal tools", () => {
    expect(Object.keys(ROUTES)).toEqual(["overview", "today", "customer", "marketing", "sales", "pilot", "close", "revenue", "caseStudy", "accounts", "pipeline"]);
    expect(HEADER_NAV.map((item) => item.label)).toEqual(["Overview", "Customer", "Marketing", "Sales", "Case Study"]);
    expect(BAR_NAV.map((item) => item.label)).toEqual(["Today", "Journey", "Customer", "Sales"]);
    // Every page belongs to one place in the bottom bar.
    for (const route of Object.keys(ROUTES)) expect(BAR_OF[route as keyof typeof ROUTES]).toBeDefined();
    expect(PHASES.map((phase) => phase.label)).toEqual(["Marketing", "Sales", "Execution"]);
    expect(WEEKS.map((week) => week.theme)).toEqual([
      "Market & Problem",
      "Customer Discovery",
      "Value & Positioning",
      "Go-To-Market",
      "Sales Foundations",
      "Customer Engagement",
      "Solution & Value Selling",
      "Pilot, Proposal & Negotiation",
      "Build the Market",
      "Talk to Customers",
      "Create Opportunities",
      "Create Revenue Evidence",
    ]);
    expect(WEEKS[2].challenge).toBe("Prove the value proposition matters.");
  });
});

describe("Analytics privacy", () => {
  it("sends only short lower-case ids", async () => {
    vi.resetModules();
    const trackEvent = vi.fn();
    vi.doMock("@/utils/analytics", () => ({ trackEvent }));
    const { trackRevenue } = await import("../analytics");
    trackRevenue("daily_mission_view", { day: "12" });
    trackRevenue("account_scored", { tier: "Orion Precision Aero Pvt Ltd" });
    expect(trackEvent).toHaveBeenNthCalledWith(1, "daily_mission_view", { day: "12" });
    expect(trackEvent).toHaveBeenNthCalledWith(2, "account_scored", {});
    vi.doUnmock("@/utils/analytics");
  });
});

describe("The ten steps", () => {
  it("runs from understanding the customer to revenue and profit, across six pages", () => {
    expect(STEPS.map((step) => step.short)).toEqual([
      "Understand Customer",
      "Find Pain",
      "Learn Marketing",
      "Generate Leads",
      "Learn Sales",
      "Talk to Customer",
      "Demonstrate Value",
      "Pilot",
      "Proposal & Close",
      "Revenue & Profit",
    ]);
    expect(STEP_PAGE_ORDER.map((page) => stepsOnPage(page).map((step) => step.n))).toEqual([[1, 2], [3, 4], [5, 6, 7], [8], [9], [10]]);
    for (const step of STEPS) {
      expect(step.doList.length, `Step ${step.n}`).toBeGreaterThanOrEqual(3);
      expect(step.doList.length, `Step ${step.n}`).toBeLessThanOrEqual(5);
      expect(step.result.trim()).not.toBe("");
    }
  });

  it("gives every day a step, and every step at least one day", () => {
    for (let day = 1; day <= TOTAL_DAYS; day++) expect(STEPS).toContain(stepOfDay(day));
    for (const step of STEPS) expect(daysOfStep(step.n).length, `Step ${step.n}`).toBeGreaterThan(0);
    expect(daysOfStep(1).slice(0, 1)).toEqual([1]);
    expect([firstDayOfStep(1), firstDayOfStep(2), firstDayOfStep(3), firstDayOfStep(8), firstDayOfStep(10)]).toEqual([1, 2, 4, 37, 56]);
    expect(daysOfStep(10)).toEqual([56, 57, 58, 59, 60]);
  });

  it("draws the customer-to-revenue flow in the brief's six stages", () => {
    expect(CUSTOMER_TO_REVENUE.map((stage) => stage.name)).toEqual(["Customer", "Pain", "Marketing", "Sales", "Value", "Revenue"]);
    expect(CUSTOMER_TO_REVENUE.map((stage) => stage.hint)).toEqual([
      "Who has the problem?",
      "What is difficult today?",
      "Why should they talk to us?",
      "Is this a real opportunity?",
      "Can we prove improvement?",
      "Will the customer pay?",
    ]);
  });

  it("says Ideal Customer before ICP, and avoids advanced terms in the steps", () => {
    expect(MISSIONS[6].title).toBe("Define Your Ideal Customer");
    expect(MISSIONS[6].mission).toMatch(/Ideal Customer .*ICP, an Ideal Customer Profile/);
    // No day before Day 7 says ICP without explaining it.
    for (const m of MISSIONS.slice(0, 6)) expect(JSON.stringify(m), `Day ${m.day}`).not.toMatch(/\bICP\b/);
    expect(JSON.stringify(STEPS)).not.toMatch(/qualified commercial opportunity|commercial evidence|revenue pipeline/i);
  });
});
