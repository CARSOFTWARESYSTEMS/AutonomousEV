"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTRIBUTION_AREAS } from "@/data/apex/business";
import { MISSION_TO_FLIGHT } from "@/data/apex/lifecycle";
import { capability, partnersForCapability } from "@/data/apex/partner-capabilities";
import { apexHref } from "@/data/apex/site";
import { CapabilityBadge } from "./EvidenceBadge";
import { apexTrack, trackApex } from "./analytics";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import eco from "./ecosystem.module.css";

/** WHERE CAN WE CONTRIBUTE? — pick a capability you offer, see where it meets the APEX lifecycle. */
export function ContributionFinder() {
  const { open } = usePanel();
  const [areaId, setAreaId] = useState(CONTRIBUTION_AREAS[0].id);
  const area = CONTRIBUTION_AREAS.find((item) => item.id === areaId)!;

  return (
    <div className={eco.finder}>
      <div>
        <p className={styles.small} style={{ marginBottom: 14 }}>
          I can contribute:
        </p>
        <div className={styles.chips} role="group" aria-label="Your capability">
          {CONTRIBUTION_AREAS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.chip}
              aria-pressed={areaId === item.id}
              aria-controls="contribution-result"
              onClick={() => {
                setAreaId(item.id);
                trackApex("apex_partner_interest", { area_id: item.id, placement: "contribution_finder" });
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={eco.finderResult} id="contribution-result" aria-live="polite">
        <div className={eco.finderBlock}>
          <span className={styles.eyebrow}>Where {area.label} connects to the APEX development lifecycle</span>
          <ol className={eco.stageList}>
            {area.lifecycleIds.map((id) => {
              const index = MISSION_TO_FLIGHT.findIndex((node) => node.id === id);
              return (
                <li key={id} className={eco.stage}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {MISSION_TO_FLIGHT[index].label}
                </li>
              );
            })}
          </ol>
        </div>
        <div className={eco.finderBlock}>
          <span className={styles.eyebrow}>Capabilities</span>
          <ul className={eco.sectorList}>
            {area.capabilityIds.map((id) => {
              const item = capability(id);
              const names = partnersForCapability(id).map(({ partner }) => partner.shortName);
              return (
                <li key={id}>
                  <button type="button" className={eco.capRow} aria-haspopup="dialog" onClick={(event) => open({ kind: "capability", id }, event.currentTarget)}>
                    <span className={eco.capRowHead}>
                      <span className={eco.capName}>{item.name}</span>
                      <CapabilityBadge status={item.status} />
                    </span>
                    <span className={eco.capPartners}>{names.length ? `${names.join(" · ")} · open to more` : "Partner required — open to multiple partners"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={eco.finderBlock}>
          <span className={styles.eyebrow}>Interfaces that matter</span>
          <ul className={styles.list}>
            {area.interfacesThatMatter.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={eco.finderBlock}>
          <Link
            href={apexHref(`/company?topic=${area.id}#contact`)}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ justifySelf: "start" }}
            {...apexTrack("apex_partner_interest", { area_id: area.id, placement: "contribution_finder_cta" })}
          >
            Register interest <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
