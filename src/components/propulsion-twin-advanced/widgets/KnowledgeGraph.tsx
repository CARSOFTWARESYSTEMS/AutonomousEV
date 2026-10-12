"use client";
// The knowledge graph, explored one node at a time: choose a component, a
// sensor, a failure mode, a model, a requirement or a piece of evidence and see
// everything connected to it. Any neighbour can become the centre in turn.
//
// The graph is not only a picture of relationships. A node that stands for
// something in the running twin shows that thing's present state, read from the
// simulation, and links to the instrument where it can be examined.
import { useState } from "react";
import { trackAdvancedTwinOnce } from "../analytics";
import { GRAPH_EDGES, GRAPH_KINDS, GRAPH_NODES, GRAPH_START } from "../data/architecture";
import { PRESSURE_UNIT } from "../data/pressure";
import type { ChannelId } from "../simulation/channels";
import type { FaultId } from "../simulation/isolation";
import type { TwinEngineApi, TwinSnapshot } from "../simulation/twinTypes";
import { useLabStore } from "../state/labStore";
import { useLiveTwin } from "../state/useTwin";
import { InjectInLab } from "./actions";
import css from "../advancedTwin.module.css";

const n2 = (value: number) => (Number.isFinite(value) ? value.toFixed(2).replace("-", "−") : "–");
const pm = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}`;

/** What each node is in the running twin: a channel, a difference of two, a fault that can be injected, or a piece of computed evidence. */
const SENSOR_OF: Record<string, ChannelId> = { s_pc_a: "pcA", s_pc_b: "pcB", s_inj_ox: "pInjOx", s_pout_ox: "pOutOx", s_cool: "pCoolIn" };
const DELTA_OF: Record<string, readonly [high: ChannelId, low: ChannelId]> = { m_dp_inj: ["pInjOx", "pcA"], m_dp_pump: ["pOutOx", "pInOx"], m_dp_cool: ["pCoolIn", "pCoolOut"] };
const FAULT_OF: Record<string, FaultId> = { f_drift: "pc_sensor_drift", f_inj: "injector_restriction", f_pump: "pump_degradation", f_cool: "cooling_restriction" };

/** The node's state in the running twin, as a sentence; null for a node that is a concept only. */
function liveState(id: string, snapshot: TwinSnapshot, engine: TwinEngineApi): string | null {
  const sensor = SENSOR_OF[id];
  if (sensor) {
    const c = snapshot.channels[sensor];
    return `Observed ${n2(c.observed)}, estimated ${n2(c.estimated)}, expected ${n2(c.expected)} ${PRESSURE_UNIT}. Residual ${pm(c.residual)} (${pm(c.z)} σ).`;
  }
  const delta = DELTA_OF[id];
  if (delta) {
    const [high, low] = delta.map((channel) => snapshot.channels[channel]);
    const expected = high.expected - low.expected;
    return `Estimated ${n2(high.estimated - low.estimated)}, expected ${n2(expected)} ${PRESSURE_UNIT}. Residual ${pm(high.estimated - low.estimated - expected)}.`;
  }
  if (id === "m_pc") return `Fused estimate ${n2(snapshot.chamber.estimated)} ± ${n2(2 * snapshot.chamber.sigma)} ${PRESSURE_UNIT}; expected ${n2(snapshot.chamber.expected)}. Sensor A ${snapshot.chamber.sensorA}, sensor B ${snapshot.chamber.sensorB}.`;
  if (id === "p_virtual") return `Reads ${n2(snapshot.chamber.virtual)} ${PRESSURE_UNIT} now, against a fused estimate of ${n2(snapshot.chamber.estimated)}.`;
  if (id === "f_low_pc") return `Chamber pressure residual is ${pm(snapshot.chamber.estimated - snapshot.chamber.expected)} ${PRESSURE_UNIT} (${pm(snapshot.symptomZ.pc)} σ).`;
  const fault = FAULT_OF[id];
  if (fault) {
    const active = snapshot.faults.find((f) => f.id === fault);
    const rank = snapshot.ranking.find((r) => r.id === fault);
    return `${active ? `Injected, at ${Math.round(active.severity * 100)} % severity` : "Not injected"}. The twin's score for it is ${Math.round((rank?.p ?? 0) * 100)} %.`;
  }
  const { classifier, anomaly, identificationSamples, errorBefore, errorAfter } = engine.evidence;
  if (id === "a_classifier" || id === "e_validation") return `Built when this page loaded its simulation: ${classifier.validationSamples} validation conditions, accuracy ${(100 * classifier.validationAccuracy).toFixed(1)} %, expected calibration error ${classifier.calibration.ece.toFixed(3)}. Synthetic data only.`;
  if (id === "a_anomaly") return `Trained on ${anomaly.trainingSamples} simulated healthy points, ${anomaly.components} components. Score now ${snapshot.anomalyScore.ml.toFixed(2)}× its threshold${snapshot.anomalyScore.outOfDistribution ? ", not counted: outside its training conditions" : ""}.`;
  if (id === "e_identification") return `${identificationSamples} simulated points. Mean pressure-channel error ${errorBefore.toFixed(2)} before identification, ${errorAfter.toFixed(2)} ${PRESSURE_UNIT} after.`;
  if (id === "e_seeded") return `${snapshot.faults.length ? `A seeded fault is running now: ${snapshot.detectors.filter((d) => d.active && d.id !== "hybrid").length} detectors in alarm.` : "No seeded fault is running."} ${snapshot.events.length} events are in the Lab's fault history.`;
  if (id === "r_pc_limit") return `Lower limit ${n2(0.95 * snapshot.chamber.expected)}; estimate ${n2(snapshot.chamber.estimated)} ${PRESSURE_UNIT}. ${snapshot.detectors.find((d) => d.id === "redline")?.active ? "Redline in alarm." : "Inside the limit."}`;
  return null;
}

const NODE = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));

function neighbours(id: string): string[] {
  return GRAPH_EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
}

export default function KnowledgeGraph() {
  const [centre, setCentre] = useState(GRAPH_START);
  const node = NODE[centre];
  const linked = neighbours(centre).map((id) => NODE[id]);
  const snapshot = useLiveTwin("architecture");
  const engine = useLabStore((s) => s.engine);
  const live = snapshot && engine ? liveState(centre, snapshot, engine) : null;
  const sensor = SENSOR_OF[centre];
  const fault = FAULT_OF[centre];
  const openSensor = () => {
    useLabStore.getState().selectSensor(sensor);
    useLabStore.getState().setModule("pressure");
  };

  const go = (id: string) => {
    setCentre(id);
    trackAdvancedTwinOnce("digital_twin_architecture_opened", { view: "knowledge_graph" });
  };

  return (
    <div className={css.graph}>
      <div className={css.graphCentre}>
        <p className={css.kicker}>{node.kind.toUpperCase()}</p>
        <p className={css.sheetTitle}>{node.name}</p>
        <p>{node.note}</p>
        {/* Read from the simulation, not written into the page. Absent for a node that is a concept and nothing more. */}
        {live && (
          <p className={css.recognition} data-graph-live={centre}>
            <span className={css.groupLabel}>In the running twin · SIMULATED</span> {live}
          </p>
        )}
        {(sensor || fault) && (
          <div className={css.options}>
            {sensor && (
              <button type="button" className={css.ghost} onClick={openSensor}>
                Open on the pressure map
              </button>
            )}
            {fault && <InjectInLab fault={fault} />}
          </div>
        )}
        <p className={css.hint} role="status">
          Connected to {linked.length} {linked.length === 1 ? "item" : "items"}. Choose one to move there.
        </p>
        {centre !== GRAPH_START && (
          <button type="button" className={css.ghost} onClick={() => go(GRAPH_START)}>
            Back to {NODE[GRAPH_START].name}
          </button>
        )}
      </div>
      <div className={css.graphLinks}>
        {GRAPH_KINDS.map((kind) => {
          const group = linked.filter((n) => n.kind === kind);
          return group.length ? (
            <div key={kind} className={css.group}>
              <p className={css.groupLabel}>{kind}</p>
              <div className={css.options}>
                {group.map((n) => (
                  <button key={n.id} type="button" className={css.option} onClick={() => go(n.id)}>
                    {n.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
