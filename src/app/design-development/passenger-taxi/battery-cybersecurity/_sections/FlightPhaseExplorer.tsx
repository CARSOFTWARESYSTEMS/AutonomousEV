import { buildFlightPhaseNodes } from "@/lib/battery-cybersecurity/explorerMappers";
import { FLIGHT_PHASE_PROFILES } from "@/lib/battery-cybersecurity/data/flightPhaseProfiles";
import { SectionHeader } from "../SectionHeader";
import { NodeExplorer } from "../NodeExplorer";

export function FlightPhaseExplorer() {
  const nodes = buildFlightPhaseNodes(FLIGHT_PHASE_PROFILES);

  return (
    <section className="section bg-surface" id="flight-phase-explorer" aria-labelledby="flight-phase-heading">
      <div className="container">
        <SectionHeader label="Flight Phase Risk Explorer" title="Ten Flight Phases, Ground to Maintenance" headingId="flight-phase-heading">
          <p>Battery functions, threats, attack surface, detection, mitigation, operational impact, and verification for each phase of operation.</p>
        </SectionHeader>
        <NodeExplorer nodes={nodes} ariaLabel="Select a flight phase to explore" trackEventPrefix="bcs_flight_phase" />
      </div>
    </section>
  );
}
