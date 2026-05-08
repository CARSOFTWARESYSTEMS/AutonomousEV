"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { trackEvent } from "@/utils/analytics";

// --- COMPETENCY MATRIX DATA ---
const COMPETENCY_MATRIX = [
  {
    tab: "ITI / Technician",
    roles: [
      "EV Service Technician",
      "Battery Repair Technician",
      "Charging Station Technician",
      "EV Diagnostics Technician",
    ],
    skills: ["Wiring", "Diagnostics Tools", "Safety Procedures", "Battery Inspection", "Repair Workflows"],
  },
  {
    tab: "Diploma Engineering",
    roles: [
      "EV Test Engineer",
      "Embedded Support Engineer",
      "Battery Assembly Engineer",
      "Service Diagnostics Engineer",
    ],
    skills: ["Electronics", "CAN Basics", "Testing", "Diagnostics", "Embedded Basics"],
  },
  {
    tab: "BE / BTech",
    roles: [
      "BMS Engineer",
      "EV Software Engineer",
      "Embedded Engineer",
      "Telematics Engineer",
      "Battery Systems Engineer",
      "Vehicle Integration Engineer",
    ],
    skills: ["Embedded Systems", "CAN Protocol", "Battery Systems", "Software Architecture", "Diagnostics", "Telemetry"],
  },
  {
    tab: "MCA / Software",
    roles: [
      "EV Application Engineer",
      "Cloud & Telematics Engineer",
      "Fleet Platform Engineer",
      "Mobility Software Engineer",
    ],
    skills: ["Backend Systems", "Mobile Apps", "Cloud Integration", "APIs", "Telemetry Platforms"],
  },
  {
    tab: "MBA / Operations",
    roles: [
      "EV Program Manager",
      "EV Operations Lead",
      "Charging Infrastructure Manager",
      "Mobility Operations Manager",
    ],
    skills: ["Operations", "Analytics", "Project Management", "EV Ecosystem Understanding"],
  },
  {
    tab: "MTech / MS",
    roles: [
      "Battery Intelligence Engineer",
      "Energy Systems Engineer",
      "Advanced Diagnostics Engineer",
      "AI-assisted Engineering Specialist",
    ],
    skills: ["Systems Engineering", "Analytics", "Simulations", "Advanced Battery Systems", "Energy Optimization"],
  },
  {
    tab: "PhD / Research",
    roles: [
      "EV Research Scientist",
      "Battery Research Engineer",
      "Advanced Energy Systems Researcher",
      "Mobility Innovation Scientist",
    ],
    skills: ["Research Methodology", "Advanced Simulations", "Modeling", "Optimization", "Publications"],
  },
  {
    tab: "Leadership & Architecture",
    roles: [
      "EV Technical Architect",
      "Engineering Manager",
      "EV Technology Lead",
      "Battery Platform Architect",
      "Chief Engineer",
      "Mobility Systems Architect",
    ],
    skills: ["Systems Architecture", "Leadership", "Technical Strategy", "Cross-functional Engineering", "Scalable System Design"],
  },
];

interface EVCareerContentProps {
  groupedCompanies: Record<string, any[]>;
}

export default function EVCareerContent({ groupedCompanies }: EVCareerContentProps) {
  const disclaimerRef = useRef<HTMLDivElement>(null);
  const hasSeenDisclaimer = useRef(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(groupedCompanies).forEach((key, index) => {
      initial[key] = index === 0;
    });
    return initial;
  });

  const allExpanded = Object.values(expandedSections).every(Boolean);

  const toggleAll = () => {
    const newState: Record<string, boolean> = {};
    Object.keys(groupedCompanies).forEach(key => {
      newState[key] = !allExpanded;
    });
    setExpandedSections(newState);
  };

  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    trackEvent("page_view", {
      page_title: "EV Career",
      page_path: "/ev-career"
    });

    const currentRef = disclaimerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasSeenDisclaimer.current) {
          hasSeenDisclaimer.current = true;
          trackEvent("disclaimer_view", { page: "/ev-career" });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleAcknowledgment = (company: string) => {
    if (hasSeenDisclaimer.current) {
      trackEvent("disclaimer_acknowledged_click", { company, page_path: "/ev-career" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span style={{ color: 'var(--accent-primary)' }}>EV Jobs & Career</span> Opportunities
        </h1>
        <p className={styles.subtitle}>
          Building <strong className="glowing-text">World-Class Engineers</strong> to Solve <strong className="glowing-text">Energy</strong> and <strong className="glowing-text">EV Battery</strong> Challenges
        </p>
        <div className={styles.disclaimerShort}>
          <span>EV.ENGINEER™ is an independent learning platform. We are not affiliated with listed companies and do not guarantee job placements.</span>
        </div>
      </div>

      <div className={styles.controlsHeader}>
        <div className={styles.controlsLeft}>
          <Link
            href="/workshop?ref=career"
            className={`btn btn-secondary ${styles.actionBtn}`}
            data-track-event="ev_career_job_oriented_training_click"
          >
            EV Workshops
          </Link>
          <a
            href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20EV%20Certificates%20and%20Job%20Oriented%20Training%20programs%20on%20EV.ENGINEER%E2%84%A2.%20Could%20you%20please%20provide%20more%20information%3F"
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.actionBtn}`}
            data-track-event="ev_career_whatsapp_training_certificate_click"
          >
            EV Training & Certificates
          </a>
          <a
            href="mailto:info@iTelematics.com?subject=Resume%20Submission%20%E2%80%94%20EV%20Career%20Opportunities&body=Hi%20Team%2C%0A%0AI%20came%20across%20EV.ENGINEER%E2%84%A2%20and%20would%20like%20to%20submit%20my%20resume%20for%20EV%2FAutomotive%20career%20opportunities.%0A%0APlease%20find%20my%20resume%20attached.%0A%0AThank%20you!"
            className={`btn btn-secondary ${styles.actionBtn}`}
            data-track-event="ev_career_submit_resume_click"
          >
            Submit Resume
          </a>
        </div>
        <button 
          onClick={toggleAll} 
          className={`btn btn-secondary ${styles.actionBtn}`}
          data-track-event="ev_career_toggle_all_click"
          data-track-state={allExpanded ? "collapse" : "expand"}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>


      {/* Desktop View (Single Table) */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: "28%" }}>Company</th>
              <th className={styles.th} style={{ width: "24%" }}>Career Link</th>
              <th className={styles.th} style={{ width: "24%" }}>Developer</th>
              <th className={styles.th} style={{ width: "24%" }}>Training</th>
            </tr>
          </thead>
          {Object.entries(groupedCompanies).map(([category, categoryCompanies]) => (
            <tbody key={category}>
              <tr>
                <td colSpan={4} className={styles.categoryHeaderCell}>
                  <div
                    onClick={() => toggleSection(category)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                    data-track-event="ev_career_section_toggle_click"
                    data-track-category={category}
                    data-track-state={expandedSections[category] ? "collapse" : "expand"}
                  >
                    <div className={styles.categoryTitleTable}>{category}</div>
                    <button
                      className={styles.collapseBtn}
                      aria-label={expandedSections[category] ? "Collapse section" : "Expand section"}
                    >
                      {expandedSections[category] ? "−" : "+"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedSections[category] && categoryCompanies.map((item, index) => (
                <tr key={item.company} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.company}>{item.company}</div>
                  </td>
                  <td className={styles.td}>
                      <a
                        href={item.careerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary ${styles.tableBtn}`}
                        data-track-event="career_click"
                        data-track-company={item.company}
                        data-track-category={category}
                        onClick={() => handleAcknowledgment(item.company)}
                      >
                        Careers ↗
                      </a>
                    </td>
                    <td className={styles.td}>
                      {item.developerLink ? (
                        <a
                          href={item.developerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-secondary ${styles.tableBtn}`}
                          data-track-event="developer_click"
                          data-track-company={item.company}
                          data-track-category={category}
                          onClick={() => handleAcknowledgment(item.company)}
                        >
                          Developers ↗
                        </a>
                    ) : (
                      <span className={styles.notAvailable}>Not Available</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {item.trainingLink ? (
                      <a
                        href={item.trainingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-secondary ${styles.tableBtn}`}
                        data-track-event="training_click"
                        data-track-company={item.company}
                        data-track-category={category}
                        onClick={() => handleAcknowledgment(item.company)}
                      >
                        Training ↗
                      </a>
                    ) : (
                      <span className={styles.notAvailable}>Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* Mobile View */}
      <div className={styles.mobileCards}>
        {Object.entries(groupedCompanies).map(([category, categoryCompanies]) => (
          <div key={category} className={styles.categorySectionMobile}>
            <h2
              className={styles.categoryTitleMobile}
              onClick={() => toggleSection(category)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              data-track-event="ev_career_section_toggle_click"
              data-track-category={category}
              data-track-state={expandedSections[category] ? "collapse" : "expand"}
            >
              <span>{category}</span>
              <span className={styles.collapseIconMobile}>{expandedSections[category] ? "−" : "+"}</span>
            </h2>
            {expandedSections[category] && (
              <div className={styles.mobileCardsList}>
                {categoryCompanies.map((item, index) => (
                  <div key={item.company} className={styles.card}>
                    <div>
                      <div className={styles.cardCompany}>{item.company}</div>
                    </div>
                    <div className={styles.cardActions}>
                      <a
                        href={item.careerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary ${styles.tableBtn}`}
                        data-track-event="career_click"
                        data-track-company={item.company}
                        data-track-category={category}
                        onClick={() => handleAcknowledgment(item.company)}
                      >
                        Careers ↗
                      </a>
                      {item.developerLink ? (
                        <a
                          href={item.developerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-secondary ${styles.tableBtn}`}
                          data-track-event="developer_click"
                          data-track-company={item.company}
                          data-track-category={category}
                          onClick={() => handleAcknowledgment(item.company)}
                        >
                          Developers ↗
                        </a>
                      ) : (
                        <span className={styles.notAvailable}>Not Available</span>
                      )}
                      {item.trainingLink ? (
                        <a
                          href={item.trainingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-secondary ${styles.tableBtn}`}
                          data-track-event="training_click"
                          data-track-company={item.company}
                          data-track-category={category}
                          onClick={() => handleAcknowledgment(item.company)}
                        >
                          Training ↗
                        </a>
                      ) : (
                        <span className={styles.notAvailable}>Not Available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Competency Matrix Section */}
      <CompetencyMatrix />

      {/* Disclaimer Section */}
      <div className={`glass-panel ${styles.disclaimerSection}`} ref={disclaimerRef}>
        <div className={styles.disclaimerTitle}>
          <span className={styles.infoIcon}>ⓘ</span> DISCLAIMER
        </div>
        <div className={styles.disclaimerContent}>
          <p>
            EV.ENGINEER™ is an <span className={styles.highlightText}>independent platform</span> focused on education, skill development, and awareness in the Electric Vehicle (EV), Battery, Energy, and Automotive technology domains.
          </p>
          <p>
            We provide curated information about companies, career opportunities, and developer ecosystems to help candidates learn, prepare, and explore potential career paths in India and global markets.
          </p>
          <p>
            EV.ENGINEER™ is <span className={styles.highlightText}>NOT affiliated</span>, associated, authorized, endorsed by, or in any way officially connected with any of the companies listed on this page, including but not limited to Tesla, BYD, Waymo, Enphase, Exide, Amara Raja, or others. All company names, trademarks, and logos belong to their respective owners.
          </p>
          <p className={styles.highlightText} style={{ fontWeight: 700 }}>EV.ENGINEER™ does NOT:</p>
          <ul>
            <li><span className={styles.highlightText}>Guarantee job placement</span></li>
            <li>Assure interview opportunities</li>
            <li>Influence hiring decisions of any company</li>
            <li>Act as a recruitment agency or hiring partner (unless explicitly stated through official partnerships)</li>
          </ul>
          <p>
            All career links provided are direct links to official company websites or publicly available resources. Candidates are strongly advised to verify job details, eligibility, and application processes directly with the respective companies.
          </p>
          <p>Our goal is to:</p>
          <ul>
            <li>Enable engineers to build strong technical skills</li>
            <li>Provide visibility into real-world opportunities</li>
            <li>Support career growth through learning and practical exposure</li>
          </ul>
          <p>
            By using this platform, users acknowledge that EV.ENGINEER™ is a learning and information platform only, and all career decisions and applications are made at their own discretion.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- COMPETENCY MATRIX COMPONENT ---
function CompetencyMatrix() {
  const [activeTab, setActiveTab] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleTabChange = (index: number) => {
    if (index === activeTab) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(index);
      setAnimating(false);
    }, 180);
  };

  const active = COMPETENCY_MATRIX[activeTab];

  return (
    <div style={{ marginTop: '80px', marginBottom: '16px' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(76, 169, 48, 0.08)', border: '1px solid rgba(76, 169, 48, 0.25)', marginBottom: '20px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>EV Engineering Careers</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>
          EV Engineering Roles, <span style={{ color: 'var(--accent-primary)' }}>Skills</span> &amp; Core Competencies
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
          Explore industry-aligned EV, Energy, Battery, Software, Diagnostics, and Technical Leadership roles with the core competencies required for each engineering path.
        </p>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '32px',
          padding: '0 8px',
        }}
        role="tablist"
        aria-label="Qualification categories"
      >
        {COMPETENCY_MATRIX.map((item, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={activeTab === i}
            id={`competency-tab-${i}`}
            onClick={() => {
              handleTabChange(i);
              trackEvent('ev_career_competency_tab_click', { tab: item.tab });
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: activeTab === i ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === i ? 'rgba(76, 169, 48, 0.12)' : 'rgba(255,255,255,0.03)',
              color: activeTab === i ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === i ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === i ? '0 0 12px rgba(76, 169, 48, 0.2)' : 'none',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {item.tab}
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div
        role="tabpanel"
        aria-labelledby={`competency-tab-${activeTab}`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          borderLeft: '4px solid var(--accent-primary)',
          borderRadius: '16px',
          padding: '40px 36px',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          {/* Roles Column */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Industry Roles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {active.roles.map((role, i) => (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    background: 'rgba(76, 169, 48, 0.07)',
                    border: '1px solid rgba(76, 169, 48, 0.18)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, boxShadow: '0 0 6px var(--accent-primary)' }} />
                  {role}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Column */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Core Skills &amp; Competencies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
              {active.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    padding: '7px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a
                href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20EV%20career%20guidance%20and%20training%20programs%20on%20EV.ENGINEER%E2%84%A2."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.6rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                data-track-event="ev_career_competency_cta_click"
                data-track-tab={active.tab}
              >
                Get Guidance for {active.tab} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
