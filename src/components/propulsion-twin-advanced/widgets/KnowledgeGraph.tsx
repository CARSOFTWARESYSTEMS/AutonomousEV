"use client";
// The knowledge graph, explored one node at a time: choose a component, a
// sensor, a failure mode, a model, a requirement or a piece of evidence and see
// everything connected to it. Any neighbour can become the centre in turn.
import { useState } from "react";
import { trackAdvancedTwinOnce } from "../analytics";
import { GRAPH_EDGES, GRAPH_KINDS, GRAPH_NODES, GRAPH_START } from "../data/architecture";
import css from "../advancedTwin.module.css";

const NODE = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));

function neighbours(id: string): string[] {
  return GRAPH_EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
}

export default function KnowledgeGraph() {
  const [centre, setCentre] = useState(GRAPH_START);
  const node = NODE[centre];
  const linked = neighbours(centre).map((id) => NODE[id]);

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
