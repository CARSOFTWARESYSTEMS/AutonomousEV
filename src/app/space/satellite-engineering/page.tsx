import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  ArrowLeftRight,
  ChevronRight,
  ExternalLink,
  FileText,
  Gauge,
  ShieldCheck,
  Award,
} from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { EOI_FORM_URL } from "@/lib/eoi";
import ResearcherCard from "@/components/ResearcherCard";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import spaceTheme from "../spaceTheme.module.css";
import styles from "./satellite.module.css";
import HeroVisual from "./components/HeroVisual";
import Curriculum from "./components/Curriculum";
import { structuredData } from "./seo";
import {
  heroChips,
  heroAudience,
  lifecycle,
  interactingDisciplines,
  audiences,
  atAGlance,
  readiness,
  referenceMission,
  couplings,
  fidelityStages,
  dossier,
  twinProgression,
  twinLoop,
  flatsat,
  flatsatBus,
  reviewGates,
  outcomes,
  portfolio,
  careers,
  credential,
  pillars,
  learningModel,
  batteryExample,
  tools,
  references,
  missionSegments,
  marginPolicy,
  adrExample,
  LAST_REVIEWED,
  LAST_REVIEWED_LABEL,
} from "./programData";

export { metadata } from "./seo";

const MOTTO = ["Design", "Analyse", "Architect", "Build", "Test", "Operate", "Lead"];

const JUMP_LINKS: [string, string][] = [
  ["#thesis", "Thesis"],
  ["#system-of-systems", "Mission system"],
  ["#audience", "Who it is for"],
  ["#glance", "At a glance"],
  ["#reference-mission", "Reference mission"],
  ["#curriculum", "12-week architecture"],
  ["#digital-twin", "Digital twin"],
  ["#flatsat", "Flatsat"],
  ["#reviews", "Review gates"],
  ["#outcomes", "Outcomes"],
  ["#portfolio", "Portfolio"],
  ["#careers", "Careers"],
  ["#certification", "Certification"],
];

function SectionHead({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.sectionHead}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.h2}>
        {title}
      </h2>
      {children && <div className={styles.lead}>{children}</div>}
    </header>
  );
}

export default function SatelliteEngineeringPage() {
  return (
    <div className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${styles.page}`}>
      <JsonLd data={structuredData} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <SpaceHeader basePath="/space" />

      <main id="main-content">
        {/* ── Hero ── */}
        <div className={styles.heroWrap}>
          <div className={styles.orbViolet} aria-hidden="true" />
          <div className={styles.orbBlue} aria-hidden="true" />
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href="/space">Space</Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </li>
                <li aria-current="page">Satellite Engineering</li>
              </ol>
            </nav>

            <section className={styles.hero} aria-labelledby="hero-title">
              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>
                  <span className={styles.flagChip}>Flagship</span>{" "}
                  <span className={styles.eyebrowSep} aria-hidden="true">
                    ·
                  </span>{" "}
                  <span>Architecture &amp; Leadership Track</span>
                </p>
                <h1 id="hero-title" className={styles.h1}>
                  Satellite Engineering
                </h1>
                <p className={styles.heroSub}>From First Principles to Spacecraft Systems Architect</p>
                <p className={styles.heroLede}>
                  Develop the systems thinking, engineering judgement and architecture capability required to architect complex satellite missions
                  and lead multidisciplinary spacecraft engineering programs.
                </p>
                <p className={styles.heroMotto}>
                  {MOTTO.map((w, i) => (
                    <span key={w}>
                      {w}
                      {i < MOTTO.length - 1 && (
                        <>
                          <span className={styles.srOnly}>, </span>
                          <span className={styles.mottoDot} aria-hidden="true" />
                        </>
                      )}
                    </span>
                  ))}
                </p>
                <p className={styles.heroAudience}>
                  <span className={styles.heroAudienceLabel}>For</span> {heroAudience.join(" · ")}
                </p>

                <div className={styles.heroActions}>
                  <a href="#curriculum" className={styles.primaryButton}>
                    Explore the 12-Week Architecture <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a href="#outcomes" className={spaceTheme.secondaryButton}>
                    View Program Outcomes
                  </a>
                </div>
                <a href="#careers" className={styles.textLink}>
                  See Career Pathways <ChevronRight size={15} aria-hidden="true" />
                </a>

                <ul className={styles.heroChips} aria-label="Program format">
                  {heroChips.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <HeroVisual />
            </section>
          </div>
        </div>

        <nav className={styles.jumpNav} aria-label="On this page">
          <ul className={styles.container}>
            {JUMP_LINKS.map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Thesis ── */}
        <section id="thesis" className={styles.section} aria-labelledby="thesis-h">
          <div className={styles.container}>
            <SectionHead id="thesis-h" eyebrow="Course thesis" title="Engineering beyond individual subsystems">
              <p>
                The program is built around the complete spacecraft lifecycle — from the first statement of mission need to the technical and
                commercial decisions that commit a program to flight.
              </p>
            </SectionHead>

            <ol className={styles.lifecycle} aria-label="Spacecraft lifecycle">
              {lifecycle.map((step, i) => (
                <li key={step} className={i === lifecycle.length - 1 ? styles.lifecycleFinal : undefined}>
                  <span className={styles.lifecycleIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.lifecycleName}>{step}</span>
                </li>
              ))}
            </ol>

            <div className={styles.thesisPanel}>
              <div>
                <p className={styles.thesisNot}>The objective is not merely to learn how each subsystem works.</p>
                <p className={styles.thesisIs}>
                  The objective is to learn how technical decisions across orbit, payload, power, ADCS, communications, avionics, structures,
                  thermal, propulsion, software, reliability, operations and cost <em>interact at spacecraft level</em>.
                </p>
              </div>
              <ul className={styles.disciplineWeb} aria-label="Interacting disciplines">
                {interactingDisciplines.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div id="system-of-systems" className={styles.sosBlock}>
              <div className={styles.sosIntro}>
                <p className={styles.panelLabel}>Mission architecture</p>
                <h3 className={styles.h3Large}>
                  A Satellite Mission Is a <span className={styles.noWrap}>System-of-Systems</span>
                </h3>
                <p>
                  A spacecraft cannot be architected in isolation. Orbit, launch interface, payload, ground network, mission operations and
                  downstream user needs must be designed as one mission system.
                </p>
              </div>
              <figure className={styles.sosDiagram} aria-label="Mission objective, system-of-systems architecture and mission capability">
                <p className={styles.sosTerminal}>Mission objective</p>
                <span className={styles.sosArrow} aria-hidden="true">
                  <ArrowDown size={18} />
                </span>
                <div className={styles.sosFrame}>
                  <p className={styles.sosFrameLabel}>System-of-systems architecture</p>
                  <ul className={styles.sosSegments}>
                    {missionSegments.map((seg, i) => (
                      <li key={seg.name}>
                        <span className={styles.sosCode} aria-hidden="true">
                          SEG-{String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.sosName}>{seg.name}</span>
                        <span className={styles.sosElements}>{seg.elements}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.sosInterfaces}>
                    <span>Interfaces</span> ICDs · RF links · launch interface · data formats · operations procedures · end-to-end budgets
                  </p>
                </div>
                <span className={styles.sosArrow} aria-hidden="true">
                  <ArrowDown size={18} />
                </span>
                <p className={`${styles.sosTerminal} ${styles.sosCapability}`}>Mission capability</p>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Audience ── */}
        <section id="audience" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="audience-h">
          <div className={styles.container}>
            <SectionHead id="audience-h" eyebrow="Who this program is for" title="Architecture & Leadership Track">
              <p>
                This program develops the systems thinking, engineering judgement and architecture capability required to architect complex
                satellite missions and lead multidisciplinary spacecraft engineering programs.
              </p>
              <p>
                This Architecture &amp; Leadership Track is designed as an advanced Satellite Systems Engineering Course in India for experienced
                engineers and technical leaders working toward spacecraft systems and mission architecture responsibilities.
              </p>
            </SectionHead>
            <ul className={styles.audienceGrid}>
              {audiences.map((a) => (
                <li key={a.role} className={styles.audienceCard}>
                  <h3 className={styles.h3}>{a.role}</h3>
                  <p>{a.description}</p>
                </li>
              ))}
            </ul>
            <p className={styles.fineNote}>
              The program develops capabilities relevant to progression toward senior spacecraft systems and architecture roles. It does not
              itself confer job titles.
            </p>
          </div>
        </section>

        {/* ── At a glance ── */}
        <section id="glance" className={styles.section} aria-labelledby="glance-h">
          <div className={styles.container}>
            <SectionHead id="glance-h" eyebrow="Program at a glance" title="Twelve weeks of structured engineering effort" />
            <dl className={styles.glanceGrid}>
              {atAGlance.map((g) => (
                <div key={g.label} className={styles.glanceCell}>
                  <dt>{g.label}</dt>
                  <dd>{g.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Week 0 ── */}
        <section id="readiness" className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="readiness-h">
          <div className={styles.container}>
            <div className={styles.readinessPanel}>
              <div className={styles.readinessIntro}>
                <p className={styles.eyebrow}>Self-paced prerequisite support</p>
                <h2 id="readiness-h" className={styles.h2Small}>
                  Week 0 · Engineering Readiness
                </h2>
                <p>
                  Before Week 1, participants refresh the mathematics, programming, engineering and space fundamentals the program builds on.
                </p>
                <p className={styles.readinessNote}>
                  <Gauge size={16} aria-hidden="true" />
                  Experienced participants may validate readiness through a diagnostic assessment.
                </p>
              </div>
              <div className={styles.readinessGrid}>
                {readiness.map((r) => (
                  <div key={r.area}>
                    <h3 className={styles.readinessArea}>{r.area}</h3>
                    <ul>
                      {r.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Reference mission ── */}
        <section id="reference-mission" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="mission-h">
          <div className={styles.container}>
            <SectionHead id="mission-h" eyebrow="One reference mission" title="One Mission. Twelve Weeks. Increasing Engineering Fidelity.">
              <p>
                Every week modifies the same spacecraft architecture. Decisions made in one subsystem become constraints for the next — exactly as
                they do on a real program.
              </p>
            </SectionHead>

            <div className={styles.missionLayout}>
              <article className={styles.missionCard} aria-labelledby="mission-card-title">
                <div className={styles.missionCardHead}>
                  <svg className={styles.sixU} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
                    <rect x="2" y="21" width="36" height="18" rx="2" fill="none" stroke="#93C5FD" strokeOpacity="0.7" />
                    <path d="M14 21V39M26 21V39" stroke="#93C5FD" strokeOpacity="0.35" />
                    <rect x="82" y="21" width="36" height="18" rx="2" fill="none" stroke="#93C5FD" strokeOpacity="0.7" />
                    <path d="M94 21V39M106 21V39" stroke="#93C5FD" strokeOpacity="0.35" />
                    <rect x="44" y="6" width="32" height="48" rx="3" fill="rgba(124,58,237,0.18)" stroke="#B39DDB" />
                    <path d="M44 22H76M44 38H76M60 6V54" stroke="#B39DDB" strokeOpacity="0.45" />
                    <path d="M38 30H44M76 30H82" stroke="#93C5FD" strokeOpacity="0.7" />
                  </svg>
                  <div>
                    <p className={styles.panelLabel}>Reference mission · Capstone</p>
                    <h3 id="mission-card-title" className={styles.h3Large}>
                      6U Earth Observation Satellite
                    </h3>
                  </div>
                </div>
                <dl className={styles.specList}>
                  {referenceMission.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>
                        {s.value}
                        {s.detail && <span className={styles.specDetail}>{s.detail}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>

              <div className={styles.couplingPanel}>
                <h3 className={styles.h3}>Coupled decisions</h3>
                <ul className={styles.couplingList}>
                  {couplings.map((c) => (
                    <li key={c.from}>
                      <p className={styles.couplingPair}>
                        <span>{c.from}</span>
                        <ArrowLeftRight size={14} aria-hidden="true" />
                        <span className={styles.srOnly}>interacts with</span>
                        <span>{c.to}</span>
                      </p>
                      <p>{c.statement}</p>
                    </li>
                  ))}
                </ul>
                <div className={styles.fidelity}>
                  <p className={styles.panelLabel}>Engineering fidelity</p>
                  <ol className={styles.fidelityTrack}>
                    {fidelityStages.map((f) => (
                      <li key={f.phase}>
                        <span className={styles.fidelityLevel}>{f.level}</span>
                        <span className={styles.fidelityWeeks}>{f.phase}</span>
                        <span className={styles.fidelityWeeks}>{f.weeks}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dossier ── */}
        <section id="dossier" className={styles.section} aria-labelledby="dossier-h">
          <div className={styles.container}>
            <SectionHead id="dossier-h" eyebrow="Continuous engineering artefacts" title="Your Spacecraft Architecture Dossier">
              <p>
                Artefacts are not submitted once and forgotten. They are opened in the week they become relevant and maintained under configuration
                control until the final review.
              </p>
            </SectionHead>
            <div className={styles.dossierGrid}>
              {dossier.map((group) => (
                <div key={group.code} className={styles.dossierGroup}>
                  <h3 className={styles.dossierTitle}>
                    <FileText size={16} aria-hidden="true" />
                    {group.title}
                  </h3>
                  <ol className={styles.dossierList}>
                    {group.items.map((item, i) => {
                      const name = typeof item === "string" ? item : item.name;
                      return (
                        <li key={name}>
                          <span className={styles.docCode} aria-hidden="true">
                            {group.code}-{String(i + 1).padStart(2, "0")}
                          </span>
                          <span>
                            {group.code === "BUD" ? `${name} budget` : name}
                            {typeof item !== "string" && <span className={styles.docDetail}>{item.detail}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>

            <div className={styles.artifactRow}>
              <article className={styles.marginCard} aria-labelledby="margin-h">
                <p className={styles.panelLabel}>Governance artefact</p>
                <h3 id="margin-h" className={styles.h3}>
                  Engineering Margin Policy
                </h3>
                <p className={styles.artifactStatement}>{marginPolicy.statement}</p>
                <ul className={styles.marginList} aria-label="Margins tracked and defended">
                  {marginPolicy.tracked.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <p className={styles.reviewQuestion}>
                  <span>Review question</span>
                  {marginPolicy.reviewQuestion}
                </p>
              </article>

              <article className={styles.adrCard} aria-labelledby="adr-h">
                <div className={styles.adrHead}>
                  <p className={styles.panelLabel}>Architecture Decision Records</p>
                  <span className={styles.adrId}>{adrExample.id}</span>
                </div>
                <h3 id="adr-h" className={styles.h3}>
                  {adrExample.title}
                </h3>
                <p className={styles.adrIntro}>
                  Each major decision is logged with its options, criteria, rationale, assumptions, risks and the trigger that would reopen it.
                  Illustrative example:
                </p>
                <dl className={styles.adrFields}>
                  {adrExample.fields.map(([k, v]) => (
                    <div key={k} data-field={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
          </div>
        </section>

        {/* ── Curriculum ── */}
        <section id="curriculum" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="curriculum-h">
          <div className={styles.container}>
            <SectionHead id="curriculum-h" eyebrow="Full 12-week structure" title="The 12-Week Architecture">
              <p>
                Four phases take the reference mission from concept to a defended architecture. Each week pairs engineering lectures with an
                architecture studio and ends with artefacts that feed the dossier.
              </p>
            </SectionHead>
            <Curriculum />
          </div>
        </section>

        {/* ── Digital twin ── */}
        <section id="digital-twin" className={styles.section} aria-labelledby="twin-h">
          <div className={styles.container}>
            <SectionHead id="twin-h" eyebrow="Continuous track" title="Satellite Digital Twin">
              <p className={styles.leadStrong}>Model → Simulate → Analyse → Fault Inject → Operate</p>
              <p>
                The twin grows one increment at a time alongside the architecture, so each subsystem model is validated against the same mission
                baseline before it is coupled to the next.
              </p>
            </SectionHead>

            <div className={styles.twinLayout}>
              <ol className={styles.twinTrack} aria-label="Digital twin progression">
                {twinProgression.map((t) => (
                  <li key={t.name}>
                    <span className={styles.twinWeek}>Week {t.week}</span>
                    <span className={styles.twinName}>{t.name}</span>
                  </li>
                ))}
              </ol>

              <figure className={styles.twinLoop} aria-labelledby="twin-loop-caption">
                <ol className={styles.twinLoopNodes}>
                  {twinLoop.map((node, i) => (
                    <li key={node} className={node === "Satellite Digital Twin" ? styles.twinLoopCore : undefined}>
                      <span className={styles.twinLoopNode}>{node}</span>
                      {i < twinLoop.length - 1 && (
                        <span className={styles.twinLoopLink} aria-hidden="true">
                          <ArrowLeftRight size={18} />
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <figcaption id="twin-loop-caption" className={styles.figcaption}>
                  Physical flatsat, telemetry, digital twin and mission control exchange data in both directions: hardware behaviour calibrates
                  the twin, and the twin drives operations rehearsal and fault analysis.
                </figcaption>
              </figure>
            </div>
            <p className={styles.twinFidelity}>
              The Satellite Digital Twin developed in this program is an engineering model whose fidelity increases as simulation, test and
              telemetry evidence are added. It should not be interpreted as a validated flight digital twin unless validation criteria have been
              explicitly demonstrated.
            </p>
            <p className={styles.relatedNote}>
              Related on this platform:{" "}
              <Link href="/space/cubesat">CubeTwin — a CubeSat energy digital twin</Link> explores the orbit-power-battery coupling behind the Week 4
              Energy Twin.
            </p>
          </div>
        </section>

        {/* ── Flatsat ── */}
        <section id="flatsat" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="flatsat-h">
          <div className={styles.container}>
            <SectionHead id="flatsat-h" eyebrow="CubeSat engineering model / flatsat" title="From Architecture to a Working Engineering Model">
              <p>
                Subsystems are laid out on a bench, wired over real spacecraft interfaces and exercised with emulated power, sensors and payload —
                so integration problems appear on the table rather than in orbit.
              </p>
            </SectionHead>

            <div className={styles.flatsatBoard}>
              <ul className={styles.flatsatGroups}>
                {flatsat.map((g) => (
                  <li key={g.bus} className={styles.flatsatGroup}>
                    <h3 className={styles.flatsatBus}>{g.bus}</h3>
                    <ul>
                      {g.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className={styles.flatsatRail}>
                <span>Data bus</span> {flatsatBus}
              </p>
            </div>

            <p className={styles.notice}>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                <strong>Educational engineering model.</strong> The flatsat is a CubeSat-class educational engineering model for integration, test
                and operations practice. It is not flight-qualified hardware unless explicitly validated through a separate qualification campaign.
              </span>
            </p>
          </div>
        </section>

        {/* ── Review gates ── */}
        <section id="reviews" className={styles.section} aria-labelledby="reviews-h">
          <div className={styles.container}>
            <SectionHead id="reviews-h" eyebrow="Engineering review gates" title="Review culture, not only classroom assessment">
              <p>
                Participants present, defend and close actions at formal gates modelled on spacecraft program reviews, with entry criteria, a review
                panel and recorded action items.
              </p>
            </SectionHead>
            <ol className={styles.gateTimeline}>
              {reviewGates.map((g) => (
                <li key={g.code} data-gate={g.code}>
                  <span className={styles.gateDot} aria-hidden="true" />
                  <div className={styles.gateBody}>
                    <p className={styles.gateWhen}>{g.when}</p>
                    <h3 className={styles.gateCode}>
                      {g.code} <span className={styles.gateName}>{g.name}</span>
                    </h3>
                    <p className={styles.gatePurpose}>{g.purpose}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.fineNote}>
              Engineering-model verification occurs throughout the course, while formal review gates represent the progressive maturity of the
              mission architecture and test baseline. In this compressed format, CDR, TRR, ORR and MRR are held in sequence in the Week 12 studio.
            </p>
          </div>
        </section>

        {/* ── Outcomes ── */}
        <section id="outcomes" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="outcomes-h">
          <div className={styles.container}>
            <SectionHead id="outcomes-h" eyebrow="Program outcomes" title="What You Should Be Able to Do">
              <p>After successfully completing the program and capstone, participants should be able to:</p>
            </SectionHead>
            <ol className={styles.outcomeList}>
              {outcomes.map((o, i) => (
                <li key={o}>
                  <span className={styles.outcomeIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section id="portfolio" className={styles.section} aria-labelledby="portfolio-h">
          <div className={styles.container}>
            <SectionHead id="portfolio-h" eyebrow="Final deliverables" title="Graduate with an Engineering Portfolio — Not Just a Certificate">
              <p>Twenty reviewable artefacts, organised the way a spacecraft program would file them.</p>
            </SectionHead>
            <div className={styles.portfolioGrid}>
              {portfolio.map((cat) => (
                <div key={cat.category} className={styles.portfolioCard}>
                  <h3 className={styles.portfolioCategory}>{cat.category}</h3>
                  <ul>
                    {cat.items.map((d) => (
                      <li key={d.n}>
                        <span className={styles.portfolioIndex}>{String(d.n).padStart(2, "0")}</span>
                        {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Careers ── */}
        <section id="careers" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="careers-h">
          <div className={styles.container}>
            <SectionHead id="careers-h" eyebrow="Roles & progression" title="Career & Leadership Pathways">
              <p>
                The program develops capabilities applicable to spacecraft systems engineering, mission architecture and multidisciplinary
                engineering leadership. Eligibility for specific roles depends on prior education, domain experience and demonstrated engineering
                competence.
              </p>
            </SectionHead>
            <div className={styles.careerGrid}>
              {careers.map((c, i) => (
                <div key={c.title} className={`${styles.careerCard} ${c.wide ? styles.careerWide : ""}`}>
                  <p className={styles.careerIndex}>Category {i + 1}</p>
                  <h3 className={styles.h3}>{c.title}</h3>
                  {c.note && <p className={styles.careerNote}>{c.note}</p>}
                  <ul className={c.wide ? styles.roleChips : styles.roleList}>
                    {c.roles.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className={styles.fineNote}>
              Pathways are illustrative. The program does not guarantee placement, and course completion alone does not confer senior titles such
              as CTO, Chief Architect or Director.
            </p>
          </div>
        </section>

        {/* ── Certification ── */}
        <section id="certification" className={styles.section} aria-labelledby="cert-h">
          <div className={styles.container}>
            <div className={styles.certLayout}>
              <div>
                <p className={styles.eyebrow}>Credential</p>
                <h2 id="cert-h" className={styles.h2}>
                  Certification
                </h2>
                <div className={styles.lead}>
                  <p>
                    The credential recognises completion of the program assessments and a successfully defended capstone. It is awarded by
                    EV.ENGINEER™, the program provider; it is not an accredited academic qualification and does not claim university equivalence.
                  </p>
                </div>
              </div>
              <div className={styles.certCard}>
                <Award size={28} aria-hidden="true" className={styles.certIcon} />
                <p className={styles.panelLabel}>Primary credential</p>
                <p className={styles.certTitle}>{credential.primary}</p>
                <p className={styles.certTrack}>{credential.track}</p>
                <p className={styles.certProgram}>{credential.program}</p>
                <div className={styles.certDivider} aria-hidden="true" />
                <p className={styles.panelLabel}>Capstone recognition</p>
                <p className={styles.certCapstone}>
                  {credential.capstone} <span>· {credential.capstoneStatus}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why different ── */}
        <section id="why" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="why-h">
          <div className={`${styles.container} ${styles.whyLayout}`}>
            <div className={styles.whyIntro}>
              <p className={styles.eyebrow}>Why this program is different</p>
              <h2 id="why-h" className={styles.h2}>
                Seven engineering pillars
              </h2>
              <p className={styles.lead}>Quality is demonstrated through structure: one spacecraft, real review gates and failure as a design input.</p>
            </div>
            <ol className={styles.pillarList}>
              {pillars.map((p, i) => (
                <li key={p.title}>
                  <span className={styles.pillarIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={styles.pillarTitle}>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Learning model ── */}
        <section id="learning-model" className={styles.section} aria-labelledby="model-h">
          <div className={styles.container}>
            <SectionHead id="model-h" eyebrow="Engineering learning model" title="Calculate before you decide. Fail before you fly.">
              <p>Every topic moves through the same loop, from first-principles calculation to a decision defended in review.</p>
            </SectionHead>
            <ol className={styles.modelTrack} aria-label="Engineering learning model">
              {learningModel.map((step, i) => (
                <li key={step}>
                  <span className={styles.modelIndex}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className={styles.exampleCard}>
              <p className={styles.panelLabel}>Worked example</p>
              <h3 className={styles.h3}>Battery</h3>
              <ol className={styles.exampleFlow}>
                {batteryExample.map((step, i, arr) => (
                  <li key={step}>
                    {step}
                    {i < arr.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Tools & references ── */}
        <section id="tools" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="tools-h">
          <div className={styles.container}>
            <SectionHead id="tools-h" eyebrow="Tools & engineering stack" title="Engineering Tools & Open Technical Stack">
              <p>
                Tools used for mission analysis, simulation, modelling, flight-software learning, RF experimentation and systems engineering.
              </p>
            </SectionHead>
            <dl className={styles.toolGrid}>
              {tools.map((t) => (
                <div key={t.category} className={styles.toolRow}>
                  <dt>{t.category}</dt>
                  <dd>
                    <ul>
                      {t.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
            <p className={styles.fineNote}>
              Tool selection may vary by cohort, licensing and laboratory availability. Naming a tool does not imply a partnership with, or
              endorsement by, its developer — including NASA, JPL or commercial software vendors.
            </p>

            <div className={styles.referencesBlock}>
              <h3 className={styles.h3}>Industry and reference frameworks</h3>
              <ul className={styles.referenceList}>
                {references.map((r) => (
                  <li key={r.name}>
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noopener noreferrer">
                        {r.name}
                        <ExternalLink size={13} aria-hidden="true" />
                        <span className={styles.srOnly}> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className={styles.referenceName}>{r.name}</span>
                    )}
                    <span className={styles.referenceContext}>{r.context}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.fineNote}>
                Frameworks are referenced for educational context only and do not imply endorsement by, or affiliation with, NASA, ESA/ECSS, CCSDS,
                Cal Poly or IN-SPACe.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className={styles.section} aria-labelledby="cta-h">
          <div className={styles.container}>
            <div className={styles.ctaPanel}>
              <h2 id="cta-h" className={styles.ctaTitle}>
                Architect the Mission. Defend the Decisions.
              </h2>
              <p>
                Move beyond subsystem familiarity and develop the systems-level engineering judgement required to connect mission objectives,
                spacecraft architecture, verification, operations, risk and technology strategy.
              </p>
              <div className={styles.ctaActions}>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Express Interest (opens Google Form in a new tab)"
                  className={styles.primaryButton}
                >
                  Express Interest <ArrowRight size={16} aria-hidden="true" />
                </a>
                <Link href="/space#research" className={spaceTheme.secondaryButton}>
                  Explore Space R&amp;D
                </Link>
              </div>
              <p className={styles.ctaNote}>Cohort dates, format, fees and selection criteria will be published for each cohort.</p>
            </div>
          </div>
        </section>

        {/* ── Prepared by ── */}
        <section className={`${styles.section} ${styles.preparedBy}`} aria-label="Prepared by">
          <div className={styles.container}>
            <ResearcherCard />
            <p className={styles.providerNote}>
              Satellite Engineering is an EV.ENGINEER™ professional program within the EV Society™ Space initiative. Commercial arrangements,
              where applicable, are handled by iTelematics Software Private Limited.
            </p>
            <p className={styles.reviewed}>
              Program information last reviewed: <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>.
            </p>
          </div>
        </section>
      </main>

      <SpaceFooter basePath="/space" />
    </div>
  );
}
