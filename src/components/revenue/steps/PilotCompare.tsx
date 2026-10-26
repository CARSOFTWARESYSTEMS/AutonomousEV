// Current workflow vs FAI-assisted workflow, and what a pilot measures on
// both. No numbers: the pilot produces them, with the customer.
import { PILOT_COMPARE, PILOT_MEASURES } from "../data/steps";
import css from "../site.module.css";

export default function PilotCompare() {
  const lanes = [PILOT_COMPARE.current, PILOT_COMPARE.assisted];
  return (
    <figure className={css.compare} aria-labelledby="rv-compare-caption">
      <figcaption id="rv-compare-caption" className={css.srOnly}>
        The customer&apos;s current workflow beside the FAI-assisted workflow, measured the same way.
      </figcaption>
      <div className={css.compareLanes}>
        {lanes.map((lane) => (
          <div key={lane.name} className={css.compareLane} data-lane={lane === PILOT_COMPARE.current ? "current" : "assisted"}>
            <p className={css.compareName}>{lane.name}</p>
            <p className={css.compareNote}>{lane.note}</p>
            <ol className={css.compareSteps}>
              {lane.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <div className={css.measures}>
        <p className={css.stepLabel}>Measure both, the same way</p>
        <dl className={css.measureList}>
          {PILOT_MEASURES.map((measure) => (
            <div key={measure.name}>
              <dt>{measure.name}</dt>
              <dd>{measure.how}</dd>
            </div>
          ))}
        </dl>
        <p className={css.note}>Agree success criteria before starting. A pilot that cannot fail cannot prove anything.</p>
      </div>
    </figure>
  );
}
