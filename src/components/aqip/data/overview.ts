// Positioning, executive summary, the India opportunity, the core problem,
// stakeholder value and product principles.
import type { Tone } from "../types";

export const AQIP = {
  short: "AQIP",
  name: "Aerospace Quality Intelligence Platform",
  route: "/internships/aerospace-quality-intelligence-platform",
  /** The id of the page root, which carries the view mode the stylesheet reads. */
  rootId: "aqip-root",
  eyebrow: "Aerospace Manufacturing • Quality Intelligence • GenAI & Agentic AI",
  tagline: "The Trust Infrastructure for Aerospace & Defence Manufacturing",
  narrative: "Help aerospace manufacturers prove that every part was built exactly as engineering intended.",
  longTermVision: "From requirement to evidence, supplier to OEM, and factory to field.",
  philosophy: ["AI interprets.", "Humans approve.", "Software proves."],
  safetyPrinciple: "Zero Silent AI Approval",
  relationship:
    "An EV Society™ initiative for advancing engineering capability and aerospace manufacturing quality research, with commercial product development and deployment through iTelematics® Software Private Limited.",
  horizon: "2026–2031",
  reviewed: "2026-10-06",
  reviewedLabel: "6 October 2026",
} as const;

/** The digital thread, in the order a requirement travels it. */
export const DIGITAL_THREAD = ["Engineering Requirement", "Manufacturing", "Inspection", "Measurement", "Evidence", "Acceptance"] as const;

/** The progression the whole page argues for: where it starts and what it can become. */
export const STRATEGIC_HIERARCHY: readonly { label: string; note: string; tone: Tone }[] = [
  { label: "FAI Engineer", note: "The existing prototype foundation", tone: "current" },
  { label: "AQIP", note: "Years 1–2: the product", tone: "planned" },
  { label: "Aerospace Quality Network", note: "Year 3: suppliers and customers connected", tone: "planned" },
  { label: "Aerospace Manufacturing Trust Infrastructure", note: "Year 5: the long-term destination", tone: "vision" },
];

export const EXECUTIVE_SUMMARY =
  "AQIP — the Aerospace Quality Intelligence Platform — is not merely First Article Inspection (FAI) software. It is intended to become the quality intelligence and evidence layer for aerospace and defence manufacturing: one traceable record that connects the engineering definition of a part to how it was made, inspected, measured and accepted. FAI is the initial market-entry wedge, because it is mandatory, recurring and painful for every supplier. From there the platform is planned to extend into production quality, configuration control, supplier collaboration and customer acceptance. AI helps interpret drawings and evidence; a qualified person approves every controlled record; the software keeps the proof. The long-term destination is aerospace manufacturing trust infrastructure. Today AQIP is an early-stage initiative: most capabilities described on this page are planned, not yet built.";

export const CONNECTS = [
  "Engineering definition",
  "Manufacturing",
  "Inspection",
  "Measurement",
  "Material and process evidence",
  "Configuration",
  "Quality approval",
  "Supplier collaboration",
  "Customer acceptance",
] as const;

export const WHERE_WE_START = ["Drawing", "Inspection", "FAI"] as const;
export const WHERE_WE_ARE_GOING = ["Engineering", "Production", "Quality", "Supplier", "OEM", "Field"] as const;

/** Qualitative market drivers. No market-size figures: none are verified in this repository. */
export const MARKET_DRIVERS: readonly { title: string; text: string; sources?: readonly number[] }[] = [
  {
    title: "More aerospace and defence manufacturing in India",
    text: "More aircraft, space and defence hardware is being designed and built domestically. More production means more part numbers, more suppliers and more quality records.",
    sources: [1, 5],
  },
  {
    title: "Wider private and MSME participation",
    text: "Procurement and innovation programmes are opening this work to private companies, start-ups and MSMEs, many of them new to aerospace quality requirements.",
    sources: [2, 3, 4],
  },
  {
    title: "Indigenisation",
    text: "Replacing imported items with Indian-made ones moves qualification and first-article work to domestic suppliers.",
    sources: [1],
  },
  {
    title: "Deeper supply chains",
    text: "As primes and public-sector undertakings outsource more, quality requirements flow down through more tiers, and every tier has to return evidence.",
  },
  {
    title: "A growing quality and documentation burden",
    text: "Each new part, customer and drawing revision adds inspection planning, FAI and records that are still largely prepared by hand.",
  },
  {
    title: "Rising traceability expectations",
    text: "Customers increasingly expect a supplier to show quickly which material, process, measurement and approval stand behind a delivered part.",
    sources: [6],
  },
  {
    title: "Export readiness",
    text: "Suppliers that want international aerospace work have to meet the quality-system and first-article expectations used across global supply chains.",
    sources: [6, 7, 8],
  },
  {
    title: "Tighter supplier qualification",
    text: "Becoming and staying an approved aerospace supplier depends on consistent, auditable quality evidence.",
  },
];

export const CORE_PROBLEM =
  "The major problem is not paperwork itself. It is the cost and complexity of converting engineering requirements into complete, traceable and audit-ready manufacturing quality evidence.";

export const PROBLEM_FLOW = ["Engineering intent", "Manufacturing", "Inspection", "Measurement", "Evidence", "Quality approval"] as const;

/** Where the evidence lives today. */
export const FRAGMENTS = ["PDF", "Excel", "Email", "CMM files", "Material certificates", "Shared drives", "Paper travellers", "ERP", "QMS", "FAI reports"] as const;

export const STAKEHOLDERS: readonly { id: string; name: string; gives: string; wins: readonly string[] }[] = [
  {
    id: "msme",
    name: "Aerospace / Defence MSME",
    gives: "Gives: structured quality evidence, produced as a by-product of the work.",
    wins: [
      "Lower repetitive quality workload",
      "Quicker FAI preparation",
      "Faster customer approval",
      "Improved traceability",
      "Fewer missed characteristics",
      "Improved supplier credibility",
      "Ability to scale without proportionally scaling paperwork",
    ],
  },
  {
    id: "oem",
    name: "OEM / Prime / DPSU / Customer",
    gives: "Gives: clear requirements, faster review and repeat business.",
    wins: ["Stronger supplier quality", "Consistent evidence", "Faster review", "Improved supplier onboarding", "Better traceability", "Visibility across quality workflows"],
  },
  {
    id: "ecosystem",
    name: "End User / Aerospace & Defence Ecosystem",
    gives: "Gives: the demand for assured, reliable hardware.",
    wins: ["Higher manufacturing assurance", "Stronger configuration control", "Fewer quality escapes", "Stronger reliability culture"],
  },
  {
    id: "aqip",
    name: "AQIP / iTelematics",
    gives: "Gives: the platform, deployment, security and support.",
    wins: ["Recurring SaaS revenue", "Enterprise revenue", "Network revenue", "Integration revenue", "Workflow stickiness", "Proprietary quality graph", "Industry trust"],
  },
];

export const PRINCIPLES: readonly { title: string; text: string }[] = [
  { title: "Human accountability", text: "A named, authorised person approves every controlled record." },
  { title: "Explainable AI", text: "Every AI suggestion shows what it read and why it concluded what it did." },
  { title: "Source-level traceability", text: "Each characteristic points back to its exact place on the source drawing." },
  { title: "Configuration correctness", text: "Work is always tied to the revision it was done against." },
  { title: "Deterministic control for critical decisions", text: "Rules, not probabilities, decide what may be released." },
  { title: "Security by design", text: "Customer engineering data is protected from the first line of code." },
  { title: "Evidence over assumption", text: "A claim counts only when a record supports it." },
  { title: "Interoperability", text: "AQIP connects to the ERP, PLM, MES, CAD and CMM systems a factory already uses." },
  { title: "MSME usability", text: "A small quality team should be productive without a long implementation project." },
  { title: "Continuous validation", text: "Extraction and workflow quality are measured against verified benchmarks, release after release." },
];

export const SAFETY_RULE = "AI must never silently release a controlled aerospace quality record.";
