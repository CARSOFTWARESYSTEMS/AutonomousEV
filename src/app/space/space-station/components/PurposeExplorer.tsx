"use client";
import { useRef, useState } from "react";
import { FlaskConical, HeartPulse, Cpu, Telescope, Factory, Rocket, ArrowRight, type LucideIcon } from "lucide-react";
import { PURPOSES, PURPOSE_DOMAINS, PURPOSE_RELATED, type DomainId } from "../data/systems";
import { useMode } from "./ModeProvider";
import styles from "../station.module.css";
import px from "./purpose.module.css";

const ICON: Record<DomainId, LucideIcon> = {
  microgravity: FlaskConical,
  human: HeartPulse,
  technology: Cpu,
  "earth-space": Telescope,
  industry: Factory,
  exploration: Rocket,
};

// Six nodes evenly spaced on the orbit ring, starting at the top.
const R = 38;
const position = (i: number) => {
  const a = (i / PURPOSE_DOMAINS.length) * 2 * Math.PI - Math.PI / 2;
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
};

export default function PurposeExplorer() {
  const [domainId, setDomainId] = useState<DomainId>("microgravity");
  const domain = PURPOSE_DOMAINS.find((d) => d.id === domainId)!;
  const [purposeId, setPurposeId] = useState(domain.purposes[0]);
  const { mode } = useMode();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const purpose = PURPOSES.find((p) => p.id === purposeId) ?? PURPOSES.find((p) => p.id === domain.purposes[0])!;
  const index = PURPOSE_DOMAINS.findIndex((d) => d.id === domainId);

  const select = (i: number, focus = false) => {
    const n = (i + PURPOSE_DOMAINS.length) % PURPOSE_DOMAINS.length;
    const d = PURPOSE_DOMAINS[n];
    setDomainId(d.id);
    setPurposeId(d.purposes[0]);
    if (focus) refs.current[n]?.focus();
  };

  return (
    <div className={px.explorer}>
      <div className={px.mapWrap}>
        <div className={px.map} role="radiogroup" aria-label="Research domains">
          <svg viewBox="0 0 100 100" aria-hidden="true" className={px.orbit}>
            <circle cx="50" cy="50" r={R} className={px.ring} />
            <circle cx="50" cy="50" r={R - 13} className={px.ringInner} />
            {PURPOSE_DOMAINS.map((d, i) => {
              const p = position(i);
              return <line key={d.id} x1="50" y1="50" x2={p.x} y2={p.y} className={i === index ? px.spokeOn : px.spoke} />;
            })}
          </svg>
          <div className={px.core}>
            <svg viewBox="0 0 64 40" aria-hidden="true" className={px.coreGlyph}>
              <rect x="2" y="17" width="60" height="4" rx="1" fill="#94a3b8" />
              <rect x="4" y="4" width="10" height="30" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
              <rect x="50" y="4" width="10" height="30" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
              <rect x="20" y="23" width="24" height="9" rx="4" fill="#cbd5e1" />
            </svg>
            <span>Why humanity builds orbital research stations</span>
          </div>
          {PURPOSE_DOMAINS.map((d, i) => {
            const p = position(i);
            const Icon = ICON[d.id];
            const on = d.id === domainId;
            return (
              <button
                key={d.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className={px.node}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => select(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    select(i + 1, true);
                  }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    select(i - 1, true);
                  }
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span className={px.nodeName}>{d.name}</span>
                <span className={px.nodeCount}>{d.purposes.length} research areas</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className={px.panel} aria-live="polite" aria-labelledby="domain-title">
        <div className={styles.eyebrow}>
          Domain {index + 1} of {PURPOSE_DOMAINS.length}
        </div>
        <h3 id="domain-title">{domain.name}</h3>
        <p className={px.lede}>{domain.short}</p>
        <dl className={px.facts}>
          <div>
            <dt>Why a station?</dt>
            <dd>{domain.whyStation}</dd>
          </div>
          <div>
            <dt>Potential Earth & space applications</dt>
            <dd>{domain.applications}</dd>
          </div>
          <div>
            <dt>Relevant station facilities</dt>
            <dd>{domain.facility}</dd>
          </div>
        </dl>

        <h4 className={px.subTitle}>Research areas</h4>
        <div className={styles.chips} role="tablist" aria-label={`${domain.name} research areas`}>
          {domain.purposes.map((id) => {
            const q = PURPOSES.find((p) => p.id === id)!;
            return (
              <button key={id} type="button" role="tab" aria-selected={purpose.id === id} className={styles.chip} onClick={() => setPurposeId(id)}>
                {q.name}
              </button>
            );
          })}
        </div>
        <div className={px.area} role="tabpanel" aria-label={purpose.name}>
          <dl className={px.facts}>
            <div>
              <dt>Why space?</dt>
              <dd>{purpose.whySpace}</dd>
            </div>
            <div>
              <dt>Why not easily on Earth?</dt>
              <dd>{purpose.whyNotEarth}</dd>
            </div>
            <div>
              <dt>Example research questions</dt>
              <dd>
                <ul>
                  {purpose.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Relevant facility</dt>
              <dd>{purpose.facility}</dd>
            </div>
            <div>
              <dt>Potential Earth benefit</dt>
              <dd>{purpose.benefit}</dd>
            </div>
            {mode === "research" && (
              <div>
                <dt>Open research problem</dt>
                <dd>{purpose.open}</dd>
              </div>
            )}
            {PURPOSE_RELATED[purpose.id] && (
              <div>
                <dt>Also relevant to</dt>
                <dd>
                  {PURPOSE_RELATED[purpose.id].map((rid, k) => {
                    const r = PURPOSE_DOMAINS.find((d) => d.id === rid)!;
                    return (
                      <span key={rid}>
                        {k > 0 && ", "}
                        <button type="button" className={px.link} onClick={() => select(PURPOSE_DOMAINS.indexOf(r))}>
                          {r.name}
                        </button>
                      </span>
                    );
                  })}
                </dd>
              </div>
            )}
          </dl>
          {mode !== "research" && <p className={px.hint}>Research mode adds the open research problem for each area.</p>}
        </div>
        <a href={domain.cta.href} className={styles.primaryButton} style={{ marginTop: 16 }}>
          {domain.cta.label} <ArrowRight size={16} aria-hidden="true" />
        </a>
      </article>
    </div>
  );
}
