import type { MethodologyStep } from "../types";

export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    id: "discover",
    order: 1,
    name: "Discover",
    description: "Review the aircraft's energy architecture, stakeholders, mission profile, and existing assumptions.",
    typicalOutputs: ["System context diagram", "Stakeholder and dependency review"],
  },
  {
    id: "model",
    order: 2,
    name: "Model",
    description: "Map trust boundaries, entry points, and data/command flows across the battery and energy trust chain.",
    typicalOutputs: ["Battery and energy trust map", "Entry-point inventory"],
  },
  {
    id: "assess",
    order: 3,
    name: "Assess",
    description: "Develop threat scenarios, abuse cases, and safety/mission impact, then prioritise by risk.",
    typicalOutputs: ["Threat catalogue", "Prioritised risk register"],
  },
  {
    id: "design",
    order: 4,
    name: "Design",
    description: "Define detection requirements, prevention and containment controls, and safe degraded-mode behavior.",
    typicalOutputs: ["Security requirements", "Detection-rule catalogue"],
  },
  {
    id: "verify",
    order: 5,
    name: "Verify",
    description: "Define and run concrete verification tests tracing each requirement or control to a proposed method.",
    typicalOutputs: ["Verification matrix"],
  },
  {
    id: "demonstrate",
    order: 6,
    name: "Demonstrate",
    description: "Show the detection and mitigation approach working against a modeled or simulated threat scenario, such as in the Threat-Modelling Studio.",
    typicalOutputs: ["Scenario walkthrough results", "Studio export (JSON/Markdown)"],
  },
  {
    id: "deploy",
    order: 7,
    name: "Deploy",
    description: "Where a proof of concept is warranted, scope and stage the technical implementation.",
    typicalOutputs: ["Suggested proof-of-concept plan"],
  },
  {
    id: "improve",
    order: 8,
    name: "Improve",
    description: "Feed findings back into the threat model, detection rules, and roadmap — closing the Cyber Energy Loop.",
    typicalOutputs: ["Updated threat model", "30/60/90-day roadmap"],
  },
];
