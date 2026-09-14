"use client";
import MobileChapterNav from "./MobileChapterNav";
import styles from "../everyday-applications.module.css";

export const NAV_ITEMS: [string, string][] = [
  ["#system-diagram", "How Space Helps"],
  ["#questions", "Everyday Questions"],
  ["#applications", "Applications"],
  ["#day-in-life", "A Day in the Life"],
  ["#benefits", "Direct vs Indirect"],
  ["#space-systems", "India's Space Systems"],
  ["#satellite-to-phone", "Satellite to Phone"],
];

export default function AnchorNav() {
  return (
    <>
      <nav className={styles.pageNav} aria-label="On this page">
        {NAV_ITEMS.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <MobileChapterNav />
    </>
  );
}
