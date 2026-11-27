# Smart Parking — test and evaluation plan

This plan covers four kinds of evidence:

- **Software verification**, done and repeatable.
- **Research evaluation** against a manual baseline, run in simulation.
- **Physical POC test procedures**, planned.
- **The deployment validation plan**, planned.

Results measured in this phase are given with their seed and conditions. Nothing here is an experimental measurement.

## 1. Software verification

### Automated checks (`smart-parking/checks.ts`)

The 38 checks run in `npx vitest run src/lib/wireless-charging` (each as its own test in `engine.test.ts`) and in the visitor's browser from Engineering Assurance, beside the twin's 32 original checks: 70 in all.

| ID | Check |
|---|---|
| SP-A01 | Erlang B recurrence against the closed form (to 1e-12, c = 1…20, a = 0.5…30) |
| SP-A02 | M/M/c/K: normalisation, Little's law and the loss-system limit |
| SP-A03 | Discrete-event simulation against M/M/c/K |
| SP-A04 | Shelter thermal node: exact step against the analytical solution |
| SP-A05 | Solar power formula and temperature derating |
| SP-A06 | Facility energy balance closes at every step |
| SP-A07 | Billing in integer minor units |
| SP-A08 | Node debounce and fusion hysteresis do not chatter |
| SP-A09 | Event-level charging surrogate against the Station model |
| SP-A10 | Forecast baselines on a known periodic history |
| SP-A11 | k-out-of-n sensor availability and uncertainty propagation |
| SP-A12 | Robust anomaly statistic |
| SP-B01 | A vehicle is detected and opens exactly one session |
| SP-B02 | An uncertain or unknown identity is never authorised automatically |
| SP-B03 | Allocation respects every hard constraint |
| SP-B04 | A reserved bay is never offered to another vehicle |
| SP-B05 | No double occupancy and no double booking |
| SP-B06 | Occupancy uncertainty is visible and never assigned |
| SP-B07 | The barrier never closes on an obstruction |
| SP-B08 | Unauthorised commands are rejected |
| SP-B09 | Cloud and gateway failure never bypass local safety |
| SP-B10 | Environmental alarms trigger the expected simulated responses |
| SP-B11 | An incompatible vehicle cannot start wireless charging |
| SP-B12 | Charging begins only after the Station's own safety checks |
| SP-B13 | Parking and charging sessions keep one identity chain |
| SP-B14 | Battery energy is never counted twice |
| SP-B15 | Charging stops safely before departure |
| SP-B16 | Parking duration is calculated correctly |
| SP-B17 | Charging cost and parking fees stay separate |
| SP-B18 | A bay becomes available only after verified departure |
| SP-B19 | Duplicate IoT messages never create duplicate sessions |
| SP-B20 | Stale data is never treated as fresh |
| SP-B21 | Results do not depend on how the clock is driven |
| SP-B22 | Scenario replay is reproducible |
| SP-B23 | Congestion: no double allocation and no two vehicles in one lane zone |
| SP-B24 | Safe egress when the gateway is down |
| SP-B25 | Tailgating is detected and referred to an operator |
| SP-B26 | A vehicle in the wrong bay is reassigned or referred |

### Unit, interface and browser tests

| Suite | Covers |
|---|---|
| `src/lib/wireless-charging/engine.test.ts` | Every check (twin and Smart Parking), and every check's models registered |
| `src/lib/wireless-charging/smart-parking/smart-parking.test.ts` | A complete, closed state machine; plates that validate in their own region's format; any layout size; the versioned MQTT namespace; a 10-minute demonstration run with no refused transition and nothing LIVE; consistent registration of components, models, checks and requirements; policy comparison on common random numbers; every study's values plausible; the Station's `arrive-parked`, `stop` and `holdAfterComplete` |
| Other `src/lib/wireless-charging/*.test.ts` | The Station and the other environments' models, unchanged |
| `src/components/wireless-ev-twin/lab/laboratory.test.tsx` | The 18 Smart Parking stages; the gate flow with the QR credential; Explore Wireless Charging and Return; the share link |
| `src/app/internships/wireless-ev-charging-digital-twin/page.test.tsx` | The rail: *01 Smart Parking* first and enabled; the other environments unchanged |
| `scripts/test-wireless-ev-twin.cjs` (`npm run test:wireless-ev-twin:e2e`) | A production build in Chromium: environment switching including 01, six Smart Parking checks (stages, views, operator panel, hand-over, 48 bays), frame rate, memory, screenshots |

## 2. Research evaluation against the manual baseline (SP-S05)

All studies are in `experiments.ts`, seeded and reproducible. Each policy sees the same arrivals and vehicles (common random numbers).

The **manual baseline** is a facility without guidance and without protected wireless bays. Drivers take the first free bay they pass, cruising the aisle. One pass in four misses and needs a loop of the aisle. This baseline is a declared behavioural assumption, not an observation.

### 2.1 Allocation policies (`comparePolicies`: 12 bays, 7 arrivals/h, commuter profile, 10 h, seed 4242)

Columns: **Parked** — vehicles parked; **Util.** — utilisation; **Wait** — mean wait; **Search** — gate to bay; **Walk** — walk to the pedestrian exit; **Charging** — EVs charged of those that asked; **Energy** — energy delivered; **Abandoned** — left the queue.

| Policy | Parked | Util. | Wait | Search | Walk | Charging | Energy | Abandoned |
|---|---|---|---|---|---|---|---|---|
| Manual baseline | 35 | 75.0 % | 66 s | 24.3 s | 19.4 m | 0 / 15 | 0 kWh | 9 |
| First available | 30 | 57.0 % | 11 s | 12.2 s | 17.9 m | 3 / 15 | 31 kWh | 14 |
| Nearest | 30 | 57.0 % | 11 s | 12.2 s | 17.9 m | 3 / 15 | 31 kWh | 14 |
| Reservation priority | 30 | 57.0 % | 11 s | 12.2 s | 17.9 m | 3 / 15 | 31 kWh | 14 |
| Charging-aware | 37 | 73.1 % | 27 s | 12.9 s | 18.8 m | 12 / 15 | 202 kWh | 7 |
| Multi-objective (default) | 37 | 73.1 % | 27 s | 12.9 s | 18.5 m | 12 / 15 | 202 kWh | 7 |

Reading the table:

- **Guidance roughly halves the search time** (24.3 s down to 12–13 s) under the declared cruising model.
- **Protecting wireless bays has a cost.** With overflow disabled, the policies that are not charging-aware leave the four wireless bays to compatible EVs but do not steer those EVs into them. Conventional cars then lose a third of the bays, and fewer vehicles park than under the manual baseline: 30 against 35.
- **Charging-aware and multi-objective policies beat the baseline on every measure here:** more vehicles parked, 12 of 15 charging requests served against 0, and fewer vehicles abandoning the queue.
- **Three policies give identical results here.** The event-level model has no reservations, so first-available, nearest and reservation priority choose the same bays in this run. They differ in the facility simulation, where reservations and walking distances matter.

### 2.2 Capacity (`capacityStudy`: 12 bays, queue 4, mean stay 2 h, seed 99)

| Arrivals/h | Offered load (Erlang) | Blocking, M/M/c/K | Blocking, DES (exponential stays) | Blocking, DES (lognormal stays) | Mean wait (DES) |
|---|---|---|---|---|---|
| 2 | 4 | 0.000 | 0.000 | 0.000 | 0.0 min |
| 4 | 8 | 0.009 | 0.005 | 0.010 | 1.7 min |
| 5 | 10 | 0.044 | 0.038 | 0.044 | 4.8 min |
| 6 | 12 | 0.111 | 0.121 | 0.117 | 13.3 min |
| 7 | 14 | 0.193 | 0.212 | 0.218 | 19.4 min |
| 8 | 16 | 0.273 | 0.304 | 0.283 | 24.1 min |
| 10 | 20 | 0.406 | 0.419 | 0.418 | 28.4 min |

The DES agrees with the closed form to within 0.031 at every load; the largest gap is at 8 arrivals/h. Check SP-A03 sets the formal tolerance. Lognormal stays change blocking little at these loads. Erlang's loss formula is insensitive to the stay distribution, but with a waiting room that holds only approximately.

### 2.3 Charging demand (`chargingDemandSweep`, 4 wireless bays)

| Share of EVs with a receiver | Asked | Served | Wireless-bay utilisation | Energy |
|---|---|---|---|---|
| 10 % | 4 | 4 | 12.2 % | 54 kWh |
| 25 % | 12 | 11 | 47.7 % | 210 kWh |
| 40 % | 14 | 11 | 35.7 % | 175 kWh |
| 60 % | 25 | 13 | 43.0 % | 204 kWh |
| 80 % | 25 | 13 | 43.0 % | 204 kWh |

Four wireless bays saturate at about 11–13 sessions a day under this arrival pattern, because charged vehicles stay parked after charging. Utilisation counts only hours of active charging.

### 2.4 Energy (`energyStudy`: 120 kWh charging per day, 25 % cloud, default PV and storage)

| Mode | Grid | PV used | PV curtailed | Grid peak | Energy cost | Largest power-balance residual |
|---|---|---|---|---|---|---|
| Grid only | 115.4 kWh | 0 | 0 | 15.2 kW | ₹981 | 4e-12 W |
| Solar-assisted | 13.5 kWh | 101.8 kWh | 68.7 kWh | 2.2 kW | ₹114 | 4e-12 W |
| Solar + storage | 13.4 kWh | 102.0 kWh | 68.6 kWh | 2.2 kW | ₹113 | 4e-12 W |

PV covers most of a sunny day's demand, and a large surplus is curtailed. The 30 kWh store with a 25 % reserve adds little on this day.

Two improvements follow:

- shift charging into the PV hours;
- add an export or storage-charging strategy.

Both are research items, not conclusions about any real site.

### 2.5 Environmental safety (`environmentalStudy`, 15 min, source for the first 5 min)

| Scenario | Alarm after | Peak | Remaining at 15 min |
|---|---|---|---|
| Simulated smoke source, fans working | 84 s | 9.3 %/m | 0.0007 %/m |
| Simulated gas release, fans working | 88 s | 11.3 %LEL | 0.0009 %LEL |
| Smoke with failed fans | 66 s | 19.8 %/m | 0.45 %/m |

With fans failed, the alarm comes earlier because the concentration rises faster, the peak is about twice as high, and clearance is far slower. This is the expected well-mixed behaviour. The simulated sources are not life-safety equipment.

### 2.6 Pricing (`pricingStudy`, IN tariff, 2,000 lognormal stays with a 2.5 h median)

| Tariff | Mean bill | Revenue per bay-hour | Bills at the daily cap | 30 kWh charging bill |
|---|---|---|---|---|
| Configured (60 min ₹30, then ₹15 per 30 min) | ₹95.52 | ₹38.35 | 2.1 % | ₹680 |
| Shorter blocks (15 min) | ₹91.65 | ₹36.80 | 1.9 % | ₹680 |
| No grace period | ₹95.52 | ₹38.35 | 2.1 % | ₹680 |

The study does not predict driver behaviour; demand response to price is not modelled. Removing the 10-minute grace period changes nothing here because no stay in the sample is that short.

### 2.7 Forecasting, recognition, fusion and communications

These studies are reported in SMART_PARKING_AI_MODELS.md §1–§3 and SMART_PARKING_IOT_ARCHITECTURE.md §7.

### 2.8 Scalability (`scalabilityStudy`; measured on the development machine, Apple M1, Node)

| Bays | Allocation decision | DES of one day | Vehicles that day | Gateway ingestion |
|---|---|---|---|---|
| 12 | 0.003 ms | < 1 ms | 66 | ≈ 150 k msg/s |
| 100 | 0.02 ms | 1 ms | 538 | ≈ 260 k msg/s |
| 500 | 0.25 ms | 3 ms | 2,685 | ≈ 260 k msg/s |
| 1,000 | 0.97 ms | 9 ms | 5,181 | ≈ 245 k msg/s |

These timings depend on the machine and vary between runs. They show that allocation and ingestion are not the bottleneck at any realistic site size.

## 3. Research method (for every study)

1. **Question and hypothesis**, stated before the run. Example: *charging-aware allocation serves more charging requests than the manual baseline without lowering the number of vehicles parked.*
2. **Baseline:** the manual baseline and the simplest policy (first available).
3. **Controlled inputs:** layout, arrival rate and profile, vehicle mix, stay distribution, queue, patience and seed, recorded in the run's parameters.
4. **Common random numbers** across the policies being compared.
5. **Replications:** at least 30 seeds for any claim. The single-seed tables above show the method, not a statistically settled result. Report the mean, the standard deviation and a 95 % interval (t-distribution), and use paired differences between policies.
6. **Sensitivity:** vary each declared assumption, such as the cruising model, patience, stay shape and receiver share, and report whether the ranking survives.
7. **Validity limits:** synthetic demand, a declared driver behaviour and simulated sensors. No result transfers to a real site until it is repeated with that site's data.

## 4. Physical POC test procedures (planned)

| Test | Procedure | Measurement | Acceptance (declared before testing) |
|---|---|---|---|
| Occupancy accuracy | 200 park and leave events per bay type, with the ground truth logged by a person from an overhead reference camera | Decided-state accuracy, uncertain share, time to confirm | At least 98 % accuracy; zero false *vacant* at allocation |
| Plate recognition | Labelled image set of synthetic plates, split by session (SMART_PARKING_AI_MODELS.md §7) | Plate accuracy, false-accept rate, latency on the gateway | At least 95 % plate accuracy; false accepts at or below 0.1 % at the operating threshold, with a 95 % Wilson interval |
| Credential fallback | Covered plate with a registered tag or code, and with an unregistered one | Decision, time | 100 % correct decisions |
| Barrier safety | 50 closures with an obstruction object at 5 positions | Closures on the obstruction | Zero |
| Communications | Unplug the network, power-cycle the gateway, unplug nodes, flood the broker | STALE marking, recovery time, duplicate sessions | Zero duplicate sessions; STALE within 3 periods; exits open on local control |
| Sensor-to-dashboard latency | Time-stamped events through to the twin's display | p50 and p95 | p95 below 1 s on the local network |
| Energy accounting | Metered energy against the twin's ledger over 8 h | Residual | Within the meters' declared accuracy |
| Low-voltage wireless link | Power in and out at 3 gaps × 3 offsets; coil temperature | Efficiency, residual against WPT-SIM-001 at the same geometry | Residuals reported (calibration input, no target assumed) |
| End-to-end lifecycle | 50 full entry-to-exit runs, including 10 charging sessions | Sessions completed, state transitions, bills | Every run completes or ends in a declared exceptional state with a correct record |

## 5. Datasets, uncertainty and reporting

- Every dataset records:
  - its provenance (device ids, firmware, calibration, dates);
  - its labelling procedure and the labeller;
  - its licence;
  - its retention period.
- Plates are synthetic. No real person, plate or face is recorded.
- Measurement uncertainty is combined in quadrature from the calibration records. Model-versus-measurement residuals are reported with that uncertainty.
- Proportions are reported with Wilson 95 % intervals, and continuous results with t-intervals over replications.
- Recorded sessions use the twin's recording format (`evengineer.parking.recording/1`) and are replayed in RECORDED mode for analysis. Replay never drives an actuator.
- A result becomes *Experimentally validated* in the registry only for the range it was measured over, with a link to the report.

## 6. Deployment validation plan (SP-S07)

1. **Entry criteria:**
   - commissioning complete (SMART_PARKING_HARDWARE_PLAN.md §3);
   - calibration records complete;
   - hazard review signed off;
   - acceptance criteria in §4 frozen.
2. **Shadow operation**, one week: the physical facility runs with the twin in observation mode. Compare every session's state sequence with the twin's replay of the same telemetry. Any divergence is logged and explained.
3. **Fault campaign:** each fault in §4, plus a power interruption and a gateway restore from backup.
4. **Operator trial:** trained operators run the dashboard for one week. Record:
   - interventions;
   - the time to resolve anomalies;
   - usability findings.
5. **Demonstration:** the 18-stage scenario performed on the POC, with the twin showing the same session in LIVE mode only after the acceptance of §4.
6. **Exit criteria:**
   - every §4 criterion met, or its deviation accepted in writing by the EV.ENGINEER™ team;
   - the validation report issued;
   - the registry's validation statuses updated for the measured ranges only.

## 7. Definition of done for this phase (software)

| Criterion | Status |
|---|---|
| All 38 Smart Parking checks pass in tests and in the browser | Done |
| Unit, interface, page and end-to-end suites pass; existing environments unchanged | See SMART_PARKING_IMPLEMENTATION_REPORT.md §3 |
| Every baseline requirement traced; generated matrix current | Done (65 requirements) |
| Documentation set complete | Done |
| Visual acceptance by the EV.ENGINEER™ team | Pending |
