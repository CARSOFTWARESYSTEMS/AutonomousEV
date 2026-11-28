# Smart Parking — Phase 4 implementation report

**Environment 01 — Smart Parking & Wireless EV Charging.** Designed and developed by and for the EV.ENGINEER™ team.

Delivered on 27 Nov 2026 in `/internships/wireless-ev-charging-digital-twin`. The first part was committed as `b2f4625`; the final fixes, tests, screenshots and this documentation set are uncommitted.

**Status: implemented in simulation and verified in software, awaiting the EV.ENGINEER™ team's acceptance.** A second engineering pass (27–28 Nov 2026) fixed the direct-link start-up, the 48-bay frame rate and the research comparison, and revised the POC BOM. Its findings, issue register and evidence are in SMART_PARKING_ENGINEERING_REVIEW.md, and the figures below are updated to it. Nothing physical exists and nothing is experimentally validated.

## 1. What was delivered

| Area | Delivered | Where |
|---|---|---|
| Environment and navigation | *01 Smart Parking* first on the rail and enabled. Shareable launch links (`env=parking`) and a *Copy a link* control. The theme, rail style, sign-in and the other four environments are unchanged | `state/launch.ts`, `lab/Launch.tsx`, `lab/Laboratory.tsx` |
| Facility simulation | Deterministic fixed-step simulation of the whole facility, from arrivals to release. 12 bays by default (8 conventional including 1 accessible, 4 wireless), 6–48 in the interface, 6-bay POC preset | `smart-parking/facility.ts`, `layout.ts` |
| Session lifecycle | 25 normal and 22 exceptional states with guarded transitions; refused transitions are logged, never applied | `lifecycle.ts`; SMART_PARKING_STATE_MACHINE.md |
| Identification | Simulated recognition pipeline with a declared error model; RFID, QR, visitor-ticket and operator fallbacks; regional synthetic plates (IN, US, CN) | `identification.ts`, `vehicles.ts` |
| Occupancy | Three sensors per bay, node debounce, Bayesian log-odds fusion with hysteresis; an uncertain bay is never assigned | `occupancy.ts` |
| Allocation and reservations | Five policies with hard constraints; atomic, versioned bay reservation; booking windows, holds, grace, no-shows | `allocation.ts`, `reservations.ts` |
| Queueing | Arrivals (homogeneous and time-varying), Erlang B, M/M/c/K, discrete-event simulation | `queueing.ts` |
| Access control | Barrier controller with obstruction interlock; tailgating detection; safe egress when the gateway is down | `barrier.ts`, `facility.ts` |
| Wireless charging | Each wireless bay runs its own Station (WPT-SIM-001); seven eligibility checks; energy counted once; safe stop before departure; *Explore Wireless Charging* and *Return to Smart Parking* with the parking state preserved | `charging.ts`, `state/runtime.ts`; SMART_PARKING_CHARGING_INTEGRATION.md |
| Environment and energy | Shelter thermal node, CO, smoke and gas, ventilation, lighting, alarms; canopy PV, storage, priority dispatch, energy ledger | `environment.ts`, `energy.ts` |
| Billing | Separate parking and charging ledgers in integer minor units; regional tariffs and locales; simulated payment adapters | `billing.ts` |
| IoT | Versioned MQTT namespace, schema, simulated broker (identity, TLS flag, ACLs, retained status, last will), idempotent ingestion, STALE marking, role-checked commands | `telemetry.ts`; SMART_PARKING_IOT_ARCHITECTURE.md |
| Data intelligence | Forecast baselines; rule-based and robust-statistical anomaly detection; reliability and uncertainty propagation | `forecast.ts`, `reliability.ts` |
| Research | Event-level model with a manual baseline and ten reproducible studies; replicated, paired comparison of six policies under six scenarios with confidence intervals and export (SP-RES-002); recording and replay | `experiments.ts`, `research.ts`; SMART_PARKING_EXPERIMENT_RESULTS.md |
| Verification | 39 checks (SP-A01–A13, SP-B01–B26), in the tests and in the visitor's browser | `checks.ts` |
| Traceability | 68 requirements in six classes, each with model, view, status, verification, evidence and physical status | `requirements.ts`; SMART_PARKING_REQUIREMENTS_TRACEABILITY.md |
| 3D facility | Shelter with cutaway and dimensions, bays and markings, gates and barriers, cameras, readers, guidance, sensors, fans, lighting, PV, equipment yard, landscape, vehicles driven by the motion model, overlays | `three/smart-parking/` |
| Guided learning | 18 stages with camera shots, metrics, equations, models and completion conditions; Explore, Learn, Engineer and Research modes; Smart Parking entries in the Physics & Mathematics lab (SP-MATH-001…012) | `story/parkingStages.ts`, `story/parkingControl.ts`, `equations.ts`, `content.ts` |
| Workflows | Driver sheet (reserve, session, pay, receipt); operator sheet (bays, sessions, devices, energy, environment, anomalies, audit, role-checked overrides); bay and vehicle inspectors | `env/ParkingPanels.tsx` |
| Inspector | 25 Smart Parking components in the twin's component registry | `smart-parking/components.ts` |
| Hardware interfaces | Adapter interfaces for every device class; six operating modes, SIL and replay available, the HIL modes shown as blocked | `adapters.ts` |
| Programme | Software phases 4A–4I and the 24-month physical programme as data, shown in Research mode | `programme.ts` |
| Documentation | 21 Smart Parking documents (5 generated), plus updates to the README, performance report and asset register | this folder |

## 2. What was preserved

- **Environments:** the Station, Dynamic, Autonomous and Infrastructure environments, their models, stages and demonstration chapters are unchanged. The original 32 checks still pass.
- **Station model:** it gained two commands, `arrive-parked` and `stop`, and the `holdAfterComplete` option. Without them it behaves exactly as before; direct tests and checks SP-B12–SP-B15 cover the additions.
- **Workshop:** the eight-month practical workshop content is unchanged. The Smart Parking material is additional.
- **Site-wide:** access control, the theme and the site's other pages are unchanged.

## 3. Evidence (27 Nov 2026)

| Evidence | Result |
|---|---|
| `npx vitest run src/lib/wireless-charging src/components/wireless-ev-twin src/app/internships/wireless-ev-charging-digital-twin` | 6 files, **149 tests passed** (second pass; 133 in the first) |
| Checks | 71 (32 twin + 39 Smart Parking), each its own test, all passing |
| `npx tsc --noEmit -p .` | No errors |
| ESLint on the twin's directories and its browser test | 0 errors, 0 warnings |
| `next build` | Succeeds |
| `npm run test:wireless-ev-twin:e2e` against the production build | **20 of 20 checks pass** (second pass), 8 of them for Smart Parking and direct links |
| Frame rate (Apple M1, Chromium on Metal, 1440 × 900) | 60 fps at 6, 12, 24 and 48 bays after the far level of detail (PERFORMANCE_REPORT.md) |
| Memory | No heap growth over the suite (87 → 87 MB and 65 → 65 MB in two runs); one WebGL context |
| Unattended tour | 18 stages completed in about 199 s with 0 console errors (development server) |
| Layout audit | 1440, 1280 and 390 px: no sideways scroll; no clipped scene labels after the edge rule (§4); screenshots in `screenshots/phase-4/` |

The full repository suite (`npx vitest run`), second pass: 2,503 passed, 3 failed and 1 skipped (the research generator, which runs on request). The three failures also occur on the committed baseline `80a8db6`, reproduced in a separate worktree, and are unrelated to the twin:

- **Satellite explorer:** the EXPLODE control test, which fails deterministically.
- **Battery-diagnostics toolkit:** two tests that time out at 5 s under full-suite load. They pass on their own (57 of 57).

Details are in SMART_PARKING_ENGINEERING_REVIEW.md §13.

## 4. Fixes made while finishing the phase

- **Charging-bay camera.** Stages 11, 12 and 17 and the X-ray view had used a low shot from behind the car, in which a near wheel filled a third of the frame. They now use an elevated rear three-quarter view from the aisle under the canopy edge: the whole vehicle in its bay and, in X-ray, the receiver over the pad.
- **Scene labels.** A label that the canvas edge would cut is now hidden rather than shown in part. This rule is in `three/labels.ts` and applies to every environment.
- **Direct tests for the Station additions:** `arrive-parked` skips only the approach, `stop` de-energises safely, `holdAfterComplete` holds the completed session, and a stop before energising never powers the pad.
- **Text corrections:**
  - the roof component's projection now matches the layout geometry;
  - a comment in `experiments.ts` cited the wrong check id;
  - two unused imports were removed.

## 5. Deviations from the brief

| Deviation | Reason |
|---|---|
| *Real-time occupancy detection* is stage 3, before the vehicle arrives | The bays' sensing is explained on an empty facility before the tour follows one vehicle; the other stages keep their order |
| The tour vehicle has a mud-covered plate and a booked wireless reservation (QR) | Makes the uncertain-plate → QR fallback and the reserved wireless bay happen every time, instead of depending on the random draw |
| The eight demonstration chapters were not extended with Smart Parking chapters | The chapters belong to the Station-led demonstration; Smart Parking has its own 18-stage tour |
| The interface allows 6–48 bays; studies run up to 1,000 | Interactive frame-rate limit (§7); the engine itself does not assume a size |
| Cloud data platform, database and APIs, multi-site operation, data residency and the HIL modes are *Designed*, not built | No server-side parking service or hardware exists; the twin runs in the browser |
| Chinese interface text is declared but not translated | Locale, currency and time-zone formatting are implemented; translation is planned |

## 6. The three timelines (SP-S04)

They are independent; none replaces another. The data is in `programme.ts` and is shown in Research mode.

1. **Eight-month practical workshop.** The existing programme in `content.ts`, unchanged.
2. **Software phases 4A–4I:**
   - 4A, 4C and 4G: *Implemented*.
   - 4B, 4D, 4E and 4F: *Tested*.
   - 4H (the physical POC development package: BOM, hardware, IoT, installation, safety and test plans): *Designed*.
   - 4I (verification and acceptance): *In progress*, pending the team's acceptance.
3. **24-month physical programme.** Twelve two-month milestones, from requirements and site survey (months 1–2) to final validation, documentation, potential publications and IP assessment (months 23–24). Each has its deliverables, verification and evidence. All are *Not started*.

## 7. Limitations

- **Simulation only.** No sensor, camera, barrier, charger or payment provider is connected, and no value is LIVE.
- **No trained models.** Recognition accuracy, fusion accuracy and forecast errors are properties of declared models and synthetic data (SMART_PARKING_AI_MODELS.md).
- **Assumed behaviour.** Driver behaviour in the manual baseline (cruising, patience) is a declared assumption. Single-seed study tables illustrate the method; claims need the replications in SMART_PARKING_TEST_PLAN.md §3.
- **Partly modelled faults:**
  - an outage in the cloud recognition placement is not modelled for recognition;
  - the *energy-consumption* anomaly is defined but not raised.
- **Performance.** Fixed in the second pass: 48 bays now holds 60 fps on the reference machine. Lower-powered GPUs, WebKit and Firefox are unmeasured.
- **Phone layout.** Camera shots do not adapt to portrait screens, as elsewhere in the twin. On a 390 px phone the stage card covers part of each shot, and scene labels are hidden in favour of the instrument strip.
- **Representative engineering.** The shelter, components and costs are representative. Structural, electrical and life-safety design need qualified engineers (SMART_PARKING_HARDWARE_PLAN.md). The BOM figures are planning ceilings, not quotations.
- **Not tested:** WebKit, Firefox and real phones.

## 8. Definition of done

| Criterion | Status |
|---|---|
| Every baseline requirement preserved and traced | Done: 38 of 38, plus 27 extensions and supplementary requirements |
| Engine verified before the 3D layer (Phase 4B gate) | Done: the checks pass headless |
| No duplicate wireless model; one identity chain; energy counted once | Done: SP-B12–SP-B15 |
| Safety never depends on the network | Done: SP-B07, SP-B09, SP-B24 |
| Synthetic data only; nothing labelled LIVE | Done |
| POC BOM within ₹1,00,000 | Done as a plan: ₹97,680 including contingency after the review added shipping, transport, spares and level shifting; nothing purchased |
| Documentation set | Done: 21 Smart Parking documents |
| Frame rate | 60 fps at 6–48 bays (second pass) |
| EV.ENGINEER™ team acceptance | **Pending** |
