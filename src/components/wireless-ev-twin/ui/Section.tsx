"use client";
// The section kit: a calm hero header with the section's key figures, cards
// that open and close with an animated height (a few facts shown, the rest on
// request), lists that show their first items with "Show all", and one
// Expand all / Collapse all control per section. Nothing here changes what
// a section computes; it only decides how much is on screen.
import { createContext, type ReactNode, useCallback, useContext, useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import s from "./section.module.css";

interface ExpandSignal {
  /** Bumped on every Expand all / Collapse all. */
  version: number;
  open: boolean;
  set: (open: boolean) => void;
}
const ExpandContext = createContext<ExpandSignal | null>(null);

/** Gives a section one Expand all / Collapse all signal for its cards and lists. */
export function ExpandScope({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ version: 0, open: false });
  const set = useCallback((open: boolean) => setState((p) => ({ version: p.version + 1, open })), []);
  const value = useMemo(() => ({ ...state, set }), [state, set]);
  return <ExpandContext.Provider value={value}>{children}</ExpandContext.Provider>;
}

/** Follows the section's Expand all / Collapse all, and otherwise keeps its own state. */
function useExpand(defaultOpen: boolean): [boolean, (v: boolean) => void] {
  const scope = useContext(ExpandContext);
  const [state, setState] = useState({ open: defaultOpen, seen: scope?.version ?? 0 });
  // A new Expand all / Collapse all signal overrides the card's own state (React's "adjust state on a change" pattern).
  if (scope && scope.version !== state.seen) setState({ open: scope.open, seen: scope.version });
  return [state.open, (v: boolean) => setState((p) => ({ ...p, open: v }))];
}

export function ExpandAll() {
  const scope = useContext(ExpandContext);
  if (!scope) return null;
  return (
    <div className={s.expandAll} role="group" aria-label="Detail">
      <button type="button" onClick={() => scope.set(true)}>
        Expand all
      </button>
      <span aria-hidden="true" />
      <button type="button" onClick={() => scope.set(false)}>
        Collapse all
      </button>
    </div>
  );
}

export interface Stat {
  value: string;
  label: string;
}

/** The section's opening: eyebrow, a short title, one or two lines of lede, its key figures, and Expand all. */
export function SectionHero({ eyebrow, title, lede, stats, expandable = true, children }: { eyebrow: string; title: string; lede?: string; stats?: Stat[]; expandable?: boolean; children?: ReactNode }) {
  return (
    <header className={s.hero}>
      <div className={s.heroText}>
        <p className={s.eyebrow}>{eyebrow}</p>
        <h2 className={s.title}>{title}</h2>
        {lede && <p className={s.lede}>{lede}</p>}
        {children}
      </div>
      <div className={s.heroSide}>
        {stats && stats.length > 0 && (
          <dl className={s.stats}>
            {stats.map((st) => (
              <div key={st.label}>
                <dd>{st.value}</dd>
                <dt>{st.label}</dt>
              </div>
            ))}
          </dl>
        )}
        {expandable && <ExpandAll />}
      </div>
    </header>
  );
}

/**
 * A card that shows its title, a one-line summary and a key figure; the
 * details open below it with an animated height. Closed details are inert
 * (not focusable, not read), and render only once first opened.
 */
export function Disclosure({ title, summary, meta, icon, defaultOpen = false, tone, children }: { title: ReactNode; summary?: ReactNode; meta?: ReactNode; icon?: ReactNode; defaultOpen?: boolean; tone?: "accent" | "warning"; children: ReactNode }) {
  const [open, setOpen] = useExpand(defaultOpen);
  const [mounted, setMounted] = useState(defaultOpen);
  const id = useId();
  // Details render the first time they are opened, and stay rendered (so closing animates).
  if (open && !mounted) setMounted(true);
  return (
    <section className={s.card} data-open={open || undefined} data-tone={tone}>
      <button type="button" className={s.cardHead} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {icon && <span className={s.cardIcon}>{icon}</span>}
        <span className={s.cardTitles}>
          <span className={s.cardTitle}>{title}</span>
          {summary && <span className={s.cardSummary}>{summary}</span>}
        </span>
        {meta && <span className={s.cardMeta}>{meta}</span>}
        <ChevronDown size={18} className={s.chevron} aria-hidden="true" />
      </button>
      <div className={s.cardBody} id={id} inert={!open} aria-hidden={!open}>
        <div className={s.cardInner}>{(open || mounted) && <div className={s.cardContent}>{children}</div>}</div>
      </div>
    </section>
  );
}

/** Shows the first `initial` items, then "Show all N" (and "Show fewer"). Follows Expand all. */
export function ShowMore<T>({ items, initial, render, noun = "items", className }: { items: readonly T[]; initial: number; render: (item: T, index: number) => ReactNode; noun?: string; className?: string }) {
  const [all, setAll] = useExpand(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <>
      <div className={className}>{shown.map(render)}</div>
      {items.length > initial && (
        <button type="button" className={s.more} aria-expanded={all} onClick={() => setAll(!all)}>
          <span>{all ? "Show fewer" : `Show all ${items.length} ${noun}`}</span>
          <ChevronDown size={15} aria-hidden="true" className={s.moreChevron} data-up={all || undefined} />
        </button>
      )}
    </>
  );
}

/** A quiet sub-heading inside a section. */
export function Kicker({ children }: { children: ReactNode }) {
  return <p className={s.kicker}>{children}</p>;
}
