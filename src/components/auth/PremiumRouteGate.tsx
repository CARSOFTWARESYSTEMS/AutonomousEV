"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CATEGORY_HOME, routeConfigFor, type PremiumAuthRoute } from "@/config/premiumAuthRoutes";
import { useAuth } from "./AuthProvider";
import PremiumLoginCard from "./PremiumLoginCard";
import styles from "./auth.module.css";

// A LOGIN GATE, NOT ACCESS CONTROL. Everything here decides what the browser
// renders; the page files stay fetchable without signing in. Genuinely
// protected content or data must be authorized on the server before delivery
// (see src/config/premiumAuthRoutes.ts and docs/premium-login.md).

/**
 * Whether the current required-login page must stay locked: until the session
 * is known, and for a visitor who is not signed in. Hosts without a sign-in
 * service (local development, previews) are never locked; where the service
 * is configured but not answering, the page stays locked.
 *
 * Coming back from sign-in, the page appears after the browser has already
 * looked for its #hash, so this scrolls there once the page is unlocked.
 */
export function usePremiumLock(scrollOnUnlock = true): { route: PremiumAuthRoute | null; locked: boolean } {
  const route = routeConfigFor(usePathname());
  const { status } = useAuth();
  const locked = route?.access === "required-login" && status !== "authenticated" && status !== "none";

  const wasLocked = useRef(false);
  useEffect(() => {
    if (wasLocked.current && !locked && scrollOnUnlock) scrollToHash();
    wasLocked.current = locked;
  }, [locked, scrollOnUnlock]);

  return { route, locked };
}

function scrollToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const attempt = (tries: number) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView();
    else if (tries > 0) window.setTimeout(() => attempt(tries - 1), 250);
  };
  window.requestAnimationFrame(() => attempt(8));
}

/**
 * The root layout's gate: on a required-login page without a public preview,
 * the login card replaces the whole page, so none of it shows or runs first.
 * Pages with `publicPreview` gate themselves with <PremiumContent> and pass
 * through here.
 */
export default function PremiumRouteGate({ children }: { children: ReactNode }) {
  // A page with a public preview scrolls to its own #hash (PremiumContent).
  const { route, locked } = usePremiumLock(!routeConfigFor(usePathname())?.publicPreview);
  if (!locked || !route || route.publicPreview) return <>{children}</>;
  return <Gate key={route.path} route={route} />;
}

function Gate({ route }: { route: PremiumAuthRoute }) {
  const { status } = useAuth();
  const titleId = useId();
  const { family } = CATEGORY_HOME[route.category];
  const Landmark = family === "space" ? "main" : "section";

  return (
    <Landmark
      className={styles.gate}
      data-family={family}
      data-layout={family === "space" ? "page" : "section"}
      // The five-minute prompt never opens over the gate.
      data-auth-prompt="off"
      aria-labelledby={titleId}
      aria-busy={status === "loading" || undefined}
    >
      <PremiumLoginCard route={route} heading="h1" titleId={titleId} showLabel showBack />
    </Landmark>
  );
}
