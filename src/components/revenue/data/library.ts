// The permanent libraries: pain hypotheses, the question bank, the DON'T list,
// objections, stop and loss reasons, feedback categories, reviews, and the
// concepts the Learn views teach.

export interface Pain {
  id: string;
  group: string;
  text: string;
}

/** Every pain starts as an assumption; only the user's own evidence moves it. Inspired by the AQIP operating manual, not proven by it. */
export const PAIN_GROUPS: readonly { id: string; name: string; pains: readonly string[] }[] = [
  {
    id: "extraction",
    name: "Drawing / Requirement Extraction",
    pains: [
      "Manual identification of dimensions, tolerances, GD&T and notes",
      "Manual ballooning",
      "Missed characteristics",
      "Duplicate / inconsistent balloon numbers",
      "Manual characteristic tables",
      "Repetitive re-entry",
    ],
  },
  {
    id: "accountability",
    name: "Characteristic Accountability",
    pains: ["Drawing, inspection sheet and report drifting apart", "Results linked to the wrong balloon", "Difficulty tracing requirement → result"],
  },
  {
    id: "fair",
    name: "FAI / FAIR Preparation",
    pains: [
      "Gathering information from multiple sources",
      "Manual Form 3 preparation",
      "Line-by-line review",
      "Incomplete packages",
      "Package rejection / return",
      "Delayed first delivery",
    ],
  },
  {
    id: "revision",
    name: "Revision / Configuration",
    pains: ["Comparing drawing revisions manually", "Uncertainty about partial vs full rework", "Risk of using the wrong revision"],
  },
  {
    id: "measurement",
    name: "Measurement Evidence",
    pains: ["Re-keying measurement values", "Transcription risk", "Fragmented CMM / gauge evidence"],
  },
  {
    id: "audit",
    name: "Audit / Customer Evidence",
    pains: ["Evidence scattered across PDF / Excel / email / shared drives", "Time spent reconstructing evidence", "Customer approval delays"],
  },
];

export const PAINS: readonly Pain[] = PAIN_GROUPS.flatMap((group) =>
  group.pains.map((text, i) => ({ id: `${group.id}-${i + 1}`, group: group.name, text })),
);

export interface Question {
  id: string;
  category: string;
  text: string;
}

export const QUESTION_CATEGORIES: readonly { id: string; name: string; questions: readonly string[] }[] = [
  {
    id: "process",
    name: "Current Process",
    questions: [
      "Can you walk me through what happens when a new or revised drawing is received?",
      "Who identifies inspection characteristics?",
      "How are balloons created today?",
      "Where is the characteristic list maintained?",
      "How are measurement results entered?",
      "Who reviews the completed FAI package?",
    ],
  },
  {
    id: "effort",
    name: "Effort",
    questions: [
      "Which part consumes the most engineering or quality time?",
      "How many people are involved?",
      "Which steps are repeated?",
      "Which steps depend heavily on individual experience?",
    ],
  },
  {
    id: "error",
    name: "Error / Rework",
    questions: [
      "Where do errors most commonly occur?",
      "What typically causes a package to be returned?",
      "How are missed or duplicate characteristics detected?",
      "How do you handle drawing revisions?",
    ],
  },
  {
    id: "frequency",
    name: "Frequency",
    questions: ["How often do you prepare new, partial or repeat FAIs?", "Does the workload vary by customer or part family?"],
  },
  {
    id: "impact",
    name: "Business Impact",
    questions: [
      "What happens when FAI preparation is delayed?",
      "Does it affect production release or customer approval?",
      "Does it affect delivery?",
      "How much review effort is required before submission?",
    ],
  },
  {
    id: "technology",
    name: "Technology",
    questions: [
      "Which tools do you currently use?",
      "Which parts are automated?",
      "Which parts remain manual?",
      "Are drawings / quality records allowed to leave your environment?",
      "Are there restrictions on cloud tools?",
    ],
  },
  {
    id: "buying",
    name: "Buying / Adoption",
    questions: [
      "If you wanted to improve this process, who would be involved?",
      "Who would evaluate the technical fit?",
      "Who approves software?",
      "What would you need to see before trying a new tool?",
      "Would you prefer sample evaluation, pilot or full implementation?",
      "What evidence would create trust?",
    ],
  },
];

export const QUESTIONS: readonly Question[] = QUESTION_CATEGORIES.flatMap((category) =>
  category.questions.map((text, i) => ({ id: `${category.id}-${i + 1}`, category: category.name, text })),
);

export const DONTS: readonly string[] = [
  "Do not start with \"Do you want to buy our software?\"",
  "Do not assume the customer has a manual problem.",
  "Do not insult Excel, PDF tools or existing processes.",
  "Do not claim \"AI solves everything.\"",
  "Do not say the software guarantees AS9102 compliance.",
  "Do not promise certification.",
  "Do not promise savings before measurement.",
  "Do not promise features not approved by the product team.",
  "Do not ask basic questions already answered publicly on the customer's website.",
  "Do not send confidential information between customers.",
  "Do not upload customer drawings without explicit authorisation.",
  "Do not pressure a prospect to disclose controlled information.",
  "Do not ask for defence-sensitive data unnecessary for discovery.",
  "Do not quote price without understanding scope and approved commercial policy.",
  "Do not use a pilot without success criteria.",
  "Do not keep chasing an account with no pain / urgency / fit.",
  "Do not confuse activity with pipeline quality.",
  "Do not use unapproved compliance language.",
];

export const ALTERNATIVES: readonly { name: string; strength: string; limit: string }[] = [
  { name: "Manual process", strength: "No cost, fully understood, flexible.", limit: "Depends on individual experience; effort grows with volume." },
  { name: "Excel templates", strength: "Familiar, customisable, already approved by customers.", limit: "Balloon numbers and rows are reconciled by hand." },
  { name: "PDF annotation tools", strength: "Already installed; good for markup.", limit: "Balloons and the characteristic list live in separate files." },
  { name: "Internal macros", strength: "Built for the team's exact process.", limit: "Maintained by one person; fragile when they leave." },
  { name: "Specialist ballooning / FAI software", strength: "Mature, feature-rich, established in aerospace.", limit: "Cost and implementation effort may not suit every MSME — verify per account." },
  { name: "QMS modules", strength: "Integrated with the wider quality system.", limit: "May not cover drawing ballooning in depth — verify per account." },
  { name: "Do nothing", strength: "Zero risk of change, zero cost today.", limit: "Any existing pain continues; the customer decides if that is acceptable." },
];

export const OBJECTIONS: readonly { id: string; name: string; meaning: string; response: string; review?: string }[] = [
  { id: "no-need", name: "No need", meaning: "The pain may not exist for them — which is useful evidence.", response: "Thank them, ask what works well today, and record it. Do not argue." },
  { id: "no-priority", name: "No priority", meaning: "Pain exists but is not urgent.", response: "Ask what is a priority, and when this might become one. Nurture, do not chase." },
  { id: "have-tool", name: "Already have a tool", meaning: "An alternative is in place.", response: "Ask what they like about it and where it falls short. Respect it." },
  { id: "security", name: "Security concern", meaning: "Engineering data protection matters.", response: "Use only approved answers from the Trust Checklist; route the rest.", review: "Security Review Needed" },
  { id: "accuracy", name: "Accuracy concern", meaning: "Fear of errors reaching a customer.", response: "Explain that every value is reviewed by a person; offer to measure on a fictitious or authorised sample.", review: "Technical Review Needed" },
  { id: "price", name: "Price", meaning: "Value not yet clear, or budget not available.", response: "Return to value with their numbers; never discount without a trade.", review: "Commercial Review Needed" },
  { id: "procurement", name: "Procurement", meaning: "Vendor onboarding takes time.", response: "Ask for the process and documents early; respect it.", review: "Commercial Review Needed" },
  { id: "management", name: "Management approval", meaning: "The decision maker is not in the room.", response: "Ask what management will need to see; help the champion build it." },
  { id: "internal-build", name: "Internal build", meaning: "They prefer their own macro or tool.", response: "Ask about maintenance and ownership; respect the choice." },
  { id: "timing", name: "Timing", meaning: "Busy period, audits or deliveries.", response: "Agree a specific date to reconnect, and keep it." },
];

export const STOP_REASONS: readonly string[] = [
  "No validated pain",
  "Low frequency",
  "No urgency",
  "Wrong customer",
  "No technical fit",
  "Security mismatch",
  "No decision path",
  "No commercial value",
  "No willingness to evaluate",
  "Poor strategic fit",
];

export const LOSS_REASONS: readonly string[] = [
  "No problem",
  "Low urgency",
  "No budget",
  "Wrong buyer",
  "Competitor",
  "Internal solution",
  "Security",
  "Product gap",
  "Pricing",
  "Procurement",
  "Timing",
  "No decision",
  "No response",
  "Strategic mismatch",
];

export const FEEDBACK_CATEGORIES: readonly string[] = [
  "Problem Evidence",
  "Feature Request",
  "Usability Issue",
  "Accuracy Issue",
  "Security Concern",
  "Integration Requirement",
  "Deployment Requirement",
  "Commercial Objection",
  "Procurement Requirement",
  "Competitor Insight",
  "New Opportunity",
];

export const FEEDBACK_RULE = [
  { count: "1 request", action: "Record" },
  { count: "Repeated pattern", action: "Investigate" },
  { count: "Evidence-backed pattern", action: "Product review" },
] as const;

export const WEEKLY_REVIEW_QUESTIONS: readonly string[] = [
  "What did customers actually tell us?",
  "Which pain is strongest?",
  "Which pain was disproved?",
  "Which segment is responding?",
  "Which buyer role engages?",
  "Which message works?",
  "What objections appeared?",
  "What security concerns appeared?",
  "What product gaps appeared?",
  "What is the qualified pipeline?",
  "What slowed progress?",
  "What will we change next week?",
];

export const BOARDROOM_AGENDA: readonly string[] = [
  "Bengaluru market",
  "Customer segment",
  "Problem hypotheses",
  "Validated evidence",
  "Invalidated assumptions",
  "ICP",
  "Buyer map",
  "Alternatives",
  "Positioning",
  "Product",
  "GTM",
  "Customer conversations",
  "Demo",
  "ROI",
  "Pilot",
  "Pricing",
  "Pipeline",
  "Win / Loss",
  "Product feedback",
  "Revenue evidence",
  "Unit economics",
  "Risks",
  "Next 90 days",
];

export const EXPANSION_PATH = ["Land", "Adopt", "Expand", "Renew", "Refer"] as const;

export const EXPANSION_OPTIONS: readonly string[] = [
  "More users",
  "More quality engineers",
  "Another site",
  "More part families",
  "Enterprise deployment",
  "Integrations",
  "Additional modules",
  "Annual renewal",
  "Support",
  "Partner referrals",
];

export const PRICING_MODELS: readonly { name: string; text: string }[] = [
  { name: "Seat", text: "Per named user. Simple; scales with the team." },
  { name: "Site", text: "One price per location. Easier for procurement; less tied to usage." },
  { name: "Annual subscription", text: "Recurring, budgetable; renewal depends on adoption." },
  { name: "Perpetual + maintenance", text: "One-time licence with yearly support. Some MSMEs prefer capital purchases." },
  { name: "Pilot", text: "Time-boxed, scoped evaluation; paid or unpaid by policy, always with success criteria." },
  { name: "Enterprise", text: "Negotiated scope, deployment and support for larger customers." },
  { name: "Service / integration", text: "Implementation, training or integration work priced separately." },
];

export interface Concept {
  id: string;
  title: string;
  summary: string;
  points: readonly string[];
  days: readonly number[];
}

export const LEARN: Record<"marketing" | "sales" | "revenue", { title: string; intro: string; concepts: readonly Concept[] }> = {
  marketing: {
    title: "Marketing",
    intro: "Marketing decides who to serve, which problem to lead with and why a customer should engage now.",
    concepts: [
      { id: "b2b-marketing", title: "B2B marketing", summary: "Identifying the right customer, problem and reason to engage — not advertising.", points: ["Few accounts, high value", "Group decisions", "Evidence-led"], days: [1] },
      { id: "market-map", title: "Market mapping", summary: "Grouping organisations by what they do, from public sources.", points: ["Categories before companies", "Sources and dates", "No private data"], days: [2] },
      { id: "pain", title: "Pain hypotheses", summary: "Specific, testable statements of who suffers what, when and how often.", points: ["Proof and disproof conditions", "Start at Assumption", "Rank by cost if true"], days: [4, 5] },
      { id: "segmentation", title: "Segmentation", summary: "Groups that share a problem, a buying process and a way to be reached.", points: ["Observable criteria", "Findable in public data", "Few, clear segments"], days: [6] },
      { id: "icp", title: "Ideal Customer Profile", summary: "The accounts most likely to have the problem, value the solution and buy.", points: ["Signals and disqualifiers", "Tiers focus effort", "Versioned with evidence"], days: [7, 41] },
      { id: "personas", title: "Buyer personas", summary: "Roles in the decision: user, champion, evaluator, decider, economic buyer, gatekeeper.", points: ["Roles, not titles", "Cares and fears", "Who enters when"], days: [8, 25] },
      { id: "value-prop", title: "Value proposition", summary: "Problem → solution → outcome → business value, every part supported.", points: ["Customer's words", "Evidence labels", "Remove what you can't support"], days: [11, 49] },
      { id: "positioning", title: "Positioning", summary: "Why change, why now, why this approach, why trust us.", points: ["Choose the comparison", "True and defensible", "Checked against claims"], days: [14] },
      { id: "bmc", title: "Business Model Canvas", summary: "Nine blocks that show whether customer, value, channels, revenue and cost fit together.", points: ["Evidence level per block", "Riskiest assumptions first", "V2 from evidence"], days: [15, 58] },
      { id: "gtm", title: "Go-to-market", summary: "Segment, buyer, message, entry motion and the proof each stage needs.", points: ["One segment first", "Small entry offer", "Measurable"], days: [16] },
      { id: "channels", title: "Channels & content", summary: "Where the ICP already pays attention, and content that teaches before it sells.", points: ["Referrals and events matter", "Hybrid motion", "No mass automation"], days: [17, 18] },
    ],
  },
  sales: {
    title: "Sales",
    intro: "Sales diagnoses, qualifies and progresses a commercial decision — and walks away when it should.",
    concepts: [
      { id: "b2b-sales", title: "B2B sales", summary: "Helping a group decide whether a change is worth making.", points: ["Customer-controlled exit criteria", "Diagnose, don't push", "Disqualify early"], days: [21] },
      { id: "prioritisation", title: "Account prioritisation", summary: "Fit, pain, access, urgency and commercial potential decide where hours go.", points: ["Score + confidence", "Access matters", "Re-rank with evidence"], days: [22] },
      { id: "prospecting", title: "Prospecting", summary: "Finding legitimate stakeholder roles through appropriate channels.", points: ["Public sources", "Roles, not personal data", "Warm routes first"], days: [23, 43] },
      { id: "qualification", title: "Qualification", summary: "Problem, impact, urgency, authority, evaluation path, commercial plausibility.", points: ["Seven criteria for pipeline", "No raw leads", "Defensible ratings"], days: [24, 51] },
      { id: "dmu", title: "Decision-making unit", summary: "Everyone who can say yes or no, and when they enter.", points: ["Multi-thread", "Security and procurement early", "Champion enablement"], days: [25] },
      { id: "outreach", title: "Outreach & messaging", summary: "Context → problem hypothesis → relevance → credibility → small ask.", points: ["Short and specific", "Mentor-approved", "Easy to say no"], days: [26, 27, 44] },
      { id: "discovery", title: "Discovery", summary: "Learning the customer's situation through past-behaviour questions.", points: ["Listen 70–80%", "Said vs inferred", "No demo"], days: [10, 28, 29, 30, 46] },
      { id: "consultative", title: "Consultative selling & demo", summary: "Diagnose before demonstrating; show only what addresses validated pain.", points: ["Honest gaps", "15 minutes", "Current product only"], days: [31, 32, 52] },
      { id: "objections", title: "Objection handling", summary: "Acknowledge, clarify, respond with evidence or an honest limit.", points: ["Objections are information", "Never improvise security", "Some objections are right"], days: [36] },
      { id: "pilot", title: "Pilots / proof of value", summary: "Success criteria, baseline and the decision rule agreed before starting.", points: ["Can fail honestly", "Measured, not felt", "Decision date"], days: [37, 54] },
      { id: "negotiation", title: "Negotiation", summary: "Trade value; don't blindly discount.", points: ["Know your limits", "Tradeables", "Within authority"], days: [38] },
      { id: "pipeline", title: "Pipeline management", summary: "Stage, next action and date for every opportunity — moved by customer commitment.", points: ["Weighted by your own history", "Stop / Continue", "Lost is learning"], days: [39, 55, 57] },
    ],
  },
  revenue: {
    title: "Revenue",
    intro: "Revenue is a system, not a wish: work backwards from the target and forwards from the evidence.",
    concepts: [
      { id: "revenue-math", title: "Revenue math", summary: "Customers, proposals, qualified opportunities, meetings and outreach needed to reach a target.", points: ["Reverse funnel", "Your conversion rates", "Pipeline coverage"], days: [39] },
      { id: "roi", title: "ROI & business value", summary: "Value from time saved, rework avoided or delay reduced — as ranges, from customer inputs.", points: ["Conservative / expected / optimistic", "Measured in pilots", "Never guaranteed"], days: [33, 53] },
      { id: "pricing", title: "Pricing architecture", summary: "Metric, term, packaging and services — set by approved policy.", points: ["Fit the buyer's process", "Hypothesis first", "No ad-hoc quotes"], days: [34] },
      { id: "proposal", title: "Proposal", summary: "Context → validated pain → solution → scope → evidence → success criteria → commercials → next action.", points: ["No surprises", "Customer's words", "Clear next step"], days: [35, 54] },
      { id: "unit-economics", title: "Unit economics", summary: "CAC, ACV, gross margin, sales cycle, payback, renewal, expansion and lifetime value.", points: ["Measured inputs", "No borrowed benchmarks", "Scalable only if LTV covers CAC"], days: [58] },
      { id: "expansion", title: "Land → Adopt → Expand → Renew → Refer", summary: "The journey continues after purchase: adoption, success metrics, reviews and renewal.", points: ["Adoption before expansion", "QBRs with evidence", "Expansion isn't always right"], days: [60] },
      { id: "loss", title: "Lost opportunity analysis", summary: "Lost is not failure if the learning is captured.", points: ["Reason", "What we learned", "What should change"], days: [57] },
    ],
  },
};
