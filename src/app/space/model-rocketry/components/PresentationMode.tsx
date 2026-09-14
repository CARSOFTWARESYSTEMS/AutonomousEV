"use client";
import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, NotebookText, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDES } from "../presentationData";
import PresentationSlide from "./PresentationSlide";
import styles from "../model-rocketry.module.css";

export default function PresentationMode({ onExit }: { onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goNext = () => setIndex((i) => Math.min(SLIDES.length - 1, i + 1));
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        goNext();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
        else onExit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current?.requestFullscreen();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) goPrev();
    else if (delta < -50) goNext();
    touchStartX.current = null;
  };

  const slide = SLIDES[index];

  return (
    <div
      ref={containerRef}
      className={styles.presentation}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Model Rocketry presentation"
      aria-roledescription="slide"
    >
      <div className={styles.presentationTopBar}>
        <span className={styles.slideCounter}>
          {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
        <div className={styles.presentationControls}>
          <button
            type="button"
            className={styles.presentationIconButton}
            aria-pressed={showNotes}
            aria-label={showNotes ? "Hide speaker notes" : "Show speaker notes"}
            onClick={() => setShowNotes((v) => !v)}
          >
            <NotebookText size={18} />
          </button>
          <button
            type="button"
            className={styles.presentationIconButton}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button type="button" className={styles.presentationIconButton} aria-label="Exit presentation" onClick={onExit}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.presentationBody}>
        <button type="button" className={styles.presentationNavButton} onClick={goPrev} disabled={index === 0} aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <PresentationSlide slide={slide} showNotes={showNotes} />
        <button
          type="button"
          className={styles.presentationNavButton}
          onClick={goNext}
          disabled={index === SLIDES.length - 1}
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className={styles.presentationProgress} aria-hidden="true">
        {SLIDES.map((s, i) => (
          <span key={s.id} className={styles.presentationDot} data-active={i === index} />
        ))}
      </div>
    </div>
  );
}
