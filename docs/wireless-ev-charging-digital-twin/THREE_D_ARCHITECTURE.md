# 3D architecture

React Three Fiber 9 on three.js 0.186, the stack the rest of the site uses. Nothing was replaced; the scene was rebuilt around typed modules with one job each.

## Modules

```
src/components/wireless-ev-twin/
  TwinApp.tsx               Toolbar, sections, mode switching, capability probe (client only), #demo
  lab/
    Laboratory.tsx          Shell: rail, stage card, instruments, drawer, legends, labels, fallback, timeline, inspector
    Timeline.tsx            Playback, stage strip (scrubber), clock and time scale, camera, view menu, narration, captions, sound
    Inspector.tsx           Component (three levels) · Science (stage physics, FHA waveforms) · Data (environment panels)
    metrics.ts              Instrument registry: one reader per metric, each tagged INPUT / CALCULATED / SIMULATED
  story/
    stages.ts               Stage registry: 12 station stages, 9 road stages and their road presets, short sequences for the others, 8 demo chapters
    guide.ts                Guide controller: enter/advance/pause/resume stages, demonstration, narration, ambience
    simControl.ts           Brings the simulation to a stage's state using the model's own commands and steps
  state/
    store.ts                Interface state (zustand): section, mode, view, selection, guide, camera, panels, inputs
    runtime.ts              The simulations and their fixed-step clock, outside React (unchanged design)
  three/
    Scene.tsx               Canvas, quality settings, adaptive pixel ratio, context-loss guard, effects, ready signal
    stage.tsx               Lighting and the generated studio-sky reflection environment
    camera.tsx              Shot registry and the camera rig (see CAMERA_AND_ANIMATION_SYSTEM.md)
    viewState.ts            Per-frame view channels eased toward the current view (no React state at frame rate)
    highlight.tsx           Selection tint and isolation ghosting by component id
    pick.ts                 Pointer handlers that tag meshes with their component id
    componentViews.ts       The view in which each component is visible
    vehicle/                body.ts (lofted body, interior), wheel.ts, chassis.ts (powertrain, battery, suspension), Vehicle.tsx
    station/                Site.tsx (shelter, devices, transformer, storage), Pad.tsx (layered pads), Cabinet.tsx, Surroundings.tsx
    road/                   layout.ts (cross-section, layers, wrap), Corridor.tsx (lanes, median, barriers, lamps, cabinets, gantries, verge),
                            RoadPads.tsx (pad modules, states, interlock band, request window), Cutaway.tsx (section cut, duct bank),
                            CouplingChart.tsx, segmentLook.ts (state → look, three-free), road.test.ts
    world.tsx               Sky, ground, skyline, hero vehicle pose, traffic, the highway (assembled from road/)
    overlays.tsx            Field section and lines, energy flow, IoT pulses, alignment dimensions, district flows
    labels.ts               DOM labels projected from 3D anchors (no three.js import at run time)
```

## Rules

1. **The scene only reads.** Every pose, glow and value comes from `runtime` (the simulations) or the store. No component computes engineering values; overlays call the engine's own functions (`fieldFromBasis`, `traceFieldLines`, the chain point).
2. **No React state at frame rate.** Frame-loop values live in `view` (eased channels), refs and three.js objects. Writes to hook-held objects go through `mutate.ts` helpers, which the React Compiler's immutability rule accepts.
3. **Geometry and materials are built once.** Vehicle geometry and wheel materials are module-level singletons shared by every car; per-vehicle materials are created per paint and per layer, and disposed on unmount. Pads, cabinet and site dispose what they create.
4. **Selectable means tagged.** A mesh is selectable when it carries `userData.component` from the component registry (41 ids). The highlight, isolation and framing all find parts by that id.
5. **One canvas.** The laboratory mounts a single `<Canvas>`; the 2D fallback replaces it, never accompanies it.
6. **Three.js stays out of the first load.** The interface imports only three-free modules (`labels.ts`, `flowColors.ts`, `fieldScale.ts`, `componentViews.ts`) and `import type` for anything else. The 3D chunk (≈ 233 KB gzipped) loads with `next/dynamic` and `ssr: false`.

## Rendering pipeline

| Setting | High | Balanced | Performance |
|---|---|---|---|
| Pixel ratio ceiling | 1.75 | 1.35 | 1 |
| Shadows | 2048² PCF | 1024² PCF | off |
| Post-processing | Bloom (threshold 0.95), vignette, AgX in the composer | same | none; AgX in the renderer |
| Adaptive pixel ratio (Auto) | drei `PerformanceMonitor` lowers to 1.0 on sustained frame drops | same | — |

*Auto* maps the device's measured capability (WebGL2, renderer, memory, cores; never the user agent) to High, Balanced or Performance. Quality never changes a calculated value (tested: a quality change keeps the same canvas and the same instruments).

The canvas renders only while the laboratory is on screen (`frameloop` switches to `never` when an IntersectionObserver reports it out of view). The simulation clock keeps running independently.

## Fallbacks

- **No WebGL** (probed on the client only): the 2D field map from the same model, with a message saying so.
- **Server render and hydration:** a neutral *Preparing the 3D laboratory* state. The old page rendered the no-WebGL message here (see CURRENT_IMPLEMENTATION_AUDIT.md §3.1).
- **Lost context:** the canvas waits 2.5 s for the browser to restore it, then switches to the 2D view with a message; losses caused by the canvas's own unmount are ignored.

## Development hooks

Outside production builds, `window.__wevct` (store and runtime), `window.__wevctScene` (the scene graph) and `window.__wevctShot` (a fixed camera shot) exist for the inspection scripts. Production builds strip them (`process.env.NODE_ENV` checks).
