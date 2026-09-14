import type { ComponentType, ReactNode } from "react";
import styles from "../everyday-applications.module.css";

export interface Stage {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  body: ReactNode;
}

export default function StageAccordion({ stages, groupName }: { stages: Stage[]; groupName: string }) {
  return (
    <div className={styles.stageAccordion}>
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        return (
          <details key={stage.id} name={groupName} className={styles.stageAccordionItem} open={i === 0}>
            <summary>
              <span className={styles.stageAccordionNumber}>{String(i + 1).padStart(2, "0")}</span>
              {Icon && (
                <span className={styles.stageAccordionIcon}>
                  <Icon size={16} aria-hidden="true" />
                </span>
              )}
              <span>
                {stage.label}
                {stage.sublabel && <span className={styles.formNote}> · {stage.sublabel}</span>}
              </span>
            </summary>
            <div>{stage.body}</div>
          </details>
        );
      })}
    </div>
  );
}
