import cardStyles from "./Cards.module.css";
import CandidateProfileCard from "./CandidateProfileCard";
import ExternalPostFallback from "./ExternalPostFallback";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function CommunityImpactGrid({ items }: { items: TrustContentItem[] }) {
  return (
    <div className={cardStyles.cardGrid}>
      {items.map((item) =>
        item.type === "candidate-profile" ? (
          <CandidateProfileCard key={item.id} item={item} />
        ) : (
          <ExternalPostFallback
            key={item.id}
            sourceLabel={item.sourceLabel}
            title={item.title}
            summary={item.summary}
            authorName={item.author?.isAnonymous ? undefined : item.author?.name}
            directUrl={item.sourceUrl}
            reason="no-embed"
          />
        )
      )}
    </div>
  );
}
