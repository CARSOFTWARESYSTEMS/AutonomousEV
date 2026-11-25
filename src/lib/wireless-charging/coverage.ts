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
  f("Presentation", "Full-screen research environment (Fullscreen API, overlay fallback, F and Esc)", "Tested"),
  f("Introduction", "Six-scene cinematic introduction over the live twin", "Implemented"),
  f("Introduction", "Skip, pause, replay, narration (speech synthesis), sound, reduced motion, show once", "Implemented"),
  f("Introduction", "Photorealistic city", "Designed", "Procedural dusk city; photorealistic assets are a later phase."),
  f("3D", "Procedural vehicle, pads with simulated turn count, ferrite, shield, cabinet, canopy, road layers", "Implemented"),
  f("3D", "Licensed photogrammetry or CAD vehicle assets", "Planned", "No external assets used; see ASSET_LICENSES.md."),
  f("3D", "Cinematic, Engineering, X-Ray, Cutaway, Exploded, Field, Energy Flow, Thermal and IoT views", "Implemented"),
  f("3D", "Component, Electrical Circuit, Physics, Mathematics and Fault Investigation as 3D views", "Designed", "Provided by the inspector, Circuit Lab, Physics Lab and fault panels."),
  f("3D", "Component selection with registry inspector and live values", "Implemented"),
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
  f("Performance", "Lazy 3D chunk, adaptive quality tiers, 2D fallback without WebGL", "Implemented", "Field basis computed after input changes settle, outside the frame loop."),
  f("Performance", "Web Worker computation for sweeps and verification", "Planned", "Sweeps and checks run on the main thread, yielding between steps."),
  f("Accessibility", "Keyboard operable, labelled controls, reduced motion, screen-reader descriptions", "Implemented"),
  f("Persistence", "Firestore experiment storage", "Planned", "Experiments are saved in the browser only."),
  f("Validation", "Experimental validation of any model", "Planned", "Needs Month 8 measurements."),
];

export const FEATURE_COUNTS = FEATURES.reduce<Record<string, number>>((acc, x) => ((acc[x.status] = (acc[x.status] ?? 0) + 1), acc), {});
