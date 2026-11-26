# Component interaction registry

The engineering content of each component (purpose, construction, materials, principle, circuit, losses, thermal, failure modes, safety, assumptions, fidelity, status, research) lives in `src/lib/wireless-charging/components.ts`. This file records how each one is reached in the 3D laboratory. **All 41 registry ids have at least one selectable mesh** (checked by searching the scene code for `pick(id)` and the pad layer maps).

## Selecting a component

1. Click or tap it in the scene (a drag of more than 5 px is treated as an orbit, not a click).
2. The guided sequence pauses; if the part is hidden in the current view, the view changes to one where it is visible.
3. The camera frames the part's bounding sphere along the view's composed direction.
4. The part is tinted cyan; **Isolate** ghosts every other engineering part.
5. The inspector opens at **Overview** (*What is it? What does it do? What is happening now?*), with **How it works** (principle, inputs → outputs, circuit, the models' equations) and **Engineering** (materials, characteristics, losses, thermal, failure modes, safety, assumptions, fidelity and validation, research) one tab away — never all three at once.
6. Actions: Frame, Isolate, Explode pads / Explode vehicle, Lesson (Physics & Mathematics, opened at the model's lesson), Experiment (Simulation Lab), Model status (Engineering Assurance).

Esc or the close button returns to the system view.

## Where each component is

| Id | Name | In the scene | View it opens in |
|---|---|---|---|
| grid | Grid connection | feeder trench from the transformer | current |
| transformer | Transformer | pad-mounted unit behind the shelter | current |
| protection | Circuit protection and isolation | cabinet DIN rail | Power electronics |
| pfc | AC–DC converter with PFC | cabinet PFC board and inductors | Power electronics |
| dc-link | DC-link capacitor | cabinet capacitor bank and busbar | Power electronics |
| inverter | High-frequency inverter | cabinet SiC modules and terminals | Power electronics |
| gate-driver | Gate driver circuits | boards on the SiC modules | Power electronics |
| tx-compensation | Primary resonant compensation | cabinet film-capacitor bank | Power electronics |
| power-cabinet | Station power cabinet | shell, cap, door | Power electronics |
| station-controller | Embedded station controller | cabinet board; bay indicator | Power electronics |
| safety-controller | Local safety controller | cabinet board | Power electronics |
| iot-gateway | IoT gateway | cabinet module and antenna | Power electronics |
| lod-sensor | Living-object detection | radar on the cabinet plinth | Power electronics |
| cooling | Thermal management | cabinet cold plate and cooling unit; vehicle cooling plate, coolant lines, radiator | X-ray (vehicle parts) |
| tx-enclosure | Ground pad enclosure | pad cover | Cutaway |
| fod-sensor | Foreign-object detection | printed sense-coil array; the test object | Cutaway |
| tx-insulation | Insulation and potting | potting and insulation sheet | Cutaway |
| tx-coil | Transmitter coil | Litz winding and former | Cutaway |
| tx-ferrite | Transmitter ferrite | 16 radial bars | Cutaway |
| tx-shield | Aluminium shield | shield plate | Cutaway |
| tx-base | Pad base and connections | base, terminal box, cable trench | Cutaway |
| field-sensor | Magnetic field probe | probe beside the bay | current |
| alignment-sensor | Alignment and positioning | anchors on the canopy columns | current |
| id-camera | Vehicle identification camera | canopy edge over the aisle | current |
| solar | Solar PV canopy | modules and steel | current |
| bess | Battery energy storage | container | current |
| vehicle | Electric vehicle | body | current |
| rx-enclosure | Receiver enclosure and mounting | receiver cover, base, brackets | Receiver |
| rx-coil | Receiver coil | receiver winding | Receiver |
| rx-ferrite | Receiver ferrite and shield | receiver ferrite, sheet, shield | Receiver |
| rx-compensation | Secondary compensation | unit ahead of the receiver | Receiver |
| rectifier | Rectifier | finned unit on the front subframe | X-ray |
| dcdc | Vehicle DC–DC converter | unit on the front subframe | X-ray |
| vcu | Vehicle Control Unit | unit under the dashboard | X-ray |
| traction | Traction inverter and motor | rear drive unit, half-shafts | X-ray |
| hv-junction | High-voltage junction box | box on the battery lid; orange cables | Battery |
| bms | Battery Management System | board on the battery | Battery |
| battery-pack | Battery pack | enclosure, modules, busbars, lid | Battery |
| road-coil | Embedded road pad | pad modules (Dynamic) | Cutaway |
| segment-controller | Segment controller | roadside cabinets (Dynamic) | current |
| road-layers | Road construction layers | carriageway, section-cut walls and duct bank (Dynamic) | Cutaway |

"Current" means the part is visible in every station view that shows its surroundings, so the view is kept.

## Hover

Hovering a selectable part shows a small label (`name · select to inspect`) over the scene; the cursor does not change the simulation.
