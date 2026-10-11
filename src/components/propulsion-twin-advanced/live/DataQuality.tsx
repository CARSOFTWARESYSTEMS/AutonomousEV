"use client";
// The data-quality layer, live: what each acquisition node reports about its
// own timing and integrity, before any model looks at the values.
import { useTwin } from "../state/useTwin";
import { CHANNEL_BY_ID } from "../simulation/channels";
import { InjectFault } from "../widgets/actions";
import css from "../advancedTwin.module.css";

const NODE_NAME = { feed: "Feed node", turbo: "Turbomachinery node", chamber: "Chamber node" } as const;

export default function DataQuality() {
  const { snapshot } = useTwin();
  if (!snapshot) {
    return (
      <p className={css.loading} role="status">
        Starting acquisition…
      </p>
    );
  }
  const { quality } = snapshot;
  return (
    <div className={css.twoCol}>
      <div className={css.tableWrap} role="region" aria-label="Acquisition node health" tabIndex={0}>
        <table className={css.miniTable}>
          <caption>
            Data quality: {quality.status} · SIMULATED
          </caption>
          <thead>
            <tr>
              <th scope="col">Acquisition node</th>
              <th scope="col">Latency</th>
              <th scope="col">Clock skew</th>
              <th scope="col">Sequence</th>
            </tr>
          </thead>
          <tbody>
            {quality.nodes.map((node) => (
              <tr key={node.node}>
                <th scope="row">{NODE_NAME[node.node]}</th>
                <td>
                  {Math.round(node.latencyMs)} ms{node.latencyMs > 120 ? " · LATE" : ""}
                </td>
                <td>
                  {Math.round(node.skewMs)} ms{node.skewMs > 40 ? " · OFFSET" : ""}
                </td>
                <td>{node.sequenceOk ? "In order" : "REPEATING"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className={css.groupLabel}>Findings</p>
        {quality.notes.length ? (
          <ul className={css.bullets} role="status">
            {quality.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className={css.hint} role="status">
            Every check passes. {quality.noisy.length ? "" : "No channel is noisier than its calibration."}
          </p>
        )}
        {quality.noisy.length > 0 && <p className={css.note}>Noisy channels are trusted less by the estimator: {quality.noisy.map((id) => CHANNEL_BY_ID[id].label).join(", ")}.</p>}
        <p className={css.groupLabel}>Break the data, not the engine</p>
        <div className={css.options}>
          <InjectFault fault="packet_delay">Packet delay</InjectFault>
          <InjectFault fault="timestamp_error">Timestamp error</InjectFault>
          <InjectFault fault="sensor_noise">Sensor noise</InjectFault>
          <InjectFault fault="telemetry_replay">Replayed telemetry</InjectFault>
        </div>
      </div>
    </div>
  );
}
