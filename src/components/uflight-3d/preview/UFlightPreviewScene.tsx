"use client";
// The homepage preview's 3D part, loaded on its own when the card nears the
// screen: one canvas with the application's aircraft scene, the controller
// that walks the shared store through the four stages, and a small readout of
// the store's simulated values. While mounted it borrows the UFlight™ store;
// when it unmounts, the store and the per-frame state go back to a fresh
// visit, so the full application opens exactly as before.
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import type { QualitySettings } from "../../satellite-explorer/lib/capabilities";
import { BEARING_NARRATIVE } from "../data/faultScenarios";
import { AIRCRAFT, STATE_GLYPH, STATE_LABEL, SYSTEMS } from "../data/uflightReferenceAircraft";
import { resetFrameState } from "../scene/frameState";
import { formatRange, formatValue, twinReadout } from "../simulation/twin";
import { resetUFlightSession, useUFlightStore } from "../state/uflightStore";
import UFlightAircraftScene from "./UFlightAircraftScene";
import { UFlightSceneController, previewFit, previewPreset } from "./UFlightSceneController";
import type { StageClock } from "./stages";
import styles from "./preview.module.css";

const SYSTEM_ORDER = ["propulsion", "energy", "avionics", "flightControl"] as const;

/** Hand the store to the preview: a fresh session at the preview's quality. Idempotent. */
function prepare(quality: QualitySettings, reducedMotion: boolean) {
  const s = useUFlightStore.getState();
  if (s.quality === quality && s.reducedMotion === reducedMotion && s.mode === "hero" && !s.started) return;
  resetUFlightSession();
  resetFrameState();
  useUFlightStore.getState().setEnvironment({ quality, reducedMotion });
}

/** Simulated values from the store, in words as well as numbers. */
function Readout() {
  const mode = useUFlightStore((s) => s.mode);
  const system = useUFlightStore((s) => s.selectedSystem);
  const faultStage = useUFlightStore((s) => s.faultStage);
  const telemetry = useUFlightStore((s) => s.telemetry);

  if (mode === "systems" && system) {
    const index = SYSTEM_ORDER.indexOf(system as (typeof SYSTEM_ORDER)[number]);
    return (
      <div className={styles.systemChip}>
        <span>{SYSTEMS[system].name}</span>
        <span className={styles.systemDots} aria-hidden="true">
          {SYSTEM_ORDER.map((id, k) => (
            <i key={id} data-on={k <= index || undefined} />
          ))}
        </span>
      </div>
    );
  }

  if (mode === "fault-lab" || mode === "twin") {
    const r = twinReadout(telemetry.inputs, telemetry.snapshot, "propulsion", 0);
    const unit = r.subject.unit;
    const alert = r.state !== "NOMINAL";
    if (mode === "fault-lab") {
      return (
        <div className={styles.card} data-alert={alert || undefined}>
          <p className={styles.cardHead}>Simulated · Motor 04 front bearing</p>
          <dl className={styles.rows}>
            <div>
              <dt>Vibration</dt>
              <dd>
                {formatValue(r.value, 2)} <span className={styles.unit}>{unit}</span>
              </dd>
            </div>
            <div>
              <dt>Expected</dt>
              <dd>{r.expected ? formatRange(r.expected, 2) : "—"}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd className={styles.state}>
                <span aria-hidden="true">{STATE_GLYPH[r.state]}</span> {STATE_LABEL[r.state]}
              </dd>
            </div>
          </dl>
          <p className={styles.cardNote}>{BEARING_NARRATIVE[faultStage].headline}</p>
        </div>
      );
    }
    return (
      <div className={styles.card} data-alert={alert || undefined}>
        <p className={styles.cardHead}>Digital twin · Motor 04 · Simulated</p>
        <dl className={styles.rows}>
          <div>
            <dt>Observed · sensor</dt>
            <dd>{formatValue(r.value, 2)}</dd>
          </div>
          <div>
            <dt>Expected · reference</dt>
            <dd>{r.expected ? formatRange(r.expected, 2) : "—"}</dd>
          </div>
          {r.estimate && (
            <div>
              <dt>Estimated · model</dt>
              <dd>
                {formatValue(r.estimate.value, r.estimate.places)} <span className={styles.unit}>health index</span>
              </dd>
            </div>
          )}
        </dl>
        <p className={styles.cardNote}>
          {r.projection === "MAINTENANCE ACTION RECOMMENDED" ? `Advisory: inspect the front bearing · ${r.window.toLowerCase()}` : `Residual ${r.residual} · ${r.projection.toLowerCase()}`}
        </p>
        <p className={styles.cardFine}>Illustrative advisory, not a validated prediction.</p>
      </div>
    );
  }

  return (
    <div className={styles.specChip}>
      {AIRCRAFT.code} · {AIRCRAFT.seats} · {AIRCRAFT.reference.propulsionUnits} propulsion units
    </div>
  );
}

interface Props {
  clock: StageClock;
  quality: QualitySettings;
  reducedMotion: boolean;
  onScreen: boolean;
  onReady: () => void;
  onInteract: () => void;
}

export default function UFlightPreviewScene({ clock, quality, reducedMotion, onScreen, onReady, onInteract }: Props) {
  // Prepared before the first render of the scene, so the lights and shadows start at the preview's quality.
  useState(() => prepare(quality, reducedMotion));
  useEffect(() => {
    const before = useUFlightStore.getState();
    const previous = { quality: before.quality, reducedMotion: before.reducedMotion };
    prepare(quality, reducedMotion);
    return () => {
      resetUFlightSession();
      resetFrameState();
      useUFlightStore.getState().setEnvironment(previous);
    };
    // Mount and unmount only: quality is fixed for the visit, and motion preference is followed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    useUFlightStore.getState().setEnvironment({ reducedMotion });
  }, [reducedMotion]);

  const rig = {
    fit: previewFit,
    presetFor: previewPreset,
    // Discover: a slow walk around the aircraft.
    drift: () => (clock.stage === 0 && clock.play !== "paused" ? 0.05 : 0),
    wheelZoom: "modifier" as const,
    panelShift: false,
    onInteract,
  };

  return (
    <>
      <div className={styles.canvas}>
        <Canvas
          frameloop={onScreen ? "always" : "never"}
          dpr={quality.dpr}
          shadows={quality.shadows ? "percentage" : false}
          gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "default" }}
          camera={{ fov: 34, near: 0.1, far: 9000, position: [16, 4, 14] }}
          onCreated={({ gl, setEvents }) => {
            gl.setClearColor("#030405", 1);
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1;
            // Parts are not picked here (the full application does that); the camera rig listens to the canvas itself.
            setEvents({ enabled: false });
          }}
        >
          <UFlightSceneController clock={clock} onReady={onReady} />
          <UFlightAircraftScene rig={rig} />
        </Canvas>
      </div>
      <div className={styles.readout} aria-hidden="true">
        <Readout />
      </div>
    </>
  );
}
