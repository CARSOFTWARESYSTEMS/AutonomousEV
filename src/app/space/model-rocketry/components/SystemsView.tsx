"use client";
import { useState } from "react";
import { ROCKET_COMPONENTS, SYSTEM_LABELS, SYSTEM_COLORS, type RocketSystem } from "../rocketData";
import ComponentDetailBody from "./ComponentDetailBody";
import styles from "../model-rocketry.module.css";

export default function SystemsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const systems = Object.keys(SYSTEM_LABELS) as RocketSystem[];
  const selected = ROCKET_COMPONENTS.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <div className={styles.systemsGrid}>
        {systems.map((system) => (
          <div key={system} className={styles.systemGroup}>
            <div className={styles.systemGroupHead}>
              <span className={styles.systemDot} style={{ background: SYSTEM_COLORS[system] }} />
              <h4 style={{ margin: 0 }}>{SYSTEM_LABELS[system]}</h4>
            </div>
            <ul className={styles.systemMemberList}>
              {ROCKET_COMPONENTS.filter((c) => c.system === system).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={styles.systemMemberButton}
                    aria-pressed={selectedId === c.id}
                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.componentPanel} style={{ marginTop: 16 }} aria-live="polite">
        {selected ? (
          <ComponentDetailBody component={selected} />
        ) : (
          <p className={styles.componentPanelEmpty}>
            Select a component above to see its purpose, interfaces, failure modes and related careers within the mission system.
          </p>
        )}
      </div>
    </div>
  );
}
