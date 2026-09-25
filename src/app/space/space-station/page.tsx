import Link from "next/link";
import { ChevronRight, Play, Telescope, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import spaceTheme from "../spaceTheme.module.css";
import styles from "./station.module.css";
import { structuredData } from "./seo";
import { IMEX } from "./data/india";
import { BRAND_LINKS, ORGANISATION_LINE } from "./data/organisations";
import { LAST_REVIEWED, LAST_REVIEWED_LABEL } from "./data/sources";
import { ModeProvider, ModeSelector } from "./components/ModeProvider";
import { MobileSectionNav } from "./components/mobile";
import { SectionHead, SourceList, Notice, Badge, PartDivider } from "./components/ui";
import SpaceStationHero from "./components/SpaceStationHero";
import SpacecraftHierarchy from "./components/SpacecraftHierarchy";
import PurposeExplorer from "./components/PurposeExplorer";
import BASExplorer from "./components/BASExplorer";
import GlobalStationExplorer from "./components/GlobalStationExplorer";
import HistoryTimeline from "./components/HistoryTimeline";
import EngineeringSystems from "./components/EngineeringSystems";
import ResearchLab from "./components/ResearchLab";
import ResearchFrontier from "./components/ResearchFrontier";
import ResearchLibrary from "./components/ResearchLibrary";
import SpaceStationFAQ from "./components/SpaceStationFAQ";
import SimulationLab from "./components/SimulationLab";
import { CyberThreatModel, Economy, EarthToMoon, ResearchProfile, Organisations } from "./components/StaticSections";
import {
  LazyExperimentDesigner,
  LazyStationAnatomy,
  LazyPowerSimulator,
  LazyOrbitSimulator,
  LazyDockingSimulator,
  LazyECLSSSimulator,
  LazyThermalSimulator,
  LazyCrewDaySimulator,
  LazyStationDigitalTwin,
  LazyFailureSimulator,
  LazyStationDesigner,
  LazyResearchQuestionGenerator,
} from "./components/Lazy";
export { metadata, viewport } from "./seo";

const NAV: [string, string][] = [
  ["#part-knowledge", "I · Knowledge"],
  ["#part-systems", "II · Systems"],
  ["#part-lab", "III · Laboratory"],
  ["#part-research", "IV · Research"],
  ["#bas", "BAS"],
  ["#anatomy", "Anatomy"],
  ["#digital-twin", "Digital Twin"],
  ["#simulators", "Simulators"],
  ["#frontier", "Research Frontier"],
  ["#library", "Library"],
  ["#faq", "Ask"],
];

const PART_LINKS: Record<"knowledge" | "systems" | "lab" | "research", [string, string][]> = {
  knowledge: [["#what-is", "What is a station?"], ["#why", "Why build one?"], ["#bas", "BAS"], ["#india-microgravity", "Indian microgravity research"], ["#world", "World stations"], ["#history", "History"], ["#moon", "Earth orbit to the Moon"], ["#economy", "Economy"]],
  systems: [["#anatomy", "Anatomy"], ["#systems", "Engineering systems"], ["#digital-twin", "Digital twin"], ["#emergencies", "Emergencies"], ["#cybersecurity", "Cybersecurity"]],
  lab: [["#power", "Power"], ["#orbit", "Orbit"], ["#docking", "Docking"], ["#life-support", "Life support"], ["#thermal", "Thermal"], ["#crew-day", "Crew day"], ["#design", "Design a Station"]],
  research: [["#lab", "Microgravity Lab"], ["#frontier", "Research Frontier"], ["#questions", "Question generator"], ["#library", "Library"]],
};

export default function SpaceStationPage() {
  return (
    <div className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${styles.portal}`}>
      <JsonLd data={structuredData} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <SpaceHeader basePath="/space" brandLinks={BRAND_LINKS} />
      <ModeProvider>
        <main id="main-content" className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/space">Space</Link>
                <ChevronRight size={12} aria-hidden="true" />
              </li>
              <li>
                <Link href="/space#simulations">Simulations &amp; R&amp;D Projects</Link>
                <ChevronRight size={12} aria-hidden="true" />
              </li>
              <li aria-current="page">Space Station</li>
            </ol>
          </nav>

          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                Interactive Research Platform<span className={styles.desktopOnly}> · Space Systems</span>
              </div>
              <h1 id="hero-title">SPACE STATION</h1>
              <p className={styles.heroSub}>Research &amp; Engineering Simulator</p>
              <div className={styles.desktopOnly}>
                <p>
                  Explore how humans live, work and conduct science in orbit. Study space-station architecture, microgravity research, life support, power,
                  thermal control, docking, robotics and mission operations—from today&apos;s orbital laboratories to India&apos;s Bharatiya Antariksh Station
                  and future lunar stations.
                </p>
                <div className={styles.actions}>
                  <a href="#simulators" className={styles.primaryButton}>
                    <Play size={16} aria-hidden="true" /> Enter Simulator
                  </a>
                  <a href="#frontier" className={styles.button}>
                    <Telescope size={16} aria-hidden="true" /> Research Explorer
                  </a>
                </div>
              </div>
              <div className={styles.mobileOnly}>
                <p className={styles.heroMobileLede}>
                  Explore how humans live, work and conduct science in orbit—from India&apos;s Bharatiya Antariksh Station to today&apos;s orbital
                  laboratories and future lunar stations.
                </p>
                <div className={styles.heroMobileActions}>
                  <a href="#what-is" className={styles.primaryButton}>
                    Explore Station
                  </a>
                  <a href="#part-research" className={styles.button}>
                    Research
                  </a>
                </div>
              </div>
              <p className={styles.statusLine}>
                <ShieldCheck size={16} aria-hidden="true" />
                Learn → Explore → Simulate → Research. Generic simulations are educational models — not mission design data. Programme facts are
                sourced and dated.
              </p>
            </div>
            <SpaceStationHero />
          </section>

          <ModeSelector />
          <nav className={`${styles.pageNav} ${styles.desktopOnly}`} aria-label="On this page">
            {NAV.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <PartDivider id="part-knowledge" number="I" title="Knowledge" description="What stations are, why they are built, and who is building them — sourced and dated." links={PART_LINKS.knowledge} />
          <section id="what-is" className={styles.section} data-kind="knowledge" aria-labelledby="what-is-h">
            <SectionHead eyebrow="Core question" title="What is a Space Station?" id="what-is-h">
              <p>
                Rockets, satellites, CubeSats, crew vehicles and stations are often confused. The key idea: <strong style={{ color: "var(--space-text)" }}>a space station is itself a spacecraft.</strong>{" "}
                What distinguishes it is purpose — long-duration habitation, research and operations in space.
              </p>
            </SectionHead>
            <SpacecraftHierarchy />
          </section>
          <section id="why" className={styles.section} data-kind="knowledge" aria-labelledby="why-h">
            <SectionHead eyebrow="Purpose" title="Why build a space station?" id="why-h">
              <p>Six research domains and sixteen research areas — what orbit offers each, why it is hard on Earth, and where the open problems are.</p>
            </SectionHead>
            <PurposeExplorer />
          </section>
          <section id="bas" className={styles.section} data-kind="knowledge" aria-labelledby="bas-h">
            <SectionHead eyebrow="India · ISRO" title="India's Bharatiya Antariksh Station" id="bas-h">
              <p>
                India&apos;s indigenous space station programme: a five-module station in low Earth orbit, with its first module (BAS-01) targeted by 2028 and
                full operation by 2035.
              </p>
            </SectionHead>
            <BASExplorer />
          </section>
          <section id="india-microgravity" className={styles.section} data-kind="knowledge" aria-labelledby="imex-h">
            <SectionHead eyebrow="India · Research opportunity" title="Indian Microgravity Research" id="imex-h">
              <p>{IMEX.summary}</p>
            </SectionHead>
            <div className={styles.ruleGrid} style={{ marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17 }}>Disciplines invited</h3>
                <ul>{IMEX.disciplines.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <h3 style={{ fontSize: 17 }}>Who can apply</h3>
                <ul>{IMEX.eligibility.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <h3 style={{ fontSize: 17 }}>Pathway to flight</h3>
                <ol>{IMEX.pathway.map((d) => <li key={d}>{d}</li>)}</ol>
              </div>
            </div>
            <Notice>
              <strong>Educational design assistance, not flight qualification.</strong> The designer below helps you think like an experimenter. Real
              selection, safety review and qualification are carried out by the platform provider.
            </Notice>
            <LazyExperimentDesigner />
            <SourceList ids={IMEX.sources} />
          </section>
          <section id="world" className={styles.section} data-kind="knowledge" aria-labelledby="world-h">
            <SectionHead eyebrow="Global" title="World space stations" id="world-h">
              <p>
                Status labels are strict: <Badge label="Operational" /> <Badge label="Under construction" /> <Badge label="Development" /> <Badge label="Planned" />{" "}
                <Badge label="Retired" />. Plans are never presented as facts.
              </p>
            </SectionHead>
            <GlobalStationExplorer />
            <SourceList ids={["nasa-iss-facts", "nasa-usdv", "cmse", "nasa-leo-2026", "nasa-gateway", "nasa-cld", "nasa-axiom-order", "starlab-cdr", "orbital-reef", "vast-haven1"]} />
          </section>
          <section id="history" className={styles.section} data-kind="knowledge" aria-labelledby="history-h">
            <SectionHead eyebrow="History" title="What each generation of stations taught us" id="history-h">
              <p>Not just dates — the engineering lesson each generation left for the next.</p>
            </SectionHead>
            <HistoryTimeline />
          </section>
          <section id="moon" className={styles.section} data-kind="knowledge" aria-labelledby="moon-h">
            <SectionHead eyebrow="Beyond LEO" title="From Earth orbit to the Moon" id="moon-h">
              <p>How the engineering changes as stations move from low Earth orbit to lunar orbit and the lunar surface.</p>
            </SectionHead>
            <EarthToMoon />
          </section>
          <section id="economy" className={styles.section} data-kind="knowledge" aria-labelledby="econ-h">
            <SectionHead eyebrow="Economics" title="The space station economy" id="econ-h">
              <p>Why stations may become economic infrastructure — separating what has been demonstrated from what is only proposed.</p>
            </SectionHead>
            <Economy />
          </section>
          <PartDivider id="part-systems" number="II" title="Systems" description="How a station works as a system of systems, and how failures propagate." links={PART_LINKS.systems} />
          <section id="anatomy" className={styles.section} data-kind="systems" aria-labelledby="anatomy-h">
            <SectionHead eyebrow="Anatomy" title="Inside a generic modular station" id="anatomy-h">
              <p>Select any component to see its purpose, how it works, challenges, sensors, failure modes, redundancy and open research questions.</p>
            </SectionHead>
            <LazyStationAnatomy />
          </section>
          <section id="systems" className={styles.section} data-kind="systems" aria-labelledby="systems-h">
            <SectionHead eyebrow="System of systems" title="Engineering systems" id="systems-h">
              <p>Eleven coupled systems. Engineering and Research modes reveal deeper detail.</p>
            </SectionHead>
            <EngineeringSystems />
            <SourceList ids={["nasa-iss", "nasa-water-recovery", "nasa-hidh", "nasa-odpo", "ntrs"]} />
          </section>
          <section id="digital-twin" className={styles.section} data-kind="systems" aria-labelledby="twin-h">
            <SectionHead eyebrow="Core simulator" title="Space-station digital twin" id="twin-h">
              <p>
                Inject failures and follow the cascade through orbit, GNC, power, thermal, life support, crew, payloads, communications and ground — for
                example: solar degradation → reduced generation → battery deficit → load shedding → experiment interruption → thermal consequences →
                mission response.
              </p>
            </SectionHead>
            <LazyStationDigitalTwin />
          </section>
          <section id="emergencies" className={styles.section} data-kind="systems" aria-labelledby="emerg-h">
            <SectionHead eyebrow="Risk management" title="Failure & emergency simulator" id="emerg-h">
              <p>How stations detect, isolate and recover from emergencies — taught as systems engineering, without operational procedures.</p>
            </SectionHead>
            <LazyFailureSimulator />
          </section>
          <section id="cybersecurity" className={styles.section} data-kind="systems" aria-labelledby="cyber-h">
            <SectionHead eyebrow="Defensive security" title="Cybersecurity of an Orbital Research Station" id="cyber-h">
              <p>A defensive view of how a multi-user station protects commanding, networks, software and data. No offensive techniques are described.</p>
            </SectionHead>
            <CyberThreatModel />
          </section>
          <PartDivider id="part-lab" number="III" title="Laboratory" description="Engineering simulators for orbit, power, docking, life support, thermal control and station design." links={PART_LINKS.lab} />
          <section id="simulators" className={styles.section} data-kind="lab" aria-labelledby="sims-h">
            <SectionHead eyebrow="Simulation Lab" title="Learn by operating the systems" id="sims-h">
              <p>
                Each simulator has a Simple and an Engineering view, and shows its assumptions, equations, limitations and sources. All run in your browser
                with SI units internally.
              </p>
            </SectionHead>
            <div className={styles.mobileOnly}>
              <SimulationLab />
            </div>
            <div className={styles.stack} style={{ gap: 28 }}>
              <div id="power"><div className={styles.desktopOnly}><LazyPowerSimulator /></div></div>
              <div id="orbit">
                <div className={styles.desktopOnly}><LazyOrbitSimulator /></div>
                <details className={styles.details} style={{ marginTop: 12 }}>
                  <summary>Explained: LEO, drag, reboost, inclination, ground track and debris</summary>
                  <div>
                    <dl className={styles.kv}>
                      <div><dt>Low Earth orbit</dt><dd>Roughly 160–2,000 km altitude. Close enough for easy access and communication; still inside a thin atmosphere.</dd></div>
                      <div><dt>Atmospheric drag</dt><dd>Residual air slows the station, lowering its orbit. Drag rises steeply at lower altitude and during high solar activity.</dd></div>
                      <div><dt>Reboost</dt><dd>Periodic thruster burns restore altitude — the propellant cost is the Δv per year shown in the simulator.</dd></div>
                      <div><dt>Inclination</dt><dd>The tilt of the orbit relative to the equator. It sets which latitudes are overflown and which launch sites can reach the station efficiently.</dd></div>
                      <div><dt>Ground track</dt><dd>The path traced below the station. Earth rotates underneath, so each pass shifts westward.</dd></div>
                      <div><dt>Orbital debris</dt><dd>Tracked objects are avoided by manoeuvre; small particles are stopped by shielding.</dd></div>
                    </dl>
                  </div>
                </details>
              </div>
              <div id="docking">
                <div className={styles.desktopOnly}><LazyDockingSimulator /></div>
                <details className={styles.details} style={{ marginTop: 12 }}>
                  <summary>Why docking is difficult — and why it matters for BAS, the Moon and orbital assembly</summary>
                  <div>
                    <p>
                      Two vehicles travelling at about 7.7 km/s must meet at a few centimetres per second, with centimetre alignment, while orbital mechanics
                      makes &quot;speeding up&quot; raise the orbit rather than close the gap. Sensors must work in glare and darkness, and every step needs a safe
                      abort.
                    </p>
                    <p>
                      Rendezvous and docking is listed by the Government of India as a major technology goal for BAS; every module, crew vehicle and cargo vehicle
                      depends on it. Lunar missions need the same capability far from ground support, and orbital assembly of large structures is built on it.
                    </p>
                  </div>
                </details>
              </div>
              <div id="life-support"><div className={styles.desktopOnly}><LazyECLSSSimulator /></div></div>
              <div id="thermal"><div className={styles.desktopOnly}><LazyThermalSimulator /></div></div>
              <div id="crew-day"><div className={styles.desktopOnly}><LazyCrewDaySimulator /></div></div>
            </div>
          </section>
          <section id="design" className={styles.section} data-kind="lab" aria-labelledby="design-h">
            <SectionHead eyebrow="Design" title="Design a Station" id="design-h">
              <p>Choose a mission and constraints; the model sketches an architecture and flags risks and technology gaps.</p>
            </SectionHead>
            <LazyStationDesigner />
          </section>
          <PartDivider id="part-research" number="IV" title="Research" description="Microgravity science, open research frontiers and authoritative literature for postgraduate and industry researchers." links={PART_LINKS.research} />
          <section id="lab" className={styles.section} data-kind="research" aria-labelledby="lab-h">
            <SectionHead eyebrow="Microgravity Lab" title="Microgravity research domains" id="lab-h">
              <p>
                For each domain: the research question, why microgravity matters, variables, measurements, controls, instrumentation, safety, applications and
                where to start reading.
              </p>
            </SectionHead>
            <ResearchLab />
          </section>
          <section id="frontier" className={styles.section} data-kind="research" aria-labelledby="frontier-h">
            <SectionHead eyebrow="For PhD, postdoctoral, PI and industry R&D" title="Research Frontier" id="frontier-h">
              <p>
                Twenty-two open research themes with problems, gaps, hypotheses, methods, validation and candidate research questions. Literature links are
                verified agency pages or search entry points — no citations are invented.
              </p>
            </SectionHead>
            <ResearchFrontier />
          </section>
          <section id="questions" className={styles.section} data-kind="research" aria-labelledby="rq-h">
            <SectionHead eyebrow="Research" title="Generate a Research Question" id="rq-h">
              <p>From undergraduate projects to industry R&amp;D: pick a discipline, subsystem, environment, TRL and level.</p>
            </SectionHead>
            <LazyResearchQuestionGenerator />
          </section>
          <section id="library" className={styles.section} data-kind="research" aria-labelledby="lib-h">
            <SectionHead eyebrow="Sources & further research" title="Global research library" id="lib-h">
              <p>
                Curated, authoritative starting points — agencies first, then programme operators, then academic search tools. Every link was checked on{" "}
                <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>.
              </p>
            </SectionHead>
            <ResearchLibrary />
          </section>
          <section id="faq" className={styles.section} aria-labelledby="faq-h">
            <SectionHead eyebrow="Q&A" title="Ask Space Station" id="faq-h">
              <p>Search the curated questions, or browse by topic. Answers that depend on programme facts link to their sources.</p>
            </SectionHead>
            <SpaceStationFAQ />
          </section>
          <section id="direction" className={styles.section} aria-labelledby="direction-h" style={{ borderBottom: "none" }}>
            <SectionHead eyebrow="About this project" title="Research & Project Direction" id="direction-h" />
            <ResearchProfile />
            <Organisations />
            <p className={styles.reviewed} style={{ marginTop: 20 }}>
              Last reviewed: <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>. Generic simulations are educational models — not mission design data.
              References to agencies and programmes do not imply partnership or endorsement.
            </p>
          </section>
        </main>
        <MobileSectionNav />
      </ModeProvider>
      <SpaceFooter basePath="/space" brandLinks={BRAND_LINKS} organisationLine={ORGANISATION_LINE} />
    </div>
  );
}
