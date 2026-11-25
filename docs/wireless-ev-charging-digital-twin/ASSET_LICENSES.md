# Asset provenance and licences

Every visual in the Wireless EV Charging Digital Twin is created in this repository. No external 3D models, textures, HDR images, audio files or fonts beyond those the site already uses are downloaded.

| Asset | Source | Licence |
|---|---|---|
| Vehicle body, glass, wheels, lights | Procedural geometry, `src/components/wireless-ev-twin/three/geometry.ts` and `parts.tsx` | Original work of the EV.ENGINEER™ team |
| Charging pads (Litz spiral, ferrite bars, shield, housing) | Procedural; the winding follows the simulated turn count and radii | Original |
| Parking site, solar canopy, cabinet, transformer, storage, highway and its layers | Procedural, `three/world.tsx` | Original |
| City skyline | Procedural boxes with a canvas-drawn window texture | Original |
| Concrete, asphalt, PV, PCB and lane textures | Drawn on a canvas at start-up from deterministic noise, `three/materials.ts` | Original |
| Sky | Gradient shader | Original |
| Reflections | three.js `RoomEnvironment`, generated in the browser | MIT (three.js) |
| Field, energy-flow and IoT overlays | Computed from the simulation | Original |
| Intro sound | Synthesised in the browser with the Web Audio API (off by default) | Original |
| Intro narration | The visitor's browser speech synthesis (off by default) | Browser-provided voice |
| Icons | lucide-react | ISC |
| Fonts | Manrope and Inter through `next/font/google` (already used by the site) | SIL Open Font License 1.1 |

Libraries: three.js (MIT), @react-three/fiber, @react-three/drei, @react-three/postprocessing and postprocessing (MIT), zustand (MIT) — all already dependencies of the site.
