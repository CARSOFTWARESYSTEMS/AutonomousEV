# UFlight™ 3D

Interactive 3D health-monitoring and digital-twin demonstrator for the UFlight™ Reference eVTOL (6 seats, 8 distributed electric propulsion units).

- Route: `/aerospace/uflight-3d` (canonical on `aerospace.ev.engineer`)
- Route files: `src/app/aerospace/uflight-3d/`
- Application: `src/components/uflight-3d/`
- Assets: `public/aerospace/uflight-3d/`
- Homepage section: `src/app/aerospace/page.tsx` ("UFLIGHT™ · DIGITAL ENGINEERING")

The aircraft, its telemetry, health states, faults and predictions are **illustrative and simulated**. Nothing describes certified, flight-proven or production hardware, and the copy must not say so. No other company, aircraft or product is named anywhere in the experience; `data/data.test.ts` checks the content for both rules.

## Which experience a visitor gets

`UFlightExplorer.tsx` decides on the client, from viewport width and a WebGL probe (never the user agent):

| Viewport | WebGL | Experience |
| --- | --- | --- |
| < 1024 px | any | `MobileUFlight` — overview page with "DESKTOP EXPERIENCE RECOMMENDED" |
| ≥ 1024 px | yes | `DesktopUFlight` — the 3D application, loaded as a separate chunk |
| ≥ 1024 px | no | `MobileUFlight variant="fallback"` — the same overview, with a plain "3D unavailable" note |

The server renders the overview page and the loading screen together and CSS shows the right one until hydration. Phones never download three.js and never create a WebGL context.

The desktop application fills the viewport and does not scroll, so the "Prepared by" block and the review date sit at the foot of the overview page and, on desktop, in the **About this experience** panel (the info button in the header). Both use the shared `src/components/PreparedBy.tsx`; the text and date are `PREPARED_BY` in `data/uflightReferenceAircraft.ts`.

## Layout of the code

```
uflight-3d/
  types.ts        shared ids and state types (no three.js, no React)
  data/           what is taught: aircraft, components, sensors, HUMS layers, fault scenarios, mission
  simulation/     pure models: mission, fault progression, signals, prognostics, propulsion, battery,
                  thermal, structures, HUMS roll-up, twin
  state/          Zustand store, simulation clocks, selectors (what each part looks like per view)
  scene/          canvas, simulation driver, camera rig and presets, lighting, the four environments
  aircraft/       procedural model: layout, geometry, materials, parts, model registry
  overlays/       flows, sensor markers, labels, load paths, vibration, twin reference, trace
  modes/          controls and side panels for each mode
  ui/             header, toolbar, panels, charts, hero, loading, help, about
```

Rules the structure enforces:

- **Simulation is independent of rendering.** `simulation/` is pure and unit-tested. `scene/SimulationDriver.tsx` samples it once per frame and writes `scene/frameState.ts`; everything that draws only reads that.
- **Per-frame values never go through React state.** The driver mirrors a summary into the store about eight times a second for the interface.
- **The mission and the fault scenario are state machines.** `missionReducer` (`simulation/mission.ts`) and `faultReducer` (`simulation/faultModels.ts`) are the only things that move them. `flightStateAt(time, profile)` is a deterministic function of mission time, so stepping, scrubbing and replaying always agree.
- **One fault model, read three ways.** The severity of the bearing fault drives the vibration feature, the synthesised signal (time, frequency and order views) and the prognosis from the same constants, so the chart, the number and the state can never disagree.
- **Interaction uses semantic component ids** (`"pu04-motor"`, `"battery-module-03"`, …), never mesh names.

## Health vocabulary

Component and system states are `NOMINAL`, `DEGRADED`, `LIMITED`, `MAINTENANCE REQUIRED`, `UNAVAILABLE`. The aircraft is `MISSION CAPABLE`, `MISSION CAPABLE WITH LIMITATION` or `NOT RELEASED`. `simulation/hums.ts` rolls component states up to systems and to the aircraft: a degraded component alone leaves the aircraft mission capable; a limited one adds the limitation; maintenance required or unavailable withholds release. Maintenance windows are always a range of flight cycles rounded to five, never a single number.

## Adding a fault scenario

1. Describe it in `data/faultScenarios.ts` (the scenarios marked `available: false` are listed in the Fault Lab as planned).
2. Add its model beside `bearingDegradation` and `batteryImbalance` in `simulation/faultModels.ts`: a function from severity to the observed values.
3. Feed it into `buildHealthSnapshot` (`simulation/hums.ts`) so the component, system and aircraft states follow.
4. Give it a camera preset and a focus set in `state/selectors.ts`, and its panel content in `modes/FaultLabMode.tsx`.

## Replacing the procedural aircraft with a GLB

1. Load the model in `aircraft/UFlightAircraft.tsx` in place of the procedural parts.
2. Call `bindModel(scene)` from `aircraft/modelRegistry.ts`. It registers nodes under semantic ids using each component's `meshNames` (`data/componentDefinitions.ts`) and returns the ids it could not find.
3. Update `aircraft/layout.ts` (anchors, exploded offsets, equipment positions) and, if the harness differs, the routes in `aircraft/routes.ts`.

Selection, outline, camera focus, labels, panels, X-ray, the exploded view, sensors and flows all resolve through the ids, so none of that logic changes.

## Performance

The pixel ratio is clamped at 1.75 and the quality tier comes from `satellite-explorer/lib/capabilities.ts`. Parts inside the airframe (`ENCLOSED` in `data/componentDefinitions.ts`) are not drawn, and never cast shadows, while the skin is opaque; they appear with X-ray, a system view or the exploded view.

Measured on the production build at 1440 × 900 and pixel ratio 1.75 (Apple M1): about 580 draw calls and 170k triangles per frame in the opening and aircraft views, about 1,300 draw calls and 310k triangles with the skin see-through, at 53–60 frames per second. The target is fewer than 400k visible triangles.

`prefers-reduced-motion` makes camera moves, part animation and exploded-view changes immediate.

## Assets

| File | Use |
| --- | --- |
| `poster.jpg` | Still of the scene: overview page hero and the Aerospace homepage section |
| `og-background.jpg` | Still of the scene behind the Open Graph card |

Both are rendered from the running application, so re-render them after a visible change to the aircraft.

## Analytics

Events go through the existing `trackEvent` / `data-track-event` mechanism: `uflight_3d_launch`, `uflight_3d_health_demo`, `uflight_3d_aircraft_mode`, `uflight_3d_systems_mode`, `uflight_3d_health_mode`, `uflight_3d_mission_mode`, `uflight_3d_fault_lab`, `uflight_3d_twin_mode`, `uflight_3d_architecture`, `uflight_3d_xray`, `uflight_3d_exploded`, `uflight_3d_propulsion`, `uflight_3d_energy`, `uflight_3d_sensor_trace`, `uflight_3d_bearing_fault`, `uflight_3d_battery_fault`, `uflight_3d_mission_start`, `uflight_3d_mission_complete`, `uflight_3d_mobile_desktop_recommendation`.

## Testing

```bash
npm test                                 # unit tests (simulation, data, state, UI, overview page, SEO, homepage section)
npm run build && npm run start -- --port 3100
npm run test:uflight-3d:e2e              # browser acceptance checks against the production build
```

The acceptance script drives Chromium at 1440 × 900 through every mode (X-ray, exploded view, systems, health, sensor trace, the bearing fault from healthy to maintenance, twin, architecture, the mission end to end, the homepage section) and at 390 × 844 for the overview page, and saves screenshots to `UFLIGHT_QA_DIR` (default `/private/tmp/uflight-3d-qa`). Set `UFLIGHT_FULL_RUN=1` to let the executive mission play in real time instead of stepping through its stages, and `UFLIGHT_BASE_URL` to test another host.
