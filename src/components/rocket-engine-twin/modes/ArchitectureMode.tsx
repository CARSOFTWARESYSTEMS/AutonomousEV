// ARCHITECTURE: how hardware, sensors, software, models, health logic and
// test evidence form one system. The layers are listed here and laid out
// around the engine; choosing one lights up the physical parts it concerns.
import { ARCHITECTURE_LAYERS, TRACEABILITY } from "../data/twinContent";
import { useRocketTwinStore } from "../state/twinStore";
import { Action, Panel } from "../ui/panels";
import ui from "../twin3d.module.css";

export function ArchitectureLeft() {
  const layer = useRocketTwinStore((s) => s.layer);
  const selectLayer = useRocketTwinStore((s) => s.selectLayer);
  const current = ARCHITECTURE_LAYERS.find((l) => l.id === layer);
  return (
    <nav className={ui.list} aria-label="Architecture layers, from hardware to evidence">
      {ARCHITECTURE_LAYERS.map((l) => (
        <button key={l.id} type="button" className={ui.listItem} data-layer="true" aria-pressed={layer === l.id} onClick={() => selectLayer(l.id)}>
          {l.name}
        </button>
      ))}
      <p className={ui.small} role="status">
        {current ? current.text : "Choose a layer to see which parts of the engine it concerns."}
      </p>
    </nav>
  );
}

export function ArchitectureRight() {
  const traceability = useRocketTwinStore((s) => s.traceability);
  const toggleTraceability = useRocketTwinStore((s) => s.toggleTraceability);
  if (!traceability) return null;
  return (
    <Panel title="TRACEABILITY" tag="REFERENCE REQUIREMENT" onClose={toggleTraceability}>
      <ol className={ui.chain}>
        {TRACEABILITY.map((step) => (
          <li key={step.level}>
            <span>{step.level}</span>
            {step.text}
          </li>
        ))}
      </ol>
      <p className={ui.note}>An educational requirement, not an engine specification.</p>
    </Panel>
  );
}

export function ArchitectureDock() {
  const traceability = useRocketTwinStore((s) => s.traceability);
  const toggleTraceability = useRocketTwinStore((s) => s.toggleTraceability);
  return (
    <div className={ui.controls}>
      <Action pressed={traceability} label="Traceability: from a requirement to its evidence" onClick={toggleTraceability}>
        TRACEABILITY
      </Action>
    </div>
  );
}
