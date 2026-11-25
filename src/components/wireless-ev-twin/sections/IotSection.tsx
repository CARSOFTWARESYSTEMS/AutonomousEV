"use client";
// IoT & Data: the message log of the running station, link fault
// experiments, per-signal data inspection, and comparison of an imported
// recorded dataset with the coupling model.
import { useCallback, useState } from "react";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { LINKS, type LinkId } from "@/lib/wireless-charging/network";
import { DATA_MODES, type DataMode } from "@/lib/wireless-charging/sensors";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import Chart from "../ui/Chart";
import { fmt, Slider, Tag, Toggle } from "../ui/controls";
import ui from "../twin.module.css";

const LAYERS = ["Physical devices", "Embedded control", "Edge gateway", "Communication network", "Cloud platform", "Digital twin", "Research & analytics"];

function readBus() {
  const bus = runtime.station.bus;
  return { log: bus.log.slice(-60).reverse(), stats: structuredClone(bus.stats), t: runtime.station.state.t, readings: runtime.station.sensors.readings(runtime.station.state.t) };
}

function LinkFaults() {
  const f = useTwin((s) => s.faults);
  const set = useTwin((s) => s.setFaults);
  const link = (id: LinkId) => f.links[id] ?? {};
  const patch = (id: LinkId, p: Record<string, number | boolean>) => set({ links: { ...f.links, [id]: { ...link(id), ...p } } });
  return (
    <div className={ui.columns2}>
      {(["vehicle", "backend", "cloud"] as LinkId[]).map((id) => (
        <fieldset key={id} className={ui.group}>
          <legend>{LINKS[id].name}</legend>
          <p className={ui.small}>{`${LINKS[id].technology}. ${LINKS[id].note}`}</p>
          <Toggle danger label="Link down" checked={link(id).up === false} onChange={(v) => patch(id, { up: !v })} />
          <Slider label="Packet loss" value={(link(id).loss as number) ?? 0} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => patch(id, { loss: v })} />
          <Slider label="Extra latency" value={(link(id).latency as number) ?? 0} min={0} max={1} step={0.01} scale={1000} unit="ms" onChange={(v) => patch(id, { latency: v })} />
          <Slider label="Duplicates" value={(link(id).duplicate as number) ?? 0} min={0} max={0.5} step={0.05} scale={100} unit="%" onChange={(v) => patch(id, { duplicate: v })} />
          <Toggle danger label="Wrong authentication key" checked={Boolean(link(id).badKey)} onChange={(v) => patch(id, { badKey: v })} />
        </fieldset>
      ))}
    </div>
  );
}

/** Recorded dataset: CSV with gap_mm, lateral_mm, k_measured, compared with the coupler model. */
function DatasetCompare() {
  const [rows, setRows] = useState<{ gap: number; lat: number; k: number; model: number }[]>([]);
  const [error, setError] = useState("");
  const onFile = async (file: File) => {
    setError("");
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    const head = lines[0].toLowerCase().split(",").map((s) => s.trim());
    const ig = head.indexOf("gap_mm");
    const il = head.indexOf("lateral_mm");
    const ik = head.indexOf("k_measured");
    if (ig < 0 || il < 0 || ik < 0) {
      setError("Expected a header with gap_mm, lateral_mm and k_measured.");
      return;
    }
    const out = lines
      .slice(1, 201)
      .map((l) => l.split(",").map(Number))
      .filter((c) => [c[ig], c[il], c[ik]].every(Number.isFinite))
      .map((c) => ({ gap: c[ig], lat: c[il], k: c[ik], model: computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: c[ig] / 1000, lateral: c[il] / 1000, longitudinal: 0 }).k }));
    if (!out.length) setError("No valid rows.");
    setRows(out);
  };
  const rmse = rows.length ? Math.sqrt(rows.reduce((a, r) => a + (r.k - r.model) ** 2, 0) / rows.length) : 0;
  return (
    <section className={ui.labBlock} aria-labelledby="ds-title">
      <h3 id="ds-title">Compare a recorded dataset with the model</h3>
      <p className={ui.small}>
        Load your own measurements (CSV: <code>gap_mm,lateral_mm,k_measured</code>, up to 200 rows). They are labelled <Tag kind="RECORDED" /> and stay in this browser. No dataset ships with the twin: there are no measurements yet.
      </p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && void onFile(e.target.files[0])} aria-label="Recorded dataset (CSV)" />
      {error && <p className={ui.warning}>{error}</p>}
      {rows.length > 0 && (
        <>
          <p>{`${rows.length} rows · RMS residual (measured − model) ${fmt(rmse, 4)}. Use it to calibrate the ferrite coverage factor before trusting the model's absolute values.`}</p>
          <Chart
            x={rows.map((_, i) => i + 1)}
            series={[
              { name: "Measured (RECORDED)", color: "#f5b041", values: rows.map((r) => r.k) },
              { name: "Model (SIMULATED)", color: "#5ee7ff", values: rows.map((r) => r.model), dashed: true },
            ]}
            xLabel="Row"
            yLabel="Coupling k"
          />
          <Chart x={rows.map((_, i) => i + 1)} series={[{ name: "Residual", color: "#dc2626", values: rows.map((r) => r.k - r.model) }]} xLabel="Row" yLabel="Residual" height={140} guides={[{ y: 0, label: "0" }]} />
        </>
      )}
    </section>
  );
}

export default function IotSection() {
  const s = useSampled(readBus, 3);
  const [sensorId, setSensorId] = useState("bat.soc");
  const [selected, setSelected] = useState<number | null>(null);
  const sensor = s.readings.find((r) => r.id === sensorId) ?? s.readings[0];
  const pick = useCallback((id: number) => setSelected((x) => (x === id ? null : id)), []);
  const msg = s.log.find((m) => m.id === selected);
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>IoT &amp; Communication Engineering Laboratory</p>
        <h2>A cyber-physical system, message by message</h2>
        <p>Every message below was produced by the running station simulation and passed through the simulated network. Cloud connectivity is never in the safety loop: try an internet outage while charging.</p>
      </header>
      <ol className={ui.layers} aria-label="Architecture layers">
        {LAYERS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ol>
      <section className={ui.labBlock} aria-labelledby="log-title">
        <h3 id="log-title">Message log</h3>
        <div className={ui.statsRow}>
          {(Object.keys(s.stats) as LinkId[]).filter((id) => s.stats[id].sent > 0).map((id) => {
            const st = s.stats[id];
            return (
              <p key={id}>
                <strong>{LINKS[id].name}</strong>
                {` sent ${st.sent} · lost ${st.lost} · duplicates ${st.duplicates} · stale ${st.stale} · auth failed ${st.authFailed} · mean latency ${fmt((st.latencySum / Math.max(1, st.delivered)) * 1000, 1)} ms`}
              </p>
            );
          })}
        </div>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Seq</th>
                <th scope="col">From → to</th>
                <th scope="col">Type</th>
                <th scope="col">Link</th>
                <th scope="col">Latency</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {s.log.map((m) => (
                <tr key={m.id} data-status={m.status} aria-selected={m.id === selected} onClick={() => pick(m.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && pick(m.id)}>
                  <td className={ui.mono}>{fmt(m.receivedAt, 2)}</td>
                  <td className={ui.mono}>{m.seq}</td>
                  <td>{`${m.src} → ${m.dst}`}</td>
                  <th scope="row">{m.type}</th>
                  <td>{m.link}</td>
                  <td className={ui.mono}>{`${fmt(m.latency * 1000, 1)} ms`}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && (
          <dl className={ui.facts}>
            <div><dt>Raw frame</dt><dd className={ui.mono}>{msg.raw}</dd></div>
            <div><dt>Decoded payload</dt><dd className={ui.mono}>{JSON.stringify(msg.payload)}</dd></div>
            <div><dt>Sent / received</dt><dd>{`${fmt(msg.sentAt, 3)} s / ${fmt(msg.receivedAt, 3)} s`}</dd></div>
            <div><dt>Authentication tag</dt><dd className={ui.mono}>{`${msg.tag} (${msg.status === "auth-failed" ? "failed" : "verified"}; FNV-1a, illustrative only)`}</dd></div>
            <div><dt>Freshness</dt><dd>{msg.status === "stale" ? "stale: older than the link's threshold" : "fresh"}</dd></div>
          </dl>
        )}
        <p className={ui.small}>Frame layout: type code, 16-bit sequence, then each field (numbers ×100 as int32). The dictionary is this simulator’s own, not an OEM CAN database; backend messages are OCPP-style names, not a conformance implementation.</p>
      </section>
      <section className={ui.labBlock} aria-labelledby="faults-title">
        <h3 id="faults-title">Communication fault experiments</h3>
        <LinkFaults />
      </section>
      <section className={ui.labBlock} aria-labelledby="inspect-title">
        <h3 id="inspect-title">Data inspection</h3>
        <label className={ui.inlineSelect}>
          Signal{" "}
          <select value={sensorId} onChange={(e) => setSensorId(e.target.value)}>
            {s.readings.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {sensor && (
          <dl className={ui.facts}>
            <div><dt>Engineering value</dt><dd>{`${fmt(sensor.value, 3)} ${sensor.unit}`}</dd></div>
            <div><dt>Raw value</dt><dd className={ui.mono}>{`${sensor.raw} counts`}</dd></div>
            <div><dt>Data mode</dt><dd><Tag kind={sensor.mode} /> {DATA_MODES[sensor.mode as DataMode]}</dd></div>
            <div><dt>Timestamp</dt><dd>{`${fmt(sensor.timestamp, 3)} s (age ${fmt(s.t - sensor.timestamp, 2)} s)`}</dd></div>
            <div><dt>Source</dt><dd>{sensor.source}</dd></div>
            <div><dt>Sampling</dt><dd>{`${sensor.sampleHz} Hz`}</dd></div>
            <div><dt>Calibration</dt><dd>{sensor.calibration}</dd></div>
            <div><dt>Quality</dt><dd>{sensor.quality}</dd></div>
            <div><dt>Uncertainty (≈95 %)</dt><dd>{`± ${fmt(sensor.uncertainty, 3)} ${sensor.unit}`}</dd></div>
            <div><dt>Model version</dt><dd>{sensor.modelVersion}</dd></div>
            <div><dt>Transformation history</dt><dd>{sensor.history.join(" → ")}</dd></div>
          </dl>
        )}
        <p className={ui.small}>Hardware adapter: no physical prototype connected. LIVE mode is unavailable until one is, and connecting it would not by itself validate any model.</p>
      </section>
      <DatasetCompare />
    </div>
  );
}
