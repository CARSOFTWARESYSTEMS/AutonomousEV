import type { FaqItem } from "../types";

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-electric-aircraft-battery-cybersecurity",
    question: "What is electric aircraft battery cybersecurity?",
    answer: "Electric aircraft battery cybersecurity is the practice of ensuring that a battery's reported state — voltage, current, temperature, state of charge, state of health, and remaining power — and the commands acting on it (contactor, balancing, cooling, charge/discharge limits, firmware updates) can be trusted before, during, and after a cyberattack. It extends battery safety engineering to cover digital identity, telemetry integrity, command integrity, energy availability, and recovery.",
  },
  {
    id: "why-is-bms-cybersecurity-a-flight-safety-concern",
    question: "Why is BMS cybersecurity a flight-safety concern?",
    answer: "The Battery Management System is the trust broker between the physical battery and every system that depends on its reported state, including flight planning and power distribution. If the BMS's data or commands can be falsified without detection, decisions made from that data — including how much energy reserve is available for a contingency or diversion — become unreliable, which is a flight-safety concern even if the physical battery itself is undamaged.",
  },
  {
    id: "how-can-soc-spoofing-affect-an-evtol",
    question: "How can SOC spoofing affect an eVTOL?",
    answer: "If reported state of charge is manipulated to appear higher than the pack's true charge, flight planning may proceed with less real energy reserve than assumed. In a high-power phase such as climb or vertical landing, this can reduce the margin available for a contingency below what was planned, without any indication to the crew or autonomy system that the margin has changed.",
  },
  {
    id: "what-is-trustworthy-remaining-energy",
    question: "What is trustworthy remaining energy?",
    answer: "Trustworthy remaining energy is a remaining-energy and remaining-power estimate that has been checked for internal consistency (against physics and independent measurement) and for tampering (through authentication and freshness checks), rather than a raw telemetry value accepted without verification. It is the output of the Energy Availability trust question, not a separate measurement.",
  },
  {
    id: "how-can-charger-compromise-affect-an-aircraft-battery",
    question: "How can charger compromise affect an aircraft battery?",
    answer: "Ground charging equipment has a direct electrical and data connection to the battery pack. If compromised, it could attempt to issue an out-of-spec charge command or report a false post-charge state that is later trusted for flight planning. The BMS enforcing its own safety limits independent of the charger's instructions is the primary control against this.",
  },
  {
    id: "what-is-a-battery-trust-boundary",
    question: "What is a battery trust boundary?",
    answer: "A trust boundary is a point in the battery and energy architecture where data or commands cross from one component or actor to another with a different level of assumed trust — for example, from ground charging equipment into the battery pack, or from an OTA update channel into the BMS. Threat modelling starts by identifying these boundaries, since that is where verification is most needed.",
  },
  {
    id: "how-do-physics-based-checks-detect-cyber-manipulation",
    question: "How do physics-based checks detect cyber manipulation?",
    answer: "Physics-based plausibility checks compare reported values against what is physically possible or expected given recent history — for example, a temperature change faster than the pack's known thermal mass allows, or a state-of-charge step inconsistent with recent current draw. Manipulated data often fails these checks even when it looks superficially reasonable in isolation.",
  },
  {
    id: "what-is-safe-degraded-mode",
    question: "What is safe degraded mode?",
    answer: "Safe degraded mode is a defined, tested aircraft behavior for when trust in a component or data source is lost — for example, falling back to a conservative, independently derived energy estimate rather than continuing to act on data that is no longer trusted. It replaces an undefined failure state with a bounded, predictable one.",
  },
  {
    id: "how-does-threat-modelling-support-certification-readiness",
    question: "How does threat modelling support certification readiness?",
    answer: "Structured threat modelling produces the trust-boundary map, threat catalogue, and risk register that airworthiness security and safety assessment processes expect as evidence. It does not itself constitute certification or compliance; formal certification applicability must be assessed by qualified aerospace safety, cybersecurity, and certification professionals for a specific programme.",
  },
  {
    id: "what-does-the-discovery-workshop-deliver",
    question: "What does the discovery workshop deliver?",
    answer: "The Electric Aircraft Battery Cybersecurity Discovery & Threat-Modelling Workshop delivers a system context diagram, a battery and energy trust map, a threat model, an attack-path catalogue, a prioritised risk register, a detection-rule catalogue, security requirements, a verification matrix, a 30/60/90-day roadmap, an executive summary, and a suggested proof-of-concept plan. See the Workshop Offering section for the phase-by-phase structure.",
  },
  {
    id: "is-post-quantum-security-required-today",
    question: "Is post-quantum security required today?",
    answer: "No. Post-quantum cryptography is a future migration-readiness direction for long-lived aerospace systems, not a current production requirement for electric aircraft battery cybersecurity. It is addressed here as a roadmap item, not a present capability.",
  },
  {
    id: "can-this-approach-support-estol-and-defense-uavs",
    question: "Can this approach support eSTOL and defense UAVs?",
    answer: "Yes. The trust chain, trust questions, and threat-modelling method apply to any electric or hybrid-electric aircraft architecture with a battery, BMS, and energy management system — including electric short-take-off-and-landing aircraft and defense UAV/autonomous aircraft programmes — with the specific components, entry points, and flight phases adapted per programme.",
  },
];
