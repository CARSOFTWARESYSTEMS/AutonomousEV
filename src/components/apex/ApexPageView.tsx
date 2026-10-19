"use client";

import { useEffect, useRef } from "react";
import { APEX_PAGE_VIEW_EVENT } from "@/data/apex/analytics";
import { trackApex } from "./analytics";

/** Reports the page's named view once. The site's own `page_view` is sent separately by GoogleAnalytics.tsx. */
export function ApexPageView({ page }: { page: keyof typeof APEX_PAGE_VIEW_EVENT }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackApex(APEX_PAGE_VIEW_EVENT[page], { page_id: page });
  }, [page]);
  return null;
}

/** Reports an event once, the first time the wrapped section scrolls into view. */
export function ViewOnce({ event, id, children, className }: { event: "apex_investor_view" | "apex_technical_view"; id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackApex(event, { section_id: id });
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [event, id]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
