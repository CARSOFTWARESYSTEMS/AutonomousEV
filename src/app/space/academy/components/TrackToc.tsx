import styles from "../academy.module.css";

/** The track page's parts as a sticky row of links. Each part holds both levels, so the links do not depend on the level. */
export default function TrackToc({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav className={styles.partNav} aria-label="On this page">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
