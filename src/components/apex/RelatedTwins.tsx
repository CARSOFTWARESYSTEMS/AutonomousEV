import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { APEX_PARENT_PORTAL } from "@/data/apex/site";
import { GAMYAA_TWIN_EXPERIENCES, GAMYAA_TWIN_HOST } from "@/data/apex/validation";
import { SectionHead } from "./SectionHead";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import validation from "./validation.module.css";

/** Line drawings of a thrust chamber: the engine alone, then the engine over a strip of predicted and measured traces. */
function TwinArt({ advanced }: { advanced: boolean }) {
  return (
    <svg className={validation.twinArt} viewBox="0 0 320 146" aria-hidden="true" focusable="false">
      <g className={validation.twinEngine}>
        <path d="M18 50 H44 M18 70 H44" />
        <path d="M44 38 V82" />
        <path d="M44 38 H134 C148 38 154 52 166 52 C204 52 250 30 296 16" />
        <path d="M44 82 H134 C148 82 154 68 166 68 C204 68 250 90 296 104" />
        <path d="M296 16 V104" strokeDasharray="3 4" />
      </g>
      <g className={validation.twinNodes}>
        <circle cx="18" cy="50" r="3" />
        <circle cx="18" cy="70" r="3" />
        <circle cx="90" cy="38" r="3" />
        <circle cx="166" cy="52" r="3" />
      </g>
      {advanced && (
        <g className={validation.twinTraces}>
          <path d="M18 142 H312" data-axis="" />
          <path d="M18 140 C 70 140, 92 124, 140 122 S 236 120, 312 119" />
          <path d="M18 141 C 74 142, 96 128, 144 125 C 180 122, 196 113, 222 117 S 280 122, 312 120" data-measured="" />
        </g>
      )}
    </svg>
  );
}

/**
 * Explore Related Gamyaa AeroSystems Digital Engineering: the two Digital Twin
 * experiences, after the APEX twin story and before the page's close. The
 * clarification keeps them from reading as an APEX production twin.
 */
export function RelatedTwins() {
  const sameHost = APEX_PARENT_PORTAL !== null;
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="related-title" id="related">
      <div className={styles.container}>
        <SectionHead
          eyebrow="Gamyaa AeroSystems · Digital engineering"
          id="related-title"
          title="Explore Related Gamyaa AeroSystems Digital Engineering"
          lead="Gamyaa AeroSystems is developing interactive Digital Twin experiences to support propulsion-system understanding, simulation, engineering analysis, and model-to-test correlation. These related experiences complement the APEX engineering collaboration concept."
          small
        />
        <p className={validation.twinNote}>
          <strong>Related Gamyaa AeroSystems capability</strong> — not represented as an operational APEX production Digital Twin unless explicitly confirmed by
          APEX.
        </p>
        <ul className={validation.twins}>
          {GAMYAA_TWIN_EXPERIENCES.map((item, index) => {
            const track = apexTrack("apex_cta_click", { cta: item.id, placement: "related_gamyaa_twins" });
            return (
              <li key={item.id} className={validation.twin}>
                <div className={validation.twinTop}>
                  <span className={validation.twinIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span>Digital Twin experience</span>
                </div>
                <TwinArt advanced={index === 1} />
                <h3 className={validation.twinTitle}>{item.title}</h3>
                <p className={validation.twinBody}>{item.description}</p>
                {sameHost ? (
                  <Link href={item.path} className={validation.twinCta} {...track}>
                    {item.cta} <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <a href={`${GAMYAA_TWIN_HOST}${item.path}`} target="_blank" rel="noopener noreferrer" className={validation.twinCta} {...track}>
                    {item.cta} <ArrowUpRight size={18} aria-hidden="true" />
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
