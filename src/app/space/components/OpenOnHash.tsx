"use client";

import { useEffect } from "react";

/**
 * Collapsed panels on /space keep their anchors (#labs, #roadmap, …), and the
 * header, the pathway cards and other pages link to them. This opens the
 * panel a link points at, so the visitor lands on its content rather than on
 * a closed summary: on load, on hash changes, and on same-page link clicks
 * (Next.js changes the hash with pushState, which fires no hashchange).
 */
export function revealTarget(id: string): boolean {
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  let opened = false;
  const own = target.matches("details") ? (target as HTMLDetailsElement) : target.querySelector<HTMLDetailsElement>("details[data-panel]");
  if (own && !own.open) {
    own.open = true;
    opened = true;
  }
  for (let d = target.parentElement?.closest("details"); d; d = d.parentElement?.closest("details")) {
    if (!d.open) {
      d.open = true;
      opened = true;
    }
  }
  return opened;
}

const idFromHash = (hash: string) => {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
};

export default function OpenOnHash() {
  useEffect(() => {
    const fromLocation = () => {
      const id = idFromHash(window.location.hash);
      if (revealTarget(id)) document.getElementById(id)?.scrollIntoView?.({ block: "start" });
    };
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      // Open before the browser (or the router) scrolls, so it scrolls to the opened panel.
      revealTarget(idFromHash(url.hash));
    };
    fromLocation();
    window.addEventListener("hashchange", fromLocation);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", fromLocation);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
