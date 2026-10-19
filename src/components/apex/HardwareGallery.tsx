"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { APEX_IMAGES, type ApexImage } from "@/data/apex/images";
import { ApexPicture } from "./ApexPicture";
import { trackApex } from "./analytics";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

/** APEX's photographs as a filmstrip, each opening full-screen with its audited caption. */
export function HardwareGallery({ ids, title = "Hardware record" }: { ids?: string[]; title?: string }) {
  const images: ApexImage[] = ids ? ids.map((id) => APEX_IMAGES.find((image) => image.id === id)!).filter(Boolean) : [...APEX_IMAGES];
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  useEffect(() => () => {
    document.documentElement.style.overflow = "";
  }, []);

  const step = useCallback(
    (delta: number) => setIndex((current) => (current === null ? current : (current + delta + images.length) % images.length)),
    [images.length],
  );

  const current = index === null ? null : images[index];

  return (
    <div className={sections.gallery}>
      <div className={sections.galleryHead}>
        <h3 className={styles.h4}>{title}</h3>
        <p className={styles.small}>{images.length} photographs supplied by APEX · Select to enlarge</p>
      </div>
      <ul className={sections.thumbs} aria-label="APEX hardware photographs">
        {images.map((image, i) => (
          <li key={image.id} style={{ display: "contents" }}>
            <button
              type="button"
              className={sections.thumb}
              onClick={(event) => {
                event.currentTarget.focus();
                triggerRef.current = event.currentTarget;
                setIndex(i);
                trackApex("apex_gallery_open", { image_id: image.id });
              }}
              aria-label={`Fig. ${image.id} — enlarge: ${image.publicCaption}`}
            >
              <span className={sections.thumbMedia}>
                <ApexPicture image={image} sizes="220px" cover alt="" />
              </span>
              <span className={sections.thumbLabel}>Fig. {image.id}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={`${sections.lightbox} ${styles.forceDark}`}
        aria-label={current ? `Figure ${current.id}` : "Photograph"}
        onClose={() => {
          setIndex(null);
          document.documentElement.style.overflow = "";
          const trigger = triggerRef.current;
          if (trigger) requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {current && (
          <div className={sections.lightboxInner}>
            <div className={sections.lightboxTop}>
              <p className={styles.mono} style={{ color: "var(--apex-text-2)" }}>
                Fig. {current.id} · {index! + 1} / {images.length}
              </p>
              <button type="button" className={sections.iconButton} onClick={() => setIndex(null)} aria-label="Close photograph" autoFocus>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className={sections.lightboxStage}>
              <ApexPicture key={current.id} image={current} sizes="(min-width: 1200px) 1100px, 100vw" />
            </div>
            <div className={sections.lightboxFoot}>
              <button type="button" className={sections.iconButton} onClick={() => step(-1)} aria-label="Previous photograph">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <p className={styles.small} style={{ textAlign: "center", color: "var(--apex-text-2)" }} aria-live="polite">
                {current.publicCaption}
              </p>
              <button type="button" className={sections.iconButton} onClick={() => step(1)} aria-label="Next photograph">
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
