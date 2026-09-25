// "Design a Microgravity Experiment" — educational design assistance only.
// This is not flight qualification, a safety review or a proposal template
// for any agency programme.

export type ExperimentDomain = "biology" | "human-physiology" | "materials" | "fluids" | "combustion" | "pharma" | "manufacturing" | "radiation";

export const EXPERIMENT_DOMAINS: Record<ExperimentDomain, { label: string; measure: string[]; control: string; question: string }> = {
  biology: { label: "Biology (cells, microbes, plants)", measure: ["growth rate", "gene expression (after return)", "morphology imaging"], control: "Identical culture on the ground, ideally also in a centrifuge at 1 g in orbit", question: "How does the absence of sedimentation and convection change growth and gene expression?" },
  "human-physiology": { label: "Human physiology", measure: ["pre-/in-/post-flight measures", "biomarkers", "performance tests"], control: "Each crew member's own pre-flight baseline, plus ground analogue studies such as head-down bed rest", question: "How quickly does the body adapt to weightlessness, and which countermeasures work?" },
  materials: { label: "Materials science", measure: ["microstructure (post-flight)", "temperature history", "solidification front imaging"], control: "Same furnace profile on the ground", question: "How does removing buoyancy-driven convection change microstructure during solidification?" },
  fluids: { label: "Fluid physics", measure: ["high-speed imaging", "interface shape", "pressure and temperature"], control: "Ground run plus drop-tower or parabolic-flight comparison", question: "How do surface tension and wetting control fluid position when gravity is absent?" },
  combustion: { label: "Combustion", measure: ["flame shape and spread rate", "radiant emission", "soot and products"], control: "Matched ground burn at identical pressure and oxygen concentration", question: "How do flames behave when buoyant convection no longer feeds them oxygen?" },
  pharma: { label: "Pharmaceuticals / protein crystallisation", measure: ["crystal size and quality", "diffraction resolution (post-flight)", "yield"], control: "Parallel crystallisation on the ground from the same batch", question: "Does diffusion-dominated transport produce larger, better-ordered crystals?" },
  manufacturing: { label: "In-space manufacturing", measure: ["product properties (post-flight)", "process parameters", "defect rate"], control: "Same process on the ground; compare yield and defects", question: "Which products gain enough quality from microgravity to justify manufacturing in orbit?" },
  radiation: { label: "Radiation", measure: ["absorbed dose", "particle spectra", "biological or electronic effects"], control: "Shielded sample in the same location, and ground irradiation where possible", question: "How does the mixed orbital radiation field affect this material, device or organism over time?" },
};

export const LIFECYCLE_STAGES = [
  { stage: "Concept", note: "Question, hypothesis and why microgravity is essential." },
  { stage: "Laboratory prototype", note: "Demonstrate feasibility on the bench with your own resources." },
  { stage: "Ground validation", note: "Ground controls and, where useful, drop towers, parabolic flights or clinostats." },
  { stage: "Safety review", note: "Hazards, containment and crew interaction reviewed by the platform provider." },
  { stage: "Flight qualification", note: "Hardware tested for launch loads, vacuum, thermal, EMC and safety requirements." },
  { stage: "Integration", note: "Experiment integrated with the host platform's power, data and thermal interfaces." },
  { stage: "Operations", note: "Execute on orbit with crew or automated control; monitor and adapt." },
  { stage: "Data analysis", note: "Compare flight and ground data; publish results and data." },
];

export interface ExperimentInput {
  domain: ExperimentDomain;
  durationDays: number;
  crewInteraction: "none" | "low" | "high";
  powerW: number;
  massKg: number;
  volumeL: number;
  dataGBPerDay: number;
  temperature: "ambient" | "controlled" | "cold" | "hot";
  containment: "none" | "single" | "multiple";
  sampleReturn: boolean;
  externalExposure: boolean;
}

export const EXPERIMENT_DEFAULTS: ExperimentInput = {
  domain: "biology",
  durationDays: 14,
  crewInteraction: "low",
  powerW: 60,
  massKg: 8,
  volumeL: 20,
  dataGBPerDay: 1,
  temperature: "controlled",
  containment: "multiple",
  sampleReturn: true,
  externalExposure: false,
};

export interface ExperimentPlan {
  summary: string;
  resources: string[];
  controls: string[];
  measurements: string[];
  safety: string[];
  dataPlan: string[];
  earthControl: string;
  questions: string[];
  platformClass: string;
}

export function planExperiment(e: ExperimentInput): ExperimentPlan {
  const d = EXPERIMENT_DOMAINS[e.domain];
  const size = e.massKg <= 5 && e.volumeL <= 10 ? "small, locker-scale" : e.massKg <= 50 && e.volumeL <= 150 ? "mid-deck or drawer-scale" : "rack-scale";
  const platformClass = e.externalExposure
    ? "External payload site (exposed to vacuum, radiation, atomic oxygen and thermal cycling)"
    : e.durationDays <= 0.01
      ? "Short-duration platform (drop tower or parabolic flight) may be enough"
      : `Pressurised laboratory, ${size} payload`;

  const resources = [
    `Power: ~${e.powerW} W continuous${e.powerW > 500 ? " — a significant share of a laboratory rack allocation" : ""}.`,
    `Mass / volume: ${e.massKg} kg, ${e.volumeL} L (${size}).`,
    `Crew time: ${e.crewInteraction === "none" ? "automated after installation" : e.crewInteraction === "low" ? "installation, periodic checks and sample handling" : "frequent hands-on operations — crew time is often the scarcest resource"}.`,
    `Data: ~${e.dataGBPerDay} GB/day downlink${e.dataGBPerDay > 20 ? " — may need onboard storage and prioritised downlink" : ""}.`,
    `Thermal: ${{ ambient: "cabin ambient", controlled: "active temperature control within the payload", cold: "refrigerated or frozen stowage", hot: "furnace or heater — heat must be rejected to the station cooling loop" }[e.temperature]}.`,
    ...(e.sampleReturn ? ["Sample return: return-vehicle capacity, and cold stowage if samples are perishable."] : []),
  ];

  const safety = [
    e.containment === "none"
      ? "No containment selected — only acceptable for inert, non-hazardous materials; the provider's safety review decides."
      : e.containment === "single"
        ? "Single containment — suitable only for low-hazard materials; hazardous fluids typically require more levels."
        : "Multiple levels of containment for fluids, biological or chemical hazards.",
    "Touch temperatures, sharp edges, pressure systems and electrical hazards assessed.",
    "Materials checked for flammability and off-gassing into the closed cabin atmosphere.",
    ...(e.domain === "combustion" ? ["Burns only inside a dedicated sealed chamber with its own exhaust and fire-safety controls."] : []),
    ...(e.externalExposure ? ["Hardware must survive and not release debris in the external environment."] : []),
  ];

  return {
    summary: `A ${d.label.toLowerCase()} experiment lasting ${e.durationDays} day(s) that asks: ${d.question}`,
    resources,
    controls: [
      d.control,
      "Identical hardware, sample batches and timelines for flight and ground groups.",
      "Record launch, storage and return conditions — they are confounders.",
    ],
    measurements: d.measure,
    safety,
    dataPlan: [
      "Define measurements, units, sampling rate and time-stamps before flight.",
      "Store raw data on board; downlink prioritised subsets.",
      "Log environmental conditions (temperature, vibration, radiation dose) alongside results.",
      "Plan post-flight analysis and data archiving in an open, reusable format.",
    ],
    earthControl: d.control,
    questions: [
      d.question,
      `Which variable changes most between 1 g and microgravity after ${e.durationDays} day(s)?`,
      "How sensitive is the result to launch and return conditions rather than microgravity itself?",
    ],
    platformClass,
  };
}
