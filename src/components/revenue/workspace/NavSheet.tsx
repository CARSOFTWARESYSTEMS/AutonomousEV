"use client";
// Every workspace tool, grouped as on the desktop sidebar: the phone's "More"
// and the tablet's "All tools". A modal sheet: focus stays inside while it is
// open, Escape or the backdrop closes it, and the page behind does not scroll.
import { useEffect, useRef, type KeyboardEvent } from "react";
import { NAV_GROUPS } from "../data/framework";
import type { ViewId } from "../types";
import css from "../workspace.module.css";
import { hashFor } from "./nav";
import DataControls from "./DataControls";

export default function NavSheet({ current, onClose, onNavigate }: { current: ViewId; onClose: () => void; onNavigate: (view: ViewId) => void }) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("[aria-current='page'], a, button")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !sheet.current) return;
    const focusable = [...sheet.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input")];
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

  return (
    <div className={css.sheetBackdrop} onClick={onClose}>
      <div ref={sheet} className={css.sheet} role="dialog" aria-modal="true" aria-labelledby="rv-sheet-title" onClick={(event) => event.stopPropagation()} onKeyDown={onKeyDown}>
        <div className={css.sheetHead}>
          <h2 id="rv-sheet-title" className={css.sheetTitle}>
            All tools
          </h2>
          <button type="button" className={css.ghostButton} onClick={onClose}>
            Close
          </button>
        </div>
        <nav aria-label="All workspace tools" className={css.sheetNav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className={css.sheetGroup}>
              <p className={css.navGroupLabel}>{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={hashFor({ view: item.id })}
                      className={css.sheetLink}
                      aria-current={item.id === current ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate(item.id);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <DataControls />
      </div>
    </div>
  );
}
