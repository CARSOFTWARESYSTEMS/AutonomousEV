# Current implementation audit (Phase 0)

Audit of `/internships/wireless-ev-charging-digital-twin` as committed in `a1e4679` (25 Nov 2026), before the premium redesign. Every finding below was established by reading the code, running the page, or both. The brief's audit targets were treated as hypotheses; the table in §4 says which were confirmed and which were not.

## 1. Method

- Code review of the route, `src/components/wireless-ev-twin` (40 files, ~7,900 lines), `src/lib/wireless-charging` (22 files, ~7,700 lines) and the reference twin `src/components/rocket-engine-twin`.
- The running page on the local dev server, driven by Playwright Chromium on an Apple M1 **using the real GPU** (`--use-angle=metal`; renderer reported as `ANGLE (Apple, ANGLE Metal Renderer: Apple M1)`), Google Analytics blocked.
- Four viewports — desktop 1440×900, laptop 1280×800, tablet 834×1194 (touch, 2×), mobile 390×844 (touch, 2×) — plus native full screen on desktop.
- Operating states, not only idle: the first-visit introduction, a vehicle arriving at 5× speed, active charging, every station visualisation mode, the dynamic road with its cutaway, the autonomous manoeuvre and the district.
- `curl` of the published page to see what the server sends.

Screenshots are in [`screenshots/before/`](screenshots/before/). The audit script is reproducible: see §9.

## 2. Verified strengths

| Area | Evidence |
|---|---|
| Engine independent of rendering | `src/lib/wireless-charging` imports no React or three.js. The station, road and parking simulations step at fixed dt (50 ms / 1 ms / 20 ms) from a clock loop (`state/runtime.ts`) separate from the R3F render loop; pause and single-step are exact. |
| Scientific breadth | 20 registered models (`registry.ts`, ids WPT-EM-001 … WPT-DATA-001), matching the brief's list one for one (§6). 29 verification checks (`benchmarks.ts`) run in Vitest and in the page. |
| Energy accounting | `chain.ts` closes grid = battery + Σ stage losses exactly; the ledger residual is a tested quantity. |
| Honest labelling | Inputs are tagged INPUT, model outputs CALCULATED, sensor values carry a data mode (SIMULATED, never LIVE). Field legend states "analytical filament model (F1), not FEM" and the slowed animation. |
| Geometry from the model | Coil windings are built from the simulated turn count and radii; the receiver pad sits at the simulated air gap. |
| Rendering cost | 60 fps (p95 frame 17.4–17.7 ms) on desktop, laptop and mobile sizes; 45–50 fps on the 2× tablet. One canvas, one WebGL context. JS heap 58 MB after visiting every view and environment. |
| Full screen | Native Fullscreen API with an overlay fallback, F and Esc, tested. |
| Long-form content | Hero, research question, chain, model table, curriculum, PoC roadmap, gates, leadership and FAQ are server-rendered and readable without script. |

## 3. Verified weaknesses and their root causes

### 3.1 "3D view unavailable on this device" is in the server HTML (root cause found)

`curl` of the live page returns the string `3D view unavailable on this device`. `TwinApp` probes WebGL with `useSyncExternalStore`, whose server snapshot is `null`; `TwinSection` renders `webgl && quality ? <Scene/> : <Fallback/>`, so **the server always renders the no-WebGL fallback**. Consequences:

- Every visitor's first paint shows the failure message until hydration swaps it for the canvas (visible in `desktop-01-hero.jpg`, taken before hydration finished on the dev server).
- Anything that reads the HTML without running the bundle (link previews, crawlers, reader modes, fetch tools, a slow or failed script load) reports the 3D view as unavailable on a device that supports it.
- The capability probe itself is sound: it creates a WebGL2/WebGL context, reads the renderer, and releases it. No shader, texture, CSP or context-loss failure was found on Chromium/Metal.

**Correction:** render a neutral "preparing the 3D laboratory" state on the server and during hydration, and show the 2D fallback only after the client has probed WebGL and found none. Also add a context-loss handler, which the scene currently lacks (§3.9).

### 3.2 The 3D viewport is small and boxed in by panels

| Viewport | Canvas | Share of the viewport |
|---|---|---|
| Desktop 1440×900 | 720 × 752 px | **42 %** |
| Laptop 1280×800 | 560 × 652 px | **36 %** |
| Tablet 834×1194 | 834 × 693 px | 58 % |
| Mobile 390×844 | 390 × 490 px | 58 % |

On desktop the stage is the middle column of three, with an input panel on the left and results panels on the right, permanently. **Full screen does not enlarge the stage**: it removes the page header, but the three-column layout stays (`desktop-08-fullscreen.jpg`). The brief's 65–85 % target is not met anywhere.

### 3.3 Close-up camera framing is broken

The Magnetic Field, Exploded, Cutaway and Thermal views all fly to `padCloseUp()`, a camera at 0.165 m height between the pad and the battery tray. With the default offsets that line of sight passes the front wheel: **a tyre fills the right half of the frame and the pad occupies a sliver at the bottom** (`desktop-06-view-MagneticField.jpg`, `desktop-06-view-Exploded.jpg`). The exploded layers are barely visible. There is no per-view distance limit, no clipping guard and no framing of a selected component.

### 3.4 The vehicle reads as a smooth tub, not a car

`geometry.ts` extrudes a side silhouette across the width with a taper. The result has no shoulder or tumblehome worth the name, no pillars, mirrors that are small black boxes, no door seams, wheels pushed into straight-sided arches, and an open underside. There is no suspension, chassis, subframe, motor housing or underbody structure; the battery is twelve grey boxes in a tray; the "power electronics" are five boxes. Steering is never applied (the autonomous model computes a steering angle, the scene ignores it).

### 3.5 Station infrastructure is primitive

The power cabinet is a white box on a plinth (`desktop-05-station-charging.jpg`); its "internals" are four boxes and twelve fins. The canopy is a slab on four cylinders. There are no barriers, cameras, sensors or displays. The ground pad has no visible enclosure detail, insulation layers, terminal box or cable.

### 3.6 The city backdrop is noisy

The skyline's emissive window texture repeats at high density on 260 boxes; from the intro's aerial shot it reads as grey static (`desktop-02-intro.jpg`) and in the station shot it competes with the vehicle.

### 3.7 Controls collide and crowd the stage

At 1440 px the visualisation selector (nine modes) runs under the playback bar: labels are cut to "Explod…", "…loded" (`desktop-06-view-EnergyFlow.jpg`). The Digital Twin section exposes 36 buttons and five inputs at once in Explore mode, plus the nine-tab section bar and the mode switch; the stage is never the dominant element.

### 3.8 Weak storytelling inside the environments

After the six-scene intro, each environment opens on a static preset. The station has no guided sequence: the visitor must find "Vehicle arrives", then a view mode, then a component. Camera moves are a fixed-rate exponential approach; there is no event-driven choreography, no follow shot, no "return to overview".

### 3.9 three.js in the first page load (found during Phase 1)

`TwinSection` imported `labelRef` from `three/labels.ts` and `FLOW_COLORS` from `three/overlays.tsx`; both modules import three.js at run time, so the whole three.js bundle travelled with the page's initial JavaScript even though the scene itself was a lazy chunk. The first production build of the redesign still had those imports and measured 565 KB of gzipped initial JavaScript for this route (the pre-redesign build was not measured separately); after moving the constants into three-free modules, 305 KB, with the 3D bundle (≈ 233 KB gzipped) loading only when the laboratory mounts. See PERFORMANCE_REPORT.md.

### 3.10 Smaller defects

- No `webglcontextlost` handler on the twin's canvas: a lost context leaves a frozen canvas with no fallback.
- The dynamic cutaway shot frames the hero car and a passing car; the embedded pads under the lifted surface are out of frame (`desktop-07-env2-cutaway.jpg`).
- A React hydration-attribute warning appeared in all four viewports of the first audit run; two targeted reruns did not reproduce it. Treated as intermittent in development; rechecked against the production build after the redesign.
- `THREE.Clock` deprecation warning comes from @react-three/fiber, not from this code.
- `ERR_FAILED` in the console is the audit blocking Google Analytics, not a defect.

## 4. The brief's audit targets

| Target | Finding |
|---|---|
| Primitive geometric objects | **Confirmed** for cabinet, canopy, transformer, storage, battery, power electronics, city. Pads and wheels are reasonable. |
| Unrealistic vehicle models | **Confirmed** (§3.4). |
| Incorrect physical proportions | Partly. Wheelbase 2.9 m, wheel radius 0.355 m and pad dimensions are plausible; body section and greenhouse are not. |
| Poor material quality | Partly. PBR materials exist (clearcoat paint, metallic copper) but the reflection environment is a generic room, so paint shows no controlled highlights. |
| Weak lighting | Partly. Key, fill and two point lights; no contact shadow under cars, which float visually on the concrete. |
| Lack of environmental context | Not confirmed: there is a site, canopy, highway and city — the problem is quality and clutter, not absence. |
| Excessive text | **Confirmed** inside the twin section (panels with long hints in Explore mode). |
| Too many controls | **Confirmed** (§3.7). |
| Small 3D viewport | **Confirmed** (§3.2). |
| Unclear visual hierarchy | **Confirmed**: the stage, panels and section bar compete. |
| Unnatural movement | Partly. Vehicle arrival follows the station model's deceleration law and wheels roll by distance; steering is missing; camera moves are fixed-rate. |
| Artificial magnetic field visualisation | **Not confirmed.** The field section is computed from the filament model with ferrite images, on a labelled log scale; field lines are traced from the same model. The problem is framing (§3.3), not the science. |
| Disconnected simulation and animation | **Not confirmed** for the station, road and parking: the scene reads the simulation state each frame. The ambient highway traffic is decorative and moves on its own clock, which is acceptable because it carries no data. |
| Poor camera positioning | **Confirmed** (§3.3). |
| Lack of component-level detail | **Confirmed** (§3.4, §3.5). |
| Excessive dashboard presentation | **Confirmed**: a three-column dashboard with a 3D picture in the middle. |

## 5. Existing functionality inventory (preserved)

- Sections: Overview, Digital Twin, Physics & Mathematics, Simulation Lab, Circuit Lab, IoT & Data, Research Lab, Practical Workshop, Engineering Assurance.
- Experience modes: Explore, Learn, Engineer, Research (content depth gating via `AtDepth`).
- Environments: Station, Dynamic, Autonomous, Infrastructure; visualisation modes Cinematic, Engineering, X-Ray, Cutaway, Exploded, Magnetic Field, Energy Flow, Thermal, IoT Communication.
- Station: 19-phase sequence with event log, fault injection (FOD, LOD, E-stop, isolation, controller, unavailable, unauthorised, overcurrent, FOD disabled, link degradations, disconnected sensors), power/efficiency, loss breakdown, coupling and resonance, battery and session, telemetry with data modes.
- Dynamic: speed profiles, coverage, misalignment, energy balance, power along the road. Autonomous: EKF parking, station ranking, reservation. Infrastructure: five dispatch policies, the day chart, energy totals.
- Labs: lessons with live equations, simulation experiments, circuit topologies and sweeps, IoT bus and data modes, research sweeps and the in-page verification suite, the 32-week / 64-unit workshop, review gates, standards awareness.
- Six-scene introduction with captions, optional browser narration and synthesised ambience, skip/pause/replay, never with reduced motion.
- Research & Project Leadership (Ms. Tanuja Jadhav, Lead Researcher; Mr. Sudarshana Karkala, Co-Researcher) with animated borders.

## 6. Scientific model inventory (verified against `registry.ts`)

| Brief's item | Registry id |
|---|---|
| Circular-filament magnetic coupling | WPT-EM-001 |
| Magnetic field sections | WPT-EM-002 |
| Series–series resonant circuit | WPT-CIR-001 |
| AC nodal analysis | WPT-CIR-002 |
| Winding losses | WPT-LOSS-001 |
| Semiconductor losses | WPT-LOSS-002 |
| Converter losses | WPT-LOSS-003 |
| Thermal behaviour | WPT-TH-001 |
| Battery equivalent circuit | WPT-BAT-001 |
| Vehicle longitudinal dynamics | WPT-VEH-001 |
| Stationary electrical energy flow | WPT-SYS-001 |
| Charging state machine | WPT-CTRL-001 |
| Stationary charging simulation | WPT-SIM-001 |
| Dynamic road charging simulation | WPT-SIM-002 |
| Autonomous parking | WPT-AV-001 |
| EKF localisation | WPT-AV-002 |
| Charging station selection | WPT-AV-003 |
| District energy dispatch | WPT-GRID-001 |
| IoT communication | WPT-IOT-001 |
| Sensor and telemetry models | WPT-DATA-001 |

No scientific defect was found in this audit that requires a model change before the visual redesign. The redesign consumes these models unchanged; any later correction will be documented in `SCIENTIFIC_VALIDATION_REPORT.md` with its numerical effect.

## 7. Performance measurements (before)

Apple M1, Chromium via Metal, dev server (unminified), GA blocked.

| Viewport | Load event | First frame of the scene | Intro fps (p95 ms) | Station charging fps (p95 ms) |
|---|---|---|---|---|
| Desktop 1440×900 | 1.18 s | ≈ 5.4 s after navigation (includes dev compilation) | 60.2 (17.7) | 60.1 (17.4) |
| Laptop 1280×800 | 0.34 s | ≈ 4.5 s | 60.2 (17.6) | 60.1 (17.6) |
| Tablet 834×1194 @2× | 0.68 s | ≈ 5.1 s | 49.7 (33.4) | 45.4 (34.0) |
| Mobile 390×844 @2× | 0.45 s | ≈ 4.7 s | 60.1 (17.6) | 59.9 (17.7) |

Dynamic road: 60.1 fps. Canvases: 1. JS heap after a full tour: 58 MB. Production-build figures are in `PERFORMANCE_REPORT.md`.

## 8. Redesign recommendations and priorities

1. **Fix the server-rendered fallback** (§3.1) and add context-loss handling. Small change, removes a false failure message from every first paint.
2. **Immersive laboratory shell:** the scene fills the laboratory; a compact environment rail on the left; inspector on the right only when something is selected or a Learn/Engineer/Research panel is open; a cinematic timeline at the bottom; an instrument strip with the metrics of the current stage only. Full screen must enlarge the scene.
3. **Camera director:** spherical camera poses per engineering stage with eased moves timed by distance, follow shots on the moving vehicle, framing of any selected component from its bounds, immediate hand-over to the visitor on any pointer input, reset and return-to-overview, reduced motion honoured.
4. **Flagship assets:** a lofted, unbranded vehicle with glass, pillars, mirrors, seams, arches, tyres with tread, multi-spoke wheels, brakes, suspension, subframes, rear drive unit, battery enclosure with modules, busbars and cooling plate, front power-electronics unit and the receiver assembly; layered pads (cover, Litz winding, ferrite, insulation, aluminium shield, base, terminal box) that explode away from the true air gap; a power cabinet with PFC, DC link, SiC modules on a cold plate, gate drivers, busbars, resonant capacitors and protection; a refined canopy with PV modules.
5. **Light and environment:** a generated studio-sky reflection environment with soft boxes so paint and metal read correctly, contact shadows under vehicles, restrained bloom, a calmer skyline.
6. **Guided station sequence:** 12 engineering stages from overview to departure, each with a camera state, components, simulation condition, explanation, telemetry, physics concept, model and narration; auto-advance in Explore, pause on interaction, resumable, no unexpected resets.
7. **Component inspector:** three information levels, isolate/explode, links to the lesson and the model.
8. Bring the dynamic, autonomous and infrastructure environments and the new Smart Parking Shelter to the same standard only after the station scene is accepted (brief §33).

## 9. Reproducing this audit

The Playwright script that produced these numbers and screenshots lives in the scratch space of the session that ran it; its successor is committed as `scripts/test-wireless-ev-twin.cjs`, which drives the redesigned laboratory the same way (four viewports, operating states, fps, canvas count, console errors).
