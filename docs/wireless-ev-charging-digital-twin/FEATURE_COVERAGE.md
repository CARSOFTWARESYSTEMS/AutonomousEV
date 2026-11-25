# Feature coverage

Generated from `src/lib/wireless-charging/coverage.ts` (the same list the Engineering Assurance view shows). Statuses: Planned · Designed · Implemented · Tested · Analytically verified · Experimentally validated · Blocked. Nothing is experimentally validated: no measurements exist yet.

Counts: Tested 16 · Implemented 18 · Designed 4 · Planned 10 · Analytically verified 3 · Blocked 1

| Area | Feature | Status | Note |
|---|---|---|---|
| Integration | Proof of Concept card on /internships and route | Tested |  |
| Integration | Self-contained page, existing auth and design system untouched | Tested | Default optional-login access, like the other /internships sub-pages. |
| Integration | Research & Project Leadership section (Lead Researcher highlighted with an animated border) | Tested |  |
| Presentation | Full-screen research environment (Fullscreen API, overlay fallback, F and Esc) | Tested |  |
| Introduction | Six-scene cinematic introduction over the live twin | Implemented |  |
| Introduction | Skip, pause, replay, narration (speech synthesis), sound, reduced motion, show once | Implemented |  |
| Introduction | Photorealistic city | Designed | Procedural dusk city; photorealistic assets are a later phase. |
| 3D | Procedural vehicle, pads with simulated turn count, ferrite, shield, cabinet, canopy, road layers | Implemented |  |
| 3D | Licensed photogrammetry or CAD vehicle assets | Planned | No external assets used; see ASSET_LICENSES.md. |
| 3D | Cinematic, Engineering, X-Ray, Cutaway, Exploded, Field, Energy Flow, Thermal and IoT views | Implemented |  |
| 3D | Component, Electrical Circuit, Physics, Mathematics and Fault Investigation as 3D views | Designed | Provided by the inspector, Circuit Lab, Physics Lab and fault panels. |
| 3D | Component selection with registry inspector and live values | Implemented |  |
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
| Performance | Lazy 3D chunk, adaptive quality tiers, 2D fallback without WebGL | Implemented | Field basis computed after input changes settle, outside the frame loop. |
| Performance | Web Worker computation for sweeps and verification | Planned | Sweeps and checks run on the main thread, yielding between steps. |
| Accessibility | Keyboard operable, labelled controls, reduced motion, screen-reader descriptions | Implemented |  |
| Persistence | Firestore experiment storage | Planned | Experiments are saved in the browser only. |
| Validation | Experimental validation of any model | Planned | Needs Month 8 measurements. |
