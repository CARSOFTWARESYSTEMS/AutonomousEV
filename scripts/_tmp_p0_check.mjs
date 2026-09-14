import { chromium } from "playwright";

const widths = [320, 360, 375, 390, 393, 430, 768, 1024, 1280, 1440, 1920];
const url = "http://localhost:3000/space/model-rocketry";
const browser = await chromium.launch();
const errors = [];
const overflow = [];

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(`[${w}px] console: ${msg.text()}`); });
  page.on("pageerror", (err) => errors.push(`[${w}px] pageerror: ${err.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) overflow.push(`[${w}px] scrollWidth=${sw} > ${w}`);
  await page.screenshot({ path: `/tmp/p0_${w}_hero.png` });
  await page.close();
}
await browser.close();
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
console.log("OVERFLOW:", overflow.length ? overflow.join("\n") : "none");
