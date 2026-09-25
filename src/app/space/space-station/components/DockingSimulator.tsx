"use client";
import { useEffect, useRef, useState } from "react";
import { Link2, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  DOCKING_STAGES,
  DOCKING_LIMITS,
  allowedClosingRate,
  allowedLateral,
  autoClosingRate,
  initialDock,
  tickDock,
  timeWarp,
  timeToContactS,
  type DockSim,
  type DockControls,
} from "@/lib/space-station/docking";
import { SimFrame, Slider, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

const W = 640, H = 170, X0 = 40, X1 = 600, CY = 88;
// Log-scaled range axis so the last metres are visible next to the far field.
const xFor = (r: number) => X1 - (Math.log10(r + 1) / Math.log10(3001)) * (X1 - X0);

export default function DockingSimulator() {
  const [sim, setSim] = useState<DockSim>(initialDock);
  const [running, setRunning] = useState(false);
  const [c, setC] = useState<DockControls>({ closingRateMs: 0.04, lateralOffsetM: 0.03, angleDeg: 1 });
  const cRef = useRef(c);
  useEffect(() => {
    cRef.current = c;
  }, [c]);

  const active = running && (sim.phase === "approach" || sim.phase === "final" || sim.phase === "mating");
  useEffect(() => {
    if (!active) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.2, (now - last) / 1000);
      last = now;
      setSim((s) => tickDock(s, dt * timeWarp(s, cRef.current), cRef.current));
    }, 50);
    return () => window.clearInterval(id);
  }, [active]);

  const start = () => {
    setSim((s) => (s.phase === "ready" ? { ...s, phase: "approach", message: "Far-field rendezvous: closing along the orbit." } : s));
    setRunning(true);
  };
  const go = () => {
    setSim((s) => ({ ...s, phase: "final", stage: "final-approach", message: "Go for final approach. You control the closing rate and alignment.", reasons: [] }));
    setRunning(true);
  };
  const retreat = () => setSim((s) => ({ ...s, phase: "hold", stage: "hold-point", rangeM: DOCKING_LIMITS.holdPointRangeM, message: "Back at the hold point. Adjust and try again.", reasons: [] }));
  const reset = () => {
    setRunning(false);
    setSim(initialDock());
  };
  const rate = sim.phase === "approach" ? autoClosingRate(sim.rangeM) : sim.phase === "final" ? c.closingRateMs : 0;
  const stageIdx = DOCKING_STAGES.findIndex((s) => s.id === sim.stage);
  const vx = xFor(sim.rangeM);
  const vy = CY + Math.max(-40, Math.min(40, c.lateralOffsetM * 40));

  return (
    <SimFrame
      title="Docking Simulator"
      icon={Link2}
      transparency={{
        assumptions: [
          "Straight-line approach along the docking axis; orbital-mechanics effects on relative motion are not modelled.",
          `Before the ${DOCKING_LIMITS.holdPointRangeM} m hold point the vehicle flies automatically at 80% of the corridor limit.`,
          `Illustrative capture envelope: ${DOCKING_LIMITS.captureMinMs}–${DOCKING_LIMITS.captureMaxMs} m/s, ≤ ${DOCKING_LIMITS.captureLateralM} m lateral, ≤ ${DOCKING_LIMITS.captureAngleDeg}° angular.`,
          "Time is sped up (shown as time warp) so each phase takes a few seconds.",
        ],
        equations: [
          { expr: `v_max(r) = clamp(k·r, ${DOCKING_LIMITS.corridorMinMs}, ${DOCKING_LIMITS.corridorMaxMs}) m/s,  k = ${DOCKING_LIMITS.corridorGainPerS} s⁻¹`, note: "Allowed closing rate shrinks with range." },
          { expr: `y_max(r) = ${DOCKING_LIMITS.captureLateralM} + ${DOCKING_LIMITS.corridorLateralPerM}·r  m`, note: "Lateral corridor half-width." },
          { expr: "t_contact = r / v" },
        ],
        limitations: [
          "Limits are teaching values, not from any docking-system interface specification.",
          "Real rendezvous uses relative-motion (Clohessy–Wiltshire) dynamics, multiple sensors and abort logic.",
        ],
        sources: ["pib-spadex-2025", "nasa-iss", "csa-canadarm2"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <Slider label="Closing rate (final approach)" value={c.closingRateMs} min={0.01} max={0.5} step={0.01} unit="m/s" onChange={(v) => setC((s) => ({ ...s, closingRateMs: v }))} />
            <Slider label="Lateral misalignment" value={c.lateralOffsetM} min={0} max={1} step={0.01} unit="m" onChange={(v) => setC((s) => ({ ...s, lateralOffsetM: v }))} />
            <Slider label="Angular misalignment" value={c.angleDeg} min={0} max={10} step={0.5} unit="°" onChange={(v) => setC((s) => ({ ...s, angleDeg: v }))} />
            <div className={styles.presetRow}>
              {sim.phase === "ready" && (
                <button type="button" className={styles.primaryButton} onClick={start}>
                  <Play size={15} aria-hidden="true" /> Start approach
                </button>
              )}
              {sim.phase === "hold" && (
                <button type="button" className={styles.primaryButton} onClick={go}>
                  Go for final approach
                </button>
              )}
              {sim.phase === "abort" && (
                <button type="button" className={styles.primaryButton} onClick={retreat}>
                  Retreat to hold point
                </button>
              )}
              {(sim.phase === "approach" || sim.phase === "final" || sim.phase === "mating") && (
                <button type="button" className={styles.button} onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />} {running ? "Pause" : "Resume"}
                </button>
              )}
              <button type="button" className={styles.button} onClick={reset}>
                <RotateCcw size={15} aria-hidden="true" /> Reset
              </button>
            </div>
          </div>
          <div className={styles.simOutput}>
            <p className={styles.alert} data-tone={sim.phase === "abort" ? undefined : sim.phase === "complete" ? "ok" : "warn"} aria-live="polite">
              {sim.phase === "abort" ? <AlertTriangle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
              <span>
                {sim.message}
                {sim.reasons.length > 0 && (
                  <>
                    {" "}
                    {sim.reasons.join(" ")}
                  </>
                )}
              </span>
            </p>
            <div className={styles.metrics}>
              <Metric label="Relative distance" value={sim.rangeM >= 10 ? fmt(sim.rangeM) : fmt(sim.rangeM, 2)} unit="m" />
              <Metric label="Closing rate" value={fmt(rate, 2)} unit="m/s" tone={sim.phase === "final" && rate > allowedClosingRate(sim.rangeM) ? "bad" : undefined} />
              <Metric label="Allowed at this range" value={fmt(allowedClosingRate(sim.rangeM), 2)} unit="m/s" />
              <Metric label="Alignment (lat / ang)" value={`${fmt(c.lateralOffsetM, 2)} m / ${fmt(c.angleDeg, 1)}°`} tone={c.lateralOffsetM > allowedLateral(sim.rangeM) ? "bad" : undefined} />
              {view === "engineering" && <Metric label="Time to contact" value={rate > 0 ? fmt(timeToContactS(sim.rangeM, rate) / 60, 1) : "—"} unit="min" />}
              {view === "engineering" && <Metric label="Mission elapsed" value={fmt(sim.elapsedS / 60, 1)} unit="min" />}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Approach view: vehicle ${fmt(sim.rangeM, 1)} metres from the docking port, stage ${DOCKING_STAGES[stageIdx]?.label}.`} style={{ width: "100%", height: "auto", background: "#0b1733", borderRadius: 10 }}>
              <path d={`M${X1} ${CY - 4} L${xFor(DOCKING_LIMITS.holdPointRangeM)} ${CY - 34} L${X0 - 20} ${CY - 34} L${X0 - 20} ${CY + 34} L${xFor(DOCKING_LIMITS.holdPointRangeM)} ${CY + 34} L${X1} ${CY + 4} Z`} fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.35)" strokeDasharray="4 4" />
              {[3000, 1000, 200, 30, 5, 1].map((r) => (
                <g key={r}>
                  <line x1={xFor(r)} x2={xFor(r)} y1={CY + 44} y2={CY + 50} stroke="#b5b8c9" />
                  <text x={xFor(r)} y={CY + 64} fontSize="10" fill="#b5b8c9" textAnchor="middle">{r} m</text>
                </g>
              ))}
              <line x1={xFor(DOCKING_LIMITS.holdPointRangeM)} x2={xFor(DOCKING_LIMITS.holdPointRangeM)} y1={20} y2={CY + 40} stroke="#f59e0b" strokeDasharray="3 3" />
              <text x={xFor(DOCKING_LIMITS.holdPointRangeM)} y={16} fontSize="10" fill="#fcd34d" textAnchor="middle">Hold point</text>
              <rect x={X1} y={CY - 26} width={34} height={52} rx={6} fill="#cbd5e1" />
              <rect x={X1 - 6} y={CY - 8} width={6} height={16} fill="#fcd34d" />
              <text x={X1 + 17} y={CY + 42} fontSize="10" fill="#b5b8c9" textAnchor="middle">Station</text>
              <g transform={`translate(${vx} ${vy}) rotate(${c.angleDeg * 3})`}>
                <path d="M-26 -10 h18 l8 10 l-8 10 h-18 z" fill="#fcd34d" stroke="#92400e" />
              </g>
              <text x={X0} y={H - 6} fontSize="10" fill="#b5b8c9">Log distance scale · lateral offset exaggerated</text>
            </svg>
            <ol className={styles.flow} style={{ marginTop: 12 }} aria-label="Docking stages">
              {DOCKING_STAGES.map((s, i) => (
                <li key={s.id} data-active={i === stageIdx} aria-current={i === stageIdx ? "step" : undefined}>
                  <span>
                    {i < stageIdx || sim.phase === "complete" ? "✓ " : ""}
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
            <p style={{ fontSize: 14, marginTop: 10 }}>{DOCKING_STAGES[stageIdx]?.explanation}</p>
          </div>
        </div>
      )}
    </SimFrame>
  );
}
