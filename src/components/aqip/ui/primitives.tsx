// Layout and content primitives shared by every AQIP section. Server-safe: no
// state, no effects.
import type { CSSProperties, ReactNode } from "react";
import { sectionNumber } from "../data/reference";
import { TONE_LABEL, type Tone } from "../types";
import css from "../aqip.module.css";

/** A status label. The wording carries the meaning; the tone only tints it. */
export function Chip({ tone, children }: { tone: Tone; children?: ReactNode }) {
  return (
    <span className={css.chip} data-tone={tone}>
      {children ?? TONE_LABEL[tone]}
    </span>
  );
}

interface GroupProps {
  /** One of the section ids in NAV; its handbook number comes from its chapter. */
  id: string;
  kicker: string;
  title: string;
  lead?: ReactNode;
  /** Stays visible in Executive Mode. */
  executive?: boolean;
  children: ReactNode;
}

/** One section of the manual: an H2 and the blocks under it. */
export function Group({ id, kicker, title, lead, executive, children }: GroupProps) {
  return (
    <section id={id} className={css.group} aria-labelledby={`${id}-title`} data-executive={executive ? "" : undefined} tabIndex={-1}>
      <div className={css.container}>
        <header className={css.groupHead}>
          <p className={css.kicker}>
            <span className={css.kickerNo}>{sectionNumber(id)}</span> {kicker}
          </p>
          <h2 id={`${id}-title`} className={css.h2}>
            {title}
          </h2>
          {lead ? <p className={css.lead}>{lead}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

interface BlockProps {
  id?: string;
  title: string;
  lead?: ReactNode;
  /** A chip beside the heading, e.g. "Planned" or "Illustrative". */
  label?: ReactNode;
  executive?: boolean;
  children: ReactNode;
}

/** A sub-section: an H3 and its content. */
export function Block({ id, title, lead, label, executive, children }: BlockProps) {
  return (
    <div id={id} className={css.block} data-executive={executive ? "" : undefined}>
      <div className={css.blockHead}>
        <h3 className={css.h3}>{title}</h3>
        {label}
      </div>
      {lead ? <p className={css.blockLead}>{lead}</p> : null}
      {children}
    </div>
  );
}

export type FlowStep = string | { label: string; note?: string; tone?: Tone };

interface FlowProps {
  steps: readonly FlowStep[];
  /** What the sequence is, for assistive technology. */
  label: string;
  /** "auto" runs across on wide screens and down on phones; "wrap" stays inline and wraps. */
  direction?: "auto" | "column" | "wrap";
  /** Loops back from the last step to the first. */
  cycle?: boolean;
}

/** An ordered sequence with arrows between the steps. */
export function Flow({ steps, label, direction = "auto", cycle }: FlowProps) {
  return (
    <ol className={css.flow} data-direction={direction} data-cycle={cycle ? "" : undefined} aria-label={label}>
      {steps.map((step, i) => {
        const item = typeof step === "string" ? { label: step } : step;
        return (
          <li key={item.label} className={css.flowStep} style={{ "--i": i } as CSSProperties}>
            <span className={css.flowLabel}>{item.label}</span>
            {item.note ? <span className={css.flowNote}>{item.note}</span> : null}
            {item.tone ? <Chip tone={item.tone} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

interface ListCardProps {
  title: string;
  eyebrow?: ReactNode;
  items?: readonly string[];
  children?: ReactNode;
  /** Numbered rather than bulleted. */
  ordered?: boolean;
  emphasis?: "accent" | "warn";
}

/** A card with an H4 and a list. */
export function ListCard({ title, eyebrow, items, children, ordered, emphasis }: ListCardProps) {
  const List = ordered ? "ol" : "ul";
  return (
    <div className={css.card} data-emphasis={emphasis}>
      {eyebrow ? <p className={css.cardEyebrow}>{eyebrow}</p> : null}
      <h4 className={css.h4}>{title}</h4>
      {children}
      {items ? (
        <List className={ordered ? css.numbered : css.list}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      ) : null}
    </div>
  );
}

/** A statement set apart from the body: a principle, a rule or a quotation. */
export function Callout({ kind = "principle", label, children }: { kind?: "principle" | "safety" | "note"; label?: string; children: ReactNode }) {
  return (
    <div className={css.callout} data-kind={kind}>
      {label ? <p className={css.calloutLabel}>{label}</p> : null}
      <p className={css.calloutText}>{children}</p>
    </div>
  );
}

/** Short labels in a wrapping row. */
export function Tags({ items, label }: { items: readonly string[]; label?: string }) {
  return (
    <ul className={css.tags} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

interface DataTableProps {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}

/**
 * A table on wide screens; one labelled card per row on phones. The ARIA roles
 * are explicit because the phone layout changes the elements' display, which
 * would otherwise drop their table semantics in some browsers.
 */
export function DataTable({ caption, columns, rows }: DataTableProps) {
  return (
    <div className={css.tableWrap}>
      <table className={css.table} role="table">
        <caption className={css.srOnly}>{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th key={column} scope="col" role="columnheader">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row, r) => (
            <tr key={r} role="row">
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" role="rowheader" data-label={columns[c]}>
                    {cell}
                  </th>
                ) : (
                  <td key={c} role="cell" data-label={columns[c]}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A native disclosure. Its content is in the page whether or not it is open. */
export function Disclosure({ summary, children, open }: { summary: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <details className={css.details} open={open}>
      <summary>{summary}</summary>
      <div className={css.detailsBody}>{children}</div>
    </details>
  );
}
