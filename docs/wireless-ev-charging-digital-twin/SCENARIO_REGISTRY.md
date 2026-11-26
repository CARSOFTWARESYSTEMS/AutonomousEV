# Scenario registry

A scenario is exposed as a working experiment only when its model and state transitions are implemented. Status: **Tested** (a named verification check or unit test covers it), **Implemented** (the model and transitions exist and can be run; no dedicated test yet), **Planned**. Check ids refer to `src/lib/wireless-charging/benchmarks.ts`.

## Stationary charging

| Scenario | Status | How to run it |
|---|---|---|
| Normal charging | Tested (unit test: normal sequence; A05, A12) | Station stages 3–10, or *Vehicle arrives* in the inputs |
| Perfect alignment | Implemented | *Re-park precisely* (lateral and longitudinal 0) |
| Lateral misalignment | Tested (unit test: refuses outside tolerance, resumes once re-parked) | Lateral offset slider; beyond tolerance → misalignment state |
| Increased air gap | Tested (unit test: couples less as the gap grows; browser check) | Air-gap slider (80–280 mm); k, M, power and efficiency recompute |
| Limited battery acceptance | Tested (B05) | High initial SOC or low battery temperature (CC–CV and derating) |
| Thermal limitation | Implemented (thermal step verified by A08; the trip itself has no dedicated test) | Raise ambient; over-temperature trips with hysteresis |
| Foreign object detection | Tested (laboratory test and browser check) | Stage 11, or the fault panel |
| Living object detection | Implemented (precedence covered by B12) | Fault panel |
| Overcurrent, isolation, controller failure | Overcurrent tested (unit test); isolation and controller failure implemented, precedence by B12 | Fault panel (latching; operator reset) |
| Communication failure | Tested (B09) | Link degradations in the fault panel; heartbeat timeout removes power locally |
| Emergency shutdown | Implemented (precedence by B12) | Fault panel |

## Dynamic charging

| Scenario | Status | Notes |
|---|---|---|
| Urban, highway, stop-and-go, accelerate | Implemented (A13 covers time-step sensitivity) | Speed profiles in the road model |
| Battery charging / energy-neutral / discharging while driving | Tested (B11; a unit test runs each stage preset and asserts its regime; browser check) | Dynamic stages 6–8 |
| Different segment lengths and spacing | Implemented | Segment diameter, spacing, coverage |
| Reduced road coverage, missing segment | Implemented; failed segment shown in Dynamic stage 9 | Coverage; failed segment |
| Segment handover | Tested (B07, B08) | Reactive, predictive, make-before-break; Dynamic stage 3 shows the states |
| Misaligned receiver, communication delay | Implemented | Lateral offset; detection delay |
| Multiple vehicles | Planned | Single-vehicle model |

## Smart parking

All **Planned** (see SMART_PARKING_REQUIREMENTS.md).

## Autonomous charging

| Scenario | Status | Notes |
|---|---|---|
| Successful precision parking | Tested (B13) | EKF with UWB, pure pursuit |
| Localisation error, sensor noise, communication delay | Tested (B13: uncompensated delay degrades alignment) | Inputs in the autonomous panel |
| Unavailable station, station selection | Tested (B14) | Ranking and reservation exchange |
| Alignment correction (reverse and re-park) | Planned | Forward-only parking today |
| Obstacles | Planned | Not modelled |

## Smart infrastructure

| Scenario | Status | Notes |
|---|---|---|
| Solar peak, evening peak, limited grid, multiple requests, storage support, outage | Implemented; the energy balance and import limit across them are tested (B15) | District day inputs |
| Alternative allocation policies | Implemented | Five policies |
| Network power flow (voltages, line loading) | Planned | Aggregate dispatch only |

## Visualisation scenarios not yet built

Selectable section planes and vector arrows for the field; road field visualisation; imported FEM maps; spatial thermal maps (need a spatial model or measurements).
