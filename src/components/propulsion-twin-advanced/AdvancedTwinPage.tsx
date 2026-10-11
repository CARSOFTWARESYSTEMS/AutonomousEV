// The Advanced Rocket Propulsion System Digital Twin page. Everything it
// teaches is rendered on the server and stays in the document: the hero, all
// twelve modules, the questions and the references. Interaction decides what
// is showing; the simulation and the 3D view are fetched only when asked for.
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, FlaskConical } from "lucide-react";
import DesignInspirationCredit from "@/components/DesignInspirationCredit";
import PreparedBy from "@/components/PreparedBy";
import rt from "../rocket-engine-twin/rocketTwin.module.css";
import { advancedTwinLinkTracking } from "./analytics";
import { FAQ, GLOSSARY, REFERENCES, REFERENCE_ARCHITECTURE } from "./data/faq";
import { CREDIBILITY_NOTICE, PREPARED_BY, PRODUCT, RELATED } from "./data/product";
import { OverviewModule, PhysicsModule, PressureModule, SystemModule } from "./sections/Foundations";
import { ArchitectureModule, FdirModule, HealthModule, LabModule, WeeksModule } from "./sections/Operations";
import { AiModule, DataModule, TwinModule } from "./sections/TwinModules";
import { MODULES_ANCHOR } from "./state/labStore";
import ModuleNav, { ROOT_ID } from "./ui/ModuleNav";
import PropulsionSchematic from "./ui/PropulsionSchematic";
import css from "./advancedTwin.module.css";

const REFERENCE_GROUPS = [...new Set(REFERENCES.map((r) => r.group))];

export default function AdvancedTwinPage() {
  return (
    // data-track-manual: the controls here report their own events.
    <div id={ROOT_ID} className={`${rt.page} ${css.root}`} data-level="learn" data-track-manual="">
      <a href="#main-content" className={rt.skipLink}>
        Skip to content
      </a>

      <header className={rt.header}>
        <nav aria-label="Breadcrumb">
          <ol className={rt.crumbs}>
            <li>
              <Link href={PRODUCT.homeRoute} className={rt.crumbLink}>
                <ArrowLeft size={15} aria-hidden="true" />
                {PRODUCT.homeLabel}
              </Link>
            </li>
            <li className={rt.crumbCurrent} aria-current="page">
              {PRODUCT.shortName}
            </li>
          </ol>
        </nav>
        <span className={rt.brand}>EV.ENGINEER™</span>
      </header>

      <main id="main-content">
        <section className={css.hero} aria-labelledby="advanced-twin-title">
          <div className={css.heroText}>
            <p className={css.eyebrow}>EV.ENGINEER™ · Advanced Engineering Tutorial</p>
            <h1 id="advanced-twin-title" className={css.title}>
              {PRODUCT.name}
            </h1>
            <p className={css.subtitle}>{PRODUCT.subtitle}</p>
            <p className={css.supporting}>{PRODUCT.supporting}</p>
            <p className={css.description}>{PRODUCT.description}</p>
            <div className={css.actions}>
              <a href="#system" className={css.primary}>
                {PRODUCT.startLabel} <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="#lab" className={css.ghost}>
                <FlaskConical size={14} aria-hidden="true" /> {PRODUCT.labLabel}
              </a>
              <a href="#cto" className={css.ghost}>
                <Compass size={14} aria-hidden="true" /> {PRODUCT.ctoLabel}
              </a>
            </div>
            <p className={css.fundamentals}>
              New to rocket engines?{" "}
              <Link href={PRODUCT.fundamentalsRoute} className={css.textLink}>
                {PRODUCT.fundamentalsCta} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>
          </div>
          <figure className={css.heroFigure}>
            <ul className={css.stageTags} aria-label="Model status">
              <li>REFERENCE MODEL</li>
              <li>SIMULATED</li>
            </ul>
            <PropulsionSchematic className={css.schematic} flowClassName={css.flowing} />
            <figcaption className={css.stageCaption}>Generic propulsion reference architecture with its fifteen pressure sensors. Not to scale; not a flight engine.</figcaption>
          </figure>
          <aside className={css.notice} aria-label="Credibility notice">
            <p className={css.noticeLabel}>Read this first</p>
            <p>{CREDIBILITY_NOTICE}</p>
          </aside>
        </section>

        <div id={MODULES_ANCHOR} className={css.modules}>
          <ModuleNav />
          <div className={css.modulesBody}>
            <OverviewModule />
            <SystemModule />
            <PressureModule />
            <PhysicsModule />
            <DataModule />
            <TwinModule />
            <AiModule />
            <FdirModule />
            <HealthModule />
            <LabModule />
            <ArchitectureModule />
            <WeeksModule />
          </div>
        </div>

        <div className={rt.main}>
          <section className={rt.section} aria-labelledby="faq-title">
            <div className={rt.split}>
              <h2 id="faq-title" className={rt.heading}>
                Questions and Answers
              </h2>
              <div>
                {/* <details> keeps every answer in the HTML; only its visibility changes. */}
                {FAQ.map((item, i) => (
                  <details key={item.id} className={rt.faq} open={i === 0}>
                    <summary>
                      <h3>{item.q}</h3>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
                <details className={rt.faq}>
                  <summary>
                    <h3>Glossary</h3>
                  </summary>
                  <dl className={rt.glossary}>
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

          <section className={rt.section} aria-labelledby="references-title">
            <div className={rt.split}>
              <h2 id="references-title" className={rt.heading}>
                References
              </h2>
              <div>
                <h3 className={rt.subheading}>Reference Architecture</h3>
                <p className={rt.prose}>The following are this page&apos;s own illustrative material. None of it is a measurement of, or evidence about, any engine.</p>
                <ul className={css.bullets}>
                  {REFERENCE_ARCHITECTURE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <h3 className={`${rt.subheading} ${css.spaced}`}>Verified External Technical Evidence</h3>
                <p className={rt.prose}>Published sources for the methods taught here. They support the methods, not this page&apos;s numbers. Links open the publisher&apos;s record.</p>
                {REFERENCE_GROUPS.map((group) => (
                  <div key={group} className={css.refGroup}>
                    <h4 className={css.groupLabel}>{group}</h4>
                    <ul className={css.references}>
                      {REFERENCES.filter((r) => r.group === group).map((r) => (
                        <li key={r.id}>
                          <a href={r.href} target="_blank" rel="noopener noreferrer">
                            {r.title}
                            <span className={css.srOnly}> (opens in a new tab)</span>
                          </a>
                          <span>
                            {r.authors}. {r.source}, {r.year}.
                          </span>
                          <span className={css.refSupports}>Used for: {r.supports}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={rt.section} aria-labelledby="prepared-title">
            <h2 id="prepared-title" className={rt.srOnly}>
              Designed By
            </h2>
            <PreparedBy notes={PREPARED_BY.notes} reviewed={PREPARED_BY.reviewed} reviewedLabel={PREPARED_BY.reviewedLabel} reviewedSubject="Tutorial information" imageAlt={PREPARED_BY.imageAlt} profileLinkProps={advancedTwinLinkTracking("profile_clicked", { placement: "prepared_by" })} />
            <DesignInspirationCredit />
          </section>
        </div>
      </main>

      <footer className={rt.footer}>
        <nav aria-label="Related learning">
          <p className={rt.label}>Continue learning</p>
          <ul className={rt.related}>
            {RELATED.map((link) => (
              <li key={link.destination}>
                <Link href={link.href} className={rt.relatedLink}>
                  <span className={rt.relatedTitle}>
                    {link.title} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                  <span className={rt.relatedText}>{link.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={rt.disclaimer}>{CREDIBILITY_NOTICE}</p>
        <p className={rt.footerLine}>{PRODUCT.name} · EV.ENGINEER™</p>
      </footer>
    </div>
  );
}
