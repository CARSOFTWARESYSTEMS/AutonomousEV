"use client";
// The propulsion system, explored subsystem by subsystem on the schematic. On
// a desktop with WebGL the same system can be opened in 3D; that application is
// a separate chunk, fetched only when it is asked for.
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { Box, Monitor } from "lucide-react";
import { DESKTOP_QUERY, getWebGLSupport } from "../../satellite-explorer/lib/capabilities";
import { trackAdvancedTwin } from "../analytics";
import { MOBILE_NOTE } from "../data/product";
import { DESKTOP_3D, SUBSYSTEMS, SUBSYSTEM_BY_ID } from "../data/system";
import type { SubsystemId } from "../types";
import PropulsionSchematic from "../ui/PropulsionSchematic";
import { Rows } from "../ui/primitives";
import css from "../advancedTwin.module.css";

const Engine3D = dynamic(() => import("../three/Engine3D"), {
  ssr: false,
  loading: () => (
    <p className={css.loading} role="status">
      Initialising the 3D engineering view…
    </p>
  ),
});

function subscribe(notify: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}
/** WebGL is only probed on a desktop-sized viewport, so phones never create a context. */
const canRun3D = () => window.matchMedia(DESKTOP_QUERY).matches && getWebGLSupport().supported;

export default function SystemExplorer() {
  const [focus, setFocus] = useState<SubsystemId | null>(null);
  const [in3D, setIn3D] = useState(false);
  const capable = useSyncExternalStore(subscribe, canRun3D, () => false);
  const subsystem = focus ? SUBSYSTEM_BY_ID[focus] : null;

  const enter = () => {
    setIn3D(true);
    trackAdvancedTwin("desktop_3d_entered");
  };

  return (
    <div className={css.explorer}>
      <div className={css.stage}>
        <ul className={css.stageTags} aria-label="Model status">
          <li>REFERENCE MODEL</li>
          <li>NOT TO SCALE</li>
        </ul>
        {in3D && capable ? <Engine3D onClose={() => setIn3D(false)} /> : <PropulsionSchematic className={css.schematic} focus={focus} onSelectSubsystem={setFocus} flowClassName={css.flowing} showSensors={focus === null || focus === "instrumentation"} />}
        {!in3D && (
          <p className={css.stageCaption} role="status">
            {subsystem ? `${subsystem.name}: the rest of the system is dimmed.` : "The complete system. Choose a subsystem to bring it forward."}
          </p>
        )}
      </div>

      <div className={css.explorerSide}>
        <div className={css.options} role="group" aria-label="Subsystems">
          <button type="button" className={css.option} aria-pressed={focus === null} onClick={() => setFocus(null)}>
            Whole system
          </button>
          {SUBSYSTEMS.map((s) => (
            <button key={s.id} type="button" className={css.option} aria-pressed={focus === s.id} onClick={() => setFocus(s.id)}>
              {s.name}
            </button>
          ))}
        </div>

        {subsystem ? (
          <div className={css.detail}>
            <p className={css.detailTitle}>{subsystem.name}</p>
            <p>{subsystem.role}</p>
            <Rows
              rows={[
                { label: "Contains", value: subsystem.elements.join(" · ") },
                { label: "Measured", value: subsystem.measured.join(" · ") },
                { label: "Hidden states", value: subsystem.hidden.join(" · ") },
                { label: "In the twin", value: subsystem.twin },
              ]}
            />
          </div>
        ) : (
          <p className={css.hint}>Each subsystem is described below. Selecting one here highlights it on the schematic and summarises what the twin measures and infers there.</p>
        )}

        <div className={css.threeEntry}>
          <p className={css.detailTitle}>
            <Box size={14} aria-hidden="true" /> {DESKTOP_3D.heading}
          </p>
          {capable ? (
            <>
              <p>{DESKTOP_3D.intro}</p>
              <button type="button" className={in3D ? css.ghost : css.primary} onClick={in3D ? () => setIn3D(false) : enter}>
                {in3D ? "Return to the schematic" : DESKTOP_3D.enter}
              </button>
            </>
          ) : (
            <aside className={css.screenNote} aria-label="Desktop recommendation">
              <p className={css.screenNoteBadge}>
                <Monitor size={13} aria-hidden="true" /> {MOBILE_NOTE.badge}
              </p>
              <p>{MOBILE_NOTE.body}</p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
