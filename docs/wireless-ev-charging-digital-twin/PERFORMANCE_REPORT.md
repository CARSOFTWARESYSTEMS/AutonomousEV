# Performance report

Measured 25 Nov 2026 on an Apple M1, Chromium through Metal (real GPU; renderer `ANGLE (Apple, ANGLE Metal Renderer: Apple M1)`), against a local production build (`next build` + `next start`), Google Analytics blocked. Script: `npm run test:wireless-ev-twin:e2e` (`scripts/test-wireless-ev-twin.cjs`), which writes `measurements.json`.

## Results

| Measure | Before (dev server, Phase 0) | After (production build) |
|---|---|---|
| 3D scene share of a 1440 × 900 viewport | 42 % | **79 %** |
| … in full screen | 42 % (layout unchanged) | **85 %** |
| Frame rate, station overview | 60 fps | 60 fps |
| Frame rate, magnetic-field stage | — | 60 fps |
| Frame rate, full screen | — | 60 fps |
| Frame rate, Performance quality | — | 60 fps |
| Frame rate, dynamic road (segment view) | 60 fps (old road) | 60 fps |
| WebGL contexts | 1 | 1 |
| JS heap after 16 environment switches | 58 MB after a tour | 38 MB → 38 MB (no growth) |
| Scene ready after navigation (first rendered frames) | ≈ 4.5–5.4 s (dev, incl. compilation) | **1.2 s** |
| `load` event | 0.34–1.18 s (dev) | 0.15 s |
| Initial JavaScript for the route (gzipped) | not measured separately | **309 KB** (565 KB before moving three.js out of the first load; +4 KB for the road legend and metrics) |
| 3D bundle (gzipped, loaded on mount) | — | ≈ 233 KB plus small chunks |

Dev-server and production numbers are not directly comparable for load times; the frame-rate and viewport-share comparisons are like for like.

## What was done

- **Three.js out of the first load.** Interface code imports only three-free modules; the 3D bundle arrives as a dynamic chunk (`next/dynamic`, `ssr: false`).
- **Render only while visible.** The canvas's frame loop stops when the laboratory leaves the viewport; the simulation clock continues.
- **Adaptive pixel ratio** under Auto quality (drei `PerformanceMonitor`), within the tier's ceiling.
- **Quality tiers** (Auto, High, Balanced, Performance) change pixel ratio, shadow-map size and post-processing only.
- **Shared geometry and materials**: one body, tyre, rim, brake and chassis geometry for every vehicle in the scene; merged geometries for the site structure, cabinet internals, skyline and chassis parts; instanced PV modules and roadside cabinets.
- **Shadow camera follows the active environment** (12 m box at the station), so a 2048² map resolves the car instead of being spread over the district.
- **Field basis** is computed once per geometry change, off the frame; each frame only scales it by the present currents.
- **Disposal**: every component that creates geometry, materials or textures disposes them on unmount; the highlight disposes its tinted copies.

## Cross-browser

| Browser | Result |
|---|---|
| Chromium (Metal) | all 11 acceptance checks pass |
| WebKit 2359 (Playwright build, Safari engine) | canvas renders, WebGL2, no page errors, field stage correct (`screenshots/after/webkit-field.jpg`) |
| Firefox 1543 (Playwright build) | canvas renders, WebGL2, no page errors |
| Phone 390 × 844 (Chromium, touch) | no sideways scroll; scene renders; bottom-sheet inspector |

Real Safari on macOS and iOS hardware, and mid-range Android phones, were not tested in this session.

## Not measured

Lower-powered GPUs (the M1 sustains 60 fps on every tier, so the tiers' effect on a weaker device is unmeasured), long-session memory over hours, and Lighthouse scores for this route.

## Phase 3.5 (26 Nov 2026)

Production build (`next build` + `next start`), Apple M1, Chromium through Metal, 1440 × 900, Google Analytics blocked, `npm run test:wireless-ev-twin:e2e`.

| Measure | Phase 3 (`8b08b03`) | Phase 3.5 |
|---|---|---|
| WebGL contexts | 1 | 1 |
| 3D share of a 1440 × 900 viewport | 79 % | 77 % (the environment rail widened from 68 to 100 px so its labels fit) |
| … in full screen | 85 % | 83 % |
| JS heap over 16 environment switches | 38 → 38 MB | 43 → 43 MB (no growth) |
| Route initial JavaScript (gzipped) | 309 KB | ≈ 323 KB; three.js still loads only with the laboratory |
| Browser checks | 11 pass | 12 pass |
| `load` event | 0.15 s | 0.28 s |
| Frame rate, Performance tier | 60 fps | 60 fps |
| Frame rate, Auto (High) tier | 60 fps everywhere | **not comparable**: measured while macOS ran XProtect (≈ 95 % CPU), Spotlight indexing (≈ 75 %) and knowledge indexing (≈ 78 %), load average 7–9. Two runs gave 52 and 18 fps at the station overview, 38–41 on the road and 34–41 with the road field. |

An idle-machine re-measurement against the Phase 3 build under the same conditions is still owed before the frame-rate target can be called met or missed.

### What was added, and what was done about its cost

| Addition | Cost control |
|---|---|
| Trees and shrubs | Instanced (two variants per species), alpha-to-coverage rather than blending; only trees within 26 m of the shelter cast shadows; roadside trees cast none (they lie outside the shadow area) |
| Daylight sky with clouds | Drawn last against the depth buffer (only visible sky pixels are shaded); four-octave noise |
| City | Merged into two meshes per strip; static |
| Vehicle detail | Shared geometry for every car; shut lines in the paint shader, not geometry |
| Road field | Per-ampere basis built a few rows per frame; per-frame work is table lookups; lines retraced 4× a second; computed only while the field view is open |
| Charging in motion | A pool of eight glow quads, one column, three tubes |
| Flicker | Near/far planes follow the shot; adaptive resolution only steps down and locks after two flip-flops |

Quality tiers are unchanged in meaning: they change pixel ratio, shadows and post-processing only, never a computed value (tested).
