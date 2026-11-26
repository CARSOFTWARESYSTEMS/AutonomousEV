# Implementation report — premium redesign, Phases 0–3

25–26 Nov 2026. Builds on `a1e4679`. Nothing committed, merged, pushed or deployed.

## Scope delivered

| Phase | Status |
|---|---|
| 0 Audit and architecture | **Done.** CURRENT_IMPLEMENTATION_AUDIT.md with screenshots at four sizes and full screen, measurements, root causes. |
| 1 Premium experience foundation | **Done.** Laboratory shell, camera rig, guided-stage orchestration, component selection and isolation, quality profiles, rendering reliability (server fallback fixed, context loss handled, three.js out of the first load). |
| 2 Flagship stationary charging | **Done to the standard described in VISUAL_ACCEPTANCE_REPORT.md.** New vehicle, pads, cabinet, site, lighting; twelve guided stages; three-level inspector; eight-chapter demonstration. |
| 3 Dynamic wireless charging | **Done** (26 Nov 2026): premium road corridor, embedded pad modules with controller states, section cut with layers and duct bank, interlock and request-window overlays, coupling chart, roadside/top-down/receiver cameras, nine stages including the three energy outcomes and a failed segment. Built before the flagship's formal acceptance, at the user's request to continue. |
| 4–8 | **Not started** beyond what Phases 1–3 give every environment. |

## Implemented

- **Cinematic opening** with a poster rendered from the twin's own scene, the four descriptors, *Enter Research Laboratory* and *Watch Technology Demonstration*.
- **Immersive laboratory**: minimal toolbar (identity, environment, modes, demonstration, quality, full screen), section bar, environment rail with five environments (Smart Parking planned), stage card, instrument strip, inputs drawer, inspector on demand, cinematic timeline (stage strip as scrubber, simulation clock with accelerated-time label, speed, camera, view menu with fifteen views, narration, captions, sound). The scene covers 79 % of the desktop, 85 % in full screen.
- **Guided sequence**: twelve station stages that bring the simulation to their state by running the model; auto-advance on engineering events in Explore; pause on interaction; resume. Nine road stages (Phase 3); short sequences for the autonomous and infrastructure environments. Eight-chapter demonstration.
- **Camera**: composed shots for every stage and view, follow shots, eased moves timed by travel, hand-over to the visitor, reset, framing from component bounds, reduced motion.
- **Assets**: lofted vehicle with interior, wheels, brakes, suspension, battery, drive unit, receiver electronics, HV cabling; eight-layer pads with exploded and cutaway views; power cabinet with internals; shelter, devices, transformer, storage, surroundings. All procedural and original.
- **Inspector**: Overview / How it works / Engineering for any of 41 components; Frame, Isolate, Explode, Lesson, Experiment, Model status. Science panel per stage with FHA waveforms at the resonance stage. Data panel with the environment's existing result panels.
- **Fixes**: server HTML no longer says "3D view unavailable"; WebGL context loss falls back to 2D; three.js removed from the first load (565 → 305 KB gzipped initial JS).

## Preserved

All 20 models, 29 checks, the nine sections and their laboratories, Physics & Mathematics lessons (now openable at a lesson from the inspector), Simulation, Circuit, IoT & Data, Research Lab, the 32-week / 64-unit workshop, Engineering Assurance, the fault-injection panel, station/road/parking/district inputs and results, full screen, Research & Project Leadership (unchanged), FAQ, disclaimers, data modes, the "no compliance, no validation" wording.

## Removed or replaced

| Removed | Replaced by |
|---|---|
| `intro/` (six-scene introduction shown once) | guided stages and the eight-chapter demonstration |
| `sections/TwinSection.tsx` (three-column dashboard) | `lab/Laboratory.tsx` |
| `ui/Inspector.tsx` | `lab/Inspector.tsx` (its live-value reader kept as `ui/liveValues.ts`) |
| Old vehicle, pad and cabinet in `three/parts.tsx`, `three/geometry.ts`, `three/world.tsx` | `three/vehicle/`, `three/station/` |

## Scientific model changes

None. Phase 3 added one analysis helper to `dynamic.ts`, `recentBatteryPower` (mean battery power over the last 200 m of samples), which reads the samples and changes nothing in the model. See SCIENTIFIC_VALIDATION_REPORT.md.

## Shared files touched

`package.json` (one npm script), `public/llms.txt` (description of the page). No other route, authentication, access control or site branding was changed.

## Tests

| Suite | Result |
|---|---|
| `vitest` — twin, engine and route (`src/components/wireless-ev-twin`, `src/lib/wireless-charging`, `src/app/internships`) | 290 passed |
| `vitest` — full repository | 2,426 passed, 1 failed: `satellite-explorer/ui/ui.test.tsx` › "offers EXPLODE…", which fails on `main` without this change (known) |
| `npm run test:wireless-ev-twin:e2e` against a production build | 11 checks passed (Phase 3 added the road check) |
| WebKit and Firefox smoke tests | canvas renders, no page errors |
| TypeScript, ESLint (React Compiler rules) | clean |
| `next build` | passes |

## Known limitations and remaining work

1. **Smart Parking Shelter** is specified only (SMART_PARKING_REQUIREMENTS.md); its models, scene and workshop integration are Phase 4.
2. **Autonomous and infrastructure scenes** keep their previous layouts (with the new vehicle, lighting, camera and timeline); their premium scenes are Phases 5 and 6. The road has no field map, no multi-vehicle charging and no traffic interaction (traffic is decorative).
3. **Field visualisation**: no vector arrows, selectable section planes, contour lines or linear/log switch in 3D; the stored field phase has no control yet.
4. **Narration** uses browser speech synthesis; no recorded voice.
5. **Vehicle** is procedural; bumpers, bonnet and door detail are simple. No external or licensed CAD assets.
6. **Learn-mode integration** links components and stages to the existing lessons; the brief's interactive 3D lesson demonstrations (mutual inductance with live coils, resonance with physical L and C) are not built.
7. **Research mode** in the laboratory shows the same panels as Engineer mode; parameter sweeps, sensitivity and comparison remain in the Research Lab section.
8. **IoT message inspector** on a selected link is not in the 3D view (the IoT & Data laboratory has the message log).
9. **Testing gaps**: no real Safari or iOS hardware, no low-end GPU, no Lighthouse run for this route.
10. **Development hooks** (`__wevct`, `__wevctScene`, `__wevctShot`) exist in development builds only; confirmed absent from production chunks.

## Next steps (proposed)

Review the station and road scenes with the EV.ENGINEER™ team and record acceptance or changes; then Phase 4 (Smart Parking Shelter, which needs its models first — see SMART_PARKING_REQUIREMENTS.md) or Phase 5 (autonomous charging scene).

## Phase 3.5 — cinematic realism and scientific experience refinement (26 Nov 2026)

Builds on `8b08b03`. Uncommitted. Full account: PHASE_3_5_VISUAL_REFINEMENT_PLAN.md, PREMIUM_ASSET_QUALITY_REPORT.md, DYNAMIC_MAGNETIC_FIELD_REPORT.md, PHASE_3_5_ACCEPTANCE_REPORT.md.

| Area | Delivered |
|---|---|
| Realism | Rebuilt vehicle body and detail; daylight sky and reflections; trees, shrubs, lawns, city and hills |
| Camera | Lens and drift per shot; nine new road shots; recomposed station shots; clipping that follows the shot |
| Science | WPT-EM-005 road field (A14–A16); charging in motion; road anatomy; time-weighted 200 m window; three-scenario comparison |
| Modes | Learn: three integrated experiments. Engineer: inputs in the side panel. Research: experiment, provenance, models, export, comparison |
| IoT | Message inspector on the bus's delivered messages |
| UI | iTelematics-derived tokens and type; section kit with expand/collapse; Practical Workshop redesign; presentation links and Share; proposed Drone, Air Taxi and BESS entries |

New files: `src/lib/wireless-charging/roadField.ts` (+ test); `three/sky.ts`, `three/env/{foliage.ts,Forest.tsx,buildings.ts}`, `three/vehicle/details.ts`, `three/road/{RoadField.tsx,RoadEnergy.tsx,fieldInfo.ts}`; `lab/{FieldLegend,ChargingHud,RoadAnatomy,LearnLab,ResearchPanel,IotInspector,Launch}.tsx`; `state/launch.ts`; `ui/{Section.tsx,section.module.css}`; `sections/workshop.module.css`; the route's `fonts.ts`.

Removed: the inputs drawer over the scene (its controls moved to the panel's Inputs tab).

Shared files touched: the route's `page.tsx` (one font variable) and `page.test.tsx` (font mock; workshop heading). No other route, authentication, access control or site-wide branding changed.
