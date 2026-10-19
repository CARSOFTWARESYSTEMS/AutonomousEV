"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { trackApex } from "./analytics";
import styles from "./apex.module.css";

export type ApexTheme = "dark" | "light";

/** Where a visitor's choice is kept. Dark is the default; nothing is stored until the visitor chooses. */
export const APEX_THEME_KEY = "apex-theme";

const listeners = new Set<() => void>();

function readTheme(): ApexTheme {
  try {
    return window.localStorage.getItem(APEX_THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === APEX_THEME_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeTheme(theme: ApexTheme) {
  try {
    window.localStorage.setItem(APEX_THEME_KEY, theme);
  } catch {
    // Private windows may refuse storage; the theme still changes for this page.
  }
  memory = theme;
  listeners.forEach((listener) => listener());
}

let memory: ApexTheme | null = null;
const clientTheme = () => memory ?? readTheme();
const serverTheme = (): ApexTheme => "dark";

const ThemeContext = createContext<{ theme: ApexTheme; setTheme: (theme: ApexTheme) => void }>({ theme: "dark", setTheme: () => {} });

/**
 * Runs while the HTML is parsed, before first paint, so a visitor who chose the
 * light theme never sees a dark flash. It only sets the attribute that the
 * component below then keeps in step.
 */
const PRE_PAINT = `try{if(localStorage.getItem("${APEX_THEME_KEY}")==="light")document.currentScript.parentElement.setAttribute("data-apex-theme","light")}catch(e){}`;

/** The microsite's root element: owns the theme attribute every token reads. */
export function ThemeRoot({ className, children }: { className: string; children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, clientTheme, serverTheme);
  const setTheme = useCallback((next: ApexTheme) => writeTheme(next), []);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* suppressHydrationWarning: the pre-paint script may already have set the stored theme. */}
      <div className={className} data-apex-theme={theme} data-track-manual="" data-apex-site="" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useApexTheme() {
  return useContext(ThemeContext);
}

/** The light / dark switch: a toggle button, pressed when the light theme is on. */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { theme, setTheme } = useApexTheme();
  const next: ApexTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={className}
      aria-label="Light theme"
      aria-pressed={theme === "light"}
      title={theme === "light" ? "Switch to the dark theme" : "Switch to the light theme"}
      onClick={() => {
        setTheme(next);
        trackApex("apex_theme_change", { theme: next });
      }}
    >
      {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      {withLabel && <span className={styles.mono}>Light theme</span>}
    </button>
  );
}
