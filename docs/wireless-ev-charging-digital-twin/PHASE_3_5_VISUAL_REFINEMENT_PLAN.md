# Phase 3.5 — visual refinement plan

Cinematic realism and scientific experience refinement, 26 Nov 2026. Starts from `8b08b03` (Phases 0–3, committed and pushed). Phases 4–6 are not started; they wait for the EV.ENGINEER™ team's acceptance of this phase.

## 1. Verified visual deficiencies (baseline)

Baseline: the production build of `8b08b03`, all 11 browser checks passing, 60 fps on the Apple M1, screenshots of every stage. Findings by observation, not from the code:

| Area | Deficiency |
|---|---|
| Light | Blue-hour night lighting everywhere; the reflection map was a generic studio, so paint showed no horizon line and the car read as a matte shell |
| City | Emissive window texture on boxes: "grey static" in every wide shot; identical boxes |
| Vegetation | Cone trees on the road; sphere hedges at the station |
| Ground | One concrete plane to the horizon; obvious tiling from altitude |
| Vehicle | Rounded "bubble" cross-section, no creases, glasshouse indistinguishable from the body, pill-shaped plan, no lamps, intakes, bumpers, plates or shut lines |
| Station shots | Establishing shot dominated by the PV roof; the energy shot looked *through* the PV roof |
| Road shots | One plain roadside camera; guardrail and posts in the foreground |
| Road science | No magnetic field on the road; no visible charging-in-motion — the visitor could not see the car charge |
| UI | Dense, boxed tags, small cramped type, three panels squeezing the scene in Engineer mode, instruments colliding with labels and the HUD, truncated titles, text selected while orbiting |
| Sections | Long documents: dense tables, chip walls; the Practical Workshop accordion rendered its content outside its card over the following months |
| Flicker | Depth-buffer z-fighting at distance (road ↔ lawn 3 cm apart with a 3 cm near plane) and adaptive resolution oscillating |

## 2. Asset strategy (hybrid, decided)

- **Kept procedural and model-driven:** coil windings, pads and their layers, air-gap geometry, road segment positions and states, battery, power electronics, cutaways, dimensions, fields, energy flow, sensors and overlays.
- **Raised in quality, still procedural and original:** the vehicle exterior (rebuilt generator plus detail parts), materials, sky and lighting, trees and shrubs, the city and the hills, the ground.
- **Licensed GLB/glTF assets: evaluated, not used.** No external CAD body was imported: downloading third-party files needs the team's authorisation, the candidates found are either stylised or carry attribution terms, and an imported body would be disconnected from the engineering frame (receiver offset, ride height from the air gap, selective transparency, assembly groups). The vehicle module keeps one geometry slot, so a licensed body can replace the lofted one later without touching the bindings.

## 3. Art direction

Premium automotive product presentation in daylight, engineering CAD inspection in a neutral studio, scientific overlays that are restrained and labelled. Colour explains state; the scene is first, type second, instruments third, controls on demand. The UI follows the iTelematics design language (deep navy surfaces, slate text, telemetry cyan, JetBrains Mono for labels and readings, Inter for display with tight tracking), with the EV.ENGINEER™ wordmark unchanged in Manrope.

## 4. Implementation phases

| Phase | Content | State |
|---|---|---|
| 3.5A | Audit, baseline, art direction | done |
| 3.5B | Vehicle and materials: crease-banded body, inset glass, black pillars, glass roof, light bars and blades, grille, diffuser, plates, mirrors, wipers, antenna, shader shut lines; clear-coat paint by colour | done |
| 3.5C | Station: daylight, landscaping, skyline, studio transitions; establishing and energy shots recomposed | done |
| 3.5D | Highway: anti-tiled verges, four tree species with wind, skyline set back, eight new composed shots with lens and drift, dynamic clipping | done |
| 3.5E | Road magnetic field (WPT-EM-005) with controls, legend and checks A14–A16 | done |
| 3.5F | Charging in motion (pad glow, flux column, DC path, HUD), road anatomy, Learn experiments, Research panel, IoT message inspector | done |
| 3.5G | UI: design tokens, stage card, instruments, timeline, legends, inputs in the side panel, section kit with expand/collapse, workshop redesign, share/presentation link | done |
| 3.5H | Verification and acceptance request | see PHASE_3_5_ACCEPTANCE_REPORT.md |

## 5. Technical risks and how they were handled

| Risk | Handling |
|---|---|
| Heavier scene costs frame rate | Instanced foliage (two variants per species, a few draw calls), merged buildings, field basis cached; measured in PERFORMANCE_REPORT.md |
| Alpha-tested foliage shimmers | Alpha-to-coverage with MSAA; wind is a vertex sway, no extra passes |
| Field computation blocks the frame | Basis built a few rows per frame; per-frame work is table lookups |
| Visual changes alter science | The renderer only reads; field and energy views read the engine; tests confirm quality and resolution do not change values |
| Flicker | Near/far planes follow the shot; ground layers spaced; adaptive resolution only steps down and locks |

## 6. Acceptance criteria

The brief's §26 checklist, reproduced with evidence in PHASE_3_5_ACCEPTANCE_REPORT.md. Final visual acceptance belongs to the EV.ENGINEER™ team.
