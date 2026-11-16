/* Start the local app first. Override ENERGY_ACADEMY_BASE_URL for production QA. */
const BASE = process.env.ENERGY_ACADEMY_BASE_URL || 'http://127.0.0.1:3107';
const OUTPUT = process.env.ENERGY_ACADEMY_QA_DIR || '/private/tmp/satellite-energy-academy-qa';
async function main() {
  const [{ default: assert }, fs, { chromium }] = await Promise.all([
    import('node:assert/strict'), import('node:fs/promises'), import('playwright'),
  ]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat|server rendered|client properties/i.test(message.text())) errors.push(message.text()); });
  const check = async (name, run) => { await run(); console.log(`PASS ${name}`); };
  const power = () => page.getByTestId('generated-power').innerText();
  try {
    await check('route, metadata, six worlds and initial calculation', async () => {
      const response = await page.goto(`${BASE}/space/satellite-energy-academy`);
      assert.equal(response.status(), 200);
      await page.getByText('Progress stays in this browser. No account needed.').waitFor();
      assert.match(await page.title(), /^Satellite Energy Academy \| Learn Physics/);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://aerospace.ev.engineer/space/satellite-energy-academy');
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(await page.locator('#learning-worlds article').count(), 6);
      assert.equal(await page.getByText('In development · not yet playable', { exact: true }).count(), 5);
      assert.match(await power(), /50.0 W/);
      await page.getByRole('button', { name: 'Turn the satellite energy model', exact: true }).waitFor({ state: 'visible', timeout: 20000 });
      await page.getByRole('button', { name: 'Turn the satellite energy model', exact: true }).click();
      await page.screenshot({ path: `${OUTPUT}/desktop-hero.png` });
    });
    await check('keyboard controls, graph, reflection, completion and saved progress', async () => {
      const angle = page.getByRole('slider', { name: /Solar-panel angle/ });
      await angle.focus(); await page.keyboard.press('Home');
      assert.match(await power(), /100.0 W/);
      assert.equal(await page.getByRole('img', { name: /Current point: 0 degrees, 100.0 watts/ }).count(), 1);
      await page.keyboard.press('End'); assert.match(await power(), /0.0 W/);
      await page.getByRole('button', { name: 'Reset experiment', exact: true }).click();
      assert.match(await power(), /50.0 W/);
      await page.getByRole('button', { name: 'Give me a hint' }).click();
      assert(await page.getByText('Try pointing the panel more directly toward the Sun: move the angle toward 0°.').isVisible());
      await angle.focus(); await page.keyboard.press('Home');
      await page.getByRole('radio', { name: 'The panel intercepts a wider cross-section of the incoming light.' }).check();
      await page.getByRole('button', { name: 'Complete the mission', exact: true }).click();
      await page.getByText(/Sun Catcher earned!/).waitFor();
      await page.reload();
      await page.getByRole('button', { name: 'Advanced challenge', exact: true }).waitFor();
      assert(await page.getByText('1 of 1 available missions complete', { exact: true }).isVisible());
    });
    await check('free mode, live equation, manual animation and pause', async () => {
      await page.getByRole('button', { name: 'Free Experiment', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Complete the mission', exact: true }).count(), 0);
      await page.getByText('Show the Mathematics', { exact: true }).click();
      assert(await page.getByText('P = G × A × η × max(0, cos θ)', { exact: true }).isVisible());
      await page.getByRole('button', { name: 'Play angle sweep' }).click();
      await page.waitForFunction(() => Number(document.querySelector('#solar-angleDeg').value) > 60);
      await page.getByRole('button', { name: 'Pause sweep' }).click();
      const stopped = await page.locator('#solar-angleDeg').inputValue();
      await page.getByRole('button', { name: 'Reset experiment' }).click();
      assert(Number(stopped) > 60);
      assert.match(await power(), /50.0 W/);
      await page.locator('#capture-the-sun').evaluate(el => el.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: `${OUTPUT}/desktop-lab.png` });
    });
    await check('mobile, reduced motion and no-WebGL fallback', async () => {
      const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
      await mobile.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/.test(type) ? null : original.call(this, type, ...args); };
      });
      const p = await mobile.newPage();
      p.on('pageerror', error => errors.push(error.message));
      await p.goto(`${BASE}/space/satellite-energy-academy`);
      await p.getByText('Reduced motion is on. Use the angle slider to explore at your own pace.').waitFor();
      assert(await p.getByRole('button', { name: 'Play angle sweep' }).isDisabled());
      assert.equal(await p.locator('canvas').count(), 0);
      for (const width of [390, 320]) {
        await p.setViewportSize({ width, height: 844 });
        assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`);
        await p.screenshot({ path: `${OUTPUT}/mobile-${width}-hero.png` });
        await p.locator('#capture-the-sun').evaluate(el => el.scrollIntoView({ block: 'start' }));
        await p.screenshot({ path: `${OUTPUT}/mobile-${width}-lab.png` });
        await p.evaluate(() => scrollTo(0, 0));
      }
      await p.getByRole('slider', { name: /Solar-panel angle/ }).fill('0');
      assert.match(await p.getByTestId('generated-power').innerText(), /100.0 W/);
      await mobile.close();
    });
    await check('Space integration preserves adjacent projects', async () => {
      await page.goto(`${BASE}/space`);
      const rows = await page.locator('#simulations ol > li h3').allTextContents();
      const i = rows.indexOf('CubeTwin');
      assert.deepEqual(rows.slice(i, i + 3), ['CubeTwin', 'Satellite Energy Academy', 'Space Station']);
      assert.equal(rows.filter(x => x === 'Satellite Energy Academy').length, 1);
      await page.getByRole('link', { name: 'Explore Energy Academy', exact: true }).click();
      await page.getByRole('heading', { name: 'Make Physics & Mathematics Come Alive.' }).waitFor();
    });
    await check('supported hosts reach the academy route', async () => {
      for (const host of ['aerospace.ev.engineer', 'autonomous.ev.engineer', 'aerospace.ishavasyam.org', 'aerospace.stellrspace.com', 'aerospace.gamyaa.in']) {
        const response = await context.request.get(`${BASE}/space/satellite-energy-academy`, { headers: { host } });
        assert.equal(response.status(), 200, host);
        assert((await response.text()).includes('Make Physics &amp; Mathematics Come Alive.'), host);
      }
    });
    assert.deepEqual(errors, [], 'browser runtime errors');
    console.log(`Screenshots: ${OUTPUT}`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
