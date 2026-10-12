# Advanced Rocket Propulsion Digital Twin: audit and remediation report

Page: `/space/rocket-engine-digital-twin-advanced`. Audit of 11–12 October 2026.
Issue register, with reproduction steps and root causes: [advanced-propulsion-twin-audit.md](advanced-propulsion-twin-audit.md).
Evidence: [advanced-propulsion-twin-review/](advanced-propulsion-twin-review/).

**Release decision (gate of 12 October 2026): GO WITH CONDITIONS.** See [Release gate](#release-gate-12-october-2026) below. Sections 1 to 12 are the audit report as written before the audited work was committed; where the gate supersedes them, it says so.

## Release gate, 12 October 2026

An independent re-verification of the audited state, run after the audit.

### What "GO" means here

Suitable to release as the declared educational and research **simulated** Advanced Rocket Propulsion Digital Twin learning environment. It does **not** mean validated for a physical rocket engine, and nothing in this document should be read that way.

| Question | Status | Basis |
| --- | --- | --- |
| **Software verification.** Does the application work? | **PASS** | 159 of 159 browser checks on a local build, on production, and on the target address; WebKit and Firefox; unit and component tests; zero axe violations |
| **Model verification.** Does the implementation correctly execute its declared mathematical model? | **PASS, within the declared reduced-order assumptions** | Pressure budget closes at every step; step-size convergence; exact first-order lags; detectors and isolation over a 63-run matrix; consistency check |
| **Model validation.** Has the model been compared with independent physical evidence? | **SIMULATION-ONLY** | Every model is identified, trained and scored on this page's own simulator |
| **Physical validation** | **NOT PERFORMED** | No physical engine, test stand or experimental telemetry has been used |
| **Operational qualification.** Is it suitable for real propulsion-system decisions? | **NOT CLAIMED** | The page says so in its credibility notice, its model cards and its limits |

### State found

The gate's brief describes an uncommitted working tree to be verified before commit. That is not the state of the repository:

- The audited implementation was **already committed and pushed** by the site owner as `308e2bd` ("Fixed Model Rocketry issues"), and the Space branding migration as `73fad51`. `HEAD` = `origin/main` = `73fad51`.
- Production is serving that build. This gate is therefore a verification **after** release, and it was run against the deployed site as well as locally.
- `git diff --check`: clean. No debug, probe or generated file is in either commit. Two things were found and are reported, not changed: `scratchpad/model-rocketry-dev-report.html` and `.md` are tracked from an earlier, unrelated commit (`917d516`); and five evidence logs named in this report were never committed because `.gitignore` excludes `*.log`. They are now `.txt` files and can be tracked.

What the gate itself changed is uncommitted and listed at the end of this section. Nothing was committed, pushed or deployed by it.

### Results reproduced

Every figure below was re-run for this gate; none is carried over from the audit.

| Check | Final working tree (local production build) | Deployed build, `aerospace.ev.engineer` | Deployed build, target `aerospace.ishavasyam.org` |
| --- | --- | --- | --- |
| Browser audit, Chromium, 159 checks | 159 passed, 0 failed | 159 passed, 0 failed | 159 passed, 0 failed |
| Console errors, page errors, failed requests | none | none | none |
| axe WCAG 2.2 A and AA, 12 modules × desktop and phone | 0 violations | 0 | 0 |
| Live-region updates: 5 s healthy / 8 s of a developing fault | 0 / 1 | 0 / 1 | 0 / 1 |
| Largest contentful paint, emulated phone | 1,076 ms | 1,632 ms | 1,696 ms |
| Layout shift during load / after load | 0 / 0 | 0 / 0 | 0 / 0 |
| WebKit, 10 checks | 10 passed | – | – |
| Firefox, 10 checks | 10 passed | – | – |
| Fundamentals page regression | 16 passed | – | – |
| Unit and component tests (`npm test`) | 1,669 passed, 1 failed | – | – |
| of which this page | 209 passed, 0 failed | – | – |
| Type-check | clean | – | – |
| Lint, files changed | 0 errors (one warning that predates the audit, `<img>` in `SpaceLanding.tsx`) | – | – |
| Production build | succeeds | – | – |

**Where the numbers differ from the brief, and why.** The brief quotes 1,626 unit tests. The count is now 1,669: the branding migration added 25 (commit `73fad51`), and this gate added 18 (twelve on the start hold and the fault-to-recommendation chain, six on claims, transparency and hierarchy). The one failing test is unchanged: `satellite-explorer/ui/ui.test.tsx` › "offers EXPLODE, a 0–100 scrubber and X-RAY", which fails on every commit back to before this page existed.

### The seven former P1 areas

| # | Area | Verified by | Evidence |
| --- | --- | --- | --- |
| 1 | A failed instrument download does not take the page down | Browser check "A live instrument that cannot be downloaded fails alone…" (chunk requests aborted; module bar, H1 and other modules remain; no file name shown); two component tests | `release-gate/desktop-1280-instrument-load-failure.png` |
| 2 | Switching faults clears and restarts | Browser check "Switching straight from one fault to another…" (one active fault, t < 3 s, no latched latency); four engine tests, including identical snapshots after different histories | `release-gate/run-local.txt` |
| 3 | A pressure schematic exists and is usable below 900 px | Browser check on a 390 px phone (portrait arrangement, 44 px targets, sheet opens, focuses, closes); responsive checks at 320, 360, 375, 390, 430, 768 and 820 px | `release-gate/mobile-320-pressure-figure.png`, `mobile-390-pressure-sheet.png` |
| 4 | Schematic and chart lettering is readable | Lettering at 11 px or more at all fifteen viewports, and in WebKit and Firefox; label-fit test | `release-gate/desktop-1440-pressure-figure.png`, `mobile-390-lab-figure.png` |
| 5 | Sensor details stay inside the viewport | Browser check on desktop (in view, focused, Escape returns focus) and on a phone; WebKit and Firefox | `release-gate/cross-browser.txt` |
| 6 | Two turbopumps in schematic and 3D; one-state assumption disclosed | Component test on both arrangements; note shown under the System and Pressure schematics. **The gate found text that still said "the turbine" and credited the twin with a turbine model it does not have. Corrected, uncommitted: see below** | `release-gate/desktop-1440-3d.png`, `after/desktop-1440-hero-schematic.png` |
| 7 | An unmodelled fault is not named with confidence | Nine unmodelled conditions: all detected, all end `unrecognised`, LOW confidence, no cause declared; the highest look-alike score, 88 %, is shown as a look-alike and not as a diagnosis | `release-gate/diagnosis-integrity.md` |

### Transients

| Transition | Result |
| --- | --- |
| Healthy running, 120 s | No detector fires |
| Throttle 100 → 60 → 85 → 100 % | No detector fires; rate of change peaks under 0.6 of its threshold |
| Shutdown | No anomaly; twin reports HOLDING |
| Restart, then 60 s of running | No detector fires at any step. Health checks are held for 2.75 s after mainstage is reached (five model shaft time constants), measured at 2.75 s |
| A real fault present before the restart, each of the seven modelled faults at 80 % | Not declared during the hold. Detected 0.15–0.20 s after the hold ends and isolated 1.1 s after it. **The hold delays a real fault by the hold and no more; it does not hide one** |
| A fault arriving during the hold | Detected within 2 s of the hold ending |
| Fault during nominal running, gradual | Detected in 0.75–4.75 s, isolated in 1.55–5.95 s |
| Fault during nominal running, abrupt | Detected in 0.25–1.35 s, isolated in 1.45–4.45 s |
| Fault A → fault B | Run restarts from the healthy baseline; B detected once, on its own clock |
| Reset | t = 0 and an identical read-out every time |
| Pause, step, resume | Simulated time stops; a step adds 0.5 s; one clock after ten module changes |

Per-detector latency for all 42 modelled runs is in `release-gate/diagnosis-integrity.md`.

### Rate-of-change detector

Reproduced as the audit concluded: the detector is correct and the original faults did not excite it. Its threshold was not changed.

- **Gradual faults: quiet, correctly.** 0 of 21 gradual runs. Peak score on a 24 s pump-degradation ramp is under 0.6 of the threshold.
- **Abrupt faults: responds where the step moves chamber pressure.** 10 of 21 abrupt runs, in 0.20–0.35 s: pump degradation, feed-pressure reduction, injector restriction and combustion loss from 60 % severity; cooling restriction and sensor drift at 100 %.
- **Where it stays quiet on an abrupt fault, and why.** At 30 % severity the step is below its alarm rate. For the main fuel valve restriction at any severity, the fault changes fuel flow and coolant temperature and barely moves chamber pressure, which is the one residual this detector watches. Both are left to the residual and cumulative detectors, which caught every one of those runs.

### Diagnosis integrity

Full table, one row per run, with expected class, predicted class, score, confidence, consistency result, detection and isolation latency: `release-gate/diagnosis-integrity.md`.

| Group | Runs | Predicted class correct | Wrong class declared at any point | Confidence at end | Consistency check |
| --- | --- | --- | --- | --- | --- |
| Seven modelled physical and sensor faults × gradual and abrupt × 30, 60, 100 % | 42 | 42 | 0 | HIGH in all | `explained` in all; fitted severity within 0.01 of injected |
| Four data-path faults × 30, 60, 100 % | 12 | 12 | 0 never an engine fault | MEDIUM at 30 % for two, HIGH otherwise | not applicable: established by a direct check on the data |
| Unmodelled: seven single conditions, two double faults | 9 | none declared, as intended | 1: in one double fault, one of its two real components was named for a few seconds and then withdrawn | LOW in all | `unrecognised` in all |

The chain from fault to recommendation was followed for every modelled run: physical effect, sensor response, residual, detection, isolation, confidence and recommended investigation are reached in all 42. The eighth stage, prediction, is reached in 36; the six without it are the sensor-drift runs, where the engine is healthy and there is no degrading parameter to project. The recommendation shown is the one written for the fault isolated. For an unrecognised pattern the chain stops before isolation and the recommendation is not to act on the ranking.

### Claims checked against the code

| Topic | In the simulator | What the page said | Action in this gate |
| --- | --- | --- | --- |
| Range and rate plausibility checks | Not implemented | Marked "Not implemented" in the data-quality table (audit). The AI-architecture diagram still listed them without that mark | Status line added to the AI architecture |
| Sensor-health checking | Latency, clock skew, repeated sequence, noise, missing sample, flat-line; a two-sensor vote with a virtual sensor, for chamber pressure only | Accurate | Status line added: redundancy exists for chamber pressure only |
| Kalman filter | One scalar filter per channel in the live twin | Accurate | – |
| EKF, UKF, particle filter | In the estimator demonstration only, on one state | Described generically; a reader could take them as part of the live twin | Each now says "implemented in the demonstration only… The live twin does not run it" |
| PCA anomaly detector; classifier | Implemented; trained and scored on simulated data | Accurate, labelled SYNTHETIC DATA ONLY (audit) | – |
| Hot-gas pressures: preburner, turbine inlet, turbine outlet | Prescribed outputs; watched as residual channels and by the PCA detector | **"Boundary of the turbine model", "Input to the turbine power estimate that is balanced against pump power", "Input to the turbine pressure-ratio check". None of these exists** | Corrected for all three sensors and for the hot-gas subsystem |
| Turbine arrangement in text | Two turbopumps drawn | "the turbine", "a turbine", "Turbine", "Shaft" in the System module | Corrected to two turbopumps, each with its own turbine |
| FDIR | Detection and isolation | "Recovery" defined without saying the simulator has none | Status line: recovery is not implemented; the simulator commands nothing |
| Prognostics | Linear trend through model sensitivities, with a widening band | Accurate: "a concept demonstration, not a life estimate" | – |
| Uncertainty | Bands computed, not checked against outcomes | Accurate | – |
| Cybersecurity controls | None. One attack, replayed telemetry, is simulated and is caught by a data-quality check | Sixteen controls described with no statement that none exists here | Section marked CONCEPTUAL with "Concept described — not implemented in this educational simulator." |
| MLOps | None. Models are rebuilt in the browser on each load | Nine practices described with no such statement | Same |
| Data architecture; digital thread | None. Telemetry never leaves the browser tab | Layers described; APIs were already marked conceptual | Both marked CONCEPTUAL, same statement |
| Twelve-step pipeline | Ten of twelve steps carried out on a simulated asset | No statement of which steps are not real | Status line: no acquisition hardware; validation not done |
| Model validation | None against a physical engine | Model cards: "None. Not compared with any physical engine." | Statement added to the verification-and-validation section |

Every status statement is held by a test, so it cannot be dropped silently.

### Transparency statements, confirmed present and unweakened

Telemetry is simulated; reference values are not flight-engine measurements; no proprietary engine is represented; no physical engine has validated the models; the page is educational and research oriented; it is not flight-certification evidence; it is not a flight-safety authority; no AI on the page certifies propulsion safety; and demonstrating the methods of levels 4 to 6 does not make the simulation a physically connected level 4 to 6 Digital Twin ("as a whole it is a level 2 system"). The credibility notice is unchanged, word for word, and shown twice. A test asserts each of these.

### Branding

| Where | Says | Role | Action |
| --- | --- | --- | --- |
| Header mark, hero eyebrow, foot line, title suffix, social card | EV.ENGINEER™ | Platform and tutorial owner | Kept |
| Metadata author and creator; Course provider in JSON-LD | EV.ENGINEER | Tutorial owner and platform | Kept |
| Metadata and JSON-LD publisher | iTelematics Software Private Limited | Operator of the site | Kept |
| Model cards, "owner" | EV.ENGINEER tutorial | Tutorial owner | Kept |
| Initiative | Not stated anywhere on the page | – | One sentence added to the attribution note: "It is published within Space, an ISHAVASYAM.ORG education, research and engineering initiative. EV.ENGINEER™ is the engineering and learning platform it is built and hosted on. Commercial engineering, where applicable, is handled separately by iTelematics Software Private Limited under explicit agreements." |
| EV Society | Not named | – | – |

No ownership statement on the page was incorrect. The page did not place itself in the hierarchy at all, and now does. Not changed, for the owner to decide: the canonical URL is `aerospace.ev.engineer`, not the `aerospace.ishavasyam.org` address the gate names; the page's JSON-LD has no ISHAVASYAM.ORG node; and the Fundamentals page has no such sentence.

### Deferred to a later version, on purpose

Not attempted in this release, and not to be read as done:

1. Validation against a physical engine.
2. Integration of experimental telemetry.
3. Recalibration of the classifier.
4. A complete range and rate plausibility layer.
5. Implemented, production cybersecurity controls.
6. Verification with a screen reader by a person.
7. A site-wide Content-Security-Policy.
8. Operational or flight integration.

### Unresolved

- The gate's own changes are **not in production**. Until they are, the deployed page still credits the twin with a turbine power estimate and a turbine pressure-ratio check, and still describes security controls, MLOps and a data architecture without saying they are not implemented.
- `satellite-explorer/ui/ui.test.tsx`: one failing test, unrelated, older than this page.
- `scratchpad/model-rocketry-dev-report.*` is tracked in the repository from an earlier commit. It looks accidental; it is not part of this work and was left.
- Repository-wide `npm run lint` reports problems in files this work did not touch.
- No physical device and no human screen-reader pass.

### Decision

**GO WITH CONDITIONS.**

The audited implementation is sound as what it declares itself to be, and has been verified again locally, on production and on the target address. The conditions are:

1. **Commit and deploy the gate's changes.** They are text, status labels, one attribution sentence, a date and tests; no simulation code, threshold, layout or style changed. Without them the deployed page overstates what the simulator does in the places listed under "Unresolved", which is the one thing this gate may not pass.
2. **Owner confirms the attribution sentence** added under "Branding", and decides the three items left open there.

Not conditions: the eight deferred items. They are the difference between this release and a validated twin, and the page says so.

### Files changed by the gate (uncommitted)

| File | Change |
| --- | --- |
| `src/components/propulsion-twin-advanced/data/status.ts` (new) | The implementation-status statements |
| `…/data/pressure.ts`, `data/system.ts`, `data/twin.ts` | Hot-gas sensor and subsystem statements; two turbopumps in the text; what each estimator is on this page |
| `…/data/product.ts` | The attribution sentence; review date 12 October 2026 |
| `…/sections/Operations.tsx`, `sections/TwinModules.tsx` | Show the status statements; three sections tagged CONCEPTUAL |
| `…/simulation/verification.test.ts`, `AdvancedTwinPage.audit.test.tsx` | 18 tests; the matrix also records the chain reached and latency after the start hold |
| `src/app/sitemap.ts`, `…/rocket-engine-digital-twin-advanced/integration.test.tsx` | Last-modified date |
| `docs/advanced-propulsion-twin-review/` | `release-gate/` (results, logs, screenshots, `diagnosis-integrity.md`); matrix regenerated; five logs renamed `.txt` |
| This report and the register | This section; status lines |

Also uncommitted, from the task before this one: `docs/space-ishavasyam-migration.md` and `docs/space-ishavasyam-migration-review/rendered-routes-production.json`.

---


## 1. Baseline status and final status

| | Baseline | Final |
| --- | --- | --- |
| Code | `main` = `origin/main` = `8c47939`, as served by production | Working tree on `8c47939`, uncommitted |
| Unit and component tests (`npm test`) | 1,548 passed, 1 failed | 1,626 passed, 1 failed |
| The one failing test | `satellite-explorer/ui/ui.test.tsx` › "offers EXPLODE, a 0–100 scrubber and X-RAY" | The same test, unchanged: see SAT-01 in the register |
| Browser audit of this page, 159 checks, same script | 110 passed, 49 failed (run against production) | 159 passed, 0 failed (local production build) |
| WebKit and Firefox pass, 20 checks | not run | 20 passed |
| Fundamentals page browser tests (`npm run test:rocket-engine-twin:e2e`) | 16 passed | 16 passed |
| Type-check (`tsc --noEmit`) | clean | clean |
| Lint, files changed by this work (43) | – | 0 problems |
| Production build (`next build`) | succeeds | succeeds |
| axe, WCAG 2.2 A and AA, 12 modules × desktop and phone | 2 rules violated (serious): `nested-interactive`, `dlitem` | 0 |

The baseline column of the browser audit was produced by running the finished audit script against the production site, which nothing in this work has touched. By section, baseline failures were: responsive 36 of 102; controls 7 of 19; simulation 3 of 22; accessibility 3 of 6. A check that exercises something added by this work (the onset control, the consistency check, the chart read-out, the failure boundary) fails on the baseline because the thing is absent there, which is the defect it records.

## 2. Issues found, by severity

| Severity | Found | Fixed | Remaining |
| --- | --- | --- | --- |
| P0 | 0 | – | 0 |
| P1 | 7 | 7 | 0 |
| P2 | 15 | 15 | 0 |
| P3 | 7 | 7 | 0 |
| Pre-existing, in another page | 1 | 0 | 1 (SAT-01, documented, out of scope) |

## 3. Reproduction steps and root causes

In full in the register. In one line each:

| ID | Sev. | Defect | Root cause |
| --- | --- | --- | --- |
| APT-01 | P1 | A failed instrument download replaced the whole page with an error screen | No error boundary around lazy instruments; `boot()` had no failure path |
| APT-02 | P1 | Switching faults left the first active and credited its evidence to the second | Faults accumulated; detector state carried over; latency clock restarted |
| APT-03 | P1 | No pressure schematic under 900 px | Hidden on small screens instead of redrawn |
| APT-04 | P1 | Diagram lettering 3.3–8.3 px and chart lettering 5–8.3 px on every screen | Lettering sized in drawing units and scaled with the SVG |
| APT-05 | P1 | Sensor detail opened off screen on a desktop (y = 1402 at 900 px tall) | Appended below the map with no scroll or focus |
| APT-06 | P1 | Schematic showed one shaft; the 3D model shows two turbopumps | Drawn from the model's simplification, not the architecture |
| APT-07 | P1 | A fault outside the modelled set was named as a look-alike, up to 95 % confident | A classifier can only choose among its classes |
| APT-08 | P2 | False anomaly for about 0.6 s after every restart | Transient allowance decayed before the shaft settled |
| APT-09 | P2 | Rate-of-change detector never fired in the Lab | Unsuitable test inputs: every fault grew over 14–30 s |
| APT-10 | P2 | NaN poisoned the twin; a step count could hang it | No validation at the engine's boundary |
| APT-11 | P2 | Integrator diverged above about 1 s; chamber faster than its stated time constant | Explicit Euler on first-order lags |
| APT-12 | P2 | Live regions updated 35 times in 8 s of a fault | The changing percentage was inside the status element |
| APT-13 | P2 | Two serious axe violations | Buttons inside `role="img"`; `role="status"` on a `<dl>` |
| APT-14 | P2 | Tables wider than the screen on phones, in seven modules | Fixed minimum widths; no small-screen form |
| APT-15 | P2 | Touch targets of 20–32 px | No coarse-pointer sizes for sliders, small buttons, links, markers |
| APT-16 | P2 | Sticky bars covered 54 % of a phone held sideways | Two-row module bar at every narrow width |
| APT-17 | P2 | Text claimed a turbine power balance the model does not solve | Text written ahead of the model |
| APT-18 | P2 | Residual convention, pressure reference and data-quality checks stated loosely | Text and code disagreed |
| APT-19 | P2 | Diagnosis percentages with no statement of what they are, and no calibration evidence | Not reported |
| APT-20 | P2 | EKF and UKF identical, unexplained | A true result, not explained |
| APT-21 | P2 | Missing and frozen samples not handled | No path for a sample that is not a number |
| APT-22 | P2 | An abrupt fault first reported as a noisy sensor | Noise estimate not robust to one step (found and fixed before release) |
| APT-23 | P3 | Visible label not in the accessible name of two controls | `aria-label` replaced the visible text |
| APT-24 | P3 | Auxiliary text of 9.5–10.5 px | Design-system sizes below the audit's floor |
| APT-25 | P3 | No cooling or hot-gas overlay in 3D; markers ignored reduced motion | Not implemented |
| APT-26 | P3 | Knowledge graph and readiness score not tied to the twin | Static data |
| APT-27 | P3 | Layout shift of 0.073 after load | Unreserved space for diagram and charts |
| APT-28 | P3 | "Written for: cto and chief architects" | A list lower-cased wholesale |
| APT-29 | P3 | Pressure ladder showed estimates without saying so | Not labelled |

## 4. Files changed

Uncommitted, relative to `8c47939`. 42 tracked files modified (1,715 lines added, 587 removed) and the new files below. All application changes are inside `src/components/propulsion-twin-advanced/`; no other page's code was touched.

| Group | Files |
| --- | --- |
| Simulation | `simulation/plant.ts` (exact lag), `twinCore.ts` (validation, scenario restart, settle hold, missing and frozen samples, robust noise estimate), `twinEngine.ts` (consistency check, isolation gating), `twinTypes.ts`, `ml.ts` (calibration report, input guard), `calibration.ts`, `estimators.ts` |
| State | `state/labStore.ts` (scenario injection, boot failure) |
| Drawing and charts | `ui/PropulsionSchematic.tsx` (two turbopumps; two arrangements; pixel-sized lettering; touch targets; signal path), `ui/charts.tsx` (pixel-true charts; inspect read-out) |
| New | `ui/Boundary.tsx` |
| Instruments | `live/shared.tsx` (diagnosis, fault picker, pending and failure state), `ControlRoom.tsx`, `AiLive.tsx`, `Detectors.tsx`, `DataQuality.tsx`, `TwinStates.tsx`, `EstimatorLab.tsx`, `PressureBudget.tsx`, `Prognostics.tsx`, `SensorChallenge.tsx`, `Identification.tsx`, `RcaWorkbench.tsx` |
| Widgets | `widgets/PressureMap.tsx`, `SystemExplorer.tsx`, `KnowledgeGraph.tsx`, `ReadinessScore.tsx`, `actions.tsx`, `ui/LiveSlot.tsx`, `ui/ModuleNav.tsx`, `three/Engine3D.tsx` |
| Content | `data/physics.ts`, `pipeline.ts`, `faq.ts`, `twin.ts`, `pressure.ts`, `fdir.ts`, `product.ts`; `sections/Foundations.tsx`, `TwinModules.tsx`, `Operations.tsx` (table roles and labels) |
| Styles | `advancedTwin.module.css` |
| New tests | `simulation/verification.test.ts` (43 tests), `AdvancedTwinPage.audit.test.tsx` (35 tests), `scripts/test-advanced-propulsion-twin.cjs` (159 browser checks) |
| Tooling | `package.json`: one script, `test:advanced-propulsion-twin:e2e`. No dependency added. |
| Documents | `docs/advanced-propulsion-twin-audit.md`, this file, `docs/advanced-propulsion-twin-review/` |

## 5. Before and after

In `advanced-propulsion-twin-review/`. "Before" is production; "after" is the local production build. Same viewport, same element.

| What | Before | After |
| --- | --- | --- |
| Pressure module on a phone: no schematic, then the portrait schematic | `before/phone-390-pressure-module.png` | `after/phone-390-pressure-module.png`, `after/phone-390-pressure-schematic.png`, `after/phone-320-pressure-schematic.png` |
| Pressure module on a portrait tablet | `before/tablet-820-pressure-module.png` | `after/tablet-820-pressure-module.png`, `after/tablet-820-pressure-schematic.png` |
| Hero schematic, desktop: one shaft and 6 px labels, then two turbopumps at 11 px | `before/desktop-1440-hero-schematic.png` | `after/desktop-1440-hero-schematic.png`, `after/desktop-1024-hero-schematic.png` |
| Hero schematic, phone | `before/phone-390-hero-schematic.png` | `after/phone-390-hero-schematic.png` |
| Pressure schematic, desktop | `before/desktop-1440-pressure-schematic.png` | `after/desktop-1440-pressure-schematic.png` |
| Chamber-pressure chart, desktop and phone | `before/desktop-1440-lab-chamber-chart.png`, `before/phone-390-lab-chamber-chart.png` | `after/desktop-1440-lab-chamber-chart.png`, `after/phone-390-lab-chamber-chart.png` |
| Data-quality table on a phone: sideways scroll, then cards | `before/phone-390-data-quality-table.png` | `after/phone-390-data-quality-table.png` |
| Confusion matrix on a phone | `before/phone-390-confusion-matrix.png` | `after/phone-390-confusion-matrix.png` |
| Diagnosis panel | `before/desktop-1440-lab-diagnosis.png` | `after/desktop-1440-lab-diagnosis.png` |
| Fault picker on a phone | `before/phone-390-lab-fault-picker.png` | `after/phone-390-lab-fault-picker.png` |
| An instrument that cannot be downloaded | `before/desktop-1280-instrument-load-failure.png` | `after/desktop-1280-instrument-load-failure.png` |
| Sensor sheet on a phone; 3D view with a sensor selected | – | `after/mobile-390-pressure-sheet.png`, `after/desktop-1440-3d.png` |

Machine-readable: `results-before.json` and `results-after.json` (every check, with measurements per viewport and module, and the axe findings), `run-before.txt`, `run-after.txt`, `run-after-simulation-rerun.txt`, `fault-coverage-matrix.json`, `cross-browser.txt`, `fundamentals-regression.txt`, `page-weight.json`.

## 6. Test commands and results

Run on 12 October 2026 on the final working tree.

| Command | Result |
| --- | --- |
| `npm test` | 110 files; 1,626 tests passed, 1 failed (SAT-01, pre-existing, another page) |
| of which `src/components/propulsion-twin-advanced` and its route | 191 passed, 0 failed |
| `npx tsc --noEmit -p .` | no errors |
| `npx eslint` on the 43 changed source files | 0 problems |
| `npm run lint` (whole repository) | 412 problems, none in a file changed here; they are in `src/app/internships` and nine other places and predate this work |
| `npx next build` | succeeds |
| `npm run test:advanced-propulsion-twin:e2e` (Chromium, local production build on port 3100) | 159 passed, 0 failed; no console error, page error or failed request outside the one check that induces them |
| the same script against production (baseline) | 110 passed, 49 failed |
| WebKit and Firefox pass (script kept with the audit's working files, log in the review folder) | 20 passed, 0 failed |
| `npm run test:rocket-engine-twin:e2e` | 16 passed, 0 failed |

One correction after the full run: an assertion inside the rate-of-change check looked for the label "Sensor noise", which the page never shows (the fault is called "Noisy pressure sensor"), so it could not have failed. It was corrected and the simulation section re-run on the same build: 22 of 22 (`run-after-simulation-rerun.txt`). The property it guards is also asserted by fault id in the unit tests.

No test was skipped, and none was mocked away: the unit tests run the real simulation, and the browser checks run a production build. Two things are simulated on purpose and named as such: the download failure in APT-01's check, and the unmodelled faults and telemetry gaps in `verification.test.ts`, which are applied through seams in the engine (`physicalSystem`, `acquire`) because the Lab cannot inject them.

Browser-audit checks by section: server 6; responsive 102; controls 19; simulation 22; performance 2; accessibility 6; integration 2.

## 7. Device and browser coverage

| Engine | Viewports | What ran |
| --- | --- | --- |
| Chromium (Playwright) | Phones 320 × 568, 360 × 740, 375 × 667, 390 × 844, 430 × 932, touch, 2× | Every module at every viewport: overflow, clipping, navigation, sticky bars, target sizes, lettering, tables, canvas. 180 module-and-viewport combinations |
| | Phones sideways 568 × 320, 844 × 390 | same |
| | Tablets 768 × 1024, 820 × 1180; sideways 1024 × 768, 1180 × 820; touch | same |
| | Desktops 1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080 | same, plus all interaction, simulation, performance and accessibility checks at 1440 and at 390 |
| WebKit (build 2359) | 390 × 844 touch; 1280 × 800 | Schematic arrangement and lettering; overflow and tables; sensor selection, focus and Escape; chart lettering; inject, replace, detect, isolate; console errors |
| Firefox (build 1543) | 390 × 844 touch; 1280 × 800 | same |

Not covered, and said plainly: no physical device was used; Safari on iOS and Chrome on Android were not run, only their engines' desktop builds at phone sizes; no person tested with a screen reader (axe, keyboard paths and instrumented live regions stand in for that); Windows high-contrast mode and 200 % text zoom were not checked.

## 8. Fault-coverage matrix

From `simulation/verification.test.ts`, written to `advanced-propulsion-twin-review/fault-coverage-matrix.json`. SIMULATED: one seeded run per row, 60 s after injection at 100 % throttle, injected 5 s into a healthy run. Times are seconds from injection. This is the envelope that was tested; it is not a claim about any fault outside it.

### Modelled physical and sensor faults (7 faults × 2 onsets × 3 severities = 42 runs)

| Fault | Onset | Detected at 30 / 60 / 100 % | Detection, s | Correctly isolated | Isolation, s | Wrongly named | Fitted severity error |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Oxidiser pump degradation | gradual | yes / yes / yes | 2.75 / 2.75 / 2.75 | 3 of 3 | 4.35 / 4.35 / 4.35 | never | ≤ 0.01 |
|  | abrupt | yes / yes / yes | 0.75 / 0.55 / 0.25 | 3 of 3 | 1.95 / 1.55 / 2.95 | never | ≤ 0.01 |
| Main fuel valve restriction | gradual | yes / yes / yes | 0.75 / 0.75 / 0.75 | 3 of 3 | 1.55 / 1.55 / 1.55 | never | ≤ 0.00 |
|  | abrupt | yes / yes / yes | 0.35 / 0.25 / 0.25 | 3 of 3 | 1.45 / 1.45 / 3.95 | never | ≤ 0.00 |
| Cooling-channel restriction | gradual | yes / yes / yes | 2.45 / 2.45 / 2.45 | 3 of 3 | 3.45 / 3.45 / 3.45 | never | ≤ 0.01 |
|  | abrupt | yes / yes / yes | 0.75 / 0.35 / 0.35 | 3 of 3 | 1.45 / 2.95 / 3.95 | never | ≤ 0.01 |
| Oxidiser feed pressure reduction | gradual | yes / yes / yes | 1.25 / 1.25 / 1.25 | 3 of 3 | 4.45 / 4.45 / 4.45 | never | ≤ 0.00 |
|  | abrupt | yes / yes / yes | 0.25 / 0.25 / 0.25 | 3 of 3 | 1.65 / 3.45 / 4.45 | never | ≤ 0.00 |
| Oxidiser injector restriction | gradual | yes / yes / yes | 1.65 / 1.65 / 1.65 | 3 of 3 | 2.45 / 2.45 / 2.45 | never | ≤ 0.00 |
|  | abrupt | yes / yes / yes | 0.45 / 0.35 / 0.25 | 3 of 3 | 1.45 / 1.45 / 2.95 | never | ≤ 0.00 |
| Combustion performance loss | gradual | yes / yes / yes | 4.75 / 4.75 / 4.75 | 3 of 3 | 5.95 / 5.95 / 5.95 | never | ≤ 0.01 |
|  | abrupt | yes / yes / yes | 1.35 / 0.75 / 0.45 | 3 of 3 | 2.45 / 1.95 / 2.45 | never | ≤ 0.01 |
| Chamber pressure sensor A drift | gradual | yes / yes / yes | 2.45 / 2.45 / 2.45 | 3 of 3 | 2.95 / 2.95 / 2.95 | never | ≤ 0.01 |
|  | abrupt | yes / yes / yes | 0.65 / 0.45 / 0.45 | 3 of 3 | 1.45 / 1.45 / 1.45 | never | ≤ 0.01 |

All 42 were detected, isolated as the fault injected, never named as another, and ended with the consistency check `explained` and HIGH confidence. Gradual faults are detected at the same time whatever their final severity, because they grow at the same rate and are caught early in the ramp.

### Data-path faults (4 faults × 3 severities = 12 runs)

| Fault | 30 % | 60 % | 100 % |
| --- | --- | --- | --- |
| Noisy pressure sensor | attributed in 9.55 s, score 62 % (MEDIUM); engine anomaly never declared | attributed in 2.45 s, score 90 % (HIGH); engine anomaly never declared | attributed in 1.25 s, score 90 % (HIGH); engine anomaly never declared |
| Telemetry packet delay | attributed in 1.05 s, score 80 % (MEDIUM); engine anomaly at 7.05 s | attributed in 1.05 s, score 95 % (HIGH); engine anomaly at 6.85 s | attributed in 1.05 s, score 95 % (HIGH); engine anomaly at 6.85 s |
| Timestamp misalignment | attributed in 1.05 s, score 87 % (HIGH); engine anomaly at 7.05 s | attributed in 1.05 s, score 95 % (HIGH); engine anomaly at 6.85 s | attributed in 1.05 s, score 95 % (HIGH); engine anomaly at 6.75 s |
| Replayed telemetry | attributed in 1.05 s, score 97 % (HIGH); engine anomaly at 0.05 s | attributed in 1.05 s, score 97 % (HIGH); engine anomaly at 0.05 s | attributed in 1.05 s, score 97 % (HIGH); engine anomaly at 0.05 s |

A noisy sensor is found by the data-quality layer and never raises an engine anomaly, which is the intended result. Packet delay and timestamp misalignment are attributed within about a second by direct checks; the residual detectors notice them only when the throttle next moves, about 7 s later.

### Faults the twin has no model of (9 runs)

| Fault applied to the simulated system | Detected, s | Nearest look-alike and its score | Standing conclusion |
| --- | --- | --- | --- |
| fuel pump head −15 % | 4.25 | Cooling-channel restriction, 57 % | unrecognised, LOW confidence, no cause named |
| fuel pump head −30 % | 2.65 | Combustion performance loss, 50 % | unrecognised, LOW confidence, no cause named |
| oxidiser main valve restriction ×1.6 | 2.55 | Oxidiser injector restriction, 87 % | unrecognised, LOW confidence, no cause named |
| fuel injector restriction ×2 | 7.55 | Cooling-channel restriction, 87 % | unrecognised, LOW confidence, no cause named |
| fuel tank pressure −2 | 4.05 | Combustion performance loss, 46 % | unrecognised, LOW confidence, no cause named |
| fuel line restriction ×3 | 6.95 | Cooling-channel restriction, 88 % | unrecognised, LOW confidence, no cause named |
| oxidiser feed line restriction ×4 | 1.25 | Oxidiser feed pressure reduction, 64 % | unrecognised, LOW confidence, no cause named |
| pump degradation + cooling restriction (each at 80 %) | 2.25 | Cooling-channel restriction, 54 % | unrecognised, LOW confidence, no cause named |
| valve restriction + combustion loss (each at 80 %) | 0.75 | Combustion performance loss, 59 % | unrecognised, LOW confidence, no cause named (after naming Main fuel valve restriction early on) |

Every one was detected, none was left with a named cause, and all ended `unrecognised` with LOW confidence. In the last row the valve restriction was named for a few seconds while it was the only fault large enough to see, and the conclusion was withdrawn when the second fault made the residuals inexplicable by any single modelled fault.

### Detectors

| Detector | True negatives tested | Fired, of the 42 modelled runs | Result |
| --- | --- | --- | --- |
| Threshold / redline | 120 s healthy; throttle steps over the whole range; shutdown and restart | 12 of 42 | No false alarm. Alarms in 0.3–3 s on five of seven faults at 100 % abrupt, and after 13–22 s on six gradual runs; silent, as intended, on faults that stay inside limits |
| Rate of change | same, and every gradual fault in the matrix (0 of 21) | 10 of 21 abrupt | Never fired on a gradual fault. Fired in 0.20–0.35 s on 10 of 21 abrupt runs: see APT-09 for which |
| Model residual | same | 42 of 42 | Fired in every run: 0.2–1.1 s abrupt, 0.4–5.1 s gradual |
| Statistical (CUSUM) | same | 42 of 42 | Fired in every run: 0.4–1.6 s abrupt, 1.5–4.3 s gradual; never before rate of change where both fired |
| Multivariate | same | 42 of 42 | Fired in every run: 0.2–1.4 s abrupt, 0.7–4.7 s gradual |
| Learned (PCA) | same; held outside its training conditions and on incomplete data | 26 of 42 | No false alarm. Misses the smaller faults, which is why it is one vote of four |
| Hybrid | One statistical detector alone does not declare | Two, or a redline, do | As specified, checked at every step of a run |

Missing data, frozen sensors, a failed classifier input and mode transitions are covered by the tests listed under APT-08, APT-10 and APT-21.

## 9. Model limitations and assumptions

The page states these where they apply; they are collected here.

- **Reduced order.** A lumped pressure network: two propellant branches with quadratic losses, pump head curves, cavitation through a suction-margin ratio, and first-order lags for shaft, chamber and coolant. No line dynamics, no combustion chemistry, no turbomachinery maps.
- **One shaft-speed state.** The drawing and the 3D model show two turbopumps; the model lumps their shafts. It cannot represent one slowing while the other does not.
- **No turbine power balance.** Shaft speed is scheduled from the throttle command; hot-gas pressures are prescribed from chamber pressure and speed. A fault acting through turbine power is outside the model.
- **Open-loop controller.** It does not trim on chamber pressure, so a fault stays visible in pressure instead of being absorbed.
- **Units.** Every pressure is absolute and given as a percentage of reference chamber pressure. No engineering units are implied. Every value is SIMULATED or a REFERENCE VALUE.
- **Numerics.** Fixed 50 ms step. Discretisation error against a 5 ms step through a 100 → 70 % throttle step: 0.99 % of reference chamber pressure at worst. Pressure budget closes to 0.05 % at every step of a transient.
- **Time constants are not identified.** The simulated system's differ from the model's by 8–15 %; this is why health checks are held for 2.75 s after a start.
- **Residual.** The twin judges estimated − expected, in standard deviations of its healthy scatter, widened in a transient. Observed − expected is shown beside it.
- **Fault envelope.** Seven physical and sensor faults and four data-path faults, one at a time, at 30–100 % of illustrative magnitudes, at 100 % throttle, in mainstage. Magnitudes are chosen to be visible in a lesson; they are not failure data.
- **Outside the envelope.** The consistency check compares steady signatures. It is held in a transient and while data quality is not GOOD; it needs up to 10 s to declare a pattern unrecognised; it reports two simultaneous faults as unrecognised without separating them; and a fault whose signature is indistinguishable from a modelled one in these 22 channels would be accepted as that one. None of the nine unmodelled cases tested was.
- **Learned models.** Trained and validated on this page's own simulator only. Validation accuracy 99.1 % on 320 conditions (ECE 0.034, Brier 0.021). On a harder simulated set with severities down to 5 %, accuracy is 91.7 % and stated confidences between 60 and 80 % are not reliable. Nothing here says how either model would do on an engine.
- **Data quality.** Latency, clock skew, repeated sequence, noise level, missing sample, flat-line and chamber-sensor consistency are implemented. Range and rate plausibility are not, and the page says so.
- **Not a certified system.** The page does not, and must not, present its AI as certifying propulsion safety. No security certification is claimed.

## 10. Performance

Emulated phone, Chromium: 390 × 844, 4× CPU slowdown, 1.6 Mbps down, 150 ms latency, cold cache. "Before" was measured against production, "after" against the local production build with the same throttling, so the two load times are not strictly like for like: production adds a real network path and serves Brotli, the local server serves gzip.

| Measure | Before | After |
| --- | --- | --- |
| Largest contentful paint | 1,656 ms | 1,092 ms |
| Total blocking time | 43 ms | 33 ms |
| Layout shift during load | 0 | 0 |
| Layout shift after load, opening a live module | 0.073 | 0 |
| Slowest of twelve interactions (open module, inject) | 136 ms | 136 ms |
| Long-task time in the measured interval of running simulation | 454 ms | 487 ms |
| DOM nodes after hydration | 6,602 | 6,559 |
| three.js in the first load | no | no |
| Simulation in the first load | no | no |

Page weight, measured identically for both origins (document plus every script and stylesheet it references, uncompressed and gzip −9):

| | Before | After |
| --- | --- | --- |
| Document, uncompressed / gzip / Brotli | 1005.5 / 180.2 / 91.9 KB | 1040.3 / 182.3 / 92.7 KB |
| Elements in the document | 6,593 | 6,878 |
| Scripts in the first load | 11 files, 819.5 KB, 245.7 KB gzip | 13 files, 834.5 KB, 252.5 KB gzip |
| Stylesheets | 4 files, 208.9 KB, 30.4 KB gzip | 4 files, 214.3 KB, 31.1 KB gzip |

The first load carries two more script files and 15 KB more script (6.8 KB gzip). The measured cause was not isolated chunk by chunk; the change that explains it is that the schematic became a client component so that it can measure its box, which ships its two arrangements as script as well as markup, together with the new error boundary. The document grew by 35 KB uncompressed (0.8 KB Brotli): the second arrangement of each schematic, and the labels and roles on table cells.

Simulation cost on the development machine: 0.13 ms per 50 ms step; the new consistency check 0.95 ms, twice a second; building the twin (identification, calibration, training) 250 ms, once, off the first load. Simulated time advances at one second per second with one clock after ten module changes, and a minute of running leaks neither nodes nor memory (browser checks).

## 11. Known failures and deferred work

- **SAT-01**, the one failing unit test, is in the satellite explorer and predates this page. Not changed.
- **Repository lint**: `npm run lint` reports 412 problems in files this work did not touch. Not changed.
- **Document size**: about 1 MB of HTML uncompressed (92 KB Brotli), because all twelve modules are rendered on the server and repeated in the framework's payload. Unchanged by this work, within the page's load budget, and the reason the tutorial reads completely without JavaScript. Splitting modules into routes would cut it and is a product decision.
- **Classifier calibration** is reported, not improved. Temperature scaling on a held-out simulated set would be the next step; it would still say nothing about real hardware.
- **Range and rate plausibility checks** on telemetry are not implemented.
- **Missing and frozen samples** are handled and tested but cannot be injected from the Lab.
- **Turbine power balance and separate shaft speeds** are not modelled, by decision: they could not be verified within this model's scope.
- **Consistency check during transients**: held, not evaluated. A dynamic version would run a second model per hypothesis.
- **Security headers**: production sends `Strict-Transport-Security` but no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy` or frame-ancestors policy on this route. That is a site-wide setting outside this page; it needs a decision that accounts for the analytics script. Within the page: no `dangerouslySetInnerHTML`, no `eval`, no network request, structured data escaped by the shared `JsonLd` component, simulated telemetry rendered only as React text, external links with `rel="noopener noreferrer"`, analytics parameters restricted to fixed identifiers, and error messages that do not show the error.
- **Not tested**: physical devices, a human screen-reader pass, 200 % zoom, high-contrast mode.
- **From earlier work, still open**: the Space page's LinkedIn preview image needs a re-scrape in LinkedIn's Post Inspector by the page owner; it cannot be verified from here.

## 12. GO / NO-GO

**GO**, with the following for the owner to look at before committing, because they change what a visitor sees:

1. The schematic is redrawn everywhere (hero, System, Pressure): two turbopumps, larger labels, sensor tags shown on selection instead of all at once, and a portrait drawing in columns under 528 px, which includes the hero at 1024 px wide.
2. Injecting a fault while another is active restarts the run from the healthy baseline. Charts lose their history at that moment.
3. Charts are taller (168 px plot) and carry an instruction line and a read-out.
4. Tables are cards on phones.
5. Every diagnosis panel carries a SIMULATED notice and a consistency-check line; "Unrecognised fault pattern" is a new possible verdict.
6. Health checks are held for 2.75 s after an engine start.
7. Opening the Architecture module now loads the simulation, so that the knowledge graph can show live state.

Conditions that would make it NO-GO, none of which holds: a failing check in the browser audit; a new failing unit test; a regression on the fundamentals page; a false alarm on a healthy engine in any tested transition.

To deploy: review, commit the working tree (`git status` lists it), push. To verify afterwards: `ADV_TWIN_BASE_URL=https://aerospace.ev.engineer npm run test:advanced-propulsion-twin:e2e`.
