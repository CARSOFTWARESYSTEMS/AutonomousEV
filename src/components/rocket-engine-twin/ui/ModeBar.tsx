// The application's navigation: eight modes in one compact bar, and the
// Learn / Engineer switch. Changing either never reloads the scene.
import type { KeyboardEvent } from "react";
import { AUDIENCE_MODES, MODES } from "../data/engineReference";
import { useRocketTwinStore } from "../state/twinStore";
import ui from "../twin3d.module.css";

export function ModeBar() {
  const mode = useRocketTwinStore((s) => s.mode);
  const setMode = useRocketTwinStore((s) => s.setMode);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = MODES.findIndex((m) => m.id === mode);
    const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? MODES.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const target = MODES[(next + MODES.length) % MODES.length];
    setMode(target.id);
    document.getElementById(`twin-mode-${target.id}`)?.focus();
  };
  return (
    <div className={ui.modes} role="tablist" aria-label="Digital twin modes">
      {MODES.map((m) => (
        <button key={m.id} id={`twin-mode-${m.id}`} type="button" role="tab" className={ui.mode} aria-selected={mode === m.id} aria-label={m.ariaLabel} tabIndex={mode === m.id ? 0 : -1} onClick={() => setMode(m.id)} onKeyDown={onKey}>
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function AudienceToggle() {
  const audience = useRocketTwinStore((s) => s.audience);
  const setAudience = useRocketTwinStore((s) => s.setAudience);
  return (
    <div className={ui.audience} role="group" aria-label="Level of detail">
      {AUDIENCE_MODES.map((a) => (
        <button key={a.id} type="button" aria-pressed={audience === a.id} aria-label={a.ariaLabel} onClick={() => setAudience(a.id)}>
          {a.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
