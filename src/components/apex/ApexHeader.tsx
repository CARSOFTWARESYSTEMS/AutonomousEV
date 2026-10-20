"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { APEX_NAV, APEX_OFFICIAL_SITE_URL, APEX_PRIMARY_NAV, APEX_MORE_NAV, APEX_SITE, apexHref } from "@/data/apex/site";
import { ApexLogo } from "./ApexLogo";
import { ThemeToggle } from "./ThemeRoot";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import chrome from "./chrome.module.css";

function isCurrent(pathname: string | null, path: string): boolean {
  const norm = (value: string) => value.replace(/\/+$/, "");
  return norm(pathname ?? "") === norm(apexHref(path));
}

/**
 * The masthead: one band. The full logo (never reduced), Company first among
 * six primary links, a "More" menu for Roadmap, and the official website. Over
 * the home hero it starts transparent and turns to a blurred dark bar on scroll.
 */
export function ApexHeader() {
  const pathname = usePathname();
  const isHome = isCurrent(pathname, "/");
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);

  // Route changes close both menus (adjusted during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
    setMoreOpen(false);
  }

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const dialog = menuRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (!open && dialog.open) dialog.close();
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  // The phone menu is for narrow screens only; widening the window closes it.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1360px)");
    const onChange = () => query.matches && setOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // "More" closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        moreRef.current?.querySelector("button")?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [moreOpen]);

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  };

  const moreCurrent = APEX_MORE_NAV.some((item) => isCurrent(pathname, item.path));

  return (
    <>
      <header className={`${chrome.header} ${styles.forceDark}`} data-overlay={isHome && !scrolled ? "true" : undefined} data-scrolled={scrolled ? "true" : undefined}>
        <div className={`${styles.container} ${chrome.bar}`}>
          <Link href={apexHref("/")} className={chrome.brand} aria-label="APEX Rocket Systems — home" {...apexTrack("apex_nav_click", { item: "brand" })}>
            <ApexLogo alt="" className={chrome.brandLogo} sizes="(min-width: 1280px) 375px, (min-width: 640px) 277px, 228px" priority />
          </Link>

          <nav className={chrome.nav} aria-label="APEX Rocket Systems">
            <ul className={chrome.navList}>
              {APEX_PRIMARY_NAV.map((item) => (
                <li key={item.id}>
                  <Link
                    href={apexHref(item.path)}
                    className={chrome.navLink}
                    aria-current={isCurrent(pathname, item.path) ? "page" : undefined}
                    {...apexTrack("apex_nav_click", { item: item.id })}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li ref={moreRef} className={chrome.more}>
                <button
                  type="button"
                  className={chrome.navLink}
                  aria-expanded={moreOpen}
                  aria-controls="apex-more"
                  data-current={moreCurrent ? "true" : undefined}
                  onClick={() => setMoreOpen((value) => !value)}
                >
                  More <ChevronDown size={14} aria-hidden="true" style={{ transform: moreOpen ? "rotate(180deg)" : undefined, transition: "transform 0.15s ease" }} />
                </button>
                <ul id="apex-more" className={chrome.moreList} hidden={!moreOpen}>
                  {APEX_MORE_NAV.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={apexHref(item.path)}
                        className={chrome.moreLink}
                        aria-current={isCurrent(pathname, item.path) ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                        {...apexTrack("apex_nav_click", { item: item.id, placement: "more" })}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          <div className={chrome.headerActions}>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary} ${chrome.officialLink}`}
              {...apexTrack("apex_official_site_click", { placement: "header" })}
            >
              Official site <ArrowUpRight size={15} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              className={chrome.menuButton}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="apex-menu"
              aria-label="Menu"
              onClick={(event) => {
                event.currentTarget.focus();
                setOpen(true);
              }}
            >
              <Menu size={18} aria-hidden="true" />
              <span className={chrome.menuLabel} aria-hidden="true">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        id="apex-menu"
        ref={menuRef}
        className={`${chrome.menu} ${styles.forceDark}`}
        aria-label="APEX Rocket Systems menu"
        onClose={() => {
          setOpen(false);
          document.documentElement.style.overflow = "";
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className={`${styles.container} ${chrome.menuInner}`}>
          <div className={chrome.menuTop}>
            <ApexLogo alt="APEX Rocket Systems" className={chrome.brandLogo} sizes="(min-width: 640px) 277px, 228px" />
            <button type="button" className={chrome.menuButton} onClick={closeMenu} autoFocus aria-label="Close menu">
              <X size={18} aria-hidden="true" />
              <span className={chrome.menuLabel} aria-hidden="true">
                Close
              </span>
            </button>
          </div>
          <nav aria-label="APEX Rocket Systems">
            <ul className={chrome.menuList}>
              {APEX_NAV.map((item) => (
                <li key={item.id}>
                  <Link
                    href={apexHref(item.path)}
                    className={chrome.menuLink}
                    aria-current={isCurrent(pathname, item.path) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    {...apexTrack("apex_nav_click", { item: item.id, placement: "menu" })}
                  >
                    {item.id === "home" ? "Overview" : item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={chrome.menuFoot}>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnPrimary}`}
              {...apexTrack("apex_official_site_click", { placement: "menu" })}
            >
              Official APEX website <ArrowUpRight size={16} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
            <Link
              href={apexHref("/company#contact")}
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => setOpen(false)}
              {...apexTrack("apex_collaboration_click", { placement: "menu" })}
            >
              Discuss collaboration
            </Link>
            <div className={chrome.menuUtility}>
              <span className={styles.small}>{APEX_SITE.conceptStatus}</span>
              <ThemeToggle className={chrome.utilityToggle} withLabel />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
