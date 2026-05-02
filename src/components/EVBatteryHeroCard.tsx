"use client";

import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/utils/analytics";

interface Props {
  cardClassName: string;
  titleClassName: string;
  textClassName: string;
}

export default function EVBatteryHeroCard({ cardClassName, titleClassName, textClassName }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked) {
          trackEvent("section_view", {
            section: "EV Battery Intelligence"
          });
          setHasTracked(true);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTracked]);

  const chips = [
    "Battery",
    "Diagnostics",
    "BMS",
    "Safety"
  ];

  return (
    <div className={cardClassName} ref={sectionRef}>
      <p className={titleClassName}>EV Battery Intelligence</p>
      <p className={textClassName}>
        This platform provides end-to-end battery lifecycle intelligence including diagnostics, grading, identity, repurposing, and thermal reconfiguration for second-life EV battery systems.
      </p>
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {chips.map(c => (
          <span key={c} className="pill">{c}</span>
        ))}
      </div>
    </div>
  );
}
