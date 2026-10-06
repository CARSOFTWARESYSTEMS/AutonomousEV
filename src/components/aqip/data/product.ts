// Product: modules, maturity, the synthetic demonstrations, architecture,
// AI governance, security, boundary and the long-term concepts.
import type { Maturity, Tone } from "../types";

/** The fictitious part used by every demonstration on the page. Not a real part or drawing. */
export const SYNTHETIC_PART = { part: "AQ-1042", description: "Fictitious aerospace bracket", revision: "C", serial: "000148" } as const;

/** What each of the six maturity labels means on this page. None of them means production-ready. */
export const MATURITY_LEGEND: Record<Maturity, string> = {
  prototype: "Exists today in the FAI Engineer prototype. A foundation, not a production product.",
  development: "Being built now, beyond the prototype. Not released.",
  "planned-y1": "Planned for Year 1 (2026–27). Not yet built.",
  "planned-y23": "Planned for Years 2 and 3 (2027–29). Not yet built.",
  research: "Under investigation. Depends on validation, and may change or stop.",
  vision: "Year 4 and beyond. A direction, not a commitment.",
};

export const MODULES: readonly { n: number; name: string; text: string; maturity: Maturity }[] = [
  { n: 1, name: "Drawing Intelligence", text: "Reads engineering drawings and proposes characteristics for a person to verify.", maturity: "development" },
  { n: 2, name: "Digital Characteristics", text: "One accountable record per characteristic, with its source and revision.", maturity: "prototype" },
  { n: 3, name: "Inspection Planning", text: "Builds an inspection plan from verified characteristics and approved rules.", maturity: "planned-y1" },
  { n: 4, name: "Measurement / CMM Hub", text: "Imports measurement results and maps them to characteristics.", maturity: "planned-y1" },
  { n: 5, name: "FAI / FAIR", text: "Assembles first article inspection reports and shows what is missing. The prototype covers an AS9102 Form 3-oriented foundation only.", maturity: "prototype" },
  { n: 6, name: "Revision & Configuration Intelligence", text: "Compares revisions and scopes the quality work a change affects.", maturity: "planned-y1" },
  { n: 7, name: "Quality Evidence", text: "Links certificates, results and approvals to the requirement they satisfy.", maturity: "planned-y1" },
  { n: 8, name: "NCR / CAPA", text: "Nonconformance and corrective action tied to the part, process and supplier.", maturity: "planned-y23" },
  { n: 9, name: "SPC / Predictive Quality", text: "In-process monitoring first; predictive indicators are research.", maturity: "planned-y23" },
  { n: 10, name: "Supplier Quality", text: "Supplier deviations, requests and reviews on shared, structured evidence.", maturity: "planned-y23" },
  { n: 11, name: "Certification Evidence", text: "Audit and certification evidence retrievable by requirement.", maturity: "planned-y23" },
  { n: 12, name: "Quality APIs", text: "Controlled programmatic access to quality evidence for customer systems.", maturity: "planned-y23" },
  { n: 13, name: "Quality Passport", text: "The verified manufacturing history of a serialised part.", maturity: "planned-y23" },
  { n: 14, name: "Quality Intelligence", text: "Cross-part and cross-supplier insight from structured evidence.", maturity: "vision" },
  { n: 15, name: "3D Inspection Twin", text: "Links balloons and characteristics to 3D geometry: approved CAD where it is supplied, an engineer-verified reconstruction where it is not.", maturity: "research" },
];

/**
 * What exists against what is planned, under the page's six maturity labels.
 * Only the first group describes software that exists today: the FAI Engineer
 * prototype. Where the other groups fall is this page's reading of the roadmap.
 */
export const MATURITY_MATRIX: readonly { status: Maturity; heading: string; note: string; items: readonly string[] }[] = [
  {
    status: "prototype",
    heading: "FAI Engineer prototype foundations",
    note: "A prototype, not a production product.",
    items: ["Engineering drawing viewer", "Manual ballooning workflow", "Digital characteristic table", "AS9102 Form 3-oriented workflow and export foundation"],
  },
  {
    status: "development",
    heading: "First AQIP capabilities",
    note: "The immediate step beyond the prototype.",
    items: ["AI-assisted characteristic extraction with source links", "Dimension, tolerance and supported GD&T interpretation", "Human verification of every proposal"],
  },
  {
    status: "planned-y1",
    heading: "Year 1 plan",
    note: "On the roadmap; not yet built.",
    items: ["Inspection planning", "CMM result import", "Evidence linking", "Revision comparison", "Full and partial FAI workflows", "RBAC, MFA, encryption and audit logging", "Private deployment foundations"],
  },
  {
    status: "planned-y23",
    heading: "Years 2 and 3 plan",
    note: "Depends on Year 1 working with customers.",
    items: ["NCR / CAPA", "Production inspection and SPC", "STEP visualisation with balloon-to-feature mapping", "SSO and on-prem maturity", "Supplier quality and evidence sharing", "Quality APIs"],
  },
  {
    status: "research",
    heading: "Research directions",
    note: "Depends on data and validation; may not ship.",
    items: ["2D-to-3D reconstruction of simple parts", "Bounded agentic assistance", "Advanced GD&T interpretation", "Predictive quality", "Quality policy as code"],
  },
  {
    status: "vision",
    heading: "Long-term vision",
    note: "A direction for Year 4 and beyond.",
    items: ["3D revision intelligence", "Spatial Quality Passport", "Field-to-factory intelligence", "Multi-tier evidence exchange"],
  },
];

/** Capabilities this page must never be read as claiming to be production-ready today. */
export const NOT_PRODUCTION_READY = [
  "Automatic full drawing interpretation",
  "Advanced GD&T",
  "Autonomous inspection planning",
  "Broad CMM integration",
  "Supplier-quality network",
  "Predictive quality",
  "Autonomous agent execution",
  "2D-to-3D reconstruction",
  "Field-to-factory intelligence",
] as const;

export interface SimStep {
  title: string;
  actor: "System" | "AI" | "Human" | "Software";
  text: string;
}

export const SIM_STEPS: readonly SimStep[] = [
  { title: "Drawing uploaded", actor: "System", text: "Drawing AQ-1042 Revision C is registered as the controlled source for this part." },
  { title: "AI detects characteristics", actor: "AI", text: "The drawing is read and characteristics are proposed, each with the zone it was found in. Nothing is accepted yet." },
  { title: "Human verifies", actor: "Human", text: "A quality engineer checks each proposal against the drawing and approves, corrects or rejects it." },
  { title: "Inspection plan generated", actor: "Software", text: "A method and instrument are assigned to each verified characteristic from the organisation's approved rules." },
  { title: "CMM result imported", actor: "Software", text: "The measured value is imported and mapped to the characteristic, together with the instrument and its calibration status." },
  { title: "Material and process evidence linked", actor: "Software", text: "The material certificate and special-process certificate are linked to the part and its revision." },
  { title: "FAI generated", actor: "Human", text: "The first article inspection report is assembled from the verified records, then reviewed and approved by an authorised person." },
  { title: "Quality Passport complete", actor: "Software", text: "Every item of evidence for serial 000148 is present, linked and approved." },
];

export interface SimField {
  label: string;
  /** The value shown from each step onwards: [step number from 1, value]. */
  values: readonly (readonly [step: number, value: string])[];
}

/** The record for one characteristic, filling in as the demonstration advances. */
export const SIM_RECORD: readonly SimField[] = [
  { label: "Source", values: [[1, "Drawing AQ-1042, Rev C"]] },
  { label: "Balloon", values: [[2, "12 (proposed)"], [3, "12"]] },
  { label: "Requirement", values: [[2, "Ø10.00 ±0.05 mm (proposed)"], [3, "Ø10.00 ±0.05 mm"]] },
  { label: "Interpretation", values: [[2, "AI-proposed, unverified"], [3, "Human-verified"]] },
  { label: "Inspection", values: [[4, "CMM"]] },
  { label: "Measured", values: [[5, "10.02 mm"]] },
  { label: "Status", values: [[5, "PASS"]] },
  { label: "Calibration", values: [[5, "VALID"]] },
  { label: "Evidence", values: [[6, "LINKED"]] },
  { label: "Verifier", values: [[7, "APPROVED"]] },
  { label: "Quality Passport", values: [[8, "COMPLETE"]] },
];

export const PASSPORT_ROWS: readonly { item: string; status: string; backing: string }[] = [
  { item: "Material Certificate", status: "Verified", backing: "Material heat linked to the lot this serial was made from." },
  { item: "Special Process", status: "Verified", backing: "Process certificate from an approved source, linked to the route step." },
  { item: "Inspection", status: "Complete", backing: "Every characteristic on Revision C has a recorded result." },
  { item: "FAI", status: "Approved", backing: "First article report approved by an authorised person." },
  { item: "Calibration", status: "Valid", backing: "Each instrument used was within calibration on the day of measurement." },
  { item: "NCR", status: "Closed", backing: "No open nonconformance against this serial." },
  { item: "Configuration", status: "Correct", backing: "Built and inspected against the released revision." },
  { item: "Certificate of Conformance", status: "Issued", backing: "Issued after the items above were complete." },
];

export const PASSPORT_NOTES = ["Permission-controlled", "Not public by default", "Customer access governed by contract and authorization"] as const;

export const REVISION_CHANGES: readonly { item: string; change: string; kind: "changed" | "added" | "updated" | "deleted" }[] = [
  { item: "Characteristic 17", change: "Tolerance changed", kind: "changed" },
  { item: "Characteristic 23", change: "Added", kind: "added" },
  { item: "Note 8", change: "Updated", kind: "updated" },
  { item: "Feature 31", change: "Deleted", kind: "deleted" },
];

export const REVISION_IMPACT = ["Inspection plan impacted", "Partial FAI review required", "Open work orders require review", "Affected evidence identified"] as const;

/**
 * The platform in four layers. The first three stack; cybersecurity and
 * governance is not a fourth storey but the wall around all of them.
 */
export const PLATFORM_ARCHITECTURE: readonly { id: string; layer: string; role: string; items: readonly string[]; spans?: boolean }[] = [
  { id: "workflows", layer: "Quality Workflows", role: "What a quality team does.", items: ["Drawing", "3D Inspection Twin", "Inspection", "FAI", "NCR/CAPA", "SPC", "Supplier Quality", "Quality Passport"] },
  {
    id: "intelligence",
    layer: "AI & Quality Intelligence",
    role: "What AI helps interpret, for a person to approve.",
    items: ["Document AI", "Engineering AI", "2D→3D Intelligence", "Revision Intelligence", "Evidence Intelligence", "Agentic Assistance", "Predictive Quality"],
  },
  {
    id: "graph",
    layer: "Aerospace Quality Graph",
    role: "Where every record, and every link between records, is kept.",
    items: ["Part", "Revision", "Characteristic", "Geometry", "Inspection", "Measurement", "Evidence", "Configuration", "Supplier", "Serial Number"],
  },
  {
    id: "governance",
    layer: "Cybersecurity & Governance",
    role: "Spans every layer above.",
    items: ["Identity", "Access", "Encryption", "Audit", "AI Governance", "Data Security", "Secure Deployment"],
    spans: true,
  },
];

export const ARCHITECTURE: readonly { id: string; layer: string; items: readonly string[]; emphasis?: "human" | "security" }[] = [
  { id: "input", layer: "Input", items: ["Engineering Drawings", "CAD/MBD", "Specifications", "CMM", "Measurement", "Certificates", "ERP/PLM/MES"] },
  { id: "ingestion", layer: "Ingestion", items: ["PDF parser", "OCR", "Computer Vision", "Structured import", "CMM adapters", "API connectors"] },
  { id: "intelligence", layer: "Engineering Intelligence", items: ["Dimension extraction", "Tolerance extraction", "GD&T interpretation", "Notes", "Revision detection", "Classification", "View and feature inference"] },
  { id: "verification", layer: "Human Verification", items: ["Source highlight", "Confidence", "Approve", "Correct", "Reject"], emphasis: "human" },
  { id: "graph", layer: "Quality Graph", items: ["Part", "Revision", "Characteristic", "Requirement", "Geometry", "Inspection", "Measurement", "Evidence", "Configuration"] },
  { id: "workflows", layer: "Workflows", items: ["Inspection", "3D Inspection Twin", "FAI", "NCR/CAPA", "SPC", "Supplier Quality", "Audit Evidence"] },
  { id: "security", layer: "Security / Governance", items: ["RBAC", "MFA", "Encryption", "Audit", "Tenant isolation", "Private deployment", "AI provenance"], emphasis: "security" },
  { id: "output", layer: "Output", items: ["FAI", "Inspection record", "Quality Passport", "API", "OEM Supplier Network"] },
];

export const AI_MAY_ASSIST = [
  "Drawing interpretation",
  "Evidence completeness checking",
  "Revision impact suggestion",
  "Workflow guidance",
  "Audit preparation",
  "Investigation assistance",
  "Customer requirement mapping",
] as const;

export const AI_MUST_NOT = [
  "Approve quality records",
  "Release a controlled FAI",
  "Determine final engineering acceptance",
  "Override engineering authority",
  "Silently modify configuration",
] as const;

/** One row per activity: what AI may contribute, and who holds the authority. */
export const AI_GOVERNANCE: readonly { activity: string; assist: string; authority: string }[] = [
  { activity: "Reading a drawing", assist: "Proposes characteristics with source and confidence", authority: "A quality engineer verifies every characteristic" },
  { activity: "Evidence completeness", assist: "Flags missing or mismatched records", authority: "The record owner resolves each gap" },
  { activity: "Revision change", assist: "Suggests what changed and what it affects", authority: "Engineering and quality decide the re-work scope" },
  { activity: "FAI report", assist: "Assembles the draft from verified records", authority: "An authorised person reviews, signs and releases" },
  { activity: "Nonconformance", assist: "Suggests similar cases and possible causes", authority: "The material review authority dispositions" },
  { activity: "Configuration", assist: "Highlights inconsistencies", authority: "Only authorised people change controlled data, and every change is logged" },
];

export const SECURITY_CONTROLS: readonly { group: string; items: readonly string[] }[] = [
  { group: "Identity and access", items: ["Role-based access control (RBAC)", "Multi-factor authentication (MFA)", "Least privilege"] },
  { group: "Data protection", items: ["Encryption in transit", "Encryption at rest", "Tenant isolation", "Backup and restore", "Data retention", "Export controls"] },
  { group: "Accountability", items: ["Audit logs", "AI provenance"] },
  { group: "Engineering assurance", items: ["Secure SDLC", "Software bill of materials (SBOM)", "Vulnerability management", "Signed builds and releases"] },
  { group: "Deployment", items: ["Private deployment", "On-prem deployment", "Possible future air-gap deployment"] },
];

export const SECURITY_STATEMENT = "Customer engineering data must not be used for general AI model training without explicit authorisation.";

export const INTEGRATES_WITH = ["ERP", "PLM", "MES", "CAD", "CMM", "QMS where required"] as const;

export const BOUNDARY_POSITIONING = "The aerospace quality intelligence and evidence layer between engineering, manufacturing and the supply chain.";

export const EVIDENCE_API = {
  request: "GET /parts/AQ-1042/serial/000148/conformance",
  response: [
    { field: "Configuration", value: "AQ-1042 Rev C, matches released definition" },
    { field: "Inspection status", value: "Complete" },
    { field: "Evidence completeness", value: "8 of 8 items linked" },
    { field: "FAI", value: "Approved" },
    { field: "NCR state", value: "None open" },
    { field: "CoC", value: "Issued" },
  ],
} as const;

export const POLICY_RULE = ["IF characteristic.critical = true", "THEN inspection.frequency = 100%", "AND calibrated_equipment = required", "AND authorised_verifier = required"] as const;

/** The controls the example rule yields, for a critical and a non-critical characteristic. */
export const POLICY_OUTCOME: readonly { control: string; critical: string; standard: string }[] = [
  { control: "inspection.frequency", critical: "100%", standard: "per approved sampling plan" },
  { control: "calibrated_equipment", critical: "required", standard: "required" },
  { control: "authorised_verifier", critical: "required", standard: "standard inspector" },
];

export const LABELS: Record<"simulator" | "passport" | "policy" | "api" | "network" | "twin" | "twinDemo" | "revenue3d", { tone: Tone; text: string }> = {
  simulator: { tone: "synthetic", text: "Illustrative synthetic demonstration" },
  passport: { tone: "future", text: "Concept with synthetic data" },
  policy: { tone: "vision", text: "Long-Term Product Direction" },
  api: { tone: "future", text: "Future Architecture Concept" },
  network: { tone: "strategy", text: "Strategic Business Model — Future Scale" },
  twin: { tone: "research", text: "Research / In development" },
  twinDemo: { tone: "synthetic", text: "Synthetic demo" },
  revenue3d: { tone: "future", text: "Future Commercial Model" },
};
