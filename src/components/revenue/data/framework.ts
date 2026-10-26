// The framework itself: identity, routes, navigation, the internship and its
// gates, and the 60 days' calendar (phases, weeks, unlocks). The ten steps the
// learner sees, and the content of the step pages, are in ./steps.
import type { ToolId } from "../types";

const BASE = "/internships/marketing-sales";

export const FRAMEWORK = {
  name: "Marketing & Sales",
  descriptor: "A Practical B2B Customer-to-Revenue Framework",
  programme: "12-Week Marketing & Sales Internship",
  route: BASE,
  /** The id of the page root; the stylesheet's theme is scoped to it. */
  rootId: "revenue-root",
  eyebrow: "Marketing & Sales",
  headline: "Learn Marketing. Learn Sales. Create Value. Generate Revenue.",
  /** The headline as the hero sets it: one line each. */
  headlineLines: ["Learn Marketing.", "Learn Sales.", "Create Value.", "Generate Revenue."],
  lede: "A practical step-by-step guide to market and sell Balloon Drawings & AS9102 FAI Reporting software to Bengaluru Aerospace & Defence MSMEs.",
  context: ["Customer", "Pain", "Marketing", "Sales", "Value", "Revenue"],
  /** The one question everything on the platform helps to answer. */
  question: "Can we solve a real customer problem well enough that they will pay for it?",
  /** What the framework promises, and all it promises. */
  goal: "Build a repeatable process that improves the probability of creating customer value and converting qualified opportunities into sustainable revenue.",
  reviewed: "2026-10-26",
  reviewedLabel: "26 October 2026",
} as const;

/** Every page of the platform. The step pages teach; Today is where the work is done; Accounts and Pipeline are personal tools. */
export const ROUTES = {
  overview: BASE,
  today: `${BASE}/today`,
  customer: `${BASE}/customer`,
  marketing: `${BASE}/marketing`,
  sales: `${BASE}/sales`,
  pilot: `${BASE}/pilot`,
  close: `${BASE}/close`,
  revenue: `${BASE}/revenue`,
  caseStudy: `${BASE}/case-study`,
  accounts: `${BASE}/accounts`,
  pipeline: `${BASE}/pipeline`,
} as const;

export type RouteId = keyof typeof ROUTES;

/** The ten steps, on the overview. */
export const JOURNEY_HREF = `${BASE}#journey`;

/** Today opened on a given day. */
export const todayHref = (day?: number) => (day ? `${ROUTES.today}#day-${day}` : ROUTES.today);

/** Who designed the framework, and where the profile lives. */
export const DESIGNED_BY = {
  profileUrl: "https://aerospace.ev.engineer/about/sudarshana-karkala",
} as const;

/** The first case study. The framework is built so a second product can be added beside it. */
export const CASE_STUDY = {
  id: "fai-as9102",
  label: "Live Case Study",
  title: "Balloon Drawings & AS9102 FAI Reporting",
  product: "FAI Engineer",
  productUrl: "https://fai.ev.engineer/",
  contextUrl: "/internships/aerospace-quality-intelligence-platform",
  market: "Bengaluru Aerospace & Defence MSMEs",
  geography: "Bengaluru",
  /** The customer problem is not known yet: it is what the learner validates. */
  problem: "To be validated with customers.",
} as const;

export interface Phase {
  n: 1 | 2 | 3;
  name: string;
  /** The month's name: Marketing, Sales, Execution. */
  label: string;
  /** The short name the progress view uses: Market, Sales, Revenue. */
  short: string;
  weeks: string;
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
  journey: { label: "The 10 steps", href: JOURNEY_HREF },
  cockpit: { label: "Pipeline summary", href: ROUTES.pipeline, unlock: "pipeline" },
  market: { label: "Bengaluru market", href: `${ROUTES.caseStudy}#market`, unlock: "market" },
  icp: { label: "Ideal customer & buyers", href: `${ROUTES.caseStudy}#icp`, unlock: "icp" },
  pains: { label: "Pain hypotheses", href: `${ROUTES.caseStudy}#problems`, unlock: "pains" },
  accounts: { label: "Accounts", href: ROUTES.accounts, unlock: "accounts" },
  questions: { label: "Customer Meeting Guide", href: `${ROUTES.sales}#meeting-guide` },
  meetings: { label: "Meeting notes", href: `${ROUTES.accounts}#meetings` },
  pipeline: { label: "Pipeline", href: ROUTES.pipeline, unlock: "pipeline" },
  pilot: { label: "Pilot charter", href: `${ROUTES.pipeline}#pilot`, unlock: "pilot" },
  "learn-marketing": { label: "Marketing", href: ROUTES.marketing },
  "learn-sales": { label: "Sales", href: ROUTES.sales },
  "learn-revenue": { label: "Revenue & profit", href: ROUTES.revenue },
  product: { label: "FAI product", href: `${ROUTES.caseStudy}#product` },
  evidence: { label: "Approved claims", href: `${ROUTES.caseStudy}#evidence` },
  roi: { label: "ROI calculator", href: `${ROUTES.caseStudy}#roi`, unlock: "roi" },
  feedback: { label: "Product feedback", href: `${ROUTES.caseStudy}#feedback` },
  review: { label: "Weekly review", href: ROUTES.today },
  decisions: { label: "Decision log", href: `${ROUTES.pipeline}#decisions` },
  challenges: { label: "Weekly challenge", href: ROUTES.today },
  boardroom: { label: "Final review", href: todayHref(59) },
  internship: { label: "Mentor check", href: ROUTES.today },
};

/** Tools Today shows inside the day itself, so it never links to them. */
export const INLINE_TOOLS: readonly ToolId[] = ["today", "review", "challenges", "boardroom", "internship"];

/** The header's destinations from 1024px. */
export const HEADER_NAV: readonly { page: RouteId; label: string }[] = [
  { page: "overview", label: "Overview" },
  { page: "customer", label: "Customer" },
  { page: "marketing", label: "Marketing" },
  { page: "sales", label: "Sales" },
  { page: "caseStudy", label: "Case Study" },
];

export type BarId = "today" | "journey" | "customer" | "sales" | "more";

/** The bottom bar below 1024px: four places, then More. */
export const BAR_NAV: readonly { id: Exclude<BarId, "more">; label: string; href: string }[] = [
  { id: "today", label: "Today", href: ROUTES.today },
  { id: "journey", label: "Journey", href: JOURNEY_HREF },
  { id: "customer", label: "Customer", href: ROUTES.customer },
  { id: "sales", label: "Sales", href: ROUTES.sales },
];

/** Which bottom-bar place each page belongs to. */
export const BAR_OF: Record<RouteId, BarId> = {
  overview: "journey",
  today: "today",
  customer: "customer",
  marketing: "journey",
  sales: "sales",
  pilot: "journey",
  close: "journey",
  revenue: "journey",
  caseStudy: "more",
  accounts: "more",
  pipeline: "more",
};

/** Questions that close conversations. Shown beside every list of questions to ask. */
export const DONT_ASK = [
  "Do you want to buy our software?",
  "What is your budget?",
  "Is your current process bad?",
  "Don't you think AI can solve this?",
  "Can we replace your existing system?",
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
    note: "Mention “Marketing & Sales internship” when you get in touch.",
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
