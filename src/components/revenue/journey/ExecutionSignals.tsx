"use client";
// The first commercial indicators in the journey, on the Execution month:
// the user's own pipeline only, never synthetic examples.
import Link from "next/link";
import { ROUTES } from "../data/framework";
import { isQualifiedStage } from "../data/scoring";
import { formatINRShort } from "../logic/format";
import { isFullyQualified } from "../logic/scoring";
import { useRevenue } from "../state/store";
import css from "../app.module.css";

export default function ExecutionSignals() {
  const opportunities = useRevenue((state) => state.opportunities);
  const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const qualified = open.filter((o) => isQualifiedStage(o.stage) && isFullyQualified(o.qualified));
  const figures = [
    { label: "Qualified pipeline", value: formatINRShort(qualified.reduce((sum, o) => sum + o.value, 0)) },
    { label: "Open opportunities", value: String(open.length) },
    { label: "Pilots", value: String(opportunities.filter((o) => o.stage === "pilot").length) },
    { label: "Won", value: String(opportunities.filter((o) => o.stage === "won").length) },
  ];
  return (
    <section className={css.signals} aria-label="Your pipeline so far">
      <dl className={css.metricGrid}>
        {figures.map((figure) => (
          <div key={figure.label} className={css.metric}>
            <dt>{figure.label}</dt>
            <dd>{figure.value}</dd>
          </div>
        ))}
      </dl>
      <Link href={ROUTES.pipeline} className={css.inlineLink}>
        Open the pipeline →
      </Link>
    </section>
  );
}
