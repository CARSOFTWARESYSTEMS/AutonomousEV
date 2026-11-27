# Smart Parking — architecture

Environment 01 of the Wireless EV Charging Digital Twin. This document covers the software architecture of the twin as built, and the target architecture of a physical deployment (edge, cloud, data platform). Companion documents: SMART_PARKING_IOT_ARCHITECTURE.md (messages and devices), SMART_PARKING_CHARGING_INTEGRATION.md (the Station hand-over), SMART_PARKING_STATE_MACHINE.md (the session lifecycle).

## 1. Layers

```text
Interface (React)         Laboratory shell, inspector sheets, stage cards, driver and operator panels
  src/components/wireless-ev-twin/env/ParkingPanels.tsx, lab/, story/parking*.ts
3D scene (R3F, lazy)      Facility, shelter, gates, vehicles, overlays, camera shots — reads state only
  src/components/wireless-ev-twin/three/smart-parking/
Runtime                   One facility simulation, fixed-step clock, Station hand-over
  src/components/wireless-ev-twin/state/runtime.ts
Engine (pure TypeScript)  Facility simulation and every model; no React, no three.js
  src/lib/wireless-charging/smart-parking/
Shared engine             Station (WPT-SIM-001), battery, coupler, power chain, message-bus link model
  src/lib/wireless-charging/
```

The rules of the rest of the twin hold here too:

- The engine is independent of rendering. It runs headless in the tests and in the research studies.
- The scene and panels never calculate. They read simulation state; panels sample it at 2–8 Hz.
- Per-frame values stay outside React.
- Quality tiers change pixels only, never a result.

## 2. Engine modules

| Module | Responsibility | Models |
|---|---|---|
| `types.ts` | Shared types: regions, bay types and statuses, vehicle profiles, data modes, operating modes | — |
| `layout.ts` | Facility geometry: two rows of bays facing one aisle, gates, lane zones, kinematic paths (arcs and lines, rear-axle reference) | SP-MATH-005 |
| `vehicles.ts` | Synthetic vehicle registry: classes, powertrains, receivers, regional plate formats, credentials | — |
| `queueing.ts` | Arrivals (homogeneous and time-varying Poisson by thinning), Erlang B, M/M/c/K, discrete-event simulation | SP-MATH-001, 002 |
| `identification.ts` | Simulated recognition pipeline with its latency and error model; access decision with RFID and QR fallback | SP-AI-001 |
| `occupancy.ts` | Bay sensors (ultrasonic, infrared, row camera), node debounce, Bayesian log-odds fusion with hysteresis | SP-MATH-003 |
| `allocation.ts` | Five policies with hard constraints; atomic, versioned reservation of a bay | SP-MATH-004 |
| `reservations.ts` | Booking windows, holds, grace, no-shows, conflicts | SP-MATH-004 |
| `lifecycle.ts` | Session state machine: 25 normal and 22 exceptional states, guarded transitions | SP-CTRL-001 |
| `barrier.ts` | Barrier controller and obstruction interlock | SP-CTRL-002 |
| `environment.ts` | Lumped thermal node with exact step, well-mixed CO/smoke/gas, ventilation, lighting, alarms | SP-MATH-007 |
| `energy.ts` | Canopy PV with NOCT derating, storage, priority dispatch, energy ledger | SP-MATH-008, 009 |
| `billing.ts` | Tariffs, parking and charging bills in integer minor units, locales, payment records | SP-MATH-010 |
| `telemetry.ts` | Topic namespace, schema, simulated broker (identity, TLS flag, ACLs, retained status, last will), ingestion, commands | SP-IOT-001, SP-MATH-011 |
| `charging.ts` | Eligibility checks and the parking ↔ Station session adapter | SP-INT-001 |
| `forecast.ts` | Seasonal-naive, moving-average and exponential-smoothing baselines; robust z-score | SP-MATH-006, SP-AI-003 |
| `reliability.ts` | k-out-of-n availability and uncertainty propagation | SP-MATH-012 |
| `facility.ts` | The facility simulation: arrivals, sessions, motion, sensors, gateway, chargers, energy, environment, billing, faults, recording | SP-SIM-001 |
| `experiments.ts` | Event-level research model and the reproducible studies | SP-RES-001 |
| `checks.ts` | SP-A01–A12 and SP-B01–B26, run in the tests and in Engineering Assurance | — |
| `requirements.ts`, `components.ts`, `adapters.ts`, `programme.ts` | Traceability, inspector components, hardware adapter interfaces, timelines | — |

## 3. Clock and determinism

- **Facility step:** fixed at 0.1 s (`FACILITY_STEP`).
- **Station step:** each wireless bay's Station simulation steps at 50 ms up to 5× speed and at 250 ms beyond that. It accumulates time and is advanced by the facility, so parking and charging share one clock.
- **Random numbers:** every subsystem has its own seeded generator (arrivals, vehicles, recognition, sensors, link, motion). Adding a sensor reading therefore never changes the arrivals.
- **Frame-rate independence:** results do not depend on how the clock is driven, whether 1 × 6000 steps or 60 × 100 steps (check SP-B21). Replaying a scenario gives the same session sequence (SP-B22).
- **Frame budget:** the runtime spends at most 12 ms per frame stepping the facility. If it falls more than 2 s behind, the backlog is dropped, so simulated time runs slower than requested. No step is ever skipped or lengthened.
- **Time and money units:** timestamps are seconds of simulated time plus the site's UTC epoch, converted to local time only for display. Money is held in integer minor units.

## 4. Data flow inside the simulation

```text
Arrivals ─► entry road ─► presence detector ─► session opened (once per detection)
                                   │
                ANPR pipeline (simulated) ─► access decision ◄─ RFID / QR reader
                                   │
              allocation (hard constraints + policy) ─► atomic bay reservation
                                   │
           barrier controller (interlock) ─► lane zones ─► bay ─► occupancy fusion
                                   │
     eligibility (7 checks) ─► Station simulation of that bay ─► energy ledger
                                   │
       departure ─► safe stop ─► billing (parking ledger + charging ledger) ─► exit ─► release
```

The sensor nodes publish through the simulated broker; the edge gateway ingests, validates and fuses them; the allocation engine and lifecycle read only the gateway's fused view, never the ground truth. The ground truth (where the vehicles really are) is used only to generate sensor readings and to score the studies.

## 5. Motion and congestion

- **Paths:** vehicles follow kinematic-bicycle paths (rear axle, minimum turning radius 4.3 m) at road, aisle, turning and reversing speeds of 5.5, 2.5, 1.2 and 0.8 m/s.
- **Lane zones:** the aisle and gates are divided into lane zones held as mutexes. A vehicle claims the zones ahead of it and never takes a zone that another vehicle holds. Parked vehicles hold none.
- **Reversing out:** a vehicle backing out of a bay reserves the sweep across the aisle first, so it cannot reverse into a passing car.
- **Turned away:** a vehicle that is refused entry reverses 3 m and U-turns at the stop line. It never passes through the boom.
- **Tailgating:** a tailgating vehicle shadows its leader through the gate and is detected by the clear-zone sensor (SP-B25).

## 6. Runtime and hand-over

`state/runtime.ts` creates the facility on first use and steps it while environment 01 is shown, and also while the Station shows a bay's session.

*Explore Wireless Charging* calls `beginHandover`: the Station environment's view switches to that bay's own Station simulation; *Return to Smart Parking* (`endHandover`) restores the Station's own simulation. The parking session never stops, so its state is preserved across the round trip. Details in SMART_PARKING_CHARGING_INTEGRATION.md.

Shareable links use the existing launch parameters, for example `?fs=0&sound=1&narration=0&captions=0&demo=0&env=parking#research-laboratory`; the launch panel copies one for the current environment.

## 7. Physical deployment architecture (target, not built)

```text
Bay sensors, presence loops, readers, barrier and fan controllers
        │ (ESP32-class nodes, MQTT over TLS on a segregated device VLAN)
Edge gateway (Raspberry Pi-class or industrial PC)
  · MQTT broker (local)          · recognition inference (edge placement)
  · ingestion, fusion             · allocation and session engine
  · local database (sessions, audit, ledgers)  · store-and-forward queue
        │ (outbound TLS only; no inbound connection from the internet)
Cloud or equivalent data platform
  · time-series store (telemetry)  · relational store (sessions, reservations, ledgers, audit)
  · API service (driver, operator, reporting)  · digital twin synchronisation (read-only)
```

The edge decides; the cloud records and reports. Every safety function works with the cloud absent. The barrier, alarm, ventilation and charging protection also work with the gateway absent, on their own controllers: exits open for egress and charging stops.

### Data model (outline)

| Entity | Key fields | Retention (configurable per region) |
|---|---|---|
| Site | siteId, region, time zone, currency, layout version | Life of the site |
| Bay | bayId, type, position, charger id, state history | Life of the site |
| Device | deviceId, kind, bay or gate, firmware version, certificate fingerprint, calibration date | Life of the device |
| Session | sessionId, entry and exit times (UTC), identity reference, credential type, bay, state history | Per the regional policy (SMART_PARKING_INTERNATIONALIZATION.md) |
| Reservation | reservationId, class, window, status, token reference | Until settled plus the policy period |
| Charging session | chargingId, parkingSessionId, bay, energy (Wh), start and stop reasons | As the session |
| Ledger entries | parking, charging and energy ledgers kept separate; integer minor units and Wh | Statutory accounting period |
| Audit entry | time, actor, role, action, target, result, reason | Security policy period |
| Telemetry | topic, eventId, deviceId, ts, seq, value, unit, quality, mode | Short (raw) and aggregated (long) |

Plates are personal data in many jurisdictions. In a real deployment the session stores a keyed hash of the plate for matching, and the plain text only as long as the access list or a dispute requires (SMART_PARKING_SECURITY_AND_PRIVACY.md).

### API outline

| Interface | Consumer | Operations |
|---|---|---|
| Driver API | Driver application | Availability by class, create, cancel and view reservations, session status, receipt, payment hand-off to a provider |
| Operator API | Operator dashboard | Bay and device status, sessions, anomalies, audited commands (block or unblock a bay, approve or refuse an identity, acknowledge an alarm, stop charging) |
| Reporting API | Research and management | Aggregated occupancy, turnover, energy, revenue; data exports with provenance |
| Twin synchronisation | This digital twin | Read-only telemetry stream labelled LIVE only from authorised hardware |

Commands from any API reach a device only through the gateway's command validation (integrity, expiry, role, replay). Every device enforces its own interlock as well. The public application exposes none of these operations.

## 8. Edge, cloud and hybrid AI placement (SP-S03)

- **Edge (default):** recognition runs on the gateway. The pipeline latency is the declared sum of its stages, 1.07 s.
- **Cloud:** each recognition adds a declared 0.45 s round trip. The simulation models only this latency. A cloud outage in this placement is not yet modelled for recognition: the *Cloud down* fault only buffers telemetry and defers payment. In a deployment, recognition would then fall back to RFID, QR and the operator.
- **Hybrid:** recognition runs on the edge as in the default placement, and analytics (forecasting, reporting) run in the cloud.

In every placement, allocation, the barrier interlock, the alarms and charging safety run locally (check SP-B09). The placement is an engineering input; changing it changes latency only.

## 9. Scale

The engine handles up to 1,000 bays in the studies; the interface allows 6–48. Measured costs are in PERFORMANCE_REPORT.md §Smart Parking. Above about 100 bays a physical site would split the facility into zones, each with its own gateway, under one site namespace. The topic scheme and the access control lists are already site- and device-scoped (SP-E10).
