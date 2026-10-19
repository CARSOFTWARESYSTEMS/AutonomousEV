/* APEX Rocket Systems microsite — production browser acceptance checks.
   Build, then start `npx next start -p 3100` before running this:

     node scripts/test-apex.cjs                      # all three engines
     APEX_ENGINES=webkit node scripts/test-apex.cjs  # one engine

   Runs Chromium, WebKit (Safari's engine) and Firefox across phone, tablet,
   laptop and large-screen sizes. WebKit and Firefox use the builds already in
   the Playwright cache when the expected ones are missing (APEX_WEBKIT_PATH and
   APEX_FIREFOX_PATH override). Analytics hosts are blocked so test runs never
   reach the live property; events are read from window.dataLayer instead. */
const BASE = process.env.APEX_BASE_URL || "http://localhost:3100";
const OUTPUT = process.env.APEX_QA_DIR || "/private/tmp/apex-qa";
const ROOT = "/space/partners/apexrocketsystems";
const ROUTES = ["", "/engine", "/system", "/build-validate", "/digital-twin", "/roadmap", "/ecosystem", "/company"];
const ANALYTICS = /googletagmanager\.com|google-analytics\.com/;
const VIEWPORTS = [
  { name: "320", width: 320, height: 640, mobile: true },
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "430", width: 430, height: 932, mobile: true },
  { name: "tablet-portrait", width: 768, height: 1024, mobile: true },
  { name: "tablet-landscape", width: 1024, height: 768, mobile: true },
  { name: "laptop", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "large", width: 1920, height: 1080 },
];

async function main() {
  const [{ default: assert }, fs, { default: path }, os, pw] = await Promise.all([
    import("node:assert/strict"), import("node:fs/promises"), import("node:path"), import("node:os"), import("playwright"),
  ]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
  const exists = async (p) => fs.access(p).then(() => true, () => false);
  const latest = async (prefix, tail) => {
    const dirs = (await fs.readdir(cache).catch(() => [])).filter((d) => d.startsWith(prefix)).sort().reverse();
    for (const d of dirs) if (await exists(path.join(cache, d, tail))) return path.join(cache, d, tail);
    return undefined;
  };
  const engines = [
    { name: "chromium", type: pw.chromium, executablePath: undefined },
    { name: "webkit", type: pw.webkit, executablePath: process.env.APEX_WEBKIT_PATH || (await latest("webkit-", "pw_run.sh")) },
    { name: "firefox", type: pw.firefox, executablePath: process.env.APEX_FIREFOX_PATH || (await latest("firefox-", "firefox/Nightly.app/Contents/MacOS/firefox")) },
  ];

  const results = [];
  const failures = [];
  const test = async (name, action) => {
    try {
      await action();
      results.push(name);
      console.log(`PASS ${name}`);
    } catch (error) {
      failures.push(`${name}: ${error.message.split("\n")[0]}`);
      console.log(`FAIL ${name}: ${error.message.split("\n")[0]}`);
    }
  };

  const settle = async (page) => {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += Math.max(400, window.innerHeight * 0.8)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
  };

  /** Visible text that reaches past the viewport edge, outside deliberate horizontal scrollers. */
  const offscreenText = (page) =>
    page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const scrolls = (el) => {
        for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (/(auto|scroll)/.test(style.overflowX)) return true;
          if (node.tagName === "DIALOG") return true;
        }
        return false;
      };
      const bad = [];
      for (const el of document.querySelectorAll("main *, header *, footer *")) {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none" || style.position === "absolute" && el.getBoundingClientRect().width <= 1) continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        if ((rect.right > width + 1 || rect.left < -1) && !scrolls(el)) bad.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 40)}" ${Math.round(rect.left)}–${Math.round(rect.right)}`);
      }
      return bad.slice(0, 5);
    });

  const only = (process.env.APEX_ENGINES || "chromium,webkit,firefox").split(",");
  /** Text whose computed contrast against its effective background is below WCAG AA. Photographs are skipped. */
  const lowContrast = (page) =>
    page.evaluate(() => {
      const parse = (c) => {
        const m = /rgba?\(([^)]+)\)/.exec(c);
        if (!m) return null;
        const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r, g, b, a };
      };
      const lum = ({ r, g, b }) => {
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const background = (el) => {
        const layers = [];
        for (let node = el; node; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (style.backgroundImage.includes("url(")) return null;
          const c = parse(style.backgroundColor);
          if (c && c.a > 0) {
            layers.push(c);
            if (c.a >= 1) break;
          }
        }
        let out = { r: 255, g: 255, b: 255 };
        for (const c of layers.reverse()) out = { r: c.r * c.a + out.r * (1 - c.a), g: c.g * c.a + out.g * (1 - c.a), b: c.b * c.a + out.b * (1 - c.a) };
        return out;
      };
      const bad = [];
      for (const el of document.querySelectorAll("main *, footer *")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (!rect.width || style.visibility === "hidden" || el.closest("[aria-hidden=true], dialog:not([open]), svg") || rect.width <= 1) continue;
        const fg = parse(style.color);
        const bg = background(el);
        if (!fg || !bg) continue;
        const fgBlend = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
        const [l1, l2] = [lum(fgBlend), lum(bg)].sort((a, b) => b - a);
        const ratio = (l1 + 0.05) / (l2 + 0.05);
        const size = parseFloat(style.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) bad.push(`"${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}`);
      }
      return bad.slice(0, 6);
    });

  for (const engine of engines.filter((e) => only.includes(e.name))) {
    let browser;
    try {
      browser = await engine.type.launch({ headless: true, ...(engine.executablePath ? { executablePath: engine.executablePath } : {}) });
    } catch (error) {
      failures.push(`${engine.name}: could not launch (${error.message.split("\n")[0]})`);
      continue;
    }
    const isWebKit = engine.name === "webkit";

    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        ...(viewport.mobile && engine.name !== "firefox" ? { isMobile: true, hasTouch: true } : viewport.mobile ? { hasTouch: true } : {}),
      });
      await context.route(ANALYTICS, (route) => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource|NS_ERROR|blocked/.test(message.text())) errors.push(message.text());
      });

      for (const route of ROUTES) {
        const label = `${engine.name} ${viewport.name} ${route || "/"}`;
        await test(`${label}: loads, one h1, no overflow, no clipped text, no errors`, async () => {
          const response = await page.goto(`${BASE}${ROOT}${route}`, { waitUntil: "load" });
          assert.equal(response.status(), 200);
          await settle(page);
          assert.equal(await page.locator("h1").count(), 1);
          const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
          assert(sw <= cw + 1, `horizontal overflow ${sw} > ${cw}`);
          const clipped = await offscreenText(page);
          assert.equal(clipped.length, 0, `clipped text: ${clipped.join(" | ")}`);
          if (viewport.name === "1440" || viewport.name === "390") {
            const faint = await lowContrast(page);
            assert.equal(faint.length, 0, `low contrast: ${faint.join(" | ")}`);
          }
          const seen = errors.splice(0);
          assert.equal(seen.length, 0, `errors: ${seen.join(" | ").slice(0, 300)}`);
        });
        if (engine.name === "chromium" && (viewport.name === "390" || viewport.name === "1440")) {
          await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}${route.replace(/\//g, "-") || "-home"}.png`), fullPage: true });
        }
      }
      await context.close();
    }

    // ── Light theme: every route at phone and laptop width ──
    for (const viewport of VIEWPORTS.filter((v) => ["390", "1440"].includes(v.name))) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await context.addInitScript(() => {
        try {
          localStorage.setItem("apex-theme", "light");
        } catch {}
      });
      await context.route(ANALYTICS, (route) => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource|NS_ERROR|blocked/.test(message.text())) errors.push(message.text());
      });
      for (const route of ROUTES) {
        await test(`${engine.name} light ${viewport.name} ${route || "/"}: themed, no overflow, AA contrast, no errors`, async () => {
          await page.goto(`${BASE}${ROOT}${route}`, { waitUntil: "load" });
          await settle(page);
          assert.equal(await page.evaluate(() => document.querySelector("[data-apex-theme]").getAttribute("data-apex-theme")), "light");
          const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
          assert(sw <= cw + 1, `horizontal overflow ${sw} > ${cw}`);
          const clipped = await offscreenText(page);
          assert.equal(clipped.length, 0, `clipped text: ${clipped.join(" | ")}`);
          const faint = await lowContrast(page);
          assert.equal(faint.length, 0, `low contrast: ${faint.join(" | ")}`);
          const seen = errors.splice(0);
          assert.equal(seen.length, 0, `errors: ${seen.join(" | ").slice(0, 300)}`);
        });
        if (engine.name === "chromium") await page.screenshot({ path: path.join(OUTPUT, `light-${viewport.name}${route.replace(/\//g, "-") || "-home"}.png`), fullPage: true });
      }
      await context.close();
    }

    // ── Behaviour, once per engine: desktop and phone ──
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desktop.route(ANALYTICS, (route) => route.abort());
    const page = await desktop.newPage();

    await test(`${engine.name}: dark by default; the toggle switches to light, persists and is reported`, async () => {
      await page.goto(`${BASE}${ROOT}/roadmap`, { waitUntil: "load" });
      const root = page.locator("[data-apex-theme]");
      assert.equal(await root.getAttribute("data-apex-theme"), "dark");
      const toggle = page.getByRole("button", { name: "Light theme" }).first();
      assert.equal(await toggle.getAttribute("aria-pressed"), "false");
      await toggle.click();
      assert.equal(await root.getAttribute("data-apex-theme"), "light");
      assert.equal(await toggle.getAttribute("aria-pressed"), "true");
      await page.waitForFunction(() => (window.dataLayer || []).some((e) => e[1] === "apex_theme_change"));
      await page.reload({ waitUntil: "load" });
      assert.equal(await page.locator("[data-apex-theme]").getAttribute("data-apex-theme"), "light");
      await page.getByRole("button", { name: "Light theme" }).first().click();
      assert.equal(await page.locator("[data-apex-theme]").getAttribute("data-apex-theme"), "dark");
    });

    await test(`${engine.name}: every photograph and logo loads, in a modern format where supported`, async () => {
      await page.goto(`${BASE}${ROOT}/engine`, { waitUntil: "load" });
      const imgs = page.locator("main img, header img, footer img");
      const count = await imgs.count();
      assert(count > 5);
      for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        await img.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img.elementHandle(), { timeout: 15000 });
      }
      const hero = await page.evaluate(() => document.querySelector("main img")?.currentSrc ?? "");
      assert.match(hero, /\.(avif|webp)$/);
    });

    await test(`${engine.name}: home reports its page view and the hero image is fetched first`, async () => {
      await page.goto(`${BASE}${ROOT}`, { waitUntil: "load" });
      await page.waitForFunction(() => (window.dataLayer || []).some((e) => e[0] === "event" && e[1] === "apex_home_view"), null, { timeout: 15000 });
      const ns = await page.evaluate(() => window.dataLayer.find((e) => e[0] === "event" && e[1] === "apex_home_view")[2].site_namespace);
      assert.equal(ns, "apex");
      assert.equal(await page.locator("main img").first().getAttribute("fetchpriority"), "high");
    });

    await test(`${engine.name}: a system domain opens the panel; Escape closes it and focus returns`, async () => {
      const tile = page.getByRole("button", { name: /^Propulsion\s*Built/ });
      await tile.scrollIntoViewIfNeeded();
      await tile.click();
      const dialog = page.locator("dialog[aria-labelledby='apex-panel-title']");
      await dialog.waitFor({ state: "visible" });
      assert.equal(await dialog.getByRole("heading", { level: 2 }).textContent(), "Propulsion");
      await page.waitForFunction(() => (window.dataLayer || []).some((e) => e[1] === "apex_system_domain_open"));
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim().startsWith("Propulsion")), true);
      assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
    });

    await test(`${engine.name}: the gallery opens a photograph and steps with the arrow keys`, async () => {
      const thumb = page.getByRole("button", { name: /^Fig\. 01 — enlarge/ });
      await thumb.scrollIntoViewIfNeeded();
      await thumb.click();
      const box = page.getByRole("dialog", { name: "Figure 01" });
      await box.waitFor({ state: "visible" });
      await page.keyboard.press("ArrowRight");
      await page.getByRole("dialog", { name: "Figure 02" }).waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.getByRole("dialog", { name: "Figure 02" }).waitFor({ state: "hidden" });
    });

    await test(`${engine.name}: the skip link reaches the main content`, async () => {
      await page.goto(`${BASE}${ROOT}/system`, { waitUntil: "load" });
      await page.keyboard.press(isWebKit ? "Alt+Tab" : "Tab");
      assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Skip to content");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => location.hash), "#apex-main");
    });

    await test(`${engine.name}: the technical view adds the interface matrix and is reported`, async () => {
      await page.getByRole("button", { name: "Technical view" }).click();
      await page.getByRole("table").waitFor();
      await page.waitForFunction(() => (window.dataLayer || []).some((e) => e[1] === "apex_technical_view"));
    });

    await test(`${engine.name}: the contact address is not in the server HTML but appears after hydration`, async () => {
      const response = await page.goto(`${BASE}${ROOT}/company?topic=testing#contact`, { waitUntil: "load" });
      assert(!(await response.text()).includes("vibbhav@"));
      await page.locator('a[href^="mailto:"]').first().waitFor({ state: "attached" });
      assert.equal(await page.locator("#apex-category").inputValue(), "testing");
    });

    await test(`${engine.name}: reduced motion stops the loop animation`, async () => {
      const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
      await reduced.route(ANALYTICS, (route) => route.abort());
      const p = await reduced.newPage();
      await p.goto(`${BASE}${ROOT}`, { waitUntil: "load" });
      const duration = await p.evaluate(() => {
        const pulse = [...document.querySelectorAll("g")].find((g) => getComputedStyle(g).animationName === "orbit" || /pulse/.test(g.getAttribute("class") || ""));
        return pulse ? parseFloat(getComputedStyle(pulse).animationDuration) : -1;
      });
      assert(duration >= 0 && duration < 0.01, `animation duration ${duration}`);
      await reduced.close();
    });
    await desktop.close();

    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, ...(engine.name !== "firefox" ? { isMobile: true } : {}) });
    await phone.route(ANALYTICS, (route) => route.abort());
    const mobile = await phone.newPage();
    await test(`${engine.name}: the phone menu opens, navigates and closes`, async () => {
      await mobile.goto(`${BASE}${ROOT}`, { waitUntil: "load" });
      await mobile.getByRole("button", { name: "Menu" }).click();
      const menu = mobile.getByRole("dialog", { name: "APEX Rocket Systems menu" });
      await menu.waitFor({ state: "visible" });
      await menu.getByRole("link", { name: /Ecosystem/ }).click();
      await mobile.waitForURL(`**${ROOT}/ecosystem`);
      await menu.waitFor({ state: "hidden" });
      assert.equal(await mobile.evaluate(() => document.documentElement.style.overflow), "");
    });
    await test(`${engine.name}: on a phone a capability opens as a bottom sheet`, async () => {
      const card = mobile.getByRole("button", { name: /Avionics & Flight Electronics/ }).first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      const dialog = mobile.locator("dialog[aria-labelledby='apex-panel-title']");
      await dialog.waitFor({ state: "visible" });
      const box = await dialog.boundingBox();
      assert(box && box.y > 40 && Math.round(box.y + box.height) >= 843, `sheet at ${JSON.stringify(box)}`);
      await dialog.getByRole("button", { name: "Close panel" }).click();
      await dialog.waitFor({ state: "hidden" });
    });
    await test(`${engine.name}: /space shows the APEX card next to Space Station`, async () => {
      await mobile.goto(`${BASE}/space`, { waitUntil: "load" });
      const link = mobile.getByRole("link", { name: /Explore APEX Collaboration Concept/ }).first();
      assert.equal(await link.getAttribute("href"), ROOT);
    });
    await phone.close();
    await browser.close();
  }

  console.log(`\n${results.length} passed, ${failures.length} failed. Screenshots: ${OUTPUT}`);
  if (failures.length) {
    console.log(failures.map((f) => ` - ${f}`).join("\n"));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
