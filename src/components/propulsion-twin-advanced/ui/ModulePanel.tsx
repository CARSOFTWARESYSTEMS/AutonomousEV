"use client";
// One module of the tutorial. Every module is rendered on the server and stays
// in the document; this only decides which one is showing.
import type { ReactNode } from "react";
import { MODULE_BY_ID, MODULES } from "../data/product";
import { useLabStore } from "../state/labStore";
import type { ModuleId } from "../types";
import css from "../advancedTwin.module.css";

export default function ModulePanel({ id, children }: { id: ModuleId; children: ReactNode }) {
  const active = useLabStore((s) => s.module === id);
  const setModule = useLabStore((s) => s.setModule);
  const info = MODULE_BY_ID[id];
  const index = MODULES.findIndex((m) => m.id === id);
  const next = MODULES[index + 1];
  return (
    <section id={id} role="tabpanel" aria-labelledby={`tab-${id}`} className={css.module} hidden={!active} tabIndex={-1}>
      <header className={css.moduleHead}>
        <p className={css.moduleCount}>
          Module {index + 1} of {MODULES.length}
        </p>
        <h2 className={css.moduleTitle}>{info.title}</h2>
        <p className={css.moduleSummary}>{info.summary}</p>
      </header>
      {children}
      {next && (
        <p className={css.moduleNext}>
          <button type="button" className={css.nextButton} onClick={() => setModule(next.id)}>
            Next: {next.title} <span aria-hidden="true">→</span>
          </button>
        </p>
      )}
    </section>
  );
}
