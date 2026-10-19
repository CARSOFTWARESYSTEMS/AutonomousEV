"use client";

import { useState } from "react";
import { DISPLAY_STATUS_LABEL, type DisplayStatus } from "@/data/apex/evidence";
import { hasInterface, SYSTEM_DOMAINS, SYSTEM_LAYER_LABEL, SYSTEM_LAYERS } from "@/data/apex/system";
import { EvidenceBadge } from "./EvidenceBadge";
import { trackApex } from "./analytics";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import explorer from "./explorer.module.css";

const ABBR: Record<string, string> = {
  propulsion: "PRP",
  structures: "STR",
  power: "PWR",
  avionics: "AVN",
  embedded: "EMB",
  firmware: "FW",
  sensors: "SNS",
  instrumentation: "INS",
  gnc: "GNC",
  telemetry: "TLM",
  rf: "RF",
  "flight-software": "FSW",
  "ground-software": "GSW",
  "ground-hardware": "GHW",
  quality: "QA",
  cybersecurity: "CYB",
  "digital-engineering": "DE",
  testing: "TST",
};

const LEGEND: DisplayStatus[] = ["BUILT", "CONCEPT", "PARTNER_REQUIRED", "EVIDENCE_REQUIRED"];

/**
 * The rocket as a system of systems. Each domain opens the shared detail
 * panel. The technical view adds interface counts and the N² interface matrix.
 */
export function SystemExplorer({ allowTechnical = false }: { allowTechnical?: boolean }) {
  const { open } = usePanel();
  const [technical, setTechnical] = useState(false);
  const [hover, setHover] = useState<{ row: string; col: string } | null>(null);

  const order = SYSTEM_LAYERS.flatMap((layer) => SYSTEM_DOMAINS.filter((domain) => domain.layer === layer));

  return (
    <div>
      <div className={explorer.toolbar}>
        <ul className={explorer.legend} aria-label="Status key">
          {LEGEND.map((status) => (
            <li key={status}>
              <EvidenceBadge status={status} />
            </li>
          ))}
        </ul>
        {allowTechnical && (
          <div className={explorer.segmented} role="group" aria-label="View">
            <button type="button" aria-pressed={!technical} onClick={() => setTechnical(false)}>
              Executive view
            </button>
            <button
              type="button"
              aria-pressed={technical}
              onClick={() => {
                if (!technical) trackApex("apex_technical_view", { section_id: "system_explorer" });
                setTechnical(true);
              }}
            >
              Technical view
            </button>
          </div>
        )}
      </div>

      <div className={explorer.layers}>
        {SYSTEM_LAYERS.map((layer) => (
          <div key={layer} className={explorer.layer}>
            <h3 className={explorer.layerTitle}>{SYSTEM_LAYER_LABEL[layer]}</h3>
            <ul className={explorer.tiles}>
              {SYSTEM_DOMAINS.filter((domain) => domain.layer === layer).map((domain) => (
                <li key={domain.id} style={{ display: "contents" }}>
                  <button
                    type="button"
                    className={explorer.tile}
                    data-status={domain.status}
                    aria-haspopup="dialog"
                    onClick={(event) => open({ kind: "domain", id: domain.id }, event.currentTarget)}
                  >
                    <span className={explorer.tileName}>{domain.name}</span>
                    <span className={explorer.tileMeta}>
                      <span className={styles.badgeMark} aria-hidden="true" style={{ width: 6, height: 6, background: domain.status === "BUILT" ? "var(--apex-amber)" : "var(--apex-line-strong)" }} />
                      {DISPLAY_STATUS_LABEL[domain.status]}
                      {technical && (
                        <>
                          <span aria-hidden="true">·</span>
                          {domain.interfaces.length} interfaces
                          <span aria-hidden="true">·</span>
                          {domain.capabilityIds.length} capabilities
                        </>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {technical && (
        <div>
          <div className={explorer.matrixWrap} onMouseLeave={() => setHover(null)}>
            <table className={explorer.matrix}>
              <caption className={styles.srOnly}>N-squared interface matrix: a filled cell means the two domains share an interface.</caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span className={styles.srOnly}>Domain</span>
                  </th>
                  {order.map((domain) => (
                    <th key={domain.id} scope="col" data-hl={hover?.col === domain.id ? "true" : undefined} title={domain.name}>
                      <span className={explorer.colHead}>{ABBR[domain.id]}</span>
                      <span className={styles.srOnly}>{domain.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" data-hl={hover?.row === row.id ? "true" : undefined}>
                      <button type="button" className={explorer.rowButton} onClick={(event) => open({ kind: "domain", id: row.id }, event.currentTarget)}>
                        {ABBR[row.id]} · {row.name}
                      </button>
                    </th>
                    {order.map((col) => {
                      const on = hasInterface(row.id, col.id);
                      const self = row.id === col.id;
                      return (
                        <td
                          key={col.id}
                          className={`${explorer.cell} ${on ? explorer.cellOn : ""} ${self ? explorer.cellSelf : ""}`}
                          data-hl={hover && (hover.row === row.id || hover.col === col.id) ? "true" : undefined}
                          onMouseEnter={() => setHover({ row: row.id, col: col.id })}
                        >
                          <span className={styles.srOnly}>{self ? "—" : on ? `${row.name} interfaces with ${col.name}` : "no interface"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.small} style={{ marginTop: 12 }}>
            N² interface matrix — {order.length} domains. A filled cell is an interface APEX must control. Hover to trace a row and column; select a domain to see its detail.
          </p>
        </div>
      )}
    </div>
  );
}
