"use client";
import MobileChapterNav from "./MobileChapterNav";
import styles from "../model-rocketry.module.css";

export const NAV_ITEMS: [string, string][] = [
  ["#what-is-it", "What is it?"],
  ["#model-vs-real", "Model vs Real"],
  ["#explorer", "Rocket Explorer"],
  ["#systems", "Systems"],
  ["#flight-physics", "Flight & Stability"],
  ["#propulsion", "Propulsion"],
  ["#workflow", "Build Path"],
  ["#design-reviews", "Design Reviews"],
  ["#sim-tools", "Simulation"],
  ["#failure-lab", "Failure Lab"],
  ["#fmea", "FMEA"],
  ["#rocketry-vs-cansat", "Model vs CanSat"],
  ["#competitions", "Competitions"],
  ["#glossary", "Glossary"],
  ["#careers", "Careers"],
  ["#cost", "Cost"],
  ["#enterprise", "Enterprise"],
  ["#roadmap", "Roadmap"],
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
