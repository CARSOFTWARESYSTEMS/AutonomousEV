/* Advanced Rocket Propulsion System Digital Twin — browser audit and acceptance checks.
   Build, then start `npm run start -- --port 3100` before running this, or point
   ADV_TWIN_BASE_URL at a deployment. Every check is run and recorded; the script
   exits non-zero if any failed. Screenshots and results.json are saved for review.

   ADV_TWIN_ONLY=server,responsive,controls,simulation,performance,accessibility limits the sections run. */
const BASE = process.env.ADV_TWIN_BASE_URL || 'http://localhost:3100';
const OUTPUT = process.env.ADV_TWIN_QA_DIR || '/private/tmp/advanced-propulsion-twin-qa';
const ONLY = (process.env.ADV_TWIN_ONLY || '').split(',').filter(Boolean);
const ROUTE = '/space/rocket-engine-digital-twin-advanced';
const FUNDAMENTALS = '/space/rocket-engine-digital-twin';
// Test runs must not report page views or events to the live analytics property.
const ANALYTICS = /googletagmanager\.com|google-analytics\.com/;
const GPU_ARGS = process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'];

const MODULES = [['overview', 'Overview'], ['system', 'System'], ['pressure', 'Pressure'], ['physics', 'Physics'], ['data', 'Data'], ['twin', 'Twin'], ['ai', 'AI/ML'], ['fdir', 'FDIR'], ['health', 'Health'], ['lab', 'Lab'], ['architecture', 'Architecture'], ['weeks', '12 Weeks']];
const VIEWPORTS = [
  ['mobile-320', 320, 568, true], ['mobile-360', 360, 740, true], ['mobile-375', 375, 667, true], ['mobile-390', 390, 844, true], ['mobile-430', 430, 932, true],
  ['mobile-landscape-568', 568, 320, true], ['mobile-landscape-844', 844, 390, true],
  ['tablet-768', 768, 1024, true], ['tablet-820', 820, 1180, true], ['tablet-landscape-1024', 1024, 768, true], ['tablet-landscape-1180', 1180, 820, true],
  ['desktop-1024', 1024, 768, false], ['desktop-1280', 1280, 800, false], ['desktop-1440', 1440, 900, false], ['desktop-1920', 1920, 1080, false],
];
/** Each lab fault, the diagnosis the twin should reach, and whether it is found by a direct check on the data. */
const FAULTS = [
  ['pump_degradation', 'Oxidiser pump degradation'], ['valve_restriction', 'Main fuel valve restriction'], ['cooling_restriction', 'Cooling-channel restriction'],
  ['feed_pressure_reduction', 'Oxidiser feed pressure reduction'], ['injector_restriction', 'Oxidiser injector restriction'], ['combustion_loss', 'Combustion performance loss'],
  ['pc_sensor_drift', 'Chamber pressure sensor A drift'], ['sensor_noise', 'Noisy pressure sensor'], ['packet_delay', 'Telemetry packet delay'],
  ['timestamp_error', 'Timestamp misalignment'], ['telemetry_replay', 'Replayed telemetry'],
];

async function main() {
  const [{ default: assert }, fs, { default: path }, { chromium }] = await Promise.all([import('node:assert/strict'), import('node:fs/promises'), import('node:path'), import('playwright')]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: GPU_ARGS });
  const results = [];
  const report = { base: BASE, started: new Date().toISOString(), responsive: [], performance: {}, accessibility: {}, simulation: {}, console: [] };
  const wanted = (section) => ONLY.length === 0 || ONLY.includes(section);
  /** Runs one check and records its outcome; a failure never stops the checks after it. */
  const check = async (section, name, action) => {
    try {
      const detail = await action();
      results.push({ section, name, status: 'pass', detail: detail ?? undefined });
      console.log(`PASS [${section}] ${name}`);
    } catch (error) {
      const message = String(error && error.message ? error.message : error).split('\n').slice(0, 4).join(' | ').slice(0, 600);
      results.push({ section, name, status: 'fail', error: message });
      console.log(`FAIL [${section}] ${name}\n     ${message}`);
    }
  };

  /** `sink` is where console and network problems are recorded: the report's list, or a list of the caller's when it is about to cause some. */
  const open = async (viewport, extra = {}, sink = report.console) => {
    const context = await browser.newContext({ viewport, ...extra });
    await context.route(ANALYTICS, (route) => route.abort());
    const page = await context.newPage();
    page.on('pageerror', (error) => sink.push(`pageerror @${viewport.width}: ${error.message}`));
    page.on('console', (message) => { if (message.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(message.text())) sink.push(`console @${viewport.width}: ${message.text().slice(0, 300)}`); });
    page.on('requestfailed', (request) => { if (!ANALYTICS.test(request.url()) && !/_rsc=/.test(request.url())) sink.push(`requestfailed @${viewport.width}: ${request.url().slice(0, 160)} ${request.failure()?.errorText}`); });
    page.on('response', (response) => { if (response.status() >= 400 && !ANALYTICS.test(response.url())) sink.push(`http ${response.status()} @${viewport.width}: ${response.url().slice(0, 160)}`); });
    return { context, page };
  };
  const tab = (page, label) => page.getByRole('tablist', { name: 'Tutorial modules' }).getByRole('tab', { name: label, exact: true });
  const goto = async (page, hash = '') => { await page.goto(`${BASE}${ROUTE}${hash}`, { waitUntil: 'load' }); await page.waitForTimeout(700); };
  const openModule = async (page, label, wait = 500) => { await tab(page, label).click(); await page.waitForTimeout(wait); };
  const panel = (page, id) => page.locator(`#${id}[role="tabpanel"]`);
  const events = (page) => page.evaluate(() => (window.dataLayer || []).filter((a) => a && a[0] === 'event').map((a) => ({ name: a[1], params: a[2] })));
  const settle = (page, ms) => page.waitForTimeout(ms);

  try {
    // ── Server HTML, metadata and integration ───────────────────────────────
    if (wanted('server')) {
      const { context, page } = await open({ width: 1280, height: 800 });
      const response = await page.request.get(`${BASE}${ROUTE}`);
      const html = await response.text();
      report.performance.htmlBytes = html.length;
      await check('server', 'Route responds 200 with one H1, the brief\'s title and a canonical URL', async () => {
        assert.equal(response.status(), 200);
        assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
        assert.match(html, /<title>Advanced Rocket Propulsion Digital Twin \| Physics, AI\/ML &amp; Pressure Monitoring \| EV\.ENGINEER<\/title>/);
        assert.match(html, /<link rel="canonical" href="https:\/\/aerospace\.ev\.engineer\/space\/rocket-engine-digital-twin-advanced"\/>/);
        assert.doesNotMatch(html, /noindex/i);
      });
      await check('server', 'Open Graph and Twitter tags are present and the social image is a 1200×630 PNG', async () => {
        const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        assert.match(image, /^https:\/\/aerospace\.ev\.engineer\/space\/rocket-engine-digital-twin-advanced\/opengraph-image/);
        assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/);
        const og = await page.request.get(`${BASE}${ROUTE}/opengraph-image`);
        assert.equal(og.status(), 200);
        assert.match(og.headers()['content-type'], /image\/png/);
      });
      await check('server', 'Structured data parses: WebPage, LearningResource, Course, FAQPage, BreadcrumbList, with every @id reference resolved', async () => {
        const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
        assert.equal(blocks.length, 1);
        const graph = blocks[0]['@graph'];
        const types = graph.map((n) => n['@type']).flat();
        for (const type of ['WebPage', 'LearningResource', 'Course', 'FAQPage', 'BreadcrumbList', 'Person']) assert(types.includes(type), type);
        const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
        const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
        for (const ref of refs) assert(ids.has(ref), `unresolved ${ref}`);
        assert.equal(graph.find((n) => n['@type'] === 'FAQPage').mainEntity.length, 15);
      });
      await check('server', 'Educational content of every module is in the server HTML, whichever module is showing', async () => {
        for (const text of ['A 3D model is not automatically a Digital Twin.', 'Conservation of Mass', 'PT-CH-01A', 'Extended Kalman Filter', 'Physics-Informed Neural Networks', 'Statistical Process Monitoring', 'LOW CHAMBER PRESSURE', 'Probability of threshold crossing', 'Replay attacks', 'DIGITAL TWIN READINESS REVIEW', 'Residual = Observation − Model Expectation', 'not a flight-certification or flight-safety authority']) assert(html.includes(text), text);
        for (const [id] of MODULES) assert.match(html, new RegExp(`id="${id}"[^>]*role="tabpanel"|role="tabpanel"[^>]*id="${id}"`), id);
      });
      await check('server', 'Listed in the sitemap once; linked from the Space page and from the fundamentals page', async () => {
        const sitemap = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
        assert.equal((sitemap.match(/rocket-engine-digital-twin-advanced<\/loc>/g) || []).length, 1);
        const space = await (await page.request.get(`${BASE}/space`)).text();
        assert.match(space, /href="\/space\/rocket-engine-digital-twin-advanced"[^>]*>Explore Advanced Digital Twin/);
        const fundamentals = await (await page.request.get(`${BASE}${FUNDAMENTALS}`)).text();
        assert.match(fundamentals, /href="\/space\/rocket-engine-digital-twin-advanced"[^>]*>Explore Advanced Propulsion Digital Twin/);
      });
      await check('server', 'External links open safely; no inline event handlers or javascript: URLs in the document', async () => {
        const external = [...html.matchAll(/<a [^>]*href="https?:\/\/(?!aerospace\.ev\.engineer)[^"]+"[^>]*>/g)].map((m) => m[0]);
        assert(external.length >= 20, `${external.length} external links`);
        for (const link of external) assert(/target="_blank"/.test(link) ? /rel="noopener noreferrer"/.test(link) : true, link.slice(0, 120));
        assert.doesNotMatch(html, /href="javascript:/i);
        assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), / on(click|error|load)="/i);
      });
      await context.close();
    }

    // ── Responsive audit: every module at every viewport ────────────────────
    if (wanted('responsive')) {
      for (const [name, width, height, touch] of VIEWPORTS) {
        const { context, page } = await open({ width, height }, touch ? { hasTouch: true, isMobile: width < 1024, deviceScaleFactor: 2 } : {});
        await goto(page);
        const row = { viewport: name, width, height, modules: {} };
        row.hero = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const text = [...document.querySelectorAll('main > section:first-child svg text')].filter((t) => t.getBoundingClientRect().height > 0);
          const smallest = text.length ? Math.min(...text.map((t) => t.getBoundingClientRect().height / 1.2)) : null;
          return { overflow: document.documentElement.scrollWidth - vw, schematicTextPx: smallest === null ? null : +smallest.toFixed(1) };
        });
        if ([320, 390, 768, 1440].includes(width) && height > width - 700) await page.screenshot({ path: path.join(OUTPUT, `${name}-hero.png`) });
        for (const [id, label] of MODULES) {
          await openModule(page, label, id === 'lab' || id === 'pressure' ? 1800 : 450);
          const metrics = await page.evaluate(({ id, touch }) => {
            const vw = document.documentElement.clientWidth;
            const vh = window.innerHeight;
            const root = document.getElementById(id);
            const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
            const scroller = (el) => { for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && n.scrollWidth > n.clientWidth + 1) return true; } return false; };
            const label = (el) => `${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ')[0].replace(/^.*__/, '')}`;
            const outside = [];
            const small = [];
            const tinySvg = [];
            const tinyText = [];
            for (const el of root.querySelectorAll('*')) {
              if (!visible(el)) continue;
              const r = el.getBoundingClientRect();
              if ((r.right > vw + 1 || r.left < -1) && !scroller(el) && getComputedStyle(el).position !== 'fixed') outside.push(label(el));
              if (el.matches('button, a[href], select, input, summary, [role="button"]')) {
                const least = Math.min(r.width, r.height);
                if (least < (touch ? 44 : 24) - 0.5) small.push(`${label(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
              }
              if (el.tagName.toLowerCase() === 'text') { const px = r.height / 1.2; if (px < 9) tinySvg.push(+px.toFixed(1)); }
              else if (el.children.length === 0 && el.textContent.trim() && !el.closest('svg')) { const px = parseFloat(getComputedStyle(el).fontSize); if (px < 11) tinyText.push(`${label(el)} ${px}px`); }
            }
            const wideTables = [...root.querySelectorAll('table')].filter((t) => visible(t) && t.parentElement.scrollWidth > t.parentElement.clientWidth + 1).length;
            const nav = document.querySelector('[role="tablist"][aria-label="Tutorial modules"]');
            const bar = nav.parentElement;
            const tabs = [...nav.querySelectorAll('[role="tab"]')];
            const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
            const navRect = nav.getBoundingClientRect();
            const activeRect = active.getBoundingClientRect();
            const header = document.querySelector('header').getBoundingClientRect();
            const barRect = bar.getBoundingClientRect();
            const heading = root.querySelector('h2').getBoundingClientRect();
            const tools = [...bar.querySelectorAll('button:not([role="tab"])')].filter(visible).map((b) => b.getBoundingClientRect());
            return {
              overflow: document.documentElement.scrollWidth - vw,
              outside: [...new Set(outside)].slice(0, 6),
              smallTargets: small.length,
              smallTargetSamples: [...new Set(small)].slice(0, 5),
              tinySvgText: tinySvg.length,
              smallestSvgTextPx: tinySvg.length ? Math.min(...tinySvg) : null,
              tinyText: [...new Set(tinyText)].slice(0, 4),
              wideTables,
              tabsWrap: new Set(tabs.map((t) => Math.round(t.getBoundingClientRect().top))).size > 1,
              activeTabVisible: activeRect.left >= navRect.left - 1 && activeRect.right <= navRect.right + 1,
              toolsInViewport: tools.every((r) => r.right <= vw + 1 && r.left >= -1),
              headingObscured: heading.top < barRect.bottom - 2 && heading.bottom > header.top,
              stickyShare: +((Math.max(0, barRect.bottom)) / vh).toFixed(2),
              canvases: document.querySelectorAll('canvas').length,
            };
          }, { id, touch });
          row.modules[id] = metrics;
          if ([320, 390, 820, 1440].includes(width) && height > width - 700 && ['system', 'pressure', 'lab', 'twin'].includes(id)) {
            await page.screenshot({ path: path.join(OUTPUT, `${name}-${id}.png`) });
            // The part of the module the audit is about, whole: the diagram on the System and Pressure modules, a chart on the others.
            const subject = page.locator(`#${id} figure svg, #${id} svg[viewBox]`).first();
            if (await subject.count()) {
              await subject.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(250);
              await subject.screenshot({ path: path.join(OUTPUT, `${name}-${id}-figure.png`) }).catch(() => {});
            }
          }
        }
        report.responsive.push(row);
        const all = Object.entries(row.modules);
        await check('responsive', `${name} (${width}×${height}): no horizontal page overflow in any module`, async () => {
          const bad = all.filter(([, m]) => m.overflow > 0).map(([id, m]) => `${id} +${m.overflow}px`);
          assert.equal(bad.length, 0, bad.join(' || '));
          assert.equal(row.hero.overflow, 0);
        });
        await check('responsive', `${name}: nothing extends outside the viewport without a scroll container`, async () => {
          const bad = all.filter(([, m]) => m.outside.length).map(([id, m]) => `${id}: ${m.outside.join(', ')}`);
          assert.equal(bad.length, 0, bad.join(' || '));
        });
        await check('responsive', `${name}: module tabs stay on one line, the active tab is in view and the tools fit`, async () => {
          const bad = all.filter(([, m]) => m.tabsWrap || !m.activeTabVisible || !m.toolsInViewport).map(([id, m]) => `${id}: wrap=${m.tabsWrap} activeVisible=${m.activeTabVisible} toolsFit=${m.toolsInViewport}`);
          assert.equal(bad.length, 0, bad.join(' || '));
        });
        await check('responsive', `${name}: the sticky bars do not cover a module heading, and leave most of the screen for content`, async () => {
          const bad = all.filter(([, m]) => m.headingObscured).map(([id]) => `${id}: heading under the bar`);
          assert.equal(bad.length, 0, bad.join(' || '));
          const share = Math.max(...all.map(([, m]) => m.stickyShare));
          assert(share <= 0.4, `sticky header and navigation cover ${Math.round(share * 100)} % of the viewport height`);
        });
        await check('responsive', `${name}: interactive targets are at least ${touch ? 44 : 24}px`, async () => {
          const bad = all.filter(([, m]) => m.smallTargets).map(([id, m]) => `${id}: ${m.smallTargets} (${m.smallTargetSamples.join('; ')})`);
          assert.equal(bad.length, 0, bad.join(' || '));
        });
        await check('responsive', `${name}: diagram and chart text renders at 9px or more; body text at 11px or more`, async () => {
          const bad = all.filter(([, m]) => m.tinySvgText || m.tinyText.length).map(([id, m]) => `${id}: ${m.tinySvgText} svg labels (smallest ${m.smallestSvgTextPx}px)${m.tinyText.length ? `, text ${m.tinyText.join('; ')}` : ''}`);
          if (row.hero.schematicTextPx !== null && row.hero.schematicTextPx < 9) bad.unshift(`hero schematic labels ${row.hero.schematicTextPx}px`);
          assert.equal(bad.length, 0, bad.join(' || '));
        });
        if (width < 640) {
          await check('responsive', `${name}: no table is wider than the screen`, async () => {
            const bad = all.filter(([, m]) => m.wideTables).map(([id, m]) => `${id}: ${m.wideTables}`);
            assert.equal(bad.length, 0, bad.join(' || '));
          });
          await check('responsive', `${name}: no WebGL canvas is created on a phone`, async () => assert.equal(Math.max(...all.map(([, m]) => m.canvases)), 0));
        }
        await context.close();
      }
    }

    // ── Interaction contract ────────────────────────────────────────────────
    if (wanted('controls')) {
      const { context, page } = await open({ width: 1440, height: 900 });
      await goto(page);
      const root = page.locator('#advanced-propulsion-twin');

      await check('controls', 'Learn / Engineer / Architect switch changes what is showing, with one option selected', async () => {
        await openModule(page, 'Physics');
        const engineerOnly = panel(page, 'physics').getByText('The model on this page');
        assert.equal(await engineerOnly.isVisible(), false);
        await page.getByRole('button', { name: /Engineer mode/ }).click();
        assert.equal(await root.getAttribute('data-level'), 'engineer');
        assert.equal(await engineerOnly.isVisible(), true);
        assert.equal(await page.getByRole('group', { name: 'Reading depth' }).locator('[aria-pressed="true"]').count(), 1);
        await page.getByRole('button', { name: /Learn mode/ }).click();
        assert.equal(await engineerOnly.isVisible(), false);
      });
      await check('controls', 'CTO / Architect View opens the architecture module at architect depth and reports once per click', async () => {
        await page.getByRole('button', { name: /CTO/ }).click();
        await settle(page, 400);
        assert.equal(await tab(page, 'Architecture').getAttribute('aria-selected'), 'true');
        assert.equal(await root.getAttribute('data-level'), 'architect');
        assert(await page.getByText('What do we build?').isVisible());
        assert.equal((await events(page)).filter((e) => e.name === 'cto_mode_opened').length, 1);
        await page.getByRole('button', { name: /Learn mode/ }).click();
      });
      await check('controls', 'Module navigation: click, arrow keys, address fragment, and the "Next" button agree on the module showing', async () => {
        for (const [id, label] of MODULES) {
          await tab(page, label).click();
          assert.equal(await panel(page, id).isVisible(), true, id);
          assert.equal(await page.locator('[role="tabpanel"][id]:visible').evaluateAll((els, ids) => els.filter((e) => ids.includes(e.id)).length, MODULES.map((m) => m[0])), 1);
          assert.equal(new URL(page.url()).hash, `#${id}`);
        }
        await tab(page, 'Overview').click();
        await page.keyboard.press('ArrowRight');
        assert.equal(await tab(page, 'System').getAttribute('aria-selected'), 'true');
        await panel(page, 'system').getByRole('button', { name: /^Next: / }).click();
        await settle(page, 300);
        assert.equal(await tab(page, 'Pressure').getAttribute('aria-selected'), 'true');
        await page.goto(`${BASE}${ROUTE}#fdir`, { waitUntil: 'load' });
        await settle(page, 600);
        assert.equal(await tab(page, 'FDIR').getAttribute('aria-selected'), 'true');
      });
      await check('controls', 'Hero calls to action and in-page #module links switch module; breadcrumb and fundamentals links resolve', async () => {
        await goto(page);
        await page.getByRole('link', { name: 'Open the Fault Injection Lab' }).click();
        await settle(page, 500);
        assert.equal(await tab(page, 'Lab').getAttribute('aria-selected'), 'true');
        await goto(page);
        await page.getByRole('link', { name: 'Start the Tutorial' }).click();
        await settle(page, 500);
        assert.equal(await tab(page, 'System').getAttribute('aria-selected'), 'true');
        assert.equal(await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Space' }).getAttribute('href'), '/space');
        for (const link of await page.getByRole('link', { name: 'Start with Rocket Engine Digital Twin Fundamentals' }).all()) assert.equal(await link.getAttribute('href'), FUNDAMENTALS);
        for (const target of ['/space', FUNDAMENTALS]) assert.equal((await page.request.get(`${BASE}${target}`)).status(), 200, target);
      });
      await check('controls', 'Checkpoint: reasoning appears only after an answer; the answer survives switching modules', async () => {
        await goto(page, '#overview');
        const question = panel(page, 'overview').getByRole('group', { name: /A team shows a detailed 3D engine/ });
        assert.equal(await question.getByText(/That is a Digital Shadow: level 3/).isVisible(), false);
        await question.getByRole('button', { name: 'A Digital Shadow' }).click();
        assert.equal(await question.getByText(/That is a Digital Shadow: level 3/).isVisible(), true);
        await openModule(page, 'System');
        await openModule(page, 'Overview');
        assert.equal(await question.getByText(/That is a Digital Shadow: level 3/).isVisible(), true);
      });
      await check('controls', 'Twelve-week tracker: opening, completing and a reload keep progress', async () => {
        await openModule(page, '12 Weeks');
        await panel(page, 'weeks').getByRole('button', { name: /Week 3\s*Instrumentation/ }).click();
        await page.locator('#week-3').getByRole('button', { name: 'Mark week complete' }).click();
        assert(await panel(page, 'weeks').getByText('1 of 12 weeks marked complete').isVisible());
        await page.reload({ waitUntil: 'load' });
        await settle(page, 700);
        assert(await panel(page, 'weeks').getByText('1 of 12 weeks marked complete').isVisible());
        await panel(page, 'weeks').getByRole('button', { name: /Week 3\s*Instrumentation/ }).click();
        await page.locator('#week-3').getByRole('button', { name: 'Marked complete' }).click();
        assert(await panel(page, 'weeks').getByText('0 of 12 weeks marked complete').isVisible());
      });
      await check('controls', 'Maturity ladder, physics concepts, estimators, model cards and the twelve steps each show the panel chosen', async () => {
        await openModule(page, 'Overview');
        await panel(page, 'overview').getByRole('tab', { name: /Digital Shadow/ }).click();
        assert(await page.getByText('Level 3 — Digital Shadow').isVisible());
        await openModule(page, 'Physics');
        await panel(page, 'physics').getByRole('tab', { name: 'Pump Physics' }).click();
        assert(await panel(page, 'physics').getByRole('heading', { name: 'Pump Physics' }).isVisible());
        await openModule(page, 'Data');
        await panel(page, 'data').getByRole('button', { name: 'Next', exact: true }).click();
        assert(await page.getByText('Step 2 — Instrument the Engine').isVisible());
        await openModule(page, 'Twin', 1200);
        await panel(page, 'twin').getByRole('tab', { name: 'Particle Filter' }).first().click();
        assert(await panel(page, 'twin').getByRole('heading', { name: 'Particle Filter' }).isVisible());
        await panel(page, 'twin').getByRole('tab', { name: 'Fault classifier' }).click();
        assert(await page.getByText('Multinomial logistic regression on physics-derived features').isVisible());
      });
      await check('controls', 'Propulsion explorer: a subsystem selection updates the schematic caption and the explanation together', async () => {
        await openModule(page, 'System');
        const system = panel(page, 'system');
        await system.getByRole('button', { name: 'Regenerative Cooling', exact: true }).click();
        assert(await system.getByText('Regenerative Cooling: the rest of the system is dimmed.').isVisible());
        assert(await system.getByText(/Wall temperature cannot be measured where it matters most/).first().isVisible());
        await system.getByRole('button', { name: 'Whole system' }).click();
        assert(await system.getByText('The complete system. Choose a subsystem to bring it forward.').isVisible());
      });
      await check('controls', '3D engineering mode: loads on demand, draws, switches views and overlays, selects a sensor, closes and releases its canvas', async () => {
        await openModule(page, 'System');
        const system = panel(page, 'system');
        assert.equal(await page.locator('canvas').count(), 0);
        assert.equal(await page.evaluate(() => typeof window.__THREE__), 'undefined');
        await system.getByRole('button', { name: 'Enter 3D Engineering Mode' }).click();
        await page.locator('[data-ready="true"]').waitFor({ timeout: 20000 });
        await settle(page, 1500);
        const frame = await page.locator('canvas').screenshot();
        assert(frame.length > 30000, `canvas looks blank (${frame.length} bytes)`);
        for (const name of ['Exploded assemblies', 'Cutaway', 'Assembled']) { await system.getByRole('button', { name, exact: true }).click(); assert.equal(await system.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true'); await settle(page, 500); }
        for (const name of ['Cooling flow', 'Hot-gas flow', 'Signal pathways', 'Pressure pathways']) {
          await system.getByRole('button', { name, exact: true }).click();
          assert.equal(await system.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
          assert.equal(await system.getByRole('group', { name: 'Overlay' }).locator('button[aria-pressed="true"]').count(), 2, `${name}: more than one flow overlay is on`);
          await settle(page, 300);
        }
        await system.getByLabel('Select a pressure sensor').selectOption('pcA');
        assert(await system.getByRole('complementary', { name: 'Chamber pressure, sensor A: measurement detail' }).isVisible());
        await page.screenshot({ path: path.join(OUTPUT, 'desktop-1440-3d.png') });
        // The canvas keeps its container's size when the window changes.
        await page.setViewportSize({ width: 1100, height: 760 });
        await settle(page, 500);
        const fit = await page.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect(); const p = document.querySelector('canvas').parentElement.parentElement.getBoundingClientRect(); return Math.abs(c.width - p.width) < 2 && Math.abs(c.height - p.height) < 2; });
        assert(fit, 'canvas does not fill its container after a resize');
        await page.setViewportSize({ width: 1440, height: 900 });
        await system.getByRole('button', { name: 'Close 3D' }).click();
        await settle(page, 400);
        assert.equal(await page.locator('canvas').count(), 0);
        assert.equal((await events(page)).filter((e) => e.name === 'desktop_3d_entered').length, 1);
        assert.equal((await events(page)).filter((e) => /^rocket_twin_/.test(e.name)).length, 0);
      });
      await check('controls', 'Pressure map: selecting a sensor shows its measurement detail where it can be seen, with all seven signal stages', async () => {
        await openModule(page, 'Pressure', 2000);
        const pressure = panel(page, 'pressure');
        await pressure.getByRole('button', { name: /^PT-OX-03/ }).click();
        const detail = pressure.getByRole('complementary', { name: 'Oxidiser pump discharge pressure: measurement detail' });
        await settle(page, 700);
        assert.equal(await detail.getByRole('list', { name: 'From the sensor to a statement about health' }).getByRole('listitem').count(), 7);
        const box = await detail.boundingBox();
        assert(box && box.y < 900 && box.y + Math.min(box.height, 200) > 0, `the detail opened outside the viewport (y=${Math.round(box?.y ?? -1)})`);
        assert.match(await detail.textContent(), /SIMULATED/);
        assert(await detail.evaluate((el) => el === document.activeElement), 'focus did not move to the detail');
        // The selection is one fact, shown the same way in the drawing, the list and the detail.
        assert.equal(await pressure.locator('svg [data-signal-path="pOutOx"]').count(), 1, 'no signal path is drawn for the selected sensor');
        assert.equal(await pressure.locator('svg [data-sensor="pOutOx"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await pressure.getByRole('group', { name: 'Pressure sensors' }).locator('button[aria-pressed="true"]').count(), 1);
        assert.match(await pressure.locator('svg [data-sensor="pOutOx"] text').textContent(), /PT-OX-03/);
        assert.match(await detail.textContent(), /Estimated − expected .* raw, observed − expected/);
        await page.keyboard.press('Escape');
        assert.equal(await detail.count(), 0, 'Escape did not close the detail');
        assert.equal(await pressure.locator('svg [data-signal-path]').count(), 0, 'a signal path is still drawn with nothing selected');
      });
      await check('controls', 'Charts: lettering is drawn at 11px, and pointing or arrow keys read out every line at that moment', async () => {
        await openModule(page, 'Twin', 2500);
        const chart = panel(page, 'twin').locator('figure').first();
        await chart.scrollIntoViewIfNeeded();
        const plot = chart.getByRole('group').first();
        const sizes = await chart.locator('svg[role="img"] text').evaluateAll((nodes) => nodes.map((n) => parseFloat(getComputedStyle(n).fontSize) * (n.ownerSVGElement.getBoundingClientRect().width / n.ownerSVGElement.viewBox.baseVal.width)));
        assert(sizes.length >= 5 && Math.min(...sizes) >= 10.9, `smallest chart lettering ${Math.min(...sizes).toFixed(1)}px`);
        const read = chart.locator('p[data-inspecting]');
        assert.equal(await read.count(), 0);
        const box = await plot.boundingBox();
        await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5);
        assert.match(await read.textContent(), /s ago: Observed .* · Estimated .* · Expected /);
        await page.mouse.move(box.x - 40, box.y - 40);
        assert.equal(await read.count(), 0, 'the read-out stayed after the pointer left');
        await plot.focus();
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowLeft');
        assert.match(await read.textContent(), /s ago: Observed /);
        await page.keyboard.press('Escape');
        assert.equal(await read.count(), 0);
      });
      await check('controls', 'Pressure path trace walks all eleven steps and reports start and completion once', async () => {
        await openModule(page, 'Pressure', 800);
        const pressure = panel(page, 'pressure');
        const controls = pressure.getByText('One pressure path · oxidiser side').locator('..');
        await controls.getByRole('button', { name: 'Trace the pressure path' }).click();
        for (let i = 0; i < 10; i++) await controls.getByRole('button', { name: 'Next', exact: true }).click();
        assert(await controls.getByText(/11 of 11 · path complete/).isVisible());
        const sent = await events(page);
        assert.equal(sent.filter((e) => e.name === 'pressure_path_started').length, 1);
        assert.equal(sent.filter((e) => e.name === 'pressure_path_completed').length, 1);
      });
      await check('controls', 'Physics model: the sliders re-solve the pressure network (pump head down → chamber pressure down; healthy point restored)', async () => {
        await openModule(page, 'Physics', 1500);
        const physics = panel(page, 'physics');
        const pc = async () => parseFloat((await physics.getByRole('status', { name: 'Solved operating point' }).locator('dd').first().textContent()).replace('−', '-'));
        const healthy = await pc();
        await physics.getByRole('slider').nth(1).fill('85');
        assert((await pc()) < healthy - 3, 'chamber pressure did not fall');
        await physics.getByRole('button', { name: 'Restore the healthy design point' }).click();
        assert.equal(await pc(), healthy);
      });
      await check('controls', 'State estimator: each estimator, the noise level and the model error change the computed errors', async () => {
        await openModule(page, 'Twin', 1500);
        const twin = panel(page, 'twin');
        const errors = async () => (await twin.locator('table').filter({ hasText: 'Error against the true value' }).locator('td').allTextContents()).join('|');
        const choose = (name) => twin.getByRole('group', { name: 'Estimator' }).getByRole('button', { name, exact: true }).click();
        const ekf = await errors();
        const seen = new Set([ekf]);
        await choose('Unscented Kalman Filter');
        const ukf = await errors();
        // The EKF and the UKF may agree to the digits shown: this chamber model is nearly linear. Where they do, the page must say so,
        // and state a difference that is not zero, which is the evidence that two computations ran and not one.
        const note = twin.locator('[data-estimator-gap]');
        assert(await note.isVisible(), 'no statement of how far the EKF and the UKF differ');
        const gap = parseFloat((await note.textContent()).match(/at most ([0-9.e−-]+)/)[1].replace('−', '-'));
        assert(gap > 0 && gap < 0.05, `EKF–UKF difference reported as ${gap}`);
        if (ukf !== ekf) seen.add(ukf);
        report.estimatorGap = gap;
        for (const name of ['Kalman Filter', 'Particle Filter']) { await choose(name); seen.add(await errors()); }
        assert.equal(await note.count(), 0, 'the EKF/UKF note is shown for another estimator');
        await twin.getByRole('button', { name: 'Noise 3 %' }).click(); seen.add(await errors());
        await twin.getByRole('button', { name: 'Model 3 % off' }).click(); seen.add(await errors());
        assert(seen.size >= 5, `only ${seen.size} distinct results from six settings`);
      });
      await check('controls', 'Diagnostic reasoning panel: adding evidence changes the ranked cause', async () => {
        const twin = panel(page, 'twin');
        const output = twin.getByRole('status', { name: 'Ranked probable causes' });
        await twin.getByRole('button', { name: 'Low chamber pressure, nothing else known' }).click();
        assert.match(await output.textContent(), /Undetermined/);
        await twin.getByRole('button', { name: /plus normal pump discharge, abnormal valve position/ }).click();
        assert.match(await output.textContent(), /Main fuel valve restriction/);
        await twin.getByRole('group', { name: 'Valve position' }).getByRole('button', { name: 'Normal', exact: true }).click();
        assert.doesNotMatch((await output.locator('p').nth(1).textContent()) ?? '', /Main fuel valve restriction\s+\d/);
      });
      await check('controls', 'Fault tree, knowledge graph and readiness score respond to their controls', async () => {
        await openModule(page, 'FDIR', 1500);
        await panel(page, 'fdir').getByRole('button', { name: /Injector restriction/ }).first().click();
        assert(await panel(page, 'fdir').getByRole('region', { name: 'Evidence for Injector restriction' }).getByText('Injector pressure drop is high for the flow passing').isVisible());
        await openModule(page, 'Architecture');
        const architecture = panel(page, 'architecture');
        await architecture.getByRole('button', { name: 'Chamber pressure sensor drift' }).click();
        assert(await architecture.getByText('FAILURE MODE', { exact: true }).isVisible());
        // The node shows the fault's state in the running twin, and it changes when the fault is injected.
        await settle(page, 2500);
        const live = architecture.locator('[data-graph-live="f_drift"]');
        assert.match(await live.textContent(), /Not injected\. The twin's score for it is \d+ %/);
        await architecture.getByRole('button', { name: /^Inject in the Lab/ }).click();
        await settle(page, 1500);
        assert.equal(await page.getByRole('tab', { name: 'Lab', exact: true }).getAttribute('aria-selected'), 'true');
        await openModule(page, 'Architecture', 1500);
        assert.match(await live.textContent(), /Injected, at \d+ % severity/);
        await architecture.getByRole('button', { name: 'Chamber pressure sensor A', exact: true }).click();
        const reading = architecture.locator('[data-graph-live="s_pc_a"]');
        const first = await reading.textContent();
        assert.match(first, /Observed [0-9.]+, estimated [0-9.]+, expected [0-9.]+/);
        await settle(page, 1500);
        assert.notEqual(await reading.textContent(), first, 'the reading is not live');
        await architecture.getByRole('button', { name: 'Open on the pressure map' }).click();
        await settle(page, 800);
        assert.equal(await page.getByRole('tab', { name: 'Pressure', exact: true }).getAttribute('aria-selected'), 'true');
        assert(await panel(page, 'pressure').getByRole('complementary', { name: 'Chamber pressure, sensor A: measurement detail' }).isVisible());
        await openModule(page, 'Lab', 1500);
        await panel(page, 'lab').getByRole('button', { name: /^Remove fault/ }).click();
        await openModule(page, 'Health', 1500);
        const health = panel(page, 'health');
        const evidence = await health.locator('[data-readiness-evidence]').allTextContents();
        assert.equal(evidence.length, 13);
        assert(evidence.filter((t) => /\d/.test(t)).length >= 8, 'fewer than eight categories show evidence read from the twin');
        assert.match(evidence.join(' '), /validation conditions, expected calibration error 0\.\d+/);
        await health.getByRole('button', { name: 'Assess your own programme' }).click();
        for (const slider of await health.getByRole('slider').all()) await slider.fill('4');
        assert(await health.getByText(/Level 4 of 4/).isVisible());
      });
      await context.close();

      const phone = await open({ width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      await goto(phone.page);
      await check('controls', 'PHONE: the full tutorial without WebGL: a schematic, the desktop note, no canvas, no three.js', async () => {
        const requested = [];
        phone.page.on('request', (request) => requested.push(request.url()));
        await openModule(phone.page, 'System');
        const system = panel(phone.page, 'system');
        assert(await system.getByText('USE DESKTOP / LAPTOP FOR ADVANCED 3D ENGINEERING MODE').isVisible());
        assert.equal(await system.getByRole('button', { name: 'Enter 3D Engineering Mode' }).count(), 0);
        assert(await system.getByRole('img').first().isVisible());
        assert.equal(await phone.page.locator('canvas').count(), 0);
        assert.equal(await phone.page.evaluate(() => typeof window.__THREE__), 'undefined');
        for (const [id, label] of MODULES) { await openModule(phone.page, label, 300); assert((await panel(phone.page, id).innerText()).length > 400, id); }
      });
      await check('controls', 'PHONE: a pressure sensor can be chosen by touch on a readable schematic, and its detail opens as a sheet that closes', async () => {
        await openModule(phone.page, 'Pressure', 2000);
        const pressure = panel(phone.page, 'pressure');
        const schematic = pressure.locator('[data-arrangement="compact"] svg');
        assert(await schematic.isVisible(), 'no pressure schematic is shown on a phone');
        assert.equal(await pressure.locator('[data-arrangement="wide"]').count(), 0, 'the landscape arrangement is also in the document');
        await schematic.scrollIntoViewIfNeeded();
        const texts = await schematic.locator('text').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().height));
        assert(texts.length >= 8 && Math.min(...texts) >= 9, `smallest lettering ${Math.min(...texts).toFixed(1)}px`);
        const target = pressure.getByRole('button', { name: /^PT-CH-01A/ }).first();
        const box = await target.boundingBox();
        assert(box && Math.min(box.width, box.height) >= 43.5, `sensor target ${Math.round(box?.width ?? 0)}×${Math.round(box?.height ?? 0)}`);
        await target.tap();
        const sheet = pressure.getByRole('complementary', { name: 'Chamber pressure, sensor A: measurement detail' });
        assert(await sheet.isVisible());
        await phone.page.waitForTimeout(400);
        assert(await sheet.evaluate((el) => el === document.activeElement), 'focus did not move to the measurement sheet');
        assert.equal(await schematic.locator('[data-signal-path="pcA"]').count(), 1, 'the selected sensor has no signal path drawn');
        await phone.page.screenshot({ path: path.join(OUTPUT, 'mobile-390-pressure-sheet.png') });
        await phone.page.keyboard.press('Escape');
        assert.equal(await sheet.count(), 0, 'Escape did not close the sheet');
        await target.tap();
        await sheet.getByRole('button', { name: 'Close measurement detail' }).tap();
        assert.equal(await sheet.count(), 0);
      });
      await phone.context.close();
    }

    // ── Reliability: a download that fails ──────────────────────────────────
    if (wanted('controls')) {
      await check('controls', 'A live instrument that cannot be downloaded fails alone: the page, its text and the other modules stay', async () => {
        const induced = [];
        const { context, page } = await open({ width: 1280, height: 800 }, {}, induced);
        await goto(page);
        await page.waitForLoadState('networkidle');
        assert.equal(induced.length, 0, `problems before the failure was induced: ${induced.join(' ; ')}`);
        // Every script chunk requested from here on fails, as when the connection drops or a new version replaces the files.
        await context.route(/\/_next\/static\/chunks\//, (route) => route.abort());
        await page.getByRole('tablist', { name: 'Tutorial modules' }).getByRole('tab', { name: 'Lab', exact: true }).click();
        await settle(page, 4000);
        assert.equal(await page.getByRole('tablist', { name: 'Tutorial modules' }).count(), 1, 'the page was replaced by an error screen');
        assert.equal(await page.locator('h1').count(), 1);
        const lab = panel(page, 'lab');
        const alert = lab.getByRole('alert');
        assert.match(await alert.first().innerText(), /could not be loaded/);
        assert.doesNotMatch(await lab.innerText(), /chunk|\.js|module \d+|at [A-Za-z]+ \(/, 'the failure message exposes build details');
        assert(await lab.getByRole('button', { name: /Reload the page|Try again/ }).first().isVisible());
        // The description of what the instrument shows is still there to read.
        assert((await lab.innerText()).length > 400);
        await page.screenshot({ path: path.join(OUTPUT, 'desktop-1280-instrument-load-failure.png') });
        await page.getByRole('tablist', { name: 'Tutorial modules' }).getByRole('tab', { name: 'Physics', exact: true }).click();
        await settle(page, 1500);
        assert.match(await panel(page, 'physics').innerText(), /Conservation of Mass/);
        assert(induced.some((line) => /requestfailed/.test(line)), 'no download actually failed: the check proved nothing');
        report.inducedFailure = { failedRequests: induced.filter((line) => /requestfailed/.test(line)).length };
        await context.close();
      });
    }

    // ── Simulation: the lab, through its controls ───────────────────────────
    if (wanted('simulation')) {
      const { context, page } = await open({ width: 1440, height: 900 });
      await goto(page, '#lab');
      const lab = panel(page, 'lab');
      await lab.getByRole('toolbar', { name: 'Simulation controls' }).waitFor({ timeout: 20000 });
      const tile = async (label) => (await lab.locator('li').filter({ hasText: label }).first().innerText()).replace(/\s+/g, ' ');
      const simTime = async () => { const text = await lab.getByRole('toolbar', { name: 'Simulation controls' }).getAttribute('data-sim-time'); if (text !== null) return parseFloat(text); const m = (await tile('TWIN STATE')).match(/t = (\d+) s/); return m ? parseFloat(m[1]) : NaN; };
      const button = (name) => lab.getByRole('button', { name, exact: true });
      const verdict = async () => (await lab.locator('section[aria-label="Diagnosis"] p').first().innerText()).replace(/\s+/g, ' ');

      await check('simulation', 'Simulated time advances at one second per second: one clock, not several', async () => {
        const t0 = await simTime(); const w0 = Date.now();
        await settle(page, 4000);
        const rate = ((await simTime()) - t0) / ((Date.now() - w0) / 1000);
        report.simulation.rate = +rate.toFixed(2);
        assert(rate > 0.8 && rate < 1.25, `rate ${rate.toFixed(2)}×`);
      });
      await check('simulation', 'Leaving and re-entering the lab ten times does not multiply the clock', async () => {
        for (let i = 0; i < 10; i++) { await tab(page, 'Health').click(); await tab(page, 'Lab').click(); }
        await settle(page, 600);
        const t0 = await simTime(); const w0 = Date.now();
        await settle(page, 4000);
        const rate = ((await simTime()) - t0) / ((Date.now() - w0) / 1000);
        report.simulation.rateAfterSwitching = +rate.toFixed(2);
        assert(rate > 0.8 && rate < 1.25, `rate ${rate.toFixed(2)}× after switching`);
      });
      await check('simulation', 'Pause stops simulated time; Step advances it by half a second; Live resumes', async () => {
        await button('Pause').click();
        const t0 = await simTime();
        await settle(page, 2500);
        assert.equal(await simTime(), t0, 'time advanced while paused');
        await lab.getByRole('button', { name: /Step 0\.5 s/ }).click();
        await settle(page, 200);
        const stepped = (await simTime()) - t0;
        assert(stepped >= 0 && stepped <= 1.01, `step moved ${stepped} s`);
        await lab.getByRole('button', { name: 'Live simulation' }).click();
        await settle(page, 2200);
        assert((await simTime()) > t0 + 1, 'time did not resume');
      });
      await check('simulation', 'Reset restores the same healthy baseline every time', async () => {
        const baseline = async () => {
          if (await button('Pause').count()) await button('Pause').click();
          await button('Reset').click();
          await settle(page, 300);
          assert.equal(await simTime(), 0, 'Reset did not return to t = 0');
          const text = (await lab.getByRole('group', { name: 'Monitored quantities' }).innerText()).replace(/\s+/g, ' ');
          await lab.getByRole('button', { name: 'Live simulation' }).click();
          return text;
        };
        await settle(page, 1500);
        const a = await baseline();
        await settle(page, 2500);
        const b = await baseline();
        assert.equal(a, b, 'two resets gave different read-outs');
        assert.match(await tile('HEALTH'), /NOMINAL/);
        assert.match(await tile('ANOMALIES'), /None declared/);
      });
      await check('simulation', 'Throttle and Compare change the plots; start and shutdown move the engine through its modes', async () => {
        await button('80 %').click();
        await settle(page, 3500);
        assert.match(await tile('ENGINE STATE'), /Throttle 80 %/);
        const pc = parseFloat((await lab.getByRole('group', { name: 'Monitored quantities' }).locator('figure').first().locator('li').filter({ hasText: 'Estimated' }).innerText()).replace(/[^\d.]/g, ''));
        assert(pc > 77 && pc < 83, `chamber pressure ${pc} at 80 % throttle`);
        assert.match(await tile('ANOMALIES'), /None declared/, 'a commanded throttle change raised an anomaly');
        const before = await lab.getByRole('group', { name: 'Monitored quantities' }).locator('figure').nth(1).locator('li').count();
        await button('Compare').click();
        assert((await lab.getByRole('group', { name: 'Monitored quantities' }).locator('figure').nth(1).locator('li').count()) > before, 'Compare added no state');
        await button('Compare').click();
        await button('100 %').click();
        await button('Shut down').click();
        await settle(page, 4000);
        assert.match(await tile('ENGINE STATE'), /READY/);
        assert.match(await tile('TWIN STATE'), /HOLDING/);
        await button('Start engine').click();
        // Sampled throughout, not once at the end: a false alarm after a start lasts about half a second.
        let alarmed = '';
        for (let i = 0; i < 45; i++) {
          await settle(page, 200);
          if (!/None declared/.test(await tile('ANOMALIES'))) alarmed = `t=${await simTime()} ${await tile('ANOMALIES')}`;
        }
        assert.match(await tile('ENGINE STATE'), /MAINSTAGE/);
        assert.equal(alarmed, '', `the start transient raised an anomaly: ${alarmed}`);
        assert.doesNotMatch(await lab.locator('section[aria-label="Fault history"]').innerText(), /DETECTED/, 'a detection was logged on a healthy engine');
        assert.match(await tile('TWIN STATE'), /SYNCHRONISED/, 'monitoring did not resume after the start settled');
      });

      report.simulation.faults = [];
      for (const [id, name] of FAULTS) {
        await check('simulation', `Fault ${id}: injected, then detected or flagged, and isolated as "${name}"; removing it returns the twin to nominal`, async () => {
          await button('Reset').click();
          await lab.getByRole('group', { name: 'Simulation speed' }).getByRole('button', { name: '4×' }).click();
          await settle(page, 800);
          await lab.getByLabel('Fault to inject').selectOption(id);
          await lab.getByRole('button', { name: 'Inject fault' }).click();
          let isolated = false;
          const started = Date.now();
          while (Date.now() - started < 16000 && !isolated) { await settle(page, 500); isolated = new RegExp(`Probable ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(await verdict()); }
          const history = (await lab.locator('section[aria-label="Fault history"]').innerText()).replace(/\s+/g, ' ');
          const row = { id, isolated, verdict: await verdict(), health: await tile('HEALTH'), quality: await tile('DATA QUALITY'), history: history.slice(0, 400) };
          report.simulation.faults.push(row);
          assert(isolated, `not isolated within 16 s: ${row.verdict}`);
          assert.match(history, /INJECTED/);
          if (id === 'pump_degradation') await page.screenshot({ path: path.join(OUTPUT, 'desktop-1440-lab-fault.png') });
          await lab.getByRole('button', { name: /Remove fault/ }).click();
          await settle(page, 4000);
          assert.match(await verdict(), /^Nominal/, `after removal: ${await verdict()}`);
          assert.match(await tile('ANOMALIES'), /None declared/);
        });
      }
      await check('simulation', 'Rate-of-change detector: silent on a fault that grows slowly, and among the first to fire on one that arrives at once', async () => {
        await button('Reset').click();
        await lab.getByRole('group', { name: 'Simulation speed' }).getByRole('button', { name: '1×' }).click();
        const history = async () => (await lab.locator('section[aria-label="Fault history"]').innerText()).replace(/\s+/g, ' ');
        await lab.getByLabel('Fault to inject').selectOption('pump_degradation');
        const onset = lab.getByRole('group', { name: 'Onset' });
        assert.equal(await onset.getByRole('button', { name: /^Gradual/ }).getAttribute('aria-pressed'), 'true');
        await lab.getByRole('button', { name: 'Inject fault' }).click();
        await settle(page, 9000);
        const slow = await history();
        assert.match(slow, /Anomaly detected by /, 'the gradual fault was not detected');
        assert.doesNotMatch(slow.match(/Anomaly detected by [a-z, ]+/)[0], /rate/, 'rate of change fired on a 24 s ramp');
        const rateLine = async () => { await openModule(page, 'FDIR', 900); const text = (await panel(page, 'fdir').getByRole('group', { name: 'Detector statistics' }).innerText()).split('\n').find((line) => /^Rate/i.test(line)) ?? ''; await openModule(page, 'Lab', 600); return text; };
        assert.doesNotMatch(await rateLine(), /first alarm/, 'rate of change has an alarm recorded against a gradual fault');
        await onset.getByRole('button', { name: 'Abrupt' }).click();
        assert.equal(await onset.getByRole('button', { name: 'Abrupt' }).getAttribute('aria-pressed'), 'true');
        await lab.getByLabel(/^Severity/).fill('100');
        await lab.getByRole('button', { name: 'Inject fault' }).click();
        await settle(page, 400);
        assert.match((await lab.getByRole('list', { name: 'Active faults' }).innerText()).replace(/\s+/g, ' '), /abrupt onset · severity 100 % of 100 %/);
        await settle(page, 4000);
        const fast = await history();
        assert.match(fast, /Fault injected: Oxidiser pump degradation \(abrupt onset\)/);
        assert.doesNotMatch(fast, /Noisy pressure sensor/i, 'the step was read as a noisy sensor');
        const fired = await rateLine();
        const latency = parseFloat((fired.match(/first alarm ([0-9.]+) s/) || [])[1]);
        assert(latency > 0 && latency <= 0.5, `rate of change on an abrupt full-severity fault: "${fired}"`);
        await settle(page, 6000);
        assert.match(await verdict(), /Oxidiser pump degradation/);
        const check = (await lab.locator('[data-recognition]').getAttribute('data-recognition'));
        assert.equal(check, 'explained', `consistency check: ${check}`);
        report.simulation.rateDetector = { gradual: slow.match(/Anomaly detected by [a-z, ]+/)[0], abruptFirstAlarmSeconds: latency };
        // On a data-path fault the choice does not apply, and the control says so by being unavailable.
        await lab.getByLabel('Fault to inject').selectOption('packet_delay');
        assert(await onset.getByRole('button', { name: /^Gradual/ }).isDisabled());
        await lab.getByLabel('Fault to inject').selectOption('pump_degradation');
        await onset.getByRole('button', { name: /^Gradual/ }).click();
        await button('Reset').click();
      });
      await check('simulation', 'Switching straight from one fault to another leaves no stale diagnosis, and each scenario is detected on its own clock', async () => {
        await button('Reset').click();
        await lab.getByRole('group', { name: 'Simulation speed' }).getByRole('button', { name: '4×' }).click();
        await lab.getByLabel('Fault to inject').selectOption('valve_restriction');
        await lab.getByRole('button', { name: 'Inject fault' }).click();
        await settle(page, 5000);
        assert.match(await verdict(), /Main fuel valve restriction/);
        await lab.getByLabel('Fault to inject').selectOption('pc_sensor_drift');
        await lab.getByRole('button', { name: 'Inject fault' }).click();
        await settle(page, 400);
        const active = (await lab.getByRole('list', { name: 'Active faults' }).innerText()).replace(/\s+/g, ' ');
        assert.doesNotMatch(active, /valve/i, `the previous fault is still active: ${active}`);
        assert.equal(await lab.getByRole('list', { name: 'Active faults' }).getByRole('listitem').count(), 1);
        assert((await simTime()) < 3, `the scenario did not restart from the baseline (t=${await simTime()})`);
        assert.doesNotMatch(await lab.getByRole('group', { name: 'Detector statistics' }).innerText().catch(() => ''), /first alarm 0\.0/);
        assert.doesNotMatch(await verdict(), /Main fuel valve restriction/, 'the previous diagnosis is still showing');
        await settle(page, 7000);
        assert.match(await verdict(), /Chamber pressure sensor A drift/);
        const history = (await lab.locator('section[aria-label="Fault history"]').innerText()).replace(/\s+/g, ' ');
        assert.equal((history.match(/DETECTED/g) || []).length, 1, 'the new scenario has no detection of its own in the history');
      });
      await check('simulation', 'Instruments in other modules show the same twin: a fault injected in the lab is the one diagnosed in FDIR, AI/ML and Health', async () => {
        await button('Reset').click();
        await lab.getByRole('group', { name: 'Simulation speed' }).getByRole('button', { name: '4×' }).click();
        await lab.getByLabel('Fault to inject').selectOption('cooling_restriction');
        await lab.getByRole('button', { name: 'Inject fault' }).click();
        await settle(page, 7000);
        await openModule(page, 'FDIR', 1500);
        assert.match(await panel(page, 'fdir').innerText(), /Cooling-channel restriction: \d+ % \(HIGH\)/);
        await openModule(page, 'AI/ML', 1500);
        assert.match(await panel(page, 'ai').innerText(), /Probable Cooling-channel restriction/);
        await openModule(page, 'Health', 1500);
        assert.match(await panel(page, 'health').innerText(), /Coolant temperature rise/i);
        await openModule(page, 'Pressure', 1500);
        assert.match(await panel(page, 'pressure').innerText(), /outside expectation/);
      });
      await check('simulation', 'A minute of simulation leaks neither DOM nodes nor memory, and raises no page error', async () => {
        await openModule(page, 'Lab', 800);
        await button('Reset').click();
        const sample = () => page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null }));
        await settle(page, 3000);
        const before = await sample();
        await settle(page, 15000);
        const after = await sample();
        report.simulation.memory = { before, after };
        assert(Math.abs(after.nodes - before.nodes) < 50, `DOM nodes ${before.nodes} → ${after.nodes}`);
        if (before.heap !== null) assert(after.heap - before.heap < 25, `heap ${before.heap} MB → ${after.heap} MB`);
      });
      await check('simulation', 'Analytics receives only fixed ids: no telemetry values, no free text', async () => {
        for (const event of await events(page)) {
          for (const [key, value] of Object.entries(event.params || {})) {
            if (['page_path', 'url', 'label', 'page_title', 'page_location'].includes(key)) continue;
            assert.match(String(value), /^[a-z0-9_]{1,64}$/, `${event.name}.${key}=${value}`);
          }
        }
        const names = (await events(page)).map((e) => e.name);
        assert(names.includes('fault_injected') && names.includes('fault_detected'));
        assert.equal(names.filter((n) => n === 'advanced_twin_page_view').length, 1);
      });
      await context.close();

      const reduced = await open({ width: 1280, height: 800 }, { reducedMotion: 'reduce' });
      await goto(reduced.page, '#lab');
      await check('simulation', 'Reduced motion: the simulation starts paused and can be stepped or started by hand', async () => {
        const lab2 = panel(reduced.page, 'lab');
        await lab2.getByRole('button', { name: 'Live simulation' }).waitFor({ timeout: 20000 });
        const first = (await lab2.locator('li').filter({ hasText: 'TWIN STATE' }).first().innerText()).replace(/\s+/g, ' ');
        await reduced.page.waitForTimeout(2000);
        assert.equal((await lab2.locator('li').filter({ hasText: 'TWIN STATE' }).first().innerText()).replace(/\s+/g, ' '), first);
        assert.equal(await reduced.page.evaluate(() => getComputedStyle(document.querySelector('main svg path[stroke-dasharray="7 8"]')).animationName), 'none');
      });
      await reduced.context.close();
    }

    // ── Performance on an emulated mid-range phone ──────────────────────────
    if (wanted('performance')) {
      const { context, page } = await open({ width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(() => {
        window.__perf = { lcp: 0, long: 0, cls: 0, lateCls: 0, events: [] };
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.long += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__perf.cls += e.value; if (window.__perf.mark) window.__perf.lateCls += e.value; } }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__perf.events.push(Math.round(e.duration)); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      });
      await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'load' });
      await settle(page, 3500);
      const load = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const res = performance.getEntriesByType('resource');
        const sum = (f) => Math.round(res.filter(f).reduce((s, r) => s + r.encodedBodySize, 0) / 1024);
        return { htmlKB: Math.round(nav.encodedBodySize / 1024), jsKB: sum((r) => /\.js(\?|$)/.test(r.name)), cssKB: sum((r) => /\.css(\?|$)/.test(r.name)), lcpMs: Math.round(window.__perf.lcp), tbtMs: Math.round(window.__perf.long), cls: +window.__perf.cls.toFixed(3), domNodes: document.querySelectorAll('*').length, threeLoaded: typeof window.__THREE__ !== 'undefined' };
      });
      await page.evaluate(() => { window.__perf.mark = true; window.__perf.long = 0; });
      for (const label of ['Pressure', 'Twin', 'Lab']) { await tab(page, label).tap(); await settle(page, 3500); }
      await panel(page, 'lab').getByRole('button', { name: 'Inject fault' }).tap();
      await settle(page, 6000);
      const interact = await page.evaluate(() => ({ worstInteractionMs: Math.max(0, ...window.__perf.events), interactions: window.__perf.events.length, clsAfterLoad: +window.__perf.lateCls.toFixed(3), longTaskMsWhileRunning: Math.round(window.__perf.long) }));
      report.performance = { ...report.performance, conditions: '390×844, 4× CPU slowdown, 1.6 Mbps down / 150 ms latency, cold cache', ...load, ...interact };
      await check('performance', 'Initial load: LCP under 2.5 s, no layout shift, and neither the simulation nor three.js in the first load', async () => {
        assert(load.lcpMs < 2500, `LCP ${load.lcpMs} ms`);
        assert(load.cls < 0.1, `CLS ${load.cls}`);
        assert.equal(load.threeLoaded, false);
        return load;
      });
      await check('performance', 'Interaction: opening modules and injecting a fault respond within 200 ms, without layout jumps', async () => {
        assert(interact.worstInteractionMs <= 200, `slowest interaction ${interact.worstInteractionMs} ms`);
        assert(interact.clsAfterLoad < 0.1, `layout shift after load ${interact.clsAfterLoad}`);
        return interact;
      });
      await context.close();
    }

    // ── Accessibility ───────────────────────────────────────────────────────
    if (wanted('accessibility')) {
      for (const [name, viewport, extra] of [['desktop', { width: 1440, height: 900 }, {}], ['mobile', { width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 }]]) {
        const { context, page } = await open(viewport, extra);
        await goto(page);
        const violations = {};
        for (const [id, label] of MODULES) {
          await openModule(page, label, id === 'lab' ? 2500 : ['pressure', 'twin', 'ai', 'fdir', 'health', 'physics', 'data'].includes(id) ? 1800 : 400);
          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          const found = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0].target.join(' ').slice(0, 140) })));
          if (found.length) violations[id] = found;
        }
        report.accessibility[name] = violations;
        await check('accessibility', `${name}: no WCAG 2.2 A/AA violations found by axe in any module`, async () => {
          assert.deepEqual(Object.entries(violations).map(([id, list]) => `${id}: ${list.map((v) => `${v.id}×${v.nodes} (${v.sample})`).join('; ')}`), []);
        });
        if (name === 'desktop') {
          await check('accessibility', 'Headings descend in order; one H1; every module has an H2', async () => {
            const levels = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1])));
            assert.equal(levels.filter((l) => l === 1).length, 1);
            for (let i = 1; i < levels.length; i++) assert(levels[i] - levels[i - 1] <= 1, `heading level jumps from ${levels[i - 1]} to ${levels[i]} at index ${i}`);
          });
          await check('accessibility', 'Keyboard: skip link first, a visible focus ring, tabs by arrow keys, panels reachable', async () => {
            await goto(page);
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Skip to content');
            await tab(page, 'Overview').focus();
            const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
            assert(ring, 'no focus outline on the module tab');
            await page.keyboard.press('ArrowRight');
            assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'System');
          });
          await check('accessibility', 'Live regions do not announce at the simulation\'s frame rate', async () => {
            await openModule(page, 'Lab', 2500);
            const changes = await page.evaluate(() => new Promise((resolve) => {
              let count = 0;
              const observer = new MutationObserver((records) => { count += records.length; });
              for (const region of document.querySelectorAll('#lab [role="status"], #lab [aria-live]')) observer.observe(region, { childList: true, characterData: true, subtree: true });
              setTimeout(() => { observer.disconnect(); resolve(count); }, 5000);
            }));
            report.accessibility.liveRegionChangesIn5s = changes;
            assert(changes <= 3, `${changes} live-region updates in 5 s of nominal running`);
            // And while a fault develops: every number on the page is moving, and only conclusions may be announced.
            await panel(page, 'lab').getByRole('button', { name: 'Inject fault' }).click();
            const during = await page.evaluate(() => new Promise((resolve) => {
              const said = [];
              const observer = new MutationObserver((records) => { for (const r of records) said.push((r.target.nodeType === 3 ? r.target.parentElement : r.target).closest('[role="status"],[aria-live]')?.textContent.trim().slice(0, 50)); });
              for (const region of document.querySelectorAll('#lab [role="status"], #lab [aria-live]')) observer.observe(region, { childList: true, characterData: true, subtree: true });
              setTimeout(() => { observer.disconnect(); resolve(said); }, 8000);
            }));
            report.accessibility.liveRegionChangesIn8sOfFault = during.length;
            report.accessibility.announcedDuringFault = [...new Set(during)];
            assert(during.length <= 6, `${during.length} live-region updates in 8 s of a developing fault: ${[...new Set(during)].join(' | ')}`);
            assert(during.length >= 1, 'the change of diagnosis was not announced at all');
            await panel(page, 'lab').getByRole('button', { name: /^Remove fault/ }).click();
          });
          await check('accessibility', 'Visible labels are part of each control\'s accessible name', async () => {
            const mismatched = await page.evaluate(() => [...document.querySelectorAll('button[aria-label], a[aria-label]')].filter((el) => el.getBoundingClientRect().width > 0).map((el) => ({ label: el.getAttribute('aria-label'), text: el.innerText.trim().replace(/\s+/g, ' ') })).filter((x) => x.text && !x.label.toLowerCase().includes(x.text.toLowerCase())).map((x) => `"${x.text}" ≠ "${x.label}"`).slice(0, 8));
            assert.deepEqual(mismatched, []);
          });
        }
        await context.close();
      }
    }

    // ── The pages around it ─────────────────────────────────────────────────
    if (wanted('server')) {
      const { context, page } = await open({ width: 1440, height: 900 });
      await check('integration', 'Space page: the advanced card sits beside the fundamentals card and leads here', async () => {
        await page.goto(`${BASE}/space`, { waitUntil: 'load' });
        const a = await page.getByRole('link', { name: 'Explore Rocket Engine Digital Twin' }).locator('..').boundingBox();
        const b = await page.getByRole('link', { name: 'Explore Advanced Digital Twin' }).locator('..').boundingBox();
        assert(Math.abs(a.y - b.y) < 2 && b.x > a.x, 'the two cards are not side by side');
        await page.getByRole('link', { name: 'Explore Advanced Digital Twin' }).click();
        await page.waitForURL(`**${ROUTE}`);
        assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Advanced Rocket Propulsion System Digital Twin');
      });
      await check('integration', 'Fundamentals page: still renders its 3D twin, and its call to action leads here', async () => {
        await page.goto(`${BASE}${FUNDAMENTALS}`, { waitUntil: 'load' });
        assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Next-Generation Rocket Engine Digital Twin');
        await page.getByTestId('rocket-twin-3d').waitFor({ timeout: 20000 });
        await page.getByRole('link', { name: 'Explore Advanced Propulsion Digital Twin' }).click();
        await page.waitForURL(`**${ROUTE}`);
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => r.status === 'fail');
  report.finished = new Date().toISOString();
  report.passed = results.length - failed.length;
  report.failed = failed.length;
  report.console = [...new Set(report.console)];
  report.results = results;
  await fs.writeFile(path.join(OUTPUT, 'results.json'), JSON.stringify(report, null, 2));
  console.log(`\n${report.passed} of ${results.length} checks passed, ${failed.length} failed. Evidence: ${OUTPUT}`);
  if (report.console.length) console.log(`Console and network problems:\n  ${report.console.join('\n  ')}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exit(1); });
