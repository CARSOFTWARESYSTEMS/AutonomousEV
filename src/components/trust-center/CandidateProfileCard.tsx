import { ExternalLink } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import VerificationBadge from "./VerificationBadge";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function CandidateProfileCard({ item }: { item: TrustContentItem }) {
  return (
    <article className={cardStyles.card}>
      <div className={cardStyles.cardHeader}>
        <div className={cardStyles.authorBlock}>
          {item.author?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.author.image} alt="" className={cardStyles.avatar} loading="lazy" />
          ) : (
            <div className={cardStyles.avatar} aria-hidden="true" />
          )}
          <div>
            <div className={cardStyles.authorName}>{item.title}</div>
            {item.author?.organisation && <div className={cardStyles.authorRole}>{item.author.organisation}</div>}
          </div>
        </div>
        <VerificationBadge status={item.verificationStatus} />
      </div>

      {item.project && <p className={cardStyles.cardMeta}>Project: {item.project}</p>}

      <p className={cardStyles.cardBody}>{item.summary || "Content is being curated."}</p>

      {item.tags.length > 0 && (
        <div className={cardStyles.tagRow}>
          {item.tags.map((tag) => (
            <span key={tag} className={cardStyles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {item.sourceUrl && (
        <div className={cardStyles.cardFooter}>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-secondary ${shared.externalLinkBtn}`}
            data-track-event="trust_external_link_clicked"
            data-track-source="ev-society"
          >
            View Profile
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}
