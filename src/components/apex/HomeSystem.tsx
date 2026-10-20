"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_DOMAINS } from "@/data/apex/system";
import { apexHref } from "@/data/apex/site";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import home from "./home.module.css";

/** One zone of the schematic; active when its domain is selected. */
function Zone({ id, active, children, onEnter }: { id: string; active: string; children: React.ReactNode; onEnter: (id: string) => void }) {
  return (
    <g className={home.zoneGroup} data-active={active === id ? "true" : "false"} onMouseEnter={() => onEnter(id)}>
      {children}
    </g>
  );
}

/**
 * 04 — An engine is the beginning. Six executive domains beside a line
 * schematic of a launch vehicle (illustrative, not an APEX design). Hover or
 * tap a domain to highlight it. The full eighteen domains live on /system.
 */
export function HomeSystem() {
  const [active, setActive] = useState("propulsion");
  return (
    <section className={styles.section} aria-labelledby="beginning-title" id="system">
      <div className={styles.container}>
        <div className={home.systemGrid}>
          <div>
            <div className={home.headline}>
              <p className={styles.eyebrow}>Engine → rocket system</p>
              <h2 id="beginning-title" className={styles.h2}>
                An engine is the beginning.
              </h2>
            </div>
            <ul className={home.domains}>
              {HOME_DOMAINS.map((domain, index) => (
                <li key={domain.id}>
                  <button
                    type="button"
                    className={home.domain}
                    aria-pressed={active === domain.id}
                    onClick={() => setActive(domain.id)}
                    onMouseEnter={() => setActive(domain.id)}
                    onFocus={() => setActive(domain.id)}
                  >
                    <span className={home.domainIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={home.domainName}>{domain.name}</span>
                    <span className={home.domainLine}>{domain.line}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <Link href={apexHref("/system")} className={home.more} {...apexTrack("apex_cta_click", { cta: "complete_system", placement: "home_system" })}>
                Explore the complete system <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <figure className={home.schematic} style={{ margin: 0 }}>
            <svg viewBox="0 0 280 540" role="img" aria-label={`Schematic of a launch vehicle; highlighted: ${HOME_DOMAINS.find((d) => d.id === active)?.name}.`}>
              <Zone id="software" active={active} onEnter={setActive}>
                <path className={home.softwareLine} d="M40 24 V470 M34 24 H46 M34 470 H46" />
                <text className={home.zoneLabel} transform="rotate(-90 26 250)" x="26" y="250" textAnchor="middle">
                  SOFTWARE
                </text>
              </Zone>
              <Zone id="gnc" active={active} onEnter={setActive}>
                <path className={home.zone} d="M120 24 C 134 52 148 84 148 116 L92 116 C 92 84 106 52 120 24 Z" />
                <path className={home.zone} d="M92 352 L68 400 L92 392 Z M148 352 L172 400 L148 392 Z" />
                <text className={home.zoneLabel} x="160" y="72">
                  GUIDANCE &amp; CONTROL
                </text>
              </Zone>
              <Zone id="avionics" active={active} onEnter={setActive}>
                <rect className={home.zone} x="92" y="116" width="56" height="40" />
                <text className={home.zoneLabel} x="160" y="140">
                  AVIONICS
                </text>
              </Zone>
              <Zone id="structures" active={active} onEnter={setActive}>
                <rect className={home.zone} x="92" y="156" width="56" height="196" />
                <path className={home.detail} d="M92 250 Q120 268 148 250 M92 262 Q120 244 148 262" />
                <text className={home.zoneLabel} x="160" y="256">
                  STRUCTURES
                </text>
              </Zone>
              <Zone id="propulsion" active={active} onEnter={setActive}>
                <rect className={home.zone} x="92" y="352" width="56" height="38" />
                <path className={home.zone} d="M106 390 L134 390 L150 446 L90 446 Z" />
                <text className={home.zoneLabel} x="160" y="420">
                  PROPULSION
                </text>
              </Zone>
              <Zone id="ground-test" active={active} onEnter={setActive}>
                <path className={home.zone} d="M30 470 H250 V480 H30 Z" />
                <path className={home.zone} d="M234 110 H244 V470 H234 Z" />
                <path className={home.detail} d="M234 170 H148 M234 300 H148" />
                <text className={home.zoneLabel} x="140" y="504" textAnchor="middle">
                  GROUND &amp; TEST
                </text>
              </Zone>
            </svg>
            <figcaption className={styles.small}>Schematic for orientation — not an APEX vehicle design.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
