import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BatteryCharging,
  BookOpen,
  ChevronRight,
  Cpu,
  ExternalLink,
  FlaskConical,
  Globe2,
  Layers3,
  Orbit,
  Play,
  Radio,
  Satellite,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { ASSUMPTIONS } from "@/lib/cubetwin/engine";
import { SCIENCE, FAQ, REFERENCES } from "@/lib/cubetwin/content";
import { structuredData, LAST_REVIEWED } from "./seo";
import SimulationProvider from "./components/SimulationProvider";
import HeroScene from "./components/HeroScene";
import Simulator from "./components/Simulator";
import FaultLab from "./components/FaultLab";
import {
  Glossary,
  PrintButton,
  Roadmap,
  Workbook,
} from "./components/LearningTools";
import styles from "./cubetwin.module.css";
export { metadata } from "./seo";
function SectionHeading({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {badge && <span className={styles.pill}>{badge}</span>}
    </div>
  );
}
export default function CubeTwinPage() {
  return (
    <div className={styles.portal}>
      <JsonLd data={structuredData} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="CubeTwin navigation">
          <Link
            href="/space/cubesat"
            className={styles.logo}
            aria-label="CubeTwin home"
          >
            <span className={styles.logoIcon}>
              <Orbit size={24} />
            </span>
            <span>
              CubeTwin<small>A SPACE LEARNING LAB</small>
            </span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#simulator">Simulator</a>
            <a href="#science">Learn</a>
            <a href="#roadmap">12-week guide</a>
            <a href="#fault-lab">Fault lab</a>
            <a href="#workbook">
              Workbook <ArrowDownToLine size={12} />
            </a>
          </div>
          <div className={styles.navEnd}>
            AN INITIATIVE OF <b>EV SOCIETY™</b>
          </div>
        </nav>
      </header>
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
              Educational R&D prototype · Simulated data · Not flight software.
              <br />
              Content version 1.0 · Last reviewed 12 September 2026
              <br />
              https://aerospace.ev.engineer/space/cubesat
            </small>
          </div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/aerospace">Aerospace</Link>
            <ChevronRight size={10} />
            <Link href="/space">Space</Link>
            <ChevronRight size={10} />
            <span aria-current="page">CubeTwin</span>
          </nav>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                EV Society™ initiative · CubeSat energy digital twin
              </div>
              <h1 id="hero-title">
                See how a CubeSat
                <br />
                survives <em>every orbit.</em>
              </h1>
              <p>
                A small satellite. A finite battery. An extraordinary mission.
                Explore how sunlight, eclipse and the choices you make shape a
                spacecraft’s energy and reliability.
              </p>
              <div className={styles.actions}>
                <a href="#simulator" className={styles.primaryButton}>
                  <Play size={14} /> Start the Simulation{" "}
                  <ArrowRight size={15} />
                </a>
                <a href="#roadmap" className={styles.button}>
                  <BookOpen size={14} /> Follow the 12-Week Guide
                </a>
              </div>
              <div className={styles.statusLine}>
                <ShieldCheck size={12} /> Educational R&D prototype{" "}
                <span>·</span> Simulated data <span>·</span> Not flight software
              </div>
              <div className={styles.heroMeta}>
                <span>
                  <Globe2 size={13} /> Runs in your browser
                </span>
                <span>
                  <Layers3 size={13} /> Beginner friendly
                </span>
                <span>
                  <Radio size={13} /> No hardware needed
                </span>
              </div>
              <PrintButton className={styles.textButton} />
            </div>
            <HeroScene />
          </section>
          <div className={styles.quickBar}>
            {[
              {
                icon: Satellite,
                title: "One reference mission",
                text: "An editable 3U CubeSat in LEO",
              },
              {
                icon: ActivityIcon,
                title: "Transparent physics",
                text: "Understand every watt-hour",
              },
              {
                icon: FlaskConical,
                title: "Learn through experiments",
                text: "Inject faults. Compare outcomes.",
              },
              {
                icon: BookOpen,
                title: "12 weeks of discovery",
                text: "From first principles to a prototype",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={21} />
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
          <section
            className={styles.definition}
            aria-labelledby="definition-title"
          >
            <div>
              <div className={styles.eyebrow}>MEET YOUR DIGITAL LABORATORY</div>
              <h2 id="definition-title">What is CubeTwin?</h2>
            </div>
            <p>
              CubeTwin is an educational web simulator that helps students model
              the electrical-energy behaviour of a CubeSat. It calculates how
              orbit sunlight, eclipse, solar generation, subsystem loads and
              battery characteristics affect State of Charge, voltage,
              temperature, mission activities and safe-mode decisions. The
              project is an EV Society™ initiative hosted on EV.ENGINEER™, with
              commercial engineering handled separately by iTelematics Software
              Private Limited.
            </p>
          </section>
          <div
            className={styles.journey}
            aria-label="Energy journey: Sun to solar array to PMAD to loads and battery to mission outcome"
          >
            <div>
              <span>
                <Sun size={17} />
              </span>
              <b>
                Sunlight<small>The energy source</small>
              </b>
            </div>
            <ArrowRight />
            <div>
              <span>
                <Layers3 size={17} />
              </span>
              <b>
                Solar array<small>Generate electricity</small>
              </b>
            </div>
            <ArrowRight />
            <div>
              <span>
                <Zap size={17} />
              </span>
              <b>
                PMAD<small>Convert & distribute</small>
              </b>
            </div>
            <ArrowRight />
            <div>
              <span>
                <BatteryCharging size={17} />
              </span>
              <b>
                Loads + battery<small>Use, store & recover</small>
              </b>
            </div>
            <ArrowRight />
            <div>
              <span>
                <Satellite size={17} />
              </span>
              <b>
                Mission outcome<small>Keep the mission going</small>
              </b>
            </div>
          </div>
          <section id="simulator" className={styles.section}>
            <SectionHeading
              eyebrow="01 / THE INTERACTIVE LAB"
              title="Your mission starts here."
              description="Begin with the reference mission. Change a parameter, run the model and follow the energy."
              badge="DETERMINISTIC · BROWSER-BASED"
            />
            <Simulator />
          </section>
          <section id="science" className={styles.section}>
            <SectionHeading
              eyebrow="02 / LEARN THE SCIENCE"
              title="Understand what’s behind the numbers."
              description="Build intuition first. Then connect each observation to a simple, inspectable equation."
              badge="8 SHORT LESSONS"
            />
            <div className={styles.scienceGrid}>
              {SCIENCE.map((item) => (
                <article key={item.tag} className={styles.scienceCard}>
                  <div className={styles.cardTag}>{item.tag}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <code>{item.formula}</code>
                  <div className={styles.exercise}>
                    <b>TRY IT YOURSELF</b>
                    {item.exercise}
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.formNote}>
              EPS background:{" "}
              <a href="https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/">
                NASA Small Spacecraft Power Systems
              </a>
              . Unit and interface guidance:{" "}
              <a href="https://www.cubesat.org/cubesatinfo">
                Cal Poly CubeSat Design Specification
              </a>
              . Model values are illustrative assumptions.
            </p>
          </section>
          <section id="roadmap" className={styles.section}>
            <SectionHeading
              eyebrow="03 / YOUR THREE-MONTH FLIGHT PLAN"
              title="From curious beginner to confident builder."
              description="Twelve guided weeks of learning, calculation, development and evidence. Every checkbox is a small step forward."
              badge="14 SEP — 6 DEC 2026"
            />
            <Roadmap />
          </section>
          <section id="fault-lab" className={styles.section}>
            <SectionHeading
              eyebrow="04 / THE FAULT LABORATORY"
              title="What happens when things don’t go to plan?"
              description="A good model teaches you about the unexpected. Introduce a fault and compare it against the same mission without faults."
              badge="11 REPRODUCIBLE FAULT TYPES"
            />
            <FaultLab />
          </section>
          <section id="workbook" className={styles.section}>
            <SectionHeading
              eyebrow="05 / YOUR PRINTABLE WORKBOOK"
              title="Turn observations into engineering evidence."
              description="The portal and workbook share the same content. Print the lessons, checklist and experiments, or save them as a PDF."
            />
            <Workbook />
          </section>
          <section id="glossary" className={styles.section}>
            <Glossary />
          </section>
          <section id="validation" className={styles.section}>
            <SectionHeading
              eyebrow="07 / KNOW YOUR MODEL"
              title="Transparent by design. Bounded by evidence."
              description="Verification checks the implementation against the equations. Validation requires evidence that a model represents its intended physical system."
            />
            <div className={styles.validation}>
              <div>
                <h3>How to verify your result</h3>
                <ul>
                  <li>
                    Compare the circular-orbit period with a hand calculation.
                  </li>
                  <li>
                    Check constant-load and constant-generation battery cases.
                  </li>
                  <li>
                    Close the energy balance: initial stored + generated −
                    served load − rejected energy − battery losses −
                    capacity-fault removal − final stored ≈ 0.
                  </li>
                  <li>
                    Inspect state transitions, fault timestamps and all activity
                    outcomes.
                  </li>
                  <li>
                    Export the scenario and reproduce the run with the same
                    seed.
                  </li>
                  <li>
                    Compare multiple time steps before interpreting a threshold
                    event; sampled reserve and brownout durations have time-step
                    resolution.
                  </li>
                </ul>
                <div className={styles.callout}>
                  <b>Simulation is the beginning of the evidence.</b>
                  <p>
                    No physical test article or measured mission data calibrates
                    this prototype. These results do not demonstrate flight
                    readiness, qualification, battery safety or real mission
                    reliability.
                  </p>
                </div>
              </div>
              <div>
                <h3>Assumptions & limitations</h3>
                <ul>
                  {ASSUMPTIONS.slice(1).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <section id="faq" className={styles.section}>
            <SectionHeading
              eyebrow="08 / COMMON QUESTIONS"
              title="A little clarity before your next orbit."
              description="Start with what you know. The laboratory is here to help with the rest."
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
          <section id="ecosystem" className={styles.section}>
            <SectionHeading
              eyebrow="09 / ECOSYSTEM & RESPONSIBILITIES"
              title="A shared interest in better engineering."
              description="Education, commercial engineering and the broader monitoring ecosystem have distinct roles."
            />
            <div className={styles.ecosystemGrid}>
              <article className={styles.ecosystemCard}>
                <span>EDUCATION & RESEARCH</span>
                <h3>EV Society™</h3>
                <p>
                  CubeTwin is an EV Society™ education and research initiative
                  hosted on EV.ENGINEER™.
                </p>
                <a
                  href="https://www.evsociety.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore EV Society <ExternalLink size={12} />
                </a>
              </article>
              <article className={styles.ecosystemCard}>
                <span>COMMERCIAL ENGINEERING</span>
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
                  Explore iTelematics <ExternalLink size={12} />
                </a>
              </article>
              <article className={styles.ecosystemCard}>
                <span>HUMS ECOSYSTEM REFERENCE</span>
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
                  Explore UFlight <ExternalLink size={12} />
                </a>
              </article>
            </div>
            <p className={styles.formNote}>
              These references do not imply a partnership, endorsement,
              certification or government affiliation.
            </p>
          </section>
          <section id="references" className={styles.section}>
            <SectionHeading
              eyebrow="10 / KEEP EXPLORING"
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
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
            <p className={styles.formNote}>
              Content last reviewed:{" "}
              <time dateTime={LAST_REVIEWED}>12 September 2026</time> · Model
              and scenario schema v1.0. Applicable launch-provider requirements
              supersede preliminary interface guidance.
            </p>
          </section>
          <footer className={styles.footer}>
            <Link href="/space" className={styles.logo}>
              <Orbit size={24} /> CubeTwin{" "}
              <small>
                BACK TO SPACE <ArrowRight size={11} />
              </small>
            </Link>
            <div className={styles.footerText}>
              An EV Society™ initiative hosted on EV.ENGINEER™.
              <br />
              Educational R&D prototype · Simulated data · Not flight software.
              <br />© 2026 EV Society™ · Build understanding, one orbit at a
              time.
            </div>
          </footer>
        </main>
      </SimulationProvider>
    </div>
  );
}
const ActivityIcon = Cpu;
