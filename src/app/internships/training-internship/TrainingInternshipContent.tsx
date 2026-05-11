"use client";

import Link from "next/link";
import styles from "./page.module.css";

/* ───────────────────────────────────────────────────
   PHASES DATA
   ─────────────────────────────────────────────────── */

const phases = [
  {
    id: "phase0",
    label: "Phase 0",
    title: "Selection Process",
    subtitle: "Eligibility, Code Test & Interview",
    duration: null,
    effort: null,
    items: [
      "Candidate eligibility check",
      "Code test",
      "Technical interview",
      "Career discussion",
      "Selection for Phase 1",
    ],
    fee: null,
    advance: { amount: "₹15,000", note: "Refundable after successful completion of Phase 4, subject to program terms" },
    milestone: null,
    gate: null,
    isCore: false,
  },
  {
    id: "phase1",
    label: "Phase 1",
    title: "Training",
    subtitle: "Month 1 to Month 3",
    duration: "Month 1 – Month 3",
    effort: "15 hours / week",
    schedule: "Mon–Fri: 2 hrs/day · Saturday: 5 hrs · Sunday: Optional",
    items: [
      "Month 1: Introduction, fundamentals, module overview, feature concepts",
      "Month 2: Feasibility study, wireframes, system analysis, documentation, design",
      "Month 3: GenAI / Agentic AI as engineering tools, development basics, testing process, localization, security testing, training completion",
    ],
    fee: { tuition: "₹10,000", workspace: "₹5,000", total: "₹15,000", gst: "₹2,700", grand: "₹17,700" },
    milestone: "Training Completion Certificate",
    gate: null,
    isCore: false,
  },
  {
    id: "phase2",
    label: "Phase 2",
    title: "Proof of Concept",
    subtitle: "Month 4 to Month 6",
    duration: "Month 4 – Month 6",
    effort: "15 hours / week",
    schedule: null,
    items: [
      "Month 4: Feature 1 feasibility, wireframe, design, working POC demo",
      "Month 5: Feature 2 feasibility, wireframe, design, working POC demo",
      "Month 6: Feature 3 feasibility, wireframe, design, working POC demo",
    ],
    fee: { tuition: "₹10,000", workspace: "₹5,000", total: "₹15,000", gst: "₹2,700", grand: "₹17,700" },
    milestone: null,
    gate: "Test & Interview for Phase 3",
    isCore: false,
  },
  {
    id: "phase3",
    label: "Phase 3",
    title: "Product Development",
    subtitle: "Month 7 to Month 9",
    duration: "Month 7 – Month 9",
    effort: "15 hours / week",
    schedule: null,
    items: [
      "Month 7: Feature 1 development, unit testing, code review, demo",
      "Month 8: Feature 2 development, unit testing, code review, demo",
      "Month 9: Feature 3 development, unit testing, code review, demo",
    ],
    fee: { tuition: "₹10,000", workspace: "₹5,000", total: "₹15,000", gst: "₹2,700", grand: "₹17,700" },
    milestone: null,
    gate: "Test & Interview for Phase 4",
    isCore: true,
  },
  {
    id: "phase4",
    label: "Phase 4",
    title: "Testing & Release Readiness",
    subtitle: "Month 10 to Month 12",
    duration: "Month 10 – Month 12",
    effort: "15 hours / week",
    schedule: null,
    items: [
      "Month 10: Quality testing, security testing, bug fixes, demo after fixes",
      "Month 11: Integration testing, beta testing, production demo, webinar / seminar",
      "Month 12: Pre-release checklist, production deployment, post-release verification, final review",
    ],
    fee: { tuition: "₹10,000", workspace: "₹5,000", total: "₹15,000", gst: "₹2,700", grand: "₹17,700" },
    milestone: "Internship Completion Certificate",
    gate: null,
    isCore: false,
  },
];

const month13Items = [
  "Award / certificate distribution",
  "Internship completion certificate",
  "EV.ENGINEER™ internship completion recognition",
  "Placement support",
  "Mock interviews",
  "Resume improvement",
  "Career guidance",
];

const effortRows = [
  { item: "Program Duration", detail: "12 Months + Month 13 Certification / Placement Support" },
  { item: "Training Duration", detail: "6 Months" },
  { item: "Internship Duration", detail: "6 Months" },
  { item: "Weekly Effort", detail: "15 Hours" },
  { item: "Weekday Effort", detail: "2 Hours / Day" },
  { item: "Saturday Effort", detail: "5 Hours" },
  { item: "Monthly Fee", detail: "₹15,000 + GST" },
  { item: "Grand Total Per Month", detail: "₹17,700" },
  { item: "Advance", detail: "₹15,000" },
  { item: "Advance Refund", detail: "Refundable after successful completion of Phase 4, subject to program terms" },
];

const feeCards = [
  { icon: "📚", label: "Tuition Fee", value: "₹10,000", sub: "per month" },
  { icon: "🏢", label: "Workspace Bangalore", value: "₹5,000", sub: "per month" },
  { icon: "📊", label: "GST", value: "₹2,700", sub: "18% on ₹15,000" },
  { icon: "💳", label: "Monthly Grand Total", value: "₹17,700", sub: "incl. GST", highlight: true },
  { icon: "🔐", label: "Advance Amount", value: "₹15,000", sub: "one-time" },
  { icon: "🔄", label: "Advance Refund", value: "Phase 4", sub: "on successful completion" },
];

const gates = [
  { num: "Gate 1", title: "Selection Process — Eligibility Check, Code Test & Interview" },
  { num: "Gate 2", title: "Phase 1 Completion — Training Completion Certificate" },
  { num: "Gate 3", title: "Phase 2 Eligibility — Test & Interview before Phase 3" },
  { num: "Gate 4", title: "Phase 3 Eligibility — Test & Interview before Phase 4" },
  { num: "Gate 5", title: "Phase 4 Completion — Internship Completion Certificate" },
  { num: "Gate 6", title: "Month 13 — Certification & Placement Support" },
];

const deliverables = [
  "Requirements document",
  "Wireframes",
  "System analysis document",
  "High-level design",
  "Detailed design",
  "Safety & security design",
  "Working POC",
  "Product module",
  "Unit test cases",
  "Code review reports",
  "Quality testing report",
  "Security testing report",
  "Release readiness checklist",
  "Production demo",
  "Final presentation",
];

const outcomes = [
  "Understand real engineering workflows",
  "Build structured product documentation",
  "Design and develop working POCs",
  "Participate in product development",
  "Understand testing and release readiness",
  "Improve EV engineering competency",
  "Prepare for EV industry job roles",
];

const roles = [
  { icon: "⚡", title: "EV Software Engineer" },
  { icon: "🔋", title: "EV Battery Diagnostics Engineer" },
  { icon: "🔌", title: "Embedded Systems Engineer" },
  { icon: "📡", title: "BMS Software Engineer" },
  { icon: "🌐", title: "Telematics Engineer" },
  { icon: "📊", title: "EV Data & Analytics Engineer" },
  { icon: "🤖", title: "AI-Assisted Engineering Developer" },
  { icon: "🚗", title: "Product Development Engineer" },
  { icon: "🔍", title: "QA / Testing Engineer" },
  { icon: "🏆", title: "Technical Lead Trainee" },
];

/* ───────────────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────────────── */

export default function TrainingInternshipContent() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroPill}>🎓 EV.ENGINEER™ Structured Pathway</div>

          <h1 className={styles.heroTitle}>
            Training &amp; Internship —<br />Selection Process &amp; Fees Structure
          </h1>

          <span className={styles.heroHighlight}>
            12-Month Energy &amp; EV Engineering Pathway<br />
            Training → POC → Product → Testing → Certification
          </span>

          <p className={styles.heroDesc}>
            A structured 12-month engineering pathway combining 6 months of training and 6 months of
            internship, designed to build industry-ready EV engineers and technical leaders.
          </p>

          <div className={styles.heroCtas}>
            <a
              href="https://topmate.io/sudarshana_karkala"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              data-track-event="training_internship_discovery_call_click"
            >
              Schedule Discovery Call
            </a>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Training%20%26%20Internship%20Program.%20Please%20share%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-track-event="training_internship_apply_click"
            >
              Apply Now
            </a>
            <Link
              href="/ev-career"
              className="btn btn-secondary"
              data-track-event="training_internship_ev_career_click"
            >
              Explore EV Careers
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className={styles.pageSectionAlt} style={{ padding: "3rem 0" }}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>12</div>
              <div className={styles.statLabel}>Months Program</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>6</div>
              <div className={styles.statLabel}>Months Training</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>6</div>
              <div className={styles.statLabel}>Months Internship</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>15</div>
              <div className={styles.statLabel}>Hrs / Week</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>4</div>
              <div className={styles.statLabel}>Eligibility Gates</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>15+</div>
              <div className={styles.statLabel}>Deliverables</div>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span className={styles.sectionNumber} style={{ marginBottom: 0 }}>Who is this for?</span>
            </div>
            <div className={styles.whoCard}>
              <div className={styles.whoItem}>
                <div className={styles.whoItemIcon}>🎓</div>
                <div className={styles.whoItemTitle}>Students</div>
                <div className={styles.whoItemDesc}>Final-year or recently graduated engineering students</div>
              </div>
              <div className={styles.whoItem}>
                <div className={styles.whoItemIcon}>💼</div>
                <div className={styles.whoItemTitle}>Freshers</div>
                <div className={styles.whoItemDesc}>0–1 year experience seeking structured EV exposure</div>
              </div>
              <div className={styles.whoItem}>
                <div className={styles.whoItemIcon}>👩‍💻</div>
                <div className={styles.whoItemTitle}>Working Professionals</div>
                <div className={styles.whoItemDesc}>Career switchers transitioning into EV engineering</div>
              </div>
              <div className={styles.whoItem}>
                <div className={styles.whoItemIcon}>⚡</div>
                <div className={styles.whoItemTitle}>Aspiring EV Engineers</div>
                <div className={styles.whoItemDesc}>Anyone who wants a structured path to EV product readiness</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PHASE STRUCTURE ═══════════════════ */}
      <section className={styles.pageSection} id="phases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 01</span>
            <h2 className={styles.sectionTitle}>Program Structure — Phase by Phase</h2>
            <p className={styles.sectionSubtitle}>
              Each phase builds on the previous, with eligibility gates ensuring readiness before progression
            </p>
          </div>

          {/* Row 1: Phase 0 + Phase 1 */}
          <div className={styles.phaseRow}>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>⬡ Phase 0</div>
              <div className={styles.phaseDuration}>Before Program Begins</div>
              <div className={styles.phaseTitle}>Selection Process</div>
              <div className={styles.phaseEffort} style={{ color: "var(--text-muted)" }}>Eligibility, Code Test &amp; Interview</div>
              <ul className={styles.phaseList}>
                {phases[0].items.map((item, i) => (<li key={i}>{item}</li>))}
              </ul>
              <div className={styles.phaseFee}>
                <div className={styles.phaseFeeTotal}><span>Advance</span><span>₹15,000</span></div>
                <div className={styles.phaseFeeRow} style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
                  <span>Refund</span>
                  <span style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>After Phase 4, subject to terms</span>
                </div>
              </div>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>⬡ Phase 1</div>
              <div className={styles.phaseDuration}>{phases[1].duration}</div>
              <div className={styles.phaseTitle}>{phases[1].title}</div>
              <div className={styles.phaseEffort}>⏱ {phases[1].effort} · Mon–Fri 2h · Sat 5h</div>
              <ul className={styles.phaseList}>
                {phases[1].items.map((item, i) => (<li key={i}>{item}</li>))}
              </ul>
              <div className={styles.phaseFee}>
                <div className={styles.phaseFeeRow}><span>Tuition</span><span>₹10,000/mo</span></div>
                <div className={styles.phaseFeeRow}><span>GST (18%)</span><span>₹1,800</span></div>
                <div className={styles.phaseFeeTotal}><span>Online Total</span><span>₹11,800/mo</span></div>
              </div>
              <div className={styles.phaseMilestone}>🏅 {phases[1].milestone}</div>
            </div>
          </div>

          {/* Row 2: Phase 2 + Phase 3 */}
          <div className={styles.phaseRow}>
            {[phases[2], phases[3]].map((phase) => (
              <div key={phase.id} className={phase.isCore ? styles.phaseCardCore : styles.phaseCard}>
                <div className={styles.phaseNumber}>⬡ {phase.label}</div>
                <div className={styles.phaseDuration}>{phase.duration}</div>
                <div className={styles.phaseTitle}>{phase.title}</div>
                <div className={styles.phaseEffort}>⏱ {phase.effort}</div>
                <ul className={styles.phaseList}>
                  {phase.items.map((item, i) => (<li key={i}>{item}</li>))}
                </ul>
                <div className={styles.phaseFee}>
                  <div className={styles.phaseFeeRow}><span>Tuition</span><span>₹10,000/mo</span></div>
                  <div className={styles.phaseFeeRow}><span>GST (18%)</span><span>₹1,800</span></div>
                  <div className={styles.phaseFeeTotal}><span>Online Total</span><span>₹11,800/mo</span></div>
                </div>
                {phase.gate && <div className={styles.phaseGate}>🔐 {phase.gate}</div>}
              </div>
            ))}
          </div>

          {/* Row 3: Phase 4 */}
          <div className={styles.phaseRowSingle}>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>⬡ Phase 4</div>
              <div className={styles.phaseDuration}>{phases[4].duration}</div>
              <div className={styles.phaseTitle}>{phases[4].title}</div>
              <div className={styles.phaseEffort}>⏱ {phases[4].effort}</div>
              <ul className={styles.phaseList}>
                {phases[4].items.map((item, i) => (<li key={i}>{item}</li>))}
              </ul>
              <div className={styles.phaseFee}>
                <div className={styles.phaseFeeRow}><span>Tuition</span><span>₹10,000/mo</span></div>
                <div className={styles.phaseFeeRow}><span>GST (18%)</span><span>₹1,800</span></div>
                <div className={styles.phaseFeeTotal}><span>Online Total</span><span>₹11,800/mo</span></div>
              </div>
              <div className={styles.phaseMilestone}>🏅 {phases[4].milestone}</div>
            </div>
          </div>

          {/* Month 13 */}
          <div className={styles.phaseRowSingle} style={{ marginTop: "0.5rem" }}>
            <div
              className={styles.phaseCard}
              style={{
                background: "linear-gradient(135deg, rgba(76,169,48,0.12), rgba(6,40,28,0.8))",
                borderColor: "rgba(76,169,48,0.45)",
              }}
            >
              <div className={styles.phaseNumber} style={{ background: "rgba(76,169,48,0.2)" }}>🏆 Month 13</div>
              <div className={styles.phaseTitle}>Award, Certification &amp; Placement Support</div>
              <ul className={styles.phaseList} style={{ marginTop: "1rem" }}>
                {month13Items.map((item, i) => (
                  <li key={i}>
                    {item === "Career guidance" ? (
                      <Link href="/ev-career" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>Career guidance</Link>
                    ) : item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ EFFORT SUMMARY ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="effort-summary">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 02</span>
            <h2 className={styles.sectionTitle}>Effort &amp; Commitment Summary</h2>
            <p className={styles.sectionSubtitle}>
              At a glance — program duration, weekly effort, fees, and advance
            </p>
          </div>

          <div className={styles.effortVisual}>
            {/* Left: Timeline + Key Metrics */}
            <div className={styles.effortCard}>
              <div className={styles.effortCardTitle}>📅 12-Month Program Timeline</div>
              <div className={styles.timelineStrip}>
                {[1,2,3].map(m => <div key={m} className={`${styles.timelineMonth} ${styles.tmTraining}`}>M{m}</div>)}
                {[4,5,6].map(m => <div key={m} className={`${styles.timelineMonth} ${styles.tmPoc}`}>M{m}</div>)}
                {[7,8,9].map(m => <div key={m} className={`${styles.timelineMonth} ${styles.tmDev}`}>M{m}</div>)}
                {[10,11,12].map(m => <div key={m} className={`${styles.timelineMonth} ${styles.tmTesting}`}>M{m}</div>)}
                <div className={`${styles.timelineMonth} ${styles.tmCert}`} style={{ fontSize: "0.52rem" }}>M13</div>
              </div>
              <div className={styles.timelineLegend}>
                <span className={styles.legendChip}><span className={styles.legendChipDot} style={{ background: "rgba(76,169,48,0.55)" }} />Training (M1–3)</span>
                <span className={styles.legendChip}><span className={styles.legendChipDot} style={{ background: "rgba(76,169,48,0.75)" }} />POC (M4–6)</span>
                <span className={styles.legendChip}><span className={styles.legendChipDot} style={{ background: "rgba(76,169,48,0.9)" }} />Dev (M7–9)</span>
                <span className={styles.legendChip}><span className={styles.legendChipDot} style={{ background: "#4CA930" }} />Testing (M10–12)</span>
                <span className={styles.legendChip}><span className={styles.legendChipDot} style={{ background: "#f5a623" }} />Cert (M13)</span>
              </div>
              <div className={styles.effortMetrics}>
                <div className={styles.effortMetric}><div className={styles.effortMetricValue}>12</div><div className={styles.effortMetricLabel}>Months Total</div></div>
                <div className={styles.effortMetric}><div className={styles.effortMetricValue}>15h</div><div className={styles.effortMetricLabel}>Per Week</div></div>
                <div className={styles.effortMetric}><div className={styles.effortMetricValue}>6</div><div className={styles.effortMetricLabel}>Training Months</div></div>
                <div className={styles.effortMetric}><div className={styles.effortMetricValue}>6</div><div className={styles.effortMetricLabel}>Internship Months</div></div>
              </div>
            </div>
            {/* Right: Weekly Schedule */}
            <div className={styles.effortCard}>
              <div className={styles.effortCardTitle}>🗓 Weekly Schedule — 15 hrs/week</div>
              <div className={styles.weekSchedule}>
                {["Mon","Tue","Wed","Thu","Fri"].map(d => (
                  <div key={d} className={styles.dayRow}>
                    <span className={styles.dayLabel}>{d}</span>
                    <div className={styles.dayBlocks}>{[0,1].map(b => <div key={b} className={styles.dayBlock} />)}</div>
                    <span className={styles.dayTotal}>2 hrs</span>
                  </div>
                ))}
                <div className={styles.dayRow}>
                  <span className={styles.dayLabel}>Sat</span>
                  <div className={styles.dayBlocks}>{[0,1,2,3,4].map(b => <div key={b} className={styles.dayBlock} />)}</div>
                  <span className={styles.dayTotal}>5 hrs</span>
                </div>
                <div className={styles.dayRow}>
                  <span className={styles.dayLabel}>Sun</span>
                  <div className={styles.dayBlocks}>{[0,1,2].map(b => <div key={b} className={`${styles.dayBlock} ${styles.dayBlockHalf}`} />)}</div>
                  <span className={styles.dayOptional}>Optional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEE STRUCTURE ═══════════════════ */}
      <section className={styles.pageSection} id="fees">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 03</span>
            <h2 className={styles.sectionTitle}>Fee Structure</h2>
            <p className={styles.sectionSubtitle}>
              Transparent, phase-consistent pricing with a refundable advance
            </p>
          </div>

          <div className={styles.feeModeGrid}>
            <div className={styles.feeModeCardOnline}>
              <div className={styles.feeModeBadge}>⭐ Recommended</div>
              <div className={styles.feeModeTitle}>💻 Online / @ College</div>
              <div className={styles.feeModeLine}><span>Tuition</span><span>₹10,000 / month</span></div>
              <div className={styles.feeModeLine}><span>GST (18%)</span><span>₹1,800</span></div>
              <div className={styles.feeModeTotal}><span>Monthly Total</span><span>₹11,800</span></div>
            </div>
            <div className={styles.feeModeCard}>
              <div className={styles.feeModeLabel}>🏢 Optional</div>
              <div className={styles.feeModeTitle}>With Workspace in Bangalore</div>
              <div className={styles.feeModeLine}><span>Tuition</span><span>₹10,000 / month</span></div>
              <div className={styles.feeModeLine}><span>Workspace Bangalore</span><span>₹5,000 / month</span></div>
              <div className={styles.feeModeLine}><span>Subtotal</span><span>₹15,000</span></div>
              <div className={styles.feeModeLine}><span>GST (18%)</span><span>₹2,700</span></div>
              <div className={styles.feeModeTotal}><span>Monthly Total</span><span>₹17,700</span></div>
            </div>
          </div>

          <div className={styles.feeAdvanceCard}>
            <div className={styles.feeAdvanceLabel}><strong>Advance (one-time)</strong> — Refundable after successful completion of Phase 4, subject to program terms</div>
            <div className={styles.feeAdvanceValue}>₹15,000</div>
          </div>

          <div className={styles.feeDisclaimer}>
            ⚠️ Workspace Bangalore is optional. Fees, refund conditions, workspace availability, and payment terms are subject to final confirmation by EV.ENGINEER™.
          </div>
        </div>
      </section>

      {/* ═══════════════════ ELIGIBILITY GATES ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="eligibility">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 04</span>
            <h2 className={styles.sectionTitle}>Eligibility Gates</h2>
            <p className={styles.sectionSubtitle}>
              Each gate ensures you are ready for the next phase of the program
            </p>
          </div>

          <div className={styles.gatesTimeline}>
            {gates.map((gate, i) => (
              <div key={i} className={styles.gateItem}>
                <div className={styles.gateNumber}>{gate.num}</div>
                <div className={styles.gateTitle}>{gate.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DELIVERABLES ═══════════════════ */}
      <section className={styles.pageSection} id="deliverables">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 05</span>
            <h2 className={styles.sectionTitle}>Program Deliverables</h2>
            <p className={styles.sectionSubtitle}>
              Real engineering artefacts you will produce during the program
            </p>
          </div>

          <div className={styles.listGrid}>
            {deliverables.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <span className={styles.listItemDot} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ OUTCOMES ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="outcomes">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 06</span>
            <h2 className={styles.sectionTitle}>Program Outcomes</h2>
            <p className={styles.sectionSubtitle}>
              What you will be able to do after completing the program
            </p>
          </div>

          <div className={styles.listGrid}>
            {outcomes.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <span className={styles.listItemDot} style={{ background: "var(--accent-primary)", boxShadow: "0 0 6px rgba(76,169,48,0.5)" }} />
                {i === outcomes.length - 1 ? (
                  <Link href="/ev-career" style={{ color: "inherit", textDecoration: "underline", textDecorationColor: "var(--accent-primary)" }}>{item}</Link>
                ) : item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CAREER ROLES ═══════════════════ */}
      <section className={styles.pageSection} id="careers">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 07</span>
            <h2 className={styles.sectionTitle}>EV Career Roles You Can Pursue</h2>
            <p className={styles.sectionSubtitle}>
              Industry roles this program prepares you for
            </p>
          </div>

          <div className={styles.rolesGrid}>
            {roles.map((role, i) => (
              <div key={i} className={styles.roleCard}>
                <div className={styles.roleIcon}>{role.icon}</div>
                <div className={styles.roleTitle}>{role.title}</div>
              </div>
            ))}
          </div>

          <div className={styles.insightCard} style={{ marginTop: "2.5rem" }}>
            <span className={styles.insightIcon}>🚀</span>
            <div className={styles.insightText}>
              <strong>Placement Support Included:</strong> Resume review, mock interviews, career guidance,
              and EV.ENGINEER™ internship completion recognition to help you land your first EV engineering role.
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STUDENT OFFER ═══════════════════ */}
      <section className={styles.studentOfferSection} id="student-offer">
        <div className={styles.studentOfferGlow} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.studentOfferBadge}>🎓 Limited Offer — For Students</div>

          <h2 className={styles.studentOfferTitle}>
            Free Training &amp; Internship<br />
            <span className={styles.studentOfferHighlight}>For Qualified Students</span>
          </h2>

          <p className={styles.studentOfferDesc}>
            EV.ENGINEER™ believes in nurturing exceptional engineering talent. Qualified students may be
            eligible for a fully sponsored Training &amp; Internship pathway — including coaching,
            mentorship, and placement support — at <strong>no cost</strong>.
          </p>

          <div className={styles.studentOfferCards}>
            <div className={styles.studentOfferCard} style={{ borderColor: "rgba(56,189,248,0.5)" }}>
              <div className={styles.studentOfferCardIcon}>🎯</div>
              <div className={styles.studentOfferCardTitle}>Eligibility-Based</div>
              <div className={styles.studentOfferCardDesc}>Selected through a rigorous code test and technical interview. Merit-only selection.</div>
            </div>
            <div className={styles.studentOfferCard} style={{ borderColor: "rgba(251,191,36,0.5)" }}>
              <div className={styles.studentOfferCardIcon}>📚</div>
              <div className={styles.studentOfferCardTitle}>Full Coaching Included</div>
              <div className={styles.studentOfferCardDesc}>Complete 6-month training + 6-month internship pathway with structured weekly sessions.</div>
            </div>
            <div className={styles.studentOfferCard} style={{ borderColor: "rgba(248,113,113,0.5)" }}>
              <div className={styles.studentOfferCardIcon}>🏆</div>
              <div className={styles.studentOfferCardTitle}>Certification &amp; Placement</div>
              <div className={styles.studentOfferCardDesc}>EV.ENGINEER™ internship certificate, mock interviews, resume support, and career guidance.</div>
            </div>
          </div>

          <div className={styles.studentOfferCta}>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20a%20student%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Free%20Training%20%26%20Internship%20Student%20Offer.%20Please%20share%20eligibility%20details."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.studentOfferBtn}
              data-track-event="training_internship_student_offer_click"
            >
              📲 Contact Us for Student Offer
            </a>
            <p className={styles.studentOfferNote}>
              ⚠️ Free coaching is subject to eligibility, seat availability, and final confirmation by EV.ENGINEER™.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className={styles.finalSection} id="apply">
        <div className={styles.finalGlow} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 className={styles.finalTitle}>Start Your EV Engineering Journey</h2>
          <p className={styles.finalDesc}>
            Join a structured training and internship pathway designed to build real-world EV engineering
            skills, product development discipline, and industry readiness.
          </p>
          <div className={styles.finalCtas}>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Training%20%26%20Internship%20Program.%20Please%20share%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem" }}
              data-track-event="training_internship_cta_apply_click"
            >
              Apply Now
            </a>
            <a
              href="https://topmate.io/sudarshana_karkala"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem" }}
              data-track-event="training_internship_cta_discovery_call_click"
            >
              Schedule Discovery Call
            </a>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20a%20student%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Free%20Training%20%26%20Internship%20Student%20Offer.%20Please%20share%20eligibility%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem", borderColor: "rgba(56,189,248,0.6)", color: "#38bdf8" }}
              data-track-event="training_internship_cta_student_offer_click"
            >
              📲 Contact for Student Offer
            </a>
            <Link
              href="/ev-career"
              className="btn btn-secondary"
              style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem" }}
              data-track-event="training_internship_cta_ev_career_click"
            >
              Explore EV Careers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
