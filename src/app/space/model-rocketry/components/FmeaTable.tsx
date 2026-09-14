"use client";
import { FMEA_ROWS } from "../rocketData";
import { useLearningLevel } from "./LearningLevelProvider";
import styles from "../model-rocketry.module.css";

function rpn(row: (typeof FMEA_ROWS)[number]) {
  return row.severity * row.occurrence * row.detectability;
}

export default function FmeaTable() {
  const { isAtLeast } = useLearningLevel();
  const showScores = isAtLeast("intermediate");
  const showRpn = isAtLeast("advanced");

  return (
    <div>
      <div className={styles.fmeaWrap}>
        <table className={styles.fmeaTable}>
          <thead>
            <tr>
              <th>System</th>
              <th>Failure mode</th>
              <th>Effect</th>
              <th>Cause</th>
              <th>Detection</th>
              <th>Mitigation</th>
              {showScores && (
                <>
                  <th>Severity</th>
                  <th>Occurrence</th>
                  <th>Detectability</th>
                </>
              )}
              {showRpn && <th>Risk priority (S×O×D)</th>}
            </tr>
          </thead>
          <tbody>
            {FMEA_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{row.system}</td>
                <td>{row.failureMode}</td>
                <td>{row.effect}</td>
                <td>{row.cause}</td>
                <td>{row.detection}</td>
                <td>{row.mitigation}</td>
                {showScores && (
                  <>
                    <td>{row.severity}</td>
                    <td>{row.occurrence}</td>
                    <td>{row.detectability}</td>
                  </>
                )}
                {showRpn && <td>{rpn(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.fmeaCards}>
        {FMEA_ROWS.map((row) => (
          <dl key={row.id} className={styles.fmeaCard}>
            <dt>System</dt>
            <dd>{row.system}</dd>
            <dt>Failure mode</dt>
            <dd>{row.failureMode}</dd>
            <dt>Effect</dt>
            <dd>{row.effect}</dd>
            <dt>Cause</dt>
            <dd>{row.cause}</dd>
            <dt>Detection</dt>
            <dd>{row.detection}</dd>
            <dt>Mitigation</dt>
            <dd>{row.mitigation}</dd>
            {showScores && (
              <>
                <dt>Severity / Occurrence / Detectability</dt>
                <dd>
                  {row.severity} / {row.occurrence} / {row.detectability}
                </dd>
              </>
            )}
            {showRpn && (
              <>
                <dt>Risk priority number</dt>
                <dd>{rpn(row)}</dd>
              </>
            )}
          </dl>
        ))}
      </div>
      {showRpn && (
        <p className={styles.formNote} style={{ marginTop: 14 }}>
          Risk Priority Number (severity × occurrence × detectability) is one common way to prioritize risks — it is
          not the only valid FMEA methodology, and a high-severity, low-RPN risk may still deserve attention.
        </p>
      )}
    </div>
  );
}
