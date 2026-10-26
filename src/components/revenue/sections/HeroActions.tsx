"use client";
// The hero's two actions. They open a workspace view below; for a returning
// user the first one continues where they left off.
import { trackRevenue } from "../analytics";
import { nextOpenDay } from "../logic/missions";
import { useRevenue } from "../state/store";
import type { ViewId } from "../types";
import { GO_EVENT } from "../workspace/nav";
import css from "../revenue.module.css";

function request(view: ViewId, day?: number) {
  window.dispatchEvent(new CustomEvent(GO_EVENT, { detail: { view, day } }));
}

export default function HeroActions() {
  const completed = useRevenue((state) => state.completed);
  const started = Object.keys(completed).length > 0;
  const day = nextOpenDay(completed);

  return (
    <div className={css.heroActions}>
      <a
        href={started ? `#day-${day}` : "#today"}
        className={css.primaryCta}
        onClick={(event) => {
          event.preventDefault();
          trackRevenue("revenue_framework_start", { source: started ? "continue" : "hero" });
          request("today", started ? day : undefined);
        }}
      >
        {started ? `Continue Day ${day}` : "Start Today's Mission"}
      </a>
      <a
        href="#journey"
        className={css.secondaryCta}
        onClick={(event) => {
          event.preventDefault();
          request("journey");
        }}
      >
        Explore 12-Week Journey
      </a>
    </div>
  );
}
