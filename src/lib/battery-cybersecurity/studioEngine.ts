import { scoreConsequence } from "./scoring";
import type {
  AircraftComponent,
  DetectionControl,
  EvidenceStatus,
  StudioDataset,
  StudioInput,
  StudioPropagationStep,
  StudioResult,
  ThreatCard,
  TrustState,
} from "./types";

const MAX_PROPAGATION_HOPS = 4;
const DECAY_STATES: TrustState[] = ["compromised", "degraded", "unverified"];
const EVIDENCE_ORDER: EvidenceStatus[] = [
  "future-roadmap",
  "research-in-progress",
  "demonstration-poc",
  "available-capability",
];

function initialDecayIndex(severity: ThreatCard["severity"]): number {
  if (severity === "critical" || severity === "high") return 0; // compromised
  if (severity === "medium") return 1; // degraded
  return 2; // unverified
}

function propagate(
  entryComponentId: string,
  threat: ThreatCard,
  entryPointName: string,
  components: AircraftComponent[]
): StudioPropagationStep[] {
  const componentsById = new Map(components.map((c) => [c.id, c]));
  const startIndex = initialDecayIndex(threat.severity);
  const visited = new Set<string>();
  const steps: StudioPropagationStep[] = [];
  const queue: Array<{ id: string; hop: number }> = [{ id: entryComponentId, hop: 0 }];

  while (queue.length > 0) {
    const { id, hop } = queue.shift()!;
    if (visited.has(id) || hop > MAX_PROPAGATION_HOPS) continue;
    visited.add(id);

    const component = componentsById.get(id);
    if (!component) continue;

    const decayIndex = Math.min(startIndex + hop, DECAY_STATES.length - 1);
    const trustState = DECAY_STATES[decayIndex];
    const rationale =
      hop === 0
        ? `Directly affected by ${threat.name} via ${entryPointName}.`
        : `Downstream of the affected component through the energy trust chain; trust decays with distance from the entry point (hop ${hop}).`;

    steps.push({ componentId: id, componentName: component.name, trustState, rationale });

    for (const downstreamId of component.downstreamComponentIds) {
      queue.push({ id: downstreamId, hop: hop + 1 });
    }
  }

  return steps;
}

function weakestEvidenceStatus(statuses: EvidenceStatus[]): EvidenceStatus {
  let weakestIndex = EVIDENCE_ORDER.length - 1;
  for (const status of statuses) {
    weakestIndex = Math.min(weakestIndex, EVIDENCE_ORDER.indexOf(status));
  }
  return EVIDENCE_ORDER[Math.max(weakestIndex, 0)];
}

function invalidResult(input: StudioInput, message: string): StudioResult {
  return {
    input,
    valid: false,
    validationMessage: message,
    propagationPath: [],
    consequenceSeverity: "low",
    consequenceNarrative: "",
    recommendedDetectionControls: [],
    recommendedMitigationControls: [],
    residualRiskNote: "",
    evidenceStatus: "future-roadmap",
  };
}

/**
 * Fully deterministic, dataset-injected. No network calls, no generated text —
 * every output string is built from template + data fields only.
 */
export function runThreatModel(input: StudioInput, dataset: StudioDataset): StudioResult {
  const aircraftProfile = dataset.aircraftProfiles.find((p) => p.id === input.aircraftProfileId);
  const component = dataset.components.find((c) => c.id === input.componentId);
  const entryPoint = dataset.entryPoints.find((e) => e.id === input.entryPointId);
  const threat = dataset.threats.find((t) => t.id === input.threatId);
  const flightPhase = dataset.flightPhases.find((f) => f.id === input.flightPhaseId);

  if (!aircraftProfile) return invalidResult(input, `Unknown aircraft profile: ${input.aircraftProfileId}`);
  if (!component) return invalidResult(input, `Unknown component: ${input.componentId}`);
  if (!entryPoint) return invalidResult(input, `Unknown entry point: ${input.entryPointId}`);
  if (!threat) return invalidResult(input, `Unknown threat: ${input.threatId}`);
  if (!flightPhase) return invalidResult(input, `Unknown flight phase: ${input.flightPhaseId}`);

  if (!aircraftProfile.componentIds.includes(component.id)) {
    return invalidResult(
      input,
      `${component.name} is not part of the ${aircraftProfile.name} profile. Choose a component present on this aircraft profile.`
    );
  }
  if (!entryPoint.reachableComponentIds.includes(component.id)) {
    return invalidResult(
      input,
      `${entryPoint.name} cannot reach ${component.name}. Choose a component reachable from this entry point.`
    );
  }
  if (!threat.affectedEntryPointIds.includes(entryPoint.id)) {
    return invalidResult(
      input,
      `${threat.name} does not apply to ${entryPoint.name}. Choose an entry point this threat actually uses.`
    );
  }
  if (!threat.affectedComponentIds.includes(component.id)) {
    return invalidResult(
      input,
      `${threat.name} does not affect ${component.name}. Choose a component this threat actually affects.`
    );
  }

  const propagationPath = propagate(component.id, threat, entryPoint.name, dataset.components);
  const consequenceSeverity = scoreConsequence(threat.severity, threat.likelihood, flightPhase.consequenceWeight);

  const recommendedDetectionControls: DetectionControl[] = dataset.detectionControls.filter((c) =>
    threat.detectionControlIds.includes(c.id)
  );
  const recommendedMitigationControls: DetectionControl[] = dataset.detectionControls.filter((c) =>
    threat.mitigationControlIds.includes(c.id)
  );

  const consequenceNarrative = [
    `During ${flightPhase.name} on a ${aircraftProfile.name}, ${threat.name} reaching ${component.name} via ${entryPoint.name}`,
    `propagates through ${propagationPath.length} component${propagationPath.length === 1 ? "" : "s"} in the energy trust chain.`,
    `Assessed consequence severity: ${consequenceSeverity}. ${threat.potentialConsequence}`,
  ].join(" ");

  const evidenceStatus = weakestEvidenceStatus([
    threat.evidenceStatus,
    ...recommendedDetectionControls.map((c) => c.evidenceStatus),
    ...recommendedMitigationControls.map((c) => c.evidenceStatus),
  ]);

  return {
    input,
    valid: true,
    propagationPath,
    consequenceSeverity,
    consequenceNarrative,
    recommendedDetectionControls,
    recommendedMitigationControls,
    residualRiskNote: threat.residualRiskNote,
    evidenceStatus,
  };
}
