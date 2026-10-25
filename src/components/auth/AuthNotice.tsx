"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { isSelfContainedPath } from "@/components/ChromeGate";
import type { AuthNoticeMessage } from "./AuthProvider";
import styles from "./auth.module.css";

const VISIBLE_MS = 7000;

/**
 * A small, non-blocking line at the foot of the page (sign-in not completed,
 * signed out, sign-out failed). The live region is always present, so screen
 * readers announce each message as it arrives.
 */
export default function AuthNotice({ notice, onDismiss }: { notice: AuthNoticeMessage | null; onDismiss: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onDismiss, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div className={styles.noticeRegion} role="status" aria-live="polite" data-track-manual="">
      {notice && (
        <div
          key={notice.id}
          className={styles.notice}
          data-family={isSelfContainedPath(pathname) ? "space" : "core"}
          data-tone={notice.tone}
        >
          <span>{notice.text}</span>
          <button type="button" className={styles.noticeClose} aria-label="Dismiss message" onClick={onDismiss}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
