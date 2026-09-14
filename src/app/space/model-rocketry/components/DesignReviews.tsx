"use client";
import { DESIGN_REVIEWS } from "../rocketData";
import { useLearningLevel } from "./LearningLevelProvider";
import styles from "../model-rocketry.module.css";

export default function DesignReviews() {
  const { isAtLeast } = useLearningLevel();
  return (
    <div>
      {DESIGN_REVIEWS.map((r) => (
        <details key={r.id} className={styles.accordionItem}>
          <summary>
            {r.name} — {r.fullName}
          </summary>
          <div>
            <p>{r.beginner}</p>
            {isAtLeast("intermediate") && (
              <dl>
                <dt>Entry criteria</dt>
                <dd>
                  <ul>
                    {r.entryCriteria.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </dd>
                <dt>Evidence expected</dt>
                <dd>
                  <ul>
                    {r.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </dd>
              </dl>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
