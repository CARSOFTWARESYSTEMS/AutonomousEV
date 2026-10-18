"use client";
// Which experience this device gets. The full 3D workspace needs a
// desktop-sized viewport and working WebGL; phones get the 2D path and never
// create a WebGL context. Same gating as the Satellite Explorer.
import { useSyncExternalStore } from "react";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, getWebGLSupport } from "@/components/satellite-explorer/lib/capabilities";

export type Device = "pending" | "desktop" | "mobile" | "fallback";

function subscribe(notify: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

function snapshot(): Device {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return "mobile";
  return getWebGLSupport().supported ? "desktop" : "fallback";
}

export function useDevice(): Device {
  return useSyncExternalStore<Device>(subscribe, snapshot, () => "pending");
}

function subscribeMotion(notify: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION_QUERY).matches, () => false);
}

/** Scrolls to an element (respecting reduced motion) and moves focus to it. */
export function scrollToAndFocus(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  el.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
