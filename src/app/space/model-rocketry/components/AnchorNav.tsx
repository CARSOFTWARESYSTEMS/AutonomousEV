"use client";
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
  ["#glossary", "Glossary"],
  ["#careers", "Careers"],
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
      <div className={styles.mobileNavSelect}>
        <label htmlFor="model-rocketry-nav" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          Jump to section
        </label>
        <select
          id="model-rocketry-nav"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) window.location.hash = e.target.value;
          }}
        >
          <option value="" disabled>
            Jump to section…
          </option>
          {NAV_ITEMS.map(([href, label]) => (
            <option key={href} value={href}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
