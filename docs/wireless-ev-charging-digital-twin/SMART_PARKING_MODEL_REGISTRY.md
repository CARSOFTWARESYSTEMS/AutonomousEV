# Smart Parking — model registry

Generated from `src/lib/wireless-charging/registry.ts` (the 21 SP- models of environment 01, registered beside the twin's own). Smart Parking reuses, rather than duplicates, the existing models it depends on: WPT-SIM-001 (the Station, one instance per wireless bay), WPT-CTRL-001 (its charging state machine and interlocks), WPT-BAT-001 (the battery), WPT-GRID-001 (the daily PV shape), WPT-IOT-001 (the link model) and WPT-AV-001 (the kinematic bicycle).

| ID | Model | Domain | Fidelity | Status | Checks | Implementation |
|---|---|---|---|---|---|---|
| SP-MATH-001 | Vehicle arrival process | Smart parking · demand | F1 | Tested | SP-A03 | `src/lib/wireless-charging/smart-parking/queueing.ts · arrivals` |
| SP-MATH-002 | Finite-capacity parking queue | Smart parking · queueing | F1 | Analytically verified | SP-A01, SP-A02, SP-A03 | `src/lib/wireless-charging/smart-parking/queueing.ts · erlangB, mmck, runDes` |
| SP-MATH-003 | Bay occupancy estimation and sensor fusion | Smart parking · sensing | F1 | Tested | SP-A08, SP-B06, SP-B18, SP-B20 | `src/lib/wireless-charging/smart-parking/occupancy.ts · fuse` |
| SP-MATH-004 | Constrained multi-objective slot allocation | Smart parking · optimisation | F1 | Tested | SP-B03, SP-B04, SP-B05, SP-B26 | `src/lib/wireless-charging/smart-parking/allocation.ts · allocate, commitReservation` |
| SP-MATH-005 | Facility vehicle motion | Smart parking · kinematics | F1 | Tested | SP-B23 | `src/lib/wireless-charging/smart-parking/layout.ts · entryPath, exitPaths; facility.ts · moveVehicle` |
| SP-MATH-006 | Parking and charging demand forecast baselines | Smart parking · forecasting | F1 | Tested | SP-A10 | `src/lib/wireless-charging/smart-parking/forecast.ts` |
| SP-MATH-007 | Shelter environment and local safety control | Smart parking · environment | F1 | Analytically verified | SP-A04, SP-B10, SP-B09 | `src/lib/wireless-charging/smart-parking/environment.ts · stepEnv` |
| SP-MATH-008 | Canopy photovoltaic generation | Smart parking · solar | F1 | Analytically verified | SP-A05 | `src/lib/wireless-charging/smart-parking/energy.ts · pvPower` |
| SP-MATH-009 | Facility energy accounting and dispatch | Smart parking · energy | F1 | Tested | SP-A06 | `src/lib/wireless-charging/smart-parking/energy.ts · dispatch, shareCharging` |
| SP-MATH-010 | Parking and charging billing | Smart parking · billing | F1 | Analytically verified | SP-A07, SP-B16, SP-B17 | `src/lib/wireless-charging/smart-parking/billing.ts` |
| SP-MATH-011 | Communication performance | Smart parking · IoT | F1 | Tested | SP-B19, SP-B20 | `src/lib/wireless-charging/smart-parking/telemetry.ts · Broker` |
| SP-MATH-012 | Sensor reliability and uncertainty propagation | Smart parking · reliability | F1 | Analytically verified | SP-A11 | `src/lib/wireless-charging/smart-parking/reliability.ts` |
| SP-SIM-001 | Smart parking facility simulation | Smart parking · system | F2 | Tested | SP-B21, SP-B22, SP-B23 | `src/lib/wireless-charging/smart-parking/facility.ts · stepFacility` |
| SP-CTRL-001 | Parking session state machine | Smart parking · control | F1 | Tested | SP-B01, SP-B25, SP-B26 | `src/lib/wireless-charging/smart-parking/lifecycle.ts` |
| SP-CTRL-002 | Barrier controller and interlock | Smart parking · safety | F1 | Tested | SP-B07, SP-B09, SP-B24 | `src/lib/wireless-charging/smart-parking/barrier.ts` |
| SP-AI-001 | Vehicle identification (simulated recognition) | Smart parking · computer vision | F0 | Tested | SP-B02 | `src/lib/wireless-charging/smart-parking/identification.ts` |
| SP-AI-003 | Anomaly detection (rules and robust statistics) | Smart parking · data intelligence | F1 | Tested | SP-A12, SP-B06 | `src/lib/wireless-charging/smart-parking/facility.ts · anomalies; forecast.ts · robustZ` |
| SP-IOT-001 | MQTT communication model | Smart parking · IoT | F1 | Tested | SP-B08, SP-B19, SP-B20 | `src/lib/wireless-charging/smart-parking/telemetry.ts` |
| SP-INT-001 | Parking ↔ wireless charging session adapter | Smart parking · integration | F2 | Tested | SP-B11, SP-B12, SP-B13, SP-B14, SP-B15 | `src/lib/wireless-charging/smart-parking/charging.ts` |
| SP-RES-001 | Event-level research simulation | Smart parking · research | F1 | Tested | SP-A09 | `src/lib/wireless-charging/smart-parking/experiments.ts` |
| SP-RES-002 | Replicated research comparisons | Smart parking · research | F1 | Tested | SP-A13, SP-A09 | `src/lib/wireless-charging/smart-parking/research.ts` |

Each model's equations, SI inputs and outputs, assumptions, validity, numerical method, dependencies and limitations are in MODEL_REGISTRY.md. Validation status: none is experimentally validated — no measurements exist yet.
