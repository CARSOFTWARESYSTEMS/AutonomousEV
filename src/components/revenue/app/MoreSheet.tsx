"use client";
// "More": everything that is not one of the four essentials. A modal sheet —
// focus stays inside while it is open, Escape or the backdrop closes it.
import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { LINK_EVENTS } from "../analytics";
import { INTERNSHIP, ROUTES } from "../data/framework";
import css from "../app.module.css";
import DataControls from "./DataControls";

const GROUPS: readonly { label: string; links: readonly { label: string; href: string }[] }[] = [
  {
    label: "Journey",
    links: [
      { label: "Marketing · Weeks 1–4", href: ROUTES.marketing },
      { label: "Sales · Weeks 5–8", href: ROUTES.sales },
      { label: "Execution · Weeks 9–12", href: ROUTES.execution },
    ],
  },
  {
    label: "Reference",
    links: [
      { label: "Case Study: Balloon Drawings & AS9102 FAI", href: ROUTES.caseStudy },
      { label: "Gates & weekly challenge", href: `${ROUTES.today}#gates` },
      { label: "Revenue model", href: `${ROUTES.pipeline}#revenue-model` },
      { label: "Programme overview", href: ROUTES.overview },
    ],
  },
];

export default function MoreSheet({ onClose }: { onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("a, button")?.focus();
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
    const focusable = [...sheet.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
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
      <div ref={sheet} className={css.sheet} role="dialog" aria-modal="true" aria-labelledby="rv-more-title" onClick={(event) => event.stopPropagation()} onKeyDown={onKeyDown}>
        <div className={css.sheetHead}>
          <h2 id="rv-more-title" className={css.sheetTitle}>
            More
          </h2>
          <button type="button" className={css.ghostButton} onClick={onClose}>
            Close
          </button>
        </div>
        {GROUPS.map((group) => (
          <div key={group.label} className={css.sheetGroup}>
            <p className={css.sheetLabel}>{group.label}</p>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={css.sheetLink} onClick={onClose}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link href={INTERNSHIP.apply.url} className={css.primaryButton} data-track-event={LINK_EVENTS.apply} data-track-source="more" onClick={onClose}>
          {INTERNSHIP.apply.label}
        </Link>
        <DataControls />
      </div>
    </div>
  );
}
