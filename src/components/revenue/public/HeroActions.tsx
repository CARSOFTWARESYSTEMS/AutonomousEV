"use client";
// The hero's two actions. A returning user's first action continues where they left off.
import Link from "next/link";
import { ROUTES, todayHref } from "../data/framework";
import { nextOpenDay } from "../logic/missions";
import { useHydrateRevenue, useRevenue } from "../state/store";
import css from "../site.module.css";

export default function HeroActions() {
  useHydrateRevenue();
  const completed = useRevenue((state) => state.completed);
  const started = Object.keys(completed).length > 0;
  const day = nextOpenDay(completed);

  return (
    <div className={css.actions}>
      <Link href={started ? todayHref(day) : ROUTES.today} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source={started ? "continue" : "hero"}>
        {started ? `Continue Day ${day}` : "Start Today's Mission"}
      </Link>
      <a href="#journey" className={css.secondaryCta}>
        Explore the Journey
      </a>
    </div>
  );
}
