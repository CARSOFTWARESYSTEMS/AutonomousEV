# Environment 01 — IoT & AI-Based Smart Parking Shelter: requirements

**Status: specified, not implemented.** The laboratory lists it first, disabled, with a *Planned* badge; no parking value is shown anywhere as a result. It is Phase 4 of the brief and is built only after the station scene's quality is accepted.

## Purpose

Intelligent parking management that hands compatible vehicles over to wireless charging: identification, entry and exit, slot allocation, environmental monitoring, reservation, billing and charging-energy cost.

## Scene

Reuse the station's shelter, vehicle, lighting and camera systems; extend the shelter to a multi-bay facility with conventional and charging-capable bays (not every vehicle is wireless-capable), entry and exit barriers, recognition cameras, occupancy sensors per bay, environmental sensors (temperature, humidity, CO, smoke), LED bay displays, an edge gateway and a power-management cabinet.

## Sequence (to become a stage list)

1. Vehicle approaches; presence sensor detects it.
2. Camera captures **synthetic** identification data; RFID, QR or plate identification is evaluated (simulated recognition with a stated error rate).
3. Availability is checked; a slot is allocated (charging-capable only for compatible vehicles).
4. Entry is authorised; the barrier opens; the vehicle drives to its slot (kinematic model).
5. Occupancy sensor confirms; wireless eligibility is checked; compatible vehicles hand over to Environment 02 (camera transition into the charging bay).
6. Environmental monitoring continues; duration is tracked; parking fee and charging energy cost are calculated separately.
7. Departure: charging stops safely if active (station state machine), exit is authorised, the slot is released.

## Models to implement (none exist yet)

| Model | Content | Fidelity target |
|---|---|---|
| WPT-PARK-001 Arrival and departure process | Poisson arrivals with time-of-day rate, dwell-time distribution | F1 |
| WPT-PARK-002 Occupancy and queue | M/M/c/K queue: occupancy ratio, queue length, mean wait, utilisation, blocking probability; discrete-event simulation for verification | F1–F2 |
| WPT-PARK-003 Slot allocation | Nearest-free, charging-priority and reservation-aware policies; comparison | F1 |
| WPT-PARK-004 Reservation scheduling | Time-slot reservation with no-show probability | F1 |
| WPT-PARK-005 Demand forecast | Baseline seasonal profile; any learned model only after a deterministic baseline | F0–F1 |
| WPT-PARK-006 Billing | Parking tariff by duration; charging cost from the station's energy ledger | F1 |
| WPT-IOT-002 Parking sensor network | Sensors on the existing message bus with data modes, latency, loss, stale and invalid readings | F1 |

Each needs registry entries, verification checks (for example the M/M/c queue against its closed form) and lessons, as the existing 20 models have.

## Experiments

Disconnect an occupancy sensor; inject wrong occupancy; change the arrival rate; raise demand to saturation; add communication latency; recognition errors; environmental alarm; gateway failure. Each must show the control response and its data, and must only be exposed once the model and its state transitions are tested.

## Integration with the workshop

Map into the existing 32-week programme (no units removed): IoT and embedded weeks gain a parking-sensor node exercise; the infrastructure month gains the queueing and allocation study; the research-methodology month gains the forecast baseline. These additions are planned, not yet written into `content.ts`.

## Rules carried over

Synthetic identities only; no real number plates. Safety-critical control stays local. Data modes as elsewhere; nothing LIVE without hardware.
