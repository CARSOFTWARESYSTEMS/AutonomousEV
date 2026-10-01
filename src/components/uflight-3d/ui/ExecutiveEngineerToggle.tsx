import { AUDIENCE_MODES } from "../data/uflightReferenceAircraft";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

/** How much signal-level detail the panels show. */
export default function ExecutiveEngineerToggle() {
  const audienceMode = useUFlightStore((s) => s.audienceMode);
  const setAudienceMode = useUFlightStore((s) => s.setAudienceMode);
  return (
    <div className={ui.segmented} role="group" aria-label="Level of detail">
      {AUDIENCE_MODES.map(({ id, label }) => (
        <button key={id} type="button" className={ui.segment} aria-pressed={audienceMode === id} onClick={() => setAudienceMode(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}
