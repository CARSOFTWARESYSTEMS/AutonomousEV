"use client";

import { useState, type KeyboardEvent } from "react";
import { RING_LABEL, RING_ORDER, type EcosystemRing } from "@/data/apex/capabilities";
import { CAPABILITIES, CAPABILITY_PARTNERS, partnersForCapability } from "@/data/apex/partner-capabilities";
import { PARTNERS } from "@/data/apex/partners";
import { CapabilityBadge } from "./EvidenceBadge";
import { usePanel } from "./panelContext";
import styles from "./apex.module.css";
import eco from "./ecosystem.module.css";

const C = 400;
const R_CORE = 92;
const R_IN = 112;
const R_OUT = 196;
const R_CAP = 266;
const R_PARTNER = 356;

const SECTOR_START: Record<EcosystemRing, number> = { rocket: -90, engine: -30, vehicle: 30, software: 90, test: 150, manufacturing: 210 };

/** Where each partner sits on the outer ring, near the capabilities it contributes to (degrees, clockwise from the right). */
const PARTNER_ANGLE: Record<string, number> = {
  evsociety: -76,
  "academic-institutions": -46,
  ifab: 14,
  itelematics: 112,
  gamyaa: 178,
};

const f = (n: number) => n.toFixed(1);
const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (r: number, deg: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });

function arc(r1: number, r2: number, a1: number, a2: number): string {
  const p1 = point(r2, a1);
  const p2 = point(r2, a2);
  const p3 = point(r1, a2);
  const p4 = point(r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${f(p1.x)},${f(p1.y)} A${R_OUT},${R_OUT} 0 ${large} 1 ${f(p2.x)},${f(p2.y)} L${f(p3.x)},${f(p3.y)} A${R_IN},${R_IN} 0 ${large} 0 ${f(p4.x)},${f(p4.y)} Z`;
}

/** Capability dot positions: spread evenly inside their sector. */
const DOTS = RING_ORDER.flatMap((ring) => {
  const items = CAPABILITIES.filter((item) => item.ring === ring);
  const start = SECTOR_START[ring] + 7;
  const span = 60 - 14;
  return items.map((item, i) => {
    const angle = items.length === 1 ? start + span / 2 : start + (span * i) / (items.length - 1);
    const p = point(R_CAP, angle);
    return { id: item.id, ring, status: item.status, name: item.name, x: f(p.x), y: f(p.y), angle };
  });
});

const NODES = PARTNERS.filter((p) => p.id in PARTNER_ANGLE).map((p) => {
  const pt = point(R_PARTNER, PARTNER_ANGLE[p.id]);
  return { id: p.id, name: p.shortName, x: pt.x, y: pt.y };
});

const LINKS = CAPABILITY_PARTNERS.filter((r) => r.partnerId in PARTNER_ANGLE).map((r) => {
  const dot = DOTS.find((d) => d.id === r.capabilityId)!;
  const node = NODES.find((n) => n.id === r.partnerId)!;
  // Curved toward the centre: every partnership runs through APEX.
  const cx = C + (Number(dot.x) + node.x - 2 * C) * 0.32;
  const cy = C + (Number(dot.y) + node.y - 2 * C) * 0.32;
  return { key: `${r.capabilityId}-${r.partnerId}`, capabilityId: r.capabilityId, partnerId: r.partnerId, d: `M${dot.x},${dot.y} Q${f(cx)},${f(cy)} ${f(node.x)},${f(node.y)}` };
});

function onKeyActivate(event: KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

/**
 * APEX at the centre; the six areas of the program around it; every capability
 * in the second ring; partners in the third. On narrow screens the same
 * content is shown as tabs and a list.
 */
export function EcosystemRings() {
  const { open } = usePanel();
  const [ring, setRing] = useState<EcosystemRing>("engine");
  const [hover, setHover] = useState<string | null>(null);
  const [hoverPartner, setHoverPartner] = useState<string | null>(null);

  const ringCaps = CAPABILITIES.filter((item) => item.ring === ring);
  const hovered = hover ? CAPABILITIES.find((item) => item.id === hover) : null;

  const linkActive = (link: (typeof LINKS)[number]) =>
    hover ? link.capabilityId === hover : hoverPartner ? link.partnerId === hoverPartner : ringCaps.some((c) => c.id === link.capabilityId);

  return (
    <div className={eco.rings}>
      <div className={eco.diagram}>
        <svg viewBox="-50 -30 900 860" role="group" aria-label="Ecosystem diagram: APEX at the centre, program areas, capabilities and partners">
          <circle className={eco.ringGuide} cx={C} cy={C} r={R_CAP} />
          <circle className={eco.ringGuide} cx={C} cy={C} r={R_PARTNER} />
          {LINKS.map((link) => (
            <path key={link.key} className={eco.link} d={link.d} data-active={linkActive(link) ? "true" : "false"} />
          ))}
          {RING_ORDER.map((id) => {
            const a1 = SECTOR_START[id] + 1;
            const a2 = SECTOR_START[id] + 59;
            const label = point((R_IN + R_OUT) / 2, SECTOR_START[id] + 30);
            return (
              <g key={id}>
                <path
                  className={eco.sector}
                  d={arc(R_IN, R_OUT, a1, a2)}
                  data-active={ring === id ? "true" : "false"}
                  role="button"
                  tabIndex={0}
                  aria-pressed={ring === id}
                  aria-label={`${RING_LABEL[id]}: show its capabilities`}
                  onClick={() => setRing(id)}
                  onKeyDown={(event) => onKeyActivate(event, () => setRing(id))}
                />
                <text className={eco.sectorLabel} x={f(label.x)} y={f(label.y + 4)} textAnchor="middle">
                  {RING_LABEL[id]}
                </text>
              </g>
            );
          })}
          <g className={eco.core}>
            <circle cx={C} cy={C} r={R_CORE} />
            <text x={C} y={C - 2} textAnchor="middle">
              APEX
            </text>
            <text className={eco.coreSub} x={C} y={C + 22} textAnchor="middle">
              PROGRAM OWNER
            </text>
          </g>
          {DOTS.map((dot) => (
            <circle
              key={dot.id}
              className={eco.dot}
              cx={dot.x}
              cy={dot.y}
              r={hover === dot.id ? 11 : 8}
              data-status={dot.status}
              data-dim={dot.ring !== ring && hover !== dot.id ? "true" : "false"}
              role="button"
              tabIndex={0}
              aria-label={`${dot.name}: open capability detail`}
              onMouseEnter={() => setHover(dot.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(dot.id)}
              onBlur={() => setHover(null)}
              onClick={(event) => open({ kind: "capability", id: dot.id }, event.currentTarget)}
              onKeyDown={(event) => onKeyActivate(event, () => open({ kind: "capability", id: dot.id }, event.currentTarget))}
            />
          ))}
          {NODES.map((node) => (
            <g
              key={node.id}
              className={eco.partnerNode}
              transform={`translate(${f(node.x - 78)} ${f(node.y - 20)})`}
              data-active={hoverPartner === node.id || (hover ? LINKS.some((l) => l.capabilityId === hover && l.partnerId === node.id) : false) ? "true" : "false"}
              role="button"
              tabIndex={0}
              aria-label={`${node.name}: open partner detail`}
              onMouseEnter={() => setHoverPartner(node.id)}
              onMouseLeave={() => setHoverPartner(null)}
              onFocus={() => setHoverPartner(node.id)}
              onBlur={() => setHoverPartner(null)}
              onClick={(event) => open({ kind: "partner", id: node.id }, event.currentTarget)}
              onKeyDown={(event) => onKeyActivate(event, () => open({ kind: "partner", id: node.id }, event.currentTarget))}
            >
              <rect width={156} height={40} rx={2} />
              <text x={78} y={25} textAnchor="middle">
                {node.name}
              </text>
            </g>
          ))}
        </svg>
        <p className={eco.hoverInfo} aria-live="polite">
          {hovered
            ? `${hovered.name} — ${partnersForCapability(hovered.id).map(({ partner }) => partner.shortName).join(" · ") || "partner required"}`
            : "Inner ring: program areas · middle ring: capabilities · outer ring: partners"}
        </p>
      </div>

      <div>
        <div className={eco.sectorTabs} role="group" aria-label="Program area">
          {RING_ORDER.map((id) => (
            <button key={id} type="button" className={styles.chip} aria-pressed={ring === id} onClick={() => setRing(id)}>
              {RING_LABEL[id]}
              <span className={styles.mono} style={{ fontSize: 10.5, opacity: 0.7 }}>
                {CAPABILITIES.filter((item) => item.ring === id).length}
              </span>
            </button>
          ))}
        </div>
        <ul className={eco.sectorList} aria-label={`${RING_LABEL[ring]} capabilities`}>
          {ringCaps.map((item) => {
            const names = partnersForCapability(item.id).map(({ partner }) => partner.shortName);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={eco.capRow}
                  data-hover={hover === item.id ? "true" : "false"}
                  aria-haspopup="dialog"
                  onMouseEnter={() => setHover(item.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={(event) => open({ kind: "capability", id: item.id }, event.currentTarget)}
                >
                  <span className={eco.capRowHead}>
                    <span className={eco.capName}>{item.name}</span>
                    <CapabilityBadge status={item.status} />
                  </span>
                  <span className={eco.capPartners}>{names.length ? names.join(" · ") : "Partner required — open to multiple partners"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
