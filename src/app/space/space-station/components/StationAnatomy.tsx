"use client";
import { useId, useState } from "react";
import { ANATOMY } from "../data/systems";
import styles from "../station.module.css";

// `onLight` marks labels drawn on top of light-coloured modules (dark text for contrast).
type Shape = { id: string; el: React.ReactNode; label?: [number, number, string]; onLight?: boolean };

const MOD = { fill: "#cbd5e1", stroke: "#475569" };

// A generic layout invented for teaching — deliberately not any real station.
const SHAPES: Shape[] = [
  { id: "arrays", el: <>{[50, 118, 462, 530].flatMap((x) => [<rect key={`${x}a`} x={x} y={18} width={60} height={64} fill="#1d4ed8" stroke="#93c5fd" />, <rect key={`${x}b`} x={x} y={98} width={60} height={64} fill="#1d4ed8" stroke="#93c5fd" />])}</>, label: [80, 12, "Solar arrays"] },
  { id: "truss", el: <rect x={40} y={84} width={560} height={12} fill="#94a3b8" stroke="#475569" />, label: [300, 108, ""] },
  { id: "radiators", el: <>{[248, 352].map((x) => <rect key={x} x={x} y={22} width={40} height={60} fill="#e2e8f0" stroke="#94a3b8" />)}</>, label: [268, 16, "Radiators"] },
  { id: "batteries", el: <>{[186, 420].map((x) => <rect key={x} x={x} y={70} width={28} height={14} fill="#f59e0b" stroke="#92400e" />)}</>, label: [200, 64, "Batteries"] },
  { id: "antennas", el: <><line x1={320} y1={84} x2={320} y2={50} stroke="#e2e8f0" strokeWidth={2} /><circle cx={320} cy={44} r={10} fill="#e2e8f0" stroke="#64748b" /></>, label: [336, 40, "Antenna"] },
  { id: "robotics", el: <polyline points="560,84 560,60 590,40 610,52" fill="none" stroke="#fcd34d" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />, label: [566, 32, "Robotic arm"] },
  { id: "external", el: <>{[548, 574].map((x) => <rect key={x} x={x} y={100} width={20} height={14} fill="#a78bfa" stroke="#5b21b6" />)}</>, label: [556, 128, "External payloads"] },
  { id: "loops", el: <path d="M268 84 V150 H300 V206 M372 84 V150 H340 V206" fill="none" stroke="#22d3ee" strokeWidth={3} strokeDasharray="6 4" />, label: [376, 146, "Thermal loops"] },
  { id: "hab", el: <rect x={120} y={206} width={82} height={42} rx={14} {...MOD} />, label: [161, 231, "Habitation"], onLight: true },
  { id: "command", el: <rect x={240} y={206} width={90} height={42} rx={14} {...MOD} />, label: [285, 231, "Command"], onLight: true },
  { id: "lab", el: <rect x={330} y={206} width={104} height={42} rx={14} {...MOD} />, label: [360, 222, "Laboratory"], onLight: true },
  { id: "racks", el: <>{[392, 404, 416].map((x) => <rect key={x} x={x} y={226} width={9} height={16} fill="#3b82f6" />)}</>, label: [404, 262, ""] },
  { id: "storage", el: <rect x={434} y={210} width={52} height={34} rx={10} {...MOD} />, label: [460, 231, "Storage"], onLight: true },
  { id: "airlock", el: <rect x={204} y={248} width={32} height={40} rx={8} {...MOD} />, label: [220, 304, "Airlock"] },
  { id: "docking", el: <>{[[106, 219], [486, 219], [212, 196]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width={14} height={16} fill="#fcd34d" stroke="#92400e" />)}</>, label: [494, 212, "Docking"] },
  { id: "crv", el: <path d="M50 214 h44 l12 13 l-12 13 h-44 z" fill="#f8fafc" stroke="#475569" />, label: [72, 262, "Crew return"] },
  { id: "propulsion", el: <>{[[330, 250], [310, 250]].map(([x, y]) => <path key={x} d={`M${x} ${y} l6 12 h-12 z`} fill="#ef4444" />)}</>, label: [290, 276, "Thrusters"] },
];

export default function StationAnatomy() {
  const [sel, setSel] = useState("lab");
  const pickId = useId();
  const c = ANATOMY.find((a) => a.id === sel)!;
  const node = (id: string) => ANATOMY.find((a) => a.id === id)?.name ?? id;
  return (
    <div className={styles.anatomy}>
      <div>
        <svg viewBox="0 0 640 320" role="group" aria-label="Generic station diagram. Select a component to learn about it.">
          <rect x={200} y={196} width={40} height={52} rx={10} {...MOD} />
          <text x={220} y={186} fontSize="10" fill="#b5b8c9" textAnchor="middle">Node</text>
          <line x1={300} y1={96} x2={300} y2={206} stroke="#94a3b8" strokeWidth={4} />
          {SHAPES.map((s) => {
            const on = s.id === sel;
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={node(s.id)}
                aria-pressed={on}
                onClick={() => setSel(s.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSel(s.id);
                  }
                }}
                style={{ opacity: on ? 1 : 0.82, filter: on ? "drop-shadow(0 0 6px rgba(103,232,249,0.9))" : undefined }}
              >
                <g>{s.el}</g>
                {s.label && s.label[2] && (
                  <text x={s.label[0]} y={s.label[1]} fontSize="11" fill={s.onLight ? (on ? "#0e7490" : "#0f172a") : on ? "#67e8f9" : "#e2e8f0"} textAnchor="middle" fontWeight={on ? 700 : 500} pointerEvents="none">
                    {s.label[2]}
                  </text>
                )}
              </g>
            );
          })}
          <text x={10} y={314} fontSize="11" fill="#b5b8c9">Generic teaching layout · not a model of any real station</text>
        </svg>
        <div className={`${styles.field} ${styles.anatomyPicker}`}>
          <span>
            <label htmlFor={pickId}>Component</label>
          </span>
          <select id={pickId} value={sel} onChange={(e) => setSel(e.target.value)}>
            {ANATOMY.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <article className={styles.card} aria-live="polite">
        <h3>{c.name}</h3>
        <dl className={styles.kv} style={{ marginTop: 10 }}>
          <div><dt>Purpose</dt><dd>{c.purpose}</dd></div>
          <div><dt>How it works</dt><dd>{c.how}</dd></div>
          <div><dt>Major engineering challenges</dt><dd>{c.challenges}</dd></div>
          <div><dt>Typical sensors</dt><dd>{c.sensors}</dd></div>
          <div><dt>Failure modes</dt><dd>{c.failures}</dd></div>
          <div><dt>Redundancy philosophy</dt><dd>{c.redundancy}</dd></div>
          <div><dt>Research questions</dt><dd>{c.research}</dd></div>
        </dl>
      </article>
    </div>
  );
}
