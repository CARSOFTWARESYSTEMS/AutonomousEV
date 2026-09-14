"use client";
import { PERSONAS, type Persona } from "../applicationsData";
import styles from "../everyday-applications.module.css";

export default function PersonaSelector({
  persona,
  onChange,
}: {
  persona: Persona | null;
  onChange: (persona: Persona | null) => void;
}) {
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
