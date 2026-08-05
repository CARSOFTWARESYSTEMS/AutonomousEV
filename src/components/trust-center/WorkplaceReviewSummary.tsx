import ReviewSummaryCard from "./ReviewSummaryCard";
import type { TrustSourceMeta } from "@/lib/trust-center/types";

export default function WorkplaceReviewSummary({ meta }: { meta: TrustSourceMeta }) {
  return (
    <ReviewSummaryCard
      meta={meta}
      title={`${meta.sourceLabel} — iTelematics Software`}
      ctaLabel="View on Glassdoor"
      classificationNote="Employer / workplace feedback — not customer feedback."
    />
  );
}
