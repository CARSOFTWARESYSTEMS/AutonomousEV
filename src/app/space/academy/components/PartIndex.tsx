"use client";
import { useLevel } from "@/components/space-academy/store";
import styles from "../academy.module.css";

/** Links to a track page part's sections. Each level has its own copy of a section, so the links follow the chosen level. */
export default function PartIndex({ label, sections }: { label: string; sections: { id: string; label: string }[] }) {
  const level = useLevel();
  return (
    <nav className={styles.partIndex} aria-label={label}>
      {sections.map((s) => (
        <a key={s.id} href={`#${level === "advanced" ? `${s.id}-advanced` : s.id}`}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
