"use client";
// Research Lab: define a study, sweep an independent variable through the
// engine, save and compare experiments, and export reproducible records.
import { useMemo, useState } from "react";
import { Download, FileText, Play, Save, Trash2 } from "lucide-react";
import { DEFAULT_CHAIN, solveChain } from "@/lib/wireless-charging/chain";
import { resonantCapacitance } from "@/lib/wireless-charging/circuits";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { AI_NOTE, AI_STUDIES, NOVELTY_NOTE, PRODUCT, RESEARCH_THEMES } from "@/lib/wireless-charging/content";
import { DYNAMIC_MODEL_VERSION, runDrive } from "@/lib/wireless-charging/dynamic";
import { linspace } from "@/lib/wireless-charging/math";
import { STATION_MODEL_VERSION } from "@/lib/wireless-charging/station";
import { useTwin } from "../state/store";
import Chart from "../ui/Chart";
import { download, fmt, Select } from "../ui/controls";
import ui from "../twin.module.css";

type StudyId = "gap" | "lateral" | "frequency" | "power" | "coverage" | "speed";

const STUDIES: { id: StudyId; label: string; unit: string; from: number; to: number; points: number; outputs: string[]; model: string }[] = [
  { id: "gap", label: "Air gap", unit: "mm", from: 80, to: 280, points: 21, outputs: ["k", "linkEfficiency", "efficiency", "i1"], model: "WPT-EM-001 + WPT-SYS-001" },
  { id: "lateral", label: "Lateral misalignment", unit: "mm", from: 0, to: 250, points: 21, outputs: ["k", "linkEfficiency", "efficiency", "i1"], model: "WPT-EM-001 + WPT-SYS-001" },
  { id: "frequency", label: "Operating frequency (fixed tuning)", unit: "kHz", from: 79, to: 90, points: 23, outputs: ["linkEfficiency", "efficiency", "phase", "i1"], model: "WPT-CIR-001 + WPT-SYS-001" },
  { id: "power", label: "Charging power", unit: "kW", from: 1, to: 22, points: 22, outputs: ["efficiency", "linkEfficiency", "loss", "i1"], model: "WPT-SYS-001" },
  { id: "coverage", label: "Road coverage", unit: "%", from: 10, to: 100, points: 10, outputs: ["energyPerKm", "dSoc", "roadEff"], model: "WPT-SIM-002" },
  { id: "speed", label: "Driving speed", unit: "km/h", from: 20, to: 130, points: 12, outputs: ["energyPerKm", "dSoc", "roadEff"], model: "WPT-SIM-002" },
];

const OUTPUT_LABEL: Record<string, string> = {
  k: "Coupling k",
  linkEfficiency: "Coil-to-coil efficiency, %",
  efficiency: "Grid-to-battery efficiency, %",
  i1: "Primary current, A",
  phase: "Input phase, °",
  loss: "Total loss, W",
  energyPerKm: "Energy received, Wh/km",
  dSoc: "SOC change over 400 m, %",
  roadEff: "Grid-to-received efficiency, %",
};

interface Experiment {
  id: string;
  created: string;
  title: string;
  hypothesis: string;
  notes: string;
  study: StudyId;
  x: number[];
  results: Record<string, number[]>;
  inputs: unknown;
  versions: string[];
  seed: number;
}

const STORE_KEY = "wevct-experiments-v1";
function loadSaved(): Experiment[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]") as Experiment[];
  } catch {
    return [];
  }
}
function persist(list: Experiment[]) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-20)));
  } catch {
    /* storage unavailable: experiments remain until the page closes */
  }
}

function runStudy(study: StudyId, station: ReturnType<typeof useTwin.getState>["station"], road: ReturnType<typeof useTwin.getState>["road"]) {
  const def = STUDIES.find((s) => s.id === study)!;
  const x = linspace(def.from, def.to, def.points);
  const results: Record<string, number[]> = Object.fromEntries(def.outputs.map((o) => [o, []]));
  const tx = { ...DEFAULT_TX_PAD, turns: station.txTurns };
  const rx = { ...DEFAULT_RX_PAD, turns: station.rxTurns };
  const nominal = computeCoupler({ tx, rx, airGap: 0.15, lateral: 0, longitudinal: 0 });
  for (const v of x) {
    if (study === "coverage" || study === "speed") {
      const s = runDrive({ ...road, profile: "constant", coverage: study === "coverage" ? v / 100 : road.coverage, speed: study === "speed" ? v / 3.6 : road.speed }, 400).summary;
      results.energyPerKm.push(s.energyPerKm / 3600);
      results.dSoc.push((s.socEnd - s.socStart) * 100);
      results.roadEff.push(s.efficiency * 100);
      continue;
    }
    const gap = study === "gap" ? v / 1000 : station.airGap;
    const lat = study === "lateral" ? v / 1000 : station.lateral;
    const f = study === "frequency" ? v * 1000 : 85000;
    const c = computeCoupler({ tx, rx, airGap: gap, lateral: lat, longitudinal: study === "lateral" ? 0 : station.longitudinal });
    const setup = { tx, rx, L1: c.L1, L2: c.L2, M: c.M, C1: resonantCapacitance(nominal.L1, 85000), C2: resonantCapacitance(nominal.L2, 85000), frequency: f, txTemperature: 40, rxTemperature: 40, inverterTemperature: 40, gridLimit: 1e6 };
    const pt = solveChain(DEFAULT_CHAIN, setup, study === "power" ? v * 1000 : station.stationPower || 11000);
    const ok = pt.feasible && pt.ss;
    const val: Record<string, number> = {
      k: c.k,
      linkEfficiency: ok ? pt.linkEfficiency * 100 : Number.NaN,
      efficiency: ok ? pt.efficiency * 100 : Number.NaN,
      i1: pt.ss ? Math.hypot(pt.ss.i1.re, pt.ss.i1.im) : Number.NaN,
      phase: pt.ss ? (pt.ss.phaseIn * 180) / Math.PI : Number.NaN,
      loss: ok ? pt.totalLoss : Number.NaN,
    };
    for (const o of def.outputs) results[o].push(val[o]);
  }
  return { x, results, versions: study === "coverage" || study === "speed" ? [DYNAMIC_MODEL_VERSION] : ["WPT-EM-001 v1.0.0", "WPT-SYS-001 v1.0.0", STATION_MODEL_VERSION] };
}

function toCsv(e: Experiment): string {
  const def = STUDIES.find((s) => s.id === e.study)!;
  const head = [`${def.label} (${def.unit})`, ...Object.keys(e.results).map((k) => OUTPUT_LABEL[k])];
  const rows = e.x.map((x, i) => [x, ...Object.values(e.results).map((v) => v[i])].join(","));
  return [`# ${e.title}`, `# ${PRODUCT.name} · models ${e.versions.join("; ")} · seed ${e.seed} · ${e.created}`, head.join(","), ...rows].join("\n");
}

function toReport(e: Experiment): string {
  const def = STUDIES.find((s) => s.id === e.study)!;
  const lines = [
    `# ${e.title}`,
    "",
    `Generated by the ${PRODUCT.name} (${PRODUCT.brand}) on ${e.created}. All values are SIMULATED.`,
    "",
    "## Research question and hypothesis",
    e.hypothesis || "_Not stated._",
    "",
    "## Method",
    `- Independent variable: ${def.label}, ${def.from}–${def.to} ${def.unit}, ${def.points} points.`,
    `- Dependent variables: ${Object.keys(e.results).map((k) => OUTPUT_LABEL[k]).join("; ")}.`,
    "- Controlled variables: every other input as recorded below.",
    `- Models: ${e.versions.join("; ")}. Seed ${e.seed}. Deterministic: rerunning with these inputs reproduces the results.`,
    "",
    "## Results",
    "",
    `| ${def.label} (${def.unit}) | ${Object.keys(e.results).map((k) => OUTPUT_LABEL[k]).join(" | ")} |`,
    `|${"---|".repeat(Object.keys(e.results).length + 1)}`,
    ...e.x.map((x, i) => `| ${fmt(x, 2)} | ${Object.values(e.results).map((v) => fmt(v[i], 3)).join(" | ")} |`),
    "",
    "## Observations",
    e.notes || "_None recorded._",
    "",
    "## Limitations",
    "Analytical and averaged models (fidelity F1–F2), not experimentally validated. See the model registry for assumptions and validity ranges.",
    "",
    "## Inputs",
    "```json",
    JSON.stringify(e.inputs, null, 2),
    "```",
  ];
  return lines.join("\n");
}

export default function ResearchSection() {
  const station = useTwin((s) => s.station);
  const road = useTwin((s) => s.road);
  const [study, setStudy] = useState<StudyId>("lateral");
  const [title, setTitle] = useState("Misalignment tolerance of the default coupler");
  const [hypothesis, setHypothesis] = useState("End-to-end efficiency stays above 90 % up to 100 mm lateral offset at 11 kW.");
  const [notes, setNotes] = useState("");
  const [current, setCurrent] = useState<Experiment | null>(null);
  const [saved, setSaved] = useState<Experiment[]>(() => (typeof window === "undefined" ? [] : loadSaved()));
  const [compare, setCompare] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const def = STUDIES.find((s) => s.id === study)!;
  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      const r = runStudy(study, station, road);
      setCurrent({ id: `exp-${Date.now()}`, created: new Date().toISOString(), title, hypothesis, notes, study, x: r.x, results: r.results, inputs: study === "coverage" || study === "speed" ? road : station, versions: r.versions, seed: 7 });
      setBusy(false);
    }, 20);
  };
  const other = saved.find((e) => e.id === compare && current && e.study === current.study);
  const firstOut = current ? Object.keys(current.results)[0] : null;
  const colors = ["#5ee7ff", "#f5b041", "#4ca930", "#b388ff"];
  const sameStudySaved = useMemo(() => saved.filter((e) => current && e.study === current.study && e.id !== current.id), [saved, current]);
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Research Laboratory</p>
        <h2>Design an experiment, run it, keep the evidence</h2>
        <p>Problem → hypothesis → variables → sweep → comparison → conclusions, with every run reproducible from its exported record.</p>
      </header>
      <section className={ui.labBlock} aria-labelledby="design-title">
        <h3 id="design-title">Experiment design</h3>
        <div className={ui.columns2}>
          <div className={ui.form}>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Hypothesis
              <textarea rows={3} value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
            </label>
            <label>
              Observations and notes
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </div>
          <div>
            <Select label="Independent variable" value={study} options={STUDIES.map((s) => ({ id: s.id, label: s.label }))} onChange={setStudy} />
            <p className={ui.small}>{`Range ${def.from}–${def.to} ${def.unit}, ${def.points} points. Dependent: ${def.outputs.map((o) => OUTPUT_LABEL[o]).join("; ")}. Controlled: your current ${study === "coverage" || study === "speed" ? "road" : "station"} inputs. Model: ${def.model}.`}</p>
            <div className={ui.runBar}>
              <button type="button" onClick={run} disabled={busy}>
                <Play size={14} aria-hidden="true" /> {busy ? "Running…" : "Run sweep"}
              </button>
            </div>
          </div>
        </div>
      </section>
      {current && (
        <section className={ui.labBlock} aria-labelledby="results-title">
          <h3 id="results-title">{current.title}</h3>
          {Object.entries(current.results).map(([key, values], i) => (
            <Chart
              key={key}
              x={current.x}
              series={[{ name: "This run", color: colors[i % colors.length], values }, ...(other && other.results[key] ? [{ name: `Saved: ${other.title}`, color: "#9aa3ad", values: other.results[key], dashed: true }] : [])]}
              xLabel={`${def.label}, ${def.unit}`}
              yLabel={OUTPUT_LABEL[key]}
              height={key === firstOut ? 200 : 150}
            />
          ))}
          <div className={ui.runBar}>
            <button
              type="button"
              onClick={() => {
                const list = [...saved.filter((e) => e.id !== current.id), { ...current, title, hypothesis, notes }];
                setSaved(list);
                persist(list);
              }}
            >
              <Save size={14} aria-hidden="true" /> Save experiment
            </button>
            <button type="button" onClick={() => download(`${current.id}.csv`, toCsv(current), "text/csv")}>
              <Download size={14} aria-hidden="true" /> Export CSV
            </button>
            <button type="button" onClick={() => download(`${current.id}.json`, JSON.stringify({ ...current, title, hypothesis, notes, product: PRODUCT.name }, null, 2), "application/json")}>
              <Download size={14} aria-hidden="true" /> Export JSON
            </button>
            <button type="button" onClick={() => download(`${current.id}-report.md`, toReport({ ...current, title, hypothesis, notes }), "text/markdown")}>
              <FileText size={14} aria-hidden="true" /> Generate report
            </button>
            {sameStudySaved.length > 0 && (
              <label className={ui.inlineSelect}>
                Compare with{" "}
                <select value={compare} onChange={(e) => setCompare(e.target.value)}>
                  <option value="">—</option>
                  {sameStudySaved.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>
      )}
      {saved.length > 0 && (
        <section className={ui.labBlock} aria-labelledby="saved-title">
          <h3 id="saved-title">Saved experiments (this browser)</h3>
          <ul className={ui.savedList}>
            {saved.map((e) => (
              <li key={e.id}>
                <strong>{e.title}</strong> <span>{`${STUDIES.find((s) => s.id === e.study)?.label} · ${e.created.slice(0, 16).replace("T", " ")}`}</span>
                <button type="button" onClick={() => setCurrent(e)}>Open</button>
                <button
                  type="button"
                  aria-label={`Delete ${e.title}`}
                  onClick={() => {
                    const list = saved.filter((x) => x.id !== e.id);
                    setSaved(list);
                    persist(list);
                  }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className={ui.labBlock} aria-labelledby="themes-title">
        <h3 id="themes-title">Research themes</h3>
        <p className={ui.small}>{NOVELTY_NOTE}</p>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Theme</th>
              <th scope="col">Question</th>
              <th scope="col">Baseline in the twin</th>
            </tr>
          </thead>
          <tbody>
            {RESEARCH_THEMES.map((t) => (
              <tr key={t.title}>
                <th scope="row">{t.title}</th>
                <td>{t.question}</td>
                <td>{t.baseline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className={ui.labBlock} aria-labelledby="ai-title">
        <h3 id="ai-title">Artificial intelligence and optimisation</h3>
        <p className={ui.small}>{AI_NOTE}</p>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Problem</th>
              <th scope="col">Inputs → outputs</th>
              <th scope="col">Engineering baseline</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {AI_STUDIES.map((s) => (
              <tr key={s.problem}>
                <th scope="row">{s.problem}</th>
                <td>{`${s.inputs} → ${s.outputs}`}</td>
                <td>{s.baseline}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
