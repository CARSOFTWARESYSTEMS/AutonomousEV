"use client";
import { useViewMode, type ViewMode } from "./ViewProvider";
import styles from "../everyday-applications.module.css";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "engineering", label: "Engineering View" },
  { id: "business", label: "Business View" },
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
          className={styles.levelTab}
          onClick={() => setView(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
