"use client";

import type { ReactNode } from "react";
import type { ChapterDef } from "../data/reference";
import { trackAqip } from "../analytics";
import { setChapterOpen, useChapterOpen } from "./pageState";
import css from "../chrome.module.css";

interface ChapterProps {
  chapter: ChapterDef;
  /** Has something to show in Executive View. */
  executive?: boolean;
  children: ReactNode;
}

/**
 * One of the manual's seven chapters: its number and title, then its sections.
 * On a phone a chapter can be closed to shorten the page; on wider screens the
 * stylesheet shows every chapter and hides the control. The sections are always
 * in the document, so they are in the server HTML, in print and in search.
 */
export default function Chapter({ chapter, executive, children }: ChapterProps) {
  const open = useChapterOpen(chapter.id);
  const bodyId = `${chapter.id}-body`;

  return (
    <section id={chapter.id} className={css.chapter} data-chapter="" data-executive={executive ? "" : undefined} aria-labelledby={`${chapter.id}-no ${chapter.id}-title`}>
      <div className={css.chapterHead}>
        <p className={css.chapterLabel}>
          <span id={`${chapter.id}-no`} className={css.chapterNo}>
            {chapter.n}
          </span>
          <span id={`${chapter.id}-title`} className={css.chapterTitle}>
            {chapter.title}
          </span>
        </p>
        <p className={css.chapterSummary}>{chapter.summary}</p>
        <button
          type="button"
          className={css.chapterToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            setChapterOpen(chapter.id, !open);
            if (!open) trackAqip("aqip_chapter_select", { chapter: chapter.id, source: "chapter" });
          }}
        >
          {open ? "Close chapter" : "Open chapter"}
          <span className={css.chevron} aria-hidden="true" />
        </button>
      </div>
      <div id={bodyId} className={css.chapterBody} data-open={open ? "" : undefined} data-aqip-chapter-body="">
        {children}
      </div>
    </section>
  );
}
