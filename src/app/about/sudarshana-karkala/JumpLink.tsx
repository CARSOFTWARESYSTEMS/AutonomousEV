"use client";
// A link to a section of this page. Without script it is an ordinary anchor.
// With script it scrolls there in place and adds no step to the history.
//
// Why not leave it to the browser: a jump made by the browser adds a history
// entry the router knows nothing about, and Back from the next page then lands
// on it without restoring this page. Why not a router <Link>: the site's
// analytics would count the jump as another page view.
import type { MouseEvent, ReactNode } from "react";

export default function JumpLink({ targetId, className, children, ...rest }: { targetId: string; className?: string; children: ReactNode; "aria-label"?: string }) {
  const jump = (event: MouseEvent<HTMLAnchorElement>) => {
    // A click meant to open the link elsewhere is left alone.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView?.({ block: "start", behavior: calm ? "auto" : "smooth" });
    // Focus goes with it, so that the next Tab continues from the section and a screen reader announces it.
    const heading = target.querySelector<HTMLElement>("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  };
  return (
    <a href={`#${targetId}`} className={className} onClick={jump} {...rest}>
      {children}
    </a>
  );
}
