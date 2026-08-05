"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import LinkedInEmbed from "./LinkedInEmbed";
import ExternalPostFallback from "./ExternalPostFallback";
import styles from "./LinkedInPostCard.module.css";
import { trackEvent } from "@/utils/analytics";

const EMBED_TIMEOUT_MS = 8000;
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileQuery(callback: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}
function getIsMobileServerSnapshot() {
  return false;
}

export interface LinkedInPostCardProps {
  embedUrl?: string;
  directUrl: string;
  height?: number;
  title: string;
  summary?: string;
  authorName?: string;
  mobileMode?: "preview" | "auto";
  featured?: boolean;
  eager?: boolean;
}

/** "idle" covers both "not yet attempted" and "in progress" — the render
 * layer derives the visible loading state from shouldAttemptEmbed/inView so
 * this effect never has to set an intermediate "loading" value itself. */
type LoadState = "idle" | "loaded" | "error";

export default function LinkedInPostCard({
  embedUrl,
  directUrl,
  height = 570,
  title,
  summary,
  authorName,
  mobileMode = "preview",
  featured = false,
  eager = false,
}: LinkedInPostCardProps) {
  const isMobile = useSyncExternalStore(subscribeToMobileQuery, getIsMobileSnapshot, getIsMobileServerSnapshot);
  const [manuallyRequested, setManuallyRequested] = useState(false);
  const [inView, setInView] = useState(eager);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager || inView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, inView]);

  const shouldAttemptEmbed = Boolean(embedUrl) && (!isMobile || mobileMode === "auto" || manuallyRequested);
  const isAttemptingLoad = shouldAttemptEmbed && inView && loadState === "idle";

  useEffect(() => {
    if (!isAttemptingLoad) return;
    const timer = window.setTimeout(() => {
      setLoadState((current) => {
        if (current === "idle") {
          trackEvent("linkedin_embed_failed", { title });
          return "error";
        }
        return current;
      });
    }, EMBED_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isAttemptingLoad, title]);

  const handleLoad = () => {
    setLoadState("loaded");
    trackEvent("linkedin_embed_loaded", { title });
  };

  let body: React.ReactNode;

  if (!embedUrl) {
    body = (
      <ExternalPostFallback
        sourceLabel="LinkedIn"
        title={title}
        summary={summary}
        authorName={authorName}
        directUrl={directUrl}
        reason="no-embed"
      />
    );
  } else if (isMobile && mobileMode === "preview" && !manuallyRequested) {
    body = (
      <ExternalPostFallback
        sourceLabel="LinkedIn"
        title={title}
        summary={summary}
        authorName={authorName}
        directUrl={directUrl}
        reason="preview"
        action={
          <button type="button" className="btn btn-primary" onClick={() => setManuallyRequested(true)}>
            Load embedded post
          </button>
        }
      />
    );
  } else if (loadState === "error") {
    body = (
      <ExternalPostFallback
        sourceLabel="LinkedIn"
        title={title}
        summary={summary}
        authorName={authorName}
        directUrl={directUrl}
        reason="failed"
      />
    );
  } else if (!inView) {
    body = (
      <div className={styles.skeleton} style={{ minHeight: Math.min(height, 320) }} aria-hidden="true">
        Loading LinkedIn post…
      </div>
    );
  } else {
    body = (
      <div className={styles.embedStack}>
        {loadState !== "loaded" && (
          <div className={styles.skeletonOverlay} aria-hidden="true">
            Loading LinkedIn post…
          </div>
        )}
        <LinkedInEmbed embedUrl={embedUrl} title={title} height={height} onLoad={handleLoad} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.postCard} data-featured={featured || undefined}>
      {body}
    </div>
  );
}
