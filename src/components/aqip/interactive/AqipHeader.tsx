"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, type MouseEvent } from "react";
import { LINK_EVENTS, trackAqip } from "../analytics";
import { AQIP } from "../data/overview";
import { HEADER_CTA, HEADER_NAV } from "../data/reference";
import EcosystemMenu from "./EcosystemMenu";
import MobileMenu from "./MobileMenu";
import { jumpTo, useActiveSection } from "./pageState";
import css from "../chrome.module.css";

type NavItem = (typeof HEADER_NAV)[number];

/**
 * AQIP's own header, used on this route in place of the site's EV.ENGINEER
 * navbar: a compact identity, seven high-level destinations, the Ecosystem
 * menu and one action. Below the desktop breakpoint the destinations move into
 * a menu behind a single button.
 */
export default function AqipHeader() {
  const uid = useId();
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const current = HEADER_NAV.find((item) => item.sections.includes(active))?.id ?? "";

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButton.current?.focus();
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    trackAqip("aqip_header_nav_click", { item: item.id });
    setMenuOpen(false);
    // The page's own link handling may already have made the jump.
    if (!event.defaultPrevented && jumpTo(item.target)) event.preventDefault();
  };

  return (
    <header className={css.header}>
      <div className={css.headerInner}>
        <a href="#top" className={css.brand} aria-label={`${AQIP.short}: ${AQIP.name}. Back to the top.`} onClick={() => setMenuOpen(false)}>
          <span className={css.brandMark}>{AQIP.short}</span>
          <span className={css.brandLine}>{AQIP.name}</span>
        </a>

        <nav className={css.headerNav} aria-label="AQIP">
          <ul>
            {HEADER_NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.target}`} className={css.headerLink} aria-current={item.id === current ? "location" : undefined} onClick={(event) => navigate(event, item)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <EcosystemMenu />
            </li>
          </ul>
        </nav>

        <Link href={HEADER_CTA.href} className={css.headerCta} data-track-event={LINK_EVENTS.cta} data-track-cta={HEADER_CTA.id}>
          {HEADER_CTA.label}
        </Link>

        <button
          ref={menuButton}
          id={`${uid}-menu-button`}
          type="button"
          className={css.menuButton}
          aria-expanded={menuOpen}
          aria-controls={`${uid}-menu`}
          onClick={() => {
            if (!menuOpen) trackAqip("aqip_mobile_menu_open");
            setMenuOpen(!menuOpen);
          }}
        >
          <span className={css.menuIcon} data-open={menuOpen ? "" : undefined} aria-hidden="true" />
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>
      {menuOpen ? <MobileMenu id={`${uid}-menu`} current={current} onClose={closeMenu} onNavigate={navigate} /> : null}
    </header>
  );
}
