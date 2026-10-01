import { X } from "lucide-react";
import PreparedBy from "@/components/PreparedBy";
import { PREPARED_BY } from "../data/uflightReferenceAircraft";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

/**
 * Who prepared the experience. The 3D application fills the viewport, so the
 * block that sits at the foot of the overview page is offered here instead.
 */
export default function AboutPanel() {
  const open = useUFlightStore((s) => s.aboutOpen);
  const setAboutOpen = useUFlightStore((s) => s.setAboutOpen);
  if (!open) return null;
  return (
    <div id="uflight-about" className={ui.about} role="dialog" aria-label="About this experience">
      <button type="button" className={ui.closeButton} aria-label="Close" onClick={() => setAboutOpen(false)}>
        <X size={15} aria-hidden="true" />
      </button>
      <p className={ui.panelHeading}>About</p>
      <PreparedBy notes={PREPARED_BY.notes} reviewed={PREPARED_BY.reviewed} reviewedLabel={PREPARED_BY.reviewedLabel} />
    </div>
  );
}
