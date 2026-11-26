# Feature coverage

Generated from `src/lib/wireless-charging/coverage.ts` (the same list the Engineering Assurance view shows). Statuses: Planned · Designed · Implemented · Tested · Analytically verified · Experimentally validated · Blocked. Nothing is experimentally validated: no measurements exist yet.

Counts: Tested 27 · Implemented 20 · Planned 11 · Designed 4 · Analytically verified 3 · Blocked 1

| Area | Feature | Status | Note |
|---|---|---|---|
| Integration | Proof of Concept card on /internships and route | Tested |  |
| Integration | Self-contained page, existing auth and design system untouched | Tested | Default optional-login access, like the other /internships sub-pages. |
| Integration | Research & Project Leadership section (Lead Researcher highlighted with an animated border) | Tested |  |
| Presentation | Full-screen research environment (Fullscreen API, overlay fallback, F and Esc); the scene grows to 85 % of the display | Tested | scripts/test-wireless-ev-twin.cjs. |
| Presentation | Cinematic opening: poster rendered from the twin's own scene, minimal copy, Enter Research Laboratory and Watch Technology Demonstration | Tested |  |
| Presentation | Immersive laboratory: environment rail, stage card, instrument strip, inputs drawer, inspector on demand, cinematic timeline | Tested | Scene covers 79 % of a 1440 × 900 desktop. |
| Presentation | No-WebGL message never in the server HTML; context-loss fallback to the 2D field view | Tested |  |
| Guided sequence | Twelve engineering stages for the station, each with camera, view, components, telemetry, physics, models and narration | Tested |  |
| Guided sequence | Auto-advance in Explore on engineering events; pause on interaction; resume; no unexpected resets | Tested |  |
| Guided sequence | Eight-chapter technology demonstration across the environments | Implemented | Chapter 1 shows arrival and identification at the station; the smart parking shelter scene is planned. |
| Guided sequence | Narration (browser speech synthesis), captions and ambience, off until chosen | Implemented |  |
| Guided sequence | Professionally recorded narration | Planned |  |
| 3D | Lofted unbranded vehicle with glass, pillars, seams, mirrors, interior, multi-spoke wheels, brakes, suspension, subframes, battery modules, rear drive unit, receiver electronics and HV cabling | Implemented | Representative engineering geometry, not a production model. |
| 3D | Ride height from the simulated air gap; steering from the kinematic model; wheels roll by distance | Tested |  |
| 3D | Layered pads: enclosure, FOD sense coils, potting, Litz winding on its former, ferrite, insulation, shield, base; exploded away from the true air gap; quarter cutaway | Implemented |  |
| 3D | Power cabinet with protection, PFC, DC link, SiC modules on a cold plate, gate drivers, C₁ bank, controllers, gateway, cooling | Implemented |  |
| 3D | Solar shelter, identification camera, positioning anchors, field probe, transformer, storage, apron and access road | Implemented |  |
| 3D | Licensed photogrammetry or CAD vehicle assets | Planned | No external assets used; see ASSET_LICENSES.md. |
| 3D | Fifteen views: exterior, X-ray, chassis, underbody, battery, receiver, vehicle exploded, power electronics, cutaway, pads exploded, alignment, field, energy, thermal, IoT | Implemented |  |
| 3D | Camera director: composed shots, follow shots, eased moves, hand-over to the visitor, reset, framing from component bounds, reduced motion | Tested |  |
| 3D | Component selection with three-level inspector, highlight, isolation and explode | Tested |  |
| 3D | Studio backdrop for inspection views; roof fades when it blocks the line of sight | Implemented |  |
| Dynamic | Premium electrified highway: corridor, embedded pad modules with controller states, section cut with layers and duct bank, interlock and request window, coupling chart, roadside and top-down cameras | Tested | Nine stages; scripts/test-wireless-ev-twin.cjs. |
| Dynamic | Three energy outcomes as stages, read over a whole 200 m zone period | Tested | Each preset's regime is unit-tested. |
| 3D | Premium scenes for the autonomous and infrastructure environments | Designed | They use the new vehicle and lighting; their own redesign is Phases 5 and 6. |
| Smart Parking | IoT & AI-Based Smart Parking Shelter environment | Designed | Requirements in SMART_PARKING_REQUIREMENTS.md; shown as planned. |
| Architecture | Configurable ground and vehicle chain with every stage's loss | Analytically verified | A05 energy closure. |
| Station | 19-step state machine with 13 abnormal states and safety precedence | Tested | B09, B12, unit tests. |
| Station | Alignment, air gap, frequency, power, turns, capacitance, battery, ambient, tariff, grid controls | Implemented |  |
| Station | Adaptive resonance within 79–90 kHz | Implemented |  |
| Station | Overcurrent transient on sudden coupling change (SS) | Tested |  |
| Dynamic | Segmented road, delayed noisy position, three handover strategies, interlock | Tested | B07, B08. |
| Dynamic | Charging, energy-neutral and discharging regimes | Tested | B11. |
| Dynamic | Multiple vehicles and traffic density | Planned |  |
| Dynamic | Rectangular, DD, DDQ and bipolar road coils | Planned |  |
| Autonomous | Bicycle model, pure pursuit, EKF with UWB, delay compensation, precision positioning | Tested | B13. |
| Autonomous | Station selection, reservation exchange, mission energy | Tested | B14. |
| Autonomous | Fleet scheduling of many autonomous vehicles | Designed | District policies cover fleet charging at depot level. |
| Infrastructure | PV, BESS, grid limit, tariffs, outage, five allocation policies, requested vs served | Tested | B15. |
| Physics Lab | Eight lessons in the nine-stage sequence | Implemented |  |
| Mathematics | Equation Explorer: 16 equations with derivations, graphs and linked checks | Implemented |  |
| Mathematics | Finite element, Fourier/Laplace and Monte Carlo lessons | Designed | Monte Carlo is used in the Simulation Lab; FEM is an extension. |
| Field Lab | Analytical field section, field lines, coupling with ferrite images | Analytically verified | A01–A03, A09, A10. |
| Field Lab | FEM integration and imported FEM maps | Planned |  |
| Circuit Lab | SS, SP, PS, PP, LCC–S, LCC–LCC by nodal analysis; sweeps, splitting, phasors, FHA waveforms | Analytically verified | A07. |
| Circuit Lab | Switching-level (SPICE transient) simulation | Planned |  |
| IoT | Seeded network with loss, latency, duplicates, outage, wrong key; receiver checks | Tested | B16. |
| IoT | Message log with raw and decoded payloads; data inspection of every signal | Implemented |  |
| Data | SIMULATED, ESTIMATED, STALE, INVALID modes; RECORDED via import | Tested |  |
| Data | LIVE telemetry from a physical prototype | Blocked | No prototype connected; hardware adapter designed only. |
| Battery | Thevenin model, CC–CV, derating, thermal node, stress indicator | Tested | B03, B05, A11. |
| Battery | Calibrated ageing and lifetime prediction | Planned | Needs cell test data. |
| AI | Engineering baselines for activation, coupling estimation, scheduling, anomaly detection | Implemented |  |
| AI | Trained machine-learning models | Planned | No datasets yet. |
| Safety & security | Fault injection and the inject→detect→protect→recover workflow | Tested |  |
| Safety & security | Standards registry | Implemented | Editions and applicability not yet verified. |
| Research Lab | Experiment design, sweeps, save, compare, CSV/JSON export, Markdown report | Implemented |  |
| Workshop | 32 weeks, 64 units, 352 h, monthly deliverables | Implemented |  |
| Workshop | Physical POC roadmap 01–06 with interfaces, BOM categories, instruments, tests, safety | Implemented |  |
| Assurance | Seven review gates with honest status; traceability matrix | Implemented |  |
| Assurance | Verification suite runnable in the browser | Tested | 29 checks. |
| Performance | Lazy 3D chunk; Auto, High, Balanced and Performance quality with adaptive pixel ratio; rendering paused off screen; 2D fallback without WebGL | Tested | 60 fps on Apple M1; heap flat over 16 environment switches. |
| Performance | Web Worker computation for sweeps and verification | Planned | Sweeps and checks run on the main thread, yielding between steps. |
| Accessibility | Keyboard operable, labelled controls, reduced motion, screen-reader descriptions | Implemented |  |
| Persistence | Firestore experiment storage | Planned | Experiments are saved in the browser only. |
| Validation | Experimental validation of any model | Planned | Needs Month 8 measurements. |
