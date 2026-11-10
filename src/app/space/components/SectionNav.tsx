"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../portal.module.css";

export interface SectionNavItem {
  label: string;
  /** "#id" for a section of this page, or a route. */
  href: string;
}

/**
 * "On this page": a row of links to the page's sections, with the one being
 * read marked aria-current. Sticky under the header from 768px (CSS); on a
 * phone it scrolls sideways inside itself, never the page.
 */
export default function SectionNav({ items, label = "On this page" }: { items: SectionNavItem[]; label?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // The topmost section still in the reading band is the current one.
        const current = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;
        setActive(current);
      },
      { rootMargin: "-130px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={styles.sectionNav} aria-label={label}>
      <div className={styles.sectionNavInner}>
        <span className={styles.sectionNavLabel} aria-hidden="true">
          {label}
        </span>
        {items.map((item) =>
          item.href.startsWith("#") ? (
            <a key={item.href} href={item.href} className={styles.sectionNavLink} aria-current={active === item.href.slice(1) ? "true" : undefined}>
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sectionNavLink} ${styles.sectionNavAcademy}`}
              data-track-event="space_section_nav_click"
              data-track-destination={item.href}
            >
              {item.label}
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
