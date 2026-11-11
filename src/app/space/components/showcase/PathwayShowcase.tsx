// "One mission. A lifelong pathway.": the four audience pathways as
// full-width rows, visual left and content right, in the tutorial showcase's
// own layout. Each row keeps its stage, title, every item (the first three
// shown, all of them under "About this pathway"), its call to action, its
// destination, its analytics attributes and its note.
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { EOI_FORM_URL } from "@/lib/eoi";
import { pathwayStages, type PathwayCta } from "../../spaceData";
import ShowcaseVisual from "./ShowcaseVisual";
import StillVisual from "./StillVisual";
import { CubeSatPoster, ResearchStill, VenturePoster } from "./posters";
import DiscoverHero from "./discover/DiscoverHero";
import styles from "./showcase.module.css";

/** Pathway hues and their text tints (AA on navy). */
const ACCENT: Record<string, { color: string; tint: string }> = {
  discover: { color: "#8B5CF6", tint: "#C4B5FD" },
  engineer: { color: "#3B82F6", tint: "#93C5FD" },
  research: { color: "#06B6D4", tint: "#67E8F9" },
  venture: { color: "#F59E0B", tint: "#FCD34D" },
};

const VISUAL: Record<string, React.ReactNode> = {
  discover: <DiscoverHero />,
  engineer: (
    <ShowcaseVisual
      topic="engineer"
      name="CubeSat architecture"
      label="A CubeSat taken apart over an engineering grid: frame, camera, battery, power board, flight computer, radio, attitude control and antenna, with the power board, computer and radio highlighted."
      caption="The architecture, opened up: power, computing and communications highlighted, the subsystems a mission team integrates."
      poster={<CubeSatPoster />}
    />
  ),
  research: (
    <StillVisual
      label="A method drawing: measured telemetry drifting away from a model's prediction, the residual between them crossing a threshold, and the validation stages from simulation to flight-representative testing."
      caption="The research method, drawn: telemetry against a model, a residual crossing its threshold, and the validation stages ahead. No measured data; the platform is planned."
    >
      <ResearchStill />
    </StillVisual>
  ),
  venture: (
    <ShowcaseVisual
      topic="venture"
      name="prototype to product"
      label="One small satellite at three stages of integration, left to right: a frame with a single board, a frame with its full stack of boards, and the finished satellite with its panels and antenna."
      caption="From first board to integrated stack to finished satellite: the path from prototype to product. An illustration, not a specific product."
      poster={<VenturePoster />}
    />
  ),
};

function PathwayCtaLink({ cta, stage }: { cta: PathwayCta; stage: string }) {
  const track = {
    "data-track-event": "space_pathway_cta_click",
    "data-track-pathway": stage.toLowerCase(),
    "data-track-destination": cta.track,
  };
  const content = (
    <>
      <span>{cta.label}</span>
      {cta.kind === "eoi" ? <ExternalLink size={18} aria-hidden /> : <ArrowRight size={18} aria-hidden />}
    </>
  );
  if (cta.kind === "eoi") {
    return (
      <a href={EOI_FORM_URL} target="_blank" rel="noopener noreferrer" aria-label={`${cta.label} (opens the iTelematics contact page in a new tab)`} className={styles.cta} {...track}>
        {content}
      </a>
    );
  }
  if (cta.kind === "route") {
    return (
      <Link href={cta.href as string} className={styles.cta} {...track}>
        {content}
      </Link>
    );
  }
  return (
    <a href={cta.href} className={styles.cta} {...track}>
      {content}
    </a>
  );
}

export default function PathwayShowcase() {
  return (
    <ol className={styles.showcase}>
      {pathwayStages.map((stage, i) => {
        const accent = ACCENT[stage.key];
        return (
          <li key={stage.key} className={styles.row} style={{ ["--accent" as string]: accent.color, ["--accent-text" as string]: accent.tint }}>
            <article className={styles.card} data-pathway={stage.key} aria-labelledby={`pathway-${stage.key}`}>
              {VISUAL[stage.key]}
              <div className={styles.content}>
                <span className={styles.label}>
                  {String(i + 1).padStart(2, "0")} · {stage.stage}
                </span>
                <h3 id={`pathway-${stage.key}`} className={styles.title}>
                  {stage.title}
                </h3>
                <p className={styles.lead}>{stage.summary}</p>
                <ul className={styles.themes} aria-label="Key themes">
                  {stage.items.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <details className={styles.about}>
                  <summary data-track-event="space_panel_toggle" data-track-panel={`pathway_${stage.key}`}>
                    About this pathway
                  </summary>
                  <ul className={styles.aboutList}>
                    {stage.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
                <div className={styles.actions}>
                  <PathwayCtaLink cta={stage.cta} stage={stage.stage} />
                  <p className={styles.note}>{stage.cta.note}</p>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
