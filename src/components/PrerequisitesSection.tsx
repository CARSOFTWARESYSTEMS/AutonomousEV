"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/utils/analytics";
import styles from "./PrerequisitesSection.module.css";

export default function PrerequisitesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked) {
          trackEvent("section_view", {
            section: "prerequisites_skills",
            page: "/internships"
          });
          setHasTracked(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTracked]);

  return (
    <div className={styles.container} ref={sectionRef}>
      <div className={styles.grid}>
        
        {/* CARD 1 */}
        <div className={styles.largeCard}>
          <h3 className={styles.cardHeader}>Prerequisites</h3>
          <p className={styles.goalText}>
            <span className={styles.highlight}>Goal:</span> Prepare for EV Engineering Internship
          </p>
          
          <ul className={styles.bulletList}>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>Required Basics:</span> Python, Flutter / React Native, iOS/Android, plus basic ML concepts, circuits, sensors, and signals.</span>
            </li>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>What You Should Be Able To Do:</span> Break down technical problems and debug effectively.</span>
            </li>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>Focus Areas:</span> Basic knowledge of EV architecture and lithium-ion batteries.</span>
            </li>
          </ul>

          <div className={styles.tipBlock}>
            <span className={styles.highlight}>Tip:</span> Demonstrate a strong interest in EV, Energy, and AI domains with consistent effort.
          </div>
        </div>

        {/* CARD 2 */}
        <div className={styles.largeCard}>
          <h3 className={styles.cardHeader}>Skills You Will Learn After Internship</h3>
          <p className={styles.goalText}>
            <span className={styles.highlight}>Goal:</span> Become industry-ready EV Engineer
          </p>
          
          <ul className={styles.bulletList}>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>Core Skills:</span> EV Battery Systems & BMS (Cell → Module → Pack, SOC/SOH), Automotive Cybersecurity.</span>
            </li>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>What You Will Be Able To Do:</span> Real-World Data Acquisition (Sensors, ESP32) and EV Data Analysis using Python & cloud tools.</span>
            </li>
            <li className={styles.bulletItem}>
              <span className={styles.arrow}>→</span> 
              <span><span className={styles.highlight}>Outcome:</span> Implement AI/ML for Battery Intelligence (health prediction, anomaly detection, risk analysis).</span>
            </li>
          </ul>

          <div className={styles.tipBlock}>
            <span className={styles.highlight}>Tip:</span> You will master real-world EV engineering workflows and build a strong portfolio.
          </div>
        </div>

      </div>
    </div>
  );
}
