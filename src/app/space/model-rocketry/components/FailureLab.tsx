import { FAILURE_MODES, SYSTEM_LABELS } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function FailureLab() {
  return (
    <div>
      {FAILURE_MODES.map((f) => (
        <details key={f.id} className={styles.accordionItem}>
          <summary>{f.title}</summary>
          <div>
            <dl>
              <dt>System</dt>
              <dd>{SYSTEM_LABELS[f.system]}</dd>
              <dt>What would you observe?</dt>
              <dd>{f.observe}</dd>
              <dt>Possible causes</dt>
              <dd>
                <ul>
                  {f.causes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
              <dt>Engineering consequence</dt>
              <dd>{f.consequence}</dd>
              <dt>How would you detect it?</dt>
              <dd>{f.detect}</dd>
              <dt>Prevention / verification</dt>
              <dd>{f.prevent}</dd>
            </dl>
          </div>
        </details>
      ))}
    </div>
  );
}
