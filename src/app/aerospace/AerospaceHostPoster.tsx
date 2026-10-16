"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./AerospaceHostPoster.module.css";

/** The only host the poster is shown on. aerospace.ev.engineer/ redirects to /aerospace (next.config.ts). */
export const POSTER_HOST = "aerospace.ev.engineer";

export const PROFILE_PATH = "/about/sudarshana-karkala";

const WHATSAPP_MESSAGE =
  "Hi Sudarshana, I visited aerospace.ev.engineer and would like to connect about Aerospace Quality Intelligence.";
export const WHATSAPP_URL = `https://wa.me/919845561518?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const POSTER = {
  src: "/aerospace/sudarshana-karkala-aerospace-quality-intelligence.jpg",
  width: 1024,
  height: 1536,
  alt:
    "EV.ENGINEER poster: Sudarshana Karkala, Aerospace Quality Intelligence. Quality, Digital Twins, Cybersecurity and AI. " +
    "AS9102 / FAI Readiness, from drawings to compliant FAI reports. Balloon Drawings & Inspection Intelligence. " +
    "AI-Assisted Quality Workflows. Traceability & Compliance, a connected digital thread for aerospace and supply chain. " +
    "Aerospace, Defence, Space, EV Battery. aerospace.ev.engineer, +91 9845561518.",
};

const FOCUSABLE = "button:not([disabled]), a[href]";

// The hostname never changes during a page's life, so there is nothing to subscribe to.
const subscribe = () => () => {};
const isPosterHost = () => window.location.hostname === POSTER_HOST;
// Nothing on the server: the same static page is served on every host.
const notOnServer = () => false;

// Once dismissed, the poster stays closed until the next full page load, so
// coming back to /aerospace from the profile does not open it again. Typing
// the address again is a full load, and shows it.
let dismissedThisLoad = false;

/** The Aerospace Quality Intelligence poster, shown as a dialog to visitors who came in on aerospace.ev.engineer. */
export default function AerospaceHostPoster() {
  const onPosterHost = useSyncExternalStore(subscribe, isPosterHost, notOnServer);
  const [dismissed, setDismissed] = useState(dismissedThisLoad);

  if (!onPosterHost || dismissed) return null;

  const dismiss = () => {
    dismissedThisLoad = true;
    setDismissed(true);
  };

  return <PosterDialog onClose={dismiss} onProfile={() => (dismissedThisLoad = true)} />;
}

function PosterDialog({ onClose, onProfile }: { onClose: () => void; onProfile: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // The key handler is bound once, so it reaches the current callback through a ref.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  // Scroll lock, Escape, focus trap and focus restore.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
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

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} data-testid="aerospace-poster-backdrop">
      <div
        ref={dialog}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Sudarshana Karkala — Aerospace Quality Intelligence"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButton}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
          data-track-event="aerospace_poster_close"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <Image
          src={POSTER.src}
          alt={POSTER.alt}
          width={POSTER.width}
          height={POSTER.height}
          sizes="(max-width: 512px) 100vw, 480px"
          loading="eager"
          className={styles.poster}
        />

        <div className={styles.actions}>
          <Link
            href={PROFILE_PATH}
            className={`${styles.action} ${styles.profile}`}
            onClick={onProfile}
            data-track-event="aerospace_poster_profile_click"
          >
            Profile
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.action} ${styles.whatsapp}`}
            data-track-event="aerospace_poster_whatsapp_click"
          >
            WhatsApp
          </a>
          {/* Same as the close button: dismisses the poster and shows the page. */}
          <button
            type="button"
            className={`${styles.action} ${styles.continue}`}
            onClick={onClose}
            data-track-event="aerospace_poster_continue"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
