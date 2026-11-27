// Verification checks. Each one states its expected result quantitatively and
// runs the real engine. The unit tests execute every check, and the
// Engineering Assurance view runs them again in the visitor's browser and
// shows what it measured: nothing is shown as passed unless it ran and passed.
import { DEFAULT_BATTERY, packCapacityAh, packMaxVoltage, stepBattery, type BatteryState } from "./battery";
import { designCompensation, networkResponse, optimalLoad, resonantCapacitance, ssEfficiencyAtResonance, ssForward } from "./circuits";
import { DEFAULT_CHAIN, solveChain, type ChainSetup } from "./chain";
import { coaxialLoopM, computeCoupler, computeFieldSection, DEFAULT_RX_PAD, DEFAULT_TX_PAD, loopField, neumannLoopM, offsetLoopM } from "./coils";
import { type FieldSource, fieldAt, fieldKernel, instantaneous, rmsOf, roadExcitation } from "./roadField";
import { createRoad, DEFAULT_ROAD_INPUTS, runDrive, segmentM, stepRoad, regime } from "./dynamic";
import { DEFAULT_PARKING_INPUTS, rankStations, runParking } from "./autonomous";
import { DEFAULT_GRID_INPUTS, POLICIES, simulateDay } from "./infrastructure";
import { stepThermal } from "./losses";
import { cabs, ellipticKE, MU0 } from "./math";
import { Bus, DEFAULT_LINKS } from "./network";
import { SensorBank, STATION_SENSORS } from "./sensors";
import { createStation, DEFAULT_STATION_INPUTS, ledgerResidual, NO_FAULTS, runStationSession, setStationInputs, stepStation, type StationFaults } from "./station";
import { safetyTransition, type SafetyInputs } from "./stateMachine";
import { PARKING_CHECKS } from "./smart-parking/checks";

export interface CheckResult {
  passed: boolean;
  measured: string;
}

export interface Check {
  id: string;
  kind: "analytical" | "benchmark" | "numerical";
  title: string;
  expected: string;
  models: string[];
  run: () => CheckResult;
}

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1e-300, Math.abs(b));
const fmt = (x: number, d = 3) => (Math.abs(x) < 1e-3 && x !== 0 ? x.toExponential(2) : x.toFixed(d));

const baseSetup = (M?: number): ChainSetup => {
  const c = computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15, lateral: 0, longitudinal: 0 });
  return { tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, L1: c.L1, L2: c.L2, M: M ?? c.M, C1: resonantCapacitance(c.L1, 85000), C2: resonantCapacitance(c.L2, 85000), frequency: 85000, txTemperature: 40, rxTemperature: 40, inverterTemperature: 45, gridLimit: 1e6 };
};

const charging = (faults: StationFaults = NO_FAULTS) => {
  const sim = createStation(DEFAULT_STATION_INPUTS);
  for (let i = 0; i < 800; i++) stepStation(sim, faults, 0.05);
  return sim;
};

const safe = (over: Partial<SafetyInputs>): SafetyInputs => ({ emergencyStop: false, controllerFailure: false, stationUnavailable: false, livingObjectDetected: false, isolationFault: false, overcurrent: false, foreignObjectDetected: false, overTemperature: false, vehicleLinkAlive: true, vehicleParked: true, ...over });

const BASE_CHECKS: readonly Check[] = [
  // ── Analytical verification ──
  {
    id: "A01",
    kind: "analytical",
    title: "Complete elliptic integrals against reference values",
    expected: "K(0) = E(0) = π/2; K(0.5) = 1.854074677301372, E(0.5) = 1.350643881047675; relative error < 1e-12",
    models: ["WPT-EM-001"],
    run: () => {
      const a = ellipticKE(0);
      const b = ellipticKE(0.5);
      const err = Math.max(rel(a.K, Math.PI / 2), rel(a.E, Math.PI / 2), rel(b.K, 1.854074677301372), rel(b.E, 1.350643881047675));
      return { passed: err < 1e-12, measured: `max relative error ${err.toExponential(2)}` };
    },
  },
  {
    id: "A02",
    kind: "analytical",
    title: "Offset-loop mutual inductance against an independent Neumann double integral",
    expected: "Relative difference < 1e-6 at offsets 0.05 m and 0.2 m (a = 0.2 m, b = 0.15 m, h = 0.1 m)",
    models: ["WPT-EM-001"],
    run: () => {
      const errs = [0.05, 0.2].map((rho) => rel(offsetLoopM(0.2, 0.15, 0.1, rho, 64), neumannLoopM(0.2, 0.15, 0.1, rho, 360)));
      const err = Math.max(...errs);
      return { passed: err < 1e-6, measured: `relative differences ${errs.map((e) => e.toExponential(1)).join(", ")}` };
    },
  },
  {
    id: "A03",
    kind: "analytical",
    title: "Continuity of the offset formula into Maxwell's coaxial formula",
    expected: "At an offset of 1 µm the offset integral equals Maxwell's result within 1e-6",
    models: ["WPT-EM-001"],
    run: () => {
      const err = rel(offsetLoopM(0.2, 0.15, 0.1, 1e-6, 64), coaxialLoopM(0.2, 0.15, 0.1));
      return { passed: err < 1e-6, measured: `relative difference ${err.toExponential(2)}` };
    },
  },
  {
    id: "A04",
    kind: "analytical",
    title: "SS link efficiency: closed form against the phasor solution at resonance",
    expected: "η_closed-form = P_load/P_in from the mesh solution, relative difference < 1e-9",
    models: ["WPT-CIR-001"],
    run: () => {
      const coils = { L1: 120e-6, L2: 70e-6, M: 25e-6, R1: 0.12, R2: 0.1 };
      const f = 85000;
      const op = ssForward(coils, resonantCapacitance(coils.L1, f), resonantCapacitance(coils.L2, f), f, 12, 400);
      const err = rel(op.efficiency, ssEfficiencyAtResonance(coils, f, 12));
      return { passed: err < 1e-9, measured: `η = ${fmt(op.efficiency * 100, 4)} %, difference ${err.toExponential(2)}` };
    },
  },
  {
    id: "A05",
    kind: "analytical",
    title: "Energy closure of the power chain",
    expected: "P_grid − (P_battery + Σ stage losses) = 0 within 1e-9 relative at 2, 7 and 11 kW; SS mesh power balance P_in = P_R1 + P_R2 + P_load",
    models: ["WPT-SYS-001", "WPT-CIR-001", "WPT-LOSS-002", "WPT-LOSS-003"],
    run: () => {
      let worst = 0;
      for (const p of [2000, 7000, 11000]) {
        const pt = solveChain(DEFAULT_CHAIN, baseSetup(), p);
        worst = Math.max(worst, rel(pt.pGrid, pt.pBattery + pt.totalLoss));
        if (pt.ss) worst = Math.max(worst, rel(pt.ss.pIn, pt.ss.pR1 + pt.ss.pR2 + pt.ss.pLoad));
      }
      return { passed: worst < 1e-9, measured: `largest relative residual ${worst.toExponential(2)}` };
    },
  },
  {
    id: "A06",
    kind: "analytical",
    title: "Maximum-efficiency load",
    expected: "Link efficiency at R_L,opt exceeds efficiency at 0.8·R_L,opt and 1.25·R_L,opt",
    models: ["WPT-CIR-001"],
    run: () => {
      const coils = { L1: 110e-6, L2: 65e-6, M: 30e-6, R1: 0.14, R2: 0.12 };
      const r = optimalLoad(coils, 85000);
      const e = [0.8, 1, 1.25].map((s) => ssEfficiencyAtResonance(coils, 85000, r * s));
      return { passed: e[1] > e[0] && e[1] > e[2], measured: `η = ${e.map((x) => fmt(x * 100, 3)).join(" / ")} % at 0.8 / 1 / 1.25 × R_opt (${fmt(r, 2)} Ω)` };
    },
  },
  {
    id: "A07",
    kind: "analytical",
    title: "Nodal analysis against the closed-form SS solution",
    expected: "Coil currents and efficiency from MNA match the mesh solution within 1e-6; zero input phase at f0 for tuned SS",
    models: ["WPT-CIR-002", "WPT-CIR-001"],
    run: () => {
      const coils = { L1: 110e-6, L2: 65e-6, M: 30e-6, R1: 0.14, R2: 0.12 };
      const f = 85000;
      const RL = 15;
      const design = designCompensation("SS", coils, f, RL);
      const mna = networkResponse(design, coils, RL, f, 300);
      const ss = ssForward(coils, design.C1, design.C2, f, RL, 300);
      const err = Math.max(rel(mna.i1, cabs(ss.i1)), rel(mna.i2, cabs(ss.i2)), rel(mna.efficiency, ss.efficiency));
      const phase = Math.abs(mna.phaseIn);
      return { passed: err < 1e-6 && phase < 1e-6, measured: `max difference ${err.toExponential(2)}, |phase| ${phase.toExponential(1)} rad` };
    },
  },
  {
    id: "A08",
    kind: "analytical",
    title: "Exact thermal step against the analytic solution",
    expected: "After 3000 s at 100 W the node equals T∞ + (T0 − T∞)e^(−t/τ) within 1e-9 K, for steps of 0.05 s and 60 s",
    models: ["WPT-TH-001"],
    run: () => {
      const node = { capacitance: 3200, resistance: 0.32 };
      const exact = 25 + 100 * 0.32 + (25 - (25 + 32)) * Math.exp(-3000 / (0.32 * 3200));
      const errs = [0.05, 60].map((dt) => {
        let T = 25;
        for (let t = 0; t < 3000 - 1e-9; t += dt) T = stepThermal(node, T, 100, 25, dt);
        return Math.abs(T - exact);
      });
      return { passed: Math.max(...errs) < 1e-9, measured: `errors ${errs.map((e) => e.toExponential(1)).join(" K, ")} K` };
    },
  },
  {
    id: "A09",
    kind: "analytical",
    title: "Far-field (dipole) limit of the coaxial formula",
    expected: "At d = 20a, M → μ0πa²b²/(2d³) within 1 %",
    models: ["WPT-EM-001"],
    run: () => {
      const a = 0.2;
      const b = 0.15;
      const d = 20 * a;
      const err = rel(coaxialLoopM(a, b, d), (MU0 * Math.PI * a * a * b * b) / (2 * d ** 3));
      return { passed: err < 0.01, measured: `relative difference ${(err * 100).toFixed(3)} %` };
    },
  },
  {
    id: "A10",
    kind: "analytical",
    title: "Loop field on its axis",
    expected: "B_z(ρ = 1e-7·a) = μ0a²/(2(a² + z²)^(3/2)) within 1e-6 at z = 0.1 m",
    models: ["WPT-EM-002"],
    run: () => {
      const a = 0.25;
      const z = 0.1;
      const err = rel(loopField(a, 1e-7 * a + 1e-12, z).bz, (MU0 * a * a) / (2 * (a * a + z * z) ** 1.5));
      return { passed: err < 1e-6, measured: `relative difference ${err.toExponential(2)}` };
    },
  },
  {
    id: "A11",
    kind: "analytical",
    title: "Coulomb counting",
    expected: "ΔSOC·3600·Q = η_c·∫I dt within 1e-9 relative over 1 h at 50 A",
    models: ["WPT-BAT-001"],
    run: () => {
      const p = DEFAULT_BATTERY;
      const s: BatteryState = { soc: 0.3, v1: 0, temperature: 25 };
      for (let i = 0; i < 3600; i++) stepBattery(p, s, 50, 25, 1);
      const err = rel((s.soc - 0.3) * 3600 * packCapacityAh(p), p.coulombicEfficiency * 50 * 3600);
      return { passed: err < 1e-9, measured: `relative difference ${err.toExponential(2)}` };
    },
  },
  {
    id: "A12",
    kind: "numerical",
    title: "Time-step sensitivity of a full stationary session",
    expected: "Energy delivered 30 % → 80 % differs by < 0.1 % between Δt = 0.5 s and 1 s",
    models: ["WPT-SIM-001"],
    run: () => {
      const a = runStationSession(DEFAULT_STATION_INPUTS, { dt: 1 }).record!.energyToBattery;
      const b = runStationSession(DEFAULT_STATION_INPUTS, { dt: 0.5 }).record!.energyToBattery;
      const err = rel(a, b);
      return { passed: err < 1e-3, measured: `${fmt(a / 3.6e6, 4)} vs ${fmt(b / 3.6e6, 4)} kWh (${(err * 100).toFixed(4)} %)` };
    },
  },
  {
    id: "A13",
    kind: "numerical",
    title: "Time-step sensitivity of dynamic charging",
    expected: "Energy received over 200 m differs by < 1 % between Δt = 1 ms and 0.5 ms",
    models: ["WPT-SIM-002"],
    run: () => {
      const a = runDrive(DEFAULT_ROAD_INPUTS, 200, { dt: 0.001 }).summary.energyPerKm;
      const b = runDrive(DEFAULT_ROAD_INPUTS, 200, { dt: 0.0005 }).summary.energyPerKm;
      const err = rel(a, b);
      return { passed: err < 0.01, measured: `${fmt(a / 3600, 1)} vs ${fmt(b / 3600, 1)} Wh/km (${(err * 100).toFixed(3)} %)` };
    },
  },
  // ── Required benchmark scenarios ──
  {
    id: "A14",
    kind: "analytical",
    title: "Road field: a single pad agrees with the station's field section",
    expected: "One energised road pad and the receiver above it give the station section's RMS |B| (WPT-EM-002) within 3 % across the air gap",
    models: ["WPT-EM-005", "WPT-EM-002"],
    run: () => {
      const station = { tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15 };
      const currents = { i1: { re: 22, im: 0 }, i2: { re: 0, im: -26 } };
      const sec = computeFieldSection({ ...station, lateral: 0, longitudinal: 0.06 }, currents, { nx: 24, nz: 12 });
      const k = fieldKernel(station);
      const sources: FieldSource[] = [
        { coil: "tx", x: 0, y: 0, current: currents.i1, segment: 0 },
        { coil: "rx", x: 0.06, y: 0, current: currents.i2, segment: -1 },
      ];
      let worst = 0;
      for (let iz = 0; iz < sec.nz; iz++) {
        const z = sec.z0 + ((sec.z1 - sec.z0) * iz) / (sec.nz - 1);
        if (z < 0.012 || z > 0.138) continue;
        for (let ix = 0; ix < sec.nx; ix++) {
          const ref = sec.brms[iz * sec.nx + ix];
          if (!Number.isFinite(ref) || ref < 0.02 * sec.max) continue;
          const x = sec.x0 + ((sec.x1 - sec.x0) * ix) / (sec.nx - 1);
          worst = Math.max(worst, rel(rmsOf(fieldAt(k, sources, x, 0, z)), ref));
        }
      }
      return { passed: worst < 0.03, measured: `largest relative difference ${(worst * 100).toFixed(2)} %` };
    },
  },
  {
    id: "A15",
    kind: "analytical",
    title: "Road field: no excitation, no field; failed pads contribute nothing",
    expected: "|B| = 0 with no energised source; a failed segment never appears among the field's sources",
    models: ["WPT-EM-005", "WPT-SIM-002"],
    run: () => {
      const k = fieldKernel({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15 });
      const zero = rmsOf(fieldAt(k, [{ coil: "tx", x: 0, y: 0, current: { re: 0, im: 0 }, segment: 0 }], 0.05, 0, 0.075));
      const sim = createRoad({ ...DEFAULT_ROAD_INPUTS, coverage: 1, speed: 15, failedSegment: 12 });
      let failedSeen = false;
      for (let i = 0; i < 6000; i++) {
        stepRoad(sim);
        if (i % 50 === 0 && roadExcitation(sim).sources.some((s) => s.segment === 12)) failedSeen = true;
      }
      return { passed: zero === 0 && !failedSeen, measured: `|B| = ${zero} T with zero current; failed pad among sources: ${failedSeen ? "yes" : "no"}` };
    },
  },
  {
    id: "A16",
    kind: "analytical",
    title: "Road field: superposition and phase convention",
    expected: "The field of three sources equals the sum of each alone within 1e-12 T; at ωt = 0 the receiver current (−j|I₂|) adds nothing to B_z",
    models: ["WPT-EM-005"],
    run: () => {
      const k = fieldKernel({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15 });
      const a: FieldSource = { coil: "tx", x: 0, y: 0, current: { re: 45, im: 0 }, segment: 1 };
      const b: FieldSource = { coil: "tx", x: 1, y: 0, current: { re: 18, im: 0 }, segment: 2 };
      const c: FieldSource = { coil: "rx", x: 0.55, y: 0.05, current: { re: 0, im: -30 }, segment: -1 };
      const sum = fieldAt(k, [a, b, c], 0.5, 0.05, 0.07);
      const parts = [a, b, c].map((s) => fieldAt(k, [s], 0.5, 0.05, 0.07));
      let err = 0;
      for (let i = 0; i < 3; i++) {
        err = Math.max(err, Math.abs(sum.re[i] - parts.reduce((t, p) => t + p.re[i], 0)), Math.abs(sum.im[i] - parts.reduce((t, p) => t + p.im[i], 0)));
      }
      const t0 = instantaneous(fieldAt(k, [a, c], 0, 0, 0.075), 0)[2] - instantaneous(fieldAt(k, [a], 0, 0, 0.075), 0)[2];
      return { passed: err < 1e-12 && Math.abs(t0) < 1e-15, measured: `superposition residual ${err.toExponential(1)} T; receiver B_z at ωt = 0: ${t0.toExponential(1)} T` };
    },
  },
  {
    id: "B01",
    kind: "benchmark",
    title: "Zero magnetic coupling produces no inductive transferred power",
    expected: "With M = 0 the chain delivers 0 W and reports no coupling",
    models: ["WPT-SYS-001", "WPT-EM-001"],
    run: () => {
      const pt = solveChain(DEFAULT_CHAIN, baseSetup(0), 5000);
      return { passed: pt.pBattery === 0 && pt.pCoilIn === 0 && !pt.feasible, measured: `P_battery = ${pt.pBattery} W, feasible = ${pt.feasible}` };
    },
  },
  {
    id: "B02",
    kind: "benchmark",
    title: "An unpowered transmitter delivers no sustained charging energy",
    expected: "Station rating 0 W for 600 s: 0 J at the battery; road pads at 0 A for 200 m: 0 J received",
    models: ["WPT-SIM-001", "WPT-SIM-002"],
    run: () => {
      const sim = createStation({ ...DEFAULT_STATION_INPUTS, stationPower: 0 });
      for (let i = 0; i < 12000; i++) stepStation(sim, NO_FAULTS, 0.05);
      const road = runDrive({ ...DEFAULT_ROAD_INPUTS, primaryCurrent: 0 }, 200).sim.state.energy.received;
      return { passed: sim.state.energy.batteryTerminals === 0 && road === 0, measured: `station ${sim.state.energy.batteryTerminals} J, road ${road} J` };
    },
  },
  {
    id: "B03",
    kind: "benchmark",
    title: "Zero charging power does not increase battery energy",
    expected: "A pack at rest (I = 0) for 1 h keeps its SOC exactly",
    models: ["WPT-BAT-001"],
    run: () => {
      const s: BatteryState = { soc: 0.42, v1: 3, temperature: 30 };
      for (let i = 0; i < 3600; i++) stepBattery(DEFAULT_BATTERY, s, 0, 25, 1);
      return { passed: s.soc === 0.42, measured: `SOC ${s.soc}` };
    },
  },
  {
    id: "B04",
    kind: "benchmark",
    title: "Increased resistive loss reduces efficiency",
    expected: "Raising the Litz AC factor from 1.9 to 3.0 lowers grid-to-battery efficiency at 11 kW",
    models: ["WPT-SYS-001", "WPT-LOSS-001"],
    run: () => {
      const a = solveChain(DEFAULT_CHAIN, baseSetup(), 11000).efficiency;
      const b = solveChain({ ...DEFAULT_CHAIN, acFactorTx: 3, acFactorRx: 3 }, baseSetup(), 11000).efficiency;
      return { passed: b < a, measured: `η ${fmt(a * 100, 3)} % → ${fmt(b * 100, 3)} %` };
    },
  },
  {
    id: "B05",
    kind: "benchmark",
    title: "Battery charging respects voltage, current, SOC and temperature limits",
    expected: "Over a full session: V ≤ V_max, I ≤ 1C, SOC ≤ target + 0.2 %; a −15 °C pack receives no charge",
    models: ["WPT-BAT-001", "WPT-SIM-001"],
    run: () => {
      const sim = createStation(DEFAULT_STATION_INPUTS);
      let vMax = 0;
      let iMax = 0;
      for (let i = 0; i < 14000 && sim.state.phase !== "completed"; i++) {
        stepStation(sim, NO_FAULTS, sim.state.phase === "charging" ? 1 : 0.05);
        vMax = Math.max(vMax, sim.state.batteryVoltage);
        iMax = Math.max(iMax, sim.state.batteryCurrent);
      }
      const cold = createStation({ ...DEFAULT_STATION_INPUTS, batteryTemperature: -15, ambientTemperature: -15 });
      for (let i = 0; i < 1200; i++) stepStation(cold, NO_FAULTS, 0.05);
      const limits = vMax <= packMaxVoltage(DEFAULT_BATTERY) + 1e-6 && iMax <= packCapacityAh(DEFAULT_BATTERY) + 1e-6 && sim.state.battery.soc <= DEFAULT_STATION_INPUTS.targetSoc + 0.002;
      return { passed: limits && cold.state.energy.batteryTerminals === 0, measured: `V_max ${fmt(vMax, 1)} V, I_max ${fmt(iMax, 1)} A, SOC ${fmt(sim.state.battery.soc * 100, 2)} %, cold pack ${cold.state.energy.batteryTerminals} J (${cold.state.phase})` };
    },
  },
  {
    id: "B06",
    kind: "benchmark",
    title: "A stationary vehicle follows stationary charging behaviour",
    expected: "At 0 m/s over a road pad, received power is constant in time (spread < 1e-6) and the coupling equals the stationary coupler model within 1 %",
    models: ["WPT-SIM-002", "WPT-EM-001"],
    run: () => {
      const inputs = { ...DEFAULT_ROAD_INPUTS, speed: 0, lateral: 0 };
      const sim = createRoad(inputs);
      const seg = sim.state.segments[0];
      sim.state.x = seg.x - sim.vehicle.receiverOffset;
      sim.state.v = 0;
      const p: number[] = [];
      for (let i = 0; i < 2000; i++) {
        stepRoad(sim, 0.001);
        if (i > 200) p.push(sim.state.pReceived);
      }
      const mean = p.reduce((a, b) => a + b, 0) / p.length;
      const spread = (Math.max(...p) - Math.min(...p)) / mean;
      const stationary = computeCoupler({ tx: sim.tx, rx: sim.rx, airGap: inputs.airGap, lateral: 0, longitudinal: 0 }, 2).M;
      const err = rel(segmentM(sim, 0), stationary);
      return { passed: spread < 1e-6 && err < 0.01 && mean > 0, measured: `P = ${fmt(mean / 1000, 2)} kW, spread ${spread.toExponential(1)}, M difference ${(err * 100).toFixed(3)} %` };
    },
  },
  {
    id: "B07",
    kind: "benchmark",
    title: "A moving receiver experiences position-dependent coupling",
    expected: "M(ρ) is largest at ρ = 0 and falls monotonically until it changes sign (the coupling null of circular pads); beyond one pad diameter |M| < 5 % of M(0); along a drive the coupling varies by more than 30 % of its mean",
    models: ["WPT-SIM-002", "WPT-EM-001"],
    run: () => {
      const sim = createRoad(DEFAULT_ROAD_INPUTS);
      const M = sim.table.M;
      // Monotone down to the most negative value (past the null), then it relaxes toward zero.
      const minAt = M.indexOf(Math.min(...M));
      let monotone = minAt > 0;
      for (let i = 1; i <= minAt; i++) if (M[i] > M[i - 1] + 1e-15) monotone = false;
      const nullAt = sim.table.offsets[M.findIndex((m) => m <= 0)];
      const far = Math.abs(segmentM(sim, DEFAULT_ROAD_INPUTS.segmentDiameter + 0.25) / M[0]);
      const drive = runDrive(DEFAULT_ROAD_INPUTS, 120).sim.state.samples.filter((s) => s.k > 0).map((s) => s.k);
      const mean = drive.reduce((a, b) => a + b, 0) / drive.length;
      const sd = Math.sqrt(drive.reduce((a, b) => a + (b - mean) ** 2, 0) / drive.length);
      return { passed: monotone && far < 0.05 && sd / mean > 0.3, measured: `monotone to the null at ${fmt((nullAt ?? Number.NaN) * 1000, 0)} mm offset: ${monotone}; |M(far)|/M(0) ${fmt(far, 3)}; k variation ${fmt((sd / mean) * 100, 1)} % of mean` };
    },
  },
  {
    id: "B08",
    kind: "benchmark",
    title: "Road segments cannot activate outside authorisation and safety conditions",
    expected: "Unauthorised vehicle: 0 activations, 0 J received, blocked requests counted; authorised: 0 s energised without vehicle cover",
    models: ["WPT-SIM-002", "WPT-CTRL-001"],
    run: () => {
      const un = runDrive({ ...DEFAULT_ROAD_INPUTS, authorized: false }, 300).summary;
      const ok = runDrive({ ...DEFAULT_ROAD_INPUTS, controllerLatency: 0.15, handover: "make-before-break" }, 300).summary;
      return { passed: un.handovers === 0 && un.meanReceived === 0 && un.blocked > 0 && ok.exposure === 0, measured: `unauthorised: ${un.handovers} activations, ${un.blocked} blocked; authorised exposure ${ok.exposure} s` };
    },
  },
  {
    id: "B09",
    kind: "benchmark",
    title: "Communication failures do not bypass local protection",
    expected: "Backend and cloud outage while charging: charging continues; then a foreign object: power is 0 W within 0.3 s. Vehicle link lost: power 0 W within 1.5 s",
    models: ["WPT-SIM-001", "WPT-IOT-001", "WPT-CTRL-001"],
    run: () => {
      const outage: StationFaults = { ...NO_FAULTS, links: { backend: { up: false }, cloud: { up: false } } };
      const sim = charging();
      for (let i = 0; i < 100; i++) stepStation(sim, outage, 0.05);
      const continued = sim.state.point.pBattery > 1000;
      for (let i = 0; i < 6; i++) stepStation(sim, { ...outage, foreignObject: true }, 0.05);
      const fod = sim.state.point.pBattery === 0 && sim.state.phase === "foreign-object";
      const sim2 = charging();
      for (let i = 0; i < 30; i++) stepStation(sim2, { ...NO_FAULTS, links: { vehicle: { up: false } } }, 0.05);
      const lost = sim2.state.point.pBattery === 0 && sim2.state.phase === "comm-timeout";
      return { passed: continued && fod && lost, measured: `charging during outage ${continued}; FOD trip ${sim.state.phase}; vehicle-link loss → ${sim2.state.phase}` };
    },
  },
  {
    id: "B10",
    kind: "benchmark",
    title: "Identical deterministic inputs produce reproducible results",
    expected: "Two runs with the same inputs and seed give bit-identical energy, SOC and event logs",
    models: ["WPT-SIM-001", "WPT-SIM-002", "WPT-GRID-001"],
    run: () => {
      const a = runStationSession(DEFAULT_STATION_INPUTS, { dt: 1 });
      const b = runStationSession(DEFAULT_STATION_INPUTS, { dt: 1 });
      const same = a.sim.state.energy.grid === b.sim.state.energy.grid && a.sim.state.battery.soc === b.sim.state.battery.soc && JSON.stringify(a.sim.state.events) === JSON.stringify(b.sim.state.events);
      const r1 = runDrive(DEFAULT_ROAD_INPUTS, 150).summary;
      const r2 = runDrive(DEFAULT_ROAD_INPUTS, 150).summary;
      const g1 = simulateDay(DEFAULT_GRID_INPUTS).totals;
      const g2 = simulateDay(DEFAULT_GRID_INPUTS).totals;
      const all = same && JSON.stringify(r1) === JSON.stringify(r2) && JSON.stringify(g1) === JSON.stringify(g2);
      return { passed: all, measured: all ? "station, road and district runs identical" : "runs differ" };
    },
  },
  {
    id: "B11",
    kind: "benchmark",
    title: "Charging while driving, energy-neutral driving and discharging despite charging",
    expected: "Low speed, full coverage: SOC rises. Highway, 30 % coverage: SOC falls. Some coverage at 80 km/h gives mean battery power within ±500 W",
    models: ["WPT-SIM-002", "WPT-VEH-001"],
    run: () => {
      const slow = runDrive({ ...DEFAULT_ROAD_INPUTS, speed: 8.3, coverage: 1 }, 300).summary;
      const fast = runDrive({ ...DEFAULT_ROAD_INPUTS, speed: 33.3, coverage: 0.3 }, 300).summary;
      let lo = 0.2;
      let hi = 1;
      let found: number | null = null;
      for (let i = 0; i < 8 && found === null; i++) {
        const mid = (lo + hi) / 2;
        const r = runDrive({ ...DEFAULT_ROAD_INPUTS, speed: 22.2, coverage: mid }, 400).sim;
        const reg = regime(r.state.samples);
        if (reg === "energy-neutral") found = mid;
        else if (reg === "charging") hi = mid;
        else lo = mid;
      }
      return { passed: slow.regime === "charging" && fast.regime === "discharging" && found !== null, measured: `slow: ${slow.regime}; highway: ${fast.regime}; energy-neutral at ${found === null ? "none found" : `${Math.round(found * 100)} % coverage`}` };
    },
  },
  {
    id: "B12",
    kind: "benchmark",
    title: "Safety transitions take precedence over normal ones",
    expected: "E-stop beats every fault; a living object beats a foreign object; a fault of lower precedence never replaces a higher one",
    models: ["WPT-CTRL-001"],
    run: () => {
      const a = safetyTransition("charging", safe({ emergencyStop: true, livingObjectDetected: true, foreignObjectDetected: true }));
      const b = safetyTransition("charging", safe({ livingObjectDetected: true, foreignObjectDetected: true }));
      const c = safetyTransition("living-object", safe({ foreignObjectDetected: true, livingObjectDetected: true }));
      const d = safetyTransition("foreign-object", safe({ livingObjectDetected: true, foreignObjectDetected: true }));
      return { passed: a === "emergency-stop" && b === "living-object" && c === null && d === "living-object", measured: `${a}; ${b}; stays (${c}); pre-empted → ${d}` };
    },
  },
  {
    id: "B13",
    kind: "benchmark",
    title: "Autonomous parking aligns within tolerance; uncompensated delay degrades it",
    expected: "Default sensors: |lateral|, |longitudinal| ≤ 100 mm and k ≥ 0.08; 0.2 s uncompensated UWB delay without precision positioning: error at least twice as large",
    models: ["WPT-AV-001", "WPT-AV-002"],
    run: () => {
      const good = runParking(DEFAULT_PARKING_INPUTS).state;
      const bad = runParking({ ...DEFAULT_PARKING_INPUTS, measurementDelay: 0.2, latencyCompensation: false, precisionPositioning: false }).state;
      const eg = Math.hypot(good.finalError!.lateral, good.finalError!.longitudinal);
      const eb = Math.hypot(bad.finalError!.lateral, bad.finalError!.longitudinal);
      const within = Math.abs(good.finalError!.lateral) <= 0.1 && Math.abs(good.finalError!.longitudinal) <= 0.1 && (good.finalK ?? 0) >= 0.08;
      return { passed: within && eb >= 2 * eg, measured: `default ${fmt(eg * 1000, 1)} mm (k ${fmt(good.finalK!, 3)}); degraded ${fmt(eb * 1000, 1)} mm (k ${fmt(bad.finalK!, 3)})` };
    },
  },
  {
    id: "B14",
    kind: "benchmark",
    title: "Station selection never recommends an infeasible station",
    expected: "The first-ranked station is feasible and compatible; every infeasible station states a reason",
    models: ["WPT-AV-003"],
    run: () => {
      const r = rankStations({ soc: 0.18, capacityKWh: 60, consumption: 0.16, missionEnergy: 22, reserve: 0.1, timeValue: 2, averageSpeedKmh: 28 });
      const ok = r[0].feasible && r[0].station.compatible && r.filter((x) => !x.feasible).every((x) => x.reason.length > 0);
      return { passed: ok, measured: `first: ${r[0].station.id} (${r[0].station.name}); infeasible: ${r.filter((x) => !x.feasible).map((x) => x.station.id).join(", ") || "none"}` };
    },
  },
  {
    id: "B15",
    kind: "benchmark",
    title: "District energy balance and the import limit",
    expected: "Supply = served demand at every 5-min step (|residual| < 1e-9 kW) for every policy; coordinated policies never exceed the import limit",
    models: ["WPT-GRID-001"],
    run: () => {
      let worst = 0;
      let violations = 0;
      for (const p of POLICIES) {
        const d = simulateDay({ ...DEFAULT_GRID_INPUTS, policy: p.id });
        worst = Math.max(worst, d.totals.maxResidual);
        if (p.id !== "uncoordinated") violations += d.totals.limitViolationHours;
      }
      return { passed: worst < 1e-9 && violations === 0, measured: `largest residual ${worst.toExponential(1)} kW; coordinated violations ${violations} h` };
    },
  },
  {
    id: "B16",
    kind: "benchmark",
    title: "Telemetry integrity and freshness",
    expected: "A duplicate is flagged, a wrong-key message fails authentication, a disconnected sensor turns STALE, and no reading is ever LIVE",
    models: ["WPT-IOT-001", "WPT-DATA-001"],
    run: () => {
      const bus = new Bus(1, { ...DEFAULT_LINKS, vehicle: { ...DEFAULT_LINKS.vehicle, loss: 0, duplicate: 1 } });
      bus.send(0, "vehicle", "VCU", "Station", "BMS_HEARTBEAT", { soc: 50 });
      const dup = bus.deliver(1).map((m) => m.status);
      bus.links.vehicle = { ...bus.links.vehicle, duplicate: 0, badKey: true };
      bus.send(2, "vehicle", "VCU", "Station", "BMS_HEARTBEAT", { soc: 51 });
      const bad = bus.deliver(3).map((m) => m.status);
      const bank = new SensorBank(STATION_SENSORS, 1);
      bank.sample(0, { "bat.soc": 50 });
      bank.sample(5, { "bat.soc": 50 }, new Set(["bat.soc"]));
      const stale = bank.reading("bat.soc", 5)?.mode;
      const sim = charging();
      const live = sim.sensors.readings(sim.state.t).some((r) => r.mode === "LIVE");
      const ok = dup.includes("ok") && dup.includes("duplicate") && bad[0] === "auth-failed" && stale === "STALE" && !live;
      return { passed: ok, measured: `duplicate test ${dup.join("/")}; wrong key ${bad.join("/")}; disconnected sensor ${stale}; any LIVE ${live}` };
    },
  },
];

/** Every check: the twin's own (A, B) and Smart Parking's (SP-A, SP-B, environment 01). */
export const CHECKS: readonly Check[] = [...BASE_CHECKS, ...PARKING_CHECKS];

/** Runs every check; a throwing check fails with its error. */
export function runChecks(ids?: readonly string[]): (CheckResult & { id: string; ms: number })[] {
  return CHECKS.filter((c) => !ids || ids.includes(c.id)).map((c) => {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    let r: CheckResult;
    try {
      r = c.run();
    } catch (e) {
      r = { passed: false, measured: `error: ${e instanceof Error ? e.message : String(e)}` };
    }
    return { id: c.id, ...r, ms: (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0 };
  });
}

export { ledgerResidual, setStationInputs };
