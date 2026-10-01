# Satellite Explorer 3D

Interactive 3D learning experience for the 6U Earth-observation reference satellite.

- Route: `/space/satellite-engineering/interactive-3d` (canonical on `aerospace.ev.engineer`)
- Route files: `src/app/space/satellite-engineering/interactive-3d/`
- Application: `src/components/satellite-explorer/`
- Assets: `public/space/satellite-explorer/`

The spacecraft, its numbers and its mission are an **educational reference**. Every figure shown is a reference or simulated value; nothing describes flight hardware, a real mission or an operational ground station.

## Which experience a visitor gets

`SatelliteExplorer.tsx` decides on the client, from viewport width and a WebGL probe (never the user agent):

| Viewport | WebGL | Experience |
| --- | --- | --- |
| < 1024 px | any | `MobileExplorer` — compact learning page with the desktop recommendation |
| ≥ 1024 px | yes | `DesktopExplorer` — the 3D application, loaded as a separate chunk |
| ≥ 1024 px | no | `MobileExplorer variant="fallback"` — static overview with the "3D unavailable" message |

The server cannot know the viewport, so it renders the compact page and the loading scene together and CSS shows the right one until hydration. Phones never download three.js or the Earth textures, and never create a WebGL context.

## Layout of the code

```
satellite-explorer/
  types.ts                 shared ids and SatelliteState (no three.js, no React)
  data/                    what is taught: reference spacecraft, components, build / mission / tour content
  simulation/              pure domain models: orbit, power, adcs, communications, payload, mission
  state/                   Zustand store, per-frame clocks, selectors (what each part looks like per view)
  scene/                   canvas, simulation driver, camera rig and presets, Earth, lighting, ground station
  spacecraft/              procedural model: layout, parts, materials, model registry
  overlays/                power / data / RF flows, orbit geometry, payload footprint, ADCS vectors, labels
  modes/                   controls and side panels for each mode
  ui/                      header, toolbar, panels, timeline, console, help, hero, loading
```

Rules the structure enforces:

- **Physics is not computed in React components.** `simulation/` is pure and unit-tested. `scene/SimulationDriver.tsx` samples it once per frame and writes `scene/frameState.ts`; everything that draws only reads that.
- **Per-frame values never go through React state.** The driver mirrors a summary into the store about eight times a second for the interface.
- **The mission is a state machine.** `simulation/mission.ts` exposes `missionReducer` (RUN, PLAY, PAUSE, NEXT, PREVIOUS, RESTART, SEEK, TICK, RESET) and `missionSnapshotAt(time)`, a deterministic function from mission time to spacecraft state. Scrubbing and replaying always give the same result.
- **Interaction uses semantic component ids** (`"battery"`, `"reaction-wheel-x"`, …), never mesh names.

## The orbit, and why events happen where they do

`simulation/orbit.ts` defines a circular 525 km, 97.5° orbit over a rotating Earth with a fixed Sun direction. Orbit time `0` is the overflight of the observation target on a descending pass at 10:30 local solar time; the node and Earth's rotation phase are solved from that. Eclipse exit, the ground-station pass (AOS, closest approach, LOS) and eclipse entry are then *found numerically*, and the mission stages are laid over them. The 12:00 mission clock is a compressed educational timeline; the order of events and their geometry come from the model.

## Replacing the procedural spacecraft with a GLB

1. Load the model in `spacecraft/SatelliteModel.tsx` in place of the procedural subsystem components.
2. Map its nodes to semantic ids with `bindModel(scene, { battery: "NodeName", "reaction-wheel-x": ["A", "B"], … })` from `spacecraft/modelRegistry.ts`. It returns the ids it could not find.
3. Supply a `SpacecraftLayout` in `spacecraft/layout.ts` for the new geometry (anchors, exploded offsets, staging offsets) and, if the harness differs, new routes in `spacecraft/flowRoutes.ts`.

Selection, outline, camera focus, labels, panels, Build Mode, X-ray and the flows all resolve through the ids, so none of that logic changes. A different spacecraft (3U, 12U, a communications satellite) is the same three steps plus new entries in `data/`.

## Feeding it from another simulation

The renderer consumes `SatelliteState` (`types.ts`): time, battery state of charge, generation, load, mode, attitude, ground contact and payload data. `SatelliteStateSource` is the interface a different source — CubeTwin, for example — would implement. Failure scenarios (degraded array, low battery, wheel unavailable) would enter the same way, as different outputs of `simulation/`; `SpacecraftMode` already includes `SUN_SAFE`.

## Assets

| File | Use |
| --- | --- |
| `earth-day-4k.jpg`, `earth-day-2k.jpg` | Day map (4K on the high quality tier) |
| `earth-night-2k.jpg`, `earth-clouds-2k.jpg` | City lights, clouds |
| `poster.jpg` | Still of the scene: mobile hero and the Satellite Engineering CTA |
| `og-background.jpg` | Still of the scene behind the Open Graph card |

Earth imagery is NASA Visible Earth (Blue Marble, public domain), credited in the interface. If a texture fails to load the Earth shader falls back to a procedural surface and the scene still starts.

## Quality tiers

`lib/capabilities.ts` picks a tier from device memory, core count, WebGL 2 support and whether WebGL is software-rendered. The pixel ratio is clamped at 1.75. The low tier drops shadows, post-processing and clouds. `prefers-reduced-motion` makes camera moves, part animation and exploded-view changes immediate and stops the hero drift.

## Analytics

Events go through the existing `trackEvent` / `data-track-event` mechanism: `satellite_3d_launch`, `guided_tour_start`, `build_mode_open`, `exploded_view_open`, `system_power_open`, `system_adcs_open`, `mission_run`, `mission_complete`, `signal_view_open`, `cubesat_crosslink`, `desktop_recommendation_mobile`.

## Testing

```bash
npm test                                 # unit tests (simulation, state, data, UI, mobile fallback, SEO, CTAs)
npm run build && npm run start -- --port 3100
npm run test:satellite-explorer:e2e      # browser acceptance checks against the production build
```

The acceptance script drives Chromium at 1440 × 900 through every first-release criterion and at 390 × 844 for the mobile page, and saves screenshots (hero, Build Mode, exploded view, Power, mission ground pass, mobile) to `EXPLORER_QA_DIR` (default `/private/tmp/satellite-explorer-qa`). Set `EXPLORER_FULL_RUN=1` to let the mission play in real time instead of stepping through its stages.
