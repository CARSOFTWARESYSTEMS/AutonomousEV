import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { BUILD_STEPS, BUILD_STEP_COUNT } from "../data/missionSequence";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/** Build Mode controls: the eight assembly steps and their transport. */
export default function BuildMode() {
  const step = useExplorerStore((s) => s.buildStep);
  const auto = useExplorerStore((s) => s.buildAuto);
  const setStep = useExplorerStore((s) => s.setBuildStep);
  const next = useExplorerStore((s) => s.nextBuildStep);
  const previous = useExplorerStore((s) => s.previousBuildStep);
  const setAuto = useExplorerStore((s) => s.setBuildAuto);
  const reset = useExplorerStore((s) => s.resetBuild);

  return (
    <div className={ui.controlStrip} data-testid="build-controls">
      <ol className={ui.steps} aria-label="Assembly steps">
        {BUILD_STEPS.map((s) => {
          const state = s.step < step ? "done" : s.step === step ? "current" : "todo";
          return (
            <li key={s.step}>
              <button type="button" className={ui.step} data-state={state} aria-current={state === "current" ? "step" : undefined} onClick={() => setStep(s.step)}>
                <span className={ui.stageNumber}>{String(s.step).padStart(2, "0")}</span>
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>
      <div className={ui.stripActions}>
        <button type="button" className={ui.action} onClick={previous} disabled={step <= 1}>
          <ChevronLeft size={14} aria-hidden="true" /> BACK
        </button>
        <button type="button" className={ui.action} onClick={next} disabled={step >= BUILD_STEP_COUNT}>
          NEXT <ChevronRight size={14} aria-hidden="true" />
        </button>
        <button type="button" className={ui.action} aria-pressed={auto} onClick={() => setAuto(!auto)}>
          {auto ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} AUTO BUILD
        </button>
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={reset}>
          <RotateCcw size={13} aria-hidden="true" /> RESET
        </button>
      </div>
    </div>
  );
}
