"use client";

import { isAllowedEmbedUrl } from "@/lib/trust-center/iframe-safety";
import styles from "./LinkedInPostCard.module.css";

interface LinkedInEmbedProps {
  embedUrl: string;
  title: string;
  height: number;
  onLoad: () => void;
}

export default function LinkedInEmbed({ embedUrl, title, height, onLoad }: LinkedInEmbedProps) {
  if (!isAllowedEmbedUrl(embedUrl)) return null;

  return (
    <div className={styles.embedWrap} style={{ maxWidth: 504 }}>
      <iframe
        src={embedUrl}
        title={title}
        height={height}
        width="100%"
        loading="lazy"
        allowFullScreen={false}
        style={{ border: "none", maxWidth: "100%", display: "block", margin: "0 auto" }}
        onLoad={onLoad}
      />
    </div>
  );
}
