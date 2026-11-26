"use client";
// Learn mode's three experiments. Each one changes the twin's own inputs, so
// the 3D scene, the engine and the graph move together: the coupler for
// mutual inductance and alignment, a series RLC for resonance (the isolated
// LC formula next to the compensated link it is part of), and the road for
// dynamic energy transfer. Every number shown is computed by the engine.
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { resonantCapacitance } from "@/lib/wireless-charging/circuits";
import { segmentM } from "@/lib/wireless-charging/dynamic";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { openEnvironment } from "../story/guide";
import Chart from "../ui/Chart";
import { fmt, Slider } from "../ui/controls";
import { Disclosure } from "../ui/Section";
import lab from "./lab.module.css";

type LessonId = "coupling" | "resonance" | "dynamic";
const LESSONS: { id: LessonId; title: string; env: "station" | "dynamic" }[] = [
  { id: "coupling", title: "Mutual inductance & alignment", env: "station" },
  { id: "resonance", title: "Resonance", env: "station" },
  { id: "dynamic", title: "Energy transfer in motion", env: "dynamic" },
];

function Equation({ children }: { children: React.ReactNode }) {
  return <p className={lab.equationLive}>{children}</p>;
}

/** Lesson 1: the coupler's geometry against k and M, with the 3D pads moving as the sliders do. */
function CouplingLesson() {
  const st = useTwin((s) => s.station);
  const set = useTwin((s) => s.setStation);
  const config = useMemo(() => ({ tx: { ...DEFAULT_TX_PAD, turns: st.txTurns }, rx: { ...DEFAULT_RX_PAD, turns: st.rxTurns }, airGap: st.airGap, lateral: st.lateral, longitudinal: st.longitudinal }), [st.txTurns, st.rxTurns, st.airGap, st.lateral, st.longitudinal]);
  const c = useMemo(() => computeCoupler(config), [config]);
  // k against air gap at the present offsets (the cursor marks the present gap); deferred, so dragging stays smooth.
  const slow = useDeferredValue(config);
  const sweep = useMemo(() => {
    const gaps = Array.from({ length: 8 }, (_, i) => 0.06 + i * (0.24 / 7));
    return { gaps: gaps.map((g) => g * 1000), k: gaps.map((g) => computeCoupler({ ...slow, airGap: g }).k) };
  }, [slow]);
  return (
    <>
      <p className={lab.lessonLead}>Move the receiver. The pads in the scene move with it; the coupler model recomputes how much of the transmitter’s flux links the receiver.</p>
      <Slider label="Air gap (winding to winding)" value={st.airGap} min={0.06} max={0.3} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ airGap: v })} />
      <Slider label="Lateral offset" value={st.lateral} min={0} max={0.25} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ lateral: v })} />
      <Slider label="Longitudinal offset" value={st.longitudinal} min={-0.2} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ longitudinal: v })} />
      <Equation>
        M = k·√(L₁L₂) = {fmt(c.k, 3)} × √({fmt(c.L1 * 1e6, 1)} µH × {fmt(c.L2 * 1e6, 1)} µH) = <strong>{fmt(c.M * 1e6, 2)} µH</strong>
      </Equation>
      <Chart x={sweep.gaps} series={[{ name: "Coupling k", color: "#22d3ee", values: sweep.k }]} xLabel="Air gap, mm" yLabel="k" yMin={0} cursor={st.airGap * 1000} caption="k against air gap at the present offsets (filament model with ferrite images, F1)" height={170} />
      <p className={lab.lessonNote}>Simply: the farther apart or the more offset the pads, the less of one coil’s field threads the other, so k falls — and with it the voltage the receiver can induce.</p>
      <Disclosure title="Advanced: where M comes from" summary="Neumann's formula over every pair of turns">
        <p className={lab.lessonNote}>M = (μ₀/4π) ∮∮ dl₁·dl₂ / |r₁ − r₂|, summed over every turn of each winding and over the images of each turn in the ferrite planes. k = M/√(L₁L₂) is dimensionless; M (H) sets the induced EMF jωMI₁.</p>
      </Disclosure>
    </>
  );
}

/** Lesson 2: a series RLC (one side of the link) against frequency, beside the formula for f₀. */
function ResonanceLesson() {
  const st = useTwin((s) => s.station);
  const setStation = useTwin((s) => s.setStation);
  const L1 = useMemo(() => computeCoupler({ tx: { ...DEFAULT_TX_PAD, turns: st.txTurns }, rx: { ...DEFAULT_RX_PAD, turns: st.rxTurns }, airGap: st.airGap, lateral: st.lateral, longitudinal: st.longitudinal }).L1, [st.txTurns, st.rxTurns, st.airGap, st.lateral, st.longitudinal]);
  const [cScale, setCScale] = useState(1);
  const [R, setR] = useState(0.5);
  const C = resonantCapacitance(L1, 85000) * cScale;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L1 * C));
  const freqs = useMemo(() => Array.from({ length: 81 }, (_, i) => 60000 + i * 625), []);
  const resp = useMemo(
    () =>
      freqs.map((f) => {
        const w = 2 * Math.PI * f;
        const x = w * L1 - 1 / (w * C);
        return { mag: 1 / Math.hypot(R, x), phase: (Math.atan2(x, R) * 180) / Math.PI };
      }),
    [freqs, L1, C, R],
  );
  const peak = Math.max(...resp.map((r) => r.mag));
  return (
    <>
      <p className={lab.lessonLead}>The transmitter coil (its inductance from the coupler model) and its compensation capacitor: at one frequency their reactances cancel and the current is limited only by resistance.</p>
      <Slider label="Capacitance (× the 85 kHz value)" value={cScale} min={0.7} max={1.4} step={0.01} digits={2} unit="×" onChange={setCScale} />
      <Slider label="Loop resistance" value={R} min={0.1} max={3} step={0.05} unit="Ω" onChange={setR} />
      <Slider label="Operating frequency" value={st.frequency} min={79000} max={90000} step={250} scale={0.001} digits={2} unit="kHz" onChange={(v) => setStation({ frequency: v })} />
      <Equation>
        f₀ = 1 / (2π√(LC)) = 1 / (2π√({fmt(L1 * 1e6, 1)} µH × {fmt(C * 1e9, 1)} nF)) = <strong>{fmt(f0 / 1000, 2)} kHz</strong>
      </Equation>
      <Chart
        x={freqs.map((f) => f / 1000)}
        series={[
          { name: "|I| / V (normalised)", color: "#22d3ee", values: resp.map((r) => r.mag / peak) },
          { name: "Phase ÷ 90°", color: "#fbbf24", values: resp.map((r) => r.phase / 90), dashed: true },
        ]}
        xLabel="Frequency, kHz"
        yLabel="relative"
        yMin={-1}
        yMax={1}
        cursor={st.frequency / 1000}
        caption="Series RLC response of the transmitter side (closed form). The operating frequency is the cursor."
        height={170}
      />
      <p className={lab.lessonNote}>This is the isolated LC formula. In the coupled, compensated link both sides are tuned to 85 kHz and the receiver’s load is reflected into the transmitter; at high coupling the single peak splits in two. The resonance stage shows the model’s first-harmonic waveforms of the full link.</p>
    </>
  );
}

/** Lesson 3: the road's speed, coverage and alignment against what the vehicle receives. */
function DynamicLesson() {
  const r = useTwin((s) => s.road);
  const set = useTwin((s) => s.setRoad);
  const read = useCallback(() => {
    const sim = runtime.road;
    const offsets = Array.from({ length: 41 }, (_, i) => -1 + i * 0.05);
    return {
      offsets,
      m: offsets.map((x) => segmentM(sim, Math.hypot(x, sim.inputs.lateral)) * 1e6),
      mNow: sim.state.mTotal * 1e6,
      ratio: sim.state.motionalRatio,
      pr: sim.state.pReceived,
      pt: sim.state.pTraction,
      v: sim.state.v,
    };
  }, []);
  const s = useSampled(read, 3);
  return (
    <>
      <p className={lab.lessonLead}>Drive the twin. The road, its pads and the charging HUD respond as you change how fast the car goes and how much of the road is electrified.</p>
      <Slider label="Speed" value={r.speed} min={2.8} max={36.1} step={0.28} scale={3.6} digits={0} unit="km/h" onChange={(v) => set({ speed: v })} />
      <Slider label="Road coverage" value={r.coverage} min={0.1} max={1} step={0.01} scale={100} digits={0} unit="%" onChange={(v) => set({ coverage: v })} />
      <Slider label="Gap between pads" value={r.segmentSpacing} min={0.05} max={0.6} step={0.01} scale={1000} digits={0} unit="mm" onChange={(v) => set({ segmentSpacing: v })} />
      <Slider label="Pad current (RMS)" value={r.primaryCurrent} min={20} max={60} step={1} unit="A" onChange={(v) => set({ primaryCurrent: v })} />
      <Slider label="Lateral offset" value={r.lateral} min={0} max={0.2} step={0.005} scale={1000} digits={0} unit="mm" onChange={(v) => set({ lateral: v })} />
      <Equation>
        λ₂ = L₂i₂ + M(x(t))·i₁ → e₂ = −(M·di₁/dt + v·i₁·dM/dx); now M = <strong>{fmt(s.mNow, 2)} µH</strong>, motional/transformer = <strong>{s.ratio > 0 ? s.ratio.toExponential(1) : "—"}</strong>
      </Equation>
      <Chart x={s.offsets} series={[{ name: "M per pad", color: "#22d3ee", values: s.m }]} xLabel="Receiver position relative to a pad centre, m" yLabel="M, µH" yMin={Math.min(0, ...s.m)} caption="Mutual inductance with one pad as the receiver crosses it, at the present lateral offset" height={160} />
      <p className={lab.lessonNote}>{`At ${fmt(s.v * 3.6, 0)} km/h the car receives ${fmt(s.pr / 1000, 1)} kW and its motor takes ${fmt(s.pt / 1000, 1)} kW. The motional term is tiny against the 85 kHz term, which is why the model can treat each instant as a steady state (quasi-static).`}</p>
    </>
  );
}

export function LearnLab() {
  const env = useTwin((s) => s.environment);
  const [lesson, setLesson] = useState<LessonId>(env === "dynamic" ? "dynamic" : "coupling");
  const choose = (l: (typeof LESSONS)[number]) => {
    setLesson(l.id);
    if (useTwin.getState().environment !== l.env) openEnvironment(l.env);
    // Show what the lesson is about: the alignment dimensions, the open cabinet, or the car on the road.
    useTwin.setState((s) => ({ view: l.id === "coupling" ? "engineering" : l.id === "resonance" ? "power" : "energy", guide: { ...s.guide, active: false, auto: false } }));
  };
  return (
    <section className={lab.learn} aria-label="Interactive experiments">
      <p className={lab.legendEyebrow}>Interactive experiment</p>
      <div className={lab.lessonTabs} role="tablist" aria-label="Experiments">
        {LESSONS.map((l) => (
          <button key={l.id} type="button" role="tab" aria-selected={lesson === l.id} onClick={() => choose(l)}>
            {l.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={LESSONS.find((l) => l.id === lesson)!.title} className={lab.lessonBody}>
        {lesson === "coupling" ? <CouplingLesson /> : lesson === "resonance" ? <ResonanceLesson /> : <DynamicLesson />}
      </div>
    </section>
  );
}
