import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Layers3,
  Play,
  Satellite,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import ResearcherCard from "@/components/ResearcherCard";
import { ASSUMPTIONS } from "@/lib/cubetwin/engine";
import { SCIENCE, FAQ, REFERENCES } from "@/lib/cubetwin/content";
import { structuredData, LAST_REVIEWED } from "./seo";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import spaceTheme from "../spaceTheme.module.css";
import SimulationProvider from "./components/SimulationProvider";
import HeroScene from "./components/HeroScene";
import LazySimulator from "./components/LazySimulator";
import {
  Glossary,
  Roadmap,
  Workbook,
} from "./components/LearningTools";
import FaultLab from "./components/FaultLab";
import styles from "./cubetwin.module.css";
export { metadata } from "./seo";
function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
export default function CubeTwinPage() {
  return (
    <div
      className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${styles.portal}`}
    >
      <JsonLd data={structuredData} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <SpaceHeader basePath="/space" />
      <SimulationProvider>
        <main id="main-content" className={styles.container}>
          <div className={styles.printCover}>
            <p>EV Society™ · EV.ENGINEER™</p>
            <h2>CubeTwin</h2>
            <strong>The 12-week mission workbook</strong>
            <p>CubeSat energy, mission and reliability analysis</p>
            <p>14 September – 6 December 2026</p>
            <p>Mission / team: __________________________</p>
            <small>
              Initial Draft · v0.01 · Scenario schema 1.0
              <br />
              Educational R&D prototype · Simulated data · Not flight software.
              <br />
              Last reviewed 12 September 2026
              <br />
              https://aerospace.ev.engineer/space/cubesat
            </small>
          </div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/space">Space</Link>
            <ChevronRight size={12} />
            <Link href="/space#simulations">
              Simulations &amp; R&amp;D Projects
            </Link>
            <ChevronRight size={12} />
            <span aria-current="page">CubeTwin</span>
          </nav>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                Educational Prototype · 12-Week Student R&amp;D Project
              </div>
              <h1 id="hero-title">CubeTwin</h1>
              <p className={styles.heroDescription}>
                A Digital-Twin Simulation Platform for CubeSat Energy, Mission
                and Reliability Analysis
              </p>
              <p>
                Learn how solar generation, spacecraft loads, orbital sunlight
                and eclipse periods affect CubeSat battery energy, mission
                availability and reliability.
              </p>
              <div className={styles.actions}>
                <a href="#simulator" className={styles.primaryButton}>
                  <Play size={16} /> Launch Energy Simulation
                </a>
                <a href="#roadmap" className={styles.button}>
                  <BookOpen size={16} /> View 12-Week Project Plan
                </a>
              </div>
              <div className={styles.heroStatus}>
                <span className={styles.pill}>Initial Draft · v0.01</span>
                <span className={styles.statusLine}>
                  <ShieldCheck size={16} /> Educational R&amp;D prototype ·
                  Simulated data · Not flight software.
                </span>
              </div>
            </div>
            <HeroScene />
          </section>
          <nav className={styles.pageNav} aria-label="On this page">
            <span>On this page</span>
            {[
              ["#overview", "Overview"],
              ["#simulator", "Simulation"],
              ["#science", "How it works"],
              ["#mission-scenario", "Reference mission"],
              ["#roadmap", "12-week plan"],
              ["#fault-lab", "Reliability"],
              ["#workbook", "Workbook"],
              ["#glossary", "Glossary"],
              ["#references", "Resources"],
            ].map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <section
            id="overview"
            className={`${styles.section} ${styles.definition}`}
          >
            <div>
              <div className={styles.eyebrow}>PROJECT OVERVIEW</div>
              <h2>A spacecraft energy lab, in your browser.</h2>
            </div>
            <div>
              <p>
                CubeTwin is an educational web simulator that helps students
                model the electrical-energy behaviour of a CubeSat. It
                calculates how orbit sunlight, eclipse, solar generation,
                subsystem loads and battery characteristics affect State of
                Charge, voltage, temperature, mission activities and safe-mode
                decisions. The project is an EV Society™ initiative hosted on
                EV.ENGINEER™, with commercial engineering handled separately by
                iTelematics Software Private Limited.
              </p>
              <p className={styles.overviewNote}>
                A <a href="#glossary">digital twin</a> represents a specific
                physical system using traceable data. CubeTwin starts as a
                simulation platform; it is not connected to a spacecraft or
                calibrated against a physical test article.
              </p>
            </div>
          </section>
          <section id="simulator" className={styles.section}>
            <SectionHeading
              eyebrow="INTERACTIVE ENERGY SIMULATION"
              title="Configure a mission. Follow the energy."
              description="Start with the example inputs, run the model and inspect the recorded timeline. Change one parameter at a time to understand its effect."
            />
            <p className={styles.simulatorDisclaimer}>
              <ShieldCheck size={17} /> Educational R&amp;D prototype ·
              Simulated data · Not flight software.
            </p>
            <LazySimulator />
          </section>
          <section id="science" className={styles.section}>
            <SectionHeading
              eyebrow="HOW IT WORKS"
              title="How a CubeSat energy system works"
              description="The Electrical Power System (EPS) generates, stores and distributes the electricity that supports the mission. Follow its energy journey, then explore the equations."
            />
            <div
              className={styles.journey}
              aria-label="Energy journey: Sun to solar array to power management to loads and battery to mission outcome"
            >
              {[
                { icon: Sun, title: "Sunlight", text: "The energy source" },
                {
                  icon: Layers3,
                  title: "Solar array",
                  text: "Converts light to electricity",
                },
                {
                  icon: Zap,
                  title: "Power management",
                  text: "Conditions & distributes power",
                },
                {
                  icon: BatteryCharging,
                  title: "Loads + battery",
                  text: "Use energy or store it",
                },
                {
                  icon: Satellite,
                  title: "Mission outcome",
                  text: "Complete planned activities",
                },
              ].map(({ icon: Icon, title, text }, i) => (
                <div key={title}>
                  <span>
                    <Icon size={21} />
                  </span>
                  <b>
                    {title}
                    <small>{text}</small>
                  </b>
                  {i < 4 && (
                    <ArrowRight size={15} className={styles.journeyArrow} />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.scienceGrid}>
              {SCIENCE.map((item) => (
                <article key={item.tag} className={styles.scienceCard}>
                  <div className={styles.cardTag}>{item.tag}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text.split(". ")[0]}.</p>
                  <details className={styles.scienceDetails}>
                    <summary>Explanation, equation &amp; example</summary>
                    <p>{item.text.substring(item.text.indexOf(". ") + 2)}</p>
                    <code>{item.formula}</code>
                    <div className={styles.exercise}>
                      <b>TRY IT YOURSELF</b>
                      {item.exercise}
                    </div>
                  </details>
                </article>
              ))}
            </div>
            <p className={styles.formNote}>
              Power-system background:{" "}
              <a href="https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/">
                NASA Small Spacecraft Power Systems
              </a>
              . Unit and interface guidance:{" "}
              <a href="https://www.cubesat.org/cubesatinfo">
                Cal Poly CubeSat Design Specification
              </a>
              .
            </p>
          </section>
          <section id="mission-scenario" className={styles.section}>
            <SectionHeading
              eyebrow="EDUCATIONAL MISSION SCENARIO"
              title="Meet your reference CubeSat."
              description="Every value below is an illustrative simulator default, not a component recommendation or flight limit. The same values are editable in the simulation."
            />
            <div className={styles.scenarioGrid}>
              <article className={styles.scienceCard}>
                <div className={styles.cardTag}>SPACECRAFT & ORBIT</div>
                <h3>A 3U spacecraft in Low Earth Orbit</h3>
                <p>
                  A CubeSat uses standard units (U); a 3U model combines three
                  units. Low Earth Orbit (LEO) is an orbit relatively close to
                  Earth.
                </p>
                <dl className={styles.scenarioValues}>
                  <div>
                    <dt>Altitude above Earth</dt>
                    <dd>500 km</dd>
                  </div>
                  <div>
                    <dt>Orbital period: one circuit</dt>
                    <dd>≈ 94.5 min</dd>
                  </div>
                  <div>
                    <dt>Sunlight / eclipse per orbit</dt>
                    <dd>≈ 59.5 / 35 min</dd>
                  </div>
                  <div>
                    <dt>Inclination: orbit-plane tilt</dt>
                    <dd>51.6°</dd>
                  </div>
                </dl>
              </article>
              <article className={styles.scienceCard}>
                <div className={styles.cardTag}>POWER & BATTERY</div>
                <h3>A finite energy reserve</h3>
                <p>
                  A watt (W) measures power; a watt-hour (Wh) measures energy. A
                  40 Wh energy capacity can ideally supply 8 W for 5 h before
                  losses.
                </p>
                <dl className={styles.scenarioValues}>
                  <div>
                    <dt>Peak solar / delivered power</dt>
                    <dd>20 / 18 W</dd>
                  </div>
                  <div>
                    <dt>Battery energy capacity</dt>
                    <dd>40 Wh</dd>
                  </div>
                  <div>
                    <dt>Initial State of Charge (SOC)</dt>
                    <dd>80%</dd>
                  </div>
                  <div>
                    <dt>Reserve / safe-mode entry</dt>
                    <dd>30% / 20%</dd>
                  </div>
                </dl>
              </article>
              <article className={styles.scienceCard}>
                <div className={styles.cardTag}>MISSION PROFILE</div>
                <h3>Give the spacecraft a purpose</h3>
                <p>
                  A mission profile schedules activities. The payload is the
                  mission instrument; downlink sends its data to a ground
                  station, an Earth-based radio facility.
                </p>
                <dl className={styles.scenarioValues}>
                  <div>
                    <dt>Nominal / essential-only load</dt>
                    <dd>8 / 3 W</dd>
                  </div>
                  <div>
                    <dt>Payload activity: starts at 4 h</dt>
                    <dd>18 W · 10 min</dd>
                  </div>
                  <div>
                    <dt>Downlink activity: starts at 5 h</dt>
                    <dd>14 W · 8 min</dd>
                  </div>
                  <div>
                    <dt>Simulation duration / step</dt>
                    <dd>24 h / 10 s</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>
          <section id="roadmap" className={styles.section}>
            <SectionHeading
              eyebrow="12-WEEK STUDENT R&D ROADMAP"
              title="From first principles to an engineering prototype."
              description="14 September – 6 December 2026. Expand each week to learn, calculate, build, verify and document. Progress is saved in this browser."
            />
            <Roadmap />
          </section>
          <section id="fault-lab" className={styles.section}>
            <SectionHeading
              eyebrow="MISSION & RELIABILITY ANALYSIS"
              title="Test the mission when conditions change."
              description="Reliability means performing the required functions under stated conditions. Compare a fault experiment with the same mission without faults, then explore input uncertainty."
            />
            <FaultLab />
            <details id="validation" className={styles.details}>
              <summary>
                Verification, model assumptions &amp; limitations
              </summary>
              <div className={styles.validation}>
                <div>
                  <h3>Check the evidence</h3>
                  <p>
                    Verification checks that code implements its equations
                    correctly. Validation checks whether those equations
                    represent the intended physical system.
                  </p>
                  <ul>
                    <li>
                      Compare orbital period and constant-power battery cases
                      with hand calculations.
                    </li>
                    <li>
                      Close the energy balance: initial stored + generated −
                      served load − rejected energy − losses − capacity-fault
                      removal − final stored ≈ 0.
                    </li>
                    <li>
                      Inspect event timestamps, activity outcomes and changes at
                      different time steps.
                    </li>
                    <li>
                      Reproduce the exported scenario with the same random seed.
                    </li>
                  </ul>
                  <div className={styles.callout}>
                    <b>Simulation results are not flight evidence.</b>
                    <p>
                      No physical test article or measured mission data
                      calibrates this prototype. It cannot demonstrate flight
                      readiness, qualification or battery safety.
                    </p>
                  </div>
                </div>
                <div>
                  <h3>Model assumptions</h3>
                  <ul>
                    {ASSUMPTIONS.slice(1).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </section>
          <section id="workbook" className={styles.section}>
            <SectionHeading
              eyebrow="WORKBOOK & SCENARIO TEMPLATES"
              title="Record your prediction. Explain the result."
              description="Print the same lessons and project checklist, save a scenario or keep local experiment notes. Use the browser print dialog to save a PDF."
            />
            <Workbook />
          </section>
          <section id="glossary" className={styles.section}>
            <Glossary />
          </section>
          <section id="faq" className={styles.section}>
            <SectionHeading
              eyebrow="BEGINNER QUESTIONS"
              title="Answers before your next experiment."
              description="Key definitions and model boundaries, explained plainly."
            />
            <div className={styles.faqGrid}>
              {FAQ.map((f) => (
                <details className={styles.faqItem} key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
          <section id="references" className={styles.section}>
            <SectionHeading
              eyebrow="REFERENCES & LEARNING RESOURCES"
              title="Go straight to the source."
              description="Authoritative starting points for your reading and future model comparisons. Record the document revision used in your report."
            />
            <div className={styles.references}>
              {REFERENCES.map((ref, i) => (
                <a
                  className={styles.reference}
                  key={ref.href}
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>0{i + 1}</span>
                  <div>
                    <b>{ref.name}</b>
                    <small>{ref.detail}</small>
                  </div>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
            <p className={styles.formNote}>
              Content last reviewed:{" "}
              <time dateTime={LAST_REVIEWED}>12 September 2026</time> · Initial
              Draft v0.01 · Scenario schema 1.0. Applicable launch-provider
              requirements supersede preliminary interface guidance.
            </p>
          </section>
          <section id="ecosystem" className={styles.section}>
            <SectionHeading
              eyebrow="PROJECT OWNERSHIP & RESPONSIBILITIES"
              title="Clear roles. An educational purpose."
              description="CubeTwin is an EV Society™ education and research initiative hosted on EV.ENGINEER™."
            />
            <div className={styles.ecosystemGrid}>
              <article className={styles.ecosystemCard}>
                <span>EDUCATION & RESEARCH</span>
                <h3>EV Society™</h3>
                <p>The education and research initiative behind CubeTwin.</p>
                <a
                  href="https://www.evsociety.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EV Society <ExternalLink size={14} />
                </a>
                <br />
                <Link href="/">
                  EV.ENGINEER <ChevronRight size={14} />
                </Link>
              </article>
              <article className={styles.ecosystemCard}>
                <span>COMMERCIAL ENQUIRIES</span>
                <h3>iTelematics</h3>
                <p>
                  Commercial engineering products, implementation services and
                  customer engagements, where applicable, are handled separately
                  by iTelematics Software Private Limited under explicit
                  agreements.
                </p>
                <a
                  href="https://itelematics.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iTelematics <ExternalLink size={14} />
                </a>
              </article>
              <article className={styles.ecosystemCard}>
                <span>RELATED ECOSYSTEM</span>
                <h3>UFlight™</h3>
                <p>
                  UFlight™ is referenced within the broader ecosystem for Health
                  and Usage Monitoring Systems related to aerospace and
                  autonomous platforms.
                </p>
                <a
                  href="https://www.uflight.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UFlight <ExternalLink size={14} />
                </a>
              </article>
            </div>
            <p className={styles.simulatorDisclaimer}>
              <ShieldCheck size={17} /> Educational R&amp;D prototype ·
              Simulated data · Not flight software.
            </p>
            <p className={styles.formNote}>
              These references do not imply a partnership, endorsement,
              certification, ISRO affiliation or government approval.
            </p>
          </section>
          <div className={styles.section} style={{ borderBottom: "none", paddingTop: 0 }}>
            <ResearcherCard />
          </div>
        </main>
      </SimulationProvider>
      <SpaceFooter basePath="/space" />
    </div>
  );
}
