// The Next-Generation Rocket Engine Digital Twin page. Everything here except
// the three interactive pieces (hero actions, stage, console) is rendered on
// the server, so the page says what it is without running any script.
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PreparedBy from "@/components/PreparedBy";
import { rocketTwinLinkTracking } from "./analytics";
import {
  ARCHITECTURE,
  DISCLAIMER,
  FAQ,
  FAULTS,
  GLOSSARY,
  MODELS,
  MODEL_CREDIBILITY,
  MODEL_STATUS,
  OVERVIEW,
  PREPARED_BY,
  PRODUCT,
  RELATED,
  SENSORS_TO_TWIN,
  SYSTEMS,
  TEST_PHASES,
  TWIN_STATES,
} from "./data/engineReference";
import ExploreSystemLink from "./ExploreSystemLink";
import HeroActions from "./HeroActions";
import LargerScreenNote from "./LargerScreenNote";
import TwinConsole from "./TwinConsole";
import TwinStage from "./TwinStage";
import styles from "./rocketTwin.module.css";

export default function RocketTwinPage() {
  return (
    // data-track-manual: the controls here report their own events through the store.
    <div className={styles.page} data-track-manual="">
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <header className={styles.header}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link href={PRODUCT.homeRoute} className={styles.crumbLink} {...rocketTwinLinkTracking("rocket_twin_related_click", { destination: "space" })}>
                <ArrowLeft size={15} aria-hidden="true" />
                {PRODUCT.homeLabel}
              </Link>
            </li>
            <li className={styles.crumbCurrent} aria-current="page">
              {PRODUCT.name}
            </li>
          </ol>
        </nav>
        <span className={styles.brand}>EV.ENGINEER™</span>
      </header>

      <main id="main-content" className={styles.main}>
        <div className={styles.app}>
          <section className={styles.hero} aria-labelledby="rocket-twin-title">
            <h1 id="rocket-twin-title" className={styles.title}>
              {PRODUCT.name}
            </h1>
            <p className={styles.tagline}>{PRODUCT.tagline}</p>
            <p className={styles.platform}>{PRODUCT.platform}</p>
            <p className={styles.description}>{PRODUCT.description}</p>
            <HeroActions />
            <LargerScreenNote />
          </section>

          <TwinStage />
          <TwinConsole />
        </div>

        <section className={styles.section} aria-labelledby="overview-title">
          <div className={styles.split}>
            <h2 id="overview-title" className={styles.heading}>
              {OVERVIEW.heading}
            </h2>
            <div>
              {OVERVIEW.paragraphs.map((text) => (
                <p key={text} className={styles.prose}>
                  {text}
                </p>
              ))}
              <p className={styles.label}>{OVERVIEW.coversLabel}</p>
              <ul className={styles.covers}>
                {OVERVIEW.covers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="systems-title">
          <div className={styles.split}>
            <h2 id="systems-title" className={styles.heading}>
              Explore the Engine
            </h2>
            <div>
              <h3 className={styles.subheading}>{ARCHITECTURE.heading}</h3>
              <p className={styles.prose}>{ARCHITECTURE.text}</p>
            </div>
          </div>
          <ul className={styles.cards}>
            {SYSTEMS.map((system) => (
              <li key={system.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{system.name}</h3>
                <p className={styles.cardText}>{system.summary}</p>
                <ExploreSystemLink system={system.id} />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="sensors-title">
          <div className={styles.split}>
            <h2 id="sensors-title" className={styles.heading}>
              {SENSORS_TO_TWIN.heading}
            </h2>
            <p className={styles.prose}>{SENSORS_TO_TWIN.intro}</p>
          </div>
          <div className={styles.columns}>
            <div>
              <h3 className={styles.subheading}>{SENSORS_TO_TWIN.testing.heading}</h3>
              <p className={styles.prose}>{SENSORS_TO_TWIN.testing.text}</p>
              <ol className={styles.inlineList} aria-label="Test phases">
                {TEST_PHASES.map((phase) => (
                  <li key={phase.id}>{phase.name}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className={styles.subheading}>{SENSORS_TO_TWIN.health.heading}</h3>
              <p className={styles.prose}>{SENSORS_TO_TWIN.health.text}</p>
              <ul className={styles.inlineList} aria-label="Fault scenarios">
                {FAULTS.map((fault) => (
                  <li key={fault.id}>{fault.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className={styles.subheading}>{SENSORS_TO_TWIN.twin.heading}</h3>
          <p className={styles.prose}>{SENSORS_TO_TWIN.twin.text}</p>
          <dl className={styles.states}>
            {TWIN_STATES.map((state) => (
              <div key={state.id} className={styles.state}>
                <dt>{state.label}</dt>
                <dd>{state.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id={MODEL_CREDIBILITY.id} className={styles.section} aria-labelledby="credibility-title">
          <div className={styles.split}>
            <h2 id="credibility-title" className={styles.heading}>
              {MODEL_CREDIBILITY.heading}
            </h2>
            <div>
              <p className={styles.prose}>{MODEL_CREDIBILITY.text}</p>
              <ul className={styles.statuses} aria-label="Model status terms">
                {MODEL_STATUS.map((status) => (
                  <li key={status}>{status}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.tableWrap} role="region" aria-label="Model credibility table" tabIndex={0}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Fidelity, assumptions, data and validation status of each model</caption>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Fidelity</th>
                  <th scope="col">Assumptions</th>
                  <th scope="col">Data</th>
                  <th scope="col">Validation</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((model) => (
                  <tr key={model.name}>
                    <th scope="row">
                      {model.name}
                      <span className={styles.tag}>{model.status}</span>
                    </th>
                    <td>{model.fidelity}</td>
                    <td>{model.assumptions}</td>
                    <td>{model.data}</td>
                    <td>{model.validation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.split}>
            <h2 id="faq-title" className={styles.heading}>
              Frequently Asked Questions
            </h2>
            <div>
              {/* <details> keeps every answer in the HTML; only its visibility changes. */}
              {FAQ.map((item, i) => (
                <details key={item.q} className={styles.faq} open={i === 0}>
                  <summary>
                    <h3>{item.q}</h3>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
              <details className={styles.faq}>
                <summary>
                  <h3>Glossary</h3>
                </summary>
                <dl className={styles.glossary}>
                  {GLOSSARY.map((entry) => (
                    <div key={entry.term}>
                      <dt>{entry.term}</dt>
                      <dd>{entry.definition}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="prepared-title">
          <h2 id="prepared-title" className={styles.srOnly}>
            Prepared By
          </h2>
          <PreparedBy
            notes={PREPARED_BY.notes}
            reviewed={PREPARED_BY.reviewed}
            reviewedLabel={PREPARED_BY.reviewedLabel}
            imageAlt={PREPARED_BY.imageAlt}
            profileLinkProps={rocketTwinLinkTracking("rocket_twin_profile_click", { placement: "prepared_by" })}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        <nav aria-label="Related learning">
          <p className={styles.label}>Continue learning</p>
          <ul className={styles.related}>
            {RELATED.map((link) => (
              <li key={link.destination}>
                <Link href={link.href} className={styles.relatedLink} {...rocketTwinLinkTracking("rocket_twin_related_click", { destination: link.destination })}>
                  <span className={styles.relatedTitle}>
                    {link.title} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                  <span className={styles.relatedText}>{link.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
        <p className={styles.footerLine}>{PRODUCT.name} · EV.ENGINEER™</p>
      </footer>
    </div>
  );
}
