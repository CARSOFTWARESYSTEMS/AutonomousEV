"use client";
// Physics & Mathematics: lessons in the nine-stage learning sequence, and the
// Equation Explorer, where every equation runs the engine's own functions.
import { useMemo, useState } from "react";
import { Box, Play } from "lucide-react";
import { CHECKS, runChecks } from "@/lib/wireless-charging/benchmarks";
import { DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { LEARNING_SEQUENCE, LESSONS } from "@/lib/wireless-charging/content";
import { defaultValues, EQUATIONS, sweepEquation } from "@/lib/wireless-charging/equations";
import { modelById } from "@/lib/wireless-charging/registry";
import { useTwin } from "../state/store";
import Chart from "../ui/Chart";
import { fmt, Slider } from "../ui/controls";
import FieldMap2D from "../ui/FieldMap2D";
import ui from "../twin.module.css";

function CheckRunner({ ids }: { ids: string[] }) {
  const [results, setResults] = useState<Record<string, { passed: boolean; measured: string }>>({});
  if (!ids.length) return null;
  return (
    <ul className={ui.checks}>
      {ids.map((id) => {
        const c = CHECKS.find((x) => x.id === id);
        const r = results[id];
        if (!c) return null;
        return (
          <li key={id} data-result={r ? (r.passed ? "pass" : "fail") : undefined}>
            <strong>{`${id} · ${c.title}`}</strong>
            <span>{`Expected: ${c.expected}`}</span>
            {r ? <span>{`${r.passed ? "Passed" : "Failed"} in this browser: ${r.measured}`}</span> : <span>Not run in this session.</span>}
            <button type="button" onClick={() => setResults((x) => ({ ...x, [id]: runChecks([id])[0] }))}>
              <Play size={13} aria-hidden="true" /> Run check
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function EquationExplorer({ initial }: { initial: string }) {
  const [id, setId] = useState(initial);
  const eq = EQUATIONS.find((e) => e.id === id) ?? EQUATIONS[0];
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  const v = useMemo(() => ({ ...defaultValues(eq), ...(values[eq.id] ?? {}) }), [eq, values]);
  const outputs = useMemo(() => eq.evaluate(v), [eq, v]);
  const sweep = useMemo(() => sweepEquation(eq, v), [eq, v]);
  const set = useTwin((s) => s.set);
  const model = eq.model ? modelById(eq.model) : undefined;
  const fieldConfig = useMemo(() => ({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: (v.gap ?? 150) / 1000, lateral: (v.lat ?? 0) / 1000, longitudinal: 0 }), [v.gap, v.lat]);
  return (
    <section className={ui.labBlock} aria-labelledby="eq-title">
      <h3 id="eq-title">Equation Explorer</h3>
      <div className={ui.eqPicker} role="tablist" aria-label="Equations">
        {EQUATIONS.map((e) => (
          <button key={e.id} type="button" role="tab" aria-selected={e.id === eq.id} onClick={() => setId(e.id)}>
            {e.title}
          </button>
        ))}
      </div>
      <div className={ui.eqGrid}>
        <div>
          <p className={ui.eyebrow}>{eq.domain}</p>
          <h4 className={ui.eqTitle}>{eq.title}</h4>
          <p className={ui.expression}>{eq.expression}</p>
          <p>{eq.interpretation}</p>
          <table className={ui.table}>
            <caption className={ui.srOnly}>Symbols</caption>
            <thead>
              <tr>
                <th scope="col">Symbol</th>
                <th scope="col">Meaning</th>
                <th scope="col">SI unit</th>
              </tr>
            </thead>
            <tbody>
              {eq.symbols.map((s) => (
                <tr key={s.symbol}>
                  <th scope="row" className={ui.mono}>{s.symbol}</th>
                  <td>{s.meaning}</td>
                  <td>{s.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5>Derivation</h5>
          <ol className={ui.steps}>
            {eq.derivation.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
          <h5>Assumptions</h5>
          <ul className={ui.bullets}>
            {eq.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <h5>Limiting cases</h5>
          <ul className={ui.bullets}>
            {eq.limits.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className={ui.small}>{`Validity: ${eq.validity}`}</p>
          <p className={ui.small}>{`Known limitations: ${eq.limitations.join(" ")}`}</p>
          {model && <p className={ui.small}>{`Implemented in ${model.implementation} (${model.id} v${model.version}, ${model.fidelity}, ${model.status}).`}</p>}
        </div>
        <div>
          <h5>Play: change the inputs</h5>
          {eq.params.map((p) => (
            <Slider key={p.key} label={p.label} value={v[p.key]} min={p.min} max={p.max} step={p.step} unit={p.unit} onChange={(x) => setValues((all) => ({ ...all, [eq.id]: { ...(all[eq.id] ?? {}), [p.key]: x } }))} />
          ))}
          <h5>Calculate: worked result</h5>
          <dl className={ui.readouts}>
            {outputs.map((o) => (
              <div key={o.label} className={ui.readout}>
                <dt>{o.label}</dt>
                <dd>
                  {fmt(o.value, o.digits ?? 3)}
                  {o.unit && <span>{` ${o.unit}`}</span>}
                </dd>
              </div>
            ))}
          </dl>
          {eq.sweep && sweep.x.length > 0 && <Chart x={sweep.x} series={[{ name: eq.sweep.yLabel, color: "#5ee7ff", values: sweep.y }]} xLabel={`${eq.sweep.label}${eq.sweep.unit ? `, ${eq.sweep.unit}` : ""}`} yLabel={`${eq.sweep.yLabel}${eq.sweep.yUnit ? `, ${eq.sweep.yUnit}` : ""}`} cursor={v[eq.sweep.key]} caption={`Computed by the engine at ${eq.sweep.points} points; the cursor marks your input.`} />}
          {eq.id === "coupling" && <FieldMap2D config={fieldConfig} currents={{ i1: { re: 30, im: 0 }, i2: { re: 0, im: -30 } }} label="Field section for the chosen gap and offset at 30 A in each coil, in quadrature" />}
          {eq.view && (
            <button type="button" className={ui.linkButton} onClick={() => set({ section: "twin", environment: eq.view!.environment, view: eq.view!.viewMode as never })}>
              <Box size={14} aria-hidden="true" /> See it in the 3D twin
            </button>
          )}
          <h5>Validate</h5>
          <CheckRunner ids={eq.checks} />
        </div>
      </div>
    </section>
  );
}

export default function PhysicsSection() {
  // A lesson opened from the laboratory's inspector arrives through the store.
  const [lessonId, setLessonId] = useState(() => {
    const wanted = useTwin.getState().lesson;
    return LESSONS.some((l) => l.id === wanted) ? wanted! : LESSONS[0].id;
  });
  const [stage, setStage] = useState<(typeof LEARNING_SEQUENCE)[number]>("Wonder");
  const lesson = LESSONS.find((l) => l.id === lessonId)!;
  const [eqKey, setEqKey] = useState(lesson.equations[0]);
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Physics &amp; Mathematics Laboratory</p>
        <h2>From a question to a validated equation</h2>
        <p>Every lesson follows Wonder → Discover → Play → Understand → Derive → Calculate → Experiment → Validate → Research, and every equation runs the same code as the twin.</p>
      </header>
      <section className={ui.labBlock} aria-labelledby="lessons-title">
        <h3 id="lessons-title">Lessons</h3>
        <div className={ui.lessonTabs} role="tablist" aria-label="Physics domains">
          {LESSONS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={l.id === lessonId}
              onClick={() => {
                setLessonId(l.id);
                setEqKey(l.equations[0]);
                setStage("Wonder");
              }}
            >
              <span>{l.domain}</span>
            </button>
          ))}
        </div>
        <h4 className={ui.eqTitle}>{lesson.title}</h4>
        <p className={ui.small}>{`Covers: ${lesson.topics.join(", ")}.`}</p>
        <ol className={ui.sequenceTabs} aria-label="Learning sequence">
          {LEARNING_SEQUENCE.map((st, i) => (
            <li key={st}>
              <button type="button" aria-current={st === stage ? "step" : undefined} onClick={() => setStage(st)}>
                <span>{i + 1}</span>
                {st}
              </button>
            </li>
          ))}
        </ol>
        <p className={ui.stageText}>{lesson.stages[stage]}</p>
        <p className={ui.small}>
          {"Equations: "}
          {lesson.equations.map((e) => (
            <button key={e} type="button" className={ui.inlineLink} onClick={() => setEqKey(e)}>
              {EQUATIONS.find((x) => x.id === e)?.title}
            </button>
          ))}
        </p>
      </section>
      <EquationExplorer key={eqKey} initial={eqKey} />
    </div>
  );
}
