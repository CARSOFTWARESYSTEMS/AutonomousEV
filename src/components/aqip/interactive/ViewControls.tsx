"use client";

import { CHAPTERS } from "../data/reference";
import { trackAqip } from "../analytics";
import { setAllChaptersOpen, setViewMode, useOpenChapterCount, useViewMode, type ViewMode } from "./pageState";
import css from "../chrome.module.css";

const MODES: readonly { id: ViewMode; label: string; note: string }[] = [
  { id: "executive", label: "Executive View", note: "~10-minute overview" },
  { id: "full", label: "Full Operating Manual", note: "Complete strategy & execution reference" },
];

/**
 * How the manual is read: the short Executive View or the full manual, with the
 * choice remembered in this browser. Also the print action and, on a phone, a
 * way to open or close every chapter at once.
 */
export default function ViewControls({ sections }: { sections: readonly string[] }) {
  const mode = useViewMode();
  const openCount = useOpenChapterCount();

  const choose = (next: ViewMode) => {
    if (next === mode) return;
    setViewMode(next);
    trackAqip("aqip_view_mode", { mode: next });
  };

  return (
    <section className={css.viewBar} aria-label="How to read this manual">
      <div className={css.viewInner}>
        <div className={css.modes} role="group" aria-label="View">
          {MODES.map((item) => (
            <button key={item.id} type="button" className={css.mode} aria-pressed={mode === item.id} onClick={() => choose(item.id)}>
              <span className={css.modeLabel}>{item.label}</span>
              <span className={css.modeNote}>{item.note}</span>
            </button>
          ))}
        </div>
        <div className={css.viewActions}>
          <div className={css.chapterActions} role="group" aria-label="Chapters">
            <button type="button" className={css.quiet} onClick={() => setAllChaptersOpen(true)} disabled={openCount === CHAPTERS.length}>
              Expand all
            </button>
            <button type="button" className={css.quiet} onClick={() => setAllChaptersOpen(false)} disabled={openCount === 0}>
              Collapse all
            </button>
          </div>
          <button
            type="button"
            className={css.quiet}
            onClick={() => {
              trackAqip("aqip_print");
              window.print();
            }}
          >
            Print / Executive Brief
          </button>
        </div>
        <p className={css.viewNote} role="status">
          {mode === "executive" ? `Executive View: ${sections.join(", ")}.` : "Full Operating Manual: all seven chapters."}
        </p>
      </div>
    </section>
  );
}
