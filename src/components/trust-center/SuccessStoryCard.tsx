import { ExternalLink, Quote } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import VerificationBadge from "./VerificationBadge";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function SuccessStoryCard({ item }: { item: TrustContentItem }) {
  return (
    <article className={cardStyles.card}>
      <div className={cardStyles.cardHeader}>
        <Quote className={cardStyles.quoteIcon} aria-hidden="true" />
        <VerificationBadge status={item.verificationStatus} />
      </div>
      <h3 className={cardStyles.cardTitle}>{item.title}</h3>
      {(item.summary || item.body) && <p className={cardStyles.cardBody}>{item.summary ?? item.body}</p>}
      {item.author?.name && !item.author.isAnonymous && (
        <p className={cardStyles.cardMeta}>
          {[item.author.name, item.author.role, item.author.organisation].filter(Boolean).join(" · ")}
        </p>
      )}
      {item.sourceUrl && (
        <div className={cardStyles.cardFooter}>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-secondary ${shared.externalLinkBtn}`}
            data-track-event="trust_external_link_clicked"
            data-track-source={item.source}
          >
            Read more
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}
