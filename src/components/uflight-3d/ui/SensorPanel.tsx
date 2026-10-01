import { ArrowLeft, Square, Waypoints } from "lucide-react";
import { COMPONENTS } from "../data/componentDefinitions";
import { SIGNAL_NOTE, TRACE_STEPS, TRACE_STEP_S, traceDetail } from "../data/healthDefinitions";
import { getSensor } from "../data/sensorDefinitions";
import { PROVENANCE } from "../data/uflightReferenceAircraft";
import { residualLabel, sensorReading, tracePath } from "../simulation/hums";
import { useUFlightStore } from "../state/uflightStore";
import { Values, useElapsed } from "./common";
import ui from "../uflight.module.css";

/**
 * The selected sensor, and TRACE: its signal followed from the sensor through
 * acquisition, edge processing, feature extraction, the health model,
 * diagnosis and prognosis to a maintenance action.
 */
export default function SensorPanel() {
  const id = useUFlightStore((s) => s.selectedSensor);
  const trace = useUFlightStore((s) => s.trace);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const twin = useUFlightStore((s) => s.telemetry.snapshot.twin);
  const startTrace = useUFlightStore((s) => s.startTrace);
  const stopTrace = useUFlightStore((s) => s.stopTrace);
  const selectSensor = useUFlightStore((s) => s.selectSensor);
  const tracing = trace !== null && trace.sensorId === id;
  const elapsed = useElapsed(tracing ? trace.startedAt : null);

  const sensor = id ? getSensor(id) : undefined;
  if (!sensor) return null;

  const reading = sensorReading(twin, sensor.id);
  const path = tracePath(sensor);
  // The trace holds on the last step once it has been reached.
  const active = tracing ? Math.min(TRACE_STEPS.length - 1, Math.floor(elapsed / TRACE_STEP_S)) : -1;

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="sensor-title" data-testid="sensor-panel">
      <p className={ui.panelEyebrow}>
        <span className={ui.accentDot} aria-hidden="true" style={{ "--accent": "var(--uf-health)" } as React.CSSProperties} />
        SENSOR · {sensor.category.toUpperCase()}
      </p>
      <h2 id="sensor-title" className={`${ui.panelTitle} ${ui.mono}`}>
        {sensor.id}
      </h2>
      <p className={ui.panelSubtitle}>{sensor.name}</p>

      <Values
        rows={[
          { label: "Mounted on", value: COMPONENTS[sensor.component].name },
          { label: "Tells us about", value: SIGNAL_NOTE[sensor.kind] },
          ...(engineer
            ? [
                { label: "Acquisition", value: COMPONENTS[sensor.node].name.replace("Acquisition Node, ", "") },
                ...(reading
                  ? [
                      { label: "Reading", value: reading.value.toFixed(2), unit: sensor.unitOfMeasure, simulated: true },
                      ...(reading.expected ? [{ label: "Residual", value: residualLabel(reading.value, reading.expected).toUpperCase() }] : []),
                    ]
                  : []),
                { label: "Network", value: sensor.flightCritical ? "FLIGHT CRITICAL + HEALTH" : "HEALTH" },
              ]
            : []),
        ]}
      />

      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Health data path</p>
        <ol className={ui.steps} aria-label="Health data path" data-testid="trace-steps">
          {TRACE_STEPS.map((step, i) => (
            <li key={step.id} className={ui.step} data-state={i < active ? "done" : i === active ? "active" : undefined} aria-current={i === active ? "step" : undefined}>
              <span className={ui.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
              <span className={ui.stepLabel}>{step.label}</span>
              {(i === active || (!tracing && engineer)) && (
                <span className={ui.stepText}>
                  {engineer ? traceDetail(step, sensor.feature) : step.text}
                  {engineer && ` · ${COMPONENTS[path[i].component].name}`}
                </span>
              )}
            </li>
          ))}
        </ol>
        {tracing && (
          <p className={ui.panelNote} role="status">
            {active === TRACE_STEPS.length - 1 ? "TRACE COMPLETE" : `TRACING · STEP ${active + 1} OF ${TRACE_STEPS.length}`} · {PROVENANCE.scenario}
          </p>
        )}
      </div>

      <div className={ui.panelActions}>
        {tracing ? (
          <button type="button" className={ui.action} onClick={stopTrace}>
            <Square size={12} aria-hidden="true" /> STOP TRACE
          </button>
        ) : (
          <button type="button" className={`${ui.action} ${ui.actionPrimary}`} data-track-event="uflight_3d_sensor_trace" data-track-source="sensor_panel" onClick={() => startTrace(sensor.id)}>
            <Waypoints size={14} aria-hidden="true" /> TRACE
          </button>
        )}
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={() => selectSensor(null)}>
          <ArrowLeft size={14} aria-hidden="true" /> BACK
        </button>
      </div>
    </aside>
  );
}
