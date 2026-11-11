"use client";
// Puts a mission's guided steps into the Mission Lab: the first `learnCount`
// steps are Learn, the rest are Challenge, followed by a debrief; the mission
// supplies its own Explore panel and viewport. Missions keep one step index
// across both phases, so their scene can follow it as before.
import { useState, type ReactNode } from "react";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { saveMissionProgress, useMissionProgress, type LabMode } from "../store";
import { academyEvent } from "../analytics";
import MissionLab from "./MissionLab";
import StepRunner, { type LabStep } from "./StepRunner";
import Debrief, { type Reflection } from "./Debrief";
import styles from "./lab.module.css";

interface Props {
  mission: MissionMeta;
  trackTitle?: string;
  level: Level;
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  steps: LabStep[];
  learnCount: number;
  /** One index across both phases. */
  stepIndex: number;
  onStepChange: (index: number) => void;
  explore: ReactNode;
  viewport: ReactNode;
  stageOverlay?: ReactNode;
  reflection: Reflection;
  learned: string[];
  related: TutorialRef[];
  next?: { href: string; label: string };
  info: ReactNode;
  /** Puts the mission's own design state back to its start. */
  onReplay: () => void;
}

export default function LabMission({ mission, trackTitle, level, mode, onModeChange, steps, learnCount, stepIndex, onStepChange, explore, viewport, stageOverlay, reflection, learned, related, next, info, onReplay }: Props) {
  const progress = useMissionProgress(mission.slug);
  const [debrief, setDebrief] = useState(false);
  const learn = steps.slice(0, learnCount);
  const challenge = steps.slice(learnCount);
  const ids = steps.map((s) => s.id);
  const challengeDone = challenge.every((s) => progress.completed.includes(s.id));
  const learnIndex = Math.min(stepIndex, learnCount - 1);
  const challengeIndex = Math.max(0, stepIndex - learnCount);

  const changeMode = (m: LabMode) => {
    setDebrief(false);
    onModeChange(m);
    // The scene follows the step index: point it at the first step of the phase being opened.
    if (m === "learn" && stepIndex >= learnCount) onStepChange(0);
    if (m === "challenge" && stepIndex < learnCount) onStepChange(learnCount);
  };

  const replay = () => {
    saveMissionProgress(mission.slug, null);
    setDebrief(false);
    onReplay();
    onStepChange(0);
    onModeChange("learn");
    academyEvent("lesson_reset", { mission: mission.slug, level });
  };

  const panel =
    mode === "explore" ? (
      explore
    ) : mode === "learn" ? (
      <StepRunner
        mission={mission}
        level={level}
        phase="learn"
        steps={learn}
        stepIndex={learnIndex}
        onStepChange={onStepChange}
        allStepIds={ids}
        finish={{ label: "On to the Challenge", onFinish: () => changeMode("challenge") }}
      />
    ) : debrief ? (
      <Debrief mission={mission} level={level} reflection={reflection} learned={learned} next={next} related={related} onReplay={replay} />
    ) : (
      <>
        {challengeDone && (
          <p className={styles.small} style={{ marginBottom: 12 }}>
            You have completed this challenge in this browser.{" "}
            <button type="button" className={styles.textButton} onClick={() => setDebrief(true)}>
              See the debrief
            </button>
          </p>
        )}
        <StepRunner
          mission={mission}
          level={level}
          phase="challenge"
          steps={challenge}
          stepIndex={challengeIndex}
          onStepChange={(i) => onStepChange(learnCount + i)}
          allStepIds={ids}
          finish={{ label: "Finish and reflect", onFinish: () => setDebrief(true) }}
        />
      </>
    );

  return (
    <MissionLab
      mission={mission}
      trackTitle={trackTitle}
      level={level}
      mode={mode}
      onModeChange={changeMode}
      info={info}
      progress={{ done: ids.filter((id) => progress.completed.includes(id)).length, total: ids.length }}
      onClearProgress={replay}
      viewport={viewport}
      stageOverlay={stageOverlay}
      panel={panel}
    />
  );
}
