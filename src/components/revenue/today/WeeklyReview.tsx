"use client";
// The Friday CEO / CMO / CSO review: twelve questions, answered with evidence links.
import { WEEKLY_REVIEW_QUESTIONS } from "../data/library";
import { useRevenue } from "../state/store";
import { TextArea } from "../ui/controls";
import css from "../app.module.css";

export default function WeeklyReview({ week }: { week: number }) {
  const answers = useRevenue((state) => state.reviews[week]) ?? {};
  const setReview = useRevenue((state) => state.setReview);
  const answered = WEEKLY_REVIEW_QUESTIONS.filter((_, i) => answers[i]?.trim()).length;

  return (
    <div className={css.stack}>
      <p className={css.blockNote}>
        Week {week}: {answered} of {WEEKLY_REVIEW_QUESTIONS.length} answered. Link each answer to the note, sheet or record that supports it.
      </p>
      <div className={css.formGrid}>
        {WEEKLY_REVIEW_QUESTIONS.map((question, i) => (
          <TextArea key={`${week}-${i}`} label={question} rows={2} value={answers[i] ?? ""} onChange={(value) => setReview(week, i, value)} placeholder="Answer + evidence link" />
        ))}
      </div>
    </div>
  );
}
