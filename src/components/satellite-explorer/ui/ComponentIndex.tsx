import { X } from "lucide-react";
import { componentsOf, distinctName } from "../data/componentDefinitions";
import { SUBSYSTEMS, SUBSYSTEM_ORDER } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/**
 * Every selectable component as a keyboard-reachable list, grouped by
 * subsystem. The 3D scene can only be picked with a pointer; this is the
 * equivalent route for keyboard and assistive-technology users.
 */
export default function ComponentIndex() {
  const open = useExplorerStore((s) => s.indexOpen);
  const selected = useExplorerStore((s) => s.selectedComponent);
  const mode = useExplorerStore((s) => s.mode);
  const setIndexOpen = useExplorerStore((s) => s.setIndexOpen);
  const setMode = useExplorerStore((s) => s.setMode);
  const select = useExplorerStore((s) => s.selectComponent);
  if (!open) return null;

  const choose = (id: Parameters<typeof select>[0]) => {
    // Orbit and Build views are not about single parts; show the part in Explore instead.
    if (mode === "orbit" || mode === "build" || mode === "hero") setMode("explore");
    select(id);
  };

  return (
    <div id="explorer-index" className={ui.index} role="dialog" aria-label="Spacecraft components">
      <div className={ui.popoverHead}>
        <p className={ui.popoverTitle}>COMPONENTS</p>
        <button type="button" className={ui.closeButton} aria-label="Close component list" onClick={() => setIndexOpen(false)}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <div className={ui.indexGroups}>
        {SUBSYSTEM_ORDER.map((subsystemId) => (
          <section key={subsystemId} aria-labelledby={`index-${subsystemId}`}>
            <h2 id={`index-${subsystemId}`} className={ui.indexHeading} style={{ "--accent": SUBSYSTEMS[subsystemId].accent } as React.CSSProperties}>
              <span className={ui.accentDot} aria-hidden="true" />
              {SUBSYSTEMS[subsystemId].label}
            </h2>
            <ul className={ui.indexList}>
              {componentsOf(subsystemId).map((id) => (
                <li key={id}>
                  <button type="button" className={ui.indexItem} aria-current={selected === id ? "true" : undefined} onClick={() => choose(id)}>
                    {distinctName(id)}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
