"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import questionnairesData from "@/data/ev-questionnaires/ev_engineer_customer_discovery_questionnaires.json";

// Categories display mapping to keep the UI clean
const displayCategoryNames: Record<string, string> = {
  ev_owner_rider: "EV Owner",
  ev_service_center: "EV Service Center",
  used_ev_dealer: "Used EV Dealer",
  fleet_operator: "Fleet Operator",
  battery_refurbisher_second_life: "Battery Refurbisher",
  ev_startup_manufacturer_battery_company: "EV Startup",
};

export default function CustomerDiscoveryToolkitContent() {
  const [activeTab, setActiveTab] = useState<string>("ev_owner_rider");

  // Dynamic Questionnaire Data from the provided JSON
  const categories = questionnairesData.categories;
  const commonFinalQuestions = questionnairesData.commonFinalQuestions;
  const thankYouMessage = questionnairesData.thankYouMessage;
  const interviewerInstructions = questionnairesData.interviewerInstructions;

  const currentCategory = categories.find((cat) => cat.categoryId === activeTab);

  // Download JSON helper
  const handleDownloadJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(questionnairesData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "ev_engineer_customer_discovery_questionnaires.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div>
      {/* ═══ 1. HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>Discovery Intelligence v1.0</span>
          </div>

          <h1 className={styles.heroTitle}>
            Customer Discovery <br className={styles.desktopBr} /> Intelligence Toolkit
          </h1>

          <p className={styles.heroDesc}>
            A structured framework to run productive, non-leading conversations with EV ecosystem stakeholders. Validate actual battery diagnostics pain patterns, establish warranty/resale trust parameters, and load dynamic JSON questionnaires.
          </p>

          <div className={styles.heroCtas} style={{ marginTop: "2rem" }}>
            <Link
              href="/internships/battery-diagnostics-12-week-plan"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              id="btn-back-to-roadmap"
              data-track-event="toolkit_back_to_roadmap_top_click"
              data-track-label="Back to 12-Week Roadmap - Top"
            >
              Back to 12-Week Roadmap
            </Link>
            <button
              onClick={handleDownloadJSON}
              className="btn btn-primary"
              id="btn-download-top-json"
              data-track-event="toolkit_download_json_top_click"
              data-track-label="Download Toolkit JSON - Top"
            >
              Download Toolkit JSON
            </button>
            <a
              href="https://cage-cameo-46505268.figma.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              id="btn-sample-discovery-poc"
              data-track-event="toolkit_sample_poc_click"
              data-track-label="Sample Discovery POC"
            >
              Sample Discovery POC ↗
            </a>
          </div>
        </div>
      </section>

      {/* ═══ 2. OVERVIEW & STRATEGY (Why It Matters) ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.grid2}>
            {/* Overview */}
            <div className={styles.card}>
              <div className={styles.stepNum}>Introduction</div>
              <h3 className={styles.cardTitle}>Customer Discovery Overview</h3>
              <p className={styles.cardDesc} style={{ marginBottom: "1.25rem" }}>
                Under Week 2 of our Battery Diagnostics Roadmap, our singular goal is to <strong>validate market pain before writing core software.</strong> We bypass theoretical assumptions by listening directly to operators, technicians, dealers, and owners.
              </p>
              <ul className={styles.actionList}>
                <li><strong>Target:</strong> Conduct at least 10 high-quality interviews.</li>
                <li><strong>Dynamic Execution:</strong> Load survey questions dynamically from central configuration files.</li>
                <li><strong>No bias:</strong> Let stakeholders explain operational difficulties in their own words.</li>
              </ul>
            </div>

            {/* Why it Matters */}
            <div className={styles.card}>
              <div className={styles.stepNum}>Strategic Logic</div>
              <h3 className={styles.cardTitle}>Why Customer Discovery Matters</h3>
              <p className={styles.cardDesc} style={{ marginBottom: "1.25rem" }}>
                Building battery intelligence algorithms requires a deep understanding of operational bottlenecks. Without customer validation, we risk overengineering features nobody wants or neglecting critical friction points like used EV financing or warranty claim lags.
              </p>
              <div className={styles.calloutBlock} style={{ padding: "1.25rem", marginBottom: 0, marginTop: "1rem" }}>
                <strong>The Core Philosophy:</strong> “A week of coding can easily save you an hour of customer discovery — but it will cost you months of misaligned efforts.” We align our engineering sprints directly with documented industry urgency.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. INTERVIEW PROCESS TIMELINE ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Methodology</span>
            <h2 className={styles.sectionTitle}>The Structured Interview Process</h2>
            <p className={styles.sectionSubtitle}>
              Follow this three-phase pipeline for every discovery discussion to ensure clean, structured data collection.
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineStep}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineCard}>
                <div className={styles.stepNum}>Phase 01</div>
                <h4 className={styles.stepTitle}>Setup &amp; Context Capture</h4>
                <p className={styles.cardDesc} style={{ marginBottom: "1rem" }}>
                  Establish trust immediately. Clearly state that you are there purely to learn, not to sell any product or platform. Request permission to take notes, photos, or audio recordings.
                </p>
                <div className={styles.infoLabel} style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Key Task:</div>
                <div className={styles.cardDesc} style={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                  Record name, phone number, location, vehicle brand/model, battery type (LFP / NMC), and ecosystem category before starting the questionnaire.
                </div>
              </div>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineCard}>
                <div className={styles.stepNum}>Phase 02</div>
                <h4 className={styles.stepTitle}>Active Listening Questionnaire</h4>
                <p className={styles.cardDesc} style={{ marginBottom: "1rem" }}>
                  Switch to the corresponding category tab below. Read questions slowly, using simple language. Avoid offering examples too quickly; let the participant think and respond in their own words.
                </p>
                <div className={styles.infoLabel} style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Key Task:</div>
                <div className={styles.cardDesc} style={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                  Take detailed notes on exact vocabulary used (e.g. range anxiety, battery calibration, drop in pickup). Record native language choice.
                </div>
              </div>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineCard}>
                <div className={styles.stepNum}>Phase 03</div>
                <h4 className={styles.stepTitle}>Closing &amp; Synthesis</h4>
                <p className={styles.cardDesc} style={{ marginBottom: "1rem" }}>
                  Ask the common final questions regarding pain scales (1-10) and pilot interest. Express gratitude using the thank-you script and schedule potential follow-ups once a diagnostics prototype is prepared.
                </p>
                <div className={styles.infoLabel} style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Key Task:</div>
                <div className={styles.cardDesc} style={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                  Transcribe notes into the central dashboard immediately post-interview to prevent cognitive decay.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. INTERVIEWER RULES ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Core Commandment</span>
            <h2 className={styles.sectionTitle}>Interviewer Rules &amp; Best Practices</h2>
            <p className={styles.sectionSubtitle}>
              Discipline during interviews is non-negotiable. Maintain high objectivity to avoid false positive validation.
            </p>
          </div>

          <div className={styles.grid2}>
            {/* Hard Rules */}
            <div className={styles.card} style={{ borderLeft: "4px solid #ff4d4d" }}>
              <div className={styles.stepNum} style={{ color: "#ff4d4d" }}>Rule Checklist</div>
              <h3 className={styles.cardTitle}>What to AVOID</h3>
              <ul className={styles.actionList} style={{ color: "var(--text-secondary)" }}>
                <li>Do NOT sell a product or pitch an idea. Pitching shifts the client to "feedback mode" rather than "pain disclosure mode."</li>
                <li>Do NOT ask leading questions like “Wouldn't it be great if you had a diagnostics report?”</li>
                <li>Do NOT interrupt the participant when they are describing a workflow or complaint.</li>
                <li>Do NOT argue or attempt to correct the participant if they misunderstand battery physics.</li>
              </ul>
            </div>

            {/* Do Checklist */}
            <div className={styles.card} style={{ borderLeft: "4px solid #4ade80" }}>
              <div className={styles.stepNum} style={{ color: "#4ade80" }}>Rule Checklist</div>
              <h3 className={styles.cardTitle}>What to DO</h3>
              <ul className={styles.checkmarkList}>
                {interviewerInstructions.slice(0, 6).map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. CONTACT INFO CAPTURE TEMPLATE ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Intake Template</span>
            <h2 className={styles.sectionTitle}>Contact &amp; Context Information Template</h2>
            <p className={styles.sectionSubtitle}>
              Capture these parameters systematically before launching into the core questions.
            </p>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Participant Name</span>
              <span className={styles.infoVal}>John Doe</span>
              <span className={styles.infoPlaceholder}>e.g. Fleet Operations Manager</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contact Number</span>
              <span className={styles.infoVal}>+91 98765 43210</span>
              <span className={styles.infoPlaceholder}>Keep secure and separate</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ecosystem Role</span>
              <span className={styles.infoVal}>Used EV Dealer</span>
              <span className={styles.infoPlaceholder}>EV Owner / Fleet Operator / Refurbisher etc.</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vehicle Brand / Model</span>
              <span className={styles.infoVal}>Ather 450X / Ola S1 Pro</span>
              <span className={styles.infoPlaceholder}>Record brand, variant and vehicle age</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Battery Chemistry</span>
              <span className={styles.infoVal}>NMC / LFP / Unknown</span>
              <span className={styles.infoPlaceholder}>Identify if possible</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Primary Location</span>
              <span className={styles.infoVal}>Bengaluru, Karnataka</span>
              <span className={styles.infoPlaceholder}>Record city &amp; neighborhood</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6 & 7. DYNAMIC QUESTIONNAIRE CATEGORY TABS ═══ */}
      <section className={styles.pageSection} id="questionnaires">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Questionnaires</span>
            <h2 className={styles.sectionTitle}>Dynamic Role-Specific Questionnaires</h2>
            <p className={styles.sectionSubtitle}>
              Questions are loaded dynamically from the central JSON configuration file. Wording is preserved exactly.
            </p>
          </div>

          <div className={styles.tabsContainer}>
            {/* Category tabs list */}
            <div className={styles.tabsHeader}>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => setActiveTab(cat.categoryId)}
                  className={`${styles.tabBtn} ${activeTab === cat.categoryId ? styles.tabActive : ""}`}
                  data-track-event="toolkit_category_tab_click"
                  data-track-category-id={cat.categoryId}
                  data-track-label={displayCategoryNames[cat.categoryId] || cat.title}
                >
                  {displayCategoryNames[cat.categoryId] || cat.title}
                </button>
              ))}
            </div>

            {/* Selected category tab panel */}
            {currentCategory && (
              <div className={styles.tabPanel} key={currentCategory.categoryId}>
                <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                  <span className={styles.dbBadge}>{currentCategory.title} Questionnaire</span>
                </div>
                <div>
                  {currentCategory.questions.map((question, qIdx) => (
                    <div className={styles.questionCard} key={qIdx}>
                      <div className={styles.questionNum}>{qIdx + 1}</div>
                      <div className={styles.questionText}>{question}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 8. COMMON FINAL QUESTIONS ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Consolidation</span>
            <h2 className={styles.sectionTitle}>Common Final Questions</h2>
            <p className={styles.sectionSubtitle}>
              Ask these closing questions to quantify pain priority and identify early adopters for pilot testing.
            </p>
          </div>

          <div className={styles.commonGrid}>
            {commonFinalQuestions.map((q, idx) => (
              <div className={styles.questionCard} key={idx}>
                <div className={styles.questionNum} style={{ background: "rgba(0, 245, 160, 0.08)", color: "#00f5a0" }}>
                  F{idx + 1}
                </div>
                <div className={styles.questionText}>{q}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. THANK YOU SCRIPT ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.thankYouScript}>
            <div className={styles.stepNum} style={{ marginBottom: "0.5rem" }}>Closing Script</div>
            <h3 className={styles.cardTitle} style={{ color: "var(--accent-primary)" }}>Thank You Message</h3>
            <blockquote className={styles.thankYouQuote}>
              “{thankYouMessage}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* ═══ 12. INTERACTIVE DASHBOARD MOCKUP ═══ */}
      <section className={styles.pageSectionAlt} id="dashboard">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Analytics Mockup</span>
            <h2 className={styles.sectionTitle}>Discovery Intelligence Dashboard</h2>
            <p className={styles.sectionSubtitle}>
              A simulated look at the future platform showing aggregated insights from completed discovery surveys.
            </p>
          </div>

          <div className={styles.dbWrapper}>
            <div className={styles.dbHeader}>
              <div className={styles.dbTitleBlock}>
                <div className={styles.dbIndicator} />
                <span className={styles.dbTitle}>Active Discovery Intel</span>
              </div>
              <span className={styles.dbBadge}>Week 2 Sprints</span>
            </div>

            <div className={styles.dbGridStats}>
              <div className={styles.dbStatCard}>
                <div className={styles.dbStatVal}>12</div>
                <div className={styles.dbStatLabel}>Interviews Held</div>
              </div>
              <div className={styles.dbStatCard}>
                <div className={styles.dbStatVal}>120%</div>
                <div className={styles.dbStatLabel}>Target Achievement</div>
              </div>
              <div className={styles.dbStatCard}>
                <div className={styles.dbStatVal}>8.4 / 10</div>
                <div className={styles.dbStatLabel}>Avg Pain Score</div>
              </div>
              <div className={styles.dbStatCard}>
                <div className={styles.dbStatVal}>92%</div>
                <div className={styles.dbStatLabel}>Follow-up Rate</div>
              </div>
            </div>

            <div className={styles.dbChartGrid}>
              {/* Pain Point chart */}
              <div className={styles.dbChartCard}>
                <h4 className={styles.dbChartTitle}>Primary Documented Pain Distributions</h4>
                <div className={styles.barChart}>
                  <div className={styles.barRow}>
                    <div className={styles.barLabels}>
                      <span>Range Drop / Sudden Shutdown</span>
                      <strong>85% Urgency</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: "85%" }} />
                    </div>
                  </div>

                  <div className={styles.barRow}>
                    <div className={styles.barLabels}>
                      <span>Used EV Resale Trust deficit</span>
                      <strong>78% Urgency</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: "78%" }} />
                    </div>
                  </div>

                  <div className={styles.barRow}>
                    <div className={styles.barLabels}>
                      <span>BMS Diagnostics Deficiencies</span>
                      <strong>64% Urgency</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: "64%" }} />
                    </div>
                  </div>

                  <div className={styles.barRow}>
                    <div className={styles.barLabels}>
                      <span>Second-Life Battery Grading Lags</span>
                      <strong>58% Urgency</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: "58%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stakeholders breakdown */}
              <div className={styles.dbChartCard}>
                <h4 className={styles.dbChartTitle}>Completed Cohort Mix</h4>
                <div className={styles.donutWrapper}>
                  <div className={styles.donutList}>
                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#4ade80" }} />
                        EV Owner / Rider
                      </span>
                      <span className={styles.donutVal}>3 Surveys</span>
                    </div>

                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#38bdf8" }} />
                        EV Service Center
                      </span>
                      <span className={styles.donutVal}>2 Surveys</span>
                    </div>

                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#fb923c" }} />
                        Used EV Dealer
                      </span>
                      <span className={styles.donutVal}>2 Surveys</span>
                    </div>

                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#a78bfa" }} />
                        Fleet Operator
                      </span>
                      <span className={styles.donutVal}>2 Surveys</span>
                    </div>

                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#f472b6" }} />
                        Battery Refurbisher
                      </span>
                      <span className={styles.donutVal}>2 Surveys</span>
                    </div>

                    <div className={styles.donutItem}>
                      <span className={styles.donutCategory}>
                        <span className={styles.donutColorDot} style={{ background: "#fb7185" }} />
                        EV Startup / OEM
                      </span>
                      <span className={styles.donutVal}>1 Survey</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 13. AI INSIGHT EXAMPLES ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Machine Learning</span>
            <h2 className={styles.sectionTitle}>Simulated AI Insights</h2>
            <p className={styles.sectionSubtitle}>
              Examples of automated text processing extracting structural pain points from unstructured interview audio/text notes.
            </p>
          </div>

          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <span className={styles.insightTitle}>Used EV Resale bottleneck</span>
                <span className={styles.insightUrgency}>High</span>
              </div>
              <p className={styles.insightDesc}>
                "Dealers are unable to close used EV sales due to battery health trust issues. Buyers are afraid of buying a dead battery. A certified SOH grading report is critical for financing approval."
              </p>
              <div className={styles.insightMeta}>
                <div className={styles.insightMetaItem}>👥 2 Dealers</div>
                <div className={styles.insightMetaItem}>🎯 Resale Price impact: 30%</div>
              </div>
            </div>

            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <span className={styles.insightTitle}>Unplanned Fleet Downtime</span>
                <span className={styles.insightUrgency} style={{ color: "#fb923c", borderColor: "rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.08)" }}>Critical</span>
              </div>
              <p className={styles.insightDesc}>
                "Fleet operators lost over ₹12,000 per vehicle last month due to sudden battery shutdowns. They require 30-90 day predictive failure warning systems to optimize battery cycles."
              </p>
              <div className={styles.insightMeta}>
                <div className={styles.insightMetaItem}>👥 2 Fleet Ops</div>
                <div className={styles.insightMetaItem}>🎯 Downtime loss: ₹24,000</div>
              </div>
            </div>

            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <span className={styles.insightTitle}>Technician Diagnostics Gap</span>
                <span className={styles.insightUrgency}>High</span>
              </div>
              <p className={styles.insightDesc}>
                "EV service centers lack reliable tools to diagnose actual cell health. They rely on basic BMS error logs which fail to catch localized micro-short thermal runaways before they develop."
              </p>
              <div className={styles.insightMeta}>
                <div className={styles.insightMetaItem}>👥 2 Techs</div>
                <div className={styles.insightMetaItem}>🎯 Tool Spend: Willing to pay ₹2k/mo</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 11. FUTURE VISION ═══ */}
      <section className={styles.pageSection} style={{ paddingBottom: "7rem" }}>
        <div className="container">
          <div className={styles.card} style={{ borderLeft: "4px solid var(--accent-primary)" }}>
            <div className={styles.stepNum}>Circular Economy Vision</div>
            <h3 className={styles.cardTitle}>Future Discovery Platform Vision</h3>
            <p className={styles.cardDesc} style={{ lineHeight: "1.8" }}>
              Our ultimate objective is to construct a scalable **Circular Discovery Intelligence Hub**. The insights gathered from our manual Week 2 interviews will serve as foundational rules to train natural language models. In future stages, when developers upload unstructured service center logs or used EV dealer transaction records, our automated pipeline will parse and isolate telemetry risk scores, mapping resale and SOH reliability metrics instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
