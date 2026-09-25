"use client";
import { createContext, useContext, useState } from "react";
import styles from "../station.module.css";

export type Mode = "learn" | "engineering" | "research";
const ORDER: Mode[] = ["learn", "engineering", "research"];
const LABEL: Record<Mode, string> = { learn: "Learn", engineering: "Engineering", research: "Research" };
const HINT: Record<Mode, string> = {
  learn: "Plain-language explanations and visual simulators.",
  engineering: "Adds variables, equations, units, sensors and failure modes.",
  research: "Adds open problems, research questions and literature entry points.",
};

const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: "learn", setMode: () => {} });

export function ModeProvider({ children, initial = "learn" }: { children: React.ReactNode; initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}

export function atLeast(mode: Mode, min: Mode) {
  return ORDER.indexOf(mode) >= ORDER.indexOf(min);
}

/** Renders children only when the page mode is at least `min`. */
export function Depth({ min, children }: { min: Mode; children: React.ReactNode }) {
  const { mode } = useMode();
  return atLeast(mode, min) ? <>{children}</> : null;
}

export function ModeSelector() {
  const { mode, setMode } = useMode();
  return (
    <div className={styles.modeBar} role="region" aria-label="Depth mode">
      <span className={styles.modeLabel} id="mode-label">
        Mode
      </span>
      <div className={styles.segmented} role="group" aria-labelledby="mode-label">
        {ORDER.map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
            {LABEL[m]}
          </button>
        ))}
      </div>
      <span className={styles.modeHint} aria-live="polite">
        {LABEL[mode]} mode: {HINT[mode]}
      </span>
    </div>
  );
}
