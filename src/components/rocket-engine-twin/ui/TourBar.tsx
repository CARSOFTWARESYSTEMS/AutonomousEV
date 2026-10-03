// The Guided Engine Tour's only interface: where it is, one line about what
// is on screen, and four controls. The camera and the engine do the teaching.
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { TOUR_STAGES } from "../data/twinContent";
import { useRocketTwinStore } from "../state/twinStore";
import ui from "../twin3d.module.css";

const two = (n: number) => String(n).padStart(2, "0");

export function TourBar() {
  const tour = useRocketTwinStore((s) => s.tour);
  const store = useRocketTwinStore.getState();
  if (!tour) return null;
  const stage = TOUR_STAGES[tour.stage];
  return (
    <section className={ui.tour} aria-label="Guided engine tour">
      <p className={ui.tourProgress} aria-label={`Stage ${tour.stage + 1} of ${TOUR_STAGES.length}`}>
        {two(tour.stage + 1)} / {two(TOUR_STAGES.length)}
      </p>
      <div className={ui.tourText} role="status">
        <p className={ui.tourTitle}>{stage.title}</p>
        <p className={ui.tourCaption}>{stage.caption}</p>
      </div>
      <div className={ui.tourControls}>
        <button type="button" disabled={tour.stage === 0} onClick={() => store.setTourStage(tour.stage - 1)}>
          <ChevronLeft size={14} aria-hidden="true" /> BACK
        </button>
        <button type="button" aria-pressed={tour.paused} onClick={store.toggleTourPause}>
          {tour.paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />} {tour.paused ? "RESUME" : "PAUSE"}
        </button>
        <button type="button" onClick={() => store.setTourStage(tour.stage + 1)}>
          NEXT <ChevronRight size={14} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => store.exitTour(false)}>
          <X size={13} aria-hidden="true" /> EXIT TOUR
        </button>
      </div>
    </section>
  );
}
