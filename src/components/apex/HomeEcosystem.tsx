"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { partner } from "@/data/apex/partners";
import { apexHref } from "@/data/apex/site";
import { apexTrack } from "./analytics";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import home from "./home.module.css";

const NODES = [
  { id: "gamyaa", pos: "tl", focus: "Digital Engineering · Quality" },
  { id: "ifab", pos: "tr", focus: "Embedded Systems · Firmware" },
  { id: "itelematics", pos: "bl", focus: "Cybersecurity · AI" },
  { id: "evsociety", pos: "br", focus: "Skills · Workforce" },
] as const;

/** 06 — APEX at the centre with system authority; the core partners and the open specialist ecosystem around it. */
export function HomeEcosystem() {
  const { open } = usePanel();
  return (
    <section className={styles.section} aria-labelledby="ecosystem-title" id="ecosystem">
      <div className={styles.container}>
        <div className={home.headline}>
          <p className={styles.eyebrow}>Engineering ecosystem</p>
          <h2 id="ecosystem-title" className={styles.h2}>
            APEX doesn&rsquo;t have to build everything alone.
          </h2>
          <p className={styles.lead}>
            Specialist partners contribute critical capabilities across embedded systems, digital engineering, cybersecurity, AI, manufacturing, sensors, avionics,
            testing and workforce development.
          </p>
        </div>

        <div className={home.constellation}>
          <svg className={home.constellationLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="50" y1="50" x2="17" y2="14" />
            <line x1="50" y1="50" x2="83" y2="14" />
            <line x1="50" y1="50" x2="17" y2="86" />
            <line x1="50" y1="50" x2="83" y2="86" />
            <line x1="50" y1="50" x2="50" y2="86" />
          </svg>
          <div className={home.core}>
            <span className={home.coreName}>APEX</span>
            <span className={home.coreRole}>System authority</span>
          </div>
          {NODES.map((node) => {
            const p = partner(node.id);
            return (
              <button
                key={node.id}
                type="button"
                className={home.node}
                data-pos={node.pos}
                aria-haspopup="dialog"
                onClick={(event) => open({ kind: "partner", id: node.id }, event.currentTarget)}
              >
                <span className={home.nodeName}>{p.shortName === "Gamyaa" ? p.name : p.shortName}</span>
                <span className={home.nodeFocus}>{node.focus}</span>
              </button>
            );
          })}
          <Link
            href={apexHref("/ecosystem#capabilities")}
            className={home.node}
            data-pos="bc"
            data-open="true"
            {...apexTrack("apex_cta_click", { cta: "specialist_ecosystem", placement: "home_ecosystem" })}
          >
            <span className={home.nodeName}>Specialist ecosystem</span>
            <span className={home.nodeFocus}>Avionics · Sensors · GNC · Manufacturing · Testing</span>
          </Link>
        </div>

        <div className={home.authority}>
          <p className={home.authorityLine}>APEX retains system authority.</p>
          <Link href={apexHref("/ecosystem")} className={home.more} {...apexTrack("apex_cta_click", { cta: "ecosystem", placement: "home_ecosystem" })}>
            Explore the engineering ecosystem <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
