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
| JS heap over 16 environment switches | 38 → 38 MB | 43 → 43 MB, and 58 → 58 MB in the final run (no growth) |
| Route initial JavaScript (gzipped) | 309 KB | ≈ 323 KB; three.js still loads only with the laboratory |
| Browser checks | 11 pass | 12 pass |
| `load` event | 0.15 s | 0.28 s |
| Frame rate, Performance tier | 60 fps | 60 fps |
| Frame rate, Auto (High) tier | 60 fps everywhere | **60 fps everywhere** in the final e2e run (overview, field, road, road field, full screen) — see the re-measurement below. A first run under heavy macOS background load (load average 7–9) read 18–52 fps and is superseded. |

### Re-measured on a quieter machine (later the same day)

With the background scans finished (load average 2.5–4.5), the production build was measured view by view, twice in a row, after three further optimisations (below):

| View (1440 × 900, Auto → High tier) | fps | p95 frame |
|---|---|---|
| Station overview (warm) | 60 | 17–19 ms |
| Station overview, full screen | 60 | 17–19 ms |
| Magnetic field stage | 60 | 17–20 ms |
| Energy stage | 60 | 17–19 ms |
| Road, driving | 60 | 18 ms |
| Road, charging in motion | 60 | 18 ms |
| Road, magnetic field (and in full screen) | 60 | 18 ms |
| Performance tier | 60 | 18 ms |

The first seconds after the laboratory loads read 56–59 fps while shaders compile. **The 60 fps target is met.**

### What closed the gap

| Finding (A/B toggles on the overview) | Fix |
|---|---|
| Foliage shadows cost ≈ 20 % of the frame: alpha-tested leaf cards defeat early depth rejection in the 2048² shadow pass | Each tree casts its shadow from a low-poly stand-in (crown ellipsoid and trunk) on a layer only the sun's shadow camera renders; leaf cards cast none. Soft tree shadows remain |
| Distant leaf cards still cost colour-pass fill | A far level of detail: half the leaf clusters with proportionally larger cards for trees beyond the shelter and along the road |
| Entering an inspection view recompiled every material (the studio lights were toggled on and off, changing the light count) | The studio lights stay in the scene at zero intensity outside the studio; programs no longer change between views |

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

## Smart Parking (Environment 01, 27 Nov 2026)

Production build (`next build` + `next start`), Apple M1, Chromium through Metal, 1440 × 900, Google Analytics blocked, `npm run test:wireless-ev-twin:e2e`. The suite has 18 checks, 6 of them for Smart Parking; all pass.

| Measure | Result |
|---|---|
| Frame rate, Smart Parking (12 bays, tour vehicle and background traffic) | **60 fps** |
| Frame rate, 48-bay facility restarted in the same context (the interface maximum) | **50–58 fps** on Auto, High and Balanced; **60 fps** on Performance. See the note below |
| Frame rate, Station, road, field, full screen and Performance tier (regression) | 60 fps each |
| WebGL contexts | 1 (environment 01 shares the canvas) |
| JS heap over the whole suite, including the environment switches and the 48-bay restart | 87 → 87 MB and 65 → 65 MB in two runs (no growth) |
| Scene ready after navigation | 1.45–1.46 s |
| `load` event | 0.18–0.32 s |
| 3D share of the viewport | 77 % (83 % in full screen), unchanged |
| Unattended 18-stage tour (development server, 1440 × 900) | Completed in ≈ 199 s with 0 console errors |

**The 48-bay facility does not hold 60 fps on the M1 at the default quality.** One suite run read 60 fps. The final run, after the stage 11, 12 and 17 camera change, read 54. A dedicated re-measurement on the production build read:

- 12 bays: 60 / 60 fps;
- 48 bays in Engineer mode: 58 / 55 / 56 fps;
- 48 bays in Explore: 52 / 54 fps;
- 48 bays, High tier: 50 / 51 fps;
- 48 bays, Balanced tier: 53 / 52 fps;
- 48 bays, Performance tier: 60 / 60 fps.

The load is on the GPU: the tier changes only pixels, shadows and post-processing. The likely cost is the 22 pooled vehicle models and the four-times-longer canopy in one view. It has not been profiled. The default 12-bay facility holds 60 fps.

The Smart Parking scene is part of the lazily loaded 3D bundle, so it does not enter the route's first load. Two chunks that contain parking scene code measured 59 KB and 66 KB gzipped. They also contain shared twin code, so the parking share alone was not isolated, and the route's initial JavaScript was not re-measured in this phase.

### Engine cost (headless, Node, same machine)

| Facility | Live vehicles | Chargers | Simulation cost per simulated second | Per 0.1 s facility step |
|---|---|---|---|---|
| 12 bays | 6 | 4 | 0.34 ms | 34 µs |
| 50 bays | 20 | 17 | 0.64 ms | 64 µs |
| 100 bays | 44 | 33 | 1.04 ms | 104 µs |

Each charger's Station ran at its 0.25 s step, the step used above 5× speed. At 60× the 12-bay facility therefore costs about 20 ms of CPU per second of wall time, and the runtime caps facility stepping at 12 ms per frame.

### Cost controls

| Addition | Control |
|---|---|
| Vehicles | A pool of 22 vehicles drawn with the shared vehicle model; the tour's focus vehicle always takes slot 0, the detailed model with its receiver pad. Vehicles beyond the pool are drawn as instanced low-detail bodies (one draw call, up to 600). The level of detail never changes a result |
| Shelter, bays, markings, landscape | Merged geometries per material; canvas textures drawn once at start-up from deterministic noise |
| Labels | DOM labels projected from anchors and sampled a few times a second; hidden below 720 px, where the bottom-sheet inspector carries the same information |
| Chargers | Idle chargers are not stepped. The site power allowance is quantised to 500 W, so the Station does not re-solve its operating point every step |
| Overlays | Routes, occupancy plates, IoT and energy flows are drawn only in their views |
| Clock | Fixed 0.1 s facility step with a 12 ms per-frame budget. If stepping falls more than 2 s behind, the backlog is dropped, so simulated time runs slower but no step is skipped or lengthened |

Not measured for Smart Parking: WebKit and Firefox, phones beyond the 390 px layout audit, and lower-powered GPUs.
