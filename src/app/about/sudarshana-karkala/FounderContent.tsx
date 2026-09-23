"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function FounderContent() {
  return (
    <div className={styles.pageWrapper}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.imageWrapper}>
            <Image
              src="/SudarshanaKarkala.jpg"
              alt="Sudarshana Karkala"
              fill
              sizes="120px"
              className={styles.profileImage}
              priority
            />
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Sudarshana Karkala</h1>
            <p className={styles.heroSubtitle}>EV.ENGINEER™</p>
            <p className={styles.heroTagline}>
              Building Battery Intelligence, Safety & Cybersecurity for eVTOL
            </p>
            <p className={styles.heroAreas}>
              EV &amp; Battery Intelligence · Cybersecurity · Space Research · CanSat Model Rocketry
            </p>
          </div>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>About the Founder</h2>
          <p className={styles.description}>
            <strong>Sudarshana Karkala</strong> is a software architect and technology leader with over two decades of experience in eMobility, eVTOL, AirTaxi, security, cloud, and energy systems engineering.
          </p>
          <p className={styles.description}>
            He is the founder of <a href="https://ev.engineer/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "bold" }}>EV.ENGINEER™</a>, a platform focused on solving critical challenges in electric mobility through intelligent, scalable, and engineering-driven solutions.
          </p>
          <p className={styles.description}>
            He is a Consultant at <a href="https://itelematics.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "bold" }}>iTelematics Software Private Limited</a>.
          </p>
          <p className={styles.description}>
            His work is centered on building next-generation systems that improve safety, reliability, and performance of EV batteries and energy infrastructure.
          </p>
          <p className={styles.description}>
            His current areas of interest also include Space Research, CanSat Model Rocketry, aerospace engineering education and simulation-driven student R&amp;D.
          </p>

          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Core Focus Areas</h3>
          <ul className={styles.focusList}>
            <li>Battery lifecycle intelligence and diagnostics</li>
            <li>AI-powered EV battery safety systems</li>
            <li>Autonomous energy management (SI-EMS)</li>
            <li>EV ecosystem platforms for India and global markets</li>
            <li>Space Research &amp; CanSat Model Rocketry</li>
            <li>Engineering Education &amp; Student R&amp;D</li>
          </ul>
        </div>
      </section>

      {/* INITIATIVES & PROJECTS SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Initiatives and Projects</h2>
          <p className={styles.description}>
            Publicly documented initiatives and projects he leads or contributes to through the organisations and
            brand relationships above:
          </p>
          <ul className={styles.focusList}>
            <li>
              <Link href="/internships" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                EV.ENGINEER Internships &amp; Student Projects
              </Link>{" "}
              — EV battery, cybersecurity, autonomous-systems and aerospace internship and project tracks.
            </li>
            <li>
              <Link href="/si-ems" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                SI-EMS
              </Link>{" "}
              — AI-driven Energy Management Systems research for autonomous EVs.
            </li>
            <li>
              <Link href="/space" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                Space Initiative
              </Link>{" "}
              — EV Society&apos;s Space Research, CanSat Model Rocketry, workshops, competitions and aerospace
              engineering education initiative, including the{" "}
              <Link href="/space/2026-INSPACe-ROCKETRY-059" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                Model Rocketry Learning Guide
              </Link>.
            </li>
          </ul>

          <h3 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>Explore</h3>
          <div className={styles.exploreLinks}>
            <a href="https://autonomous.ev.engineer/space" className={styles.exploreLink}>
              Space Research →
            </a>
            <a href="https://autonomous.ev.engineer/workshop-gallery" className={styles.exploreLink}>
              Workshop Gallery →
            </a>
            <a href="https://labs.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.exploreLink}>
              EV.ENGINEER Labs →
            </a>
            <a href="https://carsoftwaresystems.com/" target="_blank" rel="noopener noreferrer" className={styles.exploreLink}>
              CAR Software Systems →
            </a>
          </div>
        </div>
      </section>

      {/* EDUCATION & PROFESSIONAL DEVELOPMENT SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Education &amp; Professional Development</h2>
          <div className={styles.eduGrid}>
            <div className={styles.eduCard}>
              <p className={`${styles.eduInstitution} ${styles.eduHighlight}`}>
                National Institute of Technology Karnataka, Surathkal
              </p>
              <p className={styles.eduProgram}>B.E. — Information Technology</p>
              <p className={styles.eduMeta}>Education</p>
            </div>

            <div className={styles.eduCard}>
              <p className={`${styles.eduInstitution} ${styles.eduHighlight}`}>IIT Madras — CODE</p>
              <p className={styles.eduProgram}>Electric Vehicle Engineering &amp; Development</p>
              <p className={styles.eduMeta}>
                Certification Program · Centre for Outreach and Digital Education (CODE)
              </p>
            </div>

            <div className={styles.eduCard}>
              <p className={`${styles.eduInstitution} ${styles.eduHighlight}`}>
                IN-SPACe — Department of Space, Government of India
              </p>
              <p className={styles.eduProgram}>Essentials of Model Rocketry</p>
              <p className={styles.eduMeta}>Workshop · Aug 2026 · GNEC IIT Roorkee, Greater Noida</p>
              <p className={styles.eduNote}>
                Skill-development workshop conducted under IN-SPACe, in association with ISRO.
              </p>
              <Link href="/workshop-gallery" className={styles.eduLink}>
                View Workshop Gallery →
              </Link>
            </div>

            <div className={styles.eduCard}>
              <p className={styles.eduInstitution}>Business P.A.C.E.</p>
              <p className={styles.eduProgram}>Rajiv Talreja / QuantumLeap</p>
              <p className={styles.eduMeta}>Business &amp; Entrepreneurship Development</p>
            </div>

            <div className={styles.eduCard}>
              <p className={`${styles.eduInstitution} ${styles.eduHighlight}`}>EV Society™</p>
              <p className={styles.eduProgram}>Certified EV Technology Officer (EVTO™) — In Progress</p>
              <p className={styles.eduMeta}>Professional Certification</p>
              <span className={styles.eduStatusOngoing}>Ongoing · Expected Mar 2028</span>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED PROFILES SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Verified Profiles</h2>
          <p className={styles.description}>
            Public professional profiles verified and maintained by Sudarshana Karkala:
          </p>
          <ul className={styles.focusList}>
            <li>
              <a
                href="https://www.linkedin.com/in/sudarshanakarkala/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}
                data-track-event="linkedin_profile_click"
                data-track-section-id="profile-verified-links"
              >
                LinkedIn — Sudarshana Karkala
              </a>
            </li>
            <li>
              <a
                href="https://topmate.io/sudarshana_karkala"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}
                data-track-event="topmate_profile_click"
                data-track-section-id="profile-verified-links"
              >
                Topmate — Mentorship &amp; Professional Guidance
              </a>
            </li>
          </ul>
          <p className={styles.description} style={{ marginBottom: 0, fontSize: "0.95rem" }}>
            Verified feedback and professional recognition connected to this profile are indexed on the{" "}
            <Link href="/trust-center" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              Trust Center
            </Link>.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className={styles.missionSection}>
        <h2 className={styles.sectionTitle}>Mission</h2>
        <p className={styles.missionText}>
          "To solve EV battery safety and energy system challenges through intelligent, scalable, and engineering-driven solutions."
        </p>

        <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Vision</h2>
        <p className={styles.missionText}>
          "To eliminate EV battery failures and define the future of safe, intelligent, and autonomous energy systems."
        </p>
        
        <div className={styles.connectSection}>
          <a
            href="https://www.linkedin.com/in/sudarshanakarkala/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
          >
            View Profile on LinkedIn
          </a>
        </div>
      </section>

      {/* CONTACT & COLLABORATION SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Contact and Collaboration</h2>
          <p className={styles.description}>
            Available for <strong>strategic architecture consulting, EV battery technology, and Space R&amp;D partnerships</strong>.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", flexWrap: "wrap", marginBottom: "16px" }}>
            <a
              href="tel:+919845561518"
              style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
              data-track-event="sudarshana_profile_click"
              data-track-section-id="profile-contact-block"
            >
              <span>📞</span> +91 9845561518
            </a>
          </div>

          <div className={styles.exploreLinks} style={{ marginTop: 0, marginBottom: "1.25rem" }}>
            <a
              href="https://www.linkedin.com/in/sudarshanakarkala/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.exploreLink}
              aria-label="Sudarshana Karkala on LinkedIn"
              data-track-event="linkedin_profile_click"
              data-track-section-id="profile-contact-cta"
            >
              LinkedIn →
            </a>
            <a
              href="https://carsoftwaresystems.com/public/sudarshanakarkala.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.exploreLink}
              aria-label="View Sudarshana Karkala Resume (PDF)"
              data-track-event="resume_view_click"
              data-track-section-id="profile-contact-cta"
            >
              📄 View Resume →
            </a>
          </div>

          <p className={styles.description} style={{ marginBottom: 0, fontSize: "0.95rem" }}>
            For general business enquiries — internships, partnerships or media — use the{" "}
            <Link href="/contact" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              EV.ENGINEER contact page
            </Link>.
          </p>
        </div>
      </section>

      {/* FRESHNESS / TRUST SIGNAL */}
      <section className={styles.contentSection}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
          Independent public profile page. Last reviewed: 23 September 2026. See the{" "}
          <Link href="/trust-center" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>
            Trust Center
          </Link>{" "}
          for verified feedback and recognition, or{" "}
          <Link href="/contact" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>
            contact EV.ENGINEER
          </Link>{" "}
          to report a correction.
        </p>
      </section>
    </div>
  );
}
