import type {
  AircraftComponent,
  DetectionControl,
  EntryPoint,
  ExplorerNode,
  FlightPhaseProfile,
  ThreatCard,
} from "./types";

/** Pure, dataset-injected mappers from existing typed data to the generic
 * ExplorerNode shape NodeExplorer renders. Introduces no new data/claims. */

export function buildAttackSurfaceNodes(
  components: AircraftComponent[],
  entryPoints: EntryPoint[],
  threats: ThreatCard[],
  controls: DetectionControl[]
): ExplorerNode[] {
  const componentsById = new Map(components.map((c) => [c.id, c]));
  const controlsById = new Map(controls.map((c) => [c.id, c]));

  return components.map((component) => {
    const interfaces = entryPoints.filter((e) => e.reachableComponentIds.includes(component.id));
    const downstream = component.downstreamComponentIds
      .map((id) => componentsById.get(id)?.name)
      .filter((n): n is string => Boolean(n));
    const affectingThreats = threats.filter((t) => t.affectedComponentIds.includes(component.id));
    const mitigationIds = new Set(affectingThreats.flatMap((t) => t.mitigationControlIds));
    const mitigations = [...mitigationIds].map((id) => controlsById.get(id)?.name).filter((n): n is string => Boolean(n));

    return {
      id: component.id,
      label: component.name,
      summary: component.trustRole,
      detailSections: [
        { heading: "Interfaces (Entry Points)", body: interfaces.length ? interfaces.map((e) => e.name) : ["None — not directly reachable from a modeled external entry point."] },
        { heading: "Downstream Components (Trust Boundary)", body: downstream.length ? downstream : ["None — terminal node in the trust chain."] },
        { heading: "Threats", body: affectingThreats.length ? affectingThreats.map((t) => t.name) : ["No catalogued threat directly affects this component."] },
        { heading: "Mitigations", body: mitigations.length ? mitigations : ["See the Detection & Assurance Strategy section for general controls."] },
      ],
    };
  });
}

export function buildFlightPhaseNodes(profiles: FlightPhaseProfile[]): ExplorerNode[] {
  return [...profiles]
    .sort((a, b) => a.order - b.order)
    .map((profile) => ({
      id: profile.id,
      label: profile.name,
      summary: `Battery functions: ${profile.batteryFunctions.join("; ")}.`,
      detailSections: [
        { heading: "Threats", body: profile.threats },
        { heading: "Attack Surface", body: profile.attackSurface },
        { heading: "Detection", body: profile.detection },
        { heading: "Mitigation", body: profile.mitigation },
        { heading: "Operational Impact", body: profile.operationalImpact },
        { heading: "Verification", body: profile.verification },
      ],
    }));
}

export function buildKnowledgeGraphNodes(threats: ThreatCard[], controls: DetectionControl[]): ExplorerNode[] {
  const controlsById = new Map(controls.map((c) => [c.id, c]));

  return threats.map((threat) => {
    const detectionRules = threat.detectionControlIds.map((id) => controlsById.get(id)?.name).filter((n): n is string => Boolean(n));
    const mitigations = threat.mitigationControlIds.map((id) => controlsById.get(id)?.name).filter((n): n is string => Boolean(n));

    return {
      id: threat.id,
      label: threat.name,
      summary: threat.summary,
      badge: { kind: "severity" as const, value: threat.severity },
      detailSections: [
        { heading: "Attack", body: threat.attackVector },
        { heading: "Asset", body: threat.assetAffected },
        { heading: "Detection Rule(s)", body: detectionRules.length ? detectionRules : ["See the Detection & Assurance Strategy section."] },
        { heading: "Evidence", body: "Captured via tamper-evident logging and incident correlation (see Detection & Assurance Strategy)." },
        { heading: "Mitigation", body: mitigations.length ? mitigations : ["See the Detection & Assurance Strategy section."] },
        { heading: "Verification", body: threat.verificationScenario },
        { heading: "Residual Risk", body: threat.residualRiskNote },
      ],
    };
  });
}
