import styles from "./TrustSearch.module.css";
import TrustCitation from "./TrustCitation";
import { trackEvent } from "@/utils/analytics";
import type { TrustSearchResult as TrustSearchResultType } from "@/lib/trust-center/types";

export default function TrustSearchResult({ result }: { result: TrustSearchResultType }) {
  const { item } = result;
  return (
    <article
      className={styles.resultItem}
      onClick={() => trackEvent("trust_search_result_clicked", { contentId: item.id, source: item.source })}
    >
      <h4 className={styles.resultTitle}>{item.title}</h4>
      {(item.approvedExcerpt || item.summary) && (
        <p className={styles.resultExcerpt}>{item.approvedExcerpt ?? item.summary}</p>
      )}
      <TrustCitation item={item} />
    </article>
  );
}
