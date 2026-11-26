// The instrument strip's metrics. Each reads one value from the running
// simulation (never a separate animation value) and says what kind of value
// it is: an INPUT the visitor set, a value CALCULATED by a model, or a
// SIMULATED sensor reading.
import { PHASES } from "@/lib/wireless-charging/stateMachine";
import { cabs } from "@/lib/wireless-charging/math";
import { DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { recentBatteryPower } from "@/lib/wireless-charging/dynamic";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { fmt } from "../ui/controls";

export type MetricKind = "INPUT" | "CALCULATED" | "SIMULATED";

export interface Metric {
  label: string;
  kind: MetricKind;
  /** Formatted value and unit. */
  read: () => { value: string; unit?: string };
}

const st = () => runtime.station.state;
const kw = (w: number) => ({ value: fmt(w / 1000, 2), unit: "kW" });
const gridStep = () => {
  const s = useTwin.getState();
  const steps = runtime.grid.steps;
  return steps[Math.min(steps.length - 1, Math.floor((s.gridHour / 24) * steps.length))];
};

export const METRICS = {
  phase: { label: "State", kind: "SIMULATED", read: () => ({ value: PHASES[st().phase].label }) },
  stationRating: { label: "Station rating", kind: "INPUT", read: () => kw(useTwin.getState().station.stationPower) },
  gridLimit: { label: "Grid connection", kind: "INPUT", read: () => kw(useTwin.getState().station.gridLimit) },
  txTurns: { label: "Transmitter turns", kind: "INPUT", read: () => ({ value: String(useTwin.getState().station.txTurns) }) },
  rxTurns: { label: "Receiver turns", kind: "INPUT", read: () => ({ value: String(useTwin.getState().station.rxTurns) }) },
  padDiameter: { label: "Winding diameter", kind: "INPUT", read: () => ({ value: fmt(DEFAULT_TX_PAD.outerRadius * 2000, 0), unit: "mm" }) },
  L1: { label: "L₁", kind: "CALCULATED", read: () => ({ value: fmt(st().coupler.L1 * 1e6, 1), unit: "µH" }) },
  L2: { label: "L₂", kind: "CALCULATED", read: () => ({ value: fmt(st().coupler.L2 * 1e6, 1), unit: "µH" }) },
  vehicleSpeed: { label: "Vehicle speed", kind: "SIMULATED", read: () => ({ value: fmt(st().vehicle.v * 3.6, 1), unit: "km/h" }) },
  distanceToPad: {
    label: "Receiver to pad",
    kind: "SIMULATED",
    read: () => {
      const v = st().vehicle;
      const inp = useTwin.getState().station;
      return v.present ? { value: fmt(Math.max(0, inp.longitudinal - 0.6 - v.x), 2), unit: "m" } : { value: "—" };
    },
  },
  backend: { label: "Authorisation", kind: "SIMULATED", read: () => ({ value: st().authorized ? "granted" : st().backendReply === "none" ? "pending" : st().backendReply }) },
  messages: {
    label: "Messages delivered",
    kind: "SIMULATED",
    read: () => {
      const b = runtime.station.bus.stats;
      return { value: String(b.vehicle.delivered + b.backend.delivered + b.cloud.delivered + b.can.delivered) };
    },
  },
  lateral: { label: "Lateral offset", kind: "INPUT", read: () => ({ value: fmt(useTwin.getState().station.lateral * 1000, 0), unit: "mm" }) },
  longitudinal: { label: "Longitudinal offset", kind: "INPUT", read: () => ({ value: fmt(useTwin.getState().station.longitudinal * 1000, 0), unit: "mm" }) },
  airGap: { label: "Air gap", kind: "INPUT", read: () => ({ value: fmt(useTwin.getState().station.airGap * 1000, 0), unit: "mm" }) },
  k: { label: "Coupling k", kind: "CALCULATED", read: () => ({ value: fmt(st().coupler.k, 3) }) },
  M: { label: "Mutual inductance", kind: "CALCULATED", read: () => ({ value: fmt(st().coupler.M * 1e6, 2), unit: "µH" }) },
  rxTemp: { label: "Receiver coil", kind: "CALCULATED", read: () => ({ value: fmt(st().temperatures.rxCoil, 1), unit: "°C" }) },
  fieldCentre: { label: "B at gap centre (RMS)", kind: "CALCULATED", read: () => (st().point.ss ? { value: fmt(st().fieldCentre * 1e6, 0), unit: "µT" } : { value: "0", unit: "µT" }) },
  i1: { label: "I₁ (RMS)", kind: "CALCULATED", read: () => ({ value: fmt(st().point.ss ? cabs(st().point.ss!.i1) : 0, 1), unit: "A" }) },
  i2: { label: "I₂ (RMS)", kind: "CALCULATED", read: () => ({ value: fmt(st().point.ss ? cabs(st().point.ss!.i2) : 0, 1), unit: "A" }) },
  frequency: { label: "Frequency", kind: "CALCULATED", read: () => ({ value: fmt(st().frequency / 1000, 2), unit: "kHz" }) },
  alpha: { label: "Conduction angle α", kind: "CALCULATED", read: () => ({ value: fmt((st().alphaApplied * 180) / Math.PI, 0), unit: "°" }) },
  zvs: { label: "Zero-voltage switching", kind: "CALCULATED", read: () => ({ value: st().point.ss ? (st().point.ss!.phaseIn > 0 ? "yes" : "no") : "—" }) },
  vc1: { label: "C₁ voltage (RMS)", kind: "CALCULATED", read: () => ({ value: fmt(st().point.ss?.vC1 ?? 0, 0), unit: "V" }) },
  pGrid: { label: "Grid", kind: "CALCULATED", read: () => kw(st().point.pGrid) },
  pCoilIn: { label: "Into the transmitter", kind: "CALCULATED", read: () => kw(st().point.pCoilIn) },
  pGap: { label: "Across the gap", kind: "CALCULATED", read: () => kw(st().point.pRectifierIn) },
  pBattery: { label: "Into the battery", kind: "CALCULATED", read: () => kw(st().point.pBattery) },
  efficiency: {
    label: "Grid-to-battery efficiency",
    kind: "CALCULATED",
    read: () => {
      const p = st().point;
      return p.pGrid > 1 ? { value: fmt((100 * p.pBattery) / p.pGrid, 1), unit: "%" } : { value: "—" };
    },
  },
  soc: { label: "State of charge", kind: "CALCULATED", read: () => ({ value: fmt(st().battery.soc * 100, 1), unit: "%" }) },
  vBat: { label: "Pack voltage", kind: "CALCULATED", read: () => ({ value: fmt(st().batteryVoltage, 0), unit: "V" }) },
  iBat: { label: "Charging current", kind: "CALCULATED", read: () => ({ value: fmt(st().batteryCurrent, 1), unit: "A" }) },
  acceptance: { label: "Limited by", kind: "CALCULATED", read: () => ({ value: st().limitedBy === "off" ? "—" : st().limitedBy }) },
  tBat: { label: "Battery temperature", kind: "CALCULATED", read: () => ({ value: fmt(st().battery.temperature, 1), unit: "°C" }) },
  objectTemp: { label: "Object temperature", kind: "CALCULATED", read: () => ({ value: useTwin.getState().faults.foreignObject || st().temperatures.object > 30 ? fmt(st().temperatures.object, 1) : "—", unit: "°C" }) },
  energyDelivered: { label: "Energy to battery", kind: "CALCULATED", read: () => ({ value: fmt((st().session?.energyToBattery ?? st().sessions.at(-1)?.energyToBattery ?? 0) / 3.6e6, 2), unit: "kWh" }) },
  cost: { label: "Session cost", kind: "CALCULATED", read: () => ({ value: `₹ ${fmt(st().session?.cost ?? st().sessions.at(-1)?.cost ?? 0, 2)}` }) },
  roadSpeed: { label: "Vehicle speed", kind: "SIMULATED", read: () => ({ value: fmt(runtime.road.state.v * 3.6, 0), unit: "km/h" }) },
  pReceived: { label: "Received", kind: "CALCULATED", read: () => kw(runtime.road.state.pReceived) },
  pTraction: { label: "Traction demand", kind: "CALCULATED", read: () => kw(runtime.road.state.pTraction) },
  pBatteryRoad: { label: "Battery (+ charging)", kind: "CALCULATED", read: () => kw(runtime.road.state.pBattery) },
  roadSoc: { label: "State of charge", kind: "CALCULATED", read: () => ({ value: fmt(runtime.road.state.battery.soc * 100, 3), unit: "%" }) },
  segments: { label: "Energised pads", kind: "SIMULATED", read: () => ({ value: String(runtime.road.state.segments.filter((g) => g.level > 0.01).length) }) },
  mTotal: { label: "Total M", kind: "CALCULATED", read: () => ({ value: fmt(runtime.road.state.mTotal * 1e6, 2), unit: "µH" }) },
  kRoad: { label: "Coupling k", kind: "CALCULATED", read: () => ({ value: fmt(runtime.road.state.kDynamic, 3) }) },
  i2Road: { label: "Receiver current (RMS)", kind: "CALCULATED", read: () => ({ value: fmt(runtime.road.state.i2, 1), unit: "A" }) },
  motional: { label: "Motional / transformer EMF", kind: "CALCULATED", read: () => ({ value: runtime.road.state.mTotal > 0 ? runtime.road.state.motionalRatio.toExponential(1) : "—" }) },
  handovers: { label: "Pad activations", kind: "SIMULATED", read: () => ({ value: String(runtime.road.state.counters.handovers) }) },
  blocked: { label: "Blocked by interlock", kind: "SIMULATED", read: () => ({ value: String(runtime.road.state.counters.blocked) }) },
  roadRegime: {
    label: "Energy over the last 200 m",
    kind: "CALCULATED",
    read: () => {
      const r = recentBatteryPower(runtime.road.state.samples);
      return { value: r ? (r.regime === "charging" ? "Battery gaining" : r.regime === "discharging" ? "Battery losing" : "Energy-neutral") : "measuring…" };
    },
  },
  roadNetPower: {
    label: "Mean battery power, last 200 m",
    kind: "CALCULATED",
    read: () => {
      const r = recentBatteryPower(runtime.road.state.samples);
      // Fixed decimals: a near-zero mean is the point of the energy-neutral stage, not a number to show in exponent form.
      return r ? { value: (Math.abs(r.mean) < 5 ? 0 : r.mean / 1000).toFixed(2), unit: "kW" } : { value: "—" };
    },
  },
  parkPhase: { label: "Manoeuvre", kind: "SIMULATED", read: () => ({ value: runtime.parking.state.phase }) },
  parkError: {
    label: "Estimate error",
    kind: "CALCULATED",
    read: () => {
      const p = runtime.parking.state;
      return { value: fmt(Math.hypot(p.truth.x - p.estimate.x, p.truth.y - p.estimate.y) * 1000, 0), unit: "mm" };
    },
  },
  parkSigma: { label: "EKF 1σ", kind: "CALCULATED", read: () => ({ value: fmt(Math.sqrt(Math.max(0, runtime.parking.state.P[0] + runtime.parking.state.P[4])) * 1000, 0), unit: "mm" }) },
  gridImport: { label: "Grid import", kind: "CALCULATED", read: () => ({ value: fmt(gridStep()?.gridImport ?? 0, 0), unit: "kW" }) },
  pvUsed: { label: "Solar used", kind: "CALCULATED", read: () => ({ value: fmt(gridStep()?.pvUsed ?? 0, 0), unit: "kW" }) },
  bessPower: {
    label: "Storage (+ discharging)",
    kind: "CALCULATED",
    read: () => {
      const g = gridStep();
      return { value: fmt(g ? g.bessDischarge - g.bessCharge : 0, 0), unit: "kW" };
    },
  },
  hour: {
    label: "Time of day",
    kind: "SIMULATED",
    read: () => {
      const h = useTwin.getState().gridHour;
      return { value: `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}` };
    },
  },
} satisfies Record<string, Metric>;

export type MetricId = keyof typeof METRICS;
