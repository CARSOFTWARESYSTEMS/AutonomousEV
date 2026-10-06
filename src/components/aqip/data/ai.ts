// AI assurance: how AI-driven quality workflows are meant to evolve, the bounded
// agents, human-in-the-loop control, provenance, model governance, AI security
// and retrieval. Most of this is research or later, and is labelled as such.
import type { Maturity } from "../types";

export const AI_ASSURANCE = {
  title: "Advanced AI-Driven Quality Workflows",
  rule: "AI may assist. Deterministic workflow controls release.",
  question: "Why did the system propose this?",
} as const;

/** From reading documents to intelligence across them. Each stage needs the one before it to be trusted. */
export const AI_EVOLUTION: readonly { id: string; stage: string; text: string; maturity: Maturity }[] = [
  { id: "document", stage: "Document AI", text: "Reads documents into structured fields.", maturity: "development" },
  { id: "engineering", stage: "Engineering AI", text: "Understands what the fields mean as engineering.", maturity: "development" },
  { id: "workflow", stage: "Workflow AI", text: "Carries a verified result to the next controlled step.", maturity: "planned-y1" },
  { id: "agentic", stage: "Agentic Assistance", text: "Bounded agents prepare work for a person to decide.", maturity: "research" },
  { id: "intelligence", stage: "Quality Intelligence", text: "Patterns across parts, suppliers and time.", maturity: "vision" },
];

export const DOCUMENT_AI = ["OCR", "Classification", "Table extraction", "Certificate extraction", "Drawing-zone recognition", "Note extraction"] as const;

export const ENGINEERING_AI = ["Dimensions", "Tolerances", "Supported GD&T", "Characteristic classification", "Revision intelligence", "CTQ suggestions", "2D view understanding", "3D feature inference"] as const;

export const ENGINEERING_AI_NOTE = "View understanding and 3D feature inference are research. CTQ suggestions are suggestions: criticality is decided by engineering.";

/** What is kept with every engineering result, so it can be traced and checked. */
export const ENGINEERING_AI_STORES = ["Source", "Sheet", "Zone", "Revision", "Confidence", "Model version", "Human verification"] as const;

export const WORKFLOW_AI_FLOW: readonly { label: string; note?: string }[] = [
  { label: "Drawing" },
  { label: "AI extraction", note: "AI interprets" },
  { label: "Human verification", note: "A person approves" },
  { label: "Inspection planning" },
  { label: "Measurement" },
  { label: "Evidence" },
  { label: "FAI preparation" },
  { label: "Authorised approval", note: "A person releases" },
];

// ── Bounded agents ──

export interface Agent {
  id: string;
  name: string;
  purpose: string;
  can: readonly string[];
  cannot: readonly string[];
  maturity: Maturity;
}

/** Nine specialist agents, each with a narrow job. None of them is production software today. */
export const AGENTS: readonly Agent[] = [
  {
    id: "drawing",
    name: "Drawing Intelligence Agent",
    purpose: "Reads an authorised drawing and proposes characteristics, each with the place it was found.",
    can: ["Read an authorised drawing", "Propose dimensions, tolerances and notes with sheet and zone", "Report its confidence and what it could not read"],
    cannot: ["Accept its own proposals", "Change the source drawing", "Release a characteristic list", "Send drawing content outside the tenant"],
    maturity: "research",
  },
  {
    id: "reconstruction",
    name: "3D Reconstruction Agent",
    purpose: "Builds a geometry candidate from a drawing's views, and says where it is unsure.",
    can: [
      "Read an authorised drawing",
      "Analyse orthographic views",
      "Identify likely feature relationships",
      "Infer simple geometry",
      "Generate a temporary geometry candidate",
      "Calculate confidence",
      "Create an assumption list",
      "Flag ambiguity",
    ],
    cannot: [
      "Declare inferred geometry authoritative",
      "Modify the source engineering definition or drawing",
      "Approve geometry",
      "Release CAD",
      "Approve an FAI or release a FAIR",
      "Override a human correction",
      "Export customer data externally",
      "Change permissions",
    ],
    maturity: "research",
  },
  {
    id: "revision",
    name: "Revision Impact Agent",
    purpose: "Compares two revisions and suggests which quality work the change touches.",
    can: ["Compare two authorised revisions", "List changed, added and deleted characteristics", "Suggest the plans, FAIs and open work affected"],
    cannot: ["Decide the scope of re-work", "Declare an existing FAI still valid", "Change a configuration record"],
    maturity: "research",
  },
  {
    id: "planning",
    name: "Inspection Planning Agent",
    purpose: "Proposes a method and an instrument for each verified characteristic, from approved rules.",
    can: ["Read verified characteristics and approved rules", "Propose a method and instrument per characteristic", "Flag a characteristic that no approved rule covers"],
    cannot: ["Invent an inspection rule", "Approve a plan", "Assign equipment that is out of calibration"],
    maturity: "research",
  },
  {
    id: "evidence",
    name: "Evidence Completeness Agent",
    purpose: "Checks that every requirement has the records that prove it.",
    can: ["Check each requirement for a linked result and record", "Flag missing, expired or mismatched evidence", "List what is blocking release"],
    cannot: ["Create or alter evidence", "Waive a missing record", "Mark a package complete"],
    maturity: "research",
  },
  {
    id: "fai",
    name: "FAI Preparation Agent",
    purpose: "Assembles a draft first article package from verified records.",
    can: ["Assemble a draft from verified records", "Show what is still missing", "Prepare the package for review"],
    cannot: ["Sign or release a FAIR", "Fill a gap with an assumed value", "Approve its own draft"],
    maturity: "research",
  },
  {
    id: "ncr",
    name: "NCR/CAPA Investigation Agent",
    purpose: "Supports an investigation with similar cases and possible causes, each with its source.",
    can: ["Retrieve similar authorised cases", "Suggest possible causes with their sources", "Draft an investigation summary"],
    cannot: ["Disposition a nonconformance", "Close a CAPA", "State a root cause as fact"],
    maturity: "vision",
  },
  {
    id: "audit",
    name: "Audit Readiness Agent",
    purpose: "Maps evidence to the requirements an audit will sample, and lists the gaps first.",
    can: ["Map evidence to a requirement the customer supplies", "List gaps before an audit", "Prepare a retrieval pack"],
    cannot: ["Declare compliance", "Reproduce licensed standards text", "Alter a record"],
    maturity: "vision",
  },
  {
    id: "supplier",
    name: "Supplier Quality Agent",
    purpose: "Summarises a supplier's submitted evidence for the reviewer who decides.",
    can: ["Summarise a supplier's submitted evidence", "Flag inconsistencies for the reviewer", "Track open requests"],
    cannot: ["Approve or reject a supplier", "Share data across a trust boundary", "See another customer's suppliers"],
    maturity: "vision",
  },
];

/** What every agent is given, whichever one it is. */
export const AGENT_BOUNDS: readonly { name: string; text: string }[] = [
  { name: "Allowlisted tools", text: "An agent can call only the tools it has been granted." },
  { name: "Minimum data", text: "It reads only the records its task needs." },
  { name: "Minimum privileges", text: "It holds no permission a person in the same role would not hold." },
  { name: "Bounded actions", text: "It proposes and prepares. It does not approve, release or delete." },
  { name: "Audit trail", text: "Every tool call, input and output is logged against the agent and its version." },
];

// ── Human-in-the-loop control ──

export interface HitlAction {
  id: string;
  label: string;
  /** The status the item takes once the action is chosen. */
  status: string;
  /** What the product would record. */
  log: string;
  kind: "approve" | "change" | "reject";
}

export interface HitlCard {
  id: string;
  title: string;
  kind: string;
  fields: readonly { label: string; value: string }[];
  initial: string;
  /** Where the proposal came from, shown on request. */
  source?: string;
  actions: readonly HitlAction[];
}

export const HITL_CARDS: readonly HitlCard[] = [
  {
    id: "characteristic",
    title: "AI result",
    kind: "Extracted characteristic",
    fields: [
      { label: "Requirement", value: "Ø10.00 ±0.05 mm" },
      { label: "Source", value: "Sheet 2 • Zone B4" },
      { label: "Model", value: "Drawing Intelligence v0.x" },
      { label: "Confidence", value: "97%" },
    ],
    initial: "Needs verification",
    source: "Drawing AQ-1042, Revision C, Sheet 2, Zone B4: the diameter callout beside balloon 12. In the product this region is highlighted on the drawing itself.",
    actions: [
      { id: "approve", label: "Approve", status: "Approved by a person", log: "Reviewer, time and the unchanged AI proposal are recorded.", kind: "approve" },
      { id: "correct", label: "Correct", status: "Corrected by a person", log: "The corrected value replaces the proposal. Both are kept, and the correction feeds model evaluation.", kind: "change" },
      { id: "reject", label: "Reject", status: "Rejected by a person", log: "The proposal is discarded and never enters a quality record. The rejection is kept.", kind: "reject" },
    ],
  },
  {
    id: "geometry",
    title: "Geometry candidate",
    kind: "3D reconstruction",
    fields: [
      { label: "Source views", value: "Front + Top + Section A-A" },
      { label: "Confidence", value: "Medium" },
      { label: "Unresolved", value: "Rear chamfer" },
    ],
    initial: "Needs verification",
    actions: [
      { id: "confirm", label: "Confirm", status: "Confirmed by an engineer", log: "The candidate becomes a verified reconstruction for navigation. The drawing stays authoritative.", kind: "approve" },
      { id: "edit", label: "Edit", status: "Edited by an engineer", log: "The engineer's geometry replaces the inferred geometry. The agent cannot override it.", kind: "change" },
      { id: "unresolved", label: "Mark unresolved", status: "Left unresolved", log: "The area stays flagged and is excluded from the twin until an engineer resolves it.", kind: "reject" },
    ],
  },
];

export const HITL_NOTE = "A concept, with synthetic values. Nothing you select is stored or sent.";

// ── Provenance, governance, security, retrieval ──

/** What is preserved with every important AI-assisted result. */
export const PROVENANCE: readonly { field: string; kept: string }[] = [
  { field: "File", kept: "The exact document the result was read from." },
  { field: "Revision", kept: "The revision of that document." },
  { field: "Source location", kept: "Sheet, zone and region of the page." },
  { field: "Model ID", kept: "Which model or agent produced the proposal." },
  { field: "Model version", kept: "The released version that ran." },
  { field: "Workflow version", kept: "The version of the workflow the result moved through." },
  { field: "Confidence", kept: "The confidence reported at the time, not a later estimate." },
  { field: "Timestamp", kept: "When the proposal was made." },
  { field: "Reviewer", kept: "The person who verified it." },
  { field: "Corrections", kept: "What the reviewer changed, alongside the original proposal." },
  { field: "Approval", kept: "Who approved the record, and when." },
];

export const GOVERNANCE_FLOW = ["Model / agent", "Benchmark", "Quality review", "Security review", "Approved release", "Monitor", "Correction analysis", "Revalidate"] as const;

export const GOVERNANCE_CONTROLS: readonly { name: string; text: string }[] = [
  { name: "Registry", text: "Every model and agent version in use is listed with its approval." },
  { name: "Rollback", text: "A release can be withdrawn to the last approved version." },
  { name: "Regression", text: "A new version is re-run against the verified benchmark before release." },
  { name: "Drift", text: "Correction rates are watched for a model getting worse in use." },
  { name: "False negatives", text: "Missed characteristics are tracked first: they are the dangerous error." },
  { name: "Dataset version", text: "Each benchmark result names the dataset version it was measured on." },
  { name: "Release gate", text: "Quality and security both sign off before a version is used on customer work." },
];

export const AI_THREATS = [
  "Prompt injection in uploaded documents",
  "Malicious file content",
  "Cross-tenant leakage",
  "Data exfiltration",
  "Poisoned evaluation data",
  "Model or vendor compromise",
  "Unsafe tool execution",
  "Hallucinated engineering interpretation",
] as const;

export const AI_MITIGATIONS = ["Parser isolation", "Tool allowlists", "Tenant boundaries", "Source grounding", "Bounded context", "Output validation", "Human review", "Model governance", "AI audit trail"] as const;

/** A possible future knowledge system: retrieval over content the customer has authorised, and nothing else. */
export const SECURE_RAG = {
  sources: ["Company procedures", "Customer quality requirements", "Approved work instructions", "Previous quality records", "Authorised internal knowledge"],
  rules: [
    "Retrieval is limited to content the user is already authorised to see.",
    "Licensed standards are not ingested or reproduced without legal authorisation.",
    "Every answer cites the internal source records it used.",
  ],
} as const;
