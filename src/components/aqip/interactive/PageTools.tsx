"use client";

import { useEffect, useState } from "react";
import { trackAqip } from "../analytics";
import css from "../interactive.module.css";

interface PageToolsProps {
  /** The element whose `data-mode` the stylesheet reads. */
  rootId: string;
  /** What Executive Mode keeps, named for the reader. */
  sections: readonly string[];
}

/** Executive Mode and the print action. Printing opens every collapsed answer first. */
export default function PageTools({ rootId, sections }: PageToolsProps) {
  const [executive, setExecutive] = useState(false);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (root) root.dataset.mode = executive ? "executive" : "full";
  }, [executive, rootId]);

  useEffect(() => {
    const opened: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      document.querySelectorAll<HTMLDetailsElement>(`#${rootId} details:not([open])`).forEach((details) => {
        details.open = true;
        opened.push(details);
      });
    };
    const afterPrint = () => {
      for (const details of opened.splice(0)) details.open = false;
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [rootId]);

  const setMode = (next: boolean) => {
    if (next === executive) return;
    setExecutive(next);
    trackAqip("aqip_view_mode", { mode: next ? "executive" : "full" });
  };

  return (
    <div className={css.tools}>
      <div className={css.segmented} role="group" aria-label="View">
        <button type="button" aria-pressed={!executive} onClick={() => setMode(false)}>
          Full manual
        </button>
        <button type="button" aria-pressed={executive} onClick={() => setMode(true)}>
          Executive Mode
        </button>
      </div>
      <button
        type="button"
        className={css.toolButton}
        onClick={() => {
          trackAqip("aqip_print");
          window.print();
        }}
      >
        Print / Executive Brief
      </button>
      <p className={css.toolsNote} role="status">
        {executive ? `Executive Mode: showing ${sections.join(", ")}.` : "Showing the full operating manual."}
      </p>
    </div>
  );
}
