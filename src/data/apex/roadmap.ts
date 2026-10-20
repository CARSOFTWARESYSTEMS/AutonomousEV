/**
 * The APEX roadmap, driven by data. No date is guessed: an item without an
 * owner-confirmed date shows "Owner confirmation required". When APEX supplies
 * dates, set `dateOrPeriod` (a year such as "2027" or a quarter such as
 * "2027 Q2") and `ownerConfirmed: true`; the page groups by whatever is given.
 */
import type { DisplayStatus } from "./evidence";

export const OWNER_CONFIRM_REQUIRED = "OWNER_CONFIRM_REQUIRED" as const;

export type RoadmapCategory = "Propulsion" | "Engine control" | "Vehicle" | "Validation" | "Digital engineering" | "Quality" | "Ecosystem" | "People";

export interface RoadmapItem {
  id: string;
  title: string;
  dateOrPeriod: string;
  status: Extract<DisplayStatus, "BUILT" | "ACTIVE" | "PLANNED" | "CONCEPT">;
  category: RoadmapCategory;
  /** What the status rests on. An evidence id from evidence.ts, or a plain statement for concept items. */
  evidence: string;
  ownerConfirmed: boolean;
  publicSafe: boolean;
}

export const ROADMAP: readonly RoadmapItem[] = [
  {
    id: "demonstrator-built",
    title: "5 kN-class gas-generator-cycle liquid-engine demonstrator built",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "BUILT",
    category: "Propulsion",
    evidence: "engine-demonstrator-built",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "development-platform",
    title: "Demonstrator in use as the propulsion development platform",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "ACTIVE",
    category: "Propulsion",
    evidence: "engine-development-platform",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "manufacturing-led-iteration",
    title: "Manufacturing-led hardware iteration with conventional processes",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "ACTIVE",
    category: "Propulsion",
    evidence: "manufacturing-approach",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "performance-control-refinement",
    title: "Refinement of engine performance and engine control systems",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "PLANNED",
    category: "Engine control",
    evidence: "engine-refinement-planned",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "active-throttle",
    title: "Integration of active throttle control",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "PLANNED",
    category: "Engine control",
    evidence: "engine-throttle-planned",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "launch-vehicle-focus",
    title: "Small- and medium-lift launch-vehicle development",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "PLANNED",
    category: "Vehicle",
    evidence: "company-focus",
    ownerConfirmed: true,
    publicSafe: true,
  },
  {
    id: "instrumentation-baseline",
    title: "Instrumentation and test-data baseline for engine testing",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Validation",
    evidence: "Proposed in this concept experience.",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "hil-bench",
    title: "Hardware-in-the-loop bench for engine control firmware",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Validation",
    evidence: "Proposed in this concept experience.",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "twin-correlation",
    title: "Configuration-aware engine Digital Twin and test correlation",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Digital engineering",
    evidence: "apex-digital-twin",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "quality-thread",
    title: "Digital quality thread for engine hardware",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Quality",
    evidence: "Proposed in this concept experience.",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "review-gates",
    title: "Engineering review gates adopted across partners",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Ecosystem",
    evidence: "review-gates",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "partner-network",
    title: "Specialist partner network for open capabilities",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "Ecosystem",
    evidence: "partner-relationships",
    ownerConfirmed: false,
    publicSafe: true,
  },
  {
    id: "talent-pipeline",
    title: "Internship and workforce pipeline",
    dateOrPeriod: OWNER_CONFIRM_REQUIRED,
    status: "CONCEPT",
    category: "People",
    evidence: "Proposed in this concept experience.",
    ownerConfirmed: false,
    publicSafe: true,
  },
];

export const ROADMAP_STATUS_ORDER = ["BUILT", "ACTIVE", "PLANNED", "CONCEPT"] as const;

/** "Owner confirmation required" for an unconfirmed date, otherwise the date as given. */
export function roadmapDateLabel(item: RoadmapItem): string {
  return item.dateOrPeriod === OWNER_CONFIRM_REQUIRED || !item.ownerConfirmed ? "Date: owner confirmation required" : item.dateOrPeriod;
}
