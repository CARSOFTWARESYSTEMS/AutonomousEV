import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { LINK_EVENTS } from "../analytics";
import { AQIP, HERO_BADGES, HERO_THREAD } from "../data/overview";
import { HERO_CTAS, HERO_LINK } from "../data/reference";
import InView from "../interactive/InView";
import css from "../aqip.module.css";

const CHAIN: readonly (readonly [x: number, label: string])[] = [
  [56, "REQ"],
  [152, "MFG"],
  [248, "INSP"],
  [344, "MEAS"],
  [440, "EVID"],
  [536, "ACCEPT"],
];
const CHAIN_Y = 404;
const CHAIN_PATH = `M${CHAIN[0][0]} ${CHAIN_Y} H${CHAIN[CHAIN.length - 1][0]}`;

/** A ballooned characteristic: where the balloon sits, and the feature it points at. */
const BALLOONS: readonly (readonly [n: number, x: number, y: number, tx: number, ty: number])[] = [
  [7, 318, 84, 262, 118],
  [12, 60, 262, 104, 232],
  [18, 356, 300, 312, 262],
  [23, 208, 62, 208, 110],
];

/**
 * "Requirement to evidence" as one drawing: a ballooned bracket on a drawing
 * sheet, the characteristic record read from it, and the chain that carries it
 * to acceptance, with a signal travelling along it. Decoration only: the same
 * thread is stated in text beside it. The fine labels are dropped on phones.
 */
function RequirementToEvidence() {
  return (
    <svg className={css.heroSvg} viewBox="0 0 592 452" aria-hidden="true" focusable="false">
      {/* Drawing sheet with its border and title block. */}
      <rect x="8" y="8" width="576" height="350" rx="14" className={css.svgFrame} />
      <rect x="24" y="24" width="544" height="318" rx="4" className={css.svgBorder} />
      <g className={css.svgFine}>
        <path d="M396 290 H568 M396 316 H568 M482 290 V342 M396 290 V342" className={css.svgRule} />
        <text x="404" y="308" className={css.svgNote}>
          PART AQ-1042
        </text>
        <text x="490" y="308" className={css.svgNote}>
          REV C
        </text>
        <text x="404" y="334" className={css.svgNote}>
          SYNTHETIC
        </text>
        <text x="490" y="334" className={css.svgNote}>
          SHEET 1/1
        </text>
      </g>

      {/* The bracket: outline, bores, centre lines and two dimensions. */}
      <g className={css.svgPart}>
        <path d="M96 118 H288 a10 10 0 0 1 10 10 V168 H232 V228 H334 a10 10 0 0 1 10 10 V282 H96 a10 10 0 0 1 -10 -10 V128 a10 10 0 0 1 10 -10 Z" />
        <circle cx="130" cy="240" r="16" />
        <circle cx="300" cy="254" r="12" />
        <circle cx="134" cy="150" r="9" />
      </g>
      <g className={css.svgCentre}>
        <path d="M106 240 H154 M130 216 V264 M282 254 H318 M300 236 V272 M120 150 H148 M134 136 V164" />
      </g>
      <g className={css.svgDimension}>
        <path d="M86 306 H344 M86 298 V314 M344 298 V314" />
        <path d="M368 118 V282 M360 118 H376 M360 282 H376" />
      </g>
      <g className={css.svgFine}>
        <text x="215" y="324" textAnchor="middle" className={css.svgNote}>
          258.00 ±0.10
        </text>
        <text x="130" y="206" textAnchor="middle" className={css.svgNote}>
          Ø10.00 ±0.05
        </text>
      </g>

      {/* Measurement points on the bore that balloon 12 calls out. */}
      <g className={css.svgProbe}>
        <circle cx="130" cy="224" r="3" />
        <circle cx="146" cy="240" r="3" />
        <circle cx="130" cy="256" r="3" />
        <circle cx="114" cy="240" r="3" />
      </g>

      {BALLOONS.map(([n, x, y, tx, ty]) => (
        <g key={n} className={css.svgBalloon} data-active={n === 12 ? "" : undefined}>
          <path d={`M${x} ${y} L${tx} ${ty}`} />
          <circle cx={x} cy={y} r="14" />
          <text x={x} y={y + 4} textAnchor="middle">
            {n}
          </text>
        </g>
      ))}

      {/* The record read from balloon 12. */}
      <g className={css.svgRecord}>
        <rect x="396" y="44" width="156" height="118" rx="10" />
        <text x="410" y="68" className={css.svgRecordTitle}>
          BALLOON 12
        </text>
        <text x="410" y="92" className={css.svgRecordValue}>
          Ø10.00 ±0.05
        </text>
        <g className={css.svgFine}>
          <text x="410" y="116" className={css.svgNote}>
            MEASURED 10.02
          </text>
          <text x="410" y="136" className={css.svgNote}>
            VERIFIED BY A PERSON
          </text>
        </g>
        <path d="M518 62 l6 6 l12 -14" className={css.svgTick} />
      </g>
      <path d="M130 240 C 240 190, 300 110, 396 96" className={css.svgLink} />

      {/* The chain from requirement to acceptance, and the signal moving along it. */}
      <path d={CHAIN_PATH} className={css.svgThread} />
      <path d={CHAIN_PATH} className={css.svgThreadFlow} />
      {CHAIN.map(([x, label]) => (
        <g key={label}>
          <circle cx={x} cy={CHAIN_Y} r="9" className={css.svgNode} />
          <text x={x} y={CHAIN_Y + 30} textAnchor="middle" className={css.svgLabel}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AQIPHero() {
  return (
    <header id="top" className={css.hero}>
      <div className={css.heroGrid} aria-hidden="true" />
      <div className={css.heroInner}>
        <div className={css.heroCopy}>
          <nav className={css.breadcrumb} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/internships" data-track-event={LINK_EVENTS.cta} data-track-cta="breadcrumb-internships">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/internships#space-aerospace-engineering" data-track-event={LINK_EVENTS.cta} data-track-cta="breadcrumb-space-aerospace">
                  Space &amp; Aerospace
                </Link>
              </li>
              <li aria-current="page">{AQIP.short}</li>
            </ol>
          </nav>
          <p className={css.eyebrow}>{AQIP.eyebrow}</p>
          <h1 className={css.h1}>
            <span className={css.h1Short}>{AQIP.short}</span> <span className={css.h1Name}>{AQIP.name}</span>
          </h1>
          <p className={css.tagline}>{AQIP.tagline}</p>
          <p className={css.narrative}>{AQIP.narrative}</p>
          <ol className={css.thread} aria-label="The digital thread, from engineering requirement to acceptance">
            {HERO_THREAD.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className={css.ctaRow}>
            {HERO_CTAS.map((cta) => (
              <a key={cta.id} href={cta.href} className={css.btn} data-kind={cta.kind} data-track-event={LINK_EVENTS.cta} data-track-cta={cta.id}>
                {cta.label}
              </a>
            ))}
          </div>
          <a href={HERO_LINK.href} className={css.heroLink} data-track-event={LINK_EVENTS.cta} data-track-cta={HERO_LINK.id}>
            {HERO_LINK.label}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <InView className={css.heroVisual}>
          <RequirementToEvidence />
        </InView>

        <div className={css.heroTrust}>
          <p className={css.trust}>AI interprets • Humans approve • Software proves</p>
          <ul className={css.heroBadges} aria-label="How AQIP works">
            {HERO_BADGES.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>
          <p className={css.badge}>
            <ShieldCheck size={16} aria-hidden="true" />
            {AQIP.safetyPrinciple}
          </p>
        </div>
      </div>
    </header>
  );
}
