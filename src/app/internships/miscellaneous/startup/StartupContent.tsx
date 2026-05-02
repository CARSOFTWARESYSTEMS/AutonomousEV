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
      {prerequisite && <p className={styles.cardMeta}><strong>Prerequisite:</strong> {prerequisite}</p>}
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

export default function StartupContent() {
  return (
    <div className={styles.pageWrapper}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}><span>Business Strategy</span></div>
          <h1 className={styles.heroTitle}>EV Startup - Building Organisational Structure</h1>
          <p className={styles.heroDesc}>
            7 Fundamental Activities to build a stable and successful EV business and 3 Key Changes to ensure growth without the startup owner.
          </p>
        </div>
      </section>

      {/* SECTION 1 */}
      <section className={styles.pageSection}>
        <div className="container">
          <SectionHeader
            number="Fundamental Framework"
            title="7 Fundamental Activities"
            subtitle="The bedrock of a stable and successful EV business"
          />

          <div className={styles.grid2}>
            <ActivityCard
              title="1. Marketing"
              goal="Lead Generation"
              prerequisite="Understand the product, features or service which we are marketing"
              items={[
                "How we can solve customer problem?",
                "Grab Attention",
                "Add Values",
                "Establish Credibility",
                "Build a Relationship",
                "Generate Leads (Enquiry)"
              ]}
              tips={[
                "Social Media -> Education vs Entertainment vs Story Telling",
                "WhatsApp, Instagram, Facebook, LinkedIn, YouTube"
              ]}
            />

            <ActivityCard
              title="2. Sales"
              goal="Revenue Generation"
              prerequisite="Understand the product, features or service which we are selling"
              items={[
                "Understand the customer requirements.",
                "Pitch the product or Service",
                "Handle Objections",
                "Make the offer",
                "Negotiate & close the deal",
                "Revenue Generation"
              ]}
              tips={["Understand customers needs, dreams and challenges"]}
            />

            <ActivityCard
              title="3. Operations"
              prerequisite="Understand the product, features or service which we are selling"
              items={[
                "Deliver Value",
                "Happiness",
                { label: "Research & Development", subItems: ["New Product", "New Service"] }
              ]}
            />

            <ActivityCard
              title="4. Legal"
              items={[
                { label: "Contracts", subItems: ["Customer contracts", "Employee contracts", "Vendor contracts"] }
              ]}
            />

            <ActivityCard
              title="5. Accounts"
              items={["Accuracy", "Compliance", "Reporting"]}
            />

            <ActivityCard
              title="6. Human Resources"
              items={["Recruitment", "People Development", "Happiness", "Retention", "Culture Building"]}
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <ActivityCard
              title="7. Management"
              items={[
                {
                  label: "Strategy Management",
                  subItems: [
                    "Holistic Goals -> Financial & Functional",
                    "Business Model -> Profitable & Scalable"
                  ]
                },
                {
                  label: "Functional Management",
                  subItems: [
                    "STRATEGY -> To achieve results",
                    "SYSTEMS -> To track & achieve consistency & quality",
                    "Team building",
                    "System Building",
                    "Revenue Generation",
                    "Review"
                  ]
                },
                {
                  label: "People Management",
                  subItems: [
                    "Hire based on A.S.K. (Attitude, Skills, Knowledge)",
                    "Develop People via consistent, Respectful, Specific Feedback",
                    {
                      label: "Scientific Salary Appraisals (Transparent Appraisal System)",
                      subItems: [
                        "Result Goals",
                        "Attitude, Skill & Knowledge Goals",
                        "Monthly review & feedback system (1:1 reviews)"
                      ]
                    },
                    "Fire the wrong people (cheating, stealing, & Sexual Harassment)"
                  ]
                }
              ]}
              tips={[
                "Business Model canvas",
                "Never hire for job title, instead list the tasks for each activities.",
                "Hire based on A.S.K.: Assessment (A->Attitude), Assignments (S->Skills), Test paper (K->Knowledge)"
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <SectionHeader
            number="Scaling Framework"
            title="3 Key Changes"
            subtitle="To Build a Business to Grow without Startup Owner"
          />

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>1. Enhance Clarity</h3>
              <ul className={styles.list}>
                <li>Business Financial Goals (Ex. 100cr in 5 years)</li>
                <li>Functional Goals for all 7 functions (Marketing, Sales, Operations, Legal, Accounts, HR, Management)</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>2. Enhance Capability</h3>
              <ul className={styles.list}>
                <li><strong>STRATEGY:</strong> Learn how to create a scalable & profitable business model</li>
                <li><strong>SYSTEM:</strong> Learn how to design functional systems</li>
                <li><strong>TEAMS:</strong> Learn how to hire, develop, appraise, fire</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>3. Enhance Courage</h3>
              <ul className={styles.list}>
                <li>To give</li>
                <li>To make decisions</li>
                <li>To invest (Money for R&D, Innovation, Learning, Skills Development, Marketing)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className={styles.pageSection} style={{ textAlign: 'center' }}>
        <div className="container">
          <div className={styles.calloutBlock}>
            <p style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>Reference &amp; CREDITS</p>
            <a href="mailto:rajivtalreja@quantumleap.co.in" style={{ color: '#fff', fontSize: '1.2rem', textDecoration: 'none', fontWeight: '500' }}>rajivtalreja@quantumleap.co.in</a>
          </div>
          <div className={styles.heroCtas}>
            <Link href="/internships" className="btn btn-secondary" data-track-event="startup_back_click">Back to Internships</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
