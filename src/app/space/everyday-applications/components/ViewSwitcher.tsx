"use client";
import { useViewMode, type ViewMode } from "./ViewProvider";
import styles from "../everyday-applications.module.css";

const VIEWS: { id: ViewMode; label: string; shortLabel: string }[] = [
  { id: "simple", label: "Simple", shortLabel: "Simple" },
  { id: "engineering", label: "Engineering View", shortLabel: "Engineer" },
  { id: "business", label: "Business View", shortLabel: "Business" },
];

export default function ViewSwitcher() {
  const { view, setView } = useViewMode();
  return (
    <div className={styles.levelSwitcher} role="tablist" aria-label="View mode">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={view === v.id}
          aria-label={v.label}
          className={styles.levelTab}
          onClick={() => setView(v.id)}
        >
          <span className={styles.fullLabel}>{v.label}</span>
          <span className={styles.shortLabel}>{v.shortLabel}</span>
        </button>
      ))}
    </div>
  );
}
