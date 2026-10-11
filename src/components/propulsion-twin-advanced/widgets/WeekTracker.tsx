"use client";
// The 12-week assignment as something to work through: each week opens to its
// deliverables and the module that teaches it, and can be marked complete.
// Progress is kept in this browser only.
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { trackAdvancedTwin } from "../analytics";
import { COURSE_PHASES, COURSE_WEEKS } from "../data/course";
import { MODULE_BY_ID } from "../data/product";
import { useLabStore } from "../state/labStore";
import css from "../advancedTwin.module.css";

export default function WeekTracker() {
  const done = useLabStore((s) => s.weeksDone);
  const loadWeeks = useLabStore((s) => s.loadWeeks);
  const toggleWeek = useLabStore((s) => s.toggleWeek);
  const setModule = useLabStore((s) => s.setModule);
  const [open, setOpen] = useState<number | null>(1);

  useEffect(() => loadWeeks(), [loadWeeks]);

  const show = (week: number) => {
    const next = open === week ? null : week;
    setOpen(next);
    if (next !== null) trackAdvancedTwin("week_module_opened", { week: `week_${week}` });
  };

  return (
    <div className={css.weeks}>
      <p className={css.weeksProgress} role="status">
        {done.length} of {COURSE_WEEKS.length} weeks marked complete
        <span className={css.shareTrack} aria-hidden="true">
          <span className={css.shareFill} style={{ width: `${(done.length / COURSE_WEEKS.length) * 100}%` }} />
        </span>
      </p>
      {COURSE_PHASES.map((phase) => (
        <section key={phase.id} className={css.phase} aria-label={phase.name}>
          <h4 className={css.phaseTitle}>{phase.name}</h4>
          <ol className={css.weekList} start={phase.weeks[0].week}>
            {phase.weeks.map((w) => {
              const complete = done.includes(w.week);
              const expanded = open === w.week;
              return (
                <li key={w.week} className={css.week} data-done={complete || undefined}>
                  <button type="button" className={css.weekHead} aria-expanded={expanded} aria-controls={`week-${w.week}`} onClick={() => show(w.week)}>
                    <span className={css.weekNumber}>
                      {complete && <Check size={12} aria-hidden="true" />} Week {w.week}
                    </span>
                    <span className={css.weekTitle}>{w.title}</span>
                    {w.review && <span className={css.weekReview}>Review</span>}
                    <span className={css.srOnly}>{complete ? " (complete)" : ""}</span>
                  </button>
                  <div id={`week-${w.week}`} className={css.weekBody} hidden={!expanded}>
                    <p className={css.groupLabel}>Deliver</p>
                    <ul className={css.bullets}>
                      {w.deliver.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {w.review && (
                      <p className={css.reviewLine}>
                        <span className={css.groupLabel}>Review</span> {w.review}
                      </p>
                    )}
                    <div className={css.weekActions}>
                      <button type="button" className={css.ghost} onClick={() => setModule(w.module)}>
                        Study: {MODULE_BY_ID[w.module].label} module
                      </button>
                      <button type="button" className={complete ? css.ghost : css.primary} aria-pressed={complete} onClick={() => toggleWeek(w.week)}>
                        {complete ? "Marked complete" : "Mark week complete"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
