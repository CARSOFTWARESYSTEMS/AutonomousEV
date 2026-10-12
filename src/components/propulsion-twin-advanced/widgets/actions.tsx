"use client";
// Buttons that act on the shared twin from anywhere in the tutorial.
import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { DIAGNOSIS_BY_ID, type FaultId } from "../simulation/isolation";
import type { FaultOnset } from "../simulation/twinTypes";
import { useLabStore } from "../state/labStore";
import css from "../advancedTwin.module.css";

/**
 * Injects a fault into the shared simulation, replacing whatever was injected
 * before. With `lab` it also opens the Lab to watch it; without, the learner
 * stays where they are and watches the instrument in front of them. The
 * simulation is fetched first if this is the first thing to need it.
 */
export function InjectFault({ fault, lab = false, onset = "gradual", children }: { fault: FaultId; lab?: boolean; onset?: FaultOnset; children?: ReactNode }) {
  const boot = useLabStore((s) => s.boot);
  const inject = useLabStore((s) => s.inject);
  const setModule = useLabStore((s) => s.setModule);
  const run = async () => {
    await boot();
    inject(fault, undefined, onset);
    if (lab) setModule("lab");
  };
  const name = DIAGNOSIS_BY_ID[fault].name.toLowerCase();
  // The accessible name starts with the words on the button, so it can be spoken to; what it injects follows for a reader who cannot see the context.
  return (
    <button type="button" className={css.ghost} onClick={run} data-fault={fault}>
      <FlaskConical size={13} aria-hidden="true" /> {children ?? (lab ? "Inject in the Lab" : "Inject")}
      <span className={css.srOnly}>{lab ? `: ${name}, and open the Lab` : `: ${name}, into the simulation`}</span>
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
