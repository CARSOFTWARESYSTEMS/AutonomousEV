// Template-based research-question generator. Output is a structured
// starting point for a student or researcher — it contains no citations,
// only pointers to authoritative search entry points.

export const DISCIPLINES = ["Life support", "Power systems", "Thermal control", "Autonomy & AI", "Robotics", "Human physiology", "Materials", "Fluid physics", "Cybersecurity", "Structures"] as const;
export const SUBSYSTEMS = ["ECLSS", "Electrical power", "Thermal control", "GNC", "Communications", "Avionics", "Docking", "Robotics", "Crew systems", "Payloads"] as const;
export const ENVIRONMENTS = ["Low Earth orbit", "Lunar orbit", "Lunar surface", "Ground analogue"] as const;
export const TRLS = ["TRL 1–3 (concept)", "TRL 4–5 (lab / relevant environment)", "TRL 6–7 (prototype demo)"] as const;
export const LEVELS = ["Undergraduate", "Masters", "PhD", "Postdoctoral", "Industry R&D"] as const;

export type QuestionInput = {
  discipline: (typeof DISCIPLINES)[number];
  subsystem: (typeof SUBSYSTEMS)[number];
  environment: (typeof ENVIRONMENTS)[number];
  trl: (typeof TRLS)[number];
  level: (typeof LEVELS)[number];
};

export interface GeneratedQuestion {
  problem: string;
  hypothesis: string;
  variables: { independent: string; dependent: string; controlled: string };
  simulation: string;
  experiment: string;
  data: string;
  validation: string;
  contribution: string;
  resources: { label: string; href: string }[];
}

const ENV_DRIVER: Record<QuestionInput["environment"], string> = {
  "Low Earth orbit": "frequent eclipse cycles, atmospheric drag and near-continuous ground contact",
  "Lunar orbit": "long communication delays, deep-space radiation and infrequent resupply",
  "Lunar surface": "one-sixth gravity, abrasive dust, long lunar nights and extreme temperature swings",
  "Ground analogue": "an Earth-based analogue that reproduces isolation, confinement or operational constraints",
};

const SCOPE: Record<QuestionInput["level"], { scope: string; method: string; contribution: string }> = {
  Undergraduate: { scope: "a bounded, well-defined", method: "a spreadsheet or Python model plus a literature review", contribution: "a reproducible model and a clear explanation of trade-offs" },
  Masters: { scope: "a focused", method: "a validated simulation and a small bench experiment", contribution: "a validated model and a design recommendation" },
  PhD: { scope: "an open", method: "new models or methods, bench and relevant-environment experiments", contribution: "a new method or insight that advances the state of the art" },
  Postdoctoral: { scope: "a program-level", method: "a research programme combining modelling, experiments and flight-opportunity planning", contribution: "a validated capability ready for flight-experiment proposals" },
  "Industry R&D": { scope: "a product-relevant", method: "requirements-driven prototyping, test and verification", contribution: "a technology raised by at least one TRL with verification evidence" },
};

export function generateQuestion(q: QuestionInput): GeneratedQuestion {
  const s = SCOPE[q.level];
  const env = ENV_DRIVER[q.environment];
  const topic = `${q.discipline.toLowerCase()} for the ${q.subsystem} subsystem`;
  const search = encodeURIComponent(`${q.discipline} ${q.subsystem} space station`);
  return {
    problem: `How can ${topic} be made more reliable and resource-efficient under ${env}? This is ${s.scope} problem at ${q.trl}.`,
    hypothesis: `If ${q.discipline.toLowerCase()} methods are adapted to the ${q.subsystem} subsystem's constraints in ${q.environment.toLowerCase()}, then a measurable improvement in performance or margin can be achieved without increasing crew time, mass or power.`,
    variables: {
      independent: `Design or operating parameters of the ${q.subsystem} approach being studied`,
      dependent: "Performance, margin, reliability, crew time, mass or power — choose one primary metric",
      controlled: `Environmental conditions representative of ${q.environment.toLowerCase()}; load profile; baseline design`,
    },
    simulation: `Build ${s.method}. Start from first-principles models of the ${q.subsystem} subsystem and add ${q.environment.toLowerCase()} effects step by step.`,
    experiment:
      q.trl.startsWith("TRL 1")
        ? "Desk study and simple bench tests that isolate the key physical effect."
        : q.trl.startsWith("TRL 4")
          ? "Laboratory breadboard, then tests in a relevant environment (thermal-vacuum, analogue or reduced-gravity platform)."
          : "Integrated prototype tested against requirements, with a flight-experiment concept.",
    data: "Time-stamped measurements with units, uncertainty estimates, and all configuration parameters recorded for reproducibility.",
    validation: "Compare against analytical limits, independent datasets, and published flight or ground results; report uncertainty and model limitations.",
    contribution: s.contribution,
    resources: [
      { label: "NASA Technical Reports Server (search)", href: `https://ntrs.nasa.gov/search?q=${search}` },
      { label: "Google Scholar (search)", href: `https://scholar.google.com/scholar?q=${search}` },
      { label: "NASA Space Station Research Explorer", href: "https://www.nasa.gov/mission/station/research-explorer/" },
      { label: "ISRO IMEx-2026 announcement", href: "https://www.isro.gov.in/IndianMicrogravityExperiments_IMEx2026.html" },
    ],
  };
}
