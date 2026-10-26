"use client";
// "Go to Day": a quiet utility beside the header's main action, for anyone who
// already knows which day they need. From 1024px it opens a compact panel
// under the button; on phones, a bottom sheet. Days are grouped by month and
// week, with the current week open; search finds a day by topic. The panel is
// rendered into the page root, outside the header, because the header's
// backdrop blur would otherwise trap a fixed sheet inside it.
import { CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { trackRevenue } from "../analytics";
import { FRAMEWORK, PHASES, ROUTES, phaseWeeks, todayHref, weekOf } from "../data/framework";
import { daysOfWeek, searchMissions } from "../logic/missions";
import { useRevenue } from "../state/store";
import type { Mission } from "../types";
import css from "../site.module.css";

export default function DayNavigator() {
  const day = useRevenue((state) => state.day);
  const completed = useRevenue((state) => state.completed);
  const setDay = useRevenue((state) => state.setDay);
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = (refocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };

  const openPanel = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.bottom + 10, right: Math.max(16, window.innerWidth - rect.right) });
    setWeek(weekOf(day));
    setOpen(true);
  };

  // While open: focus the current day, keep the panel under its button,
  // close on Escape or a click outside, and hold the page still on phones.
  useEffect(() => {
    if (!open) return;
    const node = panel.current;
    (node?.querySelector<HTMLElement>("[aria-current='step']") ?? node?.querySelector<HTMLElement>("button, a, input"))?.focus({ preventScroll: true });
    node?.querySelector("[aria-current='step']")?.scrollIntoView({ block: "center" });

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setQuery("");
      trigger.current?.focus({ preventScroll: true });
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (node?.contains(target) || trigger.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    };
    const onResize = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (rect) setAnchor({ top: rect.bottom + 10, right: Math.max(16, window.innerWidth - rect.right) });
    };
    const sheet = window.matchMedia?.("(max-width: 1023px)").matches;
    const previous = document.body.style.overflow;
    if (sheet) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      if (sheet) document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Keep Tab inside the panel while it is open.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = [...panel.current.querySelectorAll<HTMLElement>("a[href], button, input")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  // The link opens Today at that day. Already on Today, the day changes in
  // place, from the top, and the address is updated here: a same-page link
  // would add its #day-N to the one already in the address.
  const choose = (event: MouseEvent<HTMLAnchorElement>, next: number) => {
    if (window.location.pathname === ROUTES.today) {
      event.preventDefault();
      window.history.replaceState(null, "", `#day-${next}`);
    }
    setDay(next);
    trackRevenue("daily_mission_view", { day: String(next) });
    close(false);
    window.scrollTo({ top: 0 });
  };

  const results = query.trim() ? searchMissions(query).slice(0, 8) : null;

  const dayLink = (mission: Mission) => {
    const current = mission.day === day;
    const done = Boolean(completed[mission.day]);
    return (
      <li key={mission.day}>
        <Link
          href={todayHref(mission.day)}
          className={css.dayNavDay}
          aria-current={current ? "step" : undefined}
          aria-label={`Day ${mission.day} — ${mission.title}${current ? ", current" : ""}${done ? ", complete" : ""}`}
          data-done={done ? "" : undefined}
          onClick={(event) => choose(event, mission.day)}
        >
          <span className={css.dayNavDayNo}>
            {done ? "✓ " : ""}Day {mission.day}
          </span>
          <span className={css.dayNavDayTitle}>{mission.title}</span>
          {current ? <span className={css.dayNavNow}>Current</span> : null}
        </Link>
      </li>
    );
  };

  const root = typeof document === "undefined" ? null : (document.getElementById(FRAMEWORK.rootId) ?? document.body);

  return (
    <div className={css.dayNav}>
      <button ref={trigger} type="button" className={css.dayNavButton} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => (open ? close(true) : openPanel())}>
        <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" className={css.dayNavIcon} />
        <span className={css.dayNavLabel}>Go to Day</span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" className={css.dayNavChevron} data-open={open ? "" : undefined} />
      </button>
      {open && root
        ? createPortal(
            <>
              <div className={css.dayNavBackdrop} aria-hidden="true" onClick={() => close(true)} />
              <div
                ref={panel}
                id={id}
                className={css.dayNavPanel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                style={{ ["--top" as string]: `${anchor.top}px`, ["--right" as string]: `${anchor.right}px` }}
                onKeyDown={onKeyDown}
              >
                <div className={css.dayNavHead}>
                  <h2 id={`${id}-title`} className={css.dayNavTitle}>
                    Go to Day
                  </h2>
                  <button type="button" className={css.dayNavClose} onClick={() => close(true)}>
                    Close
                  </button>
                </div>
                <label htmlFor={`${id}-search`} className={css.srOnly}>
                  Search day or topic
                </label>
                <input
                  id={`${id}-search`}
                  type="search"
                  className={css.dayNavSearch}
                  placeholder="Search day or topic"
                  value={query}
                  autoComplete="off"
                  onChange={(event) => {
                    if (!query && event.target.value) trackRevenue("mission_search");
                    setQuery(event.target.value);
                  }}
                />
                <div className={css.dayNavBody}>
                  {results ? (
                    results.length ? (
                      <ul className={css.dayNavDays} aria-label="Matching days">
                        {results.map(dayLink)}
                      </ul>
                    ) : (
                      <p className={css.dayNavEmpty}>No day matches “{query.trim()}”.</p>
                    )
                  ) : (
                    PHASES.map((phase) => (
                      <section key={phase.n} className={css.dayNavMonth} aria-labelledby={`${id}-m${phase.n}`}>
                        <h3 id={`${id}-m${phase.n}`} className={css.dayNavMonthName}>
                          Month {phase.n} — {phase.month}
                        </h3>
                        <ul>
                          {phaseWeeks(phase).map((item) => {
                            const days = daysOfWeek(item.n);
                            const isOpen = week === item.n;
                            const done = days.filter((mission) => completed[mission.day]).length;
                            return (
                              <li key={item.n}>
                                <button type="button" className={css.dayNavWeek} aria-expanded={isOpen} onClick={() => setWeek(isOpen ? null : item.n)}>
                                  <span className={css.dayNavWeekName}>Week {item.n}</span>{" "}
                                  <span className={css.dayNavWeekDays}>
                                    Days {days[0].day}–{days[days.length - 1].day}
                                    {done ? ` · ${done} done` : ""}
                                  </span>
                                </button>
                                {isOpen ? <ul className={css.dayNavDays}>{days.map(dayLink)}</ul> : null}
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))
                  )}
                </div>
              </div>
            </>,
            root,
          )
        : null}
    </div>
  );
}
