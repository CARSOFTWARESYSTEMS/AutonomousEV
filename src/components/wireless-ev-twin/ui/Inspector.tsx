"use client";
// The selected component: what it is, how it is built and modelled, how it
// fails, and its live values from the running simulation.
import { useCallback } from "react";
import { X } from "lucide-react";
import { componentById } from "@/lib/wireless-charging/components";
import { FIDELITY, modelById } from "@/lib/wireless-charging/registry";
import { cabs } from "@/lib/wireless-charging/math";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { fmt, Tag } from "./controls";
import ui from "../twin.module.css";

/** Live values the inspector knows how to read, by telemetry key. */
function liveValue(key: string): { label: string; value: string } | null {
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

export default function Inspector() {
  const id = useTwin((s) => s.selected);
  const select = useTwin((s) => s.select);
  const c = id ? componentById(id) : undefined;
  const read = useCallback(() => (c ? c.telemetry.map(liveValue).filter((x): x is { label: string; value: string } => x !== null) : []), [c]);
  const live = useSampled(read, 4);
  if (!c) return null;
  void cabs;
  return (
    <section className={ui.inspector} aria-label={`Component: ${c.name}`}>
      <header>
        <p className={ui.eyebrow}>{c.side === "wireless" ? "Wireless link" : c.side === "ground" ? "Ground side" : c.side === "vehicle" ? "Vehicle side" : c.side === "road" ? "Electrified road" : c.side === "grid" ? "Grid" : "Infrastructure"}</p>
        <h3>{c.name}</h3>
        <button type="button" onClick={() => select(null)} aria-label="Back to the system">
          <X size={16} aria-hidden="true" />
        </button>
      </header>
      <p>{c.purpose}</p>
      {live.length > 0 && (
        <dl className={ui.liveList}>
          {live.map((v) => (
            <div key={v.label}>
              <dt>{v.label}</dt>
              <dd>{v.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <dl className={ui.facts}>
        <div><dt>Construction</dt><dd>{c.construction}</dd></div>
        <div><dt>Materials</dt><dd>{c.materials}</dd></div>
        <div><dt>Inputs → outputs</dt><dd>{`${c.inputs} → ${c.outputs}`}</dd></div>
        <div><dt>Characteristics</dt><dd>{c.characteristics}</dd></div>
        <div><dt>Operating principle</dt><dd>{c.principle}</dd></div>
        <div><dt>Circuit representation</dt><dd>{c.circuit}</dd></div>
        <div><dt>Losses</dt><dd>{c.losses}</dd></div>
        <div><dt>Thermal behaviour</dt><dd>{c.thermal}</dd></div>
        <div><dt>Failure modes</dt><dd>{c.failureModes.join("; ") || "—"}</dd></div>
        <div><dt>Safety</dt><dd>{c.safety}</dd></div>
        <div><dt>Assumptions</dt><dd>{c.assumptions}</dd></div>
        <div>
          <dt>Model and fidelity</dt>
          <dd>
            {c.models.map((m) => (
              <span key={m} className={ui.modelChip}>{`${m} · ${modelById(m)?.name ?? ""}`}</span>
            ))}
            {`${c.fidelity} ${FIDELITY[c.fidelity].name} · ${c.status}`}
          </dd>
        </div>
        {c.research.length > 0 && <div><dt>Research opportunities</dt><dd>{c.research.join("; ")}</dd></div>}
      </dl>
      <p className={ui.small}>
        <Tag kind="SIMULATED" /> Live values come from the running models.
      </p>
    </section>
  );
}
