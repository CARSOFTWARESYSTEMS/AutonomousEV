"use client";
import { useLearningLevel } from "./LearningLevelProvider";
import type { LearningLevel } from "../rocketData";
import styles from "../model-rocketry.module.css";

const LEVELS: { id: LearningLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export default function LevelSwitcher() {
  const { level, setLevel } = useLearningLevel();
  return (
    <div className={styles.levelSwitcher} role="tablist" aria-label="Learning depth">
      {LEVELS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="tab"
          aria-selected={level === l.id}
          className={styles.levelTab}
          onClick={() => setLevel(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
