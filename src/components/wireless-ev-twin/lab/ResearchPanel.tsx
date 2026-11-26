"use client";
// Research mode's panel: what the present experiment is (environment, model
// versions, validation status, seed, inputs), where its data come from, a
// reproducible export, and — on the road — the three energy-outcome scenarios
// compared under one methodology, computed headless by the same engine. The
// Research Lab section keeps the sweeps and sensitivity studies; this panel
// links to it rather than duplicating it.
import { useState } from "react";
import { Download, FlaskConical, Play } from "lucide-react";
import { DEFAULT_ROAD_INPUTS, energyWindow, runDrive } from "@/lib/wireless-charging/dynamic";
import { FIDELITY, modelById } from "@/lib/wireless-charging/registry";
import { runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { ROAD_PRESETS, stagesFor } from "../story/stages";
import { download, fmt } from "../ui/controls";
import lab from "./lab.module.css";

const ENV_MODELS: Record<string, string[]> = {
  station: ["WPT-SIM-001", "WPT-EM-001", "WPT-EM-002", "WPT-CIR-001", "WPT-SYS-001", "WPT-BAT-001", "WPT-CTRL-001"],
  dynamic: ["WPT-SIM-002", "WPT-EM-001", "WPT-EM-005", "WPT-VEH-001", "WPT-BAT-001"],
  autonomous: ["WPT-AV-001", "WPT-AV-002", "WPT-AV-003"],
  infrastructure: ["WPT-GRID-001"],
};

const SCENARIOS = [
  { id: "charging", label: "Gaining", preset: ROAD_PRESETS.charging },
  { id: "neutral", label: "Neutral", preset: ROAD_PRESETS.neutral },
  { id: "discharging", label: "Losing", preset: ROAD_PRESETS.discharging },
] as const;

interface Row {
  label: string;
  speed: number;
  coverage: number;
  mean: number;
  received: number;
  traction: number;
  soc: number;
  regime: string;
}

/** Downloads the present experiment as a JSON record (inputs, models, seeds, state, comparison). */
function exportExperiment(env: string, stage: string | null, models: string[], rows: Row[] | null) {
  const s = useTwin.getState();
  const record = {
    generatedAt: new Date().toISOString(),
    dataMode: "SIMULATED",
    environment: env,
    stage,
    models: models.map((id) => ({ id, version: modelById(id)?.version, status: modelById(id)?.status, fidelity: modelById(id)?.fidelity })),
    seeds: { station: 20261125, road: 7 },
    inputs: env === "station" ? s.station : env === "dynamic" ? s.road : env === "autonomous" ? s.parking : s.grid,
    faults: env === "station" ? s.faults : undefined,
    state:
      env === "dynamic"
        ? { t: runtime.road.state.t, x: runtime.road.state.x, soc: runtime.road.state.battery.soc, energy: runtime.road.state.energy, window200m: energyWindow(runtime.road.state.samples) }
        : env === "station"
          ? { t: runtime.station.state.t, phase: runtime.station.state.phase, coupler: runtime.station.state.coupler, battery: runtime.station.state.battery }
          : undefined,
    comparison: rows,
  };
  download(`wireless-ev-twin-${env}-${Date.now()}.json`, JSON.stringify(record, null, 2), "application/json");
}

export function ResearchPanel() {
  const env = useTwin((s) => s.environment);
  const guide = useTwin((s) => s.guide);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const stage = guide.stageId ? stagesFor(guide.playlist)[guide.index] : null;
  const models = ENV_MODELS[env] ?? [];

  const compare = () => {
    setBusy(true);
    // Let the button repaint before the headless runs.
    window.setTimeout(() => {
      const out: Row[] = SCENARIOS.map((s) => {
        const inputs = { ...DEFAULT_ROAD_INPUTS, ...s.preset };
        // 400 m: two complete 200 m windows; the last one is classified.
        const { sim } = runDrive(inputs, 400, { seed: 7 });
        const w = energyWindow(sim.state.samples);
        return { label: s.label, speed: inputs.speed * 3.6, coverage: inputs.coverage * 100, mean: w.mean, received: w.meanReceived, traction: w.meanTraction, soc: w.socChange * 100, regime: w.complete ? w.regime : "incomplete window" };
      });
      setRows(out);
      setBusy(false);
    }, 30);
  };

  const exportRecord = () => exportExperiment(env, stage?.id ?? null, models, rows);

  return (
    <div className={lab.inspectorBody} data-panels>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>Experiment</p>
        <h3 className={lab.inspectorTitle}>{stage ? stage.title : "Free exploration"}</h3>
        <dl className={lab.facts}>
          <div>
            <dt>Data provenance</dt>
            <dd>Every value is SIMULATED by the models below from the inputs shown; nothing is measured or LIVE.</dd>
          </div>
          <div>
            <dt>Reproducibility</dt>
            <dd>Seeded simulations (station 20261125, road 7). The same inputs and steps give the same results (check B10).</dd>
          </div>
        </dl>
      </section>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>Models in use</p>
        <ul className={lab.modelList}>
          {models.map((id) => {
            const m = modelById(id);
            return m ? (
              <li key={id}>
                <strong>{id}</strong>
                <span>{m.name}</span>
                <small>{`v${m.version} · ${m.fidelity} ${FIDELITY[m.fidelity].name} · ${m.status}`}</small>
              </li>
            ) : null;
          })}
        </ul>
      </section>
      {env === "dynamic" && (
        <section className={lab.researchBlock}>
          <p className={lab.legendEyebrow}>Scenario comparison · one methodology</p>
          <p className={lab.small}>Each scenario drives 400 m from the same initial state and seed; the outcome is the time-weighted mean battery power over the last complete 200 m window, ±500 W neutral band. These are model-specific demonstration presets, not universal requirements.</p>
          <button type="button" className={lab.researchBtn} onClick={compare} disabled={busy}>
            <Play size={14} aria-hidden="true" /> {busy ? "Running three drives…" : "Run the comparison"}
          </button>
          {rows && (
            <div className={lab.compare}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Scenario</th>
                    <th scope="col">km/h</th>
                    <th scope="col">Cover</th>
                    <th scope="col">Received</th>
                    <th scope="col">Traction</th>
                    <th scope="col">Battery</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} data-regime={r.regime}>
                      <th scope="row">{r.label}</th>
                      <td>{fmt(r.speed, 0)}</td>
                      <td>{`${fmt(r.coverage, 0)} %`}</td>
                      <td>{`${fmt(r.received / 1000, 1)} kW`}</td>
                      <td>{`${fmt(r.traction / 1000, 1)} kW`}</td>
                      <td>{`${r.mean >= 0 ? "+" : "−"}${fmt(Math.abs(r.mean) / 1000, 2)} kW`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={lab.small}>Why they differ: traction power grows roughly with the cube of speed (drag), while the energy a pad can transfer falls with the time the receiver spends over it — and coverage sets how much of the road can deliver at all.</p>
            </div>
          )}
        </section>
      )}
      <div className={lab.actions}>
        <button type="button" onClick={exportRecord}>
          <Download size={14} aria-hidden="true" /> Export the experiment record
        </button>
        <button type="button" onClick={() => useTwin.setState({ section: "research", selected: null })}>
          <FlaskConical size={14} aria-hidden="true" /> Sweeps and sensitivity in the Research Lab
        </button>
      </div>
    </div>
  );
}
