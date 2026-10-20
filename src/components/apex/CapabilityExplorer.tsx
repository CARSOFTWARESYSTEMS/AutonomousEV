"use client";

import { useMemo, useState } from "react";
import { RING_CATEGORY, RING_ORDER, type EcosystemRing } from "@/data/apex/capabilities";
import { CAPABILITIES, CAPABILITY_STATUS_LABEL, partnersForCapability, type CapabilityStatus } from "@/data/apex/partner-capabilities";
import { CapabilityBadge } from "./EvidenceBadge";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import eco from "./ecosystem.module.css";

const STATUSES: CapabilityStatus[] = ["CORE", "COLLABORATION", "PROPOSED", "PARTNER_REQUIRED"];

/** Every capability, filterable by area and coverage. Each opens its detail panel. */
export function CapabilityExplorer() {
  const { open } = usePanel();
  const [expanded, setExpanded] = useState(false);
  const [ring, setRing] = useState<EcosystemRing | "all">("all");
  const [status, setStatus] = useState<CapabilityStatus | "all">("all");

  const shown = useMemo(
    () => CAPABILITIES.filter((item) => (ring === "all" || item.ring === ring) && (status === "all" || item.status === status)),
    [ring, status],
  );

  if (!expanded) {
    return (
      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} aria-expanded={false} aria-controls="all-capabilities" onClick={() => setExpanded(true)}>
          Show all {CAPABILITIES.length} capabilities
        </button>
      </div>
    );
  }

  return (
    <div id="all-capabilities">
      <div className={eco.filters}>
        <div className={eco.filterGroup} role="group" aria-label="Filter by area">
          <span className={eco.filterLabel}>Area</span>
          <button type="button" className={styles.chip} aria-pressed={ring === "all"} onClick={() => setRing("all")}>
            All
          </button>
          {RING_ORDER.map((id) => (
            <button key={id} type="button" className={styles.chip} aria-pressed={ring === id} onClick={() => setRing(id)}>
              {RING_CATEGORY[id]}
            </button>
          ))}
        </div>
        <div className={eco.filterGroup} role="group" aria-label="Filter by coverage">
          <span className={eco.filterLabel}>Coverage</span>
          <button type="button" className={styles.chip} aria-pressed={status === "all"} onClick={() => setStatus("all")}>
            All
          </button>
          {STATUSES.map((id) => (
            <button key={id} type="button" className={styles.chip} aria-pressed={status === id} onClick={() => setStatus(id)}>
              {CAPABILITY_STATUS_LABEL[id]}
            </button>
          ))}
        </div>
      </div>

      <ul className={eco.capGrid}>
        {shown.map((item) => {
          const partners = partnersForCapability(item.id);
          return (
            <li key={item.id} style={{ display: "contents" }}>
              <button type="button" className={eco.capCard} data-status={item.status} aria-haspopup="dialog" onClick={(event) => open({ kind: "capability", id: item.id }, event.currentTarget)}>
                <span className={eco.capCategory}>{item.category}</span>
                <span className={styles.h3} style={{ fontSize: 18 }}>
                  {item.name}
                </span>
                <span className={styles.small}>{item.systemRole}</span>
                <span className={eco.partnerChips}>
                  {partners.map(({ partner }) => (
                    <span key={partner.id} className={eco.partnerChip}>
                      {partner.shortName}
                    </span>
                  ))}
                  <span className={eco.partnerChip} data-open="">
                    {partners.length ? "+ Open to more" : "Partner required"}
                  </span>
                </span>
                <span style={{ justifySelf: "start" }}>
                  <CapabilityBadge status={item.status} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className={eco.count} aria-live="polite">
        {shown.length} of {CAPABILITIES.length} capabilities shown
      </p>
    </div>
  );
}
