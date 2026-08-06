"use client";

import { useMemo, useState } from "react";
import { AIRCRAFT_PROFILES } from "@/lib/battery-cybersecurity/data/aircraftProfiles";
import { COMPONENTS } from "@/lib/battery-cybersecurity/data/components";
import { ENTRY_POINTS } from "@/lib/battery-cybersecurity/data/entryPoints";
import { FLIGHT_PHASES } from "@/lib/battery-cybersecurity/data/flightPhases";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { SCENARIO_PRESETS } from "@/lib/battery-cybersecurity/data/scenarioPresets";
import { runThreatModel } from "@/lib/battery-cybersecurity/studioEngine";
import type { StudioDataset, StudioInput } from "@/lib/battery-cybersecurity/types";
import { SectionHeader } from "../../SectionHeader";
import pageStyles from "../../page.module.css";
import styles from "./ThreatModellingStudio.module.css";
import { StudioResultsPanel } from "./StudioResultsPanel";
import { StudioExportControls } from "./StudioExportControls";

const DATASET: StudioDataset = {
  aircraftProfiles: AIRCRAFT_PROFILES,
  components: COMPONENTS,
  entryPoints: ENTRY_POINTS,
  threats: THREAT_CATALOGUE,
  flightPhases: FLIGHT_PHASES,
  detectionControls: DETECTION_CONTROLS,
};

const firstPreset = SCENARIO_PRESETS[0];

function buildInputFromPreset(preset: (typeof SCENARIO_PRESETS)[number]): StudioInput {
  return {
    aircraftProfileId: preset.aircraftProfileId,
    componentId: preset.componentId,
    entryPointId: preset.entryPointId,
    threatId: preset.threatId,
    flightPhaseId: preset.flightPhaseId,
  };
}

export function ThreatModellingStudio() {
  const [input, setInput] = useState<StudioInput>(buildInputFromPreset(firstPreset));
  const [activePresetId, setActivePresetId] = useState<string | null>(firstPreset.id);

  const profile = AIRCRAFT_PROFILES.find((p) => p.id === input.aircraftProfileId) ?? AIRCRAFT_PROFILES[0];
  const componentOptions = COMPONENTS.filter((c) => profile.componentIds.includes(c.id));
  const entryPointOptions = ENTRY_POINTS.filter((e) => e.reachableComponentIds.includes(input.componentId));
  const threatOptions = THREAT_CATALOGUE.filter(
    (t) => t.affectedComponentIds.includes(input.componentId) && t.affectedEntryPointIds.includes(input.entryPointId)
  );

  const result = useMemo(() => runThreatModel(input, DATASET), [input]);

  function selectPreset(presetId: string) {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setInput(buildInputFromPreset(preset));
  }

  function handleProfileChange(aircraftProfileId: string) {
    const nextProfile = AIRCRAFT_PROFILES.find((p) => p.id === aircraftProfileId)!;
    const nextComponents = COMPONENTS.filter((c) => nextProfile.componentIds.includes(c.id));
    const componentId = nextComponents[0]?.id ?? "";
    const nextEntryPoints = ENTRY_POINTS.filter((e) => e.reachableComponentIds.includes(componentId));
    const entryPointId = nextEntryPoints[0]?.id ?? "";
    const nextThreats = THREAT_CATALOGUE.filter(
      (t) => t.affectedComponentIds.includes(componentId) && t.affectedEntryPointIds.includes(entryPointId)
    );
    const threatId = nextThreats[0]?.id ?? "";
    setActivePresetId(null);
    setInput({ aircraftProfileId, componentId, entryPointId, threatId, flightPhaseId: nextProfile.defaultFlightPhaseId });
  }

  function handleComponentChange(componentId: string) {
    const nextEntryPoints = ENTRY_POINTS.filter((e) => e.reachableComponentIds.includes(componentId));
    const entryPointId = nextEntryPoints.some((e) => e.id === input.entryPointId) ? input.entryPointId : nextEntryPoints[0]?.id ?? "";
    const nextThreats = THREAT_CATALOGUE.filter(
      (t) => t.affectedComponentIds.includes(componentId) && t.affectedEntryPointIds.includes(entryPointId)
    );
    const threatId = nextThreats.some((t) => t.id === input.threatId) ? input.threatId : nextThreats[0]?.id ?? "";
    setActivePresetId(null);
    setInput((prev) => ({ ...prev, componentId, entryPointId, threatId }));
  }

  function handleEntryPointChange(entryPointId: string) {
    const nextThreats = THREAT_CATALOGUE.filter(
      (t) => t.affectedComponentIds.includes(input.componentId) && t.affectedEntryPointIds.includes(entryPointId)
    );
    const threatId = nextThreats.some((t) => t.id === input.threatId) ? input.threatId : nextThreats[0]?.id ?? "";
    setActivePresetId(null);
    setInput((prev) => ({ ...prev, entryPointId, threatId }));
  }

  function handleThreatChange(threatId: string) {
    setActivePresetId(null);
    setInput((prev) => ({ ...prev, threatId }));
  }

  function handleFlightPhaseChange(flightPhaseId: string) {
    setActivePresetId(null);
    setInput((prev) => ({ ...prev, flightPhaseId }));
  }

  return (
    <section className="section bg-surface" id="threat-modelling-studio" aria-labelledby="studio-heading">
      <div className="container">
        <SectionHeader label="Interactive Threat-Modelling Studio" title="Build and Walk a Threat Scenario" headingId="studio-heading">
          <p>
            Fully deterministic and local to your browser — no account, no server call, no AI. Choose an aircraft
            profile, component, entry point, threat, and flight phase (or load a preset), then review the
            propagation, consequence, and recommended controls.
          </p>
        </SectionHeader>

        <div className={pageStyles.navyPanel} style={{ padding: "16px 20px", marginBottom: "28px" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-amber)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
            Scenario Presets
          </p>
          <div className={styles.presetRow}>
            {SCENARIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={activePresetId === preset.id ? styles.presetActive : styles.preset}
                onClick={() => selectPreset(preset.id)}
                aria-pressed={activePresetId === preset.id}
                data-track-event="bcs_studio_preset_selected"
                data-track-preset={preset.id}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={`${pageStyles.navyPanel} ${styles.controls}`} style={{ padding: "24px" }}>
            <div className={styles.field}>
              <label htmlFor="studio-profile">Aircraft Profile</label>
              <select id="studio-profile" value={input.aircraftProfileId} onChange={(e) => handleProfileChange(e.target.value)}>
                {AIRCRAFT_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="studio-component">System Component</label>
              <select id="studio-component" value={input.componentId} onChange={(e) => handleComponentChange(e.target.value)}>
                {componentOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="studio-entry-point">Attack Entry Point</label>
              <select id="studio-entry-point" value={input.entryPointId} onChange={(e) => handleEntryPointChange(e.target.value)}>
                {entryPointOptions.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="studio-threat">Threat</label>
              <select id="studio-threat" value={input.threatId} onChange={(e) => handleThreatChange(e.target.value)}>
                {threatOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="studio-flight-phase">Flight Phase</label>
              <select id="studio-flight-phase" value={input.flightPhaseId} onChange={(e) => handleFlightPhaseChange(e.target.value)}>
                {FLIGHT_PHASES.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "8px" }}>
              <StudioExportControls result={result} />
            </div>
          </div>

          <div className={`${pageStyles.navyPanel} ${styles.results}`} style={{ padding: "24px" }}>
            <StudioResultsPanel result={result} />
          </div>
        </div>
      </div>
    </section>
  );
}
