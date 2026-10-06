// Navigation, FAQ, glossary, sources, organisations and calls to action.
import { EV_SOCIETY, ITELEMATICS } from "@/data/public-entities";

/** The strategy index, in page order. `executive` groups stay visible in Executive Mode. */
export const NAV: readonly { id: string; label: string; executive?: boolean }[] = [
  { id: "overview", label: "Overview", executive: true },
  { id: "opportunity", label: "Opportunity" },
  { id: "problems", label: "Problems", executive: true },
  { id: "product", label: "Product", executive: true },
  { id: "quality-graph", label: "Quality Graph" },
  { id: "roadmap", label: "Roadmap", executive: true },
  { id: "customers", label: "Customers" },
  { id: "validation", label: "Validation" },
  { id: "business", label: "Business", executive: true },
  { id: "go-to-market", label: "Go-To-Market" },
  { id: "leadership", label: "Leadership", executive: true },
  { id: "investor", label: "Investor", executive: true },
  { id: "execution", label: "Execution" },
  { id: "metrics", label: "Metrics" },
  { id: "risks", label: "Risks" },
  { id: "90-day-plan", label: "90-Day Plan", executive: true },
  { id: "reference", label: "FAQ & Glossary" },
];

export const EXECUTIVE_SECTIONS = ["Vision", "Problem", "Solution", "Roadmap", "Business Model", "Investor Thesis", "90-Day Plan"] as const;

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
    a: "No. What exists today is the FAI Engineer prototype: a drawing viewer, a manual ballooning workflow, a digital characteristic table and an AS9102 Form 3-oriented workflow and export foundation. Everything else on this page is in development, planned or research, and is labelled as such.",
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

export const ORGANISATIONS: readonly { id: "ev-society" | "ev-engineer" | "itelematics"; role: string; name: string; line: string; href: string; linkLabel: string; external: boolean }[] = [
  { id: "ev-society", role: "Initiative", name: "EV Society™", line: "Non Profit Organisation", href: EV_SOCIETY.canonicalUrl, linkLabel: "EVSociety.org", external: true },
  { id: "ev-engineer", role: "Mission Platform", name: "EV.ENGINEER™", line: "Building World-Class Engineers to Solve Energy and EV Battery Challenges", href: "/", linkLabel: "EV.ENGINEER home", external: false },
  { id: "itelematics", role: "Commercial Product Development", name: "iTelematics® Software Private Limited", line: "Commercial product development and deployment.", href: ITELEMATICS.canonicalUrl, linkLabel: "iTelematics.com", external: true },
];

/** The site's existing contact routes. No new forms or addresses are introduced. */
export const CTAS: readonly { id: string; label: string; href: string; kind: "primary" | "secondary" | "tertiary" }[] = [
  { id: "pilot", label: "Explore a Pilot", href: "/contact", kind: "primary" },
  { id: "discuss", label: "Discuss AQIP", href: "/consulting", kind: "secondary" },
  { id: "design-partner", label: "Customer Discovery / Design Partner", href: "/contact", kind: "tertiary" },
];

export const HERO_CTAS: readonly { id: string; label: string; href: string; kind: "primary" | "secondary" | "tertiary" }[] = [
  { id: "hero-strategy", label: "Explore the Strategy", href: "#overview", kind: "primary" },
  { id: "hero-architecture", label: "View Product Architecture", href: "#architecture", kind: "secondary" },
  { id: "hero-playbook", label: "Customer Discovery Playbook", href: "#customer-discovery", kind: "tertiary" },
];
