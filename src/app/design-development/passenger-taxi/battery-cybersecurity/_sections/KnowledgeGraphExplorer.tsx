import { buildKnowledgeGraphNodes } from "@/lib/battery-cybersecurity/explorerMappers";
import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { SectionHeader } from "../SectionHeader";
import { NodeExplorer } from "../NodeExplorer";

export function KnowledgeGraphExplorer() {
  const nodes = buildKnowledgeGraphNodes(THREAT_CATALOGUE, DETECTION_CONTROLS);

  return (
    <section className="section" id="knowledge-graph" aria-labelledby="knowledge-graph-heading">
      <div className="container">
        <SectionHeader label="Knowledge Graph" title="Threat -> Attack -> Asset -> Detection -> Evidence -> Mitigation -> Verification -> Residual Risk" headingId="knowledge-graph-heading">
          <p>Select a threat to walk its full chain — the same underlying data as the Threat Catalogue, presented as a linked chain.</p>
        </SectionHeader>
        <NodeExplorer nodes={nodes} ariaLabel="Select a threat to explore its knowledge graph chain" trackEventPrefix="bcs_knowledge_graph" />
      </div>
    </section>
  );
}
