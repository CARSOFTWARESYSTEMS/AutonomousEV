"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Rocket, ShieldAlert, BookOpen, CheckCircle2, ChevronDown, ChevronUp,
  ExternalLink, Printer, ArrowRight, ListChecks,
} from "lucide-react";
import styles from "./page.module.css";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { WEBSITE_ID, websiteNode } from "@/lib/structured-data/entities";
import { SEO_TITLE, SEO_DESCRIPTION, SEO_CANONICAL, LAST_REVIEWED } from "./seo";
import {
  days, tutorialModules, workbookCards, glossary, quiz, learningOutcomes,
  missionSequence, flightPhases, separationRecoverySequence, telemetryPath,
  evidenceLoop, safetyPrinciples, type CalloutType,
} from "./rocketryData";
import {
  StepFlow, RocketAnatomyDiagram, FourForcesDiagram, CgCpDiagram,
  LaunchRailDiagram, AvionicsBlockDiagram,
} from "./diagrams";

const OFFICIAL_WORKSHOP_URL =
  "https://www.inspace.gov.in/inspace?id=workshop_on_essentials_of_model_rocketry";
const BROCHURE_PDF = "/workbook/inspace-model-rocketry-workshop-brochure.pdf";
const WORKBOOK_PDF = "/workbook/model-rocketry-7-day-learning-workbook-2026.pdf";
const COMPETITION_URL = "https://labs.ev.engineer/Internships/Rocketry/astroforge.html";

const navItems = [
  { label: "Learning Outcomes", href: "#outcomes" },
  { label: "Mission Flow", href: "#mission-flow" },
  { label: "Anatomy", href: "#anatomy" },
  { label: "Seven-Day Path", href: "#learning-path" },
  { label: "Tutorial Modules", href: "#modules" },
  { label: "Workbook", href: "#workbook" },
  { label: "Safety", href: "#safety" },
  { label: "Glossary", href: "#glossary" },
  { label: "Source", href: "#source" },
];

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://autonomous.ev.engineer/" },
        { "@type": "ListItem", position: 2, name: "Space", item: "https://autonomous.ev.engineer/space" },
        { "@type": "ListItem", position: 3, name: "Model Rocketry Learning Guide", item: SEO_CANONICAL },
      ],
    },
    {
      // Both types are accurate: this is a rendered web page (WebPage) whose
      // primary content is an educational resource (LearningResource).
      "@type": ["WebPage", "LearningResource"],
      "@id": `${SEO_CANONICAL}#webpage`,
      name: SEO_TITLE,
      headline: "Model Rocketry: Seven-Day Learning Guide",
      description: SEO_DESCRIPTION,
      url: SEO_CANONICAL,
      inLanguage: "en",
      learningResourceType: "Study guide",
      educationalLevel: "Beginner",
      datePublished: "2026-08-17",
      dateModified: "2026-08-17",
      isPartOf: { "@id": WEBSITE_ID },
      // Deliberately NOT typed as `Course` here: this page is an independent
      // educational companion, not the official workshop, and using `Course`
      // for the official programme would risk implying EV.ENGINEER is its
      // provider. `isBasedOn` links to the official external source instead,
      // and `about` names the model-rocketry subject matter this page
      // actually teaches (not the external workshop itself).
      isBasedOn: OFFICIAL_WORKSHOP_URL,
      about: [
        { "@type": "Thing", name: "Model rocketry" },
        { "@type": "Thing", name: "Rocket aerodynamics and stability" },
        { "@type": "Thing", name: "Solid rocket motor propulsion" },
        { "@type": "Thing", name: "Rocket recovery systems" },
        { "@type": "Thing", name: "Rocket avionics and telemetry" },
      ],
      citation: [OFFICIAL_WORKSHOP_URL, BROCHURE_PDF, WORKBOOK_PDF],
    },
  ],
};

function Callout({ type, children }: { type: CalloutType; children: React.ReactNode }) {
  const meta: Record<CalloutType, { label: string; cls: string }> = {
    beginner: { label: "Beginner note", cls: styles.calloutBeginner },
    why: { label: "Why it matters", cls: styles.calloutWhy },
    remember: { label: "Remember", cls: styles.calloutRemember },
    safety: { label: "Safety gate", cls: styles.calloutSafety },
    verify: { label: "Verify from official rules", cls: styles.calloutVerify },
  };
  const m = meta[type];
  return (
    <div className={`${styles.callout} ${m.cls}`}>
      <span className={styles.calloutLabel}>{m.label}</span>
      <span className={styles.calloutBody}>{children}</span>
    </div>
  );
}

function QuizAccordion() {
  return (
    <div className={styles.quizList}>
      {quiz.map((item, i) => (
        <details key={item.q} className={styles.quizItem}>
          <summary className={styles.quizSummary}>
            {i + 1}. {item.q}
          </summary>
          <p className={styles.quizAnswer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function DayTabs() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className={styles.dayTabList} role="tablist" aria-label="Seven-day workshop schedule">
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            role="tab"
            id={`day-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`day-panel-${i}`}
            className={`${styles.dayTabButton} ${i === active ? styles.dayTabButtonActive : ""}`}
            onClick={() => setActive(i)}
            data-track-event="rocketry_day_tab_click"
          >
            {d.dayLabel}
          </button>
        ))}
      </div>

      {days.map((day, i) => (
        <div
          key={day.date}
          className={styles.dayPanel}
          id={`day-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`day-tab-${i}`}
          hidden={i !== active}
        >
          <div className={styles.dayPanelHeader}>
            <span className={styles.dayPanelDate}>{day.date}</span>
          </div>
          <h3 className={styles.dayPanelTitle}>{day.title}</h3>
          <p className={styles.dayPanelGoal}>{day.goal}</p>

          <div className={styles.dayCodes}>
            {day.codes.map((c) => (
              <span key={c} className={styles.dayCodeChip}>{c}</span>
            ))}
          </div>

          <div className={styles.dayColumns}>
            <div>
              <div className={styles.dayColumnTitle}>Brochure sessions covered</div>
              <ul className={styles.dayList}>
                {day.topics.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div>
              <div className={styles.dayColumnTitle}>What you should understand by end of day</div>
              <ul className={styles.dayList}>
                {day.understand.map((u) => <li key={u}>{u}</li>)}
              </ul>
            </div>
          </div>

          <Callout type="beginner">
            <strong>Workbook activity: </strong>{day.activity}
          </Callout>

          {i === 5 && (
            <div style={{ marginTop: "1.5rem" }}>
              <div className={styles.dayColumnTitle}>Day 5 self-check quiz</div>
              <QuizAccordion />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const moduleDiagram: Record<string, React.ReactNode> = {
  l1: <FourForcesDiagram />,
  l2: <CgCpDiagram />,
  l3: <AvionicsBlockDiagram />,
  l6: <StepFlow steps={separationRecoverySequence} ariaLabel="Separation and recovery event sequence" />,
  l8: <LaunchRailDiagram />,
  l16: <StepFlow steps={telemetryPath} ariaLabel="Telemetry path from onboard sensors to the ground station" />,
  "day6-flight": <StepFlow steps={evidenceLoop} ariaLabel="Post-flight engineering evidence loop" />,
};

function ModuleAccordion() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className={styles.accordionControls}>
        <button
          type="button"
          className={styles.accordionControlBtn}
          onClick={() => setOpenIds(new Set(tutorialModules.map((m) => m.id)))}
        >
          Expand all
        </button>
        <button
          type="button"
          className={styles.accordionControlBtn}
          onClick={() => setOpenIds(new Set())}
        >
          Collapse all
        </button>
      </div>

      <div className={styles.accordionList}>
        {tutorialModules.map((m) => {
          const open = openIds.has(m.id);
          const panelId = `module-panel-${m.id}`;
          return (
            <div key={m.id} className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionButton}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(m.id)}
                data-track-event="rocketry_module_toggle"
                data-track-title={m.title}
              >
                <span className={styles.accordionButtonLeft}>
                  <span className={styles.accordionCode}>{m.code}</span>
                  <span className={styles.accordionTitle}>{m.title}</span>
                </span>
                {open ? <ChevronUp size={18} color="var(--accent-primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </button>
              <div id={panelId} className={styles.accordionPanel} hidden={!open}>
                <p className={styles.accordionParagraph}>{m.whatIsIt}</p>
                <Callout type="why">{m.whyMatters}</Callout>

                <div className={styles.accordionSubhead}>Key ideas</div>
                <ul className={styles.accordionKeyIdeas}>
                  {m.keyIdeas.map((k) => <li key={k}>{k}</li>)}
                </ul>

                {moduleDiagram[m.id]}

                {m.example && <Callout type="beginner">{m.example}</Callout>}
                {m.safety && <Callout type="safety">{m.safety}</Callout>}
                {m.verify && <Callout type="verify">{m.verify}</Callout>}
                <Callout type="remember">{m.remember}</Callout>
                <Callout type="beginner">
                  <strong>Check yourself: </strong>{m.check}
                </Callout>

                <p className={styles.workshopConnection}>Workshop connection: {m.workshopConnection}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function RocketryContent() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <JsonLd data={jsonLdGraph} />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      <nav className={styles.pageNav} aria-label="Page section navigation">
        <div className={`container ${styles.pageNavInner}`}>
          <Link href="/" className={styles.pageNavBrand}>
            EV.ENGINEER<span className={styles.pageNavBrandTm}>™</span>
          </Link>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={styles.pageNavLink}>{item.label}</a>
          ))}
        </div>
      </nav>

      <main id="main-content">
        {/* ═══ A. HERO ═══ */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroPill}><Rocket size={14} /> Model Rocketry Learning Guide</div>
            <h1 className={styles.heroTitle}>
              A Beginner&apos;s Seven-Day Guide to Model Rocketry
            </h1>
            <p className={styles.heroDesc}>
              An independent, educational companion built for Team 2026-INSPACe-ROCKETRY-059 and anyone learning the
              fundamentals of model rocketry — aerodynamics, structures, propulsion, avionics, recovery, telemetry,
              simulation, safety and launch readiness — organised around the published Workshop on Essentials of
              Model Rocketry for the IN-SPACe Model Rocketry / CAN-7USAT India Student Competition 2026–27.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaChip}>24–30 August 2026</span>
              <span className={styles.heroMetaChip}>GNEC IIT Roorkee, Greater Noida, UP</span>
              <span className={styles.heroMetaChip}>18 lectures · 9 practicals</span>
            </div>
            <div className={styles.heroCtas}>
              <a href="#learning-path" className="btn btn-primary" data-track-event="rocketry_hero_path_click">
                Explore the Seven-Day Path
              </a>
              <a href="#modules" className="btn btn-secondary" data-track-event="rocketry_hero_modules_click">
                Browse Tutorial Modules
              </a>
              <a
                href={COMPETITION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-track-event="rocketry_hero_competition_click"
              >
                Student Competition 2026 <ExternalLink size={14} style={{ marginLeft: 6 }} />
              </a>
            </div>

            <p className={styles.independentNote}>
              <strong>Independent educational companion.</strong>{" "}
              This page is prepared by EV Society / EV.ENGINEER from the publicly described workshop brochure and is
              not an official IN-SPACe, ISRO or Department of Space publication. It implies no endorsement,
              certification or partnership, and it never overrides the official rulebook, range instructions or
              manufacturer datasheets — see{" "}
              <a href="#source">Source and disclaimer</a>.
            </p>
          </div>
        </section>

        {/* ═══ B. LEARNING OUTCOMES ═══ */}
        <section className={styles.pageSectionAlt} id="outcomes">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>What You Will Learn</span>
              <h2 className={styles.sectionTitle}>By the end of this guide, you should be able to</h2>
            </div>
            <div className={styles.outcomeGrid}>
              {learningOutcomes.map((o) => (
                <div key={o} className={styles.outcomeCard}>
                  <CheckCircle2 size={18} className={styles.outcomeIcon} />
                  <span className={styles.outcomeText}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ C. HOW A MODEL ROCKET MISSION WORKS ═══ */}
        <section className={styles.pageSection} id="mission-flow">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>The Big Picture</span>
              <h2 className={styles.sectionTitle}>How a model rocket mission works</h2>
              <p className={styles.sectionSubtitle}>
                Every rocket project follows the same overall mission sequence, and every flight passes through the
                same physical phases — long before any of the detailed engineering topics below come into play.
              </p>
            </div>

            <div className={styles.dayColumnTitle} style={{ textAlign: "center" }}>Mission sequence</div>
            <StepFlow steps={missionSequence} ariaLabel="Mission sequence from definition to post-flight analysis" />

            <div className={styles.dayColumnTitle} style={{ textAlign: "center", marginTop: "2rem" }}>Flight phases</div>
            <StepFlow steps={flightPhases} ariaLabel="Flight phases from safe setup to safing after landing" />
          </div>
        </section>

        {/* ═══ D. ROCKET ANATOMY ═══ */}
        <section className={styles.pageSectionAlt} id="anatomy">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Rocket Anatomy</span>
              <h2 className={styles.sectionTitle}>The parts of a model rocket</h2>
              <p className={styles.sectionSubtitle}>
                Every lecture in this guide refers back to these same parts — learn the names once, and the rest of
                the workshop becomes much easier to follow.
              </p>
            </div>
            <RocketAnatomyDiagram />
          </div>
        </section>

        {/* ═══ E. SEVEN-DAY LEARNING PATH ═══ */}
        <section className={styles.pageSection} id="learning-path">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section E</span>
              <h2 className={styles.sectionTitle}>Seven-day learning path</h2>
              <p className={styles.sectionSubtitle}>
                One syllabus, seven calendar days. Each tab covers the brochure sessions for that day, what you
                should understand by the end of it, and a small workbook activity you can try yourself.
              </p>
            </div>
            <DayTabs />
          </div>
        </section>

        {/* ═══ F. BEGINNER TUTORIAL MODULES ═══ */}
        <section className={styles.pageSectionAlt} id="modules">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section F</span>
              <h2 className={styles.sectionTitle}>Beginner tutorial modules</h2>
              <p className={styles.sectionSubtitle}>
                Every lecture and practical from the brochure, explained from first principles. Expand any topic —
                each one covers what it is, why it matters, key ideas, a memorable takeaway, and a question to check
                your own understanding.
              </p>
            </div>
            <ModuleAccordion />
          </div>
        </section>

        {/* ═══ G. ENGINEERING WORKBOOK ═══ */}
        <section className={styles.pageSection} id="workbook">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section G</span>
              <h2 className={styles.sectionTitle}>Engineering workbook</h2>
              <p className={styles.sectionSubtitle}>
                Fifteen reusable, print-friendly worksheet templates. Fill in the blanks as your own design matures —
                every field name is shown, but no example values are filled in for you.
              </p>
            </div>
            <div className={styles.workbookGrid}>
              {workbookCards.map((card) => (
                <div key={card.title} className={styles.workbookCard}>
                  <div className={styles.workbookCardTitle}>{card.title}</div>
                  <ul className={styles.workbookFieldList}>
                    {card.fields.map((f) => <li key={f} className={styles.workbookField}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                className={styles.printButton}
                onClick={() => window.print()}
                data-track-event="rocketry_print_workbook_click"
              >
                <Printer size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                Print or save this page as a PDF
              </button>
            </div>
          </div>
        </section>

        {/* ═══ H. SAFETY AND QUALITY GATE ═══ */}
        <section className={styles.pageSectionAlt} id="safety">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section H</span>
              <h2 className={styles.sectionTitle}>Safety and quality gate</h2>
              <p className={styles.sectionSubtitle}>
                These principles apply across every module on this page. No team member may treat this page as
                authority to ignite or launch — the appointed range authority controls the operation.
              </p>
            </div>
            <div className={styles.safetyGateWrap}>
              <p className={styles.safetyGateIntro}>
                <ShieldAlert size={20} color="var(--error)" style={{ verticalAlign: "-4px", marginRight: 8 }} />
                Use certified commercial motors and authorised facilities only. This page does not provide
                propellant formulations, motor-manufacturing instructions, pyrotechnic recipes, or permission to
                perform energetic tests.
              </p>
              <div className={styles.safetyGateList}>
                {safetyPrinciples.map((p) => (
                  <div key={p.title} className={styles.safetyGateItem}>
                    <div className={styles.safetyGateItemTitle}>
                      <ShieldAlert size={15} color="var(--error)" /> {p.title}
                    </div>
                    <div className={styles.safetyGateItemBody}>{p.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ I. GLOSSARY ═══ */}
        <section className={styles.pageSection} id="glossary">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section I</span>
              <h2 className={styles.sectionTitle}>Glossary</h2>
              <p className={styles.sectionSubtitle}>Quick reference for every technical term used on this page.</p>
            </div>
            <div className={styles.glossaryGrid}>
              {glossary.map((g) => (
                <div key={g.term} className={styles.glossaryItem}>
                  <div className={styles.glossaryTerm}>{g.term}</div>
                  <div className={styles.glossaryDef}>{g.def}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ J. SOURCE AND DISCLAIMER ═══ */}
        <section className={styles.pageSectionAlt} id="source">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>Section J</span>
              <h2 className={styles.sectionTitle}>Source and disclaimer</h2>
            </div>
            <div className={styles.sourceBox}>
              <p>
                This page is an independent educational aid prepared from the publicly described{" "}
                <strong>Workshop on Essentials of Model Rocketry</strong>{" "}
                for the IN-SPACe Model Rocketry / CAN-7USAT India Student Competition 2026–27, and from this
                site&apos;s own seven-day learning workbook. Names
                of organisations and programme identifiers are used only to describe context — no endorsement,
                certification, partnership or official status is implied. Where this page and an official source
                (the competition rulebook, range instructions, or a manufacturer datasheet) differ, the official
                source always governs.
              </p>
              <div className={styles.sourceLinks}>
                <a href={OFFICIAL_WORKSHOP_URL} target="_blank" rel="noopener noreferrer" className={styles.sourceLink} data-track-event="rocketry_source_official_click">
                  <ListChecks size={14} /> IN-SPACe Workshop Listing <ExternalLink size={13} />
                </a>
                <a href={BROCHURE_PDF} className={styles.sourceLink} data-track-event="rocketry_source_brochure_click">
                  <BookOpen size={14} /> Workshop Brochure (PDF)
                </a>
                <a href={WORKBOOK_PDF} className={styles.sourceLink} data-track-event="rocketry_source_workbook_click">
                  <BookOpen size={14} /> 7-Day Learning Workbook (PDF)
                </a>
              </div>
              <p className={styles.freshnessLine}>
                Prepared by the EV Society / EV.ENGINEER technical team. Last reviewed: {LAST_REVIEWED}.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ K. FINAL CTA ═══ */}
        <section className={styles.finalSection}>
          <div className={styles.finalGlow} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <h2 className={styles.finalTitle}>Ready to Start Learning?</h2>
            <p className={styles.finalDesc}>
              Work through the seven-day path, expand every tutorial module, and fill in the engineering workbook as
              your own rocket design matures.
            </p>
            <div className={styles.finalCtas}>
              <a href="#learning-path" className="btn btn-primary" data-track-event="rocketry_final_path_click">
                Start with Day 0 <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: "-2px" }} />
              </a>
              <Link href="/space" className="btn btn-secondary" data-track-event="rocketry_final_space_click">
                Back to Space
              </Link>
              <Link href="/internships" className="btn btn-secondary" data-track-event="rocketry_final_internships_click">
                Back to Internships
              </Link>
            </div>
          </div>
        </section>

        {/* ─── AUTHOR & ARCHITECT BLOCK ─── */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4rem", paddingBottom: "2rem" }}>
          <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "2rem", borderLeft: "4px solid var(--accent-primary)", textAlign: "left" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", letterSpacing: "1px" }}>
                Created by
              </p>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "4px", color: "#fff", fontWeight: 700 }}>
                Sudarshana Karkala
              </h2>
              <p style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Model Rocketry Learning Guide — EV Society / EV.ENGINEER
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>
                Co-Founder, Principal Architect | Thasmai Infotech Private Limited
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "16px" }}>
                Sudarshana Karkala leads the EV Society / EV.ENGINEER engineering-education initiative, which spans
                EV battery systems, autonomous vehicles, and aerospace and space engineering. This beginner-friendly
                model rocketry guide extends that mission to the Space Initiative — an independent educational
                companion, not an official IN-SPACe or ISRO publication.
              </p>
              <div style={{
                display: "inline-block",
                fontSize: "0.85rem",
                padding: "8px 14px",
                marginBottom: "16px",
                borderRadius: "6px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))",
                borderLeft: "3px solid var(--accent-primary)",
                color: "#fff",
              }}>
                Available for strategic architectural consulting and advanced automotive R&D partnerships.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", flexWrap: "wrap" }}>
                <a
                  href="tel:+919845561518"
                  style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  data-track-event="sudarshana_profile_click"
                  data-track-section-id="rocketry-author-block"
                >
                  <span>📞</span> +91 9845561518
                </a>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                <a
                  href="https://www.linkedin.com/in/sudarshanakarkala/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                  data-track-event="linkedin_profile_click"
                  data-track-section-id="rocketry-author-block"
                >
                  <span>🔗</span> LinkedIn — Sudarshana Karkala
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
