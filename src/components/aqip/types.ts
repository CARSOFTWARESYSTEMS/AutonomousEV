// Shared types for the AQIP strategy page. Content lives in ./data, rendering
// in ./sections and ./interactive; these types are what the two agree on.

/** When a module or capability is planned to be worked on. Not a statement that it exists. */
export type Maturity = "now" | "next" | "later";

/** How real a capability is today. Only "available" describes something that exists. */
export type Status = "available" | "development" | "planned" | "research";

/** Every label a chip can carry. Each has its own wording, so status never depends on colour. */
export type Tone =
  | Maturity
  | Status
  | "current"
  | "vision"
  | "illustrative"
  | "target"
  | "example"
  | "future"
  | "synthetic"
  | "strategy"
  | "safety";

export const TONE_LABEL: Record<Tone, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
  available: "Available",
  development: "In development",
  planned: "Planned",
  research: "Research",
  current: "Current",
  vision: "Long-term vision",
  illustrative: "Illustrative",
  target: "Target",
  example: "Example",
  future: "Future concept",
  synthetic: "Synthetic data",
  strategy: "Strategy",
  safety: "Safety rule",
};

export type Level = "Low" | "Medium" | "High";
