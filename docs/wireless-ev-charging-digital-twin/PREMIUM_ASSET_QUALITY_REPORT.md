# Premium asset quality report (Phase 3.5)

All assets remain procedural and original — generated in the browser from code in this repository. Nothing was downloaded or purchased; no third-party model, texture or HDR is used, so no licence or attribution applies beyond the repository's own (see ASSET_LICENSES.md).

## Vehicle

| | Before | After |
|---|---|---|
| Section | One smooth spline through ten knots: a rounded "bubble" | Eight bands between creases (floor, rocker, door, shoulder, belt seal, glass, roof seal, roof); each band smooth, every crease a hard edge (`three/vehicle/body.ts`) |
| Glasshouse | Same surface as the body | Glass inset 14 mm behind black seals at the belt and roof rail; gloss-black A, B and C pillars; panoramic glass roof; tumblehome ≈ 25° |
| Plan | Superellipse p = 4.2/5.2 (pill-shaped corners) | p = 5.4 front, 7.5 rear (squarer, more architectural) |
| Lamps | Thin red and white strips | Full-width front light bar continuing into wrap-around headlamp blades that follow the body surface; full-width rear light bar wrapping the corners; reverse lenses (`vehicle/details.ts`) |
| Shut lines | Three thin door strips | Shader-drawn shut lines of the bonnet, doors, lower door edge, boot lid and charge-port door, darkening paint and removing clear coat inside the gap (no geometry) |
| Detail | Mirrors as eggs, box handles | Gloss-black mirror caps on stalks, flush handles, grille insert, rear diffuser with fins, wipers, antenna fin, blank plates (no lettering) |
| Paint | Metalness 0.55 for every colour | Clear-coat paint whose flake (metalness) and roughness follow the colour: light paints solid, dark paints metallic |
| Dimensions | 4.70 × 1.88 × 1.47 m, 2.90 m wheelbase | unchanged (tested) — the engineering frame, receiver position and ride-height binding are untouched |

Geometry: ≈ 22 k triangles for the body at 96 + 44 stations × 64-row ring, plus ≈ 3 k for details. Shared by every vehicle in the scene.

## Environment

| | Before | After |
|---|---|---|
| Sky | Blue-hour gradient | Daylight sky shader: Rayleigh-like gradient, Mie halo and sun disc, domain-warped cumulus; the same shader drives the reflection map (`three/sky.ts`) |
| Reflections | Generic studio | Daylight sky, warm-grey ground, two soft architectural strips and dark masses at the horizon, prefiltered (PMREM): paint carries a real horizon line |
| Key light | Cool directional | Sun matching the sky's sun direction, soft shadows following the environment; hemispheric sky fill; haze to the horizon |
| Inspection | Fog to black | Studio cross-fade: sun dims, camera-relative key, fill and rim lights rise, ground falls to a dark floor |
| Trees | Cones | Four species (broadleaf, columnar, spreading, young) and shrubs: bent trunks with branches, crowns of leaf-cluster cards with shaded interiors, two variants per species, per-tree scale, rotation and tint, gentle wind sway (`three/env/foliage.ts`, `Forest.tsx`) |
| City | Boxes with emissive static | Towers with podium, setbacks and mechanical crown; slabs; mid-rise blocks; glass curtain walls and punched concrete façades mapped in metres (3.0 m bays, 3.6 m floors) with per-building tint; a ring of hills for atmospheric depth (`three/env/buildings.ts`) |
| Ground | One concrete plane | Paved site and lawns; two-scale anti-tiling with lush and dry patches; verges likewise |
| Road | — | Lane markings polygon-offset; verges anti-tiled; skyline set back 230–380 m |

## Materials (physically based)

Automotive paint (clear coat, flake by colour), tinted glass (opacity 0.965, clear coat), gloss and satin black trim, rubber with tread bump map, brushed aluminium rims, cast iron discs, copper windings, ferrite, aluminium shields, resin covers, PCB, asphalt, concrete, glass and concrete façades, PV modules, foliage (alpha-to-coverage). Normal maps were evaluated and not added: at these camera distances the shading detail comes from geometry creases and the reflection environment; they remain an option for close-ups.

## Performance impact

See PERFORMANCE_REPORT.md for measured frame rates. Draw-call additions: foliage ≈ 20 (instanced), city 2–3 (merged), body details 6 per vehicle. Texture memory: all canvas textures ≤ 512², the leaf texture 256².
