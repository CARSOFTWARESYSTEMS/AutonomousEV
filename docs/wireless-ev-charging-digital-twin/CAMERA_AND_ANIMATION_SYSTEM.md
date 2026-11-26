# Camera and animation system

Source: `src/components/wireless-ev-twin/three/camera.tsx`, `three/viewState.ts`, `story/guide.ts`.

## Shots

Every view is a **shot**: a spherical pose (target, azimuth, polar angle, distance) with orbit limits, optionally following the vehicle. The same shot always frames the same thing the same way. Shots are named for engineering states, not for camera positions:

| Shot | Used by | Notes |
|---|---|---|
| `establishing` | overview, session complete | the shelter, the bay and the cabinet |
| `approach` | the vehicle arrives | follows the vehicle |
| `identify` | identification and authorisation | camera, anchors, cabinet and gateway in one frame |
| `alignment` | alignment and coupling | steep view onto both pads with dimensions |
| `ground-assembly`, `pads-exploded` | inside the ground pad | |
| `receiver` | the receiver assembly | low, between the wheels, follows the vehicle |
| `field` | magnetic field | square to the section through both pad centres, from whichever side has a line of sight clear of the wheels (unit-tested for four offsets) |
| `cabinet` | resonance and the inverter | square to the open cabinet |
| `energy` | follow the energy | grid → cabinet → pad → vehicle in one frame |
| `battery` | charging the battery | |
| `safety` | foreign object | eye level with the air gap, under the body |
| `xray`, `chassis`, `underbody`, `assembly`, `thermal`, `iot`, `cutaway` | the views of the same names | |
| `dynamic-roadside` | an electrified highway | a fixed camera 1.25 m high, 5.4 m beside the lane, placed 34 m ahead of the car; the car drives past it, and once it is 24 m beyond, the shot cuts to a new post 34 m ahead (the only cut in the system, as a broadcast camera would) |
| `dynamic-cutaway` | under the road | over the guardrail, into the section cut |
| `dynamic-top` | segment control | top-down along the lane, vehicle ghosted, so pad states, the interlock band and the request window read as a plan |
| `dynamic-coupling` | coupling profile, failed segment | side-on to the coupling chart, follows the vehicle |
| `dynamic-receiver` | the receiver at speed | shoulder level beside the receiver, follows the vehicle |
| `dynamic-follow`, `dynamic-underbody` | exterior, underbody views; the three energy outcomes | follows the vehicle |
| `autonomous`, `autonomous-top`, `district`, `district-energy` | autonomous, infrastructure | |

## Who drives the camera

1. **A selected component** — framed from the bounding sphere of every visible mesh carrying its id, along the current view's composed direction (which that view keeps clear of obstructions). If the part is hidden in the current view (a battery module inside the closed car), the view first changes to one where it is visible (`componentViews.ts`).
2. **The guided stage** — its shot.
3. **The current view** — its default shot.

A change of shot starts an eased move (cubic in-out) from wherever the camera is. Duration grows with travel, 0.8–2.6 s. Distance interpolates geometrically, so dolly moves feel even. A following shot aims at where the vehicle is *now* during the move, then rides along with it.

## Hand-over to the visitor

The first orbit, zoom or pan cancels any move and sets the camera to **free**: direction is suspended, the guided sequence stops auto-advancing, and the timeline's camera button turns amber. Clicking it (or selecting a component, or opening a stage) returns to the guided camera. Following shots keep tracking the vehicle in free mode, so the visitor's framing does not drift away from a moving car.

Limits apply on arrival, never during a move: each shot sets its own minimum and maximum distance and its highest polar angle (just above the ground, or below it for underbody shots), so the visitor cannot orbit through the slab or into the car's body from a composed view.

## View channels

Visualisation modes do not switch geometry on and off; they ease a small set of channels each frame (rate 4.2 s⁻¹): `exploded`, `assembly`, `xray`, `chassis`, `reveal`, `cut`, `underbody`, `battery`, `receiver`, `power`, `field`, `energy`, `thermal`, `iot`, `alignment`, `studio`, `segments`, `coupling`, and `occupied` (from the simulation). Parts read them: the body fades by `xray`, `chassis` and isolation; pad layers separate by `exploded` (away from the true air gap with a vehicle present, upward from the base without one); the cabinet door opens by `power`; the fog closes into a studio by `studio`.

## Reduced motion

With `prefers-reduced-motion`, shots cut instead of moving, channels jump, and the guided sequence still advances (it is driven by engineering events, not motion). The selection tint does not breathe.

## Animation sources

| Motion | Source |
|---|---|
| Vehicle arrival and departure | station model (constant-deceleration stop, departure acceleration) |
| Wheel rotation | distance travelled ÷ 0.355 m |
| Steering | kinematic bicycle model (autonomous) |
| Road vehicle and segment glow | road model (position, speed, segment level and state); the road and everything beside it move by the simulated distance, the car stays at the origin |
| Traffic on the highway | a decorative clock; it carries no data and is not part of any calculation |
| Field lines | traced at one phase of the 85 kHz cycle; the dash animation is labelled as slowed by about 10⁵ |
| Energy-flow dashes | speed and brightness ∝ calculated stage power |
