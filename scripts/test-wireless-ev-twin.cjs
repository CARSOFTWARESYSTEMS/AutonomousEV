/* Next-Generation Wireless EV Charging Digital Twin — production browser acceptance checks.
   Build, then start `npm run start -- --port 3100` before running this.
   Screenshots of every stage are saved for visual review. */
const BASE = process.env.WIRELESS_TWIN_BASE_URL || 'http://localhost:3100';
const OUTPUT = process.env.WIRELESS_TWIN_QA_DIR || '/private/tmp/wireless-ev-twin-qa';
const ROUTE = '/internships/wireless-ev-charging-digital-twin';
// Test runs must not report page views or events to the live analytics property.
const ANALYTICS = /googletagmanager\.com|google-analytics\.com/;
// Use the GPU when the machine has one; software WebGL still passes, on the performance tier.
const GPU_ARGS = process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'];

async function main() {
  const [{ default: assert }, fs, { default: path }, { chromium }] = await Promise.all([
    import('node:assert/strict'), import('node:fs/promises'), import('node:path'), import('playwright'),
  ]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: GPU_ARGS });
  const results = [], errors = [], measurements = {};
  const test = async (name, action) => { await action(); results.push(name); console.log(`PASS ${name}`); };

  try {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desktop.route(ANALYTICS, route => route.abort());
    const page = await desktop.newPage();
    page.on('pageerror', error => errors.push(`desktop: ${error.message}`));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push(`desktop console: ${m.text().slice(0, 300)}`); });
    const settle = (ms = 2000) => page.waitForTimeout(ms);
    const lab = () => page.evaluate(() => document.getElementById('research-laboratory').scrollIntoView());
    const shot = async name => { await page.screenshot({ path: path.join(OUTPUT, `${name}.png`) }); };
    const stageButtons = () => page.locator("ol[aria-label='Engineering stages'] li button");
    const instrument = label => page.locator('[aria-label="Instruments"] > div').filter({ has: page.locator('dt', { hasText: label }) }).locator('dd');
    const fps = () => page.evaluate(() => new Promise(resolve => { let n = 0; const t0 = performance.now(); const tick = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(tick); else resolve(Math.round((n * 1000) / (performance.now() - t0))); }; requestAnimationFrame(tick); }));
    const share = () => page.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect(); return (c.width * Math.min(c.height, innerHeight)) / (innerWidth * innerHeight); });
    const drawn = async () => { const frame = await page.locator('canvas').screenshot(); assert(frame.length > 30000, `canvas looks blank (${frame.length} byte screenshot)`); };

    await test('Server HTML: one H1, the hero copy, and never the no-WebGL message', async () => {
      const t0 = Date.now();
      const response = await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'load' });
      measurements.loadMs = Date.now() - t0;
      assert.equal(response.status(), 200);
      const html = await response.text();
      assert.equal((html.match(/<h1/g) || []).length, 1);
      for (const text of ['Next-Generation Wireless EV Charging Digital Twin', 'Park. Drive. Charge. Automatically.', 'Physics-based · Mathematics-driven · IoT-enabled · Data-driven', 'Enter Research Laboratory', 'Watch Technology Demonstration', 'Preparing the 3D laboratory', 'Research &amp; Project Leadership']) assert(html.includes(text), text);
      assert(!/3D view unavailable/.test(html), 'the server HTML must not claim the 3D view is unavailable');
      assert(!/WebGLRenderer|three\.module/.test(html));
    });

    await test('Laboratory: one canvas filling most of the laboratory, the guided sequence starting on an empty bay', async () => {
      await lab();
      await page.locator('canvas').waitFor({ timeout: 90000 });
      // The scene reports ready after its first rendered frames; the status line then goes away.
      await page.getByText('Initialising the digital twin').waitFor({ state: 'detached', timeout: 90000 });
      measurements.sceneReadyAfterNavigationMs = Math.round(await page.evaluate(() => performance.now()));
      await page.getByText('Stage 1 of 12', { exact: false }).waitFor({ timeout: 30000 });
      await settle(3500);
      assert.equal(await page.locator('canvas').count(), 1);
      const s = await share();
      measurements.canvasShare = +s.toFixed(2);
      assert(s >= 0.6, `the 3D scene covers ${Math.round(s * 100)}% of the viewport`);
      assert.equal(await instrument('State').first().textContent(), 'Station available');
      await drawn();
      measurements.renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const i = g && g.getExtension('WEBGL_debug_renderer_info'); return i ? g.getParameter(i.UNMASKED_RENDERER_WEBGL) : null; });
      measurements.fpsOverview = await fps();
      await shot('01-overview');
    });

    await test('Every station stage opens with its own state, framing and instruments', async () => {
      const titles = ['A smart wireless charging bay', 'Inside the ground pad', 'The vehicle arrives', 'Detection, identification and authorisation', 'Alignment and coupling', 'The receiver assembly', 'The magnetic field between the pads', 'Resonance and the inverter', 'Follow the energy', 'Charging the battery', 'A foreign object on the pad', 'Session complete'];
      for (let i = 0; i < titles.length; i++) {
        await stageButtons().nth(i).click();
        await page.getByRole('heading', { level: 2, name: titles[i] }).waitFor({ timeout: 10000 });
        await settle(i === 2 ? 3000 : 3800);
        await drawn();
        await shot(`stage-${String(i + 1).padStart(2, '0')}`);
        if (titles[i] === 'The magnetic field between the pads') {
          assert.equal(await instrument('State').count(), 0);
          assert.match(await instrument('B at gap centre').first().textContent(), /\d+\s*µT/);
          measurements.fpsField = await fps();
        }
        if (titles[i] === 'Charging the battery') assert.match(await page.locator('text=/Accelerated ×60/').first().textContent(), /×60/);
      }
    });

    await test('Safety: a foreign object trips the protection and charging recovers once the pad is clear', async () => {
      await stageButtons().nth(10).click();
      await page.locator('[aria-label="Instruments"] dd', { hasText: 'Foreign object detected' }).waitFor({ timeout: 20000 });
      assert.equal(await instrument('Into the battery').first().textContent(), '0.00 kW');
      await page.locator('[aria-label="Instruments"] dd', { hasText: /Active charging|Charging power optimisation/ }).waitFor({ timeout: 60000 });
    });

    await test('Selecting a part in the scene frames it and opens the three-level inspector', async () => {
      await stageButtons().nth(1).click(); // the ground pad, exploded, in an empty bay
      await settle(4000);
      const box = await page.locator('canvas').boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      const inspector = page.getByRole('complementary', { name: 'Inspector' });
      await inspector.waitFor({ timeout: 8000 });
      await page.getByRole('tab', { name: 'How it works' }).click();
      await page.getByRole('tab', { name: 'Engineering' }).click();
      assert.match(await inspector.textContent(), /Fidelity and validation/);
      await shot('selection');
      await page.keyboard.press('Escape');
    });

    await test('Learn, Engineer and Research share one simulation: an input moves the calculated coupling', async () => {
      const modes = page.getByRole('radiogroup', { name: 'Experience mode' });
      await modes.getByRole('radio', { name: 'Learn' }).click();
      await page.getByRole('tab', { name: 'Science', selected: true }).waitFor();
      await modes.getByRole('radio', { name: 'Engineer' }).click();
      await page.getByRole('region', { name: 'Inputs' }).waitFor();
      await stageButtons().nth(4).click();
      await settle(2500);
      const before = Number(await instrument('Coupling k').first().textContent());
      const gap = page.getByRole('region', { name: 'Inputs' }).getByLabel('Air gap (winding to winding)');
      await gap.focus();
      for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowRight');
      await settle(1500);
      const after = Number(await instrument('Coupling k').first().textContent());
      assert(after < before - 0.02, `k should fall as the gap grows (${before} → ${after})`);
      await shot('engineer-alignment');
      await modes.getByRole('radio', { name: 'Research' }).click();
      await modes.getByRole('radio', { name: 'Explore' }).click();
    });

    await test('Dynamic road: eleven stages; charging in motion, the road field, pad states and the three energy outcomes', async () => {
      await page.getByRole('navigation', { name: 'Research environments' }).getByRole('button', { name: /^03/ }).click();
      await page.getByText('Stage 1 of 11', { exact: false }).waitFor({ timeout: 10000 });
      const titles = ['An electrified highway', 'How the car charges while it drives', 'Under the road', 'Segment activation and handover', 'Position-dependent coupling', 'The magnetic field over the road', 'The receiver at speed', 'Gaining energy while driving', 'Energy-neutral driving', 'Losing energy despite charging', 'A failed segment'];
      const outcome = { 'Gaining energy while driving': 'Battery gaining', 'Energy-neutral driving': 'Energy-neutral', 'Losing energy despite charging': 'Battery losing' };
      for (let i = 0; i < titles.length; i++) {
        await stageButtons().nth(i).click();
        await page.getByRole('heading', { level: 2, name: titles[i] }).waitFor({ timeout: 10000 });
        await settle(4000);
        await drawn();
        if (outcome[titles[i]]) {
          // The regime is read over a whole 200 m zone period, so it appears once the vehicle has driven that far.
          await page.locator('[aria-label="Instruments"] dd', { hasText: outcome[titles[i]] }).waitFor({ timeout: 60000 });
        }
        await shot(`road-${String(i + 1).padStart(2, '0')}`);
        if (titles[i] === 'Segment activation and handover') measurements.fpsRoad = await fps();
        if (titles[i] === 'How the car charges while it drives') {
          await page.getByLabel('Charging in motion').waitFor({ timeout: 10000 });
          assert.match(await page.getByLabel('Charging in motion').textContent(), /Received from the road/);
        }
        if (titles[i] === 'Under the road') assert.match(await page.getByLabel('What is in the road').textContent(), /Segment controller/);
        if (titles[i] === 'The magnetic field over the road') {
          // The field basis is built a few rows per frame; the reading then comes from WPT-EM-005.
          await page.locator('[aria-label="Instruments"] dd', { hasText: /µT/ }).first().waitFor({ timeout: 30000 });
          measurements.fpsRoadField = await fps();
        }
      }
      assert.equal(await page.locator('canvas').count(), 1);
      await page.getByRole('navigation', { name: 'Research environments' }).getByRole('button', { name: /^02/ }).click();
      await settle(1500);
    });

    await test('A presentation link opens full-window with the demonstration and one Begin control', async () => {
      const p2 = await desktop.newPage();
      await p2.goto(`${BASE}${ROUTE}?experience=present`, { waitUntil: 'load' });
      await p2.getByRole('dialog', { name: /Next-Generation Wireless EV Charging Digital Twin/ }).waitFor({ timeout: 90000 });
      assert.equal(await p2.locator('#research-laboratory').getAttribute('data-fullscreen'), 'overlay');
      await p2.getByRole('button', { name: 'Watch silently' }).click();
      await p2.getByText('Chapter 1 of 8', { exact: false }).waitFor({ timeout: 30000 });
      await p2.close();
      // A background tab gets no animation frames: bring the laboratory's tab back to the front.
      await page.bringToFront();
    });

    await test('The technology demonstration runs in chapters and can be left', async () => {
      await page.getByRole('button', { name: /Demonstration/ }).click();
      await page.getByText('Chapter 1 of 8', { exact: false }).waitFor({ timeout: 10000 });
      await settle(4000);
      await shot('demo-chapter-1');
      const chapters = page.locator("ol[aria-label='Demonstration chapters'] li button");
      await chapters.nth(9).click(); // chapter 5 starts at the tenth demonstration stage (after 3 + 1 + 2 + 3 stages)
      await page.getByText('Chapter 5 of 8', { exact: false }).waitFor({ timeout: 10000 });
      await settle(4000);
      await drawn();
      await shot('demo-chapter-5');
      await page.getByRole('button', { name: /Exit demonstration/ }).click();
      await page.getByRole('radiogroup', { name: 'Experience mode' }).waitFor();
    });

    await test('Full screen enlarges the scene; quality changes keep one context and the same numbers', async () => {
      await page.getByRole('button', { name: /^Full screen/ }).click();
      await settle(2500);
      const s = await share();
      measurements.canvasShareFullscreen = +s.toFixed(2);
      assert(s >= 0.7, `full screen scene covers ${Math.round(s * 100)}%`);
      measurements.fpsFullscreen = await fps();
      const soc = await instrument('State').first().textContent();
      await page.getByRole('combobox', { name: 'Rendering quality' }).selectOption('performance');
      await settle(2000);
      assert.equal(await page.locator('canvas').count(), 1);
      measurements.fpsPerformanceTier = await fps();
      assert.equal(typeof soc, 'string');
      await page.getByRole('combobox', { name: 'Rendering quality' }).selectOption('auto');
      await page.keyboard.press('Escape');
      await settle(1000);
    });

    await test('Switching environments repeatedly does not grow memory or add contexts', async () => {
      const heap = () => page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0));
      const rail = page.getByRole('navigation', { name: 'Research environments' });
      const start = await heap();
      for (let round = 0; round < 4; round++) {
        for (const env of ['03', '04', '05', '02']) {
          await rail.getByRole('button', { name: new RegExp(`^${env}`) }).click();
          await settle(1200);
        }
      }
      await settle(2500);
      const end = await heap();
      measurements.heapStartMb = Math.round(start);
      measurements.heapEndMb = Math.round(end);
      assert.equal(await page.locator('canvas').count(), 1);
      assert(end - start < 60, `heap grew ${Math.round(end - start)} MB over 16 environment switches`);
    });
    await desktop.close();

    // ── Phone, 390 × 844 ──
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await phone.route(ANALYTICS, route => route.abort());
    const mobile = await phone.newPage();
    mobile.on('pageerror', error => errors.push(`phone: ${error.message}`));
    await test('Phone: no sideways scroll, the scene renders, the inspector is a bottom sheet', async () => {
      await mobile.goto(`${BASE}${ROUTE}`, { waitUntil: 'load' });
      await mobile.screenshot({ path: path.join(OUTPUT, 'phone-hero.png') });
      await mobile.evaluate(() => document.getElementById('research-laboratory').scrollIntoView());
      await mobile.locator('canvas').waitFor({ timeout: 90000 });
      await mobile.waitForTimeout(5000);
      const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert(overflow <= 1, `page scrolls sideways by ${overflow}px`);
      await mobile.screenshot({ path: path.join(OUTPUT, 'phone-lab.png') });
    });
    await phone.close();
  } finally {
    await browser.close();
  }
  await fs.writeFile(path.join(OUTPUT, 'measurements.json'), JSON.stringify(measurements, null, 2));
  console.log(JSON.stringify(measurements, null, 2));
  if (errors.length) {
    console.error(`Page errors:\n${errors.join('\n')}`);
    process.exitCode = 1;
  }
  console.log(`${results.length} checks passed; screenshots in ${OUTPUT}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
