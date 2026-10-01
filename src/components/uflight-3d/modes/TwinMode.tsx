// TWIN: not a second aircraft, but four states of the same one — what is
// OBSERVED, what is ESTIMATED, what is EXPECTED of a healthy aircraft and what
// is PREDICTED — compared for one system, at any point on the time control.
import { HEALTH_TABLE_LABEL, MONITORED_SYSTEMS, PROVENANCE } from "../data/uflightReferenceAircraft";
import { HORIZON_CYCLES, maintenanceWindow } from "../simulation/prognostics";
import { TWIN_SUBJECTS, formatRange, formatValue, twinReadout } from "../simulation/twin";
import { useUFlightStore } from "../state/uflightStore";
import { PrognosisChart } from "../ui/charts";
import { StateBadge, Values } from "../ui/common";
import { ConfigurationControl } from "./AircraftMode";
import ui from "../uflight.module.css";

const STATES: readonly [string, string][] = [
  ["OBSERVED", "What the sensors report."],
  ["ESTIMATED", "Internal state inferred from models."],
  ["EXPECTED", "Healthy reference behaviour."],
  ["PREDICTED", "Future health trajectory."],
];

/** Which system the twin compares, and what the four states are. */
export function TwinSystems() {
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const twinSystem = useUFlightStore((s) => s.twinSystem);
  const setTwinSystem = useUFlightStore((s) => s.setTwinSystem);
  return (
    <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="twin-title" data-testid="twin-systems">
      <p className={ui.panelEyebrow}>DIGITAL TWIN</p>
      <h2 id="twin-title" className={ui.panelTitle}>
        FOUR STATES OF ONE AIRCRAFT
      </h2>
      <dl className={ui.values}>
        {STATES.map(([name, text]) => (
          <div key={name} className={ui.valueRow}>
            <dt>{name}</dt>
            <dd style={{ fontWeight: 400, letterSpacing: 0 }}>{text}</dd>
          </div>
        ))}
      </dl>
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Compare</p>
        <div className={ui.table} role="group" aria-label="System to compare">
          {MONITORED_SYSTEMS.map((id) => (
            <button key={id} type="button" className={ui.row} aria-pressed={twinSystem === id} onClick={() => setTwinSystem(id)}>
              <span className={ui.rowLabel}>{HEALTH_TABLE_LABEL[id]}</span>
              <StateBadge state={twin.systems[id].state} quiet={twin.systems[id].state === "NOMINAL"} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const cycleLabel = (cycles: number) => (cycles === 0 ? "NOW" : `${cycles > 0 ? "+" : "−"}${Math.abs(cycles)} cycles`);

/** PAST — NOW — FUTURE, in flight cycles. */
export default function TwinControls() {
  const predictionTime = useUFlightStore((s) => s.predictionTime);
  const setPredictionTime = useUFlightStore((s) => s.setPredictionTime);
  return (
    <div className={ui.controlStrip} role="group" aria-label="Twin time control">
      <label className={`${ui.slider} ${ui.sliderWide}`}>
        <span className={ui.label}>PAST</span>
        <input
          type="range"
          min={-HORIZON_CYCLES}
          max={HORIZON_CYCLES}
          step={5}
          value={predictionTime}
          aria-label="Twin time: flight cycles from now, past to future"
          aria-valuetext={cycleLabel(predictionTime)}
          onChange={(e) => setPredictionTime(Number(e.target.value))}
        />
        <span className={ui.label}>FUTURE</span>
      </label>
      <div className={ui.controlGroup}>
        <span className={ui.timelineStage} data-testid="twin-time">
          {cycleLabel(predictionTime)}
        </span>
        {predictionTime !== 0 && (
          <button type="button" className={ui.action} onClick={() => setPredictionTime(0)}>
            RETURN TO NOW
          </button>
        )}
        <ConfigurationControl />
      </div>
    </div>
  );
}

/** Observed, expected, residual, state, trend and projection for the compared system. */
export function TwinPanel() {
  const system = useUFlightStore((s) => s.twinSystem);
  const predictionTime = useUFlightStore((s) => s.predictionTime);
  const inputs = useUFlightStore((s) => s.telemetry.inputs);
  const snapshot = useUFlightStore((s) => s.telemetry.snapshot);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const subject = TWIN_SUBJECTS[system];
  const readout = twinReadout(inputs, snapshot, system, predictionTime);
  const places = subject.places;
  const applies = readout.trajectory !== null;
  const severity = applies ? inputs.faults.severity : 0;
  const established = applies && (snapshot.bearing.anomaly || snapshot.battery.fault.anomaly);

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="twin-panel-title" data-testid="twin-panel">
      <p className={ui.panelEyebrow}>
        {HEALTH_TABLE_LABEL[system]} · {cycleLabel(predictionTime)}
      </p>
      <h2 id="twin-panel-title" className={ui.panelTitle}>
        {subject.title}
      </h2>
      <p className={ui.panelSubtitle}>Compared on {subject.quantity}</p>

      <Values
        rows={[
          {
            label: readout.valueLabel,
            value: formatValue(readout.value, places),
            unit: readout.valueBand ? `${subject.unit} (${formatValue(readout.valueBand.low, places)}–${formatValue(readout.valueBand.high, places)})` : subject.unit,
            simulated: true,
          },
          ...(readout.expected ? [{ label: "Expected range", value: formatRange(readout.expected, places), unit: subject.unit }] : []),
          { label: "Residual", value: readout.residual.toUpperCase() },
          ...(engineer && readout.estimate ? [{ label: `Estimated · ${readout.estimate.label}`, value: formatValue(readout.estimate.value, readout.estimate.places), unit: readout.estimate.unit, simulated: true }] : []),
          { label: "State", value: <StateBadge state={readout.state} /> },
          { label: "Trend", value: readout.trend },
          { label: "Projection", value: readout.projection },
        ]}
      />

      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Prediction</p>
        <PrognosisChart severity={severity} window={established ? maintenanceWindow(severity) : null} cursor={predictionTime} subject={subject.title.toLowerCase()} />
        <Values rows={[{ label: "Maintenance window", value: readout.window }]} />
      </div>
      <p className={ui.panelNote}>
        {PROVENANCE.data} · {inputs.config.toUpperCase()} CONDITION
      </p>
    </aside>
  );
}
