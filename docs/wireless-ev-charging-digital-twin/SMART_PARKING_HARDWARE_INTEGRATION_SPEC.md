# Smart Parking — hardware-connected twin: architecture and interface specification

**Status: specification for the next development phase.** Nothing here is implemented beyond the adapter interfaces in `src/lib/wireless-charging/smart-parking/adapters.ts` and the existing telemetry schema. No hardware is connected, and the public application can command no physical device.

## 1. Principles

1. **Telemetry only.** The twin reads. It never sends a command to the POC. Every actuator is driven by its local controller, and every interlock is enforced on the device, independently of the gateway, the cloud and the web application.
2. **One data contract.** Simulated and physical sources implement the same adapter interfaces and message schema, so the twin's displays, fusion and records work unchanged on either.
3. **Provenance on every value.** Each value carries its data mode, its quality and its timestamp. A simulated, calculated or estimated value can never be displayed as a live measurement.

## 2. Data modes

| Mode | Source | Label shown | May drive a control decision in the twin | Available |
|---|---|---|---|---|
| Simulation | The twin's models | SIMULATED, or CALCULATED for derived values | Yes (simulated actuators only) | Now |
| Live telemetry | Authorised POC gateway, read-only | LIVE (measured), STALE when out of date, INVALID when rejected | No: displayed and recorded only | Specified |
| Replay | A recording (`evengineer.parking.recording/1`) | RECORDED | No | Now (recordings from the simulation); POC recordings specified |
| Comparison | Live or recorded, beside the simulation driven by the same inputs | Measured and simulated side by side; residual = measured − simulated, with uncertainty | No | Specified |

Rules:

- **LIVE needs an authorised device.** LIVE is shown only for messages from a device whose identity is in the registry, whose certificate is valid and whose calibration record is current. Any other message is INVALID.
- **Derived values are not LIVE.** A value computed from live inputs (for example, efficiency from two meters) is labelled CALCULATED from LIVE inputs, never LIVE itself.
- **No interpolation shown as data.** Gaps are shown as gaps. The twin never interpolates a missing measurement and shows it as data.

## 3. Components

```text
Bay sensors · gate sensors · readers · barrier, fan and light controllers · meters · LV wireless link
        │  ESP32 firmware: sampling, debounce, local interlocks, signed messages over MQTT/TLS
Edge controller (gateway): broker · ingestion · fusion · session engine · local store · recorder
        │  outbound TLS, read-only export
Telemetry gateway service → historical store → replay and comparison APIs
        │  read-only stream (server-sent events or WebSocket), authenticated users only
Digital twin (browser): Live, Replay, Comparison views — no command path
```

## 4. Interfaces

### 4.1 Sensor interfaces (device → edge controller)

| Device class | Adapter (`adapters.ts`) | Measurement | Unit | Rate |
|---|---|---|---|---|
| Ultrasonic bay sensor | `OccupancySensorAdapter` (`ultrasonic`) | Distance; debounced occupied state | m; boolean | 2 Hz sample, state on change plus every 10 s |
| Infrared bay sensor | `OccupancySensorAdapter` (`infrared`) | Reflectance; occupied state | 1; boolean | As above |
| Row camera | `OccupancySensorAdapter` (`camera`) | Per-bay occupied probability | 1 | Every 10 s and on change |
| Recognition camera | `VehicleRecognitionAdapter` | Plate string (synthetic plates only in the POC), confidence | —; 1 | Per event |
| Reader | `AccessReaderAdapter` | Tag id or QR token | — | Per event |
| Barrier controller | `BarrierControllerAdapter` | Boom angle, end stops, obstruction | ° ; boolean | 5 Hz while moving, else 15 s |
| Environment node | `EnvironmentalSensorAdapter` | Temperature, humidity, CO, smoke, gas | °C, 1, ppm, %/m, %LEL | 5 s |
| Meters | `EnergyMeterAdapter` | Voltage, current, power | V, A, W | 1 s, reported every 5 s as averages |
| LV wireless link | `WirelessChargingAdapter` | Phase, DC in and out, coil temperatures | —, W, °C | 1 s |
| Edge controller | `EdgeGatewayAdapter` | Up, buffered messages, clock offset | —, 1, ms | 15 s |

The `BarrierControllerAdapter.command` method exists for simulation only. A physical implementation returns `{ accepted: false, reason: "telemetry-only integration" }` for every call.

### 4.2 Device identity

- Each device has an id following the scheme in SMART_PARKING_HARDWARE_PLAN.md §4 (for example `US-N03` or `GATE-IN`).
- Each holds an X.509 client certificate whose subject is that id, issued at commissioning from a site certificate authority kept offline.
- The broker ACL binds each identity to its own topics (SMART_PARKING_IOT_ARCHITECTURE.md §4).
- Replacing a device revokes the old certificate and keeps the id.

### 4.3 Message schema

`evengineer.parking.telemetry/1` (SMART_PARKING_IOT_ARCHITECTURE.md §3), extended for live data by:

| Field | Meaning |
|---|---|
| `mode` | `LIVE` from devices; the gateway may downgrade it to `STALE` or `INVALID`, never upgrade it |
| `quality` | `good`, `suspect` (out of the calibrated range or failing plausibility) or `bad` (sensor fault) |
| `cal` | Calibration record id the value was corrected with |
| `clock` | `ntp` or `free-running`, with an `offsetMs` estimate |
| `fw` | Firmware version |

A schema change publishes under `evengineer/v2/…` alongside v1 until every device has migrated.

### 4.4 Timestamp synchronisation

- **Source:** devices take time from the edge controller's NTP server. The controller takes it from a public NTP pool, or from GPS when offline.
- **Clock checks:** device offset is checked every 60 s. An offset above 100 ms marks values `suspect`; above 1 s, `bad`.
- **Ordering:** by device timestamp, with a per-device sequence number to resolve ties.
- **Late arrivals:** a message arriving more than 12 s late (the fusion freshness) is stored, but marked STALE for live display.

### 4.5 Data quality and missing data

| Condition | Detection | Handling |
|---|---|---|
| Duplicate | Repeated `eventId` | Dropped (idempotent), counted |
| Out of order | `seq` ≤ last for that device, sensor and topic | Stored, never regresses the state |
| Stale | Age > freshness | Shown STALE, excluded from fusion |
| Gap | No message for 3 periods | Shown as a gap, with a stale-data anomaly. Never filled with a simulated value |
| Out of range | Outside the calibrated range | `suspect`; excluded from comparisons |
| Implausible | Rate of change beyond physical limits (for example, a barrier faster than 90 °/s) | `suspect` and an anomaly |
| Device offline | Last will | Device shown offline. The bay becomes *unknown*, never *available* |

### 4.6 Historical experiment storage

- **Raw stream:** append-only telemetry (topic, payload, receive time) in a time-series store, kept for the retention period in SMART_PARKING_INTERNATIONALIZATION.md §3.
- **Experiment records:** each holds an experiment id, the procedure id (SMART_PARKING_POC_READINESS.md §6), people present (by role), start and end times, devices and calibration ids, set-up photographs, deviations and supervisor sign-off.
- **Results:** derived datasets with the code version and parameters that produced them, plus a SHA-256 of the raw slice they came from.
- **Twin runs:** for comparison runs, the twin's model version, inputs and seed are stored with the experiment.

### 4.7 Calibration records

Each record holds:

- record id and device id;
- quantity, reference instrument (with its own certificate) and procedure;
- points (reference, raw), the fitted correction (offset and scale, or a table) and its uncertainty;
- valid-from date, expiry and the person who performed it.

The gateway applies the current record and stamps its id on each value (`cal`). Values from a device with an expired record are `suspect`.

### 4.8 Replay interface

- **Input:** a recording file, or a time range from the historical store.
- **Playback:** messages are replayed through the twin's own ingestion and fusion (`replayRecording`) at 1×–60×, labelled RECORDED. Replay never drives an actuator.
- **Comparison:** the simulation is run from the recorded inputs (arrivals, positions, power) and residuals are shown beside it, with the measurement uncertainty from the calibration records.

## 5. Safe telemetry-only path for the six-bay POC

1. **Bench (HIL, sensors):** physical bay sensors observe targets moved by hand. The gateway publishes LIVE sensor values. The twin shows them beside simulated vehicles in Comparison mode, and no actuator is connected.
2. **Bench (HIL, controllers):** the ESP32 firmware runs against simulated sensors. Its outputs drive simulated actuators only. Interlock logic is tested on the device.
3. **Module A commissioned (SMART_PARKING_POC_READINESS.md §5):** barrier and sensors are live under their local interlocks. The twin reads only. Operator actions happen at the local console, never from the web application.
4. **Module B and the LV link:** wireless telemetry is read-only. Energisation is controlled at the bench supply by the supervisor (procedure §6).
5. **Remote viewing:** an outbound, authenticated, read-only stream to the twin for authorised users. The public twin keeps showing SIMULATED data.

**Exit criteria for each step:** the acceptance criteria in SMART_PARKING_POC_READINESS.md §5. The EV.ENGINEER™ team decides on the record in the governance store before LIVE is enabled for that device class.

## 6. What the web application must never do

- Send a command, set-point or configuration to a physical device.
- Label a simulated, calculated, estimated or interpolated value as LIVE.
- Hide that a device is offline or its data is stale.
- Store or display device secrets, real plates or personal data.
