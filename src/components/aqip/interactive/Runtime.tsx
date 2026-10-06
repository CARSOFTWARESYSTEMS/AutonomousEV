"use client";

import { useEffect } from "react";
import { jumpTo, useViewMode } from "./pageState";

/**
 * The page's behaviour that belongs to no single widget: it applies the view
 * mode to the page root, makes every in-page link open the chapter it points
 * into before scrolling there, honours a section link in the address on
 * arrival, and opens every collapsed answer for printing.
 */
export default function Runtime({ rootId }: { rootId: string }) {
  const mode = useViewMode();

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (root) root.dataset.mode = mode;
  }, [mode, rootId]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!link || !root.contains(link)) return;
      const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
      if (id && jumpTo(id)) event.preventDefault();
    };
    root.addEventListener("click", onClick);

    // Arriving on a link to a section: on a phone its chapter may be collapsed.
    if (window.location.hash.length > 1) jumpTo(decodeURIComponent(window.location.hash.slice(1)));

    const opened: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      root.querySelectorAll<HTMLDetailsElement>("details:not([open])").forEach((details) => {
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
      root.removeEventListener("click", onClick);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [rootId]);

  return null;
}
