"use client";
// The magnetic-field legend and its display controls, for the station's field
// section (WPT-EM-002) and the road's (WPT-EM-005). Scale, section, phase and
// the overlays change how the field is drawn, never what is computed. Values
// are read from what the 3D view last computed.
import { useCallback } from "react";
import { PHASES } from "@/lib/wireless-charging/stateMachine";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { FIELD_GRADIENT, fieldScale } from "../three/fieldScale";
import { roadFieldInfo, stationFieldInfo } from "../three/road/fieldInfo";
import { fmt } from "../ui/controls";
import lab from "./lab.module.css";

const tesla = (b: number) => (b >= 1e-3 ? `${fmt(b * 1e3, b >= 1e-2 ? 1 : 2)} mT` : `${fmt(b * 1e6, 0)} µT`);

export function FieldLegend({ env }: { env: "station" | "dynamic" }) {
  const fd = useTwin((s) => s.fieldDisplay);
  const set = useTwin((s) => s.setFieldDisplay);
  const phase = useTwin((s) => s.fieldPhase);
  const mode = useTwin((s) => s.mode);
  const read = useCallback(() => {
    if (env === "dynamic") {
      const i = roadFieldInfo;
      return { on: i.ready && i.active > 0, ready: i.ready, centre: i.atReceiver, full: i.full, max: i.max, active: i.active, segment: i.segment, theta: i.theta, phase: "" };
    }
    const st = runtime.station.state;
    const on = Boolean(st.point.ss);
    return { on, ready: true, centre: st.fieldCentre, full: stationFieldInfo.full, max: stationFieldInfo.max, active: on ? 1 : 0, segment: -1, theta: phase, phase: PHASES[st.phase].label };
  }, [env, phase]);
  const v = useSampled(read, 6);
  const deep = mode === "engineer" || mode === "research";
  return (
    <div className={lab.fieldLegend} aria-label="Magnetic field legend and display">
      <p className={lab.legendEyebrow}>{env === "dynamic" ? "Road field · section through the receiver centre" : "Field · section through both pad centres"}</p>
      <div className={lab.legendHero}>
        <span className={lab.legendValue}>{v.ready ? (v.on ? tesla(env === "dynamic" ? v.max : v.centre) : "0 µT") : "…"}</span>
        <span className={lab.legendUnit}>{env === "dynamic" ? "Peak RMS in the section" : "RMS at mid-gap"}</span>
      </div>
      <span className={lab.legendBar} style={{ background: FIELD_GRADIENT }} aria-hidden="true" />
      <p className={lab.legendTicks}>
        {fd.scale === "log" ? (
          <>
            <span>{tesla(fieldScale.min)}</span>
            <span>100 µT</span>
            <span>{tesla(fieldScale.max)}</span>
          </>
        ) : (
          <>
            <span>0</span>
            <span>{tesla(v.full / 2)}</span>
            <span>{tesla(v.full)}</span>
          </>
        )}
      </p>
      <p className={lab.legendNote}>
        {!v.ready
          ? "Building the field basis for this geometry…"
          : !v.on
            ? env === "dynamic"
              ? "No pad energised near the receiver: no field. De-energised and failed pads contribute nothing."
              : `Pad de-energised (${v.phase}): no field.`
            : env === "dynamic"
              ? `${v.active} energised pad${v.active === 1 ? "" : "s"} contributing${v.segment >= 0 ? ` · section fixed at pad ${v.segment + 1}` : ""}. Lines: in-plane field at ωt = ${Math.round(((v.theta % (2 * Math.PI)) * 180) / Math.PI)}°.`
              : `Lines: field at ωt = ${Math.round((phase * 180) / Math.PI)}° of the 85 kHz cycle.`}
      </p>
      <div className={lab.legendControls}>
        <div className={lab.seg} role="radiogroup" aria-label="Field scale">
          {(["log", "linear"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={fd.scale === m} onClick={() => set({ scale: m })}>
              {m === "log" ? "Log" : "Linear"}
            </button>
          ))}
        </div>
        {env === "dynamic" && (
          <div className={lab.seg} role="radiogroup" aria-label="Section">
            {(["receiver", "segment"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={fd.section === m} onClick={() => set({ section: m, segment: null })}>
                {m === "receiver" ? "Follow receiver" : "Fix at next pad"}
              </button>
            ))}
          </div>
        )}
        <div className={lab.toggles}>
          {(
            [
              ["lines", "Lines"],
              ["contours", "Contours"],
              ...(env === "dynamic" ? ([["vectors", "Vectors"]] as const) : []),
              ...(env === "dynamic" ? ([["sweep", "Sweep phase"]] as const) : []),
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={fd[k]} onClick={() => set({ [k]: !fd[k] })}>
              {label}
            </button>
          ))}
        </div>
        {deep && !fd.sweep && (
          <label className={lab.phase}>
            <span>Phase ωt</span>
            <input type="range" min={0} max={359} step={1} value={Math.round((phase * 180) / Math.PI)} onChange={(e) => useTwin.setState({ fieldPhase: (Number(e.target.value) * Math.PI) / 180 })} aria-label="Field-line phase, degrees" />
            <output>{`${Math.round((phase * 180) / Math.PI)}°`}</output>
          </label>
        )}
      </div>
      <p className={lab.legendFoot}>
        {env === "dynamic" ? "WPT-EM-005 · analytical filament model with ferrite images (F1), not FEM. Assumes one phase reference for all pads and a resonant receiver. " : "WPT-EM-002 · analytical filament model (F1), not FEM. "}
        {fd.sweep ? "Phase sweep slowed about 10⁵× — a visual cue, not the 85 kHz waveform." : "Line animation is a visual cue."}
      </p>
    </div>
  );
}

