"use client";
// The Bengaluru Aerospace & Defence market map: verified public facts with
// their source, ecosystem anchors, categories as hypotheses, and what to
// record for each account.
import { useEffect } from "react";
import { trackRevenue } from "../analytics";
import { ACCOUNT_FIELDS, ANCHORS, FACTS_CAVEAT, MARKET_CATEGORIES, SOURCES, VERIFIED_FACTS } from "../data/market";
import { Badge, EvidenceBadge } from "../ui/badges";
import { List, Notice, Panel, ViewHeader } from "../ui/controls";
import { ViewLink } from "../workspace/nav";
import css from "../workspace.module.css";

const RELEVANCE_TONE = { Higher: "green", Medium: "cyan", Lower: "neutral" } as const;

export default function MarketView() {
  useEffect(() => trackRevenue("market_map_view"), []);
  const source = SOURCES.investKarnataka;

  return (
    <div>
      <ViewHeader eyebrow="Market" title="Bengaluru Aerospace & Defence Market Map" lede="Understand the ecosystem before contacting anyone. Public information only; categories are hypotheses about FAI relevance, not facts." />

      <Panel title="What the official source says" kicker="Research" actions={<EvidenceBadge level="research" />}>
        <dl className={css.factGrid}>
          {VERIFIED_FACTS.map((fact) => (
            <div key={fact.text} className={css.fact}>
              <dt className={css.factValue}>{fact.value}</dt>
              <dd>{fact.text}</dd>
            </div>
          ))}
        </dl>
        <p className={css.sourceLine}>
          Source:{" "}
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.label}
            <span className={css.srOnly}> (opens in a new tab)</span>
          </a>
          , accessed {source.accessed}.
        </p>
        <Notice tone="warn">{FACTS_CAVEAT}</Notice>
      </Panel>

      <Panel title="Ecosystem anchors" kicker="Where">
        <ul className={css.cardList}>
          {ANCHORS.map((anchor) => (
            <li key={anchor.name} className={css.miniCard}>
              <h4 className={css.miniTitle}>{anchor.name}</h4>
              <p>{anchor.text}</p>
              {anchor.verify ? <p className={css.blockNote}>{anchor.verify}</p> : null}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Ecosystem categories" kicker="What they do" actions={<EvidenceBadge level="assumption" />}>
        <p className={css.panelLede}>Likely FAI relevance is a starting hypothesis. Confirm it account by account, and never treat every company in a category or an industrial area as a target.</p>
        <ul className={css.categoryGrid}>
          {MARKET_CATEGORIES.map((category) => (
            <li key={category.id} className={css.miniCard}>
              <div className={css.miniHead}>
                <h4 className={css.miniTitle}>{category.name}</h4>
                <Badge tone={RELEVANCE_TONE[category.relevance]}>{category.relevance} FAI relevance (hypothesis)</Badge>
              </div>
              <p>{category.hypothesis}</p>
              <p className={css.blockNote}>
                <strong>Verify:</strong> {category.verify}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Account research fields" kicker="For every organisation" actions={<ViewLink view="accounts" className={css.chipLink}>Open Accounts</ViewLink>}>
        <List items={ACCOUNT_FIELDS} />
        <Notice tone="danger">Never fabricate employee numbers, revenue, certifications or customers. Do not expose confidential or private business information.</Notice>
      </Panel>
    </div>
  );
}
