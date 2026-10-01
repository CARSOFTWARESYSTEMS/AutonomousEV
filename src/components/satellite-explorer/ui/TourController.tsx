import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { TOUR_STEPS } from "../data/missionSequence";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/**
 * Guided tour caption and controls. Not a modal: the scene stays fully
 * visible and interactive, and the camera and state do the teaching.
 */
export default function TourController() {
  const active = useExplorerStore((s) => s.tourActive);
  const index = useExplorerStore((s) => s.tourStep);
  const playing = useExplorerStore((s) => s.tourPlaying);
  const startedAt = useExplorerStore((s) => s.tourStepStartedAt);
  const next = useExplorerStore((s) => s.tourNext);
  const back = useExplorerStore((s) => s.tourBack);
  const exit = useExplorerStore((s) => s.exitTour);
  const setPlaying = useExplorerStore((s) => s.setTourPlaying);
  if (!active) return null;

  const step = TOUR_STEPS[index];
  const last = index === TOUR_STEPS.length - 1;

  return (
    <section className={`${ui.caption} ${ui.tour}`} aria-label="Guided tour" data-testid="tour">
      <p className={ui.captionEyebrow}>
        GUIDED TOUR{" "}
        <span className={ui.stageNumber}>
          {index + 1} / {TOUR_STEPS.length}
        </span>
      </p>
      <p className={ui.captionTitle}>{step.title}</p>
      <p className={ui.captionText}>{step.caption}</p>
      <div className={ui.tourProgress} aria-hidden="true">
        {/* Keyed on the step so the bar restarts; paused when the tour is paused. */}
        <span key={`${index}-${startedAt}`} style={{ animationDuration: `${step.durationS}s`, animationPlayState: playing ? "running" : "paused" }} />
      </div>
      <div className={ui.tourActions}>
        <button type="button" className={ui.action} onClick={back} disabled={index === 0}>
          <ChevronLeft size={14} aria-hidden="true" /> BACK
        </button>
        <button type="button" className={ui.action} aria-label={playing ? "Pause tour" : "Resume tour"} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        </button>
        <button type="button" className={ui.action} onClick={next}>
          {last ? "FINISH" : "NEXT"} <ChevronRight size={14} aria-hidden="true" />
        </button>
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={exit}>
          <X size={14} aria-hidden="true" /> EXIT TOUR
        </button>
      </div>
    </section>
  );
}
