"use client";

import { useState } from "react";
import type { Likelihood, RiskMatrixCell, Severity } from "@/lib/battery-cybersecurity/types";
import pageStyles from "../../../page.module.css";

const LIKELIHOODS: Likelihood[] = ["likely", "possible", "rare"];
const IMPACTS: Severity[] = ["low", "medium", "high", "critical"];

function priorityColor(priority: Severity): string {
  if (priority === "critical") return "#f87171";
  if (priority === "high") return "#fb923c";
  if (priority === "medium") return "#fbbf24";
  return "#94a3b8";
}

export function RiskMatrixView({ cells }: { cells: RiskMatrixCell[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  function cellFor(likelihood: Likelihood, impact: Severity) {
    return cells.find((c) => c.likelihood === likelihood && c.impact === impact);
  }

  const selectedCell = selectedKey
    ? cells.find((c) => `${c.likelihood}|${c.impact}` === selectedKey)
    : null;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "480px" }} aria-label="Risk matrix: likelihood by impact">
          <caption style={{ textAlign: "left", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
            Select a cell to see its recommendations. Likelihood (rows) reflects how confirmed a gap is; Impact (columns) is the gap&rsquo;s severity.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ padding: "8px 12px" }}></th>
              {IMPACTS.map((impact) => (
                <th key={impact} scope="col" style={{ padding: "8px 12px", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {impact}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIKELIHOODS.map((likelihood) => (
              <tr key={likelihood}>
                <th scope="row" style={{ padding: "8px 12px", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "capitalize", textAlign: "left" }}>
                  {likelihood}
                </th>
                {IMPACTS.map((impact) => {
                  const cell = cellFor(likelihood, impact);
                  const key = `${likelihood}|${impact}`;
                  const count = cell?.recommendations.length ?? 0;
                  return (
                    <td key={impact} style={{ padding: "4px" }}>
                      <button
                        type="button"
                        onClick={() => count > 0 && setSelectedKey(key === selectedKey ? null : key)}
                        aria-pressed={selectedKey === key}
                        aria-label={`Likelihood ${likelihood}, impact ${impact}, ${count} item${count === 1 ? "" : "s"}`}
                        disabled={count === 0}
                        style={{
                          width: "72px",
                          height: "52px",
                          minWidth: "44px",
                          minHeight: "44px",
                          borderRadius: "var(--radius-sm)",
                          border: selectedKey === key ? "2px solid var(--bcs-cyan)" : "1px solid var(--glass-border)",
                          background: count > 0 ? `${priorityColor(cell!.priority)}22` : "rgba(148,163,184,0.05)",
                          color: count > 0 ? priorityColor(cell!.priority) : "var(--text-muted)",
                          fontWeight: 700,
                          fontSize: "1rem",
                          cursor: count > 0 ? "pointer" : "default",
                        }}
                      >
                        {count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className={pageStyles.navyPanel} style={{ padding: "18px 20px", marginTop: "16px" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", textTransform: "capitalize" }}>
            {selectedCell.likelihood} likelihood &times; {selectedCell.impact} impact ({selectedCell.priority} priority)
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {selectedCell.recommendations.map((rec) => (
              <li key={rec.id} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {rec.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
