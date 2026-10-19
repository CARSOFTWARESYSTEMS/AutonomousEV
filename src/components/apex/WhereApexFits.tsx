import { APEX_RESPONSIBILITIES } from "@/data/apex/system";
import { APEX_SITE } from "@/data/apex/site";
import styles from "./apex.module.css";
import sections from "./sections.module.css";

/** APEX at the centre with the authority it keeps; partners in the dashed ring around it. */
export function WhereApexFits({ headingLevel = 3, onAlt = false }: { headingLevel?: 2 | 3; onAlt?: boolean }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const items = APEX_RESPONSIBILITIES;
  const before = items.slice(0, 4);
  const after = items.slice(4);
  return (
    <div className={onAlt ? sections.sectionAltBg : undefined}>
      <div className={sections.fit} role="group" aria-labelledby="where-apex-fits">
        <span className={sections.fitOuterLabel} aria-hidden="true">
          Specialist ecosystem partners · capabilities
        </span>
        <div className={sections.fitGrid}>
          {before.map((item) => (
            <div key={item.id} className={sections.fitItem}>
              <strong>{item.label}</strong>
              <span className={styles.small}>{item.detail}</span>
            </div>
          ))}
          <div className={sections.fitCore}>
            <span className={styles.eyebrow}>Where APEX fits</span>
            <Heading id="where-apex-fits" className={sections.fitCoreTitle}>
              APEX Rocket Systems
            </Heading>
            <span className={styles.mono} style={{ color: "var(--apex-accent)" }}>
              {APEX_SITE.ownerRole}
            </span>
          </div>
          {after.map((item) => (
            <div key={item.id} className={sections.fitItem}>
              <strong>{item.label}</strong>
              <span className={styles.small}>{item.detail}</span>
            </div>
          ))}
        </div>
        <div className={sections.fitStatement}>
          <p className={styles.lead} style={{ color: "var(--apex-text)" }}>
            Specialist ecosystem partners contribute capabilities. APEX retains system intent and engineering authority.
          </p>
          <p className={styles.small}>Solid amber: what APEX holds. Dashed outer ring: where partners contribute.</p>
        </div>
      </div>
    </div>
  );
}
