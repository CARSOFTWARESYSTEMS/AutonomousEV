# Smart Parking — requirements traceability

Generated from `src/lib/wireless-charging/smart-parking/requirements.ts`. Requirement → subsystem → hardware and software dependencies → model → 3D visualisation → implementation status → verification → evidence → physical deployment status. Baseline functional requirements (SP-R01–SP-R38) are kept in full and none is omitted; EV.ENGINEER™ extensions and the scalability, POC, commercial and supplementary items are listed separately. Nothing physical has been built, so no item is physically deployed or experimentally validated.

Implementation status: Implemented 17 · Tested 31 · Designed 12 · Analytically verified 2 · Planned 2 · Blocked 1

Physical deployment status: Not started 59 · Planned 5 · Not applicable 1

## Original functional requirement (38)

| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |
|---|---|---|---|---|---|---|---|---|---|---|
| SP-R01 | Physical smart parking shelter with structural arrangements | Shelter | Steel frame, canopy, foundations | src/components/wireless-ev-twin/three/smart-parking/Shelter.tsx | SP-MATH-007 | Shelter, columns, beams, purlins; Shelter view and cutaway | Implemented | — | 3D model and SMART_PARKING_HARDWARE_PLAN.md; representative dimensions, no structural assessment | Not started |
| SP-R02 | Protection from sunlight, rain and dust | Shelter | Roof, gutters, overhangs | src/lib/wireless-charging/smart-parking/environment.ts | SP-MATH-007 | Roof overhang, gutters; rain scenario | Implemented | SP-A04 | Solar gain and rain in the thermal model; protection is geometric (no weathering model) | Not started |
| SP-R03 | IoT-based vehicle detection | Sensing | Presence loop, IR beams, ESP32 nodes | src/lib/wireless-charging/smart-parking/facility.ts · detect | SP-CTRL-002, SP-MATH-003 | Presence detectors at the gates | Tested | SP-B01, SP-B19 | One detection event opens one session | Not started |
| SP-R04 | Real-time parking bay occupancy monitoring | Sensing | Ultrasonic, IR, row cameras | src/lib/wireless-charging/smart-parking/occupancy.ts | SP-MATH-003 | Bay indicators, Occupancy view | Tested | SP-A08, SP-B06, SP-B18 | Fused bay states twice a second | Not started |
| SP-R05 | Embedded sensor controllers | IoT | ESP32-class nodes | src/lib/wireless-charging/smart-parking/occupancy.ts · debounce | SP-MATH-003, SP-MATH-011 | Nodes on the columns | Tested | SP-A08 | Node debounce and publishing modelled; firmware plan in SMART_PARKING_IOT_ARCHITECTURE.md | Not started |
| SP-R06 | Automated vehicle entry | Access | Entry barrier, controller | src/lib/wireless-charging/smart-parking/facility.ts | SP-CTRL-001, SP-CTRL-002 | Entry gate and barrier animation | Tested | SP-B01, SP-B07 | Detection → identification → authorisation → allocation → barrier | Not started |
| SP-R07 | Automated vehicle exit | Access | Exit barrier, ANPR | src/lib/wireless-charging/smart-parking/facility.ts · exitFlow | SP-CTRL-002 | Exit gate | Tested | SP-B15, SP-B24 | Exit after billing; safe egress | Not started |
| SP-R08 | Camera-based vehicle identification | Identification | Recognition camera | src/lib/wireless-charging/smart-parking/identification.ts | SP-AI-001 | Recognition camera and pipeline panel | Tested | SP-B02 | SIMULATED recognition with a declared error model | Not started |
| SP-R09 | AI-based image processing | Identification | Edge computer | src/lib/wireless-charging/smart-parking/identification.ts | SP-AI-001 | Pipeline stages | Implemented | SP-B02 | Pipeline and confidence simulated; no inference runs in the web app — model evaluation planned on POC images (SMART_PARKING_AI_MODELS.md) | Not started |
| SP-R10 | RFID access | Identification | RFID reader | src/lib/wireless-charging/smart-parking/identification.ts · decideAccess | SP-AI-001 | Reader pedestal | Tested | SP-B02 | RFID fallback and member access | Not started |
| SP-R11 | QR access | Identification | QR reader | src/lib/wireless-charging/smart-parking/identification.ts · decideAccess | SP-AI-001 | Reader pedestal | Tested | SP-B02 | Reservation QR and visitor tickets | Not started |
| SP-R12 | Automatic Number Plate Recognition | Identification | ANPR camera | src/lib/wireless-charging/smart-parking/identification.ts, vehicles.ts | SP-AI-001 | Recognition camera | Implemented | SP-B02 | Regional formats validated; accuracy not claimed until evaluated | Not started |
| SP-R13 | Intelligent parking slot allocation | Allocation | Edge computer | src/lib/wireless-charging/smart-parking/allocation.ts | SP-MATH-004 | Allocation stage, guidance display | Tested | SP-B03, SP-B04, SP-B05 | Five policies with hard constraints | Not started |
| SP-R14 | Parking duration tracking | Billing | — | src/lib/wireless-charging/smart-parking/billing.ts | SP-MATH-010 | Session panel | Tested | SP-B16 | Entry to payment, minute rounding | Not started |
| SP-R15 | Secure MQTT communication | IoT | Broker, nodes, gateway | src/lib/wireless-charging/smart-parking/telemetry.ts | SP-IOT-001 | IoT view | Tested | SP-B08, SP-B19, SP-B20 | TLS-required identities, ACLs, integrity tag (simulated), idempotency; no real broker | Not started |
| SP-R16 | Edge processing using an appropriate embedded computing platform | Edge | Raspberry Pi-class gateway | src/lib/wireless-charging/smart-parking/facility.ts · gateway | SP-IOT-001, SP-CTRL-001 | Edge gateway in the enclosure | Tested | SP-B09, SP-B24 | Decisions on the gateway; offline operation | Not started |
| SP-R17 | Centralized cloud or equivalent data platform | Cloud | — | Interfaces only (store and forward) | SP-IOT-001 | — | Designed | — | Store-and-forward counter; cloud platform architecture in SMART_PARKING_ARCHITECTURE.md | Not started |
| SP-R18 | Database and API services | Cloud | — | Session, reservation and ledger records in the simulation | SP-SIM-001 | Operator panel | Designed | — | Data model and API outline in SMART_PARKING_ARCHITECTURE.md; no server database for parking yet | Not started |
| SP-R19 | Parking demand forecasting | Analytics | — | src/lib/wireless-charging/smart-parking/forecast.ts | SP-MATH-006 | Forecast stage | Tested | SP-A10 | Deterministic baselines on synthetic history; ML planned | Not started |
| SP-R20 | Anomaly detection | Analytics | — | src/lib/wireless-charging/smart-parking/facility.ts · anomalies | SP-AI-003 | Operator anomalies list | Tested | SP-A12, SP-B06 | Rules and robust statistics, labelled as such | Not started |
| SP-R21 | Smoke, gas and temperature monitoring | Environment | Prototype smoke, gas, temperature sensors | src/lib/wireless-charging/smart-parking/environment.ts | SP-MATH-007 | Environmental equipment, Environment view | Tested | SP-B10 | Simulated sources only; not life-safety equipment | Not started |
| SP-R22 | Ventilation control | Environment | Jet fans | src/lib/wireless-charging/smart-parking/environment.ts · fanDemand | SP-MATH-007 | Fans spin with duty | Tested | SP-B10, SP-B09 | Thermal, CO and alarm demand | Not started |
| SP-R23 | Solar energy management | Energy | Canopy PV, inverter | src/lib/wireless-charging/smart-parking/energy.ts | SP-MATH-008, SP-MATH-009 | PV canopy, Energy view | Tested | SP-A05, SP-A06 | PV with temperature derating in the dispatch | Not started |
| SP-R24 | Battery energy management | Energy | Battery storage | src/lib/wireless-charging/smart-parking/energy.ts | SP-MATH-009 | Storage cabinet | Tested | SP-A06 | Reserve for essential loads; storage-assisted study | Not started |
| SP-R25 | Intelligent lighting management | Environment | Dimmable LED | src/lib/wireless-charging/smart-parking/environment.ts | SP-MATH-007 | Luminaires dim with daylight | Implemented | — | Daylight- and activity-linked dimming | Not started |
| SP-R26 | Parking fee calculation | Billing | — | src/lib/wireless-charging/smart-parking/billing.ts | SP-MATH-010 | Receipt | Analytically verified | SP-A07, SP-B17 | Integer minor units | Not started |
| SP-R27 | Payment processing architecture | Billing | — | src/lib/wireless-charging/smart-parking/billing.ts · PaymentRecord | SP-MATH-010 | Driver payment sheet | Implemented | SP-B24 | Simulated providers only; real processing needs a provider integration | Not started |
| SP-R28 | Automated parking barrier | Access | Barrier drive and boom | src/lib/wireless-charging/smart-parking/barrier.ts | SP-CTRL-002 | Animated boom from the controller's angle | Tested | SP-B07 | Interlock refuses and reverses closing | Not started |
| SP-R29 | LED parking guidance displays | Guidance | LED modules | src/components/wireless-ev-twin/three/smart-parking/Gates.tsx (entry sign), Shelter.tsx (bay indicators) | SP-MATH-004 | Entry sign and per-bay symbols | Implemented | — | Symbols plus colour (never colour alone) | Not started |
| SP-R30 | Alarm actuators | Environment | Sounder/beacon | src/lib/wireless-charging/smart-parking/environment.ts | SP-MATH-007 | Beacons on alarm | Tested | SP-B10 | Local alarm controller | Not started |
| SP-R31 | Fan and lighting actuators | Environment | Fan and lighting controllers | src/lib/wireless-charging/smart-parking/environment.ts | SP-MATH-007 | Fans, luminaires | Tested | SP-B10 | Duty and level driven by the local controller | Not started |
| SP-R32 | Driver reservation interface | Interfaces | — | src/components/wireless-ev-twin/env/ParkingPanels.tsx · DriverPanel | SP-MATH-004 | Driver tab | Implemented | SP-B05 | Book a class and window; conflicts refused | Not started |
| SP-R33 | Driver payment interface | Interfaces | — | ParkingPanels.tsx · DriverPanel | SP-MATH-010 | Driver tab | Implemented | — | Simulated payment and receipt; no credentials collected | Not started |
| SP-R34 | Centralized operator dashboard | Interfaces | — | ParkingPanels.tsx · OperatorPanel | SP-SIM-001 | Operator tab (compact, beside the 3D scene) | Implemented | — | Occupancy, sessions, devices, energy, environment, anomalies, audit | Not started |
| SP-R35 | Authorized operator override | Interfaces | — | src/lib/wireless-charging/smart-parking/telemetry.ts · checkCommand | SP-IOT-001, SP-CTRL-002 | Operator actions | Tested | SP-B08, SP-B07 | Role-based, expiring, audited commands that never bypass interlocks | Not started |
| SP-R36 | Physical prototype | Prototype | Six-bay miniature (BOM) | — | — | — | Designed | — | SMART_PARKING_POC_BOM.md and HARDWARE_PLAN.md; nothing procured | Planned |
| SP-R37 | Testing and performance evaluation | Verification | Laboratory instruments | Vitest, Playwright, in-browser checks | SP-SIM-001 | Engineering Assurance | Tested | SP-B21, SP-B22, SP-B23 | Software verification only; physical test procedures in SMART_PARKING_TEST_PLAN.md | Not started |
| SP-R38 | Research documentation and engineering evidence | Research | — | docs/wireless-ev-charging-digital-twin/SMART_PARKING_*.md | — | Research mode | Implemented | — | Generated registries and the documentation set | Not started |

## EV.ENGINEER™ engineering enhancement (17)

| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |
|---|---|---|---|---|---|---|---|---|---|---|
| SP-E01 | Wireless charging-compatible parking bays | Charging | Ground pads, cabinets | src/components/wireless-ev-twin/three/smart-parking/Facility.tsx (pads), Overlays.tsx | SP-INT-001 | Pads in the wireless bays | Tested | SP-B11, SP-B12 | Four in the default layout, two in the POC | Not started |
| SP-E02 | Conventional parking bays | Layout | — | src/lib/wireless-charging/smart-parking/layout.ts | SP-MATH-004 | Bays | Tested | SP-B03 | Configurable count | Not started |
| SP-E03 | EV charging eligibility verification | Charging | — | src/lib/wireless-charging/smart-parking/charging.ts · evaluateEligibility | SP-INT-001 | Eligibility stage | Tested | SP-B11 | Seven parking-side checks before the Station's own | Not started |
| SP-E04 | Charging-aware parking allocation | Allocation | — | src/lib/wireless-charging/smart-parking/allocation.ts | SP-MATH-004 | Allocation stage | Tested | SP-B03 | Charging-aware and multi-objective policies | Not started |
| SP-E05 | Integration with the existing Station Digital Twin | Charging | — | src/lib/wireless-charging/smart-parking/charging.ts; src/components/wireless-ev-twin/state/runtime.ts · handover | SP-INT-001, WPT-SIM-001 | Explore Wireless Charging → Station | Tested | SP-B12, SP-B13, SP-B15 | Each wireless bay runs its own Station simulation; the Station environment shows the selected session | Not started |
| SP-E06 | Shared battery and energy models | Charging | — | src/lib/wireless-charging/smart-parking/charging.ts | WPT-BAT-001, SP-INT-001 | — | Tested | SP-B14 | No duplicate battery or WPT engine | Not started |
| SP-E07 | Interactive 3D engineering visualization | Visualisation | — | src/components/wireless-ev-twin/three/smart-parking | — | The facility, views and stages | Implemented | — | Browser checks in scripts/test-wireless-ev-twin.cjs | Not started |
| SP-E08 | Scientific and mathematical parking models | Science | — | src/lib/wireless-charging/smart-parking | SP-MATH-001, SP-MATH-002, SP-MATH-003, SP-MATH-004, SP-MATH-007, SP-MATH-008, SP-MATH-010 | Science panel, Physics & Mathematics lesson | Analytically verified | SP-A01, SP-A02, SP-A03, SP-A04, SP-A05, SP-A07 | Model registry entries with equations, units, validity and limitations | Not started |
| SP-E09 | Research experiments | Research | — | src/lib/wireless-charging/smart-parking/experiments.ts | SP-RES-001 | Research mode | Tested | SP-A09 | Ten reproducible studies | Not started |
| SP-E10 | Multi-site architecture | Architecture | — | src/lib/wireless-charging/smart-parking/telemetry.ts (site-scoped topics and ACLs) | SP-IOT-001 | — | Designed | — | Site-scoped namespace and identities; multi-site cloud is architecture only | Not started |
| SP-E11 | Regional deployment adapters | Architecture | — | src/lib/wireless-charging/smart-parking/billing.ts, vehicles.ts | SP-MATH-010, SP-AI-001 | Region selector | Implemented | SP-A07 | IN, US and CN plate formats, currencies, locales, time zones, payment adapter names | Not started |
| SP-E12 | Secure physical prototype integration | Integration | — | src/lib/wireless-charging/smart-parking/adapters.ts | SP-IOT-001 | Operating-mode selector (hardware modes shown as blocked) | Designed | SP-B08 | Adapter interfaces; Connected POC mode read-only and blocked until hardware exists | Not started |
| SP-S01 | Shelter engineering exploration: framework, roof slope, drainage, sun and dust protection, bay dimensions, mounting, cable routing, enclosure, ventilation, lighting, PV, maintenance access | Shelter | — | src/components/wireless-ev-twin/three/smart-parking/Shelter.tsx | SP-MATH-007 | Shelter view (cutaway, dimensions) | Implemented | — | Representative drawings and specifications in SMART_PARKING_HARDWARE_PLAN.md; no certification claimed | Not started |
| SP-S03 | Configurable edge, cloud and hybrid AI deployment; safety-critical control local | Architecture | — | src/lib/wireless-charging/smart-parking/identification.ts (deployment latency) | SP-AI-001 | Engineer inputs | Implemented | SP-B09 | Placement changes latency; safety interlocks local in every placement | Not started |
| SP-S04 | Three independent timelines (workshop, Phases 4A–4I, 24-month physical programme) | Programme | — | src/lib/wireless-charging/smart-parking/programme.ts | — | Research mode | Implemented | — | Programme data with milestones, deliverables, verification criteria and evidence | Not started |
| SP-S05 | Research evaluation methods against a manual baseline | Research | — | src/lib/wireless-charging/smart-parking/experiments.ts · comparePolicies | SP-RES-001 | Research mode | Tested | SP-A09 | Manual baseline in every policy comparison; methods in SMART_PARKING_TEST_PLAN.md | Not started |
| SP-S06 | Research governance and intellectual property records (private) | Governance | — | docs (template only) | — | — | Designed | — | SMART_PARKING_GOVERNANCE_TEMPLATE.md; nothing confidential in the public application | Not applicable |

## International scalability extension (3)

| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |
|---|---|---|---|---|---|---|---|---|---|---|
| SP-X01 | Configurable language, time zone, currency and number plate format per region | Internationalisation | — | src/lib/wireless-charging/smart-parking/billing.ts · LOCALES | SP-MATH-010 | Region selector | Implemented | SP-A07 | UTC storage, local display | Not started |
| SP-X02 | Regional payment, data retention and data residency configuration | Internationalisation | — | Configuration interfaces | — | — | Designed | — | SMART_PARKING_INTERNATIONALIZATION.md; no residency is enforced in the simulation | Not started |
| SP-X03 | Evaluation of parking data interoperability (APDS) and charging back-end interfaces | Interoperability | — | — | — | — | Planned | — | Listed for evaluation; not treated as real-time wireless charging control | Not started |

## Physical POC requirement (4)

| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |
|---|---|---|---|---|---|---|---|---|---|---|
| SP-P01 | Six-bay miniature facility (four conventional, two wireless demonstration bays) within INR 100,000 | Prototype | BOM | Same logical architecture (POC_LAYOUT) | — | 6-bay preset | Designed | — | SMART_PARKING_POC_BOM.md (cost ceilings, not quotations) | Planned |
| SP-P02 | One isolated low-voltage wireless charging link | Prototype | LV coil pair, driver | WirelessChargingAdapter (designed) | WPT-SIM-001 | — | Designed | — | Hardware plan; safety plan | Planned |
| SP-P03 | Hardware-in-the-loop and software-in-the-loop modes | Integration | POC hardware | src/lib/wireless-charging/smart-parking/adapters.ts | — | Operating-mode selector | Designed | — | Simulation (SIL) runs; HIL modes blocked until devices are connected | Planned |
| SP-S02 | Installation and commissioning workflow with device-to-twin mapping | Deployment | — | docs | — | — | Designed | — | SMART_PARKING_HARDWARE_PLAN.md (site survey → validation; device identification scheme) | Planned |

## Future commercial deployment requirement (3)

| ID | Requirement | Subsystem | Hardware | Software | Model | 3D visualisation | Status | Verification | Evidence | Physical |
|---|---|---|---|---|---|---|---|---|---|---|
| SP-C01 | Full-scale pilot shelter with certified electrical, structural and life-safety systems | Deployment | Full-size infrastructure | — | — | — | Planned | — | Separate requirements in SMART_PARKING_HARDWARE_PLAN.md; separate estimate | Not started |
| SP-C02 | Real payment collection and commercial-grade wireless charging | Deployment | Provider integration, certified charger | — | — | — | Blocked | — | Requires separate approved integrations | Not started |
| SP-S07 | Site deployment and demonstration validation plan | Deployment | — | docs | — | — | Designed | — | SMART_PARKING_TEST_PLAN.md · deployment validation | Not started |
