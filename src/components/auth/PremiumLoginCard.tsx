"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { CATEGORY_HOME, type PremiumAuthRoute } from "@/config/premiumAuthRoutes";
import { trackAuth } from "@/lib/auth/analytics";
import { useAuth } from "./AuthProvider";
import styles from "./auth.module.css";

/**
 * The login card of a required-login page, in every session state: checking
 * (quiet, fades in late), signed out (Login only — never Continue Browsing),
 * and sign-in unavailable (Try again). Used alone by the layout gate, and
 * beside a page's public preview by PremiumPreview.
 */
export default function PremiumLoginCard({
  route,
  heading,
  titleId,
  showLabel = false,
  showBack = false,
}: {
  route: PremiumAuthRoute;
  /** h1 when the card is the whole page; h2 under a preview's own h1. */
  heading: "h1" | "h2";
  titleId?: string;
  showLabel?: boolean;
  showBack?: boolean;
}) {
  const { status, site, startLogin, refresh } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const checking = status === "loading";
  const unavailable = status === "unavailable";
  const Heading = heading;
  const home = CATEGORY_HOME[route.category];

  useEffect(() => {
    if (status === "anonymous" && site) trackAuth("premium_route_gate_shown", site, { trigger: "premium_route_required" });
  }, [status, site]);

  return (
    <div className={styles.gatePanel} data-track-manual="">
      {checking ? (
        <div className={styles.gateChecking} role="status">
          <span className={styles.gateSpinner} aria-hidden="true" />
          <span id={heading === "h1" ? titleId : undefined}>Checking your sign-in…</span>
        </div>
      ) : (
        <>
          <div className={styles.brandRow} aria-hidden="true">
            <span className={styles.brandIcon}>
              <KeyRound size={17} />
            </span>
            <span className={styles.brandName}>{site?.brand}</span>
          </div>
          {showLabel && <p className={styles.gateEyebrow}>{route.label}</p>}
          {unavailable ? (
            <>
              <Heading id={titleId} className={styles.title}>
                Sign-in is temporarily unavailable
              </Heading>
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
              <Heading id={titleId} className={styles.title}>
                Login to view premium content
              </Heading>
              <p className={styles.text}>Sign in to continue to this engineering experience.</p>
              <p className={styles.note}>You’ll return directly to this page after login.</p>
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => startLogin("premium_route_required")}>
                  Login
                </button>
              </div>
            </>
          )}
          {showBack && (
            <Link href={home.href} className={styles.gateBack}>
              <ArrowLeft size={15} aria-hidden="true" />
              Back to {home.label}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
