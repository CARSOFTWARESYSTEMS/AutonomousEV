// What the profile says about positioning and focus, in one place. The page,
// its social image and its tests read it from here, so they cannot drift apart.
//
// Wording rule for everything in this file: the Space and Aerospace work is
// research, simulation and engineering development. Nothing here may imply
// flight-qualified hardware, operational spacecraft, physical-engine validation
// or a certification that the profile does not show.

export const HERO = {
  positioning: "Director of Engineering | Systems Architecture | Technology & R&D",
  primary: ["Space Systems Engineering", "Digital Twins", "IVHM/FDIR", "Avionics & Telemetry"],
  supporting: ["Aerospace Cybersecurity", "AI/ML", "EV Battery & Energy Intelligence"],
} as const;

/** Joins a line of areas so that a separator never starts a line: it stays with the item before it. */
export const dotted = (items: readonly string[]) => items.join("\u00a0· ");
/** The same for a line already written with " | " between its parts. */
export const piped = (line: string) => line.replace(/ \| /g, "\u00a0| ");

export const FOCUS_NOTE =
  "Areas of current engineering work, research and study. The Space and Aerospace areas are research and engineering development, not flight or operational experience.";

export const FOCUS_AREAS = [
  {
    title: "Space Systems Engineering & Research",
    items: [
      "Satellite Systems Engineering",
      "Spacecraft Architecture",
      "Spacecraft Health Management",
      "CubeSat Systems",
      "Mission Engineering",
      "Avionics & Telemetry",
      "Mission/Ground Systems",
      "Digital Twins",
      "Model Rocketry",
      "Verification & Validation",
    ],
  },
  {
    title: "Digital Twin & Engineering Intelligence",
    items: [
      "Physics-Based Modelling",
      "Reduced-Order Models",
      "Telemetry & State Estimation",
      "Sensor Fusion",
      "Residual Analysis",
      "Fault Detection & Isolation",
      "IVHM",
      "FDIR",
      "PHM",
      "Prognostics",
      "Model Verification & Validation",
      "AI/ML-Assisted Diagnostics",
    ],
  },
  {
    title: "Avionics & Telemetry",
    items: [
      "CanSat Avionics",
      "Sensors & Instrumentation",
      "Telemetry",
      "Data Acquisition",
      "Connected Systems",
      "Secure Communications",
      "Ground-System Concepts",
      "Health Monitoring",
    ],
  },
  {
    title: "Aerospace & Cyber-Physical Security",
    items: [
      "Aerospace Cybersecurity",
      "Avionics & Telemetry Security",
      "Connected-System Security",
      "Secure Communications",
      "Data Integrity",
      "Authentication & Trust",
      "Replay/Tampering Detection",
      "Digital Twin Security",
      "Automotive/EV Cybersecurity",
    ],
  },
  {
    title: "AI/ML for Engineering",
    items: [
      "AI/ML",
      "Physics + Data Hybrid Models",
      "Time-Series Analysis",
      "Anomaly Detection",
      "Fault Classification",
      "Predictive Analytics",
      "Uncertainty-Aware Engineering",
      "AI-Assisted Engineering",
    ],
  },
  {
    title: "EV Battery & Energy Intelligence",
    items: [
      "BMS",
      "Battery Safety",
      "Diagnostics",
      "Battery Digital Twins",
      "Predictive Maintenance",
      "Battery Cybersecurity",
      "Energy Intelligence",
    ],
  },
] as const;

export const ADVANCED_TWIN_PROJECT = {
  name: "Advanced Rocket Propulsion Digital Twin",
  href: "/space/rocket-engine-digital-twin-advanced",
  summary:
    "Educational and research-oriented exploration of physics-based propulsion modelling, simulated telemetry, pressure instrumentation, state estimation, anomaly detection, fault diagnosis, FDIR, AI/ML-assisted diagnostics and prognostics.",
  /** What it is not, said beside it. */
  caveat: "A reduced-order simulation for learning; not validated against a physical engine.",
} as const;

export const CONSULTATION = {
  /** The section's address fragment, for links that should land on it. */
  id: "consultation",
  heading: "Technical Consultation & Collaboration",
  copy: "Available for technical discussions, engineering consultation and research collaboration in Space Systems Engineering, Digital Twins, Spacecraft Health Management, IVHM/FDIR, Avionics & Telemetry, Aerospace Cybersecurity, AI-assisted engineering and EV Battery & Energy Intelligence.",
  tags: ["Space Systems", "Digital Twins", "IVHM / FDIR", "Avionics & Telemetry", "Aerospace Cybersecurity", "AI/ML", "EV Battery Intelligence"],
  scope:
    "Space and Aerospace engagements are research and engineering development: modelling, simulation, Digital Twins and study, not flight qualification or certification services.",
  tutorials:
    "Questions about the engineering tutorials published here, including the Advanced Rocket Propulsion Digital Twin, are welcome through the contact details below.",
} as const;

export const MISSION =
  "To advance intelligent, secure and resilient engineering systems through systems architecture, Digital Twins, AI, cybersecurity and engineering research across Space, Aerospace and Energy.";

export const VISION =
  "To contribute to the development of safer, more autonomous and intelligence-driven Space, Aerospace and Energy systems through simulation, Digital Twins, health monitoring and secure engineering.";

/** The day the profile was last reviewed: the date on the page and the page's `dateModified`. */
export const LAST_REVIEWED = { iso: "2026-10-12", shown: "12 October 2026" } as const;
