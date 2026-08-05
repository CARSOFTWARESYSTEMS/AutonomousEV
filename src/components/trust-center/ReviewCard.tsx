import { Star } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import VerificationBadge from "./VerificationBadge";
import TrustCitation from "./TrustCitation";
import { formatDate, ratingText } from "@/lib/trust-center/format";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function ReviewCard({ item }: { item: TrustContentItem }) {
  const author = item.author;
  const showAuthor = author && !author.isAnonymous && author.name;
  const rating = ratingText(item.rating, item.ratingScale ?? 5);
  const date = formatDate(item.publishedAt);

  return (
    <article className={cardStyles.card}>
      <div className={cardStyles.cardHeader}>
        {showAuthor ? (
          <div className={cardStyles.authorBlock}>
            <div>
              <div className={cardStyles.authorName}>{author!.name}</div>
              {(author!.role || author!.organisation) && (
                <div className={cardStyles.authorRole}>
                  {[author!.role, author!.organisation].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={cardStyles.authorName}>Anonymous</div>
        )}
        <VerificationBadge status={item.verificationStatus} />
      </div>

      {rating && (
        <div className={cardStyles.cardMeta}>
          <Star className={shared.badgeIcon} aria-hidden="true" />
          <span className={shared.ratingText}>{rating}</span>
        </div>
      )}

      {(item.approvedExcerpt || item.summary) && (
        <p className={cardStyles.cardBody}>{item.approvedExcerpt ?? item.summary}</p>
      )}

      {date && <p className={cardStyles.cardMeta}>{date}</p>}

      <TrustCitation item={item} />
    </article>
  );
}
