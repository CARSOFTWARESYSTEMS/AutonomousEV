import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { MISSION_STAGE_INFO } from "../data/missionSequence";
import { MISSION_DURATION_S, MISSION_PLAN, formatMissionClock, isActiveStage } from "../simulation/mission";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/**
 * Mission transport and timeline. The clock is a compressed educational
 * timeline (00:00–12:00), not elapsed real time.
 */
export default function MissionTimeline() {
  const stage = useExplorerStore((s) => s.missionStage);
  const playing = useExplorerStore((s) => s.missionPlaying);
  const timeS = useExplorerStore((s) => s.telemetry.missionTimeS);
  const dispatch = useExplorerStore((s) => s.dispatchMission);
  const runMission = useExplorerStore((s) => s.runMission);

  if (!isActiveStage(stage)) {
    return (
      <div className={ui.controlStrip}>
        <button type="button" className={ui.primaryButton} data-track-event="mission_run" data-track-source="mission_mode" onClick={runMission}>
          <Play size={15} aria-hidden="true" /> RUN MISSION
        </button>
        <p className={ui.stripNote}>Eleven stages, from boot to payload downlink, in about two minutes.</p>
      </div>
    );
  }

  const info = MISSION_STAGE_INFO[stage];
  const plan = MISSION_PLAN.find((p) => p.stage === stage)!;
  const finished = stage === "COMPLETE" && timeS >= MISSION_DURATION_S;

  return (
    <div className={ui.timeline} data-testid="mission-timeline">
      <div className={ui.timelineHead}>
        <div className={ui.transport} role="group" aria-label="Mission playback">
          <button type="button" className={ui.transportButton} aria-label="Previous stage" onClick={() => dispatch({ type: "PREVIOUS" })}>
            <SkipBack size={15} aria-hidden="true" />
          </button>
          {playing ? (
            <button type="button" className={`${ui.transportButton} ${ui.transportPrimary}`} aria-label="Pause mission" onClick={() => dispatch({ type: "PAUSE" })}>
              <Pause size={16} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className={`${ui.transportButton} ${ui.transportPrimary}`} aria-label={finished ? "Run mission again" : "Play mission"} onClick={() => dispatch({ type: "PLAY" })}>
              <Play size={16} aria-hidden="true" />
            </button>
          )}
          <button type="button" className={ui.transportButton} aria-label="Next stage" onClick={() => dispatch({ type: "NEXT" })}>
            <SkipForward size={15} aria-hidden="true" />
          </button>
          <button type="button" className={ui.transportButton} aria-label="Restart mission" onClick={() => dispatch({ type: "RESTART" })}>
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </div>
        <p className={ui.timelineStage} data-testid="mission-stage">
          <span className={ui.stageNumber}>{String(plan.index).padStart(2, "0")}</span>
          {info.label}
        </p>
        <p className={ui.clock} aria-label={`Mission clock ${formatMissionClock(timeS)} of ${formatMissionClock(MISSION_DURATION_S)}, compressed timeline`}>
          {formatMissionClock(timeS)} <span>/ {formatMissionClock(MISSION_DURATION_S)}</span>
        </p>
      </div>

      <div className={ui.track}>
        <ol className={ui.segments} aria-label="Mission stages">
          {MISSION_PLAN.map((p) => {
            const state = p.index < plan.index ? "done" : p.index === plan.index ? "current" : "todo";
            return (
              <li key={p.stage} style={{ flexGrow: p.endS - p.startS }}>
                <button
                  type="button"
                  className={ui.segmentButton}
                  data-state={state}
                  aria-current={state === "current" ? "step" : undefined}
                  aria-label={`Stage ${p.index}: ${MISSION_STAGE_INFO[p.stage].label}`}
                  title={MISSION_STAGE_INFO[p.stage].label}
                  onClick={() => dispatch({ type: "SEEK", timeS: p.startS })}
                >
                  {String(p.index).padStart(2, "0")}
                </button>
              </li>
            );
          })}
        </ol>
        <input
          className={ui.scrubber}
          type="range"
          min={0}
          max={MISSION_DURATION_S}
          step={1}
          value={Math.round(timeS)}
          aria-label="Mission time"
          aria-valuetext={`${formatMissionClock(timeS)}, stage ${plan.index} of ${MISSION_PLAN.length}, ${info.label}`}
          onChange={(e) => dispatch({ type: "SEEK", timeS: Number(e.target.value) })}
          style={{ "--fill": `${(timeS / MISSION_DURATION_S) * 100}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
