"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { LessonDefinition } from "@/lib/satellite-energy-academy/content";
import { constantPowerEnergy, solarPower, type SolarInputs } from "@/lib/satellite-energy-academy/solar";
import SolarDiagram from "./SolarDiagram";
import PowerGraph from "./PowerGraph";
import styles from "../academy.module.css";

export interface ExperimentProps {
  lesson: LessonDefinition;
  input: SolarInputs;
  onChange: (input: SolarInputs) => void;
  onReset: () => void;
}

export default function SolarExperiment({ lesson, input, onChange, onReset }: ExperimentProps) {
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const model = solarPower(input);
  const energy = constantPowerEnergy(model.electricalW, 60);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(media.matches); if (media.matches) setPlaying(false); };
    update(); media.addEventListener("change", update);
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pause);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", pause); };
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setInterval(() => {
      if (input.angleDeg >= 90) { setPlaying(false); return; }
      onChange({ ...input, angleDeg: Math.min(90, input.angleDeg + 1) });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, reduced, input, onChange]);

  return <>
    <div className={styles.labGrid}>
      <div className={styles.visualPanel}>
        <div className={styles.panelHeading}><span>01 / Follow the light</span><span className={styles.pill}>Calculated model</span></div>
        <SolarDiagram input={input} />
        <div className={styles.metrics}>
          <div><span>Electrical power</span><strong data-testid="generated-power">{model.electricalW.toFixed(1)} <small>W</small></strong></div>
          <div><span>Light intercepted</span><strong>{model.incidentW.toFixed(1)} <small>W</small></strong></div>
          <div><span>Not converted</span><strong>{model.unconvertedW.toFixed(1)} <small>W</small></strong></div>
        </div>
        <p className={styles.observation}>{input.irradianceWm2 === 0 ? "No incoming sunlight means no solar power at any angle." : input.efficiencyPercent === 0 ? "Light reaches the panel, but at 0% efficiency none becomes electricity." : input.angleDeg === 90 ? "Edge-on! Direct sunlight no longer crosses the panel’s active face, so this model gives zero power." : `Your panel intercepts ${(model.incidence * 100).toFixed(1)}% of the light it would catch face-on. Try changing only its angle and watch the gold dot.`}</p>
        <div className={styles.actions}>
          <button className={styles.button} disabled={reduced} onClick={() => { if (!playing && input.angleDeg === 90) onChange({ ...input, angleDeg: 0 }); setPlaying(!playing); }}>
            {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}{playing ? "Pause sweep" : "Play angle sweep"}
          </button>
          <button className={styles.button} onClick={() => { setPlaying(false); onReset(); }}><RotateCcw size={16} aria-hidden />Reset experiment</button>
        </div>
        <p className={styles.caption}>{reduced ? "Reduced motion is on. Use the angle slider to explore at your own pace." : "The sweep moves the angle control; it is not a prediction of spacecraft motion."}</p>
      </div>
      <div className={styles.controls}>
        <div className={styles.panelHeading}><span>02 / Try an idea</span><span>No wrong turns</span></div>
        {lesson.experiment.controls.map(control => <div className={styles.control} key={control.key}>
          <label htmlFor={`solar-${control.key}`}>{control.label}<output htmlFor={`solar-${control.key}`}>{input[control.key].toFixed(control.key === "areaM2" ? 2 : 0)} {control.unit}</output></label>
          <input id={`solar-${control.key}`} type="range" min={control.min} max={control.max} step={control.step} value={input[control.key]} aria-describedby={`help-${control.key}`} aria-valuetext={`${input[control.key]} ${control.unit}`} onChange={e => { setPlaying(false); onChange({ ...input, [control.key]: Number(e.target.value) }); }} />
          <small id={`help-${control.key}`}>{control.help}</small>
        </div>)}
      </div>
    </div>
    <div className={styles.mathGrid}>
      <div><h3>Watch the relationship</h3><PowerGraph input={input} /></div>
      <div className={styles.mathCopy}>
        <h3>Understand what changed</h3>
        <p>Turning the panel changes how much of its area faces the light. Doubling the active area or the sunlight doubles the power, if everything else stays the same.</p>
        <details className={styles.details}>
          <summary>Show the Mathematics</summary>
          <p className={styles.equation}>{lesson.mathematics.equation}</p>
          <p className={styles.equation}>{input.irradianceWm2} × {input.areaM2.toFixed(2)} × {(input.efficiencyPercent / 100).toFixed(2)} × {model.incidence.toFixed(4)} ≈ <strong>{model.electricalW.toFixed(1)} W</strong></p>
          <p>Factors are rounded for display; calculations use full precision.</p>
          <dl className={styles.definitions}>{lesson.mathematics.definitions.map(d => <div key={d.symbol}><dt>{d.symbol}</dt><dd>{d.meaning} · {d.unit}</dd></div>)}</dl>
          <p>{lesson.mathematics.example}</p>
          <p>At your current power, one steady minute would transfer {energy.joules.toFixed(1)} J = {energy.wattHours.toFixed(3)} Wh. This is a calculation, not an accumulating battery simulation.</p>
        </details>
        <details className={styles.details}>
          <summary>What does cosine mean?</summary>
          <p>Cosine is the geometric fraction of the panel area presented to the incoming rays. Face-on gives 1; at 60° it gives 0.5; at 90° it gives 0. This relationship is curved, not a straight line.</p>
          <p>In a right triangle, cosine of an angle is the adjacent side divided by the hypotenuse. The model converts degrees to radians with θ × π / 180 before evaluating cosine.</p>
        </details>
      </div>
    </div>
  </>;
}
