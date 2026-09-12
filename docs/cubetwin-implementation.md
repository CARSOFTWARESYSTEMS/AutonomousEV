# CubeTwin implementation and review

Completed locally on 12 September 2026. Preview: http://localhost:3100/space/cubesat. The route remains `/space/cubesat`; production deployment has not been performed.

CubeTwin now shares the original Space Manrope/Inter font configuration, navigation, footer, theme tokens, section spacing, buttons and lab-card appearance. The original Space page retains its existing appearance and gains the requested Simulations & R&D Projects card. The revised hero, beginner content, mobile layout and ownership statements follow the supplied UI review.

The portal includes a working energy simulator, editable mission schedule, recorded playback, power/SOC charts and complete tabular history, eleven fault experiments, seeded Monte Carlo analysis, JSON/CSV exports and validated scenario import. Learning tools include twelve weeks of checklists, eight workbook exercises, local notes, a searchable 97-term glossary, FAQs, references and printable content.

## Files

Paths below are relative to the repository root and cover the complete portal, including the implementation preceding the theme review.

| Group | Files |
| --- | --- |
| Shared Space design and integration | `src/app/space/fonts.ts`, `spaceTheme.module.css`, `components/SpaceHeader.tsx`, `components/SpaceFooter.tsx`, `page.tsx` |
| Portal | `src/app/space/cubesat/page.tsx`, `cubetwin.module.css`, `components/LazySimulator.tsx`, `components/Simulator.tsx`, `components/SimulationProvider.tsx`, `components/FaultLab.tsx`, `components/HeroScene.tsx`, `components/OrbitVisual.tsx`, `components/LearningTools.tsx` |
| Model and exports | `src/lib/cubetwin/scenario.ts`, `engine.ts`, `simulation.worker.ts`, `export.ts`, `download.ts` |
| Learning content | `src/lib/cubetwin/content.ts`, `learning.json` |
| SEO | `src/app/space/cubesat/seo.ts`, `opengraph-image.tsx`, `icon.svg`, `src/app/sitemap.ts`, `public/llms.txt` |
| Verification | `src/lib/cubetwin/engine.test.ts`, `src/app/space/cubesat/seo.test.tsx`, `src/app/space/page.test.tsx`, `src/lib/llms-txt.test.ts`, `scripts/test-cubetwin.cjs`, `package.json`, `package-lock.json` |

## Model and assumptions

- Circular two-body orbital period: `T = 2π√((R + h)³ / μ)`, with Earth radius 6371 km and gravitational parameter 398600.4418 km³/s². Eclipse is a user-specified repeated interval; this is not an ephemeris or lighting solver.
- Solar output uses either a peak-power setting or area × irradiance × efficiency × incidence × conversion efficiency. Output is zero during eclipse. Loads depend on mission mode and scheduled activities.
- Battery energy integrates power over hours. Charging multiplies surplus power by charge efficiency; discharge divides deficit by discharge efficiency. Capacity limits, rejected energy, unmet loads, conversion losses and fault-related capacity removal have explicit accounting. Energy conservation is tested.
- State of Charge is stored energy / effective capacity. Voltage uses a piecewise open-circuit-voltage curve and a diagnostic resistance drop. Lumped thermal behavior includes resistive heating and exchange with a configured environment; electrical and thermal approximations are disclosed beside the simulator.
- Safe mode uses separate entry/recovery thresholds, hysteresis and dwell time. Mission events record completed, deferred or failed activities. Integration splits at activity, eclipse and fault boundaries.
- Eleven configurable faults cover solar degradation, panel loss, extended eclipse, payload overrun, load spike, capacity fade, resistance rise, heater stuck on, SOC bias, telemetry dropout and charge loss. True state, sensor readings and detector status are separate. The SOC-bias detector is explicitly truth-assisted.
- Monte Carlo uses a reproducible seed and independent bounded uniform parameter variations. It reports mission completion and a 95% Wilson interval. Trial count is limited to 100; scenario steps, file size and schedule sizes are bounded.
- Default example: 3U, 500 km altitude, 24 h mission, 10 s step, 35 min eclipse, 20 W peak solar, 40 Wh battery, 80% initial SOC and 8 W baseline spacecraft load. Defaults are educational assumptions, not flight specifications.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 45 test files; 376 tests passed |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Production build passed, including CubeTwin, social image and icon routes |
| Scoped ESLint command below | Zero errors; one existing Space `<img>` warning |
| `npm run lint -- --format json` | Repository-wide lint remains blocked by 351 unrelated errors and 66 warnings after fixing the browser runner's four import errors; no CubeTwin errors remain |
| `npm run test:cubetwin:e2e` | 15 browser acceptance checks passed |
| Accessibility | Desktop and mobile axe scans: zero WCAG 2 A/AA and 2.1 AA violations; Lighthouse accessibility 100 |
| Responsive checks | 360×800, 390×844, 412×915, 768×1024 and desktop; no page-level horizontal overflow |
| Interaction | Keyboard tabs, input errors, worker runs, fault controls, Monte Carlo, replay, downloads/import, glossary and persistent learning state passed |
| Rendering | No uncaught browser errors or hydration errors in acceptance checks; final Lighthouse browser-console audit passed |
| Reduced motion and graphics | Reduced-motion and forced no-WebGL checks passed; desktop WebGL visual reads the recorded model state; mobile uses the lighter synchronized static diagram |
| Print | 35-page A4 workbook exported and representative pages visually inspected; all twelve weeks and 97 glossary terms are available, with white print backgrounds |
| Space regression | Before/after screenshots plus computed-style comparison verify matching fonts, header, navigation, footer and original spacing |

Scoped lint command:

```sh
npx eslint src/app/space/components src/app/space/fonts.ts src/app/space/cubesat src/lib/cubetwin scripts/test-cubetwin.cjs src/app/space/page.tsx src/app/space/page.test.tsx src/app/sitemap.ts src/lib/llms-txt.test.ts
```

The browser suite expects a production server on port 3100 (`npm run start -- --port 3100`). `CUBETWIN_BASE_URL` and `CUBETWIN_QA_DIR` override its target and artifact directory. Playwright's Chromium must be installed. Accessibility checks use the axe script configured in the suite.

## Performance and discovery

Lighthouse 13.4.1 against the local production build, headless Chrome 152 on macOS, simulated mobile 412×823, 4× CPU slowdown and default mobile network throttling:

| Metric | Result |
| --- | --- |
| Performance | 94 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 1.1 s |
| Largest contentful paint | 2.9 s |
| Total blocking time | 70 ms |
| Cumulative layout shift | 0 |

Command:

```sh
npm exec --yes --package=lighthouse -- lighthouse http://127.0.0.1:3100/space/cubesat --chrome-flags='--headless --no-sandbox' --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/private/tmp/cubetwin-qa/lighthouse-optimized.json --quiet
```

Simulator controls and noncritical graphics are lazy-loaded; education content is server-rendered. Avoiding mobile WebGL initialization reduced measured blocking time from 700 ms to 70 ms. These are local lab measurements, not production field metrics.

The canonical URL is `https://aerospace.ev.engineer/space/cubesat`. Unique metadata, a generated Open Graph image, visible breadcrumbs/FAQ, and a JSON-LD graph describe WebPage, LearningResource, SoftwareApplication, BreadcrumbList, FAQPage and the appropriate organization relationships. Application status is v0.01; scenario/export schema version is separately 1.0. The sitemap and Space card link to the route. Existing robots policy already allows OAI-SearchBot and was preserved, including the separate training-crawler policy. `llms.txt` supplements the standard discovery mechanisms.

## Screenshots and evidence

| View | Before | After |
| --- | --- | --- |
| CubeTwin desktop | [Before](cubetwin-review/before-desktop.png) | [After](cubetwin-review/desktop.png) |
| CubeTwin mobile | [Before](cubetwin-review/before-mobile.png) | [After](cubetwin-review/mobile-390.png) |
| Space desktop | [Before](cubetwin-review/space-before-desktop.png) | [After](cubetwin-review/space-after-desktop.png) |
| Space mobile | [Before](cubetwin-review/space-before-mobile.png) | [After](cubetwin-review/space-after-mobile.png) |
| Space footer | [Before](cubetwin-review/space-before-footer.png) | [After](cubetwin-review/space-after-footer.png) |

The isolated Space baseline uses development mode and includes its development indicator; comparison excludes that tooling overlay. Additional artifacts: [simulator](cubetwin-review/simulator.png), [mobile simulator](cubetwin-review/simulator-390.png), [360 px](cubetwin-review/mobile-360.png), [412 px](cubetwin-review/mobile-412.png), [768 px](cubetwin-review/mobile-768.png), [printable workbook](cubetwin-review/cubetwin-workbook.pdf), [computed theme comparison](cubetwin-review/theme-comparison.json), [browser results](cubetwin-review/results.json), [accessibility scan](cubetwin-review/accessibility.json), [Lighthouse report](cubetwin-review/lighthouse-optimized.json).

## Remaining limits and production handoff

- This is an educational R&D prototype using simulated data, not flight software or a validated operational twin. Battery calibration, ephemeris lighting, hardware-in-the-loop and measured flight telemetry remain future work. The Earth texture is illustrative.
- Automated accessibility tests and keyboard checks are useful evidence, not full WCAG 2.2 certification; screen-reader testing with representative users remains valuable.
- Workbook notes and checklists are browser-local; storage failures fall back to memory. There is no account, backend synchronization or live telemetry. The site's existing general analytics integration is unchanged; CubeTwin does not upload scenario or workbook data.
- Unrelated repository-wide lint failures remain. The production build also retains the existing warning about multiple lockfiles and inferred workspace root.
- The owner can deploy through the repository's existing production workflow. After deployment, verify the aerospace host serves this route with its intended canonical, robots, sitemap and social image; check production performance and submit the sitemap through existing Google/Bing site accounts if desired. Indexing and ranking are not guaranteed. No production deployment or external submission was made.
