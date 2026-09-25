"use client";
// Mobile interaction primitives for /space/space-station: an accessible
// bottom sheet, a full-screen workspace shell, a media-query hook and the
// bottom section navigation. Desktop layouts never render these overlays.
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, Compass, MapPin, Gauge, BookOpen, MessageCircleQuestion } from "lucide-react";
import m from "./mobile.module.css";
import spaceTheme from "../../spaceTheme.module.css";
import stationStyles from "../station.module.css";
import { manrope, inter } from "../../fonts";

// Overlays are portalled to <body>, outside the page wrapper, so they carry the
// same theme tokens, fonts and base styles themselves.
const SCOPE = `${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${stationStyles.portal} ${stationStyles.overlayScope}`;

const MOBILE_QUERY = "(max-width: 768px)";

/** True on phone-width viewports. Server and first client render assume desktop. */
export function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia?.(MOBILE_QUERY);
      mq?.addEventListener?.("change", cb);
      return () => mq?.removeEventListener?.("change", cb);
    },
    () => window.matchMedia?.(MOBILE_QUERY).matches ?? false,
    () => false,
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

/** Shared overlay behaviour: scroll lock, Escape, focus trap and focus restore. */
function useOverlay(open: boolean, onClose: () => void, panel: React.RefObject<HTMLDivElement | null>, initial: React.RefObject<HTMLButtonElement | null>) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.dataset.overlay = "open";
    initial.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      delete document.body.dataset.overlay;
      previous?.focus?.();
    };
  }, [open, panel, initial]);
}

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const drag = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  useOverlay(open, onClose, panel, closeBtn);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className={SCOPE}>
    <div className={m.backdrop} onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={m.sheet}
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle: swipe down more than 80px to close. */}
        <div
          className={m.handleArea}
          onPointerDown={(e) => {
            drag.current = e.clientY;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current !== null) setOffset(Math.max(0, e.clientY - drag.current));
          }}
          onPointerUp={() => {
            if (offset > 80) onClose();
            drag.current = null;
            setOffset(0);
          }}
          aria-hidden="true"
        >
          <span className={m.handle} />
        </div>
        <div className={m.sheetHead}>
          <h2 id={titleId}>{title}</h2>
          <button ref={closeBtn} type="button" className={m.iconButton} onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className={m.sheetBody}>{children}</div>
      </div>
    </div>
    </div>,
    document.body,
  );
}

/** Full-screen workspace used to run a simulator on a phone. */
export function FullScreenShell({ open, onClose, title, purpose, backLabel, children }: { open: boolean; onClose: () => void; title: string; purpose?: string; backLabel: string; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useOverlay(open, onClose, panel, back);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className={SCOPE}>
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className={m.shell}>
      <div className={m.shellBar}>
        <button ref={back} type="button" className={m.backButton} onClick={onClose}>
          <ArrowLeft size={18} aria-hidden="true" /> {backLabel}
        </button>
      </div>
      <div className={m.shellBody}>
        <h2 id={titleId} className={m.shellTitle}>
          {title}
        </h2>
        {purpose && <p className={m.shellPurpose}>{purpose}</p>}
        {children}
      </div>
    </div>
    </div>,
    document.body,
  );
}

const NAV = [
  { id: "explore", label: "Explore", href: "#what-is", icon: Compass },
  { id: "india", label: "India", href: "#bas", icon: MapPin },
  { id: "simulate", label: "Simulate", href: "#part-lab", icon: Gauge },
  { id: "research", label: "Research", href: "#part-research", icon: BookOpen },
  { id: "ask", label: "Ask", href: "#faq", icon: MessageCircleQuestion },
] as const;

type NavId = (typeof NAV)[number]["id"];

/** Which bottom-nav category each section belongs to. */
export const SECTION_CATEGORY: Record<string, NavId> = {
  "what-is": "explore",
  why: "explore",
  world: "explore",
  history: "explore",
  moon: "explore",
  economy: "research",
  anatomy: "explore",
  systems: "explore",
  bas: "india",
  "india-microgravity": "india",
  "digital-twin": "simulate",
  emergencies: "simulate",
  simulators: "simulate",
  design: "simulate",
  cybersecurity: "research",
  lab: "research",
  frontier: "research",
  questions: "research",
  library: "research",
  faq: "ask",
  direction: "ask",
};

/** Sticky bottom navigation for phones: five destinations with icon and text labels. */
export function MobileSectionNav() {
  const [active, setActive] = useState<NavId | null>(null);
  useEffect(() => {
    const sections = Object.keys(SECTION_CATEGORY)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    // Track every section currently inside the middle band; highlight the topmost, or nothing.
    const inBand = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.set(e.target.id, e.boundingClientRect.top);
          else inBand.delete(e.target.id);
        }
        const top = [...inBand.entries()].sort((a, b) => a[1] - b[1])[0];
        setActive(top ? SECTION_CATEGORY[top[0]] : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <nav className={m.bottomNav} aria-label="Page sections">
      {NAV.map(({ id, label, href, icon: Icon }) => (
        <a key={id} href={href} aria-current={active === id ? "location" : undefined}>
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
