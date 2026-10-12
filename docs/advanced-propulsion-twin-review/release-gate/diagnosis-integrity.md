# Diagnosis integrity: every tested condition

SIMULATED. Generated from `fault-coverage-matrix.json`, which `simulation/verification.test.ts` writes. One seeded run per row, 60 s after the condition is applied to a healthy engine at 100 % throttle. Times are seconds from injection. "Predicted" is the standing conclusion at the end of the run: the cause the twin declared, or none.

## Modelled faults (expected class is the fault injected)

| Expected class | Onset | Severity | Predicted class | Score | Confidence | Consistency check | Fitted severity | Detected, s | Isolated, s | Chain stages reached |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Oxidiser pump degradation | gradual | 30 % | Oxidiser pump degradation | 99 % | HIGH | explained | 0.31 | 2.75 | 4.35 | 8 of 8 |
| Oxidiser pump degradation | gradual | 60 % | Oxidiser pump degradation | 99 % | HIGH | explained | 0.6 | 2.75 | 4.35 | 8 of 8 |
| Oxidiser pump degradation | gradual | 100 % | Oxidiser pump degradation | 99 % | HIGH | explained | 1 | 2.75 | 4.35 | 8 of 8 |
| Oxidiser pump degradation | abrupt | 30 % | Oxidiser pump degradation | 99 % | HIGH | explained | 0.31 | 0.75 | 1.95 | 8 of 8 |
| Oxidiser pump degradation | abrupt | 60 % | Oxidiser pump degradation | 99 % | HIGH | explained | 0.6 | 0.55 | 1.55 | 8 of 8 |
| Oxidiser pump degradation | abrupt | 100 % | Oxidiser pump degradation | 99 % | HIGH | explained | 1 | 0.25 | 2.95 | 8 of 8 |
| Main fuel valve restriction | gradual | 30 % | Main fuel valve restriction | 100 % | HIGH | explained | 0.3 | 0.75 | 1.55 | 8 of 8 |
| Main fuel valve restriction | gradual | 60 % | Main fuel valve restriction | 100 % | HIGH | explained | 0.6 | 0.75 | 1.55 | 8 of 8 |
| Main fuel valve restriction | gradual | 100 % | Main fuel valve restriction | 100 % | HIGH | explained | 1 | 0.75 | 1.55 | 8 of 8 |
| Main fuel valve restriction | abrupt | 30 % | Main fuel valve restriction | 100 % | HIGH | explained | 0.3 | 0.35 | 1.45 | 8 of 8 |
| Main fuel valve restriction | abrupt | 60 % | Main fuel valve restriction | 100 % | HIGH | explained | 0.6 | 0.25 | 1.45 | 8 of 8 |
| Main fuel valve restriction | abrupt | 100 % | Main fuel valve restriction | 100 % | HIGH | explained | 1 | 0.25 | 3.95 | 8 of 8 |
| Cooling-channel restriction | gradual | 30 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.29 | 2.45 | 3.45 | 8 of 8 |
| Cooling-channel restriction | gradual | 60 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.6 | 2.45 | 3.45 | 8 of 8 |
| Cooling-channel restriction | gradual | 100 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.99 | 2.45 | 3.45 | 8 of 8 |
| Cooling-channel restriction | abrupt | 30 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.29 | 0.75 | 1.45 | 8 of 8 |
| Cooling-channel restriction | abrupt | 60 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.6 | 0.35 | 2.95 | 8 of 8 |
| Cooling-channel restriction | abrupt | 100 % | Cooling-channel restriction | 100 % | HIGH | explained | 0.99 | 0.35 | 3.95 | 8 of 8 |
| Oxidiser feed pressure reduction | gradual | 30 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 0.3 | 1.25 | 4.45 | 8 of 8 |
| Oxidiser feed pressure reduction | gradual | 60 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 0.6 | 1.25 | 4.45 | 8 of 8 |
| Oxidiser feed pressure reduction | gradual | 100 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 1 | 1.25 | 4.45 | 8 of 8 |
| Oxidiser feed pressure reduction | abrupt | 30 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 0.3 | 0.25 | 1.65 | 8 of 8 |
| Oxidiser feed pressure reduction | abrupt | 60 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 0.6 | 0.25 | 3.45 | 8 of 8 |
| Oxidiser feed pressure reduction | abrupt | 100 % | Oxidiser feed pressure reduction | 99 % | HIGH | explained | 1 | 0.25 | 4.45 | 8 of 8 |
| Oxidiser injector restriction | gradual | 30 % | Oxidiser injector restriction | 99 % | HIGH | explained | 0.3 | 1.65 | 2.45 | 8 of 8 |
| Oxidiser injector restriction | gradual | 60 % | Oxidiser injector restriction | 100 % | HIGH | explained | 0.6 | 1.65 | 2.45 | 8 of 8 |
| Oxidiser injector restriction | gradual | 100 % | Oxidiser injector restriction | 100 % | HIGH | explained | 1 | 1.65 | 2.45 | 8 of 8 |
| Oxidiser injector restriction | abrupt | 30 % | Oxidiser injector restriction | 99 % | HIGH | explained | 0.3 | 0.45 | 1.45 | 8 of 8 |
| Oxidiser injector restriction | abrupt | 60 % | Oxidiser injector restriction | 100 % | HIGH | explained | 0.6 | 0.35 | 1.45 | 8 of 8 |
| Oxidiser injector restriction | abrupt | 100 % | Oxidiser injector restriction | 100 % | HIGH | explained | 1 | 0.25 | 2.95 | 8 of 8 |
| Combustion performance loss | gradual | 30 % | Combustion performance loss | 95 % | HIGH | explained | 0.29 | 4.75 | 5.95 | 8 of 8 |
| Combustion performance loss | gradual | 60 % | Combustion performance loss | 100 % | HIGH | explained | 0.6 | 4.75 | 5.95 | 8 of 8 |
| Combustion performance loss | gradual | 100 % | Combustion performance loss | 100 % | HIGH | explained | 1 | 4.75 | 5.95 | 8 of 8 |
| Combustion performance loss | abrupt | 30 % | Combustion performance loss | 95 % | HIGH | explained | 0.29 | 1.35 | 2.45 | 8 of 8 |
| Combustion performance loss | abrupt | 60 % | Combustion performance loss | 100 % | HIGH | explained | 0.6 | 0.75 | 1.95 | 8 of 8 |
| Combustion performance loss | abrupt | 100 % | Combustion performance loss | 100 % | HIGH | explained | 1 | 0.45 | 2.45 | 8 of 8 |
| Chamber pressure sensor A drift | gradual | 30 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 0.29 | 2.45 | 2.95 | 7 of 8 |
| Chamber pressure sensor A drift | gradual | 60 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 0.6 | 2.45 | 2.95 | 7 of 8 |
| Chamber pressure sensor A drift | gradual | 100 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 1 | 2.45 | 2.95 | 7 of 8 |
| Chamber pressure sensor A drift | abrupt | 30 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 0.29 | 0.65 | 1.45 | 7 of 8 |
| Chamber pressure sensor A drift | abrupt | 60 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 0.6 | 0.45 | 1.45 | 7 of 8 |
| Chamber pressure sensor A drift | abrupt | 100 % | Chamber pressure sensor A drift | 100 % | HIGH | explained | 1 | 0.45 | 1.45 | 7 of 8 |
| Noisy pressure sensor | – | 30 % | Noisy pressure sensor | 62 % | MEDIUM | not applicable (direct data check) | – | – | 9.55 | 5 of 8 |
| Noisy pressure sensor | – | 60 % | Noisy pressure sensor | 90 % | HIGH | not applicable (direct data check) | – | – | 2.45 | 5 of 8 |
| Noisy pressure sensor | – | 100 % | Noisy pressure sensor | 90 % | HIGH | not applicable (direct data check) | – | – | 1.25 | 5 of 8 |
| Telemetry packet delay | – | 30 % | Telemetry packet delay | 80 % | MEDIUM | not applicable (direct data check) | – | 7.05 | 1.05 | 5 of 8 |
| Telemetry packet delay | – | 60 % | Telemetry packet delay | 95 % | HIGH | not applicable (direct data check) | – | 6.85 | 1.05 | 5 of 8 |
| Telemetry packet delay | – | 100 % | Telemetry packet delay | 95 % | HIGH | not applicable (direct data check) | – | 6.85 | 1.05 | 5 of 8 |
| Timestamp misalignment | – | 30 % | Timestamp misalignment | 87 % | HIGH | not applicable (direct data check) | – | 7.05 | 1.05 | 5 of 8 |
| Timestamp misalignment | – | 60 % | Timestamp misalignment | 95 % | HIGH | not applicable (direct data check) | – | 6.85 | 1.05 | 5 of 8 |
| Timestamp misalignment | – | 100 % | Timestamp misalignment | 95 % | HIGH | not applicable (direct data check) | – | 6.75 | 1.05 | 5 of 8 |
| Replayed telemetry | – | 30 % | Replayed telemetry | 97 % | HIGH | not applicable (direct data check) | – | 0.05 | 1.05 | 8 of 8 |
| Replayed telemetry | – | 60 % | Replayed telemetry | 97 % | HIGH | not applicable (direct data check) | – | 0.05 | 1.05 | 8 of 8 |
| Replayed telemetry | – | 100 % | Replayed telemetry | 97 % | HIGH | not applicable (direct data check) | – | 0.05 | 1.05 | 8 of 8 |

## Conditions the twin has no model of (expected: no known class)

| Condition applied | Expected | Predicted class | Nearest look-alike and its score | Confidence | Consistency check | Detected, s | Named a cause at any point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fuel pump head −15 % | unknown | none declared | Cooling-channel restriction, 57 % | LOW | unrecognised | 4.25 | no |
| fuel pump head −30 % | unknown | none declared | Combustion performance loss, 50 % | LOW | unrecognised | 2.65 | no |
| oxidiser main valve restriction ×1.6 | unknown | none declared | Oxidiser injector restriction, 87 % | LOW | unrecognised | 2.55 | no |
| fuel injector restriction ×2 | unknown | none declared | Cooling-channel restriction, 87 % | LOW | unrecognised | 7.55 | no |
| fuel tank pressure −2 | unknown | none declared | Combustion performance loss, 46 % | LOW | unrecognised | 4.05 | no |
| fuel line restriction ×3 | unknown | none declared | Cooling-channel restriction, 88 % | LOW | unrecognised | 6.95 | no |
| oxidiser feed line restriction ×4 | unknown | none declared | Oxidiser feed pressure reduction, 64 % | LOW | unrecognised | 1.25 | no |
| pump degradation + cooling restriction | unknown | none declared | Cooling-channel restriction, 54 % | LOW | unrecognised | 2.25 | no |
| valve restriction + combustion loss | unknown | none declared | Combustion performance loss, 59 % | LOW | unrecognised | 0.75 | briefly: Main fuel valve restriction |

## Detector latency, seconds from injection (– : did not fire in 60 s)

| Fault | Onset | Severity | Redline | Rate of change | Model residual | CUSUM | Multivariate | Learned (PCA) | Anomaly declared |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Oxidiser pump degradation | gradual | 30 % | – | – | 2.65 | 3.1 | 2.75 | – | 2.75 |
| Oxidiser pump degradation | gradual | 60 % | – | – | 2.65 | 3.1 | 2.75 | – | 2.75 |
| Oxidiser pump degradation | gradual | 100 % | 21.45 | – | 2.65 | 3.1 | 2.75 | 16.35 | 2.75 |
| Oxidiser pump degradation | abrupt | 30 % | – | – | 0.45 | 1.1 | 0.75 | – | 0.75 |
| Oxidiser pump degradation | abrupt | 60 % | – | 0.35 | 0.3 | 0.75 | 0.5 | – | 0.5 |
| Oxidiser pump degradation | abrupt | 100 % | 0.7 | 0.25 | 0.25 | 0.6 | 0.4 | 0.2 | 0.25 |
| Main fuel valve restriction | gradual | 30 % | – | – | 0.4 | 1.9 | 0.7 | – | 0.7 |
| Main fuel valve restriction | gradual | 60 % | – | – | 0.4 | 1.9 | 0.7 | 6.45 | 0.7 |
| Main fuel valve restriction | gradual | 100 % | – | – | 0.4 | 1.9 | 0.7 | 6.45 | 0.7 |
| Main fuel valve restriction | abrupt | 30 % | – | – | 0.2 | 0.7 | 0.3 | – | 0.3 |
| Main fuel valve restriction | abrupt | 60 % | – | – | 0.2 | 0.55 | 0.25 | 0.2 | 0.2 |
| Main fuel valve restriction | abrupt | 100 % | – | – | 0.2 | 0.45 | 0.2 | 0.2 | 0.2 |
| Cooling-channel restriction | gradual | 30 % | – | – | 2.95 | 2.15 | 2.45 | – | 2.45 |
| Cooling-channel restriction | gradual | 60 % | – | – | 2.95 | 2.15 | 2.45 | 14.95 | 2.45 |
| Cooling-channel restriction | gradual | 100 % | 19.95 | – | 2.95 | 2.15 | 2.45 | 14.85 | 2.45 |
| Cooling-channel restriction | abrupt | 30 % | – | – | 0.55 | 0.75 | 0.7 | – | 0.7 |
| Cooling-channel restriction | abrupt | 60 % | – | – | 0.35 | 0.6 | 0.5 | 0.3 | 0.35 |
| Cooling-channel restriction | abrupt | 100 % | 3 | 0.35 | 0.3 | 0.5 | 0.45 | 0.2 | 0.3 |
| Oxidiser feed pressure reduction | gradual | 30 % | – | – | 0.9 | 3.15 | 4 | 1.2 | 1.2 |
| Oxidiser feed pressure reduction | gradual | 60 % | 13.05 | – | 0.9 | 3.15 | 4 | 1.2 | 1.2 |
| Oxidiser feed pressure reduction | gradual | 100 % | 13.05 | – | 0.9 | 3.15 | 4 | 1.2 | 1.2 |
| Oxidiser feed pressure reduction | abrupt | 30 % | – | – | 0.2 | 0.95 | 0.8 | 0.2 | 0.2 |
| Oxidiser feed pressure reduction | abrupt | 60 % | 0.95 | 0.3 | 0.2 | 0.65 | 0.3 | 0.2 | 0.2 |
| Oxidiser feed pressure reduction | abrupt | 100 % | 0.3 | 0.2 | 0.2 | 0.4 | 0.25 | 0.2 | 0.2 |
| Oxidiser injector restriction | gradual | 30 % | – | – | 2.6 | 1.45 | 1.6 | – | 1.6 |
| Oxidiser injector restriction | gradual | 60 % | – | – | 2.6 | 1.45 | 1.6 | 11.25 | 1.6 |
| Oxidiser injector restriction | gradual | 100 % | 22.15 | – | 2.6 | 1.45 | 1.6 | 11.25 | 1.6 |
| Oxidiser injector restriction | abrupt | 30 % | – | – | 0.35 | 0.5 | 0.45 | – | 0.45 |
| Oxidiser injector restriction | abrupt | 60 % | – | 0.35 | 0.3 | 0.45 | 0.35 | 0.2 | 0.3 |
| Oxidiser injector restriction | abrupt | 100 % | 0.75 | 0.3 | 0.25 | 0.4 | 0.3 | 0.2 | 0.25 |
| Combustion performance loss | gradual | 30 % | – | – | 5.05 | 4.25 | 4.7 | – | 4.7 |
| Combustion performance loss | gradual | 60 % | – | – | 5.05 | 4.25 | 4.7 | 11.65 | 4.7 |
| Combustion performance loss | gradual | 100 % | 17.15 | – | 5.05 | 4.25 | 4.7 | 11.65 | 4.7 |
| Combustion performance loss | abrupt | 30 % | – | – | 1.1 | 1.55 | 1.35 | – | 1.35 |
| Combustion performance loss | abrupt | 60 % | – | 0.35 | 0.6 | 0.95 | 0.7 | 2.2 | 0.7 |
| Combustion performance loss | abrupt | 100 % | 1.15 | 0.3 | 0.45 | 0.7 | 0.5 | 0.25 | 0.45 |
| Chamber pressure sensor A drift | gradual | 30 % | – | – | 3.8 | 2.3 | 2.45 | – | 2.45 |
| Chamber pressure sensor A drift | gradual | 60 % | – | – | 3.8 | 2.3 | 2.45 | – | 2.45 |
| Chamber pressure sensor A drift | gradual | 100 % | – | – | 3.8 | 2.3 | 2.45 | 38.85 | 2.45 |
| Chamber pressure sensor A drift | abrupt | 30 % | – | – | 0.6 | 0.75 | 0.65 | – | 0.65 |
| Chamber pressure sensor A drift | abrupt | 60 % | – | – | 0.4 | 0.6 | 0.45 | – | 0.45 |
| Chamber pressure sensor A drift | abrupt | 100 % | – | 0.3 | 0.3 | 0.5 | 0.4 | 1.75 | 0.4 |

## A fault present before a restart

A fault at 80 % severity present before a restart. Health checks are held for five model shaft time constants after mainstage is reached; these are the seconds from the end of that hold.

| Fault | Hold, s | Detected after the hold, s | Isolated after the hold, s |
| --- | --- | --- | --- |
| Oxidiser pump degradation | 2.75 | 0.15 | 1.1 |
| Main fuel valve restriction | 2.75 | 0.15 | 1.1 |
| Cooling-channel restriction | 2.75 | 0.15 | 1.1 |
| Oxidiser feed pressure reduction | 2.75 | 0.15 | 1.1 |
| Oxidiser injector restriction | 2.75 | 0.15 | 1.1 |
| Combustion performance loss | 2.75 | 0.15 | 1.1 |
| Chamber pressure sensor A drift | 2.75 | 0.2 | 1.1 |
