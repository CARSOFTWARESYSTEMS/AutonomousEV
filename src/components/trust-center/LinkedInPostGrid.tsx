"use client";

import { useState } from "react";
import LinkedInPostCard from "./LinkedInPostCard";
import styles from "./LinkedInPostGrid.module.css";
import type { TrustContentItem } from "@/lib/trust-center/types";

const EAGER_LOAD_COUNT = 2;

interface LinkedInPostGridProps {
  items: TrustContentItem[];
  mobileMode: "preview" | "auto";
  requireConsent?: boolean;
}

export default function LinkedInPostGrid({ items, mobileMode, requireConsent = false }: LinkedInPostGridProps) {
  const [consentGiven, setConsentGiven] = useState(!requireConsent);

  if (!consentGiven) {
    return (
      <div className={styles.consentGate}>
        <p>This section loads embedded content from LinkedIn. Load it to see professional recognition posts.</p>
        <button type="button" className="btn btn-primary" onClick={() => setConsentGiven(true)}>
          Load LinkedIn content
        </button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <LinkedInPostCard
          key={item.id}
          embedUrl={item.embedUrl}
          directUrl={item.sourceUrl ?? "https://www.linkedin.com"}
          height={item.media?.height ?? 570}
          title={item.title}
          summary={item.summary ?? item.approvedExcerpt}
          authorName={item.author?.isAnonymous ? undefined : item.author?.name}
          mobileMode={mobileMode}
          featured={item.featured}
          eager={index < EAGER_LOAD_COUNT}
        />
      ))}
    </div>
  );
}
