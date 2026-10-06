"use client";

import { useId, useRef, useState } from "react";
import { trackAqip } from "../analytics";
import css from "../interactive.module.css";

interface Term {
  term: string;
  definition: string;
}

/** The glossary, filtered as the reader types. Every term is in the page before any search. */
export default function Glossary({ terms }: { terms: readonly Term[] }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const searched = useRef(false);

  const needle = query.trim().toLowerCase();
  const shown = needle ? terms.filter((item) => item.term.toLowerCase().includes(needle) || item.definition.toLowerCase().includes(needle)) : terms;

  return (
    <div className={css.glossary}>
      <div className={css.glossarySearch}>
        <label htmlFor={`${uid}-search`}>Search the glossary</label>
        <input
          id={`${uid}-search`}
          type="search"
          value={query}
          placeholder="e.g. FAI, GD&T, traceability"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            // Only the fact of a search is reported, never what was typed.
            if (searched.current) return;
            searched.current = true;
            trackAqip("aqip_glossary_search");
          }}
        />
        <p className={css.glossaryCount} role="status">
          {shown.length === terms.length ? `${terms.length} terms` : `${shown.length} of ${terms.length} terms`}
        </p>
      </div>
      {shown.length > 0 ? (
        <dl className={css.glossaryList}>
          {shown.map((item) => (
            <div key={item.term} className={css.glossaryItem}>
              <dt>{item.term}</dt>
              <dd>{item.definition}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={css.glossaryEmpty}>No term matches that search.</p>
      )}
    </div>
  );
}
