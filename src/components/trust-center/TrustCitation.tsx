import { ExternalLink } from "lucide-react";
import styles from "./shared.module.css";
import VerificationBadge from "./VerificationBadge";
import { formatDate } from "@/lib/trust-center/format";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function TrustCitation({ item }: { item: TrustContentItem }) {
  const date = formatDate(item.retrievedAt ?? item.publishedAt);
  return (
    <div className={styles.citation}>
      <VerificationBadge status={item.verificationStatus} />
      {date && <span>Last verified {date}</span>}
      {item.sourceUrl && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.citationLink}
          data-track-event="trust_external_link_clicked"
          data-track-source={item.source}
        >
          View source on {item.sourceLabel}
          <ExternalLink className={styles.badgeIcon} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
