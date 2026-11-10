"use client";
// Small persisted stores for the Academy: the learner's age level, their
// preferred view (3D or 2D) and each mission's progress. Everything lives in
// this browser's localStorage only; every read and write is guarded, because
// storage can be missing, full or blocked (private windows, previews).
import { useSyncExternalStore } from "react";
import type { Level } from "@/app/space/academy/data/curriculum";

const PREFIX = "space-academy:v1:";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/** Parsed value for a key, cached by its raw string so the snapshot stays referentially stable. */
function readValue<T>(key: string, fallback: T, parse: (raw: string) => T | null): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = fallback;
  if (raw !== null) {
    try {
      value = parse(raw) ?? fallback;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeValue(key: string, value: unknown) {
  memory.delete(key);
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    // Storage unavailable: the choice still applies for this visit through the in-memory fallback.
    if (value !== null) memory.set(key, value);
  }
  listeners.forEach((l) => l());
}

/** Values that could not be written to storage, so the page still responds within this visit. */
const memory = new Map<string, unknown>();

export function usePersisted<T>(key: string, fallback: T, parse: (raw: string) => T | null): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (memory.has(key)) return memory.get(key) as T;
      return readValue(key, fallback, parse);
    },
    () => fallback,
  );
}

// ── Age level ──

const parseLevel = (raw: string): Level | null => (raw === "foundation" || raw === "advanced" ? raw : null);

export function useLevel(): Level {
  return usePersisted<Level>("level", "foundation", parseLevel);
}

export function setLevel(level: Level) {
  writeValue("level", level);
}

// ── Preferred view ──

export type ViewPreference = "3d" | "2d" | "auto";
const parseView = (raw: string): ViewPreference | null => (raw === "3d" || raw === "2d" ? raw : null);

export function useViewPreference(): ViewPreference {
  return usePersisted<ViewPreference>("view", "auto", parseView);
}

export function setViewPreference(view: "3d" | "2d") {
  writeValue("view", view);
}

// ── Mission progress ──

export interface MissionProgress {
  completed: string[];
  finished: boolean;
  hintsUsed: number;
}

export const EMPTY_PROGRESS: MissionProgress = { completed: [], finished: false, hintsUsed: 0 };

function parseProgress(raw: string): MissionProgress | null {
  const data = JSON.parse(raw) as Partial<MissionProgress>;
  if (!data || !Array.isArray(data.completed)) return null;
  return {
    completed: data.completed.filter((s): s is string => typeof s === "string"),
    finished: Boolean(data.finished),
    hintsUsed: typeof data.hintsUsed === "number" ? data.hintsUsed : 0,
  };
}

export function useMissionProgress(slug: string): MissionProgress {
  return usePersisted<MissionProgress>(`progress:${slug}`, EMPTY_PROGRESS, parseProgress);
}

export function saveMissionProgress(slug: string, progress: MissionProgress | null) {
  writeValue(`progress:${slug}`, progress);
}
