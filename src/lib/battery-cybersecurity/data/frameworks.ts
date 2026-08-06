import type { EngineeringFramework } from "../types";

export const FRAMEWORKS: EngineeringFramework[] = [
  {
    id: "battery-trust-framework",
    name: "Battery Trust Framework",
    shortLabel: "Battery Trust Framework",
    stages: ["Identity", "Integrity", "Authenticity", "Availability", "Safety", "Evidence", "Resilience"],
    executiveSummary:
      "Seven properties a battery system must hold simultaneously for its reported state to be trustworthy: it must be the right battery (Identity), reporting undamaged data (Integrity) from a genuine source (Authenticity), reachable when needed (Availability), operating within safe limits (Safety), auditable after the fact (Evidence), and able to recover from a fault or attack (Resilience).",
    engineeringExplanation:
      "Each property maps to a concrete engineering control already described elsewhere on this page: Identity to cryptographic pack/BMS identity, Integrity and Authenticity to message authentication and freshness checks, Availability to edge-first operation and denial-of-service resilience, Safety to independent energy-margin estimation and flight-phase-aware thresholds, Evidence to tamper-evident logging, and Resilience to defined safe degraded-mode behavior. The framework is a checklist for reviewing whether a given architecture addresses all seven, not a new set of controls.",
    practicalExample:
      "A pack passes Identity and Integrity checks (genuine, unaltered telemetry) but fails Availability during a network outage — the framework flags this as an incomplete trust posture even though no data was falsified, because a system that cannot report at all cannot support a flight-safety decision either.",
    verificationMethod:
      "For a given architecture, walk each of the seven properties and require a named control and a named verification test; any property without both is a gap, not an assumption.",
  },
  {
    id: "energy-trust-pyramid",
    name: "Energy Trust Pyramid",
    shortLabel: "Energy Trust Pyramid",
    stages: ["Physical", "Electrical", "Digital", "Cyber", "Operational", "Mission", "Trust"],
    executiveSummary:
      "A layered view of how confidence in the physical battery becomes confidence in a mission decision: each layer depends entirely on the layers beneath it, so a weakness at any lower layer silently undermines every layer above it, even if the higher layers look correct in isolation.",
    engineeringExplanation:
      "Physical (the cells themselves) supports Electrical (voltage/current/thermal behavior), which supports Digital (sensor readings and telemetry), which supports Cyber (the integrity and authenticity of that digital data), which supports Operational (BMS/EMS decisions made from the data), which supports Mission (flight planning and reserve-energy decisions), which supports Trust (the aircraft's overall confidence that it can complete the mission safely). The pyramid is why battery cybersecurity cannot be bolted on at the top — a Cyber-layer gap invalidates everything above it regardless of how sound the Mission-layer logic is.",
    practicalExample:
      "Correct Physical and Electrical behavior with a falsified Digital/Cyber layer (see the SOC-spoofing scenario on this page) still produces an unsound Mission-layer decision — the pyramid makes explicit which layer actually broke.",
    verificationMethod:
      "For any observed anomaly at the Mission or Trust layer, trace downward through Operational, Cyber, Digital, Electrical, to Physical to identify the actual layer of failure before assigning a fix.",
  },
  {
    id: "cyber-energy-loop",
    name: "Cyber Energy Loop",
    shortLabel: "Cyber Energy Loop",
    stages: ["Observe", "Verify", "Detect", "Respond", "Recover", "Learn"],
    executiveSummary:
      "A continuous operating loop — not a one-time control — for maintaining energy trust across a flight and across a fleet: observe telemetry and commands, verify them against independent signals, detect anomalies, respond with a bounded action, recover trust once verified, and learn by feeding the event back into detection rules and threat models.",
    engineeringExplanation:
      "The loop is deliberately circular rather than linear: 'Learn' feeds directly back into 'Observe' and 'Detect', meaning every real or simulated incident should improve the plausibility checks and detection rules described in the Detection & Assurance Strategy section, not just close out an individual ticket.",
    practicalExample:
      "A Threat-Modelling Studio run that reveals a weak or missing control (e.g. a threat whose recommended controls are still research-in-progress) is itself a 'Learn' step — it should inform the roadmap, not just the immediate scenario.",
    verificationMethod:
      "Confirm each stage produces an artifact the next stage consumes: Observe produces telemetry/log records, Verify produces a pass/fail plausibility result, Detect produces a flagged event, Respond produces a degraded-mode transition, Recover produces a restored-trust record, Learn produces an updated detection rule or threat-model entry.",
  },
];
