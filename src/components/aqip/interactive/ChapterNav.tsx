"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { trackAqip } from "../analytics";
import { CHAPTERS, chapterIsExecutive, chapterOf, sectionIsExecutive, sectionLabel } from "../data/reference";
import { jumpTo, setActiveSection, useActiveSection } from "./pageState";
import css from "../chrome.module.css";

interface ChapterNavProps {
  /** A section after the last chapter that still counts as its last section, e.g. the closing statement. */
  trailingId?: string;
}

const ALL_SECTIONS = CHAPTERS.flatMap((chapter) => chapter.sections);
const LAST_SECTION = ALL_SECTIONS[ALL_SECTIONS.length - 1];

/**
 * The sticky chapter bar. It names the chapter and section the reader is in,
 * lists that chapter's sections on wide screens, and opens the full contents:
 * seven chapters with their sections. On a phone the same control is the
 * "Jump to section" menu. It also reports the page view and each section reached.
 */
export default function ChapterNav({ trailingId }: ChapterNavProps) {
  const uid = useId();
  const active = useActiveSection();
  const chapter = chapterOf(active);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    trackAqip("aqip_page_view");
  }, []);

  // A thin band a third of the way down the viewport: the section crossing it is the current one.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id === trailingId ? LAST_SECTION : entry.target.id);
      },
      { rootMargin: "-32% 0px -63% 0px" },
    );
    for (const id of [...ALL_SECTIONS, trailingId]) {
      const section = id ? document.getElementById(id) : null;
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [trailingId]);

  useEffect(() => {
    if (seen.current.has(active)) return;
    seen.current.add(active);
    trackAqip("aqip_section_view", { section: active });
  }, [active]);

  // While the contents are open: Escape and a press outside close them.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !bar.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string, chapterId?: string) => {
    setOpen(false);
    if (chapterId) trackAqip("aqip_chapter_select", { chapter: chapterId, source: "index" });
    else trackAqip("aqip_strategy_nav_click", { section: id });
    // The page's own link handling may already have made the jump.
    if (!event.defaultPrevented && jumpTo(id)) event.preventDefault();
  };

  return (
    <nav ref={bar} className={css.chapterNav} aria-label="Chapters and sections">
      <div className={css.chapterNavInner}>
        <button ref={toggle} type="button" className={css.tocToggle} aria-expanded={open} aria-controls={`${uid}-toc`} onClick={() => setOpen(!open)}>
          <span className={css.tocHint}>Jump to section</span>
          <span className={css.tocNow}>
            <span className={css.tocNo}>{chapter.n}</span>
            <span className={css.tocChapter}>{chapter.title}</span>
            <span className={css.tocSection}>{sectionLabel(active)}</span>
          </span>
          <span className={css.chevron} aria-hidden="true" />
        </button>

        {/* Wide screens: the current chapter's sections, one click away. */}
        <ul className={css.subnav} aria-label={`Sections in ${chapter.title}`}>
          {chapter.sections.map((id) => (
            <li key={id} data-executive={sectionIsExecutive(id) ? "" : undefined}>
              <a href={`#${id}`} className={css.subnavLink} aria-current={id === active ? "location" : undefined} onClick={(event) => go(event, id)}>
                {sectionLabel(id)}
              </a>
            </li>
          ))}
        </ul>

        <div id={`${uid}-toc`} className={css.toc} hidden={!open}>
          <ol className={css.tocChapters}>
            {CHAPTERS.map((item) => (
              <li key={item.id} className={css.tocGroup} data-current={item.id === chapter.id ? "" : undefined} data-executive={chapterIsExecutive(item) ? "" : undefined}>
                <a href={`#${item.sections[0]}`} className={css.tocChapterLink} onClick={(event) => go(event, item.sections[0], item.id)}>
                  <span className={css.tocNo}>{item.n}</span>
                  {item.title}
                </a>
                <ul className={css.tocSections}>
                  {item.sections.map((id) => (
                    <li key={id} data-executive={sectionIsExecutive(id) ? "" : undefined}>
                      <a href={`#${id}`} className={css.tocLink} aria-current={id === active ? "location" : undefined} onClick={(event) => go(event, id)}>
                        {sectionLabel(id)}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
