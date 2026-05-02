"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/utils/analytics";
import React from "react";
import styles from "../app/page.module.css";

interface Props {
  cardClassName: string;
  titleClassName: string;
  textClassName: string;
}

export default function EVCareersHeroCard({ cardClassName, titleClassName, textClassName }: Props) {
  const router = useRouter();

  const handleCardClick = () => {
    trackEvent("cta_section_click", {
      section: "EV Careers, Jobs & Internships",
      target: "/internships"
    });
    router.push("/internships");
  };

  const handleInternshipsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent("cta_click", {
      section: "EV Careers, Jobs & Internships",
      target: "/internships"
    });
    router.push("/internships");
  };

  const handleEVCareerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent("cta_click", {
      section: "EV Careers, Jobs & Internships",
      target: "/ev-career"
    });
    router.push("/ev-career");
  };

  return (
    <div 
      className={cardClassName} 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <p className={titleClassName}>
        EV Careers, Jobs & Internships
      </p>
      <p className={textClassName}>
        Gain hands-on experience in EV Battery Diagnostics, Autonomous System Integration, Battery Intelligence, Energy Systems, and real-world EV engineering workflows.
      </p>
      <div className={styles.mobileStack} style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          onClick={handleInternshipsClick}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.9rem', minHeight: 'auto' }}
        >
          Jobs & Internships
        </button>
        <button 
          onClick={handleEVCareerClick}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.9rem', minHeight: 'auto' }}
        >
          EV Career
        </button>
      </div>
    </div>
  );
}
