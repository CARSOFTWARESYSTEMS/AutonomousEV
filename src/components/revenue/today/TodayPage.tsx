"use client";
// /today: the mission in the centre, its context beside it. From 1440px the
// context panel is always open; on laptops it starts closed beside the
// mission; on tablets and phones it opens as a sheet. #day-N opens a day;
// #gates opens the panel at the gates.
import { useCallback, useEffect, useState } from "react";
import { trackRevenue } from "../analytics";
import AppShell from "../app/AppShell";
import { clampDay } from "../logic/missions";
import { useRevenue } from "../state/store";
import css from "../app.module.css";
import ContextPanel from "./ContextPanel";
import MissionFlow from "./MissionFlow";

export default function TodayPage() {
  const setDay = useRevenue((state) => state.setDay);
  const [panelOpen, setPanelOpen] = useState(false);

  const openDay = useCallback(
    (day: number) => {
      const next = clampDay(day);
      setDay(next);
      if (window.location.hash !== `#day-${next}`) window.history.replaceState(null, "", `#day-${next}`);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    },
    [setDay],
  );

  // Follow the address on arrival and when it changes.
  useEffect(() => {
    const follow = () => {
      const hash = window.location.hash;
      const match = /^#day-(\d{1,2})$/.exec(hash);
      if (match) setDay(clampDay(Number(match[1])));
      if (hash === "#gates") {
        setPanelOpen(true);
        requestAnimationFrame(() => document.getElementById("gates")?.scrollIntoView({ block: "start" }));
      }
    };
    // After saved progress has been read, so an address wins over the saved day.
    const timer = window.setTimeout(follow, 0);
    window.addEventListener("hashchange", follow);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", follow);
    };
  }, [setDay]);

  // Escape closes the panel when it is open as a sheet.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const togglePanel = () => {
    trackRevenue("context_panel_toggle", { open: panelOpen ? "false" : "true" });
    setPanelOpen(!panelOpen);
  };

  return (
    <AppShell active="today">
      <div className={css.today} data-panel={panelOpen ? "open" : "closed"}>
        <div className={css.todayMain}>
          <MissionFlow
            onDayChange={openDay}
            tools={
              <button type="button" className={`${css.ghostButton} ${css.progressToggle}`} aria-expanded={panelOpen} aria-controls="rv-context" onClick={togglePanel}>
                {panelOpen ? "Hide progress" : "Progress & gates"}
              </button>
            }
          />
        </div>
        <aside id="rv-context" className={css.todayPanel} aria-label="Progress, evidence and gates">
          <div className={css.panelSheetHead}>
            <p className={css.contextTitle}>Progress &amp; gates</p>
            <button type="button" className={css.ghostButton} onClick={() => setPanelOpen(false)}>
              Close
            </button>
          </div>
          <ContextPanel
            onDayChange={(day) => {
              setPanelOpen(false);
              openDay(day);
            }}
          />
        </aside>
      </div>
    </AppShell>
  );
}
