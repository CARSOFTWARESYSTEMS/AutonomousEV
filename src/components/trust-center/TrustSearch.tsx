"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import styles from "./TrustSearch.module.css";
import shared from "./shared.module.css";
import TrustSearchResult from "./TrustSearchResult";
import { searchTrustContent } from "@/lib/trust-center/search";
import { DeterministicTrustAnswerEngine } from "@/lib/trust-center/answerEngine";
import { trackEvent } from "@/utils/analytics";
import type { GroundedTrustAnswer, TrustContentItem, TrustSearchResult as TrustSearchResultType, TrustSource } from "@/lib/trust-center/types";

const answerEngine = new DeterministicTrustAnswerEngine();

const SOURCE_LABELS: Partial<Record<TrustSource, string>> = {
  google: "Google",
  topmate: "Topmate",
  linkedin: "LinkedIn",
  glassdoor: "Glassdoor",
  "ev-society": "EV Society",
  youtube: "YouTube",
  "case-study": "Success Stories",
  manual: "General",
};

interface TrustSearchProps {
  items: TrustContentItem[];
}

export default function TrustSearch({ items }: TrustSearchProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<TrustSource | "">("");
  const [results, setResults] = useState<TrustSearchResultType[] | null>(null);
  const [answer, setAnswer] = useState<GroundedTrustAnswer | null>(null);

  const availableSources = useMemo(() => {
    const set = new Set<TrustSource>();
    items.forEach((item) => set.add(item.source));
    return Array.from(set);
  }, [items]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const searchResults = searchTrustContent(items, {
      query,
      source: source || undefined,
      limit: 10,
    });
    setResults(searchResults);

    const grounded = await answerEngine.answer(query, searchResults);
    setAnswer(grounded);

    trackEvent("trust_search_submitted", {
      hasQuery: query.trim().length > 0,
      source: source || "all",
      resultCount: searchResults.length,
    });
    if (searchResults.length === 0) {
      trackEvent("trust_search_no_results", { source: source || "all" });
    }
  };

  return (
    <div className={styles.wrap} id="trust-search-panel">
      <form className={styles.form} onSubmit={handleSubmit} role="search" aria-label="Ask the Trust Center">
        <label htmlFor="trust-search-input" className={shared.srOnly}>
          Ask a question about EV.ENGINEER™ feedback, mentorship or engineering community impact
        </label>
        <input
          id="trust-search-input"
          type="search"
          className={styles.input}
          placeholder="e.g. What do engineers say about the mentorship?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={styles.select}
          value={source}
          onChange={(e) => setSource(e.target.value as TrustSource | "")}
          aria-label="Filter search by source"
        >
          <option value="">All sources</option>
          {availableSources.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          <Search size={16} aria-hidden="true" style={{ marginRight: 6 }} />
          Search
        </button>
      </form>

      {answer && (
        <div>
          <div className={styles.answerLabel}>Trust Center Search</div>
          <div className={styles.answerBox}>{answer.answer}</div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className={styles.resultsList}>
          {results.map((result) => (
            <TrustSearchResult key={result.item.id} result={result} />
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>
          No matching content found. Try a different search term or source filter.
        </p>
      )}
    </div>
  );
}
