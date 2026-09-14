"use client";
import { useState } from "react";
import { ROCKET_COMPONENTS, SYSTEM_LABELS, SYSTEM_COLORS, type RocketSystem } from "../rocketData";
import RocketDiagram from "./RocketDiagram";
import ComponentPanel from "./ComponentPanel";
import ComponentSheet from "./ComponentSheet";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../model-rocketry.module.css";

export default function RocketExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const selected = ROCKET_COMPONENTS.find((c) => c.id === selectedId) ?? null;
  const systems = Object.keys(SYSTEM_LABELS) as RocketSystem[];

  return (
    <div>
      <div className={styles.explorerGrid}>
        <div className={styles.diagramFrame}>
          <RocketDiagram components={ROCKET_COMPONENTS} selectedId={selectedId} onSelect={setSelectedId} />
          <div className={styles.legend} aria-hidden="true">
            {systems.map((s) => (
              <span key={s} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: SYSTEM_COLORS[s] }} />
                {SYSTEM_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
        {isDesktop && <ComponentPanel component={selected} />}
      </div>
      {!isDesktop && <ComponentSheet component={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
