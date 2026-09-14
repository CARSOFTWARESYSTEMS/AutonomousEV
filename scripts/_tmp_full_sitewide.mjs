import { chromium } from "playwright";

const routes = [
  "/", "/about", "/about/sudarshana-karkala", "/aerospace", "/av-concepts", "/challenges",
  "/consulting", "/contact", "/corporate-training", "/cybersecurity", "/design-development",
  "/design-development/airport-cargo", "/design-development/passenger-taxi",
  "/design-development/passenger-taxi/battery-cybersecurity", "/developer-portal", "/ecosystem",
  "/ecosystem/singapore", "/ev-battery-talent-network", "/ev-career",
  "/insights/customer-discovery-toolkit", "/internships", "/internships/battery-aadhaar",
  "/internships/battery-circular-economy", "/internships/battery-cybersecurity",
  "/internships/battery-diagnostics-12-week-plan", "/internships/battery-fire-prevention",
  "/internships/battery-pack-design", "/internships/ev-help-agent",
  "/internships/ev-help-agent/usecases", "/internships/miscellaneous/startup",
  "/internships/roadmap", "/internships/training-internship", "/si-ems", "/space",
  "/space/2026-INSPACe-ROCKETRY-059", "/space/cubesat", "/space/model-rocketry",
  "/technical-concepts", "/trust-center", "/workshop-gallery",
];
const widths = [375];
const browser = await chromium.launch();
const errors = [];
const overflow = [];

for (const route of routes) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    page.on("pageerror", (err) => errors.push(`[${route} @${w}] pageerror: ${err.message}`));
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 15000 });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w + 2) overflow.push(`[${route} @${w}] scrollWidth=${sw} > ${w}`);
    } catch (e) {
      errors.push(`[${route}] nav error: ${e.message}`);
    }
    await page.close();
  }
}
await browser.close();
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
console.log("OVERFLOW:", overflow.length ? overflow.join("\n") : "none");
