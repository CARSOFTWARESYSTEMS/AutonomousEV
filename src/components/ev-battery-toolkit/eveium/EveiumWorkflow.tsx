"use client";
// EVeium real-vehicle workflow: choose Cosmo, Comet or Czar, see what is
// publicly documented (and what is not), then run the real diagnosis locked
// to EVeium. Analytics use eveium_* events with ids only.
import { useState } from "react";
import { EVEIUM_DATA_QUALITY, EVEIUM_VEHICLES } from "@/data/ev-battery-toolkit/eveium";
import { toId, trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import PublishedSpec from "../technician/PublishedSpec";
import RealDiagnosis, { type RealTracker } from "../technician/RealDiagnosis";
import { Pill } from "../ui/Badges";
import css from "../diagnosis.module.css";

export const eveiumTracker: RealTracker = (event, id) => {
  const ref = toId(id ?? "none") || "none";
  switch (event) {
    case "started":
      return trackToolkit("eveium_real_diagnosis_started");
    case "safety_completed":
      return trackToolkit("eveium_safety_screen_completed", { result: ref });
    case "measurement_entered":
      return trackToolkit("eveium_measurement_entered", { field: ref });
    case "bms_entered":
      return trackToolkit("eveium_bms_data_entered", { field: ref });
    case "candidate_opened":
      return trackToolkit("eveium_fault_candidate_opened", { candidate: ref });
    case "gate_failed":
      return trackToolkit("eveium_evidence_gate_failed", { candidate: ref });
    case "root_cause_selected":
      return trackToolkit("eveium_root_cause_selected", { candidate: ref });
    case "decision_completed":
      return trackToolkit("eveium_repair_decision_completed", { status: ref });
    case "report_generated":
      return trackToolkit("eveium_report_generated");
  }
};

export default function EveiumWorkflow() {
  const [modelId, setModelId] = useState<string | null>(null);
  const vehicle = EVEIUM_VEHICLES.find((v) => v.id === modelId) ?? null;

  return (
    <div className={css.eveium}>
      <fieldset className={css.modelPicker}>
        <legend>EVeium model</legend>
        {EVEIUM_VEHICLES.map((v) => (
          <label key={v.id} className={css.modelOption} data-selected={modelId === v.id ? "" : undefined}>
            <input
              type="radio"
              name="eveium-model"
              checked={modelId === v.id}
              onChange={() => {
                setModelId(v.id);
                trackToolkit("eveium_model_selected", { model: toId(v.model) });
              }}
            />
            <span>{v.model}</span>
          </label>
        ))}
        <p className={css.note}>Variant: Not specified · Model year: entered by the technician.</p>
      </fieldset>

      {vehicle ? (
        <div className={css.eveiumSummary}>
          <p className={css.dataQuality}>
            Data quality <Pill family="warning">{EVEIUM_DATA_QUALITY}</Pill>
          </p>
          <PublishedSpec spec={vehicle.variants[0].battery} title={`Vehicle: EVeium ${vehicle.model} · published battery specification`} />
        </div>
      ) : (
        <p className={css.note}>Select the EVeium model on the workshop floor. The diagnosis below works without one, but the published specification helps.</p>
      )}

      <RealDiagnosis lockManufacturer="EVeium" presetVehicleId={modelId} track={eveiumTracker} intro={<p>EVeium {vehicle ? vehicle.model : "Cosmo / Comet / Czar"}: battery and battery-related interfaces only, not whole-vehicle servicing.</p>} />
    </div>
  );
}
