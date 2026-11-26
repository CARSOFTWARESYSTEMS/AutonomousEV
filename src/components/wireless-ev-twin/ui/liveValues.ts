// Live values for a component's telemetry keys, read from the running
// simulation. Used by the laboratory's component inspector.
import { runtime } from "../state/runtime";
import { fmt } from "./controls";

/** Live values the inspector knows how to read, by telemetry key. */
export function liveValue(key: string): { label: string; value: string } | null {
  const st = runtime.station.state;
  const p = st.point;
  const r = (id: string) => runtime.station.sensors.reading(id, st.t);
  const sensor = (id: string) => {
    const x = r(id);
    return x ? { label: `${x.label} (${x.mode})`, value: `${fmt(x.value, 2)} ${x.unit}` } : null;
  };
  switch (key) {
    case "grid.power":
    case "dc.link":
    case "tx.current":
    case "tx.temp":
    case "inv.temp":
    case "field.edge":
    case "align.lat":
    case "align.long":
    case "rx.current":
    case "bat.voltage":
    case "bat.current":
    case "bat.soc":
    case "bat.temp":
      return sensor(key);
    case "cost":
      return { label: "Session cost (calculated)", value: `₹ ${fmt(st.cost, 2)}` };
    case "phase":
      return { label: "State", value: st.phase };
    case "alpha":
      return { label: "Conduction angle α", value: `${fmt((p.alpha * 180) / Math.PI, 0)}°` };
    case "zvs":
      return { label: "Zero-voltage switching", value: p.ss ? (p.ss.phaseIn > 0 ? "yes (inductive)" : "no (capacitive)") : "—" };
    case "k":
      return { label: "Coupling k", value: fmt(st.coupler.k, 3) };
    case "M":
      return { label: "Mutual inductance", value: `${fmt(st.coupler.M * 1e6, 2)} µH` };
    case "vc1":
      return { label: "C1 voltage", value: `${fmt(p.ss?.vC1 ?? 0, 0)} V` };
    case "vc2":
      return { label: "C2 voltage", value: `${fmt(p.ss?.vC2 ?? 0, 0)} V` };
    case "phaseIn":
      return { label: "Input phase", value: `${fmt(((p.ss?.phaseIn ?? 0) * 180) / Math.PI, 1)}°` };
    case "voc":
      return { label: "Open-circuit EMF ωM·I1", value: `${fmt(p.ss?.vOc ?? 0, 0)} V` };
    case "vdc2":
      return { label: "Rectifier DC voltage", value: `${fmt(p.vdc2, 0)} V` };
    case "rl":
      return { label: "Equivalent load", value: `${fmt(p.rl, 2)} Ω` };
    case "pCmd":
      return { label: "Power set-point", value: `${fmt(st.pCmd / 1000, 2)} kW` };
    case "pTraction":
      return { label: "Traction power (road)", value: `${fmt(runtime.road.state.pTraction / 1000, 2)} kW` };
    case "segments":
      return { label: "Energised road pads", value: String(runtime.road.state.segments.filter((g) => g.level > 0.01).length) };
    case "mTotal":
      return { label: "Total mutual inductance (road)", value: `${fmt(runtime.road.state.mTotal * 1e6, 2)} µH` };
    case "links": {
      const s = runtime.station.bus.stats;
      return { label: "Messages sent / lost", value: `${s.vehicle.sent + s.backend.sent + s.cloud.sent} / ${s.vehicle.lost + s.backend.lost + s.cloud.lost}` };
    }
    default:
      if (key.startsWith("loss.")) {
        const k = key.slice(5) as keyof typeof p.losses;
        return k in p.losses ? { label: "Loss", value: `${fmt(p.losses[k], 1)} W` } : null;
      }
      if (key === "fod") return { label: "Foreign object timer", value: `${fmt(st.fodTimer, 2)} s` };
      if (key === "lod") return { label: "State", value: st.phase };
      if (key === "pv" || key === "bess") return { label: "See the Infrastructure environment", value: "—" };
      return null;
  }
}
