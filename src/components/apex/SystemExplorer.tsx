"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DISPLAY_STATUS_LABEL, type DisplayStatus } from "@/data/apex/evidence";
import { hasInterface, SYSTEM_DOMAINS, SYSTEM_LAYER_LABEL, SYSTEM_LAYER_LINE, SYSTEM_LAYERS, type SystemLayer } from "@/data/apex/system";
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
 * The rocket as a system of systems, in six expandable groups so the eighteen
 * domains are never a wall of equal cards. Each domain opens the shared detail
 * panel. The technical view adds interface counts and the N² interface matrix.
 */
export function SystemExplorer({ allowTechnical = false }: { allowTechnical?: boolean }) {
  const { open } = usePanel();
  const [technical, setTechnical] = useState(false);
  const [hover, setHover] = useState<{ row: string; col: string } | null>(null);
  const [openGroups, setOpenGroups] = useState<SystemLayer[]>(["propulsion"]);

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

      <div className={explorer.groups}>
        {SYSTEM_LAYERS.map((layer) => {
          const domains = SYSTEM_DOMAINS.filter((domain) => domain.layer === layer);
          const expanded = openGroups.includes(layer);
          return (
            <div key={layer} className={explorer.group} data-expanded={expanded ? "true" : "false"}>
              <h3 className={explorer.groupHeading}>
                <button
                  type="button"
                  className={explorer.groupHead}
                  aria-expanded={expanded}
                  aria-controls={`group-${layer}`}
                  onClick={() => setOpenGroups((current) => (current.includes(layer) ? current.filter((g) => g !== layer) : [...current, layer]))}
                >
                  <span className={explorer.groupName}>{SYSTEM_LAYER_LABEL[layer]}</span>
                  <span className={explorer.groupLine}>{SYSTEM_LAYER_LINE[layer]}</span>
                  <span className={explorer.groupCount}>
                    {domains.length} {domains.length === 1 ? "domain" : "domains"}
                  </span>
                  <ChevronDown className={explorer.groupChevron} size={20} aria-hidden="true" />
                </button>
              </h3>
              <ul id={`group-${layer}`} className={explorer.groupBody} hidden={!expanded}>
                {domains.map((domain) => (
                  <li key={domain.id}>
                    <button
                      type="button"
                      className={explorer.domainRow}
                      data-status={domain.status}
                      aria-haspopup="dialog"
                      onClick={(event) => open({ kind: "domain", id: domain.id }, event.currentTarget)}
                    >
                      <span className={explorer.tileName}>{domain.name}</span>
                      <span className={explorer.domainPurpose}>{domain.purpose}</span>
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
                      <ArrowRight className={explorer.domainArrow} size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
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
