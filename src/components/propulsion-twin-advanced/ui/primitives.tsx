// Small building blocks shared by every module. No hooks: they render on the
// server, so everything they say is in the page's HTML.
import type { ReactNode } from "react";
import type { Concept, ModelStatus, Provenance } from "../types";
import css from "../advancedTwin.module.css";

/** Marks where a value, a model or a statement comes from. */
export function Tag({ children }: { children: Provenance | ModelStatus | string }) {
  return <span className={css.tag}>{children}</span>;
}

/** A sub-section of a module, with its heading. */
export function Block({ id, title, lens, intro, children, tag }: { id?: string; title: string; lens?: string; intro?: ReactNode; children: ReactNode; tag?: string }) {
  return (
    <section id={id} className={css.block} data-lens={lens} aria-label={title}>
      <h3 className={css.h3}>
        {title}
        {tag && <Tag>{tag}</Tag>}
      </h3>
      {intro && <p className={css.lead}>{intro}</p>}
      {children}
    </section>
  );
}

/** A sequence of stages, drawn as a chain that wraps. `vertical` stacks it with arrows between. */
export function Chain({ items, label, vertical, numbered }: { items: readonly string[]; label: string; vertical?: boolean; numbered?: boolean }) {
  return (
    <ol className={css.chain} aria-label={label} data-vertical={vertical || undefined} data-numbered={numbered || undefined}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

const LAYERS = [
  { key: "simple", label: "In plain words", lens: "learn engineer architect" },
  { key: "engineering", label: "Engineering", lens: "engineer" },
  { key: "math", label: "The relation", lens: "engineer" },
  { key: "twin", label: "In the Digital Twin", lens: "engineer architect" },
  { key: "failure", label: "Failure use case", lens: "learn engineer architect" },
] as const;

/**
 * One concept at five depths. All five are in the document; the reading depth
 * chosen in the navigation decides which are showing.
 */
export function ConceptCard({ concept, children }: { concept: Concept; children?: ReactNode }) {
  return (
    <article className={css.concept} aria-labelledby={`concept-${concept.id}`}>
      <h4 id={`concept-${concept.id}`} className={css.conceptTitle}>
        {concept.title}
      </h4>
      <p className={css.definition}>{concept.definition}</p>
      <dl className={css.layers}>
        {LAYERS.map((layer) => (
          <div key={layer.key} className={css.layer} data-lens={layer.lens} data-layer={layer.key}>
            <dt>{layer.label}</dt>
            {layer.key === "math" ? (
              <dd>
                <code className={css.equation}>{concept.math.equation}</code>
                <span className={css.where}>{concept.math.where}</span>
              </dd>
            ) : (
              <dd>{concept[layer.key]}</dd>
            )}
          </div>
        ))}
      </dl>
      {children}
    </article>
  );
}

/** Terms and their explanations, as cards. */
export function Terms({ items, columns = 2 }: { items: readonly { id?: string; term: string; text: ReactNode; extra?: ReactNode }[]; columns?: 2 | 3 | 4 }) {
  return (
    <dl className={css.terms} data-columns={columns}>
      {items.map((item) => (
        <div key={item.id ?? item.term} className={css.term}>
          <dt>{item.term}</dt>
          <dd>
            {item.text}
            {item.extra}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A pair of label and value rows. */
export function Rows({ rows }: { rows: readonly { label: string; value: ReactNode }[] }) {
  return (
    <dl className={css.rows}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A statement the page wants read: the principle, a rule, a boundary. */
export function Callout({ children, kind = "rule" }: { children: ReactNode; kind?: "rule" | "caution" }) {
  return (
    <p className={css.callout} data-kind={kind}>
      {children}
    </p>
  );
}
