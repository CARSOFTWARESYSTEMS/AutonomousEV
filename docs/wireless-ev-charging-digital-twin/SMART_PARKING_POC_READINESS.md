# Smart Parking — physical POC readiness report

**Status: not ready to procure.** The design is reviewed and corrected, and the budget fits the ceiling. Three steps must come before any purchase:

1. supplier quotations;
2. a hazard review by the EV.ENGINEER™ team;
3. the corrections below confirmed against real parts.

Nothing has been bought. Nothing physical has been measured.

Reviewed on 27 Nov 2026, against SMART_PARKING_POC_BOM.md (revised the same day) and SMART_PARKING_HARDWARE_PLAN.md.

## 1. Bill of materials review

| Check | Finding | Action taken |
|---|---|---|
| Quantities | Eight ESP32 boards for eight roles (3 bay-pair nodes, 2 gates, environment, actuators, wireless link) leave **no spare** | Two spares added (C1: 8 → 10) |
| Unit prices | Retail planning prices for hobby and educational parts in India, Nov 2026, **including GST**; not quotations | Kept; every line still needs two quotations |
| Procurement costs | **Shipping and courier were missing** | J1 added (₹2,500) |
| Transport | A 2.44 × 1.22 m board does not fit an ordinary car and has no protection | J2 added: two bolted 1.22 × 1.22 m modules with covers (§4) |
| Compatibility | HC-SR04 echo and WS2812B data are 5 V logic; the **ESP32 is 3.3 V and not 5 V tolerant** | Level shifters and dividers added to H2 |
| Compatibility | MQ-7 and MQ-2 need a 5 V heater (≈ 150 mA each), and MQ-7 needs a heater cycle for a meaningful CO reading | Kept as *prototype representations* only (stated in the BOM). Their readings are not life-safety measurements |
| Power | Pi 5 (up to 25 W) and two metal-gear servos (≈ 15 W each at stall) on a single 12 V 10 A supply leave little margin (§3) | Pi 5 on its own 27 W supply; dedicated 6 V 5 A servo buck (E5 revised) |
| Instrumentation | ACS712 bandwidth (≈ 80 kHz) **cannot measure coil current** at the wireless link's frequency | F6 re-described as DC-side only. Coil RMS current needs a current transformer and an oscilloscope (option, outside the ceiling) |
| Instrumentation | Efficiency of the LV link | Measured DC-in (INA226) to DC-out (INA226); coil and inverter losses not separated without an oscilloscope |
| Spares | Sensor spares: 2 of each bay sensor (B1, B2), plus a small lot (B9) | Adequate for a POC |
| Contingency | 10 % kept | ₹8,880 |
| **Total** | **₹97,680 including contingency**, ₹2,320 under the ₹1,00,000 ceiling | Tight. The savings in SMART_PARKING_POC_BOM.md §4 restore headroom if quotations come in higher |

The separate full-scale pilot estimate (₹1.1–2.3 crore, ±50 %) is unchanged. Its largest and least certain item is the commercial 11 kW wireless chargers. It is not a budget.

## 2. Scale verification (1:16)

| Quantity | Full size (twin) | 1:16 | Comment |
|---|---|---|---|
| Facility core, entry detector to exit clear-zone beam | 26.9 m | 1.68 m | Fits the 2.44 m board, with 0.38 m of approach road at each end |
| Depth, outer canopy edge to outer canopy edge | 18.6 m | 1.16 m | 1.22 m board: **only about 30 mm margin** in total. The rear hedges are omitted |
| Bay | 2.70 × 5.60 m | 169 × 350 mm | |
| Aisle | 6.0 m | 375 mm | |
| Reference sedan | 4.70 × 1.85 × 1.45 m | 294 × 116 × 91 mm | Choose RC chassis ≤ 125 mm wide: 1:16 models vary from 110 to 140 mm |
| Minimum turning radius | 4.3 m | 269 mm | **Typical 1:16 RC cars turn at 0.5–0.8 m, so they cannot reverse into the scaled bays.** Bay manoeuvres are placed by hand or along a guide; driven runs cover approach, entry and exit |
| Canopy height, aisle edge / rear | 3.62 / 3.00 m | 226 / 188 mm | |
| Ultrasonic sensor height | 2.9 m | 181 mm | 87 mm to a 1:16 car roof against 181 mm to the floor: well inside the HC-SR04's 20 mm minimum range |

**Geometric scaling is not electromagnetic similarity.** At 1:16 the 150 mm design gap becomes 9 mm, but the LV link is sized by its own components:
- about 80 mm coils;
- a 10–20 mm gap;
- ≤ 20 W;
- a frequency set by its capacitors.

Its coupling, quality factors and losses do not scale with the facility. Its measurements calibrate the twin's coupler model at the link's own geometry (WPT-EM-001 inputs), never the full-size design.

## 3. Power budget (12 V bus, worst case)

| Load | Typical | Peak |
|---|---|---|
| 10 ESP32 nodes (8 powered) | 4 W | 10 W |
| Two barrier servos (via the 6 V buck) | 2 W | 30 W (both stalled) |
| Bay indicators (WS2812B, ≈ 36 LEDs) and guidance matrix | 2 W | 8 W |
| Four fans | 0 W | 7 W |
| LED lighting | 3 W | 10 W |
| Sensors, three ESP32-CAMs | 6 W | 8 W |
| **12 V bus total** | **≈ 17 W** | **≈ 73 W** |

The certified 12 V 10 A (120 W) supply carries 61 % at peak. The Pi 5 and its camera run on the Pi's own 27 W supply. The wireless link runs only from the current-limited bench supply, never from this bus.

The LiFePO4 battery (12.8 V, 6 Ah, ≈ 77 Wh) runs the typical bus load for about 4.5 h, and the 20 W panel recovers a share of that in sun. The PV and storage demonstrate energy flows and metering; they are not sized for autonomy.

## 4. Modular, transportable design

- **Modules:** two 1.22 × 1.22 m modules, split at the aisle's mid-length.
  - Module A: entry gate and the four conventional bays (N01–N02, S01–S02).
  - Module B: exit gate, the two wireless bays (N03, S03) with the LV link, and the equipment enclosure (east end, as in the twin's layout).
- **Joining:** dowels for alignment and two bolts. One harness connector crosses the joint, carrying 12 V and ground only (data travels over Wi-Fi), labelled with its device ids.
- **Canopies:** lift off by thumb screws; sensors stay on the canopy and their cables plug in at the columns.
- **Transport:** each module fits a hatchback or SUV in a padded cover. The battery travels disconnected, in its fire-resistant bag.
- **Fabrication:** printed parts (gutters, trays, mounts, barrier housings) need roughly 25–35 h of printing. The MDF is cut by the supplier to the two module sizes.

## 5. Hardware acceptance criteria (before any experiment)

| Item | Criterion |
|---|---|
| Wiring | Every cable labelled; continuity and polarity checked against the wiring list; no exposed conductor |
| Protection | Each branch fused at ≤ 125 % of its peak load. The emergency stop removes power from every actuator and from the bench supply output within 0.5 s (tested 10 of 10) |
| Supplies | 12 V bus ripple < 200 mV peak-to-peak at full load. No supply above 24 V anywhere on the model |
| Sensors | Calibrated per SMART_PARKING_HARDWARE_PLAN.md §6, with records in the device registry |
| Barriers | Travel ≤ 2.5 s. Obstruction test: 10 of 10 refusals or reversals |
| Network | Device-identity and ACL refusals demonstrated (a wrong-topic publish is refused) |
| Twin | The gateway's telemetry replays in the twin's RECORDED mode with zero schema rejections over 1 h |
| LV link | Coil temperature sensors read within 2 °C of a reference thermometer before the first energisation |

## 6. Supervised low-voltage experimental procedures

These apply to every energised test. A named, qualified supervisor is present for every one.

1. **Pre-checks:**
   - bench supply set to ≤ 24 V and a current limit ≤ 1 A (raised only by the supervisor, never above 2 A);
   - emergency stop tested;
   - no metal objects, jewellery or tools near the pads;
   - the pad cover in place.
2. **First energisation:** no load, and no receiver within 200 mm. Record the input current and confirm the drive's own current limit trips as designed.
3. **Coupled operation:**
   - Place the receiver at the reference position (centred, 15 mm gap) and record DC input and output power, coil temperatures and the gap.
   - Sweep 3 gaps × 3 lateral offsets.
   - Each point runs ≤ 2 minutes, then a cool-down until the coil is within 5 °C of ambient.
4. **Stop conditions:** a coil above 60 °C, an unexpected sound, smell or smoke, or any person entering the marked area. Press the emergency stop, then turn the bench supply off.
5. **Records:** date, people present, set-up photograph, instrument ids and calibration dates, raw data files and deviations, signed by the supervisor.
6. **Twin comparison:** results enter the twin only as RECORDED data. Residuals against WPT-SIM-001 at the same geometry are reported with their uncertainty. Nothing is labelled validated outside the measured range.

## 7. Readiness verdict

| Area | Status |
|---|---|
| Design and BOM | Reviewed and corrected; within the ceiling, with small headroom |
| Quotations | Not obtained |
| Hazard review | Not held |
| Firmware | Planned (SMART_PARKING_IOT_ARCHITECTURE.md §8); not written |
| Twin integration path | Specified, telemetry only (SMART_PARKING_HARDWARE_INTEGRATION_SPEC.md) |
| Recommendation | Obtain quotations and hold the hazard review. Then build Module A first (entry gate and conventional bays) and commission it against §5 before building Module B (exit gate, wireless bays, LV link and enclosure) |
