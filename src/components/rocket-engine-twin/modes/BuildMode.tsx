// BUILD: take the engine apart, or open it. Exploding separates assemblies
// along the lines they are built on; cutting away leaves the engine assembled
// and shows what is inside. The two are separate controls.
import { CUTAWAYS } from "../data/engineReference";
import { useRocketTwinStore } from "../state/twinStore";
import { Action } from "../ui/panels";
import ui from "../twin3d.module.css";

export function BuildDock() {
  const engineOpen = useRocketTwinStore((s) => s.engineOpen);
  const amount = useRocketTwinStore((s) => s.explodedAmount);
  const cutaway = useRocketTwinStore((s) => s.cutaway);
  const store = useRocketTwinStore.getState();
  return (
    <div className={ui.controls}>
      <Action primary pressed={engineOpen} label="Open engine: separate its systems and cut them open" onClick={store.toggleEngineOpen}>
        OPEN ENGINE
      </Action>
      <label className={ui.slider}>
        <span>ASSEMBLED</span>
        <input type="range" min={0} max={100} step={1} value={Math.round(amount * 100)} aria-label="Exploded view, from 0 assembled to 100 exploded" onChange={(event) => store.setExplodedAmount(Number(event.target.value) / 100)} />
        <span>EXPLODED</span>
      </label>
      <div className={ui.group} role="group" aria-label="Cutaway">
        <span className={ui.groupLabel}>CUTAWAY</span>
        <Action pressed={cutaway !== null} label={cutaway ? "Cutaway on: turn off" : "Cutaway off: turn on"} onClick={() => store.toggleCutaway(cutaway ?? "all")}>
          {cutaway ? "ON" : "OFF"}
        </Action>
        {CUTAWAYS.map((c) => (
          <Action key={c.system} pressed={cutaway === c.system} label={c.ariaLabel} onClick={() => store.toggleCutaway(c.system)}>
            {c.label.toUpperCase()}
          </Action>
        ))}
      </div>
    </div>
  );
}
