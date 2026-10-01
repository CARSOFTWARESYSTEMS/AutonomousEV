import { ArrowLeft, Focus, Play, Waypoints } from "lucide-react";
import { COMPONENTS, type ValueRow } from "../data/componentDefinitions";
import { SATELLITE_REFERENCE, SUBSYSTEMS } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import { rowValue } from "./liveValues";
import ui from "../explorer.module.css";

function Values({ rows }: { rows: readonly ValueRow[] }) {
  const telemetry = useExplorerStore((s) => s.telemetry);
  return (
    <dl className={ui.values}>
      {rows.map((row) => (
        <div key={row.label} className={ui.valueRow}>
          <dt>{row.label}</dt>
          <dd>
            {rowValue(row, telemetry)}
            {row.live && (
              <span className={ui.simulated} title="Simulated value">
                SIM
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Details for the selected component. Learn mode: one sentence and a couple
 * of values. Engineer mode: role, reference figures and interfaces.
 */
export default function ComponentPanel() {
  const id = useExplorerStore((s) => s.selectedComponent);
  const learnMode = useExplorerStore((s) => s.learnMode);
  const isolated = useExplorerStore((s) => s.isolatedComponent);
  const isolate = useExplorerStore((s) => s.isolateComponent);
  const animate = useExplorerStore((s) => s.animateComponent);
  const showFlow = useExplorerStore((s) => s.showFlowFor);
  const goBack = useExplorerStore((s) => s.goBack);
  if (!id) return null;

  const component = COMPONENTS[id];
  const subsystem = SUBSYSTEMS[component.subsystem];
  const engineer = learnMode === "engineer";
  const isIsolated = isolated === id;
  const hasFlow = component.subsystem !== "structure" && component.subsystem !== "thermal";

  return (
    <aside className={ui.panel} aria-labelledby="component-title" data-testid="component-panel" style={{ "--accent": subsystem.accent } as React.CSSProperties}>
      <p className={ui.panelEyebrow}>
        <span className={ui.accentDot} aria-hidden="true" />
        {subsystem.name}
      </p>
      <h2 id="component-title" className={ui.panelTitle}>
        {engineer ? component.name.toUpperCase() : component.label}
      </h2>
      <p className={ui.panelText}>{engineer ? component.role : component.purpose}</p>

      <Values rows={engineer ? component.engineerValues : component.learnValues} />

      {engineer && (
        <dl className={ui.values}>
          <div className={ui.valueRow}>
            <dt>Interfaces</dt>
            <dd>{component.interfaces}</dd>
          </div>
        </dl>
      )}

      <p className={ui.provenance}>{SATELLITE_REFERENCE.provenance.values}</p>

      <div className={ui.panelActions}>
        <button type="button" className={ui.action} aria-pressed={isIsolated} onClick={() => isolate(isIsolated ? null : id)}>
          <Focus size={14} aria-hidden="true" /> ISOLATE
        </button>
        <button type="button" className={ui.action} onClick={() => animate(id)}>
          <Play size={14} aria-hidden="true" /> ANIMATE
        </button>
        {hasFlow && (
          <button type="button" className={ui.action} onClick={() => showFlow(id)}>
            <Waypoints size={14} aria-hidden="true" /> {component.subsystem === "power" ? "SEE POWER FLOW" : "SHOW FLOW"}
          </button>
        )}
        <button type="button" className={ui.action} onClick={goBack}>
          <ArrowLeft size={14} aria-hidden="true" /> BACK
        </button>
      </div>
    </aside>
  );
}
