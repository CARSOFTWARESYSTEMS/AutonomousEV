# Physics and model registry

Generated from `src/lib/wireless-charging/registry.ts`, the single source the interface, documentation and verification suite read.

## Fidelity levels

- **F0 — Conceptual visualisation.** Shows what happens, not how much. No quantitative claim.
- **F1 — Analytical model.** Closed-form or quasi-static equations with declared assumptions.
- **F2 — Dynamic numerical model.** Time-stepped states (battery, thermal, motion, estimation) integrated numerically.
- **F3 — Detailed circuit or field simulation.** Switching-level circuit or finite-element field simulation.
- **F4 — Experimentally calibrated.** Parameters fitted to measurements and validated within a stated operating range.
- **F5 — Connected prototype twin.** Synchronised with a physical prototype's live telemetry.

## WPT-EM-001 · Circular-filament magnetic coupler (v1.0.0)

Self- and mutual inductance and coupling coefficient of two planar spiral pads, each modelled as concentric circular turns, with ferrite backing by the method of images.

- **Domain:** Electromagnetic coupling · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/coils.ts · computeCoupler`
- **Equations:**
  - `M_ab = μ0·√(ab)·[(2/k − k)·K(k) − (2/k)·E(k)],  k² = 4ab / ((a+b)² + d²)   (coaxial loops, Maxwell)`
  - `M = ∮ A_φ(ρ′, h)·dl,  A_φ = (μ0/πk)·√(a/ρ)·[(1 − k²/2)K − E]   (laterally displaced loops)`
  - `L_loop = μ0·a·[ln(8a/r_w) − 2 + 1/4]`
  - `Image strength c = η_cov·(μr − 1)/(μr + 1), mirrored in each ferrite plane`
  - `k = M / √(L1·L2)`
- **Inputs:** a, b — Turn radii [m]; N1, N2 — Turns [1]; h — Air gap [m]; ρ — Horizontal offset [m]; μr — Ferrite relative permeability [1]; η_cov — Ferrite coverage factor [1]
- **Outputs:** L1, L2 — Self-inductance [H]; M — Mutual inductance [H]; k — Coupling coefficient [1]
- **Assumptions:** Turns are concentric circles in parallel planes. Ferrite is infinite, linear and unsaturated; image series truncated at third order. Uniform current across each Litz bundle.
- **Validity:** Air gaps 50–300 mm, offsets up to one pad diameter, frequencies where Litz strands are well below a skin depth.
- **Numerical method:** Complete elliptic integrals by the arithmetic–geometric mean; periodic trapezoid rule (48 points) for the offset integral.
- **Depends on:** —
- **Known limitations:** Finite ferrite extent is only approximated by the coverage factor (calibrate with FEM or measurement). No aluminium shield eddy currents, vehicle floor, saturation or ferrite loss. Circular pads only: rotation has no effect; DD/DDQ/bipolar pads are not modelled yet. No pad tilt.
- **Verification checks:** A01, A02, A03, A09, B01, B07

## WPT-EM-002 · Coupler field section (v1.0.0)

RMS flux density and instantaneous field lines in the vertical section through both pad centres, from the closed-form field of each turn and its images.

- **Domain:** Electromagnetic field · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/coils.ts · computeFieldSection, traceFieldLines`
- **Equations:**
  - `B_z = (μ0I/π)/(2α²β)·[(a² − r²)E + α²K]`
  - `B_ρ = (μ0Iz/π)/(2α²βρ)·[(a² + r²)E − α²K]`
  - `α² = a² + r² − 2aρ,  β² = a² + r² + 2aρ,  r² = ρ² + z²`
  - `B_rms = |B1·I1 + B2·I2| (RMS phasors)`
- **Inputs:** I1, I2 — Coil currents (RMS phasors) [A]; geometry — Coupler geometry [m]
- **Outputs:** B_rms(x, z) — RMS flux density [T]; lines — Instantaneous field lines [m]
- **Assumptions:** Valid only in the air region between the ferrite planes (cells elsewhere are blank). Field lines are traced from seeds at mid-gap: line density is not flux density.
- **Validity:** Air region between the two ferrite planes.
- **Numerical method:** Closed-form elliptic-integral field; RK4 line tracing on the unit field direction.
- **Depends on:** WPT-EM-001
- **Known limitations:** Not a finite-element solution: no ferrite edges, shields or vehicle body. Exposure assessment needs measured or FEM fields against the applicable guideline.
- **Verification checks:** A10

## WPT-EM-005 · Dynamic road magnetic field (v1.0.0)

RMS and phase-sampled flux density around a vehicle on the electrified road: the per-ampere field of a segment winding and of the receiver (filament loops with ferrite images), superposed over every energised segment with its present current and over the receiver current.

- **Domain:** Electromagnetic field · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/roadField.ts · fieldKernel, roadExcitation, roadFieldSection, roadFieldLines`
- **Equations:**
  - `B(r) = Σⱼ Iⱼ·b_tx(r − rⱼ) + I₂·b_rx(r − r_rx)   (RMS phasors)`
  - `Iⱼ = I₁·levelⱼ ∠0,   I₂ = −jω M_total I₁ / (R₂ + R_L)`
  - `B(t) = √2·Re(B e^{jωt})`
  - `b from B_z, B_ρ of each turn and image (WPT-EM-002)`
- **Inputs:** x_j, level_j — Segment positions and energisation levels (WPT-SIM-002) [SI]; I1, |I2| — Regulated segment current and receiver current [A]; geometry — Segment pad, receiver pad, air gap, lateral offset [m]
- **Outputs:** B_rms(x, z) — RMS flux density in a vertical section through the receiver centre [T]; B(t) — Instantaneous field and field lines at a chosen phase [T]
- **Assumptions:** All energised segments share one phase reference at the regulated current I₁ scaled by their level (the road model's coherent EMF sum requires this). The receiver is tuned to resonance: I₂ lags I₁ by 90°. Failed, blocked and switched-off segments carry no current. Quasi-static: one 85 kHz first-harmonic phasor field per instant.
- **Validity:** Air region between the segment's and the receiver's ferrite planes; within 1.6 m of each winding.
- **Numerical method:** Per-ampere tables on a (ρ, z) grid (6 mm × 3 mm) built once per geometry from every turn and its images; bilinear lookup and superposition per frame; RK4 line tracing.
- **Depends on:** WPT-EM-001, WPT-EM-002, WPT-SIM-002
- **Known limitations:** Not FEM: no ferrite edges, saturation, eddy currents in the road, reinforcement or vehicle floor. Lines show the in-plane field only; with a lateral offset part of the field crosses the section. Exposure assessment needs measured or FEM fields against the applicable guideline.
- **Verification checks:** A14, A15, A16

## WPT-CIR-001 · Series–series compensated link (closed form) (v1.0.0)

Phasor solution of the SS link under the first-harmonic approximation, forward (given inverter voltage) and inverse (given load power).

- **Domain:** Resonant networks · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/circuits.ts · ssForward, ssForLoadPower`
- **Equations:**
  - `V1 = Z1·I1 + jωM·I2`
  - `0 = jωM·I1 + (Z2 + R_L)·I2`
  - `Z_i = R_i + jωL_i + 1/(jωC_i)`
  - `Z_r = (ωM)² / (Z2 + R_L)`
  - `η = R_L(ωM)² / [(R2+R_L)((R2+R_L)R1 + (ωM)²)]  (at resonance)`
  - `R_L,opt = √(R2² + (ωM)²·R2/R1)`
- **Inputs:** L1, L2, M — Inductances [H]; C1, C2 — Compensation [F]; R1, R2 — Series resistances [Ω]; f — Frequency [Hz]; R_L — Equivalent load [Ω]
- **Outputs:** I1, I2 — Coil currents [A]; Z_in — Input impedance [Ω]; η — Link efficiency [1]; V_C — Capacitor voltage stress [V]
- **Assumptions:** Sinusoidal currents (FHA). Linear components; resistances fixed at the step's temperature.
- **Validity:** Quality factors above ~5, where the tank currents are near-sinusoidal.
- **Numerical method:** Complex arithmetic, closed form.
- **Depends on:** WPT-EM-001, WPT-LOSS-001
- **Known limitations:** No harmonics, dead time or switching transients. SS only; other topologies use WPT-CIR-002.
- **Verification checks:** A04, A05, A06, B04

## WPT-CIR-002 · AC nodal analysis of compensation topologies (v1.0.0)

Complex modified nodal analysis (as in a SPICE AC run) of SS, SP, PS, PP, LCC–S and LCC–LCC networks with coupled inductors.

- **Domain:** Electrical circuits · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/circuits.ts · solveAc, designCompensation, frequencySweep`
- **Equations:**
  - `Y·V + B·I_br = J  (KCL)`
  - `V_a − V_b − jωL·i − jωM·i_other = 0  (inductor branches)`
  - `C1 from Im(Z_branch) = 0 (series) or Im(Y_branch) = 0 (parallel) at f0`
- **Inputs:** netlist — Topology and component values [SI]; f — Frequency [Hz]
- **Outputs:** V, I — Node voltages and branch currents [V, A]; Z_in — Input impedance [Ω]; η(f) — Efficiency against frequency [1]
- **Assumptions:** Linear small-signal (AC) analysis; FHA source and load.
- **Validity:** Any linear passive network with one source.
- **Numerical method:** Gaussian elimination with partial pivoting on the complex MNA matrix.
- **Depends on:** WPT-EM-001
- **Known limitations:** Frequency domain only: no switching waveforms; a time-domain SPICE run is an open extension.
- **Verification checks:** A05, A07

## WPT-LOSS-001 · Winding and capacitor resistance (v1.0.0)

Litz winding resistance from copper length, strand area and temperature, with an empirical AC factor; capacitor ESR from loss tangent.

- **Domain:** Power losses · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/losses.ts · windingResistance`
- **Equations:**
  - `R_dc = ρ_Cu(T)·ℓ / A_Cu,  ρ_Cu(T) = ρ20·(1 + α(T − 20))`
  - `R_ac = F_R·R_dc`
  - `δ = √(ρ / (π f μ0))`
  - `ESR = tanδ / (ωC)`
  - `P_Cu = I_rms²·R_ac`
- **Inputs:** ℓ, A_Cu — Conductor length and area [m, m²]; T — Winding temperature [°C]; F_R — AC resistance factor [1]; tanδ — Capacitor loss tangent [1]
- **Outputs:** R_ac — AC resistance [Ω]; δ — Skin depth [m]; P_Cu — Copper loss [W]
- **Assumptions:** F_R lumps strand skin and bundle proximity effects; default 1.9 is representative, not computed.
- **Validity:** Strand diameter below the skin depth.
- **Numerical method:** Closed form.
- **Depends on:** —
- **Known limitations:** F_R should come from a Litz model (e.g. Sullivan) or measurement.
- **Verification checks:** B04

## WPT-LOSS-002 · Inverter semiconductor losses (v1.0.0)

Full-bridge SiC MOSFET conduction and switching losses under FHA, with a zero-voltage-switching criterion from the input phase.

- **Domain:** Semiconductor losses · **Fidelity:** F1 · **Status:** Implemented
- **Implementation:** `src/lib/wireless-charging/losses.ts · inverterLoss`
- **Equations:**
  - `P_cond = 2·R_ds(T_j)·I1²`
  - `i_sw = √2·I1·|sin θ_in|`
  - `P_off = 4·f·½·V_dc·i_sw·t_off`
  - `P_on = 4·f·(½·V_dc·i_sw·t_on + ½·C_oss·V_dc²)  if θ_in ≤ 0`
- **Inputs:** V_dc — DC-link voltage [V]; I1 — Primary current [A]; θ_in — Input phase [rad]; T_j — Junction temperature [°C]
- **Outputs:** P_inv — Inverter loss [W]; ZVS — Zero-voltage switching [bool]
- **Assumptions:** Representative device parameters; hard-switching overlap estimate is conservative under ZVS.
- **Validity:** Inverter operating with a near-sinusoidal tank current.
- **Numerical method:** Closed form.
- **Depends on:** WPT-CIR-001
- **Known limitations:** No dead-time, reverse recovery or gate-charge detail; datasheet curves should replace the defaults.
- **Verification checks:** A05

## WPT-LOSS-003 · Converter loss model (v1.0.0)

Transformer, AC–DC PFC and vehicle DC–DC losses as a quadratic in output power.

- **Domain:** Power converters · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/losses.ts · converterLoss`
- **Equations:**
  - `P_loss = p0 + a·P + b·P²`
  - `η = P / (P + P_loss)`
- **Inputs:** P — Output power [W]; p0, a, b — Loss coefficients [W, 1, 1/W]
- **Outputs:** P_loss — Loss [W]; η — Efficiency [1]
- **Assumptions:** Coefficients are representative of the converter class, not a product.
- **Validity:** Within the converter's rated power.
- **Numerical method:** Closed form; input from output by direct evaluation, output from input by the quadratic formula.
- **Depends on:** —
- **Known limitations:** Fit p0, a, b to measured efficiency curves before quantitative use.
- **Verification checks:** A05

## WPT-TH-001 · Lumped thermal network (v1.0.0)

First-order thermal node per component: windings, inverter heatsink, battery, and an illustrative foreign object.

- **Domain:** Thermal systems · **Fidelity:** F2 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/losses.ts · stepThermal`
- **Equations:**
  - `C_th·dT/dt = P_loss − (T − T_amb)/R_th`
  - `T(t+Δt) = T∞ + (T − T∞)·e^(−Δt/R_th·C_th),  T∞ = T_amb + P·R_th`
- **Inputs:** P_loss — Heat input [W]; R_th — Thermal resistance [K/W]; C_th — Heat capacity [J/K]; T_amb — Ambient [°C]
- **Outputs:** T — Temperature [°C]
- **Assumptions:** One node per component; loss constant over a step.
- **Validity:** Slow thermal transients (seconds and longer).
- **Numerical method:** Exact exponential update: unconditionally stable.
- **Depends on:** WPT-LOSS-001, WPT-LOSS-002
- **Known limitations:** No spatial gradients or hot spots; foreign-object heating coefficient is illustrative and uncalibrated.
- **Verification checks:** A08

## WPT-BAT-001 · Battery pack equivalent circuit (v1.0.0)

First-order Thevenin model with SOC-dependent OCV, Arrhenius resistance, CC–CV acceptance and temperature derating.

- **Domain:** Battery behaviour · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/battery.ts`
- **Equations:**
  - `V_t = OCV(SOC) + I·R0(T) + V1`
  - `dV1/dt = −V1/τ1 + I·R1/τ1`
  - `dSOC/dt = η_c·I / (3600·Q)`
  - `R0(T) = R0,25·exp(θ(1/T − 1/298.15))`
  - `I_CV = (V_max − OCV − V1·e^(−Δt/τ)) / (R0 + R1(1 − e^(−Δt/τ)))`
- **Inputs:** I — Terminal current (+ charging) [A]; T — Pack temperature [°C]; Q — Capacity [Ah]
- **Outputs:** SOC — State of charge [1]; V_t — Terminal voltage [V]; P_accept — Accepted power [W]
- **Assumptions:** Representative NMC OCV curve and derating table (illustrative). Lumped thermal node.
- **Validity:** SOC 0–100 %, −20 to 55 °C, currents up to the C-rate limit.
- **Numerical method:** Exact exponential update of the RC branch for constant current over a step.
- **Depends on:** WPT-TH-001
- **Known limitations:** No ageing, hysteresis or cell imbalance. The degradation indicator is a relative stress heuristic, not a lifetime prediction.
- **Verification checks:** B03, B05, A11

## WPT-VEH-001 · Longitudinal road load (v1.0.0)

Aerodynamic, rolling, grade and inertial forces; traction power at the wheels and battery; regenerative-braking limit.

- **Domain:** Vehicle motion · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/vehicle.ts · roadLoad`
- **Equations:**
  - `F_drag = ½ρC_dAv²`
  - `F_roll = C_rr·m·g·cosθ`
  - `F_grade = m·g·sinθ`
  - `F_inertia = k_r·m·a`
  - `P_wheel = F_total·v`
  - `P_elec = P_wheel/η_d + P_aux  (motoring)`
  - `P_elec = −min(−P_wheel·η_r, P_regen,max) + P_aux  (braking)`
- **Inputs:** v — Speed [m/s]; a — Acceleration [m/s²]; θ — Gradient [rad]; m — Mass [kg]
- **Outputs:** P_elec — Battery-side traction power [W]
- **Assumptions:** Constant drivetrain efficiencies.
- **Validity:** Paved roads, speeds 0–40 m/s.
- **Numerical method:** Closed form.
- **Depends on:** —
- **Known limitations:** No efficiency maps, wind or tyre slip.
- **Verification checks:** B06

## WPT-SYS-001 · End-to-end stationary power chain (v1.0.0)

Backward solution from battery power to grid power through every stage, with ratings and the largest feasible power.

- **Domain:** System energy accounting · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/chain.ts · solveChain, maxFeasible`
- **Equations:**
  - `P_grid = P_bat + Σ P_loss,i  (exact closure)`
  - `V1 = (2√2/π)·V_dc·sin(α/2)`
  - `R_L = (8/π²)·V_dc2 / I_dc2`
  - `I_dc = (2√2/π)·I2`
- **Inputs:** P_bat — Requested battery power [W]; limits — Ratings (V, A, W) [SI]
- **Outputs:** P_stage — Power at every stage [W]; α — Inverter conduction angle [rad]; η_end — Grid-to-battery efficiency [1]
- **Assumptions:** Quasi-static averaged operation; the vehicle runs the link near its maximum-efficiency load.
- **Validity:** Steady operation; transients handled separately by the protection check.
- **Numerical method:** Stage-by-stage algebra; bisection for the largest feasible power.
- **Depends on:** WPT-CIR-001, WPT-LOSS-001, WPT-LOSS-002, WPT-LOSS-003
- **Known limitations:** Stored-energy changes in the DC links and resonant tanks are neglected.
- **Verification checks:** A05, B01, B02, B04

## WPT-CTRL-001 · Charging state machine with safety precedence (v1.0.0)

Nineteen normal phases and thirteen abnormal states; safety conditions are evaluated first, in fixed precedence, every step.

- **Domain:** Charging state machines · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/stateMachine.ts`
- **Equations:**
  - `next = safety(phase, inputs) ?? normal(phase, inputs)`
- **Inputs:** inputs — Sensor states, link status, faults [—]
- **Outputs:** phase — Operating state [—]
- **Assumptions:** A safety trip removes power within one step (not ramped).
- **Validity:** Simulation of station logic; not certified control software.
- **Numerical method:** Deterministic finite-state machine.
- **Depends on:** —
- **Known limitations:** Response times are step-quantised (50 ms interactive).
- **Verification checks:** B08, B09, B12

## WPT-SIM-001 · Smart wireless charging station simulation (v1.0.0)

Arrival, state machine, power chain, battery, thermal, sensors and messages for one parking bay, on a deterministic fixed-step clock.

- **Domain:** Integrated simulation · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/station.ts · stepStation, runStationSession`
- **Equations:**
  - `Multirate: control/power every Δt (50 ms); sensors and messages on their own schedules; thermal and battery integrated exactly per step`
- **Inputs:** StationInputs — Geometry, electrical, battery, grid, control [SI]
- **Outputs:** state — Full simulation state and energy ledger [SI]
- **Assumptions:** As the component models.
- **Validity:** As the component models.
- **Numerical method:** Fixed-step deterministic integration; seeded noise.
- **Depends on:** WPT-SYS-001, WPT-CTRL-001, WPT-BAT-001, WPT-TH-001, WPT-IOT-001, WPT-DATA-001
- **Known limitations:** Single bay; one vehicle per session.
- **Verification checks:** B02, B05, B09, B10, A12

## WPT-SIM-002 · Dynamic road charging simulation (v1.0.0)

Segmented road pads, position-dependent coupling, delayed noisy position estimate, segment interlock, traction and battery energy balance.

- **Domain:** Dynamic wireless charging · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/dynamic.ts · stepRoad, runDrive`
- **Equations:**
  - `V_oc = ω·Σ M_j(x)·I_j`
  - `P = V_oc²·R_L/(R2 + R_L)²  (R_L chosen for the power the vehicle can use)`
  - `P_j = I_j²R1 + ω²·M_j·I_j·ΣM_k·I_k/(R2 + R_L)`
  - `ΔE_bat = ∫(P_rx − P_traction)dt − battery losses`
  - `motional/transformer EMF = v·|dM/dx| / (ω·M)`
- **Inputs:** RoadInputs — Speed, geometry, coverage, control [SI]
- **Outputs:** P_rx(x) — Received power along the road [W]; SOC(x) — State of charge [1]; E/km — Energy per kilometre [J/m]
- **Assumptions:** Circular road pads; quasi-static FHA (motional EMF checked each step). Regulated primary current per energised segment.
- **Validity:** Speeds where v·dM/dx ≪ ωM (always true at 79–90 kHz for road speeds).
- **Numerical method:** 1 ms fixed step; tabulated M(ρ) with linear interpolation.
- **Depends on:** WPT-EM-001, WPT-VEH-001, WPT-BAT-001
- **Known limitations:** One vehicle; no traffic interaction; rectangular/DD road coils not modelled yet.
- **Verification checks:** B06, B07, B08, B11, A13

## WPT-AV-001 · Kinematic bicycle and pure-pursuit parking (v1.0.0)

Forward-parking path (aisle, quarter turn, straight), pure-pursuit steering with actuator lag, speed control.

- **Domain:** Autonomous navigation · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/autonomous.ts · stepParking`
- **Equations:**
  - `ẋ = v·cosψ,  ẏ = v·sinψ,  ψ̇ = v·tanδ / L`
  - `δ = atan(2L·sinα / l_d)`
- **Inputs:** path — Planned path [m]; l_d — Look-ahead [m]
- **Outputs:** pose — True pose [m, rad]; e — Final alignment error [m]
- **Assumptions:** No tyre slip; flat ground.
- **Validity:** Parking speeds below 3 m/s.
- **Numerical method:** Explicit Euler at 20 ms.
- **Depends on:** WPT-AV-002, WPT-EM-001
- **Known limitations:** Forward parking only; no obstacles or other vehicles.
- **Verification checks:** B13

## WPT-AV-002 · Extended Kalman filter localisation (v1.0.0)

Pose EKF fusing odometry with UWB fixes (noisy, delayed, optionally latency-compensated) and pad-relative positioning near the bay.

- **Domain:** State estimation · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/autonomous.ts · ekfPositionUpdate`
- **Equations:**
  - `x̂⁻ = f(x̂, u),  P⁻ = F·P·Fᵀ + Q`
  - `K = P⁻Hᵀ(HP⁻Hᵀ + R)⁻¹`
  - `x̂ = x̂⁻ + K(z − Hx̂⁻),  P = (I − KH)P⁻`
- **Inputs:** σ_UWB — Fix noise [m]; τ — Measurement delay [s]; b_g — Gyro bias [rad/s]
- **Outputs:** x̂ — Estimated pose [m, rad]; P — Covariance [m², rad²]
- **Assumptions:** Gaussian noise; constant gyro bias (not estimated).
- **Validity:** Parking manoeuvres.
- **Numerical method:** Discrete EKF.
- **Depends on:** —
- **Known limitations:** Latency compensation by odometry displacement, not a full delayed-state filter.
- **Verification checks:** B13

## WPT-AV-003 · Charging-station selection (v1.0.0)

Ranks stations by money plus time value, rejecting incompatible, unreachable or insufficient options with a reason.

- **Domain:** Energy-aware mission planning · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/autonomous.ts · rankStations`
- **Equations:**
  - `E_arrive = E_now − d·c`
  - `E_charge = E_mission + E_detour + E_reserve − E_arrive`
  - `J = cost + λ·(t_drive + t_wait + t_charge)`
- **Inputs:** SOC — State of charge [1]; c — Consumption [kWh/km]; λ — Value of time [currency/min]
- **Outputs:** ranking — Ordered stations with reasons [—]
- **Assumptions:** Static availability and queue estimates.
- **Validity:** Urban trip planning.
- **Numerical method:** Deterministic scoring.
- **Depends on:** —
- **Known limitations:** No live availability feed; no stochastic travel times.
- **Verification checks:** B14

## WPT-GRID-001 · District energy dispatch (v1.0.0)

24 h at 5 min: PV, BESS, grid limit, base load, road demand, parked EVs with arrivals and queues, under five allocation policies.

- **Domain:** Energy infrastructure · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/infrastructure.ts · simulateDay`
- **Equations:**
  - `PV_used + P_import + P_dis = P_base + P_road + P_EV,in + P_ch  (every step)`
  - `E_EV,delivered = η_charger·∫P_EV,in dt`
- **Inputs:** GridInputs — Capacities, limits, tariffs, policy, seed [kW, kWh]
- **Outputs:** totals — Energy, cost, peak, renewable share, unmet demand [kWh, currency]
- **Assumptions:** Clear-sky PV shape with stochastic cloud; Poisson arrivals; fixed charger efficiency.
- **Validity:** Planning-level studies.
- **Numerical method:** Discrete-time dispatch.
- **Depends on:** WPT-SYS-001
- **Known limitations:** No network power flow or voltage limits; no forecasting error model.
- **Verification checks:** B15

## WPT-IOT-001 · Communication network (v1.0.0)

Seeded links with latency, jitter, loss, duplication, outage and key errors; receiver checks for duplicates, order, freshness and authentication tags.

- **Domain:** IoT communication · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/network.ts · Bus`
- **Equations:**
  - `t_arrive = t_send + max(0.2·τ, τ + σ·N(0,1))`
  - `stale ⇔ t_arrive − t_send > T_fresh`
- **Inputs:** link — Latency, jitter, loss, duplication [s, 1]
- **Outputs:** log — Delivered messages with status [—]
- **Assumptions:** Independent losses per message.
- **Validity:** Teaching and logic testing.
- **Numerical method:** Event queue, seeded random numbers.
- **Depends on:** —
- **Known limitations:** The message dictionary and tag are this simulator's own: not a standard protocol, not an OEM database, not cryptography.
- **Verification checks:** B09, B16

## WPT-DATA-001 · Sensor and telemetry model (v1.0.0)

Instrument errors, ADC quantisation, calibration, quality checks, freshness and data-mode labelling for every telemetry value.

- **Domain:** Data and telemetry · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/sensors.ts · SensorBank`
- **Equations:**
  - `counts = round((x·(1+ε_g) + b + n − x_min)/LSB)`
  - `x̂ = (x_min + counts·LSB)·g_cal + b_cal`
  - `U ≈ 2·√(σ² + LSB²/12 + |ε_g·x + b|²)`
- **Inputs:** x — True value [unit]; σ, ε_g, b — Noise, gain error, offset [unit]
- **Outputs:** reading — Raw counts, engineering value, quality, mode [—]
- **Assumptions:** Independent Gaussian noise; linear calibration.
- **Validity:** Within the ADC range.
- **Numerical method:** Sampled at each sensor's own rate.
- **Depends on:** —
- **Known limitations:** No drift or temperature coefficients; no hardware connected (never LIVE).
- **Verification checks:** B16

## SP-MATH-001 · Vehicle arrival process (v1.0.0)

Arrivals as a Poisson baseline, a time-dependent Poisson process (commuter, retail or imported hourly profile) generated by thinning, and the vehicle mix drawn from the synthetic registry.

- **Domain:** Smart parking · demand · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/queueing.ts · arrivals`
- **Equations:**
  - `λ(t) = λ̄ · s(h(t)) / mean(s)`
  - `Thinning: candidate gaps ~ Exp(λ_max), accept with probability λ(t)/λ_max`
  - `Stay ~ Lognormal(μ, σ²), σ² = ln(1 + CV²), CV = 0.8`
- **Inputs:** λ̄ — Mean arrival rate [1/s]; s(h) — Hourly profile (built-in or imported) [1]; 1/μ — Mean stay [s]
- **Outputs:** tᵢ — Arrival times [s]; stay — Planned stays [s]
- **Assumptions:** Arrivals independent given the rate (non-homogeneous Poisson). Built-in profiles are illustrative; real profiles must be imported or measured.
- **Validity:** Single-entry facility; rates from 0 to several hundred per hour.
- **Numerical method:** Lewis–Shedler thinning with a seeded generator.
- **Depends on:** —
- **Known limitations:** Real arrivals cluster (events, weather) and are not Poisson; that is why imported profiles and the DES exist. No booking-driven arrivals beyond reservations.
- **Verification checks:** SP-A03

## SP-MATH-002 · Finite-capacity parking queue (v1.0.0)

Erlang B for the loss system, M/M/c/K for a facility with a finite entry queue, and a discrete-event simulation that checks them and extends them to skewed stays, time-varying arrivals and abandonment.

- **Domain:** Smart parking · queueing · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/smart-parking/queueing.ts · erlangB, mmck, runDes`
- **Equations:**
  - `B(0) = 1,  B(k) = a·B(k−1) / (k + a·B(k−1)),  a = λ/μ`
  - `pₙ ∝ aⁿ/n! (n ≤ c),  pₙ ∝ aᶜ/c! · (a/c)ⁿ⁻ᶜ (c < n ≤ K)`
  - `P_block = p_K,  L = Σ n pₙ,  W = L / (λ(1 − p_K))  (Little)`
- **Inputs:** λ — Arrival rate [1/s]; μ — Departure rate per bay [1/s]; c — Bays [1]; K — Bays plus waiting places [1]
- **Outputs:** P_block — Blocking probability [1]; L, Lq — Mean in system, waiting [1]; W, Wq — Mean times [s]; ρ — Utilisation [1]
- **Assumptions:** Analytical forms: Poisson arrivals, exponential stays (Erlang B holds for any stay distribution). DES: first-come first-served, one gate.
- **Validity:** Steady state; the DES also covers transients and non-exponential stays.
- **Numerical method:** Closed forms; event-driven simulation with warm-up removal.
- **Depends on:** SP-MATH-001
- **Known limitations:** No balking model beyond queue capacity and exponential patience. No spatial search in the analytical forms.
- **Verification checks:** SP-A01, SP-A02, SP-A03

## SP-MATH-003 · Bay occupancy estimation and sensor fusion (v1.0.0)

Ultrasonic, infrared and camera detectors with declared error models; node-side debounce and hysteresis; gateway fusion as independent binary detectors in log-odds; disagreement and staleness make a bay uncertain rather than assigned.

- **Domain:** Smart parking · sensing · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/occupancy.ts · fuse`
- **Equations:**
  - `L = ln(π/(1−π)) + Σᵢ [zᵢ ln(P_D,i/P_FA,i) + (1−zᵢ) ln((1−P_D,i)/(1−P_FA,i))]`
  - `p = 1/(1 + e^(−L)); occupied if p ≥ 0.95, vacant if p ≤ 0.05, else hold`
  - `Node state changes after N = 3 agreeing samples (2 Hz)`
- **Inputs:** zᵢ — Debounced detector states [bool]; P_D, P_FA — Detection and false-alarm rates [1]; T_fresh — Freshness limit [s]
- **Outputs:** p — Posterior occupancy probability [1]; state — Occupied, vacant or uncertain [—]
- **Assumptions:** Detectors independent given the true state. Declared rates, to be measured on the POC test set.
- **Validity:** One vehicle per bay; detectors aimed as installed.
- **Numerical method:** Closed-form Bayesian fusion; majority, priority and single-sensor strategies for comparison.
- **Depends on:** SP-IOT-001
- **Known limitations:** A weighted rule with stated rates, not a trained model. Correlated failures (a shared power supply, a dirty lens) are not modelled.
- **Verification checks:** SP-A08, SP-B06, SP-B18, SP-B20

## SP-MATH-004 · Constrained multi-objective slot allocation (v1.0.0)

Hard constraints (availability, fit, reservation, accessibility, wireless compatibility, facility safety) then a policy: first available, nearest, reservation priority, charging-aware or a normalised weighted cost; deterministic tie-breaking and an atomic compare-and-set reservation.

- **Domain:** Smart parking · optimisation · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/allocation.ts · allocate, commitReservation`
- **Equations:**
  - `J(b) = Σₖ wₖ · (xₖ(b) − min xₖ)/(max xₖ − min xₖ),  k ∈ {travel, walk, charging delay, congestion, energy}`
  - `b* = argmin_{b ∈ eligible} J(b), ties → lowest index`
  - `commit(b) ⇔ version(b) unchanged since read`
- **Inputs:** bays — Bay states and versions [—]; w — Weights [1]; vehicle — Class, powertrain, receiver, permit, reservation [—]
- **Outputs:** b* — Allocated bay or none [—]; J — Cost of each eligible bay [1]
- **Assumptions:** Distances along the representative layout; charging delay from the site's charger allowance.
- **Validity:** Any number of bays (checked to 1 000 in the scalability study).
- **Numerical method:** Enumeration over eligible bays (O(n)).
- **Depends on:** SP-MATH-003
- **Known limitations:** Greedy per arrival: no look-ahead over future arrivals. Weights are configuration, not fitted preferences.
- **Verification checks:** SP-B03, SP-B04, SP-B05, SP-B26

## SP-MATH-005 · Facility vehicle motion (v1.0.0)

Lane-following and nose-in parking paths for the rear axle of a kinematic bicycle (straights and arcs within the steering limit), reverse exit retracing the entry arc, a speed profile with comfort limits, and a lane-zone mutex with a reserved reverse sweep.

- **Domain:** Smart parking · kinematics · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/layout.ts · entryPath, exitPaths; facility.ts · moveVehicle`
- **Equations:**
  - `δ = atan(L / R),  R ≥ L / tan δ_max`
  - `v ≤ √(v_max,j² + 2 a_d (s_j − s)),  v ≤ √(2 a_d d_stop)`
  - `wheel angle φ += Δs / r_w`
- **Inputs:** R — Turn radius [m]; L — Wheelbase [m]; a_d — Comfort deceleration [m/s²]
- **Outputs:** pose — Rear-axle position and heading [m, rad]; δ — Front-wheel angle [rad]
- **Assumptions:** Low speed, no tyre slip; drivers follow the path exactly (the guided case).
- **Validity:** Below 6 m/s inside the facility.
- **Numerical method:** Pre-sampled paths (0.1 m); fixed 0.1 s steps; atomic lane-zone claims.
- **Depends on:** WPT-AV-001
- **Known limitations:** No collision avoidance beyond lane zones: not an autonomous-driving claim. Swept paths near neighbouring bays are representative, not checked against body corners.
- **Verification checks:** SP-B23

## SP-MATH-006 · Parking and charging demand forecast baselines (v1.0.0)

Seasonal naïve, moving-average and exponentially smoothed hourly profiles per day type, scored on held-out days with a rolling origin. A learned model is planned only once real data exists.

- **Domain:** Smart parking · forecasting · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/forecast.ts`
- **Equations:**
  - `ŷ_d,h = y_d′,h (last same-type day)`
  - `ŷ_d,h = (1/n) Σ y_d−k,h`
  - `ℓ ← α y + (1 − α) ℓ,  α = 0.3`
  - `MAE = mean|ŷ − y|,  RMSE = √mean(ŷ − y)²`
- **Inputs:** y — Hourly occupied bays or charging starts [1]
- **Outputs:** ŷ — Forecast [1]; MAE, RMSE — Errors [1]
- **Assumptions:** Synthetic history from the facility's own models until data exists.
- **Validity:** Day-ahead, hourly.
- **Numerical method:** Closed form.
- **Depends on:** SP-MATH-001
- **Known limitations:** No holidays, weather or events; no machine-learning model (planned, needs data).
- **Verification checks:** SP-A10

## SP-MATH-007 · Shelter environment and local safety control (v1.0.0)

One lumped thermal node for the shelter air, humidity relaxation, well-mixed CO and simulated smoke and gas, daylight under the canopy, and the local safety controller (ventilation, alarm, lighting).

- **Domain:** Smart parking · environment · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/smart-parking/environment.ts · stepEnv`
- **Equations:**
  - `C_th dT/dt = α G A f + Q_eq − ṁc_p(T − T_a) − UA(T − T_a)`
  - `T(t+Δt) = T∞ + (T − T∞) e^(−Δt/τ),  τ = C_th/(UA + ṁc_p)`
  - `V dc/dt = G_src − Q (c − c_a)`
- **Inputs:** G — Irradiance [W/m²]; T_a — Ambient [°C]; Q — Airflow [m³/s]; Q_eq — Equipment heat [W]
- **Outputs:** T — Shelter air temperature [°C]; c — CO, smoke, gas [ppm]; duty — Fan duty [1]
- **Assumptions:** Well-mixed air; declared coefficients (C_th, UA, gain) to be calibrated. Smoke and gas are simulated sources only.
- **Validity:** Open-sided canopy, steady winds; not a fire or dispersion model.
- **Numerical method:** Exact exponential step over each 0.1 s step.
- **Depends on:** WPT-GRID-001
- **Known limitations:** Prototype smoke and gas sensors are not certified life-safety equipment. No stratification or wind-driven plumes.
- **Verification checks:** SP-A04, SP-B10, SP-B09

## SP-MATH-008 · Canopy photovoltaic generation (v1.0.0)

PV power from irradiance with a NOCT cell-temperature model and a temperature coefficient; irradiance follows the district model's daily shape, reduced by cloud and rain.

- **Domain:** Smart parking · solar · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/smart-parking/energy.ts · pvPower`
- **Equations:**
  - `P_PV = G · A · η · (1 − γ (T_cell − 25 °C)) · k_derate`
  - `T_cell = T_a + (NOCT − 20)/800 · G`
- **Inputs:** G — Irradiance [W/m²]; A — Panel area [m²]; η — Module efficiency [1]; γ — Temperature coefficient [1/K]
- **Outputs:** P_PV — PV power [W]; T_cell — Cell temperature [°C]
- **Assumptions:** Horizontal irradiance on a near-horizontal canopy; no shading map.
- **Validity:** Daylight hours; module data-sheet ranges.
- **Numerical method:** Closed form.
- **Depends on:** WPT-GRID-001
- **Known limitations:** No angle-of-incidence, spectral or inverter clipping model.
- **Verification checks:** SP-A05

## SP-MATH-009 · Facility energy accounting and dispatch (v1.0.0)

Essential, comfort and charging loads served by PV, storage and the grid under its import limit; storage reserve for essential loads; charging power allocated to chargers before they step; unmet demand recorded apart from served power.

- **Domain:** Smart parking · energy · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/energy.ts · dispatch, shareCharging`
- **Equations:**
  - `P_grid + P_PV,used + P_dis = P_ess + P_comf + P_chg + P_ch`
  - `E_store += (η_c P_ch − P_dis/η_d) Δt`
  - `P_chg,i ≤ share_i(B),  B = P_PV + P_grid,max + P_store,avail − P_ess − P_comf`
- **Inputs:** P — Requested loads [W]; P_grid,max — Import limit [W]; E_max — Storage capacity [J]
- **Outputs:** P_grid — Grid import [W]; SOC — Storage state [1]; unmet — Unserved demand [W]
- **Assumptions:** Aggregate power balance at the facility bus; converter losses at the storage only.
- **Validity:** Single connection point.
- **Numerical method:** Priority dispatch every 0.1 s step.
- **Depends on:** SP-MATH-008, WPT-SIM-001, WPT-GRID-001
- **Known limitations:** Not a network power-flow study; no voltage, reactive power or harmonics.
- **Verification checks:** SP-A06

## SP-MATH-010 · Parking and charging billing (v1.0.0)

Two ledgers in integer minor units: parking by started blocks after a grace period with a daily cap, reservation fee, discounts and tax; charging by metered energy (grid-side or vehicle-side boundary) times the energy tariff.

- **Domain:** Smart parking · billing · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/smart-parking/billing.ts`
- **Equations:**
  - `minutes = ⌈t/60⌉,  base = first + ⌈(minutes − first)/block⌉ · rate (beyond grace), capped per day`
  - `C_chg = round_half_up(Wh · price_per_kWh / 1000)`
  - `total = round(net + tax) to the configured unit`
- **Inputs:** t — Parking duration [s]; E — Metered energy [Wh]; tariff — Configured tariff [minor units]
- **Outputs:** bill — Parking and charging totals [minor units]
- **Assumptions:** Illustrative tariffs and placeholder tax rates; no jurisdiction's rules are claimed.
- **Validity:** Integer arithmetic below 2⁵³ minor units.
- **Numerical method:** Exact integer arithmetic with explicit rounding.
- **Depends on:** WPT-SIM-001
- **Known limitations:** No real payment provider; payments are simulated.
- **Verification checks:** SP-A07, SP-B16, SP-B17

## SP-MATH-011 · Communication performance (v1.0.0)

Latency, jitter, loss and duplication on the facility LAN (the WPT-IOT-001 link model) with MQTT QoS semantics; delivered share, p95 latency, duplicates suppressed and stale share.

- **Domain:** Smart parking · IoT · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/telemetry.ts · Broker`
- **Equations:**
  - `t_arrive = t_send + max(0.2τ, τ + σ N(0,1)) (+ retransmission for QoS 1)`
  - `stale ⇔ t_now − t_device > T_fresh`
  - `p95 = nearest-rank 95th percentile`
- **Inputs:** τ, σ — Latency and jitter [s]; p_loss, p_dup — Loss and duplication [1]
- **Outputs:** p95 — 95th-percentile latency [s]; share — Delivered share [1]
- **Assumptions:** Independent per-message losses.
- **Validity:** Local network, tens to thousands of messages per second.
- **Numerical method:** Seeded event queue.
- **Depends on:** WPT-IOT-001
- **Known limitations:** No congestion collapse or broker overload model.
- **Verification checks:** SP-B19, SP-B20

## SP-MATH-012 · Sensor reliability and uncertainty propagation (v1.0.0)

Device availability from MTBF and MTTR, k-out-of-n availability of a bay's redundant detectors, and first-order propagation of detector-rate uncertainty into the fused posterior.

- **Domain:** Smart parking · reliability · **Fidelity:** F1 · **Status:** Analytically verified
- **Implementation:** `src/lib/wireless-charging/smart-parking/reliability.ts`
- **Equations:**
  - `A = MTBF / (MTBF + MTTR)`
  - `A_k/n = Σ_{j=k}^{n} C(n,j) Aʲ (1 − A)ⁿ⁻ʲ`
  - `σ_p² ≈ Σ (∂p/∂θᵢ)² σ_θᵢ²`
- **Inputs:** MTBF, MTTR — Failure and repair times [h]; σ_θ — Rate uncertainty [1]
- **Outputs:** A — Availability [1]; σ_p — Posterior uncertainty [1]
- **Assumptions:** Independent, identical devices; planning figures, not field data.
- **Validity:** Steady state.
- **Numerical method:** Closed form; Monte Carlo check; central differences.
- **Depends on:** SP-MATH-003
- **Known limitations:** No common-cause failures.
- **Verification checks:** SP-A11

## SP-SIM-001 · Smart parking facility simulation (v1.0.0)

The whole facility at 0.1 s steps: arrivals, gates and barriers, identification, allocation, motion, sensing, telemetry, fusion, sessions, charging through each bay's own Station simulation, environment, energy, billing, reservations, anomalies and audit.

- **Domain:** Smart parking · system · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/facility.ts · stepFacility`
- **Equations:**
  - `x_{k+1} = f(x_k, u_k, w_k),  Δt = 0.1 s; separate seeded generators per subsystem`
- **Inputs:** inputs — Layout, policy, demand, sensors, network, environment, energy, faults [SI]
- **Outputs:** state — Bays, sessions, vehicles, devices, ledgers, events [—]
- **Assumptions:** Every model's own assumptions.
- **Validity:** Six to several hundred bays in the 3D scene; thousands in the event-level studies.
- **Numerical method:** Fixed-step, deterministic; the Station simulations integrate at their own step.
- **Depends on:** SP-MATH-001, SP-MATH-003, SP-MATH-004, SP-MATH-005, SP-MATH-007, SP-MATH-009, SP-MATH-010, SP-INT-001
- **Known limitations:** Everything is SIMULATED: no hardware is connected.
- **Verification checks:** SP-B21, SP-B22, SP-B23

## SP-CTRL-001 · Parking session state machine (v1.0.0)

Twenty-five normal lifecycle states and twenty-two exceptional states with an explicit transition table, guards, timers and recovery; refused transitions are logged, never applied.

- **Domain:** Smart parking · control · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/lifecycle.ts`
- **Equations:**
  - `s_{k+1} = s_k → s′ only if s′ ∈ T(s_k) and guard(s_k, s′) holds`
- **Inputs:** events — Detections, recognitions, allocations, sensor states, barrier positions, station phases [—]
- **Outputs:** state — Session state and history [—]
- **Assumptions:** One session per detection event.
- **Validity:** All sessions of one facility.
- **Numerical method:** Table-driven finite-state machine.
- **Depends on:** SP-SIM-001
- **Known limitations:** Operator decisions are inputs; no operator model.
- **Verification checks:** SP-B01, SP-B25, SP-B26

## SP-CTRL-002 · Barrier controller and interlock (v1.0.0)

Boom position with a rate limit, presence and obstruction detection, clear-zone verification, an interlock that refuses or reverses closing whatever the command source, and safe egress when the gateway or cloud is lost or an alarm is active.

- **Domain:** Smart parking · safety · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/barrier.ts`
- **Equations:**
  - `θ_{k+1} = θ_k + sgn(θ* − θ_k) · min(|θ* − θ_k|, ω Δt)`
  - `close refused ⇔ obstructed ∨ ¬clear ∨ egress`
- **Inputs:** θ* — Commanded angle [rad]; obstructed, clear — Detector states [bool]
- **Outputs:** θ — Boom angle [rad]; accepted — Command outcome [bool]
- **Assumptions:** Detectors work (their failure is a separate maintenance case).
- **Validity:** Low-force miniature barrier in the POC.
- **Numerical method:** Local controller logic each step.
- **Depends on:** —
- **Known limitations:** No motor current-based obstruction sensing; no full-scale machinery.
- **Verification checks:** SP-B07, SP-B09, SP-B24

## SP-AI-001 · Vehicle identification (simulated recognition) (v1.0.0)

The recognition pipeline as stage latencies and a declared error model (light, rain, obstruction, camera fault) with overlapping confidence distributions; regional plate-format validation; the access rule that never authorises an uncertain read on its own.

- **Domain:** Smart parking · computer vision · **Fidelity:** F0 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/identification.ts`
- **Equations:**
  - `P(correct) = P₀ · f_light · f_rain · f_obstruction`
  - `accept ⇔ confidence ≥ τ_accept ∧ format valid ∧ on the access list`
- **Inputs:** lux — Illuminance at the gate [lux]; τ — Thresholds [1]
- **Outputs:** read — Plate as read [—]; confidence — Confidence [1]
- **Assumptions:** SIMULATED: no image and no inference model in the web application.
- **Validity:** Synthetic plates of the configured region only.
- **Numerical method:** Seeded Monte Carlo.
- **Depends on:** —
- **Known limitations:** Accuracy figures are assumptions until a labelled POC dataset is evaluated. No production-quality recognition is claimed for any country.
- **Verification checks:** SP-B02

## SP-AI-003 · Anomaly detection (rules and robust statistics) (v1.0.0)

Sensor disagreement, unexpected or missing occupancy, stuck sensors, silent or flooding devices, stale data and unusual stays (median and MAD).

- **Domain:** Smart parking · data intelligence · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/facility.ts · anomalies; forecast.ts · robustZ`
- **Equations:**
  - `z = (x − median) / (1.4826 · MAD),  flag if z > 3.5`
- **Inputs:** x — Stays, rates, readings [SI]
- **Outputs:** anomalies — Flags with scores [—]
- **Assumptions:** Robust statistics on recent history; rules as stated.
- **Validity:** Enough history (≥ 8 stays) for the statistical rule.
- **Numerical method:** Every 5 s on the gateway.
- **Depends on:** SP-MATH-003
- **Known limitations:** Not a trained model; never the sole authority for safety.
- **Verification checks:** SP-A12, SP-B06

## SP-IOT-001 · MQTT communication model (v1.0.0)

Versioned topic namespace, telemetry schema, broker with device identity, TLS requirement, topic ACLs, retained status and last will; gateway ingestion with idempotency, ordering, freshness and rate limits; commands with role, expiry, integrity tag and acknowledgement.

- **Domain:** Smart parking · IoT · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/telemetry.ts`
- **Equations:**
  - `evengineer/v1/sites/{site}/devices/{device}/{telemetry|status|commands|ack}`
  - `accept ⇔ tag ok ∧ schema ok ∧ eventId unseen ∧ seq > last ∧ fresh`
- **Inputs:** messages — Device publications and commands [—]
- **Outputs:** verdicts — Accepted, duplicate, out-of-order, stale, invalid [—]
- **Assumptions:** The tag is this simulator's check, not cryptography; devices use TLS client certificates.
- **Validity:** Simulation and recorded replay; no broker is contacted.
- **Numerical method:** Seeded broker and deterministic ingestion.
- **Depends on:** WPT-IOT-001
- **Known limitations:** No real broker, certificates or secret storage in the web application.
- **Verification checks:** SP-B08, SP-B19, SP-B20

## SP-INT-001 · Parking ↔ wireless charging session adapter (v1.0.0)

Seven parking-side eligibility checks, hand-over of a parked vehicle to its bay's own Station simulation (WPT-SIM-001), monitoring, a safe stop before departure, and hand-back of the final SOC once.

- **Domain:** Smart parking · integration · **Fidelity:** F2 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/charging.ts`
- **Equations:**
  - `eligible ⇔ occupancy ∧ compatible ∧ transmitter ∧ authorised ∧ |Δy| ≤ tol ∧ |Δx| ≤ tol ∧ SOC < target ∧ safe`
  - `SOC_parking ← SOC_station only at hand-back`
- **Inputs:** vehicle, bay, alignment — Parked vehicle and its receiver offset [m]
- **Outputs:** charging session — Identity chain and energy [J]
- **Assumptions:** One Station simulation per wireless bay (isolated batteries and ledgers).
- **Validity:** Any number of wireless bays (cost grows with active chargers).
- **Numerical method:** Command interface to the existing Station state machine.
- **Depends on:** WPT-SIM-001, WPT-CTRL-001, WPT-BAT-001
- **Known limitations:** The Station's own alignment check sees the parking alignment as fixed for the session.
- **Verification checks:** SP-B11, SP-B12, SP-B13, SP-B14, SP-B15

## SP-RES-001 · Event-level research simulation (v1.0.0)

Policy, demand and baseline comparisons with the same allocation engine and vehicle generator but no vehicle motion; the manual baseline takes the first free bay a driver passes; charging time from a constant 11 kW surrogate.

- **Domain:** Smart parking · research · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/experiments.ts`
- **Equations:**
  - `t_charge = (SOC* − SOC₀) · E / P_surrogate`
  - `search_manual = d_first free / v + one loop in four`
- **Inputs:** policy, demand — Run configuration [—]
- **Outputs:** metrics — Utilisation, wait, search time, charging served, energy [SI]
- **Assumptions:** Surrogate within 15 % of full Station sessions (check SP-A09).
- **Validity:** Hours to weeks, up to thousands of bays.
- **Numerical method:** 5 s event loop with common random numbers.
- **Depends on:** SP-MATH-004, WPT-SIM-001
- **Known limitations:** The manual-search model is a declared assumption to be replaced by observed search times.
- **Verification checks:** SP-A09

## SP-RES-002 · Replicated research comparisons (v1.0.0)

Six allocation and charging policies (manual, first available, nearest, charging-compatible, SOC-aware, energy-aware) on identical bays, chargers, PV and grid limit, with paired seeds (common random numbers), under normal and peak demand, a charging-constrained site and three fault scenarios; means, SDs, percentiles and Student-t confidence intervals, paired differences against the manual baseline, and fault recovery against the fault-free day.

- **Domain:** Smart parking · research · **Fidelity:** F1 · **Status:** Tested
- **Implementation:** `src/lib/wireless-charging/smart-parking/research.ts`
- **Equations:**
  - `x̄ ± t₀.₉₇₅,ₙ₋₁ · s / √n`
  - `Δᵢ = x_policy,i − x_manual,i (same seed i)`
  - `J = (Σ xᵢ)² / (n Σ xᵢ²) (Jain's index of energy fulfilment)`
  - `P_grid = max(0, P_base + Σ P_charge/η − P_PV), peak over 15 min`
- **Inputs:** scenario, policies, replications — Run configuration [—]
- **Outputs:** metrics — Throughput, search, waiting, utilisation, charging fulfilment, energy, peak import, solar use, fairness, revenue, fault recovery [SI]
- **Assumptions:** Constant 11 kW battery-side charging through a declared efficiency of 0.937 (check SP-A09 bounds the surrogate). The manual baseline's cruising is a declared behavioural assumption. No vehicle motion, aisle congestion or storage in the dispatch.
- **Validity:** A 12-hour day (07:00–19:00), 12 bays by default; any layout the engine builds.
- **Numerical method:** 5 s event loop; independent seeded streams for arrivals, vehicles, patience and policy-specific draws, so every policy sees the same demand.
- **Depends on:** SP-MATH-001, SP-MATH-008, SP-MATH-010, SP-RES-001
- **Known limitations:** Synthetic demand and declared behaviour: results compare policies under the stated assumptions and support no real-world performance claim.
- **Verification checks:** SP-A13, SP-A09
