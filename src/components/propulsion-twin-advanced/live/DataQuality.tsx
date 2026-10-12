"use client";
// The data-quality layer, live: what each acquisition node reports about its
// own timing and integrity, before any model looks at the values.
import { useTwin } from "../state/useTwin";
import { CHANNEL_BY_ID } from "../simulation/channels";
import { InjectFault } from "../widgets/actions";
import { TwinPending } from "./shared";
import css from "../advancedTwin.module.css";

const NODE_NAME = { feed: "Feed node", turbo: "Turbomachinery node", chamber: "Chamber node" } as const;

export default function DataQuality() {
  const { snapshot } = useTwin();
  if (!snapshot) {
    return (
      <TwinPending>Starting acquisition…</TwinPending>
    );
  }
  const { quality } = snapshot;
  return (
    <div className={css.twoCol}>
      <div className={css.tableWrap} data-stack="" role="region" aria-label="Acquisition node health" tabIndex={0}>
        <table className={css.miniTable} role="table" data-stack="">
          <caption>
            Data quality: {quality.status} · SIMULATED
          </caption>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">Acquisition node</th>
              <th scope="col" role="columnheader">Latency</th>
              <th scope="col" role="columnheader">Clock skew</th>
              <th scope="col" role="columnheader">Sequence</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {quality.nodes.map((node) => (
              <tr role="row" key={node.node}>
                <th scope="row" role="rowheader">{NODE_NAME[node.node]}</th>
                <td role="cell" data-label="Latency">
                  {Math.round(node.latencyMs)} ms{node.latencyMs > 120 ? " · LATE" : ""}
                </td>
                <td role="cell" data-label="Clock skew">
                  {Math.round(node.skewMs)} ms{node.skewMs > 40 ? " · OFFSET" : ""}
                </td>
                <td role="cell" data-label="Sequence">{node.sequenceOk ? "In order" : "REPEATING"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className={css.groupLabel}>Findings</p>
        {/* Only the verdict is announced: the findings carry numbers that change with every sample. */}
        <p className={css.srOnly} role="status">
          Data quality {quality.status}
        </p>
        {quality.notes.length ? (
          <ul className={css.bullets}>
            {quality.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className={css.hint}>
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
