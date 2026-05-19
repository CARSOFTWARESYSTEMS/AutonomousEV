"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          EV.<span>ENGINEER™</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/" className={styles.navItem}>Home</Link>
          <div className={styles.navItem}>
            About
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <Link href="/about" className={styles.dropdownLink}>About Us</Link>
                <Link href="/about/sudarshana-karkala" className={styles.dropdownLink}>Sudarshana Karkala</Link>
              </div>
            </div>
          </div>

          <div className={styles.navItem}>
            Engineering
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Battery Systems</div>
                <Link href="/" className={styles.dropdownLink}>Battery Intelligence</Link>
                <Link href="/technical-concepts" className={styles.dropdownLink}>Technical Concepts</Link>
                <Link href="/av-concepts" className={styles.dropdownLink}>AV Concepts</Link>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Ecosystem & Risks</div>
                <Link href="/cybersecurity" className={styles.dropdownLink}>Cybersecurity</Link>
                <Link href="/ecosystem/singapore" className={styles.dropdownLink}>Ecosystem</Link>
                <Link href="/challenges" className={styles.dropdownLink}>Risks & Maintenance</Link>
                <Link href="/developer-portal" className={styles.dropdownLink}>Developer Portal</Link>
              </div>
            </div>
          </div>

          <Link href="/internships" className={styles.navItem}>Internships</Link>

          <Link href="/ev-career" className={styles.navItem}>EV Career</Link>

          <Link href="/workshop-gallery" className={styles.navItem}>Gallery</Link>
        </div>

        <div className={styles.actions}>
          <Link href="/corporate-training" className="btn btn-secondary" data-track-event="nav_training_click">Training</Link>
          <Link href="/consulting" className="btn btn-primary" data-track-event="nav_consulting_click">Consulting</Link>
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Content */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <div className={styles.mobileSectionTitle}>About</div>
          <Link href="/about" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link href="/about/sudarshana-karkala" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Sudarshana Karkala</Link>

          <div className={styles.mobileSectionTitle}>Engineering</div>
          <Link href="/" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Battery Intelligence</Link>
          <Link href="/technical-concepts" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Technical Concepts</Link>
          <Link href="/av-concepts" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>AV Concepts</Link>
          <Link href="/cybersecurity" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Cybersecurity</Link>
          <Link href="/ecosystem/singapore" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Ecosystem</Link>
          <Link href="/challenges" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Risks &amp; Maintenance</Link>
          <Link href="/developer-portal" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Developer Portal</Link>

          <div className={styles.mobileSectionTitle}>Internships</div>
          <Link href="/internships" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Internships</Link>

          <div className={styles.mobileSectionTitle}>Careers</div>
          <Link href="/ev-career" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>EV Career</Link>

          <div className={styles.mobileSectionTitle}>Gallery</div>
          <Link href="/workshop-gallery" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Workshop Gallery</Link>

          <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Contact</Link>

          <div style={{ height: "24px" }}></div>
          <Link href="/corporate-training" className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)} data-track-event="nav_training_click">Corporate Training</Link>
          <Link href="/consulting" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)} data-track-event="nav_consulting_click">Consulting</Link>
        </div>
      </div>
    </nav>
  );
}
