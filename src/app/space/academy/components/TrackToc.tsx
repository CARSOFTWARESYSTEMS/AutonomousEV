"use client";
import { useLevel } from "@/components/space-academy/store";
import styles from "../academy.module.css";

/** Section links that follow the chosen level: the Advanced copy of each level section has its own anchor. */
export default function TrackToc({ sections, levelSections }: { sections: { id: string; label: string }[]; levelSections: string[] }) {
  const level = useLevel();
  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.tocTitle}>On this page</p>
      {sections.map((s) => (
        <a key={s.id} href={`#${level === "advanced" && levelSections.includes(s.id) ? `${s.id}-advanced` : s.id}`}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
