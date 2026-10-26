// What FAI Engineer is today, as its product page publishes it, and what may
// and may not be said about it. Anything the page does not state is marked as
// needing product or security team confirmation — never improvised.
import type { AnswerClass, ClaimStatus, EvidenceLevel, Maturity } from "../types";

export const PRODUCT_SUMMARY =
  "A browser-based toolkit for engineering drawing ballooning, characteristic tables and First Article Inspection report preparation.";

export const CAPABILITIES: readonly { name: string; text: string; maturity: Maturity }[] = [
  { name: "PDF Drawing Viewer", text: "Opens multi-page engineering drawing PDFs in the browser; zoom and pan.", maturity: "prototype" },
  { name: "Manual Ballooning", text: "Place, move and renumber balloon callouts with leader lines.", maturity: "prototype" },
  { name: "Feature Table", text: "Characteristic table: number, nominal, tolerances, type, comments — editable in place and linked to balloons.", maturity: "prototype" },
  { name: "AS9102 Form 3-oriented Export", text: "Exports the characteristic table to Excel or CSV. The product FAQ says the template follows the AS9102 Rev B characteristic accountability format.", maturity: "prototype" },
  { name: "Google Drive Save / Load", text: "Saves the project (drawing, balloons, table) to the user's own Google Drive; local export is also available.", maturity: "prototype" },
  { name: "OCR-assisted Extraction", text: "Dimension and tolerance extraction from drawing text, available in Beta.", maturity: "beta" },
  { name: "Form 1 & Form 2", text: "Listed on the pricing table as coming soon.", maturity: "planned" },
  { name: "Team accounts & admin portal", text: "Listed on the pricing table as coming soon.", maturity: "planned" },
];

/** The product page's own roadmap, which it labels "not available today". */
export const PRODUCT_ROADMAP: readonly string[] = [
  "Automatic dimension recognition",
  "GD&T symbol recognition and parsing",
  "Drawing revision comparison",
  "Inspection workflow automation",
];

/** The broader AQIP capabilities: context and vision, never part of a current-product demo. */
export const AQIP_CONTEXT: readonly { name: string; maturity: Maturity }[] = [
  { name: "FAI Engineer foundation", maturity: "prototype" },
  { name: "Drawing Intelligence (source-linked extraction, verified by a person)", maturity: "development" },
  { name: "Inspection planning, CMM import, evidence linking, revision comparison", maturity: "planned" },
  { name: "3D Inspection Twin, predictive quality, bounded agentic assistance", maturity: "research" },
  { name: "Supplier quality network, Quality Passport, aerospace manufacturing trust infrastructure", maturity: "vision" },
];

/** The demo a salesperson may run today: current capabilities only, on a fictitious drawing. */
export const APPROVED_DEMO: readonly string[] = [
  "Recap the customer's validated problem in their own words.",
  "Open a fictitious drawing PDF in the browser.",
  "Place and renumber balloons; show leader lines.",
  "Edit the linked characteristic table.",
  "Export the Form 3-oriented table to Excel or CSV.",
  "Save the project to the user's own Google Drive, or export locally.",
  "Only if relevant and labelled Beta: OCR-assisted extraction, with every value reviewed by a person.",
  "Agree what an evaluation should measure.",
];

export const STANDARD_NOTE =
  "SAE AS9102C (revised 28 June 2023) establishes requirements for performing and documenting First Article Inspection, and is complementary to customer, statutory and regulatory requirements. Software can support the workflow; it cannot make an organisation compliant.";

export interface Claim {
  id: string;
  text: string;
  status: ClaimStatus;
  basis: string;
  instead?: string;
}

export const CLAIMS: readonly Claim[] = [
  { id: "browser", text: "A browser-based toolkit for drawing ballooning, characteristic tables and FAI report preparation.", status: "verified", basis: "Published product description." },
  { id: "local-render", text: "Drawing PDFs are rendered in your browser and are not uploaded to EV.ENGINEER servers.", status: "verified", basis: "Published security section and FAQ." },
  { id: "drive", text: "Projects can be saved to your own Google Drive, or exported locally.", status: "verified", basis: "Published features and FAQ." },
  { id: "form3", text: "Exports the characteristic table in an AS9102 Form 3-oriented Excel / CSV format.", status: "verified", basis: "Published features. The FAQ names the Rev B format." },
  { id: "support", text: "Designed to support workflows used in preparing and documenting First Article Inspection.", status: "verified", basis: "Accurate description of the current scope." },
  { id: "rev-c", text: "The Form 3 export follows AS9102 Rev C.", status: "hypothesis", basis: "The product FAQ states Rev B. Rev C alignment needs product team confirmation.", instead: "Say the export is Form 3-oriented and that the team should review exported forms against their customer's requirements." },
  { id: "eighty", text: "Reduces manual ballooning effort by up to 80%.", status: "hypothesis", basis: "Stated on the product page; no measurement basis is published. Not to be repeated by interns until a pilot measures it.", instead: "Offer to measure preparation time before and after on the customer's own drawings." },
  { id: "pain", text: "Manual ballooning is time-consuming for Bengaluru aerospace MSMEs.", status: "hypothesis", basis: "Assumption until customer conversations validate it." },
  { id: "compliance", text: "Guarantees AS9102 compliance.", status: "restricted", basis: "No software can guarantee compliance; AS9102 complements customer and regulatory requirements.", instead: "Designed to support workflows used in preparing and documenting First Article Inspection." },
  { id: "certify", text: "Gets your organisation certified / approved.", status: "restricted", basis: "Certification is granted by certification bodies and customers, not software.", instead: "Helps keep characteristic records organised for review." },
  { id: "ai-auto", text: "AI automatically creates complete FAI reports.", status: "restricted", basis: "Ballooning is manual today; OCR is Beta and needs human review; Form 1 and 2 are coming soon.", instead: "Manual ballooning with Beta OCR assistance; every value is reviewed by a person." },
  { id: "savings", text: "Guaranteed time or cost savings.", status: "restricted", basis: "Savings depend on the customer's workflow and must be measured.", instead: "We can estimate a range from your inputs and measure it in a pilot." },
  { id: "gdt", text: "Recognises GD&T symbols.", status: "restricted", basis: "Listed on the product roadmap as not available today.", instead: "GD&T recognition is on the roadmap; today characteristics are entered and reviewed by your team." },
];

export interface TrustTopic {
  topic: string;
  answer: string;
  status: AnswerClass;
  /** True when the answer is the product page's published wording. */
  published?: boolean;
}

export const TRUST_CHECKLIST: readonly TrustTopic[] = [
  { topic: "Deployment model", answer: "Browser-based software; no installation.", status: "approved", published: true },
  { topic: "Local / offline capability", answer: "PDF rendering happens in the browser. Offline use is not documented — needs product / security team confirmation.", status: "technical" },
  { topic: "Cloud use", answer: "Projects can be saved to the user's own Google Drive; local export is available. Sign-in uses Firebase Authentication.", status: "approved", published: true },
  { topic: "Data residency", answer: "Not documented — needs product / security team confirmation.", status: "security" },
  { topic: "Access control", answer: "Sign-in with Google or email. Anything further needs product / security team confirmation.", status: "security" },
  { topic: "Customer data ownership", answer: "The product page states users own their data and that drawings are not stored by the vendor. Contract terms need legal review.", status: "legal", published: true },
  { topic: "Drawing retention", answer: "The product page states drawing files are never transmitted to its servers. How Beta OCR processes drawing text is not documented — needs confirmation.", status: "security" },
  { topic: "Model-training policy", answer: "Not documented — needs product / security team confirmation.", status: "security" },
  { topic: "Audit logs", answer: "Not documented — needs product / security team confirmation.", status: "technical" },
  { topic: "Encryption", answer: "Not documented — needs product / security team confirmation.", status: "security" },
  { topic: "Export / download controls", answer: "Users can export, delete and move their project data at any time.", status: "approved", published: true },
  { topic: "User roles", answer: "Team accounts and an admin portal are listed as coming soon. Today there are no documented roles.", status: "technical" },
  { topic: "Support access", answer: "Not documented — needs product / security team confirmation.", status: "technical" },
  { topic: "Incident handling", answer: "Not documented — needs product / security team confirmation.", status: "security" },
  { topic: "NDA requirements", answer: "Route every NDA request to the commercial and legal owners.", status: "legal" },
  { topic: "Customer-specific IT / security review", answer: "Collect the customer's questionnaire and route it; never answer from memory.", status: "security" },
];

export const TRUST_RULE = "Interns never improvise security answers. If an answer is not approved here, say: \"Let me confirm that with our product and security team.\"";

/** The current value proposition, part by part, each with the evidence behind it. Version 1: no customer has confirmed it yet. */
export const VALUE_PROPOSITION: { version: string; parts: readonly { label: string; text: string; level: EvidenceLevel }[] } = {
  version: "V1",
  parts: [
    { label: "For", text: "Quality engineers at Bengaluru aerospace machining MSMEs who prepare first-article packages", level: "research" },
    { label: "Who", text: "may spend skilled hours ballooning drawings and reconciling balloon numbers with the Form 3 table", level: "assumption" },
    { label: "FAI Engineer", text: "keeps the ballooned drawing and the characteristic table together in one browser workspace and exports a Form 3-oriented table", level: "research" },
    { label: "So that", text: "re-entry and reconciliation effort could fall — to be measured in a pilot, never promised", level: "assumption" },
  ],
};

/** What a pilot of FAI Engineer could measure. Success is defined before it starts. */
export const PILOT_MEASURES = [
  "Preparation time per drawing",
  "Extraction review effort (Beta OCR)",
  "Correction count",
  "Completeness",
  "Report preparation effort",
  "User acceptance",
] as const;
