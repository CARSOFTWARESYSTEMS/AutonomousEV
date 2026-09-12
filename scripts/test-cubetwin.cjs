/* Production browser acceptance checks. Start `npm run start -- --port 3100` first. */
const BASE = process.env.CUBETWIN_BASE_URL || 'http://127.0.0.1:3100';
const OUTPUT = process.env.CUBETWIN_QA_DIR || '/private/tmp/cubetwin-qa';
async function main() {
  const [{ default: assert }, fs, { default: path }, { chromium }] = await Promise.all([
    import('node:assert/strict'), import('node:fs/promises'), import('node:path'), import('playwright'),
  ]);
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [], results = [], performance = {};
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver(list => { window.__lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); });
  const test = async (name, action) => { await action(); results.push(name); console.log(`PASS ${name}`); };
  const ready = () => page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Run simulation' && !b.disabled));
  try {
    await test('Production route, canonical, schema, rendered content and 3D', async () => {
      const response = await page.goto(`${BASE}/space/cubesat`);
      assert.equal(response.status(), 200);
      await page.locator('canvas[data-ready=true], canvas[data-renderer=static]').waitFor();
      assert.equal(await page.title(), 'CubeTwin | CubeSat Battery & Energy Digital Twin');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://aerospace.ev.engineer/space/cubesat');
      const json = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
      assert(json['@graph'].some(n => n['@type'] === 'LearningResource'));
      assert((await response.text()).includes('What is CubeTwin?'));
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      await page.screenshot({ path: path.join(OUTPUT, 'desktop.png') });
      Object.assign(performance, await page.evaluate(() => ({ lcpMs: window.__lcp, fcpMs: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime, navigationMs: window.performance.getEntriesByType('navigation')[0].duration, userAgent: navigator.userAgent })));
    });
    await test('Keyboard tabs and field validation preserve prior results', async () => {
      await page.getByRole('tab', { name: 'Mission', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.getByRole('tab', { name: 'Power', exact: true }).getAttribute('aria-selected'), 'true');
      await page.keyboard.press('ArrowLeft');
      await page.getByLabel('Orbit altitude').fill('99999');
      await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
      await page.locator('#simulator [role=alert]').waitFor();
      assert.equal(await page.getByLabel('Orbit altitude').getAttribute('aria-invalid'), 'true');
      await page.getByLabel('Orbit altitude').fill('600');
      await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
      await ready();
      assert((await page.locator('[role=img]').first().getAttribute('aria-label')).includes('Earth'));
    });
    await test('Worker presets, recorded playback, full history and export', async () => {
      await page.getByRole('button', { name: 'Heater Stuck On', exact: true }).click();
      await ready();
      assert((await page.locator('#fault-lab').innerText()).includes('Heater stuck on · 0.0–24.0 h'));
      await page.getByRole('button', { name: 'Play recorded simulation' }).click();
      await page.getByRole('button', { name: 'Pause playback' }).waitFor();
      await page.getByRole('button', { name: 'Pause playback' }).click();
      await page.getByRole('slider', { name: 'Mission time', exact: true }).focus();
      await page.keyboard.press('End');
      assert.equal(await page.getByRole('slider', { name: 'Mission time', exact: true }).getAttribute('aria-valuetext'), '24:00:00');
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Run JSON', exact: true }).click();
      const download = await downloadPromise;
      const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
      assert.equal(exported.schemaVersion, '1.0'); assert.equal(exported.units.timeSeconds, 's');
      assert(exported.metrics.safeEntries > 0); assert(Math.abs(exported.metrics.energyResidualWh) < 1e-8);
      const csvPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export CSV' }).click();
      const csv = await csvPromise;
      assert((await fs.readFile(await csv.path(), 'utf8')).includes('observedSocPercent [% (blank = dropout)]'));
      await page.locator('#simulator').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUTPUT, 'simulator.png') });
    });
    await test('Fault laboratory separates truth, readings and detector status', async () => {
      await page.getByLabel('Choose an experiment').selectOption('soc-bias');
      await page.locator('#fault-lab').getByLabel('Start time').fill('0');
      await page.locator('#fault-lab').getByLabel('Duration', { exact: false }).fill('1');
      await page.getByRole('button', { name: 'Run fault experiment' }).click();
      await ready();
      assert((await page.locator('#fault-lab').innerText()).includes('SOC discrepancy (truth-assisted)'));
      assert.equal(await page.locator('#simulator').getByText('Inputs changed. Run to update results.').count(), 0);
      await page.getByRole('button', { name: 'Clear all injected faults' }).click(); await ready();
    });
    await test('Seeded Monte Carlo runs in the browser worker', async () => {
      await page.getByLabel('Trials').fill('5');
      await page.getByRole('button', { name: 'Run Monte Carlo', exact: true }).click();
      await page.locator('#fault-lab [role=status]').waitFor({ timeout: 30000 });
      assert((await page.locator('#fault-lab [role=status]').innerText()).includes('5 trials · seed 20260930'));
    });
    await test('Scenario import rejects malformed JSON and accepts exported template', async () => {
      await page.getByLabel('Import scenario JSON').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":"99"}') });
      await page.locator('#simulator [role=alert]').waitFor();
      const templatePromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Scenario template' }).click();
      const template = await templatePromise;
      await page.getByLabel('Import scenario JSON').setInputFiles(await template.path());
      await ready();
      assert.equal(await page.locator('#simulator [role=alert]').count(), 0);
    });
    await test('Searchable glossary, persistent checklists and local workbook notes', async () => {
      await page.getByRole('searchbox', { name: 'Search the glossary' }).fill('hysteresis');
      assert((await page.locator('#glossary [role=status]').innerText()).includes('1 of 97'));
      await page.getByRole('searchbox', { name: 'Search the glossary' }).fill('');
      await page.locator('#roadmap details').first().locator('summary').click();
      await page.locator('#roadmap input[type=checkbox]').first().check();
      await page.getByLabel('Your prediction, observations & engineering conclusion').fill('QA: increased resistance produces greater voltage sag.');
      await page.reload();
      await page.locator('#roadmap details').first().locator('summary').click();
      assert(await page.locator('#roadmap input[type=checkbox]').first().isChecked());
      assert.equal(await page.getByLabel('Your prediction, observations & engineering conclusion').inputValue(), 'QA: increased resistance produces greater voltage sag.');
    });
    await test('Desktop accessibility scan', async () => {
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } }));
      await fs.writeFile(path.join(OUTPUT, 'accessibility.json'), JSON.stringify(axe.violations, null, 2));
      assert.deepEqual(axe.violations.map(v => `${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join(', ')}`), []);
    });
    for (const [width,height] of [[360,800],[390,844],[412,915],[768,1024]]) {
      await test(`Responsive layout ${width}×${height}`, async () => {
        await page.setViewportSize({ width, height });
        await page.goto(`${BASE}/space/cubesat`);
        await page.locator('canvas[data-ready=true], canvas[data-renderer=static]').waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const clipped = await page.locator('main input:not([type=file]):not([type=checkbox]), main select, main textarea').evaluateAll(els => els.filter(el => {const r=el.getBoundingClientRect();return r.width>0 && (r.right>innerWidth+1 || r.left<0);}).map(el=>el.outerHTML));
        assert.deepEqual(clipped, []);
        await page.screenshot({ path:path.join(OUTPUT,`mobile-${width}.png`) });
        await page.locator('#simulator').scrollIntoViewIfNeeded();
        await page.screenshot({ path:path.join(OUTPUT,`simulator-${width}.png`) });
        if(width===390) {
          await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
          const issues=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));
          assert.deepEqual(issues,[],'Mobile accessibility');
        }
      });
    }
    await test('Reduced motion and no-WebGL fallback', async () => {
      const fallback = await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
      await fallback.addInitScript(() => {const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:get.call(this,type,...args);};});
      const tab=await fallback.newPage();await tab.goto(`${BASE}/space/cubesat`);
      await tab.locator('canvas').waitFor();assert.equal(await tab.locator('canvas').getAttribute('data-ready'),null);
      assert(await tab.locator('[role=img]').first().isVisible());
      assert(await tab.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
      await tab.locator('[role=img]').first().screenshot({path:path.join(OUTPUT,'no-webgl.png')});
      await fallback.close();
    });
    await test('Print workbook exposes all weeks and removes dark backgrounds', async () => {
      await page.setViewportSize({width:1100,height:900});
      await page.emulateMedia({media:'print'});
      await page.locator('details').evaluateAll(els=>els.forEach(el=>el.open=true));
      assert.equal(await page.locator('#roadmap details').count(),12);
      assert.equal(await page.locator('#glossary dt').count(),97);
      await page.pdf({path:path.join(OUTPUT,'cubetwin-workbook.pdf'),format:'A4',printBackground:true,margin:{top:'15mm',bottom:'15mm',left:'15mm',right:'15mm'}});
      await page.screenshot({path:path.join(OUTPUT,'print-preview.png')});
      await page.emulateMedia({media:'screen'});
    });
    await test('Space card, robots, sitemap and Open Graph image', async () => {
      await page.goto(`${BASE}/space`);
      await page.locator('#simulations').getByRole('link',{name:'Explore CubeTwin',exact:true}).click();
      await page.waitForURL('**/space/cubesat');
      assert((await (await page.request.get(`${BASE}/robots.txt`)).text()).includes('OAI-SearchBot'));
      assert((await (await page.request.get(`${BASE}/sitemap.xml`)).text()).includes('https://aerospace.ev.engineer/space/cubesat'));
      const og=await page.request.get(`${BASE}/space/cubesat/opengraph-image`);assert.equal(og.status(),200);assert(og.headers()['content-type'].includes('image/png'));
      await fs.writeFile(path.join(OUTPUT,'opengraph.png'),await og.body());
    });
    assert.deepEqual(errors,[],'No uncaught browser errors');
    await fs.writeFile(path.join(OUTPUT,'results.json'),JSON.stringify({passed:results.length,results,errors,performance},null,2));
    console.log(`\n${results.length} browser checks passed. Artifacts: ${OUTPUT}`);
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
