"use client";

import { useId, useRef, useState } from "react";
import type { ExplorerNode } from "@/lib/battery-cybersecurity/types";
import { TrustStateBadge, EvidenceStatusBadge, SeverityBadge } from "./Badges";
import pageStyles from "./page.module.css";
import styles from "./NodeExplorer.module.css";

function ExplorerBadgeView({ badge }: { badge: NonNullable<ExplorerNode["badge"]> }) {
  if (badge.kind === "trust") return <TrustStateBadge state={badge.value} />;
  if (badge.kind === "evidence") return <EvidenceStatusBadge status={badge.value} />;
  return <SeverityBadge severity={badge.value} />;
}

export function NodeExplorer({
  nodes,
  ariaLabel,
  trackEventPrefix,
}: {
  nodes: ExplorerNode[];
  ariaLabel: string;
  trackEventPrefix: string;
}) {
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % nodes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + nodes.length) % nodes.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = nodes.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      setSelectedId(nodes[nextIndex].id);
    }
  };

  if (!selected) return null;

  const panelId = `${baseId}-panel`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroller} role="tablist" aria-label={ariaLabel}>
        {nodes.map((node, index) => {
          const isActive = node.id === selectedId;
          return (
            <button
              key={node.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${node.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={isActive ? styles.tabActive : styles.tab}
              onClick={() => setSelectedId(node.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              data-track-event={`${trackEventPrefix}_node_selected`}
              data-track-node={node.id}
            >
              {node.label}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${selected.id}`}
        tabIndex={0}
        className={`${pageStyles.navyPanel} ${styles.panel}`}
      >
        <div className={styles.panelHeader}>
          <h4 className={styles.panelTitle}>{selected.label}</h4>
          {selected.badge && <ExplorerBadgeView badge={selected.badge} />}
        </div>
        <p className={styles.panelSummary}>{selected.summary}</p>
        <div className={styles.detailGrid}>
          {selected.detailSections.map((section) => (
            <div key={section.heading}>
              <p className={styles.detailHeading}>{section.heading}</p>
              {Array.isArray(section.body) ? (
                <ul className={styles.detailList}>
                  {section.body.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.detailBody}>{section.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
