"use client";
// An educational readiness indicator. It opens on an honest assessment of this
// page's own twin; the learner can then assess a programme of their own. The
// result is limited by the weakest category, which is the point it teaches.
//
// The level of each category is a judgement, and is labelled as one. What it is
// judged on is not: beneath each category is the evidence this page's twin can
// actually show for it, read from the running simulation.
import { useState } from "react";
import { READINESS_CATEGORIES, READINESS_CAVEAT, READINESS_LEVELS } from "../data/course";
import { QUALITY_CHECKS } from "../data/pipeline";
import { PRESSURE_SENSORS, PRESSURE_UNIT } from "../data/pressure";
import type { TwinEngineApi, TwinSnapshot } from "../simulation/twinTypes";
import { useLabStore } from "../state/labStore";
import { useLiveTwin } from "../state/useTwin";
import css from "../advancedTwin.module.css";

const IMPLEMENTED_CHECKS = QUALITY_CHECKS.filter((check) => check.here.startsWith("Implemented")).length;

/** What the running twin can show for a category. Null where it has nothing to show, which is itself the finding. */
function evidenceHere(id: string, snapshot: TwinSnapshot, engine: TwinEngineApi): string | null {
  const { classifier, anomaly, identificationSamples, errorBefore, errorAfter } = engine.evidence;
  switch (id) {
    case "instrumentation":
      return `${Object.keys(snapshot.channels).length} simulated channels, ${PRESSURE_SENSORS.length} of them pressure sensors. Chamber pressure has two sensors and a virtual one: A ${snapshot.chamber.sensorA}, B ${snapshot.chamber.sensorB}.`;
    case "data_quality":
      return `${IMPLEMENTED_CHECKS} of ${QUALITY_CHECKS.length} listed checks run on every sample. Verdict now: ${snapshot.quality.status}.`;
    case "identification":
      return `${identificationSamples} simulated points: mean pressure-channel error ${errorBefore.toFixed(2)} → ${errorAfter.toFixed(2)} ${PRESSURE_UNIT}.`;
    case "sync":
      return `Model and system are at t = ${snapshot.t.toFixed(1)} s, in ${snapshot.mode}. Twin state: ${snapshot.status.twin}.`;
    case "estimation":
      return `Chamber pressure ${snapshot.chamber.estimated.toFixed(2)} ± ${(2 * snapshot.chamber.sigma).toFixed(2)} ${PRESSURE_UNIT}; ${snapshot.health.length} inferred parameters.`;
    case "fault_coverage":
      return `${classifier.classes.length - 1} modelled physical and sensor faults and 4 data-path faults can be injected. A fault outside them is reported as unrecognised, not named. Consistency check now: ${snapshot.recognition.status}.`;
    case "ml":
      return `Classifier: ${(100 * classifier.validationAccuracy).toFixed(1)} % on ${classifier.validationSamples} simulated validation conditions, expected calibration error ${classifier.calibration.ece.toFixed(3)}. Anomaly detector: ${anomaly.trainingSamples} simulated healthy points.`;
    case "uncertainty":
      return `Bands are computed, e.g. ±${(2 * snapshot.chamber.sigma).toFixed(2)} on chamber pressure now. They have not been checked against outcomes.`;
    default:
      return null;
  }
}

const HERE = Object.fromEntries(READINESS_CATEGORIES.map((c) => [c.id, c.here]));
const MAX = READINESS_LEVELS.length - 1;

export default function ReadinessScore() {
  const [levels, setLevels] = useState<Record<string, number>>(HERE);
  const [own, setOwn] = useState(false);
  const snapshot = useLiveTwin("health");
  const engine = useLabStore((s) => s.engine);
  const values = READINESS_CATEGORIES.map((c) => levels[c.id]);
  const weakest = Math.min(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const limiting = READINESS_CATEGORIES.filter((c) => levels[c.id] === weakest);

  return (
    <div className={css.readiness}>
      <div className={css.options} role="group" aria-label="What is being assessed">
        <button
          type="button"
          className={css.option}
          aria-pressed={!own}
          onClick={() => {
            setOwn(false);
            setLevels(HERE);
          }}
        >
          This page&apos;s educational twin
        </button>
        <button type="button" className={css.option} aria-pressed={own} onClick={() => setOwn(true)}>
          Assess your own programme
        </button>
      </div>

      <div className={css.readinessSummary} role="status">
        <p className={css.verdict}>
          Level {weakest} of {MAX}: {READINESS_LEVELS[weakest]}
        </p>
        <p>
          Limited by {limiting.length === 1 ? "its weakest category" : `${limiting.length} categories`}: {limiting.map((c) => c.name).join(", ")}. The average across all thirteen is {mean.toFixed(1)}, but a twin is only as ready as its weakest foundation.
        </p>
        <p className={css.note}>
          {READINESS_CAVEAT} Each level is an assessment, not a computation. The evidence line under a category is read from the running twin{snapshot ? "." : ", once it has loaded."}
        </p>
      </div>

      <ul className={css.readinessList}>
        {READINESS_CATEGORIES.map((c) => {
          const value = levels[c.id];
          return (
            <li key={c.id} data-limiting={value === weakest || undefined}>
              <div className={css.readinessHead}>
                <span className={css.readinessName}>{c.name}</span>
                <span className={css.readinessLevel}>
                  {value} · {READINESS_LEVELS[value]}
                  {value === weakest ? " · limiting" : ""}
                </span>
              </div>
              <p className={css.hint}>{own ? c.asks : c.why}</p>
              {!own && snapshot && engine && (
                <p className={css.note} data-readiness-evidence={c.id}>
                  <span className={css.groupLabel}>Evidence here · SIMULATED</span> {evidenceHere(c.id, snapshot, engine) ?? "None. The twin has nothing to show for this category."}
                </p>
              )}
              <input type="range" min={0} max={MAX} step={1} value={value} disabled={!own} aria-label={`${c.name}: readiness level`} aria-valuetext={`${value}: ${READINESS_LEVELS[value]}`} onChange={(e) => setLevels((l) => ({ ...l, [c.id]: Number(e.target.value) }))} className={css.range} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
