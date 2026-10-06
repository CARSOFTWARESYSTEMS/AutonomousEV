"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { trackAqip } from "../analytics";
import css from "../interactive.module.css";

interface NavItem {
  id: string;
  label: string;
  executive?: boolean;
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The sticky strategy index. It follows the scroll position, moves to a section
 * when asked, and reports the page view and each section the reader reaches.
 */
interface StrategyNavProps {
  items: readonly NavItem[];
  /** A section after the last item that still counts as that item, e.g. the page's closing statement. */
  trailingId?: string;
}

export default function StrategyNav({ items, trailingId }: StrategyNavProps) {
  const [active, setActive] = useState(items[0].id);
  const list = useRef<HTMLUListElement>(null);
  const seen = useRef(new Set<string>());
  // Whether the list has more pills out of sight at its start and at its end.
  const [more, setMore] = useState({ start: false, end: false });

  useEffect(() => {
    trackAqip("aqip_page_view");
  }, []);

  // A thin band a third of the way down the viewport: the section crossing it is the current one.
  useEffect(() => {
    const last = items[items.length - 1].id;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id === trailingId ? last : entry.target.id);
      },
      { rootMargin: "-32% 0px -63% 0px" },
    );
    for (const id of [...items.map((item) => item.id), trailingId]) {
      const section = id ? document.getElementById(id) : null;
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [items, trailingId]);

  useEffect(() => {
    if (!seen.current.has(active)) {
      seen.current.add(active);
      trackAqip("aqip_section_view", { section: active });
    }
    // Keep the current pill visible in the horizontally scrolling list, without moving the page.
    const row = list.current;
    const pill = row?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (row && pill && typeof row.scrollTo === "function") {
      row.scrollTo({ left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, [active]);

  useEffect(() => {
    const row = list.current;
    if (!row) return;
    const update = () => setMore({ start: row.scrollLeft > 4, end: row.scrollLeft + row.clientWidth < row.scrollWidth - 4 });
    row.addEventListener("scroll", update, { passive: true });
    // A ResizeObserver reports once when it starts, which sets the initial state.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const row = list.current;
    row?.scrollBy({ left: direction * row.clientWidth * 0.7, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    section.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${id}`);
    trackAqip("aqip_strategy_nav_click", { section: id });
  };

  return (
    <nav className={css.nav} aria-label="Strategy index">
      <button type="button" className={css.navScroll} data-side="start" hidden={!more.start} aria-label="Show earlier sections" onClick={() => page(-1)} />
      <button type="button" className={css.navScroll} data-side="end" hidden={!more.end} aria-label="Show later sections" onClick={() => page(1)} />
      <ul ref={list} className={css.navList}>
        {items.map((item) => (
          <li key={item.id} data-executive={item.executive ? "" : undefined}>
            <a href={`#${item.id}`} className={css.navLink} data-id={item.id} aria-current={active === item.id ? "location" : undefined} onClick={(event) => go(event, item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
