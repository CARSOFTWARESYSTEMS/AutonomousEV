"use client";

import { useEffect, useState } from "react";
import { Award, ArrowRight, Lightbulb } from "lucide-react";
import type { LessonDefinition } from "@/lib/satellite-energy-academy/content";
import { emptyProgress, parseProgress, PROGRESS_KEY } from "@/lib/satellite-energy-academy/progress";
import { solarPower } from "@/lib/satellite-energy-academy/solar";
import SolarExperiment from "./SolarExperiment";
import styles from "../academy.module.css";

const EXPERIMENTS = { "solar-incidence": SolarExperiment };

export default function LessonEngine({ lesson }: { lesson: LessonDefinition }) {
  const [input, setInput] = useState(lesson.experiment.initial);
  const [mode, setMode] = useState<"mission" | "free" | "advanced">("mission");
  const [choice, setChoice] = useState<number | null>(null);
  const [hint, setHint] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [progress, setProgress] = useState(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [storageNote, setStorageNote] = useState("Loading saved progress…");
  const saved = progress.lessons[lesson.id];
  const completed = saved?.lessonVersion === lesson.version && saved.completed;
  const advancedCompleted = completed && saved.advancedCompleted;
  const correct = choice !== null && lesson.reflection.choices[choice].correct;
  const power = solarPower(input).electricalW;
  const advanced = lesson.challenge.advanced;
  const target = mode === "advanced" ? advanced.targetW : lesson.challenge.targetW;
  const constraintsMet = mode !== "advanced" || (input.areaM2 <= advanced.maxAreaM2 && input.efficiencyPercent <= advanced.maxEfficiencyPercent && input.irradianceWm2 <= advanced.maxIrradianceWm2);
  const meetsTarget = power >= target && constraintsMet;
  const Experiment = EXPERIMENTS[lesson.experiment.kind];

  useEffect(() => {
    try { setProgress(parseProgress(localStorage.getItem(PROGRESS_KEY))); setStorageNote("Progress stays in this browser. No account needed."); }
    catch { setStorageNote("Browser storage is unavailable. You can still play; progress lasts for this visit."); }
    setLoaded(true);
  }, []);

  function complete() {
    if (mode === "free" || !loaded) return;
    if (!meetsTarget || !correct) {
      setFeedback(!meetsTarget ? "Keep exploring. Meet the power target and any design limits, then try again—there is no penalty." : "Almost there. Try the reflection question to explain your discovery.");
      return;
    }
    const next = { ...progress, lessons: { ...progress.lessons, [lesson.id]: { lessonVersion: lesson.version, completed: true, advancedCompleted: Boolean(advancedCompleted || mode === "advanced") } } };
    setProgress(next);
    try {
      // Merge records from other tabs without discarding their completed lessons.
      const stored = parseProgress(localStorage.getItem(PROGRESS_KEY));
      const previous = stored.lessons[lesson.id];
      if (previous?.lessonVersion === lesson.version && previous.advancedCompleted) next.lessons[lesson.id].advancedCompleted = true;
      const merged = { ...next, lessons: { ...stored.lessons, ...next.lessons } };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged)); setProgress(merged);
    } catch { setStorageNote("Progress is saved for this visit only: browser storage is unavailable."); }
    setFeedback(mode === "advanced" ? "Resourceful Engineer earned! You powered the satellite within its design limits." : "Sun Catcher earned! You captured sunlight and explained why orientation matters. Your advanced challenge is now unlocked.");
  }

  return <section id="capture-the-sun" className={styles.section} aria-labelledby="lesson-title">
    <div className={styles.sectionHeading}>
      <div><span className={styles.eyebrow}>World 01 · {lesson.difficulty} · Playable now</span><h2 id="lesson-title">{lesson.topic}</h2><p>{lesson.question}</p></div>
      <div className={styles.progressCard}><span>{completed ? "1 of 1 available missions complete" : "0 of 1 available missions complete"}</span><progress max="1" value={completed ? 1 : 0} aria-label="Available mission progress" /><small>{storageNote}</small></div>
    </div>
    <div className={styles.journey} aria-label="Learning journey">Wonder <ArrowRight size={12} aria-hidden /> Discover <ArrowRight size={12} aria-hidden /> Play <ArrowRight size={12} aria-hidden /> Understand <ArrowRight size={12} aria-hidden /> Experiment <ArrowRight size={12} aria-hidden /> Reflect <ArrowRight size={12} aria-hidden /> Celebrate</div>
    <details className={styles.details}>
      <summary>Discover: a little intuition before you play (optional)</summary>
      {lesson.explanation.map(p => <p key={p}>{p}</p>)}
      <p>{lesson.prerequisites.join(" ")}</p>
      <ul>{lesson.objectives.map(o => <li key={o}>{o}</li>)}</ul>
    </details>
    <div className={styles.modeBar} role="group" aria-label="Experiment mode">
      <button className={styles.button} aria-pressed={mode === "mission"} onClick={() => { setMode("mission"); setFeedback(""); }}>Guided mission</button>
      <button className={styles.button} aria-pressed={mode === "free"} onClick={() => { setMode("free"); setFeedback(""); }}>Free Experiment</button>
      {completed && <button className={styles.button} aria-pressed={mode === "advanced"} onClick={() => { setMode("advanced"); setFeedback(""); }}>Advanced challenge</button>}
    </div>
    <Experiment lesson={lesson} input={input} onChange={setInput} onReset={() => { setInput(lesson.experiment.initial); setChoice(null); setHint(0); setFeedback(""); }} />
    {mode === "free" ? <div className={styles.challenge}><h3>Follow your curiosity</h3><p>No target, scores or completion checks. Change one thing, make a prediction, and see what happens.</p><ul>{lesson.guidedQuestions.map(q => <li key={q}>{q}</li>)}</ul></div> : <div className={styles.challenge}>
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{mode === "advanced" ? "Unlocked / Resourceful Engineer" : "Your mission"}</span><h3>{lesson.challenge.title}</h3><p>Your teaching satellite needs {target} W: computer 20 W + radio 30 W + instruments 30 W.</p></div><strong className={styles.target}>{power.toFixed(1)} / {target} W</strong></div>
      {mode === "advanced" && <p>Design limits: area ≤ {advanced.maxAreaM2.toFixed(2)} m², efficiency ≤ {advanced.maxEfficiencyPercent}%, sunlight ≤ {advanced.maxIrradianceWm2} W/m². Find an orientation that works within all three.</p>}
      <progress max={target} value={Math.min(target, power)} aria-label="Power target" />
      <p>{meetsTarget ? "Power target reached. Now explain your discovery below." : power >= target ? "Enough power! Now bring your design within the advanced limits." : `${Math.max(0, target - power).toFixed(1)} W to go. Try another angle, a larger area or a different efficiency.`}</p>
      <button className={styles.button} onClick={() => setHint(Math.min(hint + 1, lesson.hints.length))}><Lightbulb size={16} aria-hidden />{hint === lesson.hints.length ? "All hints revealed" : "Give me a hint"}</button>
      {lesson.hints.slice(0, hint).map(h => <p key={h}>{h}</p>)}
      <fieldset className={styles.reflection}><legend>Reflect: {lesson.reflection.question}</legend>{lesson.reflection.choices.map((answer, i) => <label key={answer.text}><input type="radio" name={`reflection-${lesson.id}`} checked={choice === i} onChange={() => { setChoice(i); setFeedback(""); }} />{answer.text}</label>)}</fieldset>
      <p role="status">{choice !== null ? lesson.reflection.choices[choice].feedback : "Choose an explanation. You can retry as often as you like."}</p>
      <button className={styles.primaryButton} disabled={!loaded} onClick={complete}><Award size={18} aria-hidden />{mode === "advanced" ? "Complete advanced challenge" : "Complete the mission"}</button>
      <p role="status">{feedback}</p>
    </div>}
    {completed && <div className={styles.achievement}><Award size={28} aria-hidden /><div><strong>Sun Catcher{advancedCompleted ? " · Resourceful Engineer" : ""}</strong><p>You discovered how orientation changes solar power. Replay freely; your achievement stays saved.</p></div></div>}
    <details className={styles.details}><summary>What to notice &amp; common misconceptions</summary><ul>{[...lesson.observations, ...lesson.misconceptions].map(o => <li key={o}>{o}</li>)}</ul></details>
    <details className={styles.details}><summary>Model assumptions, sources &amp; review status</summary><ul>{lesson.assumptions.map(a => <li key={a}>{a}</li>)}</ul><p>Calculated educational results, not measurements or scientifically validated spacecraft predictions. Content version {lesson.version} · {lesson.scientificReview.status}.</p><ul>{lesson.scientificReview.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} (opens in a new tab)</a></li>)}</ul></details>
  </section>;
}
