"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { trackEvent } from "@/utils/analytics";

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
        <h1 className={styles.title}>EV Career Opportunities</h1>
        <p className={styles.subtitle} style={{ fontWeight: 400 }}>
          Building <strong className={styles.glowingText}>World-Class Engineers</strong> to Solve <strong className={styles.glowingText}>Energy</strong> and <strong className={styles.glowingText}>EV Battery</strong> Challenges
        </p>
        <div className={styles.disclaimerShort}>
          <span>EV.ENGINEER™ is an independent learning platform. We are not affiliated with listed companies and do not guarantee job placements.</span>
        </div>
      </div>

      <div className={styles.controlsHeader}>
        <div className={styles.controlsLeft}>
          <Link
            href="/internships"
            className={styles.trainingBtn}
            data-track-event="ev_career_job_oriented_training_click"
          >
            Job Oriented Training & Workshops
          </Link>
          <a
            href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20EV%20Certificates%20and%20Job%20Oriented%20Training%20programs%20on%20EV.ENGINEER%E2%84%A2.%20Could%20you%20please%20provide%20more%20information%3F"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactBtn}
            data-track-event="ev_career_whatsapp_training_certificate_click"
          >
            EV Trainings & Certificates
          </a>
          <a
            href="mailto:info@iTelematics.com?subject=Resume%20Submission%20%E2%80%94%20EV%20Career%20Opportunities&body=Hi%20Team%2C%0A%0AI%20came%20across%20EV.ENGINEER%E2%84%A2%20and%20would%20like%20to%20submit%20my%20resume%20for%20EV%2FAutomotive%20career%20opportunities.%0A%0APlease%20find%20my%20resume%20attached.%0A%0AThank%20you!"
            className={styles.submitResumeBtn}
            data-track-event="ev_career_submit_resume_click"
          >
            Submit Resume
          </a>
        </div>
        <button onClick={toggleAll} className={styles.globalCollapseBtn}>
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>


      {/* Desktop View (Single Table) */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: "35%" }}>Company</th>
              <th className={styles.th} style={{ width: "35%" }}>Career Link</th>
              <th className={styles.th} style={{ width: "30%" }}>Developer</th>
            </tr>
          </thead>
          {Object.entries(groupedCompanies).map(([category, categoryCompanies]) => (
            <tbody key={category}>
              <tr>
                <td colSpan={3} className={styles.categoryHeaderCell}>
                  <div
                    onClick={() => toggleSection(category)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
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
                      className={`${styles.btn} ${styles.btnPrimary}`}
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
                        className={`${styles.btn} ${styles.btnSecondary}`}
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
                        className={`${styles.btn} ${styles.btnPrimary}`}
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
                          className={`${styles.btn} ${styles.btnSecondary}`}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer Section */}
      <div className={styles.disclaimerSection} ref={disclaimerRef}>
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
