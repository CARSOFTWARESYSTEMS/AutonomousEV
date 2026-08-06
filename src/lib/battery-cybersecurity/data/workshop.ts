import type { WorkshopDeliverable, WorkshopPhase } from "../types";

export const WORKSHOP_PHASES: WorkshopPhase[] = [
  {
    id: "discovery",
    phase: "Phase 1",
    title: "Discovery",
    activities: [
      "Aircraft and energy architecture review",
      "Stakeholder interviews",
      "Mission and flight-phase analysis",
      "Asset and data-flow identification",
      "Assumption and dependency review",
    ],
  },
  {
    id: "threat-modelling",
    phase: "Phase 2",
    title: "Threat Modelling",
    activities: [
      "Trust-boundary mapping",
      "Attack-surface identification",
      "Threat scenario development",
      "Abuse-case analysis",
      "Safety and mission impact assessment",
      "Risk prioritisation",
    ],
  },
  {
    id: "assurance-strategy",
    phase: "Phase 3",
    title: "Assurance Strategy",
    activities: [
      "Detection requirements definition",
      "Prevention and containment controls",
      "Safe degraded-mode strategy",
      "Incident evidence requirements",
      "Verification plan",
      "Proof-of-concept recommendations",
    ],
  },
];

export const WORKSHOP_DELIVERABLES: WorkshopDeliverable[] = [
  { id: "system-context-diagram", title: "System Context Diagram", description: "A single-page view of the aircraft's energy architecture and its external interfaces.", evidenceStatus: "demonstration-poc" },
  { id: "battery-energy-trust-map", title: "Battery & Energy Trust Map", description: "Trust boundaries, entry points, and data/command flows across the battery and energy trust chain.", evidenceStatus: "demonstration-poc" },
  { id: "threat-model-deliverable", title: "Threat Model", description: "A structured set of threat scenarios mapped to affected components, entry points, and flight phases.", evidenceStatus: "demonstration-poc" },
  { id: "attack-path-catalogue", title: "Attack-Path Catalogue", description: "Documented propagation paths from entry point to flight-safety consequence for priority threats.", evidenceStatus: "demonstration-poc" },
  { id: "risk-register", title: "Prioritised Risk Register", description: "Threats ranked by severity, likelihood, and flight-phase-weighted consequence.", evidenceStatus: "demonstration-poc" },
  { id: "detection-rule-catalogue", title: "Detection-Rule Catalogue", description: "Candidate deterministic detection rules mapped to the layered assurance strategy.", evidenceStatus: "demonstration-poc" },
  { id: "security-requirements", title: "Security Requirements", description: "Draft security requirements suitable as input to a systems or safety requirements process.", evidenceStatus: "demonstration-poc" },
  { id: "verification-matrix", title: "Verification Matrix", description: "Traceability between each requirement/control and a proposed verification method.", evidenceStatus: "demonstration-poc" },
  { id: "roadmap-30-60-90", title: "30/60/90-Day Roadmap", description: "A sequenced, resourced plan for near-term follow-on engineering work.", evidenceStatus: "demonstration-poc" },
  { id: "executive-summary", title: "Executive Summary", description: "A concise, non-technical summary of findings and recommendations for programme leadership.", evidenceStatus: "demonstration-poc" },
  { id: "poc-plan", title: "Suggested Proof-of-Concept Plan", description: "A scoped recommendation for a follow-on technical proof of concept, where warranted by the discovery findings.", evidenceStatus: "demonstration-poc" },
];
