import { ArrowRight, Play } from "lucide-react";
import { DISCLAIMER, PRODUCT } from "../data/uflightReferenceAircraft";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

/**
 * Opening screen laid over the live scene. Entering does not cut: the copy
 * fades while the aircraft powers on and the camera settles.
 */
export default function HeroOverlay() {
  const started = useUFlightStore((s) => s.started);
  const start = useUFlightStore((s) => s.start);
  const runHealthDemo = useUFlightStore((s) => s.runHealthDemo);

  return (
    <div className={ui.hero} data-hidden={started} aria-hidden={started || undefined} inert={started}>
      <div className={ui.heroCopy}>
        {/* The page heading is the H1 in the header; this setting of the name is presentational. */}
        <p className={ui.heroWordmark} aria-hidden="true">
          {PRODUCT.wordmark}
        </p>
        <p className={ui.heroTagline}>{PRODUCT.tagline}</p>
        <p className={ui.heroHeadline}>
          {PRODUCT.headlineLines[0]}
          <br />
          {PRODUCT.headlineLines[1]}
        </p>
        <p className={ui.heroPlatform}>{PRODUCT.platform}</p>
        <div className={ui.heroActions}>
          <button type="button" className={ui.primaryButton} data-track-event="uflight_3d_launch" data-track-source="uflight_hero" onClick={start}>
            {PRODUCT.enterLabel} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" className={ui.ghostButton} data-track-event="uflight_3d_health_demo" data-track-source="uflight_hero" onClick={runHealthDemo}>
            <Play size={14} aria-hidden="true" /> {PRODUCT.demoLabel}
          </button>
        </div>
        <p className={ui.heroNote}>{DISCLAIMER}</p>
      </div>
    </div>
  );
}
