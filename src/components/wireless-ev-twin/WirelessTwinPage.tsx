// The Next-Generation Wireless EV Charging Digital Twin page. The hero and
// all long-form content are rendered on the server, so the page says what it
// is without running any script; the research environment mounts under it.
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CHAIN_COMPONENTS } from "@/lib/wireless-charging/components";
import { CURRICULUM, CURRICULUM_NOTE, CURRICULUM_TOTALS, DISCLAIMER, ENVIRONMENTS, FAQ, GATES, HIGH_POWER_NOTE, LEADERSHIP, POC_STAGES, PRODUCT, STANDARDS } from "@/lib/wireless-charging/content";
import { FIDELITY, MODELS } from "@/lib/wireless-charging/registry";
import TwinApp from "./TwinApp";
import styles from "./wirelessTwin.module.css";

export default function WirelessTwinPage() {
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link href="/internships" className={styles.crumbLink}>
                <ArrowLeft size={15} aria-hidden="true" />
                Internships
              </Link>
            </li>
            <li aria-current="page">{PRODUCT.name}</li>
          </ol>
        </nav>
        <span className={styles.brand}>{PRODUCT.brand}</span>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="wevct-title">
          <div>
            <p className={styles.eyebrow}>{`${PRODUCT.brand} · Proof of Concept`}</p>
            <h1 id="wevct-title" className={styles.title}>
              {PRODUCT.name}
            </h1>
            <p className={styles.tagline}>{PRODUCT.tagline}</p>
          </div>
          <div className={styles.heroSide}>
            <p>{PRODUCT.description}</p>
            <p className={styles.meta}>
              <span>{PRODUCT.programme}</span>
              <span>{PRODUCT.attribution}</span>
            </p>
            <a href="#research-laboratory" className={styles.primary}>
              Enter Research Laboratory <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <TwinApp />

        <div className={styles.long}>
          <section className={styles.section} aria-labelledby="question-title">
            <h2 id="question-title" className={styles.heading}>
              The research question
            </h2>
            <div>
              <p className={styles.lead}>{PRODUCT.question}</p>
              <p className={styles.prose}>
                Every behaviour shown in the twin traces to a stated physical principle, equation, declared approximation or numerical model. One engine — magnetic coupling, resonant circuits, power converters, battery, thermal, vehicle motion, communication and energy dispatch — drives all four environments, every graph and every number.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="env-title">
            <h2 id="env-title" className={styles.heading}>
              Four connected digital twins
            </h2>
            <ul className={styles.cards}>
              {ENVIRONMENTS.map((e) => (
                <li key={e.id} className={styles.card}>
                  <p className={styles.number}>{e.number}</p>
                  <h3>{e.name}</h3>
                  <p>{e.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="chain-title">
            <h2 id="chain-title" className={styles.heading}>
              The electrical energy chain
            </h2>
            <div>
              <p className={styles.prose}>From the grid to the battery, through every stage the simulation accounts for. Grid power always equals battery power plus the sum of every stage’s loss.</p>
              <ol className={styles.chain}>
                {CHAIN_COMPONENTS.map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong>
                    <span>{c.purpose}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="models-title">
            <h2 id="models-title" className={styles.heading}>
              Models, fidelity and validation
            </h2>
            <div>
              <p className={styles.prose}>
                {`${MODELS.length} registered models. Fidelity runs from F0 (${FIDELITY.F0.name.toLowerCase()}) to F5 (${FIDELITY.F5.name.toLowerCase()}). Analytical verification compares a model with an independent result; experimental validation needs measurements, and none is claimed.`}
              </p>
              <div className={styles.tableWrap} role="region" aria-label="Model registry" tabIndex={0}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Model</th>
                      <th scope="col">Fidelity</th>
                      <th scope="col">Status</th>
                      <th scope="col">Main limitation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m) => (
                      <tr key={m.id}>
                        <th scope="row">{`${m.id} · ${m.name}`}</th>
                        <td>{m.fidelity}</td>
                        <td>{m.status}</td>
                        <td>{m.limitations[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="programme-title">
            <h2 id="programme-title" className={styles.heading}>
              {PRODUCT.programme}
            </h2>
            <div>
              <p className={styles.prose}>{`${CURRICULUM_TOTALS.weeks} weeks, ${CURRICULUM_TOTALS.units} learning and experimental units, about ${CURRICULUM_TOTALS.hours} hours. ${CURRICULUM_NOTE}`}</p>
              <ol className={styles.months}>
                {CURRICULUM.map((m) => (
                  <li key={m.month}>
                    <strong>{`Month ${m.month} — ${m.title}`}</strong>
                    <span>{`Deliverable: ${m.deliverable}`}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="poc-title">
            <h2 id="poc-title" className={styles.heading}>
              Physical proof of concept
            </h2>
            <div>
              <ol className={styles.months}>
                {POC_STAGES.map((p) => (
                  <li key={p.id}>
                    <strong>{`${p.id} — ${p.title}`}</strong>
                    <span>{p.goal}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.note}>{`All initial hardware uses isolated, current-limited, low-voltage laboratory equipment under qualified supervision. ${HIGH_POWER_NOTE}`}</p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="assurance-title">
            <h2 id="assurance-title" className={styles.heading}>
              Engineering assurance
            </h2>
            <div>
              <p className={styles.prose}>Seven review gates, from Mission Concept Review to Final Research Review, each with criteria, evidence and outstanding issues. None is shown as approved.</p>
              <ul className={styles.inline}>
                {GATES.map((g) => (
                  <li key={g.id}>{`${g.id} · ${g.name} — ${g.status}`}</li>
                ))}
              </ul>
              <p className={styles.prose}>{`Standards awareness covers ${STANDARDS.map((s) => s.id).join(", ")}. Their applicability and current editions are to be verified; no compliance or certification is claimed.`}</p>
            </div>
          </section>

          <section id="research-team" className={styles.leadership} aria-labelledby="leadership-title">
            <div className={styles.leadershipHead}>
              <p className={styles.eyebrow}>Research &amp; Attribution</p>
              <h2 id="leadership-title" className={styles.heading}>
                {LEADERSHIP.heading}
              </h2>
              <p className={styles.prose}>{LEADERSHIP.subtitle}</p>
            </div>
            <ul className={styles.researchers}>
              {LEADERSHIP.researchers.map((r) => (
                <li key={r.name} className={styles.researcher} data-lead={r.lead || undefined}>
                  <p className={styles.role}>{r.role}</p>
                  <h3 className={styles.researcherName}>{r.name}</h3>
                  <p className={styles.affiliation}>{r.affiliation}</p>
                  <p className={styles.researcherBody}>{r.body}</p>
                  <ul className={styles.researcherLinks} aria-label={`Links for ${r.name}`}>
                    {r.links.map((l) => {
                      const external = l.href.startsWith("http");
                      return (
                        <li key={l.href}>
                          {external ? (
                            <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${l.label} (opens in a new tab)`} data-track-event="wireless_ev_twin_researcher_click" data-track-title={r.name}>
                              {l.text} <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <Link href={l.href} aria-label={l.label} data-track-event="wireless_ev_twin_researcher_click" data-track-title={r.name}>
                              {l.text} <span aria-hidden="true">→</span>
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="faq-title">
            <h2 id="faq-title" className={styles.heading}>
              Frequently asked questions
            </h2>
            <div>
              {FAQ.map((item, i) => (
                <details key={item.q} className={styles.faq} open={i === 0}>
                  <summary>
                    <h3>{item.q}</h3>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
        <p className={styles.footerLine}>{`${PRODUCT.name} · ${PRODUCT.attribution}`}</p>
        <Link href="/internships" className={styles.crumbLink}>
          <ArrowLeft size={14} aria-hidden="true" /> All internships and research programmes
        </Link>
      </footer>
    </div>
  );
}
