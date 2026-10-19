/**
 * The business view: the investor questions the site answers, the CTO
 * questions, the business model canvas and the "where can we contribute?"
 * areas. Proprietary detail stays out; this is the shape of the program.
 */

export const BUSINESS_EQUATION: readonly { title: string; line: string }[] = [
  { title: "APEX", line: "Owns the rocket" },
  { title: "Specialist partners", line: "Provide critical capabilities" },
  { title: "Digital engineering", line: "Connects the evidence" },
  { title: "Physical testing", line: "Builds confidence" },
];

export const BUSINESS_RESULT = "A validated system development path";

export const INVESTOR_QUESTIONS: readonly { q: string; a: string; link?: { label: string; path: string } }[] = [
  { q: "Is the hardware real?", a: "Yes. APEX has built a 5 kN-class gas-generator-cycle liquid-engine demonstrator, published on its own website and shown here in APEX's photographs.", link: { label: "Engine", path: "/engine" } },
  { q: "Is the team aware of the full engineering challenge?", a: "The complete system map shows every domain an integrated vehicle needs, and how each depends on the others.", link: { label: "System", path: "/system" } },
  { q: "What has been built versus proposed?", a: "Every item carries one of six labels — Built, Active, Planned, Concept, Partner Required, Evidence Required — and nothing is shown stronger than its evidence." },
  { q: "What capabilities are missing?", a: "Open capabilities are listed as Partner Required, by name, rather than hidden.", link: { label: "Ecosystem", path: "/ecosystem" } },
  { q: "Does APEX need to build everything internally?", a: "No. Specialist partners can contribute capabilities while APEX keeps system intent and engineering authority." },
  { q: "What is capital-intensive?", a: "Physical manufacturing, test infrastructure, facilities and hardware. These are where partner access saves the most capital." },
  { q: "How is technical risk reduced?", a: "Progressive testing up the confidence ladder, Digital Twin correlation against measurements, and recorded engineering evidence.", link: { label: "Build & Validate", path: "/build-validate" } },
  { q: "How is knowledge retained?", a: "The digital thread, configuration control and traceable test records keep knowledge in the program rather than in individuals." },
  { q: "Can this approach scale?", a: "The capability and partner model is many-to-many and data-driven: new partners and capabilities are added without redesigning the program." },
];

export const CTO_QUESTIONS: readonly { q: string; a: string }[] = [
  { q: "Who owns the architecture?", a: "APEX." },
  { q: "Who owns technical decisions?", a: "APEX." },
  { q: "How are interfaces managed?", a: "Through systems engineering: interface definitions, traceability and configuration baselines under APEX authority." },
  { q: "How is hardware validated?", a: "Progressively — material, part, component, subsystem, engine, propulsion system, vehicle — with evidence at each rung." },
  { q: "How is firmware validated?", a: "Unit and interface tests, software- and hardware-in-the-loop, then integration — each tied to a released baseline." },
  { q: "How is model confidence built?", a: "By predicting before each test and correlating with measurements on the same configuration." },
  { q: "How are changes controlled?", a: "A configuration-aware digital thread links every change to the hardware, firmware, software and model revisions it affects." },
  { q: "How are partners kept from becoming silos?", a: "Every partner is mapped to capabilities, every capability to interfaces, and every interface to evidence." },
];

export const CAPITAL_INTENSIVE: readonly string[] = ["Manufacturing", "Testing", "Facilities", "Hardware"];

export const BUSINESS_MODEL_CANVAS: readonly { id: string; title: string; items: string[] }[] = [
  {
    id: "problem",
    title: "Critical problem",
    items: [
      "Emerging rocket companies can build promising propulsion hardware but struggle to turn it into verified integrated systems, because engineering, manufacturing, testing, software, instrumentation and validation capability is spread across many organisations.",
    ],
  },
  { id: "customer", title: "Primary customer", items: ["APEX Rocket Systems."] },
  {
    id: "value",
    title: "Value proposition",
    items: [
      "A coordinated engineering-and-validation ecosystem that lets APEX keep technical ownership while accessing the specialist capabilities needed to design, build, instrument, test, correlate and validate rocket systems.",
    ],
  },
  {
    id: "activities",
    title: "Key activities",
    items: ["Systems engineering", "Interface management", "Partner integration", "Digital engineering", "Test planning", "Digital Twin correlation", "Software/firmware integration", "Quality evidence", "Physical test coordination", "Technical reviews"],
  },
  {
    id: "resources",
    title: "Key resources",
    items: ["APEX propulsion hardware and domain expertise", "Engineering partner network", "Test data", "Simulation models", "Manufacturing network", "Specialist labs", "Engineering evidence", "Digital engineering platform"],
  },
  {
    id: "partners",
    title: "Key partners",
    items: ["Gamyaa Aerospace", "iFab Innovations", "iTelematics", "EV Society", "Avionics partners", "Sensor partners", "GNC specialists", "Manufacturers", "Test labs", "Material suppliers", "NDT", "Research institutions", "Facility partners"],
  },
  {
    id: "costs",
    title: "Cost structure",
    items: ["Engineering", "Prototypes", "Manufacturing", "Sensors and instrumentation", "Test infrastructure", "Labs", "Software", "Simulation", "Quality", "Program coordination"],
  },
  {
    id: "revenue",
    title: "Commercial logic",
    items: ["Engineering collaboration fees", "Digital engineering services", "Digital Twin development", "Quality platform services", "Test-data platform", "Integration support", "A reusable engineering platform over time"],
  },
];

/** "Where can we contribute?" — each area maps to capabilities and lifecycle stages. */
export const CONTRIBUTION_AREAS: readonly { id: string; label: string; capabilityIds: string[]; lifecycleIds: string[]; interfacesThatMatter: string[] }[] = [
  { id: "manufacturing", label: "Manufacturing", capabilityIds: ["aerospace-manufacturing", "precision-machining", "welding-brazing", "special-processes"], lifecycleIds: ["procurement", "manufacturing", "inspection"], interfacesThatMatter: ["Released drawings and BOMs", "Process specifications", "Inspection and FAI requirements"] },
  { id: "sensors", label: "Sensors", capabilityIds: ["sensors-instrumentation"], lifecycleIds: ["component-testing", "subsystem-testing"], interfacesThatMatter: ["Measurement ranges and accuracy", "Electrical and mechanical mounting", "Calibration records"] },
  { id: "avionics", label: "Avionics", capabilityIds: ["avionics", "power-electrical", "emi-emc"], lifecycleIds: ["subsystem-design", "hil", "integrated-vehicle-test"], interfacesThatMatter: ["Power and grounding", "Data buses", "Environmental and EMC levels"] },
  { id: "embedded", label: "Embedded", capabilityIds: ["embedded-firmware", "engine-control"], lifecycleIds: ["firmware-development", "hil", "component-testing"], interfacesThatMatter: ["Sensor and actuator interfaces", "Communication protocols", "Firmware release and signing"] },
  { id: "gnc", label: "GNC", capabilityIds: ["gnc", "simulation"], lifecycleIds: ["simulation", "hil", "mission-simulation"], interfacesThatMatter: ["Vehicle model", "Navigation sensor data", "Flight software interface"] },
  { id: "rf", label: "RF", capabilityIds: ["rf-telemetry"], lifecycleIds: ["ground-system-test", "flight"], interfacesThatMatter: ["Telemetry format", "Link budget", "Ground station interface"] },
  { id: "test-infrastructure", label: "Test infrastructure", capabilityIds: ["propulsion-test-infrastructure", "environmental-testing", "structural-test-labs", "gse"], lifecycleIds: ["component-testing", "subsystem-testing", "integrated-vehicle-test"], interfacesThatMatter: ["Test objectives", "DAQ and control interface", "Facility safety plan"] },
  { id: "materials", label: "Materials", capabilityIds: ["materials", "special-processes", "ndt"], lifecycleIds: ["procurement", "manufacturing", "inspection"], interfacesThatMatter: ["Material specifications", "Certificates and traceability", "Coupon testing"] },
  { id: "quality", label: "Quality", capabilityIds: ["manufacturing-quality", "quality-intelligence", "digital-quality-thread", "ndt"], lifecycleIds: ["inspection", "system-integration", "flight-readiness"], interfacesThatMatter: ["Drawings and acceptance criteria", "Serial-number traceability", "Non-conformance process"] },
  { id: "research", label: "Research", capabilityIds: ["research-academia", "simulation", "materials"], lifecycleIds: ["simulation", "digital-twin", "post-flight-analysis"], interfacesThatMatter: ["Data-sharing terms", "Model assumptions", "Publication clearance"] },
  { id: "academia", label: "Academia", capabilityIds: ["research-academia", "skills-workforce"], lifecycleIds: ["simulation", "software-development"], interfacesThatMatter: ["Student project scope", "Lab access", "Supervision"] },
  { id: "software", label: "Software", capabilityIds: ["software-engineering", "ground-software", "test-data"], lifecycleIds: ["software-development", "ground-system-test"], interfacesThatMatter: ["Software requirements", "Test-stand and DAQ interfaces", "Release management"] },
  { id: "digital-twin", label: "Digital Twin", capabilityIds: ["digital-twin", "simulation", "test-data"], lifecycleIds: ["digital-twin", "subsystem-testing", "post-flight-analysis"], interfacesThatMatter: ["Hardware configuration baseline", "Sensor map and calibration", "Test data format"] },
  { id: "cybersecurity", label: "Cybersecurity", capabilityIds: ["cybersecurity"], lifecycleIds: ["firmware-development", "software-development", "ground-system-test"], interfacesThatMatter: ["Firmware signing", "Command and telemetry integrity", "Access control"] },
  { id: "ai", label: "AI", capabilityIds: ["engineering-ai"], lifecycleIds: ["post-flight-analysis", "component-testing"], interfacesThatMatter: ["Test-data access", "Engineer-in-the-loop review", "Audit of AI-assisted decisions"] },
  { id: "workforce", label: "Workforce", capabilityIds: ["skills-workforce"], lifecycleIds: ["software-development", "firmware-development"], interfacesThatMatter: ["Project briefs", "Mentoring", "Skills records"] },
];

export const COLLABORATION_CATEGORIES: readonly { id: string; label: string }[] = [
  { id: "strategic", label: "Strategic Partnership" },
  { id: "engineering", label: "Engineering Collaboration" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "embedded", label: "Embedded Systems" },
  { id: "avionics", label: "Avionics" },
  { id: "sensors", label: "Sensors" },
  { id: "testing", label: "Testing" },
  { id: "research", label: "Research" },
  { id: "investment", label: "Investment" },
  { id: "talent", label: "Talent" },
];
