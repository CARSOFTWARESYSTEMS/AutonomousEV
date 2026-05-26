"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type WeekStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";

interface WeekItem {
  week: number;
  title: string;
  goal: string;
  actionItems: string[];
  expectedResult: string;
  status: WeekStatus;
  notes: string;
}

const STATUS_OPTIONS: WeekStatus[] = ["Not Started", "In Progress", "Completed", "Blocked"];

const initialWeeks: WeekItem[] = [
  {
    week: 1,
    title: "Define One Problem Clearly",
    goal: "Define exactly what problem we solve.",
    actionItems: [
      "Write one sentence: “We help ___ detect ___ before ___.”",
      "Example: “We help used EV stakeholders detect battery degradation before costly replacement.”",
      "Define target customer.",
      "Define customer pain.",
      "Define current manual process.",
      "Define cost of failure.",
      "Define why existing methods are weak.",
      "Create a 1-page problem statement.",
      "Create a 5-slide pitch.",
      "Create a simple architecture diagram."
    ],
    expectedResult: "We can explain the product clearly in 30 seconds, 2 minutes, and 5 minutes.",
    status: "Completed",
    notes: "Define core target customer & pain point"
  },
  {
    week: 2,
    title: "Customer Discovery",
    goal: "Talk to real people and understand actual pain.",
    actionItems: [
      "Reach out to EV service centers.",
      "Reach out to used EV dealers.",
      "Reach out to fleet operators.",
      "Reach out to battery refurbishers.",
      "Reach out to EV startups.",
      "Conduct at least 10 conversations.",
      "Ask about battery problems, diagnostic challenges, failure cases, warranty issues, and resale trust issues.",
      "Do not sell. Only learn."
    ],
    expectedResult: "Identify repeated battery pain patterns and actual industry urgency.",
    status: "In Progress",
    notes: "Targeting 10+ conversations; no sales pitches"
  },
  {
    week: 3,
    title: "Define MVP",
    goal: "Reduce scope brutally.",
    actionItems: [
      "Finalize one use case.",
      "Finalize one workflow.",
      "Finalize one demo scenario.",
      "Define input data: voltage, temperature, SOC, charging behavior.",
      "Define output: health score, abnormality warning, reuse recommendation.",
      "Remove all non-essential features."
    ],
    expectedResult: "Clear MVP scope document.",
    status: "Not Started",
    notes: "Brutal scope reduction, single workflow focus"
  },
  {
    week: 4,
    title: "Data Strategy",
    goal: "Define how battery data enters the system.",
    actionItems: [
      "Use public datasets.",
      "Use PyBaMM simulation.",
      "Use manually generated sample telemetry.",
      "Create common battery data schema.",
      "Create JSON sample logs.",
      "Create test datasets for normal, degraded, and risky battery behavior."
    ],
    expectedResult: "Usable demo/test dataset ready.",
    status: "Not Started",
    notes: "Synthetic and simulation telemetry setup"
  },
  {
    week: 5,
    title: "Intelligence Prototype",
    goal: "Build first intelligence layer.",
    actionItems: [
      "Implement simple anomaly detection OR health scoring OR degradation trend detection.",
      "Use Python.",
      "Keep logic simple and explainable.",
      "Avoid overengineering.",
      "Generate sample output from battery data."
    ],
    expectedResult: "First working battery intelligence engine.",
    status: "Not Started",
    notes: "Focus on explainable anomaly detection"
  },
  {
    week: 6,
    title: "Dashboard / UI",
    goal: "Make the intelligence visible.",
    actionItems: [
      "Build simple UI.",
      "Allow upload or loading of sample battery data.",
      "Show battery health score.",
      "Show warning/risk level.",
      "Show recommendation.",
      "Keep UI clean and demo-ready."
    ],
    expectedResult: "Working visual demo.",
    status: "Not Started",
    notes: "Clean upload and visualization screen"
  },
  {
    week: 7,
    title: "End-to-End Demo",
    goal: "Show complete flow.",
    actionItems: [
      "Battery data input.",
      "Analysis.",
      "Health intelligence.",
      "Risk alert.",
      "Recommendation.",
      "Record short demo video.",
      "Prepare demo script."
    ],
    expectedResult: "First real demonstrable product.",
    status: "Not Started",
    notes: "Self-contained workflow demo video"
  },
  {
    week: 8,
    title: "Industry Feedback",
    goal: "Validate with industry.",
    actionItems: [
      "Show demo to 5 experts.",
      "Include EV startups, professors, service engineers, and fleet/service contacts.",
      "Ask what is useful.",
      "Ask what is missing.",
      "Ask whether they would use it.",
      "Ask whether they would pay for it.",
      "Capture all feedback."
    ],
    expectedResult: "Real market feedback.",
    status: "Not Started",
    notes: "Qualitative feedback from 5 partners"
  },
  {
    week: 9,
    title: "Improve One Critical Feature",
    goal: "Improve only the most valuable feature.",
    actionItems: [
      "Select only one improvement based on feedback.",
      "Improve accuracy OR usability OR visualization OR reporting.",
      "Do not improve everything.",
      "Keep the MVP focused."
    ],
    expectedResult: "Sharper MVP.",
    status: "Not Started",
    notes: "Avoid feature creep, refine value driver"
  },
  {
    week: 10,
    title: "Create Business Story",
    goal: "Make the product commercially understandable.",
    actionItems: [
      "Create ROI slide.",
      "Define customer pain.",
      "Define business impact.",
      "Define cost/risk reduction.",
      "Define future roadmap.",
      "Define pricing assumptions."
    ],
    expectedResult: "Business-ready pitch.",
    status: "Not Started",
    notes: "ROI calculation and commercial slide deck"
  },
  {
    week: 11,
    title: "Pilot Outreach",
    goal: "Find first pilot.",
    actionItems: [
      "Approach EV startups.",
      "Approach service centers.",
      "Approach fleet operators.",
      "Approach battery labs.",
      "Offer diagnostics assessment or evaluation support.",
      "Ask for pilot collaboration."
    ],
    expectedResult: "1–3 serious pilot discussions.",
    status: "Not Started",
    notes: "Generate 1-3 pilot agreements"
  },
  {
    week: 12,
    title: "Finalize Direction",
    goal: "Decide long-term direction.",
    actionItems: [
      "Review what worked.",
      "Review strongest customer pain.",
      "Review technical feasibility.",
      "Review revenue possibility.",
      "Finalize next 6-month roadmap.",
      "Finalize customer segment.",
      "Finalize product positioning."
    ],
    expectedResult: "Clear product direction, MVP learning, market understanding, and next-stage execution plan.",
    status: "Not Started",
    notes: "Transition to formal 6-month roadmap"
  }
];

export default function Battery12WeekPlanContent() {
  const [weeks, setWeeks] = useState<WeekItem[]>(initialWeeks);

  const cycleStatus = (index: number) => {
    setWeeks(prev =>
      prev.map((w, i) => {
        if (i === index) {
          const currentIndex = STATUS_OPTIONS.indexOf(w.status);
          const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
          return { ...w, status: STATUS_OPTIONS[nextIndex] };
        }
        return w;
      })
    );
  };

  const getStatusClass = (status: WeekStatus) => {
    switch (status) {
      case "Not Started":
        return `${styles.statusPill} ${styles.statusNotStarted}`;
      case "In Progress":
        return `${styles.statusPill} ${styles.statusInProgress}`;
      case "Completed":
        return `${styles.statusPill} ${styles.statusCompleted}`;
      case "Blocked":
        return `${styles.statusPill} ${styles.statusBlocked}`;
      default:
        return styles.statusPill;
    }
  };

  return (
    <div>
      {/* ═══ 1. HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>12-Week Execution Plan</span>
          </div>

          <h1 className={styles.heroTitle}>EV Battery Diagnostics &amp; <br className={styles.desktopBr} /> Health Intelligence</h1>

          <p className={styles.heroDesc}>
            A focused weekly execution roadmap to validate one real EV battery problem, build a simple MVP, collect industry feedback, and move toward the first paying customer or pilot.
          </p>

          <div className={styles.heroPillars}>
            <div className={styles.heroPillarChip}>
              <span>🎯</span> One Product
            </div>
            <div className={styles.heroPillarChip}>
              <span>⚡</span> One Customer Pain
            </div>
            <div className={styles.heroPillarChip}>
              <span>📦</span> One MVP
            </div>
            <div className={styles.heroPillarChip}>
              <span>🚀</span> One Pilot Goal
            </div>
            <div className={styles.heroPillarChip}>
              <span>🛡️</span> No Distraction
            </div>
          </div>

          <div className={styles.heroCtas}>
            <Link
              href="#roadmap"
              className="btn btn-primary"
              id="btn-hero-start-12-week"
              data-track-event="roadmap_hero_start_click"
              data-track-label="Start 12-Week Plan"
            >
              Start 12-Week Plan
            </Link>
            <Link
              href="/internships/battery-fire-prevention"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              id="btn-hero-back-to-fire-prev"
              data-track-event="roadmap_hero_back_click"
              data-track-label="Back to Battery Fire Prevention"
            >
              Back to Battery Fire Prevention
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 1: FOCUS RULE ═══ */}
      <section className={styles.pageSection} style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.focusRuleCard}>
            <div className={styles.focusHeader}>
              <div className={styles.sectionNumber}>Core Commandment</div>
              <h2 className={styles.focusTitle}>The Focus Rule</h2>
              <p className={styles.focusSubtitle}>For the next 12 weeks, we will focus only on:</p>
              <p style={{ fontSize: "1.3rem", fontWeight: "700", color: "#fff", marginTop: "0.5rem" }}>
                EV Battery Diagnostics + Health Intelligence
              </p>
            </div>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              To solve EV battery diagnostics and health intelligence for used EVs and second-life batteries, we must aggressively eliminate scope creep and stay laser-focused.
            </p>

            <div className={styles.avoidGrid}>
              {[
                "New product ideas",
                "Unnecessary platform expansion",
                "Random AI experiments",
                "Too many features",
                "Website redesign distractions",
                "Multiple customer segments at once"
              ].map((item, idx) => (
                <div key={idx} className={styles.avoidItem}>
                  <span className={styles.avoidIcon}>✕</span>
                  <span>Avoid {item}</span>
                </div>
              ))}
            </div>

            <div className={styles.decisionFilter}>
              <div className={styles.filterLabel}>Decision Filter</div>
              <div className={styles.filterQuestion}>
                “Does this help solve EV battery diagnostics and health intelligence better?”
              </div>
              <div className={styles.filterAction}>
                If <strong>No</strong>, postpone it immediately.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: PRODUCT DIRECTION ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Strategy</span>
            <h2 className={styles.sectionTitle}>Product Direction</h2>
            <p className={styles.sectionSubtitle}>
              We are not building multiple products. We are simplifying. We are focusing on one painful EV battery problem and solving it end-to-end.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>1. Problem</h3>
              <p className={styles.cardDesc}>
                Can we reliably determine whether an EV battery is healthy, risky, reusable, or near failure?
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>2. Target Users</h3>
              <ul className={styles.list}>
                <li>Used EV dealers</li>
                <li>Fleet operators</li>
                <li>EV service centers</li>
                <li>Battery refurbishers</li>
                <li>Second-life battery companies</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>3. MVP Output</h3>
              <ul className={styles.list}>
                <li>Battery Health Score</li>
                <li>Failure Risk Detection</li>
                <li>Second-Life / Reusability Recommendation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: 12-WEEK ROADMAP TIMELINE ═══ */}
      <section className={styles.pageSection} id="roadmap">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Roadmap</span>
            <h2 className={styles.sectionTitle}>12-Week Weekly Roadmap</h2>
            <p className={styles.sectionSubtitle}>
              Click on the status pill in any card to visually toggle its progress. Status updates sync automatically.
            </p>
          </div>

          <div className={styles.roadmapTimeline}>
            {weeks.map((item, index) => (
              <div className={styles.roadmapStep} key={item.week}>
                <div className={styles.roadmapDot} />
                <div className={styles.roadmapCard}>
                  <div className={styles.roadmapHeader}>
                    <div>
                      <div className={styles.weekLabel}>Week {item.week}</div>
                      <h3 className={styles.weekTitle}>{item.title}</h3>
                    </div>
                    <span
                      className={getStatusClass(item.status)}
                      id={`status-pill-week-${item.week}`}
                      onClick={() => cycleStatus(index)}
                      title="Click to cycle status"
                      data-track-event="roadmap_week_status_click"
                      data-track-label={`Week ${item.week} - ${item.status}`}
                    >
                      ● {item.status}
                    </span>
                  </div>

                  <div>
                    <div className={styles.sectionHeadingText}>Goal</div>
                    <p style={{ fontSize: "0.95rem", color: "#fff", fontWeight: "600", marginBottom: "1rem" }}>
                      {item.goal}
                    </p>

                    <div className={styles.sectionHeadingText}>Action Items</div>
                    <ul className={styles.actionList} style={{ marginBottom: "1.25rem" }}>
                      {item.actionItems.map((action, actionIdx) => (
                        <li key={actionIdx}>{action}</li>
                      ))}
                    </ul>

                    <div className={styles.sectionHeadingText}>Expected Result</div>
                    <div className={styles.expectedResultText}>{item.expectedResult}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: WEEKLY TRACKING TABLE ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Tracking</span>
            <h2 className={styles.sectionTitle}>Weekly Status Dashboard</h2>
            <p className={styles.sectionSubtitle}>
              Review the complete plan at a glance. Cycle status pills by clicking them.
            </p>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.trackingTable}>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Goal</th>
                  <th>Key Action Items</th>
                  <th>Expected Result</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((item, index) => (
                  <tr key={item.week}>
                    <td className={styles.tableCellWeek}>Week {item.week}</td>
                    <td className={styles.tableCellGoal}>{item.goal}</td>
                    <td className={styles.tableCellActions}>
                      <ul>
                        {item.actionItems.slice(0, 3).map((action, idx) => (
                          <li key={idx}>{action.substring(0, 50)}{action.length > 50 ? "..." : ""}</li>
                        ))}
                        {item.actionItems.length > 3 && (
                          <li style={{ color: "var(--accent-primary)", fontStyle: "italic" }}>
                            + {item.actionItems.length - 3} more items...
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className={styles.tableCellExpected}>{item.expectedResult}</td>
                    <td className={styles.tableCellStatus}>
                      <span
                        className={getStatusClass(item.status)}
                        id={`table-status-pill-week-${item.week}`}
                        onClick={() => cycleStatus(index)}
                        title="Click to cycle status"
                        data-track-event="roadmap_table_status_click"
                        data-track-label={`Week ${item.week} - ${item.status}`}
                      >
                        ● {item.status}
                      </span>
                    </td>
                    <td className={styles.tableCellNotes}>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: SUCCESS METRICS ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Metrics</span>
            <h2 className={styles.sectionTitle}>Week 12 Success Criteria</h2>
            <p className={styles.sectionSubtitle}>
              Our objective measures of success upon concluding the 12-week roadmap.
            </p>
          </div>

          <div className={styles.grid4}>
            {[
              { metric: "1 working MVP", desc: "A functional diagnostic engine with clean UI and sample data." },
              { metric: "3–5 industry discussions", desc: "Direct validation sessions with industry practitioners and decision makers." },
              { metric: "1 pilot opportunity", desc: "A concrete path toward deploying our software in a real testing environment." },
              { metric: "1 customer pain validation", desc: "Immutable feedback from used EV dealers or fleet managers confirming pain." }
            ].map((m, idx) => (
              <div className={styles.card} key={idx}>
                <div className={styles.weekLabel} style={{ marginBottom: "0.5rem" }}>Metric 0{idx + 1}</div>
                <h3 className={styles.cardTitle} style={{ color: "var(--accent-primary)", fontSize: "1.25rem" }}>
                  {m.metric}
                </h3>
                <p className={styles.cardDesc} style={{ marginTop: "0.5rem" }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.grid3} style={{ marginTop: "1.5rem" }}>
            {[
              { metric: "1 demo video", desc: "A screen recording showing the upload flow, score output, and recommendations." },
              { metric: "1 business pitch", desc: "A 5-10 slide deck detailing problem, target audience, business model, and ROI." },
              { metric: "1 clear roadmap", desc: "Validated next steps and customer integration plan for the following 6 months." }
            ].map((m, idx) => (
              <div className={styles.card} key={idx}>
                <div className={styles.weekLabel} style={{ marginBottom: "0.5rem" }}>Metric 0{idx + 5}</div>
                <h3 className={styles.cardTitle} style={{ color: "var(--accent-primary)", fontSize: "1.25rem" }}>
                  {m.metric}
                </h3>
                <p className={styles.cardDesc} style={{ marginTop: "0.5rem" }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: FINAL FOUNDER REMINDER & FOOTER CTAS ═══ */}
      <section className={styles.pageSectionAlt} style={{ textAlign: "center", paddingBottom: "7rem" }}>
        <div className="container">
          <div className={styles.calloutBlock} style={{ textAlign: "left", margin: "0 auto 3rem auto", maxWidth: "900px" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fff", marginBottom: "0.75rem" }}>
              “Do not complicate. <br /> Simplify until the customer problem becomes obvious.”
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.7" }}>
              The goal is not to build a big platform immediately. The goal is to find one painful EV battery problem, solve it clearly, validate it with real users, and convert it into a repeatable business outcome.
            </p>
          </div>

          <h2 className={styles.sectionTitle}>Ready to begin execution?</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
            Let's maintain extreme discipline and drive focus to validate this second-life battery intelligence direction.
          </p>

          <div className={styles.heroCtas}>
            <Link
              href="#roadmap"
              className="btn btn-primary"
              id="btn-footer-start-12-week"
              data-track-event="roadmap_footer_start_click"
              data-track-label="Start Execution Plan"
            >
              Start Execution Plan
            </Link>
            <Link
              href="/internships/battery-fire-prevention"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              id="btn-footer-explore-fire-prev"
              data-track-event="roadmap_footer_explore_click"
              data-track-label="Explore Battery Fire Prevention"
            >
              Explore Battery Fire Prevention
            </Link>
            <Link
              href="/contact"
              className="btn btn-secondary"
              id="btn-footer-contact-ev"
              data-track-event="roadmap_footer_contact_click"
              data-track-label="Contact EV.ENGINEER"
            >
              Contact EV.ENGINEER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
