// Profiles the Smart Parking scene on a production build: frame times, WebGL draw calls and
// triangles per frame (counted by wrapping the context's draw functions), main-thread CPU per
// frame (Chrome DevTools Protocol), JS heap, and restart (scene load) time, for 6/12/24/48 bays
// and each quality tier. Build and start a production server on port 3100 first, then:
//   node scripts/profile-smart-parking.cjs <label>   (BAYS=12,48 TIERS=auto,balanced WINDOW=10000 OUT=dir optional)
const BASE = process.env.BASE || 'http://localhost:3100';
const LABEL = process.argv[2] || 'run';
const OUT = process.env.OUT || '/private/tmp/smart-parking-profile';
const BAYS = (process.env.BAYS || '6,12,24,48').split(',').map(Number);
const TIERS = (process.env.TIERS || 'auto,balanced,performance').split(',');
const WINDOW = Number(process.env.WINDOW || 10000);
(async () => {
  const [fs, { chromium }] = await Promise.all([import('node:fs'), import('playwright')]);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  await ctx.addInitScript(() => {
    const c = { calls: 0, verts: 0 };
    window.__draw = c;
    for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!C) continue;
      const p = C.prototype;
      const wrap = (name, n, inst) => {
        const f = p[name];
        if (!f) return;
        p[name] = function (...a) { c.calls++; c.verts += (a[n] || 0) * (inst === undefined ? 1 : a[inst] || 1); return f.apply(this, a); };
      };
      wrap('drawElements', 1); wrap('drawArrays', 2); wrap('drawElementsInstanced', 1, 4); wrap('drawArraysInstanced', 2, 3); wrap('drawRangeElements', 3);
    }
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const gpuInfo = await (async () => { await page.goto('about:blank'); return page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g.getExtension('WEBGL_debug_renderer_info'); return { renderer: d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown', timerQuery: !!g.getExtension('EXT_disjoint_timer_query_webgl2') }; }); })();
  const t0 = Date.now();
  await page.goto(`${BASE}/internships/wireless-ev-charging-digital-twin?fs=0&sound=0&narration=0&captions=0&demo=0&env=parking#research-laboratory`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('[class*=stageCard] [class*=eyebrow]')?.textContent.includes('Smart Parking'));
  await page.waitForFunction(() => document.querySelector('[class*=viewport][data-ready]'), null, { timeout: 120000 });
  const firstLoad = Date.now() - t0;
  const measure = async (ms) => {
    const m0 = await metrics();
    const r = await page.evaluate((ms) => new Promise((resolve) => {
      const d = window.__draw; const c0 = d.calls, v0 = d.verts;
      const times = []; let last = performance.now(); const start = last;
      const tick = (now) => { times.push(now - last); last = now; if (now - start < ms) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); const q = (p) => times[Math.min(times.length - 1, Math.floor(p * times.length))]; resolve({ frames: times.length, seconds: (now - start) / 1000, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: times[times.length - 1], calls: (d.calls - c0) / times.length, tris: (d.verts - v0) / 3 / times.length, heap: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null }); } };
      requestAnimationFrame(tick);
    }), ms);
    const m1 = await metrics();
    const f = r.frames;
    return { fps: +(f / r.seconds).toFixed(1), p50: +r.p50.toFixed(1), p95: +r.p95.toFixed(1), p99: +r.p99.toFixed(1), max: +r.max.toFixed(1), drawCalls: Math.round(r.calls), trianglesK: Math.round(r.tris / 1000), mainThreadMsPerFrame: +(((m1.TaskDuration - m0.TaskDuration) * 1000) / f).toFixed(2), scriptMsPerFrame: +(((m1.ScriptDuration - m0.ScriptDuration) * 1000) / f).toFixed(2), layoutStyleMsPerFrame: +((((m1.LayoutDuration - m0.LayoutDuration) + (m1.RecalcStyleDuration - m0.RecalcStyleDuration)) * 1000) / f).toFixed(2), heapMb: Math.round(m1.JSHeapUsedSize / 1048576) };
  };
  const setBays = async (n) => {
    await page.getByRole('radiogroup', { name: 'Experience mode' }).getByRole('radio', { name: 'Engineer' }).click();
    await page.waitForTimeout(600);
    if (!(await page.locator('[role=region][aria-label=Inputs]').count())) await page.getByRole('button', { name: 'Inputs' }).first().click();
    await page.getByLabel('Bays', { exact: true }).evaluate((el, n) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, String(n)); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, n);
    const t = Date.now();
    await page.getByRole('button', { name: 'Restart with these' }).click();
    await page.waitForFunction((n) => [...document.querySelectorAll('[aria-label=Instruments] *')].some((e) => e.textContent.trim() === `of ${n}`), n, { timeout: 60000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const restart = Date.now() - t;
    await page.getByRole('radiogroup', { name: 'Experience mode' }).getByRole('radio', { name: 'Explore' }).click();
    await page.locator("ol[aria-label='Engineering stages'] li button").nth(0).click();
    return restart;
  };
  const rows = [];
  for (const bays of BAYS) {
    const restartMs = await setBays(bays);
    for (const tier of TIERS) {
      await page.getByRole('combobox', { name: 'Rendering quality' }).selectOption(tier);
      await page.waitForTimeout(5000);
      const m = await measure(WINDOW);
      rows.push({ bays, tier, restartMs, ...m });
      console.log(JSON.stringify(rows[rows.length - 1]));
    }
    await page.getByRole('combobox', { name: 'Rendering quality' }).selectOption('auto');
    await page.screenshot({ path: `${OUT}/${LABEL}-${bays}.png` });
  }
  const meta = { label: LABEL, when: new Date().toISOString(), browser: browser.version(), gpu: gpuInfo, viewport: '1440x900', dpr: 1, window_s: WINDOW / 1000, warmup_s: 5, firstLoadMs: firstLoad, drawCallCounting: 'WebGL draw functions wrapped by an init script' };
  fs.writeFileSync(`${OUT}/${LABEL}.json`, JSON.stringify({ meta, rows }, null, 1));
  console.log(JSON.stringify(meta));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
