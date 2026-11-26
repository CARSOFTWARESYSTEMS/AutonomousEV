# Scientific visualisation

What each overlay shows, which model computes it, and what it must not be mistaken for.

## Magnetic field (station)

- **Colour map:** RMS magnetic flux density **|B|** in the vertical section through both pad centres, along the receiver's offset. Logarithmic scale 1 µT – 10 mT with a legend. Computed by WPT-EM-002 from a per-ampere field basis of the filament model with ferrite images, scaled each frame by the present complex currents I₁ and I₂ from the steady-state solution. Cells outside the model's validity are transparent.
- **Field lines:** traced through the same field at one phase ωt of the 85 kHz cycle (ωt = 0; the store has a phase setting, but no control for it is exposed yet). The dash animation along them is a visual cue, labelled as slowed by about 10⁵; the screen does not and cannot reproduce 85 kHz.
- **Gap-centre value:** RMS flux density at the centre of the gap, shown in the legend and as an instrument.
- **Pad de-energised:** the map and lines disappear and the legend says why (the present phase).
- **Labelled as:** analytical filament model (F1), not FEM.

The inspector, stage text and lessons keep these quantities distinct: flux density B (T), field direction (lines), flux linkage λ (Wb-turns), mutual inductance M (H), coupling coefficient k (dimensionless), induced EMF (V) and transferred power (W). The alignment stage labels M and k from `state.coupler`; the receiver stage shows the open-circuit EMF ωMI₁; the energy stage shows power.

## Road: segment states, interlock and coupling profile (Dynamic)

- **Pad states** come from the segment controller each frame: off, energising (soft start), active, de-energising, blocked by the interlock, failed. The saw-cut outline and a ring on each module carry the colour; the winding's glow follows the segment's level. In the exterior view the outlines are dark joints.
- **Interlock zone** (green band): pads whose centres lie under the vehicle body — where the independent interlock allows energising. **Request window** (brackets): ± the window around the receiver within which the controller requests a pad, from its delayed, noisy position estimate.
- **Coupling chart** beside the lane, moving with the vehicle. Behind the receiver: the total mutual inductance the receiver actually saw and the power it actually received, from the simulation's samples. Ahead: the coupling the road would offer at each position if each pad energises on time, from the same tabulated filament model (failed pads contribute nothing). Scales: 0 to the peak single-pad M at the present lateral offset; 0 to the receiver rating.
- **Motional EMF:** the instrument shows v·|dM/dx|/(ωM), computed every step; it stays of order 10⁻³–10⁻⁴, which is why the quasi-static model is valid. It is shown, not hidden.
- **Energy outcome** is the mean battery power over the last 200 m driven (one repeat of the electrified zones), classified with the same ±500 W band as check B11.
- **Not shown:** cycle-by-cycle 85 kHz behaviour.

## Road: magnetic field (Dynamic, WPT-EM-005)

- **Colour map:** RMS |B| over a vertical section through the receiver centre, either following the receiver or fixed at a road segment; log (1 µT–10 mT) or linear (0 to a round number above the section's peak) scale; optional decade contours.
- **Computed** every frame from the energised segments' currents (I₁ × level, one phase reference) and the receiver current (−j|I₂|), with the filament model and ferrite images (F1, not FEM). De-energised, blocked and failed pads contribute nothing: the field appears and disappears with the segments.
- **Lines and vectors:** the in-plane instantaneous field at a chosen phase ωt (Engineer and Research modes have a phase control; a phase sweep is slowed about 10⁵× and labelled as a visual cue).
- **Instrument:** RMS |B| at mid-gap under the receiver. Details: DYNAMIC_MAGNETIC_FIELD_REPORT.md.

## Road: charging in motion

- **Pad glow** through the surface: each pad's controller energisation level (soft start amber → active cyan; blocked amber). A visual cue for a simulated state, not emitted light.
- **Flux column** between road and receiver, as bright as the received power.
- **DC path** in the vehicle (receiver → compensation → rectifier → DC–DC → junction box), splitting to the battery (direction from the sign of battery power) and the motor (traction power).
- **HUD:** the five pads around the receiver with state and level, the received / motor / battery balance on one scale, and the last 1.5 s of received power (one peak per pad).
- **Outcome stages** classify only over a complete, time-weighted 200 m window; until then the card says "Collecting a complete 200 m measurement window."

## Alignment

Dimension lines on the pads for the lateral and longitudinal offsets (from the pad centre to the receiver centre projected on the slab) and a vertical line for the winding-to-winding air gap, with labels. Inputs are tagged INPUT; k and M are CALCULATED. Moving a slider recomputes the coupler (tested in the browser: raising the gap from 150 to 210 mm drops k from 0.365 to 0.246).

## Energy flow

Four segments: grid AC (transformer → cabinet), 85 kHz drive (cabinet → pad), the magnetic link (between the pads) and DC (receiver → compensation → rectifier → DC–DC → junction box → battery, in the vehicle frame). Dash speed and brightness scale with each stage's calculated power from the chain model; labels show the power in kW. The difference between grid and battery is the sum of the chain's losses (WPT-SYS-001), listed in the Data panel.

## IoT

One pulse per message the simulated bus delivered, coloured by link (CAN, vehicle ↔ station, station ↔ backend, gateway → cloud). Lost messages produce no pulse. The pulse's travel time is slowed for visibility; the IoT & Data laboratory lists real simulated latencies. Every message is SIMULATED; nothing is LIVE.

## Thermal

One uniform colour per lumped thermal node (transmitter coil, receiver coil, inverter, battery), on a blue → red scale between ambient and the node's limit. The model has no spatial temperature field, so the view shows no hot spots.

## Foreign and living objects

The test object (a steel can) appears on the pad while the fault is injected and glows only as its modelled temperature rises (an illustrative, uncalibrated heating coefficient, stated in the stage). The living-object protected zone appears as a translucent dome while that state is active.

## District

Flows between the grid, PV, storage, the electrified road and the buildings, sized by the dispatch model's power at the hour shown. Storage charging runs its flow backwards. Unmet demand is reported in the Data panel as unmet and is never drawn as a delivered flow. The model is aggregate energy dispatch, not network power flow, and says so.

## Resonance waveforms

The Science panel of the resonance stage plots one cycle of the inverter output voltage (÷10), I₁ and I₂ from the first-harmonic model of the present operating point (`fhaWaveforms`). It is labelled as a first-harmonic model, not a switching-level simulation.

## Not yet implemented

Imported FEM maps, a plan-view field map, selectable arbitrary section planes at the station, and spatial thermal fields. (Linear/log scale and contours now exist for both field views; vectors and a fixed-segment section for the road.)
