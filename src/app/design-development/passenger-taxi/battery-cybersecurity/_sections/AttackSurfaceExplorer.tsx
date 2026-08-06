import { buildAttackSurfaceNodes } from "@/lib/battery-cybersecurity/explorerMappers";
import { COMPONENTS } from "@/lib/battery-cybersecurity/data/components";
import { ENTRY_POINTS } from "@/lib/battery-cybersecurity/data/entryPoints";
import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { SectionHeader } from "../SectionHeader";
import { NodeExplorer } from "../NodeExplorer";

export function AttackSurfaceExplorer() {
  const nodes = buildAttackSurfaceNodes(COMPONENTS, ENTRY_POINTS, THREAT_CATALOGUE, DETECTION_CONTROLS);

  return (
    <section className="section" id="attack-surface-explorer" aria-labelledby="attack-surface-heading">
      <div className="container">
        <SectionHeader label="Interactive Attack Surface Explorer" title="Select a Component to See Its Trust Boundary" headingId="attack-surface-heading">
          <p>
            Battery → BMS → EMS → VCU → PDU → Motor Controller → Propulsion, plus Charger, Maintenance Laptop, OTA, and Fleet
            Platform. Select any component to see its interfaces, trust boundary, threats, and mitigations.
          </p>
        </SectionHeader>
        <NodeExplorer nodes={nodes} ariaLabel="Select an aircraft component to explore" trackEventPrefix="bcs_attack_surface" />
      </div>
    </section>
  );
}
