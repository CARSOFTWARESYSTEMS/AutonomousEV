# Smart Parking — POC bill of materials

**Status: Designed. Nothing has been procured.** The amounts are planning ceilings in Indian rupees, including GST, based on typical retail prices for hobby and educational electronics in India in November 2026. They are not quotations. Before anything is purchased:

- each line needs at least two current quotations;
- the purchase needs the EV.ENGINEER™ team's approval.

The total, including contingency, must stay within **₹1,00,000**. Any change that would exceed it needs prior authorisation.

## 1. What the POC is

A six-bay miniature of the facility. At full size the 6-bay layout measures about 28 m × 19 m, gates and canopy included; at about 1:16 scale it fits one 2.44 m × 1.22 m board:

- **Bays:** four conventional and two wireless demonstration bays, the twin's 6-bay preset (`POC_LAYOUT`);
- **Gates:** an entry and an exit gate with barriers;
- **Devices:** per-bay sensors, ESP32 nodes and an edge gateway;
- **Energy:** a small PV and storage system;
- **Wireless charging:** one isolated low-voltage wireless charging link (SP-P02).

It has the same logical architecture, device identifiers and MQTT schema as the twin, so the gateway software and the twin's recorded-replay mode can be used unchanged.

Every circuit in the POC is extra-low voltage (≤ 24 V DC), supplied from certified mains adapters. No mains wiring is built by the team.

## 2. Bill of materials

| # | Item | Qty | Unit (₹) | Line (₹) | Notes and alternatives |
|---|---|---|---|---|---|
| **A** | **Structure** | | | **10,000** | |
| A1 | Aluminium 10 mm square tube and angle for columns and beams, with fasteners | 1 lot | 3,500 | 3,500 | Alternative: 3D-printed columns (≈ ₹1,000), less rigid |
| A2 | Base board (MDF 2.44 × 1.22 m), bay markings, polycarbonate roof sheet | 1 lot | 4,000 | 4,000 | Roof slope and overhang as the twin's shelter |
| A3 | 3D-printed gutters, cable trays, sensor and camera mounts, barrier housings (filament) | 1 lot | 2,500 | 2,500 | Printed in-house |
| **B** | **Sensing** | | | **11,000** | |
| B1 | Ultrasonic rangers (HC-SR04 class), 6 bays + 2 spares | 8 | 90 | 720 | JSN-SR04T weatherproof ≈ ₹450 each if used outdoors |
| B2 | Infrared reflective sensors, 6 bays + 2 spares | 8 | 250 | 2,000 | TCRT5000 class ≈ ₹40 each at miniature range |
| B3 | IR beam-break pairs: stop lines and clear zones | 4 | 250 | 1,000 | Inductive loops are not practical at this scale |
| B4 | Camera module for the entry ANPR (Raspberry Pi camera class) | 1 | 2,800 | 2,800 | Also reads QR codes |
| B5 | ESP32-CAM boards: exit ANPR and the two row cameras | 3 | 650 | 1,950 | Row cameras run occupancy analytics on the gateway |
| B6 | RFID reader (13.56 MHz, RC522 class) with tags | 1 | 400 | 400 | |
| B7 | Temperature and humidity sensors (SHT3x / BME280 class) | 2 | 500 | 1,000 | |
| B8 | CO and gas/smoke sensor modules (MQ-7, MQ-2 class), prototype representation only | 2 | 300 | 600 | Not life-safety devices |
| B9 | Spares and breakout boards | 1 lot | 530 | 530 | |
| **C** | **Controllers, edge and network** | | | **19,000** | |
| C1 | ESP32 development boards (bays, gates, environment, actuators, wireless link) | 8 | 450 | 3,600 | |
| C2 | Edge gateway: Raspberry Pi 5 (8 GB) with power supply, cooler and 128 GB storage | 1 | 12,900 | 12,900 | A Pi 4 (≈ ₹7,000 all in) runs everything but recognition is slower |
| C3 | Wi-Fi router with VLAN support, or a small managed switch plus access point | 1 | 2,500 | 2,500 | |
| **D** | **Actuators and displays** | | | **4,300** | |
| D1 | Barrier drives (metal-gear servo class) with magnetic angle sensors (AS5600 class) | 2 | 800 | 1,600 | The angle sensor gives the controller its own position feedback |
| D2 | Addressable LED strip for bay indicators; 8×32 LED matrix guidance sign | 1 lot | 1,100 | 1,100 | Symbols plus colour, as in the twin |
| D3 | DC fans with MOSFET drivers | 4 | 200 | 800 | |
| D4 | Dimmable LED strip lighting with driver | 1 | 600 | 600 | |
| D5 | Buzzer and beacon LED | 1 | 200 | 200 | |
| **E** | **Energy** | | | **8,800** | |
| E1 | PV panel, 20 W | 1 | 2,000 | 2,000 | |
| E2 | Small MPPT charge controller | 1 | 1,200 | 1,200 | |
| E3 | LiFePO4 battery 12.8 V 6 Ah with BMS | 1 | 3,000 | 3,000 | Kept in a fire-resistant bag |
| E4 | Current and voltage monitors (INA226 class): grid supply, PV, storage, wireless link | 4 | 250 | 1,000 | The twin's meters `METER-MAIN`, `PV-INV`, `BESS-01`, `WPT-*` |
| E5 | 12 V 10 A certified power supply, buck converters | 1 lot | 1,600 | 1,600 | Mains enters only a certified adapter |
| **F** | **Low-voltage wireless charging link (one bay)** | | | **15,000** | |
| F1 | Litz wire, ≈ 30 m | 1 | 2,000 | 2,000 | Coil pair sized for ≤ 20 W at ≤ 24 V; the ≈ 80 mm receiver fits under a 1:16 chassis |
| F2 | Ferrite tiles for both pads | 1 lot | 2,500 | 2,500 | |
| F3 | Resonant film capacitors (series–series compensation) | 1 lot | 1,500 | 1,500 | |
| F4 | Full-bridge driver board (MOSFETs, gate driver) with current limit | 1 | 2,500 | 2,500 | Alternative: a commercial low-power wireless module pair (≈ ₹1,500) gives a demonstration but no research telemetry |
| F5 | Receiver rectifier, buck stage and load | 1 | 800 | 800 | |
| F6 | NTC sensors and a current probe (ACS712 class) | 1 lot | 700 | 700 | Coil temperature and current telemetry |
| F7 | Current-limited bench supply, 30 V 5 A | 1 | 5,000 | 5,000 | The link is never fed from the battery or a mains rectifier |
| **G** | **Miniature vehicles** | | | **5,900** | |
| G1 | 1:16 RC car chassis, one fitted with the receiver pad | 3 | 1,800 | 5,400 | |
| G2 | Synthetic printed plates, matching the twin's formats | 1 lot | 500 | 500 | Never real registrations |
| **H** | **Cabling, PCBs and consumables** | | | **7,000** | |
| H1 | Custom carrier PCBs for the nodes, fabricated | 1 lot | 3,000 | 3,000 | |
| H2 | Wires, connectors, terminal blocks, glands, heat-shrink, labels | 1 lot | 3,000 | 3,000 | Every cable labelled with its device id |
| H3 | Gateway enclosure | 1 | 1,000 | 1,000 | |
| **I** | **Safety** | | | **1,500** | |
| I1 | Emergency stop (cuts the 12 V bus and the bench supply output), fuses, fire-resistant battery bag | 1 lot | 1,500 | 1,500 | |
| | **Subtotal** | | | **82,500** | |
| | **Contingency (10 %)** | | | **8,250** | Price changes, breakages |
| | **Total ceiling** | | | **90,750** | **≤ ₹1,00,000; ₹9,250 headroom** |

Tools assumed to be available already: a multimeter, a soldering station, a 3D printer and a laptop. If they are not, they are funded separately and are not taken from this ceiling.

## 3. Options that would exceed the ceiling

Each of these needs authorisation, or an equal saving elsewhere:

| Option | Approximate cost (₹) | Benefit |
|---|---|---|
| AI accelerator for the gateway (Hailo-8L class kit) | 7,500–9,000 | Recognition at camera frame rate; the CPU suffices for one vehicle at a time |
| Weatherproof sensors throughout (JSN-SR04T, IP65 IR) | +4,000 | Outdoor bench tests |
| Second wireless link | +10,000 | Two charging bays, as in the preset |
| Oscilloscope (if not available) | 25,000+ | Waveform-level characterisation of the link |

## 4. Savings, if prices rise

| Option | Saving (₹) | Cost of the saving |
|---|---|---|
| 3D-printed columns instead of aluminium (A1) | ≈ 2,500 | Less rigid; harder to modify |
| One row camera instead of two (B5) | 650 | One row loses its third sensor |
| Raspberry Pi 4 instead of Pi 5 (C2) | ≈ 5,000 | Slower recognition (latency measured, not assumed) |
| Commercial wireless module instead of the custom link (F1–F6) | ≈ 8,000 | No coil, compensation or efficiency research data |

## 5. Full-scale pilot estimate (separate; not part of the POC)

An order-of-magnitude estimate for a 12-bay full-size shelter like the twin's default layout:

- 8 conventional bays, including 1 accessible, and 4 bays with 11 kW wireless charging;
- 35 kWp of canopy PV and 30 kWh of storage;
- ANPR, barriers, sensors, an edge gateway and the data platform.

**Accuracy is ±50 %.** It must be replaced by a design from qualified structural and electrical engineers and by vendor quotations. **It is not a budget and has no approval.**

| Element | Planning range (₹ lakh) | Comment |
|---|---|---|
| Steel canopy structure, foundations, drainage (≈ 260 m²) | 8–15 | Design and sign-off by a qualified structural engineer |
| Canopy PV (≈ 35 kWp) with inverter | 15–20 | |
| Battery storage (30 kWh) with power conversion | 8–14 | |
| Wireless chargers, 11 kW, 4 bays | 40–100 | The largest and least certain item: few commercial suppliers, availability and certification to be verified |
| Electrical distribution, metering, protection, earthing, grid connection works | 8–15 | Licensed electrical contractor; utility approval |
| Entry and exit lanes: barriers, ANPR cameras, readers, presence loops | 5–9 | |
| Bay sensing and guidance (12 bays), environmental and life-safety systems | 5–10 | Certified life-safety equipment, not the POC's modules |
| Edge computing, network, operator workstation | 2–4 | |
| Software platform hardening, cloud hosting (first year), security assessment | 5–10 | |
| Design, permits, certification, commissioning, contingency | 15–30 | |
| **Total (order of magnitude)** | **≈ 110–230** | ≈ ₹1.1–2.3 crore |

The commercial-deployment requirements in SMART_PARKING_HARDWARE_PLAN.md §9 apply: certified equipment, a hazard analysis, structural and electrical sign-off, payment-provider integration and data-protection compliance in the deployment jurisdiction.
