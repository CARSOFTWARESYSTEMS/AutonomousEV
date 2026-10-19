"use client";

import { ENGINE_BLOCKS } from "@/data/apex/system";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import explorer from "./explorer.module.css";

const CROSS_ICON: Record<string, string> = {
  "engine-control": "↕",
  "sensors-instrumentation": "↕",
  thermal: "↕",
  mechanical: "↕",
};

/**
 * The engine as functional blocks: the propellant-to-thrust chain, and the
 * cross-cutting systems that act on every block. No parameters are shown.
 */
export function EngineSystemView() {
  const { open } = usePanel();
  const flow = ENGINE_BLOCKS.filter((block) => block.kind === "flow");
  const cross = ENGINE_BLOCKS.filter((block) => block.kind === "cross-cutting");
  return (
    <div>
      <div className={explorer.engine}>
        <ol className={explorer.flowCol} aria-label="Propellant to thrust">
          {flow.map((block, i) => (
            <li key={block.id} style={{ display: "contents" }}>
              <button type="button" className={explorer.flowBlock} aria-haspopup="dialog" onClick={(event) => open({ kind: "engine-block", id: block.id }, event.currentTarget)}>
                <span className={styles.specLabel}>{String(i + 1).padStart(2, "0")} · Flow</span>
                <span className={explorer.flowBlockTitle}>{block.name}</span>
                <span className={styles.small}>{block.does}</span>
              </button>
              {i < flow.length - 1 && <span className={explorer.flowConnector} aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <ul className={explorer.crossCol} aria-label="Cross-cutting systems">
          {cross.map((block) => (
            <li key={block.id} style={{ display: "contents" }}>
              <button type="button" className={explorer.crossBlock} aria-haspopup="dialog" onClick={(event) => open({ kind: "engine-block", id: block.id }, event.currentTarget)}>
                <span className={explorer.crossIcon} aria-hidden="true">
                  {CROSS_ICON[block.id]}
                </span>
                <span style={{ display: "grid", gap: 4 }}>
                  <span className={explorer.flowBlockTitle}>{block.name}</span>
                  <span className={styles.small}>{block.does}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={explorer.engineLegend}>
        <span>
          <span className={explorer.keySolid} aria-hidden="true" /> Propellant-to-thrust chain
        </span>
        <span>
          <span className={explorer.keyDashed} aria-hidden="true" /> Acts on every block (↕)
        </span>
        <span>Select a block for its interfaces, verification and partners</span>
      </div>
    </div>
  );
}
