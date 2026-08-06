import type { TrustDimension } from "@/lib/battery-cybersecurity/types";

// One sentence per dimension, satisfying the spec's "explain every score."
export const DIMENSION_EXPLANATIONS: Record<TrustDimension, string> = {
  identity: "Whether the battery pack, BMS, and personnel involved can be cryptographically confirmed to be who/what they claim to be.",
  integrity: "Whether telemetry and commands can be confirmed unaltered in transit.",
  authenticity: "Whether telemetry, commands, firmware, and charging sessions can be confirmed to come from a genuine, authorized source.",
  availability: "Whether energy and power information remains accessible when needed, including under fault or outage conditions.",
  safety: "Whether physical battery safety mechanisms (balancing, thermal, redundant sensing) are in place.",
  evidence: "Whether events and actions are logged in a way that supports later investigation.",
  resilience: "Whether the architecture can detect and recover from a fault or compromise without cascading failure.",
  detection: "Whether the system can actively identify anomalous telemetry, commands, or component behavior.",
  verification: "Whether the architecture's controls have been independently tested, not just designed.",
};
