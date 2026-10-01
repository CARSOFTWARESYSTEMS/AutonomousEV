import { ArrowRight } from "lucide-react";
import { BUILD_STEPS, MISSION_STAGE_INFO } from "../data/missionSequence";
import { SATELLITE_REFERENCE } from "../data/satelliteReference";
import { MISSION_PLAN, isActiveStage } from "../simulation/mission";
import { useExplorerStore } from "../state/explorerStore";
import { viewFlags } from "../state/selectors";
import { POWER_STATE_LABEL, formatPercent, formatWatts } from "./liveValues";
import ui from "../explorer.module.css";

/** A → B → C chain: the functional flow the scene is animating. */
export function Chain({ nodes }: { nodes: readonly string[] }) {
  if (nodes.length === 0) return null;
  return (
    <ol className={ui.chain} aria-label={nodes.join(", then ")}>
      {nodes.map((node, i) => (
        <li key={`${node}-${i}`}>
          {node}
          {i < nodes.length - 1 && <ArrowRight size={12} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

/**
 * The short caption for what the learner is watching: the current build step
 * or mission stage. One title, one sentence, at most a few values.
 */
export default function StatusCaption() {
  const mode = useExplorerStore((s) => s.mode);
  const buildStep = useExplorerStore((s) => s.buildStep);
  const stage = useExplorerStore((s) => s.missionStage);
  const tourActive = useExplorerStore((s) => s.tourActive);
  const selected = useExplorerStore((s) => s.selectedComponent);
  const t = useExplorerStore((s) => s.telemetry);
  const runMission = useExplorerStore((s) => s.runMission);
  const notToScale = useExplorerStore((s) => viewFlags(s).notToScale);

  if (tourActive) return null;

  if (mode === "build") {
    const step = BUILD_STEPS[buildStep - 1];
    return (
      <section className={ui.caption} aria-label="Build step">
        <p className={ui.captionEyebrow}>
          <span className={ui.stageNumber}>{String(step.step).padStart(2, "0")}</span> {step.label}
        </p>
        <p className={ui.captionTitle}>{step.step === 8 ? "SPACECRAFT ASSEMBLED" : step.title}</p>
        <p className={ui.captionText}>{step.caption}</p>
        <Chain nodes={step.chain} />
        {step.step === 8 && (
          <button type="button" className={ui.primaryButton} data-track-event="mission_run" data-track-source="build_mode" onClick={runMission}>
            RUN MISSION <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </section>
    );
  }

  if (mode === "mission" && isActiveStage(stage) && !selected) {
    const info = MISSION_STAGE_INFO[stage];
    const plan = MISSION_PLAN.find((p) => p.stage === stage)!;
    return (
      <section className={ui.caption} aria-label="Mission stage">
        <p className={ui.captionEyebrow}>
          <span className={ui.stageNumber}>
            {String(plan.index).padStart(2, "0")} / {MISSION_PLAN.length}
          </span>{" "}
          {info.label}
        </p>
        <p className={ui.captionText}>{info.caption}</p>
        <dl className={ui.captionValues}>
          {(stage === "BOOT" || stage === "POWER" || stage === "ATTITUDE") && (
            <>
              <div>
                <dt>MODE</dt>
                <dd>{t.spacecraftMode}</dd>
              </div>
              <div>
                <dt>BATTERY</dt>
                <dd>
                  {formatPercent(t.batterySoc)} · {POWER_STATE_LABEL[t.batteryState]}
                </dd>
              </div>
            </>
          )}
          {stage === "POWER" && (
            <div>
              <dt>GENERATED</dt>
              <dd>{formatWatts(t.generationW)}</dd>
            </div>
          )}
          {(stage === "CAPTURE" || stage === "STORE") && (
            <div>
              <dt>PAYLOAD DATA STORED</dt>
              <dd>{Math.round(t.storageMb)} MB</dd>
            </div>
          )}
        </dl>
        {notToScale && <p className={ui.captionNote}>{SATELLITE_REFERENCE.provenance.scale} · spacecraft enlarged</p>}
      </section>
    );
  }

  return null;
}

/** Short status line for a key moment (ATTITUDE ACQUIRED, CAPTURE, AOS, LOS…). */
export function Callout() {
  const mode = useExplorerStore((s) => s.mode);
  const callout = useExplorerStore((s) => s.telemetry.callout);
  const payloadPhase = useExplorerStore((s) => s.telemetry.payloadPhase);
  const subsystem = useExplorerStore((s) => s.subsystem);

  let text: string | null = null;
  if (mode === "mission") text = callout;
  else if (mode === "systems" && subsystem === "payload") {
    if (payloadPhase === "TARGET_ACQUIRED") text = "TARGET ACQUIRED";
    else if (payloadPhase === "CAPTURING") text = "CAPTURE";
  }
  if (!text) return null;
  return (
    <p key={text} className={ui.callout} data-testid="callout">
      {text}
    </p>
  );
}
