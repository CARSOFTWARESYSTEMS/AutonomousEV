"use client";
// The hero's two actions. A returning user's first action continues where
// they left off; any other day is one tap away in the header's Go to Day.
import Link from "next/link";
import { todayHref } from "../data/framework";
import { nextOpenDay } from "../logic/missions";
import { useRevenue } from "../state/store";
import css from "../site.module.css";

export default function HeroActions() {
  const completed = useRevenue((state) => state.completed);
  const started = Object.keys(completed).length > 0;
  const day = nextOpenDay(completed);

  return (
    <div className={css.actions}>
      <Link href={todayHref(started ? day : 1)} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source={started ? "continue" : "hero"}>
        {started ? `Continue Day ${day}` : "Start Today"}
      </Link>
      <a href="#journey" className={css.secondaryCta}>
        See the Journey
      </a>
    </div>
  );
}
