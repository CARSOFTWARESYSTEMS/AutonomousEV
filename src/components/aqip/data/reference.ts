// Navigation, FAQ, glossary, sources, organisations, the footer and calls to action.
import { EV_SOCIETY, ITELEMATICS } from "@/data/public-entities";

/** The twenty sections, in page order. `executive` sections stay visible in Executive View. */
export const NAV: readonly { id: string; label: string; executive?: boolean }[] = [
  { id: "overview", label: "Overview", executive: true },
  { id: "opportunity", label: "Opportunity" },
  { id: "problems", label: "Problems", executive: true },
  { id: "product", label: "Product", executive: true },
  { id: "inspection-twin", label: "3D Inspection Twin", executive: true },
  { id: "quality-graph", label: "Quality Graph" },
  { id: "ai-assurance", label: "AI Assurance" },
  { id: "cybersecurity", label: "Cybersecurity", executive: true },
  { id: "roadmap", label: "Roadmap", executive: true },
  { id: "customers", label: "Customers" },
  { id: "validation", label: "Validation" },
  { id: "go-to-market", label: "Go-To-Market" },
  { id: "business", label: "Business", executive: true },
  { id: "investor", label: "Investor", executive: true },
  { id: "leadership", label: "Leadership", executive: true },
  { id: "execution", label: "Execution" },
  { id: "metrics", label: "Metrics" },
  { id: "risks", label: "Risks" },
  { id: "90-day-plan", label: "90-Day Plan", executive: true },
  { id: "reference", label: "FAQ & Glossary" },
];

export interface ChapterDef {
  id: string;
  /** The chapter's number as printed, e.g. "01". */
  n: string;
  title: string;
  summary: string;
  /** Ids of the sections it holds, in order. */
  sections: readonly string[];
}

/** The manual's seven chapters. Every section in NAV belongs to exactly one. */
export const CHAPTERS: readonly ChapterDef[] = [
  { id: "chapter-strategy", n: "01", title: "Strategy", summary: "What AQIP is, why now, and the problems it sets out to solve.", sections: ["overview", "opportunity", "problems"] },
  {
    id: "chapter-product",
    n: "02",
    title: "Product",
    summary: "The platform and its modules, the 3D Inspection Twin, the quality graph, AI assurance and cybersecurity.",
    sections: ["product", "inspection-twin", "quality-graph", "ai-assurance", "cybersecurity"],
  },
  { id: "chapter-roadmap", n: "03", title: "Roadmap", summary: "Three years of execution and five years of direction.", sections: ["roadmap"] },
  { id: "chapter-customer", n: "04", title: "Customer", summary: "Who to serve first, how to validate with them and how to go to market.", sections: ["customers", "validation", "go-to-market"] },
  { id: "chapter-business", n: "05", title: "Business", summary: "Revenue, the business model, defensibility and the investor thesis.", sections: ["business", "investor"] },
  { id: "chapter-leadership", n: "06", title: "Leadership & Execution", summary: "Vision and roles, how to decide, what to measure, the risks and the first 90 days.", sections: ["leadership", "execution", "metrics", "risks", "90-day-plan"] },
  { id: "chapter-reference", n: "07", title: "Reference", summary: "Frequently asked questions, the glossary and sources.", sections: ["reference"] },
];

const CHAPTER_OF = new Map(CHAPTERS.flatMap((chapter) => chapter.sections.map((section) => [section, chapter] as const)));
const NAV_BY_ID = new Map(NAV.map((item) => [item.id, item]));

export const chapterOf = (sectionId: string): ChapterDef => CHAPTER_OF.get(sectionId) ?? CHAPTERS[0];
export const sectionIsExecutive = (sectionId: string): boolean => NAV_BY_ID.get(sectionId)?.executive === true;
export const chapterIsExecutive = (chapter: ChapterDef): boolean => chapter.sections.some(sectionIsExecutive);
export const sectionLabel = (sectionId: string): string => NAV_BY_ID.get(sectionId)?.label ?? "";

/** A section's handbook number, e.g. "1.2" for the second section of chapter 01. */
export function sectionNumber(sectionId: string): string {
  const chapter = chapterOf(sectionId);
  return `${Number(chapter.n)}.${chapter.sections.indexOf(sectionId) + 1}`;
}

/** The header's high-level navigation. `sections` are the sections during which the entry is current. */
export const HEADER_NAV: readonly { id: string; label: string; target: string; sections: readonly string[] }[] = [
  { id: "strategy", label: "Strategy", target: "overview", sections: ["overview", "opportunity", "problems"] },
  { id: "product", label: "Product", target: "product", sections: ["product", "inspection-twin", "quality-graph", "ai-assurance", "cybersecurity"] },
  { id: "roadmap", label: "Roadmap", target: "roadmap", sections: ["roadmap"] },
  { id: "customers", label: "Customers", target: "customers", sections: ["customers", "validation", "go-to-market"] },
  { id: "business", label: "Business", target: "business", sections: ["business", "investor"] },
  { id: "leadership", label: "Leadership", target: "leadership", sections: ["leadership"] },
  { id: "execution", label: "Execution", target: "execution", sections: ["execution", "metrics", "risks", "90-day-plan"] },
];

export const EXECUTIVE_SECTIONS = ["Vision", "Problem", "Solution", "3D Inspection Twin", "Digital Trust", "Roadmap", "Business Model", "Investor Thesis", "90-Day Plan"] as const;

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is AQIP?",
    a: "AQIP, the Aerospace Quality Intelligence Platform, is an initiative to build the quality intelligence and evidence layer for aerospace and defence manufacturing. It is designed to connect an engineering requirement to the manufacturing, inspection, measurement and approval records that prove it was met.",
  },
  {
    q: "Is AQIP only FAI software?",
    a: "No. First Article Inspection is where AQIP starts, because it is mandatory, recurring and time-consuming. The same characteristic record is planned to extend into production inspection, revision control, nonconformance, supplier quality and audit evidence.",
  },
  {
    q: "Who is AQIP for?",
    a: "The first customers are AS9100-oriented precision machining MSMEs that serve aerospace and defence customers and prepare FAIs regularly. Later it is intended for larger suppliers, primes, public-sector undertakings and their supplier networks.",
  },
  {
    q: "Does AQIP replace quality engineers?",
    a: "No. AQIP is designed to remove repetitive preparation so that qualified engineers spend their time on review and judgement. Accountability for every controlled record stays with a named person.",
  },
  {
    q: "Can AI approve an aerospace quality record?",
    a: "No. AI may propose, check and assemble. Approving a quality record, releasing an FAI and deciding engineering acceptance are reserved for authorised people.",
  },
  {
    q: "What does “Zero Silent AI Approval” mean?",
    a: "It means no AI output becomes part of a controlled quality record without a visible, logged approval by an authorised person. If AI contributed to a record, the record says so and shows who verified it.",
  },
  {
    q: "Does AQIP replace ERP, PLM or MES?",
    a: "No. AQIP is intended to integrate with ERP, PLM, MES, CAD, CMM and, where required, QMS systems. It is the evidence layer between engineering, manufacturing and the supply chain, not a replacement for those systems.",
  },
  {
    q: "What is the Aerospace Quality Graph?",
    a: "It is the planned data model behind AQIP: parts, revisions, characteristics, processes, measurements, evidence, quality events, suppliers and customers, stored with the relationships between them. It is what allows a question such as “what proves this characteristic?” to be answered directly.",
  },
  {
    q: "What is the Digital Quality Passport?",
    a: "A concept for a permission-controlled record of the verified manufacturing history of one serialised part: material, special processes, inspection, FAI, calibration, nonconformance, configuration and certificate of conformance. It is not public by default, and it is a planned capability.",
  },
  {
    q: "How can an aerospace MSME become a design/pilot customer?",
    a: "Use the contact link at the end of this page. A design partnership starts with a walkthrough of a recent FAI, then a benchmark on historical drawings, then a controlled pilot on a live job with the partner's own team approving every record.",
  },
  {
    q: "Can AQIP operate in private/on-prem environments?",
    a: "Private and on-prem deployment are planned, because many defence suppliers cannot place engineering data in a shared cloud. Air-gapped deployment is a possible future option. None of these is available today.",
  },
  {
    q: "Is AQIP already production-ready?",
    a: "No. What exists today is the FAI Engineer prototype: a drawing viewer, a manual ballooning workflow, a digital characteristic table and an AS9102 Form 3-oriented workflow and export foundation. Everything else on this page is in development, planned, research or long-term vision, and is labelled as such.",
  },
  {
    q: "What is the 3D Inspection Twin?",
    a: "A research concept: an interactive 3D view of a part in which each balloon on the 2D drawing is linked to the feature it controls, together with its requirement, inspection method, measurement, evidence and FAI status. Where a customer supplies approved CAD, AQIP is planned to display that geometry. Where only a drawing exists, AQIP is researching an AI-assisted reconstruction that an engineer must verify. The demonstration on this page is illustrative and uses synthetic data.",
  },
  {
    q: "Can AQIP turn any 2D drawing into an exact 3D CAD model?",
    a: "No. A 2D drawing can leave out depth, hidden and internal geometry, draft, complex curves and manufacturing intent, so an exact model cannot always be recovered. AQIP's concept is a verified 3D reconstruction: it shows its assumptions and confidence, highlights what it could not resolve and asks an engineer to confirm or correct it. A reconstruction never becomes the authoritative engineering definition. The source drawing remains authoritative unless an approved CAD or MBD model is explicitly supplied.",
  },
  {
    q: "How does AQIP protect engineering drawings and quality evidence?",
    a: "Security is designed as platform infrastructure, not a later module: role-based access, multi-factor authentication, encryption, tenant isolation, audit logging, and private, India-hosted or on-prem deployment options. Uploaded files are treated as a security boundary and processed in isolation. Customer drawings are not sent to uncontrolled external AI providers, and are not used for general AI model training without explicit authorisation. These are design requirements; AQIP holds no external security certification today.",
  },
  {
    q: "What are AQIP's AI agents allowed to do?",
    a: "The agents described on this page are research and long-term vision, not released software. Each is bounded: it can call only allowlisted tools, read only the data its task needs, and prepare or propose work. No agent can approve a quality record, release an FAI, change a source drawing or export customer data, and every action it takes is logged.",
  },
  {
    q: "What is the 3-year roadmap?",
    a: "Year 1 (2026–27): win the drawing-to-inspection-to-FAI wedge with design partners and paid pilots. Year 2 (2027–28): extend into a quality operating system for production. Year 3 (2028–29): connect suppliers and customers in an aerospace quality network. These are planning targets.",
  },
  {
    q: "What is the 5-year vision?",
    a: "Year 4 (2029–30) adds quality intelligence: predictive quality, assisted root-cause analysis and supplier risk indicators. Year 5 (2030–31) aims at trust infrastructure: quality evidence that travels with the part across the supply chain and back from the field.",
  },
  {
    q: "Who is behind the initiative?",
    a: "AQIP is an EV Society™ initiative for advancing engineering capability and aerospace manufacturing quality research. EV.ENGINEER™ is the engineering mission platform it is published on. Commercial product development and deployment are through iTelematics® Software Private Limited. The page is designed by Sudarshana Karkala.",
  },
];

export const GLOSSARY: readonly { term: string; definition: string }[] = [
  { term: "AQIP", definition: "Aerospace Quality Intelligence Platform: the initiative described on this page." },
  { term: "FAI", definition: "First Article Inspection: documented verification that a production process can make a part that meets its design." },
  { term: "FAIR", definition: "First Article Inspection Report: the record of an FAI, including design, material, process and measurement results." },
  { term: "AS9100", definition: "The aerospace quality management system standard, part of the IAQG 9100 series." },
  { term: "AS9102", definition: "The aerospace standard that sets the requirements and forms for First Article Inspection." },
  { term: "GD&T", definition: "Geometric Dimensioning and Tolerancing: the symbolic language that controls a part's form, orientation and location." },
  { term: "CMM", definition: "Coordinate Measuring Machine: equipment that measures a part's geometry by probing or scanning it." },
  { term: "NCR", definition: "Nonconformance Report: the record raised when a part or process does not meet a requirement." },
  { term: "CAPA", definition: "Corrective and Preventive Action: the work done to remove the cause of a problem and stop it recurring." },
  { term: "SPC", definition: "Statistical Process Control: monitoring measurements over time to detect process drift early." },
  { term: "CTQ", definition: "Critical to Quality: a characteristic whose variation most affects function, safety or fit." },
  { term: "CoC", definition: "Certificate of Conformance: the supplier's declaration that a delivered item meets its requirements." },
  { term: "OEM", definition: "Original Equipment Manufacturer: the company that designs and sells the end product." },
  { term: "DPSU", definition: "Defence Public Sector Undertaking: a government-owned defence manufacturer in India." },
  { term: "MSME", definition: "Micro, Small and Medium Enterprise." },
  { term: "PLM", definition: "Product Lifecycle Management: the system that holds product definitions and their revisions." },
  { term: "MES", definition: "Manufacturing Execution System: the system that tracks and controls work on the shop floor." },
  { term: "ERP", definition: "Enterprise Resource Planning: the system for orders, inventory, purchasing and finance." },
  { term: "MBD", definition: "Model-Based Definition: a 3D model that carries the product definition instead of a 2D drawing." },
  { term: "PMI", definition: "Product Manufacturing Information: the dimensions, tolerances and notes attached to a 3D model." },
  { term: "Digital Thread", definition: "The connected record that follows a requirement from engineering through manufacturing to acceptance." },
  { term: "Quality Graph", definition: "AQIP's planned data model: quality entities and the relationships between them." },
  { term: "Quality Passport", definition: "A concept for the verified, permission-controlled manufacturing history of one serialised part." },
  { term: "Supplier Quality", definition: "The work a customer does to make sure its suppliers deliver conforming parts with the evidence to show it." },
  { term: "Balloon", definition: "A numbered marker on a drawing that identifies one characteristic to be inspected." },
  { term: "3D Inspection Twin", definition: "A research concept: an interactive 3D view of a part with its balloons, characteristics, results and evidence linked to the geometry." },
  { term: "Verified 3D Reconstruction", definition: "Geometry inferred from a 2D drawing that an engineer has checked. A navigation aid, not the engineering definition." },
  { term: "STEP", definition: "A neutral file format for exchanging 3D CAD geometry between systems, standardised as ISO 10303." },
  { term: "Human-in-the-loop", definition: "A workflow in which a qualified person must verify an AI proposal before it is used." },
  { term: "AI Provenance", definition: "The record of where an AI-assisted result came from: source, model, version, confidence and reviewer." },
  { term: "RAG", definition: "Retrieval-Augmented Generation: an AI answer built from documents retrieved for the question, which it can cite." },
  { term: "RBAC", definition: "Role-Based Access Control: permissions granted by a person's role rather than one by one." },
  { term: "MFA", definition: "Multi-Factor Authentication: signing in with more than a password." },
  { term: "SSO", definition: "Single Sign-On: signing in through the organisation's own identity provider." },
  { term: "SBOM", definition: "Software Bill of Materials: the list of components a piece of software is built from." },
  { term: "Zero Trust", definition: "A security approach in which no user, device or network is trusted by default." },
];

/** Authoritative sources for the programmes and standards the page refers to. Numbers are cited in the text. */
export const SOURCES: readonly { n: number; name: string; covers: string; url: string }[] = [
  { n: 1, name: "Department of Defence Production, Ministry of Defence, Government of India", covers: "Defence production and indigenisation policy and programmes.", url: "https://www.ddpmod.gov.in/" },
  { n: 2, name: "iDEX — Innovations for Defence Excellence", covers: "The defence innovation programme for start-ups and MSMEs.", url: "https://idex.gov.in/" },
  { n: 3, name: "Ministry of Micro, Small and Medium Enterprises, Government of India", covers: "MSME policy, definitions and schemes.", url: "https://www.msme.gov.in/" },
  { n: 4, name: "SIDBI — Small Industries Development Bank of India", covers: "Finance and development programmes for MSMEs.", url: "https://www.sidbi.in/" },
  { n: 5, name: "IN-SPACe — Indian National Space Promotion and Authorisation Centre", covers: "Private-sector participation in space activities.", url: "https://www.inspace.gov.in/" },
  { n: 6, name: "IAQG — International Aerospace Quality Group", covers: "The 9100-series aerospace quality management standards.", url: "https://iaqg.org/" },
  { n: 7, name: "SAE International — AS9102, Aerospace First Article Inspection Requirement", covers: "The first article inspection standard referred to on this page.", url: "https://www.sae.org/standards/content/as9102c/" },
  { n: 8, name: "SAE International — AS9100, Quality Management Systems for Aviation, Space and Defense", covers: "The quality management system standard referred to on this page.", url: "https://www.sae.org/standards/content/as9100d/" },
];

export const SOURCES_NOTE = "AQIP does not claim certification to, or compliance with, any of these standards. They are cited so that readers can check the requirements for themselves.";

export interface EcosystemEntity {
  id: "ev-engineer" | "uflight" | "ev-society" | "itelematics";
  name: string;
  /** The name alone, without a company's legal suffix. */
  brand: string;
  /** Its role in relation to AQIP, as a short label. */
  role: string;
  /** One line for the Ecosystem menu. */
  purpose: string;
  /** The line shown on its attribution card. */
  line: string;
  href: string;
  linkLabel: string;
  external: boolean;
}

/**
 * The four names AQIP sits among, from the project's own records: one source
 * for the header's Ecosystem menu, the mobile menu, the footer and the
 * attribution cards, so no address is written twice.
 * They are not one organisation. UFlight is recorded in this repository as a
 * brand with its own site, not as a company, and is described that way here.
 */
const ECOSYSTEM_BY_ID: Record<EcosystemEntity["id"], EcosystemEntity> = {
  "ev-engineer": {
    id: "ev-engineer",
    name: "EV.ENGINEER™",
    brand: "EV.ENGINEER™",
    role: "Mission Platform",
    purpose: "Engineering learning, research and technology platform.",
    line: "Building World-Class Engineers to Solve Energy and EV Battery Challenges",
    href: "/",
    linkLabel: "EV.ENGINEER home",
    external: false,
  },
  uflight: {
    id: "uflight",
    name: "UFlight™",
    brand: "UFlight™",
    role: "Aerospace Health Monitoring",
    purpose: "Advanced health monitoring systems for aerospace and autonomous platforms.",
    line: "Advanced health monitoring systems for aerospace and autonomous platforms.",
    href: "https://www.uflight.in/",
    linkLabel: "UFlight.in",
    external: true,
  },
  "ev-society": {
    id: "ev-society",
    name: "EV Society™",
    brand: "EV Society™",
    role: "Initiative",
    purpose: "Education and research initiative; non-profit organisation.",
    line: "Non Profit Organisation",
    href: EV_SOCIETY.canonicalUrl,
    linkLabel: "EVSociety.org",
    external: true,
  },
  itelematics: {
    id: "itelematics",
    name: "iTelematics® Software Private Limited",
    brand: "iTelematics®",
    role: "Commercial Product Development",
    purpose: "Commercial engineering, software-product development and customer deployment.",
    line: "Commercial product development and deployment.",
    href: ITELEMATICS.canonicalUrl,
    linkLabel: "iTelematics.com",
    external: true,
  },
};

/** Menu order: the platform this page is on, then its siblings. */
export const ECOSYSTEM: readonly EcosystemEntity[] = [ECOSYSTEM_BY_ID["ev-engineer"], ECOSYSTEM_BY_ID.uflight, ECOSYSTEM_BY_ID["ev-society"], ECOSYSTEM_BY_ID.itelematics];

/** Attribution order: who initiated it, where it is published, the related brand, who commercialises it. */
export const ORGANISATIONS: readonly EcosystemEntity[] = [ECOSYSTEM_BY_ID["ev-society"], ECOSYSTEM_BY_ID["ev-engineer"], ECOSYSTEM_BY_ID.uflight, ECOSYSTEM_BY_ID.itelematics];

/** The site's existing contact routes. No new forms or addresses are introduced. */
export const CTAS: readonly { id: string; label: string; href: string; kind: "primary" | "secondary" | "tertiary" }[] = [
  { id: "pilot", label: "Explore a Pilot", href: "/contact", kind: "primary" },
  { id: "discuss", label: "Discuss AQIP", href: "/consulting", kind: "secondary" },
  { id: "design-partner", label: "Customer Discovery / Design Partner", href: "/contact", kind: "tertiary" },
];

export const HERO_CTAS: readonly { id: string; label: string; href: string; kind: "primary" | "secondary" }[] = [
  { id: "hero-strategy", label: "Explore Strategy", href: "#overview", kind: "primary" },
  { id: "hero-architecture", label: "View Product Architecture", href: "#architecture", kind: "secondary" },
];

export const HERO_LINK = { id: "hero-playbook", label: "Customer Discovery Playbook", href: "#customer-discovery" } as const;

/** The header's and the mobile menu's contact actions: the site's existing contact routes. */
export const HEADER_CTA = { id: "header-discuss", label: "Discuss AQIP", href: "/consulting" } as const;
export const MENU_CONTACT: readonly { id: string; label: string; href: string }[] = [
  { id: "menu-discuss", label: "Discuss AQIP", href: "/consulting" },
  { id: "menu-pilot", label: "Explore a Pilot", href: "/contact" },
];

// ── The AQIP footer ──

/** In-page destinations, grouped as the footer shows them. Every target is an id on this page. */
export const FOOTER_NAV: readonly { id: string; title: string; links: readonly { label: string; href: string }[] }[] = [
  {
    id: "strategy",
    title: "Strategy",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Problems", href: "#problems" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Business Model", href: "#business" },
      { label: "Investor Thesis", href: "#investor" },
    ],
  },
  {
    id: "product",
    title: "Product",
    links: [
      { label: "Architecture", href: "#architecture" },
      { label: "Quality Graph", href: "#quality-graph" },
      { label: "3D Inspection Twin", href: "#inspection-twin" },
      { label: "Validation", href: "#validation" },
      { label: "Customer Discovery", href: "#customer-discovery" },
      { label: "90-Day Plan", href: "#90-day-plan" },
    ],
  },
];

/** The same contact routes as the closing calls to action. */
export const FOOTER_ENGAGE: readonly { id: string; label: string; href: string }[] = [
  { id: "footer-pilot", label: "Explore a Pilot", href: "/contact" },
  { id: "footer-discuss", label: "Discuss AQIP", href: "/consulting" },
  { id: "footer-design-partner", label: "Become a Design Partner", href: "/contact" },
];

/** Who does what, in the footer's words. Four roles, not one legal entity. */
export const FOOTER_ROLES: readonly { role: string; entity: EcosystemEntity }[] = [
  { role: "Initiative", entity: ECOSYSTEM_BY_ID["ev-society"] },
  { role: "Engineering & Research", entity: ECOSYSTEM_BY_ID["ev-engineer"] },
  { role: "Aerospace Ecosystem", entity: ECOSYSTEM_BY_ID.uflight },
  { role: "Commercial Product Development", entity: ECOSYSTEM_BY_ID.itelematics },
];

export const FOOTER_DESIGNED_BY = { name: "Sudarshana Karkala", brand: "EV.ENGINEER™", href: "/about/sudarshana-karkala" } as const;

/**
 * The site-wide links the shared footer carries that still apply here. This
 * site publishes no separate privacy or terms page; its Trust Center and its
 * contact page are the routes that exist, so those are the ones linked.
 */
export const FOOTER_LEGAL: readonly { label: string; href: string; external?: boolean }[] = [
  { label: "Trust Center", href: "/trust-center" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Internship & Fees FAQ", href: "https://itelematics.com/public/iTelematics-FrequentlyAskedQuestions.pdf", external: true },
];

/** The operating company's published contact details, from the project's entity registry. */
export const FOOTER_COMPANY = {
  name: ITELEMATICS.legalName ?? ITELEMATICS.name,
  email: ITELEMATICS.publicEmail,
  telephone: ITELEMATICS.publicTelephone,
  location: ITELEMATICS.publicLocation,
} as const;
