# Smart Parking — engineering review and refinement (second pass)

**Environment 01 — Smart Parking & Wireless EV Charging.** Reviewed and refined 27–28 Nov 2026 on `main` at `80a8db6`. The changes are uncommitted and listed in §14.

Everything reported here is software evidence from simulation. Nothing is experimentally validated, no hardware exists, and no gate is approved.

## 1. Scope and method

**Reviewed:**

- **Commits:**
  - `b2f4625` (Smart Parking, first part);
  - `e9272e9`, a Trust Center post, unrelated and untouched;
  - `80a8db6`, which committed the rest of the first pass.
- **The working tree:** clean at the start.
- **Documentation:** every Smart Parking document, and the twin's performance, asset and assurance documents.
- **Code:** the engine, scene and interface code of environment 01.

**Methods:**

- Code reading.
- Headless measurements.
- A production-build profile with draw-call counting.
- Browser checks at 1440 × 900, 1024 × 768 and 390 × 844.
- Replicated simulation studies.
- A reproduction of the known test failures on the committed baseline, in a separate worktree that was removed afterwards.

## 2. Summary

The simulation was sound in its models and safety logic. The review found four defects that mattered and fixed them:

1. **Direct links:** a direct link opened on the Station before switching.
2. **Research:** the policy comparison was neither fair nor replicated.
3. **Performance:** the 48-bay frame-rate shortfall had been attributed to the GPU without profiling; the real cost was draw-call submission by the pooled vehicle models.
4. **POC BOM:** it missed shipping, transport, spares, logic-level shifting and a correct current measurement.

Smaller issues are fixed or recorded in §3. The EV.ENGINEER™ landing page could not be updated: its source is not in this repository or on this machine (§5).

## 3. Issue register

**P1 (fixed):**

| ID | Issue | Evidence | Resolution | Status |
|---|---|---|---|---|
| ISS-01 | A direct link (`env=parking`) showed the Station laboratory during initialisation. Without WebGL the link was ignored entirely | The live prerendered HTML for `env=parking` contained "02 Station", the Station stage card and its instruments. `useLaunchLink` applied `env` only after the WebGL check | §4 | Fixed, tested |
| ISS-02 | The policy comparison was unfair and a single run. Policies that were not charging-aware lost the wireless bays for conventional cars while the manual baseline kept them; "normal" demand (7/h) was above capacity | `experiments.ts · runEventLevel`; one seed | Replicated, paired SP-RES-002 on equal infrastructure (§8) | Fixed, tested (SP-A13) |
| ISS-03 | 48 bays ran at 50–58 fps; the cause was assumed to be the GPU | Profile: pooled vehicles were 52 % of meshes and 73 % of triangles; 1,852 draw calls a frame | Far level of detail (§6) | Fixed, measured |
| ISS-04 | The POC BOM omitted shipping, transport, spare controllers and 3.3/5 V level shifting; the ACS712 cannot measure coil current at the link frequency; the 12 V supply margin was thin | BOM review | BOM revised to ₹97,680; power budget and corrections (SMART_PARKING_POC_READINESS.md) | Fixed in design; quotations pending |

**P2:**

| ID | Issue | Evidence | Resolution | Status |
|---|---|---|---|---|
| ISS-05 | Scene labels near an edge were hidden (first pass) and could overlap each other or sit under panels | Label audit | Viewport-aware placement with priority and collision avoidance (§7) | Fixed |
| ISS-06 | The recognition stage was titled "AI vehicle recognition" without saying it was simulated | Stage text | Retitled *AI vehicle recognition (simulated)* | Fixed |
| ISS-07 | Typical 1:16 RC cars turn at 0.5–0.8 m against a scaled 0.27 m: they cannot reverse into the scaled bays | Scale check (READINESS §2) | Bay manoeuvres placed by hand or on a guide; chassis width ≤ 125 mm | Open: hardware decision |
| ISS-08 | The landing page still presents Smart Parking as a planned concept and links it with a presentation-style URL | Live page `www.ev.engineer/ev-engineer#wireless-ev-charging` | Change specification in §5; source repository needed | Open |
| ISS-09 | The traceability had no architecture or limitation columns | Generated matrix | SMART_PARKING_EVIDENCE_MATRIX.md (generated) | Fixed |
| ISS-10 | After switching environments, a refresh or back navigation reopened the link's original environment | Browser check | The address follows the environment (`replaceState`, no new history entry) | Fixed, tested |

**P3:**

| ID | Issue | Evidence | Resolution | Status |
|---|---|---|---|---|
| ISS-11 | A cloud outage in the cloud AI placement is not modelled for recognition | `facility.ts` | Documented (ARCHITECTURE §8) | Open |
| ISS-12 | The *energy-consumption* anomaly is defined but never raised | `forecast.ts`, `facility.ts` | Documented | Open |
| ISS-13 | zh-CN interface text is declared but not translated | `billing.ts · LOCALES` | Documented | Open |
| ISS-14 | SP-A07 checks the billing arithmetic with the IN tariff only | `checks.ts` | Documented | Open |
| ISS-15 | Camera shots do not adapt to portrait screens (true of every environment) | 390 px screenshots | Documented | Open |
| ISS-16 | Far vehicles are clickable but show no hover highlight | `Vehicles.tsx · FarVehicles` | Documented | Open (minor) |
| ISS-17 | GPU time not isolated with timer queries; WebKit, Firefox and lower-powered GPUs not measured | Profile scope | Documented (PERFORMANCE_REPORT) | Open |
| ISS-18 | Two repository tests fail outside the twin: one deterministic, two load-dependent | §13 | Not modified (outside scope) | Open, unrelated |

## 4. Direct URL verification

**Cause.** The route is prerendered once for every query string, so the server cannot know `env`. The laboratory shell rendered the store's default environment (the Station). The client applied `env` in an effect that waited for the WebGL capability check, so visitors saw the Station first, and a browser without WebGL never switched.

**Fix:**

- **Neutral server render.** The server and hydration render show the existing *Preparing the 3D laboratory* state, with no environment-specific content: no stage card, instruments, caption, timeline, header chip or rail selection (`state/hydrated.ts`, `Laboratory.tsx`, `TwinApp.tsx`).
- **Environment before first paint.** `useLaunchEnvironment` (`lab/Launch.tsx`) applies `env` in a layout effect, before the first client paint, independent of WebGL.
- **Address in step.** Once a link has named an environment, switching updates `env` with `history.replaceState` (supported by this Next.js version, per its documentation), so refresh and copied addresses stay correct. Back and forward to an entry with another `env` open that environment.

**Results (development server, then the production build in the acceptance suite):**

| Check | Result |
|---|---|
| Prerendered HTML for `env=parking` (JavaScript disabled) | Only *Preparing the 3D laboratory*. No Station card, chip or rail selection (`url-prerendered-neutral.jpg`) |
| Direct navigation, all five environments | Correct stage card (`01 · Smart Parking` … `05 · Infrastructure`), header chip and rail selection |
| Any other environment shown during initialisation | None, for all five (a mutation observer records every environment name the page ever shows) |
| Initial camera and inspector | The environment's stage 1 shot and its stage content |
| `sound=1` | The single *Begin with sound* control appears (browsers need a user action) |
| `captions=0`, `demo=0` | Applied |
| Switch to Station, then refresh | Reopens the Station (`env=station` in the address) |
| Leave the page, then Back | Returns to the Station; Forward returns to the other page |
| Without WebGL (unit test, jsdom) | Each of the five links opens its environment |
| Regression tests | 9 unit tests (laboratory.test.tsx) and 1 browser check; 6 of the unit tests fail when the fix is disabled |

## 5. EV.ENGINEER™ landing page (not changed: source not found)

The page `https://www.ev.engineer/ev-engineer#wireless-ev-charging` is a separate Next.js deployment, and its `WirelessFlagship` component is not in this repository. A search of this machine, of both GitHub accounts' repository lists and of GitHub code search found no source. Nothing was changed. The change to apply, once its repository is available:

1. **Status:** replace *Concept · planned environment* / *Planned* / *Specified · Phase 4. The animation is a concept of the planned environment.* with *Simulation implemented · Physical POC planned*. Add the note: *Interactive simulation: 18 guided stages, synthetic data, nothing experimentally validated. The six-bay physical POC is designed, not built.*
2. **CTA:** set *Explore Smart Parking* to the canonical link `https://aerospace.gamyaa.in/internships/wireless-ev-charging-digital-twin?fs=0&sound=1&narration=0&captions=0&demo=0&env=parking#research-laboratory`. The current one uses the presentation set (`fs=1&narration=1&captions=1`).
3. **Layout:** one large animation per row, on the left, with the engineering content on the right, and at most two animations per row. Reuse the existing Smart Parking sequence animation (approach → identified → allocated → entry → guided → parked → charging ready) and the theme.
4. **Keep:** the Station, Dynamic, Autonomous and Infrastructure links and all other content unchanged.

## 6. Performance: before and after

Full method and data are in PERFORMANCE_REPORT.md §Smart Parking and `data/smart-parking-performance-profile.json`. The set-up was a production build, Apple M1, Chromium 151 on ANGLE Metal, 1440 × 900 at device pixel ratio 1, a 5 s warm-up and a 10 s window.

| Same session, A/B | Before | After |
|---|---|---|
| 48 bays, Auto | 56.9 fps, p95 32.5 ms | 60.1 fps, p95 17.1 ms |
| 48 bays, Balanced | 52.7 fps, p95 33.4 ms | 60.1 fps, p95 17.0 ms |
| 48 bays: draw calls, triangles, main thread per frame | 1,852, 7.8 M, 8.7 ms | 639, 1.46 M, 5.1 ms |
| 24 bays, Balanced | 46.2 fps, p95 34.1 ms | 60.1 fps, p95 17.3 ms |
| 12 bays | 60 fps (666 draw calls) | 60 fps, unchanged by design |
| 6 bays | 60 fps | 60 fps |
| Scene restart (load), 6–48 bays | 0.21–0.24 s | 0.21–0.24 s |
| Heap over the acceptance suite | 65–87 MB, no growth | 69 → 69 MB, no growth |

**Investigated and not changed, because the evidence did not support it:**

- **Device pixel ratio:** identical across tiers at DPR 1.
- **Label projection:** under 0.3 ms of layout and style per frame.
- **React re-rendering:** sampled at 2–8 Hz.
- **Simulation frequency:** 34 µs per step at 12 bays.
- **Shadow-map size:** the High and Balanced tiers differ only in shadow-map size, and both reach 60 fps after the change.

## 7. Animation and label refinement

- **Vehicle journey** (verified in code and in the tour):
  - acceleration 1.1 m/s², with a 1.6 m/s² braking envelope looked ahead of slower segments, stop lines and held lane zones (3.5 m/s² cap);
  - kinematic-bicycle paths with the minimum radius;
  - steering eased;
  - wheel spin from the distance travelled, with a radius of 0.355 m matching the drawn wheel, so no slip;
  - reversing out of a bay and turned-away U-turns;
  - the parking position with its declared 30 mm × 35 mm spread;
  - charging only after the seven eligibility checks and the Station's own sequence;
  - a safe stop before departure.
- **Stages 11, 12 and 17** keep the corrected rear three-quarter shot: the whole vehicle in its bay. In X-ray (stage 12) the receiver is seen over the ground pad, with that bay's charging label. Checked at desktop, tablet and mobile (`*-12-charging-xray.jpg`).
- **Scene labels** (`three/labels.ts`, used by every environment):
  - a label is hidden only when its anchor is behind the camera or outside the view;
  - otherwise it is moved inside the view;
  - labels are placed in priority order, each nudged to the nearest position clear of the others and of the stage card, instruments, caption, timeline and legends.

  Audit across the shelter, occupancy, energy, IoT and environment views and stage 12, at 1440 and 1024 px: every label with an on-screen anchor visible; 0 overlaps, 0 clipped, 0 under a panel. The Station and Dynamic views were also checked: no overlaps.
- **No new camera options or controls** were added.

## 8. Research methodology and results

SP-RES-002 (`research.ts`, registered, check SP-A13) compares six policies:

- manual;
- first available;
- nearest;
- charging-compatible;
- SOC-aware;
- energy-aware.

The comparison is built as follows:

- **Equal resources:** the same bays, chargers, PV, grid limit and tariff for every policy.
- **Paired seeds:** the same arrivals, vehicles and patience for every policy.
- **Replications:** 50 seeds.
- **Six scenarios:** normal, peak, charging-constrained, sensor faults, communication loss and charger outage.
- **Metrics:** throughput, search time, queue waiting (mean and 95th percentile), utilisation, request and energy fulfilment, energy delivered, peak grid import, solar utilisation, Jain fairness, revenue under the stated IN tariff, and fault recovery.
- **Statistics:** each with mean, SD, 5th, 50th and 95th percentiles and Student-t intervals, plus paired differences against manual parking.

Results, configuration, seeds, assumptions and limitations are in SMART_PARKING_EXPERIMENT_RESULTS.md, regenerated by `scripts/smart-parking-research.test.ts`. They are exportable from Research mode (*Replicated policy comparison → Download results*, and in *Export all*). The headline findings are in SMART_PARKING_TEST_PLAN.md §2.1. All are simulated and make no real-world claim.

## 9. AI implementation review

**No machine-learning model exists in the application.** Each component is classified in SMART_PARKING_AI_MODELS.md §8:
- **Simulated recognition:** vehicle identification.
- **Deterministic rules:** the access decision, the policies and the anomaly rules.
- **Statistical methods:** fusion, forecasting baselines and robust anomaly statistics.
- **Mathematical optimisation:** multi-objective allocation and least-laxity scheduling.

The future roadmap, with data, candidate models and acceptance gates declared before training, is in §9 of the same document. No safety function depends on any of them (SMART_PARKING_THREAT_MODEL.md §3).

## 10. Physical POC readiness and BOM

SMART_PARKING_POC_READINESS.md covers:

- **BOM corrections:** ₹97,680 including contingency, ₹2,320 under the ceiling. These are estimated retail prices including GST, not quotations.
- **1:16 scale check:** the core is 1.68 × 1.16 m.
- **Power budget:** 73 W peak on the 12 V bus.
- **Modular, transportable design:** two 1.22 m modules.
- **Hardware acceptance criteria.**
- **Supervised low-voltage procedures.**
- **Electromagnetic similarity:** geometric scaling does not provide it.

**Verdict:** not ready to procure until quotations and the hazard review exist. The full-scale pilot estimate (₹1.1–2.3 crore, ±50 %) is unchanged and is not a budget.

## 11. Hardware-connected twin

SMART_PARKING_HARDWARE_INTEGRATION_SPEC.md specifies:

- **Data modes:** Simulation, Live telemetry, Replay and Comparison.
- **Interfaces:** sensor interfaces, the edge controller and the telemetry gateway.
- **Data handling:** device identity, schema extensions, timestamp synchronisation, data quality and missing-data rules, historical experiment storage, calibration records and replay.
- **POC path:** a telemetry-only, stepwise path for the six-bay POC.

The web application never sends a command to a physical device, and the POC enforces its safety locally.

## 12. Cybersecurity and assurance

SMART_PARKING_THREAT_MODEL.md covers:

- **Trust boundaries:** B1–B6.
- **Threats:** ten (T1–T10), covering spoofing, manipulated occupancy, unauthorised access, replay, compromised sensors, communication failure, false charging data, denial of service and data exposure.
- **Safety-function review:** barrier interlock, charging authorisation, safe departure, alarms, gateway loss and the emergency stop.

The seven engineering review gates are unchanged:

| Gate | Status |
|---|---|
| MCR | Ready for review |
| SRR | Evidence in preparation |
| PDR | Evidence in preparation |
| CDR | Not started |
| TRR | Not started |
| VRR | Not started |
| FRR | Not started |

None is marked approved. The governance template stays blank; completed records are kept outside the repository.

## 13. Regression test report

| Suite | Result |
|---|---|
| Smart Parking engine (`smart-parking.test.ts`) | 16 passed |
| Wireless twin: engine, checks, laboratory, page (`src/lib/wireless-charging`, `src/components/wireless-ev-twin`, the route) | **149 passed** (6 files); 71 checks (32 + 39) |
| Browser acceptance, production build (`scripts/test-wireless-ev-twin.cjs`) | **20 of 20 passed**; 60 fps on every measured view including Smart Parking at 12 and 48 bays; heap 69 → 69 MB |
| Type check (`tsc --noEmit`) | No errors |
| ESLint (twin directories and changed scripts) | 0 errors, 0 warnings |
| Production build (`next build`) | Succeeds |
| Full repository (`npx vitest run`) | 2,503 passed, 3 failed, 1 skipped (the research generator, which runs on request) |

**Known failures, reproduced on the committed baseline** (`80a8db6`, in a temporary worktree, since removed):

| Test | On the baseline | On the current tree | Nature |
|---|---|---|---|
| `satellite-explorer/ui/ui.test.tsx` › EXPLODE | Fails alone and in the full suite (expects `data-track-event="exploded_view_open"`, receives none) | Fails the same way | Deterministic; unrelated (last changed in `9604003`) |
| `ev-battery-health-diagnostics-toolkit/page.test.tsx` › Real Vehicle Diagnosis | Fails in the full suite (5 s timeout) | Fails in the full suite; passes alone (57 of 57 in the folder) | Load-dependent timeout |
| `ev-battery-health-diagnostics-toolkit/release.test.tsx` › analytics privacy | Fails in the full suite (5 s timeout) | As above | Load-dependent timeout |
| `space/space-station/page.test.tsx` › one H1 | Failed once in the baseline full run, which was taken under heavier load (5 s timeout) | Passed | Load-dependent timeout |

No unrelated code was modified to make these pass.

**Generated build files:**
- `next build` rewrites `next-env.d.ts`; it was restored after every build.
- `.next/` is ignored.
- The working changes contain only source, tests, scripts and documentation.

## 14. Changed files (uncommitted)

**Application:**

- `src/components/wireless-ev-twin/state/hydrated.ts` (new): the hydration flag.
- `src/components/wireless-ev-twin/lab/Launch.tsx`: `useLaunchEnvironment` (environment before first paint; address in step; back/forward).
- `src/components/wireless-ev-twin/TwinApp.tsx`: uses it; header chip after hydration.
- `src/components/wireless-ev-twin/lab/Laboratory.tsx`: environment chrome after hydration; rail selection after hydration; label obstacles.
- `src/components/wireless-ev-twin/lab/Timeline.tsx`: label obstacle.
- `src/components/wireless-ev-twin/three/labels.ts`: viewport-aware placement with collision avoidance.
- `src/components/wireless-ev-twin/three/smart-parking/Vehicles.tsx`: far level of detail (replaces the box massing).
- `src/components/wireless-ev-twin/three/vehicle/Vehicle.tsx`: exports the shared body geometry and wheel centres.
- `src/components/wireless-ev-twin/env/ParkingPanels.tsx`: replicated comparison in Research mode, export, the illustrative single-run label.
- `src/components/wireless-ev-twin/story/parkingStages.ts`: recognition stage title.

**Engine:**

- `src/lib/wireless-charging/smart-parking/research.ts` (new): SP-RES-002.
- `checks.ts` (SP-A13), `registry.ts` (SP-RES-002), `requirements.ts` (SP-S08–SP-S10), `experiments.ts` (comment).

**Tests and scripts:**

- `smart-parking.test.ts`: research tests.
- `laboratory.test.tsx`: direct-link tests.
- `scripts/test-wireless-ev-twin.cjs`: two new browser checks.
- `scripts/wireless-twin-docs.mts`: evidence matrix.
- `scripts/smart-parking-research.test.ts` (new): results generator.
- `scripts/profile-smart-parking.cjs` (new): profiler.

**Documentation:**

- **New:**
  - `SMART_PARKING_ENGINEERING_REVIEW.md` (this file);
  - `SMART_PARKING_EVIDENCE_MATRIX.md` and `SMART_PARKING_EXPERIMENT_RESULTS.md` (both generated);
  - `SMART_PARKING_POC_READINESS.md`, `SMART_PARKING_HARDWARE_INTEGRATION_SPEC.md`, `SMART_PARKING_THREAT_MODEL.md`;
  - `data/smart-parking-research-results.json`, `data/smart-parking-performance-profile.json`;
  - `screenshots/phase-4-refinement/` (24 images).
- **Updated:**
  - README, PERFORMANCE_REPORT;
  - SMART_PARKING_REQUIREMENTS, _TEST_PLAN, _AI_MODELS, _POC_BOM, _IMPLEMENTATION_REPORT;
  - the regenerated MODEL_REGISTRY, SMART_PARKING_MODEL_REGISTRY and _REQUIREMENTS_TRACEABILITY.

## 15. Screenshots

All are in `screenshots/phase-4-refinement/`:

- **Desktop 1440 × 900:**
  - stages 1, 5, 12 (X-ray) and 17;
  - the shelter and energy views;
  - the replicated research table.
- **Tablet 1024 × 768:** the same set.
- **Mobile 390 × 844:** stages 1, 5, 12 and 17, and the research table.
- **Labels:** at 1440 and 1024 px.
- **48-bay overview:** before and after the level of detail.
- **Prerendered page:** the neutral laboratory state.

No sideways scroll occurred at any size, and no page errors.

## 16. Remaining limitations

- **No physical evidence.** Simulation only. No sensor, camera, barrier, charger or payment provider is connected, and nothing is experimentally validated.
- **No machine learning.** Recognition is simulated, and no ML model runs.
- **Research model simplifications.** It has no vehicle motion, aisle congestion or storage dispatch, and its demand and driver behaviour are declared assumptions.
- **Untested platforms.** The frame-rate results are for an Apple M1 in Chromium. Lower-powered GPUs, WebKit, Firefox and real phones are untested.
- **Open register items:** ISS-07, ISS-08 and ISS-11 to ISS-18.

## 17. Release-readiness recommendation

- **Software (this twin):** ready to release as an educational and research simulation, once the EV.ENGINEER™ team has accepted it visually. Every value is labelled; the direct-link and frame-rate defects are fixed and covered by tests. Nothing here supports a physical-performance or validation claim, and none is made.
- **Landing page:** apply the specification in §5 once its repository is available.
- **Physical POC:** not ready to procure. Obtain quotations, hold the hazard review, decide ISS-07, then build Module A first.
- **Hardware-connected twin:** a specification only. Implement it in the next phase along the telemetry-only path.
