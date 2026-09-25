import { BAS_FACTS, BAS_UNSPECIFIED, BAS_TECHNOLOGIES, BAS_RESEARCH_AREAS, BAS_READINESS, BAS_KEY_METRICS, NOT_SPECIFIED } from "../data/india";
import { source, type SourceId } from "../data/sources";
import { Badge, SourceList } from "./ui";
import ResponsiveTabs from "./ResponsiveTabs";
import styles from "../station.module.css";

function Cite({ ids }: { ids: readonly SourceId[] }) {
  return (
    <small>
      {ids.map((id, i) => {
        const s = source(id);
        return (
          <span key={id}>
            {i > 0 && " · "}
            <a className={styles.inlineLink} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.org.replace(" · Government of India", "")}
            </a>
          </span>
        );
      })}
    </small>
  );
}

const MISSION = ["Programme", "Status", "Approval", "Industry"];
const ARCHITECTURE = ["Configuration", "First module", "Fully operational", "Approved cost (first module)"];

function Facts({ labels }: { labels: string[] }) {
  return (
    <dl className={styles.kv}>
      {BAS_FACTS.filter((f) => labels.includes(f.label)).map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            {f.value}
            <Cite ids={f.sources} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function BASExplorer() {
  const tabs = [
    {
      id: "mission",
      label: "Mission",
      content: (
        <>
          <h3 className={styles.panelTitle}>Mission</h3>
          <Facts labels={MISSION} />
          <h4 className={styles.subhead}>Relationship to Gaganyaan and the Moon</h4>
          <p>
            BAS-01 was approved by <b>revising the scope of the Gaganyaan programme</b> to include precursor missions and the first module. Gaganyaan
            provides the human-rated launch vehicle, crew module, life support and recovery capability that crewed station operations depend on. The
            national vision pairs an operational BAS by 2035 with an <b>Indian crewed lunar mission by 2040</b>.
          </p>
          <h4 className={styles.subhead}>BAS Technology Readiness Map</h4>
          <p style={{ fontSize: 14 }}>A learning sequence showing how capabilities build on each other. Statuses are from the cited releases; this is not an official ISRO schedule.</p>
          <ol className={styles.roadmap}>
            {BAS_READINESS.map((r) => (
              <li key={r.step}>
                <h5>
                  {r.step} <Badge label={r.status} />
                </h5>
                <p>
                  {r.detail} <Cite ids={r.sources} />
                </p>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: "architecture",
      label: "Architecture",
      content: (
        <>
          <h3 className={styles.panelTitle}>Architecture</h3>
          <Facts labels={ARCHITECTURE} />
          <h4 className={styles.subhead}>What has not been published</h4>
          <p style={{ fontSize: 14 }}>We do not estimate these. They are shown exactly as the public record stands:</p>
          <dl className={styles.kv}>
            {BAS_UNSPECIFIED.map((u) => (
              <div key={u}>
                <dt>{u}</dt>
                <dd>{NOT_SPECIFIED}</dd>
              </div>
            ))}
          </dl>
        </>
      ),
    },
    {
      id: "research",
      label: "Research",
      content: (
        <>
          <h3 className={styles.panelTitle}>Research</h3>
          <p>Key microgravity research areas targeted for BAS, as stated by the Government of India:</p>
          <ul className={styles.tagList}>
            {BAS_RESEARCH_AREAS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p style={{ marginTop: 12 }}>
            Indian researchers can prepare through ISRO&apos;s microgravity experiment programme — see{" "}
            <a className={styles.inlineLink} href="#india-microgravity">
              Indian Microgravity Research
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "technology",
      label: "Technology",
      content: (
        <>
          <h3 className={styles.panelTitle}>Technology areas identified by Government / ISRO</h3>
          <div className={styles.ruleGrid}>
            {BAS_TECHNOLOGIES.map((t) => (
              <article key={t.name}>
                <h4>{t.name}</h4>
                <p>{t.why}</p>
              </article>
            ))}
          </div>
          <p style={{ fontSize: 13, marginTop: 8 }}>The one-line explanations of why each technology matters are general engineering context, not ISRO statements.</p>
        </>
      ),
    },
    {
      id: "sources",
      label: "Sources",
      content: (
        <SourceList
          open
          ids={["pib-bas-cabinet-2024", "pib-bas-benefits-2026", "pib-bas-operationalisation-2024", "pib-gaganyaan-bas-2026", "pib-spadex-2025", "pib-space-odyssey-2026", "isro-gaganyaan", "isro-hsfc"]}
        />
      ),
    },
  ];

  return (
    <>
      <div className={styles.basHeadline}>
        <p className={styles.basStatus}>
          <Badge label="Planned" /> <Badge label="Under Development" />
          <span>Every statement below is taken from official Government of India / ISRO releases. Nothing here is an estimate.</span>
        </p>
        <dl className={styles.basMetrics}>
          {BAS_KEY_METRICS.map((m) => (
            <div key={m.value}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
              <Cite ids={m.sources} />
            </div>
          ))}
        </dl>
      </div>
      <ResponsiveTabs label="BAS" tabs={tabs} layout={styles.basPanels} />
    </>
  );
}
