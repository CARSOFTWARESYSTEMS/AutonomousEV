# Dynamic magnetic field report (WPT-EM-005)

Phase 3.5, 26 Nov 2026. The road had no magnetic-field view; this report records how one was added, what it computes, what it assumes and how it was verified.

## 1. Feasibility: is there enough state to compute the field?

The road simulation (WPT-SIM-002, `dynamic.ts`) was reviewed for the quantities a field calculation needs.

| Needed | Available in the road model | Verdict |
|---|---|---|
| Transmitter geometry | `sim.tx` (road pad: diameter, turns, ferrite gap and permeability from the parking pad) | yes |
| Receiver geometry | `sim.rx` (`DEFAULT_RX_PAD`) | yes |
| Vehicle position | `state.x`, receiver at `state.x + vehicle.receiverOffset` | yes |
| Lateral displacement, air gap | `inputs.lateral`, `inputs.airGap` | yes |
| Which segments carry current, and how much | `segments[j].level` (soft start/stop) × regulated `inputs.primaryCurrent`; `state` on / blocked / failed / off | yes |
| Phase of each segment current | **not stored** | from the model's own equations (A1) |
| Receiver current | `state.i2` (magnitude) | magnitude yes; phase from A2 |

The model never stores a phase, so a field could not simply be read out. It does, however, compute the induced EMF as `voc = ω · Σ M_j · level_j · I₁` — a coherent sum, which is only correct if every energised segment is driven in one phase reference. And it computes `|I₂| = |voc| / (R₂ + R_L)`, which is only correct if the receiver loop is resistive, i.e. tuned to resonance. These are the model's existing assumptions; the field view states them and uses them, and adds none of its own:

- **A1** — every energised segment carries `I_j = I₁ · level_j ∠ 0` (RMS phasor).
- **A2** — the receiver carries `I₂ = −j ω M_total I₁ / (R₂ + R_L)` (the sign convention of `circuits.ts`: I₂ lags I₁ by 90°).

So the decision under the brief's §13 was the first branch, *sufficient data exists*: an analytical calculation from the existing filament model, not a conceptual (F0) picture.

## 2. Equations

Each winding is its turns as circular filaments (WPT-EM-001), and each turn has images in the two ferrite planes (method of images, second order, as WPT-EM-002 uses for the station section). The per-ampere field of one filament of radius *a* at cylindrical (ρ, z) is the closed-form elliptic-integral expression:

```
B_z = (μ₀/π) / (2α²β) · [(a² − r²) E + α² K]
B_ρ = (μ₀ z/π) / (2α²β ρ) · [(a² + r²) E − α² K]
α² = a² + r² − 2aρ,  β² = a² + r² + 2aρ,  r² = ρ² + z²
```

The field at a point r in the road frame is the superposition over every energised segment j and the receiver:

```
B(r) = Σ_j I_j · b_tx(r − r_j) + I₂ · b_rx(r − r_rx)          (RMS phasors, T)
B_rms = √(|B_x|² + |B_y|² + |B_z|²)
B(t)  = √2 · Re(B · e^{jωt})                                  (instantaneous)
```

with `b = (B_ρ cos φ, B_ρ sin φ, B_z)` per ampere and φ the azimuth from the winding axis to the point.

## 3. Inputs and outputs

| | Quantity | Source |
|---|---|---|
| Inputs | segment positions `x_j`, levels `level_j`, states | `runtime.road.state.segments` |
| | `I₁` (RMS), frequency | road inputs |
| | `|I₂|` | `state.i2` |
| | receiver position, lateral offset, air gap | `state.x + receiverOffset`, inputs |
| | pad geometries | `sim.tx`, `sim.rx` |
| Outputs | RMS |B| over a vertical section through the receiver centre (following the receiver, or fixed at a road segment) | `roadFieldSection` |
| | instantaneous in-plane field and field lines at phase ωt | `roadFieldSection`, `roadFieldLines` |
| | RMS |B| at mid-gap under the receiver | `section.atReceiver` → instrument "B at mid-gap" |

Implementation: `src/lib/wireless-charging/roadField.ts` (pure TypeScript, no three.js). Rendering: `three/road/RoadField.tsx` reads it; the legend and instruments read `three/road/fieldInfo.ts`.

## 4. Numerical approach

- **Cached field basis.** The per-ampere (B_ρ, B_z) of a segment winding and of the receiver winding — every turn and its images — are tabulated once per geometry on a (ρ, z) grid: ρ 0–1.6 m in 268 steps (6 mm), z between the two ferrite planes in ≈ 3 mm steps. `fieldKernel` builds it at once (tests); `fieldKernelStep` builds a few rows per frame so the render loop never stalls (≈ 80–200 ms of work spread over ~10 frames on an M1).
- **Per frame:** `roadExcitation` reads the segments within 6 m of the receiver and the receiver current; `roadFieldSection` evaluates a 120 × 40 section by bilinear lookup and superposition (a few thousand lookups); field lines are retraced 4× a second (11× during a phase sweep) by RK4 on the in-plane unit field.
- Cells inside a winding layer are blanked (NaN → transparent), as in the station section.
- Rendering quality never changes the numbers: the section's value at a point depends only on the point (tested at two resolutions).

## 5. Fidelity

**F1, analytical** — the same fidelity as the coupler and the station field. It is **not FEM**: no finite ferrite extent beyond the coverage factor, no saturation or loss, no eddy currents in the road, its reinforcement or the vehicle floor, no shields. Lines show the in-plane field; when the receiver is offset laterally, part of the field crosses the section and is not drawn as lines (it is included in the colour map).

## 6. Verification

| Test | Where | Result |
|---|---|---|
| Zero excitation gives zero field | `roadField.test.ts`, check A15 | exactly 0 T |
| A single road pad reproduces the station's field section (WPT-EM-002) | `roadField.test.ts`, check A14 | worst 3 % over > 100 points away from the conductors |
| Cached basis against direct summation over every turn and image | `roadField.test.ts` | < 1 % |
| Linear superposition of three sources | `roadField.test.ts`, check A16 | residual < 10⁻¹² T |
| Sign and phase conventions | `roadField.test.ts`, check A16 | I₁ at its peak drives B up through its pad; at ωt = 0 the receiver (−j\|I₂\|) adds nothing; a quarter cycle later the receiver current sustains the falling flux (Lenz) |
| Symmetry about a lone pad | `roadField.test.ts` | equal RMS either side; radial component reverses |
| Coordinates consistent with the simulation | `roadField.test.ts` | receiver at `x + receiverOffset`, sources at each segment's `x`, currents `I₁·level` |
| Failed and inactive segments contribute nothing | `roadField.test.ts`, check A15 | a failed pad never appears among the sources |
| Rendering resolution does not change results | `roadField.test.ts` | identical values at shared points of 11- and 21-column sections |

Checks A14–A16 also run in the visitor's browser from Engineering Assurance.

## 7. Supported configurations

Any road pad diameter, turns and spacing the road inputs allow; air gaps the coupling table supports; lateral offsets up to the table's reach; any number of simultaneously energised segments (handover overlaps included); failed and blocked segments; intermittent supply (segments at level 0 contribute nothing).

## 8. Limitations

- Exposure: the view shows modelled flux density for understanding, not an exposure assessment; that needs measured or FEM fields against the applicable guideline.
- A1 and A2 belong to the road model; a road with independently phased segment inverters or a detuned receiver would need the model extended first.
- The section is a vertical plane through the receiver centre; there is no plan-view (horizontal) map yet.
