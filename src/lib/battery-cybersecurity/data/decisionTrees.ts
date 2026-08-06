import type { DecisionTree } from "../types";

export const DECISION_TREES: DecisionTree[] = [
  {
    id: "telemetry-trust-decision",
    title: "Should the Aircraft Trust This Telemetry Value?",
    description: "The layered check a piece of incoming battery telemetry should pass before it is used for a flight-safety decision.",
    startStepId: "authenticated",
    steps: [
      {
        id: "authenticated",
        question: "Is the message authenticated (valid signature or MAC)?",
        yes: { label: "Yes", next: "fresh" },
        no: { label: "No", next: null, outcome: "Reject — unauthenticated message discarded before use." },
      },
      {
        id: "fresh",
        question: "Does it pass the freshness / anti-replay check?",
        yes: { label: "Yes", next: "plausible" },
        no: { label: "No", next: null, outcome: "Reject — stale or replayed message discarded before use." },
      },
      {
        id: "plausible",
        question: "Does the value pass physics-based plausibility checks?",
        yes: { label: "Yes", next: "cross-check" },
        no: { label: "No", next: null, outcome: "Flag — implausible value is not used for flight-safety decisions; logged for review." },
      },
      {
        id: "cross-check",
        question: "Does it agree with an independent or cross-validated signal within tolerance?",
        yes: { label: "Yes", next: null, outcome: "Trust — value accepted for flight-safety decisions." },
        no: { label: "No", next: null, outcome: "Degrade — divergence flagged; aircraft falls back to the independent estimate." },
      },
    ],
  },
  {
    id: "degraded-mode-response-decision",
    title: "What Degraded-Mode Action Should the Aircraft Take?",
    description: "The decision path from a detected anomaly to a bounded, defined aircraft response.",
    startStepId: "anomaly-detected",
    steps: [
      {
        id: "anomaly-detected",
        question: "Has an anomaly been detected in battery telemetry or commands?",
        yes: { label: "Yes", next: "safety-critical" },
        no: { label: "No", next: null, outcome: "Continue normal operation; log for trend analysis." },
      },
      {
        id: "safety-critical",
        question: "Is the affected function safety-critical for the current flight phase?",
        yes: { label: "Yes", next: "high-power-phase" },
        no: { label: "No", next: null, outcome: "Log and flag for post-flight review; continue with heightened monitoring." },
      },
      {
        id: "high-power-phase",
        question: "Is the aircraft in a high-consequence flight phase (e.g. takeoff, hover, landing)?",
        yes: {
          label: "Yes",
          next: null,
          outcome: "Enter safe degraded mode immediately — fall back to the independent energy-margin estimate, alert crew/operator, capture evidence.",
        },
        no: {
          label: "No",
          next: null,
          outcome: "Enter safe degraded mode at the next stable point in the flight profile — alert crew/operator, capture evidence.",
        },
      },
    ],
  },
];
