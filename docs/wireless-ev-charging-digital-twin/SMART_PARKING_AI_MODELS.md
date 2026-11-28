# Smart Parking — AI and data-intelligence models

**No trained model runs in this web application, and no AI performance is claimed.** Recognition is simulated by a declared error model; occupancy fusion, forecasting and anomaly detection are deterministic, rule-based or statistical methods, labelled as such in the interface. The numbers below are properties of those declared models, computed by the seeded studies in `experiments.ts`, and are to be replaced by evaluations on labelled data from the POC.

## 1. Vehicle identification — SP-AI-001 (`identification.ts`)

### Pipeline (simulated)

| Stage | Declared latency (edge computer) |
|---|---|
| Camera frame | 80 ms |
| Pre-processing (exposure, de-skew) | 50 ms |
| Vehicle detection | 320 ms |
| Plate region detection | 180 ms |
| Character recognition (OCR) | 360 ms |
| Regional format validation | 10 ms |
| Confidence estimation | 10 ms |
| Authorisation lookup (local database) | 60 ms |
| **Total** | **1.07 s** (plus 0.45 s round trip in the cloud placement) |

No image is captured or processed. Each stage is represented by its latency and by the error model below.

### Error model (declared assumptions)

- **Correct-read probability in good light with a clean plate:** 0.97.
- **Multiplicative factors:** low light below 80 lx gives × 0.92, and below 20 lx × 0.82; rain on the lens × 0.95; a partly obstructed plate × 0.45.
- **Confidence for correct reads:** 0.86 + 0.13·√u, minus up to 0.12 when the plate is obstructed.
- **Confidence for wrong reads:** 0.45 + 0.42·u.

The two confidence distributions overlap, so a threshold trades false accepts against fallbacks.

- **Format validation:** a read that fails the regional plate format has its confidence capped at 0.5.
- **Covered plate:** a plate largely covered by mud (the tour vehicle) always gives a low-confidence read, between 0.62 and 0.82.
- **Thresholds:** reads at or above the accept threshold (default 0.90) are *recognised*; between 0.60 and 0.90 *low confidence*; below 0.60 *unrecognised*.

### Access decision

An uncertain plate is never authorised on its own (SP-B02). Below the accept threshold the driver presents an RFID tag or a reservation QR code at the reader; failing that, an operator verifies, or a visitor ticket is issued if the site allows visitors. A wrong read can grant access only if it happens to match the access list, which is why the threshold is high.

### Threshold study (`recognitionStudy`, 3,000 synthetic vehicles per cell, seed 13)

The shares are of all vehicles in each condition:

- **Auto** — recognised correctly.
- **False accept** — recognised with the wrong characters.
- **Fallback** — sent to RFID, QR or the operator.

| Condition | Threshold 0.80: auto / false accept / fallback | 0.90 | 0.95 |
|---|---|---|---|
| Daylight, clean plate | 97.2 % / 0 / 2.8 % | 89.0 % / 0 / 11.0 % | 51.3 % / 0 / 48.7 % |
| Night (lit), clean plate | 88.5 % / 0.03 % / 11.5 % | 80.8 % / 0 / 19.2 % | 46.7 % / 0 / 53.3 % |
| Rain, daylight | 92.2 % / 0.07 % / 7.7 % | 84.1 % / 0 / 15.9 % | 48.1 % / 0 / 51.9 % |
| Partly obstructed plate | 41.5 % / 0.2 % / 58.3 % | 17.4 % / 0 / 82.6 % | 4.0 % / 0 / 96.0 % |

Under these assumptions, 0.90 removes false accepts at the cost of more fallbacks. That is why it is the default, and why the RFID/QR fallback is a requirement rather than an option.

These are consequences of the declared model, not measured accuracy. The physical programme's target, at least 95 % on a declared test set, is to be measured on labelled POC images (SMART_PARKING_TEST_PLAN.md §4).

### Regional formats

Synthetic plates follow each region's format and are chosen so that none can be a real issued plate:

- **IN:** state series, using the unissued state code ZZ, for example `ZZ 07 EV 4821`; BH series also validates.
- **US:** 5–7 alphanumerics starting with 0, for example `0EVT 482`.
- **CN:** the test character 测 in place of a province, for example `测A·D4821`.

`validPlate` checks format only. Nothing is checked against a real registry.

## 2. Occupancy fusion — SP-MATH-003 (`occupancy.ts`)

- **Sensors per bay:**
  - an ultrasonic ranger, which measures the echo distance to the vehicle roof;
  - an infrared reflective sensor at the bay head, whose false-alarm rate rises with sunlight;
  - a row camera, whose detection falls with low light.
- **Node debounce:** each node must see 3 consecutive agreeing samples, taken at 2 Hz, before it changes state.
- **Fusion:** the default is Bayesian log-odds, with prior 0.5 and hysteresis between an entry level of 0.95 and an exit level of 0.05. Readings older than 12 s are excluded.
  - **Alternative strategies:** majority vote, fixed priority (camera, then ultrasonic, then infrared) and ultrasonic only.
- **Disagreement (strict policy):** when the sensors disagree, the bay becomes *uncertain*. An uncertain bay is shown with its own symbol and is never assigned (SP-B06). The disagreement is listed as an operator anomaly at once. After 8 s of uncertainty the bay's status becomes *unknown*, and a session waiting to confirm that bay moves to `occupancy-disagreement`.

### Fusion study (`evaluateFusion`, 3 h, seed 5)

| Scenario | Strategy | Accuracy of decided samples | Uncertain share | False occupied | False vacant |
|---|---|---|---|---|---|
| All sensors healthy | any of the four | 100 % | 0 % | 0 | 0 |
| Infrared stuck *occupied* | Bayes, majority, priority | 100 % | 33.9 % | 0 | 0 |
| Infrared stuck *occupied* | ultrasonic only | 100 % | 0 % | 0 | 0 |

With a stuck sensor, the strict policy turns every sample in which that sensor disagrees into *uncertain* rather than into a wrong decision. That costs availability: about a third of the time the bay cannot be offered.

Ultrasonic-only is unaffected here only because the faulty sensor is the one it ignores. It has no redundancy against its own faults, which `reliability.ts` (SP-MATH-012) quantifies as k-out-of-n availability.

## 3. Demand forecasting — SP-MATH-006 (`forecast.ts`)

Three deterministic baselines come before any learned model:

- **Seasonal naive:** the same hour on the most recent day of the same type (weekday or weekend).
- **Moving average:** the mean of the same hour over the last 4 days of the same type.
- **Exponential smoothing:** an exponentially smoothed hourly profile per day type, with α = 0.3.

They are evaluated on held-out days of a 28-day synthetic history generated by the facility's own arrival and stay models. The evaluation uses 12 bays, the last 7 days held out, and seed 20261127.

| Method | MAE (bays) | RMSE (bays) | MAE as % of the mean |
|---|---|---|---|
| Seasonal naive | 1.83 | 2.53 | 15.3 % |
| Moving average | 1.34 | 1.82 | 11.2 % |
| Exponential smoothing | 1.32 | 1.80 | 11.0 % |

The history is synthetic and generated by the same assumptions the forecasts exploit, so these errors are optimistic. A machine-learning forecaster is planned only once real occupancy data exists, and it must beat these baselines on the same held-out protocol.

## 4. Anomaly detection — SP-AI-003

Rules and robust statistics, labelled as such:

| Anomaly | Method | Trigger |
|---|---|---|
| Sensor disagreement | rule | The fused bay has disagreeing sensors |
| Unexpected occupancy | rule | The bay reads occupied with no session |
| Missing occupancy | rule | A parked session's bay reads vacant |
| Device malfunction | rule | Ultrasonic raw value constant for more than 20 samples |
| Unusual duration | robust statistics | Stay more than 3.5 robust deviations above the median of completed stays: z = (x − median) / (1.4826·MAD), from 8 stays |
| Stale data | rule | No message for 3 periods while the device is still connected |
| Message pattern | rule | No message for 3 periods and the device is offline (last will) |

An anomaly disappears 20 s after its condition clears. Check SP-A12 verifies the robust statistic. On a normal sample the scaled MAD estimates σ to within 5 %. A value 6σ away scores |z| > 5, and a 1σ value scores below 1.5.

An *energy-consumption* anomaly is defined in the catalogue but the facility does not raise it yet.

## 5. What is not here

- No neural network, detector, OCR engine or forecaster is trained or run.
- No real images, plates or people are used.
- No accuracy, precision or recall figure is claimed for any physical system.

## 6. Deployment placement (SP-S03)

| Placement | Recognition | Analytics | Safety-critical control |
|---|---|---|---|
| Edge (default) | Gateway | Gateway | Local controllers |
| Hybrid | Gateway | Cloud | Local controllers |
| Cloud | Cloud (adds 0.45 s per read) | Cloud | Local controllers |

In every placement, barrier interlocks, the alarm controller and the Station's protection never wait for the network (SP-B09).

## 7. Evaluation plan for the POC

| Model | Dataset | Metric | Acceptance (declared before testing) |
|---|---|---|---|
| Plate recognition | Labelled images of synthetic plates on the miniature vehicles, across light, rain-spray and obstruction conditions; train, validation and test split by session, never by frame | Character accuracy, plate accuracy, false-accept rate at the operating threshold, latency on the edge device | At least 95 % plate accuracy; false-accept rate at or below 0.1 % at the chosen threshold, with a 95 % Wilson interval |
| Occupancy fusion | Logged sensor streams with ground truth from an overhead reference camera reviewed by a person | Accuracy, uncertain share, false vacant and false occupied, time to confirm | At least 98 % accuracy of decided states; zero false vacant at the allocation boundary |
| Forecast | At least 4 weeks of POC occupancy | MAE and RMSE on held-out weeks against the three baselines | A learned model is adopted only if it beats the best baseline on held-out data |
| Anomaly detection | Injected faults (stuck, disconnected and noisy sensors; message loss) | Detection rate, false alarms per day, time to detect | Declared per fault class before the test |

Dataset provenance, labelling procedure, licence and retention are recorded with every dataset. No dataset contains a real person's plate or face.

## 8. What each "intelligent" component actually is (review, 27 Nov 2026)

| Component | Model | Kind | Learned from data? |
|---|---|---|---|
| Vehicle identification | SP-AI-001 | **Simulated recognition**: a declared error model with stage latencies; no image is processed | No |
| Access decision | SP-AI-001 (`decideAccess`) | **Deterministic rules** | No |
| Occupancy fusion | SP-MATH-003 | **Statistical method**: Bayesian log-odds with declared sensor rates, debounce and hysteresis | No (declared rates) |
| Slot allocation (multi-objective) | SP-MATH-004 | **Mathematical optimisation**: minimum of a normalised weighted cost under hard constraints | No |
| Research policies (charging-compatible, SOC-aware) | SP-RES-002 | **Deterministic rules** | No |
| Energy-aware charging | SP-RES-002, SP-MATH-009 | **Mathematical optimisation (heuristic)**: least-laxity scheduling under an import budget | No |
| Demand forecast | SP-MATH-006 | **Statistical baselines**: seasonal naive, moving average, exponential smoothing | Fitted to synthetic history only |
| Anomaly detection | SP-AI-003 | **Deterministic rules plus robust statistics** (median and MAD) | No |
| Sensor reliability | SP-MATH-012 | **Statistical method**: k-out-of-n availability, uncertainty propagation | No |
| **Actual machine-learning models** | — | **None** | — |

The interface uses the same distinctions:

- the recognition stage is titled *AI vehicle recognition (simulated)*;
- the pipeline panel shows SIMULATED;
- the forecast stage says *no machine-learning forecast is claimed*;
- anomalies carry their method (*rule* or *robust statistics*).

No accuracy figure in this repository describes a trained model.

## 9. Future AI development roadmap

Each step starts only when its data exists, and each must beat its deterministic baseline on held-out data before it is shown. Safety interlocks stay independent of every one.

| Area | Step 1: data | Step 2: candidate models | Acceptance gate (declared before training) | Where it may act |
|---|---|---|---|---|
| Vehicle identification | Labelled POC images of synthetic plates across light, rain-spray and obstruction, split by session; dataset card with provenance | A small detector and OCR running at the edge (quantised), compared with the simulated error model's assumptions | Plate accuracy ≥ 95 % and false accepts ≤ 0.1 % at the operating threshold, with Wilson intervals; edge latency measured | Proposes an identity; the access rule and fallbacks decide |
| Occupancy estimation | Synchronised sensor streams with person-reviewed ground truth (≥ 200 events per bay type) | Learned fusion weights or a small classifier over the three sensors, against Bayesian fusion | Better decided-state accuracy at an equal or lower uncertain share; zero false *vacant* at allocation | Bay state; an uncertain bay is still never assigned |
| Demand forecasting | ≥ 4 weeks of POC occupancy and arrivals | Gradient-boosted or small sequence models with calendar features | Lower MAE than the best baseline on held-out weeks, with confidence intervals | Operator information and reservations; never access control |
| Allocation optimisation | Replicated simulation studies (SP-RES-002), then POC logs | Optimisation with learned demand inputs, or reinforcement learning trained in simulation | Beats the charging-compatible and energy-aware rules on paired seeds across all six scenarios, with no fairness loss | Proposes a bay; hard constraints and atomic reservation decide |
| Anomaly detection | POC logs with injected, labelled faults | Unsupervised models (isolation forest, autoencoder) against the rules | Higher detection at no more false alarms per day than the rules | Operator alerts only |

Every model will get a registry entry (SP-AI-…) with its dataset card, version, evaluation report and limitations before it ships.
