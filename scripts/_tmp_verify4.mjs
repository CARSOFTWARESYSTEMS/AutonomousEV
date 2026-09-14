import { chromium } from "playwright";
const routes = ["/about/sudarshana-karkala", "/design-development/passenger-taxi", "/internships/ev-help-agent", "/internships/ev-help-agent/usecases"];
const browser = await chromium.launch();
for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(500, 0));
  await page.waitForTimeout(150);
  const scrollX = await page.evaluate(() => window.scrollX);
  console.log(`${route}: afterForcedScrollX=${scrollX}`);
  await page.close();
}
await browser.close();
