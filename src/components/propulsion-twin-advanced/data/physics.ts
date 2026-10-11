// The physics a propulsion Digital Twin stands on: conservation laws, the
// component models built from them, and the idea that no one model should try
// to answer every question. Equations are written in plain text.
import type { Concept } from "../types";

export const PHYSICS_INTRO =
  "A physics engine is the part of a Digital Twin that computes what the system should be doing. For a given command and operating environment it produces the expected state: every pressure, flow, speed and temperature the laws of physics imply. Everything the twin later concludes is measured against that expectation.";

export const PHYSICS_CONCEPTS: readonly Concept[] = [
  {
    id: "mass",
    title: "Conservation of Mass",
    definition: "Conservation of mass states that the mass in a volume changes only by the difference between what flows in and what flows out. In a propulsion system it ties every flow to its neighbours and to the pressure of the volumes between them.",
    simple: "Nothing appears or vanishes. If more propellant enters a chamber than leaves through the nozzle, the chamber fills and its pressure rises until the two balance.",
    engineering: "Each lumped volume carries one mass balance. In steady state inflow equals outflow, which is what lets one flow meter imply another. In a transient the accumulation term gives the pressure its dynamics.",
    math: { equation: "dm/dt = ṁ_in − ṁ_out        for a gas volume:  (V / R·T) · dp/dt = ṁ_in − ṁ_out", where: "m mass in the volume · ṁ mass flow · V volume · R gas constant · T temperature · p pressure" },
    twin: "The chamber is modelled as one volume with a fill time constant. The balance is also a consistency check on the data: flows that do not add up indicate a leak or a faulty flow meter.",
    failure: "Measured fuel flow into the cooling jacket exceeds what the injector pressure drop implies is leaving it. Mass is not being conserved in the data: a leak from the jacket, or one of the two measurements, is wrong.",
  },
  {
    id: "momentum",
    title: "Conservation of Momentum",
    definition: "Conservation of momentum relates the forces on a fluid to its acceleration. Pressure differences push the fluid, friction and fittings resist it, and in the nozzle the same balance turns pressure into exhaust velocity and thrust.",
    simple: "Fluid moves because pressure pushes it, and it loses pressure pushing past obstacles. The harder you push propellant through a pipe, valve or injector, the more pressure you spend.",
    engineering: "Across a line, valve or injector the loss is proportional to dynamic pressure, so to flow squared. A line also has inertance: the liquid in it takes time to accelerate, which matters in start and in feed-system oscillation.",
    math: { equation: "Δp = K · ṁ²        with inertia:  L · dṁ/dt = p_up − p_down − K · ṁ²", where: "Δp pressure drop · K loss coefficient of the element · L inertance of the line (length over area)" },
    twin: "Every element of the pressure network is one such resistance. Solving the chain for flow gives each node's expected pressure; inverting it gives each element's loss coefficient as a health state.",
    failure: "A valve stuck partly closed raises its K. The model, told the valve is open, expects more flow than arrives, and the pressure drop across that one element is too large for the flow passing.",
  },
  {
    id: "energy",
    title: "Conservation of Energy",
    definition: "Conservation of energy accounts for where energy goes: chemical energy released by combustion, work done by pumps and extracted by turbines, heat passed into the wall and its coolant, and the kinetic energy of the exhaust.",
    simple: "Energy changes form but is never lost. The pump puts work into the liquid as pressure; burning turns chemical energy into heat; the nozzle turns heat and pressure into speed.",
    engineering: "On a closed cycle the turbine's power must equal the pumps' power: that balance sets shaft speed. In the cooling jacket, the heat the coolant gains equals the heat the wall loses.",
    math: { equation: "P_turbine · η_mech = P_pumps        P_pump = ṁ · Δp / (ρ · η_pump)        Q̇_wall = ṁ_coolant · c_p · ΔT", where: "P power · η efficiency · ρ density · Q̇ heat rate · c_p specific heat · ΔT coolant temperature rise" },
    twin: "The power balance gives the model its shaft speed. The coolant heat balance turns a temperature rise and a flow into the heat load on the wall, which no sensor measures directly.",
    failure: "Coolant temperature rise climbs while chamber pressure is unchanged. The heat load is the same, so less coolant must be carrying it: the cooling circuit is restricted.",
  },
  {
    id: "fluids",
    title: "Fluid Dynamics",
    definition: "Fluid dynamics describes how liquids and gases flow under pressure. A propulsion system needs both regimes: nearly incompressible liquid in the feed system and pumps, and compressible gas in the chamber, turbine and nozzle.",
    simple: "Liquids barely squeeze, so pushing on one end moves the other almost at once. Gases squeeze a great deal, so their pressure, density and speed all trade against each other.",
    engineering: "Liquid lines are modelled as incompressible resistances with inertance. Gas paths need compressible relations, and flow through a sufficiently large pressure ratio chokes: it reaches sonic velocity and stops responding to downstream pressure.",
    math: { equation: "liquid:  Δp = f · (L/D) · ρ·v²/2 + Σ K_i · ρ·v²/2        choked gas:  ṁ = C_d · A · p_0 · Γ(γ) / √(R·T_0)", where: "f friction factor · L/D length over diameter · v velocity · C_d discharge coefficient · A area · p_0, T_0 upstream total conditions · Γ a function of the gas's specific-heat ratio" },
    twin: "The reduced-order model treats the propellant paths as incompressible and the nozzle as choked. Those two approximations are what make it fast enough to run beside the telemetry.",
    failure: "During start, pressure in a liquid line overshoots as a valve opens. An incompressible steady model cannot show it; the transient model with inertance can, which is why the model in use must be declared.",
  },
  {
    id: "pump",
    title: "Pump Physics",
    definition: "A pump adds pressure to a liquid by spinning it. The pressure rise, called head, grows with the square of rotational speed and falls as flow increases, and it collapses if the inlet pressure is too close to the liquid's vapour pressure.",
    simple: "Spin the pump faster and it pushes harder, much harder: double the speed gives about four times the pressure. But it has to be fed liquid, not bubbles.",
    engineering: "Similarity gives a head curve in speed and flow. Efficiency peaks at a design flow. Net positive suction head available must exceed what the pump requires, with margin, at every operating point.",
    math: { equation: "Δp_pump = a · N² − b · ṁ²        NPSH_available = (p_inlet − p_vapour) / (ρ·g)  >  NPSH_required(N, ṁ)", where: "N shaft speed · a, b constants of the pump curve · p_vapour vapour pressure at inlet temperature" },
    twin: "The twin holds each pump's curve, scaled to the as-built pump by identification. Measured rise over the curve's prediction is the head coefficient: 1.00 healthy, lower as the pump degrades or cavitates.",
    failure: "Discharge pressure trends down at unchanged shaft speed with inlet pressure nominal: the pump is producing less head than its curve, which is degradation. The same loss of head with low inlet pressure and high vibration is cavitation, and the cause is upstream.",
  },
  {
    id: "combustion",
    title: "Combustion",
    definition: "Combustion in the chamber converts propellant mass flow into hot gas at high pressure. For a choked nozzle, chamber pressure equals mass flow times characteristic velocity divided by throat area, so it measures both how much propellant arrives and how well it burns.",
    simple: "The chamber is a balance: propellant comes in and burns, gas goes out through the throat. The pressure settles where the two match. More flow, or better burning, means more pressure.",
    engineering: "Characteristic velocity c* depends on mixture ratio and on combustion efficiency. A shift in mixture ratio changes c* and gas temperature together. Stability is monitored separately, at high frequency.",
    math: { equation: "p_c = η_c* · c*(MR) · ṁ_total / A_t        MR = ṁ_ox / ṁ_fuel", where: "p_c chamber pressure · η_c* combustion efficiency · c* characteristic velocity · MR mixture ratio · A_t throat area" },
    twin: "The twin compares estimated chamber pressure with what the measured flows and mixture ratio should produce. Their ratio is combustion efficiency, another state no sensor reads.",
    failure: "Chamber pressure falls while both propellant flows rise slightly. Feed is not the problem: the chamber is making less pressure per unit of flow, which points at combustion performance.",
  },
  {
    id: "nozzle",
    title: "Nozzle",
    definition: "A converging–diverging nozzle accelerates the combustion gas to the speed of sound at its throat and to supersonic speed beyond it, converting the gas's pressure and temperature into exhaust velocity. Thrust is the momentum of that exhaust plus a pressure term at the exit.",
    simple: "Squeeze the gas through a narrow throat and it speeds up to the speed of sound. Let it expand in the bell and it speeds up further, cooling and dropping in pressure as it goes.",
    engineering: "Once choked, throat conditions depend only on chamber conditions. Expansion ratio sets exit pressure; the mismatch between exit and ambient pressure adds or subtracts thrust.",
    math: { equation: "F = ṁ · v_e + (p_e − p_a) · A_e = C_F · p_c · A_t", where: "F thrust · v_e exit velocity · p_e exit pressure · p_a ambient pressure · A_e exit area · C_F thrust coefficient" },
    twin: "Because thrust is proportional to chamber pressure through C_F, a thrust measurement is an independent estimate of chamber pressure: the basis of one of the twin's virtual sensors.",
    failure: "Chamber pressure sensor A reads low but thrust has not changed. The nozzle relation says chamber pressure cannot have fallen, so the sensor is the suspect.",
  },
  {
    id: "thermal",
    title: "Thermal Physics",
    definition: "Thermal physics in a rocket engine concerns the heat that flows from combustion gas into the chamber wall and out again into the coolant. Regenerative cooling works only while the coolant carries heat away as fast as the gas delivers it.",
    simple: "The gas is hotter than any wall material can survive. The wall lives because fuel running through channels inside it takes the heat away. Starve those channels and the wall temperature climbs.",
    engineering: "Gas-side heat flux rises a little less than linearly with chamber pressure and peaks near the throat. Coolant-side heat transfer depends on coolant velocity. The temperature difference across the wall creates thermal stress every cycle.",
    math: { equation: "q̇ = h_g · (T_aw − T_wg) = (k/t) · (T_wg − T_wc) = h_c · (T_wc − T_coolant)        h_g ∝ p_c^0.8", where: "q̇ heat flux · h_g, h_c gas-side and coolant-side coefficients · T_aw adiabatic wall temperature · T_wg, T_wc wall temperature on each side · k/t wall conductance" },
    twin: "The model predicts coolant temperature rise from chamber pressure and coolant flow. A rise above that prediction is an early, measurable sign that the wall is losing margin.",
    failure: "Cooling pressure drop increases and coolant outlet temperature rises at constant thrust: a restriction. The twin recommends holding a lower thrust, because wall temperature is the limit that matters.",
  },
];

// ── Multi-fidelity modelling ────────────────────────────────────────────────

export const FIDELITY_INTRO = "Multi-fidelity modelling means using several models of the same system, each matched to a question. One model should not attempt to solve every problem: the model that resolves a flame cannot run beside live telemetry, and the model that runs beside telemetry cannot resolve a flame.";

export interface FidelityLevel {
  id: "high" | "mid" | "reduced" | "surrogate";
  name: string;
  examples: string;
  useFor: readonly string[];
  cost: string;
  inTwin: string;
}

export const FIDELITY_LEVELS: readonly FidelityLevel[] = [
  {
    id: "high",
    name: "High Fidelity",
    examples: "CFD, FEA, detailed combustion and thermo-fluid models",
    useFor: ["Design studies", "Correlation with test", "Fault signature development", "Training reduced-order models"],
    cost: "Hours to days for one condition, on a cluster.",
    inTwin: "Never in the live loop. It is where the reduced models' coefficients and the fault signatures come from.",
  },
  {
    id: "mid",
    name: "Mid Fidelity",
    examples: "1-D network and lumped dynamic models",
    useFor: ["System behaviour", "Transients", "Pressure dynamics", "Control-system development"],
    cost: "Seconds to minutes for a transient, on a workstation.",
    inTwin: "Runs off line, or alongside in a replay, to explain a transient the reduced model cannot.",
  },
  {
    id: "reduced",
    name: "Reduced-Order Model",
    examples: "A lumped pressure network with a handful of states",
    useFor: ["Near-real-time Digital Twin calculations", "Estimation", "Onboard and edge analysis"],
    cost: "Microseconds per step.",
    inTwin: "The model in the live loop. The one on this page is of this kind: it produces the expected state and is inverted to estimate hidden parameters.",
  },
  {
    id: "surrogate",
    name: "Surrogate Model",
    examples: "A learned approximation of an expensive model",
    useFor: ["Approximating computationally expensive behaviour", "Maps too costly to compute live", "Sensitivity and uncertainty sweeps"],
    cost: "Microseconds per evaluation, after an expensive training campaign.",
    inTwin: "Stands in for a high-fidelity result, such as a wall-temperature map, inside its training envelope only.",
  },
];

export const FIDELITY_CHAIN = ["High-Fidelity Model", "Reduced-Order Model", "Surrogate", "Real-Time Digital Twin"] as const;

/** What the model on this page is, stated the way a model card would. */
export const THIS_MODEL = {
  name: "Reduced-order pressure network",
  states: ["Shaft speed", "Chamber pressure", "Coolant temperature rise"],
  algebraic: ["Flow in each propellant branch", "Pressure at every node", "Pump cavitation"],
  assumptions: [
    "Liquid paths are incompressible quadratic resistances; line inertance is neglected.",
    "The rotating machinery is lumped into one shaft-speed state with a first-order response.",
    "The chamber is one volume with a first-order fill; the nozzle is choked.",
    "The controller schedules shaft speed from the throttle command and does not trim on chamber pressure, so a fault stays visible in pressure.",
    "Everything is normalised to a reference operating point. No dimensional quantity is implied.",
  ],
  boundary: ["Tank pressures", "Throttle command", "Ignition state"],
} as const;
