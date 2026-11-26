# Cinematic storyboard

Source of truth: `src/components/wireless-ev-twin/story/stages.ts`. Each stage names its objective, view, shot, components, instruments, physics and models, and brings the simulation to the state it needs by running the model (`story/simControl.ts`).

## Flagship: Smart Wireless EV Charging Station (12 stages)

| # | Stage | View · shot | Simulation state | Advances when | Physics shown |
|---|---|---|---|---|---|
| 1 | A smart wireless charging bay | Exterior · establishing | empty bay, station available | ≥ 8 s | system boundary, grid → battery chain |
| 2 | Inside the ground pad | Pads exploded · ground-assembly | empty bay (pad opens upward from its base) | ≥ 11 s | B = μ₀μᵣH; ferrite as image currents |
| 3 | The vehicle arrives | Exterior · approach (follows) | `arrive` command; constant-deceleration stop | vehicle detected (≥ 5 s, ≤ 30 s) | v = min(3.3, √(2ad)) |
| 4 | Detection, identification and authorisation | IoT · identify | phases 3–6; message pulses | alignment reached | heartbeat timeout 1.0 s |
| 5 | Alignment and coupling | Alignment · alignment | phase 7; dimensions on the pads | battery check reached | M = k√(L₁L₂) |
| 6 | The receiver assembly | Receiver · receiver (follows) | phase 8+ | ≥ 10 s | e₂ = −jωMI₁ |
| 7 | The magnetic field between the pads | Magnetic field · field | active charging | charging (≥ 11 s) | Biot–Savart with ferrite images; RMS map, phase-sampled lines |
| 8 | Resonance and the inverter | Power electronics · cabinet | active charging; cabinet open; FHA waveforms in the Science panel | ≥ 11 s | f₀ = 1/(2π√(L₁C₁)); coupled SS solved as a whole |
| 9 | Follow the energy | Energy flow · energy | active charging | ≥ 11 s | P_grid = P_battery + ΣP_loss |
| 10 | Charging the battery | Battery · battery | active charging, **×60** | ≥ 11 s | V = OCV(SOC) + IR₀ + V₁ |
| 11 | A foreign object on the pad | X-ray · safety | can placed at 2.5 s, removed at 9 s; FOD trip, inverter gated off, recovery | charging again (≥ 16 s, ≤ 40 s) | P_object ∝ B² (illustrative coefficient) |
| 12 | Session complete | Exterior · establishing | **×300** to target SOC; ramp-down, record, departure | bay available again (≤ 90 s) | E = ∫P dt |

In Explore mode the sequence advances by itself when each stage's minimum time has passed **and** its engineering event has happened. Any interaction pauses it; *Continue tour* resumes.

## Technology demonstration (8 chapters)

| Chapter | Stages |
|---|---|
| 1 Arrival and identification | overview, the vehicle arrives, identification |
| 2 Park and align | alignment |
| 3 See the invisible physics | receiver, magnetic field |
| 4 Follow the electrical energy | resonance, energy, battery |
| 5 Charge while driving | electrified highway, under the road, position-dependent coupling |
| 6 Autonomous charging | precision parking |
| 7 Intelligent energy ecosystem | district day (×60) |
| 8 Enter the science | the laboratory, with the closing line |

The demonstration hides the rail, inspector and drawer, keeps captions and the timeline, and can be left at any moment (Esc or *Exit demonstration*). It is opened from the hero's *Watch Technology Demonstration* link (`#demo`) or the toolbar.

**Difference from the brief:** chapter 1 of the brief begins at a smart parking shelter with barriers and number-plate identification. That environment is not simulated yet (see SMART_PARKING_REQUIREMENTS.md), so chapter 1 shows arrival and identification at the charging station instead.

## Dynamic Wireless EV Charging (9 stages, Phase 3)

Every stage that needs particular road inputs sets them (visible in the inputs drawer) and restarts the drive, so its outcome comes from a clean run of the model.

| # | Stage | View · shot | Road inputs | Advances when | Physics shown |
|---|---|---|---|---|---|
| 1 | An electrified highway | Roadside camera (fixed posts; cuts to the next post as the car passes) | defaults: 80 km/h, 60 % coverage | ≥ 12 s | P_battery = P_received − P_traction − P_losses |
| 2 | Under the road | Cutaway · over the guardrail into the section | fully electrified stretch | ≥ 11 s | construction only; layers are representative |
| 3 | Segment activation and handover | Segment control · top-down, vehicle ghosted | fully electrified stretch | ≥ 11 s | request window ∧ interlock ∧ authorised ∧ supply |
| 4 | Position-dependent coupling | Coupling profile · chart beside the lane | (kept) | ≥ 12 s | λ₂ = L₂i₂ + M(x(t))i₁ and the motional term |
| 5 | The receiver at speed | Receiver · shoulder level | (kept) | ≥ 10 s | e₂ = −jωM(x)I₁ |
| 6 | Gaining energy while driving | Exterior · follow | 30 km/h, 100 % | regime "charging" over 200 m (≤ 60 s) | ΔE = E_received − E_traction − E_losses |
| 7 | Energy-neutral driving | Exterior · follow | 80 km/h, 47 % | regime "energy-neutral" (±0.5 kW) over 200 m | |
| 8 | Losing energy despite charging | Exterior · follow | 120 km/h, 30 % | regime "discharging" over 200 m | road load |
| 9 | A failed segment | Coupling profile | stretch at 40 km/h; the pad ahead fails, repaired and replaced by the next once passed | ≥ 12 s | M_total = Σ_{j≠failed} M_j·level_j |

The three energy presets are check B11's (the energy-neutral coverage, 47 %, lies in the band that check's search finds; a unit test runs each preset and asserts its regime).

## Other environments

| Environment | Stages | Status |
|---|---|---|
| Autonomous | Autonomous precision parking · Estimate and truth | steering now shown from the model; premium scene is Phase 5 |
| Infrastructure | A district's energy day | premium district is Phase 6 |

## Narration and captions

Every stage has one or two sentences of narration, written to be spoken calmly and to say only what the model computes. Captions show the same text (on by default). Spoken narration uses the browser's speech synthesis and starts only when the visitor turns it on; the ambient sound is synthesised in the browser and also off by default. Professionally recorded narration is not part of this phase.
