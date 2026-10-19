"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks its wrapper `data-inview="true"` once it has scrolled into view, for
 * CSS transitions on diagrams. Content is fully visible without it: the
 * attribute only adds emphasis, so nothing is hidden when scripts are off.
 */
export function InView({ children, className, threshold = 0.3, as: Tag = "div" }: { children: ReactNode; className?: string; threshold?: number; as?: "div" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setInView(true));
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={className} data-inview={inView ? "true" : "false"}>
      {children}
    </Tag>
  );
}
