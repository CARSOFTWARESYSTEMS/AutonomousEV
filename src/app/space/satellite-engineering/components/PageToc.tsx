"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "../satellite.module.css";

// One list serves both layouts: a single-line row from 1024px up, and an
// "On this page" disclosure below that. The links are always in the HTML;
// only the open/closed state of the disclosure lives on the client.
export default function PageToc({ links }: { links: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={styles.toc}
      aria-label="On this page"
      data-open={open || undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          (e.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
        }
      }}
    >
      <div className={styles.container}>
        <button
          type="button"
          className={styles.tocToggle}
          aria-expanded={open}
          aria-controls="page-toc-list"
          onClick={() => setOpen((o) => !o)}
        >
          <span>On this page</span>
          <ChevronDown size={18} aria-hidden="true" className={styles.tocChevron} />
        </button>
        <ul id="page-toc-list" className={styles.tocList}>
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
