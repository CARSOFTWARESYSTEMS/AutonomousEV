// Content for /space/satellite-engineering. Kept as plain data so the page,
// its JSON-LD graph and its tests all read from one source and never drift.

// In-page table of contents: short labels, 11 items at most. Certification,
// Week 0 and the tools/reference sections sit between these anchors.
export const tocLinks = [
  ["#thesis", "Overview"],
  ["#audience", "Audience"],
  ["#glance", "Program"],
  ["#reference-mission", "Mission"],
  ["#curriculum", "Curriculum"],
  ["#digital-twin", "Digital Twin"],
  ["#flatsat", "Flatsat"],
  ["#reviews", "Reviews"],
  ["#outcomes", "Outcomes"],
  ["#portfolio", "Portfolio"],
  ["#careers", "Careers"],
] as const;

export const heroChips = [
  "12 Weeks",
  "120 Contact Hours",
  "Architecture Studio",
  "Satellite Digital Twin",
  "CubeSat Flatsat",
  "SRR · PDR · CDR",
] as const;

export const heroAudience = [
  "Systems Leads",
  "Principal Engineers",
  "Engineering Managers",
  "CTOs",
  "Chief Architects",
  "Senior R&D Engineers",
] as const;

export const lifecycle = [
  "Mission Need",
  "Requirements",
  "Architecture",
  "Trade Studies",
  "Detailed Engineering",
  "Simulation",
  "Prototype / Flatsat",
  "Verification & Validation",
  "Mission Operations",
  "Technical & Commercial Decision",
] as const;

export const interactingDisciplines = [
  "Orbit",
  "Payload",
  "Power",
  "ADCS",
  "Communications",
  "Avionics",
  "Structures",
  "Thermal",
  "Propulsion",
  "Software",
  "Reliability",
  "Operations",
  "Cost",
] as const;

export type Audience = { role: string; description: string };

export const audiences: Audience[] = [
  {
    role: "Systems Lead",
    description: "Translate mission objectives into coordinated spacecraft-level technical decisions across every subsystem team.",
  },
  {
    role: "Principal Engineer",
    description: "Extend deep subsystem expertise into cross-disciplinary judgement on margins, interfaces and failure behaviour.",
  },
  {
    role: "Engineering Manager",
    description: "Run spacecraft programs through review gates with clear technical baselines, risk ownership and decision authority.",
  },
  {
    role: "CTO",
    description: "Connect mission capability, engineering strategy, technology roadmap, cost, supply chain and organisational execution.",
  },
  {
    role: "Chief Architect",
    description: "Develop and defend system architecture, interfaces, trade-offs, technology choices and risk posture.",
  },
  {
    role: "Senior R&D Engineer",
    description: "Position research and new technology against real spacecraft constraints, readiness levels and qualification paths.",
  },
  {
    role: "Experienced Engineers Transitioning into Space Systems",
    description:
      "Bring automotive, avionics, energy, telecom, embedded or defence experience into the spacecraft domain with a rigorous systems foundation — rather than learning one subsystem at a time.",
  },
];

export type GlanceItem = { label: string; value: string };

export const atAGlance: GlanceItem[] = [
  { label: "Duration", value: "12 Weeks" },
  { label: "Core Contact Hours", value: "120 Hours" },
  { label: "Recommended Project / Architecture Work", value: "40–80 Hours" },
  { label: "Total Learning Effort", value: "160–200 Hours" },
  { label: "Delivery", value: "Engineering Lecture + Architecture Studio" },
  { label: "Primary Capstone", value: "6U Satellite Reference Mission" },
  { label: "Physical Engineering", value: "CubeSat Engineering Model / Flatsat" },
  { label: "Digital Engineering", value: "Satellite Digital Twin" },
  { label: "Formal Reviews", value: "SRR · PDR · CDR · Mission Readiness" },
];

export type ReadinessArea = { area: string; items: string[] };

export const readiness: ReadinessArea[] = [
  {
    area: "Mathematics",
    items: ["Linear algebra", "Vectors and matrices", "Differential equations", "Probability", "Numerical methods"],
  },
  { area: "Programming", items: ["Python", "NumPy", "SciPy", "Jupyter", "Git"] },
  {
    area: "Engineering",
    items: ["Electronics", "Mechanics", "Thermodynamics", "Signals", "Control systems", "Dimensional analysis"],
  },
  {
    area: "Space Fundamentals",
    items: ["Spacecraft terminology", "Coordinate frames", "Orbit fundamentals", "Satellite classes", "Mission lifecycle"],
  },
];

export type Spec = { label: string; value: string; detail?: string };

export const referenceMission: Spec[] = [
  { label: "Orbit", value: "500–550 km Sun-Synchronous Orbit" },
  { label: "Mission", value: "Earth Observation" },
  { label: "Payload", value: "Optical EO payload" },
  { label: "Design Life Target", value: "3 years" },
  {
    label: "Life Extension Trade",
    value: "Evaluate extension toward 5 years",
    detail: "Battery cycling · radiation · orbit decay · propulsion · reliability · degradation · commercial value",
  },
  { label: "Power", value: "Deployable solar arrays + Li-ion battery" },
  { label: "ADCS", value: "Three-axis stabilised, reaction wheels + magnetorquers" },
  { label: "TT&C", value: "S-band" },
  { label: "Payload Downlink", value: "X-band" },
  { label: "Computing", value: "Onboard flight computer + edge processing" },
  { label: "Safety", value: "FDIR + safe mode" },
  { label: "Sustainability", value: "Collision avoidance / end-of-life disposal strategy" },
];

export type Coupling = { from: string; to: string; statement: string };

export const couplings: Coupling[] = [
  { from: "ADCS", to: "Payload", statement: "ADCS decisions must support payload pointing accuracy, stability and agility." },
  { from: "Power", to: "Payload + Comms", statement: "Power must support payload imaging and communications passes — including in eclipse." },
  { from: "Thermal", to: "Battery + Avionics", statement: "Thermal design must hold battery and avionics within their operating limits." },
  { from: "Data", to: "Storage + Downlink", statement: "Data generation must match onboard storage and downlink capacity." },
  { from: "Launch + Orbit", to: "Mission", statement: "Launch and orbit choices drive lifetime, radiation dose, coverage and economics." },
];

export const fidelityStages = [
  { phase: "Phase I", weeks: "Weeks 1–3", level: "Concept baseline" },
  { phase: "Phase II", weeks: "Weeks 4–8", level: "Preliminary design" },
  { phase: "Phase III", weeks: "Weeks 9–10", level: "Verification-Ready Baseline" },
  { phase: "Phase IV", weeks: "Weeks 11–12", level: "Operational baseline" },
] as const;

export type MissionSegment = { name: string; elements: string };

export const missionSegments: MissionSegment[] = [
  { name: "Space Segment", elements: "Bus, subsystems, flight software, onboard autonomy" },
  { name: "Payload", elements: "Instrument, onboard processing, calibration" },
  { name: "Launch Segment", elements: "Launcher, deployer interface, orbit injection" },
  { name: "Ground Segment", elements: "Stations, network, TT&C and payload data reception" },
  { name: "Mission Operations", elements: "Planning, commanding, anomaly response, end of life" },
  { name: "Data / User Segment", elements: "Processing, data products, delivery to users" },
];

export const marginPolicy = {
  statement:
    "Architecture is not only about meeting nominal requirements; it is also about preserving quantified margin as the design matures.",
  tracked: [
    "Mass",
    "Power",
    "Energy",
    "Data",
    "Thermal uncertainty",
    "Processor load",
    "Link margin",
    "Propellant reserve",
    "Schedule reserve",
  ],
  reviewQuestion: "What margin remains, and what assumptions consume it?",
} as const;

export const adrExample = {
  id: "ADR-ADCS-004",
  title: "Three-wheel vs four-wheel reaction-wheel architecture",
  fields: [
    ["Question", "Must three-axis payload pointing survive a single reaction-wheel failure?"],
    ["Options considered", "Three orthogonal wheels with magnetorquer backup · four wheels in a pyramid configuration"],
    ["Evaluation criteria", "Pointing after a wheel failure, mass, power, volume, cost, momentum management"],
    ["Selected option", "Four-wheel pyramid"],
    ["Rationale", "Preserves imaging capability after a single wheel failure across the 3-year design life"],
    ["Assumptions", "Supplier wheel reliability data; volume available in the 6U layout"],
    ["Risks", "Power and volume margin consumption; wheel-speed zero crossings"],
    ["Revisit trigger", "Design life extended toward 5 years, or power margin falls below policy"],
  ] as [string, string][],
} as const;

export type DossierItem = string | { name: string; detail: string };
export type DossierGroup = { title: string; code: string; items: DossierItem[] };

export const dossier: DossierGroup[] = [
  {
    title: "Definition & Architecture",
    code: "DEF",
    items: [
      "Mission Definition",
      "Concept of Operations",
      "Mission Requirements",
      "System Requirements",
      "Subsystem Requirements",
      "Requirements Traceability Matrix",
      "Functional Architecture",
      "Physical Architecture",
      "Interface Architecture",
      "Interface Control Document",
    ],
  },
  {
    title: "Engineering Budgets",
    code: "BUD",
    items: [
      "Mass",
      "Power",
      "Energy",
      "Data",
      "Link",
      "Delta-V",
      "Thermal",
      { name: "Pointing", detail: "Accuracy · knowledge · stability · jitter" },
      { name: "Performance / Image Quality", detail: "Image-quality allocation · GSD-related dependencies" },
    ],
  },
  {
    title: "Engineering Governance",
    code: "GOV",
    items: [
      "Risk Register",
      "FMEA / FMECA",
      "Verification Matrix",
      "Technology Readiness",
      "Cost Model",
      "Schedule",
      "Make / Buy Decisions",
      "Configuration Baseline",
      "Engineering Margin Policy",
      "Architecture Decision Records",
    ],
  },
];

export type TopicGroup = { label?: string; note?: string; items: string[] };

export type Week = {
  number: number;
  title: string;
  focus: string;
  topics: TopicGroup[];
  decisionsLabel?: string;
  decisions?: string[];
  studio: string[];
  deliverables: string[];
  /** Formal review gates held during this week, in order. */
  milestones?: { code: string; name: string }[];
  /** A working checkpoint that is not a formal review gate. */
  checkpoint?: string;
  /** One architecture principle highlighted inside the week. */
  callout?: string;
  /** Additional structured block rendered after topics (e.g. a trade matrix or fault list). */
  feature?: { title: string; items: string[]; flow?: string[] };
  /** Render the feature in the side column to balance topic-heavy weeks. */
  featureInSide?: boolean;
};

export type Phase = {
  numeral: string;
  title: string;
  summary: string;
  weeks: Week[];
};

export const phases: Phase[] = [
  {
    numeral: "I",
    title: "Mission & Systems Architecture",
    summary: "Define the mission, the orbit and the pointing problem before a single subsystem is sized.",
    weeks: [
      {
        number: 1,
        title: "Space Mission Engineering",
        focus: "From stakeholder need to a mission that can be specified, reviewed and baselined.",
        topics: [
          {
            items: [
              "Global and Indian space ecosystem",
              "Mission objectives",
              "Stakeholders",
              "Concept of Operations (ConOps)",
              "Requirements engineering",
              "NASA / ECSS lifecycle concepts",
              "TRL / MRL",
              "MBSE",
              "SysML / Capella",
              "Digital engineering",
            ],
          },
        ],
        decisionsLabel: "Architecture decisions",
        decisions: [
          "What is the mission actually for, and who decides whether it succeeded?",
          "Which requirements are true constraints, and which are design choices in disguise?",
        ],
        studio: ["Stakeholder and ConOps workshop", "System context modelling in an MBSE tool"],
        deliverables: [
          "Mission Definition Document",
          "Concept of Operations",
          "Top-Level Requirements",
          "System Context Diagram",
        ],
        milestones: [{ code: "MCR", name: "Mission Concept Review" }],
      },
      {
        number: 2,
        title: "Orbital & Mission Architecture",
        focus: "Choose the orbit and launch strategy that the rest of the spacecraft must live with.",
        topics: [
          {
            items: [
              "Keplerian mechanics",
              "Coordinate frames",
              "Sun-synchronous orbits",
              "Perturbations",
              "Coverage",
              "Revisit time",
              "Ground tracks",
              "Manoeuvres",
              "Delta-V",
              "Launch vehicle interfaces",
              "Rideshare",
              "Constellation architecture",
            ],
          },
        ],
        decisionsLabel: "Architecture decisions",
        decisions: [
          "500 km or 600 km?",
          "SSO or inclined LEO?",
          "Single satellite or constellation?",
          "Dedicated launch or rideshare?",
        ],
        studio: ["Orbit propagation and coverage analysis", "Digital twin increment: Orbit Twin"],
        deliverables: [
          "Orbit trade study",
          "Coverage analysis",
          "Mission Delta-V budget",
          "Launcher comparison",
          "Orbital lifetime analysis",
        ],
      },
      {
        number: 3,
        title: "Attitude Determination & Control",
        focus: "Size the pointing system from what the payload needs — not from a catalogue.",
        topics: [
          {
            items: [
              "Attitude kinematics",
              "Quaternion mathematics",
              "Rigid-body dynamics",
              "Disturbance torques",
              "Sun sensors",
              "Magnetometers",
              "IMU / gyros",
              "Star trackers",
              "Reaction wheels",
              "Magnetorquers",
              "Estimation",
              "EKF / MEKF",
              "Control laws",
            ],
          },
        ],
        decisionsLabel: "Architecture questions",
        decisions: [
          "What pointing accuracy does the payload require?",
          "Is a star tracker required?",
          "How many reaction wheels?",
          "What redundancy is justified?",
        ],
        studio: ["Attitude dynamics and estimator simulation", "Digital twin increment: ADCS Twin"],
        deliverables: ["ADCS architecture and sizing", "Pointing budget", "System Requirements baseline"],
        milestones: [{ code: "SRR", name: "System Requirements Review" }],
      },
    ],
  },
  {
    numeral: "II",
    title: "Spacecraft Subsystem Architecture",
    summary: "Architect each subsystem against the shared mission baseline and keep every budget closed.",
    weeks: [
      {
        number: 4,
        title: "Electrical Power, Solar & Battery Systems",
        focus: "Close the energy balance across orbit, eclipse, degradation and end of life.",
        topics: [
          {
            label: "Solar",
            items: ["Silicon", "GaAs", "Multi-junction", "Radiation degradation", "BOL / EOL", "Deployable arrays", "MPPT"],
          },
          {
            label: "Battery",
            items: [
              "Li-ion chemistry",
              "Cell selection",
              "Series / parallel design",
              "Depth of discharge",
              "Cycle life",
              "SOC",
              "SOH",
              "Balancing",
              "Ageing",
              "Thermal effects",
              "Safety",
            ],
          },
          {
            label: "EPS",
            items: [
              "Regulated / unregulated bus",
              "DC/DC conversion",
              "PCDU",
              "Protection",
              "Grounding",
              "Fault isolation",
              "Safe mode",
            ],
          },
        ],
        studio: ["Orbit-average power and eclipse energy analysis", "Digital twin increment: Energy Twin"],
        deliverables: [
          "Power budget",
          "Energy budget",
          "Solar array sizing",
          "Battery sizing",
          "EPS architecture",
          "Degradation model",
        ],
      },
      {
        number: 5,
        title: "Structures, Mechanisms, Thermal & Configuration",
        focus: "Survive launch, deploy reliably and hold every unit inside its thermal limits.",
        topics: [
          {
            label: "Structures & mechanisms",
            items: [
              "Primary / secondary structures",
              "Launch loads",
              "Modal analysis",
              "Random vibration",
              "Shock",
              "Materials",
              "Composites",
              "Deployment mechanisms",
              "Release systems",
            ],
          },
          {
            label: "Thermal",
            items: ["Radiation / conduction", "Albedo", "Earth IR", "MLI", "Heaters", "Hot and cold thermal cases"],
          },
          {
            label: "Configuration",
            items: ["Mass properties", "Centre of gravity", "Inertia", "Configuration control"],
          },
        ],
        studio: ["Configuration layout and mass properties", "Digital twin increment: Thermal Twin"],
        deliverables: [
          "Mechanical architecture",
          "Preliminary CAD",
          "Modal model",
          "Thermal model",
          "Mechanism risk analysis",
        ],
      },
      {
        number: 6,
        title: "Propulsion, Mobility & Space Sustainability",
        focus: "Decide whether the mission needs propulsion — and how it will leave orbit responsibly.",
        topics: [
          {
            items: [
              "Chemical propulsion",
              "Cold gas",
              "Green propulsion",
              "Electric propulsion",
              "Hall thrusters",
              "Ion propulsion",
              "Propellant storage",
              "Valves",
              "Orbit maintenance",
              "Collision avoidance",
              "Deorbit",
              "Debris mitigation",
            ],
          },
        ],
        feature: {
          title: "Architecture trade · evaluated on mass, power, cost, complexity, lifetime, collision avoidance and disposal",
          items: ["No propulsion", "Cold gas", "Green monopropellant", "Electric propulsion"],
        },
        studio: ["Propulsion trade study", "Orbital lifetime and disposal analysis"],
        deliverables: ["Propulsion trade study", "Updated Delta-V budget", "End-of-life disposal plan"],
      },
      {
        number: 7,
        title: "RF, Communications & Ground Segment",
        focus: "Close every link and decide how the mission reaches the ground — and how quickly.",
        topics: [
          {
            items: [
              "RF fundamentals",
              "UHF / VHF / S / X / Ka bands",
              "Link budgets",
              "Antennas",
              "Modulation",
              "Coding",
              "Software-defined radio",
              "CCSDS",
              "Spectrum",
              "Ground stations",
              "Ground Station as a Service",
              "Mission control",
            ],
          },
        ],
        decisionsLabel: "Architecture questions",
        decisions: [
          "S-band or UHF for TT&C?",
          "X-band or Ka-band for payload downlink?",
          "Own ground station or GSaaS?",
          "What latency does the mission require?",
        ],
        callout:
          "Regulatory feasibility is an input to communications architecture, not post-design paperwork. Spectrum and frequency constraints shape band selection, antenna architecture, link design, the ground segment and the licensing timeline.",
        studio: ["Link budget and contact analysis", "Digital twin increment: Communications Twin"],
        deliverables: ["Link budget", "Data budget", "Ground segment architecture"],
        milestones: [{ code: "PDR", name: "Preliminary Design Review" }],
      },
      {
        number: 8,
        title: "Avionics, Flight Software, Autonomy & Cybersecurity",
        focus: "Architect the spacecraft’s nervous system so it can survive faults and hostile commands.",
        topics: [
          {
            label: "Hardware",
            items: ["OBC", "MCU / FPGA / SoC", "COTS vs rad-hard", "Redundancy", "EDAC", "Watchdog"],
          },
          { label: "Interfaces", items: ["I2C", "SPI", "CAN", "RS-422", "SpaceWire"] },
          {
            label: "Software",
            items: [
              "RTOS",
              "NASA cFS concepts",
              "JPL F Prime concepts",
              "State machines",
              "Telemetry / telecommand",
              "Bootloaders",
              "Software update",
            ],
          },
          {
            label: "Software assurance",
            items: [
              "Coding standards",
              "Static analysis",
              "Unit testing",
              "Integration testing",
              "Requirements-to-code traceability",
              "Fault containment",
              "Software configuration management",
              "Independent verification concepts",
            ],
          },
          { label: "Autonomy", items: ["FDIR", "Onboard AI", "Edge processing", "Autonomous recovery"] },
          {
            label: "Cybersecurity",
            items: [
              "Secure boot",
              "Command authentication",
              "Encryption",
              "Key management",
              "Signed software",
              "Secure updates",
              "Ground-to-space attack surface",
              "Intrusion detection",
            ],
          },
        ],
        studio: ["Flight-state machine and FDIR design", "Digital twin increment: Avionics / Flight-State Model"],
        deliverables: ["Avionics architecture", "Flight software architecture", "FDIR concept", "Cybersecurity threat model"],
      },
    ],
  },
  {
    numeral: "III",
    title: "Payload, Verification & Qualification Planning",
    summary: "Put the payload at the centre of the architecture, then prove the design can be built and trusted.",
    weeks: [
      {
        number: 9,
        title: "Payload Engineering",
        focus: "Payload-driven architecture: derive platform requirements from what the instrument must deliver.",
        topics: [
          {
            label: "Payload classes",
            items: [
              "Optical Earth observation",
              "SAR",
              "Hyperspectral",
              "Communications payloads",
              "Navigation and science payload concepts",
            ],
          },
          { label: "Optical EO", items: ["GSD", "Swath", "MTF", "SNR", "Detector", "Optics"] },
        ],
        decisionsLabel: "Key architecture question",
        decisions: ["Does the spacecraft exist to support the payload, or has the payload been forced to fit the spacecraft?"],
        studio: ["Payload performance model", "Digital twin increment: Payload Model"],
        deliverables: ["Payload-to-platform requirements", "Performance / image-quality budget", "Updated data budget"],
      },
      {
        number: 10,
        title: "AIT, Reliability & Failure Engineering",
        focus: "Verify the engineering model, prepare the CDR baseline — and learn how the spacecraft fails.",
        topics: [
          {
            label: "AIT",
            items: ["Assembly", "Integration", "Cleanroom", "ESD", "Contamination", "Harness", "GSE"],
          },
          {
            label: "Testing",
            items: [
              "Functional",
              "Vibration",
              "Shock",
              "TVAC",
              "EMC",
              "Thermal balance",
              "Magnetic cleanliness",
            ],
          },
          {
            label: "Reliability",
            items: [
              "FMEA",
              "FMECA",
              "Fault tree analysis",
              "Reliability block diagrams",
              "Redundancy",
              "Single-point failures",
            ],
          },
          {
            label: "Failure classification",
            items: [
              "Requirement failure",
              "Design failure",
              "Interface failure",
              "Manufacturing failure",
              "Software failure",
              "Test escape",
              "Operational error",
            ],
          },
          {
            label: "EEE parts engineering",
            items: [
              "COTS vs space-grade parts",
              "Derating",
              "Radiation tolerance",
              "Lot traceability",
              "Screening",
              "Counterfeit avoidance",
              "Obsolescence",
              "Parts control",
              "Supplier qualification concepts",
            ],
          },
          {
            label: "Product assurance & quality engineering",
            note: "Technical leadership must understand how design intent is preserved through manufacturing, integration, test and acceptance.",
            items: [
              "Nonconformance / NCR",
              "Material Review Board (MRB)",
              "Deviation / waiver",
              "Workmanship",
              "Inspection",
              "Calibration",
              "Cleanliness",
              "Traceability",
              "Supplier quality",
              "Configuration audit",
              "Acceptance records",
            ],
          },
        ],
        feature: {
          title: "Fault Injection Laboratory",
          items: [
            "Reaction wheel failure",
            "Battery degradation",
            "GNSS loss",
            "Sensor bias",
            "Thermal sensor failure",
            "Solar-array underperformance",
            "Processor reset",
            "Communication loss",
            "Invalid command",
            "Cyber intrusion attempt",
          ],
          flow: ["Detect", "Isolate", "Recover", "Analyse", "Correct"],
        },
        featureInSide: true,
        studio: [
          "Engineering-model verification campaign on the flatsat",
          "Fault injection and model correlation",
          "Digital twin increment: Fault Injection",
        ],
        deliverables: ["Reliability / FMEA package", "Verification & Validation Matrix", "Test plan", "EEE parts and derating approach"],
        checkpoint: "Engineering-model verification campaign + CDR preparation",
      },
    ],
  },
  {
    numeral: "IV",
    title: "Operations, Leadership & Architecture",
    summary: "Operate the mission, own the risk and defend the architecture before a review panel.",
    weeks: [
      {
        number: 11,
        title: "Mission Operations, Regulation & Economics",
        focus: "Connect the engineering baseline to operations, licensing, cost and organisational decisions.",
        topics: [
          {
            label: "Mission operations",
            items: ["LEOP", "Commissioning", "Nominal operations", "Safe mode", "Anomaly handling", "End of life", "Fleet operations"],
          },
          {
            label: "Regulation",
            items: ["IN-SPACe", "ITU", "WPC / DoT", "Spectrum", "Export controls", "Space law", "Liability", "Licensing"],
          },
          {
            label: "Economics",
            items: [
              "Satellite cost",
              "Launch cost",
              "Insurance",
              "Ground operations",
              "Constellation economics",
              "Unit economics",
            ],
          },
          {
            label: "Leadership",
            items: [
              "Supplier strategy",
              "Make / buy / partner",
              "Engineering governance",
              "Decision authority",
              "Technical risk ownership",
            ],
          },
        ],
        studio: ["Operations procedures and anomaly handling", "Digital twin increment: Telemetry-Driven Operational Model"],
        deliverables: ["Mission Operations Concept", "Cost & risk model", "Regulatory and spectrum plan"],
      },
      {
        number: 12,
        title: "Chief Architect Studio",
        focus: "Integrate every decision into one architecture and defend it under external-style review.",
        topics: [
          {
            label: "Architecture trade studies",
            items: ["Orbit", "Payload", "ADCS", "EPS", "Communication", "Propulsion", "Computing", "Ground architecture", "Launch"],
          },
          { label: "Technology roadmapping", items: ["Present", "3 years", "5 years", "10 years"] },
        ],
        feature: {
          title: "Mission Operations Simulation",
          items: [],
          flow: [
            "Launch",
            "Deployment",
            "Boot",
            "Detumble",
            "Communication",
            "Commissioning",
            "Payload activation",
            "Anomaly",
            "Safe mode",
            "Recovery",
          ],
        },
        decisionsLabel: "Final Spacecraft Architecture Defense",
        decisions: [
          "Why this orbit?",
          "Why 6U?",
          "Why this battery?",
          "What happens if a reaction wheel fails?",
          "What is the end-of-life power margin?",
          "What is the largest remaining technical risk?",
          "Why build instead of buy?",
          "How is the mission safely deorbited?",
        ],
        studio: [
          "Architecture trade studies",
          "Technology roadmapping",
          "Critical Design Review — external-review style panel",
          "Test Readiness Review — formal test baseline against the CDR design",
          "Mission operations simulation and Operational Readiness Review",
          "Final spacecraft architecture defense — Mission Readiness Review",
        ],
        deliverables: ["Spacecraft Architecture Dossier", "CDR package", "Architecture defense"],
        milestones: [
          { code: "CDR", name: "Critical Design Review" },
          { code: "TRR", name: "Test Readiness Review" },
          { code: "ORR", name: "Operational Readiness Review" },
          { code: "MRR", name: "Mission Readiness Review" },
        ],
      },
    ],
  },
];

export const twinProgression = [
  { week: 2, name: "Orbit Twin", detail: "Propagation, eclipse and ground contacts" },
  { week: 3, name: "ADCS Twin", detail: "Attitude dynamics, sensors and control" },
  { week: 4, name: "Energy Twin", detail: "Solar input, battery state of charge, loads" },
  { week: 5, name: "Thermal Twin", detail: "Hot and cold cases, heater control" },
  { week: 7, name: "Communications Twin", detail: "Link margin and contact windows" },
  { week: 8, name: "Avionics / Flight-State Model", detail: "Modes, commands and FDIR states" },
  { week: 9, name: "Payload Model", detail: "Imaging demand, data volume, pointing" },
  { week: 10, name: "Fault Injection", detail: "Injected faults and recovery response" },
  { week: 11, name: "Telemetry-Driven Operational Model", detail: "Operations driven by live telemetry" },
] as const;

export const twinLoop = ["Physical Flatsat", "Telemetry", "Satellite Digital Twin", "Mission Control"] as const;

export type FlatsatGroup = { bus: string; items: string[] };

export const flatsat: FlatsatGroup[] = [
  { bus: "Command & Data Handling", items: ["OBC"] },
  { bus: "Power", items: ["EPS", "Battery / battery emulator", "Solar-array emulator"] },
  { bus: "Attitude & Navigation", items: ["Reaction wheel", "Magnetometer", "IMU", "GNSS"] },
  { bus: "Communications", items: ["Radio", "Antenna"] },
  { bus: "Payload", items: ["Payload emulator"] },
  { bus: "Thermal", items: ["Thermal sensors"] },
];

export const flatsatBus = "CAN / I2C / SPI interfaces";

export type ReviewGate = { code: string; name: string; when: string; purpose: string };

// Formal gates in lifecycle order. Engineering-model testing happens throughout
// the course; the formal TRR follows the CDR design baseline.
export const reviewGates: ReviewGate[] = [
  { code: "MCR", name: "Mission Concept Review", when: "Week 1", purpose: "Is the mission need clear and the concept feasible?" },
  { code: "SRR", name: "System Requirements Review", when: "Week 3", purpose: "Are the requirements complete, verifiable and traceable?" },
  { code: "PDR", name: "Preliminary Design Review", when: "Week 7", purpose: "Does the preliminary architecture close with margin?" },
  { code: "CDR", name: "Critical Design Review", when: "Week 12", purpose: "Is the detailed design mature enough to build and verify?" },
  { code: "TRR", name: "Test Readiness Review", when: "Week 12", purpose: "Are the test article, procedures and facilities ready to verify the CDR baseline?" },
  { code: "ORR", name: "Operational Readiness Review", when: "Week 12", purpose: "Can the team operate the mission and handle anomalies?" },
  { code: "MRR", name: "Mission Readiness Review", when: "Week 12", purpose: "Is the complete mission system ready, and can its architecture be defended?" },
];

export const GATE_ORDER = ["MCR", "SRR", "PDR", "CDR", "TRR", "ORR", "MRR"] as const;

export const outcomes = [
  "Translate mission needs into spacecraft-level requirements.",
  "Develop a Concept of Operations.",
  "Perform first-order mission and orbital analysis.",
  "Develop spacecraft system and subsystem architecture.",
  "Maintain mass, power, energy, data, link and Delta-V budgets.",
  "Perform subsystem-level trade studies.",
  "Develop ADCS, EPS, communications, avionics, thermal and structural architecture.",
  "Define payload-to-platform requirements.",
  "Develop interface control documentation.",
  "Create reliability and FMEA/FMECA artefacts.",
  "Plan verification, qualification and acceptance campaigns.",
  "Prepare for and participate in SRR, PDR and CDR.",
  "Operate a CubeSat-class engineering model / mission simulation.",
  "Use a satellite digital twin for engineering and operational analysis.",
  "Evaluate cost, risk, supplier and make/buy decisions.",
  "Defend spacecraft architecture before a technical review panel.",
] as const;

export type Deliverable = { n: number; name: string };
export type DeliverableCategory = { category: string; items: Deliverable[] };

export const portfolio: DeliverableCategory[] = [
  {
    category: "Mission",
    items: [
      { n: 1, name: "Mission Definition Document" },
      { n: 2, name: "Concept of Operations" },
      { n: 3, name: "Requirements Specification" },
    ],
  },
  {
    category: "Architecture",
    items: [
      { n: 4, name: "Spacecraft Architecture" },
      { n: 5, name: "Interface Control Document" },
    ],
  },
  {
    category: "Analysis",
    items: [
      { n: 6, name: "Mass Budget" },
      { n: 7, name: "Power & Energy Budget" },
      { n: 8, name: "Link Budget" },
      { n: 9, name: "Data Budget" },
      { n: 10, name: "Delta-V Budget" },
      { n: 11, name: "Thermal Analysis" },
      { n: 12, name: "ADCS Model" },
    ],
  },
  {
    category: "Verification",
    items: [
      { n: 13, name: "Reliability / FMEA Package" },
      { n: 14, name: "Verification & Validation Matrix" },
      { n: 15, name: "Test Plan" },
      { n: 16, name: "Flatsat Demonstrator" },
    ],
  },
  {
    category: "Operations",
    items: [
      { n: 17, name: "Satellite Digital Twin" },
      { n: 18, name: "Mission Operations Concept" },
    ],
  },
  {
    category: "Leadership",
    items: [
      { n: 19, name: "Cost & Risk Model" },
      { n: 20, name: "Spacecraft Architecture Dossier" },
    ],
  },
];

export type CareerCategory = { title: string; note?: string; roles: string[]; wide?: boolean };

export const careers: CareerCategory[] = [
  {
    title: "Spacecraft & Satellite Systems",
    roles: [
      "Spacecraft Systems Engineer",
      "Satellite Systems Engineer",
      "Space Mission Systems Engineer",
      "Spacecraft Systems Architect",
      "Satellite Systems Architect",
      "Mission Architect",
      "Space Systems Technical Lead",
      "Spacecraft Technical Program Lead",
      "Spacecraft Chief Engineer",
    ],
  },
  {
    title: "Advanced / Leadership Pathways",
    note: "For experienced engineers, relevant progression pathways can include the roles below. Course completion alone does not confer senior titles such as CTO, Chief Architect or Director.",
    roles: [
      "Principal Space Systems Engineer",
      "Lead Systems Engineer",
      "Systems Engineering Manager",
      "Spacecraft Architecture Lead",
      "Chief Systems Engineer",
      "Chief Architect",
      "Director — Space Systems Engineering",
      "Director — Satellite Engineering",
      "CTO — Space / Satellite Technology",
    ],
  },
  {
    title: "Specialist Technical Roles",
    wide: true,
    roles: [
      "ADCS / GNC Engineer",
      "Orbital Mechanics Engineer",
      "Mission Analysis Engineer",
      "Spacecraft Power Systems Engineer",
      "Battery Systems Engineer",
      "Thermal Engineer",
      "Spacecraft Structural Engineer",
      "Propulsion Systems Engineer",
      "RF / Satellite Communications Engineer",
      "Ground Segment Engineer",
      "Avionics Engineer",
      "Flight Software Engineer",
      "Embedded Systems Engineer",
      "Payload Systems Engineer",
      "AIT Engineer",
      "Environmental Test Engineer",
      "Reliability Engineer",
      "Spacecraft Quality Engineer",
      "Space Cybersecurity Engineer",
      "Satellite Digital Twin Engineer",
      "Mission Operations Engineer",
      "Satellite Operations Engineer",
    ],
  },
  {
    title: "Research & R&D",
    roles: [
      "Satellite Systems Researcher",
      "Spacecraft Digital Twin Researcher",
      "ADCS Research Engineer",
      "Space Power & Battery Researcher",
      "Autonomous Space Systems Researcher",
      "Space Cybersecurity Researcher",
      "Space Communications Researcher",
      "Onboard AI Research Engineer",
      "ISAM / Space Robotics Researcher",
    ],
  },
  {
    title: "Technology & Business",
    roles: [
      "Space Technology Consultant",
      "Space Systems Consultant",
      "Technical Product Manager — Space",
      "Satellite Product Architect",
      "Space Program Manager",
      "Technology Strategy Lead",
      "Space Startup CTO",
      "Deep-Tech Founder",
      "Space Business Architecture Lead",
      "Technical Due-Diligence Consultant",
    ],
  },
];

export type Pillar = { title: string; body: string };

export const pillars: Pillar[] = [
  { title: "One spacecraft for the entire course", body: "No disconnected modules. Every week modifies the same reference mission." },
  { title: "First principles + architecture", body: "Calculate and understand before making system decisions." },
  { title: "Physical + digital", body: "A CubeSat-class flatsat and a satellite digital twin, developed side by side." },
  { title: "Formal engineering reviews", body: "SRR → PDR → CDR → Mission Readiness, run as review gates rather than exams." },
  { title: "Failure engineering", body: "Detect, isolate, recover and learn from injected faults." },
  { title: "Mission operations", body: "Operate the mission architecture, not only design it." },
  { title: "Engineering leadership", body: "Connect technical choices to cost, schedule, supply chain and risk." },
];

export const learningModel = ["Calculate", "Simulate", "Build", "Test", "Fail", "Diagnose", "Improve", "Defend"] as const;

export const batteryExample = [
  "Calculate eclipse requirement",
  "Simulate cycling",
  "Validate power architecture",
  "Inject degraded capacity",
  "Estimate SOC / SOH",
  "Diagnose impact",
  "Revise engineering margin",
] as const;

export type ToolCategory = { category: string; tools: string[] };

export const tools: ToolCategory[] = [
  { category: "Mission / Orbit", tools: ["GMAT", "Orekit", "Python / Skyfield"] },
  { category: "ADCS", tools: ["Basilisk", "NASA 42"] },
  { category: "Flight Software", tools: ["NASA cFS", "JPL F Prime", "FreeRTOS / Zephyr"] },
  { category: "MBSE", tools: ["Capella", "SysML concepts"] },
  {
    category: "CAD / Analysis",
    tools: ["FreeCAD / SolidWorks / NX concepts", "Ansys / Nastran concepts", "KiCad"],
  },
  { category: "RF", tools: ["GNU Radio", "SatNOGS"] },
  { category: "Data / AI", tools: ["Python", "PyTorch", "Earth observation datasets"] },
];

export type Reference = { name: string; context: string; href?: string };

// Only links already used elsewhere on the site or official root domains.
export const references: Reference[] = [
  {
    name: "NASA Systems Engineering Handbook",
    context: "Systems engineering processes, technical management and lifecycle practice.",
    href: "https://www.nasa.gov/reference/systems-engineering-handbook/",
  },
  {
    name: "NASA lifecycle and design reviews",
    context: "Phase-gated project lifecycle and the MCR → SRR → PDR → CDR review sequence.",
  },
  {
    name: "ECSS systems engineering concepts",
    context: "European Cooperation for Space Standardization engineering and verification framework.",
    href: "https://ecss.nl/",
  },
  {
    name: "CCSDS",
    context: "Consultative Committee for Space Data Systems recommendations for space data and communications.",
    href: "https://ccsds.org/",
  },
  {
    name: "CubeSat Design Specification",
    context: "Form-factor, interface and testing conventions for CubeSat-class spacecraft.",
    href: "https://www.cubesat.org/cubesatinfo",
  },
  {
    name: "Spacecraft environmental qualification concepts",
    context: "Launch, vibration, thermal-vacuum and EMC qualification and acceptance practice.",
  },
  {
    name: "IN-SPACe / Indian Space Policy context",
    context: "Authorisation and policy context for non-governmental space activities in India.",
    href: "https://www.inspace.gov.in/",
  },
];

export const credential = {
  primary: "Advanced Certificate in Satellite Engineering",
  track: "Architecture & Leadership Track",
  program: "Satellite Engineering: From First Principles to Spacecraft Systems Architect",
  capstone: "Spacecraft Systems Architecture Capstone",
  capstoneStatus: "Successfully Completed",
} as const;

export const COURSE_NAME = "Satellite Engineering: From First Principles to Spacecraft Systems Architect";
export const COURSE_DESCRIPTION =
  "Advanced Architecture & Leadership Track covering mission engineering, spacecraft systems architecture, satellite digital twins, subsystem engineering, verification, operations and technical leadership.";

export const teaches = [
  "Space Mission Engineering",
  "Spacecraft Systems Architecture",
  "Orbital Mechanics",
  "Attitude Determination and Control (ADCS)",
  "Electrical Power Systems",
  "Spacecraft Thermal Engineering",
  "Satellite Communications",
  "Flight Software",
  "Spacecraft Cybersecurity",
  "Assembly, Integration and Test (AIT)",
  "Reliability Engineering",
  "Satellite Digital Twins",
  "Mission Operations",
  "Mission System-of-Systems Architecture",
  "Engineering Margin Management",
  "Architecture Decision Records",
  "Software Assurance",
  "EEE Parts Engineering",
  "Product Assurance and Quality Engineering",
  "Space Systems Leadership",
];

export const LAST_REVIEWED = "2026-09-29";
export const LAST_REVIEWED_LABEL = "29 September 2026";
