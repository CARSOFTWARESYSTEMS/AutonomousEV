"use client";
// /today: what to do today. #day-N opens a day; otherwise the saved day
// opens, and Day 1 for someone new.
import { useCallback, useEffect } from "react";
import AppShell from "../app/AppShell";
import { clampDay } from "../logic/missions";
import { useRevenue } from "../state/store";
import DayView from "./DayView";

export default function TodayPage() {
  const setDay = useRevenue((state) => state.setDay);

  const openDay = useCallback(
    (day: number) => {
      const next = clampDay(day);
      setDay(next);
      if (window.location.hash !== `#day-${next}`) window.history.replaceState(null, "", `#day-${next}`);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    },
    [setDay],
  );

  // Follow the address on arrival and when it changes.
  useEffect(() => {
    const follow = () => {
      const match = /^#day-(\d{1,2})$/.exec(window.location.hash);
      if (match) setDay(clampDay(Number(match[1])));
    };
    // After saved progress has been read, so an address wins over the saved day.
    const timer = window.setTimeout(follow, 0);
    window.addEventListener("hashchange", follow);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", follow);
    };
  }, [setDay]);

  return (
    <AppShell page="today">
      <DayView onDayChange={openDay} />
    </AppShell>
  );
}
