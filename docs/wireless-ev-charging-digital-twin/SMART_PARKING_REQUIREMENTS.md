# Environment 01 — Smart Parking & Wireless EV Charging: requirements

**Status: implemented in simulation (Phase 4, 27 Nov 2026), awaiting the EV.ENGINEER™ team's acceptance.** The laboratory rail lists it first as *01 Smart Parking*; it opens with the 12-bay facility, its 18 guided stages, the driver and operator workflows and the research studies. No physical facility exists: every value is SIMULATED (or RECORDED in replay) and nothing is labelled LIVE.

Designed and developed by and for the EV.ENGINEER™ team.

## Scope

Intelligent parking management that hands compatible vehicles over to wireless charging: detection, identification, authorisation, allocation, entry and exit, guidance, occupancy, environmental monitoring, solar and storage energy, reservations, billing and the charging session — in one facility digital twin that reuses the existing Station model rather than duplicating it.

The work is additive. The theme, the rail order and style, sign-in, the Station, Road, Autonomous and Infrastructure environments and their models are unchanged; the Station model gained two commands (`arrive-parked`, `stop`) and an option to hold after completion. Direct tests in `smart-parking.test.ts` and checks SP-B12–SP-B15 cover them, and the Station's default behaviour is unchanged.

## Requirement classes

| Class | IDs | Count | Where it is traced |
|---|---|---|---|
| Baseline functional requirements | SP-R01–SP-R38 | 38 | SMART_PARKING_REQUIREMENTS_TRACEABILITY.md |
| EV.ENGINEER™ engineering extensions | SP-E01–SP-E12 | 12 | same |
| Supplementary engineering requirements | SP-S01–SP-S10 | 10 | same (grouped with the class they extend) |
| International scalability | SP-X01–SP-X03 | 3 | same |
| Physical POC | SP-P01–SP-P03 | 3 | same |
| Future commercial deployment | SP-C01–SP-C02 | 2 | same |

The matrix is generated from `src/lib/wireless-charging/smart-parking/requirements.ts`. Each row records the subsystem, hardware and software dependencies, model, 3D visualisation, implementation status, verification, evidence and physical deployment status. Implementation statuses use the twin's scale (Planned, Designed, Implemented, Tested, Analytically verified, Experimentally validated); none is *Experimentally validated*, because no measurements exist.

## Baseline functional requirements (SP-R01–SP-R38)

All 38 are kept; none is merged away or omitted.

| ID | Requirement | ID | Requirement |
|---|---|---|---|
| SP-R01 | Physical parking shelter and structure | SP-R20 | Anomaly detection |
| SP-R02 | Protection from sun, rain and dust | SP-R21 | Smoke, gas and temperature monitoring |
| SP-R03 | IoT vehicle detection | SP-R22 | Ventilation control |
| SP-R04 | Real-time bay occupancy | SP-R23 | Solar energy management |
| SP-R05 | Embedded sensor controllers | SP-R24 | Battery energy management |
| SP-R06 | Automated entry | SP-R25 | Intelligent lighting |
| SP-R07 | Automated exit | SP-R26 | Parking fee calculation |
| SP-R08 | Camera-based identification | SP-R27 | Payment processing architecture |
| SP-R09 | AI image processing | SP-R28 | Automated barrier |
| SP-R10 | RFID access | SP-R29 | LED guidance displays |
| SP-R11 | QR access | SP-R30 | Alarm actuators |
| SP-R12 | Number plate recognition | SP-R31 | Fan and lighting actuators |
| SP-R13 | Intelligent slot allocation | SP-R32 | Driver reservation interface |
| SP-R14 | Duration tracking | SP-R33 | Driver payment interface |
| SP-R15 | Secure MQTT communication | SP-R34 | Operator dashboard |
| SP-R16 | Edge processing | SP-R35 | Authorised operator override |
| SP-R17 | Cloud or equivalent data platform | SP-R36 | Physical prototype |
| SP-R18 | Database and API services | SP-R37 | Testing and performance evaluation |
| SP-R19 | Demand forecasting | SP-R38 | Research documentation and evidence |

## Extensions (SP-E01–SP-E12)

Wireless and conventional bays; charging eligibility; charging-aware allocation; integration with the Station twin; shared battery and energy models; interactive 3D engineering visualisation; scientific parking models; research experiments; multi-site architecture; regional adapters (IN, US, CN); secure physical-prototype integration.

## Supplementary requirements (SP-S01–SP-S10)

| ID | Requirement | Where |
|---|---|---|
| SP-S01 | Shelter engineering exploration: framework, roof slope, drainage, bay dimensions, mounting, cable routing, enclosure, ventilation, lighting, PV, maintenance access | Shelter view and cutaway; SMART_PARKING_HARDWARE_PLAN.md §1 |
| SP-S02 | Installation and commissioning with device-to-twin mapping | SMART_PARKING_HARDWARE_PLAN.md §3–§6 |
| SP-S03 | Edge, cloud and hybrid AI; safety-critical control always local | Engineer inputs; SMART_PARKING_AI_MODELS.md §6 |
| SP-S04 | Three independent timelines | `programme.ts`; Research mode; SMART_PARKING_IMPLEMENTATION_REPORT.md §6 |
| SP-S05 | Research evaluation against a manual baseline | `experiments.ts`; SMART_PARKING_TEST_PLAN.md §3 |
| SP-S06 | Private governance and IP records | SMART_PARKING_GOVERNANCE_TEMPLATE.md (template only) |
| SP-S07 | Deployment validation plan | SMART_PARKING_TEST_PLAN.md §6 |
| SP-S08 | Reproducible research with fair baselines, paired seeds, replications, scenarios, confidence intervals and export (added 27 Nov 2026) | `research.ts`; SMART_PARKING_EXPERIMENT_RESULTS.md |
| SP-S09 | Direct links open the named environment from the first paint; the address follows environment changes (added 27 Nov 2026) | `Launch.tsx · useLaunchEnvironment`; laboratory tests |
| SP-S10 | Hardware-connected twin data modes with a telemetry-only POC path (added 27 Nov 2026) | SMART_PARKING_HARDWARE_INTEGRATION_SPEC.md |

## Fixed decisions

- **Default layout:** 12 bays (8 conventional including 1 accessible, 4 wireless), configurable up to 48 in the interface and 1,000 in the engine studies. The POC preset has 6 bays (4 conventional, 2 wireless).
- **No duplicate wireless engine.** Each wireless bay runs its own instance of the Station simulation (WPT-SIM-001), with the same coupler, power chain, battery and safety state machine.
- **Identity:** synthetic plates, tags and tokens only. Recognition is simulated with a declared error model, and no recognition accuracy is claimed.
- **Data modes:** SIMULATED, RECORDED, ESTIMATED, STALE and INVALID are used. LIVE is reserved for connected hardware, and none is connected.
- **Safety:** barrier interlocks, alarms and charging protection are local. A cloud or gateway failure never bypasses them (SP-B09, SP-B24). The public application exposes no physical actuator command.
- **Money and energy:** money is held in integer minor units and energy in integer watt-hours. The parking, charging and energy ledgers are kept separate.

## Workshop integration

The eight-month practical workshop in `content.ts` keeps all its units. The Smart Parking stages, inspector entries and the Physics & Mathematics lesson topics SP-MATH-001…012 are additional material that the IoT, infrastructure and research-methods months can use. They do not replace any of those months' units.
