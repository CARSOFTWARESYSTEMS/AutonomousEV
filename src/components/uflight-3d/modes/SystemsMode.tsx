// SYSTEMS: one subsystem at a time. Selecting a system isolates its
// components, moves the camera, switches on its flow and opens a concise
// description — with the aircraft kept in view as context.
import { GitBranch } from "lucide-react";
import type { SystemId } from "../types";
import { componentsOf } from "../data/componentDefinitions";
import { FLIGHT_CONFIGS, FLOW_COLOR, PROPULSION_UNIT_DEPENDENCIES, PROVENANCE, SYSTEMS, SYSTEM_DEPENDENCIES, SYSTEM_ORDER, dependentsOf } from "../data/uflightReferenceAircraft";
import { LOAD_CASE_FOCUS, LOAD_PATH_LABEL } from "../simulation/structures";
import { THERMAL_LEGEND } from "../simulation/thermal";
import { useUFlightStore } from "../state/uflightStore";
import { Chain, Values } from "../ui/common";
import { Bars } from "../ui/charts";
import { AssemblySlider } from "./AircraftMode";
import ui from "../uflight.module.css";

const TRACK: Partial<Record<SystemId, string>> = { propulsion: "uflight_3d_propulsion", energy: "uflight_3d_energy" };

export default function SystemsControls() {
  const selected = useUFlightStore((s) => s.selectedSystem) ?? "propulsion";
  const showDependencies = useUFlightStore((s) => s.showDependencies);
  const selectSystem = useUFlightStore((s) => s.selectSystem);
  const toggleDependencies = useUFlightStore((s) => s.toggleDependencies);
  return (
    <div className={ui.controlStrip} role="group" aria-label="System controls">
      <div className={ui.tabs} role="tablist" aria-label="Systems">
        {SYSTEM_ORDER.map((id) => (
          <button key={id} type="button" role="tab" className={ui.tab} aria-selected={selected === id} data-track-event={TRACK[id]} data-track-source="system_tabs" onClick={() => selectSystem(id)}>
            {SYSTEMS[id].name}
          </button>
        ))}
      </div>
      <div className={ui.controlGroup}>
        <button type="button" className={ui.action} aria-pressed={showDependencies} onClick={toggleDependencies}>
          <GitBranch size={14} aria-hidden="true" /> DEPENDENCIES
        </button>
        <AssemblySlider />
      </div>
    </div>
  );
}

function LoadCase() {
  const flightConfig = useUFlightStore((s) => s.flightConfig);
  const setFlightConfig = useUFlightStore((s) => s.setFlightConfig);
  const loads = useUFlightStore((s) => s.telemetry.snapshot.structures.loads);
  const active = FLIGHT_CONFIGS.find((c) => c.id === flightConfig)!;
  return (
    <div className={ui.panelSection}>
      <p className={ui.panelHeading}>Load case</p>
      <div className={`${ui.segmented} ${ui.segmentedCompact}`} role="group" aria-label="Load case">
        {["hover", "transition", "cruise", "ground"].map((id) => {
          const config = FLIGHT_CONFIGS.find((c) => c.id === id)!;
          return (
            <button key={id} type="button" className={ui.segment} aria-pressed={flightConfig === id} onClick={() => setFlightConfig(config.id)}>
              {config.loadCase}
            </button>
          );
        })}
      </div>
      <p className={ui.panelText}>{active.caption}</p>
      <div style={{ marginTop: 12 }}>
        <Bars label="Relative load by structural element" labelWidth={128} rows={LOAD_CASE_FOCUS[flightConfig].map((id) => ({ label: LOAD_PATH_LABEL[id].toUpperCase(), value: loads[id] ?? 0 }))} />
      </div>
      <p className={ui.panelNote}>{PROVENANCE.visualization} · RELATIVE LOAD</p>
    </div>
  );
}

function ThermalLegend() {
  const thermal = useUFlightStore((s) => s.telemetry.snapshot.thermal);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  return (
    <div className={ui.panelSection}>
      <p className={ui.panelHeading}>Heat level</p>
      <ul className={ui.legend} aria-label="Heat levels">
        {THERMAL_LEGEND.map((c) => (
          <li key={c.id}>
            <span className={ui.swatch} style={{ "--swatch": c.color } as React.CSSProperties} aria-hidden="true" />
            {c.label}
          </li>
        ))}
      </ul>
      {engineer && (
        <Values
          rows={[
            { label: "Coolant in", value: thermal.coolantInC.toFixed(1), unit: "°C", simulated: true },
            { label: "Coolant out", value: thermal.coolantOutC.toFixed(1), unit: "°C", simulated: true },
            { label: "Heat rejected", value: thermal.heatRejectedKw.toFixed(1), unit: "kW", simulated: true },
          ]}
        />
      )}
      <p className={ui.panelText}>Set the configuration to HOVER or CRUISE to see the heat sources change.</p>
    </div>
  );
}

function Dependencies({ system }: { system: SystemId }) {
  const needs = SYSTEM_DEPENDENCIES[system];
  const provides = dependentsOf(system);
  return (
    <div className={ui.panelSection} data-testid="dependencies">
      <p className={ui.panelHeading}>Depends on</p>
      {needs.length > 0 ? (
        <Values rows={needs.map((d) => ({ label: SYSTEMS[d.on].name, value: d.provides }))} />
      ) : (
        <p className={ui.panelText}>Nothing: this system is a provider.</p>
      )}
      <p className={ui.panelHeading} style={{ marginTop: 14 }}>
        Provides to
      </p>
      {provides.length > 0 ? <Values rows={provides.map((d) => ({ label: SYSTEMS[d.system].name, value: d.provides }))} /> : <p className={ui.panelText}>No other system depends on it directly.</p>}
      {system === "propulsion" && (
        <>
          <p className={ui.panelHeading} style={{ marginTop: 14 }}>
            Each propulsion unit depends on
          </p>
          <Values rows={PROPULSION_UNIT_DEPENDENCIES.map((d) => ({ label: d.kind, value: d.from }))} />
        </>
      )}
    </div>
  );
}

export function SystemPanel() {
  const id = useUFlightStore((s) => s.selectedSystem) ?? "propulsion";
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const showDependencies = useUFlightStore((s) => s.showDependencies);
  const system = SYSTEMS[id];
  const accent = FLOW_COLOR[system.flow];

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="system-title" data-testid="system-panel" style={{ "--accent": accent } as React.CSSProperties}>
      <p className={ui.panelEyebrow}>
        <span className={ui.accentDot} aria-hidden="true" />
        SYSTEM
      </p>
      <h2 id="system-title" className={ui.panelTitle}>
        {system.name}
      </h2>
      <p className={ui.panelText}>{system.purpose}</p>

      {showDependencies ? (
        <Dependencies system={id} />
      ) : (
        <>
          <div className={ui.panelSection}>
            <p className={ui.panelHeading}>Architecture</p>
            <ul className={ui.list}>
              {system.architecture.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {id === "structures" ? (
            <LoadCase />
          ) : (
            <div className={ui.panelSection}>
              <p className={ui.panelHeading}>Flow</p>
              <Chain nodes={system.chain} accent={accent} label={`${system.name} flow`} />
            </div>
          )}
          {id === "thermal" && <ThermalLegend />}
          {engineer && (
            <div className={ui.panelSection}>
              <p className={ui.panelHeading}>Monitored</p>
              <ul className={ui.list}>
                {system.monitored.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <Values rows={[{ label: "Components", value: componentsOf(id).length }]} />
            </div>
          )}
        </>
      )}
      <p className={ui.panelNote}>{PROVENANCE.conceptual}</p>
    </aside>
  );
}
