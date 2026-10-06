// The three-year roadmap and the five-year vision. Years are planning targets
// on the 2026–2031 horizon, not commitments.

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
      "Paid pilots",
    ],
    scope: "Drawing → Inspection → FAI",
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
    ],
    scope: "The wedge, plus production quality operations",
  },
  {
    id: "year-3",
    year: 3,
    period: "2028–29",
    theme: "Aerospace Quality Network",
    summary: "Connect suppliers and their customers on shared, permission-controlled quality evidence.",
    items: ["OEM supplier network", "Supplier collaboration", "Supplier quality passport", "Evidence sharing", "Quality APIs", "Enterprise integrations", "Multi-site deployment"],
    scope: "Quality operations, plus the supplier–customer network",
  },
];

export const VISION_YEARS: readonly RoadmapYear[] = [
  {
    id: "year-4",
    year: 4,
    period: "2029–30",
    theme: "Quality Intelligence",
    summary: "Use the structured evidence the first three years create.",
    items: ["Predictive quality", "AI-assisted root cause analysis", "Supplier risk indicators", "3D MBD / PMI support", "Advanced process intelligence", "Quality policy as code"],
    scope: "The network, plus intelligence built on its evidence",
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
    ],
    scope: "Factory-to-field trust infrastructure",
  },
];

/** The platform layers the roadmap adds, in order. A layer is in scope from the year given. */
export const PLATFORM_LAYERS: readonly { name: string; fromYear: number; parts: readonly string[] }[] = [
  { name: "Drawing → Inspection → FAI", fromYear: 1, parts: ["Drawing Intelligence", "Digital Characteristics", "Inspection Planning", "CMM import", "FAI / FAIR", "Evidence", "Revision comparison"] },
  { name: "Quality Operating System", fromYear: 2, parts: ["Incoming, in-process and final inspection", "NCR / CAPA", "SPC", "Calibration", "Audit evidence", "Supplier portal"] },
  { name: "Aerospace Quality Network", fromYear: 3, parts: ["OEM supplier network", "Quality Passport", "Evidence sharing", "Quality APIs", "Enterprise integrations"] },
];

export const VISION_FLOW = ["Factory", "Supplier", "OEM", "Product", "Field", "Feedback", "AQIP intelligence"] as const;

export const FIELD_LOOP = ["Field issue", "Serial number", "Quality Passport", "Manufacturing history", "Measurement trends", "Process history", "Supplier", "Root-cause investigation"] as const;

export const FIELD_QUESTION = "Could manufacturing data have predicted this failure?";
