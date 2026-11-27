# Smart Parking — hardware, installation and commissioning plan

**Status: Designed. No hardware exists, and the physical programme has not started.**

This plan has two subjects:

- the **full-size reference shelter** that the twin depicts. Its dimensions are representative and come from no structural design.
- the **six-bay miniature POC** (SMART_PARKING_POC_BOM.md).

Structural, electrical and life-safety design of any full-size shelter needs qualified, licensed engineers. Nothing here replaces that.

## 1. Shelter engineering (SP-R01, SP-R02, SP-S01)

These are the representative drawings the twin's Shelter view shows, including the cutaway and dimension labels:

```text
 SECTION THROUGH ONE ROW (full size, representative)          PLAN (12 bays)

        aisle side                    rear                      W ◄──────────── 25.4 m aisle ────────────► E
   3.62 m ┌────────── 5° fall ───────────┐ 3.00 m          entry ║ N01 N02 N03 N04 N05 N06 ║ exit
          │◄ 1.2 m ►│◄──── 5.6 m bay ────►│◄0.7►│  gutter      gate  ║ ─ ─ ─ 6.0 m aisle ─ ─ ─ ║ gate
          │         │   ultrasonic 2.9 m  │     │              ║ S01 S02 S03 S04 S05 S06 ║
          │         │        ▼            │     ║ column       accessible bay at the west end (pedestrian exit);
   ───────┴─────────┴─────────────────────┴─────╨──            wireless bays at the east end (power cabinet)
      aisle edge (3.0 m from centreline)     bay end
```

| Element | Representative design | Basis in the twin |
|---|---|---|
| Framework | One mono-pitch cantilevered canopy per row. Rear columns stand every two bays, carrying tapered cantilever beams and purlins, on pad foundations | `Shelter.tsx`; components `sp-structure`, `sp-roof` |
| Roof slope | Falls 0.62 m from 3.62 m at the aisle side to 3.00 m at the rear, about 5°, toward the rear gutter | `FRONT_H`, `FALL` |
| Overhangs | 1.2 m over the aisle edge and 0.7 m beyond the bay ends, for sun and rain protection of the bays and the driver's door | `layout.canopy` |
| Drainage | Rear box gutter with downpipes inside the columns to a soakaway | `sp-gutter` |
| Bay dimensions | 2.7 m × 5.6 m; aisle 6.0 m; minimum turning radius 4.3 m | `DEFAULT_LAYOUT`, `TURN_RADIUS` |
| Sun and dust | Roof, overhangs and the PV deck; the thermal model takes solar gain on the roof area (260 m² default) | SP-MATH-007 |
| Equipment mounting | Ultrasonic sensor 2.9 m above each bay centre on a bracket from the purlins. IR sensor at the bay head, 1.6 m in from the bay end and 0.5 m high. Row camera on each canopy front. ANPR camera on a pole 4 m before each stop line | `SENSOR_HEIGHT`, components |
| Cable routing | Perforated tray along the beam line, drops in conduit down the columns, ducts under the bays to the wireless pads. Power and data are segregated | `sp-cable-tray` |
| Equipment enclosure | Ventilated, lockable, front-access cabinets at the east end of the north canopy, holding the gateway, network, distribution, storage and power electronics | `sp-equipment-enclosure` |
| Ventilation | Four axial jet fans under the canopies on a variable-speed controller (180 W each, power ∝ duty³) | `sp-fan` |
| Lighting | 24 linear LED luminaires to 150 lx, linked to daylight and activity, with 30 % standby at night | `sp-light` |
| PV | 180 m² of canopy modules (21 % efficiency, 0.86 derating, NOCT 45 °C), about 35 kWp | `DEFAULT_ENERGY` |
| Maintenance access | Front access to every cabinet; sensors reachable from a platform in the aisle; pads serviceable from the bay surface | — |

At 1:16 the miniature keeps the same plan, slope, overhangs and mounting positions. Its members are not structurally scaled.

## 2. Device placement (POC and full size)

| Device | Placement | Per |
|---|---|---|
| Ultrasonic node `US-<bay>` | Above the bay centre, looking down | Bay |
| Infrared node `IR-<bay>` | Bay head wall, facing the bay | Bay |
| Row camera `CAM-N` / `CAM-S` | Canopy front, looking down the row | Row |
| Presence detectors | One before each barrier (stop line), one 1.6 m after it (clear zone) | Gate |
| ANPR `ANPR-IN` / `ANPR-OUT` | Pole 4 m before the stop line, at plate height | Gate |
| Reader `READER-IN` | Driver-side pedestal at the entry stop line | Entry |
| Barrier controller `GATE-IN` / `GATE-OUT` | In the barrier housing, with end stops and an absolute angle sensor | Gate |
| Environmental node `ENV-N` / `ENV-S` | Under each canopy, in a radiation shield, above head height | Row |
| Fan and light controllers | Equipment enclosure | Site |
| Guidance display `LED-ENTRY` and bay indicators | Entry sign before the barrier; an indicator over each bay | Site, bay |
| Meters `METER-MAIN`, `PV-INV`, `BESS-01`, `WPT-<bay>` | Distribution cabinet | Circuit |
| Edge gateway `EDGE-01` | Equipment enclosure, on a UPS | Site |

## 3. Installation and commissioning workflow (SP-S02)

1. **Site survey.** Record:
   - dimensions, levels and drainage;
   - sun path and shading;
   - Wi-Fi coverage at every planned node position;
   - the electrical supply and earthing;
   - vehicle swept paths for the test vehicles;
   - hazards.

   Output: survey report and a marked-up layout.
2. **Layout freeze.** Fix the bay numbering (`N01…`, `S01…`), gate positions and device positions in a layout file the twin can load. The twin's `buildLayout` inputs are the record.
3. **Mechanical installation.** Install the structure, mounts, cable trays and enclosure. Inspect dimensions against the layout, within ±5 mm on the miniature.
4. **Electrical installation.** Install the extra-low-voltage bus, fused branches, emergency stop and earthing of metal parts. Check the emergency stop removes power from every actuator and from the wireless link.
5. **Network.** Configure the device VLAN or SSID, gateway addressing, NTP and broker. Confirm that no inbound path from the internet exists.
6. **Device provisioning.** For each device:
   - flash the signed firmware;
   - generate its key pair and certificate;
   - register the device id, kind, location, firmware version and certificate fingerprint in the gateway's device registry;
   - fit its label (§4).
7. **Device-to-twin mapping.** Bind each device id to its twin entity: bay, gate, row or meter (§4). Check that the twin's IoT view shows the device in the right place. During commissioning it is labelled *commissioning*, never LIVE.
8. **Calibration.** Calibrate every sensor against a reference (§6) and record the result in the registry.
9. **Functional tests.** Run each lifecycle stage with test vehicles:
   - detection;
   - identification with a plate, an RFID tag and a QR code;
   - allocation;
   - entry with a barrier interlock test;
   - occupancy confirmation;
   - charging eligibility and the low-voltage link;
   - departure;
   - billing.
10. **Fault tests.** Inject the twin's faults physically and compare the response with the twin's:
    - sensor unplugged;
    - camera covered;
    - gateway powered off;
    - network cable pulled;
    - obstruction under the barrier;
    - smoke-sensor test aerosol (in a ventilated space, following the sensor's instructions).
11. **Acceptance.** Run the deployment validation plan (SMART_PARKING_TEST_PLAN.md §6). Results go into the validation report, and only then may the twin label that POC's telemetry LIVE.
12. **Handover.** Deliver the operator training, the maintenance schedule (§7) and the as-built record.

## 4. Device identification scheme and device-to-twin mapping

```text
<KIND>-<LOCATION>            e.g.  US-N03, IR-S01, CAM-N, ANPR-IN, GATE-OUT, WPT-N06, ENV-S, EDGE-01
site id: EVE-<REGION>-<TYPE>-<NN>    e.g.  EVE-IN-POC-01
topic:   evengineer/v1/sites/{siteId}/devices/{deviceId}/…
```

- Device ids are the same in the twin, the firmware, the broker ACL, the cable labels and the asset register. They are never derived from a hardware MAC address.
- The registry row is `deviceId → kind, twin entity (bay/gate/row/circuit), position (x, y, z in the layout frame), firmware, certificate fingerprint, calibration (date, reference, offset, scale), status`.
- Replacing a device keeps its id and issues a new certificate. The old certificate is revoked at the broker.

## 5. Wiring, power and network

- **Power (miniature):**
  - A certified mains adapter supplies a 12 V bus, protected by a main fuse and the emergency stop.
  - Each branch is fused: nodes at 5 V through buck converters, actuators at 12 V, and the wireless link from the current-limited bench supply.
  - PV and storage feed the 12 V bus through the charge controller.
  - INA226-class monitors on the supply, PV, storage and link feed the twin's energy ledger.
- **Power (full size):**
  - The distribution cabinet has a main switch, RCD-protected final circuits, main and sub-meters, and surge protection.
  - The chargers get dedicated circuits.
  - All of it is designed and installed by a licensed electrical contractor.
- **Data:**
  - Bay nodes connect over Wi-Fi on the device network.
  - Cameras connect by PoE or USB to the gateway.
  - Gate, fan and light controllers are wired where practical.
  - The device VLAN is separated from the management network.
  - Topology diagram: SMART_PARKING_IOT_ARCHITECTURE.md §9.
- **Labelling:** both ends of every cable carry the device id and the circuit or port.

## 6. Commissioning checklists and calibration

| Item | Check | Reference | Acceptance |
|---|---|---|---|
| Ultrasonic node | Empty-bay distance; distance to a vehicle roof at 3 positions | Tape measure | Within ±1.5 cm plus 1 % of range (the twin's declared 1σ) |
| IR node | Detects each test vehicle; no detection with the bay empty under strong light | Visual | 20 of 20 detections; 0 false alarms in 10 min |
| Row camera | Every bay of its row classified for 20 empty/occupied changes | Person reviewing the frames | 20 of 20 |
| Presence and clear-zone beams | Interrupt and restore | Visual | Every edge reported once (idempotent) |
| Barrier | Full travel time; stops at both ends; refuses to close and reverses with an obstruction | Stopwatch, obstruction test object | ≤ 2.5 s travel; 10 of 10 obstruction tests safe |
| ANPR camera | Reads the synthetic plates of the test vehicles | Plate list | Recorded, not accepted against a target until the evaluation in SMART_PARKING_AI_MODELS.md §7 |
| RFID and QR | Each registered tag and code; an unregistered one is refused | Registry | All correct |
| Environmental node | Temperature and humidity against a reference thermometer and hygrometer; CO and gas sensors' zero in clean air | Reference instrument | ±0.5 °C, ±5 % RH; stable zero |
| Meters | Current and voltage against a multimeter at two loads | Multimeter | ±2 % |
| Wireless link | Input and output power at three gaps and offsets; coil temperature after 30 min | Multimeter, NTC | Recorded for model-versus-measurement residuals (no target assumed) |
| Clocks | Device time against the gateway | NTP | Offset < 100 ms |
| Messages | Topic, schema, sequence, ACL refusal of a wrong topic | Broker log | All pass |

## 7. Maintenance

| Interval | Task |
|---|---|
| Weekly (POC) | Inspect cabling and mounts; clean camera windows and the PV panel; review the anomaly log |
| Monthly | Recheck calibration of one sensor per kind; test the emergency stop and the barrier obstruction interlock; review device certificates and firmware versions |
| Quarterly | Full calibration (§6); battery health check; restore test of the gateway backup |
| On replacement | Same device id and a new certificate; recalibrate; record in the registry |

## 8. Safety plan

- **Extra-low voltage only.** The POC runs at extra-low voltage (≤ 24 V DC) from certified adapters. The team builds no mains wiring.
- **Emergency stop.** It removes power from every actuator and from the wireless link.
- **Wireless link limits:**
  - fed only from a current-limited bench supply;
  - ≤ 20 W;
  - coil temperature monitored, with the drive shut down above a declared limit;
  - nobody's hands, and no metal objects, in the gap while it is energised;
  - a pad cover marks the energised area.
- **Barrier interlock.** It is local to the barrier controller and never depends on the network or the twin.
- **LiFePO4 battery.** It has a BMS, a fuse, a fire-resistant bag and no unattended charging.
- **Smoke, gas and CO modules.** These are prototype representations, not life-safety devices. Tests use the manufacturer's test method in a ventilated space; no open flame and no flammable gas.
- **Remote access.** It is read-only. The public twin exposes no command to any physical actuator.
- **Before anything is energised:** a hazard review by the EV.ENGINEER™ team, with a responsible person named for each test.

## 9. Full-scale pilot requirements (SP-C01; separate from the POC)

1. A structural design with calculations for dead, wind, seismic and maintenance loads, signed off by a qualified structural engineer, plus the local building permits.
2. An electrical design to the local wiring regulations, by a licensed contractor:
   - earthing and lightning protection;
   - RCD and surge protection;
   - metering;
   - grid connection approval.
3. Certified wireless EV chargers, with their own certification for the deployment market, installed and commissioned by the supplier. The twin only reads their authorised telemetry.
4. Certified life-safety systems: smoke and gas detection, alarms and ventilation designed to the applicable fire code, replacing the POC's modules.
5. A hazard analysis (for example HAZOP or FMEA) covering vehicles, pedestrians, barriers, charging, fire and loss of communications.
6. Payment through an approved provider integration, with no card or UPI credentials handled by the facility software.
7. Data-protection compliance for plate and image data in the deployment jurisdiction (SMART_PARKING_SECURITY_AND_PRIVACY.md).
8. Accessibility of the accessible bay, walkways and interfaces to the local standard.
9. Its own estimate (SMART_PARKING_POC_BOM.md §5), approvals and programme.

## 10. Operating modes: software-in-the-loop and hardware-in-the-loop (SP-P03)

| Mode | What is real | What is simulated | Data mode | Available now |
|---|---|---|---|---|
| Simulation (SIL) | The control software (session engine, allocation, fusion, gateway ingestion) | Every sensor, actuator and vehicle | SIMULATED | Yes |
| Recorded replay | A captured telemetry log | Nothing acts: replay never drives an actuator | RECORDED | Yes |
| Physical sensors, simulated vehicles (HIL) | Bay sensors on the bench | Vehicles, moved as targets to match the simulation | LIVE (sensors only) | No, blocked |
| Physical controllers, simulated infrastructure (HIL) | ESP32 and gateway firmware | Sensors and actuators | LIVE (controllers) | No, blocked |
| Connected POC | The six-bay miniature | — | LIVE, read-only remotely | No, blocked |
| Authorised charging telemetry | The low-voltage link | — | LIVE, read-only | No, blocked |

Each mode is named in the Engineer inputs, and the hardware modes are shown as blocked. Simulated and physical sources implement the same adapter interfaces (`adapters.ts`), so they share one data contract and one data-mode label. The display can never show a simulated value as a physical one.
