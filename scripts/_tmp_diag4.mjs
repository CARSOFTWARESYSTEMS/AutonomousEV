import { chromium } from "playwright";
const routes = ["/about/sudarshana-karkala", "/design-development/passenger-taxi", "/internships/ev-help-agent", "/internships/ev-help-agent/usecases"];
const browser = await chromium.launch();
for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
  const culprits = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    const results = [];
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 2) {
        const path = [];
        let node = el;
        for (let i = 0; i < 5 && node; i++) {
          path.unshift(node.tagName + (node.className && typeof node.className === "string" ? "." + node.className.split(" ").slice(0,2).join(".") : ""));
          node = node.parentElement;
        }
        results.push({ path: path.join(" > "), right: Math.round(rect.right), width: Math.round(rect.width), text: (el.textContent||"").trim().slice(0,30) });
      }
    }
    return results.slice(-6);
  });
  console.log(`=== ${route} ===`);
  console.log(JSON.stringify(culprits, null, 1));
  await page.close();
}
await browser.close();
