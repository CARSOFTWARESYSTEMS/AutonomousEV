"use client";

import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

/**
 * Scroll-locks the page while a mobile nav drawer is open, closes it on
 * Escape (restoring focus to the toggle button), and closes it if the
 * viewport crosses back into desktop width — where the toggle itself is
 * hidden by CSS and would otherwise leave the page stuck scroll-locked
 * with no visible control to dismiss the drawer.
 */
export function useMobileMenuLock(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  toggleRef: RefObject<HTMLButtonElement | null>,
  desktopBreakpoint = 1024,
) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const desktopQuery = window.matchMedia(`(min-width: ${desktopBreakpoint + 1}px)`);
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, [open, setOpen, toggleRef, desktopBreakpoint]);
}
