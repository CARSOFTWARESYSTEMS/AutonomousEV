# Asset provenance and licences

Every visual in the Wireless EV Charging Digital Twin is created in this repository. No external 3D models, textures, HDR images, audio files or fonts beyond those the site already uses are downloaded. See ENGINEERING_ASSET_REGISTRY.md for what each asset represents.

| Asset | Source | Licence |
|---|---|---|
| Vehicle body, glass, interior, mirrors, cladding | Lofted procedural geometry, `src/components/wireless-ev-twin/three/vehicle/body.ts` | Original work of the EV.ENGINEER™ team |
| Wheels, tyres (tread bump map drawn on a canvas), brakes | `three/vehicle/wheel.ts` | Original |
| Chassis, battery, powertrain, suspension, receiver electronics, HV cabling | `three/vehicle/chassis.ts` | Original |
| Charging pads (enclosure, FOD array texture, potting, Litz winding, former, ferrite, insulation, shield, base) | `three/station/Pad.tsx`; the winding follows the simulated turn count and radii | Original |
| Power cabinet and its internals | `three/station/Cabinet.tsx` | Original |
| Solar shelter, site devices, transformer, storage, apron, lights, planters | `three/station/Site.tsx`, `Surroundings.tsx` | Original |
| Highway, road layers, road pads, skyline, traffic | `three/world.tsx` | Original |
| Concrete, asphalt, PV module, PCB, lane, window, contact-shadow textures | Drawn on a canvas at start-up from deterministic noise, `three/materials.ts` | Original |
| Reflection environment | A gradient sky and three soft boxes generated in the browser and prefiltered with three.js `PMREMGenerator`, `three/stage.tsx` | Original; three.js MIT |
| Field, energy-flow, IoT, alignment and district overlays | Computed from the simulation | Original |
| Hero poster `public/wireless-ev-twin/hero.jpg` | Rendered from the twin's own scene | Original |
| Ambient sound | Synthesised in the browser with the Web Audio API (off by default) | Original |
| Narration | The visitor's browser speech synthesis (off by default) | Browser-provided voice |
| Icons | lucide-react | ISC |
| Fonts | Manrope and Inter through `next/font/google` (already used by the site) | SIL Open Font License 1.1 |

Libraries: three.js (MIT), @react-three/fiber, @react-three/drei, @react-three/postprocessing and postprocessing (MIT), zustand (MIT) — all already dependencies of the site.

The vehicle is a neutral, unbranded design. It does not reproduce any manufacturer's car.
