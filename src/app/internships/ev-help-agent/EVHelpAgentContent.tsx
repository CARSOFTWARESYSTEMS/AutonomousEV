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

const ActivityCard = ({ title, goal, prerequisite, items, tips }: {
  title: string;
  goal?: string;
  prerequisite?: string;
  items: Item[];
  tips?: string[]
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
      <ul className={styles.list}>
        {items.map((item, idx) => renderItem(item, idx))}
      </ul>
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
          <div className={styles.heroPill}><span>AI Support & Diagnostics</span></div>
          <h1 className={styles.heroTitle}>EV Help Agent</h1>
          <p className={styles.heroDesc}>
            Requirement & AI Architectural Design MVP Draft. An AI-powered voice and chat assistant for electric vehicle users, service teams, EV engineers, and support operations.
          </p>
        </div>
      </section>

      {/* SECTION 1: CORE SCOPE */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="1. Core Strategy"
            title="Target Users & MVP Scope"
            subtitle="Focusing on first-level customer support and triage without direct vehicle control."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Target Users"
              goal="Serve End-users and Internal Support"
              items={[
                {
                  label: "EV Users",
                  subItems: ["EV bike, scooter, and car users", "Fleet and delivery riders", "Rural EV users"]
                },
                {
                  label: "Internal Users",
                  subItems: ["EV engineers", "Battery diagnostics engineers", "Service center technicians", "Customer support executives"]
                }
              ]}
            />

            <ActivityCard
              title="2. MVP Scope"
              goal="Safe First-Level Triage"
              items={[
                {
                  label: "In Scope",
                  subItems: [
                    "Voice/chat interactions & Intent classification",
                    "FAQ answering from approved EV knowledge base",
                    "Conversation summaries & Action plan generation",
                    "Ticket creation & Engineer follow-up assignments"
                  ]
                },
                {
                  label: "Out of Scope",
                  subItems: [
                    "Direct lock/unlock control",
                    "Direct BMS or charging control",
                    "High-voltage repair instructions to end users",
                    "Medical/emergency decisions"
                  ]
                }
              ]}
              tips={["Always focus on customer support, never direct hardware actuation for MVP."]}
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
            subtitle="The primary issue types the agent is trained to handle and classify."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Battery Heating Issue"
              items={[
                "Ask vehicle type and charging type",
                "Check for smell, smoke, swelling, sound, warning light",
                "Give safe guidance: stop charging if abnormal heat observed",
                "Create high-priority ticket if safety risk detected",
                "Generate action plan for user and engineer"
              ]}
              tips={["Immediate escalation upon detection of safety risks."]}
            />

            <ActivityCard
              title="2. Range Drop Issue"
              items={[
                "Collect vehicle model, battery age, odometer",
                "Analyze recent charging pattern and full charge range",
                "Identify riding mode, load, and tyre pressure",
                "Output possible reasons and require diagnostic ticket"
              ]}
            />

            <ActivityCard
              title="3. Charging Issue"
              items={[
                "Ask charger type and LED status",
                "Check vehicle display errors and connector condition",
                "Verify power supply and previous successful charge",
                "Escalate immediately if burning smell, spark, or melted connector reported"
              ]}
            />

            <ActivityCard
              title="4. Lock / App Issue"
              items={[
                "Verify app login and Bluetooth status",
                "Check location permissions and phone battery",
                "Analyze lock LED/sound and QR scan success",
                "Output user troubleshooting checklist"
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: FUNCTIONAL & NON-FUNCTIONAL */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="3. Requirements"
            title="Functional & Safety Requirements"
            subtitle="Building blocks of the intelligent conversational engine."
          />

          <div className={styles.grid3}>
            <ActivityCard
              title="1. Conversational AI"
              items={[
                "Real-time voice input/output (Speech-to-text, Text-to-speech)",
                "Context-aware multi-turn conversation",
                "Interrupt handling & Silence detection",
                "Chat fallback for website and app"
              ]}
            />

            <ActivityCard
              title="2. Intelligence Engine"
              items={[
                "Classify issues into 11 precise categories (e.g., Battery Safety, Range)",
                "Dynamic Clarifying Questions based on category",
                "RAG-based answering constrained to approved EV manuals and policies"
              ]}
            />

            <ActivityCard
              title="3. Workflows"
              items={[
                "Generate simple User Summaries",
                "Generate structured JSON Engineer Summaries",
                "Auto-create tickets (EVH-2026-XXXX)",
                "Generate decoupled Action Plans for users and support staff"
              ]}
            />

            <ActivityCard
              title="4. Safety First"
              prerequisite="Safety is the highest priority."
              items={[
                "Never encourage users to open battery packs or bypass BMS",
                "Identify critical symptoms (Smoke, Fire, Swelling, Melted Connector)",
                "Immediate escalation triggers for high-voltage risks"
              ]}
              tips={["Agent must stop normal troubleshooting if critical risk is detected."]}
            />

            <ActivityCard
              title="5. Reliability & Speed"
              items={[
                "Target first response under 2 seconds for voice",
                "Async processing for ticket creation",
                "Support conversation retry and partial transcripts"
              ]}
            />

            <ActivityCard
              title="6. Data Privacy"
              items={[
                "User consent prior to recording",
                "Secure transcript storage",
                "Role-based access control for Engineer Dashboard",
                "Short-term vs Long-term memory separation"
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: AI ARCHITECTURE */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="4. Technical Design"
            title="Multi-Agent Architecture"
            subtitle="Scalable, decoupled AI orchestration and recommended stack."
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Multi-Agent System"
              goal="Decoupled responsibilities for safety and accuracy"
              items={[
                "Greeting Agent",
                "Issue Classifier Agent",
                "Safety Guardrail Agent",
                "Clarifying Question Agent",
                "RAG Answer Agent",
                "Summary & Ticket Generation Agents"
              ]}
              tips={["Routing through an Orchestrator prevents hallucination in critical safety paths."]}
            />

            <ActivityCard
              title="2. Recommended Stack"
              items={[
                { label: "Frontend", subItems: ["Next.js / React"] },
                { label: "Backend", subItems: ["Python FastAPI"] },
                { label: "Voice/Agent", subItems: ["OpenAI Realtime API", "OpenAI Agents SDK / LangGraph"] },
                { label: "Database", subItems: ["Firebase Firestore / Auth"] },
                { label: "Knowledge Base", subItems: ["ChromaDB (MVP)", "Qdrant/pgvector (Production)"] }
              ]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className={styles.pageSection} style={{ textAlign: 'center' }}>
        <div className="container">
          <div className={styles.calloutBlock}>
            <p style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Implementation Contact</p>
            <a href="mailto:info@ev.engineer" style={{ color: '#fff', fontSize: '1.2rem', textDecoration: 'none', fontWeight: '500' }}>info@ev.engineer</a>
          </div>
          <div className={styles.heroCtas}>
            <Link href="/internships" className="btn btn-secondary" data-track-event="ev_help_agent_back_click">Back to Internships</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
