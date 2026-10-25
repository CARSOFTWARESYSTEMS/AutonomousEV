"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { KeyRound, X } from "lucide-react";
import { isSelfContainedPath } from "@/components/ChromeGate";
import { routeAccessFor } from "@/config/premiumAuthRoutes";
import { trackAuth } from "@/lib/auth/analytics";
import { markPromptDismissed, markPromptShown, promptDueAt } from "@/lib/auth/promptState";
import { useAuth } from "./AuthProvider";
import styles from "./auth.module.css";

/** How long a deferred prompt waits before it looks again. */
const RETRY_MS = 20_000;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isShown(el: Element): boolean {
  const box = el as HTMLElement;
  return typeof box.checkVisibility === "function" ? box.checkVisibility() : box.getClientRects().length > 0;
}

/**
 * Why the prompt must wait right now, or null when it may open. It opens only
 * on optional-login pages (src/config/premiumAuthRoutes.ts: public pages never
 * prompt, required-login pages have their own gate) and never interrupts
 * sign-in itself, an error page, a page that opted out, another dialog or open
 * menu, fullscreen, or someone typing.
 */
export function promptBlocker(doc: Document = document): string | null {
  if (doc.visibilityState !== "visible") return "hidden";
  if (/^\/(?:api\/auth|login|logout|auth|sso)(?:\/|$)/.test(doc.location.pathname)) return "sign-in";
  if (routeAccessFor(doc.location.pathname) !== "optional-login") return "route";
  // Pages opt out with data-auth-prompt="off"; .next-error-h1 is Next.js's own error and 404 page.
  if (doc.querySelector('[data-auth-prompt="off"], .next-error-h1')) return "page";
  if (doc.fullscreenElement) return "fullscreen";
  if (Array.from(doc.querySelectorAll('dialog[open], [aria-modal="true"]')).some(isShown)) return "dialog";
  // Mobile menus and other overlays hold a scroll lock while they are open.
  if (doc.documentElement.style.overflow === "hidden" || doc.body.style.overflow === "hidden") return "overlay";
  const active = doc.activeElement;
  if (active instanceof HTMLElement && (active.isContentEditable || active.matches("input, textarea, select"))) return "typing";
  return null;
}

type DismissMethod = "continue" | "close" | "escape" | "backdrop";

/**
 * The optional premium prompt. For a visitor still anonymous five minutes
 * into a browsing session, once per day at most, never while signed in. It
 * offers Login and Continue Browsing, and never forces either.
 */
export default function LoginPrompt() {
  const { status, site, refresh, startLogin } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (status !== "anonymous" || !site || open) return;
    const dueAt = promptDueAt(Date.now());
    if (dueAt === null) return;

    let cancelled = false;
    let timer = 0;
    const later = () => {
      timer = window.setTimeout(attempt, RETRY_MS);
    };
    async function attempt() {
      if (cancelled) return;
      if (promptBlocker()) return later();
      // Signed in meanwhile (here or in another tab)? Then no prompt.
      const fresh = await refresh();
      if (cancelled || fresh !== "anonymous") return;
      // Shown or dismissed in another tab meanwhile.
      if (promptDueAt(Date.now()) === null) return;
      if (promptBlocker()) return later();
      markPromptShown(Date.now());
      setOpen(true);
      trackAuth("premium_login_prompt_shown", site!, { trigger: "five_minute_prompt" });
    }
    timer = window.setTimeout(attempt, Math.max(0, dueAt - Date.now()));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [status, site, open, refresh]);

  // Signed in from another tab while the prompt is up: it has nothing left to offer (adjusted during render).
  if (open && status === "authenticated") setOpen(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    // Focus starts on the panel, not a button, so a key already on its way can't log in or dismiss by accident.
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      const back = returnFocusRef.current;
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
  }, [open]);

  const dismiss = useCallback(
    (method: DismissMethod) => {
      markPromptDismissed(Date.now());
      setOpen(false);
      if (site) trackAuth("premium_login_prompt_continue", site, { trigger: "five_minute_prompt", method });
    },
    [site],
  );

  // Keeps Tab and Shift+Tab inside the dialog.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const current = document.activeElement;
    if (event.shiftKey && (current === first || current === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !panelRef.current.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!site) return null;
  const family = isSelfContainedPath(pathname) ? "space" : "core";

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-family={family}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-track-manual=""
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        // Escape: close through state, so focus and scroll are restored in one place.
        event.preventDefault();
        dismiss("escape");
      }}
      onClick={(event) => {
        // The dialog box is the panel; a click on the dialog element itself is on the backdrop.
        if (event.target === event.currentTarget) dismiss("backdrop");
      }}
    >
      {open && (
        <div ref={panelRef} className={styles.panel} tabIndex={-1}>
          <button type="button" className={styles.close} aria-label="Close" onClick={() => dismiss("close")}>
            <X size={18} aria-hidden="true" />
          </button>
          <div className={styles.brandRow} aria-hidden="true">
            <span className={styles.brandIcon}>
              <KeyRound size={17} />
            </span>
            <span className={styles.brandName}>{site.brand}</span>
          </div>
          <h2 id={titleId} className={styles.title}>
            Login to view premium content
          </h2>
          <div id={descriptionId}>
            <p className={styles.text}>
              Sign in to access premium engineering content, interactive experiences and your engineering workspace.
            </p>
            <p className={styles.note}>You’ll return directly to this page after login.</p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setOpen(false);
                startLogin("five_minute_prompt");
              }}
            >
              Login
            </button>
            <button type="button" className={styles.secondary} onClick={() => dismiss("continue")}>
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
