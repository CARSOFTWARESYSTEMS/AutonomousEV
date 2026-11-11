"use client";
// Shared by the /space 3D visuals: device preferences, quality and viewport presence.
import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { getWebGLSupport } from "@/components/satellite-explorer/lib/capabilities";

export function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** "low" on software rendering, little memory or few cores. Null on the server, and where WebGL is missing. */
export function useStageQuality(): "high" | "low" | null {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const gl = getWebGLSupport();
      if (!gl.supported) return null;
      const nav = navigator as Navigator & { deviceMemory?: number };
      return gl.software || (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 ? "low" : "high";
    },
    () => null,
  );
}

/** near: within a screen of the viewport (mount the scene); onScreen: actually visible (animate it). */
export function usePresence(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const nearIo = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "320px 0px" });
    const seenIo = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 });
    nearIo.observe(el);
    seenIo.observe(el);
    return () => {
      nearIo.disconnect();
      seenIo.disconnect();
    };
  }, [ref]);
  return { near, onScreen };
}
