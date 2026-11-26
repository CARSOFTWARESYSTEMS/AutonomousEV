// Feature status registry: what this build does, against the product brief.
// Statuses are deliberately conservative. "Analytically verified" needs a
// passing check against an independent result; nothing is "Experimentally
// validated" because no measurements exist yet.
import type { ValidationStatus } from "./registry";

export interface Feature {
  area: string;
  feature: string;
  status: ValidationStatus;
  note?: string;
}

const f = (area: string, feature: string, status: ValidationStatus, note?: string): Feature => ({ area, feature, status, note });

export const FEATURES: readonly Feature[] = [
  f("Integration", "Proof of Concept card on /internships and route", "Tested"),
  f("Integration", "Self-contained page, existing auth and design system untouched", "Tested", "Default optional-login access, like the other /internships sub-pages."),
  f("Integration", "Research & Project Leadership section (Lead Researcher highlighted with an animated border)", "Tested"),
  f("Presentation", "Full-screen research environment (Fullscreen API, overlay fallback, F and Esc); the scene grows to 85 % of the display", "Tested", "scripts/test-wireless-ev-twin.cjs."),
  f("Presentation", "Cinematic opening: poster rendered from the twin's own scene, minimal copy, Enter Research Laboratory and Watch Technology Demonstration", "Tested"),
  f("Presentation", "Immersive laboratory: environment rail, stage card, instrument strip, inputs drawer, inspector on demand, cinematic timeline", "Tested", "Scene covers 79 % of a 1440 × 900 desktop."),
  f("Presentation", "No-WebGL message never in the server HTML; context-loss fallback to the 2D field view", "Tested"),
  f("Guided sequence", "Twelve engineering stages for the station, each with camera, view, components, telemetry, physics, models and narration", "Tested"),
  f("Guided sequence", "Auto-advance in Explore on engineering events; pause on interaction; resume; no unexpected resets", "Tested"),
  f("Guided sequence", "Eight-chapter technology demonstration across the environments", "Implemented", "Chapter 1 shows arrival and identification at the station; the smart parking shelter scene is planned."),
  f("Guided sequence", "Narration (browser speech synthesis), captions and ambience, off until chosen", "Implemented"),
  f("Guided sequence", "Professionally recorded narration", "Planned"),
  f("3D", "Lofted unbranded vehicle with glass, pillars, seams, mirrors, interior, multi-spoke wheels, brakes, suspension, subframes, battery modules, rear drive unit, receiver electronics and HV cabling", "Implemented", "Representative engineering geometry, not a production model."),
  f("3D", "Ride height from the simulated air gap; steering from the kinematic model; wheels roll by distance", "Tested"),
  f("3D", "Layered pads: enclosure, FOD sense coils, potting, Litz winding on its former, ferrite, insulation, shield, base; exploded away from the true air gap; quarter cutaway", "Implemented"),
  f("3D", "Power cabinet with protection, PFC, DC link, SiC modules on a cold plate, gate drivers, C₁ bank, controllers, gateway, cooling", "Implemented"),
  f("3D", "Solar shelter, identification camera, positioning anchors, field probe, transformer, storage, apron and access road", "Implemented"),
  f("3D", "Licensed photogrammetry or CAD vehicle assets", "Planned", "No external assets used; see ASSET_LICENSES.md."),
  f("3D", "Fifteen views: exterior, X-ray, chassis, underbody, battery, receiver, vehicle exploded, power electronics, cutaway, pads exploded, alignment, field, energy, thermal, IoT", "Implemented"),
  f("3D", "Camera director: composed shots, follow shots, eased moves, hand-over to the visitor, reset, framing from component bounds, reduced motion", "Tested"),
  f("3D", "Component selection with three-level inspector, highlight, isolation and explode", "Tested"),
  f("3D", "Studio backdrop for inspection views; roof fades when it blocks the line of sight", "Implemented"),
  f("Dynamic", "Premium electrified highway: corridor, embedded pad modules with controller states, section cut with layers and duct bank, interlock and request window, coupling chart, roadside and top-down cameras", "Tested", "Nine stages; scripts/test-wireless-ev-twin.cjs."),
  f("Dynamic", "Three energy outcomes as stages, read over a whole 200 m zone period", "Tested", "Each preset's regime is unit-tested."),
  f("3D", "Premium scenes for the autonomous and infrastructure environments", "Designed", "They use the new vehicle and lighting; their own redesign is Phases 5 and 6."),
  f("Smart Parking", "IoT & AI-Based Smart Parking Shelter environment", "Designed", "Requirements in SMART_PARKING_REQUIREMENTS.md; shown as planned."),
  f("Architecture", "Configurable ground and vehicle chain with every stage's loss", "Analytically verified", "A05 energy closure."),
  f("Station", "19-step state machine with 13 abnormal states and safety precedence", "Tested", "B09, B12, unit tests."),
  f("Station", "Alignment, air gap, frequency, power, turns, capacitance, battery, ambient, tariff, grid controls", "Implemented"),
  f("Station", "Adaptive resonance within 79–90 kHz", "Implemented"),
  f("Station", "Overcurrent transient on sudden coupling change (SS)", "Tested"),
  f("Dynamic", "Segmented road, delayed noisy position, three handover strategies, interlock", "Tested", "B07, B08."),
  f("Dynamic", "Charging, energy-neutral and discharging regimes", "Tested", "B11."),
  f("Dynamic", "Multiple vehicles and traffic density", "Planned"),
  f("Dynamic", "Rectangular, DD, DDQ and bipolar road coils", "Planned"),
  f("Autonomous", "Bicycle model, pure pursuit, EKF with UWB, delay compensation, precision positioning", "Tested", "B13."),
  f("Autonomous", "Station selection, reservation exchange, mission energy", "Tested", "B14."),
  f("Autonomous", "Fleet scheduling of many autonomous vehicles", "Designed", "District policies cover fleet charging at depot level."),
  f("Infrastructure", "PV, BESS, grid limit, tariffs, outage, five allocation policies, requested vs served", "Tested", "B15."),
  f("Physics Lab", "Eight lessons in the nine-stage sequence", "Implemented"),
  f("Mathematics", "Equation Explorer: 16 equations with derivations, graphs and linked checks", "Implemented"),
  f("Mathematics", "Finite element, Fourier/Laplace and Monte Carlo lessons", "Designed", "Monte Carlo is used in the Simulation Lab; FEM is an extension."),
  f("Field Lab", "Analytical field section, field lines, coupling with ferrite images", "Analytically verified", "A01–A03, A09, A10."),
  f("Field Lab", "FEM integration and imported FEM maps", "Planned"),
  f("Circuit Lab", "SS, SP, PS, PP, LCC–S, LCC–LCC by nodal analysis; sweeps, splitting, phasors, FHA waveforms", "Analytically verified", "A07."),
  f("Circuit Lab", "Switching-level (SPICE transient) simulation", "Planned"),
  f("IoT", "Seeded network with loss, latency, duplicates, outage, wrong key; receiver checks", "Tested", "B16."),
  f("IoT", "Message log with raw and decoded payloads; data inspection of every signal", "Implemented"),
  f("Data", "SIMULATED, ESTIMATED, STALE, INVALID modes; RECORDED via import", "Tested"),
  f("Data", "LIVE telemetry from a physical prototype", "Blocked", "No prototype connected; hardware adapter designed only."),
  f("Battery", "Thevenin model, CC–CV, derating, thermal node, stress indicator", "Tested", "B03, B05, A11."),
  f("Battery", "Calibrated ageing and lifetime prediction", "Planned", "Needs cell test data."),
  f("AI", "Engineering baselines for activation, coupling estimation, scheduling, anomaly detection", "Implemented"),
  f("AI", "Trained machine-learning models", "Planned", "No datasets yet."),
  f("Safety & security", "Fault injection and the inject→detect→protect→recover workflow", "Tested"),
  f("Safety & security", "Standards registry", "Implemented", "Editions and applicability not yet verified."),
  f("Research Lab", "Experiment design, sweeps, save, compare, CSV/JSON export, Markdown report", "Implemented"),
  f("Workshop", "32 weeks, 64 units, 352 h, monthly deliverables", "Implemented"),
  f("Workshop", "Physical POC roadmap 01–06 with interfaces, BOM categories, instruments, tests, safety", "Implemented"),
  f("Assurance", "Seven review gates with honest status; traceability matrix", "Implemented"),
  f("Assurance", "Verification suite runnable in the browser", "Tested", "29 checks."),
  f("Performance", "Lazy 3D chunk; Auto, High, Balanced and Performance quality with adaptive pixel ratio; rendering paused off screen; 2D fallback without WebGL", "Tested", "60 fps on Apple M1; heap flat over 16 environment switches."),
  f("Performance", "Web Worker computation for sweeps and verification", "Planned", "Sweeps and checks run on the main thread, yielding between steps."),
  f("Accessibility", "Keyboard operable, labelled controls, reduced motion, screen-reader descriptions", "Implemented"),
  f("Persistence", "Firestore experiment storage", "Planned", "Experiments are saved in the browser only."),
  f("Validation", "Experimental validation of any model", "Planned", "Needs Month 8 measurements."),
];

export const FEATURE_COUNTS = FEATURES.reduce<Record<string, number>>((acc, x) => ((acc[x.status] = (acc[x.status] ?? 0) + 1), acc), {});
