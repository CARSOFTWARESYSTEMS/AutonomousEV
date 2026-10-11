// Shared ids for the Advanced Rocket Propulsion System Digital Twin (no React).
// Ids are lower_snake_case where they are also sent as analytics parameters.

export const MODULE_IDS = ["overview", "system", "pressure", "physics", "data", "twin", "ai", "fdir", "health", "lab", "architecture", "weeks"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const LEVEL_IDS = ["learn", "engineer", "architect"] as const;
export type LevelId = (typeof LEVEL_IDS)[number];

/** Where the status of a value, a model or a statement comes from. Shown beside it wherever it appears. */
export type Provenance = "SIMULATED" | "REFERENCE VALUE" | "REFERENCE MODEL" | "CONCEPTUAL";

export type ModelStatus = "CONCEPTUAL" | "REFERENCE MODEL" | "SIMULATED" | "CALIBRATED" | "TEST-CORRELATED" | "VALIDATED WITHIN DEFINED ENVELOPE";

/** A concept taught at five depths, in the order a newcomer needs them. */
export interface Concept {
  id: string;
  title: string;
  /** A direct definition, one or two sentences, that stands on its own. */
  definition: string;
  simple: string;
  engineering: string;
  /** The governing relation, written out, and what its symbols mean. */
  math: { equation: string; where: string };
  twin: string;
  failure: string;
}

export type SubsystemId = "storage" | "feed" | "turbomachinery" | "hot_gas" | "cooling" | "injector" | "chamber" | "nozzle" | "controls" | "instrumentation";
