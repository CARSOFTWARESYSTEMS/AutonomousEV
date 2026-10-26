"use client";
// The weekly CEO / CMO / CSO review, due every Friday: twelve questions,
// answered with links to evidence.
import { useId, useState } from "react";
import { WEEKS, weekOf } from "../data/framework";
import { WEEKLY_REVIEW_QUESTIONS } from "../data/library";
import { useRevenue } from "../state/store";
import { Notice, Panel, TextArea, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function ReviewView() {
  const weekId = useId();
  const day = useRevenue((state) => state.day);
  const reviews = useRevenue((state) => state.reviews);
  const setReview = useRevenue((state) => state.setReview);
  const [week, setWeek] = useState(weekOf(day));
  const answers = reviews[week] ?? {};
  const answered = WEEKLY_REVIEW_QUESTIONS.filter((_, i) => answers[i]?.trim()).length;

  return (
    <div>
      <ViewHeader eyebrow="Review" title="Weekly CEO / CMO / CSO Review" lede="Mandatory every Friday. Answer with evidence — link to notes, account sheets or decisions — not with opinions." />

      <div className={css.field}>
        <label htmlFor={weekId} className={css.label}>
          Week
        </label>
        <select id={weekId} className={css.select} value={week} autoComplete="off" onChange={(event) => setWeek(Number(event.target.value))}>
          {WEEKS.map((w) => (
            <option key={w.n} value={w.n}>
              Week {w.n} — {w.theme}
            </option>
          ))}
        </select>
      </div>

      <Notice tone="info">
        {answered} of {WEEKLY_REVIEW_QUESTIONS.length} answered for Week {week}. Evidence links required: where is the note, sheet or record that supports each answer?
      </Notice>

      <Panel title={`Week ${week} review`} kicker={WEEKS[week - 1].challenge}>
        <div className={css.formGrid}>
          {WEEKLY_REVIEW_QUESTIONS.map((question, i) => (
            <TextArea key={`${week}-${i}`} label={question} rows={2} value={answers[i] ?? ""} onChange={(value) => setReview(week, i, value)} placeholder="Answer + evidence link" />
          ))}
        </div>
      </Panel>
    </div>
  );
}
