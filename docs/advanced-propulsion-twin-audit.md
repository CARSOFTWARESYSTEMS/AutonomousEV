# Advanced Rocket Propulsion Digital Twin: engineering audit, issue register

Page: `/space/rocket-engine-digital-twin-advanced` (production: https://aerospace.ev.engineer/space/rocket-engine-digital-twin-advanced).
Reference page: `/space/rocket-engine-digital-twin`. Parent: `/space`.
Audit dates: 11–12 October 2026. Baseline: `main` = `origin/main` = `8c47939`, which is what production was serving.

This file records every defect the audit found: how to reproduce it, what should happen, what did happen, why, what was changed, and the test that now guards it. The results of running those tests, the measurements and the release recommendation are in [advanced-propulsion-twin-audit-report.md](advanced-propulsion-twin-audit-report.md). Screenshots and machine-readable results are in [advanced-propulsion-twin-review/](advanced-propulsion-twin-review/).

Nothing here has been committed, pushed or deployed.

## How the audit was done

1. **Baseline.** Git state recorded; full unit suite run on the baseline commit; the live page fetched and compared with the local build of the same commit.
2. **Reproduction.** Every defect was reproduced on the production page or on the baseline commit before any code was changed. Browser defects were reproduced with `scripts/test-advanced-propulsion-twin.cjs` (Playwright, Chromium) and with one-off probes; model defects with numerical probes run against the simulation in `src/components/propulsion-twin-advanced/simulation/`.
3. **Triage.** Severity as below.
4. **Fix.** One root cause at a time, each with a regression test that fails on the old code.
5. **Verify.** Unit suite, browser audit at fifteen viewports, WebKit and Firefox passes, the fundamentals page's own browser tests, lint, type-check, production build.

### Severity

| Level | Meaning | Count | Fixed |
| --- | --- | --- | --- |
| P0 | Data loss, security exposure, or the page unusable on load | 0 | – |
| P1 | A core function fails, misleads the learner about the engineering, or is missing on a class of device | 7 | 7 |
| P2 | A function is wrong or degraded in some conditions, or an accessibility or honesty failure | 15 | 15 |
| P3 | Polish, or a requirement of the brief met only in part | 7 | 7 |

Twenty-nine defects in this page, all fixed. One further test failure in the repository is unrelated to this page and predates it: see [Pre-existing, unrelated](#pre-existing-unrelated). Work that was considered and not done is listed in the report under "Known failures and deferred work".

### Commands

```
npm test                                   # unit and component tests (vitest)
npx next build && npx next start -p 3100   # production build, served locally
npm run test:advanced-propulsion-twin:e2e  # browser audit of this page, 159 checks
npm run test:rocket-engine-twin:e2e        # the fundamentals page's own browser tests
```

Test files named below, all under `src/components/propulsion-twin-advanced/`:

- `simulation/verification.test.ts`: model, detectors, fault envelope ("V").
- `AdvancedTwinPage.audit.test.tsx`: components and interaction ("A").
- `scripts/test-advanced-propulsion-twin.cjs`: the browser audit ("E"), with its section in brackets.

---

## P1

### APT-01 · A live instrument that fails to download takes the whole page with it

- **Area:** reliability.
- **Reproduce (production, baseline):** open the page, let it finish loading, then block requests to `/_next/static/chunks/` (DevTools → Network → block URL, or go offline) and open the Lab module.
- **Expected:** the instrument that could not be fetched says so. The text of the Lab, the navigation and the other eleven modules stay usable.
- **Actual:** the entire page is replaced by the framework's error screen: "This page couldn't load. Reload to try again, or go back." Page error: `Failed to load chunk /_next/static/chunks/0yf~2fgamus9w.js from module 670`. The module bar and the H1's surroundings are gone. Screenshot: `advanced-propulsion-twin-review/before/desktop-1280-instrument-load-failure.png`.
- **Root cause:** two, independent. (a) The eleven lazily loaded instruments and the 3D view had no error boundary, so a rejected import propagated to the route's boundary. (b) `boot()` in `state/labStore.ts` awaited the simulation import with no failure path: a rejection left `booting` true and every instrument on "Calibrating…" for ever.
- **Fix:** `ui/Boundary.tsx`, an error boundary that renders a plain statement, a reload button and the instrument's written description, wrapped around every `LiveSlot` instrument and the 3D view. `boot()` catches a failed import or a twin that cannot be built and sets `bootFailed`; `TwinPending` (in `live/shared.tsx`) shows it with a "Try again" button. Neither message shows the error text, which names build files.
- **Acceptance:** with chunk downloads blocked, opening the Lab leaves the module bar, the H1 and the Lab's text in place, shows an alert, exposes no file name, and other modules still open.
- **Verified by:** E[controls] "A live instrument that cannot be downloaded fails alone…"; A "fails where it is, says so without build details…", "reports a simulation that could not be fetched, and starts it when asked again". After: `advanced-propulsion-twin-review/after/desktop-1280-instrument-load-failure.png`.
- **Status:** fixed.

### APT-02 · Switching from one fault to another leaves the first one active and credits its evidence to the second

- **Area:** simulation controls, fault diagnosis.
- **Reproduce (production):** Lab → inject "Main fuel valve restriction" → wait for the diagnosis → choose "Chamber pressure sensor A drift" → Inject fault.
- **Expected:** one active fault; the diagnosis, the detector latencies and the fault history describe the new scenario only.
- **Actual:** both faults are listed as active. Two steps after the switch the twin still reports an anomaly and "Main fuel valve restriction"; the detector latencies for the "new" fault are 0.05 s (they are the old fault's alarms, still latched); and the history has no new "detected" entry. Event sequence observed: `injected, detected, isolated, cleared, injected, data`.
- **Root cause:** `inject` in the store added to the engine's fault map. Even where a caller cleared first (`InjectFault`), the residuals, CUSUM sums and detector states of the previous fault were carried over, and `firstFaultAt` was reset to the moment of the new injection, so every still-active detector was stamped with a latency measured from the wrong event.
- **Fix:** `TwinCore.scenario(id, severity, onset)`: if the twin is not at its healthy baseline (a fault active, an anomaly declared, a cause isolated, data suspect, or a non-nominal leader), the run restarts from the settled healthy engine at the present throttle setting, then injects. The restart is seeded, so a scenario gives the same run whatever came before it. A stopped engine is left stopped: the fault is swapped without a restart. The store's `inject` calls `scenario`; the fault picker says so. `engine.inject` remains for adding faults in tests.
- **Trade-off:** the charts lose their history when a scenario replaces another. The alternative, waiting for the previous fault's evidence to decay, would make detection times depend on what was run before.
- **Acceptance:** after a switch there is exactly one active fault, t = 0, no detector active or latched, a nominal leader; the new fault is then detected once, with latencies over one second; two different histories followed by the same scenario give identical snapshots.
- **Verified by:** V "replaces the active fault and restarts from the healthy baseline…", "gives the same run whatever came before it", "injects in place on a twin that is already at its healthy baseline…", "leaves a stopped engine stopped…"; A "replaces the active fault instead of adding to it…"; E[simulation] "Switching straight from one fault to another leaves no stale diagnosis…".
- **Status:** fixed.

### APT-03 · No pressure schematic on a phone or a portrait tablet

- **Area:** mobile. Required mobile behaviour 2 and 7; "do not simply hide broken desktop functionality".
- **Reproduce (production):** open `#pressure` at any width under 900 px.
- **Expected:** a readable, touch-friendly pressure schematic.
- **Actual:** none. The schematic's container carried `data-desktop-only` and was `display: none` below 900 px; a phone got the list of sensors only. Before: `before/phone-390-pressure-module.png`, `before/tablet-820-pressure-module.png`.
- **Root cause:** the one drawing (840 × 500 units) was unreadable when scaled to a phone, so it was hidden instead of redrawn.
- **Fix:** `ui/PropulsionSchematic.tsx` now has two arrangements of the same system: landscape (840 × 524) and portrait (360 × 590), chosen by the width of the box it is given (portrait below 528 px). Both are in the server's HTML and a CSS container query shows the one that fits, so the right drawing is there before any script runs and nothing shifts; after hydration only one is in the document. The portrait arrangement omits the preburner's own feed lines and the command lines to the main valves, and says so in a code comment and here. Markers are spaced so each has a 44 px touch target in a 320 px phone's column.
- **Acceptance:** at 320–430 px the Pressure module shows the portrait schematic with lettering of 11 px or more and 44 px sensor targets; tapping a sensor opens its detail as a sheet that takes focus and closes with its button or Escape; no layout shift.
- **Verified by:** E[controls] "PHONE: a pressure sensor can be chosen by touch on a readable schematic…"; E[responsive] targets and lettering at every phone width; A "is on every screen…", "spaces the markers so that each has a 44 px touch target…", "is in the server's HTML in both arrangements…". After: `after/phone-390-pressure-schematic.png`, `after/phone-320-pressure-schematic.png`, `after/tablet-820-pressure-schematic.png`.
- **Status:** fixed.

### APT-04 · Diagram and chart lettering too small to read, on every screen including desktop

- **Area:** responsive, legibility. Required mobile behaviour 3.
- **Reproduce (production):** measure rendered text height in the hero, System and Pressure schematics and in any Lab chart.
- **Expected:** legible axes, units, legends and labels.
- **Actual:** schematic labels rendered at 3.3–8.3 px at every viewport from 320 to 1920; chart axis lettering at 5–8.3 px. Before: `before/desktop-1440-hero-schematic.png`, `before/desktop-1440-lab-chamber-chart.png`, `before/phone-390-lab-chamber-chart.png`.
- **Root cause:** lettering was sized in drawing units (9–10.5 in an 840-unit drawing; 7.5 in a 320-unit chart) and scaled down with its SVG.
- **Fix:** the schematic measures its box and sizes lettering in screen pixels (11 px), within limits each arrangement has room for; sensor tags are written for the selected sensor and any sensor in alarm instead of all fifteen at once. `TraceChart` (`ui/charts.tsx`) is drawn at one unit per CSS pixel at the width it is shown, with 11 px axis lettering, drawn axes, "−30 s / now / +60 s" time labels, and the unit in its heading.
- **Acceptance:** all SVG lettering renders at 11 px or more (the audit's floor is 9 px) at all fifteen viewports; no label runs outside its drawing.
- **Verified by:** E[responsive] "diagram and chart text renders at 9px or more; body text at 11px or more" ×15; E[controls] "Charts: lettering is drawn at 11px…"; A "letters the drawing at 11 px or more on screen in a … px box" ×5, "has room for every label at the largest lettering…", "draws at one unit per pixel…". Also checked in WebKit and Firefox.
- **Status:** fixed.

### APT-05 · Selecting a pressure sensor on a desktop opens its detail off screen

- **Area:** interaction contract, propulsion explorer.
- **Reproduce (production, 1440 × 900):** Pressure → click any sensor on the schematic or in the list.
- **Expected:** the measurement detail is where the reader can see it.
- **Actual:** the detail panel is appended below the map at y = 1402 px, outside the viewport, with no scroll and no focus change. Nothing visible happens except the marker's ring.
- **Root cause:** the panel is the last row of the map's grid; nothing brought it into view or told assistive technology it had appeared.
- **Fix:** `choose()` in `widgets/PressureMap.tsx` moves focus to the panel and scrolls it into view (`block: "nearest"`, without animation under reduced motion). Escape closes it and returns focus to the control that opened it; the opener is taken from the click itself, because Safari does not focus a button on click. Tracing the pressure path does not steal focus.
- **Acceptance:** after a selection the panel is in the viewport and focused; Escape closes it and focus returns.
- **Verified by:** E[controls] "Pressure map: selecting a sensor shows its measurement detail where it can be seen…"; A "brings a chosen sensor's detail to the reader, and Escape closes it and returns focus"; WebKit and Firefox pass.
- **Status:** fixed.

### APT-06 · The schematic showed one shaft driving both pumps; the 3D model shows two turbopumps

- **Area:** physics and model consistency.
- **Reproduce (production):** compare the hero or System schematic (one turbine between the pumps, one shaft through both, alt text "turns both on one shaft") with the 3D engineering mode and the fundamentals page ("two turbopumps driven by a preburner").
- **Expected:** one architecture, shown the same way everywhere, with any modelling simplification stated.
- **Actual:** two contradictory pictures of the same reference system.
- **Root cause:** the schematic was drawn from the reduced-order model's single shaft-speed state, not from the reference architecture.
- **Fix:** both arrangements of the schematic now draw an oxidiser turbopump and a fuel turbopump, each a pump and a turbine on its own shaft, with one preburner supplying hot gas to both turbines and the exhaust going on to the injector. The alt text says the same. `SHAFT_NOTE` is shown under the System and Pressure schematics: "The drawing shows two turbopumps, as the 3D model does. The reduced-order model behind the numbers lumps both shafts into one shaft-speed state." The physics module's assumptions already listed the lumped shaft.
- **Not changed:** the model still has one shaft-speed state. Adding a second would be fidelity that cannot be verified within the model's scope.
- **Acceptance:** two pumps, two turbines, two separate shaft segments and one preburner in both arrangements; the note present; no text saying one shaft turns both.
- **Verified by:** A "draws two turbopumps fed by one preburner, as the 3D model does, and says where the model differs". After: `after/desktop-1440-hero-schematic.png`.
- **Status:** fixed.

### APT-07 · A fault the twin has no model of was named as its nearest look-alike, sometimes with high confidence

- **Area:** AI/ML integrity, fault diagnosis.
- **Reproduce (baseline commit, numerical probe):** give the simulated system a fault that is not one of the eleven, for example a fuel-pump head loss of 15 % or a restriction of the oxidiser main valve, and read the diagnosis.
- **Expected:** detection, and a statement that the cause is not one the twin can name.
- **Actual:** fuel-pump head −15 % → physics-based "combustion loss" 0.80, classifier "cooling restriction" 0.83. Oxidiser main-valve restriction → "injector restriction", physics 0.61, classifier 0.95. The fused result was reported with MEDIUM or HIGH confidence and logged as "Probable cause".
- **Root cause:** pattern matching and a softmax classifier both choose the best of the classes they know; neither can say "none of these".
- **Fix:** a model-consistency check, `TwinEngine.recognise()`. Twice a second, for each of the seven modelled physical and sensor faults, it fits the severity at which that fault's steady signature best matches the channel residuals, subtracts it, and judges what is left with the residual detector's own statistic and threshold (worst channel over 5 σ). If some modelled fault explains the residuals, the status is `explained` and the fitted severity is shown. If none does, the status is `unexplained`, no cause is declared and confidence is LOW; after 10 s of that it is `unrecognised`, and the page says the ranking is "the nearest look-alike, not a diagnosis". A cause is now logged as isolated only when it is the fault that explains the residuals. Data-path faults are established by direct checks and are not subject to it.
- **Threshold and trade-offs:** the 5 σ level was not chosen for this check; it is the residual detector's. The 10 s persistence is longer than the estimate takes to settle after a full-severity abrupt fault (6.5 s measured), which is the slowest legitimate reason for a modelled fault to look unexplained. Consequences: an abrupt fault is isolated 1.5–4.5 s after injection instead of at once; two faults at the same time are reported as unrecognised, because no single modelled fault explains them; the check is held in a transient and while data quality is not GOOD. Cost: 0.95 ms per run on the development machine.
- **Acceptance:** seven unmodelled single faults and two double faults are detected, end `unrecognised` with LOW confidence and no standing isolation; all 42 modelled runs end `explained` with a fitted severity within 0.12 of the injected one; a healthy engine stays `idle`.
- **Verified by:** V "detects a fault it has no model of, and says it does not recognise it…", "shows why the check is needed…", "detects and correctly isolates every modelled physical fault…", "stays idle on a healthy engine…"; A "does not present a look-alike as a diagnosis…", "says what its percentages are, and reports the consistency check…"; matrix: `advanced-propulsion-twin-review/fault-coverage-matrix.json`.
- **Status:** fixed. Limits are stated in the report.

---

## P2

### APT-08 · A healthy engine raised an anomaly for about half a second after every restart

- **Area:** detectors, mode transitions. Found by a new true-negative test, then confirmed on the baseline commit.
- **Reproduce (baseline):** Lab → Shut down → wait for READY → Start engine. Watch the anomaly tile continuously.
- **Expected:** no detection on a healthy engine.
- **Actual:** the residual and multivariate detectors alarm from 4.35 s to 4.90 s after the start command and an anomaly is declared and logged. Worst channel: shaft speed, −5.6 σ. The existing check sampled once, 7 s after the start, and missed it.
- **Root cause:** the simulated system's shaft is 8 % slower than the model's, and time constants are not identified. The transient allowance on the residual thresholds decays in 0.5 s from the end of the start ramp, sooner than the shaft settles.
- **Fix:** monitoring resumes five model shaft time constants (2.75 s) after mainstage is reached. A mode-dependent enable condition, which the page already described, now covers the start transient. No threshold was changed.
- **Acceptance:** no detector active at any step through shutdown and restart; no "detected" event logged; monitoring resumes.
- **Verified by:** V "true negative: no detector fires through shutdown and restart"; E[simulation] "Throttle and Compare change the plots; start and shutdown…", which now samples every 200 ms.
- **Status:** fixed.

### APT-09 · The rate-of-change detector never fired in the Lab

- **Area:** detector verification. The brief asked whether this was logic, units, threshold, timing or unsuitable test inputs.
- **Investigation (baseline):** peak score 0.17–0.54 of its threshold on the Lab's scenarios, 0.19 on a healthy engine, 0.15 through a 100 → 60 % throttle step. With pump degradation applied at full severity in one step, its score reached 2.84 and it alarmed in 0.2 s.
- **Finding:** unsuitable test inputs. The detector, its units and its threshold behave correctly; every injectable physical fault grew over 14–30 s, which moves the chamber-pressure residual at a fraction of the alarm rate. The Lab offered no scenario it could detect and did not say so.
- **Fix:** faults can be injected with gradual or abrupt onset (`inject(id, severity, onset)`, an "Onset" control in the fault picker, an "abrupt fault" button in the detector comparison). The threshold is unchanged. The page states the detector's purpose and its blind spots.
- **Measured envelope (matrix):** it never fires on a gradual fault. Abrupt, it fires in 0.20–0.35 s for pump degradation, feed-pressure reduction, injector restriction and combustion loss from 60 % severity, and for cooling restriction and sensor drift at 100 %. It does not fire at 30 % severity, nor for the fuel-valve restriction at any severity, which barely moves chamber pressure. Where it fires it is never later than the cumulative detector; it is not earlier than the model residual, which watches each channel at its source.
- **Verified by:** V "rate of change: silent on a fault that grows slowly, and among the first to fire…", "rate of change: does not mistake a commanded throttle step for a fault", "rate of change never fires on a fault that grows gradually, anywhere in the envelope…"; A "offers gradual or abrupt onset…"; E[simulation] "Rate-of-change detector…".
- **Status:** fixed (scenario added, behaviour documented).

### APT-10 · Input that is not a number poisoned the twin, and a step count could hang it

- **Area:** boundary validation.
- **Reproduce (baseline):** `engine.setThrottle(NaN)` → every state NaN from then on. `engine.inject("pump_degradation", NaN)` → a fault with `target: null` that never grows, reported as injected. `engine.step(Infinity)` → never returns.
- **Expected:** values that are not real numbers are rejected at the boundary; out-of-range values are clamped.
- **Root cause:** `clamp(NaN, a, b)` is NaN; no check on fault id, severity or step count.
- **Fix:** `setThrottle` ignores non-finite input and clamps to 0.6–1; `inject` and `scenario` drop unknown fault ids (checked with `Object.hasOwn`, so `constructor` and `__proto__` are not faults) and non-finite severities, and clamp severity to 0.1–1; `step` takes a finite, floored count of at most 6,000 (five simulated minutes).
- **Verified by:** V "ignores a throttle command that is not a number…", "drops a fault request that names no fault…", "does not hang or run away on a step count…".
- **Status:** fixed.

### APT-11 · The integrator diverged for long steps and made the chamber faster than its stated time constant

- **Area:** numerical stability.
- **Reproduce (baseline):** `stepPlant` with dt = 1.2 s gives speed 130 and chamber pressure 14,721; dt = 3 s gives 1.45 × 10²⁵. At the simulation's 50 ms step the chamber moved 62.5 % of the way to its target per step against a stated 80 ms time constant.
- **Root cause:** explicit Euler on three first-order lags (`x += (target − x)·dt/τ`), with a `min(1, dt/τ)` guard on one of them only.
- **Fix:** `lagFraction(dt, τ) = 1 − exp(−dt/τ)`, the exact step for a target that holds over the step, used for shaft, chamber and coolant, and in the estimator demonstration.
- **Result:** bounded and convergent to the same operating point for every step tried from 5 ms to 60 s. No overshoot up to 0.5 s. Above that the first step overshoots (13 % at worst) because the flows are held for longer than the chamber takes to respond; the engine never uses such a step. Discretisation error of the 50 ms step against a 5 ms step through a 100 → 70 % throttle step: 0.99 % of reference chamber pressure at worst.
- **Verified by:** V "moves a first-order lag by the exact fraction…", "gives the shaft its stated time constant whatever the step size" ×4, "stays bounded and settles at the same operating point for any step size…", "converges as the step shrinks…", "closes the pressure budget of both branches at every step of a transient…".
- **Status:** fixed.

### APT-12 · Live regions announced at the simulation's frame rate while a fault developed

- **Area:** accessibility.
- **Reproduce (production):** Lab → Inject fault → observe mutations inside `role="status"` regions for 8 s.
- **Expected:** conclusions are announced; numbers that change several times a second are not.
- **Actual:** 35 updates in 8 s: "Nominal — 90 %", "Nominal — 89 %", … The Prognostics list and the data-quality findings were live regions too, and carry changing numbers.
- **Root cause:** the percentage was inside the status element; whole lists of live values were given `role="status"`.
- **Fix:** the status element holds the conclusion only ("Probable …", "Nominal", "Unrecognised fault pattern"); the percentage sits beside it. Health announces its level and data quality its verdict, through visually hidden status lines.
- **Acceptance:** at most 3 updates in 5 s of healthy running, and at most 6 in 8 s of a developing fault, with the change of diagnosis announced at least once.
- **Verified by:** E[accessibility] "Live regions do not announce at the simulation's frame rate" (measured: 0 and 1, the one being "Probable Oxidiser pump degradation"); A "announces the conclusion only…".
- **Status:** fixed.

### APT-13 · Two serious axe violations

- **Area:** accessibility.
- **Reproduce (production):** axe-core 4.11.3, WCAG 2.2 A and AA rules. `nested-interactive` on the Pressure module (desktop): an `svg role="img"` containing `role="button"` sensor markers. `dlitem` in Physics ("Solved operating point") and Health: `<dl role="status">`, whose `dt`/`dd` no longer have a list parent.
- **Fix:** the schematic is `role="img"` only where nothing in it can be chosen, and `role="group"` with a label where it holds sensor buttons. The definition lists sit inside a `div role="status"`.
- **Verified by:** E[accessibility] "no WCAG 2.2 A/AA violations found by axe in any module", desktop and mobile; A "is one picture where nothing can be chosen, and a group of buttons where sensors can".
- **Status:** fixed.

### APT-14 · Tables wider than the screen on phones

- **Area:** mobile. Required mobile behaviour 6.
- **Reproduce (production, 320–430 px):** System 1 table, Data 3, Twin 1, AI/ML 2, FDIR 1, Lab 1, Architecture 2 scroll sideways inside their wrappers. The confusion matrix also scrolled at 1024–1180 px.
- **Root cause:** `min-width: 640px` on every table; 520 px on the confusion matrix; `white-space: nowrap` on small-table cells.
- **Fix:** below 640 px eleven tables become cards: each row a card, its row heading on top, each cell under the name of its column (`data-label`, shown with `::before`). Explicit ARIA table roles keep them tables for screen readers when `display` changes. The confusion matrix uses three-letter column heads (`<abbr>`, with full names in the row heads) and a fixed layout, and fits its column at every width.
- **Verified by:** E[responsive] "no table is wider than the screen" ×5; A "labels every cell of a stacked table with its column, and keeps the table's roles"; WebKit and Firefox pass. After: `after/phone-390-data-quality-table.png`, `after/phone-390-confusion-matrix.png`.
- **Status:** fixed.

### APT-15 · Touch targets under 44 px

- **Area:** mobile.
- **Reproduce (production, touch viewports):** range sliders 28 px; fault-library "Inject" buttons 32 px; text links 32 px; schematic sensor markers 20–24 px at 1024–1180 px.
- **Fix:** 44 px minimum on coarse pointers for sliders, selects, list rows, fault-library and picker buttons, text links and the icon button. Schematic markers have invisible targets of 44 px, limited only by the distance to the next marker; both arrangements are spaced so that limit is never reached at the narrowest they are drawn (45.0 px and 46.5 px between the closest pair).
- **Verified by:** E[responsive] "interactive targets are at least 44px" on all eleven touch viewports and "at least 24px" on the four pointer viewports; A "spaces the markers so that each has a 44 px touch target…".
- **Status:** fixed.

### APT-16 · The sticky bars covered half of a phone held sideways

- **Area:** mobile, landscape.
- **Reproduce (production):** 568 × 320: site header plus module bar cover 54 % of the viewport; 844 × 390: 45 %.
- **Root cause:** below 900 px wide the module bar is two rows (tabs, then reading depth and CTO view).
- **Fix:** where the viewport is no taller than 520 px the module bar is one row: tabs that scroll, tools beside them, the CTO button showing its first word.
- **Acceptance:** sticky bars take no more than 40 % of the viewport; headings are not covered; the active tab is in view.
- **Verified by:** E[responsive] "the sticky bars do not cover a module heading, and leave most of the screen for content" ×15.
- **Status:** fixed.

### APT-17 · The page said the power balance gives the model its shaft speed. It does not

- **Area:** physics honesty.
- **Where:** Physics → Conservation of Energy → "In the twin".
- **Actual:** "The power balance gives the model its shaft speed." In `simulation/plant.ts` shaft speed is scheduled from the throttle command and follows it with a first-order lag; the hot-gas pressures are prescribed from chamber pressure and speed; no turbine power balance is solved.
- **Fix:** the text now says exactly that, and that a fault acting through turbine power is outside what the model can represent.
- **Verified by:** A "does not claim a turbine power balance the model does not solve".
- **Status:** fixed (text). The model is unchanged, by decision.

### APT-18 · Residual convention, pressure reference and data-quality checks were stated loosely or wrongly

- **Area:** units and conventions, honesty.
- **Actual:** (a) "Residual = Observation − Model Expectation" everywhere, while the twin judges estimated − expected and showed only that. (b) "No absolute pressure is implied" could be read as gauge pressure. (c) The data-quality table listed range, rate and flat-line checks that the simulation did not run. (d) The detection-method table described the model residual as "observed minus expected".
- **Fix:** (a) both residuals are computed (`residual`, `rawResidual`), shown and named, with the sign convention, in the pressure map, the twin-states panel, the FAQ and the pipeline step. (b) "Every pressure is an absolute pressure, measured from vacuum and not from ambient, given as a percentage of the reference chamber pressure…". (c) the table has an "In this simulation" column saying for each check whether it is implemented and how to trigger it; range and rate are marked not implemented. (d) corrected.
- **Verified by:** V "judges the filtered residual … and also reports the raw one"; A "defines the residual it judges, its sign, and the raw residual beside it", "states that pressures are absolute and normalised", "says for every data-quality check whether this simulation runs it", "says that live values are estimates, and shows both residuals".
- **Status:** fixed.

### APT-19 · Diagnosis percentages carried no statement of what they are, and no calibration evidence

- **Area:** AI/ML integrity.
- **Actual:** "Probable … — 97 %" with accuracy on a simulated validation set as the only evidence.
- **Fix:** every diagnosis panel carries: "SIMULATED. The percentages are scores from models built and checked on simulated data only. They rank the faults this twin has a model of; they are not calibrated probabilities of a real engine's condition." The AI/ML module reports expected calibration error and Brier score on the validation set, with the stated-versus-achieved rate per confidence band, states that there are eight classes and no "something else", and labels the evidence SYNTHETIC DATA ONLY.
- **Measured:** validation set (320 simulated conditions, severity from 15 %): accuracy 99.1 %, ECE 0.034, Brier 0.021. A harder simulated set (480 conditions, severity from 5 %): accuracy 91.7 %, ECE 0.039, Brier 0.116, and the middle bands are unreliable there (stated 65 % was right 17 % of 12 times; stated 76 %, 53 % of 15).
- **Verified by:** V "reports calibration on the simulated validation set, alongside accuracy"; A "says what its percentages are…".
- **Status:** fixed. Not recalibrated: see deferred work.

### APT-20 · The EKF and the UKF showed identical errors with no explanation

- **Area:** state estimator. "Do not hardcode results."
- **Reproduce (production):** Twin → estimator lab → compare "Extended Kalman Filter" and "Unscented Kalman Filter": 0.17 and 0.17 at every setting.
- **Finding:** not hardcoded. The two are separate computations in `simulation/estimators.ts`; their estimates differ by at most 1.5 × 10⁻⁴ % of reference chamber pressure, because this chamber model is nearly linear over the width of the estimate's uncertainty.
- **Fix:** when either is selected the page states the measured difference and the reason. No artificial difference was introduced.
- **Verified by:** V "runs the EKF and the UKF as different computations that agree because this model is nearly linear…"; A "says by how little the EKF and the UKF differ, and why…"; E[controls] "State estimator: each estimator, the noise level and the model error change the computed errors".
- **Status:** fixed (explained).

### APT-21 · A missing or frozen sample was not handled

- **Area:** missing and stale data.
- **Reproduce (baseline, by review and probe):** a non-finite observation propagates through the estimator into every statistic; a sensor stuck at its last value is invisible in steady running.
- **Fix:** the telemetry path is a seam (`acquire`). A sample that is not a number corrects nothing: the estimate coasts on the model, its variance grows to a bound, the channel is listed in `quality.missing`, data quality is DEGRADED, and the learned detector is held because it cannot score a partial vector. With both chamber sensors silent the fused pressure follows the virtual sensor. A sensor whose sample-to-sample scatter falls under 5 % of its calibrated level is reported as flat-lined. The classifier scores only a vector of the width it was trained on (`acceptsFeatures`); otherwise the physics-based ranking stands alone and the page says so. Charts break a line at a gap.
- **Not done:** these conditions cannot be injected from the Lab; they are exercised by tests. Range and rate plausibility checks are not implemented and are labelled so.
- **Verified by:** V "coasts on the model when a sample does not arrive…", "falls back to the virtual sensor when both chamber pressure sensors go silent", "recovers when the samples return…", "notices a sensor that has stopped responding…", "does not call a healthy sensor frozen…", "scores with the classifier only a vector of the shape it was trained on", "falls back to physics-based reasoning alone…"; A "breaks a line at a missing sample…".
- **Status:** fixed.

### APT-22 · An abrupt physical fault was first reported as a noisy sensor

- **Area:** data quality versus physical faults. Introduced by APT-09's abrupt onset and caught by the coverage matrix before it left the working tree.
- **Reproduce (working tree, before this fix):** inject pump degradation or feed-pressure reduction, abrupt, at 60–100 %: the history logs "Probable cause: Noisy pressure sensor" before the real cause.
- **Root cause:** the noise estimate is an average of squared sample-to-sample jumps; one large step counted as thirty-five times the calibrated noise for the next 2.7 s.
- **Fix:** one sample may count for no more than a 5 σ jump at the present noise level, so a step is not read as noise while sustained noise is still measured without bias.
- **Verified by:** V "never names the wrong fault for a modelled one, at any tested severity and either onset"; E[simulation] "Rate-of-change detector…" asserts that "Noisy pressure sensor" never appears in the history.
- **Status:** fixed.

---

## P3

### APT-23 · Visible labels were not part of two controls' accessible names

- **Area:** accessibility, WCAG 2.5.3.
- **Actual:** inject buttons had an `aria-label` ("Inject cooling-channel restriction into the simulation") that did not contain their visible text ("A slow fault"). The CTO button showed "CTO View" on a phone while being named "CTO / Architect View".
- **Fix:** the inject button's name is its visible text followed by a visually hidden description. The CTO button shows the first word of its name on a phone and the whole name elsewhere.
- **Verified by:** E[accessibility] "Visible labels are part of each control's accessible name"; A "names an inject button by the words on it…", "gives the CTO button one name at every width…".
- **Status:** fixed.

### APT-24 · Auxiliary text of 9.5–10.5 px

- **Actual:** tags, module counts, group labels and definition terms at 9.5–10.5 px.
- **Fix:** sixteen declarations raised to 11 px.
- **Verified by:** E[responsive] "…body text at 11px or more" ×15.
- **Status:** fixed.

### APT-25 · The 3D view had no cooling or hot-gas overlay, and its markers ignored reduced motion

- **Area:** propulsion explorer.
- **Fix:** four overlays (pressure pathways, cooling flow, hot-gas flow, signal pathways), one at a time, using the flows the fundamentals page's engine already draws. With reduced motion the selected marker is larger instead of pulsing, and a sensor in alarm is told apart by shape alone.
- **Verified by:** E[controls] "3D engineering mode: loads on demand, draws, switches views and overlays…".
- **Status:** fixed.

### APT-26 · The knowledge graph and the readiness score were not connected to the running twin

- **Area:** architecture and knowledge graph.
- **Actual:** both were navigable but static.
- **Fix:** a graph node that stands for something in the twin shows its present state, read from the simulation (a sensor's observed, estimated and expected values; a failure mode's injected state and score; the classifier's validation and calibration; the identification result), and links to the pressure map or injects the fault in the Lab. Under each readiness category is the evidence the running twin can show for it, or "None" where it has none. Readiness levels remain an assessment and are labelled as one.
- **Verified by:** A "shows a node's state in the running twin, and it changes when the twin does", "puts under each readiness category the evidence the twin can show for it…"; E[controls] "Fault tree, knowledge graph and readiness score respond to their controls".
- **Status:** fixed.

### APT-27 · Layout shifted after load when a live module was opened by its address

- **Actual (production, emulated phone):** cumulative layout shift 0.073 after load.
- **Fix:** none targeted. The schematic reserves its box with a container query, and charts have a fixed height.
- **Measured after:** 0 during load and 0 after it, in the same scenario.
- **Verified by:** E[performance] both checks.
- **Status:** fixed (as a result of APT-03 and APT-04).

### APT-28 · "Written for: cto and chief architects"

- **Area:** copy. Reported by the site owner during the audit.
- **Root cause:** the list of roles was lower-cased wholesale, which also turned AI/ML, IVHM, PHM, PhD, R&D and Digital Twin into lower case.
- **Fix:** the roles are written as they read inside the sentence and shown as written: "Written for: CTO and Chief Architects, propulsion systems architects, Digital Twin architects, …".
- **Verified by:** A "keeps the capitals of titles and abbreviations…".
- **Status:** fixed.

### APT-29 · The pressure ladder showed estimated values without saying so

- **Fix:** "Live values are the twin's estimated state, with sensor noise filtered out, not raw readings." Before the simulation has loaded: "Design-point values of the model…".
- **Verified by:** A "says that live values are estimates, and shows both residuals".
- **Status:** fixed.

---

## Pre-existing, unrelated

### SAT-01 · `src/components/satellite-explorer/ui/ui.test.tsx` › explore controls › "offers EXPLODE, a 0–100 scrubber and X-RAY"

- **Status at baseline:** fails on `8c47939`, and on `9dcfeac`, the commit before any work on this page (checked in a separate worktree). It is the only failing test in the suite before and after this audit.
- **Cause:** the test expects `data-track-event="exploded_view_open"` on the EXPLODE button; `modes/ExploreMode.tsx:17` reports that event from the click handler with `trackEvent(...)`, so the attribute is not there.
- **Action:** not changed. It belongs to another page and is outside this task; fixing it means deciding whether the test or the component is right.

## Inventory of controls

Every control on the page and the check that exercises it. "E" checks run in a real browser against a production build.

| Group | Controls | Expected | Checked by |
| --- | --- | --- | --- |
| Learning modes | Learn / Engineer / Architect | One selected; content of that depth showing; nothing removed from the document | E[controls] "Learn / Engineer / Architect switch…" |
| | CTO / Architect View | Architecture module at architect depth; reported once per click | E[controls] "CTO / Architect View opens…" |
| | Module tabs, arrow keys, `#module` addresses, hero buttons, "Next" | All agree on the module showing; the address follows | E[controls] "Module navigation…", "Hero calls to action…" |
| | Back to fundamentals, Space breadcrumb | Resolve | E[controls] "Hero calls to action…"; E[server] links |
| | Checkpoints | Reasoning only after an answer; answer survives module changes | E[controls] "Checkpoint…" |
| | Twelve-week tracker | Open, complete; survives a reload | E[controls] "Twelve-week tracker…" |
| | Maturity ladder, concept pickers, estimator and model cards, twelve steps | The panel chosen is the one showing | E[controls] "Maturity ladder, physics concepts…" |
| Propulsion explorer | Subsystem selection | Schematic, caption and explanation change together | E[controls] "Propulsion explorer…" |
| | 3D: enter, assembled / exploded / cutaway, four overlays, sensor, close | Loads on demand; one overlay at a time; canvas released on close | E[controls] "3D engineering mode…" |
| | Sensor selection (schematic, list, ladder), signal path, close, Escape | Marker, list, detail and signal path agree; detail in view and focused | E[controls] "Pressure map…", "PHONE: a pressure sensor…" |
| | Pressure path trace | Eleven steps; start and completion reported once | E[controls] "Pressure path trace…" |
| | 3D unavailable (phone, no WebGL) | Schematic and a desktop note; no canvas; three.js not loaded | E[controls] "PHONE: the full tutorial without WebGL…" |
| Simulation | Pause, Step, Live | Pause stops simulated time; Step adds 0.5 s | E[simulation] "Pause stops simulated time…" |
| | Reset | Same baseline every time, t = 0 | E[simulation] "Reset restores…" |
| | Throttle 100 / 80 / 60, Step throttle, Compare, 1× / 4× | Plots follow; no false alarm | E[simulation] "Throttle and Compare…", "Simulated time advances…" |
| | Start engine, Shut down | Modes in order; monitoring held then resumed; no false alarm | E[simulation] "Throttle and Compare…" |
| | Fault, severity, onset, Inject, Remove | One fault at a time; detected, isolated, cleared | E[simulation] eleven "Fault …" checks, "Rate-of-change detector…", "Switching straight…" |
| | Leaving and returning | One clock; no leak | E[simulation] "Leaving and re-entering…", "A minute of simulation leaks…" |
| | Reduced motion | Starts paused; steps by hand | E[simulation] "Reduced motion…" |
| State estimator | Estimator, noise, spikes, model error | Errors recomputed by the estimator chosen | E[controls] "State estimator…" |
| | Chart inspect (pointer, arrow keys, Escape) | Reads every line at that moment | E[controls] "Charts…" |
| Fault diagnosis | Reasoning panel evidence toggles | Ranking changes with evidence | E[controls] "Diagnostic reasoning panel…" |
| | Fault tree, "Why this diagnosis?", fault history | Evidence for and against; events in order | E[controls] "Fault tree…"; E[simulation] fault checks |
| | Instruments in FDIR, AI/ML, Health | Same twin as the Lab | E[simulation] "Instruments in other modules show the same twin…" |
| Architecture | Knowledge graph nodes, "Open on the pressure map", "Inject in the Lab" | Live state shown; links act on the twin | E[controls] "Fault tree, knowledge graph and readiness score…" |
| | Readiness: this page / your own, thirteen sliders | Weakest category limits; evidence shown | same |
