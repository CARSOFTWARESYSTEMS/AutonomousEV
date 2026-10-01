// ARCHITECTURE: how data moves through the aircraft, and how it stays
// available when something is lost. Three views: the data architecture with
// its network filters, the flight-compute redundancy reference, and the
// navigation redundancy reference.
import { DATA_ARCHITECTURE, FLIGHT_COMPUTE_CHANNELS, NAV_SOURCES, NETWORK_FILTERS } from "../data/healthDefinitions";
import { FLOW_COLOR, PROVENANCE } from "../data/uflightReferenceAircraft";
import { type ArchitectureView, useUFlightStore } from "../state/uflightStore";
import { Chain, StateBadge, Values, VehicleBadge } from "../ui/common";
import ui from "../uflight.module.css";

const VIEWS: readonly { id: ArchitectureView; label: string }[] = [
  { id: "data", label: "DATA ARCHITECTURE" },
  { id: "redundancy", label: "REDUNDANCY" },
  { id: "navigation", label: "NAVIGATION" },
];

export default function ArchitectureControls() {
  const view = useUFlightStore((s) => s.architectureView);
  const networkFilter = useUFlightStore((s) => s.networkFilter);
  const setArchitectureView = useUFlightStore((s) => s.setArchitectureView);
  const setNetworkFilter = useUFlightStore((s) => s.setNetworkFilter);
  return (
    <div className={ui.controlStrip} role="group" aria-label="Architecture controls">
      <div className={ui.segmented} role="group" aria-label="Architecture view">
        {VIEWS.map(({ id, label }) => (
          <button key={id} type="button" className={ui.segment} aria-pressed={view === id} onClick={() => setArchitectureView(id)}>
            {label}
          </button>
        ))}
      </div>
      {view === "data" && (
        <div className={ui.tabs} role="group" aria-label="Network filter">
          {NETWORK_FILTERS.map(({ id, label }) => (
            <button key={id} type="button" className={ui.tab} aria-pressed={networkFilter === id} onClick={() => setNetworkFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Left-hand panel: the chain the view is built on. */
export function ArchitectureChain() {
  const view = useUFlightStore((s) => s.architectureView);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");

  if (view === "redundancy") {
    return (
      <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-title">
        <p className={ui.panelEyebrow}>FAULT-TOLERANT ARCHITECTURE</p>
        <h2 id="architecture-title" className={ui.panelTitle}>
          THREE CHANNELS, ONE COMMAND
        </h2>
        <p className={ui.panelText}>Every critical input reaches all three flight-compute channels. A voting / agreement layer compares their outputs and produces the command. The channels sit in different parts of the aircraft.</p>
        <div className={ui.panelSection}>
          <Chain nodes={["Critical inputs", "FCC-A · FCC-B · FCC-C", "Voting / agreement", "Command output"]} accent={FLOW_COLOR.control} label="Flight-compute redundancy" />
        </div>
        <p className={ui.panelNote}>{PROVENANCE.architecture}</p>
      </section>
    );
  }
  if (view === "navigation") {
    return (
      <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-title">
        <p className={ui.panelEyebrow}>NAVIGATION REDUNDANCY</p>
        <h2 id="architecture-title" className={ui.panelTitle}>
          SEVEN SOURCES, ONE SOLUTION
        </h2>
        <p className={ui.panelText}>The navigation processor fuses independent sources. Losing one degrades the solution; it does not remove it.</p>
        <div className={ui.panelSection}>
          <Values rows={NAV_SOURCES.map((s) => ({ label: s.label, value: s.contributes }))} />
        </div>
        <p className={ui.panelNote}>{PROVENANCE.architecture}</p>
      </section>
    );
  }
  return (
    <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-title" data-testid="data-architecture">
      <p className={ui.panelEyebrow}>DATA ARCHITECTURE</p>
      <h2 id="architecture-title" className={ui.panelTitle}>
        FROM SENSOR TO GROUND
      </h2>
      <ol className={ui.steps} aria-label="Data architecture, sensors to ground" style={{ marginTop: 12 }}>
        {DATA_ARCHITECTURE.map((stage, i) => (
          <li key={stage.id} className={ui.step}>
            <span className={ui.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
            <span className={ui.stepLabel}>{stage.label}</span>
            {engineer && <span className={ui.stepText}>{stage.text}</span>}
          </li>
        ))}
      </ol>
      <p className={ui.panelNote}>{PROVENANCE.conceptual}</p>
    </section>
  );
}

function Redundancy() {
  const voting = useUFlightStore((s) => s.telemetry.snapshot.voting);
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const failed = useUFlightStore((s) => s.fccBFailed);
  const toggle = useUFlightStore((s) => s.toggleChannelFailure);
  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-panel-title" data-testid="redundancy-panel">
      <p className={ui.panelEyebrow}>FLIGHT COMPUTE</p>
      <h2 id="architecture-panel-title" className={ui.headline} data-tone={voting.faultContained ? "anomaly" : undefined}>
        {voting.faultContained ? "FAULT CONTAINED" : "ALL CHANNELS AVAILABLE"}
      </h2>
      <Values
        rows={[
          ...FLIGHT_COMPUTE_CHANNELS.map((c) => ({ label: c.label, value: <StateBadge state={voting.channels[c.id] === "AVAILABLE" ? "NOMINAL" : "UNAVAILABLE"} label={voting.channels[c.id]} quiet={voting.channels[c.id] === "AVAILABLE"} /> })),
          { label: "Voting", value: voting.voting },
          { label: "Flight control", value: voting.flightControl },
          { label: "Vehicle", value: <VehicleBadge state={twin.vehicle} /> },
        ]}
      />
      <p className={ui.panelText}>{failed ? "Channels A and C still agree, so the command output is unchanged. The loss of margin limits the mission." : "Simulate the loss of one channel to see what the others do."}</p>
      <div className={ui.panelActions}>
        <button type="button" className={failed ? ui.action : `${ui.action} ${ui.actionPrimary}`} aria-pressed={failed} onClick={toggle}>
          {failed ? "RESTORE CHANNEL" : "SIMULATE CHANNEL FAILURE"}
        </button>
      </div>
      <p className={ui.panelNote}>{PROVENANCE.architecture}</p>
    </aside>
  );
}

function NavigationRedundancy() {
  const navigation = useUFlightStore((s) => s.telemetry.snapshot.navigation);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const unavailable = useUFlightStore((s) => s.gnssUnavailable);
  const toggle = useUFlightStore((s) => s.toggleGnss);
  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-panel-title" data-testid="navigation-panel">
      <p className={ui.panelEyebrow}>NAVIGATION</p>
      <h2 id="architecture-panel-title" className={ui.headline} data-tone={unavailable ? "anomaly" : undefined}>
        {unavailable ? "GNSS UNAVAILABLE" : "ALL SOURCES AVAILABLE"}
      </h2>
      <Values
        rows={[
          { label: "Navigation", value: <StateBadge state={navigation.state} /> },
          { label: "Position solution", value: navigation.positionSolution },
          ...(engineer ? [{ label: "Position uncertainty", value: navigation.uncertaintyM.toFixed(1), unit: "m", simulated: true }] : []),
        ]}
      />
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Sources</p>
        <Values
          rows={NAV_SOURCES.map((s) => ({
            label: s.label,
            value: <StateBadge state={navigation.sources[s.id] === "AVAILABLE" ? "NOMINAL" : "UNAVAILABLE"} label={navigation.sources[s.id]} quiet={navigation.sources[s.id] === "AVAILABLE"} />,
          }))}
        />
      </div>
      <p className={ui.panelText}>{unavailable ? "The navigation state remains available through the remaining sources, with a larger uncertainty." : "Remove GNSS to see what the remaining sources provide."}</p>
      <div className={ui.panelActions}>
        <button type="button" className={unavailable ? ui.action : `${ui.action} ${ui.actionPrimary}`} aria-pressed={unavailable} onClick={toggle}>
          {unavailable ? "RESTORE GNSS" : "GNSS UNAVAILABLE"}
        </button>
      </div>
      <p className={ui.panelNote}>{PROVENANCE.architecture}</p>
    </aside>
  );
}

function Networks() {
  const filter = useUFlightStore((s) => s.networkFilter);
  const info = NETWORK_FILTERS.find((f) => f.id === filter)!;
  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="architecture-panel-title" data-testid="network-panel">
      <p className={ui.panelEyebrow}>NETWORK</p>
      <h2 id="architecture-panel-title" className={ui.panelTitle}>
        {info.label}
      </h2>
      <p className={ui.panelText}>{info.text}</p>
      <ul className={ui.legend} aria-label="Route colours" style={{ flexDirection: "column", gap: 8, marginTop: 14 }}>
        <li>
          <span className={ui.swatchLine} style={{ "--swatch": FLOW_COLOR.control } as React.CSSProperties} aria-hidden="true" />
          FLIGHT CONTROL
        </li>
        <li>
          <span className={ui.swatchLine} style={{ "--swatch": FLOW_COLOR.data } as React.CSSProperties} aria-hidden="true" />
          DATA
        </li>
        <li>
          <span className={ui.swatchLine} style={{ "--swatch": FLOW_COLOR.health } as React.CSSProperties} aria-hidden="true" />
          HEALTH
        </li>
      </ul>
      <p className={ui.panelText}>Routes are drawn inside the aircraft, between the units that produce and use the data.</p>
      <p className={ui.panelNote}>{PROVENANCE.conceptual}</p>
    </aside>
  );
}

export function ArchitecturePanel() {
  const view = useUFlightStore((s) => s.architectureView);
  if (view === "redundancy") return <Redundancy />;
  if (view === "navigation") return <NavigationRedundancy />;
  return <Networks />;
}
