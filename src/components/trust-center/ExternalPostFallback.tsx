import { ExternalLink } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import TrustSourceBadge from "./TrustSourceBadge";
import styles from "./LinkedInPostCard.module.css";

interface ExternalPostFallbackProps {
  sourceLabel: string;
  title: string;
  summary?: string;
  authorName?: string;
  directUrl?: string;
  reason?: "preview" | "failed" | "no-embed";
  action?: React.ReactNode;
}

function reasonText(reason: NonNullable<ExternalPostFallbackProps["reason"]>, sourceLabel: string): string {
  switch (reason) {
    case "preview":
      return `Tap to load this embedded post, or open it directly on ${sourceLabel}.`;
    case "failed":
      return "This embedded post couldn't be loaded here.";
    default:
      return `View this post directly on ${sourceLabel}.`;
  }
}

export default function ExternalPostFallback({
  sourceLabel,
  title,
  summary,
  authorName,
  directUrl,
  reason = "no-embed",
  action,
}: ExternalPostFallbackProps) {
  return (
    <div className={`${cardStyles.card} ${styles.fallbackCard}`}>
      <div className={cardStyles.cardHeader}>
        <TrustSourceBadge label={sourceLabel} />
      </div>
      <h4 className={cardStyles.cardTitle}>{title}</h4>
      {authorName && <p className={cardStyles.cardMeta}>{authorName}</p>}
      {summary && <p className={cardStyles.cardBody}>{summary}</p>}
      <p className={cardStyles.cardMeta}>{reasonText(reason, sourceLabel)}</p>
      <div className={cardStyles.cardFooter}>
        {action}
        {directUrl && (
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-secondary ${shared.externalLinkBtn}`}
            data-track-event="trust_external_link_clicked"
            data-track-source={sourceLabel.toLowerCase()}
          >
            Open on {sourceLabel}
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
