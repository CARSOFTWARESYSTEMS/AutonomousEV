import type { SubsystemId } from "../types";
import { SUBSYSTEMS, SUBSYSTEM_ORDER } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

const TRACK: Partial<Record<SubsystemId, string>> = {
  power: "system_power_open",
  adcs: "system_adcs_open",
};

/** Systems sub-tabs. */
export default function SystemSelector() {
  const subsystem = useExplorerStore((s) => s.subsystem);
  const setSubsystem = useExplorerStore((s) => s.setSubsystem);
  return (
    <div className={ui.tabs} role="tablist" aria-label="Spacecraft systems">
      {SUBSYSTEM_ORDER.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          id={`system-tab-${id}`}
          aria-selected={subsystem === id}
          aria-controls="system-panel"
          tabIndex={subsystem === id ? 0 : -1}
          className={ui.tab}
          style={{ "--accent": SUBSYSTEMS[id].accent } as React.CSSProperties}
          data-track-event={TRACK[id]}
          data-track-source={TRACK[id] ? "systems_mode" : undefined}
          onClick={() => setSubsystem(id)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            const index = SUBSYSTEM_ORDER.indexOf(id);
            const next = SUBSYSTEM_ORDER[(index + (e.key === "ArrowRight" ? 1 : -1) + SUBSYSTEM_ORDER.length) % SUBSYSTEM_ORDER.length];
            setSubsystem(next);
            document.getElementById(`system-tab-${next}`)?.focus();
          }}
        >
          {SUBSYSTEMS[id].label}
        </button>
      ))}
    </div>
  );
}
