// The framework itself: identity, links, the journey, the three phases and
// twelve weeks, the workspace's navigation, the internship and its gates.
import type { ViewId } from "../types";

export const FRAMEWORK = {
  name: "B2B Revenue Engineering",
  descriptor: "Customer Discovery · Marketing · Consultative Sales · Revenue Execution",
  programme: "12-Week B2B Marketing & Sales Internship",
  route: "/internships/marketing-sales",
  /** The id of the page root; the stylesheet's theme is scoped to it. */
  rootId: "revenue-root",
  eyebrow: "B2B Revenue Engineering",
  headline: "Turn Aerospace Customer Problems Into Revenue",
  lede: "A practical daily framework for understanding Bengaluru Aerospace & Defence MSMEs, validating real FAI workflow problems, engaging decision-makers and building a repeatable path from customer evidence to commercial revenue.",
  reviewed: "2026-10-26",
  reviewedLabel: "26 October 2026",
} as const;

/** The first case study. The framework is built so a second product can be added beside it. */
export const CASE_STUDY = {
  id: "fai-as9102",
  label: "Live Industry Case Study",
  title: "Balloon Drawings & AS9102 FAI Reporting",
  product: "FAI Engineer",
  productUrl: "https://fai.ev.engineer/",
  contextUrl: "/internships/aerospace-quality-intelligence-platform",
  market: "Aerospace & Defence MSMEs",
  geography: "Bengaluru, Karnataka, India",
} as const;

export const OPERATING_SYSTEM = ["Learn", "Do", "Ask", "Don't", "Submit", "Review", "Improve"] as const;

/** The commercial journey the hero animates, one stage at a time. */
export const JOURNEY = ["Problem", "Customer", "Evidence", "Value", "Opportunity", "Pilot", "Revenue"] as const;

export const FULL_JOURNEY = [
  "Market Understanding",
  "Customer Problem Discovery",
  "Pain Validation",
  "ICP",
  "Buyer Mapping",
  "Positioning",
  "Marketing",
  "Outreach",
  "Discovery",
  "Qualification",
  "Demo",
  "ROI",
  "Pilot",
  "Proposal",
  "Negotiation",
  "Purchase",
  "Adoption",
  "Expansion",
  "Revenue",
  "Profit",
] as const;

export const MAIN_MESSAGE = {
  dont: "How do I sell my product?",
  do: "What important problem does this customer have, what evidence proves it, and can we create enough measurable value that they are willing to change?",
  chain: ["Problem", "Evidence", "Value", "Trust", "Opportunity", "Revenue"],
} as const;

export const PRINCIPLES = [
  "Evidence over assumption.",
  "Understand before selling.",
  "Diagnose before demonstrating.",
  "Business value before features.",
  "Qualified pipeline before vanity leads.",
  "Customer trust before short-term revenue.",
  "Measure before claiming ROI.",
  "Trade value; don't blindly discount.",
  "Learn from lost opportunities.",
  "Revenue is the result of a repeatable system.",
] as const;

export const PROGRAMME_META = [
  "12 Weeks",
  "Hybrid",
  "Bengaluru Market",
  "6 Internship Positions per Cohort",
  "Live Customer Context",
  "Certificate of Completion",
  "Internship Certificate",
] as const;

export interface Phase {
  n: 1 | 2 | 3;
  name: string;
  weeks: string;
  question: string;
  deliverable: string;
  gate: string;
}

export const PHASES: readonly Phase[] = [
  {
    n: 1,
    name: "Prove the Market",
    weeks: "Weeks 1–4",
    question: "Is this a painful enough problem for a specific Bengaluru aerospace / defence customer to consider solving?",
    deliverable: "Market Evidence",
    gate: "We know WHO may have the problem, WHAT evidence supports it, and WHAT still needs validation.",
  },
  {
    n: 2,
    name: "Prove the Sales Motion",
    weeks: "Weeks 5–8",
    question: "Can we reliably reach, engage, qualify and demonstrate value to the right customers?",
    deliverable: "Qualified Opportunities",
    gate: "We can engage the right customer and progress a validated problem into a qualified commercial opportunity.",
  },
  {
    n: 3,
    name: "Prove the Business",
    weeks: "Weeks 9–12",
    question: "Can opportunities progress into evaluations, pilots, proposals, pipeline, revenue and a repeatable commercial model?",
    deliverable: "Revenue Evidence",
    gate: "We can show which evidence became commercial traction, and what the next 90 days must prove.",
  },
];

export interface Week {
  n: number;
  theme: string;
  challenge: string;
}

export const WEEKS: readonly Week[] = [
  { n: 1, theme: "Market & Problem Foundations", challenge: "Prove the problem may exist." },
  { n: 2, theme: "Customer & Market Discovery", challenge: "Prove who suffers most." },
  { n: 3, theme: "Value & Positioning", challenge: "Prove the value proposition is relevant." },
  { n: 4, theme: "GTM & Demand Creation", challenge: "Prove you know where to find the buyer." },
  { n: 5, theme: "B2B Sales Foundations", challenge: "Get a legitimate prospect to agree to discovery." },
  { n: 6, theme: "Customer Engagement", challenge: "Discover something you did not already know." },
  { n: 7, theme: "Solution & Value Selling", challenge: "Quantify value without exaggeration." },
  { n: 8, theme: "Objections, Pilot, Negotiation", challenge: "Get agreement on a meaningful next step." },
  { n: 9, theme: "Market Execution Sprint", challenge: "Create a qualified opportunity." },
  { n: 10, theme: "Customer Discovery Sprint", challenge: "Improve the product / message from customer evidence." },
  { n: 11, theme: "Opportunity Execution", challenge: "Build a credible business case." },
  { n: 12, theme: "Revenue Evidence", challenge: "Defend the revenue system before a CEO / investor-style panel." },
];

export const DAYS_PER_WEEK = 5;
export const TOTAL_DAYS = 60;

export const weekOf = (day: number) => Math.ceil(day / DAYS_PER_WEEK);
export const phaseOf = (day: number) => PHASES[Math.ceil(weekOf(day) / 4) - 1];
/** Friday is the fifth working day of each week: the weekly review is due. */
export const isReviewDay = (day: number) => day % DAYS_PER_WEEK === 0;

/** The workspace's navigation, grouped as the desktop sidebar shows it. */
export const NAV_GROUPS: readonly { id: string; label: string; items: readonly { id: ViewId; label: string }[] }[] = [
  {
    id: "execute",
    label: "Execute",
    items: [
      { id: "today", label: "Today" },
      { id: "journey", label: "Journey" },
      { id: "cockpit", label: "Revenue Cockpit" },
    ],
  },
  {
    id: "market",
    label: "Market",
    items: [
      { id: "market", label: "Bengaluru Market" },
      { id: "icp", label: "ICP & Buyers" },
      { id: "pains", label: "Pain Library" },
      { id: "accounts", label: "Accounts" },
    ],
  },
  {
    id: "sell",
    label: "Sell",
    items: [
      { id: "questions", label: "Question Bank" },
      { id: "meetings", label: "Meetings" },
      { id: "pipeline", label: "Pipeline" },
      { id: "pilot", label: "Pilot" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { id: "learn-marketing", label: "Marketing" },
      { id: "learn-sales", label: "Sales" },
      { id: "learn-revenue", label: "Revenue" },
    ],
  },
  {
    id: "case",
    label: "Case Study",
    items: [
      { id: "product", label: "FAI Product" },
      { id: "evidence", label: "Evidence & Claims" },
      { id: "roi", label: "ROI" },
      { id: "feedback", label: "Product Feedback" },
    ],
  },
  {
    id: "review",
    label: "Review",
    items: [
      { id: "review", label: "Weekly Review" },
      { id: "decisions", label: "Decision Log" },
      { id: "challenges", label: "Founder Challenges" },
      { id: "boardroom", label: "Final Boardroom" },
      { id: "internship", label: "Internship & Gates" },
    ],
  },
];

export const VIEW_LABEL: Record<ViewId, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label])),
) as Record<ViewId, string>;

export const VIEW_IDS = NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id));

/** A phone's bottom bar: the five field-sales essentials. Everything else is behind More. */
export const MOBILE_NAV: readonly { id: ViewId | "learn"; label: string; view: ViewId }[] = [
  { id: "today", label: "Today", view: "today" },
  { id: "journey", label: "Journey", view: "journey" },
  { id: "accounts", label: "Accounts", view: "accounts" },
  { id: "pipeline", label: "Pipeline", view: "pipeline" },
  { id: "learn", label: "Learn", view: "learn-marketing" },
];

/** Which mobile tab a view belongs to, so the bar shows where you are. */
export const mobileTabFor = (view: ViewId): string | null => {
  if (view.startsWith("learn-")) return "learn";
  return MOBILE_NAV.find((tab) => tab.view === view)?.id ?? null;
};

// ── Internship ──────────────────────────────────────────────────────────────

export const INTERNSHIP = {
  title: "12-Week Guided Internship",
  eligibility: [
    "MBA / BBA students",
    "Graduates",
    "Working professionals",
    "Startup founders",
    "Aspiring entrepreneurs",
    "Business-development aspirants",
    "Serious learners interested in B2B marketing and sales",
  ],
  cohort: "6 positions",
  selection: "Online Interview",
  mode: "Hybrid",
  certification: ["Certificate of Completion", "Internship Certificate"],
  details: "Program details will be shared with shortlisted participants.",
  /**
   * The application integration point. This programme has no form of its own
   * yet, so it uses the EV.ENGINEER internship application the /internships
   * page already links to. Replace `url` here when a dedicated form exists.
   */
  apply: {
    label: "Apply for Internship",
    url: "https://forms.gle/CeBqi41CMrrEd6B5A",
    note: "Applications use the EV.ENGINEER internship form. Mention “B2B Revenue Engineering” in your application.",
  },
} as const;

export type GateId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface Gate {
  id: GateId;
  name: string;
  criterion: string;
  /** The day the gate is normally reviewed. */
  day: number;
  requires?: readonly GateId[];
}

export const GATES: readonly Gate[] = [
  { id: "A", name: "Market Ready", criterion: "Can explain the Bengaluru A&D market and the target ICP, with sources.", day: 10 },
  { id: "B", name: "Product Ready", criterion: "Can accurately explain what FAI Engineer does today — and what it does not.", day: 12 },
  { id: "C", name: "Discovery Ready", criterion: "Can run a non-leading customer conversation from an approved guide.", day: 10 },
  { id: "D", name: "Outreach Approved", criterion: "Outreach messages reviewed and approved by a mentor before sending.", day: 26 },
  { id: "E", name: "Demo Ready", criterion: "Can demonstrate the current product without unsupported claims.", day: 32 },
  { id: "F", name: "Commercial Ready", criterion: "Understands approved pricing and proposal boundaries.", day: 34 },
  { id: "G", name: "Customer-Facing", criterion: "Unlocked only when Gates A–F are complete and the Professional Behaviour module is done.", day: 40, requires: ["A", "B", "C", "D", "E", "F"] },
];

export const EVALUATION: readonly { area: string; weight: number }[] = [
  { area: "Customer / Market Evidence", weight: 25 },
  { area: "Account Research & ICP", weight: 20 },
  { area: "Professional Customer Engagement", weight: 15 },
  { area: "Qualified Pipeline Development", weight: 15 },
  { area: "Commercial / ROI Thinking", weight: 10 },
  { area: "Product / Market Learning", weight: 10 },
  { area: "Documentation Discipline", weight: 5 },
];

export const PROFESSIONAL_BEHAVIOUR = [
  "Punctuality",
  "Concise communication",
  "Proper introduction: who you are, who you represent, why you are calling",
  "A written meeting agenda",
  "Confidentiality",
  "Customer respect",
  "Professional note-taking",
  "No competitor criticism",
  "No unapproved promises",
  "Follow-up within the agreed time",
  "A clear next action",
  "Accurate meeting minutes",
  "Respect for procurement",
  "Respect for engineering and quality teams",
  "No sharing one customer's details with another",
] as const;
