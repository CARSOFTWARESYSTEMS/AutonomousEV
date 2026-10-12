"use client";
// The only script the profile adds. It reports that the profile was shown, and
// which of its tracked links was used. The page itself is plain HTML from the
// server and reads the same with this switched off.
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/analytics";
import { PROFILE_VIEW, declaredEvent, trackProfile } from "./analytics";

/** How long to wait for the site's analytics to load before giving up on reporting the view. */
const WAIT_MS = 6000;
const STEP_MS = 200;

export default function ProfileAnalytics({ rootId }: { rootId: string }) {
  // One view for each time the profile is opened, however often the effect runs.
  const reported = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!reported.current) {
      // The site's analytics loads after the page. The view is reported once it is there.
      const started = Date.now();
      const report = () => {
        if (reported.current) return;
        if (typeof window.gtag === "function") {
          reported.current = true;
          trackProfile("profile_view", PROFILE_VIEW);
        } else if (Date.now() - started < WAIT_MS) timer = setTimeout(report, STEP_MS);
      };
      report();
    }

    const root = document.getElementById(rootId);
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("[data-profile-event]");
      if (!link || !root?.contains(link)) return;
      const declared = declaredEvent(link);
      // One click, one event, and only the parameters the link declares.
      if (declared) trackEvent(declared.event, declared.params);
    };
    root?.addEventListener("click", onClick);
    return () => {
      if (timer) clearTimeout(timer);
      root?.removeEventListener("click", onClick);
    };
  }, [rootId]);

  return null;
}
