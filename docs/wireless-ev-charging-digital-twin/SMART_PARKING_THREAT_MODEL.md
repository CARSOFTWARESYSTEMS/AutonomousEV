# Smart Parking — cybersecurity threat model and safety-function review

Scope: the public digital twin as it is today, and the hardware-connected POC as specified (SMART_PARKING_HARDWARE_INTEGRATION_SPEC.md). This document complements SMART_PARKING_SECURITY_AND_PRIVACY.md. Nothing here claims an assessment by an independent party: none has been carried out.

## 1. Trust boundaries

```text
 [B1] Visitor's browser ── public twin (static page + client JS): synthetic data only, no command path
 ─────────────────────────────────────────────────────────────────────────────────────────────
 [B2] Authorised viewer ── read-only telemetry stream (authenticated), future
 ─────────────────────────────────────────────────────────────────────────────────────────────
 [B3] Cloud/telemetry service ── historical store, replay; receives outbound TLS from the edge only
 ─────────────────────────────────────────────────────────────────────────────────────────────
 [B4] Edge controller (gateway) ── broker, ingestion, fusion, sessions, local store
 ─────────────────────────────────────────────────────────────────────────────────────────────
 [B5] Device network ── ESP32 nodes, cameras, readers (per-device certificates, ACLs)
 ─────────────────────────────────────────────────────────────────────────────────────────────
 [B6] Local safety functions ── barrier interlock, alarm controller, charger protection, emergency stop
       (hardware and firmware on the device; trusted by nothing above and depending on nothing above)
```

Data crosses each boundary in one direction except B4 ↔ B5. Safety (B6) depends on no boundary above it.

## 2. Threats

Ratings are likelihood × impact for the POC, on a three-point scale.

| # | Threat | Boundary | Example | Rating | Mitigation (design) | Demonstrated in the twin |
|---|---|---|---|---|---|---|
| T1 | Identity spoofing (device) | B5 | A rogue node publishes as `US-N03` | M × H | Per-device X.509 client certificates; broker refuses non-TLS connections; ACL binds identity to topics | TLS-required connect; ACL refusals logged (SP-B08) |
| T2 | Identity spoofing (vehicle) | B4 | A copied plate or a cloned RFID tag | M × M | High recognition threshold; uncertain reads never authorise; RFID + plate consistency check (planned); operator review of mismatches | SP-B02 |
| T3 | Manipulated occupancy | B5 | A sensor forced to read "vacant" so a bay is double-allocated | M × M | Three independent sensors with fusion; any disagreement makes the bay *uncertain*, never assigned; atomic, versioned reservation | SP-B05, SP-B06 |
| T4 | Unauthorised access (operator) | B2–B4 | A viewer tries to open a barrier | L × H | Role-based permissions; commands only at the local console; the public twin has no command path | SP-B08; the browser check *a viewer cannot override* |
| T5 | Replay | B4–B5 | A captured "open" command or occupancy message resent | M × M | Command ids, expiry, clock-skew window; idempotent event ids; per-device sequence | SP-B08, SP-B19 |
| T6 | Compromised sensor | B5 | Firmware altered to report false data | L × H | Signed OTA images; plausibility limits; cross-sensor disagreement anomalies; device registry with firmware versions | Disagreement and stuck-value anomalies (SP-A12) |
| T7 | Communication failure | B3–B5 | Wi-Fi loss, broker down, cloud outage | H × M | STALE marking, last will, store and forward; exits open on local presence; charging stops locally | SP-B09, SP-B20, SP-B24 |
| T8 | False charging data | B4–B5 | Inflated energy to over-bill, or "charging" reported while the pad is off | M × M | Metering at the grid side of the charger; the parking record takes the Station's own session record once; the integrity tag; residual checks between the facility meter and the sum of sessions | SP-B14, SP-B17; SP-A06 (energy balance) |
| T9 | Denial of service | B4 | A flood of messages | M × M | Per-device token bucket; broker limits; segregated device network | Rate limiter (20 messages/s per device) |
| T10 | Data exposure | B3 | Plates and images leaked | M × H | Synthetic plates only in the POC; keyed plate hashes in deployment; no image retention; retention limits | No personal data exists in the twin |

## 3. Safety-function review

| Function | Requirement | Where enforced | Independent of AI and network? | Evidence |
|---|---|---|---|---|
| Barrier obstruction interlock | Never close on an obstruction; reverse if one appears | Barrier controller (`barrier.ts` model; firmware planned) | Yes | SP-B07; POC test of 50 closures (TEST_PLAN §4) |
| Charging authorisation | No energy before parking eligibility (7 checks) and the Station's own checks | Charging adapter and Station state machine | Yes; AI recognition is not part of it | SP-B11, SP-B12 |
| Safe departure | Pad de-energised before the vehicle moves | Station (`stoppedSafely`) | Yes | SP-B15 |
| Environmental alarm | Entry suspended, exits open, every charger tripped, fans to purge | Local safety controller | Yes | SP-B10, SP-B09 |
| Gateway loss | New entries wait; exits open on local presence; payment deferred | Device controllers | Yes | SP-B24 |
| Emergency stop (POC) | Removes power from actuators and the LV link within 0.5 s | Hard-wired | Yes | POC acceptance (READINESS §5); not yet tested |

No AI component (recognition, forecasting, anomaly detection) is in any safety path. Each one only proposes or informs, and the interlocks decide.

## 4. Engineering assurance gates

The seven review gates in Engineering Assurance are unchanged by this review:

| Gate | Status |
|---|---|
| MCR | Ready for review |
| SRR | Evidence in preparation |
| PDR | Evidence in preparation |
| CDR | Not started |
| TRR | Not started |
| VRR | Not started |
| FRR | Not started |

No gate is marked approved. Approval needs an authorised review recorded in the private governance store (SMART_PARKING_GOVERNANCE_TEMPLATE.md), not a document in this repository.

## 5. Open items before any connection

1. An independent security assessment of the gateway, broker configuration and firmware.
2. Replace the simulator's integrity tag with asymmetric command and record signing.
3. Hazard analysis (FMEA) of the POC, including the LV link, battery and barriers.
4. A plate and RFID consistency rule (T2), and metering cross-checks (T8) implemented in the gateway.
