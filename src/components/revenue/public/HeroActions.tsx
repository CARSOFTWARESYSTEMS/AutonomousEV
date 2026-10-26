"use client";
// The hero's two actions, and a way to any day. A returning user's first
// action continues where they left off.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { todayHref } from "../data/framework";
import { clampDay, nextOpenDay } from "../logic/missions";
import { useRevenue } from "../state/store";
import DayPicker from "../ui/DayPicker";
import css from "../site.module.css";

export default function HeroActions() {
  const router = useRouter();
  const completed = useRevenue((state) => state.completed);
  const setDay = useRevenue((state) => state.setDay);
  const started = Object.keys(completed).length > 0;
  const day = nextOpenDay(completed);

  return (
    <>
      <div className={css.actions}>
        <Link href={todayHref(started ? day : 1)} className={css.primaryCta} data-track-event="revenue_framework_start" data-track-source={started ? "continue" : "hero"}>
          {started ? `Continue Day ${day}` : "Start Today"}
        </Link>
        <a href="#journey" className={css.secondaryCta}>
          See the Journey
        </a>
      </div>
      <DayPicker
        label="Or go to any day"
        onSelect={(next) => {
          setDay(next);
          router.push(todayHref(clampDay(next)));
        }}
      />
    </>
  );
}
