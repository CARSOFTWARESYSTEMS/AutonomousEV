// The roadmap: three years of planning targets and two of long-term vision, on
// the 2026–2031 horizon. None of it is a commitment.

export type RoadmapTrack = "Quality" | "AI" | "3D" | "Security";

export interface RoadmapYear {
  id: string;
  year: number;
  /** The planning period this year stands for. */
  period: string;
  theme: string;
  summary: string;
  items: readonly string[];
  /** What the platform covers once this year's work is added. */
  scope: string;
  /** Who the customers are expected to be by then. */
  customer: string;
  /** The shape of the company by then. */
  company: string;
  /** What the year adds on each of the platform's four tracks. A track with nothing new that year is left out. */
  tracks: readonly { track: RoadmapTrack; text: string }[];
  /** Years 1 to 3 are planning targets; years 4 and 5 are long-term vision. */
  horizon: "target" | "vision";
}

export const ROADMAP: readonly RoadmapYear[] = [
  {
    id: "year-1",
    year: 1,
    period: "2026–27",
    theme: "Win the Drawing → Inspection → FAI wedge",
    summary: "Prove, with design partners, that AQIP shortens first article inspection without losing human control.",
    items: [
      "Customer discovery",
      "Design partners",
      "Drawing intelligence",
      "Human verification",
      "Ballooning",
      "Characteristics",
      "Inspection planning",
      "CMM import",
      "FAI",
      "Evidence",
      "Revision comparison",
      "Secure deployment",
      "3D reconstruction research prototype",
      "Paid pilots",
    ],
    scope: "Drawing → Inspection → FAI",
    customer: "Design partners and paid pilots with precision-machining MSMEs.",
    company: "A founding team of up to 10, founder-led sales, founder capital and non-dilutive funding.",
    tracks: [
      { track: "Quality", text: "Drawing → Inspection → FAI" },
      { track: "AI", text: "Source-linked extraction, verified by a person" },
      { track: "3D", text: "Research prototype: reconstruction of simple parts" },
      { track: "Security", text: "RBAC, MFA, encryption, audit and private deployment foundations" },
    ],
    horizon: "target",
  },
  {
    id: "year-2",
    year: 2,
    period: "2027–28",
    theme: "Quality Operating System",
    summary: "Extend the same characteristic model from first article into everyday production quality.",
    items: [
      "Incoming inspection",
      "In-process inspection",
      "Final inspection",
      "NCR/CAPA",
      "SPC",
      "Calibration integrations",
      "Supplier deviation workflows",
      "Audit evidence",
      "Supplier portal",
      "STEP visualisation",
      "Balloon-to-feature mapping",
      "SSO and on-prem maturity",
    ],
    scope: "The wedge, plus production quality operations",
    customer: "Paying MSME customers expanding from first article into production quality.",
    company: "10 to 30 people; pre-seed to seed; the first repeatable sales.",
    tracks: [
      { track: "Quality", text: "NCR/CAPA, production inspection and SPC" },
      { track: "AI", text: "Revision and evidence assistance" },
      { track: "3D", text: "Authoritative STEP integration and balloon-to-feature mapping" },
      { track: "Security", text: "SSO, advanced access policy and on-prem maturity" },
    ],
    horizon: "target",
  },
  {
    id: "year-3",
    year: 3,
    period: "2028–29",
    theme: "Aerospace Quality Network",
    summary: "Connect suppliers and their customers on shared, permission-controlled quality evidence.",
    items: ["OEM supplier network", "Supplier collaboration", "Supplier quality passport", "3D Quality Passport", "Evidence sharing", "Controlled sharing boundaries", "Quality APIs", "Enterprise integrations", "Multi-site deployment"],
    scope: "Quality operations, plus the supplier–customer network",
    customer: "Larger suppliers, and the first customer-sponsored supplier networks.",
    company: "30 to 100 people; seed stage; enterprise sales and integrations.",
    tracks: [
      { track: "Quality", text: "Supplier network" },
      { track: "AI", text: "Supplier quality assistance" },
      { track: "3D", text: "3D Quality Passport and visual supplier evidence" },
      { track: "Security", text: "Supplier trust boundaries and controlled sharing" },
    ],
    horizon: "target",
  },
  {
    id: "year-4",
    year: 4,
    period: "2029–30",
    theme: "Quality Intelligence",
    summary: "Use the structured evidence the first three years create.",
    items: ["Predictive quality", "AI-assisted root cause analysis", "Supplier risk indicators", "3D MBD / PMI support", "3D revision intelligence", "Advanced process intelligence", "Quality policy as code"],
    scope: "The network, plus intelligence built on its evidence",
    customer: "OEMs, primes and multi-tier supplier networks.",
    company: "Growth stage, organised into product groups.",
    tracks: [
      { track: "Quality", text: "Quality intelligence" },
      { track: "AI", text: "Predictive quality and root-cause assistance" },
      { track: "3D", text: "Revision geometry intelligence and process visualisation" },
    ],
    horizon: "vision",
  },
  {
    id: "year-5",
    year: 5,
    period: "2030–31",
    theme: "Trust Infrastructure",
    summary: "Quality evidence that travels with the part, across the supply chain and into service.",
    items: [
      "Cross-supply-chain quality evidence",
      "Multi-tier supplier network",
      "Serialized quality passports",
      "Field-to-manufacturing feedback",
      "Quality Evidence API",
      "Global aerospace deployment",
      "Factory-to-field intelligence",
      "Factory-to-field digital quality twin",
      "Secure multi-tier evidence exchange",
    ],
    scope: "Factory-to-field trust infrastructure",
    customer: "Cross-supply-chain networks, including international aerospace suppliers.",
    company: "Growth stage; national and global expansion.",
    tracks: [
      { track: "Quality", text: "Trust infrastructure" },
      { track: "AI", text: "Factory-to-field quality intelligence" },
      { track: "3D", text: "Factory-to-field digital quality twin" },
      { track: "Security", text: "Secure multi-tier evidence exchange" },
    ],
    horizon: "vision",
  },
];

/** Years 4 and 5: the long-term vision. */
export const VISION_YEARS: readonly RoadmapYear[] = ROADMAP.filter((year) => year.horizon === "vision");

/** The platform layers the roadmap adds, in order. A layer is in scope from the year given. */
export const PLATFORM_LAYERS: readonly { name: string; fromYear: number; parts: readonly string[] }[] = [
  { name: "Drawing → Inspection → FAI", fromYear: 1, parts: ["Drawing Intelligence", "Digital Characteristics", "Inspection Planning", "CMM import", "FAI / FAIR", "Evidence", "Revision comparison"] },
  { name: "Quality Operating System", fromYear: 2, parts: ["Incoming, in-process and final inspection", "NCR / CAPA", "SPC", "Calibration", "Audit evidence", "Supplier portal", "STEP visualisation"] },
  { name: "Aerospace Quality Network", fromYear: 3, parts: ["OEM supplier network", "Quality Passport", "3D Quality Passport", "Evidence sharing", "Quality APIs", "Enterprise integrations"] },
  { name: "Quality Intelligence", fromYear: 4, parts: ["Predictive quality", "Assisted root cause analysis", "Supplier risk indicators", "MBD / PMI support", "3D revision intelligence", "Quality policy as code"] },
  { name: "Trust Infrastructure", fromYear: 5, parts: ["Cross-supply-chain evidence", "Serialized quality passports", "Field-to-manufacturing feedback", "Factory-to-field quality twin", "Quality Evidence API"] },
];

export const VISION_FLOW = ["Factory", "Supplier", "OEM", "Product", "Field", "Feedback", "AQIP intelligence"] as const;

export const FIELD_LOOP = ["Field issue", "Serial number", "Quality Passport", "Manufacturing history", "Measurement trends", "Process history", "Supplier", "Root-cause investigation"] as const;

export const FIELD_QUESTION = "Could manufacturing data have predicted this failure?";
