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
        <pre style={{ background: "rgba(0,0,0,0.5)", padding: "1rem", borderRadius: "8px", overflowX: "auto", margin: "1rem 0", fontSize: "0.85rem", color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}>
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

// Flow Diagram Node Types
type FlowNodeDef = { label: string; active?: boolean };
const FlowDiagram = ({ nodes, direction = "horizontal" }: { nodes: (FlowNodeDef | FlowNodeDef[])[], direction?: "horizontal" | "vertical" }) => {
  return (
    <div className={styles.flowDiagram}>
      <div style={{ display: "flex", flexDirection: direction === "horizontal" ? "row" : "column", alignItems: "center", gap: "1rem", flexWrap: direction === "horizontal" ? "wrap" : "nowrap", justifyContent: "center" }}>
        {nodes.map((nodeGroup, idx) => {
          const isArray = Array.isArray(nodeGroup);
          const group = isArray ? nodeGroup : [nodeGroup];
          return (
            <React.Fragment key={idx}>
              <div className={isArray ? styles.flowGroup : ""} style={isArray ? { flexDirection: direction === "horizontal" ? "column" : "row" } : {}}>
                {group.map((n, i) => (
                  <div key={i} className={`${styles.flowNode} ${n.active ? styles.flowNodeActive : ""}`}>
                    {n.label}
                  </div>
                ))}
              </div>
              {idx < nodes.length - 1 && (
                <div className={direction === "horizontal" ? styles.flowArrow : styles.flowVerticalArrow}>
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Comparison Card
const ComparisonCard = ({ title, highlight, items }: { title: string, highlight?: boolean, items: string[] }) => (
  <div className={`${styles.comparisonCard} ${highlight ? styles.highlight : ''}`}>
    <h3 className={styles.comparisonTitle}>{title}</h3>
    <ul className={styles.comparisonList}>
      {items.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </div>
);

// Timeline
const Timeline = ({ phases }: { phases: { phase: string, title: string, desc: string }[] }) => (
  <div className={styles.timeline}>
    {phases.map((p, idx) => (
      <div key={idx} className={styles.timelineItem}>
        <div className={styles.timelineDot} />
        <div className={styles.timelineContent}>
          <div className={styles.timelinePhase}>{p.phase}</div>
          <div className={styles.timelineTitle}>{p.title}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>{p.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

export default function EVHelpAgentContent() {
  return (
    <div className={styles.pageWrapper}>
      {/* PREMIUM HERO */}
      <section className={styles.hero}>
        <div className={styles.heroAnimatedBg}>
          <div className={styles.particle} style={{ top: "40%", left: "20%", animationDelay: "0s" }} />
          <div className={styles.particle} style={{ top: "60%", left: "70%", animationDelay: "1s" }} />
          <div className={styles.particle} style={{ top: "30%", left: "80%", animationDelay: "2s" }} />
          <div className={styles.particle} style={{ top: "80%", left: "30%", animationDelay: "3s" }} />
        </div>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}><span>AI-Native Engineering Platform</span></div>
          <h1 className={styles.heroTitle}>EV Help Agent</h1>
          <p className={styles.heroDesc}>
            The future AI infrastructure for EV engineering. A world-class Agentic AI Voice & Diagnostics platform powering next-generation battery intelligence, triage workflows, and autonomous support ecosystems.
          </p>
          <div className={styles.waveformContainer}>
            <div className={styles.waveBar} style={{ animationDelay: "0.1s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.3s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.2s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.5s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="container" style={{ paddingBottom: "2rem" }}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>11</div>
            <div className={styles.metricLabel}>Diagnostics Categories</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>9+</div>
            <div className={styles.metricLabel}>AI Agents Orchestrated</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>&lt;2s</div>
            <div className={styles.metricLabel}>Voice Latency Target</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>100%</div>
            <div className={styles.metricLabel}>Battery Intelligence Ready</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SYSTEM ARCHITECTURE DIAGRAMS */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="1. Agentic AI Ecosystem"
            title="System Architecture"
            subtitle="Premium engineering-grade flow architectures powering the intelligence layer."
          />

          <ActivityCard
            title="Diagram 1 — End-to-End EV Help Agent Architecture"
            customContent={
              <FlowDiagram 
                nodes={[
                  { label: "EV User" },
                  { label: "Voice/Text Interface" },
                  { label: "API Gateway" },
                  { label: "AI Orchestrator", active: true },
                  [
                    { label: "Multi-Agent System" },
                    { label: "Tool Calling Layer" },
                    { label: "RAG Engine" },
                    { label: "Diagnostics Engine" },
                    { label: "Safety Validation" },
                    { label: "Summary Generator" }
                  ],
                  { label: "Ticketing System" },
                  { label: "Human EV Engineer" }
                ]}
              />
            }
            tips={["AI-native architecture", "Scalable system", "Realtime AI orchestration", "Telemetry-ready platform"]}
          />
          <div style={{ marginBottom: "2rem" }} />

          <ActivityCard
            title="Diagram 2 — AI Multi-Agent Architecture"
            goal="Powered by Agentic AI Architecture"
            customContent={
              <FlowDiagram 
                direction="vertical"
                nodes={[
                  { label: "Main AI Orchestrator", active: true },
                  [
                    { label: "Conversation Agent" },
                    { label: "Intent Detection" },
                    { label: "Diagnostics Agent" },
                    { label: "Battery Intelligence" }
                  ],
                  [
                    { label: "Safety Agent", active: true },
                    { label: "Knowledge Agent" },
                    { label: "Action Planning" },
                    { label: "Summary Agent" },
                    { label: "Escalation Agent" }
                  ]
                ]}
              />
            }
          />

          <div style={{ marginTop: "4rem" }}>
            <SectionHeader
              number=""
              title="Multi-Agent AI System"
              subtitle="The platform is NOT a simple chatbot. It utilizes a decoupled Agentic AI architecture."
            />
            <div className={styles.grid3}>
              <ActivityCard title="Conversation Agent" items={["Manages natural dialogue.", "Maintains multi-turn context.", "Future: Multilingual support."]} />
              <ActivityCard title="Intent Detection Agent" items={["Analyzes transcripts for goals.", "Classifies into 11 categories.", "Future: Predictive intent."]} />
              <ActivityCard title="EV Diagnostics Agent" items={["Queries symptom logic.", "Identifies vehicle failures.", "Future: Telemetry integration."]} />
              <ActivityCard title="Battery Intelligence Agent" items={["Analyzes SOH/SOC context.", "Flags battery degradation.", "Future: SI-EMS sync."]} />
              <ActivityCard title="Safety Agent" items={["Detects thermal runaway risks.", "Overrides unsafe workflows.", "Future: Automated BMS shutdown."]} active />
              <ActivityCard title="Knowledge Retrieval Agent" items={["Executes semantic searches.", "Retrieves EV SOPs and manuals.", "Future: Real-time dynamic indexing."]} />
              <ActivityCard title="Action Planning Agent" items={["Generates user action plans.", "Generates engineer action plans.", "Future: Automated dispatch."]} />
              <ActivityCard title="Summary Agent" items={["Generates human-readable summaries.", "Creates structured JSON summaries.", "Future: Voice-memo generation."]} />
              <ActivityCard title="Escalation Agent" items={["Routes critical issues to humans.", "Monitors AI confidence levels.", "Future: Live-agent handoff APIs."]} />
            </div>
          </div>

          <div style={{ marginTop: "4rem", marginBottom: "2rem" }} className={styles.grid2}>
            <ActivityCard
              title="Diagram 3 — Voice AI Pipeline"
              customContent={
                <FlowDiagram 
                  direction="vertical"
                  nodes={[
                    { label: "Browser Microphone" },
                    { label: "Audio Streaming" },
                    { label: "Speech-to-Text" },
                    { label: "LLM Processing (Realtime)", active: true },
                    { label: "Tool Calling" },
                    { label: "AI Reasoning" },
                    { label: "Text-to-Speech" },
                    { label: "Voice Playback" }
                  ]}
                />
              }
              tips={["Low-latency labels", "Realtime indicators", "Streaming effects"]}
            />
            <ActivityCard
              title="Diagram 4 — EV Battery Intelligence Flow"
              customContent={
                <FlowDiagram 
                  direction="vertical"
                  nodes={[
                    { label: "Battery Telemetry (CAN/MQTT)" },
                    { label: "AI Diagnostics Engine", active: true },
                    [
                      { label: "Thermal Analysis" },
                      { label: "SOH/SOC Analysis" }
                    ],
                    { label: "Risk Detection & Safety Validation" },
                    { label: "Alerts & Recommendations" },
                    { label: "Engineering Dashboard" }
                  ]}
                />
              }
              tips={["Future integration with EV Battery Intelligence Platform and Battery Pack Aadhaar systems."]}
            />
          </div>

          <div className={styles.grid2}>
            <ActivityCard
              title="Diagram 5 — Engineering Workflow"
              customContent={
                <FlowDiagram 
                  direction="vertical"
                  nodes={[
                    { label: "Issue Detection" },
                    { label: "AI Conversation" },
                    { label: "Diagnostics & Risk Assessment", active: true },
                    { label: "Action Plan & Ticket Creation" },
                    { label: "Human Escalation" },
                    { label: "Resolution & AI Learning Feedback Loop" }
                  ]}
                />
              }
            />
            <ActivityCard
              title="Diagram 6 — RAG Knowledge Architecture"
              customContent={
                <FlowDiagram 
                  direction="vertical"
                  nodes={[
                    { label: "EV Documents (SOPs, Manuals, Guides)" },
                    { label: "Chunking & Embeddings" },
                    { label: "Vector Database (Semantic Search)" },
                    { label: "Context Injection", active: true },
                    { label: "AI Response" }
                  ]}
                />
              }
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: CORE STRATEGY (Restored PRD) */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="2. Core Strategy"
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

      {/* SECTION 3: WHY THIS PLATFORM IS DIFFERENT */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="3. Differentiators"
            title="Why This Platform is Different"
            subtitle="Moving from legacy rule-based customer support to agentic battery intelligence."
          />

          <div className={styles.comparisonGrid}>
            <ComparisonCard 
              title="Traditional Support Systems"
              items={[
                "Rule-based IVR & chatbots",
                "Static FAQ responses",
                "No diagnostics intelligence",
                "No EV awareness",
                "No battery intelligence",
                "No AI orchestration layer"
              ]}
            />
            <ComparisonCard 
              title="EV Help Agent (EV.ENGINEER)"
              highlight={true}
              items={[
                "AI-native & Voice-first",
                "Diagnostics-aware reasoning",
                "Battery intelligence ready",
                "Agentic AI workflows",
                "Engineering-grade escalation",
                "Telemetry-ready for future autonomous workflows"
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: USE CASES & TOOL CALLING */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="4. Operations"
            title="Key Use Cases & Tool Calling Flow"
            subtitle="How Agentic AI differs by actively utilizing engineering tools to solve real EV scenarios."
          />

          <ActivityCard
            title="AI Tool Calling Flow"
            items={[
              "The AI Agent dynamically selects which tool to execute based on conversational context.",
              { label: "Diagnostics Tool", subItems: ["Queries specific vehicle symptoms.", "Future: Automated DTC code extraction."] },
              { label: "Knowledge Tool", subItems: ["Searches vector DB for SOPs.", "Future: Sync with external OEM databases."] },
              { label: "Ticketing Tool", subItems: ["Generates structured support JSONs.", "Future: JIRA/Zendesk API webhooks."] },
              { label: "Telemetry Tool", subItems: ["Fetches realtime CAN data.", "Future: MQTT stream ingestion."] },
              { label: "Notification Tool", subItems: ["Alerts engineers.", "Future: Webhooks for incident response."] },
              { label: "Analytics Tool", subItems: ["Logs session telemetry.", "Future: Fleet-wide dashboard insights."] }
            ]}
            customContent={
              <FlowDiagram 
                direction="horizontal"
                nodes={[
                  { label: "User Input" },
                  { label: "AI Agent", active: true },
                  [
                    { label: "Diagnostics Tool" },
                    { label: "Knowledge Tool" },
                    { label: "Ticketing Tool" },
                    { label: "Telemetry Tool" },
                    { label: "Notification Tool" },
                    { label: "Analytics Tool" }
                  ]
                ]}
              />
            }
          />
          
          <div style={{ marginTop: "4rem", marginBottom: "2rem" }}>
            <SectionHeader
              number=""
              title="Real-World Use Cases"
              subtitle="Premium use-case examples driving the AI platform."
            />
            <div className={styles.grid3}>
              <ActivityCard title="EV Battery Overheating" items={["Identifies abnormal heat.", "Provides safe stop instructions.", "Creates high-priority tickets."]} />
              <ActivityCard title="Fast Charging Issue" items={["Diagnoses charger handshakes.", "Checks display error codes.", "Escalates connector melting risks."]} />
              <ActivityCard title="BMS Warning Detection" items={["Interprets dashboard warning lights.", "Cross-references with SOPs.", "Routes to diagnostics engineer."]} />
              <ActivityCard title="Battery Degradation Analysis" items={["Collects odometer and age data.", "Analyzes charging patterns.", "Recommends SOH checks."]} />
              <ActivityCard title="Thermal Runaway Alerts" items={["Detects smoke/swelling reports.", "Overrides normal workflows.", "Initiates critical human escalation."]} active />
              <ActivityCard title="EV Range Reduction" items={["Analyzes load and tyre pressure.", "Checks recent full charge limits.", "Outputs possible environmental reasons."]} />
              <ActivityCard title="Fleet Diagnostics" items={["Handles multi-vehicle contexts.", "Prioritizes based on SLA.", "Future: Fleet dashboard sync."]} />
              <ActivityCard title="AI-Powered EV Support" items={["Replaces legacy IVR.", "Answers complex technical FAQs.", "Improves first-call resolution."]} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FUNCTIONAL REQUIREMENTS (Restored PRD) */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="5. System Capabilities"
            title="Functional Requirements"
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

      {/* SECTION 6: ENTERPRISE STANDARDS & SAFETY */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="6. Enterprise Standards"
            title="Safety, Observability & Readiness"
            subtitle="Engineering-grade credibility and production-ready safeguards."
          />

          <div className={styles.grid3}>
            <ActivityCard
              title="Safety-First AI"
              items={[
                "Thermal runaway risk detection.",
                "Unsafe recommendation prevention.",
                "Escalation-first safety model.",
                "Engineering validation workflows.",
                "Strict AI safety guardrails & Battery safety prioritization."
              ]}
              tips={["Agent must stop normal troubleshooting if critical risk is detected."]}
            />
            <ActivityCard
              title="Observability & Monitoring"
              items={[
                "LangSmith & OpenTelemetry.",
                "AI execution tracing and Prompt monitoring.",
                "Real-time latency monitoring.",
                "System health dashboards.",
                "Hallucination tracking."
              ]}
            />
            <ActivityCard
              title="Enterprise Readiness"
              items={[
                "Scalable & Modular architecture.",
                "Role-Based Access Control (RBAC).",
                "Audit logging.",
                "API-first architecture.",
                "Cloud-native deployment.",
                "Future multi-tenant support."
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: AI ARCHITECTURE & TECHNOLOGY STACK */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="7. Infrastructure"
            title="AI Architecture & Technology Stack"
            subtitle="Premium modern stack enabling ultra-low latency EV interactions and robust data models."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Conversation Memory & Data Model"
              items={[
                { label: "Short-Term Memory", subItems: ["Active conversation context (issue, vehicle type, symptoms)."] },
                { label: "Long-Term Memory", subItems: ["Stored with consent (vehicle profile, previous tickets, battery health history)."] },
                { label: "Firestore Collections", subItems: ["users/, vehicles/, conversations/, tickets/, engineers/, knowledgeBase/"] },
                { label: "Conversation Doc", subItems: ["transcript[], detectedIssueCategory, riskLevel, summary, engineerSummary, status"] }
              ]}
            />
            <ActivityCard
              title="2. Future Telemetry Integration"
              items={[
                "Ingestion of realtime CAN data.",
                "MQTT stream processing.",
                "Battery telemetry & BMS integration.",
                "GPS tracking and geolocation workflows.",
                "IoT diagnostics and realtime battery analytics."
              ]}
              tips={["Paving the way for fully autonomous diagnostics ecosystems."]}
            />
          </div>

          <div style={{ marginTop: "2rem" }} className={styles.grid2}>
            <ActivityCard
              title="Frontend Stack"
              items={["Next.js", "React", "TypeScript", "Tailwind CSS", "EV.ENGINEER UI System"]}
            />
            <ActivityCard
              title="AI Stack"
              items={["GPT-5", "OpenAI Realtime API", "Whisper", "LangGraph & LangChain", "Embeddings & Vector Database"]}
            />
            <ActivityCard
              title="Backend Stack"
              items={["FastAPI", "Firebase", "PostgreSQL", "ChromaDB", "Cloud Run"]}
            />
            <ActivityCard
              title="Future EV Stack"
              items={["MQTT", "CAN Bus", "ESP32", "BMS Integration", "IoT Telemetry", "EV Diagnostics APIs"]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 8: VISION & ROADMAP */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="8. Vision"
            title="Future Roadmap & EV Integrations"
            subtitle="Development phasing, rigorous testing strategy, and the long-term EV integration."
          />

          <Timeline 
            phases={[
              { phase: "Phase 1", title: "Voice AI & Chat AI", desc: "Core conversation engine, intent classification, and conversation summaries." },
              { phase: "Phase 2", title: "Diagnostics Intelligence", desc: "Ticketing workflows and safety engine implementation." },
              { phase: "Phase 3", title: "Agentic AI Orchestration", desc: "Multi-agent tool calling, dynamic problem solving, and AI escalation workflows." },
              { phase: "Phase 4", title: "EV Battery Intelligence", desc: "Integration with BMS telemetry, telemetry ingestion, and predictive diagnostics." },
              { phase: "Phase 5", title: "Autonomous EV Engineering", desc: "Autonomous EV engineering infrastructure, AI engineering copilot, and full EV intelligence ecosystem." }
            ]}
          />

          <div style={{ marginTop: "4rem" }}>
            <ActivityCard
              title="Final Vision"
              items={[
                "EV Help Agent is evolving into a next-generation AI-native EV Engineering Platform focused on:",
                { label: "Focus Areas", subItems: ["EV diagnostics intelligence", "Battery safety intelligence", "Agentic AI workflows", "Autonomous engineering support", "EV telemetry intelligence", "Battery lifecycle intelligence", "Future EV infrastructure automation"] },
                "The long-term vision is to build the foundational AI infrastructure layer for the future EV ecosystem."
              ]}
              tips={["EV.ENGINEER is building the future AI infrastructure for EV engineering."]}
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
