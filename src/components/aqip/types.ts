// Shared types for the AQIP strategy page. Content lives in ./data, rendering
// in ./sections and ./interactive; these types are what the two agree on.

/**
 * How real a module or capability is today. The six labels are the only ones
 * the page uses for product maturity, and none of them says "production".
 * Only "prototype" describes software that exists: the FAI Engineer foundation.
 */
export type Maturity = "prototype" | "development" | "planned-y1" | "planned-y23" | "research" | "vision";

/** The six maturity labels, from what exists to what is furthest away. */
export const MATURITY_ORDER: readonly Maturity[] = ["prototype", "development", "planned-y1", "planned-y23", "research", "vision"];

/** Every label a chip can carry. Each has its own wording, so status never depends on colour. */
export type Tone = Maturity | "planned" | "illustrative" | "target" | "example" | "future" | "synthetic" | "strategy" | "safety";

export const TONE_LABEL: Record<Tone, string> = {
  prototype: "Prototype foundation",
  development: "In development",
  "planned-y1": "Planned — Year 1",
  "planned-y23": "Planned — Year 2/3",
  research: "Research",
  vision: "Long-term vision",
  planned: "Planned",
  illustrative: "Illustrative",
  target: "Target",
  example: "Example",
  future: "Future concept",
  synthetic: "Synthetic demo",
  strategy: "Strategy",
  safety: "Safety rule",
};

export type Level = "Low" | "Medium" | "High";
