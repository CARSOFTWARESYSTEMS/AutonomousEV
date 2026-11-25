"use client";
// Simulation Lab: complete runs, headless and deterministic, with the
// visitor's current inputs. Each result states its model versions and seed.
import { useState } from "react";
import { Play } from "lucide-react";
import { DEFAULT_PARKING_INPUTS, runParking } from "@/lib/wireless-charging/autonomous";
import { DYNAMIC_MODEL_VERSION, runDrive } from "@/lib/wireless-charging/dynamic";
import { GRID_MODEL_VERSION, POLICIES, simulateDay } from "@/lib/wireless-charging/infrastructure";
import { ENVIRONMENTS } from "@/lib/wireless-charging/content";
import { runStationSession, STATION_MODEL_VERSION } from "@/lib/wireless-charging/station";
import { useTwin } from "../state/store";
import Chart from "../ui/Chart";
import { fmt, Readout, Slider } from "../ui/controls";
import ui from "../twin.module.css";

const later = <T,>(fn: () => T) => new Promise<T>((resolve) => window.setTimeout(() => resolve(fn()), 30));

const STATION_PRESETS = [
  { id: "residential", label: "Residential garage, 7.4 kW", patch: { stationPower: 7400, gridLimit: 9000, tariff: 7 } },
  { id: "office", label: "Office parking, 11 kW", patch: { stationPower: 11000, gridLimit: 22000, tariff: 9.5 } },
  { id: "depot", label: "Fleet depot, 22 kW", patch: { stationPower: 22000, gridLimit: 30000, tariff: 6.5 } },
  { id: "cold", label: "Cold morning, −8 °C pack", patch: { stationPower: 11000, batteryTemperature: -8, ambientTemperature: -6 } },
  { id: "misaligned", label: "Parked 90 mm off-centre", patch: { stationPower: 11000, lateral: 0.09, longitudinal: 0.03 } },
] as const;

function StationRun() {
  const base = useTwin((s) => s.station);
  const [preset, setPreset] = useState<(typeof STATION_PRESETS)[number]["id"]>("office");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runStationSession> | null>(null);
  const run = async () => {
    setBusy(true);
    const inputs = { ...base, ...STATION_PRESETS.find((p) => p.id === preset)!.patch };
    setResult(await later(() => runStationSession(inputs, { dt: 1, maxTime: 14 * 3600, sampleEvery: 60 })));
    setBusy(false);
  };
  const s = result?.samples ?? [];
  const r = result?.record;
  return (
    <section className={ui.labBlock} aria-labelledby="sim-station">
      <h3 id="sim-station">{`${ENVIRONMENTS[0].number} Stationary session to completion`}</h3>
      <div className={ui.runBar}>
        <select value={preset} onChange={(e) => setPreset(e.target.value as typeof preset)} aria-label="Scenario">
          {STATION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={run} disabled={busy}>
          <Play size={14} aria-hidden="true" /> {busy ? "Running…" : "Run session"}
        </button>
      </div>
      <p className={ui.small}>Uses your Digital Twin inputs with the scenario’s changes. Fixed 1 s step while charging (50 ms before), seed 20261125, {STATION_MODEL_VERSION}.</p>
      {result && r && (
        <>
          <dl className={ui.readouts}>
            <Readout label="Outcome" value={r.outcome} />
            <Readout label="Duration" value={(r.ended - r.started) / 3600} unit="h" digits={2} emphasis />
            <Readout label="Energy to battery" value={r.energyToBattery / 3.6e6} unit="kWh" digits={2} />
            <Readout label="Grid energy" value={r.gridEnergy / 3.6e6} unit="kWh" digits={2} />
            <Readout label="Session efficiency" value={r.gridEnergy > 0 ? (r.energyToBattery / r.gridEnergy) * 100 : null} unit="%" digits={1} />
            <Readout label="SOC" value={`${fmt(r.socStart * 100, 0)} → ${fmt(r.socEnd * 100, 1)}`} unit="%" />
            <Readout label="Cost" value={r.cost} unit="₹" digits={2} />
            <Readout label="Energy residual" value={result.residual} unit="J" digits={6} />
          </dl>
          <Chart x={s.map((p) => p.t / 3600)} series={[{ name: "Battery power", color: "#4ca930", values: s.map((p) => p.pBattery / 1000) }, { name: "Grid power", color: "#f5b041", values: s.map((p) => p.pGrid / 1000), dashed: true }]} xLabel="Time, h" yLabel="Power, kW" caption="Constant power, then the CV taper as the cells approach their voltage limit." />
          <Chart x={s.map((p) => p.t / 3600)} series={[{ name: "SOC", color: "#5ee7ff", values: s.map((p) => p.soc * 100) }]} xLabel="Time, h" yLabel="SOC, %" height={150} />
          <Chart x={s.map((p) => p.t / 3600)} series={[{ name: "Pad winding", color: "#f59e0b", values: s.map((p) => p.tTx) }, { name: "Battery", color: "#b388ff", values: s.map((p) => p.tBat) }]} xLabel="Time, h" yLabel="Temperature, °C" height={150} />
        </>
      )}
    </section>
  );
}

function DriveRun() {
  const base = useTwin((s) => s.road);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<{ speed: number; coverage: number; s: ReturnType<typeof runDrive>["summary"] }[]>([]);
  const run = async () => {
    setBusy(true);
    const out: typeof rows = [];
    for (const speed of [30, 60, 90, 120]) for (const coverage of [0.3, 0.6, 1]) out.push({ speed, coverage, s: await later(() => runDrive({ ...base, speed: speed / 3.6, coverage, profile: "constant" }, 400).summary) });
    setRows(out);
    setBusy(false);
  };
  return (
    <section className={ui.labBlock} aria-labelledby="sim-drive">
      <h3 id="sim-drive">{`${ENVIRONMENTS[1].number} Coverage and speed study`}</h3>
      <div className={ui.runBar}>
        <button type="button" onClick={run} disabled={busy}>
          <Play size={14} aria-hidden="true" /> {busy ? "Running 12 drives…" : "Run 12 drives of 400 m"}
        </button>
      </div>
      <p className={ui.small}>{`Steady speed, your road and vehicle settings otherwise. 1 ms step, ${DYNAMIC_MODEL_VERSION}.`}</p>
      {rows.length > 0 && (
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Speed</th>
              <th scope="col">Coverage</th>
              <th scope="col">Received</th>
              <th scope="col">ΔSOC</th>
              <th scope="col">Regime</th>
              <th scope="col">Grid→received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.speed}-${r.coverage}`}>
                <th scope="row">{`${r.speed} km/h`}</th>
                <td>{`${r.coverage * 100} %`}</td>
                <td>{`${fmt(r.s.energyPerKm / 3600, 0)} Wh/km`}</td>
                <td>{`${fmt((r.s.socEnd - r.s.socStart) * 100, 3)} %`}</td>
                <td data-regime={r.s.regime}>{r.s.regime}</td>
                <td>{`${fmt(r.s.efficiency * 100, 1)} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function ParkingRun() {
  const base = useTwin((s) => s.parking);
  const [busy, setBusy] = useState(false);
  const [trials, setTrials] = useState(20);
  const [out, setOut] = useState<{ errors: number[]; ks: number[] } | null>(null);
  const run = async () => {
    setBusy(true);
    const errors: number[] = [];
    const ks: number[] = [];
    for (let seed = 1; seed <= trials; seed++) {
      const sim = await later(() => runParking({ ...DEFAULT_PARKING_INPUTS, ...base, seed }));
      const e = sim.state.finalError!;
      errors.push(Math.hypot(e.lateral, e.longitudinal) * 1000);
      ks.push(sim.state.finalK ?? 0);
    }
    setOut({ errors, ks });
    setBusy(false);
  };
  const bins = out ? Array.from({ length: 10 }, (_, i) => out.errors.filter((e) => e >= i * 20 && e < (i + 1) * 20).length) : [];
  return (
    <section className={ui.labBlock} aria-labelledby="sim-park">
      <h3 id="sim-park">{`${ENVIRONMENTS[2].number} Monte Carlo parking accuracy`}</h3>
      <Slider label="Trials (seeds 1…N)" value={trials} min={5} max={60} step={5} onChange={setTrials} />
      <div className={ui.runBar}>
        <button type="button" onClick={run} disabled={busy}>
          <Play size={14} aria-hidden="true" /> {busy ? "Running…" : `Run ${trials} manoeuvres`}
        </button>
      </div>
      {out && (
        <>
          <dl className={ui.readouts}>
            <Readout label="Mean alignment error" value={out.errors.reduce((a, b) => a + b, 0) / out.errors.length} unit="mm" digits={1} emphasis />
            <Readout label="Worst" value={Math.max(...out.errors)} unit="mm" digits={1} />
            <Readout label="Mean coupling" value={out.ks.reduce((a, b) => a + b, 0) / out.ks.length} digits={3} />
          </dl>
          <Chart x={bins.map((_, i) => i * 20 + 10)} series={[{ name: "Count", color: "#5ee7ff", values: bins }]} xLabel="Alignment error, mm (20 mm bins)" yLabel="Manoeuvres" height={150} area />
        </>
      )}
    </section>
  );
}

function PolicyRun() {
  const base = useTwin((s) => s.grid);
  const [rows, setRows] = useState<{ id: string; name: string; t: ReturnType<typeof simulateDay>["totals"] }[]>([]);
  const run = () => setRows(POLICIES.map((p) => ({ id: p.id, name: p.name, t: simulateDay({ ...base, policy: p.id }).totals })));
  return (
    <section className={ui.labBlock} aria-labelledby="sim-grid">
      <h3 id="sim-grid">{`${ENVIRONMENTS[3].number} Allocation policies, one day`}</h3>
      <div className={ui.runBar}>
        <button type="button" onClick={run}>
          <Play size={14} aria-hidden="true" /> Compare five policies
        </button>
      </div>
      <p className={ui.small}>{`Same arrivals, weather and seed for every policy. ${GRID_MODEL_VERSION}.`}</p>
      {rows.length > 0 && (
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Policy</th>
              <th scope="col">Peak import</th>
              <th scope="col">Limit exceeded</th>
              <th scope="col">EV energy served</th>
              <th scope="col">Unserved</th>
              <th scope="col">Cost</th>
              <th scope="col">Renewable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.name}</th>
                <td>{`${fmt(r.t.peakImport, 0)} kW`}</td>
                <td>{`${fmt(r.t.limitViolationHours, 2)} h`}</td>
                <td>{`${fmt(r.t.evDelivered, 0)} kWh`}</td>
                <td>{`${fmt(r.t.evUnserved, 0)} kWh`}</td>
                <td>{`₹ ${fmt(r.t.cost, 0)}`}</td>
                <td>{`${fmt(r.t.renewableShare * 100, 1)} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function SimulationSection() {
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Simulation Lab</p>
        <h2>Run it to the end</h2>
        <p>Headless, deterministic runs of each environment. Identical inputs and seeds give identical results (check B10).</p>
      </header>
      <StationRun />
      <DriveRun />
      <ParkingRun />
      <PolicyRun />
    </div>
  );
}
