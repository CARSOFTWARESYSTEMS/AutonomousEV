// The Equation Explorer. Every entry evaluates the same functions the
// simulation runs, so the worked example, the graph and the twin agree.
import { packOcv, packR0, DEFAULT_BATTERY } from "./battery";
import { optimalLoad, resonantFrequency, ssEfficiencyAtResonance } from "./circuits";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "./coils";
import { copperResistivity, skinDepth, stepThermal } from "./losses";
import { MU0, linspace } from "./math";
import { DEFAULT_VEHICLE, roadLoad } from "./vehicle";

export interface Param {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export interface Output {
  label: string;
  value: number;
  unit: string;
  digits?: number;
}

export interface Equation {
  id: string;
  title: string;
  domain: string;
  expression: string;
  interpretation: string;
  symbols: { symbol: string; meaning: string; unit: string }[];
  assumptions: string[];
  derivation: string[];
  params: Param[];
  evaluate: (p: Record<string, number>) => Output[];
  /** The swept variable and the plotted result. */
  sweep?: { key: string; label: string; unit: string; from: number; to: number; points: number; y: (p: Record<string, number>) => number; yLabel: string; yUnit: string; yScale?: number };
  limits: string[];
  validity: string;
  limitations: string[];
  checks: string[];
  model?: string;
  /** Where to see it in 3D. */
  view?: { environment: "station" | "dynamic" | "autonomous" | "infrastructure"; viewMode: string };
}

const P = (key: string, label: string, unit: string, min: number, max: number, step: number, value: number): Param => ({ key, label, unit, min, max, step, value });

export const EQUATIONS: readonly Equation[] = [
  {
    id: "ohm",
    title: "Ohm's law and Joule heating",
    domain: "Electricity",
    expression: "V = I·R      P = V·I = I²·R",
    interpretation: "Current through a resistance needs a voltage, and turns power into heat at a rate that grows with the square of the current.",
    symbols: [{ symbol: "V", meaning: "Voltage across the resistance", unit: "V" }, { symbol: "I", meaning: "Current", unit: "A" }, { symbol: "R", meaning: "Resistance", unit: "Ω" }, { symbol: "P", meaning: "Dissipated power", unit: "W" }],
    assumptions: ["Linear (ohmic) conductor", "DC or RMS quantities"],
    derivation: ["Define resistance as R = V/I for an ohmic conductor.", "Power delivered to any element is P = V·I.", "Substitute V = I·R: P = I²·R."],
    params: [P("I", "Current", "A", 0, 80, 1, 30), P("R", "Resistance", "mΩ", 1, 300, 1, 60)],
    evaluate: (p) => [
      { label: "Voltage drop", value: (p.I * p.R) / 1000, unit: "V", digits: 3 },
      { label: "Heat", value: (p.I * p.I * p.R) / 1000, unit: "W", digits: 1 },
    ],
    sweep: { key: "I", label: "Current", unit: "A", from: 0, to: 80, points: 41, y: (p) => (p.I * p.I * p.R) / 1000, yLabel: "Heat", yUnit: "W" },
    limits: ["I → 0: no loss.", "Doubling I quadruples the loss."],
    validity: "Ohmic conductors at constant temperature.",
    limitations: ["Resistance itself rises with temperature (see copper loss)."],
    checks: ["A05"],
    model: "WPT-LOSS-001",
    view: { environment: "station", viewMode: "energy" },
  },
  {
    id: "faraday",
    title: "Faraday's law: the induced EMF",
    domain: "Electromagnetic induction",
    expression: "ε = −dλ₂/dt,   λ₂ = L₂·i₂ + M(t)·i₁   ⇒   |ε_oc| = ω·M·I₁ (RMS)",
    interpretation: "A changing current in the transmitter changes the flux linking the receiver, and the receiver develops a voltage proportional to frequency, mutual inductance and current.",
    symbols: [{ symbol: "ε", meaning: "Induced EMF", unit: "V" }, { symbol: "λ₂", meaning: "Receiver flux linkage", unit: "Wb" }, { symbol: "M", meaning: "Mutual inductance", unit: "H" }, { symbol: "ω", meaning: "Angular frequency 2πf", unit: "rad/s" }, { symbol: "I₁", meaning: "Transmitter current (RMS)", unit: "A" }],
    assumptions: ["Sinusoidal current", "Receiver open circuit (i₂ = 0)", "Stationary receiver (dM/dt = 0)"],
    derivation: ["λ₂ = L₂i₂ + M·i₁.", "dλ₂/dt = L₂·di₂/dt + M·di₁/dt + i₁·dM/dt.", "Open circuit and stationary: ε = −M·di₁/dt.", "For i₁ = √2·I₁·sin ωt, |ε| = ω·M·I₁ RMS."],
    params: [P("f", "Frequency", "kHz", 20, 150, 1, 85), P("M", "Mutual inductance", "µH", 1, 80, 1, 30), P("I1", "Transmitter current", "A", 0, 60, 1, 30)],
    evaluate: (p) => [{ label: "Open-circuit voltage", value: 2 * Math.PI * p.f * 1e3 * p.M * 1e-6 * p.I1, unit: "V RMS", digits: 1 }],
    sweep: { key: "f", label: "Frequency", unit: "kHz", from: 20, to: 150, points: 40, y: (p) => 2 * Math.PI * p.f * 1e3 * p.M * 1e-6 * p.I1, yLabel: "EMF", yUnit: "V" },
    limits: ["M → 0: no EMF.", "Doubling frequency doubles the EMF at the same current."],
    validity: "Quasi-static fields (pads ≪ wavelength, ~3.5 km at 85 kHz).",
    limitations: ["A moving receiver adds i₁·dM/dt; the Dynamic twin shows it is ~10⁻⁴ of ωM at road speeds."],
    checks: ["B01", "B07"],
    model: "WPT-EM-001",
    view: { environment: "station", viewMode: "field" },
  },
  {
    id: "coupling",
    title: "Mutual inductance and coupling coefficient",
    domain: "Magnetic coupling",
    expression: "M = Σᵢ Σⱼ M(aᵢ, bⱼ, h, ρ),   k = M / √(L₁·L₂)",
    interpretation: "The fraction of magnetic linkage the two pads share. It falls with air gap and with misalignment, and ferrite raises it.",
    symbols: [{ symbol: "M", meaning: "Mutual inductance", unit: "H" }, { symbol: "L₁, L₂", meaning: "Self-inductances", unit: "H" }, { symbol: "k", meaning: "Coupling coefficient", unit: "1" }, { symbol: "h", meaning: "Air gap", unit: "m" }, { symbol: "ρ", meaning: "Horizontal offset", unit: "m" }],
    assumptions: ["Concentric circular turns", "Ferrite as infinite planes scaled by coverage"],
    derivation: ["Neumann: M = (μ0/4π)∮∮ dl₁·dl₂ / |r₁ − r₂|.", "Integrate loop a analytically: its vector potential A_φ uses elliptic integrals.", "Integrate A_φ round loop b numerically (periodic trapezoid).", "Sum over every pair of turns and every ferrite image."],
    params: [P("gap", "Air gap", "mm", 60, 300, 5, 150), P("lat", "Lateral offset", "mm", 0, 300, 10, 0)],
    evaluate: (p) => {
      const r = computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: p.gap / 1000, lateral: p.lat / 1000, longitudinal: 0 });
      return [
        { label: "L₁", value: r.L1 * 1e6, unit: "µH", digits: 1 },
        { label: "L₂", value: r.L2 * 1e6, unit: "µH", digits: 1 },
        { label: "M", value: r.M * 1e6, unit: "µH", digits: 2 },
        { label: "k", value: r.k, unit: "", digits: 3 },
        { label: "k (air core)", value: r.airCore.k, unit: "", digits: 3 },
      ];
    },
    sweep: { key: "gap", label: "Air gap", unit: "mm", from: 60, to: 300, points: 25, y: (p) => computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: p.gap / 1000, lateral: p.lat / 1000, longitudinal: 0 }).k, yLabel: "k", yUnit: "" },
    limits: ["h → ∞: M → μ0πa²b²/(2h³) per turn pair (dipole limit).", "Large offsets: M changes sign (the null of circular pads)."],
    validity: "Gaps 50–300 mm; offsets up to one pad diameter.",
    limitations: ["Finite ferrite and shields need FEM or measurement."],
    checks: ["A02", "A03", "A09"],
    model: "WPT-EM-001",
    view: { environment: "station", viewMode: "field" },
  },
  {
    id: "resonance",
    title: "Resonant frequency",
    domain: "Resonance",
    expression: "f₀ = 1 / (2π·√(L·C))",
    interpretation: "The frequency at which a coil's inductive reactance and a capacitor's reactance cancel, so the tank looks purely resistive.",
    symbols: [{ symbol: "f₀", meaning: "Resonant frequency", unit: "Hz" }, { symbol: "L", meaning: "Inductance", unit: "H" }, { symbol: "C", meaning: "Capacitance", unit: "F" }],
    assumptions: ["Ideal, linear L and C"],
    derivation: ["Series reactance X = ωL − 1/(ωC).", "Set X = 0: ω₀² = 1/(LC).", "f₀ = ω₀/2π."],
    params: [P("L", "Inductance", "µH", 20, 300, 1, 100), P("C", "Capacitance", "nF", 5, 200, 0.5, 35)],
    evaluate: (p) => [{ label: "f₀", value: resonantFrequency(p.L * 1e-6, p.C * 1e-9) / 1000, unit: "kHz", digits: 2 }],
    sweep: { key: "C", label: "Capacitance", unit: "nF", from: 5, to: 200, points: 40, y: (p) => resonantFrequency(p.L * 1e-6, p.C * 1e-9) / 1000, yLabel: "f₀", yUnit: "kHz" },
    limits: ["Quadrupling C halves f₀."],
    validity: "Lumped components.",
    limitations: ["Real capacitors drift with temperature; coil L changes with gap (detuning)."],
    checks: ["A07"],
    model: "WPT-CIR-001",
    view: { environment: "station", viewMode: "engineering" },
  },
  {
    id: "q-factor",
    title: "Quality factor",
    domain: "Resonance",
    expression: "Q = ω·L / R",
    interpretation: "How much reactive energy a coil stores per unit of energy it loses each cycle. High Q makes weak coupling usable.",
    symbols: [{ symbol: "Q", meaning: "Quality factor", unit: "1" }, { symbol: "R", meaning: "Series resistance", unit: "Ω" }],
    assumptions: ["Series RL model of the coil"],
    derivation: ["Q = 2π·(peak stored energy)/(energy lost per cycle).", "Stored ½LI²ₚ; lost per cycle (Iₚ²R/2)·T.", "Q = ωL/R."],
    params: [P("f", "Frequency", "kHz", 20, 150, 1, 85), P("L", "Inductance", "µH", 20, 300, 1, 100), P("R", "Resistance", "mΩ", 10, 500, 5, 150)],
    evaluate: (p) => [{ label: "Q", value: (2 * Math.PI * p.f * 1e3 * p.L * 1e-6) / (p.R / 1000), unit: "", digits: 0 }],
    sweep: { key: "R", label: "Resistance", unit: "mΩ", from: 10, to: 500, points: 40, y: (p) => (2 * Math.PI * p.f * 1e3 * p.L * 1e-6) / (p.R / 1000), yLabel: "Q", yUnit: "" },
    limits: ["R → 0: Q → ∞ (lossless)."],
    validity: "Q above ~5 for the FHA to hold.",
    limitations: ["R itself depends on frequency (skin and proximity)."],
    checks: ["A06"],
    model: "WPT-CIR-001",
  },
  {
    id: "reflected",
    title: "Reflected impedance",
    domain: "Resonance",
    expression: "Z_r = (ω·M)² / (Z₂ + R_L)   (resonant secondary: real)",
    interpretation: "What the transmitter feels of the receiver and its load. A heavier load (smaller R_L) reflects a larger resistance.",
    symbols: [{ symbol: "Z_r", meaning: "Reflected impedance", unit: "Ω" }, { symbol: "R_L", meaning: "Equivalent load", unit: "Ω" }, { symbol: "Z₂", meaning: "Secondary series impedance", unit: "Ω" }],
    assumptions: ["SS compensation at resonance"],
    derivation: ["Secondary mesh: 0 = jωM·I₁ + (Z₂ + R_L)·I₂ ⇒ I₂ = −jωM·I₁/(Z₂ + R_L).", "Primary: V₁ = Z₁I₁ + jωM·I₂ = [Z₁ + (ωM)²/(Z₂ + R_L)]·I₁."],
    params: [P("f", "Frequency", "kHz", 79, 90, 0.5, 85), P("M", "Mutual inductance", "µH", 5, 60, 1, 30), P("R2", "Secondary resistance", "mΩ", 20, 400, 10, 150), P("RL", "Load", "Ω", 1, 60, 0.5, 15)],
    evaluate: (p) => [{ label: "Z_r", value: (2 * Math.PI * p.f * 1e3 * p.M * 1e-6) ** 2 / (p.R2 / 1000 + p.RL), unit: "Ω", digits: 2 }],
    sweep: { key: "RL", label: "Load", unit: "Ω", from: 1, to: 60, points: 40, y: (p) => (2 * Math.PI * p.f * 1e3 * p.M * 1e-6) ** 2 / (p.R2 / 1000 + p.RL), yLabel: "Z_r", yUnit: "Ω" },
    limits: ["M → 0: nothing reflected; the primary current is set by R₁ alone (dangerously large in SS)."],
    validity: "Resonant secondary.",
    limitations: ["Detuning makes Z_r complex."],
    checks: ["A04"],
    model: "WPT-CIR-001",
  },
  {
    id: "ss-efficiency",
    title: "Series–series link efficiency",
    domain: "Resonance",
    expression: "η = R_L·(ωM)² / [(R₂ + R_L)·((R₂ + R_L)·R₁ + (ωM)²)],   R_L,opt = √(R₂² + (ωM)²·R₂/R₁)",
    interpretation: "Coil-to-coil efficiency at resonance. It peaks at an optimum load; the vehicle's DC–DC converter holds the rectifier near it.",
    symbols: [{ symbol: "η", meaning: "Link efficiency", unit: "1" }, { symbol: "R₁, R₂", meaning: "Series resistances", unit: "Ω" }],
    assumptions: ["Resonance; FHA"],
    derivation: ["P_load = |I₂|²R_L, P_in = |I₁|²R₁ + |I₂|²(R₂ + R_L).", "Use |I₂| = ωM|I₁|/(R₂ + R_L).", "Divide, then set dη/dR_L = 0 for the optimum."],
    params: [P("k", "Coupling", "", 0.05, 0.6, 0.01, 0.3), P("Q1", "Q₁", "", 50, 900, 10, 400), P("Q2", "Q₂", "", 50, 900, 10, 350), P("RL", "Load", "Ω", 1, 60, 0.5, 15)],
    evaluate: (p) => {
      const coils = eqCoils(p);
      const opt = optimalLoad(coils, 85000);
      return [
        { label: "η at R_L", value: ssEfficiencyAtResonance(coils, 85000, p.RL) * 100, unit: "%", digits: 2 },
        { label: "R_L,opt", value: opt, unit: "Ω", digits: 2 },
        { label: "η_max", value: ssEfficiencyAtResonance(coils, 85000, opt) * 100, unit: "%", digits: 2 },
      ];
    },
    sweep: { key: "RL", label: "Load", unit: "Ω", from: 1, to: 60, points: 60, y: (p) => ssEfficiencyAtResonance(eqCoils(p), 85000, p.RL) * 100, yLabel: "η", yUnit: "%" },
    limits: ["k·Q ≫ 1: η_max ≈ 1 − 2/(k√(Q₁Q₂))."],
    validity: "Resonant SS link.",
    limitations: ["Inverter and rectifier losses are separate (see the station loss ledger)."],
    checks: ["A04", "A06"],
    model: "WPT-CIR-001",
    view: { environment: "station", viewMode: "energy" },
  },
  {
    id: "skin-depth",
    title: "Skin depth",
    domain: "Advanced electromagnetics",
    expression: "δ = √(ρ / (π·f·μ₀·μr))",
    interpretation: "How deep AC current penetrates a conductor. Litz strands thinner than δ keep the AC resistance close to the DC value.",
    symbols: [{ symbol: "δ", meaning: "Skin depth", unit: "m" }, { symbol: "ρ", meaning: "Resistivity", unit: "Ω·m" }],
    assumptions: ["Good conductor, plane-wave approximation"],
    derivation: ["Diffusion equation ∇²J = jωμσJ in a conductor.", "Solution decays as e^(−x/δ) with δ = √(2/(ωμσ))."],
    params: [P("f", "Frequency", "kHz", 1, 500, 1, 85), P("T", "Temperature", "°C", -20, 150, 5, 40)],
    evaluate: (p) => [{ label: "δ", value: skinDepth(p.f * 1e3, copperResistivity(p.T)) * 1000, unit: "mm", digits: 3 }],
    sweep: { key: "f", label: "Frequency", unit: "kHz", from: 1, to: 500, points: 50, y: (p) => skinDepth(p.f * 1e3, copperResistivity(p.T)) * 1000, yLabel: "δ", yUnit: "mm" },
    limits: ["δ ∝ 1/√f: four times the frequency halves it."],
    validity: "Conductors much thicker than δ for the 'skin' picture; strands much thinner for Litz benefit.",
    limitations: ["Proximity effect between strands is not in this formula."],
    checks: [],
    model: "WPT-LOSS-001",
  },
  {
    id: "copper-loss",
    title: "Copper loss with temperature",
    domain: "Thermal physics",
    expression: "P_Cu = I²·F_R·ρ₂₀(1 + α(T − 20))·ℓ/A",
    interpretation: "Winding loss rises with current squared and with temperature, which raises temperature further.",
    symbols: [{ symbol: "F_R", meaning: "AC resistance factor", unit: "1" }, { symbol: "α", meaning: "0.00393 1/K for copper", unit: "1/K" }, { symbol: "ℓ, A", meaning: "Conductor length and copper area", unit: "m, m²" }],
    assumptions: ["Linear resistivity near 20 °C"],
    derivation: ["R_dc = ρℓ/A; ρ(T) linear.", "R_ac = F_R·R_dc.", "P = I²R_ac."],
    params: [P("I", "Current", "A", 0, 70, 1, 30), P("T", "Winding temperature", "°C", 0, 150, 5, 60), P("FR", "AC factor", "", 1, 4, 0.1, 1.9)],
    evaluate: (p) => {
      const rdc = (copperResistivity(p.T) * 15.08) / (1600 * Math.PI * 0.00005 ** 2);
      return [
        { label: "R_dc", value: rdc * 1000, unit: "mΩ", digits: 1 },
        { label: "P_Cu", value: p.I * p.I * rdc * p.FR, unit: "W", digits: 1 },
      ];
    },
    sweep: { key: "T", label: "Temperature", unit: "°C", from: 0, to: 150, points: 31, y: (p) => (p.I * p.I * p.FR * copperResistivity(p.T) * 15.08) / (1600 * Math.PI * 0.00005 ** 2), yLabel: "P_Cu", yUnit: "W" },
    limits: ["At 120 °C copper resistance is ~39 % above its 20 °C value."],
    validity: "−50 to 200 °C.",
    limitations: ["F_R is empirical here."],
    checks: ["B04"],
    model: "WPT-LOSS-001",
    view: { environment: "station", viewMode: "thermal" },
  },
  {
    id: "thermal-rc",
    title: "First-order thermal response",
    domain: "Thermal physics",
    expression: "C·dT/dt = P − (T − T_amb)/R   ⇒   T(t) = T_amb + P·R·(1 − e^(−t/RC))",
    interpretation: "A component heats toward a steady temperature set by its loss and thermal resistance, with time constant RC.",
    symbols: [{ symbol: "C", meaning: "Heat capacity", unit: "J/K" }, { symbol: "R", meaning: "Thermal resistance to ambient", unit: "K/W" }],
    assumptions: ["Single lumped node", "Constant loss"],
    derivation: ["Energy balance on one node.", "Linear first-order ODE; integrating factor gives the exponential."],
    params: [P("Pw", "Loss", "W", 0, 400, 5, 90), P("R", "Thermal resistance", "K/W", 0.05, 1, 0.01, 0.32), P("C", "Heat capacity", "kJ/K", 0.5, 10, 0.1, 3.2), P("t", "Time", "min", 0, 120, 1, 30)],
    evaluate: (p) => {
      const node = { capacitance: p.C * 1000, resistance: p.R };
      return [
        { label: "T(t) rise", value: stepThermal(node, 0, p.Pw, 0, p.t * 60), unit: "K", digits: 1 },
        { label: "Steady rise", value: p.Pw * p.R, unit: "K", digits: 1 },
        { label: "τ", value: (p.R * p.C * 1000) / 60, unit: "min", digits: 1 },
      ];
    },
    sweep: { key: "t", label: "Time", unit: "min", from: 0, to: 120, points: 41, y: (p) => stepThermal({ capacitance: p.C * 1000, resistance: p.R }, 0, p.Pw, 0, p.t * 60), yLabel: "ΔT", yUnit: "K" },
    limits: ["t = τ: 63 % of the steady rise."],
    validity: "Slow transients.",
    limitations: ["No hot spots."],
    checks: ["A08"],
    model: "WPT-TH-001",
    view: { environment: "station", viewMode: "thermal" },
  },
  {
    id: "traction",
    title: "Vehicle traction power",
    domain: "Vehicle physics",
    expression: "P = [½ρC_dAv² + C_rr·m·g·cosθ + m·g·sinθ + k_r·m·a]·v / η_d + P_aux",
    interpretation: "The power the battery must supply to move the vehicle; drag dominates at speed.",
    symbols: [{ symbol: "C_d·A", meaning: "Drag area", unit: "m²" }, { symbol: "C_rr", meaning: "Rolling resistance", unit: "1" }, { symbol: "θ", meaning: "Gradient", unit: "rad" }, { symbol: "η_d", meaning: "Drivetrain efficiency", unit: "1" }],
    assumptions: ["Constant efficiency", "Still air"],
    derivation: ["Newton's second law along the road.", "Power = force × speed; divide by efficiency for battery power."],
    params: [P("v", "Speed", "km/h", 0, 140, 5, 80), P("grade", "Gradient", "%", -6, 8, 0.5, 0), P("m", "Mass", "kg", 1200, 3000, 50, 1950)],
    evaluate: (p) => {
      const load = roadLoad({ ...DEFAULT_VEHICLE, mass: p.m }, p.v / 3.6, 0, Math.atan(p.grade / 100));
      return [
        { label: "Drag", value: load.aero, unit: "N", digits: 0 },
        { label: "Rolling + grade", value: load.rolling + load.grade, unit: "N", digits: 0 },
        { label: "Battery power", value: load.electricalPower / 1000, unit: "kW", digits: 2 },
        { label: "Energy per km", value: p.v > 0 ? load.electricalPower / (p.v / 3.6) / 3.6 : 0, unit: "Wh/km", digits: 0 },
      ];
    },
    sweep: { key: "v", label: "Speed", unit: "km/h", from: 0, to: 140, points: 29, y: (p) => roadLoad({ ...DEFAULT_VEHICLE, mass: p.m }, p.v / 3.6, 0, Math.atan(p.grade / 100)).electricalPower / 1000, yLabel: "P", yUnit: "kW" },
    limits: ["v → 0: only the auxiliary load remains."],
    validity: "0–150 km/h on paved roads.",
    limitations: ["No efficiency maps."],
    checks: ["B11"],
    model: "WPT-VEH-001",
    view: { environment: "dynamic", viewMode: "energy" },
  },
  {
    id: "energy-balance",
    title: "Energy balance while driving",
    domain: "Vehicle physics",
    expression: "dE_bat/dx = (P̄_rx − P_traction) / v",
    interpretation: "Whether the battery gains or loses charge per kilometre depends on received power against traction demand, both per unit of distance.",
    symbols: [{ symbol: "P̄_rx", meaning: "Mean received power on the road", unit: "W" }, { symbol: "v", meaning: "Speed", unit: "m/s" }],
    assumptions: ["Steady speed; mean received power proportional to coverage"],
    derivation: ["dE/dt = P_rx − P_trac.", "Divide by v = dx/dt."],
    params: [P("v", "Speed", "km/h", 10, 140, 5, 80), P("prx", "Mean received power", "kW", 0, 30, 0.5, 13), P("m", "Mass", "kg", 1200, 3000, 50, 1950)],
    evaluate: (p) => {
      const trac = roadLoad({ ...DEFAULT_VEHICLE, mass: p.m }, p.v / 3.6, 0, 0).electricalPower;
      const net = p.prx * 1000 - trac;
      return [
        { label: "Traction", value: trac / 1000, unit: "kW", digits: 2 },
        { label: "Battery", value: net / 1000, unit: "kW", digits: 2 },
        { label: "Battery per km", value: net / (p.v / 3.6) / 3.6, unit: "Wh/km", digits: 0 },
      ];
    },
    sweep: { key: "v", label: "Speed", unit: "km/h", from: 10, to: 140, points: 27, y: (p) => (p.prx * 1000 - roadLoad({ ...DEFAULT_VEHICLE, mass: p.m }, p.v / 3.6, 0, 0).electricalPower) / 1000, yLabel: "Battery power", yUnit: "kW" },
    limits: ["Battery power 0: energy-neutral driving."],
    validity: "Mean over many pads.",
    limitations: ["Real received power ripples with position (see the Dynamic twin)."],
    checks: ["B11"],
    model: "WPT-SIM-002",
    view: { environment: "dynamic", viewMode: "energy" },
  },
  {
    id: "battery-ecm",
    title: "Battery equivalent circuit",
    domain: "Battery physics",
    expression: "V_t = OCV(SOC) + I·R₀(T) + V₁,   τ₁·dV₁/dt = −V₁ + I·R₁",
    interpretation: "The pack's terminal voltage is its open-circuit voltage plus resistive and polarisation drops; charging raises it.",
    symbols: [{ symbol: "OCV", meaning: "Open-circuit voltage", unit: "V" }, { symbol: "R₀", meaning: "Ohmic resistance", unit: "Ω" }, { symbol: "V₁", meaning: "Polarisation voltage", unit: "V" }],
    assumptions: ["First-order Thevenin model", "Representative NMC curve"],
    derivation: ["KVL around OCV source, R₀ and the R₁‖C₁ branch.", "Branch ODE: C₁·dV₁/dt = I − V₁/R₁."],
    params: [P("soc", "SOC", "%", 0, 100, 1, 50), P("I", "Current (charging +)", "A", -200, 160, 5, 30), P("T", "Temperature", "°C", -20, 50, 1, 25)],
    evaluate: (p) => {
      const ocv = packOcv(DEFAULT_BATTERY, p.soc / 100);
      const r0 = packR0(DEFAULT_BATTERY, p.T);
      return [
        { label: "OCV", value: ocv, unit: "V", digits: 1 },
        { label: "R₀(T)", value: r0 * 1000, unit: "mΩ", digits: 0 },
        { label: "V_t (steady)", value: ocv + p.I * (r0 + DEFAULT_BATTERY.r1 * (r0 / DEFAULT_BATTERY.r0At25)), unit: "V", digits: 1 },
      ];
    },
    sweep: { key: "soc", label: "SOC", unit: "%", from: 0, to: 100, points: 41, y: (p) => { const r0 = packR0(DEFAULT_BATTERY, p.T); return packOcv(DEFAULT_BATTERY, p.soc / 100) + p.I * (r0 + DEFAULT_BATTERY.r1 * (r0 / DEFAULT_BATTERY.r0At25)); }, yLabel: "V_t", yUnit: "V" },
    limits: ["I = 0 and relaxed: V_t = OCV."],
    validity: "−20 to 55 °C.",
    limitations: ["No hysteresis or ageing."],
    checks: ["B05", "A11"],
    model: "WPT-BAT-001",
    view: { environment: "station", viewMode: "xray" },
  },
  {
    id: "charging-time",
    title: "Charging time estimate",
    domain: "Battery physics",
    expression: "t ≈ (SOC_target − SOC₀)·E_bat / (η·P)",
    interpretation: "A first estimate. The simulated session adds the CV taper, ramps and the pre-charge sequence.",
    symbols: [{ symbol: "E_bat", meaning: "Battery energy", unit: "kWh" }, { symbol: "P", meaning: "Charging power", unit: "kW" }],
    assumptions: ["Constant power, no taper"],
    derivation: ["Energy needed / power delivered."],
    params: [P("E", "Battery", "kWh", 20, 120, 1, 60), P("d", "SOC window", "%", 5, 90, 1, 50), P("P", "Power at battery", "kW", 3, 22, 0.5, 11)],
    evaluate: (p) => [{ label: "Time", value: ((p.d / 100) * p.E) / p.P, unit: "h", digits: 2 }],
    sweep: { key: "P", label: "Power", unit: "kW", from: 3, to: 22, points: 39, y: (p) => ((p.d / 100) * p.E) / p.P, yLabel: "Time", yUnit: "h" },
    limits: ["Doubling power halves the time (until the taper)."],
    validity: "Rough planning.",
    limitations: ["Run the session to completion in the Simulation Lab for the real figure."],
    checks: ["A12"],
    model: "WPT-SIM-001",
  },
  {
    id: "kalman",
    title: "Kalman gain",
    domain: "State estimation",
    expression: "K = P⁻ / (P⁻ + R),   x̂ = x̂⁻ + K·(z − x̂⁻),   P = (1 − K)·P⁻",
    interpretation: "How much a new position fix moves the estimate: more when the prediction is uncertain, less when the sensor is noisy.",
    symbols: [{ symbol: "P⁻", meaning: "Prior variance", unit: "m²" }, { symbol: "R", meaning: "Measurement variance", unit: "m²" }, { symbol: "K", meaning: "Gain", unit: "1" }],
    assumptions: ["Scalar, linear, Gaussian"],
    derivation: ["Minimise the posterior variance (1 − K)²P⁻ + K²R over K.", "dP/dK = 0 ⇒ K = P⁻/(P⁻ + R)."],
    params: [P("sp", "Prior σ", "cm", 0.5, 50, 0.5, 10), P("sr", "Sensor σ", "cm", 0.5, 50, 0.5, 8)],
    evaluate: (p) => {
      const K = (p.sp * p.sp) / (p.sp * p.sp + p.sr * p.sr);
      return [
        { label: "K", value: K, unit: "", digits: 3 },
        { label: "Posterior σ", value: Math.sqrt((1 - K) * p.sp * p.sp), unit: "cm", digits: 2 },
      ];
    },
    sweep: { key: "sr", label: "Sensor σ", unit: "cm", from: 0.5, to: 50, points: 40, y: (p) => (p.sp * p.sp) / (p.sp * p.sp + p.sr * p.sr), yLabel: "K", yUnit: "" },
    limits: ["R → 0: trust the sensor (K → 1). P⁻ → 0: ignore it (K → 0)."],
    validity: "Linear Gaussian problems; the parking EKF linearises around the estimate.",
    limitations: ["Delayed measurements need compensation (see the Autonomous twin)."],
    checks: ["B13"],
    model: "WPT-AV-002",
    view: { environment: "autonomous", viewMode: "engineering" },
  },
  {
    id: "maxwell",
    title: "Maxwell's equations in the magneto-quasi-static limit",
    domain: "Advanced electromagnetics",
    expression: "∇·B = 0      ∇×H = J  (+ ∂D/∂t ≈ 0)      ∇×E = −∂B/∂t      ∇·D = ρ",
    interpretation: "At 85 kHz the pads are about 10⁻⁴ of a wavelength across, so displacement current is negligible: the field is the quasi-static field of the currents, and induction follows Faraday's law.",
    symbols: [{ symbol: "B, H", meaning: "Flux density, field strength", unit: "T, A/m" }, { symbol: "E, D", meaning: "Electric field, displacement", unit: "V/m, C/m²" }, { symbol: "J", meaning: "Current density", unit: "A/m²" }],
    assumptions: ["Linear media; size ≪ wavelength"],
    derivation: ["Compare |∂D/∂t| with |J| in air: ωε₀E is tiny for these sources.", "With ∇×H = J and B = μH, Biot–Savart gives B from the currents.", "Integrate ∇×E = −∂B/∂t over the receiver's surface: Faraday's law."],
    params: [P("f", "Frequency", "kHz", 20, 150, 1, 85), P("D", "Pad diameter", "m", 0.2, 1.5, 0.05, 0.6)],
    evaluate: (p) => {
      const lambda = 299792458 / (p.f * 1e3);
      return [
        { label: "Wavelength", value: lambda / 1000, unit: "km", digits: 2 },
        { label: "Pad / wavelength", value: p.D / lambda, unit: "", digits: 6 },
        { label: "μ₀", value: MU0 * 1e6, unit: "µH/m", digits: 5 },
      ];
    },
    limits: ["Pad ≪ wavelength: near-field magnetic coupling, not radiation."],
    validity: "Below a few MHz for pads of this size.",
    limitations: ["Full-wave effects matter only for EMI at harmonics."],
    checks: ["A10"],
    model: "WPT-EM-002",
    view: { environment: "station", viewMode: "field" },
  },
];

function eqCoils(p: Record<string, number>) {
  const w = 2 * Math.PI * 85000;
  const L1 = 110e-6;
  const L2 = 65e-6;
  return { L1, L2, M: p.k * Math.sqrt(L1 * L2), R1: (w * L1) / p.Q1, R2: (w * L2) / p.Q2 };
}

/** The sweep of an equation as (x, y) points. */
export function sweepEquation(eq: Equation, values: Record<string, number>): { x: number[]; y: number[] } {
  if (!eq.sweep) return { x: [], y: [] };
  const s = eq.sweep;
  const x = linspace(s.from, s.to, s.points);
  return { x, y: x.map((v) => s.y({ ...values, [s.key]: v })) };
}

export const defaultValues = (eq: Equation) => Object.fromEntries(eq.params.map((p) => [p.key, p.value]));
