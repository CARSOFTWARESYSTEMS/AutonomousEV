/* UFlight 3D — production browser acceptance checks.
   Build, then start `npm run start -- --port 3100` before running this.
   Set UFLIGHT_FULL_RUN=1 to let the executive mission play through in real time (about two minutes). */
const BASE = process.env.UFLIGHT_BASE_URL || 'http://localhost:3100';
const OUTPUT = process.env.UFLIGHT_QA_DIR || '/private/tmp/uflight-3d-qa';
const FULL_RUN = process.env.UFLIGHT_FULL_RUN === '1';
const ROUTE = '/aerospace/uflight-3d';
const HOME = '/aerospace';
// Use the GPU when the machine has one; software WebGL still passes, on the low quality tier.
// Test runs must not report page views or events to the live analytics property.
const ANALYTICS = /googletagmanager\.com|google-analytics\.com/;
const GPU_ARGS = process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'];

async function main() {
  const [{ default: assert }, fs, { default: path }, { chromium }] = await Promise.all([
    import('node:assert/strict'), import('node:fs/promises'), import('node:path'), import('playwright'),
  ]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: GPU_ARGS });
  const results = [], errors = [];
  const test = async (name, action) => { await action(); results.push(name); console.log(`PASS ${name}`); };
  const shot = (page, name) => page.screenshot({ path: path.join(OUTPUT, `${name}.png`) });

  try {
    // ── Desktop, 1440 × 900 ──
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desktop.route(ANALYTICS, route => route.abort());
    const page = await desktop.newPage();
    page.on('pageerror', error => errors.push(`desktop: ${error.message}`));
    const app = page.getByTestId('uflight-3d');
    const button = (name, exact = true) => page.getByRole('button', { name, exact });
    const mode = name => page.getByRole('navigation', { name: 'UFlight 3D modes' }).getByRole('button', { name, exact: true });
    const settle = (ms = 1800) => page.waitForTimeout(ms);

    await test('Route, metadata, structured data and a single H1', async () => {
      const response = await page.goto(`${BASE}${ROUTE}`);
      assert.equal(response.status(), 200);
      assert.equal(await page.title(), 'UFlight™ 3D | Advanced eVTOL Health Monitoring & Digital Twin');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://aerospace.ev.engineer${ROUTE}`);
      assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'index, follow');
      const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent())['@graph'];
      assert(graph.some(node => node['@type'] === 'WebApplication'));
      assert(graph.some(node => node['@type'] === 'LearningResource'));
      // The server HTML carries the overview content even though the 3D scene is client-only.
      const html = await response.text();
      assert(html.includes('What the aircraft monitors'));
      assert(html.includes('INITIALIZING DIGITAL AIRCRAFT'));
    });

    await test('The aircraft renders in the studio (scene ready, one WebGL canvas, not blank)', async () => {
      await page.locator('[data-testid=uflight-3d][data-ready=true]').waitFor({ timeout: 90000 });
      assert.equal(await page.locator('canvas').count(), 1);
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(typeof (await page.evaluate(() => window.__THREE__)), 'string');
      assert.equal(await app.getAttribute('data-environment'), 'studio');
      await page.getByText('THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE.', { exact: true }).waitFor();
      await settle(1200);
      // A rendered scene compresses to a far larger PNG than a flat fill.
      const frame = await page.locator('canvas').screenshot();
      assert(frame.length > 40000, `canvas looks blank (${frame.length} byte screenshot)`);
      await shot(page, 'desktop-hero');
    });

    await test('Enter Digital Twin brings in the interface without a hard cut', async () => {
      await button(/ENTER DIGITAL TWIN/, false).click();
      await mode('AIRCRAFT').waitFor();
      assert.equal(await app.getAttribute('data-mode'), 'aircraft');
      assert.equal(await mode('AIRCRAFT').getAttribute('aria-current'), 'page');
      assert(/^UX6-001\s+●\s+MISSION CAPABLE$/.test(await page.getByTestId('vehicle-state').innerText()));
      assert.equal(await page.locator('canvas').count(), 1);
      await settle(2600);
      await shot(page, 'aircraft');
    });

    await test('Mouse rotate and zoom move the camera', async () => {
      const before = await page.locator('canvas').screenshot();
      await page.mouse.move(700, 330);
      await page.mouse.down();
      await page.mouse.move(900, 400, { steps: 12 });
      await page.mouse.up();
      await page.mouse.wheel(0, -400);
      await settle(600);
      const after = await page.locator('canvas').screenshot();
      assert(!before.equals(after), 'view did not change after drag and wheel');
    });

    await test('X-ray: the skin fades and a system filter isolates', async () => {
      const before = await page.locator('canvas').screenshot();
      await button('X-RAY').click();
      assert.equal(await button('X-RAY').getAttribute('aria-pressed'), 'true');
      const filters = page.getByRole('group', { name: /X-ray filter/ }).getByRole('button');
      assert.equal(await filters.count(), 9);
      await settle();
      const xray = await page.locator('canvas').screenshot();
      assert(!before.equals(xray), 'X-ray did not change the picture');
      await shot(page, 'xray');
      await page.getByRole('group', { name: /X-ray filter/ }).getByRole('button', { name: 'POWER', exact: true }).click();
      await settle();
      assert(!xray.equals(await page.locator('canvas').screenshot()), 'the POWER filter did not change the picture');
      await page.keyboard.press('x');
      assert.equal(await button('X-RAY').getAttribute('aria-pressed'), 'false');
    });

    await test('Exploded view: assemblies, then sub-assemblies', async () => {
      const slider = page.getByRole('slider', { name: /ASSEMBLY/ });
      const before = await page.locator('canvas').screenshot();
      await slider.fill('100');
      await settle(2800);
      const exploded = await page.locator('canvas').screenshot();
      assert(!before.equals(exploded), 'exploded view did not change the picture');
      await shot(page, 'exploded-assemblies');
      await button('SUBSYSTEMS').click();
      await settle(2200);
      assert(!exploded.equals(await page.locator('canvas').screenshot()), 'level 2 did not separate the sub-assemblies');
      await shot(page, 'exploded-subsystems');
      await slider.fill('0');
      await button('ASSEMBLIES').click();
      assert.equal(await slider.inputValue(), '0');
    });

    await test('Systems: propulsion and energy architecture', async () => {
      await mode('SYSTEMS').click();
      const panel = page.getByTestId('system-panel');
      await panel.waitFor();
      assert((await panel.innerText()).includes('PROPULSION'));
      assert((await panel.innerText()).toUpperCase().includes('4 TILTING UNITS'));
      await settle(2400);
      await shot(page, 'systems-propulsion');
      await page.getByRole('tab', { name: 'ENERGY', exact: true }).click();
      assert((await panel.innerText()).toUpperCase().includes('2 PACKS OF 4 MODULES'));
      await settle(2400);
      await shot(page, 'systems-energy');
      await page.getByRole('tab', { name: 'PROPULSION', exact: true }).click();
    });

    await test('Health: seven systems nominal, the aircraft mission capable', async () => {
      await mode('HEALTH').click();
      const summary = page.getByTestId('health-summary');
      const rows = summary.getByRole('group', { name: 'System health' }).getByRole('button');
      assert.equal(await rows.count(), 7);
      for (const text of await rows.allInnerTexts()) assert(text.includes('NOMINAL'), text);
      assert((await summary.getByRole('status', { name: 'Aircraft status' }).innerText()).includes('MISSION CAPABLE'));
      await settle(2400);
      await shot(page, 'health');
    });

    await test('Select Motor 04 on the aircraft and open its panel; Executive and Engineer views', async () => {
      await page.getByRole('button', { name: 'Propulsion unit 04: NOMINAL' }).click();
      const panel = page.getByTestId('component-panel');
      await panel.waitFor({ timeout: 8000 });
      assert((await panel.innerText()).includes('PROPULSION UNIT 04'));
      assert((await panel.innerText()).includes('MISSION IMPACT'));
      assert(!(await panel.innerText()).includes('SENSOR IDS'));
      await button('ENGINEER').click();
      const text = await panel.innerText();
      for (const label of ['RPM', 'PHASE CURRENT', 'VIBRATION', 'RESIDUAL', 'TREND', 'SENSOR IDS', 'VIB-M04-A']) assert(text.toUpperCase().includes(label), label);
      await button('EXECUTIVE').click();
    });

    await test('Sensor trace: from the sensor to a maintenance action', async () => {
      const panel = page.getByTestId('component-panel');
      await panel.getByRole('button', { name: 'TRACE HEALTH DATA', exact: true }).click();
      const sensor = page.getByTestId('sensor-panel');
      await sensor.waitFor();
      assert((await sensor.innerText()).includes('VIB-M04-A'));
      const steps = page.getByTestId('trace-steps').getByRole('listitem');
      assert.equal(await steps.count(), 8);
      await page.getByTestId('trace-steps').locator('li[aria-current=step]', { hasText: 'Acquisition Node' }).waitFor({ timeout: 8000 });
      await page.getByTestId('trace-steps').locator('li[aria-current=step]', { hasText: 'Edge Processing' }).waitFor({ timeout: 8000 });
      await shot(page, 'sensor-trace');
      await sensor.getByRole('button', { name: 'STOP TRACE', exact: true }).click();
      await sensor.getByRole('button', { name: 'BACK', exact: true }).click();
    });

    await test('Bearing fault: healthy, early change, anomaly, diagnosis, prognosis, decision, maintenance', async () => {
      await mode('FAULT LAB').click();
      await page.getByRole('button', { name: /MOTOR BEARING DEGRADATION/ }).click();
      assert.equal(await app.getAttribute('data-fault-scenario'), 'bearing-degradation');
      assert.equal(await app.getAttribute('data-environment'), 'flight');
      const panel = page.getByTestId('fault-panel');
      const next = button('Next stage');
      assert((await panel.innerText()).includes('NOMINAL'));
      assert(!(await panel.innerText()).includes('ANOMALY DETECTED'));
      await page.getByTestId('signal-chart').waitFor({ timeout: 10000 });

      await next.click(); // early change: still monitoring
      await settle(2500);
      assert((await panel.innerText()).includes('MONITORING'));
      assert(!(await panel.innerText()).includes('DEGRADED'));

      await next.click(); // anomaly: announced once the model detects it
      await panel.getByRole('heading', { name: 'ANOMALY DETECTED' }).waitFor({ timeout: 12000 });
      // State badges carry a glyph beside the word, so they are found by their state.
      await panel.locator('[data-state=DEGRADED]').first().waitFor();
      // Degraded, but the unit is available and the mission continues.
      assert(/MISSION CAPABLE$/.test(await page.getByTestId('vehicle-state').innerText()));
      await settle(1500);
      await shot(page, 'fault-anomaly');

      await next.click(); // diagnosis
      const diagnosis = page.getByTestId('diagnosis');
      await diagnosis.waitFor();
      assert((await diagnosis.innerText()).includes('POSSIBLE BEARING DEGRADATION'));
      await diagnosis.getByText('HIGH', { exact: true }).waitFor({ timeout: 8000 });

      await button('ENGINEER').click();
      for (const [domain, marker] of [['FREQUENCY', 'Bearing'], ['ORDER', '3.58× bearing'], ['TIME', 'time, s']]) {
        await button(domain).click();
        await page.locator(`[data-testid=signal-chart][data-domain=${domain.toLowerCase()}]`).filter({ hasText: marker }).waitFor();
      }
      await shot(page, 'fault-signal-engineer');
      await button('EXECUTIVE').click();

      await next.click(); // prognosis
      const prognosis = page.getByTestId('prognosis');
      await prognosis.waitFor();
      assert(/Within next \d+–\d+ flight cycles/.test(await prognosis.innerText()));
      await shot(page, 'fault-prognosis');

      await next.click(); // mission decision
      assert((await page.getByTestId('mission-impact').innerText()).includes('POST-FLIGHT INSPECTION REQUIRED'));

      await next.click(); // maintenance, on the ground
      await page.locator('[data-testid=uflight-3d][data-environment=vertiport]').waitFor();
      await panel.getByText('Inspect propulsion unit 04 bearing assembly.', { exact: true }).waitFor();
      await page.getByTestId('vehicle-state').getByText('NOT RELEASED').waitFor({ timeout: 8000 });
    });

    await test('Twin: observed, expected, residual and prediction for Motor 04', async () => {
      await page.getByTestId('fault-panel').getByRole('button', { name: 'VIEW TWIN', exact: true }).click();
      await page.locator('[data-testid=uflight-3d][data-mode=twin][data-environment=twin]').waitFor();
      const panel = page.getByTestId('twin-panel');
      await panel.waitFor();
      await panel.getByText('ABOVE BASELINE', { exact: true }).waitFor({ timeout: 10000 });
      const text = (await panel.innerText()).toUpperCase();
      for (const label of ['MOTOR 04', 'OBSERVED', 'EXPECTED RANGE', 'RESIDUAL', 'STATE', 'TREND', 'INCREASING', 'PROJECTION', 'MAINTENANCE ACTION RECOMMENDED']) assert(text.includes(label), label);
      await settle(2500);
      await shot(page, 'twin');
      const slider = page.getByRole('slider', { name: /Twin time/ });
      await slider.fill('60');
      await panel.getByRole('term').filter({ hasText: /^PREDICTED$/ }).waitFor();
      await slider.fill('-100');
      await panel.getByRole('term').filter({ hasText: /^RECORDED$/ }).waitFor();
      await panel.locator('[data-state=NOMINAL]').first().waitFor();
      await button('RETURN TO NOW').click();
    });

    await test('Architecture: data routes, and the loss of FCC-B contained', async () => {
      await mode('ARCHITECTURE').click();
      assert.equal(await page.getByTestId('data-architecture').getByRole('listitem').count(), 8);
      await page.getByRole('group', { name: 'Network filter' }).getByRole('button', { name: 'HEALTH', exact: true }).click();
      await settle(2200);
      await shot(page, 'architecture-health-network');
      await button('REDUNDANCY').click();
      const panel = page.getByTestId('redundancy-panel');
      await button('SIMULATE CHANNEL FAILURE').click();
      await panel.getByRole('heading', { name: 'FAULT CONTAINED' }).waitFor({ timeout: 8000 });
      const text = await panel.innerText();
      assert(text.includes('REFERENCE ARCHITECTURE'));
      assert(/FCC-B\s+✕?\s*UNAVAILABLE/.test(text), text);
      await button('RESTORE CHANNEL').click();
      await button('NAVIGATION').click();
      await button('GNSS UNAVAILABLE').click();
      await page.getByTestId('navigation-panel').locator('[data-state=DEGRADED]').first().waitFor({ timeout: 8000 });
      await button('RESTORE GNSS').click();
    });

    await test('Mission runs end to end and reaches post-flight maintenance', async () => {
      await mode('MISSION').click();
      await button(/EXECUTIVE DEMO/, false).click();
      await page.locator('[data-testid=uflight-3d][data-mission-stage=PREFLIGHT][data-environment=vertiport]').waitFor();
      const panel = page.getByTestId('mission-panel');
      await panel.getByRole('heading', { name: 'AIRCRAFT RELEASE ASSESSMENT' }).waitFor();
      const authorize = button('AUTHORIZE FLIGHT');
      await page.waitForFunction(() => !document.querySelector('[data-testid=mission-panel] button')?.hasAttribute('disabled'), null, { timeout: 20000 });
      assert.equal((await panel.getByRole('list', { name: 'Release checks' }).getByRole('listitem').allInnerTexts()).filter(t => /PASS|READY/.test(t)).length, 8);
      await shot(page, 'mission-preflight');
      await authorize.click();
      await page.locator('[data-testid=uflight-3d][data-mission-stage=TAKEOFF]').waitFor();

      const stage = page.getByTestId('mission-stage');
      if (FULL_RUN) {
        // Let every stage play; record the order they appear in.
        const seen = [];
        const deadline = Date.now() + 160000;
        while (Date.now() < deadline) {
          const current = await app.getAttribute('data-mission-stage');
          if (seen[seen.length - 1] !== current) seen.push(current);
          if (current === 'COMPLETE') break;
          await page.waitForTimeout(250);
        }
        assert.deepEqual(seen, ['TAKEOFF', 'TRANSITION', 'CRUISE', 'HEALTH_EVENT', 'DIAGNOSIS', 'PROGNOSIS', 'APPROACH', 'LANDING', 'POSTFLIGHT', 'COMPLETE']);
      } else {
        // Step through every stage with NEXT, checking each is reached in order and shows what it should.
        const expected = [
          ['TRANSITION', async () => { await panel.getByText('Lift share', { exact: true }).waitFor(); await settle(3000); await shot(page, 'mission-transition'); }],
          ['CRUISE', async () => { await page.getByTestId('mission-caption').getByText('HUMS · BACKGROUND MONITORING', { exact: true }).waitFor(); assert.equal(await app.getAttribute('data-environment'), 'flight'); await settle(2500); await shot(page, 'mission-cruise'); }],
          ['HEALTH EVENT', async () => { await panel.getByRole('heading', { name: 'ANOMALY DETECTED' }).waitFor({ timeout: 20000 }); }],
          ['DIAGNOSIS', async () => { await panel.getByRole('heading', { name: 'POSSIBLE BEARING DEGRADATION' }).waitFor(); await settle(2500); await shot(page, 'mission-diagnosis'); }],
          ['PROGNOSIS', async () => { await panel.getByText('CONTINUE TO DESTINATION', { exact: true }).waitFor(); }],
          ['APPROACH', async () => { await panel.getByText('INSPECTION REQUIRED', { exact: true }).waitFor(); }],
          ['LANDING', async () => {}],
          ['POST-FLIGHT MAINTENANCE', async () => {}],
        ];
        for (const [label, check] of expected) {
          await button('Next stage').click();
          assert((await stage.innerText()).includes(label), label);
          await check();
        }
      }
      await page.locator('[data-testid=uflight-3d][data-environment=vertiport]').waitFor({ timeout: 20000 });
      const comparison = page.getByTestId('postflight-comparison');
      await comparison.waitFor({ timeout: 20000 });
      const text = await comparison.innerText();
      assert(/PRE-FLIGHT\s+.*NOMINAL/s.test(text) && /POST-FLIGHT\s+.*DEGRADED/s.test(text), text);
      await panel.locator('[data-state=MAINTENANCE_REQUIRED]').first().waitFor();
      await page.getByTestId('vehicle-state').getByText('NOT RELEASED').waitFor();
      await settle(2500);
      await shot(page, 'mission-postflight');
      if (!FULL_RUN) await button('Next stage').click();
      await page.locator('[data-testid=uflight-3d][data-mission-stage=COMPLETE]').waitFor({ timeout: 30000 });
      assert((await stage.innerText()).includes('MISSION COMPLETE'));
    });

    await test('Prepared by, help and reset', async () => {
      await button(/About this experience/, false).click();
      const about = page.getByRole('dialog', { name: 'About this experience' });
      await about.getByRole('link', { name: /View full profile/ }).waitFor();
      assert.equal(await about.getByRole('link', { name: /View full profile/ }).getAttribute('href'), '/about/sudarshana-karkala');
      assert((await about.innerText()).includes('Experience information last reviewed: 1 October 2026.'));
      await page.keyboard.press('Escape');
      await about.waitFor({ state: 'detached' });
      await button('Help: how to control the view').click();
      await page.getByRole('dialog', { name: 'Controls' }).getByText('Double Click', { exact: true }).waitFor();
      await page.keyboard.press('Escape');
      await mode('RESET').click();
      assert.equal(await app.getAttribute('data-mode'), 'aircraft');
      await page.getByTestId('vehicle-state').locator('[data-state=NOMINAL]').waitFor({ timeout: 8000 });
    });

    await test('Aerospace homepage section opens UFlight 3D', async () => {
      await page.goto(`${BASE}${HOME}`);
      const section = page.getByRole('region', { name: 'THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE.' });
      await section.scrollIntoViewIfNeeded();
      await section.getByText('Best experienced on Desktop / Laptop', { exact: true }).waitFor();
      const image = section.getByRole('img', { name: /UFlight™ Reference eVTOL/ });
      assert(await image.evaluate(img => img.complete && img.naturalWidth > 0), 'the rendered aircraft image did not load');
      await shot(page, 'homepage-section');
      const link = section.getByRole('link', { name: /LAUNCH UFLIGHT™ 3D/ });
      assert.equal(await link.getAttribute('href'), ROUTE);
      await link.click();
      await page.waitForURL(`**${ROUTE}`);
      await page.locator('[data-testid=uflight-3d][data-ready=true]').waitFor({ timeout: 90000 });
    });
    await desktop.close();

    // ── Mobile, 390 × 844 ──
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobile.route(ANALYTICS, route => route.abort());
    const phone = await mobile.newPage();
    phone.on('pageerror', error => errors.push(`mobile: ${error.message}`));

    await test('Mobile: overview page, desktop recommendation, no 3D loaded', async () => {
      await phone.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
      await phone.getByText('DESKTOP EXPERIENCE RECOMMENDED', { exact: true }).waitFor();
      assert.equal(await phone.locator('canvas').count(), 0);
      assert.equal(await phone.getByTestId('uflight-3d').count(), 0);
      // three.js announces itself on window when it loads; on a phone it must not have.
      assert.equal(await phone.evaluate(() => typeof window.__THREE__), 'undefined');
      assert.equal(await phone.getByRole('heading', { level: 1 }).count(), 1);
      // No error presentation in the page itself (the framework's own route announcer is outside <main>).
      assert.equal(await phone.getByRole('main').getByRole('alert').count(), 0);
      assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      const poster = phone.getByRole('img', { name: /UFlight™ Reference eVTOL/ });
      assert(await poster.evaluate(img => img.complete && img.naturalWidth > 0), 'the poster did not load');
      await phone.screenshot({ path: path.join(OUTPUT, 'mobile-page.png'), fullPage: true });
    });

    await test('Mobile: system cards, health flow and prepared by', async () => {
      const cards = phone.getByRole('heading', { level: 2, name: 'What the aircraft monitors' }).locator('xpath=ancestor::section').getByRole('listitem');
      assert.equal(await cards.count(), 6);
      assert.equal(await phone.getByRole('list', { name: /Health monitoring flow/ }).getByRole('listitem').count(), 6);
      const prepared = phone.getByRole('region', { name: 'Prepared by' });
      await prepared.scrollIntoViewIfNeeded();
      assert.equal(await prepared.getByRole('link', { name: /View full profile/ }).getAttribute('href'), '/about/sudarshana-karkala');
      assert((await prepared.innerText()).includes('Experience information last reviewed: 1 October 2026.'));
    });

    await test('Mobile: the homepage link opens the overview', async () => {
      await phone.goto(`${BASE}${HOME}`, { waitUntil: 'networkidle' });
      const link = phone.getByRole('link', { name: /LAUNCH UFLIGHT™ 3D/ });
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await phone.waitForURL(`**${ROUTE}`);
      await phone.getByText('DESKTOP EXPERIENCE RECOMMENDED', { exact: true }).waitFor();
      assert.equal(await phone.locator('canvas').count(), 0);
    });
    await mobile.close();

    assert.deepEqual(errors, [], `uncaught page errors:\n${errors.join('\n')}`);
    console.log(`\n${results.length} checks passed. Screenshots: ${OUTPUT}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
