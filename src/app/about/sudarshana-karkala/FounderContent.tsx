"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { ADVANCED_TWIN_PROJECT, CONSULTATION, FOCUS_AREAS, FOCUS_NOTE, HERO, LAST_REVIEWED, MISSION, VISION, dotted, piped } from "./profile";

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
            <p className={styles.heroTagline}>{piped(HERO.positioning)}</p>
            <p className={styles.heroAreas}>{dotted(HERO.primary)}</p>
            <p className={styles.heroSupporting}>{dotted(HERO.supporting)}</p>
          </div>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>About the Founder</h2>
          <p className={styles.description}>
            <strong>Sudarshana Karkala</strong> is an engineering and technology leader with over two decades of
            experience across software architecture, cybersecurity, connected systems, IoT, telematics, AI,
            mobility, EV and energy platforms.
          </p>
          <p className={styles.description}>
            His current research and engineering development focus is <strong>Space Systems Engineering</strong>:
            spacecraft and satellite systems, <strong>Digital Twin engineering</strong>, spacecraft health
            management, avionics and telemetry, and <strong>IVHM / FDIR / PHM</strong> (integrated vehicle health
            management; fault detection, isolation and recovery; prognostics and health management). It extends to
            aerospace cybersecurity, AI/ML-assisted engineering and{" "}
            <strong>EV Battery &amp; Energy Intelligence</strong>.
          </p>
          {/* Which of this is long practice and which is newer work. Said in so many words, so neither is read as the other. */}
          <p className={styles.description}>
            The two are kept distinct here. Software architecture, cybersecurity, connected systems, EV and energy
            are his established professional experience. The Space and Aerospace work is newer research and
            engineering development, carried out through simulation, educational Digital Twins, CanSat model
            rocketry and published engineering tutorials. It is not presented as flight-qualified,
            operational-spacecraft or physical-engine test experience.
          </p>
          <p className={styles.description}>
            Through <strong>EV.ENGINEER™</strong>, he is exploring the convergence of space technology,
            intelligent energy systems, digital twins, telemetry and cybersecurity, while mentoring engineering
            R&amp;D initiatives in EV Battery, CanSat Model Rocketry and Space Technology.
          </p>
          <p className={styles.description}>
            He is the founder of <a href="https://ev.engineer/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "bold" }}>EV.ENGINEER™</a>, a platform focused on solving critical challenges in electric mobility through intelligent, scalable, and engineering-driven solutions.
          </p>
          <p className={styles.description}>
            He is a Consultant at <a href="https://itelematics.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "bold" }}>iTelematics Software Private Limited</a>.
          </p>

          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Core Focus Areas</h3>
          <p className={styles.focusNote}>{FOCUS_NOTE}</p>
          <div className={styles.focusGrid}>
            {FOCUS_AREAS.map((area) => (
              <div key={area.title} className={styles.focusCard}>
                <h4 className={styles.focusCardTitle}>{area.title}</h4>
                {/* A list, drawn as one run of text with a dot between items, as these cards always were. */}
                <ul className={styles.focusCardList} role="list">
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
              <Link href="/si-ems" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                EV Battery Intelligence
              </Link>{" "}
              — Battery diagnostics, lifecycle intelligence, safety, digital twins and cybersecurity.
            </li>
            <li>
              <Link href="/space" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                Space &amp; Aerospace R&amp;D
              </Link>{" "}
              — Space Systems &amp; Applications, CanSat Model Rocketry, avionics, telemetry and aerospace
              cybersecurity, including the{" "}
              <Link href="/space/2026-INSPACe-ROCKETRY-059" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                Model Rocketry Learning Guide
              </Link>.
            </li>
            <li>
              <Link href="/space/cubesat" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                CubeTwin — CubeSat Battery &amp; Energy Digital Twin
              </Link>{" "}
              — Educational R&amp;D exploring spacecraft health management, energy intelligence and safe recovery.
            </li>
            <li>
              <Link href={ADVANCED_TWIN_PROJECT.href} style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                {ADVANCED_TWIN_PROJECT.name}
              </Link>{" "}
              — {ADVANCED_TWIN_PROJECT.summary} {ADVANCED_TWIN_PROJECT.caveat}
            </li>
            <li>
              <Link href="/internships" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                Engineering Education &amp; Research
              </Link>{" "}
              — Mentoring student R&amp;D through Requirements → Design → Simulation → Build → Test → Review.
            </li>
          </ul>

          <h3 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>Explore</h3>
          <div className={styles.exploreLinks}>
            <a href="https://autonomous.ev.engineer/space" className={styles.exploreLink}>
              Space Research →
            </a>
            <a href="https://autonomous.ev.engineer/space/cubesat" className={styles.exploreLink}>
              CubeTwin →
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
              <p className={styles.eduMeta}>Professional Certification</p>
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
              <p className={styles.eduNote}>Specialisation in Energy &amp; EV Battery Technologies in Aerospace</p>
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
        <p className={styles.missionText}>&ldquo;{MISSION}&rdquo;</p>

        <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Vision</h2>
        <p className={styles.missionText}>&ldquo;{VISION}&rdquo;</p>
        
        <div className={styles.connectSection}>
          <a
            href="https://www.linkedin.com/in/sudarshanakarkala/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', fontWeight: 700 }}
          >
            View Profile on LinkedIn
          </a>
        </div>
      </section>

      {/* TECHNICAL CONSULTATION & COLLABORATION — where the "Contact / Consultation" link of the engineering tutorials lands */}
      <section id={CONSULTATION.id} className={styles.contentSection} aria-labelledby="consultation-title">
        <div className={styles.glassCard}>
          <h2 id="consultation-title" className={styles.sectionTitle}>{CONSULTATION.heading}</h2>
          <p className={styles.description}>{CONSULTATION.copy}</p>
          <ul className={styles.tagRow} role="list" aria-label="Consultation and collaboration areas">
            {CONSULTATION.tags.map((tag) => (
              <li key={tag} className={styles.tag}>{tag}</li>
            ))}
          </ul>
          <p className={styles.description} style={{ marginBottom: 0, fontSize: "0.95rem" }}>
            {CONSULTATION.scope} {CONSULTATION.tutorials}
          </p>
        </div>
      </section>

      {/* CONTACT & COLLABORATION SECTION */}
      <section id="contact" className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>Contact and Collaboration</h2>
          <p className={styles.description}>
            Available for <strong>Director of Engineering, Technology Consulting, Systems Architecture, R&amp;D
            and strategic collaboration opportunities across Space, Aerospace and EV Battery technologies</strong>.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", flexWrap: "wrap", marginBottom: "16px" }}>
            <a
              href="tel:+919845561518"
              style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, minHeight: "44px" }}
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
            <Link
              href="/consulting"
              className={styles.exploreLink}
              data-track-event="consulting_click"
              data-track-section-id="profile-contact-cta"
            >
              Consulting →
            </Link>
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
          Independent public profile page. Last reviewed: {LAST_REVIEWED.shown}. See the{" "}
          <Link href="/trust-center" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>
            Trust Center
          </Link>{" "}
          for verified feedback and recognition, or{" "}
          <Link href="/contact" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>
            contact EV.ENGINEER
          </Link>{" "}
          to report a correction.
        </p>
      </section>
    </div>
  );
}
