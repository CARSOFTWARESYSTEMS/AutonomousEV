import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const culprits = await page.evaluate(() => {
  const all = document.querySelectorAll("*");
  const results = [];
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth + 1 || rect.left < -1) {
      const cs = getComputedStyle(el);
      const path = [];
      let node = el;
      for (let i = 0; i < 6 && node; i++) {
        path.unshift(node.tagName + (node.className && typeof node.className === "string" ? "." + node.className.split(" ").join(".") : ""));
        node = node.parentElement;
      }
      results.push({
        path: path.join(" > "),
        text: el.textContent ? el.textContent.trim().slice(0, 40) : "",
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        position: cs.position,
      });
    }
  }
  return results.slice(0, 20);
});
console.log(JSON.stringify(culprits, null, 2));
await browser.close();
