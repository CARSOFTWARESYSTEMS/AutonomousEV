"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { AssumptionsDrawer } from "./components/AssumptionsDrawer";
import { BatterySection } from "./components/BatterySection";
import { BusinessSection } from "./components/BusinessSection";
import { ChargingSection } from "./components/ChargingSection";
import { CompetitorSection } from "./components/CompetitorSection";
import { EngineeringControls, Presets, RequirementInputs } from "./components/Configurator";
import { CostSection } from "./components/CostSection";
import { FaqSection, ReferencesSection, VersionFooter } from "./components/FaqSection";
import { MobileResultBar, RecommendationPanel } from "./components/RecommendationPanel";
import { ResearchersSection } from "./components/ResearchersSection";
import { RoadmapSection } from "./components/RoadmapSection";
import { PowertrainSection } from "./components/PowertrainSection";
import { SoftwareSection } from "./components/SoftwareSection";
import { TcoSection } from "./components/TcoSection";
import { useEvSimulator } from "./components/useSimulator";
import { VehicleSection } from "./components/VehicleSection";

const SECTION_NAV = [
  { id: "configure", label: "Configure" },
  { id: "vehicle", label: "Vehicle" },
  { id: "battery", label: "Battery" },
  { id: "powertrain", label: "Powertrain" },
  { id: "charging", label: "Charging" },
  { id: "software", label: "Software" },
  { id: "cost", label: "Cost" },
  { id: "tco", label: "TCO" },
  { id: "competitors", label: "Competitors" },
  { id: "business", label: "Business" },
  { id: "roadmap", label: "Roadmap" },
];

export default function EvAutoRikshaContent() {
  const sim = useEvSimulator();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileResultOpen, setMobileResultOpen] = useState(false);

  const copyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?${sim.shareQuery}`;
    navigator.clipboard?.writeText(url).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ═══════ HERO ═══════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroPillRow}>
              <span className={styles.heroPill}>EV.ENGINEER™ · Electric Mobility R&D</span>
            </div>
            <h1 className={styles.heroTitle}>EV Auto Rickshaw</h1>
            <p className={styles.heroSubtitle}>Design the Next Generation D+6 Intelligent Electric Three-Wheeler</p>
            <p className={styles.heroDesc}>
              A ground-up research and engineering program exploring an affordable, safe, connected and
              energy-efficient electric passenger vehicle for Tier-2 and Tier-3 cities across South India.
            </p>

            <div className={styles.heroPillRow}>
              {["D+6 Passenger", "LFP Battery", "Smart BMS", "Connected EV", "Design-to-Cost"].map((tag) => (
                <span className={styles.heroPill} key={tag}>{tag}</span>
              ))}
            </div>

            <div className={styles.heroCtas}>
              <a href="#configure" className="btn btn-primary">Configure Your EV</a>
              <a href="#vehicle" className="btn btn-secondary">Explore Engineering</a>
            </div>

            <div className={styles.targetStrip}>
              <span className={styles.targetChip}>D+6</span>
              <span className={styles.targetChip}>10–11.5 kWh Base Target</span>
              <span className={styles.targetChip}>120–140 km Practical Range Target</span>
              <span className={styles.targetChip}>50 km/h</span>
              <span className={styles.targetChip}>₹4.0–4.5 L Target Price</span>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <p className={styles.disclaimerText}>
              <strong>Concept Engineering Targets · Subject to Simulation, Prototype Validation, Supplier RFQ &amp; Homologation.</strong>{" "}
              This page is a research and product-planning simulator, not a production specification.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ STICKY SECTION NAV ═══════ */}
      <nav className={styles.sectionNav} aria-label="EV Auto Rickshaw page sections">
        <div className={`container ${styles.sectionNavInner}`}>
          {SECTION_NAV.map((s) => (
            <a className={styles.sectionNavLink} href={`#${s.id}`} key={s.id}>{s.label}</a>
          ))}
        </div>
      </nav>

      {/* ═══════ CONFIGURE ═══════ */}
      <section className={styles.pageSection} id="configure">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Build Your Electric Auto</h2>
            <p className={styles.sectionSubtitle}>
              Configure the duty cycle first. The simulator recommends the vehicle around the business requirement.
            </p>
          </div>

          <div className={styles.flowWrap} style={{ justifyContent: "center", marginBottom: "2rem" }}>
            {["1. Tell Us Your Requirement", "2. Recommended EV", "3. What Will It Cost?", "4. Explore Engineering"].map(
              (step, i, arr) => (
                <div className={styles.flowWrapPair} key={step}>
                  <div className={styles.flowWrapStep} style={{ minWidth: "auto", fontSize: "0.78rem" }}>{step}</div>
                  {i < arr.length - 1 ? <span className={styles.flowWrapArrow}>→</span> : null}
                </div>
              ),
            )}
          </div>

          <div className={styles.utilityRow} style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
            <div className={styles.segmented} role="group" aria-label="Configurator mode">
              <button
                type="button"
                className={sim.mode === "simple" ? styles.segmentedOptionActive : styles.segmentedOption}
                onClick={() => sim.setMode("simple")}
              >
                Simple
              </button>
              <button
                type="button"
                className={sim.mode === "engineering" ? styles.segmentedOptionActive : styles.segmentedOption}
                onClick={() => sim.setMode("engineering")}
              >
                Engineering
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <Presets sim={sim} />
          </div>

          <div className={styles.configuratorLayout}>
            {sim.mode === "simple" ? <RequirementInputs sim={sim} /> : <EngineeringControls sim={sim} />}
            <RecommendationPanel sim={sim} />
          </div>

          <div className={styles.utilityRow} style={{ marginTop: "2rem" }}>
            <button type="button" className={styles.linkButton} onClick={copyShareLink}>
              Copy Configuration Link
            </button>
            <button type="button" className={styles.linkButton} onClick={() => setDrawerOpen(true)}>
              View Simulator Assumptions
            </button>
            <button type="button" className={`${styles.linkButton} ${styles.printHide}`} onClick={() => window.print()}>
              Generate Configuration Summary
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ VEHICLE ═══════ */}
      <section className={styles.pageSectionAlt} id="vehicle">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Vehicle Architecture</h2>
            <p className={styles.sectionSubtitle}>
              Mass model, body/chassis targets, electrical architecture and component specification.
            </p>
          </div>
          <VehicleSection />
        </div>
      </section>

      {/* ═══════ BATTERY ═══════ */}
      <section className={styles.pageSection} id="battery">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Battery System</h2>
            <p className={styles.sectionSubtitle}>Concept-Level Energy Model — chemistry, capacity, weight and the Smart BMS.</p>
          </div>
          <BatterySection sim={sim} />
        </div>
      </section>

      {/* ═══════ POWERTRAIN ═══════ */}
      <section className={styles.pageSectionAlt} id="powertrain">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Powertrain</h2>
            <p className={styles.sectionSubtitle}>PMSM/IPM motor sizing from load, speed and terrain — and what changes when you resize it.</p>
          </div>
          <PowertrainSection sim={sim} />
        </div>
      </section>

      {/* ═══════ CHARGING ═══════ */}
      <section className={styles.pageSection} id="charging">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Charging</h2>
            <p className={styles.sectionSubtitle}>Charger recommendation, swap economics, and fleet charging + BESS planning.</p>
          </div>
          <ChargingSection sim={sim} />
        </div>
      </section>

      {/* ═══════ SOFTWARE ═══════ */}
      <section className={styles.pageSectionAlt} id="software">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Software-Defined EV</h2>
            <p className={styles.sectionSubtitle}>Four software tiers, plus cybersecurity-by-design shared with AegisCAN.</p>
          </div>
          <SoftwareSection sim={sim} />
        </div>
      </section>

      {/* ═══════ COST ═══════ */}
      <section className={styles.pageSection} id="cost">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Does the EV Cost?</h2>
            <p className={styles.sectionSubtitle}>Component BOM → manufacturing cost → indicative selling price, derived from your configuration.</p>
          </div>
          <CostSection sim={sim} />
        </div>
      </section>

      {/* ═══════ TCO ═══════ */}
      <section className={styles.pageSectionAlt} id="tco">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Owner-Driver Economics</h2>
            <p className={styles.sectionSubtitle}>EMI, TCO, EV vs CNG/petrol, and warranty-cost impact.</p>
          </div>
          <TcoSection sim={sim} />
        </div>
      </section>

      {/* ═══════ COMPETITORS ═══════ */}
      <section className={styles.pageSection} id="competitors">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Market Benchmark</h2>
            <p className={styles.sectionSubtitle}>Your configuration alongside sourced, published competitor specifications.</p>
          </div>
          <CompetitorSection sim={sim} />
        </div>
      </section>

      {/* ═══════ BUSINESS ═══════ */}
      <section className={styles.pageSectionAlt} id="business">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Business Plan</h2>
            <p className={styles.sectionSubtitle}>Business Model Canvas, variant strategy, target markets and go-to-market.</p>
          </div>
          <BusinessSection />
        </div>
      </section>

      {/* ═══════ ROADMAP ═══════ */}
      <section className={styles.pageSection} id="roadmap">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Regulatory &amp; Development Roadmap</h2>
            <p className={styles.sectionSubtitle}>Homologation scope, planning timeline and open research questions.</p>
          </div>
          <RoadmapSection />
        </div>
      </section>

      {/* ═══════ ABOUT THE RESEARCHERS ═══════ */}
      <section className={styles.pageSectionAlt} id="about-researchers">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 id="about-researchers-heading" className={styles.sectionTitle}>About the Researchers</h2>
          </div>
          <ResearchersSection />
        </div>
      </section>

      {/* ═══════ REFERENCES ═══════ */}
      <section className={styles.pageSection} id="references">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>References</h2>
          </div>
          <ReferencesSection />
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className={styles.pageSectionAlt} id="faq">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>
          <FaqSection />
          <VersionFooter />
        </div>
      </section>

      {drawerOpen ? <AssumptionsDrawer sim={sim} onClose={() => setDrawerOpen(false)} /> : null}

      <MobileResultBar sim={sim} onOpenDetails={() => setMobileResultOpen((v) => !v)} />
      {mobileResultOpen ? (
        <div className={styles.drawerOverlay} onClick={() => setMobileResultOpen(false)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Configuration</h3>
              <button type="button" className={styles.drawerCloseBtn} onClick={() => setMobileResultOpen(false)}>
                ×
              </button>
            </div>
            <RecommendationPanel sim={sim} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
