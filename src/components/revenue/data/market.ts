// The Bengaluru Aerospace & Defence market: verified public facts, the
// ecosystem's categories, the starting ICP and the buyer roles. No market-size
// figures for FAI software exist here: none are verified, and the framework
// teaches how to find out rather than guessing.
import type { EvidenceLevel } from "../types";

export interface Source {
  label: string;
  url: string;
  accessed: string;
}

export const SOURCES = {
  investKarnataka: {
    label: "Invest Karnataka — Aerospace & Defence",
    url: "https://investkarnataka.co.in/key-industrie/aerospace-defence/",
    accessed: "26 October 2026",
  },
  as9102c: {
    label: "SAE AS9102C — Aerospace Series: First Article Inspection Requirements",
    url: "https://saemobilus.sae.org/standards/as9102c-aerospace-series-first-article-inspection-requirements",
    accessed: "26 October 2026",
  },
  faiProduct: { label: "FAI Engineer product page", url: "https://fai.ev.engineer/", accessed: "26 October 2026" },
} as const satisfies Record<string, Source>;

/** State-level facts, as the official source states them. They describe the ecosystem, not demand for FAI software. */
export const VERIFIED_FACTS: readonly { value: string; text: string }[] = [
  { value: "70%", text: "of the supplier base for India's Aerospace & Defence is in Karnataka" },
  { value: "2,000+", text: "SMEs with the capability to carry out niche sub-contracting work" },
  { value: "65%", text: "of India's aerospace-related exports originate from Karnataka" },
  { value: "25%", text: "of India's aircraft and spacecraft industry is based in Karnataka" },
];

export const FACTS_CAVEAT =
  "These are state-level ecosystem facts as published by the Government of Karnataka's investment portal. They are not a market size for FAI software, and they do not mean every supplier prepares FAIs or has the same pain.";

export const ANCHORS: readonly { name: string; text: string; verify?: string }[] = [
  {
    name: "Bengaluru aerospace cluster",
    text: "Home to HAL, ISRO, NAL and DRDO laboratories, and to large Airbus and Boeing research and technology centres. The official portal ranks Bengaluru among the top three global aerospace cities for attracting foreign investment.",
  },
  {
    name: "Devanahalli Hi-tech Aerospace & Defence Park",
    text: "A dedicated park of about 2,000 acres near Bengaluru, with capabilities across forging, precision machining, surface treatment and aero assemblies.",
  },
  {
    name: "Peenya and other Bengaluru industrial areas",
    text: "Large general manufacturing estates where some precision suppliers work. Many companies there do no aerospace work at all.",
    verify: "Verify aerospace relevance account by account.",
  },
  {
    name: "Karnataka A&D hubs",
    text: "The state is also developing A&D hubs in Belagavi, Mysuru, Tumakuru and Chamarajanagara, and an A&D SEZ at Belagavi. Bengaluru comes first in this framework.",
    verify: "Outside the initial Bengaluru focus.",
  },
];

export interface MarketCategory {
  id: string;
  name: string;
  /** Why the category may matter for FAI work: a hypothesis, never a fact. */
  hypothesis: string;
  /** How likely the category is to prepare first-article documentation, before any customer evidence. */
  relevance: "Higher" | "Medium" | "Lower";
  verify: string;
}

export const MARKET_CATEGORIES: readonly MarketCategory[] = [
  { id: "primes", name: "OEMs / Primes / DPSUs", relevance: "Lower", hypothesis: "Usually receive and review FAI packages from suppliers rather than prepare them for others.", verify: "Do they set FAI requirements that flow down to suppliers? They are customers of the ICP, not the ICP." },
  { id: "tier1", name: "Tier-1 / Tier-2 suppliers", relevance: "Higher", hypothesis: "Make or assemble parts to customer drawings and may both prepare and receive FAIs.", verify: "How many new or revised part introductions per year?" },
  { id: "machining", name: "Precision machining MSMEs", relevance: "Higher", hypothesis: "Drawing-driven parts with many characteristics; FAIs may be prepared by a small quality team.", verify: "Do aerospace customers require AS9102-style FAIs from them?" },
  { id: "fabrication", name: "Sheet metal & fabrication", relevance: "Medium", hypothesis: "Drawing-driven, but characteristic counts and FAI depth vary.", verify: "Which customers ask for first-article documentation?" },
  { id: "special", name: "Special processes", relevance: "Medium", hypothesis: "Heat treatment, surface treatment and NDT providers supply process evidence more often than dimensional FAIs.", verify: "Do they prepare FAIs, or contribute certificates to someone else's?" },
  { id: "metrology", name: "Inspection / metrology services", relevance: "Higher", hypothesis: "May prepare inspection reports and Form 3 tables for several clients.", verify: "Could they be a partner or channel rather than a customer?" },
  { id: "assemblies", name: "Aerospace assemblies", relevance: "Medium", hypothesis: "Assembly FAIs include sub-tier evidence; drawing extraction may be one part of a bigger task.", verify: "How do they collect FAIs from their sub-tier suppliers?" },
  { id: "tooling", name: "Tooling, jigs & fixtures", relevance: "Lower", hypothesis: "Drawing-driven but often outside formal FAI requirements.", verify: "Do any customers require first-article reports for tooling?" },
  { id: "defence", name: "Defence suppliers", relevance: "Medium", hypothesis: "May have strict data-handling rules; cloud tools may be restricted.", verify: "What can and cannot leave their environment?" },
  { id: "engineering", name: "Engineering services", relevance: "Lower", hypothesis: "Create drawings rather than inspect parts; possible influencers or partners.", verify: "Do they support suppliers with FAI documentation?" },
  { id: "quality", name: "Quality & certification support", relevance: "Medium", hypothesis: "Consultants who help suppliers with AS9100 / AS9102 could be channels or referrers.", verify: "Would they recommend tools to their clients? On what terms?" },
];

/** What to record for every account researched. Never fabricated. */
export const ACCOUNT_FIELDS = [
  "Company name",
  "Location",
  "Website",
  "Publicly stated capabilities",
  "Aerospace / defence relevance",
  "Manufacturing type",
  "Likely quality-workflow relevance",
  "Public certifications (if verified)",
  "Public customer / sector information (if verified)",
  "Number of likely buyer roles identified",
  "Evidence source",
  "Last researched date",
  "ICP Fit score",
  "Confidence level",
] as const;

export const ICP_HYPOTHESIS =
  "Bengaluru Aerospace & Defence manufacturing MSMEs that handle drawing-driven inspection / first-article documentation and may still use labour-intensive PDF, spreadsheet or mixed workflows.";

export const ICP_TIERS: readonly { tier: "A" | "B" | "C"; name: string; effort: string; signals: readonly string[] }[] = [
  {
    tier: "A",
    name: "High Fit",
    effort: "Research deeply, multi-thread, pursue discovery.",
    signals: [
      "Recurring aerospace manufacturing",
      "Drawing-driven inspection",
      "Frequent new / revised part introductions",
      "Visible quality team",
      "Recurring FAI / first-article requirements",
      "Customer-driven quality documentation",
      "Potential need for traceable characteristic management",
    ],
  },
  { tier: "B", name: "Medium Fit", effort: "Research further before outreach.", signals: ["Some relevant signals, but not enough evidence yet"] },
  { tier: "C", name: "Research / Nurture", effort: "Nurture with content; do not chase.", signals: ["Weak or unclear fit"] },
];

export const SEGMENT_DIMENSIONS = ["Manufacturing type", "Scale", "Customer type", "FAI relevance", "Operational maturity"] as const;

export interface BuyerRole {
  id: string;
  role: string;
  likely: string;
  cares: string;
  fears: string;
}

export const BUYER_ROLES: readonly BuyerRole[] = [
  { id: "user", role: "User", likely: "Quality engineer / FAI coordinator / inspector", cares: "Less repetitive entry, fewer reconciliation errors, finishing packages on time.", fears: "A new tool that adds work, or errors blamed on them." },
  { id: "champion", role: "Champion", likely: "Senior quality engineer or quality lead", cares: "Fixing a problem they own; recognition for improving the process.", fears: "Backing a tool that fails in front of management or a customer." },
  { id: "technical", role: "Technical Evaluator", likely: "Quality head / QA manager", cares: "Accuracy, fit with customer requirements, how records are reviewed.", fears: "Non-conforming documentation reaching a customer." },
  { id: "decision", role: "Decision Maker", likely: "Quality head, operations head or MD in an MSME", cares: "Delivery, customer satisfaction, team capacity.", fears: "Disruption during a busy delivery period." },
  { id: "economic", role: "Economic Buyer", likely: "Owner / MD / finance", cares: "Payback, cash, customer retention.", fears: "Paying for software nobody uses." },
  { id: "gatekeeper", role: "Procurement / IT / Security", likely: "Purchase team, IT admin, customer security flow-down", cares: "Vendor onboarding, data handling, contract terms.", fears: "Engineering data leaving controlled environments." },
];

/** The default evidence level of each verified fact on this page. */
export const FACTS_LEVEL: EvidenceLevel = "research";
