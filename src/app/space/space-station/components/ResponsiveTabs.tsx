"use client";
import { useRef, useState } from "react";
import styles from "../station.module.css";

/**
 * Tabs on phones, all panels visible on larger screens. Every panel is always
 * rendered (inactive ones are only hidden with CSS on phones), so server-rendered
 * content stays in the HTML for readers, search and assistive technology.
 */
export default function ResponsiveTabs({ label, tabs, layout }: { label: string; tabs: { id: string; label: string; content: React.ReactNode }[]; layout?: string }) {
  const [active, setActive] = useState(tabs[0].id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(tabs[n].id);
    refs.current[n]?.focus();
  };
  return (
    <div className={styles.rtabs}>
      <div className={styles.rtabList} role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${label}-tab-${t.id}`.replace(/\s+/g, "-")}
            aria-selected={active === t.id}
            aria-controls={`${label}-panel-${t.id}`.replace(/\s+/g, "-")}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                move(i + 1);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                move(i - 1);
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={layout}>
        {tabs.map((t) => (
          <div
            key={t.id}
            id={`${label}-panel-${t.id}`.replace(/\s+/g, "-")}
            role="tabpanel"
            aria-labelledby={`${label}-tab-${t.id}`.replace(/\s+/g, "-")}
            data-panel={t.id}
            data-active={active === t.id}
            className={styles.rtabPanel}
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
