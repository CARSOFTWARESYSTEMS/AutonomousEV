// MISSION: the whole story end to end, in two lengths. Preflight release,
// vertical takeoff, transition, a quiet cruise, a health event, diagnosis,
// prognosis, the decision to continue, landing and post-flight maintenance.
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import type { MissionPhase } from "../types";
import { BEARING_MAINTENANCE_ACTIONS, SCENARIO_NOTE } from "../data/faultScenarios";
import { LIFT_SHARE_NOTE, MISSION_DECISION, MISSION_PROFILES, MISSION_SEQUENCE, RELEASE_ROWS, STAGE_INFO, type ActivePhase } from "../data/missionDefinition";
import { FLOW_COLOR, PROVENANCE } from "../data/uflightReferenceAircraft";
import { humsLabel } from "../simulation/hums";
import { isActivePhase, missionDurationS, stageStartS } from "../simulation/mission";
import { describeWindow } from "../simulation/prognostics";
import { PREFLIGHT_SNAPSHOT, useUFlightStore } from "../state/uflightStore";
import { Bars, PrognosisChart } from "../ui/charts";
import { StateBadge, Values, VehicleBadge } from "../ui/common";
import SignalView from "../ui/SignalView";
import theme from "../theme.module.css";
import ui from "../uflight.module.css";

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const EVENT_STAGES: readonly MissionPhase[] = ["HEALTH_EVENT", "DIAGNOSIS", "PROGNOSIS"];

/** Stage timeline and transport, or the choice of mission before one is running. */
export default function MissionControls() {
  const stage = useUFlightStore((s) => s.missionStage);
  const playing = useUFlightStore((s) => s.missionPlaying);
  const profile = useUFlightStore((s) => s.missionProfile);
  const time = useUFlightStore((s) => s.missionTime);
  const progress = useUFlightStore((s) => s.telemetry.stageProgress);
  const dispatch = useUFlightStore((s) => s.missionDispatch);
  const runMission = useUFlightStore((s) => s.runMission);

  if (stage === "IDLE") {
    return (
      <div className={ui.controlStrip} role="group" aria-label="Choose a mission">
        {MISSION_PROFILES.map((p) => (
          <button key={p.id} type="button" className={p.id === "executive" ? `${ui.action} ${ui.actionPrimary}` : ui.action} title={p.text} data-track-event="uflight_3d_mission_start" data-track-profile={p.id} onClick={() => runMission(p.id)}>
            <Play size={13} aria-hidden="true" /> {p.label} <span className={ui.markerSub}>{p.duration}</span>
          </button>
        ))}
      </div>
    );
  }

  const complete = stage === "COMPLETE";
  const active = complete ? "POSTFLIGHT" : (stage as ActivePhase);
  const index = MISSION_SEQUENCE.indexOf(active);
  const info = STAGE_INFO[active];

  return (
    <div className={ui.timeline} role="group" aria-label="Mission timeline">
      <div className={ui.timelineHead}>
        <p className={ui.timelineStage} data-testid="mission-stage">
          <span className={ui.captionNumber}>{info.number}</span>
          {complete ? "MISSION COMPLETE" : info.label}
        </p>
        <div className={ui.transport}>
          <span className={ui.timelineClock} aria-label={`Mission clock ${clock(time)} of ${clock(missionDurationS(profile))}`}>
            {clock(time)} / {clock(missionDurationS(profile))}
          </span>
          <button type="button" className={ui.iconButton} aria-label="Previous stage" onClick={() => dispatch({ type: "PREVIOUS" })}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {complete ? (
            <button type="button" className={ui.iconButton} aria-label="Run mission again" onClick={() => runMission(profile)}>
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className={ui.iconButton} aria-label={playing ? "Pause mission" : "Play mission"} onClick={() => dispatch({ type: playing ? "PAUSE" : "PLAY" })}>
              {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            </button>
          )}
          <button type="button" className={ui.iconButton} aria-label="Next stage" disabled={complete} onClick={() => dispatch({ type: "NEXT" })}>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ol className={ui.track} aria-label="Mission stages" style={{ gridTemplateColumns: `repeat(${MISSION_SEQUENCE.length}, 1fr)` }}>
        {MISSION_SEQUENCE.map((phase, i) => (
          <li key={phase}>
            <button
              type="button"
              className={ui.trackSegment}
              data-state={complete || i < index ? "done" : i === index ? "active" : "pending"}
              data-event={EVENT_STAGES.includes(phase) || undefined}
              aria-current={!complete && i === index ? "step" : undefined}
              aria-label={`${STAGE_INFO[phase].number} ${STAGE_INFO[phase].label}`}
              title={`${STAGE_INFO[phase].number} ${STAGE_INFO[phase].label}`}
              style={{ "--progress": i === index ? progress : 0 } as React.CSSProperties}
              onClick={() => dispatch({ type: "SEEK", timeS: stageStartS(profile, phase) })}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** What is happening now, in a sentence. Announced to assistive technology as the stage changes. */
export function MissionCaption() {
  const stage = useUFlightStore((s) => s.missionStage);
  const twin = useUFlightStore((s) => s.digitalTwinState);

  if (stage === "IDLE") {
    return (
      <section className={ui.caption} aria-labelledby="mission-title">
        <p className={ui.captionNumber}>MISSION</p>
        <h2 id="mission-title" className={ui.captionTitle}>
          ONE FLIGHT, END TO END
        </h2>
        <p className={ui.captionText}>Release the aircraft, fly it, meet a health event in cruise, and follow the decision through to maintenance. Both missions are compressed for learning.</p>
        <ul className={ui.list} style={{ marginTop: 12 }}>
          {MISSION_PROFILES.map((p) => (
            <li key={p.id}>
              <strong>{p.label}</strong> · {p.duration}. {p.text}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const complete = stage === "COMPLETE";
  const info = STAGE_INFO[complete ? "POSTFLIGHT" : (stage as ActivePhase)];
  const alert = twin.hums !== "MONITORING" && twin.hums !== "BACKGROUND_MONITORING";
  return (
    <section className={ui.caption} aria-live="polite" aria-atomic="true" data-testid="mission-caption">
      <p className={ui.captionNumber}>
        {info.number} / {String(MISSION_SEQUENCE.length).padStart(2, "0")}
      </p>
      <h2 className={ui.captionTitle}>{complete ? "MISSION COMPLETE" : info.label}</h2>
      <p className={ui.captionText}>{info.caption}</p>
      <p className={ui.hums} data-alert={alert}>
        <span className={ui.humsPulse} aria-hidden="true" />
        {stage === "CRUISE" ? info.hums : `HUMS · ${humsLabel(twin.hums)}`}
      </p>
    </section>
  );
}

function ReleaseAssessment() {
  const progress = useUFlightStore((s) => s.telemetry.stageProgress);
  const awaiting = useUFlightStore((s) => s.telemetry.awaitingAuthorization);
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const dispatch = useUFlightStore((s) => s.missionDispatch);
  // The checks report one after another through the stage.
  const reported = awaiting ? RELEASE_ROWS.length : Math.floor(progress * (RELEASE_ROWS.length + 1));
  return (
    <>
      <h2 id="mission-panel-title" className={ui.panelTitle}>
        AIRCRAFT RELEASE ASSESSMENT
      </h2>
      <div className={ui.table} role="list" aria-label="Release checks">
        {RELEASE_ROWS.map((row, i) => {
          const done = i < reported;
          const state = row.system === "hums" ? "NOMINAL" : twin.systems[row.system].state;
          return (
            <div key={row.label} className={ui.row} role="listitem">
              <span className={ui.rowLabel}>{row.label}</span>
              {done ? <StateBadge state={state} label={state !== "NOMINAL" ? undefined : row.system === "hums" ? "READY" : "PASS"} quiet /> : <span className={ui.rowNote}>CHECKING…</span>}
            </div>
          );
        })}
      </div>
      <div className={ui.vehicleStatus} role="status">
        <span className={ui.label}>VEHICLE</span>
        {reported >= RELEASE_ROWS.length ? <VehicleBadge state={twin.vehicle} /> : <span className={ui.rowNote}>ASSESSING…</span>}
      </div>
      <div className={ui.panelActions}>
        <button type="button" className={`${ui.action} ${ui.actionPrimary}`} disabled={reported < RELEASE_ROWS.length} onClick={() => dispatch({ type: "AUTHORIZE" })}>
          AUTHORIZE FLIGHT
        </button>
      </div>
    </>
  );
}

function Decision() {
  return (
    <div className={ui.panelSection}>
      <p className={ui.panelHeading}>
        {MISSION_DECISION.subject} · {MISSION_DECISION.finding}
      </p>
      <Values rows={MISSION_DECISION.rows.map((row) => ({ label: row.label, value: row.value }))} />
      <p className={ui.panelNote}>{PROVENANCE.scenario}</p>
    </div>
  );
}

function LiftShare() {
  const flight = useUFlightStore((s) => s.telemetry.flight);
  return (
    <div className={ui.panelSection}>
      <p className={ui.panelHeading}>Lift share</p>
      <Bars
        label="Share of lift carried by the rotors and by the wing"
        rows={[
          { label: "ROTOR", value: flight.rotorLiftShare },
          { label: "WING", value: flight.wingLiftShare, color: FLOW_COLOR.control },
        ]}
      />
      <p className={ui.panelNote}>{LIFT_SHARE_NOTE}</p>
    </div>
  );
}

/** The mission's right-hand panel: what the stage is about, and nothing else. */
export function MissionPanel() {
  const stage = useUFlightStore((s) => s.missionStage);
  const flight = useUFlightStore((s) => s.telemetry.flight);
  const snapshot = useUFlightStore((s) => s.telemetry.snapshot);
  const severity = useUFlightStore((s) => s.faultSeverity);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const setMode = useUFlightStore((s) => s.setMode);
  const viewTwin = useUFlightStore((s) => s.viewTwin);
  if (!isActivePhase(stage) && stage !== "COMPLETE") return null;

  const { bearing, twin } = snapshot;
  const arrow = (rising: boolean) => (rising ? "↑" : "");
  let body: React.ReactNode;

  switch (stage) {
    case "PREFLIGHT":
      body = <ReleaseAssessment />;
      break;
    case "TAKEOFF":
      body = (
        <>
          <h2 id="mission-panel-title" className={ui.panelTitle}>
            VERTICAL TAKEOFF
          </h2>
          <Values
            rows={[
              { label: `Battery power ${arrow(true)}`, value: flight.batteryPowerKw.toFixed(0), unit: "kW", simulated: true },
              { label: `Motor current ${arrow(true)}`, value: flight.motorCurrentA.toFixed(0), unit: "A", simulated: true },
              { label: `Rotor RPM ${arrow(true)}`, value: flight.tiltRpm.toFixed(0), unit: "rpm", simulated: true },
              { label: `Motor temperature ${arrow(true)}`, value: flight.motorTempC.toFixed(0), unit: "°C", simulated: true },
            ]}
          />
          <p className={ui.panelNote}>HEALTH MONITORING ACTIVE</p>
        </>
      );
      break;
    case "TRANSITION":
    case "APPROACH":
      body = (
        <>
          <h2 id="mission-panel-title" className={ui.panelTitle}>
            {stage === "TRANSITION" ? "TRANSITION" : "APPROACH"}
          </h2>
          <LiftShare />
          <Values
            rows={[
              { label: "Tilt angle", value: flight.tiltDeg.toFixed(0), unit: "°", simulated: true },
              { label: "Airspeed", value: (flight.speedMs * 3.6).toFixed(0), unit: "km/h", simulated: true },
            ]}
          />
          {stage === "APPROACH" && <Decision />}
        </>
      );
      break;
    case "CRUISE":
      body = (
        <>
          <h2 id="mission-panel-title" className={ui.panelTitle}>
            HUMS
          </h2>
          <p className={ui.panelSubtitle}>BACKGROUND MONITORING</p>
          <p className={ui.panelText}>All systems nominal. A healthy aircraft does not ask for attention.</p>
          {engineer && (
            <Values
              rows={[
                { label: "Airspeed", value: (flight.speedMs * 3.6).toFixed(0), unit: "km/h", simulated: true },
                { label: "Battery power", value: flight.batteryPowerKw.toFixed(0), unit: "kW", simulated: true },
                { label: "State of charge", value: flight.socPercent.toFixed(0), unit: "%", simulated: true },
              ]}
            />
          )}
        </>
      );
      break;
    case "HEALTH_EVENT":
      body = (
        <>
          <p className={ui.panelEyebrow}>MOTOR 04</p>
          <h2 id="mission-panel-title" className={ui.headline} data-tone={bearing.anomaly ? "anomaly" : undefined}>
            {bearing.anomaly ? "ANOMALY DETECTED" : "MONITORING"}
          </h2>
          <p className={ui.panelText}>{bearing.anomaly ? "The frequency feature has left the baseline model. The aircraft remains stable." : "A small change in the vibration signal. Still inside the baseline model."}</p>
          <SignalView />
        </>
      );
      break;
    case "DIAGNOSIS":
      body = (
        <>
          <p className={ui.panelEyebrow}>MOTOR 04 · DIAGNOSIS</p>
          <h2 id="mission-panel-title" className={ui.headline} data-tone="anomaly">
            {bearing.diagnosis ?? "POSSIBLE BEARING DEGRADATION"}
          </h2>
          <Values rows={[...bearing.evidence.map((e) => ({ label: e.label, value: e.present ? "PRESENT" : "—" })), { label: "Confidence", value: bearing.confidence ?? "—" }]} />
          {engineer && <SignalView />}
        </>
      );
      break;
    case "PROGNOSIS":
      body = (
        <>
          <p className={ui.panelEyebrow}>MOTOR 04 · PROGNOSIS</p>
          <h2 id="mission-panel-title" className={ui.headline}>
            HEALTH TRAJECTORY
          </h2>
          <PrognosisChart severity={severity} window={bearing.prognosisBand} subject="motor 04 front bearing" />
          <Values rows={[{ label: "Maintenance window", value: describeWindow(bearing.prognosisBand) }]} />
          <Decision />
        </>
      );
      break;
    case "LANDING":
      body = (
        <>
          <h2 id="mission-panel-title" className={ui.panelTitle}>
            LANDING
          </h2>
          <Values
            rows={[
              { label: "Height", value: flight.altitudeM.toFixed(0), unit: "m", simulated: true },
              { label: "Rotor RPM", value: flight.tiltRpm.toFixed(0), unit: "rpm", simulated: true },
            ]}
          />
          <Decision />
        </>
      );
      break;
    case "POSTFLIGHT":
    case "COMPLETE":
      body = (
        <>
          <p className={ui.panelEyebrow}>MISSION COMPLETE</p>
          <h2 id="mission-panel-title" className={ui.panelTitle}>
            POST-FLIGHT HEALTH ASSESSMENT
          </h2>
          <p className={ui.panelHeading} style={{ marginTop: 14 }}>
            Motor 04
          </p>
          <div className={ui.compare} data-testid="postflight-comparison">
            <div className={ui.compareCell}>
              <span className={ui.label}>PRE-FLIGHT</span>
              <StateBadge state={PREFLIGHT_SNAPSHOT.twin.components["propulsion-unit-04"]?.state ?? "NOMINAL"} />
            </div>
            <span className={ui.compareArrow} aria-hidden="true">
              →
            </span>
            <div className={ui.compareCell}>
              <span className={ui.label}>POST-FLIGHT</span>
              <StateBadge state={bearing.healthState} />
            </div>
          </div>
          <div className={ui.vehicleStatus} role="status">
            <span className={ui.label}>OUTCOME</span>
            <StateBadge state={twin.systems.propulsion.state} />
          </div>
          <div className={ui.panelSection}>
            <p className={ui.panelHeading}>Maintenance action</p>
            <ul className={ui.list}>
              {BEARING_MAINTENANCE_ACTIONS.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
            <p className={ui.panelNote}>{SCENARIO_NOTE}</p>
          </div>
          <div className={ui.panelActions}>
            <button type="button" className={ui.action} data-track-event="uflight_3d_twin_mode" data-track-source="mission_postflight" onClick={() => viewTwin("propulsion")}>
              VIEW TWIN
            </button>
            <button type="button" className={ui.action} onClick={() => setMode("health")}>
              OPEN HEALTH
            </button>
          </div>
        </>
      );
      break;
    default:
      body = null;
  }

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="mission-panel-title" data-testid="mission-panel">
      {body}
      <p className={theme.srOnly}>Vehicle: {twin.vehicle.replaceAll("_", " ")}</p>
    </aside>
  );
}
