"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { PERSONAS, type Persona } from "../applicationsData";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../everyday-applications.module.css";

export default function PersonaSelector({
  persona,
  onChange,
}: {
  persona: Persona | null;
  onChange: (persona: Persona | null) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    sheetRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const currentLabel = persona ? PERSONAS.find((p) => p.id === persona)?.label ?? "Everyone" : "Everyone";

  if (!isDesktop) {
    return (
      <>
        <button
          type="button"
          className={styles.chapterNavButton}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={styles.chapterNavTitle}>{currentLabel}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {open && (
          <div className={styles.sheetBackdrop} onClick={() => setOpen(false)}>
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Who are you?"
              tabIndex={-1}
              className={styles.sheet}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className={styles.sheetClose}>
                <X size={18} />
              </button>
              <h3 style={{ marginTop: 0 }}>Who are you?</h3>
              <div className={styles.personaOptionList}>
                <button
                  type="button"
                  className={styles.personaOption}
                  data-active={persona === null}
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  Everyone
                </button>
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.personaOption}
                    data-active={persona === p.id}
                    onClick={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.levelSwitcher} role="tablist" aria-label="Who are you?">
      <button
        type="button"
        role="tab"
        aria-selected={persona === null}
        className={styles.levelTab}
        onClick={() => onChange(null)}
      >
        Everyone
      </button>
      {PERSONAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={persona === p.id}
          className={styles.levelTab}
          onClick={() => onChange(persona === p.id ? null : p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
