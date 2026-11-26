# Next-Generation Wireless EV Charging Digital Twin

**Park. Drive. Charge. Automatically.** — Designed and developed by and for the EV.ENGINEER™ team.

Route: `/internships/wireless-ev-charging-digital-twin` (Proof of Concept card on `/internships`).
Status: engine and laboratories delivered 25 Nov 2026 (`a1e4679`); premium redesign Phases 0–2 (audit, immersive laboratory, flagship station scene) delivered the same day and Phase 3 (dynamic road) on 26 Nov, uncommitted at the time of writing — see IMPLEMENTATION_REPORT.md. Simulation only; nothing is experimentally validated.

## Documents

| Document | What it holds |
|---|---|
| This README | Implementation report, architecture, verification summary, limitations, next phases |
| [MODEL_REGISTRY.md](MODEL_REGISTRY.md) | Every model: equations, SI inputs/outputs, assumptions, validity, method, limitations, fidelity, checks (generated from `registry.ts`) |
| [FEATURE_COVERAGE.md](FEATURE_COVERAGE.md) | The brief's features against status: Planned … Analytically verified (generated from `coverage.ts`) |
| [ASSET_LICENSES.md](ASSET_LICENSES.md) | Provenance of every visual asset |
| [CURRENT_IMPLEMENTATION_AUDIT.md](CURRENT_IMPLEMENTATION_AUDIT.md) | Phase 0: verified strengths and weaknesses of the first version, root causes, before screenshots and measurements |
| [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) | What the redesign delivered, preserved, removed and left to do |
| [PREMIUM_EXPERIENCE_DESIGN.md](PREMIUM_EXPERIENCE_DESIGN.md) | Experience layers, laboratory layout, visual language, modes, phones |
| [CINEMATIC_STORYBOARD.md](CINEMATIC_STORYBOARD.md) | The twelve station stages and the eight demonstration chapters |
| [THREE_D_ARCHITECTURE.md](THREE_D_ARCHITECTURE.md) | Scene modules, rules, rendering pipeline, quality tiers, fallbacks |
| [SIMULATION_RENDERING_CONTRACT.md](SIMULATION_RENDERING_CONTRACT.md) | What the scene may read, bindings, time scales, fast-forward to a stage |
| [CAMERA_AND_ANIMATION_SYSTEM.md](CAMERA_AND_ANIMATION_SYSTEM.md) | Shots, who drives the camera, hand-over, view channels, reduced motion |
| [ENGINEERING_ASSET_REGISTRY.md](ENGINEERING_ASSET_REGISTRY.md) | Every 3D asset, its construction and which dimensions come from the model |
| [COMPONENT_INTERACTION_REGISTRY.md](COMPONENT_INTERACTION_REGISTRY.md) | How each of the 41 components is selected, framed and inspected |
| [SCIENTIFIC_VISUALIZATION.md](SCIENTIFIC_VISUALIZATION.md) | What each overlay shows and must not be mistaken for |
| [SCENARIO_REGISTRY.md](SCENARIO_REGISTRY.md) | Scenarios by environment with honest status |
| [SMART_PARKING_REQUIREMENTS.md](SMART_PARKING_REQUIREMENTS.md) | Environment 01, specified and planned |
| [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) | Frame rate, viewport share, memory, bundle sizes, browsers |
| [SCIENTIFIC_VALIDATION_REPORT.md](SCIENTIFIC_VALIDATION_REPORT.md) | What was verified in this phase; no model changes |
| [VISUAL_ACCEPTANCE_REPORT.md](VISUAL_ACCEPTANCE_REPORT.md) | The brief's visual criteria, verdicts and evidence |

Regenerate the two generated files after changing the registries:

```bash
node --experimental-strip-types scripts/wireless-twin-docs.mts
```

(the generator only imports `registry.ts` and `coverage.ts`; it is not part of the build).

## Reference application

The brief's benchmark, the Next-Generation Rocket Engine Digital Twin, is served by this repository (`src/components/rocket-engine-twin`, route `/space/rocket-engine-digital-twin`). Its source was reviewed: server-rendered hero and long-form content, a desktop-only lazy WebGL chunk, a zustand store, per-frame values outside React, timer-driven clocks, mode bar and component panels, capability gating from `satellite-explorer/lib/capabilities`. The live page shows anonymous visitors only its public preview, so its signed-in experience was reviewed through the code, not the live site. This twin reuses the capability gating and the per-frame-state pattern and goes further: a physics engine independent of rendering, four environments, nine sections and an in-browser verification suite.

## Architecture

```
src/lib/wireless-charging/        Engine: pure TypeScript, no React, no three.js
  math.ts           SI constants, complex numbers, elliptic integrals (AGM), seeded RNG, solvers
  coils.ts          Filament coupler (Maxwell, offset Neumann), ferrite images, field section, field lines
  circuits.ts       SS closed form; complex MNA for SS/SP/PS/PP/LCC–S/LCC–LCC; sweeps; FHA waveforms
  losses.ts         Litz/ESR, inverter, rectifier, converter loss models; exact thermal RC step
  battery.ts        Thevenin pack, OCV, Arrhenius R0, CC–CV acceptance, derating
  vehicle.ts        Road load and traction power
  chain.ts          Grid → battery power chain with exact energy closure and limits
  stateMachine.ts   19 normal phases, 13 abnormal states, safety precedence
  station.ts        Station simulation (arrival, control, chain, battery, thermal, sensors, messages)
  dynamic.ts        Electrified road (segments, delayed estimate, interlock, energy balance)
  autonomous.ts     Bicycle model, pure pursuit, EKF, station selection, reservation
  infrastructure.ts District day: PV, BESS, grid limit, tariffs, five policies
  network.ts        Seeded message bus (loss, latency, duplicates, outage, wrong key)
  sensors.ts        Instrument models and data modes
  registry.ts · components.ts · benchmarks.ts · equations.ts · content.ts · coverage.ts
src/components/wireless-ev-twin/  Interface
  WirelessTwinPage.tsx   Server-rendered page: hero, long-form content, leadership, FAQ
  TwinApp.tsx            Toolbar, nine sections, four modes, demonstration, quality, full screen
  lab/                   Immersive laboratory: shell, timeline, inspector, instrument registry
  story/                 Guided stages, demonstration chapters, guide controller, simulation control
  state/                 zustand store (UI + inputs), runtime (simulations + fixed-step clock), full screen
  three/                 WebGL scene (lazy chunk): vehicle/, station/, road/, world, overlays, camera rig, lighting
  env/ sections/ ui/     Panels, laboratories, controls, charts
src/app/internships/wireless-ev-charging-digital-twin/   Route, metadata, JSON-LD, tests
```

Boundaries:

- **Engine independent of rendering.** The scene and the panels only read simulation state; nothing is calculated in animation code. The engine runs headless in tests and in the Simulation, Research and Assurance labs.
- **Deterministic clock.** Fixed steps (station 50 ms, or 250 ms above 60×; road 1 ms; parking 20 ms; district 5 min). Thermal and battery states are integrated exactly over each step. Noise comes from seeded generators, so identical inputs give identical results (check B10).
- **Multirate, not cycle-by-cycle.** The 85 kHz carrier is represented by phasors under the first-harmonic approximation; the field animation is a slowed, labelled representation.
- **Per-frame state outside React.** `three/viewState.ts` and the runtime are read in `useFrame`; panels sample at 2–8 Hz.
- **Units.** SI internally (m, s, A, V, W, J, H, F, Ω, T); temperatures in °C (differences in K); SOC as a fraction; energy shown in kWh, power in kW.

## Verification

`npx vitest run src/lib/wireless-charging` runs 29 checks plus registry and state-machine tests (40 tests). `src/components/wireless-ev-twin/lab/laboratory.test.tsx` tests the stages, views, geometry and shell; `npm run test:wireless-ev-twin:e2e` drives a production build in a real browser (see PERFORMANCE_REPORT.md). The same 29 checks run in the visitor's browser from Engineering Assurance. Highlights:

- **A01–A10 (analytical):** elliptic integrals; the offset mutual-inductance formula against a brute-force Neumann double integral (≤1e-6); the dipole far-field limit; SS efficiency closed form against the mesh solution; nodal analysis against the closed form; the exact thermal step; on-axis loop field.
- **A05 energy closure:** grid power − (battery + every stage's loss) = 0 to 1e-9.
- **A12/A13 time-step sensitivity:** a 30 → 80 % session changes by 0.001 % between 0.5 s and 1 s steps; road energy per km by < 1 % between 1 ms and 0.5 ms.
- **B01–B16 (the brief's benchmarks):** zero coupling → zero power; unpowered transmitter → no energy; zero power → no SOC change; more resistance → less efficiency; battery limits respected; stationary vehicle = stationary behaviour; position-dependent coupling (including the sign change of M past the coupling null); segments never energise outside authorisation and cover; communication failures never bypass local protection; reproducibility; all three driving regimes; safety precedence; parking alignment; station selection; district energy balance; telemetry integrity.

Findings the checks surfaced and that the twin now shows: a sudden 20 cm sideways move during charging raises the primary current to ≈93 A at the old inverter angle and trips overcurrent (a real series–series behaviour); a 0.2 s uncompensated UWB delay leaves ≈18 cm of alignment error and halves the coupling.

Representative operating point (defaults, 11 kW, 150 mm gap, 40/−30 mm offset): k ≈ 0.37, coil-to-coil efficiency ≈ 98.3 %, grid-to-battery ≈ 93.7 %, gap-centre flux density ≈ 2 mT, ≈ 70 µT 0.2 m beyond the pad edge (model values, not an exposure assessment).

## What changed elsewhere in the repository

- `src/app/internships/InternshipsClient.tsx` — the Proof of Concept card (after Autonomous Airport Cargo EV).
- `src/components/ChromeGate.tsx` — the route brings its own header and footer.
- `src/app/sitemap.ts`, `src/lib/structured-data/internshipsGraph.ts`, `public/llms.txt` — the route listed.
- `src/app/internships/page.test.tsx` — tests for the card.

Access stays at the site default (optional sign-in prompt), like the other `/internships/*` sub-pages; the premium route table was not changed.

## Known limitations

- Analytical coupler (F1): ferrite as images scaled by a coverage factor; no FEM, shields, saturation or vehicle floor. Calibrate against measurements (the IoT & Data lab compares an imported dataset).
- Circular pads only; DD/DDQ/bipolar and rectangular road coils are planned.
- FHA circuits; no switching-level transients.
- Single road vehicle; no traffic interaction in the physics (the traffic in the 3D scene is ambient).
- Procedural 3D models, not photogrammetry or CAD; the city is stylised.
- Standards registry lists publications whose editions and applicability are not yet verified; no compliance is claimed.
- Sweeps and checks run on the main thread (yielding between steps); Web Worker offload is planned.
- Experiments are saved in the browser only.

## Next phases

1. Calibrate the coupler against measured coupling maps (Month 2 deliverable) and record F4 status per validated range.
2. DD and rectangular coils via a general polyline Neumann integrator; FEM map import.
3. Web Worker for sweeps, checks and field maps.
4. Multi-vehicle road traffic and fleet scheduling.
5. Hardware adapter for the low-voltage prototypes (LIVE data mode), kept separate from validation status.
6. Verified standards editions; hazard analysis for the safety requirements.
