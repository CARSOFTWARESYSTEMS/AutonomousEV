/* Satellite Explorer 3D — production browser acceptance checks.
   Build, then start `npm run start -- --port 3100` before running this.
   Set EXPLORER_FULL_RUN=1 to let the mission play through in real time (about two minutes). */
const BASE = process.env.EXPLORER_BASE_URL || 'http://localhost:3100';
const OUTPUT = process.env.EXPLORER_QA_DIR || '/private/tmp/satellite-explorer-qa';
const FULL_RUN = process.env.EXPLORER_FULL_RUN === '1';
const ROUTE = '/space/satellite-engineering/interactive-3d';
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
    const app = page.getByTestId('satellite-explorer');
    const button = (name, exact = true) => page.getByRole('button', { name, exact });
    const mode = name => page.getByRole('navigation', { name: 'Explorer modes' }).getByRole('button', { name, exact: true });

    await test('Route, metadata, structured data and a single H1', async () => {
      const response = await page.goto(`${BASE}${ROUTE}`);
      assert.equal(response.status(), 200);
      assert.equal(await page.title(), 'Satellite Explorer 3D | Interactive Satellite Engineering | EV.ENGINEER');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://aerospace.ev.engineer${ROUTE}`);
      const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent())['@graph'];
      assert(graph.some(node => node['@type'] === 'WebApplication'));
      assert(graph.some(node => node['@type'] === 'LearningResource'));
      // The server HTML carries the learning content even though the 3D scene is client-only.
      assert((await response.text()).includes('How a satellite works'));
    });

    await test('Satellite, Earth and atmosphere render (scene ready, WebGL canvas present)', async () => {
      await page.locator('[data-testid=satellite-explorer][data-ready=true]').waitFor({ timeout: 90000 });
      assert.equal(await page.locator('canvas').count(), 1);
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(typeof (await page.evaluate(() => window.__THREE__)), 'string');
      // The frame is not blank: a rendered scene compresses to a far larger PNG than a flat fill.
      await page.waitForTimeout(1200);
      const frame = await page.locator('canvas').screenshot();
      assert(frame.length > 60000, `canvas looks blank (${frame.length} byte screenshot)`);
      await shot(page, 'desktop-hero');
    });

    await test('Start Exploration brings in the interface without a hard cut', async () => {
      await button(/START EXPLORATION/, false).click();
      await mode('EXPLORE').waitFor();
      assert.equal(await app.getAttribute('data-mode'), 'explore');
      assert.equal(await mode('EXPLORE').getAttribute('aria-current'), 'page');
      assert.equal(await page.locator('canvas').count(), 1);
    });

    await test('Mouse rotate and zoom move the camera', async () => {
      await page.waitForTimeout(2200);
      const before = await page.locator('canvas').screenshot();
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(640, 380, { steps: 12 });
      await page.mouse.up();
      await page.mouse.wheel(0, -400);
      await page.waitForTimeout(600);
      const after = await page.locator('canvas').screenshot();
      assert(!before.equals(after), 'view did not change after drag and wheel');
    });

    await test('Clicking the spacecraft selects a component and opens its panel; Esc goes back', async () => {
      await page.mouse.click(720, 430);
      await page.getByTestId('component-panel').waitFor({ timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.getByTestId('component-panel').waitFor({ state: 'detached' });
    });

    await test('Battery: Learn and Engineer panels', async () => {
      await button('Components').click();
      await page.getByRole('dialog', { name: 'Spacecraft components' }).getByRole('button', { name: 'Battery Pack', exact: true }).click();
      const panel = page.getByTestId('component-panel');
      await panel.waitFor();
      assert((await panel.innerText()).includes('Stores electrical energy for eclipse and peak loads.'));
      await button('ENGINEER').click();
      const text = await panel.innerText();
      assert(text.includes('40 Wh reference'));
      assert(text.includes('PCDU / Power bus'));
      assert(text.includes('REFERENCE & SIMULATED VALUES'));
      await button('LEARN').click();
      await button('BACK').click();
      await panel.waitFor({ state: 'detached' });
    });

    await test('Exploded view and X-ray', async () => {
      await button('EXPLODE').click();
      assert.equal(await page.getByRole('slider', { name: /EXPLODED/ }).inputValue(), '100');
      await page.waitForTimeout(2600);
      await shot(page, 'exploded-view');
      await page.keyboard.press('x');
      assert.equal(await button('X-RAY').getAttribute('aria-pressed'), 'true');
      await page.keyboard.press('x');
      assert.equal(await button('X-RAY').getAttribute('aria-pressed'), 'false');
      await button('ASSEMBLE').click();
      assert.equal(await page.getByRole('slider', { name: /EXPLODED/ }).inputValue(), '0');
    });

    await test('Build sequence: eight steps to an assembled spacecraft', async () => {
      await mode('BUILD').click();
      const steps = page.getByRole('list', { name: 'Assembly steps' }).getByRole('button');
      assert.equal(await steps.count(), 8);
      assert.equal(await steps.nth(0).getAttribute('aria-current'), 'step');
      await button('NEXT').click();
      assert.equal(await steps.nth(1).getAttribute('aria-current'), 'step');
      await page.waitForTimeout(3600);
      await shot(page, 'build-mode');
      await steps.nth(7).click();
      await page.getByText('SPACECRAFT ASSEMBLED', { exact: true }).waitFor();
      await button(/RUN MISSION/, false).waitFor();
    });

    await test('Power flow: generation, load, battery and the CubeTwin cross-link', async () => {
      await mode('SYSTEMS').click();
      const panel = page.getByTestId('system-panel');
      await panel.waitFor();
      const text = await panel.innerText();
      for (const label of ['GENERATED', 'LOAD', 'BATTERY', 'STATE']) assert(text.toUpperCase().includes(label), label);
      assert.equal(await panel.getByRole('link', { name: /RUN ENERGY SIMULATION IN CUBETWIN/ }).getAttribute('href'), '/space/cubesat');
      await panel.getByRole('button', { name: 'ECLIPSE', exact: true }).click();
      await panel.getByText('Battery supplies the loads', { exact: true }).waitFor({ timeout: 15000 });
      await panel.getByRole('button', { name: 'SUNLIGHT', exact: true }).click();
      await panel.getByText('Arrays generating', { exact: true }).waitFor({ timeout: 15000 });
      await page.waitForTimeout(1500);
      await shot(page, 'power-mode');
    });

    await test('ADCS demonstration: a slew is commanded and the wheel responds', async () => {
      await page.getByRole('tab', { name: 'ADCS', exact: true }).click();
      const panel = page.getByTestId('system-panel');
      const wheelY = async () => (await panel.getByText('Wheel Y', { exact: true }).locator('xpath=following-sibling::dd').innerText()).replace(/[^\d−+-]/g, '');
      await page.waitForTimeout(2500);
      const idle = await wheelY();
      await button('Slew about body Y').click();
      await page.waitForTimeout(2200);
      const slewing = await wheelY();
      assert.notEqual(slewing, idle, `wheel Y speed did not change during the slew (${idle})`);
    });

    await test('Payload capture: target acquired, capture, 243 → 318 MB stored', async () => {
      await page.getByRole('tab', { name: 'PAYLOAD', exact: true }).click();
      const panel = page.getByTestId('system-panel');
      await panel.getByText('243 MB').waitFor({ timeout: 8000 });
      await button('CAPTURE').click();
      await page.getByTestId('callout').filter({ hasText: 'TARGET ACQUIRED' }).waitFor({ timeout: 10000 });
      await page.getByTestId('callout').filter({ hasText: /^CAPTURE$/ }).waitFor({ timeout: 10000 });
      await panel.getByText('318 MB').waitFor({ timeout: 15000 });
    });

    await test('Ground station exists and is labelled illustrative', async () => {
      await mode('SIGNALS').click();
      await page.getByRole('complementary', { name: 'Mission control' }).getByText('ILLUSTRATIVE GROUND STATION — BENGALURU', { exact: true }).waitFor();
      await page.getByRole('complementary', { name: 'Mission control' }).getByText('LINK ACTIVE', { exact: true }).waitFor({ timeout: 15000 });
    });

    await test('Command uplink: sent, received, executed and verified', async () => {
      const console_ = page.getByRole('complementary', { name: 'Mission control' });
      await button('SEND COMMAND').click();
      const steps = console_.getByRole('list', { name: 'Command progress' }).getByRole('listitem');
      await console_.locator('li[aria-current=step]', { hasText: 'UPLINK' }).waitFor({ timeout: 5000 });
      await console_.locator('li[aria-current=step]', { hasText: 'RECEIVED' }).waitFor({ timeout: 8000 });
      await console_.locator('li[aria-current=step]', { hasText: 'EXECUTING' }).waitFor({ timeout: 8000 });
      await page.waitForFunction(() => Array.from(document.querySelectorAll('[aria-label="Command progress"] li')).every(li => li.dataset.state === 'done'), null, { timeout: 12000 });
      assert.equal(await steps.count(), 4);
    });

    await test('Telemetry and payload-data routes', async () => {
      await page.getByRole('tab', { name: 'TELEMETRY', exact: true }).click();
      const route = page.getByTestId('signal-panel');
      assert((await route.innerText()).includes('Satellite → Ground'));
      await page.getByRole('complementary', { name: 'Mission control' }).getByText('SPACECRAFT NOMINAL', { exact: true }).waitFor({ timeout: 8000 });
      await page.getByRole('tab', { name: 'PAYLOAD DATA', exact: true }).click();
      assert((await route.innerText()).includes('X-band'));
    });

    await test('Orbit mode: reference orbit, sunlight state and link state', async () => {
      await mode('ORBIT').click();
      const panel = page.getByTestId('orbit-panel');
      await panel.waitFor();
      const text = await panel.innerText();
      assert(text.includes('~525 km') && text.includes('~95 min') && text.includes('97.5°'));
      assert(/SUNLIGHT|ECLIPSE/.test(text));
      assert(/NO LINK|AOS|LINK ACTIVE|LOS/.test(text));
      await button('ECLIPSE').click();
      await panel.locator('[data-state=eclipse]').waitFor({ timeout: 30000 });
      assert((await panel.innerText()).includes('Discharging'));
    });

    await test('Mission runs end to end and completes', async () => {
      await mode('MISSION').click();
      await button(/RUN MISSION/, false).click();
      await page.locator('[data-testid=satellite-explorer][data-mission-stage=BOOT]').waitFor();
      const stage = page.getByTestId('mission-stage');
      const control = page.getByRole('complementary', { name: 'Mission control' });
      if (FULL_RUN) {
        // Let every stage play; record the order they appear in.
        const seen = [];
        const deadline = Date.now() + 150000;
        while (Date.now() < deadline) {
          const current = await app.getAttribute('data-mission-stage');
          if (seen[seen.length - 1] !== current) seen.push(current);
          if (current === 'COMPLETE' && (await button('Run mission again').count())) break;
          await page.waitForTimeout(250);
        }
        assert.deepEqual(seen, ['BOOT', 'POWER', 'ATTITUDE', 'TARGET', 'CAPTURE', 'STORE', 'GROUND_PASS', 'UPLINK', 'TELEMETRY', 'PAYLOAD_DOWNLINK', 'COMPLETE']);
      } else {
        // Step through every stage with NEXT, checking each is reached in order.
        const expected = ['POWER', 'ATTITUDE ACQUISITION', 'TARGET APPROACH', 'EARTH OBSERVATION', 'STORE DATA', 'GROUND PASS', 'COMMAND UPLINK', 'TELEMETRY', 'PAYLOAD DOWNLINK', 'PASS COMPLETE'];
        for (const label of expected) {
          await button('Next stage').click();
          assert((await stage.innerText()).includes(label), label);
          if (label === 'GROUND PASS') {
            await page.getByTestId('callout').filter({ hasText: 'AOS' }).waitFor({ timeout: 15000 });
            await shot(page, 'mission-ground-pass');
          }
          if (label === 'TELEMETRY') await control.getByText('SPACECRAFT NOMINAL', { exact: true }).waitFor({ timeout: 15000 });
          if (label === 'PAYLOAD DOWNLINK') await control.getByText('PAYLOAD DATA RECEIVED', { exact: true }).waitFor({ timeout: 25000 });
        }
        await button('Run mission again').waitFor({ timeout: 20000 });
      }
      assert.equal(await app.getAttribute('data-mission-stage'), 'COMPLETE');
      await page.getByTestId('callout').filter({ hasText: 'LOS' }).waitFor({ timeout: 5000 });
      assert((await page.getByLabel(/Mission clock/).innerText()).startsWith('12:00'));
      await control.getByText('PAYLOAD DATA RECEIVED', { exact: true }).waitFor();
    });

    await test('Reset, help and the guided tour', async () => {
      await mode('RESET').click();
      assert.equal(await app.getAttribute('data-mode'), 'explore');
      await button('Help: how to control the view').click();
      await page.getByRole('dialog', { name: 'Controls' }).getByText('Double Click', { exact: true }).waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: 'Controls' }).waitFor({ state: 'detached' });
    });

    // ── Calls to action on the two related pages ──
    await test('Satellite Engineering CTA opens the explorer', async () => {
      await page.goto(`${BASE}/space/satellite-engineering`);
      const link = page.getByRole('link', { name: /Launch Satellite Explorer 3D/ });
      assert.equal(await link.getAttribute('href'), ROUTE);
      await link.click();
      await page.waitForURL(`**${ROUTE}`);
      await page.locator('[data-testid=satellite-explorer][data-ready=true]').waitFor({ timeout: 90000 });
    });

    await test('CubeTwin cross-link opens the explorer and keeps its own simulation CTA', async () => {
      await page.goto(`${BASE}/space/cubesat`);
      await page.getByRole('link', { name: /Launch Energy Simulation/ }).waitFor();
      const link = page.getByRole('link', { name: /Explore Satellite in 3D/ });
      assert.equal(await link.getAttribute('href'), ROUTE);
      await link.click();
      await page.waitForURL(`**${ROUTE}`);
    });
    await desktop.close();

    // ── Mobile, 390 × 844 ──
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobile.route(ANALYTICS, route => route.abort());
    const phone = await mobile.newPage();
    phone.on('pageerror', error => errors.push(`mobile: ${error.message}`));
    const requested = [];
    phone.on('request', request => requested.push(request.url()));

    await test('Mobile: compact page, desktop recommendation, no 3D loaded', async () => {
      await phone.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
      await phone.getByText('DESKTOP EXPERIENCE RECOMMENDED', { exact: true }).waitFor();
      await phone.getByText('Interactive 3D experience is designed for Laptop/Desktop', { exact: true }).waitFor();
      assert.equal(await phone.locator('canvas').count(), 0);
      assert.equal(await phone.getByTestId('satellite-explorer').count(), 0);
      // three.js announces itself on window when it loads; on a phone it must not have.
      assert.equal(await phone.evaluate(() => typeof window.__THREE__), 'undefined');
      assert(!requested.some(url => /earth-(day|night|clouds)/.test(url)), 'Earth textures were requested on mobile');
      assert.equal(await phone.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      await phone.screenshot({ path: path.join(OUTPUT, 'mobile-page.png'), fullPage: true });
    });

    await test('Mobile: subsystem basics and onward links', async () => {
      const cards = phone.getByRole('heading', { level: 2, name: 'How a satellite works' }).locator('xpath=ancestor::section').getByRole('listitem');
      assert.equal(await cards.count(), 6);
      assert.equal(await phone.getByRole('main').getByRole('link', { name: 'Satellite Engineering' }).getAttribute('href'), '/space/satellite-engineering');
      assert.equal(await phone.getByRole('main').getByRole('link', { name: 'CubeTwin' }).getAttribute('href'), '/space/cubesat');
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
