import ReviewSummaryCard from "./ReviewSummaryCard";
import type { TrustSourceMeta } from "@/lib/trust-center/types";

export default function TopmateFeedbackCard({ meta }: { meta: TrustSourceMeta }) {
  return <ReviewSummaryCard meta={meta} ctaLabel="View Topmate Profile" />;
}
