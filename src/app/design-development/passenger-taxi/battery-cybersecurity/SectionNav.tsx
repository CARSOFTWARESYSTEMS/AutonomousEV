"use client";

import { useRef } from "react";
import { useActiveSection } from "./useActiveSection";
import styles from "./SectionNav.module.css";

export interface SectionNavItem {
  id: string;
  label: string;
}

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const ids = items.map((i) => i.id);
  const activeId = useActiveSection(ids);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      scrollTo(items[nextIndex].id);
    }
  };

  return (
    <nav className={styles.nav} aria-label="Battery cybersecurity page sections">
      <div className="container">
        <div className={styles.scroller} role="tablist" aria-label="Jump to a section of this page">
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                href={`#${item.id}`}
                role="tab"
                id={`bcs-tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={item.id}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? styles.tabActive : styles.tab}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                data-track-event="bcs_section_nav_selected"
                data-track-section={item.id}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
