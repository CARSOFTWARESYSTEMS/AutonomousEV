import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const before = await page.evaluate(() => ({ scrollX: window.scrollX, htmlSW: document.documentElement.scrollWidth, bodySW: document.body.scrollWidth }));
// try to actually scroll the page horizontally
await page.mouse.wheel(500, 0);
await page.waitForTimeout(150);
const afterWheel = await page.evaluate(() => window.scrollX);
await page.evaluate(() => window.scrollTo(500, 0));
await page.waitForTimeout(150);
const afterForced = await page.evaluate(() => window.scrollX);

console.log(JSON.stringify({ before, afterWheel, afterForced }, null, 2));
await page.screenshot({ path: "/tmp/homepage_scrolltest.png" });
await browser.close();
