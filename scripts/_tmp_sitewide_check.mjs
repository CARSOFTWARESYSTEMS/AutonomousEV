import { chromium } from "playwright";

const routes = ["/", "/space", "/space/cubesat", "/aerospace", "/about", "/ev-career", "/space/2026-INSPACe-ROCKETRY-059"];
const widths = [375, 1280];
const browser = await chromium.launch();
const errors = [];
const overflow = [];

for (const route of routes) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(`[${route} @${w}] console: ${msg.text()}`); });
    page.on("pageerror", (err) => errors.push(`[${route} @${w}] pageerror: ${err.message}`));
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) overflow.push(`[${route} @${w}] scrollWidth=${sw} > ${w}`);
    await page.close();
  }
}
await browser.close();
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
console.log("OVERFLOW:", overflow.length ? overflow.join("\n") : "none");
