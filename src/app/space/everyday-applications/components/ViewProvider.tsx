"use client";
import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

export type ViewMode = "simple" | "engineering" | "business";

const VIEWS: ViewMode[] = ["simple", "engineering", "business"];
const STORAGE_KEY = "everyday-applications-view-v1";
const EVENT_NAME = "everyday-applications-view-storage";

let memoryView: ViewMode = "simple";
let storageUnavailable = false;

function isViewMode(value: string | null): value is ViewMode {
  return !!value && (VIEWS as string[]).includes(value);
}

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT_NAME, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT_NAME, notify);
  };
}

function readView(): ViewMode {
  if (storageUnavailable) return memoryView;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isViewMode(saved) ? saved : memoryView;
  } catch {
    return memoryView;
  }
}

function writeView(next: ViewMode) {
  memoryView = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    storageUnavailable = true; // Private browsing / quota — retain editable session memory.
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

interface ViewContextValue {
  view: ViewMode;
  setView: (view: ViewMode) => void;
}

const Context = createContext<ViewContextValue | null>(null);

export function useViewMode() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing ViewProvider");
  return c;
}

export default function ViewProvider({ children }: { children: ReactNode }) {
  const getServerSnapshot = useCallback((): ViewMode => "simple", []);
  const view = useSyncExternalStore(subscribe, readView, getServerSnapshot);

  return <Context.Provider value={{ view, setView: writeView }}>{children}</Context.Provider>;
}
