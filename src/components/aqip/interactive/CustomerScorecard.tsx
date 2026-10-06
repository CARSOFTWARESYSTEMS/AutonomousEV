"use client";

import { useEffect, useId, useRef, useState } from "react";
import { trackAqip } from "../analytics";
import { SCORE_DIMENSIONS, scorePilotFit, type Answer, type Answers, type FitBand } from "../logic/scorecard";
import css from "../interactive.module.css";

const BAND_NOTE: Record<FitBand, string> = {
  LOW: "Keep in touch; not a pilot candidate now.",
  MEDIUM: "Worth a follow-up interview before proposing a pilot.",
  HIGH: "Propose a benchmark on a past FAI.",
  "VERY HIGH": "Propose a controlled pilot on the next live FAI.",
};

/**
 * Scores one customer interview for pilot fit. Everything is computed in the
 * browser from fixed options; no answer is stored, sent or reported.
 */
export default function CustomerScorecard() {
  const uid = useId();
  const [answers, setAnswers] = useState<Answers>({});
  const result = scorePilotFit(answers);
  const reported = useRef(false);

  useEffect(() => {
    if (!result.band || reported.current) return;
    reported.current = true;
    trackAqip("aqip_scorecard_complete", { band: result.band.toLowerCase().replace(" ", "_") });
  }, [result.band]);

  return (
    // autoComplete="off" stops Firefox restoring old answers on reload, which React would not know about.
    <form className={css.scorecard} autoComplete="off" onSubmit={(event) => event.preventDefault()} aria-label="Customer interview scorecard">
      <div className={css.scoreRows}>
        {SCORE_DIMENSIONS.map((dimension) => (
          <fieldset key={dimension.id} className={css.scoreRow}>
            <legend>{dimension.label}</legend>
            <div className={css.scoreOptions}>
              {dimension.levels.map((level, value) => (
                <label key={level} className={css.scoreOption}>
                  <input
                    type="radio"
                    name={`${uid}-${dimension.id}`}
                    value={value}
                    checked={answers[dimension.id] === value}
                    onChange={() => setAnswers((previous) => ({ ...previous, [dimension.id]: value as Answer }))}
                  />
                  <span>
                    <b aria-hidden="true">{value}</b>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className={css.scoreResult}>
        <output className={css.scoreOutput} aria-live="polite">
          {result.band ? (
            <>
              <span className={css.scoreLabel}>Pilot fit</span>
              <strong className={css.scoreBand} data-band={result.band}>
                {result.band}
              </strong>
              <span className={css.scoreNote}>
                {result.percent}% of the weighted maximum. {BAND_NOTE[result.band]}
                {result.capped ? " Held at MEDIUM because there is no interest in a pilot yet." : ""}
              </span>
            </>
          ) : (
            <>
              <span className={css.scoreLabel}>Pilot fit</span>
              <strong className={css.scoreBand}>—</strong>
              <span className={css.scoreNote}>
                {result.answered} of {result.total} answered. Answer every dimension to see the indicator.
              </span>
            </>
          )}
        </output>
        <button type="button" className={css.button} onClick={() => setAnswers({})} disabled={result.answered === 0}>
          Reset scorecard
        </button>
        <p className={css.privacyNote}>Calculated in your browser. Nothing you select is stored or sent.</p>
      </div>
    </form>
  );
}
