"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { CHAPTERS } from "../applicationsData";
import { useActiveSection } from "./useActiveSection";
import styles from "../everyday-applications.module.css";

const ALL_SECTION_IDS = CHAPTERS.flatMap((chapter) => chapter.sections.map((s) => s.href.slice(1)));

export default function MobileChapterNav() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const activeSectionId = useActiveSection(ALL_SECTION_IDS);
  const activeChapterIndex = Math.max(
    0,
    CHAPTERS.findIndex((chapter) => chapter.sections.some((s) => s.href.slice(1) === activeSectionId))
  );
  const activeChapter = CHAPTERS[activeChapterIndex];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    sheetRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.chapterNav}>
      <button
        type="button"
        className={styles.chapterNavButton}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={styles.chapterNavCount}>
          {String(activeChapterIndex + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </span>
        <span className={styles.chapterNavTitle}>{activeChapter.title}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.sheetBackdrop} onClick={() => setOpen(false)}>
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a chapter"
            tabIndex={-1}
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className={styles.sheetClose}>
              <X size={18} />
            </button>
            <h3 style={{ marginTop: 0 }}>Find your way around</h3>
            <p className={styles.formNote} style={{ marginTop: -4, marginBottom: 16 }}>
              Chapter {activeChapterIndex + 1} of {CHAPTERS.length}
            </p>
            <ol className={styles.chapterList}>
              {CHAPTERS.map((chapter, i) => (
                <li key={chapter.id} className={styles.chapterListItem} data-active={i === activeChapterIndex}>
                  <div className={styles.chapterListHead}>
                    <span className={styles.chapterListNumber}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.chapterListTitle}>{chapter.title}</span>
                  </div>
                  <div className={styles.chapterListLinks}>
                    {chapter.sections.map((s) => (
                      <a key={s.href} href={s.href} onClick={() => setOpen(false)}>
                        {s.label}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
