import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { APEX_CONCEPT_HOST, APEX_NAV, APEX_OFFICIAL_SITE_URL, APEX_PARENT_PORTAL, APEX_SITE, apexHref } from "@/data/apex/site";
import { ApexLogo } from "./ApexLogo";
import { ProtectedEmail } from "./ProtectedEmail";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import chrome from "./chrome.module.css";

export function ApexFooter() {
  return (
    <footer className={`${chrome.footer} ${styles.forceDark}`}>
      <div className={styles.container}>
        <div className={chrome.footerGrid}>
          <div className={chrome.footerBrand}>
            <ApexLogo className={chrome.footerLogo} sizes="(min-width: 900px) 326px, 277px" />
            <p className={styles.body} style={{ maxWidth: "44ch" }}>
              {APEX_SITE.ownerRole}. Developing liquid-propulsion capability as a foundation for progressively integrated rocket systems.
            </p>
            <p className={styles.mono} style={{ color: "var(--apex-text-3)" }}>{APEX_SITE.conceptStatus}</p>
          </div>

          <nav aria-label="APEX Rocket Systems — footer">
            <h2 className={chrome.footerHeading}>Explore</h2>
            <ul className={chrome.footerLinks}>
              {APEX_NAV.map((item) => (
                <li key={item.id}>
                  <Link href={apexHref(item.path)} {...apexTrack("apex_nav_click", { item: item.id, placement: "footer" })}>
                    {item.id === "home" ? "APEX overview" : item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={chrome.footerHeading}>Contact</h2>
            <ul className={chrome.footerLinks}>
              <li>
                <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "footer" })}>
                  Official APEX website <ArrowUpRight size={15} aria-hidden="true" />
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <Link href={apexHref("/company#contact")} {...apexTrack("apex_collaboration_click", { placement: "footer" })}>
                  Discuss collaboration
                </Link>
              </li>
              <li>
                <ProtectedEmail placement="footer" />
              </li>
              {APEX_PARENT_PORTAL && (
                <li>
                  <Link href={APEX_PARENT_PORTAL.href} {...apexTrack("apex_nav_click", { item: "parent_portal", placement: "footer" })}>
                    Back to {APEX_PARENT_PORTAL.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className={chrome.footerBase}>
          <p>
            {APEX_SITE.disclosure} Prepared and hosted by{" "}
            <a href={APEX_CONCEPT_HOST.url} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_partner_site_click", { partner_id: "gamyaa", placement: "footer" })}>
              {APEX_CONCEPT_HOST.name}
            </a>
            . Partners shown are proposed; no formal agreement is implied. For APEX&rsquo;s official information, visit{" "}
            <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "footer_disclosure" })}>
              apexrocketsystems.com
            </a>
            .
          </p>
          <p>The APEX Rocket Systems name, logo and photographs belong to APEX Rocket Systems.</p>
        </div>
      </div>
    </footer>
  );
}
