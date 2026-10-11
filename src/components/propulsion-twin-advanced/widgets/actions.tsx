"use client";
// Buttons that act on the shared twin from anywhere in the tutorial.
import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { DIAGNOSIS_BY_ID, type FaultId } from "../simulation/isolation";
import { useLabStore } from "../state/labStore";
import css from "../advancedTwin.module.css";

/**
 * Injects a fault into the shared simulation, replacing whatever was injected
 * before. With `lab` it also opens the Lab to watch it; without, the learner
 * stays where they are and watches the instrument in front of them. The
 * simulation is fetched first if this is the first thing to need it.
 */
export function InjectFault({ fault, lab = false, children }: { fault: FaultId; lab?: boolean; children?: ReactNode }) {
  const boot = useLabStore((s) => s.boot);
  const inject = useLabStore((s) => s.inject);
  const setModule = useLabStore((s) => s.setModule);
  const run = async () => {
    await boot();
    useLabStore.getState().clearFaults();
    inject(fault);
    if (lab) setModule("lab");
  };
  const name = DIAGNOSIS_BY_ID[fault].name.toLowerCase();
  return (
    <button type="button" className={css.ghost} onClick={run} aria-label={lab ? `Inject ${name} in the Lab` : `Inject ${name} into the simulation`}>
      <FlaskConical size={13} aria-hidden="true" /> {children ?? (lab ? "Inject in the Lab" : "Inject")}
    </button>
  );
}

/** Injects a fault and opens the Lab. */
export function InjectInLab({ fault, children }: { fault: FaultId; children?: ReactNode }) {
  return (
    <InjectFault fault={fault} lab>
      {children}
    </InjectFault>
  );
}
