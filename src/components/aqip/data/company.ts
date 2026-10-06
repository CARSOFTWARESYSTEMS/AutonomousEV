// The company: go-to-market, leadership and the investor thesis.

export const SALES_MOTION = [
  "Discovery",
  "Workflow Audit",
  "Live Dataset",
  "Controlled Pilot",
  "ROI Measurement",
  "Commercial Proposal",
  "Deployment",
  "Customer Success",
  "Expansion",
  "Supplier Network",
] as const;

export const DECISION_MAKERS: readonly { role: string; cares: string }[] = [
  { role: "Founder/MD", cares: "Customer approvals, growth and risk to the business." },
  { role: "Head of Quality", cares: "Escapes, audit findings and team workload." },
  { role: "Plant Head", cares: "Delivery dates and first-time-right." },
  { role: "Quality Manager", cares: "Day-to-day FAI and inspection effort." },
  { role: "Manufacturing Head", cares: "Rework, scrap and clear requirements on the shop floor." },
  { role: "CTO/CIO", cares: "Security, integration and where the data lives." },
  { role: "Procurement", cares: "Price, terms and supplier risk." },
  { role: "Supplier Quality", cares: "Consistent, reviewable evidence from suppliers." },
];

export const SALES_PRINCIPLE = "Sell time saved, risk reduced, approval accelerated and trust improved — not AI.";

export const ONBOARDING: readonly { when: string; what: string }[] = [
  { when: "Week 1", what: "Workflow mapping" },
  { when: "Week 2", what: "Historical drawing benchmark" },
  { when: "Week 3", what: "User configuration" },
  { when: "Week 4", what: "First controlled live workflow" },
  { when: "Month 2", what: "ROI review" },
  { when: "Month 3", what: "Expansion decision" },
];

export const SUCCESS_METRICS = ["FAI cycle time", "Engineering hours", "Characteristics processed", "Corrections", "Evidence completeness", "Rework", "Active users"] as const;

export const MARKETING_ASSETS = [
  "State of Aerospace MSME Quality in India",
  "Aerospace FAI Benchmark Report",
  "Drawing Revision Risk Report",
  "Digital Quality Evidence Guide",
  "Aerospace Quality Automation ROI Calculator",
  "Quality Intelligence Newsletter",
  "Customer case studies",
] as const;

export const MARKETING_PRINCIPLE = "A quantified customer outcome is more valuable than an AI buzzword.";

export const ROUNDTABLE = {
  name: "India Aerospace Quality Network",
  label: "Community Strategy",
  concept: "A proposed monthly roundtable for people who do aerospace quality work. It does not exist yet.",
  participants: ["Quality heads", "Manufacturing engineers", "Metrology experts", "GD&T specialists", "AS9100 experts", "Supplier quality engineers", "MSME founders"],
} as const;

export const VISION = "To become the trusted digital quality infrastructure connecting aerospace and defence engineering, manufacturing, suppliers and customers.";
export const VISION_SUPPORT = "Every aerospace part should carry provable manufacturing evidence.";
export const MISSION = "Make high-assurance aerospace manufacturing quality accessible, traceable and scalable by converting engineering requirements into human-verified digital evidence.";

export const VALUES: readonly { name: string; text: string }[] = [
  { name: "Innovation", text: "We solve difficult engineering problems and continuously improve how aerospace quality work is performed." },
  { name: "Quality", text: "We treat quality as engineering evidence, not paperwork." },
  { name: "Safety & Security", text: "We protect engineering integrity, human authority and sensitive information." },
  { name: "Team Empowerment", text: "Technology should amplify qualified engineers, not remove accountability." },
  { name: "Customer-Centricity", text: "We solve measurable customer pain instead of building technology for its own sake." },
  { name: "Traceability", text: "Every important conclusion should be explainable back to its source." },
  { name: "Trust", text: "Long-term industry trust is more valuable than short-term feature velocity." },
  { name: "Execution", text: "Real customer outcomes matter more than demos." },
];

export interface ExecutiveRole {
  id: string;
  title: string;
  responsibilities: readonly string[];
  /** The principle, note or question the role works by. */
  principle?: string;
  principleLabel?: string;
}

export const ROLES: readonly ExecutiveRole[] = [
  {
    id: "ceo",
    title: "Founder / CEO",
    responsibilities: [
      "Vision and category creation",
      "Personally understand the first 100 customers",
      "Recruit executive and domain talent",
      "Decide what NOT to build",
      "Close the first strategic customers",
      "Strategic partnerships",
      "Capital allocation",
      "Culture",
      "Board and investor communication",
      "Business model",
      "Long-term direction",
    ],
    principle: "CEO = Chief Customer Officer",
    principleLabel: "Year-1 principle",
  },
  {
    id: "cto",
    title: "CTO",
    responsibilities: [
      "Platform architecture",
      "Quality Graph",
      "Engineering standards",
      "AI architecture",
      "Deterministic workflow engine",
      "Integrations",
      "Scalability",
      "DevSecOps",
      "Technical hiring",
      "System reliability",
      "AI governance",
    ],
    principle: "Deterministic where correctness matters; AI where interpretation creates leverage.",
    principleLabel: "CTO principle",
  },
  {
    id: "cqo",
    title: "Chief Quality Officer",
    responsibilities: [
      "Aerospace quality domain authority",
      "FAI",
      "AS9100/AS9102 workflow expertise",
      "GD&T",
      "Metrology",
      "Configuration management",
      "Customer-quality requirements",
      "Validation methods",
      "Product domain approval",
      "Industry advisory network",
    ],
    principle: "AQIP cannot become world-class through software expertise alone.",
    principleLabel: "Note",
  },
  {
    id: "cpo",
    title: "Chief Product Officer",
    responsibilities: ["Problem discovery", "Roadmap", "Prioritisation", "Product metrics", "UX", "Customer feedback", "Market segmentation", "Product-market fit"],
    principle: "What measurable customer outcome improves?",
    principleLabel: "The question for every proposed feature",
  },
  {
    id: "ciso",
    title: "CISO",
    responsibilities: [
      "Threat modelling",
      "Secure SDLC",
      "Identity",
      "Encryption",
      "SBOM",
      "VAPT",
      "Deployment isolation",
      "Data residency",
      "Incident response",
      "Security monitoring",
      "Defence data protection strategy",
    ],
  },
  {
    id: "cso",
    title: "Chief Sales Officer",
    responsibilities: ["Account segmentation", "Founder-to-sales transition", "Enterprise sales", "Partner and channel strategy", "OEM network agreements", "Pipeline and forecast", "Renewals", "Expansion"],
    principle: SALES_PRINCIPLE,
    principleLabel: "Sales principle",
  },
  {
    id: "cmo",
    title: "CMO",
    responsibilities: ["Category creation", "Positioning", "Industry research", "Benchmark reports", "Case studies", "Conferences", "Community", "ABM", "Content", "Customer stories", "Qualified demand"],
    principle: MARKETING_PRINCIPLE,
    principleLabel: "Marketing principle",
  },
  {
    id: "cfo",
    title: "CFO",
    responsibilities: ["Runway", "Pricing", "Collections", "Grant accounting", "SaaS economics", "Cash forecasting", "Fundraising", "Budget discipline", "Enterprise contracts"],
    principle: "Use grants to accelerate R&D. Build the business on customer value and recurring revenue.",
    principleLabel: "Principle",
  },
  {
    id: "customer-success",
    title: "Customer Success",
    responsibilities: ["Onboarding and workflow mapping", "Historical drawing benchmarks", "User configuration and training", "First controlled live workflow", "ROI reviews", "Adoption and renewal", "Feeding customer evidence back to product"],
    principle: "A customer is successful when a live FAI is completed faster, with the evidence to show it.",
    principleLabel: "Principle",
  },
  {
    id: "engineering",
    title: "Engineering / AI Team",
    responsibilities: [
      "Build the platform and the Quality Graph",
      "Extraction models and their evaluation",
      "Human-verification experience",
      "Integrations and CMM adapters",
      "Secure, tested and documented releases",
      "Benchmarks: precision, recall and corrections",
    ],
    principle: "No release without measured extraction quality and a working human-approval path.",
    principleLabel: "Principle",
  },
];

export const ORG_STAGES: readonly { size: string; heading: string; items: readonly string[] }[] = [
  { size: "0–10 people", heading: "Founding team", items: ["Founder / CEO", "CTO", "2–3 software engineers", "AI/CV engineer", "Aerospace-quality expert", "Product/UX", "Customer implementation/success"] },
  { size: "10–30 people", heading: "Add", items: ["CISO/security", "Integrations", "QA automation", "Metrology/domain specialists", "Enterprise sales", "Customer success", "Product management"] },
  {
    size: "30–100 people",
    heading: "Product groups",
    items: ["Drawing Intelligence", "Inspection & FAI", "Quality Operations", "Supplier Quality", "Quality Intelligence", "Platform/Security", "Enterprise Integrations"],
  },
];

export const INVESTOR_THESIS: readonly { question: string; answer: string; points?: readonly string[] }[] = [
  { question: "Why now?", answer: "Growing aerospace/defence manufacturing and supplier complexity." },
  { question: "Why this problem?", answer: "Quality is mandatory and recurring." },
  { question: "Why software?", answer: "Many workflows remain fragmented and repetitive." },
  { question: "Why AQIP?", answer: "Digital thread + Quality Graph + human-verifiable AI + supplier network." },
  { question: "Why defensible?", answer: "The advantages that compound with use:", points: ["Domain data", "Workflow depth", "Integrations", "Historical evidence", "Network effects", "Trust"] },
  { question: "Why scale?", answer: "Supplier → OEM → network." },
];

export const FUNDING_STAGES: readonly { stage: string; name: string; source: string; objective: string; when: string }[] = [
  {
    stage: "Stage 1",
    name: "Bootstrap / Non-dilutive",
    source: "Founder capital + non-dilutive programmes",
    objective: "Prototype + pilots + validation",
    when: "Appropriate from day one, while the problem and the wedge are still being proven.",
  },
  { stage: "Stage 2", name: "Pre-seed", source: "Pre-seed", objective: "Product engineering + domain team", when: "Raise only after paid pilot signals." },
  { stage: "Stage 3", name: "Seed", source: "Seed", objective: "Repeatable sales + enterprise + integrations", when: "Appropriate once pilots convert and the sales motion repeats without the founder in every deal." },
  { stage: "Stage 4", name: "Growth", source: "Growth", objective: "Supplier network + national/global expansion", when: "Appropriate once customers bring their suppliers and the network model is working." },
];

export const FUNDING_PRINCIPLE = "Capital should accelerate something that is already working.";
