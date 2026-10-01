// FAULT LAB: inject a fault and watch health monitoring work. Two scenarios
// are simulated — motor bearing degradation (the flagship) and battery module
// imbalance — each in seven stages from healthy to maintenance action.
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useState } from "react";
import type { ActiveFaultScenarioId, FaultCategory, FaultStage } from "../types";
import { FAULT_CATEGORIES, FAULT_SCENARIOS, FAULT_STAGES, MAINTENANCE_ACTIONS, NARRATIVE, SCENARIO_NOTE, getScenario, isActiveScenario } from "../data/faultScenarios";
import { MISSION_IMPACT_ROWS } from "../data/missionDefinition";
import { PROVENANCE } from "../data/uflightReferenceAircraft";
import { STAGE_DWELL_S, isLastStage, reached, stageIndex } from "../simulation/faultModels";
import { humsLabel } from "../simulation/hums";
import { describeWindow } from "../simulation/prognostics";
import { useUFlightStore } from "../state/uflightStore";
import { Bars, PrognosisChart } from "../ui/charts";
import { StateBadge, Values, VehicleBadge } from "../ui/common";
import SignalView from "../ui/SignalView";
import ui from "../uflight.module.css";

const TRACK: Record<ActiveFaultScenarioId, string> = { "bearing-degradation": "uflight_3d_bearing_fault", "battery-imbalance": "uflight_3d_battery_fault" };

/** Choose a scenario, by category. Scenarios planned for a later release are listed, not hidden. */
export function FaultSelector() {
  const [category, setCategory] = useState<FaultCategory | "all">("all");
  const startFault = useUFlightStore((s) => s.startFault);
  const scenarios = FAULT_SCENARIOS.filter((s) => category === "all" || s.category === category);
  return (
    <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="fault-lab-title" data-testid="fault-selector">
      <p className={ui.panelEyebrow}>FAULT LAB</p>
      <h2 id="fault-lab-title" className={ui.panelTitle}>
        INJECT A FAULT
      </h2>
      <p className={ui.panelText}>Follow one fault from the first change in a signal to the maintenance decision.</p>
      <div className={ui.tabs} role="group" aria-label="Fault category" style={{ justifyContent: "flex-start", marginTop: 12 }}>
        <button type="button" className={ui.tab} aria-pressed={category === "all"} onClick={() => setCategory("all")}>
          ALL
        </button>
        {FAULT_CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={ui.tab} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className={ui.steps} style={{ marginTop: 12, gap: 8 }}>
        {scenarios.map((scenario) =>
          isActiveScenario(scenario.id) ? (
            <button key={scenario.id} type="button" className={ui.scenario} data-track-event={TRACK[scenario.id]} data-track-source="fault_selector" onClick={() => startFault(scenario.id as ActiveFaultScenarioId)}>
              <span className={ui.scenarioSubject}>{scenario.subjectLabel}</span>
              <span className={ui.scenarioTitle}>{scenario.title}</span>
              <span className={ui.scenarioText}>{scenario.summary}</span>
            </button>
          ) : (
            <div key={scenario.id} className={ui.scenario} aria-disabled="true">
              <span className={ui.scenarioSubject}>
                {scenario.subjectLabel} <span className={ui.tag}>PLANNED</span>
              </span>
              <span className={ui.scenarioTitle}>{scenario.title}</span>
              <span className={ui.scenarioText}>{scenario.summary}</span>
            </div>
          ),
        )}
      </div>
      <p className={ui.panelNote}>{PROVENANCE.scenario}</p>
    </section>
  );
}

/** The seven stages of the running scenario; any stage can be opened directly. */
export function FaultStages() {
  const scenario = useUFlightStore((s) => s.faultScenario);
  const stage = useUFlightStore((s) => s.faultStage);
  const dispatch = useUFlightStore((s) => s.faultDispatch);
  const clearFault = useUFlightStore((s) => s.clearFault);
  if (!scenario) return <FaultSelector />;
  const info = getScenario(scenario);
  const narrative = NARRATIVE[scenario];
  return (
    <section className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="fault-stages-title" data-testid="fault-stages">
      <p className={ui.panelEyebrow}>{info.subjectLabel}</p>
      <h2 id="fault-stages-title" className={ui.panelTitle}>
        {info.title}
      </h2>
      <ol className={ui.steps} aria-label="Scenario stages" style={{ marginTop: 12 }}>
        {FAULT_STAGES.map((s, i) => (
          <li key={s}>
            <button type="button" className={ui.step} data-state={stageIndex(stage) > i ? "done" : undefined} aria-current={stage === s ? "step" : undefined} onClick={() => dispatch({ type: "GOTO", stage: s })}>
              <span className={ui.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
              <span className={ui.stepLabel}>{narrative[s].label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={ui.panelActions}>
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={clearFault}>
          <X size={14} aria-hidden="true" /> CLEAR FAULT
        </button>
      </div>
    </section>
  );
}

/** Previous, play and next for the running scenario. */
export default function FaultControls() {
  const scenario = useUFlightStore((s) => s.faultScenario);
  const stage = useUFlightStore((s) => s.faultStage);
  const playing = useUFlightStore((s) => s.faultPlaying);
  const dispatch = useUFlightStore((s) => s.faultDispatch);
  if (!scenario) return null;
  const label = NARRATIVE[scenario][stage].label;
  return (
    <div className={ui.controlStrip} role="group" aria-label="Scenario controls">
      <button type="button" className={ui.action} aria-label="Previous stage" disabled={stage === "HEALTHY"} onClick={() => dispatch({ type: "PREVIOUS" })}>
        <ChevronLeft size={14} aria-hidden="true" /> PREVIOUS
      </button>
      <button type="button" className={ui.action} aria-label={playing ? "Pause scenario" : "Play scenario"} title={`Each stage is held for ${STAGE_DWELL_S} seconds`} onClick={() => dispatch({ type: playing ? "PAUSE" : "PLAY" })}>
        {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />} {playing ? "PAUSE" : "PLAY"}
      </button>
      <p className={ui.timelineStage} data-testid="fault-stage" aria-live="polite">
        <span className={ui.captionNumber}>
          {String(stageIndex(stage) + 1).padStart(2, "0")} / {String(FAULT_STAGES.length).padStart(2, "0")}
        </span>
        {label}
      </p>
      <button type="button" className={`${ui.action} ${ui.actionPrimary}`} aria-label="Next stage" disabled={isLastStage(stage)} onClick={() => dispatch({ type: "NEXT" })}>
        NEXT <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function Closing({ scenario }: { scenario: ActiveFaultScenarioId }) {
  const viewTwin = useUFlightStore((s) => s.viewTwin);
  const runMission = useUFlightStore((s) => s.runMission);
  return (
    <>
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Maintenance action</p>
        <ul className={ui.list}>
          {MAINTENANCE_ACTIONS[scenario].map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} data-track-event="uflight_3d_twin_mode" data-track-source="fault_lab" onClick={() => viewTwin(scenario === "bearing-degradation" ? "propulsion" : "energy")}>
          VIEW TWIN
        </button>
        <button type="button" className={ui.action} data-track-event="uflight_3d_mission_start" data-track-source="fault_lab" onClick={() => runMission("executive")}>
          SEE IT IN A MISSION
        </button>
      </div>
    </>
  );
}

function BearingBody({ stage }: { stage: FaultStage }) {
  const bearing = useUFlightStore((s) => s.telemetry.snapshot.bearing);
  const severity = useUFlightStore((s) => s.faultSeverity);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const diagnosed = reached(stage, "DIAGNOSED") && bearing.anomaly;
  const prognosis = reached(stage, "DEGRADING") && bearing.anomaly;
  const decision = reached(stage, "ACTION_REQUIRED");
  return (
    <>
      {diagnosed && (
        <div className={ui.panelSection} data-testid="diagnosis">
          <p className={ui.panelHeading}>Diagnosis · {bearing.diagnosis}</p>
          <ul className={ui.evidence} aria-label="Evidence">
            {bearing.evidence.map((e) => (
              <li key={e.label} data-present={e.present}>
                {e.label}
                <span className={ui.evidenceMark}>{e.present ? "PRESENT" : "NOT SEEN"}</span>
              </li>
            ))}
          </ul>
          <Values rows={[{ label: "Confidence", value: bearing.confidence ?? "—" }]} />
        </div>
      )}
      {prognosis && (
        <div className={ui.panelSection} data-testid="prognosis">
          <p className={ui.panelHeading}>Health trajectory</p>
          <PrognosisChart severity={severity} window={bearing.prognosisBand} subject="motor 04 front bearing" />
          <Values rows={[{ label: "Maintenance window", value: describeWindow(bearing.prognosisBand) }]} />
        </div>
      )}
      {decision && (
        <div className={ui.panelSection} data-testid="mission-impact">
          <p className={ui.panelHeading}>Mission impact</p>
          <Values rows={MISSION_IMPACT_ROWS.map((row) => ({ label: row.label, value: row.value }))} />
        </div>
      )}
      {stage === "MAINTENANCE" ? <Closing scenario="bearing-degradation" /> : (!prognosis || engineer) && <SignalView />}
    </>
  );
}

function BatteryBody({ stage }: { stage: FaultStage }) {
  const battery = useUFlightStore((s) => s.telemetry.snapshot.battery);
  const severity = useUFlightStore((s) => s.faultSeverity);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const { fault } = battery;
  const rising = (value: number, limit: number) => (value > limit ? "↑" : "");
  const prognosis = reached(stage, "DEGRADING") && fault.anomaly;
  return (
    <>
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Module 03</p>
        <Values
          rows={[
            { label: `Voltage spread ${rising(fault.voltageSpreadMv, fault.expectedVoltageSpreadMv.max)}`, value: fault.voltageSpreadMv.toFixed(0), unit: "mV", simulated: true },
            { label: `Temperature spread ${rising(fault.temperatureSpreadC, fault.expectedTemperatureSpreadC.max)}`, value: fault.temperatureSpreadC.toFixed(1), unit: "°C", simulated: true },
            { label: `Resistance estimate ${rising(fault.resistanceRatio, 1.15)}`, value: `${(fault.resistanceRatio * 100).toFixed(0)}%`, unit: "of new", simulated: true },
          ]}
        />
      </div>
      {(engineer || !prognosis) && (
        <div className={ui.panelSection}>
          <p className={ui.panelHeading}>Cell-group voltage spread by module, mV</p>
          <Bars label="Cell-group voltage spread by module" rows={battery.modules.map((m) => ({ label: `M${m.no}`, value: m.voltageSpreadMv / 100, color: m.no === "03" && fault.anomaly ? "var(--uf-degraded)" : undefined }))} />
          <p className={ui.panelNote}>Bar length: spread ÷ 100 mV · {PROVENANCE.data}</p>
        </div>
      )}
      {reached(stage, "ACTION_REQUIRED") && (
        <div className={ui.panelSection} data-testid="mission-impact">
          <p className={ui.panelHeading}>Potential impact</p>
          <Values
            rows={[
              { label: "Power capability", value: fault.derated ? "DERATED" : "NOMINAL" },
              { label: "Available power", value: battery.availablePowerKw.toFixed(0), unit: "kW", simulated: true },
              { label: "Immediate safety impact", value: "NONE" },
            ]}
          />
        </div>
      )}
      {prognosis && (
        <div className={ui.panelSection} data-testid="prognosis">
          <p className={ui.panelHeading}>Health trajectory</p>
          <PrognosisChart severity={severity} window={fault.prognosisBand} subject="battery module 03" />
          <Values rows={[{ label: "Maintenance window", value: describeWindow(fault.prognosisBand) }]} />
        </div>
      )}
      {stage === "MAINTENANCE" && <Closing scenario="battery-imbalance" />}
    </>
  );
}

/** What the scenario shows at its current stage. */
export function FaultPanel() {
  const scenario = useUFlightStore((s) => s.faultScenario);
  const stage = useUFlightStore((s) => s.faultStage);
  const twin = useUFlightStore((s) => s.digitalTwinState);
  if (!scenario) return null;
  const narrative = NARRATIVE[scenario][stage];
  const info = getScenario(scenario);
  const subjectState = twin.components[info.subject]?.state ?? "NOMINAL";
  const detected = scenario === "bearing-degradation" ? twin.systems.propulsion.state !== "NOMINAL" : twin.systems.energy.state !== "NOMINAL";
  // The headline announces the anomaly only once the model has actually detected it.
  const headline = stage === "ANOMALOUS" && !detected ? "MONITORING" : narrative.headline;

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="fault-panel-title" data-testid="fault-panel">
      <p className={ui.panelEyebrow}>{narrative.label}</p>
      <h2 id="fault-panel-title" className={ui.headline} data-tone={detected && (stage === "ANOMALOUS" || stage === "DIAGNOSED") ? "anomaly" : undefined}>
        {headline}
      </h2>
      <p className={ui.panelText}>{narrative.text}</p>
      <Values
        rows={[
          { label: scenario === "bearing-degradation" ? "Motor 04" : "Module 03", value: <StateBadge state={subjectState} /> },
          { label: "HUMS", value: humsLabel(twin.hums) },
          { label: "Vehicle", value: <VehicleBadge state={twin.vehicle} /> },
        ]}
      />
      {scenario === "bearing-degradation" ? <BearingBody stage={stage} /> : <BatteryBody stage={stage} />}
      <p className={ui.panelNote}>{SCENARIO_NOTE}</p>
    </aside>
  );
}
