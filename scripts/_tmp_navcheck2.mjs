import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/space/model-rocketry", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 950));
await page.waitForTimeout(200);
const rect = await page.evaluate(() => {
  const el = document.querySelector('div[class*="chapterNav"]');
  const r = el.getBoundingClientRect();
  return { y: r.y, h: r.height };
});
console.log(JSON.stringify(rect));
await page.screenshot({ path: "/tmp/p0_chapternav_fixed.png" });
await browser.close();
