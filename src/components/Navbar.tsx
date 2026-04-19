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
                <Link href="/machine-learning" className={styles.dropdownLink}>Machine Learning &amp; AI</Link>
                <Link href="/si-ems" className={styles.dropdownLink}>SI-EMS Research</Link>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Applied &amp; Tools</div>
                <Link href="/simulations" className={styles.dropdownLink}>Hands-On Simulations</Link>
                <Link href="/developer-portal" className={styles.dropdownLink}>Developer Portal</Link>
              </div>
            </div>
          </div>

          <div className={styles.navItem}>
            EV Ecosystem
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>AV Ecosystem</div>
                <Link href="/ecosystem/india" className={styles.dropdownLink}>India</Link>
                <Link href="/ecosystem/europe" className={styles.dropdownLink}>Europe</Link>
                <Link href="/ecosystem/singapore" className={styles.dropdownLink}>Singapore</Link>
                <Link href="/ecosystem/usa" className={styles.dropdownLink}>USA</Link>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Risks &amp; Maintenance</div>
                <Link href="/challenges" className={styles.dropdownLink}>Challenges</Link>
                <Link href="/cybersecurity" className={styles.dropdownLink}>Cybersecurity</Link>
                <Link href="/battery-diagnostics" className={styles.dropdownLink}>EV Battery Diagnostics</Link>
              </div>
            </div>
          </div>

          <div className={styles.navItem}>
            Internships
            <div className={styles.dropdown}>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Research</div>
                <Link href="/si-ems" className={styles.dropdownLink}>Super-Intelligent AI EMS</Link>
                <a href="https://battery.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>EV Battery Health &amp; Diagnostics</a>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownSubTitle}>Proof of Concept</div>
                <Link href="/design-development/passenger-taxi" className={styles.dropdownLink}>Autonomous Passenger Taxi</Link>
                <Link href="/design-development/airport-cargo" className={styles.dropdownLink}>Autonomous Airport Cargo EV</Link>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownSubTitle}>EV Repair workshop</div>
                <a href="https://repair.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>EV Repair Workshop</a>
              </div>
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Design &amp; Development</div>
                <Link href="/internships/battery-fire-prevention" className={styles.dropdownLink}>AI-Powered EV Battery Fire Prevention System</Link>
                <Link href="/internships/battery-aadhaar" className={styles.dropdownLink}>Battery Pack Aadhaar System</Link>
                <div className={styles.dropdownDivider} />
                <div className={styles.dropdownSubTitle}>Miscellaneous</div>
                <Link href="/internships" className={styles.dropdownLink}>Internship projects</Link>
                <a href="https://vtu.internyet.in/" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>VTU Internyet</a>
                <a href="https://internship.aicte-india.org/" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>AICTE Internships</a>
                <a href="https://itelematics.com/ev-engineer" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>Projects @ iTelematics®</a>
                <a href="https://www.thasmaiinfotech.com/#programs" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>Projects @ Thasmai Infotech</a>
                <a href="https://www.evsociety.org/projects" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>Webinars @ EV Society™</a>
                <a href="https://labs.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.dropdownLink}>Ongoing vs Completed</a>
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
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
      
      {/* Mobile Menu Content */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          
          <div className={styles.mobileSectionTitle}>Foundations</div>
          <Link href="/av-concepts" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>AV Concepts</Link>
          <Link href="/technical-concepts" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Technical Concepts</Link>
          <Link href="/non-technical-concepts" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Non-Technical Concepts</Link>

          <div className={styles.mobileSectionTitle}>Engineering</div>
          <Link href="/driverless-car-technologies" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Driverless Car Tech</Link>
          <Link href="/intelligent-transportation-systems" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Intelligent Transportation</Link>
          <Link href="/rtos" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>RTOS for AV</Link>
          <Link href="/machine-learning" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Machine Learning &amp; AI</Link>
          <Link href="/simulations" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Hands-On Simulations</Link>
          <Link href="/developer-portal" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Developer Portal</Link>
          <Link href="/si-ems" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>SI-EMS Research</Link>

          <div className={styles.mobileSectionTitle}>EV Ecosystem</div>
          <Link href="/ecosystem/india" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>India Ecosystem</Link>
          <Link href="/ecosystem/europe" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Europe Ecosystem</Link>
          <Link href="/ecosystem/singapore" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Singapore Ecosystem</Link>
          <Link href="/ecosystem/usa" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>USA Ecosystem</Link>

          <div className={styles.mobileSectionTitle}>Risks &amp; Maintenance</div>
          <Link href="/challenges" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Challenges</Link>
          <Link href="/cybersecurity" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Cybersecurity</Link>
          <Link href="/battery-diagnostics" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>EV Battery Diagnostics</Link>

          <div className={styles.mobileSectionTitle}>Internships — Research</div>
          <Link href="/si-ems" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Super-Intelligent AI EMS</Link>
          <a href="https://battery.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>EV Battery Health &amp; Diagnostics</a>

          <div className={styles.mobileSectionTitle}>Internships — Proof of Concept</div>
          <Link href="/design-development/passenger-taxi" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Autonomous Passenger Taxi</Link>
          <Link href="/design-development/airport-cargo" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Autonomous Airport Cargo EV</Link>

          <div className={styles.mobileSectionTitle}>Internships — EV Repair workshop</div>
          <a href="https://repair.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>EV Repair Workshop</a>

          <div className={styles.mobileSectionTitle}>Internships — Design &amp; Development</div>
          <Link href="/internships/battery-fire-prevention" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>AI-Powered EV Battery Fire Prevention System</Link>
          <Link href="/internships/battery-aadhaar" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Battery Pack Aadhaar System</Link>

          <div className={styles.mobileSectionTitle}>Internships — Miscellaneous</div>
          <Link href="/internships" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Internship projects</Link>
          <a href="https://vtu.internyet.in/" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>VTU Internyet</a>
          <a href="https://internship.aicte-india.org/" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>AICTE Internships</a>
          <a href="https://itelematics.com/ev-engineer" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Projects @ iTelematics®</a>
          <a href="https://www.thasmaiinfotech.com/#programs" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Projects @ Thasmai Infotech</a>
          <a href="https://www.evsociety.org/projects" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Webinars @ EV Society™</a>
          <a href="https://labs.ev.engineer/" target="_blank" rel="noopener noreferrer" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Ongoing vs Completed</a>

          <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Contact</Link>

          <div style={{ height: "24px" }}></div>
          <Link href="/corporate-training" className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Corporate Training</Link>
          <Link href="/consulting" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Consulting</Link>
        </div>
      </div>
    </nav>
  );
}
