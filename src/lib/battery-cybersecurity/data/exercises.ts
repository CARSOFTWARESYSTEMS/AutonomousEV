import type { InternExercise } from "../types";

export const INTERN_EXERCISES: InternExercise[] = [
  {
    id: "identify-trust-boundaries",
    title: "Identify Trust Boundaries in an eVTOL Battery Architecture",
    objective: "Practice locating trust boundaries in a real system diagram before attempting any threat analysis.",
    input: "The Energy Trust Chain diagram on this page (Battery Pack -> BMS -> EMS -> VCU -> PDU -> Inverter/Motor Controller -> Propulsion, plus Charger, Maintenance Laptop, OTA System, and Fleet Platform entry points).",
    task: "List every point in the diagram where data or commands cross between components with a different assumed trust level, and name which actor is on each side.",
    expectedOutput: "A list of trust boundaries, each with the two components/actors involved and the direction of data or command flow.",
    acceptanceCriteria: [
      "Every entry point on the diagram (charging interface, ground diagnostic port, OTA channel, telemetry uplink, supply chain) is represented",
      "Each boundary states both the upstream and downstream side",
      "No boundary is duplicated under two different names",
    ],
    commonMistakes: [
      "Treating the whole vehicle network bus as one boundary instead of identifying it at each component pair",
      "Omitting the supply-chain/provenance boundary because it is not a live network connection",
    ],
    stretchGoal: "Propose which two or three boundaries most need a new or stronger control first, and justify the ranking.",
  },
  {
    id: "model-soc-spoofing",
    title: "Model an SOC Spoofing Attack",
    objective: "Practice building a threat scenario end-to-end: entry point, affected component, propagation, and consequence.",
    input: "The Threat Catalogue's 'Falsified State of Charge (SOC)' card and the Threat-Modelling Studio.",
    task: "Using the Threat-Modelling Studio, select the SOC spoofing threat against the BMS via the vehicle network bus during the Climb flight phase, then explain in your own words why the resulting consequence severity is what it is.",
    expectedOutput: "A short written explanation connecting the entry point, affected component, flight-phase weight, and resulting consequence severity.",
    acceptanceCriteria: [
      "Explanation references the specific flight phase's consequence weight",
      "Explanation identifies which downstream component would first be affected",
      "Explanation states what evidence status the recommended controls currently carry",
    ],
    commonMistakes: [
      "Describing the attack only in general terms without using the Studio's actual output",
      "Assuming a single detection control is sufficient rather than layered detection",
    ],
    stretchGoal: "Re-run the same threat during the Cruise flight phase and explain how and why the assessed severity changes.",
  },
  {
    id: "write-detection-rule",
    title: "Write a Deterministic Detection Rule",
    objective: "Practice turning a plausibility concept into a concrete, testable rule.",
    input: "The Telemetry Integrity trust question and the 'Physics-Based Plausibility Checks' detection control.",
    task: "Write a deterministic rule (in plain pseudocode) that flags a reported temperature change as implausible if it exceeds what the pack's thermal mass allows within a given time window.",
    expectedOutput: "A short pseudocode rule with explicit inputs (e.g. previous temperature, elapsed time, maximum physically plausible rate) and a clear pass/fail condition.",
    acceptanceCriteria: [
      "Rule is fully deterministic — no free-form or generated judgment",
      "Rule states its inputs and its single pass/fail condition explicitly",
      "Rule identifies what should happen when it fails (reject value vs. flag for review)",
    ],
    commonMistakes: [
      "Writing a rule that silently corrects the value instead of flagging or rejecting it",
      "Using a fixed threshold that does not account for elapsed time between readings",
    ],
    stretchGoal: "Extend the rule to also cross-check against reported current draw for the same time window.",
  },
  {
    id: "define-degraded-mode",
    title: "Define Safe Degraded-Mode Behaviour",
    objective: "Practice specifying a bounded fallback behavior rather than leaving a failure case undefined.",
    input: "The Recovery and Evidence trust question and the Energy Availability trust question.",
    task: "Define the safe degraded-mode behaviour for a BMS that has lost trust in its primary temperature sensor during the Cruise flight phase.",
    expectedOutput: "A short specification stating what the BMS should do, what estimate it should fall back to, and what should be logged.",
    acceptanceCriteria: [
      "Specifies a bounded fallback state, not an undefined or 'continue as normal' response",
      "States what should be logged for later investigation",
      "Addresses how the crew or operator would be informed of the degraded state",
    ],
    commonMistakes: [
      "Specifying an immediate emergency landing regardless of flight phase or severity",
      "Leaving evidence capture out of the specification entirely",
    ],
    stretchGoal: "Specify how the same event should be handled differently if it occurred during Taxi/Takeoff instead of Cruise.",
  },
  {
    id: "verification-evidence-report",
    title: "Produce a Verification and Evidence Report",
    objective: "Practice writing the kind of report an investigation or certification-readiness review would expect.",
    input: "Any completed Threat-Modelling Studio result (own scenario or a preset).",
    task: "Write a short verification report covering: what was tested, what detection/mitigation controls were exercised, what evidence would be captured, and what residual risk remains.",
    expectedOutput: "A one-page report with four clearly labeled sections: Test Scope, Controls Exercised, Evidence Captured, Residual Risk.",
    acceptanceCriteria: [
      "Report references the specific Studio result it is based on",
      "Residual Risk section is not left blank — every scenario has some noted limitation",
      "Report distinguishes evidence status (available capability vs. research-in-progress, etc.) for each control mentioned",
    ],
    commonMistakes: [
      "Claiming a control fully mitigates a threat when the data marks it as research-in-progress",
      "Omitting the residual-risk section",
    ],
    stretchGoal: "Compare two different Studio scenarios and note which one currently has the weaker verification coverage.",
  },
];
