"use client";
// The fault isolation tree for one symptom, low chamber pressure. Each branch
// is a possible cause; choosing one shows the evidence that would raise
// confidence in it and the evidence that would lower it. The evidence comes
// from the same fault patterns the live twin uses.
import { useState } from "react";
import { trackAdvancedTwin } from "../analytics";
import { FAULT_TREE, TREE_BRANCHES } from "../data/fdir";
import { DIAGNOSIS_BY_ID, expectedEvidence } from "../simulation/isolation";
import { InjectInLab } from "./actions";
import css from "../advancedTwin.module.css";

export default function FaultTree() {
  const [open, setOpen] = useState(TREE_BRANCHES[0].id);
  const branch = TREE_BRANCHES.find((b) => b.id === open) ?? TREE_BRANCHES[0];
  const evidence = expectedEvidence(branch.diagnosis);
  const raises = evidence.filter((e) => e.expect !== 0);
  const consistent = evidence.filter((e) => e.expect === 0).slice(0, 4);

  const choose = (id: string, diagnosis: string) => {
    setOpen(id);
    trackAdvancedTwin("diagnosis_opened", { fault: diagnosis });
  };

  return (
    <div className={css.tree}>
      <div className={css.treeTop}>
        <p className={css.treeRoot}>{FAULT_TREE.top}</p>
        <p className={css.treeNote}>Possible causes</p>
        <ul className={css.treeBranches} aria-label={`Possible causes of ${FAULT_TREE.top.toLowerCase()}`}>
          {TREE_BRANCHES.map((b) => (
            <li key={b.id}>
              <button type="button" className={css.treeBranch} aria-pressed={open === b.id} onClick={() => choose(b.id, b.diagnosis)}>
                <span aria-hidden="true">→</span> {b.cause}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={css.detail} role="region" aria-label={`Evidence for ${branch.cause}`} aria-live="polite">
        <p className={css.detailTitle}>{branch.cause}</p>
        <p>{branch.mechanism}</p>
        <p className={css.groupLabel}>Evidence that increases confidence</p>
        <ul className={css.evidenceList}>
          {raises.map((e) => (
            <li key={e.symptom} data-effect="supports">
              {e.text}
            </li>
          ))}
          {consistent.map((e) => (
            <li key={e.symptom} data-effect="supports">
              {e.text}
            </li>
          ))}
        </ul>
        <p className={css.groupLabel}>Evidence that decreases confidence</p>
        <ul className={css.evidenceList}>
          <li data-effect="contradicts">{branch.lowers}</li>
        </ul>
        <p className={css.groupLabel}>Recommended verification</p>
        <p>{DIAGNOSIS_BY_ID[branch.diagnosis].investigation}</p>
        <InjectInLab fault={branch.diagnosis}>See this branch in the Lab</InjectInLab>
      </div>
    </div>
  );
}
