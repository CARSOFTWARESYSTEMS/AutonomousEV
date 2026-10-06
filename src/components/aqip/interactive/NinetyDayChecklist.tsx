"use client";

import { useMemo, useSyncExternalStore } from "react";
import { trackAqip } from "../analytics";
import { NINETY_DAY } from "../data/execution";
import css from "../interactive.module.css";

export const STORAGE_KEY = "aqip:90-day-plan:v1";
const EMPTY = "{}";

// Progress lives in this browser's localStorage only. If storage is unavailable
// (private browsing, blocked site data), it is kept in memory for the visit.
let memory = EMPTY;
const listeners = new Set<() => void>();

function read() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function write(value: string) {
  memory = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage is unavailable: `memory` carries the state.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function parse(raw: string): Record<string, boolean> {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

const TOTAL = NINETY_DAY.reduce((count, phase) => count + phase.items.length, 0);

/** The founder's 90-day checklist. Ticks are remembered in this browser and nowhere else. */
export default function NinetyDayChecklist() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const done = useMemo(() => parse(raw), [raw]);
  const completed = NINETY_DAY.reduce((count, phase) => count + phase.items.filter((item) => done[item.id]).length, 0);

  const toggle = (phase: string, id: string, checked: boolean) => {
    write(JSON.stringify({ ...done, [id]: checked }));
    trackAqip("aqip_90_day_interaction", { phase, action: checked ? "check" : "uncheck" });
  };

  return (
    // A form with autoComplete="off", so Firefox does not restore ticks or the button's disabled state on reload:
    // the saved progress is the only source of truth.
    <form className={css.plan} autoComplete="off" onSubmit={(event) => event.preventDefault()} aria-label="90-day plan checklist">
      <div className={css.planSummary}>
        <p className={css.planProgress} role="status">
          <strong>
            {completed} of {TOTAL}
          </strong>{" "}
          actions complete
        </p>
        <progress className={css.planBar} max={TOTAL} value={completed} aria-label="90-day plan progress" />
        <button
          type="button"
          className={css.button}
          disabled={completed === 0}
          onClick={() => {
            write(EMPTY);
            trackAqip("aqip_90_day_interaction", { phase: "all", action: "clear" });
          }}
        >
          Clear progress
        </button>
      </div>

      <div className={css.planPhases}>
        {NINETY_DAY.map((phase) => {
          const count = phase.items.filter((item) => done[item.id]).length;
          return (
            <fieldset key={phase.id} className={css.planPhase}>
              <legend>
                <span className={css.planPhaseName}>{phase.phase}</span>
                <span className={css.planPhaseGoal}>{phase.goal}</span>
                <span className={css.planPhaseCount}>
                  {count}/{phase.items.length}
                </span>
              </legend>
              {phase.items.map((item) => (
                <label key={item.id} className={css.check}>
                  <input type="checkbox" checked={Boolean(done[item.id])} onChange={(event) => toggle(phase.id, item.id, event.target.checked)} />
                  <span>{item.text}</span>
                </label>
              ))}
            </fieldset>
          );
        })}
      </div>
      <p className={css.privacyNote}>Progress is saved in this browser only. It is not sent anywhere and other people cannot see it.</p>
    </form>
  );
}
