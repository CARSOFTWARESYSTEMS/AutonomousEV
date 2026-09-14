import { ExternalLink, Compass, Radio, Satellite, Waves, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SPACE_SYSTEMS, SPACE_SYSTEM_GROUPS, VERIFIED_ON, type SpaceSystemGroup } from "../applicationsData";
import styles from "../everyday-applications.module.css";

const GROUP_ICONS: Record<SpaceSystemGroup, LucideIcon> = {
  navigation: Compass,
  communication: Radio,
  "earth-observation": Satellite,
  "ocean-weather": Waves,
  institutions: Building2,
};

export default function SpaceSystemsSources() {
  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        Each system below is explained through the question it helps answer. Tap one to see its official source and
        when it was last checked — programme names, capabilities and services can change, so always confirm directly
        with the official source before relying on any detail here.
      </p>
      <p className={styles.formNote} style={{ marginBottom: 24 }}>
        Last verified: <time dateTime={VERIFIED_ON}>{VERIFIED_ON}</time>
      </p>

      {SPACE_SYSTEM_GROUPS.map((group) => {
        const entries = SPACE_SYSTEMS.filter((s) => s.group === group.id);
        if (entries.length === 0) return null;
        const GroupIcon = GROUP_ICONS[group.id];
        return (
          <div key={group.id} style={{ marginBottom: 24 }}>
            <div className={styles.systemGroupHead} style={{ marginBottom: 12 }}>
              <span className={styles.appCardIcon}>
                <GroupIcon size={15} aria-hidden="true" />
              </span>
              <h4 style={{ margin: 0 }}>{group.label}</h4>
            </div>
            {entries.map((s) => (
              <details key={s.id} name="space-systems" className={styles.accordionItem}>
                <summary>{s.question}</summary>
                <div>
                  <p className={styles.componentTag}>{s.name}</p>
                  <p style={{ fontSize: 14 }}>{s.explanation}</p>
                  <a
                    href={s.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--space-blue-text)", fontSize: 13, marginTop: 8, minHeight: 44 }}
                  >
                    {s.officialSourceLabel} <ExternalLink size={13} />
                  </a>
                  <p style={{ fontSize: 12, color: "var(--space-muted)", margin: "8px 0 0" }}>
                    Verified on: <time dateTime={s.verifiedOn}>{s.verifiedOn}</time>
                  </p>
                </div>
              </details>
            ))}
          </div>
        );
      })}

      <div className={styles.card} style={{ padding: 20, marginTop: 8, borderLeft: "3px solid var(--space-amber)" }}>
        <p style={{ margin: 0 }}>
          Information about ISRO, IN-SPACe, MOSDAC, Bhuvan, INCOIS, NDMA and related systems above is presented for
          educational reference. EV Society / EV.ENGINEER does not claim affiliation, endorsement or partnership with
          ISRO, IN-SPACe, the Department of Space, or any other agency named above, unless explicitly documented.
          Official communications and documentation from each agency always take precedence over this page.
        </p>
      </div>
    </div>
  );
}
