// The ten steps a beginner follows, from understanding the customer to
// building profit, and what the overview and the step pages show. Every
// customer problem here is a hypothesis until customers confirm it.
import { TOTAL_DAYS } from "./framework";

export type StepPageId = "customer" | "marketing" | "sales" | "pilot" | "close" | "revenue";

export interface Step {
  n: number;
  /** The journey's short name: "Understand Customer". */
  short: string;
  /** The step's full name: "Understand the Customer". */
  name: string;
  page: StepPageId;
  /** The journey's one line. */
  line: string;
  /** One sentence: what this step is for. */
  sentence: string;
  /** What to do: three to five actions. */
  doList: readonly string[];
  /** What to ask, on the steps that involve asking. */
  ask?: readonly string[];
  /** The Ask column's heading, when it is not "Ask". */
  askLabel?: string;
  /** Also list the questions not to ask yet (DONT_ASK). */
  dontAsk?: boolean;
  avoid: readonly string[];
  /** What the learner has at the end of the step. */
  result: string;
  /** Ideas from the concept library (LEARN) that "Learn more" opens. */
  concepts: readonly string[];
}

export const STEPS: readonly Step[] = [
  {
    n: 1,
    short: "Understand Customer",
    name: "Understand the Customer",
    page: "customer",
    line: "Who does the work, who feels the problem, who decides.",
    sentence: "Understand who performs the work, who experiences the problem and who can influence or approve a purchase.",
    doList: [
      "Start with Bengaluru Aerospace & Defence MSMEs that make parts to drawings.",
      "Learn what the Business Owner, Quality Head, Quality Engineer and Manufacturing / Operations Head each do.",
      "Note where an Engineering Head is involved too.",
      "Separate who does the work, who feels the problem and who approves a purchase.",
    ],
    avoid: ["Don't call every aerospace company a target customer.", "Don't assume they need our software."],
    result: "A clear picture of the customer and the people inside it.",
    concepts: ["market-map", "segmentation", "icp", "personas"],
  },
  {
    n: 2,
    short: "Find Pain",
    name: "Find the Pain",
    page: "customer",
    line: "Map the FAI workflow and find where it may hurt.",
    sentence: "Map the customer's FAI workflow and find where effort, rework or delay may happen — then validate it.",
    doList: [
      "Map the workflow: Drawing → Characteristics → Ballooning → Inspection → FAI Report → Review → Approval.",
      "Mark who performs each step.",
      "Write each possible pain as a hypothesis, not a fact.",
      "Plan how a customer could confirm or reject each one.",
    ],
    ask: [
      "How do you do this today?",
      "Who performs each step?",
      "How much time does it take?",
      "Where does rework happen?",
      "Where can errors happen?",
      "What happens when the FAI is delayed?",
      "What is most frustrating?",
      "What requires the most manual effort?",
    ],
    avoid: ["Don't assume the pain. Validate it.", "Don't criticise their current process."],
    result: "3–5 pain hypotheses, each with a way to test it.",
    concepts: ["pain"],
  },
  {
    n: 3,
    short: "Learn Marketing",
    name: "Learn Marketing",
    page: "marketing",
    line: "Marketing means giving the right customer a reason to talk.",
    sentence: "Marketing means finding the right customer with the right problem and giving them a relevant reason to start a conversation.",
    doList: [
      "Identify the target customer and the buyer.",
      "Understand the customer's business and pain.",
      "Define the value, in the customer's words.",
      "Write a short, relevant message.",
      "Choose a channel and start a conversation.",
    ],
    avoid: ["Don't start with features; start with the customer's work.", "Don't describe the product as \"AI that automates FAI\"."],
    result: "A one-sentence reason for a quality team to talk to you.",
    concepts: ["b2b-marketing", "value-prop", "positioning", "gtm", "channels", "bmc"],
  },
  {
    n: 4,
    short: "Generate Leads",
    name: "Generate Leads",
    page: "marketing",
    line: "Find, research, prioritise, then contact.",
    sentence: "Find relevant Bengaluru companies, research them, rank them by fit and contact the best ones professionally.",
    doList: [
      "Identify Bengaluru aerospace / defence MSMEs and research their capabilities.",
      "Check whether FAI is likely to matter to them.",
      "Identify Quality, Operations or Owner contacts from public business sources.",
      "Rank accounts by fit.",
      "Prepare a short, relevant introduction and contact professionally.",
    ],
    avoid: ["Don't contact companies before basic research.", "Don't collect private or confidential information.", "Don't send a message your mentor has not approved."],
    result: "A ranked list of researched accounts, and approved first messages.",
    concepts: ["prioritisation", "prospecting", "outreach"],
  },
  {
    n: 5,
    short: "Learn Sales",
    name: "Learn Sales",
    page: "sales",
    line: "Sales means helping the customer make a good business decision.",
    sentence: "Sales means understanding whether the problem is real, demonstrating relevant value and helping the customer make a good business decision.",
    doList: [
      "Learn the path: Contact → Discovery → Validate Pain → Demo → Show Value → Pilot → Proposal → Purchase.",
      "Find out who else is involved in a decision.",
      "Qualify honestly: is there a real problem, an owner and a reason to act?",
      "Keep a next step and a date for every opportunity.",
    ],
    avoid: ["Don't push; diagnose.", "Don't treat interest as a purchase."],
    result: "You know where each opportunity stands and what must happen next.",
    concepts: ["b2b-sales", "qualification", "dmu", "pipeline"],
  },
  {
    n: 6,
    short: "Talk to Customer",
    name: "Talk to the Customer",
    page: "sales",
    line: "Ask about their work. Listen. Agree a next step.",
    sentence: "Understand before selling: ask about their current work, and listen.",
    doList: [
      "Prepare with the Customer Meeting Guide.",
      "Ask about their last real FAI, not hypotheticals.",
      "Listen far more than you speak; write down their words.",
      "Agree a clear next step before you leave.",
    ],
    // The other seven questions are the Customer Meeting Guide's, just above this step.
    ask: ["What would make this process easier?", "Who else would evaluate a new tool?"],
    askLabel: "Also ask",
    avoid: ["Don't pitch in a discovery meeting.", "Don't ask for drawings or controlled information.", "Don't promise features or savings."],
    dontAsk: true,
    result: "Notes in the customer's own words, and an agreed next step.",
    concepts: ["discovery"],
  },
  {
    n: 7,
    short: "Demonstrate Value",
    name: "Demonstrate Value",
    page: "sales",
    line: "Show only what addresses their confirmed pain.",
    sentence: "Show only the product workflow that addresses a pain the customer confirmed — and the evidence for it.",
    doList: [
      "Follow: Customer Problem → Relevant Product Workflow → Business Benefit → Evidence.",
      "Focus on effort saved, review effort, rework, traceability, preparation time and consistency.",
      "Use a fictitious drawing, never a customer's.",
      "Agree what an evaluation should measure.",
    ],
    avoid: ["Don't demonstrate every feature.", "Don't guarantee savings before measurement.", "Don't show roadmap features as available today."],
    result: "Agreement on what a pilot should measure.",
    concepts: ["consultative", "roi"],
  },
  {
    n: 8,
    short: "Pilot",
    name: "Pilot / Proof of Value",
    page: "pilot",
    line: "Prove value before asking for a bigger commitment.",
    sentence: "Compare the current workflow with the FAI-assisted workflow on measures agreed with the customer.",
    doList: [
      "Agree success criteria before starting.",
      "Measure the current workflow first: that is the baseline.",
      "Measure time, corrections, manual effort, review effort, usability and completeness.",
      "Collect the customer's own feedback.",
    ],
    avoid: ["Don't start without written success criteria.", "Don't claim a result the pilot did not measure."],
    result: "Pilot evidence the customer agrees with.",
    concepts: ["pilot"],
  },
  {
    n: 9,
    short: "Proposal & Close",
    name: "Proposal & Close",
    page: "close",
    line: "Turn proven value into a purchase order.",
    sentence: "Turn proven value into a clear proposal, and guide the customer through the steps to a purchase order.",
    doList: [
      "Write the proposal in the customer's words, covering the nine parts above.",
      "Ask early who else must review it before a purchase order.",
      "Negotiate by trading value, not by discounting.",
      "Agree a decision date.",
    ],
    avoid: ["Don't mistake interest for a purchase.", "Don't quote a price outside approved policy.", "Don't try to skip procurement."],
    result: "A purchase order — or a clear reason why not.",
    concepts: ["proposal", "pricing", "objections", "negotiation"],
  },
  {
    n: 10,
    short: "Revenue & Profit",
    name: "Revenue & Profit",
    page: "revenue",
    line: "Keep the customer succeeding, and build profit.",
    sentence: "Make sure the customer succeeds, so that revenue renews, grows and becomes profit.",
    doList: [
      "Follow: Customer Value → Purchase → Revenue → Customer Success → Renewal / Expansion → Profit.",
      "Count the effort it took to win the customer.",
      "Count implementation, support and ongoing service cost.",
      "Track renewal, expansion and profitability.",
    ],
    avoid: ["Don't chase revenue the customer gets no value from.", "Don't expand before the customer has adopted the product."],
    result: "A customer who renews, and a business that profits.",
    concepts: ["revenue-math", "unit-economics", "expansion", "loss"],
  },
];

/**
 * The step each of the 60 days belongs to. The days keep their order — the
 * programme returns to some steps, with real customers, in its last month —
 * so a step's days are not always consecutive.
 */
const DAY_STEP: readonly number[] = [
  1, 2, 2, 3, 2, // Days 1–5
  1, 1, 1, 4, 6, // Days 6–10
  3, 3, 3, 3, 3, // Days 11–15
  3, 3, 3, 4, 4, // Days 16–20
  5, 4, 4, 5, 5, // Days 21–25
  4, 4, 6, 6, 6, // Days 26–30
  7, 7, 7, 9, 9, // Days 31–35
  9, 8, 9, 5, 5, // Days 36–40
  4, 4, 4, 4, 4, // Days 41–45
  6, 6, 6, 7, 7, // Days 46–50
  6, 7, 7, 8, 9, // Days 51–55
  10, 10, 10, 10, 10, // Days 56–60
];

if (DAY_STEP.length !== TOTAL_DAYS) throw new Error("Every day needs a step.");

export const stepOfDay = (day: number): Step => STEPS[DAY_STEP[Math.min(TOTAL_DAYS, Math.max(1, day)) - 1] - 1];

/** The days that belong to a step, in order. */
export const daysOfStep = (n: number): number[] => DAY_STEP.flatMap((step, i) => (step === n ? [i + 1] : []));

/** Where "Start Step N" opens Today. */
export const firstDayOfStep = (n: number): number => daysOfStep(n)[0];

export const stepsOnPage = (page: StepPageId) => STEPS.filter((step) => step.page === page);

export const stepNo = (n: number) => String(n).padStart(2, "0");

// ── Flows: each animation teaches one process ──────────────────────────────

export interface FlowStage {
  name: string;
  /** One line under the stage, and the detail when it is chosen. */
  hint: string;
}

/** The overview's signature: from a customer to revenue, the question each stage answers. */
export const CUSTOMER_TO_REVENUE: readonly (FlowStage & { step: number })[] = [
  { name: "Customer", hint: "Who has the problem?", step: 1 },
  { name: "Pain", hint: "What is difficult today?", step: 2 },
  { name: "Marketing", hint: "Why should they talk to us?", step: 3 },
  { name: "Conversation", hint: "What should we ask?", step: 6 },
  { name: "Sales", hint: "Is there a real opportunity?", step: 5 },
  { name: "Value", hint: "Can we prove improvement?", step: 7 },
  { name: "Revenue", hint: "Will the customer pay?", step: 10 },
];

export const MARKETING_FLOW: readonly FlowStage[] = [
  { name: "Find", hint: "Identify relevant Bengaluru Aerospace & Defence MSMEs." },
  { name: "Research", hint: "Understand their business before contacting them." },
  { name: "Position", hint: "Explain the customer problem we may help solve." },
  { name: "Reach", hint: "Start a relevant conversation." },
];

export const SALES_FLOW: readonly FlowStage[] = [
  { name: "Contact", hint: "Reach the right person, professionally." },
  { name: "Discovery", hint: "Understand their current work." },
  { name: "Validate", hint: "Confirm the pain is real." },
  { name: "Demo", hint: "Show only what is relevant." },
  { name: "Value", hint: "Agree what improvement to measure." },
];

export const CLOSE_FLOW: readonly FlowStage[] = [
  { name: "Validated Problem", hint: "The customer confirmed it." },
  { name: "Demonstrated Value", hint: "They saw the relevant workflow." },
  { name: "Pilot Evidence", hint: "Measured, agreed results." },
  { name: "Proposal", hint: "Scope, value, price and next step." },
  { name: "Commercial Discussion", hint: "Trade value; don't just discount." },
  { name: "Purchase", hint: "A purchase order, not a promise." },
];

export const REVENUE_FLOW: readonly FlowStage[] = [
  { name: "Customer Value", hint: "The customer's work improves." },
  { name: "Purchase", hint: "They decide to pay." },
  { name: "Revenue", hint: "Money comes in." },
  { name: "Support", hint: "They succeed with the product." },
  { name: "Renewal", hint: "They keep paying." },
  { name: "Expansion", hint: "They use more." },
  { name: "Profit", hint: "Value earned exceeds the cost." },
];


// ── The step pages ──────────────────────────────────────────────────────────

/** The step pages in journey order; each page's previous and next follow it. */
export const STEP_PAGE_ORDER: readonly StepPageId[] = ["customer", "marketing", "sales", "pilot", "close", "revenue"];

export const STEP_PAGES: Record<StepPageId, { label: string; title: string; lede: string; flow?: { label: string; stages: readonly FlowStage[] } }> = {
  customer: {
    label: "Customer",
    title: "Know the Customer. Find the Real Pain.",
    lede: "Understand who does the work and who decides — then find where the work is hard, and confirm it with the customer.",
  },
  marketing: {
    label: "Marketing",
    title: "Find the Right Customer. Create a Reason to Talk.",
    lede: "Marketing is finding the right customer with the right problem and creating enough relevance for them to start a conversation.",
    flow: { label: "Marketing in four stages", stages: MARKETING_FLOW },
  },
  sales: {
    label: "Sales",
    title: "Understand. Demonstrate. Help the Customer Decide.",
    lede: "Sales is understanding whether the problem is real, showing relevant value and helping the customer make a good business decision.",
    flow: { label: "Sales in five stages", stages: SALES_FLOW },
  },
  pilot: {
    label: "Pilot",
    title: "Prove Value Before Asking for a Bigger Commitment",
    lede: "A pilot compares the customer's current workflow with the FAI-assisted one, on measures you agree before it starts.",
  },
  close: {
    label: "Proposal & Close",
    title: "From Proven Value to a Purchase Order",
    lede: "Turn what the customer has seen and measured into a clear proposal — then help them through the steps every purchase takes.",
    flow: { label: "From validated problem to purchase", stages: CLOSE_FLOW },
  },
  revenue: {
    label: "Revenue & Profit",
    title: "Revenue Is Only Good When Customer Value Is Real",
    lede: "Revenue comes from customers who keep getting value. Profit is what is left after the cost of winning and serving them.",
    flow: { label: "From customer value to profit", stages: REVENUE_FLOW },
  },
};

/** "Steps 03–04", "Step 08". */
export const stepRange = (page: StepPageId) => {
  const steps = stepsOnPage(page);
  const first = steps[0].n;
  const last = steps[steps.length - 1].n;
  return first === last ? `Step ${stepNo(first)}` : `Steps ${stepNo(first)}–${stepNo(last)}`;
};

// ── Who is our customer? ────────────────────────────────────────────────────

export const CUSTOMER_COMPANY = "Bengaluru Aerospace / Defence MSME";

export interface CustomerRole {
  id: string;
  name: string;
  /** Their part in a decision, in two or three words. */
  part: string;
  text: string;
}

export const CUSTOMER_ROLES: readonly CustomerRole[] = [
  { id: "owner", name: "Business Owner", part: "Approves the purchase", text: "The Owner or Managing Director decides whether to spend. Cares about delivery, customers, cash — and whether the team will actually use a new tool." },
  { id: "quality-head", name: "Quality Head", part: "Owns the process", text: "Owns the FAI process and its review. Usually decides whether a tool fits the customer's requirements before anyone buys it." },
  { id: "quality-engineer", name: "Quality Engineer", part: "Does the work", text: "Balloons drawings, builds characteristic tables and prepares FAI reports. If the work is painful, they feel it first." },
  { id: "operations", name: "Manufacturing / Operations", part: "Feels the delays", text: "Needs the FAI approved to release production and deliver on time. A late or returned FAI is their problem too." },
];

// ── What problem are we solving? ────────────────────────────────────────────

export const HYPOTHESIS_TAG = "Hypothesis — Validate with Customer";

export interface WorkflowStage {
  name: string;
  what: string;
  ask: readonly string[];
  /** A possible pain. Never a fact until customers confirm it. */
  pain: string;
}

export const WORKFLOW: readonly WorkflowStage[] = [
  {
    name: "Drawing",
    what: "The customer's engineering drawing arrives — for a new part or a revised one.",
    ask: ["What happens when a new or revised drawing arrives?", "How often do drawings change?"],
    pain: "A revision may force earlier work to be redone.",
  },
  {
    name: "Characteristics",
    what: "Every dimension, tolerance and note that must be inspected is identified.",
    ask: ["Who identifies the characteristics?", "How are missed or duplicate ones caught?"],
    pain: "Characteristics may be missed or counted twice.",
  },
  {
    name: "Ballooning",
    what: "Dimensions / characteristics are identified and linked to balloon numbers.",
    ask: ["How do you create balloons today?", "Who does this?", "How long does it take?", "What causes correction?"],
    pain: "Manual effort / rework.",
  },
  {
    name: "Inspection",
    what: "Each characteristic is measured on the first part made, and the results are recorded.",
    ask: ["How are measurement results recorded?", "Which steps are repeated?"],
    pain: "Results may be typed again from one place to another.",
  },
  {
    name: "FAI Report",
    what: "The results are compiled into the First Article Inspection report — AS9102 Forms 1, 2 and 3.",
    ask: ["How is the report prepared today?", "Which tools do you use?"],
    pain: "Report preparation may take skilled hours.",
  },
  {
    name: "Review",
    what: "Someone checks the complete package before it goes to the customer.",
    ask: ["Who reviews the FAI?", "What typically causes corrections?"],
    pain: "Errors found late mean rework.",
  },
  {
    name: "Approval",
    what: "The customer accepts the FAI — or returns it.",
    ask: ["What happens if the report is delayed or returned?", "Does it affect production release or delivery?"],
    pain: "A delay may hold up production and delivery.",
  },
];

// ── Four wins ───────────────────────────────────────────────────────────────

export const FOUR_WINS: readonly { id: string; name: string; items: readonly string[] }[] = [
  { id: "customer", name: "Customer Wins", items: ["Lower manual effort", "Better workflow", "Reduced rework", "Improved traceability", "Faster preparation"] },
  { id: "business", name: "Business Wins", items: ["Revenue", "Profit", "Customer relationship", "References", "Repeat business"] },
  { id: "team", name: "Team Wins", items: ["Marketing skills", "Sales skills", "Customer experience", "Industry exposure", "Commercial capability"] },
  { id: "product", name: "Product Wins", items: ["Customer feedback", "Better product", "Stronger market fit", "Evidence", "Future opportunities"] },
];

export const WINS_NOTE = "Customer wins are what we aim for, not what we promise: each one is measured with the customer before anyone claims it.";

// ── Before, during and after a customer meeting ────────────────────────────

export const MEETING_GUIDE = {
  objective: "Understand the customer's existing FAI workflow.",
  ask: [
    "Can you walk me through your current FAI process?",
    "Who prepares ballooned drawings?",
    "Which step takes the most time?",
    "Where do corrections or rework occur?",
    "How do you handle drawing revisions?",
    "Who reviews the FAI?",
    "What happens if the report is delayed?",
  ],
  listenFor: ["Time", "Rework", "Errors", "Review effort", "Revision handling", "Delivery impact", "Approval delay"],
  doNot: ["Don't pitch before you understand.", "Don't ask for drawings or controlled information.", "Don't criticise their current process.", "Don't promise savings, compliance or features."],
  next: "Permission to show a relevant product workflow or conduct a sample evaluation.",
  record: [
    "What they said, in their own words",
    "Any time, rework or review effort they mentioned",
    "Which pain hypotheses were confirmed, unclear or wrong",
    "Who else is involved in a decision",
    "The agreed next step, with a date",
  ],
  followUp: "Send a thank-you and the agreed next step within the agreed time.",
} as const;

// ── Pilot, close and revenue ────────────────────────────────────────────────

/** The two workflows a pilot compares. The current one is the customer's own, as they describe it. */
export const PILOT_COMPARE = {
  current: { name: "Current Workflow", note: "The customer's own process, as they describe it", steps: ["Drawing", "Characteristics", "Ballooning", "Characteristic table", "Form 3", "Review"] },
  assisted: { name: "FAI-Assisted Workflow", note: "FAI Engineer, as it works today", steps: ["Drawing opened in the browser", "Balloons placed and renumbered", "Linked characteristic table", "Form 3-oriented export", "Review"] },
} as const;

export const PILOT_MEASURES: readonly { name: string; how: string }[] = [
  { name: "Time", how: "Preparation time per drawing" },
  { name: "Review effort", how: "Time spent checking before submission" },
  { name: "Corrections", how: "Errors found in review" },
  { name: "Workflow steps", how: "Steps and hand-offs from drawing to report" },
  { name: "Customer feedback", how: "What the people doing the work say" },
];

export const PROPOSAL_PARTS = ["Customer context", "Validated problem", "Proposed solution", "Scope", "Expected value", "Pilot evidence", "Price", "Implementation", "Next step"] as const;

/** What may still stand between a customer's interest and a purchase order. */
export const BEFORE_PURCHASE = ["Technical review", "IT / security review", "Procurement", "Vendor registration", "NDA", "Commercial negotiation", "Purchase order"] as const;

export const REVENUE_METRICS: readonly { name: string; text: string }[] = [
  { name: "Revenue", text: "What the customer pays." },
  { name: "Customer acquisition effort", text: "The time and cost it took to win the customer." },
  { name: "Delivery / support cost", text: "What it costs to implement, train and support them." },
  { name: "Renewal", text: "Whether they keep paying — because the value is real." },
  { name: "Expansion", text: "More users, sites or products — only after they have adopted it." },
  { name: "Profitability", text: "Revenue minus the cost to win and serve the customer, over time." },
];
