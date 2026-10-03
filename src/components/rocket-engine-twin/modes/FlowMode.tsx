// FLOW: what moves through the engine, drawn along the pipes it moves in.
import { FLOWS } from "../data/engineReference";
import { ATMOSPHERES, FLOW_STAGES, PRESSURE_LEVELS, SCALE_NOTES } from "../data/twinContent";
import { useRocketTwinStore } from "../state/twinStore";
import { Action, Panel, Steps } from "../ui/panels";
import ui from "../twin3d.module.css";

export function FlowLeft() {
  const flowId = useRocketTwinStore((s) => s.flow);
  const audience = useRocketTwinStore((s) => s.audience);
  const pressure = useRocketTwinStore((s) => s.pressure);
  const cooled = useRocketTwinStore((s) => s.cooled);
  const atmosphere = useRocketTwinStore((s) => s.atmosphere);
  const flow = FLOWS.find((f) => f.id === flowId);
  if (!flow || !flowId) return null;
  const note = flowId === "cooling" ? SCALE_NOTES.cooling : flowId === "hot_gas" ? SCALE_NOTES.combustion : null;
  return (
    <Panel title={`${flow.name.toUpperCase()} FLOW`} tag={!cooled ? SCALE_NOTES.comparison : undefined}>
      <Steps steps={FLOW_STAGES[flowId]} label={`${flow.name} path`} />
      {flowId === "propellant" && (
        <ul className={ui.legend} aria-label="Propellant colours">
          <li data-swatch="fuel">FUEL</li>
          <li data-swatch="oxidiser">OXIDISER</li>
        </ul>
      )}
      {pressure && (
        <div className={ui.ramp} role="img" aria-label="Pressure scale: low, medium, high">
          {PRESSURE_LEVELS.map((level) => (
            <span key={level}>{level}</span>
          ))}
        </div>
      )}
      {pressure && audience === "engineer" && <p className={ui.small}>Fraction of the highest pressure in the reference model: inlets 0.1, pump discharge 1.0, after the cooling jacket 0.7. Normalised, not engine data.</p>}
      {flowId === "cooling" && <p className={ui.line}>{cooled ? "The coolant warms as it climbs. The wall stays within its limit." : "Without coolant the wall's heat load climbs at once."}</p>}
      {flowId === "hot_gas" && <p className={ui.line}>{ATMOSPHERES.find((a) => a.id === atmosphere)?.text}</p>}
      {note && <p className={ui.note}>{note}</p>}
      {audience === "engineer" && <p className={ui.note}>{SCALE_NOTES.flow}</p>}
    </Panel>
  );
}

export function FlowDock() {
  const flowId = useRocketTwinStore((s) => s.flow);
  const pressure = useRocketTwinStore((s) => s.pressure);
  const cooled = useRocketTwinStore((s) => s.cooled);
  const atmosphere = useRocketTwinStore((s) => s.atmosphere);
  const store = useRocketTwinStore.getState();
  return (
    <div className={ui.controls}>
      <div className={ui.group} role="group" aria-label="Flow">
        {FLOWS.map((f) => (
          <Action key={f.id} pressed={flowId === f.id} label={f.ariaLabel} onClick={() => store.selectFlow(f.id)}>
            <span className={ui.dot} data-flow={f.id} aria-hidden="true" />
            {f.name.toUpperCase()}
          </Action>
        ))}
      </div>
      {(flowId === "propellant" || flowId === "cooling") && (
        <Action pressed={pressure} label="Show pressure along the fluid network" onClick={store.togglePressure}>
          PRESSURE
        </Action>
      )}
      {flowId === "cooling" && (
        <div className={ui.group} role="group" aria-label="Cooling comparison">
          <Action pressed={cooled} onClick={store.restoreCooling}>
            WITH COOLING
          </Action>
          <Action pressed={!cooled} label="Without cooling: a short simulated comparison" onClick={store.runCoolingComparison}>
            WITHOUT COOLING
          </Action>
        </div>
      )}
      {flowId === "hot_gas" && (
        <div className={ui.group} role="group" aria-label="Ambient pressure reference">
          {ATMOSPHERES.map((a) => (
            <Action key={a.id} pressed={atmosphere === a.id} onClick={() => store.setAtmosphere(a.id)}>
              {a.label}
            </Action>
          ))}
        </div>
      )}
      {!flowId && <p className={ui.hint}>Choose a flow to follow it through the engine</p>}
    </div>
  );
}
