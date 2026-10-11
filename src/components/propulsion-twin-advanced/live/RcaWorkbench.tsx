"use client";
// The root-cause analysis workbench: the twin's reasoning about whatever is
// happening in the simulation now, laid out as the chain an engineer would
// follow, from the symptom to the verification they should carry out.
import { useEffect } from "react";
import { trackAdvancedTwinOnce } from "../analytics";
import { RCA_STEPS } from "../data/fdir";
import { DIAGNOSIS_BY_ID, SYMPTOMS, SYMPTOM_BY_ID, type SymptomId } from "../simulation/isolation";
import { useTwin } from "../state/useTwin";
import { ShareBar, fmt, signed } from "../ui/charts";
import { InjectFault } from "../widgets/actions";
import { EvidenceList } from "./shared";
import css from "../advancedTwin.module.css";

export default function RcaWorkbench() {
  const { snapshot } = useTwin();
  const top = snapshot?.ranking[0];
  const concluded = Boolean(top && top.id !== "nominal" && snapshot?.confidence === "HIGH");
  useEffect(() => {
    if (concluded && top) trackAdvancedTwinOnce("root_cause_completed", { fault: top.id });
  }, [concluded, top]);

  if (!snapshot || !top) {
    return (
      <p className={css.loading} role="status">
        Calibrating the twin…
      </p>
    );
  }
  const graded = SYMPTOMS.filter((s) => Math.abs(snapshot.symptoms[s.id]) >= 0.05).sort((a, b) => Math.abs(snapshot.symptomZ[b.id]) - Math.abs(snapshot.symptomZ[a.id]));
  const lead = graded[0];
  const describe = (id: SymptomId) => (snapshot.symptoms[id] < 0 ? SYMPTOM_BY_ID[id].low : SYMPTOM_BY_ID[id].high);
  const physical = snapshot.ranking.filter((r) => r.physics !== null);
  const def = DIAGNOSIS_BY_ID[top.id];
  const { chamber } = snapshot;
  const quiet = top.id === "nominal";

  const body: Record<(typeof RCA_STEPS)[number]["id"], React.ReactNode> = {
    symptom: lead ? (
      <p>
        {describe(lead.id)}: {signed(snapshot.symptomZ[lead.id], 1)} standard deviations from its healthy baseline.
      </p>
    ) : (
      <p>None. Every piece of evidence is inside its healthy scatter.</p>
    ),
    evidence: graded.length ? (
      <ul className={css.bullets}>
        {graded.slice(0, 8).map((s) => (
          <li key={s.id}>
            {describe(s.id)} <span className={css.muted}>· {s.source} · {signed(snapshot.symptomZ[s.id], 1)} σ</span>
          </li>
        ))}
      </ul>
    ) : (
      <p>{SYMPTOMS.length} symptoms graded, none outside three standard deviations.</p>
    ),
    candidates: (
      <div className={css.shares}>
        {snapshot.ranking.slice(0, 4).map((r) => (
          <ShareBar key={r.id} label={DIAGNOSIS_BY_ID[r.id].name} value={r.p} strong={r.id === top.id} />
        ))}
      </div>
    ),
    physics: (
      <>
        <p>
          Pattern match for {DIAGNOSIS_BY_ID[snapshot.explained].name.toLowerCase()}: {Math.round((physical[0]?.physics ?? 0) * 100)} %.
        </p>
        <EvidenceList lines={snapshot.evidence} label="Physics evidence" limit={6} />
      </>
    ),
    cross: (
      <p>
        Chamber sensor A {fmt(snapshot.channels.pcA.estimated)} ({chamber.sensorA}), sensor B {fmt(snapshot.channels.pcB.estimated)} ({chamber.sensorB}), virtual sensor {fmt(chamber.virtual)}, thrust proxy {signed(snapshot.channels.thrust.z, 1)} σ. Data quality {snapshot.quality.status}.
      </p>
    ),
    ml: (
      <p>
        The learned classifier, on its own, gives {DIAGNOSIS_BY_ID[physical[0].id].name.toLowerCase()} {Math.round((physical[0].ml ?? 0) * 100)} %. {Math.abs((physical[0].ml ?? 0) - (physical[0].physics ?? 0)) < 0.35 ? "It agrees with the physics-based reasoning." : "It disagrees with the physics-based reasoning, which is itself a finding."}
      </p>
    ),
    confidence: (
      <p>
        <strong>
          {quiet ? "Nominal" : def.name}: {Math.round(top.p * 100)} % ({snapshot.confidence})
        </strong>
        {top.physics === null ? " Established by a direct check on the data, which takes precedence over inference from the data." : ""}
      </p>
    ),
    verification: <p>{def.investigation}</p>,
  };

  return (
    <div className={css.rca}>
      <ol className={css.rcaSteps}>
        {RCA_STEPS.map((step) => (
          <li key={step.id}>
            <p className={css.rcaLabel}>{step.label}</p>
            <p className={css.hint}>{step.text}</p>
            <div className={css.rcaBody}>{body[step.id]}</div>
          </li>
        ))}
      </ol>
      {quiet && (
        <div className={css.options}>
          <InjectFault fault="injector_restriction">Give it something to diagnose</InjectFault>
          <InjectFault fault="feed_pressure_reduction">Or a cause upstream of the symptom</InjectFault>
        </div>
      )}
    </div>
  );
}
