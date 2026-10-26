"use client";
// Moving between workspace views. A view is addressed by the page's hash
// (#pipeline, #day-12), so views can be linked, shared and left with Back.
import { createContext, useContext } from "react";
import { VIEW_IDS } from "../data/framework";
import { clampDay } from "../logic/missions";
import type { ViewId } from "../types";

export interface Destination {
  view: ViewId;
  day?: number;
}

/** The view a hash names, or null when it names something else on the page. */
export function parseHash(hash: string): Destination | null {
  const value = hash.replace(/^#/, "");
  const day = /^day-(\d{1,2})$/.exec(value);
  if (day) return { view: "today", day: clampDay(Number(day[1])) };
  return (VIEW_IDS as readonly string[]).includes(value) ? { view: value as ViewId } : null;
}

export const hashFor = (destination: Destination) => (destination.view === "today" && destination.day ? `#day-${destination.day}` : `#${destination.view}`);

/** Window event the hero uses to open a view in the workspace below it. */
export const GO_EVENT = "rv:go";

export type Go = (view: ViewId, options?: { day?: number }) => void;

export const NavContext = createContext<Go>(() => {});

export const useGo = () => useContext(NavContext);

/** A link to another view that keeps working without scripts (it is a real #hash link). */
export function ViewLink({ view, day, children, className }: { view: ViewId; day?: number; children: React.ReactNode; className?: string }) {
  const go = useGo();
  return (
    <a
      href={hashFor({ view, day })}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        go(view, { day });
      }}
    >
      {children}
    </a>
  );
}
