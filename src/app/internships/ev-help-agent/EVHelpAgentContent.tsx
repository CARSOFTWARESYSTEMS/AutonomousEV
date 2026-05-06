"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

const SectionHeader = ({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) => (
  <div className={styles.sectionHeader}>
    <span className={styles.sectionNumber}>{number}</span>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
  </div>
);

type Item = string | { label: string; subItems: (string | { label: string; subItems: string[] })[] };

const ActivityCard = ({ title, goal, prerequisite, items, tips, codeBlock, customContent }: {
  title: string;
  goal?: string;
  prerequisite?: string;
  items?: Item[];
  tips?: string[];
  codeBlock?: string;
  customContent?: React.ReactNode;
}) => {
  const renderItem = (item: Item, idx: number) => {
    if (typeof item === 'string') {
      return <li key={idx}>{item}</li>;
    }
    return (
      <li key={idx}>
        <strong>{item.label}</strong>
        <ul className={styles.subList}>
          {item.subItems.map((si, sidx) => {
            if (typeof si === 'string') {
              return <li key={sidx}>{si}</li>;
            }
            return (
              <li key={sidx}>
                <strong>{si.label}</strong>
                <ul className={styles.subList}>
                  {si.subItems.map((ssi, ssidx) => <li key={ssidx}>{ssi}</li>)}
                </ul>
              </li>
            );
          })}
        </ul>
      </li>
    );
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {goal && <p className={styles.cardMeta}><strong>Goal:</strong> {goal}</p>}
      {prerequisite && <p className={styles.cardMeta}><strong>Context:</strong> {prerequisite}</p>}
      {items && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item, idx) => renderItem(item, idx))}
        </ul>
      )}
      {codeBlock && (
        <pre style={{ background: "rgba(0,0,0,0.5)", padding: "1rem", borderRadius: "8px", overflowX: "auto", margin: "1rem 0", fontSize: "0.85rem", color: "var(--text-secondary)", border: "1px solid var(--color-glass-border)" }}>
          <code>{codeBlock}</code>
        </pre>
      )}
      {customContent && (
        <div style={{ marginTop: "1rem" }}>
          {customContent}
        </div>
      )}
      {tips && tips.map((tip, idx) => (
        <div key={idx} className={styles.tipBlock}>
          <strong>Tip:</strong> {tip}
        </div>
      ))}
    </div>
  );
};

export default function EVHelpAgentContent() {
  return (
    <div className={styles.pageWrapper}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}><span>MVP Technical Requirement</span></div>
          <h1 className={styles.heroTitle}>EV Help Agent</h1>
          <p className={styles.heroDesc}>
            AI-powered voice and chat assistant for electric vehicle users, service teams, EV engineers, and support operations. First-level intelligent support agent for triage and diagnosis.
          </p>
        </div>
      </section>

      {/* SECTION 1: CORE STRATEGY */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="1. Core Strategy"
            title="Executive Summary & Scope"
            subtitle="Defining the problem, target users, and the MVP boundaries."
          />

          <div className={styles.grid3}>
            <ActivityCard
              title="Problem Statement"
              items={[
                "EV users face problems but cannot explain them technically.",
                "Engineers and service teams need structured info to diagnose.",
                "Current support flows are manual, slow, and inconsistent."
              ]}
              tips={["EV Help Agent acts as a first-level intelligent support agent."]}
            />

            <ActivityCard
              title="Target Users"
              items={[
                { label: "EV Users", subItems: ["Bike, scooter, and car users", "Fleet/delivery riders", "Second-life battery users"] },
                { label: "Internal Users", subItems: ["EV engineers", "Diagnostics engineers", "Service center techs", "Admin team"] }
              ]}
            />

            <ActivityCard
              title="MVP Scope"
              items={[
                { label: "In Scope", subItems: ["Voice & Chat conversation", "Issue classification", "FAQ answering via RAG", "Conversation summary", "Ticket & Action plan generation"] },
                { label: "Out of Scope", subItems: ["Direct lock/unlock control", "Direct BMS/charging control", "Medical/emergency decisions", "High-voltage repair instructions"] }
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: KEY USE CASES */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="2. Operational Scenarios"
            title="Key Use Cases"
            subtitle="Specific scenarios the agent must handle."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Battery Heating Issue"
              goal="Stop charging & check safety risks"
              items={[
                "Ask vehicle model and charging type (slow/fast/home/public).",
                "Check for smell, smoke, swelling, sound, warning light.",
                "Give safe guidance: stop charging if abnormal heat observed.",
                "Create high-priority ticket if safety risk detected.",
                "Summarize issue for engineer and create user action plan."
              ]}
            />

            <ActivityCard
              title="2. Range Drop Issue"
              goal="Gather diagnostic data for battery health check"
              items={[
                "Collect vehicle model, battery age, odometer.",
                "Identify recent charging pattern and last full charge range.",
                "Check riding mode, load condition, tyre pressure, weather.",
                "Output possible reasons and data required for diagnosis.",
                "Create ticket for battery health check."
              ]}
            />

            <ActivityCard
              title="3. Charging Issue"
              goal="Diagnose power or hardware failures"
              items={[
                "Ask charger type and charger LED status.",
                "Check vehicle display errors and connector condition.",
                "Verify power supply status and previous successful charge.",
                "Escalation: Create urgent safety ticket if burning smell, spark, or melted connector reported."
              ]}
            />

            <ActivityCard
              title="4. EV Lock / App & Service"
              goal="Resolve connectivity and follow-ups"
              items={[
                { label: "Lock/App Issue", subItems: ["Verify app login, Bluetooth, location permissions.", "Check lock LED/sound, phone battery, network status.", "Provide user troubleshooting checklist."] },
                { label: "Service Follow-Up", subItems: ["Fetch ticket status.", "Summarize pending action.", "Escalate if SLA is breached."] }
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: FUNCTIONAL REQUIREMENTS */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="3. Functional Requirements"
            title="System Capabilities"
            subtitle="The AI intelligence and interaction workflows."
          />

          <div className={styles.grid3}>
            <ActivityCard
              title="1. Voice & Chat Interaction"
              items={[
                "Real-time voice input/output (Speech-to-text, Intent detection, Text-to-speech).",
                "Context-aware multi-turn conversation with interrupt handling.",
                "Chat fallback for web, mobile app, and admin dashboard (WhatsApp later)."
              ]}
            />

            <ActivityCard
              title="2. Issue Classification & Questions"
              items={[
                "Classify into 11 categories (Battery safety, health, charging, range, lock/app, etc.).",
                "Ask required clarifying questions for each category.",
                "Example (Battery Safety): 'Is vehicle charging?', 'Do you see smoke?', 'Is battery swollen?'"
              ]}
            />

            <ActivityCard
              title="3. Knowledge Base Answering (RAG)"
              prerequisite="Answer only from approved sources."
              items={[
                "Sources: EV charging FAQ, Battery safety FAQ, EV.ENGINEER product FAQ.",
                "Sources: User manuals, Troubleshooting guides, Service policies.",
                "Retrieve relevant approved content before answering."
              ]}
            />

            <ActivityCard
              title="4. Summary Generation"
              items={[
                { label: "User Summary", subItems: ["Simple explanation. Ex: 'You reported battery heating... We recommend stopping charging.'"] },
                { label: "Engineer Summary", subItems: ["Structured JSON with issueCategory, priority, symptoms, missingData, and recommended action."] }
              ]}
            />

            <ActivityCard
              title="5. Action Plan Generation"
              items={[
                { label: "User Action Plan", subItems: ["Stop charging if abnormal heat.", "Keep vehicle in safe open area.", "Do not open battery pack.", "Wait for engineer guidance."] },
                { label: "Engineer Action Plan", subItems: ["Review summary.", "Call user.", "Collect BMS data.", "Check thermal condition.", "Update ticket."] }
              ]}
            />

            <ActivityCard
              title="6. Ticket Creation"
              items={[
                "Auto-create support ticket (Ex: EVH-2026-000001).",
                "Fields include priority (low/medium/high/critical), summaries, action plans, status.",
                "Status flows: new -> assigned -> in_progress -> waiting_for_user -> resolved -> closed."
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: NON-FUNCTIONAL & SAFETY */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="4. Non-Functional & Safety"
            title="Safety, Latency & Security"
            subtitle="Ensuring a reliable and protected user experience."
          />

          <div className={styles.grid3}>
            <ActivityCard
              title="1. Safety Guardrails"
              prerequisite="Safety is the highest priority."
              items={[
                "Never encourage users to open battery packs, touch high-voltage components, bypass BMS/chargers.",
                "Escalate immediately for critical symptoms: Smoke, Fire, Burning smell, Swelling, Spark, Melted connector, Extreme heat."
              ]}
              tips={["Agent must stop normal troubleshooting if critical risk is detected."]}
            />

            <ActivityCard
              title="2. Latency & Reliability"
              items={[
                "Voice latency: Target first response under 2 seconds.",
                "Conversation response target: 1–3 seconds.",
                "Async processing: Ticket creation and summary happen post-call.",
                "Reliability: Support retry, network failure handling, and partial transcripts."
              ]}
            />

            <ActivityCard
              title="3. Privacy & Security"
              items={[
                "Privacy-first design with user consent before recording.",
                "Encrypt sensitive data at rest and in transit.",
                "Role-based access control and audit logs for engineer access.",
                "No unnecessary personal data collection."
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: AI ARCHITECTURE */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="5. AI Architecture"
            title="System & Agent Design"
            subtitle="The orchestration layer, data models, and tooling stack."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Multi-Agent Architecture"
              items={[
                { label: "Main EV Help Agent", subItems: ["Greets, asks consent, understands issue, coordinates sub-agents."] },
                { label: "Issue Classifier Agent", subItems: ["Analyzes transcript and outputs category/priority."] },
                { label: "Safety Guardrail Agent", subItems: ["Checks for thermal runaway, fire, shock risks and overrides flow if needed."] },
                { label: "Support Agents", subItems: ["Clarifying Question Agent", "RAG Answer Agent", "Ticket & Summary Agents"] }
              ]}
              codeBlock={`Main EV Help Agent
  +-- Greeting Agent
  +-- Issue Classifier Agent
  +-- Safety Guardrail Agent
  +-- Clarifying Question Agent
  +-- RAG Answer Agent
  +-- Ticket Creation Agent
  +-- Summary Agent`}
            />

            <ActivityCard
              title="2. Conversation Memory & Voice Gateway"
              items={[
                { label: "Short-Term Memory", subItems: ["Active conversation context (issue, vehicle type, symptoms)."] },
                { label: "Long-Term Memory", subItems: ["Stored with consent (vehicle profile, previous tickets, battery health history)."] },
                { label: "Voice Gateway Options", subItems: ["Option A: OpenAI Realtime API (Fastest latency)", "Option B: OpenAI Agents SDK Voice Pipeline", "Option C: Twilio Media Streams (Phone calls)"] }
              ]}
            />
            
            <ActivityCard
              title="3. Recommended Stack (MVP)"
              items={[
                { label: "Frontend", subItems: ["Next.js / React"] },
                { label: "Backend & Orchestration", subItems: ["Python FastAPI", "OpenAI Realtime API", "OpenAI Agents SDK / LangGraph"] },
                { label: "Data & Hosting", subItems: ["Firebase Firestore / Auth / Storage", "Google Cloud Run / Firebase Hosting"] },
                { label: "RAG & Vector DB", subItems: ["ChromaDB (MVP)", "Qdrant/pgvector (Production)"] }
              ]}
            />

            <ActivityCard
              title="4. Data Model (Firestore)"
              items={[
                "Collections: users/, vehicles/, conversations/, tickets/, engineers/, knowledgeBase/",
                { label: "Conversation Doc", subItems: ["transcript[], detectedIssueCategory, riskLevel, summary, engineerSummary, status"] },
                { label: "Vehicle Profile", subItems: ["vehicleType, manufacturer, batteryType, batteryCapacity, purchaseDate"] }
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 6: DEVELOPMENT & TESTING */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="6. Project Roadmap"
            title="Development Plan & Metrics"
            subtitle="Phases, testing strategy, and success criteria."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Development Phases"
              items={[
                { label: "Phase 1: Requirement Finalization", subItems: ["Final use cases, safety rules, FAQ list, schemas. (1-2 weeks)"] },
                { label: "Phase 2: MVP Prototype", subItems: ["Web chat, basic voice, classification, basic RAG, ticket creation. (3-4 weeks)"] },
                { label: "Phase 3: Engineer Dashboard", subItems: ["Ticket list, details, summary view, status updates. (2-3 weeks)"] },
                { label: "Phase 4: Voice Optimization", subItems: ["Latency improvements, interruption handling, multilingual support. (2-3 weeks)"] },
                { label: "Phase 5: Pilot Testing", subItems: ["20 EV users, 5 engineers, 50-100 sample conversations. (2-4 weeks)"] }
              ]}
            />

            <ActivityCard
              title="2. Verification & Testing"
              items={[
                { label: "Safety Testing", subItems: ["Agent must escalate inputs like 'Battery is smoking' and refuse unsafe bypass requests."] },
                { label: "RAG Accuracy", subItems: ["No hallucinations; must state 'I need an engineer to verify' if knowledge is missing."] },
                { label: "Functional & Voice", subItems: ["Test heating, range drop, lock failures.", "Measure speech recognition, latency, and noise handling."] }
              ]}
            />

            <ActivityCard
              title="3. MVP Success Metrics"
              customContent={
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)" }}>Issue classification accuracy</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)", color: "var(--accent-primary)", fontWeight: "bold" }}>&gt; 85%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)" }}>Critical safety escalation accuracy</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)", color: "var(--accent-primary)", fontWeight: "bold" }}>&gt; 95%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)" }}>Useful engineer summary rating</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)", color: "var(--accent-primary)", fontWeight: "bold" }}>&gt; 4/5</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)" }}>Voice conversation completion</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)", color: "var(--accent-primary)", fontWeight: "bold" }}>&gt; 80%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)" }}>Average response latency</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--glass-border)", color: "var(--accent-primary)", fontWeight: "bold" }}>&lt; 3 seconds</td>
                    </tr>
                  </tbody>
                </table>
              }
            />

            <ActivityCard
              title="4. Risk Analysis & Future Scope"
              items={[
                { label: "Technical Risks", subItems: ["Voice latency (Mitigation: use real-time audio streaming).", "Hallucinations (Mitigation: strict RAG guardrails)."] },
                { label: "Business Risks", subItems: ["Users expect full diagnosis (Mitigation: strictly position as first-level triage)."] },
                { label: "Future Enhancements", subItems: ["Multilingual support (Kannada, Hindi, Tamil).", "WhatsApp and Twilio phone integration.", "EV diagnostic hardware & BMS data upload.", "EV Battery Aadhaar integration & Service center sync."] }
              ]}
              tips={["Start with text-based flow -> Add safety -> Add voice -> Pilot with real users."]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className={styles.pageSection} style={{ textAlign: 'center' }}>
        <div className="container">
          <div className={styles.heroCtas}>
            <Link href="/internships" className="btn btn-secondary" data-track-event="ev_help_agent_back_click">Back to Internships</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
