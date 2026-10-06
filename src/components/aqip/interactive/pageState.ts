// State shared by the AQIP page's chrome: the view mode, which chapters are
// open on a phone, and the section the reader is in. Small module-level stores
// read with useSyncExternalStore, so the header, the chapter navigation and the
// chapters themselves agree without a provider wrapped around the page.
import { useSyncExternalStore } from "react";
import { CHAPTERS } from "../data/reference";

type Listener = () => void;

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// ── The section the reader is in ──
const activeSection = createStore<string>(CHAPTERS[0].sections[0]);
export const setActiveSection = activeSection.set;
export const useActiveSection = () => useSyncExternalStore(activeSection.subscribe, activeSection.get, () => CHAPTERS[0].sections[0]);

// ── Chapters open on a phone. Wider screens show every chapter regardless. ──
const INITIALLY_OPEN: ReadonlySet<string> = new Set([CHAPTERS[0].id]);
const openChapters = createStore<ReadonlySet<string>>(INITIALLY_OPEN);

export function setChapterOpen(id: string, open: boolean) {
  const current = openChapters.get();
  if (current.has(id) === open) return;
  const next = new Set(current);
  if (open) next.add(id);
  else next.delete(id);
  openChapters.set(next);
}

export function setAllChaptersOpen(open: boolean) {
  openChapters.set(open ? new Set(CHAPTERS.map((chapter) => chapter.id)) : new Set());
}

export const useChapterOpen = (id: string) =>
  useSyncExternalStore(
    openChapters.subscribe,
    () => openChapters.get().has(id),
    () => INITIALLY_OPEN.has(id),
  );

export const useOpenChapterCount = () =>
  useSyncExternalStore(
    openChapters.subscribe,
    () => openChapters.get().size,
    () => INITIALLY_OPEN.size,
  );

// ── View mode, remembered in this browser ──
export type ViewMode = "full" | "executive";
export const VIEW_MODE_KEY = "aqip:view-mode:v1";

// If storage is unavailable (private browsing, blocked site data) the choice lasts for the visit.
let modeInMemory: ViewMode = "full";
const modeListeners = new Set<Listener>();

function readMode(): ViewMode {
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_KEY);
    return stored === "executive" || stored === "full" ? stored : modeInMemory;
  } catch {
    return modeInMemory;
  }
}

export function setViewMode(mode: ViewMode) {
  modeInMemory = mode;
  try {
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {
    // Storage is unavailable: `modeInMemory` carries the choice.
  }
  for (const listener of modeListeners) listener();
}

function subscribeMode(listener: Listener) {
  modeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    modeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export const useViewMode = () => useSyncExternalStore<ViewMode>(subscribeMode, readMode, () => "full");

/** Puts every store back to its starting value. For tests, which share this module. */
export function resetPageState() {
  activeSection.set(CHAPTERS[0].sections[0]);
  openChapters.set(INITIALLY_OPEN);
  modeInMemory = "full";
  for (const listener of modeListeners) listener();
}

// ── Moving to a place on the page ──
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls to the element with this id, first opening the chapter that holds it
 * if a phone has it collapsed. Returns false when there is no such element.
 */
export function jumpTo(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const chapter = target.closest<HTMLElement>("[data-chapter]");
  const move = () => {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${id}`);
  };
  if (!chapter) {
    move();
    return true;
  }
  setChapterOpen(chapter.id, true);
  // The chapter may have been collapsed a moment ago: move once it has been laid out.
  requestAnimationFrame(() => requestAnimationFrame(move));
  return true;
}
