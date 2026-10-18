"use client";
// The guided simulation: "Battery shows 60%, but scooter shuts down during
// acceleration." Each step reads the simulated pack and adds evidence; the
// same evidence engine as the real workflow ranks the causes, and the
// conclusion follows the evidence — never an automatic "replace battery".
import { useMemo, useState } from "react";
import { Check, Circle } from "lucide-react";
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { GUIDED_COMPLAINT, GUIDED_STEPS } from "@/data/ev-battery-toolkit/content";
import { FAULT_BY_ID } from "@/data/ev-battery-toolkit/faults";
import { toId, trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { INSUFFICIENT, REPAIR_STATUS_LABEL, newJobCard, repairDecision, rootCauseCandidates } from "@/lib/ev-battery-toolkit/diagnosis";
import { packLabel } from "@/lib/ev-battery-toolkit/pack";
import { formatNumber, round } from "@/lib/ev-battery-toolkit/provenance";
import { simulate, type SimulationResult } from "@/lib/ev-battery-toolkit/simulation";
import type { JobCard, MeasurementKey, ObservationKey } from "@/lib/ev-battery-toolkit/types";
import { useSimulation, useToolkit } from "../state/store";
import { ContextBanner, Pill } from "../ui/Badges";
import { startWorkspace } from "../workspace/Workspace";
import css from "../diagnosis.module.css";

const CASE_FAULT = "weak-cell";
export const CASE_TAG = "SIMULATED DIAGNOSTIC CASE";
const BMS_LABEL = { NORMAL: "Normal", WARNING: "Warning", PROTECTION: "Protection", OFFLINE: "Offline / no data" } as const;

function loadBehaviour(load: SimulationResult) {
  const v = load.snapshot.groupVoltages;
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  const drop = (avg - Math.min(...v)) * 1000;
  return drop > 200 ? "Shuts down under load" : drop > 80 ? "Voltage sag under load" : "Stable under load";
}

/** The simulated evidence the completed steps have produced, as a job card the engine can read. */
function evidenceJob(done: Set<string>, rest: SimulationResult, load: SimulationResult): JobCard {
  const job = newJobCard(new Date(0));
  job.complaintCategory = "shutdown-load";
  const s = rest.snapshot;
  const m = (key: MeasurementKey, value: number | null) => {
    job.before[key] = { key, value, provenance: value === null ? "NOT_AVAILABLE" : "SIMULATED" };
  };
  const o = (key: ObservationKey, value: string) => {
    job.observations[key] = { key, value, provenance: "SIMULATED" };
  };
  if (done.has("visual")) {
    o("enclosureDamage", "None");
    o("waterIngress", "None");
    o("corrosion", "None");
    o("swelling", "None");
  }
  if (done.has("bms")) {
    m("soc", s.soc.value);
    o("bmsStatus", BMS_LABEL[s.bmsState.value ?? "NORMAL"]);
    o("chargeEnable", s.chargeEnabled.value === false ? "Disabled" : "Enabled");
    o("dischargeEnable", s.dischargeEnabled.value === false ? "Disabled" : "Enabled");
    o("commStatus", Object.values(s.comms).every((l) => l === "ONLINE") ? "Online" : "Intermittent");
    o("bmsFaultCodes", s.faultCodes.value?.length ? s.faultCodes.value.join(", ") : "None");
  }
  if (done.has("pack")) m("packVoltage", s.packVoltage.value);
  if (done.has("groups")) {
    m("cellMin", s.minCellV.value);
    m("cellMax", s.maxCellV.value);
  }
  if (done.has("load")) o("loadBehaviour", loadBehaviour(load));
  if (done.has("thermal")) {
    m("tempMin", s.minTemp.value);
    m("tempMax", s.maxTemp.value);
    m("ambientTemp", 30);
    o("hotspotLocation", rest.trueTemps.some((t) => t - (s.minTemp.value ?? t) > 6) ? "Cell area" : "None found");
  }
  if (done.has("connector")) o("connectorCondition", "Good");
  return job;
}

export default function GuidedCase() {
  const { pack } = useSimulation();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(false);
  const fault = FAULT_BY_ID[CASE_FAULT];
  const rest = useMemo(() => simulate({ pack, fault, load: "rest" }), [pack, fault]);
  const load = useMemo(() => simulate({ pack, fault, load: "load" }), [pack, fault]);
  const job = useMemo(() => evidenceJob(done, rest, load), [done, rest, load]);
  // Simulation context: only SIMULATED evidence counts here, and nothing here reaches the real workflow.
  const candidates = useMemo(() => rootCauseCandidates(job, "simulation"), [job]);
  const decision = useMemo(() => repairDecision(job, candidates, "simulation"), [job, candidates]);
  const s = rest.snapshot;
  const nextIndex = GUIDED_STEPS.findIndex((st) => !done.has(st.id));

  const start = () => {
    const st = useToolkit.getState();
    st.setFaultMode("unknown");
    st.injectFault(CASE_FAULT);
    st.setLoad("rest");
    setDone(new Set());
    setActive(true);
    startWorkspace("guided_case");
    trackToolkit("diagnosis_started", { context: "simulation" });
  };

  const run = (id: string) => {
    const next = new Set(done);
    next.add(id);
    setDone(next);
    if (id === "load") useToolkit.getState().setLoad("load");
    if (id === "thermal") useToolkit.getState().setView("thermal");
    if (id === "decision") trackToolkit("diagnosis_completed", { context: "simulation", status: toId(decision.status) });
  };

  const evidence: Record<string, string> = {
    identify: `Generic simulated scooter · ${ARCHITECTURES[pack.config.architecture].name} · ${packLabel(pack)}`,
    visual: "No damage, water, corrosion or swelling.",
    bms: `SOC ${formatNumber(s.soc.value, "%")} · BMS ${s.bmsState.value ?? "—"} · fault codes: ${s.faultCodes.value?.length ? s.faultCodes.value.join(", ") : "none"}`,
    pack: `Pack voltage ${formatNumber(s.packVoltage.value, "V", 1)} at rest`,
    groups: `Maximum group ${formatNumber(s.maxCellV.value, "V", 3)} · minimum ${formatNumber(s.minCellV.value, "V", 3)} · delta ${formatNumber(s.cellDeltaMv.value, "mV")}`,
    load: `Under load: lowest group ${formatNumber(Math.min(...load.snapshot.groupVoltages), "V", 3)} (${round((load.snapshot.groupVoltages.reduce((a, b) => a + b, 0) / load.snapshot.groupVoltages.length - Math.min(...load.snapshot.groupVoltages)) * 1000, 0)} mV below average) — ${loadBehaviour(load).toLowerCase()}`,
    thermal: `BMS temperatures ${formatNumber(s.minTemp.value, "°C", 1)} – ${formatNumber(s.maxTemp.value, "°C", 1)}; no abnormal hot spot`,
    connector: "Connector fully engaged, no heat marks.",
    candidates: candidates.length ? candidates.slice(0, 3).map((c) => `${c.name} (${c.confidence})`).join(" · ") : "No candidate yet.",
    next: candidates[0]?.nextMeasurement ?? "Record more evidence.",
    decision: REPAIR_STATUS_LABEL[decision.status],
  };

  if (!active) {
    return (
      <div className={css.guided}>
        <ContextBanner context="simulation" />
        <p className={css.caseTag}>{CASE_TAG}</p>
        <p className={css.complaint}>
          <span>Example complaint</span> “{GUIDED_COMPLAINT}”
        </p>
        <ol className={css.stageOverview} aria-label="Guided diagnostic steps">
          {GUIDED_STEPS.map((st, i) => (
            <li key={st.id}>
              <span className={css.stageNum}>{i + 1}</span>
              <span>
                <strong>{st.title}</strong> {st.action}
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className={css.primary} onClick={start}>
          Start guided case
        </button>
      </div>
    );
  }

  return (
    <div className={css.guided}>
      <ContextBanner context="simulation" detail="The pack in the 3D explorer now carries this case's hidden fault." />
      <p className={css.caseTag}>{CASE_TAG}</p>
      <p className={css.complaint}>
        <span>Complaint</span> “{GUIDED_COMPLAINT}”
      </p>
      <div className={css.guidedLayout}>
        <ol className={css.guidedSteps}>
          {GUIDED_STEPS.map((st, i) => {
            const isDone = done.has(st.id);
            const available = i === nextIndex;
            return (
              <li key={st.id} data-done={isDone ? "" : undefined}>
                <span className={css.stepIcon}>{isDone ? <Check size={14} aria-label="Completed" /> : <Circle size={12} aria-label="Pending" />}</span>
                <div>
                  <p className={css.stepTitle}>{st.title}</p>
                  <p className={css.stepAction}>{st.action}</p>
                  {isDone ? <p className={css.stepEvidence}>{evidence[st.id]}</p> : null}
                </div>
                {available ? (
                  <button type="button" className={css.secondary} onClick={() => run(st.id)}>
                    Run step
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>
        <aside className={css.guidedSide} aria-live="polite">
          <dl className={css.counts}>
            <div>
              <dt>Tests completed</dt>
              <dd>{done.size}</dd>
            </div>
            <div>
              <dt>Tests pending</dt>
              <dd>{GUIDED_STEPS.length - done.size}</dd>
            </div>
          </dl>
          <p className={css.evLabel}>Possible causes</p>
          <ul className={css.causeList}>
            {candidates.slice(0, 4).map((c) => (
              <li key={c.id}>
                {c.name} <Pill family={c.confidence === "HIGH" ? "ok" : c.confidence === "MEDIUM" ? "warning" : "neutral"}>{c.confidence}</Pill>
                {c.gate === "INSUFFICIENT" ? <span className={css.gateNote}>Evidence gate not met</span> : null}
              </li>
            ))}
            {candidates.length === 0 ? <li className={css.none}>Run steps to build evidence.</li> : null}
          </ul>
          <p className={css.evLabel}>Technician conclusion</p>
          {done.has("decision") ? (
            <div className={css.conclusion}>
              <p className={css.caseTag}>{CASE_TAG} · not a decision for a real vehicle</p>
              <p className={css.decisionStatus}>{REPAIR_STATUS_LABEL[decision.status]}</p>
              <p>{decision.reason}</p>
              {decision.status !== "INSUFFICIENT_EVIDENCE" ? (
                <p className={css.note}>Before any repair: {candidates[0]?.missing.filter((m) => !m.endsWith("required")).join("; ") || "evidence complete"}.</p>
              ) : null}
            </div>
          ) : (
            <p className={css.note}>{done.size < 6 ? INSUFFICIENT : "Run the remaining steps to reach a decision."}</p>
          )}
          {done.has("decision") ? (
            <button
              type="button"
              className={css.secondary}
              onClick={() => {
                useToolkit.getState().reveal();
              }}
            >
              Reveal the simulated fault
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
