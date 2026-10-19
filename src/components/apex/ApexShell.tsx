import type { ReactNode } from "react";
import { ApexHeader } from "./ApexHeader";
import { ApexFooter } from "./ApexFooter";
import { PanelProvider } from "./PanelProvider";
import { ThemeRoot } from "./ThemeRoot";
import { apexDisplay, apexMono } from "./fonts";
import styles from "./apex.module.css";

/**
 * The microsite's own frame: theme, fonts, header, footer and the shared
 * detail panel. Nothing from the host site's chrome is used.
 *
 * `data-track-manual` (set by ThemeRoot) stops the site-wide click listener
 * from guessing at clicks here; every APEX link and control reports its own
 * declared event. Dark is the default theme; ThemeRoot applies a visitor's
 * choice of light.
 */
export function ApexShell({ children }: { children: ReactNode }) {
  return (
    <ThemeRoot className={`${styles.root} ${apexDisplay.variable} ${apexMono.variable}`}>
      <a href="#apex-main" className={styles.skipLink}>
        Skip to content
      </a>
      <PanelProvider>
        <ApexHeader />
        <main id="apex-main" tabIndex={-1} style={{ outline: "none" }}>
          {children}
        </main>
        <ApexFooter />
      </PanelProvider>
    </ThemeRoot>
  );
}
