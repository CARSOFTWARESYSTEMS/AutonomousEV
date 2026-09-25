import { ArrowRight } from "lucide-react";
import { BAS_FACTS, BAS_UNSPECIFIED, BAS_TECHNOLOGIES, BAS_RESEARCH_AREAS, BAS_READINESS, NOT_SPECIFIED } from "../data/india";
import { source, type SourceId } from "../data/sources";
import { Badge, SourceList } from "./ui";
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

export default function BASExplorer() {
  return (
    <>
      <p style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Badge label="Planned" /> <Badge label="Under Development" />
        <span>Every statement below is taken from official Government of India / ISRO releases. Nothing here is an estimate.</span>
      </p>

      <div className={styles.split}>
        <div className={styles.card}>
          <h3>Programme facts</h3>
          <dl className={styles.kv} style={{ marginTop: 10 }}>
            {BAS_FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value}
                  <Cite ids={f.sources} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={styles.stack}>
          <div className={styles.card}>
            <h3>What has not been published</h3>
            <p>We do not estimate these. They are shown exactly as the public record stands:</p>
            <dl className={styles.kv}>
              {BAS_UNSPECIFIED.map((u) => (
                <div key={u}>
                  <dt>{u}</dt>
                  <dd>{NOT_SPECIFIED}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.card}>
            <h3>Relationship to Gaganyaan and the Moon</h3>
            <p>
              BAS-01 was approved by <b>revising the scope of the Gaganyaan programme</b> to include precursor missions and the first module. Gaganyaan
              provides the human-rated launch vehicle, crew module, life support and recovery capability that crewed station operations depend on. The
              national vision pairs an operational BAS by 2035 with an <b>Indian crewed lunar mission by 2040</b>.
            </p>
          </div>
        </div>
      </div>

      <h3 className={styles.subhead}>Technology areas identified by Government / ISRO</h3>
      <div className={styles.gridAuto}>
        {BAS_TECHNOLOGIES.map((t) => (
          <article key={t.name} className={styles.card}>
            <h4>{t.name}</h4>
            <p style={{ fontSize: 15 }}>{t.why}</p>
          </article>
        ))}
        <article className={styles.card}>
          <h4>Targeted microgravity research</h4>
          <ul>
            {BAS_RESEARCH_AREAS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </article>
      </div>
      <p style={{ fontSize: 13, marginTop: 8 }}>The one-line explanations of why each technology matters are general engineering context, not ISRO statements.</p>

      <h3 className={styles.subhead}>BAS Technology Readiness Map</h3>
      <p>A learning sequence showing how capabilities build on each other. Statuses are from the cited releases; this is not an official ISRO schedule.</p>
      <ol className={styles.flow} aria-label="Capability sequence" style={{ margin: "12px 0 20px" }}>
        {BAS_READINESS.map((r, i) => (
          <li key={r.step}>
            <span>{r.step}</span>
            {i < BAS_READINESS.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <ol className={styles.steps}>
        {BAS_READINESS.map((r) => (
          <li key={r.step}>
            <h4>
              {r.step} <Badge label={r.status} />
            </h4>
            <p>
              {r.detail} <Cite ids={r.sources} />
            </p>
          </li>
        ))}
      </ol>

      <SourceList ids={["pib-bas-cabinet-2024", "pib-bas-benefits-2026", "pib-bas-operationalisation-2024", "pib-gaganyaan-bas-2026", "pib-spadex-2025", "pib-space-odyssey-2026", "isro-gaganyaan", "isro-hsfc"]} />
    </>
  );
}
