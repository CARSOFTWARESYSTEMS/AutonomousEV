"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { isSelfContainedPath } from "@/components/ChromeGate";
import { CATEGORY_HOME, routeConfigFor, type PremiumAuthRoute } from "@/config/premiumAuthRoutes";
import { trackAuth } from "@/lib/auth/analytics";
import { useAuth } from "./AuthProvider";
import styles from "./auth.module.css";

/**
 * Required-login pages (src/config/premiumAuthRoutes.ts) render only for a
 * signed-in visitor. Until the session is known the visitor sees a quiet
 * "checking" panel, then either the page or the premium login gate. The page
 * is never rendered behind the gate, so none of it shows or runs first.
 *
 * Hosts without a sign-in service (local development, previews) show the
 * page. Where the service is configured but not answering, the gate stays
 * closed and offers to try again.
 */
export default function PremiumRouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = routeConfigFor(pathname);
  const { status } = useAuth();
  const locked = route?.access === "required-login" && status !== "authenticated" && status !== "none";

  // Coming back from sign-in, the page appears after the browser has already
  // looked for its #hash, so scroll to it once the page is there.
  const wasLocked = useRef(false);
  useEffect(() => {
    if (wasLocked.current && !locked) scrollToHash();
    wasLocked.current = locked;
  }, [locked]);

  if (!locked || !route) return <>{children}</>;
  return <Gate key={route.path} route={route} checking={status === "loading"} unavailable={status === "unavailable"} />;
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

function Gate({ route, checking, unavailable }: { route: PremiumAuthRoute; checking: boolean; unavailable: boolean }) {
  const { site, startLogin, refresh } = useAuth();
  const pathname = usePathname();
  const titleId = useId();
  const selfContained = isSelfContainedPath(pathname);
  const Landmark = selfContained ? "main" : "section";
  const home = CATEGORY_HOME[route.category];
  const showing = !checking && !unavailable;
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (showing && site) trackAuth("premium_route_gate_shown", site, { trigger: "premium_route_required" });
  }, [showing, site]);

  return (
    <Landmark
      className={styles.gate}
      data-family={selfContained ? "space" : "core"}
      data-layout={selfContained ? "page" : "section"}
      // The five-minute prompt never opens over the gate.
      data-auth-prompt="off"
      data-track-manual=""
      aria-labelledby={titleId}
      aria-busy={checking || undefined}
    >
      <div className={styles.gatePanel}>
        {checking ? (
          <div className={styles.gateChecking} role="status">
            <span className={styles.gateSpinner} aria-hidden="true" />
            <span id={titleId}>Checking your sign-in…</span>
          </div>
        ) : (
          <>
            <div className={styles.brandRow} aria-hidden="true">
              <span className={styles.brandIcon}>
                <KeyRound size={17} />
              </span>
              <span className={styles.brandName}>{site?.brand}</span>
            </div>
            <p className={styles.gateEyebrow}>{route.label}</p>
            {unavailable ? (
              <>
                <h1 id={titleId} className={styles.title}>
                  Sign-in is temporarily unavailable
                </h1>
                <p className={styles.text}>
                  This engineering experience needs a sign-in, and the sign-in service isn’t answering right now.
                </p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={retrying}
                    onClick={async () => {
                      setRetrying(true);
                      await refresh();
                      setRetrying(false);
                    }}
                  >
                    {retrying ? "Trying again…" : "Try again"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 id={titleId} className={styles.title}>
                  Login to view premium content
                </h1>
                <p className={styles.text}>Sign in to continue to this engineering experience.</p>
                <p className={styles.note}>You’ll return directly to this page after login.</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} onClick={() => startLogin("premium_route_required")}>
                    Login
                  </button>
                </div>
              </>
            )}
            <Link href={home.href} className={styles.gateBack}>
              <ArrowLeft size={15} aria-hidden="true" />
              Back to {home.label}
            </Link>
          </>
        )}
      </div>
    </Landmark>
  );
}
