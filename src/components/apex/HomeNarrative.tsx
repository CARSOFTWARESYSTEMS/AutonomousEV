import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { apexImage } from "@/data/apex/images";
import { APEX_OFFICIAL_PAGES, APEX_OFFICIAL_SITE_URL, APEX_SITE, apexHref } from "@/data/apex/site";
import { ApexPicture } from "./ApexPicture";
import { InView } from "./InView";
import { UnitText } from "./UnitText";
import { apexTrack } from "./analytics";
import styles from "./apex.module.css";
import home from "./home.module.css";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** 01 — The hardware fills the frame; the words sit in its lower left. */
export function HomeHero() {
  const desktop = apexImage("06");
  const mobile = apexImage("07");
  return (
    <section className={`${home.hero} ${styles.forceDark}`} aria-labelledby="apex-hero-title">
      <div className={home.heroMedia}>
        <ApexPicture image={desktop} mobile={mobile} sizes="100vw" cover priority alt={desktop.alt} />
        <div className={home.heroShade} aria-hidden="true" />
      </div>
      <div className={`${styles.container} ${home.heroContent}`}>
        <div className={home.heroCopy}>
          <p className={home.heroKicker} style={i(0)}>
            APEX Rocket Systems
          </p>
          <h1 id="apex-hero-title" className={styles.display} style={i(1)}>
            Engineered to <span className={styles.amber}>ascend.</span>
          </h1>
          <p className={home.heroLine} style={i(2)}>
            {APEX_SITE.supportingLine}
          </p>
          <div className={styles.actions} style={i(3)}>
            <a href="#built" className={`${styles.btn} ${styles.btnPrimary}`} {...apexTrack("apex_cta_click", { cta: "explore_apex", placement: "hero" })}>
              Explore APEX <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              href={APEX_OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary}`}
              {...apexTrack("apex_official_site_click", { placement: "hero" })}
            >
              Official website <ArrowUpRight size={16} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </div>
          <p className={home.heroCollab} style={i(4)}>
            <span className={home.heroCollabTitle}>{APEX_SITE.collaboration.title}</span>
            <span className={home.heroCollabLine}>{APEX_SITE.collaboration.line}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/** 02 — Built at APEX: one image, the three published facts, the status. */
export function HomeBuilt() {
  return (
    <section className={styles.section} aria-labelledby="built-title" id="built">
      <div className={home.wide}>
        <div className={home.built}>
          <div className={styles.frame}>
            <div className={home.builtMedia}>
              <ApexPicture image={apexImage("05")} sizes="(min-width: 960px) 52vw, 100vw" cover />
            </div>
          </div>
          <div className={home.builtCopy}>
            <p className={styles.eyebrow}>Built at APEX</p>
            <h2 id="built-title" className={home.builtTitle}>
              <UnitText>5 kN-Class</UnitText>
              <span className={home.builtSub}>Liquid Engine Demonstrator</span>
            </h2>
            <ul className={home.facts}>
              <li>
                <UnitText>5 kN class</UnitText>
              </li>
              <li>Gas-generator cycle</li>
              <li>Liquid propulsion</li>
            </ul>
            <p className={home.status}>Hardware built</p>
            <div className={home.builtFoot}>
              <Link href={apexHref("/engine")} className={home.more} {...apexTrack("apex_cta_click", { cta: "explore_engine", placement: "home_built" })}>
                Explore the engine <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <p className={home.source}>
                Source:{" "}
                <a href={APEX_OFFICIAL_PAGES.home} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "home_built_source" })}>
                  apexrocketsystems.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const EDITORIAL = ["03", "09", "02", "04", "01"];

/** 03 — The hardware is real: one dominant photograph, two beside it; a swipe on phones. */
export function HomeHardware() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="hardware-title" id="hardware">
      <div className={styles.container}>
        <div className={home.headline}>
          <p className={styles.eyebrow}>Real hardware</p>
          <h2 id="hardware-title" className={styles.h2}>
            The hardware is real.
          </h2>
        </div>
      </div>
      <div className={home.wide} style={{ paddingInline: 0 }}>
        <div className={home.editorial} role="list" aria-label="APEX hardware photographs">
          {EDITORIAL.map((id, index) => {
            const image = apexImage(id);
            return (
              <figure key={id} className={home.shot} role="listitem" data-extra={index > 2 ? "" : undefined}>
                <ApexPicture image={image} sizes={index === 0 ? "(min-width: 900px) 58vw, 82vw" : "(min-width: 900px) 40vw, 82vw"} cover />
              </figure>
            );
          })}
        </div>
      </div>
      <div className={styles.container}>
        <div className={home.editorialFoot}>
          <p className={home.caption}>APEX propulsion development hardware</p>
          <span className={home.swipeHint} aria-hidden="true">
            Swipe →
          </span>
          <Link href={apexHref("/engine#record")} className={home.more} {...apexTrack("apex_cta_click", { cta: "view_hardware", placement: "home_hardware" })}>
            View hardware <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 05 — Build it. Model it. Test it. Correlate it. The physical and the digital, side by side. */
export function HomeValidation({ headingLevel = 2, showLink = true }: { headingLevel?: 2 | 3; showLink?: boolean }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="validation-title" id="validation">
      <div className={styles.container}>
        <div className={home.headline}>
          <p className={styles.eyebrow}>Physical ↔ digital</p>
          <Heading id="validation-title" className={home.signature}>
            <span>Build it.</span>
            <span>Model it.</span>
            <span>Test it.</span>
            <span>Correlate it.</span>
          </Heading>
        </div>
        <InView threshold={0.35}>
          <div className={home.pd}>
            <div className={home.side}>
              <p className={home.sideLabel}>Physical</p>
              <div className={home.sideMedia}>
                <ApexPicture image={apexImage("01")} sizes="(min-width: 1024px) 40vw, 100vw" cover />
              </div>
              <p className={home.process}>
                Build <span aria-hidden="true">→</span> Instrument <span aria-hidden="true">→</span> Test <span aria-hidden="true">→</span> Measure
              </p>
            </div>
            <div className={home.correlation}>
              <span className={home.correlationMark} aria-hidden="true">
                ↔
              </span>
              <p className={home.correlationTitle}>Engineering correlation</p>
            </div>
            <div className={home.side}>
              <p className={home.sideLabel}>Digital</p>
              <div className={home.digitalCanvas} role="img" aria-label="Illustration: an engineering model and its predicted response beside a measured response.">
                <svg viewBox="0 0 400 300" aria-hidden="true">
                  <g className={home.mesh}>
                    <ellipse cx="200" cy="70" rx="86" ry="16" />
                    <ellipse cx="200" cy="110" rx="86" ry="16" />
                    <ellipse cx="200" cy="150" rx="86" ry="16" />
                    <path d="M114 70 V150 M286 70 V150 M157 84 V164 M243 84 V164 M200 86 V166" />
                  </g>
                  <path className={`${home.trace} ${home.traceModel}`} d="M24 268 C 90 268, 112 214, 160 204 S 278 194, 376 192" />
                  <path className={`${home.trace} ${home.traceTest}`} d="M24 270 C 96 272, 120 222, 168 212 C 208 202, 222 186, 250 190 S 320 198, 376 195" />
                </svg>
                <span className={home.canvasNote}>Illustrative</span>
              </div>
              <p className={home.process}>
                Model <span aria-hidden="true">→</span> Predict <span aria-hidden="true">→</span> Compare <span aria-hidden="true">→</span> Update
              </p>
            </div>
          </div>
        </InView>
        <div className={home.authority}>
          <p className={styles.lead} style={{ color: "var(--apex-text)", maxWidth: 640 }}>
            Physical evidence builds confidence. Digital models help engineers learn more from every test.
          </p>
          {showLink && (
            <Link href={apexHref("/digital-twin")} className={home.more} {...apexTrack("apex_cta_click", { cta: "digital_validation", placement: "home_validation" })}>
              Explore digital validation <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** 07 — From hardware to system confidence. */
export function HomeFinal() {
  return (
    <section className={`${styles.section} ${home.final} ${styles.forceDark}`} aria-labelledby="final-title" id="collaborate">
      <div className={home.finalMedia}>
        <ApexPicture image={apexImage("04")} sizes="100vw" cover />
        <div className={home.finalShade} aria-hidden="true" />
      </div>
      <div className={`${styles.container} ${home.finalContent}`}>
        <p className={home.heroKicker}>APEX Rocket Systems</p>
        <h2 id="final-title" className={home.finalTitle}>
          <span>From hardware</span>
          <span>to system confidence.</span>
        </h2>
        <p className={styles.lead} style={{ color: "var(--apex-silver)" }}>
          Building a credible path from propulsion hardware toward integrated rocket systems through disciplined engineering, specialist partnerships and physical
          evidence.
        </p>
        <div className={styles.actions}>
          <Link href={apexHref("/company#contact")} className={`${styles.btn} ${styles.btnPrimary}`} {...apexTrack("apex_collaboration_click", { placement: "home_final" })}>
            Discuss collaboration <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href={APEX_OFFICIAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnSecondary}`}
            {...apexTrack("apex_official_site_click", { placement: "home_final" })}
          >
            Official APEX website <ArrowUpRight size={16} aria-hidden="true" />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
