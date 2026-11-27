# Smart Parking — wireless charging integration

Model SP-INT-001, the parking ↔ wireless charging session adapter, lives in `src/lib/wireless-charging/smart-parking/charging.ts`. The hand-over is in `src/components/wireless-ev-twin/state/runtime.ts`. Covered by checks SP-B11–SP-B15 and SP-A09.

## 1. One wireless model, not two

Smart Parking has no wireless power transfer model of its own. Each wireless bay owns one instance of the existing Station simulation (WPT-SIM-001), with its own:

- coupler;
- compensation network;
- power chain;
- battery;
- thermal model;
- charging state machine;
- safety interlocks.

The Station is the same code that drives environment 02. No two bays share a battery, a ledger or a state machine.

Two additions to the Station were needed. Both have direct tests in `smart-parking.test.ts`, and checks SP-B12–SP-B15 exercise them through the facility. Neither changes environment 02:

- The `arrive-parked` command starts a session for a vehicle that is already parked over the pad, skipping the approach. The `stop` command ends a session safely on request.
- The `holdAfterComplete` input keeps a completed session (pad de-energised, record closed) until the parking side detaches it, instead of starting the Station's own departure.

## 2. Eligibility (parking side, seven checks)

| Check | Passes when |
|---|---|
| Occupancy | The fused bay sensors confirm the vehicle |
| Compatibility | Electric, fitted with a compatible receiver, in a wireless bay |
| Transmitter | The bay's pad and power cabinet are in service and free |
| Authorisation | The driver asked to charge and the session is authorised to charge |
| Alignment | The receiver offset is within tolerance: ±100 mm lateral and ±100 mm longitudinal by default. The parking position has a 1σ spread of 30 mm × 35 mm |
| Battery | SOC is at least 1 % below the driver's target |
| Safety | No environmental alarm; the shelter safety controller reads normal |

Only when all seven pass is the vehicle handed to the Station. The Station then runs its own identification, authorisation, alignment, foreign-object and living-object detection, battery and safety checks, and may still refuse (SP-B12).

An incompatible vehicle can never start wireless charging (SP-B11). Conventional cars and EVs without a receiver are allocated conventional bays unless overflow into wireless bays is enabled. Even then they never charge.

## 3. Session flow

```text
parked ─► eligibility (7 checks) ─► attach: setStationInputs(battery, target, measured offset, allowance)
                                     stationCommand("arrive-parked")
        ─► charging (Station state machine: authorise, align, FOD/LOD, soft start, CC–CV, …)
        ─► charged (Station completed, held) ── or ── departure requested ─► stationCommand("stop")
        ─► charging-stopping: wait until the pad is de-energised and the record closed (stoppedSafely)
        ─► detach: take gridEnergy, energyToBattery and the final SOC from the Station's record, once
        ─► billing ─► exit
```

A charging session carries the parking session id, and the parking session carries the charging id. The audit trail therefore keeps one identity chain from entry to exit (SP-B13).

## 4. Energy is counted once

- **Battery state:** while a vehicle is attached, only its bay's Station integrates the battery state. The parking record takes the final SOC once, at detach (SP-B14).
- **Site power:** the facility energy model sees each charger's grid-side power as a load. It allocates the site's grid, PV and storage among chargers by the least-laxity policy, and gives each Station an allowance in 500 W steps. Quantising the allowance stops the Station re-solving its operating point every step.
- **Billing:** the charging bill uses the grid-side metered energy, in integer watt-hours. The tariff's metering boundary is declared as *grid-side*. Parking fees are a separate ledger (SP-B17).

## 5. Safe departure

A vehicle may not move while its pad is energised. On a departure request the adapter commands `stop` and the session waits in `charging-stopping` until `stoppedSafely` holds, meaning the pad is de-energised and the Station is completed, available, departing or in a fault state (SP-B15).

An environmental alarm trips every Station. A Station fault (`charging-fault`) leaves the parking session intact: the vehicle stays parked and the driver can still leave.

## 6. Explore Wireless Charging and return

From a charging bay (bay inspector, stage 12 or the operator panel), **Explore Wireless Charging** calls `beginHandover(bayId)`:

1. The Station environment's own simulation is set aside, and `runtime.station` points at that bay's Station simulation. The Station inputs and the vehicle's paint are copied into the store, so environment 02 shows this vehicle.
2. The laboratory switches to environment 02. A hand-over banner names the bay, vehicle and session and offers **Return to Smart Parking**.
3. While the Station shows the bay's session, the facility keeps stepping. It advances that Station simulation itself, so parking and charging share one clock, and the facility's other bays, vehicles and sessions keep running.

**Return to Smart Parking** calls `endHandover`. The Station's own simulation is restored and the laboratory returns to environment 01, at the stage it left (the tour does not auto-advance). The parking session never stopped, so nothing is lost, reset or counted twice.

## 7. Event-level surrogate (research studies)

The event-level research model (`experiments.ts`) cannot afford a full Station per vehicle. It uses a constant-power surrogate instead: charging time = ΔSOC × capacity / 11 kW.

Check SP-A09 compares the surrogate with the Station model for a 60 kWh pack charged from 30 % to 80 %:

- Station: 10,173 s
- Surrogate: 9,818 s
- Difference: 3.5 %. The Station is slower because of CV taper and efficiency.

The surrogate is used only for comparisons between policies, never for a session's own figures.
