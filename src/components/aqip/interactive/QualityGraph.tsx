"use client";

import { useId, useMemo, useState } from "react";
import { trackAqip } from "../analytics";
import { DEFAULT_NODE, GRAPH_EDGES, GRAPH_GROUPS, GRAPH_NODES, NODE_BY_ID, relationsOf, type GraphNode, type Relation } from "../data/graph";
import css from "../interactive.module.css";

type View = "network" | "focus" | "explorer";

const GROUP_LABEL = new Map(GRAPH_GROUPS.map((group) => [group.id, group.label]));

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Where the nth of `count` neighbours sits around the centre of the focus view, in percent.
 * Rounded, because the last digits of sin and cos differ between JavaScript engines and the
 * server's markup has to match what the browser computes.
 */
function around(index: number, count: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { x: round(50 + 37 * Math.cos(angle)), y: round(50 + 36 * Math.sin(angle)) };
}

function NodeDetail({ node, relations, onPick }: { node: GraphNode; relations: readonly Relation[]; onPick: (id: string) => void }) {
  return (
    <>
      <p className={css.nodeSummary}>{node.summary}</p>
      <p className={css.nodeHeading}>What the graph holds</p>
      <ul className={css.nodeFields}>
        {node.fields.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>
      <p className={css.nodeHeading}>Connected to</p>
      <ul className={css.nodeRelations}>
        {relations.map((relation) => (
          <li key={relation.phrase}>
            <button type="button" className={css.nodeLink} onClick={() => onPick(relation.node.id)}>
              {relation.node.label}
            </button>
            <span>{relation.phrase}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The Aerospace Quality Graph, drawn three ways from the same data. A wide
 * screen gets the whole network; a tablet gets the selected entity with its
 * neighbours around it; a phone gets an expandable list grouped by stage. The
 * stylesheet shows the one that fits. Edges are an SVG; nodes are real buttons.
 */
export default function QualityGraph() {
  const uid = useId();
  const [selected, setSelected] = useState(DEFAULT_NODE);
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(DEFAULT_NODE);

  const node = NODE_BY_ID.get(selected) ?? GRAPH_NODES[0];
  const relations = useMemo(() => relationsOf(selected), [selected]);
  const lit = hovered ?? selected;
  const near = useMemo(() => new Set(relationsOf(lit).map((relation) => relation.node.id)), [lit]);

  const select = (id: string, view: View) => {
    setSelected(id);
    trackAqip("aqip_quality_graph_interaction", { node: id, view });
  };

  const expand = (id: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (!next) return;
    select(next, "explorer");
    requestAnimationFrame(() => document.getElementById(`${uid}-x-${next}`)?.scrollIntoView({ block: "nearest" }));
  };

  return (
    <div className={css.graph}>
      {/* Wide screens: the whole network. */}
      <div className={css.graphNetwork} data-view="network" role="group" aria-label="Quality graph network. Select an entity to see what it holds and what it connects to.">
        <svg className={css.graphEdges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {GRAPH_EDGES.map((edge) => {
            const from = NODE_BY_ID.get(edge.from);
            const to = NODE_BY_ID.get(edge.to);
            if (!from || !to) return null;
            const on = edge.from === lit || edge.to === lit;
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} data-on={on ? "" : undefined} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        {GRAPH_NODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={css.graphNode}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            data-group={item.group}
            data-state={item.id === selected ? "selected" : item.id === lit ? "lit" : near.has(item.id) ? "near" : "far"}
            aria-pressed={item.id === selected}
            onClick={() => select(item.id, "network")}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(item.id)}
            onBlur={() => setHovered(null)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tablets: the selected entity and its direct connections. */}
      <div className={css.graphFocus} data-view="focus">
        <label className={css.graphJump}>
          <span>Entity</span>
          <select value={selected} autoComplete="off" onChange={(event) => select(event.target.value, "focus")}>
            {GRAPH_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {GRAPH_NODES.filter((item) => item.group === group.id).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className={css.focusStage} role="group" aria-label={`${node.label} and the entities it connects to`}>
          <svg className={css.graphEdges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {relations.map((relation, i) => {
              const at = around(i, relations.length);
              return <line key={relation.phrase} x1={50} y1={50} x2={at.x} y2={at.y} data-on="" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          <span className={css.focusCentre}>{node.label}</span>
          {relations.map((relation, i) => {
            const at = around(i, relations.length);
            return (
              <button key={relation.phrase} type="button" className={css.graphNode} data-state="near" style={{ left: `${at.x}%`, top: `${at.y}%` }} onClick={() => select(relation.node.id, "focus")}>
                {relation.node.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wide screens and tablets: what the selected entity holds. */}
      <aside className={css.graphPanel} data-view="panel" aria-live="polite" aria-label="Selected entity">
        <p className={css.panelGroup}>{GROUP_LABEL.get(node.group)}</p>
        <h4 className={css.panelTitle}>{node.label}</h4>
        <NodeDetail node={node} relations={relations} onPick={(id) => select(id, "network")} />
      </aside>

      {/* Phones: every entity, grouped by stage, each opening in place. */}
      <div className={css.graphExplorer} data-view="explorer">
        {GRAPH_GROUPS.map((group) => (
          <section key={group.id} className={css.explorerGroup} aria-label={group.label}>
            <h4 className={css.explorerTitle}>{group.label}</h4>
            <p className={css.explorerNote}>{group.description}</p>
            <ul className={css.explorerList}>
              {GRAPH_NODES.filter((item) => item.group === group.id).map((item) => {
                const open = expanded === item.id;
                return (
                  <li key={item.id} id={`${uid}-x-${item.id}`} className={css.explorerItem}>
                    <button type="button" className={css.explorerToggle} aria-expanded={open} aria-controls={`${uid}-xp-${item.id}`} onClick={() => expand(item.id)}>
                      <span>{item.label}</span>
                      <span className={css.mdChevron} aria-hidden="true" />
                    </button>
                    <div id={`${uid}-xp-${item.id}`} className={css.explorerPanel} hidden={!open}>
                      <NodeDetail node={item} relations={relationsOf(item.id)} onPick={(id) => expand(id)} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
