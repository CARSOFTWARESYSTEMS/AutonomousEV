"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { APEX_NAV, APEX_OFFICIAL_SITE_URL, APEX_SITE, apexHref } from "@/data/apex/site";
import { ApexLogo } from "./ApexLogo";
import { ThemeToggle } from "./ThemeRoot";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import chrome from "./chrome.module.css";

function isCurrent(pathname: string | null, path: string): boolean {
  const href = apexHref(path);
  return (pathname ?? "").replace(/\/+$/, "") === href.replace(/\/+$/, "") || (pathname === "/" && href === "/");
}

export function ApexHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  // A route change closes the menu (adjusted during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // The menu is for narrow screens only; widening the window closes it.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1180px)");
    const onChange = () => query.matches && setOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  };

  return (
    <>
      <header className={`${chrome.header} ${styles.forceDark}`}>
        <div className={`${styles.container} ${chrome.topBand}`}>
          <Link href={apexHref("/")} className={chrome.brand} aria-label="APEX Rocket Systems — home" {...apexTrack("apex_nav_click", { item: "brand" })}>
            <ApexLogo alt="" className={chrome.brandLogo} sizes="(min-width: 1180px) 375px, (min-width: 640px) 277px, 228px" priority />
          </Link>

          <span className={chrome.status}>{APEX_SITE.conceptStatus}</span>

          <div className={chrome.headerActions}>
            <ThemeToggle className={chrome.themeToggle} />
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary} ${chrome.officialLink}`}
              style={{ minHeight: 44, padding: "8px 16px", fontSize: 12 }}
              {...apexTrack("apex_official_site_click", { placement: "header" })}
            >
              Official website <ArrowUpRight size={15} aria-hidden="true" />
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

        <nav className={chrome.navBand} aria-label="APEX Rocket Systems">
          <ul className={`${styles.container} ${chrome.navList}`}>
            {APEX_NAV.map((item) => (
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
          </ul>
        </nav>
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
              {APEX_NAV.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={apexHref(item.path)}
                    className={chrome.menuLink}
                    aria-current={isCurrent(pathname, item.path) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    {...apexTrack("apex_nav_click", { item: item.id, placement: "menu" })}
                  >
                    <span className={chrome.menuIndex}>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={chrome.menuFoot}>
            <ThemeToggle className={`${styles.btn} ${styles.btnSecondary}`} withLabel />
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
            <p className={styles.small}>{APEX_SITE.conceptStatus}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
