import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/space/model-rocketry", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 950));
await page.waitForTimeout(200);
await page.screenshot({ path: "/tmp/p0_chapternav.png" });
// open chapter sheet
await page.getByRole("button", { name: /Understand/ }).first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: "/tmp/p0_chaptersheet.png" });
await browser.close();
