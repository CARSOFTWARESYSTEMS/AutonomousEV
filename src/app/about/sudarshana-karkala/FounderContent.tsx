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
              sizes="200px"
              className={styles.profileImage}
              priority
            />
          </div>
          <h1 className={styles.heroTitle}>Sudarshana Karkala</h1>
          <p className={styles.heroSubtitle}>EV.ENGINEER™</p>
          <p className={styles.heroTagline}>
            Architecting Intelligent Energy Systems for the Future of Electric Mobility
          </p>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className={styles.contentSection}>
        <div className={styles.glassCard}>
          <h2 className={styles.sectionTitle}>About the Founder</h2>
          <p className={styles.description}>
            <strong>Sudarshana Karkala</strong> is a seasoned software architect and technology leader with over two decades of experience in mobile, cloud, and energy systems engineering.
          </p>
          <p className={styles.description}>
            He is the founder of <strong>EV.ENGINEER™</strong>, a platform dedicated to building world-class engineers and developing next-generation solutions for electric vehicles and intelligent energy systems.
          </p>
          
          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Core Focus Areas</h3>
          <ul className={styles.focusList}>
            <li>AI-powered EV battery safety systems</li>
            <li>Autonomous energy management (SI-EMS)</li>
            <li>Battery lifecycle intelligence and diagnostics</li>
            <li>EV ecosystem platforms for India and global markets</li>
          </ul>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className={styles.missionSection}>
        <h2 className={styles.sectionTitle}>Mission</h2>
        <p className={styles.missionText}>
          "To eliminate EV battery failures and build safe, intelligent, and scalable energy systems for the future."
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
    </div>
  );
}
