"use client";
// After the Challenge: one reflection question (a choice, never free text, so
// nothing personal is written or kept), then the mission summary.
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, RefreshCw } from "lucide-react";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import { LEVELS } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { useMissionProgress } from "../store";
import { academyEvent } from "../analytics";
import styles from "./lab.module.css";

export interface Reflection {
  prompt: string;
  options: { id: string; label: string; feedback: string }[];
}

interface Props {
  mission: MissionMeta;
  level: Level;
  reflection: Reflection;
  learned: string[];
  next?: { href: string; label: string };
  related: TutorialRef[];
  onReplay: () => void;
}

export default function Debrief({ mission, level, reflection, learned, next, related, onReplay }: Props) {
  const progress = useMissionProgress(mission.slug);
  const [choice, setChoice] = useState<string | null>(null);
  const picked = reflection.options.find((o) => o.id === choice);
  return (
    <div className={styles.runner}>
      <p className={styles.kicker}>Debrief</p>
      <h2 id="lesson-step-title" tabIndex={-1} className={styles.stepTitle}>
        Reflect on your design
      </h2>
      <fieldset className={styles.reflect}>
        <legend>{reflection.prompt}</legend>
        {reflection.options.map((o) => (
          <label key={o.id} className={styles.reflectOption} data-checked={choice === o.id || undefined}>
            <input
              type="radio"
              name={`${mission.slug}-reflection`}
              value={o.id}
              checked={choice === o.id}
              onChange={() => {
                setChoice(o.id);
                academyEvent("lesson_reflection", { mission: mission.slug, level, option: o.id });
              }}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      <div aria-live="polite">{picked && <p className={styles.reflectFeedback}>{picked.feedback}</p>}</div>

      <section className={styles.summary} aria-labelledby="lab-summary-title">
        <Award size={32} className={styles.summaryIcon} aria-hidden />
        <h3 id="lab-summary-title" className={styles.summaryTitle}>
          {progress.finished ? `Mission complete: ${mission.title}` : `Challenge done: ${mission.title}`}
        </h3>
        <p className={styles.small}>
          {progress.finished
            ? `Every step done at the ${LEVELS[level].name} level${progress.hintsUsed ? `, with ${progress.hintsUsed} hint${progress.hintsUsed === 1 ? "" : "s"}` : " without hints"}. Saved in this browser only.`
            : "Finish the Learn steps too to complete the mission. Progress is saved in this browser only."}
        </p>
        <h4 className={styles.subhead}>What you practised</h4>
        <ul className={styles.learned}>
          {learned.map((l) => (
            <li key={l}>
              <CheckCircle2 size={16} aria-hidden /> {l}
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          {next && (
            <Link href={next.href} className={styles.primary} data-track-event="lesson_next_mission_click" data-track-mission={mission.slug}>
              {next.label} <ArrowRight size={16} aria-hidden />
            </Link>
          )}
          <button type="button" className={styles.secondary} onClick={onReplay}>
            <RefreshCw size={16} aria-hidden /> Replay mission
          </button>
        </div>
        {level === "foundation" && <p className={styles.small}>Ready for more? Switch to Ages 17–18 at the top for the Advanced version.</p>}
        {related.length > 0 && (
          <>
            <h4 className={styles.subhead}>Keep exploring</h4>
            <ul className={styles.related}>
              {related.map((t) => (
                <li key={t.href}>
                  <Link href={t.href}>{t.label}</Link>
                  <span>{t.note}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
