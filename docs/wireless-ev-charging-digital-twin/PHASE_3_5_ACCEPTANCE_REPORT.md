# Phase 3.5 acceptance report

Cinematic realism and scientific experience refinement. 26 Nov 2026, on top of `8b08b03`. **Nothing committed, pushed, merged or deployed.** Evidence screenshots: [`screenshots/phase-3.5/`](screenshots/phase-3.5/) (files prefixed `before-` are the baseline production build of `8b08b03`).

**Team acceptance: not yet given.** This report is the implementing developer's own review; final visual acceptance belongs to the EV.ENGINEER™ team. Phases 4–6 have not been started.

## 1. Completed work

### Realism
- **Vehicle** rebuilt: crease-banded body, inset glass with seals, black pillars, panoramic glass roof, full-width light bars and wrap-around blades, grille, diffuser, blank plates, mirrors, wipers, antenna fin, shader-drawn shut lines, colour-dependent clear-coat paint. Dimensions and engineering bindings unchanged (`vehicle-front.jpg`, `vehicle-front34.jpg`, `vehicle-rear34.jpg`).
- **Daylight** sky with sun and clouds, the same sky in the reflection map (paint shows a horizon line), sun key with soft shadows, haze, studio cross-fade for inspection with key/fill/rim lights.
- **Greenery and ground**: four tree species and shrubs with wind sway; anti-tiled lawns and verges with lush/dry patches; landscaped site.
- **City and landscape**: towers, slabs and mid-rises with curtain-wall and punched-concrete façades in real bay and floor sizes; hills for atmospheric depth.

### Cinematics
- Station establishing shot at eye height; energy shot under the canopy along the chain (`before-stage-01.jpg` → `station-01.jpg`, `before-stage-09.jpg` → `station-09.jpg`).
- Highway: tracking, low, side, rear, aerial, handover, failed-segment, energy and field shots with lens and slow drift (`before-road-01.jpg` → `road-01.jpg`).
- Clipping range follows the shot (fixes z-fighting flicker at distance).

### Science
- **WPT-EM-005, dynamic road magnetic field**, computed from the road model's own state; log/linear scales, contours, receiver-following or fixed-segment section, phase control and sweep, vectors; checks A14–A16 (`road-06-field.jpg`; DYNAMIC_MAGNETIC_FIELD_REPORT.md).
- **Charging in motion**: pads glow with their controller level, a flux column scaled by received power, the DC path to battery and motor in a semi-transparent car, and a HUD with the five pads around the receiver, the energy balance and a received-power trace (`road-02.jpg`).
- **Road anatomy**: eight numbered parts of the electrified road with live values (`road-03-anatomy.jpg`).
- **Energy outcomes**: time-weighted 200 m window, explicit "Collecting a complete 200 m measurement window", averaged vs instantaneous separated; Research comparison of the three presets under one methodology.

### Experience
- iTelematics-derived design language; calmer type; one-row instruments with source tags; inputs moved into the side panel so the scene keeps its width (`before-engineer-alignment.jpg` → `mode-engineer.jpg`).
- **Learn**: three integrated experiments — mutual inductance and alignment, resonance, dynamic energy transfer — each moving the 3D scene with a live equation and graph (`mode-learn.jpg`).
- **Research**: experiment, provenance, models in use, export, scenario comparison (`mode-research.jpg`).
- **IoT message inspector** on the bus's delivered messages.
- **Sections**: hero with key figures, expand/collapse cards, "Show all", Expand all/Collapse all; the Practical Workshop redesigned as an interactive programme journey and proof-of-concept ladder (`section-workshop-0.jpg`, `section-workshop-1.jpg`, `section-assurance.jpg`, `section-overview.jpg`).
- **Presentation links** with a single "Begin with sound" control (`presentation-gate.jpg`); a Share popover builds them.
- **Proposed environments** in the rail: Drone (06), Air Taxi (07) — previews only, not simulated — and BESS (08), which opens storage in environment 05 where it is simulated.

## 2. Scientific verification

| Suite | Result |
|---|---|
| Twin, engine and route tests (`src/components/wireless-ev-twin`, `src/lib/wireless-charging`, the route) | 81 passed |
| Targeted set used by earlier phases (above plus every `src/app/internships` route) | 300 tests: 295 passed; 5 timed out at the 5 s limit in unrelated internship pages (battery toolkit, marketing & sales) and pass with a 30 s limit |
| Full repository | 2,437 tests: 2,422 passed; 14 timeouts in unrelated pages that pass with a 30 s limit (267/267 re-run); 1 failure, `satellite-explorer/ui/ui.test.tsx` › "offers EXPLODE…", which fails on `main` without this work (known) |
| Road field tests (`roadField.test.ts`) | 7 passed |
| In-page verification suite | 32 checks (29 + A14, A15, A16) |
| TypeScript, ESLint (React Compiler rules) | clean |

Model changes: none to any of the 20 existing models. One model added (WPT-EM-005). One analysis helper made explicitly time-weighted with defined edge cases; no numerical change for the shipped scenarios (SCIENTIFIC_VALIDATION_REPORT.md).

## 3. Browser verification (production build)

`npm run test:wireless-ev-twin:e2e` against `next build` + `next start`: **12 of 12 checks pass** (11 before; the new check opens a presentation link). The road check now covers eleven stages, the charging-in-motion HUD, the road anatomy and a field reading from WPT-EM-005.

An automated layout review (`overlap and clipped-text audit`) walked all 12 station stages, all 11 road stages, the autonomous and infrastructure scenes, Learn, Engineer and Research, and every section at 1440 × 900 and 1280 × 800, and the road stages on a 390 × 844 phone. Final result: no overlapping panels and no clipped text, apart from intentionally screen-reader-only labels.

## 4. Performance

See PERFORMANCE_REPORT.md (Phase 3.5 section). In short: one WebGL context; no memory growth over 16 environment switches (43 → 43 MB); route initial JavaScript ≈ 323 KB gzipped with three.js still deferred; frame rates measured during heavy background system activity on the M1 and therefore not comparable with the idle baseline — the Performance tier held 60 fps; a re-measurement on an idle machine is still owed.

## 5. Video evidence

Not recorded in this session. The demonstration (`?experience=present`) is the intended walkthrough for the team's review.

## 6. Remaining visual limitations

- The vehicle is procedural; a licensed CAD body would add surface subtlety (the geometry slot is ready). Interior is simple.
- No normal maps on asphalt and concrete; close road shots rely on texture and lighting.
- Autonomous (04) and infrastructure (05) scenes keep their Phase 2 layouts with the new world, vehicle and lighting.
- Real Safari, iPhone, Android and a low-end GPU were not tested in this session.

## 7. Remaining scientific limitations

- The road field is F1 (analytical), not FEM; assumptions A1 (one phase reference) and A2 (resonant receiver) belong to the road model.
- No plan-view field map; the station section planes are not freely selectable.
- Drone and Air Taxi are proposals with no models; nothing shown for them is a result.
- All earlier limitations stand (SCIENTIFIC_VALIDATION_REPORT.md).

## 8. Acceptance status

| Area (brief §26) | Developer's assessment | Team |
|---|---|---|
| Vehicle | Realistic contemporary EV form, materials, lamps and detail; exploded view unchanged from Phase 2 | pending |
| Station | Daylight architectural setting, landscaped, recomposed shots | pending |
| Highway | Real road, landscape, varied assets, automotive camera work, cutaway, handover, field | pending |
| Scientific experience | Equations linked to the scene; parameter changes move the scene and values; fidelity and sources visible; reproducible export | pending |
| UI | Large viewport, readable, minimal clutter, consistent type, responsive | pending |

**Requested:** the EV.ENGINEER™ team's visual acceptance of the Station and Dynamic Road environments, or a list of changes.
