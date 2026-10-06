// Cybersecurity and digital trust: the pillar, the Trust Triangle, the security
// architecture, engineering-file ingestion and the link between security and
// quality. These are design requirements. None of them is a certification claim.

export const TRUST = {
  title: "Cybersecurity & Digital Trust",
  statement: "Digital trust is part of manufacturing quality.",
  integrity: "Quality evidence is only valuable if its digital integrity can be trusted.",
  certification: "AQIP holds no external security certification today, and this page claims none. These are the requirements the platform is being designed around.",
} as const;

/** Where security applies. It is platform infrastructure, not one module among the others. */
export const TRUST_AREAS: readonly { area: string; text: string }[] = [
  { area: "Engineering drawing security", text: "Drawings and CAD are a customer's intellectual property, and in defence work can be controlled information." },
  { area: "Manufacturing evidence security", text: "A measurement or certificate must be the one that was recorded, unaltered." },
  { area: "Supplier collaboration security", text: "A supplier and its customer share exactly what a contract allows, and nothing else." },
  { area: "AI security", text: "Documents are untrusted input, and an AI component can only do what it has been allowed to do." },
  { area: "Identity", text: "Every action is attributable to a known person or a named service." },
  { area: "Access", text: "People see the parts, revisions and records their role needs." },
  { area: "Deployment isolation", text: "One customer's data is separated from another's, by tenant or by deployment." },
  { area: "Auditability", text: "Who did what, to which record, when and with whose approval can always be reconstructed." },
];

/** The signature visual: three things a manufacturer has to be able to answer before a record can be trusted. */
export const TRUST_TRIANGLE: readonly { id: "quality" | "cybersecurity" | "ai"; name: string; question: string; text: string }[] = [
  { id: "quality", name: "Quality", question: "Was the product manufactured correctly?", text: "Every requirement connects to a measurement, the evidence behind it and an accountable approval." },
  { id: "cybersecurity", name: "Cybersecurity", question: "Can we trust the identity, data and evidence?", text: "The person is who they claim to be, the drawing is the released one, and the record has not been altered." },
  { id: "ai", name: "AI Assurance", question: "Can we understand and verify AI-assisted conclusions?", text: "Each AI proposal shows its source, model, confidence and the person who verified it." },
];

export const TRUST_TRIANGLE_NOTE = "AQIP requires all three. Take one away and the other two cannot produce trust.";

/** The security architecture, from who is acting down to what an AI component may do. */
export const SECURITY_LAYERS: readonly { id: string; layer: string; items: readonly string[]; emphasis?: "security" }[] = [
  { id: "identity", layer: "Identity", items: ["RBAC", "MFA", "Least privilege"] },
  { id: "data", layer: "Data security", items: ["Encryption", "Tenant isolation", "Classification", "Retention"] },
  { id: "application", layer: "Application security", items: ["Secure SDLC", "SBOM", "Secrets", "Dependencies", "Signed builds"] },
  { id: "infrastructure", layer: "Infrastructure", items: ["Private cloud", "India hosting", "On-prem", "Network segmentation", "Future air gap"] },
  { id: "audit", layer: "Audit", items: ["User actions", "Approvals", "Exports", "Configuration", "AI activities"] },
  { id: "ai", layer: "AI security", items: ["Provenance", "Model versioning", "Bounded agents", "Source grounding", "Human approval"], emphasis: "security" },
];

export const SECURITY_PRINCIPLES: readonly { name: string; text: string }[] = [
  { name: "Security by design", text: "Threats are modelled before a feature is built, not after it ships." },
  { name: "Zero trust mindset", text: "No user, device, network or document is trusted because of where it is." },
  { name: "Least privilege", text: "Each person, service and agent gets the minimum access its task needs." },
  { name: "Defence-ready deployment", text: "Private, India-hosted and on-prem options, because much of this data cannot sit in a shared cloud." },
  { name: "Full auditability", text: "Actions, approvals, exports, configuration changes and AI activity are logged." },
  { name: "Data sovereignty", text: "The customer decides where its data lives and who may process it." },
  { name: "Controlled sharing", text: "Evidence reaches a supplier or customer only through an explicit, logged permission." },
  { name: "Secure AI", text: "Bounded tools, source grounding and human approval around every AI component." },
  { name: "Software supply chain security", text: "A bill of materials, managed dependencies and signed builds for what is shipped." },
  { name: "Incident readiness", text: "A rehearsed plan to detect, contain, notify and recover." },
];

/** How a security failure becomes a quality failure. */
export const SECURITY_QUALITY_LINKS: readonly { cause: string; effect: string }[] = [
  { cause: "Unauthorised drawing change", effect: "Wrong manufacturing requirement" },
  { cause: "Altered CMM result", effect: "False acceptance" },
  { cause: "Stolen drawing", effect: "IP and defence risk" },
  { cause: "Compromised supplier account", effect: "Fraudulent evidence" },
];

// ── Engineering files: uploads are a security boundary ──

export const FILE_BOUNDARY = "Treat file ingestion as a cybersecurity boundary.";

export const FILE_THREATS = ["Malicious PDF", "Embedded scripts", "Malformed CAD", "Decompression bombs", "Parser exploits", "Hidden attachments", "Prompt-injection text", "Oversized files"] as const;

export const FILE_MITIGATIONS = [
  "MIME validation",
  "Magic-byte validation",
  "File-size limits",
  "Parser isolation",
  "Malware scan",
  "Sandbox processing",
  "Timeouts",
  "Memory limits",
  "Safe rendering pipeline",
  "Content sanitisation",
  "Audit logging",
] as const;

/** What an uploaded drawing or CAD file is subject to from the moment it arrives. */
export const FILE_HANDLING = [
  "Upload authorisation",
  "File and malware scanning",
  "Content validation",
  "Private storage",
  "Encryption",
  "Access control",
  "Tenant isolation",
  "Retention",
  "Deletion",
  "Audit logging",
  "Export and download policy",
] as const;

export const FILE_AI_RULE = "3D reconstruction must not send customer drawings to uncontrolled external AI providers.";
