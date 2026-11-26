# Engineering asset registry

Every 3D asset is procedural geometry built in this repository. Dimensions are **representative engineering geometry**, not a verified production component. Where a dimension comes from the simulation, it says so.

## Vehicle (`three/vehicle/`)

| Asset | Construction | Dimensions | Driven by |
|---|---|---|---|
| Body | Lofted surface: side profile, plan superellipse and a 10-knot cross-section per station (Catmull–Rom), ~140 stations, wheel arches cut out; material groups for paint, glass, trim, front light bar, rear light bar, door shut lines | 4.70 × 1.88 × 1.47 m, 2.90 m wheelbase, 1.62 m track | — |
| Glass, pillars, roof rails | Groups of the same surface; B-pillar at −0.17 m | | |
| Mirrors, handles, arch cladding, wheel-well liners | Separate meshes | | |
| Interior | Floor, two front seats, rear bench, dashboard, centre display, steering wheel (right-hand drive) | | |
| Wheels | 245/45 R19 tyre (lathe, tread bump map), ten-spoke rim face, barrel, ventilated disc, two-piston caliper (steers, does not spin) | ⌀ 0.71 m | distance travelled; steering angle |
| Battery enclosure | Tray floor (the underbody), walls, side sills, stone-guard ribs, lid | 2.20 × 1.48 × 0.12 m | — |
| Modules, busbars, BMS, HV junction box | 12 modules in two rows with cell divisions and terminals; copper busbars | | thermal tint from the battery node |
| Cooling plate, coolant lines, radiator | | | |
| Subframes, MacPherson struts, front A-arms, rear multi-link, coil springs, dampers, steering rack | | | |
| Rear drive unit | Finned motor housing, reduction gearbox, inverter cover; half-shafts with CV boots | | |
| Receiver electronics | Secondary compensation, rectifier (finned), DC–DC converter, VCU | | |
| HV cabling | Orange tubes: receiver → compensation → rectifier → DC–DC → junction box → drive unit | | |
| Receiver pad | See pads, mirrored, 0.6 m ahead of the vehicle centre | | turns from the simulation; height from the air gap |

## Charging pads (`three/station/Pad.tsx`)

From the air gap outward: enclosure (glass-fibre polymer, chamfered lathe), FOD sense-coil array (ground pad), potting, Litz winding on its slotted former, 16 radial ferrite bars, polyimide insulation sheet, aluminium shield, base with anchor bolts and terminal box (ground) or mounting brackets (vehicle).

| Quantity | Source |
|---|---|
| Winding inner and outer radius, turns, conductor diameter | `DEFAULT_TX_PAD`, `DEFAULT_RX_PAD` and the station's turn inputs |
| Winding plane | 34 mm above the mounting face (ground pad's winding at 36 mm above the slab) |
| Air gap | `inputs.airGap`, exactly (unit-tested) |
| Enclosure, ferrite, shield, base thicknesses | representative |

Exploded view: layers separate by 0.05–0.38 m away from the gap (or upward from the base when the bay is empty). Cutaway: a quarter of the enclosure, potting, insulation, shield and base is clipped away by two planes that follow the pad.

## Power cabinet (`three/station/Cabinet.tsx`)

0.72 × 0.46 × 1.74 m on a plinth; door hinged on the left, glass upper panel with a display, louvres, status bar. Inside, top to bottom: DIN rail with breakers, RCD and surge arrester, contactor; PFC board with two toroidal boost inductors and bulk capacitors; DC-link capacitor bank and laminated busbar; two SiC half-bridge modules with screw terminals on a liquid cold plate, gate-driver boards; primary resonant film-capacitor bank (C₁) on a copper bus; station controller, safety controller, IoT gateway with antenna; cooling unit. A living-object radar sits on the plinth facing the bay.

## Site (`three/station/Site.tsx`, `Surroundings.tsx`)

Four-bay shelter on a polished slab; cantilevered canopy on two portal columns with purlins, fascia and 36 PV modules (cell-grid texture); LED luminaires; bay occupancy indicators (state from the station model); identification camera; positioning anchors; magnetic-field probe; cable trenches; pad-mounted transformer with radiator fins and bushings; storage container with corrugation, doors, louvres and HVAC; asphalt apron and access road; street lights; planters. Three neighbouring bays hold parked vehicles on their own pads.

## Electrified highway (`three/road/`)

Drawn in the hero vehicle's frame: the car stays at x = 0 and the road moves past it by the simulated distance. Repeating items wrap with periods that divide the 1000 m route (unit-tested), so nothing jumps when the route laps.

| Asset | Construction | Driven by |
|---|---|---|
| Carriageways | Four 3.6 m lanes, shoulders, solid edge lines, dashed lane lines, a scrolling asphalt texture | distance travelled |
| Median | New-Jersey-profile concrete barrier with joints every 5 m; lamp posts every 50 m with twin heads | |
| Verges | W-beam guardrails on posts, grass, trees, a distant skyline (Dynamic only) | |
| Roadside | Segment-controller cabinets every 50 m (`segment-controller`), sign gantries every 250 m with a plain "Electrified lane" sign | |
| Road pads (`road-coil`) | Precast module per segment: polymer-concrete body, resin cover, 16 ferrite bars, Litz winding (diameter and turns from the road inputs) 30 mm under the surface; saw-cut outline on the asphalt; state ring; orange feeder to the duct bank | segment state and level from the road simulation |
| Section cut (`road-layers`) | Wearing course removed over the hero lane; trench along the shoulder with layer walls (wearing 40 mm, binder to 160 mm, granular base to 460 mm, subgrade), sand bed, three power ducts and a communication duct | Cutaway view |
| Engineering overlays | Interlock zone (pads under the body), request-window brackets around the receiver, coupling chart beside the lane | road inputs and samples |

Layer depths, module construction and roadside equipment are representative, not a pavement or product design.

## World (`three/world.tsx`)

Sky, site ground, quieter city skyline beside the charging site, decorative traffic on the highway (carries no data), and the hero vehicle's pose for the station and autonomous scenes.

## Poster

`public/wireless-ev-twin/hero.jpg` — rendered from this scene (1920 × 1015) with the interface hidden. Re-render it after visible model changes.
