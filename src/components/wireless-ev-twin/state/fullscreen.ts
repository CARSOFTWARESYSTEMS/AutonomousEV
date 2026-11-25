"use client";
// Full-screen research environment. Uses the Fullscreen API on the whole
// application (twin, panels, section navigation and modes); where the API is
// missing or refused (iPhone Safari), a fixed full-viewport layer stands in.
import { useEffect } from "react";
import { useTwin } from "./store";

export const APP_ID = "research-laboratory";

type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type FsDocument = Document & { webkitExitFullscreen?: () => Promise<void> | void; webkitFullscreenElement?: Element | null };

const activeElement = () => {
  const d = document as FsDocument;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
};

export async function enterFullscreen() {
  const el = document.getElementById(APP_ID) as FsElement | null;
  if (!el) return;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else throw new Error("Fullscreen API unavailable");
    useTwin.setState({ fullscreen: "native" });
  } catch {
    useTwin.setState({ fullscreen: "overlay" });
  }
}

export function exitFullscreen() {
  const d = document as FsDocument;
  // The browser's promise is not awaited: the store follows at once, and fullscreenchange confirms.
  if (activeElement()) {
    try {
      void Promise.resolve(d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.()).catch(() => {});
    } catch {
      /* already left */
    }
  }
  useTwin.setState({ fullscreen: "off" });
}

export const toggleFullscreen = () => (useTwin.getState().fullscreen === "off" ? enterFullscreen() : exitFullscreen());

/** Keeps the store in step with the browser (Esc, the system UI) and locks page scroll under the overlay. */
export function useFullscreenSync() {
  const mode = useTwin((s) => s.fullscreen);
  useEffect(() => {
    const onChange = () => {
      if (!activeElement() && useTwin.getState().fullscreen === "native") useTwin.setState({ fullscreen: "off" });
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);
  useEffect(() => {
    if (mode !== "overlay") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [mode]);
  // F toggles, unless the visitor is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || (e.key !== "f" && e.key !== "F")) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      void toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
