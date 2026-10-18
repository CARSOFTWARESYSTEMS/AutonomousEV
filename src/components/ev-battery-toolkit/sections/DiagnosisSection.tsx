"use client";
// Technician Diagnostic Workflow: Real Vehicle Diagnosis is the primary
// workflow; the guided simulation is secondary. Owner Mode sees neither.
import { useState } from "react";
import { HardHat } from "lucide-react";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { useToolkit } from "../state/store";
import GuidedCase from "../technician/GuidedCase";
import RealDiagnosis from "../technician/RealDiagnosis";
import css from "../diagnosis.module.css";

export default function DiagnosisSection() {
  const audience = useToolkit((s) => s.audience);
  const setAudience = useToolkit((s) => s.setAudience);
  const [tab, setTab] = useState<"real" | "guided">("real");

  if (audience === "owner") {
    return (
      <div className={css.ownerGate}>
        <HardHat size={22} aria-hidden="true" />
        <div>
          <p>
            <strong>This workflow is for trained technicians.</strong> It covers measurements and repair decisions on the battery. As an owner, use Owner Mode above and book a professional inspection.
          </p>
          <button
            type="button"
            className={css.secondary}
            onClick={() => {
              setAudience("technician");
              trackToolkit("technician_mode_selected");
            }}
          >
            I am a technician — switch to Technician Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={css.tabs} role="tablist" aria-label="Diagnostic workflow">
        <button type="button" role="tab" id="tab-real" aria-selected={tab === "real"} aria-controls="panel-real" className={css.tab} onClick={() => setTab("real")}>
          Real Vehicle Diagnosis <span className={css.tabNote}>Primary</span>
        </button>
        <button type="button" role="tab" id="tab-guided" aria-selected={tab === "guided"} aria-controls="panel-guided" className={css.tab} onClick={() => setTab("guided")}>
          Guided Simulation <span className={css.tabNote}>Training</span>
        </button>
      </div>
      {/* Both stay mounted so switching tabs never discards a real job card in progress.
          They share no state: the real job lives in RealDiagnosis, the guided case in GuidedCase. */}
      <div id="panel-real" role="tabpanel" aria-labelledby="tab-real" hidden={tab !== "real"}>
        <RealDiagnosis />
      </div>
      <div id="panel-guided" role="tabpanel" aria-labelledby="tab-guided" hidden={tab !== "guided"}>
        <GuidedCase />
      </div>
    </div>
  );
}
