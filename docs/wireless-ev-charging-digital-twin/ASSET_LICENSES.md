# Asset provenance and licences

Every visual in the Wireless EV Charging Digital Twin is created in this repository. No external 3D models, textures, HDR images, audio files or fonts beyond those the site already uses are downloaded. See ENGINEERING_ASSET_REGISTRY.md for what each asset represents.

| Asset | Source | Licence |
|---|---|---|
| Vehicle body, glass, interior, cladding | Lofted procedural geometry with crease bands, `src/components/wireless-ev-twin/three/vehicle/body.ts` | Original work of the EV.ENGINEER™ team |
| Vehicle detail (lamp blades, grille, diffuser, plates without lettering, mirrors, wipers, antenna fin) and shader-drawn shut lines | `three/vehicle/details.ts` | Original |
| Daylight sky and the reflection environment built from it | Shader and generated scene prefiltered with `PMREMGenerator`, `three/sky.ts`, `three/stage.tsx` | Original; three.js MIT |
| Trees and shrubs (four species), leaf texture | Procedural geometry and a canvas texture, `three/env/foliage.ts`, `Forest.tsx` | Original |
| City buildings, façade textures, hills | `three/env/buildings.ts` | Original |
| Charging-in-motion visuals and the road field view | Computed from the simulation, `three/road/RoadEnergy.tsx`, `RoadField.tsx` | Original |
| JetBrains Mono (labels and readings) | `next/font/google`, this route only | SIL Open Font License 1.1 |
| Wheels, tyres (tread bump map drawn on a canvas), brakes | `three/vehicle/wheel.ts` | Original |
| Chassis, battery, powertrain, suspension, receiver electronics, HV cabling | `three/vehicle/chassis.ts` | Original |
| Charging pads (enclosure, FOD array texture, potting, Litz winding, former, ferrite, insulation, shield, base) | `three/station/Pad.tsx`; the winding follows the simulated turn count and radii | Original |
| Power cabinet and its internals | `three/station/Cabinet.tsx` | Original |
| Solar shelter, site devices, transformer, storage, apron, lights, planters | `three/station/Site.tsx`, `Surroundings.tsx` | Original |
| Highway, road layers, road pads, skyline, traffic | `three/world.tsx` | Original |
| Concrete, asphalt, PV module, PCB, lane, window, contact-shadow textures | Drawn on a canvas at start-up from deterministic noise, `three/materials.ts` | Original |
| Field, energy-flow, IoT, alignment and district overlays | Computed from the simulation | Original |
| Smart Parking pavement, bay markings, accessible and wireless bay symbols, landscape (Environment 01) | Procedural geometry and canvas textures from deterministic noise, `three/smart-parking/Facility.tsx`, `textures.ts` | Original |
| Smart Parking shelter, roof, gutters, cable trays, sensors, bay indicators, fans, luminaires | Procedural geometry, `three/smart-parking/Shelter.tsx` | Original |
| Gates, barriers, recognition cameras, reader pedestals, guidance sign, equipment yard | Procedural geometry, `three/smart-parking/Gates.tsx`, `Equipment.tsx` | Original |
| Facility vehicles, including the low-detail instanced bodies and the plate-grime decal | The shared vehicle model; the grime decal is drawn on a canvas, `three/smart-parking/Vehicles.tsx` | Original |
| Synthetic number plates | Generated text in each region's format, using markers that cannot be issued (ZZ, a leading 0, the test character 测) | Original; no real registrations |
| Routes, occupancy plates, IoT and energy flows, recognition cone, air-quality overlay | Computed from the simulation, `three/smart-parking/Overlays.tsx` | Original |
| Hero poster `public/wireless-ev-twin/hero.jpg` | Rendered from the twin's own scene | Original |
| Ambient sound | Synthesised in the browser with the Web Audio API (off by default) | Original |
| Narration | The visitor's browser speech synthesis (off by default) | Browser-provided voice |
| Icons | lucide-react | ISC |
| Fonts | Manrope and Inter through `next/font/google` (already used by the site) | SIL Open Font License 1.1 |

Libraries: three.js (MIT), @react-three/fiber, @react-three/drei, @react-three/postprocessing and postprocessing (MIT), zustand (MIT) — all already dependencies of the site.

The vehicle is a neutral, unbranded design. It does not reproduce any manufacturer's car.

Phase 3.5 evaluated licensed GLB/glTF vehicles and environments and used none: downloads need the team's authorisation, the candidates were stylised or carried attribution terms, and an imported body would be disconnected from the engineering bindings. See PHASE_3_5_VISUAL_REFINEMENT_PLAN.md §2.
