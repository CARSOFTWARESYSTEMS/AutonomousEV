"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { SIGNATURE_LOOP } from "@/data/apex/lifecycle";
import { trackApex } from "./analytics";
import loop from "./loop.module.css";

const COUNT = SIGNATURE_LOOP.length;
const RADIUS = 50; // percent of the ring box: nodes sit on its edge circle

/** Node positions, rounded so the server and every browser engine agree on the markup. */
const POSITIONS = SIGNATURE_LOOP.map((_, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / COUNT;
  const x = 50 + RADIUS * Math.cos(angle);
  const y = 50 + RADIUS * Math.sin(angle);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const side = Math.abs(cos) < 0.35 ? (sin < 0 ? "top" : "bottom") : cos > 0 ? "right" : "left";
  return { left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%`, side };
});

/** Small chevrons between nodes, pointing along the direction of travel. */
const CHEVRONS = SIGNATURE_LOOP.map((_, i) => {
  const angle = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / COUNT;
  const x = 50 + 50 * Math.cos(angle);
  const y = 50 + 50 * Math.sin(angle);
  const degrees = (angle * 180) / Math.PI + 90;
  return { x: x.toFixed(2), y: y.toFixed(2), rotate: degrees.toFixed(1) };
});

/** DESIGN → SIMULATE → BUILD → INSTRUMENT → TEST → CORRELATE → IMPROVE, and back to DESIGN. */
export function DevelopmentLoop() {
  const [active, setActive] = useState(0);
  const step = SIGNATURE_LOOP[active];

  const select = (i: number) => {
    setActive(i);
    trackApex("apex_loop_step", { step_id: SIGNATURE_LOOP[i].id });
  };

  return (
    <div>
      <div className={loop.ringWrap}>
        <div className={loop.ring}>
          <svg className={loop.ringSvg} viewBox="0 0 100 100" aria-hidden="true">
            <circle className={loop.ringTrack} cx="50" cy="50" r="50" />
            {CHEVRONS.map((chevron, i) => (
              <path key={i} className={loop.ringChevron} d="M -1.4 1 L 0 -0.6 L 1.4 1" transform={`translate(${chevron.x} ${chevron.y}) rotate(${chevron.rotate}) rotate(90)`} />
            ))}
            <g className={loop.pulse}>
              <circle cx="50" cy="0" r="1.3" />
            </g>
          </svg>
          {SIGNATURE_LOOP.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={loop.node}
              style={{ left: POSITIONS[i].left, top: POSITIONS[i].top }}
              data-side={POSITIONS[i].side}
              aria-pressed={active === i}
              aria-controls="loop-detail"
              onClick={() => select(i)}
            >
              <span className={loop.nodeMark} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          <div className={loop.ringCenter} id="loop-detail" aria-live="polite">
            <span className={loop.ringStep}>
              {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
            </span>
            <span className={loop.ringTitle}>{step.label}</span>
            <p className={loop.ringDetail}>{step.detail}</p>
          </div>
        </div>
      </div>

      <ol className={loop.stepper}>
        {SIGNATURE_LOOP.map((item, i) => (
          <li key={item.id} className={loop.stepperItem} data-active={active === i ? "" : undefined}>
            <span className={loop.stepperMark} aria-hidden="true" />
            <button type="button" className={loop.stepperButton} aria-expanded={active === i} onClick={() => select(i)}>
              <span className={loop.stepperLabel}>{item.label}</span>
              {active === i && <span style={{ fontSize: 15, lineHeight: 1.55, color: "var(--apex-text-2)" }}>{item.detail}</span>}
            </button>
          </li>
        ))}
        <li className={loop.stepperBack}>
          <RotateCcw size={16} aria-hidden="true" /> Back to Design
        </li>
      </ol>
    </div>
  );
}
