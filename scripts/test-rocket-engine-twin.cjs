/* Next-Generation Rocket Engine Digital Twin — production browser acceptance checks.
   Build, then start `npm run start -- --port 3100` before running this.
   Screenshots of every view are saved for visual review. */
const BASE = process.env.ROCKET_TWIN_BASE_URL || 'http://localhost:3100';
const OUTPUT = process.env.ROCKET_TWIN_QA_DIR || '/private/tmp/rocket-engine-twin-qa';
const ROUTE = '/space/rocket-engine-digital-twin';
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

  try {
    // ── Desktop, 1440 × 900 ──
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desktop.route(ANALYTICS, route => route.abort());
    const page = await desktop.newPage();
    page.on('pageerror', error => errors.push(`desktop: ${error.message}`));
    const app = page.getByTestId('rocket-twin-3d');
    const description = () => page.getByTestId('scene-description').textContent();
    const button = (name, exact = true) => page.getByRole('button', { name, exact });
    const mode = name => page.getByRole('tablist', { name: 'Digital twin modes' }).getByRole('tab', { name, exact: true });
    const panel = name => page.getByRole('region', { name });
    const settle = (ms = 2000) => page.waitForTimeout(ms);
    const shot = async name => { await page.mouse.move(720, 70); await settle(500); await page.screenshot({ path: path.join(OUTPUT, `${name}.png`) }); };
    const events = () => page.evaluate(() => (window.dataLayer || []).filter(a => a && a[0] === 'event').map(a => a[1]));
    const fps = () => page.evaluate(() => new Promise(resolve => { let n = 0; const t0 = performance.now(); const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else resolve(Math.round(n * 1000 / (performance.now() - t0))); }; requestAnimationFrame(tick); }));
    // A rendered scene compresses to a far larger image than a flat fill.
    const drawn = async () => { const frame = await page.locator('canvas').screenshot(); assert(frame.length > 30000, `canvas looks blank (${frame.length} byte screenshot)`); };

    await test('Route, metadata, structured data and a single H1, all in the server HTML', async () => {
      const response = await page.goto(`${BASE}${ROUTE}`);
      assert.equal(response.status(), 200);
      assert.equal(await page.title(), 'Next-Generation Rocket Engine Digital Twin | Interactive Propulsion Engineering | EV.ENGINEER');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://aerospace.ev.engineer${ROUTE}`);
      assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'index, follow');
      const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent())['@graph'];
      for (const type of ['WebPage', 'WebApplication', 'LearningResource', 'BreadcrumbList']) assert(graph.some(node => node['@type'] === type), type);
      const html = await response.text();
      assert.equal((html.match(/<h1/g) || []).length, 1);
      for (const text of ['Next-Generation Rocket Engine Digital Twin', 'Understand a Rocket Engine as a Complete System', 'Model Credibility', 'Frequently Asked Questions', 'Sudarshana Karkala', 'OBSERVED', 'PREDICTED']) assert(html.includes(text), text);
      // Nothing of three.js is in the HTML the server sends: the application arrives as its own chunk.
      assert(!/three\.module|WebGLRenderer/.test(html));
    });

    await test('HERO: the engine dominates the opening view, with minimal interface', async () => {
      await page.locator('[data-testid=rocket-twin-3d][data-ready=true]').waitFor({ timeout: 90000 });
      assert.equal(await page.locator('canvas').count(), 1);
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(await app.getAttribute('data-entered'), 'false');
      const box = await app.boundingBox();
      assert(box.height / 900 >= 0.85, `application is ${Math.round(box.height / 9)}% of the viewport height`);
      assert(await page.getByRole('link', { name: 'Enter Digital Twin' }).isVisible());
      assert(await button('Guided Engine Tour').isVisible());
      // No dashboard, no mode bar, no panels before the twin is entered.
      assert.equal(await page.getByRole('tablist', { name: 'Digital twin modes' }).count(), 0);
      await settle(1500);
      await drawn();
      await shot('01-hero');
    });

    await test('Enter Digital Twin brings in the navigation without a hard cut, and reports once', async () => {
      await page.getByRole('link', { name: 'Enter Digital Twin' }).click();
      await mode('Explore engine systems').waitFor();
      assert.equal(await app.getAttribute('data-entered'), 'true');
      assert.equal(await app.getAttribute('data-mode'), 'engine');
      assert.deepEqual(await page.getByRole('tablist', { name: 'Digital twin modes' }).getByRole('tab').allTextContents(), ['Engine', 'Build', 'Flow', 'Control', 'Test', 'Health', 'Twin', 'Architecture']);
      // The information panel stays closed until something is selected.
      assert.equal(await panel(/details$/).count(), 0);
      assert.equal((await events()).filter(e => e === 'rocket_twin_enter').length, 1);
      await settle(2200);
      await shot('02-engine-overview');
    });

    await test('ENGINE: a component is selected, the camera moves to it, and a small panel opens', async () => {
      await button('Explore turbomachinery').click();
      await button('Fuel turbopump').click();
      const details = panel('FUEL TURBOPUMP details');
      await details.waitFor();
      assert((await details.boundingBox()).width <= 360);
      assert.match(await description(), /Engine · Turbomachinery · FUEL TURBOPUMP/);
      assert((await events()).includes('rocket_twin_component_select'));
    });

    await test('TURBOMACHINERY: the housing is cut away, the rotor turns, and energy transfer is shown', async () => {
      const details = panel('FUEL TURBOPUMP details');
      await details.getByRole('button', { name: 'VIEW INTERNALS' }).click();
      await details.getByRole('button', { name: 'FOCUS' }).click();
      await details.getByRole('button', { name: /Energy flow/ }).click();
      await page.getByRole('list', { name: 'Energy transfer through the turbopump' }).waitFor();
      assert.deepEqual(await page.getByRole('list', { name: 'Energy transfer through the turbopump' }).getByRole('listitem').allTextContents(), ['HOT-GAS ENERGY', 'TURBINE', 'SHAFT', 'PUMP', 'PROPELLANT PRESSURE']);
      await settle(2200);
      // The rotor is turning: two frames a moment apart differ.
      const a = await page.locator('canvas').screenshot();
      await settle(300);
      const b = await page.locator('canvas').screenshot();
      assert(!a.equals(b), 'the scene is not animating');
      await shot('05-turbomachinery-cutaway');
      await details.getByRole('button', { name: 'BACK TO ENGINE' }).click();
    });

    await test('BUILD: Open Engine separates the systems and cuts them open; the exploded view is proportional', async () => {
      await mode('Open engine build view').click();
      await button(/Open engine: separate/, false).click();
      assert.match(await description(), /Build · Major assemblies · Engine open/);
      await settle(2600);
      await shot('03-open-engine');
      await button(/Open engine: separate/, false).click();
      const slider = page.getByRole('slider', { name: /Exploded view/ });
      await slider.fill('100');
      assert.match(await description(), /Build · Components/);
      await settle(2600);
      await shot('04-exploded');
      await slider.fill('0');
      // Cutaway is its own control: the engine stays assembled.
      await button('View combustion chamber cutaway').click();
      assert.match(await description(), /Build · Assembled · Combustion chamber cutaway/);
      await settle(1600);
      await shot('07-chamber-cutaway');
    });

    await test('FLOW: fuel, oxidiser, coolant and hot gas follow the engine, with pressure and a cooling comparison', async () => {
      await mode('Show engine flow paths').click();
      await button('Show propellant flow').click();
      assert.deepEqual(await page.getByRole('list', { name: 'Propellant colours' }).getByRole('listitem').allTextContents(), ['FUEL', 'OXIDISER']);
      await button('Show pressure along the fluid network').click();
      await page.getByRole('img', { name: 'Pressure scale: low, medium, high' }).waitFor();
      await settle(2400);
      await shot('06a-propellant-pressure');
      await button('Show regenerative cooling flow').click();
      await page.getByText('CONCEPTUAL COOLING GEOMETRY').waitFor();
      await settle(2600);
      await shot('06-cooling');
      await button(/Without cooling/, false).click();
      await page.getByText('SIMULATED COMPARISON').waitFor();
      // The comparison is brief: the wall is restored by itself.
      await page.getByText('SIMULATED COMPARISON').waitFor({ state: 'detached', timeout: 6000 });
      await button('Show hot-gas flow').click();
      await page.getByText('CONCEPTUAL COMBUSTION VISUALIZATION').waitFor();
      await button('VACUUM REFERENCE').click();
      await settle(2400);
      await shot('06b-hot-gas');
    });

    await test('TEST: the environment changes and the run goes from system check to mainstage in sequence', async () => {
      await mode('Open simulated engine test').click();
      await page.getByText('SIMULATED ENGINE TEST', { exact: true }).waitFor();
      await button('Run simulated engine test').click();
      await panel('SYSTEM CHECK').getByText('READY FOR SIMULATION').waitFor();
      const current = () => page.getByRole('list', { name: 'Test phases' }).locator('[aria-current=step]').textContent();
      assert.equal(await current(), 'SYSTEM CHECK');
      await page.getByRole('list', { name: 'Test phases' }).locator('[aria-current=step]', { hasText: 'MAINSTAGE' }).waitFor({ timeout: 30000 });
      assert.equal(await page.getByRole('list', { name: 'Test phases' }).locator('[aria-current=step]').count(), 1);
      await settle(2500);
      await drawn();
      await shot('08-mainstage');
      result.fpsTest = await fps();
    });

    await test('TEST: throttle changes the engine, and shutdown leads to the review', async () => {
      await button('Throttle 40 percent').click();
      assert.equal(await page.getByRole('list', { name: 'Test phases' }).locator('[aria-current=step]').textContent(), 'THROTTLE');
      await settle(1800);
      await button('CONTINUE TO SHUTDOWN').click();
      await panel('POST-RUN REVIEW').waitFor({ timeout: 20000 });
      assert.match(await panel('POST-RUN REVIEW').textContent(), /8 OF 8/);
      const seen = await events();
      assert.equal(seen.filter(e => e === 'rocket_twin_test_start').length, 1);
      assert.equal(seen.filter(e => e === 'rocket_twin_test_complete').length, 1);
    });

    await test('HEALTH: states are on the systems, sensors filter, and a sensor can be traced', async () => {
      await mode('Open engine health monitoring').click();
      const groups = page.getByRole('navigation', { name: 'Engine health by system' });
      assert.equal(await groups.getByRole('button').count(), 6);
      assert.equal(await groups.getByText('NOMINAL').count(), 6);
      await button('Show vibration sensors').click();
      await mode('Open engine control and instrumentation').click();
      await page.getByRole('navigation', { name: 'Sensors the engine controller reads' }).getByRole('button', { name: 'TURBOPUMP VIBRATION' }).click();
      await button('Trace the turbopump vibration sensor').click();
      assert.deepEqual(await page.getByRole('list', { name: /Path of the signal/ }).getByRole('listitem').allTextContents(), ['SENSOR', 'ACQUISITION', 'SIGNAL PROCESSING', 'HEALTH MODEL', 'DIGITAL TWIN', 'DIAGNOSIS', 'DECISION']);
    });

    await test('FAULT: bearing degradation starts healthy on the component and becomes an anomaly, then a diagnosis', async () => {
      await mode('Open engine health monitoring').click();
      await button(/Introduce bearing degradation/, false).click();
      const fault = panel('Bearing degradation scenario');
      await fault.getByText('NOMINAL', { exact: true }).waitFor();
      assert.match(await description(), /bearing region · NOMINAL/);
      await button('Engineer mode: engineering detail').click();
      await fault.getByText('ANOMALY DETECTED').waitFor({ timeout: 20000 });
      assert.equal(await fault.getByText(/FAILURE/).count(), 0);
      await fault.getByRole('button', { name: 'FREQUENCY' }).click();
      await fault.getByRole('img', { name: /Simulated bearing vibration signal: FREQUENCY/ }).waitFor();
      await fault.getByText('POSSIBLE BEARING DEGRADATION').first().waitFor({ timeout: 20000 });
      assert.match(await fault.getByRole('group', { name: 'Diagnosis' }).textContent(), /CONFIDENCE(LOW|MEDIUM|HIGH)/);
      await settle(600);
      await shot('09-bearing-anomaly');
    });

    await test('TWIN: observed, estimated, expected, residual and predicted, with a timeline and model credibility', async () => {
      await button('VIEW IN DIGITAL TWIN').click();
      const twin = panel('Digital twin comparison');
      await twin.waitFor();
      assert.equal(await app.getAttribute('data-mode'), 'twin');
      for (const label of ['OBSERVED', 'ESTIMATED', 'EXPECTED', 'RESIDUAL', 'PREDICTED']) await twin.getByText(label, { exact: true }).waitFor();
      await twin.getByText('OBSERVED − EXPECTED = RESIDUAL').waitFor();
      await settle(2600);
      await shot('10-digital-twin-residual');
      const timeline = page.getByRole('slider', { name: /Twin timeline/ });
      await timeline.fill('80');
      await twin.getByText('Not yet observed').waitFor();
      await twin.getByRole('img', { name: /uncertainty band that widens/ }).waitFor();
      await timeline.fill('-100');
      await twin.getByText('Vibration within baseline', { exact: false }).waitFor();
      await timeline.fill('0');
      await twin.getByRole('button', { name: 'MODEL CREDIBILITY' }).click();
      const card = page.getByRole('group', { name: /Model credibility: Turbomachinery Health Model/ });
      await card.waitFor();
      assert.match(await card.textContent(), /Not Test-Correlated/);
      result.fpsTwin = await fps();
    });

    await test('ARCHITECTURE: the layers sit around the engine, and choosing one is reported', async () => {
      await mode('Open system architecture').click();
      const layers = page.getByRole('navigation', { name: /Architecture layers/ });
      assert.deepEqual(await layers.getByRole('button').allTextContents(), ['ENGINE HARDWARE', 'SENSORS', 'DATA ACQUISITION', 'ENGINE CONTROL', 'PHYSICS MODELS', 'FDIR / HEALTH LOGIC', 'DIGITAL TWIN', 'TEST EVIDENCE']);
      // The digital layers are also laid out in the scene, as nodes that can be picked.
      await button('Architecture layer: FDIR / HEALTH LOGIC').click();
      assert.equal(await layers.getByRole('button', { name: 'FDIR / HEALTH LOGIC' }).getAttribute('aria-pressed'), 'true');
      await button(/Traceability/, false).click();
      await panel('TRACEABILITY').getByText('Pass').waitFor();
      await settle(2400);
      await shot('11-architecture');
    });

    await test('GUIDED TOUR: twelve stages, pause, back, and an exit that leaves the scene whole', async () => {
      await page.goto(`${BASE}${ROUTE}`);
      await page.locator('[data-testid=rocket-twin-3d][data-ready=true]').waitFor({ timeout: 90000 });
      await button('Guided Engine Tour').click();
      const tour = panel('Guided engine tour');
      const titles = [];
      for (let i = 0; i < 12; i++) {
        await tour.getByText(`${String(i + 1).padStart(2, '0')} / 12`).waitFor();
        titles.push((await tour.getByRole('status').locator('p').first().textContent()).trim());
        if (i === 3) {
          await tour.getByRole('button', { name: 'PAUSE' }).click();
          await tour.getByRole('button', { name: 'RESUME' }).click();
        }
        await settle(700);
        if (i < 11) await tour.getByRole('button', { name: 'NEXT' }).click();
      }
      assert.deepEqual(titles, ['Meet the Engine', 'Open the Engine', 'Follow Propellant', 'Understand Turbomachinery', 'Enter the Combustion Chamber', 'See Regenerative Cooling', 'Understand the Nozzle', 'Start the Engine', 'Monitor Sensors', 'Detect an Anomaly', 'Compare the Digital Twin', 'Review the Test']);
      await tour.getByRole('button', { name: 'BACK' }).click();
      await tour.getByText('11 / 12').waitFor();
      await tour.getByRole('button', { name: 'EXIT TOUR' }).click();
      await mode('Explore engine systems').waitFor();
      assert.equal(await app.getAttribute('data-mode'), 'engine');
      assert.match(await description(), /^Engine · /);
      await settle(1800);
      await drawn();
    });

    await test('The long-form content sits below the application and links back into it', async () => {
      await page.getByRole('link', { name: 'Engineering notes ↓' }).click();
      await page.getByRole('heading', { level: 2, name: 'Understand a Rocket Engine as a Complete System' }).waitFor();
      await page.getByRole('link', { name: 'Explore regenerative cooling' }).click();
      await page.waitForFunction(() => document.querySelector('[data-testid=scene-description]')?.textContent === 'Engine · Regenerative Cooling');
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    });

    result.fpsEngine = await fps();
    result.renderer = await page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const info = gl && gl.getExtension('WEBGL_debug_renderer_info'); return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown'; });

    // ── Phone, 390 × 844 ──
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await phone.route(ANALYTICS, route => route.abort());
    const mobile = await phone.newPage();
    mobile.on('pageerror', error => errors.push(`mobile: ${error.message}`));

    await test('MOBILE: the same subject at the same address, without WebGL or three.js', async () => {
      const requested = [];
      mobile.on('request', request => requested.push(request.url()));
      await mobile.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
      assert.equal(await mobile.locator('canvas').count(), 0);
      assert.equal(await mobile.evaluate(() => typeof window.__THREE__), 'undefined');
      assert.equal(await mobile.getByRole('heading', { level: 1 }).textContent(), 'Next-Generation Rocket Engine Digital Twin');
      await mobile.getByText('Design · Simulate · Test · Diagnose').waitFor();
      await mobile.getByText('DESKTOP EXPERIENCE RECOMMENDED').waitFor();
      // The tour and the desktop note belong to the 3D application: a phone offers the engine demo instead.
      assert.equal(await mobile.getByRole('button', { name: 'Guided Engine Tour' }).isVisible(), false);
      assert.equal(await mobile.getByText('Desktop / Laptop Experience').isVisible(), false);
      assert(await mobile.getByRole('link', { name: 'Run Engine Demo' }).isVisible());
      assert(await mobile.getByRole('img', { name: /reference architecture in a dark engineering studio/ }).isVisible());
      assert(requested.some(url => url.includes('poster.jpg')));
      assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 0);
      for (const name of ['Explore the propellant feed system', 'Explore turbomachinery', 'Explore the combustion chamber', 'Explore regenerative cooling', 'Explore the engine control system']) assert.equal(await mobile.getByRole('button', { name }).count(), 1, name);
      for (const name of ['Open engine health monitoring', 'Compare digital twin states']) assert.equal(await mobile.getByRole('tab', { name }).count(), 1, name);
      const sent = await mobile.evaluate(() => (window.dataLayer || []).filter(a => a && a[0] === 'event').map(a => a[1]));
      assert.equal(sent.filter(e => e === 'rocket_twin_mobile_view').length, 1);
      assert.equal(sent.filter(e => e === 'rocket_twin_desktop_recommendation_view').length, 1);
      await mobile.screenshot({ path: path.join(OUTPUT, '12-mobile.png') });
      // The lightweight console, further down the same page.
      await mobile.getByRole('tablist', { name: 'Digital twin modes' }).scrollIntoViewIfNeeded();
      await mobile.screenshot({ path: path.join(OUTPUT, '12-mobile-console.png') });
    });

    assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
    console.log(`\n${results.length} checks passed. Screenshots: ${OUTPUT}`);
    console.log(`Renderer: ${result.renderer}`);
    console.log(`Frames per second at 1440 × 900: engine ${result.fpsEngine}, test ${result.fpsTest}, twin ${result.fpsTwin}`);
  } finally {
    await browser.close();
  }
}

const result = {};
main().catch(error => { console.error(error); process.exit(1); });
