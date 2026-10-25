"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, LogIn, LogOut } from "lucide-react";
import { trackAuth } from "@/lib/auth/analytics";
import { loginHref } from "@/lib/auth/sites";
import { useAuth } from "./AuthProvider";
import styles from "./auth.module.css";

export type AuthNavVariant = "core" | "space";

/**
 * Login, or Workspace once signed in, for a site header. A quiet text control
 * that never outweighs the header's primary call to action.
 *
 * Its slot is laid out before first paint on hosts with a sign-in service
 * (html[data-auth-site], set by AuthHostFlag) and stays reserved while the
 * session is read, so the header never shifts and Login never flickers into
 * Workspace. Where sign-in is unavailable the slot stays empty.
 */
export default function AuthNavControl({ variant, className = "" }: { variant: AuthNavVariant; className?: string }) {
  const { status, user, workspaceUrl, site, startLogin, signOut } = useAuth();
  // Re-render on in-app navigation so the Login link's address follows the page.
  usePathname();
  // After Sign out from this control, focus moves to the Login link that replaces it.
  const focusLogin = useRef(false);

  if (status === "none") return null;

  const slotClass = `${styles.slot} ${variant === "space" ? styles.slotSpace : styles.slotCore} ${className}`;

  if (status === "authenticated" && user && site && workspaceUrl) {
    return (
      <div className={slotClass} data-status={status} data-track-manual="">
        <WorkspaceMenu
          label={user.name || user.email || "your account"}
          email={user.name ? user.email : ""}
          workspaceUrl={workspaceUrl}
          onOpenWorkspace={() => trackAuth("workspace_open", site, { trigger: "header" })}
          onSignOut={async () => {
            focusLogin.current = true;
            await signOut();
          }}
        />
      </div>
    );
  }

  if (status === "anonymous") {
    const onClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
      const href = loginHref(window.location);
      if (!href) return;
      event.currentTarget.href = href;
      // A new tab or window follows the fresh address on its own.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      startLogin("header");
    };
    return (
      <div className={slotClass} data-status={status} data-track-manual="">
        <a
          ref={(link) => {
            if (link && focusLogin.current) {
              focusLogin.current = false;
              link.focus();
            }
          }}
          href={loginHref(window.location) ?? undefined}
          className={styles.trigger}
          onClick={onClick}
        >
          Login
        </a>
      </div>
    );
  }

  // loading or unavailable: the reserved, invisible slot.
  return (
    <div className={slotClass} data-status={status} aria-hidden="true">
      <span className={styles.trigger}>Login</span>
    </div>
  );
}

function WorkspaceMenu({
  label,
  email,
  workspaceUrl,
  onOpenWorkspace,
  onSignOut,
}: {
  label: string;
  email: string;
  workspaceUrl: string;
  onOpenWorkspace: () => void;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={styles.menuWrap}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Workspace
        <ChevronDown size={13} aria-hidden="true" className={styles.chevron} data-open={open ? "true" : undefined} />
      </button>
      <div id={menuId} className={styles.menu} hidden={!open}>
        <div className={styles.identity}>
          <span className={styles.identityLabel}>
            <span className={styles.signedInDot} aria-hidden="true" />
            Signed in as
          </span>
          <span className={styles.identityName}>{label}</span>
          {email && <span className={styles.identityEmail}>{email}</span>}
        </div>
        <a href={workspaceUrl} className={styles.menuItem} onClick={onOpenWorkspace}>
          Open Workspace
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          type="button"
          className={styles.menuItem}
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await onSignOut();
            setSigningOut(false);
            setOpen(false);
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * The same choice as a row in a header's opened phone menu, for headers whose
 * bar has no room for it on narrow screens. Renders nothing until the session
 * is known: the menu only opens after load, so nothing shifts.
 */
export function AuthMenuEntry({ variant, onNavigate }: { variant: AuthNavVariant; onNavigate?: () => void }) {
  const { status, user, workspaceUrl, site, startLogin, signOut } = useAuth();
  usePathname();
  const family = variant === "space" ? styles.slotSpace : styles.slotCore;

  if (status === "anonymous") {
    return (
      <div className={`${styles.menuEntry} ${family}`} data-track-manual="">
        <a
          href={loginHref(window.location) ?? undefined}
          className={styles.menuEntryItem}
          onClick={(event) => {
            event.preventDefault();
            onNavigate?.();
            startLogin("header");
          }}
        >
          Login
          <LogIn size={16} aria-hidden="true" />
        </a>
      </div>
    );
  }

  if (status === "authenticated" && user && site && workspaceUrl) {
    return (
      <div className={`${styles.menuEntry} ${family}`} data-track-manual="">
        <div className={styles.menuEntryIdentity}>
          <span className={styles.signedInDot} aria-hidden="true" />
          <span className={styles.identityName}>{user.name || user.email || "Signed in"}</span>
        </div>
        <a href={workspaceUrl} className={styles.menuEntryItem} onClick={() => trackAuth("workspace_open", site, { trigger: "header" })}>
          Workspace
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          type="button"
          className={styles.menuEntryItem}
          onClick={async () => {
            await signOut();
            onNavigate?.();
          }}
        >
          Sign out
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}
