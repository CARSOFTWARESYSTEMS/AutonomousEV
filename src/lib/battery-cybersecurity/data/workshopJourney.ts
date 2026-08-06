import type { WorkshopJourneyStage } from "../types";

export const WORKSHOP_JOURNEY: WorkshopJourneyStage[] = [
  { id: "discovery", order: 1, name: "Discovery", description: "Architecture, stakeholder, and mission review." },
  { id: "threat-modelling", order: 2, name: "Threat Modelling", description: "Trust boundaries, attack surface, and threat scenarios." },
  { id: "architecture-review", order: 3, name: "Architecture Review", description: "Review the as-built energy and cybersecurity architecture against the threat model." },
  { id: "risk-assessment", order: 4, name: "Risk Assessment", description: "Prioritise threats by safety, mission, and cybersecurity consequence." },
  { id: "detection-design", order: 5, name: "Detection Design", description: "Define layered detection requirements and candidate rules." },
  { id: "verification", order: 6, name: "Verification", description: "Trace requirements and controls to concrete verification methods." },
  { id: "poc", order: 7, name: "POC", description: "Scope a follow-on proof of concept where warranted." },
  { id: "roadmap", order: 8, name: "Roadmap", description: "Sequence near-term follow-on work into a 30/60/90-day plan." },
];
