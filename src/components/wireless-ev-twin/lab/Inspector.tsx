"use client";
// The right-hand inspector. Component: what it is, what it does and what is
// happening now; how it works; its engineering detail — one level at a time.
// Science: the current stage's physics, equation and models. Data: the
// environment's result panels. Every value comes from the running models.
import { useCallback, useMemo, useState } from "react";
import { BookOpen, Boxes, Crosshair, FlaskConical, ListTree, X } from "lucide-react";
import { componentById } from "@/lib/wireless-charging/components";
import { fhaWaveforms } from "@/lib/wireless-charging/circuits";
import { FIDELITY, modelById } from "@/lib/wireless-charging/registry";
import { runtime, useSampled } from "../state/runtime";
import { type PanelId, useTwin } from "../state/store";
import { currentStage } from "../story/guide";
import Chart from "../ui/Chart";
import { Tag } from "../ui/controls";
import { liveValue } from "../ui/liveValues";
import { AutonomousResults, DynamicResults, InfrastructureResults } from "../env/OtherPanels";
import { StationResults, StationSequence } from "../env/StationPanels";
import lab from "./lab.module.css";

const SIDE: Record<string, string> = { wireless: "Wireless link", ground: "Ground side", vehicle: "Vehicle side", road: "Electrified road", grid: "Grid", infrastructure: "Infrastructure" };
/** Pad layers open in the exploded view; vehicle units in the vehicle assembly. */
const PAD_PARTS = new Set(["tx-enclosure", "fod-sensor", "tx-coil", "tx-ferrite", "tx-insulation", "tx-shield", "tx-base", "rx-enclosure", "rx-coil", "rx-ferrite"]);
const VEHICLE_PARTS = new Set(["battery-pack", "bms", "hv-junction", "traction", "rectifier", "dcdc", "rx-compensation", "vcu", "vehicle"]);
const LEVELS = ["Overview", "How it works", "Engineering"] as const;

function ModelChips({ ids }: { ids: string[] }) {
  if (!ids.length) return <p className={lab.muted}>Shown as construction; not simulated.</p>;
  return (
    <ul className={lab.models}>
      {ids.map((id) => {
        const m = modelById(id);
        return (
          <li key={id}>
            <strong>{id}</strong>
            <span>{m?.name}</span>
            {m && <span className={lab.fidelity}>{`${m.fidelity} ${FIDELITY[m.fidelity].name} · ${m.status}`}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function openSection(section: "physics" | "simulation" | "assurance", lesson?: string) {
  useTwin.setState({ section, lesson: lesson ?? null, selected: null, panel: "none" });
  document.getElementById("research-laboratory")?.scrollIntoView({ block: "start" });
}

function ComponentPanel({ id }: { id: string }) {
  const c = componentById(id);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Overview");
  const isolate = useTwin((s) => s.isolate);
  const view = useTwin((s) => s.view);
  const env = useTwin((s) => s.environment);
  const read = useCallback(() => (c ? c.telemetry.map(liveValue).filter((x): x is { label: string; value: string } => x !== null) : []), [c]);
  const live = useSampled(read, 4);
  if (!c) return null;
  const models = c.models.map(modelById).filter((m): m is NonNullable<ReturnType<typeof modelById>> => Boolean(m));
  const lesson = models.flatMap((m) => m.lessons)[0];
  const explode = PAD_PARTS.has(id) ? "exploded" : VEHICLE_PARTS.has(id) ? "assembly" : null;
  return (
    <div className={lab.inspectorBody}>
      <p className={lab.eyebrow}>{SIDE[c.side] ?? c.side}</p>
      <h3 className={lab.inspectorTitle}>{c.name}</h3>
      <div className={lab.levels} role="tablist" aria-label="Detail level">
        {LEVELS.map((l) => (
          <button key={l} type="button" role="tab" aria-selected={level === l} onClick={() => setLevel(l)}>
            {l}
          </button>
        ))}
      </div>
      {level === "Overview" && (
        <div role="tabpanel" aria-label="Overview">
          <dl className={lab.facts}>
            <div>
              <dt>What is it?</dt>
              <dd>{c.construction}</dd>
            </div>
            <div>
              <dt>What does it do?</dt>
              <dd>{c.purpose}</dd>
            </div>
          </dl>
          <p className={lab.subhead}>What is happening now</p>
          {live.length ? (
            <dl className={lab.live}>
              {live.map((v) => (
                <div key={v.label}>
                  <dt>{v.label}</dt>
                  <dd>{v.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={lab.muted}>No live quantity is modelled for this part.</p>
          )}
          <p className={lab.small}>
            <Tag kind="SIMULATED" /> from the running models
          </p>
        </div>
      )}
      {level === "How it works" && (
        <div role="tabpanel" aria-label="How it works">
          <dl className={lab.facts}>
            <div>
              <dt>Operating principle</dt>
              <dd>{c.principle}</dd>
            </div>
            <div>
              <dt>Inputs → outputs</dt>
              <dd>{`${c.inputs} → ${c.outputs}`}</dd>
            </div>
            <div>
              <dt>Circuit representation</dt>
              <dd>{c.circuit}</dd>
            </div>
          </dl>
          {models.map((m) => (
            <div key={m.id} className={lab.equations}>
              <p className={lab.subhead}>{`${m.id} · ${m.name}`}</p>
              <ul>
                {m.equations.slice(0, 4).map((e) => (
                  <li key={e}>
                    <code>{e}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {level === "Engineering" && (
        <div role="tabpanel" aria-label="Engineering">
          <dl className={lab.facts}>
            <div>
              <dt>Materials</dt>
              <dd>{c.materials}</dd>
            </div>
            <div>
              <dt>Characteristics</dt>
              <dd>{c.characteristics}</dd>
            </div>
            <div>
              <dt>Losses</dt>
              <dd>{c.losses}</dd>
            </div>
            <div>
              <dt>Thermal behaviour</dt>
              <dd>{c.thermal}</dd>
            </div>
            <div>
              <dt>Failure modes</dt>
              <dd>{c.failureModes.join("; ") || "—"}</dd>
            </div>
            <div>
              <dt>Safety</dt>
              <dd>{c.safety}</dd>
            </div>
            <div>
              <dt>Assumptions</dt>
              <dd>{c.assumptions}</dd>
            </div>
            <div>
              <dt>Fidelity and validation</dt>
              <dd>{`${c.fidelity} ${FIDELITY[c.fidelity].name} · ${c.status}. Fidelity and validation are separate: nothing here is experimentally validated.`}</dd>
            </div>
            {c.research.length > 0 && (
              <div>
                <dt>Research opportunities</dt>
                <dd>{c.research.join("; ")}</dd>
              </div>
            )}
          </dl>
          <ModelChips ids={c.models} />
        </div>
      )}
      <div className={lab.actions}>
        <button type="button" onClick={() => useTwin.getState().setCamera({ mode: "guided", nonce: useTwin.getState().camera.nonce + 1, focus: true })}>
          <Crosshair size={14} aria-hidden="true" /> Frame
        </button>
        <button type="button" aria-pressed={isolate} onClick={() => useTwin.setState({ isolate: !isolate })}>
          <Boxes size={14} aria-hidden="true" /> Isolate
        </button>
        {explode && env !== "infrastructure" && (
          <button type="button" aria-pressed={view === explode} onClick={() => useTwin.setState((s) => ({ view: s.view === explode ? "cinematic" : explode, guide: { ...s.guide, active: false, auto: false } }))}>
            <ListTree size={14} aria-hidden="true" /> {explode === "exploded" ? "Explode pads" : "Explode vehicle"}
          </button>
        )}
        {lesson && (
          <button type="button" onClick={() => openSection("physics", lesson)}>
            <BookOpen size={14} aria-hidden="true" /> Lesson
          </button>
        )}
        {models.length > 0 && (
          <button type="button" onClick={() => openSection("simulation")}>
            <FlaskConical size={14} aria-hidden="true" /> Experiment
          </button>
        )}
        <button type="button" onClick={() => openSection("assurance")}>
          Model status
        </button>
      </div>
    </div>
  );
}

function Waveforms() {
  const read = useCallback(() => {
    const p = runtime.station.state.point;
    if (!p.ss) return null;
    return fhaWaveforms(p.ss, runtime.station.params.chain.vdcLink, runtime.station.state.alphaApplied || p.alpha, p.vdc2, 120);
  }, []);
  const w = useSampled(read, 2);
  if (!w) return <p className={lab.muted}>The inverter is off: no waveform.</p>;
  const us = w.t.map((t) => t * 1e6);
  return <Chart x={us} xLabel="Time, µs (one cycle)" yLabel="V, A" height={150} series={[{ name: "Inverter output v₁ (÷10)", color: "#f5b041", values: w.v1.map((v) => v / 10) }, { name: "Transmitter current i₁", color: "#5ad1ff", values: w.i1 }, { name: "Receiver current i₂", color: "#4ca930", values: w.i2, dashed: true }]} caption="First-harmonic model waveforms of the present operating point (not a switching-level simulation)." />;
}

function SciencePanel() {
  const stageId = useTwin((s) => s.guide.stageId);
  const active = useTwin((s) => s.guide.active);
  const stage = useMemo(() => (stageId ? currentStage() : null), [stageId]);
  if (!stage || !active)
    return (
      <div className={lab.inspectorBody}>
        <p className={lab.muted}>Open a stage of the guided sequence to see its physics here, or select a component.</p>
      </div>
    );
  const { physics } = stage;
  return (
    <div className={lab.inspectorBody}>
      <p className={lab.eyebrow}>Physics of this stage</p>
      <h3 className={lab.inspectorTitle}>{physics.concept}</h3>
      <p className={lab.equation}>{physics.equation}</p>
      {physics.note && <p className={lab.small}>{physics.note}</p>}
      <p className={lab.body}>{stage.explanation}</p>
      {stage.id === "resonance" && <Waveforms />}
      <p className={lab.subhead}>Models</p>
      <ModelChips ids={stage.models} />
      <div className={lab.actions}>
        {physics.lesson && (
          <button type="button" onClick={() => openSection("physics", physics.lesson)}>
            <BookOpen size={14} aria-hidden="true" /> Open the lesson
          </button>
        )}
        <button type="button" onClick={() => openSection("simulation")}>
          <FlaskConical size={14} aria-hidden="true" /> Run an experiment
        </button>
      </div>
    </div>
  );
}

function DataPanel() {
  const env = useTwin((s) => s.environment);
  return (
    <div className={lab.inspectorBody} data-panels>
      {env === "station" && <StationSequence />}
      {env === "station" ? <StationResults /> : env === "dynamic" ? <DynamicResults /> : env === "autonomous" ? <AutonomousResults /> : <InfrastructureResults />}
    </div>
  );
}

const TABS: { id: Exclude<PanelId, "none">; label: string }[] = [
  { id: "component", label: "Component" },
  { id: "science", label: "Science" },
  { id: "data", label: "Data" },
];

export default function InspectorPanel() {
  const panel = useTwin((s) => s.panel);
  const selected = useTwin((s) => s.selected);
  if (panel === "none") return null;
  return (
    <aside className={lab.inspector} aria-label="Inspector">
      <header className={lab.inspectorHead}>
        <div className={lab.tabs} role="tablist" aria-label="Inspector">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={panel === t.id} disabled={t.id === "component" && !selected} onClick={() => useTwin.setState({ panel: t.id })}>
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={lab.iconBtn}
          aria-label="Close the inspector"
          onClick={() => {
            if (selected) useTwin.getState().select(null);
            useTwin.setState({ panel: "none" });
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>
      {panel === "component" && selected ? <ComponentPanel key={selected} id={selected} /> : panel === "science" ? <SciencePanel /> : panel === "data" ? <DataPanel /> : null}
    </aside>
  );
}
