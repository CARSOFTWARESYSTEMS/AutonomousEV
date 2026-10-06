"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks its content as on or off screen, so the stylesheet can pause any
 * looping animation inside it while nobody can see it.
 */
export default function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-inview={inView}>
      {children}
    </div>
  );
}
