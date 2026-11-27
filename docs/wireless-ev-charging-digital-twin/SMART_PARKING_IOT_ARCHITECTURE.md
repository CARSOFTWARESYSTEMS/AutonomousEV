# Smart Parking — IoT architecture

Models SP-IOT-001 (MQTT communication) and SP-MATH-011 (communication performance), implemented in `src/lib/wireless-charging/smart-parking/telemetry.ts` and driven by `facility.ts`. Every message in the twin is synthetic and carries the data mode SIMULATED (or RECORDED in replay). No broker, device or credential exists behind the public application.

## 1. Device inventory (default 12-bay layout)

| Device id | Kind | Count | Period | Publishes |
|---|---|---|---|---|
| `US-<bay>` | Ultrasonic bay node | 12 | 10 s, plus on change | `bays/<bay>/occupancy`, status |
| `IR-<bay>` | Infrared bay node | 12 | 10 s, plus on change | `bays/<bay>/occupancy`, status |
| `CAM-N`, `CAM-S` | Row occupancy camera (edge analytics) | 2 | 10 s, plus on change | occupancy of every bay in its row |
| `ANPR-IN`, `ANPR-OUT` | Recognition camera | 2 | 15 s heartbeat; event-driven reads | telemetry, events |
| `READER-IN` | RFID/QR reader | 1 | 15 s | telemetry, events |
| `GATE-IN`, `GATE-OUT` | Barrier controller | 2 | 15 s | status; subscribes to its `commands` |
| `ENV-N`, `ENV-S` | Temperature, humidity, CO, smoke, gas node | 2 | 5 s | telemetry (°C, ppm, %/m, %LEL) |
| `FAN-CTL`, `LIGHT-CTL` | Actuator controllers | 2 | 15 s | status; subscribe to commands |
| `LED-ENTRY` | Entry guidance display | 1 | 15 s | status |
| `METER-MAIN`, `PV-INV`, `BESS-01` | Energy meters | 3 | 5 s | telemetry (W) |
| `WPT-<bay>` | Wireless charger (one per wireless bay) | 4 | 5 s | telemetry (grid-side W) |
| `EDGE-01` | Edge gateway | 1 | 15 s | status |

Every device publishes a retained status heartbeat each period and declares a last-will status message: if it drops, the broker publishes `online: false` on its behalf. A device with no message for three periods is reported as an anomaly: stale data while it is still connected, a message-pattern anomaly once it is offline.

## 2. Topic namespace

```text
evengineer/v1/sites/{siteId}/bays/{bayId}/occupancy        QoS 1   fused-input bay sensor states
evengineer/v1/sites/{siteId}/devices/{deviceId}/telemetry  QoS 0   periodic measurements
evengineer/v1/sites/{siteId}/devices/{deviceId}/status     QoS 1   retained heartbeat, last will
evengineer/v1/sites/{siteId}/devices/{deviceId}/commands   QoS 1   validated commands (subscribe only)
evengineer/v1/sites/{siteId}/devices/{deviceId}/ack        QoS 1   command acknowledgements
evengineer/v1/sites/{siteId}/events                        QoS 1   session and facility events
```

- **Versioning:** the namespace is versioned (`v1`), so a schema change publishes under `v2` alongside `v1` until every device is migrated.
- **Topic grammar:** `parseTopic` rejects any topic outside this grammar, including a bay id on a device topic or a device id on a bay topic.
- **QoS:** periodic telemetry is sent at most once; state changes, status, commands and acknowledgements at least once. A lost QoS 1 message is retransmitted once after a 0.5 s timeout.

## 3. Message schema (`evengineer.parking.telemetry/1`)

```json
{
  "schema": "evengineer.parking.telemetry/1",
  "eventId": "US-N03-118",
  "siteId": "EVE-IN-POC-01",
  "deviceId": "US-N03",
  "sensorId": "ultrasonic",
  "ts": 1795755600000,
  "seq": 118,
  "measurement": { "raw": 1.4321, "value": true },
  "unit": "m",
  "quality": "good",
  "mode": "SIMULATED"
}
```

`ts` is the device clock in UTC milliseconds; `seq` increases per device; `mode` is one of SIMULATED, RECORDED, LIVE, ESTIMATED, STALE and INVALID. The example ids are synthetic.

## 4. Broker rules (simulated)

- **Identity:** each device connects with its own identity. Connections without TLS are refused (`requireTls`).
- **Access control:** each device may publish only to its own telemetry, status, ack and event topics, plus the occupancy topics of its bay (a row camera covers every bay of its row). It may subscribe only to its own commands topic. Anything else is refused and logged with a reason.
- **Retained messages:** the latest status of each device is retained.
- **Message integrity:** each envelope carries an integrity tag. This is the simulator's own FNV-1a check, used to model tampering detection. It is not cryptography: real devices use TLS client certificates and broker ACLs.

## 5. Gateway ingestion

Applied in this order to every delivered envelope:

1. **Integrity tag**: a mismatch is rejected as INVALID.
2. **Schema validation**: a malformed message is rejected as INVALID.
3. **Duplicate suppression by event id**: ingestion is idempotent, so a repeated occupancy message can never open a second session (SP-B19).
4. **Rate limit**: a token bucket of 20 messages per second per device.
5. **Ordering per device, sensor and topic**: an older sequence number is kept for the record but never regresses the state.
6. **Freshness**: a message older than 12 s (the fusion freshness) is marked STALE, never treated as fresh (SP-B20).

## 6. Commands

| Action | Roles allowed |
|---|---|
| `barrier.open`, `barrier.close` | operator, supervisor, automation |
| `bay.block`, `bay.unblock` | operator, supervisor |
| `bay.release` | supervisor |
| `session.approve`, `session.refuse` | operator, supervisor |
| `charging.stop` | operator, supervisor, automation |
| `alarm.acknowledge`, `lighting.set`, `fan.set` | operator, supervisor |

Viewers and drivers issue none. A command carries its id, action, target, parameters, issuer, role, issue time, expiry and integrity tag. The device controller checks, in order:

1. the integrity tag;
2. the expiry;
3. clock skew;
4. replay (an id already processed);
5. the role.

It then applies its own interlock: a barrier never closes on an obstruction, whatever the command (SP-B07, SP-B08).

An acknowledgement means only "accepted by the local controller". Execution is confirmed by the device's own feedback, such as the barrier's measured angle, never by delivery.

A connected POC would be read-only for remote users (`checkCommand(..., "connected-read-only")`). The public twin exposes no command to a physical actuator.

## 7. Link model and measured behaviour

The facility LAN defaults are latency 12 ms, jitter 6 ms, loss 0.2 % and duplication 0.4 %; all are adjustable in Engineer mode. These results are from `iotReliability()`, seeded and reproducible on any machine:

| Loss | Mean latency | Delivered share | Duplicates suppressed | Out of order | STALE | p95 latency |
|---|---|---|---|---|---|---|
| 0.2 % | 12 ms | 99.8 % | 22 | 2 | 0 | 24 ms |
| 2 % | 50 ms | 99.0 % | 22 | 11 | 0 | 105 ms |
| 10 % | 200 ms | 95.7 % | 22 | 51 | 0 | 697 ms |
| 30 % | 500 ms | 85.5 % | 22 | 172 | 0 | 1,312 ms |

The study injects a fixed set of duplicates, which is why that column is constant. Every one of them was suppressed. The delivered share stays above one minus the loss rate because QoS 1 messages are retransmitted.

Gateway ingestion throughput was measured on the development machine (Apple M1, Node) in `scalabilityStudy()`. It was about 150,000–260,000 messages per second, far above the 3 messages per bay per period that a site generates. It is not a benchmark of real gateway hardware.

## 8. Node firmware plan (ESP32-class)

| Function | Plan |
|---|---|
| Sampling | Ultrasonic distance and infrared state at 2 Hz, debounced over 3 consecutive agreeing samples, as the simulation models them (`facility.ts · sense`, `occupancy.ts · debounce`) |
| Publishing | State change immediately (QoS 1); state and heartbeat every 10 s |
| Identity | Per-device X.509 client certificate provisioned at commissioning; no shared secrets |
| Time | SNTP from the gateway; `ts` in UTC ms; drift alarm if the offset exceeds 1 s |
| Resilience | Local ring buffer of 256 messages while the broker is unreachable; replay in order with the original `seq` |
| Updates | Signed over-the-air images, A/B partitions, rollback on failed boot |
| Watchdog | Hardware watchdog; the last will marks the node offline |
| Local actuators | Bay indicator driven locally from the node's own state and the gateway's bay status, so a bay never shows *available* when the node itself sees a vehicle |

## 9. Network topology (POC and pilot)

```text
[bay nodes] ─ Wi-Fi (device SSID, WPA3, device VLAN) ─┐
[row cameras, ANPR] ─ PoE switch (device VLAN) ────────┤
[barrier, fan, light controllers] ─ wired, device VLAN ┤
                                                       ├─ edge gateway (broker, services, local DB)
[operator workstation] ─ management VLAN ──────────────┘          │
                                                          outbound TLS only ─► cloud platform
```

There are no inbound connections from the internet. Remote access, if it is ever allowed, goes through an authenticated outbound tunnel started by the gateway and is read-only for remote users.
