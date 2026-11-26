# Simulation–rendering contract

**The mathematics determines the physics. The physics determines the simulation. The simulation determines the 3D animation. The telemetry explains the behaviour.**

## Separation

| Concern | Where | Rate |
|---|---|---|
| Engineering simulation clock | `state/runtime.ts` `useClock` (its own `requestAnimationFrame` loop) | wall time × speed, capped at 0.25 s per frame |
| Numerical solvers | `src/lib/wireless-charging/*` | fixed steps: station 50 ms (250 ms above 60×), road 1 ms, parking 20 ms, district 5 min |
| Charging state machine | `stateMachine.ts` via `stepStation` | every station step, safety first |
| Vehicle motion | station: constant-deceleration arrival; parking: kinematic bicycle model; road: longitudinal model | per step |
| Scientific visualisation data | overlays call the engine (`fieldFromBasis`, `traceFieldLines`, chain point) | per frame, from the latest state |
| Telemetry and instruments | `lab/metrics.ts`, `ui/liveValues.ts` | sampled 4× per second |
| Rendering | R3F frame loop | display rate; paused off screen |
| Camera | `three/camera.tsx` | display rate |
| Guided orchestration | `story/guide.ts` | its own loop; reads the state, issues commands |
| User interaction | store actions | events |

The render loop is never the solver: a slow frame rate gives fewer pictures of the same simulation, not a different simulation.

## What the scene may read, and what it must not do

- **May read:** `runtime.station.state` (vehicle pose, phase, chain point with currents and powers, coupler, temperatures, battery, faults), `runtime.road.state`, `runtime.parking.state`, `runtime.grid`, and the store's inputs and view.
- **Must not:** write simulation state, step a simulation, or keep an animation-only copy of an engineering quantity.

## Bindings (station)

| Visual | Bound to |
|---|---|
| Vehicle position and wheel roll | `state.vehicle.x, y`; wheels rotate by distance travelled ÷ wheel radius |
| Vehicle ride height | `inputs.airGap − 0.15 m`, so the receiver winding is exactly `airGap` above the ground winding (unit-tested) |
| Front-wheel steering | `parking.truth.steer` (autonomous); zero on straight arrival |
| Winding glow | ‖I₁‖ and ‖I₂‖ from the steady-state solution |
| Field colour map and lines | engine field basis × present currents; lines retraced when the current ratio or Research-mode phase changes |
| Energy-flow segments | `pGrid`, `pCoilIn`, `pRectifierIn`, `pBattery` (speed and brightness) |
| IoT pulses | one per message the simulated bus delivered |
| Thermal tints | lumped node temperatures, one uniform colour per component |
| Cabinet status bar, bay indicator | phase kind (fault / energised / occupied / available) |
| Foreign object on the pad, its heating glow | `faults.foreignObject`, `temperatures.object` |
| Living-object zone | the living-object phase or fault |
| Alignment dimensions | `inputs.lateral`, `longitudinal`, `airGap`; k and M labels from `state.coupler` |

## Bindings (road)

| Visual | Bound to |
|---|---|
| Everything along the road (asphalt, markings, barriers, lamps, cabinets, gantries, trees, skyline, pads) | `road.state.x`; the vehicle stays at x = 0 |
| Wheel rotation | `road.state.x ÷ 0.355 m` |
| Ride height | `road.airGap − (receiver winding at nominal − road winding depth)` |
| Pad state colour and winding glow | each segment's `state` and `level` |
| Interlock zone and request window | vehicle length, pad diameter and handover strategy (the model's own rules) |
| Coupling chart, behind | `road.state.samples` (mTotal, pReceived) |
| Coupling chart, ahead | `segmentM` at each position from the segments ahead |
| Energy outcome | mean `pBattery` over the last 200 m of samples |

## Time scales

The station steps at 50 ms. Stages that need minutes or hours run accelerated: *Charging the battery* at 60×, *Session complete* at 300×. The timeline labels it (`Accelerated ×60`). Energy, SOC and cost are integrated by the same fixed-step model at any speed; only the number of steps per wall second changes. Above 60× the station uses 250 ms steps, which its thermal and battery integrators are exact over (documented in `station.ts`).

## Reproducibility

Every simulation is seeded (`createStation(…, seed)`, `createRoad(…, seed)`), so a given sequence of inputs and steps gives the same result. Fast-forwarding to a stage (`story/simControl.ts`) runs the same steps the clock would, at the 1× step size.

## Fast-forward to a stage

Opening a stage out of order (for example *The magnetic field* from a cold start) calls `ensurePhase("charging")`, which issues the same `arrive` command a visitor could, then steps `stepStation` until the state machine reaches the phase (at most 90 simulated seconds). It never sets a phase directly. Tested: after the fast-forward, the station is charging and the energy ledger closes to 10⁻⁶ relative.
