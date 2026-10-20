import { APEX_CONCEPT_HOST, APEX_OFFICIAL_SITE_URL, APEX_SITE } from "@/data/apex/site";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";

/**
 * The APEX Rocket Systems – Gamyaa AeroSystems collaboration statement, in its
 * approved words, with a link to each organisation. Shown in the footer and on
 * the Company page; the homepage carries only the short form.
 */
export function CollaborationStatement({ placement, className }: { placement: string; className?: string }) {
  return (
    <div className={className}>
      {APEX_SITE.collaborationStatement.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <p>
        For APEX&rsquo;s official company information, visit{" "}
        <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement })}>
          www.apexrocketsystems.com
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
        . For {APEX_CONCEPT_HOST.name}, visit{" "}
        <a href={APEX_CONCEPT_HOST.url} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_partner_site_click", { partner_id: "gamyaa", placement })}>
          www.gamyaa.in
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
        .
      </p>
    </div>
  );
}
