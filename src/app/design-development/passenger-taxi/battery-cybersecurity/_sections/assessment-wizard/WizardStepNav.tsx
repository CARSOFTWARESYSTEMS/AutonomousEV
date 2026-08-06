"use client";

import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "./WizardStepNav.module.css";

export interface WizardStepNavItem {
  id: string;
  label: string;
}

// Same WAI-ARIA tabs mechanics as SectionNav.tsx / NodeExplorer.tsx (Phases
// 1-2) — roving tabindex, Arrow/Home/End keys — reused a third time.
export function WizardStepNav({
  steps,
  currentId,
  completedIds,
  onSelect,
}: {
  steps: WizardStepNavItem[];
  currentId: string;
  completedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % steps.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + steps.length) % steps.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = steps.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      onSelect(steps[nextIndex].id);
    }
  };

  return (
    <div className={styles.scroller} role="tablist" aria-label="Assessment wizard steps">
      {steps.map((step, index) => {
        const isActive = step.id === currentId;
        const isComplete = completedIds.has(step.id) && !isActive;
        return (
          <button
            key={step.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={isActive ? styles.tabActive : isComplete ? styles.tabComplete : styles.tab}
            onClick={() => onSelect(step.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            data-track-event="bcs_wizard_step_nav"
            data-track-step={step.id}
          >
            {isComplete && <CheckCircle2 size={13} aria-hidden="true" />}
            {index + 1}. {step.label}
          </button>
        );
      })}
    </div>
  );
}
