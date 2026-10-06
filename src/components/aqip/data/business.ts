// Business: revenue engines, pricing hypotheses, the business model canvas,
// the network model, the competitive landscape and the moat.
import type { Maturity } from "../types";

export const REVENUE_ENGINES: readonly { id: string; n: number; name: string; how: string; payer: string; starts: Maturity; note: string }[] = [
  { id: "saas", n: 1, name: "SaaS subscription", how: "An annual subscription per organisation, scaled by modules and users.", payer: "Supplier", starts: "planned-y1", note: "The base of recurring revenue." },
  { id: "usage", n: 2, name: "Usage-based processing", how: "A charge per drawing or FAI processed, above an included allowance.", payer: "Supplier", starts: "planned-y1", note: "Lets a small supplier start small." },
  { id: "managed", n: 3, name: "Managed Quality Service", how: "AQIP-assisted preparation of quality packages, delivered as a service.", payer: "Supplier", starts: "planned-y1", note: "Useful for learning in Year 1; must not turn into custom development." },
  { id: "private", n: 4, name: "Secure / private / on-prem deployment", how: "A dedicated or customer-hosted deployment with its own commercial terms.", payer: "Supplier or enterprise", starts: "planned-y1", note: "Often a precondition for defence work." },
  { id: "network", n: 5, name: "OEM Supplier Network", how: "A customer sponsors AQIP access for its suppliers under one agreement.", payer: "OEM, prime or DPSU", starts: "planned-y23", note: "The largest contract shape; needs proven supplier value first." },
  { id: "integrations", n: 6, name: "Enterprise integrations / APIs", how: "Connectors to ERP, PLM, MES and metrology systems, and API access.", payer: "Enterprise", starts: "planned-y23", note: "Deepens the workflow and raises switching cost." },
  { id: "academy", n: 7, name: "Training / AQIP Academy", how: "Training in digital quality practice, FAI and the platform.", payer: "Supplier or individual", starts: "planned-y23", note: "Builds skills and awareness in the ecosystem." },
];

/** A possible future premium module. Dimensions a price could depend on; no price is claimed. */
export const TWIN_REVENUE = {
  name: "3D Inspection Twin",
  kind: "Premium module",
  text: "If customer discovery confirms the need, the 3D Inspection Twin could be offered as a premium module on top of the subscription. It is research today, so this is a commercial hypothesis, not an offer.",
  dimensions: ["Parts processed", "Reconstruction complexity", "CAD conversion", "Seats", "Enterprise integration"],
  note: "No price is published for this module. Any figure would have to come from validated customer demand.",
} as const;

export const PRICING_LABEL = "Illustrative commercial hypotheses — validate through customer discovery.";

export const PRICING: readonly { segment: string; price: string }[] = [
  { segment: "Small supplier", price: "₹1–3 lakh/year" },
  { segment: "Growth Aerospace MSME", price: "₹3–8 lakh/year" },
  { segment: "Large Supplier", price: "₹8–20 lakh/year" },
  { segment: "Enterprise / Prime", price: "₹20 lakh–₹1 crore+ depending on scope" },
];

type RoiKey = "faisPerMonth" | "characteristicsPerFai" | "hoursPerFai" | "costPerHour" | "timeReductionPct" | "reworkCostPerYear" | "softwareCostPerYear";

/** The calculator's inputs, in the three groups a reader thinks about them in. */
export const ROI_GROUPS: readonly { id: string; title: string; fields: readonly { key: RoiKey; label: string; unit: string; step: number; max?: number }[] }[] = [
  {
    id: "current",
    title: "Current Process",
    fields: [
      { key: "faisPerMonth", label: "First article inspections", unit: "FAIs / month", step: 1 },
      { key: "characteristicsPerFai", label: "Average characteristics", unit: "per FAI", step: 10 },
      { key: "hoursPerFai", label: "Engineer effort", unit: "hours / FAI", step: 1 },
      { key: "costPerHour", label: "Engineer loaded cost", unit: "₹ / hour", step: 50 },
      { key: "reworkCostPerYear", label: "Rework and rejection cost", unit: "₹ / year", step: 10000 },
    ],
  },
  {
    id: "improvement",
    title: "Improvement Assumptions",
    fields: [{ key: "timeReductionPct", label: "Expected time reduction", unit: "%", step: 5, max: 100 }],
  },
  {
    id: "commercial",
    title: "Commercial Estimate",
    fields: [{ key: "softwareCostPerYear", label: "Software cost", unit: "₹ / year", step: 10000 }],
  },
];

/** The canvas blocks, with the grid area each takes on the desktop canvas. */
export const BUSINESS_MODEL_CANVAS: readonly { id: string; area: string; title: string; items: readonly string[]; flow?: boolean }[] = [
  { id: "partners", area: "partners", title: "Partners / Ecosystem", items: ["MSMEs", "OEMs", "CMM/metrology vendors", "Quality consultants", "Industry associations", "Testing/calibration ecosystem"] },
  { id: "activities", area: "activities", title: "Key Activities", items: ["Product development", "Validation", "Deployment", "Customer success", "Security", "Standards mapping"] },
  { id: "resources", area: "resources", title: "Key Resources", items: ["Quality Graph", "Domain expertise", "Verified datasets", "AI platform", "Cybersecurity", "Customer integrations", "Trust"] },
  { id: "value", area: "value", title: "Value Proposition", items: ["Faster quality workflow", "Traceable evidence", "Fewer errors", "Stronger configuration control", "Supplier visibility", "Lower quality-engineering burden"] },
  { id: "relationship", area: "relationship", title: "Customer Relationship", items: ["Design Partner", "Pilot", "Subscription", "Expansion", "Supplier Network"], flow: true },
  { id: "channels", area: "channels", title: "Channels", items: ["Founder-led sales", "Industry bodies", "OEM referrals", "Metrology ecosystem", "Consultants", "Supplier networks"] },
  { id: "segments", area: "segments", title: "Customer Segments", items: ["Aerospace/defence MSMEs", "Tier-1 suppliers", "OEMs/primes", "DPSUs", "Space manufacturers"] },
  { id: "costs", area: "costs", title: "Costs", items: ["Engineering", "AI compute", "Cybersecurity", "Domain specialists", "Sales", "Customer success", "Infrastructure"] },
  { id: "revenue", area: "revenue", title: "Revenue", items: ["SaaS", "Usage", "Managed services", "Enterprise", "Integrations", "Network", "Training"] },
];

export const NETWORK_MODELS: readonly { id: string; name: string; text: string }[] = [
  { id: "a", name: "Model A", text: "Supplier buys AQIP." },
  { id: "b", name: "Model B", text: "OEM sponsors AQIP access across its supplier network." },
];

export const NETWORK_BENEFITS: readonly { who: string; items: readonly string[] }[] = [
  { who: "OEM", items: ["Standardised evidence", "Better visibility"] },
  { who: "Supplier", items: ["Lower adoption cost", "Easier customer collaboration"] },
  { who: "AQIP", items: ["Large multi-organisation recurring contract"] },
];

export const FLYWHEEL = ["More OEMs", "More Suppliers", "More Quality Workflows", "More Structured Evidence", "Greater Network Value", "More OEM Adoption"] as const;

export const COMPETITIVE_CATEGORIES: readonly { category: string; strength: string }[] = [
  { category: "FAI software", strength: "Established AS9102 form workflows." },
  { category: "Drawing ballooning software", strength: "Fast annotation of drawings." },
  { category: "QMS", strength: "Document control, audits and corrective action." },
  { category: "PLM/QMS suites", strength: "Enterprise-wide product and quality data." },
  { category: "Metrology software", strength: "Measurement programming and reporting." },
  { category: "Supplier-quality platforms", strength: "Supplier scorecards and portals." },
  { category: "Generic document AI", strength: "Broad extraction from unstructured documents." },
];

export const NOT_STRATEGY = "another ballooning tool";

export const DIFFERENTIATORS = [
  "Requirement-to-evidence digital thread",
  "Human-verifiable engineering AI",
  "2D-to-3D inspection intelligence with verified geometry",
  "Cybersecurity and AI assurance built into the platform",
  "Quality Graph",
  "Revision/configuration intelligence",
  "MSME-oriented deployment",
  "Defence-grade/private deployment options",
  "Supplier network architecture",
  "Evidence portability/API",
  "India-oriented aerospace supplier ecosystem",
  "Long-term factory-to-field quality intelligence",
] as const;

/** The moat, from its foundation (layer 1) to the layer that takes longest to earn. */
export const MOAT_LAYERS = [
  "Domain expertise",
  "Verified aerospace drawing/quality benchmark datasets",
  "Quality Graph",
  "Workflow integrations",
  "Historical structured quality evidence",
  "Supplier network",
  "Industry trust",
] as const;

export const MOAT_MESSAGE = "AI models will change. Trust, data structure, workflow depth and network integration are harder to replace.";
