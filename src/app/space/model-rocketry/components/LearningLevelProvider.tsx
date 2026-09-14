"use client";
import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { LearningLevel } from "../rocketData";

const LEVELS: LearningLevel[] = ["beginner", "intermediate", "advanced"];
const STORAGE_KEY = "model-rocketry-level-v1";
const EVENT_NAME = "model-rocketry-level-storage";

let memoryLevel: LearningLevel = "beginner";
let storageUnavailable = false;

function isLearningLevel(value: string | null): value is LearningLevel {
  return !!value && (LEVELS as string[]).includes(value);
}

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT_NAME, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT_NAME, notify);
  };
}

function readLevel(): LearningLevel {
  if (storageUnavailable) return memoryLevel;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLearningLevel(saved) ? saved : memoryLevel;
  } catch {
    return memoryLevel;
  }
}

function writeLevel(next: LearningLevel) {
  memoryLevel = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    storageUnavailable = true; // Private browsing / quota — retain editable session memory.
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

interface LearningLevelContextValue {
  level: LearningLevel;
  setLevel: (level: LearningLevel) => void;
  isAtLeast: (level: LearningLevel) => boolean;
}

const Context = createContext<LearningLevelContextValue | null>(null);

export function useLearningLevel() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing LearningLevelProvider");
  return c;
}

export default function LearningLevelProvider({ children }: { children: ReactNode }) {
  const getServerSnapshot = useCallback((): LearningLevel => "beginner", []);
  const level = useSyncExternalStore(subscribe, readLevel, getServerSnapshot);
  const isAtLeast = (target: LearningLevel) => LEVELS.indexOf(level) >= LEVELS.indexOf(target);

  return <Context.Provider value={{ level, setLevel: writeLevel, isAtLeast }}>{children}</Context.Provider>;
}
