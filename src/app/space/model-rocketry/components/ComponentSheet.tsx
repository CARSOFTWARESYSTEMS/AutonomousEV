"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { RocketComponent } from "../rocketData";
import ComponentDetailBody from "./ComponentDetailBody";
import styles from "../model-rocketry.module.css";

export default function ComponentSheet({
  component,
  onClose,
}: {
  component: RocketComponent | null;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
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
        <button type="button" aria-label="Close" onClick={onClose} className={styles.sheetClose}>
          <X size={18} />
        </button>
        <ComponentDetailBody component={component} />
      </div>
    </div>
  );
}
