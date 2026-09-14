"use client";
import { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { RocketComponent } from "../rocketData";
import ComponentDetailBody from "./ComponentDetailBody";
import styles from "../model-rocketry.module.css";

export default function ComponentSheet({
  component,
  components,
  onClose,
  onSelect,
}: {
  component: RocketComponent | null;
  components: RocketComponent[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const open = !!component;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    sheetRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!component) return null;

  const currentIndex = components.findIndex((c) => c.id === component.id);
  const prev = currentIndex > 0 ? components[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < components.length - 1 ? components[currentIndex + 1] : null;

  const onHandleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onHandleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 50) onClose();
    touchStartY.current = null;
  };

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={component.name}
        tabIndex={-1}
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.sheetHandle}
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
          aria-hidden="true"
        />
        <button type="button" aria-label="Close" onClick={onClose} className={styles.sheetClose}>
          <X size={18} />
        </button>
        <ComponentDetailBody component={component} />
        <div className={styles.sheetPrevNext}>
          <button
            type="button"
            className={styles.sheetPrevNextButton}
            disabled={!prev}
            onClick={() => prev && onSelect(prev.id)}
          >
            <ChevronLeft size={16} /> Previous component
          </button>
          <button
            type="button"
            className={styles.sheetPrevNextButton}
            disabled={!next}
            onClick={() => next && onSelect(next.id)}
          >
            Next component <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
