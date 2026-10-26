// A short process in one line: A → B → C. Static; the page's animated flow
// is the one in its hero.
import css from "../site.module.css";

export default function Chain({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <ol className={css.chain} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
