# Feature coverage

Generated from `src/lib/wireless-charging/coverage.ts` (the same list the Engineering Assurance view shows). Statuses: Planned · Designed · Implemented · Tested · Analytically verified · Experimentally validated · Blocked. Nothing is experimentally validated: no measurements exist yet.

Counts: Tested 41 · Implemented 22 · Planned 13 · Designed 3 · Analytically verified 6 · Blocked 2

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
| Guided sequence | Eight-chapter technology demonstration across the environments | Implemented | Unchanged in Phase 4: chapter 1 still shows arrival and identification at the station; adding Smart Parking chapters is a decision for the team. |
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
| Smart Parking | Environment 01 implemented in the existing laboratory (rail order and style unchanged); Planned label removed after its end-to-end flow passed | Tested | SP-B checks; laboratory.test.tsx; scripts/test-wireless-ev-twin.cjs. |
| Smart Parking | Configurable facility (12 bays: 8 + 4 wireless by default; 6-bay POC preset; 6–48 bays in 3D, any number headless) | Tested | smart-parking.test.ts; scalability study. |
| Smart Parking | Session state machine: 25 normal and 22 exceptional states, explicit transitions, guards and timers | Tested | SP-B01, B25, B26; no refused transition in the tour run. |
| Smart Parking | Simulated recognition pipeline with confidence; RFID, QR, visitor ticket and operator fallbacks; regional plate formats (IN, US, CN) | Tested | SP-B02. No inference model runs; accuracy is an assumption until POC data. |
| Smart Parking | Three-sensor occupancy with node debounce, Bayesian fusion, staleness and uncertainty | Tested | SP-A08, SP-B06, B18, B20. |
| Smart Parking | Five allocation policies with hard constraints, deterministic ties and atomic reservation | Tested | SP-B03, B04, B05. |
| Smart Parking | Reservations, queue, abandonment, balking; Erlang B, M/M/c/K and discrete-event simulation | Analytically verified | SP-A01–A03. |
| Smart Parking | Barrier controller with interlock, clear-zone verification and safe egress | Tested | SP-B07, B09, B24. |
| Smart Parking | Wireless charging through each wireless bay's own Station simulation; seven eligibility checks; safe stop before departure; SOC taken once | Tested | SP-B11–B15. |
| Smart Parking | Explore Wireless Charging: the bay's live session shown in the Station environment, and back | Tested | laboratory.test.tsx; browser check. |
| Smart Parking | Shelter environment model and local safety controller (simulated smoke and gas) | Analytically verified | SP-A04, SP-B10. |
| Smart Parking | Solar, storage and grid dispatch with priorities and unmet demand | Tested | SP-A05, A06. |
| Smart Parking | Parking and charging ledgers in integer minor units; INR, USD, CNY; simulated payments | Analytically verified | SP-A07, B16, B17. |
| Smart Parking | MQTT namespace, schema, broker ACLs, idempotent ingestion, command authorisation | Tested | SP-B08, B19, B20. No real broker or certificate. |
| Smart Parking | Forecast baselines and rule/robust-statistics anomaly detection | Tested | SP-A10, A12. No machine-learning model. |
| Smart Parking | Eighteen guided stages driven by simulation events; seventeen camera shots; four new views | Tested | Unattended tour run: all 18 stages in about 3 minutes. |
| Smart Parking | Driver workflow (reserve, arrive, monitor, pay, receipt) and operator workflow (overview, devices, sessions, overrides, audit) | Implemented |  |
| Smart Parking | Research studies (policies against manual parking, capacity, fusion, recognition, IoT, charging demand, energy, environment, pricing, forecasts, scalability) | Tested | SP-A09 and smart-parking.test.ts. |
| Smart Parking | Recorded mode (record and replay through ingestion and fusion) | Implemented |  |
| Smart Parking | Hardware-in-the-loop and connected POC modes | Blocked | No device connected; adapter interfaces only. |
| Smart Parking | Machine-learning recognition, occupancy prediction and predictive maintenance | Planned | Needs labelled POC data. |
| Smart Parking | Physical six-bay POC and full-scale pilot | Planned | BOM and plans in docs; nothing procured or built. |
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
