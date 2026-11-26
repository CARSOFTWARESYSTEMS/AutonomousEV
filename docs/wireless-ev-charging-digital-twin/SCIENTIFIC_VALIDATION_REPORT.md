# Scientific validation report

## Summary

**No engineering model was changed in Phases 0–3.** Phase 3 added `recentBatteryPower`, an analysis of the road samples that changes nothing in the model. The 20 registered models, their equations, parameters, limitations and the 29 verification checks are as committed in `a1e4679`. All checks and engine tests pass. Nothing is experimentally validated, and nothing claims to be.

## What was verified

| Check | Result |
|---|---|
| Engine tests and the 29 verification checks (`src/lib/wireless-charging/engine.test.ts`, `benchmarks.ts`) | pass |
| A guided stage reaches its state by running the model: after fast-forwarding to *The magnetic field*, the station is in `charging`, the vehicle is parked, battery power > 1 kW, and the energy ledger closes to 10⁻⁶ relative | pass (`lab/laboratory.test.tsx`) |
| Foreign-object stage: the injected object trips the station into `foreign-object` with zero battery power; removing it returns the station to charging within 40 simulated seconds | pass (unit test and browser) |
| Accelerated stages set ×60 and ×300 and leaving the tour restores ×1; the clock is labelled | pass |
| The receiver winding sits exactly `airGap` above the ground winding for 100, 150 and 250 mm | pass (geometry test) |
| Changing the air gap from 150 to 210 mm in the browser lowers the calculated k from 0.365 to 0.246 | pass (browser) |
| Every instrument reads a value from the running models and declares INPUT, CALCULATED or SIMULATED | pass |
| Rendering quality changes leave the simulation untouched (single canvas, same state) | pass (browser) |
| The server HTML never claims the 3D view is unavailable | pass |
| Road: each energy-outcome preset (30 km/h · 100 %, 80 km/h · 47 %, 120 km/h · 30 %) gives the regime its stage states, over a whole 200 m zone period | pass (`three/road/road.test.ts`, browser) |
| Road: repeating items wrap with periods that divide the 1000 m route, so the picture is continuous when the route laps | pass |
| Road: pad colours map the controller's state and level (off, energising, active, de-energising, blocked, failed) | pass |

## What the visualisation does and does not claim

- Field colour map: RMS |B| from the analytical filament model with ferrite images (F1); not FEM. Field lines at one phase of the cycle; animation slowed and labelled.
- Thermal colours: one uniform colour per lumped node; no spatial hot spots.
- Energy flow: stage powers from the chain model; unmet district demand is never drawn as delivered.
- Waveforms: first-harmonic model of the present operating point; not switching-level.
- The foreign-object heating coefficient is illustrative and uncalibrated, and the stage says so.
- The vehicle, pads and cabinet are representative engineering geometry; only the winding radii, turns and the air gap come from the model.

## Model limitations (unchanged, still disclosed)

Approximate ferrite modelling (image currents scaled by coverage); no finite ferrite edges or vehicle shielding; frequency-domain rather than switching-level circuit analysis; simplified semiconductor losses; lumped thermal models; simplified battery degradation indicator; single-vehicle dynamic charging; circular coils only; forward-only autonomous parking without obstacles; aggregate infrastructure dispatch; simulated IoT protocols; no connected hardware. These remain in the model registry, the inspector's Engineering level and the Engineering Assurance section.

## Fidelity and validation

Fidelity (F0–F5) and validation status (Planned … Experimentally validated) stay separate attributes in the registry and the inspector. The new components added to the registry for the redesign (pad enclosure, insulation, base, receiver enclosure, identification camera, power cabinet, vehicle) are F0–F2 and *Designed* or *Tested*; none is marked verified or validated.

## Phase 3.5 (26 Nov 2026)

### New model: WPT-EM-005, dynamic road magnetic field

Added to the registry (21 models). It reuses WPT-EM-001/002 unchanged and reads WPT-SIM-002's state; its assumptions are the road model's own (one phase reference for all segments; resonant receiver). Verification: `roadField.test.ts` (7 tests) and in-browser checks **A14** (single pad agrees with the station section within 3 %), **A15** (no excitation → no field; failed pads contribute nothing) and **A16** (superposition residual < 10⁻¹² T; phase convention). The suite now has **32 checks**. Full account in DYNAMIC_MAGNETIC_FIELD_REPORT.md.

### Analysis helper changed: the 200 m energy window

`recentBatteryPower` (an analysis of the road samples, not a model) averaged the samples arithmetically. It now delegates to `energyWindow`, which weights each sample by the time since the previous one. Reason: the brief's review of variable-speed use; the arithmetic mean is only time-weighted when samples are uniform. Numerical effect: none for the shipped scenarios — the road model samples every 10 ms, so the two means are identical (the three outcome presets keep their regimes; `road.test.ts` and the browser checks pass unchanged). Defined behaviour added: distance across the 1000 m boundary is unwrapped; a gap over 0.5 s (a reset) ends the window; a stopped or very slow vehicle (under 24 km/h on average over the stored 30 s) never completes the window and is reported "Collecting a complete 200 m measurement window", never classified. No model equation or version changed.

### Unchanged

All 20 existing models, their equations and versions; the 29 existing checks; the state machines, telemetry, interlocks and scenarios.
