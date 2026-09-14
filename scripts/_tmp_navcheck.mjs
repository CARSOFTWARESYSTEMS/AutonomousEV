import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/space/model-rocketry", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 950));
await page.waitForTimeout(200);

const info = await page.evaluate(() => {
  const target = document.querySelector('div[class*="chapterNav"]');
  const chain = [];
  let el = target ? target.parentElement : null;
  while (el) {
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      className: el.className,
      overflow: cs.overflow,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      transform: cs.transform,
      filter: cs.filter,
      contain: cs.contain,
      willChange: cs.willChange,
      display: cs.display,
    });
    el = el.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
