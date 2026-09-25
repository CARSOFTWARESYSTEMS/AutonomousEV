"use client";
import { useMemo, useState } from "react";
import { Network, Zap } from "lucide-react";
import { BottomSheet } from "./mobile";
import { runTwin, FAILURES, TWIN_NOMINAL, type FailureId, type Health, type SubsystemId, type TwinResult } from "@/lib/space-station/twin";
import { SimFrame, Check, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";
import tw from "./twin.module.css";

const WORD: Record<Health, string> = { nominal: "Nominal", caution: "Caution", warning: "Warning" };
const GLYPH: Record<Health, string> = { nominal: "✓", caution: "!", warning: "✕" };

// Layout of the architecture view (SVG units). Station at the centre,
// the seven onboard subsystems around it, Orbit and Ground outside.
const RING: SubsystemId[] = ["gnc", "power", "thermal", "eclss", "crew", "payloads", "comms"];
const POS = {
  ...Object.fromEntries(
    RING.map((id, i) => {
      const t = (i / RING.length) * 2 * Math.PI - Math.PI / 2;
      return [id, { x: 340 + 245 * Math.cos(t), y: 285 + 205 * Math.sin(t) }];
    }),
  ),
  orbit: { x: 590, y: 36 },
  ground: { x: 90, y: 36 },
} as Record<SubsystemId, { x: number; y: number }>;
const CENTER = { x: 340, y: 285 };

/** Phone layout of the architecture, top to bottom, following the dependency chain. */
const MOBILE_ROWS: (SubsystemId | "station")[][] = [
  ["orbit", "gnc"],
  ["power"],
  ["thermal", "station", "comms"],
  ["eclss"],
  ["crew"],
  ["payloads", "ground"],
];
const NODE_W = 152;
const NODE_H = 54;

/** Directed dependencies: a problem in `from` can propagate to `to`. */
const EDGES: [SubsystemId, SubsystemId][] = [
  ["orbit", "gnc"],
  ["gnc", "power"],
  ["power", "thermal"],
  ["power", "eclss"],
  ["power", "payloads"],
  ["power", "comms"],
  ["thermal", "payloads"],
  ["thermal", "eclss"],
  ["eclss", "crew"],
  ["crew", "payloads"],
  ["payloads", "comms"],
  ["comms", "ground"],
];

const ORIGIN: Record<FailureId, SubsystemId> = {
  "solar-degraded": "power",
  "battery-module-out": "power",
  "cooling-degraded": "thermal",
  "co2-degraded": "eclss",
  "comms-loss": "comms",
  "payload-overdraw": "payloads",
  "docking-approach": "gnc",
  "crew-increase": "crew",
};

const LABEL: Record<SubsystemId, string> = {
  orbit: "Orbit",
  gnc: "GNC",
  power: "Power",
  thermal: "Thermal",
  eclss: "ECLSS",
  crew: "Crew",
  payloads: "Payloads",
  comms: "Communications",
  ground: "Ground",
};

type Pt = { x: number; y: number };

/** Point where the ray from a node centre towards `q` leaves the node rectangle. */
function clip(p: Pt, q: Pt): Pt {
  const dx = q.x - p.x, dy = q.y - p.y;
  const t = Math.min(Math.abs(NODE_W / 2 / (dx || 1e-6)), Math.abs(NODE_H / 2 / (dy || 1e-6)));
  return { x: p.x + dx * Math.min(t, 1), y: p.y + dy * Math.min(t, 1) };
}

/**
 * Dependencies are drawn as curves bowed away from the centre so they route
 * around the station instead of crossing it.
 */
function edgePath(a: Pt, b: Pt) {
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const out = { x: m.x - CENTER.x, y: m.y - CENTER.y };
  const len = Math.hypot(out.x, out.y) || 1;
  const bow = Math.max(40, 190 - len);
  const c = { x: m.x + (out.x / len) * bow, y: m.y + (out.y / len) * bow };
  const s0 = clip(a, c);
  const e0 = clip(b, c);
  return `M${s0.x.toFixed(1)} ${s0.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${e0.x.toFixed(1)} ${e0.y.toFixed(1)}`;
}

function Inspector({ id, r, origins }: { id: SubsystemId; r: TwinResult; origins: Set<SubsystemId> }) {
  const s = r.subsystems.find((x) => x.id === id)!;
  const m = r.metrics;
  const upstream = EDGES.filter(([, t]) => t === id).map(([f]) => LABEL[f]);
  const downstream = EDGES.filter(([f]) => f === id).map(([, t]) => LABEL[t]);
  const readings: [string, string][] =
    id === "power"
      ? [
          ["Generation", `${fmt(m.generationKW)} kW`],
          ["Demand / served", `${fmt(m.demandKW)} / ${fmt(m.servedKW)} kW`],
          ["Eclipse capacity", `${fmt(m.eclipseCapacityKW)} kW`],
        ]
      : id === "thermal"
        ? [["Heat load / rejection", `${fmt(m.heatLoadKW)} / ${fmt(m.heatRejectionKW)} kW`]]
        : id === "eclss"
          ? [["CO₂ generated / removed", `${fmt(m.co2GenerationKgPerDay, 1)} / ${fmt(m.co2RemovalKgPerDay, 1)} kg/day`]]
          : id === "crew"
            ? [["Crew aboard", String(m.crew)]]
            : id === "payloads"
              ? [["Research load shed", `${fmt(m.shedResearchKW)} kW`]]
              : [];
  return (
    <div>
      <div className={styles.eyebrow}>Inspector</div>
      <h4 className={tw.inspTitle}>{LABEL[id]}</h4>
      <p className={tw.health} data-health={s.health}>
        <span aria-hidden="true">{GLYPH[s.health]}</span> {WORD[s.health]}
        {origins.has(id) && <em> · failure injected here</em>}
      </p>
      <p className={tw.inspNote}>{s.note}</p>
      {readings.length > 0 && (
        <dl className={tw.readings}>
          {readings.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <dl className={tw.deps}>
        <div>
          <dt>Depends on</dt>
          <dd>{upstream.length ? upstream.join(", ") : "—"}</dd>
        </div>
        <div>
          <dt>Affects</dt>
          <dd>{downstream.length ? downstream.join(", ") : "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function StationDigitalTwin() {
  const [active, setActive] = useState<FailureId[]>([]);
  const [selected, setSelected] = useState<SubsystemId>("power");
  const [failSheet, setFailSheet] = useState(false);
  const [inspectSheet, setInspectSheet] = useState(false);
  const r = useMemo(() => runTwin(active), [active]);
  const toggle = (id: FailureId) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const health = Object.fromEntries(r.subsystems.map((s) => [s.id, s.health])) as Record<SubsystemId, Health>;
  const origins = new Set(active.map((f) => ORIGIN[f]));
  const m = r.metrics;

  return (
    <SimFrame
      title="Space-Station Digital Twin"
      icon={Network}
      transparency={{
        assumptions: [
          `Imaginary station: ${TWIN_NOMINAL.generationKW} kW orbit-average generation, ${TWIN_NOMINAL.batteryModules} battery modules × ${TWIN_NOMINAL.eclipseKWPerModule} kW eclipse capacity, ${TWIN_NOMINAL.heatRejectionKW} kW heat rejection.`,
          `Loads: ${TWIN_NOMINAL.essentialLoadKW} kW essential, ${TWIN_NOMINAL.crewSupportKWPerCrew} kW per crew member, ${TWIN_NOMINAL.researchLoadKW} kW research.`,
          `CO₂: ${TWIN_NOMINAL.co2KgPerCrewDay} kg per crew-day generated; ${TWIN_NOMINAL.co2RemovalKgPerDay} kg/day removal capacity when healthy.`,
          "Load-shedding priority: research first, then non-essential crew support; essential loads are protected.",
        ],
        equations: [
          { expr: "P_available = min(P_generation, N_battery · P_eclipse/module)" },
          { expr: "Q_heat = P_served + N_crew · q_metabolic ≤ Q_rejection" },
          { expr: "ṁ_CO₂,gen = N_crew · 1.04 kg/day ≤ ṁ_CO₂,removal" },
        ],
        limitations: [
          "Rule-based, orbit-average couplings — no dynamics, time histories or sensor noise.",
          "Real stations have many independent power and cooling channels with far richer fault management.",
        ],
        sources: ["nasa-iss-facts", "ntrs"],
      }}
    >
      {(view) => (
        <div className={tw.workspace}>
          {/* Phones: failure sheet + vertical system diagram + inspector sheet. */}
          <div className={tw.mobile}>
            <button type="button" className={styles.primaryButton} style={{ width: "100%" }} onClick={() => setFailSheet(true)}>
              <Zap size={16} aria-hidden="true" /> Inject failure{active.length ? ` (${active.length} active)` : ""}
            </button>
            <ol className={tw.ladder} aria-label="Station systems — tap to inspect">
              {MOBILE_ROWS.map((row, r) => (
                <li key={r} className={tw.ladderRow} data-cols={row.length}>
                  {row.map((id) =>
                    id === "station" ? (
                      <span key={id} className={tw.ladderStation}>
                        Station
                      </span>
                    ) : (
                      <button
                        key={id}
                        type="button"
                        className={tw.ladderNode}
                        data-health={health[id]}
                        data-origin={origins.has(id) || undefined}
                        onClick={() => {
                          setSelected(id);
                          setInspectSheet(true);
                        }}
                      >
                        <span aria-hidden="true">{GLYPH[health[id]]}</span>
                        <b>{LABEL[id]}</b>
                        <small>{WORD[health[id]]}</small>
                      </button>
                    ),
                  )}
                </li>
              ))}
            </ol>
            <BottomSheet open={failSheet} onClose={() => setFailSheet(false)} title="Inject failure">
              <p className={tw.small}>Choose one or more scenarios. The cascade updates as you select.</p>
              {FAILURES.map((f) => (
                <div key={f.id}>
                  <Check label={f.label} checked={active.includes(f.id)} onChange={() => toggle(f.id)} />
                  <small className={styles.fieldHelp} style={{ marginTop: -4, marginBottom: 8 }}>{f.detail}</small>
                </div>
              ))}
              <div className={styles.presetRow} style={{ marginTop: 10 }}>
                <button type="button" className={styles.primaryButton} onClick={() => setFailSheet(false)}>
                  Show cascade
                </button>
                <button type="button" className={styles.button} onClick={() => setActive([])} disabled={active.length === 0}>
                  Clear all
                </button>
              </div>
            </BottomSheet>
            <BottomSheet open={inspectSheet} onClose={() => setInspectSheet(false)} title={`${LABEL[selected]} inspector`}>
              <Inspector id={selected} r={r} origins={origins} />
            </BottomSheet>
          </div>

          <div className={tw.failures}>
            <h4>Inject failures</h4>
            <p className={tw.small}>Combine events and watch them propagate through the dependency graph.</p>
            {FAILURES.map((f) => (
              <div key={f.id}>
                <Check label={f.label} checked={active.includes(f.id)} onChange={() => toggle(f.id)} />
                {view === "engineering" && <small className={styles.fieldHelp} style={{ marginTop: -6, marginBottom: 6 }}>{f.detail}</small>}
              </div>
            ))}
            <button type="button" className={styles.textButton} onClick={() => setActive([])} disabled={active.length === 0}>
              Clear all failures
            </button>
          </div>

          <div className={tw.archWrap}>
            <h4>System architecture</h4>
            <svg viewBox="0 0 680 540" className={tw.arch} role="group" aria-label="Station subsystem architecture. Select a subsystem to inspect it.">
              <defs>
                <marker id="twArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L10 5L0 10z" fill="context-stroke" />
                </marker>
              </defs>
              {(Object.keys(POS) as SubsystemId[])
                .filter((id) => id !== "orbit" && id !== "ground")
                .map((id) => (
                  <line key={`spoke-${id}`} x1={CENTER.x} y1={CENTER.y} x2={POS[id].x} y2={POS[id].y} className={tw.spoke} />
                ))}
              {EDGES.map(([a, b]) => {
                const hot = health[a] !== "nominal" && health[b] !== "nominal";
                return <path key={`${a}-${b}`} d={edgePath(POS[a], POS[b])} className={hot ? tw.edgeHot : tw.edge} markerEnd="url(#twArrow)" />;
              })}
              <g className={tw.center}>
                <rect x={CENTER.x - 70} y={CENTER.y - 38} width={140} height={76} rx={16} />
                <rect x={CENTER.x - 52} y={CENTER.y - 4} width={104} height={6} rx={2} className={tw.truss} />
                <rect x={CENTER.x - 50} y={CENTER.y - 24} width={16} height={46} className={tw.array} />
                <rect x={CENTER.x + 34} y={CENTER.y - 24} width={16} height={46} className={tw.array} />
                <rect x={CENTER.x - 24} y={CENTER.y + 6} width={48} height={14} rx={6} className={tw.module} />
                <text x={CENTER.x} y={CENTER.y - 16} textAnchor="middle">Station</text>
              </g>
              {(Object.keys(POS) as SubsystemId[]).map((id) => {
                const p = POS[id];
                const h = health[id];
                const sel = id === selected;
                const outer = id === "orbit" || id === "ground";
                return (
                  <g
                    key={id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={sel}
                    aria-label={`${LABEL[id]}: ${WORD[h]}`}
                    className={`${tw.node} ${sel ? tw.nodeSel : ""} ${outer ? tw.outer : ""}`}
                    data-health={h}
                    onClick={() => setSelected(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(id);
                      }
                    }}
                  >
                    <rect x={p.x - NODE_W / 2} y={p.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={10} />
                    {origins.has(id) && <rect x={p.x - NODE_W / 2 - 5} y={p.y - NODE_H / 2 - 5} width={NODE_W + 10} height={NODE_H + 10} rx={13} className={tw.origin} />}
                    <circle cx={p.x - NODE_W / 2 + 18} cy={p.y} r={9} className={tw.glyphBg} />
                    <text x={p.x - NODE_W / 2 + 18} y={p.y + 4} textAnchor="middle" className={tw.glyph}>
                      {GLYPH[h]}
                    </text>
                    <text x={p.x - NODE_W / 2 + 34} y={p.y - 3} className={tw.label}>
                      {LABEL[id]}
                    </text>
                    <text x={p.x - NODE_W / 2 + 34} y={p.y + 14} className={tw.status}>
                      {WORD[h]}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className={tw.legend}>
              <span className={tw.legendHot}>━</span> dependency carrying a propagated failure · dashed outline = failure injected · ✓ nominal · ! caution · ✕ warning
            </p>
          </div>

          <aside className={tw.inspector} aria-live="polite">
            <Inspector id={selected} r={r} origins={origins} />
          </aside>

          <div className={tw.results} aria-live="polite">
            <div>
              <h4>Cascading effects</h4>
              <ol className={`${styles.cascade} ${tw.cascadeAnim}`} key={active.join("|")}>
                {r.cascade.map((c, k) => (
                  <li key={c} style={{ animationDelay: `${k * 140}ms` }}>
                    {c}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              {r.responses.length > 0 && (
                <>
                  <h4>Mission response</h4>
                  <ul>
                    {r.responses.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className={styles.metrics} style={{ marginTop: 12 }}>
                <Metric label="Generation" value={fmt(m.generationKW)} unit="kW" />
                <Metric label="Demand / served" value={`${fmt(m.demandKW)} / ${fmt(m.servedKW)}`} unit="kW" tone={m.servedKW < m.demandKW ? "warn" : undefined} />
                <Metric label="Research shed" value={fmt(m.shedResearchKW)} unit="kW" tone={m.shedResearchKW > 0 ? "warn" : undefined} />
                {view === "engineering" && (
                  <>
                    <Metric label="Eclipse capacity" value={fmt(m.eclipseCapacityKW)} unit="kW" />
                    <Metric label="Heat load / rejection" value={`${fmt(m.heatLoadKW)} / ${fmt(m.heatRejectionKW)}`} unit="kW" tone={m.heatLoadKW > m.heatRejectionKW ? "bad" : undefined} />
                    <Metric label="CO₂ gen / removal" value={`${fmt(m.co2GenerationKgPerDay, 1)} / ${fmt(m.co2RemovalKgPerDay, 1)}`} unit="kg/d" tone={m.co2GenerationKgPerDay > m.co2RemovalKgPerDay ? "bad" : undefined} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SimFrame>
  );
}
