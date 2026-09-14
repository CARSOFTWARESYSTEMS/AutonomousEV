import { chromium } from "playwright";

const sizes = [
  { name: "320", width: 320, height: 700 },
  { name: "360", width: 360, height: 740 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
];

const browser = await chromium.launch();
const allErrors = {};

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

  await page.goto("http://localhost:3000/space/model-rocketry", { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Model Rocketry')");

  // Check horizontal overflow
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    return { docWidth, winWidth, overflowing: docWidth > winWidth + 1 };
  });

  await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-hero.png` });

  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-explorer.png` });

  // click a component to trigger the bottom sheet at mobile width
  if (size.width < 768) {
    const target = page.locator("#explorer").getByRole("button", { name: "Motor mount" });
    await target.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-sheet.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }

  await page.locator("#model-vs-real").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-comparison.png` });

  await page.locator("#fmea").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-fmea.png` });

  await page.locator("#flight-physics").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/mr-mobile/${size.name}-stability.png` });

  allErrors[size.name] = { overflow, errors };
  await page.close();
}

console.log(JSON.stringify(allErrors, null, 2));
await browser.close();
