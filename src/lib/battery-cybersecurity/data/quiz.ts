import type { QuizQuestion } from "../types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "A battery pack reports normal voltage and temperature, but a firmware update to the BMS was installed without signature verification. Is this a battery cybersecurity concern?",
    options: [
      "No — the electrical readings are normal, so the battery is safe",
      "Yes — an unverified firmware change can affect telemetry or command integrity even while readings currently look normal",
      "Only if the aircraft is currently in flight",
      "Only if the firmware update changed the reported voltage value",
    ],
    correctIndex: 1,
    explanation: "A battery can be electrically healthy while digitally compromised. Unverified firmware is a command-integrity and telemetry-integrity risk regardless of what the current readings show.",
  },
  {
    id: "q2",
    question: "Why is a physics-based plausibility check useful against telemetry spoofing?",
    options: [
      "It replaces the need for message authentication",
      "It only works for temperature data",
      "It can flag a value that is internally inconsistent with recent history even if the message itself looks well-formed",
      "It requires an internet connection to run",
    ],
    correctIndex: 2,
    explanation: "Physics-based checks compare reported values against what is physically possible given recent history (e.g. coulomb counting, thermal response time), catching manipulation that looks superficially valid.",
  },
  {
    id: "q3",
    question: "During which flight phase does a falsified state-of-charge value generally carry the highest consequence?",
    options: [
      "Ground / charging, since the aircraft is not flying",
      "A high-power phase such as climb or vertical takeoff, where power demand and consequence weight are highest",
      "It carries the same consequence in every flight phase",
      "Only during landing",
    ],
    correctIndex: 1,
    explanation: "Consequence severity should be weighted by flight phase: high-power phases like climb and taxi/takeoff leave less time and margin to react to a false energy picture.",
  },
  {
    id: "q4",
    question: "What is the purpose of a defined 'safe degraded mode' rather than simply detecting and alerting on a threat?",
    options: [
      "It replaces the need for detection entirely",
      "It gives the aircraft a bounded, tested behavior to fall back to, instead of an undefined state after detection",
      "It is only relevant for ground systems, not in-flight systems",
      "It is a certification requirement in all cases",
    ],
    correctIndex: 1,
    explanation: "Detection alone is not resolution. Without a defined degraded-mode response, even a correctly detected threat can leave the aircraft in an undefined, unsafe state.",
  },
  {
    id: "q5",
    question: "Why does threat modelling mark each threat and control with an evidence status (e.g. research-in-progress vs. available capability)?",
    options: [
      "It is a formatting convention with no functional purpose",
      "To make certification claims stronger",
      "To keep an explicit, structural distinction between what is proven, demonstrated, in progress, or planned — avoiding overstated capability claims",
      "It only matters for post-quantum cryptography items",
    ],
    correctIndex: 2,
    explanation: "Separating available capability from demonstration/POC, research-in-progress, and future roadmap prevents a threat model or workshop deliverable from implying more maturity than actually exists.",
  },
];
