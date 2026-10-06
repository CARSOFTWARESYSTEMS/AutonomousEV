import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LINK_EVENTS } from "../analytics";
import { AQIP, DIGITAL_THREAD } from "../data/overview";
import { HERO_CTAS } from "../data/reference";
import InView from "../interactive/InView";
import { Flow } from "../ui/primitives";
import css from "../aqip.module.css";

const THREAD_NODES: readonly (readonly [x: number, y: number, label: string])[] = [
  [60, 330, "REQ"],
  [150, 290, "MFG"],
  [240, 312, "INSP"],
  [330, 270, "MEAS"],
  [410, 300, "EVID"],
  [470, 250, "ACC"],
];
const THREAD_PATH = `M${THREAD_NODES.map(([x, y]) => `${x} ${y}`).join(" L")}`;
const BALLOONS: readonly (readonly [x: number, y: number, tx: number, ty: number, n: number])[] = [
  [330, 70, 268, 96, 7],
  [60, 150, 108, 186, 12],
  [372, 196, 318, 214, 18],
];

/** An abstract engineering drawing with three ballooned characteristics, and the thread that carries them to acceptance. Decoration only. */
function HeroThread() {
  return (
    <svg className={css.heroSvg} viewBox="0 0 520 400" aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="500" height="380" rx="16" className={css.svgFrame} />
      <g className={css.svgSheet}>
        <path d="M90 70 h190 v44 h-64 v70 h120 v48 h-246 z" />
        <circle cx="122" cy="206" r="11" />
        <circle cx="300" cy="206" r="11" />
        <path d="M90 250 h246 M90 242 v16 M336 242 v16" />
      </g>
      {BALLOONS.map(([x, y, tx, ty, n]) => (
        <g key={n} className={css.svgBalloon}>
          <path d={`M${x} ${y} L${tx} ${ty}`} />
          <circle cx={x} cy={y} r="13" />
          <text x={x} y={y + 4} textAnchor="middle">
            {n}
          </text>
        </g>
      ))}
      <path d={THREAD_PATH} className={css.svgThread} />
      <path d={THREAD_PATH} className={css.svgThreadFlow} />
      {THREAD_NODES.map(([x, y, label]) => (
        <g key={label}>
          <circle cx={x} cy={y} r="7" className={css.svgNode} />
          <text x={x} y={y + 25} textAnchor="middle" className={css.svgLabel}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AQIPHero() {
  return (
    <header className={css.hero}>
      <div className={css.heroGrid} aria-hidden="true" />
      <div className={`${css.container} ${css.heroInner}`}>
        <div className={css.heroCopy}>
          <nav className={css.breadcrumb} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/" data-track-event={LINK_EVENTS.cta} data-track-cta="breadcrumb-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/internships" data-track-event={LINK_EVENTS.cta} data-track-cta="breadcrumb-internships">
                  Internships
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
          <Flow steps={DIGITAL_THREAD} label="The digital thread, from engineering requirement to acceptance" direction="wrap" />
          <div className={css.ctaRow}>
            {HERO_CTAS.map((cta) => (
              <a key={cta.id} href={cta.href} className={css.btn} data-kind={cta.kind} data-track-event={LINK_EVENTS.cta} data-track-cta={cta.id}>
                {cta.label}
              </a>
            ))}
          </div>
          <p className={css.trust}>AI interprets • Humans approve • Software proves</p>
          <p className={css.badge}>
            <ShieldCheck size={16} aria-hidden="true" />
            {AQIP.safetyPrinciple}
          </p>
        </div>
        <InView className={css.heroVisual}>
          <HeroThread />
        </InView>
      </div>
    </header>
  );
}
