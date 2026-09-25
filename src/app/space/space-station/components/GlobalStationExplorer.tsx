"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STATIONS, COMMERCIAL_STATIONS, CLD_CONTEXT, type Lifecycle } from "../data/stations";
import { source, type SourceId } from "../data/sources";
import { Badge } from "./ui";
import styles from "../station.module.css";
import ws from "./world.module.css";

interface Card {
  id: string;
  name: string;
  operator: string;
  lifecycle: Lifecycle;
  statusLabel: string;
  commercial: boolean;
  lede: string;
  status: string;
  highlights: { title: string; text: string }[];
  sources: SourceId[];
}

const firstSentence = (t: string) => (t.match(/^.*?[.!?](\s|$)/)?.[0] ?? t).trim();

// Status labels come from the data; "· Paused" is added only where the data says so.
const CARDS: Card[] = [
  ...STATIONS.map((s) => ({
    id: s.id,
    name: s.name,
    operator: s.operator,
    lifecycle: s.lifecycle,
    statusLabel: s.paused ? `${s.lifecycle} · Paused` : s.lifecycle,
    commercial: false,
    lede: firstSentence(s.summary),
    status: s.statusNote,
    highlights: s.highlights,
    sources: s.sources,
  })),
  ...COMMERCIAL_STATIONS.map((c) => ({
    id: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: c.name,
    operator: c.developer,
    lifecycle: c.lifecycle,
    statusLabel: c.lifecycle,
    commercial: true,
    lede: firstSentence(c.status),
    status: c.status,
    highlights: [],
    sources: c.sources,
  })),
];

const FILTERS: { id: "all" | "commercial" | Lifecycle; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Operational", label: "Operational" },
  { id: "Under construction", label: "Under construction" },
  { id: "Development", label: "Development" },
  { id: "Planned", label: "Planned" },
  { id: "commercial", label: "Commercial LEO" },
];

export default function GlobalStationExplorer() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const cards = CARDS.filter((c) => filter === "all" || (filter === "commercial" ? c.commercial : c.lifecycle === filter));

  const go = (i: number) => {
    const n = Math.max(0, Math.min(cards.length - 1, i));
    setIndex(n);
    const el = track.current?.children[n] as HTMLElement | undefined;
    el?.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter by lifecycle status" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.chip}
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setIndex(0);
              track.current?.scrollTo({ left: 0 });
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={ws.carouselBar} aria-hidden={cards.length < 2}>
        <button type="button" className={ws.navButton} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous station">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <span className={ws.counter} aria-live="polite">
          {cards.length ? `${index + 1} of ${cards.length} · ${cards[index]?.name}` : "No stations"}
        </span>
        <button type="button" className={ws.navButton} onClick={() => go(index + 1)} disabled={index >= cards.length - 1} aria-label="Next station">
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <ul
        ref={track}
        className={ws.track}
        aria-label="Space stations"
        onScroll={(e) => {
          const el = e.currentTarget;
          const first = el.children[0] as HTMLElement | undefined;
          if (!first) return;
          const i = Math.round(el.scrollLeft / (first.offsetWidth + 12));
          if (i !== index) setIndex(Math.max(0, Math.min(cards.length - 1, i)));
        }}
      >
        {cards.map((c, i) => (
          <li key={c.id} className={ws.card} id={`station-${c.id}`} aria-label={`${i + 1} of ${cards.length}: ${c.name}`}>
            <div className={ws.badges}>
              <Badge label={c.statusLabel} />
              {c.commercial && <span className={ws.category}>Commercial LEO</span>}
            </div>
            <h3>{c.name}</h3>
            <p className={ws.operator}>{c.operator}</p>
            <p className={ws.lede}>{c.lede}</p>
            <details className={ws.more}>
              <summary>Explore {c.name}</summary>
              <div>
                <p>
                  <b>Status: </b>
                  {c.status}
                </p>
                {c.highlights.length > 0 && (
                  <dl className={styles.kv}>
                    {c.highlights.map((h) => (
                      <div key={h.title}>
                        <dt>{h.title}</dt>
                        <dd>{h.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className={ws.sources}>
                  Sources:{" "}
                  {c.sources.map((id, k) => (
                    <span key={id}>
                      {k > 0 && " · "}
                      <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                        {source(id).title}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <p className={ws.context} style={{ marginTop: 16 }}>
        <b>Commercial LEO stations</b> are a separate category: {CLD_CONTEXT} None of the commercial stations is operational; status reflects the cited
        operator or NASA statements.
      </p>
      {cards.length === 0 && <p>No stations match this status.</p>}
    </>
  );
}
