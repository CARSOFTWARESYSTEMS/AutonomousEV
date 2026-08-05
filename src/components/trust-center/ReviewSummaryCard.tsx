import { ExternalLink, Star } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import { formatDate, isStale, ratingText } from "@/lib/trust-center/format";
import type { TrustSourceMeta } from "@/lib/trust-center/types";

interface ReviewSummaryCardProps {
  meta: TrustSourceMeta;
  ctaLabel: string;
  children?: React.ReactNode;
  classificationNote?: string;
  /** Overrides the card heading only — sentences built from meta.sourceLabel
   * (e.g. "Visit {sourceLabel} for the latest information") stay short. */
  title?: string;
}

export default function ReviewSummaryCard({
  meta,
  ctaLabel,
  children,
  classificationNote,
  title,
}: ReviewSummaryCardProps) {
  const summary = meta.summary;
  const stale = isStale(summary?.retrievedAt, meta.staleAfterDays);
  const retrieved = formatDate(summary?.retrievedAt);
  const rating = ratingText(summary?.rating, summary?.ratingScale ?? 5);

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardHeader}>
        <h3 className={cardStyles.cardTitle}>{title ?? meta.sourceLabel}</h3>
        {stale && <span className={shared.staleBadge}>Rating may be outdated</span>}
      </div>

      {classificationNote && <p className={cardStyles.cardMeta}>{classificationNote}</p>}

      {rating ? (
        <div className={cardStyles.cardMeta}>
          <Star className={shared.badgeIcon} aria-hidden="true" />
          <span className={shared.ratingText}>{rating}</span>
          {summary?.reviewCount !== undefined && <span>· {summary.reviewCount} reviews</span>}
        </div>
      ) : (
        <p className={cardStyles.cardBody}>
          No independently verified rating is configured for this source yet. Visit {meta.sourceLabel} for the
          latest information.
        </p>
      )}

      {summary?.note && <p className={cardStyles.cardBody}>{summary.note}</p>}

      {retrieved && (
        <p className={cardStyles.cardMeta}>
          {stale
            ? `Rating last verified on ${retrieved}. Visit ${meta.sourceLabel} for the latest information.`
            : `Last verified ${retrieved}.`}
        </p>
      )}

      {children}

      <div className={cardStyles.cardFooter}>
        <a
          href={meta.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-secondary ${shared.externalLinkBtn}`}
          data-track-event="trust_external_link_clicked"
          data-track-source={meta.sourceLabel}
        >
          {ctaLabel}
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
