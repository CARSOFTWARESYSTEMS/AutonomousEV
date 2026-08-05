import { Award } from "lucide-react";
import cardStyles from "./Cards.module.css";
import VerificationBadge from "./VerificationBadge";
import { formatDate } from "@/lib/trust-center/format";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function AwardCard({ item }: { item: TrustContentItem }) {
  const date = formatDate(item.publishedAt);
  return (
    <article className={cardStyles.card}>
      <div className={cardStyles.cardHeader}>
        <Award className={cardStyles.quoteIcon} aria-hidden="true" />
        <VerificationBadge status={item.verificationStatus} />
      </div>
      <h3 className={cardStyles.cardTitle}>{item.title}</h3>
      {item.summary && <p className={cardStyles.cardBody}>{item.summary}</p>}
      {date && <p className={cardStyles.cardMeta}>{date}</p>}
    </article>
  );
}
