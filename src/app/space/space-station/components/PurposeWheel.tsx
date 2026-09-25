"use client";
import { useRef, useState } from "react";
import { PURPOSES } from "../data/systems";
import { Depth, useMode } from "./ModeProvider";
import styles from "../station.module.css";

const N = PURPOSES.length;
const C = 200, RO = 190, RI = 78;

function segment(i: number) {
  const a0 = (i / N) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / N) * 2 * Math.PI - Math.PI / 2;
  const p = (r: number, a: number) => `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(RI, a0)} L${p(RO, a0)} A${RO} ${RO} 0 0 1 ${p(RO, a1)} L${p(RI, a1)} A${RI} ${RI} 0 0 0 ${p(RI, a0)} Z`;
}

function labelPos(i: number) {
  const a = ((i + 0.5) / N) * 2 * Math.PI - Math.PI / 2;
  const r = (RO + RI) / 2;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

export default function PurposeWheel() {
  const [active, setActive] = useState(0);
  const { mode } = useMode();
  const refs = useRef<(SVGPathElement | null)[]>([]);
  const p = PURPOSES[active];
  const move = (d: number) => setActive((a) => (a + d + N) % N);
  // Roving focus: arrow keys move selection and focus between segments.
  const focusTo = (i: number) => {
    const n = (i + N) % N;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <div className={styles.wheelWrap}>
      <div className={styles.wheel}>
        <svg viewBox="0 0 400 400" role="group" aria-label="Purpose wheel: select a reason stations are built">
          {PURPOSES.map((q, i) => {
            const l = labelPos(i);
            const on = i === active;
            return (
              <g key={q.id}>
                <path
                  d={segment(i)}
                  role="button"
                  tabIndex={on ? 0 : -1}
                  aria-pressed={on}
                  aria-label={q.name}
                  fill={on ? "rgba(6,182,212,0.35)" : i % 2 ? "rgba(59,130,246,0.14)" : "rgba(124,58,237,0.14)"}
                  stroke="rgba(255,255,255,0.12)"
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); focusTo(i + 1); }
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); focusTo(i - 1); }
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); }
                  }}
                  ref={(el) => { refs.current[i] = el; }}
                />
                <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill={on ? "#fff" : "#b5b8c9"} pointerEvents="none" fontWeight={on ? 700 : 500}>
                  {q.name.split(" ").map((w, k, arr) => (
                    <tspan key={k} x={l.x} dy={k === 0 ? `${-(arr.length - 1) * 0.55}em` : "1.1em"}>
                      {w}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={RI - 6} fill="#090b1d" stroke="rgba(59,130,246,0.35)" />
          <text x={C} y={C - 6} textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">Why build</text>
          <text x={C} y={C + 12} textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">a station?</text>
        </svg>
        <p style={{ fontSize: 13, textAlign: "center" }}>Tap a segment, or focus the wheel and use the arrow keys.</p>
      </div>
      <article className={styles.card} aria-live="polite">
        <div className={styles.eyebrow}>{active + 1} / {N}</div>
        <h3>{p.name}</h3>
        <dl className={styles.kv} style={{ marginTop: 12 }}>
          <div><dt>Why space?</dt><dd>{p.whySpace}</dd></div>
          <div><dt>Why not easily on Earth?</dt><dd>{p.whyNotEarth}</dd></div>
          <div><dt>Example research questions</dt><dd>{p.questions.join(" ")}</dd></div>
          <div><dt>Relevant station / facility</dt><dd>{p.facility}</dd></div>
          <div><dt>Potential Earth benefit</dt><dd>{p.benefit}</dd></div>
        </dl>
        <Depth min="research">
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: "var(--space-text)" }}>Open research problem: </strong>
            {p.open}
          </p>
        </Depth>
        <div className={styles.presetRow} style={{ marginTop: 12 }}>
          <button type="button" className={styles.button} onClick={() => move(-1)}>Previous</button>
          <button type="button" className={styles.button} onClick={() => move(1)}>Next</button>
        </div>
        {mode !== "research" && <p style={{ fontSize: 13 }}>Switch to <b>Research</b> mode to see the open research problem for each purpose.</p>}
      </article>
    </div>
  );
}
