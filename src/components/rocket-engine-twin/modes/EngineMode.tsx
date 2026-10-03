// ENGINE: the whole engine, and its systems as a short list for anyone not
// using the pointer. Clicking the engine does the same thing.
import { SYSTEMS } from "../data/engineReference";
import { useRocketTwinStore } from "../state/twinStore";
import ui from "../twin3d.module.css";

export function EngineLeft() {
  const system = useRocketTwinStore((s) => s.system);
  const focus = useRocketTwinStore((s) => s.systemFocus);
  const component = useRocketTwinStore((s) => s.component);
  const selectSystem = useRocketTwinStore((s) => s.selectSystem);
  const selectComponent = useRocketTwinStore((s) => s.selectComponent);
  return (
    <nav className={ui.list} aria-label="Engine systems">
      {SYSTEMS.map((s) => {
        const open = focus && system === s.id;
        return (
          <div key={s.id}>
            <button type="button" className={ui.listItem} aria-pressed={open} aria-label={`Explore ${s.label}`} onClick={() => selectSystem(s.id)}>
              {s.name.toUpperCase()}
            </button>
            {open && (
              <ul className={ui.sublist}>
                {s.components.map((c) => (
                  <li key={c.id}>
                    <button type="button" className={ui.subItem} aria-pressed={component === c.id} onClick={() => selectComponent(c.id)}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function EngineDock() {
  const component = useRocketTwinStore((s) => s.component);
  if (component) return null;
  return <p className={ui.hint}>Select a part of the engine · double-click to move in · drag to turn · scroll to zoom</p>;
}
