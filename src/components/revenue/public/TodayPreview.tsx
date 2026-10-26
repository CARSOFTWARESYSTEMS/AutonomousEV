"use client";
// A preview of today: the day, its step, what to learn, the first thing to
// do and the result to finish with. The day itself lives on /today.
import Link from "next/link";
import { todayHref } from "../data/framework";
import { stepNo, stepOfDay } from "../data/steps";
import { missionFor } from "../logic/missions";
import { useRevenue } from "../state/store";
import css from "../site.module.css";

export default function TodayPreview() {
  const day = useRevenue((state) => state.day);
  const mission = missionFor(day);
  const step = stepOfDay(day);
  const lines = [
    { label: "Do", text: mission.doToday[0] },
    { label: "Result", text: mission.output },
  ];

  return (
    <section className={css.section} data-tone="alt" aria-labelledby="rv-preview-title">
      <div className={css.container}>
        <div className={css.preview}>
          <div className={css.previewHead}>
            <p className={css.eyebrow}>
              Today&apos;s Mission · Day {stepNo(day)} · Step {stepNo(step.n)} {step.short}
            </p>
            <h2 id="rv-preview-title" className={css.sectionTitle}>
              {mission.title}
            </h2>
            <p className={css.sectionLede}>{mission.mission}</p>
          </div>
          <dl className={css.previewLines}>
            {lines.map((line) => (
              <div key={line.label}>
                <dt>{line.label}</dt>
                <dd>{line.text}</dd>
              </div>
            ))}
          </dl>
          <div className={css.previewGo}>
            <div className={css.actions}>
              <Link href={todayHref(day)} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source="preview">
                Open Today →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
