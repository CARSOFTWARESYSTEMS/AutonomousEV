import type { DownloadTemplate } from "../types";

// Generic, reusable engineering templates — not capability claims. Downloaded
// client-side as Markdown (see DownloadCard.tsx), same mechanism as the
// Threat-Modelling Studio's export.

export const DOWNLOAD_TEMPLATES: DownloadTemplate[] = [
  {
    id: "threat-modelling-template",
    category: "threat-modelling",
    title: "Threat Modelling Template",
    description: "A blank worksheet for documenting a battery/energy-system threat: entry point, asset, attack vector, consequence, detection, mitigation, verification, and residual risk.",
    filename: "threat-modelling-template.md",
    buildMarkdown: () => `# Threat Modelling Worksheet

## Threat Name


## Category
(spoofing / tampering / repudiation / information disclosure / denial of service / elevation of privilege)

## Entry Point


## Asset / Data Affected


## Attack Vector


## Potential Consequence


## Severity / Likelihood


## Detection Approach


## Mitigation


## Verification Scenario


## Residual Risk


## Evidence Status
(available capability / demonstration-POC / research in progress / future roadmap)
`,
  },
  {
    id: "security-checklist-template",
    category: "security-checklist",
    title: "Security Checklist",
    description: "A checklist for reviewing whether a battery/energy architecture addresses the five core trust questions on this page.",
    filename: "battery-cybersecurity-checklist.md",
    buildMarkdown: () => `# Battery & Energy Cybersecurity Checklist

## Battery Identity
- [ ] Battery pack and BMS have a verifiable digital identity
- [ ] Firmware version is verified against a signed manifest
- [ ] Component provenance / chain of custody is tracked

## Telemetry Integrity
- [ ] Telemetry is authenticated (message authentication)
- [ ] Freshness / anti-replay checks are in place
- [ ] Physics-based plausibility checks are in place
- [ ] Independent sensor cross-validation exists for safety-critical measurements

## Command Integrity
- [ ] Commands are authorized and least-privilege
- [ ] Configuration integrity is verified against a signed baseline
- [ ] Network intrusion detection covers the vehicle bus

## Energy Availability
- [ ] An independent energy-margin estimate cross-checks the primary estimate
- [ ] Flight-phase-aware thresholds are defined

## Recovery and Evidence
- [ ] A safe degraded mode is defined and tested for each major component class
- [ ] Tamper-evident logging captures safety- and security-relevant events
- [ ] An incident correlation process exists
`,
  },
  {
    id: "architecture-review-template",
    category: "architecture-review",
    title: "Architecture Review Template",
    description: "A structured template for reviewing an energy-system architecture's trust boundaries and controls.",
    filename: "architecture-review-template.md",
    buildMarkdown: () => `# Energy System Architecture Review

## System Context
(List major components and their domain: energy / propulsion / flight-control / avionics / communications / ground-support)

## Trust Boundaries
(List every point where data or commands cross between components with different trust levels)

## Entry Points
(List every entry point and its exposure: physical / wireless-local / wireless-wide-area / supply-chain / ground-network)

## Controls per Trust Boundary
| Trust Boundary | Control | Evidence Status |
|---|---|---|


## Open Gaps


## Recommended Next Steps
`,
  },
  {
    id: "detection-rules-template",
    category: "detection-rules",
    title: "Detection Rule Catalogue Template",
    description: "A template for cataloguing deterministic detection rules by layer.",
    filename: "detection-rule-catalogue-template.md",
    buildMarkdown: () => `# Detection Rule Catalogue

## Layer: Identity


## Layer: Telemetry Integrity


## Layer: Behavioral Anomaly


## Layer: Firmware Assurance


## Layer: Network


## Layer: Operational Process


For each rule, record: Name / Description / Inputs / Pass-Fail Condition / Action on Failure / Evidence Status.
`,
  },
  {
    id: "workshop-brochure-template",
    category: "workshop-brochure",
    title: "Workshop Brochure",
    description: "A summary of the Electric Aircraft Battery Cybersecurity Discovery & Threat-Modelling Workshop structure and deliverables, for internal circulation.",
    filename: "battery-cybersecurity-workshop-brochure.md",
    buildMarkdown: () => `# Electric Aircraft Battery Cybersecurity Discovery & Threat-Modelling Workshop

## Phase 1 — Discovery
Aircraft and energy architecture review, stakeholder interviews, mission and flight-phase analysis, asset and data-flow identification, assumption and dependency review.

## Phase 2 — Threat Modelling
Trust-boundary mapping, attack-surface identification, threat scenarios, abuse cases, safety and mission impact, risk prioritisation.

## Phase 3 — Assurance Strategy
Detection requirements, prevention and containment controls, safe degraded-mode strategy, incident evidence requirements, verification plan, POC recommendations.

## Deliverables
System context diagram, battery and energy trust map, threat model, attack-path catalogue, prioritised risk register, detection-rule catalogue, security requirements, verification matrix, 30/60/90-day roadmap, executive summary, suggested POC plan.

See /design-development/passenger-taxi/battery-cybersecurity for full details.
`,
  },
  {
    id: "executive-summary-template",
    category: "executive-summary",
    title: "Executive Summary Template",
    description: "A one-page, non-technical summary template for programme leadership.",
    filename: "executive-summary-template.md",
    buildMarkdown: () => `# Executive Summary — Battery & Energy Cybersecurity

## Programme / Aircraft Profile


## Key Finding
(One sentence: what is the current trust posture?)

## Top 3 Risks
1.
2.
3.

## Recommended Immediate Actions


## Roadmap Summary
(Now / Next / Future)

## Requested Decision
`,
  },
];
