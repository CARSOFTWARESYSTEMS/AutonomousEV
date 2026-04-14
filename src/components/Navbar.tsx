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
          <Link href="/about" className={styles.navItem}>About</Link>
          
          <div className={styles.navItem}>
            Concepts
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Foundations</div>
                <Link href="/av-concepts" className={styles.dropdownLink}>AV Concepts</Link>
                <Link href="/technical-concepts" className={styles.dropdownLink}>Technical Concepts</Link>
                <Link href="/non-technical-concepts" className={styles.dropdownLink}>Non-Technical Concepts</Link>
              </div>
            </div>
          </div>
          
          <div className={styles.navItem}>
            Engineering
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Core Systems</div>
                <Link href="/driverless-car-technologies" className={styles.dropdownLink}>Driverless Car Tech</Link>
                <Link href="/intelligent-transportation-systems" className={styles.dropdownLink}>Intelligent Transportation</Link>
                <Link href="/rtos" className={styles.dropdownLink}>RTOS for AV</Link>
                <Link href="/machine-learning" className={styles.dropdownLink}>Machine Learning & AI</Link>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Applied & Tools</div>
                <Link href="/simulations" className={styles.dropdownLink}>Hands-On Simulations</Link>
                <Link href="/developer-portal" className={styles.dropdownLink}>Developer Portal</Link>
              </div>
            </div>
          </div>

          <div className={styles.navItem}>
            AV Ecosystem
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Design & Development</div>
                <Link href="/design-development/passenger-taxi" className={styles.dropdownLink}>Autonomous Passenger Taxi</Link>
                <Link href="/design-development/airport-cargo" className={styles.dropdownLink}>Autonomous Airport Cargo EV</Link>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>AV Ecosystem</div>
                <Link href="/ecosystem/india" className={styles.dropdownLink}>India</Link>
                <Link href="/ecosystem/europe" className={styles.dropdownLink}>Europe</Link>
                <Link href="/ecosystem/singapore" className={styles.dropdownLink}>Singapore</Link>
                <Link href="/ecosystem/usa" className={styles.dropdownLink}>USA</Link>
              </div>
            </div>
          </div>

          <div className={styles.navItem}>
            Insights
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Risks & Maintenance</div>
                <Link href="/challenges" className={styles.dropdownLink}>Challenges</Link>
                <Link href="/cybersecurity" className={styles.dropdownLink}>Cybersecurity</Link>
                <Link href="/battery-diagnostics" className={styles.dropdownLink}>EV Battery Diagnostics</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Link href="/corporate-training" className="btn btn-secondary">Training</Link>
          <Link href="/consulting" className="btn btn-primary">Consulting</Link>
        </div>

        <button 
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
      
      {/* Mobile Menu Content to be expanded */}
    </nav>
  );
}
