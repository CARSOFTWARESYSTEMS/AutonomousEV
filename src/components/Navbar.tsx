"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AuthNavControl, { AuthMenuEntry } from "./auth/AuthNavControl";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutContainerRef = useRef<HTMLDivElement>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement>(null);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const spaceContainerRef = useRef<HTMLDivElement>(null);
  const spaceTriggerRef = useRef<HTMLButtonElement>(null);
  const [mobileSpaceOpen, setMobileSpaceOpen] = useState(false);

  const isSpaceOrAerospace =
    pathname === "/space" || pathname === "/aerospace" || pathname === "/space/2026-INSPACe-ROCKETRY-059";

  useEffect(() => {
    if (!aboutOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!aboutContainerRef.current?.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAboutOpen(false);
        aboutTriggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aboutOpen]);

  useEffect(() => {
    if (!spaceOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!spaceContainerRef.current?.contains(event.target as Node)) {
        setSpaceOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSpaceOpen(false);
        spaceTriggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [spaceOpen]);

  const closeAbout = () => setAboutOpen(false);
  const closeSpace = () => setSpaceOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          EV.<span>ENGINEER™</span>
        </Link>

        <div className={styles.navLinks}>
          <div className={styles.navItem} ref={aboutContainerRef}>
            <button
              type="button"
              ref={aboutTriggerRef}
              className={styles.navItemTrigger}
              aria-haspopup="true"
              aria-expanded={aboutOpen}
              aria-controls="about-dropdown-menu"
              onClick={() => setAboutOpen((open) => !open)}
            >
              About
            </button>
            <div
              id="about-dropdown-menu"
              className={`${styles.dropdown} ${aboutOpen ? styles.dropdownForceOpen : ""}`}
            >
              <div className={styles.dropdownColumn}>
                <Link href="/about" className={styles.dropdownLink} onClick={closeAbout}>About Us</Link>
                <Link href="/about/sudarshana-karkala" className={styles.dropdownLink} onClick={closeAbout}>Sudarshana Karkala</Link>
                <Link href="/trust-center" className={styles.dropdownLink} onClick={closeAbout}>Trust Center</Link>
              </div>
            </div>
          </div>

          <div
            className={`${styles.navItem} ${isSpaceOrAerospace ? styles.navItemActive : ""}`}
            ref={spaceContainerRef}
          >
            <button
              type="button"
              ref={spaceTriggerRef}
              className={styles.navItemTrigger}
              aria-haspopup="true"
              aria-expanded={spaceOpen}
              aria-controls="space-dropdown-menu"
              onClick={() => setSpaceOpen((open) => !open)}
            >
              Space &amp; Aerospace
            </button>
            <div
              id="space-dropdown-menu"
              className={`${styles.dropdown} ${spaceOpen ? styles.dropdownForceOpen : ""}`}
            >
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownTitle}>Space &amp; Aerospace</div>
                <Link
                  href="/space"
                  className={styles.dropdownLink}
                  onClick={closeSpace}
                  aria-current={pathname === "/space" ? "page" : undefined}
                >
                  Space
                </Link>
                <Link
                  href="/aerospace"
                  className={styles.dropdownLink}
                  onClick={closeSpace}
                  aria-current={pathname === "/aerospace" ? "page" : undefined}
                >
                  Aerospace
                </Link>
                <Link
                  href="/space/2026-INSPACe-ROCKETRY-059"
                  className={styles.dropdownLink}
                  onClick={closeSpace}
                  aria-current={pathname === "/space/2026-INSPACe-ROCKETRY-059" ? "page" : undefined}
                >
                  Model Rocketry Guide
                </Link>
              </div>
              <div className={styles.dropdownGroup}>
                <div className={styles.dropdownTitle}>Engineering</div>
                <div className={styles.dropdownGroupColumns}>
                  <div className={styles.dropdownColumn}>
                    <div className={styles.dropdownSubTitle}>Battery Systems</div>
                    <Link href="/" className={styles.dropdownLink} onClick={closeSpace}>Battery Intelligence</Link>
                    <Link href="/technical-concepts" className={styles.dropdownLink} onClick={closeSpace}>Technical Concepts</Link>
                    <Link href="/av-concepts" className={styles.dropdownLink} onClick={closeSpace}>AV Concepts</Link>
                  </div>
                  <div className={styles.dropdownColumn}>
                    <div className={styles.dropdownSubTitle}>Ecosystem & Risks</div>
                    <Link href="/cybersecurity" className={styles.dropdownLink} onClick={closeSpace}>Cybersecurity</Link>
                    <Link href="/ecosystem/singapore" className={styles.dropdownLink} onClick={closeSpace}>Ecosystem</Link>
                    <Link href="/challenges" className={styles.dropdownLink} onClick={closeSpace}>Risks & Maintenance</Link>
                    <Link href="/developer-portal" className={styles.dropdownLink} onClick={closeSpace}>Developer Portal</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href="/internships" className={styles.navItem}>Internships</Link>

          <Link href="/ev-career" className={styles.navItem}>EV Career</Link>

          <Link href="/workshop-gallery" className={styles.navItem}>Gallery</Link>
        </div>

        <div className={styles.actions}>
          <AuthNavControl variant="core" />
          <Link href="/corporate-training" className="btn btn-secondary" data-track-event="nav_training_click">Training</Link>
          <Link href="/consulting" className="btn btn-primary" data-track-event="nav_consulting_click">Consulting</Link>
        </div>

        {/* Phones and tablets: Login stays in the bar, beside the menu button. */}
        <div className={styles.authMobile}>
          <AuthNavControl variant="core" />
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
          <div className={styles.authMenu}>
            <AuthMenuEntry variant="core" onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <div className={styles.mobileSectionTitle}>About</div>
          <Link href="/about" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link href="/about/sudarshana-karkala" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Sudarshana Karkala</Link>
          <Link href="/trust-center" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Trust Center</Link>

          <button
            type="button"
            className={styles.mobileAccordionTrigger}
            aria-expanded={mobileSpaceOpen}
            aria-controls="mobile-space-panel"
            onClick={() => setMobileSpaceOpen((open) => !open)}
          >
            Space &amp; Aerospace
            <span aria-hidden="true">{mobileSpaceOpen ? "−" : "+"}</span>
          </button>
          {mobileSpaceOpen && (
            <div id="mobile-space-panel" className={styles.mobilePanel}>
              <Link
                href="/space"
                className={styles.mobileLink}
                onClick={() => { setMobileMenuOpen(false); setMobileSpaceOpen(false); }}
              >
                Space
              </Link>
              <Link
                href="/aerospace"
                className={styles.mobileLink}
                onClick={() => { setMobileMenuOpen(false); setMobileSpaceOpen(false); }}
              >
                Aerospace
              </Link>
              <Link
                href="/space/2026-INSPACe-ROCKETRY-059"
                className={styles.mobileLink}
                onClick={() => { setMobileMenuOpen(false); setMobileSpaceOpen(false); }}
              >
                Model Rocketry Guide
              </Link>

              <div className={styles.mobileSectionTitle}>Engineering</div>
              {[
                ["/", "Battery Intelligence"],
                ["/technical-concepts", "Technical Concepts"],
                ["/av-concepts", "AV Concepts"],
                ["/cybersecurity", "Cybersecurity"],
                ["/ecosystem/singapore", "Ecosystem"],
                ["/challenges", "Risks & Maintenance"],
                ["/developer-portal", "Developer Portal"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={styles.mobileLink}
                  onClick={() => { setMobileMenuOpen(false); setMobileSpaceOpen(false); }}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

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
