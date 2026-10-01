import type { DetailLevel } from "../types";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

const LEVELS: { id: DetailLevel; label: string; hint: string }[] = [
  { id: "learn", label: "LEARN", hint: "Plain-language explanations" },
  { id: "engineer", label: "ENGINEER", hint: "Engineering detail and reference figures" },
];

/** Same scene, two depths of information. */
export default function LearnEngineerToggle() {
  const learnMode = useExplorerStore((s) => s.learnMode);
  const setLearnMode = useExplorerStore((s) => s.setLearnMode);
  return (
    <div className={ui.segmented} role="group" aria-label="Detail level">
      {LEVELS.map((level) => (
        <button key={level.id} type="button" className={ui.segment} aria-pressed={learnMode === level.id} title={level.hint} onClick={() => setLearnMode(level.id)}>
          {level.label}
        </button>
      ))}
    </div>
  );
}
