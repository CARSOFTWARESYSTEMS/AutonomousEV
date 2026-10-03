"use client";
import { useEffect } from "react";
import { Monitor } from "lucide-react";
import { DESKTOP_QUERY } from "../satellite-explorer/lib/capabilities";
import { trackRocketTwinOnce } from "./analytics";
import { LARGER_SCREEN_NOTE } from "./data/engineReference";
import styles from "./rocketTwin.module.css";

/**
 * Shown on small screens only (the stylesheet hides it from 1024px up). It
 * reports the small-screen visit and the recommendation once per page load:
 * the viewport is read when the page opens and never again on resize.
 */
export default function LargerScreenNote() {
  useEffect(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) return;
    trackRocketTwinOnce("rocket_twin_mobile_view");
    trackRocketTwinOnce("rocket_twin_desktop_recommendation_view");
  }, []);

  return (
    <aside className={styles.screenNote} aria-labelledby="larger-screen-title">
      <p id="larger-screen-title" className={styles.screenNoteBadge}>
        <Monitor size={13} aria-hidden="true" /> {LARGER_SCREEN_NOTE.badge}
      </p>
      <p>{LARGER_SCREEN_NOTE.body}</p>
    </aside>
  );
}
