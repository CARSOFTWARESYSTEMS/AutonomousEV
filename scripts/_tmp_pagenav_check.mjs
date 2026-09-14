import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3000/space/model-rocketry", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(200);
const rect = await page.evaluate(() => {
  const el = document.querySelector('nav[class*="pageNav"]');
  const r = el.getBoundingClientRect();
  return { y: r.y, h: r.height, scrollY: window.scrollY };
});
console.log(JSON.stringify(rect));
await page.screenshot({ path: "/tmp/pagenav_scrolled.png" });
await browser.close();
