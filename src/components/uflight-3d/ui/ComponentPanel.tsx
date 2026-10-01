import { Activity, ArrowLeft, Bug, Copy, Focus, Waypoints } from "lucide-react";
import type { MonitoredSystemId } from "../types";
import { COMPONENTS, assemblyOf, hierarchyOf } from "../data/componentDefinitions";
import { sensorsOn } from "../data/sensorDefinitions";
import { FLOW_COLOR, MONITORED_SYSTEMS, PROVENANCE, SYSTEMS } from "../data/uflightReferenceAircraft";
import { componentHealth } from "../simulation/hums";
import { useUFlightStore } from "../state/uflightStore";
import { StateBadge, Values } from "./common";
import { MAINTENANCE_NEED, MISSION_IMPACT, componentTelemetry } from "./liveValues";
import ui from "../uflight.module.css";

const isMonitored = (system: string): system is MonitoredSystemId => (MONITORED_SYSTEMS as readonly string[]).includes(system);

/**
 * Details for the selected component. Executive: what it is, its health and
 * what that means for the mission and for maintenance. Engineer: its role,
 * where it sits in the hierarchy and the telemetry behind the state.
 */
export default function ComponentPanel() {
  const id = useUFlightStore((s) => s.selectedComponent);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const isolated = useUFlightStore((s) => s.isolatedComponent);
  const snapshot = useUFlightStore((s) => s.telemetry.snapshot);
  const faultSeverity = useUFlightStore((s) => s.faultSeverity);
  const isolate = useUFlightStore((s) => s.isolateComponent);
  const goBack = useUFlightStore((s) => s.goBack);
  const setMode = useUFlightStore((s) => s.setMode);
  const setHealthView = useUFlightStore((s) => s.setHealthView);
  const setSensorCategory = useUFlightStore((s) => s.setSensorCategory);
  const startTrace = useUFlightStore((s) => s.startTrace);
  const startFault = useUFlightStore((s) => s.startFault);
  const viewTwin = useUFlightStore((s) => s.viewTwin);
  if (!id) return null;

  const component = COMPONENTS[id];
  const system = SYSTEMS[component.system];
  const health = componentHealth(snapshot.twin, id);
  const assembly = assemblyOf(id);
  const isIsolated = isolated === id;
  const sensors = sensorsOn(id);
  const scenario = assembly === "propulsion-unit-04" ? "bearing-degradation" : id === "battery-module-03" || id === "battery-pack-left" ? "battery-imbalance" : null;

  const viewSensors = () => {
    setMode("health");
    setHealthView("sensors");
    setSensorCategory(sensors[0].category);
  };

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="component-title" data-testid="component-panel" style={{ "--accent": FLOW_COLOR[system.flow] } as React.CSSProperties}>
      {engineer ? (
        <ol className={ui.breadcrumb} aria-label="Position in the aircraft">
          {hierarchyOf(id).map((step, i) => (
            <li key={i}>{i === 1 ? SYSTEMS[component.system].name : step}</li>
          ))}
        </ol>
      ) : (
        <p className={ui.panelEyebrow}>
          <span className={ui.accentDot} aria-hidden="true" />
          {system.name}
        </p>
      )}
      <h2 id="component-title" className={ui.panelTitle}>
        {component.name.toUpperCase()}
      </h2>
      <p className={ui.panelSubtitle}>{component.type}</p>
      <p className={ui.panelText}>{engineer ? component.role : component.purpose}</p>

      <Values
        rows={[
          { label: engineer ? "State" : "Health", value: <StateBadge state={health.state} /> },
          { label: "Mission impact", value: MISSION_IMPACT[health.state] },
          { label: "Availability", value: health.available ? "AVAILABLE" : "UNAVAILABLE" },
          { label: "Maintenance", value: MAINTENANCE_NEED[health.state] },
        ]}
      />

      {engineer && (
        <div className={ui.panelSection}>
          <p className={ui.panelHeading}>Telemetry</p>
          <Values rows={componentTelemetry(id, snapshot, faultSeverity)} />
          <p className={ui.panelNote}>{PROVENANCE.data}</p>
        </div>
      )}

      <div className={ui.panelActions}>
        <button type="button" className={ui.action} aria-pressed={isIsolated} onClick={() => isolate(isIsolated ? null : id)}>
          <Focus size={14} aria-hidden="true" /> ISOLATE
        </button>
        {sensors.length > 0 && (
          <>
            <button type="button" className={ui.action} onClick={viewSensors}>
              <Activity size={14} aria-hidden="true" /> VIEW SENSORS
            </button>
            <button type="button" className={ui.action} onClick={() => startTrace(sensors[0].id)}>
              <Waypoints size={14} aria-hidden="true" /> TRACE HEALTH DATA
            </button>
          </>
        )}
        {scenario && (
          <button type="button" className={ui.action} data-track-event={scenario === "bearing-degradation" ? "uflight_3d_bearing_fault" : "uflight_3d_battery_fault"} data-track-source="component_panel" onClick={() => startFault(scenario, true)}>
            <Bug size={14} aria-hidden="true" /> RUN FAULT DEMO
          </button>
        )}
        {isMonitored(component.system) && (
          <button type="button" className={ui.action} data-track-event="uflight_3d_twin_mode" data-track-source="component_panel" onClick={() => viewTwin(component.system as MonitoredSystemId)}>
            <Copy size={14} aria-hidden="true" /> VIEW TWIN
          </button>
        )}
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={goBack}>
          <ArrowLeft size={14} aria-hidden="true" /> BACK
        </button>
      </div>
    </aside>
  );
}
