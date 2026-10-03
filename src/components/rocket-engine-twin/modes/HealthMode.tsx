// HEALTH: state shown on the engine, not on a wall of gauges. A handful of
// top-level groups, a drill-down that names every level from engine to state,
// and the bearing degradation scenario as one visual sequence.
import { SENSORS, SYSTEM_BY_ID } from "../data/engineReference";
import { BEARING_STAGES, FEATURE_BY_SENSOR, HEALTH_GROUPS, HEALTH_LABEL, HEALTH_LEVELS, SCALE_NOTES } from "../data/twinContent";
import { frame } from "../scene/frameState";
import { diagnose, healthState } from "../simulation/bearingFault";
import { useSampled } from "../state/clocks";
import { groupHealth } from "../state/selectors";
import { useRocketTwinStore } from "../state/twinStore";
import type { SensorId, SignalView, SystemId } from "../types";
import { SignalChart } from "../ui/charts";
import { Action, Panel, Rows } from "../ui/panels";
import { SensorFilters } from "./ControlMode";
import ui from "../twin3d.module.css";

const readFault = () => ({ severity: Math.round(frame.severity * 100) / 100, phase: Math.round(frame.now * 4) / 10 });
/** The sensor that speaks for a system that carries none of its own. */
const SENSOR_FOR: Partial<Record<SystemId, SensorId>> = { propellant_feed: "pump_discharge_pressure", nozzle: "chamber_pressure", engine_control: "valve_position", instrumentation: "chamber_pressure", turbomachinery: "pump_vibration" };

export function HealthLeft() {
  const system = useRocketTwinStore((s) => s.healthSystem);
  const faultActive = useRocketTwinStore((s) => s.bearing !== null);
  const setHealthSystem = useRocketTwinStore((s) => s.setHealthSystem);
  const { severity } = useSampled(readFault, 3);

  if (system) {
    const definition = SYSTEM_BY_ID[system];
    const faulted = system === "turbomachinery" && faultActive;
    const sensor = SENSORS.find((s) => s.id === (SENSOR_FOR[system] ?? SENSORS.find((x) => x.system === system)?.id));
    const health = faulted ? healthState(severity) : "nominal";
    const values = ["Reference engine", definition.name, system === "turbomachinery" ? "Fuel turbopump" : definition.name, system === "turbomachinery" ? "Bearing region" : definition.components[0].name, sensor?.name ?? "None", sensor ? FEATURE_BY_SENSOR[sensor.type] : "None", HEALTH_LABEL[health]];
    return (
      <Panel title="HEALTH HIERARCHY" onClose={() => setHealthSystem(null)}>
        <Rows rows={HEALTH_LEVELS.map((level, i) => ({ label: level, value: values[i], state: i === HEALTH_LEVELS.length - 1 ? health : undefined }))} />
      </Panel>
    );
  }

  return (
    <nav className={ui.list} aria-label="Engine health by system">
      {HEALTH_GROUPS.map((group) => {
        const health = groupHealth(group.id, faultActive, severity);
        return (
          <button key={group.id} type="button" className={ui.listItem} aria-label={`${group.label}: ${HEALTH_LABEL[health]}. Open`} onClick={() => setHealthSystem(group.systems[0])}>
            <span>{group.label}</span>
            <span className={ui.state} data-state={health}>
              {HEALTH_LABEL[health]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const VIEWS: readonly SignalView[] = ["time", "frequency", "trend"];

export function HealthRight() {
  const stage = useRocketTwinStore((s) => s.bearing);
  const audience = useRocketTwinStore((s) => s.audience);
  const view = useRocketTwinStore((s) => s.signalView);
  const store = useRocketTwinStore.getState();
  const { severity, phase } = useSampled(readFault, 8);
  if (stage === null) return null;

  const engineer = audience === "engineer";
  // The earliest change is only called out to an engineer; a learner sees it once it is an anomaly.
  const shown = BEARING_STAGES.filter((s) => engineer || !s.engineerOnly);
  const current = [...shown].reverse().find((s) => BEARING_STAGES.findIndex((x) => x.id === s.id) <= BEARING_STAGES.findIndex((x) => x.id === stage)) ?? shown[0];
  const diagnosis = diagnose(severity);
  const detected = stage === "anomaly" || stage === "diagnosis";

  return (
    <Panel title="BEARING REGION" tag={SCALE_NOTES.signal} label="Bearing degradation scenario">
      <p className={ui.state} data-state={healthState(severity)} role="status">
        {current.label}
      </p>
      <p className={ui.line}>{current.learn}</p>
      <div className={ui.group} role="group" aria-label="Signal view">
        {VIEWS.map((v) => (
          <Action key={v} pressed={view === v} onClick={() => store.setSignalView(v)}>
            {v.toUpperCase()}
          </Action>
        ))}
      </div>
      <SignalChart view={engineer ? view : "time"} severity={severity} phase={phase} />
      {detected && (
        <div className={ui.card} role="group" aria-label="Diagnosis">
          <p className={ui.groupLabel}>DIAGNOSIS</p>
          <p className={ui.line}>{diagnosis.finding.toUpperCase()}</p>
          <ul className={ui.evidence} aria-label="Evidence">
            {diagnosis.evidence.map((e) => (
              <li key={e.label} data-present={e.present}>
                {e.label}
              </li>
            ))}
          </ul>
          <Rows rows={[{ label: "CONFIDENCE", value: diagnosis.confidence }]} />
        </div>
      )}
      <div className={ui.actions}>
        <Action primary onClick={store.viewInTwin}>
          VIEW IN DIGITAL TWIN
        </Action>
        <Action onClick={store.clearBearingFault}>RESET</Action>
      </div>
    </Panel>
  );
}

export function HealthDock() {
  const stage = useRocketTwinStore((s) => s.bearing);
  const introduce = useRocketTwinStore((s) => s.introduceBearingFault);
  return (
    <div className={ui.controls}>
      <SensorFilters />
      {stage === null && (
        <Action primary label="Introduce bearing degradation: a simulated fault scenario" onClick={introduce}>
          INTRODUCE BEARING DEGRADATION
        </Action>
      )}
    </div>
  );
}
