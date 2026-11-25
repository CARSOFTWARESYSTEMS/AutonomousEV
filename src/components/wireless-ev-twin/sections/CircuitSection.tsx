"use client";
// Circuit Lab: compensation topologies solved by nodal analysis, frequency
// response, frequency splitting, FHA waveforms and phasors of the live link.
import { useCallback, useMemo, useState } from "react";
import { cabs, carg } from "@/lib/wireless-charging/math";
import { designCompensation, fhaWaveforms, frequencySweep, optimalLoad, splittingCoupling, TOPOLOGIES, type Topology } from "@/lib/wireless-charging/circuits";
import { runtime, useSampled } from "../state/runtime";
import Chart from "../ui/Chart";
import { fmt, Readout, Segmented, Slider } from "../ui/controls";
import ui from "../twin.module.css";

function Phasors({ v1, i1, i2, v2 }: { v1: { re: number; im: number }; i1: { re: number; im: number }; i2: { re: number; im: number }; v2: { re: number; im: number } }) {
  const items = [
    { name: "V1", z: v1, color: "#f5b041" },
    { name: "I1", z: i1, color: "#b388ff" },
    { name: "I2", z: i2, color: "#5ee7ff" },
    { name: "V2", z: v2, color: "#4ca930" },
  ];
  const R = 80;
  const arrow = (z: { re: number; im: number }, scale: number) => {
    const m = cabs(z) * scale;
    const a = carg(z);
    return { x: 100 + m * Math.cos(a), y: 100 - m * Math.sin(a) };
  };
  return (
    <figure className={ui.chart}>
      <svg viewBox="0 0 200 200" role="img" aria-label="Phasor diagram of the inverter voltage, coil currents and load voltage">
        <circle cx={100} cy={100} r={R} className={ui.chartGrid} fill="none" />
        <line x1={10} x2={190} y1={100} y2={100} className={ui.chartAxis} />
        <line y1={10} y2={190} x1={100} x2={100} className={ui.chartAxis} />
        {items.map((it) => {
          const max = it.name.startsWith("V") ? Math.max(cabs(v1), cabs(v2)) : Math.max(cabs(i1), cabs(i2));
          const p = arrow(it.z, max > 0 ? R / max : 0);
          return (
            <g key={it.name}>
              <line x1={100} y1={100} x2={p.x} y2={p.y} stroke={it.color} strokeWidth={2.2} />
              <text x={p.x + 4} y={p.y - 4} className={ui.chartTick} fill={it.color}>
                {it.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Phasors of the live operating point (voltages and currents scaled separately). In SS at resonance I2 is in quadrature with I1.</figcaption>
    </figure>
  );
}

export default function CircuitSection() {
  const [topology, setTopology] = useState<Topology>("SS");
  const [k, setK] = useState(0.3);
  const [q, setQ] = useState(400);
  const [rl, setRl] = useState(15);
  const [span, setSpan] = useState(0.2);
  const coils = useMemo(() => {
    const w = 2 * Math.PI * 85000;
    const L1 = 110e-6;
    const L2 = 65e-6;
    return { L1, L2, M: k * Math.sqrt(L1 * L2), R1: (w * L1) / q, R2: (w * L2) / q };
  }, [k, q]);
  const design = useMemo(() => designCompensation(topology, coils, 85000, rl), [topology, coils, rl]);
  const sweep = useMemo(() => frequencySweep(design, coils, rl, 85000, span, 181, TOPOLOGIES.find((t) => t.id === topology)!.source === "current" ? 20 : 300), [design, coils, rl, span, topology]);
  const f = sweep.map((s) => s.frequency / 1000);
  const kc = splittingCoupling(coils, 85000, rl);
  const info = TOPOLOGIES.find((t) => t.id === topology)!;
  const read = useCallback(() => {
    const p = runtime.station.state.point;
    return p.ss ? { ss: { ...p.ss }, alpha: p.alpha, vdc2: p.vdc2 } : null;
  }, []);
  const live = useSampled(read, 2);
  const wave = live ? fhaWaveforms(live.ss, runtime.station.params.chain.vdcLink, live.alpha, live.vdc2) : null;
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Power Electronics &amp; Circuit Laboratory</p>
        <h2>Tune the resonance</h2>
        <p>Six compensation topologies, designed at 85 kHz and solved by complex nodal analysis — the small-signal AC analysis a SPICE run performs. The same solver checks the closed-form model the twin runs (check A07).</p>
      </header>
      <section className={ui.labBlock} aria-labelledby="topo-title">
        <h3 id="topo-title">Topology and coupler</h3>
        <Segmented label="Compensation topology" value={topology} options={TOPOLOGIES.map((t) => ({ id: t.id, label: t.id }))} onChange={setTopology} />
        <p className={ui.small}>{`${info.name}: ${info.note}${info.source === "current" ? " Driven here by a 20 A current source." : " Driven here by a 300 V source."}`}</p>
        <div className={ui.columns2}>
          <div>
            <Slider label="Coupling k" value={k} min={0.02} max={0.6} step={0.01} digits={2} onChange={setK} />
            <Slider label="Coil quality factor Q" value={q} min={50} max={900} step={10} onChange={setQ} />
            <Slider label="Equivalent load R_L" value={rl} min={1} max={60} step={0.5} unit="Ω" onChange={setRl} />
            <Slider label="Sweep span" value={span} min={0.05} max={0.4} step={0.01} scale={100} unit="% of f0" onChange={setSpan} />
          </div>
          <dl className={ui.readouts}>
            <Readout label="C1" value={design.C1 * 1e9} unit="nF" digits={2} />
            <Readout label="C2" value={design.C2 * 1e9} unit="nF" digits={2} />
            {design.Lf1 && <Readout label="Lf1 / Cf1" value={`${fmt(design.Lf1 * 1e6, 1)} µH / ${fmt(design.Cf1! * 1e9, 1)}`} unit="nF" />}
            {design.Lf2 && <Readout label="Lf2 / Cf2" value={`${fmt(design.Lf2 * 1e6, 1)} µH / ${fmt(design.Cf2! * 1e9, 1)}`} unit="nF" />}
            <Readout label="SS optimum load" value={optimalLoad(coils, 85000)} unit="Ω" digits={2} />
            <Readout label="Critical coupling (SS splitting)" value={kc} digits={3} note={k > kc ? "above: input power splits" : "below: single peak"} />
          </dl>
        </div>
        <Chart x={f} series={[{ name: "Input power", color: "#f5b041", values: sweep.map((s) => s.pIn / 1000) }, { name: "Load power", color: "#4ca930", values: sweep.map((s) => s.pLoad / 1000) }]} xLabel="Frequency, kHz" yLabel="Power, kW" cursor={85} caption="Frequency response at fixed source amplitude. Above the critical coupling the SS response splits into two peaks." />
        <Chart x={f} series={[{ name: "Efficiency", color: "#5ee7ff", values: sweep.map((s) => s.efficiency * 100) }]} xLabel="Frequency, kHz" yLabel="Efficiency, %" cursor={85} height={150} />
        <Chart x={f} series={[{ name: "|Z_in|", color: "#b388ff", values: sweep.map((s) => cabs(s.zIn)) }]} xLabel="Frequency, kHz" yLabel="|Z_in|, Ω" cursor={85} height={150} caption="Magnitude of the input impedance (Bode magnitude, linear axes)." />
        <Chart x={f} series={[{ name: "Phase", color: "#ffd166", values: sweep.map((s) => (s.phaseIn * 180) / Math.PI) }]} xLabel="Frequency, kHz" yLabel="Input phase, °" cursor={85} height={150} guides={[{ y: 0, label: "resistive" }]} caption="Positive phase is inductive: the condition for zero-voltage switching (first-harmonic estimate)." />
      </section>
      <section className={ui.labBlock} aria-labelledby="live-title">
        <h3 id="live-title">The live station link</h3>
        {live && wave ? (
          <div className={ui.columns2}>
            <div>
              <Chart x={wave.t.map((t) => t * 1e6)} series={[{ name: "v1 inverter", color: "#f5b041", values: wave.v1 }, { name: "v2 rectifier", color: "#4ca930", values: wave.v2, dashed: true }]} xLabel="Time, µs (one period)" yLabel="Voltage, V" height={170} />
              <Chart x={wave.t.map((t) => t * 1e6)} series={[{ name: "i1", color: "#b388ff", values: wave.i1 }, { name: "i2", color: "#5ee7ff", values: wave.i2 }]} xLabel="Time, µs (one period)" yLabel="Current, A" height={170} caption="First-harmonic approximation: coil currents as their fundamental; switching transients, dead time and harmonics are not simulated." />
            </div>
            <Phasors v1={live.ss.v1} i1={live.ss.i1} i2={live.ss.i2} v2={live.ss.v2} />
          </div>
        ) : (
          <p>The station is not charging at the moment. Open the Digital Twin and let a session start to see its waveforms here.</p>
        )}
      </section>
    </div>
  );
}
