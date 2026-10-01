import { Expand, ScanSearch } from "lucide-react";
import { trackEvent } from "@/utils/analytics";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/** Explore controls: exploded view (button and scrubber) and X-ray. */
export default function ExploreMode() {
  const exploded = useExplorerStore((s) => s.explodedAmount);
  const xray = useExplorerStore((s) => s.xrayEnabled);
  const setExploded = useExplorerStore((s) => s.setExploded);
  const toggleExploded = useExplorerStore((s) => s.toggleExploded);
  const toggleXray = useExplorerStore((s) => s.toggleXray);
  const percent = Math.round(exploded * 100);

  // The same button closes the view, so the "open" event is sent here rather than by attribute.
  const onToggle = () => {
    if (exploded <= 0.5) trackEvent("exploded_view_open", { source: "explore_mode", label: "EXPLODE" });
    toggleExploded();
  };

  return (
    <div className={ui.controlStrip} data-testid="explore-controls">
      <button type="button" className={ui.action} aria-pressed={exploded > 0.5} onClick={onToggle}>
        <Expand size={14} aria-hidden="true" /> {exploded > 0.5 ? "ASSEMBLE" : "EXPLODE"}
      </button>
      <label className={ui.sliderField}>
        <span className={ui.sliderLabel}>EXPLODED</span>
        <span className={ui.sliderEnd} aria-hidden="true">
          0
        </span>
        <input
          className={ui.slider}
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          aria-valuetext={`${percent} percent exploded`}
          onChange={(e) => setExploded(Number(e.target.value) / 100)}
          style={{ "--fill": `${percent}%` } as React.CSSProperties}
        />
        <span className={ui.sliderEnd} aria-hidden="true">
          100
        </span>
      </label>
      <button type="button" className={ui.action} aria-pressed={xray} aria-keyshortcuts="X" onClick={toggleXray}>
        <ScanSearch size={14} aria-hidden="true" /> X-RAY
      </button>
    </div>
  );
}
