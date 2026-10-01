import { ArrowRight, Play } from "lucide-react";
import { PRODUCT, SATELLITE_REFERENCE } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/**
 * Entry screen laid over the live scene. Starting does not cut: the overlay
 * fades while the camera glides in to the spacecraft.
 */
export default function HeroOverlay() {
  const started = useExplorerStore((s) => s.started);
  const start = useExplorerStore((s) => s.start);
  const startTour = useExplorerStore((s) => s.startTour);

  return (
    <div className={ui.hero} data-hidden={started} aria-hidden={started || undefined} inert={started}>
      <div className={ui.heroCopy}>
        <p className={ui.heroEyebrow}>{PRODUCT.tagline}</p>
        {/* The page heading is the H1 in the header; this large setting of it is presentational. */}
        <p className={ui.heroTitle} aria-hidden="true">
          {PRODUCT.name}
        </p>
        <p className={ui.heroSubtitle}>{PRODUCT.subtitle}</p>
        <p className={ui.heroMission}>{SATELLITE_REFERENCE.missionLine}</p>
        <div className={ui.heroActions}>
          <button type="button" className={ui.primaryButton} data-track-event="satellite_3d_launch" data-track-source="explorer_hero" onClick={start}>
            START EXPLORATION <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" className={ui.ghostButton} data-track-event="guided_tour_start" data-track-source="explorer_hero" onClick={startTour}>
            <Play size={14} aria-hidden="true" /> GUIDED TOUR
          </button>
        </div>
        <p className={ui.heroNote}>{SATELLITE_REFERENCE.provenance.spacecraft} · Earth imagery: NASA Visible Earth</p>
      </div>
    </div>
  );
}
