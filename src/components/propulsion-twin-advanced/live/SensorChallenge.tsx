"use client";
// The challenge: chamber pressure sensor A has fallen. Is the engine failing or
// is the sensor failing? The learner is shown the evidence, commits to an
// answer, and only then sees the diagnosis and the reasoning.
import { useMemo, useState } from "react";
import { trackAdvancedTwin } from "../analytics";
import { CHALLENGE_CASES, CHALLENGE_EVIDENCE, type ChallengeCase, SENSOR_VS_ENGINE } from "../data/fdir";
import { REDUNDANCY_KINDS } from "../data/twin";
import { AS_BUILT } from "../simulation/calibration";
import { CH } from "../simulation/channels";
import { applyPhysicalFaults, driftBias } from "../simulation/faults";
import { scheduleSpeed, steadyState } from "../simulation/plant";
import { signed } from "../ui/charts";
import { InjectInLab } from "../widgets/actions";
import css from "../advancedTwin.module.css";

/** Percent change of each piece of evidence from what the model expects, for one case. Solved from the physics model, not scripted. */
function evidenceFor(item: ChallengeCase): Record<string, number> {
  const speed = scheduleSpeed(1);
  const expected = steadyState(AS_BUILT, speed).values;
  const severities = { [item.fault]: 0.8 };
  const actual = steadyState(applyPhysicalFaults(AS_BUILT, severities), speed).values;
  actual[CH.pcA] += driftBias(severities);
  return Object.fromEntries(CHALLENGE_EVIDENCE.map((e) => [e.id, (100 * (actual[CH[e.id]] - expected[CH[e.id]])) / expected[CH[e.id]]]));
}

export default function SensorChallenge() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<"sensor" | "engine" | null>(null);
  const item = CHALLENGE_CASES[index];
  const evidence = useMemo(() => evidenceFor(item), [item]);
  const correct = answer === item.answer;

  const choose = (value: "sensor" | "engine") => {
    setAnswer(value);
    trackAdvancedTwin("diagnosis_opened", { fault: item.fault });
  };
  const next = () => {
    setIndex((i) => (i + 1) % CHALLENGE_CASES.length);
    setAnswer(null);
  };

  return (
    <div className={css.challenge}>
      <p className={css.lead}>
        {SENSOR_VS_ENGINE.scenario} <strong>{SENSOR_VS_ENGINE.question}</strong>
      </p>
      <div className={css.tableWrap} role="region" aria-label="Evidence" tabIndex={0}>
        <table className={css.miniTable}>
          <caption>
            Case {index + 1} of {CHALLENGE_CASES.length} · change from expectation · SIMULATED
          </caption>
          <tbody>
            {CHALLENGE_EVIDENCE.map((e) => {
              const change = evidence[e.id];
              const moved = Math.abs(change) >= 0.5;
              return (
                <tr key={e.id} data-moved={moved || undefined}>
                  <th scope="row">{e.label}</th>
                  <td>
                    {moved ? (change < 0 ? "▼ " : "▲ ") : "● "}
                    {moved ? `${signed(change, 1)} %` : "as expected"}
                  </td>
                </tr>
              );
            })}
            <tr>
              <th scope="row">Physics prediction</th>
              <td>● unchanged: the command has not changed</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={css.options} role="group" aria-label={SENSOR_VS_ENGINE.question}>
        <button type="button" className={css.option} aria-pressed={answer === "engine"} disabled={answer !== null && answer !== "engine"} onClick={() => choose("engine")}>
          The engine is failing
        </button>
        <button type="button" className={css.option} aria-pressed={answer === "sensor"} disabled={answer !== null && answer !== "sensor"} onClick={() => choose("sensor")}>
          The sensor is failing
        </button>
      </div>
      <div className={css.detail} role="status" hidden={answer === null}>
        <p className={css.detailTitle}>
          {correct ? "Correct. " : "Not this time. "}
          {item.verdict}
        </p>
        <p>{item.reasoning}</p>
        <dl className={css.rows}>
          {REDUNDANCY_KINDS.map((kind) => (
            <div key={kind.id}>
              <dt>{kind.name}</dt>
              <dd>{kind.text}</dd>
            </div>
          ))}
        </dl>
        <div className={css.options}>
          <button type="button" className={css.primary} onClick={next}>
            Try the other case
          </button>
          <InjectInLab fault={item.fault}>Watch this case in the Lab</InjectInLab>
        </div>
      </div>
    </div>
  );
}
