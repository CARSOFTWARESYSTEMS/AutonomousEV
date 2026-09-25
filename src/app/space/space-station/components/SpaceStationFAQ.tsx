"use client";
import { useId, useState } from "react";
import { FAQ } from "../data/faq";
import { source } from "../data/sources";
import styles from "../station.module.css";

const TOPICS = ["All", ...Array.from(new Set(FAQ.map((f) => f.topic)))] as const;
const POPULAR = ["fall", "breathe", "docking", "bas", "why-bas", "microgravity", "power-failure", "after-iss"];

export default function SpaceStationFAQ() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const searchId = useId();
  const needle = q.trim().toLowerCase();
  const items = FAQ.filter((f) => (topic === "All" || f.topic === topic) && (!needle || `${f.q} ${f.a}`.toLowerCase().includes(needle)));
  const openQuestion = (id: string) => {
    setQ("");
    setTopic("All");
    requestAnimationFrame(() => {
      const el = document.getElementById(`faq-${id}`) as HTMLDetailsElement | null;
      if (!el) return;
      el.open = true;
      el.scrollIntoView?.({ block: "center" });
      el.querySelector("summary")?.focus();
    });
  };
  return (
    <div>
      <p className={styles.askPrompt}>What would you like to understand?</p>
      <ul className={styles.popular} aria-label="Popular questions">
        {POPULAR.map((id) => {
          const f = FAQ.find((x) => x.id === id)!;
          return (
            <li key={id}>
              <button type="button" onClick={() => openQuestion(id)}>
                {f.q}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.faqTools}>
        <label htmlFor={searchId} className={styles.srOnly}>
          Search questions
        </label>
        <input id={searchId} type="search" className={styles.search} placeholder="Ask a question, e.g. “docking” or “BAS”" value={q} onChange={(e) => setQ(e.target.value)} />
        <span aria-live="polite" style={{ fontSize: 14, color: "var(--space-muted)" }}>
          {items.length} question{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className={styles.chips} role="group" aria-label="Filter questions by topic" style={{ marginBottom: 16 }}>
        {TOPICS.map((t) => (
          <button key={t} type="button" className={styles.chip} aria-pressed={topic === t} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className={styles.faqList}>
        {items.map((f) => (
          <details key={f.id} className={styles.faqItem} id={`faq-${f.id}`}>
            <summary>{f.q}</summary>
            <div>
              <p>{f.a}</p>
              {f.sources.length > 0 && (
                <p style={{ fontSize: 13 }}>
                  Source{f.sources.length > 1 ? "s" : ""}:{" "}
                  {f.sources.map((id, i) => (
                    <span key={id}>
                      {i > 0 && " · "}
                      <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                        {source(id).org}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
      {items.length === 0 && <p>No matching questions. Try a broader word such as “power”, “water” or “Moon”.</p>}
    </div>
  );
}
