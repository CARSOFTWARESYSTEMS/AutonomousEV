// The scenario's battery voltage over two orbits: what was flown (with safe
// mode), what was predicted without action, the expected band, the cut-off
// and the verification criterion. Simulated values; drawn up to the stage
// being shown, so the story unfolds stage by stage.
import { BATTERY, CRITERIA, DETECTION, ECLIPSES, STAGES, T, actualTrace, withoutActionTrace, type StageId } from "./scenario";
import styles from "./health.module.css";

const W = 600;
const H = 230;
const PAD = { l: 44, r: 12, t: 14, b: 30 };
const V0 = 5.8;
const V1 = 8.6;
const x = (t: number) => PAD.l + (t / T.end) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + ((V1 - v) / (V1 - V0)) * (H - PAD.t - PAD.b);
const path = (pts: { t: number; v: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");

const ACTUAL = actualTrace();
const WITHOUT = withoutActionTrace();

export default function HealthChart({ stage }: { stage: StageId }) {
  const index = STAGES.findIndex((s) => s.id === stage);
  const until = STAGES[index].at;
  const shown = ACTUAL.filter((p) => p.t <= until + 0.5);
  const showPrediction = index >= 3;
  return (
    <figure className={styles.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Simulated battery pack voltage over two orbits, shown up to the ${STAGES[index].title.toLowerCase()} stage.${showPrediction ? " A dashed line shows the prediction without action, reaching the 6.0 volt cut-off during the eclipse." : ""}`}>
        {ECLIPSES.map(([a, b]) => (
          <rect key={a} x={x(a)} y={PAD.t} width={x(b) - x(a)} height={H - PAD.t - PAD.b} fill="#0b1026" />
        ))}
        {/* Expected band in sunlight */}
        {[[0, ECLIPSES[0][0]], [ECLIPSES[0][1], ECLIPSES[1][0]]].map(([a, b]) => (
          <rect key={a} x={x(a)} y={y(DETECTION.bandV[1])} width={x(b) - x(a)} height={y(DETECTION.bandV[0]) - y(DETECTION.bandV[1])} fill="#10b981" fillOpacity="0.1" />
        ))}
        {[6, 7, 8].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.07)" />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" className={styles.axis}>
              {v} V
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(BATTERY.cutoffV)} y2={y(BATTERY.cutoffV)} stroke="#f87171" strokeDasharray="5 4" />
        <text x={W - PAD.r} y={y(BATTERY.cutoffV) + 13} textAnchor="end" className={styles.axisWarn}>
          Cut-off {BATTERY.cutoffV.toFixed(1)} V
        </text>
        {index >= 5 && (
          <>
            <line x1={x(ECLIPSES[1][0])} x2={W - PAD.r} y1={y(CRITERIA.minBusV)} y2={y(CRITERIA.minBusV)} stroke="#6ee7b7" strokeDasharray="2 3" />
            <text x={x(ECLIPSES[1][0]) + 4} y={y(CRITERIA.minBusV) - 5} className={styles.axisGood}>
              Criterion ≥ {CRITERIA.minBusV.toFixed(1)} V
            </text>
          </>
        )}
        <path d={path(ACTUAL)} fill="none" stroke="#67e8f9" strokeOpacity="0.15" strokeWidth="2" />
        <path d={path(shown)} fill="none" stroke="#67e8f9" strokeWidth="2.4" />
        {showPrediction && <path d={path(WITHOUT)} fill="none" stroke="#fcd34d" strokeWidth="2" strokeDasharray="6 5" />}
        {STAGES.slice(0, index + 1).map((s, i) => {
          const p = ACTUAL.reduce((best, q) => (Math.abs(q.t - s.at) < Math.abs(best.t - s.at) ? q : best));
          return (
            <g key={s.id}>
              <circle cx={x(p.t)} cy={y(p.v)} r={i === index ? 8 : 5.5} fill={i === index ? "#a78bfa" : "#312e81"} stroke="#c4b5fd" strokeWidth="1.5" />
              <text x={x(p.t)} y={y(p.v) + 3.5} textAnchor="middle" className={styles.dotText}>
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x={x(ECLIPSES[0][0]) + 6} y={H - 10} className={styles.axis}>
          Eclipse
        </text>
        <text x={x(ECLIPSES[1][0]) + 6} y={H - 10} className={styles.axis}>
          Eclipse
        </text>
        <text x={PAD.l} y={H - 10} className={styles.axis}>
          0 min
        </text>
        <text x={W - PAD.r} y={H - 10} textAnchor="end" className={styles.axis}>
          {Math.round(T.end)} min
        </text>
      </svg>
      <details className={styles.chartData}>
        <summary>Chart data</summary>
        <table>
          <caption className={styles.srOnly}>Simulated battery pack voltage at each stage</caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Minute</th>
              <th scope="col">Pack voltage</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => {
              const p = ACTUAL.reduce((best, q) => (Math.abs(q.t - s.at) < Math.abs(best.t - s.at) ? q : best));
              return (
                <tr key={s.id}>
                  <th scope="row">{s.title}</th>
                  <td>{Math.round(p.t)}</td>
                  <td>{p.v.toFixed(2)} V</td>
                </tr>
              );
            })}
            <tr>
              <th scope="row">Without action: cut-off</th>
              <td>{Math.round(WITHOUT[WITHOUT.length - 1].t)}</td>
              <td>{BATTERY.cutoffV.toFixed(2)} V</td>
            </tr>
          </tbody>
        </table>
      </details>
      <figcaption className={styles.chartCaption}>
        <span className={styles.key} data-kind="actual" /> Battery pack voltage, simulated
        {showPrediction && (
          <>
            <span className={styles.key} data-kind="without" /> Predicted without action
          </>
        )}
        <span className={styles.key} data-kind="band" /> Expected in sunlight
      </figcaption>
    </figure>
  );
}
