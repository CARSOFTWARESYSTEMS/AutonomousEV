"use client";
// A preview of today's mission: the day, its objective, and three lines —
// learn, do, evidence. The full mission lives on /today.
import Link from "next/link";
import { ROUTES, TOTAL_DAYS, phaseOf } from "../data/framework";
import { missionFor } from "../logic/missions";
import { useHydrateRevenue, useRevenue } from "../state/store";
import css from "../site.module.css";

export default function MissionPreview() {
  useHydrateRevenue();
  const day = useRevenue((state) => state.day);
  const mission = missionFor(day);
  const phase = phaseOf(day);
  const lines = [
    { label: "Learn", text: mission.key },
    { label: "Do", text: mission.doToday[0] },
    { label: "Evidence", text: mission.evidence[mission.evidence.length - 1] },
  ];

  return (
    <section className={css.section} data-rule="" aria-labelledby="rv-preview-title">
      <div className={css.container}>
        <div className={css.preview}>
          <div className={css.previewHead}>
            <p className={css.eyebrow}>
              Day {String(day).padStart(2, "0")} / {TOTAL_DAYS} · {phase.name}
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
              <Link href={ROUTES.today} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source="preview">
                Open Today&apos;s Mission →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
