# Satellite Energy Academy — implementation and review

Content version: 1. Model version: 1. Review record: 16 November 2026.

Status: **educational preview; independent scientific review pending**. Automated verification is not scientific validation. This implementation has not been compared with measured panel data or reviewed by an independent subject-matter expert.

## Repository audit and implementation plan

- `/space` renders `SpaceLanding` and the shared `TutorialShowcase`. Insert one existing-style row after CubeTwin and before Space Station; retain the other rows.
- Reuse `spaceTheme.module.css`, Manrope/Inter from `space/fonts.ts`, `SpaceHeader`, `SpaceFooter`, and the existing showcase card/3D viewer. Scope new styles to the academy CSS module.
- Reuse the lazy, device-aware `ShowcaseVisual` EPS scene for the illustrative hero. Its no-WebGL fallback is an accessible SVG. The experiment itself uses SVG and native controls so it does not depend on WebGL.
- CubeTwin's incidence expression is embedded in an orbital/battery integrator with additional losses. Leave that implementation untouched; create an isolated, explicitly bounded educational solar model with its own conservation tests.
- Add a server-rendered App Router page, lesson client boundary, native metadata/social-image route and sitemap entry. Existing host rewrites match explicit routes, so the new shared path works without routing changes.
- Deliver one complete mission and six learning-world previews. Other missions and the remaining topics in World 1 are planned, not playable. No simulation of batteries, orbits or calculus is claimed in this release.

## Architecture and extension

`src/lib/satellite-energy-academy/content.ts` holds the versioned lesson contract: prerequisites, objectives, explanations, definitions/units, experiment controls, observations, questions, hints, challenge/verification rules, misconceptions, completion criteria and review status. `LessonEngine` provides optional discovery, experiment selection, free mode, reflection, achievements and an advanced challenge. The experiment registry maps a typed kind to a component; new model kinds should add their own typed contract and checks.

`solar.ts` is deterministic and has no dependency on the existing simulation engines. All lab outputs derive from one input object. SVG drawing coordinates are rounded to 0.001 pixels to avoid insignificant Node/browser cosine differences causing hydration mismatches; calculations retain full precision.

Progress uses the versioned `satellite-energy-academy:progress:v1` localStorage key. Only completion and achievement state are saved; controls reset on reload. Invalid records and outdated lesson versions do not unlock challenges. If storage is blocked, the lesson remains playable with progress for the current visit. Free mode does not score or save completion.

## Scientific contract

- `G` is uniform **direct beam irradiance perpendicular to the rays**, in W/m²; it is not irradiance already projected onto the panel.
- `A` is active cell area in m²; efficiency is converted from percent to a dimensionless fraction once.
- `θ` is the angle from the panel's outward front normal to the direction toward the Sun. The UI covers 0–90°. The model accepts 0–180° and returns zero on the back face.
- `P = G A η max(0, cos θ)`. Exactly 90° returns exactly zero, avoiding floating-point residuals.
- Contract bounds: angle 0–180°, irradiance 0–1,400 W/m², area 0–2 m², efficiency 0–100%. The narrower teaching controls cap efficiency at 40%; 100% is a verification boundary, not a claimed practical panel.
- `P_intercepted = G A max(0, cos θ)`. Electrical output plus unconverted power equals intercepted power. “Unconverted” includes heat, reflection and transmission; it is not all claimed to be heat.
- Constant-power energy: joules = watts × seconds; watt-hours = joules / 3,600. The one-minute value is a hypothetical steady calculation, not a time-evolving battery.
- No atmosphere, albedo, temperature dependence, ageing, shading, power electronics, wiring losses or orbital motion. No measured or calibrated data.
- The SVG depicts an edge section and the front normal, with geometry set by the same angle as the power equation. Panel length varies illustratively with area, not to a physical scale. The hero spacecraft and manual angle sweep are illustrations, not measured motion.
- Mission load: fictional 80 W satellite (20 W computer + 30 W radio + 30 W instruments). Advanced mode additionally limits area to 0.4 m², efficiency to 25%, and irradiance to 1,000 W/m². Multiple solutions exist, e.g. 0°, 0.4 m², 20%, 1,000 W/m² or 0°, 0.4 m², 25%, 800 W/m².

## Scientific review checklist

Implementation checks completed:

- [x] Define power as an energy-transfer rate; distinguish W, J and Wh.
- [x] Define angle from the normal, degrees-to-radians conversion, irradiance reference plane, efficiency fraction and one-sided panel behavior.
- [x] Recalculate the 60° example: 1,000 × 0.50 × 0.20 × 0.5 = 50 W; one minute = 3,000 J = 0.833… Wh.
- [x] Verify 0°, 45°, 60°, 90° and backside results; darkness, zero area/efficiency, non-finite and out-of-range inputs.
- [x] Test bounds, monotonicity, deterministic results, linear scaling and conservation over a parameter grid.
- [x] Match the diagram, graph, equations and numerical displays to the model inputs.
- [x] Check that completion needs both an adequate unrounded power result and a correct conceptual reflection; retry is penalty-free.
- [x] Teach intuition before optional symbols, define prerequisites and address common misconceptions.
- [x] Label assumptions, calculated/illustrative content and review status in the lesson.
- [ ] Independent physics/education reviewer sign-off on scientific definitions, readability, assumptions and learning objectives.
- [ ] Learner study with beginners, including assistive-technology users.
- [ ] Empirical comparison with measured panel data before any physical-validation claim.

Primary references consulted:

- [NASA POWER — tilted surfaces and solar incidence](https://power.larc.nasa.gov/docs/methodology/data/derived/tilted-surfaces/). Uses geometric incidence projection; its full terrestrial diffuse/reflected-light model is outside this lesson's direct-beam approximation.
- [U.S. Department of Energy — photovoltaic performance and efficiency](https://www.energy.gov/cmei/systems/solar-photovoltaic-performance-and-efficiency-basics). Supports the incident-solar-energy to useful-electricity definition and the discussion of conversion losses.

## Reproduce verification

```sh
npx vitest run src/lib/satellite-energy-academy src/app/space/satellite-energy-academy src/app/space/page.test.tsx src/app/space/stellrspace-routing.test.ts src/lib/cubetwin
npx tsc --noEmit --incremental false
npm test
npm run build
# In a separate terminal, use dev or production preview:
npm run dev -- --hostname 127.0.0.1 --port 3107
node scripts/test-satellite-energy-academy.cjs
```

The browser script checks metadata, six world previews, keyboard controls, matching graph/readout, hints, reflection, achievements across reloads, free mode, play/pause/reset, 390px/320px layouts, reduced motion, no-WebGL fallback, exact tutorial placement and route availability on the existing supported hosts. Screenshots go to `/private/tmp/satellite-energy-academy-qa` by default. Override `ENERGY_ACADEMY_BASE_URL` to test a production preview. No new packages, global CSS changes or deployment are required.

## Verification results — 16 November 2026

- Production build: passed, including TypeScript, the new static academy route and social image.
- Focused model, lesson, persistence, Space integration/routing and CubeTwin regression suite: **127/127 passed**.
- Playwright acceptance: all six groups passed against both development and production servers. No browser runtime or hydration errors in the final run. Desktop 1440px and mobile 390px/320px screenshots inspected; no horizontal overflow. WebGL hero turn control and no-WebGL fallback exercised.
- Full suite: 2,348 passed, 3 failed out of 2,351. Two battery-toolkit tests timed out while the production build ran; both test files passed on an isolated single-worker rerun (43 tests).
- One unrelated existing failure remains in `src/components/satellite-explorer/ui/ui.test.tsx:234`: the test requires `data-track-event="exploded_view_open"`, while the unchanged `modes/ExploreMode.tsx` intentionally emits that event through its click handler. The same implementation is present in HEAD. Its test file rerun had 38 passing tests and that one failure. No Satellite Explorer code or tests were changed.
- Existing full-suite jsdom canvas/navigation warnings, Three.js deprecation warnings and build workspace-root warnings remain outside this change.
