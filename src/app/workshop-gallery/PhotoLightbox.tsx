"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./PhotoLightbox.module.css";

export type LightboxPhoto = {
  src: string;
  label: string;
  width: number;
  height: number;
};

type Props = {
  photos: LightboxPhoto[];
  /** Index of the photo on show. */
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Names the dialog for assistive technology and heads the caption. */
  title: string;
  /** Second caption line, e.g. the event date and place. */
  subtitle?: string;
};

const FOCUSABLE = "button:not([disabled]), a[href]";
/** Horizontal travel, in CSS pixels, that counts as a swipe. */
const SWIPE_DISTANCE = 48;

/** Full-screen viewer for a set of photos, with previous/next navigation. */
export default function PhotoLightbox({ photos, index, onIndexChange, onClose, title, subtitle }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const count = photos.length;
  const hasSiblings = count > 1;
  const step = (delta: number) => onIndexChange((index + delta + count) % count);

  // The key handler is bound once, so it reaches the current props through a ref.
  const actions = useRef({ step, onClose, hasSiblings });
  useEffect(() => {
    actions.current = { step, onClose, hasSiblings };
  });

  // Scroll lock, keyboard handling, focus trap and focus restore.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        actions.current.onClose();
      } else if (e.key === "ArrowLeft" && actions.current.hasSiblings) {
        e.preventDefault();
        actions.current.step(-1);
      } else if (e.key === "ArrowRight" && actions.current.hasSiblings) {
        e.preventDefault();
        actions.current.step(1);
      } else if (e.key === "Tab" && dialog.current) {
        const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!dialog.current.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  if (typeof document === "undefined" || count === 0) return null;

  const photo = photos[index];
  // Fetch the neighbours ahead of time so stepping does not wait on the network.
  const neighbours = hasSiblings
    ? Array.from(new Set([(index + 1) % count, (index - 1 + count) % count])).filter((i) => i !== index)
    : [];

  return createPortal(
    <div
      ref={dialog}
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo viewer`}
      onClick={onClose}
    >
      <div className={styles.bar} onClick={(e) => e.stopPropagation()}>
        <p className={styles.counter} aria-live="polite" aria-atomic="true">
          Photo {index + 1} of {count}
        </p>
        <button
          ref={closeButton}
          type="button"
          className={styles.control}
          onClick={onClose}
          aria-label="Close photo viewer"
          data-track-event="gallery_lightbox_close"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {hasSiblings && (
        <button
          type="button"
          className={`${styles.control} ${styles.prev}`}
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
      )}

      {/* Swipe left or right to step through the photos on a touch screen. */}
      <div
        className={styles.stage}
        onPointerDown={(e) => {
          swipeStart.current = e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start || !hasSiblings) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.label}
          width={photo.width}
          height={photo.height}
          sizes="100vw"
          loading="eager"
          draggable={false}
          className={styles.image}
          // Never drawn larger than the file itself.
          style={{ maxWidth: `min(100%, ${photo.width}px)`, maxHeight: `min(100%, ${photo.height}px)` }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {hasSiblings && (
        <button
          type="button"
          className={`${styles.control} ${styles.next}`}
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label="Next photo"
        >
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      )}

      <div className={styles.caption} onClick={(e) => e.stopPropagation()}>
        <p className={styles.captionTitle}>{title}</p>
        {subtitle && <p className={styles.captionSubtitle}>{subtitle}</p>}
      </div>

      {neighbours.map((i) => (
        <Image
          key={photos[i].src}
          src={photos[i].src}
          alt=""
          aria-hidden="true"
          width={photos[i].width}
          height={photos[i].height}
          sizes="100vw"
          loading="eager"
          className={styles.preload}
        />
      ))}
    </div>,
    document.body,
  );
}
