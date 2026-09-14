"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function Glossary() {
  const [query, setQuery] = useState("");
  const filtered = GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(query.toLowerCase()) || g.definition.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className={styles.search}>
        <Search size={18} />
        <input
          type="search"
          placeholder="Search the glossary…"
          aria-label="Search the glossary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className={styles.glossaryCount}>
        {filtered.length} of {GLOSSARY.length} terms
      </p>
      <dl className={styles.glossaryGrid}>
        {filtered.map((g) => (
          <div key={g.term} className={styles.glossaryTerm}>
            <dt>{g.term}</dt>
            <dd>{g.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
