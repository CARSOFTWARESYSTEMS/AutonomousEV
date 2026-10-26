// The framework itself: identity, routes, the journey, the three phases and
// twelve weeks, when each tool unlocks, navigation, the internship and its gates.
import type { ToolId } from "../types";

const BASE = "/internships/marketing-sales";

export const FRAMEWORK = {
  name: "B2B Revenue Engineering",
  descriptor: "Customer Discovery · Marketing · Consultative Sales · Revenue Execution",
  programme: "12-Week B2B Marketing & Sales Internship",
  route: BASE,
  /** The id of the page root; the stylesheet's theme is scoped to it. */
  rootId: "revenue-root",
  eyebrow: "B2B Revenue Engineering",
  headline: "Turn Customer Problems Into Revenue",
  lede: "Learn how to understand Bengaluru Aerospace & Defence MSMEs, validate real customer pain, position a specialised software solution and build a repeatable B2B revenue pipeline.",
  context: ["Bengaluru", "Aerospace & Defence MSMEs", "FAI", "Customer Discovery", "Sales"],
  reviewed: "2026-10-26",
  reviewedLabel: "26 October 2026",
} as const;

/** Every page of the platform. The overview is public; the rest are the framework itself. */
export const ROUTES = {
  overview: BASE,
  today: `${BASE}/today`,
  marketing: `${BASE}/marketing`,
  sales: `${BASE}/sales`,
  execution: `${BASE}/execution`,
  caseStudy: `${BASE}/case-study`,
  accounts: `${BASE}/accounts`,
  pipeline: `${BASE}/pipeline`,
} as const;

export type RouteId = keyof typeof ROUTES;

/** Today's Mission opened on a given day. */
export const todayHref = (day?: number) => (day ? `${ROUTES.today}#day-${day}` : ROUTES.today);

/** The first case study. The framework is built so a second product can be added beside it. */
export const CASE_STUDY = {
  id: "fai-as9102",
  label: "Live Industry Case Study",
  title: "Balloon Drawings & AS9102 FAI Reporting",
  product: "FAI Engineer",
  productUrl: "https://fai.ev.engineer/",
  contextUrl: "/internships/aerospace-quality-intelligence-platform",
  market: "Aerospace & Defence MSMEs",
  geography: "Bengaluru",
  objective: "Understand workflow pain, validate value and build commercial opportunities.",
} as const;

export const OPERATING_SYSTEM = ["Learn", "Do", "Ask", "Don't", "Evidence", "Review", "Improve"] as const;

/** The commercial journey, with the one question each stage answers. The platform's signature visual. */
export const JOURNEY = ["Problem", "Customer", "Evidence", "Value", "Opportunity", "Pilot", "Revenue"] as const;

export const JOURNEY_QUESTIONS: Record<(typeof JOURNEY)[number], string> = {
  Problem: "Is this problem real?",
  Customer: "Who experiences it?",
  Evidence: "What proves it?",
  Value: "Why should they change?",
  Opportunity: "Is this commercially qualified?",
  Pilot: "Can we demonstrate measurable value?",
  Revenue: "Will the customer pay?",
};

/** Where in the twelve weeks each stage is worked on. */
export const JOURNEY_WEEKS: Record<(typeof JOURNEY)[number], string> = {
  Problem: "Weeks 1–2",
  Customer: "Weeks 2 and 5",
  Evidence: "Weeks 1–6 and 10",
  Value: "Weeks 3 and 7",
  Opportunity: "Weeks 5 and 9–11",
  Pilot: "Weeks 8 and 11",
  Revenue: "Week 12",
};

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

/** What someone can do after the twelve weeks. */
export const OUTCOMES: readonly { title: string; text: string }[] = [
  { title: "Read an industrial market", text: "Map who makes what, who prepares first-article evidence, and where a product might fit — from public sources." },
  { title: "Validate pain with evidence", text: "Turn beliefs into hypotheses and move them up the evidence ladder through real conversations." },
  { title: "Run discovery that customers value", text: "Ask about the last FAI, listen, and leave with a clear next step instead of a pitch." },
  { title: "Qualify, don't chase", text: "Score accounts and opportunities honestly, and know when not to sell." },
  { title: "Build a business case", text: "Estimate value from the customer's own numbers, as a range, and prove it in a pilot." },
  { title: "Show revenue evidence", text: "Present qualified pipeline and what it is built on to a CEO or investor panel." },
];

export const AUDIENCES = [
  "Interns and MBA / BBA students",
  "Startup founders",
  "MSME owners",
  "Sales and business-development teams",
  "Product and marketing professionals",
  "Engineers moving into commercial roles",
] as const;

export interface Phase {
  n: 1 | 2 | 3;
  name: string;
  /** The journey page's name: Marketing, Sales, Execution. */
  label: string;
  /** The short name the progress view uses: Market, Sales, Revenue. */
  short: string;
  weeks: string;
  route: "marketing" | "sales" | "execution";
  /** The journey page's call to action. */
  cta: string;
  verb: string;
  topics: readonly string[];
  question: string;
  deliverable: string;
  gate: string;
  /** What the customer conversation is for in this phase. */
  conversationGoal: string;
}

export const PHASES: readonly Phase[] = [
  {
    n: 1,
    name: "Prove the Market",
    label: "Marketing",
    short: "Market",
    weeks: "Weeks 1–4",
    route: "marketing",
    cta: "Explore Marketing",
    verb: "Understand",
    topics: ["Bengaluru market", "Customer workflow", "Pain", "ICP", "Buyers", "Positioning", "Value proposition", "GTM"],
    question: "Is this a painful enough problem for a specific Bengaluru aerospace / defence customer to consider solving?",
    deliverable: "Market Evidence",
    gate: "We know WHO may have the problem, WHAT evidence supports it, and WHAT still needs validation.",
    conversationGoal: "Understand the current workflow — not sell.",
  },
  {
    n: 2,
    name: "Prove the Sales Motion",
    label: "Sales",
    short: "Sales",
    weeks: "Weeks 5–8",
    route: "sales",
    cta: "Explore Sales",
    verb: "Learn",
    topics: ["Account research", "Prospecting", "Customer discovery", "Qualification", "Demo", "ROI", "Pilot", "Proposal", "Negotiation"],
    question: "Can we reliably reach, engage, qualify and demonstrate value to the right customers?",
    deliverable: "Qualified Opportunities",
    gate: "We can engage the right customer and progress a validated problem into a qualified commercial opportunity.",
    conversationGoal: "Diagnose the problem and agree a meaningful next step.",
  },
  {
    n: 3,
    name: "Prove the Business",
    label: "Execution",
    short: "Revenue",
    weeks: "Weeks 9–12",
    route: "execution",
    cta: "Explore Execution",
    verb: "Execute",
    topics: ["Target accounts", "Customer conversations", "Opportunities", "Pilots", "Proposals", "Pipeline", "Commercial evidence", "Revenue"],
    question: "Can opportunities progress into evaluations, pilots, proposals, pipeline, revenue and a repeatable commercial model?",
    deliverable: "Revenue Evidence",
    gate: "We can show which evidence became commercial traction, and what the next 90 days must prove.",
    conversationGoal: "Progress a real decision with evidence.",
  },
];

export interface Week {
  n: number;
  theme: string;
  /** The Weekly Business Challenge. */
  challenge: string;
}

export const WEEKS: readonly Week[] = [
  { n: 1, theme: "Market & Problem", challenge: "Prove the problem may exist." },
  { n: 2, theme: "Customer Discovery", challenge: "Prove who suffers most." },
  { n: 3, theme: "Value & Positioning", challenge: "Prove the value proposition matters." },
  { n: 4, theme: "Go-To-Market", challenge: "Prove you know where to find the buyer." },
  { n: 5, theme: "Sales Foundations", challenge: "Get a legitimate prospect to agree to discovery." },
  { n: 6, theme: "Customer Engagement", challenge: "Discover something you did not already know." },
  { n: 7, theme: "Solution & Value Selling", challenge: "Quantify value without exaggeration." },
  { n: 8, theme: "Pilot, Proposal & Negotiation", challenge: "Get agreement on a meaningful next step." },
  { n: 9, theme: "Build the Market", challenge: "Create a qualified opportunity." },
  { n: 10, theme: "Talk to Customers", challenge: "Improve the product or message from customer evidence." },
  { n: 11, theme: "Create Opportunities", challenge: "Build a credible business case." },
  { n: 12, theme: "Create Revenue Evidence", challenge: "Defend the revenue system before a CEO / investor-style panel." },
];

export const CHALLENGE_LABEL = "Weekly Business Challenge";

export const DAYS_PER_WEEK = 5;
export const TOTAL_DAYS = 60;

export const weekOf = (day: number) => Math.ceil(day / DAYS_PER_WEEK);
export const phaseOf = (day: number) => PHASES[Math.ceil(weekOf(day) / 4) - 1];
export const phaseWeeks = (phase: Phase) => WEEKS.slice((phase.n - 1) * 4, phase.n * 4);
/** Friday is the fifth working day of each week: the weekly review is due. */
export const isReviewDay = (day: number) => day % DAYS_PER_WEEK === 0;

/**
 * Tools appear when the work needs them. Before its day a tool stays out of
 * Today's Mission; its page remains reachable, so nobody is locked out.
 */
export const UNLOCKS: readonly { tool: string; day: number; label: string }[] = [
  { tool: "market", day: 1, label: "Market" },
  { tool: "pains", day: 3, label: "Pain" },
  { tool: "icp", day: 7, label: "ICP & Buyers" },
  { tool: "accounts", day: 9, label: "Accounts" },
  { tool: "outreach", day: 26, label: "Outreach & claim checker" },
  { tool: "demo", day: 32, label: "Demo" },
  { tool: "roi", day: 33, label: "ROI" },
  { tool: "pilot", day: 37, label: "Pilot" },
  { tool: "pipeline", day: 39, label: "Pipeline" },
  { tool: "proposal", day: 54, label: "Proposal / Commercial" },
];

export const unlockDay = (tool: string) => UNLOCKS.find((unlock) => unlock.tool === tool)?.day ?? 1;
export const isUnlocked = (tool: string, day: number) => day >= unlockDay(tool);

/** Where each tool a mission names is found. Small tools live inside the pages that use them. */
export const TOOL_LINKS: Record<ToolId, { label: string; href: string; unlock?: string }> = {
  today: { label: "Today", href: ROUTES.today },
  journey: { label: "Journey", href: ROUTES.marketing },
  cockpit: { label: "Revenue Cockpit", href: ROUTES.pipeline, unlock: "pipeline" },
  market: { label: "Bengaluru market", href: `${ROUTES.caseStudy}#market`, unlock: "market" },
  icp: { label: "ICP & buyer map", href: `${ROUTES.caseStudy}#icp`, unlock: "icp" },
  pains: { label: "Problem hypotheses", href: `${ROUTES.caseStudy}#problems`, unlock: "pains" },
  accounts: { label: "Accounts", href: ROUTES.accounts, unlock: "accounts" },
  questions: { label: "Meeting questions", href: `${ROUTES.accounts}#meetings` },
  meetings: { label: "Meeting prep", href: `${ROUTES.accounts}#meetings` },
  pipeline: { label: "Pipeline", href: ROUTES.pipeline, unlock: "pipeline" },
  pilot: { label: "Pilot charter", href: `${ROUTES.pipeline}#pilot`, unlock: "pilot" },
  "learn-marketing": { label: "Marketing weeks", href: ROUTES.marketing },
  "learn-sales": { label: "Sales weeks", href: ROUTES.sales },
  "learn-revenue": { label: "Revenue model", href: `${ROUTES.pipeline}#revenue-model` },
  product: { label: "FAI product", href: `${ROUTES.caseStudy}#product` },
  evidence: { label: "Evidence & claims", href: `${ROUTES.caseStudy}#evidence` },
  roi: { label: "ROI calculator", href: `${ROUTES.caseStudy}#roi`, unlock: "roi" },
  feedback: { label: "Product feedback", href: `${ROUTES.caseStudy}#feedback` },
  review: { label: "Weekly review", href: ROUTES.today },
  decisions: { label: "Decision log", href: `${ROUTES.pipeline}#decisions` },
  challenges: { label: "Weekly challenge", href: ROUTES.today },
  boardroom: { label: "Final boardroom", href: `${ROUTES.execution}#boardroom` },
  internship: { label: "Gates", href: `${ROUTES.today}#gates` },
};

/** The app's navigation: the same four places on every screen size, plus More. */
export const APP_NAV: readonly { id: "today" | "journey" | "accounts" | "pipeline"; label: string; href: string }[] = [
  { id: "today", label: "Today", href: ROUTES.today },
  { id: "journey", label: "Journey", href: ROUTES.marketing },
  { id: "accounts", label: "Accounts", href: ROUTES.accounts },
  { id: "pipeline", label: "Pipeline", href: ROUTES.pipeline },
];

/** The public overview's header: four anchors and one way in. */
export const PUBLIC_NAV: readonly { label: string; href: string }[] = [
  { label: "Overview", href: "#top" },
  { label: "Journey", href: "#journey" },
  { label: "Case Study", href: ROUTES.caseStudy },
  { label: "Internship", href: "#internship" },
];

/** Questions that close conversations. Shown beside every Ask step. */
export const DONT_ASK = [
  "Do you want to buy our software?",
  "Is your current process inefficient?",
  "Don't you think AI would make this faster?",
] as const;

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
  /** The application integration point: the site's contact page. Replace `url` when a dedicated form exists. */
  apply: {
    label: "Apply for Internship",
    url: "/contact",
    note: "Mention “B2B Revenue Engineering” when you get in touch.",
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
