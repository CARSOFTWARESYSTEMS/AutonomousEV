// Execution: the decision framework, the founder playbook, what not to do,
// metrics, the risk register and the 90-day plan.
import type { Level, Tone } from "../types";

export const DECISION_QUESTIONS: readonly { id: string; question: string }[] = [
  { id: "cost", question: "Does it reduce customer cost?" },
  { id: "risk", question: "Does it reduce quality risk?" },
  { id: "approval", question: "Does it shorten time-to-approval?" },
  { id: "traceability", question: "Does it improve traceability?" },
  { id: "data", question: "Does it create reusable structured data?" },
  { id: "network", question: "Does it strengthen network value?" },
];

export const PLAYBOOK: readonly { step: string; text: string }[] = [
  { step: "Learn", text: "Study AS9100 and AS9102, GD&T and how first article inspection is really done before designing anything." },
  { step: "Observe", text: "Sit with quality engineers while they balloon a drawing and build an FAI. Watch; do not pitch." },
  { step: "Interview", text: "Talk to 50 suppliers with the discovery playbook. Ask about the last real job, not about opinions." },
  { step: "Benchmark", text: "Time the existing process on real, completed FAIs so there is a baseline to beat." },
  { step: "Validate", text: "Run the same historical FAIs through AQIP and compare hours, misses and corrections." },
  { step: "Pilot", text: "Run a live, controlled FAI with a design partner, with a person approving every record." },
  { step: "Charge", text: "Ask for payment early. A paid pilot is evidence; a free one is a favour." },
  { step: "Measure", text: "Report ROI in the customer's own numbers: hours, rejections and days to approval." },
  { step: "Improve", text: "Fix the gaps that blocked real work before adding anything new." },
  { step: "Expand", text: "Add the next module for the same customer, then the next site." },
  { step: "Network", text: "Help a satisfied customer bring its suppliers, or its own customer, onto shared evidence." },
  { step: "Scale", text: "Only now invest in repeatable sales, integrations and new regions." },
];

export const ANTI_PATTERNS: readonly { dont: string; because: string }[] = [
  { dont: "Build a complete QMS immediately", because: "The wedge is FAI; breadth before depth wins no one." },
  { dont: "Call everything AI", because: "Customers buy outcomes, and auditors distrust buzzwords." },
  { dont: "Automate engineering approval", because: "Approval is a human authority and must stay one." },
  { dont: "Build without quality-domain experts", because: "Software skill alone will not earn trust in this field." },
  { dont: "Claim compliance without validation", because: "An unproven compliance claim is a liability for the customer." },
  { dont: "Promise impossible extraction accuracy", because: "No model is perfect; the design assumes review." },
  { dont: "Become a custom development company", because: "Bespoke work does not compound into a product." },
  { dont: "Chase every manufacturing industry", because: "Aerospace depth is the differentiator." },
  { dont: "Rely only on grants", because: "Grants fund R&D; customers fund a business." },
  { dont: "Build 100 features without live customers", because: "Unused features are cost, not progress." },
  { dont: "Store sensitive drawings insecurely", because: "One incident can end trust in the whole platform." },
  { dont: "Replace ERP/PLM/MES unnecessarily", because: "AQIP is the evidence layer between them, not their replacement." },
];

export const METRIC_GROUPS: readonly { group: string; label: Tone; metrics: readonly string[] }[] = [
  { group: "Customer Outcome", label: "target", metrics: ["FAI cycle time", "Inspection-preparation time", "Quality-engineering hours saved", "Revision-review time", "Evidence completeness"] },
  { group: "Product", label: "target", metrics: ["Verified characteristics", "Active drawings", "Completed FAIs", "AI correction rate", "Evidence links", "Active organisations"] },
  { group: "Business", label: "target", metrics: ["ARR", "New ARR", "Renewal", "Expansion", "CAC", "Payback", "Gross margin"] },
  { group: "Trust", label: "target", metrics: ["Silent AI approvals = 0", "Traceability gaps", "Security incidents", "Audit coverage", "Customer quality-impact incidents"] },
];

export const NORTH_STAR = {
  metric: "Verified Engineering Characteristics Under Control",
  explanation: "Instead of focusing only on user count, AQIP tracks the amount of verified aerospace manufacturing requirement/evidence managed under controlled workflows.",
  example: "12.4M",
  exampleLabel: "Illustrative future scale",
  exampleNote: "An example of how the metric would read at scale. It is not an achieved result.",
} as const;

export interface Risk {
  id: string;
  risk: string;
  probability: Level;
  impact: Level;
  mitigation: string;
  owner: string;
  warning: string;
}

/** Sample classifications for planning. This register has not been formally audited. */
export const RISKS: readonly Risk[] = [
  { id: "R1", risk: "Building without customers", probability: "High", impact: "High", mitigation: "50 interviews and paid pilots before broad build.", owner: "CEO", warning: "Features shipped that no pilot has used." },
  { id: "R2", risk: "AI accuracy", probability: "High", impact: "High", mitigation: "Benchmark datasets; precision and recall tracked per release.", owner: "CTO", warning: "Correction rate rising in pilots." },
  { id: "R3", risk: "Missing characteristic", probability: "Medium", impact: "High", mitigation: "Mandatory human reconciliation; completeness checks against the drawing.", owner: "CQO", warning: "Any false negative found after approval." },
  { id: "R4", risk: "Hallucinated interpretation", probability: "Medium", impact: "High", mitigation: "Source highlighting and confidence; no unverified value enters a record.", owner: "CTO", warning: "Proposals with no locatable source." },
  { id: "R5", risk: "Configuration mismatch", probability: "Medium", impact: "High", mitigation: "Every record bound to a revision; deterministic checks at release.", owner: "CQO", warning: "Work found against a superseded revision." },
  { id: "R6", risk: "Cybersecurity breach", probability: "Low", impact: "High", mitigation: "Security by design, isolation, testing and incident response.", owner: "CISO", warning: "Unresolved critical findings." },
  { id: "R7", risk: "Defence data restrictions", probability: "High", impact: "Medium", mitigation: "Private and on-prem deployment; data residency options.", owner: "CISO", warning: "Deals stalled on hosting terms." },
  { id: "R8", risk: "Domain expertise gap", probability: "Medium", impact: "High", mitigation: "A Chief Quality Officer and practising advisors from the start.", owner: "CEO", warning: "Customers correcting basic quality terminology." },
  { id: "R9", risk: "Long enterprise sales", probability: "High", impact: "Medium", mitigation: "Start with MSMEs; land small, expand on measured ROI.", owner: "CSO", warning: "Sales cycle lengthening quarter on quarter." },
  { id: "R10", risk: "Custom-development trap", probability: "Medium", impact: "Medium", mitigation: "A product boundary and a decision framework for every request.", owner: "CPO", warning: "Customer-specific code branches." },
  { id: "R11", risk: "Over-broad product scope", probability: "High", impact: "Medium", mitigation: "Year-1 focus on the FAI wedge only.", owner: "CPO", warning: "Roadmap items with no customer attached." },
  { id: "R12", risk: "Grant dependency", probability: "Medium", impact: "Medium", mitigation: "Recurring revenue targets alongside any grant.", owner: "CFO", warning: "Runway that depends on an unconfirmed grant." },
  { id: "R13", risk: "Poor adoption", probability: "Medium", impact: "High", mitigation: "Onboarding plan and weekly-use tracking with customer success.", owner: "Customer Success", warning: "Licensed users who do not log in weekly." },
  { id: "R14", risk: "Competitor response", probability: "Medium", impact: "Medium", mitigation: "Depth in the digital thread, the graph and deployment options.", owner: "CEO", warning: "Lost deals citing a comparable feature." },
  { id: "R15", risk: "Integration complexity", probability: "High", impact: "Medium", mitigation: "Standard formats first; adapters prioritised by customer demand.", owner: "CTO", warning: "Pilots blocked waiting for a connector." },
  { id: "R16", risk: "Standards changes", probability: "Low", impact: "Medium", mitigation: "Standards mapping kept as data and reviewed by the CQO.", owner: "CQO", warning: "A new standard revision announced." },
];

export const RISK_NOTE = "Sample classifications for planning. This register has not been formally audited.";

export const NINETY_DAY: readonly { id: string; phase: string; goal: string; items: readonly { id: string; text: string }[] }[] = [
  {
    id: "d30",
    phase: "Days 1–30",
    goal: "Focus and learn",
    items: [
      { id: "d30-scope", text: "Freeze unnecessary scope" },
      { id: "d30-thesis", text: "Finalise product thesis" },
      { id: "d30-icp", text: "Identify initial ICP" },
      { id: "d30-interviews", text: "Interview 20 companies" },
      { id: "d30-advisors", text: "Recruit 2–3 quality advisors" },
      { id: "d30-benchmark", text: "Benchmark existing FAI workflow" },
      { id: "d30-policy", text: "Define data/security policy" },
      { id: "d30-graph", text: "Create Quality Graph v0.1" },
    ],
  },
  {
    id: "d60",
    phase: "Days 31–60",
    goal: "Find design partners",
    items: [
      { id: "d60-interviews", text: "Reach 50 customer interviews" },
      { id: "d60-partners", text: "Identify 10 design partners" },
      { id: "d60-lighthouse", text: "Select 3 lighthouse candidates" },
      { id: "d60-historical", text: "Run historical FAIs" },
      { id: "d60-baseline", text: "Baseline workflow metrics" },
      { id: "d60-pilot", text: "Define pilot requirements" },
      { id: "d60-dataset", text: "Create benchmark dataset" },
    ],
  },
  {
    id: "d90",
    phase: "Days 61–90",
    goal: "Prove it on live work",
    items: [
      { id: "d90-pilots", text: "Close 3 paid pilots where possible" },
      { id: "d90-live", text: "Run live controlled FAI workflows" },
      { id: "d90-roi", text: "Measure ROI" },
      { id: "d90-gaps", text: "Improve critical product gaps" },
      { id: "d90-case", text: "Create first case study" },
      { id: "d90-baseline", text: "Establish Product Requirement Baseline V1" },
      { id: "d90-roadmap", text: "Confirm Year-1 roadmap" },
    ],
  },
];
